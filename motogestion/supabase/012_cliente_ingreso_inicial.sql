-- =========================================================
-- MIGRACIÓN 012 — Ingreso inicial del cliente
-- Ejecutar en Supabase SQL Editor
-- =========================================================
-- Monto que el cliente entrega al registrarse. Mínimo $100.000,
-- ideal ~$280.500 (55% de la base inicial de $510.000).

alter table public.clientes
  add column if not exists ingreso_inicial numeric;
