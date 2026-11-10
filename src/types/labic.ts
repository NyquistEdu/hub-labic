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
