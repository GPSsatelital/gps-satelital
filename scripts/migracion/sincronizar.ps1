# SINCRONIZAR — el del día a día: llevar el trabajo al disco, o traerlo de vuelta.
#
#   Me voy de este PC:      powershell -ExecutionPolicy Bypass -File scripts\migracion\sincronizar.ps1 llevar E:\
#   Llego al otro PC:       powershell -ExecutionPolicy Bypass -File scripts\migracion\sincronizar.ps1 traer  E:\
#
# Por qué existe (15-sep-2026): el dueño probó Syncthing y "no guardaba las memorias y perdía
# coherencia al pasar de un PC al otro". La causa: Syncthing copia archivos MIENTRAS se escriben,
# y las memorias son bases de datos que Claude tiene abiertas todo el tiempo — se llevaba copias a
# medio escribir. Este script hace lo contrario: exige que Claude esté CERRADO, así las memorias
# están completas y quietas cuando se copian.
#
# EL CANDADO. En el disco queda un ESTADO.json que dice qué PC lo dejó y cuándo. Si intentas
# LLEVAR desde un PC sin haber TRAÍDO antes el trabajo del otro, el script para y te avisa — es
# justo el error que produce la incoherencia.
#
# La copia es incremental (robocopy /MIR): la primera vez tarda, las siguientes solo pasa lo que
# cambió. No duplica la lógica de copia: llama a empaquetar.ps1 y restaurar.ps1, que son la única
# fuente de qué carpeta va a dónde.

param(
  [Parameter(Mandatory = $true, Position = 0)]
  [ValidateSet("llevar", "traer")]
  [string]$Modo,

  [Parameter(Mandatory = $true, Position = 1)]
  [string]$Disco,                     # la raiz del disco o la memoria, ej. E:\

  [switch]$Forzar,                    # -Forzar para saltarse el candado (ultimo recurso)
  [switch]$SinPlugins,
  [switch]$SinConversaciones
)

$ErrorActionPreference = "Stop"

$Paquete   = Join-Path $Disco "MOTOGESTION-MIGRACION"
$Estado    = Join-Path $Paquete "ESTADO.json"
$MarcaLocal= "C:\Users\USER\.claude\ULTIMA-SINCRONIZACION.json"
$EstePC    = $env:COMPUTERNAME
$Ahora     = Get-Date -Format "yyyy-MM-dd HH:mm:ss"
$AquiScript= $PSScriptRoot

Write-Host ""
Write-Host "  SINCRONIZAR - modo: $Modo" -ForegroundColor Cyan
Write-Host "  este PC: $EstePC   disco: $Disco"
Write-Host ""

# ── Claude tiene que estar cerrado, SIEMPRE ───────────────────────────────────────────────────
if (Get-Process -Name "Claude*" -ErrorAction SilentlyContinue) {
  Write-Host "  PARA. Claude esta abierto." -ForegroundColor Red
  Write-Host "  Cierralo por completo antes de sincronizar: las memorias son bases de datos y" -ForegroundColor Red
  Write-Host "  copiarlas mientras se escriben es justo lo que hacia perder coherencia." -ForegroundColor Red
  throw "Claude abierto."
}

$unidad = Split-Path $Disco -Qualifier
if ($unidad -and -not (Test-Path "$unidad\")) { throw "No encuentro la unidad $unidad. Esta conectado el disco?" }

function Leer-Json($ruta) {
  if (Test-Path $ruta) { return Get-Content $ruta -Raw | ConvertFrom-Json }
  return $null
}

$enDisco = Leer-Json $Estado
$marca   = Leer-Json $MarcaLocal

# ══════════════════════════════════════════════════════════════════════════════════════════════
if ($Modo -eq "llevar") {

  # EL CANDADO: no dejar pisar trabajo del otro PC que nunca se trajo a este.
  if ($enDisco -and $enDisco.pc -ne $EstePC) {
    $traido = if ($marca) { $marca.fecha_del_disco } else { "nunca" }
    if ($traido -ne $enDisco.fecha) {
      Write-Host "  PARA. El disco trae trabajo de otro PC que este nunca trajo." -ForegroundColor Red
      Write-Host ""
      Write-Host "    En el disco hay:  $($enDisco.pc)  del  $($enDisco.fecha)" -ForegroundColor Yellow
      Write-Host "    Este PC trajo:    $traido" -ForegroundColor Yellow
      Write-Host ""
      Write-Host "  Si llevas ahora, pisas ese trabajo y lo pierdes." -ForegroundColor Red
      Write-Host "  Lo correcto: primero  sincronizar.ps1 traer $Disco  y seguir desde ahi." -ForegroundColor Yellow
      if (-not $Forzar) { throw "Candado: hay trabajo sin traer." }
      Write-Host "  (-Forzar: siguiendo de todas formas)" -ForegroundColor DarkYellow
    }
  }

  & (Join-Path $AquiScript "empaquetar.ps1") -Destino $Disco -SinPlugins:$SinPlugins -SinConversaciones:$SinConversaciones

  # Sellar el disco con quien lo dejo y cuando.
  Push-Location "C:\Users\USER\Documents\GitHub\gps-satelital"
  $rama   = git branch --show-current
  $commit = (git log --oneline -1) -replace "[^\x20-\x7E]", ""
  Pop-Location
  $memorias = (Get-ChildItem "C:\Users\USER\.claude\projects\C--Users-USER-Documents-GitHub-gps-satelital\memory" -File -ErrorAction SilentlyContinue).Count

  @{ pc = $EstePC; fecha = $Ahora; rama = $rama; commit = $commit; memorias = $memorias } |
    ConvertTo-Json | Out-File $Estado -Encoding ASCII

  # Este PC ya esta al dia con lo que hay en el disco (lo acaba de poner el mismo).
  @{ fecha_del_disco = $Ahora; pc_origen = $EstePC } | ConvertTo-Json | Out-File $MarcaLocal -Encoding ASCII

  Write-Host "  LISTO. El disco quedo sellado: $EstePC - $Ahora" -ForegroundColor Cyan
  Write-Host "  Ya puedes expulsarlo y llevartelo." -ForegroundColor Yellow
  Write-Host ""
}

# ══════════════════════════════════════════════════════════════════════════════════════════════
if ($Modo -eq "traer") {

  if (-not $enDisco) {
    Write-Host "  AVISO: el disco no tiene sello (ESTADO.json). Puede ser la primera vez." -ForegroundColor Yellow
  } else {
    Write-Host "  En el disco hay trabajo de:  $($enDisco.pc)   $($enDisco.fecha)" -ForegroundColor Green
    Write-Host "  Rama $($enDisco.rama) - $($enDisco.commit) - $($enDisco.memorias) memorias"
    Write-Host ""
    if ($enDisco.pc -eq $EstePC -and $marca -and $marca.fecha_del_disco -eq $enDisco.fecha) {
      Write-Host "  (Este mismo PC fue el ultimo que lo dejo: ya estabas al dia.)" -ForegroundColor DarkGray
    }
  }

  & (Join-Path $AquiScript "restaurar.ps1") -Paquete $Paquete

  if ($enDisco) {
    @{ fecha_del_disco = $enDisco.fecha; pc_origen = $enDisco.pc } | ConvertTo-Json | Out-File $MarcaLocal -Encoding ASCII
  }

  Write-Host "  LISTO. Ya puedes abrir Claude en este PC." -ForegroundColor Cyan
  Write-Host ""
}
