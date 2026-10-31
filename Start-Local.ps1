param([int]$Port = 3000)
$ErrorActionPreference = 'Stop'
$env:PORT = [string]$Port
Set-Location -LiteralPath $PSScriptRoot
if (-not (Get-Command node -ErrorAction SilentlyContinue)) { throw 'Install Node.js 22.18+ or Node.js 24 LTS, then run this script again.' }
if (-not (Test-Path -LiteralPath 'node_modules')) {
  & npm.cmd exec --yes --package=pnpm@10 -- pnpm install --frozen-lockfile
  if ($LASTEXITCODE -ne 0) { throw 'Dependency installation failed.' }
}
& npm.cmd exec --yes --package=pnpm@10 -- pnpm build:local
if ($LASTEXITCODE -ne 0) { throw 'The frontend build failed.' }
& npm.cmd exec --yes --package=pnpm@10 -- pnpm --filter @workspace/toolkit serve
