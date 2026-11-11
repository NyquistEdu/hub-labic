import Link from 'next/link';
import { MenuPrincipal } from './MenuPrincipal';

export function Cabecalho() {
  return (
    <header className="sticky top-0 z-30 bg-papel/95 backdrop-blur border-b-[2.5px] border-tinta">
      <div className="contorno flex items-center justify-between gap-4 py-2.5">
        <Link href="/" className="flex items-center gap-3 min-w-0" aria-label="LABIC, página inicial">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/img/logo-labic-miolo.png" alt="" width={56} height={56} className="w-12 h-12 sm:w-14 sm:h-14 flex-none" />
          <span className="leading-tight text-sm min-w-0 lg:hidden xl:block">
            <strong className="block display text-2xl sm:hidden">LABIC</strong>
            <strong className="hidden sm:block">Laboratório de Inovação e Criatividade</strong>
            <span className="hidden sm:block text-grafite">IFS Campus Lagarto</span>
          </span>
        </Link>
        <MenuPrincipal />
      </div>
    </header>
  );
}
