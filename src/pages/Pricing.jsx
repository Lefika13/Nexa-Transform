import React, { useState } from 'react';
import { Check, ShieldCheck, ArrowRight, Building2 } from 'lucide-react';
import './Pricing.css';

const PLANS = [
  {
    id: 'starter',
    name: 'Starter Academy',
    priceZar: 'From R 25,000',
    cycle: 'billed annually or monthly',
    description: 'Empowers emerging academies and boutique SDPs to digitize compliance, eliminate manual paperwork, and scale cohort operations.',
    learnersQuota: 'Less than 1,000 Active Learners',
    benefits: [
      'SETA & QCTO audit-ready Portfolio of Evidence (PoE) tracking',
      'Eliminate stipend fraud with dual Maker-Checker authorization',
      'Automated SA bank batch EFT exporter (Standard Bank, Nedbank, FNB, ABSA)',
      'Custom institutional branding with your academy logo and color identity',
      'Multi-facilitator marking workflows and statutory progress reporting',
      'Dedicated compliance onboarding and rapid rollout assistance'
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
      'Full institutional white-labeling hosted on your own custom web domain',
      'Direct instant stipend disbursements via integrated Ozow Instant EFT API',
      'Biometric and geo-location attendance sync ensuring verifiable grant compliance',
      'Instant one-click batch ZIP archiving for rapid SETA verification visits',
      'Uncapped lecturer, assessor, moderator, and financial management seats',
      'Priority 1-hour SLA account manager and SLA uptime assurance'
    ],
    ctaText: 'Deploy Growth Platform',
    actionCode: 'growth'
  },
  {
    id: 'pro_plus',
    name: 'Pro+ Plan',
    priceZar: 'From R 60,000',
    cycle: 'custom institutional agreement',
    description: 'Enterprise architecture for TVET colleges, universities, and multi-campus learnership consortia requiring tailored integrations.',
    learnersQuota: '1,500+ Active Learners',
    benefits: [
      'Multi-campus, multi-entity centralized academic governance and scaling',
      'Seamless automated ERP & HRIS ledger synchronization (SAP, Sage 300, PeopleSoft)',
      'Dedicated cloud database replica with contractual 99.9% uptime SLA',
      'Custom corporate payout rails and bespoke SETA regulatory telemetry',
      'Native white-label mobile app deployment for staff and learners',
      '24/7 prioritized operational hotline and executive onboarding team'
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

                {/* Key Benefits Checklist */}
                <div className="features-list-heading">Key Institutional Benefits:</div>
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
