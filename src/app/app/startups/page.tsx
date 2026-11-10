"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useLabic } from "@/context/LabicContext";
import {
  LabicStartup,
  STARTUP_PHASE_LABELS,
  STARTUP_STAGE_LABELS,
  StartupApplication,
} from "@/types/labic";

export default function StartupsPage() {
  const {
    startups,
    members,
    currentUser,
    isAdmin,
    canAccessStartupEdital,
    addStartup,
    updateStartup,
    deleteStartup,
    addStartupApplication,
    deleteStartupApplication,
  } = useLabic();

  // Modal de Startup (Criar / Editar)
  const [showStartupModal, setShowStartupModal] = useState(false);
  const [editingStartupId, setEditingStartupId] = useState<string | null>(null);
  const [name, setName] = useState("");
  const [tagline, setTagline] = useState("");
  const [stage, setStage] = useState<LabicStartup["stage"]>("MVP_PROTOTIPO");
  const [showOnPublicShowcase, setShowOnPublicShowcase] = useState(true);

  // Modal de Novo Edital Submetido
  const [activeStartupId, setActiveStartupId] = useState<string | null>(null);
  const [programName, setProgramName] = useState("");
  const [phaseOrStatus, setPhaseOrStatus] =
    useState<StartupApplication["phaseOrStatus"]>("SUBMETIDO");
  const [editalYear, setEditalYear] = useState<number>(new Date().getFullYear());
  const [approvedGrantBRL, setApprovedGrantBRL] = useState<string>("");
  const [editalMembers, setEditalMembers] = useState<string[]>(
    currentUser ? [currentUser.id] : []
  );

  const openCreateStartup = () => {
    setEditingStartupId(null);
    setName("");
    setTagline("");
    setStage("MVP_PROTOTIPO");
    setShowOnPublicShowcase(true);
    setShowStartupModal(true);
  };

  const openEditStartup = (st: LabicStartup) => {
    setEditingStartupId(st.id);
    setName(st.name);
    setTagline(st.tagline);
    setStage(st.stage);
    setShowOnPublicShowcase(st.showOnPublicShowcase);
    setShowStartupModal(true);
  };

  const handleSaveStartup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    if (editingStartupId) {
      await updateStartup(editingStartupId, {
        name: name.trim(),
        tagline: tagline.trim(),
        description: tagline.trim(),
        stage,
        showOnPublicShowcase,
      });
    } else {
      await addStartup({
        name: name.trim(),
        tagline: tagline.trim(),
        description: tagline.trim(),
        stage,
        memberIds: currentUser ? [currentUser.id] : [],
        applications: [],
        showOnPublicShowcase,
      });
    }

    setShowStartupModal(false);
  };

  const openNewEditalModal = (startupId: string) => {
    setActiveStartupId(startupId);
    setProgramName("");
    setPhaseOrStatus("SUBMETIDO");
    setEditalYear(new Date().getFullYear());
    setApprovedGrantBRL("");
    setEditalMembers(currentUser ? [currentUser.id] : []);
  };

  const handleCreateEdital = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeStartupId || !programName.trim()) return;
    const finalMembers = currentUser
      ? Array.from(new Set([currentUser.id, ...editalMembers]))
      : editalMembers;

    await addStartupApplication(activeStartupId, {
      programName: programName.trim(),
      phaseOrStatus,
      year: Number(editalYear),
      approvedGrantBRL: approvedGrantBRL ? Number(approvedGrantBRL) : undefined,
      memberIds: finalMembers,
      milestones: [],
      attachments: [],
      notes: "",
    });

    setActiveStartupId(null);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-zinc-800/80 pb-4">
        <div>
          <h1 className="text-lg font-semibold text-zinc-100">Startups e Editais Submetidos</h1>
          <p className="text-xs text-zinc-400 mt-0.5">
            Acompanhamento de startups nascidas no LABIC. Os pesquisadores são vinculados diretamente a cada Edital submetido, com controle estrito de acesso às entregas e arquivos de cada processo seletivo.
          </p>
        </div>
        <button
          onClick={openCreateStartup}
          className="px-3.5 py-2 rounded bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-medium transition-colors shrink-0"
        >
          + Cadastrar Startup
        </button>
      </div>

      {startups.length === 0 ? (
        <div className="bg-[#111318] border border-zinc-800/80 rounded-lg p-6 text-xs text-zinc-500">
          Nenhuma startup registrada até o momento.
        </div>
      ) : (
        <div className="space-y-5">
          {startups.map((st) => {
            const canManageStartup =
              isAdmin() ||
              (currentUser && st.memberIds.includes(currentUser.id)) ||
              (currentUser &&
                st.applications.some((a) => a.memberIds.includes(currentUser.id)));

            return (
              <div
                key={st.id}
                className="bg-[#111318] border border-zinc-800/80 rounded-lg p-5 space-y-4 text-xs"
              >
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3 border-b border-zinc-800/70 pb-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-[11px] text-emerald-400 font-semibold">
                        {STARTUP_STAGE_LABELS[st.stage] || st.stage}
                      </span>
                      {st.showOnPublicShowcase && (
                        <span className="text-[11px] text-zinc-500">· Pública na Vitrine</span>
                      )}
                    </div>
                    <h2 className="text-base font-semibold text-zinc-100 mt-0.5">{st.name}</h2>
                    <p className="text-zinc-400 mt-0.5">{st.tagline}</p>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      onClick={() => openNewEditalModal(st.id)}
                      className="px-3 py-1.5 rounded bg-emerald-600 hover:bg-emerald-500 text-white font-medium"
                    >
                      + Cadastrar Novo Edital
                    </button>
                    {canManageStartup && (
                      <>
                        <button
                          onClick={() => openEditStartup(st)}
                          className="px-2.5 py-1.5 rounded bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-zinc-300"
                        >
                          Editar Startup
                        </button>
                        <button
                          onClick={() => deleteStartup(st.id)}
                          className="px-2.5 py-1.5 rounded bg-red-950/50 border border-red-900/50 text-red-300"
                        >
                          Excluir
                        </button>
                      </>
                    )}
                  </div>
                </div>

                {/* Lista de Editais Submetidos por esta Startup */}
                <div className="space-y-2.5">
                  <div className="font-medium text-zinc-300">
                    Editais Submetidos ({st.applications.length}):
                  </div>

                  {st.applications.length === 0 ? (
                    <p className="text-zinc-500">
                      Nenhum edital cadastrado para esta startup. Clique em &ldquo;+ Cadastrar Novo Edital&rdquo; para vincular integrantes, prazos e documentos.
                    </p>
                  ) : (
                    <div className="divide-y divide-zinc-800/60 bg-zinc-900/40 border border-zinc-800 rounded px-3.5">
                      {st.applications.map((app) => {
                        const hasAccess = canAccessStartupEdital(st.id, app.id);
                        const editalTeamNames = (app.memberIds || [])
                          .map((id) => members.find((m) => m.id === id)?.name)
                          .filter(Boolean)
                          .join(", ");

                        return (
                          <div
                            key={app.id}
                            className="py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                          >
                            <div className="space-y-0.5">
                              <div className="flex items-center gap-2">
                                <span className="font-semibold text-zinc-100">
                                  {app.programName} ({app.year})
                                </span>
                                <span className="px-2 py-0.5 rounded bg-zinc-900 border border-zinc-800 text-[11px] text-emerald-400">
                                  {STARTUP_PHASE_LABELS[app.phaseOrStatus] || app.phaseOrStatus}
                                </span>
                              </div>
                              <div className="text-[11px] text-zinc-400">
                                Equipe vinculada a este edital:{" "}
                                <span className="text-zinc-300">
                                  {editalTeamNames || "Apenas Coordenação"}
                                </span>
                              </div>
                            </div>

                            <div className="flex items-center gap-2 shrink-0">
                              {hasAccess ? (
                                <>
                                  <Link
                                    href={`/app/startups/${st.id}/editais/${app.id}`}
                                    className="px-3 py-1.5 rounded bg-zinc-800 hover:bg-zinc-700 border border-zinc-700 text-emerald-400 font-medium transition-colors"
                                  >
                                    Abrir Edital (Prazos e PDFs) →
                                  </Link>
                                  <button
                                    onClick={() => deleteStartupApplication(st.id, app.id)}
                                    className="px-2 py-1.5 rounded bg-red-950/50 border border-red-900/50 text-red-300"
                                  >
                                    Excluir
                                  </button>
                                </>
                              ) : (
                                <span className="px-2.5 py-1 rounded bg-zinc-950 border border-zinc-800 text-[11px] text-zinc-500">
                                  Acesso restrito aos integrantes deste edital
                                </span>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Modal Criar / Editar Startup */}
      {showStartupModal && (
        <div className="fixed inset-0 z-50 bg-black/75 flex items-center justify-center p-4">
          <div className="bg-[#111318] border border-zinc-800 rounded-lg max-w-md w-full p-6 space-y-4 text-xs">
            <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
              <h2 className="text-sm font-semibold text-zinc-100">
                {editingStartupId ? "Editar Startup" : "Cadastrar Startup"}
              </h2>
              <button onClick={() => setShowStartupModal(false)} className="text-zinc-400">
                Fechar
              </button>
            </div>
            <form onSubmit={handleSaveStartup} className="space-y-3">
              <div>
                <label className="block text-zinc-400 mb-1">Nome da Startup *</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full bg-zinc-900 border border-zinc-800 rounded px-3 py-2 text-zinc-100"
                />
              </div>
              <div>
                <label className="block text-zinc-400 mb-1">Proposta de Valor / Resumo *</label>
                <input
                  type="text"
                  required
                  value={tagline}
                  onChange={(e) => setTagline(e.target.value)}
                  className="w-full bg-zinc-900 border border-zinc-800 rounded px-3 py-2 text-zinc-100"
                />
              </div>
              <div>
                <label className="block text-zinc-400 mb-1">Estágio Atual</label>
                <select
                  value={stage}
                  onChange={(e) => setStage(e.target.value as LabicStartup["stage"])}
                  className="w-full bg-zinc-900 border border-zinc-800 rounded px-3 py-2 text-zinc-100"
                >
                  <option value="IDEACAO">Ideação</option>
                  <option value="MVP_PROTOTIPO">MVP / Protótipo</option>
                  <option value="VALIDACAO">Validação</option>
                  <option value="INCUBADA_CAPTANDO">Incubada / Captando</option>
                </select>
              </div>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={showOnPublicShowcase}
                  onChange={(e) => setShowOnPublicShowcase(e.target.checked)}
                />
                <span className="text-zinc-300">Exibir startup na página pública</span>
              </label>
              <div className="flex justify-end gap-2 pt-3 border-t border-zinc-800">
                <button
                  type="button"
                  onClick={() => setShowStartupModal(false)}
                  className="px-3 py-1.5 rounded bg-zinc-800 text-zinc-300"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 rounded bg-emerald-600 text-white font-medium"
                >
                  Salvar Startup
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Cadastrar Novo Edital Submetido */}
      {activeStartupId && (
        <div className="fixed inset-0 z-50 bg-black/75 flex items-center justify-center p-4">
          <div className="bg-[#111318] border border-zinc-800 rounded-lg max-w-md w-full p-6 space-y-4 text-xs max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
              <h2 className="text-sm font-semibold text-zinc-100">
                Cadastrar Novo Edital Submetido
              </h2>
              <button onClick={() => setActiveStartupId(null)} className="text-zinc-400">
                Fechar
              </button>
            </div>
            <form onSubmit={handleCreateEdital} className="space-y-3">
              <div>
                <label className="block text-zinc-400 mb-1">Nome do Programa / Edital *</label>
                <input
                  type="text"
                  required
                  value={programName}
                  onChange={(e) => setProgramName(e.target.value)}
                  placeholder="Ex.: Programa Centelha SE, Startup Nordeste..."
                  className="w-full bg-zinc-900 border border-zinc-800 rounded px-3 py-2 text-zinc-100"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-zinc-400 mb-1">Ano</label>
                  <input
                    type="number"
                    value={editalYear}
                    onChange={(e) => setEditalYear(Number(e.target.value))}
                    className="w-full bg-zinc-900 border border-zinc-800 rounded px-3 py-2 text-zinc-100"
                  />
                </div>
                <div>
                  <label className="block text-zinc-400 mb-1">Status</label>
                  <select
                    value={phaseOrStatus}
                    onChange={(e) =>
                      setPhaseOrStatus(
                        e.target.value as StartupApplication["phaseOrStatus"]
                      )
                    }
                    className="w-full bg-zinc-900 border border-zinc-800 rounded px-3 py-2 text-zinc-100"
                  >
                    <option value="SUBMETIDO">Submetido</option>
                    <option value="FASE_1">Fase 1</option>
                    <option value="FASE_2_PITCH">Fase 2 (Pitch)</option>
                    <option value="APROVADO_CONTEMPLADO">Aprovado / Contemplado</option>
                    <option value="NAO_APROVADO">Não Aprovado</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-zinc-400 mb-1">Valor Captado em R$ (Opcional)</label>
                <input
                  type="number"
                  value={approvedGrantBRL}
                  onChange={(e) => setApprovedGrantBRL(e.target.value)}
                  className="w-full bg-zinc-900 border border-zinc-800 rounded px-3 py-2 text-zinc-100"
                />
              </div>

              <div>
                <label className="block text-zinc-400 mb-1">
                  Pesquisadores Vinculados a este Edital *
                </label>
                <p className="text-[11px] text-zinc-500 mb-1.5">
                  Apenas os membros selecionados aqui (e a Coordenação Geral) poderão acessar os documentos, prazos e informações internas deste edital.
                </p>
                <div className="max-h-36 overflow-y-auto bg-zinc-900 border border-zinc-800 rounded p-2 space-y-1">
                  {members.map((m) => {
                    const isCreator = currentUser?.id === m.id;
                    return (
                      <label key={m.id} className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={isCreator || editalMembers.includes(m.id)}
                          disabled={isCreator}
                          onChange={() =>
                            setEditalMembers((prev) =>
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

              <div className="flex justify-end gap-2 pt-3 border-t border-zinc-800">
                <button
                  type="button"
                  onClick={() => setActiveStartupId(null)}
                  className="px-3 py-1.5 rounded bg-zinc-800 text-zinc-300"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 rounded bg-emerald-600 text-white font-medium"
                >
                  Criar Edital
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
