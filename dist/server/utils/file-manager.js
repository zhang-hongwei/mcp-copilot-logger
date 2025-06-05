"use strict";
exports.__esModule = true;
exports.FileManager = void 0;
var fs_1 = require("fs");
var path_1 = require("path");
var FileManager = /** @class */ (function () {
    function FileManager(basePath) {
        this.basePath = basePath;
    }
    FileManager.prototype.readFile = function (filePath) {
        var _this = this;
        return new Promise(function (resolve, reject) {
            fs_1["default"].readFile(path_1["default"].join(_this.basePath, filePath), 'utf-8', function (err, data) {
                if (err) {
                    return reject(err);
                }
                resolve(data);
            });
        });
    };
    FileManager.prototype.writeFile = function (filePath, content) {
        var _this = this;
        return new Promise(function (resolve, reject) {
            fs_1["default"].writeFile(path_1["default"].join(_this.basePath, filePath), content, 'utf-8', function (err) {
                if (err) {
                    return reject(err);
                }
                resolve();
            });
        });
    };
    FileManager.prototype.fileExists = function (filePath) {
        var _this = this;
        return new Promise(function (resolve) {
            fs_1["default"].access(path_1["default"].join(_this.basePath, filePath), fs_1["default"].constants.F_OK, function (err) {
                resolve(!err);
            });
        });
    };
    FileManager.prototype.createDirectory = function (dirPath) {
        var _this = this;
        return new Promise(function (resolve, reject) {
            fs_1["default"].mkdir(path_1["default"].join(_this.basePath, dirPath), { recursive: true }, function (err) {
                if (err) {
                    return reject(err);
                }
                resolve();
            });
        });
    };
    return FileManager;
}());
exports.FileManager = FileManager;
