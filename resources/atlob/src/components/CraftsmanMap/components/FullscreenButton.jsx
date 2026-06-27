import React from 'react';
import { Maximize2, Minimize2 } from 'lucide-react';

export const FullscreenButton = ({ isFullscreen, toggleFullscreen, t, darkMode }) => {
  return (
    <button
      onClick={toggleFullscreen}
      aria-label={isFullscreen ? t.exitFullscreen : t.fullscreen}
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
      }}
    >
      {isFullscreen ? <Minimize2 size={16} /> : <Maximize2 size={16} />}
      {isFullscreen ? t.exitFullscreen : t.fullscreen}
    </button>
  );
};