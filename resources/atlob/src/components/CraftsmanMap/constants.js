// ثوابت التطبيق
export const MAP_CONFIG = {
  EARTH_RADIUS_KM: 6371,
  MAX_NEARBY_DISPLAY: 10,
  DEFAULT_LOCATION: 'القاهرة',
  ANIMATION_DELAY_BASE: 0.1,
  CACHE_DURATION: 5 * 60 * 1000, // 5 دقائق
  MAP_ZOOM: 14,
  MAP_HEIGHT: 350,
  FULLSCREEN_HEIGHT: '80vh',
};

export const STYLE_CONSTANTS = {
  COLORS: {
    primary: '#3b82f6',
    primaryDark: '#2563eb',
    success: '#059669',
    warning: '#f59e0b',
    danger: '#ef4444',
    white: '#ffffff',
    gray: {
      50: '#f8fafc',
      100: '#f1f5f9',
      200: '#e2e8f0',
      300: '#cbd5e1',
      400: '#94a3b8',
      500: '#64748b',
      600: '#475569',
      700: '#334155',
      800: '#1e293b',
      900: '#0f172a',
    }
  },
  BORDER_RADIUS: {
    small: '6px',
    medium: '10px',
    large: '14px',
    xlarge: '16px',
    full: '50%',
  },
  TRANSITIONS: {
    default: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
    slow: 'all 0.5s cubic-bezier(0.4, 0, 0.2, 1)',
    bounce: 'all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)',
  },
  SHADOWS: {
    sm: '0 1px 2px rgba(0,0,0,0.05)',
    md: '0 4px 6px -1px rgba(0,0,0,0.1)',
    lg: '0 10px 15px -3px rgba(0,0,0,0.1)',
    xl: '0 20px 25px -5px rgba(0,0,0,0.1)',
  }
};