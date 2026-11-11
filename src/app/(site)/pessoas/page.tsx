import type { Metadata } from 'next';
import Link from 'next/link';
import { carregarAcervo } from '@/lib/acervo';
import { VINCULO_ROTULO, noGrupo, type Vinculo } from '@/lib/tipos';
import { CartaoPessoa, TituloPagina } from '@/components/Pecas';

export const revalidate = 60;
export const metadata: Metadata = { title: 'Pessoas' };

const ORDEM: Vinculo[] = ['COORDENACAO', 'PESQUISADOR', 'ESTUDANTE', 'EGRESSO', 'PARCEIRO'];

export default async function Pessoas() {
  const a = await carregarAcervo();
  const paises = new Set(a.pessoas.map((p) => p.pais).filter(Boolean));
  return (
    <>
      <TituloPagina titulo="Pessoas">
        O LABIC é feito de gente: quem coordena, quem pesquisa, quem está na bancada hoje e quem já seguiu para outros
        lugares. {paises.size > 1 ? `Hoje essa rede está em ${paises.size} países.` : ''}
      </TituloPagina>
      <div className="contorno space-y-16">
        {ORDEM.map((v) => {
          const grupo = a.pessoas.filter((p) => noGrupo(p.vinculo, v));
          if (grupo.length === 0) return null;
          return (
            <section key={v}>
              <h2 className="text-4xl md:text-5xl border-b-[2.5px] border-tinta pb-2">{VINCULO_ROTULO[v]}</h2>
              <div className="mt-8 grid gap-x-10 gap-y-10 md:grid-cols-2">
                {grupo.map((p) => (
                  <CartaoPessoa key={p.id} pessoa={p} ancora={!(v === 'PARCEIRO' && p.vinculo === 'EGRESSO_PARCEIRO')} />
                ))}
              </div>
            </section>
          );
        })}
        <section className="border-[2.5px] border-tinta rounded-[22px] p-6 md:p-10">
          <h2 className="text-4xl md:text-5xl">Seu nome deveria estar aqui?</h2>
          <p className="mt-3 max-w-[58ch] text-lg">
            Estamos reconstruindo a lista de todas as pessoas que passaram pelo laboratório desde 2017. O cadastro leva
            cinco minutos e só é publicado depois de revisado pela coordenação.
          </p>
          <Link href="/egressos" className="botao mt-5">Fazer meu cadastro de egresso</Link>
        </section>
      </div>
    </>
  );
}
