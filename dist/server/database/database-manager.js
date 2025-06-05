"use strict";
/**
 * SQLite 数据库管理器
 * 使用 better-sqlite3 提供高性能的同步数据库操作
 */
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.databaseManager = exports.DatabaseManager = void 0;
const path = __importStar(require("path"));
const fs = __importStar(require("fs"));
const better_sqlite3_1 = __importDefault(require("better-sqlite3"));
const config_manager_1 = require("../utils/config-manager");
class DatabaseManager {
    constructor() {
        this.db = null;
        this.isInitialized = false;
        const config = config_manager_1.ConfigManager.getInstance().getConfig();
        const dbDir = path.join(process.cwd(), '.mcp', 'data');
        this.dbPath = path.join(dbDir, 'knowledge-base.db');
        // 确保数据库目录存在
        if (!fs.existsSync(dbDir)) {
            fs.mkdirSync(dbDir, { recursive: true });
        }
    }
    /**
     * 初始化数据库连接和表结构
     */
    async initialize() {
        if (this.isInitialized) {
            return;
        }
        try {
            // 创建数据库连接
            this.db = new better_sqlite3_1.default(this.dbPath);
            console.log(`Database connected at: ${this.dbPath}`);
            await this.createTables();
            await this.createIndexes();
            await this.setupFTS();
            this.isInitialized = true;
            console.log('Database initialized successfully');
        }
        catch (error) {
            console.error('Failed to initialize database:', error);
            throw error;
        }
    }
    /**
     * 创建数据库表
     */
    async createTables() {
        const schemas = [
            // 问题记录表
            `CREATE TABLE IF NOT EXISTS problems (
                id TEXT PRIMARY KEY,
                timestamp TEXT NOT NULL,
                title TEXT NOT NULL,
                description TEXT NOT NULL,
                category TEXT NOT NULL,
                priority TEXT CHECK(priority IN ('low', 'medium', 'high')) NOT NULL,
                context TEXT NOT NULL,
                code_before TEXT,
                code_after TEXT,
                code_language TEXT,
                error_phenomenon TEXT NOT NULL,
                final_solution TEXT NOT NULL,
                solution_type TEXT CHECK(solution_type IN ('bug-fix', 'optimization', 'new-feature', 'learning', 'other')) NOT NULL,
                value_score INTEGER CHECK(value_score >= 1 AND value_score <= 10) NOT NULL,
                value_explanation TEXT NOT NULL,
                learning_outcome TEXT NOT NULL,
                prevention_strategy TEXT,
                is_worth_exporting BOOLEAN NOT NULL DEFAULT 1,
                export_notes TEXT,
                created_at TEXT NOT NULL DEFAULT (datetime('now')),
                updated_at TEXT NOT NULL DEFAULT (datetime('now')),
                is_synced_to_obsidian BOOLEAN NOT NULL DEFAULT 0,
                obsidian_file_path TEXT
            )`,
            // 标签表
            `CREATE TABLE IF NOT EXISTS tags (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                name TEXT UNIQUE NOT NULL,
                color TEXT,
                description TEXT,
                created_at TEXT NOT NULL DEFAULT (datetime('now'))
            )`,
            // 问题-标签关联表
            `CREATE TABLE IF NOT EXISTS problem_tags (
                problem_id TEXT NOT NULL,
                tag_id INTEGER NOT NULL,
                created_at TEXT NOT NULL DEFAULT (datetime('now')),
                PRIMARY KEY (problem_id, tag_id),
                FOREIGN KEY (problem_id) REFERENCES problems(id) ON DELETE CASCADE,
                FOREIGN KEY (tag_id) REFERENCES tags(id) ON DELETE CASCADE
            )`,
            // 尝试记录表
            `CREATE TABLE IF NOT EXISTS attempts (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                problem_id TEXT NOT NULL,
                action TEXT NOT NULL,
                result TEXT NOT NULL,
                timestamp TEXT NOT NULL,
                sequence_order INTEGER NOT NULL,
                FOREIGN KEY (problem_id) REFERENCES problems(id) ON DELETE CASCADE
            )`,
            // 相关问题关联表
            `CREATE TABLE IF NOT EXISTS problem_relations (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                source_problem_id TEXT NOT NULL,
                target_problem_id TEXT NOT NULL,
                relation_type TEXT CHECK(relation_type IN ('duplicate', 'related', 'blocks', 'prerequisite')) NOT NULL,
                description TEXT,
                created_at TEXT NOT NULL DEFAULT (datetime('now')),
                FOREIGN KEY (source_problem_id) REFERENCES problems(id) ON DELETE CASCADE,
                FOREIGN KEY (target_problem_id) REFERENCES problems(id) ON DELETE CASCADE
            )`,
            // 参考资料表
            `CREATE TABLE IF NOT EXISTS problem_references (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                problem_id TEXT NOT NULL,
                url TEXT NOT NULL,
                title TEXT,
                description TEXT,
                created_at TEXT NOT NULL DEFAULT (datetime('now')),
                FOREIGN KEY (problem_id) REFERENCES problems(id) ON DELETE CASCADE
            )`,
            // 同步日志表
            `CREATE TABLE IF NOT EXISTS sync_logs (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                operation TEXT CHECK(operation IN ('create', 'update', 'delete', 'export')) NOT NULL,
                target_type TEXT CHECK(target_type IN ('problem', 'obsidian_file')) NOT NULL,
                target_id TEXT NOT NULL,
                status TEXT CHECK(status IN ('success', 'failed', 'pending')) NOT NULL,
                error_message TEXT,
                created_at TEXT NOT NULL DEFAULT (datetime('now'))
            )`,
            // 新增智能知识库相关表
            // 1. 问题向量表（用于语义检索）
            `CREATE TABLE IF NOT EXISTS problem_embeddings (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                problem_id TEXT NOT NULL,
                embedding_model TEXT NOT NULL DEFAULT 'text-embedding-ada-002',
                embedding_vector TEXT NOT NULL,  -- JSON 格式存储向量
                content_hash TEXT NOT NULL,      -- 内容哈希，用于判断是否需要更新
                created_at TEXT NOT NULL DEFAULT (datetime('now')),
                updated_at TEXT NOT NULL DEFAULT (datetime('now')),
                FOREIGN KEY (problem_id) REFERENCES problems(id) ON DELETE CASCADE,
                UNIQUE(problem_id, embedding_model)
            )`,
            // 2. 问题查询历史表
            `CREATE TABLE IF NOT EXISTS query_history (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                query_text TEXT NOT NULL,
                query_type TEXT CHECK(query_type IN ('keyword', 'semantic', 'hybrid')) NOT NULL,
                results_count INTEGER NOT NULL DEFAULT 0,
                matched_problem_ids TEXT,        -- JSON 数组格式
                query_context TEXT,              -- 查询时的上下文信息
                confidence_score REAL,           -- 查询结果的置信度
                user_feedback TEXT CHECK(user_feedback IN ('helpful', 'not_helpful', 'partial')),
                created_at TEXT NOT NULL DEFAULT (datetime('now'))
            )`,
            // 3. 问题相似度关系表
            `CREATE TABLE IF NOT EXISTS problem_similarities (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                source_problem_id TEXT NOT NULL,
                target_problem_id TEXT NOT NULL,
                similarity_score REAL NOT NULL CHECK(similarity_score >= 0 AND similarity_score <= 1),
                similarity_type TEXT CHECK(similarity_type IN ('semantic', 'keyword', 'solution_pattern')) NOT NULL,
                calculated_at TEXT NOT NULL DEFAULT (datetime('now')),
                FOREIGN KEY (source_problem_id) REFERENCES problems(id) ON DELETE CASCADE,
                FOREIGN KEY (target_problem_id) REFERENCES problems(id) ON DELETE CASCADE,
                UNIQUE(source_problem_id, target_problem_id, similarity_type)
            )`,
            // 4. 知识模式表
            `CREATE TABLE IF NOT EXISTS knowledge_patterns (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                pattern_name TEXT NOT NULL UNIQUE,
                pattern_description TEXT NOT NULL,
                related_categories TEXT,         -- JSON 数组
                common_tags TEXT,               -- JSON 数组
                typical_solutions TEXT,         -- JSON 数组
                prevention_strategies TEXT,     -- JSON 数组
                related_problem_ids TEXT,       -- JSON 数组
                pattern_score REAL DEFAULT 0,   -- 模式重要性评分
                usage_count INTEGER DEFAULT 0,  -- 被引用次数
                created_at TEXT NOT NULL DEFAULT (datetime('now')),
                updated_at TEXT NOT NULL DEFAULT (datetime('now'))
            )`,
            // 5. Copilot 会话增强记录表
            `CREATE TABLE IF NOT EXISTS copilot_enhancements (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                session_id TEXT NOT NULL,       -- Copilot 会话ID
                original_query TEXT NOT NULL,   -- 原始查询
                enhanced_context TEXT,          -- 添加的历史上下文
                matched_problems TEXT,          -- JSON 数组，匹配的问题ID
                enhancement_type TEXT CHECK(enhancement_type IN ('similar_cases', 'prevention_tips', 'best_practices')) NOT NULL,
                copilot_response_improved BOOLEAN DEFAULT FALSE,
                user_satisfaction_score INTEGER CHECK(user_satisfaction_score >= 1 AND user_satisfaction_score <= 10),
                created_at TEXT NOT NULL DEFAULT (datetime('now'))
            )`
        ];
        // 创建索引
        const indexes = [
            'CREATE INDEX IF NOT EXISTS idx_problem_embeddings_problem_id ON problem_embeddings(problem_id)',
            'CREATE INDEX IF NOT EXISTS idx_problem_embeddings_model ON problem_embeddings(embedding_model)',
            'CREATE INDEX IF NOT EXISTS idx_query_history_created_at ON query_history(created_at)',
            'CREATE INDEX IF NOT EXISTS idx_query_history_query_type ON query_history(query_type)',
            'CREATE INDEX IF NOT EXISTS idx_problem_similarities_source ON problem_similarities(source_problem_id)',
            'CREATE INDEX IF NOT EXISTS idx_problem_similarities_target ON problem_similarities(target_problem_id)',
            'CREATE INDEX IF NOT EXISTS idx_problem_similarities_score ON problem_similarities(similarity_score)',
            'CREATE INDEX IF NOT EXISTS idx_knowledge_patterns_score ON knowledge_patterns(pattern_score)',
            'CREATE INDEX IF NOT EXISTS idx_copilot_enhancements_session ON copilot_enhancements(session_id)'
        ];
        for (const schema of schemas) {
            try {
                this.db.exec(schema);
                console.log('Table created successfully');
            }
            catch (error) {
                console.error('Failed to create table:', error);
                throw error;
            }
        }
        for (const index of indexes) {
            try {
                this.db.exec(index);
                console.log('Index created successfully');
            }
            catch (error) {
                console.error('Failed to create index:', error);
                throw error;
            }
        }
    }
    /**
     * 创建索引
     */
    async createIndexes() {
        const indexes = [
            'CREATE INDEX IF NOT EXISTS idx_problems_category ON problems(category)',
            'CREATE INDEX IF NOT EXISTS idx_problems_priority ON problems(priority)',
            'CREATE INDEX IF NOT EXISTS idx_problems_value_score ON problems(value_score)',
            'CREATE INDEX IF NOT EXISTS idx_problems_created_at ON problems(created_at)',
            'CREATE INDEX IF NOT EXISTS idx_problems_is_worth_exporting ON problems(is_worth_exporting)',
            'CREATE INDEX IF NOT EXISTS idx_problems_is_synced ON problems(is_synced_to_obsidian)',
            'CREATE INDEX IF NOT EXISTS idx_attempts_problem_id ON attempts(problem_id)',
            'CREATE INDEX IF NOT EXISTS idx_problem_references_problem_id ON problem_references(problem_id)',
            'CREATE INDEX IF NOT EXISTS idx_sync_logs_target ON sync_logs(target_type, target_id)'
        ];
        for (const index of indexes) {
            try {
                // 实际实现时使用：this.db!.exec(index);
                console.log('Creating index...');
            }
            catch (error) {
                console.error('Failed to create index:', error);
            }
        }
    }
    /**
     * 设置全文搜索
     */
    async setupFTS() {
        try {
            // 创建FTS5虚拟表 - 去除content选项以避免问题
            const ftsSchema = `
                CREATE VIRTUAL TABLE IF NOT EXISTS search_index USING fts5(
                    title, 
                    description, 
                    context, 
                    error_phenomenon, 
                    final_solution, 
                    learning_outcome,
                    problem_id UNINDEXED
                )
            `;
            this.db.exec(ftsSchema);
            console.log('Setting up full-text search...');
            // 创建触发器以维护FTS索引
            const triggers = [
                `CREATE TRIGGER IF NOT EXISTS problems_fts_insert AFTER INSERT ON problems BEGIN
                    INSERT INTO search_index(title, description, context, error_phenomenon, final_solution, learning_outcome, problem_id)
                    VALUES (new.title, new.description, new.context, new.error_phenomenon, new.final_solution, new.learning_outcome, new.id);
                END`,
                `CREATE TRIGGER IF NOT EXISTS problems_fts_delete AFTER DELETE ON problems BEGIN
                    DELETE FROM search_index WHERE problem_id = old.id;
                END`,
                `CREATE TRIGGER IF NOT EXISTS problems_fts_update AFTER UPDATE ON problems BEGIN
                    DELETE FROM search_index WHERE problem_id = old.id;
                    INSERT INTO search_index(title, description, context, error_phenomenon, final_solution, learning_outcome, problem_id)
                    VALUES (new.title, new.description, new.context, new.error_phenomenon, new.final_solution, new.learning_outcome, new.id);
                END`
            ];
            for (const trigger of triggers) {
                this.db.exec(trigger);
                console.log('FTS trigger created successfully');
            }
        }
        catch (error) {
            console.error('Failed to setup FTS:', error);
        }
    }
    /**
     * 生成UUID
     */
    generateUUID() {
        return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
            const r = Math.random() * 16 | 0;
            const v = c == 'x' ? r : (r & 0x3 | 0x8);
            return v.toString(16);
        });
    }
    // 实现 DatabaseOperations 接口的方法
    async createProblem(problem) {
        if (!this.isInitialized) {
            await this.initialize();
        }
        const id = this.generateUUID();
        const now = new Date().toISOString();
        try {
            const stmt = `INSERT INTO problems (
                id, timestamp, title, description, category, priority, context,
                code_before, code_after, code_language, error_phenomenon,
                final_solution, solution_type, value_score, value_explanation,
                learning_outcome, prevention_strategy, is_worth_exporting,
                export_notes, created_at, updated_at
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`;
            this.db.prepare(stmt).run(id, problem.timestamp || now, problem.title || '', problem.description || '', problem.category || 'general', problem.priority || 'medium', problem.context || '', problem.code_before, problem.code_after, problem.code_language, problem.error_phenomenon || '', problem.final_solution || '', problem.solution_type || 'other', problem.value_score || 5, problem.value_explanation || '', problem.learning_outcome || '', problem.prevention_strategy, (problem.is_worth_exporting ?? true) ? 1 : 0, problem.export_notes, now, now);
            console.log(`Problem created with ID: ${id}`);
            return id;
        }
        catch (error) {
            console.error('Failed to create problem:', error);
            throw error;
        }
    }
    async updateProblem(id, updates) {
        if (!this.isInitialized) {
            await this.initialize();
        }
        try {
            const fields = Object.keys(updates).filter(key => key !== 'id').map(key => `${key} = ?`);
            if (fields.length === 0) {
                return true;
            }
            fields.push('updated_at = ?');
            const values = Object.values(updates).filter((_, index) => Object.keys(updates)[index] !== 'id').map(value => {
                // 转换boolean值为数字
                if (typeof value === 'boolean') {
                    return value ? 1 : 0;
                }
                return value;
            });
            values.push(new Date().toISOString());
            const stmt = `UPDATE problems SET ${fields.join(', ')} WHERE id = ?`;
            const result = this.db.prepare(stmt).run(...values, id);
            return result.changes > 0;
        }
        catch (error) {
            console.error('Failed to update problem:', error);
            return false;
        }
    }
    async deleteProblem(id) {
        if (!this.isInitialized) {
            await this.initialize();
        }
        try {
            const result = this.db.prepare('DELETE FROM problems WHERE id = ?').run(id);
            return result.changes > 0;
        }
        catch (error) {
            console.error('Failed to delete problem:', error);
            return false;
        }
    }
    async getProblem(id) {
        if (!this.isInitialized) {
            await this.initialize();
        }
        try {
            const result = this.db.prepare('SELECT * FROM problems WHERE id = ?').get(id);
            return result ? result : null;
        }
        catch (error) {
            console.error('Failed to get problem:', error);
            return null;
        }
    }
    async searchProblems(query) {
        if (!this.isInitialized) {
            await this.initialize();
        }
        try {
            // 使用最简单的FTS查询语法
            const ftsStmt = `
                SELECT problem_id FROM search_index WHERE search_index MATCH ?
            `;
            const ftsResults = this.db.prepare(ftsStmt).all(query);
            if (ftsResults.length > 0) {
                // 使用FTS结果获取完整的问题信息
                const problemIds = ftsResults.map(r => r.problem_id);
                const placeholders = problemIds.map(() => '?').join(',');
                const problemStmt = `
                    SELECT * FROM problems 
                    WHERE id IN (${placeholders})
                    ORDER BY created_at DESC
                `;
                return this.db.prepare(problemStmt).all(...problemIds);
            }
            else {
                // 如果FTS没有结果，回退到LIKE搜索
                const fallbackStmt = `
                    SELECT * FROM problems 
                    WHERE title LIKE ? OR description LIKE ? OR final_solution LIKE ?
                    ORDER BY created_at DESC
                `;
                const likeQuery = `%${query}%`;
                return this.db.prepare(fallbackStmt).all(likeQuery, likeQuery, likeQuery);
            }
        }
        catch (error) {
            console.error('Failed to search problems:', error);
            // 如果FTS搜索失败，回退到常规搜索
            try {
                const fallbackStmt = `
                    SELECT * FROM problems 
                    WHERE title LIKE ? OR description LIKE ? OR final_solution LIKE ?
                    ORDER BY created_at DESC
                `;
                const likeQuery = `%${query}%`;
                return this.db.prepare(fallbackStmt).all(likeQuery, likeQuery, likeQuery);
            }
            catch (fallbackError) {
                console.error('Fallback search also failed:', fallbackError);
                return [];
            }
        }
    }
    async getProblemsWithFilters(filters) {
        if (!this.isInitialized) {
            await this.initialize();
        }
        try {
            let stmt = 'SELECT DISTINCT p.* FROM problems p';
            const conditions = [];
            const params = [];
            if (filters.tags && filters.tags.length > 0) {
                stmt += ' JOIN problem_tags pt ON p.id = pt.problem_id JOIN tags t ON pt.tag_id = t.id';
                conditions.push(`t.name IN (${filters.tags.map(() => '?').join(', ')})`);
                params.push(...filters.tags);
            }
            if (filters.category) {
                conditions.push('p.category = ?');
                params.push(filters.category);
            }
            if (filters.priority) {
                conditions.push('p.priority = ?');
                params.push(filters.priority);
            }
            if (filters.minValueScore !== undefined) {
                conditions.push('p.value_score >= ?');
                params.push(filters.minValueScore);
            }
            if (filters.isWorthExporting !== undefined) {
                conditions.push('p.is_worth_exporting = ?');
                params.push(filters.isWorthExporting ? 1 : 0);
            }
            if (filters.dateFrom) {
                conditions.push('p.created_at >= ?');
                params.push(filters.dateFrom);
            }
            if (filters.dateTo) {
                conditions.push('p.created_at <= ?');
                params.push(filters.dateTo);
            }
            if (filters.solutionType) {
                conditions.push('p.solution_type = ?');
                params.push(filters.solutionType);
            }
            if (filters.isSynced !== undefined) {
                conditions.push('p.is_synced_to_obsidian = ?');
                params.push(filters.isSynced ? 1 : 0);
            }
            if (conditions.length > 0) {
                stmt += ' WHERE ' + conditions.join(' AND ');
            }
            stmt += ' ORDER BY p.created_at DESC';
            return this.db.prepare(stmt).all(...params);
        }
        catch (error) {
            console.error('Failed to get problems with filters:', error);
            return [];
        }
    }
    async getRecentProblems(limit) {
        if (!this.isInitialized) {
            await this.initialize();
        }
        try {
            return this.db.prepare('SELECT * FROM problems ORDER BY created_at DESC LIMIT ?').all(limit);
        }
        catch (error) {
            console.error('Failed to get recent problems:', error);
            return [];
        }
    }
    async getSimilarProblems(problemId, minSimilarity, limit) {
        if (!this.isInitialized) {
            await this.initialize();
        }
        try {
            if (minSimilarity !== undefined && limit !== undefined) {
                // 返回带相似度的结果
                console.log(`Getting similar problems for ${problemId} with similarity >= ${minSimilarity}`);
                return [];
            }
            else {
                // 基于标签和类别找相似问题 (原有方法)
                const stmt = `
                    SELECT DISTINCT p2.* FROM problems p1
                    JOIN problem_tags pt1 ON p1.id = pt1.problem_id
                    JOIN problem_tags pt2 ON pt1.tag_id = pt2.tag_id
                    JOIN problems p2 ON pt2.problem_id = p2.id
                    WHERE p1.id = ? AND p2.id != ?
                    UNION
                    SELECT * FROM problems WHERE category = (SELECT category FROM problems WHERE id = ?) AND id != ?
                    ORDER BY created_at DESC
                    LIMIT 10
                `;
                return this.db.prepare(stmt).all(problemId, problemId, problemId, problemId);
            }
        }
        catch (error) {
            console.error('Failed to get similar problems:', error);
            return [];
        }
    }
    /**
     * 智能获取相似问题（基于向量相似度）
     */
    async getSimilarProblemsWithScore(problemId, minSimilarity = 0.6, limit = 5) {
        if (!this.isInitialized) {
            await this.initialize();
        }
        try {
            const stmt = `
                SELECT p.*, ps.similarity_score 
                FROM problems p
                JOIN problem_similarities ps ON p.id = ps.target_problem_id
                WHERE ps.source_problem_id = ? 
                AND ps.similarity_score >= ?
                ORDER BY ps.similarity_score DESC
                LIMIT ?
            `;
            const results = this.db.prepare(stmt).all(problemId, minSimilarity, limit);
            return results.map(row => ({
                problem: row,
                similarity: row.similarity_score
            }));
        }
        catch (error) {
            console.error('Failed to get similar problems with score:', error);
            return [];
        }
    }
    // 标签操作方法
    async createTag(name, color, description) {
        if (!this.isInitialized) {
            await this.initialize();
        }
        try {
            const result = this.db.prepare('INSERT INTO tags (name, color, description) VALUES (?, ?, ?)').run(name, color, description);
            return Number(result.lastInsertRowid);
        }
        catch (error) {
            console.error('Failed to create tag:', error);
            throw error;
        }
    }
    async getOrCreateTag(name) {
        if (!this.isInitialized) {
            await this.initialize();
        }
        try {
            let tag = this.db.prepare('SELECT id FROM tags WHERE name = ?').get(name);
            if (!tag) {
                const result = this.db.prepare('INSERT INTO tags (name) VALUES (?)').run(name);
                return Number(result.lastInsertRowid);
            }
            return tag.id;
        }
        catch (error) {
            console.error('Failed to get or create tag:', error);
            throw error;
        }
    }
    async addTagToProblem(problemId, tagId) {
        if (!this.isInitialized) {
            await this.initialize();
        }
        try {
            this.db.prepare('INSERT OR IGNORE INTO problem_tags (problem_id, tag_id) VALUES (?, ?)').run(problemId, tagId);
            return true;
        }
        catch (error) {
            console.error('Failed to add tag to problem:', error);
            return false;
        }
    }
    async removeTagFromProblem(problemId, tagId) {
        if (!this.isInitialized) {
            await this.initialize();
        }
        try {
            const result = this.db.prepare('DELETE FROM problem_tags WHERE problem_id = ? AND tag_id = ?').run(problemId, tagId);
            return result.changes > 0;
        }
        catch (error) {
            console.error('Failed to remove tag from problem:', error);
            return false;
        }
    }
    // 尝试记录操作
    async addAttempt(problemId, action, result) {
        if (!this.isInitialized) {
            await this.initialize();
        }
        try {
            const now = new Date().toISOString();
            // 获取下一个序号
            const maxOrder = this.db.prepare('SELECT MAX(sequence_order) as max_order FROM attempts WHERE problem_id = ?').get(problemId);
            const order = (maxOrder?.max_order || 0) + 1;
            const insertResult = this.db.prepare('INSERT INTO attempts (problem_id, action, result, timestamp, sequence_order) VALUES (?, ?, ?, ?, ?)').run(problemId, action, result, now, order);
            return Number(insertResult.lastInsertRowid);
        }
        catch (error) {
            console.error('Failed to add attempt:', error);
            throw error;
        }
    }
    async getAttempts(problemId) {
        if (!this.isInitialized) {
            await this.initialize();
        }
        try {
            return this.db.prepare('SELECT * FROM attempts WHERE problem_id = ? ORDER BY sequence_order').all(problemId);
        }
        catch (error) {
            console.error('Failed to get attempts:', error);
            return [];
        }
    }
    // 其他操作方法的Mock实现...
    async addProblemRelation(sourceId, targetId, type, description) {
        console.log(`Adding relation from ${sourceId} to ${targetId}`);
        return 1;
    }
    async getProblemRelations(problemId) {
        console.log(`Getting relations for problem ${problemId}`);
        return [];
    }
    async addReference(problemId, url, title, description) {
        console.log(`Adding reference to problem ${problemId}`);
        return 1;
    }
    async getReferences(problemId) {
        console.log(`Getting references for problem ${problemId}`);
        return [];
    }
    async markAsSynced(problemId, obsidianPath) {
        console.log(`Marking problem ${problemId} as synced to ${obsidianPath}`);
        return true;
    }
    async getPendingSyncProblems() {
        console.log('Getting pending sync problems');
        return [];
    }
    async logSyncOperation(operation, targetType, targetId, status, error) {
        console.log(`Logging sync operation: ${operation} ${targetType} ${targetId} - ${status}`);
        return 1;
    }
    async getStatistics() {
        console.log('Getting database statistics');
        return {
            totalProblems: 0,
            problemsByCategory: {},
            problemsByPriority: {},
            averageValueScore: 0,
            totalWorthyForExport: 0,
            recentActivityCount: 0,
            syncStatus: {
                synced: 0,
                pending: 0,
                failed: 0
            }
        };
    }
    /**
     * 存储问题向量嵌入
     */
    async storeProblemEmbedding(problemId, embedding, model = 'text-embedding-ada-002') {
        if (!this.isInitialized) {
            await this.initialize();
        }
        try {
            const embeddingJson = JSON.stringify(embedding);
            const contentHash = this.generateContentHash(embeddingJson);
            const now = new Date().toISOString();
            const stmt = this.db.prepare(`
                INSERT OR REPLACE INTO problem_embeddings 
                (problem_id, embedding_model, embedding_vector, content_hash, created_at, updated_at)
                VALUES (?, ?, ?, ?, ?, ?)
            `);
            stmt.run(problemId, model, embeddingJson, contentHash, now, now);
            return true;
        }
        catch (error) {
            console.error('Failed to store problem embedding:', error);
            return false;
        }
    }
    /**
     * 获取问题向量嵌入
     */
    async getProblemEmbedding(problemId, model = 'text-embedding-ada-002') {
        if (!this.isInitialized) {
            await this.initialize();
        }
        try {
            const result = this.db.prepare(`
                SELECT embedding_vector FROM problem_embeddings 
                WHERE problem_id = ? AND embedding_model = ?
            `).get(problemId, model);
            if (result && result.embedding_vector) {
                return JSON.parse(result.embedding_vector);
            }
            return null;
        }
        catch (error) {
            console.error('Failed to get problem embedding:', error);
            return null;
        }
    }
    /**
     * 记录查询历史
     */
    async recordQueryHistory(queryText, queryType, matchedProblemIds, confidence, context) {
        if (!this.isInitialized) {
            await this.initialize();
        }
        try {
            const matchedIds = JSON.stringify(matchedProblemIds);
            const now = new Date().toISOString();
            const stmt = this.db.prepare(`
                INSERT INTO query_history 
                (query_text, query_type, results_count, matched_problem_ids, query_context, confidence_score, created_at)
                VALUES (?, ?, ?, ?, ?, ?, ?)
            `);
            const result = stmt.run(queryText, queryType, matchedProblemIds.length, matchedIds, context || null, confidence || null, now);
            return Number(result.lastInsertRowid);
        }
        catch (error) {
            console.error('Failed to record query history:', error);
            throw error;
        }
    }
    /**
     * 存储问题相似度
     */
    async storeProblemSimilarity(sourceProblemId, targetProblemId, similarityScore, similarityType) {
        if (!this.isInitialized) {
            await this.initialize();
        }
        try {
            const now = new Date().toISOString();
            const stmt = this.db.prepare(`
                INSERT OR REPLACE INTO problem_similarities 
                (source_problem_id, target_problem_id, similarity_score, similarity_type, calculated_at)
                VALUES (?, ?, ?, ?, ?)
            `);
            stmt.run(sourceProblemId, targetProblemId, similarityScore, similarityType, now);
            return true;
        }
        catch (error) {
            console.error('Failed to store problem similarity:', error);
            return false;
        }
    }
    /**
     * 存储知识模式
     */
    async storeKnowledgePattern(pattern) {
        if (!this.isInitialized) {
            await this.initialize();
        }
        try {
            const now = new Date().toISOString();
            const stmt = this.db.prepare(`
                INSERT INTO knowledge_patterns 
                (pattern_name, pattern_description, related_categories, common_tags, 
                 typical_solutions, prevention_strategies, related_problem_ids, pattern_score, created_at, updated_at)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            `);
            const result = stmt.run(pattern.name, pattern.description, JSON.stringify(pattern.categories), JSON.stringify(pattern.tags), JSON.stringify(pattern.solutions), JSON.stringify(pattern.preventionStrategies), JSON.stringify(pattern.relatedProblemIds), pattern.score, now, now);
            return Number(result.lastInsertRowid);
        }
        catch (error) {
            console.error('Failed to store knowledge pattern:', error);
            throw error;
        }
    }
    /**
     * 记录 Copilot 增强会话
     */
    async recordCopilotEnhancement(enhancement) {
        if (!this.isInitialized) {
            await this.initialize();
        }
        try {
            const matchedProblemsJson = JSON.stringify(enhancement.matchedProblems);
            const now = new Date().toISOString();
            const stmt = this.db.prepare(`
                INSERT INTO copilot_enhancements 
                (session_id, original_query, enhanced_context, matched_problems, enhancement_type, 
                 copilot_response_improved, user_satisfaction_score, created_at)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?)
            `);
            const result = stmt.run(enhancement.sessionId, enhancement.originalQuery, enhancement.enhancedContext || null, matchedProblemsJson, enhancement.enhancementType, enhancement.responseImproved ? 1 : 0, enhancement.satisfactionScore || null, now);
            return Number(result.lastInsertRowid);
        }
        catch (error) {
            console.error('Failed to record Copilot enhancement:', error);
            throw error;
        }
    }
    /**
     * 获取知识库统计信息
     */
    async getKnowledgeStats() {
        if (!this.isInitialized) {
            await this.initialize();
        }
        try {
            const totalProblems = this.db.prepare('SELECT COUNT(*) as count FROM problems').get();
            const totalEmbeddings = this.db.prepare('SELECT COUNT(*) as count FROM problem_embeddings').get();
            const totalPatterns = this.db.prepare('SELECT COUNT(*) as count FROM knowledge_patterns').get();
            const recentQueries = this.db.prepare('SELECT COUNT(*) as count FROM query_history WHERE created_at > datetime("now", "-7 days")').get();
            const avgSimilarity = this.db.prepare('SELECT AVG(similarity_score) as avg FROM problem_similarities').get();
            return {
                totalProblems: totalProblems.count || 0,
                totalEmbeddings: totalEmbeddings.count || 0,
                totalPatterns: totalPatterns.count || 0,
                recentQueries: recentQueries.count || 0,
                avgSimilarityScore: avgSimilarity.avg || 0
            };
        }
        catch (error) {
            console.error('Failed to get knowledge stats:', error);
            throw error;
        }
    }
    /**
     * 关闭数据库连接
     */
    close() {
        if (this.db) {
            this.db.close();
            this.db = null;
            this.isInitialized = false;
            console.log('Database connection closed');
        }
    }
    /**
     * 生成内容哈希（用于向量去重）
     */
    generateContentHash(content) {
        // 简单的哈希实现，实际应该使用更robust的哈希算法
        let hash = 0;
        for (let i = 0; i < content.length; i++) {
            const char = content.charCodeAt(i);
            hash = ((hash << 5) - hash) + char;
            hash = hash & hash;
        }
        return hash.toString();
    }
    /**
     * Execute a raw SQL query
     */
    async query(sql, params) {
        if (!this.db) {
            throw new Error('Database not initialized');
        }
        try {
            const statement = this.db.prepare(sql);
            if (params) {
                return statement.all(...params);
            }
            else {
                return statement.all();
            }
        }
        catch (error) {
            console.error('Query execution failed:', error);
            throw error;
        }
    }
    /**
     * Execute a raw SQL command (INSERT, UPDATE, DELETE)
     */
    async execute(sql, params) {
        if (!this.db) {
            throw new Error('Database not initialized');
        }
        try {
            const statement = this.db.prepare(sql);
            if (params) {
                return statement.run(...params);
            }
            else {
                return statement.run();
            }
        }
        catch (error) {
            console.error('Execute command failed:', error);
            throw error;
        }
    }
}
exports.DatabaseManager = DatabaseManager;
// 导出单例实例
exports.databaseManager = new DatabaseManager();
