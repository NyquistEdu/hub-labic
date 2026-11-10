'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { Bell, LogOut } from 'lucide-react';
import { useLabic } from '@/context/LabicContext';
import { CoordinationType } from '@/types/labic';
import { PageTutorialButton } from '@/components/PageTutorialButton';
import { PAGE_TUTORIALS } from '@/data/tutorials';

const COORDINATION_NAV_ITEMS: {
  coord: CoordinationType;
  label: string;
  href: string;
}[] = [
  { coord: 'INSUMOS', label: 'Insumos', href: '/app/coordenacoes/insumos' },
  { coord: 'IMPRESSAO_3D', label: 'Impressão 3D', href: '/app/coordenacoes/impressao-3d' },
  { coord: 'MANUTENCAO', label: 'Manutenção', href: '/app/coordenacoes/manutencao' },
  { coord: 'COMPUTADORES', label: 'Computadores', href: '/app/coordenacoes/computadores' },
  { coord: 'LIMPEZA', label: 'Limpeza', href: '/app/coordenacoes/limpeza' },
  { coord: 'MIDIA', label: 'Mídia', href: '/app/coordenacoes/midia' },
  { coord: 'FINANCAS', label: 'Finanças', href: '/app/financas' },
];

function resolvePageKey(pathname: string): keyof typeof PAGE_TUTORIALS {
  if (pathname === '/app') return 'dashboard';
  if (pathname.includes('/indicadores')) return 'indicadores';
  if (pathname.includes('/producoes')) return 'producoes';
  if (pathname.includes('/perfil')) return 'perfil';
  if (pathname.includes('/projetos')) return 'projetos';
  if (pathname.includes('/congressos')) return 'congressos';
  if (pathname.includes('/startups')) return 'startups';
  if (pathname.includes('/documentos')) return 'documentos';
  if (pathname.includes('/reunioes')) return 'reunioes';
  if (pathname.includes('/servicos')) return 'servicos';
  if (pathname.includes('/coordenacoes/insumos')) return 'coord_insumos';
  if (pathname.includes('/coordenacoes/impressao-3d')) return 'coord_3d';
  if (pathname.includes('/coordenacoes/manutencao')) return 'coord_manutencao';
  if (pathname.includes('/coordenacoes/computadores')) return 'coord_computadores';
  if (pathname.includes('/coordenacoes/limpeza')) return 'coord_limpeza';
  if (pathname.includes('/coordenacoes/midia')) return 'coord_midia';
  if (pathname.includes('/financas')) return 'financas';
  if (pathname.includes('/membros')) return 'membros';
  if (pathname.includes('/ajuda')) return 'ajuda';
  return 'dashboard';
}

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const {
    currentUser,
    isAuthenticated,
    isLoading,
    logout,
    notifications,
    markNotificationRead,
    hasCoordination,
  } = useLabic();

  const [notifOpen, setNotifOpen] = useState(false);

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.replace('/login');
    }
  }, [isLoading, isAuthenticated, router]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#0c0d10] text-zinc-400 flex items-center justify-center text-xs">
        Carregando sistema...
      </div>
    );
  }

  if (!currentUser) {
    return null;
  }

  const myNotifications = notifications.filter(
    (n) => n.recipientProfileId === currentUser.id || n.recipientProfileId === 'ALL'
  );
  const unreadCount = myNotifications.filter((n) => !n.read).length;

  const visibleCoordinations = COORDINATION_NAV_ITEMS.filter((item) =>
    hasCoordination(item.coord)
  );

  const mainLinks = [
    { label: 'Visão Geral', href: '/app' },
    { label: 'Indicadores', href: '/app/indicadores' },
    { label: 'Produções', href: '/app/producoes' },
    { label: 'Projetos', href: '/app/projetos' },
    { label: 'Congressos', href: '/app/congressos' },
    { label: 'Startups', href: '/app/startups' },
    { label: 'Documentos', href: '/app/documentos' },
    { label: 'Reuniões', href: '/app/reunioes' },
    { label: 'Solicitações e Escalas', href: '/app/servicos' },
    { label: 'Meu Perfil', href: '/app/perfil' },
    { label: 'Membros', href: '/app/membros' },
    { label: 'Ajuda', href: '/app/ajuda' },
  ];

  const currentPageKey = resolvePageKey(pathname);

  return (
    <div className="min-h-screen bg-[#0c0d10] text-zinc-100 flex flex-col">
      {/* Header enxuto: Logo à esquerda | Alertas, '?' Ajuda e Usuário à direita */}
      <header className="sticky top-0 z-40 flex items-center justify-between border-b border-zinc-800 bg-[#111318] px-5 py-2.5">
        <div className="flex items-center gap-2.5">
          <Link href="/app" className="text-sm font-semibold tracking-tight text-white">
            LABIC
          </Link>
          <span className="text-zinc-700">/</span>
          <span className="text-xs text-zinc-400">Gestão Interna</span>
        </div>

        <div className="flex items-center gap-2">
          {/* Notificações */}
          <div className="relative">
            <button
              type="button"
              onClick={() => setNotifOpen((prev) => !prev)}
              className="relative inline-flex h-8 items-center gap-1.5 rounded-md border border-zinc-800 bg-zinc-900 px-2.5 text-xs text-zinc-300 hover:border-zinc-700 hover:text-white cursor-pointer"
              title="Alertas"
            >
              <Bell className="h-3.5 w-3.5" />
              {unreadCount > 0 && (
                <span className="rounded bg-emerald-600 px-1.5 py-0.2 text-[10px] font-semibold text-white">
                  {unreadCount}
                </span>
              )}
            </button>

            {notifOpen && (
              <div className="absolute right-0 mt-2 w-80 rounded-lg border border-zinc-800 bg-zinc-950 p-3 shadow-xl z-50">
                <div className="flex items-center justify-between border-b border-zinc-800 pb-2">
                  <span className="text-xs font-semibold text-white">
                    Notificações ({myNotifications.length})
                  </span>
                  <button
                    type="button"
                    onClick={() => setNotifOpen(false)}
                    className="text-[11px] text-zinc-400 hover:text-white cursor-pointer"
                  >
                    Fechar
                  </button>
                </div>
                <div className="mt-2 space-y-2 max-h-72 overflow-y-auto">
                  {myNotifications.length === 0 ? (
                    <p className="py-4 text-center text-xs text-zinc-500">
                      Nenhum alerta no momento.
                    </p>
                  ) : (
                    myNotifications.map((n) => (
                      <div
                        key={n.id}
                        onClick={() => markNotificationRead(n.id)}
                        className="rounded border border-zinc-800 bg-zinc-900/50 p-2.5 text-xs cursor-pointer"
                      >
                        <div className="flex items-center justify-between">
                          <span className="font-medium text-white">{n.title}</span>
                          <span className="text-[10px] text-zinc-500">{n.dateLabel}</span>
                        </div>
                        <p className="mt-1 text-zinc-400">{n.message}</p>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Botão '?' de Ajuda da Tela Atual */}
          <PageTutorialButton pageKey={currentPageKey} headerIconOnly={true} />

          <div className="h-4 w-px bg-zinc-800 mx-1" />

          <Link href="/app/perfil" className="flex items-center gap-2 hover:opacity-90">
            {currentUser.avatarUrl ? (
              <img
                src={currentUser.avatarUrl}
                alt={currentUser.name}
                className="w-6 h-6 rounded-full object-cover border border-zinc-700"
              />
            ) : (
              <div className="w-6 h-6 rounded-full bg-zinc-800 border border-zinc-700 flex items-center justify-center text-[11px] font-semibold text-emerald-400">
                {currentUser.name.charAt(0).toUpperCase()}
              </div>
            )}
            <span className="text-xs text-zinc-300 hidden sm:inline">
              {currentUser.name}
            </span>
          </Link>

          <button
            type="button"
            onClick={() => {
              logout();
              router.replace('/login');
            }}
            className="inline-flex h-8 items-center gap-1 rounded-md border border-zinc-800 bg-zinc-900 px-2.5 text-xs text-zinc-400 hover:border-zinc-700 hover:text-white cursor-pointer"
            title="Sair da conta"
          >
            <LogOut className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">Sair</span>
          </button>
        </div>
      </header>

      <div className="flex flex-1">
        {/* Sidebar Limpa estilo Supabase Studio */}
        <aside className="w-56 shrink-0 border-r border-zinc-800 bg-[#111318] p-3 hidden md:flex md:flex-col md:justify-between">
          <div className="space-y-5">
            <div>
              <p className="px-2.5 text-[10px] font-semibold tracking-wider text-zinc-500 uppercase">
                Módulos
              </p>
              <nav className="mt-1.5 space-y-0.5">
                {mainLinks.map((item) => {
                  const active = pathname === item.href;
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      className={`block rounded-md px-2.5 py-1.5 text-xs transition ${
                        active
                          ? 'bg-zinc-800 text-white font-medium'
                          : 'text-zinc-400 hover:bg-zinc-900 hover:text-zinc-200'
                      }`}
                    >
                      {item.label}
                    </Link>
                  );
                })}
              </nav>
            </div>

            {visibleCoordinations.length > 0 && (
              <div>
                <p className="px-2.5 text-[10px] font-semibold tracking-wider text-zinc-500 uppercase">
                  Coordenações
                </p>
                <nav className="mt-1.5 space-y-0.5">
                  {visibleCoordinations.map((cItem) => {
                    const active = pathname === cItem.href;
                    return (
                      <Link
                        key={cItem.coord}
                        href={cItem.href}
                        className={`block rounded-md px-2.5 py-1.5 text-xs transition ${
                          active
                            ? 'bg-zinc-800 text-white font-medium'
                            : 'text-zinc-400 hover:bg-zinc-900 hover:text-zinc-200'
                        }`}
                      >
                        {cItem.label}
                      </Link>
                    );
                  })}
                </nav>
              </div>
            )}
          </div>

          <div className="border-t border-zinc-800 pt-3 px-2 text-[11px] text-zinc-500">
            <p className="truncate text-zinc-300 font-medium">{currentUser.name}</p>
            <p className="truncate">{currentUser.email}</p>
          </div>
        </aside>

        {/* Área Principal */}
        <main className="flex-1 min-w-0 p-5 sm:p-7 max-w-6xl mx-auto w-full">
          {/* Menu mobile simples */}
          <div className="mb-4 flex items-center gap-1.5 overflow-x-auto pb-2 md:hidden border-b border-zinc-800">
            {mainLinks.map((l) => (
              <Link
                key={l.href}
                href={l.href}
                className={`shrink-0 rounded px-2.5 py-1 text-xs ${
                  pathname === l.href
                    ? 'bg-zinc-800 text-white'
                    : 'bg-zinc-900 text-zinc-400'
                }`}
              >
                {l.label}
              </Link>
            ))}
          </div>

          {children}
        </main>
      </div>
    </div>
  );
}
