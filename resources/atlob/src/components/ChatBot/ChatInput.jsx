// src/components/ChatBot/ChatInput.jsx
import React, { useState, useRef } from 'react';
import { Send, Mic, Loader } from 'lucide-react';

const ChatInput = ({ onSend, darkMode, lang, disabled, onVoice }) => {
  const [input, setInput] = useState('');
  const inputRef = useRef(null);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (input.trim() && !disabled) {
      onSend(input.trim());
      setInput('');
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  const borderColor = darkMode ? '#334155' : '#e2e8f0';
  const textColor = darkMode ? '#f1f5f9' : '#0f172a';
  const inputBg = darkMode ? '#0f172a' : '#f1f5f9';

  const placeholder = lang === 'ar' 
    ? 'اكتب مشكلتك هنا...' 
    : 'Type your problem here...';

  return (
    <form 
      onSubmit={handleSubmit}
      style={{
        padding: '10px 14px',
        borderTop: `1px solid ${borderColor}`,
        display: 'flex',
        gap: '8px',
        background: darkMode ? '#1e293b' : '#ffffff',
        flexShrink: 0,
      }}
    >
      {/* زر البحث الصوتي */}
      {onVoice && (
        <button
          type="button"
          onClick={onVoice}
          style={{
            width: '40px',
            height: '40px',
            borderRadius: '50%',
            border: `1px solid ${borderColor}`,
            background: 'transparent',
            cursor: 'pointer',
            color: textColor,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            transition: 'all 0.3s ease',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = '#3b82f6';
            e.currentTarget.style.color = 'white';
            e.currentTarget.style.borderColor = '#3b82f6';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = 'transparent';
            e.currentTarget.style.color = textColor;
            e.currentTarget.style.borderColor = borderColor;
          }}
        >
          <Mic size={18} />
        </button>
      )}

      <input
        ref={inputRef}
        type="text"
        value={input}
        onChange={(e) => setInput(e.target.value)}
        onKeyPress={handleKeyPress}
        placeholder={placeholder}
        disabled={disabled}
        className="chat-input-field"
        style={{
          flex: 1,
          padding: '10px 14px',
          border: `2px solid ${borderColor}`,
          borderRadius: '24px',
          outline: 'none',
          fontSize: '0.85rem',
          fontFamily: "'Cairo', sans-serif",
          background: inputBg,
          color: textColor,
          transition: 'all 0.3s ease',
          textAlign: lang === 'ar' ? 'right' : 'left',
        }}
        onFocus={(e) => e.target.style.borderColor = '#2563eb'}
        onBlur={(e) => e.target.style.borderColor = borderColor}
      />
      
      <button 
        type="submit"
        disabled={!input.trim() || disabled}
        style={{
          width: '44px',
          height: '44px',
          borderRadius: '50%',
          background: input.trim() && !disabled
            ? 'linear-gradient(135deg, #3b82f6, #2563eb)' 
            : '#cbd5e1',
          color: 'white',
          border: 'none',
          cursor: input.trim() && !disabled ? 'pointer' : 'not-allowed',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          transition: 'all 0.3s ease',
          boxShadow: input.trim() && !disabled ? '0 4px 12px rgba(37,99,235,0.3)' : 'none',
          opacity: input.trim() && !disabled ? 1 : 0.5,
        }}
        onMouseEnter={(e) => {
          if (input.trim() && !disabled) {
            e.currentTarget.style.transform = 'scale(1.1)';
          }
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.transform = 'scale(1)';
        }}
      >
        {disabled ? <Loader size={18} className="animate-spin" /> : <Send size={18} />}
      </button>
    </form>
  );
};

export default ChatInput;