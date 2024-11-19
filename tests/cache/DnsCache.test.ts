import { DnsCache } from '../../src/cache/DnsCache';
import { resolveHostname } from '../../src/utils/dnsResolver';

jest.mock('../../src/utils/dnsResolver', () => ({
  resolveHostname: jest.fn(),
}));

describe('DnsCache', () => {
  let dnsCache: DnsCache;

  beforeEach(() => {
    dnsCache = new DnsCache({ ttl: 5000, maxEntries: 2 });
    (resolveHostname as jest.Mock).mockImplementation((hostname: string) => {
      const mockIP: Record<string, string> = {
        'example.com': '192.0.2.1',
        'google.com': '192.0.2.2',
        'github.com': '192.0.2.3',
      };

      if (hostname in mockIP) {
        return Promise.resolve(mockIP[hostname]);
      }

      return Promise.reject(new Error(`DNS resolution failed for ${hostname}`));
    });
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should cache a resolved hostname', async () => {
    const ipAddress = await dnsCache.resolve('example.com');
    expect(ipAddress).toBe('192.0.2.1');

    const cacheContents = dnsCache['cache'];
    expect(cacheContents.has('example.com')).toBe(true);
    expect(cacheContents.get('example.com')?.address).toBe('192.0.2.1');
  });

  it('should retrieve cached entries without re-resolving', async () => {
    await dnsCache.resolve('example.com');
    const ipAddress = await dnsCache.resolve('example.com');

    expect(resolveHostname).toHaveBeenCalledTimes(1);

    expect(ipAddress).toBe('192.0.2.1');
  });

  it('should expire cache entries after the TTL', async () => {
    jest.useFakeTimers();

    await dnsCache.resolve('example.com');

    jest.advanceTimersByTime(5000);

    const newIPAddress = await dnsCache.resolve('example.com');
    expect(newIPAddress).toBe('192.0.2.1');

    expect(resolveHostname).toHaveBeenCalledTimes(2);

    jest.useRealTimers();
  });

  it('should evict the oldest entry when maxEntries is reached', async () => {
    await dnsCache.resolve('example.com');
    await dnsCache.resolve('google.com');
    await dnsCache.resolve('github.com');

    const cacheContents = dnsCache['cache'];
    expect(cacheContents.has('example.com')).toBe(false);
    expect(cacheContents.has('google.com')).toBe(true);
    expect(cacheContents.has('github.com')).toBe(true);
  });

  it('should clear all cached entries', async () => {
    await dnsCache.resolve('example.com');
    await dnsCache.resolve('google.com');

    dnsCache.clear();

    const cacheContents = dnsCache['cache'];
    expect(cacheContents.size).toBe(0);
  });

  it('should remove a specific entry from the cache', async () => {
    await dnsCache.resolve('example.com');
    await dnsCache.resolve('google.com');

    dnsCache.remove('example.com');

    const cacheContents = dnsCache['cache'];
    expect(cacheContents.has('example.com')).toBe(false);
    expect(cacheContents.has('google.com')).toBe(true);
  });

  it('should list all cached entries', async () => {
    await dnsCache.resolve('example.com');
    await dnsCache.resolve('google.com');

    const entries = dnsCache.list();

    expect(entries.length).toBe(2);
    expect(entries[0][0]).toBe('example.com');
    expect(entries[1][0]).toBe('google.com');
  });
});
