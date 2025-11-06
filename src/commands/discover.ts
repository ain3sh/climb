/**
 * Non-interactive discovery output for LLMs
 * Single entry: `climb discover [<target-cli>] [<path...>]`
 * Produces deterministic, plain ASCII dir-tree without ANSI.
 */

import { loadConfig } from '../core/config.js';
import { MCPJungleExecutor, UniversalCLIExecutor } from '../core/executor.js';
import { OutputParser } from '../core/parser.js';
import { HelpParser } from '../core/help-parser.js';

type PathSeg = string;

export async function runDiscover(argv: string[]): Promise<void> {
  const cfg = await loadConfig();

  // Determine target CLI and path segments
  const knownMcpTokens = new Set(['servers', 'tools', 'groups', 'prompts', 'tool']);
  let target = cfg.targetCLI;
  let path: PathSeg[] = [];

  if (argv.length > 0) {
    const first = argv[0]!;
    if (!knownMcpTokens.has(first)) {
      target = first;
      path = argv.slice(1);
    } else {
      path = argv.slice(0);
    }
  }

  // Route
  if (target === 'mcpjungle') {
    await discoverMcp(path);
  } else {
    await discoverGeneric(target, path);
  }
}

// ──────────────────────────────────────────────────────────────────────────────
// MCPJungle discovery

async function discoverMcp(path: PathSeg[]): Promise<void> {
  const exec = new MCPJungleExecutor();

  // Helper to fetch counts
  const counts = await (async () => {
    const [servers, tools, groups, prompts] = await Promise.all([
      listSafe(() => exec.execute(['list', 'servers']).then(r => OutputParser.parseServers(r.stdout)) as any),
      listSafe(() => exec.execute(['list', 'tools']).then(r => OutputParser.parseTools(r.stdout)) as any),
      listSafe(() => exec.execute(['list', 'groups']).then(r => OutputParser.parseGroups(r.stdout)) as any),
      listSafe(() => exec.execute(['list', 'prompts']).then(r => OutputParser.parsePrompts(r.stdout)) as any),
    ]);
    return {
      servers: servers.length,
      tools: tools.length,
      groups: groups.length,
      prompts: prompts.length,
    };
  })();

  if (path.length === 0) {
    // Top-level overview
    println('mcpjungle');
    tree(
      [
        `servers [n=${counts.servers}]`,
        `tools [n=${counts.tools}]`,
        `groups [n=${counts.groups}]`,
        `prompts [n=${counts.prompts}]`,
      ],
      1
    );
    return;
  }

  const head = path[0]!;
  switch (head) {
    case 'servers': {
      const items = await listSafe(() => exec.execute(['list', 'servers']).then(r => OutputParser.parseServers(r.stdout)));
      printList('mcpjungle', 'servers', items.map(s => `${s.name}${s.enabled ? ' [on]' : ' [off]'}`));
      return;
    }
    case 'tools': {
      const items = await listSafe(() => exec.execute(['list', 'tools']).then(r => OutputParser.parseTools(r.stdout)));
      printList('mcpjungle', 'tools', items.map(t => `${t.canonicalName}${t.enabled ? ' [on]' : ' [off]'}`));
      return;
    }
    case 'groups': {
      const items = await listSafe(() => exec.execute(['list', 'groups']).then(r => OutputParser.parseGroups(r.stdout)));
      printList('mcpjungle', 'groups', items.map(g => g.name));
      return;
    }
    case 'prompts': {
      const items = await listSafe(() => exec.execute(['list', 'prompts']).then(r => OutputParser.parsePrompts(r.stdout)));
      printList('mcpjungle', 'prompts', items.map(p => p.canonicalName));
      return;
    }
    case 'tool': {
      const toolName = path[1];
      if (!toolName) {
        println('mcpjungle');
        tree([`tool <name>`], 1);
        return;
      }
      try {
        const usage = await exec.execute(['usage', toolName], { timeout: 10000 });
        const schema = OutputParser.parseToolSchema(usage.stdout);
        const req = schema?.required ?? [];
        const opt = Object.keys(schema?.properties ?? {}).filter((k) => !req.includes(k));
        println(toolName);
        tree([
          `req: ${req.join(',') || '-'}`,
          `opt: ${opt.join(',') || '-'}`,
        ], 1);
      } catch (e) {
        println(toolName);
        tree([`req: -`, `opt: -`], 1);
      }
      return;
    }
    default: {
      // Unknown path; show overview again
      println('mcpjungle');
      tree(
        [
          `servers [n=${counts.servers}]`,
          `tools [n=${counts.tools}]`,
          `groups [n=${counts.groups}]`,
          `prompts [n=${counts.prompts}]`,
        ],
        1
      );
      return;
    }
  }
}

// ──────────────────────────────────────────────────────────────────────────────
// Generic CLI discovery

async function discoverGeneric(target: string, path: PathSeg[]): Promise<void> {
  const exec = new UniversalCLIExecutor(target);
  const parser = new HelpParser();

  // If trailing "--", render options for the preceding path
  if (path[path.length - 1] === '--') {
    const basePath = path.slice(0, -1);
    const help = await captureHelp(exec, basePath);
    const parsed = parser.parse(help);
    const options = parsed.options
      .map(o => formatOption(o))
      .sort((a, b) => a.localeCompare(b))
      .slice(0, 50);

    const title = (basePath.length ? `${target} ${basePath.join(' ')}` : target) + ' options';
    println(title.trim());
    if (options.length === 0) {
      tree(['(no options detected)'], 1);
    } else {
      tree(options, 1);
    }
    return;
  }

  // Top-level
  if (path.length === 0) {
    const root = await captureHelp(exec, []);
    const parsed = parser.parse(root);
    const base = parsed.commands
      .filter((c) => c.confidence >= 0.35)
      .map((c) => ({ name: c.name, c: c.confidence ?? 0 }));

    base.sort((a, b) => a.name.toLowerCase().localeCompare(b.name.toLowerCase()));

    // Probe a small subset for subcommands
    const LIMIT = 15;
    const shown = base.slice(0, LIMIT);
    const withSubFlags = await flagSubs(exec, [], shown);
    const lines = withSubFlags.map((e) => `${e.name} [c=${e.c.toFixed(2)}${e.sub ? ', sub' : ''}]`);

    println(target);
    tree(lines, 1);
    return;
  }

  // Drill-down 1 level using provided path
  const subPath = path;
  const root = await captureHelp(exec, subPath);
  const parsed = parser.parse(root);
  const base = parsed.commands
    .filter((c) => !subPath.includes(c.name) && c.confidence >= 0.35)
    .map((c) => ({ name: c.name, c: c.confidence ?? 0 }));

  base.sort((a, b) => a.name.toLowerCase().localeCompare(b.name.toLowerCase()));

  const LIMIT = 15;
  const shown = base.slice(0, LIMIT);
  const withSubFlags = await flagSubs(exec, subPath, shown);
  const subs = withSubFlags.map((e) => `${e.name} [c=${e.c.toFixed(2)}${e.sub ? ', sub' : ''}]`);

  println(`${target} ${subPath.join(' ')}`.trim());
  if (subs.length === 0) {
    tree(['(no further subcommands detected)'], 1);
  } else {
    tree(subs, 1);
  }
}

async function captureHelp(exec: UniversalCLIExecutor, path: string[]): Promise<string> {
  const probes: string[][] = [
    [...path, '--help'],
    [...path, '-h'],
    ['help', ...path],
  ];
  for (const args of probes) {
    try {
      const res = await exec.execute(args, { acceptOutputOnError: true, timeout: 8000 });
      if (res.stdout.trim()) return res.stdout;
    } catch (_) {
      // try next
    }
  }
  return '';
}

// ──────────────────────────────────────────────────────────────────────────────
// Rendering helpers (plain ASCII)

function println(line: string): void {
  process.stdout.write(line + '\n');
}

function tree(entries: string[], indentLevel: number): void {
  const n = entries.length;
  const limit = 30;
  const shown = Math.min(n, limit);
  for (let i = 0; i < shown; i++) {
    const prefix = i === shown - 1 ? '└─ ' : '├─ ';
    println(''.padStart((indentLevel - 1) * 2, ' ') + prefix + entries[i]!);
  }
  if (n > shown) {
    println(''.padStart((indentLevel - 1) * 2, ' ') + `└─ … ${n - shown} more`);
  }
}

function printList(root: string, label: string, items: string[]): void {
  println(root);
  println(`└─ ${label} [n=${items.length}]`);
  const limit = 30;
  const shown = Math.min(items.length, limit);
  for (let i = 0; i < shown; i++) {
    const prefix = i === shown - 1 && items.length <= limit ? '   └─ ' : '   ├─ ';
    println(prefix + items[i]!);
  }
  if (items.length > limit) {
    println(`   └─ … ${items.length - limit} more`);
  }
}

async function listSafe<T>(fn: () => Promise<T[]>): Promise<T[]> {
  try {
    const res = await fn();
    return Array.isArray(res) ? res : [];
  } catch {
    return [];
  }
}

// ──────────────────────────────────────────────────────────────────────────────
// Utilities for options and subcommand probing

function formatOption(o: import('../core/help-parser.js').ParsedOption): string {
  const names: string[] = [];
  if (o.long) names.push(o.long);
  if (o.short) names.push(o.short);
  if (o.aliases && o.aliases.length) names.push(...o.aliases);
  const head = names.join(',');
  const arg = o.argument ? ` ${o.argument}` : '';
  return `${head}${arg}`.trim();
}

async function flagSubs(
  exec: UniversalCLIExecutor,
  basePath: string[],
  entries: Array<{ name: string; c: number }>
): Promise<Array<{ name: string; c: number; sub: boolean }>> {
  const results: Array<{ name: string; c: number; sub: boolean }> = [];
  for (const e of entries) {
    let sub = false;
    try {
      const help = await captureHelp(exec, [...basePath, e.name]);
      if (help.trim()) {
        const parsed = new HelpParser().parse(help);
        // If we find additional commands that aren't just the same token, assume subcommands
        const cmds = parsed.commands.filter(c => c.name && c.name !== e.name);
        sub = cmds.length > 0;
      }
    } catch {
      sub = false;
    }
    results.push({ ...e, sub });
  }
  return results;
}
