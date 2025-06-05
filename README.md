# MCP Copilot Logger

## 🚀 概述
MCP Copilot Logger 是一个专业的开发工具，旨在通过自动跟踪开发过程中遇到的问题、评估其价值并将日志导出到 Obsidian 来增强编程体验。该服务与 Git 和 VSCode 无缝集成，提供实时日志记录和文档化功能。

## ✨ 主要特性
- **🔍 智能问题跟踪**: 自动捕获和存储开发过程中遇到的问题的详细数据
- **📊 价值评估系统**: 基于预定义标准评估记录问题的重要性
- **📝 Obsidian 完美集成**: 直接导出到您的 Obsidian Vault，生成高质量 Markdown 文档
- **🔄 Git 自动集成**: 实现 Git hooks，在提交时自动记录变更
- **💻 VSCode 深度集成**: 在 VSCode 编辑器内进行实时日志记录和交互
- **🎯 高价值问题筛选**: 智能识别并导出值得学习的技术问题
- **📚 知识管理系统**: 将开发问题转化为结构化的学习资产

## 📁 Obsidian 集成配置

### 自动导出路径
所有导出文档直接保存到您的 Obsidian Vault：
```
/Users/zhw/Documents/Obsidian Vault/mcp-copilot-logger/
├── 问题记录/           # 详细问题记录
├── 价值评估/           # 价值评估报告
├── 每日日志/           # 每日导出日志
├── 迭代报告/           # 项目迭代总结
└── DevLogs/            # 开发日志
```

### 配置文件
项目使用 `.mcp/config.json` 管理 Obsidian 集成：
```json
{
  "obsidian": {
    "enabled": true,
    "vaultPath": "/Users/zhw/Documents/Obsidian Vault/mcp-copilot-logger",
    "minExportScore": 6,
    "defaultTags": ["MCP", "问题解决", "开发日志"]
  }
}
```

## Project Structure
```
mcp-copilot-logger
├── src
│   ├── server
│   ├── types
│   ├── config
│   └── templates
├── scripts
├── vscode
├── tests
├── docs
├── .mcp
├── package.json
├── tsconfig.json
├── .gitignore
└── README.md
```

## Installation
1. Clone the repository:
   ```
   git clone <repository-url>
   cd mcp-copilot-logger
   ```

2. Install dependencies:
   ```
   npm install
   ```

3. Set up Git hooks:
   ```
   ./scripts/install-git-hooks.sh
   ```

4. Configure Obsidian integration:
   ```
   ./scripts/setup-obsidian.sh
   ```

## Usage

### 🚀 快速启动

1. **启动 MCP 服务**:
   ```bash
   npm run start:mcp
   ```

2. **测试服务**:
   ```bash
   npm run test:mcp
   ```

3. **配置 GitHub Copilot**:
   
   将以下配置添加到您的 Copilot 设置中：
   ```json
   {
     "mcpServers": {
       "mcp-copilot-logger": {
         "command": "node",
         "args": ["start-mcp.js"],
         "cwd": "/Users/zhw/zhw/project/mcps/mcp-copilot-logger"
       }
     }
   }
   ```

### 📚 详细使用说明

- 查看 [QUICK_START.md](./QUICK_START.md) 了解快速开始指南
- 查看 [COPILOT_USAGE.md](./COPILOT_USAGE.md) 了解详细的 Copilot 集成说明
- 查看 [docs/](./docs/) 目录了解更多技术文档

## Contributing
Contributions are welcome! Please submit a pull request or open an issue for any enhancements or bug fixes.

## License
This project is licensed under the MIT License. See the LICENSE file for more details.