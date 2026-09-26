import { writeFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import { AppError } from '../../shared/errors.js';
import { EXIT } from '../exitCodes.js';
import { printJson, type Command } from './types.js';

export const auditCommand: Command = {
  name: 'audit',
  summary: 'List recent audit events (what the system did on your behalf).',
  usage: 'peos audit [--limit <n>] [--json]',
  async run(ctx) {
    const events = ctx.api.audit.list(ctx.flags.limit);
    if (ctx.flags.json) {
      printJson(ctx.io, events);
      return EXIT.OK;
    }
    if (events.length === 0) ctx.io.out('(no audit events)');
    for (const event of events) {
      ctx.io.out(`${event.ts}  ${event.actor.padEnd(11)} ${event.action}${event.subject === undefined ? '' : `  ${event.subject}`}`);
    }
    return EXIT.OK;
  },
};

export const exportCommand: Command = {
  name: 'export',
  summary: 'Export all local data as JSON.',
  usage: 'peos export [--out <file>]',
  async run(ctx) {
    const bundle = ctx.api.exportData();
    if (ctx.flags.out === undefined) {
      printJson(ctx.io, bundle);
      return EXIT.OK;
    }
    const target = resolve(ctx.cwd, ctx.flags.out);
    await writeFile(target, JSON.stringify(bundle, null, 2), 'utf8');
    ctx.io.out(`exported ${bundle.settings.length} settings and ${bundle.audit.length} audit events to ${target}`);
    return EXIT.OK;
  },
};

export const resetCommand: Command = {
  name: 'reset',
  summary: 'Delete all local data. Requires --yes.',
  usage: 'peos reset --yes',
  async run(ctx) {
    if (!ctx.flags.yes) {
      throw new AppError('INVALID_INPUT', 'Refusing to delete local data without --yes');
    }
    const { removed } = ctx.api.resetData();
    if (ctx.flags.json) printJson(ctx.io, { removed });
    else ctx.io.out(removed.length === 0 ? 'nothing to remove' : `removed:\n${removed.map((file) => `  ${file}`).join('\n')}`);
    return EXIT.OK;
  },
};
