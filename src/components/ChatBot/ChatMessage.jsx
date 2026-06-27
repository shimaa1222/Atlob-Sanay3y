// src/components/ChatBot/ChatMessage.jsx
import React from 'react';
import { Bot, User } from 'lucide-react';

const ChatMessage = ({ message, darkMode, lang }) => {
  const isBot = message.from === 'bot';
  const timestamp = message.timestamp ? new Date(message.timestamp) : new Date();

  const formatTime = (date) => {
    return date.toLocaleTimeString(lang === 'ar' ? 'ar-EG' : 'en-US', {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const botBubble = darkMode ? '#334155' : '#f1f5f9';
  const userBubble = '#2563eb';
  const botText = darkMode ? '#e2e8f0' : '#334155';

  return (
    <div style={{
      display: 'flex',
      justifyContent: isBot ? 'flex-start' : 'flex-end',
      gap: '8px',
      animation: 'fadeIn 0.3s ease forwards',
    }}>
      {isBot && (
        <div style={{
          width: '28px',
          height: '28px',
          borderRadius: '8px',
          background: 'linear-gradient(135deg, #2563eb, #1d4ed8)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexShrink: 0,
          alignSelf: 'flex-end',
        }}>
          <Bot size={14} color="white" />
        </div>
      )}

      <div style={{
        maxWidth: '80%',
        display: 'flex',
        flexDirection: 'column',
        alignItems: isBot ? 'flex-start' : 'flex-end',
        gap: '4px',
      }}>
        <div style={{
          padding: '10px 14px',
          borderRadius: isBot 
            ? '12px 12px 12px 4px'
            : '12px 12px 4px 12px',
          background: isBot ? botBubble : userBubble,
          color: isBot ? botText : 'white',
          fontSize: '0.85rem',
          lineHeight: 1.7,
          boxShadow: isBot 
            ? 'none' 
            : '0 2px 8px rgba(37,99,235,0.3)',
          whiteSpace: 'pre-line',
          wordBreak: 'break-word',
        }}>
          {message.text}
          
          {/* ===== Action Buttons ===== */}
          {message.action && message.action.length > 0 && (
            <div style={{ marginTop: '10px', display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
              {message.action.map((action, index) => (
                <button
                  key={index}
                  onClick={action.onClick}
                  style={{
                    padding: '6px 14px',
                    borderRadius: '20px',
                    border: 'none',
                    background: 'linear-gradient(135deg, #059669, #10b981)',
                    color: 'white',
                    cursor: 'pointer',
                    fontSize: '0.75rem',
                    fontWeight: 600,
                    fontFamily: "'Cairo', sans-serif",
                    transition: 'all 0.3s ease',
                    boxShadow: '0 2px 8px rgba(5,150,105,0.3)',
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.05)'}
                  onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
                >
                  {action.label}
                </button>
              ))}
            </div>
          )}
        </div>
        
        <div style={{
          fontSize: '0.6rem',
          color: darkMode ? '#64748b' : '#94a3b8',
          padding: '0 4px',
        }}>
          {formatTime(timestamp)}
        </div>
      </div>

      {!isBot && (
        <div style={{
          width: '28px',
          height: '28px',
          borderRadius: '8px',
          background: darkMode ? '#334155' : '#e2e8f0',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexShrink: 0,
          alignSelf: 'flex-end',
        }}>
          <User size={14} color={darkMode ? '#94a3b8' : '#64748b'} />
        </div>
      )}
    </div>
  );
};

export default ChatMessage;