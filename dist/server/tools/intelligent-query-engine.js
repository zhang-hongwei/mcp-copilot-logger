"use strict";
/**
 * 智能查询引擎 - 支持语义检索和上下文增强
 */
Object.defineProperty(exports, "__esModule", { value: true });
const database_manager_1 = require("../database/database-manager");
class IntelligentQueryEngine {
    constructor(dbManager) {
        this.embeddingCache = new Map();
        this.dbManager = dbManager || new database_manager_1.DatabaseManager();
    }
    /**
     * 智能查询入口 - 支持多种查询模式
     */
    async query(options) {
        // 确保数据库已初始化
        if (!this.dbManager['isInitialized']) {
            await this.dbManager.initialize();
        }
        const startTime = Date.now();
        let results = [];
        try {
            switch (options.queryType) {
                case 'keyword':
                    results = await this.keywordSearch(options);
                    break;
                case 'semantic':
                    results = await this.semanticSearch(options);
                    break;
                case 'hybrid':
                    results = await this.hybridSearch(options);
                    break;
            }
            // 记录查询历史
            await this.recordQueryHistory(options, results);
            // 获取相关模式建议
            const relatedPatterns = await this.getRelatedPatterns(results);
            return {
                problems: results.slice(0, options.limit || 10),
                totalCount: results.length,
                queryTime: Date.now() - startTime,
                suggestions: await this.generateSuggestions(options.query, results),
                relatedPatterns
            };
        }
        catch (error) {
            console.error('Query failed:', error);
            throw error;
        }
    }
    /**
     * 关键词搜索（基于现有的全文搜索）
     */
    async keywordSearch(options) {
        // 使用现有的全文搜索功能
        const problems = await this.dbManager.searchProblems(options.query);
        return problems.map(problem => ({
            problem,
            relevanceScore: this.calculateKeywordRelevance(options.query, problem),
            matchedFields: this.getMatchedFields(options.query, problem),
            snippet: this.generateSnippet(options.query, problem)
        }));
    }
    /**
     * 语义搜索（使用向量相似度）
     */
    async semanticSearch(options) {
        // 生成查询向量
        const queryEmbedding = await this.generateEmbedding(options.query);
        // 查询相似向量
        const similarProblems = await this.findSimilarEmbeddings(queryEmbedding, options.limit || 10, options.minSimilarity || 0.7);
        const results = [];
        for (const similar of similarProblems) {
            const problem = await this.dbManager.getProblem(similar.problemId);
            if (problem) {
                results.push({
                    problem,
                    relevanceScore: similar.similarity,
                    matchedFields: ['semantic'],
                    snippet: this.generateSemanticSnippet(problem, options.query)
                });
            }
        }
        return results;
    }
    /**
     * 混合搜索（关键词 + 语义）
     */
    async hybridSearch(options) {
        const [keywordResults, semanticResults] = await Promise.all([
            this.keywordSearch(options),
            this.semanticSearch(options)
        ]);
        // 合并结果并重新评分
        return this.mergeAndRerankResults(keywordResults, semanticResults);
    }
    /**
     * 查找相似问题
     */
    async findSimilarProblems(problemId, limit = 5) {
        // 基于现有的问题相似度表
        const similarityRecords = await this.dbManager.query(`
            SELECT ps.*, p.* 
            FROM problem_similarities ps
            JOIN problems p ON ps.target_problem_id = p.id
            WHERE ps.source_problem_id = ? 
            ORDER BY ps.similarity_score DESC
            LIMIT ?
        `, [problemId, limit]);
        return similarityRecords.map((record) => ({
            problem: record,
            similarityScore: record.similarity_score,
            matchType: record.similarity_type,
            explanation: this.generateSimilarityExplanation(record)
        }));
    }
    /**
     * 为 Copilot 生成增强上下文
     */
    async generateCopilotContext(query, sessionId) {
        const queryResult = await this.query({
            query,
            queryType: 'hybrid',
            limit: 3,
            includeContext: true
        });
        if (queryResult.problems.length === 0) {
            return '';
        }
        // 构建上下文提示
        let context = `\n\n=== 相关历史经验 ===\n`;
        context += `基于你的历史问题记录，我找到了以下相关案例：\n\n`;
        queryResult.problems.forEach((result, index) => {
            const problem = result.problem;
            context += `${index + 1}. **${problem.title}**\n`;
            context += `   问题：${problem.description}\n`;
            context += `   解决方案：${problem.final_solution}\n`;
            if (problem.prevention_strategy) {
                context += `   避坑建议：${problem.prevention_strategy}\n`;
            }
            context += `   相关度：${(result.relevanceScore * 100).toFixed(1)}%\n\n`;
        });
        if (queryResult.relatedPatterns.length > 0) {
            context += `=== 相关最佳实践 ===\n`;
            queryResult.relatedPatterns.forEach(pattern => {
                context += `• ${pattern.pattern_name}: ${pattern.pattern_description}\n`;
            });
        }
        context += `\n请参考以上历史经验来回答当前问题。`;
        // 记录增强会话
        if (sessionId) {
            await this.recordCopilotEnhancement(sessionId, query, context, queryResult.problems);
        }
        return context;
    }
    /**
     * 生成向量嵌入（实际实现需要调用 OpenAI API 或本地模型）
     */
    async generateEmbedding(text) {
        // 检查缓存
        if (this.embeddingCache.has(text)) {
            return this.embeddingCache.get(text);
        }
        try {
            // 使用OpenAI API生成embedding
            const OpenAI = require('openai');
            const openai = new OpenAI({
                apiKey: process.env.OPENAI_API_KEY || ''
            });
            const response = await openai.embeddings.create({
                model: 'text-embedding-3-small',
                input: text,
            });
            const embedding = response.data[0].embedding;
            this.embeddingCache.set(text, embedding);
            return embedding;
        }
        catch (error) {
            console.warn('Failed to generate embedding, using fallback:', error);
            // 如果API调用失败，使用简单的文本哈希作为fallback
            const fallbackEmbedding = this.generateFallbackEmbedding(text);
            this.embeddingCache.set(text, fallbackEmbedding);
            return fallbackEmbedding;
        }
    }
    /**
     * 生成fallback向量（当OpenAI API不可用时）
     */
    generateFallbackEmbedding(text) {
        // 基于文本内容生成一个简单的向量表示
        const words = text.toLowerCase().split(/\s+/);
        const vector = new Array(384).fill(0); // 使用较小的维度
        words.forEach((word, index) => {
            const hash = this.simpleHash(word);
            const pos = Math.abs(hash) % vector.length;
            vector[pos] += 1 / (index + 1); // 位置权重衰减
        });
        // 归一化
        const magnitude = Math.sqrt(vector.reduce((sum, val) => sum + val * val, 0));
        return magnitude > 0 ? vector.map(val => val / magnitude) : vector;
    }
    /**
     * 简单哈希函数
     */
    simpleHash(str) {
        let hash = 0;
        for (let i = 0; i < str.length; i++) {
            const char = str.charCodeAt(i);
            hash = ((hash << 5) - hash) + char;
            hash = hash & hash; // 转换为32位整数
        }
        return hash;
    }
    /**
     * 计算向量余弦相似度
     */
    calculateCosineSimilarity(a, b) {
        if (a.length !== b.length)
            return 0;
        let dotProduct = 0;
        let normA = 0;
        let normB = 0;
        for (let i = 0; i < a.length; i++) {
            dotProduct += a[i] * b[i];
            normA += a[i] * a[i];
            normB += b[i] * b[i];
        }
        return dotProduct / (Math.sqrt(normA) * Math.sqrt(normB));
    }
    /**
     * 查找相似的嵌入向量
     */
    async findSimilarEmbeddings(queryEmbedding, limit, minSimilarity) {
        try {
            // 查询数据库中的所有嵌入向量
            const embeddings = await this.dbManager.query(`
                SELECT problem_id, embedding_vector 
                FROM problem_embeddings 
                WHERE embedding_model = 'text-embedding-3-small'
            `);
            const results = [];
            for (const embedding of embeddings) {
                try {
                    const vector = JSON.parse(embedding.embedding_vector);
                    const similarity = this.calculateCosineSimilarity(queryEmbedding, vector);
                    if (similarity >= minSimilarity) {
                        results.push({
                            problemId: embedding.problem_id,
                            similarity
                        });
                    }
                }
                catch (error) {
                    console.warn(`Failed to parse embedding for problem ${embedding.problem_id}:`, error);
                }
            }
            // 按相似度排序并返回前N个结果
            return results
                .sort((a, b) => b.similarity - a.similarity)
                .slice(0, limit);
        }
        catch (error) {
            console.error('Failed to find similar embeddings:', error);
            return [];
        }
    }
    /**
     * 其他辅助方法...
     */
    calculateKeywordRelevance(query, problem) {
        // 实现关键词相关度计算
        const queryTerms = query.toLowerCase().split(/\s+/);
        const content = `${problem.title} ${problem.description} ${problem.final_solution}`.toLowerCase();
        let matches = 0;
        for (const term of queryTerms) {
            if (content.includes(term)) {
                matches++;
            }
        }
        return matches / queryTerms.length;
    }
    getMatchedFields(query, problem) {
        const fields = [];
        const queryLower = query.toLowerCase();
        if (problem.title.toLowerCase().includes(queryLower))
            fields.push('title');
        if (problem.description.toLowerCase().includes(queryLower))
            fields.push('description');
        if (problem.final_solution.toLowerCase().includes(queryLower))
            fields.push('solution');
        return fields;
    }
    generateSnippet(query, problem) {
        // 生成包含查询词的文本片段
        const content = problem.description;
        const queryLower = query.toLowerCase();
        const index = content.toLowerCase().indexOf(queryLower);
        if (index === -1) {
            return content.substring(0, 150) + '...';
        }
        const start = Math.max(0, index - 50);
        const end = Math.min(content.length, index + query.length + 50);
        return content.substring(start, end);
    }
    generateSemanticSnippet(problem, query) {
        // 为语义搜索生成更智能的摘要
        return `${problem.title} - ${problem.description.substring(0, 100)}...`;
    }
    mergeAndRerankResults(keywordResults, semanticResults) {
        // 合并关键词和语义搜索结果，避免重复并重新评分
        const mergedMap = new Map();
        // 添加关键词结果（权重 0.4）
        keywordResults.forEach(result => {
            mergedMap.set(result.problem.id, {
                ...result,
                relevanceScore: result.relevanceScore * 0.4
            });
        });
        // 添加语义结果（权重 0.6），如果已存在则合并分数
        semanticResults.forEach(result => {
            const existing = mergedMap.get(result.problem.id);
            if (existing) {
                existing.relevanceScore += result.relevanceScore * 0.6;
                existing.matchedFields = [...existing.matchedFields, ...result.matchedFields];
            }
            else {
                mergedMap.set(result.problem.id, {
                    ...result,
                    relevanceScore: result.relevanceScore * 0.6
                });
            }
        });
        return Array.from(mergedMap.values())
            .sort((a, b) => b.relevanceScore - a.relevanceScore);
    }
    async recordQueryHistory(options, results) {
        // 记录查询历史用于分析和优化
        const problemIds = results.map(r => r.problem.id);
        await this.dbManager.execute(`
            INSERT INTO query_history (
                query_text, query_type, results_count, matched_problem_ids, query_context
            ) VALUES (?, ?, ?, ?, ?)
        `, [
            options.query,
            options.queryType,
            results.length,
            JSON.stringify(problemIds),
            JSON.stringify(options)
        ]);
    }
    async getRelatedPatterns(results) {
        // 基于搜索结果找出相关的知识模式
        if (results.length === 0)
            return [];
        const categories = [...new Set(results.map(r => r.problem.category))];
        return this.dbManager.query(`
            SELECT * FROM knowledge_patterns 
            WHERE related_categories LIKE ? OR related_categories LIKE ?
            ORDER BY pattern_score DESC
            LIMIT 3
        `, [`%${categories[0]}%`, `%${categories[1] || categories[0]}%`]);
    }
    async generateSuggestions(query, results) {
        // 基于查询和结果生成搜索建议
        const suggestions = [];
        if (results.length === 0) {
            suggestions.push(`尝试搜索 "${query}" 的同义词`);
            suggestions.push('检查拼写是否正确');
            suggestions.push('使用更通用的关键词');
        }
        else {
            const commonTags = new Set();
            results.forEach(result => {
                // 假设有标签信息
                // result.problem.tags?.forEach(tag => commonTags.add(tag));
            });
            Array.from(commonTags).slice(0, 3).forEach(tag => {
                suggestions.push(`搜索更多关于 "${tag}" 的问题`);
            });
        }
        return suggestions;
    }
    generateSimilarityExplanation(record) {
        switch (record.similarity_type) {
            case 'semantic':
                return '语义内容相似';
            case 'keyword':
                return '关键词匹配';
            case 'solution_pattern':
                return '解决方案模式相似';
            default:
                return '相关问题';
        }
    }
    async recordCopilotEnhancement(sessionId, query, context, matchedProblems) {
        const problemIds = matchedProblems.map(p => p.problem.id);
        await this.dbManager.execute(`
            INSERT INTO copilot_enhancements (
                session_id, original_query, enhanced_context, matched_problems, enhancement_type
            ) VALUES (?, ?, ?, ?, ?)
        `, [
            sessionId,
            query,
            context,
            JSON.stringify(problemIds),
            'similar_cases'
        ]);
    }
}
exports.default = IntelligentQueryEngine;
