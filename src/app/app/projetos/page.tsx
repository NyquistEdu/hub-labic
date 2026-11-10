"use client";

import React, { useState, useMemo } from "react";
import Link from "next/link";
import { useLabic } from "@/context/LabicContext";
import {
  calculateInstallmentsBetween,
  formatMonthYearBR,
  getScholarshipVigenciaStatus,
  LabicProject,
  parseProjectNotes,
  PROJECT_STATUS_LABELS,
} from "@/types/labic";
import { PaginationControls } from "@/components/PaginationControls";
import { DiscreetSearchBar } from "@/components/DiscreetSearchBar";

export default function ProjetosPage() {
  const {
    projects,
    members,
    currentUser,
    canSeeScholarshipValue,
    canAccessProject,
    addProject,
    updateProject,
    deleteProject,
  } = useLabic();

  // Filtros de Visualização
  const [scopeFilter, setScopeFilter] = useState<"MEUS" | "TODOS">("MEUS");
  const [statusFilter, setStatusFilter] = useState<string>("EM_ANDAMENTO"); // Padrão: Em andamento
  const [sortOrder, setSortOrder] = useState<"RECENTES" | "ANTIGOS" | "TITULO_AZ">("RECENTES");
  const [searchTerm, setSearchTerm] = useState<string>("");

  // Paginação
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [pageSize, setPageSize] = useState<number>(15);

  // Modal de Projeto (Criar / Editar)
  const [showProjectModal, setShowProjectModal] = useState(false);
  const [editingProjectId, setEditingProjectId] = useState<string | null>(null);
  const [title, setTitle] = useState("");
  const [fundingAgency, setFundingAgency] = useState("");
  const [year, setYear] = useState<number>(new Date().getFullYear());
  const [status, setStatus] = useState<LabicProject["status"]>("EM_ANDAMENTO");
  const [summary, setSummary] = useState("");
  const [showOnPublicShowcase, setShowOnPublicShowcase] = useState(true);
  const [coAdvisorId, setCoAdvisorId] = useState<string>("");
  const [projectMembers, setProjectMembers] = useState<
    {
      profileId: string;
      roleInProject: "BOLSISTA" | "VOLUNTARIO";
      monthlyScholarshipBRL?: number;
      scholarshipStartMonth?: string;
      scholarshipEndMonth?: string;
      scholarshipInstallments?: number;
    }[]
  >([]);

  // Filtragem e Ordenação
  const filteredAndSortedProjects = useMemo(() => {
    let result = [...projects];

    // 1. Filtro de Escopo: "Meus Projetos" vs "Todos os Projetos"
    if (scopeFilter === "MEUS" && currentUser) {
      result = result.filter(
        (p) =>
          p.advisorId === currentUser.id ||
          p.coAdvisorId === currentUser.id ||
          p.members.some((m) => m.profileId === currentUser.id)
      );
    }

    // 2. Filtro de Status: Padrão "EM_ANDAMENTO", ou específico, ou "TODOS"
    if (statusFilter !== "TODOS") {
      result = result.filter((p) => p.status === statusFilter);
    }

    // 3. Pesquisa Discreta por texto (título, agência, código, resumo, membros)
    const term = searchTerm.trim().toLowerCase();
    if (term) {
      result = result.filter((p) => {
        const matchesTitle = p.title.toLowerCase().includes(term);
        const matchesAgency = p.fundingAgency.toLowerCase().includes(term);
        const matchesCode = p.code.toLowerCase().includes(term);
        const matchesSummary = (p.summary || "").toLowerCase().includes(term);
        const matchesMembers = p.members.some((pm) => {
          const mObj = members.find((m) => m.id === pm.profileId);
          return mObj?.name.toLowerCase().includes(term);
        });
        return (
          matchesTitle ||
          matchesAgency ||
          matchesCode ||
          matchesSummary ||
          matchesMembers
        );
      });
    }

    // 4. Ordenação
    result.sort((a, b) => {
      if (sortOrder === "RECENTES") {
        return b.year - a.year || b.code.localeCompare(a.code);
      }
      if (sortOrder === "ANTIGOS") {
        return a.year - b.year || a.code.localeCompare(b.code);
      }
      if (sortOrder === "TITULO_AZ") {
        return a.title.localeCompare(b.title);
      }
      return 0;
    });

    return result;
  }, [projects, scopeFilter, statusFilter, searchTerm, sortOrder, currentUser, members]);

  // Paginação aplicada
  const paginatedProjects = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredAndSortedProjects.slice(start, start + pageSize);
  }, [filteredAndSortedProjects, currentPage, pageSize]);

  // Handlers para Criar / Editar Projeto
  const openCreateProject = () => {
    setEditingProjectId(null);
    setTitle("");
    setFundingAgency("");
    setYear(new Date().getFullYear());
    setStatus("EM_ANDAMENTO");
    setSummary("");
    setShowOnPublicShowcase(true);
    setCoAdvisorId("");
    setProjectMembers(
      currentUser ? [{ profileId: currentUser.id, roleInProject: "VOLUNTARIO" }] : []
    );
    setShowProjectModal(true);
  };

  const openEditProject = (proj: LabicProject) => {
    setEditingProjectId(proj.id);
    setTitle(proj.title);
    setFundingAgency(proj.fundingAgency);
    setYear(proj.year);
    setStatus(proj.status);
    setSummary(proj.summary);
    setShowOnPublicShowcase(proj.showOnPublicShowcase);
    setCoAdvisorId(proj.coAdvisorId || "");
    setProjectMembers(
      proj.members.map((m) => ({
        profileId: m.profileId,
        roleInProject: m.roleInProject === "BOLSISTA" ? "BOLSISTA" : "VOLUNTARIO",
        monthlyScholarshipBRL: m.monthlyScholarshipBRL,
        scholarshipStartMonth: m.scholarshipStartMonth || "",
        scholarshipEndMonth: m.scholarshipEndMonth || "",
        scholarshipInstallments: m.scholarshipInstallments ?? 12,
      }))
    );
    setShowProjectModal(true);
  };

  const toggleProjectMember = (id: string) => {
    setProjectMembers((prev) =>
      prev.some((m) => m.profileId === id)
        ? prev.filter((m) => m.profileId !== id)
        : [...prev, { profileId: id, roleInProject: "VOLUNTARIO" }]
    );
  };

  const updateMemberScholar = (
    id: string,
    isScholar: boolean,
    patch?: {
      monthlyScholarshipBRL?: number;
      scholarshipStartMonth?: string;
      scholarshipEndMonth?: string;
      scholarshipInstallments?: number;
    }
  ) => {
    setProjectMembers((prev) =>
      prev.map((m) => {
        if (m.profileId !== id) return m;
        if (!isScholar) {
          return {
            profileId: m.profileId,
            roleInProject: "VOLUNTARIO",
          };
        }
        const defaultStart = `${year}-03`;
        const defaultEnd = `${year + 1}-02`;
        const nextStart =
          patch?.scholarshipStartMonth !== undefined
            ? patch.scholarshipStartMonth
            : m.scholarshipStartMonth || defaultStart;
        const nextEnd =
          patch?.scholarshipEndMonth !== undefined
            ? patch.scholarshipEndMonth
            : m.scholarshipEndMonth || defaultEnd;
        const autoInstallments =
          patch?.scholarshipStartMonth !== undefined ||
          patch?.scholarshipEndMonth !== undefined
            ? calculateInstallmentsBetween(nextStart, nextEnd)
            : undefined;
        const nextInstallments =
          patch?.scholarshipInstallments !== undefined
            ? patch.scholarshipInstallments
            : autoInstallments ?? m.scholarshipInstallments ?? 12;

        return {
          ...m,
          roleInProject: "BOLSISTA",
          monthlyScholarshipBRL:
            patch?.monthlyScholarshipBRL !== undefined
              ? patch.monthlyScholarshipBRL
              : m.monthlyScholarshipBRL,
          scholarshipStartMonth: nextStart,
          scholarshipEndMonth: nextEnd,
          scholarshipInstallments: nextInstallments,
        };
      })
    );
  };

  const handleSaveProject = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !currentUser) return;

    if (editingProjectId) {
      await updateProject(editingProjectId, {
        title: title.trim(),
        fundingAgency: fundingAgency.trim() || "Interno",
        year: Number(year) || new Date().getFullYear(),
        status,
        summary: summary.trim(),
        publicSummary: summary.trim(),
        coAdvisorId: coAdvisorId || undefined,
        members: projectMembers,
        showOnPublicShowcase,
      });
    } else {
      await addProject({
        code: `PROJ-${year}-${Math.floor(100 + Math.random() * 900)}`,
        title: title.trim(),
        fundingAgency: fundingAgency.trim() || "Interno",
        year: Number(year) || new Date().getFullYear(),
        summary: summary.trim(),
        publicSummary: summary.trim(),
        status,
        advisorId: currentUser.id,
        coAdvisorId: coAdvisorId || undefined,
        startDate: `${year}-03-01`,
        members: projectMembers,
        deliverables: [],
        notes: "",
        showOnPublicShowcase,
        isSensitiveIp: false,
      });
    }

    setShowProjectModal(false);
  };

  return (
    <div className="space-y-6">
      {/* Cabeçalho */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-zinc-800/80 pb-4">
        <div>
          <h1 className="text-lg font-semibold text-zinc-100">Projetos</h1>
          <p className="text-xs text-zinc-400 mt-0.5">
            Gestão de projetos de pesquisa, integrantes, entregas de relatórios e diário de notas. Selecione um projeto para acessar sua página exclusiva.
          </p>
        </div>
        <button
          onClick={openCreateProject}
          className="px-3.5 py-2 rounded bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-medium transition-colors shrink-0"
        >
          + Novo Projeto
        </button>
      </div>

      {/* Barra de Filtros, Ordenação, Escopo e Pesquisa Discreta */}
      <div className="flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="flex flex-wrap items-center gap-2">
          {/* Toggle de Escopo: Meus Projetos (Padrão) vs Todos */}
          <div className="inline-flex rounded bg-[#111318] border border-zinc-800 p-0.5">
            <button
              type="button"
              onClick={() => {
                setScopeFilter("MEUS");
                setCurrentPage(1);
              }}
              className={`px-3 py-1 rounded text-xs transition-colors ${
                scopeFilter === "MEUS"
                  ? "bg-zinc-800 text-emerald-400 font-medium"
                  : "text-zinc-400 hover:text-zinc-200"
              }`}
            >
              Meus Projetos
            </button>
            <button
              type="button"
              onClick={() => {
                setScopeFilter("TODOS");
                setCurrentPage(1);
              }}
              className={`px-3 py-1 rounded text-xs transition-colors ${
                scopeFilter === "TODOS"
                  ? "bg-zinc-800 text-emerald-400 font-medium"
                  : "text-zinc-400 hover:text-zinc-200"
              }`}
            >
              Todos os Projetos
            </button>
          </div>

          {/* Filtro de Status: Padrão Em andamento */}
          <select
            value={statusFilter}
            onChange={(e) => {
              setStatusFilter(e.target.value);
              setCurrentPage(1);
            }}
            className="bg-[#111318] border border-zinc-800 rounded px-2.5 py-1.5 text-xs text-zinc-200 cursor-pointer focus:outline-none focus:border-zinc-700"
          >
            <option value="EM_ANDAMENTO">Status: Em andamento</option>
            <option value="CONCLUIDO">Status: Concluídos</option>
            <option value="PAUSADO">Status: Pausados</option>
            <option value="TODOS">Todos os Status</option>
          </select>

          {/* Filtro de Ordenação */}
          <select
            value={sortOrder}
            onChange={(e) => {
              setSortOrder(e.target.value as "RECENTES" | "ANTIGOS" | "TITULO_AZ");
              setCurrentPage(1);
            }}
            className="bg-[#111318] border border-zinc-800 rounded px-2.5 py-1.5 text-xs text-zinc-200 cursor-pointer focus:outline-none focus:border-zinc-700"
          >
            <option value="RECENTES">Mais recentes</option>
            <option value="ANTIGOS">Mais antigos</option>
            <option value="TITULO_AZ">Título (A-Z)</option>
          </select>
        </div>

        {/* Pesquisa Discreta */}
        <div className="flex items-center gap-2">
          <DiscreetSearchBar
            value={searchTerm}
            onChange={(val) => {
              setSearchTerm(val);
              setCurrentPage(1);
            }}
            placeholder="Buscar por título, agência, membro..."
          />
        </div>
      </div>

      {/* Lista de Projetos (Cartões Despoluídos) */}
      {filteredAndSortedProjects.length === 0 ? (
        <div className="bg-[#111318] border border-zinc-800/80 rounded-lg p-6 text-xs text-zinc-500">
          {searchTerm.trim()
            ? "Nenhum projeto encontrado para os termos da busca."
            : scopeFilter === "MEUS"
            ? 'Nenhum projeto seu encontrado para este status. Alterne para "Todos os Projetos" ou clique em "+ Novo Projeto".'
            : "Nenhum projeto encontrado com estes filtros."}
        </div>
      ) : (
        <div className="space-y-3.5">
          {paginatedProjects.map((proj) => {
            const hasAccess = canAccessProject(proj.id);
            const advisorName =
              members.find((m) => m.id === proj.advisorId)?.name || "Diretoria";
            const coAdvisorName = proj.coAdvisorId
              ? members.find((m) => m.id === proj.coAdvisorId)?.name
              : undefined;
            const projectNotesList = parseProjectNotes(proj.notes);

            // Verifica se o usuário atual é bolsista neste projeto
            const myLink = currentUser
              ? proj.members.find((pm) => pm.profileId === currentUser.id)
              : undefined;
            const isMyScholar =
              myLink?.roleInProject === "BOLSISTA" &&
              canSeeScholarshipValue(myLink.profileId);
            const myVigencia = isMyScholar
              ? getScholarshipVigenciaStatus(
                  myLink?.scholarshipStartMonth,
                  myLink?.scholarshipEndMonth,
                  proj.status
                )
              : null;

            return (
              <div
                key={proj.id}
                className="bg-[#111318] border border-zinc-800/80 rounded-lg p-4 sm:p-5 flex flex-col justify-between gap-3 text-xs hover:border-zinc-700/70 transition-colors"
              >
                <div className="space-y-2">
                  <div className="flex flex-wrap items-center justify-between gap-2 border-b border-zinc-800/50 pb-2.5">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="text-xs font-semibold text-emerald-400">
                        {proj.fundingAgency}
                      </span>
                      <span className="text-zinc-600">·</span>
                      <span className="text-zinc-400">Ano: {proj.year}</span>
                      <span className="text-zinc-600">·</span>
                      <span className="px-2 py-0.5 rounded bg-zinc-900 border border-zinc-800 text-[11px] text-zinc-200 font-medium">
                        {PROJECT_STATUS_LABELS[proj.status] || proj.status}
                      </span>
                      {proj.code && (
                        <>
                          <span className="text-zinc-600">·</span>
                          <span className="text-[11px] text-zinc-500 font-mono">
                            {proj.code}
                          </span>
                        </>
                      )}
                      {proj.showOnPublicShowcase && (
                        <>
                          <span className="text-zinc-600">·</span>
                          <span className="text-[11px] text-zinc-500">Vitrine Pública</span>
                        </>
                      )}
                    </div>

                    {isMyScholar && (
                      <span
                        className={`px-2 py-0.5 rounded border text-[11px] font-medium ${
                          myVigencia?.isActiveNow
                            ? "bg-emerald-950/60 border-emerald-800/60 text-emerald-300"
                            : "bg-zinc-900 border-zinc-700 text-zinc-400"
                        }`}
                      >
                        Sua Bolsa: R$ {myLink?.monthlyScholarshipBRL?.toLocaleString("pt-BR")}/mês (
                        {myVigencia?.label})
                      </span>
                    )}
                  </div>

                  <div>
                    <h2 className="text-sm sm:text-base font-semibold text-zinc-100">
                      {proj.title}
                    </h2>
                    {proj.summary && (
                      <p className="text-zinc-400 text-xs mt-1 line-clamp-2 leading-relaxed">
                        {proj.summary}
                      </p>
                    )}
                  </div>

                  <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-[11px] text-zinc-400 pt-1">
                    <span>
                      Orientação: <strong className="text-zinc-300">{advisorName}</strong>
                      {coAdvisorName ? ` · Coorientador: ${coAdvisorName}` : ""}
                    </span>
                    <span>
                      Equipe:{" "}
                      <strong className="text-zinc-300">{proj.members.length}</strong>{" "}
                      pesquisador(es)
                    </span>
                    <span>
                      Entregas/Relatórios:{" "}
                      <strong className="text-zinc-300">{proj.deliverables.length}</strong>
                    </span>
                    <span>
                      Diário de Notas:{" "}
                      <strong className="text-zinc-300">{projectNotesList.length}</strong>{" "}
                      anotação(ões)
                    </span>
                  </div>
                </div>

                <div className="pt-3 border-t border-zinc-800/70 flex flex-wrap items-center justify-between gap-3">
                  <Link
                    href={`/app/projetos/${proj.id}`}
                    className="px-3.5 py-1.5 rounded bg-emerald-600 hover:bg-emerald-500 text-white font-medium text-xs transition-colors shrink-0"
                  >
                    Abrir Projeto (Entregas, Integrantes e Notas) →
                  </Link>

                  {hasAccess && (
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => openEditProject(proj)}
                        className="px-2.5 py-1 rounded bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-zinc-300 text-xs transition-colors"
                      >
                        Editar
                      </button>
                      <button
                        onClick={() => {
                          if (
                            confirm(`Tem certeza que deseja excluir o projeto "${proj.title}"?`)
                          ) {
                            deleteProject(proj.id);
                          }
                        }}
                        className="px-2.5 py-1 rounded bg-red-950/40 hover:bg-red-900/60 border border-red-900/40 text-red-300 text-xs transition-colors"
                      >
                        Excluir
                      </button>
                    </div>
                  )}
                </div>
              </div>
            );
          })}

          {/* Paginação */}
          <PaginationControls
            currentPage={currentPage}
            totalItems={filteredAndSortedProjects.length}
            pageSize={pageSize}
            onPageChange={setCurrentPage}
            onPageSizeChange={setPageSize}
            pageSizeOptions={[15, 20, 50]}
          />
        </div>
      )}

      {/* Modal Criar / Editar Projeto */}
      {showProjectModal && (
        <div className="fixed inset-0 z-50 bg-black/75 flex items-center justify-center p-4">
          <div className="bg-[#111318] border border-zinc-800 rounded-lg max-w-xl w-full p-6 space-y-4 max-h-[90vh] overflow-y-auto text-xs">
            <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
              <h2 className="text-sm font-semibold text-zinc-100">
                {editingProjectId ? "Editar Projeto" : "Cadastrar Novo Projeto"}
              </h2>
              <button
                onClick={() => setShowProjectModal(false)}
                className="text-zinc-400 hover:text-zinc-200"
              >
                Fechar
              </button>
            </div>

            <form onSubmit={handleSaveProject} className="space-y-3.5">
              <div>
                <label className="block text-zinc-400 mb-1">Título do Projeto *</label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full bg-zinc-900 border border-zinc-800 rounded px-3 py-2 text-zinc-100"
                />
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-zinc-400 mb-1">Edital / Agência *</label>
                  <input
                    type="text"
                    required
                    value={fundingAgency}
                    onChange={(e) => setFundingAgency(e.target.value)}
                    placeholder="PIBIC, FAPITEC..."
                    className="w-full bg-zinc-900 border border-zinc-800 rounded px-3 py-2 text-zinc-100"
                  />
                </div>

                <div>
                  <label className="block text-zinc-400 mb-1">Ano *</label>
                  <input
                    type="number"
                    min={2010}
                    max={2100}
                    required
                    value={year}
                    onChange={(e) => setYear(Number(e.target.value))}
                    className="w-full bg-zinc-900 border border-zinc-800 rounded px-3 py-2 text-zinc-100"
                  />
                </div>

                <div>
                  <label className="block text-zinc-400 mb-1">Status</label>
                  <select
                    value={status}
                    onChange={(e) => setStatus(e.target.value as LabicProject["status"])}
                    className="w-full bg-zinc-900 border border-zinc-800 rounded px-3 py-2 text-zinc-100"
                  >
                    <option value="EM_ANDAMENTO">Em Andamento</option>
                    <option value="CONCLUIDO">Concluído</option>
                    <option value="PAUSADO">Pausado</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-zinc-400 mb-1">Resumo / Descrição</label>
                <textarea
                  rows={2}
                  value={summary}
                  onChange={(e) => setSummary(e.target.value)}
                  className="w-full bg-zinc-900 border border-zinc-800 rounded px-3 py-2 text-zinc-100"
                />
              </div>

              <div>
                <label className="block text-zinc-400 mb-1">Coorientador do Projeto (Opcional)</label>
                <select
                  value={coAdvisorId}
                  onChange={(e) => setCoAdvisorId(e.target.value)}
                  className="w-full bg-zinc-900 border border-zinc-800 rounded px-3 py-2 text-zinc-100"
                >
                  <option value="">Nenhum coorientador</option>
                  {members.map((m) => (
                    <option key={m.id} value={m.id}>
                      {m.name} ({m.institution})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-zinc-400">
                    Alunos / Pesquisadores Integrantes e Bolsas ({projectMembers.length})
                  </label>
                  <div className="flex items-center gap-2 text-[11px]">
                    <button
                      type="button"
                      onClick={() =>
                        setProjectMembers(
                          members.map((m) => ({
                            profileId: m.id,
                            roleInProject: "VOLUNTARIO",
                          }))
                        )
                      }
                      className="text-emerald-400 hover:underline"
                    >
                      Marcar todos
                    </button>
                    <span className="text-zinc-600">·</span>
                    <button
                      type="button"
                      onClick={() => setProjectMembers([])}
                      className="text-zinc-400 hover:underline"
                    >
                      Desmarcar todos
                    </button>
                  </div>
                </div>
                <div className="max-h-44 overflow-y-auto bg-zinc-900 border border-zinc-800 rounded p-2 space-y-2">
                  {members.map((m) => {
                    const selected = projectMembers.find((pm) => pm.profileId === m.id);
                    const isScholar = selected?.roleInProject === "BOLSISTA";
                    return (
                      <div key={m.id} className="p-2 rounded bg-zinc-950/50 border border-zinc-800/60">
                        <label className="flex items-center gap-2 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={!!selected}
                            onChange={() => toggleProjectMember(m.id)}
                          />
                          <span className="text-zinc-200 font-medium">{m.name}</span>
                        </label>
                        {selected && (
                          <div className="mt-2 pl-5 space-y-2">
                            <label className="flex items-center gap-1.5 text-zinc-300 cursor-pointer">
                              <input
                                type="checkbox"
                                checked={isScholar}
                                onChange={(e) =>
                                  updateMemberScholar(m.id, e.target.checked, {
                                    monthlyScholarshipBRL: selected.monthlyScholarshipBRL,
                                  })
                                }
                              />
                              <span>Recebe Bolsa neste projeto</span>
                            </label>
                            {isScholar && (
                              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1">
                                <div>
                                  <label className="block text-[10px] text-zinc-400 mb-0.5">
                                    Valor Mensal (R$)
                                  </label>
                                  <input
                                    type="number"
                                    placeholder="Ex: 700"
                                    value={selected.monthlyScholarshipBRL || ""}
                                    onChange={(e) =>
                                      updateMemberScholar(m.id, true, {
                                        monthlyScholarshipBRL: Number(e.target.value),
                                      })
                                    }
                                    className="bg-zinc-900 border border-zinc-800 rounded px-2 py-1 text-zinc-100 w-full"
                                  />
                                </div>
                                <div>
                                  <label className="block text-[10px] text-zinc-400 mb-0.5">
                                    Início (Mês/Ano)
                                  </label>
                                  <input
                                    type="month"
                                    value={selected.scholarshipStartMonth || ""}
                                    onChange={(e) =>
                                      updateMemberScholar(m.id, true, {
                                        scholarshipStartMonth: e.target.value,
                                      })
                                    }
                                    className="bg-zinc-900 border border-zinc-800 rounded px-2 py-1 text-zinc-100 w-full"
                                  />
                                </div>
                                <div>
                                  <label className="block text-[10px] text-zinc-400 mb-0.5">
                                    Fim (Mês/Ano)
                                  </label>
                                  <input
                                    type="month"
                                    value={selected.scholarshipEndMonth || ""}
                                    onChange={(e) =>
                                      updateMemberScholar(m.id, true, {
                                        scholarshipEndMonth: e.target.value,
                                      })
                                    }
                                    className="bg-zinc-900 border border-zinc-800 rounded px-2 py-1 text-zinc-100 w-full"
                                  />
                                </div>
                                <div>
                                  <label className="block text-[10px] text-zinc-400 mb-0.5">
                                    Qtd. de Parcelas
                                  </label>
                                  <input
                                    type="number"
                                    min={1}
                                    max={60}
                                    value={selected.scholarshipInstallments ?? 12}
                                    onChange={(e) =>
                                      updateMemberScholar(m.id, true, {
                                        scholarshipInstallments: Number(e.target.value),
                                      })
                                    }
                                    className="bg-zinc-900 border border-zinc-800 rounded px-2 py-1 text-zinc-100 w-full"
                                  />
                                </div>
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>

              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={showOnPublicShowcase}
                  onChange={(e) => setShowOnPublicShowcase(e.target.checked)}
                />
                <span className="text-zinc-300">Exibir projeto na página pública do LABIC</span>
              </label>

              <div className="flex justify-end gap-2 pt-3 border-t border-zinc-800">
                <button
                  type="button"
                  onClick={() => setShowProjectModal(false)}
                  className="px-3 py-1.5 rounded bg-zinc-800 text-zinc-300"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 rounded bg-emerald-600 hover:bg-emerald-500 text-white font-medium"
                >
                  {editingProjectId ? "Salvar Alterações" : "Criar Projeto"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
