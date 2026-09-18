# 19 — Observability

Status: UNKNOWN — to be defined in Phase 1
Last updated: 2026-09-19 (Phase 0)

## CONSTRAINT (spec §61)

Structured logs, metrics, health checks, error tracking, latency, AI/token usage, evaluation metrics. No infrastructure for appearance.

## FACT — Context-compiler metrics the spec requires (§29)

tokens before, tokens after, compression ratio, retrieval relevance, latency, task success, human corrections. ECC already reports tokens and `excluded` counts per package; the rest must be captured here.

## NEXT ACTION (Phase 1)

Minimal structured logging and a metric definition template (Name, Definition, Source, Calculation, Window, Limitations) per spec §58.
