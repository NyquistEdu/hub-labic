export type GlobalRole = 'DIRETORA' | 'COORD_GERAL' | 'PESQUISADOR';

export const GLOBAL_ROLE_LABELS: Record<GlobalRole, string> = {
  DIRETORA: 'Diretora / Orientadora Geral',
  COORD_GERAL: 'Coordenação Geral',
  PESQUISADOR: 'Pesquisador',
};

export type CoordinationType =
  | 'FINANCAS'
  | 'INSUMOS'
  | 'IMPRESSAO_3D'
  | 'MANUTENCAO'
  | 'COMPUTADORES'
  | 'LIMPEZA'
  | 'MIDIA';

export const COORDINATION_LABELS: Record<CoordinationType, string> = {
  FINANCAS: 'Finanças',
  INSUMOS: 'Insumos',
  IMPRESSAO_3D: 'Impressão 3D',
  MANUTENCAO: 'Manutenção',
  COMPUTADORES: 'Computadores',
  LIMPEZA: 'Limpeza',
  MIDIA: 'Mídia',
};

export type WorkMode = 'PRESENCIAL_LAGARTO' | 'REMOTO_EXTERNO';

export const WORK_MODE_LABELS: Record<WorkMode, string> = {
  PRESENCIAL_LAGARTO: 'Presencial (Campus Lagarto)',
  REMOTO_EXTERNO: 'Remoto / Outra Instituição',
};

export const PROJECT_STATUS_LABELS: Record<string, string> = {
  EM_ANDAMENTO: 'Em andamento',
  CONCLUIDO: 'Concluído',
  PAUSADO: 'Pausado',
};

export const DELIVERABLE_TYPE_LABELS: Record<string, string> = {
  RELATORIO_PARCIAL: 'Relatório Parcial',
  RELATORIO_FINAL: 'Relatório Final',
  PROTOTIPO_BANCADA: 'Protótipo / Bancada',
  DOCUMENTO_OPCIONAL: 'Documento / Entrega',
};

export const DELIVERABLE_STATUS_LABELS: Record<string, string> = {
  PENDENTE: 'Pendente',
  ENTREGUE: 'Entregue',
  VALIDADO: 'Validado / Aprovado',
  ATRASADO: 'Atrasado',
};

export const CONFERENCE_STATUS_LABELS: Record<string, string> = {
  ABERTO: 'Aberto',
  EM_REVISAO: 'Em Revisão Interna',
  ENCERRADO: 'Encerrado',
};

export const STARTUP_STAGE_LABELS: Record<string, string> = {
  IDEACAO: 'Ideação',
  MVP_PROTOTIPO: 'MVP / Protótipo',
  VALIDACAO: 'Em Validação',
  INCUBADA_CAPTANDO: 'Incubada / Captando',
};

export const STARTUP_PHASE_LABELS: Record<string, string> = {
  SUBMETIDO: 'Submetido',
  FASE_1: 'Fase 1',
  FASE_2_PITCH: 'Fase 2 (Pitch)',
  APROVADO_CONTEMPLADO: 'Aprovado / Contemplado',
  NAO_APROVADO: 'Não Selecionado',
};

export const SUPPLY_REQUEST_TYPE_LABELS: Record<string, string> = {
  CONSUMIVEL: 'Consumível',
  EMPRESTIMO_CAUTELA: 'Empréstimo (Cautela)',
};

export const SUPPLY_REQUEST_STATUS_LABELS: Record<string, string> = {
  PENDENTE: 'Pendente de Aprovação',
  APROVADO_ENTREGUE: 'Aprovado / Entregue',
  EM_FALTA_COMPRAR: 'Em Falta (Comprar)',
  DEVOLVIDO: 'Devolvido',
  RECUSADO: 'Recusado',
};

export const EQUIPMENT_STATUS_LABELS: Record<string, string> = {
  OPERACIONAL: 'Operacional',
  PRECISA_MANUTENCAO: 'Precisa de Manutenção',
  EM_MANUTENCAO: 'Em Manutenção',
  INATIVO: 'Inativo',
};

export const MEETING_TYPE_LABELS: Record<string, string> = {
  ORIENTACAO_SEMANAL: 'Orientação Semanal',
  REUNIAO_GERAL_MENSAL: 'Reunião Geral Mensal',
  COORDENACAO: 'Reunião de Coordenação',
  CONGRESSO_REVISAO: 'Revisão de Congresso',
};

export const DOCUMENT_CATEGORY_LABELS: Record<string, string> = {
  TEMPLATE_ARTIGO: 'Template / Modelo',
  MANUAL_BANCADA: 'Manual de Bancada / Norma',
  OFICIO_EDITAL: 'Ofício / Edital',
  OUTRO_DOCUMENTO: 'Outro Documento',
};

/**
 * Formata datas ISO (YYYY-MM-DD ou timestamps ISO) para DD/MM/AAAA
 */
export function formatDateBR(raw?: string): string {
  if (!raw) return '—';
  const trimmed = raw.trim();
  if (/^\d{2}\/\d{2}\/\d{4}$/.test(trimmed)) return trimmed;
  const isoMatch = trimmed.match(/^(\d{4})-(\d{2})-(\d{2})/);
  if (isoMatch) {
    return `${isoMatch[3]}/${isoMatch[2]}/${isoMatch[1]}`;
  }
  return trimmed;
}

/**
 * Formata data e horário de reunião sem nunca exibir timestamp ISO bruto
 */
export function formatMeetingDateTime(
  meetingDate?: string,
  meetingTime?: string,
  scheduledAt?: string
): string {
  if (meetingDate && /^\d{4}-\d{2}-\d{2}$/.test(meetingDate.trim())) {
    const d = formatDateBR(meetingDate.trim());
    const t = meetingTime && meetingTime.trim() ? meetingTime.trim().slice(0, 5) : '';
    return t ? `${d} às ${t}` : d;
  }
  if (!scheduledAt) return '—';
  const trimmed = scheduledAt.trim();
  // Caso já esteja no formato DD/MM/YYYY às HH:MM
  if (/^\d{2}\/\d{2}\/\d{4}/.test(trimmed)) return trimmed;
  // Caso seja um timestamp ISO 2026-11-10T14:00:00...
  const tsMatch = trimmed.match(/^(\d{4})-(\d{2})-(\d{2})[T\s](\d{2}):(\d{2})/);
  if (tsMatch) {
    return `${tsMatch[3]}/${tsMatch[2]}/${tsMatch[1]} às ${tsMatch[4]}:${tsMatch[5]}`;
  }
  return formatDateBR(trimmed);
}

/**
 * Formata YYYY-MM para MM/AAAA
 */
export function formatMonthYearBR(ym?: string): string {
  if (!ym) return '—';
  const m = ym.trim().match(/^(\d{4})-(\d{2})$/);
  if (m) return `${m[2]}/${m[1]}`;
  return ym;
}

/**
 * Calcula a quantidade de meses/parcelas (inclusivo) entre dois meses YYYY-MM
 */
export function calculateInstallmentsBetween(startMonth?: string, endMonth?: string): number {
  if (!startMonth || !endMonth) return 12;
  const s = startMonth.trim().match(/^(\d{4})-(\d{2})$/);
  const e = endMonth.trim().match(/^(\d{4})-(\d{2})$/);
  if (!s || !e) return 12;
  const startTotal = Number(s[1]) * 12 + Number(s[2]);
  const endTotal = Number(e[1]) * 12 + Number(e[2]);
  const diff = endTotal - startTotal + 1;
  return diff > 0 ? diff : 1;
}

/**
 * Verifica se a bolsa está vigente no mês/ano atual
 */
export function getScholarshipVigenciaStatus(
  startMonth?: string,
  endMonth?: string,
  projectStatus?: string
): { isActiveNow: boolean; label: string } {
  if (projectStatus && projectStatus !== 'EM_ANDAMENTO') {
    return { isActiveNow: false, label: 'Projeto Concluído / Pausado' };
  }
  const nowYM = new Date().toISOString().slice(0, 7); // YYYY-MM
  const hasStart = Boolean(startMonth && /^\d{4}-\d{2}$/.test(startMonth.trim()));
  const hasEnd = Boolean(endMonth && /^\d{4}-\d{2}$/.test(endMonth.trim()));

  if (hasStart && nowYM < startMonth!.trim()) {
    return { isActiveNow: false, label: 'Vigência Futura' };
  }
  if (hasEnd && nowYM > endMonth!.trim()) {
    return { isActiveNow: false, label: 'Vigência Encerrada' };
  }
  return { isActiveNow: true, label: 'Vigente' };
}

export interface LabicAttachment {
  id: string;
  label: string;
  url: string;
  fileType: 'PDF_UPLOAD' | 'LINK_EXTERNO';
  uploadedById?: string;
  uploadedAt?: string;
}

export interface LabicMilestone {
  id: string;
  title: string;
  dueDate: string;
  description?: string;
  completed: boolean;
  completedById?: string;
  completedAt?: string;
}

export interface ProjectNoteItem {
  id: string;
  text: string;
  authorId: string;
  authorName: string;
  createdAt: string; // Data e hora da nota
}

/**
 * Converte notas salvas no projeto (seja texto antigo legado ou JSON array)
 * em um array estruturado de ProjectNoteItem[].
 */
export function parseProjectNotes(notesRaw?: string): ProjectNoteItem[] {
  if (!notesRaw || !notesRaw.trim()) return [];
  try {
    const parsed = JSON.parse(notesRaw);
    if (Array.isArray(parsed)) {
      return parsed.filter(
        (item) => item && typeof item.text === 'string' && item.text.trim().length > 0
      );
    }
  } catch {
    // Se for texto legado anterior ao formato JSON, exibe como anotação histórica inicial
    return [
      {
        id: 'legacy-note',
        text: notesRaw.trim(),
        authorId: '',
        authorName: 'Registro Histórico',
        createdAt: 'Anotação anterior',
      },
    ];
  }
  return [];
}

/**
 * Serializa o array de ProjectNoteItem para string a ser salva no banco
 */
export function serializeProjectNotes(notes: ProjectNoteItem[]): string {
  return JSON.stringify(notes);
}

export interface AcademicStep {
  id: string;
  degreeLevel: string;
  courseName: string;
  institution: string;
  city: string;
  country: string;
  startYear: number;
  endYear?: number;
  status: 'EM_ANDAMENTO' | 'CONCLUIDO';
}

export interface LabicMember {
  id: string;
  name: string;
  email: string;
  password?: string;
  avatarInitials: string;
  avatarUrl?: string;
  globalRole: GlobalRole;
  status: 'ATIVO' | 'INATIVO';
  workMode: WorkMode;
  coordinations: CoordinationType[];
  course: string;
  institution: string;
  degreeLevel: string;
  currentCity: string;
  currentStateOrProvince: string;
  currentCountry: string;
  latitude: number;
  longitude: number;
  academicTrajectory: AcademicStep[];
  lattesUrl?: string;
  githubUrl?: string;
  linkedinUrl?: string;
  showOnPublicShowcase: boolean;
}

export type ProductionCategory =
  | 'ARTIGO'
  | 'TCC'
  | 'INPI_SOFTWARE'
  | 'PREMIACAO'
  | 'EDITAL_APROVADO'
  | 'PROTOTIPO_BANCADA'
  | 'STARTUP_CONQUISTA';

export const PRODUCTION_CATEGORY_LABELS: Record<ProductionCategory, string> = {
  ARTIGO: 'Artigo Científico',
  TCC: 'TCC / Dissertação / Tese',
  INPI_SOFTWARE: 'Registro de Software (INPI)',
  PREMIACAO: 'Premiação / Menção Honrosa',
  EDITAL_APROVADO: 'Edital de Fomento Aprovado',
  PROTOTIPO_BANCADA: 'Protótipo / Bancada',
  STARTUP_CONQUISTA: 'Marco de Startup',
};

export interface ProductionItem {
  id: string;
  title: string;
  category: ProductionCategory;
  year: number;
  venueOrAgency: string;
  primaryAuthorId?: string;
  authorIds: string[];
  externalAuthors?: string; // Autores externos ao LABIC separados por vírgula
  projectId?: string;
  fileName?: string;
  attachments: LabicAttachment[];
  verifiedByCoordination: boolean;
  isSensitive: boolean;
}

export interface ProjectScholarMember {
  profileId: string;
  roleInProject: 'BOLSISTA' | 'VOLUNTARIO' | 'COORIENTADOR' | 'ORIENTADOR';
  scholarshipProgram?: string;
  monthlyScholarshipBRL?: number;
  scholarshipStartMonth?: string; // YYYY-MM (ex.: 2026-03)
  scholarshipEndMonth?: string; // YYYY-MM (ex.: 2027-02)
  scholarshipInstallments?: number; // Quantidade de parcelas (ex.: 12)
}

export interface ProjectDeliverable {
  id: string;
  title: string;
  description?: string;
  type: 'RELATORIO_PARCIAL' | 'RELATORIO_FINAL' | 'PROTOTIPO_BANCADA' | 'DOCUMENTO_OPCIONAL';
  dueDate: string;
  status: 'PENDENTE' | 'ENTREGUE' | 'VALIDADO' | 'ATRASADO';
  fileName?: string;
  attachments: LabicAttachment[];
  submittedByProfileId?: string;
}

export interface LabicProject {
  id: string;
  code: string;
  title: string;
  year: number;
  summary: string;
  publicSummary: string;
  fundingAgency: string;
  status: 'EM_ANDAMENTO' | 'CONCLUIDO' | 'PAUSADO';
  advisorId: string;
  coAdvisorId?: string;
  startDate: string;
  endDate?: string;
  members: ProjectScholarMember[];
  deliverables: ProjectDeliverable[];
  notes?: string;
  showOnPublicShowcase: boolean;
  isSensitiveIp: boolean;
}

export type SubmissionStatus =
  | 'RASCUNHO'
  | 'EM_REVISAO_INTERNA'
  | 'SEGUNDA_REVISAO'
  | 'AJUSTES_SOLICITADOS'
  | 'APTO_SUBMISSAO'
  | 'SUBMETIDO_EVENTO'
  | 'PUBLICADO'
  | 'DESCARTADO';

export const SUBMISSION_STATUS_LABELS: Record<SubmissionStatus, string> = {
  RASCUNHO: '1ª Versão / Em Escrita',
  EM_REVISAO_INTERNA: 'Em 1ª Revisão Interna',
  SEGUNDA_REVISAO: 'Em 2ª Revisão Interna',
  AJUSTES_SOLICITADOS: 'Ajustes Solicitados pelo Revisor',
  APTO_SUBMISSAO: 'Apto para Submissão',
  SUBMETIDO_EVENTO: 'Submetido ao Congresso',
  PUBLICADO: 'Aceito / Publicado',
  DESCARTADO: 'Não Será Mais Publicado / Arquivado',
};

export interface SubmissionVersion {
  id: string;
  versionLabel: string;
  fileUrl: string;
  fileName: string;
  notes: string;
  uploadedById: string;
  uploadedByName: string;
  role: 'AUTOR' | 'REVISOR';
  createdAt: string;
}

export interface ConferenceSubmission {
  id: string;
  conferenceId: string;
  title: string;
  projectId?: string;
  primaryAuthorId?: string;
  authorIds: string[];
  externalAuthors?: string; // Coautores externos separados por vírgula
  reviewerIds: string[];
  status: SubmissionStatus;
  fileName: string;
  versionLabel: string;
  reviewNotes: string;
  versions: SubmissionVersion[];
  updatedAt: string;
}

export interface LabicConference {
  id: string;
  name: string;
  acronym: string;
  location: string;
  internalReviewDeadline: string;
  officialSubmissionDeadline: string;
  eventDate: string;
  status: 'ABERTO' | 'EM_REVISAO' | 'ENCERRADO';
  milestones: LabicMilestone[];
}

export interface StartupApplication {
  id: string;
  programName: string;
  year: number;
  phaseOrStatus: 'SUBMETIDO' | 'FASE_1' | 'FASE_2_PITCH' | 'APROVADO_CONTEMPLADO' | 'NAO_APROVADO';
  approvedGrantBRL?: number;
  memberIds: string[];
  milestones: LabicMilestone[];
  attachments: LabicAttachment[];
  notes?: string;
}

export interface LabicStartup {
  id: string;
  name: string;
  tagline: string;
  description: string;
  stage: 'IDEACAO' | 'MVP_PROTOTIPO' | 'VALIDACAO' | 'INCUBADA_CAPTANDO';
  memberIds: string[];
  applications: StartupApplication[];
  showOnPublicShowcase: boolean;
}

export interface InventoryItem {
  id: string;
  name: string;
  category: string;
  quantityAvailable: number;
  isReturnableEquipment: boolean;
  locationBin: string;
}

export interface SupplyRequest {
  id: string;
  requesterId: string;
  projectId?: string;
  itemName: string;
  quantity: number;
  requestType: 'CONSUMIVEL' | 'EMPRESTIMO_CAUTELA';
  status: 'PENDENTE' | 'APROVADO_ENTREGUE' | 'EM_FALTA_COMPRAR' | 'DEVOLVIDO' | 'RECUSADO';
  coordinatorResponse?: string;
  createdAt: string;
}

export interface Print3DRequest {
  id: string;
  requesterId: string;
  projectId?: string;
  partName: string;
  stlFileName: string;
  material: string;
  estimatedGrams: number;
  printerAssigned: string;
  status:
    | 'AGUARDANDO_APROVACAO'
    | 'APROVADO_PARA_IMPRIMIR'
    | 'NA_FILA'
    | 'IMPRIMINDO'
    | 'CONCLUIDO'
    | 'FALHA_REIMPRIMIR'
    | 'RECUSADO';
  createdAt: string;
}

export interface EquipmentAsset {
  id: string;
  code: string;
  name: string;
  assetType: 'COMPUTADOR' | 'EQUIPAMENTO_BANCADA' | 'IMPRESSORA_3D' | 'CLIMATIZACAO';
  specs: string;
  status: 'OPERACIONAL' | 'PRECISA_MANUTENCAO' | 'EM_MANUTENCAO' | 'INATIVO';
  maintenanceNeed?: string;
  reportedByProfileId?: string;
  updatedAt: string;
}

export interface CleaningTaskRow {
  id: string;
  taskTitle: string;
  daysOfWeek: string;
  assignedMemberIds: string[];
  notes: string;
}

export interface MediaScheduleSlot {
  id: string;
  monthLabel: string;
  scheduledDate: string;
  assignedProfileId: string;
  topicSuggestion: string;
  status: 'AGENDADO' | 'PUBLICADO';
}

export interface FinanceTransaction {
  id: string;
  boxId: string;
  description: string;
  txType: 'ENTRADA' | 'SAIDA';
  amountBRL: number;
  txDate: string;
  createdByProfileId: string;
}

export interface FinanceBox {
  id: string;
  name: string;
  purpose: string;
  targetAmountBRL?: number;
  currentBalanceBRL: number;
}

export interface LabicMeeting {
  id: string;
  title: string;
  meetingType: 'ORIENTACAO_SEMANAL' | 'REUNIAO_GERAL_MENSAL' | 'COORDENACAO' | 'CONGRESSO_REVISAO';
  scheduledAt: string;
  meetingDate: string;
  meetingTime: string;
  locationOrLink: string;
  minutesNotes?: string;
  organizerId: string;
  participantIds: string[];
}

export interface GeneralDocument {
  id: string;
  title: string;
  category: 'TEMPLATE_ARTIGO' | 'MANUAL_BANCADA' | 'OFICIO_EDITAL' | 'OUTRO_DOCUMENTO';
  fileName: string;
  attachments: LabicAttachment[];
  uploadedByProfileId: string;
  uploadedAt: string;
}

export interface LabicNotification {
  id: string;
  recipientProfileId: string;
  category: 'MIDIA' | 'REUNIAO' | 'RELATORIO' | 'REVISAO_CONGRESSO' | 'INSUMO_3D';
  title: string;
  message: string;
  actionHref: string;
  dateLabel: string;
  read: boolean;
}

export interface PageTutorialContent {
  pageKey: string;
  title: string;
  purpose: string;
  whoCanAccess: string;
  steps: {
    stepTitle: string;
    description: string;
  }[];
  semioticTips: string[];
}
