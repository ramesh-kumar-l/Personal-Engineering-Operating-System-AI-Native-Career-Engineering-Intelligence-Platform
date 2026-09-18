# 15 — Trust Model

Status: UNKNOWN — to be defined in Phase 3 (data) and Phase 9 (evaluation/trust engine)
Last updated: 2026-09-19 (Phase 0)

## FACT — Existing trust vocabularies to align with

- ECC: `trustLevel` ∈ fact / derived / inference / unknown, assigned by a single deterministic rule table per evidence source; conflicts surfaced, never auto-resolved; provenance mandatory.
- Spec §55 UI states: Verified / Evidence-backed / User-authored / AI-generated / Inferred / Uncertain.
- Spec §16 memory types: FACT / EVIDENCE / DECISION / ASSUMPTION / INFERENCE / PROPOSAL / UNKNOWN.

## CONSTRAINT (spec §30, §57, §94)

Important AI output exposes Recommendation, Evidence, Confidence, Assumptions, Unknowns, Conflicting Evidence, Freshness. Confidence is never fabricated. "Insufficient evidence" is a valid result.

## NEXT ACTION (Phase 3)

Define one trust taxonomy for this repo that maps cleanly onto ECC's four levels and the six UI states, so that a value never has to be guessed at a boundary.
