import React from "react";
import { Box, Text } from "ink";
import Gradient from "ink-gradient";
import BigText from "ink-big-text";
import { theme } from "../theme.js";

interface HeaderProps {
  subtitle?: string;
}

export function Header({ subtitle = "Панель управления сервером" }: HeaderProps) {
  return (
    <Box flexDirection="column" marginBottom={1}>
      <Gradient name="morning">
        <BigText text="HomePortal" font="block" />
      </Gradient>
      <Text color={theme.stone}>{subtitle}</Text>
      <Text color={theme.muted}>{"─".repeat(42)}</Text>
    </Box>
  );
}
