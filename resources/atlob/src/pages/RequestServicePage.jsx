// src/pages/RequestServicePage.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useTheme } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import ImageUploader from '../components/Upload/ImageUploader';
import { 
  Wrench, MapPin, Calendar, Clock, DollarSign,
  FileText, Camera, Send, Sparkles, User,
  Phone, Mail, ChevronRight, ArrowLeft,
  CheckCircle, AlertCircle, Loader, Star,
  Shield, Heart, Share2, Upload, X,
  MessageCircle, Briefcase, Home, Navigation,
  Compass, Layers, Zap, Bell
} from 'lucide-react';

const egyptianCities = [
  'القاهرة', 'الإسكندرية', 'الجيزة', 'حلوان', 'السادس من أكتوبر',
  'بورسعيد', 'السويس', 'الإسماعيلية', 'المنصورة', 'طنطا',
  'الزقازيق', 'بنها', 'دمنهور', 'كفر الشيخ', 'شبين الكوم',
  'الفيوم', 'بني سويف', 'المنيا', 'أسيوط', 'سوهاج',
  'قنا', 'الأقصر', 'أسوان', 'الغردقة', 'شرم الشيخ',
  'دمياط', 'مرسى مطروح', 'العاشر من رمضان'
];

const RequestServicePage = () => {
  const navigate = useNavigate();
  const { darkMode } = useTheme();
  const { user } = useAuth();
  const [lang, setLang] = useState('ar');
  const [step, setStep] = useState(1);
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');
  
  // ✅ جلب المهن من Backend
  const [crafts, setCrafts] = useState([]);
  const [loadingCrafts, setLoadingCrafts] = useState(true);

  const [formData, setFormData] = useState({
    serviceType: '',
    customService: '',
    description: '',
    city: '',
    district: '',
    address: '',
    budget: '',
    date: '',
    time: '',
    name: user?.name || '',
    phone: '',
    email: user?.email || '',
    urgency: 'medium',
    craft_id: '',
  });

  const [images, setImages] = useState([]);
  const [showCustomService, setShowCustomService] = useState(false);

  // Language
  useEffect(() => {
    const savedLang = localStorage.getItem('language') || 'ar';
    setLang(savedLang);
    const handleLanguageChange = () => setLang(localStorage.getItem('language') || 'ar');
    window.addEventListener('languagechange', handleLanguageChange);
    return () => window.removeEventListener('languagechange', handleLanguageChange);
  }, []);

  // ✅ جلب المهن من Backend
  useEffect(() => {
    const loadCrafts = async () => {
      setLoadingCrafts(true);
      try {
        const data = await api.getCrafts();
        if (data.crafts && data.crafts.length > 0) {
          setCrafts(data.crafts);
          console.log('✅ Crafts loaded from backend:', data.crafts.length);
        }
      } catch (error) {
        console.warn('⚠️ Failed to fetch crafts:', error);
      } finally {
        setLoadingCrafts(false);
      }
    };
    loadCrafts();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    
    // ✅ معالجة اختيار المهنة
    if (name === 'serviceType') {
      // البحث عن المهنة المختارة
      const selectedCraft = crafts.find(c => c.name === value);
      if (selectedCraft) {
        setFormData(prev => ({ 
          ...prev, 
          serviceType: value,
          craft_id: selectedCraft.id 
        }));
      } else if (value === 'أخرى') {
        setShowCustomService(true);
        setFormData(prev => ({ ...prev, serviceType: '', craft_id: '' }));
      } else {
        setFormData(prev => ({ ...prev, serviceType: value, craft_id: '' }));
      }
    } else if (name === 'customService') {
      setFormData(prev => ({ ...prev, [name]: value }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
    
    if (error) setError('');
  };

  const handleImagesUpload = (files) => {
    setImages(files);
  };

  const validateStep = (stepNum) => {
    if (stepNum === 1) {
      const service = showCustomService ? formData.customService : formData.serviceType;
      if (!service.trim()) return t.selectService;
      if (!formData.description.trim()) return t.enterDescription;
      // ✅ التحقق من وجود craft_id
      if (!showCustomService && !formData.craft_id) return t.selectService;
      return '';
    }
    if (stepNum === 2) {
      if (!formData.city) return t.selectCity;
      if (!formData.budget) return t.enterBudget;
      return '';
    }
    if (stepNum === 3) {
      if (!formData.name.trim()) return t.enterName;
      if (!formData.phone.trim()) return t.enterPhone;
      return '';
    }
    return '';
  };

  const handleNext = () => {
    const validationError = validateStep(step);
    if (validationError) {
      setError(validationError);
      return;
    }
    setError('');
    setStep(prev => prev + 1);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleBack = () => {
    setStep(prev => prev - 1);
    setError('');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // ✅ إرسال طلب خدمة - باستخدام api.createServicePost
  const handleSubmit = async () => {
    const validationError = validateStep(3);
    if (validationError) {
      setError(validationError);
      return;
    }

    setSubmitting(true);
    setError('');

    try {
      const service = showCustomService ? formData.customService : formData.serviceType;

      // ✅ بناء FormData للباك (يدعم رفع الصور)
      const formDataToSend = new FormData();
      formDataToSend.append('title', service);
      formDataToSend.append('description', formData.description);
      formDataToSend.append('city', formData.city);
      formDataToSend.append('location', formData.address || formData.district || formData.city);
      formDataToSend.append('budget_from', formData.budget || 0);
      formDataToSend.append('budget_to', formData.budget || 0);
      formDataToSend.append('urgency', formData.urgency || 'medium');
      
      // ✅ إرسال craft_id الصحيح من Backend
      if (showCustomService) {
        formDataToSend.append('custom_craft', formData.customService);
      } else if (formData.craft_id) {
        formDataToSend.append('craft_id', formData.craft_id);
      } else {
        // ✅ Fallback: البحث عن craft_id من الاسم
        const foundCraft = crafts.find(c => c.name === formData.serviceType);
        if (foundCraft) {
          formDataToSend.append('craft_id', foundCraft.id);
        }
      }
      
      if (formData.district) formDataToSend.append('district', formData.district);
      if (formData.date) formDataToSend.append('needed_by', formData.date);

      // ✅ إضافة الصور
      images.forEach((image) => {
        formDataToSend.append('images[]', image);
      });

      console.log('📤 Sending service post...');
      console.log('📋 craft_id:', formData.craft_id || 'custom');
      
      const data = await api.createServicePost(formDataToSend);
      console.log('✅ Service post created:', data);

      setSuccess(true);
      window.scrollTo({ top: 0, behavior: 'smooth' });

    } catch (error) {
      console.error('❌ Service post error:', error);
      
      // ✅ عرض رسائل الخطأ من Backend
      if (error.errors) {
        const messages = Object.entries(error.errors)
          .map(([field, msgs]) => {
            const fieldNames = {
              'title': 'العنوان',
              'description': 'الوصف',
              'craft_id': 'المهنة',
              'city': 'المدينة',
              'images': 'الصور',
            };
            return `${fieldNames[field] || field}: ${msgs.join(', ')}`;
          })
          .join(' | ');
        setError(messages);
      } else {
        setError(error.message || 'حدث خطأ في نشر الطلب');
      }
      
    } finally {
      setSubmitting(false);
    }
  };

  const today = new Date().toISOString().split('T')[0];
  const timeSlots = ['9:00 ص', '10:00 ص', '11:00 ص', '12:00 م', '1:00 م', '2:00 م', '3:00 م', '4:00 م', '5:00 م', '6:00 م', '7:00 م', '8:00 م'];

  // Translations
  const t = {
    title: lang === 'ar' ? 'طلب خدمة' : 'Request Service',
    subtitle: lang === 'ar' ? 'اكتب تفاصيل الخدمة اللي محتاجها وهنوصلك بأقرب حرفي' : 'Describe the service you need and we\'ll connect you with the nearest craftsman',
    step1: lang === 'ar' ? 'تفاصيل الخدمة' : 'Service Details',
    step2: lang === 'ar' ? 'الموقع والميزانية' : 'Location & Budget',
    step3: lang === 'ar' ? 'معلومات التواصل' : 'Contact Info',
    serviceType: lang === 'ar' ? 'نوع الخدمة' : 'Service Type',
    selectService: lang === 'ar' ? 'يرجى اختيار نوع الخدمة' : 'Please select service type',
    customService: lang === 'ar' ? 'اكتب نوع الخدمة' : 'Write service type',
    description: lang === 'ar' ? 'وصف المشكلة' : 'Problem Description',
    descriptionPlaceholder: lang === 'ar' ? 'اكتب تفاصيل المشكلة اللي عندك...' : 'Describe your problem in detail...',
    enterDescription: lang === 'ar' ? 'يرجى كتابة وصف المشكلة' : 'Please describe the problem',
    uploadImages: lang === 'ar' ? 'صور المشكلة (اختياري)' : 'Problem Images (Optional)',
    city: lang === 'ar' ? 'المدينة' : 'City',
    selectCity: lang === 'ar' ? 'يرجى اختيار المدينة' : 'Please select city',
    district: lang === 'ar' ? 'الحي / المنطقة' : 'District / Area',
    address: lang === 'ar' ? 'العنوان التفصيلي' : 'Detailed Address',
    addressPlaceholder: lang === 'ar' ? 'اسم الشارع، رقم العمارة، الدور...' : 'Street name, building number, floor...',
    budget: lang === 'ar' ? 'الميزانية المتوقعة' : 'Expected Budget',
    enterBudget: lang === 'ar' ? 'يرجى إدخال الميزانية' : 'Please enter budget',
    egp: lang === 'ar' ? 'ج.م' : 'EGP',
    date: lang === 'ar' ? 'التاريخ المفضل' : 'Preferred Date',
    time: lang === 'ar' ? 'الوقت المفضل' : 'Preferred Time',
    urgency: lang === 'ar' ? 'مدى الاستعجال' : 'Urgency',
    normal: lang === 'ar' ? 'عادي' : 'Normal',
    urgent: lang === 'ar' ? 'مستعجل' : 'Urgent',
    veryUrgent: lang === 'ar' ? 'طارئ جداً' : 'Very Urgent',
    name: lang === 'ar' ? 'الاسم' : 'Name',
    enterName: lang === 'ar' ? 'يرجى إدخال الاسم' : 'Please enter name',
    phone: lang === 'ar' ? 'رقم الهاتف' : 'Phone Number',
    enterPhone: lang === 'ar' ? 'يرجى إدخال رقم الهاتف' : 'Please enter phone number',
    email: lang === 'ar' ? 'البريد الإلكتروني' : 'Email',
    next: lang === 'ar' ? 'التالي' : 'Next',
    back: lang === 'ar' ? 'السابق' : 'Back',
    submit: lang === 'ar' ? 'إرسال الطلب' : 'Submit Request',
    submitting: lang === 'ar' ? 'جاري إرسال الطلب...' : 'Submitting request...',
    successTitle: lang === 'ar' ? '🎉 تم إرسال طلبك بنجاح!' : '🎉 Request Sent Successfully!',
    successText: lang === 'ar' ? 'هيتم التواصل معاك قريب من الحرفيين المتاحين. تقدر تتابع حالة طلبك في الإشعارات.' : 'Available craftsmen will contact you soon. You can track your request status in notifications.',
    viewBookings: lang === 'ar' ? '📋 عرض حجوزاتي' : '📋 View My Bookings',
    backToHome: lang === 'ar' ? 'العودة للرئيسية' : 'Back to Home',
    optional: lang === 'ar' ? 'اختياري' : 'Optional',
    required: lang === 'ar' ? 'مطلوب' : 'Required',
  };

  // Dynamic colors
  const bgColor = darkMode ? '#0f172a' : '#f8fafc';
  const cardBg = darkMode ? '#1e293b' : '#ffffff';
  const textColor = darkMode ? '#f1f5f9' : '#0f172a';
  const textSecondary = darkMode ? '#94a3b8' : '#64748b';
  const borderColor = darkMode ? '#334155' : '#e2e8f0';
  const inputBg = darkMode ? '#0f172a' : '#ffffff';
  const gradientBg = darkMode ? 'linear-gradient(135deg, #1e3a8a, #3b82f6)' : 'linear-gradient(135deg, #2563eb, #3b82f6)';

  const inputStyle = (error) => ({
    width: '100%', padding: '14px 16px',
    border: `2px solid ${error ? '#dc2626' : borderColor}`,
    borderRadius: '12px', fontSize: '0.95rem', outline: 'none',
    background: inputBg, color: textColor,
    fontFamily: "'Cairo', sans-serif", textAlign: lang === 'ar' ? 'right' : 'left',
    transition: 'all 0.3s ease',
  });

  if (success) {
    return (
      <div style={{ background: bgColor, minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px', fontFamily: "'Cairo', sans-serif", direction: lang === 'ar' ? 'rtl' : 'ltr' }}>
        <style>{`
          @keyframes successBounce { 0% { transform: scale(0); } 50% { transform: scale(1.1); } 100% { transform: scale(1); } }
          @keyframes pulse { 0%, 100% { transform: scale(1); } 50% { transform: scale(1.05); } }
          .animate-success { animation: successBounce 0.6s ease forwards; }
        `}</style>
        
        <div className="animate-success" style={{
          background: cardBg, borderRadius: '24px', padding: '48px 36px',
          maxWidth: '500px', width: '100%', textAlign: 'center',
          border: `1px solid ${borderColor}`, boxShadow: '0 20px 60px rgba(0,0,0,0.15)',
        }}>
          <div style={{ width: '80px', height: '80px', borderRadius: '50%', background: 'linear-gradient(135deg, #059669, #10b981)', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', marginBottom: '20px', animation: 'pulse 2s infinite', }}>
            <CheckCircle size={40} color="white" />
          </div>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 700, color: '#059669', marginBottom: '12px' }}>{t.successTitle}</h1>
          <p style={{ color: textSecondary, marginBottom: '28px', lineHeight: 1.8, fontSize: '0.95rem' }}>{t.successText}</p>
          
          {/* ✅ أزرار جديدة بعد إرسال الطلب */}
          <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', justifyContent: 'center' }}>
            <button
              onClick={() => navigate('/my-requests')}
              style={{
                padding: '14px 28px',
                borderRadius: '14px',
                background: '#3b82f6',
                color: 'white',
                border: 'none',
                fontWeight: 700,
                fontSize: '0.95rem',
                cursor: 'pointer',
                fontFamily: "'Cairo', sans-serif",
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                boxShadow: '0 4px 16px rgba(59,130,246,0.3)',
              }}
            >
              <Bell size={18} />
              {lang === 'ar' ? '📋 عرض طلباتي' : 'View My Requests'}
            </button>
            <Link
              to="/"
              style={{
                padding: '14px 28px',
                borderRadius: '14px',
                border: `2px solid ${borderColor}`,
                color: textColor,
                textDecoration: 'none',
                fontWeight: 600,
                fontSize: '0.95rem',
                fontFamily: "'Cairo', sans-serif",
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
              }}
            >
              <Home size={18} />
              {t.backToHome}
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={{ background: bgColor, minHeight: '100vh', fontFamily: "'Cairo', sans-serif", direction: lang === 'ar' ? 'rtl' : 'ltr' }}>
      <style>{`
        @keyframes fadeInUp { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
        @keyframes slideRight { from { opacity: 0; transform: translateX(-20px); } to { opacity: 1; transform: translateX(0); } }
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
        @keyframes pulse { 0%, 100% { transform: scale(1); } 50% { transform: scale(1.05); } }
        
        .animate-fade-in-up { animation: fadeInUp 0.5s ease forwards; }
        .animate-fade-in { animation: fadeIn 0.3s ease forwards; }
        .animate-slide-right { animation: slideRight 0.4s ease forwards; }
        .delay-100 { animation-delay: 0.1s; }
        .delay-200 { animation-delay: 0.2s; }
        .delay-300 { animation-delay: 0.3s; }
        .delay-400 { animation-delay: 0.4s; }
        
        @media (max-width: 768px) {
          .form-grid { grid-template-columns: 1fr !important; }
          .step-buttons { flex-direction: column; }
        }
      `}</style>

      {/* Header */}
      <div style={{
        background: gradientBg, color: 'white', padding: '32px 0',
        position: 'relative', overflow: 'hidden',
      }}>
        <div style={{ position: 'absolute', top: -20, right: -20, width: '120px', height: '120px', borderRadius: '50%', background: 'rgba(255,255,255,0.1)' }} />
        
        <div style={{ maxWidth: '800px', margin: '0 auto', padding: '0 24px', position: 'relative', zIndex: 1 }}>
          <div className="animate-fade-in-up" style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <button onClick={() => navigate(-1)} style={{ background: 'rgba(255,255,255,0.2)', border: 'none', color: 'white', width: '36px', height: '36px', borderRadius: '10px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <ArrowLeft size={18} />
            </button>
            <div>
              <h1 style={{ fontSize: '1.5rem', fontWeight: 700, margin: 0 }}>{t.title}</h1>
              <p style={{ fontSize: '0.85rem', opacity: 0.85, margin: '2px 0 0' }}>{t.subtitle}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Progress Steps */}
      <div style={{ maxWidth: '800px', margin: '0 auto', padding: '24px 24px 0' }}>
        <div className="animate-fade-in-up delay-100" style={{
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          gap: '8px', marginBottom: '28px',
        }}>
          {[1, 2, 3].map((s) => (
            <React.Fragment key={s}>
              <div style={{
                width: s <= step ? '36px' : '32px', height: s <= step ? '36px' : '32px',
                borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontWeight: 700, fontSize: '0.85rem', transition: 'all 0.5s ease',
                background: s <= step ? gradientBg : (darkMode ? '#334155' : '#e2e8f0'),
                color: s <= step ? 'white' : textSecondary,
              }}>
                {s < step ? <CheckCircle size={18} /> : s}
              </div>
              <span style={{ fontSize: '0.8rem', color: s <= step ? '#3b82f6' : textSecondary, fontWeight: s === step ? 700 : 400, display: 'none', }}>
                {s === 1 ? t.step1 : s === 2 ? t.step2 : t.step3}
              </span>
              {s < 3 && <div style={{ width: '40px', height: '2px', background: s < step ? '#3b82f6' : (darkMode ? '#334155' : '#e2e8f0'), transition: 'all 0.5s ease' }} />}
            </React.Fragment>
          ))}
        </div>

        <p className="animate-fade-in-up delay-200" style={{
          textAlign: 'center', fontSize: '0.9rem', fontWeight: 600,
          color: '#3b82f6', marginBottom: '24px',
        }}>
          {step === 1 ? t.step1 : step === 2 ? t.step2 : t.step3}
        </p>
      </div>

      {/* Content */}
      <div style={{ maxWidth: '800px', margin: '0 auto', padding: '0 24px 40px' }}>
        
        {/* Error */}
        {error && (
          <div className="animate-fade-in" style={{
            background: darkMode ? 'rgba(220,38,38,0.1)' : '#fef2f2',
            color: '#dc2626', padding: '12px 16px', borderRadius: '12px',
            marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '8px',
            fontSize: '0.9rem', border: '1px solid rgba(220,38,38,0.2)',
          }}>
            <AlertCircle size={18} />{error}
          </div>
        )}

        <div className="animate-fade-in-up delay-300">
          <div style={{ background: cardBg, borderRadius: '20px', padding: '32px', border: `1px solid ${borderColor}`, boxShadow: '0 4px 16px rgba(0,0,0,0.05)' }}>
            
            {/* Step 1: Service Details */}
            {step === 1 && (
              <div className="animate-slide-right">
                <div style={{ marginBottom: '24px' }}>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 700, color: textColor, marginBottom: '10px', fontSize: '1rem' }}>
                    <Wrench size={18} style={{ color: '#3b82f6' }} />
                    {t.serviceType}
                    <span style={{ color: '#dc2626', fontSize: '0.8rem' }}>*{t.required}</span>
                  </label>
                  
                  {/* ✅ استخدام المهن من Backend */}
                  {loadingCrafts ? (
                    <div style={{ padding: '12px', textAlign: 'center', color: textSecondary }}>
                      <Loader size={20} className="animate-spin" style={{ margin: '0 auto 8px' }} />
                      جاري تحميل المهن...
                    </div>
                  ) : (
                    <select name="serviceType" onChange={handleChange} value={formData.serviceType}
                      style={inputStyle()}>
                      <option value="">{lang === 'ar' ? 'اختر نوع الخدمة...' : 'Select service type...'}</option>
                      {crafts.map(craft => (
                        <option key={craft.id} value={craft.name}>{craft.name}</option>
                      ))}
                      <option value="أخرى">➕ {lang === 'ar' ? 'أخرى' : 'Other'}</option>
                    </select>
                  )}
                </div>

                {showCustomService && (
                  <div style={{ marginBottom: '24px', padding: '16px', borderRadius: '12px', background: darkMode ? 'rgba(59,130,246,0.1)' : '#eff6ff', border: '2px solid #3b82f6' }}>
                    <label style={{ display: 'block', fontWeight: 600, color: '#3b82f6', marginBottom: '8px', fontSize: '0.9rem' }}>
                      {t.customService} <span style={{ color: '#dc2626' }}>*</span>
                    </label>
                    <input type="text" name="customService" value={formData.customService} onChange={handleChange}
                      style={{ ...inputStyle(), background: 'white' }}
                      placeholder={lang === 'ar' ? 'اكتب نوع الخدمة الجديدة...' : 'Write new service type...'}
                    />
                  </div>
                )}

                <div style={{ marginBottom: '24px' }}>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 700, color: textColor, marginBottom: '10px', fontSize: '1rem' }}>
                    <FileText size={18} style={{ color: '#8b5cf6' }} />
                    {t.description}
                    <span style={{ color: '#dc2626', fontSize: '0.8rem' }}>*{t.required}</span>
                  </label>
                  <textarea name="description" value={formData.description} onChange={handleChange}
                    rows="5"
                    placeholder={t.descriptionPlaceholder}
                    style={{ ...inputStyle(), resize: 'vertical', minHeight: '120px' }}
                    onFocus={(e) => e.target.style.borderColor = '#3b82f6'}
                    onBlur={(e) => e.target.style.borderColor = borderColor}
                  />
                </div>

                {/* Image Upload */}
                <div>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 700, color: textColor, marginBottom: '12px', fontSize: '1rem' }}>
                    <Camera size={18} style={{ color: '#ec4899' }} />
                    {t.uploadImages}
                    <span style={{ color: textSecondary, fontSize: '0.8rem', fontWeight: 400 }}>({t.optional})</span>
                  </label>
                  <ImageUploader onUpload={handleImagesUpload} multiple={true} maxFiles={5} />
                </div>
              </div>
            )}

            {/* Step 2: Location & Budget */}
            {step === 2 && (
              <div className="animate-slide-right">
                <div className="form-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '20px' }}>
                  <div>
                    <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontWeight: 600, color: textColor, marginBottom: '8px', fontSize: '0.9rem' }}>
                      <MapPin size={16} style={{ color: '#ef4444' }} />
                      {t.city}
                      <span style={{ color: '#dc2626' }}>*</span>
                    </label>
                    <select name="city" value={formData.city} onChange={handleChange}
                      style={inputStyle()}>
                      <option value="">{t.selectCity}</option>
                      {egyptianCities.map(city => (
                        <option key={city} value={city}>{city}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontWeight: 600, color: textColor, marginBottom: '8px', fontSize: '0.9rem' }}>
                      <Navigation size={16} style={{ color: '#f59e0b' }} />
                      {t.district}
                    </label>
                    <input type="text" name="district" value={formData.district} onChange={handleChange}
                      style={inputStyle()}
                      placeholder={lang === 'ar' ? 'مثال: مدينة نصر' : 'Ex: Nasr City'}
                    />
                  </div>
                </div>

                <div style={{ marginBottom: '20px' }}>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontWeight: 600, color: textColor, marginBottom: '8px', fontSize: '0.9rem' }}>
                    <Home size={16} style={{ color: '#8b5cf6' }} />
                    {t.address}
                  </label>
                  <input type="text" name="address" value={formData.address} onChange={handleChange}
                    style={inputStyle()}
                    placeholder={t.addressPlaceholder}
                  />
                </div>

                <div className="form-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '20px' }}>
                  <div>
                    <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontWeight: 600, color: textColor, marginBottom: '8px', fontSize: '0.9rem' }}>
                      <DollarSign size={16} style={{ color: '#059669' }} />
                      {t.budget} ({t.egp})
                      <span style={{ color: '#dc2626' }}>*</span>
                    </label>
                    <input type="number" name="budget" value={formData.budget} onChange={handleChange}
                      style={inputStyle()}
                      placeholder={lang === 'ar' ? 'مثال: 200' : 'Ex: 200'}
                    />
                  </div>
                  <div>
                    <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontWeight: 600, color: textColor, marginBottom: '8px', fontSize: '0.9rem' }}>
                      <Zap size={16} style={{ color: '#f59e0b' }} />
                      {t.urgency}
                    </label>
                    <select name="urgency" value={formData.urgency} onChange={handleChange}
                      style={inputStyle()}>
                      <option value="low">{t.normal}</option>
                      <option value="medium">{lang === 'ar' ? 'متوسط' : 'Medium'}</option>
                      <option value="high">{t.urgent}</option>
                      <option value="emergency">{t.veryUrgent}</option>
                    </select>
                  </div>
                </div>

                <div className="form-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                  <div>
                    <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontWeight: 600, color: textColor, marginBottom: '8px', fontSize: '0.9rem' }}>
                      <Calendar size={16} style={{ color: '#3b82f6' }} />
                      {t.date}
                    </label>
                    <input type="date" name="date" value={formData.date} onChange={handleChange}
                      min={today}
                      style={inputStyle()}
                    />
                  </div>
                  <div>
                    <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontWeight: 600, color: textColor, marginBottom: '8px', fontSize: '0.9rem' }}>
                      <Clock size={16} style={{ color: '#6366f1' }} />
                      {t.time}
                    </label>
                    <select name="time" value={formData.time} onChange={handleChange}
                      style={inputStyle()}>
                      <option value="">{lang === 'ar' ? 'اختر الوقت' : 'Select time'}</option>
                      {timeSlots.map(slot => (
                        <option key={slot} value={slot}>{slot}</option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>
            )}

            {/* Step 3: Contact Info */}
            {step === 3 && (
              <div className="animate-slide-right">
                <div className="form-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '20px' }}>
                  <div>
                    <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontWeight: 600, color: textColor, marginBottom: '8px', fontSize: '0.9rem' }}>
                      <User size={16} style={{ color: '#3b82f6' }} />
                      {t.name}
                      <span style={{ color: '#dc2626' }}>*</span>
                    </label>
                    <input type="text" name="name" value={formData.name} onChange={handleChange}
                      style={inputStyle()}
                      placeholder={lang === 'ar' ? 'محمد علي' : 'Mohamed Ali'}
                    />
                  </div>
                  <div>
                    <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontWeight: 600, color: textColor, marginBottom: '8px', fontSize: '0.9rem' }}>
                      <Phone size={16} style={{ color: '#059669' }} />
                      {t.phone}
                      <span style={{ color: '#dc2626' }}>*</span>
                    </label>
                    <input type="tel" name="phone" value={formData.phone} onChange={handleChange}
                      style={inputStyle()}
                      placeholder="01xxxxxxxxx"
                    />
                  </div>
                </div>

                <div style={{ marginBottom: '24px' }}>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontWeight: 600, color: textColor, marginBottom: '8px', fontSize: '0.9rem' }}>
                    <Mail size={16} style={{ color: '#8b5cf6' }} />
                    {t.email}
                    <span style={{ color: textSecondary, fontSize: '0.8rem', fontWeight: 400 }}>({t.optional})</span>
                  </label>
                  <input type="email" name="email" value={formData.email} onChange={handleChange}
                    style={inputStyle()}
                    placeholder="example@email.com"
                  />
                </div>

                {/* Summary */}
                <div style={{ background: darkMode ? 'rgba(59,130,246,0.05)' : '#f8fafc', borderRadius: '12px', padding: '20px', border: `1px solid ${borderColor}` }}>
                  <h3 style={{ fontWeight: 700, color: textColor, marginBottom: '12px', fontSize: '0.95rem' }}>
                    {lang === 'ar' ? '📋 ملخص الطلب' : '📋 Request Summary'}
                  </h3>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', fontSize: '0.85rem', color: textSecondary }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span>{t.serviceType}:</span>
                      <span style={{ fontWeight: 600, color: textColor }}>{showCustomService ? formData.customService : formData.serviceType}</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span>{t.city}:</span>
                      <span style={{ fontWeight: 600, color: textColor }}>{formData.city} {formData.district}</span>
                    </div>
                    {formData.budget && (
                      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                        <span>{t.budget}:</span>
                        <span style={{ fontWeight: 600, color: '#059669' }}>{formData.budget} {t.egp}</span>
                      </div>
                    )}
                    {images.length > 0 && (
                      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                        <span>{lang === 'ar' ? 'صور مرفقة' : 'Attached Images'}:</span>
                        <span style={{ fontWeight: 600, color: textColor }}>{images.length} {lang === 'ar' ? 'صور' : 'images'}</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Step Buttons */}
            <div className="step-buttons" style={{ display: 'flex', gap: '12px', marginTop: '32px', justifyContent: step === 1 ? 'flex-end' : 'space-between' }}>
              {step > 1 && (
                <button onClick={handleBack}
                  style={{
                    padding: '14px 28px', borderRadius: '14px',
                    border: `2px solid ${borderColor}`, background: 'transparent',
                    cursor: 'pointer', fontWeight: 600, fontSize: '1rem',
                    color: textColor, fontFamily: "'Cairo', sans-serif",
                    transition: 'all 0.3s ease',
                  }}>
                  {t.back}
                </button>
              )}
              
              {step < 3 ? (
                <button onClick={handleNext}
                  style={{
                    padding: '14px 32px', borderRadius: '14px',
                    background: gradientBg, color: 'white', border: 'none',
                    fontWeight: 700, fontSize: '1rem', cursor: 'pointer',
                    fontFamily: "'Cairo', sans-serif", transition: 'all 0.3s ease',
                    boxShadow: '0 4px 16px rgba(37,99,235,0.3)',
                    display: 'flex', alignItems: 'center', gap: '8px',
                  }}>
                  {t.next} <ChevronRight size={18} />
                </button>
              ) : (
                <button onClick={handleSubmit} disabled={submitting}
                  style={{
                    padding: '14px 36px', borderRadius: '14px',
                    background: submitting ? '#94a3b8' : 'linear-gradient(135deg, #059669, #10b981)',
                    color: 'white', border: 'none', fontWeight: 700,
                    fontSize: '1rem', cursor: submitting ? 'not-allowed' : 'pointer',
                    fontFamily: "'Cairo', sans-serif", transition: 'all 0.3s ease',
                    boxShadow: submitting ? 'none' : '0 4px 16px rgba(5,150,105,0.3)',
                    display: 'flex', alignItems: 'center', gap: '8px',
                  }}>
                    {submitting ? (
                      <><Loader size={18} className="animate-spin" />{t.submitting}</>
                    ) : (
                      <><Send size={18} />{t.submit}</>
                    )}
                  </button>
                )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RequestServicePage;