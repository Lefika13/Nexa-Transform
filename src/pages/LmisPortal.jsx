import React from 'react';
import { Link } from 'react-router-dom';
import { ThemeToggle } from '../components/shared/ThemeToggle';
import './LmisCommon.css';

export const LmisPortal = () => {
  const isSessionExpired = typeof window !== 'undefined' && new URLSearchParams(window.location.search).get('session_expired') === 'true';

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
          <Link to="/" className="lp-back-link">← Main Site</Link>
        </div>
      </header>

      {/* Main */}
      <main className="lp-main">
        <span className="lp-eyebrow">Learner Management Information System</span>
        <h1 className="lp-title">NEXA<span>TRANSFORM</span><br />HUB LMIS</h1>
        <p className="lp-subtitle">Select your institutional portal to continue</p>

        {/* Public Transparency & Verification Action Badges */}
        <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'center', flexWrap: 'wrap', margin: '0.5rem auto 2rem auto', maxWidth: '780px' }}>
          <Link to="/lmis/tour" style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.45rem',
            padding: '0.45rem 1rem',
            borderRadius: '999px',
            background: 'rgba(56, 189, 248, 0.12)',
            border: '1px solid rgba(56, 189, 248, 0.35)',
            color: '#38bdf8',
            fontSize: '0.85rem',
            fontWeight: 700,
            textDecoration: 'none'
          }}>
            <svg width="15" height="15" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><polygon points="5 3 19 12 5 21 5 3"/></svg>
            Look Inside the LMIS: Interactive Product Tour →
          </Link>
          <Link to="/verify" style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.45rem',
            padding: '0.45rem 1rem',
            borderRadius: '999px',
            background: 'rgba(16, 185, 129, 0.12)',
            border: '1px solid rgba(16, 185, 129, 0.35)',
            color: '#34d399',
            fontSize: '0.85rem',
            fontWeight: 700,
            textDecoration: 'none'
          }}>
            <svg width="15" height="15" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
            Verify Certificate / PoE Record →
          </Link>
        </div>

        {isSessionExpired && (
          <div style={{
            maxWidth: '960px',
            margin: '0 auto 1.75rem auto',
            padding: '1rem 1.25rem',
            borderRadius: '12px',
            background: 'rgba(239, 68, 68, 0.12)',
            border: '1px solid rgba(239, 68, 68, 0.3)',
            color: '#ef4444',
            display: 'flex',
            alignItems: 'center',
            gap: '0.75rem',
            fontSize: '0.92rem',
            textAlign: 'left',
            boxShadow: '0 4px 12px rgba(0,0,0,0.08)'
          }}>
            <svg width="22" height="22" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" style={{ flexShrink: 0 }}>
              <circle cx="12" cy="12" r="10" />
              <polyline points="12 6 12 12 16 14" />
            </svg>
            <div>
              <strong style={{ display: 'block', marginBottom: '0.15rem' }}>Session Expired for Security</strong>
              <span>Your LMIS session was automatically signed out due to 30 minutes of inactivity, or upon closing your browser. Please select your portal to sign in again.</span>
            </div>
          </div>
        )}

        <div className="lp-cards" style={{ maxWidth: '960px' }}>
          {/* Admin */}
          <Link to="/lmis/admin" className="lp-card">
            <div className="lp-card-icon">
              <svg width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/></svg>
            </div>
            <h3 className="lp-card-title">Admin Portal</h3>
            <p className="lp-card-desc">Authorized administrators: manage programmes, register learners, onboard faculty, handle compliance, finance and institutional reporting.</p>
            <span className="lp-card-btn">
              Enter as Admin
              <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
            </span>
          </Link>

          {/* Lecturer Portal */}
          <Link to="/lmis/lecturer" className="lp-card">
            <div className="lp-card-icon">
              <svg width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><rect x="3" y="3" width="18" height="18" rx="2"/><path d="M3 9h18M9 21V9"/></svg>
            </div>
            <h3 className="lp-card-title">Lecturer Portal</h3>
            <p className="lp-card-desc">Appointed faculty &amp; assessors: manage courses, create assignments, grade submissions, record electronic assessment signatures, and track attendance.</p>
            <span className="lp-card-btn">
              Enter as Lecturer
              <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
            </span>
          </Link>

          {/* Learner Portal */}
          <Link to="/lmis/learner" className="lp-card">
            <div className="lp-card-icon">
              <svg width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M22 10v6M2 10l10-5 10 5-10 5z"/><path d="M6 12v5c3 3 9 3 12 0v-5"/></svg>
            </div>
            <h3 className="lp-card-title">Learner Portal</h3>
            <p className="lp-card-desc">Enrolled learners: access video lessons, submit assignments, take quizzes, sign digital declarations, and download verified PoE records.</p>
            <span className="lp-card-btn">
              Enter as Learner
              <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
            </span>
          </Link>

          {/* Primary & High School LMIS — Coming Soon (code preserved for development) */}
          {/* <Link to="/school-portal" className="lp-card" style={{ borderColor: 'rgba(56, 189, 248, 0.4)', background: 'linear-gradient(135deg, rgba(30, 41, 59, 0.7), rgba(2, 132, 199, 0.15))' }}>
            ...School LMIS Card...
          </Link> */}
        </div>
      </main>

      {/* Footer */}
      <footer className="lp-footer">
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '1.25rem',
          flexWrap: 'wrap',
          marginBottom: '1rem',
          fontSize: '0.78rem',
          color: '#64748b'
        }}>
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem' }}>
            <svg width="12" height="12" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
            256-Bit TLS In-Transit Encryption
          </span>
          <span>•</span>
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem' }}>
            <svg width="12" height="12" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
            30-Minute Inactivity Protection
          </span>
          <span>•</span>
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem' }}>
            <svg width="12" height="12" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
            POPIA Statutory Data Governance
          </span>
        </div>
        <span className="lp-footer-copy">© {new Date().getFullYear()} NexaTransform Hub</span>
        <div className="lp-footer-values">
          {['Integrity','Innovation','Excellence','Collaboration','Impact'].map(v => (
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
