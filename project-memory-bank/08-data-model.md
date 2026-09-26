# 08 — Data Model

Status: ACTIVE (foundation tables shipped; entity tables arrive per-phase)
Last updated: 2026-09-22 (Phase 1)

## FACT — Storage (D-004)

SQLite via `node:sqlite`, one file at `<home>/peos.db` (default `~/.peos/peos.db`, override with
`PEOS_HOME`/`PEOS_DB_PATH`). WAL mode, foreign keys on, 5s busy timeout. `src/storage/sqliteDriver.ts`
is the only module that imports `node:sqlite`.

## FACT — Migrations

Forward-only, transactional, tracked in a `schema_migrations` table (`src/storage/migrations.ts`).
A failing migration rolls back and leaves the schema at the previous version. Current schema
version: 1 (`0001_foundation.ts`).

## FACT — Tables that exist today

- `settings (key TEXT PRIMARY KEY, value_json TEXT, updated_at TEXT)` — typed via zod at read time.
- `audit_log (id TEXT PRIMARY KEY, ts TEXT, actor TEXT CHECK(...), action TEXT, subject TEXT, details_json TEXT)` — append-only, indexed on `ts` and `action`.

## FACT — Entity schemas defined but not yet persisted

Goal, Outcome, Project, Milestone, Task, MemoryEntry, Decision, Evidence (`src/domain/entities.ts`).
Every one extends a `baseEntitySchema` carrying `id`, `createdAt`, `updatedAt`, `provenance`,
`trustLevel`, `sensitivity`, `supersededBy` (spec §17). Tables for these are added by the phase
that first reads/writes them (Phase 2: Goal/Outcome/Project/Milestone/Task; Phase 3: MemoryEntry;
Phase 4: Evidence; Decision alongside whichever phase first needs a decision log) — not built
speculatively, per the anti-scope rule in [[01-product-principles]].

## CONSTRAINT

- Localization-ready structures (no hard-coded locale, timezone-aware timestamps in ISO 8601 UTC) — `isoTimestampSchema` enforces this at the type boundary.
- Every memory/evidence row carries source, timestamp, status, confidence, provenance, superseded-by (spec §17) — enforced by `baseEntitySchema`.
- Export and deletion must be supported from the first schema (spec §50) — `ExperienceApi.exportData()` and `resetData()` exist from Phase 1; export currently covers settings + audit and will cover each entity table as it is added.

## NEXT ACTION (Phase 2)

Add migration `0002_goals` (Goal, Outcome, Project, Milestone, Task tables) and repositories
mirroring `SettingsRepository`/`AuditRepository`'s pattern (prepared statements, zod validation
at the boundary, injectable clock).
