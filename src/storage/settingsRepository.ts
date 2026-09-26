/**
 * Typed key/value settings. Values are JSON; readers pass a zod schema so a corrupted or
 * stale value surfaces as a validation error instead of propagating as `any`.
 */
import type { ZodType } from 'zod';
import { AppError } from '../shared/errors.js';
import { err, ok, type Result } from '../shared/result.js';
import type { Database } from './sqliteDriver.js';

export interface SettingRecord {
  key: string;
  value: unknown;
  updatedAt: string;
}

export interface SettingsRepository {
  get<T>(key: string, schema: ZodType<T>): Result<T | undefined>;
  getRaw(key: string): unknown;
  set(key: string, value: unknown): void;
  delete(key: string): boolean;
  list(): SettingRecord[];
}

const KEY_PATTERN = /^[a-z][a-zA-Z0-9]*(\.[a-z][a-zA-Z0-9]*)*$/;

export function isValidSettingKey(key: string): boolean {
  return KEY_PATTERN.test(key);
}

export function createSettingsRepository(db: Database, clock: () => number = Date.now): SettingsRepository {
  const select = db.prepare('SELECT value_json FROM settings WHERE key = ?');
  const upsert = db.prepare(
    'INSERT INTO settings (key, value_json, updated_at) VALUES (?, ?, ?) ON CONFLICT(key) DO UPDATE SET value_json = excluded.value_json, updated_at = excluded.updated_at',
  );
  const remove = db.prepare('DELETE FROM settings WHERE key = ?');
  const selectAll = db.prepare('SELECT key, value_json, updated_at FROM settings ORDER BY key');

  const getRaw = (key: string): unknown => {
    const row = select.get(key);
    if (row === undefined) return undefined;
    return JSON.parse(String(row['value_json']));
  };

  return {
    getRaw,
    get(key, schema) {
      const raw = getRaw(key);
      if (raw === undefined) return ok(undefined);
      const parsed = schema.safeParse(raw);
      if (!parsed.success) {
        return err(new AppError('INVALID_INPUT', `Setting "${key}" has an unexpected shape`, { details: { key, issues: parsed.error.issues } }));
      }
      return ok(parsed.data);
    },
    set(key, value) {
      if (!isValidSettingKey(key)) {
        throw new AppError('INVALID_INPUT', `Invalid setting key "${key}" (expected dotted camelCase segments, e.g. ecc.cliPath)`, { details: { key } });
      }
      upsert.run(key, JSON.stringify(value), new Date(clock()).toISOString());
    },
    delete(key) {
      return Number(remove.run(key).changes) > 0;
    },
    list() {
      return selectAll.all().map((row) => ({
        key: String(row['key']),
        value: JSON.parse(String(row['value_json'])),
        updatedAt: String(row['updated_at']),
      }));
    },
  };
}
