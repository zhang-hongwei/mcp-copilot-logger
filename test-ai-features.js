#!/usr/bin/env node

/**
 * 测试智能知识库的AI功能
 * 包括向量搜索、模式分析、上下文增强等
 */

const path = require('path');

// 设置模块路径到dist目录
const distPath = path.join(__dirname, 'dist', 'server');

async function testAIFeatures() {
    console.log('🧠 开始测试智能知识库AI功能...\n');

    try {
        // 动态导入编译后的模块
        const { DatabaseManager } = require('./dist/server/database/database-manager');
        const IntelligentQueryEngine = require('./dist/server/tools/intelligent-query-engine').default;
        const KnowledgePatternAnalyzer = require('./dist/server/tools/knowledge-pattern-analyzer').default;
        const CopilotContextEnhancer = require('./dist/server/tools/copilot-context-enhancer').default;

        console.log('✅ 成功加载所有模块');

        // 1. 初始化数据库
        console.log('📊 初始化数据库...');
        const dbManager = new DatabaseManager();
        await dbManager.initialize();
        console.log('✅ 数据库初始化成功');

        // 2. 创建测试数据
        console.log('📝 创建测试数据...');
        await createTestProblems(dbManager);

        // 3. 测试智能查询引擎
        console.log('\n🔍 测试智能查询引擎...');
        await testIntelligentQuery(IntelligentQueryEngine, dbManager);

        // 4. 测试知识模式分析
        console.log('\n🔬 测试知识模式分析...');
        await testPatternAnalysis(KnowledgePatternAnalyzer, dbManager);

        // 5. 测试Copilot上下文增强
        console.log('\n🤖 测试Copilot上下文增强...');
        await testContextEnhancement(CopilotContextEnhancer, dbManager);

        console.log('\n✅ 所有AI功能测试完成！');

    } catch (error) {
        console.error('❌ 测试失败:', error);
        console.error('详细错误信息:', error.stack);
        process.exit(1);
    }
}

async function createTestProblems(dbManager) {
    const testProblems = [
        {
            title: 'React hooks useState 更新问题',
            description: 'useState 状态更新后组件不重新渲染',
            category: 'React',
            priority_level: 'high',
            current_status: 'resolved',
            final_solution: '使用函数式更新: setState(prev => !prev)',
            value_score: 8,
            time_spent_minutes: 60,
            prevention_strategy: '总是使用函数式更新状态，避免直接修改状态对象',
            code_before: 'const [count, setCount] = useState(0);\nsetCount(count + 1);',
            code_after: 'const [count, setCount] = useState(0);\nsetCount(prev => prev + 1);',
            code_language: 'javascript'
        },
        {
            title: 'TypeScript 类型错误',
            description: 'Promise 类型推断错误导致编译失败',
            category: 'TypeScript',
            priority_level: 'medium',
            current_status: 'resolved',
            final_solution: '显式定义Promise返回类型',
            value_score: 7,
            time_spent_minutes: 45,
            prevention_strategy: '为异步函数明确指定返回类型',
            code_before: 'async function fetchData() { return fetch("/api/data"); }',
            code_after: 'async function fetchData(): Promise<Response> { return fetch("/api/data"); }',
            code_language: 'typescript'
        },
        {
            title: 'CSS Flexbox 布局问题',
            description: '子元素在flex容器中无法居中对齐',
            category: 'CSS',
            priority_level: 'low',
            current_status: 'resolved',
            final_solution: '使用 justify-content: center 和 align-items: center',
            value_score: 6,
            time_spent_minutes: 30,
            prevention_strategy: '记住flexbox的主轴和交叉轴概念',
            code_before: '.container { display: flex; }',
            code_after: '.container { display: flex; justify-content: center; align-items: center; }',
            code_language: 'css'
        }
    ];

    for (const problem of testProblems) {
        await dbManager.createProblem(problem);
    }

    console.log(`✅ 创建了 ${testProblems.length} 个测试问题`);
}

async function testIntelligentQuery(IntelligentQueryEngine, dbManager) {
    const queryEngine = new IntelligentQueryEngine(dbManager);

    // 测试关键词搜索
    console.log('  📝 测试关键词搜索...');
    const keywordResult = await queryEngine.query({
        query: 'React useState',
        queryType: 'keyword',
        limit: 5
    });
    console.log(`    找到 ${keywordResult.problems.length} 个相关问题`);

    // 测试语义搜索（这会使用fallback实现，因为没有OpenAI API key）
    console.log('  🧠 测试语义搜索...');
    const semanticResult = await queryEngine.query({
        query: '状态更新组件不刷新',
        queryType: 'semantic',
        limit: 5,
        minSimilarity: 0.3
    });
    console.log(`    语义搜索找到 ${semanticResult.problems.length} 个相关问题`);

    // 测试混合搜索
    console.log('  🔄 测试混合搜索...');
    const hybridResult = await queryEngine.query({
        query: 'TypeScript 类型问题',
        queryType: 'hybrid',
        limit: 5
    });
    console.log(`    混合搜索找到 ${hybridResult.problems.length} 个相关问题`);
    console.log(`    查询耗时: ${hybridResult.queryTime}ms`);
}

async function testPatternAnalysis(KnowledgePatternAnalyzer, dbManager) {
    const analyzer = new KnowledgePatternAnalyzer(dbManager);

    console.log('  🔍 分析问题模式...');
    const analysisResult = await analyzer.analyzePatterns();

    console.log(`    发现 ${analysisResult.newPatterns.length} 个新模式`);
    console.log(`    更新 ${analysisResult.updatedPatterns.length} 个现有模式`);
    console.log(`    分析了 ${analysisResult.statistics.analyzedProblems} 个问题`);
    console.log(`    置信度: ${(analysisResult.statistics.confidenceScore * 100).toFixed(1)}%`);

    if (analysisResult.newPatterns.length > 0) {
        console.log('    新发现的模式:');
        analysisResult.newPatterns.forEach((pattern, index) => {
            console.log(`      ${index + 1}. ${pattern.name} (评分: ${pattern.score.toFixed(2)})`);
            console.log(`         ${pattern.description}`);
        });
    }

    if (analysisResult.recommendations.length > 0) {
        console.log('    推荐建议:');
        analysisResult.recommendations.forEach((rec, index) => {
            console.log(`      ${index + 1}. ${rec}`);
        });
    }
}

async function testContextEnhancement(CopilotContextEnhancer, dbManager) {
    const enhancer = new CopilotContextEnhancer(dbManager);

    console.log('  💡 测试上下文增强...');

    // 测试错误解决场景
    const errorContext = await enhancer.enhanceContext(
        'React组件状态更新后不重新渲染怎么办？',
        {
            includeCodeExamples: true,
            includePreventionTips: true,
            maxContextItems: 3
        }
    );

    console.log(`    原始查询: ${errorContext.originalQuery}`);
    console.log(`    增强后长度: ${errorContext.enhancedPrompt.length} 字符`);
    console.log(`    找到 ${errorContext.contextSources.length} 个上下文源`);
    console.log(`    置信度: ${(errorContext.confidenceScore * 100).toFixed(1)}%`);

    if (errorContext.contextSources.length > 0) {
        console.log('    上下文源类型:');
        const sourceTypes = errorContext.contextSources.reduce((acc, source) => {
            acc[source.type] = (acc[source.type] || 0) + 1;
            return acc;
        }, {});
        Object.entries(sourceTypes).forEach(([type, count]) => {
            console.log(`      ${type}: ${count} 个`);
        });
    }

    // 测试获取统计信息
    console.log('  📊 获取增强统计信息...');
    const stats = await enhancer.getEnhancementStats();
    console.log(`    总增强次数: ${stats.total_enhancements || 0}`);
    console.log(`    平均满意度: ${((stats.avg_satisfaction || 0) * 100).toFixed(1)}%`);
}

// 运行测试
testAIFeatures().catch(console.error);
