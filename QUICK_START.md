# MCP Copilot Logger - 快速开始

## 🚀 一键启动

```bash
cd /Users/zhw/zhw/project/mcps/mcp-copilot-logger
npm run start:mcp
```

## 🧪 测试服务

在另一个终端窗口中运行：

```bash
npm run test:mcp
```

## 📋 在 Copilot 中配置

### 1. GitHub Copilot Desktop App
如果您使用 GitHub Copilot 桌面应用，请在设置中添加：

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

### 2. VS Code with Copilot
1. 打开 VS Code 设置
2. 搜索 "MCP Servers"
3. 添加上述配置

## ✨ 功能概述

- 🎯 **智能筛选**: 只记录有价值的问题
- 📝 **结构化记录**: 标准化的问题记录格式
- 💡 **价值说明**: 为每个问题提供记录理由
- 📋 **Obsidian 导出**: 自动生成 Markdown 文档

## 🔗 API 端点

- `GET /mcp/manifest` - 获取服务清单
- `POST /mcp/tools/log_problem` - 记录问题
- `GET /mcp/tools/get_problems` - 获取问题列表
- `POST /mcp/tools/export_to_obsidian` - 导出到 Obsidian

## 📚 详细文档

查看 [COPILOT_USAGE.md](./COPILOT_USAGE.md) 了解详细使用说明。
