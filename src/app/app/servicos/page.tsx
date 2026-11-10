"use client";

import React, { useState } from "react";
import { useLabic } from "@/context/LabicContext";
import {
  EQUIPMENT_STATUS_LABELS,
  formatDateBR,
  SUPPLY_REQUEST_STATUS_LABELS,
  SUPPLY_REQUEST_TYPE_LABELS,
} from "@/types/labic";

const PRINT_STATUS_LABELS: Record<string, string> = {
  AGUARDANDO_APROVACAO: "Aguardando Aprovação do Coordenador",
  APROVADO_PARA_IMPRIMIR: "Aprovado — Liberado para Usar a Impressora",
  NA_FILA: "Na Fila",
  IMPRIMINDO: "Em Impressão",
  CONCLUIDO: "Concluído",
  FALHA_REIMPRIMIR: "Recusado / Reimprimir",
};

export default function ServicosPage() {
  const {
    currentUser,
    members,
    inventory,
    supplyRequests,
    print3DRequests,
    equipmentAssets,
    cleaningTasks,
    mediaSlots,
    addSupplyRequest,
    deleteSupplyRequest,
    addPrint3DRequest,
    deletePrint3DRequest,
    updateEquipmentStatus,
  } = useLabic();

  const [itemName, setItemName] = useState("");
  const [quantity, setQuantity] = useState(1);
  const [requestType, setRequestType] = useState<"CONSUMIVEL" | "EMPRESTIMO_CAUTELA">(
    "CONSUMIVEL"
  );

  const [partName, setPartName] = useState("");
  const [stlFileName, setStlFileName] = useState("");
  const [material, setMaterial] = useState("PLA");
  const [estimatedGrams, setEstimatedGrams] = useState(30);

  const [selectedAssetId, setSelectedAssetId] = useState("");
  const [issueNote, setIssueNote] = useState("");

  if (!currentUser) return null;

  const handleRequestSupply = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!itemName.trim()) return;
    await addSupplyRequest({
      requesterId: currentUser.id,
      itemName: itemName.trim(),
      quantity: Number(quantity) || 1,
      requestType,
    });
    setItemName("");
    setQuantity(1);
  };

  const handleRequest3D = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!partName.trim()) return;
    await addPrint3DRequest({
      requesterId: currentUser.id,
      partName: partName.trim(),
      stlFileName: stlFileName.trim() || "Solicitação de uso da impressora",
      material,
      estimatedGrams: Number(estimatedGrams) || 20,
      printerAssigned: "Impressora 3D LABIC",
    });
    setPartName("");
    setStlFileName("");
  };

  const handleReportIssue = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedAssetId || !issueNote.trim()) return;
    await updateEquipmentStatus(selectedAssetId, "PRECISA_MANUTENCAO", issueNote.trim());
    setSelectedAssetId("");
    setIssueNote("");
  };

  const mySupplies = supplyRequests.filter((r) => r.requesterId === currentUser.id);
  const my3D = print3DRequests.filter((j) => j.requesterId === currentUser.id);

  return (
    <div className="space-y-6">
      <div className="border-b border-zinc-800/80 pb-4">
        <h1 className="text-lg font-semibold text-zinc-100">Solicitações e Escalas</h1>
        <p className="text-xs text-zinc-400 mt-0.5">
          Solicite componentes eletrônicos, peça autorização para uso da impressora 3D, reporte defeitos em equipamentos e consulte as escalas.
        </p>
      </div>

      {/* 3 Full-Width Rows for Requests */}
      <div className="space-y-4 text-xs">
        {/* Linha 1: Solicitar Componente / Insumo */}
        <form
          onSubmit={handleRequestSupply}
          className="bg-[#111318] border border-zinc-800/80 rounded-lg p-5 space-y-3"
        >
          <div>
            <h2 className="text-sm font-semibold text-zinc-100">1. Solicitar Componente ou Insumo</h2>
            <p className="text-[11px] text-zinc-400 mt-0.5">
              Peça componentes eletrônicos do estoque (como consumível definitivo ou empréstimo retornável).
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-3 items-end">
            <div className="md:col-span-2">
              <label className="block text-zinc-400 mb-1">Componente / Item *</label>
              <input
                type="text"
                required
                list="inventory-suggestions"
                value={itemName}
                onChange={(e) => setItemName(e.target.value)}
                placeholder="Ex.: ESP32, Sensor DHT22, Jumpers..."
                className="w-full bg-zinc-900 border border-zinc-800 rounded px-3 py-2 text-zinc-100"
              />
              <datalist id="inventory-suggestions">
                {inventory.map((inv) => (
                  <option key={inv.id} value={inv.name} />
                ))}
              </datalist>
            </div>
            <div>
              <label className="block text-zinc-400 mb-1">Quantidade & Modalidade</label>
              <div className="grid grid-cols-2 gap-2">
                <input
                  type="number"
                  min={1}
                  value={quantity}
                  onChange={(e) => setQuantity(Number(e.target.value))}
                  className="w-full bg-zinc-900 border border-zinc-800 rounded px-3 py-2 text-zinc-100"
                />
                <select
                  value={requestType}
                  onChange={(e) =>
                    setRequestType(e.target.value as "CONSUMIVEL" | "EMPRESTIMO_CAUTELA")
                  }
                  className="w-full bg-zinc-900 border border-zinc-800 rounded px-2 py-2 text-zinc-100"
                >
                  <option value="CONSUMIVEL">Consumível</option>
                  <option value="EMPRESTIMO_CAUTELA">Empréstimo</option>
                </select>
              </div>
            </div>
            <div>
              <button
                type="submit"
                className="w-full py-2 px-4 rounded bg-emerald-600 hover:bg-emerald-500 text-white font-medium"
              >
                Enviar Pedido de Insumo
              </button>
            </div>
          </div>
        </form>

        {/* Linha 2: Solicitar Aprovação para Impressão 3D */}
        <form
          onSubmit={handleRequest3D}
          className="bg-[#111318] border border-zinc-800/80 rounded-lg p-5 space-y-3"
        >
          <div>
            <h2 className="text-sm font-semibold text-zinc-100">
              2. Solicitar Autorização para Impressão 3D
            </h2>
            <p className="text-[11px] text-zinc-400 mt-0.5">
              Solicite aprovação à Coordenação de Impressão 3D informando a peça, filamento e peso estimado. Após aprovado pelo coordenador, você poderá realizar a impressão e o coordenador dará baixa como concluída.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-5 gap-3 items-end">
            <div className="md:col-span-2">
              <label className="block text-zinc-400 mb-1">Nome / Finalidade da Peça *</label>
              <input
                type="text"
                required
                value={partName}
                onChange={(e) => setPartName(e.target.value)}
                placeholder="Ex.: Suporte para Sensor Ultrassônico (Projeto Robótica)"
                className="w-full bg-zinc-900 border border-zinc-800 rounded px-3 py-2 text-zinc-100"
              />
            </div>
            <div>
              <label className="block text-zinc-400 mb-1">Observação / Link Externo (opcional)</label>
              <input
                type="text"
                value={stlFileName}
                onChange={(e) => setStlFileName(e.target.value)}
                placeholder="Tempo estimado ou link Drive"
                className="w-full bg-zinc-900 border border-zinc-800 rounded px-3 py-2 text-zinc-100"
              />
            </div>
            <div>
              <label className="block text-zinc-400 mb-1">Filamento & Peso (g)</label>
              <div className="grid grid-cols-2 gap-2">
                <select
                  value={material}
                  onChange={(e) => setMaterial(e.target.value)}
                  className="w-full bg-zinc-900 border border-zinc-800 rounded px-2 py-2 text-zinc-100"
                >
                  <option value="PLA">PLA</option>
                  <option value="PETG">PETG</option>
                  <option value="ABS">ABS</option>
                  <option value="TPU">TPU</option>
                </select>
                <input
                  type="number"
                  min={1}
                  value={estimatedGrams}
                  onChange={(e) => setEstimatedGrams(Number(e.target.value))}
                  className="w-full bg-zinc-900 border border-zinc-800 rounded px-2 py-2 text-zinc-100"
                />
              </div>
            </div>
            <div>
              <button
                type="submit"
                className="w-full py-2 px-4 rounded bg-emerald-600 hover:bg-emerald-500 text-white font-medium"
              >
                Solicitar Uso da Impressora
              </button>
            </div>
          </div>
        </form>

        {/* Linha 3: Reportar Defeito / Manutenção */}
        <form
          onSubmit={handleReportIssue}
          className="bg-[#111318] border border-zinc-800/80 rounded-lg p-5 space-y-3"
        >
          <div>
            <h2 className="text-sm font-semibold text-zinc-100">3. Reportar Defeito / Manutenção</h2>
            <p className="text-[11px] text-zinc-400 mt-0.5">
              Informe problemas em equipamentos de bancada ou computadores do laboratório.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-3 items-end">
            <div>
              <label className="block text-zinc-400 mb-1">Equipamento ou Computador *</label>
              <select
                required
                value={selectedAssetId}
                onChange={(e) => setSelectedAssetId(e.target.value)}
                className="w-full bg-zinc-900 border border-zinc-800 rounded px-3 py-2 text-zinc-100"
              >
                <option value="">Selecione o patrimônio...</option>
                {equipmentAssets.map((eq) => (
                  <option key={eq.id} value={eq.id}>
                    [{eq.code}] {eq.name} ({EQUIPMENT_STATUS_LABELS[eq.status] || eq.status})
                  </option>
                ))}
              </select>
            </div>
            <div className="md:col-span-2">
              <label className="block text-zinc-400 mb-1">Descrição do Problema *</label>
              <input
                type="text"
                required
                value={issueNote}
                onChange={(e) => setIssueNote(e.target.value)}
                placeholder="Descreva o defeito apresentado..."
                className="w-full bg-zinc-900 border border-zinc-800 rounded px-3 py-2 text-zinc-100"
              />
            </div>
            <div>
              <button
                type="submit"
                className="w-full py-2 px-4 rounded bg-zinc-800 hover:bg-zinc-700 text-zinc-100 font-medium"
              >
                Registrar Chamado
              </button>
            </div>
          </div>
        </form>
      </div>

      {/* Bottom Cards in 2-Column Blocks */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 text-xs">
        <div className="bg-[#111318] border border-zinc-800/80 rounded-lg p-5 space-y-3">
          <h2 className="text-sm font-semibold text-zinc-100">Meus Pedidos de Insumos</h2>
          {mySupplies.length === 0 ? (
            <p className="text-zinc-500">Nenhum pedido de insumo realizado.</p>
          ) : (
            <div className="divide-y divide-zinc-800/60">
              {mySupplies.map((req) => (
                <div key={req.id} className="py-2.5 flex items-center justify-between gap-2">
                  <div>
                    <div className="font-medium text-zinc-200">
                      {req.quantity}x {req.itemName}
                    </div>
                    <div className="text-[11px] text-zinc-500">
                      {SUPPLY_REQUEST_TYPE_LABELS[req.requestType] || req.requestType} ·{" "}
                      {formatDateBR(req.createdAt)}
                    </div>
                    {req.coordinatorResponse && (
                      <div className="text-[11px] text-emerald-400 mt-0.5">
                        Parecer: {req.coordinatorResponse}
                      </div>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-[11px] text-zinc-300 px-2 py-0.5 rounded bg-zinc-900 border border-zinc-800">
                      {SUPPLY_REQUEST_STATUS_LABELS[req.status] || req.status}
                    </span>
                    <button
                      onClick={() => deleteSupplyRequest(req.id)}
                      className="text-[11px] text-red-400 hover:underline"
                    >
                      Excluir
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="bg-[#111318] border border-zinc-800/80 rounded-lg p-5 space-y-3">
          <h2 className="text-sm font-semibold text-zinc-100">
            Minhas Solicitações de Impressão 3D
          </h2>
          {my3D.length === 0 ? (
            <p className="text-zinc-500">Nenhuma solicitação de impressão 3D enviada.</p>
          ) : (
            <div className="divide-y divide-zinc-800/60">
              {my3D.map((job) => (
                <div key={job.id} className="py-2.5 flex items-center justify-between gap-2">
                  <div>
                    <div className="font-medium text-zinc-200">{job.partName}</div>
                    <div className="text-[11px] text-zinc-500">
                      Filamento {job.material} · {job.estimatedGrams}g · {job.stlFileName}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span
                      className={`text-[11px] px-2 py-0.5 rounded border ${
                        job.status === "APROVADO_PARA_IMPRIMIR" || job.status === "CONCLUIDO"
                          ? "bg-emerald-950/50 border-emerald-800/60 text-emerald-300"
                          : "bg-zinc-900 border-zinc-800 text-zinc-300"
                      }`}
                    >
                      {PRINT_STATUS_LABELS[job.status] || job.status}
                    </span>
                    <button
                      onClick={() => deletePrint3DRequest(job.id)}
                      className="text-[11px] text-red-400 hover:underline"
                    >
                      Excluir
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 text-xs">
        <div className="bg-[#111318] border border-zinc-800/80 rounded-lg p-5 space-y-3">
          <h2 className="text-sm font-semibold text-zinc-100">Quadro Semanal de Limpeza</h2>
          {cleaningTasks.length === 0 ? (
            <p className="text-zinc-500">Nenhuma tarefa cadastrada no quadro de limpeza.</p>
          ) : (
            <div className="divide-y divide-zinc-800/60">
              {cleaningTasks.map((t) => {
                const names = t.assignedMemberIds
                  .map((id) => members.find((m) => m.id === id)?.name)
                  .filter(Boolean)
                  .join(", ");
                return (
                  <div key={t.id} className="py-2.5 flex items-center justify-between gap-2">
                    <div>
                      <span className="font-medium text-emerald-400">{t.daysOfWeek}: </span>
                      <span className="text-zinc-200 font-medium">{t.taskTitle}</span>
                      <div className="text-[11px] text-zinc-400">Responsáveis: {names || "—"}</div>
                    </div>
                    {t.notes && <span className="text-[11px] text-zinc-500">{t.notes}</span>}
                  </div>
                );
              })}
            </div>
          )}
        </div>

        <div className="bg-[#111318] border border-zinc-800/80 rounded-lg p-5 space-y-3">
          <h2 className="text-sm font-semibold text-zinc-100">Cronograma de Postagens (Mídia)</h2>
          {mediaSlots.length === 0 ? (
            <p className="text-zinc-500">Nenhum sorteio mensal de mídia gerado.</p>
          ) : (
            <div className="divide-y divide-zinc-800/60">
              {mediaSlots.map((slot) => {
                const mName =
                  members.find((m) => m.id === slot.assignedProfileId)?.name ||
                  slot.assignedProfileId;
                return (
                  <div key={slot.id} className="py-2 flex items-center justify-between">
                    <span className="text-zinc-200 font-medium">{mName}</span>
                    <span className="text-zinc-400">
                      {formatDateBR(slot.scheduledDate)} · {slot.topicSuggestion}
                    </span>
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
