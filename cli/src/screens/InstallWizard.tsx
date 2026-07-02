import React, { useEffect, useState } from "react";
import { Box, Text, useInput } from "ink";
import { TextInput, ConfirmInput } from "@inkjs/ui";
import { Header } from "../components/Header.js";
import { StepProgress } from "../components/StepProgress.js";
import { ScriptRunner } from "../components/ScriptRunner.js";
import { theme } from "../theme.js";
import { getRepoRoot, scriptPath } from "../lib/env.js";
import { getAuthorizedUserNames } from "../lib/users.js";
import { allCriticalPassed, isWindows, runPreflightChecks } from "../lib/preflight.js";

type WizardStep = "preflight" | "domain" | "tunnel" | "confirm" | "install" | "done";

interface InstallWizardProps {
  onBack: () => void;
}

export function InstallWizard({ onBack }: InstallWizardProps) {
  const [step, setStep] = useState<WizardStep>("preflight");
  const [domain, setDomain] = useState("");
  const [tunnelToken, setTunnelToken] = useState("");
  const [preflightOk, setPreflightOk] = useState<boolean | null>(null);
  const [appUrl, setAppUrl] = useState("");

  useInput((input, key) => {
    if (step === "done" && (input === "\r" || key.return)) {
      onBack();
    }
  });

  useEffect(() => {
    if (step === "preflight" && preflightOk === null) {
      runPreflightChecks().then((checks) => {
        setPreflightOk(allCriticalPassed(checks));
      });
    }
  }, [step, preflightOk]);

  if (step === "preflight") {
    return (
      <Box flexDirection="column">
        <Header subtitle="Мастер установки" />
        <StepProgress current={1} total={5} label="Проверка окружения" />
        {preflightOk === null ? (
          <Text color={theme.stone}>Проверяем окружение, Git и доступ к репозиторию...</Text>
        ) : preflightOk ? (
          <Box flexDirection="column">
            <Text color={theme.success}>✓ Можно продолжать</Text>
            <ConfirmInput onConfirm={() => setStep("domain")} onCancel={onBack} />
          </Box>
        ) : (
          <Box flexDirection="column">
            <Text color={theme.error}>
              {isWindows
                ? "Не все проверки пройдены. Установите Git и Docker Desktop, затем повторите."
                : "Не все проверки пройдены. Установите Git и запустите с sudo."}
            </Text>
            <Text color={theme.muted}>Подробнее: docs/QUICKSTART-RU.md</Text>
            <ConfirmInput onConfirm={onBack} onCancel={onBack} />
          </Box>
        )}
      </Box>
    );
  }

  if (step === "domain") {
    return (
      <Box flexDirection="column">
        <Header subtitle="Мастер установки" />
        <StepProgress current={2} total={5} label="Домен портала" />
        <Text color={theme.stone}>Например: portal.example.com</Text>
        <Box marginTop={1}>
          <Text color={theme.amber}>Домен: </Text>
          <TextInput
            placeholder="portal.example.com"
            onSubmit={(value) => {
              const trimmed = value.trim();
              if (trimmed) {
                setDomain(trimmed);
                setStep("tunnel");
              }
            }}
          />
        </Box>
      </Box>
    );
  }

  if (step === "tunnel") {
    return (
      <Box flexDirection="column">
        <Header subtitle="Мастер установки" />
        <StepProgress current={3} total={5} label="Cloudflare Tunnel" />
        <Text color={theme.stone}>
          Token из Zero Trust → Networks → Tunnels → Install connector
        </Text>
        <Text color={theme.muted}>Hostname в CF: http://localhost:3000</Text>
        <Box marginTop={1}>
          <Text color={theme.amber}>Token: </Text>
          <TextInput
            placeholder="eyJ... (пусто + Enter — пропустить)"
            onSubmit={(value) => {
              setTunnelToken(value.trim());
              setStep("confirm");
            }}
          />
        </Box>
      </Box>
    );
  }

  if (step === "confirm") {
    const url = `https://${domain}`;
    return (
      <Box flexDirection="column">
        <Header subtitle="Мастер установки" />
        <StepProgress current={4} total={5} label="Подтверждение" />
        <Text color={theme.espresso}>Домен: {domain}</Text>
        <Text color={theme.espresso}>URL: {url}</Text>
        <Text color={theme.espresso}>Репозиторий: {getRepoRoot()}</Text>
        <Text color={theme.espresso}>
          Tunnel: {tunnelToken ? "будет установлен" : "пропущен"}
        </Text>
        <Box marginTop={1}>
          <ConfirmInput
            onConfirm={() => setStep("install")}
            onCancel={() => setStep("tunnel")}
          />
        </Box>
      </Box>
    );
  }

  if (step === "install") {
    return (
      <Box flexDirection="column">
        <Header subtitle="Мастер установки" />
        <StepProgress current={5} total={5} label="Установка" />
        <ScriptRunner
          title="Установка портала..."
          scriptPath={scriptPath("install-portal.sh")}
          env={{
            APP_DOMAIN: domain,
            TUNNEL_TOKEN: tunnelToken,
            SETUP_NONINTERACTIVE: "1",
            REPO_DIR: getRepoRoot(),
          }}
          onDone={(ok) => {
            if (ok) {
              setAppUrl(`https://${domain}`);
              setStep("done");
            }
          }}
          onBack={onBack}
        />
      </Box>
    );
  }

  const userNames = getAuthorizedUserNames().join(" / ");

  return (
    <Box flexDirection="column">
      <Header subtitle="Готово!" />
      <Text color={theme.success} bold>
        ✓ Портал установлен
      </Text>
      <Text color={theme.amber}>Откройте: {appUrl}</Text>
      <Text color={theme.stone}>Войдите: {userNames}</Text>
      <Text color={theme.muted}>При первом входе — QR-код в Authenticator</Text>
      <Text color={theme.muted}>Enter — в меню</Text>
    </Box>
  );
}
