import * as path from 'path';
import * as vscode from 'vscode';
import { exec } from 'child_process';
import { promisify } from 'util';

import { TemplateEngine, ProjectTemplate } from './templateEngine';
import { VirtualEnvironmentManager } from './virtualEnvironment';
import { PythonVersion } from './pythonDetector';
import { createFile, ensureDirectoryExists } from '../utils/fileSystem';
import { logger } from '../utils/logger';

const execAsync = promisify(exec);

export interface ProjectOptions {
    name: string;
    path: string;
    template: string;
    pythonVersion: PythonVersion;
    initializeGit: boolean;
    installDependencies: boolean;
}

export interface ProjectCreationResult {
    success: boolean;
    projectPath?: string;
    error?: string;
}

export class ProjectGenerator {
    static async createProject(
        options: ProjectOptions,
        progress: vscode.Progress<{ message?: string; increment?: number }>
    ): Promise<ProjectCreationResult> {
        const projectPath = path.join(options.path, options.name);
        
        try {
            progress.report({ message: '正在创建项目目录...', increment: 5 });
            
            ensureDirectoryExists(projectPath);
            
            progress.report({ message: '正在生成项目结构...', increment: 10 });
            
            await this.generateProjectStructure(projectPath, options.template, options.name, progress);
            
            progress.report({ message: '正在创建虚拟环境...', increment: 20 });
            
            const venvResult = await VirtualEnvironmentManager.createVirtualEnvironment(
                projectPath,
                options.pythonVersion,
                progress
            );

            if (!venvResult.success) {
                throw new Error(venvResult.error || '虚拟环境创建失败');
            }

            if (options.installDependencies) {
                progress.report({ message: '正在安装依赖...', increment: 30 });
                await this.installProjectDependencies(projectPath, options.template, progress);
            }

            progress.report({ message: '正在配置 VSCode...', increment: 20 });
            await this.setupVSCodeConfiguration(projectPath, venvResult.pythonPath!);

            if (options.initializeGit) {
                progress.report({ message: '正在初始化 Git 仓库...', increment: 10 });
                await this.initializeGitRepository(projectPath);
            }

            progress.report({ message: '项目创建完成！', increment: 5 });

            return {
                success: true,
                projectPath
            };

        } catch (error: any) {
            logger.error('Failed to create project', error);
            return {
                success: false,
                error: error.message || '项目创建失败'
            };
        }
    }

    private static async generateProjectStructure(
        projectPath: string,
        templateName: string,
        projectName: string,
        progress: vscode.Progress<{ message?: string; increment?: number }>
    ): Promise<void> {
        const template = TemplateEngine.getTemplate(templateName);
        if (!template) {
            throw new Error(`未找到模板: ${templateName}`);
        }

        const variables = {
            PROJECT_NAME: projectName,
            PROJECT_PATH: projectPath
        };

        for (const directory of template.directories) {
            const dirPath = path.join(projectPath, directory);
            ensureDirectoryExists(dirPath);
        }

        for (const file of template.files) {
            const filePath = path.join(projectPath, file.path);
            const content = TemplateEngine.renderTemplate(file.content, variables);
            await createFile(filePath, content);
        }

        progress.report({ increment: 10 });
    }

    private static async installProjectDependencies(
        projectPath: string,
        templateName: string,
        progress: vscode.Progress<{ message?: string; increment?: number }>
    ): Promise<void> {
        const template = TemplateEngine.getTemplate(templateName);
        if (!template) {
            return;
        }

        if (template.dependencies.length > 0) {
            await VirtualEnvironmentManager.installDependencies(
                projectPath,
                template.dependencies,
                false,
                progress
            );
        }

        if (template.devDependencies.length > 0) {
            await VirtualEnvironmentManager.installDependencies(
                projectPath,
                template.devDependencies,
                true,
                progress
            );
        }
    }

    private static async setupVSCodeConfiguration(
        projectPath: string,
        pythonPath: string
    ): Promise<void> {
        const vscodeDir = path.join(projectPath, '.vscode');
        ensureDirectoryExists(vscodeDir);

        const settingsContent = {
            "python.defaultInterpreterPath": pythonPath,
            "python.terminal.activateEnvironment": true,
            "python.linting.enabled": true,
            "python.linting.flake8Enabled": true,
            "python.linting.pylintEnabled": false,
            "python.formatting.provider": "black",
            "python.testing.pytestEnabled": true,
            "python.testing.unittestEnabled": false,
            "python.testing.nosetestsEnabled": false,
            "files.exclude": {
                "**/__pycache__": true,
                "**/*.pyc": true,
                ".venv": true
            }
        };

        const launchContent = {
            "version": "0.2.0",
            "configurations": [
                {
                    "name": "Python: Current File",
                    "type": "python",
                    "request": "launch",
                    "program": "${file}",
                    "console": "integratedTerminal",
                    "justMyCode": true
                },
                {
                    "name": "Python: Main Module",
                    "type": "python",
                    "request": "launch",
                    "program": "${workspaceFolder}/src/main.py",
                    "console": "integratedTerminal",
                    "justMyCode": true
                }
            ]
        };

        await createFile(
            path.join(vscodeDir, 'settings.json'),
            JSON.stringify(settingsContent, null, 4)
        );

        await createFile(
            path.join(vscodeDir, 'launch.json'),
            JSON.stringify(launchContent, null, 4)
        );

        const extensionsContent = {
            "recommendations": [
                "ms-python.python",
                "ms-python.flake8",
                "ms-python.black-formatter",
                "ms-python.pylint"
            ]
        };

        await createFile(
            path.join(vscodeDir, 'extensions.json'),
            JSON.stringify(extensionsContent, null, 4)
        );
    }

    private static async initializeGitRepository(projectPath: string): Promise<void> {
        try {
            await execAsync('git init', { cwd: projectPath });
            await execAsync('git add .', { cwd: projectPath });
            await execAsync('git commit -m "Initial commit"', { cwd: projectPath });
            logger.info('Git repository initialized successfully');
        } catch (error) {
            logger.warn(`Failed to initialize Git repository: ${error}`);
        }
    }
}