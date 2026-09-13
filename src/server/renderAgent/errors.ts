// src/server/renderAgent/errors.ts
export class RetryableError extends Error {
  readonly kind = 'retryable' as const;
  constructor(message: string) { super(message); this.name = 'RetryableError'; }
}

export class FatalError extends Error {
  readonly kind = 'fatal' as const;
  readonly code?: string;
  constructor(message: string, code?: string) { super(message); this.name = 'FatalError'; this.code = code; }
}

export const RETRY_LIMIT = 2;
export const RETRY_DELAYS_MS = [2000, 6000];

export function classifyHttpStatus(status: number, body: string): RetryableError | FatalError {
  const snippet = (body || '').replace(/\s+/g, ' ').slice(0, 200);
  const message = `Provider HTTP ${status}: ${snippet}`;
  if (status === 429 || status >= 500) return new RetryableError(message);
  if (status === 401 || status === 403) return new FatalError('The AI provider rejected the OpenRouter key. Check the key in Settings or in OPENROUTER_API_KEY.', 'BAD_KEY');
  return new FatalError(message, 'BAD_REQUEST');
}

const defaultSleep = (ms: number) => new Promise<void>((r) => setTimeout(r, ms));

export async function withRetry<T>(
  fn: () => Promise<T>,
  opts: { retries?: number; delaysMs?: number[]; sleep?: (ms: number) => Promise<void> } = {}
): Promise<T> {
  const retries = opts.retries ?? RETRY_LIMIT;
  const delays = opts.delaysMs ?? RETRY_DELAYS_MS;
  const sleep = opts.sleep ?? defaultSleep;
  let attempt = 0;
  for (;;) {
    try {
      return await fn();
    } catch (err) {
      if (err instanceof FatalError) throw err;
      if (attempt >= retries) throw err;
      await sleep(delays[Math.min(attempt, delays.length - 1)] ?? 0);
      attempt++;
    }
  }
}
