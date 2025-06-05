import { commands, ExtensionContext } from 'vscode';
import { logProblem } from '../server/tools/problem-tracker';
import { exportToObsidian } from '../server/tools/obsidian-exporter';
import { assessValue } from '../server/tools/value-assessor';

export function registerCommands(context: ExtensionContext) {
    const logProblemCommand = commands.registerCommand('mcp.logProblem', async () => {
        const problemDetails = await getProblemDetailsFromUser();
        logProblem(problemDetails);
    });

    const exportToObsidianCommand = commands.registerCommand('mcp.exportToObsidian', async () => {
        try {
            await exportToObsidian([], { format: 'daily-log' });
        } catch (error) {
            console.error('Export to Obsidian failed:', error);
        }
    });

    const assessValueCommand = commands.registerCommand('mcp.assessValue', async () => {
        const problemId = await getProblemIdFromUser();
        assessValue(problemId);
    });

    context.subscriptions.push(logProblemCommand, exportToObsidianCommand, assessValueCommand);
}

async function getProblemDetailsFromUser() {
    // Function to gather problem details from the user
}

async function getProblemIdFromUser() {
    // Function to gather problem ID from the user
}