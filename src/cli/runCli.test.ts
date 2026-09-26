import { existsSync, mkdtempSync, readFileSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { coerceSettingValue } from './commands/config.js';
import { parseCliArgs } from './parseArgs.js';
import { runCli } from './runCli.js';

let dir: string;

beforeEach(() => {
  dir = mkdtempSync(join(tmpdir(), 'peos-cli-'));
});
afterEach(() => rmSync(dir, { recursive: true, force: true }));

async function run(argv: string[]) {
  const out: string[] = [];
  const err: string[] = [];
  const code = await runCli({ argv, env: { PEOS_HOME: dir, PEOS_LOG_LEVEL: 'error' }, cwd: dir, io: { out: (l) => out.push(l), err: (l) => err.push(l) } });
  return { code, out: out.join('\n'), err: err.join('\n') };
}

describe('parseCliArgs', () => {
  it('separates command, positionals and typed flags', () => {
    const parsed = parseCliArgs(['context', 'do thing', '--path', '/r', '--budget', '100', '--json']);
    expect(parsed.command).toBe('context');
    expect(parsed.positionals).toEqual(['do thing']);
    expect(parsed.flags).toMatchObject({ path: '/r', budget: 100, json: true });
  });

  it('rejects non-integer budgets and unknown flags', () => {
    expect(() => parseCliArgs(['context', 't', '--budget', 'x'])).toThrow(/positive integer/);
    expect(() => parseCliArgs(['status', '--nope'])).toThrow();
  });

  it('coerces JSON-looking setting values and keeps strings', () => {
    expect(coerceSettingValue('5')).toBe(5);
    expect(coerceSettingValue('true')).toBe(true);
    expect(coerceSettingValue('C:\\x\\y.js')).toBe('C:\\x\\y.js');
  });
});

describe('runCli', () => {
  it('prints help with usage exit code when no command is given', async () => {
    const result = await run([]);
    expect(result.code).toBe(2);
    expect(result.out).toContain('Usage: peos');
    expect((await run(['--help'])).code).toBe(0);
    expect((await run(['--version'])).out).toBe('0.1.0');
  });

  it('init creates the data directory and status reports it', async () => {
    const init = await run(['init']);
    expect(init.code).toBe(0);
    expect(existsSync(join(dir, 'peos.db'))).toBe(true);
    const status = await run(['status', '--json']);
    expect(status.code).toBe(0);
    const report = JSON.parse(status.out);
    expect(report.database.schemaVersion).toBe(1);
    expect(report.ai.mode).toBe('offline');
  });

  it('config set/get/list/unset round-trip through the CLI', async () => {
    expect((await run(['config', 'set', 'ecc.cliPath', '/x/cli.js'])).code).toBe(0);
    expect((await run(['config', 'get', 'ecc.cliPath'])).out).toBe('/x/cli.js');
    expect((await run(['config', 'list'])).out).toContain('ecc.cliPath');
    expect((await run(['config', 'unset', 'ecc.cliPath'])).out).toBe('unset ecc.cliPath');
    expect((await run(['config', 'get', 'ecc.cliPath'])).code).toBe(1);
    expect((await run(['config', 'bogus'])).code).toBe(2);
  });

  it('context fails with the unavailable exit code when ECC is absent, and usage code without a task', async () => {
    const missing = await run(['context', 'add tests']);
    expect(missing.code).toBe(3);
    expect(missing.err).toContain('ADAPTER_UNAVAILABLE');
    expect((await run(['context'])).code).toBe(2);
  });

  it('export writes a bundle file and reset requires --yes', async () => {
    await run(['config', 'set', 'a.b', '1']);
    const target = join(dir, 'bundle.json');
    const exported = await run(['export', '--out', target]);
    expect(exported.code).toBe(0);
    expect(JSON.parse(readFileSync(target, 'utf8')).format).toBe('peos-export');
    expect((await run(['reset'])).code).toBe(2);
    expect(existsSync(join(dir, 'peos.db'))).toBe(true);
    expect((await run(['reset', '--yes'])).code).toBe(0);
    expect(existsSync(join(dir, 'peos.db'))).toBe(false);
  });

  it('audit lists events newest first', async () => {
    await run(['config', 'set', 'a.b', '1']);
    const audit = await run(['audit', '--json']);
    expect(JSON.parse(audit.out)[0].action).toBe('settings.set');
  });

  it('rejects unknown commands and invalid config', async () => {
    expect((await run(['fly'])).code).toBe(2);
    const bad = await runCli({ argv: ['status'], env: { PEOS_HOME: dir, PEOS_AI_MODE: 'cloud' }, cwd: dir, io: { out: () => undefined, err: () => undefined } });
    expect(bad).toBe(2);
  });
});
