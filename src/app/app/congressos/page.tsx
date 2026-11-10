"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useLabic } from "@/context/LabicContext";
import { CONFERENCE_STATUS_LABELS, formatDateBR, LabicConference } from "@/types/labic";

export default function CongressosPage() {
  const {
    conferences,
    submissions,
    addConference,
    updateConference,
    deleteConference,
  } = useLabic();

  const [showModal, setShowModal] = useState(false);
  const [editingConfId, setEditingConfId] = useState<string | null>(null);
  const [name, setName] = useState("");
  const [acronym, setAcronym] = useState("");
  const [location, setLocation] = useState("");
  const [internalReviewDeadline, setInternalReviewDeadline] = useState("");
  const [officialSubmissionDeadline, setOfficialSubmissionDeadline] = useState("");
  const [eventDate, setEventDate] = useState("");
  const [status, setStatus] = useState<LabicConference["status"]>("ABERTO");

  const openCreateModal = () => {
    setEditingConfId(null);
    setName("");
    setAcronym("");
    setLocation("");
    setInternalReviewDeadline("");
    setOfficialSubmissionDeadline("");
    setEventDate("");
    setStatus("ABERTO");
    setShowModal(true);
  };

  const openEditModal = (conf: LabicConference) => {
    setEditingConfId(conf.id);
    setName(conf.name);
    setAcronym(conf.acronym);
    setLocation(conf.location);
    setInternalReviewDeadline(conf.internalReviewDeadline);
    setOfficialSubmissionDeadline(conf.officialSubmissionDeadline);
    setEventDate(conf.eventDate);
    setStatus(conf.status);
    setShowModal(true);
  };

  const handleSaveConference = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !acronym.trim()) return;

    if (editingConfId) {
      await updateConference(editingConfId, {
        name: name.trim(),
        acronym: acronym.trim(),
        location: location.trim(),
        internalReviewDeadline,
        officialSubmissionDeadline,
        eventDate: eventDate.trim(),
        status,
      });
    } else {
      await addConference({
        name: name.trim(),
        acronym: acronym.trim(),
        location: location.trim(),
        internalReviewDeadline,
        officialSubmissionDeadline,
        eventDate: eventDate.trim(),
        status,
        milestones: [],
      });
    }

    setShowModal(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-zinc-800/80 pb-4">
        <div>
          <h1 className="text-lg font-semibold text-zinc-100">Congressos e Eventos Científicos</h1>
          <p className="text-xs text-zinc-400 mt-0.5">
            Selecione um congresso para acessar sua página exclusiva de cronograma interno, artigos submetidos e rodadas de revisão em PDF.
          </p>
        </div>
        <button
          onClick={openCreateModal}
          className="px-3.5 py-2 rounded bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-medium transition-colors shrink-0"
        >
          + Cadastrar Congresso
        </button>
      </div>

      {conferences.length === 0 ? (
        <div className="bg-[#111318] border border-zinc-800/80 rounded-lg p-6 text-xs text-zinc-500">
          Nenhum congresso cadastrado. Clique em &ldquo;+ Cadastrar Congresso&rdquo; para criar um evento e gerenciar suas metas e artigos.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {conferences.map((conf) => {
            const confSubs = submissions.filter((s) => s.conferenceId === conf.id);
            const completedMilestones = (conf.milestones || []).filter(
              (m) => m.completed
            ).length;

            return (
              <div
                key={conf.id}
                className="bg-[#111318] border border-zinc-800/80 rounded-lg p-5 flex flex-col justify-between gap-4 text-xs"
              >
                <div className="space-y-2">
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <span className="px-2 py-0.5 rounded bg-emerald-950/60 border border-emerald-800/50 text-emerald-400 font-semibold">
                        {conf.acronym}
                      </span>
                      <span className="text-zinc-400">
                        {CONFERENCE_STATUS_LABELS[conf.status] || conf.status}
                      </span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <button
                        onClick={() => openEditModal(conf)}
                        className="px-2 py-1 rounded bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-zinc-300"
                      >
                        Editar
                      </button>
                      <button
                        onClick={() => deleteConference(conf.id)}
                        className="px-2 py-1 rounded bg-red-950/50 border border-red-900/50 text-red-300"
                      >
                        Excluir
                      </button>
                    </div>
                  </div>

                  <h2 className="text-base font-semibold text-zinc-100">{conf.name}</h2>
                  <p className="text-zinc-400">
                    Local: {conf.location || "A definir"} · Evento:{" "}
                    {conf.eventDate ? formatDateBR(conf.eventDate) : "A definir"}
                  </p>
                  <div className="grid grid-cols-2 gap-2 pt-1 text-[11px] text-zinc-400">
                    <div className="bg-zinc-900/50 border border-zinc-800/70 rounded p-2">
                      <span className="block text-zinc-500">Prazo Revisão Interna</span>
                      <span className="text-zinc-200 font-medium">
                        {conf.internalReviewDeadline
                          ? formatDateBR(conf.internalReviewDeadline)
                          : "Não definido"}
                      </span>
                    </div>
                    <div className="bg-zinc-900/50 border border-zinc-800/70 rounded p-2">
                      <span className="block text-zinc-500">Deadline Oficial</span>
                      <span className="text-zinc-200 font-medium">
                        {conf.officialSubmissionDeadline
                          ? formatDateBR(conf.officialSubmissionDeadline)
                          : "Não definido"}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="pt-3 border-t border-zinc-800/80 flex items-center justify-between">
                  <div className="text-[11px] text-zinc-400">
                    <strong className="text-zinc-200">{confSubs.length}</strong> artigo(s) ·{" "}
                    <strong className="text-zinc-200">
                      {completedMilestones}/{conf.milestones?.length || 0}
                    </strong>{" "}
                    metas concluídas
                  </div>

                  <Link
                    href={`/app/congressos/${conf.id}`}
                    className="px-3.5 py-1.5 rounded bg-emerald-600 hover:bg-emerald-500 text-white font-medium transition-colors"
                  >
                    Abrir Congresso e Artigos →
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {showModal && (
        <div className="fixed inset-0 z-50 bg-black/75 flex items-center justify-center p-4">
          <div className="bg-[#111318] border border-zinc-800 rounded-lg max-w-md w-full p-6 space-y-4 text-xs">
            <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
              <h2 className="text-sm font-semibold text-zinc-100">
                {editingConfId ? "Editar Congresso" : "Cadastrar Congresso"}
              </h2>
              <button onClick={() => setShowModal(false)} className="text-zinc-400">
                Fechar
              </button>
            </div>
            <form onSubmit={handleSaveConference} className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-zinc-400 mb-1">Sigla / Nome Curto *</label>
                  <input
                    type="text"
                    required
                    value={acronym}
                    onChange={(e) => setAcronym(e.target.value)}
                    placeholder="Ex.: SBRC 2026, CBA..."
                    className="w-full bg-zinc-900 border border-zinc-800 rounded px-3 py-2 text-zinc-100"
                  />
                </div>
                <div>
                  <label className="block text-zinc-400 mb-1">Status</label>
                  <select
                    value={status}
                    onChange={(e) => setStatus(e.target.value as LabicConference["status"])}
                    className="w-full bg-zinc-900 border border-zinc-800 rounded px-3 py-2 text-zinc-100"
                  >
                    <option value="ABERTO">Aberto</option>
                    <option value="EM_REVISAO">Em Revisão Interna</option>
                    <option value="ENCERRADO">Encerrado</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-zinc-400 mb-1">Nome Oficial do Evento *</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full bg-zinc-900 border border-zinc-800 rounded px-3 py-2 text-zinc-100"
                />
              </div>
              <div>
                <label className="block text-zinc-400 mb-1">Local / Cidade</label>
                <input
                  type="text"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  className="w-full bg-zinc-900 border border-zinc-800 rounded px-3 py-2 text-zinc-100"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-zinc-400 mb-1">Prazo Revisão Interna</label>
                  <input
                    type="date"
                    value={internalReviewDeadline}
                    onChange={(e) => setInternalReviewDeadline(e.target.value)}
                    className="w-full bg-zinc-900 border border-zinc-800 rounded px-3 py-2 text-zinc-100"
                  />
                </div>
                <div>
                  <label className="block text-zinc-400 mb-1">Deadline Oficial</label>
                  <input
                    type="date"
                    value={officialSubmissionDeadline}
                    onChange={(e) => setOfficialSubmissionDeadline(e.target.value)}
                    className="w-full bg-zinc-900 border border-zinc-800 rounded px-3 py-2 text-zinc-100"
                  />
                </div>
              </div>
              <div>
                <label className="block text-zinc-400 mb-1">Data de Realização do Evento</label>
                <input
                  type="date"
                  value={eventDate}
                  onChange={(e) => setEventDate(e.target.value)}
                  className="w-full bg-zinc-900 border border-zinc-800 rounded px-3 py-2 text-zinc-100"
                />
              </div>
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
                  className="px-4 py-1.5 rounded bg-emerald-600 text-white font-medium"
                >
                  Salvar Congresso
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
