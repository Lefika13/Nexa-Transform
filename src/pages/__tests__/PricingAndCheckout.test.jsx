import React from 'react';
import { describe, it, expect } from 'vitest';
import { renderToString } from 'react-dom/server';
import { MemoryRouter } from 'react-router-dom';
import { Pricing } from '../Pricing';
import { Checkout } from '../Checkout';

describe('SaaS Pricing and Checkout Pages', () => {
  it('renders Pricing page with Starter, Growth, and Pro+ tiers', () => {
    const html = renderToString(
      <MemoryRouter>
        <Pricing />
      </MemoryRouter>
    );

    expect(html).toContain('Institutional LMIS Subscriptions');
    expect(html).toContain('Starter Academy');
    expect(html).toContain('Growth Provider');
    expect(html).toContain('Pro+ Plan');
    expect(html).toContain('From R 25,000');
    expect(html).toContain('From R 45,000');
    expect(html).toContain('From R 60,000');
    expect(html).toContain('Less than 1,000 Active Learners');
    expect(html).toContain('1,000+ to 1,500 Active Learners');
    expect(html).toContain('1,500+ Active Learners');
  });

  it('renders Checkout page with plan information and form fields', () => {
    const html = renderToString(
      <MemoryRouter initialEntries={['/checkout?plan=growth']}>
        <Checkout />
      </MemoryRouter>
    );

    expect(html).toContain('Growth Provider');
    expect(html).toContain('Institution Details');
    expect(html).toContain('Preferred Subdomain URL');
    expect(html).toContain('Ozow Instant EFT');
  });
});
