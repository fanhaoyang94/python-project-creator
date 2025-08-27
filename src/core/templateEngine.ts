export interface ProjectTemplate {
    name: string;
    displayName: string;
    description: string;
    dependencies: string[];
    devDependencies: string[];
    files: TemplateFile[];
    directories: string[];
}

export interface TemplateFile {
    path: string;
    content: string;
}

export class TemplateEngine {
    private static templates: Map<string, ProjectTemplate> = new Map();

    static {
        this.initializeTemplates();
    }

    private static initializeTemplates(): void {
        this.templates.set('basic', {
            name: 'basic',
            displayName: '基础 Python 项目',
            description: '包含基本目录结构和配置文件的标准 Python 项目',
            dependencies: [],
            devDependencies: ['pytest>=7.0.0', 'black>=22.0.0', 'flake8>=5.0.0'],
            directories: ['src', 'tests', 'docs'],
            files: [
                {
                    path: 'src/__init__.py',
                    content: ''
                },
                {
                    path: 'src/main.py',
                    content: this.getMainPyTemplate()
                },
                {
                    path: 'tests/__init__.py',
                    content: ''
                },
                {
                    path: 'tests/test_main.py',
                    content: this.getTestMainTemplate()
                },
                {
                    path: 'requirements.txt',
                    content: this.getRequirementsTemplate()
                },
                {
                    path: 'requirements-dev.txt',
                    content: this.getDevRequirementsTemplate()
                },
                {
                    path: '.gitignore',
                    content: this.getGitignoreTemplate()
                },
                {
                    path: 'README.md',
                    content: this.getReadmeTemplate('{{PROJECT_NAME}}')
                },
                {
                    path: 'pyproject.toml',
                    content: this.getPyprojectTemplate('{{PROJECT_NAME}}')
                }
            ]
        });

        this.templates.set('flask', {
            name: 'flask',
            displayName: 'Flask Web 应用',
            description: '基于 Flask 框架的 Web 应用项目模板',
            dependencies: ['flask>=2.2.0', 'python-dotenv>=0.19.0'],
            devDependencies: ['pytest>=7.0.0', 'black>=22.0.0', 'flake8>=5.0.0'],
            directories: ['app', 'tests', 'docs', 'static', 'templates'],
            files: [
                {
                    path: 'app/__init__.py',
                    content: this.getFlaskInitTemplate()
                },
                {
                    path: 'app/routes.py',
                    content: this.getFlaskRoutesTemplate()
                },
                {
                    path: 'run.py',
                    content: this.getFlaskRunTemplate()
                },
                {
                    path: '.env.example',
                    content: this.getFlaskEnvTemplate()
                },
                {
                    path: 'requirements.txt',
                    content: this.getRequirementsTemplate('flask>=2.2.0\npython-dotenv>=0.19.0')
                },
                {
                    path: 'requirements-dev.txt',
                    content: this.getDevRequirementsTemplate()
                },
                {
                    path: '.gitignore',
                    content: this.getGitignoreTemplate()
                },
                {
                    path: 'README.md',
                    content: this.getFlaskReadmeTemplate('{{PROJECT_NAME}}')
                }
            ]
        });

        this.templates.set('data-science', {
            name: 'data-science',
            displayName: '数据科学项目',
            description: '包含 Jupyter Notebook 和常用数据科学库的项目模板',
            dependencies: ['pandas>=1.5.0', 'numpy>=1.21.0', 'matplotlib>=3.5.0', 'jupyter>=1.0.0'],
            devDependencies: ['pytest>=7.0.0', 'black>=22.0.0'],
            directories: ['notebooks', 'data', 'src', 'results', 'docs'],
            files: [
                {
                    path: 'src/__init__.py',
                    content: ''
                },
                {
                    path: 'notebooks/01_data_exploration.ipynb',
                    content: this.getJupyterNotebookTemplate()
                },
                {
                    path: 'requirements.txt',
                    content: this.getRequirementsTemplate('pandas>=1.5.0\nnumpy>=1.21.0\nmatplotlib>=3.5.0\njupyter>=1.0.0')
                },
                {
                    path: 'requirements-dev.txt',
                    content: this.getDevRequirementsTemplate()
                },
                {
                    path: '.gitignore',
                    content: this.getDataScienceGitignoreTemplate()
                },
                {
                    path: 'README.md',
                    content: this.getDataScienceReadmeTemplate('{{PROJECT_NAME}}')
                }
            ]
        });

        this.templates.set('cli', {
            name: 'cli',
            displayName: 'CLI 应用',
            description: '命令行工具项目模板',
            dependencies: ['click>=8.0.0'],
            devDependencies: ['pytest>=7.0.0', 'black>=22.0.0', 'flake8>=5.0.0'],
            directories: ['src', 'tests', 'docs'],
            files: [
                {
                    path: 'src/__init__.py',
                    content: ''
                },
                {
                    path: 'src/main.py',
                    content: this.getCliMainTemplate()
                },
                {
                    path: 'src/cli.py',
                    content: this.getCliTemplate()
                },
                {
                    path: 'requirements.txt',
                    content: this.getRequirementsTemplate('click>=8.0.0')
                },
                {
                    path: 'requirements-dev.txt',
                    content: this.getDevRequirementsTemplate()
                },
                {
                    path: '.gitignore',
                    content: this.getGitignoreTemplate()
                },
                {
                    path: 'README.md',
                    content: this.getCliReadmeTemplate('{{PROJECT_NAME}}')
                },
                {
                    path: 'setup.py',
                    content: this.getSetupPyTemplate('{{PROJECT_NAME}}')
                }
            ]
        });
    }

    static getTemplate(name: string): ProjectTemplate | undefined {
        return this.templates.get(name);
    }

    static getAvailableTemplates(): ProjectTemplate[] {
        return Array.from(this.templates.values());
    }

    static renderTemplate(template: string, variables: Record<string, string>): string {
        let result = template;
        for (const [key, value] of Object.entries(variables)) {
            result = result.replace(new RegExp(`{{${key}}}`, 'g'), value);
        }
        return result;
    }

    private static getMainPyTemplate(): string {
        return `#!/usr/bin/env python3
"""
Main application entry point.
"""


def main():
    """Main function."""
    print("Hello, Python Project!")
    print("Project created successfully!")


if __name__ == "__main__":
    main()
`;
    }

    private static getTestMainTemplate(): string {
        return `import unittest
from src.main import main


class TestMain(unittest.TestCase):
    def test_main_function_exists(self):
        """Test that main function exists and is callable."""
        self.assertTrue(callable(main))


if __name__ == '__main__':
    unittest.main()
`;
    }

    private static getRequirementsTemplate(content = ''): string {
        return `# Production dependencies
# Add your project dependencies here
# Example:
# requests>=2.28.0
# flask>=2.2.0
${content}
`;
    }

    private static getDevRequirementsTemplate(): string {
        return `# Development dependencies
pytest>=7.0.0
black>=22.0.0
flake8>=5.0.0
mypy>=0.991
`;
    }

    private static getGitignoreTemplate(): string {
        return `# Python
__pycache__/
*.py[cod]
*$py.class
*.so
.Python
build/
develop-eggs/
dist/
downloads/
eggs/
.eggs/
lib/
lib64/
parts/
sdist/
var/
wheels/
*.egg-info/
.installed.cfg
*.egg

# Virtual Environment
.venv/
venv/
ENV/

# IDE
.vscode/
.idea/
*.swp
*.swo

# Testing
.pytest_cache/
.coverage
htmlcov/

# OS
.DS_Store
Thumbs.db
`;
    }

    private static getDataScienceGitignoreTemplate(): string {
        return this.getGitignoreTemplate() + `
# Data Science specific
.ipynb_checkpoints/
data/
*.csv
*.json
*.parquet
results/
models/
`;
    }

    private static getReadmeTemplate(projectName: string): string {
        return `# ${projectName}

项目描述

## 安装

1. 创建虚拟环境：
\`\`\`bash
python -m venv .venv
\`\`\`

2. 激活虚拟环境：
\`\`\`bash
# Windows
.venv\\Scripts\\activate
# macOS/Linux
source .venv/bin/activate
\`\`\`

3. 安装依赖：
\`\`\`bash
pip install -r requirements.txt
\`\`\`

## 使用

\`\`\`bash
python src/main.py
\`\`\`

## 开发

安装开发依赖：
\`\`\`bash
pip install -r requirements-dev.txt
\`\`\`

运行测试：
\`\`\`bash
pytest
\`\`\`

代码格式化：
\`\`\`bash
black src/ tests/
\`\`\`

## 许可证

MIT
`;
    }

    private static getPyprojectTemplate(projectName: string): string {
        return `[build-system]
requires = ["setuptools>=45", "wheel"]
build-backend = "setuptools.build_meta"

[project]
name = "${projectName}"
version = "0.1.0"
description = ""
authors = [
    {name = "Your Name", email = "your.email@example.com"},
]
license = {text = "MIT"}
readme = "README.md"
requires-python = ">=3.8"

[tool.black]
line-length = 88
target-version = ['py38']

[tool.flake8]
max-line-length = 88
extend-ignore = ["E203", "W503"]

[tool.pytest.ini_options]
testpaths = ["tests"]
`;
    }

    private static getFlaskInitTemplate(): string {
        return `from flask import Flask


def create_app():
    app = Flask(__name__)
    
    from . import routes
    app.register_blueprint(routes.bp)
    
    return app
`;
    }

    private static getFlaskRoutesTemplate(): string {
        return `from flask import Blueprint, render_template, jsonify

bp = Blueprint('main', __name__)


@bp.route('/')
def index():
    return jsonify({"message": "Hello, Flask!"})


@bp.route('/health')
def health():
    return jsonify({"status": "healthy"})
`;
    }

    private static getFlaskRunTemplate(): string {
        return `#!/usr/bin/env python3
from app import create_app

app = create_app()

if __name__ == '__main__':
    app.run(debug=True)
`;
    }

    private static getFlaskEnvTemplate(): string {
        return `# Flask configuration
FLASK_APP=run.py
FLASK_ENV=development
SECRET_KEY=your-secret-key-here
`;
    }

    private static getFlaskReadmeTemplate(projectName: string): string {
        return `# ${projectName}

Flask Web 应用

## 安装

1. 创建虚拟环境并安装依赖：
\`\`\`bash
python -m venv .venv
source .venv/bin/activate  # Windows: .venv\\Scripts\\activate
pip install -r requirements.txt
\`\`\`

2. 配置环境变量：
\`\`\`bash
cp .env.example .env
# 编辑 .env 文件，设置必要的配置
\`\`\`

## 运行

\`\`\`bash
python run.py
\`\`\`

访问：http://localhost:5000

## API

- \`GET /\` - 主页
- \`GET /health\` - 健康检查

## 开发

安装开发依赖：
\`\`\`bash
pip install -r requirements-dev.txt
\`\`\`

运行测试：
\`\`\`bash
pytest
\`\`\`
`;
    }

    private static getDataScienceReadmeTemplate(projectName: string): string {
        return `# ${projectName}

数据科学项目

## 项目结构

- \`notebooks/\` - Jupyter notebooks
- \`data/\` - 数据文件
- \`src/\` - 源代码
- \`results/\` - 分析结果
- \`docs/\` - 文档

## 安装

\`\`\`bash
python -m venv .venv
source .venv/bin/activate  # Windows: .venv\\Scripts\\activate
pip install -r requirements.txt
\`\`\`

## 使用

启动 Jupyter Lab：
\`\`\`bash
jupyter lab
\`\`\`

## 开发

安装开发依赖：
\`\`\`bash
pip install -r requirements-dev.txt
\`\`\`
`;
    }

    private static getJupyterNotebookTemplate(): string {
        return JSON.stringify({
            cells: [
                {
                    cell_type: "markdown",
                    metadata: {},
                    source: [
                        "# 数据探索\n",
                        "\n",
                        "这是一个数据科学项目的示例 notebook。"
                    ]
                },
                {
                    cell_type: "code",
                    execution_count: null,
                    metadata: {},
                    outputs: [],
                    source: [
                        "import pandas as pd\n",
                        "import numpy as np\n",
                        "import matplotlib.pyplot as plt\n",
                        "\n",
                        "print(\"数据科学项目已准备就绪！\")"
                    ]
                }
            ],
            metadata: {
                kernelspec: {
                    display_name: "Python 3",
                    language: "python",
                    name: "python3"
                },
                language_info: {
                    name: "python",
                    version: "3.8.0"
                }
            },
            nbformat: 4,
            nbformat_minor: 4
        }, null, 2);
    }

    private static getCliMainTemplate(): string {
        return `#!/usr/bin/env python3
"""
CLI application entry point.
"""
from .cli import cli


if __name__ == "__main__":
    cli()
`;
    }

    private static getCliTemplate(): string {
        return `import click


@click.command()
@click.option('--name', default='World', help='Name to greet.')
@click.option('--count', default=1, help='Number of greetings.')
def cli(name, count):
    """Simple CLI application."""
    for i in range(count):
        click.echo(f'Hello {name}!')


if __name__ == '__main__':
    cli()
`;
    }

    private static getCliReadmeTemplate(projectName: string): string {
        return `# ${projectName}

命令行工具

## 安装

\`\`\`bash
python -m venv .venv
source .venv/bin/activate  # Windows: .venv\\Scripts\\activate
pip install -r requirements.txt
\`\`\`

## 使用

\`\`\`bash
python -m src.main --name "Your Name" --count 3
\`\`\`

## 安装为全局命令

\`\`\`bash
pip install -e .
${projectName.toLowerCase().replace(/[^a-z0-9]/g, '-')} --help
\`\`\`

## 开发

安装开发依赖：
\`\`\`bash
pip install -r requirements-dev.txt
\`\`\`

运行测试：
\`\`\`bash
pytest
\`\`\`
`;
    }

    private static getSetupPyTemplate(projectName: string): string {
        return `from setuptools import setup, find_packages

with open("README.md", "r", encoding="utf-8") as fh:
    long_description = fh.read()

setup(
    name="${projectName}",
    version="0.1.0",
    author="Your Name",
    author_email="your.email@example.com",
    description="CLI application",
    long_description=long_description,
    long_description_content_type="text/markdown",
    packages=find_packages(),
    classifiers=[
        "Development Status :: 3 - Alpha",
        "Intended Audience :: Developers",
        "License :: OSI Approved :: MIT License",
        "Operating System :: OS Independent",
        "Programming Language :: Python :: 3",
        "Programming Language :: Python :: 3.8",
        "Programming Language :: Python :: 3.9",
        "Programming Language :: Python :: 3.10",
        "Programming Language :: Python :: 3.11",
    ],
    python_requires=">=3.8",
    install_requires=[
        "click>=8.0.0",
    ],
    entry_points={
        "console_scripts": [
            "${projectName.toLowerCase().replace(/[^a-z0-9]/g, '-')}=src.main:cli",
        ],
    },
)
`;
    }
}