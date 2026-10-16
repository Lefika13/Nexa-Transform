import React, { useState, useMemo } from 'react';
import { useData } from '../../context/DataContext';

/* ── Icons ── */
const Icon = ({ d, size = 18, ...p }) => (
  <svg width={size} height={size} fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24" {...p}><path d={d} /></svg>
);
const IcoCalendar = (p) => <Icon d="M8 7V3m8 4V3M3 11h18M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" {...p}/>;
const IcoClock    = (p) => <Icon d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" {...p}/>;
const IcoCheck    = (p) => <Icon d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" {...p}/>;
const IcoBook     = (p) => <Icon d="M4 19.5A2.5 2.5 0 016.5 17H20" {...p}/>;
const IcoFile     = (p) => <Icon d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" {...p}/>;
const IcoX        = (p) => <Icon d="M18 6L6 18M6 6l12 12" {...p}/>;
const IcoPlus     = (p) => <Icon d="M12 5v14M5 12h14" {...p}/>;
const IcoTrash    = (p) => <Icon d="M3 6h18M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2M10 11v6M14 11v6" {...p}/>;
const IcoPrinter  = (p) => <Icon d="M6 9V2h12v7M6 18H4a2 2 0 01-2-2v-5a2 2 0 012-2h16a2 2 0 012 2v5a2 2 0 01-2 2h-2m-4 0h-4a2 2 0 00-2 2v2h8v-2a2 2 0 00-2-2z" {...p}/>;
const IcoChevronL = (p) => <Icon d="M15 19l-7-7 7-7" {...p}/>;
const IcoChevronR = (p) => <Icon d="M9 5l7 7-7 7" {...p}/>;

/* ── 30-Minute Time Slots (08:00 - 16:00) ── */
const TIME_SLOTS = [
  { start: '08:00', end: '08:30', label: '08:00 - 08:30' },
  { start: '08:30', end: '09:00', label: '08:30 - 09:00' },
  { start: '09:00', end: '09:30', label: '09:00 - 09:30' },
  { start: '09:30', end: '10:00', label: '09:30 - 10:00' },
  { start: '10:00', end: '10:30', label: '10:00 - 10:30' },
  { start: '10:30', end: '11:00', label: '10:30 - 11:00' },
  { start: '11:00', end: '11:30', label: '11:00 - 11:30' },
  { start: '11:30', end: '12:00', label: '11:30 - 12:00' },
  { start: '12:00', end: '12:30', label: '12:00 - 12:30' },
  { start: '12:30', end: '13:00', label: '12:30 - 13:00' },
  { start: '13:00', end: '13:30', label: '13:00 - 13:30' },
  { start: '13:30', end: '14:00', label: '13:30 - 14:00' },
  { start: '14:00', end: '14:30', label: '14:00 - 14:30' },
  { start: '14:30', end: '15:00', label: '14:30 - 15:00' },
  { start: '15:00', end: '15:30', label: '15:00 - 15:30' },
  { start: '15:30', end: '16:00', label: '15:30 - 16:00' }
];

const WEEKDAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];

// Soft pastel themes matching the Twinkl reference
const PASTEL_THEMES = [
  { bg: '#dcfce7', border: '#10b981', text: '#065f46', badge: '#bbf7d0' }, // Mint
  { bg: '#fef3c7', border: '#f59e0b', text: '#92400e', badge: '#fde68a' }, // Gold
  { bg: '#fce7f3', border: '#ec4899', text: '#9d174d', badge: '#fbcfe8' }, // Rose
  { bg: '#ede9fe', border: '#8b5cf6', text: '#5b21b6', badge: '#ddd6fe' }, // Lavender
  { bg: '#ccfbf1', border: '#14b8a6', text: '#115e59', badge: '#99f6e4' }, // Teal
  { bg: '#ffedd5', border: '#f97316', text: '#9a3412', badge: '#fed7aa' }, // Coral
  { bg: '#e0f2fe', border: '#0284c7', text: '#075985', badge: '#bae6fd' }, // Sky
];

/* ── Robust Time Parsers ── */
const parseTimeStr = (tStr) => {
  if (!tStr || typeof tStr !== 'string') return null;
  const clean = tStr.trim().toLowerCase();

  // Match 10am, 10:30am, 10pm, etc.
  const ampmMatch = clean.match(/^(\d{1,2})(?::(\d{2}))?\s*(am|pm)?$/);
  if (ampmMatch) {
    let hours = parseInt(ampmMatch[1], 10);
    const mins = ampmMatch[2] ? parseInt(ampmMatch[2], 10) : 0;
    const modifier = ampmMatch[3];
    if (modifier === 'pm' && hours < 12) hours += 12;
    if (modifier === 'am' && hours === 12) hours = 0;
    return `${String(hours).padStart(2, '0')}:${String(mins).padStart(2, '0')}`;
  }

  // Match standard 24-hr 10:00, 14:30
  const match = clean.match(/^(\d{1,2}):(\d{2})/);
  if (match) {
    const hours = parseInt(match[1], 10);
    const mins = parseInt(match[2], 10);
    return `${String(hours).padStart(2, '0')}:${String(mins).padStart(2, '0')}`;
  }
  return null;
};

const parseTimeRange = (rangeStr) => {
  if (!rangeStr || typeof rangeStr !== 'string') return null;
  const parts = rangeStr.split(/[-–—]|till|to/).map(s => s.trim()).filter(Boolean);
  if (parts.length < 2) return null;
  const startTime = parseTimeStr(parts[0]);
  const endTime = parseTimeStr(parts[1]);
  if (!startTime || !endTime) return null;
  return { startTime, endTime };
};

const parseTimeToMinutes = (timeStr) => {
  if (!timeStr || typeof timeStr !== 'string') return null;
  const parts = timeStr.trim().split(':');
  if (parts.length < 2) return null;
  const h = parseInt(parts[0], 10);
  const m = parseInt(parts[1], 10);
  if (isNaN(h) || isNaN(m)) return null;
  return h * 60 + m;
};

/* ── Safe Date Parser Helper ── */
const getSafeDate = (d) => {
  if (!d) return null;
  if (d instanceof Date && !isNaN(d.getTime())) return d;
  try {
    const parsed = new Date(d);
    return !isNaN(parsed.getTime()) ? parsed : null;
  } catch {
    return null;
  }
};

/* ── Self-Contained Local Error Boundary ── */
class CalendarErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('CalendarSchedule local error caught:', error, errorInfo);
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null });
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="lmis-card" style={{ padding: '2.5rem 1.5rem', textAlign: 'center', margin: '1rem 0' }}>
          <div style={{ fontSize: '2.5rem', color: '#ef4444', marginBottom: '0.75rem' }}>⚠</div>
          <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--text-main)', marginBottom: '0.5rem' }}>
            Timetable Display Notice
          </h3>
          <p style={{ fontSize: '0.875rem', color: 'var(--text-sub)', maxWidth: '550px', margin: '0 auto 1.25rem' }}>
            The schedule viewer encountered a temporary processing issue. All student records, grades, and enrollments remain completely secure.
          </p>
          {this.state.error && (
            <div style={{
              background: '#1e293b',
              color: '#f87171',
              padding: '0.85rem 1rem',
              borderRadius: '8px',
              fontFamily: 'monospace',
              fontSize: '0.75rem',
              maxWidth: '550px',
              margin: '0 auto 1.5rem',
              textAlign: 'left'
            }}>
              <strong>{this.state.error.name}:</strong> {this.state.error.message}
            </div>
          )}
          <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'center', flexWrap: 'wrap' }}>
            <button
              type="button"
              className="btn btn-sm btn-gold"
              onClick={this.handleReset}
            >
              🔄 Reset Timetable
            </button>
            <button
              type="button"
              className="btn btn-sm btn-ghost"
              onClick={() => {
                try {
                  localStorage.removeItem('nexa_lmis_persistent_state');
                } catch (_) {}
                window.location.reload();
              }}
            >
              🧹 Clear Local Cache &amp; Reload
            </button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

const LmisCalendarScheduleInner = ({
  userRole = 'Admin',
  userEmail = '',
  userName = '',
  allowedCourseCodes = null,
  onNavigateToTab = null
}) => {
  const dataContext = useData() || {};
  const courses = Array.isArray(dataContext.courses) ? dataContext.courses.filter(Boolean) : [];
  const quizzes = Array.isArray(dataContext.quizzes) ? dataContext.quizzes.filter(Boolean) : [];
  const assignments = Array.isArray(dataContext.assignments) ? dataContext.assignments.filter(Boolean) : [];
  const calendar_events = Array.isArray(dataContext.calendar_events) ? dataContext.calendar_events.filter(Boolean) : [];
  const system_lecturers = Array.isArray(dataContext.system_lecturers) ? dataContext.system_lecturers.filter(Boolean) : [];
  const class_schedules = Array.isArray(dataContext.class_schedules) ? dataContext.class_schedules.filter(Boolean) : [];
  const setData = dataContext.setData;

  // View state: 'timetable' (Class Timetable), 'month' (Monthly Calendar), 'daily' (Daily Timeline)
  const [viewMode, setViewMode] = useState('timetable');
  const [selectedCourseFilter, setSelectedCourseFilter] = useState('All');
  const [selectedFacilitatorFilter, setSelectedFacilitatorFilter] = useState('All');
  const [activeDate, setActiveDate] = useState(() => new Date());
  const [selectedItemDetail, setSelectedItemDetail] = useState(null);

  // Schedule Class Modal State
  const [showScheduleModal, setShowScheduleModal] = useState(false);
  const [scheduleForm, setScheduleForm] = useState({
    course_code: '',
    day: 'Monday',
    startTime: '10:00',
    endTime: '11:00',
    lecturer_name: '',
    room: 'Virtual Studio 1 / Main Campus'
  });

  // Available courses filtered by allowed course codes (for learners/lecturers)
  const availableCourses = useMemo(() => {
    if (!allowedCourseCodes || !Array.isArray(allowedCourseCodes) || allowedCourseCodes.length === 0) {
      return courses;
    }
    const cleanAllowed = allowedCourseCodes.map(c => String(c || '').trim().toLowerCase()).filter(Boolean);
    return courses.filter(c => c && c.code && cleanAllowed.includes(String(c.code).trim().toLowerCase()));
  }, [courses, allowedCourseCodes]);

  // Color map for course codes
  const courseThemeMap = useMemo(() => {
    const map = {};
    availableCourses.forEach((c, idx) => {
      if (c && c.code) {
        map[String(c.code).trim().toUpperCase()] = PASTEL_THEMES[idx % PASTEL_THEMES.length];
      }
    });
    return map;
  }, [availableCourses]);

  const getTheme = (code) => {
    const clean = String(code || '').trim().toUpperCase();
    return courseThemeMap[clean] || PASTEL_THEMES[0];
  };

  /* ── Unified Real Scheduled Events (NO MOCK / FALLBACK DATA) ── */
  const unifiedEvents = useMemo(() => {
    const events = [];

    // 1. Explicitly Scheduled Classes (via class_schedules)
    // 1. Explicitly Scheduled Classes (via class_schedules)
    class_schedules.forEach((s, idx) => {
      if (!s) return;
      const cCode = String(s.course_code || 'MODULE').trim();
      if (allowedCourseCodes && Array.isArray(allowedCourseCodes) && allowedCourseCodes.length > 0) {
        const cleanAllowed = allowedCourseCodes.map(c => String(c || '').trim().toUpperCase());
        if (!cleanAllowed.includes(cCode.toUpperCase())) return;
      }
      if (selectedCourseFilter !== 'All' && cCode.toUpperCase() !== String(selectedCourseFilter).trim().toUpperCase()) return;
      if (selectedFacilitatorFilter !== 'All' && s.lecturer_name !== selectedFacilitatorFilter) return;

      const sTime = parseTimeStr(s.startTime || s.start_time) || '10:00';
      const eTime = parseTimeStr(s.endTime || s.end_time) || '11:00';
      const cTitle = s.course_title || s.module_name || courses.find(c => c && c.code === cCode)?.title || cCode;
      const lec = s.lecturer_name || courses.find(c => c && c.code === cCode)?.lecturer_name || 'Academic Facilitator';

      events.push({
        id: s.id || `sched-${idx}`,
        type: 'CLASS',
        title: cTitle,
        course_code: cCode,
        day: s.day || 'Monday',
        startTime: sTime,
        endTime: eTime,
        duration: `${sTime} - ${eTime}`,
        lecturer: lec,
        room: s.room || 'Virtual Studio 1 / Main Campus',
        theme: getTheme(cCode),
        isCustomSchedule: true
      });
    });

    // 2. Real Course Lectures that have explicit schedule_day and schedule_time
    courses.forEach((c, idx) => {
      if (!c) return;
      if (allowedCourseCodes && Array.isArray(allowedCourseCodes) && allowedCourseCodes.length > 0) {
        const cleanAllowed = allowedCourseCodes.map(code => String(code || '').trim().toUpperCase());
        if (!cleanAllowed.includes(String(c.code || '').trim().toUpperCase())) return;
      }
      if (selectedCourseFilter !== 'All' && c.code !== selectedCourseFilter) return;
      if (selectedFacilitatorFilter !== 'All' && c.lecturer_name !== selectedFacilitatorFilter && c.lecturer_email !== selectedFacilitatorFilter) return;

      // STRICT CHECK: Only include if explicitly scheduled (no random day/time fallback!)
      if (c.schedule_day && c.schedule_time) {
        const parsedRange = parseTimeRange(c.schedule_time);
        if (parsedRange) {
          events.push({
            id: `course-lecture-${c.id || c.code || idx}`,
            type: 'CLASS',
            title: c.title || c.code,
            course_code: c.code,
            day: c.schedule_day,
            startTime: parsedRange.startTime,
            endTime: parsedRange.endTime,
            duration: `${parsedRange.startTime} - ${parsedRange.endTime}`,
            lecturer: c.lecturer_name || c.lecturer_email || 'Academic Facilitator',
            room: c.room || 'Virtual Studio 1 / Lecture Room',
            theme: getTheme(c.code)
          });
        }
      }
    });

    // 3. Quizzes & Tests ONLY if explicitly scheduled with date / start_time
    quizzes.forEach((q, idx) => {
      if (!q) return;
      if (allowedCourseCodes && Array.isArray(allowedCourseCodes) && allowedCourseCodes.length > 0) {
        const cleanAllowed = allowedCourseCodes.map(code => String(code || '').trim().toUpperCase());
        if (!cleanAllowed.includes(String(q.course_code || '').trim().toUpperCase())) return;
      }
      if (selectedCourseFilter !== 'All' && q.course_code !== selectedCourseFilter) return;

      // Only include if start_time is set
      if (q.start_time) {
        try {
          const sd = getSafeDate(q.start_time);
          if (sd) {
            const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
            const day = dayNames[sd.getDay()];
            const startTime = sd.toTimeString().substring(0, 5);
            let endTime = startTime;

            if (q.end_time) {
              const ed = getSafeDate(q.end_time);
              if (ed) endTime = ed.toTimeString().substring(0, 5);
            } else if (q.duration) {
              const sm = parseTimeToMinutes(startTime);
              if (sm !== null) {
                const em = sm + (parseInt(q.duration, 10) || 60);
                const eh = Math.floor(em / 60);
                const emm = em % 60;
                endTime = `${String(eh).padStart(2, '0')}:${String(emm).padStart(2, '0')}`;
              }
            }

            events.push({
              id: `quiz-${q.id || idx}`,
              type: 'QUIZ_TEST',
              title: q.title || 'Assessment Quiz',
              course_code: q.course_code || 'EXAM',
              day,
              date: sd,
              startTime,
              endTime,
              duration: `${q.duration || 60} mins`,
              pass_mark: q.pass_mark || 50,
              max_attempts: q.max_attempts || 2,
              lecturer: courses.find(c => c && c.code === q.course_code)?.lecturer_name || 'Academic Assessor',
              room: 'Online Examination Room / LMS Assessment',
              theme: getTheme(q.course_code)
            });
          }
        } catch (_) {}
      }
    });

    // 4. Assignments ONLY if explicitly scheduled with due_date
    assignments.forEach((a, idx) => {
      if (!a) return;
      if (allowedCourseCodes && Array.isArray(allowedCourseCodes) && allowedCourseCodes.length > 0) {
        const cleanAllowed = allowedCourseCodes.map(code => String(code || '').trim().toUpperCase());
        if (!cleanAllowed.includes(String(a.course_code || '').trim().toUpperCase())) return;
      }
      if (selectedCourseFilter !== 'All' && a.course_code !== selectedCourseFilter) return;

      if (a.due_date) {
        try {
          const dd = getSafeDate(a.due_date);
          if (dd) {
            const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
            const day = dayNames[dd.getDay()];
            const dueTime = dd.toTimeString().substring(0, 5) || '17:00';

            events.push({
              id: `assign-${a.id || idx}`,
              type: 'ASSIGNMENT',
              title: a.title || 'Assignment Deadline',
              course_code: a.course_code || 'PoE',
              day,
              date: dd,
              startTime: dueTime,
              endTime: dueTime,
              duration: 'Submission Deadline',
              total_marks: a.total_marks || 100,
              lecturer: courses.find(c => c && c.code === a.course_code)?.lecturer_name || 'Course Facilitator',
              room: 'Digital PoE Portal',
              theme: getTheme(a.course_code)
            });
          }
        } catch (_) {}
      }
    });

    // 5. Calendar Events ONLY if event_date exists
    calendar_events.forEach((ev, idx) => {
      if (!ev) return;
      if (ev.event_date) {
        try {
          const ed = getSafeDate(ev.event_date);
          if (ed) {
            const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
            const day = dayNames[ed.getDay()];
            const sTime = ev.start_time || '10:00';
            const eTime = ev.end_time || '11:00';

            events.push({
              id: `cal-ev-${ev.id || idx}`,
              type: 'INSTITUTIONAL',
              title: ev.title || 'Institutional Event',
              course_code: ev.course_code || 'All',
              day,
              date: ed,
              startTime: sTime,
              endTime: eTime,
              duration: `${sTime} - ${eTime}`,
              lecturer: 'Institutional Academic Council',
              room: 'Main Campus / Online',
              theme: PASTEL_THEMES[4]
            });
          }
        } catch (_) {}
      }
    });

    return events;
  }, [class_schedules, courses, quizzes, assignments, calendar_events, selectedCourseFilter, selectedFacilitatorFilter, courseThemeMap, allowedCourseCodes]);

  // Map events to Timetable slots
  const getSlotEvents = (day, slot) => {
    const slotStartMin = parseTimeToMinutes(slot.start);
    const slotEndMin = parseTimeToMinutes(slot.end);
    if (slotStartMin === null || slotEndMin === null) return [];

    return unifiedEvents.filter(ev => {
      if (String(ev.day || '').trim().toLowerCase() !== String(day || '').trim().toLowerCase()) return false;
      const evStartMin = parseTimeToMinutes(ev.startTime);
      const evEndMin = parseTimeToMinutes(ev.endTime);
      if (evStartMin === null || evEndMin === null) return false;

      // Check overlap between event [evStartMin, evEndMin] and slot [slotStartMin, slotEndMin]
      return Math.max(slotStartMin, evStartMin) < Math.min(slotEndMin, evEndMin);
    });
  };

  // Month navigation helpers
  const safeActiveDate = (activeDate instanceof Date && !isNaN(activeDate.getTime())) ? activeDate : new Date();
  const year = safeActiveDate.getFullYear();
  const month = safeActiveDate.getMonth();
  const monthName = safeActiveDate.toLocaleString('en-ZA', { month: 'long', year: 'numeric' });

  const monthGridDays = useMemo(() => {
    const firstDay = new Date(year, month, 1).getDay(); // 0 = Sun
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const days = [];

    // Blank cells before day 1
    for (let i = 0; i < firstDay; i++) {
      days.push({ dayNumber: null, isCurrentMonth: false });
    }

    // Actual month days
    for (let d = 1; d <= daysInMonth; d++) {
      const dateObj = new Date(year, month, d);
      const dayWeekday = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'][dateObj.getDay()];

      // Events on this exact date or recurring weekly scheduled class on this weekday
      const dayEvents = unifiedEvents.filter(ev => {
        const evDate = getSafeDate(ev.date);
        if (evDate) {
          return evDate.getFullYear() === year && evDate.getMonth() === month && evDate.getDate() === d;
        }
        return ev.type === 'CLASS' && String(ev.day || '').trim().toLowerCase() === dayWeekday.toLowerCase();
      });

      days.push({
        dayNumber: d,
        date: dateObj,
        isCurrentMonth: true,
        isToday: new Date().toDateString() === dateObj.toDateString(),
        events: dayEvents
      });
    }

    return days;
  }, [year, month, unifiedEvents]);

  // Handle saving new class schedule
  const handleSaveSchedule = (e) => {
    e.preventDefault();
    if (!scheduleForm.course_code) {
      alert('Please select a course module.');
      return;
    }

    const selectedCourseObj = courses.find(c => c.code === scheduleForm.course_code);
    const newScheduleItem = {
      id: `sched-${Date.now()}`,
      course_code: scheduleForm.course_code,
      course_title: selectedCourseObj?.title || scheduleForm.course_code,
      lecturer_name: scheduleForm.lecturer_name || selectedCourseObj?.lecturer_name || userName || 'Academic Facilitator',
      day: scheduleForm.day,
      startTime: scheduleForm.startTime,
      endTime: scheduleForm.endTime,
      room: scheduleForm.room || 'Virtual Studio 1 / Main Campus'
    };

    if (setData) {
      setData(prev => ({
        ...prev,
        class_schedules: [...(prev.class_schedules || []), newScheduleItem]
      }));
    }

    setShowScheduleModal(false);
    setScheduleForm({
      course_code: '',
      day: 'Monday',
      startTime: '10:00',
      endTime: '11:00',
      lecturer_name: '',
      room: 'Virtual Studio 1 / Main Campus'
    });
  };

  // Handle deleting a schedule item
  const handleDeleteSchedule = (schedId) => {
    if (!schedId) return;
    if (setData) {
      setData(prev => ({
        ...prev,
        class_schedules: (prev.class_schedules || []).filter(s => s.id !== schedId)
      }));
    }
    setSelectedItemDetail(null);
  };

  // Educator & Course Display for Header
  const displayEducator = selectedFacilitatorFilter !== 'All'
    ? selectedFacilitatorFilter
    : (userRole === 'Lecturer' ? userName : 'Academic Faculty');

  const displayCourse = selectedCourseFilter !== 'All'
    ? selectedCourseFilter
    : (availableCourses.length === 1 ? availableCourses[0].title : 'Institutional');

  const canManageSchedule = (userRole === 'Admin' || userRole === 'Super Admin' || userRole === 'Academic Registrar' || userRole === 'Lecturer');

  return (
    <div className="lmis-calendar-root">
      {/* ── Control Bar / View Switcher ── */}
      <div className="lmis-card mb-4 no-print" style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}>
        <div className="lmis-card-body" style={{ padding: '0.9rem 1.25rem' }}>
          <div className="flex-between flex-wrap" style={{ gap: '1rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <span style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-sub)' }}>View Mode:</span>
                <select
                  className="lmis-form-select"
                  style={{ width: 'auto', minWidth: '220px', fontWeight: 700, borderColor: 'var(--gold)' }}
                  value={viewMode}
                  onChange={(e) => setViewMode(e.target.value)}
                >
                  <option value="timetable">📅 Class Timetable (Weekly Grid)</option>
                  <option value="month">🗓️ Monthly Calendar (Tests, Quizzes & Deadlines)</option>
                  <option value="daily">⏱️ Daily Timeline (Detailed Schedule)</option>
                </select>
              </div>

              {/* Course Filter Dropdown */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <span style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-sub)' }}>Course:</span>
                <select
                  className="lmis-form-select"
                  style={{ width: 'auto', minWidth: '160px' }}
                  value={selectedCourseFilter}
                  onChange={(e) => setSelectedCourseFilter(e.target.value)}
                >
                  <option value="All">All Courses ({availableCourses.length})</option>
                  {availableCourses.map(c => (
                    <option key={c.code} value={c.code}>{c.code} — {c.title}</option>
                  ))}
                </select>
              </div>

              {/* Facilitator Filter Dropdown */}
              {userRole !== 'Lecturer' && system_lecturers && system_lecturers.length > 0 && (
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <span style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-sub)' }}>Facilitator:</span>
                  <select
                    className="lmis-form-select"
                    style={{ width: 'auto', minWidth: '160px' }}
                    value={selectedFacilitatorFilter}
                    onChange={(e) => setSelectedFacilitatorFilter(e.target.value)}
                  >
                    <option value="All">All Facilitators</option>
                    {system_lecturers.map((l, i) => (
                      <option key={i} value={l.name}>{l.name}</option>
                    ))}
                  </select>
                </div>
              )}
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              {canManageSchedule && (
                <button
                  type="button"
                  className="btn btn-sm btn-gold"
                  onClick={() => {
                    const defaultCourse = availableCourses[0]?.code || '';
                    const defaultLec = availableCourses[0]?.lecturer_name || userName || '';
                    setScheduleForm(prev => ({
                      ...prev,
                      course_code: defaultCourse,
                      lecturer_name: defaultLec
                    }));
                    setShowScheduleModal(true);
                  }}
                  style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', fontWeight: 700 }}
                >
                  <IcoPlus size={16} /> Schedule Class
                </button>
              )}
              <button
                type="button"
                className="btn btn-sm btn-ghost"
                onClick={() => window.print()}
                title="Print or save timetable as PDF"
                style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', fontWeight: 600 }}
              >
                <IcoPrinter size={16} /> Print Timetable
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* ── VIEW 1: CLASS TIMETABLE (Exact Twinkl Structure) ── */}
      {viewMode === 'timetable' && (
        <div className="lmis-twinkl-card">
          {/* Header Layout matching uploaded reference template */}
          <div className="lmis-twinkl-header">
            <div className="lmis-twinkl-brand">
              <img src="/logo.svg" alt="Nexa Logo" className="lmis-twinkl-logo" />
              <div className="lmis-twinkl-brand-text">
                <span className="lmis-twinkl-brand-main">NEXA TRANSFORM</span>
                <span className="lmis-twinkl-brand-sub">INSTITUTIONAL ACADEMIC TIMETABLE</span>
              </div>
            </div>
            <div className="lmis-twinkl-title-block">
              <h2 className="lmis-twinkl-heading">
                Educator: <span className="lmis-twinkl-fill">{displayEducator}</span> &mdash; <span className="lmis-twinkl-fill">{displayCourse}</span> Class Timetable
              </h2>
              <div className="lmis-twinkl-subtext">
                Academic Term 2026 &bull; Verified Lecture &amp; Assessment Schedule
              </div>
            </div>
          </div>

          {/* Timetable Grid Table */}
          <div className="lmis-twinkl-table-wrapper">
            <table className="lmis-twinkl-table">
              <thead>
                <tr>
                  <th className="lmis-twinkl-th-time">Time</th>
                  {WEEKDAYS.map(day => (
                    <th key={day} className="lmis-twinkl-th-day">{day}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {TIME_SLOTS.map((slot, sIdx) => {
                  return (
                    <tr key={sIdx}>
                      <td className="lmis-twinkl-time-cell">{slot.label}</td>
                      {WEEKDAYS.map(day => {
                        const cellEvents = getSlotEvents(day, slot);

                        return (
                          <td key={day} className="lmis-twinkl-day-cell">
                            {cellEvents.map((ev, eIdx) => {
                              const evTheme = ev.theme || PASTEL_THEMES[0];
                              return (
                                <div
                                  key={eIdx}
                                  className="lmis-twinkl-slot-item"
                                  style={{
                                    backgroundColor: evTheme.bg,
                                    borderLeft: `4px solid ${evTheme.border}`,
                                    color: evTheme.text
                                  }}
                                  onClick={() => setSelectedItemDetail(ev)}
                                  title="Click to view full class details"
                                >
                                  {/* Module Name */}
                                  <div className="lmis-twinkl-slot-title">
                                    {ev.type === 'QUIZ_TEST' && '📝 '}
                                    {ev.type === 'ASSIGNMENT' && '📚 '}
                                    {ev.type === 'CLASS' && '🎓 '}
                                    {ev.title}
                                  </div>

                                  {/* Module Code Badge & Scheduled Time */}
                                  <div className="lmis-twinkl-slot-meta">
                                    <span className="lmis-twinkl-slot-badge" style={{ backgroundColor: evTheme.badge }}>
                                      {ev.course_code}
                                    </span>
                                    <span className="lmis-twinkl-slot-time">
                                      {ev.startTime} - {ev.endTime}
                                    </span>
                                  </div>

                                  {/* Lecturer / Facilitator */}
                                  {ev.lecturer && (
                                    <div className="lmis-twinkl-slot-lecturer">
                                      👤 {ev.lecturer}
                                    </div>
                                  )}
                                </div>
                              );
                            })}
                          </td>
                        );
                      })}
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Institutional Core Pillars Strip Under Last Time Row */}
          <div className="lmis-twinkl-pillars-strip">
            <div className="lmis-twinkl-pillars-title">NEXA CORE INSTITUTIONAL PILLARS</div>
            <div className="lmis-twinkl-pillars-list">
              <span className="lmis-twinkl-pillar">✦ Integrity</span>
              <span className="lmis-twinkl-pillar">✦ Innovation</span>
              <span className="lmis-twinkl-pillar">✦ Excellence</span>
              <span className="lmis-twinkl-pillar">✦ Collaboration</span>
              <span className="lmis-twinkl-pillar">✦ Respect</span>
              <span className="lmis-twinkl-pillar">✦ Impact</span>
            </div>
          </div>
        </div>
      )}

      {/* ── VIEW 2: MONTHLY CALENDAR (Tests, Quizzes & Deadlines) ── */}
      {viewMode === 'month' && (
        <div className="lmis-card">
          <div className="lmis-card-header flex-between" style={{ padding: '1rem 1.25rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <button
                type="button"
                className="btn btn-sm btn-ghost"
                onClick={() => setActiveDate(new Date(year, month - 1, 1))}
              >
                <IcoChevronL size={16} /> Prev
              </button>
              <h2 style={{ fontSize: '1.25rem', fontWeight: 800, margin: 0, color: 'var(--text-main)' }}>
                {monthName}
              </h2>
              <button
                type="button"
                className="btn btn-sm btn-ghost"
                onClick={() => setActiveDate(new Date(year, month + 1, 1))}
              >
                Next <IcoChevronR size={16} />
              </button>
              <button
                type="button"
                className="btn btn-sm btn-gold"
                onClick={() => setActiveDate(new Date())}
              >
                Today
              </button>
            </div>
            <div style={{ fontSize: '0.85rem', color: 'var(--text-sub)' }}>
              Scheduled module sessions, quizzes with start-to-end times &amp; assignment deadlines
            </div>
          </div>

          <div className="lmis-card-body" style={{ padding: '1rem' }}>
            <div className="lmis-month-calendar-grid">
              {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(d => (
                <div key={d} className="lmis-month-header-cell">{d}</div>
              ))}

              {monthGridDays.map((cell, idx) => {
                if (!cell.isCurrentMonth) {
                  return <div key={idx} className="lmis-month-day-cell disabled" />;
                }

                return (
                  <div
                    key={idx}
                    className={`lmis-month-day-cell${cell.isToday ? ' today' : ''}`}
                  >
                    <div className="lmis-month-day-num">
                      <span className={cell.isToday ? 'today-pill' : ''}>{cell.dayNumber}</span>
                    </div>

                    <div className="lmis-month-events-list">
                      {(cell.events || []).map((ev, eIdx) => {
                        const evTheme = ev.theme || PASTEL_THEMES[0];
                        return (
                          <div
                            key={eIdx}
                            className="lmis-month-event-item"
                            style={{
                              backgroundColor: evTheme.bg,
                              borderLeft: `3px solid ${evTheme.border}`,
                              color: evTheme.text
                            }}
                            onClick={() => setSelectedItemDetail(ev)}
                          >
                            <div className="lmis-month-event-title">
                              {ev.type === 'QUIZ_TEST' ? '📝 ' : ev.type === 'ASSIGNMENT' ? '📚 ' : '🎓 '}
                              {ev.title}
                            </div>
                            <div className="lmis-month-event-time">
                              ⏰ {ev.startTime} - {ev.endTime}
                            </div>
                            {ev.lecturer && (
                              <div style={{ fontSize: '0.62rem', opacity: 0.85, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                👤 {ev.lecturer}
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* ── VIEW 3: DAILY TIMELINE ── */}
      {viewMode === 'daily' && (
        <div className="lmis-card">
          <div className="lmis-card-header flex-between">
            <div>
              <h2 className="lmis-card-title">Daily Academic Schedule</h2>
              <p className="lmis-card-sub">Chronological view of scheduled module lectures, tests, and assignments.</p>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <input
                type="date"
                className="lmis-form-input"
                style={{ width: 'auto' }}
                value={(activeDate instanceof Date && !isNaN(activeDate.getTime()) ? activeDate : new Date()).toISOString().substring(0, 10)}
                onChange={(e) => {
                  const d = new Date(e.target.value);
                  if (!isNaN(d.getTime())) setActiveDate(d);
                }}
              />
            </div>
          </div>

          <div className="lmis-card-body">
            {(() => {
              const safeCurrentDate = (activeDate instanceof Date && !isNaN(activeDate.getTime())) ? activeDate : new Date();
              const dayName = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'][safeCurrentDate.getDay()];
              const dayEvents = unifiedEvents.filter(ev => {
                const evDate = getSafeDate(ev.date);
                if (evDate) {
                  return evDate.toDateString() === safeCurrentDate.toDateString();
                }
                return ev.type === 'CLASS' && String(ev.day || '').trim().toLowerCase() === dayName.toLowerCase();
              }).sort((a, b) => (parseTimeToMinutes(a.startTime) || 0) - (parseTimeToMinutes(b.startTime) || 0));

              if (dayEvents.length === 0) {
                return (
                  <div className="lmis-empty">
                    <IcoCalendar size={42} style={{ color: '#94a3b8' }} />
                    <p className="lmis-empty-title">No sessions scheduled for {dayName}, {activeDate.toLocaleDateString('en-ZA')}</p>
                    <p className="lmis-empty-sub">No lectures, tests, or assessments scheduled on this date.</p>
                  </div>
                );
              }

              return (
                <div className="lmis-daily-timeline">
                  {dayEvents.map((ev, i) => {
                    const evTheme = ev.theme || PASTEL_THEMES[0];
                    return (
                      <div key={i} className="lmis-daily-item">
                        <div className="lmis-daily-time">
                          <div className="lmis-daily-start">{ev.startTime}</div>
                          <div className="lmis-daily-end">{ev.endTime}</div>
                        </div>
                        <div
                          className="lmis-daily-card"
                          style={{
                            backgroundColor: evTheme.bg,
                            borderLeft: `4px solid ${evTheme.border}`
                          }}
                          onClick={() => setSelectedItemDetail(ev)}
                        >
                          <div className="flex-between mb-1">
                            <span className="lmis-daily-course" style={{ backgroundColor: evTheme.badge, color: evTheme.text }}>
                              {ev.course_code} &bull; {ev.type === 'CLASS' ? 'Class Session' : ev.type}
                            </span>
                            <span style={{ fontSize: '0.8rem', color: evTheme.text, fontWeight: 700 }}>
                              {ev.startTime} - {ev.endTime}
                            </span>
                          </div>
                          <div className="lmis-daily-title" style={{ color: evTheme.text }}>
                            {ev.title}
                          </div>
                          <div className="lmis-daily-meta" style={{ color: evTheme.text, opacity: 0.9 }}>
                            <span>Facilitator: {ev.lecturer}</span> &bull; <span>Location: {ev.room}</span>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              );
            })()}
          </div>
        </div>
      )}

      {/* ── SCHEDULE A CLASS MODAL ── */}
      {showScheduleModal && (
        <div className="lmis-modal-overlay">
          <div className="lmis-modal-backdrop" onClick={() => setShowScheduleModal(false)} />
          <div className="lmis-modal" style={{ maxWidth: '520px' }}>
            <div className="lmis-modal-header flex-between">
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <IcoCalendar size={20} style={{ color: 'var(--gold)' }} />
                <span className="lmis-modal-title">Schedule Class / Module Session</span>
              </div>
              <button className="btn btn-sm btn-ghost" onClick={() => setShowScheduleModal(false)}><IcoX size={16} /></button>
            </div>

            <form onSubmit={handleSaveSchedule}>
              <div className="lmis-modal-body" style={{ padding: '1.25rem' }}>
                <p style={{ fontSize: '0.85rem', color: 'var(--text-sub)', marginBottom: '1.25rem' }}>
                  Add an official scheduled class. It will appear directly on the Twinkl Timetable, Monthly Calendar, and Daily Timeline with module name and facilitator.
                </p>

                <div className="lmis-form-group mb-3">
                  <label className="lmis-form-label">Select Module / Course *</label>
                  <select
                    className="lmis-form-select"
                    value={scheduleForm.course_code}
                    onChange={(e) => {
                      const code = e.target.value;
                      const cObj = courses.find(c => c.code === code);
                      setScheduleForm(prev => ({
                        ...prev,
                        course_code: code,
                        lecturer_name: cObj?.lecturer_name || prev.lecturer_name
                      }));
                    }}
                    required
                  >
                    <option value="">-- Select Module --</option>
                    {availableCourses.map(c => (
                      <option key={c.code} value={c.code}>{c.code} — {c.title}</option>
                    ))}
                  </select>
                </div>

                <div className="lmis-grid-2col mb-3" style={{ gap: '1rem' }}>
                  <div>
                    <label className="lmis-form-label">Day of Week *</label>
                    <select
                      className="lmis-form-select"
                      value={scheduleForm.day}
                      onChange={(e) => setScheduleForm(prev => ({ ...prev, day: e.target.value }))}
                      required
                    >
                      {WEEKDAYS.map(d => (
                        <option key={d} value={d}>{d}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="lmis-form-label">Room / Location</label>
                    <input
                      type="text"
                      className="lmis-form-input"
                      value={scheduleForm.room}
                      onChange={(e) => setScheduleForm(prev => ({ ...prev, room: e.target.value }))}
                      placeholder="e.g. Virtual Studio 1 / Room 101"
                    />
                  </div>
                </div>

                <div className="lmis-grid-2col mb-3" style={{ gap: '1rem' }}>
                  <div>
                    <label className="lmis-form-label">Start Time *</label>
                    <select
                      className="lmis-form-select"
                      value={scheduleForm.startTime}
                      onChange={(e) => setScheduleForm(prev => ({ ...prev, startTime: e.target.value }))}
                      required
                    >
                      {TIME_SLOTS.map(s => (
                        <option key={s.start} value={s.start}>{s.start}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="lmis-form-label">End Time *</label>
                    <select
                      className="lmis-form-select"
                      value={scheduleForm.endTime}
                      onChange={(e) => setScheduleForm(prev => ({ ...prev, endTime: e.target.value }))}
                      required
                    >
                      {TIME_SLOTS.map(s => (
                        <option key={s.end} value={s.end}>{s.end}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="lmis-form-group">
                  <label className="lmis-form-label">Lecturer / Facilitator Name *</label>
                  <input
                    type="text"
                    className="lmis-form-input"
                    value={scheduleForm.lecturer_name}
                    onChange={(e) => setScheduleForm(prev => ({ ...prev, lecturer_name: e.target.value }))}
                    placeholder="e.g. Mr. Lefika Molefe"
                    required
                  />
                </div>
              </div>

              <div className="lmis-modal-footer flex-between">
                <button type="button" className="btn btn-sm btn-ghost" onClick={() => setShowScheduleModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-sm btn-gold">
                  <IcoCheck size={16} /> Save &amp; Add to Timetable
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── SESSION / EVENT DETAIL MODAL ── */}
      {selectedItemDetail && (
        <div className="lmis-modal-overlay">
          <div className="lmis-modal-backdrop" onClick={() => setSelectedItemDetail(null)} />
          <div className="lmis-modal" style={{ maxWidth: '540px' }}>
            <div className="lmis-modal-header flex-between">
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <span style={{ fontSize: '1.2rem' }}>
                  {selectedItemDetail.type === 'QUIZ_TEST' ? '📝' : selectedItemDetail.type === 'ASSIGNMENT' ? '📚' : '🎓'}
                </span>
                <span className="lmis-modal-title">
                  {selectedItemDetail.type === 'CLASS' ? 'Class Session' : selectedItemDetail.type.replace('_', ' ')} Details
                </span>
              </div>
              <button className="btn btn-sm btn-ghost" onClick={() => setSelectedItemDetail(null)}><IcoX size={16} /></button>
            </div>

            <div className="lmis-modal-body" style={{ padding: '1.25rem' }}>
              <div style={{ marginBottom: '1.25rem' }}>
                <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--text-main)', marginBottom: '0.25rem' }}>
                  {selectedItemDetail.title}
                </h3>
                <span className="badge badge-teal">{selectedItemDetail.course_code}</span>
              </div>

              <div className="lmis-grid-2col mb-3" style={{ gap: '1rem', background: 'var(--surface-alt, #f8fafc)', padding: '1rem', borderRadius: '8px' }}>
                <div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-sub)', fontWeight: 700, textTransform: 'uppercase' }}>Scheduled Time</div>
                  <div style={{ fontSize: '0.95rem', fontWeight: 800, color: 'var(--text-main)', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                    <IcoClock size={14} /> {selectedItemDetail.startTime} &mdash; {selectedItemDetail.endTime}
                  </div>
                </div>
                <div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-sub)', fontWeight: 700, textTransform: 'uppercase' }}>Day / Date</div>
                  <div style={{ fontSize: '0.95rem', fontWeight: 700, color: 'var(--text-main)' }}>
                    {(() => {
                      const detailDate = getSafeDate(selectedItemDetail.date);
                      return detailDate ? detailDate.toLocaleDateString('en-ZA', { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' }) : (selectedItemDetail.day || 'Scheduled');
                    })()}
                  </div>
                </div>
                <div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-sub)', fontWeight: 700, textTransform: 'uppercase' }}>Session Window</div>
                  <div style={{ fontSize: '0.95rem', fontWeight: 700, color: 'var(--text-main)' }}>
                    {selectedItemDetail.startTime} &mdash; {selectedItemDetail.endTime}
                  </div>
                </div>
                <div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-sub)', fontWeight: 700, textTransform: 'uppercase' }}>Facilitator / Lecturer</div>
                  <div style={{ fontSize: '0.95rem', fontWeight: 700, color: 'var(--text-main)' }}>
                    {selectedItemDetail.lecturer}
                  </div>
                </div>
              </div>

              {selectedItemDetail.pass_mark && (
                <div style={{ fontSize: '0.85rem', color: 'var(--text-sub)', marginBottom: '0.5rem' }}>
                  <strong>Pass Mark:</strong> {selectedItemDetail.pass_mark}% &bull; <strong>Allowed Attempts:</strong> {selectedItemDetail.max_attempts}
                </div>
              )}
              {selectedItemDetail.total_marks && (
                <div style={{ fontSize: '0.85rem', color: 'var(--text-sub)', marginBottom: '0.5rem' }}>
                  <strong>Total Assessment Marks:</strong> {selectedItemDetail.total_marks} Marks
                </div>
              )}
              <div style={{ fontSize: '0.85rem', color: 'var(--text-sub)' }}>
                <strong>Platform / Location:</strong> {selectedItemDetail.room}
              </div>
            </div>

            <div className="lmis-modal-footer flex-between">
              <div>
                {selectedItemDetail.isCustomSchedule && canManageSchedule && (
                  <button
                    type="button"
                    className="btn btn-sm btn-ghost text-danger"
                    style={{ color: '#ef4444', display: 'inline-flex', alignItems: 'center', gap: '0.3rem' }}
                    onClick={() => handleDeleteSchedule(selectedItemDetail.id)}
                  >
                    <IcoTrash size={14} /> Remove Schedule
                  </button>
                )}
              </div>
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                <button type="button" className="btn btn-sm btn-ghost" onClick={() => setSelectedItemDetail(null)}>Close</button>
                {onNavigateToTab && selectedItemDetail.type !== 'CLASS' && (
                  <button
                    type="button"
                    className="btn btn-sm btn-gold"
                    onClick={() => {
                      const target = selectedItemDetail.type === 'QUIZ_TEST' ? 'quizzes' : 'assignments';
                      onNavigateToTab(target);
                      setSelectedItemDetail(null);
                    }}
                  >
                    View Assessment
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export const LmisCalendarSchedule = (props) => (
  <CalendarErrorBoundary>
    <LmisCalendarScheduleInner {...props} />
  </CalendarErrorBoundary>
);
