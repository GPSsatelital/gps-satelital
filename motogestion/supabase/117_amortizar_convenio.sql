-- ═══════════════════════════════════════════════════════════════════════════════════════════
-- 117 — LA AMORTIZACIÓN INVOCABLE (23-ago-2026, remate de la 116)
--
-- El caso: el dueño le escribe la partitura a un convenio VIEJO que ya lleva cuotas pagadas
-- (ej. XZZ70H con 7 de 9). Con solo la 116, sus deudas envueltas quedaban esperando el
-- PRÓXIMO pago del cliente para ponerse al día — días de inconsistencia entre la pantalla
-- (tachado derivado, correcto) y la tabla `deudas` (congelada).
--
-- Solución: el recálculo se saca a una función invocable `amortizar_convenio(uuid)` —
-- idempotente, determinista, no recibe montos (recalcula del estado real: no se puede usar
-- para torcer nada) — y la llaman DOS caminos:
--   · el trigger de pagos (delega — una sola lógica, misma de la 116)
--   · el editor de la partitura, justo después de guardar (rpc desde el frontend)
-- ═══════════════════════════════════════════════════════════════════════════════════════════

create or replace function public.amortizar_convenio(p_convenio_id uuid)
returns void language plpgsql security definer set search_path = public as $$
declare
  v_cv public.convenios;
  v_entrada numeric;
  v_r jsonb;
  v_monto numeric;
  v_pag numeric;
begin
  select * into v_cv from public.convenios where id = p_convenio_id;
  if v_cv.id is null or v_cv.partitura is null or v_cv.estado <> 'activo' then return; end if;

  select coalesce(sum(aplicado_convenio), 0) into v_entrada
    from public.pagos
   where contrato_id = v_cv.contrato_id and estado = 'Confirmado' and created_at >= v_cv.created_at;

  for v_r in select * from jsonb_array_elements(v_cv.partitura) loop
    v_monto := coalesce((v_r->>'monto')::numeric, 0);
    v_pag := least(greatest(v_entrada, 0), v_monto);
    v_entrada := v_entrada - v_pag;
    if v_r->>'tipo' = 'deuda' and (v_r->>'ref') is not null then
      update public.deudas
         set monto_pendiente = v_monto - v_pag,
             estado = case when v_monto - v_pag <= 0 then 'pagada' else 'en_convenio' end
       where id = (v_r->>'ref')::uuid
         and estado in ('en_convenio', 'pagada');
    end if;
  end loop;
end; $$;

-- El trigger de la 116 ahora DELEGA: una sola lógica viva, imposible que diverjan.
create or replace function public.convenio_amortiza_deudas()
returns trigger language plpgsql security definer set search_path = public as $$
declare
  v_cv_id uuid;
begin
  select id into v_cv_id from public.convenios
   where contrato_id = coalesce(new.contrato_id, old.contrato_id) and estado = 'activo'
   order by created_at desc limit 1;
  if v_cv_id is not null then
    perform public.amortizar_convenio(v_cv_id);
  end if;
  return coalesce(new, old);
end; $$;

-- Cualquier autenticado puede invocarla: es un recálculo determinista del estado real —
-- no recibe montos ni decide nada, así que no hay forma de usarla para torcer una cifra.
revoke all on function public.amortizar_convenio(uuid) from public;
grant execute on function public.amortizar_convenio(uuid) to authenticated;

-- Verificación
select
  (select count(*) from pg_proc where proname = 'amortizar_convenio') as fn_amortizar,
  (select count(*) from pg_trigger where tgname in ('trg_convenio_amortiza_iu', 'trg_convenio_amortiza_del')) as triggers;
-- Debe dar: fn_amortizar = 1 · triggers = 2
