#!/usr/bin/env node

/**
 * JungleCTL - Interactive MCPJungle CLI
 * Main entry point
 */

import { Prompts } from './ui/prompts.js';
import { Formatters } from './ui/formatters.js';
import { MCPJungleExecutor } from './core/executor.js';
import { OutputParser } from './core/parser.js';
import { registerServerInteractive } from './commands/register.js';
import { browseInteractive, listServers, listTools } from './commands/list.js';
import { DEFAULT_CONFIG } from './types/config.js';
import chalk from 'chalk';

// Configuration
const config = DEFAULT_CONFIG;

/**
 * Main menu
 */
async function mainMenu(): Promise<void> {
  // Check if mcpjungle is available
  const isAvailable = await MCPJungleExecutor.isAvailable();
  if (!isAvailable) {
    console.error(Formatters.error('MCPJungle CLI not found in PATH'));
    console.log(chalk.gray('\nPlease install MCPJungle first:'));
    console.log(chalk.gray('  brew install mcpjungle/mcpjungle/mcpjungle'));
    console.log(chalk.gray('  or download from: https://github.com/mcpjungle/MCPJungle/releases\n'));
    process.exit(1);
  }

  // Get server status
  const executor = new MCPJungleExecutor(config.registryUrl);
  let serverStatus;
  
  try {
    const result = await executor.execute(['version'], { timeout: 3000 });
    serverStatus = OutputParser.parseServerStatus(result.stdout, config.registryUrl);
  } catch {
    serverStatus = {
      connected: false,
      url: config.registryUrl,
    };
  }

  // Display header
  console.clear();
  console.log(chalk.cyan.bold('\n  🌴 JungleCTL v1.0.0\n'));
  console.log('  ' + Formatters.statusBar(serverStatus));
  console.log();

  if (!serverStatus.connected) {
    console.log(Formatters.warning('Cannot connect to MCPJungle server'));
    console.log(chalk.gray('\nMake sure the server is running:'));
    console.log(chalk.gray('  docker compose up -d'));
    console.log(chalk.gray('  or: mcpjungle start\n'));

    const shouldContinue = await Prompts.confirm('Continue anyway?', false);
    if (!shouldContinue) {
      process.exit(0);
    }
  }

  // Main loop
  while (true) {
    try {
      const action = await Prompts.select('What would you like to do?', [
        {
          value: 'browse',
          name: '📋 Browse Resources',
          description: 'View servers, tools, groups, prompts',
        },
        {
          value: 'register',
          name: '➕ Register MCP Server',
          description: 'Add a new MCP server to the registry',
        },
        {
          value: 'servers',
          name: '🔌 Quick View: Servers',
          description: 'Show all registered servers',
        },
        {
          value: 'tools',
          name: '🔧 Quick View: Tools',
          description: 'Show all available tools',
        },
        {
          value: 'settings',
          name: '⚙️  Settings',
          description: 'Configure JungleCTL',
        },
        {
          value: 'exit',
          name: '❌ Exit',
          description: 'Quit JungleCTL',
        },
      ]);

      console.log(); // Spacing

      switch (action) {
        case 'browse':
          await browseInteractive(config.registryUrl);
          break;

        case 'register':
          await registerServerInteractive(config.registryUrl);
          break;

        case 'servers':
          await listServers(config.registryUrl);
          await Prompts.confirm('Press Enter to continue', true);
          break;

        case 'tools':
          await listTools({ registryUrl: config.registryUrl });
          await Prompts.confirm('Press Enter to continue', true);
          break;

        case 'settings':
          await showSettings();
          break;

        case 'exit':
          console.log(chalk.cyan('\n👋 Goodbye!\n'));
          process.exit(0);
      }

      // Clear screen before next iteration
      console.clear();
      console.log(chalk.cyan.bold('\n  🌴 JungleCTL v1.0.0\n'));
      console.log('  ' + Formatters.statusBar(serverStatus));
      console.log();

    } catch (error) {
      if (error instanceof Error) {
        console.error('\n' + Formatters.error(error.message));
        await Prompts.confirm('\nPress Enter to continue', true);
      } else {
        throw error;
      }
    }
  }
}

/**
 * Settings menu
 */
async function showSettings(): Promise<void> {
  console.log(Formatters.header('Settings'));
  
  console.log(chalk.bold('Current Configuration:\n'));
  console.log(Formatters.prettyJson({
    'Registry URL': config.registryUrl,
    'Cache TTL': {
      servers: `${config.cacheTTL.servers / 1000}s`,
      tools: `${config.cacheTTL.tools / 1000}s`,
    },
    'Theme': config.theme.primaryColor,
  }));

  console.log(chalk.gray('\n(Configuration editing coming soon)\n'));
  await Prompts.confirm('Press Enter to return', true);
}

/**
 * Error handler
 */
process.on('uncaughtException', (error) => {
  console.error('\n' + Formatters.error('Unexpected error:'));
  console.error(error.message);
  console.error(chalk.gray('\nStack trace:'));
  console.error(chalk.gray(error.stack || 'No stack trace available'));
  process.exit(1);
});

process.on('unhandledRejection', (reason) => {
  console.error('\n' + Formatters.error('Unhandled promise rejection:'));
  console.error(reason);
  process.exit(1);
});

// Handle Ctrl+C gracefully
process.on('SIGINT', () => {
  console.log(chalk.cyan('\n\n👋 Goodbye!\n'));
  process.exit(0);
});

// Start the application
mainMenu().catch((error) => {
  console.error('\n' + Formatters.error('Fatal error:'));
  console.error(error.message);
  process.exit(1);
});
