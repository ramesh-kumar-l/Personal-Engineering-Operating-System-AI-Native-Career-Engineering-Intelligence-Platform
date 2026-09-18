# 01 — Product Principles

Status: ACTIVE
Last updated: 2026-09-19 (Phase 0)
Source: Master system prompt sections 7–17, 55–58, 63, 92–94

## CONSTRAINT — Outcome-first rule

Every meaningful feature must answer: What problem? Who benefits? What behavior changes? What measurable outcome improves? Why now? Why can't an existing feature solve it? What evidence validates it? If unanswerable, defer.

## CONSTRAINT — Anti-scope-explosion

Every new idea is classified NOW / NEXT / LATER / ARCHIVE and tagged BLOCKER / REQUIRED / IMPORTANT / NICE_TO_HAVE / EXPERIMENTAL. New ideas go to the backlog, never straight to implementation. Deliberate exclusions live in [[30-not-doing]].

## CONSTRAINT — Memory-first development

Read order for every task: Memory → Documentation → Contracts → Relevant code. Code is inspected only when memory and contracts are insufficient, and then only the smallest relevant files.

## CONSTRAINT — Existing code preservation

Treat any existing implementation as production code. Build on top; no rewrites for style, no unrelated refactors, no casual deletion, no unjustified dependency swaps. This also applies to sibling repositories consumed via contracts (see [[06-system-architecture]]).

## CONSTRAINT — Memory integrity

Memory statements carry one of: FACT, EVIDENCE, DECISION, ASSUMPTION, INFERENCE, PROPOSAL, UNKNOWN. Never silently promote ASSUMPTION→FACT, INFERENCE→FACT, PROPOSAL→DECISION. Superseded memories are marked superseded, not overwritten.

## CONSTRAINT — Trust and no fake intelligence

- Important AI output exposes: Recommendation, Evidence, Confidence, Assumptions, Unknowns, Conflicting Evidence, Freshness.
- "Insufficient evidence" and "Unknown" are valid results.
- Never fabricate productivity scores, confidence, achievements, impact, benchmarks, evidence, career readiness, or user history.
- Prefer "I don't know" over a confident unsupported answer; "here is the evidence" over "trust the AI"; "here are the tradeoffs" over "this is correct".
- UI must visually distinguish Verified / Evidence-backed / User-authored / AI-generated / Inferred / Uncertain, and never make uncertain output look authoritative.

## CONSTRAINT — Metric integrity

Every important metric defines Name, Definition, Source, Calculation, Time Window, Limitations.

## CONSTRAINT — Dependencies and architecture

- Before adding a dependency: can the existing stack solve it safely? New dependencies must be justified, compatible, maintained, minimal.
- Prefer simple architecture that works over complex architecture that could theoretically scale.
- Do not introduce microservices, Kubernetes, graph databases, multiple vector databases, multiple AI providers, or event buses without requirements evidence.

## CONSTRAINT — Priority model (decision aid, not a score)

(User Value × Strategic Relevance × Evidence Potential × Learning Value × Frequency of Use) ÷ (Implementation Cost × Risk × Complexity)

## CONSTRAINT — Phase gates

After every phase: implementation → tests → regression → security review → UX review → performance review → documentation → memory update → phase report → STOP. Never auto-progress to the next phase.

## CONSTRAINT — The OS must not become the career goal (spec §88)

If building this system reduces real engineering outcomes, interview readiness, judgment, or career evidence, stop building and fix the strategy. See [[31-known-risks]] R-01.
