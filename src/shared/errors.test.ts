import { describe, expect, it } from 'vitest';
import { AppError, isAppError, toAppError } from './errors.js';
import { err, isOk, ok, unwrapOr } from './result.js';

describe('AppError', () => {
  it('serialises code, message and details', () => {
    const error = new AppError('INVALID_INPUT', 'bad', { details: { field: 'x' } });
    expect(error.toJSON()).toEqual({ code: 'INVALID_INPUT', message: 'bad', details: { field: 'x' } });
    expect(error.name).toBe('AppError');
    expect(isAppError(error)).toBe(true);
  });

  it('omits details when absent', () => {
    expect(new AppError('INTERNAL', 'x').toJSON()).toEqual({ code: 'INTERNAL', message: 'x' });
  });

  it('wraps unknown throwables preserving the cause', () => {
    const cause = new Error('boom');
    const wrapped = toAppError(cause, 'STORAGE_FAILURE');
    expect(wrapped.code).toBe('STORAGE_FAILURE');
    expect(wrapped.message).toBe('boom');
    expect(wrapped.cause).toBe(cause);
    expect(toAppError('text').message).toBe('text');
    expect(toAppError(wrapped)).toBe(wrapped);
  });
});

describe('Result', () => {
  it('distinguishes ok and err', () => {
    expect(isOk(ok(1))).toBe(true);
    expect(isOk(err('e'))).toBe(false);
    expect(unwrapOr(ok(2), 0)).toBe(2);
    expect(unwrapOr(err('e'), 0)).toBe(0);
  });
});
