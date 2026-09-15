# EMPAQUETAR — deja TODO el proyecto (código + memorias + documentos) listo en una USB.
#
# Se corre en el PC donde se viene trabajando, ANTES de irse al otro.
#
#   powershell -ExecutionPolicy Bypass -File scripts\migracion\empaquetar.ps1 -Destino E:\
#
# Lo que copia y por qué, en una línea cada uno:
#   · el repo completo (con su historia de git) — el código
#   · .claude\projects\<este proyecto>\ — las MEMORIAS y las conversaciones completas
#   · .claude\plans, skills, settings.json, CLAUDE.md — cómo trabaja Claude en este proyecto
#   · .claude\plugins — para que el otro PC no tenga que reinstalar nada
#   · .mempalace y .claude-mem — las dos memorias automáticas
#   · motogestion\.env — las claves de Supabase (NO están en GitHub)
#
# Lo que NO copia, a propósito:
#   · node_modules y dist — se regeneran con `npm install` (y en USB van lentísimo)
#   · PEGAR-EN-SUPABASE-*.sql — llevan contraseñas y ya se usaron; una USB se pierde
#   · cache, telemetría y shell-snapshots — basura que se regenera sola

param(
  [Parameter(Mandatory = $true)]
  [string]$Destino,                                  # la raíz de la USB, ej. E:\
  [switch]$SinPlugins,                               # -SinPlugins para ahorrar 171 MB
  [switch]$SinConversaciones                         # -SinConversaciones para ahorrar ~350 MB
)

$ErrorActionPreference = "Stop"

$Repo      = "C:\Users\USER\Documents\GitHub\gps-satelital"
$ClaudeDir = "C:\Users\USER\.claude"
$Proyecto  = "C--Users-USER-Documents-GitHub-gps-satelital"   # la ruta del repo, convertida en nombre de carpeta
$Fecha     = Get-Date -Format "yyyy-MM-dd_HHmm"
$Paquete   = Join-Path $Destino "MOTOGESTION-MIGRACION"

Write-Host ""
Write-Host "  EMPAQUETANDO MOTOGESTION" -ForegroundColor Cyan
Write-Host "  destino: $Paquete"
Write-Host ""

$unidad = Split-Path $Destino -Qualifier
if ($unidad -and -not (Test-Path "$unidad\")) { throw "No encuentro la unidad $unidad. Esta conectada la memoria?" }
New-Item -ItemType Directory -Force -Path $Destino | Out-Null

# ── 1) Avisar si hay trabajo sin guardar ──────────────────────────────────────────────────────
Push-Location $Repo
$sinGuardar = git status --porcelain
$sinSubir   = git log "@{u}.." --oneline 2>$null
Pop-Location

if ($sinGuardar) {
  Write-Host "  AVISO: hay cambios sin guardar en git:" -ForegroundColor Yellow
  $sinGuardar | ForEach-Object { Write-Host "    $_" -ForegroundColor Yellow }
  Write-Host "  Igual se copian (van dentro de la carpeta del repo), pero conviene commitearlos." -ForegroundColor Yellow
  Write-Host ""
}
if ($sinSubir) {
  Write-Host "  AVISO: hay commits sin subir a GitHub:" -ForegroundColor Yellow
  $sinSubir | ForEach-Object { Write-Host "    $_" -ForegroundColor Yellow }
  Write-Host ""
}

# ── 2) El repo (sin node_modules ni los archivos con contraseñas) ─────────────────────────────
Write-Host "  [1/6] Codigo del proyecto..." -ForegroundColor Green
$destRepo = Join-Path $Paquete "repo"
robocopy $Repo $destRepo /MIR /NFL /NDL /NJH /NJS /NP `
  /XD "node_modules" "dist" ".vite" `
  /XF "PEGAR-EN-SUPABASE-*.sql" | Out-Null

# ── 3) Las memorias del proyecto (lo más importante de todo) ──────────────────────────────────
Write-Host "  [2/6] Memorias y conversaciones..." -ForegroundColor Green
$origenProy = Join-Path $ClaudeDir "projects\$Proyecto"
$destProy   = Join-Path $Paquete "claude\projects\$Proyecto"
if ($SinConversaciones) {
  # /E: sin esto, /MIR borraria del disco las conversaciones de una copia anterior completa.
  robocopy $origenProy $destProy /E /NFL /NDL /NJH /NJS /NP /XF "*.jsonl" | Out-Null
  Write-Host "        (sin las conversaciones: solo memorias)" -ForegroundColor DarkGray
} else {
  robocopy $origenProy $destProy /MIR /NFL /NDL /NJH /NJS /NP | Out-Null
}

# ── 4) Cómo trabaja Claude en este proyecto ───────────────────────────────────────────────────
Write-Host "  [3/6] Planes, skills y ajustes..." -ForegroundColor Green
foreach ($carpeta in @("plans", "skills", "agents", "commands")) {
  $o = Join-Path $ClaudeDir $carpeta
  if (Test-Path $o) { robocopy $o (Join-Path $Paquete "claude\$carpeta") /MIR /NFL /NDL /NJH /NJS /NP | Out-Null }
}
foreach ($archivo in @("settings.json", "CLAUDE.md", "keybindings.json")) {
  $o = Join-Path $ClaudeDir $archivo
  if (Test-Path $o) { Copy-Item $o (Join-Path $Paquete "claude\$archivo") -Force }
}
# El CLAUDE.md global vive en el home, no dentro de .claude
$claudeHome = "C:\Users\USER\CLAUDE.md"
if (Test-Path $claudeHome) { Copy-Item $claudeHome (Join-Path $Paquete "claude-home-CLAUDE.md") -Force }

# ── 5) Las dos memorias automáticas ───────────────────────────────────────────────────────────
Write-Host "  [4/6] MemPalace y claude-mem..." -ForegroundColor Green
foreach ($mem in @(".mempalace", ".claude-mem")) {
  $o = "C:\Users\USER\$mem"
  if (Test-Path $o) { robocopy $o (Join-Path $Paquete $mem.TrimStart('.')) /MIR /NFL /NDL /NJH /NJS /NP | Out-Null }
}

# ── 6) Los plugins (para no reinstalar nada en el otro PC) ────────────────────────────────────
if (-not $SinPlugins) {
  Write-Host "  [5/6] Plugins de Claude..." -ForegroundColor Green
  $o = Join-Path $ClaudeDir "plugins"
  if (Test-Path $o) { robocopy $o (Join-Path $Paquete "claude\plugins") /E /NFL /NDL /NJH /NJS /NP | Out-Null }
} else {
  Write-Host "  [5/6] Plugins: omitidos (-SinPlugins)" -ForegroundColor DarkGray
}

# ── 7) Las claves, aparte y señaladas ─────────────────────────────────────────────────────────
Write-Host "  [6/6] Claves de Supabase..." -ForegroundColor Green
$destSecretos = Join-Path $Paquete "secretos"
New-Item -ItemType Directory -Force -Path $destSecretos | Out-Null
$env1 = Join-Path $Repo "motogestion\.env"
if (Test-Path $env1) { Copy-Item $env1 (Join-Path $destSecretos "motogestion.env") -Force }

# ── Inventario: qué se llevó y cuándo ─────────────────────────────────────────────────────────
Push-Location $Repo
$rama   = git branch --show-current
$commit = (git log --oneline -1) -replace "[^ -~]", ""   # sin rarezas: lo lee el Bloc de notas
Pop-Location

$peso = "{0:N0} MB" -f ((Get-ChildItem $Paquete -Recurse -File | Measure-Object Length -Sum).Sum / 1MB)
$memorias = (Get-ChildItem (Join-Path $Paquete "claude\projects\$Proyecto\memory") -File -ErrorAction SilentlyContinue).Count

@"
PAQUETE DE MIGRACION - MOTOGESTION
Armado el $Fecha en el PC de origen.

Rama:   $rama
Commit: $commit
Peso:   $peso
Memorias incluidas: $memorias archivos

QUE HAY ADENTRO
  repo\            el proyecto completo, con su historia de git (sin node_modules)
  claude\          memorias, conversaciones, planes, skills, ajustes y plugins
  mempalace\       memoria de hechos y entidades
  claude-mem\      memoria de continuidad entre sesiones
  secretos\        las claves de Supabase (motogestion.env)

COMO SE RESTAURA EN EL OTRO PC
  1. El usuario de Windows TIENE que llamarse USER.
  2. Cerrar Claude por completo en ese PC.
  3. Correr, desde esta misma carpeta:
       powershell -ExecutionPolicy Bypass -File repo\scripts\migracion\restaurar.ps1
  4. Abrir una consola en C:\Users\USER\Documents\GitHub\gps-satelital\motogestion
     y correr: npm install
  5. Abrir Claude. Las memorias deben estar ahi.

REGLA DE ORO
  NUNCA tener Claude abierto en los dos PC a la vez: las memorias son bases de
  datos y se danan. Se trabaja en uno, se cierra, se pasa la memoria, se abre en
  el otro.

LO QUE NO VIAJA ACA (a proposito)
  node_modules  ->  se regenera con npm install
  PEGAR-EN-SUPABASE-*.sql  ->  llevan contrasenas y ya se usaron
"@ | Out-File (Join-Path $Paquete "LEEME-PRIMERO.txt") -Encoding ASCII

Write-Host ""
Write-Host "  LISTO — $peso en $Paquete" -ForegroundColor Cyan
Write-Host "  $memorias memorias · rama $rama · $commit"
Write-Host ""
Write-Host "  Expulsa la memoria con seguridad antes de sacarla." -ForegroundColor Yellow
Write-Host ""
