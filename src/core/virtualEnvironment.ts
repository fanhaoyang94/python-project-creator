import * as path from 'path';
import { exec } from 'child_process';
import { promisify } from 'util';
import * as vscode from 'vscode';
import { PythonVersion } from './pythonDetector';
import { logger } from '../utils/logger';
import { pathExists } from '../utils/fileSystem';

const execAsync = promisify(exec);

export interface VirtualEnvironmentResult {
    success: boolean;
    venvPath?: string;
    pythonPath?: string;
    error?: string;
}

export class VirtualEnvironmentManager {
    static async createVirtualEnvironment(
        projectPath: string,
        pythonVersion: PythonVersion,
        progress?: vscode.Progress<{ message?: string; increment?: number }>
    ): Promise<VirtualEnvironmentResult> {
        const venvPath = path.join(projectPath, '.venv');
        
        try {
            progress?.report({ message: '正在创建虚拟环境...', increment: 20 });
            
            await execAsync(`"${pythonVersion.path}" -m venv "${venvPath}"`);
            
            if (!pathExists(venvPath)) {
                throw new Error('虚拟环境创建失败');
            }

            progress?.report({ message: '正在升级 pip...', increment: 30 });
            
            const pythonPath = this.getVenvPythonPath(venvPath);
            const pipPath = this.getVenvPipPath(venvPath);
            
            try {
                await execAsync(`"${pythonPath}" -m pip install --upgrade pip`);
            } catch (error) {
                logger.warn(`Failed to upgrade pip: ${error}`);
            }

            progress?.report({ message: '虚拟环境创建完成', increment: 50 });

            return {
                success: true,
                venvPath,
                pythonPath
            };

        } catch (error: any) {
            logger.error('Failed to create virtual environment', error);
            return {
                success: false,
                error: error.message || '虚拟环境创建失败'
            };
        }
    }

    static async installDependencies(
        projectPath: string,
        dependencies: string[],
        isDev: boolean = false,
        progress?: vscode.Progress<{ message?: string; increment?: number }>
    ): Promise<boolean> {
        if (dependencies.length === 0) {
            return true;
        }

        const venvPath = path.join(projectPath, '.venv');
        const pythonPath = this.getVenvPythonPath(venvPath);

        try {
            const depType = isDev ? '开发依赖' : '依赖';
            progress?.report({ message: `正在安装${depType}...` });

            const command = `"${pythonPath}" -m pip install ${dependencies.join(' ')}`;
            await execAsync(command);

            progress?.report({ message: `${depType}安装完成` });
            return true;

        } catch (error) {
            logger.error(`Failed to install dependencies: ${dependencies.join(', ')}`, error as Error);
            return false;
        }
    }

    private static getVenvPipPath(venvPath: string): string {
        const isWindows = process.platform === 'win32';
        return isWindows 
            ? path.join(venvPath, 'Scripts', 'pip.exe')
            : path.join(venvPath, 'bin', 'pip');
    }

    private static getVenvPythonPath(venvPath: string): string {
        const isWindows = process.platform === 'win32';
        return isWindows 
            ? path.join(venvPath, 'Scripts', 'python.exe')
            : path.join(venvPath, 'bin', 'python');
    }

    static async configureVSCodePython(projectPath: string): Promise<void> {
        const venvPath = path.join(projectPath, '.venv');
        const pythonPath = this.getVenvPythonPath(venvPath);

        try {
            const workspaceConfig = vscode.workspace.getConfiguration('python', vscode.Uri.file(projectPath));
            await workspaceConfig.update('defaultInterpreterPath', pythonPath, vscode.ConfigurationTarget.Workspace);
            
            logger.info(`Configured VSCode Python interpreter: ${pythonPath}`);
        } catch (error) {
            logger.error('Failed to configure VSCode Python interpreter', error as Error);
        }
    }
}