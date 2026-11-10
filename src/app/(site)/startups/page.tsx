import type { Metadata } from 'next';
import Link from 'next/link';
import { carregarAcervo } from '@/lib/acervo';
import { AREAS, ESTAGIO_ROTULO } from '@/lib/tipos';
import { TituloPagina } from '@/components/Pecas';

export const revalidate = 60;
export const metadata: Metadata = { title: 'Startups' };

export default async function Startups() {
  const a = await carregarAcervo();
  const cores = Object.values(AREAS).map((x) => x.cor);
  return (
    <>
      <TituloPagina titulo="Startups">
        O laboratório começou com pesquisa e, aos poucos, passou a formar também empreendedores. Estes são os negócios
        de base tecnológica que nasceram dentro do LABIC.
      </TituloPagina>
      <div className="contorno grid gap-8 md:grid-cols-2">
        {a.iniciativas.map((s, i) => {
          const gente = s.pessoaIds.map((id) => a.pessoas.find((p) => p.id === id)).filter(Boolean);
          return (
            <article key={s.id} id={s.slug} className="border-[2.5px] border-tinta rounded-[22px] p-6 md:p-8 scroll-mt-24">
              <div className="flex items-center gap-3">
                {s.logo_url ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={s.logo_url} alt="" className="w-14 h-14 object-contain" />
                ) : (
                  <span className="w-12 h-12 rounded-full border-[3px] border-tinta flex-none" style={{ background: cores[i % cores.length] }} aria-hidden />
                )}
                <h2 className="text-4xl md:text-5xl">{s.nome}</h2>
              </div>
              <p className="mt-4 text-xl font-semibold leading-snug">{s.tagline}</p>
              {s.descricao && <p className="mt-2">{s.descricao}</p>}
              <p className="mt-4 flex flex-wrap gap-2">
                <span className="etiqueta">{ESTAGIO_ROTULO[s.estagio]}</span>
                {s.ano && <span className="etiqueta">Desde {s.ano}</span>}
                {s.site_url && <a className="etiqueta underline" href={s.site_url} target="_blank" rel="noreferrer">Visitar o site</a>}
              </p>
              {gente.length > 0 && (
                <p className="mt-4 text-sm text-grafite">
                  Com{' '}
                  {gente.map((p, j) => (
                    <span key={p!.id}>
                      {j > 0 && (j === gente.length - 1 ? ' e ' : ', ')}
                      <Link className="underline" href={`/pessoas#${p!.slug}`}>{p!.nome}</Link>
                    </span>
                  ))}
                </p>
              )}
            </article>
          );
        })}
      </div>
    </>
  );
}
