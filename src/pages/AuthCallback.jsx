import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../supabaseClient';
import './LmisCommon.css';

export default function AuthCallback() {
  const navigate = useNavigate();
  const [status, setStatus] = useState('Verifying your link\u2026');
  const [error, setError]   = useState('');

  useEffect(() => {
    const handleAuth = async () => {
      const hash   = window.location.hash;
      const search = window.location.search;
      const params  = new URLSearchParams(search);
      const code    = params.get('code');
      const type    = params.get('type') || '';

      if (code) {
        const { error: exchErr } = await supabase.auth.exchangeCodeForSession(code);
        if (exchErr) { setError(exchErr.message); return; }
        const { data: { session } } = await supabase.auth.getSession();
        if (session) { redirectByType(type || detectTypeFromHash(hash)); }
        else { setError('Session could not be established. Please try again.'); }
        return;
      }

      if (hash) {
        const hashParams    = new URLSearchParams(hash.replace('#', ''));
        const accessToken   = hashParams.get('access_token');
        const refreshToken  = hashParams.get('refresh_token');
        const flowType      = hashParams.get('type') || '';
        if (accessToken) {
          const { error: sessErr } = await supabase.auth.setSession({ access_token: accessToken, refresh_token: refreshToken || '' });
          if (sessErr) { setError(sessErr.message); return; }
          redirectByType(flowType);
          return;
        }
      }

      const { data: { session } } = await supabase.auth.getSession();
      if (session) { setStatus('Already signed in. Redirecting\u2026'); setTimeout(() => navigate('/lmis'), 1000); }
      else { setError('No authentication token found. The link may have expired \u2014 please request a new one.'); }
    };

    handleAuth();
  }, []);

  function detectTypeFromHash(hash) {
    if (!hash) return '';
    return new URLSearchParams(hash.replace('#', '')).get('type') || '';
  }

  function redirectByType(type) {
    if (type === 'recovery') {
      setStatus('Link verified! Taking you to reset your password\u2026');
      setTimeout(() => navigate('/reset-password'), 800);
    } else if (type === 'signup' || type === 'email_change') {
      setStatus('Email confirmed! You can now sign in.');
      setTimeout(() => navigate('/lmis'), 1500);
    } else {
      setStatus('Signed in successfully! Redirecting\u2026');
      setTimeout(() => navigate('/lmis'), 1000);
    }
  }

  return (
    <div className="lmis-login-overlay">
      <div className="lmis-login-bg" />
      <div className="lmis-login-card" style={{ textAlign: 'center' }}>
        <img src="/logo.svg" alt="NX" className="lmis-login-logo" />
        <h2 className="lmis-login-title">NexaTransform Hub</h2>
        {error ? (
          <>
            <div style={{ marginTop:'1.5rem', padding:'1rem', background:'rgba(239,68,68,0.15)', border:'1px solid rgba(239,68,68,0.4)', borderRadius:'0.75rem', color:'#fca5a5' }}>
              <p style={{ margin:0, fontWeight:600 }}>\u26a0 Link Error</p>
              <p style={{ margin:'0.5rem 0 0', fontSize:'0.875rem', opacity:0.9 }}>{error}</p>
            </div>
            <button className="lmis-login-btn" style={{ marginTop:'1.5rem' }} onClick={() => navigate('/lmis')}>\u2190 Go to LMIS</button>
          </>
        ) : (
          <>
            <p className="lmis-login-sub" style={{ marginTop:'1.5rem' }}>{status}</p>
            <div style={{ margin:'1.5rem auto 0', width:40, height:40, border:'3px solid rgba(99,102,241,0.3)', borderTopColor:'#6366f1', borderRadius:'50%', animation:'spin 0.9s linear infinite' }} />
            <style>{'@keyframes spin { to { transform: rotate(360deg); } }'}</style>
          </>
        )}
      </div>
    </div>
  );
}
