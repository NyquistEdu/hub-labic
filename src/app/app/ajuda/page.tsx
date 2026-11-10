"use client";

import React, { useState } from "react";
import Link from "next/link";
import { HELP_ARTICLES } from "@/data/tutorials";

export default function AjudaPage() {
  const [search, setSearch] = useState("");

  const filtered = HELP_ARTICLES.filter(
    (a) =>
      a.question.toLowerCase().includes(search.toLowerCase()) ||
      a.shortAnswer.toLowerCase().includes(search.toLowerCase()) ||
      a.categoryLabel.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="border-b border-zinc-800/80 pb-4">
        <h1 className="text-lg font-semibold text-zinc-100">Central de Ajuda</h1>
        <p className="text-xs text-zinc-400 mt-0.5">
          Guia de procedimentos e dúvidas frequentes do HUB-LABIC. Você também pode clicar no ícone &ldquo;?&rdquo; no topo direito de qualquer tela para ver o passo a passo específico daquela página.
        </p>
      </div>

      <div>
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Buscar dúvida (ex.: produção, bolsa, mestrado, insumo, limpeza)..."
          className="w-full max-w-md bg-[#111318] border border-zinc-800 rounded px-3.5 py-2 text-xs text-zinc-100"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filtered.map((item) => (
          <div
            key={item.id}
            className="bg-[#111318] border border-zinc-800/80 rounded-lg p-5 space-y-2.5 text-xs flex flex-col justify-between"
          >
            <div className="space-y-2">
              <span className="text-[11px] font-medium text-emerald-400">
                {item.categoryLabel}
              </span>
              <h2 className="text-sm font-semibold text-zinc-100">{item.question}</h2>
              <p className="text-zinc-400 leading-relaxed">{item.shortAnswer}</p>
              <ul className="list-disc list-inside text-zinc-400 space-y-1 pt-1">
                {item.steps.map((s, i) => (
                  <li key={i}>{s}</li>
                ))}
              </ul>
            </div>
            <div className="pt-3 border-t border-zinc-800/60">
              <Link
                href={item.targetRoute}
                className="text-emerald-400 hover:underline font-medium"
              >
                {item.targetRouteLabel} →
              </Link>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
