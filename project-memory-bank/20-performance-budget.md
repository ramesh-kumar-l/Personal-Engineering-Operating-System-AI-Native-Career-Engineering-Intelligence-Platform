# 20 — Performance Budget

Status: ACTIVE (first measurement taken; formal budgets deferred to Phase 2)
Last updated: 2026-09-22 (Phase 1)

## CONSTRAINT (spec §62)

Budgets for startup, page load, search, retrieval, API latency, memory, storage, AI operations. Measure before optimizing. Never claim improvement without measurement.

## FACT

ECC does a full repository walk on every call with no caching; ECC's own memory says this is fine at current scale and should be revisited only if measured as a bottleneck. Any latency budget for use case 2 must include that cost.

## EVIDENCE — First real measurement (2026-09-22)

A `context` call against the ECC repository itself (~200 TypeScript files) with a 1200-token
budget took approximately 11–12 seconds end to end, measured by `ContextService`'s injected
clock and confirmed by manual CLI runs. This is entirely ECC's own repository-walk cost, not
this repo's adapter overhead (the adapter itself only spawns, waits, reads one file, and
validates — sub-millisecond outside the child process). CLI startup + `status` (no ECC call):
well under 100ms observed.

## NEXT ACTION (Phase 2)

Set a formal budget for the "I have N minutes" recommendation (should not itself call ECC, so
target sub-second) now that a real context-compilation baseline (~11s on a mid-size repo)
exists to compare against for use case 2.
