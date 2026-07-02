import React, { useEffect, useState } from "react";
import { Box, Text, useInput } from "ink";
import { Header } from "../components/Header.js";
import { theme } from "../theme.js";
import { getRepoRoot } from "../lib/env.js";
import { runCommand } from "../lib/runScript.js";

interface StatusScreenProps {
  onBack: () => void;
}

export function StatusScreen({ onBack }: StatusScreenProps) {
  const [lines, setLines] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  useInput((input, key) => {
    if (!loading && (input === "\r" || key.return || key.escape)) {
      onBack();
    }
  });

  useEffect(() => {
    const repo = getRepoRoot();
    (async () => {
      const out: string[] = [];

      const ps = await runCommand("docker", ["compose", "ps"], { cwd: repo });
      out.push("=== Docker Compose ===");
      out.push(ps.stdout.trim() || ps.stderr.trim() || "(нет данных)");

      const health = await runCommand("curl", ["-sf", "http://127.0.0.1:3000/api/health"], {
        cwd: repo,
      });
      out.push("");
      out.push("=== Health ===");
      out.push(
        health.exitCode === 0
          ? health.stdout.trim()
          : "Недоступен (код " + health.exitCode + ")"
      );

      const cf = await runCommand("systemctl", ["is-active", "cloudflared"]);
      out.push("");
      out.push("=== Cloudflare Tunnel ===");
      out.push(cf.stdout.trim() || "не установлен / inactive");

      setLines(out);
      setLoading(false);
    })();
  }, []);

  return (
    <Box flexDirection="column">
      <Header subtitle="Статус системы" />
      {loading ? (
        <Text color={theme.stone}>Собираем статус...</Text>
      ) : (
        lines.map((line, i) => (
          <Text key={i} color={line.startsWith("===") ? theme.amber : theme.stone}>
            {line || " "}
          </Text>
        ))
      )}
      {!loading && <Text color={theme.muted}>Enter — в меню</Text>}
    </Box>
  );
}
