"use strict";
/**
 * 知识模式分析器 - 自动发现和总结问题模式
 */
Object.defineProperty(exports, "__esModule", { value: true });
const database_manager_1 = require("../database/database-manager");
class KnowledgePatternAnalyzer {
    constructor(dbManager) {
        this.dbManager = dbManager || new database_manager_1.DatabaseManager();
    }
    /**
     * 分析所有问题，发现新的模式
     */
    async analyzePatterns() {
        // 确保数据库已初始化
        if (!this.dbManager['isInitialized']) {
            await this.dbManager.initialize();
        }
        const problems = await this.getAllProblems();
        const existingPatterns = await this.getExistingPatterns();
        const result = {
            newPatterns: [],
            updatedPatterns: [],
            recommendations: [],
            statistics: {
                totalProblems: problems.length,
                analyzedProblems: 0,
                patternsFound: 0,
                confidenceScore: 0
            }
        };
        // 1. 按类别分组分析
        const categoryGroups = this.groupProblemsByCategory(problems);
        // 2. 按标签组合分析
        const tagGroups = this.groupProblemsByTagCombinations(problems);
        // 3. 按解决方案类型分析
        const solutionGroups = this.groupProblemsBySolutionType(problems);
        // 4. 分析每个组，发现模式
        for (const [category, categoryProblems] of Object.entries(categoryGroups)) {
            if (categoryProblems.length >= 3) { // 至少3个问题才能形成模式
                const pattern = await this.analyzeCategory(category, categoryProblems);
                if (pattern) {
                    result.newPatterns.push(pattern);
                }
            }
        }
        // 5. 分析标签组合模式
        for (const [tagCombo, tagProblems] of Object.entries(tagGroups)) {
            if (tagProblems.length >= 2) {
                const pattern = await this.analyzeTagCombination(tagCombo, tagProblems);
                if (pattern) {
                    result.newPatterns.push(pattern);
                }
            }
        }
        // 6. 更新现有模式
        for (const existingPattern of existingPatterns) {
            const updated = await this.updatePattern(existingPattern, problems);
            if (updated) {
                result.updatedPatterns.push(updated);
            }
        }
        // 7. 生成推荐
        result.recommendations = this.generateRecommendations(result.newPatterns, result.updatedPatterns);
        // 8. 计算统计信息
        result.statistics.analyzedProblems = problems.length;
        result.statistics.patternsFound = result.newPatterns.length;
        result.statistics.confidenceScore = this.calculateConfidenceScore(result);
        return result;
    }
    /**
     * 按类别分析问题模式
     */
    async analyzeCategory(category, problems) {
        if (problems.length < 3)
            return null;
        // 分析共同特征
        const commonTags = this.findCommonTags(problems);
        const commonSolutions = this.findCommonSolutions(problems);
        const preventionStrategies = this.extractPreventionStrategies(problems);
        // 生成模式描述
        const description = this.generatePatternDescription(category, problems, commonTags, commonSolutions);
        return {
            name: `${category}问题模式`,
            description,
            categories: [category],
            commonTags,
            typicalSolutions: commonSolutions,
            preventionStrategies,
            relatedProblemIds: problems.map(p => p.id),
            score: this.calculatePatternScore(problems, commonTags, commonSolutions),
            usageCount: 0
        };
    }
    /**
     * 按标签组合分析问题模式
     */
    async analyzeTagCombination(tagCombo, problems) {
        const tags = tagCombo.split('|');
        if (problems.length < 2 || tags.length < 2)
            return null;
        const categories = [...new Set(problems.map(p => p.category))];
        const commonSolutions = this.findCommonSolutions(problems);
        const preventionStrategies = this.extractPreventionStrategies(problems);
        return {
            name: `${tags.join(' + ')}组合问题模式`,
            description: `涉及 ${tags.join(' 和 ')} 的常见问题模式`,
            categories,
            commonTags: tags,
            typicalSolutions: commonSolutions,
            preventionStrategies,
            relatedProblemIds: problems.map(p => p.id),
            score: this.calculatePatternScore(problems, tags, commonSolutions),
            usageCount: 0
        };
    }
    /**
     * 智能总结常见解决方案
     */
    findCommonSolutions(problems) {
        const solutions = problems.map(p => p.final_solution).filter(s => s && s.length > 0);
        // 简单的关键词提取（实际实现可以使用更复杂的 NLP）
        const keywordCounts = new Map();
        solutions.forEach(solution => {
            const keywords = this.extractKeywords(solution);
            keywords.forEach(keyword => {
                keywordCounts.set(keyword, (keywordCounts.get(keyword) || 0) + 1);
            });
        });
        // 返回出现频率高的解决方案关键词
        return Array.from(keywordCounts.entries())
            .filter(([_, count]) => count >= 2)
            .sort((a, b) => b[1] - a[1])
            .slice(0, 5)
            .map(([keyword, _]) => keyword);
    }
    /**
     * 查找共同标签
     */
    findCommonTags(problems) {
        // 这里需要从 problem_tags 和 tags 表查询
        // 简化实现，假设每个问题都有tags字段
        const allTags = new Map();
        problems.forEach(problem => {
            // 实际实现需要查询关联的标签
            // const tags = await this.getTagsForProblem(problem.id);
            // 暂时跳过
        });
        return Array.from(allTags.entries())
            .filter(([_, count]) => count >= Math.ceil(problems.length * 0.5))
            .map(([tag, _]) => tag);
    }
    /**
     * 提取预防策略
     */
    extractPreventionStrategies(problems) {
        return problems
            .map(p => p.prevention_strategy)
            .filter((s) => s !== null && s !== undefined && s.length > 0)
            .slice(0, 3); // 取前3个作为示例
    }
    /**
     * 生成模式描述
     */
    generatePatternDescription(category, problems, commonTags, commonSolutions) {
        let description = `这是 ${category} 类别下的常见问题模式。`;
        if (commonTags.length > 0) {
            description += ` 通常涉及 ${commonTags.join(', ')} 等技术。`;
        }
        if (commonSolutions.length > 0) {
            description += ` 常见解决方案包括：${commonSolutions.join(', ')}。`;
        }
        description += ` 基于 ${problems.length} 个相似问题总结而成。`;
        return description;
    }
    /**
     * 计算模式重要性评分
     */
    calculatePatternScore(problems, commonTags, commonSolutions) {
        let score = 0;
        // 基于问题数量
        score += Math.min(problems.length * 0.1, 1.0);
        // 基于平均价值评分
        const avgValueScore = problems.reduce((sum, p) => sum + p.value_score, 0) / problems.length;
        score += avgValueScore * 0.1;
        // 基于共同特征
        score += commonTags.length * 0.05;
        score += commonSolutions.length * 0.05;
        // 基于问题的时间分散度（更分散 = 更常见）
        const timeSpread = this.calculateTimeSpread(problems);
        score += timeSpread * 0.2;
        return Math.min(score, 10.0);
    }
    /**
     * 计算时间分散度
     */
    calculateTimeSpread(problems) {
        if (problems.length < 2)
            return 0;
        const timestamps = problems.map(p => new Date(p.created_at).getTime());
        const minTime = Math.min(...timestamps);
        const maxTime = Math.max(...timestamps);
        // 转换为天数
        const daySpread = (maxTime - minTime) / (1000 * 60 * 60 * 24);
        // 标准化为 0-1 的分数
        return Math.min(daySpread / 365, 1.0); // 最多一年
    }
    /**
     * 提取关键词（简化的NLP实现）
     */
    extractKeywords(text) {
        // 移除标点符号和停用词
        const stopWords = new Set(['的', '了', '是', '在', '和', '与', '或', '但', '因为', '所以', '这', '那', '它', '他', '她', 'the', 'is', 'at', 'and', 'or', 'but', 'for', 'with', 'this', 'that']);
        const words = text
            .toLowerCase()
            .replace(/[^\w\s\u4e00-\u9fff]/g, ' ') // 保留中英文字符
            .split(/\s+/)
            .filter(word => word.length > 1 && !stopWords.has(word));
        // 统计词频
        const wordCount = new Map();
        words.forEach(word => {
            wordCount.set(word, (wordCount.get(word) || 0) + 1);
        });
        // 返回高频词汇
        return Array.from(wordCount.entries())
            .sort((a, b) => b[1] - a[1])
            .slice(0, 10)
            .map(([word]) => word);
    }
    /**
     * 按类别分组问题
     */
    groupProblemsByCategory(problems) {
        const groups = {};
        problems.forEach(problem => {
            const category = problem.category || 'uncategorized';
            if (!groups[category]) {
                groups[category] = [];
            }
            groups[category].push(problem);
        });
        return groups;
    }
    /**
     * 按标签组合分组问题
     */
    groupProblemsByTagCombinations(problems) {
        const groups = {};
        // 这里需要实际的标签查询，暂时返回空
        // 在实际实现中，应该：
        // 1. 查询每个问题的标签
        // 2. 找出常见的标签组合
        // 3. 按组合分组问题
        return groups;
    }
    /**
     * 按解决方案类型分组问题
     */
    groupProblemsBySolutionType(problems) {
        const groups = {};
        problems.forEach(problem => {
            if (problem.final_solution) {
                const keywords = this.extractKeywords(problem.final_solution);
                const solutionType = keywords[0] || 'general';
                if (!groups[solutionType]) {
                    groups[solutionType] = [];
                }
                groups[solutionType].push(problem);
            }
        });
        return groups;
    }
    /**
     * 获取所有问题
     */
    async getAllProblems() {
        return await this.dbManager.query(`
            SELECT * FROM problems 
            WHERE created_at >= datetime('now', '-30 days')
            ORDER BY created_at DESC
        `);
    }
    /**
     * 获取现有模式
     */
    async getExistingPatterns() {
        const patterns = await this.dbManager.query(`
            SELECT * FROM knowledge_patterns 
            ORDER BY pattern_score DESC
        `);
        return patterns.map(p => ({
            id: p.id,
            name: p.pattern_name,
            description: p.pattern_description,
            categories: JSON.parse(p.related_categories || '[]'),
            commonTags: JSON.parse(p.common_tags || '[]'),
            typicalSolutions: JSON.parse(p.typical_solutions || '[]'),
            preventionStrategies: JSON.parse(p.prevention_strategies || '[]'),
            relatedProblemIds: JSON.parse(p.related_problem_ids || '[]'),
            score: p.pattern_score,
            usageCount: p.usage_count || 0
        }));
    }
    /**
     * 更新现有模式
     */
    async updatePattern(existingPattern, allProblems) {
        // 找到属于此模式的新问题
        const relevantProblems = allProblems.filter(problem => existingPattern.categories.includes(problem.category || ''));
        if (relevantProblems.length === existingPattern.relatedProblemIds.length) {
            return null; // 没有新问题，不需要更新
        }
        // 重新分析模式
        const updatedCommonSolutions = this.findCommonSolutions(relevantProblems);
        const updatedPreventionStrategies = this.extractPreventionStrategies(relevantProblems);
        return {
            ...existingPattern,
            typicalSolutions: updatedCommonSolutions,
            preventionStrategies: updatedPreventionStrategies,
            relatedProblemIds: relevantProblems.map(p => p.id),
            score: this.calculatePatternScore(relevantProblems, existingPattern.commonTags, updatedCommonSolutions),
            usageCount: existingPattern.usageCount
        };
    }
    /**
     * 生成推荐
     */
    generateRecommendations(newPatterns, updatedPatterns) {
        const recommendations = [];
        if (newPatterns.length > 0) {
            recommendations.push(`发现了 ${newPatterns.length} 个新的问题模式，建议关注这些模式以提高问题解决效率。`);
            const highScorePatterns = newPatterns.filter(p => p.score > 0.7);
            if (highScorePatterns.length > 0) {
                recommendations.push(`其中 ${highScorePatterns.length} 个模式具有较高的重要性，建议优先处理。`);
            }
        }
        if (updatedPatterns.length > 0) {
            recommendations.push(`更新了 ${updatedPatterns.length} 个现有模式，这些模式的解决方案得到了丰富。`);
        }
        const allPatterns = [...newPatterns, ...updatedPatterns];
        const topCategories = this.getTopCategories(allPatterns);
        if (topCategories.length > 0) {
            recommendations.push(`建议重点关注 ${topCategories.join('、')} 等类别的问题。`);
        }
        return recommendations;
    }
    /**
     * 计算分析置信度
     */
    calculateConfidenceScore(result) {
        let confidence = 0;
        // 基于问题数量
        if (result.statistics.totalProblems >= 10) {
            confidence += 0.3;
        }
        else if (result.statistics.totalProblems >= 5) {
            confidence += 0.2;
        }
        else {
            confidence += 0.1;
        }
        // 基于发现的模式数量
        if (result.newPatterns.length >= 3) {
            confidence += 0.4;
        }
        else if (result.newPatterns.length >= 1) {
            confidence += 0.2;
        }
        // 基于模式质量（平均分数）
        const avgScore = result.newPatterns.reduce((sum, p) => sum + p.score, 0) /
            Math.max(result.newPatterns.length, 1);
        confidence += avgScore * 0.3;
        return Math.min(confidence, 1.0);
    }
    /**
     * 获取最重要的类别
     */
    getTopCategories(patterns) {
        const categoryCount = new Map();
        patterns.forEach(pattern => {
            pattern.categories.forEach(category => {
                categoryCount.set(category, (categoryCount.get(category) || 0) + 1);
            });
        });
        return Array.from(categoryCount.entries())
            .sort((a, b) => b[1] - a[1])
            .slice(0, 3)
            .map(([category]) => category);
    }
    /**
     * 保存模式到数据库
     */
    async savePattern(pattern) {
        const result = await this.dbManager.execute(`
            INSERT INTO knowledge_patterns (
                pattern_name, pattern_description, related_categories, common_tags,
                typical_solutions, prevention_strategies, related_problem_ids,
                pattern_score, usage_count
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
        `, [
            pattern.name,
            pattern.description,
            JSON.stringify(pattern.categories),
            JSON.stringify(pattern.commonTags),
            JSON.stringify(pattern.typicalSolutions),
            JSON.stringify(pattern.preventionStrategies),
            JSON.stringify(pattern.relatedProblemIds),
            pattern.score,
            pattern.usageCount
        ]);
        return result.lastInsertRowid;
    }
    /**
     * 更新现有模式
     */
    async updatePatternInDB(pattern) {
        if (!pattern.id)
            return false;
        const result = await this.dbManager.execute(`
            UPDATE knowledge_patterns SET
                pattern_description = ?, related_categories = ?, common_tags = ?,
                typical_solutions = ?, prevention_strategies = ?, related_problem_ids = ?,
                pattern_score = ?, updated_at = datetime('now')
            WHERE id = ?
        `, [
            pattern.description,
            JSON.stringify(pattern.categories),
            JSON.stringify(pattern.commonTags),
            JSON.stringify(pattern.typicalSolutions),
            JSON.stringify(pattern.preventionStrategies),
            JSON.stringify(pattern.relatedProblemIds),
            pattern.score,
            pattern.id
        ]);
        return result.changes > 0;
    }
}
exports.default = KnowledgePatternAnalyzer;
