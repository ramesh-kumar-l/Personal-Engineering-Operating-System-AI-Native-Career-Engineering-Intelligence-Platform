# 09 — API Contracts

Status: ACTIVE (Experience API + CLI shipped; HTTP surface not built — D-005)
Last updated: 2026-09-22 (Phase 1)

## FACT — Contracts this repo consumes (external, owned by siblings)

ECC's `EngineeringContextPackage` is mirrored in `src/adapters/ecc/eccPackageSchema.ts` and
validated on every call (see [[22-integrations]]). EEP's report JSON has no adapter yet
(Phase 9). Every inbound payload from a sibling fails closed with `CONTRACT_VIOLATION` rather
than propagating an unvalidated shape.

## FACT — Contracts this repo exposes

`ExperienceApi` (`src/app/experienceApi.ts`), in-process (D-005): `status()`, `compileContext()`,
`settings.{get,set,delete,list}`, `audit.list()`, `exportData()`, `resetData()`. The CLI
(`peos init|status|context|config|audit|export|reset`) is its only consumer; every command
supports `--json` for machine-readable output and returns a stable exit code
(`src/cli/exitCodes.ts`: 0 ok, 1 failure, 2 usage, 3 adapter unavailable/timeout, 4 contract
violation, 5 policy denied).

## CONSTRAINT (spec §64) — status

Explicit ✓ (typed interface). Validated ✓ (zod at every boundary: config, settings, ECC package,
entities). Versioned: not yet needed (single in-process consumer). Documented: README + this
file. Observable ✓ (structured logs + audit log). Secure: baseline only, see [[17-security-model]].
Backward-compatible: not yet promised — no external consumer exists.

## NEXT ACTION (Phase 2)

Add Goal/Task methods to `ExperienceApi` following the same pattern (service → validated
repository → audited mutation) as `compileContext`.
