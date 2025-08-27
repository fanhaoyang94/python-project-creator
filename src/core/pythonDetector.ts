import { exec } from 'child_process';
import { promisify } from 'util';
import { logger } from '../utils/logger';

const execAsync = promisify(exec);

export interface PythonVersion {
    path: string;
    version: string;
    isValid: boolean;
}

export class PythonDetector {
    private static readonly MIN_PYTHON_VERSION = [3, 8, 0];

    static async detectPythonVersions(): Promise<PythonVersion[]> {
        const pythonCommands = ['python3', 'python', 'py'];
        const versions: PythonVersion[] = [];

        for (const command of pythonCommands) {
            try {
                const version = await this.getPythonVersion(command);
                if (version) {
                    versions.push(version);
                }
            } catch (error) {
                logger.debug(`Failed to detect Python with command '${command}': ${error}`);
            }
        }

        return this.deduplicateVersions(versions);
    }

    private static async getPythonVersion(command: string): Promise<PythonVersion | null> {
        try {
            const { stdout: versionOutput } = await execAsync(`${command} --version`);
            const { stdout: pathOutput } = await execAsync(`${command} -c "import sys; print(sys.executable)"`);

            const versionMatch = versionOutput.match(/Python (\d+\.\d+\.\d+)/);
            if (!versionMatch) {
                return null;
            }

            const version = versionMatch[1];
            const path = pathOutput.trim();
            const isValid = this.isVersionSupported(version);

            return { path, version, isValid };
        } catch {
            return null;
        }
    }

    private static isVersionSupported(version: string): boolean {
        const [major, minor, patch] = version.split('.').map(Number);
        const [minMajor, minMinor, minPatch] = this.MIN_PYTHON_VERSION;

        if (major > minMajor) return true;
        if (major < minMajor) return false;
        if (minor > minMinor) return true;
        if (minor < minMinor) return false;
        return patch >= minPatch;
    }

    private static deduplicateVersions(versions: PythonVersion[]): PythonVersion[] {
        const seen = new Set<string>();
        return versions.filter(version => {
            if (seen.has(version.path)) {
                return false;
            }
            seen.add(version.path);
            return true;
        });
    }

    static async getDefaultPython(): Promise<PythonVersion | null> {
        const versions = await this.detectPythonVersions();
        const validVersions = versions.filter(v => v.isValid);
        
        if (validVersions.length === 0) {
            return null;
        }

        return validVersions.sort((a, b) => b.version.localeCompare(a.version))[0];
    }
}