/**
 * Golden use case 2 foundation: compile engineering context for a task. In Phase 1 this is a
 * validated pass-through to ECC with measurement and audit. Phase 5 layers personal memory,
 * goals and decisions on top of the ECC package.
 */
import type { CompileRequest, EccAdapter } from '../adapters/ecc/eccAdapter.js';
import { summarisePackage, type EccContextPackage } from '../adapters/ecc/eccPackageSchema.js';
import type { Logger } from '../observability/logger.js';
import { measure } from '../observability/timing.js';
import { err, ok, type Result } from '../shared/result.js';
import type { AuditRepository } from '../storage/auditRepository.js';

export interface ContextMetrics {
  durationMs: number;
  primary: number;
  supporting: number;
  excluded: number;
  conflicts: number;
  tokenBudget: number;
}

export interface ContextResult {
  package: EccContextPackage;
  metrics: ContextMetrics;
  /** Where the package came from; "ecc" until personal layering exists. */
  source: 'ecc';
}

export interface ContextService {
  compile(request: CompileRequest): Promise<Result<ContextResult>>;
}

export interface ContextServiceDeps {
  ecc: EccAdapter;
  audit: AuditRepository;
  logger: Logger;
  defaultBudget: number;
}

export function createContextService(deps: ContextServiceDeps): ContextService {
  return {
    async compile(request) {
      const tokenBudget = request.tokenBudget ?? deps.defaultBudget;
      const timed = await measure(() => deps.ecc.compileContext({ ...request, tokenBudget }));
      if (!timed.value.ok) {
        deps.audit.append({
          actor: 'integration',
          action: 'context.compile.failed',
          subject: request.task,
          details: { code: timed.value.error.code, durationMs: timed.durationMs },
        });
        deps.logger.warn('context.compile.failed', { code: timed.value.error.code, durationMs: timed.durationMs });
        return err(timed.value.error);
      }
      const summary = summarisePackage(timed.value.value);
      const metrics: ContextMetrics = { durationMs: timed.durationMs, tokenBudget, ...summary };
      deps.audit.append({
        actor: 'integration',
        action: 'context.compile.succeeded',
        subject: request.task,
        details: { ...metrics, repository: timed.value.value.repository },
      });
      deps.logger.info('context.compile.succeeded', { ...metrics });
      return ok({ package: timed.value.value, metrics, source: 'ecc' });
    },
  };
}
