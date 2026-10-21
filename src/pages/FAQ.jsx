import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Plus, Check, HelpCircle } from 'lucide-react';
import './FAQ.css';

const faqs = [
  {
    category: 'Operational Transformation',
    question: 'How does Nexa eliminate operational bottlenecks without disrupting daily business?',
    answer: 'We deploy a process-first methodology that never requires shutting down your existing operations. We begin by mapping your workflows (BPMN 2.0) to isolate the 20% of friction points causing 80% of delays. We then build and test lightweight digital pipelines alongside your current systems, migrating staff only after workflows are verified and frontline adoption is secured.',
    points: [
      {
        title: 'Zero Downtime Architecture',
        desc: 'New automations and portals run in parallel until your operational teams validate full data integrity.'
      },
      {
        title: 'Frontline-Led Change',
        desc: 'We involve your team leads during the process mapping phase to ensure zero user resistance upon rollout.'
      },
      {
        title: 'Quantified Time Savings',
        desc: 'Average engagements eliminate 15+ hours of manual administrative rework per employee each week.'
      }
    ]
  },
  {
    category: 'Custom Systems & IP Ownership',
    question: 'Why build a custom portal or software with Nexa instead of buying an off-the-shelf SaaS package?',
    answer: 'Generic off-the-shelf software forces your business into someone else’s rigid workflow, requires costly workarounds, and charges recurring per-user licensing taxes that grow as your company expands. With Nexa, your system is tailored directly to your operating model, integrates with your current infrastructure, and you own 100% of the intellectual property.',
    points: [
      {
        title: 'Complete IP Ownership',
        desc: '100% of the bespoke source code, database architecture, and digital assets belong exclusively to you.'
      },
      {
        title: 'Zero Perpetual User Taxes',
        desc: 'No monthly per-seat licensing fees. Your software costs remain fixed regardless of how many employees use the system.'
      },
      {
        title: 'Exact Operational Fit',
        desc: 'Engineered specifically around your internal approvals, role hierarchies, and reporting standards.'
      }
    ]
  },
  {
    category: 'Structured Problem Solving (DMAIC)',
    question: 'How does Nexa solve complex operational problems using DMAIC?',
    answer: 'We use the rigorous DMAIC framework (Define, Measure, Analyze, Improve, Control) to eliminate recurring operational defects, workflow bottlenecks, and process variances at their root—rather than applying temporary superficial band-aids.',
    points: [
      {
        title: 'Define & Measure',
        desc: 'We precisely scope the operational failure, establish baseline performance metrics, and gather empirical workflow data.'
      },
      {
        title: 'Analyze Root Causes',
        desc: 'We identify the underlying drivers of variation and inefficiency using root cause analysis tools (Ishikawa, 5 Whys, and process mapping) rather than assumptions.'
      },
      {
        title: 'Improve & Control',
        desc: 'We design and test targeted process solutions, embed standard operating procedures (SOPs), and install control monitoring to permanently sustain performance gains.'
      }
    ]
  },
  {
    category: 'Web Design & Digital Skills',
    question: 'Does Nexa teach individuals and teams how to build and manage professional websites?',
    answer: 'Yes. Through our hands-on applied masterclasses, we teach teams, professionals, and business owners how to architect, design, deploy, and manage modern enterprise websites from scratch—without unnecessary coding complexity.',
    points: [
      {
        title: 'Hands-On Web Architecture',
        desc: 'Learn how to structure, build, and publish modern, responsive, mobile-optimized websites that convert visitors.'
      },
      {
        title: 'Domain, Hosting & DNS Management',
        desc: 'Master real-world infrastructure: managing custom domains, DNS records, SSL certificates, and professional business email setups.'
      },
      {
        title: 'SEO, Speed & Legal Compliance',
        desc: 'Implement practical on-page SEO strategies, speed optimization, contact inquiry workflows, and legal compliance (POPIA/GDPR).'
      }
    ]
  },
  {
    category: 'Diagnostic & Project Charter',
    question: 'How does an engagement with Nexa work before we commit to a full project?',
    answer: 'We never ask organisations to commit to large-scale implementations blindly. Every engagement begins with a structured Diagnostic Discovery phase, where we analyze your existing workflows and draft a comprehensive Project Charter before any development or contract execution begins.',
    points: [
      {
        title: 'Diagnostic Discovery Phase',
        desc: 'We conduct a focused assessment to evaluate your current processes, friction points, data silos, and stakeholder requirements.'
      },
      {
        title: 'Comprehensive Project Charter',
        desc: 'We draft a formal Project Charter detailing the exact problem statement, business objectives, project scope, boundaries, and measurable outcomes.'
      },
      {
        title: 'Informed Executive Decision',
        desc: 'You review the validated process map, proposed architecture, and expected operational impact before deciding whether to proceed with full implementation.'
      }
    ]
  }
];

export const FAQ = () => {
  const [openIndex, setOpenIndex] = useState(0);

  useEffect(() => {
    window.scrollTo(0, 0);
    document.title = 'Frequently Asked Questions | Nexa Transform Group';

    const schemaId = 'faq-structured-data';
    let script = document.getElementById(schemaId);
    if (!script) {
      script = document.createElement('script');
      script.id = schemaId;
      script.type = 'application/ld+json';
      document.head.appendChild(script);
    }

    const structuredData = {
      '@context': 'https://schema.org',
      '@type': 'FAQPage',
      'mainEntity': faqs.map(item => ({
        '@type': 'Question',
        'name': item.question,
        'acceptedAnswer': {
          '@type': 'Answer',
          'text': `${item.answer} ${item.points.map(p => p.title + ': ' + p.desc).join(' ')}`
        }
      }))
    };

    script.textContent = JSON.stringify(structuredData);

    return () => {
      const el = document.getElementById(schemaId);
      if (el) el.remove();
    };
  }, []);

  const toggleFaq = (index) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <div className="faq-root pt-10 pb-16">
      {/* Compact Hero Header */}
      <div className="container mx-auto px-4 max-w-2xl mb-8 text-center">
        <div className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full bg-white border border-slate-200 text-slate-600 text-[11px] font-semibold tracking-wider uppercase mb-3 shadow-2xs">
          <HelpCircle size={13} className="text-[#0891B2]" />
          <span>Frequently Asked Questions</span>
        </div>

        <h1 className="text-2xl sm:text-3xl font-extrabold text-[#0B132B] tracking-tight leading-snug mb-2">
          Partnering with Nexa Transform Group
        </h1>
        <p className="text-slate-500 text-xs sm:text-sm leading-relaxed max-w-lg mx-auto">
          Direct, practical answers about our process engineering methodology, bespoke systems development, and project charters.
        </p>
      </div>

      {/* Compact Accordion Questions List */}
      <div className="container mx-auto px-4 max-w-2xl space-y-2.5 mb-12">
        {faqs.map((faq, index) => {
          const isOpen = openIndex === index;

          return (
            <div
              key={index}
              className={`faq-item-card ${isOpen ? 'is-open' : ''}`}
            >
              <button
                onClick={() => toggleFaq(index)}
                className="faq-question-btn"
                aria-expanded={isOpen}
              >
                <div>
                  <span className="faq-category-tag">{faq.category}</span>
                  <h2 className="text-xs sm:text-sm font-bold text-[#0B132B] leading-snug">
                    {faq.question}
                  </h2>
                </div>
                <div className="faq-indicator" aria-hidden="true">
                  <Plus size={14} />
                </div>
              </button>

              {isOpen && (
                <div className="faq-answer-content">
                  <p className="pt-2 text-slate-600 text-xs sm:text-sm leading-relaxed mb-3">
                    {faq.answer}
                  </p>

                  <div className="space-y-2 pt-1 mb-1">
                    {faq.points.map((point, pIdx) => (
                      <div key={pIdx} className="faq-point">
                        <div className="faq-point-icon">
                          <Check size={10} strokeWidth={3} />
                        </div>
                        <div>
                          <h3 className="text-xs font-bold text-[#0B132B] mb-0.5">
                            {point.title}
                          </h3>
                          <p className="text-xs text-slate-500 leading-normal">
                            {point.desc}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Compact Executive Consultation Callout */}
      <div className="container mx-auto px-4 max-w-2xl">
        <div
          style={{ backgroundColor: '#0B132B' }}
          className="rounded-2xl p-6 sm:p-8 text-center text-white shadow-lg relative overflow-hidden"
        >
          <div className="max-w-md mx-auto">
            <span
              style={{ backgroundColor: 'rgba(6, 182, 212, 0.15)', color: '#06B6D4' }}
              className="px-3 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider inline-block mb-2"
            >
              Diagnostic Discovery Session
            </span>
            <h2 className="text-lg sm:text-xl font-bold text-white mb-2">
              Have a Specific Operational Challenge in Mind?
            </h2>
            <p className="text-slate-300 text-xs sm:text-sm leading-relaxed mb-5">
              Connect directly with our process engineering team to review your workflows and project requirements.
            </p>
            <div className="flex flex-wrap justify-center items-center gap-3">
              <Link
                to="/contact"
                style={{ backgroundColor: '#06B6D4', color: '#0B132B' }}
                className="btn font-bold px-5 py-2.5 rounded-lg text-xs hover:opacity-90 shadow-sm"
              >
                Book a Consultation
              </Link>
              <Link
                to="/services"
                style={{ backgroundColor: '#1C2541', color: '#FFFFFF', border: '1px solid rgba(255, 255, 255, 0.25)' }}
                className="btn font-medium px-5 py-2.5 rounded-lg text-xs hover:bg-slate-800"
              >
                Explore Services
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FAQ;
