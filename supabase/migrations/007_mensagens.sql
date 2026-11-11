-- 007: mensagens do "Fale conosco".
-- Qualquer visitante pode enviar uma mensagem; só a coordenação (gestores) lê,
-- marca como respondida ou apaga. Visitantes não conseguem ler nenhuma mensagem.

create table if not exists public.mensagens (
  id uuid primary key default gen_random_uuid(),
  nome text not null,
  email text not null,
  assunto text not null default 'OUTRO'
    check (assunto in ('PARCERIA', 'PARTICIPAR', 'VISITA', 'IMPRENSA', 'OUTRO')),
  mensagem text not null,
  respondida boolean not null default false,
  criado_em timestamptz not null default now()
);

create index if not exists mensagens_criado_idx on public.mensagens (criado_em desc);

alter table public.mensagens enable row level security;

revoke all on public.mensagens from anon, authenticated;
grant insert on public.mensagens to anon;
grant select, insert, update, delete on public.mensagens to authenticated;

drop policy if exists mensagens_envio_publico on public.mensagens;
create policy mensagens_envio_publico on public.mensagens
  for insert to anon, authenticated
  with check (
    not respondida
    and char_length(trim(nome)) between 2 and 120
    and char_length(email) between 5 and 160
    and email ~* '^[^@\s]+@[^@\s]+\.[^@\s]+$'
    and char_length(trim(mensagem)) between 10 and 4000
  );

drop policy if exists mensagens_gestao on public.mensagens;
create policy mensagens_gestao on public.mensagens
  for all to authenticated
  using (public.is_gestor())
  with check (public.is_gestor());
