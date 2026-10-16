import { useEffect, useRef } from 'react';
import { supabase } from '../supabaseClient';

export const DEFAULT_INACTIVITY_TIMEOUT_MS = 30 * 60 * 1000; // 30 minutes of inactivity

const KEYS = {
  admin: {
    auth: 'nexa_lmis_admin_auth',
    user: 'nexa_lmis_admin_user',
    activity: 'nexa_lmis_admin_activity'
  },
  lecturer: {
    auth: 'nexa_lmis_lecturer_auth',
    user: 'nexa_lmis_lecturer_email',
    activity: 'nexa_lmis_lecturer_activity'
  },
  learner: {
    auth: 'nexa_lmis_learner_auth',
    user: 'nexa_lmis_learner_email',
    activity: 'nexa_lmis_learner_activity'
  }
};

const getStorage = (type = 'session') => {
  try {
    if (type === 'session') {
      if (typeof window !== 'undefined' && window.sessionStorage) return window.sessionStorage;
      if (typeof globalThis !== 'undefined' && globalThis.sessionStorage) return globalThis.sessionStorage;
      return null;
    }
    if (typeof window !== 'undefined' && window.localStorage) return window.localStorage;
    if (typeof globalThis !== 'undefined' && globalThis.localStorage) return globalThis.localStorage;
  } catch (_) {}
  return null;
};

/**
 * Retrieves the current session for a portal, enforcing inactivity expiration
 * and migrating legacy permanent localStorage keys to secure sessionStorage.
 */
export function getPortalSession(portalType, maxInactivityMs = DEFAULT_INACTIVITY_TIMEOUT_MS) {
  const k = KEYS[portalType];
  if (!k) return { authenticated: false, expired: false, user: null };

  const sess = getStorage('session');
  const loc = getStorage('local');

  // 1. Primary secure check: sessionStorage (scoped to browser tab/window)
  if (sess) {
    const auth = sess.getItem(k.auth);
    const userRaw = sess.getItem(k.user);
    const activity = Number(sess.getItem(k.activity) || 0);

    if (auth === 'true') {
      if (activity > 0 && Date.now() - activity > maxInactivityMs) {
        clearPortalSession(portalType);
        return { authenticated: false, expired: true, user: null };
      }
      // Touch activity timestamp
      sess.setItem(k.activity, String(Date.now()));
      return { authenticated: true, expired: false, user: userRaw };
    }
  }

  // 2. Legacy migration check from localStorage
  if (loc) {
    const auth = loc.getItem(k.auth);
    const userRaw = loc.getItem(k.user);
    const activity = Number(loc.getItem(k.activity) || 0);

    if (auth === 'true') {
      // If legacy key has an expired activity timestamp, kill it immediately
      if (activity > 0 && Date.now() - activity > maxInactivityMs) {
        clearPortalSession(portalType);
        return { authenticated: false, expired: true, user: null };
      }

      // If running in browser with sessionStorage available, migrate it and strip from permanent localStorage!
      if (sess) {
        sess.setItem(k.auth, 'true');
        if (userRaw) sess.setItem(k.user, userRaw);
        sess.setItem(k.activity, String(Date.now()));
        try { loc.removeItem(k.auth); } catch (_) {}
        return { authenticated: true, expired: false, user: userRaw };
      }

      // Test environment fallback (e.g. Vitest SSR mock)
      return { authenticated: true, expired: false, user: userRaw };
    }
  }

  return { authenticated: false, expired: false, user: null };
}

/**
 * Stores a new authenticated session in sessionStorage and touches the activity timestamp.
 * Clears any permanent auth token from localStorage to prevent cross-session leakage on shared machines.
 */
export function setPortalSession(portalType, userPayload) {
  const k = KEYS[portalType];
  if (!k) return;

  const sess = getStorage('session');
  const loc = getStorage('local');
  const now = String(Date.now());
  const userVal = typeof userPayload === 'object' ? JSON.stringify(userPayload) : String(userPayload || '');

  if (sess) {
    sess.setItem(k.auth, 'true');
    sess.setItem(k.user, userVal);
    sess.setItem(k.activity, now);
  }

  // Remove permanent auth flags from localStorage
  if (loc) {
    try {
      loc.removeItem(k.auth);
      // We keep non-sensitive preference keys if needed, but remove permanent auth credentials
      loc.removeItem(k.user);
      loc.removeItem(k.activity);
    } catch (_) {}
  }
}

/**
 * Clears portal session across all storages and terminates Supabase Auth session tokens.
 */
export function clearPortalSession(portalType) {
  const k = KEYS[portalType];
  const sess = getStorage('session');
  const loc = getStorage('local');

  if (k) {
    if (sess) {
      try {
        sess.removeItem(k.auth);
        sess.removeItem(k.user);
        sess.removeItem(k.activity);
      } catch (_) {}
    }
    if (loc) {
      try {
        loc.removeItem(k.auth);
        loc.removeItem(k.user);
        loc.removeItem(k.activity);
      } catch (_) {}
    }
  }

  // Revoke Supabase server token
  try {
    supabase.auth.signOut().catch(() => {});
  } catch (_) {}
}

/**
 * React hook that tracks user activity (clicks, keys, scrolls, touch)
 * and logs out the user when inactive for the specified timeout.
 */
export function useSessionInactivity({
  portalType,
  loggedIn,
  onTimeout,
  timeoutMs = DEFAULT_INACTIVITY_TIMEOUT_MS
}) {
  const lastActiveRef = useRef(Date.now());

  useEffect(() => {
    if (!loggedIn || typeof window === 'undefined') return;

    const k = KEYS[portalType];
    const sess = getStorage('session');

    const recordActivity = () => {
      const now = Date.now();
      // Throttle activity updates to once every 15 seconds to avoid performance overhead
      if (now - lastActiveRef.current > 15000) {
        lastActiveRef.current = now;
        if (sess && k) {
          try {
            sess.setItem(k.activity, String(now));
          } catch (_) {}
        }
      }
    };

    const events = ['mousedown', 'keydown', 'scroll', 'touchstart', 'click'];
    events.forEach(evt => window.addEventListener(evt, recordActivity, { passive: true }));

    // Check for inactivity expiration every 20 seconds
    const interval = setInterval(() => {
      const now = Date.now();
      if (now - lastActiveRef.current >= timeoutMs) {
        clearPortalSession(portalType);
        if (typeof onTimeout === 'function') {
          onTimeout('inactivity');
        } else {
          window.location.href = `/lmis?session_expired=true&portal=${portalType}`;
        }
      }
    }, 20000);

    return () => {
      events.forEach(evt => window.removeEventListener(evt, recordActivity));
      clearInterval(interval);
    };
  }, [loggedIn, portalType, timeoutMs, onTimeout]);
}
