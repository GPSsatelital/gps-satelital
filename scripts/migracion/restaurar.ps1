# RESTAURAR — deja el otro PC exactamente como estaba el primero.
#
# Se corre en el PC NUEVO, con la memoria conectada y Claude CERRADO.
#
#   powershell -ExecutionPolicy Bypass -File repo\scripts\migracion\restaurar.ps1
#
# El script se ubica solo: sabe que está dentro del paquete y busca las carpetas hermanas.
# Si ya había algo en ese PC, hace una copia de respaldo antes de sobreescribir.

param(
  [string]$Paquete,                 # si no se pasa, se deduce de dónde está este archivo
  [switch]$SinRespaldo              # -SinRespaldo para no guardar copia de lo que había
)

$ErrorActionPreference = "Stop"

# El paquete es la carpeta que contiene repo\, claude\, mempalace\...
if (-not $Paquete) { $Paquete = Split-Path (Split-Path (Split-Path $PSScriptRoot -Parent) -Parent) -Parent }

$Repo      = "C:\Users\USER\Documents\GitHub\gps-satelital"
$ClaudeDir = "C:\Users\USER\.claude"
$Proyecto  = "C--Users-USER-Documents-GitHub-gps-satelital"
$Fecha     = Get-Date -Format "yyyy-MM-dd_HHmm"

Write-Host ""
Write-Host "  RESTAURANDO MOTOGESTION" -ForegroundColor Cyan
Write-Host "  desde: $Paquete"
Write-Host ""

# ── Los dos requisitos que no se pueden saltar ────────────────────────────────────────────────
if ($env:USERNAME -ne "USER") {
  Write-Host "  PARA. El usuario de Windows de este PC se llama '$env:USERNAME', no 'USER'." -ForegroundColor Red
  Write-Host "  Las memorias se guardan con la ruta escrita adentro del nombre de la carpeta" -ForegroundColor Red
  Write-Host "  ($Proyecto), asi que con otro usuario NO se van a encontrar." -ForegroundColor Red
  Write-Host ""
  Write-Host "  Solucion: crea en Windows un usuario llamado USER y corre esto desde ahi." -ForegroundColor Yellow
  throw "Usuario de Windows distinto de USER."
}
if (-not (Test-Path (Join-Path $Paquete "repo"))) {
  throw "No encuentro la carpeta 'repo' dentro de $Paquete. ¿Es esta la carpeta del paquete?"
}

$claudeVivo = Get-Process -Name "Claude*" -ErrorAction SilentlyContinue
if ($claudeVivo) {
  Write-Host "  PARA. Claude esta abierto en este PC." -ForegroundColor Red
  Write-Host "  Cierralo por completo antes de restaurar, o las memorias se pueden danar." -ForegroundColor Red
  throw "Claude abierto."
}

# ── Respaldo de lo que ya hubiera ─────────────────────────────────────────────────────────────
if (-not $SinRespaldo) {
  $respaldo = "C:\Users\USER\RESPALDO-ANTES-DE-RESTAURAR-$Fecha"
  $algo = $false
  foreach ($o in @((Join-Path $ClaudeDir "projects\$Proyecto"), "C:\Users\USER\.mempalace", "C:\Users\USER\.claude-mem")) {
    if (Test-Path $o) {
      $algo = $true
      $nombre = Split-Path $o -Leaf
      robocopy $o (Join-Path $respaldo $nombre) /MIR /NFL /NDL /NJH /NJS /NP | Out-Null
    }
  }
  if ($algo) { Write-Host "  Respaldo de lo que habia: $respaldo" -ForegroundColor DarkGray }
}

# ── 1) El código ──────────────────────────────────────────────────────────────────────────────
Write-Host "  [1/5] Codigo del proyecto..." -ForegroundColor Green
New-Item -ItemType Directory -Force -Path (Split-Path $Repo -Parent) | Out-Null
# /XD node_modules: si el PC ya tenia el proyecto instalado, no se borra lo que ya bajo.
robocopy (Join-Path $Paquete "repo") $Repo /MIR /NFL /NDL /NJH /NJS /NP /XD "node_modules" | Out-Null

# ── 2) Las memorias ───────────────────────────────────────────────────────────────────────────
Write-Host "  [2/5] Memorias y conversaciones..." -ForegroundColor Green
robocopy (Join-Path $Paquete "claude\projects\$Proyecto") (Join-Path $ClaudeDir "projects\$Proyecto") /MIR /NFL /NDL /NJH /NJS /NP | Out-Null

# ── 3) Planes, skills, ajustes y plugins ──────────────────────────────────────────────────────
Write-Host "  [3/5] Planes, skills y ajustes..." -ForegroundColor Green
foreach ($carpeta in @("plans", "skills", "agents", "commands", "plugins")) {
  $o = Join-Path $Paquete "claude\$carpeta"
  if (Test-Path $o) { robocopy $o (Join-Path $ClaudeDir $carpeta) /MIR /NFL /NDL /NJH /NJS /NP | Out-Null }
}
foreach ($archivo in @("settings.json", "CLAUDE.md", "keybindings.json")) {
  $o = Join-Path $Paquete "claude\$archivo"
  if (Test-Path $o) { Copy-Item $o (Join-Path $ClaudeDir $archivo) -Force }
}
$homeMd = Join-Path $Paquete "claude-home-CLAUDE.md"
if (Test-Path $homeMd) { Copy-Item $homeMd "C:\Users\USER\CLAUDE.md" -Force }

# ── 4) Las dos memorias automáticas ───────────────────────────────────────────────────────────
Write-Host "  [4/5] MemPalace y claude-mem..." -ForegroundColor Green
foreach ($par in @(@("mempalace", ".mempalace"), @("claude-mem", ".claude-mem"))) {
  $o = Join-Path $Paquete $par[0]
  if (Test-Path $o) { robocopy $o "C:\Users\USER\$($par[1])" /MIR /NFL /NDL /NJH /NJS /NP | Out-Null }
}

# ── 5) Las claves ─────────────────────────────────────────────────────────────────────────────
Write-Host "  [5/5] Claves de Supabase..." -ForegroundColor Green
$envOrigen = Join-Path $Paquete "secretos\motogestion.env"
if (Test-Path $envOrigen) { Copy-Item $envOrigen (Join-Path $Repo "motogestion\.env") -Force }

# ── Qué falta hacer a mano ────────────────────────────────────────────────────────────────────
$memorias = (Get-ChildItem (Join-Path $ClaudeDir "projects\$Proyecto\memory") -File -ErrorAction SilentlyContinue).Count

Write-Host ""
Write-Host "  LISTO — $memorias memorias restauradas" -ForegroundColor Cyan
Write-Host ""
Write-Host "  FALTA HACER A MANO (una sola vez en este PC):" -ForegroundColor Yellow
Write-Host "    1. Instalar Node.js, Git y Claude Code si no estan."
Write-Host "    2. Abrir una consola en:"
Write-Host "       $Repo\motogestion"
Write-Host "       y correr:  npm install"
Write-Host "    3. Abrir Claude y confirmar que ve las memorias."
Write-Host ""
Write-Host "  RECUERDA: nunca Claude abierto en los dos PC a la vez." -ForegroundColor Yellow
Write-Host ""
