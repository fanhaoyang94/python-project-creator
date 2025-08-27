import * as fs from 'fs';
import * as path from 'path';
import * as os from 'os';

export function ensureDirectoryExists(dirPath: string): void {
    if (!fs.existsSync(dirPath)) {
        fs.mkdirSync(dirPath, { recursive: true });
    }
}

export function expandPath(filePath: string): string {
    if (filePath.startsWith('~')) {
        return path.join(os.homedir(), filePath.slice(1));
    }
    return filePath;
}

export function pathExists(filePath: string): boolean {
    return fs.existsSync(filePath);
}

export function isDirectoryEmpty(dirPath: string): boolean {
    if (!fs.existsSync(dirPath)) {
        return true;
    }
    const files = fs.readdirSync(dirPath);
    return files.length === 0;
}

export function hasWritePermission(dirPath: string): boolean {
    try {
        fs.accessSync(dirPath, fs.constants.W_OK);
        return true;
    } catch {
        return false;
    }
}

export async function createFile(filePath: string, content: string): Promise<void> {
    const dir = path.dirname(filePath);
    ensureDirectoryExists(dir);
    fs.writeFileSync(filePath, content, 'utf8');
}

export function getDiskSpace(dirPath: string): { available: number; total: number } {
    try {
        const stats = fs.statSync(dirPath);
        return { available: stats.size, total: stats.size };
    } catch {
        return { available: 0, total: 0 };
    }
}