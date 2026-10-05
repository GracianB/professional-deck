[CmdletBinding()]
param(
    [string]$ExpectedBranch = "main"
)

$ErrorActionPreference = "Stop"

$repoRoot = Split-Path -Parent $PSScriptRoot
Set-Location $repoRoot

function Step([string]$Name) {
    Write-Host ""
    Write-Host "============================================================" -ForegroundColor Cyan
    Write-Host " $Name" -ForegroundColor Cyan
    Write-Host "============================================================" -ForegroundColor Cyan
}

function Fail([string]$Message) {
    Write-Host ""
    Write-Host "FAIL: $Message" -ForegroundColor Red
    exit 1
}

Step "PROFESSIONAL DECK · LOCAL QUALITY RUNNER"

$branch = (git branch --show-current).Trim()
if ($LASTEXITCODE -ne 0 -or [string]::IsNullOrWhiteSpace($branch)) {
    Fail "No se pudo determinar la rama actual."
}

Write-Host "BRANCH : $branch" -ForegroundColor Gray

if ($branch -ne $ExpectedBranch) {
    Fail "Rama inesperada. Esperada: $ExpectedBranch · Actual: $branch"
}

$localSha = (git rev-parse HEAD).Trim()
if ($LASTEXITCODE -ne 0) {
    Fail "No se pudo determinar HEAD local."
}

$remoteLine = git ls-remote origin "refs/heads/$branch"
if ($LASTEXITCODE -ne 0 -or [string]::IsNullOrWhiteSpace($remoteLine)) {
    Fail "No se pudo leer origin/$branch."
}

$remoteSha = (($remoteLine -split "\s+")[0]).Trim()

Write-Host "LOCAL  : $localSha" -ForegroundColor Gray
Write-Host "GITHUB : $remoteSha" -ForegroundColor Gray

if ($localSha -ne $remoteSha) {
    Fail "LOCAL != GITHUB. Sincroniza desde origin/$branch antes de validar."
}

Write-Host "SOURCE OF TRUTH : PASS" -ForegroundColor Green

Step "WORKTREE"

$status = @(git status --porcelain)
if ($status.Count -gt 0) {
    Write-Host "CAMBIOS DETECTADOS:" -ForegroundColor Yellow
    $status
    Fail "El worktree contiene cambios. No se modifica ni borra nada automáticamente."
}

Write-Host "WORKTREE : CLEAN" -ForegroundColor Green

Step "DEPENDENCIAS"

npm ci
if ($LASTEXITCODE -ne 0) {
    Fail "npm ci ha fallado."
}

Write-Host "npm ci : PASS" -ForegroundColor Green

Step "CHROMIUM"

npx playwright install chromium
if ($LASTEXITCODE -ne 0) {
    Fail "La instalación de Chromium ha fallado."
}

Write-Host "Chromium : PASS" -ForegroundColor Green

Step "QUALITY SUITE"

npm run quality
if ($LASTEXITCODE -ne 0) {
    Fail "npm run quality ha fallado."
}

Write-Host "QUALITY : PASS" -ForegroundColor Green

Step "FINAL INTEGRITY"

$finalSha = (git rev-parse HEAD).Trim()
$finalStatus = @(git status --porcelain)

Write-Host "LOCAL  : $finalSha" -ForegroundColor Gray
Write-Host "GITHUB : $remoteSha" -ForegroundColor Gray

if ($finalSha -ne $remoteSha) {
    Fail "HEAD ha cambiado durante la validación."
}

if ($finalStatus.Count -gt 0) {
    Write-Host "CAMBIOS POST-TEST:" -ForegroundColor Yellow
    $finalStatus
    Fail "La validación ha dejado cambios en el worktree."
}

Write-Host ""
Write-Host "LOCAL = GITHUB : PASS" -ForegroundColor Green
Write-Host "WORKTREE       : CLEAN" -ForegroundColor Green
Write-Host "PUSH           : NO" -ForegroundColor Yellow
Write-Host "MERGE          : NO" -ForegroundColor Yellow
Write-Host "PR             : NO" -ForegroundColor Yellow
Write-Host ""
Write-Host "PROFESSIONAL DECK QUALITY : PASS" -ForegroundColor Green
