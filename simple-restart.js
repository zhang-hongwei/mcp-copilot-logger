#!/usr/bin/env node

/**
 * 简单的 MCP 服务器重启脚本
 */

const { execSync } = require('child_process');

console.log('🔄 重启 MCP Copilot Logger...\n');

// 1. 清理进程
console.log('1. 清理现有进程...');
try {
    execSync('pkill -f "mcp-server" || true', { stdio: 'inherit' });
    execSync('pkill -f "ts-node.*mcp" || true', { stdio: 'inherit' });
} catch (error) {
    // 忽略错误
}

// 2. 清理端口
console.log('2. 清理端口...');
try {
    const pids = execSync('lsof -ti :8529 || true', { encoding: 'utf8' }).trim();
    if (pids) {
        execSync(`kill -9 ${pids} || true`, { stdio: 'inherit' });
    }
} catch (error) {
    // 忽略错误
}

console.log('3. 等待进程清理...');
setTimeout(() => {
    console.log('4. 启动新的 MCP 服务器...');

    // 启动服务器
    execSync('node start-mcp.js &', {
        stdio: 'inherit',
        cwd: process.cwd()
    });

    console.log('\n✅ MCP 服务器重启完成！');
    console.log('\n📋 请在所有 VS Code 窗口中：');
    console.log('1. 重启 VS Code 或重新加载窗口（Cmd+R）');
    console.log('2. 测试导出功能：@mcp export_to_obsidian');
    console.log('\n💡 现在文件命名应该包含时间戳，不会重复覆盖了。');

}, 2000);
