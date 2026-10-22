import React from 'react';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { renderToString } from 'react-dom/server';
import { MemoryRouter } from 'react-router-dom';
import { PlatformAdmin } from '../PlatformAdmin';

vi.mock('../../supabaseClient', () => ({
  supabase: {
    from: () => ({
      select: () => Promise.resolve({ data: [], error: null, count: 0 }),
      update: () => ({
        eq: () => Promise.resolve({ data: null, error: null })
      })
    })
  }
}));

describe('Nexa Multi-Tenant Platform Admin Console', () => {
  beforeEach(() => {
    // Clear mock storage
    if (typeof localStorage !== 'undefined') {
      localStorage.clear();
    }
  });

  it('renders SaaS Control Tower with MRR, Active Institutions, and Master Kill-Switch', () => {
    const html = renderToString(
      <MemoryRouter>
        <PlatformAdmin />
      </MemoryRouter>
    );

    // Header & Badges
    expect(html).toContain('Nexa Transform SaaS Control Tower');
    expect(html).toContain('Postgres RLS Active');

    // KPI Metrics
    expect(html).toContain('Monthly Recurring Revenue');
    expect(html).toContain('Active Institutions');
    expect(html).toContain('Total Active Learners');
    expect(html).toContain('Stipend Clearing Volume');

    // Multi-tenant Directory
    expect(html).toContain('Institutional Tenant Directory');
    expect(html).toContain('No External Commercial Subscribers Yet');

    // Master Kill-Switch
    expect(html).toContain('Kill-Switch');
  });
});
