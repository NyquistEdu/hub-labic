"use client";

import React, { useMemo } from "react";
import { useLabic } from "@/context/LabicContext";
import { WorldMapLabic } from "@/components/WorldMapLabic";

export default function IndicadoresPage() {
  const { members, productions, projects, startups } = useLabic();

  const activeMembers = useMemo(
    () => members.filter((m) => m.status === "ATIVO"),
    [members]
  );

  // Linha do tempo quantitativa calculada diretamente das produções e projetos por ano
  const timelineByYear = useMemo(() => {
    const yearSet = new Set<number>();
    productions.forEach((p) => yearSet.add(p.year));
    projects.forEach((p) => yearSet.add(p.year));
    const years = Array.from(yearSet).sort((a, b) => a - b);

    return years.map((year) => {
      const yearProds = productions.filter((p) => p.year === year);
      const yearProjs = projects.filter((p) => p.year === year);
      return {
        year,
        projectsCount: yearProjs.length,
        articles: yearProds.filter((p) => p.category === "ARTIGO").length,
        tccs: yearProds.filter((p) => p.category === "TCC").length,
        softwareInpi: yearProds.filter((p) => p.category === "INPI_SOFTWARE").length,
        awards: yearProds.filter((p) => p.category === "PREMIACAO").length,
        grants: yearProds.filter((p) => p.category === "EDITAL_APROVADO").length,
        prototypes: yearProds.filter((p) => p.category === "PROTOTIPO_BANCADA").length,
        startupMilestones: yearProds.filter((p) => p.category === "STARTUP_CONQUISTA").length,
        totalProductions: yearProds.length,
      };
    });
  }, [productions, projects]);

  return (
    <div className="space-y-6">
      <div className="border-b border-zinc-800/80 pb-4">
        <h1 className="text-lg font-semibold text-zinc-100">Indicadores & Presença Global</h1>
        <p className="text-xs text-zinc-400 mt-0.5">
          Consolidado quantitativo calculado automaticamente a partir dos projetos e produções registrados por ano, além do mapa de atuação dos pesquisadores.
        </p>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="bg-[#111318] border border-zinc-800/80 rounded-lg p-4">
          <div className="text-xs text-zinc-400">Pesquisadores Ativos</div>
          <div className="text-2xl font-semibold text-zinc-100 mt-1">{activeMembers.length}</div>
        </div>
        <div className="bg-[#111318] border border-zinc-800/80 rounded-lg p-4">
          <div className="text-xs text-zinc-400">Projetos Cadastrados</div>
          <div className="text-2xl font-semibold text-zinc-100 mt-1">{projects.length}</div>
        </div>
        <div className="bg-[#111318] border border-zinc-800/80 rounded-lg p-4">
          <div className="text-xs text-zinc-400">Produções Registradas</div>
          <div className="text-2xl font-semibold text-zinc-100 mt-1">{productions.length}</div>
        </div>
        <div className="bg-[#111318] border border-zinc-800/80 rounded-lg p-4">
          <div className="text-xs text-zinc-400">Startups Vinculadas</div>
          <div className="text-2xl font-semibold text-zinc-100 mt-1">{startups.length}</div>
        </div>
      </div>

      <div className="bg-[#111318] border border-zinc-800/80 rounded-lg p-5 space-y-4">
        <div>
          <h2 className="text-sm font-semibold text-zinc-100">Evolução Quantitativa por Ano</h2>
          <p className="text-xs text-zinc-500">
            Cada projeto ou produção cadastrado no sistema alimenta automaticamente as colunas do seu respectivo ano.
          </p>
        </div>

        {timelineByYear.length === 0 ? (
          <p className="text-xs text-zinc-500 py-4">
            Nenhum projeto ou produção cadastrado ainda. Ao registrar projetos na tela Projetos ou produções na tela Produções, os números por ano aparecerão aqui automaticamente.
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-zinc-800 text-zinc-400">
                  <th className="py-2 pr-4 font-medium">Ano</th>
                  <th className="py-2 px-3 font-medium">Projetos</th>
                  <th className="py-2 px-3 font-medium">Artigos</th>
                  <th className="py-2 px-3 font-medium">TCC / Dissert.</th>
                  <th className="py-2 px-3 font-medium">Reg. INPI</th>
                  <th className="py-2 px-3 font-medium">Premiações</th>
                  <th className="py-2 px-3 font-medium">Editais</th>
                  <th className="py-2 px-3 font-medium">Protótipos</th>
                  <th className="py-2 pl-3 font-medium text-right">Total Produções</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-800/60">
                {timelineByYear.map((row) => (
                  <tr key={row.year} className="text-zinc-300">
                    <td className="py-2.5 pr-4 font-semibold text-zinc-100">{row.year}</td>
                    <td className="py-2.5 px-3">{row.projectsCount}</td>
                    <td className="py-2.5 px-3">{row.articles}</td>
                    <td className="py-2.5 px-3">{row.tccs}</td>
                    <td className="py-2.5 px-3">{row.softwareInpi}</td>
                    <td className="py-2.5 px-3">{row.awards}</td>
                    <td className="py-2.5 px-3">{row.grants}</td>
                    <td className="py-2.5 px-3">{row.prototypes}</td>
                    <td className="py-2.5 pl-3 text-right font-semibold text-emerald-400">
                      {row.totalProductions}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <WorldMapLabic members={members} />
    </div>
  );
}
