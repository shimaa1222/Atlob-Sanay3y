// src/pages/CustomerProfilePage.jsx
import React, { useState, useRef, useEffect } from 'react';
import { useTheme } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import { 
  User, Camera, Mail, Phone, MapPin, Home,
  Save, Lock, CheckCircle,
  Settings, Heart, Star, Clock, Loader,
  AlertCircle, Eye, EyeOff
} from 'lucide-react';

const CustomerProfilePage = () => {
  const { user, updateUser } = useAuth();
  const navigate = useNavigate();
  const { darkMode } = useTheme();
  const [lang, setLang] = useState('ar');
  const [activeTab, setActiveTab] = useState('info');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [avatar, setAvatar] = useState(null);
  const fileInputRef = useRef(null);

  // ✅ State لتغيير كلمة المرور
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordLoading, setPasswordLoading] = useState(false);

  const [profile, setProfile] = useState({
    firstName: user?.name?.split(' ')[0] || '',
    lastName: user?.name?.split(' ')[1] || '',
    email: user?.email || '',
    phone: '',
    city: '',
    district: '',
    address: '',
  });

  // ============================================================
  // 🌍 Language
  // ============================================================
  useEffect(() => {
    const savedLang = localStorage.getItem('language') || 'ar';
    setLang(savedLang);
    const handleLanguageChange = () => setLang(localStorage.getItem('language') || 'ar');
    window.addEventListener('languagechange', handleLanguageChange);
    return () => window.removeEventListener('languagechange', handleLanguageChange);
  }, []);

  // ============================================================
  // ✅ جلب بيانات العميل من API
  // ============================================================
  useEffect(() => {
    const loadData = async () => {
      try {
        const userData = await api.getMe();
        if (userData.user) {
          const u = userData.user;
          setProfile(prev => ({
            ...prev,
            firstName: u.name?.split(' ')[0] || '',
            lastName: u.name?.split(' ')[1] || '',
            email: u.email || '',
            phone: u.phone || '',
            city: u.city || u.address?.city || '',
            district: u.district || u.address?.district || '',
            address: u.address?.full || '',
          }));
          if (u.avatar_url) setAvatar(u.avatar_url);
        }
      } catch (error) {
        console.warn('⚠️ Using fallback data:', error);
        const savedProfile = localStorage.getItem('customerProfile');
        if (savedProfile) {
          try { setProfile(prev => ({ ...prev, ...JSON.parse(savedProfile) })); } catch {}
        }
        const savedAvatar = localStorage.getItem('customerAvatar');
        if (savedAvatar) setAvatar(savedAvatar);
      }
    };
    loadData();
  }, []);

  // ============================================================
  // 📝 Translations
  // ============================================================
  const t = {
    profile: lang === 'ar' ? 'الملف الشخصي' : 'Profile',
    customer: lang === 'ar' ? 'عميل' : 'Customer',
    personalInfo: lang === 'ar' ? 'المعلومات الشخصية' : 'Personal Info',
    settings: lang === 'ar' ? 'الإعدادات' : 'Settings',
    firstName: lang === 'ar' ? 'الاسم الأول' : 'First Name',
    lastName: lang === 'ar' ? 'الاسم الأخير' : 'Last Name',
    email: lang === 'ar' ? 'البريد الإلكتروني' : 'Email',
    phone: lang === 'ar' ? 'رقم الهاتف' : 'Phone',
    city: lang === 'ar' ? 'المدينة' : 'City',
    district: lang === 'ar' ? 'الحي' : 'District',
    address: lang === 'ar' ? 'العنوان التفصيلي' : 'Detailed Address',
    save: lang === 'ar' ? 'حفظ التغييرات' : 'Save Changes',
    saved: lang === 'ar' ? 'تم حفظ التغييرات بنجاح!' : 'Changes saved successfully!',
    changePhoto: lang === 'ar' ? 'تغيير الصورة' : 'Change Photo',
    changePassword: lang === 'ar' ? 'تغيير كلمة المرور' : 'Change Password',
    currentPassword: lang === 'ar' ? 'كلمة المرور الحالية' : 'Current Password',
    newPassword: lang === 'ar' ? 'كلمة المرور الجديدة' : 'New Password',
    confirmPassword: lang === 'ar' ? 'تأكيد كلمة المرور' : 'Confirm Password',
    change: lang === 'ar' ? 'تغيير' : 'Change',
    memberSince: lang === 'ar' ? 'عضو منذ' : 'Member since',
    error: lang === 'ar' ? 'حدث خطأ' : 'Error',
    retry: lang === 'ar' ? 'إعادة المحاولة' : 'Retry',
    passwordChanged: lang === 'ar' ? '✅ تم تغيير كلمة المرور بنجاح' : '✅ Password changed successfully',
    fillFields: lang === 'ar' ? 'يرجى ملء جميع الحقول' : 'Please fill in all fields',
    passwordMismatch: lang === 'ar' ? 'كلمات المرور غير متطابقة' : 'Passwords do not match',
    passwordMin: lang === 'ar' ? 'كلمة المرور يجب أن تكون 8 أحرف على الأقل' : 'Password must be at least 8 characters',
    loading: lang === 'ar' ? 'جاري التحميل...' : 'Loading...',
  };

  // ============================================================
  // 🎨 Handlers
  // ============================================================
  const handleChange = (e) => {
    const { name, value } = e.target;
    setProfile(prev => ({ ...prev, [name]: value }));
    if (error) setError('');
    if (success) setSuccess('');
  };

  const handleAvatarChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setAvatar(reader.result);
        localStorage.setItem('customerAvatar', reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  // ============================================================
  // ✅ حفظ الملف الشخصي
  // ============================================================
  const handleSave = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const formData = new FormData();
      if (profile.phone) formData.append('phone', profile.phone);
      if (profile.firstName && profile.lastName) {
        formData.append('name', `${profile.firstName} ${profile.lastName}`);
      }
      if (profile.city) formData.append('city', profile.city);
      if (profile.district) formData.append('district', profile.district);
      if (profile.address) formData.append('address', profile.address);
      if (avatar && avatar.startsWith('data:')) {
        const res = await fetch(avatar);
        const blob = await res.blob();
        formData.append('avatar', blob, 'avatar.jpg');
      }

      const data = await api.updateProfile(formData);
      
      if (data.user) {
        updateUser(data.user);
      }
      
      setSuccess(t.saved);
      setTimeout(() => setSuccess(''), 3000);
    } catch (error) {
      console.error('❌ Save error:', error);
      setError(error.message || 'حدث خطأ في حفظ التغييرات');
      localStorage.setItem('customerProfile', JSON.stringify(profile));
    }
    setLoading(false);
  };

  // ============================================================
  // ✅ تغيير كلمة المرور - متوافق مع الـ API
  // ============================================================
  const handleChangePassword = async (e) => {
    e.preventDefault();
    setPasswordLoading(true);
    setError('');
    setSuccess('');

    // ✅ التحقق من البيانات
    if (!currentPassword || !newPassword || !confirmPassword) {
      setError(t.fillFields);
      setPasswordLoading(false);
      return;
    }

    if (newPassword.length < 8) {
      setError(t.passwordMin);
      setPasswordLoading(false);
      return;
    }

    if (newPassword !== confirmPassword) {
      setError(t.passwordMismatch);
      setPasswordLoading(false);
      return;
    }

    try {
      // ✅ استخدام الحقول الصحيحة حسب توثيق الـ API
      // POST /api/auth/change-password
      // Body: current_password, password, password_confirmation
      await api.changePassword({
        current_password: currentPassword,
        password: newPassword,
        password_confirmation: confirmPassword,
      });
      
      setSuccess(t.passwordChanged);
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      setTimeout(() => setSuccess(''), 4000);
      
    } catch (error) {
      console.error('❌ Change password error:', error);
      
      // ✅ عرض تفاصيل الخطأ من الـ Backend
      if (error.errors) {
        const messages = Object.entries(error.errors)
          .map(([field, msgs]) => {
            const fieldNames = {
              'current_password': 'كلمة المرور الحالية',
              'password': 'كلمة المرور الجديدة',
              'password_confirmation': 'تأكيد كلمة المرور',
            };
            return `${fieldNames[field] || field}: ${msgs.join(', ')}`;
          })
          .join(' | ');
        setError(messages);
      } else {
        setError(error.message || 'حدث خطأ في تغيير كلمة المرور');
      }
    } finally {
      setPasswordLoading(false);
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
  const inputBg = darkMode ? '#0f172a' : '#ffffff';
  const errorColor = '#ef4444';
  const successColor = '#059669';

  const inputStyle = (hasError) => ({
    width: '100%',
    padding: '12px 16px',
    border: `2px solid ${hasError ? errorColor : borderColor}`,
    borderRadius: '10px',
    fontSize: '0.95rem',
    color: textColor,
    background: inputBg,
    outline: 'none',
    fontFamily: "'Cairo', sans-serif",
    transition: 'all 0.3s ease',
    textAlign: lang === 'ar' ? 'right' : 'left',
  });

  return (
    <div style={{ background: bgColor, minHeight: '100vh', fontFamily: "'Cairo', sans-serif", direction: lang === 'ar' ? 'rtl' : 'ltr' }}>
      <style>{`
        @keyframes fadeInUp { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
        .animate-fade-in-up { animation: fadeInUp 0.5s ease forwards; }
        .animate-fade-in { animation: fadeIn 0.3s ease forwards; }
        .animate-spin { animation: spin 1s linear infinite; }
        @media (max-width: 768px) { .form-grid { grid-template-columns: 1fr !important; } }
      `}</style>

      {/* ===== Hero ===== */}
      <div style={{
        background: darkMode ? 'linear-gradient(160deg, #1e3a8a, #1e40af)' : 'linear-gradient(160deg, #2563eb, #1d4ed8)',
        color: 'white', padding: '48px 0', textAlign: 'center',
      }}>
        <div style={{ maxWidth: '700px', margin: '0 auto', padding: '0 24px' }}>
          <div className="animate-fade-in-up" style={{ position: 'relative', display: 'inline-block', marginBottom: '16px' }}>
            <div style={{
              width: '100px', height: '100px', borderRadius: '50%',
              background: avatar ? 'transparent' : 'rgba(255,255,255,0.2)',
              border: '4px solid rgba(255,255,255,0.3)', overflow: 'hidden',
              margin: '0 auto', cursor: 'pointer', position: 'relative',
            }}
            onClick={() => fileInputRef.current?.click()}>
              {avatar ? (
                <img src={avatar} alt="Profile" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              ) : (
                <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '2.5rem', fontWeight: 700 }}>
                  {profile.firstName?.charAt(0) || 'ع'}
                </div>
              )}
              <div style={{
                position: 'absolute', bottom: '4px', right: '4px',
                width: '30px', height: '30px', borderRadius: '50%',
                background: '#10b981', display: 'flex', alignItems: 'center',
                justifyContent: 'center', border: '3px solid white', cursor: 'pointer',
              }}>
                <Camera size={14} color="white" />
              </div>
            </div>
            <input ref={fileInputRef} type="file" accept="image/*" onChange={handleAvatarChange} style={{ display: 'none' }} />
          </div>

          <h1 className="animate-fade-in-up delay-100" style={{ fontSize: '1.75rem', fontWeight: 700, marginBottom: '4px' }}>
            {profile.firstName} {profile.lastName}
          </h1>
          <p className="animate-fade-in-up delay-200" style={{ fontSize: '1rem', opacity: 0.85 }}>
            {t.customer}
          </p>
        </div>
      </div>

      {/* ===== Content ===== */}
      <div style={{ maxWidth: '700px', margin: '0 auto', padding: '32px 24px' }}>
        
        {/* ===== Messages ===== */}
        {error && (
          <div className="animate-fade-in" style={{
            background: darkMode ? 'rgba(220,38,38,0.1)' : '#fee2e2',
            color: errorColor,
            padding: '12px 16px',
            borderRadius: '12px',
            marginBottom: '20px',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            border: '1px solid rgba(220,38,38,0.2)',
          }}>
            <AlertCircle size={18} />
            {error}
          </div>
        )}

        {success && (
          <div className="animate-fade-in" style={{
            background: darkMode ? 'rgba(5,150,105,0.1)' : '#d1fae5',
            color: successColor,
            padding: '12px 16px',
            borderRadius: '12px',
            marginBottom: '20px',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            border: '1px solid rgba(5,150,105,0.2)',
          }}>
            <CheckCircle size={18} />
            {success}
          </div>
        )}

        {/* ===== Tabs ===== */}
        <div className="animate-fade-in-up" style={{
          display: 'flex', gap: '8px', marginBottom: '28px',
          background: cardBg, borderRadius: '14px', padding: '6px',
          border: `1px solid ${borderColor}`,
        }}>
          {[
            { id: 'info', label: t.personalInfo, icon: <User size={16} /> },
            { id: 'settings', label: t.settings, icon: <Settings size={16} /> },
          ].map(tab => (
            <button key={tab.id} onClick={() => setActiveTab(tab.id)}
              style={{
                flex: 1, padding: '12px', borderRadius: '10px',
                border: 'none', cursor: 'pointer', fontWeight: 600,
                fontSize: '0.9rem', fontFamily: "'Cairo', sans-serif",
                transition: 'all 0.3s ease',
                background: activeTab === tab.id ? '#3b82f6' : 'transparent',
                color: activeTab === tab.id ? 'white' : textColor,
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
              }}>
              {tab.icon}{tab.label}
            </button>
          ))}
        </div>

        {/* ===== Info Tab ===== */}
        {activeTab === 'info' && (
          <div className="animate-fade-in-up">
            <div style={{ background: cardBg, borderRadius: '16px', padding: '32px', border: `1px solid ${borderColor}` }}>
              <form onSubmit={handleSave}>
                <div className="form-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '20px' }}>
                  <div>
                    <label style={{ display: 'block', fontWeight: 600, color: textColor, marginBottom: '8px', fontSize: '0.85rem' }}>{t.firstName}</label>
                    <input type="text" name="firstName" value={profile.firstName} onChange={handleChange} style={inputStyle()} />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontWeight: 600, color: textColor, marginBottom: '8px', fontSize: '0.85rem' }}>{t.lastName}</label>
                    <input type="text" name="lastName" value={profile.lastName} onChange={handleChange} style={inputStyle()} />
                  </div>
                </div>

                <div className="form-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '20px' }}>
                  <div>
                    <label style={{ display: 'block', fontWeight: 600, color: textColor, marginBottom: '8px', fontSize: '0.85rem' }}>{t.email}</label>
                    <input type="email" name="email" value={profile.email} onChange={handleChange} style={inputStyle()} disabled />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontWeight: 600, color: textColor, marginBottom: '8px', fontSize: '0.85rem' }}>{t.phone}</label>
                    <input type="tel" name="phone" value={profile.phone} onChange={handleChange} style={inputStyle()} />
                  </div>
                </div>

                <div className="form-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '20px' }}>
                  <div>
                    <label style={{ display: 'block', fontWeight: 600, color: textColor, marginBottom: '8px', fontSize: '0.85rem' }}>{t.city}</label>
                    <input type="text" name="city" value={profile.city} onChange={handleChange} style={inputStyle()} />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontWeight: 600, color: textColor, marginBottom: '8px', fontSize: '0.85rem' }}>{t.district}</label>
                    <input type="text" name="district" value={profile.district} onChange={handleChange} style={inputStyle()} />
                  </div>
                </div>

                <div style={{ marginBottom: '24px' }}>
                  <label style={{ display: 'block', fontWeight: 600, color: textColor, marginBottom: '8px', fontSize: '0.85rem' }}>
                    <Home size={14} style={{ display: 'inline', marginRight: '6px' }} />
                    {t.address}
                  </label>
                  <input type="text" name="address" value={profile.address} onChange={handleChange} style={inputStyle()}
                    placeholder={lang === 'ar' ? 'رقم العمارة، اسم الشارع...' : 'Building no., street name...'}
                  />
                </div>

                <button type="submit" disabled={loading} style={{
                  padding: '14px 32px', background: loading ? '#94a3b8' : 'linear-gradient(135deg, #3b82f6, #2563eb)',
                  color: 'white', border: 'none', borderRadius: '12px', fontWeight: 700,
                  fontSize: '1rem', cursor: loading ? 'not-allowed' : 'pointer',
                  fontFamily: "'Cairo', sans-serif", display: 'flex', alignItems: 'center', gap: '8px',
                  boxShadow: loading ? 'none' : '0 4px 16px rgba(37,99,235,0.3)',
                  opacity: loading ? 0.7 : 1,
                }}>
                  {loading ? <Loader size={18} className="animate-spin" /> : <Save size={18} />}
                  {loading ? lang === 'ar' ? 'جاري الحفظ...' : 'Saving...' : t.save}
                </button>
              </form>
            </div>
          </div>
        )}

        {/* ===== Settings Tab ===== */}
        {activeTab === 'settings' && (
          <div className="animate-fade-in-up">
            {/* ===== Change Password ===== */}
            <div style={{ background: cardBg, borderRadius: '16px', padding: '32px', border: `1px solid ${borderColor}` }}>
              <h3 style={{ fontSize: '1.15rem', fontWeight: 700, color: textColor, marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Lock size={18} style={{ color: '#3b82f6' }} />{t.changePassword}
              </h3>
              
              <form onSubmit={handleChangePassword}>
                <div style={{ marginBottom: '16px' }}>
                  <label style={{ display: 'block', fontWeight: 600, color: textColor, marginBottom: '8px', fontSize: '0.85rem' }}>{t.currentPassword}</label>
                  <div style={{ position: 'relative' }}>
                    <input 
                      type={showCurrentPassword ? 'text' : 'password'} 
                      value={currentPassword}
                      onChange={(e) => setCurrentPassword(e.target.value)}
                      style={inputStyle()}
                      placeholder="••••••••"
                    />
                    <button
                      type="button"
                      onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                      style={{
                        position: 'absolute',
                        left: '12px',
                        top: '50%',
                        transform: 'translateY(-50%)',
                        background: 'none',
                        border: 'none',
                        cursor: 'pointer',
                        color: textSecondary,
                      }}
                    >
                      {showCurrentPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>
                </div>
                
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '20px' }}>
                  <div>
                    <label style={{ display: 'block', fontWeight: 600, color: textColor, marginBottom: '8px', fontSize: '0.85rem' }}>{t.newPassword}</label>
                    <div style={{ position: 'relative' }}>
                      <input 
                        type={showNewPassword ? 'text' : 'password'}
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        style={inputStyle()}
                        placeholder="••••••••"
                      />
                      <button
                        type="button"
                        onClick={() => setShowNewPassword(!showNewPassword)}
                        style={{
                          position: 'absolute',
                          left: '12px',
                          top: '50%',
                          transform: 'translateY(-50%)',
                          background: 'none',
                          border: 'none',
                          cursor: 'pointer',
                          color: textSecondary,
                        }}
                      >
                        {showNewPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                      </button>
                    </div>
                  </div>
                  <div>
                    <label style={{ display: 'block', fontWeight: 600, color: textColor, marginBottom: '8px', fontSize: '0.85rem' }}>{t.confirmPassword}</label>
                    <div style={{ position: 'relative' }}>
                      <input 
                        type={showConfirmPassword ? 'text' : 'password'}
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        style={inputStyle()}
                        placeholder="••••••••"
                      />
                      <button
                        type="button"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        style={{
                          position: 'absolute',
                          left: '12px',
                          top: '50%',
                          transform: 'translateY(-50%)',
                          background: 'none',
                          border: 'none',
                          cursor: 'pointer',
                          color: textSecondary,
                        }}
                      >
                        {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                      </button>
                    </div>
                  </div>
                </div>
                
                <button type="submit" disabled={passwordLoading} style={{
                  padding: '12px 28px',
                  background: passwordLoading ? '#94a3b8' : '#3b82f6',
                  color: 'white',
                  border: 'none',
                  borderRadius: '10px',
                  fontWeight: 600,
                  cursor: passwordLoading ? 'not-allowed' : 'pointer',
                  fontFamily: "'Cairo', sans-serif",
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  opacity: passwordLoading ? 0.7 : 1,
                }}>
                  {passwordLoading ? <Loader size={18} className="animate-spin" /> : <Lock size={18} />}
                  {passwordLoading ? lang === 'ar' ? 'جاري التغيير...' : 'Changing...' : t.change}
                </button>
              </form>
            </div>

            {/* ❌ تم إزالة زر حذف الحساب لأنه غير مدعوم في الـ Backend */}
          </div>
        )}
      </div>
    </div>
  );
};

export default CustomerProfilePage;