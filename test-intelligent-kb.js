#!/usr/bin/env node

/**
 * 智能知识库功能测试脚本
 */

async function testIntelligentKB() {
    console.log('🧠 测试智能知识库功能...\n');

    try {
        // 动态导入模块
        const { DatabaseManager } = require('./dist/server/database/database-manager');
        const IntelligentQueryEngine = require('./dist/server/tools/intelligent-query-engine').default;

        // 1. 初始化数据库
        console.log('1. 初始化数据库...');
        const dbManager = new DatabaseManager();
        await dbManager.initialize();
        console.log('✅ 数据库初始化成功\n');

        // 2. 创建测试问题
        console.log('2. 创建测试问题...');
        const problemId = await dbManager.createProblem({
            title: 'React Hook 依赖数组错误',
            description: 'useEffect 依赖数组中缺少变量导致的无限循环问题',
            category: 'react',
            priority: 'high',
            context: 'React 18 项目中的用户认证组件',
            error_phenomenon: 'useEffect 无限触发，页面卡死',
            final_solution: '在依赖数组中添加缺失的 userId 变量',
            solution_type: 'bug-fix',
            value_score: 8,
            value_explanation: '常见的 React Hook 陷阱，值得记录',
            learning_outcome: '学会了正确使用 useEffect 依赖数组',
            prevention_strategy: '使用 ESLint react-hooks/exhaustive-deps 规则'
        });
        console.log(`✅ 创建问题成功: ${problemId}\n`);

        // 3. 存储向量嵌入（模拟）
        console.log('3. 存储问题向量嵌入...');
        const mockEmbedding = Array.from({ length: 1536 }, () => Math.random() * 2 - 1);
        const embeddingResult = await dbManager.storeProblemEmbedding(problemId, mockEmbedding);
        console.log(`✅ 向量嵌入存储成功: ${embeddingResult}\n`);

        // 4. 测试智能查询引擎
        console.log('4. 测试智能查询引擎...');
        const queryEngine = new IntelligentQueryEngine();
        const queryResult = await queryEngine.query({
            query: 'React useEffect 无限循环',
            queryType: 'keyword',
            limit: 5
        });
        console.log(`✅ 查询结果: 找到 ${queryResult.totalCount} 个相关问题`);
        console.log(`   查询耗时: ${queryResult.queryTime}ms\n`);

        // 5. 测试统计信息
        console.log('5. 获取知识库统计信息...');
        const stats = await dbManager.getKnowledgeStats();
        console.log('✅ 统计信息:');
        console.log(`   总问题数: ${stats.totalProblems}`);
        console.log(`   向量嵌入数: ${stats.totalEmbeddings}`);
        console.log(`   知识模式数: ${stats.totalPatterns}`);
        console.log(`   最近查询数: ${stats.recentQueries}\n`);

        // 6. 清理资源
        console.log('6. 清理资源...');
        dbManager.close();
        console.log('✅ 资源清理完成\n');

        console.log('🎉 智能知识库功能测试完成！所有功能都正常工作。');

    } catch (error) {
        console.error('❌ 测试失败:', error);
        console.error('错误堆栈:', error.stack);
        process.exit(1);
    }
}

// 运行测试
testIntelligentKB()
    .then(() => process.exit(0))
    .catch(error => {
        console.error('测试执行失败:', error);
        process.exit(1);
    });
