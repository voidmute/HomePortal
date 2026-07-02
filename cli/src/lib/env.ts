import { existsSync, readFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

/** Repo root: parent of cli/ */
export function getRepoRoot(): string {
  if (process.env.REPO_DIR && existsSync(process.env.REPO_DIR)) {
    return process.env.REPO_DIR;
  }
  const fromCli = path.resolve(__dirname, "../..");
  if (existsSync(path.join(fromCli, "docker-compose.yml"))) {
    return fromCli;
  }
  const defaultVps = "/root/homelab";
  if (existsSync(path.join(defaultVps, "docker-compose.yml"))) {
    return defaultVps;
  }
  return fromCli;
}

export function getScriptsDir(): string {
  return path.join(getRepoRoot(), "scripts");
}

export function scriptPath(name: string): string {
  return path.join(getScriptsDir(), name);
}

export function readAppUrl(): string | null {
  try {
    const envPath = path.join(getRepoRoot(), ".env");
    if (!existsSync(envPath)) return null;
    const line = readFileSync(envPath, "utf8")
      .split("\n")
      .find((l) => l.startsWith("APP_URL="));
    return line ? line.slice("APP_URL=".length).trim() : null;
  } catch {
    return null;
  }
}
