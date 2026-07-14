import type { Role } from "../contexts/AuthContext";

// Catálogo curado de ACCIONES sensibles controlables por usuario (Opción A).
// A diferencia de los MÓDULOS (qué pantallas ve, en modulos.ts), esto controla
// QUÉ puede hacer dentro de ellas. Cada acción tiene 3 estados por usuario:
// "permitir" | "bloquear" | (ausente = usar el default del rol).
//
// Principio "el rol es el techo": el default por rol define lo normal; el override
// por persona recorta (o, donde la BD lo permita, amplía). ADMIN_PRINCIPAL puede
// todo siempre (bypass en puede()).
//
// dbEnforced = además del frontend, se refuerza en la base de datos (migración 048),
// porque son acciones de dinero: esconder el botón no basta, la BD debe rechazarlas.

export type EstadoAccion = "permitir" | "bloquear";
export type AccionesUsuario = Record<string, EstadoAccion>;

// `modulo` = ViewKey del módulo al que pertenece la acción (para anidarla bajo su
// módulo en la UI de permisos). Los que caen en un módulo "siempre visible"
// (configuracion) se muestran en un grupo aparte al final.
export type AccionDef = { key: string; label: string; modulo: string; dbEnforced?: boolean };

export const ACCIONES: AccionDef[] = [
  // Cartera & Cobros
  { key: "registrar_efectivo",     label: "Registrar pago en efectivo",         modulo: "cobros", dbEnforced: true },
  { key: "confirmar_transferencia", label: "Confirmar / rechazar transferencia", modulo: "cobros", dbEnforced: true },
  { key: "eliminar_pago",          label: "Eliminar / anular un pago",          modulo: "cobros", dbEnforced: true },
  { key: "aplicar_saldo_favor",    label: "Aplicar saldo a favor",              modulo: "cobros" },
  { key: "editar_deuda",           label: "Editar / eliminar deudas",           modulo: "cobros" },
  { key: "crear_convenio",         label: "Crear convenio",                     modulo: "cobros" },
  // Caja
  { key: "cerrar_caja",            label: "Cerrar caja diaria",                 modulo: "caja" },
  // Contratos
  { key: "crear_contrato",         label: "Crear contrato (wizard)",            modulo: "contratos" },
  { key: "editar_contrato",        label: "Editar contrato",                    modulo: "contratos" },
  { key: "iniciar_liquidacion",    label: "Iniciar liquidación",                modulo: "contratos" },
  // Motos
  { key: "recolectar_moto",        label: "Recolectar / retener moto",          modulo: "motos" },
  { key: "cambiar_grupo_moto",     label: "Cambiar el grupo de una moto",       modulo: "motos" },
  // Clientes
  { key: "editar_cliente",         label: "Editar datos de clientes",           modulo: "clientes" },
  { key: "aprobar_visita",         label: "Aprobar / rechazar visita o cliente", modulo: "clientes" },
  { key: "lista_negra",            label: "Poner / quitar lista negra",         modulo: "clientes" },
  // Configuración (módulo siempre visible)
  { key: "editar_configuracion",   label: "Editar configuración / mensajes",    modulo: "configuracion" },
];

export const ACCION_KEYS = ACCIONES.map(a => a.key);

// Default por rol (el "techo" de cada rol). El admin puede recortar/ampliar por persona.
// ADMIN_PRINCIPAL no se lista porque el bypass de puede() le da todo.
// Alineado con las reglas del negocio (CLAUDE.md): ADMIN no registra efectivo ni
// elimina pagos; SECRETARIA registra/confirma dinero; SUBADMIN gestiona sus motos.
// Defaults = comportamiento ACTUAL del código (Opción 1 elegida por el usuario:
// preservar acceso, el admin recorta por persona desde la UI). Auditado contra el
// código real, no contra la regla escrita (que en algunos casos es más estricta):
//   registrar_efectivo/aplicar_saldo_favor = puedePagoNormal (SECRETARIA + ADMIN)
//   confirmar_transferencia/cerrar_caja     = esSecretaria (SECRETARIA)  [ADMIN NO]
//   eliminar_pago                           = solo ADMIN_PRINCIPAL (bypass)
//   crear/editar_contrato, editar_deuda     = puedeCrear (ADMIN)
//   aprobar_visita/lista_negra/cambiar_grupo/config = esAdmin (ADMIN)
//   recolectar_moto/iniciar_liquidacion     = ADMIN + SUBADMIN
//   crear_convenio                          = staff de cobro (SECRETARIA + ADMIN)
export const DEFAULT_ACCIONES: Record<Role, string[]> = {
  ADMIN_PRINCIPAL: ACCION_KEYS,
  ADMIN: [
    "registrar_efectivo",
    "crear_contrato", "editar_contrato", "editar_deuda", "crear_convenio",
    "recolectar_moto", "cambiar_grupo_moto", "iniciar_liquidacion",
    "editar_cliente", "aprobar_visita", "lista_negra", "editar_configuracion",
  ],
  SECRETARIA: [
    "registrar_efectivo", "confirmar_transferencia", "cerrar_caja",
    "aplicar_saldo_favor", "crear_convenio", "editar_cliente",
  ],
  SUBADMIN: ["recolectar_moto", "iniciar_liquidacion"],
  MECANICO: [],
  SOCIO: [],
};

// Lógica central de "¿puede esta persona hacer esta acción?" — la MISMA que replica
// la función SQL puede_accion() de la migración 048, para que frontend y BD coincidan.
export function calcularPuede(role: Role, acciones: AccionesUsuario | null | undefined, accion: string): boolean {
  if (role === "ADMIN_PRINCIPAL") return true;
  const ov = acciones?.[accion];
  if (ov === "permitir") return true;
  if (ov === "bloquear") return false;
  return (DEFAULT_ACCIONES[role] ?? []).includes(accion);
}
