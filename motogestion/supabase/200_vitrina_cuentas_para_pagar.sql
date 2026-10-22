-- ═══════════════════════════════════════════════════════════════════════════════════════════
-- 200 — LAS CUENTAS PARA PAGAR, EN LA VITRINA DE ZALA (21-oct-2026, dueño: «terminemos lo de las
--       cuentas para que ZALA quede bien»; antes: «solo muéstrale lo que te digo»)
--
-- EL PROBLEMA (medido el 16 y el 21-oct):
--   · ZALA no tenía de dónde leer las cuentas de la empresa: ninguna vista de `zala` las traía y
--     `zala_lector` no puede abrir `cuentas_bancarias`. Si un cliente le pide «el Nequi», ZALA usa
--     una lista suya, que puede seguir teniendo la Bancolombia de COSTA (apagada desde el 9-oct).
--   · La protección de ZALA bloquea cualquier variable con forma de celular, y un Nequi ES un
--     celular. Desde el 15-sep falló todo mensaje de cuentas con un solo Nequi: PRADERA 2,
--     RASTREADOR 5, COSTA 1 (y 1 más el 21-oct, la prueba con el número espaciado).
--
-- QUÉ HACE: `zala.cuentas_pago`, una fila por grupo con SOLO las cuentas encendidas en
-- Configuración → Cuentas bancarias. Apagar o encender una cuenta allá cambia esta lista al instante.
--   · `cuentas_texto`: el mismo texto que pone la app en {cuentas} (espejo de `textoCuentas()` en
--     src/hooks/useCuentasBancarias.ts): un solo renglón, unidas con «,» y «y».
--   · `cuentas`: cada cuenta por separado (banco, tipo, número, titular).
--   · `numeros`: los números solo con dígitos. Con esta lista la protección de ZALA puede dejar
--     pasar las cuentas de la empresa y seguir bloqueando cualquier otro celular.
--   Un grupo sin cuentas encendidas no sale (hoy: USADAS).
--
-- NO CAMBIA NADA DE LO QUE YA EXISTÍA: ni la tabla de cuentas, ni el botón de la app, ni otras vistas.
--
-- LA PRUEBA VA ADENTRO: compara el texto con el que arma la app hoy (medido el 21-oct), comprueba que
-- la Bancolombia apagada no aparece, y enciende la Bancolombia un instante para ver que dos cuentas
-- salen «A y B» como la app — y la vuelve a dejar como estaba. Si algo no da, no queda nada.
--
-- ── CÓMO DESHACERLA ─────────────────────────────────────────────────────────────────────────
--   drop view if exists zala.cuentas_pago;
--   delete from zala.diccionario where vista = 'cuentas_pago';
--   delete from public.migraciones_aplicadas where numero = 200;
-- ═══════════════════════════════════════════════════════════════════════════════════════════

begin;

create or replace view zala.cuentas_pago as
with activas as (
  select g.grupo, c.banco, nullif(c.tipo, '') as tipo, c.numero, nullif(c.titular, '') as titular, c.orden
    from public.cuentas_bancarias c
   cross join lateral unnest(c.grupos) as g(grupo)
   where c.activa
),
numeradas as (
  select a.*,
         row_number() over (partition by a.grupo order by a.orden, a.banco) as pos,
         count(*)     over (partition by a.grupo)                           as total,
         a.banco || coalesce(' ' || lower(a.tipo), '') || ' ' || a.numero
                 || coalesce(' (' || a.titular || ')', '')                  as parte
    from activas a
)
select grupo,
       string_agg(case when pos = 1 then '' when pos = total then ' y ' else ', ' end || parte, ''
                  order by pos)                                                         as cuentas_texto,
       jsonb_agg(jsonb_build_object('banco', banco, 'tipo', tipo, 'numero', numero, 'titular', titular)
                 order by pos)                                                          as cuentas,
       array_agg(regexp_replace(numero, '\D', '', 'g') order by pos)                    as numeros
  from numeradas
 group by grupo;

grant select on zala.cuentas_pago to zala_lector;

insert into zala.diccionario (vista, columna, significado, valores, zala_lo_dice, confirmado_por_dueno) values
('cuentas_pago', 'grupo', 'El portafolio. Al cliente se le dan SOLO las cuentas del grupo de SU moto (zala.cliente.grupo), nunca las de otro. Si su grupo no sale en esta vista, no tiene cuenta para transferir: se le pide que se comunique con la oficina.', 'COSTA · PRADERA · RASTREADOR · USADAS', 'no', true),
('cuentas_pago', 'cuentas_texto', 'Las cuentas encendidas del grupo, ya escritas en un solo renglón ("Nequi ahorros 3128317132 (Yeiner acosta)"; con dos: "A y B"). Es la variable {cuentas} de la plantilla cuentas_pago, igual a la que pone MotoGestión. Si el cliente pide "el Nequi" o "las cuentas", se le dice ESTO y nada más: una cuenta apagada en MotoGestión no se le da nunca, aunque ZALA la haya conocido antes.', null, 'sí', true),
('cuentas_pago', 'cuentas', 'Las mismas cuentas por separado: banco, tipo, número y titular, en el orden en que se le dan al cliente.', null, 'sí', true),
('cuentas_pago', 'numeros', 'Los números de las cuentas, solo dígitos. Son de la EMPRESA, no de clientes: la protección contra celulares en las variables debe dejarlos pasar (un Nequi es un número de celular). Cualquier otro número con forma de celular se sigue bloqueando.', null, 'no', true)
on conflict (vista, columna) do update set significado = excluded.significado, valores = excluded.valores,
  zala_lo_dice = excluded.zala_lo_dice, confirmado_por_dueno = excluded.confirmado_por_dueno, actualizado = now();

-- ── La prueba ───────────────────────────────────────────────────────────────────────────────
do $prueba$
declare
  v_costa text; v_pradera text; v_rastreador text; v_usadas int; v_bancolombia int;
  v_dos text; v_nums text[];
begin
  select cuentas_texto into v_costa      from zala.cuentas_pago where grupo = 'COSTA';
  select cuentas_texto into v_pradera    from zala.cuentas_pago where grupo = 'PRADERA';
  select cuentas_texto into v_rastreador from zala.cuentas_pago where grupo = 'RASTREADOR';
  select count(*) into v_usadas from zala.cuentas_pago where grupo = 'USADAS';
  select count(*) into v_bancolombia from zala.cuentas_pago where cuentas_texto like '%78400006116%';
  select numeros into v_nums from zala.cuentas_pago where grupo = 'COSTA';

  -- Dos cuentas: se enciende la Bancolombia un instante y se deshace.
  begin
    update public.cuentas_bancarias set activa = true where numero = '78400006116';
    select cuentas_texto into v_dos from zala.cuentas_pago where grupo = 'COSTA';
    raise exception using errcode = 'ZZ200', message = 'deshacer';
  exception when sqlstate 'ZZ200' then null;
  end;

  raise notice 'COSTA: % | PRADERA: % | RASTREADOR: % | USADAS filas: % | Bancolombia visible: % | COSTA con dos: %',
    v_costa, v_pradera, v_rastreador, v_usadas, v_bancolombia, v_dos;

  if v_costa is distinct from 'Nequi ahorros 3128317132 (Yeiner acosta)'
     or v_pradera is distinct from 'Nequi ahorros 3009569084 (Wilder restrepo)'
     or v_rastreador is distinct from 'Nequi ahorros 3044192404 (Yeny moreno)'
     or v_usadas <> 0 or v_bancolombia <> 0
     or v_nums is distinct from array['3128317132']
     or v_dos is distinct from 'Bancolombia ahorros 78400006116 (Club moteros de la costa) y Nequi ahorros 3128317132 (Yeiner acosta)'
     or (select activa from public.cuentas_bancarias where numero = '78400006116') then
    raise exception 'La lista de cuentas no dio lo esperado (COSTA: %, PRADERA: %, RASTREADOR: %, USADAS: %, Bancolombia visible: %, con dos: %). No se cambió nada.',
      v_costa, v_pradera, v_rastreador, v_usadas, v_bancolombia, v_dos;
  end if;
end
$prueba$;

select public.registrar_migracion(200, '200_vitrina_cuentas_para_pagar.sql',
  'zala.cuentas_pago: las cuentas encendidas de cada grupo, con el texto de {cuentas} y los números que la protección de ZALA debe dejar pasar');

commit;

-- ─── VERIFICACIÓN — debe dar 3 filas (COSTA, PRADERA, RASTREADOR), cada una con su Nequi ────────
select grupo, cuentas_texto, numeros,
       has_table_privilege('zala_lector', 'zala.cuentas_pago', 'SELECT') as zala_la_puede_leer
  from zala.cuentas_pago
 order by grupo;
