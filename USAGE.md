# JungleCTL Usage Guide

## 🚀 Quick Start

### Installation & Setup

1. **Prerequisites**
   ```bash
   # Ensure MCPJungle CLI is installed
   mcpjungle version
   
   # Start MCPJungle server (if not running)
   docker compose up -d
   # or
   mcpjungle start
   ```

2. **Install Dependencies**
   ```bash
   npm install
   ```

3. **Run JungleCTL**
   ```bash
   # Development mode
   npm run dev
   
   # Or build and run
   npm run build
   npm start
   ```

## 📚 Features Implemented (MVP v1.0)

### ✅ Core Features
- **Interactive Main Menu** - Navigate all features with arrow keys
- **Server Status Check** - Real-time connection status to MCPJungle
- **List Servers** - View all registered MCP servers with status
- **List Tools** - Browse all available tools, filter by server
- **List Groups** - View configured tool groups
- **List Prompts** - Browse available prompts
- **Register Server** - Interactive wizard for HTTP & STDIO servers

### 🎨 UI Features
- **Autocomplete Search** - Type to filter servers/tools/groups
- **Beautiful Tables** - Color-coded status, formatted output
- **Loading Spinners** - Visual feedback for async operations
- **Smart Caching** - Performance optimization with TTL cache
- **Error Handling** - Graceful error messages and recovery

## 🎯 Workflows

### Register a New Server

1. **HTTP Server (e.g., context7)**
   ```
   Select: ➕ Register MCP Server
   
   → Name: context7
   → Description: Library documentation MCP server
   → Transport: 🌐 Streamable HTTP
   → URL: https://mcp.context7.com/mcp
   → Authentication: No
   → Confirm: Yes
   ```

2. **STDIO Server (e.g., filesystem)**
   ```
   Select: ➕ Register MCP Server
   
   → Name: filesystem
   → Description: Local filesystem access
   → Transport: 🖥️ STDIO
   → Command: npx
   → Arguments: -y @modelcontextprotocol/server-filesystem /path/to/dir
   → Environment Variables: (optional)
   → Confirm: Yes
   ```

### Browse Tools

```
Select: 📋 Browse Resources → 🔧 Tools

Options:
  • All Tools - Show everything
  • Filter by Server - Show tools from specific server

(Type to search, arrow keys to navigate)
```

### Quick Views

```
Select: 🔌 Quick View: Servers
→ Shows formatted table of all servers

Select: 🔧 Quick View: Tools  
→ Shows formatted table of all tools
```

## 🎨 UI Examples

### Main Menu
```
  🌴 JungleCTL v1.0.0

  Server: http://127.0.0.1:8080 | Status: ✓ Connected | 5 servers, 23 tools

? What would you like to do?
  ❯ 📋 Browse Resources
    ➕ Register MCP Server
    🔌 Quick View: Servers
    🔧 Quick View: Tools
    ⚙️  Settings
    ❌ Exit
```

### Servers Table
```
┌──────────────────┬──────────────────┬────────────────────────────────────┬────────────┐
│ Name             │ Transport        │ URL/Command                        │ Status     │
├──────────────────┼──────────────────┼────────────────────────────────────┼────────────┤
│ context7         │ streamable_http  │ https://mcp.context7.com/mcp       │ ✓ Enabled  │
│ filesystem       │ stdio            │ npx -y @modelcontextprotocol/se... │ ✓ Enabled  │
│ calculator       │ streamable_http  │ http://localhost:8000/mcp          │ ✓ Enabled  │
└──────────────────┴──────────────────┴────────────────────────────────────┴────────────┘
```

### Tools Table
```
┌──────────────────────────────┬──────────────────┬────────────────────────────────────┬──────────┐
│ Tool Name                    │ Server           │ Description                        │ Status   │
├──────────────────────────────┼──────────────────┼────────────────────────────────────┼──────────┤
│ context7__get-library-docs   │ context7         │ Get documentation for libraries    │ ✓ On     │
│ filesystem__read_file        │ filesystem       │ Read file contents                 │ ✓ On     │
│ calculator__add              │ calculator       │ Add two numbers                    │ ✓ On     │
│ calculator__multiply         │ calculator       │ Multiply two numbers               │ ✓ On     │
└──────────────────────────────┴──────────────────┴────────────────────────────────────┴──────────┘
```

## ⌨️ Keyboard Controls

- **Arrow Keys** - Navigate menus
- **Enter** - Select option
- **Type** - Filter/search in autocomplete prompts
- **Ctrl+C** - Exit gracefully
- **Tab** - (In some prompts) Next field

## 🔧 Configuration

Current settings (view via Settings menu):
```json
{
  "Registry URL": "http://127.0.0.1:8080",
  "Cache TTL": {
    "servers": "60s",
    "tools": "30s"
  },
  "Theme": "cyan"
}
```

## 🐛 Troubleshooting

### "MCPJungle CLI not found"
```bash
# Install MCPJungle
brew install mcpjungle/mcpjungle/mcpjungle
# or download from releases
```

### "Cannot connect to MCPJungle server"
```bash
# Check if server is running
curl http://localhost:8080/health

# Start server
docker compose up -d
# or
mcpjungle start
```

### Cache Issues
Cache auto-expires but you can restart JungleCTL to clear.

## 🚀 Coming Soon

### Phase 3: Advanced Features
- [ ] **Invoke Tool** - Interactive tool execution with argument builder
- [ ] **Create Tool Groups** - Wizard for group configuration
- [ ] **Enable/Disable Tools** - Manage tool/server status
- [ ] **View Group Details** - Inspect group composition

### Phase 4: Polish
- [ ] **Config File** - Persistent user settings (~/.junglectl/config.json)
- [ ] **History** - Recent commands/actions
- [ ] **Favorites** - Quick access to frequent tools
- [ ] **Better Error Messages** - Troubleshooting hints

### Phase 5: Distribution
- [ ] **npm Package** - `npm install -g junglectl`
- [ ] **Binary Packaging** - Standalone executables
- [ ] **Windows Testing** - Full ConPTY support
- [ ] **macOS Testing** - Native PTY validation

## 📝 Developer Notes

### Project Structure
```
src/
├── core/           # PTY execution, parsing, caching
├── commands/       # Feature implementations
├── ui/             # Prompts, formatters, spinners
├── types/          # TypeScript definitions
└── index.ts        # Main entry point
```

### Key Technologies
- **node-pty** - Cross-platform PTY management
- **@inquirer/prompts** - Modern interactive prompts
- **chalk** - Terminal colors
- **cli-table3** - Beautiful tables
- **ora** - Loading spinners

### Development
```bash
# Type checking
npm run type-check

# Watch mode
npm run watch

# Clean build
npm run clean && npm run build
```

## 🤝 Contributing

JungleCTL wraps MCPJungle without modifying its source. All interactions happen via the official CLI.

Contributions welcome for:
- New features (invoke, groups, etc.)
- UI improvements
- Bug fixes
- Documentation
- Testing

## 📄 License

MIT License - See LICENSE file
