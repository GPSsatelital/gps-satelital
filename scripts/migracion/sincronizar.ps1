# SINCRONIZAR — mover TODOS los proyectos entre dos PC usando un disco.
#
#   Al LLEGAR a un PC:   sincronizar.ps1 traer   D:\
#   Al IRME de un PC:    sincronizar.ps1 llevar  D:\
#
# Normalmente no se escribe esto a mano: se hace doble clic en 1-TRAER.bat o 2-LLEVAR.bat.
#
# POR QUE EXISTE (15-sep-2026). El dueño probó Syncthing y "no guardaba las memorias y perdía
# coherencia al pasar de un pc al otro". La causa es de fondo: Syncthing copia archivos MIENTRAS
# se escriben, y las memorias de Claude son bases de datos que están abiertas todo el tiempo — se
# llevaba copias a medio escribir. Este script hace lo contrario: exige Claude CERRADO, así las
# memorias están completas y quietas cuando se copian.
#
# QUE MUEVE, por cada proyecto de la lista:
#   · la carpeta del proyecto (código, documentos, todo lo que tenga adentro)
#   · su carpeta de memorias de Claude, que se llama igual que la ruta pero con guiones
#     (C:\Users\USER\Documents\GitHub\gps-satelital  ->  C--Users-USER-Documents-GitHub-gps-satelital)
#
# Y UNA SOLA VEZ, porque son de todo el PC y no de un proyecto:
#   · .claude\plans, skills, agents, commands, plugins, settings.json, CLAUDE.md
#   · .mempalace y .claude-mem (las dos memorias automáticas)
#
# EL CANDADO. En el disco queda un ESTADO.json que dice qué PC lo dejó y cuándo. Si se intenta
# LLEVAR desde un PC sin haber TRAIDO antes el trabajo del otro, el script para y avisa — ese es
# justo el error que produce la incoherencia.

param(
  [Parameter(Mandatory = $true, Position = 0)]
  [ValidateSet("llevar", "traer")]
  [string]$Modo,

  [Parameter(Mandatory = $true, Position = 1)]
  [string]$Disco,                   # la raiz del disco, ej. D:\

  [switch]$Forzar,                  # saltarse el candado (ultimo recurso)

  # Solo para verificar que la copia funciona: escribe en una carpeta PRUEBA-BORRAR, no sella el
  # disco y no toca las marcas de este PC. No se usa en el dia a dia (para eso estan los .bat).
  [switch]$SoloProbarCopia
)

$ErrorActionPreference = "Stop"

$Base       = if ($SoloProbarCopia) { Join-Path $Disco "PRUEBA-BORRAR" } else { Join-Path $Disco "TRABAJO-EN-DOS-PC" }
$ListaTxt   = Join-Path $Base "proyectos.txt"
$EstadoJson = Join-Path $Base "ESTADO.json"
$DatosDir   = Join-Path $Base "datos"
$ComunDir   = Join-Path $DatosDir "comun"
$ProyDir    = Join-Path $DatosDir "proyectos"

$ClaudeDir  = "C:\Users\USER\.claude"
$MarcaLocal = Join-Path $ClaudeDir "ULTIMA-SINCRONIZACION.json"
$EstePC     = $env:COMPUTERNAME
$Ahora      = Get-Date -Format "yyyy-MM-dd HH:mm:ss"

# Carpetas y archivos que son del PC entero, no de un proyecto.
$ComunCarpetas = @("plans", "skills", "agents", "commands", "plugins")
$ComunArchivos = @("settings.json", "CLAUDE.md", "keybindings.json")

function Ruta-A-NombreDeMemoria([string]$ruta) {
  # Claude guarda las memorias en una carpeta cuyo nombre ES la ruta, con ':' y '\' cambiados por '-'
  #   C:\Users\USER\Documents\GitHub\gps-satelital -> C--Users-USER-Documents-GitHub-gps-satelital
  return ($ruta.TrimEnd('\') -replace '[:\\]', '-')
}

function Copiar($origen, $destino, $espejo, $excluirDir, $excluirArch) {
  if (-not (Test-Path $origen)) { return $false }
  $args = @($origen, $destino, "/NFL", "/NDL", "/NJH", "/NJS", "/NP", "/R:1", "/W:1")
  # /MIR deja el destino IGUAL al origen (borra lo que sobre). /E solo agrega y actualiza.
  if ($espejo) { $args += "/MIR" } else { $args += "/E" }
  if ($excluirDir)  { $args += "/XD"; $args += $excluirDir }
  if ($excluirArch) { $args += "/XF"; $args += $excluirArch }
  robocopy @args | Out-Null
  return $true
}

Write-Host ""
Write-Host "  ============================================" -ForegroundColor Cyan
Write-Host "   SINCRONIZAR - $($Modo.ToUpper())" -ForegroundColor Cyan
Write-Host "   este PC: $EstePC" -ForegroundColor Cyan
Write-Host "   disco:   $Disco" -ForegroundColor Cyan
Write-Host "  ============================================" -ForegroundColor Cyan
Write-Host ""

# ── Requisito 1: Claude cerrado ───────────────────────────────────────────────────────────────
if (-not $SoloProbarCopia -and (Get-Process -Name "Claude*" -ErrorAction SilentlyContinue)) {
  Write-Host "  PARA. Claude esta abierto en este PC." -ForegroundColor Red
  Write-Host ""
  Write-Host "  Cierralo por completo y vuelve a intentar." -ForegroundColor Yellow
  Write-Host "  Las memorias son bases de datos: copiarlas mientras Claude escribe es" -ForegroundColor Yellow
  Write-Host "  exactamente lo que hacia perder coherencia con Syncthing." -ForegroundColor Yellow
  Write-Host ""
  Read-Host "  Presiona ENTER para cerrar"
  exit 1
}

# ── Requisito 2: usuario de Windows ───────────────────────────────────────────────────────────
if ($env:USERNAME -ne "USER") {
  Write-Host "  PARA. El usuario de Windows de este PC se llama '$env:USERNAME', no 'USER'." -ForegroundColor Red
  Write-Host ""
  Write-Host "  Las memorias se guardan con la ruta escrita adentro del nombre de la carpeta," -ForegroundColor Yellow
  Write-Host "  asi que con otro usuario NO se van a encontrar." -ForegroundColor Yellow
  Write-Host "  Solucion: crea en Windows un usuario llamado USER y trabaja desde ahi." -ForegroundColor Yellow
  Write-Host ""
  Read-Host "  Presiona ENTER para cerrar"
  exit 1
}

$unidad = Split-Path $Disco -Qualifier
if ($unidad -and -not (Test-Path "$unidad\")) {
  Write-Host "  PARA. No encuentro la unidad $unidad. Esta conectado el disco?" -ForegroundColor Red
  Read-Host "  Presiona ENTER para cerrar"
  exit 1
}

# ── La lista de proyectos ─────────────────────────────────────────────────────────────────────
New-Item -ItemType Directory -Force -Path $Base, $DatosDir, $ComunDir, $ProyDir | Out-Null

if (-not (Test-Path $ListaTxt)) {
  @"
# LISTA DE PROYECTOS QUE VIAJAN EN ESTE DISCO
# Una linea por proyecto:   nombre corto | ruta completa en el PC
# Las lineas que empiezan con # no cuentan.

motogestion | C:\Users\USER\Documents\GitHub\gps-satelital

# Para agregar otro, copia la linea de arriba y cambiala. Ejemplo:
# asistente | C:\Users\USER\Proyecto Asistete autonomo
"@ | Out-File $ListaTxt -Encoding ASCII
  Write-Host "  (se creo la lista de proyectos: $ListaTxt)" -ForegroundColor DarkGray
  Write-Host ""
}

$proyectos = @()
foreach ($linea in (Get-Content $ListaTxt)) {
  $l = $linea.Trim()
  if (-not $l -or $l.StartsWith("#")) { continue }
  $partes = $l -split '\|', 2
  if ($partes.Count -ne 2) { continue }
  $proyectos += [pscustomobject]@{
    Nombre = $partes[0].Trim()
    Ruta   = $partes[1].Trim()
  }
}
if ($proyectos.Count -eq 0) {
  Write-Host "  PARA. La lista de proyectos esta vacia: $ListaTxt" -ForegroundColor Red
  Read-Host "  Presiona ENTER para cerrar"
  exit 1
}

function Leer-Json($ruta) { if (Test-Path $ruta) { return Get-Content $ruta -Raw | ConvertFrom-Json } return $null }
$enDisco = Leer-Json $EstadoJson
$marca   = Leer-Json $MarcaLocal

# ══════════════════════════════════════════════════════════════════════════════════════════════
#  LLEVAR — del PC al disco
# ══════════════════════════════════════════════════════════════════════════════════════════════
if ($Modo -eq "llevar") {

  # EL CANDADO: no pisar trabajo del otro PC que este nunca trajo.
  if ($enDisco -and $enDisco.pc -ne $EstePC) {
    $traido = if ($marca) { $marca.fecha_del_disco } else { "nunca" }
    if ($traido -ne $enDisco.fecha) {
      Write-Host "  PARA. El disco trae trabajo de otro PC que este nunca trajo." -ForegroundColor Red
      Write-Host ""
      Write-Host "     En el disco hay:  $($enDisco.pc)   del  $($enDisco.fecha)" -ForegroundColor Yellow
      Write-Host "     Este PC trajo:    $traido" -ForegroundColor Yellow
      Write-Host ""
      Write-Host "  Si llevas ahora, pisas ese trabajo y se pierde." -ForegroundColor Red
      Write-Host "  Lo correcto: primero haz doble clic en 1-TRAER.bat y sigue desde ahi." -ForegroundColor Yellow
      Write-Host ""
      if (-not $Forzar) { Read-Host "  Presiona ENTER para cerrar"; exit 1 }
      Write-Host "  (-Forzar: siguiendo de todas formas)" -ForegroundColor DarkYellow
    }
  }

  $resumen = @()
  foreach ($p in $proyectos) {
    Write-Host "  PROYECTO: $($p.Nombre)" -ForegroundColor Green
    if (-not (Test-Path $p.Ruta)) {
      Write-Host "     (no esta en este PC - se salta)" -ForegroundColor DarkGray
      Write-Host ""
      continue
    }
    $destProy = Join-Path $ProyDir $p.Nombre
    New-Item -ItemType Directory -Force -Path $destProy | Out-Null

    Write-Host "     archivos del proyecto..." -NoNewline
    Copiar $p.Ruta (Join-Path $destProy "archivos") $true @("node_modules", "dist", ".vite") @("PEGAR-EN-SUPABASE-*.sql") | Out-Null
    Write-Host " ok"

    $nombreMem = Ruta-A-NombreDeMemoria $p.Ruta
    $origenMem = Join-Path $ClaudeDir "projects\$nombreMem"
    Write-Host "     memorias y conversaciones..." -NoNewline
    if (Copiar $origenMem (Join-Path $destProy "memoria") $true $null $null) {
      $n = (Get-ChildItem (Join-Path $origenMem "memory") -File -ErrorAction SilentlyContinue).Count
      Write-Host " ok ($n memorias)"
      $resumen += "$($p.Nombre): $n memorias"
    } else {
      Write-Host " (todavia no tiene)"
      $resumen += "$($p.Nombre): sin memorias aun"
    }
    # Deja anotado a que ruta pertenece esta memoria, por si algun dia cambia el nombre.
    "$($p.Ruta)" | Out-File (Join-Path $destProy "RUTA-ORIGINAL.txt") -Encoding ASCII
    Write-Host ""
  }

  Write-Host "  LO QUE ES DE TODO EL PC" -ForegroundColor Green
  foreach ($c in $ComunCarpetas) {
    Write-Host "     $c..." -NoNewline
    if (Copiar (Join-Path $ClaudeDir $c) (Join-Path $ComunDir "claude\$c") $true $null $null) { Write-Host " ok" } else { Write-Host " (no hay)" }
  }
  New-Item -ItemType Directory -Force -Path (Join-Path $ComunDir "claude") | Out-Null
  foreach ($a in $ComunArchivos) {
    $o = Join-Path $ClaudeDir $a
    if (Test-Path $o) { Copy-Item $o (Join-Path $ComunDir "claude\$a") -Force }
  }
  if (Test-Path "C:\Users\USER\CLAUDE.md") { Copy-Item "C:\Users\USER\CLAUDE.md" (Join-Path $ComunDir "CLAUDE-del-usuario.md") -Force }

  foreach ($m in @(".mempalace", ".claude-mem")) {
    Write-Host "     $m..." -NoNewline
    if (Copiar "C:\Users\USER\$m" (Join-Path $ComunDir $m.TrimStart('.')) $true $null $null) { Write-Host " ok" } else { Write-Host " (no hay)" }
  }
  Write-Host ""

  # Sellar el disco
  if (-not $SoloProbarCopia) {
    @{ pc = $EstePC; fecha = $Ahora; proyectos = ($proyectos | ForEach-Object { $_.Nombre }) -join ", "; detalle = $resumen -join " | " } |
      ConvertTo-Json | Out-File $EstadoJson -Encoding ASCII
    @{ fecha_del_disco = $Ahora; pc_origen = $EstePC } | ConvertTo-Json | Out-File $MarcaLocal -Encoding ASCII
  } else {
    Write-Host "  (MODO PRUEBA: no se sello el disco ni se toco nada de este PC)" -ForegroundColor DarkYellow
  }

  $peso = "{0:N0} MB" -f ((Get-ChildItem $Base -Recurse -File -ErrorAction SilentlyContinue | Measure-Object Length -Sum).Sum / 1MB)

  Write-Host "  ============================================" -ForegroundColor Cyan
  Write-Host "   LISTO. Ya puedes llevarte el disco." -ForegroundColor Cyan
  Write-Host "   $peso en total" -ForegroundColor Cyan
  foreach ($r in $resumen) { Write-Host "   $r" -ForegroundColor Cyan }
  Write-Host "  ============================================" -ForegroundColor Cyan
  Write-Host ""
  Write-Host "  Expulsa el disco con seguridad antes de desconectarlo." -ForegroundColor Yellow
  Write-Host ""
}

# ══════════════════════════════════════════════════════════════════════════════════════════════
#  TRAER — del disco al PC
# ══════════════════════════════════════════════════════════════════════════════════════════════
if ($Modo -eq "traer") {

  if (-not $enDisco) {
    Write-Host "  AVISO: el disco no tiene sello todavia. Debe ser la primera vez." -ForegroundColor Yellow
    Write-Host ""
  } else {
    Write-Host "  En el disco hay trabajo de:  $($enDisco.pc)" -ForegroundColor Green
    Write-Host "  Guardado el:                 $($enDisco.fecha)" -ForegroundColor Green
    Write-Host "  Proyectos:                   $($enDisco.proyectos)" -ForegroundColor Green
    Write-Host ""
    if ($enDisco.pc -eq $EstePC -and $marca -and $marca.fecha_del_disco -eq $enDisco.fecha) {
      Write-Host "  (Este mismo PC fue el ultimo que lo dejo: ya estabas al dia.)" -ForegroundColor DarkGray
      Write-Host ""
    }
  }

  # Respaldo de lo que hubiera, por si acaso.
  $respaldo = "C:\Users\USER\RESPALDO-ANTES-DE-TRAER-$(Get-Date -Format 'yyyy-MM-dd_HHmm')"
  Write-Host "  Guardando un respaldo de lo que habia en este PC..." -NoNewline
  foreach ($m in @(".mempalace", ".claude-mem")) {
    Copiar "C:\Users\USER\$m" (Join-Path $respaldo $m.TrimStart('.')) $true $null $null | Out-Null
  }
  foreach ($p in $proyectos) {
    $nombreMem = Ruta-A-NombreDeMemoria $p.Ruta
    Copiar (Join-Path $ClaudeDir "projects\$nombreMem") (Join-Path $respaldo "memorias\$nombreMem") $true $null $null | Out-Null
  }
  Write-Host " ok"
  Write-Host "     ($respaldo)" -ForegroundColor DarkGray
  Write-Host ""

  foreach ($p in $proyectos) {
    Write-Host "  PROYECTO: $($p.Nombre)" -ForegroundColor Green
    $origenProy = Join-Path $ProyDir $p.Nombre
    if (-not (Test-Path $origenProy)) {
      Write-Host "     (no viene en el disco - se salta)" -ForegroundColor DarkGray
      Write-Host ""
      continue
    }

    Write-Host "     archivos del proyecto..." -NoNewline
    New-Item -ItemType Directory -Force -Path (Split-Path $p.Ruta -Parent) | Out-Null
    # /MIR pero SIN tocar node_modules: si este PC ya tenia instalado, no se borra.
    Copiar (Join-Path $origenProy "archivos") $p.Ruta $true @("node_modules") $null | Out-Null
    Write-Host " ok"

    $nombreMem = Ruta-A-NombreDeMemoria $p.Ruta
    $destMem   = Join-Path $ClaudeDir "projects\$nombreMem"
    Write-Host "     memorias y conversaciones..." -NoNewline
    # /E: agrega y actualiza, nunca borra (por si este PC tenia conversaciones que el disco no trae).
    if (Copiar (Join-Path $origenProy "memoria") $destMem $false $null $null) {
      # Las memorias SI quedan como espejo exacto: si se borro una a proposito, debe desaparecer.
      $memOrigen = Join-Path $origenProy "memoria\memory"
      if (Test-Path $memOrigen) { Copiar $memOrigen (Join-Path $destMem "memory") $true $null $null | Out-Null }
      $n = (Get-ChildItem (Join-Path $destMem "memory") -File -ErrorAction SilentlyContinue).Count
      Write-Host " ok ($n memorias)"
    } else { Write-Host " (no venian)" }
    Write-Host ""
  }

  Write-Host "  LO QUE ES DE TODO EL PC" -ForegroundColor Green
  foreach ($c in $ComunCarpetas) {
    Write-Host "     $c..." -NoNewline
    # /E a proposito: si el disco vino sin plugins, no se borran los que este PC ya tenia.
    if (Copiar (Join-Path $ComunDir "claude\$c") (Join-Path $ClaudeDir $c) $false $null $null) { Write-Host " ok" } else { Write-Host " (no venia)" }
  }
  foreach ($a in $ComunArchivos) {
    $o = Join-Path $ComunDir "claude\$a"
    if (Test-Path $o) { Copy-Item $o (Join-Path $ClaudeDir $a) -Force }
  }
  $md = Join-Path $ComunDir "CLAUDE-del-usuario.md"
  if (Test-Path $md) { Copy-Item $md "C:\Users\USER\CLAUDE.md" -Force }

  foreach ($m in @(".mempalace", ".claude-mem")) {
    Write-Host "     $m..." -NoNewline
    if (Copiar (Join-Path $ComunDir $m.TrimStart('.')) "C:\Users\USER\$m" $true $null $null) { Write-Host " ok" } else { Write-Host " (no venia)" }
  }
  Write-Host ""

  if ($enDisco) {
    @{ fecha_del_disco = $enDisco.fecha; pc_origen = $enDisco.pc } | ConvertTo-Json | Out-File $MarcaLocal -Encoding ASCII
  }

  Write-Host "  ============================================" -ForegroundColor Cyan
  Write-Host "   LISTO. Ya puedes abrir Claude en este PC." -ForegroundColor Cyan
  Write-Host "  ============================================" -ForegroundColor Cyan
  Write-Host ""
  Write-Host "  Si es la primera vez en este PC, falta una sola cosa:" -ForegroundColor Yellow
  Write-Host "  abrir una consola dentro de la carpeta del proyecto y correr:  npm install" -ForegroundColor Yellow
  Write-Host ""
}
