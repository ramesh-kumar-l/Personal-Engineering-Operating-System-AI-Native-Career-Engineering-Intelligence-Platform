/**
 * Forward-only, transactional schema migrations. Each migration runs exactly once, in id
 * order, inside its own transaction. A failing migration leaves the schema at the previous
 * version and reports which one failed.
 */
import { AppError } from '../shared/errors.js';
import type { Database } from './sqliteDriver.js';

export interface Migration {
  readonly id: number;
  readonly name: string;
  up(db: Database): void;
}

export interface MigrationReport {
  applied: string[];
  currentVersion: number;
}

const TRACKING_TABLE = `
CREATE TABLE IF NOT EXISTS schema_migrations (
  id INTEGER PRIMARY KEY,
  name TEXT NOT NULL,
  applied_at TEXT NOT NULL
)`;

export function validateMigrationList(migrations: readonly Migration[]): void {
  let previous = 0;
  for (const migration of migrations) {
    if (!Number.isInteger(migration.id) || migration.id <= previous) {
      throw new AppError('MIGRATION_FAILED', `Migration ids must be strictly ascending positive integers; got ${migration.id} after ${previous}`);
    }
    previous = migration.id;
  }
}

export function currentSchemaVersion(db: Database): number {
  db.exec(TRACKING_TABLE);
  const row = db.prepare('SELECT COALESCE(MAX(id), 0) AS version FROM schema_migrations').get();
  return Number(row?.['version'] ?? 0);
}

export function runMigrations(db: Database, migrations: readonly Migration[], clock: () => number = Date.now): MigrationReport {
  validateMigrationList(migrations);
  const startVersion = currentSchemaVersion(db);
  const applied: string[] = [];
  const insert = db.prepare('INSERT INTO schema_migrations (id, name, applied_at) VALUES (?, ?, ?)');

  for (const migration of migrations) {
    if (migration.id <= startVersion) continue;
    try {
      db.transaction(() => {
        migration.up(db);
        insert.run(migration.id, migration.name, new Date(clock()).toISOString());
      });
      applied.push(`${migration.id}_${migration.name}`);
    } catch (cause) {
      throw new AppError('MIGRATION_FAILED', `Migration ${migration.id}_${migration.name} failed: ${(cause as Error).message}`, {
        cause,
        details: { migrationId: migration.id, appliedBeforeFailure: applied },
      });
    }
  }
  return { applied, currentVersion: currentSchemaVersion(db) };
}
