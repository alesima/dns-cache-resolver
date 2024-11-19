import { DnsCache } from "../../src/cache/DnsCache";

describe("DnsCache", () => {
  let dnsCache: DnsCache;

  beforeEach(() => {
    dnsCache = new DnsCache({ ttl: 5000, maxEntries: 2 });
  });

  it("should resolve and cache a hostname", async () => {
    const ipAddress = await dnsCache.resolve("example.com");
    expect(ipAddress).toBeDefined();

    const cachedIP = await dnsCache.resolve("example.com");
    expect(cachedIP).toBe(ipAddress);
  });

  it("should evict the oldest entry when maxEntries is reached", async () => {
    await dnsCache.resolve("example.com");
    await dnsCache.resolve("google.com");
    await dnsCache.resolve("github.com");

    expect(() => dnsCache.resolve("example.com")).rejects.toThrow();
  });
});
