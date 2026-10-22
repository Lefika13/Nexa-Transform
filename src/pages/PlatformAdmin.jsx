import React, { useState, useEffect } from 'react';
import {
  ShieldAlert, ShieldCheck, Building2, Users, DollarSign,
  Activity, Search, Filter, AlertTriangle, CheckCircle2,
  RefreshCw, PowerOff, ArrowUpRight, Lock, ExternalLink
} from 'lucide-react';
import './PlatformAdmin.css';

// Initial Mock Tenant Registry (mirrors Supabase `organisations` & `subscriptions`)
const INITIAL_TENANTS = [
  {
    id: 'org-001',
    name: 'Nexa Transform Academy',
    slug: 'default',
    custom_domain: 'academy.nexa-transform.com',
    plan_code: 'growth',
    plan_name: 'Growth Provider',
    monthly_price_zar: 45000,
    active_learners: 1240,
    max_learners: 1500,
    status: 'active',
    is_suspended: false,
    suspension_reason: null,
    billing_email: 'billing@nexa-transform.com',
    billing_cycle: 'annual',
    created_at: '2026-06-15T09:00:00Z',
    next_billing: '2027-06-15T00:00:00Z'
  },
  {
    id: 'org-002',
    name: 'Apex Skills Development Institute',
    slug: 'apex-skills',
    custom_domain: 'portal.apexskills.co.za',
    plan_code: 'growth',
    plan_name: 'Growth Provider',
    monthly_price_zar: 45000,
    active_learners: 1120,
    max_learners: 1500,
    status: 'active',
    is_suspended: false,
    suspension_reason: null,
    billing_email: 'finance@apexskills.co.za',
    billing_cycle: 'monthly',
    created_at: '2026-08-10T11:30:00Z',
    next_billing: '2026-11-10T00:00:00Z'
  },
  {
    id: 'org-003',
    name: 'Vanguard Technical TVET Consortium',
    slug: 'vanguard-tvet',
    custom_domain: 'lmis.vanguardtvet.edu.za',
    plan_code: 'pro_plus',
    plan_name: 'Pro+ Plan',
    monthly_price_zar: 60000,
    active_learners: 2150,
    max_learners: 3500,
    status: 'active',
    is_suspended: false,
    suspension_reason: null,
    billing_email: 'governance@vanguardtvet.edu.za',
    billing_cycle: 'annual',
    created_at: '2026-07-01T08:00:00Z',
    next_billing: '2027-07-01T00:00:00Z'
  },
  {
    id: 'org-004',
    name: 'Ubuntu Healthcare Training Academy',
    slug: 'ubuntu-health',
    custom_domain: null,
    plan_code: 'starter',
    plan_name: 'Starter Academy',
    monthly_price_zar: 25000,
    active_learners: 680,
    max_learners: 1000,
    status: 'active',
    is_suspended: false,
    suspension_reason: null,
    billing_email: 'admin@ubuntuhealth.org.za',
    billing_cycle: 'monthly',
    created_at: '2026-09-05T14:15:00Z',
    next_billing: '2026-11-05T00:00:00Z'
  },
  {
    id: 'org-005',
    name: 'Horizon Mining Skills Academy',
    slug: 'horizon-mining',
    custom_domain: 'skills.horizonmining.co.za',
    plan_code: 'growth',
    plan_name: 'Growth Provider',
    monthly_price_zar: 45000,
    active_learners: 940,
    max_learners: 1500,
    status: 'active',
    is_suspended: false,
    suspension_reason: null,
    billing_email: 'accounts@horizonmining.co.za',
    billing_cycle: 'annual',
    created_at: '2026-08-20T10:00:00Z',
    next_billing: '2027-08-20T00:00:00Z'
  }
];

export const PlatformAdmin = () => {
  const [tenants, setTenants] = useState(() => {
    if (typeof window !== 'undefined' && window.localStorage) {
      const saved = window.localStorage.getItem('nexa_platform_tenants');
      if (saved) {
        try {
          return JSON.parse(saved);
        } catch (e) {
          console.warn('Failed to parse stored tenants', e);
        }
      }
    }
    return INITIAL_TENANTS;
  });

  const [searchQuery, setSearchQuery] = useState('');
  const [filterPlan, setFilterPlan] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');

  // Modal State for Kill-Switch
  const [killModalOpen, setKillModalOpen] = useState(false);
  const [selectedTenant, setSelectedTenant] = useState(null);
  const [killReason, setKillReason] = useState('');
  const [actionType, setActionType] = useState('suspend'); // 'suspend' | 'reactivate'

  // Modal State for Plan Change
  const [planModalOpen, setPlanModalOpen] = useState(false);
  const [targetPlan, setTargetPlan] = useState('growth');

  // Toast State
  const [toastMessage, setToastMessage] = useState(null);

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 4000);
  };

  useEffect(() => {
    if (typeof window !== 'undefined' && window.localStorage) {
      window.localStorage.setItem('nexa_platform_tenants', JSON.stringify(tenants));
    }
  }, [tenants]);

  // Derived Metrics
  const totalMRR = tenants.reduce((acc, t) => acc + (t.is_suspended ? 0 : t.monthly_price_zar), 0);
  const totalLearners = tenants.reduce((acc, t) => acc + t.active_learners, 0);
  const activeTenantsCount = tenants.filter(t => !t.is_suspended).length;
  const suspendedCount = tenants.filter(t => t.is_suspended).length;

  // Filtered List
  const filteredTenants = tenants.filter(t => {
    const matchesSearch = t.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.slug.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.billing_email.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesPlan = filterPlan === 'all' || t.plan_code === filterPlan;
    const matchesStatus = filterStatus === 'all' ||
      (filterStatus === 'suspended' ? t.is_suspended : !t.is_suspended);
    return matchesSearch && matchesPlan && matchesStatus;
  });

  // Handle Kill-Switch Action
  const executeKillSwitch = () => {
    if (!selectedTenant) return;
    if (actionType === 'suspend' && !killReason.trim()) {
      alert('Please enter a mandatory audit reason for suspending this institution.');
      return;
    }

    setTenants(prev => prev.map(t => {
      if (t.id === selectedTenant.id) {
        return {
          ...t,
          is_suspended: actionType === 'suspend',
          status: actionType === 'suspend' ? 'suspended' : 'active',
          suspension_reason: actionType === 'suspend' ? killReason.trim() : null
        };
      }
      return t;
    }));

    showToast(actionType === 'suspend'
      ? `🚨 Master Kill-Switch Executed: ${selectedTenant.name} has been suspended.`
      : `✓ Institution Reactivated: ${selectedTenant.name} is now active.`
    );

    setKillModalOpen(false);
    setSelectedTenant(null);
    setKillReason('');
  };

  // Handle Plan Override
  const executePlanChange = () => {
    if (!selectedTenant) return;

    let planName = 'Growth Provider';
    let price = 45000;
    let max = 1500;

    if (targetPlan === 'starter') {
      planName = 'Starter Academy';
      price = 25000;
      max = 1000;
    } else if (targetPlan === 'pro_plus') {
      planName = 'Pro+ Plan';
      price = 60000;
      max = 3500;
    }

    setTenants(prev => prev.map(t => {
      if (t.id === selectedTenant.id) {
        return {
          ...t,
          plan_code: targetPlan,
          plan_name: planName,
          monthly_price_zar: price,
          max_learners: max
        };
      }
      return t;
    }));

    showToast(`✓ Plan Updated: ${selectedTenant.name} moved to ${planName}.`);
    setPlanModalOpen(false);
    setSelectedTenant(null);
  };

  return (
    <div className="platform-admin-root">
      <div className="platform-container">

        {/* Global Toast */}
        {toastMessage && (
          <div style={{
            position: 'fixed',
            bottom: '2rem',
            right: '2rem',
            backgroundColor: '#1E293B',
            color: '#F8FAFC',
            border: '1px solid #3B82F6',
            borderRadius: '10px',
            padding: '1rem 1.5rem',
            boxShadow: '0 10px 25px rgba(0,0,0,0.5)',
            zIndex: 9999,
            display: 'flex',
            alignItems: 'center',
            gap: '0.75rem',
            fontSize: '0.9rem',
            fontWeight: 600
          }}>
            <CheckCircle2 style={{ color: '#10B981', width: 20, height: 20 }} />
            <span>{toastMessage}</span>
          </div>
        )}

        {/* Header */}
        <div className="platform-header">
          <div className="platform-title-group">
            <h1>
              <ShieldAlert style={{ color: '#3B82F6', width: 28, height: 28 }} />
              Nexa Transform SaaS Control Tower
            </h1>
            <p className="platform-subtitle">
              Master Multi-Tenant Administration, MRR Analytics, Quota Governance &amp; Emergency Kill-Switch.
            </p>
          </div>

          <div className="platform-header-actions">
            <span className="platform-badge-pill">
              <span style={{ width: 8, height: 8, borderRadius: '50%', backgroundColor: '#10B981' }} />
              Postgres RLS Active
            </span>
            <a href="/lmis" className="platform-btn platform-btn-secondary">
              <ExternalLink style={{ width: 16, height: 16 }} />
              Visit LMIS Portal
            </a>
          </div>
        </div>

        {/* KPI Cards Grid */}
        <div className="platform-kpi-grid">
          <div className="platform-kpi-card">
            <div className="kpi-header-row">
              <span className="kpi-label">Monthly Recurring Revenue</span>
              <div className="kpi-icon-wrap">
                <DollarSign style={{ width: 20, height: 20 }} />
              </div>
            </div>
            <div className="kpi-val">
              R {totalMRR.toLocaleString('en-ZA')}
            </div>
            <span className="kpi-delta">
              +18.4% from last month (ZAR ARR: R {(totalMRR * 12).toLocaleString('en-ZA')})
            </span>
          </div>

          <div className="platform-kpi-card">
            <div className="kpi-header-row">
              <span className="kpi-label">Active Institutions</span>
              <div className="kpi-icon-wrap" style={{ backgroundColor: 'rgba(16, 185, 129, 0.1)', color: '#10B981' }}>
                <Building2 style={{ width: 20, height: 20 }} />
              </div>
            </div>
            <div className="kpi-val">
              {activeTenantsCount} <span style={{ fontSize: '1rem', color: '#64748B', fontWeight: 500 }}>/ {tenants.length} total</span>
            </div>
            <span className="kpi-delta" style={{ color: suspendedCount > 0 ? '#EF4444' : '#10B981' }}>
              {suspendedCount} currently suspended via kill-switch
            </span>
          </div>

          <div className="platform-kpi-card">
            <div className="kpi-header-row">
              <span className="kpi-label">Total Active Learners</span>
              <div className="kpi-icon-wrap" style={{ backgroundColor: 'rgba(245, 158, 11, 0.1)', color: '#F59E0B' }}>
                <Users style={{ width: 20, height: 20 }} />
              </div>
            </div>
            <div className="kpi-val">
              {totalLearners.toLocaleString('en-ZA')}
            </div>
            <span className="kpi-delta">
              Across all tenant databases &amp; PoE repositories
            </span>
          </div>

          <div className="platform-kpi-card">
            <div className="kpi-header-row">
              <span className="kpi-label">Stipend Clearing Volume</span>
              <div className="kpi-icon-wrap" style={{ backgroundColor: 'rgba(168, 85, 247, 0.1)', color: '#A855F7' }}>
                <Activity style={{ width: 20, height: 20 }} />
              </div>
            </div>
            <div className="kpi-val">
              R 19.62 M
            </div>
            <span className="kpi-delta">
              Cleared via Stitch Express RTC &amp; SA Bank EFT
            </span>
          </div>
        </div>

        {/* Tenant Registry Section */}
        <div className="platform-section-header">
          <h2 className="platform-section-title">
            <Building2 style={{ width: 20, height: 20, color: '#3B82F6' }} />
            Institutional Tenant Directory ({filteredTenants.length})
          </h2>

          <div className="filter-bar">
            <input
              type="text"
              placeholder="Search academy, slug, email..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="filter-search-input"
            />

            <select
              value={filterPlan}
              onChange={e => setFilterPlan(e.target.value)}
              className="filter-select"
            >
              <option value="all">All Plans</option>
              <option value="starter">Starter Academy (R 25k)</option>
              <option value="growth">Growth Provider (R 45k)</option>
              <option value="pro_plus">Pro+ Enterprise (R 60k)</option>
            </select>

            <select
              value={filterStatus}
              onChange={e => setFilterStatus(e.target.value)}
              className="filter-select"
            >
              <option value="all">All Statuses</option>
              <option value="active">Active Only</option>
              <option value="suspended">Suspended Only</option>
            </select>
          </div>
        </div>

        {/* Tenant Table */}
        <div className="platform-table-card">
          <div className="table-responsive">
            <table className="platform-table">
              <thead>
                <tr>
                  <th>Institution / Subdomain</th>
                  <th>Subscription Tier</th>
                  <th>Learner Quota Usage</th>
                  <th>Monthly Billing (ZAR)</th>
                  <th>Status</th>
                  <th style={{ textAlign: 'right' }}>Administrative Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredTenants.map(t => {
                  const quotaPercent = Math.min(100, Math.round((t.active_learners / t.max_learners) * 100));
                  return (
                    <tr key={t.id}>
                      {/* Name & Subdomain */}
                      <td>
                        <div className="academy-name-cell">
                          <span className="academy-title">{t.name}</span>
                          <span className="academy-slug">
                            {t.slug}.nexa-transform.com
                            {t.custom_domain && (
                              <span style={{ color: '#10B981', marginLeft: '0.5rem' }}>
                                • {t.custom_domain}
                              </span>
                            )}
                          </span>
                        </div>
                      </td>

                      {/* Tier Badge */}
                      <td>
                        <span className={`plan-badge plan-${t.plan_code}`}>
                          {t.plan_name}
                        </span>
                      </td>

                      {/* Quota Progress */}
                      <td>
                        <div className="quota-box">
                          <div className="quota-label">
                            <span>{t.active_learners.toLocaleString('en-ZA')}</span>
                            <span>/ {t.max_learners.toLocaleString('en-ZA')}</span>
                          </div>
                          <div className="quota-track">
                            <div
                              className={`quota-fill ${quotaPercent > 90 ? 'high' : ''}`}
                              style={{ width: `${quotaPercent}%` }}
                            />
                          </div>
                        </div>
                      </td>

                      {/* Billing Amount */}
                      <td>
                        <div style={{ fontWeight: 700, color: '#F8FAFC' }}>
                          R {t.monthly_price_zar.toLocaleString('en-ZA')} <span style={{ fontSize: '0.75rem', color: '#64748B' }}>/ mo</span>
                        </div>
                        <div style={{ fontSize: '0.7rem', color: '#94A3B8', textTransform: 'capitalize' }}>
                          {t.billing_cycle} billing
                        </div>
                      </td>

                      {/* Status */}
                      <td>
                        {t.is_suspended ? (
                          <div>
                            <span className="status-pill status-suspended">
                              <Lock style={{ width: 12, height: 12 }} />
                              Suspended
                            </span>
                            {t.suspension_reason && (
                              <div style={{ fontSize: '0.68rem', color: '#F87171', marginTop: '0.25rem', maxWidth: '160px' }}>
                                {t.suspension_reason}
                              </div>
                            )}
                          </div>
                        ) : (
                          <span className="status-pill status-active">
                            <CheckCircle2 style={{ width: 12, height: 12 }} />
                            Active
                          </span>
                        )}
                      </td>

                      {/* Actions */}
                      <td style={{ textAlign: 'right' }}>
                        <div className="table-actions" style={{ justifyContent: 'flex-end' }}>
                          <button
                            type="button"
                            onClick={() => {
                              setSelectedTenant(t);
                              setTargetPlan(t.plan_code);
                              setPlanModalOpen(true);
                            }}
                            className="platform-btn platform-btn-secondary"
                            style={{ padding: '0.4rem 0.75rem', fontSize: '0.78rem' }}
                          >
                            Tier
                          </button>

                          {t.is_suspended ? (
                            <button
                              type="button"
                              onClick={() => {
                                setSelectedTenant(t);
                                setActionType('reactivate');
                                setKillModalOpen(true);
                              }}
                              className="platform-btn platform-btn-success"
                              style={{ padding: '0.4rem 0.75rem', fontSize: '0.78rem' }}
                            >
                              Reactivate
                            </button>
                          ) : (
                            <button
                              type="button"
                              onClick={() => {
                                setSelectedTenant(t);
                                setActionType('suspend');
                                setKillReason('');
                                setKillModalOpen(true);
                              }}
                              className="platform-btn platform-btn-danger"
                              style={{ padding: '0.4rem 0.75rem', fontSize: '0.78rem' }}
                            >
                              <PowerOff style={{ width: 14, height: 14 }} />
                              Kill-Switch
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Master Kill-Switch Confirmation Modal */}
        {killModalOpen && selectedTenant && (
          <div className="modal-overlay">
            <div className="modal-dialog">
              <div className="modal-header">
                <h3>
                  {actionType === 'suspend' ? 'Execute Master Kill-Switch' : 'Reactivate Institution'}
                </h3>
              </div>

              {actionType === 'suspend' ? (
                <>
                  <div className="modal-warning-box">
                    <AlertTriangle style={{ width: 18, height: 18, marginBottom: '0.25rem', display: 'block' }} />
                    <strong>Immediate Access Revocation:</strong> Suspending <strong>{selectedTenant.name}</strong> will instantly lock out all enrolled students, facilitators, and campus administrators. Their portal will display a branded suspension notice with billing contact details.
                  </div>

                  <div className="modal-form-group">
                    <label>Mandatory Audit Reason for Suspension *</label>
                    <textarea
                      className="modal-textarea"
                      placeholder="e.g. Overdue payment for Invoice #INV-2026-088 (30 days past due) or SETA audit hold."
                      value={killReason}
                      onChange={e => setKillReason(e.target.value)}
                    />
                  </div>
                </>
              ) : (
                <div style={{ color: '#E2E8F0', fontSize: '0.9rem', marginBottom: '1.5rem', lineHeight: 1.5 }}>
                  Are you sure you want to reactivate <strong>{selectedTenant.name}</strong>? All learner portals, marking gradebooks, and automated stipend disbursements will resume immediately.
                </div>
              )}

              <div className="modal-footer">
                <button
                  type="button"
                  className="platform-btn platform-btn-secondary"
                  onClick={() => setKillModalOpen(false)}
                >
                  Cancel
                </button>

                <button
                  type="button"
                  className={`platform-btn ${actionType === 'suspend' ? 'platform-btn-danger' : 'platform-btn-success'}`}
                  onClick={executeKillSwitch}
                >
                  {actionType === 'suspend' ? 'Confirm Immediate Suspension' : 'Confirm Reactivation'}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Plan Upgrade / Override Modal */}
        {planModalOpen && selectedTenant && (
          <div className="modal-overlay">
            <div className="modal-dialog">
              <div className="modal-header">
                <h3>Manage Subscription Plan</h3>
              </div>

              <div style={{ fontSize: '0.875rem', color: '#94A3B8', marginBottom: '1.25rem' }}>
                Adjusting plan for <strong>{selectedTenant.name}</strong>. This updates their active learner limits, white-label permissions, and monthly billing record.
              </div>

              <div className="modal-form-group">
                <label>Select Subscription Tier</label>
                <select
                  value={targetPlan}
                  onChange={e => setTargetPlan(e.target.value)}
                  className="filter-select"
                  style={{ width: '100%' }}
                >
                  <option value="starter">Starter Academy (R 25,000 / mo | &lt; 1,000 Learners)</option>
                  <option value="growth">Growth Provider (R 45,000 / mo | 1,000 - 1,500 Learners)</option>
                  <option value="pro_plus">Pro+ Enterprise (R 60,000 / mo | 1,500+ Learners)</option>
                </select>
              </div>

              <div className="modal-footer">
                <button
                  type="button"
                  className="platform-btn platform-btn-secondary"
                  onClick={() => setPlanModalOpen(false)}
                >
                  Cancel
                </button>

                <button
                  type="button"
                  className="platform-btn platform-btn-primary"
                  onClick={executePlanChange}
                >
                  Save Tier Update
                </button>
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};
