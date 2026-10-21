import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { ThemeToggle } from '../components/shared/ThemeToggle';
import './LmisCommon.css';

export const LmisTour = () => {
  const [activeTab, setActiveTab] = useState('learner');
  const [demoMark, setDemoMark] = useState(88);
  const [signedState, setSignedState] = useState(true);

  return (
    <div className="lp-root" style={{ minHeight: '100vh', background: 'var(--lmis-bg, #0B132B)', color: '#fff' }}>
      {/* Header */}
      <header className="lp-header" style={{ borderBottom: '1px solid rgba(255,255,255,0.08)', padding: '1rem 2rem' }}>
        <div className="lp-brand">
          <img src="/logo.svg" alt="NexaTransform" className="lp-brand-logo" />
          <span className="lp-brand-name">NEXA<span>TRANSFORM</span></span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <ThemeToggle />
          <Link to="/lmis" className="lp-back-link" style={{ fontSize: '0.88rem' }}>← Portals</Link>
          <Link to="/" className="lp-back-link" style={{ fontSize: '0.88rem' }}>Main Site</Link>
        </div>
      </header>

      {/* Hero */}
      <main style={{ maxWidth: '1180px', margin: '0 auto', padding: '2.5rem 1.25rem 4rem 1.25rem' }}>
        <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
          <span style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.45rem',
            padding: '0.35rem 0.95rem',
            borderRadius: '999px',
            background: 'rgba(56, 189, 248, 0.12)',
            border: '1px solid rgba(56, 189, 248, 0.3)',
            color: '#38bdf8',
            fontSize: '0.82rem',
            fontWeight: 700,
            textTransform: 'uppercase',
            letterSpacing: '0.06em',
            marginBottom: '0.85rem'
          }}>
            Interactive Platform Tour
          </span>
          <h1 style={{ fontSize: '2.4rem', fontWeight: 900, letterSpacing: '-0.03em', margin: '0 0 0.75rem 0', lineHeight: 1.15 }}>
            Look Inside the <span style={{ color: '#38bdf8' }}>NexaTransform LMIS</span>
          </h1>
          <p style={{ maxWidth: '720px', margin: '0 auto', color: '#94a3b8', fontSize: '1.05rem', lineHeight: 1.6 }}>
            Explore how our high-performance Learner Management Information System delivers paperless Portfolio of Evidence (PoE) workflows, continuous assessment, and corporate sponsor visibility.
          </p>

          {/* Tab Controls */}
          <div style={{
            display: 'inline-flex',
            gap: '0.5rem',
            padding: '0.4rem',
            borderRadius: '14px',
            background: 'rgba(15, 23, 42, 0.65)',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            marginTop: '2rem',
            flexWrap: 'wrap',
            justifyContent: 'center'
          }}>
            <button
              onClick={() => setActiveTab('learner')}
              style={{
                padding: '0.65rem 1.4rem',
                borderRadius: '10px',
                border: 'none',
                background: activeTab === 'learner' ? '#0284c7' : 'transparent',
                color: activeTab === 'learner' ? '#ffffff' : '#94a3b8',
                fontWeight: 700,
                fontSize: '0.92rem',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                transition: 'all 0.2s ease'
              }}
            >
              <span>🎓</span> Learner Experience
            </button>
            <button
              onClick={() => setActiveTab('lecturer')}
              style={{
                padding: '0.65rem 1.4rem',
                borderRadius: '10px',
                border: 'none',
                background: activeTab === 'lecturer' ? '#0284c7' : 'transparent',
                color: activeTab === 'lecturer' ? '#ffffff' : '#94a3b8',
                fontWeight: 700,
                fontSize: '0.92rem',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                transition: 'all 0.2s ease'
              }}
            >
              <span>📋</span> Faculty &amp; Grading Console
            </button>
            <button
              onClick={() => setActiveTab('sponsor')}
              style={{
                padding: '0.65rem 1.4rem',
                borderRadius: '10px',
                border: 'none',
                background: activeTab === 'sponsor' ? '#0284c7' : 'transparent',
                color: activeTab === 'sponsor' ? '#ffffff' : '#94a3b8',
                fontWeight: 700,
                fontSize: '0.92rem',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                transition: 'all 0.2s ease'
              }}
            >
              <span>🏛️</span> Institutional &amp; Sponsor View
            </button>
          </div>
        </div>

        {/* Live Interactive Tour Stage */}
        <div style={{
          background: 'rgba(15, 23, 42, 0.75)',
          border: '1px solid rgba(56, 189, 248, 0.2)',
          borderRadius: '20px',
          padding: '2rem',
          boxShadow: '0 20px 40px -15px rgba(0,0,0,0.5)',
          backdropFilter: 'blur(12px)'
        }}>
          {activeTab === 'learner' && (
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem', borderBottom: '1px solid rgba(255,255,255,0.08)', paddingBottom: '1.25rem', marginBottom: '1.75rem' }}>
                <div>
                  <span style={{ fontSize: '0.78rem', color: '#38bdf8', fontWeight: 700, textTransform: 'uppercase' }}>Learner Module Interface</span>
                  <h3 style={{ fontSize: '1.45rem', fontWeight: 800, margin: '0.2rem 0' }}>BPM-201: Business Process Model and Notation (BPMN 2.0)</h3>
                  <span style={{ fontSize: '0.85rem', color: '#94a3b8' }}>Student Number: NX-2026-0842 • Enrolled Track: Enterprise Process Automation</span>
                </div>
                <div style={{ background: 'rgba(16, 185, 129, 0.15)', border: '1px solid rgba(16, 185, 129, 0.3)', padding: '0.5rem 1rem', borderRadius: '10px', color: '#34d399', fontSize: '0.88rem', fontWeight: 700 }}>
                  Active Grade: 91% (Competent)
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.5rem', marginBottom: '1.75rem' }}>
                {/* Feature Card 1 */}
                <div style={{ background: 'rgba(30, 41, 59, 0.7)', borderRadius: '14px', padding: '1.25rem', border: '1px solid rgba(255,255,255,0.06)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '0.75rem' }}>
                    <span style={{ background: '#0284c7', color: '#fff', padding: '0.35rem 0.55rem', borderRadius: '8px', fontSize: '0.85rem' }}>01</span>
                    <strong style={{ fontSize: '0.98rem' }}>Practical Video Modules &amp; SOPs</strong>
                  </div>
                  <p style={{ fontSize: '0.85rem', color: '#cbd5e1', lineHeight: 1.5, margin: 0 }}>
                    HD instructional breakdowns walking through live workflows, boundary events, subprocesses, and BPMN 2.0 gateway logic.
                  </p>
                  <div style={{ marginTop: '1rem', background: '#0284c715', border: '1px dashed #0284c755', padding: '0.65rem', borderRadius: '8px', fontSize: '0.8rem', color: '#38bdf8' }}>
                    ✓ 8 of 8 Video Lessons Completed
                  </div>
                </div>

                {/* Feature Card 2 */}
                <div style={{ background: 'rgba(30, 41, 59, 0.7)', borderRadius: '14px', padding: '1.25rem', border: '1px solid rgba(255,255,255,0.06)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '0.75rem' }}>
                    <span style={{ background: '#059669', color: '#fff', padding: '0.35rem 0.55rem', borderRadius: '8px', fontSize: '0.85rem' }}>02</span>
                    <strong style={{ fontSize: '0.98rem' }}>Secure Assignment Dropbox</strong>
                  </div>
                  <p style={{ fontSize: '0.85rem', color: '#cbd5e1', lineHeight: 1.5, margin: 0 }}>
                    Upload business cases, BPMN diagrams, and process audits with automatic file sanitization and 50MB ceiling protection.
                  </p>
                  <div style={{ marginTop: '1rem', background: '#05966915', border: '1px solid #05966944', padding: '0.65rem', borderRadius: '8px', fontSize: '0.8rem', color: '#34d399' }}>
                    📎 BPMN_Dispatch_Workflow_V2.pdf (Validated)
                  </div>
                </div>

                {/* Feature Card 3 */}
                <div style={{ background: 'rgba(30, 41, 59, 0.7)', borderRadius: '14px', padding: '1.25rem', border: '1px solid rgba(255,255,255,0.06)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '0.75rem' }}>
                    <span style={{ background: '#7c3aed', color: '#fff', padding: '0.35rem 0.55rem', borderRadius: '8px', fontSize: '0.85rem' }}>03</span>
                    <strong style={{ fontSize: '0.98rem' }}>Digital Signature &amp; Declaration</strong>
                  </div>
                  <p style={{ fontSize: '0.85rem', color: '#cbd5e1', lineHeight: 1.5, margin: 0 }}>
                    Learners sign an electronic authenticity declaration embedded directly into their Portfolio of Evidence (PoE).
                  </p>
                  <div style={{ marginTop: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <button
                      onClick={() => setSignedState(!signedState)}
                      style={{
                        padding: '0.4rem 0.8rem',
                        borderRadius: '6px',
                        background: signedState ? 'rgba(16, 185, 129, 0.2)' : 'rgba(239, 68, 68, 0.2)',
                        border: signedState ? '1px solid #10b981' : '1px solid #ef4444',
                        color: signedState ? '#34d399' : '#f87171',
                        fontSize: '0.8rem',
                        fontWeight: 600,
                        cursor: 'pointer'
                      }}
                    >
                      {signedState ? '✓ Declaration Digitally Signed' : 'Click to Sign Declaration'}
                    </button>
                  </div>
                </div>
              </div>

              {/* PoE Download Preview Callout */}
              <div style={{ background: 'rgba(2, 132, 199, 0.1)', border: '1px solid rgba(2, 132, 199, 0.25)', borderRadius: '12px', padding: '1rem 1.25rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                  <span style={{ fontSize: '1.75rem' }}>📄</span>
                  <div>
                    <strong style={{ display: 'block', fontSize: '0.95rem' }}>Automated Portfolio of Evidence (PoE) PDF Engine</strong>
                    <span style={{ fontSize: '0.82rem', color: '#94a3b8' }}>Generates multi-page institutional documentation with assessment declarations and cryptographic verification tokens.</span>
                  </div>
                </div>
                <Link to="/verify" style={{ padding: '0.55rem 1rem', borderRadius: '8px', background: '#0284c7', color: '#fff', fontSize: '0.85rem', fontWeight: 700, textDecoration: 'none' }}>
                  Test Verification Token →
                </Link>
              </div>
            </div>
          )}

          {activeTab === 'lecturer' && (
            <div>
              <div style={{ borderBottom: '1px solid rgba(255,255,255,0.08)', paddingBottom: '1.25rem', marginBottom: '1.75rem' }}>
                <span style={{ fontSize: '0.78rem', color: '#38bdf8', fontWeight: 700, textTransform: 'uppercase' }}>Faculty Assessment Console</span>
                <h3 style={{ fontSize: '1.45rem', fontWeight: 800, margin: '0.2rem 0' }}>Cohort Grading &amp; Practical Competency Evaluation</h3>
                <span style={{ fontSize: '0.85rem', color: '#94a3b8' }}>Appointed Assessor: Lead Process Engineer • Cohort: Enterprise Operations 2026</span>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1.5rem', marginBottom: '1.75rem' }}>
                <div style={{ background: 'rgba(30, 41, 59, 0.7)', borderRadius: '14px', padding: '1.5rem', border: '1px solid rgba(255,255,255,0.06)' }}>
                  <h4 style={{ fontSize: '1rem', fontWeight: 700, margin: '0 0 1rem 0', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <span>⚖️</span> Interactive Assessment Rubric
                  </h4>
                  <div style={{ marginBottom: '1.25rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', marginBottom: '0.35rem' }}>
                      <span style={{ color: '#cbd5e1' }}>Applied Process Mapping Accuracy</span>
                      <strong style={{ color: '#38bdf8' }}>{demoMark}%</strong>
                    </div>
                    <input
                      type="range"
                      min="50"
                      max="100"
                      value={demoMark}
                      onChange={(e) => setDemoMark(Number(e.target.value))}
                      style={{ width: '100%', accentColor: '#0284c7' }}
                    />
                  </div>
                  <div style={{ background: 'rgba(15, 23, 42, 0.6)', padding: '0.85rem', borderRadius: '8px', fontSize: '0.82rem', color: '#94a3b8', lineHeight: 1.5 }}>
                    <strong>Assessor Feedback:</strong> "Process diagram correctly identifies boundary events and error throw states. Well-structured swimlanes aligned with operational reality."
                  </div>
                </div>

                <div style={{ background: 'rgba(30, 41, 59, 0.7)', borderRadius: '14px', padding: '1.5rem', border: '1px solid rgba(255,255,255,0.06)' }}>
                  <h4 style={{ fontSize: '1rem', fontWeight: 700, margin: '0 0 1rem 0', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <span>🔒</span> Grade Integrity &amp; Immutable Audit Trail
                  </h4>
                  <p style={{ fontSize: '0.85rem', color: '#cbd5e1', lineHeight: 1.5 }}>
                    Every grade alteration is tracked in the system audit log with assessor ID, previous score, updated score, and timestamp.
                  </p>
                  <div style={{ background: '#10b98115', border: '1px solid #10b98144', padding: '0.75rem', borderRadius: '8px', fontSize: '0.8rem', color: '#34d399' }}>
                    ✓ Cryptographic Mark Lock Active (Tamper-Resistant)
                  </div>
                  <div style={{ marginTop: '0.75rem', fontSize: '0.78rem', color: '#94a3b8' }}>
                    Electronic Assessor Declaration attached upon final grade lock.
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'sponsor' && (
            <div>
              <div style={{ borderBottom: '1px solid rgba(255,255,255,0.08)', paddingBottom: '1.25rem', marginBottom: '1.75rem' }}>
                <span style={{ fontSize: '0.78rem', color: '#38bdf8', fontWeight: 700, textTransform: 'uppercase' }}>Corporate Sponsor &amp; Compliance Hub</span>
                <h3 style={{ fontSize: '1.45rem', fontWeight: 800, margin: '0.2rem 0' }}>Real-Time Workforce Upskilling Telemetry</h3>
                <span style={{ fontSize: '0.85rem', color: '#94a3b8' }}>Designed for Chief Operations Officers, HR Directors, and Transformation Managers</span>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1rem', marginBottom: '1.75rem' }}>
                <div style={{ background: 'rgba(30, 41, 59, 0.7)', borderRadius: '12px', padding: '1.2rem', textAlign: 'center', border: '1px solid rgba(255,255,255,0.06)' }}>
                  <span style={{ fontSize: '1.8rem', fontWeight: 900, color: '#38bdf8' }}>94.2%</span>
                  <div style={{ fontSize: '0.82rem', color: '#94a3b8', marginTop: '0.25rem' }}>Cohort Completion Rate</div>
                </div>
                <div style={{ background: 'rgba(30, 41, 59, 0.7)', borderRadius: '12px', padding: '1.2rem', textAlign: 'center', border: '1px solid rgba(255,255,255,0.06)' }}>
                  <span style={{ fontSize: '1.8rem', fontWeight: 900, color: '#34d399' }}>100%</span>
                  <div style={{ fontSize: '0.82rem', color: '#94a3b8', marginTop: '0.25rem' }}>Paperless PoE Compliance</div>
                </div>
                <div style={{ background: 'rgba(30, 41, 59, 0.7)', borderRadius: '12px', padding: '1.2rem', textAlign: 'center', border: '1px solid rgba(255,255,255,0.06)' }}>
                  <span style={{ fontSize: '1.8rem', fontWeight: 900, color: '#a78bfa' }}>30 Min</span>
                  <div style={{ fontSize: '0.82rem', color: '#94a3b8', marginTop: '0.25rem' }}>Auto Session Inactivity Lock</div>
                </div>
                <div style={{ background: 'rgba(30, 41, 59, 0.7)', borderRadius: '12px', padding: '1.2rem', textAlign: 'center', border: '1px solid rgba(255,255,255,0.06)' }}>
                  <span style={{ fontSize: '1.8rem', fontWeight: 900, color: '#f59e0b' }}>POPIA</span>
                  <div style={{ fontSize: '0.82rem', color: '#94a3b8', marginTop: '0.25rem' }}>Protected National Data</div>
                </div>
              </div>

              <div style={{ background: 'rgba(30, 41, 59, 0.6)', borderRadius: '12px', padding: '1.25rem', border: '1px solid rgba(255,255,255,0.08)' }}>
                <strong style={{ fontSize: '0.95rem', display: 'block', marginBottom: '0.35rem' }}>Export-Ready Institutional Reporting</strong>
                <p style={{ fontSize: '0.85rem', color: '#cbd5e1', lineHeight: 1.5, margin: 0 }}>
                  Corporate sponsors and enterprise clients receive real-time CSV and PDF exports summarizing cohort competencies, practical attendance registers, and verified digital transcripts.
                </p>
              </div>
            </div>
          )}
        </div>

        {/* CTA Banner */}
        <div style={{
          marginTop: '3.5rem',
          textAlign: 'center',
          background: 'linear-gradient(135deg, rgba(2, 132, 199, 0.2), rgba(15, 23, 42, 0.8))',
          border: '1px solid rgba(56, 189, 248, 0.3)',
          borderRadius: '16px',
          padding: '2.5rem 1.5rem'
        }}>
          <h3 style={{ fontSize: '1.65rem', fontWeight: 800, margin: '0 0 0.5rem 0' }}>Ready to Deploy for Your Enterprise?</h3>
          <p style={{ maxWidth: '600px', margin: '0 auto 1.5rem auto', color: '#94a3b8', fontSize: '0.95rem' }}>
            Book a tailored diagnostic consultation. We evaluate your workflow bottlenecks, workforce capability gaps, and craft a clear project charter.
          </p>
          <div style={{ display: 'flex', justifyContent: 'center', gap: '1rem', flexWrap: 'wrap' }}>
            <Link to="/contact" style={{
              padding: '0.75rem 1.6rem',
              borderRadius: '10px',
              background: '#0284c7',
              color: '#ffffff',
              fontWeight: 700,
              fontSize: '0.92rem',
              textDecoration: 'none'
            }}>
              Consult with Our Team →
            </Link>
            <Link to="/lmis" style={{
              padding: '0.75rem 1.6rem',
              borderRadius: '10px',
              background: 'rgba(255,255,255,0.08)',
              color: '#ffffff',
              fontWeight: 600,
              fontSize: '0.92rem',
              textDecoration: 'none',
              border: '1px solid rgba(255,255,255,0.15)'
            }}>
              Go to Institutional Portals
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
};

export default LmisTour;
