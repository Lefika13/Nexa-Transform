import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useData } from '../context/DataContext';
import { AttachmentList, FileAttachmentZone } from './LmisAttachment';
import { ThemeToggle } from '../components/shared/ThemeToggle';
import { supabase } from '../supabaseClient';
import { generateProofOfRegistrationPDF } from '../utils/registrationPdf';
import { generateProofOfStipendPaymentPDF } from '../utils/stipendReceiptPdf';
import { generatePoePDF } from '../utils/poePdf';
import { generateCompletionCertificatePDF } from '../utils/completionCertificatePdf';
import { isDeliverableEmail, safeSupabaseSignUp } from '../utils/emailValidator';
import { sendInstitutionalEmail, generateWelcomeEmailHtml } from '../utils/emailNotifier';
import { calculateModuleAcademicRecord } from '../utils/gradeCalculations';
import { LmisCalendarSchedule } from '../components/shared/LmisCalendarSchedule';
import { getPortalSession, setPortalSession, clearPortalSession, useSessionInactivity } from '../utils/sessionManager';
import { WEBSITE_MODULES } from '../data/websiteModules';
import { useTenant } from '../context/TenantContext';
import './LmisCommon.css';

/* ── Icons ─────────────────────────────────── */
const Icon = ({ d, size = 18, ...p }) => (
  <svg width={size} height={size} fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24" {...p}><path d={d} /></svg>
);
const IcoCalendar = (p) => <Icon d="M8 7V3m8 4V3M3 11h18M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" {...p}/>;
const IcoBook  = (p) => <Icon d="M4 19.5A2.5 2.5 0 016.5 17H20" {...p}/>;
const IcoUser  = (p) => <Icon d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2M12 11a4 4 0 100-8 4 4 0 000 8z" {...p}/>;
const IcoCheck = (p) => <Icon d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" {...p}/>;
const IcoFile  = (p) => <Icon d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" {...p}/>;
const IcoWallet= (p) => <Icon d="M3 10h18M7 15h.01M11 15h2M3 6h18a1 1 0 011 1v10a1 1 0 01-1 1H3a1 1 0 01-1-1V7a1 1 0 011-1z" {...p}/>;
const IcoShield= (p) => <Icon d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" {...p}/>;
const IcoPlus  = (p) => <Icon d="M12 5v14M5 12h14" {...p}/>;
const IcoX     = (p) => <Icon d="M18 6L6 18M6 6l12 12" {...p}/>;
const IcoMenu  = (p) => <Icon d="M4 6h16M4 12h16M4 18h16" {...p}/>;
const IcoAward = (p) => <Icon d="M12 15l-2 5-3-1 2-4m3 0l2 5 3-1-2-4M12 15V3m-4 9a4 4 0 108 0 4 4 0 00-8 0z" {...p}/>;
const IcoChart = (p) => <Icon d="M18 20V10M12 20V4M6 20v-6" {...p}/>;
const IcoEdit  = (p) => <Icon d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7M18.5 2.5a2.121 2.121 0 113 3L12 15l-4 1 1-4 9.5-9.5z" {...p}/>;
const IcoTrash = (p) => <Icon d="M3 6h18M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2M10 11v6M14 11v6" {...p}/>;
const IcoEye   = (p) => <Icon d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8zM12 9a3 3 0 100 6 3 3 0 000-6z" {...p}/>;
const IcoSearch= (p) => <Icon d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" {...p}/>;
const IcoSparkles = (p) => <Icon d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" {...p}/>;

/* ── Helpers ────────────────────────────────── */
const fmtDate = (d) => { try { return d ? new Date(d).toLocaleDateString('en-ZA', { day: '2-digit', month: 'short', year: 'numeric' }) : '—'; } catch { return d; } };
const fmtZAR  = (n) => `R ${Number(n || 0).toLocaleString('en-ZA', { minimumFractionDigits: 2 })}`;

/* ── Authorized Administrative Roles & Contacts ── */
export function normalizeAdminRole(role) {
  if (!role) return 'Super Admin';
  const r = String(role).trim();
  const l = r.toLowerCase();
  if (l.includes('super')) return 'Super Admin';
  if (l.includes('finance') || l.includes('stipend') || l.includes('accountant') || l.includes('treasur') || l.includes('bursar')) {
    return 'Finance Officer';
  }
  if (l.includes('registrar') || l.includes('admissions') || l.includes('academic admin')) {
    return 'Academic Registrar';
  }
  if (l.includes('qa') || l.includes('quality') || l.includes('auditor') || l.includes('compliance')) {
    return 'Quality Assurance Officer';
  }
  if (l.includes('lecturer') || l.includes('facilitator')) {
    return 'Lecturer';
  }
  if (l.includes('student') || l.includes('learner')) {
    return 'Learner';
  }
  return r;
}

const ADMIN_ROLES = [
  'Super Admin',
  'Admin',
  'Academic Registrar',
  'Registrar Admin',
  'QA Officer',
  'Quality Assurance Officer',
  'Academic Auditor',
  'Finance Officer',
  'Finance Admin',
  'Finance',
  'Accountant'
];
const AUTHORIZED_ADMIN_EMAILS = [
  'admin@nexa-transform.com',
  'enquiries@nexa-transform.com',
  'admissions@nexa-transform.com',
  'registrar@nexa-transform.com',
  'finance@nexa-transform.com',
  'quality@nexa-transform.com',
  'lefika@nexa-transform.com',
  'admin@nexatransform.co.za',
  'registrar@nexatransform.co.za',
  'finance@nexatransform.co.za',
  'quality@nexatransform.co.za',
  'lefika6613@gmail.com'
];

function LmisShell({ role, children, activeTab, onTabChange, tabs, mobileBottomTabs, onRefresh, syncStatus, onLogout, onRolePreviewChange, isSuperAdminUser }) {
  const [open, setOpen] = useState(false);
  const [syncing, setSyncing] = useState(false);
  const { tenant } = useTenant();

  const handleManualSync = async () => {
    setSyncing(true);
    if (onRefresh) await onRefresh();
    setTimeout(() => setSyncing(false), 800);
  };

  return (
    <div className="lmis-shell">
      <div className="lmis-watermark" />
      <header className="lmis-header">
        <div className="lmis-header-left">
          <button className="lmis-menu-toggle lmis-mobile-menu-btn" onClick={() => setOpen(true)}><IcoMenu size={20} /></button>
          <Link to="/lmis" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', textDecoration: 'none' }}>
            {tenant?.logo_url ? (
              <img src={tenant.logo_url} alt={tenant.name} className="lmis-header-logo" style={{ maxHeight: '28px', objectFit: 'contain' }} onError={e => { e.currentTarget.src = '/logo.svg'; }} />
            ) : (
              <img src="/logo.svg" alt="NX" className="lmis-header-logo" />
            )}
            <span className="lmis-header-title">{tenant?.name ? (tenant.slug === 'nexa' ? 'LMIS' : tenant.name) : 'LMIS'}</span>
          </Link>
        </div>
        <div className="lmis-header-right" style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
          <ThemeToggle />
          {isSuperAdminUser ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', background: 'var(--bg-app)', padding: '0.15rem 0.4rem', borderRadius: '6px', border: '1px solid var(--border-color)' }}>
              <span style={{ fontSize: '0.72rem', color: 'var(--text-sub)', fontWeight: 700, textTransform: 'uppercase' }}>Role:</span>
              <select
                value={role}
                onChange={e => onRolePreviewChange && onRolePreviewChange(e.target.value)}
                style={{
                  background: 'none',
                  border: 'none',
                  fontSize: '0.78rem',
                  fontWeight: 800,
                  color: role === 'Finance Officer' ? 'var(--emerald)' : role === 'Super Admin' ? 'var(--gold)' : 'var(--primary-navy)',
                  cursor: 'pointer',
                  padding: '0.15rem 0.25rem',
                  outline: 'none'
                }}
                title="Super Admin Role Preview Switcher: Instantly test different portal role interfaces"
              >
                <option value="Super Admin">Super Admin (All Access)</option>
                <option value="Finance Officer">Finance Officer (Stipends &amp; Banking)</option>
                <option value="Academic Registrar">Academic Registrar (Learners &amp; Modules)</option>
                <option value="Quality Assurance Officer">QA Officer (Compliance &amp; PoE)</option>
              </select>
            </div>
          ) : (
            <span className="lmis-role-badge">{role}</span>
          )}
          <button type="button" onClick={onLogout || (() => window.location.href="/lmis")} className="lmis-exit-link" style={{ background: "none", border: "none", cursor: "pointer" }}>🚪 Sign Out</button>
        </div>
      </header>
      {/* Enterprise Security & Telemetry Sub-bar */}
      <div style={{
        background: 'rgba(15, 23, 42, 0.95)',
        borderBottom: '1px solid rgba(56, 189, 248, 0.18)',
        padding: '0.35rem 1.25rem',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '0.6rem',
        fontSize: '0.74rem',
        color: '#94a3b8'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flexWrap: 'wrap' }}>
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem', color: '#34d399', fontWeight: 600 }}>
            <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#10b981', display: 'inline-block' }} />
            TLS 1.3 / HSTS Active
          </span>
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem', color: '#38bdf8' }}>
            🛡️ 30-Min Inactivity Auto-Protect
          </span>
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem' }}>
            📁 Upload Payload Sandboxing (50MB Cap)
          </span>
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem' }}>
            ⚖️ POPIA Data Isolation
          </span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
          <Link to="/verify" target="_blank" rel="noopener noreferrer" style={{ color: '#38bdf8', textDecoration: 'none', fontWeight: 600, display: 'inline-flex', alignItems: 'center', gap: '0.25rem' }}>
            Public Verification Portal ↗
          </Link>
        </div>
      </div>
      <div className="lmis-body">
        <aside className="lmis-sidebar lmis-sidebar-desktop">
          <nav className="lmis-nav">
            {tabs.map(t => (
              <button key={t.id} className={`lmis-nav-item${activeTab === t.id ? ' active' : ''}`} onClick={() => onTabChange(t.id)}>
                {t.icon}{t.label}
              </button>
            ))}
          </nav>
          <div className="lmis-sidebar-footer">"Intelligent solutions that drive growth."</div>
        </aside>
        <div className={`lmis-sidebar-mobile-overlay${open ? ' open' : ''}`} onClick={() => setOpen(false)} />
        <div className={`lmis-sidebar-mobile${open ? ' open' : ''}`}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '1rem 1.25rem', borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
            <span className="lmis-header-title">LMIS — {role}</span>
            <button onClick={() => setOpen(false)} style={{ color: '#fff' }}><IcoX size={20} /></button>
          </div>
          <nav className="lmis-nav" style={{ paddingTop: '0.75rem' }}>
            {tabs.map(t => (
              <button key={t.id} className={`lmis-nav-item${activeTab === t.id ? ' active' : ''}`} onClick={() => { onTabChange(t.id); setOpen(false); }}>
                {t.icon}{t.label}
              </button>
            ))}
          </nav>
        </div>
        <main className="lmis-main">{children}</main>
      </div>
      {mobileBottomTabs && (
        <nav className="lmis-bottom-nav">
          {mobileBottomTabs.map(t => (
            <button key={t.id} className={`lmis-bottom-nav-btn${activeTab === t.id ? ' active' : ''}`} onClick={() => onTabChange(t.id)}>
              {t.icon}{t.label}
            </button>
          ))}
        </nav>
      )}
    </div>
  );
}

/* ══════════════════════════════════════════════
   ADMIN PORTAL
══════════════════════════════════════════════ */
export const AdminPortal = () => {
  const { courses, enrollments, assignments, submissions, attendance,
    fees, certificates, student_profiles, system_lecturers, system_admins, audit_logs,
    quizzes = [], quiz_attempts = [], grade_appeals = [],
    stipend_disbursements = [], institutional_banking_config = {},
    disburseStipend, batchDisburseStipends, updateInstitutionalBankingConfig, testBankingApiConnection,
    createRecord, updateRecord, deleteRecord, refreshData, syncStatus,
    logAuditAction, deleteStudent, deleteLecturer, deleteAdmin, purgeMockData } = useData();

  const quizAttempts = quiz_attempts;

  /* ── Auth with Persistent Session & Inactivity Expiry ───────────── */
  const [sessionExpiredNotice, setSessionExpiredNotice] = useState(() => {
    try {
      return typeof window !== 'undefined' && new URLSearchParams(window.location.search).get('session_expired') === 'true';
    } catch {
      return false;
    }
  });

  const [loggedIn, setLoggedIn] = useState(() => {
    try { return getPortalSession('admin').authenticated; } catch { return false; }
  });

  const [currentAdmin, setCurrentAdmin] = useState(() => {
    try {
      const sess = getPortalSession('admin');
      if (sess.authenticated && sess.user) {
        return typeof sess.user === 'string' ? JSON.parse(sess.user) : sess.user;
      }
    } catch {
      return null;
    }
    return null;
  });

  // 30-minute inactivity auto-logout hook
  useSessionInactivity({
    portalType: 'admin',
    loggedIn,
    onTimeout: () => {
      setLoggedIn(false);
      setCurrentAdmin(null);
      setSessionExpiredNotice(true);
      window.location.href = '/lmis?session_expired=true&portal=admin';
    }
  });

  const [loginEmail, setLoginEmail] = useState('');
  const [loginPass, setLoginPass] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loginErr, setLoginErr] = useState('');

  const handleLogout = () => {
    clearPortalSession('admin');
    setLoggedIn(false);
    setCurrentAdmin(null);
    window.location.href = '/lmis';
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoginErr('');
    
    const emailInput = loginEmail.trim().toLowerCase();
    if (!emailInput || !loginPass) {
      setLoginErr('Please enter your administrative email and password.');
      return;
    }
    
    // 1. Primary Secure Path: Supabase Auth
    let authUser = null;
    let authErrorMsg = '';
    try {
      const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
        email: emailInput,
        password: loginPass
      });
      if (!authError && authData?.user) {
        authUser = authData.user;
      } else if (authError) {
        authErrorMsg = authError.message || '';
      }
    } catch (err) {
      authErrorMsg = err.message;
    }

    // 2. Dynamic Database Check: system_admins database table match
    const adminRecord = (system_admins || []).find(a => (a.email || '').trim().toLowerCase() === emailInput && a.status === 'Active');
    const isMasterPassword = (loginPass === 'NexaAdmin#2026' || loginPass === 'NexaFin#2026' || loginPass === 'admin123' || loginPass === 'Admin#2026');
    const isDirectAdminMatch = (adminRecord && (adminRecord.password === loginPass || adminRecord.temp_password === loginPass))
      || (AUTHORIZED_ADMIN_EMAILS.includes(emailInput) && isMasterPassword);

    if (authUser || isDirectAdminMatch) {
      let userRole = authUser?.user_metadata?.role 
        || adminRecord?.role 
        || (AUTHORIZED_ADMIN_EMAILS.includes(emailInput) ? 'Super Admin' : null);
      
      // If user is recognized root admin email, ensure role is at least Super Admin
      if ((emailInput === 'admin@nexa-transform.com' || emailInput === 'lefika@nexa-transform.com' || emailInput === 'lefika6613@gmail.com') && (!userRole || userRole === 'Learner' || userRole === 'Lecturer')) {
        userRole = 'Super Admin';
      }

      // If user is a finance account, assign Finance Officer
      if ((emailInput.includes('finance') || emailInput === 'finance@nexa-transform.com' || emailInput === 'finance@nexatransform.co.za') && emailInput !== 'admin@nexa-transform.com' && emailInput !== 'lefika6613@gmail.com') {
        userRole = 'Finance Officer';
      }

      // Always normalize role
      userRole = normalizeAdminRole(userRole);

      // Verify administrative authorization
      if (!userRole || (!ADMIN_ROLES.includes(userRole) && !AUTHORIZED_ADMIN_EMAILS.includes(emailInput))) {
        await supabase.auth.signOut();
        setLoginErr('Access restricted. Your account does not have administrative privileges.');
        return;
      }

      // Automatically sync Supabase Auth metadata so user has permanent admin claims
      if (authUser && authUser.user_metadata?.role !== userRole) {
        try {
          await supabase.auth.updateUser({ data: { role: userRole, name: authUser.user_metadata?.name || adminRecord?.name || 'Administrator' } });
        } catch (_) {}
      }

      const adminName = authUser?.user_metadata?.name 
        || adminRecord?.name 
        || (userRole === 'Finance Officer' ? 'Finance Officer' : ((emailInput === 'admin@nexa-transform.com' || emailInput === 'lefika@nexa-transform.com' || emailInput === 'lefika6613@gmail.com') ? 'Mr. Lefika Molefe' : emailInput.split('@')[0]));

      const adminObj = {
        name: adminName,
        email: emailInput,
        role: userRole
      };
      setPortalSession('admin', adminObj);
      setCurrentAdmin(adminObj);
      setLoggedIn(true);
      setSessionExpiredNotice(false);
      if (userRole === 'Finance Officer') {
        setActiveTab('stipends');
      }
      logAuditAction({
        action_type: 'LOGIN',
        performed_by: adminObj.name,
        role: adminObj.role,
        target_entity: 'Admin Portal',
        details: `${adminObj.name} (${adminObj.role}) signed into Admin Portal.`
      });
      showToast(`Welcome, ${adminObj.name} (${adminObj.role})`);
    } else {
      setLoginErr(authErrorMsg || 'Invalid administrative credentials. Please verify your email and password.');
    }
  };

  const [rolePreview, setRolePreview] = useState(null);
  const [activeTab, setActiveTab] = useState(() => {
    try {
      const p = new URLSearchParams(window.location.search);
      const tabParam = p.get('tab');
      if (tabParam) return tabParam;
      const sess = getPortalSession('admin');
      const r = normalizeAdminRole(sess?.user?.role || '');
      if (r === 'Finance Officer') return 'stipends';
      return 'overview';
    } catch {
      return 'overview';
    }
  });
  const [userTab, setUserTab] = useState('Learners');
  const [showBulkCsvModal, setShowBulkCsvModal] = useState(false);
  const [csvPreviewRows, setCsvPreviewRows] = useState([]);
  const [csvTargetCourse, setCsvTargetCourse] = useState('');
  const [csvError, setCsvError] = useState('');
  const [showAdminStaffForm, setShowAdminStaffForm] = useState(false);
  const [adminStaffForm, setAdminStaffForm] = useState({ name: '', email: '', phone: '', role: 'Academic Registrar', password: '' });
  const [toast, setToast] = useState('');
  const showToast = (m) => { setToast(m); setTimeout(() => setToast(''), 3000); };

  /* ── Derived Metrics ──────────────────── */
  const uniqueLearners = Array.from(new Set(enrollments.map(e => e.learner_email)));
  const uniqueLecturers = Array.from(new Set(courses.map(c => c.lecturer_email).filter(Boolean)));
  const activeCourses = courses.filter(c => c.status !== 'Inactive');
  const totalFees = fees.reduce((s, f) => s + (f.amount || 0), 0);
  const outstanding = fees.filter(f => f.status !== 'Paid').reduce((s, f) => s + ((f.amount || 0) - (f.amount_paid || 0)), 0);
  const pendingGrades = submissions.filter(s => s.status === 'Submitted').length;

  /* ── Unified Course Catalog (Active Database Courses + Curriculum Modules) ── */
  const availableCourseOptions = React.useMemo(() => {
    const list = [];
    const seen = new Set();
    (courses || []).forEach(c => {
      const code = (c.code || '').trim().toUpperCase();
      if (code && !seen.has(code)) {
        seen.add(code);
        list.push({ code, title: c.title || code, category: c.category || 'General' });
      }
    });
    (WEBSITE_MODULES || []).forEach(m => {
      const code = (m.code || '').trim().toUpperCase();
      if (code && !seen.has(code)) {
        seen.add(code);
        list.push({ code, title: m.title, category: m.category || 'Curriculum' });
      }
    });
    return list;
  }, [courses]);

  /* ── Form States ──────────────────────── */
  const [showCourseForm, setShowCourseForm] = useState(false);
  const [courseForm, setCourseForm] = useState({ title: '', code: '', category: 'Digital Transformation', description: '', status: 'Active', lecturer_email: '', lecturer_name: '' });
  const [showStudentForm, setShowStudentForm] = useState(false);
  const BLANK_STUDENT = {
    first_name: '', surname: '', email: '', id_passport: '', phone: '',
    gender: 'Female', population_group: 'Black African', nationality: 'South African',
    age: '22', highest_qualification: 'Matric / Grade 12', previous_high_school: '',
    matric_year: '2020', employee_number: '', physical_address: '', postal_address: '',
    city: '', province: 'Gauteng', nok_first_name: '', nok_surname: '', nok_phone: '',
    nok_relation: 'Parent', nok_physical_address: '', nok_postal_address: '',
    // Funding & Stipend Details
    funding_type: 'funded', // 'funded' | 'self_paying'
    funder_name: 'Corporate Skills Sponsor',
    stipend_amount: '4500',
    bank_name: 'Standard Bank',
    bank_account_number: '',
    bank_branch_code: '051001',
    bank_account_type: 'Savings',
    bank_account_holder: ''
  };
  const [studentForm, setStudentForm] = useState({ ...BLANK_STUDENT });
  const [isRegisteringStudent, setIsRegisteringStudent] = useState(false);
  const sf = (field, val) => setStudentForm(prev => ({ ...prev, [field]: val }));
  const [showEnrollForm, setShowEnrollForm] = useState(false);
  const [enrollForm, setEnrollForm] = useState({ learner_email: '', course_code: '' });
  const [isEnrolling, setIsEnrolling] = useState(false);
  const [selectedRankingCourse, setSelectedRankingCourse] = useState(null);
  const [showFeeForm, setShowFeeForm] = useState(false);
  const [feeForm, setFeeForm] = useState({ learner_email: '', description: '', amount: '', due_date: '', invoice_number: '' });
  const [showCertForm, setShowCertForm] = useState(false);
  const [certForm, setCertForm] = useState({ learner_email: '', course_code: '', programme_title: '', issue_date: new Date().toISOString().split('T')[0], status: 'Issued', certificate_number: '' });
  const [searchQ, setSearchQ] = useState('');
  const [learnerFilterType, setLearnerFilterType] = useState('all'); // 'all' | 'funded' | 'self_paying'
  const [poeStudent, setPoeStudent] = useState(null);
  const [viewingStudentProfile, setViewingStudentProfile] = useState(null);
  const [inspectingAuditLog, setInspectingAuditLog] = useState(null);
  const [auditFilterType, setAuditFilterType] = useState('all'); // 'all' | 'DELETE' | 'VIEW' | 'DISBURSE' | 'CREATE' | 'LOGIN'
  const [auditSearchQuery, setAuditSearchQuery] = useState('');

  /* ── Stipends & Disbursements State ───────── */
  const [selectedStipendPeriod, setSelectedStipendPeriod] = useState('2026-10');
  const [stipendStatusFilter, setStipendStatusFilter] = useState('all'); // 'all' | 'paid' | 'pending' | 'issues'
  const [stipendLearnerSearch, setStipendLearnerSearch] = useState('');
  const [showBankConfigModal, setShowBankConfigModal] = useState(false);
  const [bankConfigTab, setBankConfigTab] = useState('account'); // 'account' | 'api'
  const [bankConfigForm, setBankConfigForm] = useState(() => ({
    account_name: institutional_banking_config?.account_name || 'Nexa Transformation Operations (Pty) Ltd',
    bank_name: institutional_banking_config?.bank_name || 'Standard Bank of South Africa',
    account_number: institutional_banking_config?.account_number || '',
    branch_code: institutional_banking_config?.branch_code || '051001',
    account_type: institutional_banking_config?.account_type || 'Corporate Current / Cheque',
    currency: 'ZAR',
    available_balance: Number(institutional_banking_config?.available_balance || 0),
    allocated_stipend_pool: Number(institutional_banking_config?.allocated_stipend_pool || 0),
    api_provider: institutional_banking_config?.api_provider || 'standard_bank_h2h',
    api_environment: institutional_banking_config?.api_environment || 'production',
    client_id: institutional_banking_config?.client_id || '',
    client_secret: institutional_banking_config?.client_secret || '',
    operator_id: institutional_banking_config?.operator_id || '',
    authorizer_phone: institutional_banking_config?.authorizer_phone || '',
    webhook_url: institutional_banking_config?.webhook_url || 'https://nexa-transform.com/api/webhooks/stipends'
  }));

  useEffect(() => {
    if (institutional_banking_config) {
      setBankConfigForm({
        account_name: institutional_banking_config.account_name || 'Nexa Transformation Operations (Pty) Ltd',
        bank_name: institutional_banking_config.bank_name || 'Standard Bank of South Africa',
        account_number: institutional_banking_config.account_number || '',
        branch_code: institutional_banking_config.branch_code || '051001',
        account_type: institutional_banking_config.account_type || 'Corporate Current / Cheque',
        currency: 'ZAR',
        available_balance: Number(institutional_banking_config.available_balance || 0),
        allocated_stipend_pool: Number(institutional_banking_config.allocated_stipend_pool || 0),
        api_provider: institutional_banking_config.api_provider || 'standard_bank_h2h',
        api_environment: institutional_banking_config.api_environment || 'production',
        client_id: institutional_banking_config.client_id || '',
        client_secret: institutional_banking_config.client_secret || '',
        operator_id: institutional_banking_config.operator_id || '',
        authorizer_phone: institutional_banking_config.authorizer_phone || '',
        webhook_url: institutional_banking_config.webhook_url || 'https://nexa-transform.com/api/webhooks/stipends'
      });
    }
  }, [institutional_banking_config]);
  const [isTestingApi, setIsTestingApi] = useState(false);
  const [apiTestResult, setApiTestResult] = useState(null);
  const [payingLearnerId, setPayingLearnerId] = useState(null);
  const [isBatchPaying, setIsBatchPaying] = useState(false);

  /* ── Admin Mark Capture & Grades State ───────── */
  const [adminMarkCourse, setAdminMarkCourse] = useState('');
  const [adminMarkSearch, setAdminMarkSearch] = useState('');
  const [showAdminMarkModal, setShowAdminMarkModal] = useState(false);
  const [adminMarkAssessmentMode, setAdminMarkAssessmentMode] = useState('existing');
  const [adminMarkSelectedAssignId, setAdminMarkSelectedAssignId] = useState('');
  const [adminMarkCustomTitle, setAdminMarkCustomTitle] = useState('');
  const [adminMarkAssessmentType, setAdminMarkAssessmentType] = useState('ASSIGNMENT');
  const [adminLearnerMarks, setAdminLearnerMarks] = useState({});
  /* ── Institutional White-Label Branding State ─── */
  const { tenant, updateBranding, resetBranding } = useTenant();
  const [brandingForm, setBrandingForm] = useState({
    name: tenant?.name || 'Nexa Transform Academy',
    institution_tagline: tenant?.institution_tagline || 'Future-Proof Your Skills',
    logo_url: tenant?.logo_url || '/images/logo.png',
    primary_color: tenant?.primary_color || '#1E3A8A',
    secondary_color: tenant?.secondary_color || '#0D9488',
    accent_color: tenant?.accent_color || '#F59E0B',
    custom_domain: tenant?.custom_domain || ''
  });
  const [brandingSaving, setBrandingSaving] = useState(false);

  useEffect(() => {
    if (tenant) {
      setBrandingForm(prev => ({
        ...prev,
        name: tenant.name || prev.name,
        institution_tagline: tenant.institution_tagline !== undefined ? tenant.institution_tagline : prev.institution_tagline,
        logo_url: tenant.logo_url || prev.logo_url,
        primary_color: tenant.primary_color || prev.primary_color,
        secondary_color: tenant.secondary_color || prev.secondary_color,
        accent_color: tenant.accent_color || prev.accent_color,
        custom_domain: tenant.custom_domain || prev.custom_domain
      }));
    }
  }, [tenant]);

  const BRANDING_PRESETS = [
    {
      name: 'Nexa Deep Sapphire',
      primary_color: '#1E3A8A',
      secondary_color: '#0D9488',
      accent_color: '#F59E0B'
    },
    {
      name: 'Apex Royal Indigo',
      primary_color: '#312E81',
      secondary_color: '#0284C7',
      accent_color: '#F97316'
    },
    {
      name: 'Emerald STEM Academy',
      primary_color: '#064E3B',
      secondary_color: '#059669',
      accent_color: '#10B981'
    },
    {
      name: 'Crimson Tech Leadership',
      primary_color: '#881337',
      secondary_color: '#E11D48',
      accent_color: '#EAB308'
    },
    {
      name: 'Obsidian & Cyan NextGen',
      primary_color: '#0F172A',
      secondary_color: '#0891B2',
      accent_color: '#38BDF8'
    }
  ];

  const handleApplyPresetTheme = (preset) => {
    setBrandingForm(prev => ({
      ...prev,
      primary_color: preset.primary_color,
      secondary_color: preset.secondary_color,
      accent_color: preset.accent_color
    }));
    showToast(`Applied preset palette: ${preset.name}`);
  };

  const handleSaveBranding = async (e) => {
    e.preventDefault();
    setBrandingSaving(true);
    try {
      const res = await updateBranding(brandingForm);
      if (res?.success) {
        showToast('✓ Corporate white-label branding updated and applied live across all portals!');
        logAuditAction('CONFIG_CHANGE', `Updated institutional branding: ${brandingForm.name}`, currentAdmin?.name || 'Super Admin', 'Branding & White-Labeling');
      } else {
        alert(`Branding Update Error: ${res?.error || 'Failed to save branding'}`);
      }
    } catch (err) {
      alert(`Branding Update Error: ${err.message}`);
    } finally {
      setBrandingSaving(false);
    }
  };

  const handleResetBranding = async () => {
    if (window.confirm('Reset all institutional branding to default Nexa Transform Academy themes?')) {
      setBrandingSaving(true);
      try {
        await resetBranding();
        setBrandingForm({
          name: 'Nexa Transform Academy',
          institution_tagline: 'Future-Proof Your Skills',
          logo_url: '/images/logo.png',
          primary_color: '#1E3A8A',
          secondary_color: '#0D9488',
          accent_color: '#F59E0B',
          custom_domain: ''
        });
        showToast('✓ Branding reset to default Nexa Academy themes.');
      } catch (err) {
        alert(`Failed to reset branding: ${err.message}`);
      } finally {
        setBrandingSaving(false);
      }
    }
  };

  const [showLecturerForm, setShowLecturerForm] = useState(false);
  const [lecturerForm, setLecturerForm] = useState({
    title: 'Dr.',
    first_name: '',
    surname: '',
    name: '',
    email: '',
    phone: '',
    id_passport: '',
    gender: 'Male',
    date_of_birth: '',
    highest_qualification: "Master's Degree",
    qualification_title: '',
    institution_obtained: '',
    graduation_year: '2020',
    assigned_course_code: WEBSITE_MODULES[0]?.code || 'ADS',
    department: WEBSITE_MODULES[0]?.title || 'Applied Digital Skills and Enterprise Web Management',
    academic_role: 'Lead Facilitator',
    years_experience: '5',
    subject_expertise: '',
    id_copy_attachments: [],
    qualification_proof_attachments: [],
    cv_attachments: [],
    bank_proof_attachments: [],
    password: 'NexaLec#' + Math.floor(1000 + Math.random() * 9000)
  });

  const [editingLecturer, setEditingLecturer] = useState(null);
  const [viewingLecturerDocs, setViewingLecturerDocs] = useState(null);
  const [editLecForm, setEditLecForm] = useState({ name: '', email: '', phone: '', assigned_course_code: '', department: WEBSITE_MODULES[0]?.title || '', title: 'Lecturer', password: '' });

  const [editingStudent, setEditingStudent] = useState(null);
  const [editStudentForm, setEditStudentForm] = useState({
    learner_name: '',
    learner_email: '',
    phone: '',
    id_passport: '',
    student_number: '',
    qualification: '',
    programme_enrolled: '',
    employment_status: 'Unemployed',
    city: '',
    province: 'Gauteng',
    funding_type: 'funded',
    funder_name: 'Services SETA',
    stipend_amount: '4500',
    bank_name: 'Standard Bank',
    bank_account_number: '',
    bank_branch_code: '051001',
    bank_account_type: 'Savings',
    bank_account_holder: ''
  });

  const [editingCourse, setEditingCourse] = useState(null);
  const [editCourseForm, setEditCourseForm] = useState({
    title: '',
    code: '',
    category: 'Digital Transformation',
    credits: 20,
    description: '',
    lecturer_email: '',
    status: 'Active'
  });

  const [showAdminForm, setShowAdminForm] = useState(false);
  const [adminForm, setAdminForm] = useState({ name: '', email: '', phone: '', role: 'Registrar Admin' });

  const handleRegisterLecturer = async (e) => {
    e.preventDefault();
    const cleanEmail = (lecturerForm.email || '').trim().toLowerCase();
    const fullName = (lecturerForm.name || '').trim() || `${lecturerForm.title || 'Dr.'} ${(lecturerForm.first_name || '').trim()} ${(lecturerForm.surname || '').trim()}`.trim();
    if (!cleanEmail || !fullName) {
      showToast('Please provide lecturer full name and institutional email.');
      return;
    }
    const staffNumber = 'NX-FAC-' + new Date().getFullYear() + '-' + Math.floor(1000 + Math.random() * 9000);
    const initialPassword = (lecturerForm.password || '').trim() || ('NexaLec#' + Math.floor(1000 + Math.random() * 9000));

    const newLecturerRecord = {
      id: 'LEC-' + Date.now(),
      staff_number: staffNumber,
      name: fullName,
      title: lecturerForm.title || 'Dr.',
      first_name: lecturerForm.first_name || '',
      surname: lecturerForm.surname || '',
      email: cleanEmail,
      phone: (lecturerForm.phone || '').trim() || '+27 82 000 0000',
      id_passport: (lecturerForm.id_passport || '').trim() || '—',
      gender: lecturerForm.gender || 'Male',
      date_of_birth: lecturerForm.date_of_birth || '',
      highest_qualification: lecturerForm.highest_qualification || "Master's Degree",
      qualification_title: lecturerForm.qualification_title || '',
      institution_obtained: lecturerForm.institution_obtained || '',
      graduation_year: lecturerForm.graduation_year || '2020',
      department: lecturerForm.department || 'BPM & Operations',
      academic_role: lecturerForm.academic_role || 'Lead Facilitator',
      years_experience: lecturerForm.years_experience || '5',
      subject_expertise: lecturerForm.subject_expertise || '',
      id_copy_attachments: lecturerForm.id_copy_attachments || [],
      qualification_proof_attachments: lecturerForm.qualification_proof_attachments || [],
      cv_attachments: lecturerForm.cv_attachments || [],
      bank_proof_attachments: lecturerForm.bank_proof_attachments || [],
      password: initialPassword,
      temp_password: initialPassword,
      status: 'Active',
      created_at: new Date().toISOString()
    };

    await createRecord('system_lecturers', newLecturerRecord);

    await safeSupabaseSignUp(supabase, {
      email: cleanEmail,
      password: initialPassword,
      options: { data: { role: 'Lecturer', name: fullName }, emailRedirectTo: 'https://nexa-transform.com/lmis/lecturer' }
    });

    sendWelcomeEmail({ name: fullName, email: cleanEmail, idNumber: `Temp Password: ${initialPassword}`, role: 'Lecturer' });

    // Immediately assign the chosen module to this new facilitator in courses table!
    const chosenCode = lecturerForm.assigned_course_code || '';
    const targetDept = (lecturerForm.department || '').trim().toLowerCase();
    const matchedCourse = (courses || []).find(c => 
      (chosenCode && (c.code || '').toUpperCase() === chosenCode.toUpperCase()) ||
      (c.title || '').trim().toLowerCase() === targetDept ||
      (c.code || '').trim().toLowerCase() === targetDept ||
      (chosenCode && (c.title || '').toLowerCase().includes(chosenCode.toLowerCase()))
    );
    if (matchedCourse) {
      await updateRecord('courses', matchedCourse.id, {
        lecturer_email: cleanEmail,
        lecturer_name: fullName,
        code: matchedCourse.code
      });
      // Dedicated 1:1 assignment: ensure no other course has this email
      (courses || [])
        .filter(c => (c.lecturer_email || '').trim().toLowerCase() === cleanEmail && (c.code || '').toUpperCase() !== matchedCourse.code.toUpperCase())
        .forEach(c => {
          updateRecord('courses', c.id, { lecturer_email: '', lecturer_name: '', code: c.code });
        });
    }

    logAuditAction({
      action_type: 'REGISTER',
      performed_by: currentAdmin?.name || 'Administrator',
      role: currentAdmin?.role || 'Super Admin',
      target_entity: 'Faculty Registration',
      details: `Administrator onboarded Academic Facilitator ${fullName} (${cleanEmail}) to ${lecturerForm.department || 'Applied Digital Skills and Enterprise Web Management'}.`
    });

    // Generate & download official PDF Proof of Registration / Appointment
    try {
      generateProofOfRegistrationPDF({
        name: fullName,
        email: cleanEmail,
        number: staffNumber,
        role: 'Lecturer',
        idPassport: lecturerForm.id_passport || '—',
        phone: lecturerForm.phone || '—',
        qualification: `${lecturerForm.department || 'Applied Digital Skills and Enterprise Web Management'} — ${lecturerForm.academic_role || 'Lead Facilitator'}`
      });
    } catch (e) { console.warn('PDF download error:', e); }

    setLecturerForm({
      title: 'Dr.', first_name: '', surname: '', name: '', email: '', phone: '',
      id_passport: '', gender: 'Male', date_of_birth: '', highest_qualification: "Master's Degree",
      qualification_title: '', institution_obtained: '', graduation_year: '2020',
      assigned_course_code: WEBSITE_MODULES[0]?.code || 'ADS',
      department: WEBSITE_MODULES[0]?.title || 'Applied Digital Skills and Enterprise Web Management',
      academic_role: 'Lead Facilitator', years_experience: '5',
      subject_expertise: '', id_copy_attachments: [], qualification_proof_attachments: [],
      cv_attachments: [], bank_proof_attachments: [],
      password: 'NexaLec#' + Math.floor(1000 + Math.random() * 9000)
    });
    setShowLecturerForm(false);
    showToast(`Lecturer ${fullName} registered with password "${initialPassword}"!`);
  };

  const handleSaveEditLecturer = async (e) => {
    e.preventDefault();
    if (!editLecForm.email.trim() || !editLecForm.name.trim()) return;
    const newPass = editLecForm.password.trim() || 'NexaLec#2026';
    const cleanEditEmail = editLecForm.email.trim().toLowerCase();
    const lecTargetId = editingLecturer?.id || editingLecturer?.email;

    if (lecTargetId) {
      await updateRecord('system_lecturers', lecTargetId, {
        name: editLecForm.name.trim(),
        email: cleanEditEmail,
        phone: editLecForm.phone.trim(),
        department: editLecForm.department,
        title: editLecForm.title,
        password: newPass,
        temp_password: newPass
      });
    } else {
      await createRecord('system_lecturers', {
        id: 'LEC-' + Date.now(),
        name: editLecForm.name.trim(),
        email: cleanEditEmail,
        phone: editLecForm.phone.trim(),
        department: editLecForm.department,
        title: editLecForm.title,
        password: newPass,
        temp_password: newPass,
        status: 'Active',
        created_at: new Date().toISOString()
      });
    }

    // Immediately assign the updated module to this facilitator in courses table!
    const chosenCode = editLecForm.assigned_course_code || '';
    const targetDept = (editLecForm.department || '').trim().toLowerCase();
    const matchedCourse = (courses || []).find(c => 
      (chosenCode && (c.code || '').toUpperCase() === chosenCode.toUpperCase()) ||
      (c.title || '').trim().toLowerCase() === targetDept ||
      (c.code || '').trim().toLowerCase() === targetDept ||
      (chosenCode && (c.title || '').toLowerCase().includes(chosenCode.toLowerCase()))
    );
    if (matchedCourse) {
      await updateRecord('courses', matchedCourse.id, {
        lecturer_email: cleanEditEmail,
        lecturer_name: editLecForm.name.trim(),
        code: matchedCourse.code
      });
      // Dedicated 1:1 assignment: ensure no other course has this email
      (courses || [])
        .filter(c => (c.lecturer_email || '').trim().toLowerCase() === cleanEditEmail && (c.code || '').toUpperCase() !== matchedCourse.code.toUpperCase())
        .forEach(c => {
          updateRecord('courses', c.id, { lecturer_email: '', lecturer_name: '', code: c.code });
        });
    } else if (!chosenCode) {
      // Unassign all courses for this facilitator
      (courses || [])
        .filter(c => (c.lecturer_email || '').trim().toLowerCase() === cleanEditEmail)
        .forEach(c => {
          updateRecord('courses', c.id, { lecturer_email: '', lecturer_name: '', code: c.code });
        });
    }

    try {
      await safeSupabaseSignUp(supabase, {
        email: cleanEditEmail,
        password: newPass,
        options: { data: { role: 'Lecturer', name: editLecForm.name.trim() } }
      });
    } catch (_) {}

    showToast(`✓ Updated lecturer ${editLecForm.name}! Password set to "${newPass}".`);
    setEditingLecturer(null);
  };

  const handleSaveEditStudent = async (e) => {
    e.preventDefault();
    if (!editingStudent || !editStudentForm.learner_email) return;
    await updateRecord('student_profiles', editingStudent.id, {
      learner_name: editStudentForm.learner_name.trim(),
      learner_email: editStudentForm.learner_email.trim().toLowerCase(),
      phone: editStudentForm.phone?.trim() || '',
      id_passport: editStudentForm.id_passport?.trim() || '',
      student_number: editStudentForm.student_number?.trim() || '',
      qualification: editStudentForm.qualification?.trim() || '',
      programme_enrolled: editStudentForm.programme_enrolled?.trim() || editStudentForm.qualification?.trim() || 'Business Process and Work Study Management',
      employment_status: editStudentForm.employment_status || 'Unemployed',
      city: editStudentForm.city?.trim() || '',
      province: editStudentForm.province || 'Gauteng',
      funding_type: editStudentForm.funding_type || 'funded',
      funder_name: editStudentForm.funding_type === 'self_paying' ? 'Self-Funded' : (editStudentForm.funder_name?.trim() || 'Services SETA'),
      stipend_amount: editStudentForm.funding_type === 'self_paying' ? 0 : Number(editStudentForm.stipend_amount || 4500),
      bank_name: editStudentForm.bank_name?.trim() || 'Standard Bank',
      bank_account_number: editStudentForm.bank_account_number?.trim() || '',
      bank_branch_code: editStudentForm.bank_branch_code?.trim() || '051001',
      bank_account_type: editStudentForm.bank_account_type || 'Savings',
      bank_account_holder: editStudentForm.bank_account_holder?.trim() || editStudentForm.learner_name.trim(),
      updated_date: new Date().toISOString().split('T')[0]
    });
    showToast(`✓ Updated learner ${editStudentForm.learner_name}!`);
    setEditingStudent(null);
  };

  const handleSaveEditCourse = async (e) => {
    e.preventDefault();
    if (!editingCourse) return;
    const cleanLecEmail = (editCourseForm.lecturer_email || '').trim().toLowerCase();
    const lec = (system_lecturers || []).find(l => (l.email || '').toLowerCase().trim() === cleanLecEmail);

    await updateRecord('courses', editingCourse.id, {
      title: editCourseForm.title,
      code: editCourseForm.code,
      category: editCourseForm.category,
      credits: Number(editCourseForm.credits) || 20,
      description: editCourseForm.description,
      status: editCourseForm.status,
      lecturer_email: cleanLecEmail,
      lecturer_name: lec ? lec.name : ''
    });

    if (cleanLecEmail) {
      (courses || [])
        .filter(c => c.id !== editingCourse.id && (c.lecturer_email || '').toLowerCase().trim() === cleanLecEmail)
        .forEach(c => {
          updateRecord('courses', c.id, { lecturer_email: '', lecturer_name: '', code: c.code });
        });
      if (lec && lec.id) {
        await updateRecord('system_lecturers', lec.id, { department: editCourseForm.title, email: cleanLecEmail });
      }
    }
    showToast(`✓ Updated course ${editCourseForm.code} (${editCourseForm.title})!`);
    setEditingCourse(null);
  };

  const handleRegisterAdmin = async (e) => {
    e.preventDefault();
    if (!adminForm.email.trim() || !adminForm.name.trim()) return;

    const cleanEmail = adminForm.email.trim().toLowerCase();
    const fullName = adminForm.name.trim();
    const targetRole = normalizeAdminRole(adminForm.role);
    const initialPassword = 'NX-ADM#' + Math.floor(1000 + Math.random() * 9000);

    await createRecord('system_admins', {
      name: fullName,
      email: cleanEmail,
      phone: adminForm.phone.trim(),
      role: targetRole,
      password: initialPassword,
      temp_password: initialPassword,
      status: 'Active',
      created_at: new Date().toISOString()
    });

    await safeSupabaseSignUp(supabase, {
      email: cleanEmail,
      password: initialPassword,
      options: { data: { role: targetRole, name: fullName }, emailRedirectTo: 'https://nexa-transform.com/lmis/admin' }
    });

    sendWelcomeEmail({ name: fullName, email: cleanEmail, idNumber: 'Admin Account', role: adminForm.role, tempPassword: initialPassword });

    // Generate & download official PDF Proof of Registration
    try {
      generateProofOfRegistrationPDF({
        name: fullName,
        email: cleanEmail,
        number: 'ADM-' + Math.floor(1000 + Math.random() * 9000),
        role: adminForm.role,
        phone: adminForm.phone.trim(),
        qualification: 'Institutional Administration & Systems Governance'
      });
    } catch (e) { console.warn('PDF download error:', e); }

    setAdminForm({ name: '', email: '', phone: '', role: 'Academic Registrar' });
    setShowAdminForm(false);
    showToast(`Admin ${fullName} registered with password "${initialPassword}"!`);
  };


  /* ── Handlers ─────────────────────────── */
  const allLecturersList = system_lecturers || [];

  const handleAssignModuleToFacilitator = async (lecturer, courseCode) => {
    if (!lecturer || !lecturer.email) return;
    const cleanLecEmail = lecturer.email.trim().toLowerCase();
    const cleanLecName = lecturer.name || cleanLecEmail;

    if (!courseCode) {
      // Unassign all courses currently assigned to this facilitator
      (courses || [])
        .filter(c => (c.lecturer_email || '').trim().toLowerCase() === cleanLecEmail)
        .forEach(c => {
          updateRecord('courses', c.id, { lecturer_email: '', lecturer_name: '', code: c.code });
        });
      showToast(`Unassigned module from ${cleanLecName}.`);
      return;
    }

    let targetCourse = (courses || []).find(c => (c.code || '').toUpperCase() === courseCode.toUpperCase());
    if (!targetCourse) {
      const wm = (WEBSITE_MODULES || []).find(m => m.code.toUpperCase() === courseCode.toUpperCase());
      if (wm) {
        targetCourse = await createRecord('courses', {
          title: wm.title,
          code: wm.code,
          category: wm.category,
          description: wm.description,
          status: 'Active',
          lecturer_email: cleanLecEmail,
          lecturer_name: cleanLecName
        });
      }
    }
    if (!targetCourse) return;

    // 1. Assign selected course to this facilitator
    await updateRecord('courses', targetCourse.id, {
      lecturer_email: cleanLecEmail,
      lecturer_name: cleanLecName,
      code: targetCourse.code
    });

    // 2. Unassign this facilitator from other courses (dedicated 1:1 assignment)
    (courses || [])
      .filter(c => (c.lecturer_email || '').trim().toLowerCase() === cleanLecEmail && (c.code || '').toUpperCase() !== courseCode.toUpperCase())
      .forEach(c => {
        updateRecord('courses', c.id, { lecturer_email: '', lecturer_name: '', code: c.code });
      });

    // 3. Update facilitator's department to the assigned course title
    if (lecturer.id) {
      await updateRecord('system_lecturers', lecturer.id, {
        department: targetCourse.title,
        email: cleanLecEmail
      });
    }

    showToast(`✓ Assigned ${targetCourse.title} (${targetCourse.code}) to ${cleanLecName}!`);
  };

  const handleCreateCourse = async (e) => {
    e.preventDefault();
    const cleanCode = (courseForm.code || '').trim().toUpperCase();
    const cleanLecEmail = (courseForm.lecturer_email || '').trim().toLowerCase();
    const lec = (system_lecturers || []).find(l => (l.email || '').toLowerCase().trim() === cleanLecEmail);
    const existingCourse = (courses || []).find(c => (c.code || '').toUpperCase() === cleanCode);

    if (existingCourse) {
      await updateRecord('courses', existingCourse.id, {
        ...courseForm,
        code: cleanCode,
        lecturer_email: cleanLecEmail,
        lecturer_name: lec?.name || cleanLecEmail
      });
      showToast(`Updated and assigned course ${cleanCode}!`);
    } else {
      await createRecord('courses', {
        ...courseForm,
        code: cleanCode,
        lecturer_email: cleanLecEmail,
        lecturer_name: lec?.name || cleanLecEmail,
        schedule_day: 'Friday',
        schedule_time: '09:00 - 11:00'
      });
      showToast(`Course ${cleanCode} registered successfully!`);
    }

    if (lec && lec.id) {
      await updateRecord('system_lecturers', lec.id, { department: courseForm.title });
    }

    setCourseForm({ title: '', code: '', category: 'Digital Transformation', description: '', status: 'Active', lecturer_email: '', lecturer_name: '' });
    setShowCourseForm(false);
  };

  const sendWelcomeEmail = async ({ name, email, idNumber, role, tempPassword }) => {
    if (!email || !isDeliverableEmail(email)) {
      console.log(`[Email Notice] Skipped welcome email for invalid address: ${email}`);
      return;
    }

    const isAdminRole = ADMIN_ROLES.includes(role) || role === 'Admin' || role === 'Super Admin' || role === 'Academic Registrar' || role === 'Finance Officer' || role === 'QA Officer' || role === 'Quality Assurance Officer';
    const portalUrl = role === 'Lecturer' ? 'https://nexa-transform.com/lmis/lecturer' : (isAdminRole ? 'https://nexa-transform.com/lmis/admin' : 'https://nexa-transform.com/lmis/learner');
    const subject = `Welcome to NexaTransform Hub LMIS — ${role} Portal Credentials`;
    const html = generateWelcomeEmailHtml({ name, role, email, identifier: idNumber, portalUrl, tempPassword });

    try {
      await sendInstitutionalEmail({
        to: email,
        subject,
        html,
        from: 'NexaTransform Hub <admissions@nexa-transform.com>',
        reply_to: 'admin@nexa-transform.com'
      });
    } catch (e) {
      console.warn('Welcome email dispatch warning:', e);
    }
  };

  const handleRegisterStudent = async (e) => {
    e.preventDefault();
    if (isRegisteringStudent) return;

    const cleanId = (studentForm.id_passport || '').trim();
    const cleanEmail = (studentForm.email || '').trim().toLowerCase();
    const firstName = (studentForm.first_name || '').trim();
    const surname = (studentForm.surname || '').trim();
    const nokFirstName = (studentForm.nok_first_name || '').trim();
    const nokSurname = (studentForm.nok_surname || '').trim();

    if (!cleanId || !cleanEmail) {
      alert('Registration Error: Please provide both an ID / Passport Number and an Email Address.');
      return;
    }

    if (!firstName || !surname) {
      alert('Registration Error: Please provide both First Name(s) and Surname.');
      return;
    }

    // 1. Validation: Prevent duplicate ID / Passport number
    const existingById = student_profiles.find(p => p.id_passport && (p.id_passport || '').trim().toLowerCase() === cleanId.toLowerCase());
    if (existingById) {
      alert(`Registration Error: A learner with ID / Passport number "${cleanId}" already exists in the system (${existingById.learner_name} — Student No: ${existingById.student_number}).`);
      return;
    }

    // 2. Validation: Prevent duplicate email
    const existingByEmail = student_profiles.find(p => p.learner_email && (p.learner_email || '').trim().toLowerCase() === cleanEmail);
    if (existingByEmail) {
      alert(`Registration Error: A learner with email "${cleanEmail}" is already registered (${existingByEmail.learner_name} — Student No: ${existingByEmail.student_number}).`);
      return;
    }

    const id = `NX${new Date().getFullYear()}${String(Math.floor(100 + Math.random() * 900))}`;
    const fullName = `${firstName} ${surname}`.trim();
    const nokFullName = `${nokFirstName} ${nokSurname}`.trim();

    // 1. Instantly close modal, reset form, and display success toast (Instant optimistic UI)
    setShowStudentForm(false);
    setStudentForm({ ...BLANK_STUDENT });
    showToast(`Learner registered successfully! Student ID: ${id}`);

    // 2. Dispatch profile creation (updates React state & LocalStorage immediately, syncs to Supabase in background)
    createRecord('student_profiles', {
      learner_name: fullName,
      first_name: firstName,
      surname: surname,
      learner_email: cleanEmail,
      student_number: id,
      id_passport: cleanId,
      phone: studentForm.phone || '',
      gender: studentForm.gender || 'Female',
      population_group: studentForm.population_group || 'Black African',
      nationality: studentForm.nationality || 'South African',
      city: studentForm.city || '',
      province: studentForm.province || 'Gauteng',
      physical_address: studentForm.physical_address || '',
      postal_address: studentForm.postal_address || studentForm.physical_address || '',
      highest_qualification: studentForm.highest_qualification || 'Matric / Grade 12',
      previous_high_school: studentForm.previous_high_school || 'High School Matriculant',
      matric_year: studentForm.matric_year || '2020',
      employee_number: studentForm.employee_number || '—',
      age: Number(studentForm.age || 22),
      programme_enrolled: 'Business Process and Work Study Management',
      qualification: 'Business Process and Work Study Management',
      funding_type: studentForm.funding_type || 'funded',
      funder_name: studentForm.funding_type === 'self_paying' ? 'Self-Funded' : (studentForm.funder_name || 'Services SETA'),
      stipend_amount: studentForm.funding_type === 'self_paying' ? 0 : Number(studentForm.stipend_amount || 4500),
      bank_name: studentForm.bank_name || 'Standard Bank',
      bank_account_number: studentForm.bank_account_number || '',
      bank_branch_code: studentForm.bank_branch_code || '051001',
      bank_account_type: studentForm.bank_account_type || 'Savings',
      bank_account_holder: studentForm.bank_account_holder || fullName,
      employment_status: 'Unemployed',
      employer: '—',
      emergency_contact_name: nokFullName || '—',
      emergency_contact_phone: studentForm.nok_phone || '',
      emergency_contact_relation: studentForm.nok_relation || 'Parent',
      emergency_contact_address: studentForm.nok_physical_address || '',
      emergency_contact_postal_address: studentForm.nok_postal_address || studentForm.nok_physical_address || '',
      id_copy_attachments: studentForm.id_copy_attachments || [],
      bank_proof_attachments: studentForm.bank_proof_attachments || [],
      qualification_proof_attachments: studentForm.qualification_proof_attachments || [],
      medical_info: 'None',
      disability_info: 'None',
      created_date: new Date().toISOString().split('T')[0],
      updated_date: new Date().toISOString().split('T')[0]
    }).catch(e => console.warn('Background student sync note:', e));

    // 3. Background: provision Supabase Auth account — auto-confirmed, no email required
    // /api/auth-confirm uses the service role key server-side to create and confirm the account instantly
    supabase.auth.getSession().then(({ data: sessData }) => {
      const token = sessData?.session?.access_token;
      fetch('/api/auth-confirm', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { 'Authorization': `Bearer ${token}` } : {})
        },
        body: JSON.stringify({
          email: cleanEmail,
          password: id,           // Student number is the initial password
          name: fullName,
          student_number: id,
          role: 'Learner'
        })
      }).catch(authErr => console.warn('Auth provisioning note:', authErr));
    }).catch(() => {});

    sendWelcomeEmail({ name: fullName, email: cleanEmail, idNumber: id, role: 'Learner' })
      .catch(emailErr => console.warn('Welcome email note:', emailErr));

    try {
      generateProofOfRegistrationPDF({
        name: fullName,
        email: cleanEmail,
        number: id,
        role: 'Learner',
        idPassport: cleanId,
        phone: studentForm.phone,
        qualification: 'Business Process and Work Study Management'
      });
    } catch (e) { console.warn('PDF download note:', e); }
  };

  const handleEnroll = (e) => {
    e.preventDefault();

    const cleanEmail = enrollForm.learner_email?.toLowerCase().trim();
    const cleanCourse = (enrollForm.course_code || '').trim();

    if (!cleanEmail || !cleanCourse) {
      alert('Please select both a learner and a course to enroll.');
      return;
    }

    // Strict duplicate check against in-memory enrollments (instant 0ms)
    const alreadyEnrolled = enrollments.find(enr => 
      (enr.learner_email || '').toLowerCase().trim() === cleanEmail &&
      (enr.course_code || '').trim().toLowerCase() === cleanCourse.toLowerCase()
    );

    if (alreadyEnrolled) {
      const sp = student_profiles.find(p => (p.learner_email || '').toLowerCase().trim() === cleanEmail);
      alert(`Enrolment Prohibited: Learner "${sp?.learner_name || cleanEmail}" is ALREADY ENROLLED in module "${cleanCourse}". Each learner can only be enrolled once.`);
      return;
    }

    const sp = student_profiles.find(p => (p.learner_email || '').toLowerCase().trim() === cleanEmail);

    // 1. Instantly close modal, reset form, and display success toast (Instant optimistic UI)
    setShowEnrollForm(false);
    setEnrollForm({ learner_email: '', course_code: '' });
    showToast(`Learner ${sp?.learner_name || cleanEmail} successfully enrolled in ${cleanCourse}!`);

    // 2. Dispatch record creations (updates React state & LocalStorage immediately, syncs to Supabase in background)
    createRecord('enrollments', {
      learner_name: sp?.learner_name || 'Learner',
      learner_email: cleanEmail,
      course_code: cleanCourse,
      enrollment_date: new Date().toISOString().split('T')[0],
      status: 'Active'
    }).catch(e => console.warn('Enrollment sync note:', e));

    const inv = `INV-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`;
    createRecord('fees', {
      learner_email: cleanEmail,
      learner_name: sp?.learner_name || 'Learner',
      description: `Tuition Fee – ${cleanCourse}`, amount: 4500, amount_paid: 0,
      invoice_number: inv, due_date: new Date(Date.now() + 30 * 86400000).toISOString().split('T')[0],
      status: 'Outstanding', payment_method: ''
    }).catch(e => console.warn('Fee sync note:', e));
  };

  const handleIssueCert = (e) => {
    e.preventDefault();
    const sp = student_profiles.find(p => p.learner_email === certForm.learner_email);
    const isSelfPaying = certForm.is_self_paying !== false;
    const certPrefix = isSelfPaying ? 'NX-CERT-SP' : 'NX-CERT';
    const certNo = `${certPrefix}-${new Date().getFullYear()}-${Math.floor(10000 + Math.random() * 90000)}`;
    const newCert = {
      ...certForm,
      learner_name: sp?.learner_name || '—',
      student_number: sp?.student_number || 'NX-2026-SP',
      id_passport: sp?.id_passport || '—',
      certificate_number: certNo,
      status: 'Issued',
      funding_type: isSelfPaying ? 'Self-Paying' : (certForm.funding_type || 'Sponsored')
    };
    createRecord('certificates', newCert);

    // Auto-generate official PDF for admin
    try {
      generateCompletionCertificatePDF({
        learnerName: sp?.learner_name || 'Learner',
        studentNumber: sp?.student_number || 'NX-2026-SP',
        idPassport: sp?.id_passport,
        programmeTitle: certForm.programme_title || 'Applied Enterprise Process Excellence',
        certificateNumber: certNo,
        issueDate: certForm.issue_date,
        grade: certForm.grade || '88% (Practical Distinction)',
        isSelfPaying: isSelfPaying
      });
    } catch (_) {}

    setCertForm({
      learner_email: '',
      course_code: '',
      programme_title: '',
      issue_date: new Date().toISOString().split('T')[0],
      status: 'Issued',
      certificate_number: '',
      is_self_paying: true,
      grade: '88% (Practical Distinction)'
    });
    setShowCertForm(false);
    showToast(`Certificate of Completion issued: ${certNo}`);
  };

  const handleCreateFee = (e) => {
    e.preventDefault();
    const sp = student_profiles.find(p => p.learner_email === feeForm.learner_email);
    const inv = feeForm.invoice_number || `INV-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`;
    createRecord('fees', {
      learner_email: feeForm.learner_email, learner_name: sp?.learner_name || '—',
      description: feeForm.description, amount: Number(feeForm.amount), amount_paid: 0,
      invoice_number: inv, due_date: feeForm.due_date, status: 'Outstanding', payment_method: ''
    });
    setFeeForm({ learner_email: '', description: '', amount: '', due_date: '', invoice_number: '' });
    setShowFeeForm(false);
    showToast('Invoice created!');
  };

  /* ── Admin Mark Capture Handlers ───────── */
  const handleOpenAdminMarkCapture = (defaultCourse = '', defaultAssignTitle = '', defaultLearnerEmail = '') => {
    const courseCode = defaultCourse || adminMarkCourse || (courses[0]?.code || '');
    setAdminMarkCourse(courseCode);

    const courseAssigns = assignments.filter(a => (a.course_code || '').toUpperCase().trim() === (courseCode || '').toUpperCase().trim());

    let matchedAssign = null;
    if (defaultAssignTitle) {
      matchedAssign = courseAssigns.find(a => a.title?.trim().toLowerCase() === defaultAssignTitle.trim().toLowerCase());
    }
    if (!matchedAssign && courseAssigns.length > 0) {
      matchedAssign = courseAssigns[0];
    }

    if (matchedAssign) {
      setAdminMarkAssessmentMode('existing');
      setAdminMarkSelectedAssignId(matchedAssign.id || matchedAssign.title);
      setAdminMarkCustomTitle(matchedAssign.title);
      setAdminMarkAssessmentType(
        matchedAssign.assessment_category === 'FINAL_EXAM' ? 'EXAMINATION' :
        (matchedAssign.title?.toLowerCase().includes('test') ? 'WRITTEN_TEST' : 'ASSIGNMENT')
      );
    } else {
      setAdminMarkAssessmentMode('custom');
      setAdminMarkSelectedAssignId('');
      setAdminMarkCustomTitle(defaultAssignTitle || 'Assignment 1');
      setAdminMarkAssessmentType('ASSIGNMENT');
    }

    const enrs = enrollments.filter(e => (e.course_code || '').toUpperCase().trim() === (courseCode || '').toUpperCase().trim());
    const initialMarks = {};
    const effectiveTitle = matchedAssign ? matchedAssign.title : (defaultAssignTitle || 'Assignment 1');

    enrs.forEach(en => {
      const email = (en.learner_email || '').toLowerCase().trim();
      if (!email) return;
      const existingSub = (submissions || []).find(s =>
        (s.course_code || '').toUpperCase().trim() === (courseCode || '').toUpperCase().trim() &&
        (s.learner_email || '').toLowerCase().trim() === email &&
        (s.assignment_title || '').trim().toLowerCase() === effectiveTitle.trim().toLowerCase()
      );
      initialMarks[email] = {
        grade: (existingSub && existingSub.grade !== null && existingSub.grade !== undefined) ? String(existingSub.grade) : '',
        feedback: existingSub?.feedback || ''
      };
    });

    setAdminLearnerMarks(initialMarks);
    setShowAdminMarkModal(true);
  };

  const handleAdminMarkCourseChange = (newCourseCode) => {
    setAdminMarkCourse(newCourseCode);
    const courseAssigns = assignments.filter(a => (a.course_code || '').toUpperCase().trim() === (newCourseCode || '').toUpperCase().trim());
    const firstAssign = courseAssigns[0] || null;

    if (firstAssign) {
      setAdminMarkAssessmentMode('existing');
      setAdminMarkSelectedAssignId(firstAssign.id || firstAssign.title);
      setAdminMarkCustomTitle(firstAssign.title);
      setAdminMarkAssessmentType(
        firstAssign.assessment_category === 'FINAL_EXAM' ? 'EXAMINATION' :
        (firstAssign.title?.toLowerCase().includes('test') ? 'WRITTEN_TEST' : 'ASSIGNMENT')
      );
    } else {
      setAdminMarkAssessmentMode('custom');
      setAdminMarkSelectedAssignId('');
      setAdminMarkCustomTitle('Assignment 1');
      setAdminMarkAssessmentType('ASSIGNMENT');
    }

    const enrs = enrollments.filter(e => (e.course_code || '').toUpperCase().trim() === (newCourseCode || '').toUpperCase().trim());
    const initialMarks = {};
    const effectiveTitle = firstAssign ? firstAssign.title : 'Assignment 1';

    enrs.forEach(en => {
      const email = (en.learner_email || '').toLowerCase().trim();
      if (!email) return;
      const existingSub = (submissions || []).find(s =>
        (s.course_code || '').toUpperCase().trim() === (newCourseCode || '').toUpperCase().trim() &&
        (s.learner_email || '').toLowerCase().trim() === email &&
        (s.assignment_title || '').trim().toLowerCase() === effectiveTitle.trim().toLowerCase()
      );
      initialMarks[email] = {
        grade: (existingSub && existingSub.grade !== null && existingSub.grade !== undefined) ? String(existingSub.grade) : '',
        feedback: existingSub?.feedback || ''
      };
    });
    setAdminLearnerMarks(initialMarks);
  };

  const handleAdminMarkAssessmentChange = (assignIdOrMode, customTitle = '') => {
    let title = customTitle;
    let aType = 'ASSIGNMENT';

    if (assignIdOrMode === '__new__') {
      setAdminMarkAssessmentMode('custom');
      setAdminMarkSelectedAssignId('__new__');
      title = adminMarkCustomTitle || 'Assessment 1';
    } else {
      const found = assignments.find(a => String(a.id) === String(assignIdOrMode) || a.title === assignIdOrMode);
      if (found) {
        setAdminMarkAssessmentMode('existing');
        setAdminMarkSelectedAssignId(found.id || found.title);
        title = found.title;
        aType = found.assessment_category === 'FINAL_EXAM' ? 'EXAMINATION' :
          (found.title?.toLowerCase().includes('test') ? 'WRITTEN_TEST' : 'ASSIGNMENT');
      }
    }
    setAdminMarkAssessmentType(aType);
    setAdminMarkCustomTitle(title);

    const enrs = enrollments.filter(e => (e.course_code || '').toUpperCase().trim() === (adminMarkCourse || '').toUpperCase().trim());
    const updatedMarks = {};
    enrs.forEach(en => {
      const email = (en.learner_email || '').toLowerCase().trim();
      if (!email) return;
      const existingSub = (submissions || []).find(s =>
        (s.course_code || '').toUpperCase().trim() === (adminMarkCourse || '').toUpperCase().trim() &&
        (s.learner_email || '').toLowerCase().trim() === email &&
        (s.assignment_title || '').trim().toLowerCase() === title.trim().toLowerCase()
      );
      updatedMarks[email] = {
        grade: (existingSub && existingSub.grade !== null && existingSub.grade !== undefined) ? String(existingSub.grade) : '',
        feedback: existingSub?.feedback || ''
      };
    });
    setAdminLearnerMarks(updatedMarks);
  };

  const handleSaveAdminMarks = async () => {
    const finalTitle = (adminMarkAssessmentMode === 'existing'
      ? (assignments.find(a => String(a.id) === String(adminMarkSelectedAssignId) || a.title === adminMarkSelectedAssignId)?.title || adminMarkCustomTitle)
      : adminMarkCustomTitle
    ).trim();

    if (!finalTitle) {
      alert('Please specify an assessment title.');
      return;
    }

    setAdminSavingMarks(true);
    let savedCount = 0;

    try {
      const enrs = enrollments.filter(e => (e.course_code || '').toUpperCase().trim() === (adminMarkCourse || '').toUpperCase().trim());

      for (const en of enrs) {
        const email = (en.learner_email || '').toLowerCase().trim();
        if (!email) continue;
        const entry = adminLearnerMarks[email];
        if (!entry || entry.grade === '' || entry.grade === null || entry.grade === undefined) continue;

        const numGrade = Math.min(100, Math.max(0, Number(entry.grade)));
        if (isNaN(numGrade)) continue;

        const existingSubs = (submissions || []).filter(s =>
          (s.course_code || '').toUpperCase().trim() === (adminMarkCourse || '').toUpperCase().trim() &&
          (s.learner_email || '').toLowerCase().trim() === email &&
          (s.assignment_title || '').trim().toLowerCase() === finalTitle.toLowerCase()
        );

        if (existingSubs.length > 0) {
          const primarySub = existingSubs[0];
          await updateRecord('submissions', primarySub.id, {
            grade: numGrade,
            status: 'Graded',
            feedback: entry.feedback?.trim() || `Mark recorded by Administration (${currentAdmin?.name || 'Administrator'})`,
            assessment_type: adminMarkAssessmentType,
            submitted_date: primarySub.submitted_date || new Date().toISOString()
          });

          for (let i = 1; i < existingSubs.length; i++) {
            try { await deleteRecord('submissions', existingSubs[i].id); } catch (_) {}
          }
        } else {
          await createRecord('submissions', {
            course_code: adminMarkCourse,
            learner_name: en.learner_name || email.split('@')[0],
            learner_email: email,
            assignment_title: finalTitle,
            grade: numGrade,
            status: 'Graded',
            feedback: entry.feedback?.trim() || `Mark recorded by Administration (${currentAdmin?.name || 'Administrator'})`,
            assessment_type: adminMarkAssessmentType,
            submitted_date: new Date().toISOString(),
            attachments: [],
            content: 'Mark captured by Institutional Administration.'
          });
        }
        savedCount++;
      }

      logAuditAction({
        action_type: 'GRADE',
        performed_by: currentAdmin?.name || 'Administrator',
        role: currentAdmin?.role || 'Super Admin',
        target_entity: `${adminMarkCourse} — ${finalTitle}`,
        details: `Administrator recorded marks for ${savedCount} learner(s) in module ${adminMarkCourse} (${finalTitle}).`
      });

      showToast(`✓ Successfully captured marks for ${savedCount} learner(s)!`);
      setShowAdminMarkModal(false);
    } catch (err) {
      console.error('Failed to save admin captured marks:', err);
      showToast('Error saving marks. Please try again.');
    } finally {
      setAdminSavingMarks(false);
    }
  };

  /* ── Learner Profile & PoE Audit View Handlers ── */
  const handleViewLearnerProfile = (student) => {
    if (!student) return;
    logAuditAction({
      action_type: 'VIEW_PROFILE',
      performed_by: currentAdmin?.name || loginEmail || 'Administrator',
      role: currentRole,
      target_entity: 'Student Profile',
      details: `${currentAdmin?.name || 'Administrator'} (${currentRole}) accessed academic and funding profile of learner "${student.learner_name}" (${student.student_number || 'N/A'}, ${student.learner_email}).`,
      metadata: {
        action: 'VIEW_PROFILE',
        student_number: student.student_number,
        learner_name: student.learner_name,
        learner_email: student.learner_email,
        id_passport: student.id_passport || 'N/A',
        phone: student.phone || 'N/A',
        programme: student.programme_enrolled || student.qualification || 'N/A',
        funding_type: student.funding_type || 'funded',
        funder_name: student.funder_name || 'Services SETA',
        stipend_amount: student.stipend_amount || 4500,
        bank_name: student.bank_name || 'Standard Bank',
        bank_account_number: student.bank_account_number ? `•••• ${String(student.bank_account_number).slice(-4)}` : 'N/A',
        viewed_by: currentAdmin?.name || 'Administrator',
        viewed_role: currentRole,
        viewed_at: new Date().toISOString()
      }
    });
    setViewingStudentProfile(student);
  };

  const handleViewLearnerPoE = (student) => {
    if (!student) return;
    logAuditAction({
      action_type: 'VIEW_POE',
      performed_by: currentAdmin?.name || loginEmail || 'Administrator',
      role: currentRole,
      target_entity: 'Learner PoE',
      details: `${currentAdmin?.name || 'Administrator'} (${currentRole}) accessed Portfolio of Evidence (PoE) for learner "${student.learner_name}" (${student.student_number}).`,
      metadata: {
        action: 'VIEW_POE',
        student_number: student.student_number,
        learner_name: student.learner_name,
        learner_email: student.learner_email,
        viewed_by: currentAdmin?.name || 'Administrator',
        viewed_role: currentRole,
        viewed_at: new Date().toISOString()
      }
    });
    setPoeStudent(student);
  };

  /* ── Stipends & Disbursements Calculation & Action Engine ── */
  const stipendPeriods = [
    { value: '2026-10', label: 'October 2026' },
    { value: '2026-09', label: 'September 2026' },
    { value: '2026-11', label: 'November 2026' },
    { value: '2026-12', label: 'December 2026' },
    { value: 'all',     label: 'All Historical Periods' }
  ];
  const activePeriodObj = stipendPeriods.find(p => p.value === selectedStipendPeriod) || stipendPeriods[0];
  const activePeriodLabel = activePeriodObj.label;

  // Distinguish funded vs self-paying learners
  const allEligibleFundedLearners = student_profiles.filter(p => p.funding_type !== 'self_paying');
  const selfPayingLearnersCount = student_profiles.filter(p => p.funding_type === 'self_paying').length;

  // Map each eligible learner with their disbursement status for the selected period
  const eligibleWithStatus = allEligibleFundedLearners.map(learner => {
    const payment = (stipend_disbursements || []).find(d => 
      (d.learner_email || '').toLowerCase().trim() === (learner.learner_email || '').toLowerCase().trim() &&
      (selectedStipendPeriod === 'all' ? true : d.period === selectedStipendPeriod) &&
      d.status === 'Paid'
    );
    const hasValidBank = Boolean(learner.bank_account_number && String(learner.bank_account_number).trim().length >= 6);
    const status = payment ? 'Paid' : (!hasValidBank ? 'Incomplete' : 'Pending');
    return {
      ...learner,
      disbursementStatus: status,
      paymentRecord: payment,
      hasValidBank
    };
  });

  // Filter learners in stipends table
  const filteredDisbursementLearners = eligibleWithStatus.filter(item => {
    const term = stipendLearnerSearch.toLowerCase().trim();
    const matchesSearch = !term ||
      item.learner_name?.toLowerCase().includes(term) ||
      item.learner_email?.toLowerCase().includes(term) ||
      item.student_number?.toLowerCase().includes(term) ||
      item.bank_name?.toLowerCase().includes(term) ||
      item.funder_name?.toLowerCase().includes(term);
    if (!matchesSearch) return false;

    if (stipendStatusFilter === 'paid') return item.disbursementStatus === 'Paid';
    if (stipendStatusFilter === 'pending') return item.disbursementStatus === 'Pending';
    if (stipendStatusFilter === 'issues') return item.disbursementStatus === 'Incomplete';
    return true;
  });

  // Analytics for the selected period
  const periodDisbursements = (stipend_disbursements || []).filter(d => 
    selectedStipendPeriod === 'all' ? d.status === 'Paid' : (d.period === selectedStipendPeriod && d.status === 'Paid')
  );
  const totalDisbursedPeriodAmount = periodDisbursements.reduce((sum, d) => sum + Number(d.stipend_amount || 0), 0);
  const paidCountPeriod = periodDisbursements.length;

  const pendingEligible = eligibleWithStatus.filter(l => l.disbursementStatus === 'Pending');
  const totalPendingAmount = pendingEligible.reduce((sum, l) => sum + Number(l.stipend_amount || 4500), 0);
  const pendingCount = pendingEligible.length;
  const incompleteCount = eligibleWithStatus.filter(l => l.disbursementStatus === 'Incomplete').length;

  // Single Direct Payout Handler
  const handlePaySingleStipend = async (learner) => {
    setPayingLearnerId(learner.id || learner.learner_email);
    try {
      const res = await disburseStipend({
        period: selectedStipendPeriod === 'all' ? '2026-10' : selectedStipendPeriod,
        period_label: selectedStipendPeriod === 'all' ? 'October 2026' : activePeriodLabel,
        learner_email: learner.learner_email,
        learner_name: learner.learner_name,
        student_number: learner.student_number,
        funding_type: 'funded',
        funder_name: learner.funder_name || 'Services SETA',
        stipend_amount: Number(learner.stipend_amount || 4500),
        bank_name: learner.bank_name || 'Standard Bank',
        bank_account_number: learner.bank_account_number,
        bank_branch_code: learner.bank_branch_code || '051001',
        bank_account_type: learner.bank_account_type || 'Savings',
        bank_account_holder: learner.bank_account_holder || learner.learner_name,
        disbursed_by: `${currentAdmin?.name || 'Administrator'} (${currentAdmin?.role || 'Finance Officer'})`
      });
      if (res?.success) {
        showToast(`✓ Disbursed R ${Number(learner.stipend_amount || 4500).toLocaleString('en-ZA')} to ${learner.learner_name}!`);
      }
    } catch (err) {
      alert(`Stipend Payout Error: ${err.message}`);
    } finally {
      setPayingLearnerId(null);
    }
  };

  // Batch Payout Handler
  const handleBatchPayStipends = async () => {
    if (pendingCount === 0) {
      alert(`No pending funded learners found for ${activePeriodLabel}. All eligible learners have already received their stipends.`);
      return;
    }
    const pool = Number(institutional_banking_config?.available_balance || 0);
    const provider = institutional_banking_config?.api_provider || 'standard_bank_h2h';
    const isStandardBank = provider === 'standard_bank_h2h';
    const isStitch = provider === 'stitch';
    const sourceBank = institutional_banking_config?.bank_name || 'Standard Bank of South Africa';

    if (totalPendingAmount > pool && pool > 0) {
      if (!window.confirm(`Warning: The total pending payout (R ${totalPendingAmount.toLocaleString('en-ZA')}) exceeds the recorded available balance (R ${pool.toLocaleString('en-ZA')}). Proceed anyway?`)) {
        return;
      }
    } else {
      const confirmMsg = isStitch
        ? `Submit Batch Payout to Stitch Express Instant EFT (RTC):\n\n• Batch Size: ${pendingCount} funded learners\n• Total Amount: R ${totalPendingAmount.toLocaleString('en-ZA', { minimumFractionDigits: 2 })}\n• Gateway: Stitch Express Payouts API\n• Settlement: Real-Time Clearing (RTC) to Capitec, FNB, Nedbank, Standard Bank, ABSA & TymeBank\n\nProceed with instant disbursement?`
        : isStandardBank
        ? `Submit Batch Payout to Standard Bank OneHub (H2H):\n\n• Batch Size: ${pendingCount} funded learners\n• Total Amount: R ${totalPendingAmount.toLocaleString('en-ZA', { minimumFractionDigits: 2 })}\n• Debit Account: ${sourceBank} (•••${institutional_banking_config?.account_number ? String(institutional_banking_config.account_number).slice(-4) : 'Pending'})\n\nOnce submitted, an approval prompt will be sent to your Standard Bank Mobile Banking App for final 2FA sign-off. Proceed?`
        : `Confirm Direct API Batch EFT: Disburse R ${totalPendingAmount.toLocaleString('en-ZA')} to ${pendingCount} funded learners for ${activePeriodLabel}? Funds will be deducted from ${sourceBank}.`;
      
      if (!window.confirm(confirmMsg)) {
        return;
      }
    }

    setIsBatchPaying(true);
    try {
      const res = await batchDisburseStipends(
        selectedStipendPeriod === 'all' ? '2026-10' : selectedStipendPeriod,
        selectedStipendPeriod === 'all' ? 'October 2026' : activePeriodLabel,
        pendingEligible,
        `${currentAdmin?.name || 'Administrator'} (${currentAdmin?.role || 'Finance Officer'})`
      );
      if (res?.success) {
        showToast(isStitch
          ? `✓ Stitch Express Instant Payout Completed: Disbursed ${res.count} stipends (R ${Number(res.totalAmount).toLocaleString('en-ZA')}) in Real-Time!`
          : isStandardBank 
          ? `✓ Standard Bank Batch Submitted: Disbursed ${res.count} stipends (R ${Number(res.totalAmount).toLocaleString('en-ZA')}). App 2FA authorization verified!`
          : `✓ Batch Disbursed: Paid ${res.count} learners totaling R ${Number(res.totalAmount).toLocaleString('en-ZA')}!`
        );
      }
    } catch (err) {
      alert(`Batch Disburse Error: ${err.message}`);
    } finally {
      setIsBatchPaying(false);
    }
  };

  // South African Universal Branch Codes for seamless multi-bank processing
  const resolveSaBranchCode = (bankName, capturedCode) => {
    if (capturedCode && String(capturedCode).trim().length >= 4) return String(capturedCode).trim();
    const cleanBank = (bankName || '').toLowerCase().trim();
    if (cleanBank.includes('capitec')) return '470010';
    if (cleanBank.includes('fnb') || cleanBank.includes('first national')) return '250655';
    if (cleanBank.includes('standard')) return '051001';
    if (cleanBank.includes('nedbank')) return '198765';
    if (cleanBank.includes('absa')) return '632005';
    if (cleanBank.includes('tyme')) return '679000';
    if (cleanBank.includes('african bank')) return '430000';
    if (cleanBank.includes('discovery')) return '679000';
    if (cleanBank.includes('investec')) return '580105';
    if (cleanBank.includes('bidvest')) return '462005';
    if (cleanBank.includes('postbank')) return '460005';
    return '051001'; // Default Standard Bank Universal
  };

  const resolveStandardBankAccType = (accType) => {
    const t = (accType || '').toLowerCase();
    if (t.includes('cheque') || t.includes('current')) return '1';
    if (t.includes('transmission')) return '3';
    return '2'; // Default Savings (Code 2)
  };

  // Standard Bank Official Business Online Batch Upload CSV
  const handleExportStandardBankBatchCsv = () => {
    const payableLearners = eligibleWithStatus.filter(l => l.hasValidBank);
    if (payableLearners.length === 0) {
      alert('No learners with valid bank details found to export.');
      return;
    }
    // Standard Bank Business Online / Internet Banking Batch specification
    const headers = [
      'Beneficiary Name',
      'Account Number',
      'Branch Code',
      'Account Type',
      'Amount',
      'Own Reference',
      'Beneficiary Reference',
      'Notification Email'
    ];
    const rows = payableLearners.map(l => [
      `"${(l.bank_account_holder || l.learner_name || 'Learner').slice(0, 30).replace(/"/g, '')}"`,
      `"${String(l.bank_account_number || '').replace(/\D/g, '')}"`,
      `"${resolveSaBranchCode(l.bank_name, l.bank_branch_code)}"`,
      resolveStandardBankAccType(l.bank_account_type),
      Number(l.stipend_amount || 4500).toFixed(2),
      `"STIP ${(l.student_number || 'STU').slice(-10)}"`,
      `"NEXA STIPEND ${(activePeriodLabel || '').slice(0, 8)}"`,
      `"${l.learner_email || ''}"`
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `Standard_Bank_Batch_${(activePeriodLabel || 'Current').replace(/\s+/g, '_')}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    logAuditAction({
      action_type: 'EXPORT',
      performed_by: currentAdmin?.name || loginEmail || 'Administrator',
      role: currentRole,
      target_entity: 'Standard Bank Batch CSV',
      details: `${currentAdmin?.name || 'Administrator'} (${currentRole}) exported Standard Bank CSV batch payment file for ${payableLearners.length} funded learner(s) totaling R ${payableLearners.reduce((sum, l) => sum + Number(l.stipend_amount || 4500), 0).toLocaleString('en-ZA', { minimumFractionDigits: 2 })} for period ${activePeriodLabel}.`,
      metadata: {
        action: 'EXPORT_STANDARD_BANK_BATCH',
        period: activePeriodLabel,
        learner_count: payableLearners.length,
        total_payout_amount: payableLearners.reduce((sum, l) => sum + Number(l.stipend_amount || 4500), 0),
        disbursed_by: currentAdmin?.name || 'Administrator',
        role: currentRole,
        exported_at: new Date().toISOString()
      }
    });
    showToast(`✓ Exported ${payableLearners.length} stipends formatted for Standard Bank Business Online!`);
  };

  // Export Full Universal ACB Bank Audit CSV
  const handleExportBankBatchCsv = () => {
    if (eligibleWithStatus.length === 0) {
      alert('No learners to export.');
      return;
    }
    const headers = ['Action', 'Beneficiary Name', 'Bank Name', 'Account Number', 'Branch Code', 'Account Type', 'Amount (ZAR)', 'Payment Reference', 'Beneficiary Reference', 'Period', 'Funder'];
    const rows = eligibleWithStatus.map(l => [
      l.disbursementStatus === 'Paid' ? 'PAID' : 'PAY',
      `"${l.learner_name || ''}"`,
      `"${l.bank_name || ''}"`,
      `"${l.bank_account_number || ''}"`,
      `"${resolveSaBranchCode(l.bank_name, l.bank_branch_code)}"`,
      `"${l.bank_account_type || 'Savings'}"`,
      Number(l.stipend_amount || 4500).toFixed(2),
      `"NEXA-STIP-${l.student_number || 'STU'}"`,
      `"STIPEND-${activePeriodLabel.replace(/\s+/g, '')}"`,
      `"${activePeriodLabel}"`,
      `"${l.funder_name || 'Services SETA'}"`
    ]);
    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `Nexa_Stipend_Bank_Batch_${activePeriodLabel.replace(/\s+/g, '_')}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    logAuditAction({
      action_type: 'EXPORT',
      performed_by: currentAdmin?.name || loginEmail || 'Administrator',
      role: currentRole,
      target_entity: 'Universal Bank Batch CSV',
      details: `${currentAdmin?.name || 'Administrator'} (${currentRole}) exported Universal ACB bank batch ledger for ${eligibleWithStatus.length} learner(s) for period ${activePeriodLabel}.`,
      metadata: {
        action: 'EXPORT_UNIVERSAL_BATCH',
        period: activePeriodLabel,
        learner_count: eligibleWithStatus.length,
        exported_by: currentAdmin?.name || 'Administrator',
        role: currentRole,
        exported_at: new Date().toISOString()
      }
    });
    showToast('Universal bank batch EFT audit file exported successfully!');
  };

  // Save Institutional Bank Config
  const handleSaveBankConfig = (e) => {
    e.preventDefault();
    updateInstitutionalBankingConfig(bankConfigForm);
    logAuditAction({
      action_type: 'UPDATE_CONFIG',
      performed_by: currentAdmin?.name || loginEmail || 'Administrator',
      role: currentRole,
      target_entity: 'Institutional Banking Config',
      details: `${currentAdmin?.name || 'Administrator'} (${currentRole}) updated disbursement source bank configuration (${bankConfigForm.bank_name}, Account •••${String(bankConfigForm.account_number).slice(-4)}, Gateway: ${bankConfigForm.api_provider}).`,
      metadata: {
        action: 'UPDATE_BANK_CONFIG',
        bank_name: bankConfigForm.bank_name,
        account_number_masked: `•••• ${String(bankConfigForm.account_number).slice(-4)}`,
        branch_code: bankConfigForm.branch_code,
        api_provider: bankConfigForm.api_provider,
        api_environment: bankConfigForm.api_environment,
        updated_by: currentAdmin?.name || 'Administrator',
        role: currentRole,
        updated_at: new Date().toISOString()
      }
    });
    showToast('Disbursement source bank account & API configuration saved!');
    setShowBankConfigModal(false);
  };

  // Test API Handshake
  const handleTestApiConnection = async () => {
    setIsTestingApi(true);
    setApiTestResult(null);
    try {
      const res = await testBankingApiConnection(bankConfigForm);
      setApiTestResult(res);
    } catch (err) {
      setApiTestResult({ success: false, message: err.message });
    } finally {
      setIsTestingApi(false);
    }
  };

  /* ── User Lists ───────────────────────── */
  const learnerList = student_profiles.filter(p => {
    const matchesSearch = !searchQ ||
      p.learner_name?.toLowerCase().includes(searchQ.toLowerCase()) ||
      p.learner_email?.toLowerCase().includes(searchQ.toLowerCase()) ||
      p.student_number?.toLowerCase().includes(searchQ.toLowerCase()) ||
      p.funder_name?.toLowerCase().includes(searchQ.toLowerCase());
    if (!matchesSearch) return false;
    if (learnerFilterType === 'funded') return p.funding_type !== 'self_paying';
    if (learnerFilterType === 'self_paying') return p.funding_type === 'self_paying';
    return true;
  });

  const lecturerList = (system_lecturers || []).filter(l =>
    !searchQ ||
    l.name?.toLowerCase().includes(searchQ.toLowerCase()) ||
    l.email?.toLowerCase().includes(searchQ.toLowerCase())
  );

  const adminList = (system_admins || []).filter(a =>
    !searchQ ||
    a.name?.toLowerCase().includes(searchQ.toLowerCase()) ||
    a.email?.toLowerCase().includes(searchQ.toLowerCase())
  );

  
  /* ── Bulk CSV Import Engine ─────────────────── */
  const handleDownloadCsvTemplate = () => {
    const headers = ['Full Name', 'Email Address', 'ID or Passport Number', 'Phone Number', 'Gender', 'Age', 'Province', 'City', 'Highest Qualification', 'Previous High School', 'Matric Year', 'Physical Address'];
    const sampleRow = ['Sipho Mthembu', 'sipho.mthembu@nexatransform.com', '9905145089084', '+27 82 555 0192', 'Male', '27', 'Gauteng', 'Johannesburg', 'Matric / Grade 12', 'Soweto High School', '2017', '12 Oak St, Sandton, 2196'];
    const csvContent = "data:text/csv;charset=utf-8," + [headers.join(','), sampleRow.join(',')].join('\n');
    const link = document.createElement('a');
    link.setAttribute('href', encodeURI(csvContent));
    link.setAttribute('download', 'Nexa_Learner_Bulk_Import_Template.csv');
    link.click();
  };

  const handleCsvFileUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setCsvError('');

    const reader = new FileReader();
    reader.onload = (evt) => {
      try {
        const text = evt.target.result;
        const lines = text.split(/\r\n|\n/).map(l => l.trim()).filter(l => l.length > 0);
        if (lines.length < 2) {
          setCsvError('CSV file is empty or missing data rows.');
          return;
        }

        const headers = lines[0].split(',').map(h => h.trim().replace(/^["']|["']$/g, '').toLowerCase());
        const parsedRows = [];

        for (let i = 1; i < lines.length; i++) {
          const cols = lines[i].split(',').map(c => c.trim().replace(/^["']|["']$/g, ''));
          if (cols.length < 3) continue;

          const rowData = {
            learner_name: cols[0] || '',
            learner_email: cols[1] || '',
            id_passport: cols[2] || '',
            phone: cols[3] || '+27 82 000 0000',
            gender: cols[4] || 'Other',
            age: parseInt(cols[5]) || 25,
            province: cols[6] || 'Gauteng',
            city: cols[7] || 'Johannesburg',
            highest_qualification: cols[8] || 'Matric / Grade 12',
            previous_high_school: cols[9] || 'Secondary School',
            matric_year: cols[10] || '2020',
            physical_address: cols[11] || 'South Africa'
          };

          // Check duplicate against existing
          const isDuplicateId = student_profiles.some(p => p.id_passport && p.id_passport.trim() === rowData.id_passport.trim());
          const isDuplicateEmail = student_profiles.some(p => p.learner_email && p.learner_email.trim().toLowerCase() === rowData.learner_email.trim().toLowerCase());
          
          rowData.isDuplicate = isDuplicateId || isDuplicateEmail;
          rowData.dupReason = isDuplicateId ? 'ID Number Exists' : isDuplicateEmail ? 'Email Exists' : null;
          parsedRows.push(rowData);
        }

        setCsvPreviewRows(parsedRows);
      } catch (err) {
        setCsvError('Failed to parse CSV file: ' + err.message);
      }
    };
    reader.readAsText(file);
  };

  const handleExecuteBulkImport = async () => {
    const validRows = csvPreviewRows.filter(r => !r.isDuplicate && r.learner_name && r.id_passport);
    if (validRows.length === 0) {
      setToast('⚠️ No valid non-duplicate rows found to import.');
      return;
    }

    let successCount = 0;
    for (let row of validRows) {
      const studentNumber = 'NX' + new Date().getFullYear() + '-' + Math.floor(1000 + Math.random() * 9000);
      const studentRecord = {
        ...row,
        student_number: studentNumber,
        qualification: 'Business Process and Work Study Management',
        status: 'Active',
        created_date: new Date().toISOString()
      };
      delete studentRecord.isDuplicate;
      delete studentRecord.dupReason;

      await createRecord('student_profiles', studentRecord);

      // Auto-enroll if target course selected
      if (csvTargetCourse) {
        await createRecord('enrollments', {
          learner_name: row.learner_name,
          learner_email: row.learner_email,
          course_code: csvTargetCourse,
          enrollment_date: new Date().toISOString().split('T')[0],
          status: 'Active'
        });
      }
      successCount++;
    }

    logAuditAction('REGISTER', `Bulk imported ${successCount} learners via CSV.${csvTargetCourse ? ' Enrolled in ' + csvTargetCourse : ''}`, currentAdmin?.name || 'Administrator', 'Bulk CSV Importer');
    setToast(`🎉 Successfully imported ${successCount} learners!`);
    setShowBulkCsvModal(false);
    setCsvPreviewRows([]);
  };

  /* ── Export Master Cohort Gradebook ───────── */
  const handleExportCohortGradebook = (courseCode = 'ALL') => {
    const filteredEnrollments = courseCode === 'ALL' ? enrollments : enrollments.filter(e => e.course_code === courseCode);
    if (filteredEnrollments.length === 0) {
      setToast('No learner enrollments found for mark sheet export.');
      return;
    }

    const headers = ['Student Number', 'Full Name', 'Email Address', 'ID/Passport', 'Course Code', 'Assignments Submitted', 'Average Assignment Grade', 'Quizzes Passed', 'Attendance Rate', 'Academic Result'];
    const rows = filteredEnrollments.map(e => {
      const student = student_profiles.find(p => p.learner_email === e.learner_email) || {};
      const studentSubmissions = submissions.filter(s => s.learner_email === e.learner_email && (courseCode === 'ALL' || s.course_code === e.course_code));
      const graded = studentSubmissions.filter(s => s.grade !== null && s.grade !== undefined);
      const avgGrade = graded.length > 0 ? Math.round(graded.reduce((acc, c) => acc + Number(c.grade), 0) / graded.length) : 'N/A';
      
      const studentAttempts = (quiz_attempts || []).filter(a => a.learner_email === e.learner_email);
      const passedQuizzes = studentAttempts.filter(a => a.passed).length;
      
      const studentAttendance = attendance.filter(a => a.learner_email === e.learner_email && (courseCode === 'ALL' || a.course_code === e.course_code));
      const presentCount = studentAttendance.filter(a => a.status === 'Present').length;
      const attRate = studentAttendance.length > 0 ? Math.round((presentCount / studentAttendance.length) * 100) + '%' : '100%';
      
      const resultStatus = avgGrade !== 'N/A' && Number(avgGrade) >= 50 ? 'Competent' : 'In Progress';

      return [
        student.student_number || 'NX-2026',
        `"${e.learner_name}"`,
        e.learner_email,
        student.id_passport || '—',
        e.course_code,
        studentSubmissions.length,
        avgGrade !== 'N/A' ? `${avgGrade}%` : 'Pending',
        passedQuizzes,
        attRate,
        resultStatus
      ].join(',');
    });

    const csvData = "data:text/csv;charset=utf-8," + [headers.join(','), ...rows].join('\n');
    const link = document.createElement('a');
    link.setAttribute('href', encodeURI(csvData));
    link.setAttribute('download', `Nexa_Master_Cohort_Gradebook_${courseCode}_${new Date().toISOString().split('T')[0]}.csv`);
    link.click();
    setToast(`📊 Exported master mark sheet for ${filteredEnrollments.length} learners.`);
  };

  /* ── Add Admin Staff Handler ────────────────── */
  const handleCreateAdminStaff = async (e) => {
    e.preventDefault();
    if (!adminStaffForm.name || !adminStaffForm.email || !adminStaffForm.password) {
      setToast('Please complete all admin staff fields.');
      return;
    }

    const newStaff = {
      id: 'ADM-' + Date.now(),
      name: adminStaffForm.name.trim(),
      email: adminStaffForm.email.trim().toLowerCase(),
      phone: adminStaffForm.phone || '+27 82 000 0000',
      role: normalizeAdminRole(adminStaffForm.role),
      password: adminStaffForm.password,
      temp_password: adminStaffForm.password,
      status: 'Active',
      created_at: new Date().toISOString()
    };

    await createRecord('system_admins', newStaff);

    // Also provision in Supabase Auth so they can immediately sign into Supabase
    try {
      await safeSupabaseSignUp(supabase, {
        email: newStaff.email,
        password: newStaff.password,
        options: {
          data: { role: newStaff.role, name: newStaff.name },
          emailRedirectTo: 'https://nexa-transform.com/lmis/admin'
        }
      });
    } catch (err) {
      console.warn('Admin staff auth signup warning:', err);
    }

    sendWelcomeEmail({
      name: newStaff.name,
      email: newStaff.email,
      idNumber: 'Staff ID: ' + newStaff.id,
      role: newStaff.role,
      tempPassword: newStaff.password
    });

    try {
      generateProofOfRegistrationPDF({
        name: newStaff.name,
        email: newStaff.email,
        number: newStaff.id,
        role: newStaff.role,
        phone: newStaff.phone,
        qualification: 'Institutional Administration & Systems Governance'
      });
    } catch (e) { console.warn('PDF download error:', e); }

    logAuditAction('REGISTER', `Registered new admin staff member ${newStaff.name} as ${newStaff.role}`, currentAdmin?.name || 'Super Admin', 'Admin Staff Management');
    setToast(`✓ Registered ${newStaff.name} as ${newStaff.role}`);
    setShowAdminStaffForm(false);
    setAdminStaffForm({ name: '', email: '', phone: '', role: 'Academic Registrar', password: '' });
  };

  /* ── Role-Based Access Control (RBAC) & Tabs ── */
  const loggedInRole = normalizeAdminRole(currentAdmin?.role || 'Super Admin');
  const isActualSuperAdmin = loggedInRole === 'Super Admin' || AUTHORIZED_ADMIN_EMAILS.includes((currentAdmin?.email || loginEmail || '').toLowerCase().trim());
  const currentRole = normalizeAdminRole(rolePreview || loggedInRole);
  const isSuperAdmin = currentRole === 'Super Admin';
  const isAcademicRegistrar = currentRole === 'Academic Registrar';
  const isFinanceOfficer = currentRole === 'Finance Officer';
  const isQaOfficer = currentRole === 'Quality Assurance Officer' || currentRole === 'QA Officer';

  // Strict RBAC Rules:
  const canDelete = isSuperAdmin; // STRICT: ONLY Super Admin has deletion privileges!
  const canManageLearners = isSuperAdmin || isAcademicRegistrar;
  const canManageLecturers = isSuperAdmin || isAcademicRegistrar;
  const canManageStaff = isSuperAdmin;
  const canCaptureGrades = isSuperAdmin || isAcademicRegistrar || isQaOfficer;
  const canDisburseStipends = isSuperAdmin || isFinanceOfficer;
  const canConfigureBanking = isSuperAdmin || isFinanceOfficer;

  const ALL_TABS = [
    { id: 'overview',     label: 'Overview',                 icon: <IcoCheck size={16} />, roles: ['Super Admin', 'Academic Registrar', 'Finance Officer', 'Quality Assurance Officer'] },
    { id: 'lecturers',    label: 'Lecturers / Facilitators', icon: <IcoUser size={16} />,  roles: ['Super Admin', 'Academic Registrar'] },
    { id: 'users',        label: 'Learners & Students',      icon: <IcoUser size={16} />,  roles: ['Super Admin', 'Academic Registrar', 'Finance Officer', 'Quality Assurance Officer'] },
    { id: 'stipends',     label: 'Stipends & Disbursements', icon: <IcoWallet size={16} />, roles: ['Super Admin', 'Finance Officer'] },
    { id: 'grades',       label: 'Marks & Gradebook',        icon: <IcoAward size={16} />, roles: ['Super Admin', 'Academic Registrar', 'Quality Assurance Officer'] },
    { id: 'demographics', label: 'Demographics',  icon: <IcoChart size={16} />, roles: ['Super Admin', 'Academic Registrar', 'Finance Officer', 'Quality Assurance Officer'] },
    { id: 'programmes',   label: 'Programmes',    icon: <IcoBook size={16} />,  roles: ['Super Admin', 'Academic Registrar'] },
    { id: 'calendar',     label: 'Calendar & Timetable', icon: <IcoCalendar size={16} />, roles: ['Super Admin', 'Academic Registrar', 'Finance Officer', 'Quality Assurance Officer'] },
    { id: 'finance',      label: 'Tuition Fees & Invoices', icon: <IcoWallet size={16} />, roles: ['Super Admin', 'Finance Officer'] },
    { id: 'compliance',   label: 'Compliance',    icon: <IcoShield size={16} />, roles: ['Super Admin', 'Quality Assurance Officer'] },
    { id: 'certificates', label: 'Certificates',  icon: <IcoAward size={16} />, roles: ['Super Admin', 'Academic Registrar', 'Quality Assurance Officer'] },
    { id: 'audits',       label: 'Audit Trail',   icon: <IcoShield size={16} />, roles: ['Super Admin', 'Quality Assurance Officer', 'Academic Registrar', 'Finance Officer'] },
    { id: 'branding',     label: 'Corporate Branding', icon: <IcoSparkles size={16} />, roles: ['Super Admin'] },
    { id: 'staff',        label: 'Admin Staff',   icon: <IcoUser size={16} />,  roles: ['Super Admin'] },
  ];
  const tabs = ALL_TABS.filter(t => t.roles.some(r => normalizeAdminRole(r) === currentRole));
  const bottomTabs = [
    { id: 'overview',     label: 'Home',      icon: <IcoCheck size={20} /> },
    { id: 'users',        label: 'Learners',  icon: <IcoUser size={20} /> },
    ...(isFinanceOfficer ? [
      { id: 'stipends',     label: 'Stipends',  icon: <IcoWallet size={20} /> },
      { id: 'finance',      label: 'Fees',      icon: <IcoWallet size={20} /> },
      { id: 'audits',       label: 'Audits',    icon: <IcoShield size={20} /> },
    ] : [
      { id: 'stipends',     label: 'Stipends',  icon: <IcoWallet size={20} /> },
      { id: 'lecturers',    label: 'Faculty',   icon: <IcoUser size={20} /> },
      { id: 'demographics', label: 'Stats',     icon: <IcoChart size={20} /> },
    ])
  ];

  /* ── Login Screen ─────────────────────── */
  if (!loggedIn) {
    return (
      <div className="lmis-login-overlay">
        <div className="lmis-login-bg" />
        <div className="lmis-login-card">
          {tenant?.logo_url ? (
            <img src={tenant.logo_url} alt={tenant.name} className="lmis-login-logo" style={{ maxHeight: '48px', objectFit: 'contain', margin: '0 auto 1rem', display: 'block' }} onError={e => { e.currentTarget.src = '/logo.svg'; }} />
          ) : (
            <img src="/logo.svg" alt="NX" className="lmis-login-logo" />
          )}
          <h2 className="lmis-login-title">Admin Portal</h2>
          <p className="lmis-login-sub">{tenant?.name || 'NexaTransform Hub LMIS'}</p>
          <p className="lmis-login-role">Sign in with your administrator credentials</p>
          {sessionExpiredNotice && (
            <div style={{
              background: 'rgba(239, 68, 68, 0.12)',
              border: '1px solid rgba(239, 68, 68, 0.3)',
              borderRadius: '8px',
              padding: '0.75rem 1rem',
              marginBottom: '1rem',
              fontSize: '0.85rem',
              color: '#ef4444',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              textAlign: 'left'
            }}>
              <span>⏱️</span>
              <span>Your session expired due to 30 minutes of inactivity. For security, please sign in again.</span>
            </div>
          )}
          <form onSubmit={handleLogin} className="lmis-login-form">
            <div className="lmis-form-group">
              <label className="lmis-form-label">Email Address</label>
              <input type="email" className="lmis-form-input" placeholder="admin@nexa-transform.com"
                value={loginEmail} onChange={e => setLoginEmail(e.target.value)} required />
            </div>
            <div className="lmis-form-group">
              <label className="lmis-form-label">Password</label>
              <div className="lmis-password-wrapper">
                <input
                  type={showPassword ? 'text' : 'password'}
                  className="lmis-form-input"
                  placeholder="••••••••"
                  value={loginPass}
                  onChange={e => setLoginPass(e.target.value)}
                  required
                />
                <button
                  type="button"
                  className="lmis-password-toggle"
                  onClick={() => setShowPassword(p => !p)}
                  title={showPassword ? 'Hide password' : 'Show password'}
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? (
                    <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
                      <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/>
                      <line x1="1" y1="1" x2="23" y2="23"/>
                    </svg>
                  ) : (
                    <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
                      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
                      <circle cx="12" cy="12" r="3"/>
                    </svg>
                  )}
                </button>
              </div>
            </div>
            {loginErr && <p className="lmis-login-err">{loginErr}</p>}
            <button type="submit" className="lmis-login-btn">Sign In →</button>
          </form>
          <p className="lmis-login-back">Wrong portal? <Link to="/lmis">Choose another</Link></p>
        </div>
      </div>
    );
  }

  /* ── Dashboard ────────────────────────── */
  return (
    <LmisShell
      role={currentRole}
      isSuperAdminUser={isActualSuperAdmin}
      onRolePreviewChange={(r) => {
        setRolePreview(r);
        if (r === 'Finance Officer') setActiveTab('stipends');
        showToast(`Previewing portal as ${r}`);
      }}
      activeTab={activeTab}
      onTabChange={setActiveTab}
      tabs={tabs}
      mobileBottomTabs={bottomTabs}
      onRefresh={refreshData}
      syncStatus={syncStatus}
      onLogout={handleLogout}
    >
      {toast && <div className="lmis-toast">{toast}</div>}

      {/* OVERVIEW */}
      {activeTab === 'overview' && (
        <div>
          <div className="lmis-page-header flex-between" style={{ flexWrap: 'wrap', gap: '0.75rem' }}>
            <div>
              <h1 className="lmis-page-title">Admin Dashboard</h1>
              <p className="lmis-page-sub">Institutional overview, academic records, and financial governance.</p>
            </div>
            {isActualSuperAdmin && (
              <div style={{ display: 'flex', gap: '0.4rem', alignItems: 'center' }}>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-sub)' }}>Quick View:</span>
                <button
                  type="button"
                  className={`btn btn-sm ${currentRole === 'Finance Officer' ? 'btn-gold' : 'btn-outline'}`}
                  style={{ fontSize: '0.72rem', padding: '0.2rem 0.5rem', fontWeight: 700 }}
                  onClick={() => {
                    setRolePreview(currentRole === 'Finance Officer' ? 'Super Admin' : 'Finance Officer');
                    if (currentRole !== 'Finance Officer') setActiveTab('stipends');
                    showToast(currentRole === 'Finance Officer' ? 'Reset to Super Admin' : 'Switched to Finance Officer View');
                  }}
                >
                  {currentRole === 'Finance Officer' ? '↩ Back to Super Admin' : '💳 Test Finance Officer View'}
                </button>
              </div>
            )}
          </div>

          {/* FINANCE OFFICER WELCOME BANNER */}
          {isFinanceOfficer && (
            <div className="lmis-card mb-4" style={{ background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.08), rgba(217, 119, 6, 0.08))', border: '1px solid rgba(16, 185, 129, 0.3)', padding: '1.25rem 1.5rem' }}>
              <div className="flex-between" style={{ flexWrap: 'wrap', gap: '1rem' }}>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
                    <span style={{ fontSize: '1.4rem' }}>💳</span>
                    <h2 style={{ fontSize: '1.15rem', fontWeight: 800, margin: 0, color: 'var(--text-main)' }}>
                      Financial Operations &amp; Learner Stipends Hub
                    </h2>
                    <span className="badge badge-emerald">Finance Officer Active</span>
                  </div>
                  <p style={{ margin: 0, fontSize: '0.84rem', color: 'var(--text-sub)', maxWidth: '650px' }}>
                    Welcome to the NexaTransform Finance portal. Access SETA-funded learner stipends, manage Standard Bank EFT batches, configure institutional disbursement accounts, and monitor payment analytics.
                  </p>
                </div>
                <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                  <button className="btn btn-sm btn-gold" onClick={() => setActiveTab('stipends')} style={{ fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                    <IcoWallet size={15} /> Open Stipends &amp; Disbursements
                  </button>
                  <button className="btn btn-sm btn-outline" onClick={() => setActiveTab('finance')} style={{ fontWeight: 600 }}>
                    📄 Fee Invoices
                  </button>
                </div>
              </div>
            </div>
          )}

          <div className="lmis-stats-grid">
            <div className="lmis-stat" style={{ minWidth: 0, overflow: 'hidden' }}>
              <div className="lmis-stat-icon navy"><IcoBook size={20} /></div>
              <div style={{ flex: 1, minWidth: 0, overflow: 'hidden' }}>
                <div className="lmis-stat-val">{activeCourses.length}</div>
                <div className="lmis-stat-label">Active Courses</div>
              </div>
            </div>
            <div className="lmis-stat" style={{ minWidth: 0, overflow: 'hidden', cursor: 'pointer' }} onClick={() => { setActiveTab('users'); setUserTab('Learners'); }} title="Click to view all registered learners">
              <div className="lmis-stat-icon teal"><IcoUser size={20} /></div>
              <div style={{ flex: 1, minWidth: 0, overflow: 'hidden' }}>
                <div className="lmis-stat-val">{student_profiles.length}</div>
                <div className="lmis-stat-label">Registered Learners</div>
              </div>
            </div>
            <div className="lmis-stat" style={{ minWidth: 0, overflow: 'hidden', cursor: 'pointer' }} onClick={() => setActiveTab('stipends')} title="SETA Funded Learners receiving stipends">
              <div className="lmis-stat-icon gold"><IcoWallet size={20} /></div>
              <div style={{ flex: 1, minWidth: 0, overflow: 'hidden' }}>
                <div className="lmis-stat-val" title={fmtZAR((student_profiles || []).filter(p => p.funding_type !== 'self_paying').length * 4500)} style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                  {fmtZAR((student_profiles || []).filter(p => p.funding_type !== 'self_paying').length * 4500)}
                </div>
                <div className="lmis-stat-label">Monthly Stipends Pool</div>
              </div>
            </div>
            <div className="lmis-stat" style={{ minWidth: 0, overflow: 'hidden' }}>
              <div className="lmis-stat-icon emerald"><IcoCheck size={20} /></div>
              <div style={{ flex: 1, minWidth: 0, overflow: 'hidden' }}>
                <div className="lmis-stat-val">{enrollments.length}</div>
                <div className="lmis-stat-label">Enrollments</div>
              </div>
            </div>
            <div className="lmis-stat" style={{ minWidth: 0, overflow: 'hidden' }}>
              <div className="lmis-stat-icon gold"><IcoFile size={20} /></div>
              <div style={{ flex: 1, minWidth: 0, overflow: 'hidden' }}>
                <div className="lmis-stat-val">{pendingGrades}</div>
                <div className="lmis-stat-label">To Grade</div>
              </div>
            </div>
            <div className="lmis-stat" style={{ minWidth: 0, overflow: 'hidden' }}>
              <div className="lmis-stat-icon red"><IcoWallet size={20} /></div>
              <div style={{ flex: 1, minWidth: 0, overflow: 'hidden' }}>
                <div className="lmis-stat-val" title={fmtZAR(outstanding)} style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                  {fmtZAR(outstanding)}
                </div>
                <div className="lmis-stat-label">Outstanding Fees</div>
              </div>
            </div>
            <div className="lmis-stat" style={{ minWidth: 0, overflow: 'hidden' }}>
              <div className="lmis-stat-icon emerald"><IcoAward size={20} /></div>
              <div style={{ flex: 1, minWidth: 0, overflow: 'hidden' }}>
                <div className="lmis-stat-val">{certificates.filter(c => c.status === 'Issued').length}</div>
                <div className="lmis-stat-label">Certificates Issued</div>
              </div>
            </div>
          </div>

          <div className="lmis-2col" style={{ gap: '1rem' }}>
            <div className="lmis-card">
              <div className="lmis-card-header"><span className="lmis-card-title">Quick Actions</span></div>
              <div className="lmis-card-body" style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                <button className="btn btn-md btn-gold btn-full" onClick={() => setActiveTab('stipends')} style={{ fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}>
                  <IcoWallet size={16} /> Disburse Learner Stipends (SETA)
                </button>
                <button className="btn btn-md btn-primary btn-full" onClick={() => { setActiveTab('users'); setTimeout(() => setShowStudentForm(true), 100); }}><IcoPlus size={16} /> Register New Learner</button>
                {canManageLecturers && (
                  <button className="btn btn-md btn-outline btn-full" onClick={() => { setActiveTab('programmes'); setTimeout(() => setShowCourseForm(true), 100); }}><IcoPlus size={16} /> Create New Course</button>
                )}
                {canManageLearners && (
                  <button className="btn btn-md btn-outline btn-full" onClick={() => { setActiveTab('users'); setTimeout(() => setShowEnrollForm(true), 100); }}><IcoCheck size={16} /> Enrol Learner in Course</button>
                )}
                {canCaptureGrades && (
                  <button className="btn btn-md btn-outline btn-full" onClick={() => { setActiveTab('grades'); setTimeout(() => handleOpenAdminMarkCapture(), 100); }}><IcoAward size={16} /> Capture Learner Marks</button>
                )}
                <button className="btn btn-md btn-outline btn-full" onClick={() => { setActiveTab('finance'); setTimeout(() => setShowFeeForm(true), 100); }}><IcoWallet size={16} /> Create Fee Invoice</button>
              </div>
            </div>
            <div className="lmis-card">
              <div className="lmis-card-header"><span className="lmis-card-title">Recent Enrollments</span></div>
              <div className="lmis-card-body">
                {enrollments.length === 0
                  ? <div className="lmis-empty"><IcoUser size={32} style={{ color: '#CBD5E1' }} /><p className="lmis-empty-sub">No enrollments yet. Register learners and enrol them in courses.</p></div>
                  : enrollments.slice(-5).reverse().map(e => (
                    <div key={e.id} className="lmis-item-row">
                      <div style={{ flex: 1 }}><div className="lmis-item-title">{e.learner_name}</div><div className="lmis-item-sub">{e.course_code} · {e.enrollment_date}</div></div>
                      <span className="badge badge-emerald">{e.status}</span>
                    </div>
                  ))
                }
              </div>
            </div>
          </div>


        </div>
      )}



      {/* ══════════════════════════════════════════
          LECTURERS / FACILITATORS DEDICATED TAB
      ══════════════════════════════════════════ */}
      {activeTab === 'lecturers' && (
        <div>
          <div className="lmis-page-header flex-between" style={{ flexWrap: 'wrap', gap: '1rem' }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
                <span className="badge badge-gold">ACADEMIC GOVERNANCE</span>
                <span className="badge badge-teal">LIVE DATA ONLY</span>
              </div>
              <h1 className="lmis-page-title">Lecturers &amp; Academic Facilitators</h1>
              <p className="lmis-page-sub">
                Onboard academic faculty, review qualification credentials &amp; compliance documents, and manage portal access.
              </p>
            </div>
            <div style={{ display: 'flex', gap: '0.6rem', flexWrap: 'wrap' }}>
              <button
                className="btn btn-sm btn-gold"
                style={{ padding: '0.55rem 1.15rem', fontWeight: 800 }}
                onClick={() => setShowLecturerForm(!showLecturerForm)}
              >
                {showLecturerForm ? '✕ Close Registration Form' : '👨‍🏫 + Register Lecturer / Facilitator'}
              </button>
            </div>
          </div>

          {/* Stat Cards */}
          <div className="lmis-4col mb-4">
            <div className="lmis-stat">
              <div className="lmis-stat-icon navy"><IcoUser size={20} /></div>
              <div>
                <div className="lmis-stat-val">{(system_lecturers || []).length}</div>
                <div className="lmis-stat-label">Total Faculty</div>
              </div>
            </div>
            <div className="lmis-stat">
              <div className="lmis-stat-icon emerald"><IcoCheck size={20} /></div>
              <div>
                <div className="lmis-stat-val">{(system_lecturers || []).filter(l => l.status !== 'Inactive').length}</div>
                <div className="lmis-stat-label">Active Facilitators</div>
              </div>
            </div>
            <div className="lmis-stat">
              <div className="lmis-stat-icon gold"><IcoBook size={20} /></div>
              <div>
                <div className="lmis-stat-val">{courses.filter(c => c.lecturer_email).length}</div>
                <div className="lmis-stat-label">Assigned Modules</div>
              </div>
            </div>
            <div className="lmis-stat">
              <div className="lmis-stat-icon teal"><IcoShield size={20} /></div>
              <div>
                <div className="lmis-stat-val">
                  {(system_lecturers || []).filter(l => (l.qualification_proof_attachments || []).length + (l.id_copy_attachments || []).length > 0).length}
                </div>
                <div className="lmis-stat-label">Verified Compliance</div>
              </div>
            </div>
          </div>

          {/* REGISTER LECTURER / FACILITATOR FORM */}
          {showLecturerForm && (
            <div className="lmis-card mb-4" style={{ border: '2px solid var(--gold)', boxShadow: '0 10px 25px -5px rgba(202,138,4,0.2)' }}>
              <div className="lmis-card-header flex-between" style={{ background: 'rgba(202,138,4,0.08)' }}>
                <span className="lmis-card-title" style={{ color: 'var(--primary-navy)', fontWeight: 800 }}>
                  👨‍🏫 Register &amp; Onboard Academic Facilitator / Lecturer
                </span>
                <button className="btn btn-sm btn-ghost" onClick={() => setShowLecturerForm(false)}><IcoX size={16} /></button>
              </div>
              <div className="lmis-card-body">
                <form onSubmit={handleRegisterLecturer}>
                  {/* Section 1: Demographics */}
                  <p style={{ fontWeight: 700, fontSize: '0.72rem', textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--text-sub)', marginBottom: '0.6rem' }}>
                    1. Personal Demographics &amp; Contact Details
                  </p>
                  <div className="lmis-form-grid">
                    <div className="lmis-field">
                      <label className="lmis-label">Title</label>
                      <select className="lmis-select" value={lecturerForm.title || 'Dr.'} onChange={e => setLecturerForm({ ...lecturerForm, title: e.target.value })}>
                        <option>Dr.</option>
                        <option>Prof.</option>
                        <option>Mr.</option>
                        <option>Ms.</option>
                        <option>Mrs.</option>
                      </select>
                    </div>
                    <div className="lmis-field">
                      <label className="lmis-label">First Name(s) *</label>
                      <input className="lmis-input" value={lecturerForm.first_name || ''} onChange={e => setLecturerForm({ ...lecturerForm, first_name: e.target.value, name: `${lecturerForm.title || 'Dr.'} ${e.target.value} ${lecturerForm.surname || ''}`.trim() })} required placeholder="e.g. Sipho David" />
                    </div>
                    <div className="lmis-field">
                      <label className="lmis-label">Surname *</label>
                      <input className="lmis-input" value={lecturerForm.surname || ''} onChange={e => setLecturerForm({ ...lecturerForm, surname: e.target.value, name: `${lecturerForm.title || 'Dr.'} ${lecturerForm.first_name || ''} ${e.target.value}`.trim() })} required placeholder="e.g. Khumalo" />
                    </div>
                    <div className="lmis-field">
                      <label className="lmis-label">National ID / Passport Number *</label>
                      <input className="lmis-input" value={lecturerForm.id_passport || ''} onChange={e => setLecturerForm({ ...lecturerForm, id_passport: e.target.value })} required placeholder="13-digit ID or Passport" />
                    </div>
                    <div className="lmis-field">
                      <label className="lmis-label">Institutional Email Address *</label>
                      <input type="email" className="lmis-input" value={lecturerForm.email || ''} onChange={e => setLecturerForm({ ...lecturerForm, email: e.target.value })} required placeholder="lecturer@nexa-transform.com" />
                    </div>
                    <div className="lmis-field">
                      <label className="lmis-label">Contact Phone Number *</label>
                      <input className="lmis-input" value={lecturerForm.phone || ''} onChange={e => setLecturerForm({ ...lecturerForm, phone: e.target.value })} required placeholder="+27 82 123 4567" />
                    </div>
                    <div className="lmis-field">
                      <label className="lmis-label">Gender</label>
                      <select className="lmis-select" value={lecturerForm.gender || 'Male'} onChange={e => setLecturerForm({ ...lecturerForm, gender: e.target.value })}>
                        <option>Male</option>
                        <option>Female</option>
                        <option>Other / Prefer not to say</option>
                      </select>
                    </div>
                    <div className="lmis-field">
                      <label className="lmis-label">Date of Birth</label>
                      <input type="date" className="lmis-input" value={lecturerForm.date_of_birth || ''} onChange={e => setLecturerForm({ ...lecturerForm, date_of_birth: e.target.value })} />
                    </div>
                  </div>

                  {/* Section 2: Academic Qualifications */}
                  <p style={{ fontWeight: 700, fontSize: '0.72rem', textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--text-sub)', margin: '1.25rem 0 0.6rem' }}>
                    2. Academic Credentials &amp; Module Specialization
                  </p>
                  <div className="lmis-form-grid">
                    <div className="lmis-field">
                      <label className="lmis-label">Highest Qualification Level *</label>
                      <select className="lmis-select" value={lecturerForm.highest_qualification || "Master's Degree"} onChange={e => setLecturerForm({ ...lecturerForm, highest_qualification: e.target.value })}>
                        <option>Doctorate / PhD</option>
                        <option>Master's Degree</option>
                        <option>Honours Degree</option>
                        <option>Postgraduate Diploma</option>
                        <option>Bachelor's Degree</option>
                        <option>National Diploma</option>
                        <option>Advanced Certificate</option>
                      </select>
                    </div>
                    <div className="lmis-field">
                      <label className="lmis-label">Qualification / Degree Title</label>
                      <input className="lmis-input" value={lecturerForm.qualification_title || ''} onChange={e => setLecturerForm({ ...lecturerForm, qualification_title: e.target.value })} placeholder="e.g. MCom in Business Process Management" />
                    </div>
                    <div className="lmis-field">
                      <label className="lmis-label">Awarding University / Institution</label>
                      <input className="lmis-input" value={lecturerForm.institution_obtained || ''} onChange={e => setLecturerForm({ ...lecturerForm, institution_obtained: e.target.value })} placeholder="e.g. University of Johannesburg" />
                    </div>
                    <div className="lmis-field">
                      <label className="lmis-label">Assigned Module / Specialization *</label>
                      <select
                        className="lmis-select"
                        value={lecturerForm.assigned_course_code || (availableCourseOptions.find(m => m.title === lecturerForm.department)?.code) || 'ADS'}
                        onChange={e => {
                          const code = e.target.value;
                          const found = availableCourseOptions.find(m => m.code === code);
                          setLecturerForm({
                            ...lecturerForm,
                            assigned_course_code: code,
                            department: found ? found.title : code
                          });
                        }}
                      >
                        {availableCourseOptions.map(m => (
                          <option key={m.code} value={m.code}>{m.code} · {m.title}</option>
                        ))}
                      </select>
                    </div>
                    <div className="lmis-field">
                      <label className="lmis-label">Academic Position / Role</label>
                      <select className="lmis-select" value={lecturerForm.academic_role || 'Lead Facilitator'} onChange={e => setLecturerForm({ ...lecturerForm, academic_role: e.target.value })}>
                        <option>Lead Facilitator</option>
                        <option>Senior Lecturer</option>
                        <option>Lecturer</option>
                        <option>Academic Evaluator</option>
                      </select>
                    </div>
                    <div className="lmis-field">
                      <label className="lmis-label">Years Experience</label>
                      <input type="number" className="lmis-input" value={lecturerForm.years_experience || '5'} onChange={e => setLecturerForm({ ...lecturerForm, years_experience: e.target.value })} />
                    </div>
                    <div className="lmis-field" style={{ gridColumn: '1 / -1' }}>
                      <label className="lmis-label">🔑 Initial Password for Lecturer Portal Login *</label>
                      <div style={{ display: 'flex', gap: '0.5rem' }}>
                        <input className="lmis-input" value={lecturerForm.password || ''} onChange={e => setLecturerForm({ ...lecturerForm, password: e.target.value })} required />
                        <button type="button" className="btn btn-sm btn-outline" onClick={() => setLecturerForm({ ...lecturerForm, password: 'NexaLec#' + Math.floor(1000 + Math.random() * 9000) })}>
                          🎲 Generate Password
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Section 3: Statutory Compliance Documents */}
                  <p style={{ fontWeight: 700, fontSize: '0.72rem', textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--text-sub)', margin: '1.25rem 0 0.6rem' }}>
                    3. Statutory Compliance Documents (Upload &amp; Verify)
                  </p>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1rem' }}>
                    <div>
                      <label style={{ fontSize: '0.75rem', fontWeight: 700, display: 'block', marginBottom: '0.25rem' }}>Certified ID / Passport Copy</label>
                      <FileAttachmentZone
                        bucket="lecturer-documents"
                        folder={`id-copies/${lecturerForm.email || 'admin-upload'}`}
                        onUploadComplete={(files) => setLecturerForm({ ...lecturerForm, id_copy_attachments: files })}
                        existingFiles={lecturerForm.id_copy_attachments || []}
                        maxFiles={2}
                        label="Drop Certified ID (PDF/PNG)"
                      />
                    </div>
                    <div>
                      <label style={{ fontSize: '0.75rem', fontWeight: 700, display: 'block', marginBottom: '0.25rem' }}>Academic Degree / Qualifications</label>
                      <FileAttachmentZone
                        bucket="lecturer-documents"
                        folder={`qualifications/${lecturerForm.email || 'admin-upload'}`}
                        onUploadComplete={(files) => setLecturerForm({ ...lecturerForm, qualification_proof_attachments: files })}
                        existingFiles={lecturerForm.qualification_proof_attachments || []}
                        maxFiles={5}
                        label="Drop Qualifications (PDF)"
                      />
                    </div>
                    <div>
                      <label style={{ fontSize: '0.75rem', fontWeight: 700, display: 'block', marginBottom: '0.25rem' }}>Comprehensive CV / Resume</label>
                      <FileAttachmentZone
                        bucket="lecturer-documents"
                        folder={`resumes/${lecturerForm.email || 'admin-upload'}`}
                        onUploadComplete={(files) => setLecturerForm({ ...lecturerForm, cv_attachments: files })}
                        existingFiles={lecturerForm.cv_attachments || []}
                        maxFiles={2}
                        label="Drop Academic CV (PDF)"
                      />
                    </div>
                    <div>
                      <label style={{ fontSize: '0.75rem', fontWeight: 700, display: 'block', marginBottom: '0.25rem' }}>Proof of Bank / Tax Document</label>
                      <FileAttachmentZone
                        bucket="lecturer-documents"
                        folder={`banking/${lecturerForm.email || 'admin-upload'}`}
                        onUploadComplete={(files) => setLecturerForm({ ...lecturerForm, bank_proof_attachments: files })}
                        existingFiles={lecturerForm.bank_proof_attachments || []}
                        maxFiles={2}
                        label="Drop Bank Proof / SARS"
                      />
                    </div>
                  </div>

                  <div className="lmis-form-actions" style={{ marginTop: '1.5rem', display: 'flex', justifyContent: 'flex-end', gap: '0.75rem' }}>
                    <button type="button" className="btn btn-sm btn-ghost" onClick={() => setShowLecturerForm(false)}>Cancel</button>
                    <button type="submit" className="btn btn-sm btn-gold" style={{ fontWeight: 800, padding: '0.6rem 1.5rem' }}>
                      ✓ Register Lecturer &amp; Generate Appointment PDF
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}



          {/* FACULTY DIRECTORY TABLE */}
          <div className="lmis-card">
            <div className="lmis-card-header flex-between">
              <div>
                <span className="lmis-card-title">Appointed Academic Faculty &amp; Facilitators</span>
                <span className="badge badge-teal" style={{ marginLeft: '0.5rem' }}>{(system_lecturers || []).length} registered</span>
              </div>
              <input
                className="lmis-input"
                style={{ maxWidth: '240px' }}
                placeholder="Search faculty..."
                value={searchQ}
                onChange={e => setSearchQ(e.target.value)}
              />
            </div>

            <div className="lmis-table-wrap">
              <table className="lmis-table">
                <thead>
                  <tr>
                    <th>Facilitator Name</th>
                    <th>Email &amp; Phone</th>
                    <th>ID / Passport</th>
                    <th>Module &amp; Role</th>
                    <th>Assigned Modules</th>
                    <th>Compliance Docs</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {(system_lecturers || [])
                    .filter(l => !searchQ || l.name?.toLowerCase().includes(searchQ.toLowerCase()) || l.email?.toLowerCase().includes(searchQ.toLowerCase()))
                    .map(l => (
                      <tr key={l.email}>
                        <td style={{ fontWeight: 700 }}>
                          {l.name}
                          <div style={{ fontSize: '0.7rem', color: 'var(--text-sub)' }}>{l.staff_number || l.id}</div>
                        </td>
                        <td>
                          <div style={{ color: 'var(--primary-navy)', fontWeight: 600 }}>{l.email}</div>
                          <div style={{ fontSize: '0.72rem', color: 'var(--text-sub)' }}>{l.phone || '—'}</div>
                        </td>
                        <td>
                          <span className="badge badge-navy">{l.id_passport || 'Verified'}</span>
                        </td>
                        <td>
                          <div style={{ fontWeight: 600 }}>{l.department || 'BPM & Operations'}</div>
                          <span className="badge badge-teal" style={{ fontSize: '0.68rem' }}>{l.academic_role || l.title || 'Lecturer'}</span>
                        </td>
                        <td style={{ minWidth: '220px' }}>
                          <select
                            className="lmis-select"
                            style={{ fontSize: '0.74rem', padding: '0.35rem 0.5rem', background: '#fff', border: '1px solid var(--border)' }}
                            value={
                              courses.find(c => (c.lecturer_email || '').toLowerCase().trim() === (l.email || '').toLowerCase().trim())?.code ||
                              courses.find(c => l.department && (c.title?.toLowerCase() === l.department.toLowerCase() || c.code?.toLowerCase() === l.department.toLowerCase()))?.code ||
                              ''
                            }
                            onChange={e => handleAssignModuleToFacilitator(l, e.target.value)}
                          >
                            <option value="">-- No Module Assigned --</option>
                            {availableCourseOptions.map(m => (
                              <option key={m.code} value={m.code}>{m.code} · {m.title}</option>
                            ))}
                          </select>
                          {courses.some(c => (c.lecturer_email || '').toLowerCase().trim() === (l.email || '').toLowerCase().trim()) && (
                            <div style={{ fontSize: '0.68rem', color: '#0d9488', fontWeight: 700, marginTop: '0.25rem' }}>
                              ✓ Active: {courses.filter(c => (c.lecturer_email || '').toLowerCase().trim() === (l.email || '').toLowerCase().trim()).map(c => c.code).join(', ')}
                            </div>
                          )}
                        </td>
                        <td>
                          <button
                            className="btn btn-sm btn-outline"
                            style={{ fontSize: '0.68rem', padding: '0.25rem 0.5rem', borderColor: '#0d9488', color: '#0d9488' }}
                            onClick={() => setViewingLecturerDocs(l)}
                          >
                            📄 Docs ({(l.qualification_proof_attachments || []).length + (l.id_copy_attachments || []).length + (l.cv_attachments || []).length + (l.bank_proof_attachments || []).length})
                          </button>
                        </td>
                        <td>
                          <div style={{ display: 'flex', gap: '0.3rem', flexWrap: 'wrap' }}>
                            <button
                              className="btn btn-sm btn-primary"
                              style={{ fontSize: '0.68rem', padding: '0.25rem 0.5rem' }}
                              onClick={() => {
                                const matchedCode = courses.find(c => (c.lecturer_email || '').toLowerCase().trim() === (l.email || '').toLowerCase().trim())?.code ||
                                  courses.find(c => l.department && (c.title?.toLowerCase() === l.department.toLowerCase() || c.code?.toLowerCase() === l.department.toLowerCase()))?.code || '';
                                setEditingLecturer(l);
                                setEditLecForm({
                                  name: l.name || '',
                                  email: l.email || '',
                                  phone: l.phone || '+27 82 000 0000',
                                  department: l.department || 'Business Process Management',
                                  assigned_course_code: matchedCode,
                                  title: l.title || 'Lecturer',
                                  password: l.password || l.temp_password || 'NexaLec#2026'
                                });
                              }}
                            >
                              ✏ Edit
                            </button>
                            <button
                              className="btn btn-sm btn-outline"
                              style={{ fontSize: '0.68rem', padding: '0.25rem 0.5rem' }}
                              onClick={() => {
                                sendWelcomeEmail({ name: l.name, email: l.email, idNumber: `Password: ${l.password || l.temp_password || 'NexaLec#2026'}`, role: 'Lecturer' });
                                showToast(`Credentials sent to ${l.email}`);
                              }}
                            >
                              ✉ Email
                            </button>
                            <button
                              className="btn btn-sm btn-gold"
                              style={{ fontSize: '0.68rem', padding: '0.25rem 0.5rem' }}
                              onClick={() => {
                                generateProofOfRegistrationPDF({
                                  name: l.name,
                                  email: l.email,
                                  number: l.staff_number || l.id || ('LEC-' + Math.floor(1000 + Math.random() * 9000)),
                                  role: 'Lecturer',
                                  phone: l.phone || '—',
                                  idPassport: l.id_passport || '—',
                                  qualification: `${l.department || 'BPM & Operations'} — ${l.academic_role || l.title || 'Lecturer'}`
                                });
                                showToast(`Downloaded Appointment PDF for ${l.name}!`);
                              }}
                            >
                              📥 PDF
                            </button>
                            {canDelete && (
                              <button
                                className="btn btn-sm btn-danger"
                                style={{ fontSize: '0.68rem', padding: '0.25rem 0.5rem' }}
                                onClick={() => {
                                  if (window.confirm(`Are you sure you want to permanently delete lecturer "${l.name}" (${l.email})?`)) {
                                    deleteLecturer(l.id || l.email, currentAdmin?.name || loginEmail || 'Super Admin', currentRole);
                                    showToast(`Deleted lecturer ${l.name}`);
                                  }
                                }}
                              >
                                🗑 Delete
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  {(system_lecturers || []).length === 0 && (
                    <tr>
                      <td colSpan={7} style={{ textAlign: 'center', padding: '3rem 1rem' }}>
                        <div style={{ width: '48px', height: '48px', borderRadius: '50%', background: 'rgba(202,138,4,0.1)', color: '#ca8a04', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1rem auto', fontSize: '1.5rem' }}>
                          👨‍🏫
                        </div>
                        <h4 style={{ fontSize: '1rem', fontWeight: 800, color: 'var(--primary-navy)', marginBottom: '0.35rem' }}>
                          No Lecturers or Facilitators Registered Yet
                        </h4>
                        <p style={{ fontSize: '0.82rem', color: 'var(--text-sub)', maxWidth: '400px', margin: '0 auto 1.25rem auto' }}>
                          Click the button below to register and onboard members of your academic faculty.
                        </p>
                        <button className="btn btn-sm btn-gold" onClick={() => setShowLecturerForm(true)}>
                          👨‍🏫 + Register Lecturer / Facilitator
                        </button>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* USERS & ROLES */}
      {(activeTab === 'users' || activeTab === 'learners') && (
        <div>
          <div className="lmis-page-header flex-between">
            <div>
              <h1 className="lmis-page-title">{userTab === 'Learners' ? 'Learners Directory & Enrolment' : userTab === 'Lecturers' ? 'Lecturers & Facilitators' : 'Administrative Staff'}</h1>
              <p className="lmis-page-sub">{userTab === 'Learners' ? 'Accredited South African learners, SETA funding models, stipends, and academic enrolments.' : 'Manage institutional faculty and administrators.'}</p>
            </div>
            <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
              {userTab === 'Learners' && (
                <>
                  <button className="btn btn-sm btn-gold" onClick={() => { setShowStudentForm(!showStudentForm); setShowEnrollForm(false); }}><IcoPlus size={14} /> Register Learner</button>
                  <button className="btn btn-sm btn-primary" onClick={() => { setShowEnrollForm(!showEnrollForm); setShowStudentForm(false); }}><IcoCheck size={14} /> Enrol</button>
                </>
              )}
              {userTab === 'Lecturers' && (
                <button className="btn btn-sm btn-gold" onClick={() => { setShowLecturerForm(!showLecturerForm); setShowStudentForm(false); setShowEnrollForm(false); setShowAdminForm(false); }}><IcoPlus size={14} /> Register Lecturer</button>
              )}
              {userTab === 'Admins' && (
                <button className="btn btn-sm btn-gold" onClick={() => { setShowAdminForm(!showAdminForm); setShowStudentForm(false); setShowEnrollForm(false); setShowLecturerForm(false); }}><IcoPlus size={14} /> Register Admin</button>
              )}
            </div>
          </div>

          {showStudentForm && (
            <div className="lmis-card mb-4">
              <div className="lmis-card-header"><span className="lmis-card-title">Register New Learner</span><button className="btn btn-sm btn-ghost" onClick={() => setShowStudentForm(false)}><IcoX size={14} /></button></div>
              <div className="lmis-card-body">
                <form onSubmit={handleRegisterStudent}>

                  <p style={{fontWeight:700,fontSize:'0.72rem',textTransform:'uppercase',letterSpacing:'0.06em',color:'var(--text-sub)',marginBottom:'0.6rem'}}>Personal Details</p>
                  <div className="lmis-form-grid">
                    <div className="lmis-field"><label className="lmis-label">First Name(s)</label><input className="lmis-input" value={studentForm.first_name} onChange={e=>sf('first_name',e.target.value)} required placeholder="e.g. Lerato" /></div>
                    <div className="lmis-field"><label className="lmis-label">Surname</label><input className="lmis-input" value={studentForm.surname} onChange={e=>sf('surname',e.target.value)} required placeholder="e.g. Mthembu" /></div>
                    <div className="lmis-field"><label className="lmis-label">Email Address</label><input type="email" className="lmis-input" value={studentForm.email} onChange={e=>sf('email',e.target.value)} required placeholder="learner@nexatransform.com" /></div>
                    <div className="lmis-field"><label className="lmis-label">ID / Passport Number</label><input className="lmis-input" value={studentForm.id_passport} onChange={e=>sf('id_passport',e.target.value)} required placeholder="9804125089083" /></div>
                    <div className="lmis-field"><label className="lmis-label">Phone</label><input className="lmis-input" value={studentForm.phone} onChange={e=>sf('phone',e.target.value)} required placeholder="+27 82 000 0000" /></div>
                    <div className="lmis-field"><label className="lmis-label">Age</label><input type="number" className="lmis-input" value={studentForm.age} onChange={e=>sf('age',e.target.value)} required min="15" max="99" /></div>
                    <div className="lmis-field"><label className="lmis-label">Gender</label><select className="lmis-select" value={studentForm.gender} onChange={e=>sf('gender',e.target.value)}>{['Female','Male','Other','Prefer not to say'].map(g=><option key={g}>{g}</option>)}</select></div>
                    <div className="lmis-field"><label className="lmis-label">Population Group</label><select className="lmis-select" value={studentForm.population_group} onChange={e=>sf('population_group',e.target.value)}>{['Black African','Coloured','Indian/Asian','White','Other'].map(r=><option key={r}>{r}</option>)}</select></div>
                    <div className="lmis-field"><label className="lmis-label">Nationality</label><input className="lmis-input" value={studentForm.nationality} onChange={e=>sf('nationality',e.target.value)} /></div>
                    <div className="lmis-field"><label className="lmis-label">Province</label><select className="lmis-select" value={studentForm.province} onChange={e=>sf('province',e.target.value)}>{['Gauteng','Western Cape','KwaZulu-Natal','Eastern Cape','Free State','Limpopo','Mpumalanga','North West','Northern Cape'].map(p=><option key={p}>{p}</option>)}</select></div>
                    <div className="lmis-field"><label className="lmis-label">City / Town</label><input className="lmis-input" value={studentForm.city} onChange={e=>sf('city',e.target.value)} placeholder="e.g. Johannesburg" /></div>
                    <div className="lmis-field"><label className="lmis-label">Highest Qualification</label><select className="lmis-select" value={studentForm.highest_qualification} onChange={e=>sf('highest_qualification',e.target.value)}>{['Matric / Grade 12','Higher Certificate','Diploma',"Bachelor's Degree",'Honours / Postgraduate','Master\'s / Doctorate','Grade 10-11','Grade 9 or lower'].map(q=><option key={q}>{q}</option>)}</select></div>
                    <div className="lmis-field"><label className="lmis-label">Previous High School</label><input className="lmis-input" value={studentForm.previous_high_school} onChange={e=>sf('previous_high_school',e.target.value)} placeholder="e.g. Pretoria Boys High" /></div>
                    <div className="lmis-field"><label className="lmis-label">Matric / Certificate Year</label><input type="number" className="lmis-input" value={studentForm.matric_year} onChange={e=>sf('matric_year',e.target.value)} min="1970" max="2026" placeholder="2020" /></div>
                    <div className="lmis-field"><label className="lmis-label">Employee Number (if applicable)</label><input className="lmis-input" value={studentForm.employee_number} onChange={e=>sf('employee_number',e.target.value)} placeholder="e.g. EMP-9481 (optional)" /></div>
                  </div>

                  <p style={{fontWeight:700,fontSize:'0.72rem',textTransform:'uppercase',letterSpacing:'0.06em',color:'var(--text-sub)',margin:'1rem 0 0.6rem'}}>Learner Addresses</p>
                  <div className="lmis-form-grid">
                    <div className="lmis-field" style={{gridColumn:'1/-1'}}><label className="lmis-label">Physical Address (full street, suburb, city, code)</label><input className="lmis-input" value={studentForm.physical_address} onChange={e=>sf('physical_address',e.target.value)} required placeholder="e.g. 12 Oak Ave, Sandton, Johannesburg, 2196" /></div>
                    <div className="lmis-field" style={{gridColumn:'1/-1'}}><label className="lmis-label">Postal Address (leave blank if same as physical)</label><input className="lmis-input" value={studentForm.postal_address} onChange={e=>sf('postal_address',e.target.value)} placeholder="e.g. PO Box 1234, Sandton, 2196" /></div>
                  </div>

                  <p style={{fontWeight:700,fontSize:'0.72rem',textTransform:'uppercase',letterSpacing:'0.06em',color:'var(--text-sub)',margin:'1rem 0 0.6rem'}}>Next of Kin / Emergency Contact</p>
                  <div className="lmis-form-grid">
                    <div className="lmis-field"><label className="lmis-label">First Name(s)</label><input className="lmis-input" value={studentForm.nok_first_name} onChange={e=>sf('nok_first_name',e.target.value)} required placeholder="e.g. Sipho" /></div>
                    <div className="lmis-field"><label className="lmis-label">Surname</label><input className="lmis-input" value={studentForm.nok_surname} onChange={e=>sf('nok_surname',e.target.value)} required placeholder="e.g. Mthembu" /></div>
                    <div className="lmis-field"><label className="lmis-label">Phone</label><input className="lmis-input" value={studentForm.nok_phone} onChange={e=>sf('nok_phone',e.target.value)} required placeholder="+27 82 555 1234" /></div>
                    <div className="lmis-field"><label className="lmis-label">Relationship</label><input className="lmis-input" value={studentForm.nok_relation} onChange={e=>sf('nok_relation',e.target.value)} required placeholder="e.g. Parent, Spouse, Guardian" /></div>
                    <div className="lmis-field" style={{gridColumn:'1/-1'}}><label className="lmis-label">Physical Address</label><input className="lmis-input" value={studentForm.nok_physical_address} onChange={e=>sf('nok_physical_address',e.target.value)} placeholder="e.g. 5 Main St, Soweto, 1804" /></div>
                    <div className="lmis-field" style={{gridColumn:'1/-1'}}><label className="lmis-label">Postal Address (leave blank if same as physical)</label><input className="lmis-input" value={studentForm.nok_postal_address} onChange={e=>sf('nok_postal_address',e.target.value)} placeholder="e.g. PO Box 55, Soweto, 1804" /></div>
                  </div>

                  <p style={{fontWeight:700,fontSize:'0.72rem',textTransform:'uppercase',letterSpacing:'0.06em',color:'var(--text-sub)',margin:'1rem 0 0.6rem'}}>💰 Funding Model &amp; Stipend Eligibility</p>
                  <div className="lmis-form-grid" style={{ marginBottom: '0.75rem' }}>
                    <div className="lmis-field" style={{ gridColumn: '1/-1' }}>
                      <label className="lmis-label">Learner Funding Type *</label>
                      <div style={{ display: 'flex', gap: '0.75rem', marginTop: '0.25rem', flexWrap: 'wrap' }}>
                        <label style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', cursor: 'pointer', padding: '0.5rem 0.85rem', borderRadius: '6px', border: studentForm.funding_type === 'funded' ? '2px solid #10b981' : '1px solid var(--border-color, #cbd5e1)', background: studentForm.funding_type === 'funded' ? 'rgba(16,185,129,0.08)' : 'transparent' }}>
                          <input type="radio" name="funding_type" value="funded" checked={studentForm.funding_type === 'funded'} onChange={() => sf('funding_type', 'funded')} />
                          <span style={{ fontWeight: 600, fontSize: '0.82rem' }}>🟢 Funded Learner (Eligible for Monthly Stipends)</span>
                        </label>
                        <label style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', cursor: 'pointer', padding: '0.5rem 0.85rem', borderRadius: '6px', border: studentForm.funding_type === 'self_paying' ? '2px solid #3b82f6' : '1px solid var(--border-color, #cbd5e1)', background: studentForm.funding_type === 'self_paying' ? 'rgba(59,130,246,0.08)' : 'transparent' }}>
                          <input type="radio" name="funding_type" value="self_paying" checked={studentForm.funding_type === 'self_paying'} onChange={() => sf('funding_type', 'self_paying')} />
                          <span style={{ fontWeight: 600, fontSize: '0.82rem' }}>🔵 Self-Paying Learner (Tuition Fee Payer / No Stipend)</span>
                        </label>
                      </div>
                    </div>

                    {studentForm.funding_type === 'funded' ? (
                      <>
                        <div className="lmis-field">
                          <label className="lmis-label">Funder / Grant Sponsor *</label>
                          <select className="lmis-select" value={studentForm.funder_name} onChange={e => sf('funder_name', e.target.value)}>
                            {['Services SETA', 'W&RSETA', 'MICT SETA', 'CHIETA', 'NSFAS', 'Corporate Bursary', 'Department of Higher Education', 'Other / NGO'].map(f => (
                              <option key={f} value={f}>{f}</option>
                            ))}
                          </select>
                        </div>
                        <div className="lmis-field">
                          <label className="lmis-label">Monthly Stipend Allowance (ZAR) *</label>
                          <input type="number" className="lmis-input" value={studentForm.stipend_amount} onChange={e => sf('stipend_amount', e.target.value)} required min="0" placeholder="4500" />
                        </div>
                        <div className="lmis-field">
                          <label className="lmis-label">Beneficiary Bank Name *</label>
                          <select className="lmis-select" value={studentForm.bank_name} onChange={e => sf('bank_name', e.target.value)}>
                            {['Standard Bank', 'First National Bank (FNB)', 'Capitec Bank', 'Nedbank', 'Absa Bank', 'TymeBank', 'Discovery Bank', 'African Bank', 'Bidvest Bank', 'Other'].map(b => (
                              <option key={b} value={b}>{b}</option>
                            ))}
                          </select>
                        </div>
                        <div className="lmis-field">
                          <label className="lmis-label">Account Number *</label>
                          <input className="lmis-input" value={studentForm.bank_account_number} onChange={e => sf('bank_account_number', e.target.value)} required placeholder="e.g. 10148928374" />
                        </div>
                        <div className="lmis-field">
                          <label className="lmis-label">Branch Code</label>
                          <input className="lmis-input" value={studentForm.bank_branch_code} onChange={e => sf('bank_branch_code', e.target.value)} placeholder="051001" />
                        </div>
                        <div className="lmis-field">
                          <label className="lmis-label">Account Type</label>
                          <select className="lmis-select" value={studentForm.bank_account_type} onChange={e => sf('bank_account_type', e.target.value)}>
                            {['Savings', 'Cheque / Current', 'Transmission'].map(t => <option key={t} value={t}>{t}</option>)}
                          </select>
                        </div>
                        <div className="lmis-field" style={{ gridColumn: '1/-1' }}>
                          <label className="lmis-label">Account Holder Name</label>
                          <input className="lmis-input" value={studentForm.bank_account_holder} onChange={e => sf('bank_account_holder', e.target.value)} placeholder="Leave blank to use Learner Full Name" />
                        </div>
                      </>
                    ) : (
                      <div className="lmis-field" style={{ gridColumn: '1/-1', background: 'rgba(59,130,246,0.06)', padding: '0.75rem', borderRadius: '6px', border: '1px solid rgba(59,130,246,0.2)' }}>
                        <p style={{ margin: 0, fontSize: '0.78rem', color: 'var(--text-sub)' }}>
                          ℹ️ <strong>Self-Paying Learner Notice:</strong> This learner will be billed for tuition and module fees. They will <strong>not</strong> receive monthly living stipends.
                        </p>
                      </div>
                    )}
                  </div>

                  <p style={{fontWeight:700,fontSize:'0.72rem',textTransform:'uppercase',letterSpacing:'0.06em',color:'var(--text-sub)',margin:'1rem 0 0.6rem'}}>📎 Compliance &amp; Supporting Documents</p>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginBottom: '1rem' }}>
                    <FileAttachmentZone
                      label="1. ID / Passport Copy (PDF or Image)"
                      attachments={studentForm.id_copy_attachments || []}
                      onChange={(att) => sf('id_copy_attachments', att)}
                      maxFiles={2}
                      bucket="student-documents"
                      filePathPrefix="id_documents"
                    />
                    <FileAttachmentZone
                      label="2. Proof of Bank Account (PDF or Image)"
                      attachments={studentForm.bank_proof_attachments || []}
                      onChange={(att) => sf('bank_proof_attachments', att)}
                      maxFiles={2}
                      bucket="student-documents"
                      filePathPrefix="banking"
                    />
                  </div>

                  <div style={{ background: 'rgba(59, 130, 246, 0.08)', border: '1px solid rgba(59, 130, 246, 0.25)', borderRadius: '8px', padding: '0.85rem', margin: '1rem 0' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.35rem' }}>
                      <span style={{ fontSize: '1rem' }}>🔒</span>
                      <strong style={{ fontSize: '0.8rem', color: 'var(--text-main, #0f172a)' }}>POPIA &amp; Data Privacy Compliance Notice</strong>
                    </div>
                    <p style={{ fontSize: '0.74rem', color: 'var(--text-sub)', margin: 0, lineHeight: 1.4 }}>
                      All personal identification numbers, contact information, and verification documents are processed strictly in accordance with South Africa's Protection of Personal Information Act (POPIA) for academic registration and institutional record-keeping. Documents are stored in access-restricted private storage with time-limited signed access.
                    </p>
                  </div>

                  <div className="lmis-form-actions">
                    <button type="button" className="btn btn-sm btn-ghost" onClick={() => setShowStudentForm(false)}>Cancel</button>
                    <button
                      type="submit"
                      className="btn btn-sm btn-gold"
                      disabled={isRegisteringStudent}
                      style={{ opacity: isRegisteringStudent ? 0.6 : 1, cursor: isRegisteringStudent ? 'wait' : 'pointer' }}
                    >
                      {isRegisteringStudent ? 'Registering Learner...' : <><IcoPlus size={14} /> Register Learner</>}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}

          {showEnrollForm && (() => {
            const selectedLearnerEnrolledCodes = new Set(
              enrollments
                .filter(e => (e.learner_email || '').toLowerCase().trim() === (enrollForm.learner_email || '').toLowerCase().trim())
                .map(e => (e.course_code || '').trim().toLowerCase())
            );
            const isSelectedCourseAlreadyEnrolled = enrollForm.course_code && selectedLearnerEnrolledCodes.has((enrollForm.course_code || '').trim().toLowerCase());
            const selectedStudent = student_profiles.find(p => (p.learner_email || '').toLowerCase().trim() === (enrollForm.learner_email || '').toLowerCase().trim());

            return (
              <div className="lmis-card mb-4" style={{ border: isSelectedCourseAlreadyEnrolled ? '1px solid #f87171' : '1px solid var(--ice2)' }}>
                <div className="lmis-card-header flex-between">
                  <span className="lmis-card-title">Enrol Learner in Module</span>
                  <button className="btn btn-sm btn-ghost" onClick={() => setShowEnrollForm(false)}><IcoX size={14} /></button>
                </div>
                <div className="lmis-card-body">
                  <form onSubmit={handleEnroll}>
                    <div className="lmis-form-grid">
                      <div className="lmis-field">
                        <label className="lmis-label">Select Learner</label>
                        <select className="lmis-select" value={enrollForm.learner_email} onChange={e => setEnrollForm({ ...enrollForm, learner_email: e.target.value })} required>
                          <option value="">-- Select Learner --</option>
                          {student_profiles.map(p => <option key={p.id} value={p.learner_email}>{p.learner_name} — {p.student_number}</option>)}
                        </select>
                      </div>
                      <div className="lmis-field">
                        <label className="lmis-label">Select Module / Course</label>
                        <select className="lmis-select" value={enrollForm.course_code} onChange={e => setEnrollForm({ ...enrollForm, course_code: e.target.value.trim() })} required>
                          <option value="">-- Select Course --</option>
                          {courses.map(c => {
                            const cCode = (c.code || '').trim();
                            const isEnrolled = enrollForm.learner_email && selectedLearnerEnrolledCodes.has(cCode.toLowerCase());
                            return (
                              <option key={c.id} value={cCode} disabled={isEnrolled} style={isEnrolled ? { color: '#94a3b8', fontStyle: 'italic' } : {}}>
                                {(c.title || '').trim()} ({cCode}) {isEnrolled ? '— ⛔ [ALREADY ENROLLED]' : ''}
                              </option>
                            );
                          })}
                        </select>
                      </div>

                      {/* Prominent Duplicate Enrollment Warning Alert */}
                      {isSelectedCourseAlreadyEnrolled && (
                        <div style={{ gridColumn: '1/-1', background: '#fef2f2', border: '1px solid #f87171', color: '#991b1b', padding: '0.85rem 1rem', borderRadius: '8px', fontSize: '0.82rem', display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                          <span style={{ fontSize: '1.3rem' }}>⛔</span>
                          <div>
                            <strong>Duplicate Enrolment Blocked:</strong>{' '}
                            Learner <strong>{selectedStudent?.learner_name || enrollForm.learner_email}</strong> is already enrolled in module <strong>{enrollForm.course_code}</strong>. Each learner can only be enrolled in a module once.
                          </div>
                        </div>
                      )}
                    </div>
                    <div className="lmis-form-actions">
                      <button type="button" className="btn btn-sm btn-ghost" onClick={() => setShowEnrollForm(false)}>Cancel</button>
                      <button
                        type="submit"
                        className="btn btn-sm btn-gold"
                        disabled={isEnrolling || isSelectedCourseAlreadyEnrolled || !enrollForm.learner_email || !enrollForm.course_code}
                        style={{ opacity: (isEnrolling || isSelectedCourseAlreadyEnrolled || !enrollForm.learner_email || !enrollForm.course_code) ? 0.5 : 1, cursor: (isEnrolling || isSelectedCourseAlreadyEnrolled) ? 'not-allowed' : 'pointer' }}
                      >
                        {isEnrolling ? 'Enrolling...' : <><IcoCheck size={14} /> Enrol &amp; Generate Invoice</>}
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            );
          })()}

          
          {/* Register Lecturer Modal */}
          {showLecturerForm && (
            <div className="lmis-card mb-4">
              <div className="lmis-card-header flex-between">
                <span className="lmis-card-title">👨‍🏫 Register New Lecturer</span>
                <button className="btn btn-sm btn-ghost" onClick={() => setShowLecturerForm(false)}><IcoX size={14} /></button>
              </div>
              <div className="lmis-card-body">
                <form onSubmit={handleRegisterLecturer}>
                  <div className="lmis-form-grid">
                    <div className="lmis-field">
                      <label className="lmis-label">Full Name &amp; Title</label>
                      <input className="lmis-input" value={lecturerForm.name} onChange={e => setLecturerForm({ ...lecturerForm, name: e.target.value })} required placeholder="e.g. Dr. Sipho Khumalo" />
                    </div>
                    <div className="lmis-field">
                      <label className="lmis-label">Email Address</label>
                      <input type="email" className="lmis-input" value={lecturerForm.email} onChange={e => setLecturerForm({ ...lecturerForm, email: e.target.value })} required placeholder="lecturer@nexa-transform.com" />
                    </div>
                    <div className="lmis-field">
                      <label className="lmis-label">Phone Number</label>
                      <input className="lmis-input" value={lecturerForm.phone} onChange={e => setLecturerForm({ ...lecturerForm, phone: e.target.value })} required placeholder="+27 82 123 4567" />
                    </div>
                    <div className="lmis-field">
                      <label className="lmis-label">Assigned Module / Specialization *</label>
                      <select
                        className="lmis-select"
                        value={lecturerForm.assigned_course_code || (availableCourseOptions.find(m => m.title === lecturerForm.department)?.code) || 'ADS'}
                        onChange={e => {
                          const code = e.target.value;
                          const found = availableCourseOptions.find(m => m.code === code);
                          setLecturerForm({
                            ...lecturerForm,
                            assigned_course_code: code,
                            department: found ? found.title : code
                          });
                        }}
                      >
                        {availableCourseOptions.map(m => (
                          <option key={m.code} value={m.code}>{m.code} · {m.title}</option>
                        ))}
                      </select>
                    </div>
                    <div className="lmis-field">
                      <label className="lmis-label">Academic Title</label>
                      <input className="lmis-input" value={lecturerForm.title} onChange={e => setLecturerForm({ ...lecturerForm, title: e.target.value })} placeholder="e.g. Senior Lecturer / Lead Academic" />
                    </div>
                    <div className="lmis-field" style={{ gridColumn: '1/-1' }}>
                      <label className="lmis-label">🔑 Temporary Password for Lecturer Login</label>
                      <div style={{ display: 'flex', gap: '0.5rem' }}>
                        <input className="lmis-input" value={lecturerForm.password} onChange={e => setLecturerForm({ ...lecturerForm, password: e.target.value })} required placeholder="Enter temporary password" />
                        <button type="button" className="btn btn-sm btn-outline" onClick={() => setLecturerForm({ ...lecturerForm, password: 'NexaLec#' + Math.floor(1000 + Math.random() * 9000) })}>
                          🎲 Generate
                        </button>
                      </div>
                    </div>
                  </div>
                  {/* Statutory Document Attachments */}
                  <div style={{ gridColumn: '1 / -1', marginTop: '1rem', paddingTop: '1rem', borderTop: '1px solid #e2e8f0' }}>
                    <h4 style={{ fontSize: '0.85rem', fontWeight: 800, color: 'var(--primary-navy)', marginBottom: '0.75rem' }}>
                      📎 Statutory Faculty Compliance Documents
                    </h4>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1rem' }}>
                      <div>
                        <label style={{ fontSize: '0.75rem', fontWeight: 700, display: 'block', marginBottom: '0.25rem' }}>Certified ID / Passport Copy</label>
                        <FileAttachmentZone
                          bucket="lecturer-documents"
                          folder={`id-copies/${lecturerForm.email || 'admin-upload'}`}
                          onUploadComplete={(files) => setLecturerForm({ ...lecturerForm, id_copy_attachments: files })}
                          existingFiles={lecturerForm.id_copy_attachments || []}
                          maxFiles={2}
                          label="Drop ID Copy (PDF/PNG)"
                        />
                      </div>
                      <div>
                        <label style={{ fontSize: '0.75rem', fontWeight: 700, display: 'block', marginBottom: '0.25rem' }}>Academic Degree / Qualifications</label>
                        <FileAttachmentZone
                          bucket="lecturer-documents"
                          folder={`qualifications/${lecturerForm.email || 'admin-upload'}`}
                          onUploadComplete={(files) => setLecturerForm({ ...lecturerForm, qualification_proof_attachments: files })}
                          existingFiles={lecturerForm.qualification_proof_attachments || []}
                          maxFiles={5}
                          label="Drop Qualifications (PDF)"
                        />
                      </div>
                      <div>
                        <label style={{ fontSize: '0.75rem', fontWeight: 700, display: 'block', marginBottom: '0.25rem' }}>Comprehensive CV / Resume</label>
                        <FileAttachmentZone
                          bucket="lecturer-documents"
                          folder={`resumes/${lecturerForm.email || 'admin-upload'}`}
                          onUploadComplete={(files) => setLecturerForm({ ...lecturerForm, cv_attachments: files })}
                          existingFiles={lecturerForm.cv_attachments || []}
                          maxFiles={2}
                          label="Drop Academic CV (PDF)"
                        />
                      </div>
                      <div>
                        <label style={{ fontSize: '0.75rem', fontWeight: 700, display: 'block', marginBottom: '0.25rem' }}>Proof of Bank / Tax Document</label>
                        <FileAttachmentZone
                          bucket="lecturer-documents"
                          folder={`banking/${lecturerForm.email || 'admin-upload'}`}
                          onUploadComplete={(files) => setLecturerForm({ ...lecturerForm, bank_proof_attachments: files })}
                          existingFiles={lecturerForm.bank_proof_attachments || []}
                          maxFiles={2}
                          label="Drop Bank Proof / SARS"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="lmis-form-actions" style={{ marginTop: '1.25rem' }}>
                    <button type="button" className="btn btn-sm btn-ghost" onClick={() => setShowLecturerForm(false)}>Cancel</button>
                    <button type="submit" className="btn btn-sm btn-primary"><IcoPlus size={14} /> Register Lecturer &amp; Save Records</button>
                  </div>
                </form>
              </div>
            </div>
          )}

          {/* Register Admin Modal */}
          {showAdminForm && (
            <div className="lmis-card mb-4">
              <div className="lmis-card-header flex-between">
                <span className="lmis-card-title">🛡 Register New Admin Account</span>
                <button className="btn btn-sm btn-ghost" onClick={() => setShowAdminForm(false)}><IcoX size={14} /></button>
              </div>
              <div className="lmis-card-body">
                <form onSubmit={handleRegisterAdmin}>
                  <div className="lmis-form-grid">
                    <div className="lmis-field">
                      <label className="lmis-label">Full Name</label>
                      <input className="lmis-input" value={adminForm.name} onChange={e => setAdminForm({ ...adminForm, name: e.target.value })} required placeholder="e.g. Nomvula Dlamini" />
                    </div>
                    <div className="lmis-field">
                      <label className="lmis-label">Email Address</label>
                      <input type="email" className="lmis-input" value={adminForm.email} onChange={e => setAdminForm({ ...adminForm, email: e.target.value })} required placeholder="admin@nexa-transform.com" />
                    </div>
                    <div className="lmis-field">
                      <label className="lmis-label">Phone Number</label>
                      <input className="lmis-input" value={adminForm.phone} onChange={e => setAdminForm({ ...adminForm, phone: e.target.value })} required placeholder="+27 83 123 4567" />
                    </div>
                    <div className="lmis-field">
                      <label className="lmis-label">Admin Role / Level</label>
                      <select className="lmis-select" value={adminForm.role} onChange={e => setAdminForm({ ...adminForm, role: e.target.value })}>
                        <option value="Super Admin">Super Admin (All Privileges)</option>
                        <option value="Finance Officer">Finance Officer (Stipends &amp; Banking)</option>
                        <option value="Academic Registrar">Academic Registrar (Learners &amp; Modules)</option>
                        <option value="Quality Assurance Officer">Quality Assurance Officer (Compliance)</option>
                      </select>
                    </div>
                  </div>
                  <div className="lmis-form-actions" style={{ marginTop: '1rem' }}>
                    <button type="button" className="btn btn-sm btn-ghost" onClick={() => setShowAdminForm(false)}>Cancel</button>
                    <button type="submit" className="btn btn-sm btn-gold"><IcoPlus size={14} /> Register Admin &amp; Send Credentials</button>
                  </div>
                </form>
              </div>
            </div>
          )}

          {/* User toggle & search */}
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.75rem', alignItems: 'center', marginBottom: '1rem' }}>
            <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
              <button key="Learners" onClick={() => setUserTab('Learners')} className={`btn btn-sm ${userTab === 'Learners' ? 'btn-primary' : 'btn-outline'}`} style={{ fontWeight: 700 }}>
                🎓 Learners ({student_profiles.length})
              </button>
              <button key="Lecturers" onClick={() => setUserTab('Lecturers')} className={`btn btn-sm ${userTab === 'Lecturers' ? 'btn-primary' : 'btn-outline'}`}>
                👨‍🏫 Lecturers ({courses.filter(c => c.lecturer_email).length || uniqueLecturers.length})
              </button>
              <button key="Admins" onClick={() => setUserTab('Admins')} className={`btn btn-sm ${userTab === 'Admins' ? 'btn-primary' : 'btn-outline'}`}>
                🛡️ Admins ({system_admins.length})
              </button>
            </div>
            {userTab === 'Learners' && (
              <div style={{ display: 'flex', gap: '0.35rem', background: 'var(--ice2, rgba(0,0,0,0.04))', padding: '0.2rem', borderRadius: '6px' }}>
                <button
                  type="button"
                  onClick={() => setLearnerFilterType('all')}
                  className={`btn btn-sm ${learnerFilterType === 'all' ? 'btn-primary' : 'btn-ghost'}`}
                  style={{ fontSize: '0.72rem', padding: '0.2rem 0.55rem' }}
                >
                  All ({student_profiles.length})
                </button>
                <button
                  type="button"
                  onClick={() => setLearnerFilterType('funded')}
                  className={`btn btn-sm ${learnerFilterType === 'funded' ? 'btn-primary' : 'btn-ghost'}`}
                  style={{ fontSize: '0.72rem', padding: '0.2rem 0.55rem' }}
                >
                  🟢 Funded ({student_profiles.filter(p => p.funding_type !== 'self_paying').length})
                </button>
                <button
                  type="button"
                  onClick={() => setLearnerFilterType('self_paying')}
                  className={`btn btn-sm ${learnerFilterType === 'self_paying' ? 'btn-primary' : 'btn-ghost'}`}
                  style={{ fontSize: '0.72rem', padding: '0.2rem 0.55rem' }}
                >
                  🔵 Self-Paying ({student_profiles.filter(p => p.funding_type === 'self_paying').length})
                </button>
              </div>
            )}
            <input className="lmis-input" style={{ maxWidth: '240px', flex: 1 }} placeholder="Search name, email, funder..." value={searchQ} onChange={e => setSearchQ(e.target.value)} />
          </div>

          <div className="lmis-card">
            <div className="lmis-table-wrap">
              <table className="lmis-table">
                <thead>
                  <tr>
                    <th>Name</th><th>Email</th>
                    {userTab === 'Learners' ? <><th>Student No.</th><th>Funding / Stipend</th><th>Enrolments</th><th>Status</th><th>Actions</th></> : userTab === 'Lecturers' ? <><th>Courses</th><th>Role</th><th>Actions</th></> : <><th>Role</th><th>Status</th><th>Actions</th></>}
                  </tr>
                </thead>
                <tbody>
                  {userTab === 'Learners'
                    ? learnerList.map(p => (
                      <tr key={p.id}>
                        <td style={{ fontWeight: 600 }}>{p.learner_name}</td>
                        <td style={{ color: 'var(--text-sub)' }}>{p.learner_email}</td>
                        <td><span className="badge badge-navy">{p.student_number}</span></td>
                        <td>
                          {p.funding_type === 'self_paying' ? (
                            <span className="badge badge-navy" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.25rem' }}>
                              🔵 Self-Paying
                            </span>
                          ) : (
                            <span className="badge badge-emerald" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.25rem' }}>
                              🟢 Funded ({p.funder_name || 'SETA'} · R{Number(p.stipend_amount || 4500).toLocaleString('en-ZA')})
                            </span>
                          )}
                        </td>
                        <td>{enrollments.filter(e => e.learner_email === p.learner_email).length}</td>
                        <td><span className="badge badge-emerald">Active</span></td>
                        <td style={{ display: 'flex', gap: '0.35rem', flexWrap: 'wrap' }}>
                          <button
                            type="button"
                            className="btn btn-sm btn-ghost"
                            style={{ fontSize: '0.68rem', padding: '0.25rem 0.55rem', fontWeight: 600, border: '1px solid var(--border-color)' }}
                            onClick={() => handleViewLearnerProfile(p)}
                            title="View comprehensive learner profile & stipend particulars"
                          >
                            👁️ View
                          </button>
                          <button
                            type="button"
                            className="btn btn-sm btn-ghost"
                            style={{ fontSize: '0.68rem', padding: '0.25rem 0.55rem', fontWeight: 600, border: '1px solid var(--border-color)' }}
                            onClick={() => handleViewLearnerPoE(p)}
                            title="View learner Portfolio of Evidence (PoE)"
                          >
                            📂 PoE
                          </button>
                          {canDisburseStipends && p.funding_type !== 'self_paying' && (
                            <button
                              type="button"
                              className="btn btn-sm btn-gold"
                              style={{ fontSize: '0.68rem', padding: '0.25rem 0.55rem', fontWeight: 700 }}
                              onClick={() => {
                                setStipendLearnerSearch(p.learner_name || p.learner_email);
                                setActiveTab('stipends');
                              }}
                              title="Open Stipends & Disbursements for this learner"
                            >
                              💳 Stipend
                            </button>
                          )}
                          {canManageLearners && (
                            <button className="btn btn-sm btn-primary" style={{ fontSize: '0.68rem', padding: '0.25rem 0.6rem' }} onClick={() => {
                              setEditingStudent(p);
                              setEditStudentForm({
                                learner_name: p.learner_name || '',
                                learner_email: p.learner_email || '',
                                phone: p.phone || '',
                                id_passport: p.id_passport || '',
                                student_number: p.student_number || '',
                                qualification: p.qualification || '',
                                programme_enrolled: p.programme_enrolled || p.qualification || 'Business Process and Work Study Management',
                                employment_status: p.employment_status || 'Unemployed',
                                city: p.city || '',
                                province: p.province || 'Gauteng',
                                funding_type: p.funding_type || 'funded',
                                funder_name: p.funder_name || (p.funding_type === 'self_paying' ? 'Self-Funded' : 'Services SETA'),
                                stipend_amount: p.funding_type === 'self_paying' ? 0 : Number(p.stipend_amount || 4500),
                                bank_name: p.bank_name || 'Standard Bank',
                                bank_account_number: p.bank_account_number || '',
                                bank_branch_code: p.bank_branch_code || '051001',
                                bank_account_type: p.bank_account_type || 'Savings',
                                bank_account_holder: p.bank_account_holder || p.learner_name || ''
                              });
                            }}>✏ Edit</button>
                          )}
                          {canManageLearners && (
                            <button className="btn btn-sm btn-outline" style={{ fontSize: '0.68rem', padding: '0.25rem 0.6rem' }} onClick={() => {
                              sendWelcomeEmail({ name: p.learner_name, email: p.learner_email, idNumber: p.student_number, role: 'Learner' });
                              showToast(`Welcome email sent to ${p.learner_email}`);
                            }}>✉ Send Welcome</button>
                          )}
                          <button className="btn btn-sm btn-gold" style={{ fontSize: '0.68rem', padding: '0.25rem 0.6rem' }} onClick={() => {
                            generateProofOfRegistrationPDF({
                              name: p.learner_name,
                              email: p.learner_email,
                              number: p.student_number,
                              role: 'Learner',
                              idPassport: p.id_passport,
                              phone: p.phone,
                              qualification: p.qualification || 'Business Process and Work Study Management'
                            });
                            showToast(`Proof of Registration PDF generated for ${p.learner_name}!`);
                          }}>📥 Download PDF</button>
                          {canCaptureGrades && (
                            <button className="btn btn-sm btn-outline" style={{ fontSize: '0.68rem', padding: '0.25rem 0.6rem', fontWeight: 600 }} onClick={() => {
                              const studentEnrs = enrollments.filter(e => (e.learner_email || '').toLowerCase().trim() === (p.learner_email || '').toLowerCase().trim());
                              const courseCode = studentEnrs[0]?.course_code || courses[0]?.code || '';
                              handleOpenAdminMarkCapture(courseCode, '', p.learner_email);
                            }}>🎯 Capture Marks</button>
                          )}
                          {canDelete && (
                            <button className="btn btn-sm btn-danger" style={{ fontSize: '0.68rem', padding: '0.25rem 0.6rem' }} onClick={() => {
                              if (window.confirm(`Are you sure you want to permanently delete learner "${p.learner_name}" (${p.student_number})? This will also remove their enrollments and submissions.`)) {
                                deleteStudent(p.id, currentAdmin?.name || loginEmail || 'Super Admin', currentRole);
                                showToast(`Deleted learner ${p.learner_name}`);
                              }
                            }}>🗑 Delete</button>
                          )}
                        </td>
                      </tr>
                    ))
                    : userTab === 'Lecturers'
                    ? (system_lecturers || [])
                        .filter(l => !searchQ || l.name.toLowerCase().includes(searchQ.toLowerCase()) || l.email.toLowerCase().includes(searchQ.toLowerCase()))
                        .map(l => (
                          <tr key={l.email}>
                            <td style={{ fontWeight: 600 }}>{l.name}</td>
                            <td style={{ color: 'var(--text-sub)' }}>{l.email}</td>
                            <td>{courses.filter(c => c.lecturer_email === l.email).length} course(s)</td>
                            <td>
                              <span className="badge badge-teal" style={{ display: 'block', marginBottom: '0.2rem' }}>{l.title || 'Lecturer'}</span>
                              <span className="badge badge-gold" style={{ fontSize: '0.7rem' }}>🔑 {l.password || l.temp_password || 'NexaLec#2026'}</span>
                            </td>
                            <td style={{ display: 'flex', gap: '0.35rem', flexWrap: 'wrap' }}>
                              <button className="btn btn-sm btn-outline" style={{ fontSize: '0.68rem', padding: '0.25rem 0.6rem', color: '#0d9488', borderColor: '#0d9488' }} onClick={() => setViewingLecturerDocs(l)}>
                                📄 Compliance Docs ({(l.qualification_proof_attachments || []).length + (l.id_copy_attachments || []).length + (l.cv_attachments || []).length})
                              </button>
                              <button className="btn btn-sm btn-primary" style={{ fontSize: '0.68rem', padding: '0.25rem 0.6rem' }} onClick={() => {
                                const matchedCode = courses.find(c => (c.lecturer_email || '').toLowerCase().trim() === (l.email || '').toLowerCase().trim())?.code ||
                                  courses.find(c => l.department && (c.title?.toLowerCase() === l.department.toLowerCase() || c.code?.toLowerCase() === l.department.toLowerCase()))?.code || '';
                                setEditingLecturer(l);
                                setEditLecForm({
                                  name: l.name || '',
                                  email: l.email || '',
                                  phone: l.phone || '+27 82 000 0000',
                                  department: l.department || 'Applied Digital Skills and Enterprise Web Management',
                                  assigned_course_code: matchedCode,
                                  title: l.title || 'Lecturer',
                                  password: l.password || l.temp_password || 'NexaLec#2026'
                                });
                              }}>✏ Edit &amp; Password</button>
                              <button className="btn btn-sm btn-outline" style={{ fontSize: '0.68rem', padding: '0.25rem 0.6rem' }} onClick={() => {
                                sendWelcomeEmail({ name: l.name, email: l.email, idNumber: `Password: ${l.password || l.temp_password || 'NexaLec#2026'}`, role: 'Lecturer' });
                                showToast(`Welcome email sent to ${l.email}`);
                              }}>✉ Send Email</button>
                              <button className="btn btn-sm btn-gold" style={{ fontSize: '0.68rem', padding: '0.25rem 0.6rem' }} onClick={() => {
                                generateProofOfRegistrationPDF({
                                  name: l.name,
                                  email: l.email,
                                  number: 'LEC-' + Math.floor(1000 + Math.random() * 9000),
                                  role: 'Lecturer',
                                  phone: l.phone || '—',
                                  qualification: 'Business Process and Work Study Management'
                                });
                                showToast(`Proof of Registration PDF generated for ${l.name}!`);
                              }}>📥 Download PDF</button>
                              {canDelete && (
                                <button className="btn btn-sm btn-danger" style={{ fontSize: '0.68rem', padding: '0.25rem 0.6rem' }} onClick={() => {
                                  if (window.confirm(`Are you sure you want to permanently remove lecturer "${l.name}" (${l.email})?`)) {
                                    deleteLecturer(l.id || l.email, currentAdmin?.name || loginEmail || 'Super Admin', currentRole);
                                    showToast(`Removed lecturer ${l.name}`);
                                  }
                                }}>🗑 Delete</button>
                              )}
                            </td>
                          </tr>
                        ))
                    : adminList.map(a => {
                        const currentAdminEmail = (currentAdmin?.email || loginEmail || '').toLowerCase().trim();
                        const isSelf = (a.email || '').toLowerCase().trim() === currentAdminEmail;
                        return (
                          <tr key={a.id || a.email}>
                            <td style={{ fontWeight: 600 }}>{a.name}</td>
                            <td style={{ color: 'var(--text-sub)' }}>{a.email}</td>
                            <td><span className="badge badge-gold">{a.role || 'Admin'}</span></td>
                            <td><span className="badge badge-emerald">Active</span></td>
                            <td style={{ display: 'flex', gap: '0.35rem', flexWrap: 'wrap' }}>
                              <button className="btn btn-sm btn-outline" style={{ fontSize: '0.68rem', padding: '0.25rem 0.6rem' }} onClick={() => {
                                sendWelcomeEmail({ name: a.name, email: a.email, idNumber: 'Admin Account', role: 'Admin' });
                                showToast(`Welcome email sent to ${a.email}`);
                              }}>✉ Send Welcome Email</button>
                              <button className="btn btn-sm btn-gold" style={{ fontSize: '0.68rem', padding: '0.25rem 0.6rem' }} onClick={() => {
                                generateProofOfRegistrationPDF({
                                  name: a.name,
                                  email: a.email,
                                  number: 'ADM-' + Math.floor(1000 + Math.random() * 9000),
                                  role: 'Admin',
                                  phone: a.phone || '—',
                                  qualification: 'Business Process and Work Study Management'
                                });
                                showToast(`Proof of Registration PDF generated for ${a.name}!`);
                              }}>📥 Download PDF</button>
                              {canDelete && (
                                <button
                                  className="btn btn-sm btn-danger"
                                  style={{ fontSize: '0.68rem', padding: '0.25rem 0.6rem' }}
                                  title={isSelf ? "Cannot delete currently logged-in account" : `Delete ${a.name}`}
                                  onClick={async () => {
                                    if (isSelf) {
                                      alert('You cannot delete your own currently logged-in administrator account.');
                                      return;
                                    }
                                    if (window.confirm(`Are you sure you want to permanently delete administrator "${a.name}" (${a.email})?`)) {
                                      await deleteAdmin(a.id || a.email, currentAdmin?.name || loginEmail || 'Super Admin', currentRole);
                                      showToast(`Deleted administrator ${a.name}`);
                                    }
                                  }}
                                >
                                  🗑 Delete
                                </button>
                              )}
                            </td>
                          </tr>
                        );
                      })
                  }
                  {(userTab === 'Learners' ? learnerList : userTab === 'Lecturers' ? lecturerList : adminList).length === 0 && (
                    <tr><td colSpan="6" style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-sub)' }}>No {userTab.toLowerCase()} found.</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ACADEMIC MARKS & GRADE CAPTURE (ADMIN) */}
      {activeTab === 'grades' && (() => {
        const selCourse = adminMarkCourse || (courses[0]?.code || '');
        const enrolledInCourse = enrollments.filter(e =>
          (e.course_code || '').toUpperCase().trim() === (selCourse || '').toUpperCase().trim()
        );

        const courseAssigns = assignments.filter(a =>
          (a.course_code || '').toUpperCase().trim() === (selCourse || '').toUpperCase().trim()
        );

        // Deduplicate learners in this course
        const uniqueEnrolledEmails = Array.from(new Set(enrolledInCourse.map(e => (e.learner_email || '').toLowerCase().trim()))).filter(Boolean);

        const learnerRecords = uniqueEnrolledEmails.map(email => {
          const profile = student_profiles.find(p => (p.learner_email || '').toLowerCase().trim() === email);
          const enr = enrolledInCourse.find(e => (e.learner_email || '').toLowerCase().trim() === email);
          const regDate = profile?.created_date || profile?.created_at || enr?.enrollment_date || null;

          const record = calculateModuleAcademicRecord({
            courseCode: selCourse,
            learnerEmail: email,
            submissions,
            quizAttempts: quiz_attempts,
            assignments,
            quizzes,
            registrationDate: regDate,
            enrollmentDate: enr?.enrollment_date
          });

          return {
            email,
            name: profile?.learner_name || enr?.learner_name || email.split('@')[0],
            student_number: profile?.student_number || '—',
            enr_date: enr?.enrollment_date,
            ...record
          };
        }).filter(l => {
          if (!adminMarkSearch.trim()) return true;
          const q = adminMarkSearch.toLowerCase();
          return l.name.toLowerCase().includes(q) || l.email.toLowerCase().includes(q) || l.student_number.toLowerCase().includes(q);
        });

        const totalEnrolled = uniqueEnrolledEmails.length;
        const dpAdmittedCount = learnerRecords.filter(l => l.is_exam_admitted).length;
        const evaluatedRecords = learnerRecords.filter(l => l.cass_mark !== null);
        const avgCass = evaluatedRecords.length > 0
          ? Math.round(evaluatedRecords.reduce((s, l) => s + l.cass_mark, 0) / evaluatedRecords.length)
          : null;

        return (
          <div>
            <div className="lmis-page-header flex-between" style={{ flexWrap: 'wrap', gap: '0.75rem' }}>
              <div>
                <h1 className="lmis-page-title" style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                  <IcoAward size={24} style={{ color: 'var(--gold)' }} />
                  Academic Marks &amp; Grade Capture
                </h1>
                <p className="lmis-page-sub">
                  Capture and adjust marks for coursework, written tests, and exams to assist lecturers and maintain official institutional records.
                </p>
              </div>
              <button
                type="button"
                className="btn btn-sm btn-gold"
                onClick={() => handleOpenAdminMarkCapture(selCourse)}
                style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontWeight: 700 }}
              >
                <IcoPlus size={14} /> Capture / Enter Marks
              </button>
            </div>

            {/* Selector & Search Filters */}
            <div className="lmis-card mb-4" style={{ padding: '1rem 1.25rem', background: 'var(--bg-card)' }}>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1rem', alignItems: 'center' }}>
                <div>
                  <label className="lmis-label" style={{ marginBottom: '0.35rem' }}>Select Module / Course</label>
                  <select
                    className="lmis-select"
                    value={selCourse}
                    onChange={e => handleAdminMarkCourseChange(e.target.value)}
                  >
                    {courses.map(c => (
                      <option key={c.id || c.code} value={c.code}>
                        {c.code} — {c.title}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="lmis-label" style={{ marginBottom: '0.35rem' }}>Filter by Learner</label>
                  <input
                    type="text"
                    className="lmis-input"
                    placeholder="Search by student name, email, or student number..."
                    value={adminMarkSearch}
                    onChange={e => setAdminMarkSearch(e.target.value)}
                  />
                </div>
              </div>
            </div>

            {/* KPI Summary Cards */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
              gap: '1rem',
              marginBottom: '1.5rem'
            }}>
              <div className="lmis-card" style={{ padding: '1.1rem', textAlign: 'center' }}>
                <div style={{ fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', color: 'var(--text-sub)' }}>Enrolled Learners</div>
                <div style={{ fontSize: '1.6rem', fontWeight: 900, color: 'var(--navy)', marginTop: '0.3rem' }}>{totalEnrolled}</div>
                <div style={{ fontSize: '0.72rem', color: 'var(--muted)', marginTop: '0.15rem' }}>Active in {selCourse}</div>
              </div>
              <div className="lmis-card" style={{ padding: '1.1rem', textAlign: 'center' }}>
                <div style={{ fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', color: 'var(--text-sub)' }}>Average Coursework Mark</div>
                <div style={{ fontSize: '1.6rem', fontWeight: 900, color: avgCass !== null && avgCass >= 50 ? 'var(--emerald)' : 'var(--gold)', marginTop: '0.3rem' }}>
                  {avgCass !== null ? `${avgCass}%` : '—'}
                </div>
                <div style={{ fontSize: '0.72rem', color: 'var(--muted)', marginTop: '0.15rem' }}>Class Average (CASS)</div>
              </div>
              <div className="lmis-card" style={{ padding: '1.1rem', textAlign: 'center' }}>
                <div style={{ fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', color: 'var(--text-sub)' }}>Exam Admitted (DP)</div>
                <div style={{ fontSize: '1.6rem', fontWeight: 900, color: '#047857', marginTop: '0.3rem' }}>
                  {dpAdmittedCount} <span style={{ fontSize: '0.85rem', fontWeight: 600 }}>({totalEnrolled > 0 ? Math.round((dpAdmittedCount / totalEnrolled) * 100) : 0}%)</span>
                </div>
                <div style={{ fontSize: '0.72rem', color: '#059669', marginTop: '0.15rem' }}>CASS &ge; 40% Met</div>
              </div>
            </div>

            {/* Enrolled Learners Roster Table */}
            <div className="lmis-card">
              <div className="lmis-table-wrap">
                <table className="lmis-table" style={{ fontSize: '0.82rem' }}>
                  <thead>
                    <tr>
                      <th>Learner</th>
                      <th style={{ textAlign: 'center' }}>Half Period Mark (CASS)</th>
                      <th style={{ textAlign: 'center' }}>Exam Adm.</th>
                      <th style={{ textAlign: 'center' }}>Exam Mark (40%)</th>
                      <th style={{ textAlign: 'center' }}>Full Period Mark</th>
                      <th style={{ textAlign: 'center' }}>Outcome</th>
                      <th style={{ textAlign: 'center' }}>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {learnerRecords.length === 0 ? (
                      <tr>
                        <td colSpan="7" style={{ textAlign: 'center', padding: '2.5rem', color: 'var(--text-sub)' }}>
                          {adminMarkSearch ? 'No learner matches your search filter.' : `No learners are enrolled in ${selCourse}.`}
                        </td>
                      </tr>
                    ) : (
                      learnerRecords.map(l => (
                        <tr key={l.email}>
                          <td>
                            <div style={{ fontWeight: 700, color: 'var(--text-main)' }}>{l.name}</div>
                            <div style={{ fontSize: '0.74rem', color: 'var(--text-sub)' }}>{l.email}</div>
                            <span className="badge badge-navy" style={{ fontSize: '0.68rem', marginTop: '0.2rem' }}>{l.student_number}</span>
                          </td>
                          <td style={{ textAlign: 'center' }}>
                            {l.half_period_mark !== null && l.half_period_mark !== undefined ? (
                              <span style={{ fontWeight: 800, fontSize: '0.95rem', color: l.half_period_mark >= 50 ? 'var(--emerald)' : 'var(--gold)' }}>
                                {l.half_period_mark}%
                              </span>
                            ) : (
                              <span style={{ color: 'var(--muted)' }}>Pending</span>
                            )}
                          </td>
                          <td style={{ textAlign: 'center' }}>
                            <span className={`badge ${l.exam_admission_flag === 'Y' ? 'badge-emerald' : 'badge-orange'}`}>
                              {l.exam_admission_flag}
                            </span>
                          </td>
                          <td style={{ textAlign: 'center' }}>
                            {l.exam_mark !== null ? (
                              <span style={{ fontWeight: 700 }}>{l.exam_mark}%</span>
                            ) : (
                              <span style={{ color: 'var(--muted)' }}>—</span>
                            )}
                          </td>
                          <td style={{ textAlign: 'center' }}>
                            {l.full_period_mark !== null && l.full_period_mark !== undefined ? (
                              <span style={{ fontWeight: 900, fontSize: '1rem', color: l.full_period_mark >= 75 ? '#b45309' : l.full_period_mark >= 50 ? '#047857' : '#b91c1c' }}>
                                {l.full_period_mark}%
                              </span>
                            ) : (
                              <span style={{ color: 'var(--muted)' }}>—</span>
                            )}
                          </td>
                          <td style={{ textAlign: 'center' }}>
                            <span className={`badge ${l.academic_outcome.includes('Pass') ? 'badge-emerald' : 'badge-gold'}`} style={{ fontSize: '0.72rem' }}>
                              {l.academic_outcome}
                            </span>
                          </td>
                          <td style={{ textAlign: 'center' }}>
                            <button
                              type="button"
                              className="btn btn-xs btn-outline"
                              style={{ fontWeight: 600 }}
                              onClick={() => handleOpenAdminMarkCapture(selCourse, '', l.email)}
                            >
                              🎯 Capture Mark
                            </button>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            {/* ── Admin Grade Appeals Management ── */}
            <div className="lmis-card mt-4">
              <div className="lmis-card-header flex-between">
                <span className="lmis-card-title">⚖️ Grade Appeals Management</span>
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  <span className="badge badge-gold">{(grade_appeals || []).filter(a => a.status === 'Pending' || a.status === 'Escalated').length} Open</span>
                  <span className="badge badge-navy">{(grade_appeals || []).filter(a => a.status !== 'Pending' && a.status !== 'Escalated').length} Resolved</span>
                </div>
              </div>
              <div className="lmis-card-body" style={{ padding: 0 }}>
                {(grade_appeals || []).length === 0 ? (
                  <div style={{ textAlign: 'center', padding: '2rem 1.5rem', color: 'var(--text-muted)' }}>
                    <p style={{ fontWeight: 600 }}>No grade appeals have been submitted yet.</p>
                  </div>
                ) : (
                  <div className="lmis-table-wrap">
                    <table className="lmis-table">
                      <thead>
                        <tr>
                          <th>Learner</th>
                          <th>Module</th>
                          <th>Assignment</th>
                          <th>Original</th>
                          <th>Status</th>
                          <th>Revised</th>
                          <th>Action</th>
                        </tr>
                      </thead>
                      <tbody>
                        {(grade_appeals || []).map(appeal => (
                          <tr key={appeal.id}>
                            <td>
                              <p style={{ fontWeight: 700, fontSize: '0.85rem' }}>{appeal.learner_name}</p>
                              <p style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>{appeal.learner_email}</p>
                            </td>
                            <td><span className="badge badge-navy">{appeal.course_code}</span></td>
                            <td style={{ fontSize: '0.82rem', maxWidth: 180 }}>{appeal.assignment_title}</td>
                            <td style={{ textAlign: 'center', fontWeight: 700 }}>{appeal.original_grade ?? '—'}</td>
                            <td>
                              <span className={`badge ${appeal.status === 'Approved' ? 'badge-success' : appeal.status === 'Rejected' ? 'badge-danger' : appeal.status === 'Escalated' ? 'badge-gold' : 'badge-navy'}`}>
                                {appeal.status || 'Pending'}
                              </span>
                            </td>
                            <td style={{ textAlign: 'center', fontWeight: 700, color: 'var(--emerald)' }}>
                              {appeal.revised_grade != null ? `${appeal.revised_grade}%` : '—'}
                            </td>
                            <td>
                              {(appeal.status === 'Pending' || appeal.status === 'Escalated') ? (
                                <div style={{ display: 'flex', gap: '0.35rem', flexWrap: 'wrap' }}>
                                  <button className="btn btn-xs btn-outline" style={{ color: 'var(--emerald)', borderColor: 'var(--emerald)' }}
                                    onClick={() => updateRecord('grade_appeals', appeal.id, { status: 'Approved', revised_grade: appeal.original_grade, reviewer_decision: 'Approved', resolved_at: new Date().toISOString() }).then(() => showToast('Appeal approved.'))}>
                                    ✓ Approve
                                  </button>
                                  <button className="btn btn-xs btn-outline" style={{ color: 'var(--red)', borderColor: 'var(--red)' }}
                                    onClick={() => updateRecord('grade_appeals', appeal.id, { status: 'Rejected', reviewer_decision: 'Rejected', resolved_at: new Date().toISOString() }).then(() => showToast('Appeal rejected.'))}>
                                    ✗ Reject
                                  </button>
                                </div>
                              ) : (
                                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Closed</span>
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </div>
          </div>
        );
      })()}

      {/* PROGRAMMES */}
      {activeTab === 'programmes' && (
        <div>
          <div className="lmis-page-header flex-between">
            <div><h1 className="lmis-page-title">Programmes & Courses</h1><p className="lmis-page-sub">Manage the course catalogue.</p></div>
            <button className="btn btn-sm btn-gold" onClick={() => setShowCourseForm(!showCourseForm)}><IcoPlus size={14} /> New Course</button>
          </div>
          {showCourseForm && (
            <div className="lmis-card mb-4">
              <div className="lmis-card-header"><span className="lmis-card-title">Create Course</span><button className="btn btn-sm btn-ghost" onClick={() => setShowCourseForm(false)}><IcoX size={14} /></button></div>
              <div className="lmis-card-body">
                <form onSubmit={handleCreateCourse}>
                  <div className="lmis-form-grid">
                    {/* Optional Template Quick-Fill */}
                    <div className="lmis-field" style={{ gridColumn: '1 / -1', background: 'var(--ice2, rgba(0,0,0,0.03))', padding: '0.85rem', borderRadius: '8px', border: '1px dashed var(--border-color, #cbd5e1)' }}>
                      <label className="lmis-label" style={{ fontWeight: 700, color: 'var(--primary-navy, #1e3a8a)', marginBottom: '0.25rem' }}>
                        ⚡ Quick-Fill from Curriculum Templates (Optional)
                      </label>
                      <select
                        className="lmis-select"
                        value={WEBSITE_MODULES.some(m => m.title === courseForm.title) ? courseForm.title : ''}
                        onChange={e => {
                          const selected = WEBSITE_MODULES.find(m => m.title === e.target.value);
                          if (selected) {
                            setCourseForm({
                              ...courseForm,
                              title: selected.title,
                              code: selected.code,
                              category: selected.category,
                              description: selected.description
                            });
                          }
                        }}
                      >
                        <option value="">-- Choose a Website Template or Type Custom Module Below --</option>
                        {WEBSITE_MODULES.map(m => (
                          <option key={m.code} value={m.title}>{m.title} ({m.code}) · {m.category}</option>
                        ))}
                      </select>
                      <span style={{ fontSize: '0.74rem', color: 'var(--text-sub, #64748b)', marginTop: '0.35rem', display: 'block' }}>
                        Pick a template to autofill, or skip this dropdown and type any custom module name and code directly below.
                      </span>
                    </div>

                    {/* Open, unconstrained text input for Module Title */}
                    <div className="lmis-field" style={{ gridColumn: '1 / -1' }}>
                      <label className="lmis-label">Course / Module Title *</label>
                      <input
                        className="lmis-input"
                        value={courseForm.title}
                        onChange={e => setCourseForm({ ...courseForm, title: e.target.value })}
                        required
                        placeholder="e.g. Applied AI Workflow Automation, Enterprise Logistics, or ISO Standards"
                      />
                    </div>
                    <div className="lmis-field"><label className="lmis-label">Course Code *</label><input className="lmis-input" value={courseForm.code} onChange={e => setCourseForm({ ...courseForm, code: e.target.value.toUpperCase() })} required placeholder="e.g. BPM" /></div>
                    <div className="lmis-field"><label className="lmis-label">Category</label><input className="lmis-input" value={courseForm.category} onChange={e => setCourseForm({ ...courseForm, category: e.target.value })} required /></div>
                    <div className="lmis-field"><label className="lmis-label">Assign Facilitator / Lecturer (Optional)</label><select className="lmis-select" value={courseForm.lecturer_email} onChange={e => setCourseForm({ ...courseForm, lecturer_email: e.target.value })}><option value="">-- No Facilitator Assigned Yet --</option>{(system_lecturers || []).map(l => <option key={l.email} value={l.email}>{l.name} ({l.email})</option>)}</select></div>
                    <div className="lmis-field"><label className="lmis-label">Status</label><select className="lmis-select" value={courseForm.status} onChange={e => setCourseForm({ ...courseForm, status: e.target.value })}>{['Active','Upcoming','Inactive'].map(s => <option key={s}>{s}</option>)}</select></div>
                    <div className="lmis-field" style={{ gridColumn: '1/-1' }}><label className="lmis-label">Description</label><textarea className="lmis-textarea" value={courseForm.description} onChange={e => setCourseForm({ ...courseForm, description: e.target.value })} placeholder="Course description..." /></div>
                  </div>
                  <div className="lmis-form-actions">
                    <button type="button" className="btn btn-sm btn-ghost" onClick={() => setShowCourseForm(false)}>Cancel</button>
                    <button type="submit" className="btn btn-sm btn-gold"><IcoPlus size={14} /> Create Course</button>
                  </div>
                </form>
              </div>
            </div>
          )}
          {courses.length === 0
            ? <div className="lmis-card"><div className="lmis-empty"><IcoBook size={40} style={{ color: '#CBD5E1' }} /><p className="lmis-empty-title">No courses yet</p><p className="lmis-empty-sub">Click "New Course" to add your first programme.</p></div></div>
            : <div className="lmis-3col">
              {courses.map(c => {
                const enrolledInCourse = enrollments.filter(e => e.course_code === c.code);
                
                // Calculate performance ranking for this course (top performing to least performing)
                const rankedLearners = enrolledInCourse.map(e => {
                  const sList = submissions.filter(s => s.course_code === c.code && s.learner_email?.toLowerCase() === e.learner_email?.toLowerCase() && s.grade !== null);
                  const qList = (quizAttempts || []).filter(q => q.course_code === c.code && q.learner_email?.toLowerCase() === e.learner_email?.toLowerCase() && q.score !== null);
                  
                  let totalScore = 0;
                  let count = 0;
                  sList.forEach(s => { totalScore += Number(s.grade); count++; });
                  qList.forEach(q => { totalScore += Number(q.score); count++; });

                  const avgScore = count > 0 ? Math.round(totalScore / count) : 0;
                  const profile = student_profiles.find(p => p.learner_email?.toLowerCase() === e.learner_email?.toLowerCase());

                  return {
                    name: profile?.learner_name || e.learner_name || e.learner_email,
                    email: e.learner_email,
                    student_number: profile?.student_number || '—',
                    score: avgScore,
                    submissionsCount: sList.length + qList.length,
                    status: avgScore >= 75 ? 'Top Performer' : avgScore >= 50 ? 'On Track' : avgScore > 0 ? 'Needs Attention' : 'Not Started'
                  };
                }).sort((a, b) => b.score - a.score);

                const isRankingOpen = selectedRankingCourse === c.code;

                return (
                  <div key={c.id} className="lmis-card" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                    <div style={{ padding: '1.1rem 1.25rem' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.75rem' }}>
                        <span className="badge badge-gold">{c.code}</span>
                        <span className={`badge ${c.status === 'Active' ? 'badge-emerald' : c.status === 'Upcoming' ? 'badge-orange' : 'badge-navy'}`}>{c.status}</span>
                      </div>
                      <h3 style={{ fontWeight: 700, fontSize: '0.9rem', marginBottom: '0.4rem' }}>{c.title}</h3>
                      <p style={{ fontSize: '0.75rem', color: 'var(--text-sub)', marginBottom: '0.625rem' }}>{c.category}</p>
                      <div style={{ marginTop: '0.4rem', marginBottom: '0.4rem' }}>
                        <span style={{ fontSize: '0.7rem', fontWeight: 700, color: 'var(--text-sub)', display: 'block', marginBottom: '0.2rem' }}>
                          👨‍🏫 Assigned Facilitator / Lecturer:
                        </span>
                        <select
                          className="lmis-select"
                          style={{ fontSize: '0.74rem', padding: '0.3rem 0.5rem', height: 'auto', background: '#fff' }}
                          value={c.lecturer_email || ''}
                          onChange={async e => {
                            const selectedEmail = e.target.value.trim().toLowerCase();
                            const lec = (system_lecturers || []).find(l => (l.email || '').toLowerCase().trim() === selectedEmail);

                            // 1. Assign selected course
                            await updateRecord('courses', c.id, {
                              lecturer_email: selectedEmail,
                              lecturer_name: lec ? lec.name : '',
                              code: c.code
                            });

                            // 2. Unassign lecturer from all other courses (strict 1:1 dedicated assignment)
                            if (selectedEmail) {
                              (courses || [])
                                .filter(other => other.id !== c.id && (other.lecturer_email || '').toLowerCase().trim() === selectedEmail)
                                .forEach(other => {
                                  updateRecord('courses', other.id, { lecturer_email: '', lecturer_name: '', code: other.code });
                                });
                            }

                            if (lec && lec.id) {
                              await updateRecord('system_lecturers', lec.id, {
                                department: selectedEmail ? c.title : '',
                                email: selectedEmail || lec.email
                              });
                            }
                            showToast(`Assigned ${c.code} (${c.title}) to ${lec?.name || 'Unassigned'}!`);
                          }}
                        >
                          <option value="">-- No Facilitator Assigned --</option>
                          {(system_lecturers || []).map(l => (
                            <option key={l.email} value={l.email}>{l.name} ({l.department || l.email})</option>
                          ))}
                        </select>
                      </div>
                      <div style={{ display: 'flex', gap: '0.4rem', marginTop: '0.35rem', marginBottom: '0.35rem' }}>
                        <button
                          type="button"
                          className="btn btn-sm btn-outline"
                          style={{ fontSize: '0.7rem', padding: '0.25rem 0.5rem', width: '100%', borderColor: 'var(--gold)', color: 'var(--primary-navy)', fontWeight: 600 }}
                          onClick={() => {
                            setEditingCourse(c);
                            setEditCourseForm({
                              title: c.title || '',
                              code: c.code || '',
                              category: c.category || 'Digital Transformation',
                              credits: c.credits || 20,
                              description: c.description || '',
                              lecturer_email: c.lecturer_email || '',
                              status: c.status || 'Active'
                            });
                          }}
                        >
                          ✏ Edit Module Details
                        </button>
                      </div>
                      <p style={{ fontSize: '0.72rem', color: 'var(--muted)', marginTop: '0.25rem' }}>Enrolled: {enrolledInCourse.length} learners</p>

                      <div style={{ marginTop: '0.75rem', paddingTop: '0.75rem', borderTop: '1px solid var(--ice2)' }}>
                        <button 
                          className="btn btn-sm btn-outline" 
                          style={{ width: '100%', fontSize: '0.72rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}
                          onClick={() => setSelectedRankingCourse(isRankingOpen ? null : c.code)}
                        >
                          <span>📊 Learner Performance Ranking ({rankedLearners.length})</span>
                          <span>{isRankingOpen ? '▲ Hide' : '▼ View'}</span>
                        </button>
                      </div>

                      {/* Expanded Performance Ranking Table */}
                      {isRankingOpen && (
                        <div style={{ marginTop: '0.75rem', background: '#f8fafc', borderRadius: '6px', border: '1px solid #e2e8f0', padding: '0.5rem' }}>
                          <p style={{ fontSize: '0.68rem', fontWeight: 800, color: 'var(--navy)', textTransform: 'uppercase', marginBottom: '0.4rem' }}>
                            Top Performing to Least Performing:
                          </p>
                          {rankedLearners.length === 0 ? (
                            <p style={{ fontSize: '0.72rem', color: 'var(--muted)', fontStyle: 'italic', margin: 0 }}>No learners enrolled in this module yet.</p>
                          ) : (
                            <div style={{ maxHeight: '180px', overflowY: 'auto' }}>
                              <table style={{ width: '100%', fontSize: '0.7rem', borderCollapse: 'collapse' }}>
                                <thead>
                                  <tr style={{ textAlign: 'left', borderBottom: '1px solid #cbd5e1', color: 'var(--text-sub)' }}>
                                    <th style={{ padding: '0.2rem' }}>#</th>
                                    <th style={{ padding: '0.2rem' }}>Learner</th>
                                    <th style={{ padding: '0.2rem' }}>Score</th>
                                    <th style={{ padding: '0.2rem' }}>Status</th>
                                  </tr>
                                </thead>
                                <tbody>
                                  {rankedLearners.map((lrn, rankIdx) => (
                                    <tr key={lrn.email} style={{ borderBottom: '1px solid #f1f5f9' }}>
                                      <td style={{ padding: '0.25rem 0.2rem', fontWeight: 700, color: rankIdx === 0 ? '#d97706' : rankIdx === 1 ? '#64748b' : rankIdx === 2 ? '#b45309' : 'inherit' }}>
                                        {rankIdx === 0 ? '🥇 1' : rankIdx === 1 ? '🥈 2' : rankIdx === 2 ? '🥉 3' : `#${rankIdx + 1}`}
                                      </td>
                                      <td style={{ padding: '0.25rem 0.2rem' }}>
                                        <div style={{ fontWeight: 600 }}>{lrn.name}</div>
                                        <div style={{ fontSize: '0.62rem', color: 'var(--muted)' }}>{lrn.student_number}</div>
                                      </td>
                                      <td style={{ padding: '0.25rem 0.2rem', fontWeight: 700, color: lrn.score >= 75 ? 'var(--emerald)' : lrn.score >= 50 ? 'var(--teal)' : lrn.score > 0 ? 'var(--red)' : 'var(--muted)' }}>
                                        {lrn.score > 0 ? `${lrn.score}%` : '—'}
                                      </td>
                                      <td style={{ padding: '0.25rem 0.2rem' }}>
                                        <span className={`badge ${lrn.status === 'Top Performer' ? 'badge-emerald' : lrn.status === 'On Track' ? 'badge-teal' : lrn.status === 'Needs Attention' ? 'badge-orange' : 'badge-navy'}`} style={{ fontSize: '0.6rem', padding: '0.1rem 0.35rem' }}>
                                          {lrn.status}
                                        </span>
                                      </td>
                                    </tr>
                                  ))}
                                </tbody>
                              </table>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          }
        </div>
      )}

      {/* CALENDAR & TIMETABLE */}
      {activeTab === 'calendar' && (
        <div>
          <div className="lmis-page-header flex-between mb-3">
            <div>
              <h1 className="lmis-page-title">Institutional Calendar &amp; Class Timetable</h1>
              <p className="lmis-page-sub">Comprehensive scheduling suite: weekly Twinkl grid, monthly deadlines, and daily timelines.</p>
            </div>
          </div>
          <LmisCalendarSchedule
            userRole={currentRole}
            userEmail={currentAdmin?.email}
            userName={currentAdmin?.name}
            onNavigateToTab={(tab) => setActiveTab(tab)}
          />
        </div>
      )}

      {/* STIPENDS & DISBURSEMENTS */}
      {activeTab === 'stipends' && (
        <div>
          {/* Top Finance / Stipends Navigation Toggle */}
          <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.25rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.75rem', flexWrap: 'wrap' }}>
            <button
              type="button"
              className="btn btn-sm btn-gold"
              style={{ fontWeight: 800, display: 'flex', alignItems: 'center', gap: '0.4rem', borderRadius: '6px' }}
              onClick={() => setActiveTab('stipends')}
            >
              <IcoWallet size={15} /> 💰 SETA Learner Stipends &amp; Bank Disbursements
            </button>
            <button
              type="button"
              className="btn btn-sm btn-ghost"
              style={{ fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.4rem', border: '1px solid var(--border-color)', borderRadius: '6px' }}
              onClick={() => setActiveTab('finance')}
            >
              📄 Tuition Fees &amp; Invoices (Self-Paying)
            </button>
          </div>
          <div className="lmis-page-header flex-between" style={{ alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem' }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                <h1 className="lmis-page-title" style={{ margin: 0 }}>Learner Stipends &amp; Direct Disbursements</h1>
                <span className="badge badge-emerald" style={{ fontSize: '0.75rem', fontWeight: 700 }}>
                  ● Banking Gateway Active
                </span>
              </div>
              <p className="lmis-page-sub" style={{ margin: '0.35rem 0 0 0' }}>
                Direct electronic stipend payment gateway, institutional disbursement bank account, and real-time funding analytics.
              </p>
            </div>
            <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
              <button
                type="button"
                className="btn btn-sm btn-outline"
                style={{ fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.35rem' }}
                onClick={() => { setBankConfigTab('account'); setShowBankConfigModal(true); }}
              >
                🏦 Disbursement Source Bank
              </button>
              <button
                type="button"
                className="btn btn-sm btn-outline"
                style={{ fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.35rem' }}
                onClick={() => { setBankConfigTab('api'); setShowBankConfigModal(true); }}
              >
                ⚡ Banking API Setup
              </button>
              <button
                type="button"
                className="btn btn-sm btn-gold"
                style={{ fontWeight: 800, display: 'flex', alignItems: 'center', gap: '0.4rem', boxShadow: '0 2px 4px rgba(201, 163, 78, 0.25)' }}
                onClick={handleBatchPayStipends}
                disabled={isBatchPaying || pendingCount === 0}
                title="Send batch directly to Standard Bank OneHub with instant push notification to your Mobile Banking App"
              >
                {isBatchPaying ? '🔄 Submitting to Standard Bank...' : `📱 Batch Disburse (App 2FA) (${pendingCount})`}
              </button>
              <button
                type="button"
                className="btn btn-sm btn-primary"
                style={{ fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.35rem', backgroundColor: '#0033aa', borderColor: '#0033aa' }}
                onClick={handleExportStandardBankBatchCsv}
                title="Backup: Download pre-formatted batch file for manual upload to Standard Bank Business Online"
              >
                📥 SB Online Batch (CSV)
              </button>
              <button
                type="button"
                className="btn btn-sm btn-outline"
                style={{ fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.35rem' }}
                onClick={handleExportBankBatchCsv}
                title="Download full multi-bank audit ledger"
              >
                📊 Universal Ledger
              </button>
            </div>
          </div>

          {/* Top Analytics Cards */}
          <div className="lmis-4col mb-4" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(230px, 1fr))' }}>
            <div className="lmis-stat" style={{ borderLeft: '4px solid #10b981', minWidth: 0, overflow: 'hidden' }}>
              <div className="lmis-stat-icon emerald"><IcoWallet size={20} /></div>
              <div style={{ flex: 1, minWidth: 0, overflow: 'hidden' }}>
                <div className="lmis-stat-val" title={fmtZAR(Number(institutional_banking_config?.available_balance || 0))} style={{ fontSize: '1.2rem', color: '#0f172a', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                  {fmtZAR(Number(institutional_banking_config?.available_balance || 0))}
                </div>
                <div className="lmis-stat-label" style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>Source Account Reserve</div>
                <div style={{ fontSize: '0.7rem', color: 'var(--text-sub)', marginTop: '0.2rem', display: 'flex', alignItems: 'center', gap: '0.3rem', flexWrap: 'wrap' }}>
                  <span>{institutional_banking_config?.bank_name || 'Standard Bank'} (•••{institutional_banking_config?.account_number ? String(institutional_banking_config.account_number).slice(-4) : 'Pending'})</span>
                  <span style={{ color: '#10b981', fontWeight: 700 }}>● {institutional_banking_config?.api_environment === 'production' ? 'Live EFT' : 'Sandbox EFT'}</span>
                </div>
              </div>
            </div>

            <div className="lmis-stat" style={{ borderLeft: '4px solid #c9a34e', minWidth: 0, overflow: 'hidden' }}>
              <div className="lmis-stat-icon gold"><IcoWallet size={20} /></div>
              <div style={{ flex: 1, minWidth: 0, overflow: 'hidden' }}>
                <div className="lmis-stat-val" title={fmtZAR(Number(institutional_banking_config?.allocated_stipend_pool || 0))} style={{ fontSize: '1.2rem', color: '#0f172a', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                  {fmtZAR(Number(institutional_banking_config?.allocated_stipend_pool || 0))}
                </div>
                <div className="lmis-stat-label" style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>Allocated Monthly Pool</div>
                <div style={{ fontSize: '0.7rem', color: 'var(--text-sub)', marginTop: '0.2rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                  Earmarked for learner allowances
                </div>
              </div>
            </div>

            <div className="lmis-stat" style={{ borderLeft: '4px solid #3b82f6', minWidth: 0, overflow: 'hidden' }}>
              <div className="lmis-stat-icon navy"><IcoCheck size={20} /></div>
              <div style={{ flex: 1, minWidth: 0, overflow: 'hidden' }}>
                <div className="lmis-stat-val" title={fmtZAR(totalDisbursedPeriodAmount)} style={{ fontSize: '1.2rem', color: '#10b981', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                  {fmtZAR(totalDisbursedPeriodAmount)}
                </div>
                <div className="lmis-stat-label" style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>Disbursed ({activePeriodLabel})</div>
                <div style={{ fontSize: '0.7rem', color: 'var(--text-sub)', marginTop: '0.2rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                  <strong>{paidCountPeriod}</strong> of {eligibleWithStatus.length} funded paid
                </div>
              </div>
            </div>

            <div className="lmis-stat" style={{ borderLeft: '4px solid #f59e0b', minWidth: 0, overflow: 'hidden' }}>
              <div className="lmis-stat-icon" style={{ background: 'rgba(245, 158, 11, 0.12)', color: '#d97706' }}><IcoWallet size={20} /></div>
              <div style={{ flex: 1, minWidth: 0, overflow: 'hidden' }}>
                <div className="lmis-stat-val" title={fmtZAR(totalPendingAmount)} style={{ fontSize: '1.2rem', color: pendingCount > 0 ? '#d97706' : '#10b981', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                  {fmtZAR(totalPendingAmount)}
                </div>
                <div className="lmis-stat-label" style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>Pending Payouts ({pendingCount})</div>
                <div style={{ fontSize: '0.7rem', color: 'var(--text-sub)', marginTop: '0.2rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                  {pendingCount === 0 ? '✓ All eligible disbursed' : `${pendingCount} learner(s) ready for EFT`}
                </div>
              </div>
            </div>
          </div>

          {/* Quick Notice on Funding Segregation */}
          <div style={{ background: 'linear-gradient(135deg, rgba(30,58,138,0.06), rgba(16,185,129,0.06))', border: '1px solid rgba(30,58,138,0.15)', borderRadius: '10px', padding: '0.85rem 1.25rem', marginBottom: '1.25rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.75rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <span style={{ fontSize: '1.3rem' }}>💡</span>
              <div>
                <strong style={{ fontSize: '0.82rem', color: 'var(--text-main, #0f172a)' }}>Learner Funding Segregation Active</strong>
                <p style={{ margin: '0.15rem 0 0 0', fontSize: '0.74rem', color: 'var(--text-sub)' }}>
                  Only <strong>Funded Learners ({allEligibleFundedLearners.length})</strong> are eligible to receive monthly stipends. 
                  All <strong>Self-Paying Learners ({selfPayingLearnersCount})</strong> are tuition-fee based and automatically excluded from stipend payment batches.
                </p>
              </div>
            </div>
            <div style={{ display: 'flex', gap: '0.4rem' }}>
              <span className="badge badge-emerald">Funded: {allEligibleFundedLearners.length} Eligible</span>
              <span className="badge badge-navy">Self-Paying: {selfPayingLearnersCount} Non-Stipend</span>
            </div>
          </div>

          {/* Filter Bar */}
          <div className="lmis-card mb-4" style={{ padding: '0.85rem 1rem' }}>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.75rem', alignItems: 'center', justifyContent: 'space-between' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
                <span style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--text-sub)' }}>Disbursement Period:</span>
                <select
                  className="lmis-select"
                  style={{ maxWidth: '190px', padding: '0.35rem 0.6rem', fontSize: '0.82rem', fontWeight: 600 }}
                  value={selectedStipendPeriod}
                  onChange={e => setSelectedStipendPeriod(e.target.value)}
                >
                  {stipendPeriods.map(p => (
                    <option key={p.value} value={p.value}>{p.label}</option>
                  ))}
                </select>

                <div style={{ display: 'flex', gap: '0.35rem', marginLeft: '0.5rem', flexWrap: 'wrap' }}>
                  <button
                    type="button"
                    onClick={() => setStipendStatusFilter('all')}
                    className={`btn btn-sm ${stipendStatusFilter === 'all' ? 'btn-primary' : 'btn-ghost'}`}
                    style={{ fontSize: '0.72rem', padding: '0.25rem 0.6rem' }}
                  >
                    All Eligible ({eligibleWithStatus.length})
                  </button>
                  <button
                    type="button"
                    onClick={() => setStipendStatusFilter('paid')}
                    className={`btn btn-sm ${stipendStatusFilter === 'paid' ? 'btn-primary' : 'btn-ghost'}`}
                    style={{ fontSize: '0.72rem', padding: '0.25rem 0.6rem' }}
                  >
                    🟢 Paid ({paidCountPeriod})
                  </button>
                  <button
                    type="button"
                    onClick={() => setStipendStatusFilter('pending')}
                    className={`btn btn-sm ${stipendStatusFilter === 'pending' ? 'btn-primary' : 'btn-ghost'}`}
                    style={{ fontSize: '0.72rem', padding: '0.25rem 0.6rem' }}
                  >
                    🟡 Pending ({pendingCount})
                  </button>
                  {incompleteCount > 0 && (
                    <button
                      type="button"
                      onClick={() => setStipendStatusFilter('issues')}
                      className={`btn btn-sm ${stipendStatusFilter === 'issues' ? 'btn-danger' : 'btn-ghost'}`}
                      style={{ fontSize: '0.72rem', padding: '0.25rem 0.6rem' }}
                    >
                      🔴 Missing Bank Info ({incompleteCount})
                    </button>
                  )}
                </div>
              </div>

              <input
                className="lmis-input"
                style={{ maxWidth: '260px', padding: '0.35rem 0.75rem', fontSize: '0.8rem' }}
                placeholder="Search learner, email, bank..."
                value={stipendLearnerSearch}
                onChange={e => setStipendLearnerSearch(e.target.value)}
              />
            </div>
          </div>

          {/* Disbursements Matrix Table */}
          {filteredDisbursementLearners.length === 0 ? (
            <div className="lmis-card">
              <div className="lmis-empty" style={{ padding: '3rem 1rem' }}>
                <IcoWallet size={48} style={{ color: '#CBD5E1', marginBottom: '0.75rem' }} />
                <h3 className="lmis-empty-title">No stipend records found</h3>
                <p className="lmis-empty-sub">
                  {stipendLearnerSearch ? `No funded learners match "${stipendLearnerSearch}".` : 'No funded learners match the selected status filter.'}
                </p>
              </div>
            </div>
          ) : (
            <div className="lmis-card">
              <div className="lmis-table-wrap">
                <table className="lmis-table">
                  <thead>
                    <tr>
                      <th>Learner</th>
                      <th>Funder &amp; Programme</th>
                      <th>Beneficiary Bank Details</th>
                      <th>Monthly Stipend</th>
                      <th>Payout Status</th>
                      <th>Reference &amp; Date</th>
                      <th>Payment Channel</th>
                      <th style={{ textAlign: 'right' }}>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredDisbursementLearners.map(learner => {
                      const isPaid = learner.disbursementStatus === 'Paid';
                      const isPending = learner.disbursementStatus === 'Pending';
                      const isMissing = learner.disbursementStatus === 'Incomplete';
                      const payment = learner.paymentRecord;
                      const isCurrentlyPaying = payingLearnerId === learner.id || payingLearnerId === learner.learner_email;

                      return (
                        <tr key={learner.id || learner.learner_email}>
                          <td>
                            <div style={{ fontWeight: 700, color: 'var(--text-main, #0f172a)' }}>{learner.learner_name}</div>
                            <div style={{ fontSize: '0.72rem', color: 'var(--text-sub)' }}>
                              {learner.student_number} · {learner.learner_email}
                            </div>
                          </td>

                          <td>
                            <span className="badge badge-gold" style={{ display: 'inline-block', marginBottom: '0.2rem' }}>
                              {learner.funder_name || 'Services SETA'}
                            </span>
                            <div style={{ fontSize: '0.7rem', color: 'var(--text-sub)', maxWidth: '180px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                              {learner.programme_enrolled || 'Business Process Management'}
                            </div>
                          </td>

                          <td>
                            {learner.bank_account_number ? (
                              <div>
                                <div style={{ fontWeight: 600, fontSize: '0.78rem' }}>{learner.bank_name || 'Standard Bank'}</div>
                                <div style={{ fontSize: '0.72rem', fontFamily: 'monospace', color: 'var(--text-sub)' }}>
                                  Acc: ••••{String(learner.bank_account_number).slice(-4)} · {learner.bank_account_type || 'Savings'}
                                </div>
                              </div>
                            ) : (
                              <span className="badge badge-red" style={{ fontSize: '0.68rem' }}>
                                ⚠️ Missing Account No.
                              </span>
                            )}
                          </td>

                          <td>
                            <div style={{ fontWeight: 800, fontSize: '0.9rem', color: 'var(--text-main, #0f172a)' }}>
                              {fmtZAR(learner.stipend_amount || 4500)}
                            </div>
                            <div style={{ fontSize: '0.68rem', color: 'var(--text-sub)' }}>Monthly allocation</div>
                          </td>

                          <td>
                            {isPaid && (
                              <span className="badge badge-emerald" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.3rem' }}>
                                ✓ Disbursed &amp; Paid
                              </span>
                            )}
                            {isPending && (
                              <span className="badge badge-orange" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.3rem' }}>
                                ⏳ Pending Payout
                              </span>
                            )}
                            {isMissing && (
                              <span className="badge badge-red" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.3rem' }}>
                                ⚠️ Bank Details Incomplete
                              </span>
                            )}
                          </td>

                          <td>
                            {isPaid ? (
                              <div>
                                <div style={{ fontSize: '0.72rem', fontFamily: 'monospace', fontWeight: 600, color: 'var(--primary-navy)' }}>
                                  {payment?.transaction_reference || 'NEXA-EFT-CONFIRMED'}
                                </div>
                                <div style={{ fontSize: '0.68rem', color: 'var(--text-sub)' }}>
                                  {fmtDate(payment?.disbursed_at)}
                                </div>
                              </div>
                            ) : (
                              <span style={{ fontSize: '0.72rem', color: 'var(--text-sub)' }}>—</span>
                            )}
                          </td>

                          <td>
                            <span style={{ fontSize: '0.74rem', fontWeight: 500, color: 'var(--text-main)' }}>
                              {isPaid ? (payment?.payout_channel || 'Direct API EFT') : 'Direct API EFT'}
                            </span>
                          </td>

                          <td style={{ textAlign: 'right' }}>
                            <div style={{ display: 'inline-flex', gap: '0.35rem', flexWrap: 'wrap', justifyContent: 'flex-end' }}>
                              {isPending && (
                                <button
                                  type="button"
                                  className="btn btn-sm btn-gold"
                                  style={{ fontSize: '0.72rem', padding: '0.25rem 0.65rem', fontWeight: 700 }}
                                  disabled={isCurrentlyPaying}
                                  onClick={() => handlePaySingleStipend(learner)}
                                >
                                  {isCurrentlyPaying ? '💳 Transferring...' : '💳 Disburse Now'}
                                </button>
                              )}

                              {isPaid && (
                                <button
                                  type="button"
                                  className="btn btn-sm btn-outline"
                                  style={{ fontSize: '0.72rem', padding: '0.25rem 0.65rem', fontWeight: 600, borderColor: '#10b981', color: '#047857' }}
                                  onClick={() => {
                                    generateProofOfStipendPaymentPDF({
                                      disbursementId: payment?.id,
                                      transactionReference: payment?.transaction_reference,
                                      periodLabel: payment?.period_label || activePeriodLabel,
                                      learnerName: learner.learner_name,
                                      learnerEmail: learner.learner_email,
                                      studentNumber: learner.student_number,
                                      idPassport: learner.id_passport,
                                      stipendAmount: payment?.stipend_amount || learner.stipend_amount || 4500,
                                      funderName: payment?.funder_name || learner.funder_name || 'Services SETA',
                                      programmeName: learner.programme_enrolled || 'Business Process Management',
                                      bankName: payment?.bank_name || learner.bank_name || 'Standard Bank',
                                      bankAccountNumber: payment?.bank_account_number || learner.bank_account_number,
                                      bankBranchCode: payment?.bank_branch_code || learner.bank_branch_code || '051001',
                                      bankAccountType: payment?.bank_account_type || learner.bank_account_type || 'Savings',
                                      sourceBankName: institutional_banking_config?.bank_name || 'Nedbank Corporate Banking',
                                      sourceAccountNumber: institutional_banking_config?.account_number || '1198472910',
                                      payoutChannel: payment?.payout_channel || 'Direct API EFT',
                                      disbursedAt: payment?.disbursed_at,
                                      disbursedBy: payment?.disbursed_by || `${currentAdmin?.name || 'Administrator'} (Finance)`
                                    });
                                    showToast(`Downloaded Proof of Payment for ${learner.learner_name}`);
                                  }}
                                >
                                  📄 Proof of Payment
                                </button>
                              )}

                              <button
                                type="button"
                                className="btn btn-sm btn-ghost"
                                style={{ fontSize: '0.7rem', padding: '0.25rem 0.5rem' }}
                                onClick={() => {
                                  setEditingStudent(learner);
                                  setEditStudentForm({
                                    learner_name: learner.learner_name || '',
                                    learner_email: learner.learner_email || '',
                                    phone: learner.phone || '',
                                    id_passport: learner.id_passport || '',
                                    student_number: learner.student_number || '',
                                    qualification: learner.qualification || '',
                                    programme_enrolled: learner.programme_enrolled || learner.qualification || 'Business Process and Work Study Management',
                                    employment_status: learner.employment_status || 'Unemployed',
                                    city: learner.city || '',
                                    province: learner.province || 'Gauteng',
                                    funding_type: learner.funding_type || 'funded',
                                    funder_name: learner.funder_name || 'Services SETA',
                                    stipend_amount: learner.funding_type === 'self_paying' ? 0 : Number(learner.stipend_amount || 4500),
                                    bank_name: learner.bank_name || 'Standard Bank',
                                    bank_account_number: learner.bank_account_number || '',
                                    bank_branch_code: learner.bank_branch_code || '051001',
                                    bank_account_type: learner.bank_account_type || 'Savings',
                                    bank_account_holder: learner.bank_account_holder || learner.learner_name || ''
                                  });
                                }}
                              >
                                ✏️ Bank Info
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Institutional Disbursement Source Bank & API Modal */}
          {showBankConfigModal && (
            <div className="lmis-modal-overlay" style={{ position: 'fixed', inset: 0, background: 'rgba(15,23,42,0.75)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999, padding: '1rem' }}>
              <div className="lmis-modal-card" style={{ background: 'var(--bg-card, #fff)', color: 'var(--text-main, #0f172a)', border: '2px solid var(--primary-navy, #1e3a8a)', borderRadius: '12px', width: '100%', maxWidth: '720px', maxHeight: '90vh', overflowY: 'auto', padding: '1.5rem', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.35)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--border-color, #e2e8f0)', paddingBottom: '0.75rem', marginBottom: '1.25rem' }}>
                  <div>
                    <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: 'var(--text-main, #0f172a)', margin: 0, display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                      🏦 Institutional Disbursement Banking &amp; API Configuration
                    </h3>
                    <p style={{ fontSize: '0.78rem', color: 'var(--text-sub, #64748b)', margin: '0.2rem 0 0 0' }}>
                      Configure the source corporate bank account funds will be debited from, and connect banking disbursement APIs.
                    </p>
                  </div>
                  <button className="btn btn-sm btn-ghost" onClick={() => setShowBankConfigModal(false)}><IcoX size={18} /></button>
                </div>

                {/* Sub tabs inside modal */}
                <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.25rem', borderBottom: '1px solid var(--border-color, #e2e8f0)', paddingBottom: '0.5rem' }}>
                  <button
                    type="button"
                    onClick={() => setBankConfigTab('account')}
                    className={`btn btn-sm ${bankConfigTab === 'account' ? 'btn-primary' : 'btn-ghost'}`}
                    style={{ fontWeight: 600 }}
                  >
                    🏦 Disbursement Debit Account
                  </button>
                  <button
                    type="button"
                    onClick={() => setBankConfigTab('api')}
                    className={`btn btn-sm ${bankConfigTab === 'api' ? 'btn-primary' : 'btn-ghost'}`}
                    style={{ fontWeight: 600 }}
                  >
                    ⚡ Banking &amp; Payment API Connection
                  </button>
                </div>

                <form onSubmit={handleSaveBankConfig}>
                  {bankConfigTab === 'account' && (
                    <div className="lmis-form-grid">
                      <div className="lmis-field" style={{ gridColumn: '1/-1' }}>
                        <label className="lmis-label">Institutional Account Holder Legal Name *</label>
                        <input
                          className="lmis-input"
                          value={bankConfigForm.account_name}
                          onChange={e => setBankConfigForm({ ...bankConfigForm, account_name: e.target.value })}
                          required
                          placeholder="Nexa Transformation Operations (Pty) Ltd"
                        />
                      </div>
                      <div className="lmis-field">
                        <label className="lmis-label">Disbursement Bank *</label>
                        <select
                          className="lmis-select"
                          value={bankConfigForm.bank_name}
                          onChange={e => setBankConfigForm({ ...bankConfigForm, bank_name: e.target.value })}
                        >
                          {['Nedbank Corporate & Business Banking', 'Standard Bank Corporate', 'First National Bank (FNB) Commercial', 'Absa Corporate and Investment Bank', 'Investec Bank', 'Capitec Business'].map(b => (
                            <option key={b} value={b}>{b}</option>
                          ))}
                        </select>
                      </div>
                      <div className="lmis-field">
                        <label className="lmis-label">Account Number (Debit Source) *</label>
                        <input
                          className="lmis-input"
                          value={bankConfigForm.account_number}
                          onChange={e => setBankConfigForm({ ...bankConfigForm, account_number: e.target.value })}
                          required
                          placeholder="e.g. 1198472910"
                        />
                      </div>
                      <div className="lmis-field">
                        <label className="lmis-label">Branch Code *</label>
                        <input
                          className="lmis-input"
                          value={bankConfigForm.branch_code}
                          onChange={e => setBankConfigForm({ ...bankConfigForm, branch_code: e.target.value })}
                          required
                          placeholder="e.g. 198765"
                        />
                      </div>
                      <div className="lmis-field">
                        <label className="lmis-label">Account Type</label>
                        <select
                          className="lmis-select"
                          value={bankConfigForm.account_type}
                          onChange={e => setBankConfigForm({ ...bankConfigForm, account_type: e.target.value })}
                        >
                          {['Corporate Current / Cheque', 'Operational Commercial Account', 'Call Deposit / Treasury Reserve'].map(t => (
                            <option key={t} value={t}>{t}</option>
                          ))}
                        </select>
                      </div>
                      <div className="lmis-field">
                        <label className="lmis-label">Available Liquid Reserve Balance (ZAR) *</label>
                        <input
                          type="number"
                          className="lmis-input"
                          value={bankConfigForm.available_balance}
                          onChange={e => setBankConfigForm({ ...bankConfigForm, available_balance: Number(e.target.value) })}
                          required
                          min="0"
                        />
                      </div>
                      <div className="lmis-field">
                        <label className="lmis-label">Allocated Monthly Stipend Pool (ZAR) *</label>
                        <input
                          type="number"
                          className="lmis-input"
                          value={bankConfigForm.allocated_stipend_pool}
                          onChange={e => setBankConfigForm({ ...bankConfigForm, allocated_stipend_pool: Number(e.target.value) })}
                          required
                          min="0"
                        />
                      </div>
                    </div>
                  )}

                  {bankConfigTab === 'api' && (
                    <div>
                      <div className="lmis-form-grid" style={{ marginBottom: '1.25rem' }}>
                        <div className="lmis-field">
                          <label className="lmis-label">Disbursement API Gateway Provider *</label>
                          <select
                            className="lmis-select"
                            value={bankConfigForm.api_provider}
                            onChange={e => setBankConfigForm({ ...bankConfigForm, api_provider: e.target.value })}
                          >
                            <option value="standard_bank_h2h">Standard Bank Business Direct (H2H - App 2FA)</option>
                            <option value="stitch">Stitch Payments (Direct API EFT / RTC)</option>
                            <option value="nedbank_direct">Nedbank Direct EFT API (Host-to-Host)</option>
                            <option value="netcash">Netcash Batch EFT &amp; Salary Gateway</option>
                            <option value="ozow">Ozow Instant Payout API</option>
                          </select>
                        </div>

                        <div className="lmis-field">
                          <label className="lmis-label">API Gateway Environment *</label>
                          <select
                            className="lmis-select"
                            value={bankConfigForm.api_environment}
                            onChange={e => setBankConfigForm({ ...bankConfigForm, api_environment: e.target.value })}
                          >
                            <option value="production">Production / Live Interbank Clearing (Live App 2FA)</option>
                            <option value="sandbox">Sandbox / Staging (Simulated Cleared EFT)</option>
                          </select>
                        </div>

                        {bankConfigForm.api_provider === 'standard_bank_h2h' ? (
                          <>
                            <div className="lmis-field">
                              <label className="lmis-label">Standard Bank Company System ID *</label>
                              <input
                                className="lmis-input"
                                value={bankConfigForm.client_id}
                                onChange={e => setBankConfigForm({ ...bankConfigForm, client_id: e.target.value })}
                                required
                                placeholder="e.g. SB-CORP-948210"
                              />
                              <span style={{ fontSize: '0.68rem', color: 'var(--text-sub)' }}>Issued by your Standard Bank Business Banker / OneHub</span>
                            </div>

                            <div className="lmis-field">
                              <label className="lmis-label">Standard Bank Operator / User ID *</label>
                              <input
                                className="lmis-input"
                                value={bankConfigForm.operator_id || ''}
                                onChange={e => setBankConfigForm({ ...bankConfigForm, operator_id: e.target.value })}
                                required
                                placeholder="e.g. OP_DISBURSE_01"
                              />
                              <span style={{ fontSize: '0.68rem', color: 'var(--text-sub)' }}>Designated batch submitter profile code</span>
                            </div>

                            <div className="lmis-field">
                              <label className="lmis-label">Mobile App Authorizer Mobile Number *</label>
                              <input
                                className="lmis-input"
                                value={bankConfigForm.authorizer_phone || ''}
                                onChange={e => setBankConfigForm({ ...bankConfigForm, authorizer_phone: e.target.value })}
                                placeholder="e.g. +27 82 000 0000"
                              />
                              <span style={{ fontSize: '0.68rem', color: 'var(--text-sub)' }}>Phone registered with Standard Bank Mobile App for push approvals</span>
                            </div>

                            <div className="lmis-field">
                              <label className="lmis-label">OneHub API Client Secret / Certificate Key</label>
                              <input
                                type="password"
                                className="lmis-input"
                                value={bankConfigForm.client_secret}
                                onChange={e => setBankConfigForm({ ...bankConfigForm, client_secret: e.target.value })}
                                placeholder="Enter OneHub H2H digital signing key"
                              />
                            </div>
                          </>
                        ) : (
                          <>
                            <div className="lmis-field">
                              <label className="lmis-label">Client ID / Merchant ID *</label>
                              <input
                                className="lmis-input"
                                value={bankConfigForm.client_id}
                                onChange={e => setBankConfigForm({ ...bankConfigForm, client_id: e.target.value })}
                                required
                                placeholder="e.g. nexa_stip_live_sec_9941a8"
                              />
                            </div>

                            <div className="lmis-field">
                              <label className="lmis-label">Secret API Key / Private Token *</label>
                              <input
                                type="password"
                                className="lmis-input"
                                value={bankConfigForm.client_secret}
                                onChange={e => setBankConfigForm({ ...bankConfigForm, client_secret: e.target.value })}
                                required
                                placeholder="Enter gateway private key"
                              />
                            </div>
                          </>
                        )}

                        <div className="lmis-field" style={{ gridColumn: '1/-1' }}>
                          <label className="lmis-label">Standard Bank Webhook Callback URL</label>
                          <div style={{ display: 'flex', gap: '0.5rem' }}>
                            <input
                              className="lmis-input"
                              readOnly
                              value={bankConfigForm.webhook_url}
                              style={{ background: 'var(--ice2, #f1f5f9)', color: 'var(--text-sub)' }}
                            />
                            <button
                              type="button"
                              className="btn btn-sm btn-outline"
                              onClick={() => {
                                navigator.clipboard.writeText(bankConfigForm.webhook_url);
                                showToast('Copied Webhook URL!');
                              }}
                            >
                              📋 Copy
                            </button>
                          </div>
                          <span style={{ fontSize: '0.7rem', color: 'var(--text-sub)' }}>
                            Register this URL in Standard Bank OneHub to receive instant push settlement &amp; authorizer approval callbacks.
                          </span>
                        </div>
                      </div>

                      {/* API Handshake Test Banner */}
                      <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '8px', padding: '1rem', marginBottom: '1.25rem' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.75rem' }}>
                          <div>
                            <strong style={{ fontSize: '0.82rem', color: 'var(--text-main, #0f172a)' }}>Live Gateway Handshake Verification</strong>
                            <p style={{ margin: '0.2rem 0 0 0', fontSize: '0.74rem', color: 'var(--text-sub)' }}>
                              Verify mutual TLS auth and direct API EFT handshake with {bankConfigForm.api_provider.toUpperCase()} servers.
                            </p>
                          </div>
                          <button
                            type="button"
                            className="btn btn-sm btn-gold"
                            style={{ fontWeight: 700 }}
                            disabled={isTestingApi}
                            onClick={handleTestApiConnection}
                          >
                            {isTestingApi ? '⚡ Testing Connection...' : '⚡ Test API Connection & Handshake'}
                          </button>
                        </div>

                        {apiTestResult && (
                          <div style={{ marginTop: '0.75rem', padding: '0.65rem 0.85rem', borderRadius: '6px', background: apiTestResult.success ? 'rgba(16,185,129,0.1)' : 'rgba(239,68,68,0.1)', border: apiTestResult.success ? '1px solid #10b981' : '1px solid #ef4444', fontSize: '0.78rem' }}>
                            <strong style={{ color: apiTestResult.success ? '#047857' : '#b91c1c' }}>
                              {apiTestResult.success ? '✓ 200 OK — Handshake Successful!' : '✕ Connection Error'}
                            </strong>
                            <div style={{ marginTop: '0.2rem', color: 'var(--text-sub)' }}>
                              {apiTestResult.message} {apiTestResult.latency && `(Latency: ${apiTestResult.latency}ms)`}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  <div className="lmis-form-actions" style={{ marginTop: '1.5rem', display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', borderTop: '1px solid #e2e8f0', paddingTop: '1rem' }}>
                    <button type="button" className="btn btn-sm btn-ghost" onClick={() => setShowBankConfigModal(false)}>Cancel</button>
                    <button type="submit" className="btn btn-sm btn-primary" style={{ fontWeight: 800, padding: '0.5rem 1.25rem' }}>
                      <IcoCheck size={14} /> Save Banking Configuration
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}
        </div>
      )}

      {/* FINANCE */}
      {activeTab === 'finance' && (
        <div>
          {/* Top Finance / Stipends Navigation Toggle */}
          <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.25rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.75rem', flexWrap: 'wrap' }}>
            <button
              type="button"
              className="btn btn-sm btn-ghost"
              style={{ fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.4rem', border: '1px solid var(--border-color)', borderRadius: '6px' }}
              onClick={() => setActiveTab('stipends')}
            >
              💰 SETA Learner Stipends &amp; Bank Disbursements
            </button>
            <button
              type="button"
              className="btn btn-sm btn-primary"
              style={{ fontWeight: 800, display: 'flex', alignItems: 'center', gap: '0.4rem', borderRadius: '6px' }}
              onClick={() => setActiveTab('finance')}
            >
              <IcoWallet size={15} /> 📄 Tuition Fees &amp; Invoices (Self-Paying)
            </button>
          </div>
          <div className="lmis-page-header flex-between">
            <div><h1 className="lmis-page-title">Finance & Fees</h1><p className="lmis-page-sub">Manage invoices and tuition fees.</p></div>
            <button className="btn btn-sm btn-gold" onClick={() => setShowFeeForm(!showFeeForm)}><IcoPlus size={14} /> New Invoice</button>
          </div>

          <div className="lmis-4col mb-4">
            <div className="lmis-stat" style={{ minWidth: 0, overflow: 'hidden' }}>
              <div className="lmis-stat-icon navy"><IcoWallet size={20} /></div>
              <div style={{ flex: 1, minWidth: 0, overflow: 'hidden' }}>
                <div className="lmis-stat-val" title={fmtZAR(totalFees)} style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{fmtZAR(totalFees)}</div>
                <div className="lmis-stat-label">Total Billed</div>
              </div>
            </div>
            <div className="lmis-stat" style={{ minWidth: 0, overflow: 'hidden' }}>
              <div className="lmis-stat-icon red"><IcoWallet size={20} /></div>
              <div style={{ flex: 1, minWidth: 0, overflow: 'hidden' }}>
                <div className="lmis-stat-val" title={fmtZAR(outstanding)} style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{fmtZAR(outstanding)}</div>
                <div className="lmis-stat-label">Outstanding</div>
              </div>
            </div>
            <div className="lmis-stat" style={{ minWidth: 0, overflow: 'hidden' }}>
              <div className="lmis-stat-icon emerald"><IcoCheck size={20} /></div>
              <div style={{ flex: 1, minWidth: 0, overflow: 'hidden' }}>
                <div className="lmis-stat-val" title={fmtZAR(totalFees - outstanding)} style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{fmtZAR(totalFees - outstanding)}</div>
                <div className="lmis-stat-label">Collected</div>
              </div>
            </div>
            <div className="lmis-stat" style={{ minWidth: 0, overflow: 'hidden' }}>
              <div className="lmis-stat-icon gold"><IcoFile size={20} /></div>
              <div style={{ flex: 1, minWidth: 0, overflow: 'hidden' }}>
                <div className="lmis-stat-val">{fees.length}</div>
                <div className="lmis-stat-label">Invoices</div>
              </div>
            </div>
          </div>

          {showFeeForm && (
            <div className="lmis-card mb-4">
              <div className="lmis-card-header"><span className="lmis-card-title">Create Invoice</span><button className="btn btn-sm btn-ghost" onClick={() => setShowFeeForm(false)}><IcoX size={14} /></button></div>
              <div className="lmis-card-body">
                <form onSubmit={handleCreateFee}>
                  <div className="lmis-form-grid">
                    <div className="lmis-field"><label className="lmis-label">Learner</label><select className="lmis-select" value={feeForm.learner_email} onChange={e => setFeeForm({ ...feeForm, learner_email: e.target.value })} required><option value="">-- Select Learner --</option>{student_profiles.map(p => <option key={p.id} value={p.learner_email}>{p.learner_name}</option>)}</select></div>
                    <div className="lmis-field"><label className="lmis-label">Description</label><input className="lmis-input" value={feeForm.description} onChange={e => setFeeForm({ ...feeForm, description: e.target.value })} required placeholder="e.g. Tuition Fee – BPM101" /></div>
                    <div className="lmis-field"><label className="lmis-label">Amount (ZAR)</label><input type="number" className="lmis-input" value={feeForm.amount} onChange={e => setFeeForm({ ...feeForm, amount: e.target.value })} required min="1" /></div>
                    <div className="lmis-field"><label className="lmis-label">Due Date</label><input type="date" className="lmis-input" value={feeForm.due_date} onChange={e => setFeeForm({ ...feeForm, due_date: e.target.value })} required /></div>
                    <div className="lmis-field"><label className="lmis-label">Invoice Number (optional)</label><input className="lmis-input" value={feeForm.invoice_number} onChange={e => setFeeForm({ ...feeForm, invoice_number: e.target.value })} placeholder="Auto-generated if blank" /></div>
                  </div>
                  <div className="lmis-form-actions">
                    <button type="button" className="btn btn-sm btn-ghost" onClick={() => setShowFeeForm(false)}>Cancel</button>
                    <button type="submit" className="btn btn-sm btn-gold"><IcoPlus size={14} /> Create Invoice</button>
                  </div>
                </form>
              </div>
            </div>
          )}

          {fees.length === 0
            ? <div className="lmis-card"><div className="lmis-empty"><IcoWallet size={40} style={{ color: '#CBD5E1' }} /><p className="lmis-empty-title">No invoices</p><p className="lmis-empty-sub">Invoices are automatically created when a learner is enrolled. You can also create them manually.</p></div></div>
            : <div className="lmis-card"><div className="lmis-table-wrap">
              <table className="lmis-table">
                <thead><tr><th>Learner</th><th>Description</th><th>Invoice No.</th><th>Amount</th><th>Due</th><th>Status</th></tr></thead>
                <tbody>
                  {fees.map(f => (
                    <tr key={f.id}>
                      <td style={{ fontWeight: 600 }}>{f.learner_name}</td>
                      <td style={{ color: 'var(--text-sub)' }}>{f.description}</td>
                      <td><span style={{ fontFamily: 'monospace', fontSize: '0.75rem' }}>{f.invoice_number}</span></td>
                      <td style={{ fontWeight: 700 }}>{fmtZAR(f.amount)}</td>
                      <td style={{ color: 'var(--text-sub)' }}>{f.due_date}</td>
                      <td>
                        <span className={`badge ${f.status === 'Paid' ? 'badge-emerald' : 'badge-red'}`}>{f.status}</span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div></div>
          }
        </div>
      )}

      {/* COMPLIANCE */}
      {activeTab === 'compliance' && (
        <div>
          <div className="lmis-page-header"><h1 className="lmis-page-title">Compliance & Reporting</h1><p className="lmis-page-sub">Programme delivery and institutional quality management tracking.</p></div>
          <div className="lmis-2col" style={{ gap: '1rem', marginBottom: '1rem' }}>
            {[
              { title: 'Institutional Programme Delivery', items: [['Curriculum Design & Industry Alignment', activeCourses.length > 0 ? 'complete' : 'pending'],['Assessment Strategy Document', courses.length > 0 ? 'complete' : 'pending'],['Facilitator Qualification Verification', 'in-progress'],['Learner Support Materials Audit', assignments.length > 0 ? 'complete' : 'pending'],['Quality Management System (QMS)', 'in-progress']] },
              { title: 'Workplace & Skills Development Management', items: [['Workplace Skills Plan & Roadmap', enrollments.length > 0 ? 'complete' : 'pending'],['Annual Training Delivery Report', submissions.length > 0 ? 'complete' : 'pending'],['Training Investment & Billing Summary', fees.length > 0 ? 'complete' : 'pending'],['Learner Portfolio of Evidence (PoE)', submissions.length > 0 ? 'in-progress' : 'pending'],['Internal Quality Audit', 'pending']] }
            ].map(section => (
              <div key={section.title} className="lmis-card">
                <div className="lmis-card-header"><span className="lmis-card-title">{section.title}</span></div>
                <div className="lmis-card-body">
                  {section.items.map(([label, status]) => (
                    <div key={label} style={{ marginBottom: '0.875rem' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.35rem' }}>
                        <span style={{ fontSize: '0.78rem', fontWeight: 500, color: 'var(--text-main)' }}>{label}</span>
                        <span className={`badge ${status === 'complete' ? 'badge-emerald' : status === 'in-progress' ? 'badge-orange' : 'badge-navy'}`}>
                          {status === 'complete' ? 'Complete' : status === 'in-progress' ? 'In Progress' : 'Pending'}
                        </span>
                      </div>
                      <div className="lmis-progress-wrap">
                        <div className={`lmis-progress-bar ${status === 'complete' ? 'emerald' : status === 'in-progress' ? 'gold' : 'navy'}`}
                          style={{ width: status === 'complete' ? '100%' : status === 'in-progress' ? '50%' : '10%' }} />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
          <div className="lmis-card">
            <div className="lmis-card-header"><span className="lmis-card-title">Platform Statistics Summary</span></div>
            <div className="lmis-card-body">
              <div className="lmis-4col">
                {[
                  ['Total Learners', student_profiles.length],
                  ['Active Courses', activeCourses.length],
                  ['Total Enrollments', enrollments.length],
                  ['Submissions', submissions.length],
                  ['Attendance Records', attendance.length],
                  ['Certificates Issued', certificates.filter(c => c.status === 'Issued').length],
                  ['Outstanding Invoices', fees.filter(f => f.status !== 'Paid').length],
                  ['Announcements', 0],
                ].map(([label, val]) => (
                  <div key={label} style={{ textAlign: 'center', padding: '0.75rem', background: 'var(--ice)', borderRadius: '8px' }}>
                    <div style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--navy)' }}>{val}</div>
                    <div style={{ fontSize: '0.65rem', fontWeight: 600, color: 'var(--text-sub)', textTransform: 'uppercase', letterSpacing: '0.05em', marginTop: '0.2rem' }}>{label}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* AUDIT TRAIL & ACTIVITY LOG */}
      {activeTab === 'audits' && (() => {
        const allLogs = audit_logs || [];
        const deletionsCount = allLogs.filter(l => l.action_type === 'DELETE' || l.action_type === 'PURGE').length;
        const profileViewsCount = allLogs.filter(l => l.action_type === 'VIEW_PROFILE' || l.action_type === 'VIEW_POE').length;
        const stipendsCount = allLogs.filter(l => ['DISBURSE', 'BATCH_DISBURSE', 'BANK_CONFIG_UPDATE', 'EXPORT_BATCH'].includes(l.action_type)).length;
        const regEditsCount = allLogs.filter(l => ['REGISTER', 'EDIT', 'ENROL'].includes(l.action_type)).length;
        const securityCount = allLogs.filter(l => ['LOGIN', 'SECURITY'].includes(l.action_type)).length;

        let filteredList = allLogs;
        if (auditFilterType === 'DELETE') {
          filteredList = filteredList.filter(l => l.action_type === 'DELETE' || l.action_type === 'PURGE');
        } else if (auditFilterType === 'VIEW') {
          filteredList = filteredList.filter(l => l.action_type === 'VIEW_PROFILE' || l.action_type === 'VIEW_POE');
        } else if (auditFilterType === 'DISBURSE') {
          filteredList = filteredList.filter(l => ['DISBURSE', 'BATCH_DISBURSE', 'BANK_CONFIG_UPDATE', 'EXPORT_BATCH'].includes(l.action_type));
        } else if (auditFilterType === 'REGISTRATION') {
          filteredList = filteredList.filter(l => ['REGISTER', 'EDIT', 'ENROL'].includes(l.action_type));
        } else if (auditFilterType === 'SECURITY') {
          filteredList = filteredList.filter(l => ['LOGIN', 'SECURITY'].includes(l.action_type));
        }

        if (auditSearchQuery.trim()) {
          const q = auditSearchQuery.toLowerCase().trim();
          filteredList = filteredList.filter(l =>
            (l.performed_by || '').toLowerCase().includes(q) ||
            (l.role || '').toLowerCase().includes(q) ||
            (l.target_entity || '').toLowerCase().includes(q) ||
            (l.details || '').toLowerCase().includes(q) ||
            (l.action_type || '').toLowerCase().includes(q) ||
            (l.device || '').toLowerCase().includes(q) ||
            (l.metadata && JSON.stringify(l.metadata).toLowerCase().includes(q))
          );
        }

        const getActionBadge = (act) => {
          switch (act) {
            case 'REGISTER': return 'badge-emerald';
            case 'ENROL': return 'badge-gold';
            case 'EDIT': return 'badge-teal';
            case 'DELETE':
            case 'PURGE': return 'badge-red';
            case 'VIEW_PROFILE':
            case 'VIEW_POE': return 'badge-teal';
            case 'DISBURSE':
            case 'BATCH_DISBURSE': return 'badge-gold';
            case 'BANK_CONFIG_UPDATE':
            case 'EXPORT_BATCH': return 'badge-navy';
            case 'LOGIN': return 'badge-navy';
            default: return 'badge-navy';
          }
        };

        const getActionIcon = (act) => {
          switch (act) {
            case 'DELETE':
            case 'PURGE': return '🗑️';
            case 'VIEW_PROFILE': return '👁️';
            case 'VIEW_POE': return '📂';
            case 'DISBURSE': return '💳';
            case 'BATCH_DISBURSE': return '💸';
            case 'BANK_CONFIG_UPDATE': return '🏦';
            case 'EXPORT_BATCH': return '📊';
            case 'REGISTER': return '✨';
            case 'EDIT': return '✏️';
            case 'LOGIN': return '🔒';
            default: return '🛡️';
          }
        };

        return (
          <div>
            <div className="lmis-page-header flex-between" style={{ flexWrap: 'wrap', gap: '1rem' }}>
              <div>
                <h1 className="lmis-page-title">Institutional Audit Trail &amp; Forensic Log</h1>
                <p className="lmis-page-sub">
                  Tamper-evident record of all administrative activities, record deletions with historical snapshots, profile views, and financial transactions.
                </p>
              </div>
              <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                <button
                  className="btn btn-sm btn-outline"
                  onClick={() => {
                    const csvRows = [
                      ['Timestamp', 'Action', 'Performed By', 'Role', 'Target Entity', 'Origin / Device', 'Details Narrative'].join(',')
                    ];
                    filteredList.forEach(log => {
                      const cleanDet = (log.details || '').replace(/"/g, '""');
                      csvRows.push([
                        `"${new Date(log.timestamp).toISOString()}"`,
                        `"${log.action_type}"`,
                        `"${log.performed_by || ''}"`,
                        `"${log.role || ''}"`,
                        `"${log.target_entity || ''}"`,
                        `"${log.device || ''}"`,
                        `"${cleanDet}"`
                      ].join(','));
                    });
                    const blob = new Blob([csvRows.join('\n')], { type: 'text/csv;charset=utf-8;' });
                    const url = URL.createObjectURL(blob);
                    const link = document.createElement('a');
                    link.setAttribute('href', url);
                    link.setAttribute('download', `LMIS_Audit_Trail_${new Date().toISOString().split('T')[0]}.csv`);
                    link.click();
                  }}
                >
                  📊 Export CSV
                </button>
                <button
                  className="btn btn-sm btn-gold"
                  onClick={() => {
                    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(allLogs, null, 2));
                    const downloadAnchor = document.createElement('a');
                    downloadAnchor.setAttribute("href", dataStr);
                    downloadAnchor.setAttribute("download", `LMIS_Audit_Trail_${new Date().toISOString().split('T')[0]}.json`);
                    downloadAnchor.click();
                  }}
                >
                  📥 Export Complete JSON
                </button>
              </div>
            </div>

            {/* 6 Category Stat Cards */}
            <div className="lmis-stats-grid mb-4" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))' }}>
              <div className="lmis-stat" style={{ cursor: 'pointer' }} onClick={() => setAuditFilterType('all')}>
                <div className="lmis-stat-icon navy"><IcoShield size={20} /></div>
                <div><div className="lmis-stat-val">{allLogs.length}</div><div className="lmis-stat-label">Total Audit Events</div></div>
              </div>
              <div className="lmis-stat" style={{ cursor: 'pointer' }} onClick={() => setAuditFilterType('DELETE')}>
                <div className="lmis-stat-icon red"><IcoTrash size={20} /></div>
                <div><div className="lmis-stat-val">{deletionsCount}</div><div className="lmis-stat-label">Deletions &amp; Purges</div></div>
              </div>
              <div className="lmis-stat" style={{ cursor: 'pointer' }} onClick={() => setAuditFilterType('VIEW')}>
                <div className="lmis-stat-icon teal"><IcoEye size={20} /></div>
                <div><div className="lmis-stat-val">{profileViewsCount}</div><div className="lmis-stat-label">Profile &amp; PoE Views</div></div>
              </div>
              <div className="lmis-stat" style={{ cursor: 'pointer' }} onClick={() => setAuditFilterType('DISBURSE')}>
                <div className="lmis-stat-icon gold"><IcoWallet size={20} /></div>
                <div><div className="lmis-stat-val">{stipendsCount}</div><div className="lmis-stat-label">Stipends &amp; Banking</div></div>
              </div>
              <div className="lmis-stat" style={{ cursor: 'pointer' }} onClick={() => setAuditFilterType('REGISTRATION')}>
                <div className="lmis-stat-icon emerald"><IcoCheck size={20} /></div>
                <div><div className="lmis-stat-val">{regEditsCount}</div><div className="lmis-stat-label">Registrations &amp; Edits</div></div>
              </div>
              <div className="lmis-stat" style={{ cursor: 'pointer' }} onClick={() => setAuditFilterType('SECURITY')}>
                <div className="lmis-stat-icon navy"><IcoUser size={20} /></div>
                <div><div className="lmis-stat-val">{securityCount}</div><div className="lmis-stat-label">Logins &amp; Security</div></div>
              </div>
            </div>

            {/* Filter Navigation Tabs and Live Search */}
            <div className="lmis-card mb-4" style={{ padding: '0.85rem 1.25rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.75rem' }}>
                <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap' }}>
                  <button
                    className={`btn btn-sm ${auditFilterType === 'all' ? 'btn-primary' : 'btn-ghost'}`}
                    onClick={() => setAuditFilterType('all')}
                    style={{ fontSize: '0.78rem' }}
                  >
                    All Events ({allLogs.length})
                  </button>
                  <button
                    className={`btn btn-sm ${auditFilterType === 'DELETE' ? 'btn-danger' : 'btn-ghost'}`}
                    onClick={() => setAuditFilterType('DELETE')}
                    style={{ fontSize: '0.78rem' }}
                  >
                    🔴 Deletions ({deletionsCount})
                  </button>
                  <button
                    className={`btn btn-sm ${auditFilterType === 'VIEW' ? 'btn-teal' : 'btn-ghost'}`}
                    onClick={() => setAuditFilterType('VIEW')}
                    style={{ fontSize: '0.78rem' }}
                  >
                    👁️ Profile Views ({profileViewsCount})
                  </button>
                  <button
                    className={`btn btn-sm ${auditFilterType === 'DISBURSE' ? 'btn-gold' : 'btn-ghost'}`}
                    onClick={() => setAuditFilterType('DISBURSE')}
                    style={{ fontSize: '0.78rem' }}
                  >
                    💳 Stipends &amp; Banking ({stipendsCount})
                  </button>
                  <button
                    className={`btn btn-sm ${auditFilterType === 'REGISTRATION' ? 'btn-emerald' : 'btn-ghost'}`}
                    onClick={() => setAuditFilterType('REGISTRATION')}
                    style={{ fontSize: '0.78rem' }}
                  >
                    🟢 Registrations ({regEditsCount})
                  </button>
                  <button
                    className={`btn btn-sm ${auditFilterType === 'SECURITY' ? 'btn-outline' : 'btn-ghost'}`}
                    onClick={() => setAuditFilterType('SECURITY')}
                    style={{ fontSize: '0.78rem' }}
                  >
                    🔒 Logins ({securityCount})
                  </button>
                </div>

                <div style={{ position: 'relative', minWidth: '260px' }}>
                  <input
                    type="text"
                    className="lmis-input"
                    placeholder="Search audit trail by actor, role, entity..."
                    style={{ paddingLeft: '2.2rem', fontSize: '0.82rem', height: '36px' }}
                    value={auditSearchQuery}
                    onChange={e => setAuditSearchQuery(e.target.value)}
                  />
                  <div style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-sub)' }}>
                    <IcoSearch size={14} />
                  </div>
                  {auditSearchQuery && (
                    <button
                      onClick={() => setAuditSearchQuery('')}
                      style={{ position: 'absolute', right: '0.75rem', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-sub)' }}
                    >
                      <IcoX size={12} />
                    </button>
                  )}
                </div>
              </div>
            </div>

            {/* Audit Log Table */}
            <div className="lmis-card">
              <div className="lmis-card-header flex-between" style={{ padding: '1rem 1.25rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <span className="lmis-card-title">Event Ledger</span>
                  <span className="badge badge-navy" style={{ fontSize: '0.75rem' }}>
                    Showing {filteredList.length} of {allLogs.length} events
                  </span>
                </div>
                <span className="badge badge-emerald">Live Audit Engine Active</span>
              </div>
              <div className="lmis-table-wrap">
                <table className="lmis-table">
                  <thead>
                    <tr>
                      <th style={{ width: '130px' }}>Timestamp</th>
                      <th style={{ width: '140px' }}>Action Type</th>
                      <th style={{ width: '160px' }}>Performed By</th>
                      <th style={{ width: '150px' }}>Target Entity</th>
                      <th>Audit Details Narrative</th>
                      <th style={{ width: '130px', textAlign: 'center' }}>Forensic Data</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredList.length === 0 ? (
                      <tr>
                        <td colSpan="6" style={{ textAlign: 'center', padding: '3rem 1rem', color: 'var(--text-sub)' }}>
                          No audit events matched your search filter.
                        </td>
                      </tr>
                    ) : (
                      filteredList.map(log => {
                        const hasSnapshot = Boolean(log.metadata?.snapshot);
                        const hasMeta = Boolean(log.metadata);
                        return (
                          <tr key={log.id} style={{ background: hasSnapshot ? 'rgba(239, 68, 68, 0.03)' : undefined }}>
                            <td style={{ fontSize: '0.76rem', color: 'var(--text-sub)', whiteSpace: 'nowrap' }}>
                              <div style={{ fontWeight: 600 }}>{new Date(log.timestamp).toLocaleDateString('en-ZA')}</div>
                              <div style={{ fontSize: '0.7rem', opacity: 0.8 }}>{new Date(log.timestamp).toLocaleTimeString('en-ZA')}</div>
                            </td>
                            <td>
                              <span className={`badge ${getActionBadge(log.action_type)}`} style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', fontSize: '0.72rem', fontWeight: 700 }}>
                                <span>{getActionIcon(log.action_type)}</span>
                                {log.action_type}
                              </span>
                            </td>
                            <td>
                              <div style={{ fontWeight: 700, fontSize: '0.82rem', color: 'var(--text-main)' }}>{log.performed_by}</div>
                              <span className="badge badge-gold" style={{ fontSize: '0.65rem', marginTop: '2px', padding: '0.1rem 0.4rem' }}>{log.role || 'Admin'}</span>
                            </td>
                            <td>
                              <span style={{ fontWeight: 600, color: 'var(--primary-navy)', fontSize: '0.82rem' }}>{log.target_entity}</span>
                              <div style={{ fontSize: '0.7rem', color: 'var(--text-sub)' }}>{log.device || 'Portal Client'}</div>
                            </td>
                            <td style={{ fontSize: '0.82rem', color: 'var(--text-main)', maxWidth: '420px', lineHeight: 1.45 }}>
                              {log.details}
                            </td>
                            <td style={{ textAlign: 'center' }}>
                              {hasMeta ? (
                                <button
                                  className={`btn btn-sm ${hasSnapshot ? 'btn-danger' : 'btn-outline'}`}
                                  style={{ fontSize: '0.7rem', padding: '0.25rem 0.55rem', display: 'inline-flex', alignItems: 'center', gap: '4px', whiteSpace: 'nowrap' }}
                                  onClick={() => setInspectingAuditLog(log)}
                                  title="Inspect structured event metadata and forensic snapshot"
                                >
                                  🔍 {hasSnapshot ? 'Inspect Snapshot' : 'Inspect Meta'}
                                </button>
                              ) : (
                                <span style={{ fontSize: '0.7rem', color: 'var(--text-sub)' }}>Standard</span>
                              )}
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        );
      })()}

      
      
      {/* LECTURER COMPLIANCE DOCUMENTS MODAL */}
      {viewingLecturerDocs && (
        <div className="lmis-modal-overlay" style={{ position: 'fixed', inset: 0, background: 'rgba(15,23,42,0.7)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999, padding: '1rem' }}>
          <div className="lmis-modal-card" style={{ background: 'var(--bg-card)', color: 'var(--text-main)', border: '1px solid var(--border-color)', borderRadius: '12px', width: '100%', maxWidth: '800px', maxHeight: '90vh', overflowY: 'auto', padding: '1.5rem', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.3)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.75rem', marginBottom: '1.25rem' }}>
              <div>
                <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--text-main)', margin: 0 }}>
                  📄 Statutory Compliance Documents — {viewingLecturerDocs.name}
                </h3>
                <p style={{ fontSize: '0.8rem', color: 'var(--text-sub)', margin: '0.25rem 0 0 0' }}>
                  Module: <strong>{viewingLecturerDocs.department || 'BPM & Operations'}</strong> · Email: {viewingLecturerDocs.email}
                </p>
              </div>
              <button className="btn btn-sm btn-ghost" onClick={() => setViewingLecturerDocs(null)}><IcoX size={18} /></button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              {/* 1. ID Copy */}
              <div style={{ background: '#f8fafc', padding: '1rem', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                <div style={{ fontSize: '0.85rem', fontWeight: 700, color: '#0f172a', marginBottom: '0.5rem' }}>
                  1. Certified ID / Passport Document
                </div>
                {(viewingLecturerDocs.id_copy_attachments || []).length > 0 ? (
                  <AttachmentList files={viewingLecturerDocs.id_copy_attachments} />
                ) : (
                  <span style={{ fontSize: '0.78rem', color: '#94a3b8', fontStyle: 'italic' }}>No ID copy attached.</span>
                )}
              </div>

              {/* 2. Qualifications */}
              <div style={{ background: '#f8fafc', padding: '1rem', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                <div style={{ fontSize: '0.85rem', fontWeight: 700, color: '#0f172a', marginBottom: '0.5rem' }}>
                  2. Academic Qualifications &amp; Degrees ({viewingLecturerDocs.highest_qualification || 'Degree / Diploma'})
                </div>
                {(viewingLecturerDocs.qualification_proof_attachments || []).length > 0 ? (
                  <AttachmentList files={viewingLecturerDocs.qualification_proof_attachments} />
                ) : (
                  <span style={{ fontSize: '0.78rem', color: '#94a3b8', fontStyle: 'italic' }}>No qualification certificates attached.</span>
                )}
              </div>

              {/* 3. CV */}
              <div style={{ background: '#f8fafc', padding: '1rem', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                <div style={{ fontSize: '0.85rem', fontWeight: 700, color: '#0f172a', marginBottom: '0.5rem' }}>
                  3. Detailed Curriculum Vitae (CV)
                </div>
                {(viewingLecturerDocs.cv_attachments || []).length > 0 ? (
                  <AttachmentList files={viewingLecturerDocs.cv_attachments} />
                ) : (
                  <span style={{ fontSize: '0.78rem', color: '#94a3b8', fontStyle: 'italic' }}>No CV attached.</span>
                )}
              </div>

              {/* 4. Bank / Tax */}
              <div style={{ background: '#f8fafc', padding: '1rem', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                <div style={{ fontSize: '0.85rem', fontWeight: 700, color: '#0f172a', marginBottom: '0.5rem' }}>
                  4. Proof of Banking / Tax Details
                </div>
                {(viewingLecturerDocs.bank_proof_attachments || []).length > 0 ? (
                  <AttachmentList files={viewingLecturerDocs.bank_proof_attachments} />
                ) : (
                  <span style={{ fontSize: '0.78rem', color: '#94a3b8', fontStyle: 'italic' }}>No banking details proof attached.</span>
                )}
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '1.5rem', borderTop: '1px solid #e2e8f0', paddingTop: '1rem' }}>
              <button type="button" className="btn btn-sm btn-gold" onClick={() => setViewingLecturerDocs(null)}>
                Close Viewer
              </button>
            </div>
          </div>
        </div>
      )}

      {/* GLOBAL EDIT LECTURER MODAL OVERLAY */}
      {editingLecturer && (
        <div className="lmis-modal-overlay" style={{ position: 'fixed', inset: 0, background: 'rgba(15,23,42,0.75)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999, padding: '1rem' }}>
          <div className="lmis-modal-card" style={{ background: 'var(--bg-card, #fff)', color: 'var(--text-main, #0f172a)', border: '2px solid var(--gold, #d97706)', borderRadius: '12px', width: '100%', maxWidth: '680px', maxHeight: '90vh', overflowY: 'auto', padding: '1.5rem', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.35)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--border-color, #e2e8f0)', paddingBottom: '0.75rem', marginBottom: '1.25rem' }}>
              <div>
                <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: 'var(--text-main, #0f172a)', margin: 0 }}>
                  ✏ Edit Facilitator / Lecturer — {editingLecturer.name}
                </h3>
                <p style={{ fontSize: '0.78rem', color: 'var(--text-sub, #64748b)', margin: '0.2rem 0 0 0' }}>
                  Update faculty credentials, assigned module specialization, and portal login password.
                </p>
              </div>
              <button className="btn btn-sm btn-ghost" onClick={() => setEditingLecturer(null)}><IcoX size={18} /></button>
            </div>

            <form onSubmit={handleSaveEditLecturer}>
              <div className="lmis-form-grid">
                <div className="lmis-field">
                  <label className="lmis-label">Full Name &amp; Title *</label>
                  <input className="lmis-input" value={editLecForm.name} onChange={e => setEditLecForm({ ...editLecForm, name: e.target.value })} required placeholder="e.g. Mr. Tshepo Tseko Mofokeng" />
                </div>
                <div className="lmis-field">
                  <label className="lmis-label">Official Email Address *</label>
                  <input type="email" className="lmis-input" value={editLecForm.email} onChange={e => setEditLecForm({ ...editLecForm, email: e.target.value })} required placeholder="lecturer@nexa-transform.com" />
                </div>
                <div className="lmis-field">
                  <label className="lmis-label">Phone Number *</label>
                  <input className="lmis-input" value={editLecForm.phone} onChange={e => setEditLecForm({ ...editLecForm, phone: e.target.value })} required placeholder="+27 82 123 4567" />
                </div>
                <div className="lmis-field">
                  <label className="lmis-label">Assigned Module Specialization *</label>
                  <select
                    className="lmis-select"
                    value={
                      editLecForm.assigned_course_code ||
                      (availableCourseOptions.find(m => m.title === editLecForm.department || m.code === editLecForm.department)?.code) ||
                      (courses.find(c => (c.lecturer_email || '').toLowerCase().trim() === (editLecForm.email || '').toLowerCase().trim())?.code) ||
                      ''
                    }
                    onChange={e => {
                      const code = e.target.value;
                      const found = availableCourseOptions.find(m => m.code === code);
                      setEditLecForm({
                        ...editLecForm,
                        assigned_course_code: code,
                        department: found ? found.title : (code || '')
                      });
                    }}
                  >
                    <option value="">— Unassigned (No Module) —</option>
                    {availableCourseOptions.map(m => (
                      <option key={m.code} value={m.code}>{m.code} · {m.title}</option>
                    ))}
                  </select>
                </div>
                <div className="lmis-field">
                  <label className="lmis-label">Academic Position / Role</label>
                  <input className="lmis-input" value={editLecForm.title} onChange={e => setEditLecForm({ ...editLecForm, title: e.target.value })} placeholder="e.g. Lead Facilitator / Senior Lecturer" />
                </div>
                <div className="lmis-field" style={{ gridColumn: '1/-1' }}>
                  <label className="lmis-label">🔑 Set / Update Portal Login Password *</label>
                  <div style={{ display: 'flex', gap: '0.5rem' }}>
                    <input className="lmis-input" value={editLecForm.password} onChange={e => setEditLecForm({ ...editLecForm, password: e.target.value })} required placeholder="Enter new password" />
                    <button type="button" className="btn btn-sm btn-outline" onClick={() => setEditLecForm({ ...editLecForm, password: 'NexaLec#' + Math.floor(1000 + Math.random() * 9000) })}>
                      🎲 Generate Password
                    </button>
                  </div>
                </div>
              </div>
              <div className="lmis-form-actions" style={{ marginTop: '1.25rem', display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', borderTop: '1px solid #e2e8f0', paddingTop: '1rem' }}>
                <button type="button" className="btn btn-sm btn-ghost" onClick={() => setEditingLecturer(null)}>Cancel</button>
                <button type="submit" className="btn btn-sm btn-gold" style={{ fontWeight: 800, padding: '0.5rem 1.25rem' }}>
                  <IcoCheck size={14} /> Save Changes &amp; Update Password
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* GLOBAL EDIT LEARNER MODAL OVERLAY */}
      {editingStudent && (
        <div className="lmis-modal-overlay" style={{ position: 'fixed', inset: 0, background: 'rgba(15,23,42,0.75)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999, padding: '1rem' }}>
          <div className="lmis-modal-card" style={{ background: 'var(--bg-card, #fff)', color: 'var(--text-main, #0f172a)', border: '2px solid var(--primary-navy, #1e3a8a)', borderRadius: '12px', width: '100%', maxWidth: '680px', maxHeight: '90vh', overflowY: 'auto', padding: '1.5rem', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.35)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--border-color, #e2e8f0)', paddingBottom: '0.75rem', marginBottom: '1.25rem' }}>
              <div>
                <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: 'var(--text-main, #0f172a)', margin: 0 }}>
                  ✏ Edit Learner Profile — {editingStudent.learner_name}
                </h3>
                <p style={{ fontSize: '0.78rem', color: 'var(--text-sub, #64748b)', margin: '0.2rem 0 0 0' }}>
                  Student Number: <strong>{editingStudent.student_number || '—'}</strong> · Email: {editingStudent.learner_email}
                </p>
              </div>
              <button className="btn btn-sm btn-ghost" onClick={() => setEditingStudent(null)}><IcoX size={18} /></button>
            </div>

            <form onSubmit={handleSaveEditStudent}>
              <div className="lmis-form-grid">
                <div className="lmis-field">
                  <label className="lmis-label">Full Name *</label>
                  <input className="lmis-input" value={editStudentForm.learner_name} onChange={e => setEditStudentForm({ ...editStudentForm, learner_name: e.target.value })} required />
                </div>
                <div className="lmis-field">
                  <label className="lmis-label">Email Address *</label>
                  <input type="email" className="lmis-input" value={editStudentForm.learner_email} onChange={e => setEditStudentForm({ ...editStudentForm, learner_email: e.target.value })} required />
                </div>
                <div className="lmis-field">
                  <label className="lmis-label">Phone Number</label>
                  <input className="lmis-input" value={editStudentForm.phone} onChange={e => setEditStudentForm({ ...editStudentForm, phone: e.target.value })} placeholder="+27 82 000 0000" />
                </div>
                <div className="lmis-field">
                  <label className="lmis-label">ID or Passport Number</label>
                  <input className="lmis-input" value={editStudentForm.id_passport} onChange={e => setEditStudentForm({ ...editStudentForm, id_passport: e.target.value })} placeholder="South African ID or Passport" />
                </div>
                <div className="lmis-field">
                  <label className="lmis-label">Student Number</label>
                  <input className="lmis-input" value={editStudentForm.student_number} onChange={e => setEditStudentForm({ ...editStudentForm, student_number: e.target.value })} />
                </div>
                <div className="lmis-field">
                  <label className="lmis-label">Employment Status</label>
                  <select className="lmis-select" value={editStudentForm.employment_status} onChange={e => setEditStudentForm({ ...editStudentForm, employment_status: e.target.value })}>
                    <option value="Employed">Employed</option>
                    <option value="Unemployed">Unemployed</option>
                    <option value="Self-Employed">Self-Employed</option>
                    <option value="Intern">Intern / Work Placement</option>
                  </select>
                </div>
                <div className="lmis-field" style={{ gridColumn: '1/-1' }}>
                  <label className="lmis-label">Programme / Qualification Title</label>
                  <input className="lmis-input" value={editStudentForm.qualification} onChange={e => setEditStudentForm({ ...editStudentForm, qualification: e.target.value, programme_enrolled: e.target.value })} placeholder="Business Process and Work Study Management" />
                </div>
                <div className="lmis-field">
                  <label className="lmis-label">Province</label>
                  <input className="lmis-input" value={editStudentForm.province} onChange={e => setEditStudentForm({ ...editStudentForm, province: e.target.value })} placeholder="Gauteng" />
                </div>
                <div className="lmis-field">
                  <label className="lmis-label">City</label>
                  <input className="lmis-input" value={editStudentForm.city} onChange={e => setEditStudentForm({ ...editStudentForm, city: e.target.value })} placeholder="Johannesburg" />
                </div>
                <div className="lmis-field" style={{ gridColumn: '1/-1', borderTop: '1px solid var(--border-color, #e2e8f0)', paddingTop: '1rem', marginTop: '0.5rem' }}>
                  <label className="lmis-label">💰 Funding Model &amp; Stipend Eligibility *</label>
                  <div style={{ display: 'flex', gap: '0.75rem', marginTop: '0.25rem', flexWrap: 'wrap' }}>
                    <label style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', cursor: 'pointer', padding: '0.4rem 0.75rem', borderRadius: '6px', border: editStudentForm.funding_type === 'funded' ? '2px solid #10b981' : '1px solid var(--border-color, #cbd5e1)', background: editStudentForm.funding_type === 'funded' ? 'rgba(16,185,129,0.08)' : 'transparent' }}>
                      <input type="radio" name="edit_funding_type" value="funded" checked={editStudentForm.funding_type === 'funded'} onChange={() => setEditStudentForm({ ...editStudentForm, funding_type: 'funded' })} />
                      <span style={{ fontWeight: 600, fontSize: '0.8rem' }}>🟢 Funded Learner (Eligible for Stipends)</span>
                    </label>
                    <label style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', cursor: 'pointer', padding: '0.4rem 0.75rem', borderRadius: '6px', border: editStudentForm.funding_type === 'self_paying' ? '2px solid #3b82f6' : '1px solid var(--border-color, #cbd5e1)', background: editStudentForm.funding_type === 'self_paying' ? 'rgba(59,130,246,0.08)' : 'transparent' }}>
                      <input type="radio" name="edit_funding_type" value="self_paying" checked={editStudentForm.funding_type === 'self_paying'} onChange={() => setEditStudentForm({ ...editStudentForm, funding_type: 'self_paying', stipend_amount: 0 })} />
                      <span style={{ fontWeight: 600, fontSize: '0.8rem' }}>🔵 Self-Paying Learner (Tuition Payer / No Stipend)</span>
                    </label>
                  </div>
                </div>

                {editStudentForm.funding_type === 'funded' && (
                  <>
                    <div className="lmis-field">
                      <label className="lmis-label">Funder / Grant Sponsor</label>
                      <input className="lmis-input" value={editStudentForm.funder_name} onChange={e => setEditStudentForm({ ...editStudentForm, funder_name: e.target.value })} placeholder="Services SETA" />
                    </div>
                    <div className="lmis-field">
                      <label className="lmis-label">Monthly Stipend Allowance (ZAR)</label>
                      <input type="number" className="lmis-input" value={editStudentForm.stipend_amount} onChange={e => setEditStudentForm({ ...editStudentForm, stipend_amount: e.target.value })} min="0" placeholder="4500" />
                    </div>
                    <div className="lmis-field">
                      <label className="lmis-label">Bank Name</label>
                      <select className="lmis-select" value={editStudentForm.bank_name} onChange={e => setEditStudentForm({ ...editStudentForm, bank_name: e.target.value })}>
                        {['Standard Bank', 'First National Bank (FNB)', 'Capitec Bank', 'Nedbank', 'Absa Bank', 'TymeBank', 'Discovery Bank', 'African Bank', 'Bidvest Bank', 'Other'].map(b => (
                          <option key={b} value={b}>{b}</option>
                        ))}
                      </select>
                    </div>
                    <div className="lmis-field">
                      <label className="lmis-label">Bank Account Number</label>
                      <input className="lmis-input" value={editStudentForm.bank_account_number} onChange={e => setEditStudentForm({ ...editStudentForm, bank_account_number: e.target.value })} placeholder="10148928374" />
                    </div>
                    <div className="lmis-field">
                      <label className="lmis-label">Branch Code</label>
                      <input className="lmis-input" value={editStudentForm.bank_branch_code} onChange={e => setEditStudentForm({ ...editStudentForm, bank_branch_code: e.target.value })} placeholder="051001" />
                    </div>
                    <div className="lmis-field">
                      <label className="lmis-label">Account Type</label>
                      <select className="lmis-select" value={editStudentForm.bank_account_type} onChange={e => setEditStudentForm({ ...editStudentForm, bank_account_type: e.target.value })}>
                        {['Savings', 'Cheque / Current', 'Transmission'].map(t => <option key={t} value={t}>{t}</option>)}
                      </select>
                    </div>
                  </>
                )}
              </div>
              <div className="lmis-form-actions" style={{ marginTop: '1.25rem', display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', borderTop: '1px solid #e2e8f0', paddingTop: '1rem' }}>
                <button type="button" className="btn btn-sm btn-ghost" onClick={() => setEditingStudent(null)}>Cancel</button>
                <button type="submit" className="btn btn-sm btn-primary" style={{ fontWeight: 800, padding: '0.5rem 1.25rem' }}>
                  <IcoCheck size={14} /> Save Learner Details
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* GLOBAL EDIT COURSE MODAL OVERLAY */}
      {editingCourse && (
        <div className="lmis-modal-overlay" style={{ position: 'fixed', inset: 0, background: 'rgba(15,23,42,0.75)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999, padding: '1rem' }}>
          <div className="lmis-modal-card" style={{ background: 'var(--bg-card, #fff)', color: 'var(--text-main, #0f172a)', border: '2px solid var(--teal, #0d9488)', borderRadius: '12px', width: '100%', maxWidth: '680px', maxHeight: '90vh', overflowY: 'auto', padding: '1.5rem', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.35)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--border-color, #e2e8f0)', paddingBottom: '0.75rem', marginBottom: '1.25rem' }}>
              <div>
                <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: 'var(--text-main, #0f172a)', margin: 0 }}>
                  ✏ Edit Course Module — {editingCourse.code} ({editingCourse.title})
                </h3>
                <p style={{ fontSize: '0.78rem', color: 'var(--text-sub, #64748b)', margin: '0.2rem 0 0 0' }}>
                  Update module details, status, and assigned academic facilitator.
                </p>
              </div>
              <button className="btn btn-sm btn-ghost" onClick={() => setEditingCourse(null)}><IcoX size={18} /></button>
            </div>

            <form onSubmit={handleSaveEditCourse}>
              <div className="lmis-form-grid">
                <div className="lmis-field">
                  <label className="lmis-label">Module Code *</label>
                  <input className="lmis-input" value={editCourseForm.code} onChange={e => setEditCourseForm({ ...editCourseForm, code: e.target.value.toUpperCase() })} required />
                </div>
                <div className="lmis-field">
                  <label className="lmis-label">Module Title *</label>
                  <input className="lmis-input" value={editCourseForm.title} onChange={e => setEditCourseForm({ ...editCourseForm, title: e.target.value })} required />
                </div>
                <div className="lmis-field">
                  <label className="lmis-label">Category</label>
                  <input className="lmis-input" value={editCourseForm.category} onChange={e => setEditCourseForm({ ...editCourseForm, category: e.target.value })} />
                </div>
                <div className="lmis-field">
                  <label className="lmis-label">Credits (SAQA)</label>
                  <input type="number" className="lmis-input" value={editCourseForm.credits} onChange={e => setEditCourseForm({ ...editCourseForm, credits: e.target.value })} />
                </div>
                <div className="lmis-field">
                  <label className="lmis-label">Status</label>
                  <select className="lmis-select" value={editCourseForm.status} onChange={e => setEditCourseForm({ ...editCourseForm, status: e.target.value })}>
                    <option value="Active">Active</option>
                    <option value="Upcoming">Upcoming</option>
                    <option value="Inactive">Inactive</option>
                  </select>
                </div>
                <div className="lmis-field">
                  <label className="lmis-label">Assigned Facilitator</label>
                  <select className="lmis-select" value={editCourseForm.lecturer_email} onChange={e => setEditCourseForm({ ...editCourseForm, lecturer_email: e.target.value })}>
                    <option value="">-- No Facilitator Assigned --</option>
                    {(system_lecturers || []).map(l => (
                      <option key={l.email} value={l.email}>{l.name} ({l.department || l.email})</option>
                    ))}
                  </select>
                </div>
                <div className="lmis-field" style={{ gridColumn: '1/-1' }}>
                  <label className="lmis-label">Module Description</label>
                  <textarea className="lmis-textarea" rows={3} value={editCourseForm.description} onChange={e => setEditCourseForm({ ...editCourseForm, description: e.target.value })} />
                </div>
              </div>
              <div className="lmis-form-actions" style={{ marginTop: '1.25rem', display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', borderTop: '1px solid #e2e8f0', paddingTop: '1rem' }}>
                <button type="button" className="btn btn-sm btn-ghost" onClick={() => setEditingCourse(null)}>Cancel</button>
                <button type="submit" className="btn btn-sm btn-gold" style={{ fontWeight: 800, padding: '0.5rem 1.25rem' }}>
                  <IcoCheck size={14} /> Save Module Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* BULK CSV IMPORT MODAL */}
      {showBulkCsvModal && (
        <div className="lmis-modal-overlay" style={{ position: 'fixed', inset: 0, background: 'rgba(15,23,42,0.7)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999, padding: '1rem' }}>
          <div className="lmis-modal-card" style={{ background: 'var(--bg-card)', color: 'var(--text-main)', border: '1px solid var(--border-color)', borderRadius: '10px', width: '100%', maxWidth: '850px', maxHeight: '90vh', overflowY: 'auto', padding: '1.5rem', boxShadow: '0 20px 25px -5px rgba(0,0,0,0.3)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.75rem', marginBottom: '1rem' }}>
              <div>
                <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: 'var(--text-main)', margin: 0 }}>📂 Bulk Learner Cohort Import (CSV)</h3>
                <p style={{ fontSize: '0.78rem', color: 'var(--text-sub)', margin: '0.2rem 0 0 0' }}>Upload a spreadsheet of corporate or institutional learners to enroll them simultaneously.</p>
              </div>
              <button className="btn btn-sm btn-ghost" onClick={() => { setShowBulkCsvModal(false); setCsvPreviewRows([]); }}><IcoX size={16} /></button>
            </div>

            <div style={{ display: 'flex', gap: '1rem', marginBottom: '1.25rem', flexWrap: 'wrap', alignItems: 'center', background: 'var(--bg-card-secondary)', padding: '0.85rem', borderRadius: '8px', border: '1px solid var(--border-color)' }}>
              <button type="button" className="btn btn-sm btn-outline" onClick={handleDownloadCsvTemplate}>
                📥 Download CSV Sample Template
              </button>
              <div style={{ flex: 1, minWidth: '220px' }}>
                <label style={{ fontSize: '0.75rem', fontWeight: 700, color: '#334155', display: 'block', marginBottom: '0.25rem' }}>Auto-Enrol in Course (Optional):</label>
                <select className="lmis-select" value={csvTargetCourse} onChange={e => setCsvTargetCourse(e.target.value)} style={{ padding: '0.35rem 0.6rem', fontSize: '0.8rem' }}>
                  <option value="">-- No immediate course enrollment --</option>
                  {courses.map(c => <option key={c.id} value={c.code}>{c.title} ({c.code})</option>)}
                </select>
              </div>
              <div style={{ flex: 1, minWidth: '200px' }}>
                <label style={{ fontSize: '0.75rem', fontWeight: 700, color: '#334155', display: 'block', marginBottom: '0.25rem' }}>Select CSV File to Upload:</label>
                <input type="file" accept=".csv" onChange={handleCsvFileUpload} style={{ fontSize: '0.78rem' }} />
              </div>
            </div>

            {csvError && (
              <div style={{ background: '#fee2e2', color: '#b91c1c', padding: '0.75rem', borderRadius: '6px', fontSize: '0.8rem', marginBottom: '1rem', fontWeight: 600 }}>
                ⚠ {csvError}
              </div>
            )}

            {csvPreviewRows.length > 0 && (
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                  <span style={{ fontSize: '0.82rem', fontWeight: 700 }}>Preview: {csvPreviewRows.length} Rows Detected</span>
                  <span style={{ fontSize: '0.75rem', color: '#16a34a', fontWeight: 600 }}>
                    ✓ {csvPreviewRows.filter(r => !r.isDuplicate).length} Valid &nbsp;|&nbsp; 
                    <span style={{ color: '#dc2626' }}> ✗ {csvPreviewRows.filter(r => r.isDuplicate).length} Duplicates (will be skipped)</span>
                  </span>
                </div>
                <div style={{ maxHeight: '250px', overflowY: 'auto', border: '1px solid #cbd5e1', borderRadius: '6px', marginBottom: '1.25rem' }}>
                  <table className="lmis-table" style={{ fontSize: '0.75rem' }}>
                    <thead>
                      <tr>
                        <th>Status</th>
                        <th>Full Name</th>
                        <th>Email</th>
                        <th>ID / Passport</th>
                        <th>Phone</th>
                        <th>Province</th>
                      </tr>
                    </thead>
                    <tbody>
                      {csvPreviewRows.map((row, idx) => (
                        <tr key={idx} style={{ background: row.isDuplicate ? '#fef2f2' : '#ffffff' }}>
                          <td>
                            {row.isDuplicate ? (
                              <span className="badge badge-red" style={{ fontSize: '0.65rem' }}>Duplicate ({row.dupReason})</span>
                            ) : (
                              <span className="badge badge-emerald" style={{ fontSize: '0.65rem' }}>Valid</span>
                            )}
                          </td>
                          <td style={{ fontWeight: 600 }}>{row.learner_name}</td>
                          <td>{row.learner_email}</td>
                          <td>{row.id_passport}</td>
                          <td>{row.phone}</td>
                          <td>{row.province}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem', borderTop: '1px solid #e2e8f0', paddingTop: '1rem' }}>
              <button type="button" className="btn btn-sm btn-ghost" onClick={() => { setShowBulkCsvModal(false); setCsvPreviewRows([]); }}>Cancel</button>
              <button 
                type="button" 
                className="btn btn-sm btn-gold" 
                disabled={csvPreviewRows.filter(r => !r.isDuplicate).length === 0}
                onClick={handleExecuteBulkImport}
              >
                ✓ Complete Import of {csvPreviewRows.filter(r => !r.isDuplicate).length} Learners
              </button>
            </div>
          </div>
        </div>
      )}

      {/* CORPORATE WHITE-LABELING & BRANDING TAB (Super Admin Only) */}
      {activeTab === 'branding' && (
        <div className="branding-tab-container">
          <div className="lmis-page-header flex-between" style={{ flexWrap: 'wrap', gap: '1rem' }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
                <span className="badge badge-teal" style={{ textTransform: 'uppercase', letterSpacing: '0.08em', fontSize: '0.65rem' }}>White-Labeling Engine</span>
                <span className="badge badge-gold" style={{ fontSize: '0.65rem' }}>Tier: {tenant?.plan_code?.toUpperCase() || 'PRO PLUS'}</span>
              </div>
              <h1 className="lmis-page-title">Corporate White-Labeling &amp; Brand Identity</h1>
              <p className="lmis-page-sub">Customize institutional logos, corporate color tokens, and custom domains applied dynamically across all student and staff portals.</p>
            </div>
            <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
              <a
                href={`/lmis/learner?tenant=${tenant?.slug || 'nexa'}`}
                target="_blank"
                rel="noreferrer"
                className="btn btn-sm btn-outline"
                style={{ fontSize: '0.78rem' }}
              >
                👁️ Preview Learner Portal ↗
              </a>
              <button
                type="button"
                className="btn btn-sm btn-ghost"
                onClick={handleResetBranding}
                disabled={brandingSaving}
                style={{ fontSize: '0.78rem' }}
              >
                ↺ Reset to Defaults
              </button>
            </div>
          </div>

          {/* PRESET PALETTES */}
          <div className="lmis-card mb-4" style={{ padding: '1.25rem', border: '1px solid var(--border-color)', borderRadius: '12px' }}>
            <div style={{ marginBottom: '0.75rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div>
                <strong style={{ fontSize: '0.9rem', color: 'var(--text-main)', display: 'block' }}>Corporate Palette Presets</strong>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-sub)' }}>Click any preset to instantly apply curated WCAG-compliant enterprise color themes.</span>
              </div>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(190px, 1fr))', gap: '0.75rem' }}>
              {BRANDING_PRESETS.map(preset => {
                const isSelected = brandingForm.primary_color === preset.primary_color && brandingForm.accent_color === preset.accent_color;
                return (
                  <button
                    key={preset.name}
                    type="button"
                    onClick={() => handleApplyPresetTheme(preset)}
                    style={{
                      background: isSelected ? 'var(--bg-card-hover)' : 'var(--bg-card)',
                      border: isSelected ? '2px solid var(--gold)' : '1px solid var(--border-color)',
                      borderRadius: '10px',
                      padding: '0.75rem',
                      textAlign: 'left',
                      cursor: 'pointer',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '0.5rem',
                      transition: 'all 0.15s ease'
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                      <div style={{ width: '18px', height: '18px', borderRadius: '50%', background: preset.primary_color, border: '1px solid rgba(0,0,0,0.1)' }} title="Primary Color" />
                      <div style={{ width: '18px', height: '18px', borderRadius: '50%', background: preset.secondary_color, border: '1px solid rgba(0,0,0,0.1)' }} title="Secondary Color" />
                      <div style={{ width: '18px', height: '18px', borderRadius: '50%', background: preset.accent_color, border: '1px solid rgba(0,0,0,0.1)' }} title="Accent Color" />
                      {isSelected && <span style={{ marginLeft: 'auto', fontSize: '0.7rem', color: 'var(--gold)', fontWeight: 800 }}>✓ Active</span>}
                    </div>
                    <span style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--text-main)' }}>{preset.name}</span>
                  </button>
                );
              })}
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: '1.5rem', alignItems: 'start' }}>
            {/* BRANDING FORM */}
            <form onSubmit={handleSaveBranding} className="lmis-card" style={{ padding: '1.5rem', borderRadius: '12px', border: '1px solid var(--border-color)' }}>
              <h2 style={{ fontSize: '1rem', fontWeight: 800, color: 'var(--text-main)', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <IcoEdit size={16} /> Institutional Brand Settings
              </h2>

              <div className="lmis-form-group" style={{ marginBottom: '1rem' }}>
                <label className="lmis-form-label" style={{ fontWeight: 700, fontSize: '0.8rem', marginBottom: '0.35rem', display: 'block' }}>
                  Institution / Organization Name
                </label>
                <input
                  type="text"
                  className="lmis-form-input"
                  value={brandingForm.name}
                  onChange={e => setBrandingForm({ ...brandingForm, name: e.target.value })}
                  placeholder="e.g. Apex Technical Academy"
                  required
                />
                <span style={{ fontSize: '0.7rem', color: 'var(--text-sub)', marginTop: '0.2rem', display: 'block' }}>
                  Replaces "Nexa Transform Academy" across all navigation bars, certificates, and student portals.
                </span>
              </div>

              <div className="lmis-form-group" style={{ marginBottom: '1rem' }}>
                <label className="lmis-form-label" style={{ fontWeight: 700, fontSize: '0.8rem', marginBottom: '0.35rem', display: 'block' }}>
                  Institutional Tagline / Motto
                </label>
                <input
                  type="text"
                  className="lmis-form-input"
                  value={brandingForm.institution_tagline}
                  onChange={e => setBrandingForm({ ...brandingForm, institution_tagline: e.target.value })}
                  placeholder="e.g. Empowering Next-Generation Professionals"
                />
              </div>

              <div className="lmis-form-group" style={{ marginBottom: '1.25rem' }}>
                <label className="lmis-form-label" style={{ fontWeight: 700, fontSize: '0.8rem', marginBottom: '0.35rem', display: 'block' }}>
                  Institutional Logo URL
                </label>
                <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                  <input
                    type="text"
                    className="lmis-form-input"
                    value={brandingForm.logo_url}
                    onChange={e => setBrandingForm({ ...brandingForm, logo_url: e.target.value })}
                    placeholder="/images/logo.png or https://..."
                    required
                  />
                  {brandingForm.logo_url && (
                    <div style={{ width: '42px', height: '42px', flexShrink: 0, background: '#0F172A', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '4px', border: '1px solid var(--border-color)' }}>
                      <img src={brandingForm.logo_url} alt="Logo Preview" style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain' }} onError={e => { e.currentTarget.src = '/logo.svg'; }} />
                    </div>
                  )}
                </div>
                <span style={{ fontSize: '0.7rem', color: 'var(--text-sub)', marginTop: '0.2rem', display: 'block' }}>
                  SVG or high-res transparent PNG recommended.
                </span>
              </div>

              {/* COLOR TOKENS */}
              <div style={{ background: 'var(--bg-card-secondary)', padding: '1rem', borderRadius: '8px', border: '1px solid var(--border-color)', marginBottom: '1.25rem' }}>
                <strong style={{ fontSize: '0.82rem', color: 'var(--text-main)', display: 'block', marginBottom: '0.75rem' }}>
                  🎨 Dynamic Portal Theme Tokens
                </strong>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.75rem' }}>
                  <div>
                    <label style={{ fontSize: '0.72rem', fontWeight: 700, display: 'block', marginBottom: '0.25rem' }}>Primary</label>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                      <input
                        type="color"
                        value={brandingForm.primary_color}
                        onChange={e => setBrandingForm({ ...brandingForm, primary_color: e.target.value })}
                        style={{ width: '32px', height: '32px', padding: 0, border: 'none', borderRadius: '6px', cursor: 'pointer', background: 'none' }}
                      />
                      <input
                        type="text"
                        className="lmis-form-input"
                        value={brandingForm.primary_color}
                        onChange={e => setBrandingForm({ ...brandingForm, primary_color: e.target.value })}
                        style={{ fontSize: '0.72rem', padding: '0.3rem', height: '32px', fontFamily: 'monospace' }}
                      />
                    </div>
                  </div>

                  <div>
                    <label style={{ fontSize: '0.72rem', fontWeight: 700, display: 'block', marginBottom: '0.25rem' }}>Secondary</label>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                      <input
                        type="color"
                        value={brandingForm.secondary_color}
                        onChange={e => setBrandingForm({ ...brandingForm, secondary_color: e.target.value })}
                        style={{ width: '32px', height: '32px', padding: 0, border: 'none', borderRadius: '6px', cursor: 'pointer', background: 'none' }}
                      />
                      <input
                        type="text"
                        className="lmis-form-input"
                        value={brandingForm.secondary_color}
                        onChange={e => setBrandingForm({ ...brandingForm, secondary_color: e.target.value })}
                        style={{ fontSize: '0.72rem', padding: '0.3rem', height: '32px', fontFamily: 'monospace' }}
                      />
                    </div>
                  </div>

                  <div>
                    <label style={{ fontSize: '0.72rem', fontWeight: 700, display: 'block', marginBottom: '0.25rem' }}>Accent</label>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                      <input
                        type="color"
                        value={brandingForm.accent_color}
                        onChange={e => setBrandingForm({ ...brandingForm, accent_color: e.target.value })}
                        style={{ width: '32px', height: '32px', padding: 0, border: 'none', borderRadius: '6px', cursor: 'pointer', background: 'none' }}
                      />
                      <input
                        type="text"
                        className="lmis-form-input"
                        value={brandingForm.accent_color}
                        onChange={e => setBrandingForm({ ...brandingForm, accent_color: e.target.value })}
                        style={{ fontSize: '0.72rem', padding: '0.3rem', height: '32px', fontFamily: 'monospace' }}
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* CUSTOM DOMAIN */}
              <div className="lmis-form-group" style={{ marginBottom: '1.5rem' }}>
                <label className="lmis-form-label" style={{ fontWeight: 700, fontSize: '0.8rem', marginBottom: '0.35rem', display: 'block' }}>
                  Custom Vanity Domain / CNAME
                </label>
                <input
                  type="text"
                  className="lmis-form-input"
                  value={brandingForm.custom_domain}
                  onChange={e => setBrandingForm({ ...brandingForm, custom_domain: e.target.value })}
                  placeholder="e.g. lmis.apexacademy.co.za"
                />
                <div style={{ marginTop: '0.4rem', fontSize: '0.72rem', color: 'var(--text-sub)', background: 'rgba(56, 189, 248, 0.08)', padding: '0.5rem 0.75rem', borderRadius: '6px', border: '1px solid rgba(56, 189, 248, 0.2)' }}>
                  🌐 <strong>DNS Instruction:</strong> Point a CNAME record from your DNS registrar to <code>cname.nexa-transform.com</code>. Once propagated, learners access your white-labeled portal under your own web domain.
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem' }}>
                <button
                  type="submit"
                  className="btn btn-sm btn-gold"
                  disabled={brandingSaving}
                  style={{ fontWeight: 800, padding: '0.6rem 1.75rem', display: 'inline-flex', alignItems: 'center', gap: '0.4rem' }}
                >
                  {brandingSaving ? 'Applying Changes...' : '✓ Save & Apply Brand Live'}
                </button>
              </div>
            </form>

            {/* LIVE PREVIEW CANVAS */}
            <div className="lmis-card" style={{ padding: '1.5rem', borderRadius: '12px', border: '1px solid var(--border-color)', position: 'sticky', top: '80px' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
                <strong style={{ fontSize: '0.9rem', color: 'var(--text-main)', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                  <IcoEye size={16} /> Live Portal Theme Preview
                </strong>
                <span className="badge badge-teal" style={{ fontSize: '0.65rem' }}>Real-Time Render</span>
              </div>
              <p style={{ fontSize: '0.75rem', color: 'var(--text-sub)', marginBottom: '1rem' }}>
                Here is how your custom colors and institutional identity render across navigation bars and portal controls:
              </p>

              {/* MOCK PORTAL HEADER */}
              <div style={{
                background: brandingForm.primary_color,
                borderRadius: '8px',
                padding: '0.75rem 1rem',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                borderBottom: `2px solid ${brandingForm.accent_color}`,
                boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
                marginBottom: '1rem'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                  <img
                    src={brandingForm.logo_url || '/logo.svg'}
                    alt="Logo"
                    style={{ width: '24px', height: '24px', objectFit: 'contain' }}
                    onError={e => { e.currentTarget.src = '/logo.svg'; }}
                  />
                  <span style={{
                    color: brandingForm.accent_color,
                    fontWeight: 800,
                    fontSize: '0.78rem',
                    letterSpacing: '0.08em',
                    textTransform: 'uppercase',
                    fontFamily: 'monospace'
                  }}>
                    {brandingForm.name || 'Your Academy'}
                  </span>
                </div>
                <div style={{
                  background: brandingForm.secondary_color,
                  color: '#FFFFFF',
                  padding: '0.2rem 0.6rem',
                  borderRadius: '999px',
                  fontSize: '0.65rem',
                  fontWeight: 700,
                  textTransform: 'uppercase'
                }}>
                  Learner Portal
                </div>
              </div>

              {/* MOCK SIDEBAR ITEM & BUTTONS */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', background: 'var(--bg-card-secondary)', padding: '1rem', borderRadius: '8px', border: '1px solid var(--border-color)' }}>
                <div style={{
                  background: 'rgba(255,255,255,0.08)',
                  color: brandingForm.accent_color,
                  borderLeft: `3px solid ${brandingForm.accent_color}`,
                  padding: '0.5rem 0.75rem',
                  borderRadius: '6px',
                  fontWeight: 700,
                  fontSize: '0.78rem',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem'
                }}>
                  <span>📚 Active Academic Modules</span>
                  <span style={{ marginLeft: 'auto', background: brandingForm.accent_color, color: '#000', borderRadius: '999px', padding: '0.1rem 0.4rem', fontSize: '0.65rem', fontWeight: 800 }}>8</span>
                </div>

                <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', marginTop: '0.5rem' }}>
                  <button
                    type="button"
                    style={{
                      background: brandingForm.accent_color,
                      color: '#FFFFFF',
                      border: 'none',
                      borderRadius: '6px',
                      padding: '0.4rem 0.9rem',
                      fontSize: '0.75rem',
                      fontWeight: 700,
                      cursor: 'pointer'
                    }}
                  >
                    Enroll Now
                  </button>
                  <button
                    type="button"
                    style={{
                      background: 'none',
                      border: `1px solid ${brandingForm.secondary_color}`,
                      color: brandingForm.secondary_color,
                      borderRadius: '6px',
                      padding: '0.4rem 0.9rem',
                      fontSize: '0.75rem',
                      fontWeight: 700,
                      cursor: 'pointer'
                    }}
                  >
                    View Timetable
                  </button>
                </div>

                <div style={{ marginTop: '0.5rem', borderTop: '1px solid var(--border-color)', paddingTop: '0.5rem', fontSize: '0.72rem', color: 'var(--text-sub)' }}>
                  <strong>Motto:</strong> <em>"{brandingForm.institution_tagline || 'Excellence in Education'}"</em>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ADMIN STAFF MANAGEMENT TAB (Super Admin Only) */}
      {activeTab === 'staff' && (
        <div>
          <div className="lmis-page-header flex-between">
            <div>
              <h1 className="lmis-page-title">Admin Staff &amp; Granular Roles</h1>
              <p className="lmis-page-sub">Configure role-based access control (RBAC) and manage staff privileges.</p>
            </div>
            <button className="btn btn-sm btn-gold" onClick={() => setShowAdminStaffForm(!showAdminStaffForm)}>
              <IcoPlus size={14} /> Add Admin Staff Member
            </button>
          </div>

          {showAdminStaffForm && (
            <div className="lmis-card mb-4">
              <div className="lmis-card-header flex-between">
                <span className="lmis-card-title">Add Administrator / Staff Member</span>
                <button className="btn btn-sm btn-ghost" onClick={() => setShowAdminStaffForm(false)}><IcoX size={14} /></button>
              </div>
              <div className="lmis-card-body">
                <form onSubmit={handleCreateAdminStaff}>
                  <div className="lmis-form-grid">
                    <div className="lmis-field">
                      <label className="lmis-label">Full Name</label>
                      <input className="lmis-input" value={adminStaffForm.name} onChange={e => setAdminStaffForm({ ...adminStaffForm, name: e.target.value })} required placeholder="e.g. Naledi Khumalo" />
                    </div>
                    <div className="lmis-field">
                      <label className="lmis-label">Institutional Email</label>
                      <input type="email" className="lmis-input" value={adminStaffForm.email} onChange={e => setAdminStaffForm({ ...adminStaffForm, email: e.target.value })} required placeholder="staff@nexa-transform.com" />
                    </div>
                    <div className="lmis-field">
                      <label className="lmis-label">Contact Phone</label>
                      <input className="lmis-input" value={adminStaffForm.phone} onChange={e => setAdminStaffForm({ ...adminStaffForm, phone: e.target.value })} placeholder="+27 82 000 0000" />
                    </div>
                    <div className="lmis-field">
                      <label className="lmis-label">Assigned Administrative Role</label>
                      <select className="lmis-select" value={adminStaffForm.role} onChange={e => setAdminStaffForm({ ...adminStaffForm, role: e.target.value })}>
                        <option>Super Admin</option>
                        <option>Academic Registrar</option>
                        <option>Finance Officer</option>
                        <option>Quality Assurance Officer</option>
                      </select>
                    </div>
                    <div className="lmis-field" style={{ gridColumn: '1/-1' }}>
                      <label className="lmis-label">Assigned Login Password</label>
                      <input className="lmis-input" value={adminStaffForm.password} onChange={e => setAdminStaffForm({ ...adminStaffForm, password: e.target.value })} required placeholder="Enter secure password" />
                    </div>
                  </div>
                  <div className="lmis-form-actions">
                    <button type="button" className="btn btn-sm btn-ghost" onClick={() => setShowAdminStaffForm(false)}>Cancel</button>
                    <button type="submit" className="btn btn-sm btn-gold"><IcoPlus size={14} /> Create Staff Account</button>
                  </div>
                </form>
              </div>
            </div>
          )}

          <div className="lmis-card">
            <div className="lmis-card-header flex-between">
              <span className="lmis-card-title">Staff Access Directory &amp; Role Permissions</span>
              <span className="badge badge-emerald">RBAC Active</span>
            </div>
            <div className="lmis-table-wrap">
              <table className="lmis-table">
                <thead>
                  <tr>
                    <th>Staff Name</th>
                    <th>Email</th>
                    <th>Assigned Role</th>
                    <th>Permitted Access Scope</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {(system_admins || []).length === 0 ? (
                    <tr>
                      <td colSpan={5} style={{ textAlign: 'center', padding: '2.5rem 1rem', color: 'var(--text-sub)' }}>
                        <p style={{ fontWeight: 700, margin: '0 0 0.5rem 0' }}>No registered admin staff members found.</p>
                        <p style={{ fontSize: '0.82rem', margin: 0 }}>Click "+ Register Admin Staff" above to onboard system administrators.</p>
                      </td>
                    </tr>
                  ) : (
                    (system_admins || []).map((staff, idx) => {
                      const getScope = (r) => {
                        switch (r) {
                          case 'Super Admin': return 'Full Platform & System Control';
                          case 'Academic Registrar': return 'Learners, Enrolments, Courses, Certificates';
                          case 'Finance Officer': return 'Fee Accounts, Invoicing, Billing Reports';
                          case 'Quality Assurance Officer': return 'PoE Audits, Compliance Records, Audit Trail';
                          default: return 'Standard Admin';
                        }
                      };
                      const getRoleBadge = (r) => {
                        switch (r) {
                          case 'Super Admin': return 'badge-gold';
                          case 'Academic Registrar': return 'badge-teal';
                          case 'Finance Officer': return 'badge-emerald';
                          case 'Quality Assurance Officer': return 'badge-navy';
                          default: return 'badge-navy';
                        }
                      };
                      return (
                        <tr key={idx}>
                          <td style={{ fontWeight: 700 }}>{staff.name}</td>
                          <td style={{ color: 'var(--text-sub)' }}>{staff.email}</td>
                          <td><span className={`badge ${getRoleBadge(staff.role)}`}>{staff.role}</span></td>
                          <td style={{ fontSize: '0.78rem', color: 'var(--text-main)' }}>{getScope(staff.role)}</td>
                          <td><span className="badge badge-emerald">{staff.status || 'Active'}</span></td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* CERTIFICATES */}
      {activeTab === 'certificates' && (
        <div>
          <div className="lmis-page-header flex-between">
            <div>
              <h1 className="lmis-page-title">Certificates</h1>
              <p className="lmis-page-sub">Issue and manage official Certificates of Completion for self-paying candidates.</p>
            </div>
            <button className="btn btn-sm btn-gold" onClick={() => setShowCertForm(!showCertForm)}>
              <IcoPlus size={14} /> Issue Self-Paying Certificate
            </button>
          </div>
          {showCertForm && (
            <div className="lmis-card mb-4" style={{ border: '1px solid rgba(217, 119, 6, 0.4)', background: 'rgba(217, 119, 6, 0.03)' }}>
              <div className="lmis-card-header">
                <span className="lmis-card-title">Issue Official Certificate of Completion (Self-Paying)</span>
                <button className="btn btn-sm btn-ghost" onClick={() => setShowCertForm(false)}><IcoX size={14} /></button>
              </div>
              <div className="lmis-card-body">
                <form onSubmit={handleIssueCert}>
                  <div className="lmis-form-grid">
                    <div className="lmis-field">
                      <label className="lmis-label">Candidate (Learner)</label>
                      <select className="lmis-select" value={certForm.learner_email} onChange={e => {
                        const selP = student_profiles.find(p => p.learner_email === e.target.value);
                        setCertForm({
                          ...certForm,
                          learner_email: e.target.value,
                          programme_title: selP?.programme_enrolled || certForm.programme_title,
                          is_self_paying: selP?.funding_type === 'self_paying' || true
                        });
                      }} required>
                        <option value="">-- Select Candidate --</option>
                        {student_profiles.map(p => (
                          <option key={p.id} value={p.learner_email}>
                            {p.learner_name} ({p.funding_type === 'self_paying' ? 'Self-Paying' : 'Funded'} - {p.student_number || 'No ID'})
                          </option>
                        ))}
                      </select>
                    </div>
                    <div className="lmis-field">
                      <label className="lmis-label">Candidate Track</label>
                      <select className="lmis-select" value={certForm.is_self_paying !== false ? 'self_paying' : 'sponsored'} onChange={e => setCertForm({ ...certForm, is_self_paying: e.target.value === 'self_paying' })}>
                        <option value="self_paying">Strictly Self-Paying (Direct Enrolment)</option>
                        <option value="sponsored">Corporate Sponsored / Funded</option>
                      </select>
                    </div>
                    <div className="lmis-field">
                      <label className="lmis-label">Course / Track Code</label>
                      <select className="lmis-select" value={certForm.course_code} onChange={e => {
                        const c = courses.find(item => item.code === e.target.value);
                        setCertForm({ ...certForm, course_code: e.target.value, programme_title: c?.title || certForm.programme_title });
                      }} required>
                        <option value="">-- Select Module --</option>
                        {courses.map(c => <option key={c.id} value={c.code}>{c.title}</option>)}
                      </select>
                    </div>
                    <div className="lmis-field">
                      <label className="lmis-label">Official Programme Title on Certificate</label>
                      <input className="lmis-input" value={certForm.programme_title} onChange={e => setCertForm({ ...certForm, programme_title: e.target.value })} placeholder="e.g. Applied Enterprise Process Automation & BPMN 2.0" required />
                    </div>
                    <div className="lmis-field">
                      <label className="lmis-label">Evaluation Standing / Grade</label>
                      <input className="lmis-input" value={certForm.grade || '88% (Practical Distinction)'} onChange={e => setCertForm({ ...certForm, grade: e.target.value })} placeholder="e.g. 88% (Practical Distinction)" />
                    </div>
                    <div className="lmis-field">
                      <label className="lmis-label">Issue Date</label>
                      <input type="date" className="lmis-input" value={certForm.issue_date} onChange={e => setCertForm({ ...certForm, issue_date: e.target.value })} required />
                    </div>
                  </div>
                  <div className="lmis-form-actions">
                    <button type="button" className="btn btn-sm btn-ghost" onClick={() => setShowCertForm(false)}>Cancel</button>
                    <button type="submit" className="btn btn-sm btn-gold"><IcoAward size={14} /> Issue &amp; Download PDF</button>
                  </div>
                </form>
              </div>
            </div>
          )}
          {certificates.length === 0
            ? <div className="lmis-card"><div className="lmis-empty"><IcoAward size={40} style={{ color: '#CBD5E1' }} /><p className="lmis-empty-title">No certificates issued</p><p className="lmis-empty-sub">Issue certificates to self-paying learners who have completed their programmes.</p></div></div>
            : <div className="lmis-card"><div className="lmis-table-wrap">
              <table className="lmis-table">
                <thead><tr><th>Learner</th><th>Programme</th><th>Certificate No.</th><th>Track</th><th>Issued</th><th>Status</th><th>Action</th></tr></thead>
                <tbody>
                  {certificates.map(c => (
                    <tr key={c.id}>
                      <td style={{ fontWeight: 600 }}>{c.learner_name}</td>
                      <td>{c.programme_title || c.course_code}</td>
                      <td><span style={{ fontFamily: 'monospace', fontSize: '0.75rem', color: 'var(--gold)' }}>{c.certificate_number}</span></td>
                      <td>
                        <span className="badge badge-gold" style={{ fontSize: '0.68rem' }}>
                          {c.funding_type || 'Self-Paying'}
                        </span>
                      </td>
                      <td style={{ color: 'var(--text-sub)' }}>{c.issue_date}</td>
                      <td><span className="badge badge-emerald">{c.status}</span></td>
                      <td>
                        <button
                          className="btn btn-sm btn-ghost"
                          style={{ fontSize: '0.7rem', padding: '0.2rem 0.5rem', display: 'inline-flex', alignItems: 'center', gap: '0.3rem' }}
                          title="Download official Certificate PDF"
                          onClick={() => {
                            generateCompletionCertificatePDF({
                              learnerName: c.learner_name,
                              studentNumber: c.student_number || 'NX-2026-SP',
                              idPassport: c.id_passport,
                              programmeTitle: c.programme_title || c.course_code,
                              certificateNumber: c.certificate_number,
                              issueDate: c.issue_date,
                              grade: c.grade || '88% (Practical Distinction)',
                              isSelfPaying: true
                            });
                            showToast(`Certificate ${c.certificate_number} downloaded!`);
                          }}
                        >
                          📄 Download PDF
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div></div>
          }
        </div>
      )}

      {/* DEMOGRAPHICS & COMPLIANCE STATS */}
      {activeTab === 'demographics' && (() => {
        // Compute stats
        const total = student_profiles.length;

        const provinceBreakdown = student_profiles.reduce((acc, p) => {
          const prov = p.province || 'Gauteng';
          acc[prov] = (acc[prov] || 0) + 1;
          return acc;
        }, {});

        const qualBreakdown = student_profiles.reduce((acc, p) => {
          const qual = p.highest_qualification || 'Matric / Grade 12';
          acc[qual] = (acc[qual] || 0) + 1;
          return acc;
        }, {});

        const ageBreakdown = student_profiles.reduce((acc, p) => {
          const age = Number(p.age || 22);
          if (age < 20) acc['Under 20']++;
          else if (age >= 20 && age <= 24) acc['20 - 24']++;
          else if (age >= 25 && age <= 29) acc['25 - 29']++;
          else if (age >= 30 && age <= 35) acc['30 - 35']++;
          else acc['Over 35']++;
          return acc;
        }, { 'Under 20': 0, '20 - 24': 0, '25 - 29': 0, '30 - 35': 0, 'Over 35': 0 });

        const countDoc = (key) => student_profiles.filter(p => p[key]?.length > 0).length;
        const idCount = countDoc('id_copy_attachments');
        const bankCount = countDoc('bank_proof_attachments');
        const matricCount = countDoc('qualification_proof_attachments');
        const compliantCount = student_profiles.filter(p => p.id_copy_attachments?.length > 0 && p.bank_proof_attachments?.length > 0 && p.qualification_proof_attachments?.length > 0).length;

        return (
          <div>
            <div className="lmis-page-header"><h1 className="lmis-page-title">Demographics & Stipend Auditing</h1><p className="lmis-page-sub">Analyze learner backgrounds and verify required compliance documents.</p></div>

            {total === 0 ? (
              <div className="lmis-card"><div className="lmis-empty"><IcoUser size={40} style={{ color: '#CBD5E1' }} /><p className="lmis-empty-title">No learner data available</p><p className="lmis-empty-sub">Register learners to populate demographics dashboards.</p></div></div>
            ) : (
              <>
                {/* Stipend Compliance Row */}
                <div className="lmis-stats-grid mb-4">
                  <div className="lmis-stat"><div className="lmis-stat-icon teal"><IcoUser size={20} /></div><div><div className="lmis-stat-val">{total}</div><div className="lmis-stat-label">Total Registered</div></div></div>
                  <div className="lmis-stat"><div className="lmis-stat-icon emerald"><IcoCheck size={20} /></div><div><div className="lmis-stat-val">{compliantCount}</div><div className="lmis-stat-label">Fully Compliant</div></div></div>
                  <div className="lmis-stat"><div className="lmis-stat-icon navy"><IcoFile size={20} /></div><div><div className="lmis-stat-val">{idCount}</div><div className="lmis-stat-label">ID Verification Copies</div></div></div>
                  <div className="lmis-stat"><div className="lmis-stat-icon gold"><IcoWallet size={20} /></div><div><div className="lmis-stat-val">{bankCount}</div><div className="lmis-stat-label">Bank Account Proofs</div></div></div>
                </div>

                <div className="lmis-3col mb-4">
                  {/* Province Card */}
                  <div className="lmis-card">
                    <div className="lmis-card-header"><span className="lmis-card-title">Learners by Province</span></div>
                    <div className="lmis-card-body">
                      {Object.entries(provinceBreakdown).map(([prov, count]) => {
                        const pct = Math.round((count / total) * 100);
                        return (
                          <div key={prov} style={{ marginBottom: '0.8rem' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.78rem', marginBottom: '0.25rem' }}>
                              <span style={{ fontWeight: 600 }}>{prov}</span>
                              <span style={{ color: 'var(--muted)' }}>{count} ({pct}%)</span>
                            </div>
                            <div className="lmis-progress-wrap"><div className="lmis-progress-bar navy" style={{ width: `${pct}%` }} /></div>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Qualification Card */}
                  <div className="lmis-card">
                    <div className="lmis-card-header"><span className="lmis-card-title">Highest Qualification</span></div>
                    <div className="lmis-card-body">
                      {Object.entries(qualBreakdown).map(([qual, count]) => {
                        const pct = Math.round((count / total) * 100);
                        return (
                          <div key={qual} style={{ marginBottom: '0.8rem' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.78rem', marginBottom: '0.25rem' }}>
                              <span style={{ fontWeight: 600 }}>{qual}</span>
                              <span style={{ color: 'var(--muted)' }}>{count} ({pct}%)</span>
                            </div>
                            <div className="lmis-progress-wrap"><div className="lmis-progress-bar gold" style={{ width: `${pct}%` }} /></div>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Age breakdown card */}
                  <div className="lmis-card">
                    <div className="lmis-card-header"><span className="lmis-card-title">Age Brackets</span></div>
                    <div className="lmis-card-body">
                      {Object.entries(ageBreakdown).map(([range, count]) => {
                        const pct = Math.round((count / total) * 100);
                        return (
                          <div key={range} style={{ marginBottom: '0.8rem' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.78rem', marginBottom: '0.25rem' }}>
                              <span style={{ fontWeight: 600 }}>{range} years</span>
                              <span style={{ color: 'var(--muted)' }}>{count} ({pct}%)</span>
                            </div>
                            <div className="lmis-progress-wrap"><div className="lmis-progress-bar teal" style={{ width: `${pct}%` }} /></div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>

                {/* Audit table of learner documents */}
                <div className="lmis-card">
                  <div className="lmis-card-header"><span className="lmis-card-title">Compliance &amp; Stipend Documents Auditing Log</span></div>
                  <div className="lmis-table-wrap">
                    <table className="lmis-table">
                      <thead>
                        <tr>
                          <th>Learner</th>
                          <th>ID Copy</th>
                          <th>Bank Proof</th>
                          <th>Matric Certificate</th>
                          <th>Compliance Status</th>
                          <th>Quality Audit</th>
                        </tr>
                      </thead>
                      <tbody>
                        {student_profiles.map(p => {
                          const hasId = p.id_copy_attachments?.length > 0;
                          const hasBank = p.bank_proof_attachments?.length > 0;
                          const hasMatric = p.qualification_proof_attachments?.length > 0;
                          const allDocs = hasId && hasBank && hasMatric;
                          return (
                            <tr key={p.id}>
                              <td style={{ fontWeight: 600 }}>{p.learner_name}<div style={{ fontSize: '0.7rem', color: 'var(--muted)', fontWeight: 400 }}>{p.student_number} · {p.learner_email}</div></td>
                              <td>
                                {hasId ? (
                                  <div style={{ minWidth: '150px' }}><AttachmentList attachments={p.id_copy_attachments} /></div>
                                ) : <span style={{ color: 'var(--red)', fontSize: '0.75rem', fontWeight: 600 }}>⚠ Missing</span>}
                              </td>
                              <td>
                                {hasBank ? (
                                  <div style={{ minWidth: '150px' }}><AttachmentList attachments={p.bank_proof_attachments} /></div>
                                ) : <span style={{ color: 'var(--red)', fontSize: '0.75rem', fontWeight: 600 }}>⚠ Missing</span>}
                              </td>
                              <td>
                                {hasMatric ? (
                                  <div style={{ minWidth: '150px' }}><AttachmentList attachments={p.qualification_proof_attachments} /></div>
                                ) : <span style={{ color: 'var(--red)', fontSize: '0.75rem', fontWeight: 600 }}>⚠ Missing</span>}
                              </td>
                              <td>
                                <span className={`badge ${allDocs ? 'badge-emerald' : 'badge-red'}`}>{allDocs ? 'Approved (Stipend Ready)' : 'Pending Docs'}</span>
                              </td>
                              <td>
                                <button className="btn btn-sm btn-gold" onClick={() => setPoeStudent(p)}>Generate PoE</button>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>
              </>
            )}
          </div>
        );
      })()}

      {/* Portfolio of Evidence Printable Modal */}
      {poeStudent && (
        <div className="lmis-login-overlay" style={{ zIndex: 1000 }}>
          <style>{`
            @media print {
              body * { visibility: hidden; }
              .lmis-poe-print-content, .lmis-poe-print-content * { visibility: visible; }
              .lmis-poe-print-content { position: absolute; left: 0; top: 0; width: 100%; }
            }
          `}</style>
          <div className="lmis-card" style={{ maxWidth: '850px', width: '90%', maxHeight: '90vh', overflowY: 'auto', background: 'var(--navy-dark)', border: '1px solid var(--gold)', padding: '2rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--ice2)', paddingBottom: '0.875rem', marginBottom: '1.25rem' }}>
              <span className="lmis-card-title" style={{ fontSize: '1.1rem', color: '#fff' }}>📁 14-Point Standardized Portfolio of Evidence (PoE) Audit Sheet</span>
              <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                <button className="btn btn-sm btn-primary" onClick={() => {
                  try {
                    generatePoePDF({
                      learner: poeStudent,
                      courses,
                      submissions,
                      quizAttempts,
                      overallScore: 88
                    });
                    showToast(`Standardized POE PDF generated & downloaded for ${poeStudent.learner_name}!`);
                  } catch (err) {
                    console.error('PoE PDF Generation Error:', err);
                    showToast('Failed to generate PDF. Check console.');
                  }
                }}>📥 Download Standardized POE (PDF)</button>
                <button className="btn btn-sm btn-gold" onClick={() => window.print()}>🖨 Print View</button>
                <button className="btn btn-sm btn-ghost" onClick={() => setPoeStudent(null)}>Close</button>
              </div>
            </div>

            <div className="lmis-poe-print-content" style={{ padding: '1rem', background: '#fff', color: '#0f172a', borderRadius: '8px' }}>
              {/* Header Letterhead */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '2px solid #0f172a', paddingBottom: '1rem', marginBottom: '1.5rem' }}>
                <div>
                  <h2 style={{ fontSize: '1.3rem', fontWeight: 800, color: '#0f172a', textTransform: 'uppercase', letterSpacing: '0.05em', margin: 0 }}>NexaTransform Group</h2>
                  <p style={{ fontSize: '0.75rem', color: '#475569', margin: '0.2rem 0 0 0' }}>Professional Skills Development & Training Provider · Quality Assurance</p>
                </div>
                <img src="/logo.svg" alt="NexaTransform" style={{ height: '48px', width: '48px' }} />
              </div>

              <div style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
                <h3 style={{ fontSize: '1.1rem', fontWeight: 800, textTransform: 'uppercase', color: '#0f172a', margin: 0 }}>Learner Portfolio of Evidence Summary</h3>
                <p style={{ fontSize: '0.78rem', color: '#475569', margin: '0.2rem 0 0 0' }}>Generated on: {new Date().toLocaleDateString('en-ZA')}</p>
              </div>

              {/* 1. Learner details */}
              <h4 style={{ fontSize: '0.85rem', fontWeight: 700, borderBottom: '1px solid #0f172a', paddingBottom: '0.25rem', marginBottom: '0.75rem', textTransform: 'uppercase', color: '#0f172a' }}>1. Learner Information</h4>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', fontSize: '0.8rem', marginBottom: '1.5rem', border: '1px solid #e2e8f0', padding: '0.875rem', borderRadius: '6px' }}>
                <div><strong>Full Name:</strong> {poeStudent.learner_name}</div>
                <div><strong>Student Number:</strong> {poeStudent.student_number}</div>
                <div><strong>Identity / Passport No:</strong> {poeStudent.id_passport}</div>
                <div><strong>Email Address:</strong> {poeStudent.learner_email}</div>
                <div><strong>Phone Number:</strong> {poeStudent.phone || '—'}</div>
                <div><strong>Age:</strong> {poeStudent.age ? `${poeStudent.age} years` : '—'}</div>
                <div><strong>Province:</strong> {poeStudent.province || '—'}</div>
                <div><strong>Highest Qualification:</strong> {poeStudent.highest_qualification || 'Matric / Grade 12'}</div>
              </div>

              {/* 2. Enrollment Status */}
              <h4 style={{ fontSize: '0.85rem', fontWeight: 700, borderBottom: '1px solid #0f172a', paddingBottom: '0.25rem', marginBottom: '0.75rem', textTransform: 'uppercase', color: '#0f172a' }}>2. Academic Programme Enrolments</h4>
              <div style={{ fontSize: '0.8rem', marginBottom: '1.5rem' }}>
                {enrollments.filter(e => e.learner_email === poeStudent.learner_email).length === 0 ? (
                  <p style={{ color: '#dc2626', fontWeight: 600, margin: 0 }}>No active course enrollments recorded.</p>
                ) : (
                  <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.78rem' }}>
                    <thead>
                      <tr style={{ borderBottom: '1px solid #cbd5e1', textAlign: 'left', fontWeight: 700 }}>
                        <th style={{ padding: '0.45rem' }}>Course Code</th>
                        <th style={{ padding: '0.45rem' }}>Course Name</th>
                        <th style={{ padding: '0.45rem' }}>Enrollment Date</th>
                        <th style={{ padding: '0.45rem' }}>Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {enrollments.filter(e => e.learner_email === poeStudent.learner_email).map(e => {
                        const c = courses.find(cr => cr.code === e.course_code);
                        return (
                          <tr key={e.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                            <td style={{ padding: '0.45rem' }}>{e.course_code}</td>
                            <td style={{ padding: '0.45rem' }}>{c?.title || '—'}</td>
                            <td style={{ padding: '0.45rem' }}>{fmtDate(e.enrollment_date)}</td>
                            <td style={{ padding: '0.45rem' }}>{e.status}</td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                )}
              </div>

              {/* 3. Performance & Plagiarism Checklist */}
              <h4 style={{ fontSize: '0.85rem', fontWeight: 700, borderBottom: '1px solid #0f172a', paddingBottom: '0.25rem', marginBottom: '0.75rem', textTransform: 'uppercase', color: '#0f172a' }}>3. Formative Assessments & Plagiarism Audits</h4>
              <div style={{ fontSize: '0.8rem', marginBottom: '1.5rem' }}>
                {submissions.filter(s => s.learner_email === poeStudent.learner_email).length === 0 ? (
                  <p style={{ fontStyle: 'italic', color: '#64748b', margin: 0 }}>No assignment submissions logged.</p>
                ) : (
                  <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.78rem' }}>
                    <thead>
                      <tr style={{ borderBottom: '1px solid #cbd5e1', textAlign: 'left', fontWeight: 700 }}>
                        <th style={{ padding: '0.45rem' }}>Assignment Title</th>
                        <th style={{ padding: '0.45rem' }}>Date Submitted</th>
                        <th style={{ padding: '0.45rem' }}>Turnitin Score</th>
                        <th style={{ padding: '0.45rem' }}>Grade Score</th>
                        <th style={{ padding: '0.45rem' }}>Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {submissions.filter(s => s.learner_email === poeStudent.learner_email).map(s => (
                        <tr key={s.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                          <td style={{ padding: '0.45rem' }}>{s.assignment_title}</td>
                          <td style={{ padding: '0.45rem' }}>{fmtDate(s.submitted_date)}</td>
                          <td style={{ padding: '0.45rem' }}>{s.plagiarism_score !== null ? `${s.plagiarism_score}%` : 'Pending'}</td>
                          <td style={{ padding: '0.45rem' }}>{s.grade !== null ? `${s.grade}%` : '—'}</td>
                          <td style={{ padding: '0.45rem' }}>{s.status}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>

              {/* 4. Attendance log summary */}
              <h4 style={{ fontSize: '0.85rem', fontWeight: 700, borderBottom: '1px solid #0f172a', paddingBottom: '0.25rem', marginBottom: '0.75rem', textTransform: 'uppercase', color: '#0f172a' }}>4. Session Attendance Summary</h4>
              <div style={{ fontSize: '0.8rem', marginBottom: '1.5rem', border: '1px solid #e2e8f0', padding: '0.875rem', borderRadius: '6px' }}>
                {attendance.filter(a => a.learner_email === poeStudent.learner_email).length === 0 ? (
                  <p style={{ fontStyle: 'italic', color: '#64748b', margin: 0 }}>No session attendance logs found.</p>
                ) : (
                  <div style={{ display: 'flex', gap: '2rem', alignItems: 'center' }}>
                    <div>
                      <strong>Sessions Logged:</strong> {attendance.filter(a => a.learner_email === poeStudent.learner_email).length}
                    </div>
                    <div>
                      <strong>Present Rate:</strong> {Math.round((attendance.filter(a => a.learner_email === poeStudent.learner_email && a.status === 'Present').length / attendance.filter(a => a.learner_email === poeStudent.learner_email).length) * 100)}%
                    </div>
                  </div>
                )}
              </div>

              {/* 5. Audited Documents Checklist */}
              <h4 style={{ fontSize: '0.85rem', fontWeight: 700, borderBottom: '1px solid #0f172a', paddingBottom: '0.25rem', marginBottom: '0.75rem', textTransform: 'uppercase', color: '#0f172a' }}>5. Compliance Documents Checklist</h4>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1rem', fontSize: '0.78rem', marginBottom: '2.5rem' }}>
                <div><strong>ID Copy:</strong> {poeStudent.id_copy_attachments?.length > 0 ? '✓ Uploaded (Verified)' : '✗ Missing'}</div>
                <div><strong>Bank Proof:</strong> {poeStudent.bank_proof_attachments?.length > 0 ? '✓ Uploaded (Verified)' : '✗ Missing'}</div>
                <div><strong>Matric / Qualifications:</strong> {poeStudent.qualification_proof_attachments?.length > 0 ? '✓ Uploaded (Verified)' : '✗ Missing'}</div>
              </div>

              {/* Signatures */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '2rem', fontSize: '0.75rem', marginTop: '2rem', borderTop: '1px dashed #ccc', paddingTop: '1.5rem' }}>
                <div style={{ textAlign: 'center' }}>
                  <div style={{ borderBottom: '1px solid #333', height: '28px' }}></div>
                  <p style={{ marginTop: '0.35rem', fontWeight: 600 }}>Learner Signature</p>
                </div>
                <div style={{ textAlign: 'center' }}>
                  <div style={{ borderBottom: '1px solid #333', height: '28px' }}></div>
                  <p style={{ marginTop: '0.35rem', fontWeight: 600 }}>Assessor Signature</p>
                </div>
                <div style={{ textAlign: 'center' }}>
                  <div style={{ borderBottom: '1px solid #333', height: '28px' }}></div>
                  <p style={{ marginTop: '0.35rem', fontWeight: 600 }}>Internal Moderator</p>
                </div>
              </div>

            </div>
          </div>
        </div>
      )}

      {/* ── ADMIN MARK CAPTURE MODAL ── */}
      {showAdminMarkModal && (() => {
        const targetCourse = adminMarkCourse || (courses[0]?.code || '');
        const enrolledInCourse = enrollments.filter(e =>
          (e.course_code || '').toUpperCase().trim() === (targetCourse || '').toUpperCase().trim()
        );
        const courseAssigns = assignments.filter(a =>
          (a.course_code || '').toUpperCase().trim() === (targetCourse || '').toUpperCase().trim()
        );

        return (
          <div className="lmis-modal-overlay" style={{ zIndex: 1100, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem' }}>
            <div className="lmis-card" style={{
              width: '100%',
              maxWidth: '850px',
              maxHeight: '90vh',
              overflowY: 'auto',
              background: 'var(--bg-card)',
              border: '1px solid var(--border-color)',
              boxShadow: '0 20px 40px rgba(0,0,0,0.25)',
              borderRadius: '8px'
            }}>
              {/* Modal Header */}
              <div style={{
                padding: '1.1rem 1.4rem',
                borderBottom: '1px solid var(--border-color)',
                background: 'var(--bg-card-header, #0f172a)',
                color: 'var(--text-main, #fff)',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center'
              }}>
                <div>
                  <div style={{ fontWeight: 800, fontSize: '1.05rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <IcoAward size={20} style={{ color: 'var(--gold)' }} />
                    Academic Mark Capture &amp; Grading (Administration)
                  </div>
                  <div style={{ fontSize: '0.78rem', color: 'var(--text-sub)', marginTop: '0.15rem' }}>
                    Assist academic faculty by capturing, entering, or adjusting student marks.
                  </div>
                </div>
                <button
                  type="button"
                  className="btn btn-sm btn-ghost"
                  style={{ color: 'inherit' }}
                  onClick={() => setShowAdminMarkModal(false)}
                >
                  <IcoX size={18} />
                </button>
              </div>

              {/* Modal Body */}
              <div style={{ padding: '1.25rem 1.4rem' }}>
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
                  gap: '1rem',
                  padding: '1rem',
                  background: 'var(--bg-card-header, #f8fafc)',
                  border: '1px solid var(--border-color)',
                  borderRadius: '6px',
                  marginBottom: '1.25rem'
                }}>
                  {/* Course Selector */}
                  <div>
                    <label className="lmis-label" style={{ fontWeight: 700, marginBottom: '0.3rem' }}>Course / Module</label>
                    <select
                      className="lmis-select"
                      value={targetCourse}
                      onChange={e => handleAdminMarkCourseChange(e.target.value)}
                    >
                      {courses.map(c => (
                        <option key={c.id || c.code} value={c.code}>
                          {c.code} — {c.title}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Assessment Selector */}
                  <div>
                    <label className="lmis-label" style={{ fontWeight: 700, marginBottom: '0.3rem' }}>Assessment / Task</label>
                    <select
                      className="lmis-select"
                      value={adminMarkAssessmentMode === 'existing' ? adminMarkSelectedAssignId : '__new__'}
                      onChange={e => handleAdminMarkAssessmentChange(e.target.value)}
                    >
                      {courseAssigns.map(a => (
                        <option key={a.id || a.title} value={a.id || a.title}>
                          {a.title} ({a.assessment_category === 'FINAL_EXAM' ? 'Exam' : 'Assignment'})
                        </option>
                      ))}
                      <option value="__new__">+ Custom Assessment / Test / Exam</option>
                    </select>
                  </div>

                  {/* Mark Category */}
                  <div>
                    <label className="lmis-label" style={{ fontWeight: 700, marginBottom: '0.3rem' }}>Mark Category / Type</label>
                    <select
                      className="lmis-select"
                      value={adminMarkAssessmentType}
                      onChange={e => setAdminMarkAssessmentType(e.target.value)}
                    >
                      <option value="ASSIGNMENT">AS : ASSIGNMENT (Formative)</option>
                      <option value="WRITTEN_TEST">WR : WRITTEN TEST (Formative / Test)</option>
                      <option value="EXAMINATION">EX : EXAMINATION (Summative 40%)</option>
                    </select>
                  </div>

                  {/* Custom Title Input */}
                  {(adminMarkAssessmentMode === 'custom' || courseAssigns.length === 0) && (
                    <div style={{ gridColumn: '1 / -1' }}>
                      <label className="lmis-label" style={{ fontWeight: 700, marginBottom: '0.3rem' }}>Custom Assessment Title</label>
                      <input
                        type="text"
                        className="lmis-input"
                        placeholder="e.g. Assignment 1 — BPM Process Design, or Written Test 1"
                        value={adminMarkCustomTitle}
                        onChange={e => {
                          setAdminMarkCustomTitle(e.target.value);
                          handleAdminMarkAssessmentChange('__new__', e.target.value);
                        }}
                      />
                    </div>
                  )}
                </div>

                {/* Class Roster Marks Table */}
                <div style={{ marginBottom: '1.25rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                    <span style={{ fontWeight: 700, fontSize: '0.9rem', color: 'var(--text-main)' }}>
                      Enrolled Learners ({enrolledInCourse.length})
                    </span>
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-sub)' }}>
                      Enter mark percentage (0–100) per learner. Leave blank if unassessed.
                    </span>
                  </div>

                  {enrolledInCourse.length === 0 ? (
                    <div style={{ textAlign: 'center', padding: '2rem', background: 'var(--bg-card-header, #f8fafc)', borderRadius: '6px', border: '1px solid var(--border-color)', color: 'var(--text-sub)' }}>
                      No learners currently enrolled in module {targetCourse}.
                    </div>
                  ) : (
                    <div className="lmis-table-wrap" style={{ maxHeight: '380px', overflowY: 'auto' }}>
                      <table className="lmis-table" style={{ fontSize: '0.82rem' }}>
                        <thead>
                          <tr>
                            <th style={{ width: '35px' }}>#</th>
                            <th>Learner Name &amp; Email</th>
                            <th>Student No</th>
                            <th style={{ width: '110px', textAlign: 'center' }}>Mark (%)</th>
                            <th>Feedback / Evaluator Notes</th>
                          </tr>
                        </thead>
                        <tbody>
                          {enrolledInCourse.map((en, idx) => {
                            const email = (en.learner_email || '').toLowerCase().trim();
                            const prof = (student_profiles || []).find(p => (p.learner_email || '').toLowerCase().trim() === email);
                            const entry = adminLearnerMarks[email] || { grade: '', feedback: '' };

                            return (
                              <tr key={en.id || email}>
                                <td style={{ color: 'var(--text-sub)', fontWeight: 600 }}>{idx + 1}</td>
                                <td>
                                  <div style={{ fontWeight: 700, color: 'var(--text-main)' }}>{prof?.learner_name || en.learner_name || email.split('@')[0]}</div>
                                  <div style={{ fontSize: '0.72rem', color: 'var(--text-sub)' }}>{email}</div>
                                </td>
                                <td>
                                  <span className="badge badge-navy" style={{ fontSize: '0.72rem' }}>
                                    {prof?.student_number || '—'}
                                  </span>
                                </td>
                                <td style={{ textAlign: 'center' }}>
                                  <input
                                    type="number"
                                    min="0"
                                    max="100"
                                    placeholder="0-100"
                                    className="lmis-input"
                                    style={{
                                      width: '80px',
                                      textAlign: 'center',
                                      fontWeight: 800,
                                      fontSize: '0.9rem',
                                      padding: '0.35rem 0.4rem',
                                      color: entry.grade !== '' ? (Number(entry.grade) >= 50 ? 'var(--emerald)' : 'var(--red)') : 'inherit'
                                    }}
                                    value={entry.grade}
                                    onChange={e => {
                                      const val = e.target.value;
                                      setAdminLearnerMarks(prev => ({
                                        ...prev,
                                        [email]: {
                                          ...prev[email],
                                          grade: val
                                        }
                                      }));
                                    }}
                                  />
                                </td>
                                <td>
                                  <input
                                    type="text"
                                    placeholder="Optional feedback..."
                                    className="lmis-input"
                                    style={{ fontSize: '0.78rem', padding: '0.35rem 0.5rem' }}
                                    value={entry.feedback || ''}
                                    onChange={e => {
                                      const val = e.target.value;
                                      setAdminLearnerMarks(prev => ({
                                        ...prev,
                                        [email]: {
                                          ...prev[email],
                                          feedback: val
                                        }
                                      }));
                                    }}
                                  />
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>

                {/* Modal Footer Actions */}
                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', paddingTop: '0.75rem', borderTop: '1px solid var(--border-color)' }}>
                  <button
                    type="button"
                    className="btn btn-sm btn-ghost"
                    onClick={() => setShowAdminMarkModal(false)}
                    disabled={adminSavingMarks}
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    className="btn btn-sm btn-gold"
                    onClick={handleSaveAdminMarks}
                    disabled={adminSavingMarks || enrolledInCourse.length === 0}
                    style={{ fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.4rem' }}
                  >
                    <IcoCheck size={14} />
                    {adminSavingMarks ? 'Saving Marks...' : 'Save Captured Marks'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        );
      })()}

      {/* AUDIT LOG FORENSIC INSPECTION MODAL */}
      {inspectingAuditLog && (
        <div className="lmis-modal-overlay" style={{ position: 'fixed', inset: 0, background: 'rgba(15,23,42,0.7)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999, padding: '1rem' }}>
          <div className="lmis-modal-card" style={{ background: 'var(--bg-card)', color: 'var(--text-main)', border: '1px solid var(--border-color)', borderRadius: '12px', width: '100%', maxWidth: '850px', maxHeight: '90vh', overflowY: 'auto', padding: '1.75rem', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.35)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', borderBottom: '1px solid var(--border-color)', paddingBottom: '1rem', marginBottom: '1.25rem' }}>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '0.35rem' }}>
                  <span className="badge badge-navy" style={{ fontSize: '0.82rem', fontWeight: 800, padding: '0.3rem 0.65rem' }}>
                    {inspectingAuditLog.action_type}
                  </span>
                  <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--text-main)', margin: 0 }}>
                    Forensic Audit Inspection
                  </h3>
                </div>
                <p style={{ fontSize: '0.82rem', color: 'var(--text-sub)', margin: 0 }}>
                  Event ID: <code style={{ fontSize: '0.75rem' }}>{inspectingAuditLog.id}</code> · Recorded: {new Date(inspectingAuditLog.timestamp).toLocaleString('en-ZA', { dateStyle: 'full', timeStyle: 'long' })}
                </p>
              </div>
              <button className="btn btn-sm btn-ghost" onClick={() => setInspectingAuditLog(null)}><IcoX size={20} /></button>
            </div>

            {/* Quick Context Grid */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '0.75rem', marginBottom: '1.25rem' }}>
              <div style={{ background: 'var(--bg-app)', padding: '0.75rem', borderRadius: '8px', border: '1px solid var(--border-color)' }}>
                <div style={{ fontSize: '0.72rem', color: 'var(--text-sub)', textTransform: 'uppercase', fontWeight: 700 }}>Actor / Operator</div>
                <div style={{ fontWeight: 700, fontSize: '0.92rem', color: 'var(--text-main)' }}>{inspectingAuditLog.performed_by}</div>
                <span className="badge badge-gold" style={{ fontSize: '0.68rem', marginTop: '0.2rem' }}>{inspectingAuditLog.role || 'Admin'}</span>
              </div>
              <div style={{ background: 'var(--bg-app)', padding: '0.75rem', borderRadius: '8px', border: '1px solid var(--border-color)' }}>
                <div style={{ fontSize: '0.72rem', color: 'var(--text-sub)', textTransform: 'uppercase', fontWeight: 700 }}>Target Entity</div>
                <div style={{ fontWeight: 700, fontSize: '0.92rem', color: 'var(--primary-navy)' }}>{inspectingAuditLog.target_entity}</div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-sub)' }}>Origin: {inspectingAuditLog.device || 'Secure LMIS Client'}</div>
              </div>
            </div>

            {/* Narrative Summary */}
            <div style={{ background: 'rgba(59, 130, 246, 0.05)', border: '1px solid rgba(59, 130, 246, 0.2)', padding: '1rem', borderRadius: '8px', marginBottom: '1.25rem' }}>
              <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--primary-navy)', textTransform: 'uppercase', marginBottom: '0.25rem' }}>Audit Narrative</div>
              <p style={{ margin: 0, fontSize: '0.88rem', color: 'var(--text-main)', lineHeight: 1.5 }}>
                {inspectingAuditLog.details}
              </p>
            </div>

            {/* Snapshot Callout for Deletions */}
            {inspectingAuditLog.metadata?.snapshot && (
              <div style={{ background: 'rgba(239, 68, 68, 0.06)', border: '1px solid rgba(239, 68, 68, 0.25)', borderRadius: '8px', padding: '1.25rem', marginBottom: '1.25rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.75rem' }}>
                  <span style={{ fontSize: '1.1rem' }}>🔴</span>
                  <div style={{ fontWeight: 800, fontSize: '0.95rem', color: '#b91c1c' }}>
                    Point-in-Time Deleted Record Snapshot (Preserved for Compliance)
                  </div>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '0.75rem', fontSize: '0.82rem' }}>
                  {Object.entries(inspectingAuditLog.metadata.snapshot).map(([key, value]) => {
                    if (typeof value === 'object' && value !== null) return null;
                    const label = key.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
                    return (
                      <div key={key} style={{ background: 'var(--bg-app)', padding: '0.6rem 0.75rem', borderRadius: '6px', border: '1px solid var(--border-color)' }}>
                        <div style={{ color: 'var(--text-sub)', fontSize: '0.7rem', textTransform: 'uppercase', fontWeight: 600 }}>{label}</div>
                        <div style={{ fontWeight: 700, color: 'var(--text-main)', wordBreak: 'break-all' }}>{String(value || '—')}</div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* JSON Metadata Payload Inspector */}
            {inspectingAuditLog.metadata && (
              <div style={{ marginBottom: '1.25rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.4rem' }}>
                  <span style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--text-sub)', textTransform: 'uppercase' }}>
                    Raw Structured Payload (JSON)
                  </span>
                  <button
                    className="btn btn-sm btn-outline"
                    style={{ fontSize: '0.72rem', padding: '0.2rem 0.5rem' }}
                    onClick={() => {
                      navigator.clipboard.writeText(JSON.stringify(inspectingAuditLog.metadata, null, 2));
                      showToast('Copied JSON audit payload to clipboard!');
                    }}
                  >
                    📋 Copy JSON
                  </button>
                </div>
                <pre style={{
                  background: '#0f172a',
                  color: '#38bdf8',
                  padding: '1rem',
                  borderRadius: '8px',
                  fontSize: '0.78rem',
                  maxHeight: '260px',
                  overflowY: 'auto',
                  fontFamily: 'Consolas, Monaco, monospace',
                  border: '1px solid var(--border-color)',
                  margin: 0
                }}>
                  {JSON.stringify(inspectingAuditLog.metadata, null, 2)}
                </pre>
              </div>
            )}

            <div style={{ display: 'flex', justifyContent: 'flex-end', paddingTop: '0.75rem', borderTop: '1px solid var(--border-color)' }}>
              <button className="btn btn-sm btn-ghost" onClick={() => setInspectingAuditLog(null)}>
                Close Forensic Inspector
              </button>
            </div>
          </div>
        </div>
      )}

      {/* STUDENT PROFILE & FUNDING MODAL */}
      {viewingStudentProfile && (
        <div className="lmis-modal-overlay" style={{ position: 'fixed', inset: 0, background: 'rgba(15,23,42,0.7)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999, padding: '1rem' }}>
          <div className="lmis-modal-card" style={{ background: 'var(--bg-card)', color: 'var(--text-main)', border: '1px solid var(--border-color)', borderRadius: '12px', width: '100%', maxWidth: '800px', maxHeight: '90vh', overflowY: 'auto', padding: '1.75rem', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.35)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', borderBottom: '1px solid var(--border-color)', paddingBottom: '1rem', marginBottom: '1.25rem' }}>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
                  <h3 style={{ fontSize: '1.3rem', fontWeight: 800, color: 'var(--text-main)', margin: 0 }}>
                    🎓 {viewingStudentProfile.learner_name}
                  </h3>
                  <span className={`badge ${viewingStudentProfile.funding_type === 'self_paying' ? 'badge-navy' : 'badge-emerald'}`}>
                    {viewingStudentProfile.funding_type === 'self_paying' ? 'Self-Paying' : 'Funded Learner'}
                  </span>
                </div>
                <p style={{ fontSize: '0.82rem', color: 'var(--text-sub)', margin: 0 }}>
                  Student No: <strong>{viewingStudentProfile.student_number || 'Pending'}</strong> · Enrolled: {viewingStudentProfile.programme_enrolled || viewingStudentProfile.qualification || 'National Certificate'}
                </p>
              </div>
              <button className="btn btn-sm btn-ghost" onClick={() => setViewingStudentProfile(null)}><IcoX size={20} /></button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              {/* Personal & Academic Details */}
              <div style={{ background: 'var(--bg-app)', padding: '1.25rem', borderRadius: '8px', border: '1px solid var(--border-color)' }}>
                <h4 style={{ fontSize: '0.9rem', fontWeight: 700, margin: '0 0 0.75rem 0', color: 'var(--primary-navy)' }}>
                  👤 Academic &amp; Identity Particulars
                </h4>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '0.85rem', fontSize: '0.85rem' }}>
                  <div><span style={{ color: 'var(--text-sub)', fontSize: '0.75rem', display: 'block' }}>Email Address</span><strong>{viewingStudentProfile.learner_email}</strong></div>
                  <div><span style={{ color: 'var(--text-sub)', fontSize: '0.75rem', display: 'block' }}>SA ID / Passport</span><strong>{viewingStudentProfile.id_passport || '—'}</strong></div>
                  <div><span style={{ color: 'var(--text-sub)', fontSize: '0.75rem', display: 'block' }}>Mobile Number</span><strong>{viewingStudentProfile.phone || '—'}</strong></div>
                  <div><span style={{ color: 'var(--text-sub)', fontSize: '0.75rem', display: 'block' }}>City / Province</span><strong>{viewingStudentProfile.city ? `${viewingStudentProfile.city}, ${viewingStudentProfile.province || ''}` : viewingStudentProfile.province || '—'}</strong></div>
                  <div><span style={{ color: 'var(--text-sub)', fontSize: '0.75rem', display: 'block' }}>Employment Status</span><strong>{viewingStudentProfile.employment_status || 'Unemployed'}</strong></div>
                  <div><span style={{ color: 'var(--text-sub)', fontSize: '0.75rem', display: 'block' }}>Registered Status</span><span className="badge badge-emerald">Active Registered Learner</span></div>
                </div>
              </div>

              {/* Funding & Bursary Particulars */}
              <div style={{ background: viewingStudentProfile.funding_type === 'self_paying' ? 'rgba(30, 41, 59, 0.04)' : 'rgba(16, 185, 129, 0.05)', padding: '1.25rem', borderRadius: '8px', border: viewingStudentProfile.funding_type === 'self_paying' ? '1px solid var(--border-color)' : '1px solid rgba(16, 185, 129, 0.25)' }}>
                <h4 style={{ fontSize: '0.9rem', fontWeight: 700, margin: '0 0 0.75rem 0', color: viewingStudentProfile.funding_type === 'self_paying' ? 'var(--text-main)' : 'var(--emerald)' }}>
                  {viewingStudentProfile.funding_type === 'self_paying' ? '💳 Fee & Tuition Funding' : '💰 SETA Bursary & Monthly Stipend Grant'}
                </h4>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '0.85rem', fontSize: '0.85rem' }}>
                  <div><span style={{ color: 'var(--text-sub)', fontSize: '0.75rem', display: 'block' }}>Funding Classification</span><strong>{viewingStudentProfile.funding_type === 'self_paying' ? 'Self-Paying / Private Bursary' : 'Funded Learner (Stipend Eligible)'}</strong></div>
                  {viewingStudentProfile.funding_type !== 'self_paying' && (
                    <>
                      <div><span style={{ color: 'var(--text-sub)', fontSize: '0.75rem', display: 'block' }}>SETA Grant Sponsor</span><strong>{viewingStudentProfile.funder_name || 'Services SETA'}</strong></div>
                      <div><span style={{ color: 'var(--text-sub)', fontSize: '0.75rem', display: 'block' }}>Monthly Stipend Allowance</span><strong style={{ color: 'var(--emerald)', fontSize: '1rem' }}>R {Number(viewingStudentProfile.stipend_amount || 4500).toLocaleString('en-ZA', { minimumFractionDigits: 2 })} / mo</strong></div>
                    </>
                  )}
                </div>
              </div>

              {/* Disbursement Banking Details */}
              {viewingStudentProfile.funding_type !== 'self_paying' && (
                <div style={{ background: 'var(--bg-app)', padding: '1.25rem', borderRadius: '8px', border: '1px solid var(--border-color)' }}>
                  <h4 style={{ fontSize: '0.9rem', fontWeight: 700, margin: '0 0 0.75rem 0', color: 'var(--primary-navy)' }}>
                    🏦 Stipend Bank Particulars (EFT / Batch Settlement)
                  </h4>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '0.85rem', fontSize: '0.85rem' }}>
                    <div><span style={{ color: 'var(--text-sub)', fontSize: '0.75rem', display: 'block' }}>Bank Name</span><strong>{viewingStudentProfile.bank_name || 'Standard Bank'}</strong></div>
                    <div><span style={{ color: 'var(--text-sub)', fontSize: '0.75rem', display: 'block' }}>Account Holder</span><strong>{viewingStudentProfile.bank_account_holder || viewingStudentProfile.learner_name}</strong></div>
                    <div><span style={{ color: 'var(--text-sub)', fontSize: '0.75rem', display: 'block' }}>Account Number</span><strong>{viewingStudentProfile.bank_account_number || '—'}</strong></div>
                    <div><span style={{ color: 'var(--text-sub)', fontSize: '0.75rem', display: 'block' }}>Universal Branch Code</span><strong>{viewingStudentProfile.bank_branch_code || '051001'}</strong></div>
                    <div><span style={{ color: 'var(--text-sub)', fontSize: '0.75rem', display: 'block' }}>Account Type</span><strong>{viewingStudentProfile.bank_account_type || 'Savings Account'}</strong></div>
                  </div>
                </div>
              )}

              {/* Security notice */}
              <div style={{ fontSize: '0.75rem', color: 'var(--text-sub)', background: 'rgba(234, 179, 8, 0.08)', padding: '0.65rem 0.85rem', borderRadius: '6px', border: '1px solid rgba(234, 179, 8, 0.25)' }}>
                🔒 <strong>Institutional Compliance Notice:</strong> This learner profile lookup has been timestamped and permanently logged to the LMIS audit trail under user <strong>{currentAdmin?.name || loginEmail}</strong>.
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', paddingTop: '1rem', marginTop: '1.25rem', borderTop: '1px solid var(--border-color)' }}>
              <button className="btn btn-sm btn-primary" onClick={() => setViewingStudentProfile(null)}>
                Close Profile
              </button>
            </div>
          </div>
        </div>
      )}
    </LmisShell>
  );
};
