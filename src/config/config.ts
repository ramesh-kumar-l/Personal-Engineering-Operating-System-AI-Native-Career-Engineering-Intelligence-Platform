/**
 * Application configuration: validated once at startup, immutable afterwards.
 * Sources in priority order: explicit overrides (CLI flags) > environment > defaults.
 */
import { z } from 'zod';
import { sensitivitySchema } from '../domain/primitives.js';
import { AppError } from '../shared/errors.js';
import { err, ok, type Result } from '../shared/result.js';
import { resolveDatabasePath, resolveHomeDir, type EnvMap } from './paths.js';

export const logLevelSchema = z.enum(['debug', 'info', 'warn', 'error']);

export const aiModeSchema = z.enum(['offline', 'external']);

export const appConfigSchema = z.object({
  homeDir: z.string().min(1),
  databasePath: z.string().min(1),
  logLevel: logLevelSchema,
  ecc: z.object({
    /** Explicit CLI path; when absent, the adapter probes the documented candidates. */
    cliPath: z.string().min(1).optional(),
    timeoutMs: z.number().int().positive().max(600_000),
    defaultBudget: z.number().int().positive().max(200_000),
  }),
  ai: z.object({
    /** `offline` never calls an external provider. Default and the only mode in Phase 1. */
    mode: aiModeSchema,
    /** Highest sensitivity class allowed to leave the machine when mode is `external`. */
    maxExternalSensitivity: sensitivitySchema,
  }),
});
export type AppConfig = z.infer<typeof appConfigSchema>;

export interface ConfigOverrides {
  homeDir?: string;
  databasePath?: string;
  logLevel?: string;
  eccCliPath?: string;
  eccTimeoutMs?: number;
  aiMode?: string;
}

const DEFAULT_ECC_TIMEOUT_MS = 60_000;
const DEFAULT_ECC_BUDGET = 4000;

function intFromEnv(value: string | undefined): number | undefined {
  if (value === undefined || value.trim() === '') return undefined;
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : Number.NaN;
}

export function loadConfig(env: EnvMap, overrides: ConfigOverrides = {}, userHome?: string): Result<AppConfig> {
  const homeDir = overrides.homeDir ?? resolveHomeDir(env, userHome);
  const candidate = {
    homeDir,
    databasePath: overrides.databasePath ?? resolveDatabasePath(env, homeDir),
    logLevel: overrides.logLevel ?? env['PEOS_LOG_LEVEL'] ?? 'info',
    ecc: {
      cliPath: overrides.eccCliPath ?? env['PEOS_ECC_CLI'] ?? undefined,
      timeoutMs: overrides.eccTimeoutMs ?? intFromEnv(env['PEOS_ECC_TIMEOUT_MS']) ?? DEFAULT_ECC_TIMEOUT_MS,
      defaultBudget: intFromEnv(env['PEOS_ECC_BUDGET']) ?? DEFAULT_ECC_BUDGET,
    },
    ai: {
      mode: overrides.aiMode ?? env['PEOS_AI_MODE'] ?? 'offline',
      maxExternalSensitivity: env['PEOS_AI_MAX_SENSITIVITY'] ?? 'public',
    },
  };
  const parsed = appConfigSchema.safeParse(candidate);
  if (!parsed.success) {
    const issues = parsed.error.issues.map((issue) => `${issue.path.join('.')}: ${issue.message}`);
    return err(new AppError('CONFIG_INVALID', `Invalid configuration: ${issues.join('; ')}`, { details: { issues } }));
  }
  return ok(parsed.data);
}
