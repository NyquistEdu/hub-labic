"use client";

import React, { useState } from "react";
import { useLabic } from "@/context/LabicContext";
import { EQUIPMENT_STATUS_LABELS, EquipmentAsset } from "@/types/labic";

export default function CoordenacaoManutencaoPage() {
  const {
    equipmentAssets,
    hasCoordination,
    addEquipmentAsset,
    updateEquipmentAsset,
    deleteEquipmentAsset,
    updateEquipmentStatus,
  } = useLabic();

  const [editingEq, setEditingEq] = useState<EquipmentAsset | null>(null);
  const [name, setName] = useState("");
  const [code, setCode] = useState("");
  const [specs, setSpecs] = useState("");

  if (!hasCoordination("MANUTENCAO")) {
    return (
      <div className="bg-[#111318] border border-zinc-800/80 rounded-lg p-6 text-xs text-zinc-400">
        Acesso restrito à Coordenação de Manutenção.
      </div>
    );
  }

  const benchAssets = equipmentAssets.filter((e) => e.assetType !== "COMPUTADOR");

  const openEdit = (eq: EquipmentAsset) => {
    setEditingEq(eq);
    setName(eq.name);
    setCode(eq.code);
    setSpecs(eq.specs || "");
  };

  const cancelEdit = () => {
    setEditingEq(null);
    setName("");
    setCode("");
    setSpecs("");
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !code.trim()) return;
    if (editingEq) {
      await updateEquipmentAsset(editingEq.id, {
        name: name.trim(),
        code: code.trim(),
        specs: specs.trim(),
      });
    } else {
      await addEquipmentAsset({
        name: name.trim(),
        code: code.trim(),
        assetType: "EQUIPAMENTO_BANCADA",
        status: "OPERACIONAL",
        specs: specs.trim(),
      });
    }
    cancelEdit();
  };

  return (
    <div className="space-y-6">
      <div className="border-b border-zinc-800/80 pb-4">
        <h1 className="text-lg font-semibold text-zinc-100">Coordenação de Manutenção</h1>
        <p className="text-xs text-zinc-400 mt-0.5">
          Controle de equipamentos de bancada, impressoras e atendimento de chamados de reparo.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 text-xs">
        <div className="lg:col-span-2 bg-[#111318] border border-zinc-800/80 rounded-lg p-5 space-y-3">
          <h2 className="text-sm font-semibold text-zinc-100">Equipamentos de Bancada</h2>
          {benchAssets.length === 0 ? (
            <p className="text-zinc-500">Nenhum equipamento de bancada cadastrado.</p>
          ) : (
            <div className="divide-y divide-zinc-800/60">
              {benchAssets.map((eq) => (
                <div
                  key={eq.id}
                  className="py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2"
                >
                  <div>
                    <div className="font-medium text-zinc-100">
                      [{eq.code}] {eq.name}
                    </div>
                    {eq.specs && <div className="text-[11px] text-zinc-500">{eq.specs}</div>}
                    {eq.maintenanceNeed && (
                      <div className="text-[11px] text-amber-400 mt-0.5">
                        Observação: {eq.maintenanceNeed}
                      </div>
                    )}
                  </div>
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-zinc-300 font-medium mr-1">
                      {EQUIPMENT_STATUS_LABELS[eq.status] || eq.status}
                    </span>
                    <button
                      onClick={() => updateEquipmentStatus(eq.id, "OPERACIONAL", "")}
                      className="px-2 py-1 rounded bg-emerald-600 text-white"
                    >
                      Operacional
                    </button>
                    <button
                      onClick={() =>
                        updateEquipmentStatus(
                          eq.id,
                          "EM_MANUTENCAO",
                          eq.maintenanceNeed || "Em revisão"
                        )
                      }
                      className="px-2 py-1 rounded bg-zinc-800 text-zinc-200"
                    >
                      Manutenção
                    </button>
                    <button
                      onClick={() => openEdit(eq)}
                      className="px-2 py-1 rounded bg-zinc-800 text-zinc-300"
                    >
                      Editar
                    </button>
                    <button
                      onClick={() => deleteEquipmentAsset(eq.id)}
                      className="px-2 py-1 rounded bg-red-950/50 text-red-300 border border-red-900/40"
                    >
                      Excluir
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <form
          onSubmit={handleSave}
          className="bg-[#111318] border border-zinc-800/80 rounded-lg p-5 space-y-3"
        >
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-semibold text-zinc-100">
              {editingEq ? "Editar Equipamento" : "Cadastrar Equipamento"}
            </h2>
            {editingEq && (
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
            <label className="block text-zinc-400 mb-1">Nome do Equipamento *</label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Ex.: Osciloscópio Digital"
              className="w-full bg-zinc-900 border border-zinc-800 rounded px-3 py-1.5 text-zinc-100"
            />
          </div>
          <div>
            <label className="block text-zinc-400 mb-1">Código de Patrimônio *</label>
            <input
              type="text"
              required
              value={code}
              onChange={(e) => setCode(e.target.value)}
              placeholder="Ex.: IFS-EQ-01"
              className="w-full bg-zinc-900 border border-zinc-800 rounded px-3 py-1.5 text-zinc-100"
            />
          </div>
          <div>
            <label className="block text-zinc-400 mb-1">Especificações</label>
            <input
              type="text"
              value={specs}
              onChange={(e) => setSpecs(e.target.value)}
              placeholder="Modelo / Série"
              className="w-full bg-zinc-900 border border-zinc-800 rounded px-3 py-1.5 text-zinc-100"
            />
          </div>
          <button
            type="submit"
            className="w-full py-2 rounded bg-emerald-600 hover:bg-emerald-500 text-white font-medium"
          >
            {editingEq ? "Salvar Alterações" : "Cadastrar Equipamento"}
          </button>
        </form>
      </div>
    </div>
  );
}
