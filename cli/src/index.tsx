#!/usr/bin/env node
import React from "react";
import { render } from "ink";
import { App } from "./App.js";

if (process.getuid && process.getuid() !== 0) {
  console.error(
    "\n  Запустите HomePortal CLI с правами root:\n  sudo homelab\n\n  Если команда ещё не установлена:\n  cd /root/homelab && sudo bash install-homelab.sh\n"
  );
  process.exit(1);
}

render(<App />);
