import React from "react";
import { Box, Text } from "ink";
import { theme } from "../theme.js";

interface StepProgressProps {
  current: number;
  total: number;
  label: string;
}

export function StepProgress({ current, total, label }: StepProgressProps) {
  return (
    <Box marginBottom={1}>
      <Text color={theme.amber}>
        Шаг {current}/{total}
      </Text>
      <Text color={theme.stone}> — {label}</Text>
    </Box>
  );
}
