/**
 * Argument parsing on top of `node:util` parseArgs: no CLI framework dependency.
 */
import { parseArgs as nodeParseArgs } from 'node:util';
import { AppError } from '../shared/errors.js';

export interface ParsedArgs {
  command: string | undefined;
  positionals: string[];
  flags: {
    json: boolean;
    help: boolean;
    version: boolean;
    yes: boolean;
    path?: string;
    budget?: number;
    limit?: number;
    out?: string;
    home?: string;
    db?: string;
    logLevel?: string;
    eccCli?: string;
  };
}

const OPTIONS = {
  json: { type: 'boolean', default: false },
  help: { type: 'boolean', short: 'h', default: false },
  version: { type: 'boolean', short: 'v', default: false },
  yes: { type: 'boolean', default: false },
  path: { type: 'string' },
  budget: { type: 'string' },
  limit: { type: 'string' },
  out: { type: 'string' },
  home: { type: 'string' },
  db: { type: 'string' },
  'log-level': { type: 'string' },
  'ecc-cli': { type: 'string' },
} as const;

function positiveInt(name: string, value: string | undefined): number | undefined {
  if (value === undefined) return undefined;
  const parsed = Number(value);
  if (!Number.isInteger(parsed) || parsed <= 0) {
    throw new AppError('INVALID_INPUT', `--${name} must be a positive integer, got "${value}"`);
  }
  return parsed;
}

export function parseCliArgs(argv: string[]): ParsedArgs {
  let parsed: ReturnType<typeof nodeParseArgs<{ options: typeof OPTIONS; allowPositionals: true }>>;
  try {
    parsed = nodeParseArgs({ args: argv, options: OPTIONS, allowPositionals: true, strict: true });
  } catch (cause) {
    throw new AppError('INVALID_INPUT', (cause as Error).message, { cause });
  }
  const [command, ...positionals] = parsed.positionals;
  const v = parsed.values;
  const flags: ParsedArgs['flags'] = {
    json: v.json === true,
    help: v.help === true,
    version: v.version === true,
    yes: v.yes === true,
  };
  if (v.path !== undefined) flags.path = v.path;
  if (v.out !== undefined) flags.out = v.out;
  if (v.home !== undefined) flags.home = v.home;
  if (v.db !== undefined) flags.db = v.db;
  if (v['log-level'] !== undefined) flags.logLevel = v['log-level'];
  if (v['ecc-cli'] !== undefined) flags.eccCli = v['ecc-cli'];
  const budget = positiveInt('budget', v.budget);
  if (budget !== undefined) flags.budget = budget;
  const limit = positiveInt('limit', v.limit);
  if (limit !== undefined) flags.limit = limit;
  return { command, positionals, flags };
}
