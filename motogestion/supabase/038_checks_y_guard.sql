-- ===== 038: CHECKS Y GUARD — cierra los últimos hallazgos de la auditoría (7 jul 2026) =====
-- Verificado contra la BD real (pg_constraint / pg_proc):
-- (1) motos_estado_check NO incluía 'En traspaso' → el cierre de liquidación por
--     cumplimiento (moto que se transfiere al cliente) habría fallado con check
--     violation, igual que falló 'Suspendido' en la recolección (mig 036).
-- (2) motos_grupo_check NO incluía 'USADAS' → la mig 014 nunca se aplicó en la BD real.
-- (3) enforce_profile_role_change usaba public.current_role() — función duplicada de
--     mi_rol() (mismo cuerpo: select role from profiles where id = auth.uid()).
--     Funcionaba, pero se unifica a mi_rol() como única fuente de verdad.
--     Nota: mi_rol() devuelve NULL para el service role (Edge Function manage-users,
--     auth.uid() null) → NULL <> 'ADMIN_PRINCIPAL' es NULL → no bloquea. Correcto:
--     la Edge Function ya valida por su cuenta que quien llama sea ADMIN_PRINCIPAL.

-- 1) motos.estado con los 9 estados del tipo MotoStatus (useMotos.ts)
alter table public.motos drop constraint if exists motos_estado_check;
alter table public.motos add constraint motos_estado_check
  check (estado in ('Disponible','Reservada','Asignada','Mantenimiento','Recuperada','Fiscalia','Transito','Garantia','En traspaso'));

-- 2) motos.grupo con los 5 grupos del tipo GrupoMoto
alter table public.motos drop constraint if exists motos_grupo_check;
alter table public.motos add constraint motos_grupo_check
  check (grupo in ('COSTA','PRADERA','RASTREADOR','USADAS','OTRO'));

-- 3) Guard de roles unificado a mi_rol()
create or replace function public.enforce_profile_role_change()
returns trigger language plpgsql security definer as $$
begin
  if (new.role is distinct from old.role
      or new.permisos is distinct from old.permisos
      or new.grupo is distinct from old.grupo)
     and public.mi_rol() <> 'ADMIN_PRINCIPAL' then
    raise exception 'Solo el administrador principal puede cambiar roles o accesos';
  end if;
  return new;
end;
$$;
