import React, { useState } from 'react';
import { Check, ShieldCheck, ArrowRight, Building2 } from 'lucide-react';
import './Pricing.css';

const PLANS = [
  {
    id: 'starter',
    name: 'Starter Academy',
    badge: 'Emerging Providers',
    priceZar: 'From R 25,000',
    cycle: 'billed annually or monthly',
    description: 'Perfect for accredited boutique academies and independent SDPs scaling their initial cohorts.',
    learnersQuota: 'Less than 1,000 Active Learners',
    features: [
      'Less than 1,000 Active Learners',
      'Up to 10 Facilitator / Lecturer Accounts',
      '3 Administrative & Finance Seats',
      '50 GB High-Resolution PoE Cloud Storage',
      'SA Bank Batch EFT Exporter (Standard Bank, Nedbank, FNB, ABSA)',
      'Maker-Checker Dual Authorization on Stipends',
      'Institutional Branding (Logo & Brand Colors)',
      'SETA / QCTO Compliance & Audit Exporters',
      'Priority WhatsApp & Email Support (4h SLA)'
    ],
    popular: false,
    ctaText: 'Get Started with Starter',
    actionCode: 'starter'
  },
  {
    id: 'growth',
    name: 'Growth Provider',
    badge: 'Most Popular',
    priceZar: 'From R 45,000',
    cycle: 'billed annually or monthly',
    description: 'Built for high-volume accredited colleges running national learnership programs with complete corporate white-labeling.',
    learnersQuota: '1,000+ to 1,500 Active Learners',
    features: [
      '1,000+ to 1,500 Active Learners Included',
      'Unlimited Facilitator & Lecturer Seats',
      'Unlimited Administrative & Finance Seats',
      '500 GB PoE & Submission Storage',
      'Full White-Label Portal & Custom Domain (e.g. academy.yourfirm.co.za)',
      'Automated Direct Payout API Integration (Ozow / Stitch)',
      'Biometric & Geo-location Attendance Sync',
      'Maker-Checker Dual Approval + Fraud Audits',
      'SETA PoE Instant ZIP Archive Exporter',
      'Dedicated Account Manager (1h SLA Response)'
    ],
    popular: true,
    ctaText: 'Deploy Growth Platform',
    actionCode: 'growth'
  },
  {
    id: 'pro_plus',
    name: 'Pro+ Plan',
    badge: 'Enterprise & TVET',
    priceZar: 'From R 60,000',
    cycle: 'custom institutional agreement',
    description: 'Comprehensive enterprise deployment for TVET colleges, universities, and multi-campus corporate learnership consortia.',
    learnersQuota: '1,500+ Active Learners',
    features: [
      '1,500+ Active Learners (Custom Scaling)',
      'Multi-Campus & Multi-Entity Departmental Control',
      'Multi-Bank Corporate Payout Rails & Open Banking',
      'Dedicated Cloud Database Replica / 1 TB+ Storage',
      'Custom ERP & HRIS Ledger Sync (SAP, Sage 300, PeopleSoft)',
      'Bespoke SETA Regulatory BI & Telemetry',
      'Full Native Mobile App White-Label Option',
      'Contractual 99.9% Uptime SLA',
      '24/7 Dedicated Ops Hotline & Executive Onboarding'
    ],
    popular: false,
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

        {/* Blocked Boxes Grid - Side-by-Side next to one another */}
        <div className="pricing-boxes-grid">
          {PLANS.map((plan) => (
            <div
              key={plan.id}
              className={`pricing-box-card ${plan.popular ? 'featured-box' : ''}`}
            >
              {plan.popular && (
                <div className="featured-ribbon-tag">
                  {plan.badge}
                </div>
              )}

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

                {/* Features Checklist */}
                <div className="features-list-heading">Included Capabilities:</div>
                <ul className="box-features-list">
                  {plan.features.map((feature, idx) => (
                    <li key={idx} className="feature-check-item">
                      <Check className="feature-check-icon" />
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Action Button */}
              <a
                href={`/checkout?plan=${plan.id}`}
                className={`plan-action-btn ${plan.popular ? 'primary-btn' : 'secondary-btn'}`}
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
