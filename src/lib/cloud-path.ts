import path from "path";
import fs from "fs";
import { internalError } from "./messages";

const ROOT = process.env.PRIVATE_CLOUD_ROOT || path.join(process.cwd(), "data", "cloud");

export function getCloudRoot(): string {
  if (!fs.existsSync(ROOT)) {
    fs.mkdirSync(ROOT, { recursive: true });
  }
  return path.resolve(ROOT);
}

function sanitizeUsername(username: string): string {
  const sanitized = username.trim().toLowerCase();
  if (!/^[a-z0-9_-]+$/.test(sanitized)) {
    throw new Error(internalError.invalidPath);
  }
  return sanitized;
}

export function getUserCloudRoot(username: string): string {
  const userDir = path.resolve(getCloudRoot(), sanitizeUsername(username));
  if (!fs.existsSync(userDir)) {
    fs.mkdirSync(userDir, { recursive: true });
  }
  return userDir;
}

export function resolveUserCloudPath(username: string, relativePath: string = ""): string {
  const userRoot = getUserCloudRoot(username);
  const normalized = path.normalize(relativePath).replace(/^(\.\.(\/|\\|$))+/, "");

  if (normalized.includes("..") || normalized.includes("\0")) {
    throw new Error(internalError.invalidPath);
  }

  const resolved = path.resolve(userRoot, normalized || ".");

  if (!resolved.startsWith(userRoot + path.sep) && resolved !== userRoot) {
    throw new Error(internalError.pathTraversal);
  }

  const realRoot = fs.realpathSync(userRoot);
  try {
    const realResolved = fs.realpathSync(resolved);
    if (!realResolved.startsWith(realRoot + path.sep) && realResolved !== realRoot) {
      throw new Error(internalError.symlinkEscape);
    }
  } catch (err) {
    if ((err as NodeJS.ErrnoException).code !== "ENOENT") throw err;
  }

  return resolved;
}

export function getUserRelativePath(username: string, absolutePath: string): string {
  const userRoot = getUserCloudRoot(username);
  return path.relative(userRoot, absolutePath) || "";
}

/** Strip path components from an upload filename and reject traversal attempts. */
export function sanitizeUploadFilename(filename: string): string {
  if (filename.includes("\0")) {
    throw new Error(internalError.invalidPath);
  }
  const safeName = path.basename(filename);
  if (!safeName || safeName === "." || safeName === "..") {
    throw new Error(internalError.invalidPath);
  }
  if (safeName.includes("/") || safeName.includes("\\") || safeName.includes("..")) {
    throw new Error(internalError.invalidPath);
  }
  return safeName;
}
