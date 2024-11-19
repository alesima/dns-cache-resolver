import * as dns from 'dns';

/**
 * Resolves the IP address for a given hostname.
 * @param hostname The hostname to resolve.
 * @returns  A promise that resolves with the IP address.
 */
export const resolveHostname = async (hostname: string): Promise<string> => {
  return new Promise((resolve, reject) => {
    dns.lookup(hostname, (err, address) => {
      if (err) {
        reject(err);
        return;
      }
      resolve(address);
    });
  });
};
