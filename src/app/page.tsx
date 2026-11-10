"use client";

import React, { useMemo, useState } from "react";
import Link from "next/link";
import { useLabic } from "@/context/LabicContext";
import { WorldMapLabic } from "@/components/WorldMapLabic";
import { PRODUCTION_CATEGORY_LABELS, STARTUP_STAGE_LABELS } from "@/types/labic";

export default function PublicShowcasePage() {
  const { members, productions, projects, startups, isAuthenticated } = useLabic();
  const [selectedYear, setSelectedYear] = useState<string>("TODOS");

  const activeMembers = useMemo(
    () => members.filter((m) => m.status === "ATIVO" && m.showOnPublicShowcase),
    [members]
  );
  const publicProductions = useMemo(() => productions.filter((p) => !p.isSensitive), [productions]);
  const publicProjects = useMemo(
    () => projects.filter((p) => p.showOnPublicShowcase && !p.isSensitiveIp),
    [projects]
  );
  const publicStartups = useMemo(
    () => startups.filter((s) => s.showOnPublicShowcase),
    [startups]
  );

  // Calcula automaticamente os anos presentes em projetos ou produções
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
        totalProductions: yearProds.length,
        articles: yearProds.filter((p) => p.category === "ARTIGO").length,
        softwareInpi: yearProds.filter((p) => p.category === "INPI_SOFTWARE").length,
        awards: yearProds.filter((p) => p.category === "PREMIACAO").length,
        grants: yearProds.filter((p) => p.category === "EDITAL_APROVADO").length,
        tccs: yearProds.filter((p) => p.category === "TCC").length,
        projectsCount: yearProjs.length,
      };
    });
  }, [productions, projects]);

  const filteredPublicProductions = useMemo(() => {
    if (selectedYear === "TODOS") return publicProductions;
    return publicProductions.filter((p) => String(p.year) === selectedYear);
  }, [publicProductions, selectedYear]);

  const distinctCountries = useMemo(() => {
    return new Set(activeMembers.map((m) => m.currentCountry).filter(Boolean)).size;
  }, [activeMembers]);

  return (
    <div className="min-h-screen bg-[#0c0d10] text-zinc-100">
      <header className="border-b border-zinc-800/80 bg-[#0c0d10]/90 sticky top-0 z-20 backdrop-blur">
        <div className="max-w-6xl mx-auto px-6 h-14 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-6 h-6 rounded bg-emerald-600 flex items-center justify-center font-semibold text-white text-xs">
              L
            </div>
            <div>
              <span className="font-semibold text-sm tracking-tight text-zinc-100">LABIC</span>
              <span className="hidden sm:inline text-xs text-zinc-500 ml-2">
                Laboratório de Pesquisa · IFS Campus Lagarto
              </span>
            </div>
          </div>

          <nav className="flex items-center gap-5 text-xs text-zinc-400">
            <a href="#indicadores" className="hover:text-zinc-200 transition-colors">
              Indicadores
            </a>
            <a href="#mapa" className="hover:text-zinc-200 transition-colors">
              Presença Global
            </a>
            <a href="#projetos" className="hover:text-zinc-200 transition-colors">
              Projetos & Startups
            </a>
            <a href="#producoes" className="hover:text-zinc-200 transition-colors">
              Produções
            </a>
            <a href="#equipe" className="hover:text-zinc-200 transition-colors">
              Pesquisadores
            </a>
            <Link
              href={isAuthenticated ? "/app" : "/login"}
              className="px-3 py-1.5 rounded bg-zinc-900 hover:bg-zinc-800 text-zinc-200 border border-zinc-800 transition-colors"
            >
              {isAuthenticated ? "Painel Interno" : "Acesso Interno"}
            </Link>
          </nav>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-6 py-12 space-y-14">
        <section className="space-y-4 max-w-3xl">
          <p className="text-xs uppercase tracking-wider text-emerald-400 font-medium">
            Instituto Federal de Sergipe — Campus Lagarto
          </p>
          <h1 className="text-2xl sm:text-3xl font-semibold tracking-tight text-zinc-100">
            Pesquisa aplicada, desenvolvimento tecnológico e trajetória acadêmica contínua.
          </h1>
          <p className="text-sm text-zinc-400 leading-relaxed">
            O LABIC integra pesquisadores do Ensino Técnico Integrado, Graduação e Pós-Graduação em
            projetos de Sistemas de Informação, Engenharia Elétrica, Automação e Inteligência Artificial,
            mantendo cooperação ativa com universidades e centros de pesquisa no Brasil e no exterior.
          </p>
        </section>

        <section id="indicadores" className="space-y-6">
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
            <div className="bg-[#111318] border border-zinc-800/80 rounded-lg p-4">
              <div className="text-2xl font-semibold text-zinc-100">
                {members.filter((m) => m.status === "ATIVO").length}
              </div>
              <div className="text-xs text-zinc-400 mt-1">Pesquisadores Ativos</div>
            </div>
            <div className="bg-[#111318] border border-zinc-800/80 rounded-lg p-4">
              <div className="text-2xl font-semibold text-zinc-100">{projects.length}</div>
              <div className="text-xs text-zinc-400 mt-1">Projetos Registrados</div>
            </div>
            <div className="bg-[#111318] border border-zinc-800/80 rounded-lg p-4">
              <div className="text-2xl font-semibold text-zinc-100">{productions.length}</div>
              <div className="text-xs text-zinc-400 mt-1">Produções Científicas</div>
            </div>
            <div className="bg-[#111318] border border-zinc-800/80 rounded-lg p-4">
              <div className="text-2xl font-semibold text-zinc-100">{startups.length}</div>
              <div className="text-xs text-zinc-400 mt-1">Startups Vinculadas</div>
            </div>
            <div className="bg-[#111318] border border-zinc-800/80 rounded-lg p-4">
              <div className="text-2xl font-semibold text-zinc-100">{distinctCountries || 1}</div>
              <div className="text-xs text-zinc-400 mt-1">Países com Atuação</div>
            </div>
          </div>

          <div className="bg-[#111318] border border-zinc-800/80 rounded-lg p-5">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-sm font-semibold text-zinc-100">Histórico Anual de Produção</h2>
                <p className="text-xs text-zinc-500">
                  Consolidado quantitativo calculado a partir dos projetos e produções registrados por ano.
                </p>
              </div>
            </div>

            {timelineByYear.length === 0 ? (
              <p className="text-xs text-zinc-500 py-4">
                Nenhuma produção ou projeto registrado até o momento.
              </p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="border-b border-zinc-800 text-zinc-400">
                      <th className="py-2 pr-4 font-medium">Ano</th>
                      <th className="py-2 px-3 font-medium">Projetos</th>
                      <th className="py-2 px-3 font-medium">Artigos</th>
                      <th className="py-2 px-3 font-medium">Registros INPI</th>
                      <th className="py-2 px-3 font-medium">TCCs / Dissertações</th>
                      <th className="py-2 px-3 font-medium">Premiações</th>
                      <th className="py-2 px-3 font-medium">Editais</th>
                      <th className="py-2 pl-3 font-medium text-right">Total de Produções</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-800/60">
                    {timelineByYear.map((row) => (
                      <tr key={row.year} className="text-zinc-300">
                        <td className="py-2.5 pr-4 font-semibold text-zinc-100">{row.year}</td>
                        <td className="py-2.5 px-3">{row.projectsCount}</td>
                        <td className="py-2.5 px-3">{row.articles}</td>
                        <td className="py-2.5 px-3">{row.softwareInpi}</td>
                        <td className="py-2.5 px-3">{row.tccs}</td>
                        <td className="py-2.5 px-3">{row.awards}</td>
                        <td className="py-2.5 px-3">{row.grants}</td>
                        <td className="py-2.5 pl-3 text-right font-medium text-emerald-400">
                          {row.totalProductions}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </section>

        <section id="mapa" className="space-y-3">
          <WorldMapLabic members={members} />
        </section>

        <section id="projetos" className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 bg-[#111318] border border-zinc-800/80 rounded-lg p-5 space-y-4">
            <div>
              <h2 className="text-sm font-semibold text-zinc-100">Projetos de Pesquisa e Desenvolvimento</h2>
              <p className="text-xs text-zinc-500">Projetos ativos e concluídos no laboratório.</p>
            </div>

            {publicProjects.length === 0 ? (
              <p className="text-xs text-zinc-500 py-4">Nenhum projeto público cadastrado.</p>
            ) : (
              <div className="divide-y divide-zinc-800/60">
                {publicProjects.map((proj) => (
                  <div key={proj.id} className="py-3.5 first:pt-0 last:pb-0">
                    <div className="flex items-center justify-between gap-2">
                      <h3 className="text-sm font-medium text-zinc-100">{proj.title}</h3>
                      <div className="flex items-center gap-2 shrink-0">
                        <span className="text-[11px] text-zinc-400">{proj.year}</span>
                        <span className="text-[11px] px-2 py-0.5 rounded bg-zinc-900 border border-zinc-800 text-zinc-300">
                          {proj.fundingAgency}
                        </span>
                      </div>
                    </div>
                    {proj.publicSummary && (
                      <p className="text-xs text-zinc-400 mt-1">{proj.publicSummary}</p>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="bg-[#111318] border border-zinc-800/80 rounded-lg p-5 space-y-4">
            <div>
              <h2 className="text-sm font-semibold text-zinc-100">Startups e Spin-offs</h2>
              <p className="text-xs text-zinc-500">Iniciativas empreendedoras originadas no LABIC.</p>
            </div>

            {publicStartups.length === 0 ? (
              <p className="text-xs text-zinc-500 py-4">Nenhuma startup cadastrada.</p>
            ) : (
              <div className="divide-y divide-zinc-800/60">
                {publicStartups.map((st) => (
                  <div key={st.id} className="py-3.5 first:pt-0 last:pb-0 space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-zinc-100">{st.name}</span>
                      <span className="text-[11px] text-zinc-400">
                        {STARTUP_STAGE_LABELS[st.stage] || st.stage}
                      </span>
                    </div>
                    <p className="text-xs text-zinc-400">{st.tagline}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </section>

        <section id="producoes" className="bg-[#111318] border border-zinc-800/80 rounded-lg p-5 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h2 className="text-sm font-semibold text-zinc-100">Acervo Público de Produções</h2>
              <p className="text-xs text-zinc-500">
                Artigos, TCCs, dissertações, registros de software, premiações e editais aprovados.
              </p>
            </div>
            <select
              value={selectedYear}
              onChange={(e) => setSelectedYear(e.target.value)}
              className="bg-zinc-900 border border-zinc-800 rounded px-2.5 py-1.5 text-xs text-zinc-200"
            >
              <option value="TODOS">Todos os anos</option>
              {timelineByYear.map((t) => (
                <option key={t.year} value={String(t.year)}>
                  {t.year}
                </option>
              ))}
            </select>
          </div>

          {filteredPublicProductions.length === 0 ? (
            <p className="text-xs text-zinc-500 py-4">Nenhuma produção pública registrada para este filtro.</p>
          ) : (
            <div className="divide-y divide-zinc-800/60">
              {filteredPublicProductions.map((prod) => {
                const labicAuthorNames = prod.authorIds
                  .map((id) => members.find((m) => m.id === id)?.name)
                  .filter(Boolean);
                const extNames = prod.externalAuthors
                  ? prod.externalAuthors
                      .split(",")
                      .map((s) => s.trim())
                      .filter(Boolean)
                  : [];
                const authorNames = [...labicAuthorNames, ...extNames].join(", ");
                return (
                  <div key={prod.id} className="py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-[11px] font-medium text-emerald-400">
                          {PRODUCTION_CATEGORY_LABELS[prod.category]}
                        </span>
                        <span className="text-xs text-zinc-600">·</span>
                        <span className="text-xs text-zinc-400">{prod.year}</span>
                        {prod.venueOrAgency && (
                          <>
                            <span className="text-xs text-zinc-600">·</span>
                            <span className="text-xs text-zinc-400">{prod.venueOrAgency}</span>
                          </>
                        )}
                      </div>
                      <h3 className="text-sm font-medium text-zinc-100 mt-0.5">{prod.title}</h3>
                      {authorNames && <p className="text-xs text-zinc-500 mt-0.5">{authorNames}</p>}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </section>

        <section id="equipe" className="bg-[#111318] border border-zinc-800/80 rounded-lg p-5 space-y-4">
          <div>
            <h2 className="text-sm font-semibold text-zinc-100">Corpo de Pesquisadores</h2>
            <p className="text-xs text-zinc-500">
              Membros ativos do laboratório no IFS e em programas parceiros.
            </p>
          </div>

          {activeMembers.length === 0 ? (
            <p className="text-xs text-zinc-500 py-4">Nenhum pesquisador cadastrado.</p>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
              {activeMembers.map((m) => (
                <div
                  key={m.id}
                  className="p-3.5 rounded bg-zinc-900/60 border border-zinc-800/80 flex flex-col justify-between gap-2"
                >
                  <div className="flex items-center gap-3">
                    {m.avatarUrl ? (
                      <img
                        src={m.avatarUrl}
                        alt={m.name}
                        className="w-10 h-10 rounded-full object-cover border border-zinc-700 shrink-0"
                      />
                    ) : (
                      <div className="w-10 h-10 rounded-full bg-zinc-800 border border-zinc-700 flex items-center justify-center text-xs font-semibold text-emerald-400 shrink-0">
                        {m.name.charAt(0).toUpperCase()}
                      </div>
                    )}
                    <div>
                      <div className="font-medium text-sm text-zinc-100">{m.name}</div>
                      <div className="text-xs text-zinc-400 mt-0.5">
                        {m.course || m.degreeLevel} — {m.institution}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center justify-between text-[11px] text-zinc-500 pt-2 border-t border-zinc-800/60">
                    <span>
                      {m.currentCity}, {m.currentCountry}
                    </span>
                    {m.lattesUrl && (
                      <a
                        href={m.lattesUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="text-zinc-400 hover:text-zinc-200"
                      >
                        Lattes ↗
                      </a>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      </main>

      <footer className="border-t border-zinc-800/80 py-6 text-center text-xs text-zinc-500">
        LABIC — Laboratório de Pesquisa · Instituto Federal de Sergipe (Campus Lagarto)
      </footer>
    </div>
  );
}
