import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../supabaseClient';
import './LmisCommon.css';

export default function ResetPassword() {
  const navigate  = useNavigate();
  const [password,  setPassword]  = useState('');
  const [confirm,   setConfirm]   = useState('');
  const [showPass,  setShowPass]  = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [status,    setStatus]    = useState('');
  const [error,     setError]     = useState('');
  const [loading,   setLoading]   = useState(false);
  const [hasSession, setHasSession] = useState(false);

  useEffect(() => {
    // Confirm there is an active password-recovery session
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) { setHasSession(true); }
      else { setError('Your reset link has expired or was already used. Please request a new one.'); }
    });
  }, []);

  const handleReset = async (e) => {
    e.preventDefault();
    setError('');
    setStatus('');

    if (password.length < 8) {
      setError('Password must be at least 8 characters.'); return;
    }
    if (password !== confirm) {
      setError('Passwords do not match.'); return;
    }

    setLoading(true);
    const { error: updErr } = await supabase.auth.updateUser({ password });
    setLoading(false);

    if (updErr) { setError(updErr.message); return; }

    setStatus('Password updated successfully! Redirecting you to sign in\u2026');
    await supabase.auth.signOut();
    setTimeout(() => navigate('/lmis'), 2500);
  };

  return (
    <div className="lmis-login-overlay">
      <div className="lmis-login-bg" />
      <div className="lmis-login-card">
        <img src="/logo.svg" alt="NX" className="lmis-login-logo" />
        <h2 className="lmis-login-title">Reset Password</h2>
        <p className="lmis-login-sub">NexaTransform Hub LMIS</p>

        {status ? (
          <div style={{ marginTop:'1.5rem', padding:'1rem', background:'rgba(34,197,94,0.15)', border:'1px solid rgba(34,197,94,0.4)', borderRadius:'0.75rem', color:'#86efac', textAlign:'center' }}>
            <p style={{ margin:0, fontWeight:600 }}>\u2713 {status}</p>
          </div>
        ) : error && !hasSession ? (
          <>
            <div style={{ marginTop:'1.5rem', padding:'1rem', background:'rgba(239,68,68,0.15)', border:'1px solid rgba(239,68,68,0.4)', borderRadius:'0.75rem', color:'#fca5a5' }}>
              <p style={{ margin:0, fontWeight:600 }}>\u26a0 Session Expired</p>
              <p style={{ margin:'0.5rem 0 0', fontSize:'0.875rem', opacity:0.9 }}>{error}</p>
            </div>
            <button className="lmis-login-btn" style={{ marginTop:'1.5rem' }} onClick={() => navigate('/lmis')}>\u2190 Back to LMIS</button>
          </>
        ) : (
          <form onSubmit={handleReset} className="lmis-login-form">
            <p className="lmis-login-role">Enter your new password below.</p>
            <div className="lmis-form-group">
              <label className="lmis-form-label">New Password</label>
              <div className="lmis-password-wrapper">
                <input
                  type={showPass ? 'text' : 'password'}
                  className="lmis-form-input"
                  placeholder="••••••••"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  required
                  minLength={8}
                />
                <button
                  type="button"
                  className="lmis-password-toggle"
                  onClick={() => setShowPass(p => !p)}
                  title={showPass ? 'Hide password' : 'Show password'}
                  aria-label={showPass ? 'Hide password' : 'Show password'}
                >
                  {showPass ? (
                    <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
                      <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/>
                      <line x1="1" y1="1" x2="23" y2="23"/>
                    </svg>
                  ) : (
                    <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
                      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
                      <circle cx="12" cy="12" r="3"/>
                    </svg>
                  )}
                </button>
              </div>
            </div>
            <div className="lmis-form-group">
              <label className="lmis-form-label">Confirm New Password</label>
              <div className="lmis-password-wrapper">
                <input
                  type={showConfirm ? 'text' : 'password'}
                  className="lmis-form-input"
                  placeholder="••••••••"
                  value={confirm}
                  onChange={e => setConfirm(e.target.value)}
                  required
                  minLength={8}
                />
                <button
                  type="button"
                  className="lmis-password-toggle"
                  onClick={() => setShowConfirm(p => !p)}
                  title={showConfirm ? 'Hide password' : 'Show password'}
                  aria-label={showConfirm ? 'Hide password' : 'Show password'}
                >
                  {showConfirm ? (
                    <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
                      <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/>
                      <line x1="1" y1="1" x2="23" y2="23"/>
                    </svg>
                  ) : (
                    <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
                      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
                      <circle cx="12" cy="12" r="3"/>
                    </svg>
                  )}
                </button>
              </div>
            </div>
            {error && <p className="lmis-login-err">{error}</p>}
            <button type="submit" className="lmis-login-btn" disabled={loading}>
              {loading ? 'Updating\u2026' : 'Set New Password \u2192'}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
