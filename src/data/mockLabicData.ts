import {
  CleaningTaskRow,
  ConferenceSubmission,
  EquipmentAsset,
  FinanceBox,
  FinanceTransaction,
  GeneralDocument,
  InventoryItem,
  LabicConference,
  LabicMeeting,
  LabicMember,
  LabicNotification,
  LabicProject,
  LabicStartup,
  MediaScheduleSlot,
  Print3DRequest,
  ProductionItem,
  SupplyRequest,
} from '@/types/labic';

export const INITIAL_MEMBERS: LabicMember[] = [
  {
    id: 'admin-inicial',
    name: 'Administrador Geral',
    email: 'admin@labic.edu.br',
    password: 'labic2026',
    avatarInitials: 'AD',
    globalRole: 'COORD_GERAL',
    status: 'ATIVO',
    workMode: 'PRESENCIAL_LAGARTO',
    coordinations: [
      'FINANCAS',
      'INSUMOS',
      'IMPRESSAO_3D',
      'MANUTENCAO',
      'COMPUTADORES',
      'LIMPEZA',
      'MIDIA',
    ],
    course: 'Sistemas de Informação',
    institution: 'IFS - Campus Lagarto',
    degreeLevel: 'Graduação',
    currentCity: 'Lagarto',
    currentStateOrProvince: 'SE',
    currentCountry: 'Brasil',
    latitude: -10.9167,
    longitude: -37.65,
    academicTrajectory: [],
    showOnPublicShowcase: true,
  },
];

export const INITIAL_PROJECTS: LabicProject[] = [];
export const INITIAL_PRODUCTIONS: ProductionItem[] = [];
export const INITIAL_CONFERENCES: LabicConference[] = [];
export const INITIAL_SUBMISSIONS: ConferenceSubmission[] = [];
export const INITIAL_STARTUPS: LabicStartup[] = [];
export const INITIAL_INVENTORY: InventoryItem[] = [];
export const INITIAL_SUPPLY_REQUESTS: SupplyRequest[] = [];
export const INITIAL_PRINT3D_REQUESTS: Print3DRequest[] = [];
export const INITIAL_EQUIPMENT_ASSETS: EquipmentAsset[] = [];
export const INITIAL_CLEANING_TASKS: CleaningTaskRow[] = [];
export const INITIAL_MEDIA_SLOTS: MediaScheduleSlot[] = [];
export const INITIAL_FINANCE_BOXES: FinanceBox[] = [];
export const INITIAL_FINANCE_TRANSACTIONS: FinanceTransaction[] = [];
export const INITIAL_MEETINGS: LabicMeeting[] = [];
export const INITIAL_GENERAL_DOCUMENTS: GeneralDocument[] = [];
export const INITIAL_NOTIFICATIONS: LabicNotification[] = [];
