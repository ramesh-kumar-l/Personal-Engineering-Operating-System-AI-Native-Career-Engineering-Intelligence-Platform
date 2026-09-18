# 23 — Agent Orchestration

Status: ACTIVE (capability exists in a sibling repo; integration LATER, Phase 8)
Last updated: 2026-09-19 (Phase 0)
Source: `D:\ClaudeProjects\agentic_engineering_skills_platform\project-memory-bank\07-current-state.md` (last updated 2026-08-29)

## FACT — Owner

agentic_engineering_skills_platform. 15 skills, 733 tests, all trust status EXPERIMENTAL, zero external users. Pattern: deterministic Python pre-processor + agent-driven checklist workflow in `SKILL.md`. Skills: codebase-intelligence, adversarial-diff-reviewer, acceptance-test-engineer, feature-planner, security-context-guard, root-cause-analyzer, architecture-decision, refactoring-safety, regression-hunter, release-readiness, dependency-supply-chain, engineering-knowledge-capture, context-optimizer, workflow-composer, engineering-memory. Plus a proposed (not adopted) Test Engineering Platform pipeline.

## FACT — Mapping to spec §40 agents

Planner → feature-planner; Reviewer → adversarial-diff-reviewer; Tester → acceptance-test-engineer / test-strategy; Security Auditor → security-context-guard; Architect → architecture-decision; Documentation/Evidence → engineering-knowledge-capture; Evaluation → EEP. Coder, Researcher, Artifact, Interview agents: no existing skill.

## PROPOSAL

Reuse these skills via subprocess when a workflow needs them, sharing this repo's project memory as the common context (spec §40). Do not rebuild them.

## UNKNOWN

Whether a Python runtime is acceptable as a dependency of a TypeScript product. Options: optional integration (default off), or port only the one or two skills actually used. Decide no earlier than Phase 8, with usage evidence.

## RISK

Skills have zero real-world usage outside the author's own sessions and self-authored single-rater evaluations. Treat their outputs as INFERENCE, never FACT.
