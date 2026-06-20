# GPS Satelital — MotoGestión

## Regla de despliegue (OBLIGATORIO)

Después de cada `git push` a la rama de desarrollo, **siempre** hacer merge a `main` para que Vercel despliegue los cambios:

```bash
git checkout main && git pull origin main && git merge <rama-actual> && git push origin main && git checkout <rama-actual>
```

Vercel despliega automáticamente desde `main`. Sin este paso los cambios no llegan a producción.

## Stack
- React 19 + TypeScript + Vite 8
- Supabase (project: jvfkprkjysjffhzjitgl)
- Vercel (deploy desde `main`)
- CSS inline únicamente, sin UI frameworks

## Convenciones
- Estilos: solo CSS inline (`style={{}}`)
- Sin comentarios en el código salvo que el WHY sea no obvio
- Sin features extras fuera de lo pedido
- Commits en español descriptivos

## Módulos actuales
- Clientes (registro, aprobación, visita domiciliaria)
- Contratos (Diario/Semanal/Quincenal/Mensual)
- Motos (estados, retenciones, grupos Costa/Pradera/Rastreador)
- Cartera / Cobros (cuota pactada, deudas, convenios, gestiones)
- Liquidaciones
- Taller / Ubicaciones

## Documentación completa
Ver `DOC_MAESTRO.md` para reglas de negocio detalladas.
