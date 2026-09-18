# 14 — Memory Model

Status: UNKNOWN — to be defined in Phase 3
Last updated: 2026-09-19 (Phase 0)

## FACT

- This repo's `project-memory-bank/` is the project's own long-term memory (this directory). It is markdown, human- and AI-readable, and follows the FACT/DECISION/ASSUMPTION/... labels in [[01-product-principles]].
- ECC provides per-repository engineering memory (`.ecc/memory.json`: decision / incident / outcome entries, keyword retrieval). It does not hold personal, goal, or career memory, and does not span repositories.
- The skills platform's `engineering-memory` skill retrieves from its own memory bank with staleness flags — a useful precedent for staleness handling.

## CONSTRAINT (spec §16–17, §27)

Memory types: FACT, EVIDENCE, DECISION, ASSUMPTION, INFERENCE, PROPOSAL, UNKNOWN. Each entry carries importance, freshness, provenance, confidence, relationships, source, superseded-by.

## PROPOSAL

The product's Memory Engine (Phase 3) stores cross-repo personal engineering memory: project context, architecture, decisions, lessons, bugs, patterns, failure modes, interview knowledge, career evidence. It references ECC's per-repo memory rather than duplicating it.

## NEXT ACTION (Phase 3)

Define the memory schema, retrieval strategy (keyword first, deterministic; embeddings only with measured need), and the supersession workflow.
