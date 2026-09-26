import { describe, expect, it } from 'vitest';
import { ok } from '../shared/result.js';
import { createAuditRepository } from '../storage/auditRepository.js';
import { runMigrations } from '../storage/migrations.js';
import { allMigrations } from '../storage/migrations/index.js';
import { IN_MEMORY, openDatabase } from '../storage/sqliteDriver.js';
import { checkPolicy, createAiGateway, type AiProvider } from './aiProvider.js';
import { noopProvider } from './noopProvider.js';

const externalProvider: AiProvider = {
  name: 'fake-cloud',
  external: true,
  complete: async () => ok({ text: 'hi', model: 'fake' }),
};

function audit() {
  const db = openDatabase(IN_MEMORY);
  runMigrations(db, allMigrations);
  return createAuditRepository(db);
}

describe('AI policy', () => {
  it('offline mode denies every external provider', () => {
    const denial = checkPolicy({ mode: 'offline', maxExternalSensitivity: 'employer' }, externalProvider, { purpose: 'p', prompt: 'x', sensitivity: 'public' });
    expect(denial?.code).toBe('POLICY_DENIED');
  });

  it('external mode allows only data at or below the sensitivity ceiling', () => {
    const policy = { mode: 'external' as const, maxExternalSensitivity: 'personal' as const };
    expect(checkPolicy(policy, externalProvider, { purpose: 'p', prompt: 'x', sensitivity: 'personal' })).toBeUndefined();
    expect(checkPolicy(policy, externalProvider, { purpose: 'p', prompt: 'x', sensitivity: 'employer' })?.code).toBe('POLICY_DENIED');
  });

  it('local providers are never gated', () => {
    expect(checkPolicy({ mode: 'offline', maxExternalSensitivity: 'public' }, noopProvider, { purpose: 'p', prompt: 'x', sensitivity: 'employer' })).toBeUndefined();
  });
});

describe('AI gateway', () => {
  it('audits denials without calling the provider', async () => {
    const log = audit();
    let called = false;
    const provider: AiProvider = { ...externalProvider, complete: async () => ((called = true), ok({ text: '', model: '' })) };
    const gateway = createAiGateway({ mode: 'offline', maxExternalSensitivity: 'public' }, provider, log);
    const result = await gateway.complete({ purpose: 'evidence.extract', prompt: 'secret', sensitivity: 'employer' });
    expect(result.ok).toBe(false);
    expect(called).toBe(false);
    expect(log.list()[0]?.action).toBe('ai.denied');
  });

  it('audits completions and the noop provider reports unavailable', async () => {
    const log = audit();
    const gateway = createAiGateway({ mode: 'offline', maxExternalSensitivity: 'public' }, noopProvider, log);
    const result = await gateway.complete({ purpose: 'p', prompt: 'x', sensitivity: 'public' });
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.error.code).toBe('ADAPTER_UNAVAILABLE');
    expect(log.list()[0]?.action).toBe('ai.failed');
    const allowed = createAiGateway({ mode: 'external', maxExternalSensitivity: 'public' }, externalProvider, log);
    const success = await allowed.complete({ purpose: 'p', prompt: 'x', sensitivity: 'public' });
    expect(success.ok).toBe(true);
    expect(log.list()[0]?.action).toBe('ai.completed');
  });
});
