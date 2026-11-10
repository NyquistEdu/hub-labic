import { Cabecalho } from '@/components/Cabecalho';
import { Rodape } from '@/components/Rodape';

export default function LayoutSite({ children }: { children: React.ReactNode }) {
  return (
    <>
      <a href="#conteudo" className="sr-only focus:not-sr-only focus:absolute focus:z-50 focus:bg-papel focus:p-3">
        Pular para o conteúdo
      </a>
      <Cabecalho />
      <main id="conteudo">{children}</main>
      <Rodape />
    </>
  );
}
