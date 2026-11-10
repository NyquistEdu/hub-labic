import type { Metadata } from 'next';
import { TituloPagina } from '@/components/Pecas';
import { FormularioEgresso } from '@/components/FormularioEgresso';

export const metadata: Metadata = { title: 'Cadastro de egressos' };

export default function Egressos() {
  return (
    <>
      <TituloPagina titulo="Você fez parte do LABIC">
        Conte quando passou pelo laboratório, no que trabalhou e onde está hoje. A coordenação revisa cada cadastro
        antes de publicar, e seu e-mail nunca aparece no site.
      </TituloPagina>
      <div className="contorno">
        <FormularioEgresso />
      </div>
    </>
  );
}
