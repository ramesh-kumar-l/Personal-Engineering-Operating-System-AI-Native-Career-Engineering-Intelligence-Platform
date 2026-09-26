import { configCommand } from './config.js';
import { contextCommand } from './context.js';
import { auditCommand, exportCommand, resetCommand } from './data.js';
import { initCommand, statusCommand } from './status.js';
import type { Command } from './types.js';

export const commands: readonly Command[] = [
  initCommand,
  statusCommand,
  contextCommand,
  configCommand,
  auditCommand,
  exportCommand,
  resetCommand,
];

export function findCommand(name: string): Command | undefined {
  return commands.find((command) => command.name === name);
}

export function helpText(version: string): string {
  const lines = [
    `peos ${version} - Personal Engineering OS`,
    '',
    'Usage: peos <command> [options]',
    '',
    'Commands:',
    ...commands.map((command) => `  ${command.name.padEnd(9)} ${command.summary}`),
    '',
    'Global options:',
    '  --json               Machine-readable output',
    '  --home <dir>         Data directory (default: ~/.peos or $PEOS_HOME)',
    '  --db <file>          Database file (default: <home>/peos.db or $PEOS_DB_PATH)',
    '  --ecc-cli <file>     Path to the ECC CLI (default: $PEOS_ECC_CLI, setting ecc.cliPath, or sibling checkout)',
    '  --log-level <level>  debug | info | warn | error (default: info)',
    '  -h, --help           Show this help',
    '  -v, --version        Show version',
    '',
    'Command usage:',
    ...commands.map((command) => `  ${command.usage}`),
  ];
  return lines.join('\n');
}
