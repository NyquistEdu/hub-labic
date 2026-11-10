"use client";

import React, { useState, useMemo } from "react";
import { useLabic } from "@/context/LabicContext";
import {
  LabicAttachment,
  ProductionCategory,
  PRODUCTION_CATEGORY_LABELS,
  ProductionItem,
} from "@/types/labic";
import { AttachmentManager } from "@/components/AttachmentManager";
import { PaginationControls } from "@/components/PaginationControls";
import { DiscreetSearchBar } from "@/components/DiscreetSearchBar";

export default function ProducoesPage() {
  const {
    productions,
    members,
    projects,
    currentUser,
    addProduction,
    updateProduction,
    deleteProduction,
  } = useLabic();

  const [yearFilter, setYearFilter] = useState<string>("TODOS");
  const [catFilter, setCatFilter] = useState<string>("TODAS");
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [sortOrder, setSortOrder] = useState<"RECENTES" | "ANTIGOS" | "TITULO_AZ">("RECENTES");
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [pageSize, setPageSize] = useState<number>(15);

  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [viewingItem, setViewingItem] = useState<ProductionItem | null>(null);

  const [title, setTitle] = useState("");
  const [category, setCategory] = useState<ProductionCategory>("ARTIGO");
  const [year, setYear] = useState<number>(new Date().getFullYear());
  const [venueOrAgency, setVenueOrAgency] = useState("");
  const [primaryAuthorId, setPrimaryAuthorId] = useState<string>(currentUser?.id || "");
  const [primaryAuthorType, setPrimaryAuthorType] = useState<"LABIC" | "EXTERNAL">("LABIC");
  const [primaryAuthorExternal, setPrimaryAuthorExternal] = useState<string>("");
  const [selectedAuthors, setSelectedAuthors] = useState<string[]>(
    currentUser ? [currentUser.id] : []
  );
  const [externalAuthors, setExternalAuthors] = useState("");
  const [projectId, setProjectId] = useState("");
  const [attachments, setAttachments] = useState<LabicAttachment[]>([]);
  const [isSensitive, setIsSensitive] = useState(false);

  const availableYears = useMemo(() => {
    const set = new Set<number>();
    productions.forEach((p) => set.add(p.year));
    return Array.from(set).sort((a, b) => b - a);
  }, [productions]);

  const filtered = useMemo(() => {
    let result = productions.filter((p) => {
      if (yearFilter !== "TODOS" && String(p.year) !== yearFilter) return false;
      if (catFilter !== "TODAS" && p.category !== catFilter) return false;

      if (searchTerm.trim()) {
        const term = searchTerm.trim().toLowerCase();
        const matchesTitle = p.title.toLowerCase().includes(term);
        const matchesAgency = (p.venueOrAgency || "").toLowerCase().includes(term);
        const matchesExternal = (p.externalAuthors || "").toLowerCase().includes(term);
        const matchesPrimaryExternal = (p.primaryAuthorExternal || "").toLowerCase().includes(term);
        const matchesAuthors = p.authorIds.some((id) => {
          const m = members.find((mem) => mem.id === id);
          return m?.name.toLowerCase().includes(term);
        });
        if (
          !matchesTitle &&
          !matchesAgency &&
          !matchesExternal &&
          !matchesPrimaryExternal &&
          !matchesAuthors
        ) {
          return false;
        }
      }

      return true;
    });

    result.sort((a, b) => {
      if (sortOrder === "RECENTES") {
        return b.year - a.year || a.title.localeCompare(b.title);
      }
      if (sortOrder === "ANTIGOS") {
        return a.year - b.year || a.title.localeCompare(b.title);
      }
      if (sortOrder === "TITULO_AZ") {
        return a.title.localeCompare(b.title);
      }
      return 0;
    });

    return result;
  }, [productions, yearFilter, catFilter, searchTerm, sortOrder, members]);

  const paginatedProductions = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filtered.slice(start, start + pageSize);
  }, [filtered, currentPage, pageSize]);

  const openCreateModal = () => {
    setEditingId(null);
    setTitle("");
    setCategory("ARTIGO");
    setYear(new Date().getFullYear());
    setVenueOrAgency("");
    setPrimaryAuthorType("LABIC");
    setPrimaryAuthorExternal("");
    const defAuthor = currentUser?.id || members[0]?.id || "";
    setPrimaryAuthorId(defAuthor);
    setSelectedAuthors(defAuthor ? [defAuthor] : []);
    setExternalAuthors("");
    setProjectId("");
    setAttachments([]);
    setIsSensitive(false);
    setShowModal(true);
  };

  const openEditModal = (prod: ProductionItem) => {
    setEditingId(prod.id);
    setTitle(prod.title);
    setCategory(prod.category);
    setYear(prod.year);
    setVenueOrAgency(prod.venueOrAgency);
    if (prod.primaryAuthorExternal && !prod.primaryAuthorId) {
      setPrimaryAuthorType("EXTERNAL");
      setPrimaryAuthorExternal(prod.primaryAuthorExternal);
      setPrimaryAuthorId("");
    } else {
      setPrimaryAuthorType("LABIC");
      setPrimaryAuthorExternal("");
      const prim = prod.primaryAuthorId || prod.authorIds[0] || "";
      setPrimaryAuthorId(prim);
    }
    setSelectedAuthors(prod.authorIds);
    setExternalAuthors(prod.externalAuthors || "");
    setProjectId(prod.projectId || "");
    setAttachments(prod.attachments || []);
    setIsSensitive(prod.isSensitive);
    setShowModal(true);
  };

  const toggleAuthor = (id: string) => {
    setSelectedAuthors((prev) =>
      prev.includes(id) ? prev.filter((a) => a !== id) : [...prev, id]
    );
  };

  const handlePrimaryAuthorChange = (id: string) => {
    setPrimaryAuthorId(id);
    if (id && !selectedAuthors.includes(id)) {
      setSelectedAuthors((prev) => [id, ...prev]);
    }
  };

  const selectAllAuthors = () => setSelectedAuthors(members.map((m) => m.id));
  const clearAllAuthors = () =>
    setSelectedAuthors(
      primaryAuthorType === "LABIC" && primaryAuthorId ? [primaryAuthorId] : []
    );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    if (primaryAuthorType === "EXTERNAL" && !primaryAuthorExternal.trim()) {
      alert("Por favor, informe o nome do Autor Principal Externo.");
      return;
    }

    const finalPrimaryId =
      primaryAuthorType === "LABIC"
        ? primaryAuthorId || members[0]?.id
        : undefined;

    const finalPrimaryExternal =
      primaryAuthorType === "EXTERNAL"
        ? primaryAuthorExternal.trim()
        : undefined;

    const finalAuthors = finalPrimaryId
      ? Array.from(new Set([finalPrimaryId, ...selectedAuthors]))
      : selectedAuthors;

    if (finalAuthors.length === 0 && !externalAuthors.trim() && !finalPrimaryExternal) {
      alert("Selecione ao menos um membro do LABIC ou autor externo vinculado.");
      return;
    }

    if (editingId) {
      await updateProduction(editingId, {
        title: title.trim(),
        category,
        year: Number(year) || new Date().getFullYear(),
        venueOrAgency: venueOrAgency.trim(),
        primaryAuthorId: finalPrimaryId,
        primaryAuthorExternal: finalPrimaryExternal,
        authorIds: finalAuthors,
        externalAuthors: externalAuthors.trim() || undefined,
        projectId: projectId || undefined,
        attachments,
        fileName: attachments[0]?.url || undefined,
        isSensitive,
      });
    } else {
      await addProduction({
        title: title.trim(),
        category,
        year: Number(year) || new Date().getFullYear(),
        venueOrAgency: venueOrAgency.trim(),
        primaryAuthorId: finalPrimaryId,
        primaryAuthorExternal: finalPrimaryExternal,
        authorIds: finalAuthors,
        externalAuthors: externalAuthors.trim() || undefined,
        projectId: projectId || undefined,
        attachments,
        fileName: attachments[0]?.url || undefined,
        verifiedByCoordination: true,
        isSensitive,
      });
    }

    setShowModal(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-zinc-800/80 pb-4">
        <div>
          <h1 className="text-lg font-semibold text-zinc-100">Produções</h1>
          <p className="text-xs text-zinc-400 mt-0.5">
            Registro histórico e atual de artigos, TCCs, dissertações, registros de software (INPI), premiações e editais aprovados de qualquer ano, com múltiplos arquivos PDF e links.
          </p>
        </div>
        <button
          onClick={openCreateModal}
          className="px-3.5 py-2 rounded bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-medium transition-colors shrink-0"
        >
          + Registrar Produção
        </button>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-2">
          <select
            value={yearFilter}
            onChange={(e) => {
              setYearFilter(e.target.value);
              setCurrentPage(1);
            }}
            className="bg-[#111318] border border-zinc-800 rounded px-3 py-1.5 text-xs text-zinc-200 cursor-pointer"
          >
            <option value="TODOS">Todos os anos</option>
            {availableYears.map((y) => (
              <option key={y} value={String(y)}>
                {y}
              </option>
            ))}
          </select>

          <select
            value={catFilter}
            onChange={(e) => {
              setCatFilter(e.target.value);
              setCurrentPage(1);
            }}
            className="bg-[#111318] border border-zinc-800 rounded px-3 py-1.5 text-xs text-zinc-200 cursor-pointer"
          >
            <option value="TODAS">Todas as categorias</option>
            {Object.entries(PRODUCTION_CATEGORY_LABELS).map(([k, label]) => (
              <option key={k} value={k}>
                {label}
              </option>
            ))}
          </select>

          <select
            value={sortOrder}
            onChange={(e) => {
              setSortOrder(e.target.value as "RECENTES" | "ANTIGOS" | "TITULO_AZ");
              setCurrentPage(1);
            }}
            className="bg-[#111318] border border-zinc-800 rounded px-3 py-1.5 text-xs text-zinc-200 cursor-pointer"
          >
            <option value="RECENTES">Mais recentes</option>
            <option value="ANTIGOS">Mais antigos</option>
            <option value="TITULO_AZ">Título (A-Z)</option>
          </select>
        </div>

        <div className="flex items-center gap-2">
          <DiscreetSearchBar
            value={searchTerm}
            onChange={(val) => {
              setSearchTerm(val);
              setCurrentPage(1);
            }}
            placeholder="Buscar por título, autor, órgão..."
          />
        </div>
      </div>

      <div className="bg-[#111318] border border-zinc-800/80 rounded-lg overflow-hidden">
        {filtered.length === 0 ? (
          <p className="text-xs text-zinc-500 p-6">Nenhuma produção registrada para este filtro.</p>
        ) : (
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-zinc-800 text-zinc-400 bg-zinc-900/40">
                <th className="py-2.5 px-4 font-medium">Ano</th>
                <th className="py-2.5 px-4 font-medium">Categoria</th>
                <th className="py-2.5 px-4 font-medium">Título e Conferência / Órgão</th>
                <th className="py-2.5 px-4 font-medium">Autor Principal & Coautores</th>
                <th className="py-2.5 px-4 font-medium">Arquivos</th>
                <th className="py-2.5 px-4 font-medium text-right">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-800/60">
              {paginatedProductions.map((prod) => {
                const primaryId = prod.primaryAuthorId;
                const primaryMember = primaryId ? members.find((m) => m.id === primaryId) : undefined;
                const coauthorNames = prod.authorIds
                  .filter((id) => id !== primaryId)
                  .map((id) => members.find((m) => m.id === id)?.name)
                  .filter(Boolean)
                  .join(", ");

                return (
                  <tr key={prod.id} className="hover:bg-zinc-900/30">
                    <td className="py-3 px-4 font-medium text-zinc-200 whitespace-nowrap">
                      {prod.year}
                    </td>
                    <td className="py-3 px-4 text-emerald-400 whitespace-nowrap">
                      {PRODUCTION_CATEGORY_LABELS[prod.category]}
                    </td>
                    <td className="py-3 px-4">
                      <div className="font-medium text-zinc-100">{prod.title}</div>
                      {prod.venueOrAgency && (
                        <div className="text-[11px] text-zinc-500">{prod.venueOrAgency}</div>
                      )}
                      {prod.isSensitive && (
                        <span className="inline-block mt-1 text-[10px] px-1.5 py-0.5 rounded bg-amber-950/60 border border-amber-800/50 text-amber-300">
                          Sigiloso na Vitrine
                        </span>
                      )}
                    </td>
                    <td className="py-3 px-4">
                      {prod.primaryAuthorExternal ? (
                        <div className="text-zinc-200 font-medium">
                          {prod.primaryAuthorExternal}{" "}
                          <span className="text-[10px] text-amber-400 font-normal">
                            (Autor Principal Externo)
                          </span>
                        </div>
                      ) : primaryMember ? (
                        <div className="text-zinc-200 font-medium">
                          {primaryMember.name}{" "}
                          <span className="text-[10px] text-emerald-400 font-normal">
                            (Autor Principal)
                          </span>
                        </div>
                      ) : null}
                      {coauthorNames && (
                        <div className="text-[11px] text-zinc-500">
                          Coautores (LABIC): {coauthorNames}
                        </div>
                      )}
                      {prod.externalAuthors && (
                        <div className="text-[11px] text-zinc-400 mt-0.5">
                          {prod.primaryAuthorExternal ? "Demais Autores Externos:" : "Autores Externos:"} {prod.externalAuthors}
                        </div>
                      )}
                    </td>
                    <td className="py-3 px-4 whitespace-nowrap">
                      {prod.attachments && prod.attachments.length > 0 ? (
                        <div className="flex flex-col gap-1">
                          {prod.attachments.map((att) => (
                            <a
                              key={att.id}
                              href={att.url}
                              target="_blank"
                              rel="noreferrer"
                              className="text-[11px] text-emerald-400 hover:underline truncate max-w-[160px]"
                            >
                              [{att.fileType === "PDF_UPLOAD" ? "PDF" : "Link"}] {att.label}
                            </a>
                          ))}
                        </div>
                      ) : (
                        <span className="text-zinc-600">—</span>
                      )}
                    </td>
                    <td className="py-3 px-4 text-right whitespace-nowrap">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => setViewingItem(prod)}
                          className="px-2 py-1 rounded bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-zinc-200"
                        >
                          Ver
                        </button>
                        <button
                          onClick={() => openEditModal(prod)}
                          className="px-2 py-1 rounded bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-zinc-300"
                        >
                          Editar
                        </button>
                        <button
                          onClick={() => deleteProduction(prod.id)}
                          className="px-2 py-1 rounded bg-red-950/50 hover:bg-red-900/60 border border-red-900/50 text-red-300"
                        >
                          Excluir
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}

        <PaginationControls
          currentPage={currentPage}
          totalItems={filtered.length}
          pageSize={pageSize}
          onPageChange={setCurrentPage}
          onPageSizeChange={setPageSize}
          pageSizeOptions={[15, 20, 50]}
          className="p-3"
        />
      </div>

      {/* Modal de Visualização Detalhada */}
      {viewingItem && (
        <div className="fixed inset-0 z-50 bg-black/75 flex items-center justify-center p-4">
          <div className="bg-[#111318] border border-zinc-800 rounded-lg max-w-lg w-full p-6 space-y-4 text-xs">
            <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
              <div>
                <span className="text-[11px] text-emerald-400 font-medium">
                  {PRODUCTION_CATEGORY_LABELS[viewingItem.category]} · {viewingItem.year}
                </span>
                <h2 className="text-base font-semibold text-zinc-100 mt-0.5">
                  {viewingItem.title}
                </h2>
              </div>
              <button
                onClick={() => setViewingItem(null)}
                className="text-zinc-400 hover:text-zinc-200"
              >
                Fechar
              </button>
            </div>

            <div className="space-y-2 text-zinc-300">
              <p>
                <strong className="text-zinc-400">Conferência / Órgão / Edital:</strong>{" "}
                {viewingItem.venueOrAgency || "Não informado"}
              </p>
              <p>
                <strong className="text-zinc-400">Autor Principal:</strong>{" "}
                {viewingItem.primaryAuthorExternal ? (
                  <span>
                    {viewingItem.primaryAuthorExternal}{" "}
                    <span className="text-[10px] text-amber-400 font-normal">
                      (Autor Principal Externo)
                    </span>
                  </span>
                ) : (
                  members.find(
                    (m) => m.id === (viewingItem.primaryAuthorId || viewingItem.authorIds[0])
                  )?.name || "—"
                )}
              </p>
              <p>
                <strong className="text-zinc-400">Membros Coautores do LABIC:</strong>{" "}
                {viewingItem.authorIds
                  .filter((id) => id !== viewingItem.primaryAuthorId)
                  .map((id) => members.find((m) => m.id === id)?.name)
                  .filter(Boolean)
                  .join(", ") || (viewingItem.primaryAuthorId ? members.find((m) => m.id === viewingItem.primaryAuthorId)?.name : "—")}
              </p>
              {viewingItem.externalAuthors && (
                <p>
                  <strong className="text-zinc-400">
                    {viewingItem.primaryAuthorExternal ? "Demais Autores Externos:" : "Autores Externos:"}
                  </strong>{" "}
                  {viewingItem.externalAuthors}
                </p>
              )}
            </div>

            <div className="space-y-2 pt-2 border-t border-zinc-800/80">
              <div className="font-medium text-zinc-300">
                Arquivos e Links ({viewingItem.attachments?.length || 0}):
              </div>
              {!viewingItem.attachments || viewingItem.attachments.length === 0 ? (
                <p className="text-zinc-500">Nenhum arquivo anexado.</p>
              ) : (
                <div className="divide-y divide-zinc-800/60 bg-zinc-900/50 border border-zinc-800 rounded px-3">
                  {viewingItem.attachments.map((att) => (
                    <div
                      key={att.id}
                      className="py-2 flex items-center justify-between gap-2"
                    >
                      <span className="text-zinc-200">{att.label}</span>
                      <a
                        href={att.url}
                        target="_blank"
                        rel="noreferrer"
                        className="text-emerald-400 hover:underline font-medium shrink-0"
                      >
                        Abrir / Baixar ↗
                      </a>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Modal de Cadastro / Edição */}
      {showModal && (
        <div className="fixed inset-0 z-50 bg-black/75 flex items-center justify-center p-4">
          <div className="bg-[#111318] border border-zinc-800 rounded-lg max-w-xl w-full p-6 space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
              <h2 className="text-sm font-semibold text-zinc-100">
                {editingId ? "Editar Produção" : "Registrar Produção"}
              </h2>
              <button
                onClick={() => setShowModal(false)}
                className="text-xs text-zinc-400 hover:text-zinc-200"
              >
                Fechar
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-3.5 text-xs">
              <div>
                <label className="block text-zinc-400 mb-1">Título da Produção *</label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full bg-zinc-900 border border-zinc-800 rounded px-3 py-2 text-zinc-100"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-zinc-400 mb-1">Categoria *</label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value as ProductionCategory)}
                    className="w-full bg-zinc-900 border border-zinc-800 rounded px-3 py-2 text-zinc-100"
                  >
                    {Object.entries(PRODUCTION_CATEGORY_LABELS).map(([k, label]) => (
                      <option key={k} value={k}>
                        {label}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-zinc-400 mb-1">Ano da Produção *</label>
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
              </div>

              <div>
                <label className="block text-zinc-400 mb-1">
                  Conferência, Periódico, Instituição, Órgão (ex: INPI) ou Edital
                </label>
                <input
                  type="text"
                  value={venueOrAgency}
                  onChange={(e) => setVenueOrAgency(e.target.value)}
                  placeholder="Ex.: IEEE / INPI / FAPITEC / IFS"
                  className="w-full bg-zinc-900 border border-zinc-800 rounded px-3 py-2 text-zinc-100"
                />
              </div>

              <div className="space-y-2">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1.5">
                  <label className="block text-zinc-300 font-medium">
                    Autor Principal do Trabalho *
                  </label>
                  <div className="inline-flex items-center gap-1 bg-zinc-900 border border-zinc-800 rounded p-1 self-start sm:self-auto">
                    <button
                      type="button"
                      onClick={() => {
                        setPrimaryAuthorType("LABIC");
                        if (!primaryAuthorId) {
                          setPrimaryAuthorId(currentUser?.id || members[0]?.id || "");
                        }
                      }}
                      className={`px-2 py-0.5 rounded text-[11px] transition-colors ${
                        primaryAuthorType === "LABIC"
                          ? "bg-emerald-600 text-white font-medium"
                          : "text-zinc-400 hover:text-zinc-200"
                      }`}
                    >
                      Membro do LABIC
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setPrimaryAuthorType("EXTERNAL");
                      }}
                      className={`px-2 py-0.5 rounded text-[11px] transition-colors ${
                        primaryAuthorType === "EXTERNAL"
                          ? "bg-amber-600 text-white font-medium"
                          : "text-zinc-400 hover:text-zinc-200"
                      }`}
                    >
                      Autor Externo (Não cadastrado)
                    </button>
                  </div>
                </div>

                {primaryAuthorType === "LABIC" ? (
                  <div>
                    <select
                      value={primaryAuthorId}
                      onChange={(e) => handlePrimaryAuthorChange(e.target.value)}
                      className="w-full bg-zinc-900 border border-zinc-800 rounded px-3 py-2 text-zinc-100"
                    >
                      {members.map((m) => (
                        <option key={m.id} value={m.id}>
                          {m.name} ({m.institution}){m.status === "INATIVO" ? " — Egresso/Inativo" : ""}
                        </option>
                      ))}
                    </select>
                    <p className="text-[11px] text-zinc-500 mt-1">
                      Você pode registrar produções em nome de qualquer membro do laboratório (inclusive quem já saiu), vinculando diretamente ao acervo dele.
                    </p>
                  </div>
                ) : (
                  <div>
                    <input
                      type="text"
                      required
                      value={primaryAuthorExternal}
                      onChange={(e) => setPrimaryAuthorExternal(e.target.value)}
                      placeholder="Ex.: Prof. Dr. João Silva (USP) ou Dra. Maria Santos"
                      className="w-full bg-zinc-900 border border-amber-800/70 rounded px-3 py-2 text-zinc-100 placeholder:text-zinc-600 focus:border-amber-500 focus:outline-none"
                    />
                    <p className="text-[11px] text-amber-400/90 mt-1">
                      Utilize quando a pesquisa foi liderada por alguém de fora do LABIC. Selecione você e seus colegas do LABIC na seção abaixo para vincular a produção ao laboratório.
                    </p>
                  </div>
                )}
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-zinc-400">
                    {primaryAuthorType === "EXTERNAL"
                      ? "Membros do LABIC Participantes / Coautores *"
                      : "Demais Autores / Coautores do LABIC"}{" "}
                    ({selectedAuthors.length} selecionado(s))
                  </label>
                  <div className="flex items-center gap-2 text-[11px]">
                    <button
                      type="button"
                      onClick={selectAllAuthors}
                      className="text-emerald-400 hover:underline"
                    >
                      Marcar todos
                    </button>
                    <span className="text-zinc-600">·</span>
                    <button
                      type="button"
                      onClick={clearAllAuthors}
                      className="text-zinc-400 hover:underline"
                    >
                      Desmarcar demais
                    </button>
                  </div>
                </div>
                <div className="max-h-36 overflow-y-auto bg-zinc-900 border border-zinc-800 rounded p-2 space-y-1">
                  {members.map((m) => {
                    const isPrimary = primaryAuthorType === "LABIC" && m.id === primaryAuthorId;
                    return (
                      <label
                        key={m.id}
                        className="flex items-center justify-between px-2 py-1 rounded hover:bg-zinc-800/60 cursor-pointer"
                      >
                        <div className="flex items-center gap-2">
                          <input
                            type="checkbox"
                            checked={isPrimary || selectedAuthors.includes(m.id)}
                            disabled={isPrimary}
                            onChange={() => toggleAuthor(m.id)}
                          />
                          <span className="text-zinc-200">{m.name}</span>
                          <span className="text-[11px] text-zinc-500">({m.institution})</span>
                        </div>
                        {isPrimary && (
                          <span className="text-[10px] text-emerald-400 font-medium">
                            Autor Principal
                          </span>
                        )}
                      </label>
                    );
                  })}
                </div>
              </div>

              <div>
                <label className="block text-zinc-400 mb-1">
                  Autores / Coautores Externos ao LABIC (Opcional)
                </label>
                <input
                  type="text"
                  value={externalAuthors}
                  onChange={(e) => setExternalAuthors(e.target.value)}
                  placeholder="Escreva o nome completo dos autores que não estão cadastrados no sistema separados por vírgula"
                  className="w-full bg-zinc-900 border border-zinc-800 rounded px-3 py-2 text-zinc-100"
                />
                <p className="text-[11px] text-zinc-500 mt-1">
                  Escreva o nome completo dos autores que não estão cadastrados no sistema separados por vírgula (ex.: Prof. Dr. João Silva, Dra. Maria Oliveira).
                </p>
              </div>

              <div>
                <label className="block text-zinc-400 mb-1">Projeto Vinculado (Opcional)</label>
                <select
                  value={projectId}
                  onChange={(e) => setProjectId(e.target.value)}
                  className="w-full bg-zinc-900 border border-zinc-800 rounded px-3 py-2 text-zinc-100"
                >
                  <option value="">Nenhum</option>
                  {projects.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.title}
                    </option>
                  ))}
                </select>
              </div>

              {/* Gerenciador de Múltiplos Arquivos PDF e Links */}
              <AttachmentManager
                attachments={attachments}
                onChange={setAttachments}
                bucket="documentos-labic"
                label="Arquivos da Produção (Versão Final em PDF, Certificado INPI, etc.)"
              />

              <label className="flex items-center gap-2 pt-1 cursor-pointer">
                <input
                  type="checkbox"
                  checked={isSensitive}
                  onChange={(e) => setIsSensitive(e.target.checked)}
                />
                <span className="text-zinc-300">
                  Item sigiloso (soma nos indicadores numéricos, mas oculta o título na página pública)
                </span>
              </label>

              <div className="flex justify-end gap-2 pt-3 border-t border-zinc-800">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-3 py-1.5 rounded bg-zinc-800 text-zinc-300"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 rounded bg-emerald-600 hover:bg-emerald-500 text-white font-medium"
                >
                  {editingId ? "Salvar Alterações" : "Salvar Produção"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
