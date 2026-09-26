# 31 — Known Risks

Status: ACTIVE
Last updated: 2026-09-22 (Phase 1)

| ID | Risk | Likelihood | Impact | Mitigation | Owner |
|---|---|---|---|---|---|
| R-01 | **Scope explosion / attention fragmentation.** The spec names ~25 modules. `D:\ClaudeProjects\PROJECTS.md` (2026-09-18) lists ~70 projects, at least 13 overlapping this thesis, almost all Paused. This repo is roughly the eighth attempt at a slice of it. Spec §88 applies. | High (historical pattern) | Critical | Golden use cases only through Phase 5; MVP exit criterion in [[28-roadmap]]; [[30-not-doing]]; the creator must use it daily before broadening. | User |
| R-02 | Rebuilding what ECC/EEP already do. | Medium | High | D-001; every new module checks [[13-context-compiler]] / [[16-evaluation-model]] first. | Claude + user |
| R-03 | Contract drift: siblings are 0.1.0, private, unpublished; no semver. | High | Medium | zod mirrors validate every payload; fail closed with a named error; pin sibling commit SHA in fixtures. Mitigated in Phase 1: `src/adapters/ecc/eccPackageSchema.ts` mirrors ECC's contract, fixture pinned to commit `45fd3d3`, real-CLI test re-verifies against the live binary. | Claude |
| R-04 | Polyglot cost if Python skills become a hard dependency. | Medium | Medium | Optional, default-off integration; decide at Phase 8 with usage data. | User |
| R-05 | Stale sibling memory. EEP's `18-current-state.md` says Phase 6 / 130 tests; its index says Phase 10 / 299. Sibling memory banks are ASSUMPTION until re-verified against the repo. | High | Low–Medium | Re-verify a sibling's state before each integration phase; record verification date. | Claude |
| R-06 | Zero external validation. No design partners recruited for any sibling or this repo; all evaluations are self-authored, single-rater. | High | High (for product, not for Phase 1–5 build) | Creator-as-first-user validation before Phase 13; recruit 10–30 design partners only after the MVP exit criterion. | User |
| R-07 | Deterministic-vs-LLM tension. Siblings are deterministic and testable; this product's recommendations ("what should I work on") tempt early LLM use that is hard to test and easy to fake. | Medium | Medium | Deterministic ranking first with explicit WHY; LLM only where evidence shows it beats the rule-based path; regression datasets (spec §60). | Claude |
| R-08 | Privacy: personal goals, career data, and possibly employer code context in one store. | Medium | High | Local-first, data classification before first external AI call ([[18-privacy-model]]). | Claude + user |
