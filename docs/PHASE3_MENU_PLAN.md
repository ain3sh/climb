# Phase 3 Menu Integration Plan

## Current Main Menu Structure (MVP v1.0)

```typescript
[
  { value: 'browse', name: '📋 Browse Resources' },
  { value: 'register', name: '➕ Register MCP Server' },
  { value: 'servers', name: '🔌 Quick View: Servers' },
  { value: 'tools', name: '🔧 Quick View: Tools' },
  { value: 'settings', name: '⚙️ Settings' },
  { value: 'exit', name: '❌ Exit' }
]
```

## Proposed Phase 3 Menu Structure

```typescript
[
  // NEW: High-value feature first
  { value: 'invoke', name: '🚀 Invoke Tool', description: 'Execute tool with interactive input' },
  
  // Existing
  { value: 'browse', name: '📋 Browse Resources', description: 'View servers, tools, groups, prompts' },
  
  // NEW: Groups management
  { value: 'groups', name: '📦 Manage Tool Groups', description: 'Create, view, and delete tool groups' },
  
  // NEW: Enable/disable
  { value: 'enable-disable', name: '⚡ Enable/Disable', description: 'Manage tool and server status' },
  
  // Existing
  { value: 'register', name: '➕ Register MCP Server', description: 'Add a new MCP server to the registry' },
  { value: 'servers', name: '🔌 Quick View: Servers', description: 'Show all registered servers' },
  { value: 'tools', name: '🔧 Quick View: Tools', description: 'Show all available tools' },
  { value: 'settings', name: '⚙️ Settings', description: 'Configure JungleCTL' },
  { value: 'exit', name: '❌ Exit', description: 'Quit JungleCTL' }
]
```

### Rationale:
1. **Invoke Tool** → Top position (most-used feature after MVP)
2. **Browse** → Keep early (discovery)
3. **Groups** → After browse (organizational feature)
4. **Enable/Disable** → After groups (management)
5. **Register** → Mid-section (setup task)
6. **Quick Views** → Keep for fast access
7. **Settings/Exit** → Bottom (less frequent)

---

## Groups Submenu Structure

```typescript
// Accessible via main menu: groups
[
  { value: 'create', name: '➕ Create Group', description: 'Create a new tool group' },
  { value: 'view', name: '👁️ View Group Details', description: 'View group composition' },
  { value: 'list', name: '📋 List All Groups', description: 'Show all tool groups' },
  { value: 'delete', name: '🗑️ Delete Group', description: 'Remove a tool group' },
  { value: 'back', name: '← Back', description: 'Return to main menu' }
]
```

---

## Enable/Disable Submenu Structure

```typescript
// Accessible via main menu: enable-disable
[
  { value: 'disable-tool', name: '🔇 Disable Tool', description: 'Disable a specific tool' },
  { value: 'enable-tool', name: '🔊 Enable Tool', description: 'Enable a specific tool' },
  { value: 'disable-server', name: '🔇 Disable Server', description: 'Disable all tools from a server' },
  { value: 'enable-server', name: '🔊 Enable Server', description: 'Enable a server' },
  { value: 'back', name: '← Back', description: 'Return to main menu' }
]
```

---

## Browse Submenu (Existing - No Changes)

```typescript
[
  { value: 'tools', name: '🔧 Tools' },
  { value: 'servers', name: '🔌 Servers' },
  { value: 'groups', name: '📦 Tool Groups' },
  { value: 'prompts', name: '💬 Prompts' },
  { value: 'back', name: '← Back' }
]
```

---

## Navigation Flow

```
Main Menu
├─→ 🚀 Invoke Tool
│   └─→ (Select tool → Build form → Execute → Return)
│
├─→ 📋 Browse Resources
│   ├─→ Tools (list → filter → return)
│   ├─→ Servers (list → return)
│   ├─→ Groups (list → return)
│   ├─→ Prompts (list → return)
│   └─→ ← Back
│
├─→ 📦 Manage Tool Groups
│   ├─→ Create Group (wizard → return)
│   ├─→ View Group (select → display → return)
│   ├─→ List Groups (display → return)
│   ├─→ Delete Group (select → confirm → return)
│   └─→ ← Back
│
├─→ ⚡ Enable/Disable
│   ├─→ Disable Tool (select → execute → return)
│   ├─→ Enable Tool (select → execute → return)
│   ├─→ Disable Server (select → execute → return)
│   ├─→ Enable Server (select → execute → return)
│   └─→ ← Back
│
├─→ ➕ Register MCP Server (existing)
├─→ 🔌 Quick View: Servers (existing)
├─→ 🔧 Quick View: Tools (existing)
├─→ ⚙️ Settings (existing)
└─→ ❌ Exit
```

---

## Implementation Notes

### Main Menu Updates (`src/index.ts`)

```typescript
// Add imports
import { invokeToolInteractive } from './commands/invoke.js';
import { groupsMenuInteractive } from './commands/groups.js';
import { enableDisableMenuInteractive } from './commands/enable-disable.js';

// Update menu choices
const action = await Prompts.select('What would you like to do?', [
  { value: 'invoke', name: '🚀 Invoke Tool', description: '...' },
  { value: 'browse', name: '📋 Browse Resources', description: '...' },
  { value: 'groups', name: '📦 Manage Tool Groups', description: '...' },
  { value: 'enable-disable', name: '⚡ Enable/Disable', description: '...' },
  // ... existing items
]);

// Add switch cases
switch (action) {
  case 'invoke':
    await invokeToolInteractive(config.registryUrl);
    break;
  case 'groups':
    await groupsMenuInteractive(config.registryUrl);
    break;
  case 'enable-disable':
    await enableDisableMenuInteractive(config.registryUrl);
    break;
  // ... existing cases
}
```

### Submenu Pattern

All submenus follow this pattern:

```typescript
export async function xxxMenuInteractive(registryUrl?: string): Promise<void> {
  while (true) {
    const action = await Prompts.select('Menu Title', [
      // ... choices with 'back' option
    ]);

    if (action === 'back') break;

    try {
      // Handle action
      await someOperation();
      await Prompts.confirm('Continue?', true);
    } catch (error) {
      console.error(Formatters.error(error.message));
      await Prompts.confirm('Continue?', true);
    }
  }
}
```

---

## User Experience Considerations

1. **Consistency**: All submenus have "← Back" option
2. **Feedback**: "Continue?" prompt after each operation
3. **Error Handling**: Errors don't exit submenu, show error and continue
4. **Clear Screen**: Main menu clears screen between iterations
5. **Status Bar**: Always visible at top with server connection status

---

## Testing Checklist

- [ ] Main menu shows all new items
- [ ] Invoke Tool → works end-to-end
- [ ] Groups submenu → all operations accessible
- [ ] Enable/Disable submenu → all operations accessible
- [ ] Back navigation → returns to main menu
- [ ] Error in submenu → doesn't crash, continues
- [ ] Ctrl+C → graceful exit from any menu
- [ ] Menu items ordered logically
- [ ] Descriptions are helpful

---

## Complete! R4 Planning Done ✅
