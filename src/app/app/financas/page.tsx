"use client";

import React, { useState } from "react";
import { useLabic } from "@/context/LabicContext";
import { FinanceBox } from "@/types/labic";

export default function FinancasPage() {
  const {
    currentUser,
    members,
    financeBoxes,
    financeTransactions,
    canSeeFinances,
    addFinanceBox,
    updateFinanceBox,
    deleteFinanceBox,
    addFinanceTransaction,
    deleteFinanceTransaction,
  } = useLabic();

  const [editingBox, setEditingBox] = useState<FinanceBox | null>(null);
  const [boxName, setBoxName] = useState("");
  const [boxPurpose, setBoxPurpose] = useState("");
  const [boxGoal, setBoxGoal] = useState("");

  const [txType, setTxType] = useState<"ENTRADA" | "SAIDA">("ENTRADA");
  const [txAmount, setTxAmount] = useState("");
  const [txDesc, setTxDesc] = useState("");
  const [txBoxId, setTxBoxId] = useState("");

  if (!canSeeFinances()) {
    return (
      <div className="bg-[#111318] border border-zinc-800/80 rounded-lg p-6 text-xs text-zinc-400">
        Acesso restrito à Diretora, Coordenação Geral e Coordenação de Finanças.
      </div>
    );
  }

  const totalBalance = financeBoxes.reduce((acc, b) => acc + b.currentBalanceBRL, 0);

  const openEditBox = (box: FinanceBox) => {
    setEditingBox(box);
    setBoxName(box.name);
    setBoxPurpose(box.purpose);
    setBoxGoal(box.targetAmountBRL ? String(box.targetAmountBRL) : "");
  };

  const cancelEditBox = () => {
    setEditingBox(null);
    setBoxName("");
    setBoxPurpose("");
    setBoxGoal("");
  };

  const handleSaveBox = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!boxName.trim()) return;
    if (editingBox) {
      await updateFinanceBox(editingBox.id, {
        name: boxName.trim(),
        purpose: boxPurpose.trim(),
        targetAmountBRL: boxGoal ? Number(boxGoal) : undefined,
      });
    } else {
      await addFinanceBox({
        name: boxName.trim(),
        purpose: boxPurpose.trim(),
        currentBalanceBRL: 0,
        targetAmountBRL: boxGoal ? Number(boxGoal) : undefined,
      });
    }
    cancelEditBox();
  };

  const handleCreateTx = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!txDesc.trim() || !txAmount || !txBoxId || !currentUser) return;
    await addFinanceTransaction({
      txType,
      amountBRL: Number(txAmount),
      description: txDesc.trim(),
      boxId: txBoxId,
      createdByProfileId: currentUser.id,
    });
    setTxAmount("");
    setTxDesc("");
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between border-b border-zinc-800/80 pb-4">
        <div>
          <h1 className="text-lg font-semibold text-zinc-100">Coordenação de Finanças</h1>
          <p className="text-xs text-zinc-400 mt-0.5">
            Controle de caixinhas reservadas (congressos, supermercado/café, insumos) e fluxo de caixa.
          </p>
        </div>
        <div className="text-right">
          <div className="text-[11px] text-zinc-400">Saldo Consolidado</div>
          <div className="text-xl font-semibold text-emerald-400">
            R$ {totalBalance.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 text-xs">
        <div className="lg:col-span-2 bg-[#111318] border border-zinc-800/80 rounded-lg p-5 space-y-3">
          <h2 className="text-sm font-semibold text-zinc-100">Caixinhas Reservadas</h2>
          {financeBoxes.length === 0 ? (
            <p className="text-zinc-500">Nenhuma caixinha criada.</p>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {financeBoxes.map((b) => (
                <div
                  key={b.id}
                  className="p-3.5 rounded bg-zinc-900/60 border border-zinc-800 space-y-1.5"
                >
                  <div className="flex items-center justify-between gap-2">
                    <div className="font-medium text-zinc-100">{b.name}</div>
                    <div className="flex items-center gap-2 text-[11px]">
                      <button
                        onClick={() => openEditBox(b)}
                        className="text-zinc-300 hover:text-white"
                      >
                        Editar
                      </button>
                      <button
                        onClick={() => deleteFinanceBox(b.id)}
                        className="text-red-400 hover:text-red-300"
                      >
                        Excluir
                      </button>
                    </div>
                  </div>
                  <div className="text-[11px] text-zinc-500">{b.purpose}</div>
                  <div className="pt-2 flex items-baseline justify-between">
                    <span className="text-sm font-semibold text-emerald-400">
                      R$ {b.currentBalanceBRL.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                    </span>
                    {b.targetAmountBRL && (
                      <span className="text-[11px] text-zinc-500">
                        Meta: R$ {b.targetAmountBRL.toLocaleString("pt-BR")}
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <form
          onSubmit={handleSaveBox}
          className="bg-[#111318] border border-zinc-800/80 rounded-lg p-5 space-y-3"
        >
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-semibold text-zinc-100">
              {editingBox ? "Editar Caixinha" : "Nova Caixinha"}
            </h2>
            {editingBox && (
              <button
                type="button"
                onClick={cancelEditBox}
                className="text-[11px] text-zinc-400 hover:text-white"
              >
                Cancelar
              </button>
            )}
          </div>
          <div>
            <label className="block text-zinc-400 mb-1">Nome da Caixinha *</label>
            <input
              type="text"
              required
              value={boxName}
              onChange={(e) => setBoxName(e.target.value)}
              placeholder="Ex.: Viagens para Congressos"
              className="w-full bg-zinc-900 border border-zinc-800 rounded px-3 py-1.5 text-zinc-100"
            />
          </div>
          <div>
            <label className="block text-zinc-400 mb-1">Finalidade</label>
            <input
              type="text"
              value={boxPurpose}
              onChange={(e) => setBoxPurpose(e.target.value)}
              placeholder="Ex.: Reserva para passagens e inscrições"
              className="w-full bg-zinc-900 border border-zinc-800 rounded px-3 py-1.5 text-zinc-100"
            />
          </div>
          <div>
            <label className="block text-zinc-400 mb-1">Meta em R$ (Opcional)</label>
            <input
              type="number"
              value={boxGoal}
              onChange={(e) => setBoxGoal(e.target.value)}
              className="w-full bg-zinc-900 border border-zinc-800 rounded px-3 py-1.5 text-zinc-100"
            />
          </div>
          <button
            type="submit"
            className="w-full py-2 rounded bg-zinc-800 hover:bg-zinc-700 text-zinc-100 font-medium"
          >
            {editingBox ? "Salvar Alterações" : "Criar Caixinha"}
          </button>
        </form>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 text-xs">
        <div className="lg:col-span-2 bg-[#111318] border border-zinc-800/80 rounded-lg p-5 space-y-3">
          <h2 className="text-sm font-semibold text-zinc-100">Extrato de Movimentações</h2>
          {financeTransactions.length === 0 ? (
            <p className="text-zinc-500">Nenhuma movimentação registrada.</p>
          ) : (
            <div className="divide-y divide-zinc-800/60">
              {financeTransactions.map((tx) => {
                const box = financeBoxes.find((b) => b.id === tx.boxId);
                const regName =
                  members.find((m) => m.id === tx.createdByProfileId)?.name || "Coordenação";
                return (
                  <div key={tx.id} className="py-2.5 flex items-center justify-between gap-2">
                    <div>
                      <div className="font-medium text-zinc-100">{tx.description}</div>
                      <div className="text-[11px] text-zinc-500">
                        {tx.txDate} · {box ? box.name : "Caixa Geral"} · Por {regName}
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <span
                        className={`font-semibold ${
                          tx.txType === "ENTRADA" ? "text-emerald-400" : "text-red-400"
                        }`}
                      >
                        {tx.txType === "ENTRADA" ? "+" : "-"} R${" "}
                        {tx.amountBRL.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                      </span>
                      <button
                        onClick={() => deleteFinanceTransaction(tx.id)}
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

        <form
          onSubmit={handleCreateTx}
          className="bg-[#111318] border border-zinc-800/80 rounded-lg p-5 space-y-3"
        >
          <h2 className="text-sm font-semibold text-zinc-100">Registrar Movimentação</h2>
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="block text-zinc-400 mb-1">Tipo</label>
              <select
                value={txType}
                onChange={(e) => setTxType(e.target.value as "ENTRADA" | "SAIDA")}
                className="w-full bg-zinc-900 border border-zinc-800 rounded px-2 py-1.5 text-zinc-100"
              >
                <option value="ENTRADA">Entrada (+)</option>
                <option value="SAIDA">Saída (-)</option>
              </select>
            </div>
            <div>
              <label className="block text-zinc-400 mb-1">Valor (R$) *</label>
              <input
                type="number"
                step="0.01"
                required
                value={txAmount}
                onChange={(e) => setTxAmount(e.target.value)}
                className="w-full bg-zinc-900 border border-zinc-800 rounded px-2.5 py-1.5 text-zinc-100"
              />
            </div>
          </div>
          <div>
            <label className="block text-zinc-400 mb-1">Descrição *</label>
            <input
              type="text"
              required
              value={txDesc}
              onChange={(e) => setTxDesc(e.target.value)}
              placeholder="Ex.: Compra de café e copos descartáveis"
              className="w-full bg-zinc-900 border border-zinc-800 rounded px-3 py-1.5 text-zinc-100"
            />
          </div>
          <div>
            <label className="block text-zinc-400 mb-1">Caixinha *</label>
            <select
              required
              value={txBoxId}
              onChange={(e) => setTxBoxId(e.target.value)}
              className="w-full bg-zinc-900 border border-zinc-800 rounded px-3 py-1.5 text-zinc-100"
            >
              <option value="">Selecione a caixinha...</option>
              {financeBoxes.map((b) => (
                <option key={b.id} value={b.id}>
                  {b.name}
                </option>
              ))}
            </select>
          </div>
          <button
            type="submit"
            className="w-full py-2 rounded bg-emerald-600 hover:bg-emerald-500 text-white font-medium"
          >
            Salvar Lançamento
          </button>
        </form>
      </div>
    </div>
  );
}
