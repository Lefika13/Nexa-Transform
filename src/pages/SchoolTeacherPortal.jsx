import React, { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { useData } from '../context/DataContext';
import { ThemeToggle } from '../components/shared/ThemeToggle';
import './LmisCommon.css';
import './SchoolPortal.css';

export const SchoolTeacherPortal = () => {
  const {
    school_classes = [],
    school_students = [],
    subject_groups = [],
    homeroom_attendance = [],
    activity_exemptions = [],
    term_marks = [],
    recordHomeroomAttendance,
    recordPeriodAttendance,
    logActivityExemption
  } = useData();

  // Authentication State
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [teacherUser, setTeacherUser] = useState(null);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [loading, setLoading] = useState(false);

  // Active Tab
  const [activeTab, setActiveTab] = useState('homeroom'); // 'homeroom' | 'periods' | 'activities' | 'markbook'

  // Toast
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
      if (email.toLowerCase().includes('molefe') || email.toLowerCase().includes('teacher') || email === 'molefe@pinecrest.edu.za') {
        setIsAuthenticated(true);
        setTeacherUser({
          name: 'Mr. Lefika Molefe',
          role: 'Grade 10B Register Teacher & Subject Specialist',
          email: email,
          class: 'Grade 10B'
        });
      } else {
        setErrorMsg('Invalid educator credentials. Use the quick-fill button below.');
      }
      setLoading(false);
    }, 600);
  };

  const handleQuickFillDemo = () => {
    setEmail('molefe@pinecrest.edu.za');
    setPassword('Teacher@2026');
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    setTeacherUser(null);
    setEmail('');
    setPassword('');
  };

  // --- 1. Homeroom Register State ---
  const myClass = school_classes.find(c => c.id === 'cls_10b') || school_classes[0] || {};
  const myStudents = school_students.filter(s => s.class_id === myClass.id);

  const [homeroomDraft, setHomeroomDraft] = useState(() => {
    const today = new Date().toISOString().split('T')[0];
    const initial = {};
    myStudents.forEach(s => {
      const existing = homeroom_attendance.find(a => a.date === today && a.student_id === s.id);
      initial[s.id] = existing ? existing.status : 'present';
    });
    return initial;
  });

  const handleSaveHomeroom = () => {
    const records = myStudents.map(s => ({
      student_id: s.id,
      student_name: s.full_name,
      class_name: myClass.name,
      status: homeroomDraft[s.id] || 'present'
    }));
    recordHomeroomAttendance(myClass.id, records, teacherUser.name);
    showToast(`✅ Morning Roll Call saved successfully for ${myClass.name}! Legal attendance records updated.`);
  };

  // --- 2. Period Attendance State (Electives) ---
  const [selectedPeriod, setSelectedPeriod] = useState(2);
  const activeSubjectGroup = subject_groups[0] || {};

  const groupStudents = useMemo(() => {
    const ids = activeSubjectGroup.enrolled_students || [];
    return ids.map(id => school_students.find(s => s.id === id)).filter(Boolean);
  }, [activeSubjectGroup, school_students]);

  const getStudentExemption = (studentId, periodNum) => {
    const today = new Date().toISOString().split('T')[0];
    return activity_exemptions.find(act => 
      act.date === today && 
      act.participants?.includes(studentId) && 
      periodNum >= act.start_period && 
      periodNum <= act.end_period
    );
  };

  const [periodDraft, setPeriodDraft] = useState({});

  const handleSavePeriod = () => {
    const records = groupStudents.map(s => {
      const exemption = getStudentExemption(s.id, selectedPeriod);
      return {
        student_id: s.id,
        student_name: s.full_name,
        origin_class: s.class_name,
        subject_title: activeSubjectGroup.title,
        status: exemption ? 'excused' : (periodDraft[s.id] || 'present')
      };
    });
    recordPeriodAttendance(selectedPeriod, activeSubjectGroup.id, records, teacherUser.name);
    showToast(`✅ Period ${selectedPeriod} attendance verified for ${activeSubjectGroup.title}!`);
  };

  // --- 3. Activity Exemption Form ---
  const [activityForm, setActivityForm] = useState({
    title: '',
    activity_type: 'SPORTS',
    start_period: 4,
    end_period: 7,
    selected_students: []
  });

  const handleCreateActivity = (e) => {
    e.preventDefault();
    if (!activityForm.title || activityForm.selected_students.length === 0) {
      alert('Please fill event title and select at least one student.');
      return;
    }
    logActivityExemption({
      title: activityForm.title,
      activity_type: activityForm.activity_type,
      start_period: Number(activityForm.start_period),
      end_period: Number(activityForm.end_period),
      authorized_by: teacherUser.name,
      participants: activityForm.selected_students
    });
    showToast(`⚽ Authorized Activity "${activityForm.title}" logged! Live badges broadcast across school.`);
    setActivityForm({
      title: '',
      activity_type: 'SPORTS',
      start_period: 4,
      end_period: 7,
      selected_students: []
    });
  };

  // --- UNTOUCHED EXACT LMIS LOGIN SCREEN IF NOT AUTHENTICATED ---
  if (!isAuthenticated) {
    return (
      <div className="lmis-root">
        <div className="lmis-login-wrapper">
          <div className="lmis-login-bg" />
          <div className="lmis-login-card">
            <img src="/logo.svg" alt="NexaTransform" className="lmis-login-logo" />
            <h2 className="lmis-login-title">Educator Portal</h2>
            <p className="lmis-login-sub">NexaTransform School LMIS (K-12 Edition)</p>

            <p className="lmis-login-role">Sign in with your appointed school educator credentials</p>

            {errorMsg && (
              <div style={{
                background: 'rgba(239, 68, 68, 0.12)',
                border: '1px solid rgba(239, 68, 68, 0.3)',
                borderRadius: '8px',
                padding: '0.65rem 0.85rem',
                marginBottom: '1rem',
                fontSize: '0.85rem',
                color: '#ef4444'
              }}>
                {errorMsg}
              </div>
            )}

            <form onSubmit={handleLogin} className="lmis-login-form">
              <div className="lmis-form-group">
                <label className="lmis-form-label">Educator Email Address</label>
                <input
                  type="email"
                  required
                  className="lmis-form-input"
                  placeholder="molefe@pinecrest.edu.za"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                />
              </div>

              <div className="lmis-form-group">
                <label className="lmis-form-label">Password</label>
                <input
                  type="password"
                  required
                  className="lmis-form-input"
                  placeholder="••••••••"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                />
              </div>

              <button type="submit" className="lmis-login-btn" disabled={loading}>
                {loading ? 'Verifying Educator...' : 'Sign In as Educator →'}
              </button>
            </form>

            <div style={{ marginTop: '1.25rem', paddingTop: '1rem', borderTop: '1px solid rgba(255,255,255,0.08)', textAlign: 'center' }}>
              <span style={{ fontSize: '0.75rem', color: '#94A3B8', display: 'block', marginBottom: '0.4rem' }}>
                Evaluation Quick Fill:
              </span>
              <button
                type="button"
                onClick={handleQuickFillDemo}
                style={{
                  background: 'rgba(56, 189, 248, 0.12)',
                  border: '1px solid rgba(56, 189, 248, 0.35)',
                  color: '#38BDF8',
                  padding: '0.35rem 0.75rem',
                  borderRadius: '9999px',
                  fontSize: '0.78rem',
                  fontWeight: 600,
                  cursor: 'pointer'
                }}
              >
                ⚡ Auto-Fill Mr. Molefe (Grade 10B Teacher)
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

  // --- AUTHENTICATED EDUCATOR PORTAL ---
  const tabs = [
    { id: 'homeroom', label: 'My Homeroom Register', icon: '📋' },
    { id: 'periods', label: 'Period Attendance (Electives)', icon: '⏱️' },
    { id: 'activities', label: 'Log Activity Exemption', icon: '⚽' },
    { id: 'markbook', label: 'Subject Markbook (CAPS)', icon: '📝' }
  ];

  return (
    <div className="lmis-root">
      {/* Toast */}
      {toastMsg && (
        <div style={{
          position: 'fixed',
          top: '20px',
          right: '20px',
          zIndex: 9999,
          background: 'rgba(15, 23, 42, 0.95)',
          border: '1px solid #38BDF8',
          color: '#FFFFFF',
          padding: '0.75rem 1.25rem',
          borderRadius: '8px',
          fontSize: '0.88rem',
          fontWeight: 600
        }}>
          {toastMsg}
        </div>
      )}

      {/* Header */}
      <header className="lmis-header">
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <img src="/logo.svg" alt="Nexa" className="lmis-header-logo" />
          <div>
            <span className="lmis-header-title">Pinecrest High School</span>
            <span style={{ display: 'block', fontSize: '0.7rem', color: '#38BDF8', fontWeight: 600 }}>
              EDUCATOR PORTAL • {teacherUser.class}
            </span>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <ThemeToggle />
          <div style={{ textAlign: 'right' }}>
            <span style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, color: '#FFFFFF' }}>{teacherUser.name}</span>
            <span style={{ fontSize: '0.72rem', color: '#94A3B8' }}>{teacherUser.role}</span>
          </div>
          <button onClick={handleLogout} className="lmis-btn-secondary" style={{ padding: '0.4rem 0.85rem', fontSize: '0.8rem' }}>
            Sign Out
          </button>
        </div>
      </header>

      {/* Shell Layout with Sidebar */}
      <div className="lmis-shell">
        <aside className="lmis-sidebar">
          <nav className="lmis-nav">
            {tabs.map(t => (
              <button
                key={t.id}
                className={`lmis-nav-item ${activeTab === t.id ? 'active' : ''}`}
                onClick={() => setActiveTab(t.id)}
              >
                <span style={{ marginRight: '0.5rem' }}>{t.icon}</span>
                {t.label}
              </button>
            ))}
          </nav>
          <div className="lmis-sidebar-footer">
            "Guiding learners towards mastery."
          </div>
        </aside>

        {/* Main Content Area */}
        <main className="lmis-main">
          {/* TAB 1: HOMEROOM */}
          {activeTab === 'homeroom' && (
            <div className="lmis-card">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem', flexWrap: 'wrap', gap: '1rem' }}>
                <div>
                  <h2 className="lmis-card-title">Grade 10B Morning Roll Call (Legal Register)</h2>
                  <p className="lmis-card-sub">
                    Register Teacher: <strong>{teacherUser.name}</strong> • Today: <strong>{new Date().toLocaleDateString('en-ZA', { dateStyle: 'full' })}</strong>
                  </p>
                </div>
                <button className="lmis-btn-primary" onClick={handleSaveHomeroom}>
                  💾 Submit Morning Register
                </button>
              </div>

              <div className="sp-table-wrapper">
                <table className="sp-table">
                  <thead>
                    <tr>
                      <th>Student No.</th>
                      <th>Full Name</th>
                      <th>Parent / Guardian</th>
                      <th>Morning Status</th>
                      <th style={{ textAlign: 'center' }}>One-Tap Mark Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {myStudents.map(student => {
                      const currentStatus = homeroomDraft[student.id] || 'present';
                      return (
                        <tr key={student.id}>
                          <td><code style={{ color: '#38BDF8' }}>{student.student_number}</code></td>
                          <td><strong>{student.full_name}</strong></td>
                          <td>{student.parent_name} ({student.parent_phone})</td>
                          <td>
                            {currentStatus === 'present' && <span className="sp-badge sp-badge-present">✓ Present</span>}
                            {currentStatus === 'absent' && <span className="sp-badge sp-badge-absent">✗ Absent</span>}
                            {currentStatus === 'late' && <span className="sp-badge sp-badge-late">⏰ Late</span>}
                          </td>
                          <td style={{ textAlign: 'center' }}>
                            <div className="sp-mark-group">
                              <button
                                className={`sp-mark-btn ${currentStatus === 'present' ? 'active-present' : ''}`}
                                onClick={() => setHomeroomDraft(prev => ({ ...prev, [student.id]: 'present' }))}
                              >
                                Present
                              </button>
                              <button
                                className={`sp-mark-btn ${currentStatus === 'absent' ? 'active-absent' : ''}`}
                                onClick={() => setHomeroomDraft(prev => ({ ...prev, [student.id]: 'absent' }))}
                              >
                                Absent
                              </button>
                              <button
                                className={`sp-mark-btn ${currentStatus === 'late' ? 'active-late' : ''}`}
                                onClick={() => setHomeroomDraft(prev => ({ ...prev, [student.id]: 'late' }))}
                              >
                                Late
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

          {/* TAB 2: PERIODS */}
          {activeTab === 'periods' && (
            <div className="lmis-card">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem', flexWrap: 'wrap', gap: '1rem' }}>
                <div>
                  <h2 className="lmis-card-title">Period Register (Cross-Class Elective Sets)</h2>
                  <p className="lmis-card-sub">
                    Subject: <strong>{activeSubjectGroup.title}</strong> • Time: <strong>{activeSubjectGroup.period_time}</strong>
                  </p>
                </div>
                <button className="lmis-btn-primary" onClick={handleSavePeriod}>
                  💾 Verify Period Roster
                </button>
              </div>

              {/* Note on cross-class streaming */}
              <div style={{ background: 'rgba(56, 189, 248, 0.08)', border: '1px solid rgba(56, 189, 248, 0.25)', borderRadius: '8px', padding: '0.75rem 1rem', marginBottom: '1.25rem', fontSize: '0.85rem', color: '#38BDF8' }}>
                💡 <strong>Mixed Class Streaming:</strong> Notice that <strong>Thato (Grade 10B)</strong> and <strong>John (Grade 10C)</strong> attend this class together. When an away sports fixture is authorized, the live blue badge automatically protects the student from false bunking flags!
              </div>

              <div className="sp-table-wrapper">
                <table className="sp-table">
                  <thead>
                    <tr>
                      <th>Student No.</th>
                      <th>Full Name</th>
                      <th>Homeroom Class</th>
                      <th>Live Activity Status</th>
                      <th>Period Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {groupStudents.map(student => {
                      const exemption = getStudentExemption(student.id, selectedPeriod);
                      const currentStatus = exemption ? 'excused' : (periodDraft[student.id] || 'present');
                      return (
                        <tr key={student.id}>
                          <td><code style={{ color: '#38BDF8' }}>{student.student_number}</code></td>
                          <td><strong>{student.full_name}</strong></td>
                          <td><span className="sp-badge sp-badge-present">{student.class_name}</span></td>
                          <td>
                            {exemption ? (
                              <span className="sp-badge sp-badge-sports">
                                ⚽ {exemption.title}
                              </span>
                            ) : (
                              <span style={{ color: '#94A3B8', fontSize: '0.8rem' }}>Regular Class</span>
                            )}
                          </td>
                          <td>
                            {exemption ? (
                              <span style={{ color: '#38BDF8', fontWeight: 600, fontSize: '0.82rem' }}>
                                ✓ Excused (School Fixture)
                              </span>
                            ) : (
                              <div className="sp-mark-group">
                                <button
                                  className={`sp-mark-btn ${currentStatus === 'present' ? 'active-present' : ''}`}
                                  onClick={() => setPeriodDraft(prev => ({ ...prev, [student.id]: 'present' }))}
                                >
                                  Present
                                </button>
                                <button
                                  className={`sp-mark-btn ${currentStatus === 'absent' ? 'active-absent' : ''}`}
                                  onClick={() => setPeriodDraft(prev => ({ ...prev, [student.id]: 'absent' }))}
                                >
                                  Absent
                                </button>
                              </div>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB 3: ACTIVITIES */}
          {activeTab === 'activities' && (
            <div className="lmis-card">
              <h2 className="lmis-card-title">Log Extracurricular Exemption (Sports / Sickbay)</h2>
              <form onSubmit={handleCreateActivity} style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '1rem', marginTop: '1rem' }}>
                <div>
                  <label className="lmis-form-label">Event / Fixture Title *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. U16 Soccer Away Match vs St. Albans"
                    className="lmis-form-input"
                    value={activityForm.title}
                    onChange={e => setActivityForm(prev => ({ ...prev, title: e.target.value }))}
                  />
                </div>

                <div>
                  <label className="lmis-form-label">Type</label>
                  <select
                    className="lmis-form-input"
                    value={activityForm.activity_type}
                    onChange={e => setActivityForm(prev => ({ ...prev, activity_type: e.target.value }))}
                  >
                    <option value="SPORTS">🏆 Sports Match / Tour</option>
                    <option value="CULTURAL">🎭 Cultural / Choir</option>
                    <option value="MEDICAL">🏥 Sickbay Sign-Out</option>
                  </select>
                </div>

                <div style={{ gridColumn: '1 / -1' }}>
                  <label className="lmis-form-label">Select Participating Students *</label>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '0.5rem', background: 'rgba(15, 23, 42, 0.4)', padding: '0.75rem', borderRadius: '8px' }}>
                    {school_students.map(s => (
                      <label key={s.id} style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.85rem', cursor: 'pointer' }}>
                        <input
                          type="checkbox"
                          checked={activityForm.selected_students.includes(s.id)}
                          onChange={e => {
                            if (e.target.checked) {
                              setActivityForm(prev => ({ ...prev, selected_students: [...prev.selected_students, s.id] }));
                            } else {
                              setActivityForm(prev => ({ ...prev, selected_students: prev.selected_students.filter(id => id !== s.id) }));
                            }
                          }}
                        />
                        <span>{s.full_name} ({s.class_name})</span>
                      </label>
                    ))}
                  </div>
                </div>

                <div style={{ gridColumn: '1 / -1', display: 'flex', justifyContent: 'flex-end' }}>
                  <button type="submit" className="lmis-btn-primary">
                    ⚽ Authorize &amp; Broadcast Live Badges
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* TAB 4: MARKBOOK */}
          {activeTab === 'markbook' && (
            <div className="lmis-card">
              <h2 className="lmis-card-title">Subject Assessment Markbook (CAPS 1–7 Scale)</h2>
              <div className="sp-table-wrapper" style={{ marginTop: '1rem' }}>
                <table className="sp-table">
                  <thead>
                    <tr>
                      <th>Subject Code</th>
                      <th>Subject Title</th>
                      <th>CASS (40%)</th>
                      <th>Exam (60%)</th>
                      <th>Final %</th>
                      <th>CAPS Level</th>
                      <th>Educator Remark</th>
                    </tr>
                  </thead>
                  <tbody>
                    {term_marks.map(m => (
                      <tr key={m.subject_code}>
                        <td><code>{m.subject_code}</code></td>
                        <td><strong>{m.subject_name}</strong></td>
                        <td>{m.cass_mark}%</td>
                        <td>{m.exam_mark}%</td>
                        <td><strong style={{ color: '#38BDF8' }}>{m.final_percentage}%</strong></td>
                        <td><span className={`sp-rc-caps-badge sp-rc-caps-${m.caps_level}`}>Level {m.caps_level}</span></td>
                        <td style={{ fontSize: '0.8rem', color: '#CBD5E1' }}>"{m.teacher_comment}"</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
};
