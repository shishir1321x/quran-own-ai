/**
 * Fixed-window rate limiter for the public link (one counter per key, for example per IP).
 * Rules: docs/SPEC.md, section 7.
 *
 *  - The window of a key starts at its first allowed call and lasts windowMs.
 *  - Inside the window, allow() returns true until `limit` calls were allowed, then false.
 *  - Refused calls do NOT extend the window.
 *  - When windowMs has passed (exactly at the end counts), the next call opens a new window.
 *  - Different keys never affect each other. A limit of 0 refuses everything.
 *
 * Honest limit: this lives in memory. On Cloudflare/Vercel each instance has its
 * own copy, so a user who hits different instances gets more than `limit` calls.
 */
export class RateLimiter {
  private readonly limit: number;
  private readonly windowMs: number;
  private readonly now: () => number;
  /** For each key: when its window started, and how many calls were allowed in it. */
  private readonly windows = new Map<string, { start: number; count: number }>();

  constructor(limit: number, windowMs: number, now: () => number = Date.now) {
    this.limit = limit;
    this.windowMs = windowMs;
    this.now = now;
  }

  allow(key: string): boolean {
    if (this.limit <= 0) return false; // nothing is ever allowed, so no window ever opens

    const t = this.now();
    const w = this.windows.get(key);

    // No window yet, or the old one has ended (">=": exactly at the end counts as ended).
    if (!w || t - w.start >= this.windowMs) {
      this.windows.set(key, { start: t, count: 1 }); // this call opens the window
      return true;
    }
    if (w.count < this.limit) {
      w.count++;
      return true;
    }
    // Refused: we change nothing, so the window keeps its original start.
    return false;
  }
}
