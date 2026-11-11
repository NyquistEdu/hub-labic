import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { carregarAcervo } from '@/lib/acervo';
import { ESTAGIO_ROTULO, TIPO_ROTULO, VINCULO_ROTULO, type Conquista } from '@/lib/tipos';
import { CartaoProjeto, CitacaoDepoimento, Retrato } from '@/components/Pecas';

export const revalidate = 60;

type Props = { params: Promise<{ slug: string }> };

/** Rótulo no singular para o vínculo da pessoa. */
const VINCULO_SINGULAR = {
  COORDENACAO: 'Coordenação',
  PESQUISADOR: 'Pesquisa',
  ESTUDANTE: 'Estudante',
  EGRESSO: 'Egresso',
  PARCEIRO: 'Parceria de pesquisa',
} as const;

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const a = await carregarAcervo();
  const p = a.pessoas.find((x) => x.slug === slug);
  return p ? { title: p.nome, description: [p.papel, p.onde_esta].filter(Boolean).join('. ') || undefined } : {};
}

const PUBLICACOES = new Set(['ARTIGO', 'EVENTO', 'TCC']);

export default async function PaginaPessoa({ params }: Props) {
  const { slug } = await params;
  const a = await carregarAcervo();
  const p = a.pessoas.find((x) => x.slug === slug);
  if (!p) notFound();

  const projetos = a.projetos
    .map((pr) => ({ projeto: pr, papel: pr.equipe.find((e) => e.pessoaId === p.id)?.papel }))
    .filter((x) => x.papel !== undefined)
    .sort((x, y) => (y.projeto.ano_inicio ?? 0) - (x.projeto.ano_inicio ?? 0));
  const daPessoa = a.conquistas.filter((c) => c.pessoaIds.includes(p.id));
  const publicacoes = daPessoa.filter((c) => PUBLICACOES.has(c.tipo));
  const outras = daPessoa.filter((c) => !PUBLICACOES.has(c.tipo));
  const startups = a.iniciativas.filter((s) => s.pessoaIds.includes(p.id));
  const depoimentos = a.depoimentos.filter((d) => d.pessoa_id === p.id);
  const nomes = new Map(a.pessoas.map((x) => [x.id, x.nome]));

  const periodo = p.ano_entrada
    ? p.ano_saida && p.ano_saida !== p.ano_entrada
      ? `${p.ano_entrada} a ${p.ano_saida}`
      : p.ano_saida
        ? `${p.ano_entrada}`
        : `Desde ${p.ano_entrada}`
    : '';
  const local = [p.cidade, p.pais].filter(Boolean).join(', ');
  const links = [
    { href: p.lattes_url, rotulo: 'Currículo Lattes' },
    { href: p.linkedin_url, rotulo: 'LinkedIn' },
    { href: p.github_url, rotulo: 'GitHub' },
  ].filter((l) => l.href);
  const fichas = [
    { rotulo: 'No LABIC', valor: periodo },
    { rotulo: 'Curso', valor: p.curso },
    { rotulo: 'Hoje', valor: p.onde_esta },
    { rotulo: 'Onde mora', valor: local },
  ].filter((f) => f.valor);

  return (
    <article>
      <div className="contorno pt-10">
        <Link href="/pessoas" className="underline underline-offset-4 text-sm">Todas as pessoas</Link>
        <div className="mt-6 flex flex-col sm:flex-row sm:items-end gap-6 md:gap-10">
          <Retrato pessoa={p} tamanho={176} />
          <div className="min-w-0">
            <p className="font-semibold">
              <Link href={`/pessoas#${p.slug}`} className="hover:underline">{VINCULO_SINGULAR[p.vinculo] ?? VINCULO_ROTULO[p.vinculo]}</Link>
            </p>
            <h1 className="mt-1 text-5xl md:text-7xl break-words">{p.nome}</h1>
            {(p.papel || p.instituicao) && (
              <p className="mt-2 text-xl font-semibold">{[p.papel, p.instituicao].filter(Boolean).join(', ')}</p>
            )}
          </div>
        </div>
      </div>

      <div className="contorno mt-10 grid gap-10 md:grid-cols-[1.5fr_1fr]">
        <div>
          {p.bio ? (
            <div className="prosa text-lg">
              {p.bio.split('\n').filter(Boolean).map((par, i) => <p key={i}>{par}</p>)}
            </div>
          ) : p.vinculo === 'EGRESSO' ? (
            <p className="text-lg text-grafite max-w-[58ch]">
              Ainda não temos uma apresentação para este perfil. Se você é {p.nome.split(' ')[0]}, mande sua trajetória
              pelo <Link href="/egressos" className="underline">cadastro de egressos</Link>.
            </p>
          ) : null}
          {depoimentos.length > 0 && (
            <div className="mt-10 space-y-6">
              {depoimentos.map((d) => (
                <CitacaoDepoimento key={d.id} depoimento={d} pessoa={p} grande />
              ))}
            </div>
          )}
        </div>
        <aside className="space-y-6">
          {fichas.length > 0 && (
            <dl className="border-[2.5px] border-tinta rounded-[22px] p-5 space-y-3">
              {fichas.map((f) => (
                <div key={f.rotulo}>
                  <dt className="text-sm text-grafite">{f.rotulo}</dt>
                  <dd className="font-semibold">{f.valor}</dd>
                </div>
              ))}
            </dl>
          )}
          {links.length > 0 && (
            <ul className="flex flex-wrap gap-2">
              {links.map((l) => (
                <li key={l.rotulo}>
                  <a className="botao botao-vazado botao-pequeno" href={l.href} target="_blank" rel="noreferrer">{l.rotulo}</a>
                </li>
              ))}
            </ul>
          )}
          {startups.length > 0 && (
            <div>
              <h2 className="text-3xl">Startups</h2>
              <ul className="mt-3 space-y-2">
                {startups.map((s) => (
                  <li key={s.id}>
                    <Link href="/startups" className="font-semibold hover:underline">{s.nome}</Link>
                    <span className="text-sm text-grafite">, {ESTAGIO_ROTULO[s.estagio].toLowerCase()}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </aside>
      </div>

      {projetos.length > 0 && (
        <section className="contorno mt-16">
          <h2 className="text-4xl md:text-5xl">Projetos</h2>
          <div className="mt-8 grid gap-x-8 gap-y-12 sm:grid-cols-2 lg:grid-cols-3">
            {projetos.map(({ projeto, papel }) => (
              <div key={projeto.id}>
                <CartaoProjeto projeto={projeto} />
                {papel && <p className="mt-1 ml-6 text-sm text-grafite">Papel: {papel}</p>}
              </div>
            ))}
          </div>
        </section>
      )}

      <ListaDaPessoa titulo="Publicações" itens={publicacoes} nomes={nomes} />
      <ListaDaPessoa titulo="Prêmios, editais e outras conquistas" itens={outras} nomes={nomes} />
    </article>
  );
}

function ListaDaPessoa({ titulo, itens, nomes }: { titulo: string; itens: Conquista[]; nomes: Map<string, string> }) {
  if (itens.length === 0) return null;
  const ordenados = [...itens].sort((x, y) => y.ano - x.ano || x.titulo.localeCompare(y.titulo));
  return (
    <section className="contorno mt-16">
      <h2 className="text-4xl md:text-5xl">{titulo}</h2>
      <ul className="mt-6 max-w-4xl">
        {ordenados.map((c) => {
          const gente = c.autores || c.pessoaIds.map((id) => nomes.get(id)).filter(Boolean).join(', ');
          const link = c.arquivo_url || c.url;
          return (
            <li key={c.id} className="border-t-[2.5px] border-tinta py-4 md:grid md:grid-cols-[5rem_1fr] md:gap-4">
              <p className="display text-3xl">{c.ano}</p>
              <div>
                <span className="etiqueta">{TIPO_ROTULO[c.tipo]}</span>
                <h3 className="mt-2 text-2xl">{c.titulo}</h3>
                {c.veiculo && <p className="font-semibold mt-1">{c.veiculo}</p>}
                {gente && <p className="text-sm text-grafite mt-1">{gente}</p>}
                {link && (
                  <a href={link} target="_blank" rel="noreferrer" className="text-sm underline underline-offset-4">
                    {c.arquivo_url ? 'Baixar o PDF' : 'Ver a fonte'}
                  </a>
                )}
              </div>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
