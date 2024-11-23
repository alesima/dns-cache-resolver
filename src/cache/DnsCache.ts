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
   * @param family The address family (4 for IPv4, 6 for IPv6). Defaults to 4.
   * @param timeout The timeout in milliseconds for the resolution. Optional.
   * @returns The resolved IP address.
   */
  async resolve(
    hostname: string,
    family: number = 4,
    timeout?: number,
  ): Promise<string> {
    const cacheKey = `${hostname}:${family}`;
    const cachedEntry = this.cache.get(cacheKey);

    if (cachedEntry && cachedEntry.expiresAt > Date.now()) {
      return cachedEntry.address;
    }

    const address = await resolveHostname(hostname, family, timeout);

    if (!address) {
      throw new Error(`Failed to resolve hostname: ${hostname}`);
    }

    this.cacheEntry(cacheKey, address);

    return address;
  }

  /**
   * Adds a new entry to the DNS cache.
   * @param cacheKey  The key for the cache entry (hostname:family).
   * @param address  The IP address to add.
   */
  private cacheEntry(cacheKey: string, address: string): void {
    if (this.cache.size >= this.maxEntries) {
      const oldestKey = this.cache.keys().next().value;

      if (oldestKey) {
        this.cache.delete(oldestKey);
      }
    }

    this.cache.set(cacheKey, {
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
   * @param family The address family (4 for IPv4, 6 for IPv6). Defaults to 4.
   */
  remove(hostname: string, family: number = 4): void {
    const cacheKey = `${hostname}:${family}`;
    this.cache.delete(cacheKey);
  }

  /**
   * Lists all cached entries.
   * @returns An array of cached entries.
   */
  list(): Array<[string, CacheEntry]> {
    return Array.from(this.cache.entries());
  }
}
