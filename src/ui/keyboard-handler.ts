/**
 * Keyboard Handler Utilities
 * Enhanced keyboard support for navigation and shortcuts
 */

import chalk from 'chalk';

/**
 * Special error thrown when ESC is pressed
 * Allows us to distinguish ESC from Ctrl+C
 */
export class EscapeKeyError extends Error {
  constructor() {
    super('User pressed ESC');
    this.name = 'EscapeKeyError';
  }
}

/**
 * Wrap a prompt to add ESC key handling
 * Returns a special error when ESC is pressed instead of the normal ExitPromptError
 */
export async function withEscapeKey<T>(
  promptFn: () => Promise<T>
): Promise<T> {
  try {
    return await promptFn();
  } catch (error) {
    // Check if it's a user cancellation (Ctrl+C or ESC)
    if (error instanceof Error && error.name === 'ExitPromptError') {
      // Inquirer doesn't distinguish ESC from Ctrl+C
      // We'll treat all as navigation back
      throw new EscapeKeyError();
    }
    throw error;
  }
}

/**
 * Check if error is an ESC key press or Ctrl+C
 */
export function isUserCancellation(error: unknown): boolean {
  return (
    error instanceof EscapeKeyError ||
    (error instanceof Error && error.name === 'ExitPromptError')
  );
}

/**
 * Keyboard shortcuts help text
 */
export const KEYBOARD_HINTS = {
  navigation: chalk.gray('↑↓ navigate • ⏎ select • esc/ctrl+c back'),
  multiSelect: chalk.gray('↑↓ navigate • space toggle • a toggle all • ⏎ confirm • esc back'),
  input: chalk.gray('⏎ confirm • esc cancel'),
  search: chalk.gray('type to filter • ↑↓ navigate • ⏎ select • esc back'),
  confirm: chalk.gray('y/n or ⏎ • esc cancel'),
};

/**
 * Format hint for bottom of screen
 */
export function formatNavigationHint(type: keyof typeof KEYBOARD_HINTS = 'navigation'): string {
  return '\n' + KEYBOARD_HINTS[type] + '\n';
}

/**
 * Quick action hints for main menu
 */
export const QUICK_ACTIONS = {
  quit: chalk.gray('q: quit'),
  refresh: chalk.gray('r: refresh'),
  help: chalk.gray('?: help'),
};

/**
 * Format quick actions bar
 */
export function formatQuickActionsBar(): string {
  return chalk.gray('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n') +
    `${QUICK_ACTIONS.quit} │ ${QUICK_ACTIONS.refresh} │ ${QUICK_ACTIONS.help}\n` +
    chalk.gray('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
}

/**
 * Selection counter for multi-select
 */
export function formatSelectionCount(selected: number, total: number): string {
  if (selected === 0) {
    return chalk.gray(`0 selected of ${total}`);
  }
  return chalk.cyan(`✓ ${selected} selected`) + chalk.gray(` of ${total}`);
}

/**
 * Help overlay content
 */
export const HELP_CONTENT = `
${chalk.cyan.bold('📖 climb Keyboard Shortcuts')}

${chalk.bold('Navigation:')}
  ↑/↓         Navigate through options
  ⏎ (Enter)   Select/confirm current option
  ESC         Go back to previous menu
  Ctrl+C      Exit application (with confirmation)

${chalk.bold('List/Select Prompts:')}
  Type        Start filtering/searching
  ↑/↓         Navigate filtered results
  ⏎           Select current item
  ESC         Cancel and go back

${chalk.bold('Multi-Select (Checkbox) Prompts:')}
  Space       Toggle current item on/off
  a           Toggle all items
  i           Invert selection
  ↑/↓         Navigate through items
  ⏎           Confirm selection
  ESC         Cancel and go back

${chalk.bold('Text Input:')}
  Type        Enter text
  ⏎           Confirm input
  ESC         Cancel input
  Ctrl+U      Clear line
  Ctrl+K      Clear to end

${chalk.bold('Main Menu Quick Actions:')}
  q           Quit application (currently in menus)
  r           Refresh cache (reload data)
  ?           Show this help

${chalk.bold('Tips:')}
  • ESC always goes back one level (never exits app)
  • Ctrl+C exits with confirmation from main menu
  • Space bar is for toggling checkboxes only
  • Start typing to search in any list/select
  • Use Tab for autocomplete where available

${chalk.gray('Press any key to close this help...')}
`;

/**
 * Display help overlay
 */
export function displayHelp(): void {
  console.clear();
  console.log(HELP_CONTENT);
}
