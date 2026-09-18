# 13 — Context Compiler

Status: ACTIVE (capability exists in a sibling repo; integration planned for Phase 5)
Last updated: 2026-09-19 (Phase 0)
Source: `D:\ClaudeProjects\Engineering-Context-Compiler\project-memory-bank\implementation-status.md` (last updated 2026-09-12, Phase 16) — treated as FACT for the contract, ASSUMPTION for anything not re-verified

## FACT — Owner

Engineering-Context-Compiler (ECC). 16/16 phases complete, 191 tests passing, TypeScript/Node ≥20, ESM, dependencies: `@modelcontextprotocol/sdk`, `typescript`, `zod`. Version 0.1.0, private, not published to npm.

## FACT — Pipeline (ECC's, mirrors spec §29)

analyzeRepository → classifyTask → retrieveEvidence (code, test, git, memory) → rankEvidence (relevance × source authority + specificity + outcome feedback) → compileContext (token budget, greedy selection, compression) → attachTrust + detectConflicts → planVerification.

## FACT — Contract surfaces

| Surface | Invocation | Output |
|---|---|---|
| CLI | `ecc context "<task>" [--path <dir>] [--out <file>] [--budget <n>]` (`dist/cli/index.js`) | pretty-JSON `EngineeringContextPackage` |
| CLI memory | `ecc memory --type decision\|incident\|outcome --summary "..." [--signal positive\|negative] [--paths ...]` | appends to `<repo>/.ecc/memory.json` |
| MCP | tool `compile_engineering_context {task, path?, tokenBudget?}` over stdio (`dist/mcp/index.js`) | same package; `{isError:true}` on failure |
| VS Code | command `ecc.compileContext`, setting `ecc.tokenBudget` (default 4000) | webview preview |
| GitHub | `.github/workflows/pr-context.yml` posts a Markdown comment on PRs | — |

Package fields: `task {type, request}`, `repository {name, commit}`, `context.primary[]`, `context.supporting[]` (each `EvidenceItem` with `source`, `path`/`identifier`, `relevance`, `provenance`, `trustLevel` ∈ fact/derived/inference/unknown), `conflicts[]`, `verification[]` (first entry is `Risk: <level> (...)`), `unknowns[]`, `excluded[{reason,count}]`, `history[]` (always empty).

## FACT — Known limitations that affect this repo

- Retrieval is exact-keyword overlap; phrasing changes alter both retrieved files and task type. No embeddings.
- Repository analysis supports TypeScript/JavaScript only, syntactic only, no caching.
- Memory is per-target-repo, append-only, keyword-matched, CLI-write-only. No cross-repo memory. This repo's Memory Engine fills that gap.
- Benchmark: 3 tasks against ECC's own repo. Recall 67%→100%, tokens 2833→1053, irrelevant-evidence rate 72%→87% (honestly reported). Not evidence of general performance.
- Risk assessment ignores related incident memory (documented gap in ECC's golden example 1).

## DECISION (D-001)

Consume ECC via CLI/MCP. Do not re-implement any of the pipeline here.

## NEXT ACTION (Phase 5, after Phases 1–4)

Build `EccAdapter` in this repo: `execFile` with array args, configurable command path, independent zod mirror of the package schema, validate before trust, never throw across the boundary. Then layer personal memory, goals, and decisions from this repo onto ECC's package to produce the golden-use-case-2 output. Track tokens before/after, compression ratio, latency, corrections (spec §29).
