import os from "node:os";
import { runCommand } from "./runScript.js";

export interface PreflightCheck {
  id: string;
  label: string;
  ok: boolean;
  detail: string;
}

export const isWindows = process.platform === "win32";
export const isMac = process.platform === "darwin";

const REPO_URL = process.env.REPO_URL ?? "https://github.com/voidmute/HomePortal";

async function checkPrivileges(): Promise<PreflightCheck> {
  if (isWindows) {
    // Admin isn't required to manage an existing portal; it's only nice to have
    // for first-time installs. Never block the wizard on it.
    const admin = await runCommand("net", ["session"]);
    const isAdmin = admin.exitCode === 0;
    return {
      id: "priv",
      label: "Права",
      ok: true,
      detail: isAdmin
        ? "Администратор"
        : "Обычный пользователь (достаточно для управления)",
    };
  }
  const isRoot = process.getuid?.() === 0;
  return {
    id: "priv",
    label: "Права root",
    ok: isRoot,
    detail: isRoot ? "OK" : "Запустите с sudo: sudo homelab",
  };
}

async function checkOs(): Promise<PreflightCheck> {
  if (isWindows) {
    return {
      id: "os",
      label: "ОС Windows",
      ok: true,
      detail: `Windows ${os.release()}`.trim(),
    };
  }
  let ok = false;
  let detail = "Поддерживаются Ubuntu и Windows";
  try {
    const { readFileSync } = await import("node:fs");
    const osRelease = readFileSync("/etc/os-release", "utf8");
    if (/ubuntu/i.test(osRelease)) {
      ok = true;
      const version = osRelease.match(/VERSION_ID="([^"]+)"/)?.[1] ?? "";
      detail = `Ubuntu ${version}`.trim();
    }
  } catch {
    detail = "Не удалось прочитать /etc/os-release";
  }
  return { id: "os", label: "ОС Ubuntu", ok, detail };
}

async function checkGit(): Promise<PreflightCheck> {
  const git = await runCommand("git", ["--version"]);
  const ok = git.exitCode === 0;
  return {
    id: "git",
    label: "Git",
    ok,
    detail: ok
      ? git.stdout.trim()
      : isWindows
        ? "Не установлен: winget install Git.Git"
        : "Не установлен: sudo apt install git",
  };
}

async function checkRepo(): Promise<PreflightCheck> {
  // The repository is public now — no deploy key needed. We just confirm the
  // machine can reach it over HTTPS so cloning/pulling will work.
  let ok = false;
  let detail = "Недоступен";
  try {
    const res = await fetch(REPO_URL, { method: "HEAD", redirect: "follow" });
    ok = res.ok || res.status === 200;
    detail = ok ? "Публичный репозиторий доступен" : `HTTP ${res.status}`;
  } catch {
    detail = "Нет доступа к интернету";
  }
  return { id: "repo", label: "Репозиторий HomePortal", ok, detail };
}

async function checkDocker(): Promise<PreflightCheck> {
  const docker = await runCommand("docker", ["--version"]);
  const ok = docker.exitCode === 0;
  return {
    id: "docker",
    label: "Docker",
    ok,
    detail: ok
      ? docker.stdout.trim()
      : isWindows
        ? "Установите Docker Desktop"
        : "Будет установлен при первой установке",
  };
}

export async function runPreflightChecks(): Promise<PreflightCheck[]> {
  return Promise.all([
    checkPrivileges(),
    checkOs(),
    checkGit(),
    checkRepo(),
    checkDocker(),
  ]);
}

export function allCriticalPassed(checks: PreflightCheck[]): boolean {
  return checks.filter((c) => c.id !== "docker").every((c) => c.ok);
}
