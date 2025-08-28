# Python Project Creator - VSCode Extension

## 项目概述

Python Project Creator 是一个 VSCode 扩展，旨在简化 Python 项目的创建过程。通过一键式操作和引导式设置，开发者可以快速创建标准化的 Python 项目结构，包含虚拟环境、基础文件和最佳实践配置。

## 核心功能

### 1. 一键项目创建
- **触发方式**: 在 VSCode Explorer 中显示 "Create Python Project" 按钮（仅当未打开文件夹时显示）
- **快捷命令**: 通过命令面板执行 `Python Project Creator: New Project`
- **快捷键**: 可配置的快捷键绑定（默认: `Ctrl+Shift+P` 然后输入命令）

### 2. 引导式项目设置
- **项目名称输入**: 
  - 验证项目名称合法性（不包含特殊字符）
  - 支持中文和英文项目名称
  - 自动生成合规的文件夹名称
- **项目位置选择**:
  - 提供文件夹选择对话框
  - 默认位置：用户主目录或配置的默认项目路径
  - 路径验证和权限检查

### 3. 自动虚拟环境创建
- **Python 环境检测**:
  - 自动检测系统中可用的 Python 版本
  - 支持 Python 3.8+ 版本
  - 提供 Python 版本选择（如果有多个版本）
- **虚拟环境创建**:
  - 使用 `python -m venv .venv` 创建虚拟环境
  - 自动激活虚拟环境（在集成终端中）
  - 配置 VSCode 的 Python 解释器路径

### 4. 项目结构初始化
生成的项目包含以下文件和目录：

```
project_name/
├── .venv/                 # 虚拟环境
├── .vscode/              # VSCode 配置
│   ├── settings.json     # 项目设置
│   └── launch.json       # 调试配置
├── src/                  # 源代码目录
│   ├── __init__.py
│   └── main.py           # 主程序入口
├── tests/                # 测试目录
│   ├── __init__.py
│   └── test_main.py      # 示例测试
├── docs/                 # 文档目录
├── .gitignore            # Git 忽略文件
├── requirements.txt      # 依赖管理
├── requirements-dev.txt  # 开发依赖
├── README.md             # 项目说明
├── setup.py              # 包安装配置（可选）
└── pyproject.toml        # 现代 Python 项目配置
```

### 5. 模板文件内容

#### main.py 模板
```python
#!/usr/bin/env python3
"""
Main application entry point.
"""

def main():
    """Main function."""
    print("Hello, Python Project!")
    print("Project created successfully!")

if __name__ == "__main__":
    main()
```

#### requirements.txt 模板
```
# Production dependencies
# Add your project dependencies here
# Example:
# requests>=2.28.0
# flask>=2.2.0
```

#### .gitignore 模板
```
# Python
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
```

### 6. 无缝 VSCode 集成
- **自动打开项目**: 在当前 VSCode 窗口中打开新创建的项目
- **Python 解释器配置**: 自动设置项目的 Python 解释器为虚拟环境中的 Python
- **调试配置**: 预配置 Python 调试设置
- **扩展推荐**: 推荐安装相关的 Python 开发扩展

## 用户体验优化

### 进度指示和反馈
- **创建进度条**: 显示项目创建的各个步骤进度
- **实时状态更新**: 在状态栏显示当前操作状态
- **成功提示**: 项目创建成功后显示确认消息和后续操作建议
- **错误处理**: 友好的错误提示和解决方案建议

### 操作取消和恢复
- **取消操作**: 在任何步骤都可以取消项目创建
- **清理机制**: 取消时自动清理已创建的部分文件
- **操作历史**: 记录最近创建的项目位置

## 高级功能

### 1. 项目模板系统
- **内置模板**:
  - Basic Python Project（基础项目）
  - Flask Web Application（Flask Web 应用）
  - Data Science Project（数据科学项目）
  - CLI Application（命令行工具）
- **自定义模板**:
  - 用户可以创建和保存自定义项目模板
  - 模板导入/导出功能
  - 团队模板共享

### 2. 依赖管理增强
- **智能依赖推荐**: 基于项目类型推荐常用依赖包
- **批量安装**: 可选择性安装推荐的开发工具（pytest, black, flake8 等）
- **虚拟环境管理**: 支持不同的虚拟环境管理工具（venv, conda, poetry）

### 3. Git 集成
- **Git 初始化**: 可选的 Git 仓库初始化
- **初始提交**: 创建初始提交
- **远程仓库**: 支持关联 GitHub/GitLab 远程仓库

### 4. 配置和自定义
- **用户偏好设置**:
  - 默认项目位置
  - 首选 Python 版本
  - 模板选择
  - 自动安装的依赖包
- **工作区设置**: 特定于项目的 VSCode 配置

## 错误处理和验证

### 系统环境检查
- **Python 安装检测**: 验证系统是否安装了 Python
- **版本兼容性**: 检查 Python 版本是否符合要求（3.8+）
- **权限验证**: 检查目标目录的读写权限

### 输入验证
- **项目名称验证**:
  - 不能为空
  - 不包含非法字符（`/`, `\`, `:`, `*`, `?`, `"`, `<`, `>`, `|`）
  - 长度限制（1-100 字符）
- **路径验证**:
  - 目标路径存在性检查
  - 磁盘空间充足性检查
  - 同名文件夹冲突处理

### 错误恢复
- **网络错误**: 依赖安装失败时的重试机制
- **磁盘空间不足**: 提供清理建议和最小化安装选项
- **权限问题**: 提供权限修复指导

## 技术架构

### VSCode API 使用
- **Commands API**: 注册扩展命令
- **TreeView API**: 在 Explorer 中添加自定义视图
- **Window API**: 用户输入对话框和进度显示
- **Workspace API**: 项目文件夹操作和配置
- **Terminal API**: 集成终端命令执行

### 核心模块设计
```
src/
├── extension.ts          # 扩展主入口
├── commands/            # 命令处理
│   ├── createProject.ts
│   └── templateManager.ts
├── ui/                  # 用户界面
│   ├── projectWizard.ts
│   └── progressView.ts
├── core/               # 核心逻辑
│   ├── pythonDetector.ts
│   ├── projectGenerator.ts
│   └── templateEngine.ts
├── utils/              # 工具函数
│   ├── fileSystem.ts
│   ├── validation.ts
│   └── logger.ts
└── templates/          # 项目模板
    ├── basic/
    ├── flask/
    └── datascience/
```

### 配置架构
```json
{
  "python-project-creator.defaultProjectPath": "~/Projects",
  "python-project-creator.preferredPythonVersion": "auto",
  "python-project-creator.autoInstallDevDeps": true,
  "python-project-creator.defaultTemplate": "basic",
  "python-project-creator.gitInitialization": true,
  "python-project-creator.customTemplatesPath": "~/.vscode/python-templates"
}
```

## 开发计划

### Phase 1: 核心功能 (MVP)
- [ ] 基础项目创建功能
- [ ] 虚拟环境自动创建
- [ ] 基本文件模板生成
- [ ] VSCode 集成

### Phase 2: 用户体验优化
- [ ] 引导式设置 UI
- [ ] 进度指示器
- [ ] 错误处理和验证
- [ ] 配置系统

### Phase 3: 高级功能
- [ ] 多项目模板支持
- [ ] Git 集成
- [ ] 依赖管理增强
- [ ] 自定义模板系统

### Phase 4: 企业功能
- [ ] 团队模板共享
- [ ] 项目模板市场
- [ ] 统计和分析
- [ ] CI/CD 集成

## 安装和使用

### 系统要求
- VSCode 1.70.0 或更高版本
- Python 3.8 或更高版本
- Node.js 16.0 或更高版本（开发时需要）

### 安装方式
1. **从 VSCode Marketplace 安装**（计划中）
2. **从 VSIX 文件安装**
   - 下载 `.vsix` 文件
   - 在 VSCode 中按 `Ctrl+Shift+P` 打开命令面板
   - 输入 "Extensions: Install from VSIX..."
   - 选择下载的 `.vsix` 文件
   - 重启 VSCode
3. **开发模式运行**

### 使用步骤
1. 打开 VSCode（确保没有打开任何文件夹）
2. 在 Explorer 面板点击 "Create Python Project" 按钮
3. 按照向导提示完成项目配置
4. 等待项目创建完成
5. 开始 Python 开发！

## 贡献指南

### 开发环境设置
```bash
# 克隆项目  
git clone https://github.com/changfan/python-project-creator
cd python-project-creator

# 安装依赖
npm install

# 编译和运行
npm run compile
# 按 F5 启动扩展开发主机
```

### 打包扩展
```bash
# 安装打包工具（首次使用）
npm run install-vsce

# 打包为 VSIX 文件
npm run package

# 打包后会生成 python-project-creator-1.0.0.vsix 文件
```

### 测试
```bash
# 运行单元测试
npm run test

# 运行集成测试
npm run test:integration

# 代码覆盖率
npm run coverage
```

## 许可证

MIT License

## 更新日志

### v1.0.0 (计划中)
- 初始版本发布
- 基础项目创建功能
- 虚拟环境支持
- 基本文件模板

### 路线图
- v1.1.0: 多模板支持
- v1.2.0: Git 集成
- v2.0.0: 高级配置和自定义功能

## 支持和反馈

- **GitHub Issues**: 报告问题或建议功能
- **文档**: 完整文档
- **示例**: 项目示例

---

*该项目旨在提升 Python 开发者的项目创建体验，通过自动化和标准化来提高开发效率。*