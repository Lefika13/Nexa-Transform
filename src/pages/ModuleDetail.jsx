import React, { useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { 
  CheckCircle2, ArrowRight, ArrowLeft, Laptop, 
  Briefcase, BookOpen, Send, SearchX, Sparkles,
  TrendingUp, ShieldCheck, Globe, Wifi
} from 'lucide-react';
import { PROGRAMMES_DATA, getProgrammeBySlug } from '../data/programmesData';
import { ModuleHeroDiagram } from '../components/shared/ModuleHeroDiagram';
import './ModuleDetail.css';

export const ModuleDetail = () => {
  const { slug } = useParams();

  // Resolve current programme — null if slug is invalid
  const programme = getProgrammeBySlug(slug) ?? null;

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
    // Dynamically update page title
    document.title = programme
      ? `${programme.title} | Nexa Transform Training Academy`
      : 'Module Not Found | Nexa Transform';
  }, [slug, programme]);

  // ── Not Found state ──────────────────────────────────────────────────────
  if (!programme) {
    return (
      <div className="module-detail-root" style={{ minHeight: '70vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ textAlign: 'center', padding: '3rem 1.5rem', maxWidth: 480 }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: 80, height: 80, borderRadius: '50%', background: 'rgba(6,182,212,0.1)', marginBottom: '1.5rem' }}>
            <SearchX size={36} color="var(--turquoise, #06B6D4)" />
          </div>
          <h1 style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--navy, #0B132B)', marginBottom: '0.75rem' }}>
            Module Not Found
          </h1>
          <p style={{ color: '#6B7280', marginBottom: '2rem', lineHeight: 1.6 }}>
            We couldn't find a module matching "{slug}". It may have been moved or the link may be incorrect.
          </p>
          <Link to="/training-academy" className="btn btn-nexa-turquoise" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem' }}>
            <ArrowLeft size={16} />
            Browse All Modules
          </Link>
        </div>
      </div>
    );
  }

  const allOtherProgrammes = PROGRAMMES_DATA.filter(p => p.slug !== programme.slug);

  return (
    <div className="module-detail-root">
      {/* 1. Breadcrumb Bar */}
      <div className="module-breadcrumb-bar">
        <div className="container">
          <div className="module-breadcrumb-list">
            <Link to="/"><ArrowLeft size={14} /> Home</Link>
            <span className="module-breadcrumb-separator">/</span>
            <Link to="/training-academy">Training Academy</Link>
            <span className="module-breadcrumb-separator">/</span>
            <span className="module-breadcrumb-current">{programme.title}</span>
          </div>
        </div>
      </div>

      {/* 2. Hero Section with Contextual Visual Diagram Behind/Beside Title */}
      <section className="module-hero">
        <div className="container">
          <div className="module-hero-grid">
            <div className="module-hero-content">
              {programme.is_featured && (
                <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', padding: '0.3rem 0.8rem', borderRadius: '9999px', background: 'rgba(16, 185, 129, 0.15)', border: '1px solid rgba(16, 185, 129, 0.35)', color: '#10B981', fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.75rem' }}>
                  <Sparkles size={13} /> {programme.badge || 'High-Demand Programme'}
                </div>
              )}
              <div className="module-delivery-badge">
                <Laptop size={15} />
                <span>Delivery: {programme.delivery || 'Blended & Digital Learning'}</span>
              </div>

              <h1 className="module-hero-title">{programme.title}</h1>

              {/* Contextual Feature / Capability Chips */}
              {programme.feature_chips && programme.feature_chips.length > 0 && (
                <div className="module-hero-chips">
                  {programme.feature_chips.map((chip, idx) => (
                    <span key={idx} className="module-hero-chip">
                      <Sparkles size={12} />
                      {chip}
                    </span>
                  ))}
                </div>
              )}

              <div className="module-hero-actions">
                <Link 
                  to={`/contact?programme=${encodeURIComponent(programme.title)}&enquiry_type=Training%20Enquiry`}
                  className="btn btn-nexa-turquoise"
                >
                  <span>Enquire Now</span>
                  <ArrowRight size={18} />
                </Link>
                <Link 
                  to="/training-academy"
                  className="btn btn-nexa-outline-light"
                >
                  <span>View All Modules</span>
                </Link>
              </div>
            </div>

            {/* Visual Process Map / Architectural Diagram Panel */}
            <div className="module-hero-diagram-wrapper">
              <ModuleHeroDiagram diagramType={programme.diagram_type} title={programme.title} />
            </div>
          </div>
        </div>
      </section>

      {/* 3. Main Content Section */}
      <section className="module-main-section">
        <div className="container">
          <div className="module-layout-grid">
            {/* Left Column: Core Module Details */}
            {/* Left Column: Core Module Details */}
            <div className="module-core-column">
              
              {/* SECTION: About the Programme */}
              <div className="module-card module-about-card">
                <div className="module-card-header">
                  <div className="module-card-icon">
                    <BookOpen size={20} />
                  </div>
                  <h2 className="module-card-title">About the Programme</h2>
                </div>
                <div className="module-card-body">
                  <div className="module-about-narrative">
                    <p className="module-about-text">
                      {programme.about}
                    </p>
                  </div>

                  {/* Workplace Impact Callout Banner */}
                  {programme.workplace_impact && (
                    <div className="module-impact-card">
                      <div className="module-impact-icon">
                        <TrendingUp size={22} />
                      </div>
                      <div className="module-impact-body">
                        <h4 className="module-impact-title">Organisational Value &amp; Workplace Impact</h4>
                        <p className="module-impact-desc">{programme.workplace_impact}</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* SECTION: How Are You Assessed? */}
              <div className="module-card">
                <div className="module-card-header">
                  <div className="module-card-icon module-card-icon-emerald">
                    <CheckCircle2 size={20} />
                  </div>
                  <h2 className="module-card-title">How Are You Assessed?</h2>
                </div>
                <div className="module-card-body">
                  <div className="module-assessment-grid">
                    <div className="module-assessment-card">
                      <span className="module-assessment-badge">Component 01</span>
                      <h3 className="module-assessment-title">Knowledge Component</h3>
                      <p className="module-assessment-desc">
                        Delivered through blended facilitation through our LMS portal.
                      </p>
                    </div>

                    <div className="module-assessment-card">
                      <span className="module-assessment-badge">Component 02</span>
                      <h3 className="module-assessment-title">Practical Component</h3>
                      <p className="module-assessment-desc">
                        Evaluated through regulated industry standards practical assessments, quizzes, and real-live submissions.
                      </p>
                    </div>

                    <div className="module-assessment-card">
                      <span className="module-assessment-badge">Component 03</span>
                      <h3 className="module-assessment-title">Workplace Experience Component</h3>
                      <p className="module-assessment-desc">
                        A Portfolio of Evidence (PoE) with all regards will be provided to demonstrate readiness and competence.
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* SECTION: Upon Completion, Learners Will Be Able To: */}
              <div className="module-card">
                <div className="module-card-header">
                  <div className="module-card-icon module-card-icon-emerald">
                    <CheckCircle2 size={20} />
                  </div>
                  <h2 className="module-card-title">Upon Completion, Learners Will Be Able To:</h2>
                </div>
                <div className="module-card-body">
                  <div className="module-outcomes-list">
                    {programme.completion_outcomes && programme.completion_outcomes.map((outcome, idx) => (
                      <div key={idx} className="module-outcome-item">
                        <div className="module-outcome-check">
                          <CheckCircle2 size={18} />
                        </div>
                        <div className="module-outcome-text">
                          {outcome}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* SECTION: Career Paths */}
              <div className="module-card">
                <div className="module-card-header">
                  <div className="module-card-icon">
                    <Briefcase size={20} />
                  </div>
                  <h2 className="module-card-title">Career Paths</h2>
                </div>
                <div className="module-card-body">
                  <div className="module-roles-grid">
                    {programme.supported_roles && programme.supported_roles.map((role, idx) => {
                      const roleName = typeof role === 'string' ? role : role.title;
                      return (
                        <div key={idx} className="module-role-pill">
                          <div className="module-role-dot"></div>
                          <span className="module-role-name">{roleName}</span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>

            </div>

            {/* Right Column: Delivery & Quick Action Panel */}
            <div className="module-sidebar-column">
              <div className="module-action-panel">
                <h3 className="module-panel-title">Programme Summary</h3>
                
                <div className="module-panel-row">
                  <span className="module-panel-label">Module:</span>
                  <span className="module-panel-val">{programme.title}</span>
                </div>

                <div className="module-panel-row">
                  <span className="module-panel-label">Delivery:</span>
                  <span className="module-panel-val">{programme.delivery || 'Blended & Digital Learning'}</span>
                </div>

                <div className="module-panel-divider"></div>

                <Link 
                  to={`/contact?programme=${encodeURIComponent(programme.title)}&enquiry_type=Training%20Enquiry`}
                  className="btn btn-nexa-turquoise w-full text-center mb-3"
                >
                  <Send size={16} />
                  <span>Enquire for This Module</span>
                </Link>

                <Link 
                  to="/training-academy"
                  className="btn btn-nexa-outline-navy w-full text-center"
                >
                  Browse Other Modules
                </Link>
              </div>

              {/* Institutional Quality Assurance Note */}
              <div className="module-qa-card">
                <div className="module-qa-header">
                  <ShieldCheck size={18} color="#06B6D4" />
                  <span className="module-qa-title">Quality Assured Curriculum</span>
                </div>
                <p className="module-qa-desc">
                  Curriculum aligned with international operational standards and industry best practices. Designed for immediate practical workplace application.
                </p>
              </div>

              {/* Nationwide & Inclusive Learning Note */}
              <div className="module-qa-card" style={{ marginTop: '1rem' }}>
                <div className="module-qa-header">
                  <Globe size={18} color="#10B981" />
                  <span className="module-qa-title">Nationwide &amp; Inclusive Access</span>
                </div>
                <p className="module-qa-desc">
                  Delivered 100% online across all 9 provinces. Includes downloadable offline batch study packs, smartphone-optimised portal access, and load shedding-resilient assessments.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 4. Explore Other Modules Switcher */}
      <section className="module-switcher-section">
        <div className="container">
          <div className="module-switcher-header">
            <h3 className="text-xl font-bold text-white">Explore Other Modules</h3>
            <Link to="/training-academy" className="text-turquoise hover:underline text-sm font-semibold flex items-center gap-1">
              View All <ArrowRight size={14} />
            </Link>
          </div>

          <div className="module-switcher-grid">
            {allOtherProgrammes.map((item) => (
              <Link 
                key={item.slug} 
                to={`/training-academy/${item.slug}`}
                className="module-switcher-card"
              >
                <h4 className="text-sm font-bold text-white mb-2">{item.title}</h4>
                <div className="text-xs text-turquoise flex items-center gap-1 mt-auto">
                  <span>View Details</span>
                  <ArrowRight size={13} />
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
};

export default ModuleDetail;
