"use client";

import React, { useState } from "react";
import { useLabic } from "@/context/LabicContext";
import { formatMeetingDateTime, LabicMeeting, MEETING_TYPE_LABELS } from "@/types/labic";

export default function ReunioesPage() {
  const { meetings, members, currentUser, addMeeting, updateMeeting, deleteMeeting } = useLabic();

  const [showModal, setShowModal] = useState(false);
  const [editingMeeting, setEditingMeeting] = useState<LabicMeeting | null>(null);
  const [title, setTitle] = useState("");
  const [meetingType, setMeetingType] = useState<
    "ORIENTACAO_SEMANAL" | "REUNIAO_GERAL_MENSAL" | "COORDENACAO" | "CONGRESSO_REVISAO"
  >("ORIENTACAO_SEMANAL");
  const [meetingDate, setMeetingDate] = useState("");
  const [meetingTime, setMeetingTime] = useState("");
  const [locationOrLink, setLocationOrLink] = useState("");
  const [participantIds, setParticipantIds] = useState<string[]>([]);
  const [minutesNotes, setMinutesNotes] = useState("");

  const activeMembers = members.filter((m) => m.status === "ATIVO");

  const openCreateModal = () => {
    setEditingMeeting(null);
    setTitle("");
    setMeetingType("ORIENTACAO_SEMANAL");
    setMeetingDate(new Date().toISOString().slice(0, 10));
    setMeetingTime("14:00");
    setLocationOrLink("");
    setParticipantIds([]);
    setMinutesNotes("");
    setShowModal(true);
  };

  const openEditModal = (m: LabicMeeting) => {
    setEditingMeeting(m);
    setTitle(m.title);
    setMeetingType(m.meetingType);
    setMeetingDate(m.meetingDate || new Date().toISOString().slice(0, 10));
    setMeetingTime(m.meetingTime || "14:00");
    setLocationOrLink(m.locationOrLink);
    setParticipantIds(m.participantIds || []);
    setMinutesNotes(m.minutesNotes || "");
    setShowModal(true);
  };

  const selectAllParticipants = () => {
    setParticipantIds(activeMembers.map((m) => m.id));
  };

  const clearAllParticipants = () => {
    setParticipantIds([]);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !meetingDate || !meetingTime || !currentUser) return;
    const formattedDate = meetingDate.split("-").reverse().join("/");
    const scheduledAt = `${formattedDate} às ${meetingTime}`;

    if (editingMeeting) {
      await updateMeeting(editingMeeting.id, {
        title: title.trim(),
        meetingType,
        scheduledAt,
        meetingDate,
        meetingTime,
        locationOrLink: locationOrLink.trim() || "LABIC - Campus Lagarto",
        participantIds,
        minutesNotes: minutesNotes.trim() || undefined,
      });
    } else {
      await addMeeting({
        title: title.trim(),
        meetingType,
        scheduledAt,
        meetingDate,
        meetingTime,
        locationOrLink: locationOrLink.trim() || "LABIC - Campus Lagarto",
        organizerId: currentUser.id,
        participantIds,
        minutesNotes: minutesNotes.trim() || undefined,
      });
    }
    setShowModal(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-zinc-800/80 pb-4">
        <div>
          <h1 className="text-lg font-semibold text-zinc-100">Reuniões</h1>
          <p className="text-xs text-zinc-400 mt-0.5">
            Agendamento de reuniões gerais, orientações ou encontros de coordenação com disparo automático de aviso aos participantes.
          </p>
        </div>
        <button
          onClick={openCreateModal}
          className="px-3.5 py-2 rounded bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-medium transition-colors shrink-0"
        >
          + Agendar Reunião
        </button>
      </div>

      {meetings.length === 0 ? (
        <div className="bg-[#111318] border border-zinc-800/80 rounded-lg p-6 text-xs text-zinc-500">
          Nenhuma reunião registrada.
        </div>
      ) : (
        <div className="space-y-3">
          {meetings.map((m) => {
            const attendees = m.participantIds
              .map((id) => members.find((mem) => mem.id === id)?.name)
              .filter(Boolean)
              .join(", ");
            return (
              <div
                key={m.id}
                className="bg-[#111318] border border-zinc-800/80 rounded-lg p-5 space-y-2 text-xs"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div>
                    <span className="text-[11px] text-emerald-400 font-medium">
                      {MEETING_TYPE_LABELS[m.meetingType] || m.meetingType}
                    </span>
                    <h2 className="text-sm font-semibold text-zinc-100 mt-0.5">{m.title}</h2>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-zinc-300 font-medium">
                      {formatMeetingDateTime(m.meetingDate, m.meetingTime, m.scheduledAt)} ·{" "}
                      {m.locationOrLink}
                    </span>
                    <button
                      onClick={() => openEditModal(m)}
                      className="px-2.5 py-1 rounded bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-[11px]"
                    >
                      Editar
                    </button>
                    <button
                      onClick={() => deleteMeeting(m.id)}
                      className="px-2.5 py-1 rounded bg-red-950/50 hover:bg-red-900/60 text-red-300 border border-red-900/40 text-[11px]"
                    >
                      Excluir
                    </button>
                  </div>
                </div>
                {attendees && (
                  <p className="text-zinc-400">
                    <strong className="text-zinc-300">Participantes ({m.participantIds.length}):</strong>{" "}
                    {attendees}
                  </p>
                )}
                {m.minutesNotes && (
                  <div className="p-2.5 rounded bg-zinc-900/60 border border-zinc-800/60 text-zinc-300 whitespace-pre-wrap">
                    <span className="text-[11px] text-zinc-500 block mb-0.5">Pauta / Ata:</span>
                    {m.minutesNotes}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {showModal && (
        <div className="fixed inset-0 z-50 bg-black/75 flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-[#111318] border border-zinc-800 rounded-lg max-w-lg w-full p-6 space-y-4 text-xs my-8">
            <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
              <h2 className="text-sm font-semibold text-zinc-100">
                {editingMeeting ? "Editar Reunião" : "Agendar Reunião"}
              </h2>
              <button onClick={() => setShowModal(false)} className="text-zinc-400">
                Fechar
              </button>
            </div>
            <form onSubmit={handleSubmit} className="space-y-3">
              <div>
                <label className="block text-zinc-400 mb-1">Assunto / Título *</label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Ex.: Alinhamento Geral Semanal"
                  className="w-full bg-zinc-900 border border-zinc-800 rounded px-3 py-2 text-zinc-100"
                />
              </div>
              <div>
                <label className="block text-zinc-400 mb-1">Tipo de Reunião</label>
                <select
                  value={meetingType}
                  onChange={(e) =>
                    setMeetingType(
                      e.target.value as
                        | "ORIENTACAO_SEMANAL"
                        | "REUNIAO_GERAL_MENSAL"
                        | "COORDENACAO"
                        | "CONGRESSO_REVISAO"
                    )
                  }
                  className="w-full bg-zinc-900 border border-zinc-800 rounded px-3 py-2 text-zinc-100"
                >
                  <option value="ORIENTACAO_SEMANAL">Orientação Semanal</option>
                  <option value="REUNIAO_GERAL_MENSAL">Reunião Geral Mensal</option>
                  <option value="COORDENACAO">Reunião de Coordenação</option>
                  <option value="CONGRESSO_REVISAO">Revisão de Congresso</option>
                </select>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-zinc-400 mb-1">Data da Reunião *</label>
                  <input
                    type="date"
                    required
                    value={meetingDate}
                    onChange={(e) => setMeetingDate(e.target.value)}
                    className="w-full bg-zinc-900 border border-zinc-800 rounded px-3 py-2 text-zinc-100 cursor-pointer"
                  />
                </div>
                <div>
                  <label className="block text-zinc-400 mb-1">Horário *</label>
                  <input
                    type="time"
                    required
                    value={meetingTime}
                    onChange={(e) => setMeetingTime(e.target.value)}
                    className="w-full bg-zinc-900 border border-zinc-800 rounded px-3 py-2 text-zinc-100 cursor-pointer"
                  />
                </div>
              </div>
              <div>
                <label className="block text-zinc-400 mb-1">Sala ou Link da Videochamada</label>
                <input
                  type="text"
                  value={locationOrLink}
                  onChange={(e) => setLocationOrLink(e.target.value)}
                  placeholder="Ex.: Sala do LABIC ou https://meet.google.com/..."
                  className="w-full bg-zinc-900 border border-zinc-800 rounded px-3 py-2 text-zinc-100"
                />
              </div>
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-zinc-400">
                    Participantes Convocados ({participantIds.length} selecionados)
                  </label>
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={selectAllParticipants}
                      className="text-[11px] text-emerald-400 hover:underline"
                    >
                      Marcar todos
                    </button>
                    <button
                      type="button"
                      onClick={clearAllParticipants}
                      className="text-[11px] text-zinc-400 hover:underline"
                    >
                      Desmarcar todos
                    </button>
                  </div>
                </div>
                <div className="max-h-36 overflow-y-auto bg-zinc-900 border border-zinc-800 rounded p-2 space-y-1">
                  {activeMembers.map((m) => (
                    <label key={m.id} className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={participantIds.includes(m.id)}
                        onChange={() =>
                          setParticipantIds((prev) =>
                            prev.includes(m.id)
                              ? prev.filter((x) => x !== m.id)
                              : [...prev, m.id]
                          )
                        }
                      />
                      <span className="text-zinc-200">{m.name}</span>
                      <span className="text-[10px] text-zinc-500">({m.course || m.degreeLevel})</span>
                    </label>
                  ))}
                </div>
              </div>
              <div>
                <label className="block text-zinc-400 mb-1">Pauta ou Ata da Reunião (opcional)</label>
                <textarea
                  rows={3}
                  value={minutesNotes}
                  onChange={(e) => setMinutesNotes(e.target.value)}
                  placeholder="Anotações de pauta, decisões tomadas..."
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
                  {editingMeeting ? "Salvar Alterações" : "Salvar Reunião"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
