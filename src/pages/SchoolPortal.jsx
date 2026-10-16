import React, { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { useData } from '../context/DataContext';
import { ThemeToggle } from '../components/shared/ThemeToggle';
import './SchoolPortal.css';

export const SchoolPortal = () => {
  const {
    institutions = [],
    school_classes = [],
    school_students = [],
    school_subjects = [],
    subject_groups = [],
    homeroom_attendance = [],
    period_attendance = [],
    activity_exemptions = [],
    term_marks = [],
    student_term_summaries = [],
    recordHomeroomAttendance,
    recordPeriodAttendance,
    logActivityExemption,
    saveTermMarks,
    saveStudentTermSummary
  } = useData();

  // Active School Tenant (Defaults to Pinecrest High School)
  const activeSchool = useMemo(() => {
    return institutions.find(i => i.id === 'sch_pinecrest_high') || {
      id: 'sch_pinecrest_high',
      name: 'Pinecrest High School',
      institution_type: 'high_school',
      emis_number: '700400123',
      contact_email: 'principal@pinecrest.edu.za',
      contact_phone: '+27 11 555 4321',
      province: 'Gauteng'
    };
  }, [institutions]);

  // Tab State
  const [activeTab, setActiveTab] = useState('overview'); // 'overview' | 'homeroom' | 'periods' | 'activities' | 'markbook' | 'report_cards'

  // Notification Toast State
  const [toastMessage, setToastMessage] = useState(null);
  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 4000);
  };

  // --- 1. Homeroom Register State (Mr. Molefe - Grade 10B) ---
  const [selectedClassId, setSelectedClassId] = useState('cls_10b');
  const activeClass = school_classes.find(c => c.id === selectedClassId) || school_classes[0] || {};
  const classStudents = school_students.filter(s => s.class_id === selectedClassId);

  // Local state for homeroom statuses before saving
  const [homeroomDraft, setHomeroomDraft] = useState(() => {
    const today = new Date().toISOString().split('T')[0];
    const initial = {};
    classStudents.forEach(s => {
      const existing = homeroom_attendance.find(a => a.date === today && a.student_id === s.id);
      initial[s.id] = existing ? existing.status : 'present';
    });
    return initial;
  });

  const handleToggleHomeroomStatus = (studentId, status) => {
    setHomeroomDraft(prev => ({ ...prev, [studentId]: status }));
  };

  const handleSaveHomeroom = () => {
    const records = classStudents.map(s => ({
      student_id: s.id,
      student_name: s.full_name,
      class_name: activeClass.name,
      status: homeroomDraft[s.id] || 'present'
    }));
    recordHomeroomAttendance(selectedClassId, records, activeClass.class_teacher_name);
    showToast(`✅ Morning Roll Call saved successfully for ${activeClass.name}! Legal attendance records updated.`);
  };

  // --- 2. Period Attendance State (Mixed Electives) ---
  const [selectedPeriod, setSelectedPeriod] = useState(2);
  const [selectedSubjectGroupId, setSelectedSubjectGroupId] = useState('subj_math_10_set1');
  const activeSubjectGroup = subject_groups.find(sg => sg.id === selectedSubjectGroupId) || subject_groups[0] || {};

  // Find enrolled learners in this elective group
  const groupStudents = useMemo(() => {
    const ids = activeSubjectGroup.enrolled_students || [];
    return ids.map(id => school_students.find(s => s.id === id)).filter(Boolean);
  }, [activeSubjectGroup, school_students]);

  // Check if a learner has an authorized activity exemption for this period
  const getStudentExemption = (studentId, periodNum) => {
    const today = new Date().toISOString().split('T')[0];
    return activity_exemptions.find(act => 
      act.date === today && 
      act.participants?.includes(studentId) && 
      periodNum >= act.start_period && 
      periodNum <= act.end_period
    );
  };

  // Local state for period marking
  const [periodDraft, setPeriodDraft] = useState({});

  const handleSavePeriodAttendance = () => {
    const records = groupStudents.map(s => {
      const exemption = getStudentExemption(s.id, selectedPeriod);
      const effectiveStatus = exemption ? 'excused' : (periodDraft[s.id] || 'present');
      return {
        student_id: s.id,
        student_name: s.full_name,
        origin_class: s.class_name,
        subject_title: activeSubjectGroup.title,
        status: effectiveStatus
      };
    });
    recordPeriodAttendance(selectedPeriod, selectedSubjectGroupId, records, activeSubjectGroup.teacher_name);
    showToast(`✅ Period ${selectedPeriod} attendance saved for ${activeSubjectGroup.title}!`);
  };

  // --- 3. Activity / Fixture Exemption Form ---
  const [activityForm, setActivityForm] = useState({
    title: '',
    activity_type: 'SPORTS',
    start_period: 4,
    end_period: 7,
    authorized_by: 'Coach Khaya (Director of Sport)',
    notes: '',
    selected_students: []
  });

  const handleCreateActivityExemption = (e) => {
    e.preventDefault();
    if (!activityForm.title || activityForm.selected_students.length === 0) {
      alert('Please provide an event title and select at least one student.');
      return;
    }
    logActivityExemption({
      title: activityForm.title,
      activity_type: activityForm.activity_type,
      start_period: Number(activityForm.start_period),
      end_period: Number(activityForm.end_period),
      authorized_by: activityForm.authorized_by,
      notes: activityForm.notes,
      participants: activityForm.selected_students
    });
    showToast(`⚽ Authorized Activity "${activityForm.title}" logged! Subject teachers will see live exemption badges.`);
    setActivityForm({
      title: '',
      activity_type: 'SPORTS',
      start_period: 4,
      end_period: 7,
      authorized_by: 'Coach Khaya (Director of Sport)',
      notes: '',
      selected_students: []
    });
  };

  // --- 4. Report Card State ---
  const [selectedReportStudentId, setSelectedReportStudentId] = useState('STU-10B-01');
  const [selectedTermNumber, setSelectedTermNumber] = useState(1);

  const reportStudent = school_students.find(s => s.id === selectedReportStudentId) || school_students[0] || {};
  const studentMarks = term_marks.filter(m => m.student_id === selectedReportStudentId && m.term_number === selectedTermNumber);
  const studentSummary = student_term_summaries.find(s => s.student_id === selectedReportStudentId && s.term_number === selectedTermNumber) || {
    average_percentage: 77.2,
    overall_caps_level: 6,
    days_enrolled: 50,
    days_present: 48,
    days_absent: 2,
    official_activities: 3,
    class_teacher_remark: 'Thato has adapted brilliantly to the academic rigor of Grade 10. He balances his scholastic workload with First Team soccer admirably. Keep up this high standard!',
    principal_remark: 'Commendable Term 1 performance. Congratulations on attaining Level 6/7 in 4 subjects.',
    progression_outcome: 'Satisfies Requirements for Bachelor Degree Admission',
    verification_hash: 'NX-RPT-2026-T1-PC1049-VERIFIED'
  };

  const handlePrintReport = () => {
    window.print();
  };

  const handleSimulateParentEmail = () => {
    showToast(`📧 Report card successfully dispatched to parent: ${reportStudent.parent_email} (${reportStudent.parent_name})!`);
  };

  return (
    <div className="sp-root">
      <div className="sp-grid-bg" />

      {/* Toast Notification */}
      {toastMessage && (
        <div style={{
          position: 'fixed',
          top: '20px',
          right: '20px',
          zIndex: 9999,
          background: 'rgba(15, 23, 42, 0.95)',
          border: '1px solid #38BDF8',
          color: '#FFFFFF',
          padding: '0.85rem 1.4rem',
          borderRadius: '10px',
          boxShadow: '0 10px 25px rgba(0,0,0,0.5)',
          fontSize: '0.9rem',
          fontWeight: 600,
          display: 'flex',
          alignItems: 'center',
          gap: '0.65rem'
        }}>
          {toastMessage}
        </div>
      )}

      {/* Header */}
      <header className="sp-header sp-no-print">
        <div className="sp-brand">
          <img src="/logo.svg" alt="NexaTransform" className="sp-brand-logo" />
          <div className="sp-school-badge">
            <span className="sp-school-name">{activeSchool.name}</span>
            <span className="sp-school-meta">EMIS: {activeSchool.emis_number} • K-12 School Edition</span>
          </div>
        </div>

        <div className="sp-header-actions">
          <ThemeToggle />
          <Link to="/schools" className="sp-nav-btn">
            Schools Solution Info
          </Link>
          <Link to="/lmis" className="sp-nav-btn">
            ← Skills Academy LMIS
          </Link>
        </div>
      </header>

      {/* Sub-Navigation Tabs */}
      <nav className="sp-tab-bar sp-no-print">
        <button
          className={`sp-tab-btn ${activeTab === 'overview' ? 'active' : ''}`}
          onClick={() => setActiveTab('overview')}
        >
          📊 School Overview
        </button>
        <button
          className={`sp-tab-btn ${activeTab === 'homeroom' ? 'active' : ''}`}
          onClick={() => setActiveTab('homeroom')}
        >
          📋 Morning Roll Call (Homeroom)
        </button>
        <button
          className={`sp-tab-btn ${activeTab === 'periods' ? 'active' : ''}`}
          onClick={() => setActiveTab('periods')}
        >
          ⏱️ Period Attendance (Electives)
        </button>
        <button
          className={`sp-tab-btn ${activeTab === 'activities' ? 'active' : ''}`}
          onClick={() => setActiveTab('activities')}
        >
          ⚽ Sports &amp; Activity Sign-Out
        </button>
        <button
          className={`sp-tab-btn ${activeTab === 'markbook' ? 'active' : ''}`}
          onClick={() => setActiveTab('markbook')}
        >
          📝 Subject Markbook
        </button>
        <button
          className={`sp-tab-btn ${activeTab === 'report_cards' ? 'active' : ''}`}
          onClick={() => setActiveTab('report_cards')}
        >
          📜 Term Report Cards
        </button>
      </nav>

      {/* Main Content Area */}
      <main className="sp-container">

        {/* ====================================================================
            TAB 1: OVERVIEW & DASHBOARD
            ==================================================================== */}
        {activeTab === 'overview' && (
          <div>
            <div className="sp-panel-header" style={{ marginBottom: '1.5rem' }}>
              <div>
                <h1 style={{ fontSize: '1.75rem', fontWeight: 800, color: '#FFFFFF', margin: 0 }}>
                  School Operations Cockpit
                </h1>
                <p style={{ color: '#94A3B8', fontSize: '0.9rem', marginTop: '0.25rem' }}>
                  Live overview of academic attendance, elective groupings, and active extracurricular fixtures.
                </p>
              </div>
              <button className="sp-btn-primary" onClick={() => setActiveTab('report_cards')}>
                Generate Term 1 Report Cards →
              </button>
            </div>

            {/* Metrics Row */}
            <div className="sp-metrics-grid">
              <div className="sp-metric-card">
                <div className="sp-metric-header">
                  <span className="sp-metric-title">Today's Attendance</span>
                  <div className="sp-metric-icon">✓</div>
                </div>
                <div className="sp-metric-value">94.8%</div>
                <span className="sp-metric-subtitle">↑ 1.2% higher than provincial average</span>
              </div>

              <div className="sp-metric-card">
                <div className="sp-metric-header">
                  <span className="sp-metric-title">Enrolled Pupils</span>
                  <div className="sp-metric-icon">🎓</div>
                </div>
                <div className="sp-metric-value">{school_students.length} Pupils</div>
                <span className="sp-metric-subtitle">Across Grades 8 to 12</span>
              </div>

              <div className="sp-metric-card">
                <div className="sp-metric-header">
                  <span className="sp-metric-title">Active Elective Sets</span>
                  <div className="sp-metric-icon">📚</div>
                </div>
                <div className="sp-metric-value">{subject_groups.length} Sets</div>
                <span className="sp-metric-subtitle">Cross-class streaming active</span>
              </div>

              <div className="sp-metric-card">
                <div className="sp-metric-header">
                  <span className="sp-metric-title">Fixtures / Exemptions Today</span>
                  <div className="sp-metric-icon">⚽</div>
                </div>
                <div className="sp-metric-value">{activity_exemptions.length} Active</div>
                <span className="sp-metric-subtitle">Live badges preventing false truancy</span>
              </div>
            </div>

            {/* Two-Tier Register Explanation Card */}
            <div className="sp-panel" style={{ borderLeft: '4px solid #38BDF8' }}>
              <h3 className="sp-panel-title">
                <span>💡</span> Two-Tier High School Attendance Architecture
              </h3>
              <p style={{ color: '#CBD5E1', fontSize: '0.92rem', lineHeight: '1.6', marginTop: '0.5rem' }}>
                In this system, <strong>Mr. Molefe</strong> marks his Grade 10B homeroom register first thing in the morning for official Department records. Later in Period 2, <strong>Mrs. Dlamini</strong> takes Pure Mathematics with learners from 10A, 10B (Thato), and 10C (John) sitting side by side. When learners depart for away sports or medical appointments, official badges automatically excuse them so no teacher flags them as bunking!
              </p>
              <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem', flexWrap: 'wrap' }}>
                <button className="sp-btn-secondary" onClick={() => setActiveTab('homeroom')}>
                  Open Mr. Molefe's 10B Register
                </button>
                <button className="sp-btn-secondary" onClick={() => setActiveTab('periods')}>
                  Open Period 2 Pure Maths Register
                </button>
                <button className="sp-btn-secondary" onClick={() => setActiveTab('activities')}>
                  View Active Sports Fixtures
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ====================================================================
            TAB 2: MORNING HOMEROOM REGISTER (Mr. Molefe - Grade 10B)
            ==================================================================== */}
        {activeTab === 'homeroom' && (
          <div className="sp-panel">
            <div className="sp-panel-header">
              <div>
                <h2 className="sp-panel-title">
                  <span>📋</span> Morning Homeroom Register (Official Daily Roll Call)
                </h2>
                <p className="sp-panel-subtitle">
                  Class: <strong>{activeClass.name}</strong> • Register Teacher: <strong>{activeClass.class_teacher_name}</strong> • Date: <strong>{new Date().toLocaleDateString('en-ZA', { dateStyle: 'full' })}</strong>
                </p>
              </div>

              <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
                <select
                  value={selectedClassId}
                  onChange={(e) => setSelectedClassId(e.target.value)}
                  style={{
                    background: 'rgba(15, 23, 42, 0.8)',
                    color: '#FFFFFF',
                    border: '1px solid rgba(255, 255, 255, 0.2)',
                    padding: '0.5rem 0.85rem',
                    borderRadius: '8px',
                    fontSize: '0.85rem'
                  }}
                >
                  {school_classes.map(c => (
                    <option key={c.id} value={c.id}>{c.name} ({c.class_teacher_name})</option>
                  ))}
                </select>

                <button className="sp-btn-primary" onClick={handleSaveHomeroom}>
                  💾 Submit Morning Register
                </button>
              </div>
            </div>

            <div className="sp-table-wrapper">
              <table className="sp-table">
                <thead>
                  <tr>
                    <th>Student ID</th>
                    <th>Full Name</th>
                    <th>Gender</th>
                    <th>Parent / Emergency Contact</th>
                    <th>Morning Status</th>
                    <th style={{ textAlign: 'center' }}>Quick Mark Action</th>
                  </tr>
                </thead>
                <tbody>
                  {classStudents.map(student => {
                    const currentStatus = homeroomDraft[student.id] || 'present';
                    return (
                      <tr key={student.id}>
                        <td><code style={{ color: '#38BDF8' }}>{student.student_number}</code></td>
                        <td>
                          <strong>{student.full_name}</strong>
                          <div style={{ fontSize: '0.75rem', color: '#94A3B8' }}>DOB: {student.dob}</div>
                        </td>
                        <td>{student.gender}</td>
                        <td>
                          <div>{student.parent_name}</div>
                          <div style={{ fontSize: '0.75rem', color: '#94A3B8' }}>{student.parent_phone}</div>
                        </td>
                        <td>
                          {currentStatus === 'present' && <span className="sp-badge sp-badge-present">✓ Present</span>}
                          {currentStatus === 'absent' && <span className="sp-badge sp-badge-absent">✗ Absent</span>}
                          {currentStatus === 'late' && <span className="sp-badge sp-badge-late">⏰ Late</span>}
                          {currentStatus === 'excused' && <span className="sp-badge sp-badge-sports">ℹ️ Excused</span>}
                        </td>
                        <td style={{ textAlign: 'center' }}>
                          <div className="sp-mark-group">
                            <button
                              className={`sp-mark-btn ${currentStatus === 'present' ? 'active-present' : ''}`}
                              onClick={() => handleToggleHomeroomStatus(student.id, 'present')}
                            >
                              Present
                            </button>
                            <button
                              className={`sp-mark-btn ${currentStatus === 'absent' ? 'active-absent' : ''}`}
                              onClick={() => handleToggleHomeroomStatus(student.id, 'absent')}
                            >
                              Absent
                            </button>
                            <button
                              className={`sp-mark-btn ${currentStatus === 'late' ? 'active-late' : ''}`}
                              onClick={() => handleToggleHomeroomStatus(student.id, 'late')}
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

        {/* ====================================================================
            TAB 3: PERIOD ATTENDANCE (Mixed Electives & Live Exemption Badges)
            ==================================================================== */}
        {activeTab === 'periods' && (
          <div className="sp-panel">
            <div className="sp-panel-header">
              <div>
                <h2 className="sp-panel-title">
                  <span>⏱️</span> Period Attendance (Cross-Class Subject Groups)
                </h2>
                <p className="sp-panel-subtitle">
                  Subject: <strong>{activeSubjectGroup.title}</strong> • Educator: <strong>{activeSubjectGroup.teacher_name}</strong> • Time: <strong>{activeSubjectGroup.period_time}</strong>
                </p>
              </div>

              <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
                <select
                  value={selectedPeriod}
                  onChange={(e) => setSelectedPeriod(Number(e.target.value))}
                  style={{
                    background: 'rgba(15, 23, 42, 0.8)',
                    color: '#FFFFFF',
                    border: '1px solid rgba(255, 255, 255, 0.2)',
                    padding: '0.5rem 0.85rem',
                    borderRadius: '8px',
                    fontSize: '0.85rem'
                  }}
                >
                  <option value={1}>Period 1 (08:00 - 09:00)</option>
                  <option value={2}>Period 2 (09:00 - 10:00 - Pure Maths Set 1)</option>
                  <option value={3}>Period 3 (10:15 - 11:15)</option>
                  <option value={4}>Period 4 (11:30 - 12:30 - Physical Sciences)</option>
                  <option value={5}>Period 5 (13:15 - 14:15)</option>
                </select>

                <button className="sp-btn-primary" onClick={handleSavePeriodAttendance}>
                  💾 Verify Period Roster
                </button>
              </div>
            </div>

            {/* Note banner on cross-class streaming */}
            <div style={{
              background: 'rgba(56, 189, 248, 0.08)',
              border: '1px solid rgba(56, 189, 248, 0.25)',
              borderRadius: '8px',
              padding: '0.75rem 1rem',
              marginBottom: '1.25rem',
              fontSize: '0.85rem',
              color: '#38BDF8',
              display: 'flex',
              alignItems: 'center',
              gap: '0.65rem'
            }}>
              <span>ℹ️</span>
              <span>
                <strong>Cross-Class Elective Set:</strong> Notice that <strong>Thato (Grade 10B)</strong> and <strong>John (Grade 10C)</strong> attend this class together. If a student is currently on an official school sports fixture, the blue activity exemption badge automatically prevents accidental truancy flags!
              </span>
            </div>

            <div className="sp-table-wrapper">
              <table className="sp-table">
                <thead>
                  <tr>
                    <th>Student ID</th>
                    <th>Student Name</th>
                    <th>Home Register Class</th>
                    <th>Live Extracurricular Status</th>
                    <th>Period Marking</th>
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
                        <td>
                          <span style={{
                            padding: '0.2rem 0.5rem',
                            borderRadius: '4px',
                            background: 'rgba(255, 255, 255, 0.06)',
                            fontWeight: 600,
                            fontSize: '0.78rem'
                          }}>
                            {student.class_name}
                          </span>
                        </td>
                        <td>
                          {exemption ? (
                            <span className="sp-badge sp-badge-sports" title={exemption.notes}>
                              ⚽ {exemption.title} (Auth: {exemption.authorized_by})
                            </span>
                          ) : (
                            <span style={{ color: '#94A3B8', fontSize: '0.8rem' }}>On Campus (Regular Class)</span>
                          )}
                        </td>
                        <td>
                          {exemption ? (
                            <span style={{ color: '#38BDF8', fontWeight: 600, fontSize: '0.85rem' }}>
                              ✓ Officially Excused (School Activity)
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
                              <button
                                className={`sp-mark-btn ${currentStatus === 'late' ? 'active-late' : ''}`}
                                onClick={() => setPeriodDraft(prev => ({ ...prev, [student.id]: 'late' }))}
                              >
                                Late
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

        {/* ====================================================================
            TAB 4: SPORTS & ACTIVITY SIGN-OUT (Coach & Sickbay Logger)
            ==================================================================== */}
        {activeTab === 'activities' && (
          <div>
            <div className="sp-panel">
              <h2 className="sp-panel-title" style={{ marginBottom: '1rem' }}>
                <span>⚽</span> Log Official Activity Exemption (Sports / Sickbay / Excursions)
              </h2>
              <p className="sp-panel-subtitle" style={{ marginBottom: '1.5rem' }}>
                When students depart for an away soccer/rugby match, debate tour, or sickbay sign-out, log it here. The system immediately applies blue exemption badges across all subject teachers' period registers, ensuring accurate attendance and zero false bunking alarms.
              </p>

              <form onSubmit={handleCreateActivityExemption} style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.25rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', color: '#94A3B8', fontWeight: 600, marginBottom: '0.35rem' }}>
                    Event / Exemption Title *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. U16 Soccer Away Match vs. St. Albans"
                    value={activityForm.title}
                    onChange={(e) => setActivityForm(prev => ({ ...prev, title: e.target.value }))}
                    style={{
                      width: '100%',
                      background: 'rgba(15, 23, 42, 0.8)',
                      border: '1px solid rgba(255, 255, 255, 0.15)',
                      padding: '0.6rem 0.85rem',
                      borderRadius: '8px',
                      color: '#FFFFFF',
                      fontSize: '0.88rem'
                    }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', color: '#94A3B8', fontWeight: 600, marginBottom: '0.35rem' }}>
                    Activity Category
                  </label>
                  <select
                    value={activityForm.activity_type}
                    onChange={(e) => setActivityForm(prev => ({ ...prev, activity_type: e.target.value }))}
                    style={{
                      width: '100%',
                      background: 'rgba(15, 23, 42, 0.8)',
                      border: '1px solid rgba(255, 255, 255, 0.15)',
                      padding: '0.6rem 0.85rem',
                      borderRadius: '8px',
                      color: '#FFFFFF',
                      fontSize: '0.88rem'
                    }}
                  >
                    <option value="SPORTS">🏆 Sports Match / Tour</option>
                    <option value="CULTURAL">🎭 Cultural / Choir / Debating</option>
                    <option value="OLYMPIAD">📐 Academic Olympiad</option>
                    <option value="MEDICAL">🏥 Sickbay / Medical Departure</option>
                  </select>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', color: '#94A3B8', fontWeight: 600, marginBottom: '0.35rem' }}>
                    Exempted Periods (From Period ──► To Period)
                  </label>
                  <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                    <select
                      value={activityForm.start_period}
                      onChange={(e) => setActivityForm(prev => ({ ...prev, start_period: Number(e.target.value) }))}
                      style={{
                        flex: 1,
                        background: 'rgba(15, 23, 42, 0.8)',
                        border: '1px solid rgba(255, 255, 255, 0.15)',
                        padding: '0.6rem',
                        borderRadius: '8px',
                        color: '#FFFFFF',
                        fontSize: '0.85rem'
                      }}
                    >
                      {[1, 2, 3, 4, 5, 6, 7].map(p => <option key={p} value={p}>Period {p}</option>)}
                    </select>
                    <span style={{ color: '#94A3B8' }}>to</span>
                    <select
                      value={activityForm.end_period}
                      onChange={(e) => setActivityForm(prev => ({ ...prev, end_period: Number(e.target.value) }))}
                      style={{
                        flex: 1,
                        background: 'rgba(15, 23, 42, 0.8)',
                        border: '1px solid rgba(255, 255, 255, 0.15)',
                        padding: '0.6rem',
                        borderRadius: '8px',
                        color: '#FFFFFF',
                        fontSize: '0.85rem'
                      }}
                    >
                      {[1, 2, 3, 4, 5, 6, 7].map(p => <option key={p} value={p}>Period {p}</option>)}
                    </select>
                  </div>
                </div>

                <div style={{ gridColumn: '1 / -1' }}>
                  <label style={{ display: 'block', fontSize: '0.8rem', color: '#94A3B8', fontWeight: 600, marginBottom: '0.5rem' }}>
                    Select Participating Students *
                  </label>
                  <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))',
                    gap: '0.5rem',
                    maxHeight: '180px',
                    overflowY: 'auto',
                    background: 'rgba(15, 23, 42, 0.5)',
                    padding: '0.75rem',
                    borderRadius: '8px',
                    border: '1px solid rgba(255, 255, 255, 0.1)'
                  }}>
                    {school_students.map(s => {
                      const isChecked = activityForm.selected_students.includes(s.id);
                      return (
                        <label key={s.id} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.85rem', cursor: 'pointer' }}>
                          <input
                            type="checkbox"
                            checked={isChecked}
                            onChange={(e) => {
                              if (e.target.checked) {
                                setActivityForm(prev => ({ ...prev, selected_students: [...prev.selected_students, s.id] }));
                              } else {
                                setActivityForm(prev => ({ ...prev, selected_students: prev.selected_students.filter(id => id !== s.id) }));
                              }
                            }}
                          />
                          <span>{s.full_name} ({s.class_name})</span>
                        </label>
                      );
                    })}
                  </div>
                </div>

                <div style={{ gridColumn: '1 / -1', display: 'flex', justifyContent: 'flex-end', marginTop: '0.5rem' }}>
                  <button type="submit" className="sp-btn-primary">
                    ⚽ Authorize &amp; Broadcast Exemption
                  </button>
                </div>
              </form>
            </div>

            {/* Active Exemptions List */}
            <div className="sp-panel">
              <h3 className="sp-panel-title" style={{ marginBottom: '1rem' }}>
                <span>📜</span> Active Exemption Manifests Today
              </h3>
              <div className="sp-table-wrapper">
                <table className="sp-table">
                  <thead>
                    <tr>
                      <th>Event Title</th>
                      <th>Category</th>
                      <th>Periods Affected</th>
                      <th>Authorized By</th>
                      <th>Participating Learners</th>
                      <th>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {activity_exemptions.map(act => (
                      <tr key={act.id}>
                        <td><strong>{act.title}</strong></td>
                        <td><span className="sp-badge sp-badge-sports">{act.activity_type}</span></td>
                        <td>Periods {act.start_period} to {act.end_period}</td>
                        <td>{act.authorized_by}</td>
                        <td>
                          {act.participants?.map(id => {
                            const stu = school_students.find(s => s.id === id);
                            return stu ? `${stu.full_name} (${stu.class_name})` : id;
                          }).join(', ')}
                        </td>
                        <td><span className="sp-badge sp-badge-present">✓ {act.status}</span></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* ====================================================================
            TAB 5: SUBJECT MARKBOOK (CAPS 1-7 Scale & Comments)
            ==================================================================== */}
        {activeTab === 'markbook' && (
          <div className="sp-panel">
            <div className="sp-panel-header">
              <div>
                <h2 className="sp-panel-title">
                  <span>📝</span> Grade 10 Subject Markbook (Term 1)
                </h2>
                <p className="sp-panel-subtitle">
                  Continuous Assessment (CASS) + Term Exam marks automatically compute into the Department of Basic Education CAPS 7-Point scale.
                </p>
              </div>

              <button className="sp-btn-primary" onClick={() => showToast('✅ Markbook successfully synchronized to the cloud!')}>
                💾 Save All Markbook Changes
              </button>
            </div>

            <div className="sp-table-wrapper">
              <table className="sp-table">
                <thead>
                  <tr>
                    <th>Subject Code &amp; Title</th>
                    <th>Educator</th>
                    <th>CASS Mark (40%)</th>
                    <th>Exam Mark (60%)</th>
                    <th>Final Term %</th>
                    <th>CAPS Achievement Level</th>
                    <th>Educator Remark</th>
                  </tr>
                </thead>
                <tbody>
                  {studentMarks.map(mark => (
                    <tr key={mark.subject_code}>
                      <td>
                        <strong>{mark.subject_name}</strong>
                        <div style={{ fontSize: '0.75rem', color: '#94A3B8' }}>{mark.subject_code}</div>
                      </td>
                      <td>{mark.teacher_name}</td>
                      <td>{mark.cass_mark}%</td>
                      <td>{mark.exam_mark}%</td>
                      <td>
                        <strong style={{ fontSize: '1.05rem', color: '#38BDF8' }}>{mark.final_percentage}%</strong>
                      </td>
                      <td>
                        <span className={`sp-rc-caps-badge sp-rc-caps-${mark.caps_level}`}>
                          Level {mark.caps_level} ({mark.final_percentage >= 80 ? 'Outstanding' : mark.final_percentage >= 70 ? 'Meritorious' : 'Substantial'})
                        </span>
                      </td>
                      <td style={{ fontSize: '0.82rem', color: '#CBD5E1', maxWidth: '300px' }}>
                        "{mark.teacher_comment}"
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ====================================================================
            TAB 6: AUTOMATED TERM REPORT CARDS (Crisp, Printable, QR Code)
            ==================================================================== */}
        {activeTab === 'report_cards' && (
          <div>
            {/* Control Bar */}
            <div className="sp-panel sp-no-print" style={{ marginBottom: '1.5rem' }}>
              <div className="sp-panel-header" style={{ marginBottom: 0 }}>
                <div style={{ display: 'flex', gap: '1rem', alignItems: 'center', flexWrap: 'wrap' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.75rem', color: '#94A3B8', fontWeight: 700, marginBottom: '0.2rem' }}>
                      SELECT LEARNER:
                    </label>
                    <select
                      value={selectedReportStudentId}
                      onChange={(e) => setSelectedReportStudentId(e.target.value)}
                      style={{
                        background: 'rgba(15, 23, 42, 0.8)',
                        color: '#FFFFFF',
                        border: '1px solid rgba(255, 255, 255, 0.2)',
                        padding: '0.5rem 0.85rem',
                        borderRadius: '8px',
                        fontSize: '0.88rem'
                      }}
                    >
                      {school_students.map(s => (
                        <option key={s.id} value={s.id}>{s.full_name} ({s.class_name}) - {s.student_number}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '0.75rem', color: '#94A3B8', fontWeight: 700, marginBottom: '0.2rem' }}>
                      ACADEMIC TERM:
                    </label>
                    <select
                      value={selectedTermNumber}
                      onChange={(e) => setSelectedTermNumber(Number(e.target.value))}
                      style={{
                        background: 'rgba(15, 23, 42, 0.8)',
                        color: '#FFFFFF',
                        border: '1px solid rgba(255, 255, 255, 0.2)',
                        padding: '0.5rem 0.85rem',
                        borderRadius: '8px',
                        fontSize: '0.88rem'
                      }}
                    >
                      <option value={1}>Term 1 (Autumn)</option>
                      <option value={2}>Term 2 (Winter)</option>
                      <option value={3}>Term 3 (Spring)</option>
                      <option value={4}>Term 4 (Final Progression)</option>
                    </select>
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '0.75rem' }}>
                  <button className="sp-btn-secondary" onClick={handleSimulateParentEmail}>
                    ✉️ Dispatch to Parent Email
                  </button>
                  <button className="sp-btn-primary" onClick={handlePrintReport}>
                    🖨️ Print / Save Official PDF
                  </button>
                </div>
              </div>
            </div>

            {/* ================================================================
                THE OFFICIAL TERM REPORT CARD DOCUMENT (Print Ready)
                ================================================================ */}
            <div className="sp-report-card">
              <div className="sp-rc-watermark">OFFICIAL REPORT</div>

              {/* School Crest & Header */}
              <div className="sp-rc-header">
                <img src="/logo.svg" alt="School Crest" className="sp-rc-crest" />
                <div className="sp-rc-school-info">
                  <h1 className="sp-rc-school-title">{activeSchool.name}</h1>
                  <div className="sp-rc-school-subtitle">
                    Gauteng Department of Education • Independent Examinations Board (IEB) / CAPS Curriculum
                  </div>
                  <div className="sp-rc-emis">
                    EMIS NO: {activeSchool.emis_number} • TEL: {activeSchool.contact_phone} • {activeSchool.contact_email}
                  </div>
                  <div style={{ fontSize: '0.95rem', fontWeight: 800, color: '#0B132B', marginTop: '0.4rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                    OFFICIAL LEARNER ACADEMIC PERFORMANCE REPORT — TERM {selectedTermNumber}, 2026
                  </div>
                </div>

                <div className="sp-rc-qr-box">
                  <div style={{ width: '56px', height: '56px', background: '#0B132B', margin: '0 auto 0.2rem auto', borderRadius: '4px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#FFFFFF', fontSize: '0.65rem' }}>
                    [QR CODE]
                  </div>
                  <div className="sp-rc-qr-title">SCAN TO VERIFY</div>
                </div>
              </div>

              {/* Learner Demographics Grid */}
              <div className="sp-rc-student-grid">
                <div className="sp-rc-student-item">
                  <label>Learner Full Name</label>
                  <span>{reportStudent.full_name}</span>
                </div>
                <div className="sp-rc-student-item">
                  <label>Admission / Student No.</label>
                  <span>{reportStudent.student_number}</span>
                </div>
                <div className="sp-rc-student-item">
                  <label>Class &amp; Grade</label>
                  <span>{reportStudent.class_name} (Grade 10)</span>
                </div>
                <div className="sp-rc-student-item">
                  <label>Register Educator</label>
                  <span>Mr. Lefika Molefe</span>
                </div>
                <div className="sp-rc-student-item">
                  <label>ID / Passport No.</label>
                  <span>{reportStudent.id_number}</span>
                </div>
                <div className="sp-rc-student-item">
                  <label>Date of Birth</label>
                  <span>{reportStudent.dob}</span>
                </div>
                <div className="sp-rc-student-item">
                  <label>Days Present / Days Open</label>
                  <span>{studentSummary.days_present} / {studentSummary.days_enrolled} Days (96%)</span>
                </div>
                <div className="sp-rc-student-item">
                  <label>Official School Activities</label>
                  <span>{studentSummary.official_activities} Excused Days</span>
                </div>
              </div>

              {/* Academic Performance Table */}
              <table className="sp-rc-table">
                <thead>
                  <tr>
                    <th>Subject Description</th>
                    <th style={{ textAlign: 'center' }}>CASS (40%)</th>
                    <th style={{ textAlign: 'center' }}>Exam (60%)</th>
                    <th style={{ textAlign: 'center' }}>Term 1 %</th>
                    <th style={{ textAlign: 'center' }}>CAPS Level</th>
                    <th>Educator Comments</th>
                  </tr>
                </thead>
                <tbody>
                  {studentMarks.map(mark => (
                    <tr key={mark.subject_code}>
                      <td><strong>{mark.subject_name}</strong></td>
                      <td style={{ textAlign: 'center' }}>{mark.cass_mark}%</td>
                      <td style={{ textAlign: 'center' }}>{mark.exam_mark}%</td>
                      <td style={{ textAlign: 'center', fontWeight: 800 }}>{mark.final_percentage}%</td>
                      <td style={{ textAlign: 'center' }}>
                        <span className={`sp-rc-caps-badge sp-rc-caps-${mark.caps_level}`}>
                          Level {mark.caps_level}
                        </span>
                      </td>
                      <td style={{ fontSize: '0.78rem', fontStyle: 'italic' }}>
                        "{mark.teacher_comment}"
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {/* Overall Summary Bar */}
              <div style={{
                background: '#0B132B',
                color: '#FFFFFF',
                padding: '0.75rem 1.25rem',
                borderRadius: '8px',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: '1.25rem',
                fontSize: '0.9rem',
                fontWeight: 700
              }}>
                <span>OVERALL TERM AVERAGE: <span style={{ color: '#38BDF8', fontSize: '1.1rem' }}>{studentSummary.average_percentage}%</span></span>
                <span>ACHIEVEMENT LEVEL: <span style={{ color: '#34D399', fontSize: '1.1rem' }}>LEVEL {studentSummary.overall_caps_level} (MERITORIOUS)</span></span>
                <span>STATUS: <span style={{ color: '#FBBF24' }}>PASSED WITH DISTINCTION TRACK</span></span>
              </div>

              {/* Extracurricular & Behavioral Highlights */}
              <div style={{ background: '#F8FAFC', border: '1px solid #E2E8F0', borderRadius: '8px', padding: '0.75rem 1rem', marginBottom: '1.25rem', fontSize: '0.8rem' }}>
                <strong style={{ color: '#0B132B', textTransform: 'uppercase', display: 'block', marginBottom: '0.25rem' }}>
                  Extracurricular, Sports &amp; Cultural Involvement:
                </strong>
                <p style={{ margin: 0, color: '#334155', fontStyle: 'italic' }}>
                  Represented Pinecrest High School First Team U16 Soccer (St. Albans Derby League). Commended for exemplary sportsmanship and teamwork.
                </p>
              </div>

              {/* Class Teacher & Principal Remarks */}
              <div className="sp-rc-remarks-grid">
                <div className="sp-rc-remark-box">
                  <div className="sp-rc-remark-title">
                    <span>✍️</span> Class Register Teacher's Remark (Mr. L. Molefe)
                  </div>
                  <div className="sp-rc-remark-text">
                    "{studentSummary.class_teacher_remark}"
                  </div>
                </div>

                <div className="sp-rc-remark-box">
                  <div className="sp-rc-remark-title">
                    <span>🏫</span> Principal's Official Observation &amp; Promotion Endorsement
                  </div>
                  <div className="sp-rc-remark-text">
                    "{studentSummary.principal_remark}"
                  </div>
                  <div style={{ marginTop: '0.5rem', fontSize: '0.74rem', color: '#0369A1', fontWeight: 700 }}>
                    Outcome: {studentSummary.progression_outcome}
                  </div>
                </div>
              </div>

              {/* Official Signatures & Seal */}
              <div className="sp-rc-signatures">
                <div className="sp-rc-sig-block">
                  <div className="sp-rc-sig-line">L. Molefe</div>
                  <div className="sp-rc-sig-label">Class Register Educator</div>
                </div>

                <div style={{ textAlign: 'center' }}>
                  <div style={{
                    width: '70px',
                    height: '70px',
                    borderRadius: '50%',
                    border: '2px dashed #0284C7',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '0.65rem',
                    color: '#0284C7',
                    fontWeight: 800,
                    margin: '0 auto',
                    textTransform: 'uppercase',
                    letterSpacing: '0.05em'
                  }}>
                    OFFICIAL<br />SCHOOL<br />SEAL
                  </div>
                  <div style={{ fontSize: '0.62rem', color: '#64748B', marginTop: '0.2rem' }}>
                    {studentSummary.verification_hash}
                  </div>
                </div>

                <div className="sp-rc-sig-block">
                  <div className="sp-rc-sig-line">Dr. J. Khumalo</div>
                  <div className="sp-rc-sig-label">Principal / Head of School</div>
                </div>
              </div>
            </div>
          </div>
        )}

      </main>
    </div>
  );
};
