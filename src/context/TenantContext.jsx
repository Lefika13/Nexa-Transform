import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';

const TenantContext = createContext(null);

export const DEFAULT_TENANT_ID = 'a0000000-0000-0000-0000-000000000001';

export const PLAN_DEFINITIONS = {
  starter: {
    code: 'starter',
    name: 'Starter Academy',
    monthly_price_zar: 25000,
    annual_price_zar: 255000,
    max_active_learners: 1000,
    max_facilitators: 10,
    max_seats_per_role: 5,        // 5 each: Junior Admin, Senior Admin, QA, Finance, Registrar
    max_admin_seats: 5,           // Per administrative role
    allow_custom_domain: false,
    allow_stipend_payout_api: false, // NO direct stipend payouts from LMIS
    allow_stipend_batch_eft: true,   // Bank Batch EFT Exporter enabled
    allow_maker_checker: true,
    allow_seta_poe_exporter: false,  // Individual PoE only
    allow_multi_entity: false,
    allow_custom_erp: false
  },
  growth: {
    code: 'growth',
    name: 'Growth Provider',
    monthly_price_zar: 45000,
    annual_price_zar: 459000,
    max_active_learners: 1500,
    max_facilitators: 99999, // Unlimited
    max_admin_seats: 99999,   // Unlimited
    max_seats_per_role: 99999, // Unlimited
    allow_custom_domain: true,
    allow_stipend_payout_api: true, // Direct Instant EFT Payouts via LMIS
    allow_stipend_batch_eft: true,
    allow_maker_checker: true,
    allow_seta_poe_exporter: true,  // 1-Click Batch SETA PoE Exporter
    allow_multi_entity: false,
    allow_custom_erp: false
  },
  pro_plus: {
    code: 'pro_plus',
    name: 'Pro+ Plan',
    monthly_price_zar: 60000,
    annual_price_zar: 612000,
    max_active_learners: 999999, // 1,500+ (Unlimited)
    max_facilitators: 999999,    // Unlimited
    max_admin_seats: 999999,     // Unlimited
    max_seats_per_role: 999999,  // Unlimited
    allow_custom_domain: true,
    allow_stipend_payout_api: true,
    allow_stipend_batch_eft: true,
    allow_maker_checker: true,
    allow_seta_poe_exporter: true,
    allow_multi_entity: true,    // Multi-Campus & Multi-Entity Payout Orchestration
    allow_custom_erp: true       // Custom ERP (SAP, Sage 300, PeopleSoft)
  }
};

const DEFAULT_NEXA_BRANDING = {
  name: 'Nexa Transform Academy',
  slug: 'nexa',
  logo_url: '/images/logo.png',
  primary_color: '#0B132B',   // Nexa Midnight Navy
  secondary_color: '#06B6D4', // Nexa Turquoise
  accent_color: '#D4AF37',    // Nexa Gold
  favicon_url: '/favicon.ico',
  institution_tagline: 'Future-Proof Your Skills',
  is_suspended: false,
  suspension_reason: null,
  plan_code: 'growth',
  plan: PLAN_DEFINITIONS.growth
};

export const TenantProvider = ({ children }) => {
  const [tenant, setTenant] = useState(DEFAULT_NEXA_BRANDING);
  const [loading, setLoading] = useState(true);

  // Helper to extract tenant slug from subdomain or URL
  const resolveTenantSlug = () => {
    try {
      if (typeof window === 'undefined') return 'nexa';

      // 1. Check query parameter e.g. ?tenant=apex
      try {
        const params = new URLSearchParams(window.location.search);
        const queryTenant = params.get('tenant');
        if (queryTenant) return queryTenant.toLowerCase();
      } catch (_) {}

      // 2. Check localStorage cached tenant slug
      try {
        const cachedSlug = localStorage.getItem('nexa_active_tenant_slug');
        if (cachedSlug) return cachedSlug.toLowerCase();
      } catch (_) {}

      // 3. Check Subdomain (e.g. apex.nexa-transform.com or apex.localhost)
      const hostname = window.location.hostname || '';

      // Ignore Vercel preview deployment hostnames and localhost
      if (hostname.includes('vercel.app') || hostname === 'localhost' || hostname === '127.0.0.1') {
        return 'nexa';
      }

      const parts = hostname.split('.');
      
      // If not naked domain or standard root
      if (parts.length >= 3 && parts[0] !== 'www' && parts[0] !== 'nexa-transform') {
        return parts[0].toLowerCase();
      }

      return 'nexa';
    } catch (_) {
      return 'nexa';
    }
  };

  const applyCssVariables = (t) => {
    if (typeof document !== 'undefined') {
      const isNexaInternal = !t?.slug || t.slug === 'nexa';
      if (isNexaInternal) {
        // Return internal LMIS strictly to Nexa's native original design system color scheme
        document.documentElement.style.removeProperty('--tenant-primary');
        document.documentElement.style.removeProperty('--tenant-secondary');
        document.documentElement.style.removeProperty('--tenant-accent');
        document.documentElement.style.removeProperty('--color-tenant-primary');
        document.documentElement.style.removeProperty('--color-tenant-secondary');
        document.documentElement.style.removeProperty('--color-tenant-accent');
        return;
      }

      const primary = t?.primary_color || '#0B132B';
      const secondary = t?.secondary_color || '#06B6D4';
      const accent = t?.accent_color || '#D4AF37';

      document.documentElement.style.setProperty('--tenant-primary', primary);
      document.documentElement.style.setProperty('--tenant-secondary', secondary);
      document.documentElement.style.setProperty('--tenant-accent', accent);
      document.documentElement.style.setProperty('--color-tenant-primary', primary);
      document.documentElement.style.setProperty('--color-tenant-secondary', secondary);
      document.documentElement.style.setProperty('--color-tenant-accent', accent);
    }
  };

  const fetchTenantDetails = async () => {
    try {
      setLoading(true);
      const slug = resolveTenantSlug();

      // Check for locally cached override (useful for immediate demo persistence & offline)
      let cachedOverride = null;
      try {
        if (slug !== 'nexa') {
          const raw = localStorage.getItem(`nexa_tenant_branding_${slug}`);
          if (raw) cachedOverride = JSON.parse(raw);
        } else {
          localStorage.removeItem('nexa_tenant_branding_nexa');
        }
      } catch (_) {}

      // Query organisations table
      const { data, error } = await supabase
        .from('organisations')
        .select(`
          id,
          name,
          slug,
          custom_domain,
          status,
          is_suspended,
          suspension_reason,
          branding_config,
          current_plan_id,
          subscription_plans (
            code,
            name,
            max_active_learners,
            allow_custom_domain,
            allow_stipend_batch_eft,
            allow_stipend_payout_api
          )
        `)
        .eq('slug', slug)
        .maybeSingle();

      // Check for plan override via URL query or localStorage
      let planOverride = null;
      try {
        const params = new URLSearchParams(window.location.search);
        const p = params.get('plan');
        if (p && PLAN_DEFINITIONS[p.toLowerCase()]) {
          planOverride = p.toLowerCase();
          localStorage.setItem('nexa_active_plan_override', planOverride);
        } else {
          const stored = localStorage.getItem('nexa_active_plan_override');
          if (stored && PLAN_DEFINITIONS[stored.toLowerCase()]) {
            planOverride = stored.toLowerCase();
          }
        }
      } catch (_) {}

      if (data && !error) {
        const branding = { ...(data.branding_config || {}), ...(cachedOverride || {}) };
        const rawCode = planOverride || data.subscription_plans?.code || 'growth';
        const effectiveCode = PLAN_DEFINITIONS[rawCode] ? rawCode : 'growth';
        const planDetails = {
          ...PLAN_DEFINITIONS[effectiveCode],
          ...(data.subscription_plans || {})
        };

        const resolvedTenant = {
          id: data.id,
          name: cachedOverride?.name || data.name || DEFAULT_NEXA_BRANDING.name,
          slug: data.slug,
          custom_domain: cachedOverride?.custom_domain || data.custom_domain,
          status: data.status,
          is_suspended: Boolean(data.is_suspended),
          suspension_reason: data.suspension_reason,
          logo_url: branding.logo_url || DEFAULT_NEXA_BRANDING.logo_url,
          primary_color: branding.primary_color || DEFAULT_NEXA_BRANDING.primary_color,
          secondary_color: branding.secondary_color || DEFAULT_NEXA_BRANDING.secondary_color,
          accent_color: branding.accent_color || DEFAULT_NEXA_BRANDING.accent_color,
          institution_tagline: branding.institution_tagline || DEFAULT_NEXA_BRANDING.institution_tagline,
          plan: planDetails,
          plan_code: effectiveCode
        };

        setTenant(resolvedTenant);
        applyCssVariables(resolvedTenant);
      } else {
        // Fallback to default Nexa Academy or cached demo override
        const rawCode = planOverride || 'growth';
        const effectiveCode = PLAN_DEFINITIONS[rawCode] ? rawCode : 'growth';
        const planDetails = PLAN_DEFINITIONS[effectiveCode];
        const fallback = {
          ...DEFAULT_NEXA_BRANDING,
          ...(cachedOverride || {}),
          id: DEFAULT_TENANT_ID,
          plan_code: effectiveCode,
          plan: planDetails
        };
        setTenant(fallback);
        applyCssVariables(fallback);
      }
    } catch (err) {
      console.error('Failed to resolve tenant configuration:', err);
      setTenant({
        ...DEFAULT_NEXA_BRANDING,
        id: DEFAULT_TENANT_ID
      });
      applyCssVariables(DEFAULT_NEXA_BRANDING);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTenantDetails();
  }, []);

  // Update branding method for Tenant Admins
  const updateBranding = async (newBranding) => {
    try {
      const updatedTenant = {
        ...tenant,
        name: newBranding.name || tenant.name,
        logo_url: newBranding.logo_url !== undefined ? newBranding.logo_url : tenant.logo_url,
        primary_color: newBranding.primary_color || tenant.primary_color,
        secondary_color: newBranding.secondary_color || tenant.secondary_color,
        accent_color: newBranding.accent_color || tenant.accent_color,
        institution_tagline: newBranding.institution_tagline !== undefined ? newBranding.institution_tagline : tenant.institution_tagline,
        custom_domain: newBranding.custom_domain !== undefined ? newBranding.custom_domain : tenant.custom_domain
      };

      setTenant(updatedTenant);
      applyCssVariables(updatedTenant);

      // Persist in localStorage for instant reload & demo persistence
      try {
        localStorage.setItem(`nexa_tenant_branding_${tenant.slug || 'nexa'}`, JSON.stringify({
          name: updatedTenant.name,
          logo_url: updatedTenant.logo_url,
          primary_color: updatedTenant.primary_color,
          secondary_color: updatedTenant.secondary_color,
          accent_color: updatedTenant.accent_color,
          institution_tagline: updatedTenant.institution_tagline,
          custom_domain: updatedTenant.custom_domain
        }));
      } catch (_) {}

      // Update in Supabase if tenant id exists and is not demo-only
      if (tenant.id && tenant.id !== DEFAULT_TENANT_ID) {
        await supabase
          .from('organisations')
          .update({
            name: updatedTenant.name,
            custom_domain: updatedTenant.custom_domain,
            branding_config: {
              logo_url: updatedTenant.logo_url,
              primary_color: updatedTenant.primary_color,
              secondary_color: updatedTenant.secondary_color,
              accent_color: updatedTenant.accent_color,
              institution_tagline: updatedTenant.institution_tagline
            }
          })
          .eq('id', tenant.id);
      }

      return { success: true, tenant: updatedTenant };
    } catch (err) {
      console.error('Error updating tenant branding:', err);
      return { success: false, error: err.message };
    }
  };

  // Reset branding to default Nexa Academy styling
  const resetBranding = async () => {
    try {
      const reset = {
        ...DEFAULT_NEXA_BRANDING,
        id: tenant.id || DEFAULT_TENANT_ID,
        slug: tenant.slug || 'nexa'
      };
      setTenant(reset);
      applyCssVariables(reset);

      try {
        localStorage.removeItem(`nexa_tenant_branding_${tenant.slug || 'nexa'}`);
      } catch (_) {}

      if (tenant.id && tenant.id !== DEFAULT_TENANT_ID) {
        await supabase
          .from('organisations')
          .update({
            name: DEFAULT_NEXA_BRANDING.name,
            branding_config: {
              logo_url: DEFAULT_NEXA_BRANDING.logo_url,
              primary_color: DEFAULT_NEXA_BRANDING.primary_color,
              secondary_color: DEFAULT_NEXA_BRANDING.secondary_color,
              accent_color: DEFAULT_NEXA_BRANDING.accent_color,
              institution_tagline: DEFAULT_NEXA_BRANDING.institution_tagline
            }
          })
          .eq('id', tenant.id);
      }
      return { success: true };
    } catch (err) {
      return { success: false, error: err.message };
    }
  };

  // Method to change subscription plan code dynamically
  const setPlanCode = async (newCode) => {
    if (!newCode || !PLAN_DEFINITIONS[newCode]) return { success: false, error: 'Invalid plan code' };
    try {
      localStorage.setItem('nexa_active_plan_override', newCode);
      const planDetails = PLAN_DEFINITIONS[newCode];
      const updated = {
        ...tenant,
        plan_code: newCode,
        plan: planDetails
      };
      setTenant(updated);

      // If registered organisation exists in Supabase
      if (tenant.id && tenant.id !== DEFAULT_TENANT_ID) {
        const planIds = {
          starter: '50a2b907-0e4a-44bf-ae18-6072b0e9a4bf',
          growth: 'a0b5f3cb-e363-4491-b754-21de374449d5',
          pro_plus: 'd905c94d-b688-4167-ae4b-118e619b4a1f'
        };
        await supabase
          .from('organisations')
          .update({ current_plan_id: planIds[newCode] || planIds.growth })
          .eq('id', tenant.id);
      }

      return { success: true, plan: planDetails };
    } catch (err) {
      console.warn('Error setting plan code:', err);
      return { success: false, error: err.message };
    }
  };

  // Method to allow admins or demo switchers to change tenant context
  const switchTenant = (newSlug) => {
    if (newSlug) {
      localStorage.setItem('nexa_active_tenant_slug', newSlug);
      window.location.reload();
    }
  };

  // Master Kill-Switch View: If tenant is suspended by Nexa Platform Owner
  if (!loading && tenant.is_suspended) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center p-6 text-white font-sans">
        <div className="max-w-md w-full bg-slate-800 border border-red-500/30 rounded-2xl p-8 text-center shadow-2xl">
          <div className="w-16 h-16 bg-red-500/20 text-red-400 rounded-full flex items-center justify-center mx-auto mb-5 text-2xl font-black">
            !
          </div>
          <h2 className="text-2xl font-bold text-white mb-2">Portal Access Suspended</h2>
          <p className="text-slate-400 text-sm mb-6 leading-relaxed">
            The learning management portal for <strong className="text-slate-200">{tenant.name}</strong> is currently deactivated.
          </p>
          {tenant.suspension_reason && (
            <div className="bg-red-950/40 border border-red-800/40 rounded-xl p-4 text-xs text-red-300 mb-6 text-left">
              <strong className="block font-semibold mb-1 text-red-200">Notice:</strong>
              {tenant.suspension_reason}
            </div>
          )}
          <p className="text-xs text-slate-500 mb-6">
            If you are the institutional administrator, please contact Nexa billing or complete your outstanding invoice to reactivate your portal.
          </p>
          <a
            href="mailto:billing@nexa-transform.com"
            className="inline-flex items-center justify-center w-full px-5 py-3 rounded-xl bg-red-600 hover:bg-red-500 font-semibold text-sm transition-all"
          >
            Contact Nexa Accounts
          </a>
        </div>
      </div>
    );
  }

  return (
    <TenantContext.Provider value={{ tenant, loading, switchTenant, refreshTenant: fetchTenantDetails, updateBranding, resetBranding, setPlanCode }}>
      {children}
    </TenantContext.Provider>
  );
};

export const useTenant = () => {
  const context = useContext(TenantContext);
  if (!context) {
    return {
      tenant: DEFAULT_NEXA_BRANDING,
      loading: false,
      switchTenant: () => {},
      refreshTenant: () => {},
      updateBranding: async () => ({ success: true }),
      resetBranding: async () => ({ success: true }),
      setPlanCode: async () => ({ success: true })
    };
  }
  return context;
};
