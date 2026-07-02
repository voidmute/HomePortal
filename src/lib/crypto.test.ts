import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { decryptSecret, encryptSecret, isEncryptedSecret } from "./crypto";

describe("crypto", () => {
  const originalSecret = process.env.SESSION_SECRET;

  beforeEach(() => {
    process.env.SESSION_SECRET = "test-session-secret-for-crypto-roundtrip";
  });

  afterEach(() => {
    if (originalSecret === undefined) {
      delete process.env.SESSION_SECRET;
    } else {
      process.env.SESSION_SECRET = originalSecret;
    }
  });

  it("round-trips a TOTP secret through encrypt and decrypt", () => {
    const plaintext = "JBSWY3DPEHPK3PXP";
    const encrypted = encryptSecret(plaintext);
    expect(isEncryptedSecret(encrypted)).toBe(true);
    expect(decryptSecret(encrypted)).toBe(plaintext);
  });

  it("returns legacy plaintext secrets unchanged", () => {
    const legacy = "JBSWY3DPEHPK3PXP";
    expect(isEncryptedSecret(legacy)).toBe(false);
    expect(decryptSecret(legacy)).toBe(legacy);
  });
});
