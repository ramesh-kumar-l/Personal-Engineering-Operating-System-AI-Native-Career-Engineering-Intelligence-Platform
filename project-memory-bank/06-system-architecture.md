# 06 — System Architecture

Status: ACTIVE (integration topology decided; stack proposed, not decided)
Last updated: 2026-09-19 (Phase 0)

## FACT — Current state

No source code exists in this repository. Architecture below is the target, constrained by D-001 in [[29-decisions]].

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

## PROPOSAL (D-002, awaiting Phase 1 approval) — Stack

TypeScript on Node ≥20, ESM, zod for runtime validation, vitest, eslint flat config. Identical to ECC and EEP: one language across all three repos, same tooling, direct JSON contract compatibility. Local-first storage: SQLite (candidate: `node:sqlite` on Node 22+, else one well-maintained driver) — decide with the data model in Phase 1. UI: decide in Phase 1 after `/frontend-design`; React/Vite is the default candidate given the user's other projects.

## CONSTRAINT

- Minimum sufficient context, not maximum (spec §29).
- No graph DB, vector DB, microservices, event bus, Kubernetes, or multi-provider gateway without evidence (spec §92).
- Sibling source is never imported. If a sibling's contract must change, the change is made in that repo, with its own phase gate.
- Every module in this repo stays small (ECC's convention: one concern per file, well under 300 lines) so future tasks read only what they need.

## UNKNOWN

- Whether the Experience API is HTTP, in-process, or both in Phase 1.
- Whether the Python skills platform is acceptable as a runtime dependency (see [[23-agent-orchestration]]).
