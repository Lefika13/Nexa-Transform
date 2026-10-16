import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, ChevronUp, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import './ServiceCard.css';

const SLUG_MAP = {
  'digital transformation': 'digital-transformation-leadership',
  'business process management': 'process-mapping-fundamentals',
  'organisational development': 'organisational-development',
  'skills development': 'operations-management-innovation',
  'skills to be developed': 'operations-management-innovation',
  'ai solutions': 'ai-solutions',
  'root cause analysis': 'root-cause-analysis',
  'change management': 'change-management'
};

export const ServiceCard = ({ title, category, skills }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const slug = SLUG_MAP[(title || '').toLowerCase().trim()] || 'change-management';

  return (
    <div className="service-card glass-card">
      <Link to={`/modules/${slug}`} className="group">
        <h3 className="service-card-title hover:text-turquoise transition-colors font-bold text-navy" style={{ marginTop: '0.5rem' }}>
          {title}
        </h3>
      </Link>
      <p className="service-card-category">{category}</p>
      
      <button 
        className="service-card-toggle"
        onClick={() => setIsExpanded(!isExpanded)}
        aria-expanded={isExpanded}
      >
        <span>Curriculum Overview</span>
        {isExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
      </button>

      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="service-card-content"
          >
            <ul className="service-skills-list">
              {skills.map((skill, index) => (
                <li key={index}>
                  <div className="skill-dot"></div>
                  {skill}
                </li>
              ))}
            </ul>
          </motion.div>
        )}
      </AnimatePresence>

      <div style={{ marginTop: 'auto', paddingTop: '0.85rem', borderTop: '1px solid rgba(0, 0, 0, 0.06)' }}>
        <Link 
          to={`/modules/${slug}`}
          className="text-xs font-bold text-turquoise hover:text-navy transition-colors inline-flex items-center gap-1.5"
        >
          <span>Explore Module Details</span>
          <ArrowRight size={13} />
        </Link>
      </div>
    </div>
  );
};
