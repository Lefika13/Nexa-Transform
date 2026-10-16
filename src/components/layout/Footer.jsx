import React from 'react';
import { Link } from 'react-router-dom';
import { Mail, Phone, MapPin } from 'lucide-react';
import { useFeatureFlags } from '../../context/FeatureFlagsContext';
import './Footer.css';

export const Footer = () => {
  const { isVisible } = useFeatureFlags();
  return (
    <footer className="footer-root">
      <div className="container footer-container">
        <div className="footer-brand">
          <Link to="/" className="footer-logo">
            <img src="/logo.svg" alt="Nexa Transform Logo" className="footer-logo-img" />
          </Link>
          <p className="footer-vision">
            Creating Future-Ready Organisations Across Africa through Process, People & Technology.
          </p>
          <div className="footer-social">
            <a 
              href="https://www.linkedin.com/company/145239426/" 
              target="_blank" 
              rel="noopener noreferrer" 
              aria-label="LinkedIn - Nexa-Transform Group" 
              title="LinkedIn - Nexa-Transform Group"
              className="flex items-center gap-1.5 font-bold hover:text-turquoise transition-colors text-sm"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" className="shrink-0">
                <path d="M19 3a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h14m-.5 15.5v-5.3a3.26 3.26 0 0 0-3.26-3.26c-.85 0-1.84.52-2.28 1.3v-1.11h-2.79v8.37h2.79v-4.93c0-.77.62-1.4 1.39-1.4a1.4 1.4 0 0 1 1.4 1.4v4.93h2.75M6.46 10.9v8.37H9.25V10.9H6.46M7.86 6.3a1.5 1.5 0 1 0 0 3 1.5 1.5 0 0 0 0-3" />
              </svg>
              <span>LinkedIn</span>
            </a>
          </div>
        </div>

        <div className="footer-links-group">
          <h4 className="footer-heading">Services</h4>
          <ul className="footer-links">
            <li><Link to="/services">Digital Transformation</Link></li>
            <li><Link to="/services">Business Process Management</Link></li>
            <li><Link to="/services">Organisational Development</Link></li>
            <li><Link to="/services">Skills Development</Link></li>
            <li><Link to="/services">AI Solutions</Link></li>
            <li><Link to="/services">Root Cause Analysis</Link></li>
          </ul>
        </div>

        <div className="footer-links-group">
          <h4 className="footer-heading">Company</h4>
          <ul className="footer-links">
            <li><Link to="/about">About Us</Link></li>
            {isVisible('training-academy') && <li><Link to="/training-academy">Training Academy</Link></li>}
            {isVisible('innovation-lab') && <li><Link to="/innovation-lab">Innovation Lab</Link></li>}
            <li><Link to="/ecosystem">Ecosystem</Link></li>
            {isVisible('resources') && <li><Link to="/resources">Resources</Link></li>}
            <li><Link to="/insights">Insights</Link></li>
            <li><Link to="/lmis">LMIS Portal</Link></li>
          </ul>
        </div>

        <div className="footer-contact">
          <h4 className="footer-heading">Contact Us</h4>
          <ul className="contact-list">
            <li>
              <Mail size={18} className="text-turquoise shrink-0" />
              <a href="mailto:enquiries@nexa-transform.com" className="hover:text-turquoise transition-colors">enquiries@nexa-transform.com</a>
            </li>
            <li>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" className="text-turquoise shrink-0 mt-0.5">
                <path d="M19 3a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h14m-.5 15.5v-5.3a3.26 3.26 0 0 0-3.26-3.26c-.85 0-1.84.52-2.28 1.3v-1.11h-2.79v8.37h2.79v-4.93c0-.77.62-1.4 1.39-1.4a1.4 1.4 0 0 1 1.4 1.4v4.93h2.75M6.46 10.9v8.37H9.25V10.9H6.46M7.86 6.3a1.5 1.5 0 1 0 0 3 1.5 1.5 0 0 0 0-3" />
              </svg>
              <a 
                href="https://www.linkedin.com/company/145239426/" 
                target="_blank" 
                rel="noopener noreferrer" 
                className="hover:text-turquoise transition-colors"
              >
                LinkedIn: Nexa-Transform Group
              </a>
            </li>
          </ul>
        </div>
      </div>
      
      <div className="footer-bottom">
        <div className="container footer-bottom-container">
          <p>&copy; {new Date().getFullYear()} NexaTransform Hub. All rights reserved.</p>
          <div className="footer-legal">
            <Link to="/privacy">Privacy Policy</Link>
            <Link to="/terms">Terms of Service</Link>
          </div>
        </div>
      </div>
    </footer>
  );
};
