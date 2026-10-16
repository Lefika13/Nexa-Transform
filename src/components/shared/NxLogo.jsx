import React from 'react';

/**
 * NxLogo Component
 * Renders the monogram NX rounded-square SVG with optional brand text.
 * @param {number} size - Size in pixels (default: 48)
 * @param {boolean} showText - Whether to display the text wordmark on the right (default: false)
 */
export const NxLogo = ({ size = 48, showText = false }) => {
  return (
    <div className="flex items-center gap-3 select-none">
      <svg 
        width={size} 
        height={size} 
        viewBox="0 0 48 48" 
        fill="none" 
        xmlns="http://www.w3.org/2000/svg"
        style={{ flexShrink: 0 }}
      >
        {/* Rounded square filled navy with a 1.5px gold border */}
        <rect x="1" y="1" width="46" height="46" rx="12" fill="#0B1220" stroke="#D4AF37" strokeWidth="1.5" />
        
        {/* Silver/gray N stroke */}
        <path d="M13 34V14L21 34V14" stroke="#A8B2BE" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
        
        {/* Gold X strokes */}
        <path d="M27 14L37 34" stroke="#D4AF37" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M37 14L27 34" stroke="#D4AF37" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
      
      {showText && (
        <div className="flex flex-col text-left leading-none">
          <span 
            className="text-white font-black tracking-wider" 
            style={{ 
              fontFamily: "Inter, 'Montserrat', sans-serif", 
              fontSize: size > 40 ? '18px' : '14px', 
              fontWeight: 900 
            }}
          >
            NEXA
          </span>
          <span 
            className="text-gold font-semibold uppercase" 
            style={{ 
              fontFamily: "Inter, 'Montserrat', sans-serif", 
              fontSize: size > 40 ? '9px' : '7.5px', 
              fontWeight: 700, 
              letterSpacing: '0.25em',
              color: '#D4AF37',
              marginTop: '2px'
            }}
          >
            TRANSFORM
          </span>
        </div>
      )}
    </div>
  );
};
