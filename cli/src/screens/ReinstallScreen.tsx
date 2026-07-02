import React, { useState } from "react";
import { Box, Text } from "ink";
import { ConfirmInput } from "@inkjs/ui";
import { Header } from "../components/Header.js";
import { ScriptRunner } from "../components/ScriptRunner.js";
import { scriptPath } from "../lib/env.js";
import { theme } from "../theme.js";

interface ReinstallScreenProps {
  onBack: () => void;
}

export function ReinstallScreen({ onBack }: ReinstallScreenProps) {
  const [confirmed, setConfirmed] = useState(false);

  if (!confirmed) {
    return (
      <Box flexDirection="column">
        <Header subtitle="Переустановка" />
        <Text color={theme.error}>
          Удалит папку /root/homelab и клонирует заново.
        </Text>
        <Text color={theme.stone}>Docker volumes (БД, файлы) сохранятся.</Text>
        <Box marginTop={1}>
          <ConfirmInput
            onConfirm={() => setConfirmed(true)}
            onCancel={onBack}
          />
        </Box>
      </Box>
    );
  }

  return (
    <Box flexDirection="column">
      <Header subtitle="Переустановка" />
      <ScriptRunner
        title="Переустановка..."
        scriptPath={scriptPath("reinstall-vps.sh")}
        onDone={() => {}}
        onBack={onBack}
      />
    </Box>
  );
}
