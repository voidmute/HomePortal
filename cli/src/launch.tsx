import React from "react";
import { render } from "ink";
import { App } from "./App.js";

export type Platform = "linux" | "windows";

/**
 * Shared launcher for both platform entry points. The React/Ink app itself is
 * identical across platforms; only the pre-flight guard differs:
 *   - Linux requires root (Docker, systemd, firewall, tunnel setup need it).
 *   - Windows never requires elevation; admin is only a nice-to-have.
 */
export function launch(platform: Platform): void {
  if (platform === "linux") {
    if (process.getuid && process.getuid() !== 0) {
      console.error(
        "\n  Запустите HomePortal CLI с правами root:\n" +
          "  sudo homelab\n\n" +
          "  Если команда ещё не установлена:\n" +
          "  cd /root/homelab && sudo bash install-homelab.sh\n"
      );
      process.exit(1);
    }
  }

  render(<App />);
}
