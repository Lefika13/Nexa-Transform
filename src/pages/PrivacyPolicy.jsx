import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { 
  Lock, 
  FileText, 
  Eye, 
  UserCheck, 
  Server, 
  Scale, 
  Clock, 
  Mail, 
  Phone, 
  ArrowLeft,
  ChevronRight,
  CheckCircle2,
  Shield,
  HelpCircle
} from 'lucide-react';
import './PrivacyPolicy.css';

export const PrivacyPolicy = () => {
  const [activeSection, setActiveSection] = useState('scope');

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' });
  }, []);

  const sections = [
    { id: 'scope', title: '1. Scope & Commitment', icon: Shield },
    { id: 'collection', title: '2. Information We Collect', icon: FileText },
    { id: 'purpose', title: '3. Purpose & POPIA Alignment', icon: Scale },
    { id: 'security', title: '4. Security & Access Controls', icon: Lock },
    { id: 'sharing', title: '5. Information Sharing', icon: Server },
    { id: 'rights', title: '6. Your Data Subject Rights', icon: UserCheck },
    { id: 'cookies', title: '7. Cookies & Analytics', icon: Eye },
    { id: 'retention', title: '8. Data Retention', icon: Clock },
    { id: 'contact', title: '9. Information Officer Contact', icon: Mail }
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
    <div className="privacy-root">
      {/* 1. Breadcrumb Bar */}
      <div className="privacy-breadcrumb-bar">
        <div className="container">
          <div className="privacy-breadcrumb-list">
            <Link to="/"><ArrowLeft size={14} /> Home</Link>
            <span className="privacy-breadcrumb-separator">/</span>
            <span className="privacy-breadcrumb-current">Privacy Policy</span>
          </div>
        </div>
      </div>

      {/* 2. Hero Section */}
      <section className="privacy-hero">
        <div className="container">
          <div className="privacy-hero-content">
            <h1 className="privacy-hero-title">Privacy Policy</h1>
            
            <p className="privacy-hero-description">
              Nexa Transform Group is committed to safeguarding personal information and respecting privacy rights in accordance with the Protection of Personal Information Act (POPIA) and global data protection principles.
            </p>

            <div className="privacy-hero-meta">
              <span><strong>Effective Date:</strong> March 2026</span>
              <span className="privacy-meta-divider">•</span>
              <span><strong>Organisation:</strong> Nexa Transform Group</span>
              <span className="privacy-meta-divider">•</span>
              <span><strong>Jurisdiction:</strong> Republic of South Africa</span>
            </div>
          </div>
        </div>
      </section>

      {/* 3. Mobile Jump Menu (Quick Navigation) */}
      <nav aria-label="Mobile Jump Navigation" className="privacy-mobile-nav">
        <div className="container">
          <label htmlFor="mobile-section-select" className="privacy-mobile-nav-label">
            Jump to Section:
          </label>
          <div className="privacy-select-wrap">
            <select
              id="mobile-section-select"
              value={activeSection}
              onChange={(e) => scrollToSection(e.target.value)}
              className="privacy-mobile-select"
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

      {/* 4. Main Content Body */}
      <section className="privacy-main-section">
        <div className="container">
          <div className="privacy-layout-grid">
            
            {/* Desktop Table of Contents Sidebar */}
            <aside className="privacy-sidebar">
              <div className="privacy-toc-card">
                <h3 className="privacy-toc-heading">Table of Contents</h3>
                <nav className="privacy-toc-nav">
                  {sections.map((sec) => {
                    const Icon = sec.icon;
                    const isActive = activeSection === sec.id;
                    return (
                      <button
                        key={sec.id}
                        type="button"
                        onClick={() => scrollToSection(sec.id)}
                        className={`privacy-toc-item ${isActive ? 'active' : ''}`}
                      >
                        <Icon size={16} className={isActive ? 'text-turquoise' : 'text-gray-400'} />
                        <span>{sec.title}</span>
                      </button>
                    );
                  })}
                </nav>

                <div className="privacy-toc-help">
                  <HelpCircle size={18} className="text-turquoise shrink-0" />
                  <div>
                    <p className="text-xs font-semibold text-white">Have Privacy Questions?</p>
                    <a href="mailto:enquiries@nexa-transform.com" className="text-xs text-turquoise hover:underline">
                      enquiries@nexa-transform.com
                    </a>
                  </div>
                </div>
              </div>
            </aside>

            {/* Main Policy Content Articles */}
            <main className="privacy-content-area">
              
              {/* Section 1: Scope */}
              <article id="scope" className="privacy-card">
                <div className="privacy-card-header">
                  <div className="privacy-icon-pill bg-turquoise/10 text-turquoise">
                    <Shield size={20} />
                  </div>
                  <h2>1. Scope &amp; Commitment</h2>
                </div>
                <div className="privacy-card-body">
                  <p>
                    This Privacy Policy applies to <strong>Nexa Transform Group</strong> (&quot;we&quot;, &quot;us&quot;, or &quot;our&quot;), including our official website (<a href="https://nexa-transform.com" className="text-turquoise font-medium hover:underline">nexa-transform.com</a>), learning management portals (NexaTransform Hub LMIS), training academy programmes, and professional consulting services.
                  </p>
                  <p>
                    We recognize that your privacy is of critical importance. We are committed to processing all personal information responsibly, transparently, and strictly in accordance with South Africa&apos;s <strong>Protection of Personal Information Act, No. 4 of 2013 (POPIA)</strong>, as well as applicable international data protection standards.
                  </p>
                </div>
              </article>

              {/* Section 2: Collection */}
              <article id="collection" className="privacy-card">
                <div className="privacy-card-header">
                  <div className="privacy-icon-pill bg-blue-50 text-navy">
                    <FileText size={20} />
                  </div>
                  <h2>2. Information We Collect</h2>
                </div>
                <div className="privacy-card-body">
                  <p>
                    We collect personal information that is reasonably necessary to provide educational programmes, client consulting, and institutional administration. This includes:
                  </p>
                  <div className="privacy-bullet-list">
                    <div className="privacy-bullet-item">
                      <CheckCircle2 size={18} className="text-emerald shrink-0 mt-0.5" />
                      <div>
                        <strong>Contact &amp; Enquiry Details:</strong> Full name, professional email address, telephone number, organisation name, and enquiry details submitted through our contact and consultation forms.
                      </div>
                    </div>
                    <div className="privacy-bullet-item">
                      <CheckCircle2 size={18} className="text-emerald shrink-0 mt-0.5" />
                      <div>
                        <strong>Academic &amp; Learner Information:</strong> National identification / passport number, date of birth, gender, educational history, module enrollments, attendance, assessment submissions, grades, and Portfolio of Evidence (PoE) records required for certification and institutional verification.
                      </div>
                    </div>
                    <div className="privacy-bullet-item">
                      <CheckCircle2 size={18} className="text-emerald shrink-0 mt-0.5" />
                      <div>
                        <strong>Institutional &amp; Faculty Records:</strong> Lecturer credentials, professional biographies, assigned modules, academic period schedules, and institutional communication logs.
                      </div>
                    </div>
                    <div className="privacy-bullet-item">
                      <CheckCircle2 size={18} className="text-emerald shrink-0 mt-0.5" />
                      <div>
                        <strong>Technical &amp; Usage Data:</strong> Anonymized device characteristics, browser type, operating system, IP address, referral URLs, and interactions with portal features to ensure system reliability and security.
                      </div>
                    </div>
                  </div>
                </div>
              </article>

              {/* Section 3: Purpose */}
              <article id="purpose" className="privacy-card">
                <div className="privacy-card-header">
                  <div className="privacy-icon-pill bg-emerald/10 text-emerald">
                    <Scale size={20} />
                  </div>
                  <h2>3. Purpose of Processing &amp; Lawful Basis</h2>
                </div>
                <div className="privacy-card-body">
                  <p>
                    In accordance with POPIA Condition 3 (Purpose Specification), personal information is collected solely for explicit, specified, and legitimate business purposes:
                  </p>
                  <ul className="privacy-numbered-list">
                    <li>
                      <strong>Academic Delivery &amp; Certification:</strong> Enrolling learners, delivering course content, assessing competencies, generating progress reports, and issuing verifiable completion certificates.
                    </li>
                    <li>
                      <strong>Consulting &amp; Advisory Engagements:</strong> Planning, executing, and monitoring organisational development, change management, and workforce skills initiatives for corporate and public partners.
                    </li>
                    <li>
                      <strong>Communication &amp; Support:</strong> Responding to client enquiries, sending schedule updates, academic reminders, and administrative notifications.
                    </li>
                    <li>
                      <strong>Compliance &amp; Quality Assurance:</strong> Fulfilling statutory requirements, accreditation standards (e.g. QCTO / SETA where applicable), and institutional audits.
                    </li>
                    <li>
                      <strong>Security &amp; Fraud Prevention:</strong> Authenticating users, maintaining audit trails, and protecting system infrastructure from unauthorized access.
                    </li>
                  </ul>
                </div>
              </article>

              {/* Section 4: Security */}
              <article id="security" className="privacy-card">
                <div className="privacy-card-header">
                  <div className="privacy-icon-pill bg-navy/10 text-navy">
                    <Lock size={20} />
                  </div>
                  <h2>4. Security &amp; Access Controls</h2>
                </div>
                <div className="privacy-card-body">
                  <p>
                    Nexa Transform Group implements robust organizational and technical measures to protect personal information against loss, unauthorized access, destruction, or unlawful disclosure:
                  </p>
                  <div className="grid sm:grid-cols-2 gap-4 mt-4">
                    <div className="p-4 rounded-xl bg-glacial/50 border border-gray-200/60">
                      <div className="font-bold text-navy text-sm mb-1">Encrypted Data Transit</div>
                      <p className="text-xs text-gray-600">
                        All communications across the web and portals are encrypted using Transport Layer Security (TLS 1.3/HTTPS).
                      </p>
                    </div>
                    <div className="p-4 rounded-xl bg-glacial/50 border border-gray-200/60">
                      <div className="font-bold text-navy text-sm mb-1">Role-Based Access Control</div>
                      <p className="text-xs text-gray-600">
                        Strict role separation ensures learners, lecturers, and administrators only access records essential to their role.
                      </p>
                    </div>
                    <div className="p-4 rounded-xl bg-glacial/50 border border-gray-200/60">
                      <div className="font-bold text-navy text-sm mb-1">Private Document Vaults</div>
                      <p className="text-xs text-gray-600">
                        Learner Portfolios of Evidence and identity documents are stored in access-restricted private storage with time-limited signed access.
                      </p>
                    </div>
                    <div className="p-4 rounded-xl bg-glacial/50 border border-gray-200/60">
                      <div className="font-bold text-navy text-sm mb-1">Audit Logging</div>
                      <p className="text-xs text-gray-600">
                        Administrative actions and mark captures are immutably logged to preserve accountability and traceability.
                      </p>
                    </div>
                  </div>
                </div>
              </article>

              {/* Section 5: Sharing */}
              <article id="sharing" className="privacy-card">
                <div className="privacy-card-header">
                  <div className="privacy-icon-pill bg-turquoise/10 text-turquoise">
                    <Server size={20} />
                  </div>
                  <h2>5. Information Sharing &amp; Third Parties</h2>
                </div>
                <div className="privacy-card-body">
                  <p>
                    We <strong>do not sell, rent, or trade</strong> your personal information to any third parties for commercial or marketing gain. Information is only shared under the following strictly defined conditions:
                  </p>
                  <ul className="space-y-3 mt-3">
                    <li className="flex items-start gap-3">
                      <div className="w-2 h-2 rounded-full bg-turquoise mt-2 shrink-0"></div>
                      <span className="text-sm text-gray-700">
                        <strong>Authorised Service Providers:</strong> Trusted cloud infrastructure and communication providers (e.g. Supabase, Vercel, Resend) operating under legally binding data processing agreements compliant with POPIA Section 21.
                      </span>
                    </li>
                    <li className="flex items-start gap-3">
                      <div className="w-2 h-2 rounded-full bg-turquoise mt-2 shrink-0"></div>
                      <span className="text-sm text-gray-700">
                        <strong>Educational Bodies &amp; Sponsors:</strong> In corporate or sponsored training programmes, learner attendance and assessment outcomes may be reported directly to the sponsoring employer or regulatory accreditation authority.
                      </span>
                    </li>
                    <li className="flex items-start gap-3">
                      <div className="w-2 h-2 rounded-full bg-turquoise mt-2 shrink-0"></div>
                      <span className="text-sm text-gray-700">
                        <strong>Legal &amp; Regulatory Mandate:</strong> When compelled by subpoena, court order, or statutory obligation under South African law.
                      </span>
                    </li>
                  </ul>
                </div>
              </article>

              {/* Section 6: Rights */}
              <article id="rights" className="privacy-card">
                <div className="privacy-card-header">
                  <div className="privacy-icon-pill bg-emerald/10 text-emerald">
                    <UserCheck size={20} />
                  </div>
                  <h2>6. Your Data Subject Rights (Under POPIA)</h2>
                </div>
                <div className="privacy-card-body">
                  <p>
                    Under Chapter 3 of the Protection of Personal Information Act, you hold clear rights regarding your personal records held by Nexa Transform Group:
                  </p>
                  <div className="grid sm:grid-cols-2 gap-4 mt-4">
                    <div className="p-4 rounded-xl border border-gray-200 bg-white hover:border-turquoise/50 transition-colors">
                      <strong className="text-navy block mb-1">Right to Access (Section 23)</strong>
                      <p className="text-xs text-gray-600">
                        You may request confirmation of whether we hold personal information about you and receive a copy of those records.
                      </p>
                    </div>
                    <div className="p-4 rounded-xl border border-gray-200 bg-white hover:border-turquoise/50 transition-colors">
                      <strong className="text-navy block mb-1">Right to Correction (Section 24)</strong>
                      <p className="text-xs text-gray-600">
                        You may request the correction or updating of any inaccurate, incomplete, or outdated personal data.
                      </p>
                    </div>
                    <div className="p-4 rounded-xl border border-gray-200 bg-white hover:border-turquoise/50 transition-colors">
                      <strong className="text-navy block mb-1">Right to Object &amp; Deletion</strong>
                      <p className="text-xs text-gray-600">
                        You may object on reasonable grounds to the processing of your data, or request deletion where statutory retention is not required.
                      </p>
                    </div>
                    <div className="p-4 rounded-xl border border-gray-200 bg-white hover:border-turquoise/50 transition-colors">
                      <strong className="text-navy block mb-1">Right to Lodge a Complaint</strong>
                      <p className="text-xs text-gray-600">
                        You retain the right to submit a complaint to the South African Information Regulator if you believe your rights have been infringed.
                      </p>
                    </div>
                  </div>
                </div>
              </article>

              {/* Section 7: Cookies */}
              <article id="cookies" className="privacy-card">
                <div className="privacy-card-header">
                  <div className="privacy-icon-pill bg-navy/10 text-navy">
                    <Eye size={20} />
                  </div>
                  <h2>7. Cookies &amp; Tracking Technologies</h2>
                </div>
                <div className="privacy-card-body">
                  <p>
                    Our website uses cookies and local storage tokens strictly to ensure optimal platform functionality:
                  </p>
                  <ul className="space-y-2 mt-3 text-sm text-gray-700">
                    <li className="flex items-center gap-2">
                      <CheckCircle2 size={16} className="text-turquoise shrink-0" />
                      <span><strong>Essential Session Tokens:</strong> Required to maintain secure authentication and role navigation in learner, lecturer, and administrator portals.</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle2 size={16} className="text-turquoise shrink-0" />
                      <span><strong>Preferences:</strong> Saving display settings such as light or dark theme choices.</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle2 size={16} className="text-turquoise shrink-0" />
                      <span><strong>Anonymized Telemetry:</strong> Aggregated, non-identifiable usage metrics to monitor site performance and eliminate error states.</span>
                    </li>
                  </ul>
                  <p className="text-xs text-gray-500 mt-3">
                    You can configure your web browser to reject cookies; however, certain interactive portal capabilities may require active session cookies to function properly.
                  </p>
                </div>
              </article>

              {/* Section 8: Retention */}
              <article id="retention" className="privacy-card">
                <div className="privacy-card-header">
                  <div className="privacy-icon-pill bg-blue-50 text-navy">
                    <Clock size={20} />
                  </div>
                  <h2>8. Data Retention &amp; Destruction</h2>
                </div>
                <div className="privacy-card-body">
                  <p>
                    We retain personal information only for as long as is necessary to fulfill the educational, commercial, and legal purposes for which it was collected.
                  </p>
                  <p>
                    Academic and certification records are preserved in accordance with South African education and training governance requirements to allow past learners to verify their qualifications. When personal information is no longer needed, it is permanently de-identified or destroyed in a secure manner.
                  </p>
                </div>
              </article>

              {/* Section 9: Contact */}
              <article id="contact" className="privacy-card">
                <div className="privacy-card-header">
                  <div className="privacy-icon-pill bg-turquoise/10 text-turquoise">
                    <Mail size={20} />
                  </div>
                  <h2>9. Information Officer Contact</h2>
                </div>
                <div className="privacy-card-body">
                  <p>
                    If you have questions, wish to exercise any of your data subject rights, or require further details regarding our data governance, please reach out to our designated Information Officer:
                  </p>

                  <div className="mt-6 p-6 rounded-2xl bg-navy text-white flex flex-col md:flex-row items-start md:items-center justify-between gap-6 shadow-xl">
                    <div>
                      <div className="text-xs uppercase tracking-widest text-turquoise font-bold mb-1">
                        Nexa Transform Group
                      </div>
                      <div className="text-xl font-bold text-white mb-2">
                        Information &amp; Privacy Officer
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
                      Contact Support
                    </Link>
                  </div>

                  <div className="mt-6 p-4 rounded-xl bg-gray-50 border border-gray-200 text-xs text-gray-600 leading-relaxed">
                    <strong>South African Information Regulator:</strong> If you are not satisfied with our response to a privacy enquiry, you have the right to lodge a complaint with the Information Regulator at <a href="https://inforegulator.org.za" target="_blank" rel="noopener noreferrer" className="text-navy font-semibold hover:underline">inforegulator.org.za</a>.
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
export default PrivacyPolicy;
