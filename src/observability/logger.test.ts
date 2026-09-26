import { describe, expect, it } from 'vitest';
import { createLogger, redact } from './logger.js';
import { measure, measureSync } from './timing.js';

function capture() {
  const lines: string[] = [];
  return { lines, sink: (line: string) => lines.push(line) };
}

describe('logger', () => {
  it('writes one JSON object per line with timestamp, level and message', () => {
    const { lines, sink } = capture();
    const logger = createLogger({ sink, clock: () => 0 });
    logger.info('hello', { a: 1 });
    expect(lines).toHaveLength(1);
    expect(JSON.parse(lines[0] ?? '')).toEqual({ ts: '1970-01-01T00:00:00.000Z', level: 'info', msg: 'hello', a: 1 });
  });

  it('filters below the configured level', () => {
    const { lines, sink } = capture();
    const logger = createLogger({ sink, level: 'warn' });
    logger.debug('no');
    logger.info('no');
    logger.warn('yes');
    logger.error('yes');
    expect(lines).toHaveLength(2);
  });

  it('redacts secret-looking keys, including nested ones, and child fields persist', () => {
    const { lines, sink } = capture();
    const logger = createLogger({ sink, clock: () => 0 }).child({ apiKey: 'sk-123', component: 'x' });
    logger.info('call', { nested: { password: 'p', ok: 'v' }, authorization: 'Bearer t' });
    const entry = JSON.parse(lines[0] ?? '');
    expect(entry.apiKey).toBe('[REDACTED]');
    expect(entry.component).toBe('x');
    expect(entry.nested).toEqual({ password: '[REDACTED]', ok: 'v' });
    expect(entry.authorization).toBe('[REDACTED]');
  });

  it('redact stops at depth to avoid runaway recursion', () => {
    let deep: Record<string, unknown> = { leaf: 1 };
    for (let i = 0; i < 10; i += 1) deep = { child: deep };
    expect(JSON.stringify(redact(deep))).toContain('[TRUNCATED]');
  });
});

describe('timing', () => {
  it('measures async and sync functions with an injected clock', async () => {
    let t = 0;
    const clock = () => (t += 5);
    const timed = await measure(async () => 'v', clock);
    expect(timed).toEqual({ value: 'v', durationMs: 5 });
    const sync = measureSync(() => 3, clock);
    expect(sync).toEqual({ value: 3, durationMs: 5 });
  });
});
