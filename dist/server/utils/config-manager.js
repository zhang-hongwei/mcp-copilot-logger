"use strict";
exports.__esModule = true;
exports.configManager = exports.ConfigManager = void 0;
var fs = require("fs");
var path = require("path");
var ConfigManager = /** @class */ (function () {
    function ConfigManager() {
        this.configPath = path.join(process.cwd(), '.mcp', 'config.json');
        this.loadConfig();
    }
    ConfigManager.getInstance = function () {
        if (!ConfigManager.instance) {
            ConfigManager.instance = new ConfigManager();
        }
        return ConfigManager.instance;
    };
    ConfigManager.prototype.loadConfig = function () {
        try {
            if (fs.existsSync(this.configPath)) {
                var configContent = fs.readFileSync(this.configPath, 'utf8');
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
    };
    ConfigManager.prototype.getDefaultConfig = function () {
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
    };
    ConfigManager.prototype.saveConfig = function () {
        try {
            var configDir = path.dirname(this.configPath);
            if (!fs.existsSync(configDir)) {
                fs.mkdirSync(configDir, { recursive: true });
            }
            fs.writeFileSync(this.configPath, JSON.stringify(this.config, null, 2), 'utf8');
        }
        catch (error) {
            console.error('Failed to save config:', error);
        }
    };
    ConfigManager.prototype.getConfig = function () {
        return this.config;
    };
    ConfigManager.prototype.getObsidianConfig = function () {
        var _a;
        var obsidianSettings = this.config.obsidian;
        var vaultPath = obsidianSettings.vaultPath;
        return {
            vaultPath: vaultPath,
            devLogsFolder: path.join(vaultPath, obsidianSettings.dailyLogsFolder || 'DevLogs'),
            problemRecordsFolder: path.join(vaultPath, obsidianSettings.problemRecordsFolder || '问题记录'),
            valueAssessmentsFolder: path.join(vaultPath, obsidianSettings.valueAssessmentsFolder || '价值评估'),
            namingConvention: obsidianSettings.namingConvention || 'YYYY-MM-DD-title',
            tags: obsidianSettings.defaultTags || ['MCP', '问题解决'],
            enableAutoLinking: (_a = obsidianSettings.enableAutoLinking) !== null && _a !== void 0 ? _a : true
        };
    };
    ConfigManager.prototype.getObsidianVaultPath = function () {
        return this.config.obsidian.vaultPath;
    };
    ConfigManager.prototype.getMinExportScore = function () {
        return this.config.valueAssessment.minExportScore || 6;
    };
    ConfigManager.prototype.getExportWorthyThreshold = function () {
        return this.config.valueAssessment.exportWorthyThreshold || 0.7;
    };
    ConfigManager.prototype.ensureObsidianDirectories = function () {
        var obsidianConfig = this.getObsidianConfig();
        var directories = [
            obsidianConfig.vaultPath,
            obsidianConfig.devLogsFolder,
            obsidianConfig.problemRecordsFolder,
            obsidianConfig.valueAssessmentsFolder
        ];
        directories.forEach(function (dir) {
            if (!fs.existsSync(dir)) {
                fs.mkdirSync(dir, { recursive: true });
                console.log("Created Obsidian directory: ".concat(dir));
            }
        });
    };
    ConfigManager.prototype.updateObsidianVaultPath = function (newPath) {
        this.config.obsidian.vaultPath = newPath;
        this.saveConfig();
        console.log("Updated Obsidian vault path to: ".concat(newPath));
    };
    return ConfigManager;
}());
exports.ConfigManager = ConfigManager;
// 导出单例实例
exports.configManager = ConfigManager.getInstance();
