import React, { useState } from 'react';
import { Check, ShieldCheck, ArrowRight, Building2 } from 'lucide-react';
import './Pricing.css';

const PLANS = [
  {
    id: 'starter',
    name: 'Starter Academy',
    priceZar: 'From R 25,000',
    cycle: 'billed annually or monthly',
    learnersQuota: 'Less than 1,000 Active Learners',
    benefits: [
      { text: 'Digital Cohort & Curriculum Management' },
      { text: 'Automated SETA & QCTO Audit-Ready PoE Generation' },
      { text: 'Multi-Facilitator Marking & Assessment Rubrics' },
      { text: 'Institutional Logo & Academy Color Theming' },
      { text: 'Academic Transcripts & Registration PDFs' },
      { text: 'No learner stipend payouts from LMIS (requires Growth)', isNegative: true }
    ],
    ctaText: 'Get Started'
  },
  {
    id: 'growth',
    name: 'Growth Provider',
    priceZar: 'From R 45,000',
    cycle: 'billed annually or monthly',
    learnersQuota: '1,000+ to 1,500 Active Learners',
    benefits: [
      { text: 'Includes all benefits of Starter, plus:', isIncludedHeader: true },
      { text: 'Direct Learner Stipend Payouts via Instant EFT' },
      { text: 'Custom Domain & Full White-Label Branding' },
      { text: 'Biometric & Geo-location Attendance Verification' },
      { text: '1-Click Batch SETA PoE Evidence ZIP Archive Exporter' },
      { text: 'Unlimited Facilitators, Assessors & Moderators' },
      { text: 'Priority 1-Hour SLA & Dedicated Account Manager' }
    ],
    ctaText: 'Get Started'
  },
  {
    id: 'pro_plus',
    name: 'Pro+ Plan',
    priceZar: 'From R 60,000',
    cycle: 'custom institutional agreement',
    learnersQuota: '1,500+ Active Learners',
    benefits: [
      { text: 'Includes all benefits of Growth, plus:', isIncludedHeader: true },
      { text: 'Multi-Campus & Multi-Entity Payout Orchestration' },
      { text: 'Custom ERP Integration (SAP, Sage 300, PeopleSoft)' },
      { text: 'Isolated Cloud Infrastructure with 99.9% Uptime SLA' },
      { text: 'Real-Time Statutory Regulatory Telemetry Stream' },
      { text: '24/7 Dedicated Executive Engineering Hotline' }
    ],
    ctaText: 'Get Started'
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
                </div>

                {/* Key Capabilities Checklist */}
                <ul className="box-features-list" style={{ marginTop: '1.25rem' }}>
                  {plan.benefits.map((benefit, idx) => {
                    if (benefit.isIncludedHeader) {
                      return (
                        <li key={idx} className="feature-check-item included-header-item" style={{ paddingBottom: '0.35rem', borderBottom: '1px solid rgba(56, 189, 248, 0.2)', marginBottom: '0.35rem' }}>
                          <span style={{ fontWeight: 800, color: '#38BDF8', fontSize: '0.84rem', letterSpacing: '0.01em' }}>
                            {benefit.text}
                          </span>
                        </li>
                      );
                    }
                    if (benefit.isNegative) {
                      return (
                        <li key={idx} className="feature-check-item negative-item" style={{ color: '#94A3B8' }}>
                          <span style={{ color: '#F87171', fontWeight: 900, width: '16px', display: 'inline-block', textAlign: 'center', flexShrink: 0, marginTop: '1px' }}>✕</span>
                          <span style={{ fontStyle: 'italic', color: '#94A3B8' }}>{benefit.text}</span>
                        </li>
                      );
                    }
                    return (
                      <li key={idx} className="feature-check-item">
                        <Check className="feature-check-icon" />
                        <span>{benefit.text}</span>
                      </li>
                    );
                  })}
                </ul>
              </div>

              {/* Action Button */}
              <a
                href={`/checkout?plan=${plan.id}`}
                className="plan-action-btn primary-btn"
              >
                <span>Get Started</span>
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
