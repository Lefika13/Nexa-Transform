-- ==============================================================================
-- NexaTransform Hub LMIS — Enterprise Row Level Security (RLS) Architecture
-- Run this script in the Supabase SQL Editor:
-- https://supabase.com/dashboard/project/bwygpjlzoefhfixtyxdg/sql
-- ==============================================================================

-- 1. Helper Security Functions (SECURITY DEFINER for fast, safe evaluation)

CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
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
AS $fn$
  SELECT (
    coalesce((auth.jwt() -> 'user_metadata' ->> 'role'), '') = 'Lecturer'
    OR EXISTS (
      SELECT 1 FROM public.system_lecturers
      WHERE lower(email) = lower(coalesce(auth.jwt() ->> 'email', ''))
    )
  );
$fn$;

CREATE OR REPLACE FUNCTION public.current_user_email()
RETURNS text
LANGUAGE sql
STABLE
AS $fn$
  SELECT lower(coalesce(auth.jwt() ->> 'email', ''));
$fn$;

-- ==============================================================================
-- 2. Enable Row Level Security on All LMIS Tables
-- ==============================================================================

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

-- ==============================================================================
-- 3. Student Profiles Policies
-- ==============================================================================
DROP POLICY IF EXISTS "Admin full access on student_profiles" ON public.student_profiles;
CREATE POLICY "Admin full access on student_profiles"
ON public.student_profiles FOR ALL
TO authenticated
USING (public.is_admin())
WITH CHECK (public.is_admin());

DROP POLICY IF EXISTS "Lecturers can view student profiles" ON public.student_profiles;
CREATE POLICY "Lecturers can view student profiles"
ON public.student_profiles FOR SELECT
TO authenticated
USING (public.is_lecturer());

DROP POLICY IF EXISTS "Learners view own profile" ON public.student_profiles;
CREATE POLICY "Learners view own profile"
ON public.student_profiles FOR SELECT
TO authenticated
USING (lower(learner_email) = public.current_user_email());

DROP POLICY IF EXISTS "Learners update own profile" ON public.student_profiles;
CREATE POLICY "Learners update own profile"
ON public.student_profiles FOR UPDATE
TO authenticated
USING (lower(learner_email) = public.current_user_email())
WITH CHECK (lower(learner_email) = public.current_user_email());

-- ==============================================================================
-- 4. Courses & Modules Policies
-- ==============================================================================
DROP POLICY IF EXISTS "Anyone can view courses" ON public.courses;
CREATE POLICY "Anyone can view courses"
ON public.courses FOR SELECT
USING (true);

DROP POLICY IF EXISTS "Admin and Lecturer manage courses" ON public.courses;
CREATE POLICY "Admin and Lecturer manage courses"
ON public.courses FOR ALL
TO authenticated
USING (public.is_admin() OR public.is_lecturer())
WITH CHECK (public.is_admin() OR public.is_lecturer());

DROP POLICY IF EXISTS "Anyone can view modules" ON public.modules;
CREATE POLICY "Anyone can view modules"
ON public.modules FOR SELECT
USING (true);

DROP POLICY IF EXISTS "Admin and Lecturer manage modules" ON public.modules;
CREATE POLICY "Admin and Lecturer manage modules"
ON public.modules FOR ALL
TO authenticated
USING (public.is_admin() OR public.is_lecturer())
WITH CHECK (public.is_admin() OR public.is_lecturer());

-- ==============================================================================
-- 5. Enrollments Policies
-- ==============================================================================
DROP POLICY IF EXISTS "Admin full access on enrollments" ON public.enrollments;
CREATE POLICY "Admin full access on enrollments"
ON public.enrollments FOR ALL
TO authenticated
USING (public.is_admin())
WITH CHECK (public.is_admin());

DROP POLICY IF EXISTS "Lecturers view course enrollments" ON public.enrollments;
CREATE POLICY "Lecturers view course enrollments"
ON public.enrollments FOR SELECT
TO authenticated
USING (public.is_lecturer());

DROP POLICY IF EXISTS "Learners view own enrollments" ON public.enrollments;
CREATE POLICY "Learners view own enrollments"
ON public.enrollments FOR SELECT
TO authenticated
USING (lower(learner_email) = public.current_user_email());

-- ==============================================================================
-- 6. Assignments, Quizzes & Library Resources
-- ==============================================================================
DROP POLICY IF EXISTS "View assignments" ON public.assignments;
CREATE POLICY "View assignments"
ON public.assignments FOR SELECT
USING (true);

DROP POLICY IF EXISTS "Admin and Lecturer manage assignments" ON public.assignments;
CREATE POLICY "Admin and Lecturer manage assignments"
ON public.assignments FOR ALL
TO authenticated
USING (public.is_admin() OR public.is_lecturer())
WITH CHECK (public.is_admin() OR public.is_lecturer());

DROP POLICY IF EXISTS "View quizzes" ON public.quizzes;
CREATE POLICY "View quizzes"
ON public.quizzes FOR SELECT
USING (true);

DROP POLICY IF EXISTS "Admin and Lecturer manage quizzes" ON public.quizzes;
CREATE POLICY "Admin and Lecturer manage quizzes"
ON public.quizzes FOR ALL
TO authenticated
USING (public.is_admin() OR public.is_lecturer())
WITH CHECK (public.is_admin() OR public.is_lecturer());

DROP POLICY IF EXISTS "View library resources" ON public.library_resources;
CREATE POLICY "View library resources"
ON public.library_resources FOR SELECT
USING (true);

DROP POLICY IF EXISTS "Admin and Lecturer manage library resources" ON public.library_resources;
CREATE POLICY "Admin and Lecturer manage library resources"
ON public.library_resources FOR ALL
TO authenticated
USING (public.is_admin() OR public.is_lecturer())
WITH CHECK (public.is_admin() OR public.is_lecturer());

-- ==============================================================================
-- 7. Submissions Policies
-- ==============================================================================
DROP POLICY IF EXISTS "Admin full access on submissions" ON public.submissions;
CREATE POLICY "Admin full access on submissions"
ON public.submissions FOR ALL
TO authenticated
USING (public.is_admin())
WITH CHECK (public.is_admin());

DROP POLICY IF EXISTS "Lecturers view and grade submissions" ON public.submissions;
CREATE POLICY "Lecturers view and grade submissions"
ON public.submissions FOR ALL
TO authenticated
USING (public.is_lecturer())
WITH CHECK (public.is_lecturer());

DROP POLICY IF EXISTS "Learners view own submissions" ON public.submissions;
CREATE POLICY "Learners view own submissions"
ON public.submissions FOR SELECT
TO authenticated
USING (lower(learner_email) = public.current_user_email());

DROP POLICY IF EXISTS "Learners create own submissions" ON public.submissions;
CREATE POLICY "Learners create own submissions"
ON public.submissions FOR INSERT
TO authenticated
WITH CHECK (lower(learner_email) = public.current_user_email());

DROP POLICY IF EXISTS "Learners update own pending submissions" ON public.submissions;
CREATE POLICY "Learners update own pending submissions"
ON public.submissions FOR UPDATE
TO authenticated
USING (lower(learner_email) = public.current_user_email())
WITH CHECK (lower(learner_email) = public.current_user_email());

-- ==============================================================================
-- 8. Quiz Attempts Policies
-- ==============================================================================
DROP POLICY IF EXISTS "Admin full access on quiz_attempts" ON public.quiz_attempts;
CREATE POLICY "Admin full access on quiz_attempts"
ON public.quiz_attempts FOR ALL
TO authenticated
USING (public.is_admin())
WITH CHECK (public.is_admin());

DROP POLICY IF EXISTS "Lecturers view quiz attempts" ON public.quiz_attempts;
CREATE POLICY "Lecturers view quiz attempts"
ON public.quiz_attempts FOR SELECT
TO authenticated
USING (public.is_lecturer());

DROP POLICY IF EXISTS "Learners view own quiz attempts" ON public.quiz_attempts;
CREATE POLICY "Learners view own quiz attempts"
ON public.quiz_attempts FOR SELECT
TO authenticated
USING (lower(learner_email) = public.current_user_email());

DROP POLICY IF EXISTS "Learners record own quiz attempt" ON public.quiz_attempts;
CREATE POLICY "Learners record own quiz attempt"
ON public.quiz_attempts FOR INSERT
TO authenticated
WITH CHECK (lower(learner_email) = public.current_user_email());

-- ==============================================================================
-- 9. Fees & Certificates (Financial & Credential Privacy)
-- ==============================================================================
DROP POLICY IF EXISTS "Admin manage fees" ON public.fees;
CREATE POLICY "Admin manage fees"
ON public.fees FOR ALL
TO authenticated
USING (public.is_admin())
WITH CHECK (public.is_admin());

DROP POLICY IF EXISTS "Learners view own fees" ON public.fees;
CREATE POLICY "Learners view own fees"
ON public.fees FOR SELECT
TO authenticated
USING (lower(learner_email) = public.current_user_email());

DROP POLICY IF EXISTS "Admin manage certificates" ON public.certificates;
CREATE POLICY "Admin manage certificates"
ON public.certificates FOR ALL
TO authenticated
USING (public.is_admin())
WITH CHECK (public.is_admin());

DROP POLICY IF EXISTS "Learners view own certificates" ON public.certificates;
CREATE POLICY "Learners view own certificates"
ON public.certificates FOR SELECT
TO authenticated
USING (lower(learner_email) = public.current_user_email());

-- ==============================================================================
-- 10. Audit Logs (Strict Append-Only Immutability)
-- ==============================================================================
DROP POLICY IF EXISTS "Admin view audit logs" ON public.audit_logs;
CREATE POLICY "Admin view audit logs"
ON public.audit_logs FOR SELECT
TO authenticated
USING (public.is_admin());

DROP POLICY IF EXISTS "Anyone authenticated can insert audit logs" ON public.audit_logs;
CREATE POLICY "Anyone authenticated can insert audit logs"
ON public.audit_logs FOR INSERT
TO authenticated
WITH CHECK (true);

REVOKE UPDATE, DELETE ON public.audit_logs FROM public, anon, authenticated;

-- ==============================================================================
-- 11. System Lecturers & Administrators Policies
-- ==============================================================================
DROP POLICY IF EXISTS "Anyone can view lecturers" ON public.system_lecturers;
CREATE POLICY "Anyone can view lecturers"
ON public.system_lecturers FOR SELECT
USING (true);

DROP POLICY IF EXISTS "Admin manage lecturers" ON public.system_lecturers;
CREATE POLICY "Admin manage lecturers"
ON public.system_lecturers FOR ALL
TO authenticated
USING (public.is_admin())
WITH CHECK (public.is_admin());

DROP POLICY IF EXISTS "Lecturers update own profile" ON public.system_lecturers;
CREATE POLICY "Lecturers update own profile"
ON public.system_lecturers FOR UPDATE
TO authenticated
USING (lower(email) = public.current_user_email())
WITH CHECK (lower(email) = public.current_user_email());

DROP POLICY IF EXISTS "Admin manage system_admins" ON public.system_admins;
CREATE POLICY "Admin manage system_admins"
ON public.system_admins FOR ALL
TO authenticated
USING (public.is_admin())
WITH CHECK (public.is_admin());

DROP POLICY IF EXISTS "Admins view system_admins" ON public.system_admins;
CREATE POLICY "Admins view system_admins"
ON public.system_admins FOR SELECT
USING (public.is_admin() OR lower(email) = public.current_user_email());

-- ==============================================================================
-- 12. Attendance Policies
-- ==============================================================================
DROP POLICY IF EXISTS "Admin and Lecturer manage attendance" ON public.attendance;
CREATE POLICY "Admin and Lecturer manage attendance"
ON public.attendance FOR ALL
TO authenticated
USING (public.is_admin() OR public.is_lecturer())
WITH CHECK (public.is_admin() OR public.is_lecturer());

DROP POLICY IF EXISTS "Learners view own attendance" ON public.attendance;
CREATE POLICY "Learners view own attendance"
ON public.attendance FOR SELECT
TO authenticated
USING (lower(learner_email) = public.current_user_email());

-- ==============================================================================
-- 13. Announcements Policies
-- ==============================================================================
DROP POLICY IF EXISTS "Anyone view announcements" ON public.announcements;
CREATE POLICY "Anyone view announcements"
ON public.announcements FOR SELECT
USING (true);

DROP POLICY IF EXISTS "Admin and Lecturer manage announcements" ON public.announcements;
CREATE POLICY "Admin and Lecturer manage announcements"
ON public.announcements FOR ALL
TO authenticated
USING (public.is_admin() OR public.is_lecturer())
WITH CHECK (public.is_admin() OR public.is_lecturer());

-- ==============================================================================
-- 14. Messages Policies
-- ==============================================================================
DROP POLICY IF EXISTS "Users view own messages" ON public.messages;
CREATE POLICY "Users view own messages"
ON public.messages FOR SELECT
TO authenticated
USING (lower(sender_email) = public.current_user_email() OR lower(recipient_email) = public.current_user_email() OR public.is_admin());

DROP POLICY IF EXISTS "Users send messages" ON public.messages;
CREATE POLICY "Users send messages"
ON public.messages FOR INSERT
TO authenticated
WITH CHECK (lower(sender_email) = public.current_user_email() OR public.is_admin());

DROP POLICY IF EXISTS "Users update received messages" ON public.messages;
CREATE POLICY "Users update received messages"
ON public.messages FOR UPDATE
TO authenticated
USING (lower(recipient_email) = public.current_user_email() OR public.is_admin())
WITH CHECK (lower(recipient_email) = public.current_user_email() OR public.is_admin());

-- ==============================================================================
-- 15. Performance Indices
-- ==============================================================================
CREATE INDEX IF NOT EXISTS idx_enrollments_learner ON public.enrollments (lower(learner_email), course_code);
CREATE INDEX IF NOT EXISTS idx_submissions_learner ON public.submissions (lower(learner_email), course_code);
CREATE INDEX IF NOT EXISTS idx_quiz_attempts_learner ON public.quiz_attempts (lower(learner_email), quiz_id);
CREATE INDEX IF NOT EXISTS idx_fees_learner ON public.fees (lower(learner_email));
CREATE INDEX IF NOT EXISTS idx_certificates_learner ON public.certificates (lower(learner_email));
CREATE INDEX IF NOT EXISTS idx_student_profiles_num ON public.student_profiles (student_number);

