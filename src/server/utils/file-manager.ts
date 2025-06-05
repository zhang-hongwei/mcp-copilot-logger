import fs from 'fs';
import path from 'path';

export class FileManager {
    private basePath: string;

    constructor(basePath: string) {
        this.basePath = basePath;
    }

    public readFile(filePath: string): Promise<string> {
        return new Promise((resolve, reject) => {
            fs.readFile(path.join(this.basePath, filePath), 'utf-8', (err, data) => {
                if (err) {
                    return reject(err);
                }
                resolve(data);
            });
        });
    }

    public writeFile(filePath: string, content: string): Promise<void> {
        return new Promise((resolve, reject) => {
            fs.writeFile(path.join(this.basePath, filePath), content, 'utf-8', (err) => {
                if (err) {
                    return reject(err);
                }
                resolve();
            });
        });
    }

    public fileExists(filePath: string): Promise<boolean> {
        return new Promise((resolve) => {
            fs.access(path.join(this.basePath, filePath), fs.constants.F_OK, (err) => {
                resolve(!err);
            });
        });
    }

    public createDirectory(dirPath: string): Promise<void> {
        return new Promise((resolve, reject) => {
            fs.mkdir(path.join(this.basePath, dirPath), { recursive: true }, (err) => {
                if (err) {
                    return reject(err);
                }
                resolve();
            });
        });
    }
}