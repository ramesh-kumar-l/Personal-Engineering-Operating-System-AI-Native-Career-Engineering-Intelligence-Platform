/**
 * Strict modularity guard: every source file stays under 300 lines so future tasks can read
 * only the module they need (project rule, see project-memory-bank/01-product-principles.md).
 */
import { readdirSync, readFileSync, statSync } from 'node:fs';
import { join, relative } from 'node:path';
import { fileURLToPath } from 'node:url';
import { describe, expect, it } from 'vitest';

const MAX_LINES = 300;
const ROOT = fileURLToPath(new URL('../../', import.meta.url));
const SRC = join(ROOT, 'src');

function walk(dir: string): string[] {
  return readdirSync(dir).flatMap((name) => {
    const full = join(dir, name);
    return statSync(full).isDirectory() ? walk(full) : full.endsWith('.ts') ? [full] : [];
  });
}

describe('strict modularity', () => {
  it(`keeps every src/**/*.ts file under ${MAX_LINES} lines`, () => {
    const offenders = walk(SRC)
      .map((file) => ({ file: relative(ROOT, file), lines: readFileSync(file, 'utf8').split('\n').length }))
      .filter((entry) => entry.lines > MAX_LINES);
    expect(offenders).toEqual([]);
  });
});
