"use client";

import React, { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { useLabic } from "@/context/LabicContext";
import { LabicAttachment, LabicMilestone, StartupApplication } from "@/types/labic";
import { AttachmentManager } from "@/components/AttachmentManager";

export default function StartupEditalDetalhePage() {
  const params = useParams<{ startupId: string; editalId: string }>();
  const startupId = params?.startupId || "";
  const editalId = params?.editalId || "";

  const {
    startups,
    members,
    canAccessStartupEdital,
    updateStartupApplication,
  } = useLabic();

  const startup = startups.find((s) => s.id === startupId);
  const edital = startup?.applications.find((a) => a.id === editalId);
  const hasAccess = canAccessStartupEdital(startupId, editalId);

  // Estado para editar dados e membros do Edital
  const [programName, setProgramName] = useState("");
  const [year, setYear] = useState(2026);
  const [phaseOrStatus, setPhaseOrStatus] =
    useState<StartupApplication["phaseOrStatus"]>("SUBMETIDO");
  const [approvedGrantBRL, setApprovedGrantBRL] = useState("");
  const [editalMembers, setEditalMembers] = useState<string[]>([]);
  const [notes, setNotes] = useState("");
  const [savedBanner, setSavedBanner] = useState(false);

  // Estado para nova meta/deadline
  const [msTitle, setMsTitle] = useState("");
  const [msDueDate, setMsDueDate] = useState("");
  const [msDesc, setMsDesc] = useState("");

  useEffect(() => {
    if (!edital) return;
    setProgramName(edital.programName);
    setYear(edital.year);
    setPhaseOrStatus(edital.phaseOrStatus);
    setApprovedGrantBRL(edital.approvedGrantBRL ? String(edital.approvedGrantBRL) : "");
    setEditalMembers(edital.memberIds || []);
    setNotes(edital.notes || "");
  }, [edital]);

  if (!startup || !edital) {
    return (
      <div className="space-y-4">
        <Link href="/app/startups" className="text-xs text-zinc-400 hover:text-zinc-200">
          ← Voltar para Startups
        </Link>
        <div className="bg-[#111318] border border-zinc-800 rounded-lg p-6 text-xs text-zinc-400">
          Edital não encontrado.
        </div>
      </div>
    );
  }

  // Bloqueio estrito de segurança caso um usuário não vinculado tente acessar a URL diretamente
  if (!hasAccess) {
    return (
      <div className="space-y-4">
        <Link href="/app/startups" className="text-xs text-zinc-400 hover:text-zinc-200">
          ← Voltar para Startups
        </Link>
        <div className="bg-[#111318] border border-red-900/50 rounded-lg p-6 text-xs text-red-300 space-y-1">
          <div className="font-semibold text-sm">Acesso Restrito</div>
          <p>
            Você não faz parte da equipe vinculada a este edital ({edital.programName}). Apenas os integrantes cadastrados neste processo seletivo e a Coordenação Geral possuem permissão para visualizar ou alterar seus documentos e prazos.
          </p>
        </div>
      </div>
    );
  }

  const handleSaveMetadata = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!programName.trim() || editalMembers.length === 0) return;
    await updateStartupApplication(startup.id, edital.id, {
      programName: programName.trim(),
      year: Number(year),
      phaseOrStatus,
      approvedGrantBRL: approvedGrantBRL ? Number(approvedGrantBRL) : undefined,
      memberIds: editalMembers,
      notes,
    });
    setSavedBanner(true);
    setTimeout(() => setSavedBanner(false), 2500);
  };

  const handleAddMilestone = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!msTitle.trim() || !msDueDate) return;
    const newMs: LabicMilestone = {
      id: `ms-ed-${Date.now()}`,
      title: msTitle.trim(),
      dueDate: msDueDate,
      description: msDesc.trim() || undefined,
      completed: false,
    };
    await updateStartupApplication(startup.id, edital.id, {
      milestones: [...(edital.milestones || []), newMs],
    });
    setMsTitle("");
    setMsDueDate("");
    setMsDesc("");
  };

  const toggleMilestone = async (msId: string) => {
    const next = (edital.milestones || []).map((m) =>
      m.id === msId ? { ...m, completed: !m.completed } : m
    );
    await updateStartupApplication(startup.id, edital.id, { milestones: next });
  };

  const deleteMilestone = async (msId: string) => {
    const next = (edital.milestones || []).filter((m) => m.id !== msId);
    await updateStartupApplication(startup.id, edital.id, { milestones: next });
  };

  const handleAttachmentsChange = async (nextAtts: LabicAttachment[]) => {
    await updateStartupApplication(startup.id, edital.id, {
      attachments: nextAtts,
    });
  };

  return (
    <div className="space-y-6">
      <div className="border-b border-zinc-800/80 pb-4">
        <Link
          href="/app/startups"
          className="text-xs text-zinc-400 hover:text-zinc-200 inline-block mb-1"
        >
          ← Voltar para Startups
        </Link>
        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold text-emerald-400">{startup.name}</span>
          <span className="text-xs text-zinc-600">·</span>
          <span className="text-xs text-zinc-400">{edital.phaseOrStatus}</span>
        </div>
        <h1 className="text-lg font-semibold text-zinc-100 mt-0.5">
          Edital: {edital.programName} ({edital.year})
        </h1>
      </div>

      {/* Seção 1: Cronograma de Prazos e Checklist do Edital (O que foi feito / O que falta) */}
      <div className="bg-[#111318] border border-zinc-800/80 rounded-lg p-5 space-y-4 text-xs">
        <div>
          <h2 className="text-sm font-semibold text-zinc-100">
            Prazos (Deadlines) e Checklist de Tarefas do Edital
          </h2>
          <p className="text-zinc-400 mt-0.5">
            Controle as entregas exigidas pelo edital, marcando o que já foi concluído e o que está pendente.
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
            <label className="block text-zinc-400 mb-1">Entrega / Tarefa *</label>
            <input
              type="text"
              required
              value={msTitle}
              onChange={(e) => setMsTitle(e.target.value)}
              placeholder="Ex.: Submissão do Pitch Deck e Orçamento"
              className="w-full bg-zinc-900 border border-zinc-800 rounded px-2.5 py-1.5 text-zinc-100"
            />
          </div>
          <div>
            <label className="block text-zinc-400 mb-1">Observação (Opcional)</label>
            <input
              type="text"
              value={msDesc}
              onChange={(e) => setMsDesc(e.target.value)}
              placeholder="Detalhes ou responsável..."
              className="w-full bg-zinc-900 border border-zinc-800 rounded px-2.5 py-1.5 text-zinc-100"
            />
          </div>
          <button
            type="submit"
            className="px-3 py-1.5 rounded bg-emerald-600 hover:bg-emerald-500 text-white font-medium"
          >
            + Adicionar Prazo / Tarefa
          </button>
        </form>

        {(!edital.milestones || edital.milestones.length === 0) ? (
          <p className="text-zinc-500">Nenhuma tarefa ou deadline cadastrado neste edital.</p>
        ) : (
          <div className="divide-y divide-zinc-800/60">
            {edital.milestones.map((ms) => (
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
                    <span
                      className={`ml-2 px-1.5 py-0.5 rounded text-[10px] ${
                        ms.completed
                          ? "bg-emerald-950/60 text-emerald-300"
                          : "bg-zinc-900 text-zinc-400"
                      }`}
                    >
                      {ms.completed ? "Feito" : "Pendente"}
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

      {/* Seção 2: Documentos e Arquivos do Edital */}
      <div className="bg-[#111318] border border-zinc-800/80 rounded-lg p-5 space-y-3">
        <div>
          <h2 className="text-sm font-semibold text-zinc-100">
            Documentos, Propostas e Arquivos Submetidos no Edital
          </h2>
          <p className="text-xs text-zinc-400 mt-0.5">
            Guarde aqui todos os PDFs submetidos (proposta técnica, edital oficial, certidões) e links para vídeos de pitch ou planilhas financeiras.
          </p>
        </div>

        <AttachmentManager
          attachments={edital.attachments || []}
          onChange={handleAttachmentsChange}
          bucket="documentos-labic"
          label="Acervo de Documentos deste Edital"
        />
      </div>

      {/* Seção 3: Dados do Edital, Equipe Vinculada e Bloco de Notas */}
      <form
        onSubmit={handleSaveMetadata}
        className="bg-[#111318] border border-zinc-800/80 rounded-lg p-5 space-y-4 text-xs"
      >
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-semibold text-zinc-100">
            Configurações do Edital, Equipe Autorizada e Bloco de Notas
          </h2>
          {savedBanner && (
            <span className="text-emerald-400 font-medium">Alterações salvas!</span>
          )}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
          <div className="sm:col-span-2">
            <label className="block text-zinc-400 mb-1">Nome do Programa / Edital</label>
            <input
              type="text"
              required
              value={programName}
              onChange={(e) => setProgramName(e.target.value)}
              className="w-full bg-zinc-900 border border-zinc-800 rounded px-3 py-2 text-zinc-100"
            />
          </div>
          <div>
            <label className="block text-zinc-400 mb-1">Ano</label>
            <input
              type="number"
              value={year}
              onChange={(e) => setYear(Number(e.target.value))}
              className="w-full bg-zinc-900 border border-zinc-800 rounded px-3 py-2 text-zinc-100"
            />
          </div>
          <div>
            <label className="block text-zinc-400 mb-1">Fase / Status</label>
            <select
              value={phaseOrStatus}
              onChange={(e) =>
                setPhaseOrStatus(e.target.value as StartupApplication["phaseOrStatus"])
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

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-zinc-400 mb-1">
              Pesquisadores Vinculados a este Edital ({editalMembers.length})
            </label>
            <div className="max-h-36 overflow-y-auto bg-zinc-900 border border-zinc-800 rounded p-2 space-y-1">
              {members.map((m) => (
                <label key={m.id} className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={editalMembers.includes(m.id)}
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
              ))}
            </div>
          </div>

          <div className="space-y-3">
            <div>
              <label className="block text-zinc-400 mb-1">Valor Aprovado / Captado (R$)</label>
              <input
                type="number"
                value={approvedGrantBRL}
                onChange={(e) => setApprovedGrantBRL(e.target.value)}
                placeholder="Ex.: 60000"
                className="w-full bg-zinc-900 border border-zinc-800 rounded px-3 py-2 text-zinc-100"
              />
            </div>

            <div>
              <label className="block text-zinc-400 mb-1">
                Bloco de Notas / Observações Internas do Edital
              </label>
              <textarea
                rows={4}
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Anotações sobre feedbacks da banca, requisitos de prestação de contas..."
                className="w-full bg-zinc-900 border border-zinc-800 rounded px-3 py-2 text-zinc-100"
              />
            </div>
          </div>
        </div>

        <div className="flex justify-end pt-2">
          <button
            type="submit"
            className="px-4 py-2 rounded bg-emerald-600 hover:bg-emerald-500 text-white font-medium"
          >
            Salvar Alterações do Edital
          </button>
        </div>
      </form>
    </div>
  );
}
