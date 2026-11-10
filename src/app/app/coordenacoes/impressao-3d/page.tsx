"use client";

import React from "react";
import { useLabic } from "@/context/LabicContext";

const PRINT_STATUS_LABELS: Record<string, string> = {
  AGUARDANDO_APROVACAO: "Aguardando Aprovação",
  APROVADO_PARA_IMPRIMIR: "Aprovado para Imprimir",
  NA_FILA: "Na Fila",
  IMPRIMINDO: "Em Impressão",
  CONCLUIDO: "Concluído",
  FALHA_REIMPRIMIR: "Recusado / Falha",
};

export default function CoordenacaoImpressao3DPage() {
  const {
    print3DRequests,
    members,
    hasCoordination,
    updatePrint3DStatus,
    deletePrint3DRequest,
  } = useLabic();

  if (!hasCoordination("IMPRESSAO_3D")) {
    return (
      <div className="bg-[#111318] border border-zinc-800/80 rounded-lg p-6 text-xs text-zinc-400">
        Acesso restrito à Coordenação de Impressão 3D.
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="border-b border-zinc-800/80 pb-4">
        <h1 className="text-lg font-semibold text-zinc-100">Coordenação de Impressão 3D</h1>
        <p className="text-xs text-zinc-400 mt-0.5">
          Aprove solicitações de uso da impressora 3D, acompanhe o consumo de filamento e marque impressões como concluídas.
        </p>
      </div>

      <div className="bg-[#111318] border border-zinc-800/80 rounded-lg p-5 space-y-3 text-xs">
        <h2 className="text-sm font-semibold text-zinc-100">
          Solicitações de Autorização e Fila de Impressão 3D
        </h2>
        {print3DRequests.length === 0 ? (
          <p className="text-zinc-500">Nenhuma solicitação de impressão 3D registrada.</p>
        ) : (
          <div className="divide-y divide-zinc-800/60">
            {print3DRequests.map((job) => {
              const reqName =
                members.find((m) => m.id === job.requesterId)?.name || job.requesterId;
              return (
                <div
                  key={job.id}
                  className="py-3.5 flex flex-col lg:flex-row lg:items-center justify-between gap-3"
                >
                  <div>
                    <div className="font-medium text-zinc-100">{job.partName}</div>
                    <div className="text-[11px] text-zinc-400 mt-0.5">
                      Solicitante: <strong className="text-zinc-200">{reqName}</strong> · Filamento:{" "}
                      <strong className="text-zinc-200">
                        {job.material} ({job.estimatedGrams}g)
                      </strong>{" "}
                      · Obs.: {job.stlFileName}
                    </div>
                  </div>
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="px-2 py-0.5 rounded bg-zinc-900 border border-zinc-800 text-emerald-400 font-medium mr-1">
                      {PRINT_STATUS_LABELS[job.status] || job.status}
                    </span>
                    <button
                      onClick={() => updatePrint3DStatus(job.id, "APROVADO_PARA_IMPRIMIR")}
                      className="px-2.5 py-1 rounded bg-emerald-600 hover:bg-emerald-500 text-white font-medium"
                    >
                      Aprovar Uso
                    </button>
                    <button
                      onClick={() => updatePrint3DStatus(job.id, "IMPRIMINDO")}
                      className="px-2.5 py-1 rounded bg-zinc-800 hover:bg-zinc-700 text-zinc-200"
                    >
                      Em Impressão
                    </button>
                    <button
                      onClick={() => updatePrint3DStatus(job.id, "CONCLUIDO")}
                      className="px-2.5 py-1 rounded bg-blue-600 hover:bg-blue-500 text-white font-medium"
                    >
                      Dar como Concluída
                    </button>
                    <button
                      onClick={() => updatePrint3DStatus(job.id, "FALHA_REIMPRIMIR")}
                      className="px-2.5 py-1 rounded bg-amber-950/60 text-amber-300 border border-amber-900/50"
                    >
                      Recusar / Falha
                    </button>
                    <button
                      onClick={() => deletePrint3DRequest(job.id)}
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
    </div>
  );
}
