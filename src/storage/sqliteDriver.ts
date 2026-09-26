/**
 * The single module that touches `node:sqlite`. Everything else depends on the small
 * `Database` interface below, so swapping the driver is a one-file change.
 */
import { mkdirSync } from 'node:fs';
import { dirname } from 'node:path';
import { DatabaseSync, type SQLInputValue, type SQLOutputValue } from 'node:sqlite';
import { AppError } from '../shared/errors.js';

export type Row = Record<string, SQLOutputValue>;
export type Param = SQLInputValue;

export interface Statement {
  run(...params: Param[]): { changes: number | bigint; lastInsertRowid: number | bigint };
  get(...params: Param[]): Row | undefined;
  all(...params: Param[]): Row[];
}

export interface Database {
  readonly path: string;
  exec(sql: string): void;
  prepare(sql: string): Statement;
  /** Runs `fn` inside BEGIN/COMMIT; rolls back and rethrows on any error. */
  transaction<T>(fn: () => T): T;
  close(): void;
  isOpen(): boolean;
}

export const IN_MEMORY = ':memory:';

export function openDatabase(path: string): Database {
  if (path !== IN_MEMORY) mkdirSync(dirname(path), { recursive: true });
  let handle: DatabaseSync;
  try {
    handle = new DatabaseSync(path);
  } catch (cause) {
    throw new AppError('STORAGE_FAILURE', `Cannot open database at ${path}`, { cause, details: { path } });
  }
  handle.exec('PRAGMA journal_mode = WAL');
  handle.exec('PRAGMA foreign_keys = ON');
  handle.exec('PRAGMA busy_timeout = 5000');
  let open = true;

  const db: Database = {
    path,
    exec: (sql) => handle.exec(sql),
    prepare: (sql) => {
      const statement = handle.prepare(sql);
      return {
        run: (...params) => statement.run(...params),
        get: (...params) => statement.get(...params) as Row | undefined,
        all: (...params) => statement.all(...params) as Row[],
      };
    },
    transaction: (fn) => {
      handle.exec('BEGIN');
      try {
        const result = fn();
        handle.exec('COMMIT');
        return result;
      } catch (cause) {
        handle.exec('ROLLBACK');
        throw cause;
      }
    },
    close: () => {
      if (!open) return;
      open = false;
      handle.close();
    },
    isOpen: () => open,
  };
  return db;
}
