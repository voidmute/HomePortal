import { describe, it, expect, beforeAll, afterAll } from "vitest";
import fs from "fs";
import os from "os";
import path from "path";

// PRIVATE_CLOUD_ROOT is read once at module load time, so it must be set
// before cloud-path.ts is first imported — use a dynamic import after
// pointing it at a throwaway temp directory instead of the repo's data/cloud.
let cloudPath: typeof import("./cloud-path");
let tmpRoot: string;

beforeAll(async () => {
  tmpRoot = fs.mkdtempSync(path.join(os.tmpdir(), "cloud-path-test-"));
  process.env.PRIVATE_CLOUD_ROOT = tmpRoot;
  cloudPath = await import("./cloud-path");
});

afterAll(() => {
  fs.rmSync(tmpRoot, { recursive: true, force: true });
});

describe("resolveUserCloudPath", () => {
  it("resolves a simple relative path within the user's root", () => {
    const resolved = cloudPath.resolveUserCloudPath("alice", "photos/cat.png");
    expect(resolved).toBe(path.join(tmpRoot, "alice", "photos", "cat.png"));
  });

  it("resolves the root itself when given an empty path", () => {
    const resolved = cloudPath.resolveUserCloudPath("alice", "");
    expect(resolved).toBe(path.join(tmpRoot, "alice"));
  });

  it("lowercases and sanitizes the username", () => {
    const resolved = cloudPath.resolveUserCloudPath("Bob", "");
    expect(resolved).toBe(path.join(tmpRoot, "bob"));
  });

  it("throws on a username with invalid characters", () => {
    expect(() => cloudPath.resolveUserCloudPath("../etc", "")).toThrow(internalErr("INVALID_PATH"));
  });

  it("strips leading ../ segments rather than escaping the user root", () => {
    // Leading ../ sequences are stripped before resolution, so this is
    // neutralized into a path within the user's own root, not rejected.
    const resolved = cloudPath.resolveUserCloudPath("alice", "../../etc/passwd");
    expect(resolved.startsWith(cloudPath.getUserCloudRoot("alice") + path.sep)).toBe(true);
  });

  it("neutralizes a path that would traverse back out after normalization", () => {
    const resolved = cloudPath.resolveUserCloudPath("alice", "a/../../../outside");
    expect(resolved.startsWith(cloudPath.getUserCloudRoot("alice") + path.sep)).toBe(true);
  });

  it("rejects an absolute path that would otherwise override the user root", () => {
    // path.resolve() treats an absolute second argument as an override,
    // ignoring the base — this is the real case the pathTraversal check guards.
    const outsideAbsolute = path.join(path.parse(tmpRoot).root, "outside-root-target");
    expect(() => cloudPath.resolveUserCloudPath("alice", outsideAbsolute)).toThrow(
      internalErr("PATH_TRAVERSAL")
    );
  });

  it("rejects a null byte in the path", () => {
    expect(() => cloudPath.resolveUserCloudPath("alice", "foo\0bar")).toThrow(internalErr("INVALID_PATH"));
  });

  it("rejects a literal '..' substring embedded in a path segment", () => {
    expect(() => cloudPath.resolveUserCloudPath("alice", "my..file.txt")).toThrow(
      internalErr("INVALID_PATH")
    );
  });

  it("detects a symlink that escapes the user root", () => {
    const userRoot = cloudPath.getUserCloudRoot("carol");
    const outsideDir = fs.mkdtempSync(path.join(os.tmpdir(), "cloud-path-outside-"));
    const linkPath = path.join(userRoot, "escape-link");
    fs.symlinkSync(outsideDir, linkPath, "junction");

    try {
      expect(() => cloudPath.resolveUserCloudPath("carol", "escape-link")).toThrow(
        internalErr("SYMLINK_ESCAPE")
      );
    } finally {
      fs.rmSync(outsideDir, { recursive: true, force: true });
    }
  });

  it("allows a symlink that points within the user's own root", () => {
    const userRoot = cloudPath.getUserCloudRoot("erin");
    const realDir = path.join(userRoot, "real");
    fs.mkdirSync(realDir, { recursive: true });
    const linkPath = path.join(userRoot, "alias");
    fs.symlinkSync(realDir, linkPath, "junction");

    expect(() => cloudPath.resolveUserCloudPath("erin", "alias")).not.toThrow();
  });
});

describe("getUserRelativePath", () => {
  it("returns the path relative to the user's root", () => {
    const abs = cloudPath.resolveUserCloudPath("dave", "docs/file.txt");
    expect(cloudPath.getUserRelativePath("dave", abs)).toBe(path.join("docs", "file.txt"));
  });

  it("returns an empty string for the root itself", () => {
    const abs = cloudPath.getUserCloudRoot("dave");
    expect(cloudPath.getUserRelativePath("dave", abs)).toBe("");
  });
});

function internalErr(kind: "INVALID_PATH" | "PATH_TRAVERSAL" | "SYMLINK_ESCAPE"): string {
  return `__${kind}__`;
}
