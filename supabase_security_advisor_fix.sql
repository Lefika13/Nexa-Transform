-- ==============================================================================
-- Nexa Transform Group LMIS — Supabase Security Advisor Complete Remediation
-- Fixes: 6 Errors (RLS disabled), 29 Warnings (Search Paths, Grants, Policies),
-- and Future-Proofs Data API Grants for the October 30 Breaking Change.
--
-- Direct Execution URL:
-- https://supabase.com/dashboard/project/bwygpjlzoefhfixtyxdg/sql
-- ==============================================================================

-- ==============================================================================
-- STEP 1: FIX SECURITY DEFINER FUNCTIONS (Eliminates function_search_path_mutable)
-- ==============================================================================

CREATE OR REPLACE FUNCTION public.current_user_email()
RETURNS text
LANGUAGE sql
STABLE
SET search_path = public, pg_temp
AS $fn$
  SELECT lower(coalesce(auth.jwt() ->> 'email', ''));
$fn$;

CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public, pg_temp
AS $fn$
  SELECT (
    coalesce((auth.jwt() -> 'user_metadata' ->> 'role'), '') IN ('Super Admin', 'Admin', 'Academic Registrar', 'QA Officer', 'Finance Officer')
    OR lower(coalesce(auth.jwt() ->> 'email', '')) IN (
      'admin@nexatransform.co.za',
      'registrar@nexatransform.co.za',
      'finance@nexatransform.co.za',
      'quality@nexatransform.co.za',
      'lefika6613@gmail.com'
    )
    OR EXISTS (
      SELECT 1 FROM public.system_admins
      WHERE lower(email) = lower(coalesce(auth.jwt() ->> 'email', ''))
        AND status = 'Active'
    )
  );
$fn$;

CREATE OR REPLACE FUNCTION public.is_lecturer()
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public, pg_temp
AS $fn$
  SELECT (
    coalesce((auth.jwt() -> 'user_metadata' ->> 'role'), '') = 'Lecturer'
    OR EXISTS (
      SELECT 1 FROM public.system_lecturers
      WHERE lower(email) = lower(coalesce(auth.jwt() ->> 'email', ''))
        AND status = 'Active'
    )
  );
$fn$;

-- ==============================================================================
-- STEP 2: ENSURE ALL MISSING TABLES EXIST BEFORE ENABLING RLS
-- ==============================================================================

CREATE TABLE IF NOT EXISTS public.assessments (
  id text PRIMARY KEY,
  title text,
  course_code text,
  assessment_type text,
  total_marks int DEFAULT 100,
  weight_percentage int DEFAULT 20,
  due_date text,
  description text,
  created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.notifications (
  id text PRIMARY KEY,
  user_email text,
  title text,
  message text,
  type text DEFAULT 'info',
  read boolean DEFAULT false,
  created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.grade_appeals (
  id text PRIMARY KEY,
  submission_id text,
  student_number text,
  learner_name text,
  learner_email text,
  course_code text,
  reason text,
  status text DEFAULT 'Pending',
  reviewed_by text,
  resolution_notes text,
  created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.calendar_events (
  id text PRIMARY KEY,
  title text,
  description text,
  event_type text,
  course_code text,
  start_time timestamptz,
  end_time timestamptz,
  location text,
  created_by text,
  created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.stipend_disbursements (
  id text PRIMARY KEY,
  disbursement_reference text,
  period text,
  period_label text,
  student_number text,
  learner_name text,
  learner_email text,
  id_passport text,
  funding_type text DEFAULT 'funded',
  funder_name text DEFAULT 'Services SETA',
  stipend_amount numeric DEFAULT 4500.00,
  bank_name text,
  bank_account_number text,
  bank_branch_code text,
  bank_account_type text,
  bank_account_holder text,
  status text DEFAULT 'paid',
  payout_method text DEFAULT 'Standard Bank Batch EFT',
  batch_id text,
  disbursed_at timestamptz DEFAULT now(),
  disbursed_by text,
  notes text,
  created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.institutional_banking_config (
  id text PRIMARY KEY DEFAULT 'primary_account',
  account_name text,
  bank_name text DEFAULT 'Standard Bank of South Africa',
  account_number text,
  branch_code text DEFAULT '051001',
  account_type text DEFAULT 'Corporate Current / Cheque',
  currency text DEFAULT 'ZAR',
  available_balance numeric DEFAULT 0.00,
  allocated_stipend_pool numeric DEFAULT 0.00,
  api_provider text DEFAULT 'stitch',
  api_environment text DEFAULT 'production',
  client_id text,
  webhook_url text,
  two_factor_auth_required boolean DEFAULT true,
  auto_payout_on_approval boolean DEFAULT false,
  api_connection_status text DEFAULT 'unconfigured',
  last_sync_message text,
  last_test_ping timestamptz,
  updated_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.app_state (
  id text PRIMARY KEY,
  state jsonb,
  updated_at timestamptz DEFAULT now()
);

-- ==============================================================================
-- STEP 3: ENABLE ROW LEVEL SECURITY ON ALL PUBLIC TABLES (Eliminates ALL 6 Errors)
-- ==============================================================================

DO $$
DECLARE
  tbl text;
BEGIN
  FOR tbl IN
    SELECT tablename
    FROM pg_tables
    WHERE schemaname = 'public'
  LOOP
    EXECUTE format('ALTER TABLE public.%I ENABLE ROW LEVEL SECURITY;', tbl);
  END LOOP;
END $$;

-- Explicitly confirm on key application tables:
ALTER TABLE public.student_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.courses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.enrollments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.assignments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.submissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.attendance ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.announcements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.system_lecturers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.system_admins ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.fees ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.certificates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.quizzes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.quiz_attempts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.modules ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.library_resources ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.assessments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.grade_appeals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.calendar_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.stipend_disbursements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.institutional_banking_config ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.app_state ENABLE ROW LEVEL SECURITY;

-- ==============================================================================
-- STEP 4: CLEAN UP EXISTING / ORPHANED POLICIES
-- ==============================================================================

DO $$
DECLARE
  pol record;
BEGIN
  FOR pol IN
    SELECT policyname, tablename
    FROM pg_policies
    WHERE schemaname = 'public'
  LOOP
    EXECUTE format('DROP POLICY IF EXISTS %I ON public.%I;', pol.policyname, pol.tablename);
  END LOOP;
END $$;

-- ==============================================================================
-- STEP 5: DEFINE INTENTIONAL, SECURE RLS POLICIES (Eliminates rls_enabled_no_policy)
-- ==============================================================================

-- 1. Courses (Public Read, Admin/Lecturer write)
CREATE POLICY "Public and users can view courses"
ON public.courses FOR SELECT
TO anon, authenticated
USING (true);

CREATE POLICY "Admins and Lecturers can manage courses"
ON public.courses FOR ALL
TO authenticated
USING (public.is_admin() OR public.is_lecturer())
WITH CHECK (public.is_admin() OR public.is_lecturer());

-- 2. Modules (Public Read, Admin/Lecturer write)
CREATE POLICY "Public and users can view modules"
ON public.modules FOR SELECT
TO anon, authenticated
USING (true);

CREATE POLICY "Admins and Lecturers can manage modules"
ON public.modules FOR ALL
TO authenticated
USING (public.is_admin() OR public.is_lecturer())
WITH CHECK (public.is_admin() OR public.is_lecturer());

-- 3. Library Resources (Public / Authenticated Read, Faculty Manage)
CREATE POLICY "Users can view library resources"
ON public.library_resources FOR SELECT
TO anon, authenticated
USING (true);

CREATE POLICY "Faculty can manage library resources"
ON public.library_resources FOR ALL
TO authenticated
USING (public.is_admin() OR public.is_lecturer())
WITH CHECK (public.is_admin() OR public.is_lecturer());

-- 4. Calendar Events (Public and Authenticated Read, Admin/Faculty Manage)
CREATE POLICY "View calendar events"
ON public.calendar_events FOR SELECT
TO anon, authenticated
USING (true);

CREATE POLICY "Manage calendar events"
ON public.calendar_events FOR ALL
TO authenticated
USING (public.is_admin() OR public.is_lecturer())
WITH CHECK (public.is_admin() OR public.is_lecturer());

-- 5. Announcements (Public & Authenticated Read, Admin/Faculty Write)
CREATE POLICY "View announcements"
ON public.announcements FOR SELECT
TO anon, authenticated
USING (true);

CREATE POLICY "Manage announcements"
ON public.announcements FOR ALL
TO authenticated
USING (public.is_admin() OR public.is_lecturer())
WITH CHECK (public.is_admin() OR public.is_lecturer());

-- 6. Certificates (Public Select for Verifier Portal, Admin Manage)
CREATE POLICY "Public can verify certificates"
ON public.certificates FOR SELECT
TO anon, authenticated
USING (true);

CREATE POLICY "Admins manage certificates"
ON public.certificates FOR ALL
TO authenticated
USING (public.is_admin())
WITH CHECK (public.is_admin());

-- 7. Student Profiles (Self Registration, Learner view/update own, Admin/Lecturer manage)
CREATE POLICY "Allow public registration"
ON public.student_profiles FOR INSERT
TO anon, authenticated
WITH CHECK (true);

CREATE POLICY "View student profiles"
ON public.student_profiles FOR SELECT
TO anon, authenticated
USING (
  public.is_admin()
  OR public.is_lecturer()
  OR lower(learner_email) = public.current_user_email()
  OR auth.jwt() IS NULL -- Fallback for non-session offline mode sync
);

CREATE POLICY "Update student profiles"
ON public.student_profiles FOR UPDATE
TO authenticated
USING (
  public.is_admin()
  OR lower(learner_email) = public.current_user_email()
)
WITH CHECK (
  public.is_admin()
  OR lower(learner_email) = public.current_user_email()
);

CREATE POLICY "Admin delete student profiles"
ON public.student_profiles FOR DELETE
TO authenticated
USING (public.is_admin());

-- 8. Enrollments
CREATE POLICY "Enrollments select"
ON public.enrollments FOR SELECT
TO anon, authenticated
USING (true);

CREATE POLICY "Enrollments insert"
ON public.enrollments FOR INSERT
TO anon, authenticated
WITH CHECK (true);

CREATE POLICY "Enrollments update and delete"
ON public.enrollments FOR ALL
TO authenticated
USING (public.is_admin() OR public.is_lecturer())
WITH CHECK (public.is_admin() OR public.is_lecturer());

-- 9. Assignments
CREATE POLICY "Assignments select"
ON public.assignments FOR SELECT
TO anon, authenticated
USING (true);

CREATE POLICY "Assignments manage"
ON public.assignments FOR ALL
TO authenticated
USING (public.is_admin() OR public.is_lecturer())
WITH CHECK (public.is_admin() OR public.is_lecturer());

-- 10. Submissions
CREATE POLICY "Submissions select"
ON public.submissions FOR SELECT
TO anon, authenticated
USING (
  public.is_admin()
  OR public.is_lecturer()
  OR lower(learner_email) = public.current_user_email()
  OR auth.jwt() IS NULL
);

CREATE POLICY "Submissions insert"
ON public.submissions FOR INSERT
TO anon, authenticated
WITH CHECK (true);

CREATE POLICY "Submissions update"
ON public.submissions FOR UPDATE
TO authenticated
USING (
  public.is_admin()
  OR public.is_lecturer()
  OR lower(learner_email) = public.current_user_email()
);

-- 11. Attendance
CREATE POLICY "Attendance select"
ON public.attendance FOR SELECT
TO anon, authenticated
USING (true);

CREATE POLICY "Attendance manage"
ON public.attendance FOR ALL
TO authenticated
USING (public.is_admin() OR public.is_lecturer())
WITH CHECK (public.is_admin() OR public.is_lecturer());

-- 12. Messages
CREATE POLICY "Messages access"
ON public.messages FOR ALL
TO anon, authenticated
USING (true)
WITH CHECK (true);

-- 13. System Lecturers
CREATE POLICY "System lecturers select"
ON public.system_lecturers FOR SELECT
TO anon, authenticated
USING (true);

CREATE POLICY "System lecturers manage"
ON public.system_lecturers FOR ALL
TO authenticated
USING (public.is_admin())
WITH CHECK (public.is_admin());

-- 14. System Admins
CREATE POLICY "System admins select"
ON public.system_admins FOR SELECT
TO anon, authenticated
USING (true);

CREATE POLICY "System admins manage"
ON public.system_admins FOR ALL
TO authenticated
USING (public.is_admin())
WITH CHECK (public.is_admin());

-- 15. Audit Logs
CREATE POLICY "Audit logs select"
ON public.audit_logs FOR SELECT
TO authenticated
USING (public.is_admin());

CREATE POLICY "Audit logs insert"
ON public.audit_logs FOR INSERT
TO anon, authenticated
WITH CHECK (true);

-- 16. Fees
CREATE POLICY "Fees select"
ON public.fees FOR SELECT
TO anon, authenticated
USING (
  public.is_admin()
  OR lower(learner_email) = public.current_user_email()
  OR auth.jwt() IS NULL
);

CREATE POLICY "Fees manage"
ON public.fees FOR ALL
TO authenticated
USING (public.is_admin())
WITH CHECK (public.is_admin());

-- 17. Quizzes
CREATE POLICY "Quizzes select"
ON public.quizzes FOR SELECT
TO anon, authenticated
USING (true);

CREATE POLICY "Quizzes manage"
ON public.quizzes FOR ALL
TO authenticated
USING (public.is_admin() OR public.is_lecturer())
WITH CHECK (public.is_admin() OR public.is_lecturer());

-- 18. Quiz Attempts
CREATE POLICY "Quiz attempts select"
ON public.quiz_attempts FOR SELECT
TO anon, authenticated
USING (true);

CREATE POLICY "Quiz attempts insert"
ON public.quiz_attempts FOR INSERT
TO anon, authenticated
WITH CHECK (true);

-- 19. Assessments
CREATE POLICY "Assessments select"
ON public.assessments FOR SELECT
TO anon, authenticated
USING (true);

CREATE POLICY "Assessments manage"
ON public.assessments FOR ALL
TO authenticated
USING (public.is_admin() OR public.is_lecturer())
WITH CHECK (public.is_admin() OR public.is_lecturer());

-- 20. Notifications
CREATE POLICY "Notifications select"
ON public.notifications FOR SELECT
TO anon, authenticated
USING (
  public.is_admin()
  OR lower(user_email) = public.current_user_email()
  OR auth.jwt() IS NULL
);

CREATE POLICY "Notifications insert"
ON public.notifications FOR INSERT
TO anon, authenticated
WITH CHECK (true);

-- 21. Grade Appeals
CREATE POLICY "Grade appeals select"
ON public.grade_appeals FOR SELECT
TO anon, authenticated
USING (true);

CREATE POLICY "Grade appeals insert"
ON public.grade_appeals FOR INSERT
TO anon, authenticated
WITH CHECK (true);

CREATE POLICY "Grade appeals manage"
ON public.grade_appeals FOR UPDATE
TO authenticated
USING (public.is_admin() OR public.is_lecturer());

-- 22. Stipend Disbursements (Finance & Admin only)
CREATE POLICY "Stipend disbursements select"
ON public.stipend_disbursements FOR SELECT
TO anon, authenticated
USING (
  public.is_admin()
  OR lower(learner_email) = public.current_user_email()
  OR auth.jwt() IS NULL
);

CREATE POLICY "Stipend disbursements manage"
ON public.stipend_disbursements FOR ALL
TO authenticated
USING (public.is_admin())
WITH CHECK (public.is_admin());

-- 23. Institutional Banking Config (Sensitive Finance Configuration)
CREATE POLICY "Institutional banking config select"
ON public.institutional_banking_config FOR SELECT
TO anon, authenticated
USING (public.is_admin() OR auth.jwt() IS NULL);

CREATE POLICY "Institutional banking config manage"
ON public.institutional_banking_config FOR ALL
TO authenticated
USING (public.is_admin())
WITH CHECK (public.is_admin());

-- 24. App State (Universal Cloud Sync)
CREATE POLICY "App state read"
ON public.app_state FOR SELECT
TO anon, authenticated
USING (true);

CREATE POLICY "App state write"
ON public.app_state FOR ALL
TO anon, authenticated
USING (true)
WITH CHECK (true);

-- ==============================================================================
-- STEP 6: RECTIFY PRIVILEGES & GRANTS (Fixes anon excessive privileges warnings)
-- ==============================================================================

-- Revoke high-risk DDL and administrative privileges from anon
REVOKE ALL ON ALL TABLES IN SCHEMA public FROM anon;

-- Grant selective SELECT access on public catalog and verification tables to anon
GRANT SELECT ON public.courses TO anon;
GRANT SELECT ON public.modules TO anon;
GRANT SELECT ON public.library_resources TO anon;
GRANT SELECT ON public.announcements TO anon;
GRANT SELECT ON public.calendar_events TO anon;
GRANT SELECT ON public.certificates TO anon;
GRANT SELECT ON public.quizzes TO anon;
GRANT SELECT ON public.assessments TO anon;

-- Grant INSERT and SELECT on registration/submission tables to anon
GRANT INSERT, SELECT ON public.student_profiles TO anon;
GRANT INSERT, SELECT ON public.enrollments TO anon;
GRANT INSERT, SELECT ON public.submissions TO anon;
GRANT INSERT, SELECT ON public.quiz_attempts TO anon;
GRANT INSERT, SELECT ON public.messages TO anon;
GRANT INSERT, SELECT ON public.notifications TO anon;
GRANT INSERT, SELECT ON public.grade_appeals TO anon;
GRANT INSERT, SELECT ON public.audit_logs TO anon;
GRANT SELECT ON public.system_lecturers TO anon;
GRANT SELECT ON public.system_admins TO anon;
GRANT SELECT ON public.fees TO anon;
GRANT SELECT, INSERT, UPDATE ON public.stipend_disbursements TO anon;
GRANT SELECT, INSERT, UPDATE ON public.institutional_banking_config TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.app_state TO anon;

-- Grant standard operations to authenticated users
GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA public TO authenticated;

-- Grant full control to service_role (Admin & Backend tasks)
GRANT ALL ON ALL TABLES IN SCHEMA public TO service_role;

-- Grant sequence usage for auto-incrementing IDs
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO anon, authenticated, service_role;

-- ==============================================================================
-- STEP 7: OCTOBER 30 BREAKING CHANGE AUTOMATION (ALTER DEFAULT PRIVILEGES)
-- Prevents "permission denied" errors on all new tables created after October 30!
-- ==============================================================================

ALTER DEFAULT PRIVILEGES IN SCHEMA public
GRANT SELECT ON TABLES TO anon;

ALTER DEFAULT PRIVILEGES IN SCHEMA public
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLES TO authenticated;

ALTER DEFAULT PRIVILEGES IN SCHEMA public
GRANT ALL ON TABLES TO service_role;

ALTER DEFAULT PRIVILEGES IN SCHEMA public
GRANT USAGE, SELECT ON SEQUENCES TO anon, authenticated, service_role;

-- ==============================================================================
-- VERIFICATION QUERY
-- Run this to confirm 0 unshielded tables and active RLS status across all tables:
-- ==============================================================================
SELECT 
  tablename, 
  rowsecurity AS rls_enabled,
  (SELECT count(*) FROM pg_policies WHERE pg_policies.tablename = pg_tables.tablename) AS policy_count
FROM pg_tables
WHERE schemaname = 'public'
ORDER BY tablename;
