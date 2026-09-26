/**
 * Phase 1–2 entity subset (spec §23, §65): Goal → Outcome → Project → Milestone → Task → Evidence,
 * plus Memory and Decision. Schemas only in Phase 1; tables are added by the phase that first
 * needs each entity, so no storage exists for an entity nobody reads yet.
 */
import { z } from 'zod';
import {
  idSchema,
  isoTimestampSchema,
  provenanceSchema,
  sensitivitySchema,
  trustLevelSchema,
} from './primitives.js';

/** Fields every persisted record carries (spec §17). */
export const baseEntitySchema = z.object({
  id: idSchema,
  createdAt: isoTimestampSchema,
  updatedAt: isoTimestampSchema,
  provenance: provenanceSchema,
  trustLevel: trustLevelSchema,
  sensitivity: sensitivitySchema,
  /** Set when a newer record replaces this one; the old record is kept for audit. */
  supersededBy: idSchema.optional(),
});
export type BaseEntity = z.infer<typeof baseEntitySchema>;

export const goalStatusSchema = z.enum(['active', 'paused', 'achieved', 'abandoned']);

export const goalSchema = baseEntitySchema.extend({
  title: z.string().min(1).max(200),
  why: z.string().max(2000).optional(),
  status: goalStatusSchema,
  targetDate: isoTimestampSchema.optional(),
});
export type Goal = z.infer<typeof goalSchema>;

export const outcomeSchema = baseEntitySchema.extend({
  goalId: idSchema,
  statement: z.string().min(1).max(500),
  /** How the user will know it happened; must be observable, not a feeling. */
  measure: z.string().max(500).optional(),
  achievedAt: isoTimestampSchema.optional(),
});
export type Outcome = z.infer<typeof outcomeSchema>;

export const projectSchema = baseEntitySchema.extend({
  outcomeId: idSchema.optional(),
  name: z.string().min(1).max(200),
  repositoryPath: z.string().optional(),
  status: z.enum(['active', 'paused', 'done', 'dropped']),
});
export type Project = z.infer<typeof projectSchema>;

export const milestoneSchema = baseEntitySchema.extend({
  projectId: idSchema,
  title: z.string().min(1).max(200),
  dueAt: isoTimestampSchema.optional(),
  completedAt: isoTimestampSchema.optional(),
});
export type Milestone = z.infer<typeof milestoneSchema>;

export const taskStatusSchema = z.enum(['todo', 'doing', 'blocked', 'done', 'dropped']);

export const taskSchema = baseEntitySchema.extend({
  milestoneId: idSchema.optional(),
  projectId: idSchema.optional(),
  title: z.string().min(1).max(300),
  status: taskStatusSchema,
  estimateMinutes: z.number().int().positive().max(24 * 60).optional(),
  completedAt: isoTimestampSchema.optional(),
});
export type Task = z.infer<typeof taskSchema>;

export const memoryTypeSchema = z.enum(['decision', 'incident', 'outcome', 'preference', 'fact']);

export const memoryEntrySchema = baseEntitySchema.extend({
  type: memoryTypeSchema,
  summary: z.string().min(1).max(500),
  detail: z.string().max(5000).optional(),
  tags: z.array(z.string().min(1)).max(20).default([]),
  /** Repository paths this memory concerns; empty means cross-repo / personal. */
  relatedPaths: z.array(z.string()).max(50).default([]),
  signal: z.enum(['positive', 'negative']).optional(),
});
export type MemoryEntry = z.infer<typeof memoryEntrySchema>;

export const decisionSchema = baseEntitySchema.extend({
  title: z.string().min(1).max(200),
  context: z.string().max(5000),
  alternatives: z.array(z.string()).max(20).default([]),
  chosen: z.string().min(1).max(2000),
  reason: z.string().max(5000),
  tradeoffs: z.string().max(5000).optional(),
  status: z.enum(['proposal', 'decided', 'reverted']),
});
export type Decision = z.infer<typeof decisionSchema>;

export const evidenceCategorySchema = z.enum([
  'technical_depth',
  'system_design',
  'leadership',
  'cross_team',
  'business_impact',
  'reliability',
  'mentorship',
]);

export const evidenceSchema = baseEntitySchema.extend({
  taskId: idSchema.optional(),
  problem: z.string().min(1).max(2000),
  action: z.string().min(1).max(2000),
  decision: z.string().max(2000).optional(),
  impact: z.string().max(2000).optional(),
  categories: z.array(evidenceCategorySchema).max(7).default([]),
  /** Pointers proving the claim: commits, PRs, documents. */
  references: z.array(z.string()).max(50).default([]),
});
export type Evidence = z.infer<typeof evidenceSchema>;
