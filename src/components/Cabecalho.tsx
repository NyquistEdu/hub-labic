import Link from 'next/link';

const MENU = [
  { href: '/projetos', rotulo: 'Projetos' },
  { href: '/pessoas', rotulo: 'Pessoas' },
  { href: '/startups', rotulo: 'Startups' },
  { href: '/conquistas', rotulo: 'Conquistas' },
  { href: '/#historia', rotulo: 'História' },
];

export function Cabecalho() {
  return (
    <header className="sticky top-0 z-30 bg-papel/95 backdrop-blur border-b-[2.5px] border-tinta">
      <div className="contorno flex items-center justify-between gap-4 py-2.5">
        <Link href="/" className="flex items-center gap-3" aria-label="LABIC, página inicial">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/img/logo-labic-miolo.png" alt="" width={56} height={56} className="w-14 h-14" />
          <span className="hidden sm:block leading-tight text-sm">
            <strong className="block">Laboratório de Inovação e Criatividade</strong>
            <span className="text-grafite">IFS Campus Lagarto</span>
          </span>
        </Link>
        <nav aria-label="Principal" className="flex items-center gap-1 sm:gap-2 overflow-x-auto text-[0.95rem] font-semibold">
          {MENU.map((m) => (
            <Link key={m.href} href={m.href} className="px-2.5 py-1.5 rounded-full hover:bg-tinta hover:text-papel whitespace-nowrap">
              {m.rotulo}
            </Link>
          ))}
        </nav>
      </div>
    </header>
  );
}
