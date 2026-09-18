# 10 — UI Architecture

Status: UNKNOWN — to be defined in Phase 1
Last updated: 2026-09-19 (Phase 0)

## FACT

No UI exists. The first surface may be CLI-only if that is the fastest route to validating use case 1 (a PROPOSAL for Phase 1 to decide).

## CONSTRAINT (spec §22, §53–55)

- Executive Command Center answers "What matters now?" — current goal, objective, today's priority, active project, interview gap, evidence opportunity, blockers, risks, AI recommendation. Avoid excessive dashboards.
- Every significant UI feature goes through `/frontend-design`: Problem → User Flow → IA → Interaction → Visual → Design System → Implementation → Accessibility → Validation.
- Feel: calm engineering command center. Premium, focused, trustworthy, fast, predictable. No gradients-for-effect, no needless animation, no card clutter, no fake AI sophistication.
- Trust UX: Verified / Evidence-backed / User-authored / AI-generated / Inferred / Uncertain are visually distinct.

## PROPOSAL

React + Vite (the user's established front-end stack in other projects). Decide in Phase 1.
