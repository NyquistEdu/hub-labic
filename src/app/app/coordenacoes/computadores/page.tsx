"use client";

import React, { useState } from "react";
import { useLabic } from "@/context/LabicContext";
import { EquipmentAsset } from "@/types/labic";

export default function CoordenacaoComputadoresPage() {
  const {
    equipmentAssets,
    hasCoordination,
    addEquipmentAsset,
    updateEquipmentAsset,
    deleteEquipmentAsset,
    updateEquipmentStatus,
  } = useLabic();

  const [editingPc, setEditingPc] = useState<EquipmentAsset | null>(null);
  const [name, setName] = useState("");
  const [code, setCode] = useState("");
  const [specs, setSpecs] = useState("");

  if (!hasCoordination("COMPUTADORES")) {
    return (
      <div className="bg-[#111318] border border-zinc-800/80 rounded-lg p-6 text-xs text-zinc-400">
        Acesso restrito à Coordenação de Computadores.
      </div>
    );
  }

  const computers = equipmentAssets.filter((e) => e.assetType === "COMPUTADOR");

  const openEdit = (pc: EquipmentAsset) => {
    setEditingPc(pc);
    setName(pc.name);
    setCode(pc.code);
    setSpecs(pc.specs || "");
  };

  const cancelEdit = () => {
    setEditingPc(null);
    setName("");
    setCode("");
    setSpecs("");
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !code.trim()) return;
    if (editingPc) {
      await updateEquipmentAsset(editingPc.id, {
        name: name.trim(),
        code: code.trim(),
        specs: specs.trim(),
      });
    } else {
      await addEquipmentAsset({
        name: name.trim(),
        code: code.trim(),
        assetType: "COMPUTADOR",
        status: "OPERACIONAL",
        specs: specs.trim(),
      });
    }
    cancelEdit();
  };

  return (
    <div className="space-y-6">
      <div className="border-b border-zinc-800/80 pb-4">
        <h1 className="text-lg font-semibold text-zinc-100">Coordenação de Computadores</h1>
        <p className="text-xs text-zinc-400 mt-0.5">
          Inventário de computadores e estações de trabalho do laboratório.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 text-xs">
        <div className="lg:col-span-2 bg-[#111318] border border-zinc-800/80 rounded-lg p-5 space-y-3">
          <h2 className="text-sm font-semibold text-zinc-100">Estações de Trabalho (PCs)</h2>
          {computers.length === 0 ? (
            <p className="text-zinc-500">Nenhum computador cadastrado.</p>
          ) : (
            <div className="divide-y divide-zinc-800/60">
              {computers.map((pc) => (
                <div
                  key={pc.id}
                  className="py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2"
                >
                  <div>
                    <div className="font-medium text-zinc-100">
                      [{pc.code}] {pc.name}
                    </div>
                    {pc.specs && <div className="text-[11px] text-zinc-500">{pc.specs}</div>}
                    {pc.maintenanceNeed && (
                      <div className="text-[11px] text-amber-400 mt-0.5">
                        Observação: {pc.maintenanceNeed}
                      </div>
                    )}
                  </div>
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-zinc-300 font-medium mr-1">{pc.status}</span>
                    <button
                      onClick={() => updateEquipmentStatus(pc.id, "OPERACIONAL", "")}
                      className="px-2 py-1 rounded bg-emerald-600 text-white"
                    >
                      Operacional
                    </button>
                    <button
                      onClick={() =>
                        updateEquipmentStatus(
                          pc.id,
                          "EM_MANUTENCAO",
                          pc.maintenanceNeed || "Formatação / Reparo"
                        )
                      }
                      className="px-2 py-1 rounded bg-zinc-800 text-zinc-200"
                    >
                      Manutenção
                    </button>
                    <button
                      onClick={() => openEdit(pc)}
                      className="px-2 py-1 rounded bg-zinc-800 text-zinc-300"
                    >
                      Editar
                    </button>
                    <button
                      onClick={() => deleteEquipmentAsset(pc.id)}
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
              {editingPc ? "Editar Computador" : "Cadastrar Computador"}
            </h2>
            {editingPc && (
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
            <label className="block text-zinc-400 mb-1">Identificação da Máquina *</label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Ex.: Workstation LABIC 01"
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
              placeholder="Ex.: IFS-PC-01"
              className="w-full bg-zinc-900 border border-zinc-800 rounded px-3 py-1.5 text-zinc-100"
            />
          </div>
          <div>
            <label className="block text-zinc-400 mb-1">Configuração (CPU, RAM, GPU, SO)</label>
            <input
              type="text"
              value={specs}
              onChange={(e) => setSpecs(e.target.value)}
              placeholder="Ex.: Ryzen 7, 32GB RAM, RTX 3060"
              className="w-full bg-zinc-900 border border-zinc-800 rounded px-3 py-1.5 text-zinc-100"
            />
          </div>
          <button
            type="submit"
            className="w-full py-2 rounded bg-emerald-600 hover:bg-emerald-500 text-white font-medium"
          >
            {editingPc ? "Salvar Alterações" : "Salvar Computador"}
          </button>
        </form>
      </div>
    </div>
  );
}
