"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.FileManager = void 0;
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
class FileManager {
    constructor(basePath) {
        this.basePath = basePath;
    }
    readFile(filePath) {
        return new Promise((resolve, reject) => {
            fs_1.default.readFile(path_1.default.join(this.basePath, filePath), 'utf-8', (err, data) => {
                if (err) {
                    return reject(err);
                }
                resolve(data);
            });
        });
    }
    writeFile(filePath, content) {
        return new Promise((resolve, reject) => {
            fs_1.default.writeFile(path_1.default.join(this.basePath, filePath), content, 'utf-8', (err) => {
                if (err) {
                    return reject(err);
                }
                resolve();
            });
        });
    }
    fileExists(filePath) {
        return new Promise((resolve) => {
            fs_1.default.access(path_1.default.join(this.basePath, filePath), fs_1.default.constants.F_OK, (err) => {
                resolve(!err);
            });
        });
    }
    createDirectory(dirPath) {
        return new Promise((resolve, reject) => {
            fs_1.default.mkdir(path_1.default.join(this.basePath, dirPath), { recursive: true }, (err) => {
                if (err) {
                    return reject(err);
                }
                resolve();
            });
        });
    }
}
exports.FileManager = FileManager;
