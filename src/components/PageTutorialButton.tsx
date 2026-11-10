'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { HelpCircle, X } from 'lucide-react';
import { PAGE_TUTORIALS } from '@/data/tutorials';

interface PageTutorialButtonProps {
  pageKey: keyof typeof PAGE_TUTORIALS;
  headerIconOnly?: boolean;
}

export function PageTutorialButton({
  pageKey,
  headerIconOnly = false,
}: PageTutorialButtonProps) {
  const [open, setOpen] = useState(false);

  // Só renderiza no cabeçalho superior (ícone '?') para evitar poluição visual nas telas
  if (!headerIconOnly) {
    return null;
  }

  const tutorial = PAGE_TUTORIALS[pageKey] || PAGE_TUTORIALS.dashboard;

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="inline-flex h-8 w-8 items-center justify-center rounded-md border border-zinc-800 bg-zinc-900 text-zinc-300 hover:border-zinc-700 hover:text-white cursor-pointer"
        title="Ajuda desta tela"
        aria-label="Ajuda desta tela"
      >
        <HelpCircle className="h-4 w-4" />
      </button>

      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4">
          <div className="relative w-full max-w-lg rounded-lg border border-zinc-800 bg-zinc-950 p-5 text-zinc-100 shadow-xl">
            <div className="flex items-start justify-between border-b border-zinc-800 pb-3">
              <div>
                <span className="text-[11px] text-zinc-400 uppercase">
                  Ajuda da Tela
                </span>
                <h3 className="text-base font-semibold text-white">{tutorial.title}</h3>
              </div>
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="rounded p-1 text-zinc-400 hover:bg-zinc-900 hover:text-white cursor-pointer"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="mt-4 space-y-4 text-xs">
              <div className="rounded border border-zinc-800 bg-zinc-900/50 p-3">
                <p className="text-zinc-300 leading-relaxed">{tutorial.purpose}</p>
                <p className="mt-2 text-zinc-400">
                  <strong>Acesso:</strong> {tutorial.whoCanAccess}
                </p>
              </div>

              <div className="space-y-2">
                <p className="font-semibold text-zinc-300">Como utilizar:</p>
                {tutorial.steps.map((step, idx) => (
                  <div
                    key={idx}
                    className="rounded border border-zinc-800/80 bg-zinc-900/30 p-3"
                  >
                    <p className="font-medium text-white">{step.stepTitle}</p>
                    <p className="mt-1 text-zinc-400">{step.description}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="mt-5 flex items-center justify-between border-t border-zinc-800 pt-3 text-xs">
              <Link
                href="/app/ajuda"
                onClick={() => setOpen(false)}
                className="text-zinc-400 hover:text-white underline"
              >
                Ver Central de Ajuda completa
              </Link>
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="rounded bg-zinc-800 px-3 py-1.5 font-medium text-white hover:bg-zinc-700 cursor-pointer"
              >
                Fechar
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
