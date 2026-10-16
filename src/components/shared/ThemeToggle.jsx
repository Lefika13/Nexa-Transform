import React from 'react';
import { useTheme } from '../../context/ThemeContext';

export const ThemeToggle = ({ className = '', style = {}, showLabel = false }) => {
  const { effectiveTheme, toggleTheme } = useTheme();
  const isDark = effectiveTheme === 'dark';

  return (
    <button
      type="button"
      className={`theme-toggle-btn ${className}`}
      onClick={toggleTheme}
      title={isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
      aria-label={isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '0.4rem',
        padding: '0.4rem 0.65rem',
        borderRadius: '8px',
        border: '1px solid var(--border-color, rgba(255,255,255,0.2))',
        background: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.05)',
        color: isDark ? '#fbbf24' : '#0f172a',
        cursor: 'pointer',
        fontSize: '0.78rem',
        fontWeight: 600,
        transition: 'all 0.2s ease',
        ...style
      }}
    >
      {isDark ? (
        // Sun Icon (switching to Light)
        <svg
          width="17"
          height="17"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <circle cx="12" cy="12" r="5" />
          <line x1="12" y1="1" x2="12" y2="3" />
          <line x1="12" y1="21" x2="12" y2="23" />
          <line x1="4.22" y1="4.22" x2="5.64" y2="5.64" />
          <line x1="18.36" y1="18.36" x2="19.78" y2="19.78" />
          <line x1="1" y1="12" x2="3" y2="12" />
          <line x1="21" y1="12" x2="23" y2="12" />
          <line x1="4.22" y1="19.78" x2="5.64" y2="18.36" />
          <line x1="18.36" y1="5.64" x2="19.78" y2="4.22" />
        </svg>
      ) : (
        // Moon Icon (switching to Dark)
        <svg
          width="17"
          height="17"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
        </svg>
      )}
      {showLabel && (
        <span style={{ fontSize: '0.74rem', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
          {isDark ? 'Light' : 'Dark'}
        </span>
      )}
    </button>
  );
};
export default ThemeToggle;
