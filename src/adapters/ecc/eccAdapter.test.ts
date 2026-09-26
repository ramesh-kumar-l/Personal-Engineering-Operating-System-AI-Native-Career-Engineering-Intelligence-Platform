import { readFileSync, writeFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { createEccAdapter, parsePackage, type Invoker } from './eccAdapter.js';

const FIXTURE = new URL('../../../test/fixtures/ecc/package.45fd3d3.json', import.meta.url);
const fixtureText = readFileSync(FIXTURE, 'utf8');

/** Simulates the ECC CLI writing its package to the `--out` file. */
function writingInvoker(content: string): Invoker {
  return async (_file, args) => {
    const outIndex = args.indexOf('--out');
    const outFile = args[outIndex + 1];
    if (outFile === undefined) throw new Error('no --out');
    writeFileSync(outFile, content, 'utf8');
    return { stdout: '', stderr: '' };
  };
}

function adapter(invoker: Invoker, exists = true) {
  return createEccAdapter({ candidates: ['/fake/ecc.js'], timeoutMs: 1000, invoker, fileExists: () => exists });
}

describe('eccAdapter', () => {
  it('probe reports the first existing candidate', () => {
    const found = createEccAdapter({ candidates: ['/a', '/b'], timeoutMs: 1, fileExists: (p) => p === '/b' }).probe();
    expect(found).toEqual({ available: true, cliPath: '/b' });
    const missing = createEccAdapter({ candidates: ['/a'], timeoutMs: 1, fileExists: () => false }).probe();
    expect(missing.available).toBe(false);
    expect(missing.reason).toContain('/a');
  });

  it('passes an argument array (no shell) including --path, --out and --budget', async () => {
    let seen: string[] = [];
    const invoker: Invoker = async (file, args) => {
      seen = [file, ...args];
      return writingInvoker(fixtureText)(file, args, { timeoutMs: 1 });
    };
    const result = await adapter(invoker).compileContext({ task: 'add tests; rm -rf /', repositoryPath: '/repo', tokenBudget: 1500 });
    expect(result.ok).toBe(true);
    expect(seen[0]).toBe('/fake/ecc.js');
    expect(seen.slice(1, 5)).toEqual(['context', 'add tests; rm -rf /', '--path', '/repo']);
    expect(seen).toContain('--budget');
    expect(seen).toContain('1500');
  });

  it('returns ADAPTER_UNAVAILABLE without invoking when no CLI exists', async () => {
    let invoked = false;
    const result = await adapter(async () => {
      invoked = true;
      return { stdout: '', stderr: '' };
    }, false).compileContext({ task: 't', repositoryPath: '/r' });
    expect(invoked).toBe(false);
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.error.code).toBe('ADAPTER_UNAVAILABLE');
  });

  it('validates input before spawning', async () => {
    const result = await adapter(writingInvoker(fixtureText)).compileContext({ task: '  ', repositoryPath: '/r' });
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.error.code).toBe('INVALID_INPUT');
    const budget = await adapter(writingInvoker(fixtureText)).compileContext({ task: 't', repositoryPath: '/r', tokenBudget: -1 });
    expect(budget.ok).toBe(false);
  });

  it('maps malformed JSON and contract drift to CONTRACT_VIOLATION', async () => {
    const malformed = await adapter(writingInvoker('{not json')).compileContext({ task: 't', repositoryPath: '/r' });
    expect(malformed.ok).toBe(false);
    if (!malformed.ok) expect(malformed.error.code).toBe('CONTRACT_VIOLATION');
    const drifted = await adapter(writingInvoker('{"version":"9"}')).compileContext({ task: 't', repositoryPath: '/r' });
    expect(drifted.ok).toBe(false);
    if (!drifted.ok) {
      expect(drifted.error.code).toBe('CONTRACT_VIOLATION');
      expect(drifted.error.details?.['issues']).toBeDefined();
    }
  });

  it('classifies timeouts, missing binaries and non-zero exits', async () => {
    const timeout = await adapter(async () => {
      throw Object.assign(new Error('killed'), { killed: true, signal: 'SIGTERM' });
    }).compileContext({ task: 't', repositoryPath: '/r' });
    if (timeout.ok) throw new Error('expected failure');
    expect(timeout.error.code).toBe('ADAPTER_TIMEOUT');

    const enoent = await adapter(async () => {
      throw Object.assign(new Error('spawn'), { code: 'ENOENT' });
    }).compileContext({ task: 't', repositoryPath: '/r' });
    if (enoent.ok) throw new Error('expected failure');
    expect(enoent.error.code).toBe('ADAPTER_UNAVAILABLE');

    const failed = await adapter(async () => {
      throw Object.assign(new Error('exit 1'), { code: 1, stderr: 'Usage: ecc ...' });
    }).compileContext({ task: 't', repositoryPath: '/r' });
    if (failed.ok) throw new Error('expected failure');
    expect(failed.error.code).toBe('ADAPTER_FAILED');
    expect(failed.error.details?.['stderr']).toContain('Usage');
  });

  it('parsePackage accepts the fixture directly', () => {
    expect(parsePackage(fixtureText).ok).toBe(true);
  });
});
