import { runCommand } from "./runScript.js";

export interface PreflightCheck {
  id: string;
  label: string;
  ok: boolean;
  detail: string;
}

export async function runPreflightChecks(): Promise<PreflightCheck[]> {
  const checks: PreflightCheck[] = [];

  const isRoot = process.getuid?.() === 0;
  checks.push({
    id: "root",
    label: "Права root",
    ok: isRoot,
    detail: isRoot ? "OK" : "Запустите: sudo npm run setup",
  });

  let ubuntuOk = false;
  let ubuntuDetail = "Не Ubuntu";
  try {
    const { readFileSync } = await import("node:fs");
    const osRelease = readFileSync("/etc/os-release", "utf8");
    if (/ubuntu/i.test(osRelease)) {
      ubuntuOk = true;
      const version = osRelease.match(/VERSION_ID="([^"]+)"/)?.[1] ?? "";
      ubuntuDetail = `Ubuntu ${version}`.trim();
    }
  } catch {
    ubuntuDetail = "Не удалось прочитать /etc/os-release";
  }
  checks.push({
    id: "ubuntu",
    label: "ОС Ubuntu",
    ok: ubuntuOk,
    detail: ubuntuDetail,
  });

  const git = await runCommand("git", ["--version"]);
  checks.push({
    id: "git",
    label: "Git",
    ok: git.exitCode === 0,
    detail: git.exitCode === 0 ? git.stdout.trim() : "Не установлен",
  });

  const github = await runCommand("ssh", [
    "-T",
    "-o",
    "BatchMode=yes",
    "-o",
    "StrictHostKeyChecking=accept-new",
    "git@github.com",
  ]);
  const githubOk =
    github.stderr.includes("successfully authenticated") ||
    github.stdout.includes("successfully authenticated");
  checks.push({
    id: "github",
    label: "GitHub Deploy Key",
    ok: githubOk,
    detail: githubOk
      ? "SSH ключ работает"
      : "Добавьте deploy key (см. QUICKSTART-RU.md)",
  });

  const docker = await runCommand("docker", ["--version"]);
  checks.push({
    id: "docker",
    label: "Docker",
    ok: docker.exitCode === 0,
    detail:
      docker.exitCode === 0
        ? docker.stdout.trim()
        : "Будет установлен при первой установке",
  });

  return checks;
}

export function allCriticalPassed(checks: PreflightCheck[]): boolean {
  return checks.filter((c) => c.id !== "docker").every((c) => c.ok);
}
