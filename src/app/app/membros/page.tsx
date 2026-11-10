"use client";

import React, { useState } from "react";
import { useLabic } from "@/context/LabicContext";
import {
  CoordinationType,
  COORDINATION_LABELS,
  GlobalRole,
  GLOBAL_ROLE_LABELS,
  LabicMember,
  WorkMode,
} from "@/types/labic";

const ALL_COORDINATIONS: CoordinationType[] = [
  "FINANCAS",
  "INSUMOS",
  "IMPRESSAO_3D",
  "MANUTENCAO",
  "COMPUTADORES",
  "LIMPEZA",
  "MIDIA",
];

export default function MembrosPage() {
  const {
    members,
    isAdmin,
    addMember,
    updateMemberAccount,
    deleteMember,
    toggleMemberStatus,
    toggleMemberCoordination,
  } = useLabic();

  const [showModal, setShowModal] = useState(false);
  const [editingMember, setEditingMember] = useState<LabicMember | null>(null);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [globalRole, setGlobalRole] = useState<GlobalRole>("PESQUISADOR");
  const [course, setCourse] = useState("");
  const [institution, setInstitution] = useState("IFS - Campus Lagarto");
  const [degreeLevel, setDegreeLevel] = useState("Graduação");
  const [workMode, setWorkMode] = useState<WorkMode>("PRESENCIAL_LAGARTO");
  const [currentCity, setCurrentCity] = useState("Lagarto");
  const [currentStateOrProvince, setCurrentStateOrProvince] = useState("SE");
  const [currentCountry, setCurrentCountry] = useState("Brasil");

  // Modal exclusivo para Trocar Senha (nunca exibe a senha atual)
  const [passwordTargetMember, setPasswordTargetMember] = useState<LabicMember | null>(null);
  const [newPassword, setNewPassword] = useState("");
  const [confirmNewPassword, setConfirmNewPassword] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [feedbackBanner, setFeedbackBanner] = useState("");

  if (!isAdmin()) {
    return (
      <div className="bg-[#111318] border border-zinc-800/80 rounded-lg p-6 text-xs text-zinc-400">
        Acesso restrito à Diretora e à Coordenação Geral.
      </div>
    );
  }

  const triggerFeedback = (msg: string) => {
    setFeedbackBanner(msg);
    setTimeout(() => setFeedbackBanner(""), 3500);
  };

  const openCreateModal = () => {
    setEditingMember(null);
    setName("");
    setEmail("");
    setPassword("");
    setGlobalRole("PESQUISADOR");
    setCourse("");
    setInstitution("IFS - Campus Lagarto");
    setDegreeLevel("Graduação");
    setWorkMode("PRESENCIAL_LAGARTO");
    setCurrentCity("Lagarto");
    setCurrentStateOrProvince("SE");
    setCurrentCountry("Brasil");
    setShowModal(true);
  };

  const openEditModal = (m: LabicMember) => {
    setEditingMember(m);
    setName(m.name);
    setEmail(m.email);
    setPassword(""); // Nunca exibe nem pré-preenche a senha existente
    setGlobalRole(m.globalRole);
    setCourse(m.course || "");
    setInstitution(m.institution || "IFS - Campus Lagarto");
    setDegreeLevel(m.degreeLevel || "Graduação");
    setWorkMode(m.workMode);
    setCurrentCity(m.currentCity || "Lagarto");
    setCurrentStateOrProvince(m.currentStateOrProvince || "SE");
    setCurrentCountry(m.currentCountry || "Brasil");
    setShowModal(true);
  };

  const openChangePasswordModal = (m: LabicMember) => {
    setPasswordTargetMember(m);
    setNewPassword("");
    setConfirmNewPassword("");
    setPasswordError("");
  };

  const handleSaveNewPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!passwordTargetMember) return;
    if (!newPassword.trim() || newPassword.trim().length < 4) {
      setPasswordError("Informe uma nova senha com pelo menos 4 caracteres.");
      return;
    }
    if (newPassword.trim() !== confirmNewPassword.trim()) {
      setPasswordError("A confirmação de senha não confere.");
      return;
    }
    await updateMemberAccount(passwordTargetMember.id, {
      password: newPassword.trim(),
    });
    const memberName = passwordTargetMember.name;
    setPasswordTargetMember(null);
    setNewPassword("");
    setConfirmNewPassword("");
    triggerFeedback(`Senha de ${memberName} alterada com sucesso.`);
  };

  const handleRoleChangeInline = async (m: LabicMember, nextRole: GlobalRole) => {
    await updateMemberAccount(m.id, { globalRole: nextRole });
    triggerFeedback(`Cargo de ${m.name} atualizado para ${GLOBAL_ROLE_LABELS[nextRole]}.`);
  };

  const handleSaveMember = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !email.trim()) return;
    if (!editingMember && !password.trim()) return;

    const initials = name
      .trim()
      .split(" ")
      .map((p) => p[0])
      .slice(0, 2)
      .join("")
      .toUpperCase();

    if (editingMember) {
      await updateMemberAccount(editingMember.id, {
        name: name.trim(),
        email: email.trim().toLowerCase(),
        avatarInitials: initials || "LB",
        globalRole,
        workMode,
        course: course.trim(),
        institution: institution.trim() || "IFS - Campus Lagarto",
        degreeLevel: degreeLevel.trim() || "Graduação",
        currentCity: currentCity.trim() || "Lagarto",
        currentStateOrProvince: currentStateOrProvince.trim() || "SE",
        currentCountry: currentCountry.trim() || "Brasil",
      });
      triggerFeedback(`Dados de ${name.trim()} atualizados com sucesso.`);
    } else {
      await addMember({
        name: name.trim(),
        email: email.trim().toLowerCase(),
        password: password.trim(),
        avatarInitials: initials || "LB",
        globalRole,
        status: "ATIVO",
        coordinations: [],
        workMode,
        course: course.trim(),
        institution: institution.trim() || "IFS - Campus Lagarto",
        degreeLevel: degreeLevel.trim() || "Graduação",
        currentCity: currentCity.trim() || "Lagarto",
        currentStateOrProvince: currentStateOrProvince.trim() || "SE",
        currentCountry: currentCountry.trim() || "Brasil",
        showOnPublicShowcase: true,
      });
      triggerFeedback(`Conta de ${name.trim()} criada com sucesso.`);
    }

    setShowModal(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-zinc-800/80 pb-4">
        <div>
          <h1 className="text-lg font-semibold text-zinc-100">Membros e Permissões</h1>
          <p className="text-xs text-zinc-400 mt-0.5">
            Gestão de contas, alteração de Papel Global (Pesquisador / Coordenação Geral / Diretora), redefinição de senha e atribuição das 7 coordenações.
          </p>
        </div>
        <button
          onClick={openCreateModal}
          className="px-3.5 py-2 rounded bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-medium transition-colors shrink-0"
        >
          + Cadastrar Membro
        </button>
      </div>

      {feedbackBanner && (
        <div className="px-4 py-2.5 rounded bg-emerald-950/60 border border-emerald-800/70 text-emerald-300 text-xs font-medium">
          {feedbackBanner}
        </div>
      )}

      <div className="space-y-3">
        {members.map((m) => (
          <div
            key={m.id}
            className="bg-[#111318] border border-zinc-800/80 rounded-lg p-4 space-y-3 text-xs"
          >
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                {m.avatarUrl ? (
                  <img
                    src={m.avatarUrl}
                    alt={m.name}
                    className="w-10 h-10 rounded-full object-cover border border-zinc-700 shrink-0"
                  />
                ) : (
                  <div className="w-10 h-10 rounded-full bg-zinc-800 border border-zinc-700 flex items-center justify-center text-xs font-semibold text-emerald-400 shrink-0">
                    {m.name.charAt(0).toUpperCase()}
                  </div>
                )}
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-sm font-semibold text-zinc-100">{m.name}</span>
                    <span className="px-2 py-0.5 rounded bg-zinc-900 border border-zinc-800 text-[11px] text-emerald-400 font-medium">
                      {GLOBAL_ROLE_LABELS[m.globalRole]}
                    </span>
                    {m.status === "INATIVO" ? (
                      <span className="px-2 py-0.5 rounded bg-red-950/60 border border-red-900/50 text-[11px] text-red-300">
                        Inativo
                      </span>
                    ) : (
                      <span className="px-2 py-0.5 rounded bg-emerald-950/40 border border-emerald-900/40 text-[11px] text-emerald-300">
                        Ativo
                      </span>
                    )}
                  </div>
                  <div className="text-zinc-400 mt-0.5">
                    {m.email} · {m.course || m.degreeLevel} ({m.institution}) · {m.currentCity},{" "}
                    {m.currentCountry}
                  </div>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <select
                  value={m.globalRole}
                  onChange={(e) => handleRoleChangeInline(m, e.target.value as GlobalRole)}
                  className="bg-zinc-900 border border-zinc-800 rounded px-2.5 py-1 text-zinc-200 text-[11px] cursor-pointer"
                  title="Alterar Papel Global"
                >
                  <option value="PESQUISADOR">Cargo: Pesquisador</option>
                  <option value="COORD_GERAL">Cargo: Coordenação Geral</option>
                  <option value="DIRETORA">Cargo: Diretora</option>
                </select>

                <button
                  onClick={() => openChangePasswordModal(m)}
                  className="px-2.5 py-1 rounded bg-zinc-900 hover:bg-zinc-800 border border-zinc-700 text-emerald-400 font-medium"
                >
                  Trocar Senha
                </button>

                <button
                  onClick={() => openEditModal(m)}
                  className="px-2.5 py-1 rounded bg-zinc-800 hover:bg-zinc-700 text-zinc-200"
                >
                  Editar Dados
                </button>

                <button
                  onClick={() => toggleMemberStatus(m.id)}
                  className="px-2.5 py-1 rounded bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-zinc-300"
                >
                  {m.status === "ATIVO" ? "Desativar" : "Reativar"}
                </button>

                <button
                  onClick={() => deleteMember(m.id)}
                  className="px-2.5 py-1 rounded bg-red-950/50 hover:bg-red-900/60 text-red-300 border border-red-900/40"
                >
                  Excluir
                </button>
              </div>
            </div>

            <div className="pt-2 border-t border-zinc-800/60 flex flex-wrap items-center gap-1.5">
              <span className="text-[11px] text-zinc-500 mr-1">Coordenações atribuídas:</span>
              {ALL_COORDINATIONS.map((coord) => {
                const has = m.coordinations.includes(coord);
                return (
                  <button
                    key={coord}
                    onClick={() => toggleMemberCoordination(m.id, coord)}
                    className={`px-2 py-1 rounded text-[11px] border transition-colors ${
                      has
                        ? "bg-emerald-950/60 border-emerald-700/60 text-emerald-300 font-medium"
                        : "bg-zinc-900/60 border-zinc-800 text-zinc-400 hover:text-zinc-200"
                    }`}
                  >
                    {COORDINATION_LABELS[coord]}
                  </button>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      {/* Modal de Trocar Senha (sem exibir a senha atual) */}
      {passwordTargetMember && (
        <div className="fixed inset-0 z-50 bg-black/75 flex items-center justify-center p-4">
          <div className="bg-[#111318] border border-zinc-800 rounded-lg max-w-sm w-full p-6 space-y-4 text-xs">
            <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
              <h2 className="text-sm font-semibold text-zinc-100">
                Trocar Senha — {passwordTargetMember.name}
              </h2>
              <button
                onClick={() => setPasswordTargetMember(null)}
                className="text-zinc-400 hover:text-white"
              >
                Fechar
              </button>
            </div>

            <p className="text-zinc-400">
              Por segurança, a senha atual não é exibida. Digite abaixo a nova senha de acesso para{" "}
              <strong className="text-zinc-200">{passwordTargetMember.email}</strong>.
            </p>

            {passwordError && (
              <div className="p-2.5 rounded bg-red-950/60 border border-red-900/60 text-red-300">
                {passwordError}
              </div>
            )}

            <form onSubmit={handleSaveNewPassword} className="space-y-3">
              <div>
                <label className="block text-zinc-400 mb-1">Nova Senha *</label>
                <input
                  type="password"
                  required
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Digite a nova senha"
                  className="w-full bg-zinc-900 border border-zinc-800 rounded px-3 py-2 text-zinc-100"
                />
              </div>
              <div>
                <label className="block text-zinc-400 mb-1">Confirmar Nova Senha *</label>
                <input
                  type="password"
                  required
                  value={confirmNewPassword}
                  onChange={(e) => setConfirmNewPassword(e.target.value)}
                  placeholder="Repita a nova senha"
                  className="w-full bg-zinc-900 border border-zinc-800 rounded px-3 py-2 text-zinc-100"
                />
              </div>
              <div className="flex justify-end gap-2 pt-3 border-t border-zinc-800">
                <button
                  type="button"
                  onClick={() => setPasswordTargetMember(null)}
                  className="px-3 py-1.5 rounded bg-zinc-800 text-zinc-300"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 rounded bg-emerald-600 hover:bg-emerald-500 text-white font-medium"
                >
                  Salvar Nova Senha
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal de Cadastrar / Editar Dados do Membro */}
      {showModal && (
        <div className="fixed inset-0 z-50 bg-black/75 flex items-center justify-center p-4">
          <div className="bg-[#111318] border border-zinc-800 rounded-lg max-w-lg w-full p-6 space-y-4 max-h-[90vh] overflow-y-auto text-xs">
            <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
              <h2 className="text-sm font-semibold text-zinc-100">
                {editingMember ? `Editar Dados — ${editingMember.name}` : "Cadastrar Novo Membro"}
              </h2>
              <button onClick={() => setShowModal(false)} className="text-zinc-400">
                Fechar
              </button>
            </div>

            <form onSubmit={handleSaveMember} className="space-y-3">
              <div>
                <label className="block text-zinc-400 mb-1">Nome Completo *</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full bg-zinc-900 border border-zinc-800 rounded px-3 py-2 text-zinc-100"
                />
              </div>

              <div className={editingMember ? "grid grid-cols-1 gap-3" : "grid grid-cols-2 gap-3"}>
                <div>
                  <label className="block text-zinc-400 mb-1">E-mail de Login *</label>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="nome@academico.ifs.edu.br"
                    className="w-full bg-zinc-900 border border-zinc-800 rounded px-3 py-2 text-zinc-100"
                  />
                </div>
                {!editingMember && (
                  <div>
                    <label className="block text-zinc-400 mb-1">Senha Inicial *</label>
                    <input
                      type="password"
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Defina a senha inicial"
                      className="w-full bg-zinc-900 border border-zinc-800 rounded px-3 py-2 text-zinc-100"
                    />
                  </div>
                )}
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-zinc-400 mb-1">Papel Global (Privilégio)</label>
                  <select
                    value={globalRole}
                    onChange={(e) => setGlobalRole(e.target.value as GlobalRole)}
                    className="w-full bg-zinc-900 border border-zinc-800 rounded px-3 py-2 text-zinc-100"
                  >
                    <option value="PESQUISADOR">Pesquisador</option>
                    <option value="COORD_GERAL">Coordenação Geral</option>
                    <option value="DIRETORA">Diretora / Orientadora Geral</option>
                  </select>
                </div>
                <div>
                  <label className="block text-zinc-400 mb-1">Nível Acadêmico</label>
                  <input
                    type="text"
                    value={degreeLevel}
                    onChange={(e) => setDegreeLevel(e.target.value)}
                    placeholder="Ex.: Ensino Médio/Técnico, Graduação, Mestrado"
                    className="w-full bg-zinc-900 border border-zinc-800 rounded px-3 py-2 text-zinc-100"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-zinc-400 mb-1">Curso (Texto livre)</label>
                  <input
                    type="text"
                    value={course}
                    onChange={(e) => setCourse(e.target.value)}
                    placeholder="Ex.: Sistemas de Informação"
                    className="w-full bg-zinc-900 border border-zinc-800 rounded px-3 py-2 text-zinc-100"
                  />
                </div>
                <div>
                  <label className="block text-zinc-400 mb-1">Instituição (Texto livre)</label>
                  <input
                    type="text"
                    value={institution}
                    onChange={(e) => setInstitution(e.target.value)}
                    placeholder="Ex.: IFS - Campus Lagarto"
                    className="w-full bg-zinc-900 border border-zinc-800 rounded px-3 py-2 text-zinc-100"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-2">
                <div>
                  <label className="block text-zinc-400 mb-1">Cidade</label>
                  <input
                    type="text"
                    value={currentCity}
                    onChange={(e) => setCurrentCity(e.target.value)}
                    className="w-full bg-zinc-900 border border-zinc-800 rounded px-2.5 py-1.5 text-zinc-100"
                  />
                </div>
                <div>
                  <label className="block text-zinc-400 mb-1">Estado</label>
                  <input
                    type="text"
                    value={currentStateOrProvince}
                    onChange={(e) => setCurrentStateOrProvince(e.target.value)}
                    className="w-full bg-zinc-900 border border-zinc-800 rounded px-2.5 py-1.5 text-zinc-100"
                  />
                </div>
                <div>
                  <label className="block text-zinc-400 mb-1">País</label>
                  <input
                    type="text"
                    value={currentCountry}
                    onChange={(e) => setCurrentCountry(e.target.value)}
                    className="w-full bg-zinc-900 border border-zinc-800 rounded px-2.5 py-1.5 text-zinc-100"
                  />
                </div>
              </div>

              <div>
                <label className="block text-zinc-400 mb-1">Modalidade de Atuação</label>
                <select
                  value={workMode}
                  onChange={(e) => setWorkMode(e.target.value as WorkMode)}
                  className="w-full bg-zinc-900 border border-zinc-800 rounded px-3 py-2 text-zinc-100"
                >
                  <option value="PRESENCIAL_LAGARTO">Presencial (Campus Lagarto)</option>
                  <option value="REMOTO_EXTERNO">Remoto / Outra Instituição</option>
                </select>
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
                  {editingMember ? "Salvar Alterações" : "Criar Conta de Membro"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
