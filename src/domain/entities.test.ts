import { describe, expect, it } from 'vitest';
import { decisionSchema, evidenceSchema, goalSchema, memoryEntrySchema, taskSchema } from './entities.js';
import { isAtMostSensitive, newId, nowIso, provenanceSchema, trustLevelSchema } from './primitives.js';

const base = () => ({
  id: newId(),
  createdAt: nowIso(() => 0),
  updatedAt: nowIso(() => 0),
  provenance: { actor: 'user', source: 'cli', capturedAt: nowIso(() => 0) },
  trustLevel: 'user_authored',
  sensitivity: 'personal',
});

describe('primitives', () => {
  it('generates uuids and ISO timestamps', () => {
    expect(newId()).toMatch(/^[0-9a-f-]{36}$/);
    expect(nowIso(() => 0)).toBe('1970-01-01T00:00:00.000Z');
  });

  it('orders sensitivity for the policy gate', () => {
    expect(isAtMostSensitive('public', 'public')).toBe(true);
    expect(isAtMostSensitive('personal', 'public')).toBe(false);
    expect(isAtMostSensitive('personal', 'employer')).toBe(true);
  });

  it('rejects provenance without an actor', () => {
    expect(provenanceSchema.safeParse({ source: 'x', capturedAt: nowIso() }).success).toBe(false);
    expect(trustLevelSchema.options).toContain('uncertain');
  });
});

describe('entities', () => {
  it('parses a goal and rejects an invalid status', () => {
    expect(goalSchema.safeParse({ ...base(), title: 'Ship MVP', status: 'active' }).success).toBe(true);
    expect(goalSchema.safeParse({ ...base(), title: 'Ship MVP', status: 'someday' }).success).toBe(false);
    expect(goalSchema.safeParse({ ...base(), title: '', status: 'active' }).success).toBe(false);
  });

  it('bounds task estimates to a day', () => {
    expect(taskSchema.safeParse({ ...base(), title: 't', status: 'todo', estimateMinutes: 45 }).success).toBe(true);
    expect(taskSchema.safeParse({ ...base(), title: 't', status: 'todo', estimateMinutes: 5000 }).success).toBe(false);
  });

  it('applies defaults for memory arrays and requires a chosen decision', () => {
    const memory = memoryEntrySchema.parse({ ...base(), type: 'decision', summary: 'Use SQLite' });
    expect(memory.tags).toEqual([]);
    expect(memory.relatedPaths).toEqual([]);
    expect(decisionSchema.safeParse({ ...base(), title: 'd', context: 'c', chosen: '', reason: 'r', status: 'decided' }).success).toBe(false);
  });

  it('requires problem and action on evidence and validates categories', () => {
    expect(evidenceSchema.safeParse({ ...base(), problem: 'p', action: 'a', categories: ['reliability'] }).success).toBe(true);
    expect(evidenceSchema.safeParse({ ...base(), problem: 'p', action: 'a', categories: ['vibes'] }).success).toBe(false);
    expect(evidenceSchema.safeParse({ ...base(), problem: 'p' }).success).toBe(false);
  });

  it('accepts supersession pointers only as ids', () => {
    expect(goalSchema.safeParse({ ...base(), title: 'g', status: 'active', supersededBy: newId() }).success).toBe(true);
    expect(goalSchema.safeParse({ ...base(), title: 'g', status: 'active', supersededBy: 'old' }).success).toBe(false);
  });
});
