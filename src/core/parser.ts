/**
 * MCPJungle Output Parser
 * Parses mcpjungle CLI output into structured data
 */

import stripAnsi from 'strip-ansi';
import type {
  MCPServer,
  MCPTool,
  MCPPrompt,
  ToolGroup,
  ToolSchema,
  ServerStatus,
} from '../types/mcpjungle.js';

export class OutputParser {
  /**
   * Parse version output
   */
  static parseVersion(rawOutput: string): { cli?: string; server?: string; url?: string } {
    const clean = stripAnsi(rawOutput);
    const result: { cli?: string; server?: string; url?: string } = {};

    const cliMatch = clean.match(/CLI Version:\s+v?([\d.]+)/i);
    if (cliMatch) result.cli = cliMatch[1];

    const serverMatch = clean.match(/Server Version:\s+v?([\d.]+)/i);
    if (serverMatch) result.server = serverMatch[1];

    const urlMatch = clean.match(/Server URL:\s+(https?:\/\/[^\s]+)/i);
    if (urlMatch) result.url = urlMatch[1];

    return result;
  }

  /**
   * Parse server status
   */
  static parseServerStatus(rawOutput: string, registryUrl: string): ServerStatus {
    const versionInfo = this.parseVersion(rawOutput);
    
    return {
      connected: !!versionInfo.server,
      url: versionInfo.url || registryUrl,
      version: versionInfo.server,
    };
  }

  /**
   * Parse `mcpjungle list servers` output
   * Format can be table or simple list
   */
  static parseServers(rawOutput: string): MCPServer[] {
    const clean = stripAnsi(rawOutput).trim();
    
    if (!clean || clean.includes('no servers') || clean.includes('connection refused')) {
      return [];
    }

    const servers: MCPServer[] = [];

    // Try to parse as table format first
    const lines = clean.split('\n').filter(l => l.trim() && !l.includes('───') && !l.includes('---'));
    
    // Skip header line if present
    let startIndex = 0;
    if (lines[0]?.toLowerCase().includes('name') || lines[0]?.includes('│')) {
      startIndex = 1;
    }

    for (let i = startIndex; i < lines.length; i++) {
      const line = lines[i]?.trim();
      if (!line) continue;

      // Parse table format: | name | transport | url | enabled |
      if (line.includes('│') || line.includes('|')) {
        const parts = line.split(/[│|]/).map(p => p.trim()).filter(Boolean);
        if (parts.length >= 2) {
          servers.push({
            name: parts[0] || '',
            transport: (parts[1] as any) || 'streamable_http',
            url: parts[2],
            enabled: parts[3]?.toLowerCase() !== 'disabled',
          });
        }
      } else {
        // Parse simple list format: "server-name (transport)"
        const match = line.match(/^([^\s(]+)(?:\s+\(([^)]+)\))?/);
        if (match) {
          servers.push({
            name: match[1] || '',
            transport: (match[2] as any) || 'streamable_http',
            enabled: true,
          });
        }
      }
    }

    return servers;
  }

  /**
   * Parse `mcpjungle list tools` output
   */
  static parseTools(rawOutput: string): MCPTool[] {
    const clean = stripAnsi(rawOutput).trim();
    
    if (!clean || clean.includes('no tools') || clean.includes('connection refused')) {
      return [];
    }

    const tools: MCPTool[] = [];
    const lines = clean.split('\n').filter(l => l.trim() && !l.includes('───') && !l.includes('---'));

    // Skip header
    let startIndex = 0;
    if (lines[0]?.toLowerCase().includes('tool') || lines[0]?.includes('│')) {
      startIndex = 1;
    }

    for (let i = startIndex; i < lines.length; i++) {
      const line = lines[i]?.trim();
      if (!line) continue;

      // Parse canonical name format: server__tool
      let canonicalName = '';
      let description = '';

      if (line.includes('│') || line.includes('|')) {
        const parts = line.split(/[│|]/).map(p => p.trim()).filter(Boolean);
        canonicalName = parts[0] || '';
        description = parts[1] || '';
      } else {
        // Simple format
        const match = line.match(/^([^\s]+)(?:\s+(.+))?/);
        if (match) {
          canonicalName = match[1] || '';
          description = match[2] || '';
        }
      }

      if (canonicalName && canonicalName.includes('__')) {
        const [serverName, toolName] = canonicalName.split('__');
        tools.push({
          name: toolName || '',
          serverName: serverName || '',
          canonicalName,
          description,
          enabled: true,
        });
      }
    }

    return tools;
  }

  /**
   * Parse `mcpjungle usage <tool>` to extract tool schema
   */
  static parseToolSchema(rawOutput: string): ToolSchema | null {
    const clean = stripAnsi(rawOutput);

    try {
      // Look for JSON schema in output
      const jsonMatch = clean.match(/\{[\s\S]*?"type"\s*:\s*"object"[\s\S]*?\}/);
      if (jsonMatch) {
        return JSON.parse(jsonMatch[0]);
      }

      // Alternative: look for input schema section
      const schemaMatch = clean.match(/Input Schema:[\s\S]*?(\{[\s\S]*?\})/);
      if (schemaMatch) {
        return JSON.parse(schemaMatch[1]!);
      }
    } catch (error) {
      // Fallback: extract basic info from text
      return this.parseSchemaFromText(clean);
    }

    return null;
  }

  /**
   * Fallback schema parser from descriptive text
   */
  private static parseSchemaFromText(text: string): ToolSchema | null {
    const schema: ToolSchema = {
      type: 'object',
      properties: {},
      required: [],
    };

    // Look for parameter descriptions
    const paramMatches = text.matchAll(/[-•]\s*(\w+)\s*\((\w+)\)(?:\s*:\s*(.+))?/g);
    
    for (const match of paramMatches) {
      const [, name, type, desc] = match;
      if (name && type) {
        schema.properties![name] = {
          type: type.toLowerCase(),
          description: desc?.trim(),
        };
      }
    }

    return Object.keys(schema.properties!).length > 0 ? schema : null;
  }

  /**
   * Parse `mcpjungle list prompts` output
   */
  static parsePrompts(rawOutput: string): MCPPrompt[] {
    const clean = stripAnsi(rawOutput).trim();
    
    if (!clean || clean.includes('no prompts') || clean.includes('connection refused')) {
      return [];
    }

    const prompts: MCPPrompt[] = [];
    const lines = clean.split('\n').filter(l => l.trim());

    for (const line of lines) {
      if (line.includes('__')) {
        const parts = line.split(/\s+/);
        const canonicalName = parts[0];
        if (canonicalName) {
          const [serverName, promptName] = canonicalName.split('__');
          prompts.push({
            name: promptName || '',
            serverName: serverName || '',
            canonicalName,
            description: parts.slice(1).join(' '),
            enabled: true,
          });
        }
      }
    }

    return prompts;
  }

  /**
   * Parse `mcpjungle list groups` output
   */
  static parseGroups(rawOutput: string): ToolGroup[] {
    const clean = stripAnsi(rawOutput).trim();
    
    if (!clean || clean.includes('no groups') || clean.includes('connection refused')) {
      return [];
    }

    const groups: ToolGroup[] = [];
    const lines = clean.split('\n').filter(l => l.trim());

    for (const line of lines) {
      const parts = line.split(/\s{2,}/); // Split on multiple spaces
      if (parts.length >= 1) {
        groups.push({
          name: parts[0] || '',
          description: parts[1],
          endpoint: parts[2],
        });
      }
    }

    return groups;
  }

  /**
   * Check if output indicates an error
   */
  static isError(rawOutput: string): boolean {
    const clean = stripAnsi(rawOutput).toLowerCase();
    return (
      clean.includes('error') ||
      clean.includes('failed') ||
      clean.includes('connection refused') ||
      clean.includes('not found')
    );
  }

  /**
   * Extract error message from output
   */
  static extractError(rawOutput: string): string {
    const clean = stripAnsi(rawOutput);
    
    // Look for common error patterns
    const errorMatch = clean.match(/(?:error|failed):\s*(.+?)(?:\n|$)/i);
    if (errorMatch) {
      return errorMatch[1]!.trim();
    }

    return clean.trim();
  }
}
