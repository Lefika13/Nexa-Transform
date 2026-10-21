import React from 'react';
import { describe, it, expect } from 'vitest';
import { renderToString } from 'react-dom/server';
import { MemoryRouter } from 'react-router-dom';
import { Pricing } from '../Pricing';
import { Checkout } from '../Checkout';

describe('SaaS Pricing and Checkout Pages', () => {
  it('renders Pricing page with Starter, Growth, and Pro+ tiers highlighting benefits without Most Popular tag', () => {
    const html = renderToString(
      <MemoryRouter>
        <Pricing />
      </MemoryRouter>
    );

    // Verify plans and prices
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

    // Verify "Most Popular" is removed
    expect(html).not.toContain('Most Popular');
    expect(html).not.toContain('featured-ribbon-tag');

    // Verify capabilities heading and key capability statements
    expect(html).toContain('What you can do directly from the LMIS:');
    expect(html).toContain('Disburse monthly stipends to learners directly from the LMIS');
    expect(html).toContain('Pay stipends instantly to learner bank accounts directly from the LMIS via integrated Ozow Instant EFT rails');
    expect(html).toContain('Orchestrate multi-campus and multi-entity stipend payouts');
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
