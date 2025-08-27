export interface ValidationResult {
    isValid: boolean;
    error?: string;
}

export function validateProjectName(name: string): ValidationResult {
    if (!name || name.trim().length === 0) {
        return { isValid: false, error: '项目名称不能为空' };
    }

    if (name.length > 100) {
        return { isValid: false, error: '项目名称不能超过100个字符' };
    }

    const invalidChars = /[\/\\:*?"<>|]/;
    if (invalidChars.test(name)) {
        return { isValid: false, error: '项目名称不能包含以下字符: / \\ : * ? " < > |' };
    }

    return { isValid: true };
}

export function sanitizeProjectName(name: string): string {
    return name.trim()
        .replace(/[\/\\:*?"<>|]/g, '')
        .replace(/\s+/g, '_')
        .toLowerCase();
}