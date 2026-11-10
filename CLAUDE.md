# CLAUDE.md — Contexto de Desenvolvimento IA para o HUB-LABIC

Consulte e siga integralmente as especificações definidas em [`AGENTS.md`](./AGENTS.md).

## Resumo Rápido de Regras Inegociáveis (Não perguntar novamente)
1. **Stack & Deploy:** Next.js 15 (App Router) + TypeScript + Tailwind CSS + Supabase (PostgreSQL + Storage), hospedado na Vercel (`https://github.com/NyquistEdu/hub-labic.git`, branch `main`).
2. **UI/UX Minimalista e Sóbria:** Fundo `#0c0d10` / `#111318`, bordas `border-zinc-800`, destaque `emerald-600`. Zero poluição visual, sem simuladores falsos de cargo e com botão compacto `?` (`PageTutorialButton`) no cabeçalho superior direito.
3. **CRUD Completo e Múltiplos Anexos (`AttachmentManager`):**
   - Todas as entidades possuem Criar, Ler, Editar e Excluir (CRUD) sincronizados com o Supabase.
   - Em todos os módulos documentais, **PDFs são enviados via upload direto** e **demais formatos são anexados como links externos (`https://...`)**, suportando múltiplos arquivos por registro.
4. **Autenticação, Sessão 24h e Sigilo de Senhas:**
   - Sessão local (`labic_auth_session` + cookie) expira em **24 horas**.
   - Na página `/login`, nunca exiba credenciais de admin.
   - Em `/app/membros`, **nunca exiba a senha atual** de nenhum usuário; disponibilize apenas o botão **"Trocar Senha"** (modal seguro). Tanto `DIRETORA` quanto `COORD_GERAL` podem alterar o `globalRole` (`PESQUISADOR` ⇄ `COORD_GERAL` ⇄ `DIRETORA`).
5. **Sigilo, Vigência e Cálculo de Bolsas, Projetos e Editais de Startups:**
   - **Bolsas:** Apenas `DIRETORA`, `COORD_GERAL` e o próprio bolsista veem o status de bolsista, o valor em R$, o início/fim (`YYYY-MM`), a quantidade de parcelas e a vigência (`getScholarshipVigenciaStatus`). Nunca mostre `"Valor restrito"` para terceiros (exiba apenas `"Pesquisador Integrante"`). Em `/app/membros`, exiba o Ganho Mensal Atual (somando apenas bolsas vigentes) e a lista dos projetos em que cada membro recebe bolsa.
   - **Autores Externos (`externalAuthors`):** Em Produções e Congressos, permita informar nomes completos separados por vírgula para coautores de fora do LABIC sem criar conta de usuário.
   - **Formatação Limpa:** Nunca exiba códigos `UPPER_SNAKE_CASE` ou timestamps ISO brutos na interface; use os mapas de labels e `formatDateBR` / `formatMeetingDateTime` de `src/types/labic.ts`.
   - **Projetos (`canAccessProject`):** Apenas integrantes do projeto (ou Admin) acessam entregas, notas compartilhadas (`notes`) e edição do projeto.
   - **Editais de Startups (`canAccessStartupEdital`):** Membros são vinculados ao Edital específico (`memberIds[]`). Apenas integrantes daquele edital (ou Admin) podem abrir `/app/startups/[startupId]/editais/[editalId]` ou editá-lo.
6. **Congressos (`/app/congressos/[id]`):** Página dedicada com cronograma interno de metas (`milestones[]`), histórico real de versões em PDF (`versions[]` entre Autor e Revisor) e sem trava de conflito de interesse para revisores.
7. **Página Exclusiva de Projetos (`/app/projetos/[id]`) e Diário de Notas:** A lista principal `/app/projetos` possui filtros de escopo ("Meus Projetos" como default), status ("Em andamento" como default), ordenação e busca. Cada projeto possui sua página dedicada com entregas, equipe e bloco de notas cronológico (`ProjectNoteItem[]` com autor, data/hora e texto).
8. **Paginação (15, 20, 50) e Busca Discreta:** Paginação em todas as listagens via `PaginationControls.tsx` e pesquisa expansível discreta via `DiscreetSearchBar.tsx` (sem barras de pesquisa pesadas fixas).
