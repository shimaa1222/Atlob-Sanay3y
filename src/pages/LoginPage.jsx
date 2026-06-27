// src/pages/LoginPage.jsx
import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { 
  Mail, Lock, Eye, EyeOff, User, Wrench, 
  CheckCircle, LogIn, Moon, Sun, Globe
} from 'lucide-react';

const LoginPage = () => {
  const { login } = useAuth();
  const { darkMode, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const location = useLocation();
  
  const [lang, setLang] = useState('ar');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('client'); // ✅ client (متوافق مع الباك إند)
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [successLogin, setSuccessLogin] = useState(false);

  const from = location.state?.from?.pathname || '/';

  // Language
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

  // Load saved credentials
  useEffect(() => {
    const savedEmail = localStorage.getItem('rememberedEmail');
    const savedRole = localStorage.getItem('rememberedRole');
    if (savedEmail) {
      setEmail(savedEmail);
      setRememberMe(true);
    }
    if (savedRole) {
      setRole(savedRole);
    }
  }, []);

  const toggleLang = () => {
    const newLang = lang === 'ar' ? 'en' : 'ar';
    setLang(newLang);
    localStorage.setItem('language', newLang);
    window.dispatchEvent(new Event('languagechange'));
  };

  // Translations
  const t = {
    title: lang === 'ar' ? 'مرحباً بعودتك' : 'Welcome Back',
    subtitle: lang === 'ar' ? 'سجل دخولك للوصول إلى حسابك' : 'Sign in to access your account',
    email: lang === 'ar' ? 'البريد الإلكتروني' : 'Email Address',
    emailPlaceholder: lang === 'ar' ? 'example@email.com' : 'example@email.com',
    password: lang === 'ar' ? 'كلمة المرور' : 'Password',
    passwordPlaceholder: lang === 'ar' ? '••••••••' : '••••••••',
    roleLabel: lang === 'ar' ? 'نوع الحساب' : 'Account Type',
    customer: lang === 'ar' ? 'عميل' : 'Customer',
    craftsman: lang === 'ar' ? 'حرفي' : 'Craftsman',
    rememberMe: lang === 'ar' ? 'تذكرني' : 'Remember me',
    forgotPassword: lang === 'ar' ? 'نسيت كلمة المرور؟' : 'Forgot password?',
    login: lang === 'ar' ? 'تسجيل الدخول' : 'Sign In',
    loggingIn: lang === 'ar' ? 'جاري الدخول...' : 'Signing in...',
    noAccount: lang === 'ar' ? 'ليس لديك حساب؟' : 'Don\'t have an account?',
    createAccount: lang === 'ar' ? 'إنشاء حساب جديد' : 'Create New Account',
    fillAllFields: lang === 'ar' ? 'يرجى ملء جميع الحقول' : 'Please fill in all fields',
    invalidCredentials: lang === 'ar' ? 'بريد إلكتروني أو كلمة مرور غير صحيحة' : 'Invalid email or password',
    successMessage: lang === 'ar' ? 'تم تسجيل الدخول بنجاح!' : 'Login successful!',
    demoLogin: lang === 'ar' ? 'تسجيل دخول سريع' : 'Quick Login',
    demoCustomer: lang === 'ar' ? 'عميل تجريبي' : 'Demo Customer',
    demoCraftsman: lang === 'ar' ? 'حرفي تجريبي' : 'Demo Craftsman',
    roleNote: lang === 'ar' 
      ? '💡 نوع الحساب يتم تحديده تلقائياً من البيانات المسجلة' 
      : '💡 Account type is automatically determined from registered data',
  };

  // ✅ تسجيل الدخول
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!email.trim() || !password.trim()) {
      setError(t.fillAllFields);
      return;
    }

    setLoading(true);

    try {
      const result = await login(email, password);

      // ❌ لو فشل تسجيل الدخول
      if (!result.success) {
        setError(result.message || t.invalidCredentials);
        setLoading(false);
        return;
      }

      console.log('🔄 [LoginPage] Login result:', result);
      console.log('🔄 [LoginPage] Role from backend:', result.role);
      console.log('🔄 [LoginPage] Selected role in UI:', role);

      // ✅ حفظ بيانات "تذكرني"
      if (rememberMe) {
        localStorage.setItem('rememberedEmail', email);
        localStorage.setItem('rememberedRole', role);
      } else {
        localStorage.removeItem('rememberedEmail');
        localStorage.removeItem('rememberedRole');
      }

      setSuccessLogin(true);
      setLoading(false);
      
      // ✅ التحقق من البريد الإلكتروني أولاً
      if (result.needsVerification) {
        setTimeout(() => {
          navigate('/verify-email', { replace: true });
        }, 800);
        return;
      }

      // ✅ توجيه حسب الدور (متوافق مع الباك إند)
      setTimeout(() => {
        const userRole = result.role || 'client';
        console.log('🔄 [LoginPage] Navigating with role:', userRole);
        
        // ✅ استخدام الأدوار الصحيحة من الباك إند
        if (userRole === 'client') {
          navigate('/customer/home', { replace: true });
        } else if (userRole === 'craftsman') {
          navigate('/craftsman/home', { replace: true });
        } else if (userRole === 'admin') {
          navigate('/admin/dashboard', { replace: true });
        } else {
          // ✅ العودة إلى الصفحة السابقة إذا كان الدور غير معروف
          navigate(from, { replace: true });
        }
      }, 800);

    } catch (err) {
      setError(err.message || t.invalidCredentials);
      setLoading(false);
    }
  };

  // ✅ Demo Login
  const handleDemoLogin = async (demoRole) => {
    // ✅ تحديث الـ role في الـ UI
    setRole(demoRole);
    
    const demoEmail = demoRole === 'client' 
      ? 'client@demo.com' 
      : 'craftsman@demo.com';
    
    setEmail(demoEmail);
    setPassword('12345678');
    setLoading(true);
    setError('');

    try {
      const result = await login(demoEmail, '12345678');
      
      // ❌ لو فشل تسجيل الدخول
      if (!result.success) {
        setError(result.message || 'فشل تسجيل الدخول التجريبي');
        setLoading(false);
        return;
      }

      setSuccessLogin(true);
      setLoading(false);
      
      console.log('🔄 [LoginPage] Demo login - role from backend:', result.role);
      console.log('🔄 [LoginPage] Demo login - selected role in UI:', demoRole);
      
      if (result.needsVerification) {
        setTimeout(() => {
          navigate('/verify-email', { replace: true });
        }, 800);
        return;
      }

      // ✅ توجيه حسب الدور (متوافق مع الباك إند)
      setTimeout(() => {
        const userRole = result.role || 'client';
        console.log('🔄 [LoginPage] Demo navigating with role:', userRole);
        
        if (userRole === 'client') {
          navigate('/customer/home', { replace: true });
        } else if (userRole === 'craftsman') {
          navigate('/craftsman/home', { replace: true });
        } else if (userRole === 'admin') {
          navigate('/admin/dashboard', { replace: true });
        } else {
          navigate('/', { replace: true });
        }
      }, 800);

    } catch (err) {
      setError(err.message || 'حدث خطأ');
      setLoading(false);
    }
  };

  // Dynamic colors
  const bgColor = darkMode ? '#0f172a' : '#f8fafc';
  const cardBg = darkMode ? '#1e293b' : '#ffffff';
  const textColor = darkMode ? '#f1f5f9' : '#0f172a';
  const textSecondary = darkMode ? '#94a3b8' : '#64748b';
  const borderColor = darkMode ? '#334155' : '#e2e8f0';
  const inputBg = darkMode ? '#0f172a' : '#f8fafc';
  const gradientBg = darkMode 
    ? 'linear-gradient(135deg, #1e3a8a, #3b82f6)'
    : 'linear-gradient(135deg, #1e40af, #3b82f6)';

  return (
    <div
      dir={lang === 'ar' ? 'rtl' : 'ltr'}
      style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: bgColor,
        padding: '40px 20px',
        fontFamily: "'Cairo', sans-serif",
      }}
    >
      <style>{`
        @keyframes fadeInUp { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
        @keyframes slideDown { from { opacity: 0; transform: translateY(-20px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes successPulse { 0% { transform: scale(0.8); opacity: 0; } 50% { transform: scale(1.1); opacity: 1; } 100% { transform: scale(1); opacity: 1; } }
        @keyframes float { 0%, 100% { transform: translateY(0); } 50% { transform: translateY(-10px); } }
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
        
        .animate-fade-in-up { animation: fadeInUp 0.5s ease forwards; }
        .animate-fade-in { animation: fadeIn 0.3s ease forwards; }
        .animate-slide-down { animation: slideDown 0.5s ease forwards; }
        .animate-success { animation: successPulse 0.6s ease forwards; }
        .animate-float { animation: float 3s ease-in-out infinite; }
        
        .delay-100 { animation-delay: 0.1s; }
        .delay-200 { animation-delay: 0.2s; }
        .delay-300 { animation-delay: 0.3s; }
        .delay-400 { animation-delay: 0.4s; }
        
        .input-focus { transition: all 0.3s ease; }
        .input-focus:focus-within { border-color: #3b82f6 !important; box-shadow: 0 0 0 3px rgba(59,130,246,0.1); }
        
        @media (max-width: 480px) {
          .login-card { border-radius: 20px !important; }
          .header-section { padding: 30px 20px !important; }
          .form-section { padding: 24px 20px !important; }
        }
      `}</style>

      {/* Top Bar */}
      <div style={{ 
        position: 'fixed', 
        top: '20px', 
        [lang === 'ar' ? 'left' : 'right']: '20px', 
        display: 'flex', 
        gap: '8px', 
        zIndex: 10 
      }}>
        <button onClick={toggleLang} style={{
          padding: '8px 14px', borderRadius: '10px', border: `1px solid ${borderColor}`,
          background: cardBg, cursor: 'pointer', color: textColor,
          fontSize: '0.8rem', fontWeight: 600, fontFamily: "'Cairo', sans-serif",
          display: 'flex', alignItems: 'center', gap: '6px', transition: 'all 0.3s ease',
        }}>
          <Globe size={14} />{lang === 'ar' ? 'EN' : 'AR'}
        </button>
        <button onClick={toggleTheme} style={{
          padding: '8px 12px', borderRadius: '10px', border: `1px solid ${borderColor}`,
          background: cardBg, cursor: 'pointer', color: textColor,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          {darkMode ? <Sun size={16} color="#fbbf24" /> : <Moon size={16} />}
        </button>
      </div>

      {/* Success Overlay */}
      {successLogin && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center',
          justifyContent: 'center', zIndex: 1000, backdropFilter: 'blur(4px)',
        }}>
          <div className="animate-success" style={{
            background: cardBg, borderRadius: '20px', padding: '40px',
            textAlign: 'center', boxShadow: '0 20px 60px rgba(0,0,0,0.3)',
          }}>
            <CheckCircle size={64} style={{ color: '#059669', marginBottom: '16px' }} />
            <p style={{ fontSize: '1.2rem', fontWeight: 700, color: textColor, fontFamily: "'Cairo', sans-serif" }}>
              {t.successMessage}
            </p>
          </div>
        </div>
      )}

      {/* Main Card */}
      <div className="login-card" style={{
        background: cardBg, borderRadius: '24px', width: '100%', maxWidth: '440px',
        overflow: 'hidden', boxShadow: darkMode ? '0 25px 60px rgba(0,0,0,0.3)' : '0 25px 60px rgba(0,0,0,0.1)',
        border: `1px solid ${borderColor}`,
      }}>
        
        {/* Header */}
        <div className="header-section animate-slide-down" style={{
          background: gradientBg, padding: '40px 30px', textAlign: 'center',
          color: 'white', position: 'relative', overflow: 'hidden',
        }}>
          <div style={{ position: 'absolute', top: -30, right: -30, width: '120px', height: '120px', borderRadius: '50%', background: 'rgba(255,255,255,0.1)', animation: 'float 4s ease-in-out infinite' }} />
          <div style={{ position: 'absolute', bottom: -20, left: -20, width: '80px', height: '80px', borderRadius: '50%', background: 'rgba(255,255,255,0.05)', animation: 'float 5s ease-in-out infinite 1s' }} />
          
          <div style={{ position: 'relative', zIndex: 1 }}>
            <div style={{
              width: '64px', height: '64px', borderRadius: '18px',
              background: 'rgba(255,255,255,0.2)', display: 'flex',
              alignItems: 'center', justifyContent: 'center',
              margin: '0 auto 16px', backdropFilter: 'blur(10px)',
              border: '2px solid rgba(255,255,255,0.3)',
            }}>
              <LogIn size={28} />
            </div>
            <h1 style={{ fontSize: '1.6rem', fontWeight: '800', marginBottom: '4px' }}>{t.title}</h1>
            <p style={{ opacity: '0.85', fontSize: '0.9rem' }}>{t.subtitle}</p>
          </div>
        </div>

        {/* Form */}
        <div className="form-section" style={{ padding: '32px 30px' }}>
          
          {error && (
            <div className="animate-fade-in" style={{
              background: darkMode ? 'rgba(220,38,38,0.1)' : '#fef2f2', color: '#dc2626',
              padding: '12px 16px', borderRadius: '12px', marginBottom: '20px',
              fontSize: '0.85rem', border: '1px solid rgba(220,38,38,0.2)',
              display: 'flex', alignItems: 'center', gap: '8px',
            }}>
              <span>⚠️</span>{error}
            </div>
          )}

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            
            {/* ✅ Role Selection - تفاعلية مع الـ state */}
            <div className="animate-fade-in-up delay-100">
              <label style={{ display: 'block', fontWeight: '600', color: textColor, marginBottom: '10px', fontSize: '0.85rem' }}>
                {t.roleLabel}
              </label>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                <button
                  type="button"
                  onClick={() => setRole('client')}
                  style={{
                    padding: '16px 12px', borderRadius: '14px',
                    border: role === 'client' ? '2px solid #3b82f6' : `2px solid ${borderColor}`,
                    background: role === 'client' ? (darkMode ? 'rgba(59,130,246,0.15)' : '#eff6ff') : 'transparent',
                    cursor: 'pointer', transition: 'all 0.3s ease',
                    textAlign: 'center', fontFamily: "'Cairo', sans-serif",
                  }}>
                  <div style={{ color: role === 'client' ? '#3b82f6' : textSecondary, marginBottom: '8px', display: 'flex', justifyContent: 'center' }}>
                    <User size={20} />
                  </div>
                  <div style={{ fontWeight: '700', color: role === 'client' ? '#2563eb' : textColor, fontSize: '0.9rem' }}>
                    {t.customer}
                  </div>
                </button>
                <button
                  type="button"
                  onClick={() => setRole('craftsman')}
                  style={{
                    padding: '16px 12px', borderRadius: '14px',
                    border: role === 'craftsman' ? '2px solid #f59e0b' : `2px solid ${borderColor}`,
                    background: role === 'craftsman' ? (darkMode ? 'rgba(245,158,11,0.15)' : '#fef3c7') : 'transparent',
                    cursor: 'pointer', transition: 'all 0.3s ease',
                    textAlign: 'center', fontFamily: "'Cairo', sans-serif",
                  }}>
                  <div style={{ color: role === 'craftsman' ? '#f59e0b' : textSecondary, marginBottom: '8px', display: 'flex', justifyContent: 'center' }}>
                    <Wrench size={20} />
                  </div>
                  <div style={{ fontWeight: '700', color: role === 'craftsman' ? '#d97706' : textColor, fontSize: '0.9rem' }}>
                    {t.craftsman}
                  </div>
                </button>
              </div>
              {/* ✅ ملاحظة توضيحية */}
              <p style={{ 
                fontSize: '0.7rem', 
                color: textSecondary, 
                textAlign: 'center', 
                marginTop: '8px',
                opacity: 0.7,
              }}>
                {t.roleNote}
              </p>
            </div>

            {/* Email */}
            <div className="animate-fade-in-up delay-200">
              <label style={{ display: 'block', fontWeight: '600', color: textColor, marginBottom: '8px', fontSize: '0.85rem' }}>
                {t.email}
              </label>
              <div className="input-focus" style={{
                display: 'flex', alignItems: 'center', gap: '10px',
                padding: '14px 16px', border: `2px solid ${borderColor}`,
                borderRadius: '14px', background: inputBg,
              }}>
                <Mail size={18} style={{ color: textSecondary, flexShrink: 0 }} />
                <input
                  type="email" 
                  value={email} 
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder={t.emailPlaceholder}
                  style={{ 
                    flex: 1, border: 'none', outline: 'none', fontSize: '0.95rem', 
                    fontFamily: "'Cairo', sans-serif", background: 'transparent', 
                    color: textColor, textAlign: lang === 'ar' ? 'right' : 'left' 
                  }}
                />
              </div>
            </div>

            {/* Password */}
            <div className="animate-fade-in-up delay-300">
              <label style={{ display: 'block', fontWeight: '600', color: textColor, marginBottom: '8px', fontSize: '0.85rem' }}>
                {t.password}
              </label>
              <div className="input-focus" style={{
                display: 'flex', alignItems: 'center', gap: '10px',
                padding: '14px 16px', border: `2px solid ${borderColor}`,
                borderRadius: '14px', background: inputBg,
              }}>
                <Lock size={18} style={{ color: textSecondary, flexShrink: 0 }} />
                <input
                  type={showPassword ? 'text' : 'password'} 
                  value={password} 
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder={t.passwordPlaceholder}
                  style={{ 
                    flex: 1, border: 'none', outline: 'none', fontSize: '0.95rem', 
                    fontFamily: "'Cairo', sans-serif", background: 'transparent', 
                    color: textColor, textAlign: lang === 'ar' ? 'right' : 'left' 
                  }}
                />
                <button type="button" onClick={() => setShowPassword(!showPassword)}
                  style={{ background: 'none', border: 'none', cursor: 'pointer', color: textSecondary, padding: '4px', display: 'flex', alignItems: 'center' }}>
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            {/* Remember & Forgot */}
            <div className="animate-fade-in-up delay-300" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontSize: '0.85rem', color: textSecondary }}>
                <div onClick={() => setRememberMe(!rememberMe)}
                  style={{
                    width: '20px', height: '20px', borderRadius: '6px',
                    border: `2px solid ${rememberMe ? '#3b82f6' : borderColor}`,
                    background: rememberMe ? '#3b82f6' : 'transparent',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    transition: 'all 0.3s ease',
                  }}>
                  {rememberMe && <CheckCircle size={14} color="white" />}
                </div>
                {t.rememberMe}
              </label>
              <Link to="/forgot-password" style={{ color: '#3b82f6', fontSize: '0.85rem', fontWeight: '600', textDecoration: 'none' }}>
                {t.forgotPassword}
              </Link>
            </div>

            {/* Submit */}
            <button type="submit" disabled={loading} className="animate-fade-in-up delay-400"
              style={{
                padding: '16px', borderRadius: '14px', background: loading ? '#94a3b8' : gradientBg,
                color: 'white', border: 'none', fontWeight: '700', fontSize: '1rem',
                cursor: loading ? 'not-allowed' : 'pointer', fontFamily: "'Cairo', sans-serif",
                marginTop: '4px', transition: 'all 0.3s ease',
                boxShadow: loading ? 'none' : '0 8px 25px rgba(37,99,235,0.3)',
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
                opacity: loading ? 0.7 : 1,
              }}>
              {loading ? (
                <><span style={{ width: '20px', height: '20px', borderRadius: '50%', border: '2px solid rgba(255,255,255,0.3)', borderTopColor: 'white', animation: 'spin 0.8s linear infinite' }} />{t.loggingIn}</>
              ) : (
                <><LogIn size={18} />{t.login}</>
              )}
            </button>
          </form>

          {/* Demo Buttons */}
          <div className="animate-fade-in-up delay-400" style={{ marginTop: '16px' }}>
            <p style={{ textAlign: 'center', fontSize: '0.75rem', color: textSecondary, marginBottom: '8px' }}>
              {t.demoLogin}
            </p>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
              <button type="button" onClick={() => handleDemoLogin('client')}
                style={{
                  padding: '10px', borderRadius: '10px', border: `1px solid ${borderColor}`,
                  background: 'transparent', cursor: 'pointer', color: textColor,
                  fontSize: '0.8rem', fontWeight: 600, fontFamily: "'Cairo', sans-serif",
                  transition: 'all 0.3s ease', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px',
                }}
                onMouseEnter={(e) => { e.target.style.borderColor = '#3b82f6'; e.target.style.background = darkMode ? 'rgba(59,130,246,0.1)' : '#eff6ff'; }}
                onMouseLeave={(e) => { e.target.style.borderColor = borderColor; e.target.style.background = 'transparent'; }}>
                <User size={14} />{t.demoCustomer}
              </button>
              <button type="button" onClick={() => handleDemoLogin('craftsman')}
                style={{
                  padding: '10px', borderRadius: '10px', border: `1px solid ${borderColor}`,
                  background: 'transparent', cursor: 'pointer', color: textColor,
                  fontSize: '0.8rem', fontWeight: 600, fontFamily: "'Cairo', sans-serif",
                  transition: 'all 0.3s ease', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px',
                }}
                onMouseEnter={(e) => { e.target.style.borderColor = '#f59e0b'; e.target.style.background = darkMode ? 'rgba(245,158,11,0.1)' : '#fef3c7'; }}
                onMouseLeave={(e) => { e.target.style.borderColor = borderColor; e.target.style.background = 'transparent'; }}>
                <Wrench size={14} />{t.demoCraftsman}
              </button>
            </div>
          </div>

          {/* Footer */}
          <p className="animate-fade-in-up delay-400" style={{ textAlign: 'center', marginTop: '24px', color: textSecondary, fontSize: '0.9rem' }}>
            {t.noAccount}{' '}
            <Link to="/select-role" style={{ color: '#3b82f6', fontWeight: '700', textDecoration: 'none' }}>
              {t.createAccount}
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;