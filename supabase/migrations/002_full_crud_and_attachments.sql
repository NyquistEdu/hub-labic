-- =============================================================================
-- HUB-LABIC — Migration 002: Múltiplos Anexos, Versões de Congressos,
-- Metas de Editais, Foto de Perfil, Notas de Projetos e Políticas de Storage
-- =============================================================================

ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS password text DEFAULT 'labic123',
  ADD COLUMN IF NOT EXISTS course text DEFAULT '',
  ADD COLUMN IF NOT EXISTS institution text DEFAULT 'IFS - Campus Lagarto',
  ADD COLUMN IF NOT EXISTS degree_level text DEFAULT 'Graduação',
  ADD COLUMN IF NOT EXISTS avatar_url text;

ALTER TABLE public.academic_trajectories
  ADD COLUMN IF NOT EXISTS city text DEFAULT 'Lagarto';

ALTER TABLE public.productions
  ADD COLUMN IF NOT EXISTS primary_author_id uuid REFERENCES public.profiles(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS attachments jsonb NOT NULL DEFAULT '[]'::jsonb;

ALTER TABLE public.projects
  ADD COLUMN IF NOT EXISTS year int DEFAULT 2026,
  ADD COLUMN IF NOT EXISTS notes text DEFAULT '';

ALTER TABLE public.project_deliverables
  ADD COLUMN IF NOT EXISTS description text DEFAULT '',
  ADD COLUMN IF NOT EXISTS attachments jsonb NOT NULL DEFAULT '[]'::jsonb;

ALTER TABLE public.conferences
  ADD COLUMN IF NOT EXISTS milestones jsonb NOT NULL DEFAULT '[]'::jsonb;

ALTER TABLE public.conference_submissions
  ADD COLUMN IF NOT EXISTS primary_author_id uuid REFERENCES public.profiles(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS versions jsonb NOT NULL DEFAULT '[]'::jsonb;

ALTER TABLE public.startup_applications
  ADD COLUMN IF NOT EXISTS member_ids text[] NOT NULL DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS milestones jsonb NOT NULL DEFAULT '[]'::jsonb,
  ADD COLUMN IF NOT EXISTS attachments jsonb NOT NULL DEFAULT '[]'::jsonb,
  ADD COLUMN IF NOT EXISTS notes text DEFAULT '';

ALTER TABLE public.general_documents
  ADD COLUMN IF NOT EXISTS attachments jsonb NOT NULL DEFAULT '[]'::jsonb;

ALTER TABLE public.meetings
  ADD COLUMN IF NOT EXISTS meeting_date text DEFAULT '',
  ADD COLUMN IF NOT EXISTS meeting_time text DEFAULT '',
  ADD COLUMN IF NOT EXISTS minutes_notes text DEFAULT '',
  ALTER COLUMN scheduled_at TYPE text USING scheduled_at::text;

ALTER TABLE public.productions
  ADD COLUMN IF NOT EXISTS external_authors text DEFAULT '';

ALTER TABLE public.conference_submissions
  ADD COLUMN IF NOT EXISTS external_authors text DEFAULT '';

ALTER TABLE public.project_scholarships_private
  ADD COLUMN IF NOT EXISTS start_month text DEFAULT '',
  ADD COLUMN IF NOT EXISTS end_month text DEFAULT '',
  ADD COLUMN IF NOT EXISTS installments int DEFAULT 12;

ALTER TABLE public.conferences
  ALTER COLUMN internal_review_deadline TYPE text USING COALESCE(internal_review_deadline::text, ''),
  ALTER COLUMN official_submission_deadline TYPE text USING COALESCE(official_submission_deadline::text, ''),
  ALTER COLUMN event_date TYPE text USING COALESCE(event_date::text, '');

ALTER TABLE public.project_deliverables
  ALTER COLUMN due_date TYPE text USING COALESCE(due_date::text, '');

ALTER TABLE public.projects
  ALTER COLUMN start_date TYPE text USING COALESCE(start_date::text, ''),
  ALTER COLUMN end_date TYPE text USING COALESCE(end_date::text, '');

ALTER TABLE public.media_schedule_slots
  ALTER COLUMN scheduled_date TYPE text USING COALESCE(scheduled_date::text, '');

-- Garantir que os buckets de Storage sejam públicos e permitam upload/leitura
UPDATE storage.buckets
SET public = true
WHERE id IN ('artigos-congressos', 'relatorios-projetos', 'impressao-3d-stl', 'documentos-labic');

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'storage' AND tablename = 'objects' AND policyname = 'labic_storage_all'
  ) THEN
    CREATE POLICY labic_storage_all ON storage.objects
      FOR ALL TO anon, authenticated
      USING (true)
      WITH CHECK (true);
  END IF;
END $$;

-- Permitir autor principal externo não cadastrado no sistema
ALTER TABLE public.productions ADD COLUMN IF NOT EXISTS primary_author_external text DEFAULT '';
ALTER TABLE public.conference_submissions ADD COLUMN IF NOT EXISTS primary_author_external text DEFAULT '';


