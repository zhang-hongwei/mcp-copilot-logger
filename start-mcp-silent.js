#!/usr/bin/env node

/**
 * 静默 MCP 启动脚本 - 专门用于 VS Code 集成
 * 不输出任何调试信息，直接启动 MCP 服务器
 */

const { spawn } = require('child_process');
const path = require('path');

// 直接启动 MCP 服务器，使用标准的 MCP 协议
const server = spawn('npx', ['ts-node', 'src/server/mcp-server.ts'], {
    stdio: 'inherit',
    cwd: __dirname,
    env: {
        ...process.env,
        MCP_MODE: 'true'
    }
});

// 静默处理错误和退出
server.on('error', () => {
    process.exit(1);
});

server.on('close', (code) => {
    process.exit(code);
});

// 处理进程信号
process.on('SIGINT', () => {
    server.kill('SIGINT');
    process.exit(0);
});

process.on('SIGTERM', () => {
    server.kill('SIGTERM');
    process.exit(0);
});
