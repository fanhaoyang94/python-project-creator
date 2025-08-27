import * as vscode from 'vscode';

export class PythonProjectExplorerProvider implements vscode.TreeDataProvider<ExplorerItem> {
    private _onDidChangeTreeData: vscode.EventEmitter<ExplorerItem | undefined | null | void> = new vscode.EventEmitter<ExplorerItem | undefined | null | void>();
    readonly onDidChangeTreeData: vscode.Event<ExplorerItem | undefined | null | void> = this._onDidChangeTreeData.event;

    constructor(private context: vscode.ExtensionContext) {}

    refresh(): void {
        this._onDidChangeTreeData.fire();
    }

    getTreeItem(element: ExplorerItem): vscode.TreeItem {
        return element;
    }

    getChildren(element?: ExplorerItem): Thenable<ExplorerItem[]> {
        if (!element) {
            // Show the create button only when no folder is open
            if (!vscode.workspace.workspaceFolders || vscode.workspace.workspaceFolders.length === 0) {
                return Promise.resolve([
                    new ExplorerItem(
                        'Create Python Project',
                        'Create a new Python project',
                        vscode.TreeItemCollapsibleState.None,
                        {
                            command: 'python-project-creator.newProject',
                            title: 'Create Python Project'
                        },
                        'add'
                    )
                ]);
            }
        }
        return Promise.resolve([]);
    }
}

export class ExplorerItem extends vscode.TreeItem {
    constructor(
        public readonly label: string,
        public readonly tooltip: string,
        public readonly collapsibleState: vscode.TreeItemCollapsibleState,
        public readonly command?: vscode.Command,
        public readonly iconPath?: string | vscode.ThemeIcon
    ) {
        super(label, collapsibleState);
        this.tooltip = tooltip;
        if (command) {
            this.command = command;
        }
        if (iconPath) {
            this.iconPath = new vscode.ThemeIcon(iconPath as string);
        }
    }
}