/** Public programmatic entry point. Surfaces (CLI, future HTTP/UI) build on this only. */
export { createApp, APP_VERSION } from './app/createApp.js';
export type { ExperienceApi, ExportBundle } from './app/experienceApi.js';
export { loadConfig, appConfigSchema } from './config/config.js';
export type { AppConfig, ConfigOverrides } from './config/config.js';
export type { StatusReport } from './services/statusService.js';
export type { ContextResult, ContextMetrics } from './services/contextService.js';
export type { EccContextPackage, EccEvidenceItem } from './adapters/ecc/eccPackageSchema.js';
export { AppError } from './shared/errors.js';
export type { ErrorCode } from './shared/errors.js';
export type { Result } from './shared/result.js';
export * from './domain/primitives.js';
export * from './domain/entities.js';
