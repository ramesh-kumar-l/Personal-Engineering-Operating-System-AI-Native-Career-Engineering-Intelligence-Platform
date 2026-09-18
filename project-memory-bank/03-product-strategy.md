# 03 — Product Strategy

Status: ACTIVE
Last updated: 2026-09-19 (Phase 0)
Source: Master system prompt sections 4, 79–90

## DECISION — Wedge

Layer 1, the Personal Engineering OS, is the first product. Layers 2 and 3 are not built until Layer 1 shows repeated value for the creator and a small set of design partners. (Spec §4; confirmed by the reuse decision D-001 in [[29-decisions]], which makes Layer 2's context/evaluation capabilities available via sibling repos rather than rebuilt here.)

## FACT — The three golden use cases define the MVP (spec §90)

### Use case 1 — What should I work on?
Input: goals, available time, current work, deadlines, interview gaps.
Output: NOW / NEXT / LATER / WHY / EXPECTED OUTCOME. One high-leverage recommendation over twenty choices.

### Use case 2 — Give my AI agent the right context
Input: an engineering task.
Output: relevant code, architecture, decisions, constraints, history, tests, known risks, minimum sufficient context.
FACT: the code-context half of this is already implemented by Engineering-Context-Compiler (see [[13-context-compiler]]); this repo adds personal memory, goals, and decisions on top.

### Use case 3 — Turn work into evidence
Input: today's engineering work.
Output: Problem, Action, Decision, Impact, Evidence, Engineering Signal, Potential Artifact, Interview Story.

## FACT — Validation approach (spec §80–82)

Measure usage (activation, repeat use, weekly retention), outcomes (time saved, less context switching, less rework, better AI task success), quality (retrieval precision, context sufficiency, user corrections), and product signals (retention, recommendation, willingness to pay). Opinions alone do not validate.

First design partners: roughly 10–30 senior/Staff/AI engineers who use AI coding agents. ASSUMPTION: none recruited yet (see [[31-known-risks]] R-06).

## FACT — Distribution order (spec §83)

GitHub → VS Code → technical writing → AI developer communities → engineering communities → direct design partners → open-source components → team adoption.

## FACT — Career compounding (spec §86)

One engineering activity should yield multiple durable assets: decision → implementation → benchmark → evidence → article → interview story → resume evidence.

## PROPOSAL — Moat

Engineering context + memory + decision history + evidence + evaluation + trust + workflow integration, accumulating into an Engineering Intelligence Graph. Not raw model generation.

## CONSTRAINT

The creator's actual workflow must improve before the product is broadened (spec §87).
