import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { toUserError, apiErrorStatus, msg, internalError } from "./messages";

describe("toUserError", () => {
  beforeEach(() => {
    vi.spyOn(console, "error").mockImplementation(() => {});
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("maps internal path-traversal errors to a safe user-facing message", () => {
    expect(toUserError(new Error(internalError.pathTraversal))).toBe(msg.fileOperationFailed);
  });

  it("maps internal symlink-escape errors to a safe user-facing message", () => {
    expect(toUserError(new Error(internalError.symlinkEscape))).toBe(msg.fileOperationFailed);
  });

  it("passes through known user-facing messages unchanged", () => {
    expect(toUserError(new Error(msg.unauthorized))).toBe(msg.unauthorized);
    expect(toUserError(new Error(msg.forbidden))).toBe(msg.forbidden);
  });

  it("maps technical-looking errors to a generic service-unavailable message", () => {
    expect(toUserError(new Error("connect ECONNREFUSED 127.0.0.1:5432"))).toBe(msg.serviceUnavailable);
  });

  it("maps unrecognized errors to a generic fallback message", () => {
    expect(toUserError(new Error("some totally unexpected internal detail"))).toBe(msg.somethingWentWrong);
  });

  it("handles non-Error thrown values", () => {
    expect(toUserError("a string was thrown")).toBe(msg.somethingWentWrong);
  });

  it("does not log routine unauthorized/forbidden errors", () => {
    const spy = vi.spyOn(console, "error").mockImplementation(() => {});
    toUserError(new Error(msg.unauthorized));
    toUserError(new Error(msg.forbidden));
    expect(spy).not.toHaveBeenCalled();
  });

  it("logs security-relevant path errors", () => {
    const spy = vi.spyOn(console, "error").mockImplementation(() => {});
    toUserError(new Error(internalError.pathTraversal));
    expect(spy).toHaveBeenCalled();
  });
});

describe("apiErrorStatus", () => {
  it("maps unauthorized to 401", () => {
    expect(apiErrorStatus(msg.unauthorized)).toBe(401);
  });

  it("maps forbidden to 403", () => {
    expect(apiErrorStatus(msg.forbidden)).toBe(403);
  });

  it("defaults to 400 for other messages", () => {
    expect(apiErrorStatus(msg.somethingWentWrong)).toBe(400);
  });
});
