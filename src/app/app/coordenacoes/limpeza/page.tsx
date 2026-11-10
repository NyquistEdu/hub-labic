"use client";

import React, { useState } from "react";
import { useLabic } from "@/context/LabicContext";
import { CleaningTaskRow } from "@/types/labic";

const WEEK_DAYS = [
  "Segunda",
  "Terça",
  "Quarta",
  "Quinta",
  "Sexta",
  "Sábado",
  "Domingo",
];

export default function CoordenacaoLimpezaPage() {
  const {
    cleaningTasks,
    members,
    hasCoordination,
    addCleaningTask,
    updateCleaningTask,
    deleteCleaningTask,
  } = useLabic();

  const [editingTask, setEditingTask] = useState<CleaningTaskRow | null>(null);
  const [selectedDays, setSelectedDays] = useState<string[]>(["Segunda"]);
  const [taskTitle, setTaskTitle] = useState("");
  const [notes, setNotes] = useState("");
  const [selectedMembers, setSelectedMembers] = useState<string[]>([]);

  if (!hasCoordination("LIMPEZA")) {
    return (
      <div className="bg-[#111318] border border-zinc-800/80 rounded-lg p-6 text-xs text-zinc-400">
        Acesso restrito à Coordenação de Limpeza.
      </div>
    );
  }

  // Apenas membros presenciais em Lagarto entram na escala física
  const presencialMembers = members.filter(
    (m) => m.status === "ATIVO" && m.workMode === "PRESENCIAL_LAGARTO"
  );

  const toggleDay = (day: string) => {
    setSelectedDays((prev) =>
      prev.includes(day) ? prev.filter((d) => d !== day) : [...prev, day]
    );
  };

  const selectWeekdays = () => {
    setSelectedDays(["Segunda", "Terça", "Quarta", "Quinta", "Sexta"]);
  };

  const selectAllDays = () => {
    setSelectedDays([...WEEK_DAYS]);
  };

  const openEditTask = (t: CleaningTaskRow) => {
    setEditingTask(t);
    const parsedDays = WEEK_DAYS.filter((d) =>
      t.daysOfWeek.toLowerCase().includes(d.toLowerCase())
    );
    setSelectedDays(parsedDays.length > 0 ? parsedDays : ["Segunda"]);
    setTaskTitle(t.taskTitle);
    setNotes(t.notes || "");
    setSelectedMembers(t.assignedMemberIds || []);
  };

  const cancelEdit = () => {
    setEditingTask(null);
    setSelectedDays(["Segunda"]);
    setTaskTitle("");
    setNotes("");
    setSelectedMembers([]);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!taskTitle.trim() || selectedDays.length === 0) return;
    const daysLabel = selectedDays.join(", ");

    if (editingTask) {
      await updateCleaningTask(editingTask.id, {
        daysOfWeek: daysLabel,
        taskTitle: taskTitle.trim(),
        assignedMemberIds: selectedMembers,
        notes: notes.trim(),
      });
    } else {
      await addCleaningTask({
        daysOfWeek: daysLabel,
        taskTitle: taskTitle.trim(),
        assignedMemberIds: selectedMembers,
        notes: notes.trim(),
      });
    }
    cancelEdit();
  };

  return (
    <div className="space-y-6">
      <div className="border-b border-zinc-800/80 pb-4">
        <h1 className="text-lg font-semibold text-zinc-100">Coordenação de Limpeza</h1>
        <p className="text-xs text-zinc-400 mt-0.5">
          Quadro semanal de organização física do laboratório (permite selecionar múltiplos dias da semana para tarefas diárias ou recorrentes).
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 text-xs">
        <div className="lg:col-span-2 bg-[#111318] border border-zinc-800/80 rounded-lg p-5 space-y-3">
          <h2 className="text-sm font-semibold text-zinc-100">Quadro Semanal de Tarefas</h2>
          {cleaningTasks.length === 0 ? (
            <p className="text-zinc-500">Nenhuma tarefa cadastrada no quadro.</p>
          ) : (
            <div className="divide-y divide-zinc-800/60">
              {cleaningTasks.map((t) => {
                const names = t.assignedMemberIds
                  .map((id) => members.find((m) => m.id === id)?.name)
                  .filter(Boolean)
                  .join(", ");
                return (
                  <div
                    key={t.id}
                    className="py-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-2"
                  >
                    <div>
                      <span className="font-semibold text-emerald-400">{t.daysOfWeek}: </span>
                      <span className="font-medium text-zinc-100">{t.taskTitle}</span>
                      <div className="text-[11px] text-zinc-400 mt-0.5">
                        Responsáveis: {names || "A definir"}
                      </div>
                      {t.notes && <div className="text-[11px] text-zinc-500">{t.notes}</div>}
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <button
                        onClick={() => openEditTask(t)}
                        className="px-2.5 py-1 rounded bg-zinc-800 hover:bg-zinc-700 text-zinc-200"
                      >
                        Editar
                      </button>
                      <button
                        onClick={() => deleteCleaningTask(t.id)}
                        className="px-2.5 py-1 rounded bg-red-950/50 hover:bg-red-900/60 text-red-300 border border-red-900/40"
                      >
                        Excluir
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        <form
          onSubmit={handleSave}
          className="bg-[#111318] border border-zinc-800/80 rounded-lg p-5 space-y-3"
        >
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-semibold text-zinc-100">
              {editingTask ? "Editar Tarefa do Quadro" : "Adicionar Tarefa ao Quadro"}
            </h2>
            {editingTask && (
              <button
                type="button"
                onClick={cancelEdit}
                className="text-[11px] text-zinc-400 hover:text-white"
              >
                Cancelar
              </button>
            )}
          </div>

          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="block text-zinc-400">Dias da Semana *</label>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={selectWeekdays}
                  className="text-[11px] text-emerald-400 hover:underline"
                >
                  Seg a Sex
                </button>
                <button
                  type="button"
                  onClick={selectAllDays}
                  className="text-[11px] text-emerald-400 hover:underline"
                >
                  Todos
                </button>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-1.5 bg-zinc-900 border border-zinc-800 rounded p-2.5">
              {WEEK_DAYS.map((day) => (
                <label key={day} className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={selectedDays.includes(day)}
                    onChange={() => toggleDay(day)}
                  />
                  <span className="text-zinc-200">{day}</span>
                </label>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-zinc-400 mb-1">Tarefa *</label>
            <input
              type="text"
              required
              value={taskTitle}
              onChange={(e) => setTaskTitle(e.target.value)}
              placeholder="Ex.: Varrer o chão / Organizar bancada de solda"
              className="w-full bg-zinc-900 border border-zinc-800 rounded px-3 py-1.5 text-zinc-100"
            />
          </div>

          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="block text-zinc-400">Responsáveis (Presenciais)</label>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setSelectedMembers(presencialMembers.map((m) => m.id))}
                  className="text-[11px] text-emerald-400 hover:underline"
                >
                  Todos
                </button>
                <button
                  type="button"
                  onClick={() => setSelectedMembers([])}
                  className="text-[11px] text-zinc-400 hover:underline"
                >
                  Limpar
                </button>
              </div>
            </div>
            <div className="max-h-36 overflow-y-auto bg-zinc-900 border border-zinc-800 rounded p-2 space-y-1">
              {presencialMembers.map((m) => (
                <label key={m.id} className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={selectedMembers.includes(m.id)}
                    onChange={() =>
                      setSelectedMembers((prev) =>
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

          <div>
            <label className="block text-zinc-400 mb-1">Observações</label>
            <input
              type="text"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full bg-zinc-900 border border-zinc-800 rounded px-3 py-1.5 text-zinc-100"
            />
          </div>

          <button
            type="submit"
            className="w-full py-2 rounded bg-emerald-600 hover:bg-emerald-500 text-white font-medium"
          >
            {editingTask ? "Salvar Alterações" : "Salvar no Quadro"}
          </button>
        </form>
      </div>
    </div>
  );
}
