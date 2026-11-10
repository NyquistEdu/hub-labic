-- =============================================================================
-- HUB-LABIC (IFS Campus Lagarto) — Schema Inicial PostgreSQL + Supabase RLS
-- =============================================================================

create extension if not exists "uuid-ossp";

-- 1. PERFIS DE PESQUISADORES & NIVEL DE ACESSO (RBAC CUMULATIVO)
create table public.profiles (
  id uuid primary key default uuid_generate_v4(),
  auth_user_id uuid unique,
  name text not null,
  email text unique not null,
  avatar_initials text not null,
  global_role text not null check (global_role in ('DIRETORA', 'COORD_GERAL', 'PESQUISADOR')),
  status text not null default 'ATIVO' check (status in ('ATIVO', 'INATIVO')),
  work_mode text not null default 'PRESENCIAL_LAGARTO' check (work_mode in ('PRESENCIAL_LAGARTO', 'REMOTO_EXTERNO')),
  coordinations text[] not null default '{}', -- FINANCAS, INSUMOS, IMPRESSAO_3D, MANUTENCAO, COMPUTADORES, LIMPEZA, MIDIA
  current_location_city text not null default 'Lagarto',
  current_location_state text not null default 'SE',
  current_location_country text not null default 'Brasil',
  latitude numeric(9,6) not null default -10.9167,
  longitude numeric(9,6) not null default -37.6500,
  bio text,
  lattes_url text,
  github_url text,
  linkedin_url text,
  show_on_public_showcase boolean not null default true,
  created_at timestamptz not null default now()
);

-- 2. TRAJETÓRIA ACADÊMICA MULTI-INSTITUCIONAL (IFS -> Mestrado USP, Canadá, Itália, etc.)
create table public.academic_trajectories (
  id uuid primary key default uuid_generate_v4(),
  profile_id uuid not null references public.profiles(id) on delete cascade,
  degree_level text not null check (degree_level in ('ENSINO_MEDIO_TECNICO', 'GRADUACAO', 'MESTRADO', 'DOUTORADO', 'POS_DOUTORADO')),
  course_name text not null,
  institution text not null, -- ex: 'IFS - Campus Lagarto', 'USP', 'University of Waterloo (Canadá)', 'Politecnico di Milano (Itália)'
  country text not null default 'Brasil',
  start_year int not null,
  end_year int,
  status text not null check (status in ('EM_ANDAMENTO', 'CONCLUIDO'))
);

-- 3. PROJETOS DE PESQUISA & BOLSAS (COM SIGILO DE VALOR R$)
create table public.projects (
  id uuid primary key default uuid_generate_v4(),
  title text not null,
  code text not null,
  summary text not null,
  public_summary text,
  cover_image_url text,
  funding_agency text not null, -- PIBIC, PIBITI, FAPITEC, CNPq, VOLUNTARIO, INTERNO
  status text not null check (status in ('EM_ANDAMENTO', 'CONCLUIDO', 'PAUSADO')),
  advisor_id uuid not null references public.profiles(id),
  co_advisor_id uuid references public.profiles(id),
  start_date date not null,
  end_date date,
  show_on_public_showcase boolean not null default false,
  is_sensitive_ip boolean not null default false,
  created_at timestamptz not null default now()
);

create table public.project_members (
  id uuid primary key default uuid_generate_v4(),
  project_id uuid not null references public.projects(id) on delete cascade,
  profile_id uuid not null references public.profiles(id) on delete cascade,
  role_in_project text not null check (role_in_project in ('BOLSISTA', 'VOLUNTARIO', 'COORIENTADOR', 'ORIENTADOR')),
  scholarship_program text, -- PIBIC, PIBITI, FAPITEC
  unique(project_id, profile_id)
);

-- Tabela isolada para garantir sigilo estrito do valor em R$ da bolsa
create table public.project_scholarships_private (
  id uuid primary key default uuid_generate_v4(),
  project_id uuid not null references public.projects(id) on delete cascade,
  scholar_profile_id uuid not null references public.profiles(id) on delete cascade,
  monthly_value_brl numeric(10,2) not null,
  active boolean not null default true,
  unique(project_id, scholar_profile_id)
);

-- Entregas Obrigatórias (Relatório Parcial, Relatório Final) e Protótipos/Bancadas do Projeto
create table public.project_deliverables (
  id uuid primary key default uuid_generate_v4(),
  project_id uuid not null references public.projects(id) on delete cascade,
  title text not null,
  deliverable_type text not null check (deliverable_type in ('RELATORIO_PARCIAL', 'RELATORIO_FINAL', 'PROTOTIPO_BANCADA', 'DOCUMENTO_OPCIONAL')),
  due_date date,
  status text not null check (status in ('PENDENTE', 'ENTREGUE', 'VALIDADO', 'ATRASADO')),
  file_name text,
  file_url text,
  submitted_by uuid references public.profiles(id),
  submitted_at timestamptz
);

-- 4. PRODUÇÕES CIENTÍFICAS & CONQUISTAS ANUAIS (2021-2026+)
create table public.productions (
  id uuid primary key default uuid_generate_v4(),
  title text not null,
  category text not null check (category in ('ARTIGO', 'TCC', 'INPI_SOFTWARE', 'PREMIACAO', 'EDITAL_APROVADO', 'PROTOTIPO_BANCADA', 'STARTUP_CONQUISTA')),
  year int not null,
  venue_or_agency text not null, -- ex: CROS 2026, INPI, FAPITEC, Centelha
  project_id uuid references public.projects(id) on delete set null,
  certificate_or_file_name text,
  verified_by_coordination boolean not null default true,
  is_sensitive boolean not null default false,
  created_at timestamptz not null default now()
);

create table public.production_authors (
  production_id uuid not null references public.productions(id) on delete cascade,
  profile_id uuid not null references public.profiles(id) on delete cascade,
  primary key (production_id, profile_id)
);

-- 5. TIMELINE HISTÓRICA QUANTITATIVA (2021 -> 2026+)
create table public.historical_timeline_years (
  year int primary key,
  headline text not null,
  public_highlight text not null,
  articles_count int not null default 0,
  projects_count int not null default 0,
  inpi_patents_count int not null default 0,
  awards_count int not null default 0,
  prototypes_built_count int not null default 0,
  startups_count int not null default 0,
  funding_approvals_count int not null default 0,
  active_countries_count int not null default 1,
  show_on_public_timeline boolean not null default true
);

-- 6. CONGRESSOS & SUBMISSÕES INTERNAS (Ex: CROS 2027 - Sem trava de autorrevisão)
create table public.conferences (
  id uuid primary key default uuid_generate_v4(),
  name text not null,
  acronym text not null,
  location text not null,
  internal_review_deadline date not null,
  official_submission_deadline date not null,
  event_date text not null,
  website_url text,
  status text not null default 'ABERTO' check (status in ('ABERTO', 'EM_REVISAO', 'ENCERRADO'))
);

create table public.conference_submissions (
  id uuid primary key default uuid_generate_v4(),
  conference_id uuid not null references public.conferences(id) on delete cascade,
  title text not null,
  project_id uuid references public.projects(id) on delete set null,
  author_ids uuid[] not null default '{}',
  reviewer_ids uuid[] not null default '{}', -- Qualquer membro (incluindo autor/coorientador) pode revisar
  status text not null check (status in ('RASCUNHO', 'EM_REVISAO_INTERNA', 'AJUSTES_SOLICITADOS', 'APTO_SUBMISSAO', 'SUBMETIDO_EVENTO', 'PUBLICADO')),
  file_name text not null,
  version_label text not null default 'v1.0',
  review_notes text,
  updated_at timestamptz not null default now()
);

-- 7. STARTUPS DO LABIC & EDITAIS (Centelha, Startup Nordeste, etc.)
create table public.startups (
  id uuid primary key default uuid_generate_v4(),
  name text not null,
  tagline text not null,
  description text not null,
  stage text not null check (stage in ('IDEACAO', 'MVP_PROTOTIPO', 'VALIDACAO', 'INCUBADA_CAPTANDO')),
  member_ids uuid[] not null default '{}',
  show_on_public_showcase boolean not null default true
);

create table public.startup_applications (
  id uuid primary key default uuid_generate_v4(),
  startup_id uuid not null references public.startups(id) on delete cascade,
  program_name text not null, -- ex: Centelha SE, Startup Nordeste, InovAtiva
  year int not null,
  phase_or_status text not null check (phase_or_status in ('SUBMETIDO', 'FASE_1', 'FASE_2_PITCH', 'APROVADO_CONTEMPLADO', 'NAO_APROVADO')),
  approved_grant_brl numeric(12,2)
);

-- 8. AS 7 COORDENAÇÕES OPERACIONAIS DO LABIC
-- 8.1 Insumos Eletrônicos e Cautelas
create table public.inventory_items (
  id uuid primary key default uuid_generate_v4(),
  name text not null,
  category text not null,
  quantity_available int not null default 0,
  is_returnable_equipment boolean not null default false, -- true = Cautela/Empréstimo, false = Consumível
  location_bin text not null
);

create table public.supply_requests (
  id uuid primary key default uuid_generate_v4(),
  requester_id uuid not null references public.profiles(id),
  project_id uuid references public.projects(id),
  item_name text not null,
  quantity int not null default 1,
  request_type text not null check (request_type in ('CONSUMIVEL', 'EMPRESTIMO_CAUTELA')),
  status text not null check (status in ('PENDENTE', 'APROVADO_ENTREGUE', 'EM_FALTA_COMPRAR', 'DEVOLVIDO', 'RECUSADO')),
  coordinator_response text,
  created_at timestamptz not null default now()
);

-- 8.2 Impressoras 3D & Solicitações
create table public.print3d_requests (
  id uuid primary key default uuid_generate_v4(),
  requester_id uuid not null references public.profiles(id),
  project_id uuid references public.projects(id),
  part_name text not null,
  stl_file_name text not null,
  material text not null default 'PLA',
  estimated_grams int not null default 30,
  printer_assigned text not null default 'Bambu Lab / Creality K1',
  status text not null check (status in ('NA_FILA', 'IMPRIMINDO', 'CONCLUIDO', 'FALHA_REIMPRIMIR')),
  created_at timestamptz not null default now()
);

-- 8.3 Computadores & Manutenção de Equipamentos
create table public.equipment_assets (
  id uuid primary key default uuid_generate_v4(),
  code text not null,
  name text not null,
  asset_type text not null check (asset_type in ('COMPUTADOR', 'EQUIPAMENTO_BANCADA', 'IMPRESSORA_3D', 'CLIMATIZACAO')),
  specs text not null,
  status text not null check (status in ('OPERACIONAL', 'PRECISA_MANUTENCAO', 'EM_MANUTENCAO', 'INATIVO')),
  maintenance_need text,
  reported_by uuid references public.profiles(id),
  updated_at timestamptz not null default now()
);

-- 8.4 Escala Semanal de Limpeza
create table public.cleaning_tasks (
  id uuid primary key default uuid_generate_v4(),
  task_title text not null,
  days_of_week text not null, -- ex: 'Terça e Quinta', 'Seg / Qua / Sex'
  assigned_member_ids uuid[] not null default '{}',
  notes text
);

-- 8.5 Escala e Sorteador Mensal de Mídia (Instagram)
create table public.media_schedule_slots (
  id uuid primary key default uuid_generate_v4(),
  month_label text not null, -- ex: 'Novembro/2026'
  scheduled_date date not null,
  assigned_profile_id uuid not null references public.profiles(id),
  topic_suggestion text not null,
  status text not null default 'AGENDADO' check (status in ('AGENDADO', 'PUBLICADO'))
);

-- 8.6 Finanças por Caixinhas Reservadas (Acesso Restrito)
create table public.finance_boxes (
  id uuid primary key default uuid_generate_v4(),
  name text not null, -- ex: 'Caixinha CROS 2027', 'Supermercado / Água / Café'
  purpose text not null,
  target_amount_brl numeric(12,2),
  current_balance_brl numeric(12,2) not null default 0
);

create table public.finance_transactions (
  id uuid primary key default uuid_generate_v4(),
  box_id uuid not null references public.finance_boxes(id) on delete cascade,
  description text not null,
  tx_type text not null check (tx_type in ('ENTRADA', 'SAIDA')),
  amount_brl numeric(12,2) not null,
  tx_date date not null default current_date,
  created_by uuid references public.profiles(id)
);

-- 9. REUNIÕES, DOCUMENTOS GERAIS & NOTIFICAÇÕES
create table public.meetings (
  id uuid primary key default uuid_generate_v4(),
  title text not null,
  meeting_type text not null check (meeting_type in ('ORIENTACAO_SEMANAL', 'REUNIAO_GERAL_MENSAL', 'COORDENACAO', 'CONGRESSO_REVISAO')),
  scheduled_at timestamptz not null,
  location_or_link text not null,
  organizer_id uuid not null references public.profiles(id),
  participant_ids uuid[] not null default '{}'
);

create table public.general_documents (
  id uuid primary key default uuid_generate_v4(),
  title text not null,
  category text not null check (category in ('TEMPLATE_ARTIGO', 'MANUAL_BANCADA', 'OFICIO_EDITAL', 'OUTRO_DOCUMENTO')),
  file_name text not null,
  uploaded_by uuid references public.profiles(id),
  uploaded_at date not null default current_date
);
