-- ═══════════════════════════════════════════════════════════════════════════════════════════
-- 154 — RELLENAR QUIÉN DEL EQUIPO TRAJO A LOS CLIENTES QUE YA ESTABAN (15-sep-2026)
--
-- La mig 153 creó `clientes.referido_por_funcionario`, pero los clientes viejos lo tienen vacío.
-- El dato SÍ existía: el formulario siempre pidió "Referido por (nombre y cédula)", y ahí el
-- funcionario escribía el nombre del cobrador cuando era él quien lo había traído. Hallazgo del
-- dueño: *"sí tiene ese dato ya, que siempre se pide al registrar un cliente"*.
--
-- 🔴 POR QUÉ LA LISTA VA ESCRITA A MANO Y NO SE BUSCA POR PARECIDO
-- El primer intento comparó solo el PRIMER NOMBRE y produjo falsos positivos que habrían pagado
-- nómina de verdad a quien no le tocaba:
--     'CARLOS ALBERTO PEREA'     → casaba con Carlos Alvarez / Carlos Ariza   (es un CLIENTE)
--     'LUIS CARLOS ORDOÑEZ'      → casaba con Carlos Alvarez / Carlos Ariza   (es un CLIENTE)
--     'JOHAN PEREZ PEREZ'        → casaba con Johan David Rojas               (es un CLIENTE)
--     'ANTONIO MONTERROZA JULIO' → casaba con Julio cesar correa ospino       (es un CLIENTE)
-- La mayoría de los nombres de ese campo son CLIENTES refiriendo clientes (el programa de premios
-- de guantes/casco), que NO paga nómina. Por eso acá van los cuatro nombres exactos, revisados uno
-- por uno contra la lista del equipo, y nada más.
--
-- QUÉ PLATA MUEVE: 20 clientes en total; 17 ya recibieron su moto → $510.000 repartidos en las
-- semanas desde el 8-ago. Ninguna semana de nómina está cerrada, así que todas se recalculan.
-- Los 3 que todavía no reciben moto no pagan nada hoy: se pagarán solos el día de su entrega.
-- El dueño lo aprobó viendo estas cifras.
--
-- Es idempotente: solo toca las filas que están vacías. Correrla dos veces no hace nada la segunda.
-- ═══════════════════════════════════════════════════════════════════════════════════════════

with equipo(escrito, nombre_real) as (
  values ('CARLOS ALVAREZ',  'Carlos Alvarez'),
         ('JOHAN ROJAS',     'Johan David Rojas'),
         ('LUMAR AVENDAÑO',  'Lumar Avendaño Pineda'),
         ('BRANDON ROJAS',   'Brandon Rojas')
)
update public.clientes c
   set referido_por_funcionario = p.id
  from equipo e
  join public.profiles p on p.nombre = e.nombre_real
 where upper(trim(c.referido_por_nombre)) = e.escrito
   and c.referido_por_funcionario is null;

-- ─── VERIFICACIÓN ────────────────────────────────────────────────────────────────────────────
-- Debe dar: Johan David Rojas 9 · Carlos Alvarez 6 · Lumar Avendaño Pineda 4 · Brandon Rojas 1
select p.nombre as cobrador, count(*) as clientes_que_trajo
from public.clientes c
join public.profiles p on p.id = c.referido_por_funcionario
group by 1
order by 2 desc;
