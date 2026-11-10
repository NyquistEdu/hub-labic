"use client";

import React, { useState, useMemo } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { useLabic } from "@/context/LabicContext";
import {
  calculateInstallmentsBetween,
  DELIVERABLE_STATUS_LABELS,
  formatDateBR,
  formatMeetingDateTime,
  formatMonthYearBR,
  getScholarshipVigenciaStatus,
  LabicAttachment,
  LabicProject,
  parseProjectNotes,
  PROJECT_STATUS_LABELS,
  ProjectDeliverable,
  ProjectNoteItem,
  serializeProjectNotes,
} from "@/types/labic";
import { AttachmentManager } from "@/components/AttachmentManager";

export default function ProjetoDetalhePage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const projectId = params?.id || "";

  const {
    projects,
    members,
    currentUser,
    canSeeScholarshipValue,
    canAccessProject,
    updateProject,
    deleteProject,
    updateProjectNotes,
    addProjectDeliverable,
    updateProjectDeliverable,
    deleteProjectDeliverable,
  } = useLabic();

  const proj = useMemo(
    () => projects.find((p) => p.id === projectId),
    [projects, projectId]
  );
  const hasAccess = canAccessProject(projectId);

  // Modal de Edição dos Dados do Projeto
  const [showEditProjectModal, setShowEditProjectModal] = useState(false);
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

  // Modal de Entrega / Arquivo do Projeto
  const [showDeliverableModal, setShowDeliverableModal] = useState(false);
  const [editingDeliverableId, setEditingDeliverableId] = useState<string | null>(null);
  const [delTitle, setDelTitle] = useState("");
  const [delDesc, setDelDesc] = useState("");
  const [delDueDate, setDelDueDate] = useState("");
  const [delStatus, setDelStatus] = useState<ProjectDeliverable["status"]>("PENDENTE");
  const [delAttachments, setDelAttachments] = useState<LabicAttachment[]>([]);

  // Bloco de Notas Histórico / Diário de Bordo
  const [newNoteText, setNewNoteText] = useState("");
  const [noteFeedback, setNoteFeedback] = useState(false);

  const parsedNotes = useMemo(() => {
    return parseProjectNotes(proj?.notes);
  }, [proj?.notes]);

  if (!proj) {
    return (
      <div className="space-y-4">
        <Link href="/app/projetos" className="text-xs text-zinc-400 hover:text-zinc-200">
          ← Voltar para lista de Projetos
        </Link>
        <div className="bg-[#111318] border border-zinc-800 rounded-lg p-6 text-xs text-zinc-400">
          Projeto não encontrado.
        </div>
      </div>
    );
  }

  if (!hasAccess) {
    return (
      <div className="space-y-4">
        <Link href="/app/projetos" className="text-xs text-zinc-400 hover:text-zinc-200">
          ← Voltar para lista de Projetos
        </Link>
        <div className="bg-[#111318] border border-red-900/50 rounded-lg p-6 text-xs text-red-300 space-y-1">
          <div className="font-semibold text-sm">Acesso Restrito</div>
          <p>
            Você não faz parte da equipe deste projeto ({proj.title}). Apenas os membros vinculados (Orientador, Coorientador, Integrantes) e a Coordenação Geral / Diretoria possuem permissão de acesso.
          </p>
        </div>
      </div>
    );
  }

  const advisorMember = members.find((m) => m.id === proj.advisorId);
  const coAdvisorMember = proj.coAdvisorId
    ? members.find((m) => m.id === proj.coAdvisorId)
    : undefined;

  // --- Handlers para Edição de Projeto ---
  const openEditProject = () => {
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
    setShowEditProjectModal(true);
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
    if (!title.trim()) return;

    await updateProject(proj.id, {
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

    setShowEditProjectModal(false);
  };

  // --- Handlers para Entregas ---
  const openCreateDeliverable = () => {
    setEditingDeliverableId(null);
    setDelTitle("");
    setDelDesc("");
    setDelDueDate("");
    setDelStatus("PENDENTE");
    setDelAttachments([]);
    setShowDeliverableModal(true);
  };

  const openEditDeliverable = (del: ProjectDeliverable) => {
    setEditingDeliverableId(del.id);
    setDelTitle(del.title);
    setDelDesc(del.description || "");
    setDelDueDate(del.dueDate);
    setDelStatus(del.status);
    setDelAttachments(del.attachments || []);
    setShowDeliverableModal(true);
  };

  const handleSaveDeliverable = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!delTitle.trim()) return;

    const finalStatus =
      delAttachments.length > 0 && delStatus === "PENDENTE" ? "ENTREGUE" : delStatus;

    if (editingDeliverableId) {
      await updateProjectDeliverable(proj.id, editingDeliverableId, {
        title: delTitle.trim(),
        description: delDesc.trim(),
        dueDate: delDueDate,
        status: finalStatus,
        attachments: delAttachments,
        fileName: delAttachments[0]?.url || undefined,
      });
    } else {
      await addProjectDeliverable(proj.id, {
        title: delTitle.trim(),
        description: delDesc.trim(),
        type: "DOCUMENTO_OPCIONAL",
        dueDate: delDueDate,
        status: finalStatus,
        attachments: delAttachments,
        fileName: delAttachments[0]?.url || undefined,
      });
    }

    setShowDeliverableModal(false);
    setEditingDeliverableId(null);
  };

  // --- Handlers para Bloco de Notas Cronológico ---
  const handleAddNote = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newNoteText.trim() || !currentUser) return;

    const now = new Date();
    const dateFormatted = `${String(now.getDate()).padStart(2, "0")}/${String(
      now.getMonth() + 1
    ).padStart(2, "0")}/${now.getFullYear()}`;
    const timeFormatted = `${String(now.getHours()).padStart(2, "0")}:${String(
      now.getMinutes()
    ).padStart(2, "0")}`;

    const newNote: ProjectNoteItem = {
      id: `note-${Date.now()}`,
      text: newNoteText.trim(),
      authorId: currentUser.id,
      authorName: currentUser.name,
      createdAt: `${dateFormatted} às ${timeFormatted}`,
    };

    const nextNotes = [newNote, ...parsedNotes];
    await updateProjectNotes(proj.id, serializeProjectNotes(nextNotes));
    setNewNoteText("");
    setNoteFeedback(true);
    setTimeout(() => setNoteFeedback(false), 2500);
  };

  const handleDeleteNote = async (noteId: string) => {
    const nextNotes = parsedNotes.filter((n) => n.id !== noteId);
    await updateProjectNotes(proj.id, serializeProjectNotes(nextNotes));
  };

  const handleDeleteEntireProject = async () => {
    if (confirm(`Tem certeza que deseja excluir o projeto "${proj.title}"?`)) {
      await deleteProject(proj.id);
      router.push("/app/projetos");
    }
  };

  return (
    <div className="space-y-6">
      {/* Barra de Navegação e Cabeçalho do Projeto */}
      <div className="border-b border-zinc-800/80 pb-4 space-y-2">
        <Link
          href="/app/projetos"
          className="text-xs text-zinc-400 hover:text-zinc-200 inline-block mb-1"
        >
          ← Voltar para lista de Projetos
        </Link>

        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-xs font-semibold text-emerald-400">
                {proj.fundingAgency}
              </span>
              <span className="text-xs text-zinc-600">·</span>
              <span className="text-xs text-zinc-400">Ano: {proj.year}</span>
              <span className="text-xs text-zinc-600">·</span>
              <span className="text-[11px] px-2 py-0.5 rounded bg-zinc-900 border border-zinc-800 text-zinc-200 font-medium">
                {PROJECT_STATUS_LABELS[proj.status] || proj.status}
              </span>
              {proj.code && (
                <>
                  <span className="text-xs text-zinc-600">·</span>
                  <span className="text-[11px] text-zinc-500 font-mono">{proj.code}</span>
                </>
              )}
              {proj.showOnPublicShowcase && (
                <>
                  <span className="text-xs text-zinc-600">·</span>
                  <span className="text-[11px] text-zinc-400">Visível na Vitrine</span>
                </>
              )}
            </div>

            <h1 className="text-lg sm:text-xl font-semibold text-zinc-100 mt-1">
              {proj.title}
            </h1>

            {proj.summary && (
              <p className="text-xs text-zinc-400 mt-1.5 leading-relaxed max-w-4xl">
                {proj.summary}
              </p>
            )}

            <div className="flex flex-wrap items-center gap-4 text-xs text-zinc-400 pt-2">
              <div>
                Orientador:{" "}
                <span className="text-zinc-200 font-medium">
                  {advisorMember?.name || "Diretoria / Coordenação"}
                </span>
              </div>
              <div>
                Coorientador:{" "}
                <span className="text-zinc-200 font-medium">
                  {coAdvisorMember?.name || "Nenhum"}
                </span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={openEditProject}
              className="px-3 py-1.5 rounded bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-zinc-200 text-xs font-medium transition-colors"
            >
              Editar Projeto
            </button>
            <button
              onClick={handleDeleteEntireProject}
              className="px-3 py-1.5 rounded bg-red-950/50 hover:bg-red-900/60 border border-red-900/50 text-red-300 text-xs font-medium transition-colors"
            >
              Excluir
            </button>
          </div>
        </div>
      </div>

      {/* Grid de 2 Colunas: Equipe e Entregas */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 text-xs">
        {/* Seção 1: Equipe e Bolsas (com Sigilo Absoluto) */}
        <div className="bg-[#111318] border border-zinc-800/80 rounded-lg p-5 space-y-3">
          <div className="flex items-center justify-between border-b border-zinc-800/60 pb-2.5">
            <div>
              <h2 className="text-sm font-semibold text-zinc-100">
                Pesquisadores Integrantes ({proj.members.length})
              </h2>
              <p className="text-[11px] text-zinc-500">
                Pesquisadores voluntários e bolsistas vinculados a este projeto.
              </p>
            </div>
          </div>

          {proj.members.length === 0 ? (
            <p className="text-zinc-500 py-2">Nenhum pesquisador vinculado a este projeto.</p>
          ) : (
            <div className="divide-y divide-zinc-800/60">
              {proj.members.map((pm) => {
                const memberObj = members.find((m) => m.id === pm.profileId);
                const showScholarship =
                  canSeeScholarshipValue(pm.profileId) && pm.roleInProject === "BOLSISTA";
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
                    className="py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2"
                  >
                    <div>
                      <div className="font-medium text-zinc-200 text-sm">
                        {memberObj?.name || pm.profileId}
                      </div>
                      <div className="text-[11px] text-zinc-500">
                        {memberObj?.course || memberObj?.degreeLevel} · {memberObj?.institution}
                      </div>
                    </div>

                    {showScholarship ? (
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
                          <span className="text-[11px] text-zinc-400 block sm:inline">
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
                    ) : (
                      <span className="text-[11px] px-2 py-0.5 rounded bg-zinc-900 border border-zinc-800 text-zinc-400">
                        Pesquisador Integrante
                      </span>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Seção 2: Entregas, Relatórios e Arquivos do Projeto */}
        <div className="bg-[#111318] border border-zinc-800/80 rounded-lg p-5 space-y-3">
          <div className="flex items-center justify-between border-b border-zinc-800/60 pb-2.5">
            <div>
              <h2 className="text-sm font-semibold text-zinc-100">
                Entregas, Relatórios e Arquivos ({proj.deliverables.length})
              </h2>
              <p className="text-[11px] text-zinc-500">
                Prazos, relatórios parciais, artigos e PDFs do projeto.
              </p>
            </div>
            <button
              onClick={openCreateDeliverable}
              className="px-2.5 py-1.5 rounded bg-emerald-600 hover:bg-emerald-500 text-white font-medium text-xs transition-colors shrink-0"
            >
              + Nova Entrega / Arquivo
            </button>
          </div>

          {proj.deliverables.length === 0 ? (
            <p className="text-zinc-500 py-3">
              Nenhuma entrega ou arquivo cadastrado neste projeto. Clique em &ldquo;+ Nova Entrega / Arquivo&rdquo; para registrar relatórios ou documentos.
            </p>
          ) : (
            <div className="divide-y divide-zinc-800/60">
              {proj.deliverables.map((del) => (
                <div key={del.id} className="py-3 space-y-2">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <div className="text-zinc-100 font-medium text-sm">{del.title}</div>
                      {del.description && (
                        <p className="text-[11px] text-zinc-400 mt-0.5">{del.description}</p>
                      )}
                      <div className="text-[11px] text-zinc-500 mt-1">
                        {del.dueDate ? `Prazo: ${formatDateBR(del.dueDate)} · ` : ""}Status:{" "}
                        <span className="text-emerald-400 font-medium">
                          {DELIVERABLE_STATUS_LABELS[del.status] || del.status}
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center gap-1.5 shrink-0">
                      <button
                        onClick={() => openEditDeliverable(del)}
                        className="px-2 py-1 rounded bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-[11px]"
                      >
                        Editar / Anexar
                      </button>
                      <button
                        onClick={() => deleteProjectDeliverable(proj.id, del.id)}
                        className="px-2 py-1 rounded bg-red-950/50 text-red-300 hover:bg-red-900/60 text-[11px]"
                      >
                        Excluir
                      </button>
                    </div>
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

      {/* Seção 3: Bloco de Notas / Diário de Bordo Cronológico do Projeto */}
      <div className="bg-[#111318] border border-zinc-800/80 rounded-lg p-5 space-y-4 text-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-zinc-800/60 pb-3">
          <div>
            <h2 className="text-sm font-semibold text-zinc-100">
              Bloco de Notas e Diário do Projeto ({parsedNotes.length} anotação(ões))
            </h2>
            <p className="text-[11px] text-zinc-400 mt-0.5">
              Espaço compartilhado entre os integrantes para registrar anotações com data e autor, mantendo o histórico de reuniões, parâmetros e decisões de forma organizada.
            </p>
          </div>
          {noteFeedback && (
            <span className="text-emerald-400 font-medium text-xs">
              Anotação adicionada com sucesso!
            </span>
          )}
        </div>

        {/* Formulário para Adicionar Nova Anotação */}
        <form onSubmit={handleAddNote} className="space-y-2">
          <textarea
            rows={3}
            required
            value={newNoteText}
            onChange={(e) => setNewNoteText(e.target.value)}
            placeholder="Digite uma nova anotação sobre reuniões, parâmetros técnicos, decisões ou lembretes da equipe..."
            className="w-full bg-zinc-950/80 border border-zinc-800 rounded-lg p-3 text-xs text-zinc-100 leading-relaxed focus:outline-none focus:border-zinc-600"
          />
          <div className="flex justify-end">
            <button
              type="submit"
              className="px-3.5 py-1.5 rounded bg-emerald-600 hover:bg-emerald-500 text-white font-medium transition-colors"
            >
              + Adicionar Nota ao Projeto
            </button>
          </div>
        </form>

        {/* Histórico Cronológico de Notas */}
        {parsedNotes.length === 0 ? (
          <p className="text-zinc-500 py-3">
            Nenhuma anotação adicionada ainda. Escreva no campo acima para inaugurar o diário deste projeto.
          </p>
        ) : (
          <div className="space-y-2.5 pt-2">
            {parsedNotes.map((note) => (
              <div
                key={note.id}
                className="p-3 rounded-lg bg-zinc-900/60 border border-zinc-800/80 space-y-1.5"
              >
                <div className="flex items-center justify-between text-[11px] text-zinc-400">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-zinc-200">
                      {note.authorName || "Membro da Equipe"}
                    </span>
                    {note.createdAt && (
                      <>
                        <span className="text-zinc-600">·</span>
                        <span>{note.createdAt}</span>
                      </>
                    )}
                  </div>
                  <button
                    type="button"
                    onClick={() => handleDeleteNote(note.id)}
                    className="text-zinc-500 hover:text-red-400 transition-colors"
                    title="Excluir esta nota"
                  >
                    Excluir
                  </button>
                </div>
                <p className="text-zinc-100 text-xs whitespace-pre-wrap leading-relaxed">
                  {note.text}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Modal Editar Dados do Projeto */}
      {showEditProjectModal && (
        <div className="fixed inset-0 z-50 bg-black/75 flex items-center justify-center p-4">
          <div className="bg-[#111318] border border-zinc-800 rounded-lg max-w-xl w-full p-6 space-y-4 max-h-[90vh] overflow-y-auto text-xs">
            <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
              <h2 className="text-sm font-semibold text-zinc-100">Editar Projeto</h2>
              <button
                onClick={() => setShowEditProjectModal(false)}
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
                  rows={3}
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
                  onClick={() => setShowEditProjectModal(false)}
                  className="px-3 py-1.5 rounded bg-zinc-800 text-zinc-300"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 rounded bg-emerald-600 hover:bg-emerald-500 text-white font-medium"
                >
                  Salvar Alterações
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Criar / Editar Entrega do Projeto */}
      {showDeliverableModal && (
        <div className="fixed inset-0 z-50 bg-black/75 flex items-center justify-center p-4">
          <div className="bg-[#111318] border border-zinc-800 rounded-lg max-w-lg w-full p-6 space-y-4 max-h-[90vh] overflow-y-auto text-xs">
            <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
              <h2 className="text-sm font-semibold text-zinc-100">
                {editingDeliverableId
                  ? "Editar Entrega / Anexar Arquivos"
                  : "Cadastrar Entrega ou Arquivo do Projeto"}
              </h2>
              <button
                onClick={() => setShowDeliverableModal(false)}
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
                  onClick={() => setShowDeliverableModal(false)}
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
