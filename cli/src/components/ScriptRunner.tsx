import React, { useEffect, useState } from "react";
import { Box, Text, useInput } from "ink";
import { Spinner } from "@inkjs/ui";
import { LogPanel } from "./LogPanel.js";
import { theme } from "../theme.js";
import { runScript } from "../lib/runScript.js";

interface ScriptRunnerProps {
  title: string;
  scriptPath: string;
  cwd?: string;
  env?: Record<string, string>;
  onDone: (success: boolean) => void;
  onBack?: () => void;
}

export function ScriptRunner({
  title,
  scriptPath,
  cwd,
  env,
  onDone,
  onBack,
}: ScriptRunnerProps) {
  const [lines, setLines] = useState<string[]>([]);
  const [running, setRunning] = useState(true);
  const [exitCode, setExitCode] = useState<number | null>(null);

  useInput((input, key) => {
    if (!running && (input === "\r" || key.return || input === "q" || key.escape)) {
      onBack?.();
    }
  });

  useEffect(() => {
    let cancelled = false;

    (async () => {
      setLines([`▶ ${title}`]);
      const result = await runScript({
        script: scriptPath,
        cwd,
        env,
        onLine: (line, stream) => {
          if (!cancelled) {
            setLines((prev) => [...prev, stream === "stderr" ? `[!] ${line}` : line]);
          }
        },
      });
      if (!cancelled) {
        setExitCode(result.exitCode);
        setRunning(false);
        onDone(result.exitCode === 0);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [scriptPath, cwd, title]);

  return (
    <Box flexDirection="column">
      {running ? (
        <Box>
          <Spinner label={title} />
        </Box>
      ) : (
        <Text color={exitCode === 0 ? theme.success : theme.error}>
          {exitCode === 0 ? "✓ Готово" : `✗ Ошибка (код ${exitCode})`}
        </Text>
      )}
      <LogPanel lines={lines} maxLines={14} />
      {!running && (
        <Text color={theme.muted}>Enter — в меню{onBack ? "  ·  q — назад" : ""}</Text>
      )}
    </Box>
  );
}
