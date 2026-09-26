/**
 * Domain primitives shared by every entity: identifiers, timestamps, trust, sensitivity,
 * freshness and provenance. These encode the spec's trust and privacy rules at the type level
 * so no entity can exist without saying where it came from and how much it can be trusted.
 */
import { randomUUID } from 'node:crypto';
import { z } from 'zod';

export const idSchema = z.uuid();
export type Id = z.infer<typeof idSchema>;

export const isoTimestampSchema = z.iso.datetime();
export type IsoTimestamp = z.infer<typeof isoTimestampSchema>;

/** Trust states shown to the user (spec §56). Order is from most to least trustworthy. */
export const trustLevelSchema = z.enum([
  'verified',
  'evidence_backed',
  'user_authored',
  'ai_generated',
  'inferred',
  'uncertain',
]);
export type TrustLevel = z.infer<typeof trustLevelSchema>;

/** Data classification driving what may leave the machine (spec §50). */
export const sensitivitySchema = z.enum(['public', 'personal', 'employer']);
export type Sensitivity = z.infer<typeof sensitivitySchema>;

export const freshnessSchema = z.enum(['current', 'stale', 'unknown']);
export type Freshness = z.infer<typeof freshnessSchema>;

export const actorSchema = z.enum(['user', 'system', 'ai', 'integration']);
export type Actor = z.infer<typeof actorSchema>;

export const provenanceSchema = z.object({
  /** Who or what produced the record. */
  actor: actorSchema,
  /** Origin system or surface, e.g. "cli", "ecc", "manual". */
  source: z.string().min(1),
  /** Optional pointer into the origin: a path, commit, URL, or external id. */
  reference: z.string().optional(),
  capturedAt: isoTimestampSchema,
});
export type Provenance = z.infer<typeof provenanceSchema>;

export function newId(): Id {
  return randomUUID();
}

export function nowIso(clock: () => number = Date.now): IsoTimestamp {
  return new Date(clock()).toISOString();
}

/** Sensitivity ordering used by the AI policy gate: higher index is more sensitive. */
const SENSITIVITY_RANK: Record<Sensitivity, number> = { public: 0, personal: 1, employer: 2 };

export function isAtMostSensitive(value: Sensitivity, ceiling: Sensitivity): boolean {
  return SENSITIVITY_RANK[value] <= SENSITIVITY_RANK[ceiling];
}
