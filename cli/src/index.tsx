#!/usr/bin/env node
// Auto-detecting entry point. Prefer the platform-specific scripts
// (start:linux / start:windows); this keeps a bare `homelab` working too.
import { launch } from "./launch.js";

launch(process.platform === "win32" ? "windows" : "linux");
