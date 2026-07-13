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

export type AccionDef = { key: string; label: string; grupo: string; dbEnforced?: boolean };

export const ACCIONES: AccionDef[] = [
  // 💵 Dinero — reforzadas en la BD
  { key: "registrar_efectivo",     label: "Registrar pago en efectivo",        grupo: "💵 Dinero", dbEnforced: true },
  { key: "confirmar_transferencia", label: "Confirmar / rechazar transferencia", grupo: "💵 Dinero", dbEnforced: true },
  { key: "eliminar_pago",          label: "Eliminar / anular un pago",          grupo: "💵 Dinero", dbEnforced: true },
  { key: "cerrar_caja",            label: "Cerrar caja diaria",                 grupo: "💵 Dinero" },
  { key: "aplicar_saldo_favor",    label: "Aplicar saldo a favor",              grupo: "💵 Dinero" },
  // 📄 Contratos y cartera
  { key: "crear_contrato",         label: "Crear contrato (wizard)",            grupo: "📄 Contratos" },
  { key: "editar_contrato",        label: "Editar contrato",                    grupo: "📄 Contratos" },
  { key: "editar_deuda",           label: "Editar / eliminar deudas",           grupo: "📄 Contratos" },
  { key: "crear_convenio",         label: "Crear convenio",                     grupo: "📄 Contratos" },
  // 🏍️ Motos y operación
  { key: "recolectar_moto",        label: "Recolectar / retener moto",          grupo: "🏍️ Motos" },
  { key: "cambiar_grupo_moto",     label: "Cambiar el grupo de una moto",       grupo: "🏍️ Motos" },
  { key: "iniciar_liquidacion",    label: "Iniciar liquidación",                grupo: "🏍️ Motos" },
  { key: "aprobar_visita",         label: "Aprobar / rechazar visita o cliente", grupo: "🏍️ Motos" },
  { key: "lista_negra",            label: "Poner / quitar lista negra",         grupo: "🏍️ Motos" },
  { key: "editar_configuracion",   label: "Editar configuración / mensajes",    grupo: "⚙️ Sistema" },
];

export const ACCION_KEYS = ACCIONES.map(a => a.key);

// Default por rol (el "techo" de cada rol). El admin puede recortar/ampliar por persona.
// ADMIN_PRINCIPAL no se lista porque el bypass de puede() le da todo.
// Alineado con las reglas del negocio (CLAUDE.md): ADMIN no registra efectivo ni
// elimina pagos; SECRETARIA registra/confirma dinero; SUBADMIN gestiona sus motos.
export const DEFAULT_ACCIONES: Record<Role, string[]> = {
  ADMIN_PRINCIPAL: ACCION_KEYS,
  ADMIN: ACCION_KEYS.filter(k => k !== "registrar_efectivo" && k !== "eliminar_pago"),
  SECRETARIA: [
    "registrar_efectivo", "confirmar_transferencia", "cerrar_caja", "aplicar_saldo_favor",
    "crear_contrato", "crear_convenio", "aprobar_visita",
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
