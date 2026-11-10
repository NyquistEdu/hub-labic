# HUB-LABIC — Sistema de Gestão Científica, Operacional e Vitrine (IFS Campus Lagarto)

Sistema integrado desenvolvido em **Next.js + TypeScript + Tailwind CSS + Supabase (PostgreSQL)** para o gerenciamento completo do **Laboratório de Pesquisa LABIC** (Instituto Federal de Sergipe — Campus Lagarto e rede internacional de pesquisadores).

---

## 🚀 Como Rodar o Projeto Localmente

1. Instale as dependências:
   ```bash
   npm install
   ```
2. Inicie o servidor de desenvolvimento:
   ```bash
   npm run dev
   ```
3. Acesse no navegador:
   - **Portal & Painel Interno:** `http://localhost:3000` (ou direto em `http://localhost:3000/app`)
   - **Vitrine Pública do LABIC:** `http://localhost:3000/vitrine`
   - **Modo Apresentação da Diretora, Timeline (2021–2026) & Mapa Mundial:** `http://localhost:3000/app/indicadores`
   - **Central de Ajuda & Onboarding:** `http://localhost:3000/app/ajuda`

---

## 🗄️ Como Conectar ao Supabase (Quando Criar seu Projeto)

1. Crie um novo projeto gratuito no [Supabase](https://supabase.com/).
2. No menu lateral do Supabase, abra o **SQL Editor**, copie todo o conteúdo de [`supabase/migrations/001_initial_schema.sql`](./supabase/migrations/001_initial_schema.sql) e clique em **Run** para criar todas as tabelas.
3. Copie o arquivo `.env.example` para `.env.local` e preencha `NEXT_PUBLIC_SUPABASE_URL` e `NEXT_PUBLIC_SUPABASE_ANON_KEY`.
4. Para publicar na **Vercel**, basta importar o repositório e adicionar essas duas variáveis de ambiente no painel da Vercel.

---

## 🤖 Arquivos de Guia para Desenvolvimento com IA
- [`AGENTS.md`](./AGENTS.md)
- [`CLAUDE.md`](./CLAUDE.md)
- [`.cursorrules`](./.cursorrules)
