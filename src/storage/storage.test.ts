import { existsSync, mkdtempSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { z } from 'zod';
import { createAuditRepository } from './auditRepository.js';
import { currentSchemaVersion, runMigrations, type Migration } from './migrations.js';
import { allMigrations } from './migrations/index.js';
import { createSettingsRepository } from './settingsRepository.js';
import { IN_MEMORY, openDatabase, type Database } from './sqliteDriver.js';

let dir: string;
let db: Database;

beforeEach(() => {
  dir = mkdtempSync(join(tmpdir(), 'peos-storage-'));
  db = openDatabase(join(dir, 'nested', 'test.db'));
});

afterEach(() => {
  db.close();
  rmSync(dir, { recursive: true, force: true });
});

describe('sqliteDriver', () => {
  it('creates parent directories and the database file', () => {
    expect(existsSync(join(dir, 'nested', 'test.db'))).toBe(true);
    expect(db.isOpen()).toBe(true);
  });

  it('rolls back a failed transaction', () => {
    db.exec('CREATE TABLE t (id INTEGER PRIMARY KEY)');
    expect(() =>
      db.transaction(() => {
        db.prepare('INSERT INTO t (id) VALUES (?)').run(1);
        throw new Error('abort');
      }),
    ).toThrow('abort');
    expect(db.prepare('SELECT COUNT(*) AS n FROM t').get()?.['n']).toBe(0);
  });

  it('close is idempotent', () => {
    const mem = openDatabase(IN_MEMORY);
    mem.close();
    expect(() => mem.close()).not.toThrow();
    expect(mem.isOpen()).toBe(false);
  });
});

describe('migrations', () => {
  it('applies all migrations once and is idempotent on re-run', () => {
    const first = runMigrations(db, allMigrations, () => 0);
    expect(first.applied).toEqual(['1_foundation']);
    expect(first.currentVersion).toBe(1);
    const second = runMigrations(db, allMigrations, () => 0);
    expect(second.applied).toEqual([]);
    expect(currentSchemaVersion(db)).toBe(1);
  });

  it('fails closed and keeps the previous version when a migration throws', () => {
    const broken: Migration = { id: 2, name: 'broken', up: (d) => d.exec('CREATE TABLE x (id INTEGER); INSERT INTO nope VALUES (1)') };
    expect(() => runMigrations(db, [...allMigrations, broken])).toThrow(/Migration 2_broken failed/);
    expect(currentSchemaVersion(db)).toBe(1);
    expect(db.prepare("SELECT name FROM sqlite_master WHERE name = 'x'").get()).toBeUndefined();
  });

  it('rejects unordered migration lists', () => {
    const a: Migration = { id: 2, name: 'a', up: () => undefined };
    const b: Migration = { id: 1, name: 'b', up: () => undefined };
    expect(() => runMigrations(db, [a, b])).toThrow(/strictly ascending/);
  });
});

describe('settingsRepository', () => {
  it('round-trips JSON values with typed reads and validates keys', () => {
    runMigrations(db, allMigrations);
    const settings = createSettingsRepository(db, () => 0);
    settings.set('ecc.cliPath', '/x/cli.js');
    settings.set('ui.limit', 5);
    expect(settings.get('ecc.cliPath', z.string())).toEqual({ ok: true, value: '/x/cli.js' });
    expect(settings.get('ui.limit', z.number())).toEqual({ ok: true, value: 5 });
    expect(settings.get('missing', z.string())).toEqual({ ok: true, value: undefined });
    const wrong = settings.get('ui.limit', z.string());
    expect(wrong.ok).toBe(false);
    expect(settings.list().map((s) => s.key)).toEqual(['ecc.cliPath', 'ui.limit']);
    expect(settings.delete('ui.limit')).toBe(true);
    expect(settings.delete('ui.limit')).toBe(false);
    expect(() => settings.set('Bad Key', 1)).toThrow(/Invalid setting key/);
  });
});

describe('auditRepository', () => {
  it('appends validated events and lists newest first', () => {
    runMigrations(db, allMigrations);
    let t = 0;
    const audit = createAuditRepository(db, () => (t += 1000));
    audit.append({ actor: 'system', action: 'first' });
    audit.append({ actor: 'user', action: 'second', subject: 's', details: { n: 1 } });
    expect(audit.count()).toBe(2);
    const events = audit.list();
    expect(events.map((e) => e.action)).toEqual(['second', 'first']);
    expect(events[0]?.details).toEqual({ n: 1 });
    expect(events[1]?.subject).toBeUndefined();
    expect(audit.list({ limit: 1 })).toHaveLength(1);
    expect(() => audit.append({ actor: 'nobody' as 'user', action: 'x' })).toThrow();
  });
});
