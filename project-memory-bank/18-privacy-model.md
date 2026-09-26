# 18 — Privacy Model

Status: ACTIVE (classification + enforcement shipped; encryption at rest not yet built)
Last updated: 2026-09-22 (Phase 1)

## FACT — Data classification (spec §50), implemented

`Sensitivity` = `public | personal | employer` (`src/domain/primitives.ts`), ordered so
`isAtMostSensitive(value, ceiling)` is a single comparison. Every `baseEntitySchema` record
carries a `sensitivity` field — no entity can exist without being classified.

## FACT — Enforcement, implemented

`AiGateway.complete()` calls `checkPolicy()` before any provider runs: `mode: offline` (the
shipped default) blocks every external provider unconditionally; `mode: external` still blocks
any request whose `sensitivity` exceeds `maxExternalSensitivity`. Every decision — allowed,
denied, succeeded, failed — is written to the audit log with the provider name and sensitivity
class, so "what did this send, to whom, and why was it allowed" is always answerable. See
[[12-ai-architecture]].

## FACT — Export, deletion, local-first, implemented

All data lives in one SQLite file under `~/.peos` by default, never committed (`.gitignore`).
`ExperienceApi.exportData()` returns every setting and audit event as JSON; `resetData()`
deletes the database files outright. Both exist from the first schema, per spec §50.

## FACT — Not yet built

Encryption at rest (no measured threat yet justifying it for a single-user local file;
revisit if multi-device sync is ever proposed — currently NOT DOING per [[30-not-doing]]).
Retention/TTL controls (no entity yet accumulates enough volume to need them). Project-level
isolation between an employer's code context and personal goals (Phase 2+ decision, once
Project rows exist).

## CONSTRAINT (spec §50, §67)

Local-first where practical; encryption; explicit provider boundaries; data export; deletion; retention controls; project isolation; secure credentials; audit logs. Nothing sensitive goes to an external AI provider without user authorization. Offline degradation must be graceful.

## NEXT ACTION (Phase 2)

When Project rows exist, decide whether `sensitivity: employer` on a project should hard-block
that project's data from ever reaching `mode: external`, regardless of the configured ceiling.
