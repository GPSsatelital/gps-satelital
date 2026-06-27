-- Agrega campo subadmin_id a motos: sub-admin a cargo de la gestión diaria
ALTER TABLE public.motos
  ADD COLUMN IF NOT EXISTS subadmin_id uuid references public.profiles(id) on delete set null;
