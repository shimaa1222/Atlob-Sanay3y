import React from 'react';
import { Filter, Sliders, Star, Award, MapPin } from 'lucide-react';

export const FilterControls = ({ 
  sortBy, 
  radius, 
  onSortChange, 
  onRadiusChange,
  t,
  darkMode 
}) => {
  const sortOptions = [
    { value: 'distance', label: t.nearest, icon: MapPin },
    { value: 'rating', label: t.highestRated, icon: Star },
    { value: 'experience', label: t.mostExperienced, icon: Award },
  ];

  const radiusOptions = [10, 25, 50, 100, 200];

  return (
    <div style={{
      display: 'flex',
      flexWrap: 'wrap',
      gap: '12px',
      padding: '12px 16px',
      background: darkMode ? '#1e293b' : '#ffffff',
      borderRadius: '12px',
      border: `1px solid ${darkMode ? '#334155' : '#e2e8f0'}`,
      marginBottom: '16px',
      alignItems: 'center',
    }}>
      {/* ترتيب حسب */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
        <Filter size={16} style={{ color: darkMode ? '#94a3b8' : '#64748b' }} />
        <span style={{ 
          fontSize: '0.8rem', 
          color: darkMode ? '#94a3b8' : '#64748b',
          fontWeight: 600,
        }}>
          {t.sortBy}:
        </span>
        <select
          value={sortBy}
          onChange={(e) => onSortChange(e.target.value)}
          style={{
            padding: '4px 10px',
            borderRadius: '8px',
            border: `1px solid ${darkMode ? '#334155' : '#e2e8f0'}`,
            background: darkMode ? '#0f172a' : '#f8fafc',
            color: darkMode ? '#f1f5f9' : '#0f172a',
            fontSize: '0.8rem',
            fontFamily: "'Cairo', sans-serif",
            cursor: 'pointer',
          }}
        >
          {sortOptions.map(opt => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
      </div>

      {/* نطاق البحث */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
        <Sliders size={16} style={{ color: darkMode ? '#94a3b8' : '#64748b' }} />
        <span style={{ 
          fontSize: '0.8rem', 
          color: darkMode ? '#94a3b8' : '#64748b',
          fontWeight: 600,
        }}>
          {t.radius}:
        </span>
        <select
          value={radius}
          onChange={(e) => onRadiusChange(Number(e.target.value))}
          style={{
            padding: '4px 10px',
            borderRadius: '8px',
            border: `1px solid ${darkMode ? '#334155' : '#e2e8f0'}`,
            background: darkMode ? '#0f172a' : '#f8fafc',
            color: darkMode ? '#f1f5f9' : '#0f172a',
            fontSize: '0.8rem',
            fontFamily: "'Cairo', sans-serif",
            cursor: 'pointer',
          }}
        >
          {radiusOptions.map(r => (
            <option key={r} value={r}>
              {r} {t.km}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
};