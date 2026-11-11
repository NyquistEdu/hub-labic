-- HUB LABIC — Migração 004: arquivo (PDF) das publicações
-- Pode ser executado mais de uma vez.
alter table public.conquistas add column if not exists arquivo_url text not null default '';

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('publicacoes', 'publicacoes', true, 20971520, array['application/pdf'])
on conflict (id) do update set public = true, file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

drop policy if exists publicacoes_leitura_publica on storage.objects;
create policy publicacoes_leitura_publica on storage.objects
  for select to anon, authenticated using (bucket_id = 'publicacoes');
drop policy if exists publicacoes_gestao on storage.objects;
create policy publicacoes_gestao on storage.objects
  for all to authenticated
  using (bucket_id = 'publicacoes' and public.is_gestor())
  with check (bucket_id = 'publicacoes' and public.is_gestor());

select column_name from information_schema.columns where table_name = 'conquistas' and column_name = 'arquivo_url';
