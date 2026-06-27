import React from 'react';
import { MapPin, Users } from 'lucide-react';

export const ViewToggle = ({ activeView, setActiveView, t, darkMode }) => {
  const views = [
    { id: 'map', icon: MapPin, label: t.map },
    { id: 'list', icon: Users, label: t.list },
  ];

  return (
    <div
      role="tablist"
      aria-label={t.map}
      style={{
        display: 'flex',
        background: darkMode ? '#0f172a' : '#f1f5f9',
        borderRadius: '10px',
        padding: '3px',
        gap: '2px',
      }}
    >
      {views.map(({ id, icon: Icon, label }) => (
        <button
          key={id}
          role="tab"
          aria-selected={activeView === id}
          aria-label={label}
          onClick={() => setActiveView(id)}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault();
              setActiveView(id);
            }
          }}
          style={{
            padding: '6px 14px',
            borderRadius: '8px',
            border: 'none',
            cursor: 'pointer',
            fontWeight: 600,
            fontSize: '0.8rem',
            fontFamily: "'Cairo', sans-serif",
            background: activeView === id ? '#3b82f6' : 'transparent',
            color: activeView === id ? 'white' : (darkMode ? '#94a3b8' : '#64748b'),
            transition: 'all 0.3s ease',
            display: 'flex',
            alignItems: 'center',
            gap: '4px',
          }}
        >
          <Icon size={14} />
          {label}
        </button>
      ))}
    </div>
  );
};