# HUB-LABIC — Sistema de Gestão Científica, Operacional e Vitrine Institucional (IFS Campus Lagarto)

Sistema web full-stack desenvolvido em **Next.js 15 (App Router) + React 19 + TypeScript + Tailwind CSS + Supabase (PostgreSQL & Storage)** para o gerenciamento científico, financeiro e operacional do **Laboratório de Pesquisa LABIC** (Instituto Federal de Sergipe — Campus Lagarto e rede multi-institucional de pesquisadores).

---

## ✨ Principais Módulos e Funcionalidades

- **Vitrine Institucional Pública (`/`)**: Indicadores consolidados dinamicamente por ano, Mapa Mundial interativo (*"LABIC pelo Mundo"*), acervo público de produções, projetos, startups e corpo de pesquisadores com foto de perfil e Lattes.
- **Autenticação & Sessão de 24h (`/login`)**: Controle de sessão com expiração automática em 24 horas e proteção de rotas internas.
- **Produções Científicas e Tecnológicas (`/app/producoes`)**: Registro de artigos, TCCs/dissertações, registros de software no INPI, premiações, editais e protótipos, com **Autor Principal** (incluindo egressos/inativos) + **Coautores**, upload de múltiplos PDFs e links externos e CRUD completo.
- **Projetos, Entregas e Sigilo de Bolsas (`/app/projetos`)**: Gestão de projetos com controle de acesso por integrante (`canAccessProject`), entregas dinâmicas com múltiplos PDFs/links, **Bloco de Notas Compartilhado** e sigilo estrito de bolsas (apenas `DIRETORA`, `COORD_GERAL` e o próprio bolsista visualizam o status e valor em R$ da bolsa).
- **Congressos e Fluxo de Revisão Interna (`/app/congressos` e `/app/congressos/[id]`)**: Painel exclusivo por evento com cronograma interno de metas (`milestones[]`), checklist de status e histórico concreto de versões em PDF (`versions[]`) entre autor e revisores internos.
- **Startups e Editais (`/app/startups` e `/app/startups/[startupId]/editais/[editalId]`)**: Vinculação de equipe técnica por edital submetido, trava estrita de segurança (`canAccessStartupEdital`), checklist de entregas do edital, anexos em PDF/links e bloco de notas.
- **Documentos Gerais (`/app/documentos`) & Reuniões (`/app/reunioes`)**: Repositório de templates/manuais com múltiplos anexos e agendamento de reuniões com seletores nativos de data/hora, pauta/ata e convocação rápida.
- **Solicitações e Escalas (`/app/servicos`) & 7 Coordenações de Departamento**:
  - **Insumos (`/app/coordenacoes/insumos`)**: Estoque de componentes e aprovação de consumíveis/empréstimos.
  - **Impressão 3D (`/app/coordenacoes/impressao-3d`)**: Aprovação de solicitações de uso da impressora 3D e baixa de conclusão.
  - **Manutenção (`/app/coordenacoes/manutencao`) & Computadores (`/app/coordenacoes/computadores`)**: Gestão de bancadas, estações de trabalho e chamados.
  - **Limpeza (`/app/coordenacoes/limpeza`)**: Quadro semanal com seleção de múltiplos dias da semana para membros presenciais.
  - **Mídia (`/app/coordenacoes/midia`)**: Sorteador automático mensal de postagens.
  - **Finanças (`/app/financas`)**: Caixinhas reservadas e fluxo de caixa (restrito à Diretora, Coordenação Geral e Coordenação de Finanças).
- **Meu Perfil (`/app/perfil`) & Membros (`/app/membros`)**: Foto de perfil (`avatarUrl`), trajetória acadêmica multi-institucional, soma total de bolsas recebidas no laboratório, gestão de cargos globais (`DIRETORA`, `COORD_GERAL`, `PESQUISADOR`) e redefinição segura de senhas.

---

## 🚀 Como Rodar Localmente

1. Instale as dependências:
   ```bash
   npm install
   ```
2. Configure o arquivo `.env.local` na raiz do projeto (veja `.env.example`):
   ```env
   NEXT_PUBLIC_SUPABASE_URL=https://seu-projeto.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=sua-chave-anon
   NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=sua-chave-publishable
   ```
3. Inicie o servidor de desenvolvimento:
   ```bash
   npm run dev
   ```
4. Para validar tipagem e build de produção:
   ```bash
   npx tsc --noEmit
   npm run build
   ```

---

## 🗄️ Banco de Dados (Supabase Migrations)

Os scripts SQL de estrutura e evolução do banco estão em:
1. [`supabase/migrations/001_initial_schema.sql`](./supabase/migrations/001_initial_schema.sql) — Tabelas base, relacionamentos e buckets de Storage.
2. [`supabase/migrations/002_full_crud_and_attachments.sql`](./supabase/migrations/002_full_crud_and_attachments.sql) — Colunas adicionais para múltiplos anexos JSONB (`attachments`), versões de artigos (`versions`), metas (`milestones`), autor principal (`primary_author_id`), fotos de perfil (`avatar_url`) e políticas públicas de Storage.

---

## 🤖 Documentação para Agentes de IA

Antes de realizar qualquer manutenção assistida por IA, consulte:
- [`AGENTS.md`](./AGENTS.md) — Especificação completa de arquitetura, regras de negócio, RBAC e segurança.
- [`CLAUDE.md`](./CLAUDE.md) — Resumo executivo para Claude Code / Antigravity.
- [`.cursorrules`](./.cursorrules) — Regras contextuais para Cursor / Windsurf.
