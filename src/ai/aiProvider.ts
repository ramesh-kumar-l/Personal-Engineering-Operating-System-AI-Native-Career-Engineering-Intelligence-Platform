/**
 * The AI boundary (spec §12 AI architecture, §50 privacy). Every model call goes through
 * `AiGateway`, which enforces the data-leaving-the-machine policy and audits each decision.
 * Phase 1 ships the boundary and the offline provider only; no external provider is wired.
 */
import { isAtMostSensitive, type Sensitivity } from '../domain/primitives.js';
import type { AuditRepository } from '../storage/auditRepository.js';
import { AppError } from '../shared/errors.js';
import { err, type Result } from '../shared/result.js';

export interface AiRequest {
  /** Stable name of the feature making the call, e.g. "evidence.extract". */
  purpose: string;
  prompt: string;
  sensitivity: Sensitivity;
  maxOutputTokens?: number;
}

export interface AiResponse {
  text: string;
  model: string;
  inputTokens?: number;
  outputTokens?: number;
}

export interface AiProvider {
  readonly name: string;
  /** True when the provider sends data off the machine. */
  readonly external: boolean;
  complete(request: AiRequest): Promise<Result<AiResponse>>;
}

export interface AiPolicy {
  mode: 'offline' | 'external';
  maxExternalSensitivity: Sensitivity;
}

export interface AiGateway {
  readonly policy: AiPolicy;
  readonly providerName: string;
  complete(request: AiRequest): Promise<Result<AiResponse>>;
}

export function checkPolicy(policy: AiPolicy, provider: AiProvider, request: AiRequest): AppError | undefined {
  if (!provider.external) return undefined;
  if (policy.mode === 'offline') {
    return new AppError('POLICY_DENIED', 'AI mode is offline; external providers are disabled', { details: { purpose: request.purpose } });
  }
  if (!isAtMostSensitive(request.sensitivity, policy.maxExternalSensitivity)) {
    return new AppError('POLICY_DENIED', `Data classified "${request.sensitivity}" may not leave the machine (limit: ${policy.maxExternalSensitivity})`, {
      details: { purpose: request.purpose, sensitivity: request.sensitivity },
    });
  }
  return undefined;
}

export function createAiGateway(policy: AiPolicy, provider: AiProvider, audit: AuditRepository): AiGateway {
  return {
    policy,
    providerName: provider.name,
    async complete(request) {
      const denial = checkPolicy(policy, provider, request);
      if (denial !== undefined) {
        audit.append({ actor: 'system', action: 'ai.denied', subject: request.purpose, details: { code: denial.code, provider: provider.name } });
        return err(denial);
      }
      const result = await provider.complete(request);
      audit.append({
        actor: 'ai',
        action: result.ok ? 'ai.completed' : 'ai.failed',
        subject: request.purpose,
        details: { provider: provider.name, external: provider.external, sensitivity: request.sensitivity },
      });
      return result;
    },
  };
}
