-- =====================================================================
-- CIMA · Calidad · Industria · Matemática · Alimentos
-- Esquema de base de datos para Supabase (PostgreSQL)
-- Autor: Ing. Héctor Espinoza · carrera de Alimentos
--
-- Cómo usarlo: en Supabase abre "SQL Editor" → "New query", pega TODO
-- este archivo y presiona "Run". Se puede ejecutar más de una vez.
-- =====================================================================

create extension if not exists pgcrypto;

-- ---------- Perfiles (uno por estudiante o docente) ----------
create table if not exists public.profiles (
  id          uuid primary key references auth.users(id) on delete cascade,
  email       text,
  nombre      text not null default '',
  paralelo    text not null default '',
  carrera     text not null default 'Alimentos',
  rol         text not null default 'estudiante' check (rol in ('estudiante','docente')),
  created_at  timestamptz not null default now()
);

create or replace function public.is_docente() returns boolean
language sql stable security definer set search_path = public as $$
  select exists (select 1 from public.profiles where id = auth.uid() and rol = 'docente');
$$;

-- Crea el perfil automáticamente cuando alguien se registra
create or replace function public.handle_new_user() returns trigger
language plpgsql security definer set search_path = public as $$
begin
  insert into public.profiles (id, email, nombre, paralelo)
  values (new.id, new.email,
          coalesce(new.raw_user_meta_data->>'nombre', ''),
          coalesce(new.raw_user_meta_data->>'paralelo', ''))
  on conflict (id) do nothing;
  return new;
end; $$;
drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created after insert on auth.users
  for each row execute function public.handle_new_user();

-- Un estudiante no puede cambiarse el rol a sí mismo
create or replace function public.protect_rol() returns trigger
language plpgsql security definer set search_path = public as $$
begin
  if new.rol is distinct from old.rol and auth.uid() is not null and not public.is_docente() then
    new.rol := old.rol;
  end if;
  return new;
end; $$;
drop trigger if exists profiles_protect_rol on public.profiles;
create trigger profiles_protect_rol before update on public.profiles
  for each row execute function public.protect_rol();

alter table public.profiles enable row level security;
drop policy if exists "perfil: ver propio o docente" on public.profiles;
create policy "perfil: ver propio o docente" on public.profiles for select
  using (id = auth.uid() or public.is_docente());
drop policy if exists "perfil: editar propio" on public.profiles;
create policy "perfil: editar propio" on public.profiles for update
  using (id = auth.uid() or public.is_docente());

-- ---------- Sesiones (ingresos y tiempo activo) ----------
create table if not exists public.sessions (
  id              uuid primary key default gen_random_uuid(),
  user_id         uuid not null default auth.uid() references public.profiles(id) on delete cascade,
  visit_id        uuid not null,
  subject_id      text,
  started_at      timestamptz not null default now(),
  last_seen       timestamptz not null default now(),
  active_seconds  integer not null default 0 check (active_seconds between 0 and 86400)
);
create index if not exists sessions_user_idx on public.sessions(user_id);
create index if not exists sessions_started_idx on public.sessions(started_at);
alter table public.sessions enable row level security;
drop policy if exists "sesiones: ver" on public.sessions;
create policy "sesiones: ver" on public.sessions for select using (user_id = auth.uid() or public.is_docente());
drop policy if exists "sesiones: crear" on public.sessions;
create policy "sesiones: crear" on public.sessions for insert with check (user_id = auth.uid());
drop policy if exists "sesiones: actualizar" on public.sessions;
create policy "sesiones: actualizar" on public.sessions for update using (user_id = auth.uid());

-- ---------- Intentos (cada prueba terminada) ----------
create table if not exists public.attempts (
  id          bigint generated always as identity primary key,
  user_id     uuid not null default auth.uid() references public.profiles(id) on delete cascade,
  subject_id  text not null,
  unit_id     text,
  topic_id    text not null,
  mode        text not null default 'practica',
  score       numeric(4,1) not null check (score between 0 and 10),
  correct     integer,
  total       integer,
  duration_s  integer,
  details     jsonb,
  created_at  timestamptz not null default now()
);
create index if not exists attempts_user_idx on public.attempts(user_id);
create index if not exists attempts_topic_idx on public.attempts(subject_id, topic_id);
alter table public.attempts enable row level security;
drop policy if exists "intentos: ver" on public.attempts;
create policy "intentos: ver" on public.attempts for select using (user_id = auth.uid() or public.is_docente());
drop policy if exists "intentos: crear" on public.attempts;
create policy "intentos: crear" on public.attempts for insert with check (user_id = auth.uid());

-- ---------- Catálogo de materias (lo sincroniza el panel docente) ----------
create table if not exists public.subjects (
  id          text primary key,
  nombre      text not null,
  topics      text[] not null default '{}',
  updated_at  timestamptz not null default now()
);
alter table public.subjects enable row level security;
drop policy if exists "materias: ver" on public.subjects;
create policy "materias: ver" on public.subjects for select using (true);
drop policy if exists "materias: docente crea" on public.subjects;
create policy "materias: docente crea" on public.subjects for insert with check (public.is_docente());
drop policy if exists "materias: docente edita" on public.subjects;
create policy "materias: docente edita" on public.subjects for update using (public.is_docente());

-- ---------- Certificados ----------
create table if not exists public.certificates (
  code        text primary key,
  user_id     uuid not null references public.profiles(id) on delete cascade,
  subject_id  text not null references public.subjects(id),
  nombre      text not null,
  materia     text not null,
  promedio    numeric(4,2),
  temas       integer,
  issued_at   timestamptz not null default now(),
  unique (user_id, subject_id)
);
alter table public.certificates enable row level security;
drop policy if exists "certificados: ver" on public.certificates;
create policy "certificados: ver" on public.certificates for select using (user_id = auth.uid() or public.is_docente());

-- Emite el certificado solo si el estudiante aprobó (nota ≥ 7) todos los temas de la materia
create or replace function public.emitir_certificado(p_subject text) returns public.certificates
language plpgsql security definer set search_path = public as $$
declare s public.subjects; c public.certificates; v_ok int; v_avg numeric; v_nombre text;
begin
  if auth.uid() is null then raise exception 'Debes iniciar sesión'; end if;
  select * into s from public.subjects where id = p_subject;
  if not found then raise exception 'Materia no encontrada'; end if;
  select * into c from public.certificates where user_id = auth.uid() and subject_id = p_subject;
  if found then return c; end if;
  with best as (
    select topic_id, max(score) b from public.attempts
    where user_id = auth.uid() and subject_id = p_subject and topic_id = any(s.topics)
    group by topic_id)
  select count(*) filter (where b >= 7), avg(b) into v_ok, v_avg from best;
  if cardinality(s.topics) = 0 or coalesce(v_ok,0) < cardinality(s.topics) then
    raise exception 'Aún no apruebas todos los temas (% de %)', coalesce(v_ok,0), cardinality(s.topics);
  end if;
  select nombre into v_nombre from public.profiles where id = auth.uid();
  insert into public.certificates (code, user_id, subject_id, nombre, materia, promedio, temas)
  values ('CIMA-' || upper(substr(md5(gen_random_uuid()::text), 1, 4)) || '-' || upper(substr(md5(gen_random_uuid()::text), 1, 4)),
          auth.uid(), p_subject, v_nombre, s.nombre, round(v_avg, 2), cardinality(s.topics))
  returning * into c;
  return c;
end; $$;
grant execute on function public.emitir_certificado(text) to authenticated;

-- Verificación pública: cualquiera con el código puede comprobar un certificado
create or replace function public.verificar_certificado(p_code text)
returns table (code text, nombre text, materia text, promedio numeric, temas int, issued_at timestamptz)
language sql stable security definer set search_path = public as $$
  select c.code, c.nombre, c.materia, c.promedio, c.temas, c.issued_at
  from public.certificates c where c.code = upper(trim(p_code));
$$;
grant execute on function public.verificar_certificado(text) to anon, authenticated;

-- =====================================================================
-- DESPUÉS de crear tu propia cuenta en la plataforma, conviértete en
-- docente ejecutando (cambia el correo por el tuyo):
--
--   update public.profiles set rol = 'docente' where email = 'TU_CORREO@ejemplo.com';
--
-- Para restablecer la contraseña de un estudiante que la olvidó:
--
--   update auth.users set encrypted_password = crypt('NuevaClave123', gen_salt('bf'))
--   where email = 'correo.del.estudiante@ejemplo.com';
-- =====================================================================
