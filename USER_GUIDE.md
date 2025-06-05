# 🎉 MCP Copilot Logger 使用指南

## 🚀 快速开始

### 1. 重启 VS Code
为了加载新的 MCP 配置，请：
1. 完全退出 VS Code (`Cmd + Q`)
2. 重新启动 VS Code
3. MCP 服务器将自动在后台启动

### 2. 验证 MCP 连接
在 VS Code 的输出面板中：
1. 打开 **View** → **Output**
2. 选择 **MCP Logs** 或 **Extensions**
3. 查看是否有 `mcp-copilot-logger` 连接成功的消息

### 3. 在 GitHub Copilot Chat 中使用

#### 基本语法
使用 `@mcp` 前缀调用 MCP 工具：

```
@mcp log_problem 记录我刚遇到的TypeScript类型错误问题
@mcp get_problems 查看今天记录的所有问题
@mcp export_to_obsidian 将问题导出到我的Obsidian笔记
```

#### 可用工具详解

##### 📝 `log_problem` - 记录开发问题
记录您遇到的开发问题和解决方案：

```
@mcp log_problem
描述：React组件状态更新后UI不刷新
错误：组件状态已更新但界面没有重新渲染
解决方案：使用useEffect添加依赖数组
标签：react, hooks, state
价值评分：8
```

**参数说明：**
- `description`: 问题的简短描述
- `error_message`: 具体的错误现象或信息  
- `solution`: 找到的解决方案
- `tags`: 相关标签，用逗号分隔
- `value_score`: 1-10的价值评分

##### 📤 `export_to_obsidian` - 导出到 Obsidian
将记录的问题导出到您的 Obsidian vault：

```
@mcp export_to_obsidian
问题ID：["1749009445401"]
格式：daily-log
```

**导出位置：** `/Users/zhw/Documents/Obsidian Vault/mcp-copilot-logger/`

##### 📋 `get_problems` - 获取问题列表
查看已记录的问题：

```
@mcp get_problems
过滤条件：react
```

##### 💎 `assess_value` - 评估问题价值
对已记录的问题进行价值评估：

```
@mcp assess_value
问题ID：1749009445401
花费时间：30
影响程度：high
学习收获：了解了React hooks的工作原理
```

## 🗂️ Obsidian 集成

### 自动导出功能
- 所有问题记录会自动保存到项目内存中
- 使用 `export_to_obsidian` 工具将问题导出为 Markdown 文件
- 文件会保存到 `/Users/zhw/Documents/Obsidian Vault/mcp-copilot-logger/`

### 文件结构
```
mcp-copilot-logger/
├── DevLogs/           # 开发日志
├── 问题记录/          # 问题记录分类
└── daily-log-*.md     # 每日导出文件
```

## 🔧 常见问题解决

### MCP 连接失败
1. **检查 VS Code 输出面板**
   - 查看 MCP 或 Extensions 日志
   - 寻找错误信息

2. **重启服务**
   ```bash
   # 终止可能的冲突进程
   lsof -ti:8529 | xargs kill -9
   
   # 重启 VS Code
   ```

3. **验证配置**
   ```bash
   # 检查启动脚本
   ls -la /Users/zhw/zhw/project/mcps/mcp-copilot-logger/start-mcp-silent.js
   
   # 测试 MCP 服务器
   cd /Users/zhw/zhw/project/mcps/mcp-copilot-logger
   npm run test:mcp
   ```

### 工具调用失败
1. **检查 Obsidian 目录权限**
   ```bash
   ls -la "/Users/zhw/Documents/Obsidian Vault/mcp-copilot-logger"
   ```

2. **确认依赖安装**
   ```bash
   cd /Users/zhw/zhw/project/mcps/mcp-copilot-logger
   npm install
   ```

### Obsidian 导出问题
1. **手动创建目录**
   ```bash
   mkdir -p "/Users/zhw/Documents/Obsidian Vault/mcp-copilot-logger/DevLogs"
   ```

2. **检查导出文件**
   ```bash
   ls -la "/Users/zhw/Documents/Obsidian Vault/mcp-copilot-logger/"
   ```

## 💡 最佳实践

### 问题记录技巧
- **描述清晰**：简明扼要地描述问题
- **记录过程**：包含错误信息和尝试的解决方法
- **价值评分**：客观评估问题的学习价值
- **及时标签**：使用相关的技术标签便于检索

### 价值评估标准
- **1-3分**：简单问题，解决方案显而易见
- **4-6分**：中等复杂度，需要一些思考和研究
- **7-8分**：复杂问题，解决方案有学习价值
- **9-10分**：非常复杂，解决方案可复用且有高价值

### 定期导出
建议每天结束工作时运行：
```
@mcp export_to_obsidian 导出今天的问题记录
```

## 🎯 工作流程示例

### 典型的开发问题记录流程：

1. **遇到问题时**
   ```
   @mcp log_problem
   描述：API调用返回CORS错误
   错误：Access to fetch at 'api.example.com' from origin 'localhost:3000' has been blocked by CORS policy
   解决方案：在后端添加CORS中间件配置
   标签：cors, api, javascript
   价值评分：6
   ```

2. **每日总结时**
   ```
   @mcp get_problems 查看今天记录的问题
   @mcp export_to_obsidian 导出到Obsidian进行长期管理
   ```

3. **复盘学习时**
   ```
   @mcp assess_value
   问题ID：[从get_problems获取的ID]
   花费时间：45
   影响程度：medium
   学习收获：学会了CORS的配置方法和安全原理
   ```

---

**🎉 现在您可以开始使用 MCP Copilot Logger 记录和管理您的开发问题了！**

记住：重启 VS Code 后即可在 GitHub Copilot Chat 中使用 `@mcp` 命令。
