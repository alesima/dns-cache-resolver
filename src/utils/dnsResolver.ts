import dns from "dns";
import { promisify } from "util";

const lookupAsync = promisify(dns.lookup);

/**
 * Resolves the IP address for a given hostname.
 * @param hostname The hostname to resolve.
 * @returns  A promise that resolves with the IP address.
 */
export const resolveHostname = async (hostname: string): Promise<string> => {
  const { address } = await lookupAsync(hostname);
  return address;
};
