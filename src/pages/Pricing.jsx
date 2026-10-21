import React, { useState } from 'react';
import { Check, ShieldCheck, ArrowRight, Building2 } from 'lucide-react';
import './Pricing.css';

const PLANS = [
  {
    id: 'starter',
    name: 'Starter Academy',
    priceZar: 'From R 25,000',
    cycle: 'billed annually or monthly',
    description: 'Equip your academy or training center to run cohorts digitally, track compliance, and manage stipend operations without spreadsheets.',
    learnersQuota: 'Less than 1,000 Active Learners',
    benefits: [
      'Disburse monthly stipends to learners directly from the LMIS using automated bank batch EFT files (Standard Bank, FNB, Nedbank, ABSA)',
      'Prevent payment fraud and accidental double-payouts with dual Maker-Checker disbursement authorizations',
      'Track learner progress and compile SETA & QCTO audit-ready digital Portfolios of Evidence (PoE) automatically',
      'Brand your portal with your academy’s logo, colors, and institutional identity across web and student portals',
      'Assign multi-facilitator marking workflows with automated grading rubrics and statutory progress registers',
      'Onboard your academic team quickly with guided compliance setup and student data migration'
    ],
    ctaText: 'Get Started with Starter',
    actionCode: 'starter'
  },
  {
    id: 'growth',
    name: 'Growth Provider',
    priceZar: 'From R 45,000',
    cycle: 'billed annually or monthly',
    description: 'Designed for accredited institutions scaling high-volume learnerships with full corporate white-labeling and direct payout rails.',
    learnersQuota: '1,000+ to 1,500 Active Learners',
    benefits: [
      'Pay stipends instantly to learner bank accounts directly from the LMIS via integrated Ozow Instant EFT rails',
      'Host the entire platform under your own custom domain (e.g., learn.yourfirm.co.za) with complete white-label branding',
      'Verify classroom and workplace attendance using biometric check-ins and geo-location before releasing stipends',
      'Export complete statutory SETA PoE evidence archives in one-click batch ZIP packs for site verification visits',
      'Empower unlimited assessors, moderators, lecturers, and finance staff with role-based governance access',
      'Resolve issues rapidly with guaranteed 1-hour priority SLA response and dedicated account management'
    ],
    ctaText: 'Deploy Growth Platform',
    actionCode: 'growth'
  },
  {
    id: 'pro_plus',
    name: 'Pro+ Plan',
    priceZar: 'From R 60,000',
    cycle: 'custom institutional agreement',
    description: 'Enterprise architecture for TVET colleges, universities, and consortia requiring ERP integration and high concurrency.',
    learnersQuota: '1,500+ Active Learners',
    benefits: [
      'Orchestrate multi-campus and multi-entity stipend payouts and academic operations across multiple commercial banks',
      'Sync student records, fee billing, and stipend ledgers automatically with your enterprise ERP (SAP, Sage 300, PeopleSoft)',
      'Roll out custom white-labeled native mobile apps on iOS and Android for offline coursework and assessor grading',
      'Run on isolated dedicated cloud database infrastructure with contractual 99.9% uptime SLA',
      'Stream real-time statutory regulatory telemetry to external verification portals and corporate grant funders',
      'Rely on a dedicated 24/7 technical hotline and executive implementation engineering team'
    ],
    ctaText: 'Speak to Enterprise Sales',
    actionCode: 'pro_plus'
  }
];

export const Pricing = () => {
  const [billingCycle, setBillingCycle] = useState('annual'); // annual or monthly

  return (
    <div className="pricing-page-root">
      <div className="pricing-container">
        {/* Header */}
        <div className="pricing-header-wrap">
          <div className="pricing-pill-badge">
            <ShieldCheck style={{ width: 16, height: 16 }} /> Nexa LMIS Multi-Tenant Cloud
          </div>
          <h1 className="pricing-main-title">
            Institutional LMIS Subscriptions
          </h1>
          <p className="pricing-subtitle">
            Scale your training academy, manage SETA-compliant PoE submissions, white-label your brand, and automate learner stipends with Ozow Instant EFT.
          </p>

          {/* Billing Toggle */}
          <div className="billing-toggle-container">
            <span
              onClick={() => setBillingCycle('monthly')}
              className={`billing-cycle-label ${billingCycle === 'monthly' ? 'active' : ''}`}
            >
              Monthly Billing
            </span>
            <button
              type="button"
              onClick={() => setBillingCycle(billingCycle === 'monthly' ? 'annual' : 'monthly')}
              className="toggle-switch-btn"
              aria-label="Toggle Billing Cycle"
            >
              <div className={`toggle-slider-knob ${billingCycle === 'annual' ? 'annual' : ''}`} />
            </button>
            <span
              onClick={() => setBillingCycle('annual')}
              className={`billing-cycle-label ${billingCycle === 'annual' ? 'active' : ''}`}
            >
              Annual Upfront
            </span>
            <span className="save-discount-chip">SAVE 15%</span>
          </div>
        </div>

        {/* Blocked Boxes Grid - Side-by-Side peer boxes */}
        <div className="pricing-boxes-grid">
          {PLANS.map((plan) => (
            <div
              key={plan.id}
              className="pricing-box-card"
            >
              <div>
                <div className="box-header-area">
                  <div className="plan-title-row">
                    <h3 className="plan-card-name">{plan.name}</h3>
                  </div>
                  <div>
                    <span className="plan-learners-badge">{plan.learnersQuota}</span>
                  </div>

                  <div className="plan-price-area">
                    <span className="price-main-amount">{plan.priceZar}</span>
                    <span className="price-cycle-text">{plan.cycle}</span>
                  </div>

                  <p className="plan-short-desc">
                    {plan.description}
                  </p>
                </div>

                {/* Key Capabilities Checklist */}
                <div className="features-list-heading">What you can do directly from the LMIS:</div>
                <ul className="box-features-list">
                  {plan.benefits.map((benefit, idx) => (
                    <li key={idx} className="feature-check-item">
                      <Check className="feature-check-icon" />
                      <span>{benefit}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Action Button */}
              <a
                href={`/checkout?plan=${plan.id}`}
                className="plan-action-btn primary-btn"
              >
                <span>{plan.ctaText}</span>
                <ArrowRight style={{ width: 16, height: 16 }} />
              </a>
            </div>
          ))}
        </div>

        {/* Enterprise & Custom Rails Banner */}
        <div className="pricing-enterprise-banner">
          <div className="enterprise-banner-left">
            <div className="enterprise-icon-box">
              <Building2 style={{ width: 26, height: 26 }} />
            </div>
            <div>
              <h4 className="enterprise-banner-title">Need Ozow Instant EFT Billing or Multi-Campus Rollout?</h4>
              <p className="enterprise-banner-desc">
                We provide automated debit mandate setups, annual Capex invoices for SETA grant drawdowns, and white-glove learner onboarding.
              </p>
            </div>
          </div>
          <a
            href="/contact?topic=enterprise_billing"
            className="enterprise-banner-btn"
          >
            Request Institutional Invoice
          </a>
        </div>
      </div>
    </div>
  );
};

export default Pricing;
