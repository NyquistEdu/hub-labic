import Link from 'next/link';
import { AREAS } from '@/lib/tipos';

export function Rodape() {
  return (
    <footer className="mt-24 border-t-[2.5px] border-tinta">
      <div className="flex h-2" aria-hidden>
        {Object.values(AREAS).map((a) => (
          <span key={a.nome} className="flex-1" style={{ background: a.cor }} />
        ))}
      </div>
      <div className="contorno py-10 grid gap-8 md:grid-cols-[1.4fr_1fr_1fr]">
        <div>
          <p className="display text-4xl">LABIC</p>
          <p className="mt-2 max-w-sm text-grafite">
            Laboratório de Inovação e Criatividade do Instituto Federal de Sergipe, Campus Lagarto. Desde agosto de 2017.
          </p>
        </div>
        <div>
          <p className="font-semibold mb-2">Navegue</p>
          <ul className="space-y-1">
            <li><Link className="underline underline-offset-4" href="/projetos">Projetos</Link></li>
            <li><Link className="underline underline-offset-4" href="/pessoas">Pessoas</Link></li>
            <li><Link className="underline underline-offset-4" href="/startups">Startups</Link></li>
            <li><Link className="underline underline-offset-4" href="/publicacoes">Publicações</Link></li>
            <li><Link className="underline underline-offset-4" href="/conquistas">Conquistas</Link></li>
            <li><Link className="underline underline-offset-4" href="/depoimentos">Depoimentos</Link></li>
          </ul>
        </div>
        <div>
          <p className="font-semibold mb-2">Faz parte desta história?</p>
          <ul className="space-y-1">
            <li><Link className="underline underline-offset-4" href="/egressos">Cadastro de egressos</Link></li>
            <li><Link className="underline underline-offset-4" href="/depoimentos#deixe-seu-depoimento">Deixar um depoimento</Link></li>
            <li><Link className="underline underline-offset-4" href="/gestao">Área de gestão</Link></li>
          </ul>
          <address className="not-italic text-grafite text-sm mt-4">
            Estrada da Barragem, 286, Jardim Campo Novo, Lagarto, Sergipe
          </address>
        </div>
      </div>
    </footer>
  );
}
