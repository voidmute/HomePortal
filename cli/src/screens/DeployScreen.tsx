import React from "react";
import { Box, Text, useInput } from "ink";
import { Header } from "../components/Header.js";
import { ScriptRunner } from "../components/ScriptRunner.js";
import { getRepoRoot, scriptPath } from "../lib/env.js";
import { theme } from "../theme.js";

interface DeployScreenProps {
  onBack: () => void;
}

export function DeployScreen({ onBack }: DeployScreenProps) {
  useInput((input, key) => {
    if (input === "q" || key.escape) onBack();
  });

  return (
    <Box flexDirection="column">
      <Header subtitle="Обновление портала" />
      <Text color={theme.stone}>git pull + docker compose build</Text>
      <ScriptRunner
        title="Обновляем..."
        scriptPath={scriptPath("deploy-vps.sh")}
        cwd={getRepoRoot()}
        onDone={() => {}}
        onBack={onBack}
      />
    </Box>
  );
}
