# 06 — System Architecture

Status: ACTIVE (integration topology and stack decided; Phase 1 foundation shipped)
Last updated: 2026-09-22 (Phase 1)

## FACT — Current state

Phase 1 foundation shipped: shared/observability/domain/config/storage/adapters/ai/services/app/cli
layers exist as described in [[27-current-state]]. Everything else below is still the target for
later phases, constrained by D-001 in [[29-decisions]].

## DECISION (D-001) — Integration topology

This repo owns the Personal Engineering OS: the Experience API, Goal Engine, Evidence Engine, cross-repo personal Memory Engine, and the user-facing surfaces. Capabilities that already exist in sibling repositories are consumed through their published contracts, never copied, forked, or vendored.

```
                    USER
                     │
        ┌────────────┴────────────┐
       WEB (later)              IDE (via ECC extension, later)
        └────────────┬────────────┘
                     │
              EXPERIENCE API              ← this repo
                     │
   ┌─────────┬───────┴───────┬──────────┐
 Goal      Evidence      Memory       Trust/       ← this repo
 Engine    Engine        Engine       Explain
   │         │             │            │
   └─────────┴──────┬──────┴────────────┘
                    │
        ┌───────────┼──────────────┐
   ECC (context)  EEP (evaluation)  Skills platform (optional)   ← siblings, via contracts
   CLI / MCP      CLI + report JSON  subprocess engine/cli.py
                    │
              Local data layer                                   ← this repo
```

### Sibling contracts (FACTs verified 2026-09-19 from sibling memory banks; see [[22-integrations]])
- Engineering-Context-Compiler: `ecc context "<task>" --path <dir> [--out <file>] [--budget <n>]` emits a schema-valid `EngineeringContextPackage` JSON; `ecc memory --type decision|incident|outcome --summary "..." [--signal positive|negative] [--paths ...]`; MCP tool `compile_engineering_context` over stdio.
- Engineering-Evaluation-Platform: consumes ECC the same way (`execFile`, array args, independent zod mirror of the output schema). Its pattern is the template for this repo's adapters.
- agentic_engineering_skills_platform: Python skills invoked via `skills/<name>/engine/cli.py`.

## DECISION (D-002) — Stack

TypeScript on Node ≥22.13, ESM, zod v4 for runtime validation, vitest, eslint flat config.
Identical to ECC and EEP: one language across all three repos, same tooling, direct JSON
contract compatibility. Local-first storage (D-004): SQLite via `node:sqlite`. UI: still
UNKNOWN, decided when a phase first needs one (React/Vite default candidate; `/frontend-design`
first).

## DECISION (D-005) — Experience API is in-process

`src/app/experienceApi.ts` + `createApp()`. The CLI is its only consumer today; an HTTP layer
can wrap the same interface later without changing callers. See [[09-api-contracts]].

## CONSTRAINT

- Minimum sufficient context, not maximum (spec §29).
- No graph DB, vector DB, microservices, event bus, Kubernetes, or multi-provider gateway without evidence (spec §92).
- Sibling source is never imported. If a sibling's contract must change, the change is made in that repo, with its own phase gate.
- Every module in this repo stays small (ECC's convention: one concern per file, well under 300 lines) — enforced by `test/quality/fileSize.test.ts`, not just convention.

## UNKNOWN

- UI stack (decide when a UI is first needed).
- Whether the Python skills platform is acceptable as a runtime dependency (see [[23-agent-orchestration]]).
