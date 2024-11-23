import { resolveHostname } from '../../src/utils/dnsResolver';

describe('resolveHostname', () => {
  it('should resolve a hostname to an IPv4 address', async () => {
    const ipAddress = await resolveHostname('example.com', 4);
    expect(ipAddress).toBeDefined();
    expect(ipAddress).toMatch(/^(\d{1,3}\.){3}\d{1,3}$/);
  });

  it('should resolve a hostname to an IPv6 address', async () => {
    const ipAddress = await resolveHostname('ipv6.google.com', 6);
    expect(ipAddress).toBeDefined();
    expect(ipAddress).toMatch(/^[a-fA-F0-9:]+$/);
  });

  it('should throw an error if the hostname cannot be resolved', async () => {
    await expect(resolveHostname('invalid-hostname')).rejects.toThrow(
      'ENOTFOUND',
    );
  });

  it('should throw a timeout error if resolution takes too long', async () => {
    await expect(resolveHostname('example.com', 4, 1)).rejects.toThrow(
      'DNS resolution timeout',
    );
  });

  it('should use the default family if none is specified', async () => {
    const ipAddress = await resolveHostname('example.com');
    expect(ipAddress).toBeDefined();
    expect(ipAddress).toMatch(/^(\d{1,3}\.){3}\d{1,3}$|^[a-fA-F0-9:]+$/);
  });
});
