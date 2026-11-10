"use client";

import React, { useState } from "react";
import { useLabic } from "@/context/LabicContext";
import { InventoryItem } from "@/types/labic";

export default function CoordenacaoInsumosPage() {
  const {
    inventory,
    supplyRequests,
    members,
    hasCoordination,
    addInventoryItem,
    updateInventoryItem,
    deleteInventoryItem,
    updateSupplyRequestStatus,
    deleteSupplyRequest,
  } = useLabic();

  const [editingItem, setEditingItem] = useState<InventoryItem | null>(null);
  const [name, setName] = useState("");
  const [category, setCategory] = useState("Microcontrolador");
  const [quantityAvailable, setQuantityAvailable] = useState(5);
  const [isReturnableEquipment, setIsReturnableEquipment] = useState(false);
  const [locationBin, setLocationBin] = useState("");
  const [noteByReq, setNoteByReq] = useState<Record<string, string>>({});

  if (!hasCoordination("INSUMOS")) {
    return (
      <div className="bg-[#111318] border border-zinc-800/80 rounded-lg p-6 text-xs text-zinc-400">
        Acesso restrito à Coordenação de Insumos.
      </div>
    );
  }

  const openEdit = (item: InventoryItem) => {
    setEditingItem(item);
    setName(item.name);
    setCategory(item.category);
    setQuantityAvailable(item.quantityAvailable);
    setIsReturnableEquipment(item.isReturnableEquipment);
    setLocationBin(item.locationBin);
  };

  const cancelEdit = () => {
    setEditingItem(null);
    setName("");
    setCategory("Microcontrolador");
    setQuantityAvailable(5);
    setIsReturnableEquipment(false);
    setLocationBin("");
  };

  const handleSaveItem = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    if (editingItem) {
      await updateInventoryItem(editingItem.id, {
        name: name.trim(),
        category: category.trim(),
        quantityAvailable: Number(quantityAvailable) || 0,
        isReturnableEquipment,
        locationBin: locationBin.trim() || "Armário Principal",
      });
    } else {
      await addInventoryItem({
        name: name.trim(),
        category: category.trim(),
        quantityAvailable: Number(quantityAvailable) || 1,
        isReturnableEquipment,
        locationBin: locationBin.trim() || "Armário Principal",
      });
    }
    cancelEdit();
  };

  return (
    <div className="space-y-6">
      <div className="border-b border-zinc-800/80 pb-4">
        <h1 className="text-lg font-semibold text-zinc-100">Coordenação de Insumos</h1>
        <p className="text-xs text-zinc-400 mt-0.5">
          Controle de estoque de componentes eletrônicos e aprovação de solicitações (consumíveis e empréstimos retornáveis).
        </p>
      </div>

      <div className="bg-[#111318] border border-zinc-800/80 rounded-lg p-5 space-y-3 text-xs">
        <h2 className="text-sm font-semibold text-zinc-100">Solicitações de Pesquisadores</h2>
        {supplyRequests.length === 0 ? (
          <p className="text-zinc-500">Nenhuma solicitação de insumo registrada.</p>
        ) : (
          <div className="divide-y divide-zinc-800/60">
            {supplyRequests.map((req) => {
              const reqMember =
                members.find((m) => m.id === req.requesterId)?.name || req.requesterId;
              return (
                <div key={req.id} className="py-3 space-y-2">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div>
                      <span className="font-medium text-zinc-100">
                        {req.quantity}x {req.itemName}
                      </span>
                      <span className="text-zinc-400 ml-2">· Solicitante: {reqMember}</span>
                      <div className="text-[11px] text-zinc-500">
                        {req.requestType} · {req.createdAt}
                      </div>
                    </div>
                    <span className="text-emerald-400 font-medium">{req.status}</span>
                  </div>

                  <div className="flex flex-wrap items-center gap-2">
                    <input
                      type="text"
                      placeholder="Observação / gaveta para retirada..."
                      value={noteByReq[req.id] ?? req.coordinatorResponse ?? ""}
                      onChange={(e) =>
                        setNoteByReq((prev) => ({ ...prev, [req.id]: e.target.value }))
                      }
                      className="flex-1 min-w-[200px] bg-zinc-900 border border-zinc-800 rounded px-2.5 py-1 text-zinc-100"
                    />
                    <button
                      onClick={() =>
                        updateSupplyRequestStatus(
                          req.id,
                          "APROVADO_ENTREGUE",
                          noteByReq[req.id] || req.coordinatorResponse || "Liberado"
                        )
                      }
                      className="px-2.5 py-1 rounded bg-emerald-600 text-white"
                    >
                      Aprovar / Entregar
                    </button>
                    <button
                      onClick={() =>
                        updateSupplyRequestStatus(
                          req.id,
                          "EM_FALTA_COMPRAR",
                          noteByReq[req.id] || req.coordinatorResponse || "Em falta"
                        )
                      }
                      className="px-2.5 py-1 rounded bg-zinc-800 text-zinc-200"
                    >
                      Em Falta
                    </button>
                    {req.requestType === "EMPRESTIMO_CAUTELA" && (
                      <button
                        onClick={() =>
                          updateSupplyRequestStatus(
                            req.id,
                            "DEVOLVIDO",
                            noteByReq[req.id] || req.coordinatorResponse || "Devolvido"
                          )
                        }
                        className="px-2.5 py-1 rounded bg-zinc-800 text-zinc-200"
                      >
                        Devolvido
                      </button>
                    )}
                    <button
                      onClick={() =>
                        updateSupplyRequestStatus(
                          req.id,
                          "RECUSADO",
                          noteByReq[req.id] || req.coordinatorResponse || "Recusado"
                        )
                      }
                      className="px-2.5 py-1 rounded bg-amber-950/60 text-amber-300 border border-amber-900/50"
                    >
                      Recusar
                    </button>
                    <button
                      onClick={() => deleteSupplyRequest(req.id)}
                      className="px-2.5 py-1 rounded bg-red-950/60 text-red-300 border border-red-900/50"
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

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 text-xs">
        <div className="lg:col-span-2 bg-[#111318] border border-zinc-800/80 rounded-lg p-5 space-y-3">
          <h2 className="text-sm font-semibold text-zinc-100">Inventário de Componentes</h2>
          {inventory.length === 0 ? (
            <p className="text-zinc-500">Nenhum item cadastrado no inventário.</p>
          ) : (
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-zinc-800 text-zinc-400">
                  <th className="py-2 font-medium">Componente</th>
                  <th className="py-2 font-medium">Categoria</th>
                  <th className="py-2 font-medium">Localização</th>
                  <th className="py-2 font-medium text-right">Disponível</th>
                  <th className="py-2 font-medium text-right">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-800/60">
                {inventory.map((inv) => (
                  <tr key={inv.id}>
                    <td className="py-2.5 font-medium text-zinc-100">{inv.name}</td>
                    <td className="py-2.5 text-zinc-400">{inv.category}</td>
                    <td className="py-2.5 text-zinc-400">{inv.locationBin}</td>
                    <td className="py-2.5 text-right text-zinc-200">{inv.quantityAvailable}</td>
                    <td className="py-2.5 text-right space-x-2">
                      <button
                        onClick={() => openEdit(inv)}
                        className="text-zinc-300 hover:text-white"
                      >
                        Editar
                      </button>
                      <button
                        onClick={() => deleteInventoryItem(inv.id)}
                        className="text-red-400 hover:text-red-300"
                      >
                        Excluir
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        <form
          onSubmit={handleSaveItem}
          className="bg-[#111318] border border-zinc-800/80 rounded-lg p-5 space-y-3"
        >
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-semibold text-zinc-100">
              {editingItem ? "Editar Componente" : "Cadastrar Item no Estoque"}
            </h2>
            {editingItem && (
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
            <label className="block text-zinc-400 mb-1">Nome do Componente *</label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Ex.: ESP32 NodeMCU"
              className="w-full bg-zinc-900 border border-zinc-800 rounded px-3 py-1.5 text-zinc-100"
            />
          </div>
          <div>
            <label className="block text-zinc-400 mb-1">Categoria</label>
            <input
              type="text"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              placeholder="Ex.: Microcontrolador, Sensor..."
              className="w-full bg-zinc-900 border border-zinc-800 rounded px-3 py-1.5 text-zinc-100"
            />
          </div>
          <div>
            <label className="block text-zinc-400 mb-1">Quantidade Disponível</label>
            <input
              type="number"
              min={0}
              value={quantityAvailable}
              onChange={(e) => setQuantityAvailable(Number(e.target.value))}
              className="w-full bg-zinc-900 border border-zinc-800 rounded px-3 py-1.5 text-zinc-100"
            />
          </div>
          <div>
            <label className="block text-zinc-400 mb-1">Armário / Gaveta</label>
            <input
              type="text"
              value={locationBin}
              onChange={(e) => setLocationBin(e.target.value)}
              placeholder="Ex.: Armário A - Gaveta 2"
              className="w-full bg-zinc-900 border border-zinc-800 rounded px-3 py-1.5 text-zinc-100"
            />
          </div>
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={isReturnableEquipment}
              onChange={(e) => setIsReturnableEquipment(e.target.checked)}
            />
            <span className="text-zinc-300">Item retornável (cautela)</span>
          </label>
          <button
            type="submit"
            className="w-full py-2 rounded bg-emerald-600 hover:bg-emerald-500 text-white font-medium"
          >
            {editingItem ? "Salvar Alterações" : "Adicionar ao Estoque"}
          </button>
        </form>
      </div>
    </div>
  );
}
