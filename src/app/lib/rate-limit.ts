const requests = new Map<string, number[]>();

const WINDOW_MS = 60_000; // 1 minute
const MAX_REQUESTS = 10; // 10 requests per minute per IP

export function rateLimit(ip: string): { ok: boolean; remaining: number } {
  const now = Date.now();
  const timestamps = requests.get(ip) ?? [];

  // Remove expired timestamps
  const valid = timestamps.filter((t) => now - t < WINDOW_MS);

  if (valid.length >= MAX_REQUESTS) {
    requests.set(ip, valid);
    return { ok: false, remaining: 0 };
  }

  valid.push(now);
  requests.set(ip, valid);

  // Cleanup old IPs periodically
  if (requests.size > 10_000) {
    for (const [key, vals] of requests) {
      if (vals.every((t) => now - t >= WINDOW_MS)) {
        requests.delete(key);
      }
    }
  }

  return { ok: true, remaining: MAX_REQUESTS - valid.length };
}
