/**
 * Loading State Management
 * Spinners for async operations
 */

import ora, { Ora } from 'ora';

export class Spinner {
  private spinner: Ora | null = null;

  /**
   * Start a spinner with message
   */
  start(message: string): void {
    this.spinner = ora({
      text: message,
      color: 'cyan',
    }).start();
  }

  /**
   * Update spinner text
   */
  update(message: string): void {
    if (this.spinner) {
      this.spinner.text = message;
    }
  }

  /**
   * Stop spinner with success
   */
  succeed(message?: string): void {
    if (this.spinner) {
      this.spinner.succeed(message);
      this.spinner = null;
    }
  }

  /**
   * Stop spinner with failure
   */
  fail(message?: string): void {
    if (this.spinner) {
      this.spinner.fail(message);
      this.spinner = null;
    }
  }

  /**
   * Stop spinner with warning
   */
  warn(message?: string): void {
    if (this.spinner) {
      this.spinner.warn(message);
      this.spinner = null;
    }
  }

  /**
   * Stop spinner with info
   */
  info(message?: string): void {
    if (this.spinner) {
      this.spinner.info(message);
      this.spinner = null;
    }
  }

  /**
   * Stop spinner without status
   */
  stop(): void {
    if (this.spinner) {
      this.spinner.stop();
      this.spinner = null;
    }
  }

  /**
   * Check if spinner is active
   */
  isSpinning(): boolean {
    return this.spinner !== null && this.spinner.isSpinning;
  }
}

/**
 * Execute async operation with spinner
 */
export async function withSpinner<T>(
  message: string,
  operation: () => Promise<T>,
  options: {
    successMessage?: string;
    errorMessage?: string;
  } = {}
): Promise<T> {
  const spinner = new Spinner();
  spinner.start(message);

  try {
    const result = await operation();
    spinner.succeed(options.successMessage || message);
    return result;
  } catch (error) {
    spinner.fail(options.errorMessage || 'Operation failed');
    throw error;
  }
}
