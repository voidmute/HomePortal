import { execa } from "execa";

export interface RunScriptOptions {
  script: string;
  args?: string[];
  cwd?: string;
  env?: Record<string, string>;
  onLine?: (line: string, stream: "stdout" | "stderr") => void;
}

export interface RunScriptResult {
  exitCode: number;
  stdout: string;
  stderr: string;
}

export async function runScript(options: RunScriptOptions): Promise<RunScriptResult> {
  const { script, args = [], cwd, env, onLine } = options;
  let stdout = "";
  let stderr = "";

  const child = execa("bash", [script, ...args], {
    cwd,
    env: { ...process.env, ...env },
    reject: false,
    all: false,
  });

  child.stdout?.on("data", (chunk: Buffer) => {
    const text = chunk.toString();
    stdout += text;
    for (const line of text.split("\n").filter(Boolean)) {
      onLine?.(line, "stdout");
    }
  });

  child.stderr?.on("data", (chunk: Buffer) => {
    const text = chunk.toString();
    stderr += text;
    for (const line of text.split("\n").filter(Boolean)) {
      onLine?.(line, "stderr");
    }
  });

  const result = await child;
  return {
    exitCode: result.exitCode ?? 1,
    stdout,
    stderr,
  };
}

export async function runCommand(
  command: string,
  args: string[],
  options?: { cwd?: string; onLine?: RunScriptOptions["onLine"] }
): Promise<RunScriptResult> {
  let stdout = "";
  let stderr = "";

  const child = execa(command, args, {
    cwd: options?.cwd,
    reject: false,
  });

  child.stdout?.on("data", (chunk: Buffer) => {
    const text = chunk.toString();
    stdout += text;
    for (const line of text.split("\n").filter(Boolean)) {
      options?.onLine?.(line, "stdout");
    }
  });

  child.stderr?.on("data", (chunk: Buffer) => {
    const text = chunk.toString();
    stderr += text;
    for (const line of text.split("\n").filter(Boolean)) {
      options?.onLine?.(line, "stderr");
    }
  });

  const result = await child;
  return {
    exitCode: result.exitCode ?? 1,
    stdout,
    stderr,
  };
}
