# 21 — Testing Strategy

Status: ACTIVE
Last updated: 2026-09-22 (Phase 1)

## FACT — Adopted in Phase 1

vitest, 63 tests across 12 files, unit tests per module. One gated real-subprocess test
(`eccAdapter.realCli.test.ts`, `describe.skipIf` when no sibling ECC checkout exists) proves
the zod mirror against live output without making every CI run depend on a sibling checkout.
The fixture (`test/fixtures/ecc/package.45fd3d3.json`) is a real package captured from ECC
commit `45fd3d3`, pinned by commit SHA per [[22-integrations]]'s drift mitigation. A dedicated
`test/quality/fileSize.test.ts` enforces the 300-line-per-file modularity rule as a test, not
just a convention. See [[33-test-status]] for current counts.

## FACT — Sibling conventions to adopt (proven across ECC/EEP)

- vitest; unit tests per module plus fixture-repo integration tests; isolated `mkdtemp` temp dirs for anything that writes; no subprocess spawning in tests except one gated real-CLI smoke test (`skipIf` when the sibling checkout is absent).
- Hand-labeled fixture sets with an asserted accuracy floor so heuristics cannot silently regress.
- Doc-consistency tests that keep skill/CLI documentation honest.

## CONSTRAINT (spec §59–60)

Meaningful coverage over count. AI features tested against correct, incorrect, ambiguous, missing, conflicting, stale, and malicious inputs, prompt injection, hallucination, and tool failure. Regression datasets where practical.

## NEXT ACTION (Phase 2)

Add fixture-based tests for Goal/Task repositories once migration `0002_goals` exists, following
the same prepared-statement + zod-at-the-boundary + injectable-clock pattern as
`settingsRepository`/`auditRepository`.
