# Changelog

All notable changes to JungleCTL will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.0.0] - 2025-11-04

### Added

#### Core Features
- Interactive terminal UI for MCPJungle with beautiful, keyboard-driven interface
- Tool invocation with dynamic form generation from JSON Schema
- Tool groups management (create, view, delete)
- Enable/disable operations for individual tools and entire servers
- Server registration wizard supporting HTTP, STDIO, and SSE transports
- Resource browsing (servers, tools, groups, prompts) with autocomplete search

#### Configuration & Settings
- Configuration persistence system (`~/.junglectl/config.json`)
- Interactive settings editor with 7 configurable options
- User-configurable registry URL, cache TTLs, timeouts, and theme
- First-run detection with welcome message
- Reset to defaults functionality

#### User Experience
- Smart caching with TTL (30-60s, sub-second cached responses)
- Color-coded status indicators (online/offline/unknown)
- Loading spinners for async operations
- Comprehensive error messages with detailed troubleshooting hints
- Numbered step-by-step guidance for common issues

#### Technical Features
- TypeScript strict mode with zero errors
- ESM modules for modern JavaScript compatibility
- Cross-platform support (Linux, macOS, Windows)
- PTY-based command execution via node-pty
- JSON Schema support for all parameter types (string, number, boolean, enum, array)
- Input validation (required fields, min/max, patterns, types)
- Result display for multiple content types (text, images, audio, resources, JSON)

### Features by Phase

**MVP v1.0** (Initial Release)
- Interactive main menu with server status
- Server registration wizard
- List operations (servers, tools, groups, prompts)
- Autocomplete search for all resources
- Beautiful tables with color-coded status
- TTL-based caching
- Cross-platform command execution

**Phase 3** (Advanced Features)
- Tool invocation with dynamic forms (29 features)
- Tool groups management (create/view/delete)
- Enable/disable management (tools and servers)
- Manual JSON input fallback
- 60-second timeout for slow tools
- Comprehensive error handling

**Phase 4** (Config & Polish)
- Configuration persistence (8 features)
- Interactive settings editor (9 features)
- Enhanced error messages (9 enhancements)
- Config validation and merging
- Version field for future migrations

**Phase 5** (Distribution)
- npm package setup for global installation
- Comprehensive documentation (INSTALLATION.md, USAGE.md)
- Repository metadata and package configuration

### Statistics
- **60+ features** implemented across 4 phases
- **11 git commits** with co-authorship
- **~8,000 lines of code** including documentation
- **6 comprehensive docs** (1,900+ lines)
- **Zero TypeScript errors** in strict mode
- **Sub-second response times** with smart caching

### Requirements
- Node.js 18.0.0 or higher
- npm 9.0.0 or higher
- MCPJungle CLI installed and accessible

### Installation
```bash
npm install -g junglectl
```

### Quick Start
```bash
junglectl
```

[1.0.0]: https://github.com/username/junglectl/releases/tag/v1.0.0
