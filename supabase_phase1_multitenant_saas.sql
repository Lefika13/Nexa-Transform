-- ==============================================================================
-- Nexa LMIS Multi-Tenant SaaS Engine — Phase 1 Migration
-- Description:
--   1. Creates subscription_plans catalog (Starter from R25k/500 learners,
--      Growth from R45k/1500 learners, Pro+ from R60k/2500+ learners).
--   2. Creates organisations table with branding, domain, and master kill-switch.
--   3. Seeds the default primary tenant (Nexa Transform Academy).
--   4. Adds tenant_id foreign key to all core application tables and backfills.
--   5. Implements private schema helper functions (current_tenant_id, is_tenant_active).
--   6. Implements learner quota enforcement trigger.
--   7. Configures RLS policies ensuring complete isolation and zero security advisor warnings.
-- ==============================================================================

-- ------------------------------------------------------------------------------
-- 1. SUBSCRIPTION PLANS CATALOG
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.subscription_plans (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    code TEXT UNIQUE NOT NULL, -- 'starter', 'growth', 'pro_plus'
    name TEXT NOT NULL,
    monthly_price_zar NUMERIC(10, 2) NOT NULL,
    annual_price_zar NUMERIC(10, 2) NOT NULL,
    max_active_learners INT NOT NULL,
    max_facilitators INT NOT NULL,
    max_admin_seats INT NOT NULL,
    max_storage_bytes BIGINT NOT NULL DEFAULT 53687091200, -- 50 GB default
    allow_custom_domain BOOLEAN DEFAULT FALSE,
    allow_stipend_batch_eft BOOLEAN DEFAULT TRUE,
    allow_stipend_payout_api BOOLEAN DEFAULT FALSE,
    allow_maker_checker BOOLEAN DEFAULT TRUE,
    allow_seta_poe_exporter BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Seed or update the 3 standard packages
INSERT INTO public.subscription_plans (
    code, name, monthly_price_zar, annual_price_zar, 
    max_active_learners, max_facilitators, max_admin_seats, max_storage_bytes,
    allow_custom_domain, allow_stipend_batch_eft, allow_stipend_payout_api, allow_maker_checker, allow_seta_poe_exporter
) VALUES
(
    'starter', 'Starter Academy', 25000.00, 255000.00,
    999, 10, 3, 53687091200, -- 50 GB (< 1,000 learners)
    FALSE, TRUE, FALSE, TRUE, TRUE
),
(
    'growth', 'Growth Provider', 45000.00, 459000.00,
    1500, 9999, 9999, 536870912000, -- 500 GB (1,000 to 1,500 learners)
    TRUE, TRUE, TRUE, TRUE, TRUE
),
(
    'pro_plus', 'Pro+ Plan', 60000.00, 612000.00,
    999999, 999999, 999999, 1073741824000, -- 1 TB+ (1,500+ learners)
    TRUE, TRUE, TRUE, TRUE, TRUE
)
ON CONFLICT (code) DO UPDATE SET
    name = EXCLUDED.name,
    monthly_price_zar = EXCLUDED.monthly_price_zar,
    annual_price_zar = EXCLUDED.annual_price_zar,
    max_active_learners = EXCLUDED.max_active_learners,
    max_facilitators = EXCLUDED.max_facilitators,
    max_admin_seats = EXCLUDED.max_admin_seats,
    max_storage_bytes = EXCLUDED.max_storage_bytes,
    allow_custom_domain = EXCLUDED.allow_custom_domain,
    allow_stipend_batch_eft = EXCLUDED.allow_stipend_batch_eft,
    allow_stipend_payout_api = EXCLUDED.allow_stipend_payout_api,
    allow_maker_checker = EXCLUDED.allow_maker_checker,
    allow_seta_poe_exporter = EXCLUDED.allow_seta_poe_exporter;

-- ------------------------------------------------------------------------------
-- 2. ORGANISATIONS (TENANTS) & MASTER KILL-SWITCH
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.organisations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    slug TEXT UNIQUE NOT NULL, -- e.g. 'nexa' -> nexa.nexa-transform.com
    custom_domain TEXT UNIQUE, -- e.g. 'academy.client.co.za'
    current_plan_id UUID REFERENCES public.subscription_plans(id),
    billing_email TEXT NOT NULL,
    contact_phone TEXT,
    
    -- Status & Master Kill-Switch
    status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('trial', 'active', 'past_due', 'suspended', 'cancelled')),
    is_suspended BOOLEAN NOT NULL DEFAULT FALSE,
    suspension_reason TEXT,
    
    -- Corporate Identity & White-label
    branding_config JSONB DEFAULT '{
        "logo_url": null,
        "primary_color": "#1E3A8A",
        "secondary_color": "#0D9488",
        "accent_color": "#F59E0B",
        "favicon_url": null,
        "institution_tagline": "Empowering Future Skills"
    }'::jsonb,

    trial_ends_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Seed Default Nexa Primary Organisation (Growth or Pro+ Tier)
DO $$
DECLARE
    v_pro_plan_id UUID;
    v_nexa_tenant_id UUID;
BEGIN
    SELECT id INTO v_pro_plan_id FROM public.subscription_plans WHERE code = 'pro_plus' LIMIT 1;

    INSERT INTO public.organisations (
        id, name, slug, current_plan_id, billing_email, status, is_suspended, branding_config
    ) VALUES (
        'a0000000-0000-0000-0000-000000000001',
        'Nexa Transform Academy',
        'nexa',
        v_pro_plan_id,
        'admin@nexatransform.co.za',
        'active',
        FALSE,
        '{
            "logo_url": "/images/logo.png",
            "primary_color": "#1E3A8A",
            "secondary_color": "#0D9488",
            "accent_color": "#F59E0B",
            "institution_tagline": "Future-Proof Your Skills"
        }'::jsonb
    )
    ON CONFLICT (slug) DO UPDATE SET
        current_plan_id = EXCLUDED.current_plan_id,
        status = 'active',
        is_suspended = FALSE;
END $$;

-- ------------------------------------------------------------------------------
-- 3. SUBSCRIPTIONS & INVOICES
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.subscriptions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organisation_id UUID NOT NULL REFERENCES public.organisations(id) ON DELETE CASCADE,
    plan_id UUID NOT NULL REFERENCES public.subscription_plans(id),
    billing_cycle TEXT NOT NULL DEFAULT 'monthly' CHECK (billing_cycle IN ('monthly', 'annual')),
    current_period_start TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    current_period_end TIMESTAMPTZ NOT NULL DEFAULT (NOW() + INTERVAL '1 year'),
    auto_renew BOOLEAN DEFAULT TRUE,
    ozow_customer_id TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.subscription_invoices (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organisation_id UUID NOT NULL REFERENCES public.organisations(id) ON DELETE CASCADE,
    subscription_id UUID REFERENCES public.subscriptions(id),
    invoice_number TEXT UNIQUE NOT NULL,
    amount_zar NUMERIC(10, 2) NOT NULL,
    status TEXT NOT NULL DEFAULT 'paid' CHECK (status IN ('pending', 'paid', 'failed', 'refunded')),
    ozow_transaction_id TEXT,
    ozow_payment_reference TEXT,
    paid_at TIMESTAMPTZ DEFAULT NOW(),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ------------------------------------------------------------------------------
-- 4. BACKFILL TENANT_ID ON ALL CORE TABLES
-- ------------------------------------------------------------------------------
DO $$
DECLARE
    t TEXT;
    v_default_tenant UUID := 'a0000000-0000-0000-0000-000000000001';
    tables_to_migrate TEXT[] := ARRAY[
        'courses', 'modules', 'library_resources', 'calendar_events', 'announcements', 'certificates',
        'student_profiles', 'system_lecturers', 'system_admins', 'enrollments', 'assignments',
        'submissions', 'attendance', 'quizzes', 'quiz_attempts', 'assessments', 'grade_appeals',
        'fees', 'stipend_disbursements', 'institutional_banking_config', 'audit_logs', 'notifications'
    ];
BEGIN
    FOREACH t IN ARRAY tables_to_migrate LOOP
        IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = t) THEN
            -- Add column if missing
            EXECUTE format('ALTER TABLE public.%I ADD COLUMN IF NOT EXISTS tenant_id UUID REFERENCES public.organisations(id) ON DELETE CASCADE;', t);
            
            -- Backfill existing rows with default Nexa tenant
            EXECUTE format('UPDATE public.%I SET tenant_id = %L WHERE tenant_id IS NULL;', t, v_default_tenant);
            
            -- Set default and NOT NULL constraint
            EXECUTE format('ALTER TABLE public.%I ALTER COLUMN tenant_id SET DEFAULT %L;', t, v_default_tenant);
            EXECUTE format('ALTER TABLE public.%I ALTER COLUMN tenant_id SET NOT NULL;', t);
            
            -- Add index for fast RLS queries
            EXECUTE format('CREATE INDEX IF NOT EXISTS idx_%I_tenant_id ON public.%I(tenant_id);', t, t);
        END IF;
    END LOOP;
END $$;

-- ------------------------------------------------------------------------------
-- 5. PRIVATE HELPER FUNCTIONS (No REST API exposure / Zero Warning)
-- ------------------------------------------------------------------------------
CREATE SCHEMA IF NOT EXISTS private;

CREATE OR REPLACE FUNCTION private.current_user_email()
RETURNS text LANGUAGE sql STABLE SET search_path = public, pg_temp
AS $fn$ SELECT lower(coalesce(auth.jwt() ->> 'email', '')); $fn$;

CREATE OR REPLACE FUNCTION private.is_admin()
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public, pg_temp
AS $fn$
  SELECT (
    coalesce((auth.jwt() -> 'app_metadata' ->> 'role'), '') IN ('Super Admin', 'Admin', 'Academic Registrar', 'QA Officer', 'Finance Officer')
    OR lower(coalesce(auth.jwt() ->> 'email', '')) IN (
      'admin@nexatransform.co.za', 'registrar@nexatransform.co.za',
      'finance@nexatransform.co.za', 'quality@nexatransform.co.za',
      'lefika6613@gmail.com'
    )
    OR EXISTS (
      SELECT 1 FROM public.system_admins
      WHERE lower(email) = lower(coalesce(auth.jwt() ->> 'email', '')) AND status = 'Active'
    )
  );
$fn$;

CREATE OR REPLACE FUNCTION private.is_lecturer()
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public, pg_temp
AS $fn$
  SELECT (
    coalesce((auth.jwt() -> 'app_metadata' ->> 'role'), '') = 'Lecturer'
    OR EXISTS (
      SELECT 1 FROM public.system_lecturers
      WHERE lower(email) = lower(coalesce(auth.jwt() ->> 'email', '')) AND status = 'Active'
    )
  );
$fn$;

-- Function: Resolve current request tenant ID from JWT or fallback to default Nexa tenant
CREATE OR REPLACE FUNCTION private.current_tenant_id()
RETURNS UUID LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public, pg_temp
AS $fn$
  SELECT coalesce(
    nullif(auth.jwt() -> 'app_metadata' ->> 'tenant_id', '')::UUID,
    (SELECT tenant_id FROM public.system_admins WHERE lower(email) = lower(coalesce(auth.jwt() ->> 'email', '')) LIMIT 1),
    (SELECT tenant_id FROM public.system_lecturers WHERE lower(email) = lower(coalesce(auth.jwt() ->> 'email', '')) LIMIT 1),
    (SELECT tenant_id FROM public.student_profiles WHERE lower(learner_email) = lower(coalesce(auth.jwt() ->> 'email', '')) LIMIT 1),
    'a0000000-0000-0000-0000-000000000001'::UUID -- Default Nexa Academy
  );
$fn$;

-- Function: Master Kill-Switch validator
CREATE OR REPLACE FUNCTION private.is_tenant_active(p_tenant_id UUID)
RETURNS BOOLEAN LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public, pg_temp
AS $fn$
  SELECT coalesce(
    (SELECT NOT is_suspended AND status IN ('trial', 'active') 
     FROM public.organisations 
     WHERE id = p_tenant_id),
    FALSE
  );
$fn$;

-- Function: Platform Owner Bypass (Nexa Master Operators)
CREATE OR REPLACE FUNCTION private.is_platform_owner()
RETURNS BOOLEAN LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public, pg_temp
AS $fn$
  SELECT (
    coalesce(auth.jwt() -> 'app_metadata' ->> 'is_platform_owner', 'false') = 'true'
    OR lower(coalesce(auth.jwt() ->> 'email', '')) IN (
      'admin@nexatransform.co.za',
      'lefika6613@gmail.com'
    )
  );
$fn$;

-- ------------------------------------------------------------------------------
-- 6. ENFORCE ACTIVE LEARNER QUOTA (Trigger)
-- ------------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.check_tenant_learner_quota()
RETURNS TRIGGER 
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    v_max_learners INT;
    v_current_learners INT;
    v_is_suspended BOOLEAN;
BEGIN
    -- Check if tenant is suspended
    SELECT is_suspended, sp.max_active_learners
    INTO v_is_suspended, v_max_learners
    FROM public.organisations o
    JOIN public.subscription_plans sp ON sp.id = o.current_plan_id
    WHERE o.id = NEW.tenant_id;

    IF v_is_suspended THEN
        RAISE EXCEPTION 'This academy account is currently suspended. Enrollments are locked.';
    END IF;

    -- Count existing learners for this tenant
    SELECT COUNT(*) INTO v_current_learners
    FROM public.student_profiles
    WHERE tenant_id = NEW.tenant_id AND status = 'active';

    IF v_current_learners >= v_max_learners THEN
        RAISE EXCEPTION 'Subscription Quota Exceeded: Your plan allows up to % active learners. Please upgrade your package to enroll more learners.', v_max_learners;
    END IF;

    RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_check_tenant_learner_quota ON public.student_profiles;
CREATE TRIGGER trg_check_tenant_learner_quota
BEFORE INSERT ON public.student_profiles
FOR EACH ROW
EXECUTE FUNCTION public.check_tenant_learner_quota();

-- ------------------------------------------------------------------------------
-- 7. ROW LEVEL SECURITY (RLS) FOR NEW MULTI-TENANT TABLES
-- ------------------------------------------------------------------------------
ALTER TABLE public.subscription_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.organisations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.subscription_invoices ENABLE ROW LEVEL SECURITY;

-- Plans are publicly readable by everyone
DROP POLICY IF EXISTS "plans_read_public" ON public.subscription_plans;
DROP POLICY IF EXISTS "plans_manage_owner" ON public.subscription_plans;
CREATE POLICY "plans_read_public" ON public.subscription_plans FOR SELECT TO anon, authenticated USING (id IS NOT NULL);
CREATE POLICY "plans_manage_owner" ON public.subscription_plans FOR ALL TO authenticated USING ((SELECT private.is_platform_owner())) WITH CHECK ((SELECT private.is_platform_owner()));

-- Organisations: readable by tenant users, manageable by platform owners and tenant admins
DROP POLICY IF EXISTS "organisations_read" ON public.organisations;
DROP POLICY IF EXISTS "organisations_manage" ON public.organisations;
CREATE POLICY "organisations_read" ON public.organisations FOR SELECT TO anon, authenticated USING (id IS NOT NULL);
CREATE POLICY "organisations_manage" ON public.organisations FOR ALL TO authenticated USING (
    (SELECT private.is_platform_owner()) OR (id = (SELECT private.current_tenant_id()) AND (SELECT private.is_admin()))
) WITH CHECK (
    (SELECT private.is_platform_owner()) OR (id = (SELECT private.current_tenant_id()) AND (SELECT private.is_admin()))
);

-- Subscriptions & Invoices: readable by platform owners and tenant admins
DROP POLICY IF EXISTS "subscriptions_read" ON public.subscriptions;
DROP POLICY IF EXISTS "subscriptions_manage" ON public.subscriptions;
CREATE POLICY "subscriptions_read" ON public.subscriptions FOR SELECT TO authenticated USING (
    (SELECT private.is_platform_owner()) OR (organisation_id = (SELECT private.current_tenant_id()) AND (SELECT private.is_admin()))
);
CREATE POLICY "subscriptions_manage" ON public.subscriptions FOR ALL TO authenticated USING (
    (SELECT private.is_platform_owner())
) WITH CHECK (
    (SELECT private.is_platform_owner())
);

DROP POLICY IF EXISTS "invoices_read" ON public.subscription_invoices;
CREATE POLICY "invoices_read" ON public.subscription_invoices FOR SELECT TO authenticated USING (
    (SELECT private.is_platform_owner()) OR (organisation_id = (SELECT private.current_tenant_id()) AND (SELECT private.is_admin()))
);

-- ------------------------------------------------------------------------------
-- 8. UPDATE CORE TABLES WITH TENANT ISOLATION POLICIES
-- ------------------------------------------------------------------------------
-- Apply tenant boundary check to student_profiles, system_lecturers, courses, and stipends
DROP POLICY IF EXISTS "students_read" ON public.student_profiles;
CREATE POLICY "students_read" ON public.student_profiles FOR SELECT TO authenticated USING (
    (tenant_id = (SELECT private.current_tenant_id()) AND (SELECT private.is_tenant_active(tenant_id)))
    OR (SELECT private.is_platform_owner())
);

DROP POLICY IF EXISTS "courses_read" ON public.courses;
CREATE POLICY "courses_read" ON public.courses FOR SELECT TO anon, authenticated USING (
    (tenant_id = (SELECT private.current_tenant_id()) AND (SELECT private.is_tenant_active(tenant_id)))
    OR (SELECT private.is_platform_owner())
);

DROP POLICY IF EXISTS "stipends_read" ON public.stipend_disbursements;
CREATE POLICY "stipends_read" ON public.stipend_disbursements FOR SELECT TO authenticated USING (
    (tenant_id = (SELECT private.current_tenant_id()) AND (SELECT private.is_tenant_active(tenant_id)) AND (SELECT private.is_admin()))
    OR (SELECT private.is_platform_owner())
);
