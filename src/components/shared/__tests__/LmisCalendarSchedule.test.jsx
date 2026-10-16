import { describe, it, expect, vi } from 'vitest';
import React from 'react';
import { renderToString } from 'react-dom/server';

vi.mock('../../../supabaseClient', () => ({
  supabase: {
    from: () => ({
      select: () => Promise.resolve({ data: [], error: null })
    })
  }
}));

import { DataProvider } from '../../../context/DataContext';
import { LmisCalendarSchedule } from '../LmisCalendarSchedule';

describe('LmisCalendarSchedule Component', () => {
  it('renders without crashing for Admin', () => {
    const html = renderToString(
      <DataProvider>
        <LmisCalendarSchedule
          userRole="Admin"
          userEmail="lefika6613@gmail.com"
          userName="Mr. Lefika Molefe"
        />
      </DataProvider>
    );
    expect(html).toContain('Class Timetable');
    expect(html).toContain('Organizational Development');
    expect(html).toContain('Mr. Lefika Molefe');
  });

  it('renders without crashing for Learner with myCodes', () => {
    const html = renderToString(
      <DataProvider>
        <LmisCalendarSchedule
          userRole="Learner"
          userEmail="lfk6613@gmail.com"
          userName="Learner User"
          allowedCourseCodes={['OD']}
        />
      </DataProvider>
    );
    expect(html).toContain('Class Timetable');
  });

  it('renders without crashing for Lecturer', () => {
    const html = renderToString(
      <DataProvider>
        <LmisCalendarSchedule
          userRole="Lecturer"
          userEmail="lfk6613@gmail.com"
          userName="Mr. Lefika Molefe"
          allowedCourseCodes={['OD']}
        />
      </DataProvider>
    );
    expect(html).toContain('Class Timetable');
  });
});
