-- ==============================================================================
-- Nexa Transform LMIS — Stipend Disbursements & Cloud Database Upgrade
-- Execute this script in your Supabase SQL Editor:
-- https://supabase.com/dashboard/project/bwygpjlzoefhfixtyxdg/sql
-- ==============================================================================

-- 1. Create Stipend Disbursements Table
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

-- 2. Create Institutional Banking Config Table
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

-- 3. Create Calendar Events Table (for scheduling and timetable sync)
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

-- 4. Disable RLS for Seamless Multi-User Admin & Finance Sync
ALTER TABLE public.stipend_disbursements DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.institutional_banking_config DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.calendar_events DISABLE ROW LEVEL SECURITY;

-- 5. Grant Full API Access to Anonymous and Authenticated Clients
GRANT ALL ON TABLE public.stipend_disbursements TO anon, authenticated, service_role;
GRANT ALL ON TABLE public.institutional_banking_config TO anon, authenticated, service_role;
GRANT ALL ON TABLE public.calendar_events TO anon, authenticated, service_role;
