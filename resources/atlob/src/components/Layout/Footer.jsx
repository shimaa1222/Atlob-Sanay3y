// src/components/Layout/Footer.jsx
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useTheme } from '../../context/ThemeContext';
import { useAuth } from '../../context/AuthContext'; // ✅ إضافة
import { Wrench } from 'lucide-react';

const Footer = () => {
  const { darkMode } = useTheme();
  const { isAuthenticated } = useAuth(); // ✅ إضافة
  const [lang, setLang] = useState('ar');

  // Language initialization & listener
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

  // ✅ إذا كان المستخدم مسجلاً دخول، لا تظهر الفوتر
  if (isAuthenticated) {
    return null;
  }

  // Translations
  const t = {
    tagline: lang === 'ar' 
      ? 'منصة رائدة لربط العملاء بأفضل الحرفيين الموثوقين في جميع التخصصات. نضمن الجودة والموثوقية في كل خدمة.' 
      : 'A leading platform connecting customers with the best trusted craftsmen in all specialties. We guarantee quality and reliability in every service.',
    logoSub: lang === 'ar' ? 'خدمات منزلية موثوقة' : 'Trusted Home Services',
    quickLinks: lang === 'ar' ? 'روابط سريعة' : 'Quick Links',
    about: lang === 'ar' ? 'عن المنصة' : 'About',
    howItWorks: lang === 'ar' ? 'كيف يعمل' : 'How It Works',
    faq: lang === 'ar' ? 'الأسئلة الشائعة' : 'FAQ',
    joinAsCraftsman: lang === 'ar' ? 'انضم كحرفي' : 'Join as Craftsman',
    specialties: lang === 'ar' ? 'التخصصات' : 'Specialties',
    electrician: lang === 'ar' ? 'كهربائي' : 'Electrician',
    plumber: lang === 'ar' ? 'سباك' : 'Plumber',
    carpenter: lang === 'ar' ? 'نجار' : 'Carpenter',
    painter: lang === 'ar' ? 'نقاش' : 'Painter',
    support: lang === 'ar' ? 'الدعم' : 'Support',
    contactUs: lang === 'ar' ? 'اتصل بنا' : 'Contact Us',
    helpCenter: lang === 'ar' ? 'مركز المساعدة' : 'Help Center',
    privacy: lang === 'ar' ? 'سياسة الخصوصية' : 'Privacy Policy',
    terms: lang === 'ar' ? 'شروط الخدمة' : 'Terms of Service',
    copyright: lang === 'ar' 
      ? `${new Date().getFullYear()} © اطلب صنايعي. جميع الحقوق محفوظة.` 
      : `© ${new Date().getFullYear()} Atlob Sanay3y. All rights reserved.`,
  };

  // Dynamic colors based on dark mode
  const bgColor = darkMode ? '#0a0f1a' : '#0f172a';
  const textColor = darkMode ? '#cbd5e1' : '#94a3b8';
  const headingColor = '#f1f5f9';
  const borderColor = darkMode ? 'rgba(148, 163, 184, 0.1)' : 'rgba(148, 163, 184, 0.08)';
  const hoverColor = '#f1f5f9';

  const handleHover = (e) => { e.target.style.color = hoverColor; };
  const handleLeave = (e) => { e.target.style.color = textColor; };

  return (
    <footer style={{
      background: bgColor,
      color: textColor,
      padding: '60px 0 24px',
      marginTop: 'auto',
      fontFamily: "'Cairo', sans-serif",
      transition: 'background 0.3s ease',
    }}>
      <div style={{
        maxWidth: '1280px',
        margin: '0 auto',
        padding: '0 24px',
      }}>
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: '40px',
          paddingBottom: '40px',
          borderBottom: `1px solid ${borderColor}`,
        }}>
          {/* Logo & Description */}
          <div>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              marginBottom: '16px',
            }}>
              <div style={{
                width: '36px',
                height: '36px',
                background: 'linear-gradient(135deg, #3b82f6, #1d4ed8)',
                borderRadius: '10px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 2px 8px rgba(59,130,246,0.3)',
              }}>
                <Wrench size={18} color="white" />
              </div>
              <div style={{ lineHeight: 1.2 }}>
                <span style={{
                  fontWeight: '700',
                  fontSize: '1.125rem',
                  color: '#f1f5f9',
                  fontFamily: "'Cairo', sans-serif",
                  display: 'block',
                  lineHeight: 1.1,
                }}>
                  اطلب صنايعي
                </span>
                <span style={{
                  fontSize: '0.7rem',
                  color: '#64748b',
                  fontFamily: "'Cairo', sans-serif",
                  display: 'block',
                  lineHeight: 1.1,
                }}>
                  {t.logoSub}
                </span>
              </div>
            </div>
            <p style={{
              fontSize: '0.875rem',
              lineHeight: '1.8',
              color: '#64748b',
              fontFamily: "'Cairo', sans-serif",
            }}>
              {t.tagline}
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h3 style={{
              color: headingColor,
              fontSize: '0.8125rem',
              fontWeight: '700',
              marginBottom: '20px',
              textTransform: 'uppercase',
              letterSpacing: '1px',
              fontFamily: "'Cairo', sans-serif",
            }}>
              {t.quickLinks}
            </h3>
            <Link to="/about" style={linkStyle(textColor)} onMouseEnter={handleHover} onMouseLeave={handleLeave}>{t.about}</Link>
            <Link to="/help" style={linkStyle(textColor)} onMouseEnter={handleHover} onMouseLeave={handleLeave}>{t.howItWorks}</Link>
            <Link to="/help" style={linkStyle(textColor)} onMouseEnter={handleHover} onMouseLeave={handleLeave}>{t.faq}</Link>
            <Link to="/select-role" style={linkStyle(textColor)} onMouseEnter={handleHover} onMouseLeave={handleLeave}>{t.joinAsCraftsman}</Link>
          </div>

          {/* Specialties */}
          <div>
            <h3 style={{
              color: headingColor,
              fontSize: '0.8125rem',
              fontWeight: '700',
              marginBottom: '20px',
              textTransform: 'uppercase',
              letterSpacing: '1px',
              fontFamily: "'Cairo', sans-serif",
            }}>
              {t.specialties}
            </h3>
            <Link to="/search?q=كهربائي" style={linkStyle(textColor)} onMouseEnter={handleHover} onMouseLeave={handleLeave}>{t.electrician}</Link>
            <Link to="/search?q=سباك" style={linkStyle(textColor)} onMouseEnter={handleHover} onMouseLeave={handleLeave}>{t.plumber}</Link>
            <Link to="/search?q=نجار" style={linkStyle(textColor)} onMouseEnter={handleHover} onMouseLeave={handleLeave}>{t.carpenter}</Link>
            <Link to="/search?q=نقاش" style={linkStyle(textColor)} onMouseEnter={handleHover} onMouseLeave={handleLeave}>{t.painter}</Link>
          </div>

          {/* Support */}
          <div>
            <h3 style={{
              color: headingColor,
              fontSize: '0.8125rem',
              fontWeight: '700',
              marginBottom: '20px',
              textTransform: 'uppercase',
              letterSpacing: '1px',
              fontFamily: "'Cairo', sans-serif",
            }}>
              {t.support}
            </h3>
            <Link to="/help" style={linkStyle(textColor)} onMouseEnter={handleHover} onMouseLeave={handleLeave}>{t.contactUs}</Link>
            <Link to="/help" style={linkStyle(textColor)} onMouseEnter={handleHover} onMouseLeave={handleLeave}>{t.helpCenter}</Link>
            <Link to="/terms" style={linkStyle(textColor)} onMouseEnter={handleHover} onMouseLeave={handleLeave}>{t.privacy}</Link>
            <Link to="/terms" style={linkStyle(textColor)} onMouseEnter={handleHover} onMouseLeave={handleLeave}>{t.terms}</Link>
          </div>
        </div>

        {/* Copyright */}
        <div style={{
          paddingTop: '24px',
          textAlign: 'center',
          fontSize: '0.8125rem',
          color: '#64748b',
          fontFamily: "'Cairo', sans-serif",
        }}>
          {t.copyright}
        </div>
      </div>
    </footer>
  );
};

// Helper function for link styles
const linkStyle = (textColor) => ({
  color: textColor,
  textDecoration: 'none',
  fontSize: '0.875rem',
  display: 'block',
  padding: '4px 0',
  transition: 'color 0.2s ease',
  fontFamily: "'Cairo', sans-serif",
});

export default Footer;