import * as dns from 'dns';

/**
 * Resolves the IP address for a given hostname.
 * @param hostname The hostname to resolve.
 * @param family The address family (4 for IPv4, 6 for IPv6). Defaults to 4.
 * @param timeout The timeout in milliseconds for the resolution. Optional.
 * @returns A promise that resolves with the IP address.
 */
export const resolveHostname = async (
  hostname: string,
  family: number = 4,
  timeout?: number,
): Promise<string> => {
  return new Promise((resolve, reject) => {
    const lookupPromise = new Promise<string>((resolveLookup, rejectLookup) => {
      dns.lookup(hostname, { family }, (err, address) => {
        if (err) {
          rejectLookup(err);
          return;
        }
        resolveLookup(address);
      });
    });

    if (timeout) {
      const timeoutPromise = new Promise<string>((_, rejectTimeout) =>
        setTimeout(
          () => rejectTimeout(new Error('DNS resolution timeout')),
          timeout,
        ),
      );

      Promise.race([lookupPromise, timeoutPromise]).then(resolve).catch(reject);
    } else {
      lookupPromise.then(resolve).catch(reject);
    }
  });
};
