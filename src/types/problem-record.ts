export interface ProblemRecord {
    id?: string;
    timestamp: string;
    title: string;                      // 问题标题（简短描述）
    description: string;                // 详细描述
    tags: string[];                     // 标签数组
    category: string;                   // 问题分类
    priority: 'low' | 'medium' | 'high'; // 优先级

    // 问题背景
    context: string;                    // 问题发生的背景和环境

    // 代码相关
    codeBeforeChange?: string;         // 修改前的代码
    codeAfterChange?: string;          // 修改后的代码
    codeLanguage?: string;             // 代码语言

    // 解决过程
    errorPhenomenon: string;           // 错误现象
    attempts: Array<{                  // 尝试过程（更详细）
        action: string;
        result: string;
        timestamp: string;
    }>;

    // 解决方案
    finalSolution: string;             // 最终解决方案
    solutionType: 'bug-fix' | 'optimization' | 'new-feature' | 'learning' | 'other';

    // 价值评估
    valueScore: number;                // 1-10分价值评分
    valueExplanation: string;          // 价值说明
    learningOutcome: string;           // 学习收获
    preventionStrategy?: string;        // 预防策略

    // 导出控制
    isWorthExporting: boolean;         // 是否值得导出到Obsidian
    exportNotes?: string;              // 导出备注

    // 关联信息
    relatedIssues?: string[];          // 相关问题ID
    references?: string[];             // 相关链接或文档
}