// Tiny in-memory TTL cache (D7). ponytail: a Map with timestamps, not an lru-cache
// dependency. Keeps a `stale` copy so we can serve last-known-good on upstream failure.
// Single-process only — swap for Redis if you ever run multiple API instances.
interface Entry<T> {
  value: T;
  expires: number;
}

export class TtlCache<T> {
  private store = new Map<string, Entry<T>>();
  constructor(private ttlMs: number) {}

  get(key: string): { value: T; fresh: boolean } | undefined {
    const e = this.store.get(key);
    if (!e) return undefined;
    return { value: e.value, fresh: Date.now() < e.expires };
  }

  set(key: string, value: T): void {
    this.store.set(key, { value, expires: Date.now() + this.ttlMs });
  }
}
