import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useData } from '../context/DataContext';
import './SchoolsShowcase.css';

export const SchoolsShowcase = () => {
  const navigate = useNavigate();
  const { provisionSchoolTenant } = useData();

  // Billing Cycle: 'monthly' | 'termly' | 'annual'
  const [billingCycle, setBillingCycle] = useState('termly');

  // Contract Modal State
  const [isContractModalOpen, setIsContractModalOpen] = useState(false);
  const [selectedTier, setSelectedTier] = useState('Growth School');

  // Contract Form State
  const [contractForm, setContractForm] = useState({
    school_name: '',
    emis_number: '',
    institution_type: 'high_school',
    signatory_name: '',
    signatory_title: 'Principal',
    signatory_email: '',
    signatory_phone: '',
    province: 'Gauteng',
    agreed_to_terms: false
  });

  const [isSubmitting, setIsSubmitting] = useState(false);

  const pricingTiers = [
    {
      name: 'Starter School',
      capacity: 'Up to 200 Pupils',
      description: 'Ideal for pre-primary, community junior schools, or private academies launching digital operations.',
      price: {
        monthly: 'R 1,450',
        termly: 'R 4,200',
        annual: 'R 14,800'
      },
      features: [
        'Grades 1 to 7 or 8 to 10',
        'Daily Morning Homeroom Register',
        'Automated Term Report Cards (CAPS 1–7)',
        'Parent Email Delivery Hub',
        'Offline Caching & Mobile Support',
        'Standard Email Support'
      ]
    },
    {
      name: 'Growth School',
      capacity: 'Up to 600 Pupils',
      featured: true,
      description: 'The complete management platform for established primary, middle, and high schools.',
      price: {
        monthly: 'R 2,850',
        termly: 'R 8,200',
        annual: 'R 29,000'
      },
      features: [
        'Grades 1 through 12 Full Support',
        'Two-Tier Attendance (Homeroom + Period Electives)',
        'Smart Truancy & Class Bunking Detection',
        'Sports Fixtures & Activity Exemption Badges',
        '1-Click Batch Official PDF Report Cards',
        'Parent Portal & Realtime Notifications',
        'POPIA Compliant Minors Data Vault',
        'Priority Phone & WhatsApp Support'
      ]
    },
    {
      name: 'Enterprise / Combined',
      capacity: '600+ Pupils (Unlimited)',
      description: 'Designed for large combined schools (Grades R–12) or multi-campus private school groups.',
      price: {
        monthly: 'R 4,950',
        termly: 'R 14,500',
        annual: 'R 50,500'
      },
      features: [
        'Unlimited Grades & Class Streams',
        'Multi-Campus / Group Governance Cockpit',
        'Custom School Crest & Watermarked Seals',
        'SA-SAMS Interoperability Export Bridge',
        'Dedicated Cloud Storage & Live Video Links',
        'Staff Upskilling Vouchers (Nexa Academy)',
        'Dedicated Account Manager & Training Webinar'
      ]
    }
  ];

  const handleOpenContract = (tierName) => {
    setSelectedTier(tierName);
    setIsContractModalOpen(true);
  };

  const handleExecuteContractAndPurchase = (e) => {
    e.preventDefault();
    if (!contractForm.agreed_to_terms) {
      alert('You must accept the Master SaaS Agreement and POPIA Data Processing Addendum to proceed.');
      return;
    }

    setIsSubmitting(true);

    setTimeout(() => {
      // Provision school tenant in DataContext
      provisionSchoolTenant(
        {
          name: contractForm.school_name,
          institution_type: contractForm.institution_type,
          emis_number: contractForm.emis_number,
          contact_email: contractForm.signatory_email,
          contact_phone: contractForm.signatory_phone,
          province: contractForm.province,
          subscription_tier: selectedTier
        },
        {
          signatory_name: contractForm.signatory_name,
          signatory_title: contractForm.signatory_title,
          signatory_email: contractForm.signatory_email,
          billing_frequency: billingCycle
        }
      );

      setIsSubmitting(false);
      setIsContractModalOpen(false);

      // Instant redirection to their newly provisioned School Portal!
      navigate('/school-portal');
    }, 1200);
  };

  return (
    <div className="ssc-root">
      {/* Hero Section */}
      <section className="ssc-hero">
        <span className="ssc-eyebrow">Enterprise Education Technology</span>
        <h1 className="ssc-title">
          The Modern Cloud &amp; Mobile LMIS for<br />
          <span>Primary &amp; High Schools</span>
        </h1>
        <p className="ssc-subtitle">
          From morning homeroom roll call to cross-class elective sets, live sports exemption badges, and 1-click automated CAPS report cards. Built for South African and African schools — 100% cloud, mobile-first, and resilient offline.
        </p>

        <div className="ssc-cta-group">
          <a href="#pricing" className="sp-btn-primary" style={{ padding: '0.85rem 1.8rem', fontSize: '1rem' }}>
            View Packages &amp; Get Started →
          </a>
          <Link to="/school-portal" className="sp-btn-secondary" style={{ padding: '0.85rem 1.8rem', fontSize: '1rem' }}>
            Live Interactive School Portal Demo
          </Link>
        </div>
      </section>

      {/* Feature Highlights Grid */}
      <section className="ssc-features-section">
        <div style={{ textAlign: 'center' }}>
          <span style={{ color: '#38BDF8', fontWeight: 700, fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
            Engineered for Real-World School Life
          </span>
          <h2 style={{ fontSize: '2.2rem', fontWeight: 800, color: '#FFFFFF', marginTop: '0.5rem' }}>
            Why Leading Principals Choose Nexa School LMIS
          </h2>
        </div>

        <div className="ssc-features-grid">
          <div className="ssc-feature-card">
            <div className="ssc-feature-icon">📜</div>
            <h3 className="ssc-feature-title">1-Click Automated CAPS Report Cards</h3>
            <p className="ssc-feature-desc">
              Teachers no longer spend weeks copying marks into Excel sheets. The system automatically calculates continuous assessment + exams into the official Department of Basic Education Level 1–7 scale with QR code verification in seconds.
            </p>
          </div>

          <div className="ssc-feature-card">
            <div className="ssc-feature-icon">⏱️</div>
            <h3 className="ssc-feature-title">Two-Tier Attendance with Truancy Alerts</h3>
            <p className="ssc-feature-desc">
              Homeroom teachers take the legal morning register in under 30 seconds. Subject teachers take mixed elective classes (e.g. Pure Maths with 10A, 10B, and 10C pupils). The smart engine detects class bunking automatically.
            </p>
          </div>

          <div className="ssc-feature-card">
            <div className="ssc-feature-icon">⚽</div>
            <h3 className="ssc-feature-title">Sports Fixtures &amp; Activity Badges</h3>
            <p className="ssc-feature-desc">
              When students depart for an away soccer/rugby match, debate tour, or sickbay sign-out, coaches log it once. Subject teachers see live exemption badges on their registers, preventing false truancy alarms!
            </p>
          </div>

          <div className="ssc-feature-card">
            <div className="ssc-feature-icon">📶</div>
            <h3 className="ssc-feature-title">Offline Caching &amp; Load-Shedding Proof</h3>
            <p className="ssc-feature-desc">
              Teachers can mark attendance and enter test scores even when the network drops or cellular towers lose battery. Data is safely cached locally and synchronizes automatically the moment connectivity returns.
            </p>
          </div>

          <div className="ssc-feature-card">
            <div className="ssc-feature-icon">🔒</div>
            <h3 className="ssc-feature-title">POPIA Compliant Minors Data Vault</h3>
            <p className="ssc-feature-desc">
              Children’s academic history and sensitive parent contacts are encrypted at rest with bank-grade security. Rigorous Row-Level Security prevents data leaks between teachers and institutions.
            </p>
          </div>

          <div className="ssc-feature-card">
            <div className="ssc-feature-icon">⚡</div>
            <h3 className="ssc-feature-title">Zero-Touch 5-Minute Setup</h3>
            <p className="ssc-feature-desc">
              No multi-week sales delays or complex server installations. Select your plan, review and sign the digital contract online, and have your school's private portal active within 5 minutes.
            </p>
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section className="ssc-pricing-section" id="pricing">
        <div style={{ textAlign: 'center' }}>
          <span style={{ color: '#38BDF8', fontWeight: 700, fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
            Transparent School Pricing
          </span>
          <h2 style={{ fontSize: '2.2rem', fontWeight: 800, color: '#FFFFFF', marginTop: '0.5rem' }}>
            Predictable Packages Tailored to Your School Size
          </h2>
          <p style={{ color: '#94A3B8', fontSize: '0.95rem', maxWidth: '600px', margin: '0.5rem auto 0 auto' }}>
            Subscribe monthly via card/debit order, per term (aligned with school fee collection), or annually upfront for a 15% discount.
          </p>

          {/* Billing Frequency Selector */}
          <div className="ssc-billing-toggle">
            <button
              className={`ssc-toggle-btn ${billingCycle === 'monthly' ? 'active' : ''}`}
              onClick={() => setBillingCycle('monthly')}
            >
              Monthly
            </button>
            <button
              className={`ssc-toggle-btn ${billingCycle === 'termly' ? 'active' : ''}`}
              onClick={() => setBillingCycle('termly')}
            >
              Per Term (4 Terms / Yr) ⭐
            </button>
            <button
              className={`ssc-toggle-btn ${billingCycle === 'annual' ? 'active' : ''}`}
              onClick={() => setBillingCycle('annual')}
            >
              Annual Upfront (15% Off)
            </button>
          </div>
        </div>

        {/* Pricing Cards Grid */}
        <div className="ssc-pricing-grid">
          {pricingTiers.map(tier => (
            <div key={tier.name} className={`ssc-price-card ${tier.featured ? 'featured' : ''}`}>
              {tier.featured && <div className="ssc-featured-tag">MOST POPULAR FOR SCHOOLS</div>}
              <h3 className="ssc-price-title">{tier.name}</h3>
              <div className="ssc-price-capacity">{tier.capacity}</div>

              <div className="ssc-price-amount">{tier.price[billingCycle]}</div>
              <div className="ssc-price-period">
                {billingCycle === 'monthly' && 'per month (cancel anytime)'}
                {billingCycle === 'termly' && 'per academic term (billed quarterly)'}
                {billingCycle === 'annual' && 'per academic year (paid upfront)'}
              </div>

              <p style={{ fontSize: '0.85rem', color: '#94A3B8', marginBottom: '1.5rem', lineHeight: '1.5' }}>
                {tier.description}
              </p>

              <ul className="ssc-price-features">
                {tier.features.map((f, i) => (
                  <li key={i}>{f}</li>
                ))}
              </ul>

              <button
                className={tier.featured ? 'sp-btn-primary' : 'sp-btn-secondary'}
                style={{ width: '100%', justifyContent: 'center', padding: '0.75rem', fontSize: '0.92rem' }}
                onClick={() => handleOpenContract(tier.name)}
              >
                Select &amp; Execute Agreement →
              </button>
            </div>
          ))}
        </div>
      </section>

      {/* ====================================================================
          DIGITAL CONTRACT & INSTANT PROVISIONING MODAL
          ==================================================================== */}
      {isContractModalOpen && (
        <div className="ssc-modal-overlay">
          <div className="ssc-modal-container">
            <div className="ssc-modal-header">
              <div>
                <h3 className="ssc-modal-title">SaaS Master Service Agreement &amp; POPIA DPA</h3>
                <span style={{ fontSize: '0.78rem', color: '#38BDF8', fontWeight: 600 }}>
                  Selected Plan: {selectedTier} ({billingCycle.toUpperCase()})
                </span>
              </div>
              <button
                onClick={() => setIsContractModalOpen(false)}
                style={{ background: 'transparent', border: 'none', color: '#94A3B8', fontSize: '1.5rem', cursor: 'pointer' }}
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleExecuteContractAndPurchase} className="ssc-modal-body">
              {/* Legal Terms Scrollbox */}
              <div className="ssc-contract-scrollbox">
                <h4>1. PARTIES &amp; SCOPE OF AGREEMENT</h4>
                <p>
                  This Master Software-as-a-Service Agreement ("Agreement") is entered into between Nexa Transform Group (Pty) Ltd ("Provider") and the educational institution identified below ("School"). Provider grants School a non-exclusive, non-transferable license to access and utilize the Nexa School LMIS for academic management, attendance registers, educator markbooks, and official term report card generation.
                </p>

                <h4>2. PROTECTION OF PERSONAL INFORMATION ACT (POPIA) DATA PROCESSING ADDENDUM</h4>
                <p>
                  In accordance with the Protection of Personal Information Act 4 of 2013 ("POPIA"), Provider acts strictly as an Operator processing special personal information of minors on behalf of School (Responsible Party). All learner records, attendance data, and contact details are encrypted using AES-256 protocols. Provider shall not monetize, sell, or disclose student data to third parties.
                </p>

                <h4>3. SERVICE LEVEL AGREEMENT (SLA) &amp; CONTINUITY</h4>
                <p>
                  Provider guarantees 99.9% application uptime across active school term days. Data is backed up continuously across resilient multi-region cloud infrastructure.
                </p>

                <h4>4. BILLING, RENEWAL &amp; CANCELLATION</h4>
                <p>
                  Subscription fees are invoiced according to the selected billing cycle ({billingCycle}). School may adjust student tiers or cancel with 30 days written notice prior to the start of a subsequent academic term.
                </p>
              </div>

              {/* Institution Information */}
              <h4 style={{ color: '#FFFFFF', fontSize: '0.95rem', marginBottom: '0.85rem' }}>
                1. Institutional Details
              </h4>
              <div className="ssc-form-grid">
                <div className="ssc-form-group">
                  <label>Official School Name *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. St. Andrews Academy"
                    value={contractForm.school_name}
                    onChange={(e) => setContractForm(prev => ({ ...prev, school_name: e.target.value }))}
                  />
                </div>

                <div className="ssc-form-group">
                  <label>Department EMIS / Reg Number *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. 700412345"
                    value={contractForm.emis_number}
                    onChange={(e) => setContractForm(prev => ({ ...prev, emis_number: e.target.value }))}
                  />
                </div>

                <div className="ssc-form-group">
                  <label>Institution Type</label>
                  <select
                    value={contractForm.institution_type}
                    onChange={(e) => setContractForm(prev => ({ ...prev, institution_type: e.target.value }))}
                  >
                    <option value="primary_school">Primary School (Grades R–7)</option>
                    <option value="high_school">High School (Grades 8–12)</option>
                    <option value="combined_school">Combined School (Grades R–12)</option>
                  </select>
                </div>

                <div className="ssc-form-group">
                  <label>Province</label>
                  <select
                    value={contractForm.province}
                    onChange={(e) => setContractForm(prev => ({ ...prev, province: e.target.value }))}
                  >
                    <option value="Gauteng">Gauteng</option>
                    <option value="Western Cape">Western Cape</option>
                    <option value="KwaZulu-Natal">KwaZulu-Natal</option>
                    <option value="Eastern Cape">Eastern Cape</option>
                    <option value="Free State">Free State</option>
                    <option value="Mpumalanga">Mpumalanga</option>
                    <option value="Limpopo">Limpopo</option>
                    <option value="North West">North West</option>
                    <option value="Northern Cape">Northern Cape</option>
                  </select>
                </div>
              </div>

              {/* Authorized Signatory */}
              <h4 style={{ color: '#FFFFFF', fontSize: '0.95rem', marginBottom: '0.85rem' }}>
                2. Authorized Signatory (Principal / SGB Representative)
              </h4>
              <div className="ssc-form-grid">
                <div className="ssc-form-group">
                  <label>Full Legal Name *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Dr. John Khumalo"
                    value={contractForm.signatory_name}
                    onChange={(e) => setContractForm(prev => ({ ...prev, signatory_name: e.target.value }))}
                  />
                </div>

                <div className="ssc-form-group">
                  <label>Official Capacity / Title *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Principal / SGB Chair"
                    value={contractForm.signatory_title}
                    onChange={(e) => setContractForm(prev => ({ ...prev, signatory_title: e.target.value }))}
                  />
                </div>

                <div className="ssc-form-group">
                  <label>Official Institutional Email *</label>
                  <input
                    type="email"
                    required
                    placeholder="principal@school.edu.za"
                    value={contractForm.signatory_email}
                    onChange={(e) => setContractForm(prev => ({ ...prev, signatory_email: e.target.value }))}
                  />
                </div>

                <div className="ssc-form-group">
                  <label>Contact Phone / WhatsApp *</label>
                  <input
                    type="tel"
                    required
                    placeholder="+27 82 555 4321"
                    value={contractForm.signatory_phone}
                    onChange={(e) => setContractForm(prev => ({ ...prev, signatory_phone: e.target.value }))}
                  />
                </div>
              </div>

              {/* Legal Confirmation Checkbox */}
              <div style={{
                background: 'rgba(56, 189, 248, 0.08)',
                border: '1px solid rgba(56, 189, 248, 0.25)',
                borderRadius: '8px',
                padding: '0.85rem 1rem',
                marginTop: '1rem'
              }}>
                <label style={{ display: 'flex', alignItems: 'flex-start', gap: '0.65rem', cursor: 'pointer', fontSize: '0.84rem' }}>
                  <input
                    type="checkbox"
                    required
                    checked={contractForm.agreed_to_terms}
                    onChange={(e) => setContractForm(prev => ({ ...prev, agreed_to_terms: e.target.checked }))}
                    style={{ marginTop: '0.2rem' }}
                  />
                  <span>
                    I, <strong>{contractForm.signatory_name || '[Authorized Signatory]'}</strong>, acting in my official capacity as <strong>{contractForm.signatory_title || '[Capacity]'}</strong> of <strong>{contractForm.school_name || '[School Name]'}</strong>, confirm that I have legal authority to bind this institution to the <strong>Master SaaS Agreement &amp; POPIA Data Processing Addendum</strong>.
                  </span>
                </label>
              </div>

              <div className="ssc-modal-footer" style={{ padding: '1.25rem 0 0 0' }}>
                <button
                  type="button"
                  className="sp-btn-secondary"
                  onClick={() => setIsContractModalOpen(false)}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="sp-btn-primary"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? 'Provisioning School Tenant...' : 'Confirm Purchase & Launch School Portal →'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
