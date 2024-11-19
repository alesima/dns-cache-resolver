import { resolveHostname } from '../utils/dnsResolver';
import { CacheEntry, DnsCacheOptions } from './interfaces';

export class DnsCache {
  private cache: Map<string, CacheEntry>;
  private ttl: number;
  private maxEntries: number;

  constructor({ ttl = 60000, maxEntries = 1000 }: DnsCacheOptions) {
    this.cache = new Map();
    this.ttl = ttl;
    this.maxEntries = maxEntries;
  }

  /**
   * Resolves a hostname and caches the result.
   * @param hostname  The hostname to resolve.
   * @returns The resolved IP address.
   */
  async resolve(hostname: string): Promise<string> {
    const cachedEntry = this.cache.get(hostname);

    if (cachedEntry && cachedEntry.expiresAt > Date.now()) {
      return cachedEntry.address;
    }

    const address = await resolveHostname(hostname);

    if (!address) {
      throw new Error(`Failed to resolve hostname: ${hostname}`);
    }

    this.cacheEntry(hostname, address);

    return address;
  }

  /**
   * Adds a new entry to the DNS cache.
   * @param hostname  The hostname to add.
   * @param address  The IP address to add.
   */
  private cacheEntry(hostname: string, address: string): void {
    if (this.cache.size >= this.maxEntries) {
      const oldestKey = this.cache.keys().next().value;

      if (oldestKey) {
        this.cache.delete(oldestKey);
      }
    }

    this.cache.set(hostname, {
      address,
      expiresAt: Date.now() + this.ttl,
    });
  }

  /**
   * Clears all cached entries.
   */
  clear(): void {
    this.cache.clear();
  }

  /**
   * Removes a specific entry from the DNS cache.
   * @param hostname The hostname to remove.
   */
  remove(hostname: string): void {
    this.cache.delete(hostname);
  }

  /**
   * Lists all cached entries.
   * @returns An array of cached entries.
   */
  list(): Array<[string, CacheEntry]> {
    return Array.from(this.cache.entries());
  }
}
