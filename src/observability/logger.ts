/**
 * Structured JSON-lines logger. Writes one JSON object per line to a sink (stderr by
 * default so stdout stays clean for machine-readable command output). Secret-looking
 * field names are redacted before serialisation.
 */
export type LogLevel = 'debug' | 'info' | 'warn' | 'error';

export type LogFields = Record<string, unknown>;

export interface Logger {
  debug(message: string, fields?: LogFields): void;
  info(message: string, fields?: LogFields): void;
  warn(message: string, fields?: LogFields): void;
  error(message: string, fields?: LogFields): void;
  child(fields: LogFields): Logger;
}

export interface LoggerOptions {
  level?: LogLevel;
  sink?: (line: string) => void;
  clock?: () => number;
  base?: LogFields;
}

const LEVEL_RANK: Record<LogLevel, number> = { debug: 10, info: 20, warn: 30, error: 40 };

const SECRET_KEY = /(token|secret|password|passwd|api[-_]?key|authorization|credential)/i;
const MAX_DEPTH = 6;

export function redact(value: unknown, depth = 0): unknown {
  if (depth > MAX_DEPTH) return '[TRUNCATED]';
  if (Array.isArray(value)) return value.map((item) => redact(item, depth + 1));
  if (value !== null && typeof value === 'object') {
    const out: Record<string, unknown> = {};
    for (const [key, inner] of Object.entries(value as Record<string, unknown>)) {
      out[key] = SECRET_KEY.test(key) ? '[REDACTED]' : redact(inner, depth + 1);
    }
    return out;
  }
  return value;
}

function defaultSink(line: string): void {
  process.stderr.write(`${line}\n`);
}

export function createLogger(options: LoggerOptions = {}): Logger {
  const level = options.level ?? 'info';
  const sink = options.sink ?? defaultSink;
  const clock = options.clock ?? Date.now;
  const base = options.base ?? {};

  const write = (entryLevel: LogLevel, message: string, fields?: LogFields): void => {
    if (LEVEL_RANK[entryLevel] < LEVEL_RANK[level]) return;
    const entry = {
      ts: new Date(clock()).toISOString(),
      level: entryLevel,
      msg: message,
      ...(redact({ ...base, ...(fields ?? {}) }) as LogFields),
    };
    sink(JSON.stringify(entry));
  };

  return {
    debug: (message, fields) => write('debug', message, fields),
    info: (message, fields) => write('info', message, fields),
    warn: (message, fields) => write('warn', message, fields),
    error: (message, fields) => write('error', message, fields),
    child: (fields) => createLogger({ level, sink, clock, base: { ...base, ...fields } }),
  };
}

export const silentLogger: Logger = createLogger({ sink: () => undefined, level: 'error' });
