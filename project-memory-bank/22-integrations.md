# 22 — Integrations

Status: ACTIVE
Last updated: 2026-09-19 (Phase 0)

## FACT — Sibling repositories consumed via contracts (D-001)

| Repo | Path | Language / version | Contract surface | Invocation |
|---|---|---|---|---|
| Engineering-Context-Compiler | `D:\ClaudeProjects\Engineering-Context-Compiler` | TS/Node ≥20, `ecc@0.1.0` private | CLI `dist/cli/index.js`, MCP `dist/mcp/index.js`, VS Code `.vsix` | `execFile('node', [path, 'context', task, '--path', dir, ...])` |
| Engineering-Evaluation-Platform | `D:\ClaudeProjects\Engineering-Evaluation-Platform-EEP-` | TS/Node ≥20, `eep@0.1.0` private | npm scripts `experiment:run`, `experiment:analyze`, `report:generate`, `dashboard:generate`; report JSON on disk | scripts / read report files |
| agentic_engineering_skills_platform | `D:\ClaudeProjects\agentic_engineering_skills_platform` | Python, pytest only | `skills/<name>/engine/cli.py`, `SKILL.md` per skill | subprocess (optional) |

## RISK — Contract drift

All three are version 0.1.0, private, unpublished. Their CLI flags and JSON shapes have no semver guarantee. Mitigation: this repo validates every inbound payload with its own zod mirror and fails closed with a clear error naming the sibling and expected shape (EEP's proven pattern). Record the sibling commit SHA used for each captured fixture.

## RISK — Path coupling

Sibling locations are absolute paths on one machine. Mitigation: configurable command paths with a documented default; a missing sibling degrades to "context unavailable", never a crash.

## FACT — Future integrations (spec §46–48), all LATER

GitHub (ECC already posts PR context), VS Code (ECC already has an extension), mobile capture. None built here in Phases 0–5.

## NOT DOING

New integrations are added only when they extract useful engineering context or evidence, not because data is available (spec §46).
