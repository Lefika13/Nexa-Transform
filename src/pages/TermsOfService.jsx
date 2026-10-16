import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { 
  FileText, 
  CheckCircle2, 
  Scale, 
  BookOpen, 
  Lock, 
  ShieldAlert, 
  CreditCard, 
  AlertTriangle, 
  Globe, 
  Mail, 
  Phone, 
  ArrowLeft,
  HelpCircle
} from 'lucide-react';
import './TermsOfService.css';

export const TermsOfService = () => {
  const [activeSection, setActiveSection] = useState('acceptance');

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' });
  }, []);

  const sections = [
    { id: 'acceptance', title: '1. Acceptance & Scope', icon: FileText },
    { id: 'services', title: '2. Services & Programmes', icon: BookOpen },
    { id: 'accounts', title: '3. Accounts & Portal Access', icon: Lock },
    { id: 'ip', title: '4. Intellectual Property', icon: Scale },
    { id: 'acceptable-use', title: '5. Acceptable Use Policy', icon: ShieldAlert },
    { id: 'fees', title: '6. Enrolments & Fees', icon: CreditCard },
    { id: 'liability', title: '7. Limitation of Liability', icon: AlertTriangle },
    { id: 'governing-law', title: '8. Governing Law', icon: Globe },
    { id: 'contact', title: '9. Contact Details', icon: Mail }
  ];

  const scrollToSection = (id) => {
    setActiveSection(id);
    const element = document.getElementById(id);
    if (element) {
      const isMobile = typeof window !== 'undefined' && window.innerWidth < 1024;
      const offset = isMobile ? 150 : 96;
      const bodyRect = document.body.getBoundingClientRect().top;
      const elementRect = element.getBoundingClientRect().top;
      const elementPosition = elementRect - bodyRect;
      const offsetPosition = elementPosition - offset;

      window.scrollTo({
        top: offsetPosition,
        behavior: 'smooth'
      });
    }
  };

  return (
    <div className="terms-root">
      {/* 1. Breadcrumb Bar */}
      <div className="terms-breadcrumb-bar">
        <div className="container">
          <div className="terms-breadcrumb-list">
            <Link to="/"><ArrowLeft size={14} /> Home</Link>
            <span className="terms-breadcrumb-separator">/</span>
            <span className="terms-breadcrumb-current">Terms of Service</span>
          </div>
        </div>
      </div>

      {/* 2. Hero Section */}
      <section className="terms-hero">
        <div className="container">
          <div className="terms-hero-content">
            <h1 className="terms-hero-title">Terms of Service</h1>
            
            <p className="terms-hero-description">
              Please read these terms carefully before engaging with Nexa Transform Group, our training academy, consulting services, and digital learning portals.
            </p>

            <div className="terms-hero-meta">
              <span><strong>Effective Date:</strong> March 2026</span>
              <span className="terms-meta-divider">•</span>
              <span><strong>Organisation:</strong> Nexa Transform Group</span>
              <span className="terms-meta-divider">•</span>
              <span><strong>Jurisdiction:</strong> Republic of South Africa</span>
            </div>
          </div>
        </div>
      </section>

      {/* 3. Mobile Jump Menu (Quick Navigation) */}
      <nav aria-label="Mobile Jump Navigation" className="terms-mobile-nav">
        <div className="container">
          <label htmlFor="mobile-terms-select" className="terms-mobile-nav-label">
            Jump to Section:
          </label>
          <div className="terms-select-wrap">
            <select
              id="mobile-terms-select"
              value={activeSection}
              onChange={(e) => scrollToSection(e.target.value)}
              className="terms-mobile-select"
            >
              {sections.map((sec) => (
                <option key={sec.id} value={sec.id}>
                  {sec.title}
                </option>
              ))}
            </select>
          </div>
        </div>
      </nav>

      {/* 4. Main Content Section */}
      <section className="terms-main-section">
        <div className="container">
          <div className="terms-layout-grid">
            
            {/* Desktop Table of Contents Sidebar */}
            <aside className="terms-sidebar">
              <div className="terms-toc-card">
                <h3 className="terms-toc-heading">Table of Contents</h3>
                <nav className="terms-toc-nav">
                  {sections.map((sec) => {
                    const Icon = sec.icon;
                    const isActive = activeSection === sec.id;
                    return (
                      <button
                        key={sec.id}
                        type="button"
                        onClick={() => scrollToSection(sec.id)}
                        className={`terms-toc-item ${isActive ? 'active' : ''}`}
                      >
                        <Icon size={16} className={isActive ? 'text-turquoise' : 'text-gray-400'} />
                        <span>{sec.title}</span>
                      </button>
                    );
                  })}
                </nav>

                <div className="terms-toc-help">
                  <HelpCircle size={18} className="text-turquoise shrink-0" />
                  <div>
                    <p className="text-xs font-semibold text-white">Need Clarification?</p>
                    <a href="mailto:enquiries@nexa-transform.com" className="text-xs text-turquoise hover:underline">
                      enquiries@nexa-transform.com
                    </a>
                  </div>
                </div>
              </div>
            </aside>

            {/* Main Terms Content */}
            <main className="terms-content-area">
              
              {/* Section 1: Acceptance */}
              <article id="acceptance" className="terms-card">
                <div className="terms-card-header">
                  <div className="terms-icon-pill bg-turquoise/10 text-turquoise">
                    <FileText size={20} />
                  </div>
                  <h2>1. Acceptance of Terms &amp; Scope</h2>
                </div>
                <div className="terms-card-body">
                  <p>
                    These Terms of Service (&quot;Terms&quot;) govern the access and use of all services, websites (<a href="https://nexa-transform.com" className="text-turquoise font-medium hover:underline">nexa-transform.com</a>), training programmes, and digital portals (including the NexaTransform Hub LMIS) provided by <strong>Nexa Transform Group</strong> (&quot;we&quot;, &quot;us&quot;, or &quot;our&quot;).
                  </p>
                  <p>
                    By browsing our website, submitting an enquiry, registering for a training module, or accessing our learner and faculty portals, you agree to be bound by these Terms and our Privacy Policy. If you do not agree to these Terms, you must not use our website or services.
                  </p>
                </div>
              </article>

              {/* Section 2: Services */}
              <article id="services" className="terms-card">
                <div className="terms-card-header">
                  <div className="terms-icon-pill bg-blue-50 text-navy">
                    <BookOpen size={20} />
                  </div>
                  <h2>2. Services &amp; Training Programmes</h2>
                </div>
                <div className="terms-card-body">
                  <p>
                    Nexa Transform Group provides skills development programmes, organizational transformation consulting, change management support, and learning management technology.
                  </p>
                  <div className="terms-bullet-list">
                    <div className="terms-bullet-item">
                      <CheckCircle2 size={18} className="text-emerald shrink-0 mt-0.5" />
                      <div>
                        <strong>Curriculum Delivery:</strong> Modules are delivered via structured digital, blended, or classroom learning frameworks designed to equip learners with practical, industry-relevant competencies.
                      </div>
                    </div>
                    <div className="terms-bullet-item">
                      <CheckCircle2 size={18} className="text-emerald shrink-0 mt-0.5" />
                      <div>
                        <strong>Certificates of Completion:</strong> Certificates and formal academic progress reports are issued based on satisfactory completion of curriculum requirements, assessment marks, and attendance criteria.
                      </div>
                    </div>
                    <div className="terms-bullet-item">
                      <CheckCircle2 size={18} className="text-emerald shrink-0 mt-0.5" />
                      <div>
                        <strong>Programme Changes:</strong> We reserve the right to update curriculum outlines, schedules, and learning materials to maintain alignment with industry advancements and quality benchmarks.
                      </div>
                    </div>
                  </div>
                </div>
              </article>

              {/* Section 3: Accounts */}
              <article id="accounts" className="terms-card">
                <div className="terms-card-header">
                  <div className="terms-icon-pill bg-navy/10 text-navy">
                    <Lock size={20} />
                  </div>
                  <h2>3. User Accounts &amp; Portal Security</h2>
                </div>
                <div className="terms-card-body">
                  <p>
                    Access to specialized areas of the NexaTransform Hub LMIS (Learner Portal, Lecturer Portal, and Admin Portal) requires registered account credentials.
                  </p>
                  <ul className="space-y-2 mt-2 text-sm text-gray-700">
                    <li className="flex items-start gap-2">
                      <CheckCircle2 size={16} className="text-turquoise shrink-0 mt-0.5" />
                      <span>You are responsible for maintaining the confidentiality of your credentials and all activities occurring under your account.</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle2 size={16} className="text-turquoise shrink-0 mt-0.5" />
                      <span>Account sharing is strictly prohibited. Each learner and lecturer must access portals using their individual authorized login.</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle2 size={16} className="text-turquoise shrink-0 mt-0.5" />
                      <span>You agree to notify Nexa Transform Group immediately of any unauthorized access or security breach regarding your credentials.</span>
                    </li>
                  </ul>
                </div>
              </article>

              {/* Section 4: IP */}
              <article id="ip" className="terms-card">
                <div className="terms-card-header">
                  <div className="terms-icon-pill bg-emerald/10 text-emerald">
                    <Scale size={20} />
                  </div>
                  <h2>4. Intellectual Property Rights</h2>
                </div>
                <div className="terms-card-body">
                  <p>
                    All materials on our website and portals—including course curricula, training guides, lesson recordings, presentations, assessments, logos, design elements, and software—are the exclusive intellectual property of Nexa Transform Group or its licensors.
                  </p>
                  <p>
                    Learners and corporate clients receive a limited, revocable, non-transferable licence to access learning materials solely for personal study or internal organizational training as permitted under their active enrollment agreement. Materials may not be duplicated, sold, redistributed, or publicly shared without explicit written consent.
                  </p>
                </div>
              </article>

              {/* Section 5: Acceptable Use */}
              <article id="acceptable-use" className="terms-card">
                <div className="terms-card-header">
                  <div className="terms-icon-pill bg-rose-50 text-rose-600">
                    <ShieldAlert size={20} />
                  </div>
                  <h2>5. Acceptable Use Policy</h2>
                </div>
                <div className="terms-card-body">
                  <p>
                    When using our websites and digital portals, you agree not to:
                  </p>
                  <ul className="space-y-2 mt-2 text-sm text-gray-700">
                    <li className="flex items-start gap-2">
                      <div className="w-1.5 h-1.5 rounded-full bg-rose-500 mt-2 shrink-0"></div>
                      <span>Submit false, plagiarized, or fraudulent assessment answers or Portfolio of Evidence documentation.</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <div className="w-1.5 h-1.5 rounded-full bg-rose-500 mt-2 shrink-0"></div>
                      <span>Attempt to decompile, reverse engineer, or probe the vulnerability of the LMIS portal or connected databases.</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <div className="w-1.5 h-1.5 rounded-full bg-rose-500 mt-2 shrink-0"></div>
                      <span>Interfere with or disrupt the normal operation of our website, servers, or networks.</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <div className="w-1.5 h-1.5 rounded-full bg-rose-500 mt-2 shrink-0"></div>
                      <span>Transmit unsolicited marketing, spam, or malicious code through our forms or portals.</span>
                    </li>
                  </ul>
                </div>
              </article>

              {/* Section 6: Fees */}
              <article id="fees" className="terms-card">
                <div className="terms-card-header">
                  <div className="terms-icon-pill bg-turquoise/10 text-turquoise">
                    <CreditCard size={20} />
                  </div>
                  <h2>6. Enrolments, Fees &amp; Cancellations</h2>
                </div>
                <div className="terms-card-body">
                  <p>
                    Training module fees, corporate consultation rates, and payment schedules are governed by the applicable service proposal, quotation, or enrollment agreement executed between Nexa Transform Group and the client or learner.
                  </p>
                  <p>
                    Cancellations, transfers, and refund requests must be communicated in writing and are subject to the specific terms set out in the signed engagement contract or institutional sponsorship agreement.
                  </p>
                </div>
              </article>

              {/* Section 7: Limitation of Liability */}
              <article id="liability" className="terms-card">
                <div className="terms-card-header">
                  <div className="terms-icon-pill bg-amber-50 text-amber-600">
                    <AlertTriangle size={20} />
                  </div>
                  <h2>7. Limitation of Liability &amp; Disclaimers</h2>
                </div>
                <div className="terms-card-body">
                  <p>
                    While we endeavor to provide uninterrupted, high-quality educational and consulting experiences, our services and website are provided on an &quot;as is&quot; and &quot;as available&quot; basis without warranties of any kind, whether express or implied.
                  </p>
                  <p>
                    To the maximum extent permitted by South African law, Nexa Transform Group shall not be liable for any indirect, incidental, special, or consequential damages resulting from the use or inability to use our website, services, or learning materials.
                  </p>
                </div>
              </article>

              {/* Section 8: Governing Law */}
              <article id="governing-law" className="terms-card">
                <div className="terms-card-header">
                  <div className="terms-icon-pill bg-blue-50 text-navy">
                    <Globe size={20} />
                  </div>
                  <h2>8. Governing Law &amp; Dispute Resolution</h2>
                </div>
                <div className="terms-card-body">
                  <p>
                    These Terms of Service are governed by and construed in accordance with the laws of the <strong>Republic of South Africa</strong>.
                  </p>
                  <p>
                    Any dispute arising from or related to these Terms or our services shall first be submitted to good-faith informal negotiations between the parties. If unresolved, disputes shall be submitted to the competent jurisdiction of the South African courts.
                  </p>
                </div>
              </article>

              {/* Section 9: Contact */}
              <article id="contact" className="terms-card">
                <div className="terms-card-header">
                  <div className="terms-icon-pill bg-turquoise/10 text-turquoise">
                    <Mail size={20} />
                  </div>
                  <h2>9. Contact Details</h2>
                </div>
                <div className="terms-card-body">
                  <p>
                    For questions or enquiries regarding these Terms of Service, please contact our team directly:
                  </p>

                  <div className="mt-6 p-6 rounded-2xl bg-navy text-white flex flex-col md:flex-row items-start md:items-center justify-between gap-6 shadow-xl">
                    <div>
                      <div className="text-xs uppercase tracking-widest text-turquoise font-bold mb-1">
                        Nexa Transform Group
                      </div>
                      <div className="text-xl font-bold text-white mb-2">
                        Legal &amp; Client Relations
                      </div>
                      <div className="space-y-1.5 text-sm text-gray-300">
                        <div className="flex items-center gap-2">
                          <Mail size={16} className="text-turquoise shrink-0" />
                          <a href="mailto:enquiries@nexa-transform.com" className="hover:text-turquoise transition-colors font-medium">
                            enquiries@nexa-transform.com
                          </a>
                        </div>
                      </div>
                    </div>

                    <Link 
                      to="/contact?enquiry_type=Support%20Request"
                      className="px-6 py-3 rounded-xl bg-turquoise text-navy font-bold text-sm hover:bg-white transition-all shadow-lg hover:shadow-turquoise/20 shrink-0"
                    >
                      Get in Touch
                    </Link>
                  </div>
                </div>
              </article>

            </main>
          </div>
        </div>
      </section>
    </div>
  );
};
export default TermsOfService;
