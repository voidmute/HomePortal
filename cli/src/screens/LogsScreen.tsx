import React, { useState } from "react";
import { Box, Text, useInput } from "ink";
import { Select } from "@inkjs/ui";
import { Header } from "../components/Header.js";
import { LogPanel } from "../components/LogPanel.js";
import { theme } from "../theme.js";
import { getRepoRoot } from "../lib/env.js";
import { runCommand } from "../lib/runScript.js";

interface LogsScreenProps {
  onBack: () => void;
}

type LogTarget = "app" | "postgres" | "redis" | "cloudflared";

const options: { label: string; value: LogTarget }[] = [
  { label: "Приложение (app)", value: "app" },
  { label: "PostgreSQL", value: "postgres" },
  { label: "Redis", value: "redis" },
  { label: "Cloudflare (journalctl)", value: "cloudflared" },
];

export function LogsScreen({ onBack }: LogsScreenProps) {
  const [target, setTarget] = useState<LogTarget | null>(null);
  const [lines, setLines] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);

  useInput((input, key) => {
    if (!loading && target && (input === "\r" || key.return || key.escape || input === "q")) {
      onBack();
    }
    if (!loading && !target && key.escape) {
      onBack();
    }
  });

  async function fetchLogs(t: LogTarget) {
    setLoading(true);
    setLines([]);
    const repo = getRepoRoot();

    if (t === "cloudflared") {
      const result = await runCommand("journalctl", ["-u", "cloudflared", "-n", "40", "--no-pager"]);
      setLines(result.stdout.split("\n").filter(Boolean));
    } else {
      const service = t === "app" ? "app" : t === "postgres" ? "postgres" : "redis";
      const result = await runCommand(
        "docker",
        ["compose", "logs", "--tail", "40", service],
        { cwd: repo }
      );
      setLines((result.stdout + result.stderr).split("\n").filter(Boolean));
    }
    setLoading(false);
  }

  if (!target) {
    return (
      <Box flexDirection="column">
        <Header subtitle="Логи" />
        <Select
          options={options}
          onChange={(value) => {
            const t = value as LogTarget;
            setTarget(t);
            fetchLogs(t);
          }}
        />
        <Text color={theme.muted}>Esc — в меню</Text>
      </Box>
    );
  }

  return (
    <Box flexDirection="column">
      <Header subtitle={`Логи: ${target}`} />
      {loading ? (
        <Text color={theme.stone}>Загрузка...</Text>
      ) : (
        <LogPanel lines={lines} maxLines={18} />
      )}
      {!loading && <Text color={theme.muted}>Enter / q — в меню</Text>}
    </Box>
  );
}
