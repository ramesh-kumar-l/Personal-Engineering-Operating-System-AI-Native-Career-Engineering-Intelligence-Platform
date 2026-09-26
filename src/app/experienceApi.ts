/**
 * The Experience API (spec §91): the one typed surface every user-facing layer (CLI now,
 * HTTP/UI later) talks to. In-process in Phase 1 (D-005). Nothing below this line is reachable
 * from a surface except through this interface.
 */
import type { CompileRequest } from '../adapters/ecc/eccAdapter.js';
import type { AppConfig } from '../config/config.js';
import type { ContextResult } from '../services/contextService.js';
import type { StatusReport } from '../services/statusService.js';
import type { Result } from '../shared/result.js';
import type { AuditEvent } from '../storage/auditRepository.js';
import type { SettingRecord } from '../storage/settingsRepository.js';

export interface ExportBundle {
  format: 'peos-export';
  formatVersion: 1;
  exportedAt: string;
  appVersion: string;
  schemaVersion: number;
  settings: SettingRecord[];
  audit: AuditEvent[];
}

export interface ExperienceApi {
  readonly config: AppConfig;
  status(): StatusReport;
  compileContext(request: CompileRequest): Promise<Result<ContextResult>>;
  settings: {
    get(key: string): unknown;
    set(key: string, value: unknown): void;
    delete(key: string): boolean;
    list(): SettingRecord[];
  };
  audit: {
    list(limit?: number): AuditEvent[];
  };
  /** Full local data export (spec §50: export must exist from the first schema). */
  exportData(): ExportBundle;
  /** Deletes all local data files. Destructive; surfaces must require explicit confirmation. */
  resetData(): { removed: string[] };
  close(): void;
}
