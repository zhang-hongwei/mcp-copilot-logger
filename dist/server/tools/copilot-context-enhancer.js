"use strict";
/**
 * Copilot 上下文增强器 - 自动为 Copilot 提供历史上下文
 */
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const intelligent_query_engine_1 = __importDefault(require("./intelligent-query-engine"));
const database_manager_1 = require("../database/database-manager");
class CopilotContextEnhancer {
    constructor(dbManager) {
        this.contextCache = new Map();
        this.dbManager = dbManager || new database_manager_1.DatabaseManager();
        this.queryEngine = new intelligent_query_engine_1.default(this.dbManager);
    }
    /**
     * 为 Copilot 查询增强上下文
     */
    async enhanceContext(query, options = {}) {
        const sessionId = options.sessionId || this.generateSessionId();
        // 检查缓存
        const cacheKey = `${query}:${JSON.stringify(options)}`;
        if (this.contextCache.has(cacheKey)) {
            return this.contextCache.get(cacheKey);
        }
        try {
            // 1. 分析查询意图
            const queryIntent = await this.analyzeQueryIntent(query);
            // 2. 搜索相关问题
            const searchResults = await this.queryEngine.query({
                query,
                queryType: 'hybrid',
                limit: options.maxContextItems || 5,
                minSimilarity: options.minRelevanceScore || 0.6
            });
            // 3. 构建上下文源
            const contextSources = await this.buildContextSources(searchResults.problems, queryIntent, options);
            // 4. 生成增强提示
            const enhancedPrompt = this.generateEnhancedPrompt(query, contextSources, queryIntent);
            // 5. 计算置信度
            const confidenceScore = this.calculateConfidenceScore(searchResults.problems, contextSources);
            const context = {
                sessionId,
                originalQuery: query,
                enhancedPrompt,
                contextSources,
                confidenceScore,
                timestamp: new Date().toISOString()
            };
            // 6. 记录增强会话
            await this.recordEnhancementSession(context);
            // 7. 缓存结果
            this.contextCache.set(cacheKey, context);
            return context;
        }
        catch (error) {
            console.error('Context enhancement failed:', error);
            // 返回原始查询作为降级方案
            return {
                sessionId,
                originalQuery: query,
                enhancedPrompt: query,
                contextSources: [],
                confidenceScore: 0,
                timestamp: new Date().toISOString()
            };
        }
    }
    /**
     * 分析查询意图
     */
    async analyzeQueryIntent(query) {
        const queryLower = query.toLowerCase();
        const intent = {
            type: 'general',
            entities: [],
            keywords: this.extractKeywords(query),
            isErrorQuery: false,
            isHowToQuery: false,
            isCodeQuery: false,
            isTroubleshooting: false
        };
        // 检测查询类型
        if (queryLower.includes('error') || queryLower.includes('错误') ||
            queryLower.includes('bug') || queryLower.includes('problem')) {
            intent.type = 'error_solving';
            intent.isErrorQuery = true;
            intent.isTroubleshooting = true;
        }
        else if (queryLower.includes('how to') || queryLower.includes('如何') ||
            queryLower.includes('怎么')) {
            intent.type = 'how_to';
            intent.isHowToQuery = true;
        }
        else if (this.containsCodeKeywords(queryLower)) {
            intent.type = 'code_help';
            intent.isCodeQuery = true;
        }
        // 提取实体（技术栈、工具名称等）
        intent.entities = this.extractTechEntities(query);
        return intent;
    }
    /**
     * 构建上下文源
     */
    async buildContextSources(searchResults, queryIntent, options) {
        const sources = [];
        for (const result of searchResults) {
            const problem = result.problem;
            // 添加相似问题
            sources.push({
                type: 'similar_problem',
                problemId: problem.id,
                title: `相似问题：${problem.title}`,
                content: this.formatProblemContent(problem, options),
                relevanceScore: result.relevanceScore
            });
            // 如果包含代码示例选项
            if (options.includeCodeExamples && problem.code_after) {
                sources.push({
                    type: 'code_pattern',
                    problemId: problem.id,
                    title: `代码示例：${problem.title}`,
                    content: this.formatCodeExample(problem),
                    relevanceScore: result.relevanceScore * 0.8
                });
            }
            // 如果包含预防提示选项
            if (options.includePreventionTips && problem.prevention_strategy) {
                sources.push({
                    type: 'prevention_tip',
                    problemId: problem.id,
                    title: `避坑指南：${problem.title}`,
                    content: problem.prevention_strategy,
                    relevanceScore: result.relevanceScore * 0.7
                });
            }
        }
        // 按相关度排序并限制数量
        return sources
            .sort((a, b) => b.relevanceScore - a.relevanceScore)
            .slice(0, options.maxContextItems || 10);
    }
    /**
     * 生成增强提示
     */
    generateEnhancedPrompt(originalQuery, contextSources, queryIntent) {
        if (contextSources.length === 0) {
            return originalQuery;
        }
        let enhancedPrompt = originalQuery + '\n\n';
        enhancedPrompt += '=== 📚 相关历史经验参考 ===\n';
        enhancedPrompt += '基于你的历史问题记录，我找到了以下相关经验：\n\n';
        // 分组显示不同类型的上下文
        const groupedSources = this.groupSourcesByType(contextSources);
        // 相似问题
        if (groupedSources.similar_problem?.length > 0) {
            enhancedPrompt += '🔍 **相似问题经验**：\n';
            groupedSources.similar_problem.slice(0, 3).forEach((source, index) => {
                enhancedPrompt += `${index + 1}. ${source.content}\n\n`;
            });
        }
        // 代码示例
        if (groupedSources.code_pattern?.length > 0) {
            enhancedPrompt += '💻 **相关代码示例**：\n';
            groupedSources.code_pattern.slice(0, 2).forEach((source, index) => {
                enhancedPrompt += `${index + 1}. ${source.content}\n\n`;
            });
        }
        // 预防提示
        if (groupedSources.prevention_tip?.length > 0) {
            enhancedPrompt += '⚠️ **避坑提醒**：\n';
            groupedSources.prevention_tip.slice(0, 2).forEach((source, index) => {
                enhancedPrompt += `${index + 1}. ${source.content}\n\n`;
            });
        }
        // 根据查询意图添加特定指导
        enhancedPrompt += this.getIntentSpecificGuidance(queryIntent);
        enhancedPrompt += '\n请参考以上历史经验来回答当前问题，并结合这些经验提供更准确和实用的建议。';
        return enhancedPrompt;
    }
    /**
     * 格式化问题内容
     */
    formatProblemContent(problem, options) {
        let content = `**问题**：${problem.description}\n`;
        content += `**解决方案**：${problem.final_solution}\n`;
        if (problem.value_score >= 7) {
            content += `**价值评分**：${problem.value_score}/10 (高价值经验)\n`;
        }
        return content;
    }
    /**
     * 格式化代码示例
     */
    formatCodeExample(problem) {
        let content = '';
        if (problem.code_before && problem.code_after) {
            content += '**修改前**：\n```';
            if (problem.code_language) {
                content += problem.code_language;
            }
            content += '\n' + problem.code_before + '\n```\n\n';
            content += '**修改后**：\n```';
            if (problem.code_language) {
                content += problem.code_language;
            }
            content += '\n' + problem.code_after + '\n```\n';
        }
        else if (problem.code_after) {
            content += '**解决方案代码**：\n```';
            if (problem.code_language) {
                content += problem.code_language;
            }
            content += '\n' + problem.code_after + '\n```\n';
        }
        return content;
    }
    /**
     * 按类型分组上下文源
     */
    groupSourcesByType(sources) {
        return sources.reduce((groups, source) => {
            if (!groups[source.type]) {
                groups[source.type] = [];
            }
            groups[source.type].push(source);
            return groups;
        }, {});
    }
    /**
     * 根据查询意图提供特定指导
     */
    getIntentSpecificGuidance(queryIntent) {
        let guidance = '\n=== 💡 建议 ===\n';
        if (queryIntent.isErrorQuery) {
            guidance += '• 查看错误信息的详细堆栈跟踪\n';
            guidance += '• 检查相关配置文件和环境变量\n';
            guidance += '• 尝试复现问题的最小化案例\n';
        }
        else if (queryIntent.isHowToQuery) {
            guidance += '• 建议先了解相关的基础概念\n';
            guidance += '• 查看官方文档和最佳实践\n';
            guidance += '• 考虑使用现有的成熟解决方案\n';
        }
        else if (queryIntent.isCodeQuery) {
            guidance += '• 注意代码的可读性和维护性\n';
            guidance += '• 考虑性能和安全性影响\n';
            guidance += '• 添加适当的测试和文档\n';
        }
        return guidance;
    }
    /**
     * 计算置信度分数
     */
    calculateConfidenceScore(searchResults, contextSources) {
        if (contextSources.length === 0)
            return 0;
        // 基于搜索结果的平均相关度
        const avgRelevance = searchResults.reduce((sum, result) => sum + result.relevanceScore, 0) / searchResults.length;
        // 基于上下文源的数量和质量
        const sourceQuality = contextSources.reduce((sum, source) => sum + source.relevanceScore, 0) / contextSources.length;
        return Math.min((avgRelevance * 0.6 + sourceQuality * 0.4), 1.0);
    }
    /**
     * 记录增强会话
     */
    async recordEnhancementSession(context) {
        try {
            await this.dbManager.execute(`
                INSERT INTO copilot_enhancements (
                    session_id, original_query, enhanced_context, matched_problems,
                    enhancement_type, created_at
                ) VALUES (?, ?, ?, ?, ?, ?)
            `, [
                context.sessionId,
                context.originalQuery,
                context.enhancedPrompt,
                JSON.stringify(context.contextSources.map(s => s.problemId).filter(Boolean)),
                'similar_cases',
                context.timestamp
            ]);
        }
        catch (error) {
            console.error('Failed to record enhancement session:', error);
        }
    }
    /**
     * 提供用户反馈
     */
    async provideFeedback(sessionId, satisfaction, feedback) {
        try {
            await this.dbManager.execute(`
                UPDATE copilot_enhancements 
                SET user_satisfaction_score = ?, copilot_response_improved = ?
                WHERE session_id = ?
            `, [satisfaction, feedback === 'helpful', sessionId]);
        }
        catch (error) {
            console.error('Failed to record feedback:', error);
        }
    }
    /**
     * 获取增强统计信息
     */
    async getEnhancementStats() {
        try {
            const stats = await this.dbManager.query(`
                SELECT 
                    COUNT(*) as total_enhancements,
                    AVG(user_satisfaction_score) as avg_satisfaction,
                    COUNT(CASE WHEN copilot_response_improved = 1 THEN 1 END) as improved_responses,
                    COUNT(DISTINCT session_id) as unique_sessions
                FROM copilot_enhancements 
                WHERE created_at > datetime('now', '-30 days')
            `);
            return stats[0] || {};
        }
        catch (error) {
            console.error('Failed to get enhancement stats:', error);
            return {};
        }
    }
    // 辅助方法
    generateSessionId() {
        return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    }
    extractKeywords(query) {
        return query.toLowerCase()
            .replace(/[^\w\s]/g, ' ')
            .split(/\s+/)
            .filter(word => word.length > 2);
    }
    containsCodeKeywords(query) {
        const codeKeywords = ['function', 'class', 'import', 'export', 'const', 'let', 'var',
            'if', 'else', 'for', 'while', 'return', 'async', 'await'];
        return codeKeywords.some(keyword => query.includes(keyword));
    }
    extractTechEntities(query) {
        const techTerms = ['react', 'vue', 'angular', 'nodejs', 'python', 'javascript',
            'typescript', 'css', 'html', 'sql', 'mongodb', 'postgres',
            'express', 'fastapi', 'django', 'spring', 'docker', 'kubernetes'];
        const queryLower = query.toLowerCase();
        return techTerms.filter(term => queryLower.includes(term));
    }
}
exports.default = CopilotContextEnhancer;
