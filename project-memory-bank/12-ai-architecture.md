# 12 — AI Architecture

Status: ACTIVE (offline boundary shipped; no provider wired yet)
Last updated: 2026-09-22 (Phase 1)

## FACT — What Phase 1 built

`AiGateway` (`src/ai/aiProvider.ts`) is the single chokepoint for every model call: it checks
`AiPolicy` (`mode: offline|external`, `maxExternalSensitivity`) before invoking a provider, and
audits every allow/deny/success/failure via `AuditRepository`. `checkPolicy` denies all
`external` providers outright when `mode` is `offline` (the shipped default), and otherwise
denies any request whose `Sensitivity` exceeds the configured ceiling. The only provider wired
is `noopProvider` (`external: false`), which always returns `ADAPTER_UNAVAILABLE` — there is no
external AI call anywhere in this repo yet.

## FACT

- No AI provider integration exists in this repo.
- ECC's pipeline is deterministic (rule-based task classification, keyword retrieval, static trust rules) and makes no LLM calls. EEP's "agent alone" baseline is likewise simulated, not a live model.
- The skills platform's agent workflows assume an external agent (e.g. Claude Code) reads `SKILL.md` and executes the workflow.

## CONSTRAINT (spec §50, §56, §66)

- No sensitive engineering context leaves the local environment without explicit user authorization.
- Significant AI recommendations expose What / Why / Evidence / Confidence / Assumptions / Unknowns. No private chain-of-thought exposure.
- Provider abstraction (AI Gateway → Provider Adapter → Model) only when a second provider is actually needed. Single provider first.

## NEXT ACTION (first phase that needs a live model, e.g. Phase 4 evidence extraction)

Wire a real `AiProvider` (Claude; check current model IDs before implementing) behind the
existing gateway. No gateway changes needed — only a new provider implementation and an
explicit `PEOS_AI_MODE=external` opt-in plus a chosen `maxExternalSensitivity`.

## RISK

Deterministic-first is the sibling repos' proven pattern; adding LLM calls too early would make outputs less testable and less trustworthy. Keep the deterministic path as the fallback.
