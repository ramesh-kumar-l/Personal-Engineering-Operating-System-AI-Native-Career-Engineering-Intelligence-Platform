/**
 * This repo's independent zod mirror of the Engineering-Context-Compiler `EngineeringContextPackage`
 * JSON contract. It is re-declared here on purpose (D-001): we depend on the JSON the ECC CLI
 * prints, never on ECC source. Shape verified against a real package captured from ECC commit
 * 45fd3d3 on 2026-09-19 (test/fixtures/ecc/package.45fd3d3.json). If ECC changes, update here.
 *
 * Policy: structural fields are strict (missing arrays fail closed); open vocabularies such as
 * `source` are strings so a new evidence source in ECC does not break this repo.
 */
import { z } from 'zod';

export const eccTrustLevelSchema = z.enum(['fact', 'derived', 'inference', 'unknown']);
export type EccTrustLevel = z.infer<typeof eccTrustLevelSchema>;

/** Evidence sources ECC documents today; informational, not enforced. */
export const KNOWN_ECC_SOURCES = ['code', 'git', 'pr', 'issue', 'documentation', 'test', 'ci', 'runtime', 'incident', 'memory', 'constraint'] as const;

export const eccProvenanceSchema = z.object({
  source: z.string().min(1),
  identifier: z.string().optional(),
  path: z.string().optional(),
  lineRange: z.string().optional(),
  commit: z.string().optional(),
  timestamp: z.string().optional(),
  authority: z.enum(['low', 'medium', 'high']).optional(),
  freshness: z.enum(['current', 'stale', 'unknown']).optional(),
});

export const eccEvidenceItemSchema = z.object({
  source: z.string().min(1),
  path: z.string().optional(),
  identifier: z.string().optional(),
  symbols: z.array(z.string()).optional(),
  relevance: z.number().min(0).max(1),
  confidence: z.number().optional(),
  provenance: eccProvenanceSchema.optional(),
  trustLevel: eccTrustLevelSchema,
});
export type EccEvidenceItem = z.infer<typeof eccEvidenceItemSchema>;

export const eccConflictSchema = z.object({
  subject: z.string(),
  items: z.array(eccEvidenceItemSchema),
});

export const eccHistoricalClaimSchema = z.object({
  claim: z.string(),
  trustLevel: eccTrustLevelSchema,
  source: z.object({ type: z.string(), id: z.string() }),
});

export const eccConstraintSchema = z.object({
  statement: z.string(),
  provenance: eccProvenanceSchema,
});

export const eccExclusionSchema = z.object({
  reason: z.string(),
  count: z.number().int().nonnegative(),
});

export const eccContextPackageSchema = z.object({
  version: z.string(),
  task: z.object({ type: z.string(), request: z.string() }),
  repository: z.object({ name: z.string(), commit: z.string() }),
  context: z.object({
    primary: z.array(eccEvidenceItemSchema),
    supporting: z.array(eccEvidenceItemSchema),
  }),
  conflicts: z.array(eccConflictSchema),
  history: z.array(eccHistoricalClaimSchema),
  constraints: z.array(eccConstraintSchema),
  unknowns: z.array(z.string()),
  verification: z.array(z.string()),
  excluded: z.array(eccExclusionSchema),
});
export type EccContextPackage = z.infer<typeof eccContextPackageSchema>;

/** Summary numbers derived from a package; used for metrics and audit, never for scoring. */
export function summarisePackage(pkg: EccContextPackage): { primary: number; supporting: number; excluded: number; conflicts: number } {
  return {
    primary: pkg.context.primary.length,
    supporting: pkg.context.supporting.length,
    excluded: pkg.excluded.reduce((sum, item) => sum + item.count, 0),
    conflicts: pkg.conflicts.length,
  };
}
