import { resolveHostname } from "../../src/utils/dnsResolver";

describe("resolveHostname", () => {
  it("should resolve a hostname to an IP address", async () => {
    const ipAddress = await resolveHostname("example.com");
    expect(ipAddress).toBeDefined();
  });

  it("show throw an error if the hostname cannot be resolved", async () => {
    await expect(resolveHostname("invalid-hostname")).rejects.toThrow();
  });
});
