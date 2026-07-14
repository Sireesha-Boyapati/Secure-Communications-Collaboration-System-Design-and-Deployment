import { describe, expect, it } from "vitest";

describe("crypto module", () => {
  it("exports generateKeyPair function", async () => {
    const { generateKeyPair } = await import("./crypto");
    const keys = await generateKeyPair();
    expect(keys.fingerprint).toHaveLength(16);
    expect(keys.publicJwk.kty).toBe("EC");
  });
});
