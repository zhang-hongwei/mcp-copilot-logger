"use strict";
/**
 * 高质量的 Obsidian 导出模板生成器
 */
exports.__esModule = true;
exports.ObsidianTemplateGenerator = void 0;
var ObsidianTemplateGenerator = /** @class */ (function () {
    function ObsidianTemplateGenerator() {
    }
    /**
     * 生成单个问题的详细 Markdown 模板
     */
    ObsidianTemplateGenerator.prototype.generateProblemTemplate = function (record, index) {
        var tagsString = record.tags.map(function (tag) { return "#".concat(tag); }).join(' ');
        var priorityEmoji = this.getPriorityEmoji(record.priority);
        var categoryEmoji = this.getCategoryEmoji(record.category);
        return "\n## \u2705 \u95EE\u9898 ".concat(index + 1, "\uFF1A").concat(record.title, "\n> \uD83C\uDD94 ID: ").concat(record.id, "  \n> \uD83D\uDDD3 \u8BB0\u5F55\u65F6\u95F4\uFF1A").concat(this.formatTimestamp(record.timestamp), "  \n> \uD83C\uDFF7 \u6807\u7B7E: ").concat(tagsString, "  \n> ").concat(priorityEmoji, " \u4F18\u5148\u7EA7: ").concat(record.priority, "  \n> ").concat(categoryEmoji, " \u5206\u7C7B: ").concat(record.category, "\n\n### \uD83C\uDFAF \u95EE\u9898\u80CC\u666F\n").concat(record.context || '无详细背景信息', "\n\n").concat(this.generateCodeSection(record), "\n\n### \uD83D\uDD0D \u9519\u8BEF\u73B0\u8C61\n").concat(record.errorPhenomenon, "\n\n").concat(this.generateAttemptsSection(record.attempts), "\n\n### \uD83D\uDEE0 \u89E3\u51B3\u65B9\u6848\n").concat(record.finalSolution, "\n\n**\u89E3\u51B3\u65B9\u6848\u7C7B\u578B**: ").concat(this.getSolutionTypeDescription(record.solutionType), "\n\n### \uD83D\uDCA1 \u4EF7\u503C\u5206\u6790\n**\u8BC4\u5206**: ").concat(this.generateStarRating(record.valueScore), "/10\n\n**\u4EF7\u503C\u8BF4\u660E**:\n").concat(record.valueExplanation, "\n\n**\u5B66\u4E60\u6536\u83B7**:\n").concat(record.learningOutcome, "\n\n").concat(record.preventionStrategy ? "**\u9884\u9632\u7B56\u7565**:\n".concat(record.preventionStrategy) : '', "\n\n").concat(this.generateRelatedSection(record), "\n\n---\n");
    };
    /**
     * 生成完整的导出文档模板
     */
    ObsidianTemplateGenerator.prototype.generateFullExportTemplate = function (records, exportType) {
        var _this = this;
        if (exportType === void 0) { exportType = 'daily-log'; }
        var exportTime = new Date().toISOString();
        var formattedDate = this.formatTimestamp(exportTime);
        // 筛选高价值问题
        var highValueRecords = records.filter(function (r) {
            return r.isWorthExporting && r.valueScore >= 6;
        });
        var header = "# \uD83D\uDCCC MCP \u95EE\u9898\u6574\u7406\u5BFC\u51FA\n\n> \u23F1 \u5BFC\u51FA\u65F6\u95F4\uFF1A".concat(formattedDate, "  \n> \uD83D\uDD22 \u5171\u5BFC\u51FA\u95EE\u9898\uFF1A").concat(highValueRecords.length, " \u4E2A  \n> \uD83D\uDCCA \u7B5B\u9009\u6807\u51C6\uFF1A\u4EF7\u503C\u8BC4\u5206 \u2265 6 \u5206\u4E14\u6807\u8BB0\u4E3A\"\u503C\u5F97\u5BFC\u51FA\"\n\n").concat(this.generateSummarySection(highValueRecords), "\n\n---\n");
        var problemSections = highValueRecords.map(function (record, index) {
            return _this.generateProblemTemplate(record, index);
        }).join('\n');
        var footer = "\n---\n\n## \uD83D\uDCDA \u6587\u6863\u5143\u4FE1\u606F\n\n- **\u5BFC\u51FA\u7C7B\u578B**: ".concat(exportType, "\n- **\u751F\u6210\u5DE5\u5177**: MCP Copilot Logger\n- **\u6587\u6863\u7248\u672C**: v1.0\n- **\u6700\u540E\u66F4\u65B0**: ").concat(formattedDate, "\n\n### \uD83D\uDD17 \u76F8\u5173\u94FE\u63A5\n- [[MCP\u5F00\u53D1\u6307\u5357]]\n- [[\u95EE\u9898\u89E3\u51B3\u65B9\u6CD5\u8BBA]]\n- [[\u6280\u672F\u5B66\u4E60\u7B14\u8BB0]]\n\n### \uD83C\uDFF7\uFE0F \u6587\u6863\u6807\u7B7E\n#MCP #\u95EE\u9898\u89E3\u51B3 #\u6280\u672F\u6587\u6863 #\u5F00\u53D1\u65E5\u5FD7\n");
        return header + problemSections + footer;
    };
    /**
     * 生成汇总统计信息
     */
    ObsidianTemplateGenerator.prototype.generateSummarySection = function (records) {
        var _this = this;
        if (records.length === 0) {
            return '## 📊 本次导出无高价值问题';
        }
        var stats = this.calculateStatistics(records);
        return "\n## \uD83D\uDCCA \u672C\u6B21\u5BFC\u51FA\u7EDF\u8BA1\n\n### \u6309\u5206\u7C7B\u7EDF\u8BA1\n".concat(Object.entries(stats.byCategory).map(function (_a) {
            var category = _a[0], count = _a[1];
            return "- ".concat(_this.getCategoryEmoji(category), " ").concat(category, ": ").concat(count, " \u4E2A");
        }).join('\n'), "\n\n### \u6309\u4EF7\u503C\u8BC4\u5206\u7EDF\u8BA1\n").concat(Object.entries(stats.byScore).map(function (_a) {
            var score = _a[0], count = _a[1];
            return "- ".concat(score, "\u5206: ").concat(count, " \u4E2A");
        }).join('\n'), "\n\n### \u70ED\u95E8\u6807\u7B7E\n").concat(stats.topTags.slice(0, 5).map(function (_a) {
            var tag = _a[0], count = _a[1];
            return "- #".concat(tag, ": ").concat(count, " \u6B21");
        }).join('\n'), "\n");
    };
    /**
     * 生成代码对比部分
     */
    ObsidianTemplateGenerator.prototype.generateCodeSection = function (record) {
        if (!record.codeBeforeChange && !record.codeAfterChange) {
            return '';
        }
        var language = record.codeLanguage || 'text';
        var codeSection = '\n### 💻 代码修改\n';
        if (record.codeBeforeChange) {
            codeSection += "\n**\u4FEE\u6539\u524D**:\n```".concat(language, "\n").concat(record.codeBeforeChange, "\n```\n");
        }
        if (record.codeAfterChange) {
            codeSection += "\n**\u4FEE\u6539\u540E**:\n```".concat(language, "\n").concat(record.codeAfterChange, "\n```\n");
        }
        return codeSection;
    };
    /**
     * 生成尝试过程部分
     */
    ObsidianTemplateGenerator.prototype.generateAttemptsSection = function (attempts) {
        if (!attempts || attempts.length === 0) {
            return '';
        }
        var attemptsContent = attempts.map(function (attempt, index) {
            if (typeof attempt === 'string') {
                return "".concat(index + 1, ". ").concat(attempt);
            }
            else {
                return "".concat(index + 1, ". **").concat(attempt.action, "** - ").concat(attempt.result);
            }
        }).join('\n');
        return "\n### \uD83E\uDDEA \u5C1D\u8BD5\u8FC7\u7A0B\n".concat(attemptsContent, "\n");
    };
    /**
     * 生成相关信息部分
     */
    ObsidianTemplateGenerator.prototype.generateRelatedSection = function (record) {
        var relatedSection = '';
        if (record.relatedIssues && record.relatedIssues.length > 0) {
            relatedSection += "\n**\u76F8\u5173\u95EE\u9898**:\n".concat(record.relatedIssues.map(function (id) { return "- [[\u95EE\u9898-".concat(id, "]]"); }).join('\n'), "\n");
        }
        if (record.references && record.references.length > 0) {
            relatedSection += "\n**\u53C2\u8003\u8D44\u6599**:\n".concat(record.references.map(function (ref) { return "- ".concat(ref); }).join('\n'), "\n");
        }
        return relatedSection;
    };
    /**
     * 计算统计信息
     */
    ObsidianTemplateGenerator.prototype.calculateStatistics = function (records) {
        var byCategory = {};
        var byScore = {};
        var tagCounts = {};
        records.forEach(function (record) {
            // 按分类统计
            byCategory[record.category] = (byCategory[record.category] || 0) + 1;
            // 按评分统计
            byScore[record.valueScore.toString()] = (byScore[record.valueScore.toString()] || 0) + 1;
            // 标签统计
            record.tags.forEach(function (tag) {
                tagCounts[tag] = (tagCounts[tag] || 0) + 1;
            });
        });
        var topTags = Object.entries(tagCounts)
            .sort(function (_a, _b) {
            var a = _a[1];
            var b = _b[1];
            return b - a;
        })
            .slice(0, 10);
        return { byCategory: byCategory, byScore: byScore, topTags: topTags };
    };
    /**
     * 辅助方法
     */
    ObsidianTemplateGenerator.prototype.formatTimestamp = function (timestamp) {
        return new Date(timestamp).toLocaleString('zh-CN', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit'
        });
    };
    ObsidianTemplateGenerator.prototype.getPriorityEmoji = function (priority) {
        var emojiMap = {
            'low': '🟢',
            'medium': '🟡',
            'high': '🔴'
        };
        return emojiMap[priority] || '⚪';
    };
    ObsidianTemplateGenerator.prototype.getCategoryEmoji = function (category) {
        var emojiMap = {
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
    };
    ObsidianTemplateGenerator.prototype.getSolutionTypeDescription = function (solutionType) {
        var typeMap = {
            'bug-fix': '错误修复',
            'optimization': '性能优化',
            'new-feature': '新功能开发',
            'learning': '学习总结',
            'other': '其他'
        };
        return typeMap[solutionType] || '其他';
    };
    ObsidianTemplateGenerator.prototype.generateStarRating = function (score) {
        var fullStars = Math.floor(score);
        var halfStar = score % 1 >= 0.5 ? 1 : 0;
        var emptyStars = 10 - fullStars - halfStar;
        return '⭐'.repeat(fullStars) +
            (halfStar ? '⭐' : '') +
            '☆'.repeat(emptyStars);
    };
    return ObsidianTemplateGenerator;
}());
exports.ObsidianTemplateGenerator = ObsidianTemplateGenerator;
