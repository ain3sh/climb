import chalk from 'chalk';
export class EscapeKeyError extends Error {
    constructor() {
        super('User pressed ESC');
        this.name = 'EscapeKeyError';
    }
}
export async function withEscapeKey(promptFn) {
    try {
        return await promptFn();
    }
    catch (error) {
        if (error instanceof Error && error.name === 'ExitPromptError') {
            throw new EscapeKeyError();
        }
        throw error;
    }
}
export function isUserCancellation(error) {
    return (error instanceof EscapeKeyError ||
        (error instanceof Error && error.name === 'ExitPromptError'));
}
export const KEYBOARD_HINTS = {
    navigation: chalk.gray('↑↓ navigate • ⏎ select • esc/ctrl+c back'),
    multiSelect: chalk.gray('↑↓ navigate • space toggle • a toggle all • ⏎ confirm • esc back'),
    input: chalk.gray('⏎ confirm • esc cancel'),
    search: chalk.gray('type to filter • ↑↓ navigate • ⏎ select • esc back'),
    confirm: chalk.gray('y/n or ⏎ • esc cancel'),
};
export function formatNavigationHint(type = 'navigation') {
    return '\n' + KEYBOARD_HINTS[type] + '\n';
}
export const QUICK_ACTIONS = {
    quit: chalk.gray('q: quit'),
    refresh: chalk.gray('r: refresh'),
    help: chalk.gray('?: help'),
};
export function formatQuickActionsBar() {
    return chalk.gray('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n') +
        `${QUICK_ACTIONS.quit} │ ${QUICK_ACTIONS.refresh} │ ${QUICK_ACTIONS.help}\n` +
        chalk.gray('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
}
export function formatSelectionCount(selected, total) {
    if (selected === 0) {
        return chalk.gray(`0 selected of ${total}`);
    }
    return chalk.cyan(`✓ ${selected} selected`) + chalk.gray(` of ${total}`);
}
export const HELP_CONTENT = `
${chalk.cyan.bold('📖 JungleCTL Keyboard Shortcuts')}

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
export function displayHelp() {
    console.clear();
    console.log(HELP_CONTENT);
}
//# sourceMappingURL=keyboard-handler.js.map