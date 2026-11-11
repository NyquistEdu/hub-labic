# Como colocar a nova versão no ar

Quatro passos, feitos uma única vez por quem tem acesso ao painel do Supabase e da Vercel.
Enquanto eles não forem feitos, o site público funciona normalmente mostrando o acervo inicial
(`src/data/acervo-inicial.json`), mas a área de gestão e o formulário de egressos ficam desligados.

## 1. Aplicar a migração do banco

No painel do Supabase: **SQL Editor > New query**. Cole o conteúdo de
`supabase/migrations/003_acervo_seguro.sql` e clique em **Run**.

O script cria as tabelas novas, liga as regras de acesso e **tranca as tabelas antigas do rascunho**
(que estavam abertas a qualquer visitante, com senhas em texto puro). Nada é apagado.

Depois rode, na ordem, `004_publicacoes.sql` (PDFs de artigos e TCCs), `005_depoimentos.sql`
(depoimentos: visitantes enviam pelo site, e o texto só aparece depois que a coordenação publica) , `006_vinculo_egresso_parceiro.sql` (vínculo "egresso e parceiro de pesquisa") e `007_mensagens.sql` (Fale conosco: visitantes enviam, só a gestão lê).

## 2. Criar o usuário da coordenação

No painel do Supabase: **Authentication > Users > Add user > Create new user**.
Informe e-mail e uma senha nova (não reutilize a senha do rascunho) e marque **Auto Confirm User**.

## 3. Dar acesso de gestão a esse usuário

De volta ao **SQL Editor**, rode (trocando o e-mail):

```sql
insert into public.gestores (user_id, nome)
select id, 'Stephanie Kamarry' from auth.users where email = 'seu-email@ifs.edu.br';
```

Repita os passos 2 e 3 para cada pessoa que deve poder editar o acervo.
Em **Authentication > Sign In / Providers**, desligue "Allow new users to sign up": ninguém precisa
criar conta sozinho (mesmo que crie, só entra na gestão quem está na tabela `gestores`).

## 4. Conferir as variáveis na Vercel e publicar

Em **Vercel > Project > Settings > Environment Variables**, confirme que existem, para Production e Preview:

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`

Depois, faça o merge do pull request na branch `main`. A Vercel publica sozinha.

## 5. Primeiro acesso

1. Abra `/gestao`, entre com o usuário criado no passo 2.
2. Na Visão geral, clique em **Importar acervo inicial**.
3. Revise os itens (veja `docs/REVISAR-ACERVO.md`) e envie o link `/egressos` para os ex-membros.

## Depois de tudo conferido

As senhas do rascunho continuam gravadas na tabela antiga `profiles` (agora inacessível pelo site).
Para apagá-las de vez:

```sql
alter table public.profiles drop column if exists password;
```

Os arquivos dos buckets antigos (`documentos-labic`, `artigos-congressos`, `relatorios-projetos`,
`impressao-3d-stl`) deixaram de ter link público. Continuam guardados e visíveis pelo painel do Supabase.
