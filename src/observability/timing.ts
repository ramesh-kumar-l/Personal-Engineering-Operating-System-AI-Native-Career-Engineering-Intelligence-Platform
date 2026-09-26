/**
 * Measurement helpers. Every performance claim in this repo must come from a measurement
 * (spec §62); these helpers make that cheap to do consistently.
 */
export interface Timed<T> {
  value: T;
  durationMs: number;
}

export type Clock = () => number;

export const monotonicClock: Clock = () => performance.now();

export async function measure<T>(fn: () => Promise<T> | T, clock: Clock = monotonicClock): Promise<Timed<T>> {
  const start = clock();
  const value = await fn();
  return { value, durationMs: round(clock() - start) };
}

export function measureSync<T>(fn: () => T, clock: Clock = monotonicClock): Timed<T> {
  const start = clock();
  const value = fn();
  return { value, durationMs: round(clock() - start) };
}

function round(ms: number): number {
  return Math.round(ms * 1000) / 1000;
}
