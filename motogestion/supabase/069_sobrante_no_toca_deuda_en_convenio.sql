-- ===== 069: el sobrante de un pago NO puede abonar una deuda que ya está en convenio =====
--
-- Caso real (XZN22H, 21-jul): el cliente pagó $280.000. El reparto llenó su cuota ($204.000)
-- y mandó los $76.000 restantes a su "Deuda de apertura — migración", que está en estado
-- 'en_convenio' (ya financiada dentro de su convenio de $901.500 a 13 cuotas de $70.000).
-- Resultado: la deuda bajó $76.000 pero el convenio siguió marcando 0 cuotas pagadas, así que
-- la pantalla le sigue cobrando una cuota de convenio que en la práctica ya cubrió — y al
-- terminar las 13 cuotas habrá pagado esos $76.000 DOS VECES.
-- Mismo caso en XZI10H (DIEGO LOCIN SOTO) con $5.000.
--
-- El orden de aplicación correcto ya estaba documentado: cuota → deuda → convenio → saldo a
-- favor. Lo que faltaba es que "deuda" signifique deuda EXIGIBLE ('pendiente'): las
-- 'en_convenio' no se cobran aparte, se pagan con la cuota del convenio. El frontend ya lo
-- hacía bien (CobrosView filtra `estado === 'pendiente'`); el reparto de la BD usaba
-- `estado <> 'pagada'`, que incluía las de convenio.
--
-- Se corrige de forma quirúrgica sobre la definición VIVA de la función (son ~250 líneas ya
-- probadas: reescribirlas enteras arriesga revertir algo). La reversa NO se toca: al anular
-- un pago hay que devolver lo abonado a la deuda que sea, sin importar su estado actual.

do $$
declare
  v_src  text;
  v_new  text;
  v_viejo constant text := 'where contrato_id = v_row.contrato_id and estado <> ''pagada'' and monto_pendiente > 0';
  v_nuevo constant text := 'where contrato_id = v_row.contrato_id and estado = ''pendiente'' and monto_pendiente > 0';
  v_ocurrencias int;
begin
  select pg_get_functiondef(p.oid) into v_src
    from pg_proc p
    join pg_namespace n on n.oid = p.pronamespace
   where n.nspname = 'public' and p.proname = 'aplicar_pago_confirmado'
   limit 1;

  if v_src is null then
    raise exception 'No existe public.aplicar_pago_confirmado — corre antes la mig 045';
  end if;

  v_ocurrencias := (length(v_src) - length(replace(v_src, v_viejo, ''))) / length(v_viejo);

  if v_ocurrencias = 0 then
    raise notice '069: nada que cambiar — el filtro ya excluye las deudas en convenio.';
    return;
  end if;

  -- Se esperan 3, todas de APLICACIÓN (mig 045): el FIFO del motor v2, el reparto explícito
  -- del v2 y el motor v1. La reversa usa otro filtro (`monto_pendiente < monto`), así que no
  -- entra aquí — al anular un pago hay que devolver lo abonado a la deuda que sea.
  if v_ocurrencias <> 3 then
    raise exception '069: se esperaban 3 ocurrencias del filtro de deudas y hay %. Revisar a mano.', v_ocurrencias;
  end if;

  v_new := replace(v_src, v_viejo, v_nuevo);
  execute v_new;
  raise notice '069: corregidas % ocurrencias — el sobrante ya no abona deudas en convenio.', v_ocurrencias;
end $$;
