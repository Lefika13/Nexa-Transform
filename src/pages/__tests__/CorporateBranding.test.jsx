import { describe, it, expect, vi, beforeEach } from 'vitest';
import React from 'react';
import { renderToString } from 'react-dom/server';
import { MemoryRouter } from 'react-router-dom';

vi.mock('../../supabaseClient', () => ({
  supabase: {
    from: () => ({
      select: () => ({
        eq: () => ({
          maybeSingle: () => Promise.resolve({
            data: {
              id: 'a0000000-0000-0000-0000-000000000001',
              name: 'Apex Academy Test',
              slug: 'apex',
              custom_domain: 'academy.apex.co.za',
              status: 'active',
              is_suspended: false,
              branding_config: {
                primary_color: '#312E81',
                secondary_color: '#0284C7',
                accent_color: '#F97316',
                logo_url: 'https://apex.co.za/logo.png',
                institution_tagline: 'Apex Skills'
              },
              subscription_plans: {
                code: 'pro_plus',
                name: 'Pro Plus Enterprise',
                allow_custom_domain: true
              }
            },
            error: null
          })
        })
      }),
      update: () => ({
        eq: () => Promise.resolve({ data: null, error: null })
      })
    })
  }
}));

import { ThemeProvider } from '../../context/ThemeContext';
import { DataProvider } from '../../context/DataContext';
import { TenantProvider, useTenant } from '../../context/TenantContext';
import { AdminPortal } from '../AdminPortal';
import { LearnerPortal } from '../LearnerPortal';
import { LecturerPortal } from '../LecturerPortal';

describe('Corporate White-Labeling & Branding Engine', () => {
  beforeEach(() => {
    globalThis.localStorage = {
      _store: {
        nexa_lmis_admin_auth: 'true',
        nexa_lmis_admin_role: 'Super Admin',
        nexa_lmis_learner_auth: 'true',
        nexa_lmis_learner_email: 'test@apex.co.za',
        nexa_lmis_lecturer_auth: 'true',
        nexa_lmis_lecturer_email: 'faculty@apex.co.za'
      },
      getItem: function (k) { return this._store[k] || null; },
      setItem: function (k, v) { this._store[k] = String(v); },
      removeItem: function (k) { delete this._store[k]; }
    };
  });

  it('renders Corporate Branding tab in AdminPortal without crashing', () => {
    globalThis.window = {
      location: {
        search: '?tab=branding',
        href: 'https://nexa-transform.com/lmis/admin?tab=branding',
        hostname: 'nexa-transform.com'
      }
    };

    const html = renderToString(
      <MemoryRouter initialEntries={['/lmis/admin?tab=branding']}>
        <ThemeProvider>
          <DataProvider>
            <TenantProvider>
              <AdminPortal />
            </TenantProvider>
          </DataProvider>
        </ThemeProvider>
      </MemoryRouter>
    );

    expect(html).toBeTruthy();
    expect(html).toContain('Corporate White-Labeling &amp; Brand Identity');
    expect(html).toContain('Corporate Palette Presets');
    expect(html).toContain('Live Portal Theme Preview');
    expect(html).toContain('Dynamic Portal Theme Tokens');
    expect(html).toContain('Custom Vanity Domain');
  });

  it('renders customized tenant branding in LearnerPortal header and login', () => {
    globalThis.window = {
      location: {
        search: '?tab=overview',
        href: 'https://nexa-transform.com/lmis/learner',
        hostname: 'nexa-transform.com'
      }
    };

    const html = renderToString(
      <MemoryRouter initialEntries={['/lmis/learner']}>
        <ThemeProvider>
          <DataProvider>
            <TenantProvider>
              <LearnerPortal />
            </TenantProvider>
          </DataProvider>
        </ThemeProvider>
      </MemoryRouter>
    );

    expect(html).toBeTruthy();
    expect(html).toContain('lmis-header');
    expect(html).toContain('LMIS');
  });

  it('renders customized tenant branding in LecturerPortal header', () => {
    globalThis.window = {
      location: {
        search: '?tab=overview',
        href: 'https://nexa-transform.com/lmis/lecturer',
        hostname: 'nexa-transform.com'
      }
    };

    const html = renderToString(
      <MemoryRouter initialEntries={['/lmis/lecturer']}>
        <ThemeProvider>
          <DataProvider>
            <TenantProvider>
              <LecturerPortal />
            </TenantProvider>
          </DataProvider>
        </ThemeProvider>
      </MemoryRouter>
    );

    expect(html).toBeTruthy();
    expect(html).toContain('lmis-header');
  });
});
