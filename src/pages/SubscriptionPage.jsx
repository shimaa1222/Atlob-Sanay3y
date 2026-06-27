import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTheme } from '../context/ThemeContext';
import { 
  Crown, Zap, Star, Shield, TrendingUp, 
  CheckCircle, X, ArrowRight, Gift,
  HeadphonesIcon, Users, Search, Award,
  Sparkles, Rocket, Diamond, Heart
} from 'lucide-react';

const SubscriptionPage = () => {
  const navigate = useNavigate();
  const { darkMode } = useTheme();
  const [lang, setLang] = useState('ar');
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [showConfirm, setShowConfirm] = useState(false);
  const [confirmed, setConfirmed] = useState(false);
  const [planActivated, setPlanActivated] = useState(false);
  const [activeFeature, setActiveFeature] = useState(null);

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
    heroTitle: lang === 'ar' ? 'باقات الاشتراك' : 'Subscription Plans',
    heroSubtitle: lang === 'ar' ? 'كل الباقات مجانية حالياً - ابدأ بدون أي رسوم' : 'All plans are currently free - Start with no fees',
    free: lang === 'ar' ? 'مجاني' : 'Free',
    egp: lang === 'ar' ? 'ج.م' : 'EGP',
    month: lang === 'ar' ? 'شهر' : 'Month',
    year: lang === 'ar' ? 'سنة' : 'Year',
    monthly: lang === 'ar' ? 'شهري' : 'Monthly',
    yearly: lang === 'ar' ? 'سنوي' : 'Yearly',
    mostPopular: lang === 'ar' ? 'الأكثر شيوعاً' : 'Most Popular',
    bestValue: lang === 'ar' ? 'أفضل قيمة' : 'Best Value',
    activateFree: lang === 'ar' ? 'تفعيل مجاني' : 'Activate Free',
    activateNow: lang === 'ar' ? 'تفعيل الآن' : 'Activate Now',
    cancel: lang === 'ar' ? 'إلغاء' : 'Cancel',
    confirmTitle: lang === 'ar' ? 'تأكيد التفعيل' : 'Confirm Activation',
    confirmText: lang === 'ar' ? 'هل أنت متأكد من تفعيل هذه الباقة؟' : 'Are you sure you want to activate this plan?',
    successTitle: lang === 'ar' ? '🎉 تم تفعيل الاشتراك!' : '🎉 Subscription Activated!',
    successText: lang === 'ar' ? 'تم تفعيل اشتراكك بنجاح. يمكنك الآن الاستمتاع بجميع المميزات.' : 'Your subscription has been activated successfully. You can now enjoy all features.',
    backToDashboard: lang === 'ar' ? 'العودة للوحة التحكم' : 'Back to Dashboard',
    allFeatures: lang === 'ar' ? 'جميع المميزات' : 'All Features',
    whyChoose: lang === 'ar' ? 'لماذا تختار اطلب صنايعي؟' : 'Why Choose Atlob Sanay3y?',
    whyFeatures: lang === 'ar' ? [
      { icon: <Users size={24} />, title: 'آلاف العملاء', desc: 'انضم إلى آلاف العملاء الذين يبحثون عن خدمات يومياً' },
      { icon: <Search size={24} />, title: 'ظهور مميز', desc: 'ظهور ملفك في نتائج البحث الأولى' },
      { icon: <Star size={24} />, title: 'تقييمات موثوقة', desc: 'ابنِ سمعتك من خلال تقييمات حقيقية' },
      { icon: <HeadphonesIcon size={24} />, title: 'دعم متواصل', desc: 'فريق دعم جاهز لمساعدتك على مدار الساعة' },
    ] : [
      { icon: <Users size={24} />, title: 'Thousands of Customers', desc: 'Join thousands of customers looking for services daily' },
      { icon: <Search size={24} />, title: 'Featured Visibility', desc: 'Your profile appears in top search results' },
      { icon: <Star size={24} />, title: 'Trusted Ratings', desc: 'Build your reputation through real ratings' },
      { icon: <HeadphonesIcon size={24} />, title: '24/7 Support', desc: 'Support team ready to help you around the clock' },
    ],
  };

  const plans = [
    { 
      id: 'monthly', 
      name: t.monthly, 
      duration: t.month, 
      originalPrice: 99, 
      price: 0, 
      featured: true, 
      badge: t.mostPopular,
      icon: <Crown size={28} />,
      color: '#7c3aed',
      gradient: 'linear-gradient(135deg, #7c3aed, #6d28d9)',
      features: [
        { icon: <CheckCircle size={16} />, text: lang === 'ar' ? 'ملف شخصي احترافي' : 'Professional Profile' },
        { icon: <CheckCircle size={16} />, text: lang === 'ar' ? 'استقبال طلبات غير محدودة' : 'Unlimited Requests' },
        { icon: <CheckCircle size={16} />, text: lang === 'ar' ? 'ظهور في نتائج البحث' : 'Search Results Visibility' },
        { icon: <CheckCircle size={16} />, text: lang === 'ar' ? 'تقييمات ومراجعات' : 'Ratings & Reviews' },
        { icon: <CheckCircle size={16} />, text: lang === 'ar' ? 'دعم فني مباشر' : 'Direct Technical Support' },
      ]
    },
    { 
      id: 'yearly', 
      name: t.yearly, 
      duration: t.year, 
      originalPrice: 999, 
      price: 0, 
      featured: false, 
      badge: t.bestValue,
      icon: <Diamond size={28} />,
      color: '#f59e0b',
      gradient: 'linear-gradient(135deg, #f59e0b, #d97706)',
      features: [
        { icon: <CheckCircle size={16} />, text: lang === 'ar' ? 'كل مميزات الباقة الشهرية' : 'All Monthly Features' },
        { icon: <CheckCircle size={16} />, text: lang === 'ar' ? 'أولوية في نتائج البحث' : 'Priority in Search Results' },
        { icon: <CheckCircle size={16} />, text: lang === 'ar' ? 'شارة حرفي موثوق' : 'Trusted Craftsman Badge' },
        { icon: <CheckCircle size={16} />, text: lang === 'ar' ? 'إحصائيات متقدمة' : 'Advanced Statistics' },
        { icon: <CheckCircle size={16} />, text: lang === 'ar' ? 'دعم VIP مميز' : 'Premium VIP Support' },
      ]
    }
  ];

  const handleSelect = (plan) => {
    setSelectedPlan(plan);
    setShowConfirm(true);
  };

  const handleConfirm = () => {
    setShowConfirm(false);
    setConfirmed(true);
    localStorage.setItem('subscription', JSON.stringify({ 
      plan: selectedPlan.id, 
      date: new Date().toISOString() 
    }));
    
    setTimeout(() => {
      setPlanActivated(true);
    }, 1500);
  };

  // Dynamic colors
  const bgColor = darkMode ? '#0f172a' : '#f8fafc';
  const cardBg = darkMode ? '#1e293b' : '#ffffff';
  const textColor = darkMode ? '#f1f5f9' : '#0f172a';
  const textSecondary = darkMode ? '#94a3b8' : '#64748b';
  const borderColor = darkMode ? '#334155' : '#e2e8f0';

  // Success State
  if (planActivated) {
    return (
      <div style={{
        background: bgColor,
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontFamily: "'Cairo', sans-serif",
        padding: '24px',
      }}>
        <style>{`
          @keyframes successPulse {
            0%, 100% { transform: scale(1); }
            50% { transform: scale(1.05); }
          }
          @keyframes confetti {
            0% { transform: translateY(0) rotate(0); opacity: 1; }
            100% { transform: translateY(-100vh) rotate(720deg); opacity: 0; }
          }
          @keyframes slideUp {
            from { opacity: 0; transform: translateY(30px); }
            to { opacity: 1; transform: translateY(0); }
          }
        `}</style>
        
        <div style={{
          background: cardBg,
          borderRadius: '24px',
          padding: '48px 36px',
          maxWidth: '500px',
          width: '100%',
          textAlign: 'center',
          border: `1px solid ${borderColor}`,
          boxShadow: '0 20px 60px rgba(0,0,0,0.15)',
          animation: 'slideUp 0.6s ease forwards',
          position: 'relative',
          overflow: 'hidden',
        }}>
          {/* Decorative circles */}
          <div style={{
            position: 'absolute',
            top: -30,
            right: -30,
            width: '100px',
            height: '100px',
            borderRadius: '50%',
            background: 'rgba(5,150,105,0.1)',
          }} />
          <div style={{
            position: 'absolute',
            bottom: -20,
            left: -20,
            width: '80px',
            height: '80px',
            borderRadius: '50%',
            background: 'rgba(5,150,105,0.05)',
          }} />
          
          <div style={{ position: 'relative', zIndex: 1 }}>
            <div style={{
              width: '80px',
              height: '80px',
              borderRadius: '50%',
              background: 'linear-gradient(135deg, #059669, #10b981)',
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: '24px',
              animation: 'successPulse 2s ease-in-out infinite',
              boxShadow: '0 8px 24px rgba(5,150,105,0.3)',
            }}>
              <CheckCircle size={40} color="white" />
            </div>
            
            <h1 style={{
              fontSize: '1.75rem',
              fontWeight: 800,
              color: '#059669',
              marginBottom: '12px',
            }}>
              {t.successTitle}
            </h1>
            
            <p style={{
              color: textSecondary,
              marginBottom: '8px',
              fontSize: '1.1rem',
              lineHeight: 1.6,
            }}>
              {t.successText}
            </p>
            
            <div style={{
              background: darkMode ? 'rgba(5,150,105,0.1)' : '#d1fae5',
              borderRadius: '12px',
              padding: '16px',
              marginTop: '20px',
              marginBottom: '28px',
            }}>
              <p style={{
                color: '#059669',
                fontWeight: 700,
                fontSize: '1.1rem',
                margin: 0,
              }}>
                {selectedPlan?.name} - {selectedPlan?.duration}
              </p>
              <p style={{
                color: '#059669',
                fontWeight: 800,
                fontSize: '2rem',
                margin: '4px 0 0',
              }}>
                {t.free}
              </p>
            </div>
            
            <button 
              onClick={() => navigate('/craftsman/home')}
              style={{
                padding: '14px 36px',
                background: 'linear-gradient(135deg, #3b82f6, #2563eb)',
                color: 'white',
                border: 'none',
                borderRadius: '12px',
                fontWeight: 700,
                fontSize: '1rem',
                cursor: 'pointer',
                fontFamily: "'Cairo', sans-serif",
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                boxShadow: '0 4px 16px rgba(59,130,246,0.3)',
                transition: 'all 0.3s ease',
              }}
              onMouseEnter={(e) => {
                e.target.style.transform = 'translateY(-2px)';
                e.target.style.boxShadow = '0 6px 20px rgba(59,130,246,0.4)';
              }}
              onMouseLeave={(e) => {
                e.target.style.transform = 'translateY(0)';
                e.target.style.boxShadow = '0 4px 16px rgba(59,130,246,0.3)';
              }}
            >
              <ArrowRight size={20} />
              {t.backToDashboard}
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={{ background: bgColor, minHeight: '100vh', fontFamily: "'Cairo', sans-serif" }}>
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
          from { opacity: 0; transform: scale(0.9); }
          to { opacity: 1; transform: scale(1); }
        }
        
        @keyframes float {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-10px); }
        }
        
        @keyframes shimmer {
          0% { background-position: -200% 0; }
          100% { background-position: 200% 0; }
        }
        
        @keyframes gradientShift {
          0% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }
        
        @keyframes pulse {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.05); }
        }
        
        .animate-fade-in-up {
          animation: fadeInUp 0.6s ease forwards;
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
        
        .gradient-animate {
          background: linear-gradient(270deg, #7c3aed, #f59e0b, #059669, #3b82f6);
          background-size: 400% 400%;
          animation: gradientShift 6s ease infinite;
        }
        
        .delay-100 { animation-delay: 0.1s; }
        .delay-200 { animation-delay: 0.2s; }
        .delay-300 { animation-delay: 0.3s; }
        .delay-400 { animation-delay: 0.4s; }
        .delay-500 { animation-delay: 0.5s; }
        
        .hover-scale {
          transition: all 0.3s ease;
        }
        
        .hover-scale:hover {
          transform: translateY(-8px);
          box-shadow: 0 20px 40px rgba(0,0,0,0.15);
        }
        
        .featured-card {
          transform: scale(1.05);
          box-shadow: 0 20px 40px rgba(124,58,237,0.3);
        }
        
        @media (max-width: 768px) {
          .featured-card {
            transform: scale(1);
          }
          .hero-title {
            font-size: 2rem !important;
          }
        }
      `}</style>

      {/* Hero Section */}
      <div style={{
        background: darkMode 
          ? 'linear-gradient(160deg, #1e1b4b 0%, #312e81 50%, #1e1b4b 100%)'
          : 'linear-gradient(160deg, #7c3aed 0%, #6d28d9 50%, #5b21b6 100%)',
        color: 'white',
        padding: '80px 0 60px',
        textAlign: 'center',
        position: 'relative',
        overflow: 'hidden',
      }}>
        {/* Floating sparkles */}
        {[...Array(5)].map((_, i) => (
          <div key={i} style={{
            position: 'absolute',
            width: '6px',
            height: '6px',
            borderRadius: '50%',
            background: 'rgba(255,255,255,0.6)',
            top: `${20 + Math.random() * 60}%`,
            left: `${10 + Math.random() * 80}%`,
            animation: `float ${3 + Math.random() * 3}s ease-in-out infinite ${Math.random() * 2}s`,
          }} />
        ))}
        
        <div style={{
          maxWidth: '700px',
          margin: '0 auto',
          padding: '0 24px',
          position: 'relative',
          zIndex: 1,
        }}>
          <div className="animate-fade-in-up" style={{ marginBottom: '20px' }}>
            <div style={{
              width: '80px',
              height: '80px',
              borderRadius: '20px',
              background: 'rgba(255,255,255,0.15)',
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              backdropFilter: 'blur(10px)',
              border: '2px solid rgba(255,255,255,0.2)',
            }}>
              <Crown size={40} />
            </div>
          </div>
          
          <h1 className="animate-fade-in-up delay-200" style={{
            fontSize: '2.75rem',
            fontWeight: 800,
            marginBottom: '16px',
            letterSpacing: '-0.5px',
          }}>
            {t.heroTitle}
          </h1>
          
          <p className="animate-fade-in-up delay-300" style={{
            fontSize: '1.2rem',
            opacity: 0.9,
            lineHeight: 1.6,
          }}>
            {t.heroSubtitle}
          </p>
        </div>
        
        {/* Wave bottom */}
        <div style={{
          position: 'absolute',
          bottom: 0,
          left: 0,
          right: 0,
          height: '40px',
          background: bgColor,
          borderRadius: '50% 50% 0 0',
          transform: 'scaleX(1.5)',
        }} />
      </div>

      {/* Plans Section */}
      <div style={{
        maxWidth: '1100px',
        margin: '0 auto',
        padding: '60px 24px',
      }}>
        
        {/* Plans Grid */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))',
          gap: '30px',
          justifyContent: 'center',
          marginBottom: '64px',
        }}>
          {plans.map((plan, index) => (
            <div 
              key={plan.id}
              className={`animate-fade-in-up delay-${(index + 1) * 200} hover-scale ${plan.featured ? 'featured-card' : ''}`}
              style={{
                background: cardBg,
                borderRadius: '20px',
                padding: '40px 32px',
                border: plan.featured ? `2px solid ${plan.color}` : `1px solid ${borderColor}`,
                position: 'relative',
                textAlign: 'center',
                transition: 'all 0.3s ease',
              }}
            >
              {/* Badge */}
              {plan.badge && (
                <div style={{
                  position: 'absolute',
                  top: '-16px',
                  left: '50%',
                  transform: 'translateX(-50%)',
                  background: plan.gradient,
                  color: 'white',
                  padding: '8px 24px',
                  borderRadius: '20px',
                  fontWeight: 700,
                  fontSize: '0.85rem',
                  whiteSpace: 'nowrap',
                  boxShadow: `0 4px 12px ${plan.color}40`,
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                }}>
                  <Sparkles size={14} />
                  {plan.badge}
                </div>
              )}
              
              {/* Icon */}
              <div style={{
                width: '72px',
                height: '72px',
                borderRadius: '18px',
                background: `${plan.color}15`,
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: plan.color,
                marginBottom: '20px',
                marginTop: plan.badge ? '8px' : '0',
              }}>
                {plan.icon}
              </div>
              
              {/* Plan Name */}
              <h2 style={{
                fontSize: '1.5rem',
                fontWeight: 700,
                color: textColor,
                marginBottom: '16px',
              }}>
                {plan.name}
              </h2>
              
              {/* Original Price */}
              <div style={{
                textDecoration: 'line-through',
                color: textSecondary,
                fontSize: '1.2rem',
                marginBottom: '8px',
                opacity: 0.7,
              }}>
                {plan.originalPrice} {t.egp}
              </div>
              
              {/* Current Price */}
              <div style={{
                fontSize: '3rem',
                fontWeight: 800,
                color: '#059669',
                marginBottom: '4px',
                lineHeight: 1,
              }}>
                {t.free}
              </div>
              
              {/* Duration */}
              <div style={{
                fontSize: '0.95rem',
                color: textSecondary,
                marginBottom: '28px',
              }}>
                / {plan.duration}
              </div>
              
              {/* Features */}
              <div style={{
                textAlign: lang === 'ar' ? 'right' : 'left',
                marginBottom: '28px',
              }}>
                {plan.features.map((feature, i) => (
                  <div 
                    key={i}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '10px',
                      padding: '10px 0',
                      borderBottom: `1px solid ${borderColor}`,
                      fontSize: '0.9rem',
                      color: textSecondary,
                      transition: 'all 0.3s ease',
                    }}
                    onMouseEnter={(e) => {
                      e.target.style.color = plan.color;
                      e.target.style.paddingRight = '8px';
                    }}
                    onMouseLeave={(e) => {
                      e.target.style.color = textSecondary;
                      e.target.style.paddingRight = '0';
                    }}
                  >
                    <span style={{ color: '#059669', flexShrink: 0 }}>
                      {feature.icon}
                    </span>
                    <span>{feature.text}</span>
                  </div>
                ))}
              </div>
              
              {/* CTA Button */}
              <button 
                onClick={() => handleSelect(plan)}
                style={{
                  width: '100%',
                  padding: '16px',
                  background: plan.featured ? plan.gradient : 'linear-gradient(135deg, #3b82f6, #2563eb)',
                  color: 'white',
                  border: 'none',
                  borderRadius: '14px',
                  fontWeight: 700,
                  fontSize: '1.05rem',
                  cursor: 'pointer',
                  fontFamily: "'Cairo', sans-serif",
                  transition: 'all 0.3s ease',
                  boxShadow: plan.featured 
                    ? `0 8px 24px ${plan.color}40`
                    : '0 4px 12px rgba(59,130,246,0.3)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px',
                }}
                onMouseEnter={(e) => {
                  e.target.style.transform = 'translateY(-2px)';
                  e.target.style.boxShadow = plan.featured 
                    ? `0 12px 28px ${plan.color}60`
                    : '0 8px 20px rgba(59,130,246,0.4)';
                }}
                onMouseLeave={(e) => {
                  e.target.style.transform = 'translateY(0)';
                  e.target.style.boxShadow = plan.featured 
                    ? `0 8px 24px ${plan.color}40`
                    : '0 4px 12px rgba(59,130,246,0.3)';
                }}
              >
                <Rocket size={18} />
                {t.activateFree}
              </button>
            </div>
          ))}
        </div>

        {/* Why Choose Us */}
        <div className="animate-fade-in-up delay-300">
          <h2 style={{
            fontSize: '2rem',
            fontWeight: 700,
            color: textColor,
            textAlign: 'center',
            marginBottom: '40px',
          }}>
            {t.whyChoose}
          </h2>
          
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
            gap: '20px',
          }}>
            {t.whyFeatures.map((feature, index) => (
              <div 
                key={index}
                className="hover-scale"
                style={{
                  background: cardBg,
                  borderRadius: '16px',
                  padding: '28px',
                  border: `1px solid ${borderColor}`,
                  textAlign: 'center',
                  transition: 'all 0.3s ease',
                }}
              >
                <div style={{
                  width: '56px',
                  height: '56px',
                  borderRadius: '14px',
                  background: 'rgba(59,130,246,0.1)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  margin: '0 auto 16px',
                  color: '#3b82f6',
                }}>
                  {feature.icon}
                </div>
                <h3 style={{
                  fontSize: '1.1rem',
                  fontWeight: 600,
                  color: textColor,
                  marginBottom: '8px',
                }}>
                  {feature.title}
                </h3>
                <p style={{
                  fontSize: '0.9rem',
                  color: textSecondary,
                  lineHeight: 1.6,
                }}>
                  {feature.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Confirmation Modal */}
      {showConfirm && selectedPlan && (
        <div 
          onClick={() => setShowConfirm(false)}
          style={{
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
            padding: '20px',
            backdropFilter: 'blur(4px)',
            animation: 'fadeIn 0.3s ease',
          }}
        >
          <div 
            onClick={(e) => e.stopPropagation()}
            className="animate-scale-in"
            style={{
              background: cardBg,
              borderRadius: '20px',
              padding: '40px 32px',
              maxWidth: '440px',
              width: '100%',
              textAlign: 'center',
              border: `1px solid ${borderColor}`,
              boxShadow: '0 20px 60px rgba(0,0,0,0.3)',
            }}
          >
            <div style={{
              width: '64px',
              height: '64px',
              borderRadius: '16px',
              background: 'rgba(124,58,237,0.1)',
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#7c3aed',
              marginBottom: '20px',
            }}>
              {selectedPlan.icon}
            </div>
            
            <h2 style={{
              fontSize: '1.5rem',
              fontWeight: 700,
              color: textColor,
              marginBottom: '12px',
            }}>
              {t.confirmTitle}
            </h2>
            
            <p style={{
              color: textSecondary,
              marginBottom: '16px',
              fontSize: '1rem',
            }}>
              {t.confirmText}
            </p>
            
            <div style={{
              background: darkMode ? 'rgba(5,150,105,0.1)' : '#d1fae5',
              borderRadius: '12px',
              padding: '16px',
              marginBottom: '24px',
            }}>
              <p style={{
                color: textColor,
                fontWeight: 600,
                margin: '0 0 4px',
              }}>
                {selectedPlan.name} - {selectedPlan.duration}
              </p>
              <p style={{
                color: '#059669',
                fontWeight: 800,
                fontSize: '1.75rem',
                margin: 0,
              }}>
                {t.free}
              </p>
            </div>
            
            <div style={{
              display: 'flex',
              gap: '12px',
              justifyContent: 'center',
            }}>
              <button 
                onClick={handleConfirm}
                style={{
                  padding: '12px 28px',
                  background: 'linear-gradient(135deg, #059669, #10b981)',
                  color: 'white',
                  border: 'none',
                  borderRadius: '12px',
                  fontWeight: 700,
                  fontSize: '0.95rem',
                  cursor: 'pointer',
                  fontFamily: "'Cairo', sans-serif",
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  transition: 'all 0.3s ease',
                  boxShadow: '0 4px 12px rgba(5,150,105,0.3)',
                }}
                onMouseEnter={(e) => {
                  e.target.style.transform = 'translateY(-2px)';
                }}
                onMouseLeave={(e) => {
                  e.target.style.transform = 'translateY(0)';
                }}
              >
                <CheckCircle size={18} />
                {t.activateNow}
              </button>
              
              <button 
                onClick={() => setShowConfirm(false)}
                style={{
                  padding: '12px 28px',
                  background: darkMode ? '#334155' : '#e2e8f0',
                  color: textColor,
                  border: 'none',
                  borderRadius: '12px',
                  fontWeight: 600,
                  fontSize: '0.95rem',
                  cursor: 'pointer',
                  fontFamily: "'Cairo', sans-serif",
                  transition: 'all 0.3s ease',
                }}
                onMouseEnter={(e) => {
                  e.target.style.opacity = '0.8';
                }}
                onMouseLeave={(e) => {
                  e.target.style.opacity = '1';
                }}
              >
                {t.cancel}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SubscriptionPage;