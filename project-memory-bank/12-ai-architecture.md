# 12 — AI Architecture

Status: UNKNOWN — to be defined in Phase 1
Last updated: 2026-09-19 (Phase 0)

## FACT

- No AI provider integration exists in this repo.
- ECC's pipeline is deterministic (rule-based task classification, keyword retrieval, static trust rules) and makes no LLM calls. EEP's "agent alone" baseline is likewise simulated, not a live model.
- The skills platform's agent workflows assume an external agent (e.g. Claude Code) reads `SKILL.md` and executes the workflow.

## CONSTRAINT (spec §50, §56, §66)

- No sensitive engineering context leaves the local environment without explicit user authorization.
- Significant AI recommendations expose What / Why / Evidence / Confidence / Assumptions / Unknowns. No private chain-of-thought exposure.
- Provider abstraction (AI Gateway → Provider Adapter → Model) only when a second provider is actually needed. Single provider first.

## PROPOSAL

Phase 1: define a thin, local-first AI boundary interface with an explicit "no external call" mode so every use case degrades gracefully offline. First provider: Claude (default to the latest model IDs; see the claude-api skill before implementing). Decide in Phase 1.

## RISK

Deterministic-first is the sibling repos' proven pattern; adding LLM calls too early would make outputs less testable and less trustworthy. Keep the deterministic path as the fallback.
