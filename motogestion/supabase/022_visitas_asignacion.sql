-- Agrega campo asignada_a a visitas: sub-admin asignado para realizar la visita
ALTER TABLE public.visitas
  ADD COLUMN IF NOT EXISTS asignada_a uuid references public.profiles(id) on delete set null;
