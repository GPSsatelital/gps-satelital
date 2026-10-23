# Cómo rodar todo — manual

**16 páginas A4.** Mismo formato que `docs/manual-liquidacion/`: a la izquierda la foto real de la
pantalla, a la derecha la explicación. El proceso completo con OMAR AGUSTIN (RMM66H), el primer caso
de «rodar todo» (D-050/D-052, mig 201): entregar la moto en la app → rodar todo → firma, huella y
video → recién ahí las llaves.

🔴 **El PDF y las capturas NO se versionan**: llevan nombre, cédula y cifras de un cliente real.

## Cómo volver a generarlo

1. Con `npm run dev` corriendo y la sesión abierta: `node motogestion/scripts/manual/recibe-sesion.mjs`
   y entregarle la sesión desde la consola de la app (igual que el manual de liquidación).
2. `node motogestion/scripts/manual/capturas-rodado.mjs`
3. `node motogestion/scripts/manual/revisar-paginas.mjs docs/manual-rodado/manual-rodado.html`
4. Chrome sin ventana con `--print-to-pdf` sobre `manual-rodado.html` → `COMO-RODAR-TODO.pdf`.
5. Borrar `%TEMP%\mg-sesion-manual.json`.

## Lo que hay que saber del guion de capturas

- **En ese Chrome no se escribe NADA en la base.** Un candado contesta en la misma página toda
  escritura (insert, update, delete, rpc que no son de leer, subidas) sin que salga a Supabase. Por eso
  se puede tocar «No rodar» para que se abra el formulario de entrega. El guion imprime la lista de lo
  que bloqueó. El 23-oct se verificó en la base que no quedó guardado nada.
- **Lo único que se finge:** el contrato de OMAR seguía suspendido, así que la ventana del rodado no
  pasaba del paso 1. La respuesta de la vista previa (que no guarda) se recibe sin la razón «no está
  activo». Las cifras son las reales.
- La foto del botón «Rodar por deuda» es de **otro** contrato activo (el de OMAR aún no lo era).
- Cuando OMAR ya tenga su rodado, el guion ya no sirve tal cual: hay que elegir otro cliente.
