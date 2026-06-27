// src/pages/BookingPage.jsx
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useTheme } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import ImageUploader from '../components/Upload/ImageUploader';
import CraftsmanMap from '../components/Map/CraftsmanMap';
import { getCityCoordinates, calculateDistance } from '../utils/location';
import { 
  Calendar, Clock, MapPin, Star, DollarSign, FileText,
  CheckCircle, ArrowLeft, ArrowRight, Camera,
  Loader, AlertCircle, Briefcase, Route, Navigation,
  Users, ChevronDown, ChevronUp, X, Wrench, User,
  Phone, MessageCircle, Award, Shield, Sparkles,
  TrendingUp, Zap, Heart, Share2, Eye, ThumbsUp
} from 'lucide-react';

const timeSlots = [
  '9:00 ص', '10:00 ص', '11:00 ص', '12:00 م',
  '1:00 م', '2:00 م', '3:00 م', '4:00 م',
  '5:00 م', '6:00 م', '7:00 م', '8:00 م'
];

const BookingPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { darkMode } = useTheme();
  const { user } = useAuth();
  const [lang, setLang] = useState('ar');
  const [craftsman, setCraftsman] = useState(null);
  const [nearbyCraftsmen, setNearbyCraftsmen] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [step, setStep] = useState(1);
  const [date, setDate] = useState('');
  const [time, setTime] = useState('');
  const [notes, setNotes] = useState('');
  const [images, setImages] = useState([]);
  const [confirmed, setConfirmed] = useState(false);
  const [error, setError] = useState('');
  const [userLocation, setUserLocation] = useState(null);
  const [showMap, setShowMap] = useState(true);
  const [showNearby, setShowNearby] = useState(false);
  const [activeTab, setActiveTab] = useState('details');

  // ========== Language ==========
  useEffect(() => {
    const savedLang = localStorage.getItem('language') || 'ar';
    setLang(savedLang);
    const handleLanguageChange = () => setLang(localStorage.getItem('language') || 'ar');
    window.addEventListener('languagechange', handleLanguageChange);
    return () => window.removeEventListener('languagechange', handleLanguageChange);
  }, []);

  // ========== Get User Location ==========
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setUserLocation({
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
          });
        },
        () => {
          setUserLocation({
            latitude: 30.0444,
            longitude: 31.2357,
          });
        }
      );
    } else {
      setUserLocation({
        latitude: 30.0444,
        longitude: 31.2357,
      });
    }
  }, []);

  // ========== Load Craftsman Data ==========
  useEffect(() => {
    const loadCraftsman = async () => {
      setLoading(true);
      try {
        const data = await api.getCraftsman(id);
        const craftsmanData = data.craftsman || data;

        // ✅ تنسيق بيانات الحرفي
        const formattedCraftsman = {
          ...craftsmanData,
          id: craftsmanData.id || parseInt(id),
          name: craftsmanData.name || `${craftsmanData.first_name || ''} ${craftsmanData.last_name || ''}`.trim() || craftsmanData.profession || 'حرفي',
          latitude: craftsmanData.latitude || craftsmanData.lat || getCityCoordinates(craftsmanData.city || 'القاهرة').lat,
          longitude: craftsmanData.longitude || craftsmanData.lng || getCityCoordinates(craftsmanData.city || 'القاهرة').lng,
          rating: craftsmanData.rating || 4.5,
          hourly_rate: craftsmanData.hourly_rate || craftsmanData.price || 150,
          city: craftsmanData.city || 'القاهرة',
          district: craftsmanData.district || '',
          phone: craftsmanData.phone || craftsmanData.phone_number || '',
          completedJobs: craftsmanData.completed_jobs || craftsmanData.completed_bookings || 0,
          yearsExperience: craftsmanData.years_exp || craftsmanData.yearsExperience || 5,
          profession: craftsmanData.profession || craftsmanData.crafts?.[0]?.name || 'حرفي',
          bio: craftsmanData.bio || craftsmanData.description || '',
        };

        setCraftsman(formattedCraftsman);

        // ✅ جلب حرفيين قريبين
        try {
          const nearbyData = await api.getNearbyCraftsmen(id, {
            lat: formattedCraftsman.latitude,
            lng: formattedCraftsman.longitude,
            radius: 50,
          });
          const nearby = (nearbyData.craftsmen || nearbyData || []).map(c => ({
            ...c,
            name: c.name || `${c.first_name || ''} ${c.last_name || ''}`.trim() || c.profession,
            latitude: c.latitude || c.lat || getCityCoordinates(c.city || 'القاهرة').lat,
            longitude: c.longitude || c.lng || getCityCoordinates(c.city || 'القاهرة').lng,
            rating: c.rating || 4.0,
            profession: c.profession || c.craft?.name || 'حرفي',
            city: c.city || 'القاهرة',
            district: c.district || '',
            distance: userLocation ? calculateDistance(
              userLocation.latitude,
              userLocation.longitude,
              c.latitude || c.lat || getCityCoordinates(c.city || 'القاهرة').lat,
              c.longitude || c.lng || getCityCoordinates(c.city || 'القاهرة').lng
            ) : null,
          }));
          setNearbyCraftsmen(nearby);
        } catch (e) {
          console.warn('Could not load nearby craftsmen:', e);
          setNearbyCraftsmen([]);
        }
      } catch (error) {
        console.warn('⚠️ Using fallback craftsman data:', error);
        const fallbackData = {
          id: parseInt(id) || 1,
          name: 'أحمد النجار',
          first_name: 'أحمد',
          last_name: 'النجار',
          profession: 'نجار',
          rating: 4.9,
          hourly_rate: 200,
          city: 'القاهرة',
          district: 'مدينة نصر',
          latitude: 30.0444,
          longitude: 31.2357,
          phone: '01001234567',
          completedJobs: 320,
          yearsExperience: 15,
          bio: 'نجار محترف خبرة 15 سنة في جميع أعمال النجارة',
        };
        setCraftsman(fallbackData);
        setNearbyCraftsmen([]);
      }
      setLoading(false);
    };
    loadCraftsman();
  }, [id, userLocation]);

  // ========== Calculate Price ==========
  // ✅ السعر من بيانات الحرفي
  const price = craftsman?.hourly_rate || craftsman?.price || 150;
  const platformFee = Math.round(price * 0.1);
  const total = price + platformFee;
  const today = new Date().toISOString().split('T')[0];

  // ============================================================
  // ✅ دوال رفع الصور
  // ============================================================

  const uploadMultipleImages = async (files, type = 'post_image') => {
    setSubmitting(true);
    setError('');

    try {
      const data = await api.uploadMultiple(files, type);
      return data;
    } catch (error) {
      console.error('❌ Upload multiple error:', error);
      setError(error.message || 'حدث خطأ في رفع الصور');
      return null;
    } finally {
      setSubmitting(false);
    }
  };

  const handleImageUpload = async (files) => {
    if (!files || files.length === 0) return;
    
    try {
      const newImages = files.map(file => ({
        id: Date.now() + Math.random(),
        url: URL.createObjectURL(file),
        name: file.name,
        date: new Date().toISOString(),
      }));
      setImages(prev => [...prev, ...newImages]);
      
      const result = await uploadMultipleImages(files, 'booking');
      
      if (result && result.uploads) {
        const uploadedImages = result.uploads.map((img, index) => ({
          id: img.id || Date.now() + Math.random(),
          url: img.url || img.path,
          name: img.name || 'صورة',
          date: new Date().toISOString(),
        }));
        setImages(prev => {
          const tempIds = newImages.map(img => img.id);
          return prev.filter(img => !tempIds.includes(img.id));
        });
        setImages(prev => [...prev, ...uploadedImages]);
      }
      
    } catch (error) {
      console.error('❌ Image upload error:', error);
    }
  };

  const removeImage = (id) => {
    setImages(prev => prev.filter(img => img.id !== id));
  };

  // ========== Translations ==========
  const t = {
    bookAppointment: lang === 'ar' ? 'حجز موعد' : 'Book Appointment',
    date: lang === 'ar' ? 'التاريخ' : 'Date',
    time: lang === 'ar' ? 'الوقت' : 'Time',
    notes: lang === 'ar' ? 'ملاحظات (اختياري)' : 'Notes (Optional)',
    next: lang === 'ar' ? 'التالي' : 'Next',
    back: lang === 'ar' ? 'رجوع' : 'Back',
    confirm: lang === 'ar' ? 'تأكيد الحجز' : 'Confirm Booking',
    servicePrice: lang === 'ar' ? 'سعر الخدمة' : 'Service Price',
    platformFee: lang === 'ar' ? 'رسوم المنصة' : 'Platform Fee',
    total: lang === 'ar' ? 'الإجمالي' : 'Total',
    egp: lang === 'ar' ? 'ج.م' : 'EGP',
    successTitle: lang === 'ar' ? '🎉 تم تأكيد الحجز!' : '🎉 Booking Confirmed!',
    successText: (name) => lang === 'ar' ? `سيصل ${name} في الموعد المحدد` : `${name} will arrive on time`,
    viewBookings: lang === 'ar' ? 'عرض حجوزاتي' : 'View My Bookings',
    backToHome: lang === 'ar' ? 'العودة للرئيسية' : 'Back to Home',
    selectDate: lang === 'ar' ? 'يرجى اختيار التاريخ' : 'Please select a date',
    selectTime: lang === 'ar' ? 'يرجى اختيار الوقت' : 'Please select a time',
    services: lang === 'ar' ? 'الخدمات المتاحة' : 'Available Services',
    hourlyRate: lang === 'ar' ? 'السعر بالساعة' : 'Hourly Rate',
    location: lang === 'ar' ? 'موقع الحرفي' : 'Craftsman Location',
    nearby: lang === 'ar' ? 'حرفيون قريبون' : 'Nearby Craftsmen',
    distance: lang === 'ar' ? 'المسافة' : 'Distance',
    viewOnMap: lang === 'ar' ? 'عرض على الخريطة' : 'View on Map',
    hideMap: lang === 'ar' ? 'إخفاء الخريطة' : 'Hide Map',
    showNearby: lang === 'ar' ? 'عرض الحرفيين القريبين' : 'Show Nearby Craftsmen',
    noNearby: lang === 'ar' ? 'لا يوجد حرفيين قريبين' : 'No nearby craftsmen',
    km: lang === 'ar' ? 'كم' : 'km',
    viewProfile: lang === 'ar' ? 'عرض الملف' : 'View Profile',
    bookNow: lang === 'ar' ? 'احجز الآن' : 'Book Now',
    craftsmanLocation: lang === 'ar' ? 'موقع الحرفي' : 'Craftsman Location',
    yourLocation: lang === 'ar' ? 'موقعك' : 'Your Location',
    about: lang === 'ar' ? 'نبذة عن الحرفي' : 'About Craftsman',
    details: lang === 'ar' ? 'تفاصيل الحجز' : 'Booking Details',
    location: lang === 'ar' ? 'الموقع' : 'Location',
    reviews: lang === 'ar' ? 'التقييمات' : 'Reviews',
    pricePerHour: lang === 'ar' ? 'للساعة' : '/hour',
  };

  // ========== Handlers ==========
  const handleNext = () => {
    if (!date) { setError(t.selectDate); return; }
    if (!time) { setError(t.selectTime); return; }
    setError('');
    setStep(2);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // ✅ دالة تأكيد الحجز - متوافقة مع Backend
  const handleConfirm = async () => {
    setSubmitting(true);
    setError('');
    try {
      // ✅ بناء البيانات حسب توثيق الـ API
      const bookingData = {
        craftsman_id: parseInt(id),
        booking_date: date,
        booking_time: time,
        notes: notes || '',
        location: `${craftsman?.city || ''} ${craftsman?.district || ''}`.trim() || 'غير محدد',
        service_title: craftsman?.profession || 'خدمة منزلية',
      };

      console.log('📤 [BookingPage] Sending booking data:', bookingData);

      // ✅ استدعاء API
      const data = await api.createBooking(bookingData);
      console.log('✅ [BookingPage] Booking successful:', data);
      
      // ✅ تخزين إشارة التحديث
      localStorage.setItem('refreshBookings', 'true');
      
      setConfirmed(true);
      window.scrollTo({ top: 0, behavior: 'smooth' });
      
    } catch (error) {
      console.error('❌ [BookingPage] Booking error:', error);
      
      // ✅ عرض رسائل الخطأ من Backend
      if (error.errors) {
        const errorMessages = Object.entries(error.errors)
          .map(([field, messages]) => {
            const fieldNames = {
              'craftsman_id': 'الحرفي',
              'booking_date': 'التاريخ',
              'booking_time': 'الوقت',
              'service_title': 'عنوان الخدمة',
              'notes': 'الملاحظات',
              'location': 'الموقع',
            };
            return `${fieldNames[field] || field}: ${messages.join(', ')}`;
          })
          .join(' | ');
        setError(errorMessages);
      } else {
        setError(error.message || 'حدث خطأ في إنشاء الحجز');
      }
      setSubmitting(false);
    }
  };

  const handleCraftsmanClick = (craftsman) => {
    navigate(`/craftsman/${craftsman.id}`);
  };

  const handleDirectionsClick = (location) => {
    window.open(`https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(location)}`);
  };

  const handlePhoneClick = (phone) => {
    if (phone) {
      window.location.href = `tel:${phone}`;
    }
  };

  // ========== Styles ==========
  const bgColor = darkMode ? '#0f172a' : '#f8fafc';
  const cardBg = darkMode ? '#1e293b' : '#ffffff';
  const textColor = darkMode ? '#f1f5f9' : '#0f172a';
  const textSecondary = darkMode ? '#94a3b8' : '#64748b';
  const borderColor = darkMode ? '#334155' : '#e2e8f0';
  const inputBg = darkMode ? '#0f172a' : '#ffffff';
  const gradientBg = darkMode ? 'linear-gradient(135deg, #1e3a8a, #3b82f6)' : 'linear-gradient(135deg, #2563eb, #3b82f6)';

  // ========== Loading State ==========
  if (loading) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: bgColor, fontFamily: "'Cairo', sans-serif" }}>
        <Loader size={40} style={{ color: '#3b82f6', animation: 'spin 1s linear infinite' }} />
      </div>
    );
  }

  // ========== Success State ==========
  if (confirmed) {
    return (
      <div style={{ background: bgColor, minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px', fontFamily: "'Cairo', sans-serif", direction: lang === 'ar' ? 'rtl' : 'ltr' }}>
        <div style={{ background: cardBg, borderRadius: '24px', padding: '48px 36px', maxWidth: '500px', width: '100%', textAlign: 'center', border: `1px solid ${borderColor}` }}>
          <div style={{ width: '80px', height: '80px', borderRadius: '50%', background: 'linear-gradient(135deg, #059669, #10b981)', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', marginBottom: '20px' }}>
            <CheckCircle size={40} color="white" />
          </div>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 700, color: '#059669', marginBottom: '12px' }}>{t.successTitle}</h1>
          <p style={{ color: textSecondary, marginBottom: '24px' }}>{t.successText(craftsman?.name || craftsman?.first_name || 'الحرفي')}</p>
          
          <div style={{ 
            background: darkMode ? 'rgba(59,130,246,0.1)' : '#eff6ff', 
            borderRadius: '12px', 
            padding: '16px',
            marginBottom: '24px',
            textAlign: 'left',
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', color: textSecondary }}>
              <span>{t.date}</span>
              <span style={{ fontWeight: 600, color: textColor }}>{date}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', color: textSecondary, marginTop: '4px' }}>
              <span>{t.time}</span>
              <span style={{ fontWeight: 600, color: textColor }}>{time}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', color: textSecondary, marginTop: '4px' }}>
              <span>{t.total}</span>
              <span style={{ fontWeight: 700, color: '#059669' }}>{total} {t.egp}</span>
            </div>
          </div>
          
          <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', justifyContent: 'center' }}>
            <button
              onClick={() => {
                localStorage.removeItem('refreshBookings');
                navigate('/my-bookings');
              }}
              style={{
                padding: '12px 28px',
                borderRadius: '12px',
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
              📋 {t.viewBookings}
            </button>
            <Link
              to="/"
              style={{
                padding: '12px 28px',
                borderRadius: '12px',
                background: gradientBg,
                color: 'white',
                textDecoration: 'none',
                fontWeight: 700,
                fontSize: '0.95rem',
                fontFamily: "'Cairo', sans-serif",
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
              }}
            >
              <ArrowRight size={18} />{t.backToHome}
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // ========== Main Render ==========
  return (
    <div style={{ background: bgColor, minHeight: '100vh', fontFamily: "'Cairo', sans-serif", direction: lang === 'ar' ? 'rtl' : 'ltr' }}>
      <style>{`
        @keyframes fadeInUp { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
        .animate-fade-in-up { animation: fadeInUp 0.5s ease forwards; }
        .time-slot { transition: all 0.3s ease; }
        .time-slot:hover { transform: translateY(-2px); }
        .animate-spin { animation: spin 1s linear infinite; }
        .tab-active::after { 
          content: ''; 
          position: absolute; 
          bottom: -2px; 
          left: 0; 
          right: 0; 
          height: 3px; 
          background: #3b82f6; 
          border-radius: 3px 3px 0 0; 
        }
        @media (max-width: 768px) { 
          .booking-grid { grid-template-columns: 1fr !important; }
          .map-container { height: 250px !important; }
          .tabs-container { overflow-x: auto; }
        }
      `}</style>

      {/* ===== Header ===== */}
      <div style={{ background: gradientBg, color: 'white', padding: '32px 0' }}>
        <div style={{ maxWidth: '1100px', margin: '0 auto', padding: '0 24px' }}>
          <div className="animate-fade-in-up" style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <button onClick={() => navigate(-1)} style={{ background: 'rgba(255,255,255,0.2)', border: 'none', color: 'white', width: '36px', height: '36px', borderRadius: '10px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <ArrowLeft size={18} />
            </button>
            <div>
              <h1 style={{ fontSize: '1.5rem', fontWeight: 700, margin: 0 }}>{t.bookAppointment}</h1>
              <p style={{ fontSize: '0.8rem', opacity: 0.85 }}>● {lang === 'ar' ? 'الخطوة' : 'Step'} {step}/2</p>
            </div>
          </div>
        </div>
      </div>

      {/* ===== Craftsman Info Banner ===== */}
      <div style={{ 
        maxWidth: '1100px', 
        margin: '0 auto', 
        padding: '16px 24px',
        display: 'flex',
        alignItems: 'center',
        gap: '16px',
        flexWrap: 'wrap',
      }}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
          background: cardBg,
          padding: '12px 20px',
          borderRadius: '12px',
          border: `1px solid ${borderColor}`,
          flex: 1,
        }}>
          <div style={{
            width: '44px',
            height: '44px',
            borderRadius: '50%',
            background: gradientBg,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'white',
            fontWeight: 700,
            fontSize: '1.2rem',
          }}>
            {craftsman?.name?.charAt(0) || 'ح'}
          </div>
          <div>
            <div style={{ fontWeight: 700, color: textColor }}>{craftsman?.name}</div>
            <div style={{ fontSize: '0.85rem', color: '#3b82f6', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Wrench size={14} />
              {craftsman?.profession}
            </div>
          </div>
          <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: '12px', fontSize: '0.8rem', color: textSecondary }}>
            <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
              <Star size={14} fill="#f59e0b" color="#f59e0b" />
              {craftsman?.rating || 'جديد'}
            </span>
            <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
              <MapPin size={14} color="#ef4444" />
              {craftsman?.city}
            </span>
            {/* ✅ عرض السعر في البانر */}
            <span style={{ 
              display: 'flex', 
              alignItems: 'center', 
              gap: '4px',
              fontWeight: 700,
              color: '#059669',
              background: 'rgba(5,150,105,0.1)',
              padding: '4px 12px',
              borderRadius: '20px',
            }}>
              <DollarSign size={14} />
              {price} {t.egp}
              <span style={{ fontSize: '0.65rem', fontWeight: 400, color: textSecondary }}>
                {t.pricePerHour}
              </span>
            </span>
          </div>
        </div>
      </div>

      {/* ===== Content ===== */}
      <div style={{ maxWidth: '1100px', margin: '0 auto', padding: '16px 24px 32px' }}>
        {error && (
          <div style={{ background: darkMode ? 'rgba(220,38,38,0.1)' : '#fef2f2', color: '#dc2626', padding: '12px 16px', borderRadius: '12px', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '8px', border: '1px solid rgba(220,38,38,0.2)' }}>
            <AlertCircle size={18} />{error}
          </div>
        )}

        <div className="booking-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 340px', gap: '24px' }}>
          {/* ===== Main Form ===== */}
          <div>
            {/* ===== Tabs ===== */}
            <div className="tabs-container" style={{ 
              display: 'flex', 
              gap: '4px', 
              marginBottom: '24px', 
              borderBottom: `2px solid ${borderColor}`, 
              overflowX: 'auto' 
            }}>
              {['details', 'about', 'location'].map(tab => (
                <button 
                  key={tab} 
                  onClick={() => setActiveTab(tab)} 
                  className={activeTab === tab ? 'tab-active' : ''} 
                  style={{ 
                    padding: '12px 24px', 
                    border: 'none', 
                    background: 'transparent', 
                    cursor: 'pointer', 
                    fontWeight: activeTab === tab ? 700 : 500, 
                    fontSize: '0.95rem', 
                    color: activeTab === tab ? '#3b82f6' : textSecondary, 
                    fontFamily: "'Cairo', sans-serif", 
                    whiteSpace: 'nowrap', 
                    position: 'relative' 
                  }}
                >
                  {tab === 'details' && '📋 '}
                  {tab === 'about' && '👤 '}
                  {tab === 'location' && '📍 '}
                  {tab === 'details' ? t.details : tab === 'about' ? t.about : t.location}
                </button>
              ))}
            </div>

            {/* ===== Tab: Details ===== */}
            {activeTab === 'details' && (
              <div className="animate-fade-in-up" style={{ background: cardBg, borderRadius: '16px', padding: '28px', border: `1px solid ${borderColor}` }}>
                <h2 style={{ fontSize: '1.2rem', fontWeight: 700, color: textColor, marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Calendar size={20} style={{ color: '#3b82f6' }} />
                  {lang === 'ar' ? 'اختر التاريخ والوقت' : 'Select Date & Time'}
                </h2>

                {/* ===== Price Display ===== */}
                <div style={{ marginBottom: '20px' }}>
                  <label style={{ display: 'block', fontWeight: 600, color: textColor, marginBottom: '8px' }}>
                    <DollarSign size={14} style={{ display: 'inline', marginLeft: '6px' }} />
                    {lang === 'ar' ? 'السعر' : 'Price'}
                  </label>
                  
                  <div style={{
                    padding: '14px 16px',
                    border: `2px solid ${borderColor}`,
                    borderRadius: '12px',
                    background: inputBg,
                    color: textColor,
                    fontSize: '1.1rem',
                    fontWeight: 700,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    fontFamily: "'Cairo', sans-serif",
                  }}>
                    <span>{price} {t.egp}</span>
                    <span style={{ fontSize: '0.8rem', fontWeight: 400, color: textSecondary }}>
                      ({t.hourlyRate})
                    </span>
                  </div>
                  
                  <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    fontSize: '0.85rem',
                    color: textSecondary,
                    marginTop: '8px',
                    padding: '8px 0',
                    borderBottom: `1px solid ${borderColor}`,
                  }}>
                    <span>{t.platformFee} (10%)</span>
                    <span>+ {platformFee} {t.egp}</span>
                  </div>
                  
                  <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    fontSize: '1.1rem',
                    fontWeight: 700,
                    color: '#059669',
                    marginTop: '8px',
                    paddingTop: '8px',
                  }}>
                    <span>{t.total}</span>
                    <span>{total} {t.egp}</span>
                  </div>
                </div>

                {/* ===== Date ===== */}
                <div style={{ marginBottom: '20px' }}>
                  <label style={{ display: 'block', fontWeight: 600, color: textColor, marginBottom: '8px' }}>
                    <Calendar size={14} style={{ display: 'inline', marginLeft: '6px' }} />
                    {t.date} <span style={{ color: '#dc2626' }}>*</span>
                  </label>
                  <input 
                    type="date" 
                    value={date} 
                    onChange={(e) => setDate(e.target.value)} 
                    min={today}
                    style={{
                      width: '100%',
                      padding: '14px',
                      border: `2px solid ${borderColor}`,
                      borderRadius: '12px',
                      fontSize: '0.95rem',
                      background: inputBg,
                      color: textColor,
                      fontFamily: "'Cairo', sans-serif",
                      textAlign: lang === 'ar' ? 'right' : 'left',
                    }}
                  />
                  {date && (
                    <p style={{ fontSize: '0.8rem', color: '#059669', marginTop: '4px' }}>
                      ✅ {lang === 'ar' ? 'التاريخ المختار:' : 'Selected date:'} {date}
                    </p>
                  )}
                </div>

                {/* ===== Time ===== */}
                <div style={{ marginBottom: '20px' }}>
                  <label style={{ display: 'block', fontWeight: 600, color: textColor, marginBottom: '12px' }}>
                    <Clock size={14} style={{ display: 'inline', marginLeft: '6px' }} />
                    {t.time} <span style={{ color: '#dc2626' }}>*</span>
                  </label>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(90px, 1fr))', gap: '8px' }}>
                    {timeSlots.map(slot => (
                      <button 
                        key={slot} 
                        onClick={() => setTime(slot)} 
                        className="time-slot"
                        style={{
                          padding: '12px 8px',
                          borderRadius: '12px',
                          border: time === slot ? '2px solid #3b82f6' : `2px solid ${borderColor}`,
                          background: time === slot ? (darkMode ? 'rgba(59,130,246,0.15)' : '#eff6ff') : 'transparent',
                          cursor: 'pointer',
                          fontSize: '0.85rem',
                          fontWeight: time === slot ? 700 : 500,
                          color: time === slot ? '#3b82f6' : textColor,
                          fontFamily: "'Cairo', sans-serif",
                          transition: 'all 0.3s ease',
                        }}
                      >
                        {slot}
                      </button>
                    ))}
                  </div>
                  {time && (
                    <p style={{ fontSize: '0.8rem', color: '#059669', marginTop: '8px' }}>
                      ✅ {lang === 'ar' ? 'الوقت المختار:' : 'Selected time:'} {time}
                    </p>
                  )}
                </div>

                {/* ===== Notes ===== */}
                <div style={{ marginBottom: '20px' }}>
                  <label style={{ display: 'block', fontWeight: 600, color: textColor, marginBottom: '8px' }}>
                    <FileText size={14} style={{ display: 'inline', marginLeft: '6px' }} />
                    {t.notes}
                  </label>
                  <textarea 
                    value={notes} 
                    onChange={(e) => setNotes(e.target.value)} 
                    rows="3"
                    placeholder={lang === 'ar' ? 'أي تفاصيل إضافية عن الخدمة المطلوبة...' : 'Any additional details about the service...'}
                    style={{
                      width: '100%',
                      padding: '14px',
                      border: `2px solid ${borderColor}`,
                      borderRadius: '12px',
                      fontSize: '0.95rem',
                      background: inputBg,
                      color: textColor,
                      fontFamily: "'Cairo', sans-serif",
                      textAlign: lang === 'ar' ? 'right' : 'left',
                      resize: 'vertical',
                      minHeight: '80px',
                    }}
                  />
                </div>

                {/* ===== Image Upload ===== */}
                <div style={{ marginBottom: '20px' }}>
                  <label style={{ display: 'block', fontWeight: 600, color: textColor, marginBottom: '8px' }}>
                    <Camera size={14} style={{ display: 'inline', marginLeft: '6px' }} />
                    {lang === 'ar' ? 'صور إضافية (اختياري)' : 'Additional Images (Optional)'}
                  </label>
                  
                  <ImageUploader 
                    onUpload={handleImageUpload}
                    multiple={true}
                    maxFiles={5}
                    type="booking"
                    autoUpload={true}
                  />
                  
                  {images.length > 0 && (
                    <div style={{
                      display: 'grid',
                      gridTemplateColumns: 'repeat(auto-fill, minmax(80px, 1fr))',
                      gap: '8px',
                      marginTop: '12px',
                    }}>
                      {images.map((img) => (
                        <div key={img.id} style={{
                          position: 'relative',
                          borderRadius: '8px',
                          overflow: 'hidden',
                          height: '80px',
                          border: `1px solid ${borderColor}`,
                        }}>
                          <img 
                            src={img.url} 
                            alt={img.name}
                            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                          />
                          <button
                            onClick={() => removeImage(img.id)}
                            style={{
                              position: 'absolute',
                              top: '4px',
                              right: '4px',
                              width: '20px',
                              height: '20px',
                              borderRadius: '50%',
                              background: 'rgba(220,38,38,0.9)',
                              color: 'white',
                              border: 'none',
                              cursor: 'pointer',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              fontSize: '0.7rem',
                            }}
                          >
                            <X size={12} />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <button 
                  onClick={handleNext} 
                  style={{
                    width: '100%',
                    padding: '16px',
                    borderRadius: '14px',
                    background: gradientBg,
                    color: 'white',
                    border: 'none',
                    fontWeight: 700,
                    fontSize: '1.05rem',
                    cursor: 'pointer',
                    fontFamily: "'Cairo', sans-serif",
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '8px',
                    boxShadow: '0 4px 16px rgba(59,130,246,0.3)',
                  }}
                >
                  {t.next} <ArrowRight size={18} />
                </button>
              </div>
            )}

            {/* ===== Tab: About ===== */}
            {activeTab === 'about' && (
              <div className="animate-fade-in-up" style={{ background: cardBg, borderRadius: '16px', padding: '28px', border: `1px solid ${borderColor}` }}>
                <h2 style={{ fontSize: '1.2rem', fontWeight: 700, color: textColor, marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <User size={20} style={{ color: '#3b82f6' }} />
                  {t.about}
                </h2>
                <p style={{ color: textSecondary, lineHeight: 2, fontSize: '0.95rem' }}>
                  {craftsman?.bio || 'لم يضف نبذة تعريفية بعد'}
                </p>
                <div style={{ marginTop: '16px', display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                  <span style={{ padding: '6px 14px', borderRadius: '20px', background: darkMode ? 'rgba(59,130,246,0.1)' : '#eff6ff', color: '#3b82f6', fontSize: '0.85rem', fontWeight: 500, border: '1px solid rgba(59,130,246,0.2)' }}>
                    <Award size={14} style={{ display: 'inline', marginRight: '4px' }} />
                    {craftsman?.yearsExperience || 0} {lang === 'ar' ? 'سنوات خبرة' : 'Years Exp'}
                  </span>
                  <span style={{ padding: '6px 14px', borderRadius: '20px', background: darkMode ? 'rgba(59,130,246,0.1)' : '#eff6ff', color: '#3b82f6', fontSize: '0.85rem', fontWeight: 500, border: '1px solid rgba(59,130,246,0.2)' }}>
                    <CheckCircle size={14} style={{ display: 'inline', marginRight: '4px' }} />
                    {craftsman?.completedJobs || 0} {lang === 'ar' ? 'خدمة مكتملة' : 'Completed Jobs'}
                  </span>
                  <span style={{ padding: '6px 14px', borderRadius: '20px', background: darkMode ? 'rgba(59,130,246,0.1)' : '#eff6ff', color: '#3b82f6', fontSize: '0.85rem', fontWeight: 500, border: '1px solid rgba(59,130,246,0.2)' }}>
                    <Shield size={14} style={{ display: 'inline', marginRight: '4px' }} />
                    {lang === 'ar' ? 'موثق' : 'Verified'}
                  </span>
                </div>
              </div>
            )}

            {/* ===== Tab: Location ===== */}
            {activeTab === 'location' && (
              <div className="animate-fade-in-up">
                <CraftsmanMap
                  craftsman={{
                    id: craftsman.id,
                    name: craftsman.name || `${craftsman.first_name || ''} ${craftsman.last_name || ''}`.trim(),
                    latitude: craftsman.latitude || 30.0444,
                    longitude: craftsman.longitude || 31.2357,
                    city: craftsman.city,
                    district: craftsman.district,
                    rating: craftsman.rating,
                    phone: craftsman.phone,
                    profession: craftsman.profession,
                  }}
                  nearbyCraftsmen={nearbyCraftsmen}
                  userLocation={userLocation}
                  onCraftsmanClick={handleCraftsmanClick}
                  onDirectionsClick={handleDirectionsClick}
                  onPhoneClick={handlePhoneClick}
                />
              </div>
            )}
          </div>

          {/* ===== Sidebar ===== */}
          <div style={{ position: 'sticky', top: '84px', alignSelf: 'start' }}>
            {/* ===== Price Summary ===== */}
            <div style={{ background: cardBg, borderRadius: '16px', padding: '24px', border: `1px solid ${borderColor}`, marginBottom: '16px' }}>
              <h3 style={{ fontSize: '1rem', fontWeight: 700, color: textColor, marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <DollarSign size={18} style={{ color: '#059669' }} />
                {lang === 'ar' ? 'ملخص السعر' : 'Price Summary'}
              </h3>
              
              <div style={{ 
                display: 'flex', 
                justifyContent: 'space-between', 
                padding: '8px 0', 
                color: textSecondary,
                fontSize: '0.85rem',
              }}>
                <span>{t.hourlyRate}</span>
                <span>{price} {t.egp}</span>
              </div>
              
              <div style={{ 
                display: 'flex', 
                justifyContent: 'space-between', 
                padding: '8px 0', 
                color: textSecondary,
                fontSize: '0.85rem',
              }}>
                <span>{t.platformFee} (10%)</span>
                <span>{platformFee} {t.egp}</span>
              </div>
              
              <div style={{ 
                display: 'flex', 
                justifyContent: 'space-between', 
                padding: '12px 0', 
                fontWeight: 700, 
                fontSize: '1.1rem', 
                color: '#059669', 
                borderTop: `2px solid ${borderColor}`, 
                marginTop: '8px' 
              }}>
                <span>{t.total}</span>
                <span>{total} {t.egp}</span>
              </div>
            </div>

            {/* ===== Craftsman Info ===== */}
            <div style={{ background: cardBg, borderRadius: '16px', padding: '20px', border: `1px solid ${borderColor}`, marginBottom: '16px' }}>
              <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                <div style={{ 
                  width: '48px', 
                  height: '48px', 
                  borderRadius: '50%', 
                  background: gradientBg, 
                  color: 'white', 
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'center', 
                  fontWeight: 700, 
                  fontSize: '1.1rem' 
                }}>
                  {craftsman?.name?.charAt(0) || craftsman?.first_name?.charAt(0) || 'ح'}
                </div>
                <div>
                  <strong style={{ color: textColor }}>{craftsman?.name || `${craftsman?.first_name || ''} ${craftsman?.last_name || ''}`.trim()}</strong>
                  <div style={{ fontSize: '0.8rem', color: '#3b82f6' }}>{craftsman?.profession || craftsman?.crafts?.[0]?.name}</div>
                </div>
              </div>
              <div style={{ marginTop: '12px', display: 'flex', flexDirection: 'column', gap: '6px', fontSize: '0.8rem', color: textSecondary }}>
                <span><Star size={14} fill="#f59e0b" color="#f59e0b" /> {craftsman?.rating || 'جديد'}</span>
                <span><MapPin size={14} color="#ef4444" /> {craftsman?.city} {craftsman?.district}</span>
                {/* ✅ عرض السعر في معلومات الحرفي */}
                <span style={{ display: 'flex', alignItems: 'center', gap: '4px', color: '#059669', fontWeight: 600 }}>
                  <DollarSign size={14} />
                  {price} {t.egp} {t.pricePerHour}
                </span>
                <span style={{ fontSize: '0.7rem', color: '#059669' }}>
                  ✅ {lang === 'ar' ? 'متاح للحجز' : 'Available for booking'}
                </span>
                <span style={{ display: 'flex', gap: '8px', marginTop: '4px' }}>
                  {craftsman?.phone && (
                    <a href={`tel:${craftsman.phone}`} style={{ color: '#3b82f6', textDecoration: 'none', fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <Phone size={14} /> {lang === 'ar' ? 'اتصل' : 'Call'}
                    </a>
                  )}
                  <a href={`https://wa.me/${craftsman?.phone || '20'}`} target="_blank" rel="noopener noreferrer" style={{ color: '#25D366', textDecoration: 'none', fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <MessageCircle size={14} /> {lang === 'ar' ? 'واتساب' : 'WhatsApp'}
                  </a>
                </span>
              </div>
            </div>

            {/* ===== MAP SECTION ===== */}
            {craftsman && (
              <div style={{ 
                background: cardBg, 
                borderRadius: '16px', 
                border: `1px solid ${borderColor}`,
                overflow: 'hidden',
              }}>
                <div 
                  onClick={() => setShowMap(!showMap)}
                  style={{
                    padding: '16px 20px',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    cursor: 'pointer',
                    borderBottom: showMap ? `1px solid ${borderColor}` : 'none',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <MapPin size={18} style={{ color: '#ef4444' }} />
                    <span style={{ fontWeight: 700, color: textColor }}>{t.craftsmanLocation}</span>
                  </div>
                  <button
                    onClick={() => setShowMap(!showMap)}
                    style={{
                      background: 'none',
                      border: 'none',
                      cursor: 'pointer',
                      color: textSecondary,
                    }}
                  >
                    {showMap ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                  </button>
                </div>

                {showMap && (
                  <div style={{ padding: '0 16px 16px' }}>
                    <div className="map-container" style={{ height: '200px', borderRadius: '12px', overflow: 'hidden' }}>
                      <CraftsmanMap
                        craftsman={{
                          id: craftsman.id,
                          name: craftsman.name || `${craftsman.first_name || ''} ${craftsman.last_name || ''}`.trim(),
                          latitude: craftsman.latitude || 30.0444,
                          longitude: craftsman.longitude || 31.2357,
                          city: craftsman.city,
                          district: craftsman.district,
                          rating: craftsman.rating,
                          phone: craftsman.phone,
                          profession: craftsman.profession,
                        }}
                        nearbyCraftsmen={nearbyCraftsmen}
                        userLocation={userLocation}
                        onCraftsmanClick={handleCraftsmanClick}
                        onDirectionsClick={handleDirectionsClick}
                        onPhoneClick={handlePhoneClick}
                      />
                    </div>

                    {/* Nearby Craftsmen Toggle */}
                    {nearbyCraftsmen.length > 0 && (
                      <div style={{ marginTop: '12px' }}>
                        <button
                          onClick={() => setShowNearby(!showNearby)}
                          style={{
                            width: '100%',
                            padding: '8px 12px',
                            borderRadius: '8px',
                            border: `1px solid ${borderColor}`,
                            background: 'transparent',
                            color: textColor,
                            cursor: 'pointer',
                            fontSize: '0.8rem',
                            fontWeight: 600,
                            fontFamily: "'Cairo', sans-serif",
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: '6px',
                          }}
                        >
                          <Users size={14} />
                          {showNearby ? t.hideMap : t.showNearby}
                          <span style={{ 
                            background: '#3b82f6', 
                            color: 'white', 
                            borderRadius: '50%',
                            padding: '0 6px',
                            fontSize: '0.7rem',
                          }}>
                            {nearbyCraftsmen.length}
                          </span>
                        </button>

                        {showNearby && (
                          <div style={{ marginTop: '8px', maxHeight: '150px', overflowY: 'auto' }}>
                            {nearbyCraftsmen.slice(0, 3).map((n, i) => (
                              <div
                                key={n.id || i}
                                onClick={() => handleCraftsmanClick(n)}
                                style={{
                                  padding: '8px 12px',
                                  borderRadius: '8px',
                                  borderBottom: i < nearbyCraftsmen.length - 1 ? `1px solid ${borderColor}` : 'none',
                                  cursor: 'pointer',
                                  display: 'flex',
                                  justifyContent: 'space-between',
                                  alignItems: 'center',
                                  transition: 'all 0.3s ease',
                                }}
                                onMouseEnter={(e) => { e.currentTarget.style.background = darkMode ? '#334155' : '#f1f5f9'; }}
                                onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; }}
                              >
                                <div>
                                  <div style={{ fontSize: '0.85rem', fontWeight: 600, color: textColor }}>
                                    {n.name}
                                  </div>
                                  <div style={{ fontSize: '0.7rem', color: textSecondary }}>
                                    {n.profession} • {n.city}
                                  </div>
                                </div>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                  {n.distance && (
                                    <span style={{ fontSize: '0.7rem', color: '#059669' }}>
                                      {n.distance.toFixed(1)} {t.km}
                                    </span>
                                  )}
                                  <span style={{ display: 'flex', alignItems: 'center', gap: '2px', fontSize: '0.7rem', color: '#f59e0b' }}>
                                    <Star size={12} fill="#f59e0b" />
                                    {n.rating || 'جديد'}
                                  </span>
                                </div>
                              </div>
                            ))}
                            {nearbyCraftsmen.length > 3 && (
                              <button
                                onClick={() => navigate('/search')}
                                style={{
                                  width: '100%',
                                  padding: '8px',
                                  borderRadius: '8px',
                                  border: 'none',
                                  background: '#3b82f6',
                                  color: 'white',
                                  cursor: 'pointer',
                                  fontSize: '0.75rem',
                                  fontWeight: 600,
                                  fontFamily: "'Cairo', sans-serif",
                                  marginTop: '4px',
                                }}
                              >
                                {lang === 'ar' ? `عرض ${nearbyCraftsmen.length - 3} حرفي آخر` : `View ${nearbyCraftsmen.length - 3} more`}
                              </button>
                            )}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default BookingPage;