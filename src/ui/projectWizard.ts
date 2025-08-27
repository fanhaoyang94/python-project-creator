import * as vscode from 'vscode';
import * as path from 'path';
import * as os from 'os';

import { PythonDetector, PythonVersion } from '../core/pythonDetector';
import { TemplateEngine, ProjectTemplate } from '../core/templateEngine';
import { validateProjectName, sanitizeProjectName } from '../utils/validation';
import { pathExists, expandPath } from '../utils/fileSystem';
import { logger } from '../utils/logger';

export interface WizardResult {
    projectName: string;
    projectPath: string;
    template: string;
    pythonVersion: PythonVersion;
    initializeGit: boolean;
    installDependencies: boolean;
}

export class ProjectWizard {
    static async run(): Promise<WizardResult | undefined> {
        try {
            const projectName = await this.getProjectName();
            if (!projectName) {
                return undefined;
            }

            const projectPath = await this.getProjectPath();
            if (!projectPath) {
                return undefined;
            }

            const template = await this.getTemplate();
            if (!template) {
                return undefined;
            }

            const pythonVersion = await this.getPythonVersion();
            if (!pythonVersion) {
                return undefined;
            }

            const additionalOptions = await this.getAdditionalOptions();
            if (!additionalOptions) {
                return undefined;
            }

            return {
                projectName,
                projectPath,
                template,
                pythonVersion,
                ...additionalOptions
            };

        } catch (error) {
            logger.error('Error in project wizard', error as Error);
            vscode.window.showErrorMessage('项目创建向导出错，请检查日志');
            return undefined;
        }
    }

    private static async getProjectName(): Promise<string | undefined> {
        while (true) {
            const input = await vscode.window.showInputBox({
                prompt: '请输入项目名称',
                placeHolder: '例如：my-python-project',
                validateInput: (value) => {
                    const result = validateProjectName(value);
                    return result.isValid ? undefined : result.error;
                }
            });

            if (input === undefined) {
                return undefined;
            }

            const sanitized = sanitizeProjectName(input);
            if (sanitized !== input.trim()) {
                const useAutoFixed = await vscode.window.showWarningMessage(
                    `项目名称已自动修正为: "${sanitized}"`,
                    '使用修正后的名称',
                    '重新输入'
                );

                if (useAutoFixed === '使用修正后的名称') {
                    return sanitized;
                }
                continue;
            }

            return input.trim();
        }
    }

    private static async getProjectPath(): Promise<string | undefined> {
        const config = vscode.workspace.getConfiguration('python-project-creator');
        const defaultPath = config.get<string>('defaultProjectPath', '~/Projects');

        const options: vscode.QuickPickItem[] = [
            {
                label: '$(folder) 选择文件夹',
                description: '打开文件夹选择对话框'
            },
            {
                label: '$(home) 默认位置',
                description: expandPath(defaultPath),
                detail: defaultPath
            },
            {
                label: '$(desktop) 桌面',
                description: path.join(os.homedir(), 'Desktop'),
                detail: '~/Desktop'
            }
        ];

        const selected = await vscode.window.showQuickPick(options, {
            placeHolder: '选择项目创建位置'
        });

        if (!selected) {
            return undefined;
        }

        if (selected.label.includes('选择文件夹')) {
            const folderUri = await vscode.window.showOpenDialog({
                canSelectFolders: true,
                canSelectFiles: false,
                canSelectMany: false,
                title: '选择项目创建位置'
            });

            if (!folderUri || folderUri.length === 0) {
                return undefined;
            }

            return folderUri[0].fsPath;
        } else {
            return selected.description!;
        }
    }

    private static async getTemplate(): Promise<string | undefined> {
        const templates = TemplateEngine.getAvailableTemplates();
        const config = vscode.workspace.getConfiguration('python-project-creator');
        const defaultTemplate = config.get<string>('defaultTemplate', 'basic');

        const options: vscode.QuickPickItem[] = templates.map(template => ({
            label: template.displayName,
            description: template.name,
            detail: template.description,
            picked: template.name === defaultTemplate
        }));

        const selected = await vscode.window.showQuickPick(options, {
            placeHolder: '选择项目模板',
            canPickMany: false
        });

        return selected?.description;
    }

    private static async getPythonVersion(): Promise<PythonVersion | undefined> {
        await vscode.window.withProgress({
            location: vscode.ProgressLocation.Notification,
            title: '检测 Python 环境...',
            cancellable: false
        }, async () => {
            // Just show progress, actual detection happens next
        });

        const versions = await PythonDetector.detectPythonVersions();
        
        if (versions.length === 0) {
            vscode.window.showErrorMessage('未检测到 Python 环境，请先安装 Python 3.8+');
            return undefined;
        }

        const validVersions = versions.filter(v => v.isValid);
        if (validVersions.length === 0) {
            vscode.window.showErrorMessage('未检测到支持的 Python 版本，请安装 Python 3.8+');
            return undefined;
        }

        if (validVersions.length === 1) {
            return validVersions[0];
        }

        const options: vscode.QuickPickItem[] = validVersions.map(version => ({
            label: `Python ${version.version}`,
            description: version.path,
            detail: version.isValid ? '支持' : '版本过低'
        }));

        const selected = await vscode.window.showQuickPick(options, {
            placeHolder: '选择 Python 版本'
        });

        if (!selected) {
            return undefined;
        }

        return validVersions.find(v => v.path === selected.description);
    }

    private static async getAdditionalOptions(): Promise<{
        initializeGit: boolean;
        installDependencies: boolean;
    } | undefined> {
        const config = vscode.workspace.getConfiguration('python-project-creator');
        const defaultGitInit = config.get<boolean>('gitInitialization', true);
        const defaultInstallDeps = config.get<boolean>('autoInstallDevDeps', true);

        const gitOption = await vscode.window.showQuickPick([
            {
                label: '$(git-branch) 是',
                description: '初始化 Git 仓库',
                picked: defaultGitInit
            },
            {
                label: '$(circle-slash) 否',
                description: '不初始化 Git 仓库',
                picked: !defaultGitInit
            }
        ], {
            placeHolder: '是否初始化 Git 仓库？'
        });

        if (!gitOption) {
            return undefined;
        }

        const depsOption = await vscode.window.showQuickPick([
            {
                label: '$(package) 是',
                description: '自动安装项目依赖',
                picked: defaultInstallDeps
            },
            {
                label: '$(circle-slash) 否',
                description: '稍后手动安装依赖',
                picked: !defaultInstallDeps
            }
        ], {
            placeHolder: '是否自动安装项目依赖？'
        });

        if (!depsOption) {
            return undefined;
        }

        return {
            initializeGit: gitOption.label.includes('是'),
            installDependencies: depsOption.label.includes('是')
        };
    }
}