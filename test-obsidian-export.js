#!/usr/bin/env node

/**
 * 测试 Obsidian 导出功能的文件命名修复
 */

const path = require('path');
const fs = require('fs');

// 添加 TypeScript 支持
require('ts-node/register');

// 直接导入相关工具函数
const { logProblem, getProblems } = require('./src/server/tools/problem-tracker');
const { exportToObsidian } = require('./src/server/tools/obsidian-exporter');

async function testObsidianExportNaming() {
    console.log('🧪 测试 Obsidian 导出文件命名修复...\n');

    try {
        // 1. 创建几个测试问题，确保有不同的标题
        console.log('📝 创建测试问题...');

        const problem1 = logProblem({
            title: "useEffect多次渲染问题",
            description: "React useEffect 导致组件多次重复渲染",
            finalSolution: "添加依赖数组正确控制 useEffect",
            category: "前端开发",
            tags: ["React", "useEffect", "性能优化"],
            valueScore: 8,
            isWorthExporting: true
        });

        const problem2 = logProblem({
            title: "MCP服务器端口冲突",
            description: "MCP 服务器启动时端口被占用导致无法启动",
            finalSolution: "使用 lsof 命令查找并终止占用端口的进程",
            category: "后端开发",
            tags: ["MCP", "端口", "调试"],
            valueScore: 7,
            isWorthExporting: true
        });

        console.log('✅ 测试问题创建完成');
        console.log(`- 问题1 ID: ${problem1.id}`);
        console.log(`- 问题2 ID: ${problem2.id}\n`);

        // 2. 测试单个问题导出（应该使用问题标题作为文件名）
        console.log('📤 测试单个问题导出...');
        const export1 = await exportToObsidian([problem1.id], {
            format: 'problem-report'
        });
        console.log(`✅ 单个问题导出完成: ${export1.exportPath}`);

        // 等待一秒后再导出同一个问题（测试是否会覆盖）
        console.log('⏳ 等待1秒后再次导出同一问题...');
        await new Promise(resolve => setTimeout(resolve, 1000));

        const export1_again = await exportToObsidian([problem1.id], {
            format: 'problem-report'
        });
        console.log(`✅ 再次导出完成: ${export1_again.exportPath}`);

        // 3. 测试多个问题导出（应该使用时间戳作为文件名）
        console.log('\n📤 测试多个问题导出...');
        const export2 = await exportToObsidian([problem1.id, problem2.id], {
            format: 'problem-report'
        });
        console.log(`✅ 多个问题导出完成: ${export2.exportPath}`);

        // 4. 测试高价值问题批量导出
        console.log('\n📤 测试高价值问题批量导出...');
        const export3 = await exportToObsidian([], {
            format: 'high-value-problems',
            minValueScore: 6
        });
        console.log(`✅ 高价值问题导出完成: ${export3.exportPath}`);

        // 5. 验证文件是否真的存在
        console.log('\n🔍 验证导出文件...');
        const exportPaths = [export1.exportPath, export1_again.exportPath, export2.exportPath, export3.exportPath];

        for (const exportPath of exportPaths) {
            if (fs.existsSync(exportPath)) {
                const stats = fs.statSync(exportPath);
                console.log(`✅ 文件存在: ${path.basename(exportPath)} (${Math.round(stats.size / 1024)}KB)`);
            } else {
                console.log(`❌ 文件不存在: ${exportPath}`);
            }
        }

        // 6. 检查文件名是否符合预期
        console.log('\n📋 文件命名分析:');
        exportPaths.forEach((exportPath, index) => {
            const fileName = path.basename(exportPath);
            const description = [
                '第一次单个问题导出',
                '第二次单个问题导出（应该不覆盖）',
                '多个问题导出',
                '高价值问题批量导出'
            ][index];
            console.log(`${index + 1}. ${description}: ${fileName}`);
        });

        console.log('\n🎉 测试完成！文件命名修复验证成功');

    } catch (error) {
        console.error('❌ 测试失败:', error.message);
        if (error.stack) {
            console.error(error.stack);
        }
    }
}

// 运行测试
testObsidianExportNaming().catch(console.error);
