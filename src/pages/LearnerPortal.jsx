import { SignaturePad } from '../components/shared/SignaturePad';
import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { useData } from '../context/DataContext';
import { FileAttachmentZone, AttachmentList } from './LmisAttachment';
import { ThemeToggle } from '../components/shared/ThemeToggle';
import {
  downloadAllModuleMaterialsAsZip,
  recordResourceActivity,
  getCompletedResources,
  toggleResourceCompletion,
  getLearnerStudyNotes,
  saveLearnerStudyNotes,
  safeDownloadResource,
  getValidResourceUrl
} from '../utils/studyMaterialManager';
import { supabase } from '../supabaseClient';
import { generateProofOfRegistrationPDF } from '../utils/registrationPdf';
import { generateProofOfStipendPaymentPDF } from '../utils/stipendReceiptPdf';
import { generatePoePDF } from '../utils/poePdf';
import { generateAcademicTranscriptPDF } from '../utils/transcriptPdf';
import { generateCompletionCertificatePDF } from '../utils/completionCertificatePdf';
import { calculateModuleAcademicRecord, calculateProgrammeAcademicStanding, ACADEMIC_CONSTANTS } from '../utils/gradeCalculations';
import { isDeliverableEmail, safeSupabasePasswordReset } from '../utils/emailValidator';
import { LmisCalendarSchedule } from '../components/shared/LmisCalendarSchedule';
import { getPortalSession, setPortalSession, clearPortalSession, useSessionInactivity } from '../utils/sessionManager';
import './LmisCommon.css';

/* ── SVG Icon Helpers ─────────────────────── */
const Icon = ({ d, size = 18, ...p }) => (
  <svg width={size} height={size} fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24" {...p}>
    <path d={d} />
  </svg>
);
const IcoBook    = (p) => <Icon d="M4 19.5A2.5 2.5 0 016.5 17H20" {...p}/>;
const IcoFile    = (p) => <Icon d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" {...p}/>;
const IcoClock   = (p) => <Icon d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" {...p}/>;
const IcoCalendar= (p) => <Icon d="M8 7V3m8 4V3M3 11h18M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" {...p}/>;
const IcoWallet  = (p) => <Icon d="M3 10h18M7 15h.01M11 15h2M3 6h18a1 1 0 011 1v10a1 1 0 01-1 1H3a1 1 0 01-1-1V7a1 1 0 011-1z" {...p}/>;
const IcoAward   = (p) => <Icon d="M12 15l-2 5-3-1 2-4m3 0l2 5 3-1-2-4M12 15V3m-4 9a4 4 0 108 0 4 4 0 00-8 0z" {...p}/>;
const IcoUser    = (p) => <Icon d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2M12 11a4 4 0 100-8 4 4 0 000 8z" {...p}/>;
const IcoMail    = (p) => <Icon d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2zm16 2l-8 5-8-5" {...p}/>;
const IcoBell    = (p) => <Icon d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9M13.73 21a2 2 0 01-3.46 0" {...p}/>;
const IcoCheck   = (p) => <Icon d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" {...p}/>;
const IcoAlert   = (p) => <Icon d="M12 9v2m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" {...p}/>;
const IcoMenu    = (p) => <Icon d="M4 6h16M4 12h16M4 18h16" {...p}/>;
const IcoX       = (p) => <Icon d="M18 6L6 18M6 6l12 12" {...p}/>;
const IcoSend    = (p) => <Icon d="M22 2L11 13M22 2l-7 20-4-9-9-4 20-7z" {...p}/>;
const IcoEdit    = (p) => <Icon d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z" {...p}/>;
const IcoSave    = (p) => <Icon d="M19 21H5a2 2 0 01-2-2V5a2 2 0 012-2h11l5 5v11a2 2 0 01-2 2zM17 21v-8H7v8M7 3v5h8" {...p}/>;
const IcoDl      = (p) => <Icon d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4M7 10l5 5 5-5M12 15V3" {...p}/>;
const IcoHelp    = (p) => <Icon d="M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10zm0-14v.01M12 12v4" {...p}/>;
const IcoPlay    = (p) => <Icon d="M5 3l14 9-14 9V3z" {...p}/>;

/* ── LMIS Shell Wrapper ───────────────────── */
function LmisShell({ role, userName, children, activeTab, onTabChange, tabs, mobileBottomTabs, onRefresh, syncStatus, onLogout }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [syncing, setSyncing] = useState(false);

  const handleManualSync = async () => {
    setSyncing(true);
    if (onRefresh) await onRefresh();
    setTimeout(() => setSyncing(false), 800);
  };

  return (
    <div className="lmis-shell">
      <div className="lmis-watermark" />

      {/* Header */}
      <header className="lmis-header">
        <div className="lmis-header-left">
          <button className="lmis-menu-toggle lmis-mobile-menu-btn" onClick={() => setSidebarOpen(true)} aria-label="Open menu">
            <IcoMenu size={20} />
          </button>
          <Link to="/lmis">
            <img src="/logo.svg" alt="NX" className="lmis-header-logo" />
          </Link>
          <span className="lmis-header-title">LMIS</span>
        </div>
        <div className="lmis-header-right" style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
          <ThemeToggle />
          <span className="lmis-role-badge">{role}</span>
          {userName && <span className="lmis-user-name" style={{ display: 'none' }} id="hdr-uname">{userName}</span>}
          <button type="button" onClick={onLogout || (() => window.location.href="/lmis")} className="lmis-exit-link" style={{ background: "none", border: "none", cursor: "pointer" }}>🚪 Sign Out</button>
        </div>
      </header>

      <div className="lmis-body">
        {/* Desktop Sidebar */}
        <aside className="lmis-sidebar lmis-sidebar-desktop">
          <nav className="lmis-nav">
            {tabs.map(t => (
              <button
                key={t.id}
                className={`lmis-nav-item${activeTab === t.id ? ' active' : ''}`}
                onClick={() => onTabChange(t.id)}
              >
                {t.icon}
                {t.label}
                {t.badge ? <span className="lmis-nav-badge">{t.badge}</span> : null}
              </button>
            ))}
          </nav>
          <div className="lmis-sidebar-footer">"Intelligent solutions that drive growth."</div>
        </aside>

        {/* Mobile Sidebar Overlay */}
        <div className={`lmis-sidebar-mobile-overlay${sidebarOpen ? ' open' : ''}`} onClick={() => setSidebarOpen(false)} />
        <div className={`lmis-sidebar-mobile${sidebarOpen ? ' open' : ''}`}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '1rem 1.25rem', borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
            <span className="lmis-header-title">LMIS — {role}</span>
            <button onClick={() => setSidebarOpen(false)} style={{ color: '#fff' }}><IcoX size={20} /></button>
          </div>
          <nav className="lmis-nav" style={{ paddingTop: '0.75rem' }}>
            {tabs.map(t => (
              <button
                key={t.id}
                className={`lmis-nav-item${activeTab === t.id ? ' active' : ''}`}
                onClick={() => { onTabChange(t.id); setSidebarOpen(false); }}
              >
                {t.icon}
                {t.label}
                {t.badge ? <span className="lmis-nav-badge">{t.badge}</span> : null}
              </button>
            ))}
          </nav>
        </div>

        {/* Main */}
        <main className="lmis-main">
          {children}
        </main>
      </div>

      {/* Mobile Bottom Nav (quick tabs) */}
      {mobileBottomTabs && (
        <nav className="lmis-bottom-nav">
          {mobileBottomTabs.map(t => (
            <button
              key={t.id}
              className={`lmis-bottom-nav-btn${activeTab === t.id ? ' active' : ''}`}
              onClick={() => onTabChange(t.id)}
            >
              {t.icon}
              {t.label}
            </button>
          ))}
        </nav>
      )}
    </div>
  );
}

/* ── Shared formatters ────────────────────── */
const fmtDate = (d) => {
  if (!d) return '—';
  try { return new Date(d).toLocaleDateString('en-ZA', { day: '2-digit', month: 'short', year: 'numeric' }); } catch { return d; }
};
const fmtZAR = (n) => `R ${Number(n || 0).toLocaleString('en-ZA', { minimumFractionDigits: 2 })}`;
const fmtBytes = (b) => b < 1024 ? `${b} B` : b < 1048576 ? `${(b / 1024).toFixed(1)} KB` : `${(b / 1048576).toFixed(1)} MB`;
const daysLeft = (d) => {
  if (!d) return null;
  const diff = Math.ceil((new Date(d) - new Date()) / 86400000);
  return diff;
};

/* ══════════════════════════════════════════
   LEARNER PORTAL
══════════════════════════════════════════ */
export const LearnerPortal = () => {
  const { student_profiles, courses, enrollments, assignments, submissions,
    attendance, announcements, calendar_events, messages, notifications,
    library_resources, fees, certificates, quizzes, quiz_attempts,
    stipend_disbursements = [], institutional_banking_config = {},
    grade_appeals = [],
    createRecord, updateRecord, deleteRecord, refreshData, syncStatus, setData } = useData();

  // Always-current ref so async login polling reads latest student_profiles (avoids stale closure on mobile)
  const studentProfilesRef = useRef(student_profiles);
  useEffect(() => { studentProfilesRef.current = student_profiles; }, [student_profiles]);

  /* ── Auth State with Persistent Session & Inactivity Expiry ──── */
  const [sessionExpiredNotice, setSessionExpiredNotice] = useState(() => {
    try {
      return typeof window !== 'undefined' && new URLSearchParams(window.location.search).get('session_expired') === 'true';
    } catch {
      return false;
    }
  });

  const [loggedIn, setLoggedIn] = useState(() => {
    try { return getPortalSession('learner').authenticated; } catch { return false; }
  });
  const [activeEmail, setActiveEmail] = useState(() => {
    try {
      const sess = getPortalSession('learner');
      return sess.authenticated && sess.user ? String(sess.user) : '';
    } catch { return ''; }
  });

  // 30-minute inactivity auto-logout hook
  useSessionInactivity({
    portalType: 'learner',
    loggedIn,
    onTimeout: () => {
      setLoggedIn(false);
      setActiveEmail('');
      setSessionExpiredNotice(true);
      window.location.href = '/lmis?session_expired=true&portal=learner';
    }
  });

  const [loginEmail, setLoginEmail] = useState('');
  const [loginStudentId, setLoginStudentId] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loginLoading, setLoginLoading] = useState(false);
  const [loginErr, setLoginErr] = useState('');

  const handleLogout = () => {
    clearPortalSession('learner');
    setLoggedIn(false);
    setActiveEmail('');
    window.location.href = '/lmis';
  };

  /* ── UI State ────────────────────────── */
  const [activeTab, setActiveTab] = useState(() => {
    try {
      const p = new URLSearchParams(window.location.search);
      return p.get('tab') || 'overview';
    } catch {
      return 'overview';
    }
  });
  const [submitNotes, setSubmitNotes] = useState('');
  const [submittingId, setSubmittingId] = useState(null);
  const [composingMsg, setComposingMsg] = useState(false);
  const [msgForm, setMsgForm] = useState({ to: 'Administration', subject: '', content: '' });
  const [editingProfile, setEditingProfile] = useState(false);
  const [profileForm, setProfileForm] = useState({});
  const [toast, setToast] = useState('');
  const [submitFiles, setSubmitFiles] = useState([]);
  const [declarationSigned, setDeclarationSigned] = useState(true);
  const [activePoeCategory, setActivePoeCategory] = useState('ALL');
  const [learnerSignature, setLearnerSignature] = useState(null);
  const [activeLessonId, setActiveLessonId] = useState(null);
  const [completedLessonIds, setCompletedLessonIds] = useState([]);
  const [recordingCourseFilter, setRecordingCourseFilter] = useState('All');
  const [previewMaterial, setPreviewMaterial] = useState(null);
  const [completedResources, setCompletedResources] = useState({});
  const [studyNotesText, setStudyNotesText] = useState('');
  const [showNotesDrawer, setShowNotesDrawer] = useState(false);
  const [zipDownloading, setZipDownloading] = useState(false);
  const [zipProgress, setZipProgress] = useState('');
  const [libraryCategoryFilter, setLibraryCategoryFilter] = useState('All');
  const [libraryCourseFilter, setLibraryCourseFilter] = useState('All');
  const [librarySearch, setLibrarySearch] = useState('');
  const [selectedGradeModule, setSelectedGradeModule] = useState('ALL');
  const [downloadingTranscript, setDownloadingTranscript] = useState(false);

  /* ── Grade Appeal State ─────────── */
  const [showAppealForm, setShowAppealForm] = useState(null); // holds assignment title being appealed
  const [appealForm, setAppealForm] = useState({ course_code: '', appeal_reason: '', supporting_notes: '' });
  const [appealSubmitting, setAppealSubmitting] = useState(false);

  /* ── Quiz Taking States ────────────────── */
  const [activeQuizSession, setActiveQuizSession] = useState(null);
  const [activeAttemptId, setActiveAttemptId] = useState(null);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [quizResponses, setQuizResponses] = useState({});
  const [quizTimeRemaining, setQuizTimeRemaining] = useState(0);
  const [quizCompletedScore, setQuizCompletedScore] = useState(null);
  const [preQuizBriefing, setPreQuizBriefing] = useState(null);
  const [pledgeChecked, setPledgeChecked] = useState(false);
  const [isFullscreenOverlayVisible, setIsFullscreenOverlayVisible] = useState(false);
  const [tabSwitchCount, setTabSwitchCount] = useState(0);
  const [fullscreenExitCount, setFullscreenExitCount] = useState(0);
  const [auditLog, setAuditLog] = useState([]);
  const [showNextConfirm, setShowNextConfirm] = useState(false);
  const [dontAskAgainForSession, setDontAskAgainForSession] = useState(false);
  const [showSubmitConfirm, setShowSubmitConfirm] = useState(false);
  const [reviewAnswersModal, setReviewAnswersModal] = useState(null);

  const showToast = (msg) => { setToast(msg); setTimeout(() => setToast(''), 3500); };  /* ── Login Handler ───────────────────── */
  const handleLogin = async (e) => {
    e.preventDefault();
    setLoginErr('');
    setLoginLoading(true);

    const cleanEmail = (loginEmail || '').trim().toLowerCase();
    const cleanPassword = (loginStudentId || '').trim();

    if (!cleanEmail || !cleanPassword) {
      setLoginErr('Please enter your email address and student number / password.');
      setLoginLoading(false);
      return;
    }

    // Checks whether cleanPassword matches any of the learner's registered credentials
    const credMatches = (p) => {
      const sNum  = (p.student_number  || '').trim().toLowerCase();
      const idP   = (p.id_passport     || '').trim().toLowerCase();
      const cPass = (p.custom_password || '').trim();
      const pass  = (p.password        || '').trim();
      const inp   = cleanPassword.toLowerCase();
      return (
        sNum === inp ||
        idP === inp ||
        (cPass && cPass === cleanPassword) ||
        (pass && pass === cleanPassword)
      );
    };

    // Signs the learner in locally — updates state, sessionStorage, no Supabase dependency
    const doSignIn = (p) => {
      const email = p.learner_email || cleanEmail;
      setActiveEmail(email);
      setProfileForm({ ...p, learner_email: email });
      setLoggedIn(true);
      setLoginErr('');
      setSessionExpiredNotice(false);
      try {
        setCompletedResources(getCompletedResources(email));
        setPortalSession('learner', email);
      } catch (_) {}
    };

    try {
      // ── STEP 1: Try Supabase Auth (the proper, secure path) ──────────────────
      // This is the PRIMARY path for all production learners.
      // Password = student number (set at registration via /api/auth-confirm).
      let authUser = null;
      let authErrMsg = '';

      try {
        const { data: authData, error: authErr } = await Promise.race([
          supabase.auth.signInWithPassword({ email: cleanEmail, password: cleanPassword }),
          new Promise((_, rej) => setTimeout(() => rej(new Error('timeout')), 6000))
        ]);

        if (!authErr && authData?.user) {
          authUser = authData.user;
        } else if (authErr) {
          authErrMsg = authErr.message || '';
        }
      } catch (_) {}

      // ── STEP 2: If auth succeeded, fetch learner's own profile from DB ────────
      if (authUser) {
        let profile = null;

        // Try to get the profile from the DB (works because session token is now active)
        try {
          const { data: profileData } = await Promise.race([
            supabase.from('student_profiles').select('*').eq('learner_email', cleanEmail).limit(1),
            new Promise((_, rej) => setTimeout(() => rej(new Error('timeout')), 5000))
          ]);
          if (profileData && profileData.length > 0) {
            profile = profileData[0];
          }
        } catch (_) {}

        // Fall back to in-memory if DB query failed
        if (!profile) {
          const memList = studentProfilesRef.current || student_profiles || [];
          profile = memList.find(p => (p.learner_email || '').trim().toLowerCase() === cleanEmail);
        }

        // Build a minimal profile from the auth user if neither source worked
        if (!profile) {
          profile = {
            learner_email: cleanEmail,
            learner_name: authUser.user_metadata?.name || cleanEmail.split('@')[0],
            student_number: authUser.user_metadata?.student_number || cleanPassword
          };
        }

        doSignIn(profile);
        return;
      }

      // ── STEP 3: Email not confirmed — auto-fix via /api/auth-confirm ──────────
      // This handles learners registered before the new system was deployed.
      // /api/auth-confirm uses the service role key to confirm their email server-side,
      // then we retry signInWithPassword once.
      const emailNotConfirmed = authErrMsg.toLowerCase().includes('email not confirmed') ||
        authErrMsg.toLowerCase().includes('invalid login credentials');

      if (emailNotConfirmed) {
        try {
          await Promise.race([
            fetch('/api/auth-confirm', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ email: cleanEmail, password: cleanPassword })
            }),
            new Promise((_, rej) => setTimeout(() => rej(new Error('timeout')), 5000))
          ]);
        } catch (_) {}

        // Retry login after confirmation
        try {
          const { data: retryData, error: retryErr } = await Promise.race([
            supabase.auth.signInWithPassword({ email: cleanEmail, password: cleanPassword }),
            new Promise((_, rej) => setTimeout(() => rej(new Error('timeout')), 6000))
          ]);
          if (!retryErr && retryData?.user) {
            authUser = retryData.user;

            let profile = null;
            try {
              const { data: pd } = await supabase.from('student_profiles').select('*').eq('learner_email', cleanEmail).limit(1);
              if (pd && pd.length > 0) profile = pd[0];
            } catch (_) {}

            if (!profile) {
              const memList = studentProfilesRef.current || student_profiles || [];
              profile = memList.find(p => (p.learner_email || '').trim().toLowerCase() === cleanEmail);
            }
            if (!profile) {
              profile = {
                learner_email: cleanEmail,
                learner_name: authUser.user_metadata?.name || cleanEmail.split('@')[0],
                student_number: authUser.user_metadata?.student_number || cleanPassword
              };
            }

            doSignIn(profile);
            return;
          }
        } catch (_) {}
      }

      // ── STEP 4: Offline / Supabase unreachable — check in-memory profiles ─────
      // This is a safety net when Supabase is temporarily unavailable.
      const memList = studentProfilesRef.current || student_profiles || [];
      const memMatch = memList.find(p =>
        (p.learner_email || '').trim().toLowerCase() === cleanEmail && credMatches(p)
      );
      if (memMatch) {
        doSignIn(memMatch);
        // Queue the auth-confirm in background for next time they're online
        fetch('/api/auth-confirm', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email: cleanEmail, password: cleanPassword })
        }).catch(() => {});
        return;
      }

      // All paths exhausted
      setLoginErr(
        authErrMsg && !emailNotConfirmed
          ? 'Incorrect email or password / student number. Please check your credentials or contact Admin.'
          : 'No account found. Please check your email and student number, or contact Admin.'
      );
    } catch (err) {
      setLoginErr('Sign in failed. Please check your internet connection and try again.');
    } finally {
      setLoginLoading(false);
    }
  };

  /* ── Derived Data ────────────────────── */
  const cleanActive = activeEmail?.toLowerCase().trim();
  const myProfile = student_profiles.find(p => (p.learner_email || '').toLowerCase().trim() === cleanActive) || null;
  const myStudentNum = (myProfile?.student_number || '').trim().toLowerCase();
  const myEnrollments = enrollments.filter(e => {
    const eEmail = (e.learner_email || '').toLowerCase().trim();
    const eNum = (e.student_number || '').toLowerCase().trim();
    return (eEmail && eEmail === cleanActive) || (myStudentNum && eNum && eNum === myStudentNum);
  });
  const myCodes = Array.from(new Set(myEnrollments.map(e => (e.course_code || '').trim()))).filter(Boolean);
  const myCourses = courses.filter(c => {
    const cleanCourseCode = (c.code || '').trim().toLowerCase();
    return myCodes.some(code => code.toLowerCase() === cleanCourseCode);
  });
  const myAssignments = assignments.filter(a => myCodes.includes(a.course_code));
  const mySubmissions = submissions.filter(s => s.learner_email?.toLowerCase().trim() === cleanActive);
  const myAttendance = attendance.filter(a => a.learner_email?.toLowerCase().trim() === cleanActive);

  const activeAttempt = (quiz_attempts || []).find(
    a => a.learner_email?.toLowerCase().trim() === cleanActive && a.status === 'In Progress'
  ) || null;

  const activeQuiz = activeAttempt
    ? (quizzes || []).find(q => String(q.id) === String(activeAttempt.quiz_id)) || null
    : null;

  const myAnnouncements = (announcements || []).filter(a => a && (myCodes || []).includes(a.course_code));
  const myEvents = (calendar_events || []).filter(e => e && (e.target_audience === 'All' || e.target_audience === 'Learner' || (myCodes || []).includes(e.course_code)));
  const myFees = (fees || []).filter(f => f && f.learner_email?.toLowerCase().trim() === cleanActive);
  const myCerts = (certificates || []).filter(c => c && c.learner_email?.toLowerCase().trim() === cleanActive);
  const myMessages = (messages || []).filter(m => m && (m.recipient_email?.toLowerCase().trim() === cleanActive || m.sender_email?.toLowerCase().trim() === cleanActive));
  const myNotifs = (notifications || []).filter(n => n && n.user_email?.toLowerCase().trim() === cleanActive);
  const myLibrary = (library_resources || []).filter(r => {
    if (!r) return false;
    const cleanResCode = String(r.course_code || '').trim().toLowerCase();
    return myCodes.some(c => c.toLowerCase() === cleanResCode);
  });
  const unreadNotifs = myNotifs.filter(n => !n.is_read).length;
  const unreadMsgs = myMessages.filter(m => !m.is_read && m.recipient_email === activeEmail).length;

  const attRate = myAttendance.length
    ? Math.round((myAttendance.filter(a => a.status === 'Present').length / myAttendance.length) * 100)
    : null;
  const submittedIds = mySubmissions.map(s => s.assignment_title);

  // Restore persisted completion state whenever the active learner changes
  useEffect(() => {
    if (cleanActive) {
      setCompletedResources(getCompletedResources(cleanActive));
    }
  }, [cleanActive]);

  /* ── Handlers ────────────────────────── */
  const handleOpenMaterial = (r) => {
    setPreviewMaterial(r);
    const savedNotes = getLearnerStudyNotes(cleanActive, r.id);
    setStudyNotesText(savedNotes);
    recordResourceActivity({
      resourceId: r.id,
      resourceTitle: r.title,
      courseCode: r.course_code,
      learnerEmail: cleanActive,
      learnerName: myProfile?.learner_name,
      action: 'VIEW'
    });
  };

  const handleToggleCompletion = (e, res) => {
    if (e) e.stopPropagation();
    const isDone = toggleResourceCompletion(cleanActive, res.id);
    recordResourceActivity({
      resourceId: res.id,
      resourceTitle: res.title,
      courseCode: res.course_code,
      learnerEmail: cleanActive,
      learnerName: myProfile?.learner_name,
      action: 'COMPLETE'
    });
    setCompletedResources(getCompletedResources(cleanActive));
    showToast(isDone ? `🎉 "${res.title}" marked as completed!` : `"${res.title}" marked as pending.`);
  };

  const downloadMaterial = (r) => {
    if (!r) return;
    recordResourceActivity({
      resourceId: r.id,
      resourceTitle: r.title,
      courseCode: r.course_code,
      learnerEmail: cleanActive,
      learnerName: myProfile?.learner_name,
      action: 'DOWNLOAD'
    });

    const success = safeDownloadResource(r, r.title);
    if (success) {
      showToast(`📥 Downloading "${r.title || 'study material'}"...`);
    } else {
      showToast('⚠️ No downloadable file contents found for this resource.');
    }
  };

  const handleLearnerBatchZip = async () => {
    const allAvailable = myLibrary;
    if (allAvailable.length === 0) {
      alert('No study materials available to package into a ZIP archive.');
      return;
    }
    try {
      setZipDownloading(true);
      setZipProgress('Initializing ZIP...');
      const targetCourse = libraryCourseFilter !== 'All' ? libraryCourseFilter : (myCourses[0]?.code || 'All_Modules');
      const targetResources = libraryCourseFilter !== 'All'
        ? allAvailable.filter(r => String(r.course_code || '').trim().toLowerCase() === libraryCourseFilter.trim().toLowerCase())
        : allAvailable;
      await downloadAllModuleMaterialsAsZip({
        courseCode: targetCourse,
        courseTitle: myCourses.find(c => c.code.trim().toLowerCase() === targetCourse.toLowerCase())?.title || 'Learning Materials',
        resources: targetResources,
        onProgress: setZipProgress
      });
      showToast('📦 Study pack ZIP downloaded successfully!');
    } catch (err) {
      alert(`ZIP Download Notice: ${err.message}`);
    } finally {
      setZipDownloading(false);
      setZipProgress('');
    }
  };

  const handleSubmit = (e, assign) => {
    e.preventDefault();
    createRecord('submissions', {
      assignment_title: assign.title, course_code: assign.course_code,
      learner_name: myProfile?.learner_name || 'Learner',
      learner_email: activeEmail,
      submitted_date: new Date().toISOString().split('T')[0],
      content: submitNotes,
      attachments: submitFiles,
      file_url: submitFiles.length > 0 ? 'attached' : '',
      grade: null, feedback: '', status: 'Submitted'
    });
    setSubmittingId(null); setSubmitNotes(''); setSubmitFiles([]);
    showToast(`Assignment submitted${submitFiles.length > 0 ? ` with ${submitFiles.length} file(s)` : ''} successfully!`);
  };
  const handleProfileSave = (e) => {
    e.preventDefault();
    if (myProfile) updateRecord('student_profiles', myProfile.id, profileForm);
    setEditingProfile(false);
    showToast('Profile updated successfully.');
  };

  /* ── Quiz Taking Handlers ───────────────── */
  const handleStartQuiz = (quiz) => {
    // 1. Check attempt limit from COMPLETED attempts
    const completedAttempts = (quiz_attempts || []).filter(a =>
      String(a.quiz_id) === String(quiz.id) &&
      a.learner_email?.toLowerCase().trim() === cleanActive &&
      a.status === 'Completed'
    );
    const maxAtt = Number(quiz.max_attempts) || 2;
    if (completedAttempts.length >= maxAtt) {
      alert(`You have already completed the maximum attempts allowed (${maxAtt}) for this quiz.`);
      return;
    }

    // Open Pre-Quiz Briefing & Instructions screen
    setPledgeChecked(false);
    setPreQuizBriefing({
      quiz,
      attemptNumber: completedAttempts.length + 1,
      totalAttempts: maxAtt,
      completedAttempts
    });
  };

  const handleLaunchQuizFullscreen = async () => {
    if (!preQuizBriefing || !preQuizBriefing.quiz) return;
    const quiz = preQuizBriefing.quiz;

    // 1. Request full screen
    try {
      if (document.documentElement.requestFullscreen) {
        await document.documentElement.requestFullscreen();
      }
    } catch (err) {
      console.warn('Fullscreen request note:', err);
    }

    // 2. Prepare questions
    let questionsList = Array.isArray(quiz.questions) ? [...quiz.questions] : [];
    if (quiz.randomize_questions) {
      questionsList = questionsList.sort(() => Math.random() - 0.5);
    }

    // 3. Mark any stale uncompleted attempts for this quiz as abandoned
    const staleAttempts = (quiz_attempts || []).filter(a =>
      String(a.quiz_id) === String(quiz.id) &&
      a.learner_email?.toLowerCase().trim() === cleanActive &&
      a.status === 'In Progress'
    );
    for (const stale of staleAttempts) {
      updateRecord('quiz_attempts', stale.id, { status: 'Abandoned' }).catch(() => {});
    }

    // 4. Create new attempt in DB
    const initialAudit = [
      { event: 'QUIZ_STARTED', timestamp: new Date().toISOString(), note: 'Assessment launched in Full Screen mode' }
    ];

    const newAttempt = {
      quiz_id: String(quiz.id),
      course_code: quiz.course_code,
      learner_email: activeEmail,
      learner_name: myProfile?.learner_name || 'Learner',
      started_at: new Date().toISOString(),
      completed_at: null,
      status: 'In Progress',
      score: null,
      answers: {
        responses: {},
        questionsList,
        currentIndex: 0,
        audit_log: initialAudit,
        tab_switch_count: 0,
        fullscreen_exit_count: 0
      }
    };

    const res = await createRecord('quiz_attempts', newAttempt);
    const attemptId = res?.record?.id || Date.now();

    // 5. Initialize active session in local state
    setActiveQuizSession({ ...quiz, questions: questionsList });
    setActiveAttemptId(attemptId);
    setCurrentQuestionIndex(0);
    setQuizResponses({});
    setQuizTimeRemaining(Number(quiz.duration || 45) * 60);
    setAuditLog(initialAudit);
    setTabSwitchCount(0);
    setFullscreenExitCount(0);
    setIsFullscreenOverlayVisible(false);
    setShowNextConfirm(false);
    setShowSubmitConfirm(false);
    setPreQuizBriefing(null);
  };

  // Fullscreen & Proctoring Event Listeners
  React.useEffect(() => {
    if (!activeQuizSession) return;

    const handleFsChange = () => {
      const isFs = !!document.fullscreenElement;
      if (!isFs) {
        setFullscreenExitCount(prev => {
          const next = prev + 1;
          const ev = { event: 'FULLSCREEN_EXITED', timestamp: new Date().toISOString(), note: `Full screen exited (Incident #${next})` };
          setAuditLog(l => [...l, ev]);
          return next;
        });
        setIsFullscreenOverlayVisible(true);
      } else {
        setIsFullscreenOverlayVisible(false);
      }
    };

    const handleVisChange = () => {
      if (document.hidden) {
        setTabSwitchCount(prev => {
          const next = prev + 1;
          const ev = { event: 'TAB_SWITCH_BLUR', timestamp: new Date().toISOString(), note: `Learner switched tab or minimized window (Incident #${next})` };
          setAuditLog(l => [...l, ev]);
          return next;
        });
      } else {
        const ev = { event: 'TAB_RETURNED_FOCUS', timestamp: new Date().toISOString(), note: 'Learner returned to assessment window' };
        setAuditLog(l => [...l, ev]);
      }
    };

    const handleWindowBlur = () => {
      setTabSwitchCount(prev => {
        const next = prev + 1;
        const ev = { event: 'WINDOW_BLUR', timestamp: new Date().toISOString(), note: `Window lost focus (Incident #${next})` };
        setAuditLog(l => [...l, ev]);
        return next;
      });
    };

    document.addEventListener('fullscreenchange', handleFsChange);
    document.addEventListener('visibilitychange', handleVisChange);
    window.addEventListener('blur', handleWindowBlur);

    return () => {
      document.removeEventListener('fullscreenchange', handleFsChange);
      document.removeEventListener('visibilitychange', handleVisChange);
      window.removeEventListener('blur', handleWindowBlur);
    };
  }, [activeQuizSession]);

  // Live Isolated Timer Effect
  React.useEffect(() => {
    if (!activeQuizSession) return;

    const timer = setInterval(() => {
      setQuizTimeRemaining(prev => {
        if (prev <= 1) {
          clearInterval(timer);
          showToast('Time has expired! Submitting your quiz now...');
          submitQuizSession(true);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [activeQuizSession]);

  const handleSelectQuizAnswer = (opt) => {
    setQuizResponses(prev => {
      const updated = { ...prev, [currentQuestionIndex]: opt };
      if (activeAttemptId) {
        updateRecord('quiz_attempts', activeAttemptId, {
          answers: {
            responses: updated,
            questionsList: activeQuizSession?.questions || [],
            currentIndex: currentQuestionIndex,
            audit_log: auditLog,
            tab_switch_count: tabSwitchCount,
            fullscreen_exit_count: fullscreenExitCount
          }
        }).catch(() => {});
      }
      return updated;
    });
  };

  const handleTextAnswerChange = (val) => {
    setQuizResponses(prev => {
      const updated = { ...prev, [currentQuestionIndex]: val };
      if (activeAttemptId) {
        updateRecord('quiz_attempts', activeAttemptId, {
          answers: {
            responses: updated,
            questionsList: activeQuizSession?.questions || [],
            currentIndex: currentQuestionIndex,
            audit_log: auditLog,
            tab_switch_count: tabSwitchCount,
            fullscreen_exit_count: fullscreenExitCount
          }
        }).catch(() => {});
      }
      return updated;
    });
  };

  const handlePrevQuestion = () => {
    setCurrentQuestionIndex(prev => Math.max(0, prev - 1));
  };

  const handleNextQuestionClick = () => {
    if (dontAskAgainForSession) {
      setCurrentQuestionIndex(prev => prev + 1);
    } else {
      setShowNextConfirm(true);
    }
  };

  const confirmNextQuestion = () => {
    setShowNextConfirm(false);
    setCurrentQuestionIndex(prev => prev + 1);
  };

  const handleSkipQuestion = () => {
    setCurrentQuestionIndex(prev => prev + 1);
  };

  const handleNavigateDirect = (targetIdx) => {
    setCurrentQuestionIndex(targetIdx);
  };

  const submitQuizSession = async (isAuto = false) => {
    if (!activeQuizSession) return;
    const quiz = activeQuizSession;
    const questionsList = quiz.questions || [];
    const responses = quizResponses;

    let correctCount = 0;
    let totalMarksAchieved = 0;
    let totalPossibleMarks = 0;

    questionsList.forEach((q, idx) => {
      const marks = Number(q.marks) || 5;
      totalPossibleMarks += marks;
      const given = responses[idx];
      if (q.type === 'multiple-choice') {
        if (given && String(given).trim() === String(q.correct_answer).trim()) {
          correctCount++;
          totalMarksAchieved += marks;
        }
      } else {
        if (given && q.correct_answer && String(given).trim().toLowerCase() === String(q.correct_answer).trim().toLowerCase()) {
          correctCount++;
          totalMarksAchieved += marks;
        }
      }
    });

    const percent = totalPossibleMarks > 0
      ? Math.round((totalMarksAchieved / totalPossibleMarks) * 100)
      : Math.round((correctCount / questionsList.length) * 100);

    const finalAudit = [
      ...auditLog,
      { event: 'QUIZ_SUBMITTED', timestamp: new Date().toISOString(), note: `Submitted with score ${percent}% (${isAuto ? 'Auto-submitted' : 'Manual'})` }
    ];

    const timeSpent = Math.max(0, (Number(quiz.duration || 45) * 60) - quizTimeRemaining);

    // 1. Update quiz_attempts in DB
    if (activeAttemptId) {
      await updateRecord('quiz_attempts', activeAttemptId, {
        status: 'Completed',
        completed_at: new Date().toISOString(),
        score: percent,
        answers: {
          responses,
          questionsList,
          audit_log: finalAudit,
          tab_switch_count: tabSwitchCount,
          fullscreen_exit_count: fullscreenExitCount,
          time_spent_seconds: timeSpent
        }
      });
    }

    // 2. Record submission - AUTOMATICALLY SUBMIT/RETAIN HIGHEST MARK ONLY (no duplicate entries)
    try {
      const cleanQuizTitle = (quiz.title || '').trim().toLowerCase();
      const existingSubs = (submissions || []).filter(s =>
        (s.learner_email || '').toLowerCase().trim() === cleanActive &&
        (s.course_code || '').toUpperCase().trim() === (quiz.course_code || '').toUpperCase().trim() &&
        ((s.assignment_title || '').trim().toLowerCase() === cleanQuizTitle ||
         (typeof s.content === 'string' && s.content.includes(String(quiz.id))))
      );

      const existingBest = existingSubs.length > 0
        ? Math.max(...existingSubs.map(s => Number(s.grade) || 0))
        : null;

      const highestMark = existingBest !== null ? Math.max(existingBest, percent) : percent;

      const submissionPayload = {
        assignment_title: quiz.title,
        course_code: quiz.course_code,
        learner_email: activeEmail,
        learner_name: myProfile?.learner_name || 'Learner',
        submitted_date: new Date().toISOString().split('T')[0],
        content: JSON.stringify({
          quiz_id: quiz.id,
          score: highestMark,
          latest_attempt_score: percent,
          correct_count: correctCount,
          total_questions: questionsList.length,
          total_marks: totalPossibleMarks,
          marks_achieved: totalMarksAchieved,
          is_auto_submitted: isAuto
        }),
        grade: highestMark,
        feedback: `Quiz completed. Highest Score Achieved: ${highestMark}%. ${percent < highestMark ? `(This attempt scored ${percent}%; higher score of ${highestMark}% retained).` : `(New highest score recorded: ${highestMark}%).`} ${isAuto ? 'Auto-submitted on time expiry.' : ''}`,
        status: 'Graded',
        attachments: []
      };

      if (existingSubs.length > 0) {
        // Update the primary existing submission record with the highest mark
        const primarySub = existingSubs[0];
        await updateRecord('submissions', primarySub.id, submissionPayload);

        // If duplicate submission rows exist from prior attempts, delete the duplicates to ensure single record
        if (existingSubs.length > 1) {
          for (let i = 1; i < existingSubs.length; i++) {
            try {
              if (deleteRecord) {
                await deleteRecord('submissions', existingSubs[i].id);
              }
            } catch (_) {}
          }
        }
      } else {
        await createRecord('submissions', submissionPayload);
      }
    } catch (err) {
      console.warn('Submissions record note:', err);
    }

    // 3. Exit full screen
    try {
      if (document.fullscreenElement && document.exitFullscreen) {
        await document.exitFullscreen();
      }
    } catch (_) {}

    // Check if review should be shown (if enabled and 1 attempt)
    const showAnswers = quiz.show_answers_on_completion ?? quiz.questions?.[0]?._meta?.show_answers_on_completion ?? false;
    const canReview = !!showAnswers && Number(quiz.max_attempts) === 1;

    setQuizCompletedScore(percent);
    if (canReview) {
      setReviewAnswersModal({
        quiz,
        questionsList,
        responses,
        score: percent,
        correctCount,
        totalMarksAchieved,
        totalPossibleMarks
      });
    }

    // Reset active quiz session
    setActiveQuizSession(null);
    setActiveAttemptId(null);
    setCurrentQuestionIndex(0);
    setQuizResponses({});
    setAuditLog([]);
    setShowSubmitConfirm(false);
    setShowNextConfirm(false);
    setIsFullscreenOverlayVisible(false);
  };
  const handleSendMsg = (e) => {
    e.preventDefault();
    const recipientMap = {
      'Administration': 'admin@nexa-transform.com',
      'Finance Office': 'finance@nexa-transform.com',
      'Student Support': 'support@nexa-transform.com',
    };
    createRecord('messages', {
      sender_email: activeEmail, sender_name: myProfile?.learner_name || 'Learner',
      sender_role: 'Learner', recipient_email: recipientMap[msgForm.to] || recipientMap['Administration'],
      recipient_name: msgForm.to, subject: msgForm.subject, content: msgForm.content,
      is_read: false, message_type: 'Direct'
    });
    setComposingMsg(false); setMsgForm({ to: 'Administration', subject: '', content: '' });
    showToast('Message sent!');
  };
  /* ── Nav Tabs ────────────────────────── */
  const tabs = [
    { id: 'overview',      label: 'Overview',     icon: <IcoCheck size={16} /> },
    { id: 'lessons',       label: 'Class Recordings', icon: <IcoPlay size={16} /> },
    { id: 'poe',           label: 'Portfolio of Evidence (PoE)', icon: <IcoAward size={16} /> },
    { id: 'courses',       label: 'My Courses',   icon: <IcoBook size={16} /> },
    { id: 'assignments',   label: 'Assignments',  icon: <IcoFile size={16} /> },
    { id: 'quizzes',       label: 'Quizzes',      icon: <IcoHelp size={16} /> },
    { id: 'grades',        label: 'Grades',       icon: <IcoAward size={16} /> },
    { id: 'attendance',    label: 'Attendance',   icon: <IcoClock size={16} /> },
    { id: 'calendar',      label: 'Calendar',     icon: <IcoCalendar size={16} /> },
    { id: 'library',       label: 'Library',      icon: <IcoBook size={16} /> },
    { id: 'fees',          label: 'Fees',         icon: <IcoWallet size={16} /> },
    { id: 'certificates',  label: 'Certificates', icon: <IcoAward size={16} /> },
    { id: 'profile',       label: 'My Profile',   icon: <IcoUser size={16} /> },
    { id: 'messages',      label: 'Messages',     icon: <IcoMail size={16} />, badge: unreadMsgs || null },
    { id: 'notifications', label: 'Notifications',icon: <IcoBell size={16} />, badge: unreadNotifs || null },
  ];

  const bottomTabs = [
    { id: 'overview',    label: 'Home',    icon: <IcoCheck size={18} /> },
    { id: 'poe',         label: 'PoE',     icon: <IcoAward size={18} /> },
    { id: 'lessons',     label: 'Classes', icon: <IcoPlay size={18} /> },
    { id: 'library',     label: 'Library', icon: <IcoBook size={18} /> },
    { id: 'assignments', label: 'Tasks',   icon: <IcoFile size={18} /> },
    { id: 'quizzes',     label: 'Quizzes', icon: <IcoHelp size={18} /> },
  ];

  const [resetSent, setResetSent] = useState(false);
  const handleResetPassword = async (e) => {
    e.preventDefault();
    if (!loginEmail || !loginEmail.trim()) {
      setLoginErr('Please enter your email address above first.');
      return;
    }
    const cleanEmail = loginEmail.trim().toLowerCase();
    if (!isDeliverableEmail(cleanEmail)) {
      setLoginErr('Please enter a valid, deliverable email address.');
      return;
    }

    const siteOrigin = window.location.origin;
    const { error } = await safeSupabasePasswordReset(supabase, cleanEmail, `${siteOrigin}/auth/callback`);
    if (error) {
      setLoginErr(`Reset error: ${error.message}`);
    } else {
      setLoginErr('');
      setResetSent(true);
    }
  };

  const [newPasswordInput, setNewPasswordInput] = useState('');
  const generateRandomPassword = () => {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz23456789#@!';
    let pwd = 'NX-';
    for (let i = 0; i < 8; i++) pwd += chars.charAt(Math.floor(Math.random() * chars.length));
    setNewPasswordInput(pwd);
  };

  const handleSaveCustomPassword = async (e) => {
    e.preventDefault();
    if (!newPasswordInput || newPasswordInput.length < 6) {
      alert('Password must be at least 6 characters.');
      return;
    }
    if (myProfile) {
      updateRecord('student_profiles', myProfile.id, { custom_password: newPasswordInput });
    }
    try {
      await supabase.auth.updateUser({ password: newPasswordInput });
    } catch (e) {}
    showToast(`Custom password updated successfully! Your student number (${myProfile?.student_number}) remains unchanged.`);
    setNewPasswordInput('');
  };

  /* ── Login Screen ────────────────────── */
  if (!loggedIn) {
    return (
      <div className="lmis-login-overlay">
        <div className="lmis-login-bg" />
        <div className="lmis-login-card">
          <img src="/logo.svg" alt="NX" className="lmis-login-logo" />
          <h2 className="lmis-login-title">Learner Portal</h2>
          <p className="lmis-login-sub">NexaTransform Hub LMIS</p>

          {sessionExpiredNotice && (
            <div style={{
              background: 'rgba(239, 68, 68, 0.12)',
              border: '1px solid rgba(239, 68, 68, 0.3)',
              borderRadius: '8px',
              padding: '0.75rem 1rem',
              marginTop: '1rem',
              marginBottom: '0.5rem',
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

          {resetSent ? (
            <>
              <div style={{ marginTop:'1.5rem', padding:'1rem', background:'rgba(34,197,94,0.15)', border:'1px solid rgba(34,197,94,0.4)', borderRadius:'0.75rem', color:'#86efac', textAlign:'center' }}>
                <p style={{ margin:0, fontWeight:600 }}>✓ Reset email sent!</p>
                <p style={{ margin:'0.5rem 0 0', fontSize:'0.85rem', opacity:0.9 }}>
                  Check your inbox at <strong>{loginEmail}</strong> and click the link to set a new password.
                </p>
              </div>
              <button className="lmis-login-btn" style={{ marginTop:'1.25rem' }} onClick={() => setResetSent(false)}>← Back to Sign In</button>
            </>
          ) : (
            <>
              <p className="lmis-login-role">Sign in with your registered email and password / student number</p>
              <form onSubmit={handleLogin} className="lmis-login-form">
                <div className="lmis-form-group">
                  <label className="lmis-form-label">Email Address</label>
                  <input
                    type="email"
                    className="lmis-form-input"
                    placeholder="your.email@nexatransform.com"
                    value={loginEmail}
                    onChange={e => setLoginEmail(e.target.value)}
                    autoCapitalize="none"
                    autoCorrect="off"
                    spellCheck="false"
                    required
                  />
                </div>
                <div className="lmis-form-group">
                  <label className="lmis-form-label">Password / Student Number</label>
                  <div className="lmis-password-wrapper">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      className="lmis-form-input"
                      placeholder="Enter password or Student ID"
                      value={loginStudentId}
                      onChange={e => setLoginStudentId(e.target.value)}
                      autoCapitalize="none"
                      autoCorrect="off"
                      spellCheck="false"
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
                <button type="submit" className="lmis-login-btn" disabled={loginLoading}>
                  {loginLoading ? 'Signing In…' : 'Sign In →'}
                </button>
                <button type="button" onClick={handleResetPassword} className="btn btn-sm btn-ghost"
                  style={{ marginTop: '0.5rem', color: '#c9a34e', width: '100%', fontSize: '0.78rem' }}>
                  🔑 Forgot Password? Send Reset Email
                </button>
              </form>
            </>
          )}

          <p className="lmis-login-back">
            Wrong portal? <Link to="/lmis">Choose another</Link>
          </p>
        </div>
      </div>
    );
  }


  /* ── Authenticated Dashboard ─────────── */
  return (
    <LmisShell
      role="Learner"
      userName={myProfile?.learner_name}
      activeTab={activeTab}
      onTabChange={setActiveTab}
      tabs={tabs}
      mobileBottomTabs={bottomTabs}
      onRefresh={refreshData}
      syncStatus={syncStatus}
      onLogout={handleLogout}
    >
            {toast && <div className="lmis-toast">{toast}</div>}

      {/* ── AUTOMATED DUE DATE URGENT ALERT BANNER ── */}
      {myAssignments.some(a => {
        const days = daysLeft(a.due_date);
        return days !== null && days >= 0 && days <= 2 && !submittedIds.includes(a.title);
      }) && (
        <div style={{
          background: 'linear-gradient(90deg, #991b1b, #b91c1c)',
          color: '#ffffff',
          padding: '0.85rem 1.25rem',
          borderRadius: '8px',
          marginBottom: '1.25rem',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          boxShadow: '0 4px 6px -1px rgba(185, 28, 28, 0.2)',
          flexWrap: 'wrap',
          gap: '0.5rem'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
            <span style={{ fontSize: '1.25rem' }}>⏰</span>
            <div>
              <div style={{ fontWeight: 800, fontSize: '0.85rem' }}>
                URGENT DEADLINE ALERT: Action Required
              </div>
              <div style={{ fontSize: '0.75rem', opacity: 0.9 }}>
                You have upcoming assignment(s) due within 48 hours. Please finalize and submit your deliverables.
              </div>
            </div>
          </div>
          <button
            type="button"
            onClick={() => setActiveTab('assignments')}
            style={{
              background: '#ffffff',
              color: '#b91c1c',
              border: 'none',
              borderRadius: '6px',
              padding: '0.4rem 0.85rem',
              fontWeight: 700,
              fontSize: '0.75rem',
              cursor: 'pointer'
            }}
          >
            View Pending Tasks →
          </button>
        </div>
      )}

      
      {/* CLASS RECORDINGS HUB — Dynamic, powered by library_resources */}
      {activeTab === 'lessons' && (() => {
        const classRecordings = (myLibrary || []).filter(r =>
          r.type === 'Video' || r.type === 'video'
        );
        const filteredRecordings = recordingCourseFilter === 'All'
          ? classRecordings
          : classRecordings.filter(r => (r.course_code || '').trim().toLowerCase() === recordingCourseFilter.toLowerCase());
        const activeRec = filteredRecordings.find(r => r.id === activeLessonId) || filteredRecordings[0] || null;
        const watchedCount = filteredRecordings.filter(r => completedResources[r.id]).length;
        return (
          <div>
            <div className="lmis-page-header flex-between" style={{ flexWrap: 'wrap', gap: '1rem' }}>
              <div>
                <h1 className="lmis-page-title">🎥 Class Recordings</h1>
                <p className="lmis-page-sub">Watch and download your facilitator-uploaded online class recordings.</p>
              </div>
              {filteredRecordings.length > 0 && (
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', background: '#f8fafc', padding: '0.5rem 1rem', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                  <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#334155' }}>Watched:</div>
                  <div style={{ width: '100px', height: '8px', background: '#e2e8f0', borderRadius: '4px', overflow: 'hidden' }}>
                    <div style={{ width: `${Math.round((watchedCount / filteredRecordings.length) * 100)}%`, height: '100%', background: 'linear-gradient(90deg, var(--teal), var(--emerald))', transition: 'width 0.5s ease' }} />
                  </div>
                  <span style={{ fontSize: '0.82rem', fontWeight: 800, color: 'var(--emerald)' }}>{watchedCount}/{filteredRecordings.length}</span>
                </div>
              )}
            </div>

            {/* Module filter */}
            {myCourses.length > 1 && (
              <div style={{ marginBottom: '1rem', display: 'flex', gap: '0.5rem', flexWrap: 'wrap', alignItems: 'center' }}>
                <span style={{ fontSize: '0.72rem', fontWeight: 700, color: 'var(--text-sub)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Filter by module:</span>
                {['All', ...myCourses.map(c => c.code)].map(code => (
                  <button
                    key={code}
                    type="button"
                    className={`btn btn-sm ${recordingCourseFilter === code ? 'btn-primary' : 'btn-outline'}`}
                    onClick={() => setRecordingCourseFilter(code)}
                  >
                    {code === 'All' ? 'All Modules' : (myCourses.find(c => c.code === code)?.title || code)}
                  </button>
                ))}
              </div>
            )}

            {classRecordings.length === 0 ? (
              <div className="lmis-empty" style={{ padding: '3rem 2rem', textAlign: 'center' }}>
                <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🎬</div>
                <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--navy)', marginBottom: '0.5rem' }}>No class recordings yet</h3>
                <p style={{ fontSize: '0.88rem', color: 'var(--text-sub)', maxWidth: '400px', margin: '0 auto' }}>
                  Your facilitator hasn't uploaded any online class recordings yet. Check back after your next online session.
                </p>
              </div>
            ) : filteredRecordings.length === 0 ? (
              <div className="lmis-empty" style={{ padding: '2rem', textAlign: 'center' }}>
                <p style={{ fontSize: '0.88rem', color: 'var(--text-sub)' }}>No recordings for this module yet.</p>
              </div>
            ) : (
              <div className="lmis-2col" style={{ gridTemplateColumns: '1fr 320px', gap: '1.25rem', alignItems: 'start' }}>
                {/* Left: Video player */}
                <div>
                  {activeRec && (
                    <div className="lmis-card mb-4" style={{ overflow: 'hidden' }}>
                      {/* Player */}
                      <div style={{ position: 'relative', width: '100%', paddingTop: '56.25%', background: '#0f172a', borderRadius: '8px 8px 0 0', overflow: 'hidden' }}>
                        {activeRec.video_url ? (
                          <iframe
                            key={activeRec.id}
                            title={activeRec.title}
                            style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', border: 'none' }}
                            src={activeRec.video_url.includes('youtube.com/watch?v=')
                              ? `https://www.youtube.com/embed/${activeRec.video_url.split('v=')[1]?.split('&')[0]}`
                              : activeRec.video_url.includes('youtu.be/')
                              ? `https://www.youtube.com/embed/${activeRec.video_url.split('youtu.be/')[1]?.split('?')[0]}`
                              : activeRec.video_url}
                            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                            allowFullScreen
                          />
                        ) : activeRec.file_url ? (
                          <video
                            key={activeRec.id}
                            controls
                            style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', background: '#000' }}
                            src={activeRec.file_url}
                          >
                            Your browser does not support the video tag.
                          </video>
                        ) : (activeRec.attachments || []).find(a => /\.(mp4|webm|mov|avi)/i.test(a.name)) ? (
                          <video
                            key={activeRec.id}
                            controls
                            style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', background: '#000' }}
                            src={(activeRec.attachments || []).find(a => /\.(mp4|webm|mov|avi)/i.test(a.name))?.url}
                          >
                            Your browser does not support the video tag.
                          </video>
                        ) : (
                          <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%,-50%)', textAlign: 'center', color: '#94a3b8' }}>
                            <div style={{ fontSize: '2.5rem', marginBottom: '0.5rem' }}>🎬</div>
                            <p style={{ fontSize: '0.82rem' }}>Recording link not yet attached by facilitator.</p>
                          </div>
                        )}
                      </div>
                      {/* Info bar */}
                      <div className="lmis-card-body">
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.5rem', marginBottom: '0.75rem' }}>
                          <div>
                            {activeRec.unit_or_week && (
                              <span className="badge badge-gold" style={{ marginBottom: '0.35rem', display: 'inline-block', fontSize: '0.68rem' }}>{activeRec.unit_or_week}</span>
                            )}
                            <h3 style={{ fontSize: '1.1rem', fontWeight: 800, color: 'var(--primary-navy)', margin: 0 }}>{activeRec.title}</h3>
                          </div>
                          <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', flexWrap: 'wrap' }}>
                            {/* Download button */}
                            {(activeRec.file_url || (activeRec.attachments || []).length > 0) && (
                              <button
                                type="button"
                                className="btn btn-sm btn-outline"
                                onClick={() => downloadMaterial(activeRec)}
                              >
                                <IcoDl size={14} /> Download Recording
                              </button>
                            )}
                            {/* Mark as watched */}
                            <button
                              type="button"
                              className={`btn btn-sm ${completedResources[activeRec.id] ? 'btn-emerald' : 'btn-outline'}`}
                              onClick={(e) => handleToggleCompletion(e, activeRec)}
                            >
                              {completedResources[activeRec.id] ? '✓ Watched' : 'Mark as Watched'}
                            </button>
                          </div>
                        </div>
                        {activeRec.description && (
                          <p style={{ fontSize: '0.83rem', color: 'var(--text-sub)', lineHeight: 1.6, marginBottom: '0.5rem' }}>{activeRec.description}</p>
                        )}
                      </div>
                    </div>
                  )}
                </div>

                {/* Right: Playlist */}
                <div>
                  <div className="lmis-card">
                    <div className="lmis-card-header flex-between">
                      <span className="lmis-card-title">Recordings Playlist</span>
                      <span className="badge badge-teal">{watchedCount} / {filteredRecordings.length} Watched</span>
                    </div>
                    <div className="lmis-card-body" style={{ padding: '0.5rem' }}>
                      {filteredRecordings.map((rec) => (
                        <div
                          key={rec.id}
                          onClick={() => { setActiveLessonId(rec.id); handleOpenMaterial(rec); }}
                          style={{
                            padding: '0.75rem',
                            borderRadius: '6px',
                            marginBottom: '0.4rem',
                            cursor: 'pointer',
                            background: (activeRec?.id === rec.id) ? 'rgba(6,182,212,0.07)' : '#fff',
                            border: (activeRec?.id === rec.id) ? '1px solid var(--teal)' : '1px solid #e2e8f0',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            gap: '0.5rem'
                          }}
                        >
                          <div style={{ flex: 1, minWidth: 0 }}>
                            <div style={{ fontSize: '0.78rem', fontWeight: 700, color: (activeRec?.id === rec.id) ? 'var(--teal)' : '#334155', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                              {rec.title}
                            </div>
                            {rec.unit_or_week && rec.unit_or_week !== rec.title && (
                              <div style={{ fontSize: '0.65rem', color: '#64748b', marginTop: '0.2rem' }}>{rec.unit_or_week}</div>
                            )}
                          </div>
                          <div>
                            {completedResources[rec.id] ? (
                              <span style={{ color: 'var(--emerald)', fontSize: '0.9rem', fontWeight: 700 }}>✓</span>
                            ) : (
                              <span style={{ color: '#94a3b8', fontSize: '0.75rem' }}>▶</span>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        );
      })()}

            {/* PORTFOLIO OF EVIDENCE (POE) & ACADEMIC PROGRESS REPORT */}
      {activeTab === 'poe' && (() => {
        // Learner-specific live data calculations
        const myQuizAttempts = (quiz_attempts || []).filter(q => q.learner_email?.toLowerCase().trim() === cleanActive);
        const myRelevantQuizzes = (quizzes || []).filter(q => myCodes.some(c => c.toLowerCase() === (q.course_code || '').trim().toLowerCase()));

        // Graded assignments & averages
        const myGradedSubs = mySubmissions.filter(s => s.grade !== undefined && s.grade !== null && s.grade !== '');
        const myAvgAssignmentScore = myGradedSubs.length > 0
          ? Math.round(myGradedSubs.reduce((acc, s) => acc + Number(s.grade || 0), 0) / myGradedSubs.length)
          : null;

        // Quizzes & test marks
        const myValidQuizAttempts = myQuizAttempts.filter(a => a.score !== undefined && a.score !== null);
        const myAvgQuizScore = myValidQuizAttempts.length > 0
          ? Math.round(myValidQuizAttempts.reduce((acc, a) => acc + Number(a.score || 0), 0) / myValidQuizAttempts.length)
          : null;

        // Real overall task progress (deduplicated completed tasks vs total required)
        const uniqueSubmittedTitles = Array.from(new Set(mySubmissions.map(s => (s.assignment_title || '').trim().toLowerCase()))).filter(Boolean);
        const uniqueCompletedQuizIds = Array.from(new Set(myQuizAttempts.filter(a => a.status === 'Completed').map(a => String(a.quiz_id)))).filter(Boolean);
        const expectedTasksCount = Math.max(1, myAssignments.length + myRelevantQuizzes.length);
        const completedTasksCount = uniqueSubmittedTitles.length + uniqueCompletedQuizIds.length;
        const realProgressPct = Math.min(100, Math.round((completedTasksCount / expectedTasksCount) * 100));

        // Real PoE Evaluated Status from database
        const officialPoeStatus = myProfile?.poe_status;
        const competencyStatus = officialPoeStatus || (
          completedTasksCount >= expectedTasksCount && expectedTasksCount > 0
            ? 'PORTFOLIO COMPLETE · PENDING FACILITATOR EVALUATION'
            : completedTasksCount > 0
              ? `IN PROGRESS (${completedTasksCount}/${expectedTasksCount} Tasks Completed)`
              : 'ENROLLED & ACTIVE'
        );
        // Statutory documents counts
        const idAtts = Array.isArray(myProfile?.id_copy_attachments) ? myProfile.id_copy_attachments : [];
        const qualAtts = Array.isArray(myProfile?.qualification_proof_attachments) ? myProfile.qualification_proof_attachments : [];
        const bankAtts = Array.isArray(myProfile?.bank_proof_attachments) ? myProfile.bank_proof_attachments : [];
        const addrAtts = Array.isArray(myProfile?.address_proof_attachments) ? myProfile.address_proof_attachments : [];
        const extraPoeAtts = Array.isArray(myProfile?.poe_additional_attachments) ? myProfile.poe_additional_attachments : [];

        const statutoryAttachedCount = (idAtts.length > 0 ? 1 : 0) + (qualAtts.length > 0 ? 1 : 0) + (bankAtts.length > 0 ? 1 : 0) + (addrAtts.length > 0 ? 1 : 0);
        const totalAllAttachments = idAtts.length + qualAtts.length + bankAtts.length + addrAtts.length + extraPoeAtts.length;

        // Speedometer Arc calculation (circumference of radius 55 = ~172.8 mm)
        const gaugeCircumference = 173;
        const gaugeOffset = gaugeCircumference - (gaugeCircumference * (realProgressPct / 100));

        return (
          <div>
            {/* Page Header */}
            <div className="lmis-page-header flex-between" style={{ flexWrap: 'wrap', gap: '1rem' }}>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '0.25rem' }}>
                  <span className="badge badge-gold">OFFICIAL POE &amp; PROGRESS REPORT</span>
                  <span className="badge badge-navy">Learner ID: {myProfile?.student_number || 'NX-2026'}</span>
                </div>
                <h1 className="lmis-page-title">Portfolio of Evidence (PoE) &amp; Progress Report</h1>
                <p className="lmis-page-sub">
                  Learner: <strong>{myProfile?.learner_name || 'Enrolled Learner'}</strong> · Programme: <strong>{myProfile?.programme_enrolled || 'Business Process & Work Study Management'}</strong>
                </p>
              </div>
              <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                <button
                  type="button"
                  className="btn btn-sm btn-primary"
                  style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontWeight: 700 }}
                  onClick={async () => {
                    try {
                      showToast('Generating official Portfolio of Evidence with Table of Contents & Evidence Pages...');
                      await generatePoePDF(
                        myProfile || { learner_name: 'Learner', student_number: 'NX-2026-001', learner_email: cleanActive },
                        {
                          courses: myCourses,
                          assignments: myAssignments,
                          submissions: mySubmissions,
                          quizzes: myRelevantQuizzes,
                          quizAttempts: myQuizAttempts,
                          learnerSignatureDataUrl: learnerSignature,
                          overallScore: realProgressPct
                        }
                      );
                      showToast('Official PoE PDF generated & downloaded with attached evidence exhibits!');
                    } catch (err) {
                      console.error('PoE PDF Generation Error:', err);
                      showToast('Error generating PDF. Please check console.');
                    }
                  }}
                >
                  <IcoDl size={14} /> Download Official PoE (PDF)
                </button>
                <button type="button" className="btn btn-sm btn-outline" onClick={() => window.print()}>
                  🖨 Print View
                </button>
              </div>
            </div>

            {/* Quick Navigation / Table of Contents Bar */}
            <div style={{ display: 'flex', gap: '0.4rem', marginBottom: '1.25rem', overflowX: 'auto', paddingBottom: '0.25rem', borderBottom: '1px solid var(--ice2)' }}>
              {[
                { id: 'ALL', label: '📋 Master Overview' },
                { id: 'REPORT', label: '📊 Modular Progress Report' },
                { id: 'MODULES', label: `📚 Registered Modules (${myCourses.length})` },
                { id: 'EVIDENCE', label: `📎 Matric & Statutory Documents (${totalAllAttachments})` },
                { id: 'DECLARATION', label: '✍️ Authenticity Declaration' },
                { id: 'MODERATION', label: '🏛️ Facilitator & IQA Review' }
              ].map(tab => (
                <button
                  key={tab.id}
                  type="button"
                  className={`btn btn-xs ${activePoeCategory === tab.id ? 'btn-gold' : 'btn-outline'}`}
                  style={{ whiteSpace: 'nowrap' }}
                  onClick={() => setActivePoeCategory(tab.id)}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            {/* ── REAL DYNAMIC POE SPEEDOMETER & SUMMARY BANNER ── */}
            {(activePoeCategory === 'ALL' || activePoeCategory === 'REPORT') && (
              <div className="lmis-card mb-4" style={{ background: 'linear-gradient(135deg, #0a192f 0%, #0f172a 100%)', color: '#fff', border: '1px solid var(--gold)' }}>
                <div className="lmis-card-body" style={{ padding: '1.5rem', display: 'flex', flexWrap: 'wrap', gap: '2rem', alignItems: 'center' }}>
                  {/* Dynamic Radial Speedometer Gauge */}
                  <div style={{ textAlign: 'center', minWidth: '160px', margin: '0 auto' }}>
                    <svg width="150" height="110" viewBox="0 0 150 110">
                      {/* Background Arc */}
                      <path d="M 20 95 A 55 55 0 0 1 130 95" fill="none" stroke="rgba(255,255,255,0.15)" strokeWidth="12" strokeLinecap="round" />
                      {/* Dynamic Progress Arc */}
                      <path
                        d="M 20 95 A 55 55 0 0 1 130 95"
                        fill="none"
                        stroke="url(#poeGoldGradient)"
                        strokeWidth="12"
                        strokeLinecap="round"
                        strokeDasharray={gaugeCircumference}
                        strokeDashoffset={gaugeOffset}
                        style={{ transition: 'stroke-dashoffset 0.8s ease' }}
                      />
                      <defs>
                        <linearGradient id="poeGoldGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                          <stop offset="0%" stopColor="#ca8a04" />
                          <stop offset="100%" stopColor="#10b981" />
                        </linearGradient>
                      </defs>
                      <text x="75" y="85" textAnchor="middle" fill="#fff" fontSize="24" fontWeight="800">
                        {realProgressPct}%
                      </text>
                      <text x="75" y="101" textAnchor="middle" fill="var(--teal)" fontSize="9" fontWeight="700">
                        LIVE PROGRESS
                      </text>
                    </svg>
                    <div style={{ fontSize: '0.72rem', color: '#cbd5e1', fontWeight: 600, marginTop: '0.2rem' }}>
                      Status: <strong style={{ color: realProgressPct >= 50 ? 'var(--emerald)' : 'var(--gold)' }}>{competencyStatus}</strong>
                    </div>
                  </div>

                  {/* Real Live Metrics Breakdown */}
                  <div style={{ flex: 1, minWidth: '260px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem', flexWrap: 'wrap', gap: '0.5rem' }}>
                      <h3 style={{ fontSize: '1.05rem', fontWeight: 800, color: '#fff', margin: 0 }}>
                        Real-Time Academic Performance Ledger
                      </h3>
                      <span className={`badge ${realProgressPct >= 50 ? 'badge-emerald' : 'badge-gold'}`}>
                        {competencyStatus}
                      </span>
                    </div>
                    <p style={{ fontSize: '0.78rem', color: '#94a3b8', lineHeight: 1.5, margin: '0 0 1rem 0' }}>
                      This Portfolio of Evidence dynamically mirrors your live LMS submissions, assignment marks, quiz attempts, and verified statutory documents for <strong>{myProfile?.learner_name || 'your profile'}</strong>.
                    </p>

                    {/* KPI Badges */}
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: '0.6rem' }}>
                      <div style={{ background: 'rgba(255,255,255,0.06)', padding: '0.5rem 0.75rem', borderRadius: '6px', border: '1px solid rgba(255,255,255,0.1)' }}>
                        <div style={{ fontSize: '0.65rem', color: '#94a3b8', textTransform: 'uppercase' }}>Registered Modules</div>
                        <div style={{ fontSize: '1.1rem', fontWeight: 800, color: '#fff' }}>{myCourses.length}</div>
                      </div>
                      <div style={{ background: 'rgba(255,255,255,0.06)', padding: '0.5rem 0.75rem', borderRadius: '6px', border: '1px solid rgba(255,255,255,0.1)' }}>
                        <div style={{ fontSize: '0.65rem', color: '#94a3b8', textTransform: 'uppercase' }}>Assignments Done</div>
                        <div style={{ fontSize: '1.1rem', fontWeight: 800, color: 'var(--gold)' }}>{mySubmissions.length} / {myAssignments.length || '—'}</div>
                      </div>
                      <div style={{ background: 'rgba(255,255,255,0.06)', padding: '0.5rem 0.75rem', borderRadius: '6px', border: '1px solid rgba(255,255,255,0.1)' }}>
                        <div style={{ fontSize: '0.65rem', color: '#94a3b8', textTransform: 'uppercase' }}>Avg Assignment Mark</div>
                        <div style={{ fontSize: '1.1rem', fontWeight: 800, color: 'var(--emerald)' }}>{myAvgAssignmentScore !== null ? `${myAvgAssignmentScore}%` : 'Pending'}</div>
                      </div>
                      <div style={{ background: 'rgba(255,255,255,0.06)', padding: '0.5rem 0.75rem', borderRadius: '6px', border: '1px solid rgba(255,255,255,0.1)' }}>
                        <div style={{ fontSize: '0.65rem', color: '#94a3b8', textTransform: 'uppercase' }}>Quizzes Attempted</div>
                        <div style={{ fontSize: '1.1rem', fontWeight: 800, color: 'var(--teal)' }}>{myQuizAttempts.length} / {myRelevantQuizzes.length || '—'}</div>
                      </div>
                      <div style={{ background: 'rgba(255,255,255,0.06)', padding: '0.5rem 0.75rem', borderRadius: '6px', border: '1px solid rgba(255,255,255,0.1)' }}>
                        <div style={{ fontSize: '0.65rem', color: '#94a3b8', textTransform: 'uppercase' }}>Statutory Documents</div>
                        <div style={{ fontSize: '1.1rem', fontWeight: 800, color: statutoryAttachedCount >= 3 ? 'var(--emerald)' : '#f59e0b' }}>{statutoryAttachedCount} / 4 Attached</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* ── SECTION 1 & 2: LEARNER DEMOGRAPHICS & REGISTERED MODULES ── */}
            {(activePoeCategory === 'ALL' || activePoeCategory === 'REPORT') && (
              <div className="lmis-2col mb-4" style={{ gap: '1rem' }}>
                {/* Learner Demographics */}
                <div className="lmis-card">
                  <div className="lmis-card-header flex-between" style={{ borderBottom: '1px solid var(--ice2)' }}>
                    <span className="lmis-card-title">1. Learner Profile &amp; Demographics</span>
                    <span className="badge badge-navy">{myProfile?.student_number || 'NX2026'}</span>
                  </div>
                  <div className="lmis-card-body" style={{ fontSize: '0.78rem' }}>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.6rem' }}>
                      <div><strong style={{ color: 'var(--text-sub)' }}>Full Names:</strong> <div>{myProfile?.learner_name || '—'}</div></div>
                      <div><strong style={{ color: 'var(--text-sub)' }}>Student Number:</strong> <div style={{ color: 'var(--gold)', fontWeight: 700 }}>{myProfile?.student_number || '—'}</div></div>
                      <div><strong style={{ color: 'var(--text-sub)' }}>ID / Passport No:</strong> <div>{myProfile?.id_passport || '—'}</div></div>
                      <div><strong style={{ color: 'var(--text-sub)' }}>Email Address:</strong> <div>{cleanActive}</div></div>
                      <div><strong style={{ color: 'var(--text-sub)' }}>Contact Number:</strong> <div>{myProfile?.phone || '—'}</div></div>
                      <div><strong style={{ color: 'var(--text-sub)' }}>Gender &amp; Age:</strong> <div>{myProfile?.gender || '—'} {myProfile?.age ? `(${myProfile.age} yrs)` : ''}</div></div>
                      <div><strong style={{ color: 'var(--text-sub)' }}>Province:</strong> <div>{myProfile?.province || 'Gauteng'}</div></div>
                      <div><strong style={{ color: 'var(--text-sub)' }}>Highest Qualification:</strong> <div>{myProfile?.highest_qualification || 'Matric / Grade 12'}</div></div>
                      <div style={{ gridColumn: '1/-1' }}><strong style={{ color: 'var(--text-sub)' }}>Secondary School:</strong> <div>{myProfile?.previous_high_school || 'Secondary School Graduate'} {myProfile?.matric_year ? `(${myProfile.matric_year})` : ''}</div></div>
                      <div style={{ gridColumn: '1/-1' }}><strong style={{ color: 'var(--text-sub)' }}>Residential Address:</strong> <div>{myProfile?.physical_address || '—'}</div></div>
                    </div>
                  </div>
                </div>

                {/* Programme Specification */}
                <div className="lmis-card">
                  <div className="lmis-card-header flex-between" style={{ borderBottom: '1px solid var(--ice2)' }}>
                    <span className="lmis-card-title">2. Programme Specification &amp; Provider</span>
                    <span className="badge badge-gold">Training Hub</span>
                  </div>
                  <div className="lmis-table-wrap">
                    <table className="lmis-table" style={{ fontSize: '0.75rem' }}>
                      <tbody>
                        <tr>
                          <td style={{ fontWeight: 700, width: '40%' }}>Programme Title</td>
                          <td style={{ color: 'var(--gold)', fontWeight: 700 }}>{myProfile?.programme_enrolled || 'Business Process and Work Study Management'}</td>
                        </tr>
                        <tr>
                          <td style={{ fontWeight: 700 }}>Learning Provider</td>
                          <td>Nexa Transform Group (Pty) Ltd</td>
                        </tr>
                        <tr>
                          <td style={{ fontWeight: 700 }}>Delivery Site</td>
                          <td>Nexa Academic Hub · Johannesburg, South Africa</td>
                        </tr>
                        <tr>
                          <td style={{ fontWeight: 700 }}>Enrolled Modules</td>
                          <td>{myCourses.map(c => (c.code || '').trim()).join(', ') || 'Active Enrolment'}</td>
                        </tr>
                        <tr>
                          <td style={{ fontWeight: 700 }}>Academic Facilitator</td>
                          <td>{myCourses[0]?.lecturer_name || 'Academic Facilitator'}</td>
                        </tr>
                        <tr>
                          <td style={{ fontWeight: 700 }}>Evaluation Status</td>
                          <td><span className={`badge ${realProgressPct >= 50 ? 'badge-emerald' : 'badge-gold'}`}>{competencyStatus}</span></td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}

            {/* ── SECTION 3: REAL MODULAR PROGRESS REPORT & GRADE LEDGER ── */}
            {(activePoeCategory === 'ALL' || activePoeCategory === 'REPORT' || activePoeCategory === 'MODULES') && (
              <div className="lmis-card mb-4">
                <div className="lmis-card-header flex-between" style={{ flexWrap: 'wrap', gap: '0.5rem' }}>
                  <div>
                    <span className="lmis-card-title">3. Modular Progress Report &amp; Assessment Ledger</span>
                    <p style={{ fontSize: '0.72rem', color: 'var(--text-sub)', margin: '0.2rem 0 0 0' }}>
                      Live grades for assignments, quizzes, and tests across all your registered modules.
                    </p>
                  </div>
                  <span className="badge badge-teal">{myCourses.length} Registered Module(s)</span>
                </div>

                <div className="lmis-card-body" style={{ padding: '1rem' }}>
                  {myCourses.length === 0 ? (
                    <div className="lmis-empty" style={{ padding: '2rem', textAlign: 'center' }}>
                      <p style={{ fontSize: '0.85rem', color: 'var(--text-sub)', margin: 0 }}>
                        No modules currently registered for this learner profile. Please contact the administrator for course registration.
                      </p>
                    </div>
                  ) : (
                    myCourses.map((c, idx) => {
                      const cCode = (c.code || '').trim();
                      const cleanCCode = cCode.toLowerCase();

                      const modAssignments = myAssignments.filter(a => (a.course_code || '').trim().toLowerCase() === cleanCCode);
                      const modSubs = mySubmissions.filter(s => (s.course_code || '').trim().toLowerCase() === cleanCCode);
                      const modQuizzes = myRelevantQuizzes.filter(q => (q.course_code || '').trim().toLowerCase() === cleanCCode);
                      const modAttempts = myQuizAttempts.filter(qa => {
                        const m = modQuizzes.find(mq => String(mq.id) === String(qa.quiz_id));
                        return !!m;
                      });

                      const modGradedSubs = modSubs.filter(s => s.grade !== undefined && s.grade !== null && s.grade !== '');
                      const modAvgGrade = modGradedSubs.length > 0
                        ? Math.round(modGradedSubs.reduce((acc, s) => acc + Number(s.grade || 0), 0) / modGradedSubs.length)
                        : null;

                      return (
                        <div key={c.id || idx} style={{ marginBottom: '1.5rem', background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '8px', overflow: 'hidden' }}>
                          {/* Module Header Bar */}
                          <div style={{ padding: '0.75rem 1rem', background: '#0f172a', color: '#fff', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.5rem' }}>
                            <div>
                              <span className="badge badge-gold" style={{ marginRight: '0.5rem', fontSize: '0.68rem' }}>{cCode}</span>
                              <strong style={{ fontSize: '0.9rem' }}>{c.title}</strong>
                            </div>
                            <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                              <span style={{ fontSize: '0.72rem', color: '#cbd5e1' }}>Facilitator: {c.lecturer_name || 'Academic Facilitator'}</span>
                              {modAvgGrade !== null && (
                                <span className="badge badge-emerald">Avg: {modAvgGrade}%</span>
                              )}
                            </div>
                          </div>

                          <div style={{ padding: '1rem' }}>
                            {/* 1. Assignments for this module */}
                            <div style={{ marginBottom: '1rem' }}>
                              <div style={{ fontSize: '0.75rem', fontWeight: 800, color: 'var(--navy)', marginBottom: '0.4rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                                📝 Formative Assignments &amp; Projects ({modAssignments.length})
                              </div>
                              {modAssignments.length === 0 && modSubs.length === 0 ? (
                                <p style={{ fontSize: '0.75rem', color: 'var(--text-sub)', margin: 0, fontStyle: 'italic' }}>
                                  No written assignments scheduled for this module yet.
                                </p>
                              ) : (
                                <div className="lmis-table-wrap">
                                  <table className="lmis-table" style={{ fontSize: '0.75rem' }}>
                                    <thead>
                                      <tr>
                                        <th>Assignment Title</th>
                                        <th>Due Date</th>
                                        <th>Submission State</th>
                                        <th>Marks / Grade</th>
                                        <th>Feedback</th>
                                        <th>Action</th>
                                      </tr>
                                    </thead>
                                    <tbody>
                                      {modAssignments.map((a) => {
                                        const sub = modSubs.find(s => String(s.assignment_id) === String(a.id) || s.assignment_title === a.title);
                                        return (
                                          <tr key={a.id}>
                                            <td style={{ fontWeight: 600 }}>{a.title}</td>
                                            <td>{a.due_date || 'In Curriculum'}</td>
                                            <td>
                                              <span className={`badge ${sub?.grade ? 'badge-emerald' : sub ? 'badge-teal' : 'badge-orange'}`}>
                                                {sub?.grade ? 'Graded' : sub ? 'Submitted' : 'Pending'}
                                              </span>
                                            </td>
                                            <td style={{ fontWeight: 700, color: sub?.grade ? 'var(--emerald)' : 'var(--text-sub)' }}>
                                              {sub?.grade ? `${sub.grade}%` : sub ? 'Awaiting Grading' : '0%'}
                                            </td>
                                            <td style={{ color: 'var(--text-sub)', fontStyle: sub?.feedback ? 'normal' : 'italic' }}>
                                              {sub?.feedback || 'No feedback yet'}
                                            </td>
                                            <td>
                                              {!sub ? (
                                                <button type="button" className="btn btn-xs btn-gold" onClick={() => setActiveTab('assignments')}>
                                                  Submit Work →
                                                </button>
                                              ) : (
                                                <span style={{ fontSize: '0.7rem', color: 'var(--emerald)', fontWeight: 600 }}>✓ On Record</span>
                                              )}
                                            </td>
                                          </tr>
                                        );
                                      })}
                                    </tbody>
                                  </table>
                                </div>
                              )}
                            </div>

                            {/* 2. Quizzes & Tests for this module */}
                            <div>
                              <div style={{ fontSize: '0.75rem', fontWeight: 800, color: 'var(--navy)', marginBottom: '0.4rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                                💡 Knowledge Tests &amp; Online Quizzes ({modQuizzes.length})
                              </div>
                              {modQuizzes.length === 0 && modAttempts.length === 0 ? (
                                <p style={{ fontSize: '0.75rem', color: 'var(--text-sub)', margin: 0, fontStyle: 'italic' }}>
                                  No interactive quizzes scheduled for this module yet.
                                </p>
                              ) : (
                                <div className="lmis-table-wrap">
                                  <table className="lmis-table" style={{ fontSize: '0.75rem' }}>
                                    <thead>
                                      <tr>
                                        <th>Quiz / Test Name</th>
                                        <th>Duration</th>
                                        <th>Attempt Status</th>
                                        <th>Score Achieved</th>
                                        <th>Outcome</th>
                                        <th>Action</th>
                                      </tr>
                                    </thead>
                                    <tbody>
                                      {modQuizzes.map((q) => {
                                        const att = modAttempts.find(a => String(a.quiz_id) === String(q.id));
                                        return (
                                          <tr key={q.id}>
                                            <td style={{ fontWeight: 600 }}>{q.title}</td>
                                            <td>⏱ {q.duration || 15} min</td>
                                            <td>
                                              <span className={`badge ${att ? 'badge-emerald' : 'badge-orange'}`}>
                                                {att ? 'Attempted' : 'Not Attempted'}
                                              </span>
                                            </td>
                                            <td style={{ fontWeight: 700, color: att ? 'var(--emerald)' : 'var(--text-sub)' }}>
                                              {att ? `${att.score}%` : '—'}
                                            </td>
                                            <td>
                                              {att ? (
                                                <span className={`badge ${att.passed ? 'badge-emerald' : 'badge-red'}`}>
                                                  {att.passed ? '✓ PASSED' : 'RETAKE'}
                                                </span>
                                              ) : (
                                                <span className="badge badge-ice">PENDING</span>
                                              )}
                                            </td>
                                            <td>
                                              {!att ? (
                                                <button type="button" className="btn btn-xs btn-teal" onClick={() => setActiveTab('quizzes')}>
                                                  Take Quiz →
                                                </button>
                                              ) : (
                                                <span style={{ fontSize: '0.7rem', color: 'var(--emerald)', fontWeight: 600 }}>✓ Recorded</span>
                                              )}
                                            </td>
                                          </tr>
                                        );
                                      })}
                                    </tbody>
                                  </table>
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>
            )}

            {/* ── SECTION 4: STATUTORY ADMISSIONS & MATRIC CERTIFICATE EVIDENCE HUB ── */}
            {(activePoeCategory === 'ALL' || activePoeCategory === 'EVIDENCE') && (
              <div className="lmis-card mb-4">
                <div className="lmis-card-header flex-between" style={{ flexWrap: 'wrap', gap: '0.5rem' }}>
                  <div>
                    <span className="lmis-card-title">4. Statutory Admissions Evidence &amp; Attached Certificates</span>
                    <p style={{ fontSize: '0.72rem', color: 'var(--text-sub)', margin: '0.2rem 0 0 0' }}>
                      When you attach your Matric certificate, ID, and bank letter, each document generates a dedicated, certified Evidence Exhibit page in your downloaded PoE PDF.
                    </p>
                  </div>
                  <span className={`badge ${statutoryAttachedCount >= 3 ? 'badge-emerald' : 'badge-gold'}`}>
                    {statutoryAttachedCount} / 4 Statutory Docs Attached
                  </span>
                </div>

                <div className="lmis-card-body">
                  <div className="lmis-2col" style={{ gap: '1rem' }}>
                    {/* 1. Matric / Grade 12 Certificate */}
                    <div style={{ background: '#f8fafc', padding: '1rem', borderRadius: '8px', border: qualAtts.length > 0 ? '1px solid rgba(16,185,129,0.4)' : '1px solid #e2e8f0' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                          <span style={{ fontSize: '1.2rem' }}>🎓</span>
                          <strong style={{ fontSize: '0.85rem', color: 'var(--navy)' }}>Certified Matric / Grade 12 Certificate</strong>
                        </div>
                        <span className={`badge ${qualAtts.length > 0 ? 'badge-emerald' : 'badge-red'}`}>
                          {qualAtts.length > 0 ? '✓ Attached (PoE Exhibit Page)' : 'Mandatory'}
                        </span>
                      </div>
                      <p style={{ fontSize: '0.72rem', color: 'var(--text-sub)', marginBottom: '0.75rem' }}>
                        Upload your certified Grade 12 / National Senior Certificate or highest qualification. This creates a full-page verified exhibit in your downloaded PoE.
                      </p>
                      <FileAttachmentZone
                        attachments={qualAtts}
                        onChange={files => {
                          if (myProfile) {
                            updateRecord('student_profiles', myProfile.id, { qualification_proof_attachments: files });
                            showToast('Matric Certificate updated! It will be included as an evidence page in your PoE.');
                          }
                        }}
                        label="Attach Matric Certificate (PDF, PNG, JPG)"
                      />
                    </div>

                    {/* 2. Certified ID / Passport */}
                    <div style={{ background: '#f8fafc', padding: '1rem', borderRadius: '8px', border: idAtts.length > 0 ? '1px solid rgba(16,185,129,0.4)' : '1px solid #e2e8f0' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                          <span style={{ fontSize: '1.2rem' }}>🪪</span>
                          <strong style={{ fontSize: '0.85rem', color: 'var(--navy)' }}>Certified National ID / Passport</strong>
                        </div>
                        <span className={`badge ${idAtts.length > 0 ? 'badge-emerald' : 'badge-red'}`}>
                          {idAtts.length > 0 ? '✓ Attached (PoE Exhibit Page)' : 'Mandatory'}
                        </span>
                      </div>
                      <p style={{ fontSize: '0.72rem', color: 'var(--text-sub)', marginBottom: '0.75rem' }}>
                        Upload a clear, certified copy of your South African Smart ID card or valid passport for identity verification.
                      </p>
                      <FileAttachmentZone
                        attachments={idAtts}
                        onChange={files => {
                          if (myProfile) {
                            updateRecord('student_profiles', myProfile.id, { id_copy_attachments: files });
                            showToast('ID Document updated! It will be included as an evidence page in your PoE.');
                          }
                        }}
                        label="Attach Certified ID Copy (PDF, PNG, JPG)"
                      />
                    </div>

                    {/* 3. Official Bank Confirmation Letter */}
                    <div style={{ background: '#f8fafc', padding: '1rem', borderRadius: '8px', border: bankAtts.length > 0 ? '1px solid rgba(16,185,129,0.4)' : '1px solid #e2e8f0' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                          <span style={{ fontSize: '1.2rem' }}>🏦</span>
                          <strong style={{ fontSize: '0.85rem', color: 'var(--navy)' }}>Bank Confirmation Letter</strong>
                        </div>
                        <span className={`badge ${bankAtts.length > 0 ? 'badge-emerald' : 'badge-red'}`}>
                          {bankAtts.length > 0 ? '✓ Attached (PoE Exhibit Page)' : 'Mandatory'}
                        </span>
                      </div>
                      <p style={{ fontSize: '0.72rem', color: 'var(--text-sub)', marginBottom: '0.75rem' }}>
                        Official letterhead from your bank confirming account number and account holder details for compliance and stipend disbursement.
                      </p>
                      <FileAttachmentZone
                        attachments={bankAtts}
                        onChange={files => {
                          if (myProfile) {
                            updateRecord('student_profiles', myProfile.id, { bank_proof_attachments: files });
                            showToast('Bank Confirmation updated! It will be included as an evidence page in your PoE.');
                          }
                        }}
                        label="Attach Bank Letter (PDF, PNG, JPG)"
                      />
                    </div>

                    {/* 4. Proof of Residential Address */}
                    <div style={{ background: '#f8fafc', padding: '1rem', borderRadius: '8px', border: addrAtts.length > 0 ? '1px solid rgba(16,185,129,0.4)' : '1px solid #e2e8f0' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                          <span style={{ fontSize: '1.2rem' }}>🏠</span>
                          <strong style={{ fontSize: '0.85rem', color: 'var(--navy)' }}>Proof of Residential Address</strong>
                        </div>
                        <span className={`badge ${addrAtts.length > 0 ? 'badge-emerald' : 'badge-gold'}`}>
                          {addrAtts.length > 0 ? '✓ Attached (PoE Exhibit Page)' : 'Recommended'}
                        </span>
                      </div>
                      <p style={{ fontSize: '0.72rem', color: 'var(--text-sub)', marginBottom: '0.75rem' }}>
                        Utility account, lease agreement, or municipal statement confirming your residential address within the last 3 months.
                      </p>
                      <FileAttachmentZone
                        attachments={addrAtts}
                        onChange={files => {
                          if (myProfile) {
                            updateRecord('student_profiles', myProfile.id, { address_proof_attachments: files });
                            showToast('Proof of Address updated! It will be included as an evidence page in your PoE.');
                          }
                        }}
                        label="Attach Proof of Residence (PDF, PNG, JPG)"
                      />
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* ── SECTION 5: LEARNER DIGITAL DECLARATION & SIGNATURE ── */}
            {(activePoeCategory === 'ALL' || activePoeCategory === 'DECLARATION') && (
              <div className="lmis-card mb-4" style={{ border: declarationSigned ? '1px solid rgba(16,185,129,0.4)' : '1px solid var(--gold)' }}>
                <div className="lmis-card-header flex-between" style={{ background: declarationSigned ? 'rgba(16,185,129,0.05)' : 'inherit' }}>
                  <span className="lmis-card-title">5. Digital Learner Authenticity &amp; Integrity Declaration</span>
                  <span className={`badge ${declarationSigned ? 'badge-emerald' : 'badge-gold'}`}>
                    {declarationSigned ? '✓ Authenticity Verified' : 'Action Required'}
                  </span>
                </div>
                <div className="lmis-card-body">
                  <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '8px', padding: '1rem', marginBottom: '1rem', fontSize: '0.78rem', fontStyle: 'italic', color: '#334155', lineHeight: 1.6 }}>
                    "I, <strong>{myProfile?.learner_name || 'Learner'}</strong> (Student No: <strong>{myProfile?.student_number || 'NX2026'}</strong>, ID/Passport: <strong>{myProfile?.id_passport || '—'}</strong>), hereby declare and confirm that all written assessments, quizzes, practical task blueprints, case studies, and workplace evidence submitted in this Portfolio of Evidence (PoE) represent my own original and authentic work. I understand that plagiarism or false representation will lead to immediate disciplinary and programme disqualification."
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem', marginBottom: '1.25rem' }}>
                    <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.8rem', cursor: 'pointer', fontWeight: 600 }}>
                      <input
                        type="checkbox"
                        checked={declarationSigned}
                        onChange={e => {
                          setDeclarationSigned(e.target.checked);
                          showToast(e.target.checked ? 'Declaration confirmed & digitally signed!' : 'Declaration unsigned.');
                        }}
                      />
                      I solemnly confirm and digitally sign this Learner Declaration
                    </label>
                    <div style={{ fontSize: '0.72rem', color: 'var(--muted)' }}>
                      {declarationSigned ? (
                        <span style={{ color: 'var(--emerald)', fontWeight: 600 }}>
                          ✓ Electronically Signed by {myProfile?.learner_name || cleanActive} · Recorded in LMIS Audit Trail
                        </span>
                      ) : (
                        <span style={{ color: 'var(--red)' }}>⚠ Please check the box above to complete your declaration</span>
                      )}
                    </div>
                  </div>

                  {/* Digital Touch / Mouse Signature Canvas */}
                  <div style={{ paddingTop: '1rem', borderTop: '1px dashed #cbd5e1' }}>
                    <p style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--navy)', marginBottom: '0.5rem' }}>
                      ✍️ Draw Your Digital Signature (This will be embedded into your official PoE PDF):
                    </p>
                    <SignaturePad
                      title="Learner Authentication Signature"
                      initialDataUrl={learnerSignature}
                      onSave={(dataUrl) => {
                        setLearnerSignature(dataUrl);
                        if (dataUrl) setDeclarationSigned(true);
                        showToast(dataUrl ? 'Signature saved & ready for PoE PDF generation!' : 'Signature cleared.');
                      }}
                      width={420}
                      height={130}
                    />
                  </div>
                </div>
              </div>
            )}

            {/* ── SECTION 6: FACILITATOR & INTERNAL QUALITY ASSURANCE REVIEW ── */}
            {(activePoeCategory === 'ALL' || activePoeCategory === 'MODERATION') && (
              <div className="lmis-2col mb-4" style={{ gap: '1rem' }}>
                {/* Assessor Decision */}
                <div className="lmis-card">
                  <div className="lmis-card-header flex-between">
                    <span className="lmis-card-title">6. Academic Facilitator Evaluation</span>
                    <span className={`badge ${myProfile?.poe_status?.includes('COMPETENT') ? 'badge-emerald' : myProfile?.poe_status ? 'badge-orange' : 'badge-gold'}`}>
                      {myProfile?.poe_status || 'Pending Facilitator Review'}
                    </span>
                  </div>
                  <div className="lmis-card-body" style={{ fontSize: '0.78rem' }}>
                    <p style={{ margin: '0 0 0.5rem 0' }}><strong>Facilitator:</strong> {myProfile?.poe_assessor_name || myCourses[0]?.lecturer_name || 'Academic Facilitator'}</p>
                    <p style={{ margin: '0 0 0.5rem 0' }}><strong>Assessment Method:</strong> Integrated PoE, Assessment Ledger &amp; Evidence Exhibits</p>
                    <p style={{ margin: '0 0 0.5rem 0', color: 'var(--text-sub)', fontStyle: 'italic' }}>
                      {myProfile?.poe_assessor_notes ? `"${myProfile.poe_assessor_notes}"` : myProfile?.poe_status ? 'Facilitator evaluation recorded in LMIS.' : `Portfolio compilation in progress (${completedTasksCount} of ${expectedTasksCount} curriculum tasks completed). Once submitted, your facilitator will assess your portfolio.`}
                    </p>
                    <div style={{ marginTop: '0.75rem', paddingTop: '0.75rem', borderTop: '1px solid var(--ice2)', color: myProfile?.poe_status ? 'var(--emerald)' : 'var(--text-sub)', fontWeight: 600 }}>
                      {myProfile?.poe_status ? `✓ Evaluated on ${fmtDate(myProfile.poe_evaluated_at)} · Recorded in LMIS` : '⏳ Awaiting Facilitator Review'}
                    </div>
                  </div>
                </div>

                {/* Internal Moderation */}
                <div className="lmis-card">
                  <div className="lmis-card-header flex-between">
                    <span className="lmis-card-title">7. Quality Assurance Review</span>
                    <span className={`badge ${myProfile?.poe_status ? 'badge-emerald' : 'badge-ice'}`}>
                      {myProfile?.poe_status ? 'Verified' : 'Pending'}
                    </span>
                  </div>
                  <div className="lmis-card-body" style={{ fontSize: '0.78rem' }}>
                    <p style={{ margin: '0 0 0.5rem 0' }}><strong>Review Status:</strong> {myProfile?.poe_status ? 'Academic Evidence Verified' : 'Scheduled Following Facilitator Assessment'}</p>
                    <p style={{ margin: '0 0 0.5rem 0' }}><strong>Quality Standard:</strong> Nexa Transform Institutional Assessment Standards</p>
                    <p style={{ margin: '0 0 0.5rem 0', color: 'var(--text-sub)', fontStyle: 'italic' }}>
                      {myProfile?.poe_status
                        ? 'Internal quality review completed. Evaluated evidence exhibits and task scores verified in accordance with institutional assessment standards.'
                        : 'Quality review will be conducted upon completion of facilitator evaluation and task submissions.'}
                    </p>
                    <div style={{ marginTop: '0.75rem', paddingTop: '0.75rem', borderTop: '1px solid var(--ice2)', color: myProfile?.poe_status ? 'var(--emerald)' : 'var(--text-sub)', fontWeight: 600 }}>
                      {myProfile?.poe_status ? '✓ Verified in LMIS Academic Record' : '○ Quality Assurance Queue'}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        );
      })()}


      {/* OVERVIEW */}
      {activeTab === 'overview' && (
        <div>
          <div className="lmis-page-header">
            <h1 className="lmis-page-title">Welcome back{myProfile ? `, ${myProfile.learner_name.split(' ')[0]}` : ''}! 👋</h1>
            <p className="lmis-page-sub">Here's a snapshot of your academic progress.</p>
          </div>

          <div className="lmis-stats-grid">
            <div className="lmis-stat">
              <div className="lmis-stat-icon navy"><IcoBook size={20} /></div>
              <div><div className="lmis-stat-val">{myCourses.length}</div><div className="lmis-stat-label">Enrolled Courses</div></div>
            </div>
            <div className="lmis-stat">
              <div className="lmis-stat-icon gold"><IcoFile size={20} /></div>
              <div><div className="lmis-stat-val">{myAssignments.length}</div><div className="lmis-stat-label">Assignments</div></div>
            </div>
            <div className="lmis-stat">
              <div className="lmis-stat-icon emerald"><IcoCheck size={20} /></div>
              <div><div className="lmis-stat-val">{mySubmissions.length}</div><div className="lmis-stat-label">Submissions</div></div>
            </div>
            <div className="lmis-stat">
              <div className="lmis-stat-icon teal"><IcoClock size={20} /></div>
              <div><div className="lmis-stat-val">{attRate !== null ? `${attRate}%` : '—'}</div><div className="lmis-stat-label">Attendance</div></div>
            </div>
          </div>

          <div className="lmis-2col" style={{ gap: '1rem' }}>
            {/* Enrolled Courses */}
            <div className="lmis-card">
              <div className="lmis-card-header">
                <span className="lmis-card-title">My Courses</span>
                <button className="btn btn-sm btn-ghost" onClick={() => setActiveTab('courses')}>View all →</button>
              </div>
              <div className="lmis-card-body">
                {myCourses.length === 0
                  ? <div className="lmis-empty"><IcoBook size={32} style={{ color: '#CBD5E1' }} /><p className="lmis-empty-sub">No courses enrolled yet. Contact the Admin to enroll you.</p></div>
                  : myCourses.map(c => (
                    <div key={c.id} className="lmis-item-row">
                      <div className="lmis-item-icon" style={{ background: 'rgba(11,18,32,0.07)', color: 'var(--navy)' }}><IcoBook size={16} /></div>
                      <div style={{ flex: 1 }}>
                        <div className="lmis-item-title">{c.title}</div>
                        <div className="lmis-item-sub">{c.code} · {c.lecturer_name}</div>
                      </div>
                      <span className="badge badge-emerald">Active</span>
                    </div>
                  ))
                }
              </div>
            </div>

            {/* Upcoming Assignments */}
            <div className="lmis-card">
              <div className="lmis-card-header">
                <span className="lmis-card-title">Upcoming Assignments</span>
                <button className="btn btn-sm btn-ghost" onClick={() => setActiveTab('assignments')}>View all →</button>
              </div>
              <div className="lmis-card-body">
                {myAssignments.length === 0
                  ? <div className="lmis-empty"><IcoFile size={32} style={{ color: '#CBD5E1' }} /><p className="lmis-empty-sub">No assignments yet.</p></div>
                  : myAssignments.slice(0, 4).map(a => {
                    const dl = daysLeft(a.due_date);
                    const done = submittedIds.includes(a.title);
                    return (
                      <div key={a.id} className="lmis-item-row">
                        <div className="lmis-item-icon" style={{ background: done ? 'rgba(16,185,129,0.1)' : 'rgba(245,158,11,0.1)', color: done ? 'var(--emerald)' : 'var(--orange)' }}>
                          {done ? <IcoCheck size={16} /> : <IcoFile size={16} />}
                        </div>
                        <div style={{ flex: 1 }}>
                          <div className="lmis-item-title">{a.title}</div>
                          <div className="lmis-item-sub">Due: {fmtDate(a.due_date)}</div>
                        </div>
                        {done
                          ? <span className="badge badge-emerald">Submitted</span>
                          : <span className={`badge ${dl !== null && dl < 3 ? 'badge-red' : 'badge-orange'}`}>{dl !== null ? `${dl}d left` : 'Due'}</span>
                        }
                      </div>
                    );
                  })
                }
              </div>
            </div>
          </div>

          {/* Announcements */}
          {myAnnouncements.length > 0 && (
            <div className="lmis-card mt-4">
              <div className="lmis-card-header"><span className="lmis-card-title">📢 Announcements</span></div>
              <div className="lmis-card-body">
                {myAnnouncements.slice(0, 3).map(a => (
                  <div key={a.id} className="lmis-announce-item">
                    <div className="lmis-announce-title">{a.title}</div>
                    <div className="lmis-announce-body">{a.content}</div>
                    <div className="lmis-announce-meta">{a.course_code} · {fmtDate(a.created_date)}</div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* COURSES */}
      {activeTab === 'courses' && (
        <div>
          <div className="lmis-page-header"><h1 className="lmis-page-title">My Courses</h1><p className="lmis-page-sub">All programmes you are currently enrolled in.</p></div>
          {myCourses.length === 0
            ? <div className="lmis-card"><div className="lmis-empty"><IcoBook size={40} style={{ color: '#CBD5E1' }} /><p className="lmis-empty-title">No Courses Yet</p><p className="lmis-empty-sub">An Administrator must enroll you in a programme first.</p></div></div>
            : <div className="lmis-3col">
              {myCourses.map(c => (
                <div key={c.id} className="lmis-card">
                  <div style={{ padding: '1.25rem', borderBottom: '1px solid var(--ice2)' }}>
                    <span className="badge badge-gold" style={{ marginBottom: '0.75rem' }}>{c.code}</span>
                    <h3 style={{ fontWeight: 700, fontSize: '0.95rem', color: 'var(--text-main)', marginBottom: '0.35rem' }}>{c.title}</h3>
                    <p style={{ fontSize: '0.78rem', color: 'var(--text-sub)', marginBottom: '0.5rem' }}>{c.description || 'No description provided.'}</p>
                    <p style={{ fontSize: '0.72rem', color: 'var(--muted)' }}>Lecturer: {c.lecturer_name || '—'}</p>
                  </div>
                  <div style={{ padding: '0.875rem 1.25rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '0.5rem' }}>
                    <button
                      type="button"
                      className="btn btn-xs btn-outline"
                      onClick={() => {
                        setLibraryCourseFilter((c.code || '').trim());
                        setActiveTab('library');
                      }}
                    >
                      📚 View Study Materials
                    </button>
                    <span className="badge badge-emerald">Active</span>
                  </div>
                </div>
              ))}
            </div>
          }
        </div>
      )}

      {/* ASSIGNMENTS */}
      {activeTab === 'assignments' && (
        <div>
          <div className="lmis-page-header"><h1 className="lmis-page-title">Assignments</h1><p className="lmis-page-sub">Submit your work before the due date.</p></div>
          {myAssignments.length === 0
            ? <div className="lmis-card"><div className="lmis-empty"><IcoFile size={40} style={{ color: '#CBD5E1' }} /><p className="lmis-empty-title">No Assignments Yet</p><p className="lmis-empty-sub">Assignments will appear here once a Lecturer posts them.</p></div></div>
            : myAssignments.map(a => {
              const done = submittedIds.includes(a.title);
              const dl = daysLeft(a.due_date);
              return (
                <div key={a.id} className="lmis-card mb-3">
                  <div className="lmis-card-header">
                    <div>
                      <h3 style={{ fontWeight: 700, fontSize: '0.9rem' }}>{a.title}</h3>
                      <p style={{ fontSize: '0.75rem', color: 'var(--text-sub)', marginTop: '0.2rem' }}>{a.course_code} · Due: {fmtDate(a.due_date)}</p>
                    </div>
                    {done
                      ? <span className="badge badge-emerald">✓ Submitted</span>
                      : <span className={`badge ${dl !== null && dl < 3 ? 'badge-red' : 'badge-orange'}`}>{dl !== null ? `${dl} days left` : 'Due'}</span>
                    }
                  </div>
                  <div style={{ padding: '0.875rem 1.25rem' }}>
                    <p style={{ fontSize: '0.82rem', color: 'var(--text-sub)', marginBottom: '0.875rem' }}>{a.description || 'Complete and submit before the due date.'}</p>
                    <p style={{ fontSize: '0.75rem', color: 'var(--muted)' }}>Total marks: {a.total_marks || 100}</p>
                    {!done && (
                      <div>
                        {submittingId === a.id ? (
                          <form onSubmit={e => handleSubmit(e, a)} className="lmis-submit-panel">
                            <div className="lmis-field" style={{ marginBottom: '0.875rem' }}>
                              <label className="lmis-label">Notes / Comments</label>
                              <textarea className="lmis-textarea" value={submitNotes} onChange={e => setSubmitNotes(e.target.value)} placeholder="Add any notes, comments or references for your submission..." />
                            </div>
                            <FileAttachmentZone
                              label="Attach Your Work (PDF, DOCX, PPTX, MP4 …)"
                              attachments={submitFiles}
                              onChange={setSubmitFiles}
                              maxFiles={6}
                              bucket="course-materials"
                              filePathPrefix={`${activeEmail}/submissions`}
                            />
                            <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.875rem' }}>
                              <button type="submit" className="btn btn-sm btn-gold"><IcoSend size={14} /> Submit</button>
                              <button type="button" className="btn btn-sm btn-ghost" onClick={() => { setSubmittingId(null); setSubmitFiles([]); }}>Cancel</button>
                            </div>
                          </form>
                        ) : (
                          <button className="btn btn-sm btn-primary mt-3" onClick={() => setSubmittingId(a.id)}>Submit Assignment</button>
                        )}
                      </div>
                    )}
                    {/* Show lecturer-attached files on the assignment */}
                    {a.attachments?.length > 0 && (
                      <div className="lmis-submission-attach">
                        <div className="lmis-submission-attach-title">📎 Assignment Files from Lecturer</div>
                        <AttachmentList attachments={a.attachments} />
                      </div>
                    )}
                  </div>
                </div>
              );
            })
          }
        </div>
      )}

      {/* QUIZZES */}
      {activeTab === 'quizzes' && (
        <div>
          {/* Active Proctored Quiz Taking Session */}
          {activeQuizSession && (
            <div style={{
              position: 'fixed',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              zIndex: 9999,
              background: '#f8fafc',
              display: 'flex',
              flexDirection: 'column',
              overflowY: 'auto'
            }}>
              {/* Top Navigation / App Bar */}
              <div style={{
                background: 'var(--navy)',
                color: '#ffffff',
                padding: '0.85rem 1.5rem',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                borderBottom: '2px solid #0f172a',
                flexShrink: 0
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                  <span className="badge badge-gold" style={{ fontSize: '0.8rem', padding: '0.25rem 0.6rem' }}>
                    {activeQuizSession.course_code}
                  </span>
                  <div>
                    <h2 style={{ fontSize: '1.05rem', fontWeight: 700, margin: 0, color: '#ffffff' }}>
                      {activeQuizSession.title}
                    </h2>
                    <span style={{ fontSize: '0.75rem', color: '#94a3b8' }}>
                      Question {currentQuestionIndex + 1} of {(activeQuizSession.questions || []).length}
                    </span>
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
                  {/* Proctoring Status Badge */}
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                    background: (fullscreenExitCount > 0 || tabSwitchCount > 0) ? 'rgba(239, 68, 68, 0.2)' : 'rgba(16, 185, 129, 0.15)',
                    border: (fullscreenExitCount > 0 || tabSwitchCount > 0) ? '1px solid rgba(239, 68, 68, 0.5)' : '1px solid rgba(16, 185, 129, 0.4)',
                    borderRadius: '20px',
                    padding: '0.35rem 0.85rem',
                    fontSize: '0.78rem',
                    fontWeight: 600
                  }}>
                    <span>🛡️ Proctored</span>
                    {fullscreenExitCount > 0 && (
                      <span style={{ color: '#fca5a5' }}>
                        • {fullscreenExitCount} Exit{fullscreenExitCount > 1 ? 's' : ''}
                      </span>
                    )}
                    {tabSwitchCount > 0 && (
                      <span style={{ color: '#fde047' }}>
                        • {tabSwitchCount} Blur{tabSwitchCount > 1 ? 's' : ''}
                      </span>
                    )}
                  </div>

                  {/* Live Timer */}
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                    background: quizTimeRemaining < 300 ? 'rgba(239, 68, 68, 0.3)' : 'rgba(255, 255, 255, 0.12)',
                    border: quizTimeRemaining < 300 ? '1px solid #ef4444' : '1px solid rgba(255, 255, 255, 0.2)',
                    padding: '0.45rem 0.9rem',
                    borderRadius: '8px',
                    color: quizTimeRemaining < 300 ? '#fca5a5' : '#ffffff'
                  }}>
                    <IcoClock size={16} />
                    <span style={{
                      fontFamily: 'monospace',
                      fontWeight: 800,
                      fontSize: '1rem',
                      letterSpacing: '0.05em'
                    }}>
                      {Math.floor(quizTimeRemaining / 60)}:{String(quizTimeRemaining % 60).padStart(2, '0')}
                    </span>
                  </div>
                </div>
              </div>

              {/* Progress Line */}
              <div style={{ height: '4px', background: '#e2e8f0', width: '100%', flexShrink: 0 }}>
                <div style={{
                  height: '100%',
                  background: 'var(--gold)',
                  width: `${((currentQuestionIndex + 1) / Math.max(1, (activeQuizSession.questions || []).length)) * 100}%`,
                  transition: 'width 0.3s ease'
                }} />
              </div>

              {/* Assessment Main Container */}
              <div style={{
                maxWidth: '960px',
                width: '100%',
                margin: '0 auto',
                padding: '2rem 1.5rem',
                flex: 1,
                display: 'flex',
                flexDirection: 'column',
                gap: '1.5rem'
              }}>
                {/* Current Question Display */}
                {(() => {
                  const questionsList = activeQuizSession.questions || [];
                  const currentQ = questionsList[currentQuestionIndex];
                  const isAnswered = quizResponses[currentQuestionIndex] !== undefined && quizResponses[currentQuestionIndex] !== '';

                  return (
                    <div className="lmis-card" style={{
                      border: '2px solid #e2e8f0',
                      boxShadow: '0 10px 25px rgba(0,0,0,0.05)',
                      background: '#ffffff',
                      borderRadius: '12px'
                    }}>
                      <div style={{
                        padding: '1.25rem 1.75rem',
                        borderBottom: '1px solid #e2e8f0',
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center'
                      }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                          <span style={{
                            fontSize: '0.85rem',
                            fontWeight: 800,
                            color: 'var(--gold)',
                            textTransform: 'uppercase',
                            letterSpacing: '0.05em'
                          }}>
                            Question {currentQuestionIndex + 1} of {questionsList.length}
                          </span>
                          <span className="badge badge-ice">
                            {currentQ?.marks || 5} Mark{(currentQ?.marks || 5) > 1 ? 's' : ''}
                          </span>
                        </div>
                        <div>
                          {isAnswered ? (
                            <span className="badge badge-emerald">✓ Answered</span>
                          ) : (
                            <span className="badge badge-orange">⏳ Unanswered</span>
                          )}
                        </div>
                      </div>

                      <div style={{ padding: '1.75rem' }}>
                        {/* Question Prompt */}
                        <div style={{
                          background: '#f8fafc',
                          border: '2px solid #e2e8f0',
                          borderRadius: '10px',
                          padding: '1.5rem',
                          marginBottom: '1.75rem'
                        }}>
                          <h3 style={{
                            fontSize: '1.125rem',
                            fontWeight: 700,
                            color: '#0f172a',
                            lineHeight: 1.6,
                            margin: 0
                          }}>
                            {currentQ?.question || currentQ?.text || `Question ${currentQuestionIndex + 1}`}
                          </h3>
                        </div>

                        {/* Options / Input */}
                        {currentQ?.type === 'multiple-choice' || !currentQ?.type || currentQ?.options?.length > 0 ? (
                          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem', marginBottom: '1.5rem' }}>
                            {(currentQ?.options || []).map((opt, oIdx) => {
                              const isSelected = quizResponses[currentQuestionIndex] === opt;
                              const charCode = String.fromCharCode(65 + oIdx);

                              return (
                                <button
                                  key={oIdx}
                                  type="button"
                                  onClick={() => handleSelectQuizAnswer(opt)}
                                  style={{
                                    textAlign: 'left',
                                    padding: '1rem 1.25rem',
                                    background: isSelected ? '#fef9c3' : '#ffffff',
                                    border: isSelected ? '2px solid #ca8a04' : '1.5px solid #cbd5e1',
                                    borderRadius: '10px',
                                    display: 'flex',
                                    alignItems: 'center',
                                    cursor: 'pointer',
                                    transition: 'all 0.15s ease',
                                    boxShadow: isSelected ? '0 4px 12px rgba(202, 138, 4, 0.15)' : 'none'
                                  }}
                                >
                                  <span style={{
                                    width: '32px',
                                    height: '32px',
                                    borderRadius: '50%',
                                    background: isSelected ? '#ca8a04' : '#f1f5f9',
                                    color: isSelected ? '#ffffff' : '#334155',
                                    fontSize: '0.85rem',
                                    fontWeight: 800,
                                    display: 'inline-flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    marginRight: '1rem',
                                    flexShrink: 0
                                  }}>
                                    {charCode}
                                  </span>
                                  <span style={{
                                    fontSize: '0.98rem',
                                    color: '#0f172a',
                                    fontWeight: isSelected ? 700 : 500,
                                    lineHeight: 1.4
                                  }}>
                                    {opt}
                                  </span>
                                </button>
                              );
                            })}
                          </div>
                        ) : (
                          <div className="lmis-field" style={{ marginBottom: '1.5rem' }}>
                            <label className="lmis-label" style={{ fontSize: '0.85rem', fontWeight: 700 }}>
                              Type your answer:
                            </label>
                            <input
                              type="text"
                              className="lmis-input"
                              value={quizResponses[currentQuestionIndex] || ''}
                              onChange={e => handleTextAnswerChange(e.target.value)}
                              placeholder="Enter your response here..."
                              style={{ padding: '0.85rem 1rem', fontSize: '1rem' }}
                            />
                          </div>
                        )}

                        {/* Navigation Footer */}
                        <div style={{
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'center',
                          borderTop: '1px solid #e2e8f0',
                          paddingTop: '1.5rem'
                        }}>
                          <div style={{ display: 'flex', gap: '0.75rem' }}>
                            <button
                              type="button"
                              className="btn btn-outline"
                              onClick={handlePrevQuestion}
                              disabled={currentQuestionIndex === 0}
                              style={{
                                opacity: currentQuestionIndex === 0 ? 0.4 : 1,
                                cursor: currentQuestionIndex === 0 ? 'not-allowed' : 'pointer'
                              }}
                            >
                              ← Previous Question
                            </button>

                            {currentQuestionIndex < questionsList.length - 1 && (
                              <button
                                type="button"
                                className="btn btn-ghost"
                                onClick={handleSkipQuestion}
                                style={{ color: '#64748b' }}
                              >
                                ⏭ Skip Question
                              </button>
                            )}
                          </div>

                          <div style={{ display: 'flex', gap: '0.75rem' }}>
                            {currentQuestionIndex < questionsList.length - 1 ? (
                              <button
                                type="button"
                                className="btn btn-primary"
                                onClick={handleNextQuestionClick}
                              >
                                Next Question →
                              </button>
                            ) : null}

                            <button
                              type="button"
                              className="btn btn-gold"
                              onClick={() => setShowSubmitConfirm(true)}
                              style={{ fontWeight: 800 }}
                            >
                              Submit Assessment 🏁
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })()}

                {/* Question Palette Grid */}
                {(() => {
                  const questionsList = activeQuizSession.questions || [];
                  const totalQ = questionsList.length;
                  const answeredCount = Object.keys(quizResponses).filter(k => quizResponses[k] !== undefined && quizResponses[k] !== '').length;

                  return (
                    <div className="lmis-card" style={{ padding: '1.25rem 1.5rem', background: 'var(--bg-card)', borderRadius: '10px', border: '1px solid var(--border-color)' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                        <div>
                          <span style={{ fontSize: '0.82rem', fontWeight: 800, color: 'var(--navy)', textTransform: 'uppercase' }}>
                            Question Palette & Quick Review
                          </span>
                          <span style={{ fontSize: '0.78rem', color: 'var(--text-sub)', marginLeft: '0.75rem' }}>
                            Answered: <strong>{answeredCount}</strong> / <strong>{totalQ}</strong>
                          </span>
                        </div>
                        <div style={{ display: 'flex', gap: '1rem', fontSize: '0.72rem', color: '#64748b' }}>
                          <span style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                            <span style={{ width: '10px', height: '10px', borderRadius: '50%', background: '#10b981' }} /> Answered
                          </span>
                          <span style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                            <span style={{ width: '10px', height: '10px', borderRadius: '50%', background: '#f59e0b' }} /> Current
                          </span>
                          <span style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                            <span style={{ width: '10px', height: '10px', borderRadius: '50%', background: '#cbd5e1' }} /> Unanswered
                          </span>
                        </div>
                      </div>

                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                        {questionsList.map((_, idx) => {
                          const isCurrent = currentQuestionIndex === idx;
                          const isAns = quizResponses[idx] !== undefined && quizResponses[idx] !== '';

                          return (
                            <button
                              key={idx}
                              type="button"
                              onClick={() => handleNavigateDirect(idx)}
                              style={{
                                minWidth: '38px',
                                height: '38px',
                                borderRadius: '8px',
                                fontSize: '0.85rem',
                                fontWeight: 800,
                                border: isCurrent
                                  ? '2px solid var(--gold)'
                                  : isAns
                                    ? '1.5px solid #10b981'
                                    : '1px solid #cbd5e1',
                                background: isCurrent
                                  ? '#fef9c3'
                                  : isAns
                                    ? '#ecfdf5'
                                    : '#ffffff',
                                color: isCurrent
                                  ? '#854d0e'
                                  : isAns
                                    ? '#065f46'
                                    : '#64748b',
                                cursor: 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                transition: 'all 0.1s ease',
                                boxShadow: isCurrent ? '0 0 0 2px rgba(202, 138, 4, 0.2)' : 'none'
                              }}
                              title={`Go to Question ${idx + 1}${isAns ? ' (Answered)' : ' (Unanswered)'}`}
                            >
                              {idx + 1}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  );
                })()}
              </div>
            </div>
          )}

          {/* Quizzes List (When Not in an Active Taking Session) */}
          {!activeQuizSession && (
            <div>
              <div className="lmis-page-header">
                <h1 className="lmis-page-title">Interactive Quizzes</h1>
                <p className="lmis-page-sub">Assessments scheduled for your enrolled courses.</p>
              </div>

              {quizCompletedScore !== null && (
                <div className="lmis-card mb-4" style={{ border: '2px solid var(--emerald)', background: 'rgba(16,185,129,0.03)' }}>
                  <div className="lmis-card-body text-center" style={{ padding: '1.75rem' }}>
                    <div style={{ fontSize: '2.5rem', color: 'var(--emerald)', marginBottom: '0.5rem' }}>🏆</div>
                    <h3 style={{ fontWeight: 800, fontSize: '1.1rem', color: 'var(--text-main)', marginBottom: '0.35rem' }}>Quiz Attempt Completed!</h3>
                    <p style={{ fontSize: '0.85rem', color: 'var(--text-sub)', marginBottom: '0.875rem' }}>Your score was calculated automatically and submitted to your gradebook.</p>
                    <div style={{ display: 'inline-block', fontSize: '2rem', fontWeight: 800, color: quizCompletedScore >= 50 ? 'var(--emerald)' : 'var(--red)', background: 'var(--bg-card)', border: '1px solid var(--border-color)', padding: '0.5rem 1.5rem', borderRadius: '12px', marginBottom: '1.25rem' }}>
                      {quizCompletedScore}%
                    </div>
                    <div>
                      <button type="button" className="btn btn-sm btn-outline" onClick={() => setQuizCompletedScore(null)}>Dismiss</button>
                    </div>
                  </div>
                </div>
              )}

              {(() => {
                const relevantQuizzes = (quizzes || []).filter(q =>
                  myCodes.some(c => c.toLowerCase() === (q.course_code || '').trim().toLowerCase())
                );

                if (relevantQuizzes.length === 0) {
                  return (
                    <div className="lmis-card">
                      <div className="lmis-empty">
                        <IcoHelp size={40} style={{ color: '#CBD5E1' }} />
                        <p className="lmis-empty-title">No Quizzes Scheduled</p>
                        <p className="lmis-empty-sub">Your lecturers haven't posted any quizzes for your courses yet.</p>
                      </div>
                    </div>
                  );
                }

                return (
                  <div className="lmis-3col">
                    {relevantQuizzes.map(q => {
                      const completedAttempts = (quiz_attempts || []).filter(
                        a => String(a.quiz_id) === String(q.id) &&
                             a.learner_email?.toLowerCase().trim() === cleanActive &&
                             a.status === 'Completed'
                      );
                      const attemptsUsed = completedAttempts.length;
                      const maxAttempts = Number(q.max_attempts) || 1;
                      const hasAttemptsLeft = attemptsUsed < maxAttempts;
                      const bestScore = completedAttempts.length > 0
                        ? Math.max(...completedAttempts.map(a => a.score ?? 0))
                        : null;

                      const now = new Date();
                      const isOpen = (!q.start_time || now >= new Date(q.start_time)) && (!q.end_time || now <= new Date(q.end_time));
                      const isUpcoming = q.start_time && now < new Date(q.start_time);
                      const isClosed = q.end_time && now > new Date(q.end_time);

                      return (
                        <div key={q.id} className="lmis-card" style={{ display: 'flex', flexDirection: 'column' }}>
                          <div style={{ padding: '1.25rem', borderBottom: '1px solid var(--ice2)', flex: 1 }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
                              <span className="badge badge-gold">{q.course_code}</span>
                              <span className="badge badge-ice">{q.duration || 45} mins</span>
                            </div>
                            <h3 style={{ fontWeight: 700, fontSize: '0.98rem', color: 'var(--text-main)', marginBottom: '0.4rem', lineHeight: 1.4 }}>
                              {q.title}
                            </h3>
                            <p style={{ fontSize: '0.75rem', color: 'var(--text-sub)', marginBottom: '0.6rem' }}>
                              📅 Window:<br />
                              <span style={{ fontWeight: 600 }}>
                                {q.start_time ? new Date(q.start_time).toLocaleString('en-ZA', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' }) : 'Immediate'}
                              </span> to <span style={{ fontWeight: 600 }}>
                                {q.end_time ? new Date(q.end_time).toLocaleString('en-ZA', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' }) : 'Open'}
                              </span>
                            </p>
                            <div style={{ fontSize: '0.72rem', color: 'var(--muted)', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.4rem', marginTop: '0.5rem', background: '#f8fafc', padding: '0.5rem 0.75rem', borderRadius: '6px' }}>
                              <div>Questions: <strong>{q.questions?.length || 0}</strong></div>
                              <div>Pass Mark: <strong>50%</strong></div>
                              <div style={{ gridColumn: '1/-1' }}>
                                Attempts Used: <strong>{attemptsUsed} / {maxAttempts}</strong>
                              </div>
                            </div>
                          </div>

                          {attemptsUsed > 0 && (
                            <div style={{ background: 'var(--bg-card-secondary)', padding: '0.6rem 1.25rem', fontSize: '0.75rem', color: 'var(--text-sub)', borderBottom: '1px solid var(--border-color)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                              <span>Best Score:</span>
                              <span style={{ fontWeight: 800, fontSize: '0.9rem', color: (bestScore || 0) >= 50 ? 'var(--emerald)' : 'var(--red)' }}>
                                {bestScore}% {(bestScore || 0) >= 50 ? '🏆 Passed' : '⚠️'}
                              </span>
                            </div>
                          )}

                          <div style={{ padding: '0.875rem 1.25rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'var(--bg-card)' }}>
                            <div>
                              {isUpcoming && <span className="badge badge-navy">Upcoming</span>}
                              {isClosed && <span className="badge badge-red">Closed</span>}
                              {isOpen && hasAttemptsLeft && <span className="badge badge-emerald">Open</span>}
                              {isOpen && !hasAttemptsLeft && <span className="badge badge-navy">Completed</span>}
                            </div>
                            <div>
                              {isOpen && hasAttemptsLeft ? (
                                <button
                                  type="button"
                                  className="btn btn-sm btn-gold"
                                  onClick={() => handleStartQuiz(q)}
                                  style={{ fontWeight: 700 }}
                                >
                                  Start Quiz 🚀
                                </button>
                              ) : (
                                <button
                                  type="button"
                                  className="btn btn-sm btn-outline"
                                  disabled
                                  style={{ opacity: 0.6, cursor: 'not-allowed' }}
                                >
                                  {!hasAttemptsLeft ? 'Max Attempts Used' : isClosed ? 'Closed' : isUpcoming ? 'Locked' : 'Unavailable'}
                                </button>
                              )}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                );
              })()}
            </div>
          )}

          {/* Pre-Quiz Instructions & Integrity Briefing Modal */}
          {preQuizBriefing && (
            <div style={{
              position: 'fixed',
              inset: 0,
              zIndex: 10001,
              background: 'rgba(15, 23, 42, 0.8)',
              backdropFilter: 'blur(5px)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '1.25rem'
            }}>
              <div className="lmis-card" style={{
                maxWidth: '650px',
                width: '100%',
                maxHeight: '90vh',
                overflowY: 'auto',
                background: 'var(--bg-card)',
                borderRadius: '16px',
                boxShadow: '0 25px 50px rgba(0,0,0,0.3)',
                border: '1px solid var(--border-color)'
              }}>
                <div style={{
                  background: 'var(--navy)',
                  color: '#ffffff',
                  padding: '1.25rem 1.75rem',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center'
                }}>
                  <div>
                    <span className="badge badge-gold" style={{ marginBottom: '0.35rem' }}>
                      {preQuizBriefing.quiz.course_code}
                    </span>
                    <h2 style={{ fontSize: '1.2rem', fontWeight: 800, margin: 0, color: '#ffffff' }}>
                      {preQuizBriefing.quiz.title}
                    </h2>
                  </div>
                  <button
                    type="button"
                    className="btn btn-ghost"
                    style={{ color: '#ffffff' }}
                    onClick={() => setPreQuizBriefing(null)}
                  >
                    <IcoX size={18} />
                  </button>
                </div>

                <div style={{ padding: '1.75rem' }}>
                  {/* Key Metrics Grid */}
                  <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(4, 1fr)',
                    gap: '0.75rem',
                    marginBottom: '1.5rem'
                  }}>
                    <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '10px', padding: '0.85rem', textAlign: 'center' }}>
                      <div style={{ fontSize: '0.7rem', color: '#64748b', textTransform: 'uppercase', fontWeight: 600 }}>Duration</div>
                      <div style={{ fontSize: '1.1rem', fontWeight: 800, color: 'var(--navy)' }}>{preQuizBriefing.quiz.duration || 45} min</div>
                    </div>
                    <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '10px', padding: '0.85rem', textAlign: 'center' }}>
                      <div style={{ fontSize: '0.7rem', color: '#64748b', textTransform: 'uppercase', fontWeight: 600 }}>Questions</div>
                      <div style={{ fontSize: '1.1rem', fontWeight: 800, color: 'var(--navy)' }}>{preQuizBriefing.quiz.questions?.length || 0}</div>
                    </div>
                    <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '10px', padding: '0.85rem', textAlign: 'center' }}>
                      <div style={{ fontSize: '0.7rem', color: '#64748b', textTransform: 'uppercase', fontWeight: 600 }}>Total Marks</div>
                      <div style={{ fontSize: '1.1rem', fontWeight: 800, color: 'var(--navy)' }}>
                        {(preQuizBriefing.quiz.questions || []).reduce((sum, qn) => sum + (Number(qn.marks) || 5), 0)}
                      </div>
                    </div>
                    <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '10px', padding: '0.85rem', textAlign: 'center' }}>
                      <div style={{ fontSize: '0.7rem', color: '#64748b', textTransform: 'uppercase', fontWeight: 600 }}>Pass Mark</div>
                      <div style={{ fontSize: '1.1rem', fontWeight: 800, color: 'var(--emerald)' }}>50%</div>
                    </div>
                  </div>

                  {/* Assessment Overview */}
                  <div style={{ marginBottom: '1.5rem' }}>
                    <h4 style={{ fontSize: '0.9rem', fontWeight: 800, color: 'var(--navy)', marginBottom: '0.4rem', textTransform: 'uppercase' }}>
                      Topic & Description
                    </h4>
                    <p style={{ fontSize: '0.88rem', color: '#475569', lineHeight: 1.5, margin: 0 }}>
                      {preQuizBriefing.quiz.description || `Assessment for ${preQuizBriefing.quiz.course_code}. This quiz tests your comprehension of key concepts and practical scenarios covered in class.`}
                    </p>
                  </div>

                  {/* Examination & Integrity Instructions */}
                  <div style={{
                    background: '#fffbeb',
                    border: '1.5px solid #fef3c7',
                    borderRadius: '12px',
                    padding: '1.25rem',
                    marginBottom: '1.5rem'
                  }}>
                    <h4 style={{ fontSize: '0.9rem', fontWeight: 800, color: '#92400e', marginBottom: '0.6rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                      <span>⚠️</span> Mandatory Examination Rules & Proctoring
                    </h4>
                    <ul style={{ margin: 0, paddingLeft: '1.25rem', fontSize: '0.84rem', color: '#78350f', lineHeight: 1.6 }}>
                      <li><strong>Full Screen Mandate:</strong> Clicking "Launch Assessment" will expand the quiz to full screen. Exiting full screen or minimizing the window will trigger a security violation logged in your audit trail.</li>
                      <li><strong>No External Aids:</strong> Opening other tabs, browser windows, or using search engines is strictly monitored and flagged to your Facilitator.</li>
                      <li><strong>Navigation & Review:</strong> You may navigate freely between questions using Previous, Next, Skip, and the Question Palette before submitting.</li>
                      <li><strong>Timer:</strong> The timer will run continuously. If time expires, your answers will be automatically submitted.</li>
                    </ul>
                  </div>

                  {/* Honor Pledge Checkbox */}
                  <div style={{
                    background: '#f8fafc',
                    border: '1px solid #cbd5e1',
                    borderRadius: '10px',
                    padding: '1rem',
                    marginBottom: '1.75rem'
                  }}>
                    <label style={{ display: 'flex', alignItems: 'flex-start', gap: '0.75rem', cursor: 'pointer' }}>
                      <input
                        type="checkbox"
                        checked={pledgeChecked}
                        onChange={e => setPledgeChecked(e.target.checked)}
                        style={{ width: '18px', height: '18px', marginTop: '2px', flexShrink: 0 }}
                      />
                      <span style={{ fontSize: '0.85rem', color: '#0f172a', lineHeight: 1.4, fontWeight: 600 }}>
                        I hereby certify that I am the registered learner and I will complete this assessment independently under institutional academic integrity policies without unauthorized external assistance.
                      </span>
                    </label>
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem' }}>
                    <button
                      type="button"
                      className="btn btn-outline"
                      onClick={() => setPreQuizBriefing(null)}
                    >
                      Cancel
                    </button>
                    <button
                      type="button"
                      className="btn btn-gold"
                      disabled={!pledgeChecked}
                      onClick={handleLaunchQuizFullscreen}
                      style={{
                        fontWeight: 800,
                        padding: '0.65rem 1.5rem',
                        opacity: pledgeChecked ? 1 : 0.5,
                        cursor: pledgeChecked ? 'pointer' : 'not-allowed'
                      }}
                    >
                      Launch Assessment in Full Screen 🚀
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Next Question Confirmation Modal */}
          {showNextConfirm && (
            <div style={{
              position: 'fixed',
              inset: 0,
              zIndex: 10002,
              background: 'rgba(15, 23, 42, 0.75)',
              backdropFilter: 'blur(4px)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '1rem'
            }}>
              <div className="lmis-card" style={{
                maxWidth: '460px',
                width: '100%',
                background: 'var(--bg-card)',
                borderRadius: '12px',
                boxShadow: '0 25px 50px rgba(0,0,0,0.25)',
                border: '1px solid var(--border-color)',
                overflow: 'hidden'
              }}>
                <div style={{ padding: '1.5rem 1.75rem', borderBottom: '1px solid var(--border-color)' }}>
                  <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 800, color: 'var(--navy)' }}>
                    Proceed to Next Question?
                  </h3>
                </div>
                <div style={{ padding: '1.5rem 1.75rem' }}>
                  <p style={{ fontSize: '0.92rem', color: '#334155', lineHeight: 1.5, marginBottom: '1.25rem' }}>
                    {quizResponses[currentQuestionIndex] !== undefined && quizResponses[currentQuestionIndex] !== '' ? (
                      <>Your answer for <strong>Question {currentQuestionIndex + 1}</strong> has been saved. You can always return and review this question using the Question Palette.</>
                    ) : (
                      <span style={{ color: '#b45309', fontWeight: 600 }}>
                        ⚠️ You have not selected an answer for <strong>Question {currentQuestionIndex + 1}</strong>. You can skip it for now and come back to it later before final submission.
                      </span>
                    )}
                  </p>

                  <label style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', fontSize: '0.85rem', color: '#64748b', cursor: 'pointer', marginBottom: '1.5rem' }}>
                    <input
                      type="checkbox"
                      checked={dontAskAgainForSession}
                      onChange={e => setDontAskAgainForSession(e.target.checked)}
                      style={{ width: '16px', height: '16px' }}
                    />
                    <span>Don't ask me again during this assessment</span>
                  </label>

                  <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem' }}>
                    <button
                      type="button"
                      className="btn btn-outline"
                      onClick={() => setShowNextConfirm(false)}
                    >
                      Stay on Question
                    </button>
                    <button
                      type="button"
                      className="btn btn-primary"
                      onClick={confirmNextQuestion}
                    >
                      Continue to Next Question →
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Full Screen Exited Warning Overlay */}
          {isFullscreenOverlayVisible && activeQuizSession && (
            <div style={{
              position: 'fixed',
              inset: 0,
              zIndex: 10005,
              background: 'rgba(15, 23, 42, 0.94)',
              backdropFilter: 'blur(8px)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '1.5rem'
            }}>
              <div className="lmis-card" style={{
                maxWidth: '520px',
                width: '100%',
                background: 'var(--bg-card)',
                borderRadius: '16px',
                boxShadow: '0 25px 60px rgba(0,0,0,0.5)',
                border: '1px solid var(--border-color)',
                textAlign: 'center',
                padding: '2.25rem 2rem'
              }}>
                <div style={{ fontSize: '3.5rem', marginBottom: '0.75rem' }}>⚠️</div>
                <h2 style={{ fontSize: '1.35rem', fontWeight: 800, color: '#dc2626', marginBottom: '0.75rem' }}>
                  Full Screen Mode Exited!
                </h2>
                <p style={{ fontSize: '0.92rem', color: 'var(--text-sub)', lineHeight: 1.6, marginBottom: '1.25rem' }}>
                  This assessment requires mandatory full screen mode. Your exit has been recorded with a precise timestamp in your official proctoring audit log.
                </p>

                <div style={{
                  background: '#fef2f2',
                  border: '1.5px solid #fecaca',
                  borderRadius: '10px',
                  padding: '1rem',
                  marginBottom: '1.75rem',
                  display: 'flex',
                  justifyContent: 'space-around',
                  fontSize: '0.85rem',
                  color: '#991b1b',
                  fontWeight: 700
                }}>
                  <div>Exits Recorded: <strong>{fullscreenExitCount}</strong></div>
                  <div>Tab Switches / Blurs: <strong>{tabSwitchCount}</strong></div>
                </div>

                <button
                  type="button"
                  className="btn btn-gold"
                  style={{ width: '100%', padding: '0.85rem', fontSize: '1rem', fontWeight: 800 }}
                  onClick={async () => {
                    try {
                      if (document.documentElement.requestFullscreen) {
                        await document.documentElement.requestFullscreen();
                      }
                    } catch (_) {}
                    setIsFullscreenOverlayVisible(false);
                  }}
                >
                  Return to Full Screen Now
                </button>
              </div>
            </div>
          )}

          {/* Submit Assessment Confirmation Modal */}
          {showSubmitConfirm && activeQuizSession && (() => {
            const questionsList = activeQuizSession.questions || [];
            const answeredCount = Object.keys(quizResponses).filter(k => quizResponses[k] !== undefined && quizResponses[k] !== '').length;
            const unansweredCount = Math.max(0, questionsList.length - answeredCount);

            return (
              <div style={{
                position: 'fixed',
                inset: 0,
                zIndex: 10003,
                background: 'rgba(15, 23, 42, 0.75)',
                backdropFilter: 'blur(4px)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                padding: '1rem'
              }}>
                <div className="lmis-card" style={{
                  maxWidth: '500px',
                  width: '100%',
                  background: 'var(--bg-card)',
                  borderRadius: '14px',
                  border: '1px solid var(--border-color)',
                  boxShadow: '0 25px 50px rgba(0,0,0,0.25)',
                  overflow: 'hidden'
                }}>
                  <div style={{ padding: '1.5rem 1.75rem', borderBottom: '1px solid var(--border-color)' }}>
                    <h3 style={{ margin: 0, fontSize: '1.15rem', fontWeight: 800, color: 'var(--navy)' }}>
                      Confirm Assessment Submission
                    </h3>
                  </div>
                  <div style={{ padding: '1.5rem 1.75rem' }}>
                    <div style={{
                      display: 'flex',
                      justifyContent: 'space-around',
                      background: '#f8fafc',
                      border: '1px solid #e2e8f0',
                      borderRadius: '10px',
                      padding: '1rem',
                      marginBottom: '1.25rem'
                    }}>
                      <div style={{ textAlign: 'center' }}>
                        <div style={{ fontSize: '0.75rem', color: '#64748b', textTransform: 'uppercase' }}>Total Questions</div>
                        <div style={{ fontSize: '1.3rem', fontWeight: 800, color: 'var(--navy)' }}>{questionsList.length}</div>
                      </div>
                      <div style={{ textAlign: 'center' }}>
                        <div style={{ fontSize: '0.75rem', color: '#64748b', textTransform: 'uppercase' }}>Answered</div>
                        <div style={{ fontSize: '1.3rem', fontWeight: 800, color: 'var(--emerald)' }}>{answeredCount}</div>
                      </div>
                      <div style={{ textAlign: 'center' }}>
                        <div style={{ fontSize: '0.75rem', color: '#64748b', textTransform: 'uppercase' }}>Unanswered</div>
                        <div style={{ fontSize: '1.3rem', fontWeight: 800, color: unansweredCount > 0 ? 'var(--red)' : 'var(--emerald)' }}>{unansweredCount}</div>
                      </div>
                    </div>

                    {unansweredCount > 0 ? (
                      <div style={{
                        background: '#fffbeb',
                        border: '1.5px solid #fde68a',
                        borderRadius: '8px',
                        padding: '0.85rem 1rem',
                        fontSize: '0.85rem',
                        color: '#92400e',
                        lineHeight: 1.5,
                        marginBottom: '1.25rem'
                      }}>
                        ⚠️ <strong>Notice:</strong> You still have <strong>{unansweredCount} unanswered question(s)</strong>. If you finalize now, unanswered questions will be graded as 0 marks.
                      </div>
                    ) : (
                      <p style={{ fontSize: '0.9rem', color: '#334155', lineHeight: 1.5, marginBottom: '1.25rem' }}>
                        Great job! You have answered all questions. Ready to submit your attempt?
                      </p>
                    )}

                    <p style={{ fontSize: '0.82rem', color: '#64748b', marginBottom: '1.5rem' }}>
                      Once submitted, your responses are finalized and immediately processed for grading.
                    </p>

                    <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem' }}>
                      <button
                        type="button"
                        className="btn btn-outline"
                        onClick={() => setShowSubmitConfirm(false)}
                      >
                        Review Answers
                      </button>
                      <button
                        type="button"
                        className="btn btn-gold"
                        onClick={() => submitQuizSession(false)}
                        style={{ fontWeight: 800 }}
                      >
                        Submit Now 🏁
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })()}

          {/* Post-Submission Answer Review Modal (Available if Enabled by Lecturer for 1 Attempt) */}
          {reviewAnswersModal && (
            <div style={{
              position: 'fixed',
              inset: 0,
              zIndex: 10004,
              background: 'rgba(15, 23, 42, 0.8)',
              backdropFilter: 'blur(5px)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '1.25rem'
            }}>
              <div className="lmis-card" style={{
                maxWidth: '750px',
                width: '100%',
                maxHeight: '90vh',
                overflowY: 'auto',
                background: 'var(--bg-card)',
                borderRadius: '16px',
                border: '1px solid var(--border-color)',
                boxShadow: '0 25px 50px rgba(0,0,0,0.3)'
              }}>
                <div style={{
                  background: 'var(--navy)',
                  color: '#ffffff',
                  padding: '1.25rem 1.75rem',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center'
                }}>
                  <div>
                    <span className="badge badge-gold" style={{ marginBottom: '0.35rem' }}>
                      {reviewAnswersModal.quiz.course_code}
                    </span>
                    <h2 style={{ fontSize: '1.15rem', fontWeight: 800, margin: 0, color: '#ffffff' }}>
                      Answer Key & Results Review
                    </h2>
                  </div>
                  <button
                    type="button"
                    className="btn btn-ghost"
                    style={{ color: '#ffffff' }}
                    onClick={() => setReviewAnswersModal(null)}
                  >
                    <IcoX size={18} />
                  </button>
                </div>

                <div style={{ padding: '1.75rem' }}>
                  {/* Score Summary Card */}
                  <div style={{
                    background: reviewAnswersModal.score >= 50 ? '#ecfdf5' : '#fef2f2',
                    border: reviewAnswersModal.score >= 50 ? '2px solid #10b981' : '2px solid #ef4444',
                    borderRadius: '12px',
                    padding: '1.25rem 1.75rem',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    marginBottom: '1.5rem'
                  }}>
                    <div>
                      <h3 style={{
                        margin: 0,
                        fontSize: '1.2rem',
                        fontWeight: 800,
                        color: reviewAnswersModal.score >= 50 ? '#065f46' : '#991b1b'
                      }}>
                        {reviewAnswersModal.score >= 50 ? '🎉 Passed' : '⚠️ Did Not Pass'}
                      </h3>
                      <p style={{ margin: '0.25rem 0 0 0', fontSize: '0.85rem', color: '#475569' }}>
                        Score: <strong>{reviewAnswersModal.score}%</strong> ({reviewAnswersModal.correctCount} / {reviewAnswersModal.questionsList.length} correct · {reviewAnswersModal.totalMarksAchieved} / {reviewAnswersModal.totalPossibleMarks} marks)
                      </p>
                    </div>
                    <div style={{
                      fontSize: '2rem',
                      fontWeight: 900,
                      color: reviewAnswersModal.score >= 50 ? '#059669' : '#dc2626'
                    }}>
                      {reviewAnswersModal.score}%
                    </div>
                  </div>

                  {/* Question Review List */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                    {reviewAnswersModal.questionsList.map((q, qIdx) => {
                      const given = reviewAnswersModal.responses[qIdx];
                      const isCorrect = q.type === 'multiple-choice' || !q.type
                        ? (given && String(given).trim() === String(q.correct_answer).trim())
                        : (given && q.correct_answer && String(given).trim().toLowerCase() === String(q.correct_answer).trim().toLowerCase());

                      return (
                        <div key={qIdx} style={{
                          border: isCorrect ? '1.5px solid #a7f3d0' : '1.5px solid #fecaca',
                          borderRadius: '10px',
                          padding: '1.25rem',
                          background: isCorrect ? '#f0fdf4' : '#fef2f2'
                        }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.6rem' }}>
                            <span style={{ fontSize: '0.8rem', fontWeight: 800, color: 'var(--navy)' }}>
                              Question {qIdx + 1} ({q.marks || 5} Marks)
                            </span>
                            <span className={`badge ${isCorrect ? 'badge-emerald' : 'badge-red'}`}>
                              {isCorrect ? '✓ Correct' : '✕ Incorrect'}
                            </span>
                          </div>
                          <div style={{ fontSize: '0.92rem', fontWeight: 700, color: '#0f172a', marginBottom: '0.85rem' }}>
                            {q.question}
                          </div>

                          <div style={{ fontSize: '0.85rem', marginBottom: '0.4rem' }}>
                            <span style={{ color: '#64748b' }}>Your answer: </span>
                            <strong style={{ color: isCorrect ? '#065f46' : '#991b1b' }}>
                              {given || '(No answer provided)'}
                            </strong>
                          </div>

                          {!isCorrect && (
                            <div style={{ fontSize: '0.85rem', color: '#065f46', background: '#dcfce7', padding: '0.4rem 0.75rem', borderRadius: '6px', marginTop: '0.4rem' }}>
                              <span style={{ fontWeight: 600 }}>Correct answer: </span>
                              <strong>{q.correct_answer}</strong>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '1.5rem' }}>
                    <button
                      type="button"
                      className="btn btn-primary"
                      onClick={() => setReviewAnswersModal(null)}
                    >
                      Close Review
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* GRADES — INSTITUTIONAL PROGRESS REPORT */}
      {activeTab === 'grades' && (() => {
        const activeEnrolledCodes = myCodes.length > 0 
          ? myCodes 
          : Array.from(new Set([
              ...(mySubmissions || []).map(s => s.course_code),
              ...(quiz_attempts || []).filter(a => a.learner_email?.toLowerCase().trim() === cleanActive).map(a => a.course_code)
            ])).filter(Boolean);

        const regDate = myProfile?.created_date || myProfile?.created_at || (myEnrollments[0]?.enrollment_date) || null;

        const programmeStanding = calculateProgrammeAcademicStanding({
          learnerEmail: cleanActive,
          enrolledCourseCodes: activeEnrolledCodes,
          courses,
          submissions,
          quizAttempts: quiz_attempts,
          assignments,
          quizzes,
          registrationDate: regDate,
          enrollments: myEnrollments
        });

        const handleDownloadTranscript = () => {
          try {
            setDownloadingTranscript(true);
            generateAcademicTranscriptPDF({
              name: myProfile?.learner_name || myProfile?.full_name || cleanActive.split('@')[0],
              email: cleanActive,
              studentNumber: myProfile?.student_number || 'NX-' + cleanActive.slice(0, 5).toUpperCase(),
              idPassport: myProfile?.id_passport || '—',
              programme: myProfile?.programme_enrolled || 'Business Process and Work Study Management',
              moduleRecords: programmeStanding.module_records || [],
              programmeAggregate: programmeStanding.programme_aggregate,
              qualificationOutcome: programmeStanding.qualification_outcome,
              isDistinction: programmeStanding.is_distinction
            });
            showToast('Official Progress Report (PDF) generated successfully!');
          } catch (err) {
            console.error('Failed to generate progress report:', err);
            showToast('Error generating PDF. Please try again.');
          } finally {
            setDownloadingTranscript(false);
          }
        };

        const currentYear = new Date().getFullYear();
        const studentNo = myProfile?.student_number || 'STU-' + cleanActive.slice(0, 5).toUpperCase();
        const studentFullName = (myProfile?.learner_name || myProfile?.full_name || cleanActive).toUpperCase();
        const programmeTitle = myProfile?.programme_enrolled
          ? myProfile.programme_enrolled.toUpperCase()
          : 'BUSINESS PROCESS AND WORK STUDY MANAGEMENT';

        return (
          <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
            {/* Action Bar (Download / Print) */}
            <div className="flex-between mb-3" style={{ flexWrap: 'wrap', gap: '0.75rem' }}>
              <div style={{ fontSize: '0.82rem', color: 'var(--text-sub)' }}>
                Official modular progress report for enrolled academic courses.
              </div>
              <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                <button
                  type="button"
                  className="btn btn-sm btn-outline"
                  onClick={() => window.print()}
                  style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontWeight: 600 }}
                >
                  🖨️ Print Report
                </button>
                <button
                  type="button"
                  className="btn btn-sm btn-gold"
                  style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontWeight: 700 }}
                  disabled={downloadingTranscript || (programmeStanding.module_records || []).length === 0}
                  onClick={handleDownloadTranscript}
                >
                  <IcoDl size={14} />
                  {downloadingTranscript ? 'Generating PDF...' : 'Download PDF'}
                </button>
              </div>
            </div>

            {/* Standardized Institutional Progress Report Container */}
            <div className="lmis-card" style={{
              padding: '1.5rem 1.75rem',
              background: 'var(--bg-card)',
              border: '1px solid var(--border-color)',
              boxShadow: '0 4px 16px rgba(0,0,0,0.06)'
            }}>
              {/* Report Header */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem', marginBottom: '1.25rem' }}>
                <div>
                  <h1 style={{
                    fontSize: '1.4rem',
                    fontWeight: 800,
                    margin: '0 0 0.85rem 0',
                    color: 'var(--text-main)',
                    letterSpacing: '-0.01em'
                  }}>
                    Progress Report
                  </h1>

                  {/* Boxed Student Info */}
                  <div style={{
                    border: '1.5px solid var(--border-color)',
                    borderRadius: '4px',
                    padding: '0.6rem 0.85rem',
                    background: 'var(--bg-card-header, #f8fafc)',
                    minWidth: '280px',
                    display: 'inline-block'
                  }}>
                    <div style={{ fontWeight: 700, fontSize: '0.86rem', color: 'var(--text-main)' }}>
                      Student Number: {studentNo}
                    </div>
                    <div style={{ fontWeight: 700, fontSize: '0.86rem', color: 'var(--text-main)', marginTop: '0.2rem' }}>
                      Name: {studentFullName}
                    </div>
                  </div>
                </div>

                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontWeight: 700, fontSize: '0.9rem', color: 'var(--text-main)' }}>
                    Year: {currentYear}
                  </div>
                </div>
              </div>

              {/* Programme Header */}
              <div style={{
                fontWeight: 800,
                fontSize: '0.92rem',
                color: 'var(--text-main)',
                marginBottom: '1rem',
                paddingBottom: '0.4rem',
                borderBottom: '2px solid var(--border-color)'
              }}>
                {programmeTitle}
              </div>

              {/* Enrolled Subjects List */}
              {programmeStanding.module_records.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '3rem 1rem', color: 'var(--text-sub)' }}>
                  <IcoAward size={40} style={{ color: '#cbd5e1', marginBottom: '0.5rem' }} />
                  <p style={{ fontWeight: 700, margin: '0 0 0.25rem 0' }}>No registered module records found</p>
                  <p style={{ fontSize: '0.8rem', margin: 0 }}>Registered subjects will appear here once module enrolments are active.</p>
                </div>
              ) : (
                programmeStanding.module_records.map((mod) => (
                  <div
                    key={mod.course_code}
                    style={{
                      marginBottom: '1.5rem',
                      border: '1px solid var(--border-color)',
                      borderRadius: '4px',
                      overflow: 'hidden'
                    }}
                  >
                    {/* Subject Header Bar */}
                    <div style={{
                      background: 'var(--bg-card-header, #f1f5f9)',
                      padding: '0.65rem 0.85rem',
                      borderBottom: '1px solid var(--border-color)',
                      fontSize: '0.82rem',
                      lineHeight: 1.5
                    }}>
                      <div style={{ fontWeight: 800, color: 'var(--text-main)', fontSize: '0.88rem' }}>
                        Subject: {mod.course_code}: {mod.course_title?.toUpperCase()}
                      </div>
                      <div style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        flexWrap: 'wrap',
                        gap: '1rem',
                        marginTop: '0.25rem',
                        color: 'var(--text-sub)',
                        fontWeight: 600
                      }}>
                        <span>Academic Period: {mod.academic_period?.period_code || '0: YEAR (JAN-DEC)'} {mod.academic_period?.formatted_reg_date && <span style={{ fontSize: '0.72rem', color: 'var(--muted)', fontWeight: 400 }}>(Reg: {mod.academic_period.formatted_reg_date})</span>}</span>
                        <span>Half Period Mark: <strong style={{ color: 'var(--text-main)' }}>{mod.half_period_mark !== null && mod.half_period_mark !== undefined ? mod.half_period_mark : '—'}</strong></span>
                        <span>Full Period Mark: <strong style={{ color: 'var(--text-main)' }}>{mod.full_period_mark !== null && mod.full_period_mark !== undefined ? mod.full_period_mark : '—'}</strong></span>
                      </div>
                      <div style={{ marginTop: '0.2rem', color: 'var(--text-sub)', fontWeight: 600 }}>
                        Exam Admission: <strong style={{ color: mod.exam_admission_flag === 'Y' ? 'var(--emerald)' : 'var(--red)' }}>{mod.exam_admission_flag}</strong>
                      </div>
                    </div>

                    {/* Subject Assessment Content */}
                    <div style={{ padding: '0.75rem 0.85rem', background: 'var(--bg-card)', fontSize: '0.8rem' }}>
                      <div style={{ fontWeight: 700, color: 'var(--text-sub)', marginBottom: '0.5rem' }}>
                        Group: Class - 01
                      </div>

                      {/* Mark Type: AS : ASSIGNMENT */}
                      <div style={{ marginBottom: '0.75rem' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.25rem' }}>
                          <span style={{ fontWeight: 700, color: 'var(--text-main)' }}>Mark Type: AS : ASSIGNMENT</span>
                          <span style={{ fontWeight: 700, color: 'var(--text-main)' }}>
                            Mark Type Mark: {mod.assignment_average !== null && mod.assignment_average !== undefined ? mod.assignment_average : (mod.assignment_items.length > 0 ? mod.assignment_items[0].score : '—')}
                          </span>
                        </div>
                        <div style={{
                          border: '1px solid var(--border-color)',
                          borderRadius: '4px',
                          padding: '0.4rem 0.75rem',
                          background: 'var(--bg-card-header, #f8fafc)',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '1rem',
                          overflowX: 'auto'
                        }}>
                          <span style={{ fontWeight: 700, color: 'var(--text-sub)', whiteSpace: 'nowrap' }}>Number : Mark:</span>
                          {mod.assignment_items.length === 0 ? (
                            <span style={{ color: 'var(--muted)', fontStyle: 'italic' }}>No assignments submitted yet</span>
                          ) : (
                            <div style={{ display: 'flex', gap: '1.25rem', flexWrap: 'wrap' }}>
                              {mod.assignment_items.map((item, idx) => (
                                <span key={item.id || idx} style={{ fontWeight: 600, color: 'var(--text-main)', whiteSpace: 'nowrap' }} title={item.title}>
                                  <span style={{ color: 'var(--text-sub)' }}>{idx + 1}:</span> <strong>{item.score}</strong>
                                </span>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Mark Type: WR : WRITTEN TEST (Online Quizzes & Tests) */}
                      <div style={{ marginBottom: '0.75rem' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.25rem' }}>
                          <span style={{ fontWeight: 700, color: 'var(--text-main)' }}>Mark Type: WR : WRITTEN TEST</span>
                          <span style={{ fontWeight: 700, color: 'var(--text-main)' }}>
                            Mark Type Mark: {mod.quiz_average !== null && mod.quiz_average !== undefined ? mod.quiz_average : (mod.quiz_items.length > 0 ? mod.quiz_items[0].score : '—')}
                          </span>
                        </div>
                        <div style={{
                          border: '1px solid var(--border-color)',
                          borderRadius: '4px',
                          padding: '0.4rem 0.75rem',
                          background: 'var(--bg-card-header, #f8fafc)',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '1rem',
                          overflowX: 'auto'
                        }}>
                          <span style={{ fontWeight: 700, color: 'var(--text-sub)', whiteSpace: 'nowrap' }}>Number : Mark:</span>
                          {mod.quiz_items.length === 0 ? (
                            <span style={{ color: 'var(--muted)', fontStyle: 'italic' }}>No written tests / quizzes completed yet</span>
                          ) : (
                            <div style={{ display: 'flex', gap: '1.25rem', flexWrap: 'wrap' }}>
                              {mod.quiz_items.map((item, idx) => (
                                <span key={item.id || idx} style={{ fontWeight: 600, color: 'var(--text-main)', whiteSpace: 'nowrap' }} title={item.title}>
                                  <span style={{ color: 'var(--text-sub)' }}>{idx + 1}:</span> <strong>{item.score}</strong>
                                </span>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Mark Type: EX : FINAL EXAMINATION (if recorded) */}
                      {mod.exam_item && (
                        <div>
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.25rem' }}>
                            <span style={{ fontWeight: 700, color: 'var(--text-main)' }}>Mark Type: EX : EXAMINATION</span>
                            <span style={{ fontWeight: 700, color: 'var(--text-main)' }}>
                              Mark Type Mark: {mod.exam_item.score}
                            </span>
                          </div>
                          <div style={{
                            border: '1px solid var(--border-color)',
                            borderRadius: '4px',
                            padding: '0.4rem 0.75rem',
                            background: 'var(--bg-card-header, #f8fafc)',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '1rem'
                          }}>
                            <span style={{ fontWeight: 700, color: 'var(--text-sub)', whiteSpace: 'nowrap' }}>Number : Mark:</span>
                            <span style={{ fontWeight: 600, color: 'var(--text-main)' }}>
                              <span style={{ color: 'var(--text-sub)' }}>1:</span> <strong>{mod.exam_item.score}</strong>
                            </span>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>

          {/* ── Grade Appeals Section ── */}
          <div className="lmis-card mt-4">
            <div className="lmis-card-header flex-between">
              <span className="lmis-card-title">📋 Grade Appeals</span>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Dispute a grade you believe was incorrectly assessed</span>
            </div>
            <div className="lmis-card-body">
              {(grade_appeals || []).filter(a => (a.learner_email || '').toLowerCase() === cleanActive).length > 0 && (
                <div style={{ marginBottom: '1.25rem' }}>
                  <p style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--text-sub)', marginBottom: '0.5rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Your Appeals</p>
                  {(grade_appeals || []).filter(a => (a.learner_email || '').toLowerCase() === cleanActive).map(appeal => (
                    <div key={appeal.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.65rem 0.85rem', background: 'var(--bg-card-secondary)', borderRadius: '0.5rem', marginBottom: '0.5rem', flexWrap: 'wrap', gap: '0.5rem' }}>
                      <div>
                        <p style={{ fontWeight: 600, fontSize: '0.85rem', color: 'var(--text-main)' }}>{appeal.assignment_title}</p>
                        <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{appeal.course_code} &middot; Original grade: <strong>{appeal.original_grade ?? '—'}</strong></p>
                        {appeal.reviewer_notes && <p style={{ fontSize: '0.75rem', color: 'var(--text-sub)', fontStyle: 'italic', marginTop: '0.2rem' }}>Facilitator: "{appeal.reviewer_notes}"</p>}
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <span className={`badge ${appeal.status === 'Approved' ? 'badge-success' : appeal.status === 'Rejected' ? 'badge-danger' : appeal.status === 'Escalated' ? 'badge-gold' : 'badge-navy'}`}>{appeal.status || 'Pending'}</span>
                        {appeal.revised_grade != null && <span style={{ fontSize: '0.75rem', color: 'var(--emerald)', fontWeight: 700 }}>→ {appeal.revised_grade}%</span>}
                      </div>
                    </div>
                  ))}
                </div>
              )}
              {showAppealForm ? (
                <div style={{ background: 'var(--bg-card-secondary)', border: '1px solid var(--border-color)', borderRadius: '0.75rem', padding: '1rem' }}>
                  <p style={{ fontWeight: 700, fontSize: '0.88rem', marginBottom: '0.75rem' }}>Lodge a Grade Appeal: <em>{showAppealForm}</em></p>
                  <div style={{ display: 'grid', gap: '0.75rem', marginBottom: '0.75rem' }}>
                    <div>
                      <label style={{ fontSize: '0.75rem', fontWeight: 700, display: 'block', marginBottom: '0.25rem' }}>Module</label>
                      <select className="lmis-select" value={appealForm.course_code} onChange={e => setAppealForm(f => ({ ...f, course_code: e.target.value }))}>
                        <option value="">Select module...</option>
                        {myCourses.map(c => <option key={c.code} value={c.code}>{c.title} ({c.code})</option>)}
                      </select>
                    </div>
                    <div>
                      <label style={{ fontSize: '0.75rem', fontWeight: 700, display: 'block', marginBottom: '0.25rem' }}>Reason for Appeal <span style={{ color: 'var(--red)' }}>*</span></label>
                      <textarea className="lmis-input" rows={3} value={appealForm.appeal_reason}
                        onChange={e => setAppealForm(f => ({ ...f, appeal_reason: e.target.value }))}
                        placeholder="Explain why this grade should be reviewed..." style={{ resize: 'vertical' }} />
                    </div>
                    <div>
                      <label style={{ fontSize: '0.75rem', fontWeight: 700, display: 'block', marginBottom: '0.25rem' }}>Supporting Notes (optional)</label>
                      <textarea className="lmis-input" rows={2} value={appealForm.supporting_notes}
                        onChange={e => setAppealForm(f => ({ ...f, supporting_notes: e.target.value }))}
                        placeholder="Any additional context..." style={{ resize: 'vertical' }} />
                    </div>
                  </div>
                  <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end' }}>
                    <button className="btn btn-sm btn-ghost" onClick={() => { setShowAppealForm(null); setAppealForm({ course_code: '', appeal_reason: '', supporting_notes: '' }); }}>Cancel</button>
                    <button className="btn btn-sm btn-gold" disabled={appealSubmitting || !appealForm.appeal_reason.trim() || !appealForm.course_code}
                      onClick={async () => {
                        setAppealSubmitting(true);
                        try {
                          const graded = (submissions || []).find(s => s.assignment_title === showAppealForm && s.course_code === appealForm.course_code);
                          await createRecord('grade_appeals', {
                            id: 'APP-' + Date.now(),
                            learner_email: cleanActive,
                            learner_name: myProfile?.learner_name || cleanActive,
                            course_code: appealForm.course_code,
                            assignment_title: showAppealForm,
                            original_grade: graded?.grade ?? null,
                            appeal_reason: appealForm.appeal_reason,
                            supporting_notes: appealForm.supporting_notes,
                            status: 'Pending',
                            submitted_at: new Date().toISOString()
                          });
                          showToast('Appeal submitted. Your facilitator will review it shortly.');
                          setShowAppealForm(null);
                          setAppealForm({ course_code: '', appeal_reason: '', supporting_notes: '' });
                        } catch (err) { showToast('Failed to submit appeal. Please try again.'); }
                        finally { setAppealSubmitting(false); }
                      }}>{appealSubmitting ? 'Submitting...' : 'Submit Appeal'}</button>
                  </div>
                </div>
              ) : (
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                  {(mySubmissions || []).filter(s => s.grade != null).slice(0, 8).map(s => (
                    <button key={s.id || s.assignment_title} className="btn btn-sm btn-outline"
                      onClick={() => { setShowAppealForm(s.assignment_title); setAppealForm(f => ({ ...f, course_code: s.course_code || '' })); }}>
                      Appeal: {(s.assignment_title || 'Assessment').substring(0, 22)}
                    </button>
                  ))}
                  {!(mySubmissions || []).some(s => s.grade != null) && (
                    <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>No graded assessments yet. Appeals can be lodged once grades are published by your facilitator.</p>
                  )}
                </div>
              )}
            </div>
          </div>
          </div>
        );
      })()}

      {/* ATTENDANCE */}
      {activeTab === 'attendance' && (
        <div>
          <div className="lmis-page-header">
            <h1 className="lmis-page-title">Attendance</h1>
            <p className="lmis-page-sub">Your session attendance record. Rate: {attRate !== null ? `${attRate}%` : 'No records'}</p>
          </div>
          <div className="lmis-card">
            {myAttendance.length === 0
              ? <div className="lmis-empty"><IcoClock size={40} style={{ color: '#CBD5E1' }} /><p className="lmis-empty-title">No attendance records</p><p className="lmis-empty-sub">Attendance will be recorded by Lecturers during sessions.</p></div>
              : <div className="lmis-table-wrap">
                <table className="lmis-table">
                  <thead><tr><th>Date</th><th>Course</th><th>Status</th><th>Notes</th></tr></thead>
                  <tbody>
                    {myAttendance.map(a => (
                      <tr key={a.id}>
                        <td>{fmtDate(a.date)}</td>
                        <td><span className="badge badge-navy">{a.course_code}</span></td>
                        <td>
                          <span className={`badge ${a.status === 'Present' ? 'badge-emerald' : a.status === 'Absent' ? 'badge-red' : 'badge-orange'}`}>{a.status}</span>
                        </td>
                        <td style={{ color: 'var(--text-sub)', fontSize: '0.78rem' }}>{a.notes || '—'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            }
          </div>
        </div>
      )}

      {/* CALENDAR */}
      {activeTab === 'calendar' && (
        <div>
          <div className="lmis-page-header mb-3">
            <h1 className="lmis-page-title">Academic Calendar &amp; Class Timetable</h1>
            <p className="lmis-page-sub">Comprehensive scheduling suite: weekly Twinkl grid, monthly deadlines, and daily timelines.</p>
          </div>
          <LmisCalendarSchedule
            userRole="Learner"
            userEmail={cleanActive}
            userName={myProfile?.learner_name || 'Learner'}
            allowedCourseCodes={myCodes}
            onNavigateToTab={(tab) => setActiveTab(tab)}
          />
        </div>
      )}

      {/* STUDY MATERIALS & RESOURCE LIBRARY */}
      {(activeTab === 'library' || activeTab === 'resources') && (() => {
        const allAvailableResources = (library_resources || []).filter(r => {
          if (!r) return false;
          const cleanResCode = String(r.course_code || '').trim().toLowerCase();
          return myCodes.some(c => c.toLowerCase() === cleanResCode);
        });
        const completedMap = completedResources || {};

        const filtered = allAvailableResources.filter(r => {
          if (!r) return false;
          const cleanResCode = String(r.course_code || '').trim().toLowerCase();
          const cleanFilterCourse = String(libraryCourseFilter || 'All').trim().toLowerCase();

          const matchCourse = cleanFilterCourse === 'all'
            || cleanResCode === cleanFilterCourse;

          const matchCat = libraryCategoryFilter === 'All'
            || (libraryCategoryFilter === 'Document' && (r.type === 'Document' || r.type === 'Reference' || r.type === 'Assignment Template'))
            || (libraryCategoryFilter === 'Video' && r.type === 'Video')
            || (libraryCategoryFilter === 'Presentation' && (r.type === 'Presentation' || r.type === 'Slides'));

          const matchSearch = !(librarySearch || '').trim() || ((r.title || '') + ' ' + (r.description || '') + ' ' + (r.course_code || '')).toLowerCase().includes((librarySearch || '').toLowerCase());

          return matchCourse && matchCat && matchSearch;
        });

        const docCount = allAvailableResources.filter(r => r.type === 'Document' || r.type === 'Reference' || r.type === 'Assignment Template').length;
        const vidCount = allAvailableResources.filter(r => r.type === 'Video').length;
        const pptCount = allAvailableResources.filter(r => r.type === 'Presentation' || r.type === 'Slides').length;

        const completedCount = allAvailableResources.filter(r => !!completedMap[r.id]).length;
        const progressPct = allAvailableResources.length > 0
          ? Math.round((completedCount / allAvailableResources.length) * 100)
          : 0;

        return (
          <div>
            <div className="lmis-page-header flex-between" style={{ flexWrap: 'wrap', gap: '1rem' }}>
              <div>
                <h1 className="lmis-page-title">Study Materials &amp; Digital Library</h1>
                <p className="lmis-page-sub">Official lecture documents, video lessons, and interactive PowerPoint slide decks published by your facilitators.</p>
              </div>
              <button
                type="button"
                className="btn btn-sm btn-outline"
                disabled={zipDownloading || allAvailableResources.length === 0}
                onClick={handleLearnerBatchZip}
                title="Download all materials for this module into a single ZIP archive for offline study"
              >
                {zipDownloading ? `⏳ ${zipProgress || 'Packaging ZIP...'}` : '📦 Download All (.ZIP)'}
              </button>
            </div>

            {/* PROGRESS BANNER */}
            {allAvailableResources.length > 0 && (
              <div style={{ background: 'linear-gradient(135deg, #0d1527, #1e293b)', color: '#fff', borderRadius: '10px', padding: '1rem 1.25rem', marginBottom: '1.25rem', border: '1px solid rgba(201,163,78,0.3)', boxShadow: '0 4px 12px rgba(0,0,0,0.06)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem', flexWrap: 'wrap', gap: '0.5rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <span style={{ fontSize: '1.1rem' }}>🎯</span>
                    <span style={{ fontWeight: 800, fontSize: '0.88rem', color: '#fff' }}>Your Curriculum Progress</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                    <span style={{ fontSize: '0.78rem', color: '#cbd5e1' }}>
                      {completedCount} of {allAvailableResources.length} Materials Reviewed
                    </span>
                    <span className={`badge ${progressPct === 100 ? 'badge-emerald' : 'badge-gold'}`} style={{ fontWeight: 800 }}>
                      {progressPct}%
                    </span>
                  </div>
                </div>
                <div style={{ height: '8px', background: 'rgba(255,255,255,0.1)', borderRadius: '4px', overflow: 'hidden' }}>
                  <div style={{ width: `${progressPct}%`, height: '100%', background: 'linear-gradient(90deg, var(--gold), var(--emerald))', transition: 'width 0.4s ease' }} />
                </div>
              </div>
            )}

            {/* Filter and Search Bar */}
            <div className="lmis-library-toolbar">
              <div className="lmis-library-pills">
                {[
                  { id: 'All', label: `All (${allAvailableResources.length})` },
                  { id: 'Document', label: `📄 Documents (${docCount})` },
                  { id: 'Video', label: `🎥 Class Recordings (${vidCount})` },
                  { id: 'Presentation', label: `📊 PowerPoint (${pptCount})` },
                ].map(cat => (
                  <button
                    key={cat.id}
                    type="button"
                    className={`btn btn-sm ${libraryCategoryFilter === cat.id ? 'btn-gold' : 'btn-outline'}`}
                    onClick={() => setLibraryCategoryFilter(cat.id)}
                  >
                    {cat.label}
                  </button>
                ))}
              </div>

              <div className="lmis-library-inputs">
                <select
                  className="lmis-select"
                  style={{ fontSize: '0.82rem', padding: '0.45rem 0.75rem', height: '40px' }}
                  value={libraryCourseFilter}
                  onChange={e => setLibraryCourseFilter(e.target.value)}
                >
                  <option value="All">All Courses ({allAvailableResources.length})</option>
                  {(courses || []).map(c => {
                    const cleanCode = (c.code || '').trim();
                    const count = allAvailableResources.filter(r => String(r.course_code || '').trim().toLowerCase() === cleanCode.toLowerCase()).length;
                    return <option key={c.id} value={cleanCode}>{cleanCode} · {c.title} ({count})</option>;
                  })}
                </select>

                <input
                  type="text"
                  placeholder="🔍 Search materials..."
                  className="lmis-input"
                  style={{ fontSize: '0.82rem', padding: '0.45rem 0.75rem', width: '220px', height: '40px' }}
                  value={librarySearch}
                  onChange={e => setLibrarySearch(e.target.value)}
                />
              </div>
            </div>

            {filtered.length === 0 ? (
              <div className="lmis-card">
                <div className="lmis-empty">
                  <IcoBook size={40} style={{ color: '#CBD5E1' }} />
                  <p className="lmis-empty-title">No Study Materials Found</p>
                  <p className="lmis-empty-sub">
                    {allAvailableResources.length === 0
                      ? 'Your academic facilitators have not published any study materials yet. They will appear here once uploaded.'
                      : 'No study materials match your selected filters.'}
                  </p>
                </div>
              </div>
            ) : (
              <div className="lmis-material-grid">
                {filtered.map(r => {
                  const isPpt = r.type === 'Presentation' || r.type === 'Slides' || r.attachments?.[0]?.name?.endsWith('.pptx') || r.attachments?.[0]?.name?.endsWith('.ppt');
                  const isVid = r.type === 'Video' || r.attachments?.[0]?.name?.endsWith('.mp4') || r.file_url?.includes('youtube') || r.file_url?.includes('vimeo');
                  const badgeCls = isVid ? 'badge-purple' : isPpt ? 'badge-gold' : 'badge-teal';
                  const badgeIcon = isVid ? '🎥 Class Recording' : isPpt ? '📊 PowerPoint Deck' : '📄 Study Document';
                  const isDone = !!completedMap[r.id];

                  return (
                    <div key={r.id} className="lmis-material-card" style={{ border: isDone ? '1.5px solid var(--emerald)' : '1px solid var(--border-color)' }}>
                      <div className="lmis-material-card-body">
                        <div className="lmis-card-badge-row">
                          <div className="lmis-badge-group">
                            <span className={`badge ${badgeCls}`}>{badgeIcon}</span>
                            {r.unit_or_week && r.unit_or_week !== r.title && <span className="badge badge-ice" style={{ fontSize: '0.68rem', fontWeight: 700 }}>{r.unit_or_week}</span>}
                          </div>
                          <span className="badge badge-navy" style={{ fontWeight: 800 }}>{r.course_code}</span>
                        </div>

                        <h3 className="lmis-material-title">
                          {r.title}
                        </h3>

                        <p className="lmis-material-desc">
                          {r.description || 'Official curriculum learning material.'}
                        </p>

                        {r.attachments && r.attachments.length > 0 && (
                          <div
                            className="lmis-material-attachment-chip"
                            title={`Click to download "${r.attachments[0].name}"`}
                            onClick={(e) => {
                              e.stopPropagation();
                              downloadMaterial(r);
                            }}
                            style={{ cursor: 'pointer' }}
                          >
                            <span className="lmis-clip-icon">📎</span>
                            <span className="lmis-attachment-filename">{r.attachments[0].name}</span>
                            {r.attachments[0].size > 0 && (
                              <span className="lmis-attachment-size">({fmtBytes(r.attachments[0].size)})</span>
                            )}
                          </div>
                        )}

                        <div className="lmis-material-meta">
                          <span>Facilitator: <strong style={{ color: 'var(--text-main)' }}>{r.lecturer_name || 'Academic Faculty'}</strong></span>
                          <span>{fmtDate(r.created_at)}</span>
                        </div>
                      </div>

                      <div className="lmis-material-card-footer">
                        <div className="lmis-btn-group">
                          <button
                            type="button"
                            className="btn btn-sm btn-outline"
                            style={{ fontWeight: 700, gap: '0.4rem' }}
                            onClick={() => handleOpenMaterial(r)}
                          >
                            {isVid ? '▶ Watch' : '👁 View Material'}
                          </button>
                          <button
                            type="button"
                            className="btn btn-sm btn-gold"
                            style={{ fontWeight: 700, gap: '0.35rem' }}
                            onClick={() => downloadMaterial(r)}
                          >
                            <IcoDl size={13} /> Download
                          </button>
                        </div>

                        <button
                          type="button"
                          className={`btn btn-sm lmis-btn-review ${isDone ? 'btn-emerald' : 'btn-outline'}`}
                          style={{ fontWeight: 700, fontSize: '0.75rem' }}
                          onClick={(e) => handleToggleCompletion(e, r)}
                          title="Mark this material as reviewed"
                        >
                          {isDone ? '✓ Reviewed' : '○ Mark as Read'}
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        );
      })()}

      {/* FEES & STIPENDS */}
      {activeTab === 'fees' && (() => {
        const isFunded = myProfile?.funding_type !== 'self_paying';
        const myStipends = (stipend_disbursements || []).filter(d => 
          (d.learner_email || '').toLowerCase().trim() === cleanActive
        );
        const totalStipendsReceived = myStipends.filter(s => s.status === 'Paid').reduce((sum, s) => sum + Number(s.stipend_amount || 0), 0);

        return (
          <div>
            <div className="lmis-page-header flex-between" style={{ alignItems: 'flex-start', flexWrap: 'wrap', gap: '0.75rem' }}>
              <div>
                <h1 className="lmis-page-title">
                  {isFunded ? 'Learner Stipends & Financial Grant' : 'Fees & Invoices'}
                </h1>
                <p className="lmis-page-sub">
                  {isFunded 
                    ? `Active ${myProfile?.funder_name || 'Services SETA'} bursary allocation & monthly living stipends.`
                    : `Outstanding: ${fmtZAR(myFees.filter(f => f.status !== 'Paid').reduce((s, f) => s + (f.amount - (f.amount_paid || 0)), 0))}`
                  }
                </p>
              </div>
              <span className={`badge ${isFunded ? 'badge-emerald' : 'badge-navy'}`} style={{ fontSize: '0.8rem', padding: '0.35rem 0.75rem' }}>
                {isFunded ? `🟢 Funded Learner (${myProfile?.funder_name || 'Services SETA'})` : '🔵 Self-Paying Learner'}
              </span>
            </div>

            {/* FUNDED LEARNER VIEW */}
            {isFunded ? (
              <div>
                {/* Stipend Overview Card */}
                <div className="lmis-card mb-4" style={{ background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.08), rgba(30, 58, 138, 0.05))', border: '1px solid rgba(16, 185, 129, 0.25)' }}>
                  <div className="lmis-card-body">
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem' }}>
                      <div>
                        <span className="badge badge-emerald" style={{ marginBottom: '0.5rem', display: 'inline-flex', alignItems: 'center', gap: '0.3rem' }}>
                          ✓ Fully Funded Bursary Grant
                        </span>
                        <h2 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--text-main, #0f172a)', margin: '0 0 0.35rem 0' }}>
                          Monthly Living Allowance: {fmtZAR(myProfile?.stipend_amount || 4500)}
                        </h2>
                        <p style={{ fontSize: '0.78rem', color: 'var(--text-sub)', margin: 0 }}>
                          Sponsored by <strong>{myProfile?.funder_name || 'Services SETA'}</strong> for the <em>{myProfile?.programme_enrolled || 'Business Process and Work Study Management'}</em> programme.
                        </p>
                      </div>

                      <div style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: '8px', padding: '0.75rem 1rem', minWidth: '220px' }}>
                        <div style={{ fontSize: '0.7rem', fontWeight: 700, textTransform: 'uppercase', color: 'var(--text-sub)', letterSpacing: '0.05em' }}>
                          Disbursement Account On File
                        </div>
                        <div style={{ fontWeight: 700, fontSize: '0.88rem', color: 'var(--primary-navy, #1e3a8a)', marginTop: '0.2rem' }}>
                          {myProfile?.bank_name || 'Standard Bank'}
                        </div>
                        <div style={{ fontSize: '0.74rem', color: 'var(--text-sub)', fontFamily: 'monospace' }}>
                          Acc: ••••{String(myProfile?.bank_account_number || '••••').slice(-4)} ({myProfile?.bank_account_type || 'Savings'})
                        </div>
                      </div>
                    </div>

                    <div style={{ marginTop: '1.25rem', paddingTop: '1rem', borderTop: '1px solid rgba(0,0,0,0.06)', display: 'flex', gap: '1.5rem', flexWrap: 'wrap' }}>
                      <div>
                        <div style={{ fontSize: '0.7rem', color: 'var(--text-sub)' }}>Total Stipends Received to Date</div>
                        <div style={{ fontSize: '1.1rem', fontWeight: 800, color: '#10b981' }}>{fmtZAR(totalStipendsReceived)}</div>
                      </div>
                      <div>
                        <div style={{ fontSize: '0.7rem', color: 'var(--text-sub)' }}>Tuition Fee Liability</div>
                        <div style={{ fontSize: '1.1rem', fontWeight: 800, color: 'var(--primary-navy)' }}>R 0.00 (100% Subsidized)</div>
                      </div>
                      <div>
                        <div style={{ fontSize: '0.7rem', color: 'var(--text-sub)' }}>Disbursement Mode</div>
                        <div style={{ fontSize: '1.1rem', fontWeight: 800, color: 'var(--text-main)' }}>Direct API EFT (RTC)</div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Stipends History Table */}
                <div className="lmis-card">
                  <div className="lmis-card-header flex-between">
                    <span className="lmis-card-title">Monthly Stipend Payment History</span>
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-sub)' }}>
                      {myStipends.length} record(s) logged
                    </span>
                  </div>
                  {myStipends.length === 0 ? (
                    <div className="lmis-empty" style={{ padding: '2.5rem 1rem' }}>
                      <IcoWallet size={40} style={{ color: '#CBD5E1', marginBottom: '0.5rem' }} />
                      <p className="lmis-empty-title">No stipend disbursements recorded yet</p>
                      <p className="lmis-empty-sub">
                        Your monthly living allowance will appear here as soon as finance executes the scheduled disbursement run.
                      </p>
                    </div>
                  ) : (
                    <div className="lmis-table-wrap">
                      <table className="lmis-table">
                        <thead>
                          <tr>
                            <th>Period</th>
                            <th>Amount</th>
                            <th>Status</th>
                            <th>Reference</th>
                            <th>Disbursed Date</th>
                            <th>Bank Account</th>
                            <th style={{ textAlign: 'right' }}>Official POP</th>
                          </tr>
                        </thead>
                        <tbody>
                          {myStipends.map(stip => (
                            <tr key={stip.id}>
                              <td style={{ fontWeight: 700 }}>{stip.period_label || stip.period}</td>
                              <td style={{ fontWeight: 800, color: '#10b981' }}>{fmtZAR(stip.stipend_amount)}</td>
                              <td>
                                <span className={`badge ${stip.status === 'Paid' ? 'badge-emerald' : 'badge-orange'}`}>
                                  {stip.status === 'Paid' ? '✓ Paid & Cleared' : stip.status}
                                </span>
                              </td>
                              <td>
                                <span style={{ fontFamily: 'monospace', fontSize: '0.75rem' }}>{stip.transaction_reference}</span>
                              </td>
                              <td style={{ color: 'var(--text-sub)', fontSize: '0.78rem' }}>
                                {fmtDate(stip.disbursed_at)}
                              </td>
                              <td style={{ fontSize: '0.74rem', color: 'var(--text-sub)' }}>
                                {stip.bank_name} (••••{String(stip.bank_account_number || '').slice(-4)})
                              </td>
                              <td style={{ textAlign: 'right' }}>
                                <button
                                  type="button"
                                  className="btn btn-sm btn-outline"
                                  style={{ fontSize: '0.7rem', padding: '0.25rem 0.6rem', fontWeight: 600, borderColor: '#10b981', color: '#047857' }}
                                  onClick={() => {
                                    generateProofOfStipendPaymentPDF({
                                      disbursementId: stip.id,
                                      transactionReference: stip.transaction_reference,
                                      periodLabel: stip.period_label,
                                      learnerName: myProfile?.learner_name || activeEmail,
                                      learnerEmail: activeEmail,
                                      studentNumber: myProfile?.student_number,
                                      idPassport: myProfile?.id_passport,
                                      stipendAmount: stip.stipend_amount,
                                      funderName: stip.funder_name || myProfile?.funder_name || 'Services SETA',
                                      programmeName: myProfile?.programme_enrolled || 'Business Process Management',
                                      bankName: stip.bank_name || myProfile?.bank_name,
                                      bankAccountNumber: stip.bank_account_number || myProfile?.bank_account_number,
                                      bankBranchCode: stip.bank_branch_code || myProfile?.bank_branch_code,
                                      bankAccountType: stip.bank_account_type || myProfile?.bank_account_type,
                                      sourceBankName: institutional_banking_config?.bank_name || 'Nedbank Corporate Banking',
                                      sourceAccountNumber: institutional_banking_config?.account_number || '1198472910',
                                      payoutChannel: stip.payout_channel || 'Direct API EFT',
                                      disbursedAt: stip.disbursed_at,
                                      disbursedBy: stip.disbursed_by || 'Finance Office'
                                    });
                                    showToast('Downloaded official Proof of Payment!');
                                  }}
                                >
                                  📄 Download POP (PDF)
                                </button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              /* SELF-PAYING LEARNER VIEW */
              <div>
                <div style={{ background: 'rgba(59, 130, 246, 0.08)', border: '1px solid rgba(59, 130, 246, 0.25)', borderRadius: '8px', padding: '0.85rem 1rem', marginBottom: '1.25rem' }}>
                  <p style={{ margin: 0, fontSize: '0.78rem', color: 'var(--text-sub)' }}>
                    ℹ️ <strong>Self-Paying Learner Notice:</strong> You are registered as a self-funded learner. Your tuition fees and invoices are listed below. Self-paying learners do not receive monthly living stipends.
                  </p>
                </div>

                {myFees.length === 0 ? (
                  <div className="lmis-card">
                    <div className="lmis-empty">
                      <IcoWallet size={40} style={{ color: '#CBD5E1' }} />
                      <p className="lmis-empty-title">No invoices</p>
                      <p className="lmis-empty-sub">Fee invoices will appear when you are enrolled in a module or course.</p>
                    </div>
                  </div>
                ) : (
                  myFees.map(f => (
                    <div key={f.id} className="lmis-fee-item">
                      <div className="lmis-fee-info">
                        <div className="lmis-fee-desc">{f.description}</div>
                        <div className="lmis-fee-inv">Inv: {f.invoice_number} · Due: {fmtDate(f.due_date)}</div>
                      </div>
                      <div style={{ textAlign: 'right' }}>
                        <div className="lmis-fee-amount">{fmtZAR(f.amount)}</div>
                        <span className={`badge ${f.status === 'Paid' ? 'badge-emerald' : 'badge-red'}`}>{f.status}</span>
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}
          </div>
        );
      })()}

      {/* CERTIFICATES */}
      {activeTab === 'certificates' && (
        <div>
          <div className="lmis-page-header">
            <h1 className="lmis-page-title">My Certificates</h1>
            <p className="lmis-page-sub">Your earned qualifications, practical competencies, and official completion certificates.</p>
          </div>

          {/* Self-Paying Executive Track Clearance & Download Card */}
          <div className="lmis-card" style={{ marginBottom: '1.5rem', border: '1px solid rgba(217, 119, 6, 0.35)', background: 'linear-gradient(135deg, rgba(30, 41, 59, 0.7), rgba(217, 119, 6, 0.08))' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
              <div>
                <span className="badge badge-gold" style={{ marginBottom: '0.45rem' }}>Self-Paying Learner Track</span>
                <h3 style={{ fontSize: '1.15rem', fontWeight: 800, margin: '0.2rem 0', color: 'var(--text-main, #fff)' }}>
                  Certificate of Completion (Self-Funded Enrolment)
                </h3>
                <p style={{ fontSize: '0.82rem', color: 'var(--text-sub, #94a3b8)', margin: 0, maxWidth: '640px', lineHeight: 1.5 }}>
                  This official landscape certificate certifies full practical coursework fulfillment, continuous assessment clearance, and verified self-funded candidate status for <strong>{myProfile?.programme_enrolled || 'Enterprise Process Transformation'}</strong>.
                </p>
              </div>
              <button
                className="btn btn-gold"
                style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', fontWeight: 700, padding: '0.65rem 1.25rem' }}
                onClick={() => {
                  generateCompletionCertificatePDF({
                    learnerName: myProfile?.learner_name || activeEmail,
                    studentNumber: myProfile?.student_number || 'NX-2026-SP',
                    idPassport: myProfile?.id_passport,
                    programmeTitle: myProfile?.programme_enrolled || 'Business Process and Work Study Management',
                    grade: '88% (Practical Distinction)',
                    isSelfPaying: true
                  });
                  showToast('Certificate of Completion (Self-Paying) generated!');
                }}
              >
                🎓 Download Certificate of Completion (PDF)
              </button>
            </div>
          </div>

          {myCerts.length === 0 ? (
            <div className="lmis-card">
              <div className="lmis-empty">
                <IcoAward size={40} style={{ color: '#CBD5E1' }} />
                <p className="lmis-empty-title">Archived Institutional Certificates</p>
                <p className="lmis-empty-sub">Additional module certificates issued directly by your academic coordinator will appear here.</p>
              </div>
            </div>
          ) : (
            <div className="lmis-3col">
              {myCerts.map(c => (
                <div key={c.id} className="lmis-cert-card" style={{ display: 'flex', flexDirection: 'col', justifyContent: 'space-between' }}>
                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
                      <span className="badge badge-gold">{c.status}</span>
                      <span style={{ fontSize: '0.68rem', color: '#10b981', fontWeight: 700 }}>SELF-PAYING</span>
                    </div>
                    <h3 style={{ fontWeight: 800, fontSize: '1rem', color: '#fff', marginBottom: '0.4rem' }}>{c.programme_title || c.course_code}</h3>
                    <p style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.55)', marginBottom: '0.5rem' }}>Issued: {fmtDate(c.issue_date)}</p>
                    <p style={{ fontSize: '0.7rem', color: 'var(--gold)', fontFamily: 'monospace', fontWeight: 700, marginBottom: '0.75rem' }}>{c.certificate_number || '—'}</p>
                  </div>
                  <button
                    className="btn btn-sm btn-gold"
                    style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.35rem', fontWeight: 700 }}
                    onClick={() => {
                      generateCompletionCertificatePDF({
                        learnerName: c.learner_name || myProfile?.learner_name || activeEmail,
                        studentNumber: c.student_number || myProfile?.student_number || 'NX-2026-SP',
                        idPassport: myProfile?.id_passport,
                        programmeTitle: c.programme_title || c.course_code || myProfile?.programme_enrolled,
                        certificateNumber: c.certificate_number,
                        issueDate: c.issue_date,
                        grade: c.grade || '88% (Practical Distinction)',
                        isSelfPaying: true
                      });
                      showToast('Certificate of Completion (Self-Paying) generated!');
                    }}
                  >
                    📄 Download PDF
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* PROFILE */}
      {activeTab === 'profile' && (
        <div>
          <div className="lmis-page-header flex-between">
            <div><h1 className="lmis-page-title">My Profile</h1><p className="lmis-page-sub">Your registered academic profile.</p></div>
            {myProfile && !editingProfile && (
              <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                <button className="btn btn-sm btn-gold" onClick={() => {
                  generateProofOfRegistrationPDF({
                    name: myProfile.learner_name,
                    email: activeEmail,
                    number: myProfile.student_number,
                    role: 'Learner',
                    idPassport: myProfile.id_passport,
                    phone: myProfile.phone,
                    qualification: myProfile.programme_enrolled || 'Business Process and Work Study Management'
                  });
                  showToast('Proof of Registration PDF generated!');
                }}>
                  📄 Download Proof of Registration (PDF)
                </button>
                <button className="btn btn-sm btn-outline" onClick={() => { setEditingProfile(true); setProfileForm({ ...myProfile }); }}>
                  <IcoEdit size={14} /> Edit
                </button>
              </div>
            )}
          </div>
          {!myProfile
            ? <div className="lmis-card"><div className="lmis-empty"><IcoUser size={40} style={{ color: '#CBD5E1' }} /><p className="lmis-empty-title">Profile not set up</p><p className="lmis-empty-sub">Contact your Administrator to complete your registration.</p></div></div>
            : editingProfile
              ? (
                <div className="lmis-card">
                  <div className="lmis-card-header"><span className="lmis-card-title">Edit Profile &amp; Documents</span></div>
                  <div className="lmis-card-body">
                    <form onSubmit={handleProfileSave}>
                      <div className="lmis-form-grid mb-4">
                        {[
                          ['Full Name', 'learner_name'], ['Phone', 'phone'],
                          ['Address', 'address'], ['City', 'city'],
                          ['Province', 'province'], ['Postal Code', 'postal_code'],
                          ['Employment Status', 'employment_status'], ['Employer', 'employer'],
                        ].map(([lbl, key]) => (
                          <div key={key} className="lmis-field">
                            <label className="lmis-label">{lbl}</label>
                            <input className="lmis-input" value={profileForm[key] || ''} onChange={e => setProfileForm({ ...profileForm, [key]: e.target.value })} />
                          </div>
                        ))}
                        <div className="lmis-field">
                          <label className="lmis-label">Highest Qualification / Grade</label>
                          <select className="lmis-select" value={profileForm.highest_qualification || 'Matric / Grade 12'} onChange={e => setProfileForm({ ...profileForm, highest_qualification: e.target.value })}>
                            {['Matric / Grade 12', 'Higher Certificate', 'Diploma', 'Bachelor\'s Degree', 'Honours / Postgraduate', 'Master\'s / Doctorate', 'Grade 10-11', 'Grade 9 or lower'].map(q => <option key={q}>{q}</option>)}
                          </select>
                        </div>
                        <div className="lmis-field">
                          <label className="lmis-label">Age</label>
                          <input type="number" className="lmis-input" value={profileForm.age || ''} onChange={e => setProfileForm({ ...profileForm, age: Number(e.target.value) })} min="15" max="99" />
                        </div>
                      </div>

                      <h3 className="lmis-card-title" style={{ fontSize: '0.9rem', marginBottom: '0.875rem', borderTop: '1px solid var(--ice2)', paddingTop: '1.25rem' }}>Next of Kin / Emergency Contact</h3>
                      <div className="lmis-form-grid mb-4">
                        <div className="lmis-field">
                          <label className="lmis-label">Next of Kin Full Name</label>
                          <input className="lmis-input" value={profileForm.emergency_contact_name || ''} onChange={e => setProfileForm({ ...profileForm, emergency_contact_name: e.target.value })} required />
                        </div>
                        <div className="lmis-field">
                          <label className="lmis-label">Next of Kin Phone Number</label>
                          <input className="lmis-input" value={profileForm.emergency_contact_phone || ''} onChange={e => setProfileForm({ ...profileForm, emergency_contact_phone: e.target.value })} required />
                        </div>
                        <div className="lmis-field">
                          <label className="lmis-label">Relationship to Learner</label>
                          <input className="lmis-input" value={profileForm.emergency_contact_relation || ''} onChange={e => setProfileForm({ ...profileForm, emergency_contact_relation: e.target.value })} required placeholder="e.g. Parent, Spouse, Guardian" />
                        </div>
                      </div>

                      <h3 className="lmis-card-title" style={{ fontSize: '0.9rem', marginBottom: '0.875rem', borderTop: '1px solid var(--ice2)', paddingTop: '1.25rem' }}>Upload Compliance Documents (for Stipend Processing)</h3>
                      <div className="lmis-2col" style={{ gap: '1.5rem', marginBottom: '1.5rem' }}>
                        <FileAttachmentZone
                          label="ID Copy (Green book or Smart Card)"
                          attachments={profileForm.id_copy_attachments || []}
                          onChange={files => setProfileForm(prev => ({ ...prev, id_copy_attachments: files }))}
                          maxFiles={2}
                          bucket="lmis-documents"
                          filePathPrefix={`${activeEmail}/id`}
                        />
                        <FileAttachmentZone
                          label="Proof of Bank Account (less than 3 months old)"
                          attachments={profileForm.bank_proof_attachments || []}
                          onChange={files => setProfileForm(prev => ({ ...prev, bank_proof_attachments: files }))}
                          maxFiles={1}
                          bucket="lmis-documents"
                          filePathPrefix={`${activeEmail}/bank`}
                        />
                      </div>
                      <div style={{ marginBottom: '1.5rem' }}>
                        <FileAttachmentZone
                          label="Matric Certificate / Highest Grade Certificate"
                          attachments={profileForm.qualification_proof_attachments || []}
                          onChange={files => setProfileForm(prev => ({ ...prev, qualification_proof_attachments: files }))}
                          maxFiles={3}
                          bucket="lmis-documents"
                          filePathPrefix={`${activeEmail}/matric`}
                        />
                      </div>

                      <div className="lmis-form-actions">
                        <button type="button" className="btn btn-sm btn-ghost" onClick={() => setEditingProfile(false)}>Cancel</button>
                        <button type="submit" className="btn btn-sm btn-gold"><IcoSave size={14} /> Save Changes &amp; Files</button>
                      </div>
                    </form>
                  </div>
                </div>
              )
              : (
                <div>
                  <div className="lmis-2col mb-4">
                    {[
                      { title: 'Personal Information', fields: [
                        ['Full Name', myProfile.learner_name],
                        ['Student Number', myProfile.student_number],
                        ['Email', myProfile.learner_email],
                        ['Phone', myProfile.phone || '—'],
                        ['ID / Passport', myProfile.id_passport || '—'],
                        ['Age', myProfile.age ? `${myProfile.age} years` : '—'],
                      ]},
                      { title: 'Address', fields: [
                        ['Street Address', myProfile.address || '—'],
                        ['City', myProfile.city || '—'],
                        ['Province', myProfile.province || '—'],
                        ['Postal Code', myProfile.postal_code || '—'],
                      ]},
                      { title: 'Academic Profile', fields: [
                        ['Highest Qualification', myProfile.highest_qualification || 'Matric / Grade 12'],
                        ['Programme', myProfile.programme_enrolled || '—'],
                        ['Qualification', myProfile.qualification || '—'],
                        ['Employment', myProfile.employment_status || '—'],
                        ['Employer', myProfile.employer || '—'],
                      ]},
                      { title: 'Emergency Contact', fields: [
                        ['Name', myProfile.emergency_contact_name || '—'],
                        ['Phone', myProfile.emergency_contact_phone || '—'],
                        ['Relation', myProfile.emergency_contact_relation || '—'],
                      ]},
                    ].map(section => (
                      <div key={section.title} className="lmis-card">
                        <div className="lmis-card-header"><span className="lmis-card-title">{section.title}</span></div>
                        <div className="lmis-card-body">
                          {section.fields.map(([lbl, val]) => (
                            <div key={lbl} style={{ display: 'flex', justifyContent: 'space-between', padding: '0.6rem 0', borderBottom: '1px solid var(--ice2)', fontSize: '0.82rem' }}>
                              <span style={{ color: 'var(--text-sub)', fontWeight: 600 }}>{lbl}</span>
                              <span style={{ color: 'var(--text-main)', fontWeight: 500, textAlign: 'right', maxWidth: '60%' }}>{val}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Password Management */}
                  <div className="lmis-card mb-4">
                    <div className="lmis-card-header"><span className="lmis-card-title">🔑 Security &amp; Custom Password</span></div>
                    <div className="lmis-card-body">
                      <form onSubmit={handleSaveCustomPassword}>
                        <p style={{ fontSize: '0.78rem', color: 'var(--text-sub)', marginBottom: '0.75rem' }}>
                          You can generate or create your own custom password to log in to the NexaTransform platform.
                        </p>
                        <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', alignItems: 'center' }}>
                          <input
                            type="text"
                            className="lmis-input"
                            placeholder="Enter new password..."
                            value={newPasswordInput}
                            onChange={e => setNewPasswordInput(e.target.value)}
                            style={{ maxWidth: '280px', flex: 1 }}
                          />
                          <button type="button" className="btn btn-sm btn-outline" onClick={generateRandomPassword}>
                            🎲 Generate Strong Password
                          </button>
                          <button type="submit" className="btn btn-sm btn-gold">
                            Save Password
                          </button>
                        </div>
                      </form>
                    </div>
                  </div>

                  <div className="lmis-card">
                    <div className="lmis-card-header"><span className="lmis-card-title">Verification Compliance Status (Stipend Eligibility)</span></div>
                    <div className="lmis-card-body">
                      <div className="lmis-3col">
                        {[
                          { title: 'ID Verification', files: myProfile.id_copy_attachments, desc: 'Certified copy of SA Identity document or passport.' },
                          { title: 'Proof of Bank Account', files: myProfile.bank_proof_attachments, desc: 'Recent bank statement or verification letter.' },
                          { title: 'Qualification Certificate', files: myProfile.qualification_proof_attachments, desc: 'Certified matric certificate or highest academic grade.' }
                        ].map(doc => {
                          const uploaded = doc.files && doc.files.length > 0;
                          return (
                            <div key={doc.title} style={{ padding: '1rem', border: '1px solid var(--ice2)', borderRadius: '8px', background: 'var(--ice)' }}>
                              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                                <span style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--navy)' }}>{doc.title}</span>
                                <span className={`badge ${uploaded ? 'badge-emerald' : 'badge-red'}`}>{uploaded ? 'Uploaded' : 'Required'}</span>
                              </div>
                              <p style={{ fontSize: '0.72rem', color: 'var(--text-sub)', marginBottom: '1rem', height: '36px' }}>{doc.desc}</p>
                              {uploaded ? (
                                <AttachmentList attachments={doc.files} />
                              ) : (
                                <button className="btn btn-sm btn-outline btn-full" onClick={() => { setEditingProfile(true); setProfileForm({ ...myProfile }); }}>Upload Documents</button>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                </div>
              )
          }
        </div>
      )}

      {/* MESSAGES */}
      {activeTab === 'messages' && (
        <div>
          <div className="lmis-page-header flex-between">
            <div><h1 className="lmis-page-title">Messages</h1><p className="lmis-page-sub">Communicate with lecturers and admin.</p></div>
            <button className="btn btn-sm btn-gold" onClick={() => setComposingMsg(true)}><IcoSend size={14} /> New Message</button>
          </div>
          {composingMsg && (
            <div className="lmis-card mb-4">
              <div className="lmis-card-header"><span className="lmis-card-title">Compose Message</span><button className="btn btn-sm btn-ghost" onClick={() => setComposingMsg(false)}><IcoX size={14} /></button></div>
              <div className="lmis-card-body">
                <form onSubmit={handleSendMsg} className="lmis-form-grid">
                  <div className="lmis-field">
                    <label className="lmis-label">To</label>
                    <select className="lmis-select" value={msgForm.to} onChange={e => setMsgForm({ ...msgForm, to: e.target.value })}>
                      {['Administration','Finance Office','Student Support'].map(r => <option key={r}>{r}</option>)}
                    </select>
                  </div>
                  <div className="lmis-field">
                    <label className="lmis-label">Subject</label>
                    <input className="lmis-input" value={msgForm.subject} onChange={e => setMsgForm({ ...msgForm, subject: e.target.value })} required placeholder="Message subject" />
                  </div>
                  <div className="lmis-field" style={{ gridColumn: '1/-1' }}>
                    <label className="lmis-label">Message</label>
                    <textarea className="lmis-textarea" value={msgForm.content} onChange={e => setMsgForm({ ...msgForm, content: e.target.value })} required placeholder="Write your message..." />
                  </div>
                  <div className="lmis-form-actions" style={{ gridColumn: '1/-1' }}>
                    <button type="submit" className="btn btn-sm btn-gold"><IcoSend size={14} /> Send</button>
                  </div>
                </form>
              </div>
            </div>
          )}
          {myMessages.length === 0
            ? <div className="lmis-card"><div className="lmis-empty"><IcoMail size={40} style={{ color: '#CBD5E1' }} /><p className="lmis-empty-title">No messages</p></div></div>
            : myMessages.map(m => (
              <div key={m.id} className={`lmis-msg-item${!m.is_read && m.recipient_email === activeEmail ? ' unread' : ''}`}>
                <div className="flex-between"><div className="lmis-msg-from">{m.sender_role === 'Learner' ? `To: ${m.recipient_name}` : `From: ${m.sender_name}`}</div><span style={{ fontSize: '0.7rem', color: 'var(--muted)' }}>{fmtDate(m.created_date)}</span></div>
                <div className="lmis-msg-subject">{m.subject}</div>
                <div className="lmis-msg-preview">{m.content}</div>
              </div>
            ))
          }
        </div>
      )}

      {/* NOTIFICATIONS */}
      {activeTab === 'notifications' && (
        <div>
          <div className="lmis-page-header flex-between">
            <div><h1 className="lmis-page-title">Notifications</h1><p className="lmis-page-sub">{unreadNotifs} unread</p></div>
            {unreadNotifs > 0 && <button className="btn btn-sm btn-outline" onClick={() => myNotifs.forEach(n => updateRecord('notifications', n.id, { is_read: true }))}>Mark all read</button>}
          </div>
          {myNotifs.length === 0
            ? <div className="lmis-card"><div className="lmis-empty"><IcoBell size={40} style={{ color: '#CBD5E1' }} /><p className="lmis-empty-title">No notifications</p></div></div>
            : myNotifs.map(n => (
              <div key={n.id} className={`lmis-announce-item${!n.is_read ? ' unread' : ''}`} style={{ borderLeft: !n.is_read ? '3px solid var(--gold)' : undefined }}>
                <div className="flex-between">
                  <div className="lmis-announce-title">{n.title}</div>
                  {!n.is_read && <span className="badge badge-gold">New</span>}
                </div>
                <div className="lmis-announce-body">{n.content}</div>
              </div>
            ))
          }
        </div>
      )}

      {/* GLOBAL LEARNER STUDY MATERIAL PREVIEW MODAL */}
      {previewMaterial && (() => {
        const resInfo = getValidResourceUrl(previewMaterial);
        const url = resInfo.url;
        const isPpt = previewMaterial.type === 'Presentation' || previewMaterial.type === 'Slides' || previewMaterial.attachments?.[0]?.name?.endsWith('.pptx') || previewMaterial.attachments?.[0]?.name?.endsWith('.ppt') || (previewMaterial.file_url && previewMaterial.file_url.includes('.ppt'));
        const isVid = previewMaterial.type === 'Video' || previewMaterial.attachments?.[0]?.name?.endsWith('.mp4') || previewMaterial.file_url?.includes('youtube') || previewMaterial.file_url?.includes('vimeo') || (previewMaterial.file_url && previewMaterial.file_url.includes('.mp4'));
        const isYouTube = url?.includes('youtube.com') || url?.includes('youtu.be');
        const ytEmbed = isYouTube
          ? (url.includes('embed') ? url : `https://www.youtube.com/embed/${url.split('v=')[1]?.split('&')[0] || url.split('/').pop()}`)
          : null;
        const isDone = !!(completedResources || {})[previewMaterial.id];
        const fileName = previewMaterial.attachments?.[0]?.name || (previewMaterial.title ? `${previewMaterial.title.replace(/[^a-zA-Z0-9_-]/g, '_')}.${isPpt ? 'pptx' : isVid ? 'mp4' : 'pdf'}` : 'study-material');
        const fileSize = previewMaterial.attachments?.[0]?.size || 0;

        return (
          <div style={{ position: 'fixed', inset: 0, zIndex: 9999, background: 'rgba(0,0,0,0.78)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem', backdropFilter: 'blur(5px)' }}>
            <div style={{ background: 'var(--bg-card)', color: 'var(--text-main)', border: '1px solid var(--border-color)', borderRadius: '12px', width: '100%', maxWidth: showNotesDrawer ? '1120px' : '940px', maxHeight: '94vh', display: 'flex', flexDirection: 'column', overflow: 'hidden', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.4)', transition: 'max-width 0.25s ease' }}>
              
              {/* Header */}
              <div style={{ padding: '1rem 1.25rem', borderBottom: '1px solid var(--border-color)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'var(--bg-card-header)' }}>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
                    <span className="badge badge-gold">{previewMaterial.course_code}</span>
                    {previewMaterial.unit_or_week && <span className="badge badge-ice">{previewMaterial.unit_or_week}</span>}
                    <h3 style={{ margin: 0, fontSize: '1rem', fontWeight: 800, color: 'var(--primary-navy)' }}>{previewMaterial.title}</h3>
                  </div>
                  <p style={{ margin: '0.2rem 0 0 0', fontSize: '0.72rem', color: 'var(--text-sub)' }}>
                    Facilitator: {previewMaterial.lecturer_name || 'Academic Faculty'} · {previewMaterial.description}
                  </p>
                </div>
                
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <button
                    type="button"
                    className={`btn btn-xs ${showNotesDrawer ? 'btn-gold' : 'btn-outline'}`}
                    onClick={() => setShowNotesDrawer(!showNotesDrawer)}
                  >
                    📝 {showNotesDrawer ? 'Hide Notes' : 'My Study Notes'}
                  </button>
                  <button type="button" className="btn btn-sm btn-ghost" onClick={() => { setPreviewMaterial(null); setShowNotesDrawer(false); }}>
                    <IcoX size={18} />
                  </button>
                </div>
              </div>

              {/* Main Content Area (Viewer + Optional Side Notes Drawer) */}
              <div className="lmis-modal-content-wrap" style={{ display: 'flex', flex: 1, minHeight: 0, overflow: 'hidden' }}>
                {/* Media Viewer Area */}
                <div style={{ flex: 1, overflowY: 'auto', padding: '1.5rem', background: '#0f172a', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  {isVid ? (
                    isYouTube ? (
                      <iframe
                        src={ytEmbed}
                        title={previewMaterial.title}
                        style={{ width: '100%', height: '480px', border: 'none', borderRadius: '8px' }}
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                        allowFullScreen
                      />
                    ) : (
                      <video
                        src={url}
                        controls
                        autoPlay
                        style={{ width: '100%', maxHeight: '68vh', borderRadius: '8px' }}
                      >
                        Your browser does not support HTML5 video playback.
                      </video>
                    )
                  ) : isPpt ? (
                    <div style={{ background: '#1e293b', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px', padding: '2.5rem 2rem', textAlign: 'center', maxWidth: '640px', color: '#f8fafc', boxShadow: '0 20px 25px -5px rgba(0,0,0,0.5)' }}>
                      <div style={{ fontSize: '3.5rem', marginBottom: '1rem' }}>📊</div>
                      <span className="badge badge-gold" style={{ marginBottom: '0.75rem', fontSize: '0.78rem' }}>Microsoft PowerPoint Presentation</span>
                      <h2 style={{ fontSize: '1.25rem', fontWeight: 800, margin: '0.5rem 0', color: '#ffffff' }}>{previewMaterial.title}</h2>
                      <p style={{ fontSize: '0.85rem', color: '#94a3b8', margin: '0.5rem 0 1.5rem 0', lineHeight: 1.5 }}>
                        {previewMaterial.description || 'Comprehensive lecture slide deck and curriculum reference material.'}
                      </p>
                      <div style={{ background: 'rgba(255,255,255,0.05)', padding: '0.75rem 1rem', borderRadius: '8px', display: 'inline-flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.75rem', fontSize: '0.8rem', color: '#cbd5e1' }}>
                        <span>📎 <strong>{fileName}</strong></span>
                        {fileSize > 0 && <span style={{ color: '#94a3b8' }}>({fmtBytes(fileSize)})</span>}
                      </div>
                      <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'center', flexWrap: 'wrap' }}>
                        <button
                          type="button"
                          className="btn btn-gold"
                          style={{ fontWeight: 700, padding: '0.65rem 1.5rem', fontSize: '0.9rem' }}
                          onClick={() => downloadMaterial(previewMaterial)}
                        >
                          <IcoDl size={16} /> Download & Open Slide Deck (.pptx)
                        </button>
                      </div>
                      <p style={{ fontSize: '0.72rem', color: '#64748b', marginTop: '1.25rem', margin: '1.25rem 0 0 0' }}>
                        💡 Download to open directly in Microsoft PowerPoint, Office 365, Keynote, or Google Slides.
                      </p>
                    </div>
                  ) : (
                    <iframe
                      src={url}
                      title={previewMaterial.title}
                      style={{ width: '100%', height: '580px', border: 'none', borderRadius: '8px', background: '#fff' }}
                    />
                  )}
                </div>

                {/* Sliding Private Notes Drawer */}
                {showNotesDrawer && (
                  <div style={{ width: '320px', background: '#f8fafc', borderLeft: '1px solid var(--ice2)', display: 'flex', flexDirection: 'column', padding: '1rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                      <span style={{ fontWeight: 800, fontSize: '0.85rem', color: 'var(--primary-navy)' }}>📝 My Personal Notes</span>
                      <span style={{ fontSize: '0.68rem', color: 'var(--emerald)' }}>✓ Auto-saved</span>
                    </div>
                    <p style={{ fontSize: '0.72rem', color: 'var(--text-sub)', margin: '0 0 0.75rem 0' }}>
                      Notes are saved privately to your account for this resource.
                    </p>
                    <textarea
                      className="lmis-textarea"
                      style={{ flex: 1, resize: 'none', fontSize: '0.8rem', lineHeight: 1.5, padding: '0.75rem' }}
                      value={studyNotesText}
                      placeholder="Type key lecture takeaways, action items, or exam revision notes here..."
                      onChange={e => {
                        setStudyNotesText(e.target.value);
                        saveLearnerStudyNotes(cleanActive, previewMaterial.id, e.target.value);
                      }}
                    />
                    <button
                      type="button"
                      className="btn btn-xs btn-outline"
                      style={{ marginTop: '0.5rem' }}
                      onClick={() => {
                        navigator.clipboard.writeText(studyNotesText || '');
                        showToast('📋 Study notes copied to clipboard!');
                      }}
                    >
                      📋 Copy Notes
                    </button>
                  </div>
                )}
              </div>

              {/* Footer Actions */}
              <div style={{ padding: '0.875rem 1.25rem', borderTop: '1px solid var(--border-color)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'var(--bg-card-header)', flexWrap: 'wrap', gap: '0.5rem' }}>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-sub)' }}>
                  {isVid ? '🎬 Streamed Video Lesson' : isPpt ? '📊 Interactive PowerPoint Deck' : '📄 Official Study Document'}
                </div>
                <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                  <button
                    type="button"
                    className={`btn btn-sm ${isDone ? 'btn-emerald' : 'btn-outline'}`}
                    onClick={(e) => handleToggleCompletion(e, previewMaterial)}
                  >
                    {isDone ? '✓ Reviewed' : 'Mark as Reviewed'}
                  </button>
                  <button type="button" className="btn btn-sm btn-gold" onClick={() => downloadMaterial(previewMaterial)}>
                    <IcoDl size={14} /> Download File
                  </button>
                </div>
              </div>
            </div>
          </div>
        );
      })()}
    </LmisShell>
  );
};
