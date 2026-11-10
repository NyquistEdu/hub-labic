"use client";

import React, { useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { useLabic } from "@/context/LabicContext";
import {
  ConferenceSubmission,
  LabicMilestone,
  SubmissionStatus,
  SUBMISSION_STATUS_LABELS,
} from "@/types/labic";

export default function CongressoDetalhePage() {
  const params = useParams<{ id: string }>();
  const confId = params?.id || "";

  const {
    conferences,
    submissions,
    members,
    currentUser,
    uploadFileToStorage,
    updateConference,
    addSubmission,
    updateSubmission,
    deleteSubmission,
    addSubmissionVersion,
    deleteSubmissionVersion,
  } = useLabic();

  const conf = conferences.find((c) => c.id === confId);
  const confSubs = submissions.filter((s) => s.conferenceId === confId);

  // Estado para Cronograma Interno de Metas (Introdução, Desenvolvimento, etc.)
  const [msTitle, setMsTitle] = useState("");
  const [msDueDate, setMsDueDate] = useState("");
  const [msDesc, setMsDesc] = useState("");

  // Modal de Artigo / Submissão (Criar / Editar)
  const [showSubModal, setShowSubModal] = useState(false);
  const [editingSubId, setEditingSubId] = useState<string | null>(null);
  const [subTitle, setSubTitle] = useState("");
  const [primaryAuthorId, setPrimaryAuthorId] = useState(currentUser?.id || "");
  const [subAuthors, setSubAuthors] = useState<string[]>(
    currentUser ? [currentUser.id] : []
  );
  const [subReviewers, setSubReviewers] = useState<string[]>([]);
  const [subStatus, setSubStatus] = useState<SubmissionStatus>("RASCUNHO");
  const [initialPdfUrl, setInitialPdfUrl] = useState("");
  const [initialPdfName, setInitialPdfName] = useState("");
  const [uploadingInitial, setUploadingInitial] = useState(false);

  // Modal para Adicionar Nova Versão / Correção em PDF
  const [versionModalSubId, setVersionModalSubId] = useState<string | null>(null);
  const [verLabel, setVerLabel] = useState("");
  const [verRole, setVerRole] = useState<"AUTOR" | "REVISOR">("AUTOR");
  const [verNotes, setVerNotes] = useState("");
  const [verFileUrl, setVerFileUrl] = useState("");
  const [verFileName, setVerFileName] = useState("");
  const [uploadingVer, setUploadingVer] = useState(false);

  // Parecer geral rápido por submissão
  const [generalNotesDraft, setGeneralNotesDraft] = useState<Record<string, string>>({});

  if (!conf) {
    return (
      <div className="space-y-4">
        <Link href="/app/congressos" className="text-xs text-zinc-400 hover:text-zinc-200">
          ← Voltar para Congressos
        </Link>
        <div className="bg-[#111318] border border-zinc-800 rounded-lg p-6 text-xs text-zinc-400">
          Congresso não encontrado.
        </div>
      </div>
    );
  }

  // --- Cronograma Interno de Metas do Congresso ---
  const handleAddMilestone = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!msTitle.trim() || !msDueDate) return;
    const newMs: LabicMilestone = {
      id: `ms-${Date.now()}`,
      title: msTitle.trim(),
      dueDate: msDueDate,
      description: msDesc.trim() || undefined,
      completed: false,
    };
    await updateConference(conf.id, {
      milestones: [...(conf.milestones || []), newMs],
    });
    setMsTitle("");
    setMsDueDate("");
    setMsDesc("");
  };

  const toggleMilestone = async (msId: string) => {
    const next = (conf.milestones || []).map((m) =>
      m.id === msId ? { ...m, completed: !m.completed } : m
    );
    await updateConference(conf.id, { milestones: next });
  };

  const deleteMilestone = async (msId: string) => {
    const next = (conf.milestones || []).filter((m) => m.id !== msId);
    await updateConference(conf.id, { milestones: next });
  };

  // --- Submissões de Artigos (CRUD) ---
  const openCreateSub = () => {
    setEditingSubId(null);
    setSubTitle("");
    const defAuthor = currentUser?.id || members[0]?.id || "";
    setPrimaryAuthorId(defAuthor);
    setSubAuthors(defAuthor ? [defAuthor] : []);
    setSubReviewers([]);
    setSubStatus("RASCUNHO");
    setInitialPdfUrl("");
    setInitialPdfName("");
    setShowSubModal(true);
  };

  const openEditSub = (sub: ConferenceSubmission) => {
    setEditingSubId(sub.id);
    setSubTitle(sub.title);
    const prim = sub.primaryAuthorId || sub.authorIds[0] || "";
    setPrimaryAuthorId(prim);
    setSubAuthors(sub.authorIds);
    setSubReviewers(sub.reviewerIds);
    setSubStatus(sub.status);
    setInitialPdfUrl("");
    setInitialPdfName("");
    setShowSubModal(true);
  };

  const handleInitialPdfUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadingInitial(true);
    const url = await uploadFileToStorage("artigos-congressos", file);
    setUploadingInitial(false);
    setInitialPdfUrl(url);
    setInitialPdfName(file.name);
  };

  const handleSaveSubmission = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!subTitle.trim()) return;
    const finalAuthors = primaryAuthorId
      ? Array.from(new Set([primaryAuthorId, ...subAuthors]))
      : subAuthors;

    if (editingSubId) {
      await updateSubmission(editingSubId, {
        title: subTitle.trim(),
        primaryAuthorId: primaryAuthorId || finalAuthors[0],
        authorIds: finalAuthors,
        reviewerIds: subReviewers,
        status: subStatus,
      });
    } else {
      const initialVersions = initialPdfUrl
        ? [
            {
              id: `ver-${Date.now()}`,
              versionLabel: "1ª Versão Inicial",
              fileUrl: initialPdfUrl,
              fileName: initialPdfName || "versao_inicial.pdf",
              notes: "Versão inicial cadastrada pelo autor.",
              uploadedById: currentUser?.id || "",
              uploadedByName: currentUser?.name || "Autor",
              role: "AUTOR" as const,
              createdAt: new Date().toISOString().slice(0, 10),
            },
          ]
        : [];

      await addSubmission({
        conferenceId: conf.id,
        title: subTitle.trim(),
        primaryAuthorId: primaryAuthorId || finalAuthors[0],
        authorIds: finalAuthors,
        reviewerIds: subReviewers,
        status: subStatus,
        fileName: initialPdfUrl || "Pendente de PDF",
        versionLabel: initialVersions.length > 0 ? "1ª Versão Inicial" : "Rascunho",
        reviewNotes: "",
        versions: initialVersions,
      });
    }

    setShowSubModal(false);
  };

  // --- Adicionar Nova Versão / Correção em PDF ---
  const openVersionModal = (subId: string, defaultRole: "AUTOR" | "REVISOR") => {
    setVersionModalSubId(subId);
    setVerRole(defaultRole);
    setVerLabel(
      defaultRole === "REVISOR"
        ? "Parecer / PDF Corrigido pelo Revisor"
        : "Nova Versão Corrigida pelo Autor"
    );
    setVerNotes("");
    setVerFileUrl("");
    setVerFileName("");
  };

  const handleVersionPdfUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadingVer(true);
    const url = await uploadFileToStorage("artigos-congressos", file);
    setUploadingVer(false);
    setVerFileUrl(url);
    setVerFileName(file.name);
  };

  const handleSaveVersion = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!versionModalSubId || !verLabel.trim() || !verFileUrl.trim()) return;
    await addSubmissionVersion(versionModalSubId, {
      versionLabel: verLabel.trim(),
      fileUrl: verFileUrl.trim(),
      fileName: verFileName || verLabel.trim(),
      notes: verNotes.trim(),
      uploadedById: currentUser?.id || "",
      uploadedByName: currentUser?.name || "Membro",
      role: verRole,
    });
    setVersionModalSubId(null);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-zinc-800/80 pb-4">
        <div>
          <Link
            href="/app/congressos"
            className="text-xs text-zinc-400 hover:text-zinc-200 inline-block mb-1"
          >
            ← Voltar para lista de Congressos
          </Link>
          <div className="flex items-center gap-2">
            <span className="px-2 py-0.5 rounded bg-emerald-950/60 border border-emerald-800/50 text-xs text-emerald-400 font-semibold">
              {conf.acronym}
            </span>
            <h1 className="text-lg font-semibold text-zinc-100">{conf.name}</h1>
          </div>
          <p className="text-xs text-zinc-400 mt-0.5">
            Local: {conf.location || "A definir"} · Revisão Interna até:{" "}
            {conf.internalReviewDeadline || "A definir"} · Deadline Oficial:{" "}
            {conf.officialSubmissionDeadline || "A definir"}
          </p>
        </div>

        <button
          onClick={openCreateSub}
          className="px-3.5 py-2 rounded bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-medium transition-colors shrink-0"
        >
          + Cadastrar Artigo neste Congresso
        </button>
      </div>

      {/* Seção 1: Cronograma Interno de Datas e Metas do Congresso */}
      <div className="bg-[#111318] border border-zinc-800/80 rounded-lg p-5 space-y-4 text-xs">
        <div>
          <h2 className="text-sm font-semibold text-zinc-100">
            Cronograma Interno de Metas do Congresso
          </h2>
          <p className="text-zinc-400 mt-0.5">
            Defina datas intermediárias para organizar a escrita da equipe (ex.: até data X entregar Introdução, até data Y entregar Desenvolvimento, até data Z entregar Versão Final).
          </p>
        </div>

        <form
          onSubmit={handleAddMilestone}
          className="grid grid-cols-1 sm:grid-cols-4 gap-2.5 items-end bg-zinc-900/50 border border-zinc-800 rounded p-3"
        >
          <div>
            <label className="block text-zinc-400 mb-1">Data Limite *</label>
            <input
              type="date"
              required
              value={msDueDate}
              onChange={(e) => setMsDueDate(e.target.value)}
              className="w-full bg-zinc-900 border border-zinc-800 rounded px-2.5 py-1.5 text-zinc-100"
            />
          </div>
          <div>
            <label className="block text-zinc-400 mb-1">Etapa / Meta *</label>
            <input
              type="text"
              required
              value={msTitle}
              onChange={(e) => setMsTitle(e.target.value)}
              placeholder="Ex.: Entrega da Introdução e Referencial"
              className="w-full bg-zinc-900 border border-zinc-800 rounded px-2.5 py-1.5 text-zinc-100"
            />
          </div>
          <div>
            <label className="block text-zinc-400 mb-1">Observação (Opcional)</label>
            <input
              type="text"
              value={msDesc}
              onChange={(e) => setMsDesc(e.target.value)}
              placeholder="Ex.: Mínimo de 2 páginas no template SBC"
              className="w-full bg-zinc-900 border border-zinc-800 rounded px-2.5 py-1.5 text-zinc-100"
            />
          </div>
          <button
            type="submit"
            className="px-3 py-1.5 rounded bg-zinc-800 hover:bg-zinc-700 text-zinc-100 font-medium"
          >
            + Adicionar Data / Meta
          </button>
        </form>

        {(!conf.milestones || conf.milestones.length === 0) ? (
          <p className="text-zinc-500">Nenhuma data intermediária definida ainda.</p>
        ) : (
          <div className="divide-y divide-zinc-800/60">
            {conf.milestones.map((ms) => (
              <div
                key={ms.id}
                className="py-2.5 flex items-center justify-between gap-3"
              >
                <label className="flex items-center gap-2.5 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={ms.completed}
                    onChange={() => toggleMilestone(ms.id)}
                  />
                  <div>
                    <span
                      className={`font-medium ${
                        ms.completed ? "line-through text-zinc-500" : "text-zinc-100"
                      }`}
                    >
                      Até {ms.dueDate}: {ms.title}
                    </span>
                    {ms.description && (
                      <span className="text-zinc-500 ml-2">— {ms.description}</span>
                    )}
                  </div>
                </label>
                <button
                  onClick={() => deleteMilestone(ms.id)}
                  className="text-zinc-500 hover:text-red-400"
                >
                  Excluir
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Seção 2: Artigos Submetidos e Rodadas de Revisão em PDF */}
      <div className="space-y-4">
        <h2 className="text-sm font-semibold text-zinc-100">
          Artigos em Preparação e Revisão ({confSubs.length})
        </h2>

        {confSubs.length === 0 ? (
          <div className="bg-[#111318] border border-zinc-800/80 rounded-lg p-6 text-xs text-zinc-500">
            Nenhum artigo cadastrado neste congresso. Clique em &ldquo;+ Cadastrar Artigo neste Congresso&rdquo; para iniciar.
          </div>
        ) : (
          confSubs.map((sub) => {
            const primId = sub.primaryAuthorId || sub.authorIds[0];
            const primAuthor = members.find((m) => m.id === primId);
            const coAuthors = sub.authorIds
              .filter((id) => id !== primId)
              .map((id) => members.find((m) => m.id === id)?.name)
              .filter(Boolean)
              .join(", ");
            const reviewers = sub.reviewerIds
              .map((id) => members.find((m) => m.id === id)?.name)
              .filter(Boolean)
              .join(", ");

            return (
              <div
                key={sub.id}
                className="bg-[#111318] border border-zinc-800/80 rounded-lg p-5 space-y-4 text-xs"
              >
                {/* Cabeçalho do Artigo + Checklist de Status + CRUD */}
                <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-3 border-b border-zinc-800/70 pb-3">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="px-2 py-0.5 rounded bg-emerald-950/60 border border-emerald-800/50 text-emerald-400 font-medium">
                        {SUBMISSION_STATUS_LABELS[sub.status] || sub.status}
                      </span>
                      <span className="text-zinc-500">Atualizado em {sub.updatedAt}</span>
                    </div>
                    <h3 className="text-base font-semibold text-zinc-100">{sub.title}</h3>
                    <p className="text-zinc-300">
                      <strong>Autor Principal:</strong> {primAuthor?.name || "—"}
                      {coAuthors ? ` · Coautores: ${coAuthors}` : ""}
                    </p>
                    <p className="text-zinc-400">
                      <strong>Revisores Internos Designados:</strong>{" "}
                      {reviewers || "Nenhum revisor designado"}
                    </p>
                  </div>

                  <div className="flex flex-wrap items-center gap-2 shrink-0">
                    <select
                      value={sub.status}
                      onChange={(e) =>
                        updateSubmission(sub.id, {
                          status: e.target.value as SubmissionStatus,
                        })
                      }
                      className="bg-zinc-900 border border-zinc-800 rounded px-2.5 py-1.5 text-zinc-100 font-medium"
                    >
                      {Object.entries(SUBMISSION_STATUS_LABELS).map(([k, label]) => (
                        <option key={k} value={k}>
                          Status: {label}
                        </option>
                      ))}
                    </select>

                    <button
                      onClick={() => openEditSub(sub)}
                      className="px-2.5 py-1.5 rounded bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-zinc-200"
                    >
                      Editar Dados / Revisores
                    </button>
                    <button
                      onClick={() => deleteSubmission(sub.id)}
                      className="px-2.5 py-1.5 rounded bg-red-950/50 border border-red-900/50 text-red-300"
                    >
                      Excluir Artigo
                    </button>
                  </div>
                </div>

                {/* Histórico de Versões em PDF (Autor <-> Revisor) */}
                <div className="space-y-2.5">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div>
                      <h4 className="font-semibold text-zinc-200">
                        Histórico de Arquivos PDF e Revisões ({sub.versions?.length || 0})
                      </h4>
                      <p className="text-[11px] text-zinc-500">
                        Baixe a versão atual, faça as correções e envie o novo PDF identificando se é uma entrega do Autor ou devolução corrigida pelo Revisor.
                      </p>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <button
                        onClick={() => openVersionModal(sub.id, "AUTOR")}
                        className="px-2.5 py-1.5 rounded bg-emerald-600 hover:bg-emerald-500 text-white font-medium"
                      >
                        + Enviar PDF do Autor (Nova Versão)
                      </button>
                      <button
                        onClick={() => openVersionModal(sub.id, "REVISOR")}
                        className="px-2.5 py-1.5 rounded bg-zinc-800 hover:bg-zinc-700 border border-zinc-700 text-zinc-100 font-medium"
                      >
                        + Enviar PDF Corrigido pelo Revisor
                      </button>
                    </div>
                  </div>

                  {(!sub.versions || sub.versions.length === 0) ? (
                    <p className="text-zinc-500 bg-zinc-900/40 border border-zinc-800/60 rounded p-3">
                      Nenhum PDF anexado ainda. Clique em &ldquo;+ Enviar PDF do Autor&rdquo; para subir a 1ª versão do artigo.
                    </p>
                  ) : (
                    <div className="divide-y divide-zinc-800/60 bg-zinc-900/40 border border-zinc-800 rounded px-3.5">
                      {sub.versions.map((ver, idx) => (
                        <div
                          key={ver.id}
                          className="py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2"
                        >
                          <div className="space-y-0.5">
                            <div className="flex items-center gap-2">
                              <span className="text-[11px] font-semibold text-zinc-400">
                                #{idx + 1}
                              </span>
                              <span
                                className={`px-1.5 py-0.5 rounded text-[10px] font-medium ${
                                  ver.role === "REVISOR"
                                    ? "bg-amber-950/60 border border-amber-800/50 text-amber-300"
                                    : "bg-emerald-950/60 border border-emerald-800/50 text-emerald-300"
                                }`}
                              >
                                {ver.role === "REVISOR" ? "REVISOR" : "AUTOR"}
                              </span>
                              <span className="font-semibold text-zinc-100">
                                {ver.versionLabel}
                              </span>
                              <span className="text-[11px] text-zinc-500">
                                · por {ver.uploadedByName} em {ver.createdAt}
                              </span>
                            </div>
                            {ver.notes && (
                              <p className="text-zinc-300 pl-6">
                                <span className="text-zinc-500">Observação: </span>
                                {ver.notes}
                              </p>
                            )}
                          </div>

                          <div className="flex items-center gap-3 shrink-0">
                            <a
                              href={ver.fileUrl}
                              target="_blank"
                              rel="noreferrer"
                              className="px-2.5 py-1 rounded bg-zinc-800 hover:bg-zinc-700 text-emerald-400 font-medium underline"
                            >
                              Baixar / Ler PDF ({ver.fileName}) ↗
                            </a>
                            <button
                              onClick={() => deleteSubmissionVersion(sub.id, ver.id)}
                              className="text-zinc-500 hover:text-red-400"
                            >
                              Excluir
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Parecer / Observação Geral Rápida */}
                <div className="pt-2 border-t border-zinc-800/60 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-zinc-400 font-medium">
                      Observação / Parecer Geral sobre o Andamento do Artigo:
                    </span>
                  </div>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={generalNotesDraft[sub.id] ?? sub.reviewNotes ?? ""}
                      onChange={(e) =>
                        setGeneralNotesDraft((prev) => ({
                          ...prev,
                          [sub.id]: e.target.value,
                        }))
                      }
                      placeholder="Ex.: Artigo está na 2ª revisão, aguardando ajustes finais na seção de resultados..."
                      className="flex-1 bg-zinc-900 border border-zinc-800 rounded px-3 py-1.5 text-zinc-100"
                    />
                    <button
                      type="button"
                      onClick={() =>
                        updateSubmission(sub.id, {
                          reviewNotes: generalNotesDraft[sub.id] ?? sub.reviewNotes,
                        })
                      }
                      className="px-3 py-1.5 rounded bg-zinc-800 hover:bg-zinc-700 text-zinc-200 font-medium"
                    >
                      Salvar Observação Geral
                    </button>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Modal Cadastrar / Editar Artigo */}
      {showSubModal && (
        <div className="fixed inset-0 z-50 bg-black/75 flex items-center justify-center p-4">
          <div className="bg-[#111318] border border-zinc-800 rounded-lg max-w-lg w-full p-6 space-y-4 max-h-[90vh] overflow-y-auto text-xs">
            <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
              <h2 className="text-sm font-semibold text-zinc-100">
                {editingSubId ? "Editar Artigo" : "Cadastrar Artigo para Submissão"}
              </h2>
              <button onClick={() => setShowSubModal(false)} className="text-zinc-400">
                Fechar
              </button>
            </div>

            <form onSubmit={handleSaveSubmission} className="space-y-3.5">
              <div>
                <label className="block text-zinc-400 mb-1">Título do Artigo *</label>
                <input
                  type="text"
                  required
                  value={subTitle}
                  onChange={(e) => setSubTitle(e.target.value)}
                  className="w-full bg-zinc-900 border border-zinc-800 rounded px-3 py-2 text-zinc-100"
                />
              </div>

              <div>
                <label className="block text-zinc-400 mb-1">Status Atual</label>
                <select
                  value={subStatus}
                  onChange={(e) => setSubStatus(e.target.value as SubmissionStatus)}
                  className="w-full bg-zinc-900 border border-zinc-800 rounded px-3 py-2 text-zinc-100"
                >
                  {Object.entries(SUBMISSION_STATUS_LABELS).map(([k, label]) => (
                    <option key={k} value={k}>
                      {label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-zinc-400 mb-1">Autor Principal *</label>
                <select
                  value={primaryAuthorId}
                  onChange={(e) => {
                    const id = e.target.value;
                    setPrimaryAuthorId(id);
                    if (id && !subAuthors.includes(id)) {
                      setSubAuthors((prev) => [id, ...prev]);
                    }
                  }}
                  className="w-full bg-zinc-900 border border-zinc-800 rounded px-3 py-2 text-zinc-100"
                >
                  {members.map((m) => (
                    <option key={m.id} value={m.id}>
                      {m.name} ({m.institution})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-zinc-400 mb-1">Demais Coautores</label>
                <div className="max-h-28 overflow-y-auto bg-zinc-900 border border-zinc-800 rounded p-2 space-y-1">
                  {members.map((m) => {
                    const isPrim = m.id === primaryAuthorId;
                    return (
                      <label key={m.id} className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={isPrim || subAuthors.includes(m.id)}
                          disabled={isPrim}
                          onChange={() =>
                            setSubAuthors((prev) =>
                              prev.includes(m.id)
                                ? prev.filter((x) => x !== m.id)
                                : [...prev, m.id]
                            )
                          }
                        />
                        <span className="text-zinc-200">{m.name}</span>
                      </label>
                    );
                  })}
                </div>
              </div>

              <div>
                <label className="block text-zinc-400 mb-1">
                  Revisores Internos Designados (qualquer membro pode revisar)
                </label>
                <div className="max-h-28 overflow-y-auto bg-zinc-900 border border-zinc-800 rounded p-2 space-y-1">
                  {members.map((m) => (
                    <label key={m.id} className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={subReviewers.includes(m.id)}
                        onChange={() =>
                          setSubReviewers((prev) =>
                            prev.includes(m.id)
                              ? prev.filter((x) => x !== m.id)
                              : [...prev, m.id]
                          )
                        }
                      />
                      <span className="text-zinc-200">{m.name}</span>
                    </label>
                  ))}
                </div>
              </div>

              {!editingSubId && (
                <div className="p-3 rounded bg-zinc-950/60 border border-zinc-800 space-y-2">
                  <label className="block text-zinc-300 font-medium">
                    Importar PDF da 1ª Versão Inicial (Opcional no momento do cadastro)
                  </label>
                  <input
                    type="file"
                    accept=".pdf,application/pdf"
                    onChange={handleInitialPdfUpload}
                    className="w-full text-zinc-400"
                  />
                  {uploadingInitial && (
                    <p className="text-emerald-400">Importando PDF...</p>
                  )}
                  {initialPdfName && (
                    <p className="text-emerald-400">Arquivo pronto: {initialPdfName}</p>
                  )}
                </div>
              )}

              <div className="flex justify-end gap-2 pt-3 border-t border-zinc-800">
                <button
                  type="button"
                  onClick={() => setShowSubModal(false)}
                  className="px-3 py-1.5 rounded bg-zinc-800 text-zinc-300"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={uploadingInitial}
                  className="px-4 py-1.5 rounded bg-emerald-600 text-white font-medium"
                >
                  Salvar Artigo
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Adicionar Versão / Correção em PDF */}
      {versionModalSubId && (
        <div className="fixed inset-0 z-50 bg-black/75 flex items-center justify-center p-4">
          <div className="bg-[#111318] border border-zinc-800 rounded-lg max-w-md w-full p-6 space-y-4 text-xs">
            <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
              <h2 className="text-sm font-semibold text-zinc-100">
                Adicionar PDF de Versão ou Correção
              </h2>
              <button onClick={() => setVersionModalSubId(null)} className="text-zinc-400">
                Fechar
              </button>
            </div>

            <form onSubmit={handleSaveVersion} className="space-y-3">
              <div>
                <label className="block text-zinc-400 mb-1">Papel neste Envio</label>
                <select
                  value={verRole}
                  onChange={(e) => setVerRole(e.target.value as "AUTOR" | "REVISOR")}
                  className="w-full bg-zinc-900 border border-zinc-800 rounded px-3 py-2 text-zinc-100"
                >
                  <option value="AUTOR">Autor (Versão Inicial ou Versão Corrigida)</option>
                  <option value="REVISOR">Revisor (PDF Comentado / Correções)</option>
                </select>
              </div>

              <div>
                <label className="block text-zinc-400 mb-1">
                  Identificação da Versão *
                </label>
                <input
                  type="text"
                  required
                  value={verLabel}
                  onChange={(e) => setVerLabel(e.target.value)}
                  placeholder="Ex.: 1ª Versão Inicial, 1ª Correção do Autor, Revisão 1..."
                  className="w-full bg-zinc-900 border border-zinc-800 rounded px-3 py-2 text-zinc-100"
                />
              </div>

              <div>
                <label className="block text-zinc-400 mb-1">
                  Importar Arquivo PDF *
                </label>
                <input
                  type="file"
                  accept=".pdf,application/pdf"
                  onChange={handleVersionPdfUpload}
                  className="w-full text-zinc-400"
                />
                {uploadingVer && <p className="text-emerald-400 mt-1">Enviando PDF...</p>}
              </div>

              <div>
                <label className="block text-zinc-400 mb-1">
                  Ou cole um link externo (caso esteja no Overleaf / Drive)
                </label>
                <input
                  type="text"
                  required
                  value={verFileUrl}
                  onChange={(e) => setVerFileUrl(e.target.value)}
                  placeholder="URL gerada pelo upload ou link externo..."
                  className="w-full bg-zinc-900 border border-zinc-800 rounded px-3 py-2 text-zinc-100"
                />
              </div>

              <div>
                <label className="block text-zinc-400 mb-1">
                  Observação sobre esta Versão / Correção *
                </label>
                <textarea
                  rows={3}
                  required
                  value={verNotes}
                  onChange={(e) => setVerNotes(e.target.value)}
                  placeholder="Descreva o que foi alterado nesta versão ou quais correções o autor precisa fazer..."
                  className="w-full bg-zinc-900 border border-zinc-800 rounded px-3 py-2 text-zinc-100"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-zinc-800">
                <button
                  type="button"
                  onClick={() => setVersionModalSubId(null)}
                  className="px-3 py-1.5 rounded bg-zinc-800 text-zinc-300"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={uploadingVer}
                  className="px-4 py-1.5 rounded bg-emerald-600 text-white font-medium"
                >
                  Salvar Versão no Histórico
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
