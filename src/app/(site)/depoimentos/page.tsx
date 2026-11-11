import type { Metadata } from 'next';
import { carregarAcervo } from '@/lib/acervo';
import { CitacaoDepoimento, TituloPagina } from '@/components/Pecas';
import { FormularioDepoimento } from '@/components/FormularioDepoimento';

export const revalidate = 60;
export const metadata: Metadata = {
  title: 'Depoimentos',
  description: 'O que estudantes e egressos contam sobre o tempo no LABIC.',
};

export default async function Depoimentos() {
  const a = await carregarAcervo();
  const pessoas = new Map(a.pessoas.map((p) => [p.id, p]));
  const lista = [...a.depoimentos].sort(
    (x, y) => Number(y.destaque) - Number(x.destaque) || (y.ano ?? 0) - (x.ano ?? 0),
  );
  const [primeiro, ...resto] = lista;

  return (
    <>
      <TituloPagina titulo="Depoimentos">
        Quem passou pela bancada do LABIC conta, com as próprias palavras, o que aprendeu, construiu e levou do
        laboratório.
      </TituloPagina>
      <div className="contorno space-y-16">
        {primeiro ? (
          <>
            <div className="max-w-4xl">
              <CitacaoDepoimento depoimento={primeiro} pessoa={primeiro.pessoa_id ? pessoas.get(primeiro.pessoa_id) : undefined} grande />
            </div>
            {resto.length > 0 && (
              <div className="grid gap-6 md:grid-cols-2">
                {resto.map((d) => (
                  <CitacaoDepoimento key={d.id} depoimento={d} pessoa={d.pessoa_id ? pessoas.get(d.pessoa_id) : undefined} />
                ))}
              </div>
            )}
          </>
        ) : (
          <p className="text-lg max-w-[58ch]">
            Os primeiros depoimentos estão sendo reunidos. Se você já fez parte do laboratório, o seu pode abrir esta
            página.
          </p>
        )}

        <section id="deixe-seu-depoimento" className="scroll-mt-24 grid gap-8 md:grid-cols-[1fr_1.4fr] border-t-[2.5px] border-tinta pt-10">
          <div>
            <h2 className="text-4xl md:text-5xl">Deixe o seu</h2>
            <p className="mt-3 text-lg max-w-[40ch]">
              Estudou, pesquisou ou fez estágio no LABIC? Conte como foi. O texto só aparece aqui depois da revisão da
              coordenação.
            </p>
          </div>
          <FormularioDepoimento />
        </section>
      </div>
    </>
  );
}
