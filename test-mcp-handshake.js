#!/usr/bin/env node

/**
 * 测试 MCP 服务器的 handshake 功能
 * 模拟 VS Code 的 MCP 客户端行为
 */

const { spawn } = require('child_process');
const path = require('path');

function testMCPHandshake() {
    console.log('🧪 测试 MCP Copilot Logger handshake...');

    // 启动 MCP 服务器
    const server = spawn('npx', ['ts-node', 'src/server/mcp-server.ts'], {
        cwd: __dirname,
        stdio: ['pipe', 'pipe', 'pipe']
    });

    let receivedData = '';
    let testComplete = false;

    // 监听服务器输出
    server.stdout.on('data', (data) => {
        receivedData += data.toString();
        console.log('📨 服务器输出:', data.toString().trim());

        // 检查是否收到初始化响应
        if (data.toString().includes('"result"') && data.toString().includes('"id":1')) {
            console.log('✅ MCP handshake 成功！');
            testComplete = true;
            server.kill();
            process.exit(0);
        }
    });

    server.stderr.on('data', (data) => {
        console.log('🔍 服务器日志:', data.toString().trim());
    });

    // 等待服务器启动
    setTimeout(() => {
        if (testComplete) return;

        console.log('📤 发送 initialize 请求...');

        // 发送 MCP initialize 请求
        const initRequest = {
            jsonrpc: '2.0',
            id: 1,
            method: 'initialize',
            params: {
                protocolVersion: '2024-11-05',
                capabilities: {
                    roots: {
                        listChanged: false
                    },
                    sampling: {}
                },
                clientInfo: {
                    name: 'test-client',
                    version: '1.0.0'
                }
            }
        };

        try {
            server.stdin.write(JSON.stringify(initRequest) + '\n');
        } catch (err) {
            console.error('❌ 写入请求失败:', err);
        }

    }, 2000);

    // 最终超时检查
    setTimeout(() => {
        if (!testComplete) {
            console.log('❌ MCP handshake 超时');
            console.log('📥 收到的数据:', receivedData);
            server.kill();
            process.exit(1);
        }
    }, 8000);

    server.on('error', (err) => {
        console.error('❌ 服务器启动错误:', err);
        process.exit(1);
    });

    server.on('close', (code) => {
        if (!testComplete) {
            console.log(`🔄 服务器进程退出，代码: ${code}`);
        }
    });
}

testMCPHandshake();
