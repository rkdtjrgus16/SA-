# run-dev.ps1
# 한글/공백 경로 문제를 우회하여 ASCII 경로(%USERPROFILE%\my-shop)로 복사 후 dev 서버를 띄우는 헬퍼.
# 사용법: PowerShell 에서 ./run-dev.ps1

$ErrorActionPreference = 'Stop'

$src = $PSScriptRoot
$dst = Join-Path $HOME 'my-shop'

Write-Host "📂 소스: $src"
Write-Host "📂 대상: $dst"

if (-not (Test-Path $dst)) {
  New-Item -ItemType Directory -Path $dst | Out-Null
}

Write-Host "📥 파일 동기화 중 (node_modules 제외)..."
robocopy $src $dst /E /XD node_modules /NFL /NDL /NJH /NJS /NC /NS /NP | Out-Null

Set-Location $dst

if (-not (Get-Command npm -ErrorAction SilentlyContinue)) {
  Write-Host "❌ npm 이 PATH 에 없습니다. Node.js LTS 를 설치한 뒤 다시 시도해주세요." -ForegroundColor Red
  Write-Host "   https://nodejs.org/ko/download"
  exit 1
}

if (-not (Test-Path "$dst\node_modules")) {
  Write-Host "📦 의존성 설치 중 (--ignore-scripts) ..."
  npm install --no-audit --no-fund --ignore-scripts
}

Write-Host "🚀 Vite dev 서버 시작 (http://localhost:5173)"
npm run dev
