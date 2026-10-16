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

import { LmisCalendarSchedule } from '../LmisCalendarSchedule';

describe('LmisCalendarSchedule Edge Cases', () => {
  it('handles null and undefined props cleanly', () => {
    const html = renderToString(
      <LmisCalendarSchedule
        userRole={null}
        userEmail={undefined}
        userName={null}
        allowedCourseCodes={null}
        onNavigateToTab={null}
      />
    );
    expect(html).toBeTruthy();
  });

  it('handles empty strings and special characters', () => {
    const html = renderToString(
      <LmisCalendarSchedule
        userRole=""
        userEmail=""
        userName=""
        allowedCourseCodes={['NONEXISTENT', null, undefined, 123]}
      />
    );
    expect(html).toBeTruthy();
  });
});
