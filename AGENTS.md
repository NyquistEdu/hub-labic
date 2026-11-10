# AGENTS.md — HUB LABIC

Site vitrine do LABIC (Laboratório de Inovação e Criatividade, IFS Campus Lagarto) com área de gestão do acervo.

## Stack
Next.js 15 (App Router) + React 19 + TypeScript + Tailwind CSS 4 + Supabase (Postgres, Auth, Storage). Deploy na Vercel a partir da `main`.

## Mapa do código
- `src/app/(site)/` — páginas públicas: início, `/projetos`, `/projetos/[slug]`, `/pessoas`, `/startups`, `/conquistas`, `/egressos` (formulário).
- `src/app/login`, `src/app/gestao` — área restrita. As telas de cadastro são geradas pela lista `ENTIDADES` em `gestao/page.tsx`.
- `src/lib/tipos.ts` — tipos, rótulos e as oito frentes (cores do logo).
- `src/lib/acervo.ts` — leitura do acervo; cai no acervo inicial se o banco estiver vazio ou indisponível.
- `src/data/acervo-inicial.json` — acervo inicial. `node scripts/gerar-seed.mjs` gera o SQL equivalente.
- `supabase/migrations/003_acervo_seguro.sql` — esquema atual e regras de acesso (RLS).

## Regras
1. **Segurança.** Nada de senha em tabela nem checagem de permissão só no navegador. Login é Supabase Auth; quem pode editar está em `public.gestores`; toda tabela nova nasce com RLS (leitura pública só de `publicado = true`, escrita só com `public.is_gestor()`). Dados de contato ficam em `pessoas_contato`, nunca em tabela lida pelo site.
2. **Identidade visual.** Fundo branco, preto puro, traço de 2,5 px, cantos em cápsula, fonte Big Shoulders Display nos títulos e Instrument Sans no texto. Cor só aparece como código das oito frentes. Não reintroduza o tema escuro do rascunho.
3. **Textos** em português do Brasil, frases diretas, sem códigos `UPPER_SNAKE_CASE` na interface (use os mapas de rótulos).
4. **Campo novo** = coluna em nova migração + `tipos.ts` + lista `campos` da entidade em `gestao/page.tsx`.
5. Antes de enviar: `npx tsc --noEmit` e `npm run build`.

Os módulos de rotina do rascunho (finanças, insumos, impressão 3D, limpeza, mídia, reuniões, congressos) foram retirados nesta versão. O código está no histórico do git (commit `6ecbf8a`) e as tabelas continuam no banco, trancadas.
