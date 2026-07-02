import React from "react";
import { Box, Text } from "ink";
import { Select } from "@inkjs/ui";
import { Header } from "../components/Header.js";
import { theme } from "../theme.js";

export type MenuAction =
  | "install"
  | "deploy"
  | "status"
  | "logs"
  | "reinstall"
  | "tunnel"
  | "preflight"
  | "exit";

interface MainMenuProps {
  onSelect: (action: MenuAction) => void;
}

const items: { label: string; value: MenuAction }[] = [
  { label: "Первая установка", value: "install" },
  { label: "Обновить портал", value: "deploy" },
  { label: "Статус системы", value: "status" },
  { label: "Логи контейнеров", value: "logs" },
  { label: "Переустановить (данные сохранятся)", value: "reinstall" },
  { label: "Настроить Cloudflare Tunnel", value: "tunnel" },
  { label: "Проверка GitHub / окружения", value: "preflight" },
  { label: "Выход", value: "exit" },
];

export function MainMenu({ onSelect }: MainMenuProps) {
  return (
    <Box flexDirection="column">
      <Header subtitle="Семейный портал — панель управления" />
      <Text color={theme.amber} bold>
        Выберите действие
      </Text>
      <Box marginTop={1}>
        <Select
          options={items}
          onChange={(value) => onSelect(value as MenuAction)}
        />
      </Box>
      <Box marginTop={1}>
        <Text color={theme.muted}>↑↓ Enter — выбор</Text>
      </Box>
    </Box>
  );
}
