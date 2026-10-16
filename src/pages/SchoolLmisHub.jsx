import React from 'react';
import { Link } from 'react-router-dom';
import { ThemeToggle } from '../components/shared/ThemeToggle';
import './LmisCommon.css';

export const SchoolLmisHub = () => {
  return (
    <div className="lp-root">
      <div className="lp-grid-bg" />

      {/* Header */}
      <header className="lp-header">
        <div className="lp-brand">
          <img src="/logo.svg" alt="NexaTransform" className="lp-brand-logo" />
          <span className="lp-brand-name">NEXA<span>TRANSFORM</span></span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
          <ThemeToggle />
          <Link to="/schools" className="lp-back-link">← Schools Solution</Link>
          <Link to="/lmis" className="lp-back-link">Skills Academy LMIS →</Link>
        </div>
      </header>

      {/* Main */}
      <main className="lp-main">
        <span className="lp-eyebrow">School Management Information System (K-12 Edition)</span>
        <h1 className="lp-title">NEXA<span>TRANSFORM</span><br />SCHOOL LMIS</h1>
        <p className="lp-subtitle">Select your institutional portal to continue</p>

        <div className="lp-cards" style={{ maxWidth: '960px' }}>
          {/* School Admin Portal */}
          <Link to="/schools/lmis/admin" className="lp-card">
            <div className="lp-card-icon">
              <svg width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/>
              </svg>
            </div>
            <h3 className="lp-card-title">School Admin Portal</h3>
            <p className="lp-card-desc">
              Authorized principals, SGB &amp; administrators: school configuration, student admissions, teacher rosters, term dates, and 1-click batch term report card generation.
            </p>
            <span className="lp-card-btn">
              Enter as School Admin
              <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
            </span>
          </Link>

          {/* Teacher / Educator Portal */}
          <Link to="/schools/lmis/teacher" className="lp-card">
            <div className="lp-card-icon">
              <svg width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <rect x="3" y="3" width="18" height="18" rx="2"/><path d="M3 9h18M9 21V9"/>
              </svg>
            </div>
            <h3 className="lp-card-title">Educator Portal</h3>
            <p className="lp-card-desc">
              Appointed teachers &amp; subject educators: morning homeroom roll call, period registers (cross-class electives), sports exemption badges, and CAPS term markbooks.
            </p>
            <span className="lp-card-btn">
              Enter as Educator
              <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
            </span>
          </Link>

          {/* Pupil & Parent Portal */}
          <Link to="/schools/lmis/student" className="lp-card">
            <div className="lp-card-icon">
              <svg width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path d="M22 10v6M2 10l10-5 10 5-10 5z"/><path d="M6 12v5c3 3 9 3 12 0v-5"/>
              </svg>
            </div>
            <h3 className="lp-card-title">Pupil &amp; Parent Portal</h3>
            <p className="lp-card-desc">
              Enrolled learners &amp; parents: view daily timetables, period attendance, homework, and download verified official term report cards with principal seal and QR verification.
            </p>
            <span className="lp-card-btn">
              Enter as Pupil / Parent
              <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
            </span>
          </Link>
        </div>
      </main>

      {/* Footer */}
      <footer className="lp-footer">
        <span className="lp-footer-copy">© {new Date().getFullYear()} NexaTransform School LMIS • K-12 Cloud Platform</span>
        <div className="lp-footer-values">
          {['Academic Excellence','POPIA Compliant','Offline Resilient','CAPS Aligned','Zero-Paper'].map(v => (
            <span key={v} className="lp-footer-value">
              <svg width="10" height="10" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"/></svg>
              {v}
            </span>
          ))}
        </div>
      </footer>
    </div>
  );
};
