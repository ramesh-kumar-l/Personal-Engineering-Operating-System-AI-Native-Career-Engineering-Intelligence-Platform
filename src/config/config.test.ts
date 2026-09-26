import { join, resolve } from 'node:path';
import { describe, expect, it } from 'vitest';
import { loadConfig } from './config.js';
import { eccCliCandidates, resolveDatabasePath, resolveHomeDir } from './paths.js';

const HOME = resolve('/fake/home');

describe('paths', () => {
  it('defaults home to ~/.peos and honours PEOS_HOME', () => {
    expect(resolveHomeDir({}, HOME)).toBe(join(HOME, '.peos'));
    expect(resolveHomeDir({ PEOS_HOME: '/custom' }, HOME)).toBe(resolve('/custom'));
    expect(resolveHomeDir({ PEOS_HOME: '   ' }, HOME)).toBe(join(HOME, '.peos'));
  });

  it('derives the database path from home unless overridden', () => {
    expect(resolveDatabasePath({}, '/h')).toBe(join('/h', 'peos.db'));
    expect(resolveDatabasePath({ PEOS_DB_PATH: '/x/y.db' }, '/h')).toBe(resolve('/x/y.db'));
  });

  it('lists ECC candidates in priority order without duplicates', () => {
    const cwd = resolve('/repos/peos');
    const list = eccCliCandidates({ PEOS_ECC_CLI: '/env/ecc.js' }, cwd, '/env/ecc.js');
    expect(list).toEqual([resolve('/env/ecc.js'), resolve('/repos/Engineering-Context-Compiler/dist/cli/index.js')]);
    expect(eccCliCandidates({}, cwd)).toHaveLength(1);
  });
});

describe('loadConfig', () => {
  it('produces validated defaults', () => {
    const result = loadConfig({}, {}, HOME);
    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.value.homeDir).toBe(join(HOME, '.peos'));
    expect(result.value.logLevel).toBe('info');
    expect(result.value.ai.mode).toBe('offline');
    expect(result.value.ai.maxExternalSensitivity).toBe('public');
    expect(result.value.ecc.timeoutMs).toBe(60_000);
    expect(result.value.ecc.cliPath).toBeUndefined();
  });

  it('applies env then overrides', () => {
    const result = loadConfig({ PEOS_LOG_LEVEL: 'debug', PEOS_ECC_TIMEOUT_MS: '1000', PEOS_ECC_CLI: '/env.js' }, { eccCliPath: '/flag.js' }, HOME);
    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.value.logLevel).toBe('debug');
    expect(result.value.ecc.timeoutMs).toBe(1000);
    expect(result.value.ecc.cliPath).toBe('/flag.js');
  });

  it('fails closed on invalid values with a CONFIG_INVALID error naming the field', () => {
    const result = loadConfig({ PEOS_AI_MODE: 'cloud', PEOS_ECC_TIMEOUT_MS: 'abc' }, {}, HOME);
    expect(result.ok).toBe(false);
    if (result.ok) return;
    expect(result.error.code).toBe('CONFIG_INVALID');
    expect(result.error.message).toContain('ai.mode');
    expect(result.error.message).toContain('ecc.timeoutMs');
  });
});
