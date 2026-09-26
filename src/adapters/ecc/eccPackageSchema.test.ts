import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { eccContextPackageSchema, summarisePackage } from './eccPackageSchema.js';

const FIXTURE = new URL('../../../test/fixtures/ecc/package.45fd3d3.json', import.meta.url);

export function loadFixture(): unknown {
  return JSON.parse(readFileSync(FIXTURE, 'utf8'));
}

describe('eccPackageSchema (contract mirror)', () => {
  it('accepts a real package captured from ECC commit 45fd3d3', () => {
    const parsed = eccContextPackageSchema.safeParse(loadFixture());
    expect(parsed.success).toBe(true);
    if (!parsed.success) return;
    expect(parsed.data.repository.commit).toBe('45fd3d3ae13702f0224dbc85b7d7937aec66f0d4');
    expect(parsed.data.task.type).toBe('test');
    expect(summarisePackage(parsed.data)).toEqual({ primary: 19, supporting: 18, excluded: 6, conflicts: 0 });
  });

  it('fails closed when a structural field is missing', () => {
    const fixture = loadFixture() as Record<string, unknown>;
    delete fixture['verification'];
    expect(eccContextPackageSchema.safeParse(fixture).success).toBe(false);
  });

  it('fails closed on an unknown trust level but tolerates an unknown evidence source', () => {
    const fixture = loadFixture() as { context: { primary: Record<string, unknown>[] } };
    const item = fixture.context.primary[0];
    if (item === undefined) throw new Error('fixture has no primary items');
    item['source'] = 'brand-new-source';
    expect(eccContextPackageSchema.safeParse(fixture).success).toBe(true);
    item['trustLevel'] = 'gospel';
    expect(eccContextPackageSchema.safeParse(fixture).success).toBe(false);
  });

  it('rejects relevance outside [0, 1]', () => {
    const fixture = loadFixture() as { context: { primary: Record<string, unknown>[] } };
    const item = fixture.context.primary[0];
    if (item === undefined) throw new Error('fixture has no primary items');
    item['relevance'] = 1.5;
    expect(eccContextPackageSchema.safeParse(fixture).success).toBe(false);
  });
});
