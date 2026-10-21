import React, { useState, useMemo, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Clock, Calendar, ArrowRight, Search, BookOpen, Sparkles, Layers } from 'lucide-react';
import { INSIGHTS_ARTICLES } from '../data/insightsData';
import './Insights.css';

export const Insights = () => {
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    window.scrollTo(0, 0);
    document.title = 'Insights & Operational Perspectives | Nexa Transform Group';
  }, []);

  const categories = useMemo(() => {
    const cats = ['All', ...new Set(INSIGHTS_ARTICLES.map(a => a.category))];
    return cats;
  }, []);

  const filteredArticles = useMemo(() => {
    return INSIGHTS_ARTICLES.filter(article => {
      const matchesCategory = selectedCategory === 'All' || article.category === selectedCategory;
      const query = searchQuery.toLowerCase().trim();
      const matchesSearch = !query || 
        article.title.toLowerCase().includes(query) || 
        article.excerpt.toLowerCase().includes(query) ||
        article.category.toLowerCase().includes(query);
      return matchesCategory && matchesSearch;
    });
  }, [selectedCategory, searchQuery]);

  const featuredArticle = filteredArticles[0] || INSIGHTS_ARTICLES[0];
  const gridArticles = filteredArticles.slice(1);

  return (
    <div className="insights-root">
      <div className="insights-container">
        
        {/* Executive Hero Header */}
        <div className="insights-hero">
          <div className="insights-pill-badge">
            <Sparkles size={14} />
            <span>Nexa Thought Leadership</span>
          </div>

          <h1 className="insights-hero-title">
            Insights &amp; Operational Perspectives
          </h1>
          <p className="insights-hero-subtitle">
            In-depth guides, operational frameworks, and actionable analyses on custom business software, workflow automation, and enterprise process modernization.
          </p>

          {/* Metric Badges */}
          <div className="insights-metrics-row">
            <div className="insights-metric-chip">
              <BookOpen size={14} color="#06B6D4" />
              <span><strong>{INSIGHTS_ARTICLES.length}</strong> Research Blueprints</span>
            </div>
            <div className="insights-metric-chip">
              <Layers size={14} color="#06B6D4" />
              <span><strong>{new Set(INSIGHTS_ARTICLES.map(a => a.category)).size}</strong> Operational Domains</span>
            </div>
            <div className="insights-metric-chip">
              <Clock size={14} color="#06B6D4" />
              <span>Continuous Industry Insights</span>
            </div>
          </div>

          {/* Search Bar */}
          <div className="insights-search-wrapper">
            <div className="insights-search-icon">
              <Search size={18} />
            </div>
            <input
              type="text"
              placeholder="Search by topic, keyword, or operational challenge..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="insights-search-input"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="insights-search-clear"
              >
                Clear
              </button>
            )}
          </div>

          {/* Category Filter Chips */}
          <div className="insights-filter-chips">
            {categories.map(cat => {
              const isActive = selectedCategory === cat;
              return (
                <button
                  type="button"
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`insights-filter-btn ${isActive ? 'active' : ''}`}
                >
                  {cat}
                </button>
              );
            })}
          </div>
        </div>

        {/* Content Area */}
        {filteredArticles.length === 0 ? (
          <div style={{
            backgroundColor: '#FFFFFF',
            borderRadius: '20px',
            padding: '3.5rem 1.5rem',
            textAlign: 'center',
            border: '1px solid #E2E8F0',
            boxShadow: '0 2px 8px rgba(0,0,0,0.03)',
            margin: '2rem auto',
            maxWidth: '560px'
          }}>
            <BookOpen size={42} color="#94A3B8" style={{ margin: '0 auto 12px auto' }} />
            <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: '#0B132B', marginBottom: '8px' }}>
              No articles match your search
            </h3>
            <p style={{ color: '#64748B', fontSize: '0.9rem', marginBottom: '20px' }}>
              Try adjusting your search terms or resetting the category filter.
            </p>
            <button
              type="button"
              onClick={() => { setSelectedCategory('All'); setSearchQuery(''); }}
              className="insights-cta-btn-primary"
              style={{ fontSize: '0.85rem', padding: '10px 22px' }}
            >
              Reset Filters
            </button>
          </div>
        ) : (
          <>
            {/* Featured Article Card */}
            {featuredArticle && (
              <Link
                to={`/insights/${featuredArticle.slug}`}
                className="insights-featured-card"
              >
                <div className="insights-featured-inner">
                  <div className="insights-featured-media">
                    <img
                      src={featuredArticle.coverImage}
                      alt={featuredArticle.title}
                      className="insights-featured-img"
                      loading="eager"
                    />
                    <div className="insights-featured-badge">
                      Featured Guide
                    </div>
                  </div>
                  <div className="insights-featured-content">
                    <div>
                      <div className="insights-cat-pill">
                        {featuredArticle.category}
                      </div>
                      <h2 className="insights-featured-title">
                        {featuredArticle.title}
                      </h2>
                      <div className="insights-author-tag">
                        <span className="insights-author-avatar">NT</span>
                        <span>By {featuredArticle.author}</span>
                      </div>
                      <p className="insights-featured-excerpt">
                        {featuredArticle.excerpt}
                      </p>
                    </div>

                    <div className="insights-card-footer">
                      <div className="insights-card-meta">
                        <span>
                          <Calendar size={13} color="#94A3B8" />
                          {new Date(featuredArticle.publishedDate).toLocaleDateString('en-ZA', { month: 'short', day: 'numeric', year: 'numeric' })}
                        </span>
                        <span>&bull;</span>
                        <span>
                          <Clock size={13} color="#94A3B8" />
                          {featuredArticle.readTime}
                        </span>
                      </div>
                      <span className="insights-read-link">
                        Read Guide <ArrowRight size={15} />
                      </span>
                    </div>
                  </div>
                </div>
              </Link>
            )}

            {/* Grid of Other Articles */}
            {gridArticles.length > 0 && (
              <div className="insights-grid">
                {gridArticles.map(article => (
                  <Link
                    key={article.slug}
                    to={`/insights/${article.slug}`}
                    className="insights-card"
                  >
                    <div className="insights-card-media">
                      <img
                        src={article.coverImage}
                        alt={article.title}
                        className="insights-card-img"
                        loading="lazy"
                      />
                      <div className="insights-card-badge">
                        {article.category}
                      </div>
                    </div>
                    <div className="insights-card-body">
                      <div>
                        <h3 className="insights-card-title">
                          {article.title}
                        </h3>
                        <div className="insights-author-tag" style={{ marginBottom: '8px' }}>
                          <span className="insights-author-avatar" style={{ width: '18px', height: '18px', fontSize: '8px' }}>NT</span>
                          <span style={{ fontSize: '0.75rem' }}>By {article.author}</span>
                        </div>
                        <p className="insights-card-excerpt">
                          {article.excerpt}
                        </p>
                      </div>

                      <div className="insights-card-footer">
                        <div className="insights-card-meta">
                          <span>
                            <Calendar size={12} color="#94A3B8" />
                            {new Date(article.publishedDate).toLocaleDateString('en-ZA', { month: 'short', day: 'numeric', year: 'numeric' })}
                          </span>
                          <span>&bull;</span>
                          <span>
                            <Clock size={12} color="#94A3B8" />
                            {article.readTime}
                          </span>
                        </div>
                        <span className="insights-read-link" style={{ fontSize: '0.8rem' }}>
                          Read <ArrowRight size={13} />
                        </span>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </>
        )}

        {/* Executive Consultation Callout Banner */}
        <div className="insights-cta-banner">
          <span className="insights-cta-badge">
            Pragmatic Enterprise Transformation
          </span>
          <h2 className="insights-cta-title">
            Ready to Eliminate Workflow Bottlenecks in Your Organisation?
          </h2>
          <p className="insights-cta-desc">
            Connect directly with our process engineering and digital systems team for a structured Diagnostic Discovery Session.
          </p>
          <div className="insights-cta-actions">
            <Link
              to="/contact"
              className="insights-cta-btn-primary"
            >
              Book Diagnostic Session
            </Link>
            <Link
              to="/services"
              className="insights-cta-btn-secondary"
            >
              Explore Services
            </Link>
          </div>
        </div>

      </div>
    </div>
  );
};

export default Insights;
