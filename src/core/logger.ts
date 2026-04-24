type Level = 'debug' | 'info' | 'warn' | 'error';

const LEVELS: Record<Level, number> = { debug: 0, info: 1, warn: 2, error: 3 };

class Logger {
  private threshold: number = LEVELS.info;
  private buffer: { level: Level; msg: string; ts: number }[] = [];
  private bufferMax = 256;

  setLevel(level: Level): void {
    this.threshold = LEVELS[level];
  }

  log(level: Level, ...args: unknown[]): void {
    const msg = args.map((a) => (typeof a === 'string' ? a : safeStringify(a))).join(' ');
    this.buffer.push({ level, msg, ts: performance.now() });
    if (this.buffer.length > this.bufferMax) this.buffer.shift();
    if (LEVELS[level] < this.threshold) return;
    const fn =
      level === 'error' ? console.error : level === 'warn' ? console.warn : console.info;
    fn(`[${level}]`, ...args);
  }

  debug(...args: unknown[]): void {
    this.log('debug', ...args);
  }
  info(...args: unknown[]): void {
    this.log('info', ...args);
  }
  warn(...args: unknown[]): void {
    this.log('warn', ...args);
  }
  error(...args: unknown[]): void {
    this.log('error', ...args);
  }

  recent(): readonly { level: Level; msg: string; ts: number }[] {
    return this.buffer;
  }
}

function safeStringify(v: unknown): string {
  try {
    return JSON.stringify(v);
  } catch {
    return String(v);
  }
}

export const log = new Logger();
