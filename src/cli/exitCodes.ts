import type { ErrorCode } from '../shared/errors.js';

/** Stable exit codes: part of the CLI contract. */
export const EXIT = {
  OK: 0,
  FAILURE: 1,
  USAGE: 2,
  UNAVAILABLE: 3,
  CONTRACT: 4,
  POLICY: 5,
} as const;

export function exitCodeFor(code: ErrorCode): number {
  switch (code) {
    case 'INVALID_INPUT':
    case 'CONFIG_INVALID':
      return EXIT.USAGE;
    case 'ADAPTER_UNAVAILABLE':
    case 'ADAPTER_TIMEOUT':
      return EXIT.UNAVAILABLE;
    case 'CONTRACT_VIOLATION':
      return EXIT.CONTRACT;
    case 'POLICY_DENIED':
      return EXIT.POLICY;
    default:
      return EXIT.FAILURE;
  }
}
