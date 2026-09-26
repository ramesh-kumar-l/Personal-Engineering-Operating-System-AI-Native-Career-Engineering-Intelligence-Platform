# 07 — Domain Model

Status: ACTIVE (Phase 1–2 subset defined as zod schemas; storage per-phase)
Last updated: 2026-09-22 (Phase 1)

## FACT — Phase 1 schemas (`src/domain/entities.ts`)

Goal, Outcome, Project, Milestone, Task, MemoryEntry, Decision, Evidence — each extending
`baseEntitySchema` (id, createdAt, updatedAt, provenance, trustLevel, sensitivity,
supersededBy). See [[08-data-model]] for which have tables today (none yet beyond
settings/audit) and which phase adds each table.

## FACT — Candidate entities (spec §65; implement only when justified)

User, Goal, Objective, Task, Project, Skill, Memory, Decision, Evidence, Artifact, InterviewQuestion, InterviewSession, LearningItem, Achievement, Job, Contact, AgentRun, Evaluation, Metric.

## FACT — Core relationship (spec §23)

Goal → Outcome → Project → Milestone → Task → Evidence.

## FACT — Existing external models to align with, not duplicate

- ECC `EngineeringContextPackage` (task, repository, context.primary/supporting, conflicts, verification, unknowns, excluded, history) and `MemoryEntry {id, type, summary, detail?, tags?, relatedPaths?, timestamp, signal?}`.
- EEP domain schemas: Task, Experiment, Condition, Run, Trace, Evidence, ContextArtifact, Decision, Action, Verification, Outcome, Metric, Evaluation, Report (14 zod schemas, branded IDs, ISO timestamps).

## NEXT ACTION (Phase 2)

Add a `User` schema only if a second user context ever appears (single-user assumption today);
add Goal/Outcome/Project/Milestone/Task repositories and tables.
