-- Migración 104: la liquidación devuelve también el SALDO A FAVOR
--
-- Regla del dueño (19-ago): «los saldos a favor son dinero del cliente y también se incluyen
-- normal en la liquidación como un dinero que hay que entregarle IGUAL QUE EL AHORRO».
--
-- Hoy la liquidación ni lo mira: calcula ahorro − deudas − daños y el saldo a favor se queda en el
-- contrato, que después se cierra. Esa plata desaparece. Caso real verificado: SERAFIN RODRIGUEZ
-- (IGC39I) tiene $3.000 a favor que se le perderían. Con 40 liquidaciones al año es plata real, y
-- es del cliente. La cesión de contrato sí lo contempla; la liquidación no — otra vez dos puertas
-- haciendo cosas distintas con el mismo dinero.
--
-- POR QUÉ UNA COLUMNA PROPIA Y NO SUMARLO AL AHORRO: la regla de las cifras dice que cada número
-- tiene que decir qué pregunta responde. Si se suma a `ahorro_acumulado`, la pantalla diría
-- "Ahorro $421.000" cuando su ahorro son $418.000 — un número correcto con la etiqueta
-- equivocada, que es justo lo que hizo que a LIBINTO se le cobrara de más. Con renglón propio,
-- el cliente ve de dónde sale cada peso que se le devuelve.
--
-- Se sella el valor del día de la liquidación (no se recalcula) por lo mismo que el reparto de los
-- premios: el documento se FIRMA, y lo firmado no puede cambiar después.

alter table public.liquidaciones
  add column if not exists saldo_favor numeric not null default 0;

comment on column public.liquidaciones.saldo_favor is
  'Saldo a favor del cliente al liquidar. Se le devuelve igual que el ahorro. Sellado el día del cálculo.';
