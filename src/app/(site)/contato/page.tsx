import type { Metadata } from 'next';
import Link from 'next/link';
import { TituloPagina } from '@/components/Pecas';
import { FormularioContato } from '@/components/FormularioContato';

export const metadata: Metadata = {
  title: 'Fale conosco',
  description: 'Proponha uma parceria, marque uma visita ou pergunte como participar do LABIC.',
};

export default function Contato() {
  return (
    <>
      <TituloPagina titulo="Fale conosco">
        Quer propor uma parceria de pesquisa, levar um problema da sua empresa, visitar o laboratório ou saber como
        entrar no LABIC? Mande uma mensagem.
      </TituloPagina>
      <div className="contorno grid gap-12 md:grid-cols-[1.4fr_1fr]">
        <FormularioContato />
        <aside className="space-y-8">
          <div>
            <h2 className="text-3xl">No Instagram</h2>
            <ul className="mt-3 space-y-2 text-lg">
              <li>
                <a className="underline underline-offset-4 font-semibold" href="https://www.instagram.com/labic.ifs/" target="_blank" rel="noreferrer">@labic.ifs</a>
                <span className="text-grafite">, o laboratório</span>
              </li>
              <li>
                <a className="underline underline-offset-4 font-semibold" href="https://www.instagram.com/stephaniekamarry/" target="_blank" rel="noreferrer">@stephaniekamarry</a>
                <span className="text-grafite">, a coordenadora</span>
              </li>
            </ul>
          </div>
          <div>
            <h2 className="text-3xl">Onde estamos</h2>
            <address className="not-italic mt-3 text-lg">
              IFS Campus Lagarto
              <br />
              Estrada da Barragem, 286, Jardim Campo Novo
              <br />
              Lagarto, Sergipe
            </address>
          </div>
          <div>
            <h2 className="text-3xl">Já passou pelo LABIC?</h2>
            <p className="mt-3 text-lg">
              Atualize sua trajetória no <Link href="/egressos" className="underline">cadastro de egressos</Link> ou{' '}
              <Link href="/depoimentos#deixe-seu-depoimento" className="underline">deixe um depoimento</Link>.
            </p>
          </div>
        </aside>
      </div>
    </>
  );
}
