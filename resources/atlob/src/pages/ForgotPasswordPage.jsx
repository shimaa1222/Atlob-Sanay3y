// src/pages/ForgotPasswordPage.jsx
import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useTheme } from '../context/ThemeContext';
import api from '../services/api';
import { 
  Mail, Lock, ArrowLeft, Send, 
  CheckCircle, AlertCircle, RefreshCw, Shield,
  Eye, EyeOff, Sparkles, Key, Loader
} from 'lucide-react';

const ForgotPasswordPage = () => {
  const navigate = useNavigate();
  const { darkMode } = useTheme();
  const [lang, setLang] = useState('ar');
  
  const [step, setStep] = useState('email');
  const [email, setEmail] = useState('');
  const [code, setCode] = useState(['', '', '', '', '', '']);
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const [resendTimer, setResendTimer] = useState(0);
  const [resetToken, setResetToken] = useState('');
  const [isTokenError, setIsTokenError] = useState(false);
  const codeInputRefs = useRef([]);

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

  // Resend timer
  useEffect(() => {
    if (resendTimer > 0) {
      const timer = setTimeout(() => setResendTimer(resendTimer - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [resendTimer]);

  // Translations
  const t = {
    forgotPassword: lang === 'ar' ? 'نسيت كلمة المرور' : 'Forgot Password',
    emailStep: lang === 'ar' ? 'أدخل بريدك الإلكتروني المسجل وسنرسل لك كود التحقق' : 'Enter your registered email and we will send you a verification code',
    email: lang === 'ar' ? 'البريد الإلكتروني' : 'Email Address',
    emailPlaceholder: lang === 'ar' ? 'example@email.com' : 'example@email.com',
    sendCode: lang === 'ar' ? 'إرسال كود التحقق' : 'Send Verification Code',
    sending: lang === 'ar' ? 'جاري الإرسال...' : 'Sending...',
    codeSent: lang === 'ar' ? 'تم إرسال كود التحقق إلى بريدك الإلكتروني' : 'Verification code sent to your email',
    verifyCode: lang === 'ar' ? 'تأكيد البريد' : 'Verify Email',
    codeStep: lang === 'ar' ? 'أدخل الكود المكون من 6 أرقام' : 'Enter the 6-digit code',
    sentTo: lang === 'ar' ? 'تم الإرسال إلى' : 'Sent to',
    confirmCode: lang === 'ar' ? 'تأكيد الكود' : 'Confirm Code',
    verifying: lang === 'ar' ? 'جاري التحقق...' : 'Verifying...',
    wrongCode: lang === 'ar' ? 'كود التحقق غير صحيح' : 'Invalid verification code',
    fillCode: lang === 'ar' ? 'يرجى إدخال كود التحقق كاملاً' : 'Please enter the complete code',
    newPassword: lang === 'ar' ? 'كلمة مرور جديدة' : 'New Password',
    newPasswordStep: lang === 'ar' ? 'أدخل كلمة المرور الجديدة لحسابك' : 'Enter your new password',
    password: lang === 'ar' ? 'كلمة المرور الجديدة' : 'New Password',
    confirmPassword: lang === 'ar' ? 'تأكيد كلمة المرور' : 'Confirm Password',
    changePassword: lang === 'ar' ? 'تغيير كلمة المرور' : 'Change Password',
    changing: lang === 'ar' ? 'جاري التغيير...' : 'Changing...',
    passwordMin: lang === 'ar' ? 'كلمة المرور يجب أن تكون 6 أحرف على الأقل' : 'Password must be at least 6 characters',
    passwordMismatch: lang === 'ar' ? 'كلمات المرور غير متطابقة' : 'Passwords do not match',
    passwordChanged: lang === 'ar' ? 'تم تغيير كلمة المرور بنجاح! جاري تحويلك...' : 'Password changed successfully! Redirecting...',
    resendCode: lang === 'ar' ? 'إعادة إرسال الكود' : 'Resend Code',
    resendIn: lang === 'ar' ? 'إعادة الإرسال بعد' : 'Resend in',
    seconds: lang === 'ar' ? 'ثانية' : 'sec',
    backToLogin: lang === 'ar' ? 'العودة لتسجيل الدخول' : 'Back to Login',
    step1: lang === 'ar' ? 'البريد الإلكتروني' : 'Email',
    step2: lang === 'ar' ? 'كود التحقق' : 'Verification',
    step3: lang === 'ar' ? 'كلمة جديدة' : 'New Password',
    fillEmail: lang === 'ar' ? 'يرجى إدخال البريد الإلكتروني' : 'Please enter your email',
    networkError: lang === 'ar' ? 'لا يوجد اتصال بالخادم. تأكد من اتصالك بالإنترنت.' : 'No server connection. Please check your internet.',
    
    // ✅ رسائل جديدة للخطأ البديل
    serviceUnavailable: lang === 'ar' 
      ? '⚠️ عذراً، خدمة إعادة تعيين كلمة المرور غير متاحة حالياً. يرجى التواصل مع الدعم الفني.'
      : '⚠️ Password reset service is currently unavailable. Please contact support.',
    contactSupport: lang === 'ar' ? '📧 التواصل مع الدعم' : '📧 Contact Support',
    backToLoginBtn: lang === 'ar' ? 'العودة لتسجيل الدخول' : 'Back to Login',
    tokenErrorTitle: lang === 'ar' ? 'عذراً، خدمة إعادة تعيين كلمة المرور غير متاحة' : 'Password Reset Service Unavailable',
  };

  // ============================================================
  // ✅ Step 1: إرسال OTP
  // ============================================================
  const handleSendEmail = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setIsTokenError(false);
    
    if (!email.trim()) {
      setError(t.fillEmail);
      return;
    }

    setLoading(true);
    
    try {
      const data = await api.sendOtp(email);
      
      setSuccess(data.message || t.codeSent);
      setResendTimer(60);
      
      setTimeout(() => {
        setSuccess('');
        setStep('code');
        setTimeout(() => {
          if (codeInputRefs.current[0]) {
            codeInputRefs.current[0].focus();
          }
        }, 100);
      }, 1500);
      
    } catch (err) {
      if (err.errors) {
        const errorMessages = Object.values(err.errors).flat().join(' | ');
        setError(errorMessages);
      } else if (err.message === 'NETWORK_ERROR' || err.message === 'Failed to fetch') {
        setError(t.networkError);
      } else {
        setError(err.message || 'حدث خطأ في إرسال الكود');
      }
    } finally {
      setLoading(false);
    }
  };

  // ============================================================
  // ✅ Step 2: التحقق من OTP (مع معالجة مشكلة reset_token)
  // ============================================================
  const handleVerifyCode = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setIsTokenError(false);

    const enteredCode = code.join('');
    if (enteredCode.length < 6) {
      setError(t.fillCode);
      return;
    }

    setLoading(true);
    
    try {
      const data = await api.verifyOtp(email, enteredCode, 'password_reset');
      
      // ✅ التحقق من وجود reset_token
      if (data.reset_token) {
        // ✅ يوجد token - المتابعة بشكل طبيعي
        setResetToken(data.reset_token);
        setSuccess(data.message || 'تم التحقق بنجاح');
        
        setTimeout(() => {
          setSuccess('');
          setStep('newPassword');
        }, 1000);
      } else {
        // ❌ لا يوجد reset_token - مشكلة معروفة في الباك إند
        console.warn('⚠️ No reset_token received from server. This is a known backend issue.');
        setIsTokenError(true);
        setStep('error'); // ✅ الانتقال لصفحة الخطأ البديلة
        setError(t.serviceUnavailable);
      }
      
    } catch (err) {
      if (err.errors) {
        const errorMessages = Object.values(err.errors).flat().join(' | ');
        setError(errorMessages);
      } else {
        setError(err.message || t.wrongCode);
      }
      setCode(['', '', '', '', '', '']);
      if (codeInputRefs.current[0]) {
        codeInputRefs.current[0].focus();
      }
    } finally {
      setLoading(false);
    }
  };

  // ============================================================
  // ✅ Step 3: تغيير كلمة المرور
  // ============================================================
  const handleResetPassword = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setIsTokenError(false);

    if (newPassword.length < 6) {
      setError(t.passwordMin);
      return;
    }

    if (newPassword !== confirmPassword) {
      setError(t.passwordMismatch);
      return;
    }

    setLoading(true);
    
    try {
      await api.resetPasswordWithOtp(resetToken, newPassword, confirmPassword);
      
      setSuccess(t.passwordChanged);
      setTimeout(() => {
        navigate('/login');
      }, 2000);
      
    } catch (err) {
      if (err.errors) {
        const errorMessages = Object.values(err.errors).flat().join(' | ');
        setError(errorMessages);
      } else {
        setError(err.message || 'حدث خطأ في تغيير كلمة المرور');
      }
    } finally {
      setLoading(false);
    }
  };

  // ============================================================
  // ✅ إعادة إرسال الكود
  // ============================================================
  const handleResendCode = async () => {
    if (resendTimer > 0) return;
    
    setLoading(true);
    setError('');
    setSuccess('');
    setIsTokenError(false);
    
    try {
      const data = await api.sendOtp(email);
      setSuccess(data.message || t.codeSent);
      setResendTimer(60);
      setCode(['', '', '', '', '', '']);
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      if (err.errors) {
        const errorMessages = Object.values(err.errors).flat().join(' | ');
        setError(errorMessages);
      } else {
        setError(err.message || 'حدث خطأ في إعادة الإرسال');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleCodeInput = (index, value) => {
    if (value && !/^[0-9]$/.test(value)) return;
    
    const newCode = [...code];
    newCode[index] = value;
    setCode(newCode);

    if (value && index < 5) {
      codeInputRefs.current[index + 1]?.focus();
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
    
    const lastIndex = Math.min(pastedData.length, 5);
    codeInputRefs.current[lastIndex]?.focus();
  };

  // ============================================================
  // ✅ الصفحة البديلة في حالة عدم وجود reset_token
  // ============================================================
  if (step === 'error') {
    return (
      <div style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: darkMode ? '#0f172a' : '#f8fafc',
        padding: '40px 20px',
        fontFamily: "'Cairo', sans-serif",
        direction: lang === 'ar' ? 'rtl' : 'ltr',
      }}>
        <div style={{
          background: darkMode ? '#1e293b' : '#ffffff',
          borderRadius: '24px',
          padding: '48px 40px',
          width: '100%',
          maxWidth: '440px',
          textAlign: 'center',
          boxShadow: darkMode 
            ? '0 25px 60px rgba(0,0,0,0.3)'
            : '0 25px 60px rgba(0,0,0,0.1)',
          border: `1px solid ${darkMode ? '#334155' : '#e2e8f0'}`,
        }}>
          <div style={{ fontSize: '64px', marginBottom: '16px' }}>😅</div>
          
          <h2 style={{
            fontSize: '1.3rem',
            fontWeight: 700,
            color: darkMode ? '#f1f5f9' : '#0f172a',
            marginBottom: '12px',
          }}>
            {t.tokenErrorTitle}
          </h2>
          
          <p style={{
            color: darkMode ? '#94a3b8' : '#64748b',
            fontSize: '0.95rem',
            lineHeight: 1.6,
            marginBottom: '24px',
          }}>
            {t.serviceUnavailable}
          </p>
          
          <div style={{
            padding: '12px 16px',
            background: darkMode ? 'rgba(234,179,8,0.1)' : '#fef3c7',
            borderRadius: '12px',
            border: `1px solid ${darkMode ? 'rgba(234,179,8,0.2)' : '#f59e0b'}`,
            marginBottom: '24px',
            textAlign: 'right',
          }}>
            <p style={{
              color: darkMode ? '#fbbf24' : '#92400e',
              fontSize: '0.85rem',
              margin: 0,
            }}>
              💡 {lang === 'ar' 
                ? 'نعمل على حل المشكلة. في الوقت الحالي، يمكنك التواصل مع الدعم الفني للمساعدة.'
                : 'We are working on fixing this issue. In the meantime, please contact support for assistance.'}
            </p>
          </div>
          
          <div style={{ display: 'flex', gap: '12px', flexDirection: 'column' }}>
            <button
              onClick={() => navigate('/login')}
              style={{
                width: '100%',
                padding: '14px',
                borderRadius: '14px',
                border: 'none',
                background: 'linear-gradient(135deg, #2563eb, #3b82f6)',
                color: 'white',
                fontWeight: 700,
                fontSize: '1rem',
                cursor: 'pointer',
                fontFamily: "'Cairo', sans-serif",
                transition: 'all 0.3s ease',
                boxShadow: '0 8px 25px rgba(37,99,235,0.3)',
              }}
              onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.02)'}
              onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
            >
              {t.backToLoginBtn}
            </button>
            
            <a
              href="mailto:support@atlob.com"
              style={{
                width: '100%',
                padding: '14px',
                borderRadius: '14px',
                border: `2px solid ${darkMode ? '#334155' : '#e2e8f0'}`,
                background: 'transparent',
                color: darkMode ? '#f1f5f9' : '#0f172a',
                fontWeight: 600,
                fontSize: '1rem',
                cursor: 'pointer',
                fontFamily: "'Cairo', sans-serif",
                textDecoration: 'none',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                transition: 'all 0.3s ease',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = '#3b82f6';
                e.currentTarget.style.color = '#3b82f6';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = darkMode ? '#334155' : '#e2e8f0';
                e.currentTarget.style.color = darkMode ? '#f1f5f9' : '#0f172a';
              }}
            >
              <Mail size={18} />
              {t.contactSupport}
            </a>
          </div>
        </div>
      </div>
    );
  }

  // ============================================================
  // Dynamic colors
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

  const progressPercent = step === 'email' ? 33 : step === 'code' ? 66 : 100;

  // ============================================================
  // ✅ RENDER
  // ============================================================
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
        @keyframes slideDown {
          from { opacity: 0; transform: translateY(-20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          25% { transform: translateX(-5px); }
          75% { transform: translateX(5px); }
        }
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        .animate-fade-in-up { animation: fadeInUp 0.5s ease forwards; }
        .animate-fade-in { animation: fadeIn 0.3s ease forwards; }
        .animate-slide-down { animation: slideDown 0.5s ease forwards; }
        .animate-shake { animation: shake 0.5s ease; }
        .delay-100 { animation-delay: 0.1s; }
        .delay-200 { animation-delay: 0.2s; }
        .delay-300 { animation-delay: 0.3s; }
        .delay-400 { animation-delay: 0.4s; }
        .input-focus:focus-within {
          border-color: #3b82f6 !important;
          box-shadow: 0 0 0 3px rgba(59,130,246,0.1);
        }
        .code-input:focus {
          border-color: #3b82f6 !important;
          box-shadow: 0 0 0 3px rgba(59,130,246,0.15);
          transform: translateY(-2px);
        }
        .animate-spin { animation: spin 1s linear infinite; }
        @media (max-width: 480px) {
          .forgot-card { border-radius: 20px !important; padding: 32px 20px !important; }
          .code-grid { gap: 6px !important; }
          .code-input { width: 42px !important; height: 50px !important; font-size: 1.1rem !important; }
        }
      `}</style>

      <div className="forgot-card" style={{
        background: cardBg,
        borderRadius: '24px',
        padding: '48px 40px',
        width: '100%',
        maxWidth: '440px',
        boxShadow: darkMode 
          ? '0 25px 60px rgba(0,0,0,0.3)'
          : '0 25px 60px rgba(0,0,0,0.1)',
        border: `1px solid ${borderColor}`,
      }}>
        
        {/* Progress Bar */}
        <div className="animate-fade-in" style={{
          width: '100%',
          height: '4px',
          background: darkMode ? '#334155' : '#e2e8f0',
          borderRadius: '2px',
          marginBottom: '32px',
          overflow: 'hidden',
        }}>
          <div style={{
            width: `${progressPercent}%`,
            height: '100%',
            background: gradientBg,
            borderRadius: '2px',
            transition: 'width 0.5s ease',
          }} />
        </div>

        {/* Steps Indicator */}
        <div className="animate-fade-in-up" style={{
          display: 'flex',
          justifyContent: 'center',
          gap: '8px',
          marginBottom: '28px',
        }}>
          {[1, 2, 3].map((s) => (
            <div key={s} style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
            }}>
              <div style={{
                width: s <= (step === 'email' ? 1 : step === 'code' ? 2 : 3) ? '28px' : '24px',
                height: s <= (step === 'email' ? 1 : step === 'code' ? 2 : 3) ? '28px' : '24px',
                borderRadius: '50%',
                background: s <= (step === 'email' ? 1 : step === 'code' ? 2 : 3) 
                  ? gradientBg 
                  : (darkMode ? '#334155' : '#e2e8f0'),
                color: s <= (step === 'email' ? 1 : step === 'code' ? 2 : 3) ? 'white' : textSecondary,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontWeight: 700,
                fontSize: '0.75rem',
                transition: 'all 0.5s ease',
              }}>
                {s < (step === 'email' ? 1 : step === 'code' ? 2 : 3) ? <CheckCircle size={14} /> : s}
              </div>
              {s < 3 && (
                <div style={{
                  width: '20px',
                  height: '2px',
                  background: s < (step === 'email' ? 1 : step === 'code' ? 2 : 3) ? '#3b82f6' : (darkMode ? '#334155' : '#e2e8f0'),
                  transition: 'all 0.5s ease',
                }} />
              )}
            </div>
          ))}
        </div>

        {/* Title */}
        <h1 className="animate-fade-in-up delay-100" style={{
          fontSize: '1.5rem',
          fontWeight: 700,
          color: textColor,
          textAlign: 'center',
          marginBottom: '8px',
        }}>
          {step === 'email' ? t.forgotPassword : 
           step === 'code' ? t.verifyCode : 
           t.newPassword}
        </h1>
        <p className="animate-fade-in-up delay-200" style={{
          fontSize: '0.9rem',
          color: textSecondary,
          textAlign: 'center',
          marginBottom: '28px',
          lineHeight: 1.6,
        }}>
          {step === 'email' ? t.emailStep : 
           step === 'code' ? `${t.codeStep} ${t.sentTo} ${email}` : 
           t.newPasswordStep}
        </p>

        {/* Messages */}
        {error && !isTokenError && (
          <div className="animate-fade-in animate-shake" style={{
            background: darkMode ? 'rgba(220,38,38,0.1)' : '#fef2f2',
            color: '#dc2626',
            padding: '12px 16px',
            borderRadius: '12px',
            marginBottom: '20px',
            fontSize: '0.85rem',
            border: '1px solid rgba(220,38,38,0.2)',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
          }}>
            <AlertCircle size={16} />
            {error}
          </div>
        )}

        {success && (
          <div className="animate-fade-in" style={{
            background: darkMode ? 'rgba(5,150,105,0.1)' : '#d1fae5',
            color: '#059669',
            padding: '12px 16px',
            borderRadius: '12px',
            marginBottom: '20px',
            fontSize: '0.85rem',
            border: '1px solid rgba(5,150,105,0.2)',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
          }}>
            <CheckCircle size={16} />
            {success}
          </div>
        )}

        {/* ============================================================
            Step 1: Email
            ============================================================ */}
        {step === 'email' && (
          <form onSubmit={handleSendEmail}>
            <div className="animate-fade-in-up delay-300" style={{ marginBottom: '20px' }}>
              <label style={{
                display: 'block',
                fontWeight: 600,
                color: textColor,
                marginBottom: '8px',
                fontSize: '0.85rem',
              }}>
                {t.email}
              </label>
              <div className="input-focus" style={{
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
                padding: '14px 16px',
                border: `2px solid ${borderColor}`,
                borderRadius: '14px',
                background: inputBg,
              }}>
                <Mail size={18} style={{ color: textSecondary, flexShrink: 0 }} />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder={t.emailPlaceholder}
                  style={{
                    flex: 1,
                    border: 'none',
                    outline: 'none',
                    fontSize: '0.95rem',
                    fontFamily: "'Cairo', sans-serif",
                    background: 'transparent',
                    color: textColor,
                    textAlign: lang === 'ar' ? 'right' : 'left',
                  }}
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="animate-fade-in-up delay-400"
              style={{
                width: '100%',
                padding: '14px',
                borderRadius: '14px',
                background: loading ? '#94a3b8' : gradientBg,
                color: 'white',
                border: 'none',
                fontWeight: 700,
                fontSize: '1rem',
                cursor: loading ? 'not-allowed' : 'pointer',
                fontFamily: "'Cairo', sans-serif",
                transition: 'all 0.3s ease',
                boxShadow: loading ? 'none' : '0 8px 25px rgba(37,99,235,0.3)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
              }}
            >
              {loading ? (
                <>
                  <Loader size={18} className="animate-spin" />
                  {t.sending}
                </>
              ) : (
                <>
                  <Send size={18} />
                  {t.sendCode}
                </>
              )}
            </button>
          </form>
        )}

        {/* ============================================================
            Step 2: Verification Code
            ============================================================ */}
        {step === 'code' && (
          <form onSubmit={handleVerifyCode}>
            <div className="animate-fade-in-up delay-300" style={{ marginBottom: '24px' }}>
              <div 
                className="code-grid"
                onPaste={handlePaste}
                style={{
                  display: 'flex',
                  gap: '10px',
                  justifyContent: 'center',
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
                    onChange={(e) => handleCodeInput(index, e.target.value)}
                    onKeyDown={(e) => handleKeyDown(index, e)}
                    className="code-input"
                    style={{
                      width: '52px',
                      height: '60px',
                      border: `2px solid ${digit ? '#3b82f6' : borderColor}`,
                      borderRadius: '12px',
                      textAlign: 'center',
                      fontSize: '1.3rem',
                      fontWeight: 700,
                      fontFamily: "'Cairo', sans-serif",
                      background: inputBg,
                      color: textColor,
                      outline: 'none',
                      transition: 'all 0.3s ease',
                    }}
                  />
                ))}
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="animate-fade-in-up delay-400"
              style={{
                width: '100%',
                padding: '14px',
                borderRadius: '14px',
                background: loading ? '#94a3b8' : gradientBg,
                color: 'white',
                border: 'none',
                fontWeight: 700,
                fontSize: '1rem',
                cursor: loading ? 'not-allowed' : 'pointer',
                fontFamily: "'Cairo', sans-serif",
                transition: 'all 0.3s ease',
                boxShadow: loading ? 'none' : '0 8px 25px rgba(37,99,235,0.3)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                marginBottom: '16px',
              }}
            >
              {loading ? (
                <>
                  <Loader size={18} className="animate-spin" />
                  {t.verifying}
                </>
              ) : (
                <>
                  <Shield size={18} />
                  {t.confirmCode}
                </>
              )}
            </button>

            <div style={{ textAlign: 'center' }}>
              <button
                type="button"
                onClick={handleResendCode}
                disabled={resendTimer > 0 || loading}
                style={{
                  background: 'none',
                  border: 'none',
                  cursor: resendTimer > 0 ? 'not-allowed' : 'pointer',
                  color: resendTimer > 0 ? textSecondary : '#3b82f6',
                  fontSize: '0.85rem',
                  fontWeight: 600,
                  fontFamily: "'Cairo', sans-serif",
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                  opacity: resendTimer > 0 ? 0.5 : 1,
                  transition: 'all 0.3s ease',
                }}
              >
                <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
                {resendTimer > 0 
                  ? `${t.resendIn} ${resendTimer} ${t.seconds}`
                  : t.resendCode
                }
              </button>
            </div>
          </form>
        )}

        {/* ============================================================
            Step 3: New Password
            ============================================================ */}
        {step === 'newPassword' && (
          <form onSubmit={handleResetPassword}>
            <div className="animate-fade-in-up delay-300" style={{ marginBottom: '20px' }}>
              <label style={{
                display: 'block',
                fontWeight: 600,
                color: textColor,
                marginBottom: '8px',
                fontSize: '0.85rem',
              }}>
                {t.password}
              </label>
              <div className="input-focus" style={{
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
                padding: '14px 16px',
                border: `2px solid ${borderColor}`,
                borderRadius: '14px',
                background: inputBg,
              }}>
                <Key size={18} style={{ color: textSecondary, flexShrink: 0 }} />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="••••••••"
                  style={{
                    flex: 1,
                    border: 'none',
                    outline: 'none',
                    fontSize: '0.95rem',
                    fontFamily: "'Cairo', sans-serif",
                    background: 'transparent',
                    color: textColor,
                    textAlign: lang === 'ar' ? 'right' : 'left',
                  }}
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  style={{
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    color: textSecondary,
                    padding: '4px',
                  }}
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            <div className="animate-fade-in-up delay-300" style={{ marginBottom: '20px' }}>
              <label style={{
                display: 'block',
                fontWeight: 600,
                color: textColor,
                marginBottom: '8px',
                fontSize: '0.85rem',
              }}>
                {t.confirmPassword}
              </label>
              <div className="input-focus" style={{
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
                padding: '14px 16px',
                border: `2px solid ${borderColor}`,
                borderRadius: '14px',
                background: inputBg,
              }}>
                <Lock size={18} style={{ color: textSecondary, flexShrink: 0 }} />
                <input
                  type={showConfirmPassword ? 'text' : 'password'}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="••••••••"
                  style={{
                    flex: 1,
                    border: 'none',
                    outline: 'none',
                    fontSize: '0.95rem',
                    fontFamily: "'Cairo', sans-serif",
                    background: 'transparent',
                    color: textColor,
                    textAlign: lang === 'ar' ? 'right' : 'left',
                  }}
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  style={{
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    color: textSecondary,
                    padding: '4px',
                  }}
                >
                  {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="animate-fade-in-up delay-400"
              style={{
                width: '100%',
                padding: '14px',
                borderRadius: '14px',
                background: loading ? '#94a3b8' : gradientBg,
                color: 'white',
                border: 'none',
                fontWeight: 700,
                fontSize: '1rem',
                cursor: loading ? 'not-allowed' : 'pointer',
                fontFamily: "'Cairo', sans-serif",
                transition: 'all 0.3s ease',
                boxShadow: loading ? 'none' : '0 8px 25px rgba(37,99,235,0.3)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
              }}
            >
              {loading ? (
                <>
                  <Loader size={18} className="animate-spin" />
                  {t.changing}
                </>
              ) : (
                <>
                  <Sparkles size={18} />
                  {t.changePassword}
                </>
              )}
            </button>
          </form>
        )}

        {/* Back to Login */}
        <Link
          to="/login"
          className="animate-fade-in-up delay-400"
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '6px',
            marginTop: '24px',
            color: textSecondary,
            textDecoration: 'none',
            fontSize: '0.9rem',
            fontWeight: 500,
            fontFamily: "'Cairo', sans-serif",
            transition: 'all 0.3s ease',
          }}
          onMouseEnter={(e) => { e.target.style.color = '#3b82f6'; }}
          onMouseLeave={(e) => { e.target.style.color = textSecondary; }}
        >
          <ArrowLeft size={16} />
          {t.backToLogin}
        </Link>
      </div>
    </div>
  );
};

export default ForgotPasswordPage;