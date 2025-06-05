#!/usr/bin/env node
"use strict";
/**
 * 真正的 MCP 服务器实现
 * 通过 stdin/stdout 与 VS Code 通信
 */
const { Server } = require('@modelcontextprotocol/sdk/server/index.js');
const { StdioServerTransport } = require('@modelcontextprotocol/sdk/server/stdio.js');
const { CallToolRequestSchema, ListToolsRequestSchema, } = require('@modelcontextprotocol/sdk/types.js');
// 导入我们的工具
const { logProblem, getProblems } = require('./tools/problem-tracker');
const { exportToObsidian } = require('./tools/obsidian-exporter');
const { assessValue } = require('./tools/value-assessor');
// 暂时注释掉智能工具的导入，避免模块加载问题
// import IntelligentQueryEngine from './tools/intelligent-query-engine';
// import KnowledgePatternAnalyzer from './tools/knowledge-pattern-analyzer';
// import CopilotContextEnhancer from './tools/copilot-context-enhancer';
class MCPCopilotLogger {
    // 暂时注释掉智能工具，确保基础功能正常
    // private queryEngine: IntelligentQueryEngine;
    // private patternAnalyzer: KnowledgePatternAnalyzer;
    // private contextEnhancer: CopilotContextEnhancer;
    constructor() {
        this.server = new Server({
            name: 'mcp-copilot-logger',
            version: '2.0.0',
        }, {
            capabilities: {
                tools: {},
            },
        });
        // 暂时注释掉智能工具初始化
        // this.queryEngine = new IntelligentQueryEngine();
        // this.patternAnalyzer = new KnowledgePatternAnalyzer();
        // this.contextEnhancer = new CopilotContextEnhancer();
        this.setupHandlers();
    }
    setupHandlers() {
        // 工具列表处理器
        this.server.setRequestHandler(ListToolsRequestSchema, async () => {
            return {
                tools: [
                    {
                        name: 'log_problem',
                        description: 'Log a development problem with value assessment',
                        inputSchema: {
                            type: 'object',
                            properties: {
                                title: {
                                    type: 'string',
                                    description: '问题标题（简短描述）'
                                },
                                description: {
                                    type: 'string',
                                    description: '问题的详细描述'
                                },
                                context: {
                                    type: 'string',
                                    description: '问题发生的背景和环境'
                                },
                                error_message: {
                                    type: 'string',
                                    description: '具体的错误现象或信息'
                                },
                                code_before: {
                                    type: 'string',
                                    description: '修改前的代码'
                                },
                                code_after: {
                                    type: 'string',
                                    description: '修改后的代码'
                                },
                                code_language: {
                                    type: 'string',
                                    description: '代码语言'
                                },
                                solution: {
                                    type: 'string',
                                    description: '最终解决方案'
                                },
                                solution_type: {
                                    type: 'string',
                                    description: '解决方案类型',
                                    enum: ['bug-fix', 'optimization', 'new-feature', 'learning', 'other']
                                },
                                tags: {
                                    type: 'array',
                                    items: { type: 'string' },
                                    description: '相关标签，用于分类'
                                },
                                category: {
                                    type: 'string',
                                    description: '问题分类'
                                },
                                priority: {
                                    type: 'string',
                                    description: '优先级',
                                    enum: ['low', 'medium', 'high']
                                },
                                value_score: {
                                    type: 'number',
                                    description: '价值评分 (1-10)'
                                },
                                learning_outcome: {
                                    type: 'string',
                                    description: '学习收获'
                                },
                                prevention_strategy: {
                                    type: 'string',
                                    description: '预防策略'
                                },
                                is_worth_exporting: {
                                    type: 'boolean',
                                    description: '是否值得导出到Obsidian'
                                }
                            },
                            required: ['description']
                        }
                    },
                    {
                        name: 'export_to_obsidian',
                        description: 'Export logged problems to Obsidian markdown format',
                        inputSchema: {
                            type: 'object',
                            properties: {
                                problem_ids: {
                                    type: 'array',
                                    items: { type: 'string' },
                                    description: 'Array of problem IDs to export'
                                },
                                format: {
                                    type: 'string',
                                    description: 'Export format (daily-log, problem-report)'
                                }
                            }
                        }
                    },
                    {
                        name: 'get_problems',
                        description: 'Retrieve logged problems with optional filtering',
                        inputSchema: {
                            type: 'object',
                            properties: {
                                filter: {
                                    type: 'string',
                                    description: 'Filter criteria'
                                }
                            }
                        }
                    },
                    {
                        name: 'assess_value',
                        description: 'Assess the value of a recorded problem',
                        inputSchema: {
                            type: 'object',
                            properties: {
                                problem_id: {
                                    type: 'string',
                                    description: 'ID of the problem to assess'
                                },
                                time_spent: {
                                    type: 'number',
                                    description: 'Time spent on the problem in minutes'
                                },
                                impact: {
                                    type: 'string',
                                    description: 'Impact level (low, medium, high)'
                                },
                                learning: {
                                    type: 'string',
                                    description: 'Learning outcome'
                                }
                            },
                            required: ['problem_id']
                        }
                    },
                    {
                        name: 'query_knowledge',
                        description: 'Query the knowledge base using intelligent search (keyword, semantic, or hybrid)',
                        inputSchema: {
                            type: 'object',
                            properties: {
                                query: {
                                    type: 'string',
                                    description: 'The search query'
                                },
                                query_type: {
                                    type: 'string',
                                    description: 'Type of search to perform',
                                    enum: ['keyword', 'semantic', 'hybrid']
                                },
                                limit: {
                                    type: 'number',
                                    description: 'Maximum number of results to return (default: 5)'
                                },
                                min_similarity: {
                                    type: 'number',
                                    description: 'Minimum similarity score for semantic search (0-1)'
                                },
                                categories: {
                                    type: 'array',
                                    items: { type: 'string' },
                                    description: 'Filter by categories'
                                },
                                tags: {
                                    type: 'array',
                                    items: { type: 'string' },
                                    description: 'Filter by tags'
                                }
                            },
                            required: ['query']
                        }
                    },
                    {
                        name: 'enhance_copilot_context',
                        description: 'Generate enhanced context for Copilot based on historical knowledge',
                        inputSchema: {
                            type: 'object',
                            properties: {
                                query: {
                                    type: 'string',
                                    description: 'The original Copilot query'
                                },
                                session_id: {
                                    type: 'string',
                                    description: 'Optional session ID for tracking'
                                },
                                include_code_examples: {
                                    type: 'boolean',
                                    description: 'Whether to include code examples in context'
                                },
                                include_prevention_tips: {
                                    type: 'boolean',
                                    description: 'Whether to include prevention tips'
                                },
                                max_context_items: {
                                    type: 'number',
                                    description: 'Maximum number of context items to include'
                                }
                            },
                            required: ['query']
                        }
                    },
                    {
                        name: 'analyze_patterns',
                        description: 'Analyze problem patterns and generate insights',
                        inputSchema: {
                            type: 'object',
                            properties: {
                                auto_analyze: {
                                    type: 'boolean',
                                    description: 'Whether to automatically analyze all problems'
                                },
                                category_filter: {
                                    type: 'string',
                                    description: 'Analyze only problems in this category'
                                },
                                min_pattern_size: {
                                    type: 'number',
                                    description: 'Minimum number of problems to form a pattern'
                                }
                            }
                        }
                    },
                    {
                        name: 'find_similar_problems',
                        description: 'Find problems similar to a given problem',
                        inputSchema: {
                            type: 'object',
                            properties: {
                                problem_id: {
                                    type: 'string',
                                    description: 'ID of the problem to find similarities for'
                                },
                                limit: {
                                    type: 'number',
                                    description: 'Maximum number of similar problems to return'
                                },
                                min_similarity: {
                                    type: 'number',
                                    description: 'Minimum similarity score (0-1)'
                                }
                            },
                            required: ['problem_id']
                        }
                    },
                    {
                        name: 'get_knowledge_stats',
                        description: 'Get statistics about the knowledge base',
                        inputSchema: {
                            type: 'object',
                            properties: {
                                include_patterns: {
                                    type: 'boolean',
                                    description: 'Whether to include pattern statistics'
                                },
                                include_queries: {
                                    type: 'boolean',
                                    description: 'Whether to include query statistics'
                                },
                                time_range: {
                                    type: 'string',
                                    description: 'Time range for statistics (e.g., "30d", "6m", "1y")'
                                }
                            }
                        }
                    },
                    {
                        name: 'analyze_knowledge_pattern',
                        description: 'Analyze and suggest knowledge patterns',
                        inputSchema: {
                            type: 'object',
                            properties: {
                                problem_id: {
                                    type: 'string',
                                    description: 'ID of the problem to analyze'
                                },
                                patterns: {
                                    type: 'array',
                                    items: { type: 'string' },
                                    description: 'List of patterns to analyze'
                                }
                            },
                            required: ['problem_id']
                        }
                    },
                    {
                        name: 'enhance_context',
                        description: 'Enhance the context of a problem',
                        inputSchema: {
                            type: 'object',
                            properties: {
                                problem_id: {
                                    type: 'string',
                                    description: 'ID of the problem to enhance'
                                },
                                additional_context: {
                                    type: 'string',
                                    description: 'Additional context information'
                                }
                            },
                            required: ['problem_id']
                        }
                    }
                ]
            };
        });
        // 工具调用处理器
        this.server.setRequestHandler(CallToolRequestSchema, async (request) => {
            const { name, arguments: args } = request.params;
            try {
                switch (name) {
                    case 'log_problem': {
                        const result = logProblem({
                            title: args.title || args.description?.substring(0, 50) || '未命名问题',
                            description: args.description || '',
                            context: args.context || '',
                            errorPhenomenon: args.error_message || '',
                            codeBeforeChange: args.code_before,
                            codeAfterChange: args.code_after,
                            codeLanguage: args.code_language,
                            attempts: [],
                            finalSolution: args.solution || '',
                            solutionType: args.solution_type || 'other',
                            tags: args.tags || [],
                            category: args.category || 'general',
                            priority: args.priority || 'medium',
                            valueScore: args.value_score || 5,
                            valueExplanation: `价值评分: ${args.value_score || 5}/10`,
                            learningOutcome: args.learning_outcome || '',
                            preventionStrategy: args.prevention_strategy,
                            isWorthExporting: args.is_worth_exporting !== false
                        });
                        return {
                            content: [
                                {
                                    type: 'text',
                                    text: JSON.stringify({
                                        success: true,
                                        message: 'Problem logged successfully',
                                        data: result
                                    }, null, 2)
                                }
                            ]
                        };
                    }
                    case 'export_to_obsidian': {
                        try {
                            const result = await exportToObsidian(args.problem_ids || [], {
                                format: args.format || 'daily-log'
                            });
                            return {
                                content: [
                                    {
                                        type: 'text',
                                        text: JSON.stringify({
                                            success: true,
                                            message: 'Problems exported to Obsidian successfully',
                                            data: {
                                                exportPath: result.exportPath,
                                                fileCount: result.fileCount || 1,
                                                problemCount: result.problemCount || 0,
                                                timestamp: new Date().toISOString()
                                            }
                                        }, null, 2)
                                    }
                                ]
                            };
                        }
                        catch (error) {
                            return {
                                content: [
                                    {
                                        type: 'text',
                                        text: JSON.stringify({
                                            success: false,
                                            message: 'Failed to export to Obsidian',
                                            error: error instanceof Error ? error.message : '未知错误'
                                        }, null, 2)
                                    }
                                ]
                            };
                        }
                    }
                    case 'get_problems': {
                        const problems = getProblems();
                        let filteredProblems = problems;
                        if (args.filter) {
                            filteredProblems = problems.filter((problem) => problem.description.toLowerCase().includes(args.filter.toLowerCase()) ||
                                problem.errorPhenomenon.toLowerCase().includes(args.filter.toLowerCase()));
                        }
                        return {
                            content: [
                                {
                                    type: 'text',
                                    text: JSON.stringify({
                                        success: true,
                                        data: filteredProblems
                                    }, null, 2)
                                }
                            ]
                        };
                    }
                    case 'assess_value': {
                        const result = assessValue(args.problem_id, {
                            timeSpent: args.time_spent,
                            impact: args.impact,
                            learning: args.learning
                        });
                        return {
                            content: [
                                {
                                    type: 'text',
                                    text: JSON.stringify(result, null, 2)
                                }
                            ]
                        };
                    }
                    // 暂时注释掉智能工具功能，确保基础 MCP 服务器正常工作
                    /*
                    case 'intelligent_query': {
                        const result = await this.queryEngine.query({
                            query: args.query,
                            queryType: args.query_type || 'hybrid',
                            limit: args.limit,
                            minSimilarity: args.min_similarity,
                            categories: args.categories,
                            tags: args.tags,
                            priorityLevel: args.priority_level,
                            includeContext: args.include_context
                        });

                        return {
                            content: [
                                {
                                    type: 'text',
                                    text: JSON.stringify({
                                        success: true,
                                        data: result
                                    }, null, 2)
                                }
                            ]
                        };
                    }

                    case 'analyze_knowledge_pattern': {
                        const result = await this.patternAnalyzer.analyzePatterns();

                        return {
                            content: [
                                {
                                    type: 'text',
                                    text: JSON.stringify({
                                        success: true,
                                        data: result
                                    }, null, 2)
                                }
                            ]
                        };
                    }

                    case 'enhance_context': {
                        const result = await this.contextEnhancer.enhanceContext(args.problem_id, {
                            includeCodeExamples: args.include_code_examples,
                            includePreventionTips: args.include_prevention_tips,
                            maxContextItems: args.max_context_items,
                            minRelevanceScore: args.min_relevance_score
                        });

                        return {
                            content: [
                                {
                                    type: 'text',
                                    text: JSON.stringify({
                                        success: true,
                                        data: result
                                    }, null, 2)
                                }
                            ]
                        };
                    }
                    */
                    default:
                        throw new Error(`Unknown tool: ${name}`);
                }
            }
            catch (error) {
                const errorMessage = error instanceof Error ? error.message : 'Unknown error';
                return {
                    content: [
                        {
                            type: 'text',
                            text: JSON.stringify({
                                success: false,
                                error: errorMessage
                            }, null, 2)
                        }
                    ],
                    isError: true
                };
            }
        });
    }
    async run() {
        // 全局异常捕获，避免 handshake 阶段进程 silent exit
        process.on('uncaughtException', (err) => {
            process.stderr.write(`[MCP][uncaughtException] ${err instanceof Error ? err.message : String(err)}\n`);
        });
        process.on('unhandledRejection', (reason) => {
            process.stderr.write(`[MCP][unhandledRejection] ${reason instanceof Error ? reason.message : String(reason)}\n`);
        });
        try {
            process.stderr.write('[MCP] Starting StdioServerTransport...\n');
            const transport = new StdioServerTransport();
            await this.server.connect(transport);
            process.stderr.write('[MCP] Server handshake complete, ready for requests.\n');
        }
        catch (err) {
            process.stderr.write(`[MCP][run] Fatal error: ${err instanceof Error ? err.message : String(err)}\n`);
            throw err;
        }
    }
}
// 启动 MCP 服务器
const mcpServer = new MCPCopilotLogger();
mcpServer.run().catch(console.error);
