import * as vscode from 'vscode';
import { createProjectCommand } from './commands/createProject';
import { PythonProjectExplorerProvider } from './ui/explorerProvider';

export function activate(context: vscode.ExtensionContext) {
    console.log('Python Project Creator extension is now active!');

    const createProjectCmd = vscode.commands.registerCommand(
        'python-project-creator.newProject',
        () => createProjectCommand(context)
    );

    const explorerProvider = new PythonProjectExplorerProvider(context);
    vscode.window.registerTreeDataProvider('pythonProjectExplorer', explorerProvider);

    context.subscriptions.push(createProjectCmd);
}

export function deactivate() {}