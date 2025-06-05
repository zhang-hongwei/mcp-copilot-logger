import { ProblemRecord } from '../../types/problem-record';
import { ObsidianConfig } from '../../types/obsidian-config';
import { FileManager } from '../utils/file-manager';
import { ObsidianTemplateGenerator } from '../utils/obsidian-template-generator';
import { configManager } from '../utils/config-manager';
import { getProblems } from './problem-tracker';
import * as fs from 'fs';
import * as path from 'path';

/**
 * 清理文件名，确保符合文件系统要求并保持可读性
 */
function sanitizeFileName(title: string): string {
    return title
        .replace(/[<>:"/\\|?*]/g, '') // 移除文件系统不允许的字符
        .replace(/\s+/g, '_') // 空格替换为下划线
        .replace(/_{2,}/g, '_') // 多个连续下划线合并为一个
        .replace(/^_+|_+$/g, '') // 移除开头和结尾的下划线
        .substring(0, 100); // 限制长度避免文件名过长
}

export class ObsidianExporter {
    private config: ObsidianConfig;
    private fileManager: FileManager;
    private templateGenerator: ObsidianTemplateGenerator;

    constructor(config?: ObsidianConfig) {
        // 使用配置管理器获取统一配置，或使用传入的配置
        this.config = config || configManager.getObsidianConfig();
        this.fileManager = new FileManager(this.config.vaultPath);
        this.templateGenerator = new ObsidianTemplateGenerator();

        // 确保 Obsidian 目录存在
        configManager.ensureObsidianDirectories();
    }

    public async exportProblemRecord(record: ProblemRecord): Promise<void> {
        const markdownContent = this.templateGenerator.generateProblemTemplate(record, 0);
        const filePath = this.getFilePath(record.timestamp, record.title || record.description);
        await this.fileManager.writeFile(filePath, markdownContent);
    }

    /**
     * 导出高价值问题集合
     */
    public async exportHighValueProblems(
        filterOptions?: {
            minValueScore?: number;
            tags?: string[];
            category?: string;
            exportType?: string;
        }
    ): Promise<{ exportPath: string; fileCount: number; problemCount: number }> {

        // 获取符合条件的问题
        const allProblems = getProblems({
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

        // 生成文件路径 - 使用时间戳确保唯一性
        const now = new Date();
        const timestamp = now.toISOString().split('T')[0];
        const timeString = now.toTimeString().slice(0, 8).replace(/:/g, '-');
        const fileName = `MCP问题整理_${timestamp}_${timeString}.md`;
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

    private getFilePath(timestamp: string, title: string): string {
        const date = new Date(timestamp).toISOString().split('T')[0];
        const now = new Date();
        const timeString = now.toTimeString().slice(0, 8).replace(/:/g, '-');
        const sanitizedTitle = this.sanitizeFileName(title);
        return `${this.config.problemRecordsFolder}/${sanitizedTitle}_${date}_${timeString}.md`;
    }

    /**
     * 清理文件名，确保符合文件系统要求并保持可读性
     */
    private sanitizeFileName(title: string): string {
        return title
            .replace(/[<>:"/\\|?*]/g, '') // 移除文件系统不允许的字符
            .replace(/\s+/g, '_') // 空格替换为下划线
            .replace(/_{2,}/g, '_') // 多个连续下划线合并为一个
            .replace(/^_+|_+$/g, '') // 移除开头和结尾的下划线
            .substring(0, 100); // 限制长度避免文件名过长
    }
}

// Export function for backward compatibility with enhanced functionality
export const exportToObsidian = async (problemIds: string[], options?: {
    outputPath?: string;
    format?: string;
    minValueScore?: number;
    tags?: string[];
}): Promise<{ exportPath: string; fileCount: number; problemCount?: number }> => {
    // 使用配置管理器获取 Obsidian Vault 路径
    const obsidianConfig = configManager.getObsidianConfig();
    const outputPath = options?.outputPath || obsidianConfig.vaultPath;
    const format = options?.format || 'high-value-problems';

    try {
        // 确保 Obsidian 目录存在
        configManager.ensureObsidianDirectories();

        // 创建导出器
        const exporter = new ObsidianExporter(obsidianConfig);

        // 如果指定了问题ID，按ID导出；否则导出所有高价值问题
        if (problemIds && problemIds.length > 0) {
            // 按ID筛选问题
            const allProblems = getProblems({ worthExporting: true });
            const selectedProblems = allProblems.filter(p => problemIds.includes(p.id!));

            if (selectedProblems.length === 0) {
                throw new Error('指定的问题ID未找到或不符合导出条件');
            }

            // 使用模板生成器
            const templateGenerator = new ObsidianTemplateGenerator();
            const content = templateGenerator.generateFullExportTemplate(selectedProblems, format);

            // 生成唯一文件名 - 如果只有一个问题，使用问题标题；否则使用时间戳
            let fileName: string;
            if (selectedProblems.length === 1) {
                const sanitizedTitle = sanitizeFileName(selectedProblems[0].title || selectedProblems[0].description);
                const now = new Date();
                const date = now.toISOString().split('T')[0];
                const timeString = now.toTimeString().slice(0, 8).replace(/:/g, '-');
                fileName = `${sanitizedTitle}_${date}_${timeString}.md`;
            } else {
                const now = new Date();
                const timestamp = now.toISOString().split('T')[0];
                const timeString = now.toTimeString().slice(0, 8).replace(/:/g, '-');
                fileName = `问题导出_${timestamp}_${timeString}.md`;
            }

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
        } else {
            // 导出所有高价值问题
            try {
                const result = await exporter.exportHighValueProblems({
                    minValueScore: options?.minValueScore || configManager.getMinExportScore(),
                    tags: options?.tags,
                    exportType: format
                });

                return result;
            } catch (error) {
                throw error; // 让外层的 catch 处理
            }
        }
    } catch (error) {
        // 错误处理：创建错误报告
        const now = new Date();
        const timestamp = now.toISOString().split('T')[0];
        const timeString = now.toTimeString().slice(0, 8).replace(/:/g, '-');
        const fileName = `导出错误_${timestamp}_${timeString}.md`;
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