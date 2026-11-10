import type { SupabaseClient } from '@supabase/supabase-js';
import inicial from '@/data/acervo-inicial.json';
import { getSupabase } from './supabase';
import type { Acervo, Conquista, Iniciativa, Marco, Parceiro, Pessoa, Projeto } from './tipos';

/** Monta o acervo a partir do arquivo inicial (usado enquanto o banco novo não está no ar). */
export function acervoInicial(): Acervo {
  const pessoas: Pessoa[] = inicial.pessoas.map((p) => ({ ...p, id: p.slug }) as Pessoa);
  const projetos: Projeto[] = inicial.projetos.map((p) => {
    const { pessoas: equipe, ...resto } = p;
    return { ...resto, id: p.slug, equipe: equipe.map((e) => ({ pessoaId: e.slug, papel: e.papel })) } as Projeto;
  });
  const conquistas: Conquista[] = inicial.conquistas.map((c, i) => {
    const { pessoas: ps, ...resto } = c;
    return { ...resto, id: `c${i}`, pessoaIds: ps } as Conquista;
  });
  const iniciativas: Iniciativa[] = inicial.iniciativas.map((s) => {
    const { pessoas: ps, ...resto } = s;
    return { ...resto, id: s.slug, pessoaIds: ps } as Iniciativa;
  });
  const parceiros: Parceiro[] = inicial.parceiros.map((p, i) => ({ ...p, id: `p${i}` }));
  const marcos: Marco[] = inicial.marcos.map((m, i) => ({ ...m, id: `m${i}` }));
  return { pessoas, projetos, conquistas, iniciativas, parceiros, marcos, origem: 'inicial' };
}

/** Lê tudo o que o usuário atual pode ver (visitante: só publicados; gestor: tudo). */
export async function lerAcervoDoBanco(sb: SupabaseClient): Promise<Acervo> {
  const [pe, pr, pp, co, cp, ini, ip, pa, ma] = await Promise.all([
    sb.from('pessoas').select('*').order('nome'),
    sb.from('projetos').select('*').order('titulo'),
    sb.from('projeto_pessoas').select('*'),
    sb.from('conquistas').select('*').order('ano', { ascending: false }),
    sb.from('conquista_pessoas').select('*'),
    sb.from('iniciativas').select('*').order('nome'),
    sb.from('iniciativa_pessoas').select('*'),
    sb.from('parceiros').select('*').order('nome'),
    sb.from('marcos').select('*').order('ano').order('mes', { nullsFirst: true }),
  ]);
  const erro = [pe, pr, pp, co, cp, ini, ip, pa, ma].find((r) => r.error)?.error;
  if (erro) throw new Error(erro.message);

  const projetos: Projeto[] = (pr.data ?? []).map((p) => ({
    ...p,
    equipe: (pp.data ?? [])
      .filter((v) => v.projeto_id === p.id)
      .map((v) => ({ pessoaId: v.pessoa_id, papel: v.papel })),
  }));
  const conquistas: Conquista[] = (co.data ?? []).map((c) => ({
    ...c,
    pessoaIds: (cp.data ?? []).filter((v) => v.conquista_id === c.id).map((v) => v.pessoa_id),
  }));
  const iniciativas: Iniciativa[] = (ini.data ?? []).map((s) => ({
    ...s,
    pessoaIds: (ip.data ?? []).filter((v) => v.iniciativa_id === s.id).map((v) => v.pessoa_id),
  }));
  return {
    pessoas: (pe.data ?? []) as Pessoa[],
    projetos,
    conquistas,
    iniciativas,
    parceiros: (pa.data ?? []) as Parceiro[],
    marcos: (ma.data ?? []) as Marco[],
    origem: 'banco',
  };
}

/**
 * Acervo para as páginas públicas. Usa o banco quando ele já tem conteúdo publicado;
 * caso contrário (banco não configurado, migração ainda não aplicada ou vazio),
 * mostra o acervo inicial para o site nunca aparecer em branco.
 */
export async function carregarAcervo(): Promise<Acervo> {
  const sb = getSupabase();
  if (sb) {
    try {
      const a = await lerAcervoDoBanco(sb);
      if (a.projetos.length + a.pessoas.length > 0) return a;
    } catch {
      // segue para o acervo inicial
    }
  }
  return acervoInicial();
}
