import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Target, 
  Compass, 
  Award, 
  CheckCircle, 
  HeartHandshake, 
  ThumbsUp, 
  Brain, 
  Users, 
  Heart, 
  TrendingUp, 
  BookOpen, 
  Sparkles, 
  ShieldAlert,
  Activity,
  Landmark,
  Flame,
  Factory,
  Building
} from 'lucide-react';
import './About.css';

// Mapping strings to Lucide components for dynamic icon rendering in the wheel
const iconMap = {
  HeartHandshake: HeartHandshake,
  ThumbsUp: ThumbsUp,
  Brain: Brain,
  Users: Users,
  Heart: Heart,
  TrendingUp: TrendingUp
};

const valuesData = [
  {
    id: 'integrity',
    name: 'Integrity',
    desc: 'Uphold honesty, ethics, and strong moral principles in all actions.',
    color: '#4B5563', // Slate/Gray
    lightColor: '#F3F4F6',
    icon: 'HeartHandshake',
    // Position coordinates on a 400x400 canvas
    cx: 80,
    cy: 200,
    labelX: 80,
    labelY: 165
  },
  {
    id: 'excellence',
    name: 'Excellence',
    desc: 'Strive for the highest standards in every action and outcome.',
    color: '#8B5CF6', // Purple
    lightColor: '#EEF2FF',
    icon: 'ThumbsUp',
    cx: 145,
    cy: 105,
    labelX: 145,
    labelY: 70
  },
  {
    id: 'passionate',
    name: 'Passionate',
    desc: 'Demonstrate enthusiasm and dedication in pursuing goals and aspirations.',
    color: '#EF4444', // Red
    lightColor: '#FEF2F2',
    icon: 'Brain',
    cx: 255,
    cy: 105,
    labelX: 255,
    labelY: 70
  },
  {
    id: 'collaborative',
    name: 'Collaborative',
    desc: 'Work together effectively, valuing teamwork and shared success.',
    color: '#F97316', // Orange
    lightColor: '#FFF7ED',
    icon: 'Users',
    cx: 320,
    cy: 200,
    labelX: 320,
    labelY: 165
  },
  {
    id: 'respect',
    name: 'Respect',
    desc: 'Treat everyone with dignity, fairness, and consideration.',
    color: '#FBBF24', // Yellow
    lightColor: '#FFFBEB',
    icon: 'Heart',
    cx: 255,
    cy: 295,
    labelX: 255,
    labelY: 340
  },
  {
    id: 'progressive',
    name: 'Progressive',
    desc: 'Embrace innovation, adaptability, and continuous improvement.',
    color: '#0D9488', // Teal
    lightColor: '#F0FDFA',
    icon: 'TrendingUp',
    cx: 145,
    cy: 295,
    labelX: 145,
    labelY: 340
  }
];

export const About = () => {
  const [activeValue, setActiveValue] = useState(valuesData[0]);

  const specialities = [
    'Skills Development Programme (SDP) design and implementation',
    'Organisational transformation and change management support',
    'Workplace-based learning systems and frameworks',
    'Training facilitation and curriculum development',
    'Capacity building for institutions, businesses, and communities'
  ];

  const whatWeDo = [
    {
      title: 'Skills Development & Training',
      desc: 'We develop and deliver competency-based learning programmes that equip individuals with job-ready and industry-relevant skills.',
      borderColor: 'border-turquoise'
    },
    {
      title: 'Organisational Transformation',
      desc: 'We assist organisations in navigating change, improving efficiency, and aligning their people, processes, and systems with strategic goals.',
      borderColor: 'border-blue'
    },
    {
      title: 'Workplace Learning Systems',
      desc: 'We create structured frameworks that integrate learning into the workplace, ensuring continuous development and performance improvement.',
      borderColor: 'border-gold'
    },
    {
      title: 'Consulting & Advisory Services',
      desc: 'We provide expert guidance on skills development strategies, compliance alignment, and transformation initiatives.',
      borderColor: 'border-navy'
    }
  ];

  return (
    <div className="about-root bg-white">
      {/* Hero Section */}
      <section className="about-hero bg-navy text-white py-24 px-4">
        <div className="container max-w-4xl mx-auto">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">About Us</h1>
          <p className="text-xl text-turquoise font-semibold tracking-wide uppercase">Nexa Transform Group</p>
        </div>
      </section>

      {/* Intro Section */}
      <section className="py-20 px-4 intro-section">
        <div className="container max-w-4xl mx-auto">
          <div>
            <p className="font-medium text-xl text-navy intro-text-highlight leading-relaxed">
              Nexa Transform Group is a forward-thinking skills development and transformation organisation dedicated to empowering individuals, strengthening institutions, and driving sustainable socio-economic growth across South Africa and beyond.
            </p>
          </div>
        </div>
      </section>

      {/* Who We Are */}
      <section className="py-20 px-4 bg-glacial">
        <div className="container max-w-5xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-navy mb-4">Who We Are</h2>
            <p className="text-gray-600 max-w-2xl mx-auto">We are a multidisciplinary consulting and development group specialising in key strategic areas:</p>
          </div>

          <div className="specialities-grid mb-12">
            {specialities.map((spec, idx) => (
              <div key={idx} className="speciality-card">
                <div className="w-10 h-10 rounded-xl bg-blue text-white flex items-center justify-center font-bold">
                  {idx + 1}
                </div>
                <p className="text-gray-800 font-medium">{spec}</p>
              </div>
            ))}
          </div>

          <div className="bg-white p-8 rounded-2xl border border-gray-100 max-w-3xl mx-auto text-center shadow-sm">
            <p className="text-gray-700 leading-relaxed font-medium">
              Our approach combines structured methodology with real-world application, ensuring that every solution we deliver is practical, measurable, and aligned with industry and regulatory expectations.
            </p>
          </div>
        </div>
      </section>

      {/* What We Do */}
      <section className="py-20 px-4 bg-white">
        <div className="container max-w-5xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-navy mb-4">What We Do</h2>
            <p className="text-gray-600 max-w-2xl mx-auto">At Nexa Transform Group, we design and implement solutions that enable growth at both individual and organisational levels.</p>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            {whatWeDo.map((item, idx) => (
              <div key={idx} className={`what-we-do-card border-t-4 ${item.borderColor}`}>
                <h3 className="text-2xl font-bold text-navy mb-3">{item.title}</h3>
                <p className="text-gray-600 leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Our Work Works Everywhere */}
      <section className="py-20 px-4 bg-white border-t border-b border-gray-100">
        <div className="container max-w-5xl mx-auto text-center">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-turquoise/10 text-turquoise text-xs font-bold uppercase tracking-wider mb-3">
            Cross-Industry Impact
          </div>
          <h2 className="text-3xl md:text-4xl font-bold text-navy mb-3">
            Our work works everywhere
          </h2>
          <p className="text-base text-gray-600 max-w-2xl mx-auto mb-12">
            Different industries. Same principles. Improved results. Tailored to your needs.
          </p>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 text-left">
            <div className="p-6 rounded-2xl bg-glacial border border-gray-100 hover:shadow-md transition-shadow">
              <div className="w-12 h-12 rounded-xl bg-teal-500/10 text-teal-600 flex items-center justify-center mb-4">
                <Activity size={24} />
              </div>
              <h3 className="text-lg font-bold text-navy mb-2">Hospitals and Clinics</h3>
              <p className="text-sm text-gray-600 leading-relaxed">
                Clinical SOP compliance, patient throughput optimization, digital incident tracking, and sterile supply chain workflows.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-glacial border border-gray-100 hover:shadow-md transition-shadow">
              <div className="w-12 h-12 rounded-xl bg-indigo-500/10 text-indigo-600 flex items-center justify-center mb-4">
                <Landmark size={24} />
              </div>
              <h3 className="text-lg font-bold text-navy mb-2">Banks &amp; Financial Institutions</h3>
              <p className="text-sm text-gray-600 leading-relaxed">
                Process governance, automated compliance audits, customer onboarding workflows, and operational risk mitigation.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-glacial border border-gray-100 hover:shadow-md transition-shadow">
              <div className="w-12 h-12 rounded-xl bg-rose-500/10 text-rose-600 flex items-center justify-center mb-4">
                <Flame size={24} />
              </div>
              <h3 className="text-lg font-bold text-navy mb-2">Mining &amp; Natural Resources</h3>
              <p className="text-sm text-gray-600 leading-relaxed">
                Zero-harm safety compliance, mobile field inspection apps, hazard logging, and digital shift handover telemetry.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-glacial border border-gray-100 hover:shadow-md transition-shadow">
              <div className="w-12 h-12 rounded-xl bg-amber-500/10 text-amber-600 flex items-center justify-center mb-4">
                <Factory size={24} />
              </div>
              <h3 className="text-lg font-bold text-navy mb-2">Manufacturing &amp; Heavy Industry</h3>
              <p className="text-sm text-gray-600 leading-relaxed">
                Plant turnaround, shop floor tracking, 5S workplace organisation, and digital SOP touch kiosks.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-glacial border border-gray-100 hover:shadow-md transition-shadow">
              <div className="w-12 h-12 rounded-xl bg-sky-500/10 text-sky-600 flex items-center justify-center mb-4">
                <Building size={24} />
              </div>
              <h3 className="text-lg font-bold text-navy mb-2">Government &amp; Public Sector</h3>
              <p className="text-sm text-gray-600 leading-relaxed">
                Citizen service delivery portals, digital document approval routing, and municipal KPI scorecards.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-glacial border border-gray-100 hover:shadow-md transition-shadow">
              <div className="w-12 h-12 rounded-xl bg-emerald-500/10 text-emerald-600 flex items-center justify-center mb-4">
                <TrendingUp size={24} />
              </div>
              <h3 className="text-lg font-bold text-navy mb-2">Private Sector &amp; Corporate</h3>
              <p className="text-sm text-gray-600 leading-relaxed">
                Custom enterprise web apps, client self-service, operational data pipelines, and executive dashboards.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Purpose, Vision, Mission */}
      <section className="py-20 px-4 bg-glacial">
        <div className="container max-w-5xl mx-auto">
          <div className="grid md:grid-cols-3 gap-8">
            <div className="purpose-box border-blue text-center">
              <Award size={40} className="text-blue mb-4 mx-auto" />
              <h3 className="text-2xl font-bold mb-4 text-navy">Our Purpose</h3>
              <p className="text-gray-700 leading-relaxed font-medium">
                Our purpose is to unlock human potential through structured learning, innovation, and transformation. We believe that sustainable development begins with empowered individuals and capable institutions working together to build stronger economies.
              </p>
            </div>

            <div className="purpose-box border-gold text-center">
              <Compass size={40} className="text-gold mb-4 mx-auto" />
              <h3 className="text-2xl font-bold mb-4 text-navy">Our Vision</h3>
              <p className="text-gray-700 leading-relaxed font-medium">
                To be a leading catalyst for sustainable skills development and organisational transformation in Africa, empowering individuals, institutions, and communities to unlock their full potential through innovative, practical, and future-focused solutions.
              </p>
            </div>

            <div className="purpose-box border-turquoise text-center">
              <Target size={40} className="text-turquoise mb-4 mx-auto" />
              <h3 className="text-2xl font-bold mb-4 text-navy">Our Mission</h3>
              <p className="text-gray-700 leading-relaxed font-medium">
                Nexa Transform Group is committed to delivering high-impact skills development, consulting, and transformation services that bridge the gap between education, industry, and economic opportunity. We achieve this by designing practical learning systems, supporting organisational growth, and equipping individuals with future-ready competencies that drive measurable impact in workplaces and communities.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Interactive Core Values Section */}
      <section className="py-24 px-4 bg-white overflow-hidden">
        <div className="container max-w-5xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-navy mb-4">Our Values</h2>
            <p className="text-gray-600 max-w-2xl mx-auto">Click or hover over the interactive segments below to explore the core values that shape our organizational culture.</p>
          </div>

          <div className="values-container">
            {/* Desktop Graphic Wheel (Shown on larger screens) */}
            <div className="hidden lg:block">
              <div className="values-wheel-wrapper">
                {/* SVG Ring Background & Segments */}
                <svg className="wheel-svg" viewBox="0 0 400 400">
                  {/* Gray horizontal connection bar to Integrity on the left */}
                  <line x1="200" y1="200" x2="80" y2="200" stroke="#E5E7EB" strokeWidth="12" strokeLinecap="round" />
                  
                  {/* Integrity static arc link */}
                  <path d="M 80 200 A 120 120 0 0 1 145 105" stroke="#E5E7EB" strokeWidth="4" fill="none" strokeDasharray="6 6" />
                  <path d="M 80 200 A 120 120 0 0 0 145 295" stroke="#E5E7EB" strokeWidth="4" fill="none" strokeDasharray="6 6" />

                  {/* Colorful Wheel Segments for the 5 right-side values */}
                  {/* Excellence (Purple) */}
                  <path 
                    d="M 141.2 119.1 A 100 100 0 0 1 200 100" 
                    stroke={activeValue.id === 'excellence' ? '#8B5CF6' : '#C7D2FE'} 
                    strokeWidth={activeValue.id === 'excellence' ? '28' : '20'} 
                    fill="none" 
                    className={`wheel-segment-path ${activeValue.id === 'excellence' ? 'active' : 'inactive'}`} 
                    onMouseEnter={() => setActiveValue(valuesData[1])}
                    onClick={() => setActiveValue(valuesData[1])}
                  />

                  {/* Passionate (Red) */}
                  <path 
                    d="M 200 100 A 100 100 0 0 1 258.8 119.1" 
                    stroke={activeValue.id === 'passionate' ? '#EF4444' : '#FCA5A5'} 
                    strokeWidth={activeValue.id === 'passionate' ? '28' : '20'} 
                    fill="none" 
                    className={`wheel-segment-path ${activeValue.id === 'passionate' ? 'active' : 'inactive'}`} 
                    onMouseEnter={() => setActiveValue(valuesData[2])}
                    onClick={() => setActiveValue(valuesData[2])}
                  />

                  {/* Collaborative (Orange) */}
                  <path 
                    d="M 258.8 119.1 A 100 100 0 0 1 280.9 200" 
                    stroke={activeValue.id === 'collaborative' ? '#F97316' : '#FDBA74'} 
                    strokeWidth={activeValue.id === 'collaborative' ? '28' : '20'} 
                    fill="none" 
                    className={`wheel-segment-path ${activeValue.id === 'collaborative' ? 'active' : 'inactive'}`} 
                    onMouseEnter={() => setActiveValue(valuesData[3])}
                    onClick={() => setActiveValue(valuesData[3])}
                  />

                  {/* Respect (Yellow) */}
                  <path 
                    d="M 280.9 200 A 100 100 0 0 1 258.8 280.9" 
                    stroke={activeValue.id === 'respect' ? '#FBBF24' : '#FDE68A'} 
                    strokeWidth={activeValue.id === 'respect' ? '28' : '20'} 
                    fill="none" 
                    className={`wheel-segment-path ${activeValue.id === 'respect' ? 'active' : 'inactive'}`} 
                    onMouseEnter={() => setActiveValue(valuesData[4])}
                    onClick={() => setActiveValue(valuesData[4])}
                  />

                  {/* Progressive (Teal) */}
                  <path 
                    d="M 258.8 280.9 A 100 100 0 0 1 200 300" 
                    stroke={activeValue.id === 'progressive' ? '#0D9488' : '#99F6E4'} 
                    strokeWidth={activeValue.id === 'progressive' ? '28' : '20'} 
                    fill="none" 
                    className={`wheel-segment-path ${activeValue.id === 'progressive' ? 'active' : 'inactive'}`} 
                    onMouseEnter={() => setActiveValue(valuesData[5])}
                    onClick={() => setActiveValue(valuesData[5])}
                  />

                  {/* Central Core Values Hub circle */}
                  <circle 
                    cx="200" 
                    cy="200" 
                    r="52" 
                    fill="white" 
                    stroke="#F3F4F6" 
                    strokeWidth="3" 
                    className="wheel-center-circle shadow-lg"
                  />
                  <text 
                    x="200" 
                    y="196" 
                    textAnchor="middle" 
                    fontSize="13" 
                    fontWeight="800" 
                    fill="#6B21A8" 
                    fontFamily="Montserrat, sans-serif"
                  >
                    Core
                  </text>
                  <text 
                    x="200" 
                    y="212" 
                    textAnchor="middle" 
                    fontSize="13" 
                    fontWeight="800" 
                    fill="#6B21A8" 
                    fontFamily="Montserrat, sans-serif"
                  >
                    Values
                  </text>
                </svg>

                {/* Absolutely Positioned Interactive Nodes (containing icons) */}
                {valuesData.map((val) => {
                  const Icon = iconMap[val.icon];
                  const isActive = activeValue.id === val.id;
                  return (
                    <React.Fragment key={val.id}>
                      <motion.div
                        className={`wheel-node ${isActive ? 'active' : ''}`}
                        style={{
                          left: `${val.cx}px`,
                          top: `${val.cy}px`,
                          transform: 'translate(-50%, -50%)',
                          border: isActive ? `3px solid ${val.color}` : '2px solid #E5E7EB'
                        }}
                        onMouseEnter={() => setActiveValue(val)}
                        onClick={() => setActiveValue(val)}
                        whileHover={{ scale: 1.25 }}
                      >
                        <Icon size={20} style={{ color: isActive ? val.color : '#9CA3AF' }} />
                      </motion.div>
                      <div 
                        className="wheel-node-label"
                        style={{ 
                          left: `${val.labelX}px`, 
                          top: `${val.labelY}px`,
                          transform: 'translate(-50%, -50%)',
                          color: isActive ? val.color : '#4B5563',
                          fontWeight: isActive ? 800 : 600
                        }}
                      >
                        {val.name}
                      </div>
                    </React.Fragment>
                  );
                })}
              </div>
            </div>

            {/* Mobile layout replacement (Grid / Cards for easy touch navigation) */}
            <div className="lg:hidden w-full">
              <div className="mobile-values-list">
                {valuesData.map((val) => {
                  const Icon = iconMap[val.icon];
                  return (
                    <button
                      key={val.id}
                      onClick={() => setActiveValue(val)}
                      className="mobile-value-card text-left w-full flex items-center justify-between"
                      style={{ 
                        '--value-color': val.color,
                        background: activeValue.id === val.id ? val.lightColor : 'white',
                        borderLeft: `5px solid ${val.color}`
                      }}
                    >
                      <div className="flex items-center gap-4">
                        <div 
                          className="w-10 h-10 rounded-full flex items-center justify-center"
                          style={{ background: activeValue.id === val.id ? 'white' : val.lightColor }}
                        >
                          <Icon size={20} style={{ color: val.color }} />
                        </div>
                        <div>
                          <h4 className="font-bold text-navy text-lg">{val.name}</h4>
                          {activeValue.id === val.id && (
                            <p className="text-sm text-gray-600 mt-1 leading-relaxed">{val.desc}</p>
                          )}
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Dynamic details card panel */}
            <div className="w-full">
              <AnimatePresence mode="wait">
                <motion.div
                  key={activeValue.id}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.3 }}
                  className="value-details-panel"
                  style={{ '--active-color': activeValue.color }}
                >
                  <div 
                    className="value-badge"
                    style={{ backgroundColor: activeValue.lightColor, color: activeValue.color }}
                  >
                    {React.createElement(iconMap[activeValue.icon], { size: 18 })}
                    <span>{activeValue.name}</span>
                  </div>
                  <h3 className="text-3xl font-bold text-navy mb-4">
                    {activeValue.name}
                  </h3>
                  <p className="text-xl text-gray-600 leading-relaxed">
                    {activeValue.desc}
                  </p>
                </motion.div>
              </AnimatePresence>
            </div>
          </div>
        </div>
      </section>

      {/* Why Choose Us */}
      <section className="py-24 px-4 bg-navy text-white relative overflow-hidden">
        <div className="absolute top-0 right-0 w-1/2 h-full opacity-10 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-turquoise to-transparent z-0 pointer-events-none"></div>
        <div className="absolute bottom-0 left-0 w-1/3 h-1/2 opacity-10 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-emerald to-transparent z-0 pointer-events-none"></div>

        <div className="container relative z-10 max-w-5xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          >
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Why Choose Us</h2>
            <div className="w-20 h-1 bg-turquoise mx-auto mb-12 rounded-full"></div>
          </motion.div>

          <div className="grid md:grid-cols-2 gap-8 text-left">
            {/* Point 1 */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.15 }}
              whileHover={{ y: -6, transition: { duration: 0.2 } }}
              className="relative p-8 md:p-10 rounded-3xl bg-white/[0.05] border border-white/10 hover:border-turquoise/60 backdrop-blur-md transition-all shadow-2xl group flex flex-col justify-between"
            >
              <div className="flex items-center justify-between mb-6">
                <div className="w-14 h-14 rounded-2xl bg-turquoise/15 border border-turquoise/30 flex items-center justify-center text-turquoise group-hover:bg-turquoise group-hover:text-navy transition-all duration-300">
                  <TrendingUp size={28} />
                </div>
                <span className="text-3xl font-black text-white/20 group-hover:text-turquoise/40 transition-colors font-mono">01</span>
              </div>
              <p className="text-2xl md:text-3xl font-bold text-white leading-snug group-hover:text-turquoise transition-colors">
                We drive sustainable transformation.
              </p>
            </motion.div>

            {/* Point 2 */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.3 }}
              whileHover={{ y: -6, transition: { duration: 0.2 } }}
              className="relative p-8 md:p-10 rounded-3xl bg-white/[0.05] border border-white/10 hover:border-emerald/60 backdrop-blur-md transition-all shadow-2xl group flex flex-col justify-between"
            >
              <div className="flex items-center justify-between mb-6">
                <div className="w-14 h-14 rounded-2xl bg-emerald/15 border border-emerald/30 flex items-center justify-center text-emerald group-hover:bg-emerald group-hover:text-navy transition-all duration-300">
                  <Target size={28} />
                </div>
                <span className="text-3xl font-black text-white/20 group-hover:text-emerald/40 transition-colors font-mono">02</span>
              </div>
              <p className="text-xl md:text-2xl font-bold text-white leading-relaxed group-hover:text-emerald transition-colors">
                Every initiative is engineered to create visible, long-term improvement in performance, capacity, and opportunity.
              </p>
            </motion.div>
          </div>
        </div>
      </section>
    </div>
  );
};
