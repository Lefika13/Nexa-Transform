import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useData } from '../context/DataContext';
import { ThemeToggle } from '../components/shared/ThemeToggle';
import { SaReportCard } from './SaReportCard';
import './LmisCommon.css';
import './SchoolPortal.css';

export const SchoolAdminPortal = () => {
  const {
    school_classes = [],
    school_students = [],
    activity_exemptions = [],
    term_marks = [],
    student_term_summaries = []
  } = useData();

  // ── Authentication State ──────────────────────────────────────
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [adminUser, setAdminUser] = useState(null);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [loading, setLoading] = useState(false);

  // ── UI State ──────────────────────────────────────────────────
  const [activeTab, setActiveTab] = useState('overview');
  const [selectedStudentId, setSelectedStudentId] = useState('STU-10B-01');
  const [toastMsg, setToastMsg] = useState(null);

  const showToast = (msg) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 3500);
  };

  const handleLogin = (e) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg('');
    setTimeout(() => {
      if (email.toLowerCase().includes('admin') || email.toLowerCase().includes('principal') || email === 'principal@pinecrest.edu.za') {
        setIsAuthenticated(true);
        setAdminUser({ name: 'Dr. J. Khumalo', role: 'Head of School / Principal', school: 'Pinecrest High School', email });
      } else {
        setErrorMsg('Invalid administrator credentials. Try the quick-fill demo below.');
      }
      setLoading(false);
    }, 600);
  };

  const handleQuickFillDemo = () => {
    setEmail('principal@pinecrest.edu.za');
    setPassword('Principal@2026');
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    setAdminUser(null);
    setEmail('');
    setPassword('');
  };

  // ── Selected student report data ──────────────────────────────
  const reportStudent = school_students.find(s => s.id === selectedStudentId) || school_students[0] || {};
  const studentAllMarks = term_marks.filter(m => m.student_id === selectedStudentId);
  const studentAllSummaries = student_term_summaries.filter(s => s.student_id === selectedStudentId);

  // ── LOGIN SCREEN ──────────────────────────────────────────────
  if (!isAuthenticated) {
    return (
      <div className="lmis-root">
        <div className="lmis-login-wrapper">
          <div className="lmis-login-bg" />
          <div className="lmis-login-card">
            <img src="/logo.svg" alt="NexaTransform" className="lmis-login-logo" />
            <h2 className="lmis-login-title">School Admin Portal</h2>
            <p className="lmis-login-sub">NexaTransform School LMIS — K-12 Edition</p>
            <p className="lmis-login-role">Sign in with your authorized school executive credentials</p>

            {errorMsg && (
              <div style={{ background: 'rgba(239,68,68,0.12)', border: '1px solid rgba(239,68,68,0.3)', borderRadius: '8px', padding: '0.65rem 0.85rem', marginBottom: '1rem', fontSize: '0.85rem', color: '#ef4444' }}>
                {errorMsg}
              </div>
            )}

            <form onSubmit={handleLogin} className="lmis-login-form">
              <div className="lmis-form-group">
                <label className="lmis-form-label">Administrator Email</label>
                <input type="email" required className="lmis-form-input" placeholder="principal@pinecrest.edu.za"
                  value={email} onChange={e => setEmail(e.target.value)} />
              </div>
              <div className="lmis-form-group">
                <label className="lmis-form-label">Password</label>
                <input type="password" required className="lmis-form-input" placeholder="••••••••"
                  value={password} onChange={e => setPassword(e.target.value)} />
              </div>
              <button type="submit" className="lmis-login-btn" disabled={loading}>
                {loading ? 'Authenticating...' : 'Sign In as School Admin →'}
              </button>
            </form>

            <div style={{ marginTop: '1.25rem', paddingTop: '1rem', borderTop: '1px solid rgba(255,255,255,0.08)', textAlign: 'center' }}>
              <span style={{ fontSize: '0.75rem', color: '#94A3B8', display: 'block', marginBottom: '0.4rem' }}>Evaluation Quick Fill:</span>
              <button type="button" onClick={handleQuickFillDemo}
                style={{ background: 'rgba(56,189,248,0.12)', border: '1px solid rgba(56,189,248,0.35)', color: '#38BDF8', padding: '0.35rem 0.75rem', borderRadius: '9999px', fontSize: '0.78rem', fontWeight: 600, cursor: 'pointer' }}>
                ⚡ Auto-Fill Principal Credentials
              </button>
            </div>

            <div style={{ marginTop: '1.5rem', textAlign: 'center' }}>
              <Link to="/schools/lmis" style={{ color: '#94A3B8', fontSize: '0.82rem', textDecoration: 'none' }}>
                ← Return to School LMIS Gateway
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ── AUTHENTICATED PORTAL ──────────────────────────────────────
  const tabs = [
    { id: 'overview', label: 'School Cockpit', icon: '📊' },
    { id: 'teachers', label: 'Educators & Staff', icon: '👨‍🏫' },
    { id: 'students', label: 'Pupils & Admissions', icon: '🎓' },
    { id: 'classes', label: 'Grades & Classes', icon: '🏫' },
    { id: 'activities', label: 'Sports & Activities', icon: '⚽' },
    { id: 'reports', label: 'Term Report Cards', icon: '📜' }
  ];

  return (
    <div className="lmis-root">
      {/* Toast */}
      {toastMsg && (
        <div style={{ position: 'fixed', top: '20px', right: '20px', zIndex: 9999, background: 'rgba(15,23,42,0.95)', border: '1px solid #38BDF8', color: '#FFF', padding: '0.75rem 1.25rem', borderRadius: '8px', fontSize: '0.88rem', fontWeight: 600 }}>
          {toastMsg}
        </div>
      )}

      {/* Header */}
      <header className="lmis-header sp-no-print">
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <img src="/logo.svg" alt="Nexa" className="lmis-header-logo" />
          <div>
            <span className="lmis-header-title">{adminUser.school}</span>
            <span style={{ display: 'block', fontSize: '0.7rem', color: '#38BDF8', fontWeight: 600 }}>
              SCHOOL ADMIN PORTAL • EMIS #700400123
            </span>
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <ThemeToggle />
          <div style={{ textAlign: 'right' }}>
            <span style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, color: '#FFF' }}>{adminUser.name}</span>
            <span style={{ fontSize: '0.72rem', color: '#94A3B8' }}>{adminUser.role}</span>
          </div>
          <button onClick={handleLogout} className="lmis-btn-secondary" style={{ padding: '0.4rem 0.85rem', fontSize: '0.8rem' }}>
            Sign Out
          </button>
        </div>
      </header>

      {/* Shell */}
      <div className="lmis-shell">
        <aside className="lmis-sidebar sp-no-print">
          <nav className="lmis-nav">
            {tabs.map(t => (
              <button key={t.id} className={`lmis-nav-item ${activeTab === t.id ? 'active' : ''}`} onClick={() => setActiveTab(t.id)}>
                <span style={{ marginRight: '0.5rem' }}>{t.icon}</span>{t.label}
              </button>
            ))}
          </nav>
          <div className="lmis-sidebar-footer">"Excellence in Academic Governance."</div>
        </aside>

        <main className="lmis-main">

          {/* ── TAB: OVERVIEW ──────────────────────────────── */}
          {activeTab === 'overview' && (
            <div>
              <div className="lmis-header-row" style={{ marginBottom: '1.5rem' }}>
                <div>
                  <h1 className="lmis-page-title">Executive School Cockpit</h1>
                  <p className="lmis-page-sub">Academic compliance, attendance rates, and active curriculum streams.</p>
                </div>
                <button className="lmis-btn-primary" onClick={() => setActiveTab('reports')}>
                  Generate Report Cards →
                </button>
              </div>

              <div className="sp-metrics-grid">
                {[
                  { title: "Today's Attendance Rate", value: '95.4%', sub: '↑ Legal attendance compliant' },
                  { title: 'Enrolled Pupils', value: `${school_students.length} Learners`, sub: 'Across Grades 8 to 12' },
                  { title: 'Active Classes', value: `${school_classes.length} Streams`, sub: 'Homeroom & Registers' },
                  { title: 'Extracurricular Exemptions', value: `${activity_exemptions.length} Today`, sub: 'Live badges preventing false truancy' },
                ].map(card => (
                  <div key={card.title} className="sp-metric-card">
                    <span className="sp-metric-title">{card.title}</span>
                    <div className="sp-metric-value">{card.value}</div>
                    <span className="sp-metric-subtitle">{card.sub}</span>
                  </div>
                ))}
              </div>

              {/* Quick-access action grid */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '1rem', marginTop: '1.5rem' }}>
                {[
                  { title: 'Generate Batch Reports', desc: 'Print all term report cards for a class or grade', btn: 'Go to Report Cards', tab: 'reports', color: '#0284C7' },
                  { title: 'Manage Class Rosters', desc: 'Homeroom classes, register teachers, room assignments', btn: 'View Classes', tab: 'classes', color: '#7C3AED' },
                  { title: 'Activity Exemptions Log', desc: 'Today\'s sport, culture and official excusals', btn: 'View Exemptions', tab: 'activities', color: '#059669' },
                ].map(action => (
                  <div key={action.title} className="lmis-card" style={{ borderTop: `3px solid ${action.color}` }}>
                    <h3 style={{ fontSize: '0.95rem', fontWeight: 700, color: '#FFF', marginBottom: '0.4rem' }}>{action.title}</h3>
                    <p style={{ fontSize: '0.82rem', color: '#94A3B8', marginBottom: '0.85rem' }}>{action.desc}</p>
                    <button className="lmis-btn-primary" style={{ fontSize: '0.8rem', padding: '0.4rem 0.9rem', background: action.color }} onClick={() => setActiveTab(action.tab)}>
                      {action.btn}
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ── TAB: TEACHERS ──────────────────────────────── */}
          {activeTab === 'teachers' && (
            <div className="lmis-card">
              <h2 className="lmis-card-title">Appointed Educators &amp; Faculty Rosters</h2>
              <p className="lmis-card-sub">Assigned class teachers, subject specialists, and departmental allocations.</p>
              <div className="sp-table-wrapper" style={{ marginTop: '1rem' }}>
                <table className="sp-table">
                  <thead>
                    <tr>
                      <th>Educator Name</th><th>Official Email</th><th>Homeroom</th><th>Specialist Subjects</th><th>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {[
                      { name: 'Mr. Lefika Molefe', email: 'molefe@pinecrest.edu.za', homeroom: 'Grade 10B', subjects: 'Business Studies, Economics' },
                      { name: 'Mrs. K. Dlamini', email: 'dlamini@pinecrest.edu.za', homeroom: 'Grade 11A', subjects: 'Pure Mathematics (Set 1 & 2)' },
                      { name: 'Mr. J. Van der Merwe', email: 'vandermerwe@pinecrest.edu.za', homeroom: 'Grade 10A', subjects: 'Physical Sciences, Natural Science' },
                      { name: 'Ms. N. Naidoo', email: 'naidoo@pinecrest.edu.za', homeroom: '—', subjects: 'English Home Language (All Gr 10)' },
                      { name: 'Mrs. T. Khumalo', email: 'tkhumalo@pinecrest.edu.za', homeroom: '—', subjects: 'Life Orientation (Gr 10 & 11)' },
                      { name: 'Mr. B. Maseko', email: 'maseko@pinecrest.edu.za', homeroom: '—', subjects: 'Accounting (Gr 10–12)' },
                      { name: 'Mr. A. Zwane', email: 'zwane@pinecrest.edu.za', homeroom: '—', subjects: 'Geography (Gr 10 & 11)' },
                    ].map(t => (
                      <tr key={t.email}>
                        <td><strong>{t.name}</strong></td>
                        <td>{t.email}</td>
                        <td>{t.homeroom}</td>
                        <td>{t.subjects}</td>
                        <td><span className="sp-badge sp-badge-present">Active Full-Time</span></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* ── TAB: STUDENTS ──────────────────────────────── */}
          {activeTab === 'students' && (
            <div className="lmis-card">
              <h2 className="lmis-card-title">Pupil Directory &amp; Admissions Register</h2>
              <div className="sp-table-wrapper" style={{ marginTop: '1rem' }}>
                <table className="sp-table">
                  <thead>
                    <tr>
                      <th>Student No.</th><th>Full Name</th><th>Class</th><th>DOB</th><th>Parent / Guardian</th><th>Parent Contact</th>
                    </tr>
                  </thead>
                  <tbody>
                    {school_students.map(s => (
                      <tr key={s.id}>
                        <td><code style={{ color: '#38BDF8' }}>{s.student_number}</code></td>
                        <td><strong>{s.full_name}</strong></td>
                        <td>{s.class_name}</td>
                        <td>{s.dob}</td>
                        <td>{s.parent_name}</td>
                        <td>{s.parent_email}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* ── TAB: CLASSES ───────────────────────────────── */}
          {activeTab === 'classes' && (
            <div className="lmis-card">
              <h2 className="lmis-card-title">School Homeroom Classes &amp; Elective Sets</h2>
              <div className="sp-table-wrapper" style={{ marginTop: '1rem' }}>
                <table className="sp-table">
                  <thead>
                    <tr>
                      <th>Class Name</th><th>Grade</th><th>Register Teacher</th><th>Room</th><th>Pupils</th>
                    </tr>
                  </thead>
                  <tbody>
                    {school_classes.map(c => (
                      <tr key={c.id}>
                        <td><strong>{c.name}</strong></td>
                        <td>Grade {c.grade_level}</td>
                        <td>{c.class_teacher_name}</td>
                        <td>{c.room}</td>
                        <td>{c.total_students} Learners</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* ── TAB: ACTIVITIES ────────────────────────────── */}
          {activeTab === 'activities' && (
            <div className="lmis-card">
              <h2 className="lmis-card-title">Extracurricular Fixtures &amp; Activity Exemptions</h2>
              <p className="lmis-card-sub">Active away matches, tours, and medical sign-outs broadcasting live exemption badges across period attendance systems.</p>
              <div className="sp-table-wrapper" style={{ marginTop: '1rem' }}>
                <table className="sp-table">
                  <thead>
                    <tr>
                      <th>Event Title</th><th>Type</th><th>Periods Affected</th><th>Authorized By</th><th>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {activity_exemptions.map(act => (
                      <tr key={act.id}>
                        <td><strong>{act.title}</strong></td>
                        <td><span className="sp-badge sp-badge-sports">{act.activity_type}</span></td>
                        <td>Periods {act.start_period} to {act.end_period}</td>
                        <td>{act.authorized_by}</td>
                        <td><span className="sp-badge sp-badge-present">✓ {act.status}</span></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* ── TAB: REPORT CARDS ──────────────────────────── */}
          {activeTab === 'reports' && (
            <div>
              {/* Controls bar */}
              <div className="lmis-card sp-no-print" style={{ marginBottom: '1.5rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
                  <div style={{ display: 'flex', gap: '1rem', alignItems: 'center', flexWrap: 'wrap' }}>
                    <div>
                      <label style={{ display: 'block', fontSize: '0.75rem', color: '#94A3B8', fontWeight: 700, marginBottom: '0.2rem' }}>LEARNER:</label>
                      <select value={selectedStudentId} onChange={e => setSelectedStudentId(e.target.value)} className="lmis-form-input" style={{ padding: '0.45rem 0.8rem' }}>
                        {school_students.map(s => (
                          <option key={s.id} value={s.id}>{s.full_name} ({s.class_name})</option>
                        ))}
                      </select>
                    </div>
                    <div style={{ fontSize: '0.8rem', color: '#CBD5E1', padding: '0.4rem 0' }}>
                      Showing full-year (Terms 1–3) report for: <strong>{reportStudent.full_name}</strong>
                    </div>
                  </div>

                  <div style={{ display: 'flex', gap: '0.75rem' }}>
                    <button className="lmis-btn-secondary"
                      onClick={() => showToast(`📧 Full year report card batch-emailed to all parents in ${reportStudent.class_name}!`)}>
                      ✉️ Batch Email Parents
                    </button>
                    <button className="lmis-btn-primary" onClick={() => window.print()}>
                      🖨️ Print / Save Official PDF
                    </button>
                  </div>
                </div>
              </div>

              {/* The authentic SA report card */}
              {studentAllMarks.length > 0 ? (
                <SaReportCard
                  student={reportStudent}
                  allMarks={studentAllMarks}
                  allSummaries={studentAllSummaries}
                  school={{
                    name: 'Pinecrest High School',
                    address: 'Pinecrest Road, Johannesburg North, Gauteng, 2055',
                    tel: '+27 11 555 4321',
                    fax: '+27 11 555 4322',
                    email: 'principal@pinecrest.edu.za',
                    emis: '700400123'
                  }}
                  academicYear="2026"
                />
              ) : (
                <div className="lmis-card" style={{ textAlign: 'center', padding: '3rem' }}>
                  <div style={{ fontSize: '2.5rem', marginBottom: '0.75rem' }}>📋</div>
                  <h3 style={{ color: '#94A3B8' }}>No marks recorded yet for {reportStudent.full_name}</h3>
                  <p style={{ fontSize: '0.85rem', color: '#64748B' }}>Educators must capture subject marks in the Teacher Portal before report cards can be generated.</p>
                </div>
              )}
            </div>
          )}

        </main>
      </div>
    </div>
  );
};
