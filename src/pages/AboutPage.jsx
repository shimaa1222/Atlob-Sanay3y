import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { useTheme } from '../context/ThemeContext';
import { 
  Wrench, Shield, Zap, Award, Users, Star, 
  CheckCircle, TrendingUp, Heart, Target, Eye,
  ArrowRight, Play, Pause
} from 'lucide-react';

const AboutPage = () => {
  const { darkMode } = useTheme();
  const [lang, setLang] = useState('ar');
  const [animatedStats, setAnimatedStats] = useState(false);
  const [counts, setCounts] = useState({ craftsmen: 0, services: 0, customers: 0, rating: 0 });
  const statsRef = useRef(null);

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

  // Stats animation on scroll
  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !animatedStats) {
          setAnimatedStats(true);
          animateNumbers();
        }
      },
      { threshold: 0.3 }
    );

    if (statsRef.current) {
      observer.observe(statsRef.current);
    }

    return () => {
      if (statsRef.current) {
        observer.unobserve(statsRef.current);
      }
    };
  }, [animatedStats]);

  const animateNumbers = () => {
    const duration = 2000;
    const steps = 60;
    const interval = duration / steps;
    
    let step = 0;
    const timer = setInterval(() => {
      step++;
      const progress = step / steps;
      const easeProgress = 1 - Math.pow(1 - progress, 3); // Ease out
      
      setCounts({
        craftsmen: Math.floor(320 * easeProgress),
        services: Math.floor(1280 * easeProgress),
        customers: Math.floor(1245 * easeProgress),
        rating: (4.7 * easeProgress)
      });
      
      if (step >= steps) {
        clearInterval(timer);
        setCounts({ craftsmen: 320, services: 1280, customers: 1245, rating: 4.7 });
      }
    }, interval);
  };

  // Translations
  const t = {
    heroTitle: lang === 'ar' ? 'عن اطلب صنايعي' : 'About Atlob Sanay3y',
    heroSubtitle: lang === 'ar' ? 'منصتك الأولى لربط العملاء بالحرفيين الموثوقين في جميع التخصصات' : 'Your first platform to connect customers with trusted craftsmen in all specialties',
    ourStory: lang === 'ar' ? 'قصتنا' : 'Our Story',
    storyText: lang === 'ar' ? 'بدأت فكرة اطلب صنايعي من مشكلة يومية يعاني منها ملايين الأشخاص في مصر: صعوبة إيجاد حرفي موثوق وماهر في الوقت المناسب. من هنا جاءت فكرة إنشاء منصة رقمية تربط بين العملاء والحرفيين بشكل سهل وسريع وموثوق.' : 'The idea of Atlob Sanay3y started from a daily problem faced by millions in Egypt: the difficulty of finding a reliable and skilled craftsman at the right time. From here came the idea of creating a digital platform that connects customers with craftsmen easily, quickly and reliably.',
    ourValues: lang === 'ar' ? 'قيمنا' : 'Our Values',
    ourNumbers: lang === 'ar' ? 'أرقامنا' : 'Our Numbers',
    joinUs: lang === 'ar' ? 'انضم إلينا اليوم' : 'Join Us Today',
    joinText: lang === 'ar' ? 'سواء كنت عميلاً تبحث عن حرفي أو حرفياً تريد توسيع أعمالك، منصتنا هي المكان المناسب لك' : 'Whether you are a customer looking for a craftsman or a craftsman wanting to expand your business, our platform is the right place for you',
    startNow: lang === 'ar' ? 'ابدأ الآن' : 'Start Now',
    ourMission: lang === 'ar' ? 'مهمتنا' : 'Our Mission',
    missionText: lang === 'ar' ? 'توفير منصة موثوقة وسهلة الاستخدام تربط بين العملاء والحرفيين المهرة، مع ضمان أعلى معايير الجودة والأمان' : 'Providing a reliable and easy-to-use platform that connects customers with skilled craftsmen, ensuring the highest standards of quality and safety',
    ourVision: lang === 'ar' ? 'رؤيتنا' : 'Our Vision',
    visionText: lang === 'ar' ? 'أن نكون المنصة الأولى في مصر والشرق الأوسط لخدمات الحرفيين المنزلية والتقنية' : 'To be the first platform in Egypt and the Middle East for home and technical craftsmen services',
    craftsmen: lang === 'ar' ? 'حرفي موثق' : 'Verified Craftsmen',
    services: lang === 'ar' ? 'خدمة مكتملة' : 'Completed Services',
    customers: lang === 'ar' ? 'عميل سعيد' : 'Happy Customers',
    rating: lang === 'ar' ? 'تقييم المنصة' : 'Platform Rating',
  };

  const values = [
    { 
      icon: <Shield size={28} />, 
      title: lang === 'ar' ? 'الثقة' : 'Trust', 
      text: lang === 'ar' ? 'نظام تقييمات ومراجعات شفاف يضمن مصداقية الحرفيين وجودة خدماتهم.' : 'Transparent rating and review system ensures credibility of craftsmen and quality of their services.',
      color: '#3b82f6'
    },
    { 
      icon: <Zap size={28} />, 
      title: lang === 'ar' ? 'السرعة' : 'Speed', 
      text: lang === 'ar' ? 'ربط فوري بالحرفي المناسب في منطقتك دون الحاجة للبحث التقليدي المرهق.' : 'Instant connection to the right craftsman in your area without the need for exhausting traditional search.',
      color: '#f59e0b'
    },
    { 
      icon: <Award size={28} />, 
      title: lang === 'ar' ? 'الجودة' : 'Quality', 
      text: lang === 'ar' ? 'نضمن أعلى معايير الجودة في جميع الخدمات المقدمة من خلال حرفيينا المهرة.' : 'We guarantee the highest quality standards in all services provided by our skilled craftsmen.',
      color: '#059669'
    },
    { 
      icon: <Heart size={28} />, 
      title: lang === 'ar' ? 'الاهتمام' : 'Care', 
      text: lang === 'ar' ? 'نهتم بكل تفاصيل تجربتك ونضمن رضاك التام عن الخدمة المقدمة.' : 'We care about every detail of your experience and ensure your complete satisfaction with the service.',
      color: '#dc2626'
    },
  ];

  const stats = [
    { icon: <Users size={24} />, value: counts.craftsmen, suffix: '+', label: t.craftsmen, color: '#3b82f6' },
    { icon: <CheckCircle size={24} />, value: counts.services, suffix: '+', label: t.services, color: '#059669' },
    { icon: <TrendingUp size={24} />, value: counts.customers, suffix: '+', label: t.customers, color: '#f59e0b' },
    { icon: <Star size={24} />, value: counts.rating.toFixed(1), suffix: '', label: t.rating, color: '#8b5cf6' },
  ];

  // Dynamic colors
  const bgColor = darkMode ? '#0f172a' : '#f8fafc';
  const cardBg = darkMode ? '#1e293b' : '#ffffff';
  const textColor = darkMode ? '#f1f5f9' : '#0f172a';
  const textSecondary = darkMode ? '#94a3b8' : '#64748b';
  const borderColor = darkMode ? '#334155' : '#e2e8f0';

  return (
    <div style={{ background: bgColor, minHeight: '100vh', fontFamily: "'Cairo', sans-serif" }}>
      <style>{`
        @keyframes fadeInUp {
          from { opacity: 0; transform: translateY(30px); }
          to { opacity: 1; transform: translateY(0); }
        }
        
        @keyframes fadeInLeft {
          from { opacity: 0; transform: translateX(-30px); }
          to { opacity: 1; transform: translateX(0); }
        }
        
        @keyframes fadeInRight {
          from { opacity: 0; transform: translateX(30px); }
          to { opacity: 1; transform: translateX(0); }
        }
        
        @keyframes scaleIn {
          from { opacity: 0; transform: scale(0.9); }
          to { opacity: 1; transform: scale(1); }
        }
        
        @keyframes shimmer {
          0% { background-position: -200% 0; }
          100% { background-position: 200% 0; }
        }
        
        @keyframes float {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-10px); }
        }
        
        @keyframes pulse {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.05); }
        }
        
        @keyframes gradientShift {
          0% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }
        
        .animate-fade-in-up {
          animation: fadeInUp 0.8s ease forwards;
        }
        
        .animate-fade-in-left {
          animation: fadeInLeft 0.8s ease forwards;
        }
        
        .animate-fade-in-right {
          animation: fadeInRight 0.8s ease forwards;
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
          background: linear-gradient(270deg, #3b82f6, #8b5cf6, #059669, #f59e0b);
          background-size: 400% 400%;
          animation: gradientShift 6s ease infinite;
        }
        
        .delay-100 { animation-delay: 0.1s; }
        .delay-200 { animation-delay: 0.2s; }
        .delay-300 { animation-delay: 0.3s; }
        .delay-400 { animation-delay: 0.4s; }
        .delay-500 { animation-delay: 0.5s; }
        
        .hover-scale {
          transition: transform 0.3s ease, box-shadow 0.3s ease;
        }
        
        .hover-scale:hover {
          transform: translateY(-8px);
          box-shadow: 0 20px 40px rgba(0,0,0,0.15);
        }
        
        .card-gradient {
          position: relative;
          overflow: hidden;
        }
        
        .card-gradient::before {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          height: 4px;
          background: linear-gradient(90deg, #3b82f6, #8b5cf6);
        }
        
        @media (max-width: 768px) {
          .hero-title {
            font-size: 2rem !important;
          }
          .hero-subtitle {
            font-size: 1rem !important;
          }
        }
      `}</style>

      {/* Hero Section */}
      <div style={{
        background: darkMode 
          ? 'linear-gradient(160deg, #0f172a 0%, #1e293b 50%, #0f172a 100%)'
          : 'linear-gradient(160deg, #0f172a 0%, #1e293b 50%, #0f172a 100%)',
        color: 'white',
        padding: '100px 0 80px',
        textAlign: 'center',
        position: 'relative',
        overflow: 'hidden',
      }}>
        {/* Animated background particles */}
        <div style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          opacity: 0.1,
          background: 'radial-gradient(circle at 20% 50%, #3b82f6 0%, transparent 50%), radial-gradient(circle at 80% 50%, #8b5cf6 0%, transparent 50%)',
          animation: 'pulse 4s ease-in-out infinite',
        }} />
        
        <div style={{
          maxWidth: '800px',
          margin: '0 auto',
          padding: '0 24px',
          position: 'relative',
          zIndex: 1,
        }}>
          <div className="animate-fade-in-up" style={{ marginBottom: '24px' }}>
            <Wrench size={48} style={{ 
              display: 'inline-block',
              padding: '16px',
              background: 'rgba(255,255,255,0.1)',
              borderRadius: '16px',
              backdropFilter: 'blur(10px)',
              animation: 'float 3s ease-in-out infinite',
            }} />
          </div>
          
          <h1 className="animate-fade-in-up delay-200" style={{
            fontSize: '3rem',
            fontWeight: 800,
            marginBottom: '16px',
            letterSpacing: '-0.5px',
            lineHeight: 1.2,
          }}>
            {t.heroTitle}
          </h1>
          
          <p className="animate-fade-in-up delay-300" style={{
            fontSize: '1.2rem',
            opacity: 0.9,
            maxWidth: '600px',
            margin: '0 auto',
            lineHeight: 1.6,
          }}>
            {t.heroSubtitle}
          </p>
        </div>
        
        {/* Wave effect at bottom */}
        <div style={{
          position: 'absolute',
          bottom: 0,
          left: 0,
          right: 0,
          height: '60px',
          background: bgColor,
          borderRadius: '50% 50% 0 0',
          transform: 'scaleX(1.5)',
        }} />
      </div>

      {/* Content */}
      <div style={{ padding: '64px 0', position: 'relative', zIndex: 1 }}>
        <div style={{
          maxWidth: '1200px',
          margin: '0 auto',
          padding: '0 24px',
        }}>
          
          {/* Mission & Vision */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
            gap: '24px',
            marginBottom: '64px',
          }}>
            <div className="animate-fade-in-left card-gradient" style={{
              background: cardBg,
              borderRadius: '16px',
              padding: '40px',
              border: `1px solid ${borderColor}`,
              position: 'relative',
              overflow: 'hidden',
            }}>
              <div style={{
                width: '56px',
                height: '56px',
                borderRadius: '14px',
                background: 'linear-gradient(135deg, #3b82f6, #2563eb)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: '20px',
                boxShadow: '0 4px 12px rgba(59,130,246,0.3)',
              }}>
                <Target size={28} color="white" />
              </div>
              <h3 style={{
                fontSize: '1.5rem',
                fontWeight: 700,
                color: textColor,
                marginBottom: '12px',
              }}>
                {t.ourMission}
              </h3>
              <p style={{
                fontSize: '1rem',
                color: textSecondary,
                lineHeight: 1.8,
              }}>
                {t.missionText}
              </p>
            </div>
            
            <div className="animate-fade-in-right delay-200 card-gradient" style={{
              background: cardBg,
              borderRadius: '16px',
              padding: '40px',
              border: `1px solid ${borderColor}`,
              position: 'relative',
              overflow: 'hidden',
            }}>
              <div style={{
                width: '56px',
                height: '56px',
                borderRadius: '14px',
                background: 'linear-gradient(135deg, #8b5cf6, #7c3aed)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: '20px',
                boxShadow: '0 4px 12px rgba(139,92,246,0.3)',
              }}>
                <Eye size={28} color="white" />
              </div>
              <h3 style={{
                fontSize: '1.5rem',
                fontWeight: 700,
                color: textColor,
                marginBottom: '12px',
              }}>
                {t.ourVision}
              </h3>
              <p style={{
                fontSize: '1rem',
                color: textSecondary,
                lineHeight: 1.8,
              }}>
                {t.visionText}
              </p>
            </div>
          </div>

          {/* Our Story */}
          <div className="animate-fade-in-up" style={{
            background: cardBg,
            borderRadius: '20px',
            padding: '48px',
            border: `1px solid ${borderColor}`,
            marginBottom: '48px',
            boxShadow: '0 4px 16px rgba(0,0,0,0.05)',
          }}>
            <h2 style={{
              fontSize: '2rem',
              fontWeight: 700,
              color: textColor,
              marginBottom: '20px',
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
            }}>
              <span style={{
                width: '4px',
                height: '32px',
                background: 'linear-gradient(180deg, #3b82f6, #8b5cf6)',
                borderRadius: '2px',
                display: 'inline-block',
              }} />
              {t.ourStory}
            </h2>
            <p style={{
              fontSize: '1.1rem',
              color: textSecondary,
              lineHeight: 2,
              maxWidth: '800px',
            }}>
              {t.storyText}
            </p>
          </div>

          {/* Values */}
          <div style={{ marginBottom: '48px' }}>
            <h2 className="animate-fade-in-up" style={{
              fontSize: '2rem',
              fontWeight: 700,
              color: textColor,
              marginBottom: '32px',
              textAlign: 'center',
            }}>
              {t.ourValues}
            </h2>
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
              gap: '24px',
            }}>
              {values.map((v, i) => (
                <div 
                  key={i}
                  className={`animate-fade-in-up delay-${(i + 1) * 100} hover-scale card-gradient`}
                  style={{
                    background: cardBg,
                    borderRadius: '16px',
                    padding: '36px',
                    border: `1px solid ${borderColor}`,
                    textAlign: 'center',
                    cursor: 'pointer',
                  }}
                >
                  <div style={{
                    width: '64px',
                    height: '64px',
                    borderRadius: '16px',
                    background: `${v.color}15`,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    margin: '0 auto 20px',
                    color: v.color,
                    transition: 'all 0.3s ease',
                  }}>
                    {v.icon}
                  </div>
                  <h3 style={{
                    fontSize: '1.25rem',
                    fontWeight: 600,
                    color: textColor,
                    marginBottom: '12px',
                  }}>
                    {v.title}
                  </h3>
                  <p style={{
                    fontSize: '0.95rem',
                    color: textSecondary,
                    lineHeight: 1.7,
                  }}>
                    {v.text}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Statistics */}
          <div ref={statsRef} style={{ marginBottom: '48px' }}>
            <h2 className="animate-fade-in-up" style={{
              fontSize: '2rem',
              fontWeight: 700,
              color: textColor,
              marginBottom: '32px',
              textAlign: 'center',
            }}>
              {t.ourNumbers}
            </h2>
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
              gap: '20px',
            }}>
              {stats.map((s, i) => (
                <div 
                  key={i}
                  className={`animate-scale-in delay-${(i + 1) * 100} hover-scale`}
                  style={{
                    background: cardBg,
                    borderRadius: '16px',
                    padding: '32px',
                    border: `1px solid ${borderColor}`,
                    textAlign: 'center',
                    transition: 'all 0.3s ease',
                  }}
                >
                  <div style={{
                    width: '48px',
                    height: '48px',
                    borderRadius: '12px',
                    background: `${s.color}15`,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    margin: '0 auto 16px',
                    color: s.color,
                  }}>
                    {s.icon}
                  </div>
                  <div style={{
                    fontSize: '2.5rem',
                    fontWeight: 800,
                    color: s.color,
                    marginBottom: '8px',
                    transition: 'all 0.3s ease',
                  }}>
                    {s.value}{s.suffix}
                  </div>
                  <div style={{
                    fontSize: '0.95rem',
                    color: textSecondary,
                    fontWeight: 500,
                  }}>
                    {s.label}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* CTA Section */}
          <div className="animate-fade-in-up" style={{
            background: 'linear-gradient(135deg, #3b82f6 0%, #8b5cf6 50%, #059669 100%)',
            backgroundSize: '200% 200%',
            animation: 'gradientShift 6s ease infinite',
            borderRadius: '24px',
            padding: '64px 48px',
            textAlign: 'center',
            color: 'white',
            position: 'relative',
            overflow: 'hidden',
          }}>
            {/* Decorative circles */}
            <div style={{
              position: 'absolute',
              top: -30,
              right: -30,
              width: '200px',
              height: '200px',
              borderRadius: '50%',
              background: 'rgba(255,255,255,0.1)',
              animation: 'float 4s ease-in-out infinite',
            }} />
            <div style={{
              position: 'absolute',
              bottom: -20,
              left: -20,
              width: '150px',
              height: '150px',
              borderRadius: '50%',
              background: 'rgba(255,255,255,0.05)',
              animation: 'float 5s ease-in-out infinite 1s',
            }} />
            
            <div style={{ position: 'relative', zIndex: 1 }}>
              <h2 style={{
                fontSize: '2rem',
                fontWeight: 700,
                marginBottom: '16px',
              }}>
                {t.joinUs}
              </h2>
              <p style={{
                fontSize: '1.1rem',
                opacity: 0.95,
                marginBottom: '32px',
                maxWidth: '500px',
                margin: '0 auto 32px',
              }}>
                {t.joinText}
              </p>
              <Link 
                to="/select-role"
                style={{
                  padding: '16px 40px',
                  borderRadius: '14px',
                  background: 'white',
                  color: '#3b82f6',
                  border: 'none',
                  fontWeight: 700,
                  fontSize: '1.1rem',
                  cursor: 'pointer',
                  textDecoration: 'none',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '8px',
                  transition: 'all 0.3s ease',
                  boxShadow: '0 8px 24px rgba(0,0,0,0.2)',
                }}
                className="hover-scale"
              >
                {t.startNow}
                <ArrowRight size={20} />
              </Link>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default AboutPage;