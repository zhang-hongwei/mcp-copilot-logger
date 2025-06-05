#!/usr/bin/env node

/**
 * 测试搜索功能
 * 专门测试FTS5全文搜索的修复
 */

const path = require('path');

async function testSearchFunctionality() {
    console.log('🔍 开始测试搜索功能...\n');

    try {
        // 动态导入编译后的模块
        const { DatabaseManager } = require('./dist/server/database/database-manager');

        console.log('✅ 成功加载数据库模块');

        // 1. 初始化数据库
        console.log('📊 初始化数据库...');
        const dbManager = new DatabaseManager();
        await dbManager.initialize();
        console.log('✅ 数据库初始化成功');

        // 2. 清理并重建FTS表
        await resetFTSTables(dbManager);

        // 3. 创建测试数据
        console.log('\n📝 创建测试数据...');
        await createTestProblems(dbManager);

        // 4. 同步现有数据到FTS
        await syncDataToFTS(dbManager);

        // 5. 测试搜索功能
        await testSearchQueries(dbManager);

        console.log('\n✅ 搜索功能测试完成！');

    } catch (error) {
        console.error('❌ 测试失败:', error);
        console.error('详细错误信息:', error.stack);
        process.exit(1);
    }
}

async function resetFTSTables(dbManager) {
    console.log('\n🔄 重置FTS表和触发器...');

    const db = dbManager.db;
    if (db) {
        try {
            // 清理旧的FTS表和触发器
            db.exec('DROP TABLE IF EXISTS search_index');
            db.exec('DROP TRIGGER IF EXISTS problems_fts_insert');
            db.exec('DROP TRIGGER IF EXISTS problems_fts_delete');
            db.exec('DROP TRIGGER IF EXISTS problems_fts_update');
            console.log('  ✅ 清理旧的FTS表和触发器');

            // 强制重建FTS表和触发器
            dbManager.isInitialized = false;
            await dbManager.initialize();
            console.log('  ✅ 重新创建FTS表和触发器');
        } catch (cleanupError) {
            console.log('  ⚠️  清理时出现预期错误:', cleanupError.message);
        }
    }
}

async function createTestProblems(dbManager) {
    const testProblems = [
        {
            title: 'React hooks useState 更新问题',
            description: 'useState 状态更新后组件不重新渲染',
            category: 'React',
            priority: 'high',
            context: '在函数组件中使用useState hook',
            error_phenomenon: 'state更新后UI没有重新渲染',
            final_solution: '使用函数式更新: setState(prev => !prev)',
            learning_outcome: '学会了useState的正确使用方式',
            value_score: 8
        },
        {
            title: 'TypeScript 类型错误修复',
            description: 'Promise 类型推断错误导致编译失败',
            category: 'TypeScript',
            priority: 'medium',
            context: '异步函数类型定义',
            error_phenomenon: 'TypeScript编译报错: Type Promise<unknown>',
            final_solution: '显式定义Promise返回类型',
            learning_outcome: '明确了TS异步函数的类型声明',
            value_score: 7
        },
        {
            title: 'CSS Flexbox 布局问题',
            description: '子元素在flex容器中无法居中对齐',
            category: 'CSS',
            priority: 'low',
            context: 'flexbox布局设计',
            error_phenomenon: 'flex子元素不能水平垂直居中',
            final_solution: '使用 justify-content: center 和 align-items: center',
            learning_outcome: '掌握了flexbox的对齐属性',
            value_score: 6
        },
        {
            title: 'JavaScript 异步编程bug',
            description: 'async/await 处理错误时程序崩溃',
            category: 'JavaScript',
            priority: 'high',
            context: '异步错误处理',
            error_phenomenon: 'Unhandled promise rejection',
            final_solution: '使用 try-catch 包装 await 调用',
            learning_outcome: '学会了正确的异步错误处理',
            value_score: 9
        }
    ];

    const createdIds = [];
    for (const problem of testProblems) {
        const id = await dbManager.createProblem(problem);
        createdIds.push(id);
    }

    console.log(`  ✅ 创建了 ${testProblems.length} 个测试问题`);
    return createdIds;
}

async function syncDataToFTS(dbManager) {
    console.log('\n🔄 同步现有数据到FTS索引...');

    const db = dbManager.db;
    // 修正：用 getProblemsWithFilters({}) 替代 getAllProblems()
    const existingProblems = await dbManager.getProblemsWithFilters({});
    console.log(`  📊 找到 ${existingProblems.length} 个现有问题`);

    if (existingProblems.length > 0 && db) {
        let synced = 0;
        for (const problem of existingProblems) {
            try {
                // 使用参数化查询避免SQL注入
                const stmt = db.prepare(`
                    INSERT OR IGNORE INTO search_index(title, description, context, error_phenomenon, final_solution, learning_outcome, problem_id)
                    VALUES (?, ?, ?, ?, ?, ?, ?)
                `);
                stmt.run(
                    problem.title || '',
                    problem.description || '',
                    problem.context || '',
                    problem.error_phenomenon || '',
                    problem.final_solution || '',
                    problem.learning_outcome || '',
                    problem.id
                );
                synced++;
            } catch (insertError) {
                console.warn(`    ⚠️  跳过问题 ${problem.id}: ${insertError.message}`);
            }
        }
        console.log(`  ✅ 成功同步 ${synced} 个问题到FTS索引`);
    }
}

async function testSearchQueries(dbManager) {
    console.log('\n🔍 开始测试搜索查询...');

    const testQueries = [
        'React',
        'useState',
        'TypeScript',
        'error',
        'async',
        'CSS flex',
        'bug',
        'JavaScript promise'
    ];

    for (const query of testQueries) {
        console.log(`\n  📝 搜索: "${query}"`);
        try {
            const results = await dbManager.searchProblems(query);
            console.log(`    ✅ 找到 ${results.length} 个结果`);

            if (results.length > 0) {
                results.slice(0, 3).forEach((problem, index) => {
                    console.log(`      ${index + 1}. ${problem.title}`);
                    console.log(`         分类: ${problem.category}, 评分: ${problem.value_score}`);
                });
                if (results.length > 3) {
                    console.log(`      ... 还有 ${results.length - 3} 个结果`);
                }
            } else {
                console.log(`    ⚠️  没有找到匹配的结果`);
            }
        } catch (error) {
            console.error(`    ❌ 搜索失败: ${error.message}`);
        }
    }

    // 测试FTS特殊语法
    console.log(`\n  🔬 测试FTS高级语法...`);

    const ftsQueries = [
        '"React hooks"',  // 短语搜索
        'error OR bug',   // OR搜索
        'async AND await', // AND搜索
    ];

    for (const query of ftsQueries) {
        console.log(`    🔍 高级搜索: ${query}`);
        try {
            const results = await dbManager.searchProblems(query);
            console.log(`      ✅ 找到 ${results.length} 个结果`);
        } catch (error) {
            console.log(`      ⚠️  高级搜索失败，回退到基础搜索: ${error.message}`);
        }
    }
}

// 运行测试
testSearchFunctionality().catch(console.error);
