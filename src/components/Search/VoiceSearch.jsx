import React, { useState, useEffect, useRef } from 'react';
import { useTheme } from '../../context/ThemeContext';
import { Mic, MicOff, Loader, X, Search } from 'lucide-react';

const VoiceSearch = ({ onResult, onClose, lang = 'ar' }) => {
  const { darkMode } = useTheme();
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [error, setError] = useState('');
  const [browserSupports, setBrowserSupports] = useState(true);
  const recognitionRef = useRef(null);

  // Check browser support
  useEffect(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      setBrowserSupports(false);
      setError(lang === 'ar' ? 'متصفحك لا يدعم البحث الصوتي' : 'Your browser does not support voice search');
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.continuous = false;
    recognition.interimResults = true;
    recognition.lang = lang === 'ar' ? 'ar-SA' : 'en-US';

    recognition.onstart = () => {
      setIsListening(true);
      setError('');
    };

    recognition.onresult = (event) => {
      const current = event.resultIndex;
      const result = event.results[current];
      const text = result[0].transcript;
      
      setTranscript(text);

      // Auto-search when final result
      if (result.isFinal) {
        setIsListening(false);
        setTimeout(() => {
          if (onResult && text.trim()) {
            onResult(text.trim());
          }
        }, 500);
      }
    };

    recognition.onerror = (event) => {
      setIsListening(false);
      switch (event.error) {
        case 'not-allowed':
          setError(lang === 'ar' ? 'يرجى السماح باستخدام الميكروفون' : 'Please allow microphone access');
          break;
        case 'no-speech':
          setError(lang === 'ar' ? 'لم يتم سماع أي كلام. حاول مرة أخرى' : 'No speech detected. Try again');
          break;
        case 'network':
          setError(lang === 'ar' ? 'مشكلة في الاتصال بالإنترنت' : 'Network error');
          break;
        default:
          setError(lang === 'ar' ? 'حدث خطأ. حاول مرة أخرى' : 'An error occurred. Try again');
      }
    };

    recognition.onend = () => {
      setIsListening(false);
    };

    recognitionRef.current = recognition;
  }, [lang]);

  const startListening = () => {
    setTranscript('');
    setError('');
    try {
      recognitionRef.current?.start();
    } catch {
      // Already started
    }
  };

  const stopListening = () => {
    recognitionRef.current?.stop();
    setIsListening(false);
  };

  // Dynamic colors
  const bgColor = darkMode ? '#1e293b' : '#ffffff';
  const textColor = darkMode ? '#f1f5f9' : '#0f172a';
  const textSecondary = darkMode ? '#94a3b8' : '#64748b';
  const borderColor = darkMode ? '#334155' : '#e2e8f0';

  if (!browserSupports) {
    return null; // Or show a message
  }

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      background: 'rgba(0,0,0,0.6)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 1000,
      backdropFilter: 'blur(4px)',
      fontFamily: "'Cairo', sans-serif",
    }}>
      <style>{`
        @keyframes pulse {
          0%, 100% { transform: scale(1); opacity: 1; }
          50% { transform: scale(1.1); opacity: 0.7; }
        }
        @keyframes ripple {
          0% { transform: scale(1); opacity: 0.6; }
          100% { transform: scale(1.8); opacity: 0; }
        }
        @keyframes fadeIn {
          from { opacity: 0; transform: scale(0.9); }
          to { opacity: 1; transform: scale(1); }
        }
        @keyframes wave {
          0%, 100% { height: 10px; }
          50% { height: 30px; }
        }
        .animate-fade-in { animation: fadeIn 0.3s ease forwards; }
        .pulse-ring { animation: ripple 1.5s ease-out infinite; }
        .wave-bar { animation: wave 0.8s ease-in-out infinite; }
      `}</style>

      <div className="animate-fade-in" style={{
        background: bgColor,
        borderRadius: '24px',
        padding: '40px 30px',
        maxWidth: '420px',
        width: '90%',
        textAlign: 'center',
        border: `1px solid ${borderColor}`,
        boxShadow: '0 20px 60px rgba(0,0,0,0.3)',
      }}>
        {/* Close button */}
        <button
          onClick={() => {
            stopListening();
            onClose?.();
          }}
          style={{
            position: 'absolute',
            top: '16px',
            right: '16px',
            background: 'rgba(0,0,0,0.1)',
            border: 'none',
            width: '32px',
            height: '32px',
            borderRadius: '50%',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: textColor,
          }}
        >
          <X size={18} />
        </button>

        {/* Microphone Icon */}
        <div style={{ position: 'relative', display: 'inline-block', marginBottom: '20px' }}>
          {/* Ripple rings */}
          {isListening && (
            <>
              <div className="pulse-ring" style={{
                position: 'absolute',
                top: '50%',
                left: '50%',
                transform: 'translate(-50%, -50%)',
                width: '80px',
                height: '80px',
                borderRadius: '50%',
                background: 'rgba(220,38,38,0.2)',
              }} />
              <div className="pulse-ring" style={{
                position: 'absolute',
                top: '50%',
                left: '50%',
                transform: 'translate(-50%, -50%)',
                width: '100px',
                height: '100px',
                borderRadius: '50%',
                background: 'rgba(220,38,38,0.1)',
                animationDelay: '0.5s',
              }} />
            </>
          )}
          
          <button
            onClick={isListening ? stopListening : startListening}
            style={{
              width: '80px',
              height: '80px',
              borderRadius: '50%',
              border: 'none',
              cursor: 'pointer',
              background: isListening 
                ? 'linear-gradient(135deg, #dc2626, #ef4444)'
                : 'linear-gradient(135deg, #3b82f6, #2563eb)',
              color: 'white',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: isListening 
                ? '0 8px 24px rgba(220,38,38,0.4)'
                : '0 8px 24px rgba(37,99,235,0.4)',
              transition: 'all 0.3s ease',
              position: 'relative',
              zIndex: 1,
            }}
          >
            {isListening ? (
              <MicOff size={32} />
            ) : (
              <Mic size={32} />
            )}
          </button>
        </div>

        {/* Status */}
        <h3 style={{
          fontSize: '1.2rem',
          fontWeight: 700,
          color: textColor,
          marginBottom: '8px',
        }}>
          {isListening 
            ? (lang === 'ar' ? '🎤 استمع الآن...' : '🎤 Listening...')
            : (lang === 'ar' ? 'اضغط للتحدث' : 'Tap to Speak')
          }
        </h3>

        {/* Transcript */}
        {transcript && (
          <div style={{
            background: darkMode ? '#0f172a' : '#f1f5f9',
            borderRadius: '12px',
            padding: '14px 18px',
            marginTop: '16px',
            fontSize: '1rem',
            color: textColor,
            fontWeight: 500,
            lineHeight: 1.6,
            border: `1px solid ${borderColor}`,
          }}>
            "{transcript}"
          </div>
        )}

        {/* Audio Waves */}
        {isListening && (
          <div style={{
            display: 'flex',
            justifyContent: 'center',
            gap: '3px',
            marginTop: '16px',
            height: '30px',
            alignItems: 'flex-end',
          }}>
            {[...Array(7)].map((_, i) => (
              <div
                key={i}
                className="wave-bar"
                style={{
                  width: '4px',
                  background: '#dc2626',
                  borderRadius: '2px',
                  animationDelay: `${i * 0.1}s`,
                }}
              />
            ))}
          </div>
        )}

        {/* Error */}
        {error && (
          <div style={{
            background: 'rgba(220,38,38,0.1)',
            color: '#dc2626',
            padding: '10px 14px',
            borderRadius: '10px',
            marginTop: '16px',
            fontSize: '0.85rem',
          }}>
            {error}
          </div>
        )}

        {/* Hint */}
        <p style={{
          fontSize: '0.8rem',
          color: textSecondary,
          marginTop: '20px',
        }}>
          {lang === 'ar' 
            ? 'جرب: "عايز سباك في مدينة نصر"'
            : 'Try: "I need a plumber in Cairo"'
          }
        </p>

        {/* Quick Search Button */}
        {transcript && !isListening && (
          <button
            onClick={() => {
              onResult?.(transcript);
              onClose?.();
            }}
            style={{
              marginTop: '12px',
              padding: '12px 24px',
              borderRadius: '12px',
              background: '#059669',
              color: 'white',
              border: 'none',
              fontWeight: 700,
              fontSize: '0.95rem',
              cursor: 'pointer',
              fontFamily: "'Cairo', sans-serif",
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px',
            }}
          >
            <Search size={16} />
            {lang === 'ar' ? 'بحث' : 'Search'}
          </button>
        )}
      </div>
    </div>
  );
};

export default VoiceSearch;