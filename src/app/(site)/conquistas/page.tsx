import type { Metadata } from 'next';
import { carregarAcervo } from '@/lib/acervo';
import { ListaConquistas } from '@/components/ListaConquistas';
import { TituloPagina } from '@/components/Pecas';

export const revalidate = 60;
export const metadata: Metadata = { title: 'Conquistas' };

export default async function Conquistas() {
  const a = await carregarAcervo();
  const nomes = Object.fromEntries(a.pessoas.map((p) => [p.id, p.nome]));
  return (
    <>
      <TituloPagina titulo="Conquistas">
        Artigos, editais aprovados, prêmios, registros e as trajetórias de quem saiu daqui para ir mais longe.
      </TituloPagina>
      <ListaConquistas conquistas={a.conquistas} nomes={nomes} />
    </>
  );
}
