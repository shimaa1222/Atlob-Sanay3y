// src/pages/VerifyEmailPage.jsx
import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTheme } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import { 
  Mail, CheckCircle, AlertCircle, RefreshCw, 
  Shield, ArrowRight, Sparkles, Send, Clock,
  Hash, Key, Star, Loader
} from 'lucide-react';

const VerifyEmailPage = () => {
  const navigate = useNavigate();
  const { darkMode } = useTheme();
  const { user } = useAuth();
  const [lang, setLang] = useState('ar');
  const [code, setCode] = useState(['', '', '', '', '', '']);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [countdown, setCountdown] = useState(0);
  const [isVerifying, setIsVerifying] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const [userEmail, setUserEmail] = useState('');
  const codeInputRefs = useRef([]);

  // ============================================================
  // ✅ مسح أي بيانات قديمة عند تحميل الصفحة
  // ============================================================
  useEffect(() => {
    // مسح أي verified_token قديم
    const oldToken = localStorage.getItem('verified_token');
    if (oldToken) {
      localStorage.removeItem('verified_token');
    }
    
    // مسح user القديم لو مش مكتمل
    const userData = JSON.parse(localStorage.getItem('user') || '{}');
    if (userData && !userData.email_verified_at) {
      // لو المستخدم مش متأكد، نمسحه
    }
  }, []);

  // ============================================================
  // 🌍 Language
  // ============================================================
  useEffect(() => {
    const savedLang = localStorage.getItem('language') || 'ar';
    setLang(savedLang);
    
    const email = user?.email || localStorage.getItem('pendingVerificationEmail') || '';
    setUserEmail(email);
    
    // لو مفيش إيميل، ارجع للتسجيل
    if (!email) {
      navigate('/signup/customer');
    }
    
    const handleLanguageChange = () => {
      const currentLang = localStorage.getItem('language') || 'ar';
      setLang(currentLang);
    };
    
    window.addEventListener('languagechange', handleLanguageChange);
    return () => window.removeEventListener('languagechange', handleLanguageChange);
  }, [user, navigate]);

  // ============================================================
  // 🎯 Auto-focus first input
  // ============================================================
  useEffect(() => {
    setTimeout(() => {
      if (codeInputRefs.current[0]) {
        codeInputRefs.current[0].focus();
      }
    }, 500);
  }, []);

  // ============================================================
  // ⏱️ Resend countdown
  // ============================================================
  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [countdown]);

  // ============================================================
  // 📝 Translations
  // ============================================================
  const t = {
    title: lang === 'ar' ? 'تأكيد البريد الإلكتروني' : 'Verify Email',
    subtitle: lang === 'ar' ? 'أدخل الكود المكون من 6 أرقام المرسل إلى بريدك الإلكتروني' : 'Enter the 6-digit code sent to your email',
    sentTo: lang === 'ar' ? 'تم إرسال الكود إلى' : 'Code sent to',
    verify: lang === 'ar' ? 'تأكيد' : 'Verify',
    verifying: lang === 'ar' ? 'جاري التحقق...' : 'Verifying...',
    wrongCode: lang === 'ar' ? 'كود التحقق غير صحيح. حاول مرة أخرى.' : 'Invalid code. Please try again.',
    fillAll: lang === 'ar' ? 'يرجى إدخال الكود كاملاً' : 'Please enter the complete code',
    success: lang === 'ar' ? 'تم تأكيد البريد بنجاح!' : 'Email verified successfully!',
    redirecting: lang === 'ar' ? 'جاري تحويلك...' : 'Redirecting...',
    noCode: lang === 'ar' ? 'لم يصلك الكود؟' : 'Didn\'t receive the code?',
    resend: lang === 'ar' ? 'إعادة الإرسال' : 'Resend',
    resendIn: lang === 'ar' ? 'إعادة الإرسال بعد' : 'Resend in',
    seconds: lang === 'ar' ? 'ثانية' : 'sec',
    codeSent: lang === 'ar' ? 'تم إرسال كود جديد!' : 'New code sent!',
    changeEmail: lang === 'ar' ? 'تغيير البريد الإلكتروني' : 'Change email',
    step: lang === 'ar' ? 'الخطوة الأخيرة' : 'Final Step',
    secure: lang === 'ar' ? 'تأكيد آمن ومشفر' : 'Secure & Encrypted Verification',
    networkError: lang === 'ar' ? 'لا يوجد اتصال بالخادم. تأكد من اتصالك بالإنترنت.' : 'No server connection. Please check your internet.',
  };

  // ============================================================
  // ✅ التحقق من OTP
  // ============================================================
  const handleVerify = async (enteredCode) => {
    setIsVerifying(true);
    setError('');

    try {
      const data = await api.verifyOtp(userEmail, enteredCode, 'register');
      
      setSuccess(true);
      
      if (data.verified_token) {
        localStorage.setItem('verified_token', data.verified_token);
      }
      
      const userData = JSON.parse(localStorage.getItem('user') || '{}');
      userData.email_verified_at = new Date().toISOString();
      localStorage.setItem('user', JSON.stringify(userData));
      
      setTimeout(() => {
        const userRole = localStorage.getItem('userRole') || 'customer';
        const targetPath = userRole === 'craftsman' ? '/craftsman/home' : '/customer/home';
        navigate(targetPath);
      }, 2000);

    } catch (err) {
      if (err.errors) {
        const errorMessages = Object.values(err.errors).flat().join(' | ');
        setError(errorMessages);
      } else if (err.message === 'NETWORK_ERROR' || err.message === 'Failed to fetch') {
        setError(t.networkError);
      } else {
        setError(err.message || t.wrongCode);
      }
      setIsVerifying(false);
      setCode(['', '', '', '', '', '']);
      setTimeout(() => {
        if (codeInputRefs.current[0]) {
          codeInputRefs.current[0].focus();
        }
      }, 100);
    }
  };

  // ============================================================
  // ⌨️ Input Handlers
  // ============================================================
  const handleInput = (index, value) => {
    if (value && !/^[0-9]$/.test(value)) return;
    
    const newCode = [...code];
    newCode[index] = value;
    setCode(newCode);
    setError('');

    if (value && index < 5) {
      codeInputRefs.current[index + 1]?.focus();
    }

    if (newCode.every(d => d !== '')) {
      const enteredCode = newCode.join('');
      handleVerify(enteredCode);
    }
  };

  const handleKeyDown = (index, e) => {
    if (e.key === 'Backspace' && !code[index] && index > 0) {
      codeInputRefs.current[index - 1]?.focus();
    }
  };

  const handlePaste = (e) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);
    if (!pastedData) return;

    const newCode = [...code];
    for (let i = 0; i < pastedData.length && i < 6; i++) {
      newCode[i] = pastedData[i];
    }
    setCode(newCode);

    if (pastedData.length === 6) {
      handleVerify(pastedData);
    } else {
      codeInputRefs.current[pastedData.length]?.focus();
    }
  };

  const handleManualVerify = () => {
    const enteredCode = code.join('');
    
    if (enteredCode.length < 6) {
      setError(t.fillAll);
      return;
    }

    handleVerify(enteredCode);
  };

  // ============================================================
  // 🔄 إعادة إرسال الكود
  // ============================================================
  const handleResend = async () => {
    if (countdown > 0) return;
    
    setIsResending(true);
    setError('');
    setSuccess(false);

    try {
      await api.sendOtp(userEmail);
      setSuccess(t.codeSent);
      setCountdown(60);
      setTimeout(() => setSuccess(false), 3000);
    } catch (err) {
      if (err.errors) {
        const errorMessages = Object.values(err.errors).flat().join(' | ');
        setError(errorMessages);
      } else if (err.message === 'NETWORK_ERROR' || err.message === 'Failed to fetch') {
        setError(t.networkError);
      } else {
        setError(err.message || 'حدث خطأ في إعادة الإرسال');
      }
    } finally {
      setIsResending(false);
    }
  };

  // ============================================================
  // 🎨 Styles
  // ============================================================
  const bgColor = darkMode ? '#0f172a' : '#f8fafc';
  const cardBg = darkMode ? '#1e293b' : '#ffffff';
  const textColor = darkMode ? '#f1f5f9' : '#0f172a';
  const textSecondary = darkMode ? '#94a3b8' : '#64748b';
  const borderColor = darkMode ? '#334155' : '#e2e8f0';
  const inputBg = darkMode ? '#0f172a' : '#f8fafc';
  const gradientBg = darkMode 
    ? 'linear-gradient(135deg, #1e3a8a, #3b82f6)'
    : 'linear-gradient(135deg, #2563eb, #3b82f6)';

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: bgColor,
      padding: '40px 20px',
      fontFamily: "'Cairo', sans-serif",
      direction: lang === 'ar' ? 'rtl' : 'ltr',
    }}>
      <style>{`
        @keyframes fadeInUp {
          from { opacity: 0; transform: translateY(20px); }
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
        
        @keyframes pulse {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.05); }
        }
        
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          25% { transform: translateX(-8px); }
          75% { transform: translateX(8px); }
        }
        
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        
        @keyframes successBounce {
          0% { transform: scale(0); }
          50% { transform: scale(1.2); }
          100% { transform: scale(1); }
        }
        
        @keyframes float {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-10px); }
        }
        
        .animate-fade-in-up { animation: fadeInUp 0.5s ease forwards; }
        .animate-fade-in { animation: fadeIn 0.3s ease forwards; }
        .animate-scale-in { animation: scaleIn 0.5s ease forwards; }
        .animate-shake { animation: shake 0.5s ease; }
        .animate-success-bounce { animation: successBounce 0.6s ease forwards; }
        
        .code-input {
          transition: all 0.3s ease;
        }
        
        .code-input:focus {
          border-color: #3b82f6 !important;
          box-shadow: 0 0 0 3px rgba(59,130,246,0.15);
          transform: translateY(-3px);
        }
        
        .code-input.filled {
          border-color: #3b82f6 !important;
          background: rgba(59,130,246,0.05);
        }
        
        .delay-100 { animation-delay: 0.1s; }
        .delay-200 { animation-delay: 0.2s; }
        .delay-300 { animation-delay: 0.3s; }
        .delay-400 { animation-delay: 0.4s; }
        
        @media (max-width: 480px) {
          .verify-card { padding: 32px 20px !important; }
          .code-grid { gap: 6px !important; }
          .code-input {
            width: 44px !important;
            height: 52px !important;
            font-size: 1.1rem !important;
          }
        }
      `}</style>

      {/* Success Overlay */}
      {isVerifying && success && (
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
        }}>
          <div className="animate-success-bounce" style={{
            background: cardBg,
            borderRadius: '20px',
            padding: '40px',
            textAlign: 'center',
            boxShadow: '0 20px 60px rgba(0,0,0,0.3)',
          }}>
            <div style={{
              width: '80px',
              height: '80px',
              borderRadius: '50%',
              background: 'linear-gradient(135deg, #059669, #10b981)',
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: '16px',
              animation: 'pulse 2s infinite',
            }}>
              <CheckCircle size={40} color="white" />
            </div>
            <p style={{
              fontSize: '1.2rem',
              fontWeight: 700,
              color: textColor,
              fontFamily: "'Cairo', sans-serif",
              marginBottom: '4px',
            }}>
              {t.success}
            </p>
            <p style={{
              fontSize: '0.9rem',
              color: textSecondary,
              fontFamily: "'Cairo', sans-serif",
            }}>
              {t.redirecting}
            </p>
          </div>
        </div>
      )}

      <div className="verify-card" style={{
        background: cardBg,
        borderRadius: '24px',
        padding: '48px 40px',
        width: '100%',
        maxWidth: '460px',
        boxShadow: darkMode 
          ? '0 25px 60px rgba(0,0,0,0.3)'
          : '0 25px 60px rgba(0,0,0,0.1)',
        border: `1px solid ${borderColor}`,
        textAlign: 'center',
      }}>
        
        {/* Step Indicator */}
        <div className="animate-fade-in" style={{
          display: 'inline-block',
          padding: '6px 16px',
          borderRadius: '20px',
          background: darkMode ? 'rgba(59,130,246,0.15)' : '#eff6ff',
          color: '#3b82f6',
          fontSize: '0.8rem',
          fontWeight: 600,
          marginBottom: '24px',
        }}>
          <Sparkles size={14} style={{ display: 'inline', marginRight: '6px' }} />
          {t.step}
        </div>

        {/* Icon */}
        <div className="animate-scale-in" style={{ marginBottom: '20px' }}>
          <div style={{
            width: '80px',
            height: '80px',
            borderRadius: '22px',
            background: gradientBg,
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 12px 30px rgba(37,99,235,0.3)',
            position: 'relative',
          }}>
            <Mail size={36} color="white" />
            
            <div className="animate-float" style={{
              position: 'absolute',
              bottom: '-6px',
              right: '-6px',
              width: '28px',
              height: '28px',
              borderRadius: '50%',
              background: '#10b981',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              border: '3px solid white',
              boxShadow: '0 4px 12px rgba(16,185,129,0.4)',
            }}>
              <Shield size={14} color="white" />
            </div>
          </div>
        </div>

        {/* Title */}
        <h1 className="animate-fade-in-up delay-100" style={{
          fontSize: '1.5rem',
          fontWeight: 700,
          color: textColor,
          marginBottom: '8px',
        }}>
          {t.title}
        </h1>
        
        {/* Subtitle */}
        <p className="animate-fade-in-up delay-200" style={{
          fontSize: '0.9rem',
          color: textSecondary,
          marginBottom: '8px',
          lineHeight: 1.6,
        }}>
          {t.subtitle}
        </p>

        {/* Email indicator */}
        <p className="animate-fade-in-up delay-200" style={{
          fontSize: '0.85rem',
          color: '#3b82f6',
          fontWeight: 600,
          marginBottom: '28px',
        }}>
          {t.sentTo}: {userEmail}
        </p>

        {/* Error Message */}
        {error && (
          <div className="animate-fade-in animate-shake" style={{
            background: darkMode ? 'rgba(220,38,38,0.1)' : '#fef2f2',
            color: '#dc2626',
            padding: '10px 16px',
            borderRadius: '12px',
            marginBottom: '16px',
            fontSize: '0.85rem',
            border: '1px solid rgba(220,38,38,0.2)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '8px',
          }}>
            <AlertCircle size={16} />
            {error}
          </div>
        )}

        {/* Success Message (for resend) */}
        {success && !isVerifying && (
          <div className="animate-fade-in" style={{
            background: darkMode ? 'rgba(5,150,105,0.1)' : '#d1fae5',
            color: '#059669',
            padding: '10px 16px',
            borderRadius: '12px',
            marginBottom: '16px',
            fontSize: '0.85rem',
            border: '1px solid rgba(5,150,105,0.2)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '8px',
          }}>
            <CheckCircle size={16} />
            {success}
          </div>
        )}

        {/* Code Inputs */}
        <div 
          className="animate-fade-in-up delay-300"
          onPaste={handlePaste}
          style={{
            display: 'flex',
            gap: '10px',
            justifyContent: 'center',
            marginBottom: '24px',
          }}
        >
          {code.map((digit, index) => (
            <input
              key={index}
              ref={el => codeInputRefs.current[index] = el}
              type="text"
              inputMode="numeric"
              maxLength={1}
              value={digit}
              onChange={(e) => handleInput(index, e.target.value)}
              onKeyDown={(e) => handleKeyDown(index, e)}
              className={`code-input ${digit ? 'filled' : ''}`}
              style={{
                width: '52px',
                height: '60px',
                border: `2px solid ${error ? '#dc2626' : digit ? '#3b82f6' : borderColor}`,
                borderRadius: '12px',
                textAlign: 'center',
                fontSize: '1.3rem',
                fontWeight: 700,
                fontFamily: "'Cairo', sans-serif",
                background: inputBg,
                color: textColor,
                outline: 'none',
              }}
            />
          ))}
        </div>

        {/* Verify Button */}
        <button
          onClick={handleManualVerify}
          disabled={isVerifying}
          className="animate-fade-in-up delay-400"
          style={{
            width: '100%',
            padding: '14px',
            borderRadius: '14px',
            background: isVerifying ? '#94a3b8' : gradientBg,
            color: 'white',
            border: 'none',
            fontWeight: 700,
            fontSize: '1rem',
            cursor: isVerifying ? 'not-allowed' : 'pointer',
            fontFamily: "'Cairo', sans-serif",
            transition: 'all 0.3s ease',
            boxShadow: isVerifying ? 'none' : '0 8px 25px rgba(37,99,235,0.3)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '8px',
          }}
        >
          {isVerifying ? (
            <>
              <Loader size={18} className="animate-spin" />
              {t.verifying}
            </>
          ) : (
            <>
              <Shield size={18} />
              {t.verify}
            </>
          )}
        </button>

        {/* Resend */}
        <div className="animate-fade-in-up delay-400" style={{
          marginTop: '20px',
          fontSize: '0.9rem',
          color: textSecondary,
        }}>
          <span>{t.noCode} </span>
          {countdown > 0 ? (
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
              <Clock size={14} />
              {t.resendIn} {countdown} {t.seconds}
            </span>
          ) : (
            <button
              onClick={handleResend}
              disabled={isResending}
              style={{
                background: 'none',
                border: 'none',
                cursor: isResending ? 'not-allowed' : 'pointer',
                color: isResending ? textSecondary : '#3b82f6',
                fontWeight: 600,
                fontSize: '0.9rem',
                fontFamily: "'Cairo', sans-serif",
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                transition: 'all 0.3s ease',
                opacity: isResending ? 0.5 : 1,
              }}
            >
              {isResending ? (
                <Loader size={14} className="animate-spin" />
              ) : (
                <RefreshCw size={14} />
              )}
              {isResending ? 'جاري...' : t.resend}
            </button>
          )}
        </div>

        {/* Security Note */}
        <div className="animate-fade-in-up delay-400" style={{
          marginTop: '20px',
          padding: '10px 16px',
          borderRadius: '10px',
          background: darkMode ? 'rgba(255,255,255,0.02)' : '#f8fafc',
          display: 'inline-flex',
          alignItems: 'center',
          gap: '8px',
          fontSize: '0.75rem',
          color: textSecondary,
          border: `1px solid ${borderColor}`,
        }}>
          <Shield size={14} style={{ color: '#10b981' }} />
          {t.secure}
        </div>
      </div>
    </div>
  );
};

export default VerifyEmailPage;