import React, { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { Clock, Calendar, ArrowLeft, ArrowRight, Share2, Check, Sparkles, BookOpen } from 'lucide-react';
import { INSIGHTS_ARTICLES } from '../data/insightsData';
import './Insights.css';

export const InsightPost = () => {
  const { slug } = useParams();
  const navigate = useNavigate();
  const [copied, setCopied] = useState(false);

  const article = INSIGHTS_ARTICLES.find(a => a.slug === slug);
  const otherArticles = INSIGHTS_ARTICLES.filter(a => a.slug !== slug);

  // Scroll to top on mount or slug change
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [slug]);

  // Inject Google Schema.org structured data for SEO
  useEffect(() => {
    if (!article) return;

    document.title = `${article.title} | Nexa Transform Group`;

    const schemaId = 'article-structured-data';
    let script = document.getElementById(schemaId);
    if (!script) {
      script = document.createElement('script');
      script.id = schemaId;
      script.type = 'application/ld+json';
      document.head.appendChild(script);
    }

    const structuredData = {
      '@context': 'https://schema.org',
      '@graph': [
        {
          '@type': 'Article',
          '@id': `https://nexa-transform.com/insights/${article.slug}#article`,
          'isPartOf': {
            '@type': 'WebSite',
            '@id': 'https://nexa-transform.com/#website',
            'name': 'Nexa Transform Group',
            'url': 'https://nexa-transform.com'
          },
          'headline': article.title,
          'description': article.excerpt,
          'image': article.coverImage,
          'datePublished': article.publishedDate,
          'dateModified': article.publishedDate,
          'author': {
            '@type': 'Organization',
            'name': 'Nexa Transform Group',
            'url': 'https://nexa-transform.com'
          },
          'publisher': {
            '@type': 'Organization',
            'name': 'Nexa Transform Group',
            'url': 'https://nexa-transform.com',
            'logo': {
              '@type': 'ImageObject',
              'url': 'https://nexa-transform.com/logo-mark.svg'
            }
          },
          'mainEntityOfPage': {
            '@type': 'WebPage',
            '@id': `https://nexa-transform.com/insights/${article.slug}`
          }
        },
        {
          '@type': 'BreadcrumbList',
          'itemListElement': [
            {
              '@type': 'ListItem',
              'position': 1,
              'name': 'Home',
              'item': 'https://nexa-transform.com'
            },
            {
              '@type': 'ListItem',
              'position': 2,
              'name': 'Insights',
              'item': 'https://nexa-transform.com/insights'
            },
            {
              '@type': 'ListItem',
              'position': 3,
              'name': article.title,
              'item': `https://nexa-transform.com/insights/${article.slug}`
            }
          ]
        }
      ]
    };

    if (article.faqs && article.faqs.length > 0) {
      structuredData['@graph'].push({
        '@type': 'FAQPage',
        'mainEntity': article.faqs.map(faq => ({
          '@type': 'Question',
          'name': faq.question,
          'acceptedAnswer': {
            '@type': 'Answer',
            'text': faq.answer
          }
        }))
      });
    }

    script.textContent = JSON.stringify(structuredData);

    return () => {
      const el = document.getElementById(schemaId);
      if (el) el.remove();
    };
  }, [article]);

  const handleCopyLink = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  if (!article) {
    return (
      <div style={{ backgroundColor: '#F8FAFC', minHeight: '80vh', padding: '6rem 1rem', textAlign: 'center' }}>
        <div style={{
          maxWidth: '520px',
          margin: '0 auto',
          backgroundColor: '#FFFFFF',
          padding: '3rem 2rem',
          borderRadius: '20px',
          border: '1px solid #E2E8F0',
          boxShadow: '0 4px 12px rgba(0,0,0,0.04)'
        }}>
          <BookOpen size={48} color="#94A3B8" style={{ margin: '0 auto 1rem auto' }} />
          <h1 style={{ fontSize: '1.5rem', fontWeight: 800, color: '#0B132B', marginBottom: '0.5rem' }}>
            Insight Not Found
          </h1>
          <p style={{ color: '#64748B', fontSize: '0.9rem', marginBottom: '1.5rem' }}>
            The article you are looking for does not exist or may have been relocated.
          </p>
          <Link
            to="/insights"
            className="insights-cta-btn-primary"
            style={{ fontSize: '0.875rem', padding: '10px 24px' }}
          >
            <ArrowLeft size={16} style={{ marginRight: '6px' }} /> Return to All Insights
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="insight-post-root">
      {/* Top Breadcrumb & Share Bar */}
      <div className="insight-post-header">
        <div className="insight-post-nav-container">
          <div className="insight-breadcrumb">
            <Link to="/">Home</Link>
            <span style={{ color: '#CBD5E1' }}>/</span>
            <Link to="/insights" style={{ fontWeight: 700 }}>Insights</Link>
            <span style={{ color: '#CBD5E1' }}>/</span>
            <span style={{ color: '#0B132B', fontWeight: 600 }}>{article.category}</span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <button
              type="button"
              onClick={handleCopyLink}
              className="insight-share-btn"
              title="Share article link"
            >
              {copied ? <Check size={14} color="#10B981" /> : <Share2 size={14} />}
              <span>{copied ? 'Link Copied' : 'Share'}</span>
            </button>
            <Link
              to="/insights"
              className="insight-share-btn"
              style={{ textDecoration: 'none' }}
            >
              <ArrowLeft size={14} />
              <span>All Insights</span>
            </Link>
          </div>
        </div>
      </div>

      {/* Main Authentic Visibly Article Layout */}
      <main className="article-rich-body">
        <div dangerouslySetInnerHTML={{ __html: article.contentHtml }} />

        {/* Corporate Author & Credibility Card */}
        <div style={{
          marginTop: '4rem',
          padding: '2rem',
          borderRadius: '20px',
          backgroundColor: '#F8FAFC',
          border: '1px solid #E2E8F0',
          display: 'flex',
          flexDirection: 'column',
          gap: '1rem'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <div style={{
              width: '56px',
              height: '56px',
              borderRadius: '16px',
              backgroundColor: '#0B132B',
              color: '#06B6D4',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontWeight: 900,
              fontSize: '1.25rem',
              flexShrink: 0,
              border: '1px solid rgba(6, 182, 212, 0.3)'
            }}>
              NT
            </div>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                <span style={{
                  fontSize: '0.7rem',
                  fontWeight: 800,
                  textTransform: 'uppercase',
                  letterSpacing: '0.06em',
                  color: '#06B6D4',
                  backgroundColor: '#0B132B',
                  padding: '3px 10px',
                  borderRadius: '9999px'
                }}>
                  Author &amp; Publisher
                </span>
                <span style={{
                  fontSize: '0.75rem',
                  fontWeight: 600,
                  color: '#64748B',
                  backgroundColor: '#FFFFFF',
                  padding: '3px 10px',
                  borderRadius: '9999px',
                  border: '1px solid #E2E8F0'
                }}>
                  📚 {INSIGHTS_ARTICLES.length} Published Blueprints
                </span>
              </div>
              <h3 style={{
                fontFamily: 'var(--font-heading)',
                fontSize: '1.15rem',
                fontWeight: 800,
                color: '#0B132B',
                margin: 0
              }}>
                {article.author}
              </h3>
            </div>
          </div>
          <p style={{ color: '#475569', fontSize: '0.925rem', lineHeight: '1.6', margin: 0 }}>
            Nexa Transform Group provides independent management consulting, process re-engineering, and bespoke digital software development. We bridge operational friction and technical execution to build future-ready organisations across Africa and globally.
          </p>
        </div>

        {/* Executive Next-Action Banner */}
        <div className="insights-cta-banner" style={{ marginTop: '3.5rem' }}>
          <span className="insights-cta-badge">
            Next Action
          </span>
          <h2 className="insights-cta-title" style={{ fontSize: '1.9rem' }}>
            Translate Process Diagnosis Into High-Impact Execution
          </h2>
          <p className="insights-cta-desc">
            Book a confidential Diagnostic Discovery Session with Nexa's advisory team to examine your workflow constraints and build a phased technology roadmap.
          </p>
          <div className="insights-cta-actions">
            <Link
              to="/contact"
              className="insights-cta-btn-primary"
            >
              Book Diagnostic Session
            </Link>
            <Link
              to="/insights"
              className="insights-cta-btn-secondary"
            >
              View All Insights
            </Link>
          </div>
        </div>

        {/* More Research Grid */}
        {otherArticles.length > 0 && (
          <div style={{ marginTop: '4.5rem', paddingTop: '2.5rem', borderTop: '1px solid #E2E8F0' }}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              marginBottom: '1.75rem'
            }}>
              <div>
                <h3 style={{
                  fontFamily: 'var(--font-heading)',
                  fontSize: '1.5rem',
                  fontWeight: 800,
                  color: '#0B132B',
                  margin: '0 0 4px 0'
                }}>
                  Explore More Blueprints &amp; Articles
                </h3>
                <p style={{ color: '#64748B', fontSize: '0.875rem', margin: 0 }}>
                  Further operational guides and architectural perspectives
                </p>
              </div>
              <Link
                to="/insights"
                style={{
                  fontSize: '0.85rem',
                  fontWeight: 700,
                  color: '#0891B2',
                  textDecoration: 'none',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '4px'
                }}
              >
                All Articles <ArrowRight size={14} />
              </Link>
            </div>

            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
              gap: '20px'
            }}>
              {otherArticles.slice(0, 3).map(rel => (
                <Link
                  key={rel.slug}
                  to={`/insights/${rel.slug}`}
                  className="insights-card"
                  style={{ textDecoration: 'none' }}
                >
                  <div className="insights-card-media">
                    <img
                      src={rel.coverImage}
                      alt={rel.title}
                      className="insights-card-img"
                      loading="lazy"
                    />
                    <div className="insights-card-badge">
                      {rel.category}
                    </div>
                  </div>
                  <div className="insights-card-body">
                    <div>
                      <h4 className="insights-card-title" style={{ fontSize: '0.975rem' }}>
                        {rel.title}
                      </h4>
                      <p className="insights-card-excerpt" style={{ fontSize: '0.825rem', marginBottom: '12px' }}>
                        {rel.excerpt}
                      </p>
                    </div>
                    <div className="insights-card-footer">
                      <span style={{ fontSize: '0.75rem', color: '#94A3B8' }}>{rel.readTime}</span>
                      <span className="insights-read-link" style={{ fontSize: '0.775rem' }}>
                        Read <ArrowRight size={12} />
                      </span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default InsightPost;
