import { describe, it, expect, vi } from 'vitest';
import React from 'react';
import { renderToString } from 'react-dom/server';
import { MemoryRouter } from 'react-router-dom';

vi.mock('../../../supabaseClient', () => ({
  supabase: {
    from: () => ({
      select: () => Promise.resolve({ data: [], error: null })
    })
  }
}));

import { ThemeProvider } from '../../../context/ThemeContext';
import { DataProvider } from '../../../context/DataContext';
import { AdminPortal } from '../../../pages/AdminPortal';
import { LearnerPortal } from '../../../pages/LearnerPortal';
import { LecturerPortal } from '../../../pages/LecturerPortal';

describe('Portals with Calendar Tab', () => {
  it('LearnerPortal renders with activeTab calendar without crashing', () => {
    globalThis.localStorage = {
      getItem: (k) => {
        if (k === 'nexa_lmis_learner_auth') return 'true';
        if (k === 'nexa_lmis_learner_email') return 'lfk6613@gmail.com';
        return null;
      },
      setItem: () => {},
      removeItem: () => {}
    };

    globalThis.window = {
      location: {
        search: '?tab=calendar',
        href: 'https://nexa-transform.com/lmis/learner?tab=calendar'
      }
    };

    const html = renderToString(
      <MemoryRouter initialEntries={['/lmis/learner?tab=calendar']}>
        <ThemeProvider>
          <DataProvider>
            <LearnerPortal />
          </DataProvider>
        </ThemeProvider>
      </MemoryRouter>
    );
    expect(html).toBeTruthy();
    expect(html).toContain('Academic Calendar &amp; Class Timetable');
  });

  it('LecturerPortal renders with activeTab calendar without crashing', () => {
    globalThis.localStorage = {
      getItem: (k) => {
        if (k === 'nexa_lmis_lecturer_auth') return 'true';
        if (k === 'nexa_lmis_lecturer_email') return 'lfk6613@gmail.com';
        return null;
      },
      setItem: () => {},
      removeItem: () => {}
    };

    globalThis.window = {
      location: {
        search: '?tab=calendar',
        href: 'https://nexa-transform.com/lmis/lecturer?tab=calendar'
      }
    };

    const html = renderToString(
      <MemoryRouter initialEntries={['/lmis/lecturer?tab=calendar']}>
        <ThemeProvider>
          <DataProvider>
            <LecturerPortal />
          </DataProvider>
        </ThemeProvider>
      </MemoryRouter>
    );
    expect(html).toBeTruthy();
    expect(html).toContain('Faculty Academic Calendar &amp; Class Timetable');
  });

  it('AdminPortal renders with activeTab calendar without crashing', () => {
    globalThis.localStorage = {
      getItem: (k) => {
        if (k === 'nexa_lmis_admin_auth') return 'true';
        if (k === 'nexa_lmis_admin_role') return 'Super Admin';
        return null;
      },
      setItem: () => {},
      removeItem: () => {}
    };

    globalThis.window = {
      location: {
        search: '?tab=calendar',
        href: 'https://nexa-transform.com/lmis/admin?tab=calendar'
      }
    };

    const html = renderToString(
      <MemoryRouter initialEntries={['/lmis/admin?tab=calendar']}>
        <ThemeProvider>
          <DataProvider>
            <AdminPortal />
          </DataProvider>
        </ThemeProvider>
      </MemoryRouter>
    );
    expect(html).toBeTruthy();
    expect(html).toContain('Institutional Calendar &amp; Class Timetable');
  });
});
