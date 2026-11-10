import type { Metadata } from 'next';
import { carregarAcervo } from '@/lib/acervo';
import { ListaProjetos } from '@/components/ListaProjetos';
import { TituloPagina } from '@/components/Pecas';

export const revalidate = 60;
export const metadata: Metadata = { title: 'Projetos' };

export default async function Projetos({ searchParams }: { searchParams: Promise<{ area?: string }> }) {
  const [{ area }, a] = await Promise.all([searchParams, carregarAcervo()]);
  const ordenados = [...a.projetos].sort(
    (x, y) => Number(y.destaque) - Number(x.destaque) || Number(Boolean(y.capa_url)) - Number(Boolean(x.capa_url)) || x.titulo.localeCompare(y.titulo)
  );
  return (
    <>
      <TituloPagina titulo="Projetos">
        Robôs, sensores, drones, bancadas e software feitos por estudantes do LABIC, dos que estão na bancada hoje aos
        que já viraram artigo, TCC ou startup.
      </TituloPagina>
      <ListaProjetos projetos={ordenados} areaInicial={area} />
    </>
  );
}
