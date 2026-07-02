import React, { useEffect, useState } from "react";
import { Box, Text, useInput } from "ink";
import { Header } from "../components/Header.js";
import { theme } from "../theme.js";
import { allCriticalPassed, runPreflightChecks, type PreflightCheck } from "../lib/preflight.js";

interface PreflightScreenProps {
  onBack: () => void;
}

export function PreflightScreen({ onBack }: PreflightScreenProps) {
  const [checks, setChecks] = useState<PreflightCheck[] | null>(null);
  const [loading, setLoading] = useState(true);

  useInput((input, key) => {
    if (!loading && (input === "\r" || key.return || key.escape)) {
      onBack();
    }
  });

  useEffect(() => {
    runPreflightChecks().then((result) => {
      setChecks(result);
      setLoading(false);
    });
  }, []);

  return (
    <Box flexDirection="column">
      <Header subtitle="Проверка окружения" />
      {loading ? (
        <Text color={theme.stone}>Проверяем...</Text>
      ) : (
        checks?.map((c) => (
          <Box key={c.id}>
            <Text color={c.ok ? theme.success : theme.error}>{c.ok ? "✓" : "✗"} </Text>
            <Text color={theme.espresso}>{c.label}: </Text>
            <Text color={theme.stone}>{c.detail}</Text>
          </Box>
        ))
      )}
      {!loading && checks && (
        <Box marginTop={1} flexDirection="column">
          <Text color={allCriticalPassed(checks) ? theme.success : theme.error}>
            {allCriticalPassed(checks)
              ? "Критичные проверки пройдены"
              : "Есть проблемы — см. docs/QUICKSTART-RU.md"}
          </Text>
          <Text color={theme.muted}>Enter — в меню</Text>
        </Box>
      )}
    </Box>
  );
}
