/**
 * Enterprise Structured Logger
 * 
 * Provides centralized logging with levels, sanitization of sensitive PII,
 * and integration points for APM / Sentry / Datadog observability.
 */

const LOG_LEVELS = {
  DEBUG: 0,
  INFO: 1,
  WARN: 2,
  ERROR: 3,
  SECURITY: 4
};

const CURRENT_LEVEL = process.env.NODE_ENV === 'production' ? LOG_LEVELS.INFO : LOG_LEVELS.DEBUG;

function sanitize(data) {
  if (!data || typeof data !== 'object') return data;
  const copy = Array.isArray(data) ? [...data] : { ...data };
  const sensitiveKeys = ['password', 'temp_password', 'custom_password', 'token', 'secret', 'key'];

  for (const key of Object.keys(copy)) {
    if (sensitiveKeys.some(s => key.toLowerCase().includes(s))) {
      copy[key] = '***REDACTED***';
    } else if (typeof copy[key] === 'object') {
      copy[key] = sanitize(copy[key]);
    }
  }
  return copy;
}

function formatMessage(level, message, context) {
  return {
    timestamp: new Date().toISOString(),
    level,
    message,
    ...(context ? { context: sanitize(context) } : {})
  };
}

export const logger = {
  debug: (message, context) => {
    if (CURRENT_LEVEL <= LOG_LEVELS.DEBUG) {
      console.debug(`[DEBUG] ${message}`, context ? sanitize(context) : '');
    }
  },

  info: (message, context) => {
    if (CURRENT_LEVEL <= LOG_LEVELS.INFO) {
      console.info(`[INFO] ${message}`, context ? sanitize(context) : '');
    }
  },

  warn: (message, context) => {
    if (CURRENT_LEVEL <= LOG_LEVELS.WARN) {
      console.warn(`[WARN] ${message}`, context ? sanitize(context) : '');
    }
  },

  error: (message, error, context) => {
    if (CURRENT_LEVEL <= LOG_LEVELS.ERROR) {
      const payload = formatMessage('ERROR', message, {
        ...(context || {}),
        errorName: error?.name,
        errorMessage: error?.message,
        stack: error?.stack
      });
      console.error(`[ERROR] ${message}`, payload);
      
      // Extensible APM Hook (e.g., window.Sentry?.captureException)
      if (typeof window !== 'undefined' && window.Sentry && error) {
        window.Sentry.captureException(error, { extra: payload });
      }
    }
  },

  security: (event, details) => {
    const payload = formatMessage('SECURITY', event, details);
    console.warn(`[SECURITY AUDIT] ${event}`, payload);
  }
};
