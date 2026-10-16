import React from 'react';
import { logger } from '../utils/logger';

export class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    this.setState({ errorInfo });
    logger.error('Unhandled UI Exception caught by ErrorBoundary', error, {
      componentStack: errorInfo?.componentStack,
      boundaryName: this.props.name || 'GlobalErrorBoundary'
    });
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null, errorInfo: null });
    if (this.props.onReset) {
      this.props.onReset();
    }
  };

  render() {
    if (this.state.hasError) {
      return (
        <div style={{
          minHeight: '400px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '2rem',
          background: 'var(--bg-app, #f8fafc)',
          color: 'var(--text-main, #0f172a)'
        }}>
          <div style={{
            maxWidth: '560px',
            width: '100%',
            background: 'var(--bg-card, #ffffff)',
            border: '1px solid var(--border, #e2e8f0)',
            borderRadius: '16px',
            padding: '2.5rem',
            boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
            textAlign: 'center'
          }}>
            <div style={{
              width: '56px',
              height: '56px',
              borderRadius: '50%',
              background: 'rgba(239, 68, 68, 0.1)',
              color: '#ef4444',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '1.75rem',
              margin: '0 auto 1.25rem'
            }}>
              ⚠
            </div>
            <h2 style={{ fontSize: '1.35rem', fontWeight: 800, marginBottom: '0.5rem', color: 'var(--text-main, #0f172a)' }}>
              Something went wrong
            </h2>
            <p style={{ fontSize: '0.875rem', color: 'var(--text-sub, #64748b)', marginBottom: '1.5rem', lineHeight: 1.5 }}>
              An unexpected error occurred while rendering this view. Your session data and existing grades remain secure.
            </p>

            {this.state.error && (
              <div style={{
                background: '#1e293b',
                color: '#f87171',
                padding: '0.85rem',
                borderRadius: '8px',
                fontSize: '0.75rem',
                textAlign: 'left',
                fontFamily: 'monospace',
                marginBottom: '1.5rem',
                overflowX: 'auto',
                maxHeight: '180px'
              }}>
                <div style={{ fontWeight: 800, marginBottom: '0.25rem', color: '#fca5a5' }}>
                  {this.state.error.name || 'Error'}: {this.state.error.message}
                </div>
                {this.state.error.stack && (
                  <pre style={{ margin: 0, fontSize: '0.7rem', color: '#94a3b8', whiteSpace: 'pre-wrap' }}>
                    {this.state.error.stack.split('\n').slice(0, 4).join('\n')}
                  </pre>
                )}
              </div>
            )}

            <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'center', flexWrap: 'wrap' }}>
              <button
                type="button"
                onClick={this.handleReset}
                style={{
                  padding: '0.65rem 1.25rem',
                  borderRadius: '8px',
                  background: 'var(--gold, #d97706)',
                  color: '#ffffff',
                  fontWeight: 700,
                  border: 'none',
                  cursor: 'pointer',
                  fontSize: '0.875rem'
                }}
              >
                🔄 Try Again
              </button>
              <button
                type="button"
                onClick={() => {
                  try {
                    localStorage.removeItem('nexa_lmis_persistent_state');
                  } catch (_) {}
                  window.location.reload();
                }}
                style={{
                  padding: '0.65rem 1.25rem',
                  borderRadius: '8px',
                  background: '#ef4444',
                  color: '#ffffff',
                  fontWeight: 700,
                  border: 'none',
                  cursor: 'pointer',
                  fontSize: '0.875rem'
                }}
                title="Clears local state cache in case of invalid data"
              >
                🧹 Clear Cache &amp; Reload
              </button>
              <button
                type="button"
                onClick={() => window.location.href = '/lmis'}
                style={{
                  padding: '0.65rem 1.25rem',
                  borderRadius: '8px',
                  background: 'var(--navy, #0f172a)',
                  color: '#ffffff',
                  fontWeight: 600,
                  border: 'none',
                  cursor: 'pointer',
                  fontSize: '0.875rem'
                }}
              >
                🏠 Return to Portal Home
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
