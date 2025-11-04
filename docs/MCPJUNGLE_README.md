# MCPJungle Official README
<!-- Cached from: https://raw.githubusercontent.com/mcpjungle/MCPJungle/refs/heads/main/README.md -->
<!-- Last Updated: 2025-11-04 -->

<h1 align="center">
  :deciduous_tree: MCPJungle :deciduous_tree:
</h1>
<p align="center">
  Self-hosted MCP Gateway for your private AI agents
</p>

MCPJungle is a single source-of-truth registry for all Model Context Protocol Servers running in your Organisation.

## Quick Reference

### Installation
```bash
brew install mcpjungle/mcpjungle/mcpjungle
# or download from: https://github.com/mcpjungle/MCPJungle/releases
```

### Basic Commands

**Server Management:**
- `mcpjungle start` - Start the registry server
- `mcpjungle version` - Check version

**Registration:**
- `mcpjungle register --name <name> --url <url>` - Register HTTP server
- `mcpjungle register -c <config.json>` - Register from config file
- `mcpjungle deregister <name>` - Remove server

**Listing:**
- `mcpjungle list servers` - List all registered servers
- `mcpjungle list tools` - List all tools
- `mcpjungle list tools --server <name>` - Filter by server
- `mcpjungle list groups` - List tool groups
- `mcpjungle list prompts` - List prompts

**Tool Operations:**
- `mcpjungle usage <tool>` - Get tool schema
- `mcpjungle invoke <tool> --input '<json>'` - Call a tool
- `mcpjungle enable tool <name>` - Enable tool
- `mcpjungle disable tool <name>` - Disable tool

**Tool Groups:**
- `mcpjungle create group -c <config.json>` - Create group
- `mcpjungle get group <name>` - View group details
- `mcpjungle delete group <name>` - Delete group

### Config File Formats

**HTTP Server:**
```json
{
  "name": "server-name",
  "transport": "streamable_http",
  "description": "Description",
  "url": "http://localhost:8000/mcp",
  "bearer_token": "optional-token"
}
```

**STDIO Server:**
```json
{
  "name": "server-name",
  "transport": "stdio",
  "description": "Description",
  "command": "npx",
  "args": ["-y", "@package/name", "arg1"],
  "env": {
    "KEY": "value"
  }
}
```

**Tool Group:**
```json
{
  "name": "group-name",
  "description": "Description",
  "included_tools": ["server__tool1", "server__tool2"],
  "included_servers": ["server-name"],
  "excluded_tools": ["server__tool3"]
}
```

### Tool Naming Convention

Tools use canonical names: `<server-name>__<tool-name>`

Example: `calculator__add`, `github__create_issue`

### Default Server URL

`http://127.0.0.1:8080`

Use `--registry` flag to specify different URL.

---

For full documentation, visit: https://github.com/mcpjungle/MCPJungle
