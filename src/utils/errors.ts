/**
 * Error Handling Utilities
 * Centralized error classes and user-friendly error messages
 */

import chalk from 'chalk';
import { Formatters } from '../ui/formatters.js';

/**
 * Base error class for JungleCTL-specific errors
 */
export class JungleCTLError extends Error {
  public readonly cause?: Error;
  public readonly hint?: string;

  constructor(message: string, cause?: Error, hint?: string) {
    super(message);
    this.name = 'JungleCTLError';
    this.cause = cause;
    this.hint = hint;
  }
}

/**
 * Server connectivity error
 */
export class ServerConnectionError extends JungleCTLError {
  constructor(url: string, cause?: Error) {
    super(
      `Cannot connect to MCPJungle server at ${url}`,
      cause,
      'Make sure the server is running:\n  mcpjungle start\n  or: docker compose up -d'
    );
    this.name = 'ServerConnectionError';
  }
}

/**
 * Resource not found error
 */
export class ResourceNotFoundError extends JungleCTLError {
  constructor(resourceType: string, resourceName: string) {
    super(
      `${resourceType} "${resourceName}" not found`,
      undefined,
      `Check available ${resourceType.toLowerCase()}s with:\n  mcpjungle list ${resourceType.toLowerCase()}s`
    );
    this.name = 'ResourceNotFoundError';
  }
}

/**
 * Schema parsing error
 */
export class SchemaParsingError extends JungleCTLError {
  constructor(toolName: string, cause?: Error) {
    super(
      `Failed to parse schema for tool "${toolName}"`,
      cause,
      'The tool may not have a valid schema. Try manual JSON input or check tool documentation.'
    );
    this.name = 'SchemaParsingError';
  }
}

/**
 * Tool invocation error
 */
export class ToolInvocationError extends JungleCTLError {
  constructor(toolName: string, message: string, cause?: Error) {
    super(
      `Tool "${toolName}" execution failed: ${message}`,
      cause,
      'Check tool input parameters and try again. Use "mcpjungle usage <tool>" for help.'
    );
    this.name = 'ToolInvocationError';
  }
}

/**
 * Input validation error
 */
export class ValidationError extends JungleCTLError {
  constructor(fieldName: string, message: string) {
    super(
      `Validation failed for "${fieldName}": ${message}`,
      undefined,
      undefined
    );
    this.name = 'ValidationError';
  }
}

/**
 * Timeout error
 */
export class TimeoutError extends JungleCTLError {
  constructor(operation: string, timeoutMs: number) {
    super(
      `Operation "${operation}" timed out after ${timeoutMs}ms`,
      undefined,
      'Try again or check if the operation requires more time. Some tools may take longer to execute.'
    );
    this.name = 'TimeoutError';
  }
}

/**
 * User cancellation (not actually an error)
 */
export class UserCancelledError extends Error {
  constructor() {
    super('Operation cancelled by user');
    this.name = 'UserCancelledError';
  }
}

/**
 * Format error for display to user
 */
export function formatError(error: unknown): string {
  if (error instanceof UserCancelledError) {
    return chalk.yellow('\n✗ Operation cancelled');
  }

  if (error instanceof JungleCTLError) {
    let output = Formatters.error(error.message);

    if (error.cause) {
      output += '\n' + chalk.gray('Caused by: ' + error.cause.message);
    }

    if (error.hint) {
      output += '\n\n' + chalk.gray('💡 Hint: ' + error.hint);
    }

    return output;
  }

  if (error instanceof Error) {
    return Formatters.error(error.message);
  }

  return Formatters.error(String(error));
}

/**
 * Parse error from MCPJungle CLI output
 */
export function parseCliError(output: string): JungleCTLError {
  const clean = output.toLowerCase();

  // Connection refused
  if (clean.includes('connection refused')) {
    const urlMatch = output.match(/https?:\/\/[^\s]+/);
    const url = urlMatch ? urlMatch[0] : 'http://127.0.0.1:8080';
    return new ServerConnectionError(url);
  }

  // Resource not found
  if (clean.includes('not found')) {
    return new JungleCTLError('Resource not found', undefined, 'Check the resource name and try again');
  }

  // Timeout
  if (clean.includes('timeout')) {
    return new TimeoutError('MCPJungle command', 60000);
  }

  // Generic error
  const errorMatch = output.match(/error:\s*(.+?)(?:\n|$)/i);
  if (errorMatch) {
    return new JungleCTLError(errorMatch[1]!.trim());
  }

  // Fallback
  return new JungleCTLError('Command failed', undefined, output.trim());
}

/**
 * Handle error in command execution
 */
export async function handleCommandError(error: unknown, context?: string): Promise<void> {
  console.error('\n' + formatError(error));

  if (context) {
    console.log(chalk.gray(`\nContext: ${context}`));
  }

  // Don't exit on user cancellation
  if (error instanceof UserCancelledError) {
    return;
  }

  // Give user chance to continue or exit
  const { confirm } = await import('@inquirer/prompts');
  const shouldContinue = await confirm({
    message: 'Continue?',
    default: true,
  });

  if (!shouldContinue) {
    process.exit(1);
  }
}

/**
 * Wrap async operation with error handling
 */
export async function withErrorHandling<T>(
  operation: () => Promise<T>,
  context?: string
): Promise<T | null> {
  try {
    return await operation();
  } catch (error) {
    await handleCommandError(error, context);
    return null;
  }
}
