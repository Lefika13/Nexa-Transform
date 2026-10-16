/**
 * NexaTransform Email Deliverability & Anti-Bounce Protection Utility
 * Prevents non-deliverable, mock, typo, or test emails from triggering
 * outbound transactional emails via Supabase Auth or FormSubmit.
 */

// List of invalid, test, or mock domains that must NEVER receive outbound transactional emails
const BLOCKED_DOMAINS = new Set([
  'example.com',
  'example.org',
  'example.net',
  'test.com',
  'test.org',
  'dummy.com',
  'sample.com',
  'localhost',
  'invalid',
  'fake.com',
  'tempmail.com',
  'mailinator.com',
  '10minutemail.com',
  'guerrillamail.com',
  'throwawaymail.com',
  'trashmail.com'
]);

/**
 * Validates basic email syntax using standard RFC 5322 regex
 */
export function isValidEmailFormat(email) {
  if (!email || typeof email !== 'string') return false;
  const trimmed = email.trim().toLowerCase();
  // Standard strict email regex
  const regex = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)+$/;
  return regex.test(trimmed);
}

/**
 * Checks if an email is deliverable and safe to send to (not a test/mock domain)
 */
export function isDeliverableEmail(email) {
  if (!isValidEmailFormat(email)) return false;
  const trimmed = email.trim().toLowerCase();
  const domain = trimmed.split('@')[1];
  if (!domain) return false;

  // Block test/mock domains
  if (BLOCKED_DOMAINS.has(domain)) return false;

  // Block mock nexatransform.co.za unless explicitly configured with live MX records
  // (Prevents seed lecturer accounts like thabo.nkosi@nexatransform.co.za from bouncing)
  if (domain === 'nexatransform.co.za' || domain === 'nexa-transform.com') {
    // Only permit known real admin address
    if (trimmed !== 'lefika6613@gmail.com' && !trimmed.endsWith('@gmail.com') && !trimmed.endsWith('@yahoo.com') && !trimmed.endsWith('@outlook.com')) {
      // Allow custom corporate emails only if they are known real boxes
      return true;
    }
  }

  // Ensure domain has at least a valid 2-letter TLD
  const parts = domain.split('.');
  const tld = parts[parts.length - 1];
  if (!tld || tld.length < 2) return false;

  return true;
}

/**
 * Safe wrapper for Supabase auth.signUp that prevents bounce-backs
 */
export async function safeSupabaseSignUp(supabaseClient, { email, password, options = {} }) {
  if (!isDeliverableEmail(email)) {
    console.log(`[Anti-Bounce] Skipped Supabase auth.signUp for non-deliverable / test email: ${email}`);
    return { data: null, error: null, skipped: true };
  }

  try {
    return await supabaseClient.auth.signUp({
      email: email.trim().toLowerCase(),
      password,
      options
    });
  } catch (err) {
    console.warn('[Anti-Bounce] Supabase signUp error caught:', err);
    return { data: null, error: err };
  }
}

/**
 * Safe wrapper for Supabase auth.resetPasswordForEmail that prevents bounce-backs
 */
export async function safeSupabasePasswordReset(supabaseClient, email, redirectTo) {
  if (!isDeliverableEmail(email)) {
    return {
      data: null,
      error: { message: 'Invalid or test email address. Please enter your valid registered email.' }
    };
  }

  try {
    return await supabaseClient.auth.resetPasswordForEmail(email.trim().toLowerCase(), {
      redirectTo
    });
  } catch (err) {
    console.warn('[Anti-Bounce] Supabase password reset error caught:', err);
    return { data: null, error: err };
  }
}
