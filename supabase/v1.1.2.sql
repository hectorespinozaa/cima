-- =====================================================================
-- CIMA v1.1.2 · Actualización de la base de datos
-- Buzón de sugerencias con capturas · Restablecer contraseñas desde el
-- dashboard · Certificado con detalle por tema, versión y primer intento
--
-- Cómo usarlo: Supabase → SQL Editor → New query → pega TODO este
-- archivo → Run. Se puede ejecutar más de una vez sin dañar nada.
-- =====================================================================

-- ---------- 1. Certificado con detalle ----------
alter table public.certificates add column if not exists version         text;
alter table public.certificates add column if not exists detalle         jsonb;
alter table public.certificates add column if not exists promedio_primer numeric(4,2);
alter table public.certificates add column if not exists temas_req       text[];

-- Detalle por tema (primer intento, mejor nota, intentos) hasta una fecha
create or replace function public.cert_detalle(p_user uuid, p_subject text, p_topics text[], p_hasta timestamptz)
returns jsonb language sql stable security definer set search_path = public as $$
  select coalesce(jsonb_agg(jsonb_build_object(
           'topic', t.topic, 'primera', a.primera, 'mejor', a.mejor, 'intentos', a.intentos) order by t.ord), '[]'::jsonb)
  from unnest(p_topics) with ordinality as t(topic, ord)
  left join lateral (
    select (array_agg(score order by created_at))[1] as primera, max(score) as mejor, count(*)::int as intentos
    from public.attempts
    where user_id = p_user and subject_id = p_subject and topic_id = t.topic and created_at <= p_hasta
  ) a on true;
$$;

drop function if exists public.emitir_certificado(text);
create or replace function public.emitir_certificado(p_subject text, p_version text default null)
returns public.certificates
language plpgsql security definer set search_path = public as $$
declare s public.subjects; c public.certificates; v_ok int; v_avg numeric; v_first numeric; v_nombre text; v_det jsonb;
begin
  if auth.uid() is null then raise exception 'Debes iniciar sesión'; end if;
  select * into s from public.subjects where id = p_subject;
  if not found then raise exception 'Materia no encontrada'; end if;
  select * into c from public.certificates where user_id = auth.uid() and subject_id = p_subject;
  if found then return c; end if;
  v_det := public.cert_detalle(auth.uid(), p_subject, s.topics, now());
  select count(*) filter (where (e->>'mejor')::numeric >= 7),
         avg((e->>'mejor')::numeric), avg((e->>'primera')::numeric)
    into v_ok, v_avg, v_first
  from jsonb_array_elements(v_det) e;
  if cardinality(s.topics) = 0 or coalesce(v_ok,0) < cardinality(s.topics) then
    raise exception 'Aún no apruebas todos los temas (% de %)', coalesce(v_ok,0), cardinality(s.topics);
  end if;
  select nombre into v_nombre from public.profiles where id = auth.uid();
  insert into public.certificates (code, user_id, subject_id, nombre, materia, promedio, temas, version, detalle, promedio_primer, temas_req)
  values ('CIMA-' || upper(substr(md5(gen_random_uuid()::text), 1, 4)) || '-' || upper(substr(md5(gen_random_uuid()::text), 1, 4)),
          auth.uid(), p_subject, v_nombre, s.nombre, round(v_avg, 2), cardinality(s.topics),
          left(coalesce(p_version, ''), 20), v_det, round(v_first, 2), s.topics)
  returning * into c;
  return c;
end; $$;
grant execute on function public.emitir_certificado(text, text) to authenticated;

-- Completa los certificados emitidos antes de esta versión
update public.certificates c
   set detalle = public.cert_detalle(c.user_id, c.subject_id, s.topics, c.issued_at),
       temas_req = s.topics,
       version = coalesce(c.version, 'anterior a 1.1.2')
  from public.subjects s
 where s.id = c.subject_id and c.detalle is null;
update public.certificates c
   set promedio_primer = (select round(avg((e->>'primera')::numeric), 2) from jsonb_array_elements(c.detalle) e)
 where c.promedio_primer is null and c.detalle is not null;

-- Verificación pública con el detalle
drop function if exists public.verificar_certificado(text);
create or replace function public.verificar_certificado(p_code text)
returns table (code text, nombre text, materia text, subject_id text, promedio numeric, promedio_primer numeric,
               temas int, version text, detalle jsonb, issued_at timestamptz)
language sql stable security definer set search_path = public as $$
  select c.code, c.nombre, c.materia, c.subject_id, c.promedio, c.promedio_primer, c.temas, c.version, c.detalle, c.issued_at
  from public.certificates c where c.code = upper(trim(p_code));
$$;
grant execute on function public.verificar_certificado(text) to anon, authenticated;

-- ---------- 2. Restablecer contraseña (solo docente) ----------
create or replace function public.docente_cambiar_clave(p_user uuid, p_clave text) returns void
language plpgsql security definer set search_path = public, extensions as $$
begin
  if not public.is_docente() then raise exception 'Solo el docente puede restablecer contraseñas'; end if;
  if length(coalesce(p_clave, '')) < 8 then raise exception 'La contraseña debe tener al menos 8 caracteres'; end if;
  update auth.users set encrypted_password = crypt(p_clave, gen_salt('bf')), updated_at = now() where id = p_user;
  if not found then raise exception 'No se encontró la cuenta'; end if;
end; $$;
revoke all on function public.docente_cambiar_clave(uuid, text) from public, anon;
grant execute on function public.docente_cambiar_clave(uuid, text) to authenticated;

-- ---------- 3. Buzón de sugerencias ----------
create table if not exists public.sugerencias (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid not null default auth.uid() references public.profiles(id) on delete cascade,
  tipo        text not null check (tipo in ('error','tema','simulador','idea')),
  subject_id  text,
  topic_id    text,
  mensaje     text not null check (char_length(mensaje) between 5 and 2000),
  imagen      text,
  contexto    jsonb,
  estado      text not null default 'nueva' check (estado in ('nueva','revision','implementada','descartada')),
  respuesta   text check (char_length(respuesta) <= 2000),
  visto       boolean not null default true,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);
create index if not exists sugerencias_user_idx on public.sugerencias(user_id);
alter table public.sugerencias enable row level security;
grant select, insert, update on public.sugerencias to authenticated;
drop policy if exists "sugerencias: ver" on public.sugerencias;
create policy "sugerencias: ver" on public.sugerencias for select using (user_id = auth.uid() or public.is_docente());
drop policy if exists "sugerencias: crear" on public.sugerencias;
create policy "sugerencias: crear" on public.sugerencias for insert
  with check (user_id = auth.uid() and estado = 'nueva' and respuesta is null);
drop policy if exists "sugerencias: docente responde" on public.sugerencias;
create policy "sugerencias: docente responde" on public.sugerencias for update using (public.is_docente());

-- Cuando el docente cambia el estado o responde, el estudiante ve el aviso
create or replace function public.sugerencias_aviso() returns trigger
language plpgsql set search_path = public as $$
begin
  if new.estado is distinct from old.estado or new.respuesta is distinct from old.respuesta then
    new.visto := false; new.updated_at := now();
  end if;
  new.user_id := old.user_id; new.mensaje := old.mensaje; new.tipo := old.tipo; new.imagen := old.imagen;
  return new;
end; $$;
drop trigger if exists sugerencias_aviso on public.sugerencias;
create trigger sugerencias_aviso before update on public.sugerencias
  for each row execute function public.sugerencias_aviso();

-- El estudiante marca como vistos sus avisos
create or replace function public.marcar_sugerencias_vistas() returns void
language sql security definer set search_path = public as $$
  update public.sugerencias set visto = true where user_id = auth.uid() and visto = false;
$$;
grant execute on function public.marcar_sugerencias_vistas() to authenticated;

-- Capturas de pantalla (privadas: cada estudiante ve las suyas; el docente, todas)
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('capturas', 'capturas', false, 3145728, array['image/jpeg','image/png','image/webp'])
on conflict (id) do update set public = false, file_size_limit = 3145728,
  allowed_mime_types = array['image/jpeg','image/png','image/webp'];
drop policy if exists "capturas: subir propias" on storage.objects;
create policy "capturas: subir propias" on storage.objects for insert to authenticated
  with check (bucket_id = 'capturas' and (storage.foldername(name))[1] = auth.uid()::text);
drop policy if exists "capturas: ver propias o docente" on storage.objects;
create policy "capturas: ver propias o docente" on storage.objects for select to authenticated
  using (bucket_id = 'capturas' and ((storage.foldername(name))[1] = auth.uid()::text or public.is_docente()));
drop policy if exists "capturas: docente borra" on storage.objects;
create policy "capturas: docente borra" on storage.objects for delete to authenticated
  using (bucket_id = 'capturas' and public.is_docente());

-- Fin. Debe aparecer "Success. No rows returned" (en español: "Éxito. No se devolvió ninguna fila").
