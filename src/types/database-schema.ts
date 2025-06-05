/**
 * SQLite 数据库模式定义
 * 为 MCP Copilot Logger 知识库系统设计的数据表结构
 */

export interface DatabaseSchema {
    // 问题记录表
    problems: {
        id: string;                    // 主键 UUID
        timestamp: string;             // 创建时间
        title: string;                 // 问题标题
        description: string;           // 详细描述
        category: string;              // 问题分类
        priority: 'low' | 'medium' | 'high';
        context: string;               // 问题背景

        // 代码相关
        code_before: string | null;    // 修改前代码
        code_after: string | null;     // 修改后代码
        code_language: string | null;  // 代码语言

        // 解决过程
        error_phenomenon: string;      // 错误现象
        final_solution: string;        // 最终解决方案
        solution_type: 'bug-fix' | 'optimization' | 'new-feature' | 'learning' | 'other';

        // 价值评估
        value_score: number;           // 1-10分价值评分
        value_explanation: string;     // 价值说明
        learning_outcome: string;      // 学习收获
        prevention_strategy: string | null; // 预防策略

        // 导出控制
        is_worth_exporting: boolean;   // 是否值得导出
        export_notes: string | null;   // 导出备注

        // 元数据
        created_at: string;            // 创建时间戳
        updated_at: string;            // 更新时间戳
        is_synced_to_obsidian: boolean; // 是否已同步到Obsidian
        obsidian_file_path: string | null; // Obsidian文件路径
    };

    // 标签表
    tags: {
        id: number;                    // 自增主键
        name: string;                  // 标签名称
        color: string | null;          // 标签颜色
        description: string | null;    // 标签描述
        created_at: string;
    };

    // 问题-标签关联表
    problem_tags: {
        problem_id: string;            // 问题ID
        tag_id: number;                // 标签ID
        created_at: string;
    };

    // 尝试记录表
    attempts: {
        id: number;                    // 自增主键
        problem_id: string;            // 问题ID
        action: string;                // 尝试的动作
        result: string;                // 尝试结果
        timestamp: string;             // 尝试时间
        sequence_order: number;        // 顺序号
    };

    // 相关问题关联表
    problem_relations: {
        id: number;                    // 自增主键
        source_problem_id: string;     // 源问题ID
        target_problem_id: string;     // 目标问题ID
        relation_type: 'duplicate' | 'related' | 'blocks' | 'prerequisite';
        description: string | null;    // 关系描述
        created_at: string;
    };

    // 参考资料表
    problem_references: {
        id: number;                    // 自增主键
        problem_id: string;            // 问题ID
        url: string;                   // 参考链接
        title: string | null;          // 参考资料标题
        description: string | null;    // 参考资料描述
        created_at: string;
    };

    // 搜索索引表（用于全文搜索）
    search_index: {
        rowid: number;                 // FTS表的rowid
        content: string;               // 索引内容
        problem_id: string;            // 关联的问题ID
    };

    // 同步日志表
    sync_logs: {
        id: number;                    // 自增主键
        operation: 'create' | 'update' | 'delete' | 'export';
        target_type: 'problem' | 'obsidian_file';
        target_id: string;             // 目标ID
        status: 'success' | 'failed' | 'pending';
        error_message: string | null;  // 错误消息
        created_at: string;
    };
}

// 数据库操作接口
export interface DatabaseOperations {
    // 问题记录操作
    createProblem(problem: Partial<DatabaseSchema['problems']>): Promise<string>;
    updateProblem(id: string, updates: Partial<DatabaseSchema['problems']>): Promise<boolean>;
    deleteProblem(id: string): Promise<boolean>;
    getProblem(id: string): Promise<DatabaseSchema['problems'] | null>;

    // 查询操作
    searchProblems(query: string): Promise<DatabaseSchema['problems'][]>;
    getProblemsWithFilters(filters: ProblemFilters): Promise<DatabaseSchema['problems'][]>;
    getRecentProblems(limit: number): Promise<DatabaseSchema['problems'][]>;
    getSimilarProblems(problemId: string): Promise<DatabaseSchema['problems'][]>;

    // 标签操作
    createTag(name: string, color?: string, description?: string): Promise<number>;
    getOrCreateTag(name: string): Promise<number>;
    addTagToProblem(problemId: string, tagId: number): Promise<boolean>;
    removeTagFromProblem(problemId: string, tagId: number): Promise<boolean>;

    // 尝试记录操作
    addAttempt(problemId: string, action: string, result: string): Promise<number>;
    getAttempts(problemId: string): Promise<DatabaseSchema['attempts'][]>;

    // 关联操作
    addProblemRelation(sourceId: string, targetId: string, type: string, description?: string): Promise<number>;
    getProblemRelations(problemId: string): Promise<DatabaseSchema['problem_relations'][]>;

    // 参考资料操作
    addReference(problemId: string, url: string, title?: string, description?: string): Promise<number>;
    getReferences(problemId: string): Promise<DatabaseSchema['problem_references'][]>;

    // 同步操作
    markAsSynced(problemId: string, obsidianPath: string): Promise<boolean>;
    getPendingSyncProblems(): Promise<DatabaseSchema['problems'][]>;
    logSyncOperation(operation: string, targetType: string, targetId: string, status: string, error?: string): Promise<number>;

    // 统计操作
    getStatistics(): Promise<DatabaseStatistics>;
}

export interface ProblemFilters {
    category?: string;
    priority?: 'low' | 'medium' | 'high';
    tags?: string[];
    minValueScore?: number;
    isWorthExporting?: boolean;
    dateFrom?: string;
    dateTo?: string;
    solutionType?: string;
    isSynced?: boolean;
}

export interface DatabaseStatistics {
    totalProblems: number;
    problemsByCategory: Record<string, number>;
    problemsByPriority: Record<string, number>;
    averageValueScore: number;
    totalWorthyForExport: number;
    recentActivityCount: number;
    syncStatus: {
        synced: number;
        pending: number;
        failed: number;
    };
}

// 全文搜索结果
export interface SearchResult {
    problem: DatabaseSchema['problems'];
    relevanceScore: number;
    matchedFields: string[];
    snippet: string;
}

// 查询构建器接口
export interface QueryBuilder {
    select(fields: string[]): QueryBuilder;
    from(table: string): QueryBuilder;
    where(condition: string, ...params: any[]): QueryBuilder;
    orderBy(field: string, direction?: 'ASC' | 'DESC'): QueryBuilder;
    limit(count: number): QueryBuilder;
    offset(count: number): QueryBuilder;
    join(table: string, on: string): QueryBuilder;
    build(): { sql: string; params: any[] };
}
