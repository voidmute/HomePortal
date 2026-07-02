import React, { useState } from "react";
import { useApp } from "ink";
import { MainMenu, type MenuAction } from "./screens/MainMenu.js";
import { InstallWizard } from "./screens/InstallWizard.js";
import { DeployScreen } from "./screens/DeployScreen.js";
import { StatusScreen } from "./screens/StatusScreen.js";
import { LogsScreen } from "./screens/LogsScreen.js";
import { ReinstallScreen } from "./screens/ReinstallScreen.js";
import { TunnelScreen } from "./screens/TunnelScreen.js";
import { PreflightScreen } from "./screens/PreflightScreen.js";

export type Screen =
  | "menu"
  | "install"
  | "deploy"
  | "status"
  | "logs"
  | "reinstall"
  | "tunnel"
  | "preflight";

export function App() {
  const { exit } = useApp();
  const [screen, setScreen] = useState<Screen>("menu");

  function goMenu() {
    setScreen("menu");
  }

  function handleMenuSelect(action: MenuAction) {
    if (action === "exit") {
      exit();
      return;
    }
    setScreen(action);
  }

  switch (screen) {
    case "install":
      return <InstallWizard onBack={goMenu} />;
    case "deploy":
      return <DeployScreen onBack={goMenu} />;
    case "status":
      return <StatusScreen onBack={goMenu} />;
    case "logs":
      return <LogsScreen onBack={goMenu} />;
    case "reinstall":
      return <ReinstallScreen onBack={goMenu} />;
    case "tunnel":
      return <TunnelScreen onBack={goMenu} />;
    case "preflight":
      return <PreflightScreen onBack={goMenu} />;
    default:
      return <MainMenu onSelect={handleMenuSelect} />;
  }
}
