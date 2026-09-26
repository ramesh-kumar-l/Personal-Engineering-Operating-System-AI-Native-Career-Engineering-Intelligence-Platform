import { AppError } from '../../shared/errors.js';
import { EXIT } from '../exitCodes.js';
import { printJson, type Command } from './types.js';

/** Values are stored as JSON when they parse as JSON, otherwise as strings. */
export function coerceSettingValue(raw: string): unknown {
  try {
    return JSON.parse(raw);
  } catch {
    return raw;
  }
}

export const configCommand: Command = {
  name: 'config',
  summary: 'Read or write local settings (e.g. ecc.cliPath).',
  usage: 'peos config list | get <key> | set <key> <value> | unset <key>',
  async run(ctx) {
    const [action, key, value] = ctx.positionals;
    switch (action) {
      case 'list':
      case undefined: {
        const entries = ctx.api.settings.list();
        if (ctx.flags.json) printJson(ctx.io, entries);
        else if (entries.length === 0) ctx.io.out('(no settings)');
        else for (const entry of entries) ctx.io.out(`${entry.key} = ${JSON.stringify(entry.value)}  (${entry.updatedAt})`);
        return EXIT.OK;
      }
      case 'get': {
        if (key === undefined) throw new AppError('INVALID_INPUT', `Usage: ${configCommand.usage}`);
        const current = ctx.api.settings.get(key);
        if (current === undefined) {
          ctx.io.err(`setting "${key}" is not set`);
          return EXIT.FAILURE;
        }
        ctx.io.out(ctx.flags.json ? JSON.stringify(current) : String(typeof current === 'string' ? current : JSON.stringify(current)));
        return EXIT.OK;
      }
      case 'set': {
        if (key === undefined || value === undefined) throw new AppError('INVALID_INPUT', `Usage: ${configCommand.usage}`);
        ctx.api.settings.set(key, coerceSettingValue(value));
        if (!ctx.flags.json) ctx.io.out(`set ${key}`);
        return EXIT.OK;
      }
      case 'unset': {
        if (key === undefined) throw new AppError('INVALID_INPUT', `Usage: ${configCommand.usage}`);
        const removed = ctx.api.settings.delete(key);
        if (!ctx.flags.json) ctx.io.out(removed ? `unset ${key}` : `setting "${key}" was not set`);
        return EXIT.OK;
      }
      default:
        throw new AppError('INVALID_INPUT', `Unknown config action "${action}".\nUsage: ${configCommand.usage}`);
    }
  },
};
