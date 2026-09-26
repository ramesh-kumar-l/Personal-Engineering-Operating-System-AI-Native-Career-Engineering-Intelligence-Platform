/**
 * Application error with a stable machine-readable code. Codes are the contract for
 * callers (CLI exit codes, API responses); messages are for humans and may change.
 */
export type ErrorCode =
  | 'CONFIG_INVALID'
  | 'INVALID_INPUT'
  | 'NOT_FOUND'
  | 'STORAGE_FAILURE'
  | 'MIGRATION_FAILED'
  | 'ADAPTER_UNAVAILABLE'
  | 'ADAPTER_FAILED'
  | 'ADAPTER_TIMEOUT'
  | 'CONTRACT_VIOLATION'
  | 'POLICY_DENIED'
  | 'INTERNAL';

export interface AppErrorJson {
  code: ErrorCode;
  message: string;
  details?: Record<string, unknown>;
}

export class AppError extends Error {
  readonly code: ErrorCode;
  readonly details: Record<string, unknown> | undefined;

  constructor(
    code: ErrorCode,
    message: string,
    options: { details?: Record<string, unknown>; cause?: unknown } = {},
  ) {
    super(message, options.cause === undefined ? undefined : { cause: options.cause });
    this.name = 'AppError';
    this.code = code;
    this.details = options.details;
  }

  toJSON(): AppErrorJson {
    return this.details === undefined
      ? { code: this.code, message: this.message }
      : { code: this.code, message: this.message, details: this.details };
  }
}

export function isAppError(value: unknown): value is AppError {
  return value instanceof AppError;
}

/** Wrap any thrown value into an AppError without losing the original cause. */
export function toAppError(value: unknown, code: ErrorCode = 'INTERNAL'): AppError {
  if (isAppError(value)) return value;
  const message = value instanceof Error ? value.message : String(value);
  return new AppError(code, message, { cause: value });
}
