import * as fs from 'fs';
import * as path from 'path';
import { ObsidianConfig } from '../../types/obsidian-config';

export interface MCPConfig {
    logLevel: string;
    outputDirectory: string;
    autoLog: boolean;
    gitHook: {
        enabled: boolean;
        hookType: string;
    };
    obsidian: {
        enabled: boolean;
        vaultPath: string;
        defaultFolder: string;
        problemRecordsFolder?: string;
        valueAssessmentsFolder?: string;
        dailyLogsFolder?: string;
        iterationReportsFolder?: string;
        namingConvention?: string;
        enableAutoLinking?: boolean;
        defaultTags?: string[];
    };
    valueAssessment: {
        enabled: boolean;
        criteria: string[];
        minExportScore?: number;
        exportWorthyThreshold?: number;
    };
}

export class ConfigManager {
    private static instance: ConfigManager;
    private config!: MCPConfig;  // 使用 definite assignment assertion
    private configPath: string;

    private constructor() {
        this.configPath = path.join(process.cwd(), '.mcp', 'config.json');
        this.loadConfig();
    }

    public static getInstance(): ConfigManager {
        if (!ConfigManager.instance) {
            ConfigManager.instance = new ConfigManager();
        }
        return ConfigManager.instance;
    }

    private loadConfig(): void {
        try {
            if (fs.existsSync(this.configPath)) {
                const configContent = fs.readFileSync(this.configPath, 'utf8');
                this.config = JSON.parse(configContent);
            } else {
                this.config = this.getDefaultConfig();
                this.saveConfig();
            }
        } catch (error) {
            console.warn('Failed to load config, using defaults:', error);
            this.config = this.getDefaultConfig();
        }
    }

    private getDefaultConfig(): MCPConfig {
        return {
            logLevel: 'info',
            outputDirectory: './.mcp/logs',
            autoLog: true,
            gitHook: {
                enabled: true,
                hookType: 'pre-commit'
            },
            obsidian: {
                enabled: true,
                vaultPath: '/Users/zhw/Documents/Obsidian Vault/mcp-copilot-logger',
                defaultFolder: 'DevLogs',
                problemRecordsFolder: '问题记录',
                valueAssessmentsFolder: '价值评估',
                dailyLogsFolder: '每日日志',
                iterationReportsFolder: '迭代报告',
                namingConvention: 'YYYY-MM-DD-title',
                enableAutoLinking: true,
                defaultTags: ['MCP', '问题解决', '开发日志']
            },
            valueAssessment: {
                enabled: true,
                criteria: ['timeSpent', 'complexity', 'reusability'],
                minExportScore: 6,
                exportWorthyThreshold: 0.7
            }
        };
    }

    private saveConfig(): void {
        try {
            const configDir = path.dirname(this.configPath);
            if (!fs.existsSync(configDir)) {
                fs.mkdirSync(configDir, { recursive: true });
            }
            fs.writeFileSync(this.configPath, JSON.stringify(this.config, null, 2), 'utf8');
        } catch (error) {
            console.error('Failed to save config:', error);
        }
    }

    public getConfig(): MCPConfig {
        return this.config;
    }

    public getObsidianConfig(): ObsidianConfig {
        const obsidianSettings = this.config.obsidian;
        const vaultPath = obsidianSettings.vaultPath;

        return {
            vaultPath,
            devLogsFolder: path.join(vaultPath, obsidianSettings.dailyLogsFolder || 'DevLogs'),
            problemRecordsFolder: path.join(vaultPath, obsidianSettings.problemRecordsFolder || '问题记录'),
            valueAssessmentsFolder: path.join(vaultPath, obsidianSettings.valueAssessmentsFolder || '价值评估'),
            namingConvention: obsidianSettings.namingConvention || 'YYYY-MM-DD-title',
            tags: obsidianSettings.defaultTags || ['MCP', '问题解决'],
            enableAutoLinking: obsidianSettings.enableAutoLinking ?? true
        };
    }

    public getObsidianVaultPath(): string {
        return this.config.obsidian.vaultPath;
    }

    public getMinExportScore(): number {
        return this.config.valueAssessment.minExportScore || 6;
    }

    public getExportWorthyThreshold(): number {
        return this.config.valueAssessment.exportWorthyThreshold || 0.7;
    }

    public ensureObsidianDirectories(): void {
        const obsidianConfig = this.getObsidianConfig();
        const directories = [
            obsidianConfig.vaultPath,
            obsidianConfig.devLogsFolder,
            obsidianConfig.problemRecordsFolder,
            obsidianConfig.valueAssessmentsFolder
        ];

        directories.forEach(dir => {
            if (!fs.existsSync(dir)) {
                fs.mkdirSync(dir, { recursive: true });
                console.log(`Created Obsidian directory: ${dir}`);
            }
        });
    }

    public updateObsidianVaultPath(newPath: string): void {
        this.config.obsidian.vaultPath = newPath;
        this.saveConfig();
        console.log(`Updated Obsidian vault path to: ${newPath}`);
    }
}

// 导出单例实例
export const configManager = ConfigManager.getInstance();
