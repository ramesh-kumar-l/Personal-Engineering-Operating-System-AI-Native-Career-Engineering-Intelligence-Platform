# Personal Engineering OS

An AI-native, local-first personal engineering and career intelligence platform. It answers
three questions from real engineering work: *what should I work on?*, *how do I give my AI
agent the right context?*, and *how do I turn this work into evidence?*

This repo owns the personal layer (goals, cross-repo memory, evidence, the Experience API) and
consumes existing sibling projects for context compilation and evaluation rather than
reimplementing them. See [`project-memory-bank/`](project-memory-bank/) for the full context —
start with [`27-current-state.md`](project-memory-bank/27-current-state.md).

## Status

Phase 1 (product foundation) complete. Pre-MVP, local use only, no public API stability yet.

## Requirements

- Node.js ≥ 22.13 (uses the built-in `node:sqlite` module)
- Optional: a local checkout of [Engineering-Context-Compiler](../Engineering-Context-Compiler)
  for the `context` command

## Install & build

```sh
npm install
npm run build
```

## CLI

```sh
node dist/cli/main.js init                                  # create local data dir + database
node dist/cli/main.js status --json                          # health check
node dist/cli/main.js context "<task>" --path <repo> --budget 4000
node dist/cli/main.js config set ecc.cliPath /path/to/ecc/dist/cli/index.js
node dist/cli/main.js audit
node dist/cli/main.js export --out backup.json
node dist/cli/main.js reset --yes
```

Run `node dist/cli/main.js --help` for the full command list.

## Development

```sh
npm run check     # lint + typecheck + test
npm test          # vitest
npm run build     # emit dist/
```

All local data lives under `~/.peos` (override with `PEOS_HOME`) and is never committed or
sent anywhere by default; the AI boundary defaults to fully offline (see
[`12-ai-architecture.md`](project-memory-bank/12-ai-architecture.md)).

## License

Apache-2.0
