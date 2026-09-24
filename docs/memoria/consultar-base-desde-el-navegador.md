---
name: consultar-base-desde-el-navegador
description: "Cómo medir contra la base y probar funciones reales desde la consola del Browser pane con la sesión del dueño, en vez de pasarle consultas para que pegue"
metadata: 
  node_type: memory
  type: reference
  originSessionId: 4d849eb2-8be4-4b25-abd8-2432e669ac90
  modified: 2026-09-23T22:46:16.752Z
---

# Consultar la base y probar funciones reales desde el navegador (21-sep-2026)

Hasta el 21-sep, cada vez que hacía falta **medir** algo yo le pasaba la consulta al dueño para que
la pegara en Supabase y me devolviera el resultado. Lento, y se perdían vueltas.

**Ya no hace falta.** El dev server corre en `localhost:5173` en el Browser pane, **con la sesión
de FREDY (ADMIN_PRINCIPAL) abierta**. Desde ahí se puede consultar la base y llamar a las funciones
reales de la app con los permisos de verdad.

## Cómo

```js
const { supabase } = await import('/src/lib/supabase.ts');
const { data } = await supabase.from('contratos').select('*').eq('estado','Activo').limit(5);
```

Cualquier módulo del proyecto se importa por su ruta: `/src/utils/cicloPago.ts`,
`/src/hooks/useDocumentos.ts`, `/src/utils/pdf.ts`, `/src/lib/storagePrivado.ts`…

**React va por otra ruta** — el especificador pelado no resuelve en la consola:
```js
const React = await import('/node_modules/.vite/deps/react.js');
const RD    = await import('/node_modules/.vite/deps/react-dom_client.js');
```
Con eso se puede **montar un componente suelto** (`ImgPrivada`, `ModalDocumentosMoto`…) en un div
temporal y hacerle clic a sus botones, sin navegar por la app.

## Para probar lo que se imprime

Las funciones de impresión escriben en una ventana nueva. Espía temporal:
```js
let cap = ''; const orig = window.open;
window.open = function () {
  const l = {}; Object.defineProperty(l, 'href', { set(v){}, get(){ return ''; } });
  return { location:l, closed:false, close(){}, focus(){}, print(){},
           document:{ write(h){ cap += String(h); }, close(){} } };
};
await imprimirLoQueSea(...);
window.open = orig;   // ⚠️ SIEMPRE devolverlo
```

## 🔴 Las trampas (las tres me pasaron el mismo día)

1. **Devolver `window.open` al nativo al terminar.** Si se encadenan varios espías, guardar el
   original UNA vez; restaurar al "anterior" deja puesto el espía de antes y la app queda rota
   para el dueño (no abriría ninguna impresión). Lo más seguro: **recargar la página al final** y
   verificar con `/native code/.test(String(window.open))`.
2. **No cortar lo capturado.** Mi primer espía guardaba solo 4.000 letras y **la firma va al final**
   del documento: reporté "0 imágenes" en una liquidación que sí las tenía. Capturar completo y
   contar después.
3. **No medir una imagen con un reloj.** Una foto de 3060×4080 ya tiene `naturalWidth` con valor
   mientras `complete` sigue en falso. Un `setTimeout(3500)` dio "no cargó" cuando sí estaba
   cargando. **Esperar el evento**, con un tope de tiempo — no el reloj.
4. 🔴 **SUPABASE DEVUELVE MÁXIMO 1.000 FILAS.** Sin `.range()` un `select` de `pagos` (≈3.000)
   trae solo el primer tercio **sin avisar**: no hay error, la consulta "funciona". El 23-sep me
   hizo reportar que LUIS tenía $0 y RAFAEL $8.500 cuando tenían $9.000 y $100.000 — los pagos de
   esos contratos simplemente no venían en el lote. **Toda barrida de flota se pagina:**
   ```js
   async function todos(tabla, cols, filtro) {
     let out = [], desde = 0;
     for (let i = 0; i < 20; i++) {
       let q = supabase.from(tabla).select(cols).range(desde, desde + 999);
       if (filtro) q = filtro(q);
       const { data, error } = await q; if (error) throw error;
       out = out.concat(data || []);
       if (!data || data.length < 1000) break;
       desde += 1000;
     }
     return out;
   }
   ```
   Señal de alarma: si el conteo da exactamente **1000**, está cortado. Y una consulta filtrada
   (ej. `tipo_registro='saldo_favor'` → 148) sí es confiable, pero hay que **mirar el número**
   antes de fiarse. Para cifras de flota, lo más seguro sigue siendo la consulta SQL que corre el
   dueño: esa no tiene tope.

## Lo que NO se puede

- **Correr SQL de migración.** No hay conexión directa a Postgres: los bloques se le siguen pasando
  al dueño para pegar (y la [[regla-memoria-siempre]] de SQL en el chat, nunca como archivo).
- **Escribir contraseñas.** Si la sesión se cae, la vuelve a abrir él.
- Cuidado con **escribir** en la base desde acá: la sesión es de ADMIN_PRINCIPAL y no hay red de
  seguridad. Para medir, solo `select`. Ver [[regla-esencia-y-rastro]].

Caso donde se usó por primera vez: [[fuga-documentos-storage]] — 8 documentos reales verificados
en minutos, en vez de 28 casillas marcadas a mano.
