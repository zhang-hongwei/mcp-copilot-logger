-- 数据库扩展方案：在现有基础上增加知识检索功能
-- 基于现有的 problems 表，添加以下扩展表

-- 1. 问题向量表（用于语义检索）
CREATE TABLE IF NOT EXISTS problem_embeddings (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    problem_id TEXT NOT NULL,
    embedding_model TEXT NOT NULL DEFAULT 'text-embedding-ada-002',
    embedding_vector TEXT NOT NULL, -- JSON 格式存储向量
    content_hash TEXT NOT NULL, -- 内容哈希，用于判断是否需要更新
    created_at TEXT NOT NULL DEFAULT(datetime('now')),
    updated_at TEXT NOT NULL DEFAULT(datetime('now')),
    FOREIGN KEY (problem_id) REFERENCES problems (id) ON DELETE CASCADE,
    UNIQUE (problem_id, embedding_model)
);

-- 2. 问题查询历史表（记录 Copilot 查询历史）
CREATE TABLE IF NOT EXISTS query_history (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    query_text TEXT NOT NULL,
    query_type TEXT CHECK (
        query_type IN (
            'keyword',
            'semantic',
            'hybrid'
        )
    ) NOT NULL,
    results_count INTEGER NOT NULL DEFAULT 0,
    matched_problem_ids TEXT, -- JSON 数组格式
    query_context TEXT, -- 查询时的上下文信息
    confidence_score REAL, -- 查询结果的置信度
    user_feedback TEXT CHECK (
        user_feedback IN (
            'helpful',
            'not_helpful',
            'partial'
        )
    ),
    created_at TEXT NOT NULL DEFAULT(datetime('now'))
);

-- 3. 问题相似度关系表（自动计算的相似问题）
CREATE TABLE IF NOT EXISTS problem_similarities (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    source_problem_id TEXT NOT NULL,
    target_problem_id TEXT NOT NULL,
    similarity_score REAL NOT NULL CHECK (
        similarity_score >= 0
        AND similarity_score <= 1
    ),
    similarity_type TEXT CHECK (
        similarity_type IN (
            'semantic',
            'keyword',
            'solution_pattern'
        )
    ) NOT NULL,
    calculated_at TEXT NOT NULL DEFAULT(datetime('now')),
    FOREIGN KEY (source_problem_id) REFERENCES problems (id) ON DELETE CASCADE,
    FOREIGN KEY (target_problem_id) REFERENCES problems (id) ON DELETE CASCADE,
    UNIQUE (
        source_problem_id,
        target_problem_id,
        similarity_type
    )
);

-- 4. 知识模式表（总结常见问题模式）
CREATE TABLE IF NOT EXISTS knowledge_patterns (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    pattern_name TEXT NOT NULL UNIQUE,
    pattern_description TEXT NOT NULL,
    related_categories TEXT, -- JSON 数组
    common_tags TEXT, -- JSON 数组
    typical_solutions TEXT, -- JSON 数组
    prevention_strategies TEXT, -- JSON 数组
    related_problem_ids TEXT, -- JSON 数组
    pattern_score REAL DEFAULT 0, -- 模式重要性评分
    usage_count INTEGER DEFAULT 0, -- 被引用次数
    created_at TEXT NOT NULL DEFAULT(datetime('now')),
    updated_at TEXT NOT NULL DEFAULT(datetime('now'))
);

-- 5. Copilot 会话增强记录表
CREATE TABLE IF NOT EXISTS copilot_enhancements (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    session_id TEXT NOT NULL, -- Copilot 会话ID
    original_query TEXT NOT NULL, -- 原始查询
    enhanced_context TEXT, -- 添加的历史上下文
    matched_problems TEXT, -- JSON 数组，匹配的问题ID
    enhancement_type TEXT CHECK (
        enhancement_type IN (
            'similar_cases',
            'prevention_tips',
            'best_practices'
        )
    ) NOT NULL,
    copilot_response_improved BOOLEAN DEFAULT FALSE,
    user_satisfaction_score INTEGER CHECK (
        user_satisfaction_score >= 1
        AND user_satisfaction_score <= 10
    ),
    created_at TEXT NOT NULL DEFAULT(datetime('now'))
);

-- 创建索引以提高查询性能
CREATE INDEX IF NOT EXISTS idx_problem_embeddings_problem_id ON problem_embeddings (problem_id);

CREATE INDEX IF NOT EXISTS idx_problem_embeddings_model ON problem_embeddings (embedding_model);

CREATE INDEX IF NOT EXISTS idx_query_history_created_at ON query_history (created_at);

CREATE INDEX IF NOT EXISTS idx_query_history_query_type ON query_history (query_type);

CREATE INDEX IF NOT EXISTS idx_problem_similarities_source ON problem_similarities (source_problem_id);

CREATE INDEX IF NOT EXISTS idx_problem_similarities_target ON problem_similarities (target_problem_id);

CREATE INDEX IF NOT EXISTS idx_problem_similarities_score ON problem_similarities (similarity_score);

CREATE INDEX IF NOT EXISTS idx_knowledge_patterns_score ON knowledge_patterns (pattern_score);

CREATE INDEX IF NOT EXISTS idx_copilot_enhancements_session ON copilot_enhancements (session_id);

-- 创建视图：问题的完整信息（包含相似问题）
CREATE VIEW IF NOT EXISTS enhanced_problems AS
SELECT
    p.*,
    GROUP_CONCAT(DISTINCT t.name) as tag_names,
    (
        SELECT COUNT(*)
        FROM problem_similarities ps
        WHERE
            ps.source_problem_id = p.id
    ) as similar_problems_count,
    (
        SELECT AVG(similarity_score)
        FROM problem_similarities ps
        WHERE
            ps.source_problem_id = p.id
    ) as avg_similarity_score
FROM
    problems p
    LEFT JOIN problem_tags pt ON p.id = pt.problem_id
    LEFT JOIN tags t ON pt.tag_id = t.id
GROUP BY
    p.id;