-- =====================================================================
-- CIMA v1.3 · Registro de sugerencias de repaso
-- Guarda cada vez que CIMA le sugiere a un estudiante repasar un tema
-- (evento 'sugerido') y cada vez que el estudiante abre ese tema desde
-- la sugerencia (evento 'abierto'). El docente lo ve en el Dashboard.
--
-- Cómo usarlo: Supabase → SQL Editor → New query → pega TODO este
-- archivo → Run. Se puede ejecutar más de una vez sin dañar nada.
-- =====================================================================

create table if not exists public.repasos (
  id          bigint generated always as identity primary key,
  user_id     uuid not null default auth.uid() references public.profiles(id) on delete cascade,
  origen      text not null check (char_length(origen) <= 80),     -- materia/tema donde falló
  motivo      text not null check (char_length(motivo) <= 40),     -- paso que falló (hipotesis, supuestos, prueba…)
  sugerido    text not null check (char_length(sugerido) <= 80),   -- materia/tema que se sugirió
  evento      text not null default 'sugerido' check (evento in ('sugerido','abierto')),
  created_at  timestamptz not null default now()
);
create index if not exists repasos_user_idx on public.repasos(user_id);
create index if not exists repasos_fecha_idx on public.repasos(created_at);
alter table public.repasos enable row level security;
grant select, insert on public.repasos to authenticated;

drop policy if exists "repasos: ver" on public.repasos;
create policy "repasos: ver" on public.repasos for select using (user_id = auth.uid() or public.is_docente());
drop policy if exists "repasos: registrar" on public.repasos;
create policy "repasos: registrar" on public.repasos for insert with check (user_id = auth.uid());

-- Fin. Debe aparecer "Success. No rows returned" (en español: "Éxito. No se devolvió ninguna fila").
