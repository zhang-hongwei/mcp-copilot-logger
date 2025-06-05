"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.exportToObsidian = exports.ObsidianExporter = void 0;
const file_manager_1 = require("../utils/file-manager");
const obsidian_template_generator_1 = require("../utils/obsidian-template-generator");
const config_manager_1 = require("../utils/config-manager");
const problem_tracker_1 = require("./problem-tracker");
const fs = __importStar(require("fs"));
const path = __importStar(require("path"));
class ObsidianExporter {
    constructor(config) {
        // 使用配置管理器获取统一配置，或使用传入的配置
        this.config = config || config_manager_1.configManager.getObsidianConfig();
        this.fileManager = new file_manager_1.FileManager(this.config.vaultPath);
        this.templateGenerator = new obsidian_template_generator_1.ObsidianTemplateGenerator();
        // 确保 Obsidian 目录存在
        config_manager_1.configManager.ensureObsidianDirectories();
    }
    async exportProblemRecord(record) {
        const markdownContent = this.templateGenerator.generateProblemTemplate(record, 0);
        const filePath = this.getFilePath(record.timestamp, record.title || record.description);
        await this.fileManager.writeFile(filePath, markdownContent);
    }
    /**
     * 导出高价值问题集合
     */
    async exportHighValueProblems(filterOptions) {
        // 获取符合条件的问题
        const allProblems = (0, problem_tracker_1.getProblems)({
            worthExporting: true,
            minValueScore: filterOptions?.minValueScore || 6,
            tags: filterOptions?.tags,
            category: filterOptions?.category
        });
        if (allProblems.length === 0) {
            throw new Error('没有找到符合导出条件的高价值问题');
        }
        // 生成完整的导出文档
        const exportType = filterOptions?.exportType || 'high-value-problems';
        const markdownContent = this.templateGenerator.generateFullExportTemplate(allProblems, exportType);
        // 生成文件路径
        const timestamp = new Date().toISOString().split('T')[0];
        const fileName = `MCP问题整理_${timestamp}.md`;
        const exportPath = path.join(this.config.vaultPath, 'MCP问题整理', fileName);
        // 确保目录存在
        const dir = path.dirname(exportPath);
        if (!fs.existsSync(dir)) {
            fs.mkdirSync(dir, { recursive: true });
        }
        // 写入文件
        fs.writeFileSync(exportPath, markdownContent, 'utf8');
        return {
            exportPath,
            fileCount: 1,
            problemCount: allProblems.length
        };
    }
    getFilePath(timestamp, title) {
        const date = new Date(timestamp).toISOString().split('T')[0];
        const sanitizedTitle = title.replace(/[^a-zA-Z0-9\u4e00-\u9fa5]/g, '-');
        return `${this.config.problemRecordsFolder}/${date}-${sanitizedTitle}.md`;
    }
}
exports.ObsidianExporter = ObsidianExporter;
// Export function for backward compatibility with enhanced functionality
const exportToObsidian = async (problemIds, options) => {
    // 使用配置管理器获取 Obsidian Vault 路径
    const obsidianConfig = config_manager_1.configManager.getObsidianConfig();
    const outputPath = options?.outputPath || obsidianConfig.vaultPath;
    const format = options?.format || 'high-value-problems';
    try {
        // 确保 Obsidian 目录存在
        config_manager_1.configManager.ensureObsidianDirectories();
        // 创建导出器
        const exporter = new ObsidianExporter(obsidianConfig);
        // 如果指定了问题ID，按ID导出；否则导出所有高价值问题
        if (problemIds && problemIds.length > 0) {
            // 按ID筛选问题
            const allProblems = (0, problem_tracker_1.getProblems)({ worthExporting: true });
            const selectedProblems = allProblems.filter(p => problemIds.includes(p.id));
            if (selectedProblems.length === 0) {
                throw new Error('指定的问题ID未找到或不符合导出条件');
            }
            // 使用模板生成器
            const templateGenerator = new obsidian_template_generator_1.ObsidianTemplateGenerator();
            const content = templateGenerator.generateFullExportTemplate(selectedProblems, format);
            const timestamp = new Date().toISOString().split('T')[0];
            const fileName = `问题导出_${timestamp}.md`;
            const fullPath = path.join(obsidianConfig.problemRecordsFolder, fileName);
            // 确保目录存在
            if (!fs.existsSync(obsidianConfig.problemRecordsFolder)) {
                fs.mkdirSync(obsidianConfig.problemRecordsFolder, { recursive: true });
            }
            fs.writeFileSync(fullPath, content, 'utf8');
            return {
                exportPath: fullPath,
                fileCount: 1,
                problemCount: selectedProblems.length
            };
        }
        else {
            // 导出所有高价值问题
            try {
                const result = await exporter.exportHighValueProblems({
                    minValueScore: options?.minValueScore || config_manager_1.configManager.getMinExportScore(),
                    tags: options?.tags,
                    exportType: format
                });
                return result;
            }
            catch (error) {
                throw error; // 让外层的 catch 处理
            }
        }
    }
    catch (error) {
        // 错误处理：创建错误报告
        const timestamp = new Date().toISOString().split('T')[0];
        const fileName = `导出错误_${timestamp}.md`;
        const errorPath = path.join(obsidianConfig.vaultPath, '错误报告');
        // 确保错误报告目录存在
        if (!fs.existsSync(errorPath)) {
            fs.mkdirSync(errorPath, { recursive: true });
        }
        const fullPath = path.join(errorPath, fileName);
        const errorContent = `# 导出错误报告\n\n**错误时间**: ${new Date().toISOString()}\n\n**错误信息**: ${error instanceof Error ? error.message : '未知错误'}\n\n**请检查**:\n- Obsidian vault 路径是否正确: ${obsidianConfig.vaultPath}\n- 是否有写入权限\n- 是否有符合导出条件的问题记录`;
        fs.writeFileSync(fullPath, errorContent, 'utf8');
        return {
            exportPath: fullPath,
            fileCount: 1,
            problemCount: 0
        };
    }
};
exports.exportToObsidian = exportToObsidian;
