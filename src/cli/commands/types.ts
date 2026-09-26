import type { ExperienceApi } from '../../app/experienceApi.js';
import type { ParsedArgs } from '../parseArgs.js';

export interface CliIo {
  out(line: string): void;
  err(line: string): void;
}

export interface CommandContext {
  api: ExperienceApi;
  io: CliIo;
  flags: ParsedArgs['flags'];
  positionals: string[];
  cwd: string;
}

export interface Command {
  name: string;
  summary: string;
  usage: string;
  /** Returns the process exit code. */
  run(ctx: CommandContext): Promise<number>;
}

export function printJson(io: CliIo, value: unknown): void {
  io.out(JSON.stringify(value, null, 2));
}
