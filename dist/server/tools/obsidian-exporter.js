"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
exports.__esModule = true;
exports.exportToObsidian = exports.ObsidianExporter = void 0;
var file_manager_1 = require("../utils/file-manager");
var obsidian_template_generator_1 = require("../utils/obsidian-template-generator");
var config_manager_1 = require("../utils/config-manager");
var problem_tracker_1 = require("./problem-tracker");
var fs = require("fs");
var path = require("path");
/**
 * 清理文件名，确保符合文件系统要求并保持可读性
 */
function sanitizeFileName(title) {
    return title
        .replace(/[<>:"/\\|?*]/g, '') // 移除文件系统不允许的字符
        .replace(/\s+/g, '_') // 空格替换为下划线
        .replace(/_{2,}/g, '_') // 多个连续下划线合并为一个
        .replace(/^_+|_+$/g, '') // 移除开头和结尾的下划线
        .substring(0, 100); // 限制长度避免文件名过长
}
var ObsidianExporter = /** @class */ (function () {
    function ObsidianExporter(config) {
        // 使用配置管理器获取统一配置，或使用传入的配置
        this.config = config || config_manager_1.configManager.getObsidianConfig();
        this.fileManager = new file_manager_1.FileManager(this.config.vaultPath);
        this.templateGenerator = new obsidian_template_generator_1.ObsidianTemplateGenerator();
        // 确保 Obsidian 目录存在
        config_manager_1.configManager.ensureObsidianDirectories();
    }
    ObsidianExporter.prototype.exportProblemRecord = function (record) {
        return __awaiter(this, void 0, void 0, function () {
            var markdownContent, filePath;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        markdownContent = this.templateGenerator.generateProblemTemplate(record, 0);
                        filePath = this.getFilePath(record.timestamp, record.title || record.description);
                        return [4 /*yield*/, this.fileManager.writeFile(filePath, markdownContent)];
                    case 1:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        });
    };
    /**
     * 导出高价值问题集合
     */
    ObsidianExporter.prototype.exportHighValueProblems = function (filterOptions) {
        return __awaiter(this, void 0, void 0, function () {
            var allProblems, exportType, markdownContent, now, timestamp, timeString, fileName, exportPath, dir;
            return __generator(this, function (_a) {
                allProblems = (0, problem_tracker_1.getProblems)({
                    worthExporting: true,
                    minValueScore: (filterOptions === null || filterOptions === void 0 ? void 0 : filterOptions.minValueScore) || 6,
                    tags: filterOptions === null || filterOptions === void 0 ? void 0 : filterOptions.tags,
                    category: filterOptions === null || filterOptions === void 0 ? void 0 : filterOptions.category
                });
                if (allProblems.length === 0) {
                    throw new Error('没有找到符合导出条件的高价值问题');
                }
                exportType = (filterOptions === null || filterOptions === void 0 ? void 0 : filterOptions.exportType) || 'high-value-problems';
                markdownContent = this.templateGenerator.generateFullExportTemplate(allProblems, exportType);
                now = new Date();
                timestamp = now.toISOString().split('T')[0];
                timeString = now.toTimeString().slice(0, 8).replace(/:/g, '-');
                fileName = "MCP\u95EE\u9898\u6574\u7406_".concat(timestamp, "_").concat(timeString, ".md");
                exportPath = path.join(this.config.vaultPath, 'MCP问题整理', fileName);
                dir = path.dirname(exportPath);
                if (!fs.existsSync(dir)) {
                    fs.mkdirSync(dir, { recursive: true });
                }
                // 写入文件
                fs.writeFileSync(exportPath, markdownContent, 'utf8');
                return [2 /*return*/, {
                        exportPath: exportPath,
                        fileCount: 1,
                        problemCount: allProblems.length
                    }];
            });
        });
    };
    ObsidianExporter.prototype.getFilePath = function (timestamp, title) {
        var date = new Date(timestamp).toISOString().split('T')[0];
        var now = new Date();
        var timeString = now.toTimeString().slice(0, 8).replace(/:/g, '-');
        var sanitizedTitle = this.sanitizeFileName(title);
        return "".concat(this.config.problemRecordsFolder, "/").concat(sanitizedTitle, "_").concat(date, "_").concat(timeString, ".md");
    };
    /**
     * 清理文件名，确保符合文件系统要求并保持可读性
     */
    ObsidianExporter.prototype.sanitizeFileName = function (title) {
        return title
            .replace(/[<>:"/\\|?*]/g, '') // 移除文件系统不允许的字符
            .replace(/\s+/g, '_') // 空格替换为下划线
            .replace(/_{2,}/g, '_') // 多个连续下划线合并为一个
            .replace(/^_+|_+$/g, '') // 移除开头和结尾的下划线
            .substring(0, 100); // 限制长度避免文件名过长
    };
    return ObsidianExporter;
}());
exports.ObsidianExporter = ObsidianExporter;
// Export function for backward compatibility with enhanced functionality
var exportToObsidian = function (problemIds, options) { return __awaiter(void 0, void 0, void 0, function () {
    var obsidianConfig, outputPath, format, exporter, allProblems, selectedProblems, templateGenerator, content, fileName, sanitizedTitle, now, date, timeString, now, timestamp, timeString, fullPath, result, error_1, error_2, now, timestamp, timeString, fileName, errorPath, fullPath, errorContent;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                obsidianConfig = config_manager_1.configManager.getObsidianConfig();
                outputPath = (options === null || options === void 0 ? void 0 : options.outputPath) || obsidianConfig.vaultPath;
                format = (options === null || options === void 0 ? void 0 : options.format) || 'high-value-problems';
                _a.label = 1;
            case 1:
                _a.trys.push([1, 6, , 7]);
                // 确保 Obsidian 目录存在
                config_manager_1.configManager.ensureObsidianDirectories();
                exporter = new ObsidianExporter(obsidianConfig);
                if (!(problemIds && problemIds.length > 0)) return [3 /*break*/, 2];
                allProblems = (0, problem_tracker_1.getProblems)({ worthExporting: true });
                selectedProblems = allProblems.filter(function (p) { return problemIds.includes(p.id); });
                if (selectedProblems.length === 0) {
                    throw new Error('指定的问题ID未找到或不符合导出条件');
                }
                templateGenerator = new obsidian_template_generator_1.ObsidianTemplateGenerator();
                content = templateGenerator.generateFullExportTemplate(selectedProblems, format);
                fileName = void 0;
                if (selectedProblems.length === 1) {
                    sanitizedTitle = sanitizeFileName(selectedProblems[0].title || selectedProblems[0].description);
                    now = new Date();
                    date = now.toISOString().split('T')[0];
                    timeString = now.toTimeString().slice(0, 8).replace(/:/g, '-');
                    fileName = "".concat(sanitizedTitle, "_").concat(date, "_").concat(timeString, ".md");
                }
                else {
                    now = new Date();
                    timestamp = now.toISOString().split('T')[0];
                    timeString = now.toTimeString().slice(0, 8).replace(/:/g, '-');
                    fileName = "\u95EE\u9898\u5BFC\u51FA_".concat(timestamp, "_").concat(timeString, ".md");
                }
                fullPath = path.join(obsidianConfig.problemRecordsFolder, fileName);
                // 确保目录存在
                if (!fs.existsSync(obsidianConfig.problemRecordsFolder)) {
                    fs.mkdirSync(obsidianConfig.problemRecordsFolder, { recursive: true });
                }
                fs.writeFileSync(fullPath, content, 'utf8');
                return [2 /*return*/, {
                        exportPath: fullPath,
                        fileCount: 1,
                        problemCount: selectedProblems.length
                    }];
            case 2:
                _a.trys.push([2, 4, , 5]);
                return [4 /*yield*/, exporter.exportHighValueProblems({
                        minValueScore: (options === null || options === void 0 ? void 0 : options.minValueScore) || config_manager_1.configManager.getMinExportScore(),
                        tags: options === null || options === void 0 ? void 0 : options.tags,
                        exportType: format
                    })];
            case 3:
                result = _a.sent();
                return [2 /*return*/, result];
            case 4:
                error_1 = _a.sent();
                throw error_1; // 让外层的 catch 处理
            case 5: return [3 /*break*/, 7];
            case 6:
                error_2 = _a.sent();
                now = new Date();
                timestamp = now.toISOString().split('T')[0];
                timeString = now.toTimeString().slice(0, 8).replace(/:/g, '-');
                fileName = "\u5BFC\u51FA\u9519\u8BEF_".concat(timestamp, "_").concat(timeString, ".md");
                errorPath = path.join(obsidianConfig.vaultPath, '错误报告');
                // 确保错误报告目录存在
                if (!fs.existsSync(errorPath)) {
                    fs.mkdirSync(errorPath, { recursive: true });
                }
                fullPath = path.join(errorPath, fileName);
                errorContent = "# \u5BFC\u51FA\u9519\u8BEF\u62A5\u544A\n\n**\u9519\u8BEF\u65F6\u95F4**: ".concat(new Date().toISOString(), "\n\n**\u9519\u8BEF\u4FE1\u606F**: ").concat(error_2 instanceof Error ? error_2.message : '未知错误', "\n\n**\u8BF7\u68C0\u67E5**:\n- Obsidian vault \u8DEF\u5F84\u662F\u5426\u6B63\u786E: ").concat(obsidianConfig.vaultPath, "\n- \u662F\u5426\u6709\u5199\u5165\u6743\u9650\n- \u662F\u5426\u6709\u7B26\u5408\u5BFC\u51FA\u6761\u4EF6\u7684\u95EE\u9898\u8BB0\u5F55");
                fs.writeFileSync(fullPath, errorContent, 'utf8');
                return [2 /*return*/, {
                        exportPath: fullPath,
                        fileCount: 1,
                        problemCount: 0
                    }];
            case 7: return [2 /*return*/];
        }
    });
}); };
exports.exportToObsidian = exportToObsidian;
