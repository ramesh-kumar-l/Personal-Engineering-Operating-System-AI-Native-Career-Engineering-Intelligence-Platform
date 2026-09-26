#!/usr/bin/env node
import { runCli } from './runCli.js';

const code = await runCli({
  argv: process.argv.slice(2),
  env: process.env,
  cwd: process.cwd(),
  io: {
    out: (line) => console.log(line),
    err: (line) => console.error(line),
  },
});
process.exitCode = code;
