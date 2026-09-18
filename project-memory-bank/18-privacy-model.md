# 18 — Privacy Model

Status: UNKNOWN — to be defined in Phase 1
Last updated: 2026-09-19 (Phase 0)

## FACT

Engineering information is treated as sensitive (spec §50). The product will hold personal goals, career evidence, decisions, and possibly employer code context.

## CONSTRAINT (spec §50, §67)

Local-first where practical; encryption; explicit provider boundaries; data export; deletion; retention controls; project isolation; secure credentials; audit logs. Nothing sensitive goes to an external AI provider without user authorization. Offline degradation must be graceful.

## NEXT ACTION (Phase 1)

Write the data classification (personal / employer / public) and the rule for what may leave the machine, before the first AI call is implemented.
