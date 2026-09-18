# 08 — Data Model

Status: UNKNOWN — to be defined in Phase 1
Last updated: 2026-09-19 (Phase 0)

## FACT

- No database exists. No schema exists.
- Local-first is a constraint (spec §50, §67).

## PROPOSAL

SQLite as the single local store (see D-002 in [[29-decisions]]). Relational first; vector or event stores only when a measured need appears (spec §92).

## CONSTRAINT

- Localization-ready structures (no hard-coded locale, timezone-aware timestamps in ISO 8601 UTC).
- Every memory/evidence row carries source, timestamp, status, confidence, provenance, superseded-by (spec §17).
- Export and deletion must be supported from the first schema (spec §50).

## NEXT ACTION (Phase 1)

Design the Phase 1–2 tables with a migration strategy before any code.
