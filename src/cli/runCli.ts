/**
 * Testable CLI driver: parses argv, builds the app, dispatches a command, maps errors to exit
 * codes. `main.ts` is the only file that touches `process` for I/O and exit.
 */
import { APP_VERSION, createApp } from '../app/createApp.js';
import { loadConfig, type ConfigOverrides } from '../config/config.js';
import type { EnvMap } from '../config/paths.js';
import { createLogger } from '../observability/logger.js';
import { isAppError, toAppError } from '../shared/errors.js';
import { findCommand, helpText } from './commands/index.js';
import type { CliIo } from './commands/types.js';
import { EXIT, exitCodeFor } from './exitCodes.js';
import { parseCliArgs, type ParsedArgs } from './parseArgs.js';

export interface RunCliOptions {
  argv: string[];
  env: EnvMap;
  io: CliIo;
  cwd: string;
}

function overridesFrom(flags: ParsedArgs['flags']): ConfigOverrides {
  const overrides: ConfigOverrides = {};
  if (flags.home !== undefined) overrides.homeDir = flags.home;
  if (flags.db !== undefined) overrides.databasePath = flags.db;
  if (flags.logLevel !== undefined) overrides.logLevel = flags.logLevel;
  if (flags.eccCli !== undefined) overrides.eccCliPath = flags.eccCli;
  return overrides;
}

export async function runCli(options: RunCliOptions): Promise<number> {
  const { io } = options;
  let parsed: ParsedArgs;
  try {
    parsed = parseCliArgs(options.argv);
  } catch (cause) {
    io.err(`error: ${(cause as Error).message}`);
    io.err(helpText(APP_VERSION));
    return EXIT.USAGE;
  }

  if (parsed.flags.version) {
    io.out(APP_VERSION);
    return EXIT.OK;
  }
  if (parsed.flags.help || parsed.command === undefined) {
    io.out(helpText(APP_VERSION));
    return parsed.command === undefined && !parsed.flags.help ? EXIT.USAGE : EXIT.OK;
  }
  const command = findCommand(parsed.command);
  if (command === undefined) {
    io.err(`error: unknown command "${parsed.command}"`);
    io.err(helpText(APP_VERSION));
    return EXIT.USAGE;
  }

  const config = loadConfig(options.env, overridesFrom(parsed.flags));
  if (!config.ok) {
    io.err(`error: ${config.error.message}`);
    return EXIT.USAGE;
  }
  const logger = createLogger({ level: config.value.logLevel, sink: (line) => io.err(line) });

  let api;
  try {
    api = createApp(config.value, { env: options.env, cwd: options.cwd, logger });
  } catch (cause) {
    const error = toAppError(cause, 'STORAGE_FAILURE');
    io.err(`error [${error.code}]: ${error.message}`);
    return exitCodeFor(error.code);
  }
  try {
    return await command.run({ api, io, flags: parsed.flags, positionals: parsed.positionals, cwd: options.cwd });
  } catch (cause) {
    const error = toAppError(cause);
    io.err(`error [${error.code}]: ${error.message}`);
    if (!isAppError(cause)) logger.error('cli.unhandled', { stack: (cause as Error).stack });
    return exitCodeFor(error.code);
  } finally {
    api.close();
  }
}
