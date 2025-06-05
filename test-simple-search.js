#!/usr/bin/env node

console.log('🔍 开始测试搜索功能...');

async function test() {
    try {
        console.log('Loading modules...');
        const { DatabaseManager } = require('./dist/server/database/database-manager');
        console.log('✅ DatabaseManager loaded');

        const dbManager = new DatabaseManager();
        console.log('✅ DatabaseManager instance created');

        await dbManager.initialize();
        console.log('✅ Database initialized');

        // 测试简单搜索
        const results = await dbManager.searchProblems('React');
        console.log(`搜索结果: ${results.length} 个问题`);

        if (results.length > 0) {
            console.log('搜索到的第一个问题:', results[0].title);
        }

        console.log('✅ 测试完成');

    } catch (error) {
        console.error('❌ 错误:', error.message);
        console.error('Stack:', error.stack);
    }
}

test();
