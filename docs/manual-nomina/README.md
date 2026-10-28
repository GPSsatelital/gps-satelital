# La nómina nueva — manual

**11 páginas A4.** Mismo formato que `docs/manual-liquidacion/`: a la izquierda la foto real de la
pantalla, a la derecha la explicación. El proceso de D-057: la semana se cuenta con el día en que pagó
el cliente → precorte lunes y martes → cierre y firma «revisé y estoy de acuerdo» el miércoles → pago
del 15 y el 30 con firma «recibí conforme» y comprobante.

Va junto con el **tema 7** de la capacitación (`docs/capacitacion/tema-7-la-nomina-nueva.html`) y su
video `Video 6 - La nomina nueva.mp4`, metido en el PowerPoint del tema 7.

🔴 **El PDF y las capturas NO se versionan**: llevan los nombres de los supervisores y sus cifras.

## Cómo volver a generarlo

1. Con `npm run dev` corriendo y la sesión abierta: `node motogestion/scripts/manual/recibe-sesion.mjs`
   y entregarle la sesión desde la consola de la app (igual que el manual de liquidación).
2. `node motogestion/scripts/manual/capturas-nomina.mjs` (con el argumento `pago` hace solo las fotos
   del pago).
3. `node motogestion/scripts/manual/revisar-paginas.mjs docs/manual-nomina/manual-nomina.html`
4. Chrome sin ventana con `--print-to-pdf` sobre `manual-nomina.html` → `LA-NOMINA-NUEVA.pdf`.
5. Borrar `%TEMP%\mg-sesion-manual.json`.

## Lo que hay que saber del guion de capturas

- **En ese Chrome no se escribe NADA en la base.** Un candado contesta en la misma página toda
  escritura. La única rpc que deja pasar es `nombres_subadmins`, que solo lee. Si el candado no quedó
  puesto, `exigirCandado()` detiene el guion antes de tocar nada.
- **El día se finge** con `localStorage.__hoy_manual` (se intercepta `src/utils/fecha.ts`): 27-oct
  semana en curso, 2-nov precorte, 4-nov cierre, 14-nov pago. El reloj de la sesión NO se finge: si se
  fingiera, al renovar el token se cerraría la sesión del dueño.
- **Los cierres de la foto del pago son de mentira** (`localStorage.__cierres_manual`): el 14-nov
  todavía no existía ninguno de verdad. Las ventanas de cierre y de pago se abren, pero no se confirman.
- Si se cambia el guion, el regex de la rpc va con doble barra dentro del texto inyectado
  (`/rest\\/v1\\/rpc\\/.../`). Con una sola barra el candado se apaga sin avisar (pasó el 27-oct).
