# 09 — API Contracts

Status: UNKNOWN — to be defined in Phase 1
Last updated: 2026-09-19 (Phase 0)

## FACT — Contracts this repo consumes (external, owned by siblings)

See [[22-integrations]] for the ECC CLI/MCP contract and EEP's report JSON. This repo will hold its own zod mirrors of those shapes and validate every inbound payload before trusting it (the pattern EEP uses for ECC).

## FACT — Contracts this repo will expose

None yet. The Experience API (spec §91) is the first. Requirements (spec §64): explicit, validated, versioned where needed, documented, observable, secure, backward-compatible where practical.

## NEXT ACTION (Phase 1)

Define the Experience API surface for use cases 1–3 and the adapter interfaces for ECC and EEP.
