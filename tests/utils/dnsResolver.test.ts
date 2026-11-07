import * as dns from 'dns';
import { resolveHostname } from '../../src/utils/dnsResolver';

jest.mock('dns', () => {
  const actual = jest.requireActual('dns');
  return { ...actual, lookup: jest.fn() };
});

const lookupMock = dns.lookup as unknown as jest.Mock;

function mockLookupOnce(
  err: NodeJS.ErrnoException | null,
  address?: string,
  family?: number,
) {
  lookupMock.mockImplementationOnce(
    (
      _hostname: string,
      _options: object,
      callback: (
        err: NodeJS.ErrnoException | null,
        address: string,
        family: number,
      ) => void,
    ) => {
      callback(err, address ?? '', family ?? 4);
      return {} as dns.LookupAddress;
    },
  );
}

describe('resolveHostname', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should resolve a hostname to an IPv4 address', async () => {
    mockLookupOnce(null, '93.184.216.34', 4);

    const ipAddress = await resolveHostname('example.com', 4);
    expect(ipAddress).toBe('93.184.216.34');
    expect(lookupMock).toHaveBeenCalledTimes(1);
    expect(lookupMock.mock.calls[0][0]).toBe('example.com');
    expect(lookupMock.mock.calls[0][1]).toEqual({ family: 4 });
  });

  it('should resolve a hostname to an IPv6 address', async () => {
    mockLookupOnce(null, '2606:2800:220:1:248:1893:25c8:1946', 6);

    const ipAddress = await resolveHostname('example.com', 6);
    expect(ipAddress).toBe('2606:2800:220:1:248:1893:25c8:1946');
    expect(lookupMock.mock.calls[0][1]).toEqual({ family: 6 });
  });

  it('should throw an error if the hostname cannot be resolved', async () => {
    const err = new Error(
      'getaddrinfo ENOTFOUND invalid-hostname',
    ) as NodeJS.ErrnoException;
    err.code = 'ENOTFOUND';
    mockLookupOnce(err);

    await expect(resolveHostname('invalid-hostname')).rejects.toThrow(
      /ENOTFOUND/,
    );
  });

  it('should throw a timeout error if resolution takes too long', async () => {
    lookupMock.mockImplementationOnce(() => ({}) as dns.LookupAddress);

    await expect(resolveHostname('example.com', 4, 50)).rejects.toThrow(
      'DNS resolution timeout',
    );
  });

  it('should use the default family if none is specified', async () => {
    mockLookupOnce(null, '93.184.216.34', 4);

    const ipAddress = await resolveHostname('example.com');
    expect(ipAddress).toBe('93.184.216.34');
    expect(lookupMock.mock.calls[0][1]).toEqual({ family: 4 });
  });

  it('should not leave a pending timer after a fast resolution', async () => {
    jest.useFakeTimers();
    try {
      mockLookupOnce(null, '93.184.216.34', 4);

      await resolveHostname('example.com', 4, 60000);
      expect(jest.getTimerCount()).toBe(0);
    } finally {
      jest.useRealTimers();
    }
  });
});
