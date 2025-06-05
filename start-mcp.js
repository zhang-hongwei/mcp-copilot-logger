#!/usr/bin/env node

/**
 * MCP Copilot Logger 启动脚本
 * 这个脚本启动 MCP 服务器，使其能够与 GitHub Copilot 集成
 */

const { spawn } = require('child_process');
const path = require('path');
const fs = require('fs');

// 检查必要的文件是否存在
function checkPrerequisites(silent = false) {
    const requiredFiles = [
        'src/server/index.ts',
        'package.json',
        'tsconfig.json'
    ];

    for (const file of requiredFiles) {
        if (!fs.existsSync(path.join(__dirname, file))) {
            if (!silent) console.error(`❌ 缺少必要文件: ${file}`);
            process.exit(1);
        }
    }

    if (!silent) console.log('✅ 所有必要文件存在');
}

// 安装依赖
function installDependencies(silent = false) {
    if (!silent) console.log('📦 检查并安装依赖...');

    return new Promise((resolve, reject) => {
        const npm = spawn('npm', ['install'], {
            stdio: silent ? 'pipe' : 'inherit',
            cwd: __dirname
        });

        npm.on('close', (code) => {
            if (code === 0) {
                if (!silent) console.log('✅ 依赖安装完成');
                resolve();
            } else {
                if (!silent) console.error('❌ 依赖安装失败');
                reject(new Error('npm install failed'));
            }
        });
    });
}

// 启动 MCP 服务器
function startMCPServer(silent = false) {
    // 检查是否为 MCP 模式（从 VS Code 或其他 MCP 客户端启动）
    // VS Code 通过 spawn 启动时，通常不会设置 TTY，且父进程名包含 Code
    const isMCPMode = process.env.MCP_MODE === 'true' ||
        process.argv.includes('--mcp') ||
        process.argv.includes('--stdio') ||
        !process.stdout.isTTY ||
        process.env.TERM_PROGRAM === 'vscode';

    // 为了确保 VS Code 启动正确的服务器，默认启动 stdio 版本
    // 除非明确指定要启动 HTTP 服务器
    const forceHTTP = process.argv.includes('--http') || process.env.FORCE_HTTP === 'true';

    if (!forceHTTP) {
        // MCP 模式：启动 stdio MCP 服务器
        if (!silent) process.stderr.write('🚀 启动 MCP Stdio 服务器...\n');

        const server = spawn('npx', ['ts-node', 'src/server/mcp-server.ts'], {
            stdio: 'inherit',
            cwd: __dirname
        });

        server.on('error', (err) => {
            process.stderr.write(`❌ 启动 MCP 服务器时出错: ${err.message}\n`);
        });

        return server;
    } else {
        // 开发模式：启动 HTTP 服务器
        if (!silent) console.log('🚀 启动 MCP Copilot Logger 服务...');

        const server = spawn('npx', ['ts-node', 'src/server/index.ts'], {
            stdio: 'inherit',
            cwd: __dirname
        });

        server.on('close', (code) => {
            if (!silent) console.log(`服务器进程退出，代码: ${code}`);
        });

        server.on('error', (err) => {
            if (!silent) console.error('❌ 启动服务器时出错:', err);
        });

        // 处理进程退出
        process.on('SIGINT', () => {
            if (!silent) console.log('\n🛑 正在关闭服务器...');
            server.kill('SIGINT');
            process.exit(0);
        });

        process.on('SIGTERM', () => {
            if (!silent) console.log('\n🛑 正在关闭服务器...');
            server.kill('SIGTERM');
            process.exit(0);
        });

        return server;
    }
}

// 主函数
async function main() {
    try {
        // 检查命令行参数，决定启动模式
        const forceHTTP = process.argv.includes('--http') || process.env.FORCE_HTTP === 'true';
        const silent = !forceHTTP; // 非 HTTP 模式下保持静默，避免干扰 stdio 通信

        if (!silent) {
            console.log('🔧 MCP Copilot Logger 启动器');
            console.log('================================');
        }

        checkPrerequisites(silent);

        // 只在 HTTP 模式下安装依赖，避免干扰 stdio 通信
        if (forceHTTP) {
            await installDependencies(silent);
        }

        startMCPServer(silent);

    } catch (error) {
        // 只在 HTTP 模式下输出错误到 console
        if (process.argv.includes('--http') || process.env.FORCE_HTTP === 'true') {
            console.error('❌ 启动失败:', error.message);
        } else {
            process.stderr.write(`❌ 启动失败: ${error.message}\n`);
        }
        process.exit(1);
    }
}

if (require.main === module) {
    main();
}

module.exports = { main };
