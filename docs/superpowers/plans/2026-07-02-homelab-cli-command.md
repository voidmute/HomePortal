# Homelab CLI Command Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Let an Ubuntu end-user clone the repository, run one installer, then type `sudo homelab` from anywhere to open the HomePortal CLI setup wizard.

**Architecture:** Add a root installer (`install-homelab.sh`) that installs a small global launcher into `/usr/local/bin/homelab`. The launcher keeps the repo path baked in, normalizes line endings, installs Node/CLI dependencies when missing, and opens the existing Ink CLI (`npm run start --prefix cli`) from the correct repository directory.

**Tech Stack:** Bash, npm/Node 20, existing Ink CLI, Vitest static/behavior tests.

---

### Task 1: Test Installer And Launcher Contract

**Files:**
- Create: `scripts/homelab-command.test.ts`
- Modify: `vitest.config.ts`

- [ ] **Step 1: Write failing tests**

Add tests that assert:
- `install-homelab.sh` exists and writes a `homelab` executable to a configurable bin dir.
- The installed launcher contains the current repo path.
- `scripts/homelab-launcher.sh` exists and launches `npm run start --prefix cli`.
- Both scripts communicate the intended `sudo homelab` flow.

- [ ] **Step 2: Run targeted test to verify RED**

Run: `npx vitest run scripts/homelab-command.test.ts`

Expected: FAIL because `install-homelab.sh` and `scripts/homelab-launcher.sh` do not exist yet.

### Task 2: Implement Installer And Launcher

**Files:**
- Create: `install-homelab.sh`
- Create: `scripts/homelab-launcher.sh`

- [ ] **Step 1: Implement root installer**

`install-homelab.sh` should:
- Require Ubuntu.
- Require root, unless tests set `HOMELAB_ALLOW_NON_ROOT=1`.
- Install `git`, `curl`, `ca-certificates`.
- Install Node.js 20 if missing.
- Run `npm ci` in `cli/`.
- Copy `scripts/homelab-launcher.sh` to `${HOMELAB_BIN_DIR:-/usr/local/bin}/homelab`.
- Replace a `__HOMELAB_REPO_DIR__` token with the absolute repo path.
- Mark the launcher executable.

- [ ] **Step 2: Implement global launcher**

`scripts/homelab-launcher.sh` should:
- Resolve its baked-in repo dir.
- Require root with a friendly `sudo homelab` message.
- Normalize shell script line endings in the repo.
- Install CLI dependencies if `cli/node_modules` is missing.
- Execute `npm run start --prefix cli`.

- [ ] **Step 3: Run targeted test to verify GREEN**

Run: `npx vitest run scripts/homelab-command.test.ts`

Expected: PASS.

### Task 3: Update CLI Copy And Documentation

**Files:**
- Modify: `cli/src/index.tsx`
- Modify: `README.md`
- Modify: `docs/QUICKSTART-RU.md`

- [ ] **Step 1: Update root warning**

Change the CLI root warning from `sudo npm run setup` to `sudo homelab` with a fallback for repo-local launch.

- [ ] **Step 2: Update docs**

Document the end-user flow:

```bash
git clone git@github.com:voidmute/family-home-portal.git /root/homelab
cd /root/homelab
sudo bash install-homelab.sh
sudo homelab
```

### Task 4: Verification And Publish

**Files:**
- Verify all changed files.

- [ ] **Step 1: Run checks**

Run:
- `npx vitest run scripts/homelab-command.test.ts`
- `npm run build`
- `npm test`
- `npm run lint`

- [ ] **Step 2: Secret check**

Confirm `.env`, `.kyto.config`, `android/keystore/release.keystore`, and `android/keystore.properties` are ignored and not staged.

- [ ] **Step 3: Commit and push**

Commit with message:

```bash
feat: add global homelab setup command
```

Push to `origin/main`.
