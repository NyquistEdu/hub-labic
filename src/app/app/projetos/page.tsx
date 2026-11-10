"use client";

import React, { useState } from "react";
import { useLabic } from "@/context/LabicContext";
import {
  calculateInstallmentsBetween,
  DELIVERABLE_STATUS_LABELS,
  formatDateBR,
  formatMonthYearBR,
  getScholarshipVigenciaStatus,
  LabicAttachment,
  LabicProject,
  PROJECT_STATUS_LABELS,
  ProjectDeliverable,
} from "@/types/labic";
import { AttachmentManager } from "@/components/AttachmentManager";

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
    updateProjectNotes,
    addProjectDeliverable,
    updateProjectDeliverable,
    deleteProjectDeliverable,
  } = useLabic();

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

  // Modal de Entrega / Arquivo do Projeto (Criar / Editar)
  const [activeDelivProjId, setActiveDelivProjId] = useState<string | null>(null);
  const [editingDeliverableId, setEditingDeliverableId] = useState<string | null>(null);
  const [delTitle, setDelTitle] = useState("");
  const [delDesc, setDelDesc] = useState("");
  const [delDueDate, setDelDueDate] = useState("");
  const [delStatus, setDelStatus] = useState<ProjectDeliverable["status"]>("PENDENTE");
  const [delAttachments, setDelAttachments] = useState<LabicAttachment[]>([]);

  // Bloco de Notas por projeto
  const [notesDraftByProj, setNotesDraftByProj] = useState<Record<string, string>>({});
  const [notesSavedBanner, setNotesSavedBanner] = useState<string | null>(null);

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

  const openCreateDeliverable = (projectId: string) => {
    setActiveDelivProjId(projectId);
    setEditingDeliverableId(null);
    setDelTitle("");
    setDelDesc("");
    setDelDueDate("");
    setDelStatus("PENDENTE");
    setDelAttachments([]);
  };

  const openEditDeliverable = (projectId: string, del: ProjectDeliverable) => {
    setActiveDelivProjId(projectId);
    setEditingDeliverableId(del.id);
    setDelTitle(del.title);
    setDelDesc(del.description || "");
    setDelDueDate(del.dueDate);
    setDelStatus(del.status);
    setDelAttachments(del.attachments || []);
  };

  const handleSaveDeliverable = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeDelivProjId || !delTitle.trim()) return;

    const finalStatus =
      delAttachments.length > 0 && delStatus === "PENDENTE" ? "ENTREGUE" : delStatus;

    if (editingDeliverableId) {
      await updateProjectDeliverable(activeDelivProjId, editingDeliverableId, {
        title: delTitle.trim(),
        description: delDesc.trim(),
        dueDate: delDueDate,
        status: finalStatus,
        attachments: delAttachments,
        fileName: delAttachments[0]?.url || undefined,
      });
    } else {
      await addProjectDeliverable(activeDelivProjId, {
        title: delTitle.trim(),
        description: delDesc.trim(),
        type: "DOCUMENTO_OPCIONAL",
        dueDate: delDueDate,
        status: finalStatus,
        attachments: delAttachments,
        fileName: delAttachments[0]?.url || undefined,
      });
    }

    setActiveDelivProjId(null);
    setEditingDeliverableId(null);
  };

  const handleSaveNotes = async (projectId: string, currentNotes: string) => {
    const val = notesDraftByProj[projectId] ?? currentNotes;
    await updateProjectNotes(projectId, val);
    setNotesSavedBanner(projectId);
    setTimeout(() => setNotesSavedBanner(null), 2500);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-zinc-800/80 pb-4">
        <div>
          <h1 className="text-lg font-semibold text-zinc-100">Projetos</h1>
          <p className="text-xs text-zinc-400 mt-0.5">
            Gestão de projetos de pesquisa, coorientações, bolsas, entregas de arquivos e bloco de notas colaborativo.
          </p>
        </div>
        <button
          onClick={openCreateProject}
          className="px-3.5 py-2 rounded bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-medium transition-colors shrink-0"
        >
          + Novo Projeto
        </button>
      </div>

      {projects.length === 0 ? (
        <div className="bg-[#111318] border border-zinc-800/80 rounded-lg p-6 text-xs text-zinc-500">
          Nenhum projeto cadastrado. Clique em &ldquo;+ Novo Projeto&rdquo; para registrar o primeiro projeto do laboratório.
        </div>
      ) : (
        <div className="space-y-6">
          {projects.map((proj) => {
            const hasAccess = canAccessProject(proj.id);
            const coAdvisorName = proj.coAdvisorId
              ? members.find((m) => m.id === proj.coAdvisorId)?.name
              : undefined;
            const currentNotes = notesDraftByProj[proj.id] ?? proj.notes ?? "";

            return (
              <div
                key={proj.id}
                className="bg-[#111318] border border-zinc-800/80 rounded-lg p-5 space-y-5"
              >
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3 border-b border-zinc-800/60 pb-3">
                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="text-xs font-medium text-emerald-400">
                        {proj.fundingAgency}
                      </span>
                      <span className="text-xs text-zinc-600">·</span>
                      <span className="text-xs text-zinc-400">Ano: {proj.year}</span>
                      <span className="text-xs text-zinc-600">·</span>
                      <span className="text-[11px] px-2 py-0.5 rounded bg-zinc-900 border border-zinc-800 text-zinc-200 font-medium">
                        {PROJECT_STATUS_LABELS[proj.status] || proj.status}
                      </span>
                      {proj.showOnPublicShowcase && (
                        <>
                          <span className="text-xs text-zinc-600">·</span>
                          <span className="text-[11px] text-zinc-500">Visível na Vitrine</span>
                        </>
                      )}
                    </div>
                    <h2 className="text-base font-semibold text-zinc-100 mt-0.5">{proj.title}</h2>
                    {proj.summary && (
                      <p className="text-xs text-zinc-400 mt-1">{proj.summary}</p>
                    )}
                  </div>

                  {hasAccess && (
                    <div className="flex items-center gap-2 shrink-0 text-xs">
                      <button
                        onClick={() => openEditProject(proj)}
                        className="px-2.5 py-1 rounded bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-zinc-200"
                      >
                        Editar Projeto
                      </button>
                      <button
                        onClick={() => deleteProject(proj.id)}
                        className="px-2.5 py-1 rounded bg-red-950/50 hover:bg-red-900/60 border border-red-900/50 text-red-300"
                      >
                        Excluir
                      </button>
                    </div>
                  )}
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 text-xs">
                  {/* Coluna 1: Equipe (Sigilo Absoluto de Bolsa) */}
                  <div className="space-y-2.5">
                    <div className="text-zinc-400 font-medium">
                      Coorientador:{" "}
                      <span className="text-zinc-200 font-normal">
                        {coAdvisorName || "Nenhum coorientador designado"}
                      </span>
                    </div>

                    <div className="text-zinc-400 font-medium pt-1">
                      Pesquisadores Integrantes ({proj.members.length}):
                    </div>
                    {proj.members.length === 0 ? (
                      <p className="text-zinc-500">Nenhum pesquisador vinculado.</p>
                    ) : (
                      <div className="divide-y divide-zinc-800/60 bg-zinc-900/40 border border-zinc-800/80 rounded px-3">
                        {proj.members.map((pm) => {
                          const memberObj = members.find((m) => m.id === pm.profileId);
                          // Sigilo estrito: somente Diretora, Coord. Geral e o próprio bolsista sabem que há bolsa e o valor!
                          const showScholarship =
                            canSeeScholarshipValue(pm.profileId) &&
                            pm.roleInProject === "BOLSISTA";
                          const vigencia = showScholarship
                            ? getScholarshipVigenciaStatus(
                                pm.scholarshipStartMonth,
                                pm.scholarshipEndMonth,
                                proj.status
                              )
                            : null;

                          return (
                            <div
                              key={pm.profileId}
                              className="py-2.5 flex flex-col sm:flex-row sm:items-center justify-between gap-2"
                            >
                              <div>
                                <span className="text-zinc-200 font-medium">
                                  {memberObj?.name || pm.profileId}
                                </span>
                                {memberObj?.course && (
                                  <span className="text-[11px] text-zinc-500 ml-2">
                                    ({memberObj.course})
                                  </span>
                                )}
                              </div>
                              {showScholarship && (
                                <div className="flex flex-wrap items-center gap-1.5 sm:justify-end">
                                  <span
                                    className={`px-1.5 py-0.5 rounded border text-[10px] font-medium ${
                                      vigencia?.isActiveNow
                                        ? "bg-emerald-950/60 border-emerald-800/50 text-emerald-300"
                                        : "bg-zinc-900 border-zinc-700 text-zinc-400"
                                    }`}
                                  >
                                    Bolsista · {vigencia?.label}
                                  </span>
                                  {pm.monthlyScholarshipBRL && (
                                    <span
                                      className={`font-semibold ${
                                        vigencia?.isActiveNow
                                          ? "text-emerald-400"
                                          : "text-zinc-400 line-through"
                                      }`}
                                    >
                                      R$ {pm.monthlyScholarshipBRL.toLocaleString("pt-BR")}/mês
                                    </span>
                                  )}
                                  {(pm.scholarshipStartMonth ||
                                    pm.scholarshipEndMonth ||
                                    pm.scholarshipInstallments) && (
                                    <span className="text-[11px] text-zinc-400">
                                      (
                                      {pm.scholarshipStartMonth
                                        ? formatMonthYearBR(pm.scholarshipStartMonth)
                                        : "—"}{" "}
                                      até{" "}
                                      {pm.scholarshipEndMonth
                                        ? formatMonthYearBR(pm.scholarshipEndMonth)
                                        : "—"}
                                      {pm.scholarshipInstallments
                                        ? ` · ${pm.scholarshipInstallments} parcelas`
                                        : ""}
                                      )
                                    </span>
                                  )}
                                </div>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>

                  {/* Coluna 2: Entregas e Arquivos Dinâmicos do Projeto */}
                  <div className="space-y-2.5">
                    <div className="flex items-center justify-between">
                      <span className="text-zinc-400 font-medium">
                        Entregas, Relatórios e Arquivos ({proj.deliverables.length})
                      </span>
                      {hasAccess && (
                        <button
                          onClick={() => openCreateDeliverable(proj.id)}
                          className="px-2.5 py-1 rounded bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-emerald-400 font-medium"
                        >
                          + Cadastrar Entrega / Arquivo
                        </button>
                      )}
                    </div>

                    {proj.deliverables.length === 0 ? (
                      <p className="text-zinc-500 bg-zinc-900/30 border border-zinc-800/60 rounded p-3">
                        Nenhuma entrega ou arquivo cadastrado neste projeto.
                      </p>
                    ) : (
                      <div className="divide-y divide-zinc-800/60 bg-zinc-900/40 border border-zinc-800/80 rounded px-3">
                        {proj.deliverables.map((del) => (
                          <div key={del.id} className="py-3 space-y-2">
                            <div className="flex items-start justify-between gap-2">
                              <div>
                                <div className="text-zinc-100 font-medium">{del.title}</div>
                                {del.description && (
                                  <p className="text-[11px] text-zinc-400">{del.description}</p>
                                )}
                                <div className="text-[11px] text-zinc-500 mt-0.5">
                                  {del.dueDate ? `Prazo: ${formatDateBR(del.dueDate)} · ` : ""}Status:{" "}
                                  <span className="text-emerald-400">
                                    {DELIVERABLE_STATUS_LABELS[del.status] || del.status}
                                  </span>
                                </div>
                              </div>
                              {hasAccess && (
                                <div className="flex items-center gap-1.5 shrink-0">
                                  <button
                                    onClick={() => openEditDeliverable(proj.id, del)}
                                    className="px-2 py-1 rounded bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-[11px]"
                                  >
                                    Editar / Anexar PDF
                                  </button>
                                  <button
                                    onClick={() => deleteProjectDeliverable(proj.id, del.id)}
                                    className="px-2 py-1 rounded bg-red-950/50 text-red-300 text-[11px]"
                                  >
                                    Excluir
                                  </button>
                                </div>
                              )}
                            </div>

                            {del.attachments && del.attachments.length > 0 && (
                              <div className="flex flex-wrap gap-2 pt-1">
                                {del.attachments.map((att) => (
                                  <a
                                    key={att.id}
                                    href={att.url}
                                    target="_blank"
                                    rel="noreferrer"
                                    className="px-2 py-1 rounded bg-zinc-950 border border-zinc-800 text-[11px] text-emerald-400 hover:underline"
                                  >
                                    [{att.fileType === "PDF_UPLOAD" ? "PDF" : "Link"}] {att.label} ↗
                                  </a>
                                ))}
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                {/* Bloco de Notas Compartilhado do Projeto (Visível apenas para membros do projeto / Admin) */}
                {hasAccess && (
                  <div className="pt-4 border-t border-zinc-800/80 space-y-2 text-xs">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="font-semibold text-zinc-200">
                          Bloco de Notas e Observações do Projeto
                        </h3>
                        <p className="text-[11px] text-zinc-500">
                          Espaço compartilhado entre os integrantes deste projeto para registrar anotações de reuniões, parâmetros técnicos, pendências e links úteis.
                        </p>
                      </div>
                      <div className="flex items-center gap-3">
                        {notesSavedBanner === proj.id && (
                          <span className="text-emerald-400 font-medium">
                            Anotações salvas!
                          </span>
                        )}
                        <button
                          onClick={() => handleSaveNotes(proj.id, proj.notes || "")}
                          className="px-3 py-1.5 rounded bg-emerald-600 hover:bg-emerald-500 text-white font-medium"
                        >
                          Salvar Bloco de Notas
                        </button>
                      </div>
                    </div>
                    <textarea
                      rows={6}
                      value={currentNotes}
                      onChange={(e) =>
                        setNotesDraftByProj((prev) => ({
                          ...prev,
                          [proj.id]: e.target.value,
                        }))
                      }
                      placeholder="Escreva aqui anotações de reuniões, decisões de projeto, configurações de bancada ou lembretes..."
                      className="w-full bg-zinc-950/80 border border-zinc-800 rounded-lg p-3 text-xs text-zinc-100 leading-relaxed focus:outline-none focus:border-zinc-600"
                    />
                  </div>
                )}
              </div>
            );
          })}
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
                  <label className="block text-zinc-400 mb-1">
                    Edital / Agência *
                  </label>
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

      {/* Modal Cadastrar / Editar Entrega ou Arquivo do Projeto */}
      {activeDelivProjId && (
        <div className="fixed inset-0 z-50 bg-black/75 flex items-center justify-center p-4">
          <div className="bg-[#111318] border border-zinc-800 rounded-lg max-w-lg w-full p-6 space-y-4 max-h-[90vh] overflow-y-auto text-xs">
            <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
              <h2 className="text-sm font-semibold text-zinc-100">
                {editingDeliverableId
                  ? "Editar Entrega / Anexar Arquivos"
                  : "Cadastrar Entrega ou Arquivo do Projeto"}
              </h2>
              <button
                onClick={() => setActiveDelivProjId(null)}
                className="text-zinc-400 hover:text-zinc-200"
              >
                Fechar
              </button>
            </div>

            <form onSubmit={handleSaveDeliverable} className="space-y-3.5">
              <div>
                <label className="block text-zinc-400 mb-1">
                  Título da Entrega / Documento *
                </label>
                <input
                  type="text"
                  required
                  value={delTitle}
                  onChange={(e) => setDelTitle(e.target.value)}
                  placeholder="Ex.: Relatório Parcial, Esquema Elétrico, Dataset, Artigo..."
                  className="w-full bg-zinc-900 border border-zinc-800 rounded px-3 py-2 text-zinc-100"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-zinc-400 mb-1">Prazo / Data (Opcional)</label>
                  <input
                    type="date"
                    value={delDueDate}
                    onChange={(e) => setDelDueDate(e.target.value)}
                    className="w-full bg-zinc-900 border border-zinc-800 rounded px-3 py-2 text-zinc-100"
                  />
                </div>
                <div>
                  <label className="block text-zinc-400 mb-1">Status</label>
                  <select
                    value={delStatus}
                    onChange={(e) =>
                      setDelStatus(e.target.value as ProjectDeliverable["status"])
                    }
                    className="w-full bg-zinc-900 border border-zinc-800 rounded px-3 py-2 text-zinc-100"
                  >
                    <option value="PENDENTE">Pendente</option>
                    <option value="ENTREGUE">Entregue</option>
                    <option value="VALIDADO">Validado pela Orientação</option>
                    <option value="ATRASADO">Em Atraso</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-zinc-400 mb-1">Observações / Descrição</label>
                <input
                  type="text"
                  value={delDesc}
                  onChange={(e) => setDelDesc(e.target.value)}
                  placeholder="Detalhes sobre esta entrega..."
                  className="w-full bg-zinc-900 border border-zinc-800 rounded px-3 py-2 text-zinc-100"
                />
              </div>

              <AttachmentManager
                attachments={delAttachments}
                onChange={setDelAttachments}
                bucket="relatorios-projetos"
                label="Arquivos PDF ou Links desta Entrega"
              />

              <div className="flex justify-end gap-2 pt-3 border-t border-zinc-800">
                <button
                  type="button"
                  onClick={() => setActiveDelivProjId(null)}
                  className="px-3 py-1.5 rounded bg-zinc-800 text-zinc-300"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 rounded bg-emerald-600 hover:bg-emerald-500 text-white font-medium"
                >
                  Salvar Entrega
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
