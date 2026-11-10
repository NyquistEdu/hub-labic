# CLAUDE.md — Contexto de Desenvolvimento IA para o HUB-LABIC

Consulte e siga integralmente as especificações definidas em [`AGENTS.md`](./AGENTS.md).

## Resumo Rápido de Regras Inegociáveis (Não perguntar novamente)
1. **Stack:** Next.js (App Router) + TypeScript + Tailwind CSS + Supabase (PostgreSQL/Auth/Storage), pronto para Vercel.
2. **UI/UX:** Variante A inspirada no **Supabase Studio** + Engenharia Semiótica. Barra lateral com **Visibilidade Progressiva** (só exibe na seção `Minhas Coordenações` os departamentos que o usuário logado coordena).
3. **Sigilo Financeiro e de Bolsas:**
   - Aba `Finanças` (Caixinhas) só aparece para `DIRETORA`, `COORD_GERAL` e `COORD_FINANCAS`.
   - Valor em R$ de bolsa em projetos só aparece para `DIRETORA`, `COORD_GERAL` e o **próprio bolsista** (o Coorientador NÃO vê o valor em R$).
4. **Trajetória Acadêmica Multi-Institucional:** Alunos formados no IFS que vão para o Mestrado/Doutorado (ex.: USP, Canadá, Itália) permanecem `ATIVOS` no LABIC com a nova formação e localização no **Mapa Mundial "LABIC pelo Mundo"**.
5. **Congressos (ex.: CROS 2027):** NÃO há bloqueio de conflito de interesse na revisão interna — o próprio autor, coorientador ou coordenador geral pode ser revisor do próprio artigo.
6. **Autoexplicação:** Toda página interna deve ter o botão `❓ Como usar esta tela` (`PageTutorialButton`) e documentação correspondente na Central de Ajuda (`/app/ajuda`).
