import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useKineticCanvas } from '../hooks/useKineticCanvas';
import { Link, useNavigate } from 'react-router-dom';
import {
  ArrowRight,
  ChevronLeft,
  ChevronRight,
  Cpu,
  Workflow,
  Users,
  TrendingUp,
  FileCheck,
  Target,
  BarChart3,
  Search,
  Sparkles,
  Globe,
  BookOpen
} from 'lucide-react';
import { useData } from '../context/DataContext';
import { useAnalytics } from '../context/AnalyticsContext';
import { sendInstitutionalEmail } from '../utils/emailNotifier';
import './Home.css';

const skillsProgrammes = [
  {
    title: 'Applied Digital Skills & Enterprise Web Management',
    slug: '/training-academy/applied-digital-skills-web-management',
    desc: 'Learn how to architect, design, launch, and manage modern websites, cloud edge hosting, professional business email, SEO, and POPIA compliance without code.',
    badge: 'High Demand',
    icon: Globe
  },
  {
    title: 'Digital Transformation',
    slug: '/training-academy/digital-transformation-leadership',
    desc: 'Learn how organisations use digital tools, automation, dashboards and data to improve processes, reduce manual work and support better decision-making.',
    badge: 'Technology Strategy',
    icon: Cpu
  },
  {
    title: 'Business Process Management',
    slug: '/training-academy/process-mapping-fundamentals',
    desc: 'Learn how to map, analyse and improve business processes using practical tools such as process maps, SIPOC, flowcharts and As-Is and To-Be analysis.',
    badge: 'Process Optimisation',
    icon: Workflow
  },
  {
    title: 'Organisational Development',
    slug: '/training-academy/organisational-development',
    desc: 'Understand how people, processes, structures and workplace culture influence performance, teamwork and operational effectiveness.',
    badge: 'People & Culture',
    icon: Users
  },
  {
    title: 'Change Management',
    slug: '/training-academy/change-management',
    desc: 'Learn how structured approaches help teams adopt new systems, processes and ways of working with less resistance and higher engagement.',
    badge: 'Transformation',
    icon: TrendingUp
  },
  {
    title: 'Work Standardisation',
    slug: '/training-academy/work-standardisation',
    desc: 'Create clear standard operating procedures (SOPs), visual guides and best practice workflows to ensure consistency, quality and safety.',
    badge: 'Quality & SOPs',
    icon: FileCheck
  },
  {
    title: 'DMAIC',
    slug: '/training-academy/dmaic',
    desc: 'Learn the structured problem-solving framework — Define, Measure, Analyse, Improve, Control — to systematically solve operational problems.',
    badge: 'Continuous Improvement',
    icon: Target
  },
  {
    title: 'Performance Management Systems',
    slug: '/training-academy/performance-management-systems',
    desc: 'Design practical systems to set goals, track KPIs, evaluate performance and drive accountability across teams.',
    badge: 'Operational Excellence',
    icon: BarChart3
  },
  {
    title: 'Root Cause Analysis',
    slug: '/training-academy/root-cause-analysis',
    desc: 'Use structured techniques like 5 Whys, Ishikawa (Fishbone) diagrams and fault trees to identify the true root causes of operational issues.',
    badge: 'Problem Solving',
    icon: Search
  }
];

const services = [
  {
    title: 'Digital Transformation',
    category: 'Technology Strategy',
    audience: 'For Organisations',
    skills: [
      'Digital strategy development',
      'Process automation & digitisation',
      'Cloud migration & integration',
      'Data analytics & BI',
      'Change management for digital adoption'
    ],
    color: 'from-blue-500/40 to-indigo-600/40'
  },
  {
    title: 'Business Process Management',
    category: 'Process Optimisation',
    audience: 'For Organisations',
    skills: [
      'Process mapping & documentation (BPMN)',
      'Workflow analysis & optimisation',
      'SOPs',
      'Performance measurement & KPIs',
      'Lean & continuous improvement'
    ],
    color: 'from-emerald-500/40 to-teal-600/40'
  },
  {
    title: 'Organisational Development',
    category: 'People & Culture',
    audience: 'For Organisations',
    skills: [
      'Org design & structuring',
      'Elements of the OD process',
      'Types of interventions in OD',
      'OD techniques',
      'Performance management systems'
    ],
    color: 'from-amber-500/40 to-orange-600/40'
  },
  {
    title: 'Skills Development',
    category: 'Training & Capacity',
    audience: 'For Individuals / Learners',
    skills: [
      '5S (Workplace Management)',
      'Time Studies Methodologies',
      'Workplace-based skills',
      'Structured Problem-Solving',
      'Work Standardization'
    ],
    color: 'from-purple-500/40 to-fuchsia-600/40'
  },
  {
    title: 'AI Solutions',
    category: 'Intelligent Automation',
    audience: 'For Organisations',
    skills: [
      'Enterprise AI readiness & strategy',
      'Intelligent workflow automation',
      'Predictive data analytics & BI',
      'Generative AI workplace integration',
      'Ethical AI governance & safety'
    ],
    color: 'from-violet-500/40 to-purple-600/40'
  },
  {
    title: 'Root Cause Analysis',
    category: 'Institutional Development',
    audience: 'For Organisations',
    skills: [
      'Fishbone/Ishikawa Diagram',
      'Business Process Re-engineering',
      '5 Why',
      'Pareto Analysis',
      'Statistical Process Control',
      'Structured Problem-Solving'
    ],
    color: 'from-cyan-500/40 to-blue-600/40'
  }
];

const processStages = [
  { id: 1, name: 'Current State', desc: 'Comprehensive assessment of existing workflows, systems, and capabilities.' },
  { id: 2, name: 'Process Analysis', desc: 'Identifying bottlenecks, redundancies, and opportunities for optimisation.' },
  { id: 3, name: 'Improvement Design', desc: 'Architecting streamlined, efficient, and future-ready processes.' },
  { id: 4, name: 'Technology Integration', desc: 'Deploying digital tools and automation to support the new processes.' },
  { id: 5, name: 'Training', desc: 'Upskilling teams and managing change for seamless adoption.' },
  { id: 6, name: 'Continuous Improvement', desc: 'Monitoring KPIs and iterating for sustained operational excellence.' }
];

export const Home = () => {
  const canvasRef = useKineticCanvas({ particles: 100 });
  const navigate = useNavigate();
  const [activeStageIndex, setActiveStageIndex] = useState(0);
  const [slideDirection, setSlideDirection] = useState(1); // 1 = forward, -1 = backward
  const [activePillarIndex, setActivePillarIndex] = useState(0);
  const [isPillarsPaused, setIsPillarsPaused] = useState(false);
  const lastClickTime = useRef(0);
  const [email, setEmail] = useState('');
  const { addLead } = useData();
  const { trackClick } = useAnalytics();
  const [formStatus, setFormStatus] = useState('');

  // Slug map: pillar title → destination route
  const pillarLinks = {
    'Applied Digital Skills and Enterprise Web Management': '/training-academy/applied-digital-skills-web-management',
    'Applied Digital Skills':       '/training-academy/applied-digital-skills-web-management',
    'Digital Transformation':       '/training-academy/digital-transformation-leadership',
    'Business Process Management':  '/training-academy/process-mapping-fundamentals',
    'Organisational Development':   '/training-academy/organisational-development',
    'Skills Development':           '/training-academy',
    'AI Solutions':                 '/training-academy/ai-solutions',
    'Root Cause Analysis':          '/training-academy/root-cause-analysis',
  };

  // Auto-play Pillars
  useEffect(() => {
    if (isPillarsPaused) return;
    const interval = setInterval(() => {
      setActivePillarIndex((prev) => (prev + 1) % services.length);
    }, 4000);
    return () => clearInterval(interval);
  }, [isPillarsPaused]);

  const handleCtaSubmit = (e) => {
    e.preventDefault();
    if (!email) return;
    
    trackClick('Home Page CTA Submit');
    const submittedEmail = email;
    
    addLead({
      name: 'Website Visitor',
      email: submittedEmail,
      enquiry_type: 'Schedule Consultation',
      message: 'Quick consultation / partner inquiry submitted via Home page CTA.',
      audience_type: 'Organisation'
    });

    sendInstitutionalEmail({
      to: 'enquiries@nexa-transform.com',
      subject: `[Home CTA Consultation Request] ${submittedEmail}`,
      html: `
        <h2>New Consultation Request from Home Page</h2>
        <p>A website visitor requested to partner / schedule a consultation:</p>
        <p><strong>Email:</strong> <a href="mailto:${submittedEmail}">${submittedEmail}</a></p>
        <p><strong>Type:</strong> Schedule Consultation / Partnership</p>
      `,
      from: 'NexaTransform Hub <admissions@nexa-transform.com>',
      reply_to: submittedEmail
    }).catch(() => {});

    setFormStatus('success');
    setEmail('');
    setTimeout(() => setFormStatus(''), 4000);
  };

  const nextProcessStage = () => {
    const now = Date.now();
    if (now - lastClickTime.current < 450) return;
    lastClickTime.current = now;
    setSlideDirection(1);
    setActiveStageIndex((prev) => (prev + 1) % processStages.length);
    trackClick('Methodology Slideshow Next');
  };

  const prevProcessStage = () => {
    const now = Date.now();
    if (now - lastClickTime.current < 450) return;
    lastClickTime.current = now;
    setSlideDirection(-1);
    setActiveStageIndex((prev) => (prev - 1 + processStages.length) % processStages.length);
    trackClick('Methodology Slideshow Prev');
  };

  const goToStage = (idx) => {
    if (idx === activeStageIndex) return;
    const now = Date.now();
    if (now - lastClickTime.current < 450) return;
    lastClickTime.current = now;
    setSlideDirection(idx > activeStageIndex ? 1 : -1);
    setActiveStageIndex(idx);
    trackClick(`Methodology Stage ${idx + 1}`);
  };

  const activePillar = services[activePillarIndex];

  return (
    <div className="home-root">
      {/* Hero Section */}
      <section className="hero-section overflow-hidden">
        <canvas ref={canvasRef} className="hero-canvas" />
        <div className="container hero-container relative z-10">
          <div className="hero-content">
            <motion.h1 
              className="hero-title"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              Transforming Organisations Through <span className="gradient-text">Process, People & Technology</span>
            </motion.h1>
            <motion.p 
              className="hero-tagline"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
            >
              Empowering forward-thinking organisations with premium digital platforms, seamless workflows, and industry-aligned skills programmes.
            </motion.p>
            <motion.div 
              className="hero-ctas"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              <Link 
                to="/contact" 
                className="btn btn-primary"
                onClick={() => trackClick('Hero Schedule Consultation')}
              >
                Schedule Consultation
              </Link>
              <Link 
                to="/training-academy" 
                className="btn btn-hero-secondary"
                onClick={() => trackClick('Hero Module Catalogue')}
              >
                <BookOpen size={18} />
                <span>Module Catalogue</span>
              </Link>
            </motion.div>
            <motion.div 
              className="hero-trust"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 1, delay: 0.5 }}
            >
              <p>Trusted by industry leaders & forward-thinking institutions</p>
            </motion.div>
          </div>
          
          <motion.div 
            className="hero-visual"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.3 }}
          >
            {/* Pillars Slideshow */}
            <div className="w-full max-w-sm mx-auto perspective-1000">
              <h3 className="text-xl font-bold mb-6 text-white text-center tracking-wider uppercase text-opacity-80">Our Pillars</h3>
              <div className="relative h-64">
                <AnimatePresence mode="wait">
                  <motion.div
                    key={activePillarIndex}
                    initial={{ opacity: 0, rotateY: 90, scale: 0.8 }}
                    animate={{ opacity: 1, rotateY: 0, scale: 1 }}
                    exit={{ opacity: 0, rotateY: -90, scale: 0.8 }}
                    transition={{ duration: 0.5 }}
                    onHoverStart={() => setIsPillarsPaused(true)}
                    onHoverEnd={() => setIsPillarsPaused(false)}
                    onClick={() => {
                      const dest = pillarLinks[activePillar.title] || '/services';
                      trackClick(`Pillar Navigate: ${activePillar.title}`);
                      navigate(dest);
                    }}
                    className={`absolute inset-0 rounded-2xl p-6 flex flex-col justify-center items-center text-center shadow-2xl backdrop-blur-md bg-gradient-to-br ${activePillar.color} border border-white/20 cursor-pointer`}
                  >
                    <h4 className="text-2xl font-bold text-white mb-2">{activePillar.title}</h4>
                    <p className="text-sm text-white/80 uppercase tracking-widest mb-4">{activePillar.category}</p>
                    <span className="inline-flex items-center gap-1.5 text-xs font-semibold bg-white/20 text-white px-3 py-1.5 rounded-full backdrop-blur-sm hover:bg-white/30 transition-colors">
                      Explore <ArrowRight size={12} />
                    </span>
                  </motion.div>
                </AnimatePresence>
              </div>
              

            </div>
          </motion.div>
        </div>
      </section>

      {/* Skills Development Programmes */}
      <section className="home-skills-section">
        <div className="container">
          <div className="home-skills-header">
            <div className="home-skills-badge">
              <Sparkles size={14} /> Skills Development &amp; Transformation
            </div>
            <h2 className="home-skills-title">Skills Development Programmes</h2>
            <p className="home-skills-intro">
              Build practical workplace skills in business improvement, digital transformation, process management, organisational effectiveness and continuous improvement. Our programmes equip individuals with practical tools they can apply to improve productivity, solve problems, manage change and support better organisational performance.
            </p>
          </div>

          <div className="home-skills-grid">
            {skillsProgrammes.map((prog, idx) => {
              const Icon = prog.icon;
              return (
                <div 
                  key={idx} 
                  className={`home-skill-card ${prog.badge === 'High Demand' ? 'featured-card' : ''}`} 
                  onClick={() => navigate(prog.slug)}
                >
                  <div className="home-skill-card-top">
                    <span className="home-skill-badge">{prog.badge}</span>
                    <div className="home-skill-icon-pill">
                      <Icon size={20} />
                    </div>
                  </div>
                  <h3 className="home-skill-card-title">{prog.title}</h3>
                  <p className="home-skill-card-desc">{prog.desc}</p>
                  <div className="home-skill-card-footer">
                    <span className="home-skill-link">
                      Explore Module <ArrowRight size={14} />
                    </span>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Develop Skills That Improve Organisations Callout */}
          <div className="home-skills-callout">
            <div className="home-skills-callout-content">
              <h3 className="home-skills-callout-title">Develop Skills That Improve Organisations</h3>
              <p className="home-skills-callout-desc">
                These programmes are designed for individuals, employees, supervisors and professionals who want practical skills in continuous improvement, operational excellence, business process improvement and organisational transformation.
              </p>
            </div>
            <div className="home-skills-callout-action">
              <Link to="/training-academy" className="btn btn-primary home-skills-cta-btn">
                Explore Training Academy <ArrowRight size={18} />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Process Journey / Methodology Slideshow */}
      <section className="py-24 bg-white overflow-hidden">
        <div className="container">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Our Transformation Methodology</h2>
            <p className="text-gray-600 max-w-2xl mx-auto">A proven, interactive 6-stage approach to sustainable organisational change.</p>
          </div>

          <div className="max-w-4xl mx-auto relative px-14">
            {/* Left Arrow */}
            <button
              onClick={prevProcessStage}
              className="absolute left-0 top-1/2 -translate-y-1/2 z-20 bg-white rounded-full p-3 shadow-lg text-navy hover:text-blue transition-colors border border-gray-100"
            >
              <ChevronLeft size={24} />
            </button>

            {/* Right Arrow */}
            <button
              onClick={nextProcessStage}
              className="absolute right-0 top-1/2 -translate-y-1/2 z-20 bg-white rounded-full p-3 shadow-lg text-navy hover:text-blue transition-colors border border-gray-100"
            >
              <ChevronRight size={24} />
            </button>

            {/* Slide Container */}
            <div
              className="bg-glacial rounded-3xl shadow-xl border border-gray-100 relative overflow-hidden"
              style={{ minHeight: '300px' }}
            >
              <div className="absolute inset-0 bg-gradient-to-br from-blue-50 to-transparent opacity-50 pointer-events-none" />

              <AnimatePresence mode="wait">
                <motion.div
                  key={activeStageIndex}
                  initial={{ x: slideDirection > 0 ? 200 : -200, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  exit={{ x: slideDirection > 0 ? -200 : 200, opacity: 0 }}
                  transition={{ duration: 0.3, ease: 'easeInOut' }}
                  className="relative z-10 p-10 md:p-14 text-center w-full"
                >
                  <div className="w-16 h-16 mx-auto bg-blue text-white rounded-2xl flex items-center justify-center text-2xl font-bold mb-6 shadow-md" style={{ transform: 'rotate(3deg)' }}>
                    {processStages[activeStageIndex].id}
                  </div>
                  <h3 className="text-3xl font-bold mb-4 text-navy">
                    {processStages[activeStageIndex].name}
                  </h3>
                  <p className="text-xl text-gray-600 leading-relaxed max-w-2xl mx-auto">
                    {processStages[activeStageIndex].desc}
                  </p>
                </motion.div>
              </AnimatePresence>
            </div>

            {/* Stage Indicators */}
            <div className="flex justify-center gap-3 mt-8">
              {processStages.map((stage, idx) => (
                <button
                  key={stage.id}
                  onClick={() => goToStage(idx)}
                  className={`indicator-dot ${idx === activeStageIndex ? 'active' : 'inactive'}`}
                  aria-label={`Go to stage ${idx + 1}`}
                />
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4">
        <div className="container">
          <div className="cta-card bg-navy text-white rounded-3xl p-10 md:p-16 text-center relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-full opacity-10 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-blue-400 to-navy z-0 pointer-events-none"></div>
            <div className="relative z-10 max-w-3xl mx-auto">
              <h2 className="text-3xl md:text-5xl font-bold mb-6">Ready to Transform Your Organisation?</h2>
              <p className="text-lg text-gray-300 mb-10">
                Partner with NexaTransform Hub to drive meaningful change through expert process optimisation, digital innovation, and skills development.
              </p>
              
              <form onSubmit={handleCtaSubmit} className="flex flex-col sm:flex-row gap-4 justify-center mb-8 max-w-lg mx-auto">
                <input 
                  type="email" 
                  placeholder="Enter your work email" 
                  className="px-6 py-4 rounded-xl flex-grow text-navy focus:outline-none focus:ring-2 focus:ring-turquoise"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
                <button type="submit" className="btn btn-primary px-8 py-4 rounded-xl text-lg flex items-center gap-2">
                  Get Started <ArrowRight size={20} />
                </button>
              </form>
              
              {formStatus === 'success' && (
                <p className="text-emerald font-medium mb-4">Thanks! We'll be in touch shortly.</p>
              )}

              <div className="flex flex-wrap justify-center gap-4 text-sm text-gray-400">
                <span>No commitment required</span>
                <span className="hidden sm:inline">•</span>
                <span>Tailored consultation</span>
                <span className="hidden sm:inline">•</span>
                <span>Fast response</span>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};
