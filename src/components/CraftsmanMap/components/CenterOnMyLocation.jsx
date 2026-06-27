import React from 'react';
import { Navigation } from 'lucide-react';

export const CenterOnMyLocation = ({ 
  userLocation, 
  onCenter, 
  t, 
  darkMode 
}) => {
  if (!userLocation) return null;

  return (
    <button
      onClick={onCenter}
      aria-label={t.centerOnMe}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: '6px',
        padding: '8px 14px',
        borderRadius: '10px',
        background: darkMode ? '#1e293b' : '#ffffff',
        color: darkMode ? '#f1f5f9' : '#0f172a',
        border: `1px solid ${darkMode ? '#334155' : '#e2e8f0'}`,
        cursor: 'pointer',
        fontSize: '0.85rem',
        fontWeight: 600,
        fontFamily: "'Cairo', sans-serif",
        transition: 'all 0.3s ease',
        boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.transform = 'scale(1.05)';
        e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.15)';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = 'scale(1)';
        e.currentTarget.style.boxShadow = '0 2px 8px rgba(0,0,0,0.1)';
      }}
    >
      <Navigation size={16} style={{ color: '#3b82f6' }} />
      {t.centerOnMe}
    </button>
  );
};