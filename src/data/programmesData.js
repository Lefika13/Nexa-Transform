// src/data/programmesData.js
// Catalog of training programmes and modules for Nexa Transform

export const PROGRAMMES_DATA = [
  {
    id: 'applied-digital-skills-web-management',
    slug: 'applied-digital-skills-web-management',
    aliases: ['applied-digital-skills', 'web-management', 'applied-digital-skills-and-enterprise-web-management'],
    title: 'Applied Digital Skills and Enterprise Web Management',
    delivery: 'Blended & Digital Learning',
    category: 'Digital Transformation',
    is_featured: true,
    badge: 'High Demand',
    about: 'A practical, platform-agnostic programme teaching learners how to architect, design, launch, and manage high-converting professional websites without code. Covers end-to-end digital operations including UX wireframing, cloud edge hosting, enterprise business email deliverability, SEO, and POPIA data compliance.',
    practical_tools: [
      'Visual Sitemaps & Three-Click Architecture',
      'Low-Fidelity UX Wireframing (Z & F-Patterns)',
      'Cloud Edge Hosting & DNS Architecture',
      'Enterprise Email Deliverability (MX, SPF, DKIM)',
      'Multi-Provincial SEO & Google Search Console',
      'Pre-Launch QA & POPIA Compliance Checklists'
    ],
    workplace_impact: 'Equips organisations and entrepreneurs to deploy professional, mobile-first websites in days rather than months, eliminating reliance on expensive external agencies while guaranteeing enterprise-grade email deliverability and data privacy compliance.',
    diagram_type: 'applied_web_management',
    feature_chips: [
      'Web Architecture & Wireframing',
      'Cloud Edge Hosting & Domains',
      'Business Email (MX / SPF / DKIM)',
      'Search Engine Optimisation (SEO)'
    ],
    completion_outcomes: [
      'Architect high-converting websites from scratch by formulating commercial objectives, profiling user personas, and structuring intuitive sitemaps using the Three-Click Rule.',
      'Design user-centric web layouts and low-fidelity wireframes applying natural eye-reading patterns (Z-Pattern and F-Pattern), 60-30-10 brand palettes, and professional typography.',
      'Deploy modern web infrastructure by configuring domain names, DNS records, SSL/HTTPS encryption, and fast cloud edge hosting environments.',
      'Set up professional business email systems (Zoho / Google Workspace) with authenticated MX, SPF, and DKIM cryptographic records to guarantee inbox deliverability.',
      'Execute multi-provincial search engine optimization (SEO) using structured Schema.org data, XML sitemaps, and Google Search Console performance tracking.',
      'Conduct rigorous cross-device pre-launch QA testing, enforce POPIA/GDPR data privacy compliance, and manage live digital web operations.'
    ],
    supported_roles: [
      'Digital Web Administrator',
      'Digital Marketing Coordinator',
      'Junior Web Project Coordinator'
    ],
    image: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&w=1200&q=80'
  },
  {
    id: 'process-mapping-fundamentals',
    slug: 'process-mapping-fundamentals',
    title: 'Business Process Management',
    delivery: 'Blended & Digital Learning',
    about: 'Learn how to map, analyse and streamline operational workflows using practical industry tools such as process maps, SIPOC matrices, and As-Is and To-Be optimization.',
    practical_tools: [
      'BPMN 2.0 Process Notations',
      'SIPOC Scoping Matrices',
      'Cross-Functional Swimlanes',
      'As-Is & To-Be Flowcharts',
      'Value Stream Mapping (VSM)',
      'Cycle Time Bottleneck Registers'
    ],
    workplace_impact: 'Enables organisations to reduce operational cycle times by up to 35%, eliminate redundant administrative steps, establish clear process ownership, and ensure seamless knowledge transfer across teams.',
    diagram_type: 'bpmn_flow',
    feature_chips: [
      'BPMN 2.0 Flowcharts',
      'SIPOC Matrices',
      'As-Is & To-Be Analysis',
      'Swimlane Architecture'
    ],
    completion_outcomes: [
      'Map end-to-end business workflows accurately using BPMN 2.0 standards.',
      'Identify process bottlenecks, hand-off delays, and operational redundancies.',
      'Construct comprehensive SIPOC registers to define process boundaries.',
      'Model optimized future-state To-Be workflows that eliminate waste.',
      'Write clear, actionable Standard Operating Procedures (SOPs).',
      'Establish baseline cycle-time and quality metrics for process governance.'
    ],
    supported_roles: [
      'Junior Business Analyst',
      'Business Process Analyst',
      'Process Analyst'
    ],
    image: 'https://images.unsplash.com/photo-1552664730-d307ca884978?auto=format&fit=crop&w=1200&q=80'
  },
  {
    id: 'digital-transformation-leadership',
    slug: 'digital-transformation-leadership',
    title: 'Digital Transformation & Automation',
    delivery: 'Blended & Digital Learning',
    about: 'Equips professionals to modernize operational workflows using digital tools, automation, cloud platforms, and data dashboards to eliminate manual inefficiencies.',
    practical_tools: [
      'Cloud Architecture Roadmaps',
      'Workflow Automation Engines',
      'Interactive BI Dashboards',
      'API Data Pipeline Blueprints',
      'Digital Maturity Scorecards',
      'Change Adoption Frameworks'
    ],
    workplace_impact: 'Replaces manual, error-prone spreadsheets with automated digital workflows, giving leadership real-time operational visibility and accelerating task turnaround times across the enterprise.',
    diagram_type: 'digital_cloud',
    feature_chips: [
      'Workflow Automation',
      'Cloud Architecture',
      'Real-Time BI Dashboards',
      'API Data Pipelines'
    ],
    completion_outcomes: [
      'Formulate comprehensive digital strategy roadmaps aligned with business objectives.',
      'Evaluate modern digital workplace tools, platforms, and cloud services.',
      'Design and deploy automated workflow processes that reduce manual effort.',
      'Build executive dashboards for data-driven operational decision-making.',
      'Support digital adoption and user engagement across cross-functional teams.',
      'Ensure data integrity, compliance, and governance across digital systems.'
    ],
    supported_roles: [
      'Junior Data Analyst',
      'Junior Business Analyst',
      'Business Intelligence Analyst'
    ],
    image: 'https://images.unsplash.com/photo-1519389950473-47ba0277781c?auto=format&fit=crop&w=1200&q=80'
  },
  {
    id: 'organisational-development',
    slug: 'organisational-development',
    title: 'Organisational Development',
    delivery: 'Blended & Digital Learning',
    about: 'A systematic approach to enhancing institutional capability through the strategic alignment of people, operational structures, systems, and workplace culture.',
    practical_tools: [
      'McKinsey 7S Framework',
      'Burke-Litwin Diagnostic Model',
      'Span-of-Control Matrices',
      'Culture Health Surveys',
      'OD Intervention Roadmaps',
      'Job Role Architecture Grids'
    ],
    workplace_impact: 'Breaks down organizational silos, aligns job roles with strategic institutional mandates, improves staff retention, and fosters an adaptive culture that thrives amidst market transitions.',
    diagram_type: 'org_network',
    feature_chips: [
      'Org Structure Matrix',
      'Diagnostic Models',
      'Culture Alignment',
      'Cross-Functional Synergy'
    ],
    completion_outcomes: [
      'Understand the full lifecycle and diagnostic phases of the OD process.',
      'Design organizational restructuring and intervention plans.',
      'Apply established diagnostic frameworks (McKinsey 7S, Burke-Litwin).',
      'Assess workplace cultural dynamics and propose targeted interventions.',
      'Support performance management systems aligned with corporate goals.',
      'Facilitate cross-departmental collaboration and institutional effectiveness.'
    ],
    supported_roles: [
      'HR Administrator',
      'Training Coordinator',
      'Organisational Development Officer'
    ],
    image: 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&w=1200&q=80'
  },
  {
    id: 'change-management',
    slug: 'change-management',
    title: 'Change Management',
    delivery: 'Blended & Digital Learning',
    about: 'Learn structured methodologies like ADKAR to guide teams through operational transitions smoothly, minimize resistance, and sustain high adoption.',
    practical_tools: [
      'ADKAR Assessment Sheets',
      'Stakeholder Impact Heatmaps',
      'Kotter 8-Stage Roadmaps',
      'Change Communication Matrix',
      'Resistance Diagnosis Logs',
      'Adoption Telemetry Dashboards'
    ],
    workplace_impact: 'Dramatically reduces project implementation delays, cuts employee turnover during restructuring, and ensures new digital systems and operating procedures achieve high everyday utilization.',
    diagram_type: 'change_curve',
    feature_chips: [
      'ADKAR Model',
      'Stakeholder Heatmaps',
      'Resistance Mitigation',
      'Adoption Roadmaps'
    ],
    completion_outcomes: [
      'Identify and understand the strategic need for organisational change.',
      'Recognise internal and external forces driving workplace transitions.',
      'Identify, diagnose, and construct constructive resolutions to resistance.',
      'Formulate staged change management plans using ADKAR and Kotter frameworks.',
      'Communicate and engage effectively with diverse stakeholder tiers during change.',
      'Monitor change adoption metrics and support permanent cultural sustainment.'
    ],
    supported_roles: [
      'Project Administrator',
      'Training Coordinator',
      'Change Analyst'
    ],
    image: 'https://images.unsplash.com/photo-1531482615713-2afd69097998?auto=format&fit=crop&w=1200&q=80'
  },
  {
    id: 'work-standardisation',
    slug: 'work-standardisation',
    title: 'Work Standardisation',
    delivery: 'Blended & Digital Learning',
    about: 'Establish clear, repeatable benchmarks through standard operating procedures (SOPs), visual job aids, and quality controls to ensure consistent delivery.',
    practical_tools: [
      'SOP Standard Templates',
      'Visual Work Instruction Aids',
      '5S Audit Scorecards',
      'Poka-Yoke Checklists',
      'Process Cycle Variation Sheets',
      'Job Breakdown Sheets'
    ],
    workplace_impact: 'Drives repeatable output quality, accelerates new hire onboarding from weeks to days, drastically reduces rework and customer complaints, and establishes a clear baseline for ongoing Kaizen.',
    diagram_type: 'sop_blueprint',
    feature_chips: [
      'SOP Standards',
      'Visual Work Aids',
      '5S Methodologies',
      'Poka-Yoke Error Proofing'
    ],
    completion_outcomes: [
      'Develop standard operating procedures (SOPs) and technical work instructions.',
      'Design visual one-point lessons for standardized task execution.',
      'Implement 5S workplace organisation principles to optimize productivity.',
      'Establish error-proofing (Poka-Yoke) mechanisms to eliminate human mistakes.',
      'Create layered process audit checklists to verify procedural compliance.',
      'Facilitate Kaizen cycles to regularly update and enhance standard work.'
    ],
    supported_roles: [
      'Document Controller',
      'Quality Administrator',
      'Quality Controller'
    ],
    image: 'https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&w=1200&q=80'
  },
  {
    id: 'dmaic',
    slug: 'dmaic',
    title: 'DMAIC',
    delivery: 'Blended & Digital Learning',
    about: 'Apply the 5-phase problem-solving framework — Define, Measure, Analyse, Improve, Control — to systematically eliminate operational defects and process waste.',
    practical_tools: [
      'Project Charter Blueprints',
      'CTQ Trees',
      'FMEA Risk Matrices',
      'SPC Run Charts',
      'Process Capability Registers',
      'Tollgate Review Checklists'
    ],
    workplace_impact: 'Equips teams to permanently solve complex, recurring bottlenecks using empirical facts rather than assumptions, delivering measurable cost savings and process stability.',
    diagram_type: 'dmaic_chevrons',
    feature_chips: [
      '5-Phase Chevrons',
      'FMEA Risk Matrices',
      'SPC Control Charts',
      'Tollgate Verification'
    ],
    completion_outcomes: [
      'Apply the 5-phase DMAIC framework systematically to business workflows.',
      'Formulate rigorous project charters with quantifiable CTQ performance metrics.',
      'Measure baseline operational metrics, cycle times, and statistical variance.',
      'Conduct hypothesis testing and root-cause verification using empirical data.',
      'Design, risk-assess (FMEA), and execute pilot improvement solutions.',
      'Implement Statistical Process Control (SPC) and Control Plans for permanent sustainment.'
    ],
    supported_roles: [
      'Quality Controller',
      'Continuous Improvement Analyst',
      'Continuous Improvement Coordinator'
    ],
    image: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&w=1200&q=80'
  },
  {
    id: 'performance-management-systems',
    slug: 'performance-management-systems',
    title: 'Performance Management Systems',
    delivery: 'Blended & Digital Learning',
    about: 'Design and govern cohesive performance architectures, cascading strategic goals into measurable KPI trees and balanced review scorecards.',
    practical_tools: [
      'Strategic KPI Tree Cascades',
      'Balanced Scorecard Templates',
      'Operational Tier Boards',
      'Performance Review Guides',
      'Target Metric Trackers',
      'Individual Development Plans (IDP)'
    ],
    workplace_impact: 'Eliminates subjective performance evaluations, aligns departmental priorities towards corporate growth, fosters a culture of ownership and accountability, and provides early warnings on metric deviations.',
    diagram_type: 'kpi_tree',
    feature_chips: [
      'KPI Tree Cascades',
      'Balanced Scorecards',
      'Tier Review Boards',
      'Target Governance'
    ],
    completion_outcomes: [
      'Construct strategic KPI trees linked directly to operational execution.',
      'Design balanced performance scorecards across financial and operational metrics.',
      'Align employee targets and individual development plans with organizational objectives.',
      'Establish structured visual review rhythms and tier-meeting cadences.',
      'Analyze performance variances and deploy corrective action plans rapidly.',
      'Drive transparency, employee engagement, and accountability across teams.'
    ],
    supported_roles: [
      'Monitoring & Evaluation Officer',
      'Performance Monitoring Officer',
      'Junior Data Analyst'
    ],
    image: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=1200&q=80'
  },
  {
    id: 'root-cause-analysis',
    slug: 'root-cause-analysis',
    title: 'Root Cause Analysis',
    delivery: 'Blended & Digital Learning',
    about: 'Use structured diagnostic techniques including 5 Whys, Ishikawa (Fishbone) diagrams, and fault tree analysis to identify systemic causes and deploy permanent solutions.',
    practical_tools: [
      'Ishikawa Fishbone Diagrams',
      '5-Why Drill-down Sheets',
      'Pareto 80/20 Calculators',
      '5W2H Problem Definition Sheets',
      'Fault Tree Analysis (FTA)',
      'CAPA Verification Registers'
    ],
    workplace_impact: 'Prevents the expensive recurrence of critical defects and safety incidents, shifts team culture from finger-pointing to systemic problem-solving, and safeguards operational integrity.',
    diagram_type: 'ishikawa_fishbone',
    feature_chips: [
      'Ishikawa Fishbone',
      '5-Whys Methodology',
      'Pareto 80/20 Analysis',
      'CAPA Action Plans'
    ],
    completion_outcomes: [
      'Scope problem anomalies objectively using 5W2H data-gathering techniques.',
      'Facilitate cross-functional Ishikawa (Fishbone) 6M diagnostic brainstorming sessions.',
      'Execute disciplined 5-Why root cause drill-downs without making unverified leaps.',
      'Apply Pareto 80/20 principles to focus remediation on highest-impact failure modes.',
      'Develop robust, fail-safe Corrective and Preventive Action (CAPA) plans.',
      'Track implementation effectiveness to guarantee zero recurrence of critical defects.'
    ],
    supported_roles: [
      'Quality Controller',
      'Quality Assurance Controller',
      'Continuous Improvement Analyst'
    ],
    image: 'https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?auto=format&fit=crop&w=1200&q=80'
  }
];

export function getProgrammeBySlug(slug) {
  if (!slug) return null;
  const normalized = String(slug).toLowerCase().trim().replace(/_/g, '-');
  return (
    PROGRAMMES_DATA.find(p => p.slug === normalized || p.id === normalized || (p.aliases && p.aliases.includes(normalized))) ||
    PROGRAMMES_DATA.find(p => p.title.toLowerCase().replace(/\s+/g, '-').includes(normalized)) ||
    PROGRAMMES_DATA.find(p => normalized.includes(p.slug)) ||
    PROGRAMMES_DATA.find(p => p.slug.includes(normalized)) ||
    null
  );
}
