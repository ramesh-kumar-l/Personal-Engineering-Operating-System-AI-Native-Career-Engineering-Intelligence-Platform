# 17 — Security Model

Status: ACTIVE (baseline shipped in Phase 1; full model — auth, sandboxing — in Phase 12)
Last updated: 2026-09-22 (Phase 1)

## FACT — Baseline shipped in Phase 1

- Input validation: every external boundary (config, settings, ECC package, entity schemas) is parsed with zod and fails closed (`CONFIG_INVALID`/`INVALID_INPUT`/`CONTRACT_VIOLATION`), never trusts `any`.
- Subprocess safety: `EccAdapter` uses `execFile` with an argument array (`process.execPath`, `[cliPath, ...args]`) — never a shell string, so the task description cannot be used for shell injection (tested with a task string containing `; rm -rf /`, see `eccAdapter.test.ts`). Bounded output (`maxBuffer` 16 MB), a timeout, `windowsHide`, and a per-call temp directory removed in a `finally` block.
- Secrets: nothing is committed (`.gitignore` excludes `.env*`, `.peos/`, `*.db*`); the logger redacts any field whose key matches `token|secret|password|api[-_]?key|authorization|credential`, recursively, with a depth cap to prevent runaway recursion on hostile input.
- Dependency scanning: `npm audit --audit-level=high` is a CI step and passes with 0 vulnerabilities (2026-09-22).
- Auditability: every settings mutation, AI policy decision, and context compilation is written to the append-only `audit_log` table.
- Least privilege: the AI gateway defaults to `offline` (no external calls possible) and gates any future external provider on an explicit sensitivity ceiling.

## FACT — Not yet built (out of scope until named phases)

Authentication/authorization (Phase 12; single local user in Phase 1–11, no multi-user model).
PII detection and prompt-injection defenses (only relevant once an LLM provider is wired,
Phase 4+). Threat notes per adapter beyond the ECC adapter (added as each adapter is built).

## CONSTRAINT (spec §51)

Authentication, authorization, input validation, secret detection, PII detection, prompt-injection defenses, auditability, least privilege, secure integrations, dependency scanning. Integrations and AI agents are inside the security boundary.

## NEXT ACTION (Phase 2+)

Write a one-paragraph threat note for each new adapter as it is built, following the ECC
adapter's pattern above.
