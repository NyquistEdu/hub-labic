'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';

export const MENU = [
  { href: '/projetos', rotulo: 'Projetos' },
  { href: '/pessoas', rotulo: 'Pessoas' },
  { href: '/startups', rotulo: 'Startups' },
  { href: '/publicacoes', rotulo: 'Publicações' },
  { href: '/conquistas', rotulo: 'Conquistas' },
  { href: '/depoimentos', rotulo: 'Depoimentos' },
  { href: '/#historia', rotulo: 'História' },
  { href: '/contato', rotulo: 'Fale conosco' },
];

function ativo(caminho: string, href: string) {
  if (href.startsWith('/#')) return false;
  return caminho === href || caminho.startsWith(href + '/');
}

export function MenuPrincipal() {
  const caminho = usePathname() ?? '/';
  const [aberto, setAberto] = useState(false);

  useEffect(() => setAberto(false), [caminho]);
  useEffect(() => {
    if (!aberto) return;
    const fechar = (e: KeyboardEvent) => e.key === 'Escape' && setAberto(false);
    window.addEventListener('keydown', fechar);
    return () => window.removeEventListener('keydown', fechar);
  }, [aberto]);

  return (
    <>
      <nav aria-label="Principal" className="hidden lg:flex items-center gap-1 text-[0.95rem] font-semibold">
        {MENU.map((m) => {
          const atual = ativo(caminho, m.href);
          return (
            <Link
              key={m.href}
              href={m.href}
              aria-current={atual ? 'page' : undefined}
              className={`px-2.5 py-1.5 rounded-full whitespace-nowrap hover:bg-tinta hover:text-papel ${atual ? 'bg-tinta text-papel' : ''}`}
            >
              {m.rotulo}
            </Link>
          );
        })}
      </nav>

      <div className="lg:hidden flex-none">
        <button
          type="button"
          className="botao botao-vazado botao-pequeno"
          aria-expanded={aberto}
          aria-controls="menu-celular"
          onClick={() => setAberto((v) => !v)}
        >
          <span aria-hidden className="inline-flex flex-col gap-[3px]">
            <i className={`block w-4 h-[2.5px] bg-current transition ${aberto ? 'translate-y-[5.5px] rotate-45' : ''}`} />
            <i className={`block w-4 h-[2.5px] bg-current transition ${aberto ? 'opacity-0' : ''}`} />
            <i className={`block w-4 h-[2.5px] bg-current transition ${aberto ? '-translate-y-[5.5px] -rotate-45' : ''}`} />
          </span>
          {aberto ? 'Fechar' : 'Menu'}
        </button>
      </div>

      {aberto && (
        <nav
          id="menu-celular"
          aria-label="Principal"
          className="lg:hidden absolute left-0 right-0 top-full bg-papel border-b-[2.5px] border-tinta max-h-[calc(100dvh-4.5rem)] overflow-y-auto"
        >
          <ul className="contorno py-3">
            {MENU.map((m) => {
              const atual = ativo(caminho, m.href);
              return (
                <li key={m.href} className="border-b border-tinta/15 last:border-0">
                  <Link
                    href={m.href}
                    onClick={() => setAberto(false)}
                    aria-current={atual ? 'page' : undefined}
                    className="flex items-center gap-3 py-3.5 display text-3xl"
                  >
                    <span className={`no ${atual ? '' : 'opacity-0'}`} aria-hidden />
                    {m.rotulo}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>
      )}
    </>
  );
}
