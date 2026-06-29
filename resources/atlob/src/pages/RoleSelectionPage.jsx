import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom'; // ✅ إضافة useNavigate
import { useTheme } from '../context/ThemeContext';
import { 
  User, Wrench, Sparkles, Star, Shield, Zap,
  Search, Calendar, MessageCircle, TrendingUp,
  Award, CheckCircle, ArrowRight, ChevronRight,
  Users, Clock, ThumbsUp, Heart, Globe, ArrowLeft // ✅ إضافة ArrowLeft
} from 'lucide-react';

const RoleSelectionPage = () => {
  const { darkMode } = useTheme();
  const navigate = useNavigate(); // ✅ استخدام useNavigate
  const [lang, setLang] = useState('ar');
  const [hoveredCard, setHoveredCard] = useState(null);

  // ✅ دالة الرجوع للصفحة السابقة
  const handleGoBack = () => {
    navigate(-1);
  };

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

  // Translations
  const t = {
    title: lang === 'ar' ? 'اختر نوع الحساب' : 'Choose Account Type',
    subtitle: lang === 'ar' ? 'اختر نوع الحساب المناسب لك وابدأ رحلتك مع اطلب صنايعي' : 'Choose the right account type and start your journey with Atlob Sanay3y',
    customer: lang === 'ar' ? 'عميل' : 'Customer',
    customerDesc: lang === 'ar' ? 'ابحث عن حرفيين واحجز خدمات منزلية بسهولة وأمان' : 'Find craftsmen and book home services easily and safely',
    craftsman: lang === 'ar' ? 'حرفي' : 'Craftsman',
    craftsmanDesc: lang === 'ar' ? 'اعرض خدماتك واحصل على عملاء جدد ووسع نشاطك' : 'Showcase your services, get new clients and expand your business',
    customerFeatures: lang === 'ar' ? [
      'بحث ذكي عن حرفيين',
      'حجز مواعيد سهل',
      'تقييم ومراجعة',
      'دعم فوري ومباشر',
    ] : [
      'Smart craftsman search',
      'Easy appointment booking',
      'Ratings & reviews',
      'Direct instant support',
    ],
    craftsmanFeatures: lang === 'ar' ? [
      'ملف شخصي احترافي',
      'استقبال طلبات مباشرة',
      'معرض أعمال ومشاريع',
      'إحصائيات متقدمة',
    ] : [
      'Professional profile',
      'Direct request reception',
      'Portfolio & projects',
      'Advanced statistics',
    ],
    createCustomer: lang === 'ar' ? 'إنشاء حساب عميل' : 'Create Customer Account',
    createCraftsman: lang === 'ar' ? 'إنشاء حساب حرفي' : 'Create Craftsman Account',
    haveAccount: lang === 'ar' ? 'لديك حساب بالفعل؟' : 'Already have an account?',
    login: lang === 'ar' ? 'تسجيل الدخول' : 'Login',
    trusted: lang === 'ar' ? 'منصة موثوقة' : 'Trusted Platform',
    whyUs: lang === 'ar' ? 'لماذا تختارنا؟' : 'Why Choose Us?',
    back: lang === 'ar' ? 'رجوع' : 'Back',
    whyFeatures: lang === 'ar' ? [
      { icon: <Shield size={20} />, text: 'حرفيون موثقون ومعتمدون' },
      { icon: <Star size={20} />, text: 'تقييمات حقيقية من عملاء' },
      { icon: <Clock size={20} />, text: 'حجز فوري وسريع' },
      { icon: <MessageCircle size={20} />, text: 'تواصل مباشر مع الحرفي' },
    ] : [
      { icon: <Shield size={20} />, text: 'Verified & Certified Craftsmen' },
      { icon: <Star size={20} />, text: 'Real Customer Reviews' },
      { icon: <Clock size={20} />, text: 'Instant & Fast Booking' },
      { icon: <MessageCircle size={20} />, text: 'Direct Contact with Craftsman' },
    ],
  };

  const cards = [
    {
      path: '/signup/customer',
      title: t.customer,
      description: t.customerDesc,
      icon: <User size={36} color="white" />,
      gradient: 'linear-gradient(135deg, #3b82f6, #2563eb)',
      bgLight: '#eff6ff',
      color: '#2563eb',
      shadow: '0 12px 30px rgba(37,99,235,0.3)',
      features: t.customerFeatures,
    },
    {
      path: '/signup/craftsman',
      title: t.craftsman,
      description: t.craftsmanDesc,
      icon: <Wrench size={36} color="white" />,
      gradient: 'linear-gradient(135deg, #f59e0b, #d97706)',
      bgLight: '#fffbeb',
      color: '#d97706',
      shadow: '0 12px 30px rgba(217,119,6,0.3)',
      features: t.craftsmanFeatures,
    },
  ];

  // Dynamic colors
  const bgColor = darkMode ? '#0f172a' : '#f8fafc';
  const cardBg = darkMode ? '#1e293b' : '#ffffff';
  const textColor = darkMode ? '#f1f5f9' : '#0f172a';
  const textSecondary = darkMode ? '#94a3b8' : '#64748b';
  const borderColor = darkMode ? '#334155' : '#e2e8f0';
  const logoBg = darkMode 
    ? 'linear-gradient(135deg, #3b82f6, #1d4ed8)'
    : 'linear-gradient(135deg, #3b82f6, #1d4ed8)';

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: bgColor,
      padding: '40px 20px',
      fontFamily: "'Cairo', sans-serif",
    }}>
      <style>{`
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(30px); }
          to { opacity: 1; transform: translateY(0); }
        }
        
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        
        @keyframes scaleIn {
          from { opacity: 0; transform: scale(0.8); }
          to { opacity: 1; transform: scale(1); }
        }
        
        @keyframes float {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-10px); }
        }
        
        @keyframes pulse {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.05); }
        }
        
        @keyframes shimmer {
          0% { background-position: -200% 0; }
          100% { background-position: 200% 0; }
        }
        
        @keyframes slideRight {
          from { opacity: 0; transform: translateX(-30px); }
          to { opacity: 1; transform: translateX(0); }
        }
        
        @keyframes slideLeft {
          from { opacity: 0; transform: translateX(30px); }
          to { opacity: 1; transform: translateX(0); }
        }
        
        .animate-fade-up {
          animation: fadeUp 0.6s ease forwards;
        }
        
        .animate-scale-in {
          animation: scaleIn 0.5s ease forwards;
        }
        
        .animate-float {
          animation: float 3s ease-in-out infinite;
        }
        
        .animate-pulse-slow {
          animation: pulse 3s ease-in-out infinite;
        }
        
        .card-hover {
          transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
        }
        
        .card-hover:hover {
          transform: translateY(-12px);
        }
        
        .card-hover:hover .card-icon {
          transform: scale(1.1) rotate(5deg);
        }
        
        .card-icon {
          transition: all 0.4s ease;
        }
        
        .feature-item {
          transition: all 0.3s ease;
        }
        
        .feature-item:hover {
          transform: translateX(-4px);
        }
        
        .delay-100 { animation-delay: 0.1s; }
        .delay-200 { animation-delay: 0.2s; }
        .delay-300 { animation-delay: 0.3s; }
        .delay-400 { animation-delay: 0.4s; }
        .delay-500 { animation-delay: 0.5s; }
        
        /* ✅ زر الرجوع */
        .back-btn {
          transition: all 0.3s ease;
          position: fixed;
          top: 20px;
          right: 20px;
          z-index: 10;
        }
        .back-btn:hover {
          transform: translateX(-4px);
        }
        
        @media (max-width: 768px) {
          .cards-grid {
            grid-template-columns: 1fr !important;
            max-width: 400px !important;
            margin: 0 auto !important;
          }
          .hero-title {
            font-size: 1.75rem !important;
          }
          .why-grid {
            grid-template-columns: 1fr 1fr !important;
          }
          .back-btn {
            top: 12px;
            right: 12px;
            padding: 6px 10px !important;
            font-size: 0.7rem !important;
          }
        }
        
        @media (max-width: 480px) {
          .why-grid {
            grid-template-columns: 1fr !important;
          }
          .back-btn {
            top: 8px;
            right: 8px;
            padding: 4px 8px !important;
            font-size: 0.65rem !important;
          }
          .back-btn svg {
            width: 14px !important;
            height: 14px !important;
          }
        }
      `}</style>

      {/* ✅ زر الرجوع */}
      <button 
        onClick={handleGoBack} 
        className="back-btn"
        style={{
          padding: '10px 16px',
          borderRadius: '12px',
          border: `1px solid ${borderColor}`,
          background: cardBg,
          cursor: 'pointer',
          color: textColor,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '6px',
          transition: 'all 0.3s ease',
          fontFamily: "'Cairo', sans-serif",
          fontSize: '0.85rem',
          fontWeight: 600,
          boxShadow: darkMode ? '0 4px 16px rgba(0,0,0,0.3)' : '0 4px 16px rgba(0,0,0,0.08)',
        }}
      >
        <ArrowLeft size={18} />
        {t.back}
      </button>

      <div style={{ maxWidth: '1000px', width: '100%', textAlign: 'center' }}>
        
        {/* Logo & Header */}
        <div className="animate-scale-in" style={{ marginBottom: '16px' }}>
          <div style={{
            width: '72px',
            height: '72px',
            borderRadius: '20px',
            background: logoBg,
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 16px 40px rgba(37,99,235,0.3)',
            position: 'relative',
          }}>
            <Sparkles size={32} color="white" />
            
            {/* Floating badge */}
            <div className="animate-float" style={{
              position: 'absolute',
              top: '-8px',
              right: '-8px',
              width: '28px',
              height: '28px',
              borderRadius: '50%',
              background: '#f59e0b',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 4px 12px rgba(245,158,11,0.4)',
            }}>
              <Star size={14} color="white" fill="white" />
            </div>
          </div>
        </div>

        {/* Title */}
        <h1 className="animate-fade-up delay-100" style={{
          fontSize: '2.2rem',
          fontWeight: 800,
          color: textColor,
          marginBottom: '8px',
          marginTop: '20px',
        }}>
          {t.title}
        </h1>
        <p className="animate-fade-up delay-200" style={{
          color: textSecondary,
          fontSize: '1.05rem',
          marginBottom: '48px',
          maxWidth: '500px',
          margin: '0 auto 48px',
          lineHeight: 1.6,
        }}>
          {t.subtitle}
        </p>

        {/* Cards */}
        <div className="cards-grid" style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
          gap: '28px',
          justifyContent: 'center',
          marginBottom: '40px',
        }}>
          {cards.map((card, index) => (
            <Link
              key={index}
              to={card.path}
              className="card-hover"
              style={{
                background: cardBg,
                borderRadius: '24px',
                padding: '40px 30px',
                textAlign: 'center',
                textDecoration: 'none',
                border: `2px solid ${borderColor}`,
                opacity: 0,
                animation: `fadeUp 0.6s ease ${index * 0.2 + 0.3}s forwards`,
                cursor: 'pointer',
                position: 'relative',
                overflow: 'hidden',
              }}
              onMouseEnter={() => setHoveredCard(index)}
              onMouseLeave={() => setHoveredCard(null)}
            >
              {/* Top gradient line */}
              <div style={{
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                height: '4px',
                background: card.gradient,
                opacity: hoveredCard === index ? 1 : 0,
                transition: 'opacity 0.3s ease',
              }} />

              {/* Icon */}
              <div 
                className="card-icon"
                style={{
                  width: '88px',
                  height: '88px',
                  borderRadius: '22px',
                  background: card.gradient,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  margin: '0 auto 24px',
                  boxShadow: hoveredCard === index ? card.shadow : '0 8px 20px rgba(0,0,0,0.1)',
                  transition: 'all 0.4s ease',
                }}
              >
                {card.icon}
              </div>

              {/* Title */}
              <h2 style={{
                fontSize: '1.6rem',
                fontWeight: 800,
                color: textColor,
                marginBottom: '10px',
              }}>
                {card.title}
              </h2>
              <p style={{
                color: textSecondary,
                fontSize: '0.95rem',
                marginBottom: '28px',
                lineHeight: 1.7,
                minHeight: '50px',
              }}>
                {card.description}
              </p>

              {/* Features */}
              <div style={{
                textAlign: lang === 'ar' ? 'right' : 'left',
                marginBottom: '28px',
                padding: '16px 20px',
                borderRadius: '14px',
                background: darkMode ? '#0f172a' : '#f8fafc',
              }}>
                {card.features.map((feature, i) => (
                  <div 
                    key={i} 
                    className="feature-item"
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '12px',
                      padding: '10px 0',
                      color: textSecondary,
                      fontSize: '0.9rem',
                      borderBottom: i < card.features.length - 1 ? `1px solid ${borderColor}` : 'none',
                    }}
                  >
                    <div style={{
                      width: '24px',
                      height: '24px',
                      borderRadius: '7px',
                      background: card.bgLight,
                      color: card.color,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '0.7rem',
                      fontWeight: 700,
                      flexShrink: 0,
                    }}>
                      <CheckCircle size={14} />
                    </div>
                    {feature}
                  </div>
                ))}
              </div>

              {/* Button */}
              <div style={{
                padding: '16px',
                borderRadius: '14px',
                background: card.gradient,
                color: 'white',
                fontWeight: 700,
                fontSize: '1.05rem',
                boxShadow: hoveredCard === index ? card.shadow : '0 4px 12px rgba(0,0,0,0.1)',
                transition: 'all 0.4s ease',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
              }}>
                {index === 0 ? t.createCustomer : t.createCraftsman}
                <ArrowRight size={18} />
              </div>
            </Link>
          ))}
        </div>

        {/* Why Choose Us */}
        <div className="animate-fade-up delay-500" style={{
          marginBottom: '40px',
        }}>
          <h3 style={{
            fontSize: '1.1rem',
            fontWeight: 700,
            color: textColor,
            marginBottom: '20px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '8px',
          }}>
            <Award size={20} style={{ color: '#f59e0b' }} />
            {t.whyUs}
          </h3>
          <div className="why-grid" style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
            gap: '12px',
            maxWidth: '700px',
            margin: '0 auto',
          }}>
            {t.whyFeatures.map((feature, index) => (
              <div key={index} style={{
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
                padding: '12px 16px',
                borderRadius: '12px',
                background: darkMode ? 'rgba(255,255,255,0.03)' : '#f8fafc',
                border: `1px solid ${borderColor}`,
                fontSize: '0.85rem',
                color: textSecondary,
                transition: 'all 0.3s ease',
              }}
              onMouseEnter={(e) => {
                e.target.style.borderColor = '#3b82f6';
                e.target.style.transform = 'translateY(-2px)';
              }}
              onMouseLeave={(e) => {
                e.target.style.borderColor = borderColor;
                e.target.style.transform = 'translateY(0)';
              }}
              >
                <span style={{ color: '#3b82f6', flexShrink: 0 }}>
                  {feature.icon}
                </span>
                {feature.text}
              </div>
            ))}
          </div>
        </div>

        {/* Footer */}
        <p className="animate-fade-up delay-500" style={{
          color: textSecondary,
          fontSize: '0.95rem',
        }}>
          {t.haveAccount}{' '}
          <Link 
            to="/login" 
            style={{
              color: '#3b82f6',
              fontWeight: 700,
              textDecoration: 'none',
              transition: 'all 0.3s ease',
            }}
            onMouseEnter={(e) => { e.target.style.textDecoration = 'underline'; }}
            onMouseLeave={(e) => { e.target.style.textDecoration = 'none'; }}
          >
            {t.login}
          </Link>
        </p>
      </div>
    </div>
  );
};

export default RoleSelectionPage;