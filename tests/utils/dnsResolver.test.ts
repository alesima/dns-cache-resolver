import { resolveHostname } from '../../src/utils/dnsResolver';

jest.mock('../../src/utils/dnsResolver', () => ({
  resolveHostname: jest.fn(),
}));

describe('resolveHostname', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should resolve a hostname to an IPv4 address', async () => {
    (resolveHostname as jest.Mock).mockResolvedValueOnce('93.184.216.34');

    const ipAddress = await resolveHostname('example.com', 4);
    expect(ipAddress).toBeDefined();
    expect(ipAddress).toMatch(/^(\d{1,3}\.){3}\d{1,3}$/);
  });

  it('should resolve a hostname to an IPv6 address', async () => {
    (resolveHostname as jest.Mock).mockResolvedValueOnce(
      '2606:2800:220:1:248:1893:25c8:1946',
    );

    const ipAddress = await resolveHostname('ipv6.google.com', 6);
    expect(ipAddress).toBeDefined();
    expect(ipAddress).toMatch(/^[a-fA-F0-9:]+$/);
  });

  it('should throw an error if the hostname cannot be resolved', async () => {
    (resolveHostname as jest.Mock).mockRejectedValueOnce(
      new Error('getaddrinfo ENOTFOUND invalid-hostname'),
    );

    await expect(resolveHostname('invalid-hostname')).rejects.toThrow(
      /EAI_AGAIN|ENOTFOUND/,
    );
  });

  it('should throw a timeout error if resolution takes too long', async () => {
    (resolveHostname as jest.Mock).mockImplementationOnce(
      (hostname: string, family: number, timeout: number) =>
        new Promise((_, reject) =>
          setTimeout(
            () => reject(new Error('DNS resolution timeout')),
            timeout,
          ),
        ),
    );

    await expect(resolveHostname('example.com', 4, 1)).rejects.toThrow(
      'DNS resolution timeout',
    );
  });

  it('should use the default family if none is specified', async () => {
    (resolveHostname as jest.Mock).mockResolvedValueOnce('93.184.216.34');

    const ipAddress = await resolveHostname('example.com');
    expect(ipAddress).toBeDefined();
    expect(ipAddress).toMatch(/^(\d{1,3}\.){3}\d{1,3}$/);
  });
});
