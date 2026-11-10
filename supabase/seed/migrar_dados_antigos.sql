-- Traz para o acervo novo os dados reais cadastrados no sistema antigo
-- (profiles, productions, startups, startup_applications). Não altera as tabelas antigas.
-- Execute depois de acervo_inicial.sql. Pode ser executado mais de uma vez.
begin;

create or replace function pg_temp.slug(t text) returns text language sql immutable as $$
  select trim(both '-' from regexp_replace(lower(translate(t,
    'áàâãäéèêëíìîïóòôõöúùûüçñÁÀÂÃÄÉÈÊËÍÌÎÏÓÒÔÕÖÚÙÛÜÇÑ',
    'aaaaaeeeeiiiiooooouuuucnaaaaaeeeeiiiiooooouuuucn')), '[^a-z0-9]+', '-', 'g'));
$$;

-- Nome completo de quem já estava no acervo inicial com nome abreviado
update public.pessoas set nome = 'Leonardo Aprigio Nascimento Fontes' where slug = 'leonardo-aprigio-nascimento';
update public.pessoas set nome = 'Danilo Santos Oliveira' where slug = 'danilo-oliveira';

-- 1. Contas do sistema antigo viram pessoas (a conta genérica de administrador fica de fora)
insert into public.pessoas (slug, nome, vinculo, papel, instituicao, curso, cidade, pais, foto_url, lattes_url, linkedin_url, publicado)
select pg_temp.slug(j->>'name'), j->>'name', 'ESTUDANTE', 'Estudante',
       'IFS Campus Lagarto', coalesce(j->>'course', ''), coalesce(j->>'current_location_city', ''),
       coalesce(j->>'current_location_country', 'Brasil'), coalesce(j->>'avatar_url', ''),
       coalesce(j->>'lattes_url', ''), coalesce(j->>'linkedin_url', ''),
       coalesce((j->>'show_on_public_showcase')::boolean, false) and j->>'status' = 'ATIVO'
from (select to_jsonb(p) j from public.profiles p) x
where j->>'name' not ilike 'Administrador%'
on conflict (slug) do nothing;

insert into public.pessoas_contato (pessoa_id, email)
select pe.id, j->>'email'
from (select to_jsonb(p) j from public.profiles p) x
join public.pessoas pe on pe.slug = pg_temp.slug(j->>'name')
where coalesce(j->>'email', '') <> ''
on conflict (pessoa_id) do nothing;

-- Correspondência: id da conta antiga -> pessoa nova
create temp table mapa_pessoas on commit drop as
select j->>'id' as id_antigo, pe.id as pessoa_id, pe.nome
from (select to_jsonb(p) j from public.profiles p) x
join public.pessoas pe on pe.slug = pg_temp.slug(j->>'name');

-- 2. Produções viram conquistas
create temp table prod on commit drop as
select j->>'id' as id_antigo, j->>'title' as titulo, (j->>'year')::int as ano,
       case j->>'category' when 'ARTIGO' then 'ARTIGO' when 'TCC' then 'TCC' when 'INPI_SOFTWARE' then 'SOFTWARE'
            when 'PREMIACAO' then 'PREMIO' when 'EDITAL_APROVADO' then 'EDITAL' else 'EVENTO' end as tipo,
       coalesce(j->>'venue_or_agency', '') as veiculo,
       concat_ws(', ', nullif(j->>'primary_author_external', ''), nullif(j->>'external_authors', '')) as externos,
       j->>'primary_author_id' as principal,
       case when jsonb_typeof(j->'author_ids') = 'array' then j->'author_ids' else '[]'::jsonb end as autores_ids,
       case when coalesce(j->>'doi_or_url', '') ~ '^https?://' then j->>'doi_or_url' else '' end as url,
       not coalesce((j->>'is_sensitive')::boolean, false) as publicado
from (select to_jsonb(p) j from public.productions p) x;

create temp table prod_autores on commit drop as
select p.id_antigo, m.pessoa_id, m.nome, (a.id = p.principal) as eh_principal
from prod p
cross join lateral (
  select p.principal as id where p.principal is not null
  union
  select jsonb_array_elements_text(p.autores_ids)
) a
join mapa_pessoas m on m.id_antigo = a.id;

insert into public.conquistas (tipo, titulo, ano, veiculo, autores, url, publicado)
select p.tipo, p.titulo, p.ano, p.veiculo,
       concat_ws(', ',
         (select string_agg(pa.nome, ', ' order by pa.eh_principal desc, pa.nome) from prod_autores pa where pa.id_antigo = p.id_antigo),
         nullif(p.externos, '')),
       p.url, p.publicado
from prod p
where not exists (select 1 from public.conquistas c where c.titulo = p.titulo and c.tipo = p.tipo);

-- Vínculos: autores com conta no sistema antigo
insert into public.conquista_pessoas (conquista_id, pessoa_id)
select c.id, pa.pessoa_id
from prod p
join public.conquistas c on c.titulo = p.titulo and c.tipo = p.tipo
join prod_autores pa on pa.id_antigo = p.id_antigo
on conflict do nothing;

-- Vínculos: coautores "externos" que já são pessoas do acervo
insert into public.conquista_pessoas (conquista_id, pessoa_id)
select c.id, pe.id
from prod p
join public.conquistas c on c.titulo = p.titulo and c.tipo = p.tipo
join (values
  ('%Prudente%', 'fabio-luiz-sa-prudente'),
  ('%Phillipe Cardoso%', 'phillipe-cardoso-santos'),
  ('%Barbosa Cruz%', 'benicio-barbosa-cruz'),
  ('%Leonardo Apr%', 'leonardo-aprigio-nascimento'),
  ('%Danilo Santos Oliveira%', 'danilo-oliveira'),
  ('%Augusto Andrade%', 'jose-augusto-de-andrade-filho'),
  ('%Givigi%', 'sidney-givigi')
) as k(padrao, slug) on p.externos ilike k.padrao
join public.pessoas pe on pe.slug = k.slug
on conflict do nothing;

-- 3. Startups e editais aprovados
insert into public.iniciativas (slug, nome, tagline, descricao, estagio, publicado)
select pg_temp.slug(j->>'name'), j->>'name', coalesce(j->>'tagline', ''),
       case when j->>'description' = j->>'tagline' then '' else coalesce(j->>'description', '') end,
       case j->>'stage' when 'IDEACAO' then 'IDEACAO' when 'MVP_PROTOTIPO' then 'MVP' when 'VALIDACAO' then 'VALIDACAO' else 'OPERACAO' end,
       coalesce((j->>'show_on_public_showcase')::boolean, false)
from (select to_jsonb(s) j from public.startups s) x
on conflict (slug) do nothing;

insert into public.iniciativa_pessoas (iniciativa_id, pessoa_id)
select i.id, m.pessoa_id
from (select to_jsonb(s) j from public.startups s) x
join public.iniciativas i on i.slug = pg_temp.slug(j->>'name')
cross join lateral jsonb_array_elements_text(case when jsonb_typeof(j->'member_ids') = 'array' then j->'member_ids' else '[]'::jsonb end) mid
join mapa_pessoas m on m.id_antigo = mid
on conflict do nothing;

insert into public.conquistas (tipo, titulo, ano, veiculo, publicado)
select 'EDITAL', (s.j->>'name') || ' aprovada no programa ' || (a.j->>'program_name'), (a.j->>'year')::int, a.j->>'program_name', true
from (select to_jsonb(t) j from public.startup_applications t) a
join (select to_jsonb(t) j from public.startups t) s on s.j->>'id' = a.j->>'startup_id'
where a.j->>'phase_or_status' = 'APROVADO_CONTEMPLADO'
  and not exists (select 1 from public.conquistas c where c.titulo = (s.j->>'name') || ' aprovada no programa ' || (a.j->>'program_name'));

commit;

select (select count(*) from public.pessoas) pessoas, (select count(*) from public.projetos) projetos,
       (select count(*) from public.conquistas) conquistas, (select count(*) from public.conquista_pessoas) vinculos_conquistas,
       (select count(*) from public.iniciativas) startups, (select count(*) from public.parceiros) parceiros, (select count(*) from public.marcos) marcos;
