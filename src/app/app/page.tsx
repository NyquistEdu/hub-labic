"use client";

import React from "react";
import Link from "next/link";
import { useLabic } from "@/context/LabicContext";
import { formatDateBR, formatMeetingDateTime, SUBMISSION_STATUS_LABELS } from "@/types/labic";

export default function DashboardOverviewPage() {
  const {
    currentUser,
    members,
    productions,
    projects,
    conferences,
    submissions,
    supplyRequests,
    print3DRequests,
    notifications,
    meetings,
  } = useLabic();

  if (!currentUser) return null;

  const myProductions = productions.filter((p) => p.authorIds.includes(currentUser.id));
  const myProjects = projects.filter(
    (p) =>
      p.advisorId === currentUser.id ||
      p.coAdvisorId === currentUser.id ||
      p.members.some((m) => m.profileId === currentUser.id)
  );
  const myAlerts = notifications.filter(
    (n) => (n.recipientProfileId === "ALL" || n.recipientProfileId === currentUser.id) && !n.read
  );
  const myReviews = submissions.filter((s) => s.reviewerIds.includes(currentUser.id));

  const pendingSupplies = supplyRequests.filter((r) => r.status === "PENDENTE").length;
  const pending3D = print3DRequests.filter((j) => j.status === "NA_FILA").length;

  return (
    <div className="space-y-6">
      <div className="border-b border-zinc-800/80 pb-4">
        <h1 className="text-lg font-semibold text-zinc-100">Visão Geral</h1>
        <p className="text-xs text-zinc-400 mt-0.5">
          Resumo de atividades, projetos vinculados e pendências operacionais de {currentUser.name}.
        </p>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="bg-[#111318] border border-zinc-800/80 rounded-lg p-4">
          <div className="text-xs text-zinc-400">Minhas Produções</div>
          <div className="text-xl font-semibold text-zinc-100 mt-1">{myProductions.length}</div>
          <div className="text-[11px] text-zinc-500 mt-1">
            Total do LABIC: {productions.length}
          </div>
        </div>

        <div className="bg-[#111318] border border-zinc-800/80 rounded-lg p-4">
          <div className="text-xs text-zinc-400">Meus Projetos</div>
          <div className="text-xl font-semibold text-zinc-100 mt-1">{myProjects.length}</div>
          <div className="text-[11px] text-zinc-500 mt-1">
            Total do LABIC: {projects.length}
          </div>
        </div>

        <div className="bg-[#111318] border border-zinc-800/80 rounded-lg p-4">
          <div className="text-xs text-zinc-400">Pesquisadores Ativos</div>
          <div className="text-xl font-semibold text-zinc-100 mt-1">
            {members.filter((m) => m.status === "ATIVO").length}
          </div>
          <div className="text-[11px] text-zinc-500 mt-1">Presenciais e remotos</div>
        </div>

        <div className="bg-[#111318] border border-zinc-800/80 rounded-lg p-4">
          <div className="text-xs text-zinc-400">Filas Operacionais</div>
          <div className="text-xl font-semibold text-zinc-100 mt-1">
            {pendingSupplies + pending3D}
          </div>
          <div className="text-[11px] text-zinc-500 mt-1">
            {pendingSupplies} insumos · {pending3D} impressões 3D
          </div>
        </div>
      </div>

      {myAlerts.length > 0 && (
        <div className="bg-[#111318] border border-zinc-800/80 rounded-lg p-4 space-y-2">
          <h2 className="text-xs font-semibold uppercase tracking-wider text-zinc-400">
            Avisos Recentes ({myAlerts.length})
          </h2>
          <div className="divide-y divide-zinc-800/60">
            {myAlerts.slice(0, 4).map((alert) => (
              <div key={alert.id} className="py-2 flex items-center justify-between gap-4">
                <div>
                  <span className="text-xs font-medium text-zinc-200">{alert.title}</span>
                  <p className="text-xs text-zinc-400">{alert.message}</p>
                </div>
                <span className="text-[11px] text-zinc-500 shrink-0">
                  {formatDateBR(alert.dateLabel)}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-[#111318] border border-zinc-800/80 rounded-lg p-5 space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-semibold text-zinc-100">Meus Projetos</h2>
            <Link href="/app/projetos" className="text-xs text-zinc-400 hover:text-zinc-200">
              Ver todos →
            </Link>
          </div>
          {myProjects.length === 0 ? (
            <p className="text-xs text-zinc-500 py-3">
              Você ainda não está vinculado a nenhum projeto.
            </p>
          ) : (
            <div className="divide-y divide-zinc-800/60">
              {myProjects.map((proj) => {
                const pendingDeliverables = proj.deliverables.filter(
                  (d) => d.status === "PENDENTE"
                ).length;
                return (
                  <div key={proj.id} className="py-2.5 flex items-center justify-between gap-3">
                    <div>
                      <div className="text-xs font-medium text-zinc-200">{proj.title}</div>
                      <div className="text-[11px] text-zinc-500">
                        {proj.fundingAgency} · {proj.year}
                      </div>
                    </div>
                    <span className="text-[11px] text-zinc-400 shrink-0">
                      {pendingDeliverables > 0
                        ? `${pendingDeliverables} relatório(s) pendente(s)`
                        : "Em dia"}
                    </span>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        <div className="bg-[#111318] border border-zinc-800/80 rounded-lg p-5 space-y-4">
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-semibold text-zinc-100">Revisões de Artigos Designadas</h2>
              <Link href="/app/congressos" className="text-xs text-zinc-400 hover:text-zinc-200">
                Congressos →
              </Link>
            </div>
            {myReviews.length === 0 ? (
              <p className="text-xs text-zinc-500 py-2">Nenhuma revisão atribuída no momento.</p>
            ) : (
              <div className="divide-y divide-zinc-800/60">
                {myReviews.map((sub) => {
                  const conf = conferences.find((c) => c.id === sub.conferenceId);
                  return (
                    <div key={sub.id} className="py-2 flex items-center justify-between gap-2">
                      <div>
                        <span className="text-xs font-medium text-zinc-200">{sub.title}</span>
                        <div className="text-[11px] text-zinc-500">
                          {conf?.acronym || "Congresso"}
                        </div>
                      </div>
                      <span className="text-[11px] text-zinc-400">
                        {SUBMISSION_STATUS_LABELS[sub.status] || sub.status}
                      </span>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          <div className="pt-3 border-t border-zinc-800/80 space-y-2">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-semibold text-zinc-100">Reuniões Agendadas</h2>
              <Link href="/app/reunioes" className="text-xs text-zinc-400 hover:text-zinc-200">
                Reuniões →
              </Link>
            </div>
            {meetings.length === 0 ? (
              <p className="text-xs text-zinc-500 py-2">Nenhuma reunião agendada.</p>
            ) : (
              <div className="divide-y divide-zinc-800/60">
                {meetings.slice(0, 3).map((m) => (
                  <div key={m.id} className="py-2 flex items-center justify-between text-xs">
                    <span className="text-zinc-200">{m.title}</span>
                    <span className="text-zinc-500">
                      {formatMeetingDateTime(m.meetingDate, m.meetingTime, m.scheduledAt)}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
