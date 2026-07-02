import { describe, it, expect, beforeAll } from "vitest";
import { checkRateLimit } from "./rate-limit";

// No REDIS_URL is set in the test environment, so checkRateLimit always
// exercises the in-memory fallback path — the Redis path would need a live
// Redis instance and is exercised manually/in integration rather than here.
describe("checkRateLimit (in-memory fallback)", () => {
  beforeAll(() => {
    delete process.env.REDIS_URL;
  });

  it("allows requests under the limit and reports remaining count", async () => {
    const key = `test:under:${Math.random()}`;
    const result = await checkRateLimit(key, 3, 60_000);
    expect(result.allowed).toBe(true);
    expect(result.remaining).toBe(2);
  });

  it("blocks requests once the limit is exceeded", async () => {
    const key = `test:over:${Math.random()}`;
    await checkRateLimit(key, 2, 60_000);
    await checkRateLimit(key, 2, 60_000);
    const third = await checkRateLimit(key, 2, 60_000);
    expect(third.allowed).toBe(false);
    expect(third.remaining).toBe(0);
  });

  it("tracks separate keys independently", async () => {
    const keyA = `test:a:${Math.random()}`;
    const keyB = `test:b:${Math.random()}`;
    await checkRateLimit(keyA, 1, 60_000);
    const blockedA = await checkRateLimit(keyA, 1, 60_000);
    const allowedB = await checkRateLimit(keyB, 1, 60_000);
    expect(blockedA.allowed).toBe(false);
    expect(allowedB.allowed).toBe(true);
  });
});
