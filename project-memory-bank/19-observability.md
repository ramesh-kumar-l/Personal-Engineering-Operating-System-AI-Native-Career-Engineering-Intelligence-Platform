# 19 — Observability

Status: ACTIVE (structured logging + audit shipped; no metrics dashboard)
Last updated: 2026-09-22 (Phase 1)

## FACT — Shipped in Phase 1

Structured JSON-lines logging (`src/observability/logger.ts`): one JSON object per line to
stderr (keeps stdout clean for machine-readable CLI output), level-filtered, secret-redacting,
supports `.child()` for scoped fields. Timing helpers (`measure`/`measureSync`) wrap any
function with an injectable clock and return a rounded millisecond duration — used by
`ContextService` to report `durationMs` on every context compilation. The append-only
`audit_log` table (distinct from logs: it is queryable local history, not a log stream) records
every settings change, AI policy decision, and context compile with actor/action/subject/details.

## CONSTRAINT (spec §61)

Structured logs, metrics, health checks, error tracking, latency, AI/token usage, evaluation metrics. No infrastructure for appearance.

## FACT — Context-compiler metrics the spec requires (§29)

tokens before, tokens after, compression ratio, retrieval relevance, latency, task success, human corrections. ECC already reports tokens and `excluded` counts per package; the rest must be captured here.

## NEXT ACTION (Phase 5)

Add the remaining context-compiler metrics spec §29 requires beyond tokens/excluded (already
in `ContextMetrics`): compression ratio, retrieval relevance, task success, human corrections —
once personal-layer context merging (Phase 5) gives something to measure corrections against.
