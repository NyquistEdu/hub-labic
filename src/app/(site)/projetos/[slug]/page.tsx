import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { carregarAcervo } from '@/lib/acervo';
import { STATUS_ROTULO, TIPO_ROTULO } from '@/lib/tipos';
import { Capa } from '@/components/Capa';
import { CartaoProjeto, EtiquetaArea, Retrato } from '@/components/Pecas';

export const revalidate = 60;

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const a = await carregarAcervo();
  const p = a.projetos.find((x) => x.slug === slug);
  return p ? { title: p.titulo, description: p.resumo } : {};
}

export default async function PaginaProjeto({ params }: Props) {
  const { slug } = await params;
  const a = await carregarAcervo();
  const p = a.projetos.find((x) => x.slug === slug);
  if (!p) notFound();

  const equipe = p.equipe
    .map((e) => ({ pessoa: a.pessoas.find((x) => x.id === e.pessoaId), papel: e.papel }))
    .filter((e) => e.pessoa);
  const producao = a.conquistas
    .filter((c) => c.projeto_id === p.id)
    .sort((x, y) => y.ano - x.ano || x.titulo.localeCompare(y.titulo));
  const nomes = new Map(a.pessoas.map((x) => [x.id, x.nome]));
  const parecidos = a.projetos.filter((x) => x.id !== p.id && x.areas.some((ar) => p.areas.includes(ar))).slice(0, 3);
  const periodo = p.ano_inicio ? (p.ano_fim && p.ano_fim !== p.ano_inicio ? `${p.ano_inicio} a ${p.ano_fim}` : `${p.ano_inicio}`) : '';

  return (
    <article>
      <div className="contorno pt-10">
        <Link href="/projetos" className="underline underline-offset-4 text-sm">Todos os projetos</Link>
        <h1 className="mt-4 text-5xl md:text-8xl max-w-5xl">{p.titulo}</h1>
        <div className="mt-5 flex flex-wrap gap-2">
          {p.areas.map((ar) => (
            <EtiquetaArea key={ar} area={ar} />
          ))}
        </div>
      </div>

      <div className="contorno mt-8 grid gap-10 md:grid-cols-[1.5fr_1fr]">
        <div>
          <Capa src={p.capa_url} alt={`Foto do projeto ${p.titulo}`} areas={p.areas} className="aspect-[16/10] border-[2.5px] border-tinta rounded-[22px]" />
          <div className="prosa mt-8 text-lg">
            <p>{p.resumo}</p>
            {p.descricao && p.descricao.split('\n').filter(Boolean).map((par, i) => <p key={i}>{par}</p>)}
          </div>
          {p.video_url && (
            <p className="mt-6">
              <a className="botao botao-vazado botao-pequeno" href={p.video_url} target="_blank" rel="noreferrer">Assistir ao vídeo</a>
            </p>
          )}
        </div>
        <aside className="space-y-6">
          <dl className="border-[2.5px] border-tinta rounded-[22px] p-5 space-y-3">
            <div><dt className="text-sm text-grafite">Situação</dt><dd className="font-semibold">{STATUS_ROTULO[p.status]}</dd></div>
            {periodo && <div><dt className="text-sm text-grafite">Período</dt><dd className="font-semibold">{periodo}</dd></div>}
            {p.fomento && <div><dt className="text-sm text-grafite">Apoio</dt><dd className="font-semibold">{p.fomento}</dd></div>}
          </dl>
          {equipe.length > 0 && (
            <div>
              <h2 className="text-3xl">Equipe</h2>
              <ul className="mt-3 space-y-3">
                {equipe.map(({ pessoa, papel }) => (
                  <li key={pessoa!.id}>
                    <Link href={`/pessoas#${pessoa!.slug}`} className="flex items-center gap-3 group">
                      <Retrato pessoa={pessoa!} tamanho={48} />
                      <span>
                        <strong className="block leading-tight group-hover:underline">{pessoa!.nome}</strong>
                        <span className="text-sm text-grafite">{papel}</span>
                      </span>
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </aside>
      </div>

      {p.galeria.length > 0 && (
        <div className="contorno mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {p.galeria.map((g, i) => (
            <Capa key={g} src={g} alt={`${p.titulo}, foto ${i + 2}`} areas={p.areas} className="aspect-[4/3] border-[2.5px] border-tinta rounded-[22px]" />
          ))}
        </div>
      )}

      {producao.length > 0 && (
        <section className="contorno mt-16">
          <h2 className="text-4xl md:text-5xl">O que este projeto já rendeu</h2>
          <ul className="mt-6 max-w-4xl">
            {producao.map((c) => {
              const gente = c.autores || c.pessoaIds.map((id) => nomes.get(id)).filter(Boolean).join(', ');
              return (
                <li key={c.id} className="border-t-[2.5px] border-tinta py-4 md:grid md:grid-cols-[5rem_1fr] md:gap-4">
                  <p className="display text-3xl">{c.ano}</p>
                  <div>
                    <span className="etiqueta">{TIPO_ROTULO[c.tipo]}</span>
                    <h3 className="mt-2 text-2xl">{c.titulo}</h3>
                    {c.veiculo && <p className="font-semibold mt-1">{c.veiculo}</p>}
                    {gente && <p className="text-sm text-grafite mt-1">{gente}</p>}
                    {c.url && (
                      <a href={c.url} target="_blank" rel="noreferrer" className="text-sm underline underline-offset-4">Ver a fonte</a>
                    )}
                  </div>
                </li>
              );
            })}
          </ul>
        </section>
      )}

      {parecidos.length > 0 && (
        <section className="contorno mt-20">
          <h2 className="text-4xl md:text-5xl">Da mesma frente</h2>
          <div className="mt-8 grid gap-x-8 gap-y-12 sm:grid-cols-2 lg:grid-cols-3">
            {parecidos.map((x) => (
              <CartaoProjeto key={x.id} projeto={x} />
            ))}
          </div>
        </section>
      )}
    </article>
  );
}
