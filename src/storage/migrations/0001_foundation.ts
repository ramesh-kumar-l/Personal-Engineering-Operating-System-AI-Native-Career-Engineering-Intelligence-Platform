/**
 * Foundation tables. `settings` holds typed key/value configuration written by the user;
 * `audit_log` is an append-only record of what the system did on the user's behalf (spec §51
 * auditability, §67 audit logs). Entity tables arrive with the phase that first needs them.
 */
import type { Migration } from '../migrations.js';

export const foundation: Migration = {
  id: 1,
  name: 'foundation',
  up(db) {
    db.exec(`
      CREATE TABLE settings (
        key TEXT PRIMARY KEY,
        value_json TEXT NOT NULL,
        updated_at TEXT NOT NULL
      )`);
    db.exec(`
      CREATE TABLE audit_log (
        id TEXT PRIMARY KEY,
        ts TEXT NOT NULL,
        actor TEXT NOT NULL CHECK (actor IN ('user', 'system', 'ai', 'integration')),
        action TEXT NOT NULL,
        subject TEXT,
        details_json TEXT
      )`);
    db.exec('CREATE INDEX audit_log_ts ON audit_log (ts)');
    db.exec('CREATE INDEX audit_log_action ON audit_log (action)');
  },
};
