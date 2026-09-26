import { existsSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import type { Invoker } from '../adapters/ecc/eccAdapter.js';
import { loadConfig, type AppConfig } from '../config/config.js';
import { silentLogger } from '../observability/logger.js';
import { createApp } from './createApp.js';

const FIXTURE = new URL('../../test/fixtures/ecc/package.45fd3d3.json', import.meta.url);
const fixtureText = readFileSync(FIXTURE, 'utf8');

let dir: string;
let config: AppConfig;

beforeEach(() => {
  dir = mkdtempSync(join(tmpdir(), 'peos-app-'));
  const loaded = loadConfig({ PEOS_HOME: dir });
  if (!loaded.ok) throw loaded.error;
  config = loaded.value;
});

afterEach(() => rmSync(dir, { recursive: true, force: true }));

const fakeEcc: Invoker = async (_file, args) => {
  const outFile = args[args.indexOf('--out') + 1];
  if (outFile === undefined) throw new Error('no --out');
  writeFileSync(outFile, fixtureText, 'utf8');
  return { stdout: '', stderr: '' };
};

describe('createApp', () => {
  it('creates the database, migrates, and reports status', () => {
    const app = createApp(config, { logger: silentLogger, cwd: dir });
    const status = app.status();
    expect(existsSync(config.databasePath)).toBe(true);
    expect(status.database.schemaVersion).toBe(1);
    expect(status.database.upToDate).toBe(true);
    expect(status.ai.mode).toBe('offline');
    expect(status.ai.provider).toBe('none');
    expect(status.ecc.available).toBe(false);
    app.close();
  });

  it('honours the ecc.cliPath setting on the next start', () => {
    const first = createApp(config, { logger: silentLogger, cwd: dir });
    const fakeCli = join(dir, 'ecc.js');
    writeFileSync(fakeCli, '', 'utf8');
    first.settings.set('ecc.cliPath', fakeCli);
    first.close();
    const second = createApp(config, { logger: silentLogger, cwd: dir });
    expect(second.status().ecc).toMatchObject({ available: true, cliPath: fakeCli });
    expect(second.audit.list().map((e) => e.action)).toContain('settings.set');
    second.close();
  });

  it('compiles context through the adapter, records metrics and audits the call', async () => {
    const fakeCli = join(dir, 'ecc.js');
    writeFileSync(fakeCli, '', 'utf8');
    const app = createApp({ ...config, ecc: { ...config.ecc, cliPath: fakeCli } }, { logger: silentLogger, invoker: fakeEcc, cwd: dir });
    const result = await app.compileContext({ task: 'add tests', repositoryPath: dir });
    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.value.metrics).toMatchObject({ primary: 19, supporting: 18, excluded: 6, tokenBudget: 4000 });
    expect(result.value.metrics.durationMs).toBeGreaterThanOrEqual(0);
    expect(app.audit.list()[0]?.action).toBe('context.compile.succeeded');
    app.close();
  });

  it('exports all data and resets by deleting the database files', () => {
    const app = createApp(config, { logger: silentLogger, cwd: dir });
    app.settings.set('a.b', 1);
    const bundle = app.exportData();
    expect(bundle.format).toBe('peos-export');
    expect(bundle.settings).toHaveLength(1);
    expect(bundle.audit.map((e) => e.action)).toEqual(['data.export', 'settings.set']);
    const { removed } = app.resetData();
    expect(removed).toContain(config.databasePath);
    expect(existsSync(config.databasePath)).toBe(false);
  });
});
