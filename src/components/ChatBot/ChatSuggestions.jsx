// src/components/ChatBot/ChatSuggestions.jsx
import React from 'react';
import { Sparkles } from 'lucide-react';

const ChatSuggestions = ({ onSelect, darkMode, lang }) => {
  const suggestions = lang === 'ar' ? [
    { icon: '🔧', text: 'عندي تسريب مياه' },
    { icon: '⚡', text: 'النور قاطع عندي' },
    { icon: '🪚', text: 'عايز نجار للأثاث' },
    { icon: '🎨', text: 'محتاج نقاش للشقة' },
    { icon: '❄️', text: 'التكييف مش شغال' },
    { icon: '🧹', text: 'محتاج عامل تنظيف' },
    { icon: '🔩', text: 'عايز حداد للأبواب' },
    { icon: '🏗️', text: 'محتاج بناء للتشطيب' },
  ] : [
    { icon: '🔧', text: 'I have a water leak' },
    { icon: '⚡', text: 'Power is out' },
    { icon: '🪚', text: 'Need a carpenter' },
    { icon: '🎨', text: 'Need a painter' },
    { icon: '❄️', text: 'AC is not working' },
    { icon: '🧹', text: 'Need a cleaner' },
    { icon: '🔩', text: 'Need a blacksmith' },
    { icon: '🏗️', text: 'Need construction' },
  ];

  const borderColor = darkMode ? '#334155' : '#e2e8f0';
  const textColor = darkMode ? '#f1f5f9' : '#0f172a';

  return (
    <div style={{
      padding: '8px 12px',
      display: 'flex',
      flexWrap: 'wrap',
      gap: '6px',
      background: darkMode ? '#1e293b' : '#ffffff',
      borderTop: `1px solid ${borderColor}`,
      flexShrink: 0,
      maxHeight: '100px',
      overflowY: 'auto',
    }}>
      <style>{`
        .suggestion-hover {
          transition: all 0.3s ease;
        }
        .suggestion-hover:hover {
          transform: translateX(-4px);
        }
        @media (max-width: 480px) {
          .suggestion-text {
            font-size: 0.65rem !important;
          }
        }
      `}</style>

      <div style={{
        width: '100%',
        display: 'flex',
        alignItems: 'center',
        gap: '6px',
        marginBottom: '4px',
        color: darkMode ? '#94a3b8' : '#64748b',
        fontSize: '0.7rem',
        fontWeight: 500,
      }}>
        <Sparkles size={14} />
        <span>{lang === 'ar' ? 'اقتراحات سريعة' : 'Quick Suggestions'}</span>
      </div>

      {suggestions.map((suggestion, index) => (
        <button
          key={index}
          onClick={() => onSelect(suggestion.text)}
          className="suggestion-hover suggestion-text"
          style={{
            padding: '4px 12px',
            borderRadius: '16px',
            border: `1px solid ${borderColor}`,
            background: 'transparent',
            cursor: 'pointer',
            fontSize: '0.7rem',
            color: textColor,
            fontFamily: "'Cairo', sans-serif",
            transition: 'all 0.3s ease',
            whiteSpace: 'nowrap',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = '#2563eb';
            e.currentTarget.style.color = 'white';
            e.currentTarget.style.borderColor = '#2563eb';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = 'transparent';
            e.currentTarget.style.color = textColor;
            e.currentTarget.style.borderColor = borderColor;
          }}
        >
          {suggestion.icon} {suggestion.text}
        </button>
      ))}
    </div>
  );
};

export default ChatSuggestions;