"use client";

import React, { useState } from "react";
import { useLabic } from "@/context/LabicContext";

export default function CoordenacaoMidiaPage() {
  const {
    members,
    mediaSlots,
    hasCoordination,
    randomizeMediaSchedule,
    deleteMediaSlot,
  } = useLabic();

  const activeMembers = members.filter((m) => m.status === "ATIVO");
  const [monthLabel, setMonthLabel] = useState("Maio / 2026");
  const [eligibleIds, setEligibleIds] = useState<string[]>(activeMembers.map((m) => m.id));

  if (!hasCoordination("MIDIA")) {
    return (
      <div className="bg-[#111318] border border-zinc-800/80 rounded-lg p-6 text-xs text-zinc-400">
        Acesso restrito à Coordenação de Mídia.
      </div>
    );
  }

  const toggleEligible = (id: string) => {
    setEligibleIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };

  const handleRunDraw = async (e: React.FormEvent) => {
    e.preventDefault();
    if (eligibleIds.length === 0 || !monthLabel.trim()) return;
    await randomizeMediaSchedule(eligibleIds, monthLabel.trim());
  };

  return (
    <div className="space-y-6">
      <div className="border-b border-zinc-800/80 pb-4">
        <h1 className="text-lg font-semibold text-zinc-100">Coordenação de Mídia</h1>
        <p className="text-xs text-zinc-400 mt-0.5">
          Seleção de pesquisadores aptos no mês e sorteio automático de datas de postagem.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 text-xs">
        <form
          onSubmit={handleRunDraw}
          className="bg-[#111318] border border-zinc-800/80 rounded-lg p-5 space-y-4"
        >
          <h2 className="text-sm font-semibold text-zinc-100">Gerar Cronograma Mensal</h2>
          <div>
            <label className="block text-zinc-400 mb-1">Mês / Referência *</label>
            <input
              type="text"
              required
              value={monthLabel}
              onChange={(e) => setMonthLabel(e.target.value)}
              placeholder="Ex.: Maio / 2026"
              className="w-full bg-zinc-900 border border-zinc-800 rounded px-3 py-1.5 text-zinc-100"
            />
          </div>

          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="block text-zinc-400">
                Pesquisadores Aptos para o Sorteio ({eligibleIds.length})
              </label>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setEligibleIds(activeMembers.map((m) => m.id))}
                  className="text-[11px] text-emerald-400 hover:underline"
                >
                  Marcar todos
                </button>
                <button
                  type="button"
                  onClick={() => setEligibleIds([])}
                  className="text-[11px] text-zinc-400 hover:underline"
                >
                  Limpar
                </button>
              </div>
            </div>
            <div className="max-h-52 overflow-y-auto bg-zinc-900 border border-zinc-800 rounded p-2 space-y-1">
              {activeMembers.map((m) => (
                <label key={m.id} className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={eligibleIds.includes(m.id)}
                    onChange={() => toggleEligible(m.id)}
                  />
                  <span className="text-zinc-200">{m.name}</span>
                </label>
              ))}
            </div>
          </div>

          <button
            type="submit"
            className="w-full py-2 rounded bg-emerald-600 hover:bg-emerald-500 text-white font-medium"
          >
            Sortear Datas e Notificar Equipe
          </button>
        </form>

        <div className="bg-[#111318] border border-zinc-800/80 rounded-lg p-5 space-y-3">
          <h2 className="text-sm font-semibold text-zinc-100">Cronograma Sorteado</h2>
          {mediaSlots.length === 0 ? (
            <p className="text-zinc-500">Nenhum sorteio mensal realizado ainda.</p>
          ) : (
            <div className="divide-y divide-zinc-800/60">
              {mediaSlots.map((slot) => {
                const mName =
                  members.find((m) => m.id === slot.assignedProfileId)?.name ||
                  slot.assignedProfileId;
                return (
                  <div key={slot.id} className="py-2 flex items-center justify-between gap-2">
                    <div>
                      <span className="text-zinc-200 font-medium">{mName}</span>
                      <span className="text-zinc-500 ml-2">({slot.monthLabel})</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-zinc-400">
                        {slot.scheduledDate} · {slot.topicSuggestion}
                      </span>
                      <button
                        onClick={() => deleteMediaSlot(slot.id)}
                        className="text-red-400 hover:text-red-300"
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
      </div>
    </div>
  );
}
