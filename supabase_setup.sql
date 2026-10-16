-- ==============================================================================
-- NexaTransform Hub LMIS — Supabase Database Architecture & Security Script
-- Run this script in your Supabase SQL Editor (https://supabase.com/dashboard/project/bwygpjlzoefhfixtyxdg/sql)
-- ==============================================================================

-- 1. Student Profiles Table
CREATE TABLE IF NOT EXISTS public.student_profiles (
  id text PRIMARY KEY,
  student_number text,
  learner_name text,
  learner_email text,
  id_passport text,
  phone text,
  gender text,
  date_of_birth text,
  age int,
  province text,
  physical_address text,
  postal_address text,
  employee_number text,
  highest_qualification text,
  previous_high_school text,
  matric_year text,
  custom_password text,
  id_copy_attachments jsonb DEFAULT '[]'::jsonb,
  bank_proof_attachments jsonb DEFAULT '[]'::jsonb,
  qualification_proof_attachments jsonb DEFAULT '[]'::jsonb,
  emergency_contact_name text,
  emergency_contact_phone text,
  emergency_contact_relation text,
  medical_info text,
  disability_info text,
  status text DEFAULT 'Active',
  created_at timestamptz DEFAULT now()
);

-- 2. Courses / Modules Table
CREATE TABLE IF NOT EXISTS public.courses (
  id text PRIMARY KEY,
  title text,
  code text,
  category text,
  description text,
  status text DEFAULT 'Active',
  lecturer_name text,
  lecturer_email text,
  schedule_day text,
  schedule_time text,
  created_at timestamptz DEFAULT now()
);

-- 3. Enrollments Table
CREATE TABLE IF NOT EXISTS public.enrollments (
  id text PRIMARY KEY,
  student_id text,
  course_id text,
  course_code text,
  learner_name text,
  learner_email text,
  enrollment_date text,
  status text DEFAULT 'Active',
  created_at timestamptz DEFAULT now()
);

-- 4. Assignments Table
CREATE TABLE IF NOT EXISTS public.assignments (
  id text PRIMARY KEY,
  title text,
  course_code text,
  due_date text,
  description text,
  total_marks int DEFAULT 100,
  attachments jsonb DEFAULT '[]'::jsonb,
  created_at timestamptz DEFAULT now()
);

-- 5. Submissions Table
CREATE TABLE IF NOT EXISTS public.submissions (
  id text PRIMARY KEY,
  assignment_id text,
  assignment_title text,
  course_code text,
  learner_name text,
  learner_email text,
  submission_text text,
  attachments jsonb DEFAULT '[]'::jsonb,
  grade int,
  feedback text,
  status text DEFAULT 'Submitted',
  submitted_at timestamptz DEFAULT now()
);

-- 6. Attendance Table
CREATE TABLE IF NOT EXISTS public.attendance (
  id text PRIMARY KEY,
  course_code text,
  learner_name text,
  learner_email text,
  date text,
  status text DEFAULT 'Present',
  created_at timestamptz DEFAULT now()
);

-- 7. System Lecturers Table
CREATE TABLE IF NOT EXISTS public.system_lecturers (
  id text PRIMARY KEY,
  name text,
  email text,
  phone text,
  department text,
  title text,
  password text,
  temp_password text,
  created_at timestamptz DEFAULT now()
);

-- 8. System Admins Table
CREATE TABLE IF NOT EXISTS public.system_admins (
  id text PRIMARY KEY,
  name text,
  email text,
  phone text,
  role text,
  status text DEFAULT 'Active',
  created_at timestamptz DEFAULT now()
);

-- 9. Audit Logs Table (Full Traceability)
CREATE TABLE IF NOT EXISTS public.audit_logs (
  id text PRIMARY KEY,
  timestamp timestamptz DEFAULT now(),
  action_type text,
  performed_by text,
  role text,
  target_entity text,
  details text,
  device text
);

-- 10. Fees & Invoices Table
CREATE TABLE IF NOT EXISTS public.fees (
  id text PRIMARY KEY,
  learner_name text,
  learner_email text,
  status text DEFAULT 'Unpaid',
  description text,
  amount numeric DEFAULT 0,
  amount_paid numeric DEFAULT 0,
  due_date text,
  invoice_number text,
  created_at timestamptz DEFAULT now()
);

-- 11. Certificates Table
CREATE TABLE IF NOT EXISTS public.certificates (
  id text PRIMARY KEY,
  learner_name text,
  learner_email text,
  course_code text,
  programme_title text,
  issue_date text,
  status text DEFAULT 'Issued',
  certificate_number text,
  created_at timestamptz DEFAULT now()
);

-- 12. Quizzes Table
CREATE TABLE IF NOT EXISTS public.quizzes (
  id text PRIMARY KEY,
  title text,
  course_code text,
  duration int DEFAULT 30,
  pass_mark int DEFAULT 50,
  max_attempts int DEFAULT 2,
  questions jsonb DEFAULT '[]'::jsonb,
  created_by text,
  created_at timestamptz DEFAULT now()
);

-- 13. Quiz Attempts Table
CREATE TABLE IF NOT EXISTS public.quiz_attempts (
  id text PRIMARY KEY,
  quiz_id text,
  quiz_title text,
  learner_name text,
  learner_email text,
  score int,
  passed boolean,
  attempt_date text,
  answers jsonb DEFAULT '[]'::jsonb,
  created_at timestamptz DEFAULT now()
);

-- 14. Global Universal App State (Cloud Sync Hub)
CREATE TABLE IF NOT EXISTS public.app_state (
  id text PRIMARY KEY,
  state jsonb,
  updated_at timestamptz DEFAULT now()
);

-- ==============================================================================
-- UNLOCK PERMISSIONS & DISABLE RLS FOR ZERO-FRICTION MULTI-DEVICE SYNC
-- ==============================================================================
ALTER TABLE public.student_profiles DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.courses DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.enrollments DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.assignments DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.submissions DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.attendance DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.system_lecturers DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.system_admins DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_logs DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.fees DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.certificates DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.quizzes DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.quiz_attempts DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.app_state DISABLE ROW LEVEL SECURITY;

-- Grant API permissions
GRANT ALL ON ALL TABLES IN SCHEMA public TO anon, authenticated, service_role;
