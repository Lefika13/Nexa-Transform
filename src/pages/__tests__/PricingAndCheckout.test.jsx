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

    // Verify "Most Popular" and summaries are removed
    expect(html).not.toContain('Most Popular');
    expect(html).not.toContain('featured-ribbon-tag');
    expect(html).not.toContain('Equip your academy or training center to run cohorts digitally');

    // Verify "Get Started" buttons
    expect(html).toContain('Get Started');

    // Verify key capability statements and differentiated tiers
    expect(html).toContain('No learner stipend payouts from LMIS');
    expect(html).toContain('Includes all benefits of Starter, plus:');
    expect(html).toContain('Direct Learner Stipend Payouts via Instant EFT');
    expect(html).toContain('Digital Attendance Tracking &amp; Cohort Registers');
    expect(html).not.toContain('Biometric');
    expect(html).not.toContain('Geo-location');
    expect(html).toContain('Includes all benefits of Growth, plus:');
    expect(html).toContain('Multi-Campus &amp; Multi-Entity Payout Orchestration');
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

  it('guarantees each subscription package implements exact advertised capabilities and quotas', async () => {
    const { PLAN_DEFINITIONS } = await import('../../context/TenantContext');

    // Starter Plan
    expect(PLAN_DEFINITIONS.starter.max_active_learners).toBe(1000);
    expect(PLAN_DEFINITIONS.starter.max_facilitators).toBe(10);
    expect(PLAN_DEFINITIONS.starter.max_admin_seats).toBe(5);
    expect(PLAN_DEFINITIONS.starter.max_seats_per_role).toBe(5);
    expect(PLAN_DEFINITIONS.starter.allow_stipend_payout_api).toBe(false); // No stipend payouts from LMIS
    expect(PLAN_DEFINITIONS.starter.allow_stipend_batch_eft).toBe(true);  // Bank Batch EFT Exporter enabled
    expect(PLAN_DEFINITIONS.starter.allow_custom_domain).toBe(false);

    // Growth Plan
    expect(PLAN_DEFINITIONS.growth.max_active_learners).toBe(1500);
    expect(PLAN_DEFINITIONS.growth.max_facilitators).toBeGreaterThan(100); // Unlimited
    expect(PLAN_DEFINITIONS.growth.max_admin_seats).toBeGreaterThan(100);   // Unlimited
    expect(PLAN_DEFINITIONS.growth.max_seats_per_role).toBeGreaterThan(100);
    expect(PLAN_DEFINITIONS.growth.allow_stipend_payout_api).toBe(true);  // Direct Instant EFT payouts
    expect(PLAN_DEFINITIONS.growth.allow_custom_domain).toBe(true);
    expect(PLAN_DEFINITIONS.growth.allow_seta_poe_exporter).toBe(true);

    // Pro+ Plan
    expect(PLAN_DEFINITIONS.pro_plus.max_active_learners).toBeGreaterThan(1500);
    expect(PLAN_DEFINITIONS.pro_plus.allow_multi_entity).toBe(true);
    expect(PLAN_DEFINITIONS.pro_plus.allow_custom_erp).toBe(true);
  });
});
