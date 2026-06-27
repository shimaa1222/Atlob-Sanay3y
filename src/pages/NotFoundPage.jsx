import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useTheme } from '../context/ThemeContext';
import { 
  Home, HelpCircle, ArrowLeft, Search, Wrench,
  Sparkles, MapPin, Compass, AlertTriangle,
  Frown, Smile, Meh
} from 'lucide-react';

const NotFoundPage = () => {
  const navigate = useNavigate();
  const { darkMode } = useTheme();
  const [lang, setLang] = useState('ar');
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [currentEmoji, setCurrentEmoji] = useState(0);

  // Language initialization
  useEffect(() => {
    const savedLang = localStorage.getItem('language') || 'ar';
    setLang(savedLang);
    
    const handleLanguageChange = () => {
      const currentLang = localStorage.getItem('language') || 'ar';
      setLang(currentLang);
    };
    
    window.addEventListener('languagechange', handleLanguageChange);
    return () => window.removeEventListener('languagechange', handleLanguageChange);
  }, []);

  // Mouse movement for parallax effect
  useEffect(() => {
    const handleMouseMove = (e) => {
      setMousePosition({
        x: (e.clientX / window.innerWidth - 0.5) * 20,
        y: (e.clientY / window.innerHeight - 0.5) * 20,
      });
    };
    
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  // Rotate emoji every 3 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentEmoji((prev) => (prev + 1) % 3);
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  const emojis = ['😕', '😢', '🤔'];

  // Translations
  const t = {
    code: '404',
    title: lang === 'ar' ? 'عفواً! الصفحة غير موجودة' : 'Oops! Page Not Found',
    description: lang === 'ar' 
      ? 'يبدو أن الصفحة التي تبحث عنها قد تم نقلها أو حذفها. لا تقلق، يمكنك العودة للصفحة الرئيسية أو البحث عن الخدمات.'
      : 'The page you are looking for might have been moved or deleted. Don\'t worry, you can go back to homepage or search for services.',
    backHome: lang === 'ar' ? 'العودة للرئيسية' : 'Back to Home',
    getHelp: lang === 'ar' ? 'مركز المساعدة' : 'Help Center',
    searchServices: lang === 'ar' ? 'البحث عن خدمات' : 'Search Services',
    goBack: lang === 'ar' ? 'العودة للخلف' : 'Go Back',
    suggestions: lang === 'ar' ? 'ربما تبحث عن:' : 'You might be looking for:',
    home: lang === 'ar' ? 'الرئيسية' : 'Home',
    about: lang === 'ar' ? 'عن المنصة' : 'About',
    services: lang === 'ar' ? 'الخدمات' : 'Services',
    contact: lang === 'ar' ? 'اتصل بنا' : 'Contact Us',
    lostMessage: lang === 'ar' ? 'لقد ضللت الطريق!' : 'You seem lost!',
    funnyMessages: lang === 'ar' ? [
      'الصنايعي مش هنا... الصفحة برضه مش هنا! 🔨',
      'حتى الصنايعي محتاج خرائط عشان يلاقي الصفحة دي! 🗺️',
      'الصفحة طلعت في أجازة... ارجع بكره! 😅',
    ] : [
      'The craftsman isn\'t here... neither is this page! 🔨',
      'Even a craftsman needs a map to find this page! 🗺️',
      'This page is on vacation... come back tomorrow! 😅',
    ],
  };

  const suggestions = [
    { path: '/', label: t.home, icon: <Home size={18} /> },
    { path: '/about', label: t.about, icon: <Compass size={18} /> },
    { path: '/search', label: t.services, icon: <Search size={18} /> },
    { path: '/help', label: t.contact, icon: <HelpCircle size={18} /> },
  ];

  // Dynamic colors
  const bgColor = darkMode ? '#0f172a' : '#f8fafc';
  const cardBg = darkMode ? '#1e293b' : '#ffffff';
  const textColor = darkMode ? '#f1f5f9' : '#0f172a';
  const textSecondary = darkMode ? '#94a3b8' : '#64748b';
  const borderColor = darkMode ? '#334155' : '#e2e8f0';
  const accentColor = '#3b82f6';

  // Random funny message
  const randomMessage = t.funnyMessages[Math.floor(Math.random() * t.funnyMessages.length)];

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: bgColor,
      padding: '40px 20px',
      fontFamily: "'Cairo', sans-serif",
      position: 'relative',
      overflow: 'hidden',
    }}>
      <style>{`
        @keyframes fadeInUp {
          from { opacity: 0; transform: translateY(30px); }
          to { opacity: 1; transform: translateY(0); }
        }
        
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        
        @keyframes scaleIn {
          from { opacity: 0; transform: scale(0.5); }
          to { opacity: 1; transform: scale(1); }
        }
        
        @keyframes float {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-15px); }
        }
        
        @keyframes pulse {
          0%, 100% { transform: scale(1); opacity: 0.1; }
          50% { transform: scale(1.1); opacity: 0.15; }
        }
        
        @keyframes rotate {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        
        @keyframes bounce {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-20px); }
        }
        
        @keyframes shimmer {
          0% { background-position: -200% 0; }
          100% { background-position: 200% 0; }
        }
        
        @keyframes wobble {
          0%, 100% { transform: rotate(0deg); }
          25% { transform: rotate(-5deg); }
          75% { transform: rotate(5deg); }
        }
        
        .animate-fade-in-up {
          animation: fadeInUp 0.6s ease forwards;
        }
        
        .animate-fade-in {
          animation: fadeIn 0.5s ease forwards;
        }
        
        .animate-scale-in {
          animation: scaleIn 0.8s cubic-bezier(0.68, -0.55, 0.265, 1.55) forwards;
        }
        
        .animate-float {
          animation: float 4s ease-in-out infinite;
        }
        
        .animate-pulse-slow {
          animation: pulse 3s ease-in-out infinite;
        }
        
        .animate-bounce-slow {
          animation: bounce 2s ease-in-out infinite;
        }
        
        .animate-wobble {
          animation: wobble 2s ease-in-out infinite;
        }
        
        .delay-100 { animation-delay: 0.1s; }
        .delay-200 { animation-delay: 0.2s; }
        .delay-300 { animation-delay: 0.3s; }
        .delay-400 { animation-delay: 0.4s; }
        .delay-500 { animation-delay: 0.5s; }
        
        .hover-lift {
          transition: all 0.3s ease;
        }
        
        .hover-lift:hover {
          transform: translateY(-5px);
          box-shadow: 0 12px 28px rgba(0,0,0,0.15);
        }
        
        .suggestion-card {
          transition: all 0.3s ease;
        }
        
        .suggestion-card:hover {
          transform: translateY(-3px);
          border-color: #3b82f6 !important;
          background: rgba(59,130,246,0.05);
        }
        
        @media (max-width: 768px) {
          .error-code {
            font-size: 8rem !important;
          }
          .error-title {
            font-size: 1.5rem !important;
          }
        }
        
        @media (max-width: 480px) {
          .error-code {
            font-size: 6rem !important;
          }
          .suggestions-grid {
            grid-template-columns: 1fr 1fr !important;
          }
        }
      `}</style>

      {/* Background Decorative Elements */}
      <div style={{
        position: 'absolute',
        top: '10%',
        right: '10%',
        width: '200px',
        height: '200px',
        borderRadius: '50%',
        background: 'rgba(59,130,246,0.05)',
        animation: 'pulse 3s ease-in-out infinite',
      }} />
      <div style={{
        position: 'absolute',
        bottom: '15%',
        left: '8%',
        width: '250px',
        height: '250px',
        borderRadius: '50%',
        background: 'rgba(139,92,246,0.05)',
        animation: 'pulse 4s ease-in-out infinite 1s',
      }} />
      <div style={{
        position: 'absolute',
        top: '40%',
        left: '20%',
        width: '150px',
        height: '150px',
        borderRadius: '50%',
        background: 'rgba(245,158,11,0.04)',
        animation: 'float 5s ease-in-out infinite',
      }} />

      {/* Floating Tools */}
      <div className="animate-float" style={{
        position: 'absolute',
        top: '15%',
        left: '15%',
        opacity: 0.15,
        transform: `translate(${mousePosition.x * 0.5}px, ${mousePosition.y * 0.5}px)`,
        transition: 'transform 0.1s ease',
      }}>
        <Wrench size={60} style={{ color: accentColor }} />
      </div>
      <div className="animate-float" style={{
        position: 'absolute',
        bottom: '20%',
        right: '12%',
        opacity: 0.1,
        animationDelay: '1s',
        transform: `translate(${-mousePosition.x * 0.3}px, ${-mousePosition.y * 0.3}px)`,
        transition: 'transform 0.1s ease',
      }}>
        <MapPin size={50} style={{ color: '#ef4444' }} />
      </div>

      {/* Main Content */}
      <div style={{
        textAlign: 'center',
        maxWidth: '550px',
        width: '100%',
        position: 'relative',
        zIndex: 1,
      }}>
        
        {/* 404 Number */}
        <div 
          className="animate-scale-in"
          style={{
            fontSize: 'clamp(7rem, 15vw, 10rem)',
            fontWeight: 900,
            color: accentColor,
            lineHeight: 1,
            marginBottom: '0',
            letterSpacing: '-3px',
            opacity: 0.1,
            userSelect: 'none',
            position: 'relative',
          }}
        >
          404
          
          {/* Floating Emoji */}
          <span className="animate-bounce-slow" style={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            fontSize: '3rem',
            opacity: 1,
            cursor: 'pointer',
          }}>
            {emojis[currentEmoji]}
          </span>
        </div>

        {/* Title */}
        <h1 className="animate-fade-in-up delay-200" style={{
          fontSize: 'clamp(1.5rem, 3vw, 1.8rem)',
          fontWeight: 700,
          color: textColor,
          marginTop: '-40px',
          marginBottom: '12px',
        }}>
          {t.title}
        </h1>

        {/* Description */}
        <p className="animate-fade-in-up delay-300" style={{
          fontSize: '1rem',
          color: textSecondary,
          marginBottom: '8px',
          lineHeight: 1.7,
          maxWidth: '450px',
          margin: '0 auto 8px',
        }}>
          {t.description}
        </p>

        {/* Funny Message */}
        <p className="animate-fade-in-up delay-300" style={{
          fontSize: '0.9rem',
          color: accentColor,
          marginBottom: '32px',
          fontWeight: 500,
          fontStyle: 'italic',
        }}>
          {randomMessage}
        </p>

        {/* Action Buttons */}
        <div className="animate-fade-in-up delay-400" style={{
          display: 'flex',
          gap: '12px',
          justifyContent: 'center',
          flexWrap: 'wrap',
          marginBottom: '36px',
        }}>
          <Link
            to="/"
            className="hover-lift"
            style={{
              padding: '14px 28px',
              background: 'linear-gradient(135deg, #3b82f6, #2563eb)',
              color: 'white',
              border: 'none',
              borderRadius: '14px',
              fontSize: '0.95rem',
              fontWeight: 700,
              textDecoration: 'none',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px',
              fontFamily: "'Cairo', sans-serif",
              boxShadow: '0 8px 24px rgba(37,99,235,0.3)',
            }}
          >
            <Home size={18} />
            {t.backHome}
          </Link>
          
          <button
            onClick={() => navigate(-1)}
            className="hover-lift"
            style={{
              padding: '14px 28px',
              background: 'transparent',
              color: accentColor,
              border: `2px solid ${accentColor}`,
              borderRadius: '14px',
              fontSize: '0.95rem',
              fontWeight: 700,
              cursor: 'pointer',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px',
              fontFamily: "'Cairo', sans-serif",
              transition: 'all 0.3s ease',
            }}
            onMouseEnter={(e) => {
              e.target.style.background = accentColor;
              e.target.style.color = 'white';
            }}
            onMouseLeave={(e) => {
              e.target.style.background = 'transparent';
              e.target.style.color = accentColor;
            }}
          >
            <ArrowLeft size={18} />
            {t.goBack}
          </button>
          
          <Link
            to="/help"
            className="hover-lift"
            style={{
              padding: '14px 28px',
              background: 'transparent',
              color: textColor,
              border: `2px solid ${borderColor}`,
              borderRadius: '14px',
              fontSize: '0.95rem',
              fontWeight: 700,
              textDecoration: 'none',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px',
              fontFamily: "'Cairo', sans-serif",
              transition: 'all 0.3s ease',
            }}
            onMouseEnter={(e) => {
              e.target.style.borderColor = accentColor;
              e.target.style.color = accentColor;
            }}
            onMouseLeave={(e) => {
              e.target.style.borderColor = borderColor;
              e.target.style.color = textColor;
            }}
          >
            <HelpCircle size={18} />
            {t.getHelp}
          </Link>
        </div>

        {/* Suggestions */}
        <div className="animate-fade-in-up delay-500">
          <p style={{
            fontSize: '0.85rem',
            color: textSecondary,
            marginBottom: '16px',
            fontWeight: 500,
          }}>
            {t.suggestions}
          </p>
          
          <div className="suggestions-grid" style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))',
            gap: '10px',
            maxWidth: '450px',
            margin: '0 auto',
          }}>
            {suggestions.map((suggestion, index) => (
              <Link
                key={index}
                to={suggestion.path}
                className="suggestion-card"
                style={{
                  padding: '12px 16px',
                  borderRadius: '12px',
                  border: `1px solid ${borderColor}`,
                  textDecoration: 'none',
                  color: textColor,
                  fontSize: '0.85rem',
                  fontWeight: 500,
                  fontFamily: "'Cairo', sans-serif",
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px',
                  background: cardBg,
                }}
              >
                {suggestion.icon}
                {suggestion.label}
              </Link>
            ))}
          </div>
        </div>

        {/* Footer Quote */}
        <div className="animate-fade-in-up delay-500" style={{
          marginTop: '40px',
          padding: '16px 20px',
          borderRadius: '12px',
          background: darkMode ? 'rgba(255,255,255,0.02)' : '#f8fafc',
          border: `1px solid ${borderColor}`,
          display: 'inline-block',
        }}>
          <p style={{
            fontSize: '0.85rem',
            color: textSecondary,
            margin: 0,
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
          }}>
            <Wrench size={16} style={{ color: accentColor }} />
            {lang === 'ar' 
              ? 'اطلب صنايعي - دليلك للحرفيين المحترفين'
              : 'Atlob Sanay3y - Your Guide to Professional Craftsmen'
            }
          </p>
        </div>
      </div>
    </div>
  );
};

export default NotFoundPage;