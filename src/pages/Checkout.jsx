import React, { useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { ShieldCheck, CheckCircle2, Lock, Loader2, Building } from 'lucide-react';
import './Checkout.css';

const PLAN_INFO = {
  starter: {
    name: 'Starter Academy',
    monthlyPrice: 25000,
    learners: 'Less than 1,000 Active Learners'
  },
  growth: {
    name: 'Growth Provider',
    monthlyPrice: 45000,
    learners: '1,000+ to 1,500 Active Learners'
  },
  pro_plus: {
    name: 'Pro+ Plan',
    monthlyPrice: 60000,
    learners: '1,500+ Active Learners'
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
      // 1. Primary Gateway: Stitch Express Instant Pay & Card
      try {
        const stitchRes = await fetch('/api/stitch-create-payment', {
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

        const stitchData = await stitchRes.json();
        if (stitchRes.ok && stitchData.paymentUrl) {
          window.location.href = stitchData.paymentUrl;
          return;
        }
      } catch (stitchErr) {
        console.warn('Stitch Express payment init error, attempting fallback:', stitchErr);
      }

      // 2. Secondary Gateway: Ozow Instant EFT Fallback
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
    <div className="checkout-page-root">
      <div className="checkout-container">
        {/* Header */}
        <div className="checkout-header-wrap">
          <div className="checkout-badge">
            <ShieldCheck style={{ width: 16, height: 16 }} /> Stitch &amp; Ozow Instant EFT Verified Checkout
          </div>
          <h1 className="checkout-title">
            Provision Your Academy Portal
          </h1>
          <p className="checkout-subtitle">
            Instant EFT &amp; Card with ABSA, Capitec, FNB, Nedbank, Standard Bank, Investec &amp; TymeBank.
          </p>
        </div>

        <div className="checkout-grid">
          {/* Form */}
          <div className="checkout-card-box">
            <h2 className="checkout-card-title">
              <Building style={{ width: 20, height: 20, color: '#38BDF8' }} /> Institution Details
            </h2>

            {errorMessage && (
              <div style={{
                background: 'rgba(239, 68, 68, 0.15)',
                border: '1px solid rgba(239, 68, 68, 0.4)',
                borderRadius: '12px',
                padding: '0.85rem 1rem',
                color: '#FCA5A5',
                fontSize: '0.8rem',
                marginBottom: '1.25rem'
              }}>
                {errorMessage}
              </div>
            )}

            <form onSubmit={handleCheckout}>
              <div className="checkout-field-group">
                <label className="checkout-field-label">
                  Academy / Institution Name *
                </label>
                <input
                  type="text"
                  required
                  value={formData.academyName}
                  onChange={handleAcademyNameChange}
                  placeholder="e.g. Apex Training Institute"
                  className="checkout-input-text"
                />
              </div>

              <div className="checkout-field-group">
                <label className="checkout-field-label">
                  Preferred Subdomain URL *
                </label>
                <div className="subdomain-input-group">
                  <input
                    type="text"
                    required
                    value={formData.subdomainSlug}
                    onChange={(e) => setFormData({ ...formData, subdomainSlug: e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, '') })}
                    placeholder="apex-institute"
                    className="checkout-input-text subdomain-input-field"
                  />
                  <span className="subdomain-suffix-tag">
                    .nexa-transform.com
                  </span>
                </div>
                <p className="field-subtext">
                  You can bind your own custom domain (e.g. learn.apex.co.za) anytime in your academy settings.
                </p>
              </div>

              <div className="checkout-field-group form-two-cols">
                <div>
                  <label className="checkout-field-label">
                    Super Admin Full Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.adminName}
                    onChange={(e) => setFormData({ ...formData, adminName: e.target.value })}
                    placeholder="Dr. Thabo Khumalo"
                    className="checkout-input-text"
                  />
                </div>
                <div>
                  <label className="checkout-field-label">
                    Billing / Super Admin Email *
                  </label>
                  <input
                    type="email"
                    required
                    value={formData.adminEmail}
                    onChange={(e) => setFormData({ ...formData, adminEmail: e.target.value })}
                    placeholder="admin@apex.co.za"
                    className="checkout-input-text"
                  />
                </div>
              </div>

              <div className="checkout-field-group">
                <label className="checkout-field-label">
                  Contact Phone Number *
                </label>
                <input
                  type="tel"
                  required
                  value={formData.contactPhone}
                  onChange={(e) => setFormData({ ...formData, contactPhone: e.target.value })}
                  placeholder="+27 82 000 0000"
                  className="checkout-input-text"
                />
              </div>

              {/* Billing Cycle Option */}
              <div className="checkout-field-group" style={{ paddingTop: '1rem', borderTop: '1px solid rgba(255, 255, 255, 0.08)' }}>
                <label className="checkout-field-label">
                  Billing Cycle
                </label>
                <div className="cycle-selector-grid">
                  <div
                    onClick={() => setBillingCycle('annual')}
                    className={`cycle-option-card ${billingCycle === 'annual' ? 'selected' : ''}`}
                  >
                    <div className="cycle-card-top">
                      <span className="cycle-card-name">Annual Upfront</span>
                      <span style={{ fontSize: '0.65rem', background: 'rgba(16, 185, 129, 0.2)', color: '#34D399', padding: '0.15rem 0.5rem', borderRadius: 9999, fontWeight: 800 }}>
                        SAVE 15%
                      </span>
                    </div>
                    <span className="cycle-card-hint">Single annual invoice</span>
                  </div>

                  <div
                    onClick={() => setBillingCycle('monthly')}
                    className={`cycle-option-card ${billingCycle === 'monthly' ? 'selected' : ''}`}
                  >
                    <span className="cycle-card-name">Monthly Billing</span>
                    <span className="cycle-card-hint">Recurring payment link</span>
                  </div>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="checkout-submit-btn"
              >
                {loading ? (
                  <>
                    <Loader2 style={{ width: 18, height: 18 }} className="animate-spin" />
                    Connecting to Stitch Secure Pay...
                  </>
                ) : (
                  <>
                    <Lock style={{ width: 18, height: 18 }} />
                    Pay R {calculateTotal().toLocaleString()} via Stitch Instant EFT &amp; Card
                  </>
                )}
              </button>
            </form>
          </div>

          {/* Order Summary Box */}
          <div className="checkout-card-box">
            <div className="summary-plan-header">
              <h3 className="summary-plan-title">{plan.name}</h3>
              <span className="summary-plan-quota">{plan.learners}</span>
            </div>

            <div className="summary-details-rows">
              <div className="summary-row">
                <span>Billing Period:</span>
                <span className="val" style={{ textTransform: 'capitalize' }}>{billingCycle}</span>
              </div>
              <div className="summary-row">
                <span>Setup &amp; Provisioning:</span>
                <span className="val" style={{ color: '#34D399' }}>FREE (Automated)</span>
              </div>
              <div className="summary-row">
                <span>SETA PoE Exporter:</span>
                <span className="val">Included</span>
              </div>
            </div>

            <div className="summary-total-area">
              <span className="total-label">Total Payable:</span>
              <div>
                <span className="total-amount-display">
                  R {calculateTotal().toLocaleString()}
                </span>
                <span className="total-currency-note">ZAR (Excl. VAT)</span>
              </div>
            </div>

            <div className="security-trust-box">
              <div className="trust-title">
                <CheckCircle2 style={{ width: 16, height: 16 }} /> Zero-Touch Instant Provisioning
              </div>
              <p style={{ margin: 0 }}>
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
