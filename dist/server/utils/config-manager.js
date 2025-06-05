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
exports.configManager = exports.ConfigManager = void 0;
const fs = __importStar(require("fs"));
const path = __importStar(require("path"));
class ConfigManager {
    constructor() {
        this.configPath = path.join(process.cwd(), '.mcp', 'config.json');
        this.loadConfig();
    }
    static getInstance() {
        if (!ConfigManager.instance) {
            ConfigManager.instance = new ConfigManager();
        }
        return ConfigManager.instance;
    }
    loadConfig() {
        try {
            if (fs.existsSync(this.configPath)) {
                const configContent = fs.readFileSync(this.configPath, 'utf8');
                this.config = JSON.parse(configContent);
            }
            else {
                this.config = this.getDefaultConfig();
                this.saveConfig();
            }
        }
        catch (error) {
            console.warn('Failed to load config, using defaults:', error);
            this.config = this.getDefaultConfig();
        }
    }
    getDefaultConfig() {
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
    saveConfig() {
        try {
            const configDir = path.dirname(this.configPath);
            if (!fs.existsSync(configDir)) {
                fs.mkdirSync(configDir, { recursive: true });
            }
            fs.writeFileSync(this.configPath, JSON.stringify(this.config, null, 2), 'utf8');
        }
        catch (error) {
            console.error('Failed to save config:', error);
        }
    }
    getConfig() {
        return this.config;
    }
    getObsidianConfig() {
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
    getObsidianVaultPath() {
        return this.config.obsidian.vaultPath;
    }
    getMinExportScore() {
        return this.config.valueAssessment.minExportScore || 6;
    }
    getExportWorthyThreshold() {
        return this.config.valueAssessment.exportWorthyThreshold || 0.7;
    }
    ensureObsidianDirectories() {
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
    updateObsidianVaultPath(newPath) {
        this.config.obsidian.vaultPath = newPath;
        this.saveConfig();
        console.log(`Updated Obsidian vault path to: ${newPath}`);
    }
}
exports.ConfigManager = ConfigManager;
// 导出单例实例
exports.configManager = ConfigManager.getInstance();
