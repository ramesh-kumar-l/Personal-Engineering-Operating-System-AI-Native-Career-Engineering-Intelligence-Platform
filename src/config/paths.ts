/**
 * Filesystem path resolution. Pure functions over an env map and injected roots so tests
 * never touch the real home directory.
 */
import { homedir } from 'node:os';
import { join, resolve } from 'node:path';

export const HOME_ENV = 'PEOS_HOME';
export const DB_PATH_ENV = 'PEOS_DB_PATH';
export const ECC_CLI_ENV = 'PEOS_ECC_CLI';

export const DATABASE_FILE = 'peos.db';
export const SIBLING_ECC_DIR = 'Engineering-Context-Compiler';
export const ECC_CLI_RELATIVE = join('dist', 'cli', 'index.js');

export type EnvMap = Record<string, string | undefined>;

export function resolveHomeDir(env: EnvMap, userHome: string = homedir()): string {
  const fromEnv = env[HOME_ENV];
  return fromEnv !== undefined && fromEnv.trim() !== '' ? resolve(fromEnv) : join(userHome, '.peos');
}

export function resolveDatabasePath(env: EnvMap, homeDir: string): string {
  const fromEnv = env[DB_PATH_ENV];
  return fromEnv !== undefined && fromEnv.trim() !== '' ? resolve(fromEnv) : join(homeDir, DATABASE_FILE);
}

/**
 * Candidate locations for the ECC CLI, in priority order. Existence is checked by the
 * adapter's probe, not here. The sibling convention is `<cwd>/../Engineering-Context-Compiler`,
 * which matches how the three repos are laid out; no absolute machine paths are assumed.
 */
export function eccCliCandidates(env: EnvMap, cwd: string, settingValue?: string): string[] {
  const candidates: string[] = [];
  const fromEnv = env[ECC_CLI_ENV];
  if (fromEnv !== undefined && fromEnv.trim() !== '') candidates.push(resolve(fromEnv));
  if (settingValue !== undefined && settingValue.trim() !== '') candidates.push(resolve(settingValue));
  candidates.push(resolve(cwd, '..', SIBLING_ECC_DIR, ECC_CLI_RELATIVE));
  return [...new Set(candidates)];
}
