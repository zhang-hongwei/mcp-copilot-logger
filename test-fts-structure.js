#!/usr/bin/env node

console.log('🔍 检查FTS表结构...');

async function checkFTSStructure() {
    try {
        const { DatabaseManager } = require('./dist/server/database/database-manager');

        const dbManager = new DatabaseManager();
        await dbManager.initialize();

        const db = dbManager.db;

        // 检查FTS表是否存在
        console.log('\n📋 检查search_index表结构:');
        try {
            const result = db.prepare("PRAGMA table_info(search_index)").all();
            console.log('search_index表信息:', result);
        } catch (e) {
            console.log('search_index表不存在或出错:', e.message);
        }

        // 检查FTS表内容
        console.log('\n📊 检查search_index表内容:');
        try {
            const count = db.prepare("SELECT COUNT(*) as count FROM search_index").get();
            console.log('search_index表记录数:', count);

            if (count.count > 0) {
                const sample = db.prepare("SELECT * FROM search_index LIMIT 1").get();
                console.log('示例记录:', sample);
            }
        } catch (e) {
            console.log('查询search_index内容出错:', e.message);
        }

        // 测试简单的FTS查询
        console.log('\n🧪 测试FTS查询:');
        try {
            const simpleResult = db.prepare("SELECT rowid FROM search_index WHERE search_index MATCH 'React'").all();
            console.log('简单FTS查询结果:', simpleResult);
        } catch (e) {
            console.log('简单FTS查询出错:', e.message);
        }

        // 测试使用列名的查询
        try {
            const columnResult = db.prepare("SELECT problem_id FROM search_index WHERE search_index MATCH 'React'").all();
            console.log('列名FTS查询结果:', columnResult);
        } catch (e) {
            console.log('列名FTS查询出错:', e.message);
        }

    } catch (error) {
        console.error('❌ 错误:', error);
    }
}

checkFTSStructure();
