import { readFileSync } from "node:fs";
import path from "node:path";
import { describe, expect, test } from "vitest";

const repoRoot = path.resolve(__dirname, "..");
const installScript = path.join(repoRoot, "install-homelab.sh");
const launcherTemplate = path.join(repoRoot, "scripts", "homelab-launcher.sh");

function readRepoFile(relativePath: string) {
  return readFileSync(path.join(repoRoot, relativePath), "utf8");
}

describe("homelab end-user command", () => {
  test("installer creates a global executable homelab launcher from the template", () => {
    const installer = readRepoFile("install-homelab.sh");

    expect(installer).toContain("HOMELAB_BIN_DIR");
    expect(installer).toContain("scripts/homelab-launcher.sh");
    expect(installer).toContain("__HOMELAB_REPO_DIR__");
    expect(installer).toContain("chmod +x");
    expect(installer).toContain("homelab");
  });

  test("installer and launcher document the sudo homelab flow", () => {
    const installer = readRepoFile("install-homelab.sh");
    const launcher = readFileSync(launcherTemplate, "utf8");

    expect(installer).toContain("sudo homelab");
    expect(installer).toContain("HOMELAB_BIN_DIR");
    expect(installer).toContain("__HOMELAB_REPO_DIR__");
    expect(launcher).toContain("Run: sudo homelab");
    expect(launcher).toContain("npm run start --prefix cli");
  });

  test("bootstrap installs the global command and then launches homelab", () => {
    const bootstrap = readRepoFile("scripts/bootstrap-cli.sh");

    expect(bootstrap).toContain("bash \"$REPO/install-homelab.sh\"");
    expect(bootstrap).toContain("exec homelab");
  });
});
