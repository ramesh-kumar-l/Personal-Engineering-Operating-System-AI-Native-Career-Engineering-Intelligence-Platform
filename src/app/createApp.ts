/**
 * Composition root. Wires config → storage → adapters → services → Experience API.
 * All external effects (process spawning, clock) are injectable for tests.
 */
import { existsSync, rmSync } from 'node:fs';
import { z } from 'zod';
import { createEccAdapter, type Invoker } from '../adapters/ecc/eccAdapter.js';
import { createAiGateway } from '../ai/aiProvider.js';
import { noopProvider } from '../ai/noopProvider.js';
import type { AppConfig } from '../config/config.js';
import { eccCliCandidates, type EnvMap } from '../config/paths.js';
import { createLogger, type Logger } from '../observability/logger.js';
import { createContextService } from '../services/contextService.js';
import { createStatusService } from '../services/statusService.js';
import { createAuditRepository } from '../storage/auditRepository.js';
import { runMigrations } from '../storage/migrations.js';
import { allMigrations } from '../storage/migrations/index.js';
import { createSettingsRepository } from '../storage/settingsRepository.js';
import { IN_MEMORY, openDatabase } from '../storage/sqliteDriver.js';
import type { ExperienceApi } from './experienceApi.js';

export const APP_VERSION = '0.1.0';
export const ECC_CLI_SETTING = 'ecc.cliPath';

export interface AppDeps {
  env?: EnvMap;
  cwd?: string;
  logger?: Logger;
  invoker?: Invoker;
  clock?: () => number;
}

export function createApp(config: AppConfig, deps: AppDeps = {}): ExperienceApi {
  const logger = deps.logger ?? createLogger({ level: config.logLevel });
  const clock = deps.clock ?? Date.now;
  const env = deps.env ?? {};
  const cwd = deps.cwd ?? process.cwd();

  const db = openDatabase(config.databasePath);
  const migration = runMigrations(db, allMigrations, clock);
  if (migration.applied.length > 0) logger.info('storage.migrated', { applied: migration.applied });

  const settings = createSettingsRepository(db, clock);
  const audit = createAuditRepository(db, clock);

  const eccSetting = settings.get(ECC_CLI_SETTING, z.string());
  const candidates = config.ecc.cliPath !== undefined
    ? [config.ecc.cliPath]
    : eccCliCandidates(env, cwd, eccSetting.ok ? eccSetting.value : undefined);
  const ecc = createEccAdapter({
    candidates,
    timeoutMs: config.ecc.timeoutMs,
    logger,
    ...(deps.invoker === undefined ? {} : { invoker: deps.invoker }),
  });

  const ai = createAiGateway({ mode: config.ai.mode, maxExternalSensitivity: config.ai.maxExternalSensitivity }, noopProvider, audit);
  const expectedSchemaVersion = allMigrations[allMigrations.length - 1]?.id ?? 0;
  const status = createStatusService({ version: APP_VERSION, config, db, expectedSchemaVersion, ecc, ai, audit });
  const context = createContextService({ ecc, audit, logger, defaultBudget: config.ecc.defaultBudget });

  return {
    config,
    status: () => status.report(),
    compileContext: (request) => context.compile(request),
    settings: {
      get: (key) => settings.getRaw(key),
      set: (key, value) => {
        settings.set(key, value);
        audit.append({ actor: 'user', action: 'settings.set', subject: key });
      },
      delete: (key) => {
        const removed = settings.delete(key);
        if (removed) audit.append({ actor: 'user', action: 'settings.delete', subject: key });
        return removed;
      },
      list: () => settings.list(),
    },
    audit: { list: (limit) => audit.list(limit === undefined ? {} : { limit }) },
    exportData: () => {
      audit.append({ actor: 'user', action: 'data.export' });
      return {
        format: 'peos-export',
        formatVersion: 1,
        exportedAt: new Date(clock()).toISOString(),
        appVersion: APP_VERSION,
        schemaVersion: migration.currentVersion,
        settings: settings.list(),
        audit: audit.list({ limit: 1000 }),
      };
    },
    resetData: () => {
      db.close();
      const removed: string[] = [];
      if (config.databasePath === IN_MEMORY) return { removed };
      for (const suffix of ['', '-wal', '-shm']) {
        const file = `${config.databasePath}${suffix}`;
        if (existsSync(file)) {
          rmSync(file, { force: true });
          removed.push(file);
        }
      }
      logger.warn('data.reset', { removed });
      return { removed };
    },
    close: () => db.close(),
  };
}
