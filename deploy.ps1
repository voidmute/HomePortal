# deploy.ps1 - Push to GitHub and deploy on VPS (no scp / no node_modules transfer)
# Usage: copy .deploy.env.example to .deploy.env, then .\deploy.ps1
#
# First-time VPS setup:
#   See docs/QUICKSTART-RU.md
#
# If PowerShell blocks this script:
#   Set-ExecutionPolicy -Scope Process -ExecutionPolicy Bypass
#   .\deploy.ps1

$ErrorActionPreference = "Stop"
$ScriptRoot = Split-Path -Parent $MyInvocation.MyCommand.Path

$VPS_HOST = "root@your-vps-ip"
$REMOTE_PATH = "/root/homelab"
$REPO_SSH = "git@github.com:voidmute/family-home-portal.git"
$APP_DOMAIN = "portal.yourdomain.com"

$DeployEnvPath = Join-Path $ScriptRoot ".deploy.env"
if (Test-Path $DeployEnvPath) {
  Get-Content $DeployEnvPath | ForEach-Object {
    $line = $_.Trim()
    if ($line -and -not $line.StartsWith("#") -and $line -match "^([^=]+)=(.*)$") {
      Set-Variable -Name $matches[1].Trim() -Value $matches[2].Trim() -Scope Script
    }
  }
}

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  Family Home Portal - Git Deploy" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

Write-Host "[1/3] Pushing to GitHub (origin main) ..." -ForegroundColor Yellow
$status = git status --porcelain
if ($status) {
  Write-Host "  Warning: uncommitted local changes (pushing committed code only):" -ForegroundColor DarkYellow
  git status --short
}
git push origin main

Write-Host ""
Write-Host "[2/3] Ensuring git repo on VPS ..." -ForegroundColor Yellow
$bootstrap = @"
if [ ! -d '$REMOTE_PATH/.git' ]; then
  echo 'Cloning repo (first time)...'
  rm -rf '$REMOTE_PATH'
  git clone '$REPO_SSH' '$REMOTE_PATH'
fi
"@
ssh $VPS_HOST $bootstrap

Write-Host ""
Write-Host "[3/3] Running deploy-vps.sh on server ..." -ForegroundColor Yellow
$deployCmd = "cd " + $REMOTE_PATH + "; find scripts -name '*.sh' -exec sed -i 's/\r$//' {} \; -exec chmod +x {} \;; bash scripts/deploy-vps.sh"
ssh $VPS_HOST $deployCmd

Write-Host ""
Write-Host "========================================" -ForegroundColor Green
Write-Host "  Deploy complete!" -ForegroundColor Green
Write-Host "  Portal:  https://${APP_DOMAIN}" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Green
Write-Host ""
