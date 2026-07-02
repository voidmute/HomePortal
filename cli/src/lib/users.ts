import { readFileSync, existsSync } from "node:fs";
import { join } from "node:path";
import { getRepoRoot } from "./env.js";

export function getAuthorizedUserNames(): string[] {
  const path = join(getRepoRoot(), "generated", "users.json");
  if (!existsSync(path)) {
    return ["alice", "bob", "carol"];
  }
  try {
    const raw = readFileSync(path, "utf8");
    const parsed = JSON.parse(raw) as string[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return ["alice", "bob", "carol"];
  }
}
