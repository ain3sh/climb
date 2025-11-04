# 🌴 JungleCTL

**Interactive Terminal UI for MCPJungle**

JungleCTL is a beautiful, intuitive wrapper around the MCPJungle CLI that eliminates the need for flag memorization and manual JSON crafting. Built with TypeScript, node-pty, and Inquirer.js.

## ✨ Features

- 🎯 **Zero Flag Memorization** - Guided workflows for all operations
- 🔍 **Smart Autocomplete** - Search and filter servers, tools, and groups dynamically
- 🎨 **Beautiful UI** - Colors, spinners, tables, and progress indicators
- ⚡ **Performant** - Intelligent caching with TTL
- 🌐 **Cross-Platform** - Works on Linux, macOS, and Windows
- 🔧 **Full Feature Parity** - Access all MCPJungle features through an intuitive interface

## 🚀 Quick Start

### Prerequisites

- Node.js 18+
- MCPJungle CLI installed (`mcpjungle` in PATH)
- MCPJungle server running (http://localhost:8080 by default)

### Installation

```bash
# Install dependencies
npm install

# Run in development mode
npm run dev

# Build for production
npm run build
npm start
```

### Usage

```bash
# Interactive mode (recommended)
junglectl

# Or use the short alias
jctl
```

## 📋 Main Menu

```
┌─────────────────────────────────────────────┐
│  🌴 JungleCTL v1.0.0                       │
│  MCPJungle Server: http://127.0.0.1:8080   │
│  Status: ✅ Connected | 5 servers, 23 tools │
└─────────────────────────────────────────────┘

? What would you like to do?
  ❯ 📋 Browse Tools
    🔧 Invoke Tool
    ➕ Register MCP Server
    📦 Manage Tool Groups
    🔌 Manage Servers
    🎯 Enable/Disable Tools
    ⚙️  Settings
    ❌ Exit
```

## 🏗️ Architecture

- **Core Executor** (`src/core/executor.ts`) - PTY-based command execution
- **Output Parser** (`src/core/parser.ts`) - Structured data extraction
- **Cache Layer** (`src/core/cache.ts`) - TTL-based caching for performance
- **Interactive Prompts** (`src/ui/prompts.ts`) - Reusable prompt builders
- **Commands** (`src/commands/`) - Feature implementations

## 🛠️ Development

```bash
# Type checking
npm run type-check

# Watch mode
npm run watch

# Clean build artifacts
npm run clean
```

## 📚 Documentation

- [MCPJungle Documentation](./docs/MCPJUNGLE_README.md)
- Project follows the official MCPJungle CLI specification

## 🤝 Contributing

Contributions are welcome! This project wraps MCPJungle without modifying its source.

## 📝 License

MIT License - See LICENSE file for details

---

Built with ❤️ for the MCPJungle community
