import React, { useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { ShieldCheck, CheckCircle2, Lock, ArrowRight, Loader2, Building, Mail, User, Phone } from 'lucide-react';

const PLAN_INFO = {
  starter: {
    name: 'Starter Academy',
    monthlyPrice: 25000,
    learners: 'Less than 1,000 Active Learners',
    description: 'Perfect for accredited boutique academies and independent SDPs scaling their initial cohorts.'
  },
  growth: {
    name: 'Growth Provider',
    monthlyPrice: 45000,
    learners: '1,000+ to 1,500 Active Learners',
    description: 'Full white-label portal, custom domain, and automated Ozow/Stitch direct payout API integration.'
  },
  pro_plus: {
    name: 'Pro+ Plan',
    monthlyPrice: 60000,
    learners: '1,500+ Active Learners',
    description: 'Enterprise deployment for multi-campus TVETs and corporate learnership consortia.'
  }
};

export const Checkout = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const planCode = searchParams.get('plan') || 'growth';
  const plan = PLAN_INFO[planCode] || PLAN_INFO.growth;

  const [billingCycle, setBillingCycle] = useState('annual'); // annual or monthly
  const [formData, setFormData] = useState({
    academyName: '',
    subdomainSlug: '',
    adminName: '',
    adminEmail: '',
    contactPhone: ''
  });

  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState(null);

  // Auto-slugify academy name
  const handleAcademyNameChange = (e) => {
    const name = e.target.value;
    const slug = name
      .toLowerCase()
      .replace(/[^a-z0-9]/g, '-')
      .replace(/-+/g, '-')
      .replace(/^-|-$/g, '');

    setFormData(prev => ({
      ...prev,
      academyName: name,
      subdomainSlug: prev.subdomainSlug === '' || prev.subdomainSlug === formData.subdomainSlug ? slug : prev.subdomainSlug
    }));
  };

  const calculateTotal = () => {
    if (billingCycle === 'annual') {
      return (plan.monthlyPrice * 12 * 0.85); // 15% discount
    }
    return plan.monthlyPrice;
  };

  const handleCheckout = async (e) => {
    e.preventDefault();
    setErrorMessage(null);
    setLoading(true);

    try {
      const response = await fetch('/api/ozow-create-payment', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          planCode,
          billingCycle,
          academyName: formData.academyName,
          subdomainSlug: formData.subdomainSlug,
          adminEmail: formData.adminEmail,
          adminName: formData.adminName,
          contactPhone: formData.contactPhone
        })
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.error || 'Failed to initialize payment.');
      }

      // Generate a hidden form and POST to Ozow's Secure Instant EFT Gateway
      const form = document.createElement('form');
      form.method = 'POST';
      form.action = data.paymentEndpoint;

      Object.entries(data.paymentData).forEach(([key, value]) => {
        const input = document.createElement('input');
        input.type = 'hidden';
        input.name = key;
        input.value = value;
        form.appendChild(input);
      });

      document.body.appendChild(form);
      form.submit();
    } catch (err) {
      console.error('Checkout error:', err);
      setErrorMessage(err.message || 'Payment initiation failed. Please check details.');
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 py-16 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-blue-500/10 text-blue-400 border border-blue-500/20 mb-3">
            <ShieldCheck className="w-4 h-4" /> Ozow Instant EFT Verified Checkout
          </span>
          <h1 className="text-3xl sm:text-4xl font-black text-white">
            Provision Your Academy Portal
          </h1>
          <p className="text-slate-400 text-sm mt-2">
            Instant EFT with ABSA, Capitec, FNB, Nedbank, Standard Bank, Investec & TymeBank.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-start">
          {/* Form */}
          <div className="md:col-span-2 bg-slate-900 border border-slate-800 rounded-3xl p-8">
            <h2 className="text-lg font-bold text-white mb-6 flex items-center gap-2">
              <Building className="w-5 h-5 text-blue-400" /> Institution Details
            </h2>

            {errorMessage && (
              <div className="mb-6 p-4 rounded-xl bg-red-950/50 border border-red-800 text-red-300 text-xs">
                {errorMessage}
              </div>
            )}

            <form onSubmit={handleCheckout} className="space-y-5">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Academy / Institution Name *
                </label>
                <div className="relative">
                  <input
                    type="text"
                    required
                    value={formData.academyName}
                    onChange={handleAcademyNameChange}
                    placeholder="e.g. Apex Training Institute"
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-blue-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Preferred Subdomain URL *
                </label>
                <div className="flex items-center">
                  <input
                    type="text"
                    required
                    value={formData.subdomainSlug}
                    onChange={(e) => setFormData({ ...formData, subdomainSlug: e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, '') })}
                    placeholder="apex-institute"
                    className="flex-1 bg-slate-950 border border-slate-800 rounded-l-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-blue-500"
                  />
                  <span className="bg-slate-800 text-slate-400 text-xs px-3.5 py-3.5 rounded-r-xl border border-l-0 border-slate-800 font-mono">
                    .nexa-transform.com
                  </span>
                </div>
                <p className="text-[11px] text-slate-500 mt-1">
                  You can bind your own custom domain (e.g. learn.apex.co.za) anytime in your academy settings.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                    Super Admin Full Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.adminName}
                    onChange={(e) => setFormData({ ...formData, adminName: e.target.value })}
                    placeholder="Dr. Thabo Khumalo"
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                    Billing / Super Admin Email *
                  </label>
                  <input
                    type="email"
                    required
                    value={formData.adminEmail}
                    onChange={(e) => setFormData({ ...formData, adminEmail: e.target.value })}
                    placeholder="admin@apex.co.za"
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-blue-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Contact Phone Number *
                </label>
                <input
                  type="tel"
                  required
                  value={formData.contactPhone}
                  onChange={(e) => setFormData({ ...formData, contactPhone: e.target.value })}
                  placeholder="+27 82 000 0000"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-blue-500"
                />
              </div>

              {/* Billing Cycle Option */}
              <div className="pt-4 border-t border-slate-800">
                <label className="block text-xs font-semibold text-slate-300 mb-3">
                  Billing Cycle
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setBillingCycle('annual')}
                    className={`p-3.5 rounded-xl text-left border transition-all ${
                      billingCycle === 'annual'
                        ? 'border-blue-500 bg-blue-500/10 text-white'
                        : 'border-slate-800 bg-slate-950 text-slate-400 hover:border-slate-700'
                    }`}
                  >
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-xs font-bold">Annual Upfront</span>
                      <span className="text-[10px] bg-emerald-500/20 text-emerald-300 px-2 py-0.5 rounded-full font-bold">SAVE 15%</span>
                    </div>
                    <span className="text-[11px] text-slate-400 block">Single annual invoice</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setBillingCycle('monthly')}
                    className={`p-3.5 rounded-xl text-left border transition-all ${
                      billingCycle === 'monthly'
                        ? 'border-blue-500 bg-blue-500/10 text-white'
                        : 'border-slate-800 bg-slate-950 text-slate-400 hover:border-slate-700'
                    }`}
                  >
                    <span className="text-xs font-bold block mb-1">Monthly Billing</span>
                    <span className="text-[11px] text-slate-400 block">Recurring payment link</span>
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-4 px-6 rounded-xl font-bold text-sm bg-gradient-to-r from-blue-600 to-teal-500 hover:from-blue-500 hover:to-teal-400 text-white shadow-xl shadow-blue-500/25 flex items-center justify-center gap-2 mt-6 transition-all disabled:opacity-50"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Connecting to Ozow Instant EFT...
                  </>
                ) : (
                  <>
                    <Lock className="w-4 h-4" />
                    Pay R {calculateTotal().toLocaleString()} via Ozow Instant EFT
                  </>
                )}
              </button>
            </form>
          </div>

          {/* Order Summary */}
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6">
            <h3 className="text-sm font-bold uppercase tracking-wider text-slate-400 mb-4">
              Subscription Summary
            </h3>

            <div className="border-b border-slate-800 pb-4 mb-4">
              <h4 className="text-base font-bold text-white">{plan.name}</h4>
              <p className="text-xs text-blue-400 font-semibold mt-0.5">{plan.learners}</p>
              <p className="text-xs text-slate-400 mt-2 leading-relaxed">{plan.description}</p>
            </div>

            <div className="space-y-2 text-xs text-slate-300 mb-6">
              <div className="flex justify-between">
                <span>Billing Period:</span>
                <span className="font-semibold text-white capitalize">{billingCycle}</span>
              </div>
              <div className="flex justify-between">
                <span>Setup & Provisioning:</span>
                <span className="text-emerald-400 font-semibold">FREE (Automated)</span>
              </div>
              <div className="flex justify-between">
                <span>SETA PoE Exporter:</span>
                <span className="font-semibold text-white">Included</span>
              </div>
            </div>

            <div className="pt-4 border-t border-slate-800 flex justify-between items-baseline mb-6">
              <span className="text-sm font-bold text-slate-300">Total Payable:</span>
              <div className="text-right">
                <span className="text-2xl font-black text-white">
                  R {calculateTotal().toLocaleString()}
                </span>
                <span className="text-[10px] text-slate-500 block">ZAR (Excl. VAT)</span>
              </div>
            </div>

            <div className="bg-slate-950 rounded-2xl p-4 text-[11px] text-slate-400 space-y-2 border border-slate-800/80">
              <div className="flex items-center gap-2 text-emerald-400 font-semibold">
                <CheckCircle2 className="w-4 h-4 shrink-0" /> Zero-Touch Instant Provisioning
              </div>
              <p className="text-[10px] leading-relaxed">
                Upon payment confirmation, your academy database is partitioned and your Super Admin credentials will be dispatched to your email immediately.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Checkout;
