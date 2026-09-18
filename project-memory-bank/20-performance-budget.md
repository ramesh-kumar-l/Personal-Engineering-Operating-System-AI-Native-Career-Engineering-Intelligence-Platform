# 20 — Performance Budget

Status: UNKNOWN — to be defined in Phase 1
Last updated: 2026-09-19 (Phase 0)

## CONSTRAINT (spec §62)

Budgets for startup, page load, search, retrieval, API latency, memory, storage, AI operations. Measure before optimizing. Never claim improvement without measurement.

## FACT

ECC does a full repository walk on every call with no caching; ECC's own memory says this is fine at current scale and should be revisited only if measured as a bottleneck. Any latency budget for use case 2 must include that cost.

## NEXT ACTION (Phase 1)

Set initial budgets for the "I have 45 minutes" recommendation and for a context compilation round-trip, with a measurement script.
