import * as vscode from 'vscode';
import { activateCommands } from './commands';

export function activate(context: vscode.ExtensionContext) {
    // Register commands for the extension
    activateCommands(context);
    
    // Additional activation logic can be added here
}

export function deactivate() {
    // Cleanup logic can be added here if needed
}