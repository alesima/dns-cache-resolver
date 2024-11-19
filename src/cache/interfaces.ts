export interface CacheEntry {
  address: string;
  expiresAt: number;
}

export interface DnsCacheOptions {
  ttl?: number;
  maxEntries?: number;
}