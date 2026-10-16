import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useData } from '../context/DataContext';
import { ThemeToggle } from '../components/shared/ThemeToggle';
import { SaReportCard } from './SaReportCard';
import './LmisCommon.css';
import './SchoolPortal.css';

export const SchoolStudentPortal = () => {
  const {
    school_students = [],
    term_marks = [],
    student_term_summaries = []
  } = useData();

  // ── Authentication State ──────────────────────────────────────
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [studentUser, setStudentUser] = useState(null);
  const [emailOrStudentNum, setEmailOrStudentNum] = useState('');
  const [password, setPassword] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [loading, setLoading] = useState(false);

  // ── Active Tab ────────────────────────────────────────────────
  const [activeTab, setActiveTab] = useState('overview');

  // ── Toast ─────────────────────────────────────────────────────
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
      const clean = emailOrStudentNum.trim().toLowerCase();
      if (clean.includes('thato') || clean.includes('pc2026') || clean === 'thato@pinecrest.edu.za') {
        const profile = school_students.find(s => s.id === 'STU-10B-01') || school_students[0];
        setIsAuthenticated(true);
        setStudentUser(profile);
      } else {
        setErrorMsg('Learner record not found. Use the quick-fill button below to demo.');
      }
      setLoading(false);
    }, 600);
  };

  const handleQuickFillDemo = () => {
    setEmailOrStudentNum('thato@pinecrest.edu.za');
    setPassword('PC2026-1049');
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    setStudentUser(null);
    setEmailOrStudentNum('');
    setPassword('');
  };

  // ── Data for Thato ────────────────────────────────────────────
  const STUDENT_ID = 'STU-10B-01';
  const myAllMarks = term_marks.filter(m => m.student_id === STUDENT_ID);
  const myAllSummaries = student_term_summaries.filter(s => s.student_id === STUDENT_ID);
  const myT1Marks = myAllMarks.filter(m => m.term_number === 1);
  const myT1Summary = myAllSummaries.find(s => s.term_number === 1) || {
    average_percentage: 76.3, overall_caps_level: 6, days_enrolled: 50,
    days_present: 48, days_absent: 2, official_activities: 3, result: 'PROMOTED'
  };

  // ── LOGIN SCREEN ──────────────────────────────────────────────
  if (!isAuthenticated) {
    return (
      <div className="lmis-root">
        <div className="lmis-login-wrapper">
          <div className="lmis-login-bg" />
          <div className="lmis-login-card">
            <img src="/logo.svg" alt="NexaTransform" className="lmis-login-logo" />
            <h2 className="lmis-login-title">Pupil &amp; Parent Portal</h2>
            <p className="lmis-login-sub">NexaTransform School LMIS — K-12 Edition</p>
            <p className="lmis-login-role">Sign in with your student number or registered family email</p>

            {errorMsg && (
              <div style={{ background: 'rgba(239,68,68,0.12)', border: '1px solid rgba(239,68,68,0.3)', borderRadius: '8px', padding: '0.65rem 0.85rem', marginBottom: '1rem', fontSize: '0.85rem', color: '#ef4444' }}>
                {errorMsg}
              </div>
            )}

            <form onSubmit={handleLogin} className="lmis-login-form">
              <div className="lmis-form-group">
                <label className="lmis-form-label">Student Number or Parent Email</label>
                <input type="text" required className="lmis-form-input" placeholder="PC2026-1049 or thato@pinecrest.edu.za"
                  value={emailOrStudentNum} onChange={e => setEmailOrStudentNum(e.target.value)} />
              </div>
              <div className="lmis-form-group">
                <label className="lmis-form-label">Password</label>
                <input type="password" required className="lmis-form-input" placeholder="••••••••"
                  value={password} onChange={e => setPassword(e.target.value)} />
              </div>
              <button type="submit" className="lmis-login-btn" disabled={loading}>
                {loading ? 'Authenticating...' : 'Sign In as Pupil / Parent →'}
              </button>
            </form>

            <div style={{ marginTop: '1.25rem', paddingTop: '1rem', borderTop: '1px solid rgba(255,255,255,0.08)', textAlign: 'center' }}>
              <span style={{ fontSize: '0.75rem', color: '#94A3B8', display: 'block', marginBottom: '0.4rem' }}>Evaluation Quick Fill:</span>
              <button type="button" onClick={handleQuickFillDemo}
                style={{ background: 'rgba(56,189,248,0.12)', border: '1px solid rgba(56,189,248,0.35)', color: '#38BDF8', padding: '0.35rem 0.75rem', borderRadius: '9999px', fontSize: '0.78rem', fontWeight: 600, cursor: 'pointer' }}>
                ⚡ Auto-Fill Thato Molefe (Grade 10B)
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
    { id: 'overview', label: 'Academic Overview', icon: '📊' },
    { id: 'subjects', label: 'My Subjects & Marks', icon: '📚' },
    { id: 'attendance', label: 'Attendance Record', icon: '⏱️' },
    { id: 'report_card', label: 'Official Report Card', icon: '📜' }
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
            <span className="lmis-header-title">Pinecrest High School</span>
            <span style={{ display: 'block', fontSize: '0.7rem', color: '#38BDF8', fontWeight: 600 }}>
              PUPIL &amp; PARENT PORTAL • {studentUser.class_name}
            </span>
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <ThemeToggle />
          <div style={{ textAlign: 'right' }}>
            <span style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, color: '#FFF' }}>{studentUser.full_name}</span>
            <span style={{ fontSize: '0.72rem', color: '#94A3B8' }}>{studentUser.student_number}</span>
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
          <div className="lmis-sidebar-footer">"Aim high, achieve greatness."</div>
        </aside>

        <main className="lmis-main">

          {/* ── TAB: OVERVIEW ──────────────────────────────── */}
          {activeTab === 'overview' && (
            <div>
              <div className="lmis-header-row" style={{ marginBottom: '1.5rem' }}>
                <div>
                  <h1 className="lmis-page-title">Welcome back, {studentUser.first_name}!</h1>
                  <p className="lmis-page-sub">Grade 10B • Class Register Teacher: Mr. Lefika Molefe</p>
                </div>
                <button className="lmis-btn-primary" onClick={() => setActiveTab('report_card')}>
                  View Full Report Card →
                </button>
              </div>

              <div className="sp-metrics-grid">
                {[
                  { title: 'Term 1 Average', value: `${myT1Summary.average_percentage}%`, sub: `Level ${myT1Summary.overall_caps_level} — Meritorious Achievement` },
                  { title: 'Attendance Rate', value: '96.0%', sub: `${myT1Summary.days_present} of ${myT1Summary.days_enrolled} school days attended` },
                  { title: 'Official Activities', value: `${myT1Summary.official_activities} Fixtures`, sub: 'U16 Soccer (Excused Attendance)' },
                  { title: 'Enrolled Subjects', value: `${myT1Marks.length} Subjects`, sub: 'CAPS-Aligned Curriculum (Gr 10)' },
                ].map(card => (
                  <div key={card.title} className="sp-metric-card">
                    <span className="sp-metric-title">{card.title}</span>
                    <div className="sp-metric-value">{card.value}</div>
                    <span className="sp-metric-subtitle">{card.sub}</span>
                  </div>
                ))}
              </div>

              {/* Term progress overview */}
              <div className="lmis-card" style={{ marginTop: '1.5rem' }}>
                <h2 className="lmis-card-title">Term-by-Term Academic Progression</h2>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', marginTop: '1rem' }}>
                  {myAllSummaries.map(s => (
                    <div key={s.term_number} style={{ background: 'rgba(56,189,248,0.08)', border: '1px solid rgba(56,189,248,0.2)', borderRadius: '10px', padding: '1rem' }}>
                      <div style={{ fontSize: '0.78rem', color: '#38BDF8', fontWeight: 700, marginBottom: '0.35rem' }}>TERM {s.term_number}</div>
                      <div style={{ fontSize: '1.8rem', fontWeight: 800, color: '#FFF' }}>{s.average_percentage}%</div>
                      <div style={{ fontSize: '0.75rem', color: '#34D399', marginTop: '0.2rem' }}>Level {s.overall_caps_level} • {s.result}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* ── TAB: SUBJECTS ──────────────────────────────── */}
          {activeTab === 'subjects' && (
            <div className="lmis-card">
              <h2 className="lmis-card-title">My Subjects &amp; Continuous Assessment Marks</h2>
              <p className="lmis-card-sub">Term-by-term performance across all enrolled subjects.</p>
              <div className="sp-table-wrapper" style={{ marginTop: '1rem' }}>
                <table className="sp-table">
                  <thead>
                    <tr>
                      <th>Subject</th>
                      <th>Educator</th>
                      <th>Term 1 %</th>
                      <th>Term 1 Level</th>
                      <th>Term 2 %</th>
                      <th>Term 2 Level</th>
                      <th>Term 3 %</th>
                      <th>Term 3 Level</th>
                    </tr>
                  </thead>
                  <tbody>
                    {/* Get unique subjects */}
                    {[...new Map(myAllMarks.map(m => [m.subject_code, m])).values()].map(subj => {
                      const m1 = myAllMarks.find(m => m.subject_code === subj.subject_code && m.term_number === 1);
                      const m2 = myAllMarks.find(m => m.subject_code === subj.subject_code && m.term_number === 2);
                      const m3 = myAllMarks.find(m => m.subject_code === subj.subject_code && m.term_number === 3);
                      return (
                        <tr key={subj.subject_code}>
                          <td><strong>{subj.subject_name}</strong></td>
                          <td style={{ fontSize: '0.8rem' }}>{subj.teacher_name}</td>
                          <td>{m1 ? `${m1.final_percentage}%` : '–'}</td>
                          <td>{m1 ? <span className={`sp-rc-caps-badge sp-rc-caps-${m1.caps_level}`}>Level {m1.caps_level}</span> : '–'}</td>
                          <td>{m2 ? `${m2.final_percentage}%` : '–'}</td>
                          <td>{m2 ? <span className={`sp-rc-caps-badge sp-rc-caps-${m2.caps_level}`}>Level {m2.caps_level}</span> : '–'}</td>
                          <td>{m3 ? `${m3.final_percentage}%` : '–'}</td>
                          <td>{m3 ? <span className={`sp-rc-caps-badge sp-rc-caps-${m3.caps_level}`}>Level {m3.caps_level}</span> : '–'}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* ── TAB: ATTENDANCE ────────────────────────────── */}
          {activeTab === 'attendance' && (
            <div className="lmis-card">
              <h2 className="lmis-card-title">Attendance &amp; School Activity Participation</h2>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', marginTop: '1rem' }}>
                {myAllSummaries.map(s => (
                  <div key={s.term_number} style={{ border: '1px solid rgba(255,255,255,0.1)', borderRadius: '10px', padding: '1.1rem', background: 'rgba(30,41,59,0.5)' }}>
                    <div style={{ fontSize: '0.75rem', color: '#38BDF8', fontWeight: 700, marginBottom: '0.6rem', textTransform: 'uppercase' }}>Term {s.term_number}</div>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem' }}>
                      <div>
                        <div style={{ fontSize: '0.7rem', color: '#34D399', fontWeight: 700 }}>PRESENT</div>
                        <div style={{ fontSize: '1.4rem', fontWeight: 800, color: '#FFF' }}>{s.days_present}d</div>
                      </div>
                      <div>
                        <div style={{ fontSize: '0.7rem', color: '#F87171', fontWeight: 700 }}>ABSENT</div>
                        <div style={{ fontSize: '1.4rem', fontWeight: 800, color: '#FFF' }}>{s.days_absent}d</div>
                      </div>
                    </div>
                    <div style={{ marginTop: '0.5rem', fontSize: '0.75rem', color: '#94A3B8' }}>
                      {s.official_activities} official fixtures (excused)
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ── TAB: OFFICIAL REPORT CARD ─────────────────── */}
          {activeTab === 'report_card' && (
            <div>
              {/* Actions bar */}
              <div className="lmis-card sp-no-print" style={{ marginBottom: '1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
                <div>
                  <h3 style={{ margin: 0, fontSize: '1.1rem', color: '#FFF' }}>Official Learner Academic Report — 2026</h3>
                  <span style={{ fontSize: '0.8rem', color: '#94A3B8' }}>All 3 Terms • CAPS Aligned • Verified Document</span>
                </div>
                <div style={{ display: 'flex', gap: '0.75rem' }}>
                  <button className="lmis-btn-secondary"
                    onClick={() => showToast('📧 Report card copy sent to parent.molefe@example.com')}>
                    ✉️ Email Copy to Parent
                  </button>
                  <button className="lmis-btn-primary" onClick={() => window.print()}>
                    🖨️ Print / Save Official PDF
                  </button>
                </div>
              </div>

              {/* The authentic SA report card */}
              <SaReportCard
                student={studentUser}
                allMarks={myAllMarks}
                allSummaries={myAllSummaries}
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
            </div>
          )}

        </main>
      </div>
    </div>
  );
};
