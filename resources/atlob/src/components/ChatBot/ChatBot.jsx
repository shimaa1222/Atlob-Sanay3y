import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTheme } from '../../context/ThemeContext';
import { 
  MessageCircle, X, Send, RotateCcw, Sparkles,
  Search, MapPin, Wrench, Zap, PaintBucket,
  Home, ThermometerSun, HardHat, HelpCircle,
  ThumbsUp, Clock, Phone, ArrowRight, Bot,
  User, ChevronDown, Star, Shield
} from 'lucide-react';

const ChatBot = () => {
  const { darkMode } = useTheme();
  const [isOpen, setIsOpen] = useState(false);
  const [lang, setLang] = useState('ar');
  const [step, setStep] = useState('welcome');
  const [problem, setProblem] = useState('');
  const [location, setLocation] = useState('');
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(true);
  const [unreadCount, setUnreadCount] = useState(1);
  const [messages, setMessages] = useState([]);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);
  const navigate = useNavigate();

  // Language initialization
  useEffect(() => {
    const savedLang = localStorage.getItem('language') || 'ar';
    setLang(savedLang);
    setMessages([{
      text: savedLang === 'ar' 
        ? '👋 مرحباً! أنا مساعدك الذكي. اكتب المشكلة اللي عندك وأنا هساعدك تلاقي الحرفي المناسب.'
        : '👋 Hello! I\'m your smart assistant. Tell me your problem and I\'ll help you find the right craftsman.',
      from: 'bot'
    }]);
    
    const handleLanguageChange = () => {
      const currentLang = localStorage.getItem('language') || 'ar';
      setLang(currentLang);
    };
    
    window.addEventListener('languagechange', handleLanguageChange);
    return () => window.removeEventListener('languagechange', handleLanguageChange);
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Focus input when chat opens
  useEffect(() => {
    if (isOpen && inputRef.current) {
      setTimeout(() => inputRef.current?.focus(), 300);
    }
    if (isOpen) setUnreadCount(0);
  }, [isOpen]);

  // Knowledge base
  const knowledgeBase = [
    { 
      keywords: ['تسريب', 'مياه', 'سباك', 'حنفية', 'مواسير', 'حمام', 'سخان', 'بالوعة', 'صرف', 'مجاري', 'تسرب', 'plumb', 'leak', 'water', 'pipe'],
      service: lang === 'ar' ? 'سباكة' : 'Plumbing',
      answer: lang === 'ar' ? '🔧 دي مشكلة سباكة. أنت محتاج سباك متخصص.' : '🔧 This is a plumbing issue. You need a specialist plumber.',
      icon: <Wrench size={20} />,
      color: '#3b82f6'
    },
    { 
      keywords: ['كهرباء', 'كهربائي', 'نور', 'فيشة', 'مفتاح', 'قاطع', 'أسلاك', 'لمبة', 'إضاءة', 'التماس', 'electric', 'light', 'power', 'switch'],
      service: lang === 'ar' ? 'كهرباء' : 'Electricity',
      answer: lang === 'ar' ? '⚡ دي مشكلة كهربائية. أنت محتاج كهربائي.' : '⚡ This is an electrical issue. You need an electrician.',
      icon: <Zap size={20} />,
      color: '#f59e0b'
    },
    { 
      keywords: ['نجار', 'خشب', 'باب', 'شباك', 'دولاب', 'مطبخ', 'أثاث', 'كرسي', 'طاولة', 'ترابيزة', 'carpenter', 'wood', 'door', 'furniture'],
      service: lang === 'ar' ? 'نجارة' : 'Carpentry',
      answer: lang === 'ar' ? '🪚 دي شغل نجارة. أنت محتاج نجار محترف.' : '🪚 This is carpentry work. You need a professional carpenter.',
      icon: <HardHat size={20} />,
      color: '#8b5cf6'
    },
    { 
      keywords: ['دهان', 'نقاش', 'لون', 'جدران', 'حيطان', 'ورق', 'بويه', 'رسم', 'paint', 'color', 'wall'],
      service: lang === 'ar' ? 'دهان' : 'Painting',
      answer: lang === 'ar' ? '🎨 أنت محتاج نقاش (دهان).' : '🎨 You need a painter.',
      icon: <PaintBucket size={20} />,
      color: '#ec4899'
    },
    { 
      keywords: ['تكييف', 'مكيف', 'تبريد', 'هواء', 'فريون', 'غسيل مكيف', 'ac', 'air condition', 'cooling'],
      service: lang === 'ar' ? 'فني تكييف' : 'AC Technician',
      answer: lang === 'ar' ? '❄️ دي صيانة تكييف. أنت محتاج فني تكييف.' : '❄️ This is AC maintenance. You need an AC technician.',
      icon: <ThermometerSun size={20} />,
      color: '#06b6d4'
    },
    { 
      keywords: ['بناء', 'تشطيب', 'سقف', 'جدار', 'طوب', 'أسمنت', 'خرسانة', 'ترميم', 'هدم', 'build', 'construction', 'cement'],
      service: lang === 'ar' ? 'بناء' : 'Construction',
      answer: lang === 'ar' ? '🏗️ دي شغل بناء. أنت محتاج بناء.' : '🏗️ This is construction work. You need a builder.',
      icon: <Home size={20} />,
      color: '#f97316'
    }
  ];

  const quickSuggestions = lang === 'ar' ? [
    { icon: '🔧', text: 'عندي تسريب مياه' },
    { icon: '⚡', text: 'النور قاطع عندي' },
    { icon: '🪚', text: 'عايز نجار للأثاث' },
    { icon: '🎨', text: 'محتاج نقاش للشقة' },
  ] : [
    { icon: '🔧', text: 'I have a water leak' },
    { icon: '⚡', text: 'Power is out' },
    { icon: '🪚', text: 'Need a carpenter' },
    { icon: '🎨', text: 'Need a painter' },
  ];

  const findService = (text) => {
    const lower = text.toLowerCase();
    for (const item of knowledgeBase) {
      for (const kw of item.keywords) {
        if (lower.includes(kw)) return item;
      }
    }
    return null;
  };

  const addBotMessage = (text, action = false, delay = 500) => {
    setIsTyping(true);
    setTimeout(() => {
      setMessages(prev => [...prev, { text, from: 'bot', action }]);
      setIsTyping(false);
    }, delay);
  };

  const handleSend = () => {
    if (!input.trim()) return;
    const userMsg = { text: input, from: 'user' };
    setMessages(prev => [...prev, userMsg]);
    const userInput = input;
    setInput('');
    setShowSuggestions(false);

    if (step === 'welcome') {
      const found = findService(userInput);
      if (found) {
        setProblem(found.service);
        addBotMessage(found.answer);
        setTimeout(() => {
          addBotMessage(
            lang === 'ar' 
              ? '📍 تقدر تقول لي اسم مدينتك أو منطقتك؟'
              : '📍 Can you tell me your city or area?'
          );
          setStep('askLocation');
        }, 800);
      } else {
        addBotMessage(
          lang === 'ar'
            ? '🤔 مقدرتش أحدد المشكلة بالضبط. ممكن توصفها بطريقة تانية؟\n\nمثال: "عندي تسريب مياه في الحمام" أو "النور قاطع في البيت"'
            : "🤔 I couldn't identify the problem. Can you describe it differently?\n\nExample: 'I have a water leak in the bathroom' or 'The power is out at home'"
        );
      }
    } else if (step === 'askLocation') {
      setLocation(userInput);
      addBotMessage(
        lang === 'ar'
          ? `✅ تمام! هدور لك على ${problem} في ${userInput}.`
          : `✅ Got it! I'll search for ${problem} in ${userInput}.`
      );
      setTimeout(() => {
        addBotMessage(
          lang === 'ar'
            ? `🎯 تقدر تضغط على الزر تحت عشان تشوف الـ ${problem} المتاحين.`
            : `🎯 You can click the button below to see available ${problem}.`,
          true
        );
        setStep('done');
      }, 800);
    } else {
      addBotMessage(
        lang === 'ar'
          ? '🔄 تقدر تبدأ من جديد. اكتب لي المشكلة اللي عندك.'
          : '🔄 You can start over. Tell me your problem.'
      );
      setStep('welcome');
      setShowSuggestions(true);
    }
  };

  const handleSuggestion = (text) => {
    setInput(text);
    setTimeout(() => handleSend(), 100);
  };

  const handleSearch = () => {
    navigate(`/search?q=${problem}${location ? `&location=${location}` : ''}`);
    setIsOpen(false);
  };

  const handleReset = () => {
    setMessages([{
      text: lang === 'ar'
        ? '👋 مرحباً! اكتب المشكلة اللي عندك وأنا هساعدك.'
        : '👋 Hello! Tell me your problem and I\'ll help you.',
      from: 'bot'
    }]);
    setStep('welcome');
    setProblem('');
    setLocation('');
    setShowSuggestions(true);
    if (inputRef.current) inputRef.current.focus();
  };

  // Dynamic colors
  const chatBg = darkMode ? '#1e293b' : '#ffffff';
  const headerBg = darkMode ? '#1e3a8a' : '#2563eb';
  const inputBg = darkMode ? '#0f172a' : '#f1f5f9';
  const userBubble = '#2563eb';
  const botBubble = darkMode ? '#334155' : '#f1f5f9';
  const botText = darkMode ? '#e2e8f0' : '#334155';
  const borderColor = darkMode ? '#334155' : '#e2e8f0';
  const textColor = darkMode ? '#f1f5f9' : '#0f172a';

  const t = {
    title: lang === 'ar' ? 'المساعد الذكي' : 'Smart Assistant',
    subtitle: lang === 'ar' ? 'اسأل عن أي خدمة' : 'Ask about any service',
    placeholder: lang === 'ar' ? 'اكتب مشكلتك هنا...' : 'Type your problem here...',
    send: lang === 'ar' ? 'إرسال' : 'Send',
    online: lang === 'ar' ? 'متصل الآن' : 'Online now',
    typing: lang === 'ar' ? 'يكتب...' : 'Typing...',
    search: lang === 'ar' ? '🔍 بحث عن' : '🔍 Search for',
    support: lang === 'ar' ? 'الدعم الفني' : 'Tech Support',
    callSupport: lang === 'ar' ? ' اتصل بالدعم: 19555' : ' Call support: 19555',
  };

  return (
    <div style={{ 
      position: 'fixed', 
      bottom: '20px', 
      right: '20px', 
      zIndex: 999,
      fontFamily: "'Cairo', sans-serif",
    }}>
      <style>{`
        @keyframes slideUp {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        
        @keyframes pulse {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.1); }
        }
        
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        
        @keyframes bounce {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-5px); }
        }
        
        @keyframes typing {
          0%, 100% { opacity: 0.3; }
          50% { opacity: 1; }
        }
        
        .chat-open {
          animation: slideUp 0.3s ease forwards;
        }
        
        .message-enter {
          animation: slideUp 0.3s ease forwards;
        }
        
        .pulse-dot {
          animation: pulse 2s infinite;
        }
        
        .typing-dot {
          animation: typing 1.4s infinite;
        }
        
        .typing-dot:nth-child(2) {
          animation-delay: 0.2s;
        }
        
        .typing-dot:nth-child(3) {
          animation-delay: 0.4s;
        }
        
        .suggestion-hover:hover {
          transform: translateX(-4px);
        }
        
        @media (max-width: 480px) {
          .chat-window {
            width: calc(100vw - 30px) !important;
            height: calc(100vh - 120px) !important;
            max-height: 550px !important;
          }
        }
      `}</style>

      {/* Chat Button */}
      {!isOpen && (
        <button 
          onClick={() => setIsOpen(true)}
          style={{
            width: '60px',
            height: '60px',
            borderRadius: '50%',
            background: 'linear-gradient(135deg, #3b82f6, #2563eb)',
            color: 'white',
            border: 'none',
            fontSize: '1.5rem',
            cursor: 'pointer',
            boxShadow: '0 8px 24px rgba(37,99,235,0.4)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            transition: 'all 0.3s ease',
            position: 'relative',
          }}
          onMouseEnter={(e) => {
            e.target.style.transform = 'scale(1.1)';
          }}
          onMouseLeave={(e) => {
            e.target.style.transform = 'scale(1)';
          }}
        >
          <MessageCircle size={28} />
          {unreadCount > 0 && (
            <span style={{
              position: 'absolute',
              top: '-4px',
              right: '-4px',
              background: '#ef4444',
              color: 'white',
              width: '22px',
              height: '22px',
              borderRadius: '50%',
              fontSize: '0.75rem',
              fontWeight: 700,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              border: '2px solid white',
              animation: 'pulse 2s infinite',
            }}>
              {unreadCount}
            </span>
          )}
          <div style={{
            position: 'absolute',
            bottom: '-2px',
            right: '-2px',
            width: '14px',
            height: '14px',
            borderRadius: '50%',
            background: '#10b981',
            border: '2px solid white',
          }} />
        </button>
      )}

      {/* Chat Window */}
      {isOpen && (
        <div 
          className="chat-open chat-window"
          style={{
            width: '380px',
            height: '520px',
            background: chatBg,
            borderRadius: '20px',
            boxShadow: '0 20px 60px rgba(0,0,0,0.2)',
            display: 'flex',
            flexDirection: 'column',
            overflow: 'hidden',
            border: `1px solid ${borderColor}`,
          }}
        >
          {/* Header */}
          <div style={{
            background: `linear-gradient(135deg, ${headerBg}, #1e40af)`,
            color: 'white',
            padding: '16px 20px',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            position: 'relative',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div style={{
                width: '44px',
                height: '44px',
                borderRadius: '12px',
                background: 'rgba(255,255,255,0.2)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                position: 'relative',
              }}>
                <Bot size={24} />
                <div style={{
                  position: 'absolute',
                  bottom: '-2px',
                  right: '-2px',
                  width: '12px',
                  height: '12px',
                  borderRadius: '50%',
                  background: '#10b981',
                  border: '2px solid white',
                }} />
              </div>
              <div>
                <div style={{ fontWeight: 700, fontSize: '1rem' }}>{t.title}</div>
                <div style={{ fontSize: '0.75rem', opacity: 0.8, display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <span className="pulse-dot" style={{
                    width: '6px',
                    height: '6px',
                    borderRadius: '50%',
                    background: '#10b981',
                    display: 'inline-block',
                  }} />
                  {t.online}
                </div>
              </div>
            </div>
            
            <div style={{ display: 'flex', gap: '4px' }}>
              <button 
                onClick={handleReset}
                style={{
                  background: 'rgba(255,255,255,0.15)',
                  border: 'none',
                  color: 'white',
                  cursor: 'pointer',
                  width: '32px',
                  height: '32px',
                  borderRadius: '8px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  transition: 'all 0.3s ease',
                }}
                onMouseEnter={(e) => e.target.style.background = 'rgba(255,255,255,0.25)'}
                onMouseLeave={(e) => e.target.style.background = 'rgba(255,255,255,0.15)'}
                title={lang === 'ar' ? 'إعادة البدء' : 'Restart'}
              >
                <RotateCcw size={16} />
              </button>
              <button 
                onClick={() => setIsOpen(false)}
                style={{
                  background: 'rgba(255,255,255,0.15)',
                  border: 'none',
                  color: 'white',
                  cursor: 'pointer',
                  width: '32px',
                  height: '32px',
                  borderRadius: '8px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  transition: 'all 0.3s ease',
                }}
                onMouseEnter={(e) => e.target.style.background = 'rgba(239,68,68,0.8)'}
                onMouseLeave={(e) => e.target.style.background = 'rgba(255,255,255,0.15)'}
              >
                <X size={18} />
              </button>
            </div>
          </div>

          {/* Messages Area */}
          <div style={{
            flex: 1,
            padding: '16px',
            overflowY: 'auto',
            background: darkMode ? '#0f172a' : '#f8fafc',
            display: 'flex',
            flexDirection: 'column',
            gap: '12px',
          }}>
            {messages.map((msg, i) => (
              <div 
                key={i} 
                className="message-enter"
                style={{
                  display: 'flex',
                  justifyContent: msg.from === 'user' ? 'flex-end' : 'flex-start',
                }}
              >
                {msg.from === 'bot' && (
                  <div style={{
                    width: '28px',
                    height: '28px',
                    borderRadius: '8px',
                    background: headerBg,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    marginRight: '8px',
                    flexShrink: 0,
                    alignSelf: 'flex-end',
                  }}>
                    <Bot size={14} color="white" />
                  </div>
                )}
                
                <div style={{
                  maxWidth: '80%',
                  padding: '12px 16px',
                  borderRadius: msg.from === 'user' 
                    ? '16px 16px 4px 16px' 
                    : '16px 16px 16px 4px',
                  background: msg.from === 'user' ? userBubble : botBubble,
                  color: msg.from === 'user' ? 'white' : botText,
                  fontSize: '0.875rem',
                  lineHeight: 1.7,
                  boxShadow: msg.from === 'user' 
                    ? '0 2px 8px rgba(37,99,235,0.3)' 
                    : '0 1px 3px rgba(0,0,0,0.1)',
                  whiteSpace: 'pre-line',
                  wordBreak: 'break-word',
                }}>
                  {msg.text}
                  
                  {msg.action && (
                    <div style={{ marginTop: '12px' }}>
                      <button 
                        onClick={handleSearch}
                        style={{
                          width: '100%',
                          padding: '12px 16px',
                          background: 'linear-gradient(135deg, #059669, #10b981)',
                          color: 'white',
                          border: 'none',
                          borderRadius: '12px',
                          cursor: 'pointer',
                          fontWeight: 700,
                          fontSize: '0.875rem',
                          fontFamily: "'Cairo', sans-serif",
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          gap: '8px',
                          transition: 'all 0.3s ease',
                          boxShadow: '0 4px 12px rgba(5,150,105,0.3)',
                        }}
                        onMouseEnter={(e) => {
                          e.target.style.transform = 'translateY(-2px)';
                          e.target.style.boxShadow = '0 6px 16px rgba(5,150,105,0.4)';
                        }}
                        onMouseLeave={(e) => {
                          e.target.style.transform = 'translateY(0)';
                          e.target.style.boxShadow = '0 4px 12px rgba(5,150,105,0.3)';
                        }}
                      >
                        <Search size={16} />
                        {t.search} {problem} {location ? `في ${location}` : ''}
                        <ArrowRight size={16} />
                      </button>
                    </div>
                  )}
                </div>
                
                {msg.from === 'user' && (
                  <div style={{
                    width: '28px',
                    height: '28px',
                    borderRadius: '8px',
                    background: '#e2e8f0',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    marginLeft: '8px',
                    flexShrink: 0,
                    alignSelf: 'flex-end',
                  }}>
                    <User size={14} color="#64748b" />
                  </div>
                )}
              </div>
            ))}
            
            {/* Typing indicator */}
            {isTyping && (
              <div className="message-enter" style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                padding: '8px 16px',
              }}>
                <div style={{
                  width: '28px',
                  height: '28px',
                  borderRadius: '8px',
                  background: headerBg,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}>
                  <Bot size={14} color="white" />
                </div>
                <div style={{
                  background: botBubble,
                  borderRadius: '12px',
                  padding: '12px 16px',
                  display: 'flex',
                  gap: '4px',
                }}>
                  <span className="typing-dot" style={{
                    width: '8px',
                    height: '8px',
                    borderRadius: '50%',
                    background: botText,
                    display: 'inline-block',
                  }} />
                  <span className="typing-dot" style={{
                    width: '8px',
                    height: '8px',
                    borderRadius: '50%',
                    background: botText,
                    display: 'inline-block',
                  }} />
                  <span className="typing-dot" style={{
                    width: '8px',
                    height: '8px',
                    borderRadius: '50%',
                    background: botText,
                    display: 'inline-block',
                  }} />
                </div>
              </div>
            )}
            
            <div ref={messagesEndRef} />
          </div>

          {/* Quick Suggestions */}
          {showSuggestions && step === 'welcome' && (
            <div style={{
              padding: '8px 16px',
              display: 'flex',
              flexWrap: 'wrap',
              gap: '6px',
              background: darkMode ? '#1e293b' : '#ffffff',
              borderTop: `1px solid ${borderColor}`,
            }}>
              {quickSuggestions.map((suggestion, index) => (
                <button
                  key={index}
                  onClick={() => handleSuggestion(suggestion.text)}
                  className="suggestion-hover"
                  style={{
                    padding: '6px 12px',
                    borderRadius: '16px',
                    border: `1px solid ${borderColor}`,
                    background: 'transparent',
                    cursor: 'pointer',
                    fontSize: '0.75rem',
                    color: textColor,
                    fontFamily: "'Cairo', sans-serif",
                    transition: 'all 0.3s ease',
                    whiteSpace: 'nowrap',
                  }}
                  onMouseEnter={(e) => {
                    e.target.style.background = '#2563eb';
                    e.target.style.color = 'white';
                    e.target.style.borderColor = '#2563eb';
                  }}
                  onMouseLeave={(e) => {
                    e.target.style.background = 'transparent';
                    e.target.style.color = textColor;
                    e.target.style.borderColor = borderColor;
                  }}
                >
                  {suggestion.icon} {suggestion.text}
                </button>
              ))}
            </div>
          )}

          {/* Input Area */}
          <div style={{
            padding: '12px 16px',
            borderTop: `1px solid ${borderColor}`,
            display: 'flex',
            gap: '8px',
            background: chatBg,
          }}>
            <input
              ref={inputRef}
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSend()}
              placeholder={t.placeholder}
              style={{
                flex: 1,
                padding: '12px 16px',
                border: `2px solid ${borderColor}`,
                borderRadius: '24px',
                outline: 'none',
                fontSize: '0.875rem',
                fontFamily: "'Cairo', sans-serif",
                background: inputBg,
                color: textColor,
                transition: 'all 0.3s ease',
              }}
              onFocus={(e) => e.target.style.borderColor = '#2563eb'}
              onBlur={(e) => e.target.style.borderColor = borderColor}
            />
            <button 
              onClick={handleSend}
              disabled={!input.trim()}
              style={{
                width: '44px',
                height: '44px',
                borderRadius: '50%',
                background: input.trim() 
                  ? 'linear-gradient(135deg, #3b82f6, #2563eb)' 
                  : '#cbd5e1',
                color: 'white',
                border: 'none',
                cursor: input.trim() ? 'pointer' : 'not-allowed',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                transition: 'all 0.3s ease',
                boxShadow: input.trim() ? '0 4px 12px rgba(37,99,235,0.3)' : 'none',
                opacity: input.trim() ? 1 : 0.5,
              }}
              onMouseEnter={(e) => {
                if (input.trim()) {
                  e.target.style.transform = 'scale(1.1)';
                }
              }}
              onMouseLeave={(e) => {
                e.target.style.transform = 'scale(1)';
              }}
            >
              <Send size={18} />
            </button>
          </div>

          {/* Footer */}
          <div style={{
            padding: '8px 16px',
            textAlign: 'center',
            fontSize: '0.7rem',
            color: darkMode ? '#64748b' : '#94a3b8',
            borderTop: `1px solid ${borderColor}`,
            background: chatBg,
          }}>
            <Phone size={10} style={{ display: 'inline', marginRight: '4px' }} />
            {t.callSupport}
          </div>
        </div>
      )}
    </div>
  );
};

export default ChatBot;