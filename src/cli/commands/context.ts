import { writeFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import type { EccEvidenceItem } from '../../adapters/ecc/eccPackageSchema.js';
import type { ContextResult } from '../../services/contextService.js';
import { AppError } from '../../shared/errors.js';
import { EXIT, exitCodeFor } from '../exitCodes.js';
import { printJson, type CliIo, type Command } from './types.js';

export const contextCommand: Command = {
  name: 'context',
  summary: 'Compile engineering context for a task via the Engineering-Context-Compiler.',
  usage: 'peos context "<task>" [--path <repo dir>] [--budget <tokens>] [--out <file>] [--json]',
  async run(ctx) {
    const task = ctx.positionals[0];
    if (task === undefined || task.trim() === '') {
      throw new AppError('INVALID_INPUT', `Missing task description.\nUsage: ${contextCommand.usage}`);
    }
    const repositoryPath = resolve(ctx.cwd, ctx.flags.path ?? '.');
    const result = await ctx.api.compileContext({
      task,
      repositoryPath,
      ...(ctx.flags.budget === undefined ? {} : { tokenBudget: ctx.flags.budget }),
    });
    if (!result.ok) {
      ctx.io.err(`context failed [${result.error.code}]: ${result.error.message}`);
      return exitCodeFor(result.error.code);
    }
    if (ctx.flags.out !== undefined) {
      await writeFile(resolve(ctx.cwd, ctx.flags.out), JSON.stringify(result.value.package, null, 2), 'utf8');
    }
    if (ctx.flags.json) {
      printJson(ctx.io, result.value);
      return EXIT.OK;
    }
    printHuman(ctx.io, result.value);
    return EXIT.OK;
  },
};

function describe(item: EccEvidenceItem): string {
  const where = item.path ?? item.identifier ?? '(unnamed)';
  const symbols = item.symbols !== undefined && item.symbols.length > 0 ? ` {${item.symbols.join(', ')}}` : '';
  return `${where}${symbols}  [${item.source}, ${item.trustLevel}, relevance ${item.relevance.toFixed(2)}]`;
}

function printHuman(io: CliIo, result: ContextResult): void {
  const pkg = result.package;
  io.out(`Task (${pkg.task.type}): ${pkg.task.request}`);
  io.out(`Repository: ${pkg.repository.name} @ ${pkg.repository.commit.slice(0, 12)}`);
  io.out('');
  io.out(`Primary evidence (${pkg.context.primary.length}):`);
  for (const item of pkg.context.primary) io.out(`  - ${describe(item)}`);
  if (pkg.context.supporting.length > 0) io.out(`Supporting evidence: ${pkg.context.supporting.length} items (use --json to list)`);
  if (pkg.conflicts.length > 0) io.out(`Conflicts: ${pkg.conflicts.length}`);
  if (pkg.unknowns.length > 0) {
    io.out('Unknowns:');
    for (const unknown of pkg.unknowns) io.out(`  - ${unknown}`);
  }
  io.out('Verification:');
  for (const step of pkg.verification) io.out(`  - ${step}`);
  io.out('');
  const m = result.metrics;
  io.out(`Metrics: ${m.durationMs} ms, budget ${m.tokenBudget} tokens, excluded ${m.excluded} items. Source: ${result.source}.`);
}
