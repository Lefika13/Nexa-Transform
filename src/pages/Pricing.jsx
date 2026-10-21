import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Check, ShieldCheck, Zap, ArrowRight, Building2, HelpCircle } from 'lucide-react';

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
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [billingCycle, setBillingCycle] = useState('annual'); // annual or monthly

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 py-20 px-4 sm:px-6 lg:px-8">
      {/* Header */}
      <div className="max-w-4xl mx-auto text-center mb-16">
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-blue-500/10 text-blue-400 border border-blue-500/20 mb-4">
          <ShieldCheck className="w-4 h-4" /> Nexa LMIS Multi-Tenant Cloud
        </span>
        <h1 className="text-4xl sm:text-5xl font-black text-white tracking-tight mb-4">
          Institutional LMIS Subscriptions
        </h1>
        <p className="text-lg text-slate-400 max-w-2xl mx-auto">
          Scale your training academy, manage SETA-compliant PoE submissions, white-label your brand, and automate learner stipends with Ozow Instant EFT.
        </p>

        {/* Billing Toggle */}
        <div className="flex items-center justify-center gap-4 mt-8">
          <span className={`text-sm font-semibold ${billingCycle === 'monthly' ? 'text-white' : 'text-slate-400'}`}>
            Monthly Billing
          </span>
          <button
            onClick={() => setBillingCycle(billingCycle === 'monthly' ? 'annual' : 'monthly')}
            className="w-14 h-8 bg-slate-800 rounded-full p-1 border border-slate-700 relative transition-all"
          >
            <div
              className={`w-6 h-6 rounded-full bg-blue-500 transition-transform ${
                billingCycle === 'annual' ? 'translate-x-6' : 'translate-x-0'
              }`}
            />
          </button>
          <span className={`text-sm font-semibold flex items-center gap-1.5 ${billingCycle === 'annual' ? 'text-white' : 'text-slate-400'}`}>
            Annual Upfront <span className="text-[10px] bg-emerald-500/20 text-emerald-300 px-2 py-0.5 rounded-full font-bold">SAVE 15%</span>
          </span>
        </div>
      </div>

      {/* Pricing Cards Grid */}
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8 items-stretch">
        {PLANS.map((plan) => (
          <div
            key={plan.id}
            className={`relative rounded-3xl p-8 flex flex-col justify-between transition-all duration-300 ${
              plan.popular
                ? 'bg-slate-900 border-2 border-blue-500 shadow-2xl shadow-blue-500/10 scale-105 z-10'
                : 'bg-slate-900/60 border border-slate-800 hover:border-slate-700'
            }`}
          >
            {plan.popular && (
              <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-gradient-to-r from-blue-600 to-teal-500 text-white text-xs font-black px-4 py-1.5 rounded-full shadow-lg tracking-wider uppercase">
                {plan.badge}
              </div>
            )}

            <div>
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="text-xl font-bold text-white">{plan.name}</h3>
                  <p className="text-xs text-blue-400 font-semibold mt-0.5">{plan.learnersQuota}</p>
                </div>
              </div>

              <div className="mb-6">
                <span className="text-3xl sm:text-4xl font-black text-white">{plan.priceZar}</span>
                <span className="text-xs text-slate-400 block mt-1">{plan.cycle}</span>
              </div>

              <p className="text-xs text-slate-300 leading-relaxed mb-6 pb-6 border-b border-slate-800">
                {plan.description}
              </p>

              {/* Feature List */}
              <div className="space-y-3 mb-8">
                <p className="text-xs font-bold uppercase tracking-wider text-slate-400">Included Capabilities:</p>
                {plan.features.map((feature, idx) => (
                  <div key={idx} className="flex items-start gap-2.5 text-xs text-slate-300">
                    <Check className="w-4 h-4 text-teal-400 shrink-0 mt-0.5" />
                    <span>{feature}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* CTA Button */}
            <a
              href={`/checkout?plan=${plan.id}`}
              className={`w-full py-3.5 px-6 rounded-xl font-bold text-sm text-center flex items-center justify-center gap-2 transition-all ${
                plan.popular
                  ? 'bg-gradient-to-r from-blue-600 to-teal-500 hover:from-blue-500 hover:to-teal-400 text-white shadow-lg shadow-blue-500/25'
                  : 'bg-slate-800 hover:bg-slate-700 text-white border border-slate-700'
              }`}
            >
              {plan.ctaText}
              <ArrowRight className="w-4 h-4" />
            </a>
          </div>
        ))}
      </div>

      {/* Enterprise & Ozow Integration Callout */}
      <div className="max-w-4xl mx-auto mt-20 bg-slate-900 border border-slate-800 rounded-2xl p-8 flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 bg-blue-500/10 border border-blue-500/20 text-blue-400 rounded-xl flex items-center justify-center shrink-0">
            <Building2 className="w-6 h-6" />
          </div>
          <div>
            <h4 className="text-lg font-bold text-white">Need Ozow Instant EFT Billing or Multi-Campus Rollout?</h4>
            <p className="text-xs text-slate-400 mt-1 leading-relaxed">
              We provide automated debit mandate setups, annual Capex invoices for SETA grant drawdowns, and white-glove learner onboarding.
            </p>
          </div>
        </div>
        <a
          href="/contact?topic=enterprise_billing"
          className="whitespace-nowrap px-6 py-3 bg-white text-slate-900 hover:bg-slate-100 font-bold text-sm rounded-xl transition-all"
        >
          Request Institutional Invoice
        </a>
      </div>
    </div>
  );
};

export default Pricing;
