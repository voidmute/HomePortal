#!/usr/bin/env node
// Cross-platform wrapper around `kura compile` (the Kyto config compiler,
// https://github.com/voidmute/kyto). Used by the predev/prebuild npm hooks so
// they work the same on Windows/macOS/Linux dev machines and inside the
// Docker build, without depending on PATH resolution order (a machine can
// have a stale/unrelated "kura" earlier on PATH — resolve deterministically
// instead). Mirrors the logic in scripts/kura-resolve.sh (used by the bash
// deploy scripts) but needs no bash/shell to run.
const { execFileSync } = require("node:child_process");
const { existsSync } = require("node:fs");
const path = require("node:path");
const os = require("node:os");

const repoRoot = path.resolve(__dirname, "..");
const isWindows = process.platform === "win32";

function resolveOnPath(bin) {
  const dirs = (process.env.PATH || "").split(path.delimiter);
  const exts = isWindows ? (process.env.PATHEXT || ".EXE;.CMD;.BAT").split(";") : [""];
  for (const dir of dirs) {
    for (const ext of exts) {
      const candidate = path.join(dir, bin + ext);
      if (existsSync(candidate)) return candidate;
    }
  }
  return null;
}

const candidates = [
  path.join(repoRoot, "bin", "kura-asm" + (isWindows ? ".exe" : "")),
  resolveOnPath("kura"),
  path.join(os.homedir(), ".cache", "kyto", "kura"),
  path.join(os.homedir(), ".local", "bin", "kura" + (isWindows ? ".exe" : "")),
].filter(Boolean);

const kura = candidates.find((candidate) => existsSync(candidate));

if (!kura) {
  console.error("kura (the Kyto config compiler) was not found.");
  console.error("Install it: https://github.com/voidmute/kyto/wiki/Installing-Kyto");
  console.error(`Checked: ${candidates.join(", ")}`);
  process.exit(1);
}

try {
  execFileSync(kura, ["compile"], { stdio: "inherit", cwd: repoRoot });
} catch (err) {
  process.exit(typeof err.status === "number" ? err.status : 1);
}
