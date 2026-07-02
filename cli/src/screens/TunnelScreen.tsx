import React, { useState } from "react";
import { Box, Text } from "ink";
import { TextInput } from "@inkjs/ui";
import { Header } from "../components/Header.js";
import { ScriptRunner } from "../components/ScriptRunner.js";
import { scriptPath } from "../lib/env.js";
import { theme } from "../theme.js";

interface TunnelScreenProps {
  onBack: () => void;
}

export function TunnelScreen({ onBack }: TunnelScreenProps) {
  const [token, setToken] = useState<string | null>(null);

  if (!token) {
    return (
      <Box flexDirection="column">
        <Header subtitle="Cloudflare Tunnel" />
        <Text color={theme.stone}>
          Token: Zero Trust → Networks → Tunnels → Install connector
        </Text>
        <Text color={theme.muted}>Service URL в CF: http://localhost:3000</Text>
        <Box marginTop={1}>
          <Text color={theme.amber}>Token: </Text>
          <TextInput
            placeholder="eyJ..."
            onSubmit={(value) => {
              if (value.trim()) setToken(value.trim());
            }}
          />
        </Box>
      </Box>
    );
  }

  return (
    <Box flexDirection="column">
      <Header subtitle="Cloudflare Tunnel" />
      <ScriptRunner
        title="Устанавливаем cloudflared..."
        scriptPath={scriptPath("install-cloudflared.sh")}
        env={{ TUNNEL_TOKEN: token }}
        onDone={() => {}}
        onBack={onBack}
      />
    </Box>
  );
}
