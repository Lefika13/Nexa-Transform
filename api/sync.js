// Vercel Serverless Function: Universal LMIS Multi-Device Direct Supabase Cloud Sync
// Uses the SERVICE ROLE KEY so it can read all tables server-side without RLS blocking
const SUPABASE_URL = process.env.VITE_SUPABASE_URL || 'https://bwygpjlzoefhfixtyxdg.supabase.co';

// Server-side: prefer the Service Role Key (bypasses RLS, never sent to browser)
// Falls back to anon key for backward compatibility until SUPABASE_SERVICE_ROLE_KEY is configured
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY ||
  process.env.VITE_SUPABASE_ANON_KEY;

const CORE_TABLES = [
  'student_profiles', 'courses', 'enrollments', 'assignments',
  'submissions', 'attendance', 'announcements', 'messages',
  'system_lecturers', 'system_admins', 'audit_logs', 'fees',
  'certificates', 'quizzes', 'quiz_attempts', 'library_resources', 'modules'
];

let memoryState = {
  student_profiles: [],
  courses: [],
  enrollments: [],
  assignments: [],
  submissions: [],
  attendance: [],
  announcements: [],
  modules: [],
  assessments: [],
  calendar_events: [],
  messages: [],
  notifications: [],
  library_resources: [],
  fees: [],
  certificates: [],
  quizzes: [],
  quiz_attempts: [],
  system_lecturers: [],
  system_admins: [],
  audit_logs: []
};

// Direct Supabase Query Helper
async function querySupabaseTable(table) {
  try {
    const res = await fetch(`${SUPABASE_URL}/rest/v1/${table}?select=*`, {
      headers: {
        'apikey': SUPABASE_KEY,
        'Authorization': `Bearer ${SUPABASE_KEY}`
      }
    });
    if (res.ok) {
      const data = await res.json();
      return Array.isArray(data) ? data : [];
    }
  } catch (err) {
    // Non-blocking fallback
  }
  return null;
}

// Fetch live state directly from Supabase — NO external mock fallback
async function fetchCombinedState() {
  const tablePromises = CORE_TABLES.map(async (table) => {
    const rows = await querySupabaseTable(table);
    return { table, rows };
  });

  const results = await Promise.allSettled(tablePromises);

  results.forEach(res => {
    if (res.status === 'fulfilled' && res.value && res.value.rows !== null) {
      // Only update if Supabase responded — keep last known state if it failed
      memoryState[res.value.table] = res.value.rows;
    }
  });

  return memoryState;
}


// Sync a single record directly into Supabase PostgreSQL table
async function syncRecordToSupabase(entityName, record, action) {
  if (!CORE_TABLES.includes(entityName)) return;

  const endpoint = `${SUPABASE_URL}/rest/v1/${entityName}`;

  try {
    if (action === 'delete') {
      const idVal = record.id || record.email || record.code;
      if (record.id) {
        await fetch(`${endpoint}?id=eq.${encodeURIComponent(record.id)}`, {
          method: 'DELETE',
          headers: { 'apikey': SUPABASE_KEY, 'Authorization': `Bearer ${SUPABASE_KEY}` }
        });
      }
      if (record.email) {
        await fetch(`${endpoint}?email=eq.${encodeURIComponent(record.email)}`, {
          method: 'DELETE',
          headers: { 'apikey': SUPABASE_KEY, 'Authorization': `Bearer ${SUPABASE_KEY}` }
        });
      }
    } else if (action === 'update' && record.id) {
      await fetch(`${endpoint}?id=eq.${encodeURIComponent(record.id)}`, {
        method: 'PATCH',
        headers: {
          'apikey': SUPABASE_KEY,
          'Authorization': `Bearer ${SUPABASE_KEY}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(record)
      });
    } else {
      // Prevent duplicate enrollment from being inserted
      if (entityName === 'enrollments' && record.learner_email && record.course_code) {
        try {
          const checkRes = await fetch(
            `${endpoint}?learner_email=eq.${encodeURIComponent(String(record.learner_email).toLowerCase().trim())}&course_code=eq.${encodeURIComponent(String(record.course_code).trim())}&select=id`,
            { headers: { 'apikey': SUPABASE_KEY, 'Authorization': `Bearer ${SUPABASE_KEY}` } }
          );
          if (checkRes.ok) {
            const existing = await checkRes.json();
            if (Array.isArray(existing) && existing.length > 0) {
              return; // Already enrolled in this course — skip duplicate insert
            }
          }
        } catch (_) {}
      }

      // Sanitize quizzes table to match Supabase PostgreSQL schema exactly
      if (entityName === 'quizzes') {
        const allowed = ['title', 'course_code', 'duration', 'pass_mark', 'max_attempts', 'questions', 'start_time', 'end_time'];
        const sanitized = {};
        allowed.forEach(k => { if (record[k] !== undefined) sanitized[k] = record[k]; });
        if (sanitized.duration) sanitized.duration = parseInt(sanitized.duration, 10) || 30;
        if (sanitized.pass_mark) sanitized.pass_mark = parseInt(sanitized.pass_mark, 10) || 50;
        if (sanitized.max_attempts) sanitized.max_attempts = parseInt(sanitized.max_attempts, 10) || 2;
        await fetch(endpoint, {
          method: 'POST',
          headers: {
            'apikey': SUPABASE_KEY,
            'Authorization': `Bearer ${SUPABASE_KEY}`,
            'Content-Type': 'application/json',
            'Prefer': 'return=minimal'
          },
          body: JSON.stringify(sanitized)
        });
        return;
      }

      if (entityName === 'submissions') {
        const allowed = ['assignment_title', 'course_code', 'learner_name', 'learner_email', 'content', 'attachments', 'grade', 'feedback', 'status', 'submitted_date'];
        const sanitized = {};
        allowed.forEach(k => { if (record[k] !== undefined) sanitized[k] = record[k]; });
        if (sanitized.content === undefined) sanitized.content = record.submission_text || record.notes || 'Assessment Submission';
        if (sanitized.grade !== undefined && sanitized.grade !== null) sanitized.grade = Math.round(Number(sanitized.grade)) || 0;
        if (!Array.isArray(sanitized.attachments)) sanitized.attachments = [];
        await fetch(endpoint, {
          method: 'POST',
          headers: {
            'apikey': SUPABASE_KEY,
            'Authorization': `Bearer ${SUPABASE_KEY}`,
            'Content-Type': 'application/json',
            'Prefer': 'return=minimal'
          },
          body: JSON.stringify(sanitized)
        });
        return;
      }

      if (entityName === 'quiz_attempts') {
        const allowed = ['quiz_id', 'learner_name', 'learner_email', 'course_code', 'score', 'status', 'started_at', 'completed_at', 'answers'];
        const sanitized = {};
        allowed.forEach(k => { if (record[k] !== undefined) sanitized[k] = record[k]; });
        if (sanitized.score !== undefined && sanitized.score !== null) sanitized.score = Number(sanitized.score) || 0;
        if (sanitized.quiz_id !== undefined) sanitized.quiz_id = String(sanitized.quiz_id);
        if (!sanitized.answers || typeof sanitized.answers !== 'object') sanitized.answers = {};
        await fetch(endpoint, {
          method: 'POST',
          headers: {
            'apikey': SUPABASE_KEY,
            'Authorization': `Bearer ${SUPABASE_KEY}`,
            'Content-Type': 'application/json',
            'Prefer': 'return=minimal'
          },
          body: JSON.stringify(sanitized)
        });
        return;
      }

      // Create or Upsert with resolution=merge-duplicates
      const isCustomIdTable = (entityName === 'system_lecturers' || entityName === 'system_admins' || entityName === 'modules' || entityName === 'library_resources');
      const payload = isCustomIdTable ? record : (() => { const p = { ...record }; delete p.id; return p; })();
      await fetch(endpoint, {
        method: 'POST',
        headers: {
          'apikey': SUPABASE_KEY,
          'Authorization': `Bearer ${SUPABASE_KEY}`,
          'Content-Type': 'application/json',
          'Prefer': isCustomIdTable ? 'resolution=merge-duplicates' : 'return=minimal'
        },
        body: JSON.stringify(payload)
      });
    }
  } catch (err) {
    console.warn(`Supabase ${action} note for ${entityName}:`, err.message);
  }
}


async function getCallerFromToken(authHeader) {
  if (!authHeader || !authHeader.startsWith('Bearer ')) return null;
  const token = authHeader.replace('Bearer ', '').trim();
  if (!token) return null;

  try {
    const res = await fetch(`${SUPABASE_URL}/auth/v1/user`, {
      headers: {
        'apikey': SUPABASE_KEY,
        'Authorization': `Bearer ${token}`
      }
    });
    if (res.ok) {
      return await res.json();
    }
  } catch (_) {}
  return null;
}

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version, Authorization'
  );

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  // Security Gate: Validate Bearer JWT Token
  const caller = await getCallerFromToken(req.headers.authorization);
  if (!caller) {
    return res.status(401).json({ error: 'Unauthorized: Valid Supabase authentication token required.' });
  }

  const ADMIN_ROLES = ['Super Admin', 'Admin', 'Academic Registrar', 'QA Officer', 'Finance Officer'];
  const ADMIN_EMAILS = [
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
    'lfk6613@gmail.com',
    'lefika6613@gmail.com'
  ];

  const callerRole = caller.user_metadata?.role;
  const callerEmail = (caller.email || '').toLowerCase().trim();
  const isAdmin = ADMIN_ROLES.includes(callerRole) || ADMIN_EMAILS.includes(callerEmail);
  const isLecturer = callerRole === 'Lecturer';

  if (req.method === 'GET') {
    if (!isAdmin) {
      return res.status(403).json({ error: 'Forbidden: Full database sync is restricted to administrative personnel.' });
    }
    const liveState = await fetchCombinedState();
    return res.status(200).json({
      status: 'ok',
      state: liveState,
      timestamp: Date.now()
    });
  }

  if (req.method === 'POST') {
    try {
      const body = typeof req.body === 'string' ? JSON.parse(req.body) : (req.body || {});
      const currentState = await fetchCombinedState();

      // Enforce RBAC on POST
      if (body.state && !isAdmin) {
        return res.status(403).json({ error: 'Forbidden: Full state replacement requires administrator privileges.' });
      }

      // 1. If single entity update is provided
      if (body.entityName && body.record) {
        const { entityName, record, action } = body;

        if (!isAdmin) {
          const SENSITIVE_TABLES = ['system_admins', 'system_lecturers', 'fees', 'certificates', 'courses', 'modules', 'audit_logs'];
          if (SENSITIVE_TABLES.includes(entityName)) {
            return res.status(403).json({ error: `Forbidden: Modification of ${entityName} is restricted to administrators.` });
          }

          if (!isLecturer) {
            const ALLOWED_STUDENT_TABLES = ['submissions', 'quiz_attempts', 'messages'];
            if (!ALLOWED_STUDENT_TABLES.includes(entityName)) {
              return res.status(403).json({ error: `Forbidden: Learners cannot mutate ${entityName}.` });
            }
            const recordEmail = (record.learner_email || record.email || '').toLowerCase().trim();
            if (recordEmail && recordEmail !== callerEmail) {
              return res.status(403).json({ error: 'Forbidden: Cannot create or modify records belonging to other learners.' });
            }
          }
        }
        const list = currentState[entityName] || [];
        const recordId = String(record.id || record.email || record.code);

        // Sync directly to Supabase Postgres
        await syncRecordToSupabase(entityName, record, action);

        if (action === 'delete') {
          const recId = record.id ? String(record.id) : null;
          const recEmail = record.email ? String(record.email).toLowerCase() : null;
          const recCode = record.code ? String(record.code) : null;
          
          currentState[entityName] = list.filter(item => {
            const itemId = item.id ? String(item.id) : null;
            const itemEmail = item.email ? String(item.email).toLowerCase() : null;
            const itemCode = item.code ? String(item.code) : null;

            if (recId && itemId === recId) return false;
            if (recEmail && itemEmail === recEmail) return false;
            if (recCode && itemCode === recCode) return false;
            if (String(item.id || item.email || item.code) === recordId) return false;
            return true;
          });
        } else if (action === 'update') {
          currentState[entityName] = list.map(item => String(item.id || item.email || item.code) === recordId ? { ...item, ...record } : item);
        } else {
          const exists = list.some(item => String(item.id || item.email || item.code) === recordId);
          if (exists) {
            currentState[entityName] = list.map(item => String(item.id || item.email || item.code) === recordId ? { ...item, ...record } : item);
          } else {
            currentState[entityName] = [record, ...list];
          }
        }
      }

      // 2. If full state is provided
      if (body.state) {
        Object.keys(body.state).forEach(key => {
          if (Array.isArray(body.state[key])) {
            const currentList = currentState[key] || [];
            const incomingList = body.state[key];
            const incomingIds = new Set(incomingList.map(item => String(item.id || item.email || item.code)));
            const existingNonOverlapping = currentList.filter(item => !incomingIds.has(String(item.id || item.email || item.code)));
            currentState[key] = [...incomingList, ...existingNonOverlapping];
          }
        });
      }

      memoryState = { ...currentState };

      return res.status(200).json({
        status: 'ok',
        state: currentState,
        timestamp: Date.now()
      });
    } catch (e) {
      return res.status(500).json({ error: e.message });
    }
  }

  res.status(405).json({ error: 'Method not allowed' });
}
