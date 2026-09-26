/**
 * The one test that spawns a real process. It runs only when a sibling ECC checkout is present
 * (developer machines), and is skipped in CI. It proves the contract mirror against live output.
 */
import { existsSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, expect, it } from 'vitest';
import { eccCliCandidates } from '../../config/paths.js';
import { createEccAdapter } from './eccAdapter.js';

const candidates = eccCliCandidates(process.env, process.cwd());
const cliPath = candidates.find((candidate) => existsSync(candidate));
const eccRepo = cliPath === undefined ? undefined : resolve(cliPath, '..', '..', '..');

describe.skipIf(cliPath === undefined)('eccAdapter (real CLI)', () => {
  it('compiles a package from the sibling ECC checkout that satisfies the mirror', async () => {
    const adapter = createEccAdapter({ candidates, timeoutMs: 120_000 });
    const result = await adapter.compileContext({ task: 'add a unit test for the context compiler', repositoryPath: eccRepo ?? '.', tokenBudget: 1500 });
    if (!result.ok) throw new Error(`${result.error.code}: ${result.error.message}`);
    expect(result.value.repository.name).toBe('Engineering-Context-Compiler');
    expect(result.value.context.primary.length).toBeGreaterThan(0);
    expect(result.value.verification[0]).toMatch(/^Risk: /);
  }, 120_000);
});
