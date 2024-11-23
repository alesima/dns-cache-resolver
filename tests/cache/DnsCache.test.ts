import { DnsCache } from '../../src/cache/DnsCache';
import { resolveHostname } from '../../src/utils/dnsResolver';

jest.mock('../../src/utils/dnsResolver', () => ({
  resolveHostname: jest.fn(),
}));

describe('DnsCache', () => {
  let dnsCache: DnsCache;

  beforeEach(() => {
    dnsCache = new DnsCache({ ttl: 5000, maxEntries: 2 });
    (resolveHostname as jest.Mock).mockImplementation(
      (hostname: string, family = 4) => {
        const mockIP: Record<string, Record<number, string>> = {
          'example.com': { 4: '192.0.2.1', 6: '2001:db8::1' },
          'google.com': { 4: '192.0.2.2', 6: '2001:db8::2' },
          'github.com': { 4: '192.0.2.3', 6: '2001:db8::3' },
        };

        if (hostname in mockIP && family in mockIP[hostname]) {
          return Promise.resolve(mockIP[hostname][family]);
        }

        return Promise.reject(
          new Error(
            `DNS resolution failed for ${hostname} with family ${family}`,
          ),
        );
      },
    );
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should cache a resolved hostname with IPv4', async () => {
    const ipAddress = await dnsCache.resolve('example.com', 4);
    expect(ipAddress).toBe('192.0.2.1');

    const cacheContents = dnsCache['cache'];
    expect(cacheContents.has('example.com:4')).toBe(true);
    expect(cacheContents.get('example.com:4')?.address).toBe('192.0.2.1');
  });

  it('should cache a resolved hostname with IPv6', async () => {
    const ipAddress = await dnsCache.resolve('example.com', 6);
    expect(ipAddress).toBe('2001:db8::1');

    const cacheContents = dnsCache['cache'];
    expect(cacheContents.has('example.com:6')).toBe(true);
    expect(cacheContents.get('example.com:6')?.address).toBe('2001:db8::1');
  });

  it('should retrieve cached entries without re-resolving', async () => {
    await dnsCache.resolve('example.com', 4);
    const ipAddress = await dnsCache.resolve('example.com', 4);

    expect(resolveHostname).toHaveBeenCalledTimes(1);
    expect(ipAddress).toBe('192.0.2.1');
  });

  it('should expire cache entries after the TTL', async () => {
    jest.useFakeTimers();

    await dnsCache.resolve('example.com', 4);

    jest.advanceTimersByTime(5000);

    const newIPAddress = await dnsCache.resolve('example.com', 4);
    expect(newIPAddress).toBe('192.0.2.1');

    expect(resolveHostname).toHaveBeenCalledTimes(2);

    jest.useRealTimers();
  });

  it('should respect maxEntries and evict the oldest entry', async () => {
    await dnsCache.resolve('example.com', 4);
    await dnsCache.resolve('google.com', 4);
    await dnsCache.resolve('github.com', 4);

    const cacheContents = dnsCache['cache'];
    expect(cacheContents.has('example.com:4')).toBe(false);
    expect(cacheContents.has('google.com:4')).toBe(true);
    expect(cacheContents.has('github.com:4')).toBe(true);
  });

  it('should clear all cached entries', async () => {
    await dnsCache.resolve('example.com', 4);
    await dnsCache.resolve('google.com', 6);

    dnsCache.clear();

    const cacheContents = dnsCache['cache'];
    expect(cacheContents.size).toBe(0);
  });

  it('should remove a specific cached entry by hostname and family', async () => {
    await dnsCache.resolve('example.com', 4);
    await dnsCache.resolve('example.com', 6);

    dnsCache.remove('example.com', 4);

    const cacheContents = dnsCache['cache'];
    expect(cacheContents.has('example.com:4')).toBe(false);
    expect(cacheContents.has('example.com:6')).toBe(true);
  });

  it('should list all cached entries with their keys and values', async () => {
    await dnsCache.resolve('example.com', 4);
    await dnsCache.resolve('google.com', 6);

    const entries = dnsCache.list();

    expect(entries.length).toBe(2);
    expect(entries).toContainEqual([
      'example.com:4',
      expect.objectContaining({ address: '192.0.2.1' }),
    ]);
    expect(entries).toContainEqual([
      'google.com:6',
      expect.objectContaining({ address: '2001:db8::2' }),
    ]);
  });

  it('should handle resolution timeouts gracefully', async () => {
    (resolveHostname as jest.Mock).mockImplementationOnce(
      () =>
        new Promise((_, reject) =>
          setTimeout(() => reject(new Error('DNS resolution timeout')), 1000),
        ),
    );

    await expect(dnsCache.resolve('example.com', 4, 500)).rejects.toThrow(
      'DNS resolution timeout',
    );
  });

  it('should resolve using default family if not specified', async () => {
    const ipAddress = await dnsCache.resolve('example.com');
    expect(ipAddress).toBe('192.0.2.1');

    const cacheContents = dnsCache['cache'];
    expect(cacheContents.has('example.com:4')).toBe(true);
  });
});
