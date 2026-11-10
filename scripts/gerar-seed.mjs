// Gera supabase/seed/acervo_inicial.sql a partir de src/data/acervo-inicial.json.
// Uso: node scripts/gerar-seed.mjs
import { readFileSync, writeFileSync } from 'node:fs';

const a = JSON.parse(readFileSync(new URL('../src/data/acervo-inicial.json', import.meta.url), 'utf8'));
const q = (v) => {
  if (v === null || v === undefined) return 'null';
  if (typeof v === 'number') return String(v);
  if (typeof v === 'boolean') return v ? 'true' : 'false';
  if (Array.isArray(v)) return v.length ? `array[${v.map(q).join(', ')}]::text[]` : `'{}'::text[]`;
  return `'${String(v).replace(/'/g, "''")}'`;
};
const insert = (tabela, obj, conflito) => {
  const cols = Object.keys(obj);
  return `insert into public.${tabela} (${cols.join(', ')}) values (${cols.map((c) => q(obj[c])).join(', ')})${
    conflito ? ` on conflict (${conflito}) do nothing` : ''
  };`;
};

const sql = [
  '-- Acervo inicial do HUB LABIC (gerado por scripts/gerar-seed.mjs — não edite à mão).',
  '-- Execute UMA vez, depois da migração 003. Itens com o mesmo "slug" não são duplicados.',
  'begin;',
];
for (const p of a.pessoas) sql.push(insert('pessoas', p, 'slug'));
for (const p of a.projetos) {
  const { pessoas, ...resto } = p;
  sql.push(insert('projetos', resto, 'slug'));
  for (const v of pessoas)
    sql.push(
      `insert into public.projeto_pessoas (projeto_id, pessoa_id, papel) select pr.id, pe.id, ${q(v.papel)} from public.projetos pr, public.pessoas pe where pr.slug = ${q(p.slug)} and pe.slug = ${q(v.slug)} on conflict do nothing;`
    );
}
for (const s of a.iniciativas) {
  const { pessoas, ...resto } = s;
  sql.push(insert('iniciativas', resto, 'slug'));
  for (const slug of pessoas)
    sql.push(
      `insert into public.iniciativa_pessoas (iniciativa_id, pessoa_id) select i.id, pe.id from public.iniciativas i, public.pessoas pe where i.slug = ${q(s.slug)} and pe.slug = ${q(slug)} on conflict do nothing;`
    );
}
// Conquistas, parceiros e marcos não têm slug: só entram se a tabela ainda estiver vazia.
sql.push('do $$ begin if not exists (select 1 from public.conquistas) then');
for (const c of a.conquistas) {
  const { pessoas, ...resto } = c;
  sql.push(insert('conquistas', resto));
  for (const slug of pessoas)
    sql.push(
      `insert into public.conquista_pessoas (conquista_id, pessoa_id) select c.id, pe.id from public.conquistas c, public.pessoas pe where c.titulo = ${q(c.titulo)} and pe.slug = ${q(slug)} on conflict do nothing;`
    );
}
sql.push('end if; end $$;');
sql.push('do $$ begin if not exists (select 1 from public.parceiros) then');
for (const p of a.parceiros) sql.push(insert('parceiros', p));
sql.push('end if; end $$;');
sql.push('do $$ begin if not exists (select 1 from public.marcos) then');
for (const m of a.marcos) sql.push(insert('marcos', m));
sql.push('end if; end $$;');
sql.push('commit;', '');
writeFileSync(new URL('../supabase/seed/acervo_inicial.sql', import.meta.url), sql.join('\n'));
console.log('ok', sql.length, 'linhas');
