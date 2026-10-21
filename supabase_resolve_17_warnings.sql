-- ==============================================================================
-- Nexa Transform Group LMIS — Supabase Security Advisor 17 Warnings Resolution
-- Resolves: 0006_multiple_permissive_policies & public schema extension lints
--
-- Direct Execution URL:
-- https://supabase.com/dashboard/project/bwygpjlzoefhfixtyxdg/sql
-- ==============================================================================

-- ==============================================================================
-- STEP 1: MOVE EXTENSIONS OUT OF PUBLIC (if any exist)
-- ==============================================================================
DO $$
DECLARE
  ext record;
BEGIN
  CREATE SCHEMA IF NOT EXISTS extensions;
  FOR ext IN
    SELECT extname FROM pg_extension WHERE extnamespace = 'public'::regnamespace
  LOOP
    BEGIN
      EXECUTE format('ALTER EXTENSION %I SET SCHEMA extensions;', ext.extname);
    EXCEPTION WHEN OTHERS THEN
      NULL; -- Ignore if extension cannot be relocated
    END;
  END LOOP;
END $$;

-- ==============================================================================
-- STEP 2: DROP ALL EXISTING POLICIES TO PREVENT DUPLICATES
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
-- STEP 3: CREATE NON-OVERLAPPING DISCRETE POLICIES
-- (Separates SELECT from INSERT/UPDATE/DELETE so no role has multiple permissive policies)
-- ==============================================================================

-- 1. Courses
CREATE POLICY "courses_read" ON public.courses
  FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "courses_insert" ON public.courses
  FOR INSERT TO authenticated WITH CHECK (public.is_admin() OR public.is_lecturer());
CREATE POLICY "courses_update" ON public.courses
  FOR UPDATE TO authenticated USING (public.is_admin() OR public.is_lecturer()) WITH CHECK (public.is_admin() OR public.is_lecturer());
CREATE POLICY "courses_delete" ON public.courses
  FOR DELETE TO authenticated USING (public.is_admin() OR public.is_lecturer());

-- 2. Modules
CREATE POLICY "modules_read" ON public.modules
  FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "modules_insert" ON public.modules
  FOR INSERT TO authenticated WITH CHECK (public.is_admin() OR public.is_lecturer());
CREATE POLICY "modules_update" ON public.modules
  FOR UPDATE TO authenticated USING (public.is_admin() OR public.is_lecturer()) WITH CHECK (public.is_admin() OR public.is_lecturer());
CREATE POLICY "modules_delete" ON public.modules
  FOR DELETE TO authenticated USING (public.is_admin() OR public.is_lecturer());

-- 3. Library Resources
CREATE POLICY "library_read" ON public.library_resources
  FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "library_insert" ON public.library_resources
  FOR INSERT TO authenticated WITH CHECK (public.is_admin() OR public.is_lecturer());
CREATE POLICY "library_update" ON public.library_resources
  FOR UPDATE TO authenticated USING (public.is_admin() OR public.is_lecturer()) WITH CHECK (public.is_admin() OR public.is_lecturer());
CREATE POLICY "library_delete" ON public.library_resources
  FOR DELETE TO authenticated USING (public.is_admin() OR public.is_lecturer());

-- 4. Calendar Events
CREATE POLICY "calendar_read" ON public.calendar_events
  FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "calendar_insert" ON public.calendar_events
  FOR INSERT TO authenticated WITH CHECK (public.is_admin() OR public.is_lecturer());
CREATE POLICY "calendar_update" ON public.calendar_events
  FOR UPDATE TO authenticated USING (public.is_admin() OR public.is_lecturer()) WITH CHECK (public.is_admin() OR public.is_lecturer());
CREATE POLICY "calendar_delete" ON public.calendar_events
  FOR DELETE TO authenticated USING (public.is_admin() OR public.is_lecturer());

-- 5. Announcements
CREATE POLICY "announcements_read" ON public.announcements
  FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "announcements_insert" ON public.announcements
  FOR INSERT TO authenticated WITH CHECK (public.is_admin() OR public.is_lecturer());
CREATE POLICY "announcements_update" ON public.announcements
  FOR UPDATE TO authenticated USING (public.is_admin() OR public.is_lecturer()) WITH CHECK (public.is_admin() OR public.is_lecturer());
CREATE POLICY "announcements_delete" ON public.announcements
  FOR DELETE TO authenticated USING (public.is_admin() OR public.is_lecturer());

-- 6. Certificates
CREATE POLICY "certificates_read" ON public.certificates
  FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "certificates_insert" ON public.certificates
  FOR INSERT TO authenticated WITH CHECK (public.is_admin());
CREATE POLICY "certificates_update" ON public.certificates
  FOR UPDATE TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());
CREATE POLICY "certificates_delete" ON public.certificates
  FOR DELETE TO authenticated USING (public.is_admin());

-- 7. Student Profiles
CREATE POLICY "students_read" ON public.student_profiles
  FOR SELECT TO anon, authenticated USING (
    public.is_admin()
    OR public.is_lecturer()
    OR lower(learner_email) = public.current_user_email()
    OR auth.jwt() IS NULL
  );
CREATE POLICY "students_insert" ON public.student_profiles
  FOR INSERT TO anon, authenticated WITH CHECK (true);
CREATE POLICY "students_update" ON public.student_profiles
  FOR UPDATE TO authenticated USING (
    public.is_admin()
    OR lower(learner_email) = public.current_user_email()
  ) WITH CHECK (
    public.is_admin()
    OR lower(learner_email) = public.current_user_email()
  );
CREATE POLICY "students_delete" ON public.student_profiles
  FOR DELETE TO authenticated USING (public.is_admin());

-- 8. Enrollments
CREATE POLICY "enrollments_read" ON public.enrollments
  FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "enrollments_insert" ON public.enrollments
  FOR INSERT TO anon, authenticated WITH CHECK (true);
CREATE POLICY "enrollments_update" ON public.enrollments
  FOR UPDATE TO authenticated USING (public.is_admin() OR public.is_lecturer()) WITH CHECK (public.is_admin() OR public.is_lecturer());
CREATE POLICY "enrollments_delete" ON public.enrollments
  FOR DELETE TO authenticated USING (public.is_admin() OR public.is_lecturer());

-- 9. Assignments
CREATE POLICY "assignments_read" ON public.assignments
  FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "assignments_insert" ON public.assignments
  FOR INSERT TO authenticated WITH CHECK (public.is_admin() OR public.is_lecturer());
CREATE POLICY "assignments_update" ON public.assignments
  FOR UPDATE TO authenticated USING (public.is_admin() OR public.is_lecturer()) WITH CHECK (public.is_admin() OR public.is_lecturer());
CREATE POLICY "assignments_delete" ON public.assignments
  FOR DELETE TO authenticated USING (public.is_admin() OR public.is_lecturer());

-- 10. Submissions
CREATE POLICY "submissions_read" ON public.submissions
  FOR SELECT TO anon, authenticated USING (
    public.is_admin()
    OR public.is_lecturer()
    OR lower(learner_email) = public.current_user_email()
    OR auth.jwt() IS NULL
  );
CREATE POLICY "submissions_insert" ON public.submissions
  FOR INSERT TO anon, authenticated WITH CHECK (true);
CREATE POLICY "submissions_update" ON public.submissions
  FOR UPDATE TO authenticated USING (
    public.is_admin()
    OR public.is_lecturer()
    OR lower(learner_email) = public.current_user_email()
  );
CREATE POLICY "submissions_delete" ON public.submissions
  FOR DELETE TO authenticated USING (public.is_admin());

-- 11. Attendance
CREATE POLICY "attendance_read" ON public.attendance
  FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "attendance_insert" ON public.attendance
  FOR INSERT TO authenticated WITH CHECK (public.is_admin() OR public.is_lecturer());
CREATE POLICY "attendance_update" ON public.attendance
  FOR UPDATE TO authenticated USING (public.is_admin() OR public.is_lecturer()) WITH CHECK (public.is_admin() OR public.is_lecturer());
CREATE POLICY "attendance_delete" ON public.attendance
  FOR DELETE TO authenticated USING (public.is_admin() OR public.is_lecturer());

-- 12. Messages
CREATE POLICY "messages_read" ON public.messages
  FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "messages_insert" ON public.messages
  FOR INSERT TO anon, authenticated WITH CHECK (true);
CREATE POLICY "messages_update" ON public.messages
  FOR UPDATE TO anon, authenticated USING (true) WITH CHECK (true);
CREATE POLICY "messages_delete" ON public.messages
  FOR DELETE TO authenticated USING (public.is_admin());

-- 13. System Lecturers
CREATE POLICY "lecturers_read" ON public.system_lecturers
  FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "lecturers_insert" ON public.system_lecturers
  FOR INSERT TO authenticated WITH CHECK (public.is_admin());
CREATE POLICY "lecturers_update" ON public.system_lecturers
  FOR UPDATE TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());
CREATE POLICY "lecturers_delete" ON public.system_lecturers
  FOR DELETE TO authenticated USING (public.is_admin());

-- 14. System Admins
CREATE POLICY "admins_read" ON public.system_admins
  FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "admins_insert" ON public.system_admins
  FOR INSERT TO authenticated WITH CHECK (public.is_admin());
CREATE POLICY "admins_update" ON public.system_admins
  FOR UPDATE TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());
CREATE POLICY "admins_delete" ON public.system_admins
  FOR DELETE TO authenticated USING (public.is_admin());

-- 15. Audit Logs
CREATE POLICY "audit_read" ON public.audit_logs
  FOR SELECT TO authenticated USING (public.is_admin());
CREATE POLICY "audit_insert" ON public.audit_logs
  FOR INSERT TO anon, authenticated WITH CHECK (true);

-- 16. Fees
CREATE POLICY "fees_read" ON public.fees
  FOR SELECT TO anon, authenticated USING (
    public.is_admin()
    OR lower(learner_email) = public.current_user_email()
    OR auth.jwt() IS NULL
  );
CREATE POLICY "fees_insert" ON public.fees
  FOR INSERT TO authenticated WITH CHECK (public.is_admin());
CREATE POLICY "fees_update" ON public.fees
  FOR UPDATE TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());
CREATE POLICY "fees_delete" ON public.fees
  FOR DELETE TO authenticated USING (public.is_admin());

-- 17. Quizzes
CREATE POLICY "quizzes_read" ON public.quizzes
  FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "quizzes_insert" ON public.quizzes
  FOR INSERT TO authenticated WITH CHECK (public.is_admin() OR public.is_lecturer());
CREATE POLICY "quizzes_update" ON public.quizzes
  FOR UPDATE TO authenticated USING (public.is_admin() OR public.is_lecturer()) WITH CHECK (public.is_admin() OR public.is_lecturer());
CREATE POLICY "quizzes_delete" ON public.quizzes
  FOR DELETE TO authenticated USING (public.is_admin() OR public.is_lecturer());

-- 18. Quiz Attempts
CREATE POLICY "attempts_read" ON public.quiz_attempts
  FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "attempts_insert" ON public.quiz_attempts
  FOR INSERT TO anon, authenticated WITH CHECK (true);
CREATE POLICY "attempts_update" ON public.quiz_attempts
  FOR UPDATE TO authenticated USING (public.is_admin() OR public.is_lecturer());
CREATE POLICY "attempts_delete" ON public.quiz_attempts
  FOR DELETE TO authenticated USING (public.is_admin());

-- 19. Assessments
CREATE POLICY "assessments_read" ON public.assessments
  FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "assessments_insert" ON public.assessments
  FOR INSERT TO authenticated WITH CHECK (public.is_admin() OR public.is_lecturer());
CREATE POLICY "assessments_update" ON public.assessments
  FOR UPDATE TO authenticated USING (public.is_admin() OR public.is_lecturer()) WITH CHECK (public.is_admin() OR public.is_lecturer());
CREATE POLICY "assessments_delete" ON public.assessments
  FOR DELETE TO authenticated USING (public.is_admin() OR public.is_lecturer());

-- 20. Notifications
CREATE POLICY "notifications_read" ON public.notifications
  FOR SELECT TO anon, authenticated USING (
    public.is_admin()
    OR lower(user_email) = public.current_user_email()
    OR auth.jwt() IS NULL
  );
CREATE POLICY "notifications_insert" ON public.notifications
  FOR INSERT TO anon, authenticated WITH CHECK (true);
CREATE POLICY "notifications_update" ON public.notifications
  FOR UPDATE TO authenticated USING (
    public.is_admin()
    OR lower(user_email) = public.current_user_email()
  );
CREATE POLICY "notifications_delete" ON public.notifications
  FOR DELETE TO authenticated USING (public.is_admin());

-- 21. Grade Appeals
CREATE POLICY "appeals_read" ON public.grade_appeals
  FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "appeals_insert" ON public.grade_appeals
  FOR INSERT TO anon, authenticated WITH CHECK (true);
CREATE POLICY "appeals_update" ON public.grade_appeals
  FOR UPDATE TO authenticated USING (public.is_admin() OR public.is_lecturer());
CREATE POLICY "appeals_delete" ON public.grade_appeals
  FOR DELETE TO authenticated USING (public.is_admin());

-- 22. Stipend Disbursements
CREATE POLICY "stipends_read" ON public.stipend_disbursements
  FOR SELECT TO anon, authenticated USING (
    public.is_admin()
    OR lower(learner_email) = public.current_user_email()
    OR auth.jwt() IS NULL
  );
CREATE POLICY "stipends_insert" ON public.stipend_disbursements
  FOR INSERT TO authenticated WITH CHECK (public.is_admin());
CREATE POLICY "stipends_update" ON public.stipend_disbursements
  FOR UPDATE TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());
CREATE POLICY "stipends_delete" ON public.stipend_disbursements
  FOR DELETE TO authenticated USING (public.is_admin());

-- 23. Institutional Banking Config
CREATE POLICY "banking_read" ON public.institutional_banking_config
  FOR SELECT TO anon, authenticated USING (public.is_admin() OR auth.jwt() IS NULL);
CREATE POLICY "banking_insert" ON public.institutional_banking_config
  FOR INSERT TO authenticated WITH CHECK (public.is_admin());
CREATE POLICY "banking_update" ON public.institutional_banking_config
  FOR UPDATE TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());
CREATE POLICY "banking_delete" ON public.institutional_banking_config
  FOR DELETE TO authenticated USING (public.is_admin());

-- 24. App State
CREATE POLICY "appstate_read" ON public.app_state
  FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "appstate_insert" ON public.app_state
  FOR INSERT TO anon, authenticated WITH CHECK (true);
CREATE POLICY "appstate_update" ON public.app_state
  FOR UPDATE TO anon, authenticated USING (true) WITH CHECK (true);
CREATE POLICY "appstate_delete" ON public.app_state
  FOR DELETE TO authenticated USING (public.is_admin());

-- ==============================================================================
-- STEP 4: VERIFY 0 MULTIPLE PERMISSIVE POLICIES REMAIN
-- ==============================================================================
SELECT 
  c.relname AS table_name,
  pol.polcmd AS command,
  count(*) AS overlapping_policies_count
FROM pg_policy pol
JOIN pg_class c ON pol.polrelid = c.oid
JOIN pg_namespace n ON c.relnamespace = n.oid
WHERE n.nspname = 'public'
  AND pol.polpermissive = true
GROUP BY c.relname, pol.polcmd
HAVING count(*) > 1;
