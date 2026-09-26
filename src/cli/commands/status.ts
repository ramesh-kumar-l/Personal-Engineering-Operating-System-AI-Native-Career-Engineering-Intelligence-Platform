import { EXIT } from '../exitCodes.js';
import { printJson, type Command } from './types.js';

export const statusCommand: Command = {
  name: 'status',
  summary: 'Show installation health: database, ECC availability, AI mode.',
  usage: 'peos status [--json]',
  async run(ctx) {
    const report = ctx.api.status();
    if (ctx.flags.json) {
      printJson(ctx.io, report);
      return EXIT.OK;
    }
    ctx.io.out(`peos ${report.version}`);
    ctx.io.out(`home:      ${report.homeDir}`);
    ctx.io.out(`database:  ${report.database.path} (schema v${report.database.schemaVersion}${report.database.upToDate ? '' : ', UPGRADE NEEDED'})`);
    ctx.io.out(`ecc:       ${report.ecc.available ? `available at ${report.ecc.cliPath}` : `unavailable (${report.ecc.reason})`}`);
    ctx.io.out(`ai:        ${report.ai.mode} (provider: ${report.ai.provider}, max external sensitivity: ${report.ai.maxExternalSensitivity})`);
    ctx.io.out(`audit:     ${report.audit.events} events`);
    return EXIT.OK;
  },
};

export const initCommand: Command = {
  name: 'init',
  summary: 'Create the local data directory and database, then show status.',
  usage: 'peos init [--home <dir>] [--json]',
  async run(ctx) {
    // createApp already created the database and ran migrations; record the explicit intent.
    ctx.api.settings.set('app.initializedAt', new Date().toISOString());
    if (!ctx.flags.json) ctx.io.out(`Initialised local data at ${ctx.api.config.homeDir}`);
    return statusCommand.run(ctx);
  },
};
