# SINCRONIZAR — mover TODO entre dos PC usando un disco.
#
#   Al LLEGAR a un PC:   sincronizar.ps1 traer   D:\
#   Al IRME de un PC:    sincronizar.ps1 llevar  D:\
#
# Normalmente no se escribe esto a mano: se hace doble clic en 1-TRAER.bat o 2-LLEVAR.bat.
#
# POR QUE EXISTE (15-sep-2026). El dueño probó Syncthing y "no guardaba las memorias y perdía
# coherencia al pasar de un pc al otro". La causa es de fondo: Syncthing copia archivos MIENTRAS
# se escriben, y las memorias de Claude son bases de datos abiertas todo el tiempo — se llevaba
# copias a medio escribir. Este script exige Claude CERRADO, así las memorias están completas.
#
# ─────────────────────────────────────────────────────────────────────────────────────────────
# COMO DECIDE QUE COPIAR (pregunta del dueño: "¿y si agrego skills, carpetas, programas?")
#
# De la carpeta .claude se copia TODO, salvo una lista corta de basura. Es a proposito: si
# mañana se agrega un skill, un agente, un comando, un plugin o algo que Claude invente, VIAJA
# SOLO — no hay que acordarse de agregarlo acá. Lo unico que se queda es lo que se regenera o es
# de este PC nada mas (cache, telemetria, snapshots de consola).
#
# Eso incluye la carpeta `projects` COMPLETA: asi viajan las memorias de TODOS los proyectos,
# incluso los que no estan en la lista de abajo.
#
# La lista `proyectos.txt` decide otra cosa distinta: QUE CARPETAS DE CODIGO viajan. Un proyecto
# que no este en el PC donde corre el programa, simplemente se salta.
#
# LO QUE NO PUEDE VIAJAR NUNCA: los programas instalados en Windows (Node, Git, Claude Code,
# drivers, navegadores). Eso se instala una vez en cada PC.
# ─────────────────────────────────────────────────────────────────────────────────────────────

param(
  [Parameter(Mandatory = $true, Position = 0)]
  [ValidateSet("llevar", "traer")]
  [string]$Modo,

  [Parameter(Mandatory = $true, Position = 1)]
  [string]$Disco,                   # la raiz del disco, ej. D:\

  [switch]$Forzar,                  # saltarse el candado (ultimo recurso)

  # Solo para verificar que la copia funciona: escribe en una carpeta PRUEBA-BORRAR, no sella el
  # disco y no toca nada de este PC. No se usa en el dia a dia (para eso estan los .bat).
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
$Home_      = "C:\Users\USER"
$MarcaLocal = Join-Path $Home_ "marca-sincronizacion.json"
$EstePC     = $env:COMPUTERNAME
$Ahora      = Get-Date -Format "yyyy-MM-dd HH:mm:ss"

# Lo UNICO que no se copia de .claude: se regenera solo o es de este PC nada mas.
$BasuraClaude = @("cache", "telemetry", "shell-snapshots", "session-env", "daemon", "worktrees", ".stversions", ".stfolder")

# Archivos de configuracion que viven en el home, no dentro de .claude.
#   .claude.json  <- los servidores MCP, los proyectos conocidos, las preferencias. CLAVE.
$HomeArchivos = @(".claude.json", ".claude.json.backup", "CLAUDE.md", ".mcp.json")

# Las dos memorias automaticas, tambien en el home.
$HomeMemorias = @(".mempalace", ".claude-mem")

function Ruta-A-NombreDeMemoria([string]$ruta) {
  # Claude guarda las memorias en una carpeta cuyo nombre ES la ruta, con ':' y '\' cambiados por '-'
  #   C:\Users\USER\Documents\GitHub\gps-satelital -> C--Users-USER-Documents-GitHub-gps-satelital
  return ($ruta.TrimEnd('\') -replace '[:\\]', '-')
}

function Copiar($origen, $destino, $espejo, $excluirDir, $excluirArch) {
  if (-not (Test-Path $origen)) { return $false }
  $lista = @($origen, $destino, "/NFL", "/NDL", "/NJH", "/NJS", "/NP", "/R:1", "/W:1")
  # /MIR deja el destino IGUAL al origen (borra lo que sobre). /E solo agrega y actualiza.
  if ($espejo) { $lista += "/MIR" } else { $lista += "/E" }
  if ($excluirDir)  { $lista += "/XD"; $lista += $excluirDir }
  if ($excluirArch) { $lista += "/XF"; $lista += $excluirArch }
  robocopy @lista | Out-Null
  return $true
}

function Parar($titulo, $lineas) {
  Write-Host "  PARA. $titulo" -ForegroundColor Red
  Write-Host ""
  foreach ($l in $lineas) { Write-Host "  $l" -ForegroundColor Yellow }
  Write-Host ""
  Read-Host "  Presiona ENTER para cerrar"
  exit 1
}

Write-Host ""
Write-Host "  ============================================" -ForegroundColor Cyan
Write-Host "   SINCRONIZAR - $($Modo.ToUpper())" -ForegroundColor Cyan
Write-Host "   este PC: $EstePC" -ForegroundColor Cyan
Write-Host "   disco:   $Disco" -ForegroundColor Cyan
Write-Host "  ============================================" -ForegroundColor Cyan
Write-Host ""

# ── Guarda 1: Claude cerrado ──────────────────────────────────────────────────────────────────
if (-not $SoloProbarCopia -and (Get-Process -Name "Claude*" -ErrorAction SilentlyContinue)) {
  Parar "Claude esta abierto en este PC." @(
    "Cierralo por completo y vuelve a intentar.",
    "Las memorias son bases de datos: copiarlas mientras Claude escribe es",
    "exactamente lo que hacia perder coherencia con Syncthing.")
}

# ── Guarda 2: usuario de Windows ──────────────────────────────────────────────────────────────
if ($env:USERNAME -ne "USER") {
  Parar "El usuario de Windows de este PC se llama '$env:USERNAME', no 'USER'." @(
    "Las memorias se guardan con la ruta escrita adentro del nombre de la carpeta,",
    "asi que con otro usuario NO se van a encontrar.",
    "Solucion: crea en Windows un usuario llamado USER y trabaja desde ahi.")
}

$unidad = Split-Path $Disco -Qualifier
if ($unidad -and -not (Test-Path "$unidad\")) {
  Parar "No encuentro la unidad $unidad." @("Esta conectado el disco?")
}

# ── La lista de proyectos ─────────────────────────────────────────────────────────────────────
New-Item -ItemType Directory -Force -Path $Base, $DatosDir, $ComunDir, $ProyDir | Out-Null

if (-not (Test-Path $ListaTxt)) {
  @"
# LISTA DE PROYECTOS QUE VIAJAN EN ESTE DISCO
# Una linea por proyecto:   nombre corto | ruta completa de la carpeta en el PC
# Las lineas que empiezan con # son notas y no cuentan.
# Si un proyecto no esta en el PC donde corres el programa, se salta solo.

motogestion | C:\Users\USER\Documents\GitHub\gps-satelital
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
  $proyectos += [pscustomobject]@{ Nombre = $partes[0].Trim(); Ruta = $partes[1].Trim() }
}
if ($proyectos.Count -eq 0) { Parar "La lista de proyectos esta vacia." @($ListaTxt) }

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
    if ($traido -ne $enDisco.fecha -and -not $Forzar) {
      Parar "El disco trae trabajo de otro PC que este nunca trajo." @(
        "",
        "   En el disco hay:  $($enDisco.pc)   del  $($enDisco.fecha)",
        "   Este PC trajo:    $traido",
        "",
        "Si llevas ahora, pisas ese trabajo y se pierde.",
        "Lo correcto: primero doble clic en 1-TRAER.bat, y sigues desde ahi.")
    }
  }

  $resumen = @()
  foreach ($p in $proyectos) {
    Write-Host "  PROYECTO: $($p.Nombre)" -ForegroundColor Green

    # Aviso, no bloqueo: los cambios sin guardar VIAJAN igual (se copia la carpeta entera), pero
    # conviene saber que quedaron a medias antes de cambiar de PC.
    if ((Test-Path $p.Ruta) -and (Test-Path (Join-Path $p.Ruta ".git"))) {
      Push-Location $p.Ruta
      $sinGuardar = @(git status --porcelain 2>$null)
      Pop-Location
      if ($sinGuardar.Count -gt 0) {
        Write-Host "     (aviso: $($sinGuardar.Count) archivo(s) con cambios sin guardar - viajan igual)" -ForegroundColor DarkYellow
      }
    }

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

    "$($p.Ruta)" | Out-File (Join-Path $destProy "RUTA-ORIGINAL.txt") -Encoding ASCII

    $nombreMem = Ruta-A-NombreDeMemoria $p.Ruta
    $n = (Get-ChildItem (Join-Path $ClaudeDir "projects\$nombreMem\memory") -File -ErrorAction SilentlyContinue).Count
    $resumen += "$($p.Nombre): $n memorias"
    Write-Host ""
  }

  # TODO .claude, salvo la basura. Asi viaja cualquier cosa nueva sin tener que acordarse.
  Write-Host "  LO QUE ES DE TODO EL PC" -ForegroundColor Green
  Write-Host "     .claude completo (memorias, skills, planes, plugins, ajustes)..." -NoNewline
  Copiar $ClaudeDir (Join-Path $ComunDir "claude") $true $BasuraClaude @("marca-sincronizacion.json") | Out-Null
  Write-Host " ok"

  New-Item -ItemType Directory -Force -Path (Join-Path $ComunDir "home") | Out-Null
  Write-Host "     configuracion del usuario (.claude.json y CLAUDE.md)..." -NoNewline
  foreach ($a in $HomeArchivos) {
    $o = Join-Path $Home_ $a
    if (Test-Path $o) { Copy-Item $o (Join-Path $ComunDir "home\$a") -Force }
  }
  Write-Host " ok"

  foreach ($m in $HomeMemorias) {
    Write-Host "     $m..." -NoNewline
    if (Copiar (Join-Path $Home_ $m) (Join-Path $ComunDir $m.TrimStart('.')) $true $null $null) { Write-Host " ok" } else { Write-Host " (no hay)" }
  }
  Write-Host ""

  $totalMem = (Get-ChildItem (Join-Path $ComunDir "claude\projects") -Directory -ErrorAction SilentlyContinue |
               ForEach-Object { (Get-ChildItem (Join-Path $_.FullName "memory") -File -ErrorAction SilentlyContinue).Count } |
               Measure-Object -Sum).Sum

  if (-not $SoloProbarCopia) {
    @{ pc = $EstePC; fecha = $Ahora; proyectos = ($proyectos | ForEach-Object { $_.Nombre }) -join ", "
       detalle = $resumen -join " | "; memorias_totales = $totalMem } |
      ConvertTo-Json | Out-File $EstadoJson -Encoding ASCII
    @{ fecha_del_disco = $Ahora; pc_origen = $EstePC } | ConvertTo-Json | Out-File $MarcaLocal -Encoding ASCII
  } else {
    Write-Host "  (MODO PRUEBA: no se sello el disco ni se toco nada de este PC)" -ForegroundColor DarkYellow
  }

  $peso = "{0:N0} MB" -f ((Get-ChildItem $Base -Recurse -File -ErrorAction SilentlyContinue | Measure-Object Length -Sum).Sum / 1MB)

  Write-Host "  ============================================" -ForegroundColor Cyan
  Write-Host "   LISTO. Ya puedes llevarte el disco." -ForegroundColor Cyan
  Write-Host "   $peso  ·  $totalMem memorias en total" -ForegroundColor Cyan
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

  # Respaldo de lo que hubiera en este PC, por si acaso.
  $respaldo = Join-Path $Home_ "RESPALDO-ANTES-DE-TRAER-$(Get-Date -Format 'yyyy-MM-dd_HHmm')"
  Write-Host "  Guardando un respaldo de lo que habia..." -NoNewline
  Copiar (Join-Path $ClaudeDir "projects") (Join-Path $respaldo "claude-projects") $true $null $null | Out-Null
  foreach ($m in $HomeMemorias) { Copiar (Join-Path $Home_ $m) (Join-Path $respaldo $m.TrimStart('.')) $true $null $null | Out-Null }
  Write-Host " ok"
  Write-Host "     ($respaldo)" -ForegroundColor DarkGray
  Write-Host ""

  foreach ($p in $proyectos) {
    Write-Host "  PROYECTO: $($p.Nombre)" -ForegroundColor Green
    $origenProy = Join-Path $ProyDir "$($p.Nombre)\archivos"
    if (-not (Test-Path $origenProy)) {
      Write-Host "     (no viene en el disco - se salta)" -ForegroundColor DarkGray
      Write-Host ""
      continue
    }
    # EL AVISO QUE SALVA HORAS DE TRABAJO. Traer pisa la carpeta con lo que trae el disco: si en
    # este PC quedo trabajo sin llevar (porque se olvido el 2-LLEVAR), se perderia. Se revisa con
    # git y se pide confirmacion antes de tocar nada.
    if (Test-Path (Join-Path $p.Ruta ".git")) {
      Push-Location $p.Ruta
      $sinGuardar = @(git status --porcelain 2>$null)
      $sinSubir   = @(git log "@{u}.." --oneline 2>$null)
      Pop-Location
      if ($sinGuardar.Count -gt 0 -or $sinSubir.Count -gt 0) {
        Write-Host ""
        Write-Host "     CUIDADO: este PC tiene trabajo que nunca se llevo al disco." -ForegroundColor Red
        Write-Host ""
        if ($sinGuardar.Count -gt 0) {
          Write-Host "       Archivos cambiados sin guardar: $($sinGuardar.Count)" -ForegroundColor Yellow
          $sinGuardar | Select-Object -First 8 | ForEach-Object { Write-Host "         $_" -ForegroundColor Yellow }
        }
        if ($sinSubir.Count -gt 0) {
          Write-Host "       Guardados pero sin subir: $($sinSubir.Count)" -ForegroundColor Yellow
          $sinSubir | Select-Object -First 5 | ForEach-Object { Write-Host "         $_" -ForegroundColor Yellow }
        }
        Write-Host ""
        Write-Host "     Si sigues, eso se reemplaza por lo que trae el disco." -ForegroundColor Red
        Write-Host "     (Queda copia en el respaldo, pero es mejor no llegar ahi.)" -ForegroundColor DarkGray
        Write-Host ""
        $r = Read-Host "     Escribe SI para seguir, o cualquier cosa para cancelar"
        if ($r -notmatch "^(SI|Si|si)$") {
          Write-Host ""
          Write-Host "     Cancelado. No se toco nada." -ForegroundColor Cyan
          Write-Host "     Lo que conviene: guarda ese trabajo, haz doble clic en 2-LLEVAR," -ForegroundColor Yellow
          Write-Host "     y despues si 1-TRAER." -ForegroundColor Yellow
          Write-Host ""
          Read-Host "     Presiona ENTER para cerrar"
          exit 1
        }
      }
    }

    # Respaldo de la carpeta ANTES de pisarla. Sin esto, traer sobre trabajo sin llevar lo borraba
    # sin dejar rastro (el respaldo de arriba solo cubria las memorias).
    if (Test-Path $p.Ruta) {
      Write-Host "     respaldando lo que habia..." -NoNewline
      Copiar $p.Ruta (Join-Path $respaldo "proyectos\$($p.Nombre)") $true @("node_modules", "dist") $null | Out-Null
      Write-Host " ok"
    }

    Write-Host "     archivos del proyecto..." -NoNewline
    New-Item -ItemType Directory -Force -Path (Split-Path $p.Ruta -Parent) | Out-Null
    # Espejo, pero sin tocar node_modules: si este PC ya lo tenia instalado, no se borra.
    Copiar $origenProy $p.Ruta $true @("node_modules") $null | Out-Null
    Write-Host " ok"
    Write-Host ""
  }

  Write-Host "  LO QUE ES DE TODO EL PC" -ForegroundColor Green
  Write-Host "     .claude completo (memorias, skills, planes, plugins, ajustes)..." -NoNewline
  # /E: agrega y actualiza, NUNCA borra. Si este PC tenia algo que el disco no trae, se conserva.
  Copiar (Join-Path $ComunDir "claude") $ClaudeDir $false $null $null | Out-Null
  # Las memorias de cada proyecto SI quedan como espejo exacto: si se borro una a proposito,
  # tiene que desaparecer tambien aca.
  $projDisco = Join-Path $ComunDir "claude\projects"
  if (Test-Path $projDisco) {
    foreach ($d in (Get-ChildItem $projDisco -Directory)) {
      $memOrigen = Join-Path $d.FullName "memory"
      if (Test-Path $memOrigen) { Copiar $memOrigen (Join-Path $ClaudeDir "projects\$($d.Name)\memory") $true $null $null | Out-Null }
    }
  }
  Write-Host " ok"

  Write-Host "     configuracion del usuario (.claude.json y CLAUDE.md)..." -NoNewline
  foreach ($a in $HomeArchivos) {
    $o = Join-Path $ComunDir "home\$a"
    if (Test-Path $o) { Copy-Item $o (Join-Path $Home_ $a) -Force }
  }
  Write-Host " ok"

  foreach ($m in $HomeMemorias) {
    Write-Host "     $m..." -NoNewline
    if (Copiar (Join-Path $ComunDir $m.TrimStart('.')) (Join-Path $Home_ $m) $true $null $null) { Write-Host " ok" } else { Write-Host " (no venia)" }
  }
  Write-Host ""

  if ($enDisco) {
    @{ fecha_del_disco = $enDisco.fecha; pc_origen = $enDisco.pc } | ConvertTo-Json | Out-File $MarcaLocal -Encoding ASCII
  }

  $totalMem = (Get-ChildItem (Join-Path $ClaudeDir "projects") -Directory -ErrorAction SilentlyContinue |
               ForEach-Object { (Get-ChildItem (Join-Path $_.FullName "memory") -File -ErrorAction SilentlyContinue).Count } |
               Measure-Object -Sum).Sum

  Write-Host "  ============================================" -ForegroundColor Cyan
  Write-Host "   LISTO. Ya puedes abrir Claude en este PC." -ForegroundColor Cyan
  Write-Host "   $totalMem memorias en total" -ForegroundColor Cyan
  Write-Host "  ============================================" -ForegroundColor Cyan
  Write-Host ""
  Write-Host "  Si es la primera vez en este PC, falta una sola cosa:" -ForegroundColor Yellow
  Write-Host "  abrir una consola dentro de la carpeta del proyecto y correr:  npm install" -ForegroundColor Yellow
  Write-Host ""
}
