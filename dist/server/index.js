"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const body_parser_1 = __importDefault(require("body-parser"));
const git_hook_1 = require("./handlers/git-hook");
const vscode_integration_1 = require("./handlers/vscode-integration");
const copilot_listener_1 = require("./handlers/copilot-listener");
const app = (0, express_1.default)();
const PORT = process.env.PORT || 8529;
// Middleware
app.use(body_parser_1.default.json());
app.use(body_parser_1.default.urlencoded({ extended: true }));
// MCP Protocol Support
app.get('/mcp/manifest', (req, res) => {
    res.json({
        name: "mcp-copilot-logger",
        version: "1.0.0",
        description: "A service for logging and managing development interactions with Copilot",
        tools: [
            {
                name: "log_problem",
                description: "Log a development problem with value assessment"
            },
            {
                name: "assess_value",
                description: "Assess the value of a recorded problem"
            },
            {
                name: "export_to_obsidian",
                description: "Export logged problems to Obsidian markdown format"
            },
            {
                name: "get_problems",
                description: "Retrieve logged problems with optional filtering"
            }
        ]
    });
});
// MCP Tool Endpoints
app.post('/mcp/tools/log_problem', (req, res) => {
    // Handle both direct params and nested params structure
    const params = req.body.params || req.body;
    const { title, description, error_message, solution, tags, value_score } = params;
    try {
        // Use the problem tracker to properly store the problem
        const { logProblem } = require('./tools/problem-tracker');
        const problemRecord = logProblem({
            title,
            description,
            errorPhenomenon: error_message,
            attempts: [],
            finalSolution: solution,
            valueExplanation: `Value score: ${value_score}`,
            tags: tags || []
        });
        res.json({
            success: true,
            message: "Problem logged successfully",
            data: problemRecord
        });
    }
    catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        res.status(500).json({
            success: false,
            message: "Error logging problem: " + errorMessage
        });
    }
});
app.post('/mcp/tools/export_to_obsidian', async (req, res) => {
    const { problemIds, outputPath, format } = req.body;
    try {
        // Export logic using the obsidian exporter
        const { exportToObsidian } = require('./tools/obsidian-exporter');
        const result = await exportToObsidian(problemIds || [], {
            format: format || 'daily-log'
        });
        res.json({
            success: true,
            message: "Problems exported to Obsidian successfully",
            data: {
                exportPath: result.exportPath,
                fileCount: result.fileCount || 1,
                problemCount: result.problemCount || 0,
                timestamp: new Date().toISOString()
            }
        });
    }
    catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        res.status(500).json({
            success: false,
            message: "Error exporting to Obsidian: " + errorMessage
        });
    }
});
app.post('/mcp/tools/assess_value', (req, res) => {
    const { problemId, timeSpent, impact, learning } = req.body;
    try {
        const { assessValue } = require('./tools/value-assessor');
        const result = assessValue(problemId, { timeSpent, impact, learning });
        res.json(result);
    }
    catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        res.status(500).json({
            success: false,
            message: "Error assessing value: " + errorMessage
        });
    }
});
app.get('/mcp/tools/get_problems', (req, res) => {
    const { filter } = req.query;
    try {
        // Use the problem tracker to retrieve problems
        const { getProblems } = require('./tools/problem-tracker');
        const problems = getProblems();
        // Apply filtering if needed
        let filteredProblems = problems;
        if (filter) {
            // Simple filtering by description or error phenomenon
            filteredProblems = problems.filter((problem) => problem.description.toLowerCase().includes(filter.toString().toLowerCase()) ||
                problem.errorPhenomenon.toLowerCase().includes(filter.toString().toLowerCase()));
        }
        res.json({
            success: true,
            data: filteredProblems
        });
    }
    catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        res.status(500).json({
            success: false,
            message: "Error retrieving problems: " + errorMessage
        });
    }
});
// Setup existing handlers
app.post('/git-hooks/setup', git_hook_1.setupGitHooks);
app.post('/vscode/log-problem', vscode_integration_1.handleLogProblem);
app.get('/vscode/problems', vscode_integration_1.handleGetProblems);
app.post('/vscode/assess-value/:problemId', vscode_integration_1.handleAssessValue);
app.post('/copilot/listen', copilot_listener_1.copilotListener);
// Start the server
app.listen(PORT, () => {
    // 只在非 MCP 模式下输出启动日志
    if (process.env.NODE_ENV === 'development' || !process.env.MCP_MODE) {
        console.log(`MCP Service is running on http://localhost:${PORT}`);
        console.log(`MCP Manifest available at: http://localhost:${PORT}/mcp/manifest`);
    }
});
