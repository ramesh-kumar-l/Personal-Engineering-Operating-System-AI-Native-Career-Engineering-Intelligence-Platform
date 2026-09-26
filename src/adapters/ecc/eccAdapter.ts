/**
 * Adapter over the Engineering-Context-Compiler CLI (D-001: consume by contract).
 * Threat notes: the CLI is launched with `execFile` and an argument array (no shell), with a
 * timeout and bounded output; its JSON is validated by our own schema before anything trusts it;
 * a missing or broken sibling degrades to a typed error, never an exception across the boundary.
 */
import { execFile } from 'node:child_process';
import { existsSync } from 'node:fs';
import { mkdtemp, readFile, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { promisify } from 'node:util';
import type { Logger } from '../../observability/logger.js';
import { silentLogger } from '../../observability/logger.js';
import { AppError } from '../../shared/errors.js';
import { err, ok, type Result } from '../../shared/result.js';
import { eccContextPackageSchema, type EccContextPackage } from './eccPackageSchema.js';

export interface ExecResult {
  stdout: string;
  stderr: string;
}

/** Runs `node <file> ...args`; injectable so unit tests never spawn processes. */
export type Invoker = (file: string, args: string[], options: { timeoutMs: number }) => Promise<ExecResult>;

export interface EccProbe {
  available: boolean;
  cliPath?: string;
  reason?: string;
}

export interface CompileRequest {
  task: string;
  repositoryPath: string;
  tokenBudget?: number;
}

export interface EccAdapterOptions {
  candidates: string[];
  timeoutMs: number;
  invoker?: Invoker;
  fileExists?: (path: string) => boolean;
  logger?: Logger;
}

export interface EccAdapter {
  probe(): EccProbe;
  compileContext(request: CompileRequest): Promise<Result<EccContextPackage>>;
}

const execFileAsync = promisify(execFile);
const MAX_OUTPUT_BYTES = 16 * 1024 * 1024;

export const defaultInvoker: Invoker = async (file, args, options) => {
  const { stdout, stderr } = await execFileAsync(process.execPath, [file, ...args], {
    timeout: options.timeoutMs,
    maxBuffer: MAX_OUTPUT_BYTES,
    windowsHide: true,
    encoding: 'utf8',
  });
  return { stdout, stderr };
};

export function createEccAdapter(options: EccAdapterOptions): EccAdapter {
  const invoker = options.invoker ?? defaultInvoker;
  const fileExists = options.fileExists ?? existsSync;
  const logger = options.logger ?? silentLogger;

  const probe = (): EccProbe => {
    const found = options.candidates.find((candidate) => fileExists(candidate));
    if (found === undefined) {
      return { available: false, reason: `ECC CLI not found. Tried: ${options.candidates.join(', ') || '(no candidates)'}` };
    }
    return { available: true, cliPath: found };
  };

  return {
    probe,
    async compileContext(request) {
      const validation = validateRequest(request);
      if (validation !== undefined) return err(validation);
      const status = probe();
      if (!status.available || status.cliPath === undefined) {
        return err(new AppError('ADAPTER_UNAVAILABLE', status.reason ?? 'ECC CLI unavailable'));
      }
      const workDir = await mkdtemp(join(tmpdir(), 'peos-ecc-'));
      const outFile = join(workDir, 'package.json');
      const args = ['context', request.task, '--path', request.repositoryPath, '--out', outFile];
      if (request.tokenBudget !== undefined) args.push('--budget', String(request.tokenBudget));
      try {
        await invoker(status.cliPath, args, { timeoutMs: options.timeoutMs });
        const raw = await readFile(outFile, 'utf8');
        return parsePackage(raw);
      } catch (cause) {
        logger.warn('ecc.invoke.failed', { message: (cause as Error).message });
        return err(classifyFailure(cause, status.cliPath));
      } finally {
        await rm(workDir, { recursive: true, force: true });
      }
    },
  };
}

function validateRequest(request: CompileRequest): AppError | undefined {
  if (request.task.trim() === '') return new AppError('INVALID_INPUT', 'Task description must not be empty');
  if (request.repositoryPath.trim() === '') return new AppError('INVALID_INPUT', 'Repository path must not be empty');
  if (request.tokenBudget !== undefined && (!Number.isInteger(request.tokenBudget) || request.tokenBudget <= 0)) {
    return new AppError('INVALID_INPUT', 'Token budget must be a positive integer');
  }
  return undefined;
}

export function parsePackage(raw: string): Result<EccContextPackage> {
  let json: unknown;
  try {
    json = JSON.parse(raw);
  } catch (cause) {
    return err(new AppError('CONTRACT_VIOLATION', 'ECC output is not valid JSON', { cause }));
  }
  const parsed = eccContextPackageSchema.safeParse(json);
  if (!parsed.success) {
    const issues = parsed.error.issues.slice(0, 10).map((issue) => `${issue.path.join('.')}: ${issue.message}`);
    return err(new AppError('CONTRACT_VIOLATION', 'ECC package does not match the expected contract', { details: { issues } }));
  }
  return ok(parsed.data);
}

function classifyFailure(cause: unknown, cliPath: string): AppError {
  const error = cause as NodeJS.ErrnoException & { killed?: boolean; signal?: string; stderr?: string };
  if (error.killed === true || error.signal === 'SIGTERM') {
    return new AppError('ADAPTER_TIMEOUT', 'ECC CLI timed out', { cause, details: { cliPath } });
  }
  if (error.code === 'ENOENT') {
    return new AppError('ADAPTER_UNAVAILABLE', 'ECC CLI could not be started', { cause, details: { cliPath } });
  }
  const stderr = typeof error.stderr === 'string' ? error.stderr.trim().slice(0, 500) : undefined;
  return new AppError('ADAPTER_FAILED', `ECC CLI failed: ${error.message}`, {
    cause,
    details: stderr === undefined ? { cliPath } : { cliPath, stderr },
  });
}
