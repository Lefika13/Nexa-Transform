import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ShieldCheck, X } from 'lucide-react';
import './CookieBanner.css';

export const CookieBanner = () => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    try {
      const consentData = localStorage.getItem('nexa_cookie_consent');
      if (consentData) {
        const parsed = JSON.parse(consentData);
        // Expire consent after 180 days
        const isExpired = Date.now() - (parsed.timestamp || 0) > 180 * 24 * 60 * 60 * 1000;
        if (!isExpired) {
          return;
        }
      }
    } catch (e) {
      // In case of parsing error, proceed to show
    }

    // Delay slightly to prevent layout disruption on immediate load
    const timer = setTimeout(() => {
      setIsVisible(true);
    }, 1200);

    return () => clearTimeout(timer);
  }, []);

  const handleConsent = (type) => {
    try {
      localStorage.setItem(
        'nexa_cookie_consent',
        JSON.stringify({ type, timestamp: Date.now() })
      );
    } catch (e) {
      // Fail gracefully
    }
    setIsVisible(false);
  };

  if (!isVisible) return null;

  return (
    <div
      role="dialog"
      aria-label="Cookie and Privacy Consent"
      aria-describedby="cookie-desc"
      className="cookie-banner-wrapper"
    >
      <div className="flex items-start justify-between gap-3 mb-2">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-[#06B6D4]/15 text-[#06B6D4] flex items-center justify-center shrink-0">
            <ShieldCheck size={16} />
          </div>
          <h3 className="font-bold text-sm text-white tracking-tight">
            Privacy &amp; Cookie Preferences
          </h3>
        </div>

        <button
          onClick={() => handleConsent('essential')}
          className="cookie-close-btn"
          aria-label="Dismiss cookie notice"
          title="Dismiss"
        >
          <X size={15} />
        </button>
      </div>

      <p id="cookie-desc" className="text-xs text-slate-300 leading-relaxed mb-4">
        We use essential cookies for core site functions, and privacy-respecting analytics to optimize operational insights in compliance with South Africa's <strong>POPIA</strong> (Act 4 of 2013) and international privacy standards.
      </p>

      <div className="flex items-center justify-between gap-2.5 pt-2 border-t border-slate-800">
        <Link
          to="/privacy-policy"
          className="text-[11px] text-slate-400 hover:text-[#06B6D4] underline transition-colors"
        >
          Privacy Policy
        </Link>

        <div className="flex items-center gap-2">
          <button
            onClick={() => handleConsent('essential')}
            className="cookie-btn-essential"
          >
            Essential Only
          </button>
          <button
            onClick={() => handleConsent('all')}
            className="cookie-btn-accept"
          >
            Accept All
          </button>
        </div>
      </div>
    </div>
  );
};

export default CookieBanner;
