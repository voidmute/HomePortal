import React from "react";
import { Box, Text } from "ink";
import { theme, box } from "../theme.js";

interface LogPanelProps {
  lines: string[];
  maxLines?: number;
}

export function LogPanel({ lines, maxLines = 12 }: LogPanelProps) {
  const visible = lines.slice(-maxLines);

  return (
    <Box
      flexDirection="column"
      borderStyle="single"
      borderColor={theme.stone}
      paddingX={1}
      marginY={1}
    >
      <Text color={theme.amberDark}>Журнал</Text>
      {visible.length === 0 ? (
        <Text color={theme.muted}>Ожидание вывода...</Text>
      ) : (
        visible.map((line, i) => (
          <Text key={`${i}-${line.slice(0, 20)}`} wrap="truncate">
            {line}
          </Text>
        ))
      )}
      <Text color={theme.muted}>
        {box.bottom}
        {box.line.repeat(38)}
      </Text>
    </Box>
  );
}
