'use client';

import React, { createContext, useCallback, useContext, useEffect, useState } from 'react';
import {
  AcademicStep,
  CleaningTaskRow,
  ConferenceSubmission,
  CoordinationType,
  EquipmentAsset,
  FinanceBox,
  FinanceTransaction,
  GeneralDocument,
  InventoryItem,
  LabicAttachment,
  LabicConference,
  LabicMeeting,
  LabicMember,
  LabicMilestone,
  LabicNotification,
  LabicProject,
  LabicStartup,
  MediaScheduleSlot,
  Print3DRequest,
  ProductionItem,
  ProjectDeliverable,
  StartupApplication,
  SubmissionStatus,
  SubmissionVersion,
  SupplyRequest,
} from '@/types/labic';
import { INITIAL_MEMBERS } from '@/data/mockLabicData';
import { supabase, isSupabaseConfigured } from '@/lib/supabase';

const CITY_COORDINATES: Record<string, { lat: number; lng: number }> = {
  lagarto: { lat: -10.9167, lng: -37.65 },
  aracaju: { lat: -10.9472, lng: -37.0731 },
  'são paulo': { lat: -23.5505, lng: -46.6333 },
  'sao paulo': { lat: -23.5505, lng: -46.6333 },
  campinas: { lat: -22.9099, lng: -47.0626 },
  recife: { lat: -8.0476, lng: -34.877 },
  salvador: { lat: -12.9714, lng: -38.5014 },
  waterloo: { lat: 43.4643, lng: -80.5204 },
  toronto: { lat: 43.6532, lng: -79.3832 },
  ottawa: { lat: 45.4215, lng: -75.6972 },
  vancouver: { lat: 49.2827, lng: -123.1207 },
  montreal: { lat: 45.5017, lng: -73.5673 },
  milão: { lat: 45.4642, lng: 9.19 },
  milao: { lat: 45.4642, lng: 9.19 },
  bolonha: { lat: 44.4949, lng: 11.3426 },
  roma: { lat: 41.9028, lng: 12.4964 },
  lisboa: { lat: 38.7223, lng: -9.1393 },
  porto: { lat: 41.1579, lng: -8.6291 },
  londres: { lat: 51.5074, lng: -0.1278 },
  berlim: { lat: 52.52, lng: 13.405 },
  paris: { lat: 48.8566, lng: 2.3522 },
  boston: { lat: 42.3601, lng: -71.0589 },
};

const COUNTRY_COORDINATES: Record<string, { lat: number; lng: number }> = {
  brasil: { lat: -10.9167, lng: -37.65 },
  canadá: { lat: 43.6532, lng: -79.3832 },
  canada: { lat: 43.6532, lng: -79.3832 },
  itália: { lat: 45.4642, lng: 9.19 },
  italia: { lat: 45.4642, lng: 9.19 },
  portugal: { lat: 38.7223, lng: -9.1393 },
  'estados unidos': { lat: 42.3601, lng: -71.0589 },
  eua: { lat: 42.3601, lng: -71.0589 },
  alemanha: { lat: 52.52, lng: 13.405 },
  frança: { lat: 48.8566, lng: 2.3522 },
  espanha: { lat: 40.4168, lng: -3.7038 },
};

export function resolveCoordinates(city: string, country: string) {
  const cKey = city.trim().toLowerCase();
  if (CITY_COORDINATES[cKey]) return CITY_COORDINATES[cKey];
  const countryKey = country.trim().toLowerCase();
  if (COUNTRY_COORDINATES[countryKey]) return COUNTRY_COORDINATES[countryKey];
  return { lat: -10.9167, lng: -37.65 };
}

interface LabicContextType {
  currentUser: LabicMember | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<{ ok: boolean; error?: string }>;
  logout: () => void;
  refreshData: () => Promise<void>;
  uploadFileToStorage: (bucket: string, file: File) => Promise<string>;

  members: LabicMember[];
  projects: LabicProject[];
  productions: ProductionItem[];
  conferences: LabicConference[];
  submissions: ConferenceSubmission[];
  startups: LabicStartup[];
  inventory: InventoryItem[];
  supplyRequests: SupplyRequest[];
  print3DRequests: Print3DRequest[];
  equipmentAssets: EquipmentAsset[];
  cleaningTasks: CleaningTaskRow[];
  mediaSlots: MediaScheduleSlot[];
  financeBoxes: FinanceBox[];
  financeTransactions: FinanceTransaction[];
  meetings: LabicMeeting[];
  generalDocuments: GeneralDocument[];
  notifications: LabicNotification[];

  isAdmin: () => boolean;
  hasCoordination: (coord: CoordinationType) => boolean;
  canSeeFinances: () => boolean;
  canSeeScholarshipValue: (scholarProfileId: string) => boolean;
  canAccessProject: (projectId: string) => boolean;
  canAccessStartupEdital: (startupId: string, editalId: string) => boolean;

  // Membros & Perfil
  updateMemberProfile: (memberId: string, updates: Partial<LabicMember>) => Promise<void>;
  updateMemberAccount: (memberId: string, updates: Partial<LabicMember>) => Promise<void>;
  deleteMember: (memberId: string) => Promise<void>;
  addAcademicStep: (memberId: string, step: Omit<AcademicStep, 'id'>) => Promise<void>;
  updateAcademicStep: (memberId: string, stepId: string, updates: Partial<AcademicStep>) => Promise<void>;
  removeAcademicStep: (memberId: string, stepId: string) => Promise<void>;
  addMember: (
    member: Omit<LabicMember, 'id' | 'latitude' | 'longitude' | 'academicTrajectory'> & {
      password: string;
    }
  ) => Promise<void>;
  toggleMemberCoordination: (memberId: string, coord: CoordinationType) => Promise<void>;
  toggleMemberStatus: (memberId: string) => Promise<void>;

  // Produções (CRUD)
  addProduction: (item: Omit<ProductionItem, 'id'>) => Promise<void>;
  updateProduction: (prodId: string, updates: Partial<ProductionItem>) => Promise<void>;
  deleteProduction: (prodId: string) => Promise<void>;

  // Projetos & Entregas (CRUD + Notas)
  addProject: (proj: Omit<LabicProject, 'id'>) => Promise<void>;
  updateProject: (projectId: string, updates: Partial<LabicProject>) => Promise<void>;
  deleteProject: (projectId: string) => Promise<void>;
  updateProjectNotes: (projectId: string, notes: string) => Promise<void>;
  addProjectDeliverable: (
    projectId: string,
    deliverable: Omit<ProjectDeliverable, 'id'>
  ) => Promise<void>;
  updateProjectDeliverable: (
    projectId: string,
    deliverableId: string,
    updates: Partial<ProjectDeliverable>
  ) => Promise<void>;
  deleteProjectDeliverable: (projectId: string, deliverableId: string) => Promise<void>;
  submitDeliverable: (
    projectId: string,
    deliverableId: string,
    fileName: string
  ) => Promise<void>;
  toggleProjectPublicShowcase: (projectId: string) => Promise<void>;

  // Documentos Gerais (CRUD)
  addGeneralDocument: (doc: Omit<GeneralDocument, 'id'>) => Promise<void>;
  updateGeneralDocument: (docId: string, updates: Partial<GeneralDocument>) => Promise<void>;
  deleteGeneralDocument: (docId: string) => Promise<void>;

  // Congressos & Submissões (CRUD + Versões + Metas)
  addConference: (conf: Omit<LabicConference, 'id'>) => Promise<void>;
  updateConference: (confId: string, updates: Partial<LabicConference>) => Promise<void>;
  deleteConference: (confId: string) => Promise<void>;
  addSubmission: (sub: Omit<ConferenceSubmission, 'id' | 'updatedAt'>) => Promise<void>;
  updateSubmission: (subId: string, updates: Partial<ConferenceSubmission>) => Promise<void>;
  deleteSubmission: (subId: string) => Promise<void>;
  addSubmissionVersion: (
    subId: string,
    version: Omit<SubmissionVersion, 'id' | 'createdAt'>
  ) => Promise<void>;
  deleteSubmissionVersion: (subId: string, versionId: string) => Promise<void>;
  updateSubmissionReview: (
    submissionId: string,
    status: SubmissionStatus,
    reviewNotes: string,
    versionLabel?: string
  ) => Promise<void>;

  // Startups & Editais (CRUD + Segurança por Edital)
  addStartup: (startup: Omit<LabicStartup, 'id'>) => Promise<void>;
  updateStartup: (startupId: string, updates: Partial<LabicStartup>) => Promise<void>;
  deleteStartup: (startupId: string) => Promise<void>;
  addStartupApplication: (
    startupId: string,
    app: Omit<StartupApplication, 'id'>
  ) => Promise<void>;
  updateStartupApplication: (
    startupId: string,
    appId: string,
    updates: Partial<StartupApplication>
  ) => Promise<void>;
  deleteStartupApplication: (startupId: string, appId: string) => Promise<void>;

  // Insumos, 3D, Patrimônio, Limpeza, Mídia, Finanças, Reuniões
  addInventoryItem: (item: Omit<InventoryItem, 'id'>) => Promise<void>;
  updateInventoryItem: (itemId: string, updates: Partial<InventoryItem>) => Promise<void>;
  deleteInventoryItem: (itemId: string) => Promise<void>;
  addSupplyRequest: (req: Omit<SupplyRequest, 'id' | 'createdAt' | 'status'>) => Promise<void>;
  updateSupplyRequestStatus: (
    reqId: string,
    status: SupplyRequest['status'],
    coordinatorResponse: string
  ) => Promise<void>;
  deleteSupplyRequest: (reqId: string) => Promise<void>;
  addPrint3DRequest: (
    req: Omit<Print3DRequest, 'id' | 'createdAt' | 'status'>
  ) => Promise<void>;
  updatePrint3DStatus: (reqId: string, status: Print3DRequest['status']) => Promise<void>;
  deletePrint3DRequest: (reqId: string) => Promise<void>;
  addEquipmentAsset: (asset: Omit<EquipmentAsset, 'id' | 'updatedAt'>) => Promise<void>;
  updateEquipmentAsset: (assetId: string, updates: Partial<EquipmentAsset>) => Promise<void>;
  deleteEquipmentAsset: (assetId: string) => Promise<void>;
  updateEquipmentStatus: (
    assetId: string,
    status: EquipmentAsset['status'],
    maintenanceNeed?: string
  ) => Promise<void>;
  addCleaningTask: (task: Omit<CleaningTaskRow, 'id'>) => Promise<void>;
  updateCleaningTask: (taskId: string, updates: Partial<CleaningTaskRow>) => Promise<void>;
  deleteCleaningTask: (taskId: string) => Promise<void>;
  randomizeMediaSchedule: (eligibleMemberIds: string[], monthLabel: string) => Promise<void>;
  deleteMediaSlot: (slotId: string) => Promise<void>;
  addFinanceBox: (box: Omit<FinanceBox, 'id'>) => Promise<void>;
  updateFinanceBox: (boxId: string, updates: Partial<FinanceBox>) => Promise<void>;
  deleteFinanceBox: (boxId: string) => Promise<void>;
  addFinanceTransaction: (tx: Omit<FinanceTransaction, 'id' | 'txDate'>) => Promise<void>;
  deleteFinanceTransaction: (txId: string) => Promise<void>;
  addMeeting: (meeting: Omit<LabicMeeting, 'id'>) => Promise<void>;
  updateMeeting: (meetingId: string, updates: Partial<LabicMeeting>) => Promise<void>;
  deleteMeeting: (meetingId: string) => Promise<void>;
  markNotificationRead: (notifId: string) => void;
}

const LabicContext = createContext<LabicContextType | undefined>(undefined);

export function LabicProvider({ children }: { children: React.ReactNode }) {
  const [members, setMembers] = useState<LabicMember[]>(INITIAL_MEMBERS);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const [projects, setProjects] = useState<LabicProject[]>([]);
  const [productions, setProductions] = useState<ProductionItem[]>([]);
  const [conferences, setConferences] = useState<LabicConference[]>([]);
  const [submissions, setSubmissions] = useState<ConferenceSubmission[]>([]);
  const [startups, setStartups] = useState<LabicStartup[]>([]);
  const [inventory, setInventory] = useState<InventoryItem[]>([]);
  const [supplyRequests, setSupplyRequests] = useState<SupplyRequest[]>([]);
  const [print3DRequests, setPrint3DRequests] = useState<Print3DRequest[]>([]);
  const [equipmentAssets, setEquipmentAssets] = useState<EquipmentAsset[]>([]);
  const [cleaningTasks, setCleaningTasks] = useState<CleaningTaskRow[]>([]);
  const [mediaSlots, setMediaSlots] = useState<MediaScheduleSlot[]>([]);
  const [financeBoxes, setFinanceBoxes] = useState<FinanceBox[]>([]);
  const [financeTransactions, setFinanceTransactions] = useState<FinanceTransaction[]>([]);
  const [meetings, setMeetings] = useState<LabicMeeting[]>([]);
  const [generalDocuments, setGeneralDocuments] = useState<GeneralDocument[]>([]);
  const [notifications, setNotifications] = useState<LabicNotification[]>([]);

  const currentUser =
    members.find((m) => m.id === currentUserId && m.status === 'ATIVO') || null;
  const isAuthenticated = Boolean(currentUser);

  const uploadFileToStorage = async (bucket: string, file: File): Promise<string> => {
    if (isSupabaseConfigured && supabase) {
      const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, '_');
      const path = `${Date.now()}_${safeName}`;
      const { error } = await supabase.storage.from(bucket).upload(path, file, {
        upsert: true,
      });
      if (!error) {
        const { data } = supabase.storage.from(bucket).getPublicUrl(path);
        if (data?.publicUrl) return data.publicUrl;
      }
    }
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onload = () => resolve(String(reader.result || file.name));
      reader.onerror = () => resolve(file.name);
      reader.readAsDataURL(file);
    });
  };

  const refreshData = useCallback(async () => {
    if (!isSupabaseConfigured || !supabase) {
      setIsLoading(false);
      return;
    }

    try {
      const [
        profRes,
        acadRes,
        projRes,
        pmRes,
        psRes,
        pdRes,
        prodRes,
        confRes,
        subRes,
        stRes,
        stAppRes,
        invRes,
        supRes,
        p3dRes,
        eqRes,
        cleanRes,
        medRes,
        fBoxRes,
        fTxRes,
        meetRes,
        docRes,
      ] = await Promise.all([
        supabase.from('profiles').select('*').order('created_at', { ascending: true }),
        supabase.from('academic_trajectories').select('*').order('start_year', { ascending: true }),
        supabase.from('projects').select('*').order('created_at', { ascending: false }),
        supabase.from('project_members').select('*'),
        supabase.from('project_scholarships_private').select('*'),
        supabase.from('project_deliverables').select('*'),
        supabase.from('productions').select('*').order('year', { ascending: false }),
        supabase.from('conferences').select('*'),
        supabase.from('conference_submissions').select('*'),
        supabase.from('startups').select('*'),
        supabase.from('startup_applications').select('*'),
        supabase.from('inventory_items').select('*'),
        supabase.from('supply_requests').select('*').order('created_at', { ascending: false }),
        supabase.from('print3d_requests').select('*').order('created_at', { ascending: false }),
        supabase.from('equipment_assets').select('*'),
        supabase.from('cleaning_tasks').select('*'),
        supabase.from('media_schedule_slots').select('*').order('scheduled_date', { ascending: true }),
        supabase.from('finance_boxes').select('*'),
        supabase.from('finance_transactions').select('*').order('tx_date', { ascending: false }),
        supabase.from('meetings').select('*').order('scheduled_at', { ascending: true }),
        supabase.from('general_documents').select('*').order('uploaded_at', { ascending: false }),
      ]);

      if (profRes.data && profRes.data.length > 0) {
        const acadRows = acadRes.data || [];
        const mappedMembers: LabicMember[] = profRes.data.map((row: Record<string, unknown>) => ({
          id: String(row.id),
          name: String(row.name || ''),
          email: String(row.email || ''),
          password: String(row.password || 'labic123'),
          avatarInitials: String(row.avatar_initials || 'LB'),
          avatarUrl: row.avatar_url ? String(row.avatar_url) : undefined,
          globalRole: (row.global_role as LabicMember['globalRole']) || 'PESQUISADOR',
          status: (row.status as LabicMember['status']) || 'ATIVO',
          workMode: (row.work_mode as LabicMember['workMode']) || 'PRESENCIAL_LAGARTO',
          coordinations: (row.coordinations as CoordinationType[]) || [],
          course: String(row.course || ''),
          institution: String(row.institution || 'IFS - Campus Lagarto'),
          degreeLevel: String(row.degree_level || 'Graduação'),
          currentCity: String(row.current_location_city || 'Lagarto'),
          currentStateOrProvince: String(row.current_location_state || 'SE'),
          currentCountry: String(row.current_location_country || 'Brasil'),
          latitude: Number(row.latitude ?? -10.9167),
          longitude: Number(row.longitude ?? -37.65),
          academicTrajectory: acadRows
            .filter((a: Record<string, unknown>) => a.profile_id === row.id)
            .map((a: Record<string, unknown>) => ({
              id: String(a.id),
              degreeLevel: String(a.degree_level || ''),
              courseName: String(a.course_name || ''),
              institution: String(a.institution || ''),
              city: String(a.city || ''),
              country: String(a.country || ''),
              startYear: Number(a.start_year || 2026),
              endYear: a.end_year ? Number(a.end_year) : undefined,
              status: (a.status as 'EM_ANDAMENTO' | 'CONCLUIDO') || 'EM_ANDAMENTO',
            })),
          lattesUrl: row.lattes_url ? String(row.lattes_url) : undefined,
          githubUrl: row.github_url ? String(row.github_url) : undefined,
          linkedinUrl: row.linkedin_url ? String(row.linkedin_url) : undefined,
          showOnPublicShowcase: Boolean(row.show_on_public_showcase ?? true),
        }));
        setMembers(mappedMembers);
      }

      if (projRes.data) {
        const pmRows = pmRes.data || [];
        const psRows = psRes.data || [];
        const pdRows = pdRes.data || [];
        setProjects(
          projRes.data.map((p: Record<string, unknown>) => ({
            id: String(p.id),
            code: String(p.code || ''),
            title: String(p.title || ''),
            year: Number(p.year || (p.start_date ? String(p.start_date).slice(0, 4) : 2026)),
            summary: String(p.summary || ''),
            publicSummary: String(p.public_summary || p.summary || ''),
            fundingAgency: String(p.funding_agency || 'PIBIC'),
            status: (p.status as LabicProject['status']) || 'EM_ANDAMENTO',
            advisorId: String(p.advisor_id || ''),
            coAdvisorId: p.co_advisor_id ? String(p.co_advisor_id) : undefined,
            startDate: String(p.start_date || ''),
            endDate: p.end_date ? String(p.end_date) : undefined,
            notes: p.notes ? String(p.notes) : '',
            showOnPublicShowcase: Boolean(p.show_on_public_showcase),
            isSensitiveIp: Boolean(p.is_sensitive_ip),
            members: pmRows
              .filter((m: Record<string, unknown>) => m.project_id === p.id)
              .map((m: Record<string, unknown>) => {
                const priv = psRows.find(
                  (s: Record<string, unknown>) =>
                    s.project_id === p.id && s.scholar_profile_id === m.profile_id
                );
                return {
                  profileId: String(m.profile_id),
                  roleInProject:
                    (m.role_in_project as 'BOLSISTA' | 'VOLUNTARIO' | 'COORIENTADOR' | 'ORIENTADOR') ||
                    'VOLUNTARIO',
                  scholarshipProgram: m.scholarship_program
                    ? String(m.scholarship_program)
                    : undefined,
                  monthlyScholarshipBRL: priv ? Number(priv.monthly_value_brl) : undefined,
                  scholarshipStartMonth:
                    priv && priv.start_month ? String(priv.start_month) : undefined,
                  scholarshipEndMonth:
                    priv && priv.end_month ? String(priv.end_month) : undefined,
                  scholarshipInstallments:
                    priv && priv.installments ? Number(priv.installments) : undefined,
                };
              }),
            deliverables: pdRows
              .filter((d: Record<string, unknown>) => d.project_id === p.id)
              .map((d: Record<string, unknown>) => ({
                id: String(d.id),
                title: String(d.title || ''),
                description: d.description ? String(d.description) : undefined,
                type:
                  (d.deliverable_type as ProjectDeliverable['type']) || 'DOCUMENTO_OPCIONAL',
                dueDate: String(d.due_date || ''),
                status: (d.status as ProjectDeliverable['status']) || 'PENDENTE',
                fileName: d.file_name ? String(d.file_name) : undefined,
                attachments: Array.isArray(d.attachments)
                  ? (d.attachments as LabicAttachment[])
                  : [],
                submittedByProfileId: d.submitted_by ? String(d.submitted_by) : undefined,
              })),
          }))
        );
      }

      if (prodRes.data) {
        setProductions(
          prodRes.data.map((pr: Record<string, unknown>) => {
            const authorIds = (pr.author_ids as string[]) || [];
            return {
              id: String(pr.id),
              title: String(pr.title || ''),
              category: (pr.category as ProductionItem['category']) || 'ARTIGO',
              year: Number(pr.year || 2026),
              venueOrAgency: String(pr.venue_or_agency || ''),
              projectId: pr.project_id ? String(pr.project_id) : undefined,
              primaryAuthorId: pr.primary_author_id
                ? String(pr.primary_author_id)
                : authorIds[0],
              authorIds,
              externalAuthors: pr.external_authors ? String(pr.external_authors) : undefined,
              fileName: pr.file_name ? String(pr.file_name) : undefined,
              attachments: Array.isArray(pr.attachments)
                ? (pr.attachments as LabicAttachment[])
                : [],
              verifiedByCoordination: Boolean(pr.verified_by_coordination ?? true),
              isSensitive: Boolean(pr.is_sensitive),
            };
          })
        );
      }

      if (confRes.data) {
        setConferences(
          confRes.data.map((c: Record<string, unknown>) => ({
            id: String(c.id),
            name: String(c.name || ''),
            acronym: String(c.acronym || ''),
            location: String(c.location || ''),
            internalReviewDeadline: String(c.internal_review_deadline || ''),
            officialSubmissionDeadline: String(c.official_submission_deadline || ''),
            eventDate: String(c.event_date || ''),
            status: (c.status as LabicConference['status']) || 'ABERTO',
            milestones: Array.isArray(c.milestones)
              ? (c.milestones as LabicMilestone[])
              : [],
          }))
        );
      }

      if (subRes.data) {
        setSubmissions(
          subRes.data.map((s: Record<string, unknown>) => {
            const authorIds = (s.author_ids as string[]) || [];
            return {
              id: String(s.id),
              conferenceId: String(s.conference_id),
              title: String(s.title || ''),
              projectId: s.project_id ? String(s.project_id) : undefined,
              primaryAuthorId: s.primary_author_id
                ? String(s.primary_author_id)
                : authorIds[0],
              authorIds,
              externalAuthors: s.external_authors ? String(s.external_authors) : undefined,
              reviewerIds: (s.reviewer_ids as string[]) || [],
              status: (s.status as SubmissionStatus) || 'RASCUNHO',
              fileName: String(s.file_name || ''),
              versionLabel: String(s.version_label || 'v1'),
              reviewNotes: String(s.review_notes || ''),
              versions: Array.isArray(s.versions)
                ? (s.versions as SubmissionVersion[])
                : [],
              updatedAt: String(s.updated_at || ''),
            };
          })
        );
      }

      if (stRes.data) {
        const appRows = stAppRes.data || [];
        setStartups(
          stRes.data.map((st: Record<string, unknown>) => ({
            id: String(st.id),
            name: String(st.name || ''),
            tagline: String(st.tagline || ''),
            description: String(st.description || ''),
            stage: (st.stage as LabicStartup['stage']) || 'MVP_PROTOTIPO',
            memberIds: (st.member_ids as string[]) || [],
            showOnPublicShowcase: Boolean(st.show_on_public_showcase ?? true),
            applications: appRows
              .filter((a: Record<string, unknown>) => a.startup_id === st.id)
              .map((a: Record<string, unknown>) => ({
                id: String(a.id),
                programName: String(a.program_name || ''),
                year: Number(a.year || 2026),
                phaseOrStatus:
                  (a.phase_or_status as StartupApplication['phaseOrStatus']) || 'SUBMETIDO',
                approvedGrantBRL: a.approved_grant_brl
                  ? Number(a.approved_grant_brl)
                  : undefined,
                memberIds: Array.isArray(a.member_ids)
                  ? (a.member_ids as string[])
                  : ((st.member_ids as string[]) || []),
                milestones: Array.isArray(a.milestones)
                  ? (a.milestones as LabicMilestone[])
                  : [],
                attachments: Array.isArray(a.attachments)
                  ? (a.attachments as LabicAttachment[])
                  : [],
                notes: a.notes ? String(a.notes) : '',
              })),
          }))
        );
      }

      if (invRes.data) {
        setInventory(
          invRes.data.map((i: Record<string, unknown>) => ({
            id: String(i.id),
            name: String(i.name || ''),
            category: String(i.category || ''),
            quantityAvailable: Number(i.quantity_available || 0),
            isReturnableEquipment: Boolean(i.is_returnable_equipment),
            locationBin: String(i.location_bin || ''),
          }))
        );
      }

      if (supRes.data) {
        setSupplyRequests(
          supRes.data.map((r: Record<string, unknown>) => ({
            id: String(r.id),
            requesterId: String(r.requester_id),
            projectId: r.project_id ? String(r.project_id) : undefined,
            itemName: String(r.item_name || ''),
            quantity: Number(r.quantity || 1),
            requestType: (r.request_type as SupplyRequest['requestType']) || 'CONSUMIVEL',
            status: (r.status as SupplyRequest['status']) || 'PENDENTE',
            coordinatorResponse: r.coordinator_response
              ? String(r.coordinator_response)
              : undefined,
            createdAt: String(r.created_at || ''),
          }))
        );
      }

      if (p3dRes.data) {
        setPrint3DRequests(
          p3dRes.data.map((r: Record<string, unknown>) => ({
            id: String(r.id),
            requesterId: String(r.requester_id),
            projectId: r.project_id ? String(r.project_id) : undefined,
            partName: String(r.part_name || ''),
            stlFileName: String(r.stl_file_name || ''),
            material: String(r.material || 'PLA'),
            estimatedGrams: Number(r.estimated_grams || 30),
            printerAssigned: String(r.printer_assigned || ''),
            status: (r.status as Print3DRequest['status']) || 'AGUARDANDO_APROVACAO',
            createdAt: String(r.created_at || ''),
          }))
        );
      }

      if (eqRes.data) {
        setEquipmentAssets(
          eqRes.data.map((e: Record<string, unknown>) => ({
            id: String(e.id),
            code: String(e.code || ''),
            name: String(e.name || ''),
            assetType: (e.asset_type as EquipmentAsset['assetType']) || 'COMPUTADOR',
            specs: String(e.specs || ''),
            status: (e.status as EquipmentAsset['status']) || 'OPERACIONAL',
            maintenanceNeed: e.maintenance_need ? String(e.maintenance_need) : undefined,
            reportedByProfileId: e.reported_by ? String(e.reported_by) : undefined,
            updatedAt: String(e.updated_at || ''),
          }))
        );
      }

      if (cleanRes.data) {
        setCleaningTasks(
          cleanRes.data.map((c: Record<string, unknown>) => ({
            id: String(c.id),
            taskTitle: String(c.task_title || ''),
            daysOfWeek: String(c.days_of_week || ''),
            assignedMemberIds: (c.assigned_member_ids as string[]) || [],
            notes: String(c.notes || ''),
          }))
        );
      }

      if (medRes.data) {
        setMediaSlots(
          medRes.data.map((m: Record<string, unknown>) => ({
            id: String(m.id),
            monthLabel: String(m.month_label || ''),
            scheduledDate: String(m.scheduled_date || ''),
            assignedProfileId: String(m.assigned_profile_id),
            topicSuggestion: String(m.topic_suggestion || ''),
            status: (m.status as MediaScheduleSlot['status']) || 'AGENDADO',
          }))
        );
      }

      if (fBoxRes.data) {
        setFinanceBoxes(
          fBoxRes.data.map((b: Record<string, unknown>) => ({
            id: String(b.id),
            name: String(b.name || ''),
            purpose: String(b.purpose || ''),
            targetAmountBRL: b.target_amount_brl ? Number(b.target_amount_brl) : undefined,
            currentBalanceBRL: Number(b.current_balance_brl || 0),
          }))
        );
      }

      if (fTxRes.data) {
        setFinanceTransactions(
          fTxRes.data.map((t: Record<string, unknown>) => ({
            id: String(t.id),
            boxId: String(t.box_id),
            description: String(t.description || ''),
            txType: (t.tx_type as 'ENTRADA' | 'SAIDA') || 'SAIDA',
            amountBRL: Number(t.amount_brl || 0),
            txDate: String(t.tx_date || ''),
            createdByProfileId: String(t.created_by || ''),
          }))
        );
      }

      if (meetRes.data) {
        setMeetings(
          meetRes.data.map((m: Record<string, unknown>) => ({
            id: String(m.id),
            title: String(m.title || ''),
            meetingType: (m.meeting_type as LabicMeeting['meetingType']) || 'ORIENTACAO_SEMANAL',
            scheduledAt: String(m.scheduled_at || ''),
            meetingDate: m.meeting_date ? String(m.meeting_date) : '',
            meetingTime: m.meeting_time ? String(m.meeting_time) : '',
            minutesNotes: m.minutes_notes ? String(m.minutes_notes) : '',
            locationOrLink: String(m.location_or_link || ''),
            organizerId: String(m.organizer_id),
            participantIds: (m.participant_ids as string[]) || [],
          }))
        );
      }

      if (docRes.data) {
        setGeneralDocuments(
          docRes.data.map((d: Record<string, unknown>) => ({
            id: String(d.id),
            title: String(d.title || ''),
            category: (d.category as GeneralDocument['category']) || 'OUTRO_DOCUMENTO',
            fileName: String(d.file_name || ''),
            attachments: Array.isArray(d.attachments)
              ? (d.attachments as LabicAttachment[])
              : [],
            uploadedByProfileId: String(d.uploaded_by || ''),
            uploadedAt: String(d.uploaded_at || ''),
          }))
        );
      }
    } finally {
      setIsLoading(false);
    }
  }, []);

  const SESSION_STORAGE_KEY = 'labic_auth_session';
  const SESSION_DURATION_MS = 24 * 60 * 60 * 1000; // 24 horas

  const clearAuthStorage = () => {
    try {
      localStorage.removeItem(SESSION_STORAGE_KEY);
      localStorage.removeItem('labic_auth_user_id');
      document.cookie = 'labic_auth_user_id=; path=/; max-age=0; SameSite=Lax';
    } catch {
      // Ignorar
    }
  };

  useEffect(() => {
    refreshData().then(() => {
      try {
        const rawSession = localStorage.getItem(SESSION_STORAGE_KEY);
        if (rawSession) {
          const parsed = JSON.parse(rawSession) as { userId?: string; expiresAt?: number };
          if (parsed.userId && parsed.expiresAt && Date.now() < parsed.expiresAt) {
            setCurrentUserId(parsed.userId);
          } else {
            clearAuthStorage();
            setCurrentUserId(null);
          }
          return;
        }
        // Migração automática de sessão legada sem expiração -> define 24h a partir de agora
        const legacyId = localStorage.getItem('labic_auth_user_id');
        if (legacyId) {
          const expiresAt = Date.now() + SESSION_DURATION_MS;
          localStorage.setItem(
            SESSION_STORAGE_KEY,
            JSON.stringify({ userId: legacyId, expiresAt })
          );
          localStorage.removeItem('labic_auth_user_id');
          document.cookie = `labic_auth_user_id=${legacyId}; path=/; max-age=86400; SameSite=Lax`;
          setCurrentUserId(legacyId);
        }
      } catch {
        clearAuthStorage();
      }
    });
  }, [refreshData]);

  useEffect(() => {
    const interval = setInterval(() => {
      try {
        const rawSession = localStorage.getItem(SESSION_STORAGE_KEY);
        if (!rawSession) return;
        const parsed = JSON.parse(rawSession) as { userId?: string; expiresAt?: number };
        if (!parsed.expiresAt || Date.now() >= parsed.expiresAt) {
          clearAuthStorage();
          setCurrentUserId(null);
        }
      } catch {
        clearAuthStorage();
        setCurrentUserId(null);
      }
    }, 60_000);
    return () => clearInterval(interval);
  }, []);

  const login = async (email: string, password: string) => {
    const cleanEmail = email.trim().toLowerCase();
    const match = members.find(
      (m) =>
        m.email.toLowerCase() === cleanEmail &&
        (m.password === password || (!m.password && password === 'labic123'))
    );
    if (!match) {
      return { ok: false, error: 'E-mail ou senha inválidos.' };
    }
    if (match.status === 'INATIVO') {
      return { ok: false, error: 'Esta conta está desativada. Contate a Coordenação Geral.' };
    }
    setCurrentUserId(match.id);
    try {
      const expiresAt = Date.now() + SESSION_DURATION_MS;
      localStorage.setItem(
        SESSION_STORAGE_KEY,
        JSON.stringify({ userId: match.id, expiresAt })
      );
      localStorage.removeItem('labic_auth_user_id');
      document.cookie = `labic_auth_user_id=${match.id}; path=/; max-age=86400; SameSite=Lax`;
    } catch {
      // Ignorar
    }
    return { ok: true };
  };

  const logout = () => {
    setCurrentUserId(null);
    clearAuthStorage();
  };

  const isAdmin = () =>
    Boolean(
      currentUser &&
        (currentUser.globalRole === 'DIRETORA' || currentUser.globalRole === 'COORD_GERAL')
    );

  const hasCoordination = (coord: CoordinationType) =>
    Boolean(currentUser && (isAdmin() || currentUser.coordinations.includes(coord)));

  const canSeeFinances = () =>
    Boolean(currentUser && (isAdmin() || currentUser.coordinations.includes('FINANCAS')));

  const canSeeScholarshipValue = (scholarProfileId: string) =>
    Boolean(currentUser && (isAdmin() || currentUser.id === scholarProfileId));

  const canAccessProject = (projectId: string) => {
    if (!currentUser) return false;
    if (isAdmin()) return true;
    const proj = projects.find((p) => p.id === projectId);
    if (!proj) return false;
    return (
      proj.advisorId === currentUser.id ||
      proj.coAdvisorId === currentUser.id ||
      proj.members.some((m) => m.profileId === currentUser.id)
    );
  };

  const canAccessStartupEdital = (startupId: string, editalId: string) => {
    if (!currentUser) return false;
    if (isAdmin()) return true;
    const st = startups.find((s) => s.id === startupId);
    if (!st) return false;
    const edital = st.applications.find((a) => a.id === editalId);
    if (!edital) return false;
    return edital.memberIds.includes(currentUser.id);
  };

  const updateMemberProfile = async (
    memberId: string,
    updates: Partial<LabicMember>
  ) => {
    const target = members.find((m) => m.id === memberId);
    if (!target) return;
    const merged = { ...target, ...updates };
    const coords = resolveCoordinates(merged.currentCity, merged.currentCountry);
    merged.latitude = coords.lat;
    merged.longitude = coords.lng;

    setMembers((prev) => prev.map((m) => (m.id === memberId ? merged : m)));

    if (isSupabaseConfigured && supabase) {
      await supabase
        .from('profiles')
        .update({
          name: merged.name,
          email: merged.email,
          password: merged.password,
          avatar_initials: merged.avatarInitials,
          avatar_url: merged.avatarUrl || null,
          global_role: merged.globalRole,
          status: merged.status,
          course: merged.course,
          institution: merged.institution,
          degree_level: merged.degreeLevel,
          work_mode: merged.workMode,
          current_location_city: merged.currentCity,
          current_location_state: merged.currentStateOrProvince,
          current_location_country: merged.currentCountry,
          latitude: merged.latitude,
          longitude: merged.longitude,
          lattes_url: merged.lattesUrl || null,
          github_url: merged.githubUrl || null,
          linkedin_url: merged.linkedinUrl || null,
          show_on_public_showcase: merged.showOnPublicShowcase,
        })
        .eq('id', memberId);
    }
  };

  const updateMemberAccount = async (
    memberId: string,
    updates: Partial<LabicMember>
  ) => {
    if (!isAdmin()) return;
    const target = members.find((m) => m.id === memberId);
    if (!target) return;
    const merged = { ...target, ...updates };
    const coords = resolveCoordinates(merged.currentCity, merged.currentCountry);
    merged.latitude = coords.lat;
    merged.longitude = coords.lng;

    setMembers((prev) => prev.map((m) => (m.id === memberId ? merged : m)));

    if (isSupabaseConfigured && supabase) {
      await supabase
        .from('profiles')
        .update({
          name: merged.name,
          email: merged.email,
          password: merged.password,
          avatar_initials: merged.avatarInitials,
          avatar_url: merged.avatarUrl || null,
          global_role: merged.globalRole,
          status: merged.status,
          work_mode: merged.workMode,
          course: merged.course,
          institution: merged.institution,
          degree_level: merged.degreeLevel,
          current_location_city: merged.currentCity,
          current_location_state: merged.currentStateOrProvince,
          current_location_country: merged.currentCountry,
          latitude: merged.latitude,
          longitude: merged.longitude,
        })
        .eq('id', memberId);
    }
  };

  const deleteMember = async (memberId: string) => {
    if (!isAdmin()) return;
    setMembers((prev) => prev.filter((m) => m.id !== memberId));
    if (isSupabaseConfigured && supabase) {
      await supabase.from('profiles').delete().eq('id', memberId);
    }
  };

  const addAcademicStep = async (memberId: string, step: Omit<AcademicStep, 'id'>) => {
    const newStep: AcademicStep = { ...step, id: `acad-${Date.now()}` };
    setMembers((prev) =>
      prev.map((m) =>
        m.id === memberId
          ? { ...m, academicTrajectory: [...m.academicTrajectory, newStep] }
          : m
      )
    );
    if (isSupabaseConfigured && supabase) {
      await supabase.from('academic_trajectories').insert({
        id: newStep.id,
        profile_id: memberId,
        degree_level: 'GRADUACAO',
        course_name: newStep.courseName,
        institution: newStep.institution,
        city: newStep.city,
        country: newStep.country,
        start_year: newStep.startYear,
        end_year: newStep.endYear || null,
        status: newStep.status,
      });
    }
  };

  const updateAcademicStep = async (
    memberId: string,
    stepId: string,
    updates: Partial<AcademicStep>
  ) => {
    setMembers((prev) =>
      prev.map((m) =>
        m.id === memberId
          ? {
              ...m,
              academicTrajectory: m.academicTrajectory.map((s) =>
                s.id === stepId ? { ...s, ...updates } : s
              ),
            }
          : m
      )
    );
    if (isSupabaseConfigured && supabase) {
      await supabase
        .from('academic_trajectories')
        .update({
          course_name: updates.courseName,
          institution: updates.institution,
          city: updates.city,
          country: updates.country,
          start_year: updates.startYear,
          end_year: updates.endYear || null,
          status: updates.status,
        })
        .eq('id', stepId);
    }
  };

  const removeAcademicStep = async (memberId: string, stepId: string) => {
    setMembers((prev) =>
      prev.map((m) =>
        m.id === memberId
          ? {
              ...m,
              academicTrajectory: m.academicTrajectory.filter((s) => s.id !== stepId),
            }
          : m
      )
    );
    if (isSupabaseConfigured && supabase) {
      await supabase.from('academic_trajectories').delete().eq('id', stepId);
    }
  };

  const addMember = async (
    member: Omit<LabicMember, 'id' | 'latitude' | 'longitude' | 'academicTrajectory'> & {
      password: string;
    }
  ) => {
    if (!isAdmin()) return;
    const coords = resolveCoordinates(member.currentCity, member.currentCountry);
    const newMem: LabicMember = {
      ...member,
      id: `mem-${Date.now()}`,
      latitude: coords.lat,
      longitude: coords.lng,
      academicTrajectory: [],
    };
    setMembers((prev) => [...prev, newMem]);

    if (isSupabaseConfigured && supabase) {
      await supabase.from('profiles').insert({
        id: newMem.id,
        name: newMem.name,
        email: newMem.email,
        password: member.password,
        avatar_initials: newMem.avatarInitials,
        avatar_url: newMem.avatarUrl || null,
        global_role: newMem.globalRole,
        status: newMem.status,
        work_mode: newMem.workMode,
        coordinations: newMem.coordinations,
        course: newMem.course,
        institution: newMem.institution,
        degree_level: newMem.degreeLevel,
        current_location_city: newMem.currentCity,
        current_location_state: newMem.currentStateOrProvince,
        current_location_country: newMem.currentCountry,
        latitude: newMem.latitude,
        longitude: newMem.longitude,
        show_on_public_showcase: newMem.showOnPublicShowcase,
      });
    }
  };

  const toggleMemberCoordination = async (memberId: string, coord: CoordinationType) => {
    if (!isAdmin()) return;
    const target = members.find((m) => m.id === memberId);
    if (!target) return;
    const has = target.coordinations.includes(coord);
    const nextCoords = has
      ? target.coordinations.filter((c) => c !== coord)
      : [...target.coordinations, coord];

    setMembers((prev) =>
      prev.map((m) => (m.id === memberId ? { ...m, coordinations: nextCoords } : m))
    );

    if (isSupabaseConfigured && supabase) {
      await supabase
        .from('profiles')
        .update({ coordinations: nextCoords })
        .eq('id', memberId);
    }
  };

  const toggleMemberStatus = async (memberId: string) => {
    if (!isAdmin()) return;
    const target = members.find((m) => m.id === memberId);
    if (!target) return;
    const nextStatus = target.status === 'ATIVO' ? 'INATIVO' : 'ATIVO';
    setMembers((prev) =>
      prev.map((m) => (m.id === memberId ? { ...m, status: nextStatus } : m))
    );
    if (isSupabaseConfigured && supabase) {
      await supabase.from('profiles').update({ status: nextStatus }).eq('id', memberId);
    }
  };

  // --- PRODUÇÕES (CRUD) ---
  const addProduction = async (item: Omit<ProductionItem, 'id'>) => {
    const ensuredAuthors = item.primaryAuthorId
      ? Array.from(new Set([item.primaryAuthorId, ...item.authorIds]))
      : item.authorIds;

    const newProd: ProductionItem = {
      ...item,
      authorIds: ensuredAuthors,
      id: `prod-${Date.now()}`,
    };
    setProductions((prev) => [newProd, ...prev]);

    if (isSupabaseConfigured && supabase) {
      await supabase.from('productions').insert({
        id: newProd.id,
        title: newProd.title,
        category: newProd.category,
        year: newProd.year,
        venue_or_agency: newProd.venueOrAgency,
        project_id: newProd.projectId || null,
        primary_author_id: newProd.primaryAuthorId || null,
        author_ids: newProd.authorIds,
        external_authors: newProd.externalAuthors || '',
        file_name: newProd.fileName || null,
        attachments: newProd.attachments || [],
        verified_by_coordination: newProd.verifiedByCoordination,
        is_sensitive: newProd.isSensitive,
      });
    }
  };

  const updateProduction = async (prodId: string, updates: Partial<ProductionItem>) => {
    const target = productions.find((p) => p.id === prodId);
    if (!target) return;
    const merged: ProductionItem = { ...target, ...updates };
    if (merged.primaryAuthorId && !merged.authorIds.includes(merged.primaryAuthorId)) {
      merged.authorIds = [merged.primaryAuthorId, ...merged.authorIds];
    }

    setProductions((prev) => prev.map((p) => (p.id === prodId ? merged : p)));

    if (isSupabaseConfigured && supabase) {
      await supabase
        .from('productions')
        .update({
          title: merged.title,
          category: merged.category,
          year: merged.year,
          venue_or_agency: merged.venueOrAgency,
          project_id: merged.projectId || null,
          primary_author_id: merged.primaryAuthorId || null,
          author_ids: merged.authorIds,
          external_authors: merged.externalAuthors || '',
          file_name: merged.fileName || null,
          attachments: merged.attachments || [],
          is_sensitive: merged.isSensitive,
        })
        .eq('id', prodId);
    }
  };

  const deleteProduction = async (prodId: string) => {
    setProductions((prev) => prev.filter((p) => p.id !== prodId));
    if (isSupabaseConfigured && supabase) {
      await supabase.from('productions').delete().eq('id', prodId);
    }
  };

  // --- PROJETOS & ENTREGAS (CRUD) ---
  const addProject = async (proj: Omit<LabicProject, 'id'>) => {
    const newProj: LabicProject = {
      ...proj,
      id: `proj-${Date.now()}`,
    };
    setProjects((prev) => [newProj, ...prev]);

    if (isSupabaseConfigured && supabase) {
      await supabase.from('projects').insert({
        id: newProj.id,
        code: newProj.code,
        title: newProj.title,
        year: newProj.year,
        summary: newProj.summary,
        public_summary: newProj.publicSummary,
        funding_agency: newProj.fundingAgency,
        status: newProj.status,
        advisor_id: newProj.advisorId,
        co_advisor_id: newProj.coAdvisorId || null,
        start_date: newProj.startDate,
        notes: newProj.notes || '',
        show_on_public_showcase: newProj.showOnPublicShowcase,
        is_sensitive_ip: newProj.isSensitiveIp,
      });

      for (const m of newProj.members) {
        await supabase.from('project_members').upsert({
          project_id: newProj.id,
          profile_id: m.profileId,
          role_in_project: m.roleInProject,
          scholarship_program: m.scholarshipProgram || null,
        });
        if (m.roleInProject === 'BOLSISTA' && m.monthlyScholarshipBRL) {
          await supabase.from('project_scholarships_private').upsert({
            project_id: newProj.id,
            scholar_profile_id: m.profileId,
            monthly_value_brl: m.monthlyScholarshipBRL,
            start_month: m.scholarshipStartMonth || '',
            end_month: m.scholarshipEndMonth || '',
            installments: m.scholarshipInstallments || 12,
            active: true,
          });
        }
      }

      for (const d of newProj.deliverables) {
        await supabase.from('project_deliverables').insert({
          id: d.id,
          project_id: newProj.id,
          title: d.title,
          description: d.description || '',
          deliverable_type: d.type,
          due_date: d.dueDate,
          status: d.status,
          attachments: d.attachments || [],
        });
      }
    }
  };

  const updateProject = async (projectId: string, updates: Partial<LabicProject>) => {
    if (!canAccessProject(projectId)) return;
    const target = projects.find((p) => p.id === projectId);
    if (!target) return;
    const merged: LabicProject = { ...target, ...updates };
    setProjects((prev) => prev.map((p) => (p.id === projectId ? merged : p)));

    if (isSupabaseConfigured && supabase) {
      await supabase
        .from('projects')
        .update({
          title: merged.title,
          year: merged.year,
          summary: merged.summary,
          public_summary: merged.publicSummary,
          funding_agency: merged.fundingAgency,
          status: merged.status,
          co_advisor_id: merged.coAdvisorId || null,
          notes: merged.notes || '',
          show_on_public_showcase: merged.showOnPublicShowcase,
        })
        .eq('id', projectId);

      if (updates.members) {
        await supabase.from('project_members').delete().eq('project_id', projectId);
        await supabase
          .from('project_scholarships_private')
          .delete()
          .eq('project_id', projectId);
        for (const m of merged.members) {
          await supabase.from('project_members').upsert({
            project_id: projectId,
            profile_id: m.profileId,
            role_in_project: m.roleInProject,
            scholarship_program: m.scholarshipProgram || null,
          });
          if (m.roleInProject === 'BOLSISTA' && m.monthlyScholarshipBRL) {
            await supabase.from('project_scholarships_private').upsert({
              project_id: projectId,
              scholar_profile_id: m.profileId,
              monthly_value_brl: m.monthlyScholarshipBRL,
              start_month: m.scholarshipStartMonth || '',
              end_month: m.scholarshipEndMonth || '',
              installments: m.scholarshipInstallments || 12,
              active: true,
            });
          }
        }
      }
    }
  };

  const deleteProject = async (projectId: string) => {
    if (!canAccessProject(projectId)) return;
    setProjects((prev) => prev.filter((p) => p.id !== projectId));
    if (isSupabaseConfigured && supabase) {
      await supabase.from('projects').delete().eq('id', projectId);
    }
  };

  const updateProjectNotes = async (projectId: string, notes: string) => {
    if (!canAccessProject(projectId)) return;
    setProjects((prev) =>
      prev.map((p) => (p.id === projectId ? { ...p, notes } : p))
    );
    if (isSupabaseConfigured && supabase) {
      await supabase.from('projects').update({ notes }).eq('id', projectId);
    }
  };

  const addProjectDeliverable = async (
    projectId: string,
    deliverable: Omit<ProjectDeliverable, 'id'>
  ) => {
    if (!canAccessProject(projectId)) return;
    const newDel: ProjectDeliverable = {
      ...deliverable,
      id: `del-${Date.now()}`,
    };
    setProjects((prev) =>
      prev.map((p) =>
        p.id === projectId
          ? { ...p, deliverables: [...p.deliverables, newDel] }
          : p
      )
    );
    if (isSupabaseConfigured && supabase) {
      await supabase.from('project_deliverables').insert({
        id: newDel.id,
        project_id: projectId,
        title: newDel.title,
        description: newDel.description || '',
        deliverable_type: newDel.type,
        due_date: newDel.dueDate,
        status: newDel.status,
        file_name: newDel.fileName || null,
        attachments: newDel.attachments || [],
        submitted_by: currentUser?.id || null,
      });
    }
  };

  const updateProjectDeliverable = async (
    projectId: string,
    deliverableId: string,
    updates: Partial<ProjectDeliverable>
  ) => {
    if (!canAccessProject(projectId)) return;
    setProjects((prev) =>
      prev.map((p) => {
        if (p.id !== projectId) return p;
        return {
          ...p,
          deliverables: p.deliverables.map((d) =>
            d.id === deliverableId ? { ...d, ...updates } : d
          ),
        };
      })
    );
    if (isSupabaseConfigured && supabase) {
      await supabase
        .from('project_deliverables')
        .update({
          ...(updates.title !== undefined ? { title: updates.title } : {}),
          ...(updates.description !== undefined ? { description: updates.description } : {}),
          ...(updates.dueDate !== undefined ? { due_date: updates.dueDate } : {}),
          ...(updates.status !== undefined ? { status: updates.status } : {}),
          ...(updates.fileName !== undefined ? { file_name: updates.fileName } : {}),
          ...(updates.attachments !== undefined ? { attachments: updates.attachments } : {}),
          submitted_by: currentUser?.id || null,
        })
        .eq('id', deliverableId);
    }
  };

  const deleteProjectDeliverable = async (projectId: string, deliverableId: string) => {
    if (!canAccessProject(projectId)) return;
    setProjects((prev) =>
      prev.map((p) =>
        p.id === projectId
          ? {
              ...p,
              deliverables: p.deliverables.filter((d) => d.id !== deliverableId),
            }
          : p
      )
    );
    if (isSupabaseConfigured && supabase) {
      await supabase.from('project_deliverables').delete().eq('id', deliverableId);
    }
  };

  const submitDeliverable = async (
    projectId: string,
    deliverableId: string,
    fileName: string
  ) => {
    await updateProjectDeliverable(projectId, deliverableId, {
      status: 'ENTREGUE',
      fileName,
      submittedByProfileId: currentUser?.id,
    });
  };

  const toggleProjectPublicShowcase = async (projectId: string) => {
    const target = projects.find((p) => p.id === projectId);
    if (!target) return;
    const nextVal = !target.showOnPublicShowcase;
    setProjects((prev) =>
      prev.map((p) => (p.id === projectId ? { ...p, showOnPublicShowcase: nextVal } : p))
    );
    if (isSupabaseConfigured && supabase) {
      await supabase
        .from('projects')
        .update({ show_on_public_showcase: nextVal })
        .eq('id', projectId);
    }
  };

  // --- DOCUMENTOS GERAIS (CRUD) ---
  const addGeneralDocument = async (doc: Omit<GeneralDocument, 'id'>) => {
    const newDoc: GeneralDocument = { ...doc, id: `doc-${Date.now()}` };
    setGeneralDocuments((prev) => [newDoc, ...prev]);
    if (isSupabaseConfigured && supabase) {
      await supabase.from('general_documents').insert({
        id: newDoc.id,
        title: newDoc.title,
        category: newDoc.category,
        file_name: newDoc.fileName,
        attachments: newDoc.attachments || [],
        uploaded_by: newDoc.uploadedByProfileId,
        uploaded_at: newDoc.uploadedAt,
      });
    }
  };

  const updateGeneralDocument = async (
    docId: string,
    updates: Partial<GeneralDocument>
  ) => {
    const target = generalDocuments.find((d) => d.id === docId);
    if (!target) return;
    const merged = { ...target, ...updates };
    setGeneralDocuments((prev) => prev.map((d) => (d.id === docId ? merged : d)));
    if (isSupabaseConfigured && supabase) {
      await supabase
        .from('general_documents')
        .update({
          title: merged.title,
          category: merged.category,
          file_name: merged.fileName,
          attachments: merged.attachments || [],
        })
        .eq('id', docId);
    }
  };

  const deleteGeneralDocument = async (docId: string) => {
    setGeneralDocuments((prev) => prev.filter((d) => d.id !== docId));
    if (isSupabaseConfigured && supabase) {
      await supabase.from('general_documents').delete().eq('id', docId);
    }
  };

  // --- CONGRESSOS & SUBMISSÕES (CRUD + VERSÕES + METAS) ---
  const addConference = async (conf: Omit<LabicConference, 'id'>) => {
    const newConf: LabicConference = { ...conf, id: `conf-${Date.now()}` };
    setConferences((prev) => [newConf, ...prev]);
    if (isSupabaseConfigured && supabase) {
      await supabase.from('conferences').insert({
        id: newConf.id,
        name: newConf.name,
        acronym: newConf.acronym,
        location: newConf.location,
        internal_review_deadline: newConf.internalReviewDeadline,
        official_submission_deadline: newConf.officialSubmissionDeadline,
        event_date: newConf.eventDate,
        status: newConf.status,
        milestones: newConf.milestones || [],
      });
    }
  };

  const updateConference = async (
    confId: string,
    updates: Partial<LabicConference>
  ) => {
    const target = conferences.find((c) => c.id === confId);
    if (!target) return;
    const merged = { ...target, ...updates };
    setConferences((prev) => prev.map((c) => (c.id === confId ? merged : c)));
    if (isSupabaseConfigured && supabase) {
      await supabase
        .from('conferences')
        .update({
          name: merged.name,
          acronym: merged.acronym,
          location: merged.location,
          internal_review_deadline: merged.internalReviewDeadline,
          official_submission_deadline: merged.officialSubmissionDeadline,
          event_date: merged.eventDate,
          status: merged.status,
          milestones: merged.milestones || [],
        })
        .eq('id', confId);
    }
  };

  const deleteConference = async (confId: string) => {
    setConferences((prev) => prev.filter((c) => c.id !== confId));
    setSubmissions((prev) => prev.filter((s) => s.conferenceId !== confId));
    if (isSupabaseConfigured && supabase) {
      await supabase.from('conferences').delete().eq('id', confId);
    }
  };

  const addSubmission = async (sub: Omit<ConferenceSubmission, 'id' | 'updatedAt'>) => {
    const ensuredAuthors = sub.primaryAuthorId
      ? Array.from(new Set([sub.primaryAuthorId, ...sub.authorIds]))
      : sub.authorIds;
    const newSub: ConferenceSubmission = {
      ...sub,
      authorIds: ensuredAuthors,
      id: `sub-${Date.now()}`,
      updatedAt: new Date().toISOString().slice(0, 10),
    };
    setSubmissions((prev) => [newSub, ...prev]);
    if (isSupabaseConfigured && supabase) {
      await supabase.from('conference_submissions').insert({
        id: newSub.id,
        conference_id: newSub.conferenceId,
        title: newSub.title,
        project_id: newSub.projectId || null,
        primary_author_id: newSub.primaryAuthorId || null,
        author_ids: newSub.authorIds,
        external_authors: newSub.externalAuthors || '',
        reviewer_ids: newSub.reviewerIds,
        status: newSub.status,
        file_name: newSub.fileName,
        version_label: newSub.versionLabel,
        review_notes: newSub.reviewNotes,
        versions: newSub.versions || [],
        updated_at: newSub.updatedAt,
      });
    }
  };

  const updateSubmission = async (
    subId: string,
    updates: Partial<ConferenceSubmission>
  ) => {
    const target = submissions.find((s) => s.id === subId);
    if (!target) return;
    const updatedAt = new Date().toISOString().slice(0, 10);
    const merged: ConferenceSubmission = { ...target, ...updates, updatedAt };
    if (merged.primaryAuthorId && !merged.authorIds.includes(merged.primaryAuthorId)) {
      merged.authorIds = [merged.primaryAuthorId, ...merged.authorIds];
    }
    setSubmissions((prev) => prev.map((s) => (s.id === subId ? merged : s)));
    if (isSupabaseConfigured && supabase) {
      await supabase
        .from('conference_submissions')
        .update({
          title: merged.title,
          primary_author_id: merged.primaryAuthorId || null,
          author_ids: merged.authorIds,
          external_authors: merged.externalAuthors || '',
          reviewer_ids: merged.reviewerIds,
          status: merged.status,
          file_name: merged.fileName,
          version_label: merged.versionLabel,
          review_notes: merged.reviewNotes,
          versions: merged.versions || [],
          updated_at: updatedAt,
        })
        .eq('id', subId);
    }
  };

  const deleteSubmission = async (subId: string) => {
    setSubmissions((prev) => prev.filter((s) => s.id !== subId));
    if (isSupabaseConfigured && supabase) {
      await supabase.from('conference_submissions').delete().eq('id', subId);
    }
  };

  const addSubmissionVersion = async (
    subId: string,
    version: Omit<SubmissionVersion, 'id' | 'createdAt'>
  ) => {
    const target = submissions.find((s) => s.id === subId);
    if (!target) return;
    const newVer: SubmissionVersion = {
      ...version,
      id: `ver-${Date.now()}`,
      createdAt: new Date().toISOString().slice(0, 10),
    };
    const nextVersions = [...(target.versions || []), newVer];
    await updateSubmission(subId, {
      versions: nextVersions,
      versionLabel: newVer.versionLabel,
      fileName: newVer.fileName || newVer.fileUrl,
    });
  };

  const deleteSubmissionVersion = async (subId: string, versionId: string) => {
    const target = submissions.find((s) => s.id === subId);
    if (!target) return;
    const nextVersions = (target.versions || []).filter((v) => v.id !== versionId);
    await updateSubmission(subId, { versions: nextVersions });
  };

  const updateSubmissionReview = async (
    submissionId: string,
    status: SubmissionStatus,
    reviewNotes: string,
    versionLabel?: string
  ) => {
    await updateSubmission(submissionId, {
      status,
      reviewNotes,
      ...(versionLabel ? { versionLabel } : {}),
    });
  };

  // --- STARTUPS & EDITAIS (CRUD + SEGURANÇA) ---
  const addStartup = async (startup: Omit<LabicStartup, 'id'>) => {
    const newSt: LabicStartup = { ...startup, id: `st-${Date.now()}` };
    setStartups((prev) => [newSt, ...prev]);
    if (isSupabaseConfigured && supabase) {
      await supabase.from('startups').insert({
        id: newSt.id,
        name: newSt.name,
        tagline: newSt.tagline,
        description: newSt.description,
        stage: newSt.stage,
        member_ids: newSt.memberIds,
        show_on_public_showcase: newSt.showOnPublicShowcase,
      });
    }
  };

  const updateStartup = async (startupId: string, updates: Partial<LabicStartup>) => {
    const target = startups.find((s) => s.id === startupId);
    if (!target) return;
    const merged = { ...target, ...updates };
    setStartups((prev) => prev.map((s) => (s.id === startupId ? merged : s)));
    if (isSupabaseConfigured && supabase) {
      await supabase
        .from('startups')
        .update({
          name: merged.name,
          tagline: merged.tagline,
          description: merged.description,
          stage: merged.stage,
          member_ids: merged.memberIds,
          show_on_public_showcase: merged.showOnPublicShowcase,
        })
        .eq('id', startupId);
    }
  };

  const deleteStartup = async (startupId: string) => {
    setStartups((prev) => prev.filter((s) => s.id !== startupId));
    if (isSupabaseConfigured && supabase) {
      await supabase.from('startups').delete().eq('id', startupId);
    }
  };

  const addStartupApplication = async (
    startupId: string,
    app: Omit<StartupApplication, 'id'>
  ) => {
    const ensuredMembers = currentUser
      ? Array.from(new Set([currentUser.id, ...(app.memberIds || [])]))
      : app.memberIds || [];
    const newApp: StartupApplication = {
      ...app,
      memberIds: ensuredMembers,
      id: `app-st-${Date.now()}`,
    };
    setStartups((prev) =>
      prev.map((st) =>
        st.id === startupId
          ? { ...st, applications: [...st.applications, newApp] }
          : st
      )
    );
    if (isSupabaseConfigured && supabase) {
      await supabase.from('startup_applications').insert({
        id: newApp.id,
        startup_id: startupId,
        program_name: newApp.programName,
        year: newApp.year,
        phase_or_status: newApp.phaseOrStatus,
        approved_grant_brl: newApp.approvedGrantBRL || null,
        member_ids: newApp.memberIds,
        milestones: newApp.milestones || [],
        attachments: newApp.attachments || [],
        notes: newApp.notes || '',
      });
    }
  };

  const updateStartupApplication = async (
    startupId: string,
    appId: string,
    updates: Partial<StartupApplication>
  ) => {
    // Regra estrita de segurança: apenas quem já está dentro do edital (ou Admin) pode editar!
    if (!canAccessStartupEdital(startupId, appId)) return;
    const st = startups.find((s) => s.id === startupId);
    const targetApp = st?.applications.find((a) => a.id === appId);
    if (!targetApp) return;
    const merged: StartupApplication = { ...targetApp, ...updates };

    setStartups((prev) =>
      prev.map((s) =>
        s.id === startupId
          ? {
              ...s,
              applications: s.applications.map((a) => (a.id === appId ? merged : a)),
            }
          : s
      )
    );

    if (isSupabaseConfigured && supabase) {
      await supabase
        .from('startup_applications')
        .update({
          program_name: merged.programName,
          year: merged.year,
          phase_or_status: merged.phaseOrStatus,
          approved_grant_brl: merged.approvedGrantBRL || null,
          member_ids: merged.memberIds,
          milestones: merged.milestones || [],
          attachments: merged.attachments || [],
          notes: merged.notes || '',
        })
        .eq('id', appId);
    }
  };

  const deleteStartupApplication = async (startupId: string, appId: string) => {
    if (!canAccessStartupEdital(startupId, appId)) return;
    setStartups((prev) =>
      prev.map((s) =>
        s.id === startupId
          ? { ...s, applications: s.applications.filter((a) => a.id !== appId) }
          : s
      )
    );
    if (isSupabaseConfigured && supabase) {
      await supabase.from('startup_applications').delete().eq('id', appId);
    }
  };

  // --- INSUMOS, 3D, EQUIPAMENTOS, LIMPEZA, MÍDIA, FINANÇAS, REUNIÕES ---
  const addInventoryItem = async (item: Omit<InventoryItem, 'id'>) => {
    const newItem: InventoryItem = { ...item, id: `inv-${Date.now()}` };
    setInventory((prev) => [...prev, newItem]);
    if (isSupabaseConfigured && supabase) {
      await supabase.from('inventory_items').insert({
        id: newItem.id,
        name: newItem.name,
        category: newItem.category,
        quantity_available: newItem.quantityAvailable,
        is_returnable_equipment: newItem.isReturnableEquipment,
        location_bin: newItem.locationBin,
      });
    }
  };

  const updateInventoryItem = async (itemId: string, updates: Partial<InventoryItem>) => {
    const target = inventory.find((i) => i.id === itemId);
    if (!target) return;
    const merged = { ...target, ...updates };
    setInventory((prev) => prev.map((i) => (i.id === itemId ? merged : i)));
    if (isSupabaseConfigured && supabase) {
      await supabase
        .from('inventory_items')
        .update({
          name: merged.name,
          category: merged.category,
          quantity_available: merged.quantityAvailable,
          is_returnable_equipment: merged.isReturnableEquipment,
          location_bin: merged.locationBin,
        })
        .eq('id', itemId);
    }
  };

  const deleteInventoryItem = async (itemId: string) => {
    setInventory((prev) => prev.filter((i) => i.id !== itemId));
    if (isSupabaseConfigured && supabase) {
      await supabase.from('inventory_items').delete().eq('id', itemId);
    }
  };

  const addSupplyRequest = async (
    req: Omit<SupplyRequest, 'id' | 'createdAt' | 'status'>
  ) => {
    const newReq: SupplyRequest = {
      ...req,
      id: `req-sup-${Date.now()}`,
      status: 'PENDENTE',
      createdAt: new Date().toISOString().slice(0, 10),
    };
    setSupplyRequests((prev) => [newReq, ...prev]);
    if (isSupabaseConfigured && supabase) {
      await supabase.from('supply_requests').insert({
        id: newReq.id,
        requester_id: newReq.requesterId,
        project_id: newReq.projectId || null,
        item_name: newReq.itemName,
        quantity: newReq.quantity,
        request_type: newReq.requestType,
        status: newReq.status,
        created_at: newReq.createdAt,
      });
    }
  };

  const updateSupplyRequestStatus = async (
    reqId: string,
    status: SupplyRequest['status'],
    coordinatorResponse: string
  ) => {
    const target = supplyRequests.find((r) => r.id === reqId);
    setSupplyRequests((prev) =>
      prev.map((r) => (r.id === reqId ? { ...r, status, coordinatorResponse } : r))
    );
    if (isSupabaseConfigured && supabase) {
      await supabase
        .from('supply_requests')
        .update({ status, coordinator_response: coordinatorResponse })
        .eq('id', reqId);
    }
    if (target) {
      setNotifications((prev) => [
        {
          id: `notif-${Date.now()}`,
          recipientProfileId: target.requesterId,
          category: 'INSUMO_3D',
          title: `Resposta de Insumo: ${target.itemName}`,
          message: `${status.replace(/_/g, ' ')} — ${coordinatorResponse}`,
          actionHref: '/app/servicos',
          dateLabel: 'Hoje',
          read: false,
        },
        ...prev,
      ]);
    }
  };

  const deleteSupplyRequest = async (reqId: string) => {
    setSupplyRequests((prev) => prev.filter((r) => r.id !== reqId));
    if (isSupabaseConfigured && supabase) {
      await supabase.from('supply_requests').delete().eq('id', reqId);
    }
  };

  const addPrint3DRequest = async (
    req: Omit<Print3DRequest, 'id' | 'createdAt' | 'status'>
  ) => {
    const newReq: Print3DRequest = {
      ...req,
      id: `req-3d-${Date.now()}`,
      status: 'AGUARDANDO_APROVACAO',
      createdAt: new Date().toISOString().slice(0, 10),
    };
    setPrint3DRequests((prev) => [newReq, ...prev]);
    if (isSupabaseConfigured && supabase) {
      await supabase.from('print3d_requests').insert({
        id: newReq.id,
        requester_id: newReq.requesterId,
        project_id: newReq.projectId || null,
        part_name: newReq.partName,
        stl_file_name: newReq.stlFileName,
        material: newReq.material,
        estimated_grams: newReq.estimatedGrams,
        printer_assigned: newReq.printerAssigned,
        status: newReq.status,
        created_at: newReq.createdAt,
      });
    }
  };

  const updatePrint3DStatus = async (
    reqId: string,
    status: Print3DRequest['status']
  ) => {
    setPrint3DRequests((prev) =>
      prev.map((r) => (r.id === reqId ? { ...r, status } : r))
    );
    if (isSupabaseConfigured && supabase) {
      await supabase.from('print3d_requests').update({ status }).eq('id', reqId);
    }
  };

  const deletePrint3DRequest = async (reqId: string) => {
    setPrint3DRequests((prev) => prev.filter((r) => r.id !== reqId));
    if (isSupabaseConfigured && supabase) {
      await supabase.from('print3d_requests').delete().eq('id', reqId);
    }
  };

  const addEquipmentAsset = async (asset: Omit<EquipmentAsset, 'id' | 'updatedAt'>) => {
    const newAsset: EquipmentAsset = {
      ...asset,
      id: `eq-${Date.now()}`,
      updatedAt: new Date().toISOString().slice(0, 10),
    };
    setEquipmentAssets((prev) => [...prev, newAsset]);
    if (isSupabaseConfigured && supabase) {
      await supabase.from('equipment_assets').insert({
        id: newAsset.id,
        code: newAsset.code,
        name: newAsset.name,
        asset_type: newAsset.assetType,
        specs: newAsset.specs,
        status: newAsset.status,
        maintenance_need: newAsset.maintenanceNeed || null,
        updated_at: newAsset.updatedAt,
      });
    }
  };

  const updateEquipmentAsset = async (
    assetId: string,
    updates: Partial<EquipmentAsset>
  ) => {
    const target = equipmentAssets.find((e) => e.id === assetId);
    if (!target) return;
    const updatedAt = new Date().toISOString().slice(0, 10);
    const merged = { ...target, ...updates, updatedAt };
    setEquipmentAssets((prev) => prev.map((e) => (e.id === assetId ? merged : e)));
    if (isSupabaseConfigured && supabase) {
      await supabase
        .from('equipment_assets')
        .update({
          code: merged.code,
          name: merged.name,
          specs: merged.specs,
          status: merged.status,
          maintenance_need: merged.maintenanceNeed || null,
          updated_at: updatedAt,
        })
        .eq('id', assetId);
    }
  };

  const deleteEquipmentAsset = async (assetId: string) => {
    setEquipmentAssets((prev) => prev.filter((e) => e.id !== assetId));
    if (isSupabaseConfigured && supabase) {
      await supabase.from('equipment_assets').delete().eq('id', assetId);
    }
  };

  const updateEquipmentStatus = async (
    assetId: string,
    status: EquipmentAsset['status'],
    maintenanceNeed?: string
  ) => {
    await updateEquipmentAsset(assetId, { status, maintenanceNeed });
  };

  const addCleaningTask = async (task: Omit<CleaningTaskRow, 'id'>) => {
    const newTask: CleaningTaskRow = { ...task, id: `clean-${Date.now()}` };
    setCleaningTasks((prev) => [...prev, newTask]);
    if (isSupabaseConfigured && supabase) {
      await supabase.from('cleaning_tasks').insert({
        id: newTask.id,
        task_title: newTask.taskTitle,
        days_of_week: newTask.daysOfWeek,
        assigned_member_ids: newTask.assignedMemberIds,
        notes: newTask.notes,
      });
    }
  };

  const updateCleaningTask = async (
    taskId: string,
    updates: Partial<CleaningTaskRow>
  ) => {
    const target = cleaningTasks.find((t) => t.id === taskId);
    if (!target) return;
    const merged = { ...target, ...updates };
    setCleaningTasks((prev) => prev.map((t) => (t.id === taskId ? merged : t)));
    if (isSupabaseConfigured && supabase) {
      await supabase
        .from('cleaning_tasks')
        .update({
          task_title: merged.taskTitle,
          days_of_week: merged.daysOfWeek,
          assigned_member_ids: merged.assignedMemberIds,
          notes: merged.notes,
        })
        .eq('id', taskId);
    }
  };

  const deleteCleaningTask = async (taskId: string) => {
    setCleaningTasks((prev) => prev.filter((t) => t.id !== taskId));
    if (isSupabaseConfigured && supabase) {
      await supabase.from('cleaning_tasks').delete().eq('id', taskId);
    }
  };

  const randomizeMediaSchedule = async (
    eligibleMemberIds: string[],
    monthLabel: string
  ) => {
    if (eligibleMemberIds.length === 0) return;
    const shuffled = [...eligibleMemberIds].sort(() => Math.random() - 0.5);
    const now = new Date();
    const yearMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
    const days = ['07', '14', '21', '28'];

    const newSlots: MediaScheduleSlot[] = days.map((day, idx) => {
      const assignedId = shuffled[idx % shuffled.length];
      return {
        id: `med-${Date.now()}-${idx}`,
        monthLabel,
        scheduledDate: `${yearMonth}-${day}`,
        assignedProfileId: assignedId,
        topicSuggestion: 'Publicação Institucional / Pesquisa LABIC',
        status: 'AGENDADO',
      };
    });

    setMediaSlots(newSlots);

    if (isSupabaseConfigured && supabase) {
      for (const s of newSlots) {
        await supabase.from('media_schedule_slots').insert({
          id: s.id,
          month_label: s.monthLabel,
          scheduled_date: s.scheduledDate,
          assigned_profile_id: s.assignedProfileId,
          topic_suggestion: s.topicSuggestion,
          status: s.status,
        });
      }
    }

    const newNotifs: LabicNotification[] = newSlots.map((slot, idx) => ({
      id: `notif-med-${Date.now()}-${idx}`,
      recipientProfileId: slot.assignedProfileId,
      category: 'MIDIA',
      title: `Postagem de Mídia agendada para ${slot.scheduledDate.split('-').reverse().join('/')}`,
      message: `Você foi escalado em ${monthLabel} para publicar no dia ${slot.scheduledDate.split('-').reverse().join('/')}.`,
      actionHref: '/app/servicos',
      dateLabel: slot.monthLabel,
      read: false,
    }));

    setNotifications((prev) => [...newNotifs, ...prev]);
  };

  const deleteMediaSlot = async (slotId: string) => {
    setMediaSlots((prev) => prev.filter((s) => s.id !== slotId));
    if (isSupabaseConfigured && supabase) {
      await supabase.from('media_schedule_slots').delete().eq('id', slotId);
    }
  };

  const addFinanceBox = async (box: Omit<FinanceBox, 'id'>) => {
    if (!canSeeFinances()) return;
    const newBox: FinanceBox = { ...box, id: `box-${Date.now()}` };
    setFinanceBoxes((prev) => [...prev, newBox]);
    if (isSupabaseConfigured && supabase) {
      await supabase.from('finance_boxes').insert({
        id: newBox.id,
        name: newBox.name,
        purpose: newBox.purpose,
        target_amount_brl: newBox.targetAmountBRL || null,
        current_balance_brl: newBox.currentBalanceBRL,
      });
    }
  };

  const updateFinanceBox = async (boxId: string, updates: Partial<FinanceBox>) => {
    if (!canSeeFinances()) return;
    const target = financeBoxes.find((b) => b.id === boxId);
    if (!target) return;
    const merged = { ...target, ...updates };
    setFinanceBoxes((prev) => prev.map((b) => (b.id === boxId ? merged : b)));
    if (isSupabaseConfigured && supabase) {
      await supabase
        .from('finance_boxes')
        .update({
          name: merged.name,
          purpose: merged.purpose,
          target_amount_brl: merged.targetAmountBRL || null,
          current_balance_brl: merged.currentBalanceBRL,
        })
        .eq('id', boxId);
    }
  };

  const deleteFinanceBox = async (boxId: string) => {
    if (!canSeeFinances()) return;
    setFinanceBoxes((prev) => prev.filter((b) => b.id !== boxId));
    if (isSupabaseConfigured && supabase) {
      await supabase.from('finance_boxes').delete().eq('id', boxId);
    }
  };

  const addFinanceTransaction = async (tx: Omit<FinanceTransaction, 'id' | 'txDate'>) => {
    if (!canSeeFinances()) return;
    const newTx: FinanceTransaction = {
      ...tx,
      id: `tx-${Date.now()}`,
      txDate: new Date().toISOString().slice(0, 10),
    };
    setFinanceTransactions((prev) => [newTx, ...prev]);

    const targetBox = financeBoxes.find((b) => b.id === tx.boxId);
    const delta = tx.txType === 'ENTRADA' ? tx.amountBRL : -tx.amountBRL;
    const nextBalance = targetBox ? targetBox.currentBalanceBRL + delta : delta;

    setFinanceBoxes((prev) =>
      prev.map((b) =>
        b.id === tx.boxId ? { ...b, currentBalanceBRL: nextBalance } : b
      )
    );

    if (isSupabaseConfigured && supabase) {
      await supabase.from('finance_transactions').insert({
        id: newTx.id,
        box_id: newTx.boxId,
        description: newTx.description,
        tx_type: newTx.txType,
        amount_brl: newTx.amountBRL,
        tx_date: newTx.txDate,
        created_by: newTx.createdByProfileId,
      });
      await supabase
        .from('finance_boxes')
        .update({ current_balance_brl: nextBalance })
        .eq('id', tx.boxId);
    }
  };

  const deleteFinanceTransaction = async (txId: string) => {
    if (!canSeeFinances()) return;
    const target = financeTransactions.find((t) => t.id === txId);
    if (!target) return;
    setFinanceTransactions((prev) => prev.filter((t) => t.id !== txId));

    const box = financeBoxes.find((b) => b.id === target.boxId);
    if (box) {
      const revertDelta = target.txType === 'ENTRADA' ? -target.amountBRL : target.amountBRL;
      const nextBalance = box.currentBalanceBRL + revertDelta;
      setFinanceBoxes((prev) =>
        prev.map((b) =>
          b.id === box.id ? { ...b, currentBalanceBRL: nextBalance } : b
        )
      );
      if (isSupabaseConfigured && supabase) {
        await supabase
          .from('finance_boxes')
          .update({ current_balance_brl: nextBalance })
          .eq('id', box.id);
      }
    }

    if (isSupabaseConfigured && supabase) {
      await supabase.from('finance_transactions').delete().eq('id', txId);
    }
  };

  const addMeeting = async (meeting: Omit<LabicMeeting, 'id'>) => {
    const newMeeting: LabicMeeting = {
      ...meeting,
      id: `meet-${Date.now()}`,
    };
    setMeetings((prev) => [newMeeting, ...prev]);
    if (isSupabaseConfigured && supabase) {
      const isoVal =
        newMeeting.meetingDate && newMeeting.meetingTime
          ? `${newMeeting.meetingDate}T${newMeeting.meetingTime}:00Z`
          : new Date().toISOString();
      await supabase.from('meetings').insert({
        id: newMeeting.id,
        title: newMeeting.title,
        meeting_type: newMeeting.meetingType,
        scheduled_at: isoVal,
        meeting_date: newMeeting.meetingDate,
        meeting_time: newMeeting.meetingTime,
        minutes_notes: newMeeting.minutesNotes || '',
        location_or_link: newMeeting.locationOrLink,
        organizer_id: newMeeting.organizerId,
        participant_ids: newMeeting.participantIds,
      });
    }

    const newNotifs: LabicNotification[] = meeting.participantIds.map((pid, i) => ({
      id: `notif-meet-${Date.now()}-${i}`,
      recipientProfileId: pid,
      category: 'REUNIAO',
      title: `Reunião: ${meeting.title}`,
      message: `Data: ${meeting.scheduledAt} (${meeting.locationOrLink}).`,
      actionHref: '/app/reunioes',
      dateLabel: meeting.meetingDate || 'Agendada',
      read: false,
    }));
    setNotifications((prev) => [...newNotifs, ...prev]);
  };

  const updateMeeting = async (
    meetingId: string,
    updates: Partial<LabicMeeting>
  ) => {
    const target = meetings.find((m) => m.id === meetingId);
    if (!target) return;
    const merged = { ...target, ...updates };
    setMeetings((prev) => prev.map((m) => (m.id === meetingId ? merged : m)));
    if (isSupabaseConfigured && supabase) {
      await supabase
        .from('meetings')
        .update({
          title: merged.title,
          meeting_type: merged.meetingType,
          meeting_date: merged.meetingDate,
          meeting_time: merged.meetingTime,
          minutes_notes: merged.minutesNotes || '',
          location_or_link: merged.locationOrLink,
          participant_ids: merged.participantIds,
        })
        .eq('id', meetingId);
    }
  };

  const deleteMeeting = async (meetingId: string) => {
    setMeetings((prev) => prev.filter((m) => m.id !== meetingId));
    if (isSupabaseConfigured && supabase) {
      await supabase.from('meetings').delete().eq('id', meetingId);
    }
  };

  const markNotificationRead = (notifId: string) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === notifId ? { ...n, read: true } : n))
    );
  };

  return (
    <LabicContext.Provider
      value={{
        currentUser,
        isAuthenticated,
        isLoading,
        login,
        logout,
        refreshData,
        uploadFileToStorage,
        members,
        projects,
        productions,
        conferences,
        submissions,
        startups,
        inventory,
        supplyRequests,
        print3DRequests,
        equipmentAssets,
        cleaningTasks,
        mediaSlots,
        financeBoxes,
        financeTransactions,
        meetings,
        generalDocuments,
        notifications,
        isAdmin,
        hasCoordination,
        canSeeFinances,
        canSeeScholarshipValue,
        canAccessProject,
        canAccessStartupEdital,
        updateMemberProfile,
        updateMemberAccount,
        deleteMember,
        addAcademicStep,
        updateAcademicStep,
        removeAcademicStep,
        addMember,
        toggleMemberCoordination,
        toggleMemberStatus,
        addProduction,
        updateProduction,
        deleteProduction,
        addProject,
        updateProject,
        deleteProject,
        updateProjectNotes,
        addProjectDeliverable,
        updateProjectDeliverable,
        deleteProjectDeliverable,
        submitDeliverable,
        toggleProjectPublicShowcase,
        addGeneralDocument,
        updateGeneralDocument,
        deleteGeneralDocument,
        addConference,
        updateConference,
        deleteConference,
        addSubmission,
        updateSubmission,
        deleteSubmission,
        addSubmissionVersion,
        deleteSubmissionVersion,
        updateSubmissionReview,
        addStartup,
        updateStartup,
        deleteStartup,
        addStartupApplication,
        updateStartupApplication,
        deleteStartupApplication,
        addInventoryItem,
        updateInventoryItem,
        deleteInventoryItem,
        addSupplyRequest,
        updateSupplyRequestStatus,
        deleteSupplyRequest,
        addPrint3DRequest,
        updatePrint3DStatus,
        deletePrint3DRequest,
        addEquipmentAsset,
        updateEquipmentAsset,
        deleteEquipmentAsset,
        updateEquipmentStatus,
        addCleaningTask,
        updateCleaningTask,
        deleteCleaningTask,
        randomizeMediaSchedule,
        deleteMediaSlot,
        addFinanceBox,
        updateFinanceBox,
        deleteFinanceBox,
        addFinanceTransaction,
        deleteFinanceTransaction,
        addMeeting,
        updateMeeting,
        deleteMeeting,
        markNotificationRead,
      }}
    >
      {children}
    </LabicContext.Provider>
  );
}

export function useLabic() {
  const ctx = useContext(LabicContext);
  if (!ctx) {
    throw new Error('useLabic deve ser usado dentro de um LabicProvider');
  }
  return ctx;
}
