# 16 — Evaluation Model

Status: ACTIVE (capability exists in a sibling repo; integration planned for Phase 9)
Last updated: 2026-09-19 (Phase 0)
Source: `D:\ClaudeProjects\Engineering-Evaluation-Platform-EEP-\PROJECT_INDEX.md` (2026-09-19) and `project-memory-bank\18-current-state.md` (stale, dated Phase 6)

## FACT — Owner

Engineering-Evaluation-Platform (EEP). TypeScript/Node, zod v4, vitest. Per its PROJECT_INDEX (verified by its author 2026-09-19): Phase 10 of 13 complete, 299 tests across 78 files; evaluation engine, statistics module, real ECC integration, canonical report persistence, dashboard MVP. No live comparison experiment has been run.

ASSUMPTION: EEP's own `18-current-state.md` says Phase 6 / 130 tests; it lags its index by four phases. Re-verify against the repo before relying on any detail below the index level.

## FACT — What EEP provides (as of its Phase 6 memory)

- 14 zod domain schemas: Task, Experiment, Condition, Run, Trace, Evidence, ContextArtifact, Decision, Action, Verification, Outcome, Metric, Evaluation, Report.
- Harness: isolated filesystem-copy workspace, `executeRun`, deterministic verifiers (`test-suite`, `diff-analysis`), authoritative outcome status.
- Metrics: 5 primary (task-success, engineering-quality, time-to-correct-outcome, context-efficiency, human-intervention) + 9 of 17 secondary.
- `EccContextProvider` consuming ECC via CLI with an independent zod mirror.
- 30 benchmark tasks, 3 with runnable fixtures.

## FACT — Spec dimensions (§41) EEP already covers partly

Correctness, Reliability, Maintainability, Security, Performance, Test Quality, Context Sufficiency, Decision Quality. EEP has no ground truth for decision quality; the spec says not to pretend one exists.

## DECISION (D-001)

Consume EEP's report JSON and, where useful, its CLI once it has one. Do not re-implement evaluation here.

## PROPOSAL

The AI Leverage Ledger (spec §42: human time, AI time, baseline, tokens, rework, corrections, tests, final quality, human intervention) is closer to EEP's Run/Trace/Metric records than to anything in this repo. Prefer emitting ledger entries in EEP's schema shape rather than inventing a parallel one. Decide in Phase 9.

## NEXT ACTION (Phase 9)

Define the evaluation adapter and which EEP metrics surface in the Personal OS.
