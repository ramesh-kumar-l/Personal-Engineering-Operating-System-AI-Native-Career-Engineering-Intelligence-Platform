# 27 — Current State

Status: ACTIVE — the highest-priority context file. Read this first.
Last updated: 2026-09-22 (Phase 1 complete)

## What exists?

- `README.md` (usage + status), `LICENSE` (Apache-2.0).
- `project-memory-bank/` (this directory, 36 files).
- A TypeScript/Node ≥22.13 ESM package (`peos`) with a working local-first foundation:
  - `src/shared/` — `Result<T,E>` and `AppError` (stable `ErrorCode` union).
  - `src/observability/` — structured JSON-lines `Logger` with secret redaction; `measure`/`measureSync` timing helpers.
  - `src/domain/` — primitives (`Id`, `IsoTimestamp`, `TrustLevel`, `Sensitivity`, `Provenance`) and the Phase 1–2 entity schemas (Goal, Outcome, Project, Milestone, Task, MemoryEntry, Decision, Evidence) — schemas only, no tables yet except settings/audit.
  - `src/config/` — path resolution (`PEOS_HOME`, `PEOS_DB_PATH`, `PEOS_ECC_CLI`) and validated `AppConfig` (zod, fails closed with `CONFIG_INVALID`).
  - `src/storage/` — the only module touching `node:sqlite` (`sqliteDriver.ts`); forward-only transactional migration runner; migration `0001_foundation` (tables `settings`, `audit_log`); `SettingsRepository`, `AuditRepository`.
  - `src/adapters/ecc/` — zod mirror of ECC's `EngineeringContextPackage` (verified against a real package captured from ECC commit `45fd3d3`, fixture at `test/fixtures/ecc/package.45fd3d3.json`); `EccAdapter` over `execFile` with array args, timeout, temp-dir isolation, probe-based discovery, typed failure classification (`ADAPTER_UNAVAILABLE` / `ADAPTER_TIMEOUT` / `ADAPTER_FAILED` / `CONTRACT_VIOLATION`).
  - `src/ai/` — the AI boundary: `AiGateway` enforces offline/external mode and a sensitivity ceiling before any provider runs, audits every decision; `noopProvider` is the only provider wired (offline default).
  - `src/services/` — `StatusService`, `ContextService` (compiles via ECC, measures duration, audits, returns metrics).
  - `src/app/` — `ExperienceApi` interface + `createApp` composition root (spec §91; in-process, D-005).
  - `src/cli/` — `peos init|status|context|config|audit|export|reset`, stable exit codes, `--json` on every command.
- CI (`\.github/workflows/ci.yml`): lint, typecheck, test, build, `npm audit --audit-level=high`.
- Every `src/**/*.ts` file is under 300 lines (largest: 128) — enforced by `test/quality/fileSize.test.ts`.

## What works?

- `npm run check` (lint + typecheck + test): 63/63 tests pass, 0 lint errors, 0 type errors.
- `npm run build` succeeds; `node dist/cli/main.js` runs end-to-end against the real ECC sibling checkout (verified manually 2026-09-22: `context` returned 8 primary / 18 supporting items in ~11s at a 1200-token budget).
- `npm audit --audit-level=high`: 0 vulnerabilities.
- Local data (`~/.peos/peos.db` by default) is created, migrated, exported, and destroyed (`reset --yes`) correctly.
- The gated real-CLI adapter test (`eccAdapter.realCli.test.ts`, `skipIf` when no sibling checkout) passes against the live ECC binary.

## What is incomplete?

Everything past Phase 1: Goal/Execution engine (Phase 2), cross-repo personal memory (Phase 3),
evidence capture (Phase 4), personal-layer context merging on top of the raw ECC package
(Phase 5), and everything LATER. See [[28-roadmap]].

## What changed recently?

Phase 1 (2026-09-22): stack decided (D-002 → DECIDED), repo scaffolded, storage layer with
migrations, ECC adapter + zod mirror + real-CLI smoke test, AI boundary (offline-only),
Experience API + CLI, CI, README rewritten, security/privacy/observability/performance
baselines recorded.

## What is broken?

Nothing known. `context` compilation against a real ~200-file TypeScript repo takes ~11s
(ECC's own full-repo walk, no caching — see [[20-performance-budget]]); this is inherited
latency, not a bug in this repo.

## What tests exist?

63 tests across 12 files (unit tests per module + one gated real-subprocess smoke test). See [[33-test-status]].

## What are known limitations?

See [[32-known-limitations]]. Unchanged from Phase 0, plus: this repo has no entity tables yet
beyond `settings`/`audit_log` — Goal/Task/Memory/Decision/Evidence are schemas only until the
phase that needs them adds storage (deliberate, per [[01-product-principles]] anti-scope rule).

## What is the current phase?

Phase 1 — Product Foundation. COMPLETE pending user review.

## What is the next approved task?

None. Phase 2 (Goal + Execution Intelligence) requires explicit user approval.

## Key context for any new session

1. Read this file, then [[99-session-handoff]], then [[29-decisions]] and [[30-not-doing]].
2. Sibling repos are consumed via contracts, never copied ([[06-system-architecture]], [[22-integrations]]).
3. Strict modularity: every `src/**/*.ts` file must stay under 300 lines (enforced by a test).
4. The overlapping-projects risk in [[31-known-risks]] R-01 is still the single biggest threat.
