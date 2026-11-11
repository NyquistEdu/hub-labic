-- 005: depoimentos de estudantes e egressos.
-- Visitantes podem enviar um depoimento, que entra oculto (publicado = false)
-- e só aparece no site depois que a coordenação revisa e publica.

create table if not exists public.depoimentos (
  id uuid primary key default gen_random_uuid(),
  pessoa_id uuid references public.pessoas(id) on delete set null,
  autor text not null default '',
  papel text not null default '',
  texto text not null check (char_length(trim(texto)) > 0),
  ano int,
  destaque boolean not null default false,
  publicado boolean not null default false,
  criado_em timestamptz not null default now()
);

create index if not exists depoimentos_pessoa_idx on public.depoimentos (pessoa_id);

alter table public.depoimentos enable row level security;

revoke all on public.depoimentos from anon, authenticated;
grant select, insert on public.depoimentos to anon;
grant select, insert, update, delete on public.depoimentos to authenticated;

drop policy if exists depoimentos_leitura on public.depoimentos;
create policy depoimentos_leitura on public.depoimentos
  for select using (publicado or public.is_gestor());

drop policy if exists depoimentos_envio_publico on public.depoimentos;
create policy depoimentos_envio_publico on public.depoimentos
  for insert to anon, authenticated
  with check (
    not publicado
    and not destaque
    and pessoa_id is null
    and char_length(trim(texto)) between 20 and 2000
    and char_length(trim(autor)) between 3 and 120
    and char_length(papel) <= 160
    and (ano is null or ano between 2017 and 2100)
  );

drop policy if exists depoimentos_gestao on public.depoimentos;
create policy depoimentos_gestao on public.depoimentos
  for all to authenticated
  using (public.is_gestor())
  with check (public.is_gestor());
