import React, { useMemo } from 'react';
import { useAnalytics } from '../context/AnalyticsContext';
import { useFeatureFlags } from '../context/FeatureFlagsContext';
import { Link } from 'react-router-dom';
import { ArrowLeft, BarChart3, MousePointerClick, Eye, Globe, Layers, ToggleLeft, ToggleRight } from 'lucide-react';
import { motion } from 'framer-motion';

export const DeveloperDashboard = () => {
  const { analytics } = useAnalytics();
  const { flags, toggleFlag, FLAG_LABELS } = useFeatureFlags();

  const sortedPageViews = useMemo(() => {
    return Object.entries(analytics.pageViews).sort((a, b) => b[1] - a[1]);
  }, [analytics.pageViews]);

  const sortedClicks = useMemo(() => {
    return Object.entries(analytics.clicks).sort((a, b) => b[1] - a[1]);
  }, [analytics.clicks]);

  const totalPageViews = Object.values(analytics.pageViews).reduce((a, b) => a + b, 0);
  const totalClicks = Object.values(analytics.clicks).reduce((a, b) => a + b, 0);
  const mostViewedPage = sortedPageViews[0]?.[0] ?? '—';
  const leastViewedPage = sortedPageViews[sortedPageViews.length - 1]?.[0] ?? '—';
  const mostClickedItem = sortedClicks[0]?.[0] ?? '—';
  const leastClickedItem = sortedClicks[sortedClicks.length - 1]?.[0] ?? '—';

  return (
    <div style={{ minHeight: '100vh', background: '#f8fafc', fontFamily: 'Inter, sans-serif' }}>
      {/* Top Header */}
      <header style={{ background: '#0A1628', color: 'white', padding: '0 2rem', height: '72px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', boxShadow: '0 2px 20px rgba(0,0,0,0.3)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <Link to="/" style={{ color: '#6b7280', textDecoration: 'none', display: 'flex', alignItems: 'center', transition: 'color 0.2s' }}>
            <ArrowLeft size={22} />
          </Link>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
            <BarChart3 size={24} style={{ color: '#2DD4BF' }} />
            <span style={{ fontWeight: 700, fontSize: '1.2rem' }}>
              Developer <span style={{ color: '#2DD4BF' }}>Dashboard</span>
            </span>
          </div>
        </div>
        <span style={{ background: 'rgba(239,68,68,0.15)', color: '#f87171', border: '1px solid rgba(239,68,68,0.3)', borderRadius: '999px', padding: '0.25rem 0.9rem', fontSize: '0.75rem', fontWeight: 700, letterSpacing: '0.05em' }}>
          INTERNAL USE ONLY
        </span>
      </header>

      <main style={{ padding: '2.5rem', maxWidth: '1300px', margin: '0 auto' }}>

        {/* ─── Overview Stats ─── */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '1.25rem', marginBottom: '2.5rem' }}>
          {[
            { icon: <Globe size={28} />, label: 'Unique Sessions', value: analytics.visits, color: '#3B82F6', bg: '#EFF6FF' },
            { icon: <Eye size={28} />, label: 'Total Page Views', value: totalPageViews, color: '#10B981', bg: '#ECFDF5' },
            { icon: <MousePointerClick size={28} />, label: 'Tracked Clicks', value: totalClicks, color: '#F59E0B', bg: '#FFFBEB' },
          ].map((stat, i) => (
            <motion.div key={i} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}
              style={{ background: 'white', borderRadius: '1rem', padding: '1.5rem', boxShadow: '0 1px 8px rgba(0,0,0,0.06)', border: '1px solid #f1f5f9', display: 'flex', alignItems: 'center', gap: '1rem' }}>
              <div style={{ background: stat.bg, color: stat.color, borderRadius: '0.75rem', padding: '0.75rem', display: 'flex', alignItems: 'center' }}>{stat.icon}</div>
              <div>
                <p style={{ margin: 0, fontSize: '0.8rem', color: '#6b7280', fontWeight: 500 }}>{stat.label}</p>
                <p style={{ margin: 0, fontSize: '1.9rem', fontWeight: 700, color: '#0A1628' }}>{stat.value}</p>
              </div>
            </motion.div>
          ))}
        </div>

        {/* ─── Highlights Row ─── */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1.25rem', marginBottom: '2.5rem' }}>
          {[
            { label: '🔥 Most Viewed Page', value: mostViewedPage },
            { label: '🧊 Least Viewed Page', value: leastViewedPage },
            { label: '👆 Most Clicked Item', value: mostClickedItem },
            { label: '⬇️ Least Clicked Item', value: leastClickedItem },
          ].map((h, i) => (
            <motion.div key={i} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 + i * 0.08 }}
              style={{ background: 'white', borderRadius: '1rem', padding: '1.25rem 1.5rem', boxShadow: '0 1px 8px rgba(0,0,0,0.06)', border: '1px solid #f1f5f9' }}>
              <p style={{ margin: '0 0 0.4rem', fontSize: '0.75rem', color: '#9ca3af', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>{h.label}</p>
              <p style={{ margin: 0, fontSize: '1rem', fontWeight: 700, color: '#1e293b', wordBreak: 'break-word' }}>{h.value}</p>
            </motion.div>
          ))}
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem', marginBottom: '2.5rem' }}>

          {/* ─── Page Views Table ─── */}
          <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.4 }}
            style={{ background: 'white', borderRadius: '1rem', boxShadow: '0 1px 8px rgba(0,0,0,0.06)', border: '1px solid #f1f5f9', overflow: 'hidden' }}>
            <div style={{ padding: '1.25rem 1.5rem', borderBottom: '1px solid #f1f5f9', display: 'flex', alignItems: 'center', gap: '0.5rem', background: '#f8fafc' }}>
              <Eye size={18} style={{ color: '#9ca3af' }} />
              <h2 style={{ margin: 0, fontWeight: 700, fontSize: '1rem', color: '#0A1628' }}>Page Views</h2>
            </div>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ background: '#f8fafc', fontSize: '0.8rem', color: '#6b7280' }}>
                  <th style={{ padding: '0.75rem 1.5rem', fontWeight: 600, textAlign: 'left' }}>Path</th>
                  <th style={{ padding: '0.75rem 1.5rem', fontWeight: 600, textAlign: 'right' }}>Views</th>
                </tr>
              </thead>
              <tbody>
                {sortedPageViews.length > 0 ? sortedPageViews.map(([path, count], i) => (
                  <tr key={path} style={{ borderTop: '1px solid #f1f5f9', background: i === 0 ? '#EFF6FF' : 'white' }}>
                    <td style={{ padding: '0.85rem 1.5rem', fontWeight: 500, color: '#0A1628', fontSize: '0.9rem' }}>{path}</td>
                    <td style={{ padding: '0.85rem 1.5rem', fontWeight: 700, color: '#3B82F6', textAlign: 'right' }}>{count}</td>
                  </tr>
                )) : (
                  <tr><td colSpan="2" style={{ padding: '2rem', textAlign: 'center', color: '#9ca3af' }}>No page views yet — browse the site first!</td></tr>
                )}
              </tbody>
            </table>
          </motion.div>

          {/* ─── Clicks Table ─── */}
          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.5 }}
            style={{ background: 'white', borderRadius: '1rem', boxShadow: '0 1px 8px rgba(0,0,0,0.06)', border: '1px solid #f1f5f9', overflow: 'hidden' }}>
            <div style={{ padding: '1.25rem 1.5rem', borderBottom: '1px solid #f1f5f9', display: 'flex', alignItems: 'center', gap: '0.5rem', background: '#f8fafc' }}>
              <MousePointerClick size={18} style={{ color: '#9ca3af' }} />
              <h2 style={{ margin: 0, fontWeight: 700, fontSize: '1rem', color: '#0A1628' }}>Element Clicks</h2>
            </div>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ background: '#f8fafc', fontSize: '0.8rem', color: '#6b7280' }}>
                  <th style={{ padding: '0.75rem 1.5rem', fontWeight: 600, textAlign: 'left' }}>Element</th>
                  <th style={{ padding: '0.75rem 1.5rem', fontWeight: 600, textAlign: 'right' }}>Clicks</th>
                </tr>
              </thead>
              <tbody>
                {sortedClicks.length > 0 ? sortedClicks.map(([element, count], i) => (
                  <tr key={element} style={{ borderTop: '1px solid #f1f5f9', background: i === 0 ? '#FFFBEB' : 'white' }}>
                    <td style={{ padding: '0.85rem 1.5rem', fontWeight: 500, color: '#0A1628', fontSize: '0.9rem' }}>{element}</td>
                    <td style={{ padding: '0.85rem 1.5rem', fontWeight: 700, color: '#F59E0B', textAlign: 'right' }}>{count}</td>
                  </tr>
                )) : (
                  <tr><td colSpan="2" style={{ padding: '2rem', textAlign: 'center', color: '#9ca3af' }}>No clicks tracked yet — interact with the site first!</td></tr>
                )}
              </tbody>
            </table>
          </motion.div>

        </div>

        {/* ─── Page Visibility Controls ─── */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.6 }}
          style={{ background: 'white', borderRadius: '1rem', boxShadow: '0 1px 8px rgba(0,0,0,0.06)', border: '1px solid #f1f5f9', overflow: 'hidden' }}>
          <div style={{ padding: '1.25rem 1.5rem', borderBottom: '1px solid #f1f5f9', background: '#f8fafc', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Layers size={18} style={{ color: '#9ca3af' }} />
            <h2 style={{ margin: 0, fontWeight: 700, fontSize: '1rem', color: '#0A1628' }}>Page Visibility Controls</h2>
            <span style={{ marginLeft: 'auto', background: '#ECFDF5', color: '#10B981', borderRadius: '999px', padding: '0.2rem 0.75rem', fontSize: '0.72rem', fontWeight: 700 }}>
              Changes apply instantly site-wide
            </span>
          </div>
          <div style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {Object.entries(FLAG_LABELS).map(([key, label]) => {
              const isOn = flags[key];
              return (
                <div key={key} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '1.1rem 1.25rem', borderRadius: '0.75rem', border: `1px solid ${isOn ? '#d1fae5' : '#fce7f3'}`, background: isOn ? '#f0fdf4' : '#fff1f2', transition: 'all 0.3s' }}>
                  <div>
                    <p style={{ margin: 0, fontWeight: 700, color: '#1e293b', fontSize: '1rem' }}>{label}</p>
                    <p style={{ margin: '0.15rem 0 0', fontSize: '0.8rem', color: '#6b7280' }}>
                      {isOn ? '✅ Visible to all users in the navigation bar' : '🚫 Hidden from all users — page still accessible via direct URL'}
                    </p>
                  </div>
                  <button
                    onClick={() => toggleFlag(key)}
                    title={`${isOn ? 'Hide' : 'Show'} ${label}`}
                    style={{ background: 'none', border: 'none', cursor: 'pointer', color: isOn ? '#10B981' : '#e11d48', transition: 'transform 0.2s', transform: 'scale(1)', padding: '0.25rem' }}
                    onMouseEnter={e => e.currentTarget.style.transform = 'scale(1.1)'}
                    onMouseLeave={e => e.currentTarget.style.transform = 'scale(1)'}
                  >
                    {isOn ? <ToggleRight size={44} /> : <ToggleLeft size={44} />}
                  </button>
                </div>
              );
            })}
          </div>
        </motion.div>

      </main>
    </div>
  );
};
