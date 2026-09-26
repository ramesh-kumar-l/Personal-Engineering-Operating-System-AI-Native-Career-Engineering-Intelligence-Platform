# 28 — Roadmap

Status: ACTIVE (PROPOSAL until each phase is individually approved)
Last updated: 2026-09-19 (Phase 0)

The spec's default 15-phase roadmap (§71) is adapted below. The actual next phase is always determined from [[27-current-state]], and every phase ends with a phase report and a STOP (spec §73–74).

| Phase | Scope | Bucket | Tag | Status |
|---|---|---|---|---|
| 0 | Baseline + memory bank | NOW | REQUIRED | COMPLETE 2026-09-19 |
| 1 | Product foundation: decide D-002 stack + local storage; repo scaffold; test/lint/CI; minimal Experience API; README + docs skeleton; security/privacy baseline; zod mirror of ECC's package schema + adapter smoke test | NOW | REQUIRED | COMPLETE 2026-09-22 |
| 2 | Goal + Execution Intelligence: Goal→Outcome→Project→Milestone→Task; "I have N minutes" → NOW/NEXT/LATER/WHY/EXPECTED OUTCOME (golden use case 1) | NOW | REQUIRED | awaiting approval |
| 3 | Engineering Memory (cross-repo, personal): memory types, provenance, freshness, supersession, deterministic retrieval | NEXT | REQUIRED | — |
| 4 | Engineering Work → Evidence: Problem/Action/Decision/Impact capture, evidence categories, Staff signal gaps (golden use case 3) | NEXT | REQUIRED | — |
| 5 | Context Compiler integration: ECC adapter + personal memory/goals/decisions merged into minimum sufficient context, with before/after token tracking (golden use case 2) | NEXT | REQUIRED | — |
| 6 | Interview Intelligence (smallest slice feeding use case 1) | LATER | IMPORTANT | — |
| 7 | Artifact Factory (evidence-backed ADR / interview story first) | LATER | IMPORTANT | — |
| 8 | AI Agent Orchestration (reuse skills platform; decide the Python question) | LATER | NICE_TO_HAVE | — |
| 9 | Evaluation + Trust (EEP adapter, trust engine, leverage ledger) | LATER | IMPORTANT | — |
| 10 | GitHub + VS Code (via ECC's existing surfaces) | LATER | NICE_TO_HAVE | — |
| 11 | Premium UX + Accessibility | LATER | IMPORTANT | — |
| 12 | Security + Reliability + Performance hardening | LATER | REQUIRED before 13 | — |
| 13 | Public Beta (design partners, spec §81) | LATER | — | — |
| 14 | Team Intelligence | ARCHIVE until Layer 1 validated | — | — |
| 15 | Enterprise Platform | ARCHIVE until Layer 1 validated | — | — |

## Rationale for the order

Phases 2, 4, and 5 are the three golden use cases and together form the MVP. Memory (3) sits between them because evidence (4) and context (5) both read from it. Phase 5 comes last of the three because ECC already covers the code half of use case 2; the remaining value is the personal layer built in 2–4.

## Exit criterion for the MVP (after Phase 5)

The creator uses all three use cases in real daily work for at least two weeks and can point to measured outcomes (spec §80), before any LATER phase starts.
