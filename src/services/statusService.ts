/**
 * Health report for the local installation. Every field is observed, not assumed: schema
 * version comes from the database, ECC availability from a filesystem probe, AI mode from the
 * validated config. This is the single source for `peos status` and future health endpoints.
 */
import type { EccAdapter, EccProbe } from '../adapters/ecc/eccAdapter.js';
import type { AiGateway } from '../ai/aiProvider.js';
import type { AppConfig } from '../config/config.js';
import type { AuditRepository } from '../storage/auditRepository.js';
import { currentSchemaVersion } from '../storage/migrations.js';
import type { Database } from '../storage/sqliteDriver.js';

export interface StatusReport {
  version: string;
  homeDir: string;
  database: { path: string; schemaVersion: number; expectedSchemaVersion: number; upToDate: boolean };
  ecc: EccProbe & { timeoutMs: number; defaultBudget: number };
  ai: { mode: 'offline' | 'external'; provider: string; maxExternalSensitivity: string };
  audit: { events: number };
}

export interface StatusServiceDeps {
  version: string;
  config: AppConfig;
  db: Database;
  expectedSchemaVersion: number;
  ecc: EccAdapter;
  ai: AiGateway;
  audit: AuditRepository;
}

export interface StatusService {
  report(): StatusReport;
}

export function createStatusService(deps: StatusServiceDeps): StatusService {
  return {
    report() {
      const schemaVersion = currentSchemaVersion(deps.db);
      return {
        version: deps.version,
        homeDir: deps.config.homeDir,
        database: {
          path: deps.config.databasePath,
          schemaVersion,
          expectedSchemaVersion: deps.expectedSchemaVersion,
          upToDate: schemaVersion === deps.expectedSchemaVersion,
        },
        ecc: { ...deps.ecc.probe(), timeoutMs: deps.config.ecc.timeoutMs, defaultBudget: deps.config.ecc.defaultBudget },
        ai: {
          mode: deps.ai.policy.mode,
          provider: deps.ai.providerName,
          maxExternalSensitivity: deps.ai.policy.maxExternalSensitivity,
        },
        audit: { events: deps.audit.count() },
      };
    },
  };
}
