# 21 — Testing Strategy

Status: UNKNOWN — to be defined in Phase 1
Last updated: 2026-09-19 (Phase 0)

## FACT

No tests exist in this repo. See [[33-test-status]].

## FACT — Sibling conventions to adopt (proven across ECC/EEP)

- vitest; unit tests per module plus fixture-repo integration tests; isolated `mkdtemp` temp dirs for anything that writes; no subprocess spawning in tests except one gated real-CLI smoke test (`skipIf` when the sibling checkout is absent).
- Hand-labeled fixture sets with an asserted accuracy floor so heuristics cannot silently regress.
- Doc-consistency tests that keep skill/CLI documentation honest.

## CONSTRAINT (spec §59–60)

Meaningful coverage over count. AI features tested against correct, incorrect, ambiguous, missing, conflicting, stale, and malicious inputs, prompt injection, hallucination, and tool failure. Regression datasets where practical.

## NEXT ACTION (Phase 1)

Scaffold vitest + a first adapter test that validates a captured real ECC package against this repo's zod mirror.
