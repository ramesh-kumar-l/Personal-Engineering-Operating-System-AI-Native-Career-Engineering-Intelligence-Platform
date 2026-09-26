/**
 * Append-only audit log. Records what the system did (adapter calls, policy decisions,
 * destructive operations) so the user can always answer "what did this thing do?".
 */
import { z } from 'zod';
import { actorSchema, newId, nowIso, type Actor } from '../domain/primitives.js';
import type { Database } from './sqliteDriver.js';

export const auditEventSchema = z.object({
  id: z.uuid(),
  ts: z.iso.datetime(),
  actor: actorSchema,
  action: z.string().min(1).max(100),
  subject: z.string().max(500).optional(),
  details: z.record(z.string(), z.unknown()).optional(),
});
export type AuditEvent = z.infer<typeof auditEventSchema>;

export interface AuditInput {
  actor: Actor;
  action: string;
  subject?: string;
  details?: Record<string, unknown>;
}

export interface AuditRepository {
  append(input: AuditInput): AuditEvent;
  list(options?: { limit?: number }): AuditEvent[];
  count(): number;
}

const DEFAULT_LIMIT = 50;
const MAX_LIMIT = 1000;

export function createAuditRepository(db: Database, clock: () => number = Date.now): AuditRepository {
  const insert = db.prepare('INSERT INTO audit_log (id, ts, actor, action, subject, details_json) VALUES (?, ?, ?, ?, ?, ?)');
  const selectRecent = db.prepare('SELECT id, ts, actor, action, subject, details_json FROM audit_log ORDER BY ts DESC, rowid DESC LIMIT ?');
  const selectCount = db.prepare('SELECT COUNT(*) AS n FROM audit_log');

  return {
    append(input) {
      const event: AuditEvent = auditEventSchema.parse({
        id: newId(),
        ts: nowIso(clock),
        actor: input.actor,
        action: input.action,
        ...(input.subject === undefined ? {} : { subject: input.subject }),
        ...(input.details === undefined ? {} : { details: input.details }),
      });
      insert.run(event.id, event.ts, event.actor, event.action, event.subject ?? null, event.details === undefined ? null : JSON.stringify(event.details));
      return event;
    },
    list(options = {}) {
      const limit = Math.min(Math.max(options.limit ?? DEFAULT_LIMIT, 1), MAX_LIMIT);
      return selectRecent.all(limit).map((row) => {
        const event: AuditEvent = {
          id: String(row['id']),
          ts: String(row['ts']),
          actor: String(row['actor']) as Actor,
          action: String(row['action']),
        };
        if (row['subject'] !== null) event.subject = String(row['subject']);
        if (row['details_json'] !== null) event.details = JSON.parse(String(row['details_json'])) as Record<string, unknown>;
        return event;
      });
    },
    count() {
      return Number(selectCount.get()?.['n'] ?? 0);
    },
  };
}
