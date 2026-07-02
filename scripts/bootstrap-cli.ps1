# Bootstrap the HomePortal CLI on Windows. No manual git needed: this fetches the
# repo and launches the interactive CLI for you.
#
# Usage:
#   irm https://raw.githubusercontent.com/voidmute/HomePortal/main/scripts/bootstrap-cli.ps1 | iex
#
# The repository is public, so no credentials are needed.

$ErrorActionPreference = "Stop"

$RepoUrl = if ($env:REPO_URL) { $env:REPO_URL } else { "https://github.com/voidmute/HomePortal.git" }
$RepoDir = if ($env:REPO_DIR) { $env:REPO_DIR } else { Join-Path $HOME "homelab" }

Write-Host "========================================"
Write-Host "  HomePortal - CLI Bootstrap (Windows)"
Write-Host "========================================"

function Test-Cmd($name) { [bool](Get-Command $name -ErrorAction SilentlyContinue) }

function Install-With-Winget($id, $probe) {
  if (Test-Cmd $probe) { return }
  if (-not (Test-Cmd "winget")) {
    throw "$probe is required and winget is unavailable. Install $probe manually, then re-run."
  }
  Write-Host "==> Installing $id..."
  winget install --id $id -e --silent --accept-source-agreements --accept-package-agreements
  $env:Path = [System.Environment]::GetEnvironmentVariable("Path", "Machine") + ";" +
              [System.Environment]::GetEnvironmentVariable("Path", "User")
}

Install-With-Winget "Git.Git" "git"
Install-With-Winget "OpenJS.NodeJS.LTS" "node"

Write-Host ("Node {0} - npm {1}" -f (node -v), (npm -v))

if (-not (Test-Path (Join-Path $RepoDir ".git"))) {
  Write-Host "==> Cloning repository to $RepoDir..."
  git clone $RepoUrl $RepoDir
  if ($LASTEXITCODE -ne 0) {
    Write-Host ""
    Write-Host "Clone failed. Check your network connection and that git is installed, then re-run."
    exit 1
  }
} else {
  Write-Host "==> Repository already at $RepoDir"
}

Write-Host "==> Installing CLI dependencies..."
npm --prefix (Join-Path $RepoDir "cli") install

Write-Host "==> Launching HomePortal CLI..."
npm --prefix (Join-Path $RepoDir "cli") run start:windows
