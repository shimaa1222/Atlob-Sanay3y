// src/components/Layout/Header.jsx
import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import notificationService from '../../services/notificationService';
import { 
  Wrench, Moon, Sun, Globe, Download, LogOut, Bell, 
  Search, Star, LayoutDashboard, Calendar, FileText 
} from 'lucide-react';

const Header = () => {
  const { user, logout, isAuthenticated, isCustomer, isCraftsman } = useAuth();
  const { darkMode, toggleTheme } = useTheme();
  const location = useLocation();
  const [scrolled, setScrolled] = useState(false);
  const [lang, setLang] = useState('ar');
  const [mobileOpen, setMobileOpen] = useState(false);
  const [installPrompt, setInstallPrompt] = useState(null);
  const [showInstall, setShowInstall] = useState(false);
  const [isInstalled, setIsInstalled] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);

  // Scroll detection
  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // PWA install prompt
  useEffect(() => {
    if (window.matchMedia('(display-mode: standalone)').matches) {
      setIsInstalled(true);
      return;
    }
    const handler = (e) => { e.preventDefault(); setInstallPrompt(e); setShowInstall(true); };
    window.addEventListener('beforeinstallprompt', handler);
    window.addEventListener('appinstalled', () => { setIsInstalled(true); setShowInstall(false); });
    return () => { window.removeEventListener('beforeinstallprompt', handler); };
  }, []);

  // Language
  useEffect(() => {
    const savedLang = localStorage.getItem('language') || 'ar';
    setLang(savedLang);
    document.documentElement.dir = savedLang === 'ar' ? 'rtl' : 'ltr';
  }, []);

  // Close mobile on route change
  useEffect(() => { setMobileOpen(false); }, [location.pathname]);

  // ✅ جلب عدد الإشعارات غير المقروءة
  useEffect(() => {
    if (isAuthenticated) {
      const updateCount = async () => {
        try {
          const count = await notificationService.getUnreadCount();
          setUnreadCount(count);
        } catch (error) {
          console.warn('⚠️ Error fetching unread count:', error);
          setUnreadCount(0);
        }
      };
      
      updateCount();
      const interval = setInterval(updateCount, 30000);
      const handleNewNotification = () => updateCount();
      window.addEventListener('newNotification', handleNewNotification);
      
      return () => {
        clearInterval(interval);
        window.removeEventListener('newNotification', handleNewNotification);
      };
    }
  }, [isAuthenticated]);

  // ✅ مختفي في صفحات الأدمن
  if (location.pathname.startsWith('/admin')) return null;

  const toggleLang = () => {
    const newLang = lang === 'ar' ? 'en' : 'ar';
    setLang(newLang);
    localStorage.setItem('language', newLang);
    document.documentElement.dir = newLang === 'ar' ? 'rtl' : 'ltr';
    window.dispatchEvent(new Event('languagechange'));
  };

  const handleInstall = async () => {
    if (!installPrompt) {
      alert('لتثبيت التطبيق:\n\n• Chrome: ⁝ ثم "تثبيت التطبيق"\n• iPhone: ↗ ثم "إضافة للشاشة الرئيسية"');
      return;
    }
    try {
      await installPrompt.prompt();
      const result = await installPrompt.userChoice;
      if (result.outcome === 'accepted') { setShowInstall(false); setInstallPrompt(null); setIsInstalled(true); }
    } catch {}
  };

  const isActive = (path) => path === '/' ? location.pathname === '/' : location.pathname.startsWith(path);

  const getHomePath = () => {
    if (isCustomer) return '/customer/home';
    if (isCraftsman) return '/craftsman/home';
    return '/';
  };

  // ✅ تحديد مسار التقييمات حسب حالة تسجيل الدخول
  const getReviewsPath = () => {
    if (isAuthenticated) {
      return '/my-reviews';
    }
    return '/reviews';
  };

  const t = {
    home: lang === 'ar' ? 'الرئيسية' : 'Home',
    about: lang === 'ar' ? 'عن المنصة' : 'About',
    install: lang === 'ar' ? 'تثبيت التطبيق' : 'Install App',
    login: lang === 'ar' ? 'دخول' : 'Login',
    register: lang === 'ar' ? 'حساب جديد' : 'Register',
    tagline: lang === 'ar' ? 'خدمات منزلية موثوقة' : 'Trusted Home Services',
    profile: lang === 'ar' ? 'الملف الشخصي' : 'Profile',
    logout: lang === 'ar' ? 'خروج' : 'Logout',
    services: lang === 'ar' ? 'الخدمات' : 'Services',
    reviews: lang === 'ar' ? 'التقييمات' : 'Reviews',
    notifications: lang === 'ar' ? 'الإشعارات' : 'Notifications',
    dashboard: lang === 'ar' ? ' لوحة التحكم' : ' Dashboard',
    myBookings: lang === 'ar' ? 'حجوزاتي' : 'My Bookings',
    myRequests: lang === 'ar' ? 'طلباتي' : 'My Requests',
  };

  const headerBg = darkMode ? (scrolled ? 'rgba(15, 23, 42, 0.98)' : '#0f172a') : (scrolled ? 'rgba(255, 255, 255, 0.98)' : '#ffffff');
  const borderColor = darkMode ? '#334155' : '#e2e8f0';
  const textColor = darkMode ? '#f1f5f9' : '#0f172a';
  const textMuted = darkMode ? '#94a3b8' : '#64748b';

  return (
    <header style={{ 
      position: 'fixed', top: 0, left: 0, right: 0, zIndex: 100, 
      height: '64px', background: headerBg, backdropFilter: scrolled ? 'blur(12px)' : 'none', 
      borderBottom: `1px solid ${borderColor}`, transition: 'all 0.3s ease', 
      fontFamily: "'Cairo', sans-serif" 
    }}>
      <div style={{ 
        maxWidth: '1280px', margin: '0 auto', padding: '0 24px', 
        height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between' 
      }}>
        {/* Logo */}
        <Link to={getHomePath()} style={{ display: 'flex', alignItems: 'center', gap: '10px', textDecoration: 'none', flexShrink: 0 }}>
          <div style={{ 
            width: '36px', height: '36px', background: 'linear-gradient(135deg, #3b82f6, #1d4ed8)', 
            borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', 
            boxShadow: '0 2px 8px rgba(59,130,246,0.3)' 
          }}>
            <Wrench size={18} color="white" />
          </div>
          <div style={{ lineHeight: 1.2 }}>
            <span style={{ fontWeight: 700, fontSize: '18px', color: '#2563eb', display: 'block', lineHeight: 1.1 }}>اطلب صنايعي</span>
            <span style={{ fontSize: '11px', color: textMuted, display: 'block', lineHeight: 1.1 }}>{t.tagline}</span>
          </div>
        </Link>

        <button onClick={() => setMobileOpen(!mobileOpen)} style={{ 
          display: 'none', background: 'none', border: 'none', fontSize: '24px', 
          cursor: 'pointer', color: textColor, padding: '8px' 
        }} className="mobile-menu-btn">
          {mobileOpen ? '✕' : '☰'}
        </button>

        <nav style={{ display: 'flex', alignItems: 'center', gap: '8px' }} className="main-nav">
          {/* ✅ الرئيسية */}
          <Link to={getHomePath()} style={navLinkStyle(isActive('/') || isActive('/customer/home') || isActive('/craftsman/home'), darkMode)}>{t.home}</Link>
          
          {/* ✅ الخدمات - للعميل فقط */}
          {isCustomer && <Link to="/search" style={navLinkStyle(isActive('/search'), darkMode)}><Search size={14} style={{ display: 'inline', marginLeft: '4px' }} />{t.services}</Link>}
          
          {/* ✅ التقييمات - للجميع */}
          <Link to={getReviewsPath()} style={navLinkStyle(
            isActive('/reviews') || isActive('/my-reviews'), 
            darkMode
          )}>
            <Star size={14} style={{ display: 'inline', marginLeft: '4px' }} />
            {t.reviews}
          </Link>
          
          {/* ✅ لوحة التحكم - تظهر للحرفي فقط */}
          {isCraftsman && (
            <Link to="/craftsman/dashboard" style={navLinkStyle(isActive('/craftsman/dashboard'), darkMode)}>
              <LayoutDashboard size={14} style={{ display: 'inline', marginLeft: '4px' }} />
              {t.dashboard}
            </Link>
          )}

          {/* ✅ عن المنصة - تظهر فقط قبل تسجيل الدخول */}
          {!isAuthenticated && (
            <Link to="/about" style={navLinkStyle(isActive('/about'), darkMode)}>{t.about}</Link>
          )}

          <div style={{ width: '1px', height: '24px', background: borderColor, margin: '0 4px' }} />

          {/* Notifications */}
          {isAuthenticated && (
            <Link to="/notifications" style={{ 
              position: 'relative', padding: '8px', borderRadius: '8px', 
              display: 'flex', alignItems: 'center', justifyContent: 'center', textDecoration: 'none' 
            }}
              onMouseEnter={(e) => e.currentTarget.style.background = darkMode ? '#334155' : '#f1f5f9'}
              onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}>
              <Bell size={20} style={{ color: textColor }} />
              {unreadCount > 0 && (
                <span style={{ 
                  position: 'absolute', top: '2px', right: '2px', minWidth: '18px', height: '18px', 
                  borderRadius: '50%', background: '#ef4444', color: 'white', fontSize: '0.6rem', 
                  fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center', 
                  padding: '0 4px', border: '2px solid white', animation: 'pulse 2s infinite' 
                }}>
                  {unreadCount > 9 ? '9+' : unreadCount}
                </span>
              )}
            </Link>
          )}

          <button onClick={toggleLang} style={{ 
            padding: '6px 12px', borderRadius: '8px', border: `1px solid ${borderColor}`, 
            background: 'transparent', cursor: 'pointer', fontSize: '13px', fontWeight: 600, 
            color: textColor, display: 'flex', alignItems: 'center', gap: '4px', 
            fontFamily: "'Cairo', sans-serif" 
          }}>
            <Globe size={14} />{lang === 'ar' ? 'EN' : 'AR'}
          </button>

          <button onClick={toggleTheme} style={{ 
            padding: '8px', borderRadius: '8px', border: 'none', background: 'transparent', 
            cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' 
          }}>
            {darkMode ? <Sun size={18} color="#f59e0b" /> : <Moon size={18} color="#64748b" />}
          </button>

          {/* ✅ تثبيت التطبيق - تظهر فقط قبل تسجيل الدخول */}
          {!isInstalled && !isAuthenticated && (
            <button onClick={handleInstall} style={{ 
              padding: '8px 16px', background: showInstall ? '#059669' : '#6366f1', 
              color: 'white', border: 'none', borderRadius: '10px', fontSize: '13px', 
              fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', 
              gap: '6px', fontFamily: "'Cairo', sans-serif", 
              boxShadow: '0 2px 8px rgba(5, 150, 105, 0.3)', transition: 'all 0.3s', 
              animation: showInstall ? 'pulse 2s infinite' : 'none' 
            }}>
              <Download size={15} /><span className="hidden sm:inline">{t.install}</span>{showInstall && <span style={{ fontSize: '10px' }}>⚡</span>}
            </button>
          )}

          <div style={{ width: '1px', height: '24px', background: borderColor, margin: '0 4px' }} />

          {isAuthenticated ? (
            <>
              <Link to="/profile" style={{ display: 'flex', alignItems: 'center', gap: '8px', textDecoration: 'none' }}>
                <div style={{ 
                  width: '32px', height: '32px', borderRadius: '50%', 
                  background: 'linear-gradient(135deg, #3b82f6, #2563eb)', 
                  display: 'flex', alignItems: 'center', justifyContent: 'center', 
                  color: 'white', fontWeight: 700, fontSize: '0.8rem' 
                }}>
                  {user?.name?.charAt(0) || 'م'}
                </div>
                <span style={{ fontSize: '14px', fontWeight: 600, color: textColor, fontFamily: "'Cairo', sans-serif" }}>
                  {user?.name?.split(' ')[0]}
                </span>
              </Link>
              <Link to="/profile" style={navLinkStyle(isActive('/profile'), darkMode)}>{t.profile}</Link>
              <button onClick={logout} style={{ 
                padding: '8px 16px', borderRadius: '10px', border: '2px solid #dc2626', 
                color: '#dc2626', background: 'transparent', fontSize: '14px', fontWeight: 600, 
                cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px', 
                fontFamily: "'Cairo', sans-serif", transition: 'all 0.2s' 
              }}
                onMouseEnter={(e) => { e.currentTarget.style.background = '#dc2626'; e.currentTarget.style.color = 'white'; }}
                onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = '#dc2626'; }}>
                <LogOut size={16} />{t.logout}
              </button>
            </>
          ) : (
            <>
              <Link to="/login" style={{ 
                padding: '8px 20px', borderRadius: '10px', border: '2px solid #3b82f6', 
                color: '#2563eb', fontSize: '14px', fontWeight: 600, textDecoration: 'none', 
                transition: 'all 0.2s', fontFamily: "'Cairo', sans-serif" 
              }}>{t.login}</Link>
              <Link to="/select-role" style={{ 
                padding: '8px 20px', borderRadius: '10px', background: '#2563eb', 
                color: 'white', fontSize: '14px', fontWeight: 600, textDecoration: 'none', 
                boxShadow: '0 2px 8px rgba(37,99,235,0.3)', transition: 'all 0.2s', 
                fontFamily: "'Cairo', sans-serif" 
              }}>{t.register}</Link>
            </>
          )}
        </nav>
      </div>

      <style>{`
        @keyframes pulse { 0%, 100% { transform: scale(1); } 50% { transform: scale(1.05); } }
        @media (max-width: 768px) {
          .mobile-menu-btn { display: block !important; }
          .main-nav { display: ${mobileOpen ? 'flex' : 'none'} !important; flex-direction: column; position: absolute; top: 64px; left: 0; right: 0; background: ${darkMode ? '#0f172a' : '#ffffff'}; padding: 16px; border-bottom: 1px solid ${borderColor}; box-shadow: 0 4px 12px rgba(0,0,0,0.1); gap: 4px !important; max-height: 80vh; overflow-y: auto; }
          .main-nav a, .main-nav button { width: 100%; justify-content: center; }
        }
        @media (min-width: 769px) { .hidden.sm\\:inline { display: inline !important; } }
        @media (max-width: 768px) { .hidden.sm\\:inline { display: none !important; } }
      `}</style>
    </header>
  );
};

const navLinkStyle = (isActive, darkMode) => ({
  padding: '8px 16px', borderRadius: '8px', fontSize: '14px',
  fontWeight: isActive ? 600 : 500,
  color: isActive ? '#2563eb' : (darkMode ? '#cbd5e1' : '#475569'),
  background: isActive ? (darkMode ? 'rgba(59, 130, 246, 0.1)' : '#eff6ff') : 'transparent',
  textDecoration: 'none', transition: 'all 0.2s', whiteSpace: 'nowrap',
  fontFamily: "'Cairo', sans-serif",
});

export default Header;