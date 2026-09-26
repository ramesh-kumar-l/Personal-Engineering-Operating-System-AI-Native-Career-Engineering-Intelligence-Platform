# 29 — Decision Journal

Status: ACTIVE
Last updated: 2026-09-19 (Phase 0)

Format per spec §20. Only entries marked DECISION are human-approved. PROPOSAL entries await approval and must not be treated as decided.

---

## D-001 — Consume sibling repositories via published contracts (DECISION)

- **Date:** 2026-09-19 · **Phase:** 0 · **Status:** DECIDED by user
- **Context:** This repo is greenfield. Three active sibling repos under `D:\ClaudeProjects\` already implement spec modules: Engineering-Context-Compiler (context compiler, trust, per-repo memory, VS Code, GitHub), Engineering-Evaluation-Platform (evaluation, metrics, evidence schemas), agentic_engineering_skills_platform (15 agent skills).
- **Constraints:** Spec §12 (preserve existing code), §92 (existing stack), §63 (no dependency sprawl), §11 (token efficiency).
- **Alternatives:** (a) consume via CLI/MCP/report contracts; (b) greenfield, ignore siblings; (c) consolidate into a monorepo under `packages/`.
- **Chosen:** (a).
- **Reason:** Zero rewrite of ~1,200 passing tests' worth of capability; siblings keep their own histories and CI; EEP already proves the pattern by consuming ECC through `execFile` plus an independent zod schema mirror.
- **Tradeoffs:** Cross-repo contract drift is unmanaged (all siblings are 0.1.0, private, unpublished). Subprocess overhead per call. Python skills would add a second runtime.
- **Risk:** R-02, R-03, R-04 in [[31-known-risks]].
- **Evidence:** User selected "Consume via contracts (Recommended)" in the Phase 0 planning question, 2026-09-19.

---

## D-002 — Stack: TypeScript on Node, ESM, zod, vitest, eslint (DECISION)

- **Date:** 2026-09-19 (proposed) → 2026-09-22 (decided) · **Phase:** 1 · **Status:** DECIDED
- **Context:** No stack chosen. Both TS siblings share exactly this stack.
- **Alternatives:** Python (matches skills platform); mixed.
- **Chosen:** TypeScript/Node ≥22.13, ESM, zod v4, vitest, eslint flat config (typescript-eslint, `consistent-type-imports`, `no-console` outside the CLI entry).
- **Reason:** One language across ECC, EEP, and this repo; identical tooling; JSON contracts consumed natively; ECC's small-module convention transfers directly.
- **Tradeoffs:** Python skills become an optional subprocess integration rather than a native one.
- **Risk:** R-04.
- **Evidence:** ECC `package.json` and EEP `package.json` read 2026-09-19; stack scaffolded and verified working (lint/typecheck/test/build/audit all pass) 2026-09-22.

---

## D-003 — Phase 0 produces documentation only (DECISION, per spec)

- **Date:** 2026-09-19 · **Phase:** 0 · **Status:** DECIDED (spec §72: "DO NOT rewrite code. DO NOT implement major features.")
- **Chosen:** Memory bank + baseline report. No `README.md` rewrite (deferred to Phase 1), no `package.json`, no commit unless asked.

---

## D-004 — Local storage: SQLite via `node:sqlite` (DECISION)

- **Date:** 2026-09-22 · **Phase:** 1 · **Status:** DECIDED
- **Context:** Local-first storage needed for settings and audit log (spec §50, §67); more entities arrive in later phases.
- **Alternatives:** `better-sqlite3` (native addon, extra install step); `sql.js` (WASM, slower); a JSON-file store (no transactions, no indexes).
- **Chosen:** Node's built-in `node:sqlite` (`DatabaseSync`), requiring Node ≥22.13. No native addon, no extra dependency, ships with the runtime.
- **Reason:** Zero install friction, transactional (`BEGIN`/`COMMIT`/`ROLLBACK` verified), WAL mode, works synchronously which keeps the storage layer simple.
- **Tradeoffs:** Raises the minimum Node version above ECC/EEP's `>=20`. Async SQLite APIs are not yet stable in Node, so all storage calls are synchronous — acceptable at local, single-user scale.
- **Risk:** None new; single-file module (`src/storage/sqliteDriver.ts`) isolates the dependency so swapping drivers later is contained.
- **Evidence:** `node -e` smoke test confirmed `node:sqlite` works without flags on the installed Node 24 runtime, 2026-09-22.

---

## D-005 — Experience API is in-process, not HTTP, in Phase 1 (DECISION)

- **Date:** 2026-09-22 · **Phase:** 1 · **Status:** DECIDED
- **Context:** Spec §91 requires an Experience API as the single surface every UI talks to; §06-system-architecture left in-process vs HTTP as UNKNOWN.
- **Alternatives:** HTTP server now; in-process function interface now, HTTP added later if a remote/web UI needs it.
- **Chosen:** In-process (`ExperienceApi` TypeScript interface, `createApp()` composition root). The CLI is its only consumer today.
- **Reason:** No UI exists yet to justify a network boundary (spec §92: no infrastructure without a measured need); an HTTP layer can wrap the same interface later without changing callers.
- **Tradeoffs:** A future web UI needs a thin HTTP adapter added on top; not built now.
- **Risk:** None; reversible, additive change later.
- **Evidence:** Golden use cases 1–3 only need local CLI/editor access in Phase 1–5.
