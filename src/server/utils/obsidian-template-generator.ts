/**
 * 高质量的 Obsidian 导出模板生成器
 */

import { ProblemRecord } from '../../types/problem-record';

export class ObsidianTemplateGenerator {

    /**
     * 生成单个问题的详细 Markdown 模板
     */
    public generateProblemTemplate(record: ProblemRecord, index: number): string {
        const tagsString = record.tags.map(tag => `#${tag}`).join(' ');
        const priorityEmoji = this.getPriorityEmoji(record.priority);
        const categoryEmoji = this.getCategoryEmoji(record.category);

        return `
## ✅ 问题 ${index + 1}：${record.title}
> 🆔 ID: ${record.id}  
> 🗓 记录时间：${this.formatTimestamp(record.timestamp)}  
> 🏷 标签: ${tagsString}  
> ${priorityEmoji} 优先级: ${record.priority}  
> ${categoryEmoji} 分类: ${record.category}

### 🎯 问题背景
${record.context || '无详细背景信息'}

${this.generateCodeSection(record)}

### 🔍 错误现象
${record.errorPhenomenon}

${this.generateAttemptsSection(record.attempts)}

### 🛠 解决方案
${record.finalSolution}

**解决方案类型**: ${this.getSolutionTypeDescription(record.solutionType)}

### 💡 价值分析
**评分**: ${this.generateStarRating(record.valueScore)}/10

**价值说明**:
${record.valueExplanation}

**学习收获**:
${record.learningOutcome}

${record.preventionStrategy ? `**预防策略**:\n${record.preventionStrategy}` : ''}

${this.generateRelatedSection(record)}

---
`;
    }

    /**
     * 生成完整的导出文档模板
     */
    public generateFullExportTemplate(
        records: ProblemRecord[],
        exportType: string = 'daily-log'
    ): string {
        const exportTime = new Date().toISOString();
        const formattedDate = this.formatTimestamp(exportTime);

        // 筛选高价值问题
        const highValueRecords = records.filter(r =>
            r.isWorthExporting && r.valueScore >= 6
        );

        const header = `# 📌 MCP 问题整理导出

> ⏱ 导出时间：${formattedDate}  
> 🔢 共导出问题：${highValueRecords.length} 个  
> 📊 筛选标准：价值评分 ≥ 6 分且标记为"值得导出"

${this.generateSummarySection(highValueRecords)}

---
`;

        const problemSections = highValueRecords.map((record, index) =>
            this.generateProblemTemplate(record, index)
        ).join('\n');

        const footer = `
---

## 📚 文档元信息

- **导出类型**: ${exportType}
- **生成工具**: MCP Copilot Logger
- **文档版本**: v1.0
- **最后更新**: ${formattedDate}

### 🔗 相关链接
- [[MCP开发指南]]
- [[问题解决方法论]]
- [[技术学习笔记]]

### 🏷️ 文档标签
#MCP #问题解决 #技术文档 #开发日志
`;

        return header + problemSections + footer;
    }

    /**
     * 生成汇总统计信息
     */
    private generateSummarySection(records: ProblemRecord[]): string {
        if (records.length === 0) {
            return '## 📊 本次导出无高价值问题';
        }

        const stats = this.calculateStatistics(records);

        return `
## 📊 本次导出统计

### 按分类统计
${Object.entries(stats.byCategory).map(([category, count]) =>
            `- ${this.getCategoryEmoji(category)} ${category}: ${count} 个`
        ).join('\n')}

### 按价值评分统计
${Object.entries(stats.byScore).map(([score, count]) =>
            `- ${score}分: ${count} 个`
        ).join('\n')}

### 热门标签
${stats.topTags.slice(0, 5).map(([tag, count]) =>
            `- #${tag}: ${count} 次`
        ).join('\n')}
`;
    }

    /**
     * 生成代码对比部分
     */
    private generateCodeSection(record: ProblemRecord): string {
        if (!record.codeBeforeChange && !record.codeAfterChange) {
            return '';
        }

        const language = record.codeLanguage || 'text';

        let codeSection = '\n### 💻 代码修改\n';

        if (record.codeBeforeChange) {
            codeSection += `
**修改前**:
\`\`\`${language}
${record.codeBeforeChange}
\`\`\`
`;
        }

        if (record.codeAfterChange) {
            codeSection += `
**修改后**:
\`\`\`${language}
${record.codeAfterChange}
\`\`\`
`;
        }

        return codeSection;
    }

    /**
     * 生成尝试过程部分
     */
    private generateAttemptsSection(attempts: any[]): string {
        if (!attempts || attempts.length === 0) {
            return '';
        }

        const attemptsContent = attempts.map((attempt, index) => {
            if (typeof attempt === 'string') {
                return `${index + 1}. ${attempt}`;
            } else {
                return `${index + 1}. **${attempt.action}** - ${attempt.result}`;
            }
        }).join('\n');

        return `
### 🧪 尝试过程
${attemptsContent}
`;
    }

    /**
     * 生成相关信息部分
     */
    private generateRelatedSection(record: ProblemRecord): string {
        let relatedSection = '';

        if (record.relatedIssues && record.relatedIssues.length > 0) {
            relatedSection += `
**相关问题**:
${record.relatedIssues.map(id => `- [[问题-${id}]]`).join('\n')}
`;
        }

        if (record.references && record.references.length > 0) {
            relatedSection += `
**参考资料**:
${record.references.map(ref => `- ${ref}`).join('\n')}
`;
        }

        return relatedSection;
    }

    /**
     * 计算统计信息
     */
    private calculateStatistics(records: ProblemRecord[]) {
        const byCategory: Record<string, number> = {};
        const byScore: Record<string, number> = {};
        const tagCounts: Record<string, number> = {};

        records.forEach(record => {
            // 按分类统计
            byCategory[record.category] = (byCategory[record.category] || 0) + 1;

            // 按评分统计
            byScore[record.valueScore.toString()] = (byScore[record.valueScore.toString()] || 0) + 1;

            // 标签统计
            record.tags.forEach(tag => {
                tagCounts[tag] = (tagCounts[tag] || 0) + 1;
            });
        });

        const topTags = Object.entries(tagCounts)
            .sort(([, a], [, b]) => b - a)
            .slice(0, 10);

        return { byCategory, byScore, topTags };
    }

    /**
     * 辅助方法
     */
    private formatTimestamp(timestamp: string): string {
        return new Date(timestamp).toLocaleString('zh-CN', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit'
        });
    }

    private getPriorityEmoji(priority: string): string {
        const emojiMap: Record<string, string> = {
            'low': '🟢',
            'medium': '🟡',
            'high': '🔴'
        };
        return emojiMap[priority] || '⚪';
    }

    private getCategoryEmoji(category: string): string {
        const emojiMap: Record<string, string> = {
            'bug-fix': '🐛',
            'performance': '⚡',
            'security': '🔒',
            'ui-ux': '🎨',
            'api': '🔌',
            'database': '💾',
            'testing': '🧪',
            'deployment': '🚀',
            'learning': '📚',
            'general': '📝'
        };
        return emojiMap[category] || '📝';
    }

    private getSolutionTypeDescription(solutionType: string): string {
        const typeMap: Record<string, string> = {
            'bug-fix': '错误修复',
            'optimization': '性能优化',
            'new-feature': '新功能开发',
            'learning': '学习总结',
            'other': '其他'
        };
        return typeMap[solutionType] || '其他';
    }

    private generateStarRating(score: number): string {
        const fullStars = Math.floor(score);
        const halfStar = score % 1 >= 0.5 ? 1 : 0;
        const emptyStars = 10 - fullStars - halfStar;

        return '⭐'.repeat(fullStars) +
            (halfStar ? '⭐' : '') +
            '☆'.repeat(emptyStars);
    }
}
