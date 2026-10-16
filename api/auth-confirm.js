// Vercel Serverless Function: auth-confirm.js
// Provisions a Supabase Auth account for a learner and auto-confirms their email.
// Uses SUPABASE_SERVICE_ROLE_KEY — stored ONLY in Vercel env vars, NEVER in the browser.
// Called by: AdminPortal (on learner registration) and LearnerPortal (first-login auto-fix)

const SUPABASE_URL = process.env.VITE_SUPABASE_URL || 'https://bwygpjlzoefhfixtyxdg.supabase.co';
const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

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
  'lefika6613@gmail.com'
];

async function getCallerFromToken(authHeader) {
  if (!authHeader || !authHeader.startsWith('Bearer ')) return null;
  const token = authHeader.replace('Bearer ', '').trim();
  if (!token) return null;

  try {
    const res = await fetch(`${SUPABASE_URL}/auth/v1/user`, {
      headers: {
        'apikey': SERVICE_ROLE_KEY,
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
  res.setHeader('Access-Control-Allow-Methods', 'POST,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') { res.status(200).end(); return; }
  if (req.method !== 'POST') { res.status(405).json({ error: 'Method not allowed' }); return; }

  if (!SERVICE_ROLE_KEY) {
    return res.status(503).json({ error: 'service_role_not_configured', message: 'Auth provisioning not yet available. Contact admin.' });
  }

  const caller = await getCallerFromToken(req.headers.authorization);
  const callerRole = caller?.user_metadata?.role;
  const callerEmail = caller?.email?.toLowerCase().trim();
  const isAdmin = caller && (ADMIN_ROLES.includes(callerRole) || ADMIN_EMAILS.includes(callerEmail));

  const body = typeof req.body === 'string' ? JSON.parse(req.body) : (req.body || {});
  const { email, password, name, student_number, role } = body;

  if (!email || !password) {
    return res.status(400).json({ error: 'email and password are required' });
  }

  const cleanEmail = email.toLowerCase().trim();

  // 1. Check if user already exists
  let existingUser = null;
  try {
    const listRes = await fetch(
      `${SUPABASE_URL}/auth/v1/admin/users?email=${encodeURIComponent(cleanEmail)}`,
      {
        headers: {
          'apikey': SERVICE_ROLE_KEY,
          'Authorization': `Bearer ${SERVICE_ROLE_KEY}`
        }
      }
    );
    if (listRes.ok) {
      const listData = await listRes.json();
      existingUser = (listData.users || []).find(u => (u.email || '').toLowerCase().trim() === cleanEmail);
    }
  } catch (_) {}

  // 2. If account does NOT exist -> Provisioning a new user
  if (!existingUser) {
    // Enterprise Security: Only verified administrators can provision new accounts
    if (!isAdmin) {
      return res.status(403).json({
        error: 'Unauthorized',
        message: 'Administrator authorization required to provision new user accounts.'
      });
    }

    const assignedRole = role || 'Learner';

    const createRes = await fetch(`${SUPABASE_URL}/auth/v1/admin/users`, {
      method: 'POST',
      headers: {
        'apikey': SERVICE_ROLE_KEY,
        'Authorization': `Bearer ${SERVICE_ROLE_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        email: cleanEmail,
        password,
        email_confirm: true,
        user_metadata: {
          name: name || cleanEmail.split('@')[0],
          student_number: student_number || password,
          role: assignedRole
        }
      })
    });

    const createData = await createRes.json();
    if (!createRes.ok) {
      return res.status(createRes.status).json({ error: createData.msg || 'User creation failed' });
    }

    return res.status(200).json({ status: 'created', user_id: createData.id });
  }

  // 3. If account ALREADY exists -> Confirmation or Password Update
  const isSelf = caller && callerEmail === cleanEmail;

  if (!isAdmin && !isSelf) {
    // Unauthenticated or non-admin caller:
    // We allow confirming existing unconfirmed emails (so registered learners can activate their login),
    // but REJECT any attempt to overwrite passwords.
    if (!existingUser.email_confirmed_at) {
      await fetch(`${SUPABASE_URL}/auth/v1/admin/users/${existingUser.id}`, {
        method: 'PUT',
        headers: {
          'apikey': SERVICE_ROLE_KEY,
          'Authorization': `Bearer ${SERVICE_ROLE_KEY}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ email_confirm: true })
      });
      return res.status(200).json({ status: 'confirmed', user_id: existingUser.id });
    }

    return res.status(403).json({
      error: 'Unauthorized',
      message: 'Admin authorization required to modify existing user credentials.'
    });
  }

  // Authorized Admin or Self-User: Update password and confirm email
  const updateRes = await fetch(`${SUPABASE_URL}/auth/v1/admin/users/${existingUser.id}`, {
    method: 'PUT',
    headers: {
      'apikey': SERVICE_ROLE_KEY,
      'Authorization': `Bearer ${SERVICE_ROLE_KEY}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      email_confirm: true,
      password
    })
  });

  const updateData = await updateRes.json();
  if (!updateRes.ok) {
    return res.status(updateRes.status).json({ error: updateData.msg || 'User credential update failed' });
  }

  return res.status(200).json({ status: 'confirmed', user_id: existingUser.id });
}
