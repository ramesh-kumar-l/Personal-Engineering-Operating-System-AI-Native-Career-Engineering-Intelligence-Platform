/**
 * Offline provider: the default in Phase 1. It never produces text, so every feature must
 * have a deterministic path that works without a model (spec §12 risk note).
 */
import { AppError } from '../shared/errors.js';
import { err } from '../shared/result.js';
import type { AiProvider } from './aiProvider.js';

export const noopProvider: AiProvider = {
  name: 'none',
  external: false,
  async complete(request) {
    return err(new AppError('ADAPTER_UNAVAILABLE', 'No AI provider is configured (offline mode)', { details: { purpose: request.purpose } }));
  },
};
