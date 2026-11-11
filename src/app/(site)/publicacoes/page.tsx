import type { Metadata } from 'next';
import { carregarAcervo } from '@/lib/acervo';
import { ListaPublicacoes, type ItemPublicacao } from '@/components/ListaPublicacoes';
import { TituloPagina } from '@/components/Pecas';

export const revalidate = 60;
export const metadata: Metadata = {
  title: 'Publicações',
  description: 'Artigos, TCCs e trabalhos em eventos do LABIC, para consultar e baixar.',
};

export default async function Publicacoes() {
  const a = await carregarAcervo();
  const nomes = new Map(a.pessoas.map((p) => [p.id, p.nome]));
  const projetos = new Map(a.projetos.map((p) => [p.id, { slug: p.slug, titulo: p.titulo }]));
  const itens: ItemPublicacao[] = a.conquistas
    .filter((c) => c.tipo === 'ARTIGO' || c.tipo === 'TCC' || c.tipo === 'EVENTO')
    .sort((x, y) => y.ano - x.ano || x.titulo.localeCompare(y.titulo))
    .map((c) => ({
      ...c,
      autoresTexto: c.autores || c.pessoaIds.map((id) => nomes.get(id)).filter(Boolean).join(', '),
      projeto: c.projeto_id ? projetos.get(c.projeto_id) : undefined,
    }));
  return (
    <>
      <TituloPagina titulo="Publicações">
        Artigos, TCCs e trabalhos apresentados em eventos por quem faz o LABIC. Busque por título, autor ou evento e
        abra ou baixe o texto quando ele estiver disponível.
      </TituloPagina>
      <ListaPublicacoes itens={itens} />
    </>
  );
}
