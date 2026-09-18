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

## D-002 — Stack: TypeScript on Node, ESM, zod, vitest, eslint (PROPOSAL)

- **Date:** 2026-09-19 · **Phase:** 0 · **Status:** PROPOSAL — to be decided at the start of Phase 1
- **Context:** No stack chosen. Both TS siblings share exactly this stack.
- **Alternatives:** Python (matches skills platform); mixed.
- **Proposed:** TypeScript/Node ≥20, ESM, zod, vitest, eslint flat config; local store SQLite (`node:sqlite` if Node 22+ is acceptable, else one maintained driver); UI decided after `/frontend-design`, React/Vite as default candidate.
- **Reason:** One language across ECC, EEP, and this repo; identical tooling; JSON contracts consumed natively; ECC's small-module convention transfers directly.
- **Tradeoffs:** Python skills become an optional subprocess integration rather than a native one.
- **Risk:** R-04.
- **Evidence:** ECC `package.json` and EEP `package.json` read 2026-09-19.

---

## D-003 — Phase 0 produces documentation only (DECISION, per spec)

- **Date:** 2026-09-19 · **Phase:** 0 · **Status:** DECIDED (spec §72: "DO NOT rewrite code. DO NOT implement major features.")
- **Chosen:** Memory bank + baseline report. No `README.md` rewrite (deferred to Phase 1), no `package.json`, no commit unless asked.
