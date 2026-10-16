import React, { useState, useEffect, useCallback } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Menu, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useFeatureFlags } from '../../context/FeatureFlagsContext';
import { ThemeToggle } from '../shared/ThemeToggle';
import './Navbar.css';

export const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const location = useLocation();
  const { isVisible } = useFeatureFlags();

  // Close mobile menu on Escape key
  useEffect(() => {
    const handleKey = (e) => { if (e.key === 'Escape') setIsOpen(false); };
    document.addEventListener('keydown', handleKey);
    return () => document.removeEventListener('keydown', handleKey);
  }, []);

  // Close mobile menu on route change
  useEffect(() => { setIsOpen(false); }, [location.pathname]);

  const allLinks = [
    { name: 'Home', path: '/', key: null },
    { name: 'About', path: '/about', key: null },
    { name: 'Services', path: '/services', key: null },
    // { name: 'Schools (K-12)', path: '/schools', key: null }, // School LMIS — coming soon
    { name: 'Training Academy', path: '/training-academy', key: 'training-academy' },
    { name: 'Innovation Lab', path: '/innovation-lab', key: 'innovation-lab' },
    { name: 'Ecosystem', path: '/ecosystem', key: null },
    { name: 'Resources', path: '/resources', key: 'resources' },
    { name: 'Insights', path: '/insights', key: null },
    { name: 'LMIS Portal', path: '/lmis', key: null }
  ];

  const links = allLinks.filter(link => link.key === null || isVisible(link.key));

  // Smart active: exact match for '/', startsWith for all others
  const isActive = (path) =>
    path === '/' ? location.pathname === '/' : location.pathname.startsWith(path);

  return (
    <header className="navbar-header">
      <div className="navbar-announcement">
        Empowering Organisations Through Process, People &amp; Technology
      </div>
      <div className="container navbar-container">
        <Link to="/" className="navbar-logo">
          <img src="/logo.svg" alt="Nexa Transform Logo" className="navbar-logo-img" />
        </Link>

        {/* Desktop Nav */}
        <nav className="navbar-desktop">
          {links.map((link) => (
            <Link
              key={link.name}
              to={link.path}
              className={`nav-link ${isActive(link.path) ? 'active' : ''}`}
            >
              {link.name}
            </Link>
          ))}
          <Link to="/contact" className="btn btn-primary ml-4">
            Book Consultation
          </Link>
          <ThemeToggle style={{ marginLeft: '0.75rem' }} />
        </nav>

        {/* Mobile Nav Right (ThemeToggle + Burger) — hidden on desktop via CSS */}
        <div className="navbar-mobile-controls">
          <ThemeToggle />
          <button
            className="navbar-toggle"
            onClick={() => setIsOpen(!isOpen)}
            aria-label="Toggle Menu"
            aria-expanded={isOpen}
            aria-controls="mobile-nav-menu"
          >
            {isOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>

      {/* Mobile Nav */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            id="mobile-nav-menu"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="navbar-mobile"
          >
            <nav className="mobile-nav-list">
              {links.map((link) => (
                <Link
                  key={link.name}
                  to={link.path}
                  onClick={() => setIsOpen(false)}
                  className={`mobile-nav-link ${isActive(link.path) ? 'active' : ''}`}
                >
                  {link.name}
                </Link>
              ))}
              <Link
                to="/contact"
                onClick={() => setIsOpen(false)}
                className="btn btn-primary w-full mt-2"
              >
                Book Consultation
              </Link>
            </nav>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
};
