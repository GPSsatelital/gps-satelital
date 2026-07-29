import type { ViewKey } from "../App";

// Módulos que un admin puede asignar como "acceso" a un usuario.
// dashboard y configuración quedan fuera: siempre están disponibles.
export type ModuloAsignable = { key: ViewKey; label: string; icon: string; grupo: string };

export const MODULOS_ASIGNABLES: ModuloAsignable[] = [
  { key: "clientes",         label: "Clientes",           icon: "👥", grupo: "Operaciones" },
  { key: "mis_visitas",      label: "Mis Visitas",        icon: "🏠", grupo: "Operaciones" },
  { key: "contratos",        label: "Contratos",          icon: "📄", grupo: "Operaciones" },
  { key: "cobros",           label: "Cartera & Cobros",   icon: "💳", grupo: "Operaciones" },
  { key: "motos",            label: "Motos",              icon: "🏍️", grupo: "Flota" },
  { key: "taller",           label: "Taller",             icon: "🔧", grupo: "Flota" },
  { key: "tarjetas_llaves",  label: "Tarjetas y Llaves",  icon: "🪪", grupo: "Flota" },
  { key: "cobro_diario",     label: "Cobro Diario",       icon: "📅", grupo: "Finanzas" },
  { key: "alertas",          label: "Alertas",            icon: "🔔", grupo: "Finanzas" },
  { key: "inmovilizaciones", label: "Inmovilizaciones",   icon: "🚨", grupo: "Finanzas" },
  { key: "historial_pagos",  label: "Historial de Pagos", icon: "🧾", grupo: "Finanzas" },
  { key: "reportes",         label: "Reportes",           icon: "📈", grupo: "Finanzas" },
  { key: "caja",             label: "Caja Diaria",        icon: "💰", grupo: "Finanzas" },
  { key: "liquidaciones",    label: "Liquidaciones",      icon: "📊", grupo: "Finanzas" },
  { key: "referidos",        label: "Referidos",          icon: "🤝", grupo: "Finanzas" },
  { key: "usuarios",         label: "Usuarios & Roles",   icon: "👤", grupo: "Administración" },
  { key: "importacion",      label: "Importación Excel",  icon: "📥", grupo: "Administración" },
];

// Vistas siempre accesibles, sin importar permisos personalizados
export const MODULOS_SIEMPRE: ViewKey[] = ["dashboard", "configuracion", "ficha_cliente", "ficha_moto"];

// Sugerencia de accesos por rol — precarga los checkboxes al elegir un rol.
// Es solo una plantilla; el admin puede ajustar libremente.
export const ACCESOS_SUGERIDOS: Record<string, ViewKey[]> = {
  ADMIN_PRINCIPAL: MODULOS_ASIGNABLES.map(m => m.key),
  ADMIN: ["clientes", "contratos", "cobros", "motos", "taller", "tarjetas_llaves", "cobro_diario", "alertas", "inmovilizaciones", "historial_pagos", "reportes", "caja", "liquidaciones", "referidos"],
  SUBADMIN: ["clientes", "contratos", "cobros", "motos", "taller", "tarjetas_llaves", "cobro_diario", "alertas", "inmovilizaciones"],
  SECRETARIA: ["clientes", "contratos", "cobros", "motos", "taller", "tarjetas_llaves", "caja", "cobro_diario", "historial_pagos"],
  MECANICO: ["taller"],
  // El visitador NO lleva "clientes": no debe ver la ficha de nadie. Su pantalla propia se
  // alimenta de la función mis_visitas_asignadas() (mig 076), que solo devuelve nombre,
  // dirección y teléfono del titular y del acompañante.
  VISITADOR: ["mis_visitas"],
  SOCIO: [],
};
