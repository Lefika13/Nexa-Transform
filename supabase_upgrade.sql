-- ==============================================================================
-- NexaTransform Hub LMIS — Production Scale Database & Storage Upgrade
-- Run this in your Supabase SQL Editor:
-- https://supabase.com/dashboard/project/bwygpjlzoefhfixtyxdg/sql
-- ==============================================================================

-- 1. Enhance System Lecturers Table for Statutory Faculty Profile
ALTER TABLE public.system_lecturers ADD COLUMN IF NOT EXISTS staff_number text;
ALTER TABLE public.system_lecturers ADD COLUMN IF NOT EXISTS id_passport text;
ALTER TABLE public.system_lecturers ADD COLUMN IF NOT EXISTS gender text;
ALTER TABLE public.system_lecturers ADD COLUMN IF NOT EXISTS date_of_birth text;
ALTER TABLE public.system_lecturers ADD COLUMN IF NOT EXISTS highest_qualification text;
ALTER TABLE public.system_lecturers ADD COLUMN IF NOT EXISTS qualification_title text;
ALTER TABLE public.system_lecturers ADD COLUMN IF NOT EXISTS institution_obtained text;
ALTER TABLE public.system_lecturers ADD COLUMN IF NOT EXISTS graduation_year text;
ALTER TABLE public.system_lecturers ADD COLUMN IF NOT EXISTS academic_role text;
ALTER TABLE public.system_lecturers ADD COLUMN IF NOT EXISTS years_experience text;
ALTER TABLE public.system_lecturers ADD COLUMN IF NOT EXISTS subject_expertise text;
ALTER TABLE public.system_lecturers ADD COLUMN IF NOT EXISTS id_copy_attachments jsonb DEFAULT '[]'::jsonb;
ALTER TABLE public.system_lecturers ADD COLUMN IF NOT EXISTS qualification_proof_attachments jsonb DEFAULT '[]'::jsonb;
ALTER TABLE public.system_lecturers ADD COLUMN IF NOT EXISTS cv_attachments jsonb DEFAULT '[]'::jsonb;
ALTER TABLE public.system_lecturers ADD COLUMN IF NOT EXISTS bank_proof_attachments jsonb DEFAULT '[]'::jsonb;
ALTER TABLE public.system_lecturers ADD COLUMN IF NOT EXISTS status text DEFAULT 'Active';

-- 2. Create Modules & Library Resources Tables
CREATE TABLE IF NOT EXISTS public.modules (
  id text PRIMARY KEY,
  title text,
  code text,
  course_code text,
  description text,
  order_index int DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.library_resources (
  id text PRIMARY KEY,
  title text,
  type text,
  course_code text,
  description text,
  file_url text,
  created_at timestamptz DEFAULT now()
);

-- Enhanced study material metadata columns (run in Supabase SQL Editor if desired)
ALTER TABLE public.library_resources ADD COLUMN IF NOT EXISTS unit_or_week text;
ALTER TABLE public.library_resources ADD COLUMN IF NOT EXISTS estimated_minutes int;
ALTER TABLE public.library_resources ADD COLUMN IF NOT EXISTS release_date text;
ALTER TABLE public.library_resources ADD COLUMN IF NOT EXISTS lecturer_name text;
ALTER TABLE public.library_resources ADD COLUMN IF NOT EXISTS lecturer_email text;
ALTER TABLE public.library_resources ADD COLUMN IF NOT EXISTS attachments jsonb DEFAULT '[]'::jsonb;
ALTER TABLE public.library_resources ADD COLUMN IF NOT EXISTS video_url text;


-- 3. Explicitly Disable RLS for Zero-Friction Multi-Device Sync (Admin, Lecturer, Learner)
ALTER TABLE public.student_profiles DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.courses DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.enrollments DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.assignments DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.submissions DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.attendance DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.announcements DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.messages DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.system_lecturers DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.system_admins DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_logs DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.fees DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.certificates DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.quizzes DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.quiz_attempts DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.modules DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.library_resources DISABLE ROW LEVEL SECURITY;

-- 4. Provision Cloud Storage Buckets
INSERT INTO storage.buckets (id, name, public) 
VALUES ('student-documents', 'student-documents', true) 
ON CONFLICT (id) DO NOTHING;

INSERT INTO storage.buckets (id, name, public) 
VALUES ('lecturer-documents', 'lecturer-documents', true) 
ON CONFLICT (id) DO NOTHING;

-- 5. Enable Public Access on Storage Objects for Document Previews & Downloads
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname = 'storage' AND tablename = 'objects' AND policyname = 'Public Access for LMIS Documents'
  ) THEN
    CREATE POLICY "Public Access for LMIS Documents" ON storage.objects FOR ALL USING (true) WITH CHECK (true);
  END IF;
END $$;

-- 6. Grant Full API Permissions
GRANT ALL ON ALL TABLES IN SCHEMA public TO anon, authenticated, service_role;
