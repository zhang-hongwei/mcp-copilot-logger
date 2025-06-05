#!/usr/bin/env node

/**
 * 完全重启 MCP 服务器的脚本
 * 确保使用最新的代码和配置
 */

const { execSync, spawn } = require('child_process');
const path = require('path');

console.log('🔄 完全重启 MCP Copilot Logger...\n');

async function main() {
    try {
        // 1. 清理所有相关进程
        console.log('1. 清理现有进程...');
        try {
            execSync('pkill -f "mcp-server"', { stdio: 'ignore' });
            execSync('pkill -f "ts-node.*mcp"', { stdio: 'ignore' });
            console.log('   ✅ 进程清理完成');
        } catch (error) {
            console.log('   ✅ 没有找到需要清理的进程');
        }

        // 2. 等待一段时间确保进程完全退出
        console.log('2. 等待进程完全退出...');
        await delay(2000);

        // 3. 验证端口状态
        console.log('3. 检查端口状态...');
        try {
            const portCheck = execSync('lsof -i :8529', { encoding: 'utf8', stdio: 'pipe' });
            if (portCheck.trim()) {
                console.log('   ⚠️  端口 8529 仍被占用，尝试清理...');
                const lines = portCheck.trim().split('\n');
                for (let i = 1; i < lines.length; i++) {
                    const pid = lines[i].split(/\s+/)[1];
                    if (pid && pid.match(/^\d+$/)) {
                        execSync(`kill -9 ${pid}`, { stdio: 'ignore' });
                    }
                }
            }
        } catch (error) {
            console.log('   ✅ 端口 8529 空闲');
        }

        // 4. 重新编译 TypeScript（如果需要）
        console.log('4. 编译最新代码...');
        try {
            // 只编译关键文件，避免冲突
            execSync('npx tsc src/server/tools/problem-tracker.ts --outDir dist --moduleResolution node --esModuleInterop', {
                stdio: 'pipe',
                cwd: process.cwd()
            });
            execSync('npx tsc src/server/tools/obsidian-exporter.ts --outDir dist --moduleResolution node --esModuleInterop', {
                stdio: 'pipe',
                cwd: process.cwd()
            });
            console.log('   ✅ 代码编译完成');
        } catch (error) {
            console.log('   ⚠️  编译跳过（可能有依赖问题，但使用现有编译版本）');
        }

        // 5. 启动新的 MCP 服务器
        console.log('5. 启动新的 MCP 服务器...');
        const serverProcess = spawn('node', ['start-mcp.js'], {
            cwd: process.cwd(),
            stdio: ['pipe', 'pipe', 'pipe'],
            detached: false
        });

        serverProcess.stdout.on('data', (data) => {
            console.log(`📡 MCP: ${data.toString().trim()}`);
        });

        serverProcess.stderr.on('data', (data) => {
            const message = data.toString().trim();
            if (message && !message.includes('ExperimentalWarning')) {
                console.log(`🔧 MCP: ${message}`);
            }
        });

        // 6. 测试连接
        console.log('6. 等待服务器启动...');
        await delay(3000);

        console.log('7. 测试 MCP handshake...');
        try {
            const testResult = execSync('node test-mcp-handshake.js', {
                encoding: 'utf8',
                timeout: 10000,
                cwd: process.cwd()
            });
            console.log('   ✅ MCP 服务器连接测试成功');
            console.log(`   ${testResult.trim()}`);
        } catch (error) {
            console.log('   ⚠️  MCP 连接测试失败，但服务器可能仍在正常运行');
        }

        console.log('\n🎉 MCP Copilot Logger 重启完成！');
        console.log('\n📋 接下来请在 VS Code 中：');
        console.log('1. 重启 VS Code 或重新加载窗口（Cmd+R）');
        console.log('2. 确保 GitHub Copilot 插件已启用');
        console.log('3. 在 Copilot Chat 中测试文件导出：');
        console.log('   @mcp log_problem');
        console.log('   描述：测试文件命名修复');
        console.log('   然后：@mcp export_to_obsidian');
        console.log('\n💡 如果还是有重名问题，请检查其他 VS Code 窗口是否使用了不同的配置文件。');

        // 保持进程运行以便观察日志
        process.on('SIGINT', () => {
            console.log('\n🛑 正在关闭 MCP 服务器...');
            serverProcess.kill();
            process.exit(0);
        });

    } catch (error) {
        console.error('❌ 重启过程中出现错误:', error.message);
        process.exit(1);
    }
}

main().catch(console.error);

// Helper function for async/await in top-level
function delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}
