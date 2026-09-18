# 17 — Security Model

Status: UNKNOWN — baseline in Phase 1, full model in Phase 12
Last updated: 2026-09-19 (Phase 0)

## FACT

No code, no attack surface yet. Sibling precedents worth reusing as patterns: ECC and EEP shell out with `execFile` and array arguments (no shell interpolation); the skills platform's `security-context-guard` does secret/PII/sensitive-path classification with advisory-only verdicts; the skills platform's hardening pass added path containment, bounded subprocess capture, and resource caps.

## CONSTRAINT (spec §51)

Authentication, authorization, input validation, secret detection, PII detection, prompt-injection defenses, auditability, least privilege, secure integrations, dependency scanning. Integrations and AI agents are inside the security boundary.

## NEXT ACTION (Phase 1)

Baseline: input validation via zod at every boundary, `execFile` only for subprocesses, no secrets in the repo, `npm audit` in CI, threat notes for each adapter.
