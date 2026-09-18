# 07 — Domain Model

Status: UNKNOWN — to be defined in Phase 1
Last updated: 2026-09-19 (Phase 0)

## FACT — Candidate entities (spec §65; implement only when justified)

User, Goal, Objective, Task, Project, Skill, Memory, Decision, Evidence, Artifact, InterviewQuestion, InterviewSession, LearningItem, Achievement, Job, Contact, AgentRun, Evaluation, Metric.

## FACT — Core relationship (spec §23)

Goal → Outcome → Project → Milestone → Task → Evidence.

## FACT — Existing external models to align with, not duplicate

- ECC `EngineeringContextPackage` (task, repository, context.primary/supporting, conflicts, verification, unknowns, excluded, history) and `MemoryEntry {id, type, summary, detail?, tags?, relatedPaths?, timestamp, signal?}`.
- EEP domain schemas: Task, Experiment, Condition, Run, Trace, Evidence, ContextArtifact, Decision, Action, Verification, Outcome, Metric, Evaluation, Report (14 zod schemas, branded IDs, ISO timestamps).

## NEXT ACTION (Phase 1)

Define the Phase 1–2 subset (User, Goal, Objective, Project, Task, Memory, Decision, Evidence) with provenance, trust level, freshness, and supersession fields per [[14-memory-model]] and [[15-trust-model]].
