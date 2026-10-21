import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';
import { 
  ChevronLeft, ChevronRight, Grid, Sparkles, ArrowRight,
  Laptop, Gauge, Globe, Workflow, Building, TrendingUp, Factory, Flame,
  Activity, Landmark
} from 'lucide-react';
import { useAnalytics } from '../context/AnalyticsContext';
import './Services.css';

// 4 Build Solutions for 3D Slideshow (with high-contrast solid gradients)
const buildSolutions = [
  {
    title: 'Custom Digital Systems',
    category: 'Enterprise Platforms',
    desc: 'Bespoke operational portals, multi-role dashboards, and telemetry management systems.',
    bg: 'linear-gradient(145deg, #0B132B 0%, #1E40AF 100%)', // Deep Navy to Royal Blue
    badgeColor: '#93C5FD',
    icon: Laptop
  },
  {
    title: 'Mobile & Field Operations Apps',
    category: 'Field & Site Solutions',
    desc: 'Offline-resilient web and mobile apps for field workers, site supervisors, and inspectors.',
    bg: 'linear-gradient(145deg, #064E3B 0%, #0F766E 100%)', // Deep Forest to Teal
    badgeColor: '#6EE7B7',
    icon: Gauge
  },
  {
    title: 'Website Designing & Hosting',
    category: 'Digital Presence',
    desc: 'High-converting commercial websites with custom DNS, SEO architecture, and enterprise email.',
    bg: 'linear-gradient(145deg, #3B0764 0%, #6D28D9 100%)', // Deep Violet to Purple
    badgeColor: '#D8B4FE',
    icon: Globe
  },
  {
    title: 'Workflow Automation & Digital Forms',
    category: 'Process Automation',
    desc: 'Automated approval pipelines, paperless job cards, and SMS/email alert systems.',
    bg: 'linear-gradient(145deg, #7C2D12 0%, #C2410C 100%)', // Deep Bronze to Warm Amber
    badgeColor: '#FDE047',
    icon: Workflow
  }
];

// Target Sectors for 3D Slideshow (with high-contrast solid gradients)
const targetSectors = [
  {
    title: 'Hospitals & Clinics',
    category: 'Healthcare & Medical Operations',
    desc: 'Clinical SOP standardisation, patient triage workflows, sterile supply chain tracking, and digital incident registers.',
    bg: 'linear-gradient(145deg, #065F46 0%, #0D9488 100%)', // Deep Teal / Clinical Emerald
    badgeColor: '#6EE7B7',
    icon: Activity,
    contactParam: 'Hospitals & Clinics / Healthcare'
  },
  {
    title: 'Banks & Financial Institutions',
    category: 'Banking & Financial Services',
    desc: 'Process governance, automated compliance audits, customer onboarding workflows, and operational risk mitigation.',
    bg: 'linear-gradient(145deg, #1E1B4B 0%, #3730A3 100%)', // Deep Indigo / Financial Blue
    badgeColor: '#A5B4FC',
    icon: Landmark,
    contactParam: 'Banks & Financial Institutions'
  },
  {
    title: 'Mining & Natural Resources',
    category: 'Mining & Extraction Operations',
    desc: 'Zero-harm safety compliance, mobile field inspection apps, hazard logging, and digital shift handover telemetry.',
    bg: 'linear-gradient(145deg, #881337 0%, #BE123C 100%)', // Deep Crimson
    badgeColor: '#FDA4AF',
    icon: Flame,
    contactParam: 'Mining & Natural Resources'
  },
  {
    title: 'Manufacturing & Heavy Industry',
    category: 'Smelting, Plants & Assembly',
    desc: 'Plant turnaround, shop floor tracking, 5S workplace organisation, and digital SOP kiosks.',
    bg: 'linear-gradient(145deg, #78350F 0%, #B45309 100%)', // Deep Smelting Forge Amber
    badgeColor: '#FDE047',
    icon: Factory,
    contactParam: 'Manufacturing & Heavy Industry (Smelting, Plants, Foundries)'
  },
  {
    title: 'Government & Public Sector',
    category: 'Public Sector Solutions',
    desc: 'Citizen service portals, inter-departmental approval workflows, and POPIA records management.',
    bg: 'linear-gradient(145deg, #0C4A6E 0%, #0369A1 100%)', // Deep Ocean to Blue
    badgeColor: '#7DD3FC',
    icon: Building,
    contactParam: 'Government & Public Sector / Municipalities'
  },
  {
    title: 'Private Sector & Corporate',
    category: 'Commercial Enterprises',
    desc: 'Enterprise web apps, executive BI dashboards, and custom operational digital systems.',
    bg: 'linear-gradient(145deg, #064E3B 0%, #047857 100%)', // Deep Emerald
    badgeColor: '#6EE7B7',
    icon: TrendingUp,
    contactParam: 'Private Sector & Corporate Enterprises'
  }
];

// Core Consulting Pillars (Lean Methodologies replaces AI Solutions, all high-contrast solid gradients)
const consultingPillars = [
  {
    title: 'Digital Transformation',
    desc: 'End-to-end digital strategy and custom software engineering to modernise manual operations.',
    bg: 'linear-gradient(135deg, #0B132B 0%, #1E40AF 100%)',
    icon: '🚀',
    subServices: [
      'Digital Strategy & Architecture',
      'Custom Systems & Web Applications',
      'Cloud Edge Hosting & DNS Security',
      'Real-Time BI Telemetry Dashboards',
      'Change Management for Adoption'
    ]
  },
  {
    title: 'Business Process Management',
    desc: 'Analysing, streamlining, and digitising operational workflows for maximum throughput.',
    bg: 'linear-gradient(135deg, #064E3B 0%, #0D9488 100%)',
    icon: '⚙️',
    subServices: [
      'BPMN 2.0 Process Documentation',
      'Bottleneck Analysis & Cycle Optimization',
      'Standard Operating Procedures (SOPs)',
      'Cascaded KPI Trees & Metrics',
      'Paperless Digital Form Pipelines'
    ]
  },
  {
    title: 'Organisational Development',
    desc: 'Aligning people, reporting structures, and workplace culture to eliminate performance silos.',
    bg: 'linear-gradient(135deg, #78350F 0%, #C2410C 100%)',
    icon: '🏛️',
    subServices: [
      'Organisational Restructuring',
      'Daily Visual Tier Review Rhythms',
      'Cross-Shift Performance Communication',
      'Performance Management Systems',
      'Workforce Alignment & Culture Building'
    ]
  },
  {
    title: 'Skills Development',
    desc: 'Practical, industry-aligned capacity building equipping teams to manage digital and lean operations.',
    bg: 'linear-gradient(135deg, #3B0764 0%, #7E22CE 100%)',
    icon: '🎓',
    subServices: [
      '5S Workplace Management',
      'Standard Operating Procedures (SOPs)',
      'Workplace-Based Problem Solving',
      'Cycle Variance & Time Studies',
      'Digital Web & Systems Administration'
    ]
  },
  {
    title: 'Lean Methodologies',
    desc: 'Applying 5S workplace organisation, DMAIC, visual standard work, and waste reduction to streamline operations.',
    bg: 'linear-gradient(135deg, #881337 0%, #BE123C 100%)',
    icon: '⚡',
    subServices: [
      '5S Physical & Digital Workplace Organisation',
      'DMAIC 5-Phase Defect Reduction',
      'Process Waste Elimination (Muda)',
      'Visual Management & Tier Review Boards',
      'Continuous Improvement (Kaizen)'
    ]
  },
  {
    title: 'Root Cause Analysis',
    desc: 'Specialised diagnostic consulting to systematically find and eliminate safety risks and defect sources.',
    bg: 'linear-gradient(135deg, #0C4A6E 0%, #0284C7 100%)',
    icon: '🔍',
    subServices: [
      'Ishikawa (Fishbone 6M) Safety & Quality Audits',
      '5-Why Root Cause Drill-Downs',
      'Digital Corrective & Preventive Action (CAPA)',
      'Statistical Process Control (SPC)',
      'Safety Near-Miss Elimination'
    ]
  }
];

const SLIDE_DURATION = 6000;

export const Services = () => {
  const [currentPillarIdx, setCurrentPillarIdx] = useState(0);
  const [showAllPillars, setShowAllPillars] = useState(false);
  const [isPillarPaused, setIsPillarPaused] = useState(false);
  const [activeBuildIdx, setActiveBuildIdx] = useState(0);
  const [isBuildPaused, setIsBuildPaused] = useState(false);
  const [activeSectorIdx, setActiveSectorIdx] = useState(0);
  const [isSectorPaused, setIsSectorPaused] = useState(false);

  const navigate = useNavigate();
  const { trackClick } = useAnalytics();

  // Auto-advance Build slideshow
  useEffect(() => {
    if (isBuildPaused) return;
    const timer = setInterval(() => setActiveBuildIdx(prev => (prev + 1) % buildSolutions.length), 4000);
    return () => clearInterval(timer);
  }, [isBuildPaused]);

  // Auto-advance Sectors slideshow
  useEffect(() => {
    if (isSectorPaused) return;
    const timer = setInterval(() => setActiveSectorIdx(prev => (prev + 1) % targetSectors.length), 4000);
    return () => clearInterval(timer);
  }, [isSectorPaused]);

  // Pillars auto-advance
  const goNextPillar = useCallback(() => {
    if (currentPillarIdx >= consultingPillars.length - 1) {
      setShowAllPillars(true);
    } else {
      setCurrentPillarIdx(prev => prev + 1);
    }
  }, [currentPillarIdx]);

  const goPrevPillar = useCallback(() => {
    setShowAllPillars(false);
    setCurrentPillarIdx(prev => Math.max(0, prev - 1));
  }, []);

  useEffect(() => {
    if (isPillarPaused || showAllPillars) return;
    const timer = setTimeout(() => goNextPillar(), SLIDE_DURATION);
    return () => clearTimeout(timer);
  }, [currentPillarIdx, isPillarPaused, showAllPillars, goNextPillar]);

  const activeBuild = buildSolutions[activeBuildIdx];
  const activeSector = targetSectors[activeSectorIdx];
  const currentPillar = consultingPillars[currentPillarIdx];
  const BuildIcon = activeBuild.icon;
  const SectorIcon = activeSector.icon;

  return (
    <div className="services-root">

      {/* ── 1. HERO ── */}
      <section className="services-hero">
        <div className="container max-w-4xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 text-turquoise text-xs font-bold uppercase tracking-wider mb-3 border border-white/15">
            <Sparkles size={14} /> Our Services
          </div>
          <h1 className="text-3xl md:text-5xl font-black mb-3 tracking-tight text-white">
            Aligning People, Processes &amp; Technology
          </h1>
          <p className="text-sm md:text-base text-gray-200 max-w-2xl mx-auto leading-relaxed mb-6">
            Strategic consulting, workforce training, and custom digital systems — built to turn operational friction into disciplined execution.
          </p>

          {/* Service badges */}
          <div className="flex flex-wrap items-center justify-center gap-2 max-w-3xl mx-auto mb-8">
            <span className="px-3 py-1.5 rounded-xl bg-white/10 text-white text-xs font-semibold border border-white/20">🎓 Skills Development</span>
            <span className="px-3 py-1.5 rounded-xl bg-white/10 text-white text-xs font-semibold border border-white/20">🔄 Culture Change</span>
            <span className="px-3 py-1.5 rounded-xl bg-white/10 text-white text-xs font-semibold border border-white/20">🌐 Website Designing &amp; Hosting</span>
            <span className="px-3 py-1.5 rounded-xl bg-white/10 text-white text-xs font-semibold border border-white/20">⚡ Lean Methodologies</span>
            <span className="px-3 py-1.5 rounded-xl bg-white/10 text-white text-xs font-semibold border border-white/20">💻 Custom Apps &amp; Systems</span>
            <span className="px-3 py-1.5 rounded-xl bg-turquoise/20 text-turquoise text-xs font-bold border border-turquoise/40">🌍 Nationwide &amp; International</span>
          </div>

          <div className="flex flex-wrap justify-center gap-3">
            <Link
              to="/contact?enquiry_type=Operational%20Turnaround%20%26%20Performance%20Alignment&challenge=smelting_turnaround"
              className="btn btn-nexa-turquoise flex items-center gap-2 font-bold px-6 py-2.5 shadow-md"
              onClick={() => trackClick('Services Hero Turnaround')}
            >
              <span>Request Operational Turnaround</span>
              <ArrowRight size={15} />
            </Link>
            <Link
              to="/contact?enquiry_type=Custom%20Digital%20System%20%2F%20App%20%2F%20Website%20Build"
              className="btn btn-nexa-turquoise flex items-center gap-2 font-bold px-6 py-2.5 shadow-md"
              onClick={() => trackClick('Services Hero System Build')}
            >
              <span>Commission a System Build</span>
              <ArrowRight size={15} />
            </Link>
          </div>
        </div>
      </section>

      {/* ── 2. WHAT WE CAN BUILD FOR YOU ── */}
      <section className="py-16 px-4 bg-glacial">
        <div className="container max-w-lg mx-auto text-center">
          <div className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full bg-navy/5 text-navy text-xs font-bold uppercase tracking-wider mb-3 border border-navy/10">
            <Laptop size={13} /> Engineering Capabilities
          </div>
          <h2 className="text-2xl md:text-3xl font-extrabold text-navy tracking-tight mb-1">
            What We Can Build For You
          </h2>
          <p className="text-xs text-gray-500 mb-8">
            Custom digital systems, mobile apps, websites, and workflow platforms engineered for your company.
          </p>

          {/* 3D Rotating Slideshow — rock-solid fixed dimensions */}
          <div className="pillar-card-stage">
            <AnimatePresence mode="wait">
              <motion.div
                key={activeBuildIdx}
                initial={{ opacity: 0, rotateY: 90, scale: 0.85 }}
                animate={{ opacity: 1, rotateY: 0, scale: 1 }}
                exit={{ opacity: 0, rotateY: -90, scale: 0.85 }}
                transition={{ duration: 0.45 }}
                onHoverStart={() => setIsBuildPaused(true)}
                onHoverEnd={() => setIsBuildPaused(false)}
                onClick={() => {
                  trackClick(`Build: ${activeBuild.title}`);
                  navigate('/contact?enquiry_type=Custom%20Digital%20System%20%2F%20App%20%2F%20Website%20Build');
                }}
                className="pillar-3d-card"
                style={{
                  background: activeBuild.bg,
                  zIndex: 1
                }}
              >
                <div className="pillar-card-icon-wrap">
                  <BuildIcon size={22} />
                </div>
                <span 
                  className="pillar-card-category"
                  style={{ color: activeBuild.badgeColor }}
                >
                  {activeBuild.category}
                </span>
                <h4 className="pillar-card-title">
                  {activeBuild.title}
                </h4>
                <p className="pillar-card-desc">
                  {activeBuild.desc}
                </p>
                <span className="pillar-card-btn">
                  <span>Enquire To Build</span>
                  <ArrowRight size={13} />
                </span>
              </motion.div>
            </AnimatePresence>
          </div>

          {/* Indicator dots */}
          <div className="slideshow-dots-row">
            {buildSolutions.map((_, idx) => (
              <button
                key={idx}
                onClick={() => { setActiveBuildIdx(idx); trackClick(`Build Dot ${idx + 1}`); }}
                className={`slideshow-dot ${activeBuildIdx === idx ? 'active' : ''}`}
                aria-label={`Build slide ${idx + 1}`}
              />
            ))}
          </div>
        </div>
      </section>

      {/* ── 3. OUR WORK WORKS EVERYWHERE ── */}
      <section className="py-16 px-4 bg-white">
        <div className="container max-w-lg mx-auto text-center">
          <div className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full bg-emerald/10 text-emerald text-xs font-bold uppercase tracking-wider mb-3 border border-emerald/20">
            Cross-Industry Impact
          </div>
          <h2 className="text-2xl md:text-3xl font-extrabold text-navy tracking-tight mb-1">
            Our work works everywhere
          </h2>
          <p className="text-xs text-gray-500 mb-8">
            Different industries. Same principles. Improved results. Tailored to your needs.
          </p>

          {/* 3D Rotating Slideshow — rock-solid fixed dimensions */}
          <div className="pillar-card-stage">
            <AnimatePresence mode="wait">
              <motion.div
                key={activeSectorIdx}
                initial={{ opacity: 0, rotateY: 90, scale: 0.85 }}
                animate={{ opacity: 1, rotateY: 0, scale: 1 }}
                exit={{ opacity: 0, rotateY: -90, scale: 0.85 }}
                transition={{ duration: 0.45 }}
                onHoverStart={() => setIsSectorPaused(true)}
                onHoverEnd={() => setIsSectorPaused(false)}
                onClick={() => {
                  trackClick(`Sector: ${activeSector.title}`);
                  navigate(`/contact?industry=${encodeURIComponent(activeSector.contactParam)}`);
                }}
                className="pillar-3d-card"
                style={{
                  background: activeSector.bg,
                  zIndex: 1
                }}
              >
                <div className="pillar-card-icon-wrap">
                  <SectorIcon size={22} />
                </div>
                <span 
                  className="pillar-card-category"
                  style={{ color: activeSector.badgeColor }}
                >
                  {activeSector.category}
                </span>
                <h4 className="pillar-card-title">
                  {activeSector.title}
                </h4>
                <p className="pillar-card-desc">
                  {activeSector.desc}
                </p>
                <span className="pillar-card-btn">
                  <span>Consult For Sector</span>
                  <ArrowRight size={13} />
                </span>
              </motion.div>
            </AnimatePresence>
          </div>

          {/* Indicator dots */}
          <div className="slideshow-dots-row">
            {targetSectors.map((_, idx) => (
              <button
                key={idx}
                onClick={() => { setActiveSectorIdx(idx); trackClick(`Sector Dot ${idx + 1}`); }}
                className={`slideshow-dot ${activeSectorIdx === idx ? 'active' : ''}`}
                aria-label={`Sector slide ${idx + 1}`}
              />
            ))}
          </div>

          {/* Sector names listed below the slideshow */}
          <div className="sector-tags-row">
            {targetSectors.map((sec, idx) => (
              <button
                key={idx}
                onClick={() => { setActiveSectorIdx(idx); trackClick(`Sector Tag: ${sec.title}`); }}
                className={`sector-tag-btn ${activeSectorIdx === idx ? 'active' : ''}`}
              >
                {sec.title}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* ── 4. CORE CONSULTING PILLARS ── */}
      <section className="services-content-section py-14 px-4 bg-glacial">
        <div className="container max-w-5xl mx-auto">

          <div className="text-center max-w-2xl mx-auto mb-6">
            <span className="inline-block px-3 py-0.5 rounded-full bg-navy/5 text-navy text-xs font-bold uppercase tracking-wider mb-2">
              Advisory &amp; Implementation
            </span>
            <h2 className="text-2xl md:text-3xl font-extrabold text-navy tracking-tight mb-1">
              Core Consulting Pillars
            </h2>
            <p className="text-xs md:text-sm text-gray-500">
              Practical intervention domains aligning your workforce and workflows.
            </p>
          </div>

          {/* Controls */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-2">
              {consultingPillars.map((_, idx) => (
                <button
                  key={idx}
                  onClick={() => { setShowAllPillars(false); setCurrentPillarIdx(idx); trackClick(`Pillar Slide ${idx + 1}`); }}
                  className={`indicator-dot ${idx === currentPillarIdx && !showAllPillars ? 'active' : 'inactive'}`}
                  aria-label={`Go to pillar ${idx + 1}`}
                />
              ))}
            </div>

            <div className="flex gap-2 items-center">
              <button
                onClick={() => { setShowAllPillars(!showAllPillars); trackClick('Pillars Toggle View'); }}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white border border-gray-300 text-navy font-semibold text-xs hover:bg-gray-50 transition-colors shadow-sm"
              >
                <Grid size={14} />
                {showAllPillars ? 'Slideshow' : 'View All (6)'}
              </button>
              <button
                onClick={() => { setIsPillarPaused(p => !p); trackClick('Pillars Pause Toggle'); }}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold border transition-colors shadow-sm ${
                  isPillarPaused ? 'bg-navy text-white border-navy' : 'bg-white text-navy border-gray-300 hover:bg-gray-50'
                }`}
              >
                {isPillarPaused ? '▶ Resume' : '⏸ Pause'}
              </button>
            </div>
          </div>

          {/* Slide View */}
          {!showAllPillars ? (
            <div className="flex flex-col">
              <AnimatePresence mode="wait">
                <motion.div
                  key={currentPillarIdx}
                  initial={{ scale: 0.94, opacity: 0, y: 20 }}
                  animate={{ scale: 1, opacity: 1, y: 0 }}
                  exit={{ scale: 0.94, opacity: 0, y: -20 }}
                  transition={{ type: 'spring', stiffness: 220, damping: 24 }}
                  onHoverStart={() => setIsPillarPaused(true)}
                  onHoverEnd={() => setIsPillarPaused(false)}
                  className="service-slide-card shadow-2xl"
                  style={{
                    background: currentPillar.bg,
                    border: '1px solid rgba(255, 255, 255, 0.2)'
                  }}
                >
                  <div className="service-slide-inner">
                    <div className="service-slide-info">
                      <div className="service-slide-icon text-3xl mb-2">{currentPillar.icon}</div>
                      <h3 className="service-slide-title text-xl md:text-2xl font-bold mb-2 text-white">
                        {currentPillar.title}
                      </h3>
                      <p className="service-slide-desc text-xs md:text-sm text-gray-100 mb-4 leading-relaxed">
                        {currentPillar.desc}
                      </p>
                      <Link
                        to={`/contact?service=${encodeURIComponent(currentPillar.title)}&enquiry_type=Operational%20Turnaround%20%26%20Performance%20Alignment`}
                        className="service-slide-btn"
                        style={{ backgroundColor: '#FFFFFF', color: '#0B132B', fontWeight: 'bold' }}
                      >
                        Book Consultation &rarr;
                      </Link>
                    </div>

                    <div className="service-slide-offerings">
                      <div className="service-slide-offerings-title text-xs uppercase font-bold text-white/90 mb-2">
                        Key Capabilities
                      </div>
                      <ul className="service-slide-list space-y-1.5">
                        {currentPillar.subServices.map((sub, i) => (
                          <li key={i} className="service-slide-list-item text-xs text-white">
                            <span style={{ color: '#67E8F9' }}>✦</span>
                            <span>{sub}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>

                  {!isPillarPaused && (
                    <div className="absolute bottom-0 left-0 w-full h-1 bg-white/20">
                      <motion.div
                        className="h-full bg-white/70"
                        initial={{ width: '0%' }}
                        animate={{ width: '100%' }}
                        transition={{ duration: SLIDE_DURATION / 1000, ease: 'linear' }}
                      />
                    </div>
                  )}
                </motion.div>
              </AnimatePresence>

              {/* Navigation arrows */}
              <div className="flex justify-between items-center mt-3">
                <button
                  onClick={() => { goPrevPillar(); trackClick('Pillars Prev'); }}
                  disabled={currentPillarIdx === 0}
                  className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-white border border-gray-300 text-navy font-semibold text-xs shadow-sm hover:bg-gray-50 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
                >
                  <ChevronLeft size={16} /> Previous
                </button>
                <span className="text-gray-500 font-semibold text-xs">
                  {currentPillarIdx + 1} of {consultingPillars.length}
                </span>
                <button
                  onClick={() => { goNextPillar(); trackClick('Pillars Next'); }}
                  className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-navy text-white font-semibold text-xs shadow-md hover:bg-opacity-90 transition-all"
                >
                  {currentPillarIdx === consultingPillars.length - 1 ? 'View All' : 'Next'} <ChevronRight size={16} />
                </button>
              </div>
            </div>
          ) : (
            /* All Pillars Grid */
            <motion.div key="all-pillars" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
                {consultingPillars.map((pillar, i) => (
                  <motion.div
                    key={pillar.title}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.05 }}
                    onClick={() => { setShowAllPillars(false); setCurrentPillarIdx(i); trackClick(`Pillar Card ${i + 1}`); }}
                    className="rounded-2xl p-5 text-white shadow-xl cursor-pointer hover:shadow-2xl hover:-translate-y-1 transition-all flex flex-col justify-between"
                    style={{
                      background: pillar.bg,
                      minHeight: '190px',
                      border: '1px solid rgba(255, 255, 255, 0.2)'
                    }}
                  >
                    <div>
                      <div className="text-2xl mb-2">{pillar.icon}</div>
                      <h4 className="text-lg font-bold text-white mb-1.5">{pillar.title}</h4>
                      <p className="text-gray-100 text-xs leading-relaxed">{pillar.desc}</p>
                    </div>
                    <div className="mt-3 text-xs font-bold text-cyan-200 flex items-center gap-1">
                      <span>Explore details</span> &rarr;
                    </div>
                  </motion.div>
                ))}
              </div>
              <div className="text-center">
                <button
                  onClick={() => { setShowAllPillars(false); setCurrentPillarIdx(0); trackClick('Pillars Back to Slideshow'); }}
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-navy text-white text-xs font-bold hover:bg-opacity-90 transition-all shadow-md"
                >
                  ← Back to Slideshow
                </button>
              </div>
            </motion.div>
          )}

        </div>
      </section>

      {/* ── 4B. QUANTIFIED OPERATIONAL TRANSFORMATION CASE STUDIES ── */}
      <section className="py-16 px-4 bg-white border-t border-b border-gray-100">
        <div className="container max-w-5xl mx-auto">
          <div className="text-center max-w-2xl mx-auto mb-10">
            <span className="inline-block px-3 py-0.5 rounded-full bg-emerald/10 text-emerald text-xs font-bold uppercase tracking-wider mb-2 border border-emerald/20">
              Proven Measurable Impact
            </span>
            <h2 className="text-2xl md:text-3xl font-extrabold text-navy tracking-tight mb-2">
              Quantified Transformation Results
            </h2>
            <p className="text-xs md:text-sm text-gray-500">
              We measure our advisory and technology engineering by the hours recovered, latency eliminated, and bottom-line stability delivered.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Case 1 */}
            <div className="p-6 rounded-2xl bg-glacial border border-gray-200/80 hover:shadow-md transition-shadow flex flex-col justify-between">
              <div>
                <div className="text-2xl md:text-3xl font-black text-emerald mb-1">
                  18 hrs / wk
                </div>
                <div className="text-xs font-bold text-navy uppercase tracking-wider mb-3">
                  Supervisory Time Recaptured
                </div>
                <p className="text-xs text-gray-600 leading-relaxed mb-4">
                  Manual shift reconciliations and fragmented WhatsApp handoffs created production blindspots. Using <strong>DMAIC root-cause analysis</strong>, we standardized handover procedures and deployed a digital supervisory telemetry board.
                </p>
              </div>
              <div className="pt-3 border-t border-gray-200 text-[11px] font-semibold text-gray-500">
                Sector: Manufacturing &amp; Industrial Operations
              </div>
            </div>

            {/* Case 2 */}
            <div className="p-6 rounded-2xl bg-glacial border border-gray-200/80 hover:shadow-md transition-shadow flex flex-col justify-between">
              <div>
                <div className="text-2xl md:text-3xl font-black text-teal-600 mb-1">
                  65% Latency Cut
                </div>
                <div className="text-xs font-bold text-navy uppercase tracking-wider mb-3">
                  Workflow Dispatch Velocity
                </div>
                <p className="text-xs text-gray-600 leading-relaxed mb-4">
                  Multi-tier client requests suffered from duplicate entries and lost email approvals. We engineered a <strong>custom operational dispatch portal</strong> with automated role routing and instant digital sign-off telemetry.
                </p>
              </div>
              <div className="pt-3 border-t border-gray-200 text-[11px] font-semibold text-gray-500">
                Sector: Commercial Logistics &amp; Enterprise Services
              </div>
            </div>

            {/* Case 3 */}
            <div className="p-6 rounded-2xl bg-glacial border border-gray-200/80 hover:shadow-md transition-shadow flex flex-col justify-between">
              <div>
                <div className="text-2xl md:text-3xl font-black text-blue-600 mb-1">
                  100% Digital PoE
                </div>
                <div className="text-xs font-bold text-navy uppercase tracking-wider mb-3">
                  Audit-Ready Evidence Compliance
                </div>
                <p className="text-xs text-gray-600 leading-relaxed mb-4">
                  Physical training binders and paper declarations delayed institutional verification by weeks. Deployed the <strong>NexaTransform Hub LMIS</strong> with cryptographic timestamps and instant public document verification.
                </p>
              </div>
              <div className="pt-3 border-t border-gray-200 text-[11px] font-semibold text-gray-500">
                Sector: Corporate Workforce Enablement
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── 5. CTA ── */}
      <section className="py-14 px-4 bg-navy text-white text-center">
        <div className="container max-w-3xl mx-auto">
          <h2 className="text-2xl md:text-4xl font-extrabold mb-3 tracking-tight">
            Ready to Align Your People, Processes &amp; Technology?
          </h2>
          <p className="text-xs md:text-sm text-gray-300 mb-4 max-w-xl mx-auto leading-relaxed">
            Whether you need an operational turnaround, Lean standardisation, or custom digital systems built from the ground up — we are ready.
          </p>
          <p className="text-xs text-turquoise font-bold uppercase tracking-wider mb-6">
            🌍 Service Coverage: Nationwide &amp; International
          </p>
          <div className="flex flex-wrap justify-center gap-3">
            <Link
              to="/contact?enquiry_type=Operational%20Turnaround%20%26%20Performance%20Alignment&challenge=smelting_turnaround"
              className="btn btn-nexa-turquoise flex items-center gap-2 font-bold px-6 py-3 text-xs md:text-sm shadow-lg"
            >
              <span>Book an Operational Consultation</span>
              <ArrowRight size={15} />
            </Link>
            <Link
              to="/contact?enquiry_type=Custom%20Digital%20System%20%2F%20App%20%2F%20Website%20Build"
              className="btn btn-nexa-turquoise flex items-center gap-2 font-bold px-6 py-3 text-xs md:text-sm shadow-lg"
            >
              <span>Commission a System Build</span>
              <ArrowRight size={15} />
            </Link>
          </div>
        </div>
      </section>

    </div>
  );
};

export default Services;
