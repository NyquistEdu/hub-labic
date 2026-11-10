"use client";

import React, { useState, useEffect, useRef } from "react";
import { useLabic } from "@/context/LabicContext";
import {
  AcademicStep,
  formatMonthYearBR,
  getScholarshipVigenciaStatus,
  PRODUCTION_CATEGORY_LABELS,
  SUPPLY_REQUEST_STATUS_LABELS,
  SUPPLY_REQUEST_TYPE_LABELS,
  WorkMode,
} from "@/types/labic";

export default function MeuPerfilPage() {
  const {
    currentUser,
    productions,
    projects,
    supplyRequests,
    updateMemberProfile,
    addAcademicStep,
    updateAcademicStep,
    removeAcademicStep,
    uploadFileToStorage,
  } = useLabic();

  const [name, setName] = useState(currentUser?.name || "");
  const [avatarUrl, setAvatarUrl] = useState(currentUser?.avatarUrl || "");
  const [uploadingPhoto, setUploadingPhoto] = useState(false);
  const [course, setCourse] = useState(currentUser?.course || "");
  const [institution, setInstitution] = useState(currentUser?.institution || "");
  const [degreeLevel, setDegreeLevel] = useState(currentUser?.degreeLevel || "");
  const [workMode, setWorkMode] = useState<WorkMode>(
    currentUser?.workMode || "PRESENCIAL_LAGARTO"
  );
  const [currentCity, setCurrentCity] = useState(currentUser?.currentCity || "");
  const [currentStateOrProvince, setCurrentStateOrProvince] = useState(
    currentUser?.currentStateOrProvince || ""
  );
  const [currentCountry, setCurrentCountry] = useState(currentUser?.currentCountry || "");
  const [lattesUrl, setLattesUrl] = useState(currentUser?.lattesUrl || "");
  const [linkedinUrl, setLinkedinUrl] = useState(currentUser?.linkedinUrl || "");
  const [savedBanner, setSavedBanner] = useState(false);

  const [showAddFormation, setShowAddFormation] = useState(false);
  const [editingStep, setEditingStep] = useState<AcademicStep | null>(null);
  const [formLevel, setFormLevel] = useState("Graduação");
  const [formCourse, setFormCourse] = useState("");
  const [formInst, setFormInst] = useState("");
  const [formCity, setFormCity] = useState("");
  const [formCountry, setFormCountry] = useState("Brasil");
  const [formStartYear, setFormStartYear] = useState(new Date().getFullYear());
  const [formEndYear, setFormEndYear] = useState("");
  const [formStatus, setFormStatus] = useState<"EM_ANDAMENTO" | "CONCLUIDO">("EM_ANDAMENTO");

  const photoInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!currentUser) return;
    setName(currentUser.name);
    setAvatarUrl(currentUser.avatarUrl || "");
    setCourse(currentUser.course);
    setInstitution(currentUser.institution);
    setDegreeLevel(currentUser.degreeLevel);
    setWorkMode(currentUser.workMode);
    setCurrentCity(currentUser.currentCity);
    setCurrentStateOrProvince(currentUser.currentStateOrProvince);
    setCurrentCountry(currentUser.currentCountry);
    setLattesUrl(currentUser.lattesUrl || "");
    setLinkedinUrl(currentUser.linkedinUrl || "");
  }, [currentUser]);

  if (!currentUser) return null;

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadingPhoto(true);
    try {
      const uploadedUrl = await uploadFileToStorage("documentos-labic", file);
      setAvatarUrl(uploadedUrl);
      await updateMemberProfile(currentUser.id, { avatarUrl: uploadedUrl });
      setSavedBanner(true);
      setTimeout(() => setSavedBanner(false), 3000);
    } finally {
      setUploadingPhoto(false);
      if (photoInputRef.current) photoInputRef.current.value = "";
    }
  };

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    await updateMemberProfile(currentUser.id, {
      name: name.trim(),
      avatarUrl: avatarUrl.trim() || undefined,
      course: course.trim(),
      institution: institution.trim(),
      degreeLevel: degreeLevel.trim(),
      workMode,
      currentCity: currentCity.trim(),
      currentStateOrProvince: currentStateOrProvince.trim(),
      currentCountry: currentCountry.trim(),
      lattesUrl: lattesUrl.trim() || undefined,
      linkedinUrl: linkedinUrl.trim() || undefined,
    });
    setSavedBanner(true);
    setTimeout(() => setSavedBanner(false), 3000);
  };

  const openNewStep = () => {
    setEditingStep(null);
    setFormLevel("Graduação");
    setFormCourse("");
    setFormInst("");
    setFormCity(currentCity);
    setFormCountry(currentCountry || "Brasil");
    setFormStartYear(new Date().getFullYear());
    setFormEndYear("");
    setFormStatus("EM_ANDAMENTO");
    setShowAddFormation(true);
  };

  const openEditStep = (step: AcademicStep) => {
    setEditingStep(step);
    setFormLevel(step.degreeLevel);
    setFormCourse(step.courseName);
    setFormInst(step.institution);
    setFormCity(step.city);
    setFormCountry(step.country);
    setFormStartYear(step.startYear);
    setFormEndYear(step.endYear ? String(step.endYear) : "");
    setFormStatus(step.status);
    setShowAddFormation(true);
  };

  const handleSaveFormation = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formCourse.trim() || !formInst.trim()) return;
    if (editingStep) {
      await updateAcademicStep(currentUser.id, editingStep.id, {
        degreeLevel: formLevel,
        courseName: formCourse.trim(),
        institution: formInst.trim(),
        city: formCity.trim() || currentCity,
        country: formCountry.trim() || currentCountry,
        startYear: Number(formStartYear),
        endYear: formEndYear ? Number(formEndYear) : undefined,
        status: formStatus,
      });
    } else {
      await addAcademicStep(currentUser.id, {
        degreeLevel: formLevel,
        courseName: formCourse.trim(),
        institution: formInst.trim(),
        city: formCity.trim() || currentCity,
        country: formCountry.trim() || currentCountry,
        startYear: Number(formStartYear),
        endYear: formEndYear ? Number(formEndYear) : undefined,
        status: formStatus,
      });
    }
    setFormCourse("");
    setFormInst("");
    setEditingStep(null);
    setShowAddFormation(false);
  };

  const myProductions = productions.filter(
    (p) => p.authorIds.includes(currentUser.id) || p.primaryAuthorId === currentUser.id
  );
  const myProjects = projects.filter(
    (p) =>
      p.advisorId === currentUser.id ||
      p.coAdvisorId === currentUser.id ||
      p.members.some((m) => m.profileId === currentUser.id)
  );

  // Soma total de bolsas vigentes recebidas pelo usuário logado no mês atual
  const totalScholarshipBRL = myProjects.reduce((sum, proj) => {
    const myLink = proj.members.find((m) => m.profileId === currentUser.id);
    if (myLink?.roleInProject === "BOLSISTA" && myLink.monthlyScholarshipBRL) {
      const vig = getScholarshipVigenciaStatus(
        myLink.scholarshipStartMonth,
        myLink.scholarshipEndMonth,
        proj.status
      );
      if (vig.isActiveNow) {
        return sum + Number(myLink.monthlyScholarshipBRL);
      }
    }
    return sum;
  }, 0);

  const mySupplyRequests = supplyRequests.filter((r) => r.requesterId === currentUser.id);

  return (
    <div className="space-y-6">
      <div className="border-b border-zinc-800/80 pb-4">
        <h1 className="text-lg font-semibold text-zinc-100">Meu Perfil e Trajetória</h1>
        <p className="text-xs text-zinc-400 mt-0.5">
          Foto de perfil, dados acadêmicos, localização para o mapa global, histórico de formações, bolsas e produções vinculadas.
        </p>
      </div>

      <form
        onSubmit={handleSaveProfile}
        className="bg-[#111318] border border-zinc-800/80 rounded-lg p-5 space-y-5"
      >
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-zinc-800/60 pb-4">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-full bg-zinc-900 border border-zinc-700 overflow-hidden flex items-center justify-center shrink-0">
              {avatarUrl ? (
                <img
                  src={avatarUrl}
                  alt={name}
                  className="w-full h-full object-cover"
                />
              ) : (
                <span className="text-lg font-semibold text-emerald-400">
                  {name ? name.charAt(0).toUpperCase() : "U"}
                </span>
              )}
            </div>
            <div className="space-y-1.5 text-xs">
              <div className="font-semibold text-zinc-100 text-sm">{currentUser.name}</div>
              <div className="flex flex-wrap items-center gap-2">
                <input
                  ref={photoInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handlePhotoUpload}
                  className="hidden"
                />
                <button
                  type="button"
                  disabled={uploadingPhoto}
                  onClick={() => photoInputRef.current?.click()}
                  className="px-3 py-1 rounded bg-zinc-800 hover:bg-zinc-700 text-zinc-200 font-medium"
                >
                  {uploadingPhoto ? "Enviando foto..." : "Enviar Foto de Perfil"}
                </button>
                {avatarUrl && (
                  <button
                    type="button"
                    onClick={() => setAvatarUrl("")}
                    className="px-2.5 py-1 rounded bg-red-950/50 text-red-300 border border-red-900/40"
                  >
                    Remover Foto
                  </button>
                )}
              </div>
            </div>
          </div>

          {savedBanner && (
            <span className="text-xs text-emerald-400 font-medium">
              Alterações salvas com sucesso.
            </span>
          )}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
          <div>
            <label className="block text-zinc-400 mb-1">Nome Completo</label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full bg-zinc-900 border border-zinc-800 rounded px-3 py-2 text-zinc-100"
            />
          </div>

          <div>
            <label className="block text-zinc-400 mb-1">Curso ou Programa (Texto livre)</label>
            <input
              type="text"
              value={course}
              onChange={(e) => setCourse(e.target.value)}
              placeholder="Ex.: Sistemas de Informação, Engenharia Elétrica..."
              className="w-full bg-zinc-900 border border-zinc-800 rounded px-3 py-2 text-zinc-100"
            />
          </div>

          <div>
            <label className="block text-zinc-400 mb-1">Instituição Atual (Texto livre)</label>
            <input
              type="text"
              value={institution}
              onChange={(e) => setInstitution(e.target.value)}
              placeholder="Ex.: IFS - Campus Lagarto, USP, UFS..."
              className="w-full bg-zinc-900 border border-zinc-800 rounded px-3 py-2 text-zinc-100"
            />
          </div>

          <div>
            <label className="block text-zinc-400 mb-1">Nível Acadêmico</label>
            <input
              type="text"
              value={degreeLevel}
              onChange={(e) => setDegreeLevel(e.target.value)}
              placeholder="Ex.: Ensino Médio/Técnico, Graduação, Mestrado..."
              className="w-full bg-zinc-900 border border-zinc-800 rounded px-3 py-2 text-zinc-100"
            />
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

          <div>
            <label className="block text-zinc-400 mb-1">Cidade Atual</label>
            <input
              type="text"
              value={currentCity}
              onChange={(e) => setCurrentCity(e.target.value)}
              placeholder="Ex.: Lagarto, São Paulo, Waterloo..."
              className="w-full bg-zinc-900 border border-zinc-800 rounded px-3 py-2 text-zinc-100"
            />
          </div>

          <div>
            <label className="block text-zinc-400 mb-1">Estado / Província</label>
            <input
              type="text"
              value={currentStateOrProvince}
              onChange={(e) => setCurrentStateOrProvince(e.target.value)}
              placeholder="Ex.: SE, SP, ON..."
              className="w-full bg-zinc-900 border border-zinc-800 rounded px-3 py-2 text-zinc-100"
            />
          </div>

          <div>
            <label className="block text-zinc-400 mb-1">País</label>
            <input
              type="text"
              value={currentCountry}
              onChange={(e) => setCurrentCountry(e.target.value)}
              placeholder="Ex.: Brasil, Canadá, Itália..."
              className="w-full bg-zinc-900 border border-zinc-800 rounded px-3 py-2 text-zinc-100"
            />
          </div>

          <div>
            <label className="block text-zinc-400 mb-1">Currículo Lattes (URL)</label>
            <input
              type="text"
              value={lattesUrl}
              onChange={(e) => setLattesUrl(e.target.value)}
              placeholder="http://lattes.cnpq.br/..."
              className="w-full bg-zinc-900 border border-zinc-800 rounded px-3 py-2 text-zinc-100"
            />
          </div>
        </div>

        <div className="flex justify-end pt-2">
          <button
            type="submit"
            className="px-4 py-2 rounded bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-medium transition-colors"
          >
            Salvar Dados do Perfil
          </button>
        </div>
      </form>

      <div className="bg-[#111318] border border-zinc-800/80 rounded-lg p-5 space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-sm font-semibold text-zinc-100">Histórico de Formações Acadêmicas</h2>
            <p className="text-xs text-zinc-500">
              Registre e edite suas formações anteriores e atuais (Técnico, Graduação, Mestrado, Doutorado).
            </p>
          </div>
          <button
            onClick={() => (showAddFormation ? setShowAddFormation(false) : openNewStep())}
            className="px-3 py-1.5 rounded bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-xs text-zinc-200"
          >
            {showAddFormation ? "Fechar" : "+ Adicionar Formação"}
          </button>
        </div>

        {showAddFormation && (
          <form
            onSubmit={handleSaveFormation}
            className="p-4 rounded bg-zinc-900/60 border border-zinc-800 grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs"
          >
            <div>
              <label className="block text-zinc-400 mb-1">Nível</label>
              <input
                type="text"
                value={formLevel}
                onChange={(e) => setFormLevel(e.target.value)}
                placeholder="Ex.: Graduação, Mestrado..."
                className="w-full bg-zinc-900 border border-zinc-800 rounded px-3 py-1.5 text-zinc-100"
              />
            </div>
            <div>
              <label className="block text-zinc-400 mb-1">Curso ou Programa *</label>
              <input
                type="text"
                required
                value={formCourse}
                onChange={(e) => setFormCourse(e.target.value)}
                placeholder="Ex.: Ciência da Computação"
                className="w-full bg-zinc-900 border border-zinc-800 rounded px-3 py-1.5 text-zinc-100"
              />
            </div>
            <div>
              <label className="block text-zinc-400 mb-1">Instituição *</label>
              <input
                type="text"
                required
                value={formInst}
                onChange={(e) => setFormInst(e.target.value)}
                placeholder="Ex.: USP, IFS..."
                className="w-full bg-zinc-900 border border-zinc-800 rounded px-3 py-1.5 text-zinc-100"
              />
            </div>
            <div>
              <label className="block text-zinc-400 mb-1">Cidade</label>
              <input
                type="text"
                value={formCity}
                onChange={(e) => setFormCity(e.target.value)}
                placeholder="Ex.: São Paulo"
                className="w-full bg-zinc-900 border border-zinc-800 rounded px-3 py-1.5 text-zinc-100"
              />
            </div>
            <div>
              <label className="block text-zinc-400 mb-1">País</label>
              <input
                type="text"
                value={formCountry}
                onChange={(e) => setFormCountry(e.target.value)}
                placeholder="Ex.: Brasil"
                className="w-full bg-zinc-900 border border-zinc-800 rounded px-3 py-1.5 text-zinc-100"
              />
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-zinc-400 mb-1">Ano Início</label>
                <input
                  type="number"
                  value={formStartYear}
                  onChange={(e) => setFormStartYear(Number(e.target.value))}
                  className="w-full bg-zinc-900 border border-zinc-800 rounded px-2 py-1.5 text-zinc-100"
                />
              </div>
              <div>
                <label className="block text-zinc-400 mb-1">Ano Fim</label>
                <input
                  type="number"
                  value={formEndYear}
                  onChange={(e) => setFormEndYear(e.target.value)}
                  placeholder="Em curso"
                  className="w-full bg-zinc-900 border border-zinc-800 rounded px-2 py-1.5 text-zinc-100"
                />
              </div>
            </div>
            <div className="sm:col-span-3 flex items-center justify-between pt-1">
              <select
                value={formStatus}
                onChange={(e) => setFormStatus(e.target.value as "EM_ANDAMENTO" | "CONCLUIDO")}
                className="bg-zinc-900 border border-zinc-800 rounded px-3 py-1.5 text-zinc-100"
              >
                <option value="EM_ANDAMENTO">Em andamento</option>
                <option value="CONCLUIDO">Concluído</option>
              </select>
              <button
                type="submit"
                className="px-4 py-1.5 rounded bg-emerald-600 hover:bg-emerald-500 text-white font-medium"
              >
                {editingStep ? "Salvar Alterações" : "Adicionar ao Histórico"}
              </button>
            </div>
          </form>
        )}

        {currentUser.academicTrajectory.length === 0 ? (
          <p className="text-xs text-zinc-500">Nenhuma formação registrada na linha do tempo.</p>
        ) : (
          <div className="divide-y divide-zinc-800/60 text-xs">
            {currentUser.academicTrajectory.map((t) => (
              <div key={t.id} className="py-2.5 flex items-center justify-between gap-2">
                <div>
                  <span className="font-medium text-zinc-100">{t.courseName}</span>
                  <span className="text-zinc-400"> · {t.institution}</span>
                  <div className="text-[11px] text-zinc-500">
                    {t.degreeLevel} · {t.city}, {t.country}
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-zinc-400">
                    {t.startYear} — {t.status === "EM_ANDAMENTO" ? "Atual" : t.endYear || ""}
                  </span>
                  <button
                    onClick={() => openEditStep(t)}
                    className="text-zinc-300 hover:text-white"
                  >
                    Editar
                  </button>
                  <button
                    onClick={() => removeAcademicStep(currentUser.id, t.id)}
                    className="text-red-400 hover:text-red-300"
                  >
                    Remover
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-[#111318] border border-zinc-800/80 rounded-lg p-5 space-y-3">
          <h2 className="text-sm font-semibold text-zinc-100">
            Minhas Produções ({myProductions.length})
          </h2>
          {myProductions.length === 0 ? (
            <p className="text-xs text-zinc-500">Nenhuma produção vinculada ao seu perfil.</p>
          ) : (
            <div className="divide-y divide-zinc-800/60 text-xs">
              {myProductions.map((p) => {
                const isPrimary =
                  p.primaryAuthorId === currentUser.id ||
                  (!p.primaryAuthorId && p.authorIds[0] === currentUser.id);
                return (
                  <div key={p.id} className="py-2.5 space-y-1">
                    <div className="flex items-center justify-between text-[11px] text-zinc-400">
                      <span className="text-emerald-400">
                        {PRODUCTION_CATEGORY_LABELS[p.category]}
                      </span>
                      <div className="flex items-center gap-2">
                        <span className="px-1.5 py-0.5 rounded bg-zinc-900 border border-zinc-800 text-zinc-300">
                          {isPrimary ? "Autor Principal" : "Coautor"}
                        </span>
                        <span>{p.year}</span>
                      </div>
                    </div>
                    <div className="font-medium text-zinc-100">{p.title}</div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        <div className="bg-[#111318] border border-zinc-800/80 rounded-lg p-5 space-y-4">
          <div>
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-semibold text-zinc-100">
                Meus Projetos e Bolsas ({myProjects.length})
              </h2>
              {totalScholarshipBRL > 0 && (
                <div className="px-2.5 py-1 rounded bg-emerald-950/50 border border-emerald-800/60 text-emerald-300 text-xs font-semibold">
                  Ganho Mensal Atual (Bolsas Vigentes): R$ {totalScholarshipBRL.toLocaleString("pt-BR")}/mês
                </div>
              )}
            </div>
            {myProjects.length === 0 ? (
              <p className="text-xs text-zinc-500 mt-2">Nenhum projeto vinculado.</p>
            ) : (
              <div className="divide-y divide-zinc-800/60 text-xs mt-2">
                {myProjects.map((proj) => {
                  const myLink = proj.members.find((m) => m.profileId === currentUser.id);
                  const isScholar = myLink?.roleInProject === "BOLSISTA";
                  const vigencia = isScholar
                    ? getScholarshipVigenciaStatus(
                        myLink?.scholarshipStartMonth,
                        myLink?.scholarshipEndMonth,
                        proj.status
                      )
                    : null;

                  return (
                    <div key={proj.id} className="py-2.5 flex items-center justify-between gap-3">
                      <div>
                        <div className="font-medium text-zinc-100">{proj.title}</div>
                        <div className="text-[11px] text-zinc-500">
                          {proj.fundingAgency} · {proj.year} ·{" "}
                          {isScholar ? "Bolsista" : "Pesquisador Integrante"}
                        </div>
                        {isScholar &&
                          (myLink?.scholarshipStartMonth ||
                            myLink?.scholarshipEndMonth ||
                            myLink?.scholarshipInstallments) && (
                            <div className="text-[11px] text-zinc-400 mt-0.5">
                              Vigência:{" "}
                              {myLink.scholarshipStartMonth
                                ? formatMonthYearBR(myLink.scholarshipStartMonth)
                                : "—"}{" "}
                              até{" "}
                              {myLink.scholarshipEndMonth
                                ? formatMonthYearBR(myLink.scholarshipEndMonth)
                                : "—"}
                              {myLink.scholarshipInstallments
                                ? ` · ${myLink.scholarshipInstallments} parcelas`
                                : ""}
                            </div>
                          )}
                      </div>
                      {isScholar && myLink?.monthlyScholarshipBRL && (
                        <div className="text-right shrink-0">
                          <div
                            className={`text-xs font-semibold ${
                              vigencia?.isActiveNow
                                ? "text-emerald-400"
                                : "text-zinc-500 line-through"
                            }`}
                          >
                            R$ {myLink.monthlyScholarshipBRL.toLocaleString("pt-BR")}/mês
                          </div>
                          {vigencia && (
                            <span
                              className={`inline-block mt-0.5 px-1.5 py-0.5 rounded text-[10px] border ${
                                vigencia.isActiveNow
                                  ? "bg-emerald-950/60 border-emerald-800/50 text-emerald-300"
                                  : "bg-zinc-900 border-zinc-700 text-zinc-400"
                              }`}
                            >
                              {vigencia.label}
                            </span>
                          )}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          <div className="pt-3 border-t border-zinc-800/80">
            <h2 className="text-sm font-semibold text-zinc-100">
              Meus Pedidos e Empréstimos de Insumos ({mySupplyRequests.length})
            </h2>
            {mySupplyRequests.length === 0 ? (
              <p className="text-xs text-zinc-500 mt-2">Nenhuma solicitação de insumo realizada.</p>
            ) : (
              <div className="divide-y divide-zinc-800/60 text-xs mt-2">
                {mySupplyRequests.map((req) => (
                  <div key={req.id} className="py-2 flex items-center justify-between">
                    <div>
                      <span className="text-zinc-200">
                        {req.quantity}x {req.itemName}
                      </span>
                      <span className="text-[11px] text-zinc-500 ml-2">
                        ({SUPPLY_REQUEST_TYPE_LABELS[req.requestType] || req.requestType})
                      </span>
                    </div>
                    <span className="text-[11px] text-zinc-400">
                      {SUPPLY_REQUEST_STATUS_LABELS[req.status] || req.status}
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
