-- =============================================================================
-- HUB LABIC — Migração 003: acervo público + gestão com acesso seguro
--
-- O que este script faz:
--   1. Cria as tabelas novas do acervo (pessoas, projetos, conquistas, startups,
--      parceiros, marcos da linha do tempo) e do formulário de egressos.
--   2. Liga as regras de acesso (RLS): o público só lê o que está marcado como
--      publicado; só gestores (usuários do Supabase Auth cadastrados na tabela
--      "gestores") podem criar, editar e excluir.
--   3. TRANCA as tabelas antigas do rascunho (profiles, projects, finance_*...),
--      que estavam abertas para qualquer visitante, e remove a regra que deixava
--      qualquer pessoa enviar/apagar arquivos no Storage.
--
-- Pode ser executado mais de uma vez sem causar erro.
-- =============================================================================


-- -----------------------------------------------------------------------------
-- 1. GESTORES (quem pode entrar na área de gestão)
-- -----------------------------------------------------------------------------
create table if not exists public.gestores (
  user_id uuid primary key references auth.users(id) on delete cascade,
  nome text not null,
  criado_em timestamptz not null default now()
);

create or replace function public.is_gestor()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (select 1 from public.gestores g where g.user_id = auth.uid());
$$;

-- -----------------------------------------------------------------------------
-- 2. TABELAS DO ACERVO
-- -----------------------------------------------------------------------------
create table if not exists public.pessoas (
  id uuid primary key default gen_random_uuid(),
  slug text unique not null,
  nome text not null,
  vinculo text not null default 'ESTUDANTE'
    check (vinculo in ('COORDENACAO', 'PESQUISADOR', 'ESTUDANTE', 'EGRESSO', 'PARCEIRO')),
  papel text not null default '',
  instituicao text not null default '',
  curso text not null default '',
  ano_entrada int,
  ano_saida int,
  bio text not null default '',
  onde_esta text not null default '',
  cidade text not null default '',
  pais text not null default '',
  foto_url text not null default '',
  lattes_url text not null default '',
  linkedin_url text not null default '',
  github_url text not null default '',
  destaque boolean not null default false,
  publicado boolean not null default false,
  criado_em timestamptz not null default now()
);

-- Contato fica em tabela separada: nunca é lido pelo site público.
create table if not exists public.pessoas_contato (
  pessoa_id uuid primary key references public.pessoas(id) on delete cascade,
  email text not null default '',
  telefone text not null default '',
  observacoes text not null default ''
);

create table if not exists public.projetos (
  id uuid primary key default gen_random_uuid(),
  slug text unique not null,
  titulo text not null,
  resumo text not null default '',
  descricao text not null default '',
  areas text[] not null default '{}',
  status text not null default 'EM_ANDAMENTO' check (status in ('EM_ANDAMENTO', 'CONCLUIDO')),
  ano_inicio int,
  ano_fim int,
  fomento text not null default '',
  capa_url text not null default '',
  galeria text[] not null default '{}',
  video_url text not null default '',
  destaque boolean not null default false,
  publicado boolean not null default false,
  criado_em timestamptz not null default now()
);

create table if not exists public.projeto_pessoas (
  projeto_id uuid not null references public.projetos(id) on delete cascade,
  pessoa_id uuid not null references public.pessoas(id) on delete cascade,
  papel text not null default '',
  primary key (projeto_id, pessoa_id)
);

create table if not exists public.conquistas (
  id uuid primary key default gen_random_uuid(),
  tipo text not null
    check (tipo in ('ARTIGO', 'TCC', 'SOFTWARE', 'PREMIO', 'EDITAL', 'TRAJETORIA', 'EVENTO')),
  titulo text not null,
  ano int not null,
  veiculo text not null default '',
  autores text not null default '',
  descricao text not null default '',
  url text not null default '',
  projeto_id uuid references public.projetos(id) on delete set null,
  publicado boolean not null default false,
  criado_em timestamptz not null default now()
);

create table if not exists public.conquista_pessoas (
  conquista_id uuid not null references public.conquistas(id) on delete cascade,
  pessoa_id uuid not null references public.pessoas(id) on delete cascade,
  primary key (conquista_id, pessoa_id)
);

create table if not exists public.iniciativas (
  id uuid primary key default gen_random_uuid(),
  slug text unique not null,
  nome text not null,
  tagline text not null default '',
  descricao text not null default '',
  estagio text not null default 'IDEACAO'
    check (estagio in ('IDEACAO', 'VALIDACAO', 'MVP', 'OPERACAO', 'ENCERRADA')),
  ano int,
  logo_url text not null default '',
  site_url text not null default '',
  publicado boolean not null default false,
  criado_em timestamptz not null default now()
);

create table if not exists public.iniciativa_pessoas (
  iniciativa_id uuid not null references public.iniciativas(id) on delete cascade,
  pessoa_id uuid not null references public.pessoas(id) on delete cascade,
  primary key (iniciativa_id, pessoa_id)
);

create table if not exists public.parceiros (
  id uuid primary key default gen_random_uuid(),
  nome text not null,
  tipo text not null default '',
  descricao text not null default '',
  url text not null default '',
  logo_url text not null default '',
  publicado boolean not null default false,
  criado_em timestamptz not null default now()
);

create table if not exists public.marcos (
  id uuid primary key default gen_random_uuid(),
  ano int not null,
  mes int check (mes between 1 and 12),
  titulo text not null,
  descricao text not null default '',
  url text not null default '',
  publicado boolean not null default false,
  criado_em timestamptz not null default now()
);

-- Respostas do formulário público de egressos (ficam pendentes até a aprovação).
create table if not exists public.cadastros_egressos (
  id uuid primary key default gen_random_uuid(),
  criado_em timestamptz not null default now(),
  status text not null default 'PENDENTE' check (status in ('PENDENTE', 'APROVADO', 'RECUSADO')),
  dados jsonb not null,
  foto_path text not null default '',
  pessoa_id uuid references public.pessoas(id) on delete set null
);

-- -----------------------------------------------------------------------------
-- 3. REGRAS DE ACESSO (RLS)
-- -----------------------------------------------------------------------------
alter table public.gestores enable row level security;
alter table public.pessoas enable row level security;
alter table public.pessoas_contato enable row level security;
alter table public.projetos enable row level security;
alter table public.projeto_pessoas enable row level security;
alter table public.conquistas enable row level security;
alter table public.conquista_pessoas enable row level security;
alter table public.iniciativas enable row level security;
alter table public.iniciativa_pessoas enable row level security;
alter table public.parceiros enable row level security;
alter table public.marcos enable row level security;
alter table public.cadastros_egressos enable row level security;

-- Gestores: cada um enxerga a lista de gestores; ninguém altera pela API
-- (novos gestores são incluídos pelo painel do Supabase).
drop policy if exists gestores_leitura on public.gestores;
create policy gestores_leitura on public.gestores
  for select to authenticated using (user_id = auth.uid() or public.is_gestor());

-- Tabelas com a coluna "publicado": leitura pública do que está publicado,
-- controle total para gestores.
do $$
declare t text;
begin
  foreach t in array array['pessoas', 'projetos', 'conquistas', 'iniciativas', 'parceiros', 'marcos']
  loop
    execute format('drop policy if exists %I on public.%I', t || '_leitura_publica', t);
    execute format(
      'create policy %I on public.%I for select to anon, authenticated using (publicado or public.is_gestor())',
      t || '_leitura_publica', t);
    execute format('drop policy if exists %I on public.%I', t || '_gestao', t);
    execute format(
      'create policy %I on public.%I for all to authenticated using (public.is_gestor()) with check (public.is_gestor())',
      t || '_gestao', t);
  end loop;
end $$;

-- Tabelas de vínculo: visíveis quando os dois lados estão publicados.
drop policy if exists projeto_pessoas_leitura on public.projeto_pessoas;
create policy projeto_pessoas_leitura on public.projeto_pessoas
  for select to anon, authenticated using (
    public.is_gestor() or (
      exists (select 1 from public.projetos p where p.id = projeto_id and p.publicado)
      and exists (select 1 from public.pessoas s where s.id = pessoa_id and s.publicado)
    )
  );
drop policy if exists projeto_pessoas_gestao on public.projeto_pessoas;
create policy projeto_pessoas_gestao on public.projeto_pessoas
  for all to authenticated using (public.is_gestor()) with check (public.is_gestor());

drop policy if exists conquista_pessoas_leitura on public.conquista_pessoas;
create policy conquista_pessoas_leitura on public.conquista_pessoas
  for select to anon, authenticated using (
    public.is_gestor() or (
      exists (select 1 from public.conquistas c where c.id = conquista_id and c.publicado)
      and exists (select 1 from public.pessoas s where s.id = pessoa_id and s.publicado)
    )
  );
drop policy if exists conquista_pessoas_gestao on public.conquista_pessoas;
create policy conquista_pessoas_gestao on public.conquista_pessoas
  for all to authenticated using (public.is_gestor()) with check (public.is_gestor());

drop policy if exists iniciativa_pessoas_leitura on public.iniciativa_pessoas;
create policy iniciativa_pessoas_leitura on public.iniciativa_pessoas
  for select to anon, authenticated using (
    public.is_gestor() or (
      exists (select 1 from public.iniciativas i where i.id = iniciativa_id and i.publicado)
      and exists (select 1 from public.pessoas s where s.id = pessoa_id and s.publicado)
    )
  );
drop policy if exists iniciativa_pessoas_gestao on public.iniciativa_pessoas;
create policy iniciativa_pessoas_gestao on public.iniciativa_pessoas
  for all to authenticated using (public.is_gestor()) with check (public.is_gestor());

-- Contatos: só gestores.
drop policy if exists pessoas_contato_gestao on public.pessoas_contato;
create policy pessoas_contato_gestao on public.pessoas_contato
  for all to authenticated using (public.is_gestor()) with check (public.is_gestor());

-- Formulário de egressos: qualquer visitante pode ENVIAR um cadastro pendente;
-- só gestores leem, aprovam ou apagam.
drop policy if exists cadastros_envio_publico on public.cadastros_egressos;
create policy cadastros_envio_publico on public.cadastros_egressos
  for insert to anon, authenticated
  with check (status = 'PENDENTE' and pessoa_id is null);
drop policy if exists cadastros_gestao on public.cadastros_egressos;
create policy cadastros_gestao on public.cadastros_egressos
  for all to authenticated using (public.is_gestor()) with check (public.is_gestor());

-- Permissões de tabela (o RLS acima decide linha a linha).
grant usage on schema public to anon, authenticated;
revoke all on public.gestores, public.pessoas, public.pessoas_contato, public.projetos, public.projeto_pessoas,
  public.conquistas, public.conquista_pessoas, public.iniciativas, public.iniciativa_pessoas, public.parceiros,
  public.marcos, public.cadastros_egressos from anon, authenticated;
grant select on public.pessoas, public.projetos, public.projeto_pessoas, public.conquistas,
  public.conquista_pessoas, public.iniciativas, public.iniciativa_pessoas, public.parceiros,
  public.marcos to anon;
grant insert on public.cadastros_egressos to anon;
grant select, insert, update, delete on public.pessoas, public.pessoas_contato, public.projetos,
  public.projeto_pessoas, public.conquistas, public.conquista_pessoas, public.iniciativas,
  public.iniciativa_pessoas, public.parceiros, public.marcos, public.cadastros_egressos
  to authenticated;
grant select on public.gestores to authenticated;

-- -----------------------------------------------------------------------------
-- 4. STORAGE
--    "acervo"    — imagens do site (leitura pública, envio só por gestores)
--    "cadastros" — fotos enviadas pelo formulário de egressos (privado)
-- -----------------------------------------------------------------------------
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('acervo', 'acervo', true, 5242880, array['image/jpeg', 'image/png', 'image/webp'])
on conflict (id) do update set public = true, file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('cadastros', 'cadastros', false, 3145728, array['image/jpeg', 'image/png', 'image/webp'])
on conflict (id) do update set public = false, file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

-- Remove a regra do rascunho que liberava o Storage inteiro para qualquer visitante.
drop policy if exists labic_storage_all on storage.objects;

drop policy if exists acervo_leitura_publica on storage.objects;
create policy acervo_leitura_publica on storage.objects
  for select to anon, authenticated using (bucket_id = 'acervo');
drop policy if exists acervo_gestao on storage.objects;
create policy acervo_gestao on storage.objects
  for all to authenticated
  using (bucket_id in ('acervo', 'cadastros') and public.is_gestor())
  with check (bucket_id in ('acervo', 'cadastros') and public.is_gestor());
drop policy if exists cadastros_envio_publico on storage.objects;
create policy cadastros_envio_publico on storage.objects
  for insert to anon, authenticated with check (bucket_id = 'cadastros');

-- Os buckets antigos guardavam relatórios e artigos com link público. Deixam de ser públicos.
update storage.buckets set public = false
where id in ('artigos-congressos', 'relatorios-projetos', 'impressao-3d-stl', 'documentos-labic');

-- -----------------------------------------------------------------------------
-- 5. TRANCAR AS TABELAS ANTIGAS DO RASCUNHO
--    Com RLS ligado e nenhuma regra, ninguém acessa pela API pública.
--    Os dados continuam no banco (visíveis pelo painel do Supabase).
-- -----------------------------------------------------------------------------
do $$
declare t text;
begin
  foreach t in array array[
    'profiles', 'academic_trajectories', 'projects', 'project_members',
    'project_scholarships_private', 'project_deliverables', 'productions',
    'production_authors', 'historical_timeline_years', 'conferences',
    'conference_submissions', 'startups', 'startup_applications', 'inventory_items',
    'supply_requests', 'print3d_requests', 'equipment_assets', 'cleaning_tasks',
    'media_schedule_slots', 'finance_boxes', 'finance_transactions', 'meetings',
    'general_documents'
  ]
  loop
    if to_regclass('public.' || t) is not null then
      execute format('alter table public.%I enable row level security', t);
      execute format('revoke all on public.%I from anon, authenticated', t);
    end if;
  end loop;
end $$;

-- As senhas do rascunho estavam gravadas em texto puro. Depois de conferir que
-- ninguém mais precisa delas, apague a coluna:
--   alter table public.profiles drop column if exists password;
