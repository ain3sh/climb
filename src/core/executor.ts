/**
 * MCPJungle Command Executor
 * Executes mcpjungle CLI commands via node-pty
 */

import pty, { IPty } from 'node-pty';
import { EventEmitter } from 'events';
import os from 'os';

export interface ExecutorOptions {
  timeout?: number;
  encoding?: string;
  env?: Record<string, string>;
  cwd?: string;
  registryUrl?: string;
}

export interface ExecutorResult {
  stdout: string;
  stderr: string;
  exitCode: number;
  duration: number;
}

export class MCPJungleExecutor extends EventEmitter {
  private ptyProcess: IPty | null = null;
  private defaultRegistryUrl: string = 'http://127.0.0.1:8080';

  constructor(registryUrl?: string) {
    super();
    if (registryUrl) {
      this.defaultRegistryUrl = registryUrl;
    }
  }

  /**
   * Execute a mcpjungle command
   */
  async execute(
    args: string[],
    options: ExecutorOptions = {}
  ): Promise<ExecutorResult> {
    const startTime = Date.now();
    let stdout = '';
    let stderr = '';

    // Add registry URL if specified and not already in args
    const finalArgs = [...args];
    const registryUrl = options.registryUrl || this.defaultRegistryUrl;
    
    if (!finalArgs.includes('--registry') && registryUrl !== 'http://127.0.0.1:8080') {
      finalArgs.push('--registry', registryUrl);
    }

    return new Promise((resolve, reject) => {
      try {
        // Determine shell based on OS
        const shell = os.platform() === 'win32' ? 'powershell.exe' : 'bash';
        const isWindows = os.platform() === 'win32';

        // Build command string
        const command = isWindows
          ? `mcpjungle ${finalArgs.join(' ')}`
          : `mcpjungle ${finalArgs.map(arg => 
              arg.includes(' ') ? `"${arg}"` : arg
            ).join(' ')}`;

        this.ptyProcess = pty.spawn(shell, [], {
          name: 'xterm-color',
          cols: 120,
          rows: 30,
          cwd: options.cwd || process.cwd(),
          env: {
            ...process.env,
            ...options.env,
            FORCE_COLOR: '1', // Preserve ANSI colors
          } as Record<string, string>,
          encoding: (options.encoding || 'utf8') as BufferEncoding,
        });

        // Write command to shell
        this.ptyProcess.write(command + (isWindows ? '\r\n' : '\n'));

        // Capture output
        this.ptyProcess.onData((data: string) => {
          stdout += data;
          this.emit('data', data);
        });

        // Handle exit
        this.ptyProcess.onExit(({ exitCode, signal }) => {
          const duration = Date.now() - startTime;
          
          this.ptyProcess = null;

          // Clean up the output (remove command echo and prompt)
          const cleanStdout = this.cleanOutput(stdout, command);

          if (exitCode === 0) {
            resolve({
              stdout: cleanStdout,
              stderr,
              exitCode: exitCode || 0,
              duration,
            });
          } else {
            reject(
              new Error(
                `Command failed with exit code ${exitCode}${signal ? ` (signal: ${signal})` : ''}\n${cleanStdout}`
              )
            );
          }
        });

        // Timeout handling
        const timeout = options.timeout || 30000; // 30s default
        const timeoutId = setTimeout(() => {
          if (this.ptyProcess) {
            this.ptyProcess.kill();
            reject(new Error(`Command timeout exceeded (${timeout}ms)`));
          }
        }, timeout);

        // Clear timeout on completion
        this.once('data', () => clearTimeout(timeoutId));

      } catch (error) {
        reject(error);
      }
    });
  }

  /**
   * Clean output by removing command echo and prompts
   */
  private cleanOutput(output: string, command: string): string {
    let cleaned = output;

    // Remove command echo
    const commandIndex = cleaned.indexOf(command);
    if (commandIndex !== -1) {
      cleaned = cleaned.substring(commandIndex + command.length);
    }

    // Remove trailing shell prompts (PS1, bash prompts, etc.)
    cleaned = cleaned
      .replace(/\r\n/g, '\n') // Normalize line endings
      .replace(/^\s*[\r\n]+/, '') // Remove leading whitespace
      .replace(/\s*(\$|>|PS\s+[^\s]+>)\s*$/gm, '') // Remove shell prompts
      .trim();

    return cleaned;
  }

  /**
   * Kill the current process
   */
  kill(): void {
    if (this.ptyProcess) {
      this.ptyProcess.kill();
      this.ptyProcess = null;
    }
  }

  /**
   * Check if mcpjungle CLI is available
   */
  static async isAvailable(): Promise<boolean> {
    try {
      const executor = new MCPJungleExecutor();
      await executor.execute(['version'], { timeout: 5000 });
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Get mcpjungle version
   */
  static async getVersion(): Promise<string | null> {
    try {
      const executor = new MCPJungleExecutor();
      const result = await executor.execute(['version'], { timeout: 5000 });
      
      // Extract version from output
      const versionMatch = result.stdout.match(/CLI Version:\s+v?([\d.]+)/i);
      return versionMatch ? (versionMatch[1] || null) : null;
    } catch {
      return null;
    }
  }
}
