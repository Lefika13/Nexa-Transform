import { describe, it, expect, beforeEach, vi } from 'vitest';

vi.mock('../../supabaseClient', () => ({
  supabase: {
    auth: {
      signOut: vi.fn(() => Promise.resolve({ error: null }))
    }
  }
}));

import {
  DEFAULT_INACTIVITY_TIMEOUT_MS,
  getPortalSession,
  setPortalSession,
  clearPortalSession
} from '../sessionManager';

function createMockStorage() {
  let store = {};
  return {
    getItem: vi.fn((key) => (key in store ? store[key] : null)),
    setItem: vi.fn((key, value) => {
      store[key] = String(value);
    }),
    removeItem: vi.fn((key) => {
      delete store[key];
    }),
    clear: vi.fn(() => {
      store = {};
    }),
    get _store() {
      return store;
    }
  };
}

describe('Session Manager (LMIS Security & Inactivity)', () => {
  let mockSessionStorage;
  let mockLocalStorage;

  beforeEach(() => {
    mockSessionStorage = createMockStorage();
    mockLocalStorage = createMockStorage();

    globalThis.sessionStorage = mockSessionStorage;
    globalThis.localStorage = mockLocalStorage;
    if (typeof window !== 'undefined') {
      window.sessionStorage = mockSessionStorage;
      window.localStorage = mockLocalStorage;
    }
  });

  describe('setPortalSession', () => {
    it('saves user to sessionStorage with activity timestamp and removes permanent localStorage key', () => {
      // Simulate existing legacy credentials in localStorage
      mockLocalStorage.setItem('nexa_lmis_learner_auth', 'true');
      mockLocalStorage.setItem('nexa_lmis_learner_email', 'old@learner.co.za');

      setPortalSession('learner', 'learner@nexa-transform.com');

      // sessionStorage should now have active session
      expect(mockSessionStorage.getItem('nexa_lmis_learner_auth')).toBe('true');
      expect(mockSessionStorage.getItem('nexa_lmis_learner_email')).toBe('learner@nexa-transform.com');
      expect(Number(mockSessionStorage.getItem('nexa_lmis_learner_activity'))).toBeGreaterThan(0);

      // localStorage should be purged of credentials
      expect(mockLocalStorage.getItem('nexa_lmis_learner_auth')).toBeNull();
      expect(mockLocalStorage.getItem('nexa_lmis_learner_email')).toBeNull();
    });

    it('serializes objects properly for admin portal sessions', () => {
      const adminObj = { name: 'Admin Lefika', role: 'Super Admin', email: 'admin@nexa-transform.com' };
      setPortalSession('admin', adminObj);

      expect(mockSessionStorage.getItem('nexa_lmis_admin_auth')).toBe('true');
      const stored = JSON.parse(mockSessionStorage.getItem('nexa_lmis_admin_user'));
      expect(stored.role).toBe('Super Admin');
      expect(stored.email).toBe('admin@nexa-transform.com');
    });
  });

  describe('getPortalSession', () => {
    it('returns authenticated: false when no session is present', () => {
      const sess = getPortalSession('admin');
      expect(sess.authenticated).toBe(false);
      expect(sess.expired).toBe(false);
      expect(sess.user).toBeNull();
    });

    it('returns authenticated: true for an active, recent session in sessionStorage', () => {
      setPortalSession('lecturer', 'dr.smith@nexa-transform.com');

      const sess = getPortalSession('lecturer');
      expect(sess.authenticated).toBe(true);
      expect(sess.expired).toBe(false);
      expect(sess.user).toBe('dr.smith@nexa-transform.com');
    });

    it('automatically expires session and returns expired: true when inactive for > 30 minutes', () => {
      setPortalSession('learner', 'learner@nexa-transform.com');

      // Backdate the activity timestamp by 31 minutes
      const thirtyOneMinutesAgo = Date.now() - (31 * 60 * 1000);
      mockSessionStorage.setItem('nexa_lmis_learner_activity', String(thirtyOneMinutesAgo));

      const sess = getPortalSession('learner');
      expect(sess.authenticated).toBe(false);
      expect(sess.expired).toBe(true);
      expect(sess.user).toBeNull();

      // Session should be wiped after expiration
      expect(mockSessionStorage.getItem('nexa_lmis_learner_auth')).toBeNull();
    });

    it('migrates legacy localStorage sessions to secure sessionStorage and strips localStorage', () => {
      mockLocalStorage.setItem('nexa_lmis_lecturer_auth', 'true');
      mockLocalStorage.setItem('nexa_lmis_lecturer_email', 'faculty@nexa-transform.com');

      const sess = getPortalSession('lecturer');
      expect(sess.authenticated).toBe(true);
      expect(sess.user).toBe('faculty@nexa-transform.com');

      // Migrated to sessionStorage
      expect(mockSessionStorage.getItem('nexa_lmis_lecturer_auth')).toBe('true');
      expect(mockSessionStorage.getItem('nexa_lmis_lecturer_email')).toBe('faculty@nexa-transform.com');

      // Purged from localStorage
      expect(mockLocalStorage.getItem('nexa_lmis_lecturer_auth')).toBeNull();
    });
  });

  describe('clearPortalSession', () => {
    it('clears all session keys from sessionStorage and localStorage', () => {
      setPortalSession('admin', { name: 'Admin' });
      mockLocalStorage.setItem('nexa_lmis_admin_auth', 'true');

      clearPortalSession('admin');

      expect(mockSessionStorage.getItem('nexa_lmis_admin_auth')).toBeNull();
      expect(mockSessionStorage.getItem('nexa_lmis_admin_user')).toBeNull();
      expect(mockSessionStorage.getItem('nexa_lmis_admin_activity')).toBeNull();
      expect(mockLocalStorage.getItem('nexa_lmis_admin_auth')).toBeNull();
    });
  });
});
