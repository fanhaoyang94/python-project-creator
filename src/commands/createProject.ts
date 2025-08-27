import * as vscode from 'vscode';
import * as path from 'path';

import { ProjectWizard } from '../ui/projectWizard';
import { ProjectGenerator, ProjectOptions } from '../core/projectGenerator';
import { logger } from '../utils/logger';
import { pathExists } from '../utils/fileSystem';

export async function createProjectCommand(context: vscode.ExtensionContext): Promise<void> {
    try {
        logger.info('Starting Python project creation wizard');

        const wizardResult = await ProjectWizard.run();
        if (!wizardResult) {
            logger.info('Project creation cancelled by user');
            return;
        }

        const projectFullPath = path.join(wizardResult.projectPath, wizardResult.projectName);
        
        if (pathExists(projectFullPath)) {
            const overwrite = await vscode.window.showWarningMessage(
                `目录 "${projectFullPath}" 已存在，是否覆盖？`,
                { modal: true },
                '覆盖',
                '取消'
            );

            if (overwrite !== '覆盖') {
                return;
            }
        }

        const options: ProjectOptions = {
            name: wizardResult.projectName,
            path: wizardResult.projectPath,
            template: wizardResult.template,
            pythonVersion: wizardResult.pythonVersion,
            initializeGit: wizardResult.initializeGit,
            installDependencies: wizardResult.installDependencies
        };

        logger.info(`Creating project with options: ${JSON.stringify(options, null, 2)}`);

        const result = await vscode.window.withProgress({
            location: vscode.ProgressLocation.Notification,
            title: '正在创建 Python 项目...',
            cancellable: false
        }, async (progress) => {
            return await ProjectGenerator.createProject(options, progress);
        });

        if (result.success) {
            const openProject = await vscode.window.showInformationMessage(
                `项目 "${wizardResult.projectName}" 创建成功！`,
                '打开项目',
                '在新窗口中打开',
                '稍后'
            );

            if (openProject === '打开项目') {
                await vscode.commands.executeCommand(
                    'vscode.openFolder',
                    vscode.Uri.file(result.projectPath!)
                );
            } else if (openProject === '在新窗口中打开') {
                await vscode.commands.executeCommand(
                    'vscode.openFolder',
                    vscode.Uri.file(result.projectPath!),
                    true
                );
            }

            logger.info(`Project created successfully: ${result.projectPath}`);
        } else {
            vscode.window.showErrorMessage(`项目创建失败: ${result.error}`);
            logger.error(`Project creation failed: ${result.error}`);
        }

    } catch (error) {
        const errorMessage = `项目创建过程中出现错误: ${error}`;
        vscode.window.showErrorMessage(errorMessage);
        logger.error('Unexpected error in createProjectCommand', error as Error);
    }
}