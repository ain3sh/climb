# MCPJungle CLI Output Samples

**Purpose**: Document actual CLI output formats for parser implementation  
**Date**: 2025-11-04  
**MCPJungle Version**: v0.2.16

---

## 1. `mcpjungle version`

```
███╗   ███╗ ██████╗██████╗       ██╗██╗   ██╗███╗   ██╗ ██████╗ ██╗     ███████╗
████╗ ████║██╔════╝██╔══██╗      ██║██║   ██║████╗  ██║██╔════╝ ██║     ██╔════╝
██╔████╔██║██║     ██████╔╝      ██║██║   ██║██╔██╗ ██║██║  ███╗██║     █████╗  
██║╚██╔╝██║██║     ██╔═══╝  ██   ██║██║   ██║██║╚██╗██║██║   ██║██║     ██╔══╝  
██║ ╚═╝ ██║╚██████╗██║      ╚█████╔╝╚██████╔╝██║ ╚████║╚██████╔╝███████╗███████╗
╚═╝     ╚═╝ ╚═════╝╚═╝       ╚════╝  ╚═════╝ ╚═╝  ╚═══╝ ╚═════╝ ╚══════╝╚══════╝

CLI Version: v0.2.16
Couldn't retrieve Server version at this time
Server URL:  http://127.0.0.1:8080
```

**Parser Notes**:
- ASCII art banner present (strip ANSI codes)
- Extract: `CLI Version:\s+v?([\d.]+)`
- Extract: `Server Version:\s+v?([\d.]+)` (when server connected)
- Extract: `Server URL:\s+(https?://[^\s]+)`

---

## 2. `mcpjungle list servers`

### Empty State:
```
There are no MCP servers in the registry
```

### With Servers:
```
1. calculator
Simple calculator for testing
Transport: stdio
Command: npx -y @modelcontextprotocol/server-everything

2. context7
Library documentation server
Transport: streamable_http
URL: https://mcp.context7.com/mcp
```

**Parser Notes**:
- Numbered list format: `(\d+)\.\s+([^\n]+)`
- Description on next line (optional)
- Transport line: `Transport:\s+(.+)`
- For STDIO: `Command:\s+(.+)`
- For HTTP: `URL:\s+(.+)`
- No enabled/disabled status shown in list (default: enabled)

---

## 3. `mcpjungle list tools`

### Empty State:
```
There are currently no tools in the registry
```

### With Tools:
```
1. calculator__echo  [ENABLED]
Echoes back the input

2. calculator__add  [ENABLED]
Adds two numbers

3. context7__resolve-library-id  [ENABLED]
Resolves a package/product name to a Context7-compatible library ID and returns a list of matching libraries.

You MUST call this function before 'get-library-docs' to obtain...
(multi-line description continues)

Run 'usage <tool name>' to see a tool's usage or 'invoke <tool name>' to call one
```

**Parser Notes**:
- Numbered list: `(\d+)\.\s+([^\s]+)\s+\[([^\]]+)\]`
- Canonical name format: `<server>__<tool>`
- Status: `[ENABLED]` or `[DISABLED]`
- Description follows (can be multi-line)
- Empty line separates tools
- Footer hint present (ignore)

---

## 4. `mcpjungle usage <tool>`

### Simple Tool (calculator__add):
```
calculator__add
Adds two numbers

Input Parameters:
=============================
b (required)
{
  "description": "Second number",
  "type": "number"
}
=============================

=============================
a (required)
{
  "description": "First number",
  "type": "number"
}
=============================
```

### Complex Tool (context7__resolve-library-id):
```
context7__resolve-library-id
Resolves a package/product name to a Context7-compatible library ID...

Input Parameters:
=======================================
libraryName (required)
{
  "description": "Library name to search for...",
  "type": "string"
}
=======================================
```

**Parser Notes**:
- First line: tool canonical name
- Second line: tool description
- Section: `Input Parameters:` followed by separators
- Each param: `name (required|optional)`
- JSON Schema fragment follows (extract properties)
- **CRITICAL**: No complete JSON Schema object - must reconstruct!
- Parser must build: `{ type: "object", properties: {...}, required: [...] }`

---

## 5. `mcpjungle list groups`

### Empty State:
```
There are no tool groups in the registry
```

### With Groups:
```
(Format TBD - need to create a group first to capture output)
```

**Expected Format** (from docs):
- Group name
- Description (optional)
- Endpoint URL
- Included tools/servers (TBD)

---

## 6. `mcpjungle invoke <tool> --input '<json>'`

### Success Response:
```
(Testing blocked by STDIO server startup timeout)
```

**Expected Format** (from MCP spec):
```json
{
  "content": [
    {
      "type": "text",
      "text": "Result text here"
    }
  ],
  "isError": false
}
```

### Error Response:
```json
{
  "content": [
    {
      "type": "text",
      "text": "Error message"
    }
  ],
  "isError": true
}
```

**Parser Notes**:
- Likely JSON output (parse directly)
- Check `isError` field
- Extract from `content` array
- Handle multiple content types (text, image, etc.)

---

## 7. Connection Errors

### Server Unavailable:
```
failed to list servers: failed to send request to http://127.0.0.1:8080/api/v0/servers: Get "http://127.0.0.1:8080/api/v0/servers": dial tcp 127.0.0.1:8080: connect: connection refused
```

**Parser Notes**:
- Detect: `connection refused` → server down
- Detect: `failed to` → general error
- Extract error message after colon

---

## Key Parser Patterns

### Status Detection:
- `[ENABLED]` → enabled: true
- `[DISABLED]` → enabled: false
- No status → default enabled

### Canonical Names:
- Format: `<server>__<tool>`
- Split on `__` to get server and tool names

### Empty States:
- "There are no" → return empty array
- "currently no" → return empty array

### Multi-line Handling:
- Tool descriptions can span multiple lines
- Stop at next numbered item or section header

### Error Detection:
- "failed to" → error
- "connection refused" → server connectivity issue
- "not found" → resource doesn't exist

---

## TODO: Remaining Tests

- [ ] `mcpjungle get group <name>` - Need to create group first
- [ ] `mcpjungle invoke` success - Wait for STDIO server or use HTTP-only tool
- [ ] `mcpjungle invoke` error - Test invalid input
- [ ] `mcpjungle enable tool <name>` - Test enable command
- [ ] `mcpjungle disable tool <name>` - Test disable command
- [ ] Tool with enum parameters
- [ ] Tool with boolean parameters
- [ ] Tool with array parameters
- [ ] Tool with nested object (if supported)

---

## Critical Findings

1. **Usage output is NOT complete JSON Schema**
   - Only property fragments shown
   - Must reconstruct full schema:
     ```typescript
     {
       type: "object",
       properties: { /* extracted */ },
       required: [ /* from "(required)" markers */ ]
     }
     ```

2. **Server list doesn't show enabled/disabled**
   - Assume enabled by default
   - May need separate query for status

3. **Tool list format is consistent**
   - Easy to parse with regex
   - Status clearly marked

4. **STDIO servers have startup delay**
   - npm package download on first use
   - Invoke commands may timeout
   - Need generous timeouts (60s+)

5. **No ANSI color codes in text output**
   - Only banner has ASCII art
   - Output is clean after stripping ANSI

---

## Parser Implementation Strategy

1. **Always use `stripAnsi()` first**
2. **Check for empty states** ("There are no", "currently no")
3. **Split on `\n` and filter empty lines**
4. **Use regex for structured patterns**
5. **Handle multi-line descriptions** (look ahead for next numbered item)
6. **Reconstruct JSON Schema** from usage fragments
7. **Validate canonical names** (must contain `__`)
8. **Default values**: enabled=true, status="available"

---

## Next Steps

1. ✅ Document basic output formats
2. ⏳ Test tool invocation (need working STDIO or HTTP-only tool)
3. ⏳ Create test group and capture `get group` output
4. ⏳ Test enable/disable commands
5. ⏳ Test complex schema types (enum, boolean, array)
6. → Implement parsers based on these patterns
