import React from 'react';
import './ModuleHeroDiagram.css';

export const ModuleHeroDiagram = ({ diagramType, title }) => {
  switch (diagramType) {
    case 'applied_web_management':
    case 'applied_digital_skills':
      return (
        <div className="hero-diagram digital-diagram" aria-label="Applied Digital Skills and Enterprise Web Management Architecture">
          <div className="diagram-header-label">
            <span className="diagram-pill-badge">Applied Digital Skills &amp; Web Architecture</span>
            <span className="diagram-status-live"><span className="pulse-dot"></span> 10-Stage Web Lifecycle Active</span>
          </div>

          <svg className="diagram-svg" viewBox="0 0 540 280" fill="none" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <pattern id="grid-web" width="20" height="20" patternUnits="userSpaceOnUse">
                <path d="M 20 0 L 0 0 0 20" fill="none" stroke="rgba(255,255,255,0.03)" strokeWidth="1" />
              </pattern>
            </defs>
            <rect width="540" height="280" fill="url(#grid-web)" />

            {/* Central Core: Enterprise Web Hub */}
            <circle cx="270" cy="140" r="50" fill="#0B132B" stroke="#06B6D4" strokeWidth="2.5" />
            <circle cx="270" cy="140" r="62" stroke="rgba(6,182,212,0.25)" strokeWidth="1" strokeDasharray="3 3" />
            <text x="232" y="132" fill="#06B6D4" fontSize="11" fontWeight="800">ENTERPRISE</text>
            <text x="238" y="146" fill="#FFFFFF" fontSize="9" fontWeight="700">WEB HUB</text>
            <text x="236" y="159" fill="#10B981" fontSize="8" fontWeight="600">LIVE PLATFORM</text>

            {/* Top-Left: Strategy, UX & Wireframes */}
            <rect x="20" y="25" width="168" height="62" rx="8" fill="#1C2541" stroke="#06B6D4" strokeWidth="1.5" />
            <text x="32" y="46" fill="#06B6D4" fontSize="10" fontWeight="700">📐 Strategy &amp; UX Wireframes</text>
            <text x="32" y="60" fill="#FFFFFF" fontSize="8">Sitemaps • 3-Click Navigation</text>
            <text x="32" y="73" fill="#94A3B8" fontSize="8">Z &amp; F Patterns • 60-30-10 Branding</text>

            {/* Top-Right: Cloud Edge & Hosting */}
            <rect x="352" y="25" width="168" height="62" rx="8" fill="#1C2541" stroke="#10B981" strokeWidth="1.5" />
            <text x="364" y="46" fill="#10B981" fontSize="10" fontWeight="700">☁ Cloud Hosting &amp; Domains</text>
            <text x="364" y="60" fill="#FFFFFF" fontSize="8">DNS Routing • SSL / HTTPS</text>
            <text x="364" y="73" fill="#94A3B8" fontSize="8">Edge CDN • Mobile-First Speed</text>

            {/* Bottom-Left: Business Email Security */}
            <rect x="20" y="192" width="168" height="62" rx="8" fill="#1C2541" stroke="#06B6D4" strokeWidth="1.5" />
            <text x="32" y="213" fill="#06B6D4" fontSize="10" fontWeight="700">✉ Business Email Deliverability</text>
            <text x="32" y="227" fill="#FFFFFF" fontSize="8">Zoho / G-Suite Mailboxes</text>
            <text x="32" y="240" fill="#94A3B8" fontSize="8">MX • SPF • DKIM Wax Seal</text>

            {/* Bottom-Right: SEO, QA & POPIA Compliance */}
            <rect x="352" y="192" width="168" height="62" rx="8" fill="#1C2541" stroke="#10B981" strokeWidth="1.5" />
            <text x="364" y="213" fill="#10B981" fontSize="10" fontWeight="700">🔍 SEO, QA &amp; POPIA Compliance</text>
            <text x="364" y="227" fill="#FFFFFF" fontSize="8">Google Search Console • Schema</text>
            <text x="364" y="240" fill="#94A3B8" fontSize="8">6-Point Pre-Launch QA Checklist</text>

            {/* Interconnecting Circuit Lines */}
            <path d="M 188 56 L 225 115" stroke="#06B6D4" strokeWidth="2" strokeDasharray="3 3" />
            <path d="M 352 56 L 315 115" stroke="#10B981" strokeWidth="2" strokeDasharray="3 3" />
            <path d="M 188 223 L 225 165" stroke="#06B6D4" strokeWidth="2" strokeDasharray="3 3" />
            <path d="M 352 223 L 315 165" stroke="#10B981" strokeWidth="2" strokeDasharray="3 3" />

            {/* Animated Flow Dots */}
            <circle cx="206" cy="85" r="3" fill="#06B6D4" className="flow-pulse-dot-1" />
            <circle cx="334" cy="85" r="3" fill="#10B981" className="flow-pulse-dot-2" />
            <circle cx="206" cy="194" r="3" fill="#06B6D4" className="flow-pulse-dot-3" />
            <circle cx="334" cy="194" r="3" fill="#10B981" className="flow-pulse-dot-1" />
          </svg>
        </div>
      );

    case 'bpmn_flow':
      return (
        <div className="hero-diagram bpmn-diagram" aria-label="Business Process Map Diagram">
          <div className="diagram-header-label">
            <span className="diagram-pill-badge">BPMN 2.0 Workflow Model</span>
            <span className="diagram-status-live"><span className="pulse-dot"></span> Live Process Flow</span>
          </div>
          
          <svg className="diagram-svg" viewBox="0 0 540 280" fill="none" xmlns="http://www.w3.org/2000/svg">
            {/* Swimlanes */}
            <rect x="10" y="10" width="520" height="80" rx="8" fill="rgba(255,255,255,0.02)" stroke="rgba(255,255,255,0.1)" strokeDasharray="4 4" />
            <text x="25" y="32" fill="rgba(6,182,212,0.6)" fontSize="10" fontWeight="700" letterSpacing="0.05em">SWIMLANE 1: CLIENT / INPUT</text>

            <rect x="10" y="100" width="520" height="90" rx="8" fill="rgba(6,182,212,0.03)" stroke="rgba(6,182,212,0.2)" />
            <text x="25" y="122" fill="rgba(6,182,212,0.8)" fontSize="10" fontWeight="700" letterSpacing="0.05em">SWIMLANE 2: OPERATIONS & OPTIMISATION</text>

            <rect x="10" y="200" width="520" height="70" rx="8" fill="rgba(255,255,255,0.02)" stroke="rgba(255,255,255,0.1)" strokeDasharray="4 4" />
            <text x="25" y="222" fill="rgba(6,182,212,0.6)" fontSize="10" fontWeight="700" letterSpacing="0.05em">SWIMLANE 3: VALUE DELIVERY / OUTPUT</text>

            {/* Connecting Flow Lines */}
            <path d="M 60 55 L 120 55 L 120 145 L 150 145" stroke="#06B6D4" strokeWidth="2" strokeDasharray="3 3" />
            <path d="M 230 145 L 270 145" stroke="#06B6D4" strokeWidth="2" />
            <path d="M 330 145 L 360 145" stroke="#06B6D4" strokeWidth="2" />
            <path d="M 440 145 L 470 145 L 470 235 L 485 235" stroke="#10B981" strokeWidth="2" />

            {/* Node 1: Start Event */}
            <circle cx="50" cy="55" r="16" fill="rgba(16,185,129,0.2)" stroke="#10B981" strokeWidth="2" />
            <polygon points="46,48 56,55 46,62" fill="#10B981" />
            <text x="32" y="85" fill="#E2E8F0" fontSize="9" fontWeight="600">Start / Inflow</text>

            {/* Node 2: SIPOC Intake */}
            <rect x="150" y="125" width="80" height="40" rx="6" fill="#0B132B" stroke="#06B6D4" strokeWidth="1.5" />
            <text x="162" y="142" fill="#FFFFFF" fontSize="9" fontWeight="700">SIPOC Intake</text>
            <text x="162" y="154" fill="rgba(255,255,255,0.6)" fontSize="8">Scope Matrix</text>

            {/* Node 3: Decision Gateway */}
            <polygon points="300,120 330,145 300,170 270,145" fill="rgba(6,182,212,0.15)" stroke="#06B6D4" strokeWidth="2" />
            <text x="290" y="148" fill="#06B6D4" fontSize="11" fontWeight="800">◇</text>
            <text x="272" y="185" fill="#94A3B8" fontSize="8">As-Is Gateway</text>

            {/* Node 4: To-Be Optimized Task */}
            <rect x="360" y="125" width="80" height="40" rx="6" fill="#1C2541" stroke="#06B6D4" strokeWidth="1.5" />
            <text x="372" y="142" fill="#06B6D4" fontSize="9" fontWeight="700">To-Be Stream</text>
            <text x="372" y="154" fill="rgba(255,255,255,0.7)" fontSize="8">Optimized</text>

            {/* Node 5: End Event */}
            <circle cx="500" cy="235" r="16" fill="rgba(16,185,129,0.2)" stroke="#10B981" strokeWidth="3" />
            <circle cx="500" cy="235" r="10" fill="#10B981" />
            <text x="475" y="265" fill="#E2E8F0" fontSize="9" fontWeight="600">End / Delivery</text>

            {/* Animated Flow Dots */}
            <circle cx="100" cy="55" r="3" fill="#06B6D4" className="flow-pulse-dot-1" />
            <circle cx="250" cy="145" r="3" fill="#06B6D4" className="flow-pulse-dot-2" />
            <circle cx="345" cy="145" r="3" fill="#06B6D4" className="flow-pulse-dot-3" />
          </svg>
        </div>
      );

    case 'digital_cloud':
      return (
        <div className="hero-diagram digital-diagram" aria-label="Digital Transformation Architecture">
          <div className="diagram-header-label">
            <span className="diagram-pill-badge">Cloud &amp; Automation Architecture</span>
            <span className="diagram-status-live"><span className="pulse-dot"></span> Pipeline Active</span>
          </div>

          <svg className="diagram-svg" viewBox="0 0 540 280" fill="none" xmlns="http://www.w3.org/2000/svg">
            {/* Grid Backdrop */}
            <defs>
              <pattern id="grid-digital" width="20" height="20" patternUnits="userSpaceOnUse">
                <path d="M 20 0 L 0 0 0 20" fill="none" stroke="rgba(255,255,255,0.03)" strokeWidth="1" />
              </pattern>
            </defs>
            <rect width="540" height="280" fill="url(#grid-digital)" />

            {/* Layer 1: Sources */}
            <rect x="30" y="40" width="100" height="50" rx="8" fill="#1C2541" stroke="rgba(255,255,255,0.15)" />
            <text x="45" y="62" fill="#FFFFFF" fontSize="10" fontWeight="700">Data Sources</text>
            <text x="45" y="76" fill="#94A3B8" fontSize="8">Databases &amp; ERP</text>

            {/* Layer 2: Cloud Engine */}
            <rect x="200" y="40" width="140" height="70" rx="10" fill="#0B132B" stroke="#06B6D4" strokeWidth="2" />
            <text x="215" y="65" fill="#06B6D4" fontSize="11" fontWeight="800">⚡ Automation Hub</text>
            <text x="215" y="80" fill="#E2E8F0" fontSize="8">Workflows &amp; Sync Engine</text>
            <text x="215" y="94" fill="#64748B" fontSize="8">Event Triggers</text>

            {/* Layer 3: API Integration */}
            <rect x="200" y="160" width="140" height="60" rx="8" fill="#1C2541" stroke="#06B6D4" />
            <text x="215" y="185" fill="#FFFFFF" fontSize="10" fontWeight="700">API Mesh</text>
            <text x="215" y="200" fill="#94A3B8" fontSize="8">Cloud Connectors</text>

            {/* Layer 4: Dashboard Output */}
            <rect x="400" y="70" width="115" height="120" rx="10" fill="#0B132B" stroke="#10B981" strokeWidth="2" />
            <text x="415" y="95" fill="#10B981" fontSize="11" fontWeight="800">BI Dashboard</text>
            <rect x="415" y="108" width="85" height="8" rx="2" fill="rgba(6,182,212,0.3)" />
            <rect x="415" y="122" width="60" height="8" rx="2" fill="rgba(16,185,129,0.4)" />
            <rect x="415" y="136" width="75" height="8" rx="2" fill="rgba(6,182,212,0.4)" />
            <text x="415" y="165" fill="#94A3B8" fontSize="8">Real-Time Metrics</text>

            {/* Connectors */}
            <path d="M 130 65 L 200 65" stroke="#06B6D4" strokeWidth="2" />
            <path d="M 270 110 L 270 160" stroke="#06B6D4" strokeWidth="2" strokeDasharray="3 3" />
            <path d="M 340 75 L 400 95" stroke="#06B6D4" strokeWidth="2" />
            <path d="M 340 190 L 400 160" stroke="#10B981" strokeWidth="2" />
          </svg>
        </div>
      );

    case 'org_network':
      return (
        <div className="hero-diagram org-diagram" aria-label="Organisational Development Structure">
          <div className="diagram-header-label">
            <span className="diagram-pill-badge">Organizational Alignment Matrix</span>
            <span className="diagram-status-live"><span className="pulse-dot"></span> Structural Synergy</span>
          </div>

          <svg className="diagram-svg" viewBox="0 0 540 280" fill="none" xmlns="http://www.w3.org/2000/svg">
            {/* Top Node: Strategy & Leadership */}
            <rect x="180" y="20" width="180" height="46" rx="8" fill="#0B132B" stroke="#06B6D4" strokeWidth="2" />
            <text x="205" y="42" fill="#06B6D4" fontSize="10" fontWeight="800">Strategic Leadership</text>
            <text x="210" y="55" fill="#94A3B8" fontSize="8">Institutional Mandate</text>

            {/* Connecting Trunk */}
            <path d="M 270 66 L 270 100" stroke="#06B6D4" strokeWidth="2" />
            <path d="M 100 100 L 440 100" stroke="#06B6D4" strokeWidth="1.5" />
            <path d="M 100 100 L 100 120" stroke="#06B6D4" strokeWidth="1.5" />
            <path d="M 270 100 L 270 120" stroke="#06B6D4" strokeWidth="1.5" />
            <path d="M 440 100 L 440 120" stroke="#06B6D4" strokeWidth="1.5" />

            {/* Middle Tier Nodes */}
            <rect x="30" y="120" width="140" height="50" rx="8" fill="#1C2541" stroke="rgba(255,255,255,0.2)" />
            <text x="45" y="142" fill="#FFFFFF" fontSize="9" fontWeight="700">Culture &amp; Values</text>
            <text x="45" y="156" fill="#94A3B8" fontSize="8">Behavioral Alignment</text>

            <rect x="200" y="120" width="140" height="50" rx="8" fill="#1C2541" stroke="#06B6D4" />
            <text x="215" y="142" fill="#06B6D4" fontSize="9" fontWeight="700">People &amp; Capability</text>
            <text x="215" y="156" fill="#94A3B8" fontSize="8">Talent Architecture</text>

            <rect x="370" y="120" width="140" height="50" rx="8" fill="#1C2541" stroke="rgba(255,255,255,0.2)" />
            <text x="385" y="142" fill="#FFFFFF" fontSize="9" fontWeight="700">Governance &amp; Span</text>
            <text x="385" y="156" fill="#94A3B8" fontSize="8">Operating Model</text>

            {/* Convergence to High Performance */}
            <path d="M 100 170 L 220 220" stroke="#10B981" strokeWidth="1.5" strokeDasharray="3 3" />
            <path d="M 270 170 L 270 210" stroke="#10B981" strokeWidth="2" />
            <path d="M 440 170 L 320 220" stroke="#10B981" strokeWidth="1.5" strokeDasharray="3 3" />

            <rect x="170" y="210" width="200" height="45" rx="8" fill="#0B132B" stroke="#10B981" strokeWidth="2" />
            <text x="190" y="232" fill="#10B981" fontSize="10" fontWeight="800">High-Performing Institution</text>
            <text x="195" y="245" fill="#94A3B8" fontSize="8">Sustainable Effectiveness</text>
          </svg>
        </div>
      );

    case 'change_curve':
      return (
        <div className="hero-diagram change-diagram" aria-label="Change Management Adoption Roadmap">
          <div className="diagram-header-label">
            <span className="diagram-pill-badge">ADKAR Transformation Journey</span>
            <span className="diagram-status-live"><span className="pulse-dot"></span> Adoption Transition</span>
          </div>

          <svg className="diagram-svg" viewBox="0 0 540 280" fill="none" xmlns="http://www.w3.org/2000/svg">
            {/* Change Curve Path */}
            <path d="M 40 80 C 120 70, 160 190, 260 190 C 360 190, 420 50, 500 50" stroke="#06B6D4" strokeWidth="3" fill="none" />

            {/* Milestones along curve */}
            <circle cx="70" cy="78" r="8" fill="#1C2541" stroke="#06B6D4" strokeWidth="2" />
            <text x="45" y="110" fill="#E2E8F0" fontSize="9" fontWeight="700">1. Awareness</text>
            <text x="45" y="122" fill="#64748B" fontSize="8">Need for Change</text>

            <circle cx="170" cy="155" r="8" fill="#1C2541" stroke="#06B6D4" strokeWidth="2" />
            <text x="145" y="185" fill="#E2E8F0" fontSize="9" fontWeight="700">2. Desire</text>
            <text x="145" y="197" fill="#64748B" fontSize="8">Active Support</text>

            <circle cx="260" cy="190" r="10" fill="#0B132B" stroke="#06B6D4" strokeWidth="2.5" />
            <text x="235" y="225" fill="#06B6D4" fontSize="10" fontWeight="800">3. Knowledge</text>
            <text x="240" y="238" fill="#94A3B8" fontSize="8">New Skills</text>

            <circle cx="360" cy="120" r="8" fill="#1C2541" stroke="#10B981" strokeWidth="2" />
            <text x="340" y="150" fill="#E2E8F0" fontSize="9" fontWeight="700">4. Ability</text>
            <text x="340" y="162" fill="#64748B" fontSize="8">Execution</text>

            <circle cx="480" cy="52" r="10" fill="#0B132B" stroke="#10B981" strokeWidth="2.5" />
            <text x="440" y="32" fill="#10B981" fontSize="10" fontWeight="800">5. Reinforcement</text>
            <text x="455" y="80" fill="#94A3B8" fontSize="8">Sustained Habit</text>
          </svg>
        </div>
      );

    case 'sop_blueprint':
      return (
        <div className="hero-diagram sop-diagram" aria-label="Work Standardisation Blueprint">
          <div className="diagram-header-label">
            <span className="diagram-pill-badge">Standard Work Blueprint</span>
            <span className="diagram-status-live"><span className="pulse-dot"></span> Quality Benchmark</span>
          </div>

          <svg className="diagram-svg" viewBox="0 0 540 280" fill="none" xmlns="http://www.w3.org/2000/svg">
            {/* Step 1 */}
            <rect x="20" y="70" width="105" height="110" rx="8" fill="#1C2541" stroke="rgba(255,255,255,0.15)" />
            <circle cx="40" cy="90" r="10" fill="rgba(6,182,212,0.2)" />
            <text x="37" y="94" fill="#06B6D4" fontSize="10" fontWeight="800">1</text>
            <text x="35" y="118" fill="#FFFFFF" fontSize="10" fontWeight="700">SOP Protocol</text>
            <text x="35" y="132" fill="#94A3B8" fontSize="8">Standard Steps</text>
            <text x="35" y="146" fill="#94A3B8" fontSize="8">Scope Baseline</text>

            {/* Arrow 1 */}
            <path d="M 125 125 L 150 125" stroke="#06B6D4" strokeWidth="2" markerEnd="url(#arrow)" />

            {/* Step 2 */}
            <rect x="150" y="70" width="105" height="110" rx="8" fill="#1C2541" stroke="#06B6D4" />
            <circle cx="170" cy="90" r="10" fill="rgba(6,182,212,0.2)" />
            <text x="167" y="94" fill="#06B6D4" fontSize="10" fontWeight="800">2</text>
            <text x="165" y="118" fill="#06B6D4" fontSize="10" fontWeight="700">Visual Guide</text>
            <text x="165" y="132" fill="#94A3B8" fontSize="8">One-Point Lesson</text>
            <text x="165" y="146" fill="#94A3B8" fontSize="8">Work Aids</text>

            {/* Arrow 2 */}
            <path d="M 255 125 L 280 125" stroke="#06B6D4" strokeWidth="2" />

            {/* Step 3 */}
            <rect x="280" y="70" width="105" height="110" rx="8" fill="#0B132B" stroke="#06B6D4" strokeWidth="2" />
            <circle cx="300" cy="90" r="10" fill="rgba(6,182,212,0.2)" />
            <text x="297" y="94" fill="#06B6D4" fontSize="10" fontWeight="800">3</text>
            <text x="295" y="118" fill="#FFFFFF" fontSize="10" fontWeight="700">Quality Check</text>
            <text x="295" y="132" fill="#94A3B8" fontSize="8">Poka-Yoke Gate</text>
            <text x="295" y="146" fill="#10B981" fontSize="8">✓ Error-Proof</text>

            {/* Arrow 3 */}
            <path d="M 385 125 L 410 125" stroke="#10B981" strokeWidth="2" />

            {/* Step 4: Repeatable Benchmark */}
            <rect x="410" y="60" width="115" height="130" rx="10" fill="#0B132B" stroke="#10B981" strokeWidth="2" />
            <circle cx="435" cy="85" r="12" fill="rgba(16,185,129,0.2)" />
            <text x="430" y="89" fill="#10B981" fontSize="11" fontWeight="800">★</text>
            <text x="425" y="115" fill="#10B981" fontSize="11" fontWeight="800">Audit-Ready</text>
            <text x="425" y="130" fill="#E2E8F0" fontSize="8">5S Standard</text>
            <text x="425" y="144" fill="#94A3B8" fontSize="8">Consistent Output</text>
            <text x="425" y="158" fill="#94A3B8" fontSize="8">Zero Waste</text>
          </svg>
        </div>
      );

    case 'dmaic_chevrons':
      return (
        <div className="hero-diagram dmaic-diagram" aria-label="DMAIC Problem-Solving Cycle">
          <div className="diagram-header-label">
            <span className="diagram-pill-badge">Six Sigma DMAIC Methodology</span>
            <span className="diagram-status-live"><span className="pulse-dot"></span> Tollgate Governed</span>
          </div>

          <svg className="diagram-svg" viewBox="0 0 540 280" fill="none" xmlns="http://www.w3.org/2000/svg">
            {/* Chevron 1: Define */}
            <polygon points="10,50 95,50 115,110 95,170 10,170 30,110" fill="#1C2541" stroke="#06B6D4" strokeWidth="1.5" />
            <text x="45" y="95" fill="#06B6D4" fontSize="18" fontWeight="900">D</text>
            <text x="40" y="120" fill="#FFFFFF" fontSize="9" fontWeight="700">DEFINE</text>
            <text x="36" y="135" fill="#94A3B8" fontSize="7">Project Charter</text>

            {/* Chevron 2: Measure */}
            <polygon points="115,50 200,50 220,110 200,170 115,170 135,110" fill="#1C2541" stroke="#06B6D4" strokeWidth="1.5" />
            <text x="150" y="95" fill="#06B6D4" fontSize="18" fontWeight="900">M</text>
            <text x="140" y="120" fill="#FFFFFF" fontSize="9" fontWeight="700">MEASURE</text>
            <text x="142" y="135" fill="#94A3B8" fontSize="7">Data Baseline</text>

            {/* Chevron 3: Analyse */}
            <polygon points="220,50 305,50 325,110 305,170 220,170 240,110" fill="#0B132B" stroke="#06B6D4" strokeWidth="2" />
            <text x="255" y="95" fill="#06B6D4" fontSize="18" fontWeight="900">A</text>
            <text x="246" y="120" fill="#06B6D4" fontSize="9" fontWeight="700">ANALYSE</text>
            <text x="248" y="135" fill="#94A3B8" fontSize="7">Root Causes</text>

            {/* Chevron 4: Improve */}
            <polygon points="325,50 410,50 430,110 410,170 325,170 345,110" fill="#1C2541" stroke="#10B981" strokeWidth="1.5" />
            <text x="360" y="95" fill="#10B981" fontSize="18" fontWeight="900">I</text>
            <text x="352" y="120" fill="#FFFFFF" fontSize="9" fontWeight="700">IMPROVE</text>
            <text x="352" y="135" fill="#94A3B8" fontSize="7">Pilot Solution</text>

            {/* Chevron 5: Control */}
            <polygon points="430,50 515,50 535,110 515,170 430,170 450,110" fill="#0B132B" stroke="#10B981" strokeWidth="2" />
            <text x="468" y="95" fill="#10B981" fontSize="18" fontWeight="900">C</text>
            <text x="460" y="120" fill="#10B981" fontSize="9" fontWeight="700">CONTROL</text>
            <text x="462" y="135" fill="#94A3B8" fontSize="7">SPC Standard</text>

            {/* Baseline Metric Banner */}
            <rect x="60" y="210" width="420" height="40" rx="8" fill="rgba(6,182,212,0.06)" stroke="rgba(6,182,212,0.2)" />
            <text x="130" y="235" fill="#E2E8F0" fontSize="9" fontWeight="600">Problem Isolation ➔ Root Cause Evidence ➔ Permanent Control Plan</text>
          </svg>
        </div>
      );

    case 'kpi_tree':
      return (
        <div className="hero-diagram kpi-diagram" aria-label="Performance Management KPI Cascade">
          <div className="diagram-header-label">
            <span className="diagram-pill-badge">Strategic KPI Cascade</span>
            <span className="diagram-status-live"><span className="pulse-dot"></span> Target Alignment</span>
          </div>

          <svg className="diagram-svg" viewBox="0 0 540 280" fill="none" xmlns="http://www.w3.org/2000/svg">
            {/* Top Root: Corporate Objective */}
            <rect x="180" y="20" width="180" height="45" rx="8" fill="#0B132B" stroke="#06B6D4" strokeWidth="2" />
            <text x="210" y="40" fill="#06B6D4" fontSize="10" fontWeight="800">Corporate Vision &amp; Goals</text>
            <text x="215" y="53" fill="#94A3B8" fontSize="8">Strategic Targets (Annual)</text>

            {/* Tree Branch Lines */}
            <path d="M 270 65 L 270 95" stroke="#06B6D4" strokeWidth="2" />
            <path d="M 100 95 L 440 95" stroke="#06B6D4" strokeWidth="1.5" />
            <path d="M 100 95 L 100 115" stroke="#06B6D4" strokeWidth="1.5" />
            <path d="M 270 95 L 270 115" stroke="#06B6D4" strokeWidth="1.5" />
            <path d="M 440 95 L 440 115" stroke="#06B6D4" strokeWidth="1.5" />

            {/* Department Level KPIs */}
            <rect x="25" y="115" width="150" height="50" rx="8" fill="#1C2541" stroke="rgba(255,255,255,0.2)" />
            <text x="40" y="135" fill="#FFFFFF" fontSize="9" fontWeight="700">Financial &amp; Revenue</text>
            <text x="40" y="150" fill="#10B981" fontSize="8">● Margin &amp; Efficiency</text>

            <rect x="195" y="115" width="150" height="50" rx="8" fill="#1C2541" stroke="#06B6D4" />
            <text x="210" y="135" fill="#06B6D4" fontSize="9" fontWeight="700">Operational Excellence</text>
            <text x="210" y="150" fill="#94A3B8" fontSize="8">● Cycle Time &amp; Quality</text>

            <rect x="365" y="115" width="150" height="50" rx="8" fill="#1C2541" stroke="rgba(255,255,255,0.2)" />
            <text x="380" y="135" fill="#FFFFFF" fontSize="9" fontWeight="700">Customer &amp; People</text>
            <text x="380" y="150" fill="#10B981" fontSize="8">● CSAT &amp; Engagement</text>

            {/* Individual Scorecard Floor */}
            <rect x="100" y="200" width="340" height="55" rx="8" fill="#0B132B" stroke="#10B981" strokeWidth="2" />
            <text x="130" y="222" fill="#10B981" fontSize="10" fontWeight="800">Tier Review Cadence &amp; Individual Scorecards</text>
            <text x="150" y="240" fill="#E2E8F0" fontSize="8">Weekly Standups &middot; Objective Dashboards &middot; Goal Realisation</text>
          </svg>
        </div>
      );

    case 'ishikawa_fishbone':
      return (
        <div className="hero-diagram rca-diagram" aria-label="Ishikawa Fishbone Diagram">
          <div className="diagram-header-label">
            <span className="diagram-pill-badge">Ishikawa 6M Cause-and-Effect Spine</span>
            <span className="diagram-status-live"><span className="pulse-dot"></span> Root Cause Diagnostic</span>
          </div>

          <svg className="diagram-svg" viewBox="0 0 540 280" fill="none" xmlns="http://www.w3.org/2000/svg">
            {/* Central Spine */}
            <path d="M 40 140 L 410 140" stroke="#06B6D4" strokeWidth="3" />
            <polygon points="410,132 430,140 410,148" fill="#06B6D4" />

            {/* Fish Head: The Problem Statement */}
            <rect x="430" y="110" width="95" height="60" rx="8" fill="#0B132B" stroke="#06B6D4" strokeWidth="2" />
            <text x="445" y="132" fill="#06B6D4" fontSize="9" fontWeight="800">EFFECT /</text>
            <text x="445" y="145" fill="#FFFFFF" fontSize="9" fontWeight="700">Problem</text>
            <text x="445" y="158" fill="#94A3B8" fontSize="7">Identified Defect</text>

            {/* Top Ribs */}
            {/* People */}
            <path d="M 120 140 L 170 50" stroke="#06B6D4" strokeWidth="2" />
            <rect x="130" y="30" width="70" height="24" rx="4" fill="#1C2541" stroke="rgba(255,255,255,0.2)" />
            <text x="142" y="46" fill="#FFFFFF" fontSize="8" fontWeight="700">People</text>
            <path d="M 155 75 L 180 75" stroke="#94A3B8" strokeWidth="1" strokeDasharray="2 2" />
            <text x="185" y="78" fill="#64748B" fontSize="7">Training Gap</text>

            {/* Method */}
            <path d="M 230 140 L 280 50" stroke="#06B6D4" strokeWidth="2" />
            <rect x="240" y="30" width="70" height="24" rx="4" fill="#1C2541" stroke="#06B6D4" />
            <text x="252" y="46" fill="#06B6D4" fontSize="8" fontWeight="700">Method</text>
            <path d="M 265 75 L 290 75" stroke="#94A3B8" strokeWidth="1" strokeDasharray="2 2" />
            <text x="295" y="78" fill="#64748B" fontSize="7">No SOP</text>

            {/* Machine */}
            <path d="M 340 140 L 390 50" stroke="#06B6D4" strokeWidth="2" />
            <rect x="350" y="30" width="70" height="24" rx="4" fill="#1C2541" stroke="rgba(255,255,255,0.2)" />
            <text x="360" y="46" fill="#FFFFFF" fontSize="8" fontWeight="700">Machine</text>

            {/* Bottom Ribs */}
            {/* Material */}
            <path d="M 120 140 L 170 230" stroke="#06B6D4" strokeWidth="2" />
            <rect x="130" y="225" width="70" height="24" rx="4" fill="#1C2541" stroke="rgba(255,255,255,0.2)" />
            <text x="140" y="241" fill="#FFFFFF" fontSize="8" fontWeight="700">Material</text>

            {/* Measurement */}
            <path d="M 230 140 L 280 230" stroke="#06B6D4" strokeWidth="2" />
            <rect x="240" y="225" width="75" height="24" rx="4" fill="#1C2541" stroke="rgba(255,255,255,0.2)" />
            <text x="246" y="241" fill="#FFFFFF" fontSize="8" fontWeight="700">Measurement</text>

            {/* Environment */}
            <path d="M 340 140 L 390 230" stroke="#06B6D4" strokeWidth="2" />
            <rect x="350" y="225" width="75" height="24" rx="4" fill="#1C2541" stroke="#10B981" />
            <text x="355" y="241" fill="#10B981" fontSize="8" fontWeight="700">Environment</text>
          </svg>
        </div>
      );

    default:
      return (
        <div className="hero-diagram generic-diagram" aria-label="Skills Development Architecture">
          <div className="diagram-header-label">
            <span className="diagram-pill-badge">Competency Matrix</span>
            <span className="diagram-status-live"><span className="pulse-dot"></span> Workplace Aligned</span>
          </div>

          <svg className="diagram-svg" viewBox="0 0 540 280" fill="none" xmlns="http://www.w3.org/2000/svg">
            <circle cx="270" cy="140" r="80" stroke="rgba(6,182,212,0.3)" strokeWidth="2" strokeDasharray="4 4" />
            <circle cx="270" cy="140" r="40" fill="#0B132B" stroke="#06B6D4" strokeWidth="2" />
            <text x="240" y="145" fill="#06B6D4" fontSize="12" fontWeight="800">NEXA</text>
            <rect x="50" y="60" width="100" height="40" rx="6" fill="#1C2541" stroke="#06B6D4" />
            <text x="65" y="85" fill="#FFFFFF" fontSize="9" fontWeight="700">Diagnostics</text>
            <rect x="390" y="60" width="100" height="40" rx="6" fill="#1C2541" stroke="#06B6D4" />
            <text x="410" y="85" fill="#FFFFFF" fontSize="9" fontWeight="700">Optimisation</text>
            <rect x="50" y="180" width="100" height="40" rx="6" fill="#1C2541" stroke="#10B981" />
            <text x="65" y="205" fill="#10B981" fontSize="9" fontWeight="700">Capabilities</text>
            <rect x="390" y="180" width="100" height="40" rx="6" fill="#1C2541" stroke="#10B981" />
            <text x="410" y="205" fill="#10B981" fontSize="9" fontWeight="700">Governance</text>
          </svg>
        </div>
      );
  }
};
