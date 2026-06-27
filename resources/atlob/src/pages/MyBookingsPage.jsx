// src/pages/MyBookingsPage.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useTheme } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import AddReviewModal from '../components/Reviews/AddReviewModal';
import { 
  Calendar, Clock, MapPin, Star, DollarSign,
  ChevronLeft, X, CheckCircle, Clock as ClockIcon, AlertCircle,
  Loader, Eye, RefreshCw, PlusCircle
} from 'lucide-react';

console.log('📄 [MyBookingsPage] FILE LOADED');

const MyBookingsPage = () => {
  console.log('🔵 [MyBookingsPage] COMPONENT RENDERED');
  
  const navigate = useNavigate();
  const { darkMode } = useTheme();
  const { user, isAuthenticated } = useAuth();
  const [lang, setLang] = useState('ar');
  
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [error, setError] = useState('');
  const [cancelling, setCancelling] = useState(null);
  const [fetchCount, setFetchCount] = useState(0);

  // ✅ State للمودال
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [selectedBooking, setSelectedBooking] = useState(null);

  const isArabic = lang === 'ar';

  // ✅ دالة تنسيق التاريخ
  const formatDate = (date) => {
    if (!date) return '';
    const d = new Date(date);
    return d.toLocaleDateString(isArabic ? 'ar-EG' : 'en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      weekday: isArabic ? 'short' : undefined,
    });
  };

  // Language
  useEffect(() => {
    const savedLang = localStorage.getItem('language') || 'ar';
    setLang(savedLang);
    const handleLanguageChange = () => setLang(localStorage.getItem('language') || 'ar');
    window.addEventListener('languagechange', handleLanguageChange);
    return () => window.removeEventListener('languagechange', handleLanguageChange);
  }, []);

  // ✅ جلب الحجوزات - استخدم 'all'
  const loadBookings = async () => {
    console.log('🔄 [MyBookingsPage] loadBookings STARTED');
    console.log('👤 [MyBookingsPage] User:', user);
    console.log('👤 [MyBookingsPage] User role:', user?.role);
    
    setLoading(true);
    setError('');
    setFetchCount(prev => prev + 1);

    try {
      console.log('📤 [MyBookingsPage] Calling api.getMyBookings("all")');
      const response = await api.getMyBookings('all');
      
      console.log('📥 [MyBookingsPage] Full response:', JSON.stringify(response, null, 2));
      
      let bookingsData = [];
      if (response?.bookings?.data) {
        bookingsData = response.bookings.data;
      } else if (response?.bookings) {
        bookingsData = response.bookings;
      } else if (Array.isArray(response)) {
        bookingsData = response;
      } else if (response?.data) {
        bookingsData = response.data;
      }
      
      const statuses = bookingsData.map(b => b.status);
      console.log(`📊 [MyBookingsPage] Total bookings found: ${bookingsData.length}`);
      console.log('📋 الحالات الموجودة:', [...new Set(statuses)]);
      
      if (bookingsData.length === 0) {
        console.warn('⚠️ [MyBookingsPage] No bookings found');
      }
      
      setBookings(bookingsData);
      
    } catch (err) {
      console.error('❌ [MyBookingsPage] Error:', err);
      setError(err.message || (isArabic ? 'حدث خطأ في تحميل الحجوزات' : 'Error loading bookings'));
      setBookings([]);
    } finally {
      setLoading(false);
      console.log('🔄 [MyBookingsPage] loadBookings FINISHED');
    }
  };

  // ✅ تحميل البيانات
  useEffect(() => {
    console.log('🔄 [MyBookingsPage] useEffect - initial load');
    loadBookings();
  }, []);

  // ✅ التحقق من إشارة التحديث من الحرفي
  useEffect(() => {
    // 1. التحقق من إشارة التحديث من الحرفي
    const shouldRefresh = localStorage.getItem('refreshClientBookings') === 'true';
    if (shouldRefresh) {
      console.log('🔄 [MyBookingsPage] Refresh signal from craftsman detected');
      const bookingId = localStorage.getItem('lastCompletedBooking');
      const timestamp = localStorage.getItem('lastCompletedTime');
      console.log(`📋 [MyBookingsPage] Booking ID: ${bookingId}, Time: ${timestamp}`);
      
      // مسح الإشارة
      localStorage.removeItem('refreshClientBookings');
      localStorage.removeItem('lastCompletedBooking');
      localStorage.removeItem('lastCompletedTime');
      
      loadBookings();
    }
    
    // 2. إعادة تحميل عند عودة المستخدم للصفحة
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        console.log('🔄 [MyBookingsPage] Page became visible, refreshing...');
        loadBookings();
      }
    };
    
    document.addEventListener('visibilitychange', handleVisibilityChange);
    
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, []);

  // ✅ فلترة الحجوزات
  const filteredBookings = filter === 'all' 
    ? bookings 
    : bookings.filter(b => b.status === filter);

  // ✅ إلغاء حجز
  const handleCancel = async (bookingId) => {
    if (!window.confirm(isArabic ? 'هل أنت متأكد من إلغاء هذا الحجز؟' : 'Are you sure you want to cancel this booking?')) {
      return;
    }
    
    setCancelling(bookingId);
    try {
      await api.cancelBooking(bookingId);
      await loadBookings();
    } catch (err) {
      setError(err.message || (isArabic ? 'حدث خطأ في إلغاء الحجز' : 'Error cancelling booking'));
    } finally {
      setCancelling(null);
    }
  };

  // ✅ فتح مودال التقييم
  const openReviewModal = (booking) => {
    setSelectedBooking(booking);
    setShowReviewModal(true);
  };

  // ✅ بعد إضافة التقييم بنجاح
  const handleReviewSuccess = () => {
    loadBookings();
    setShowReviewModal(false);
    setSelectedBooking(null);
  };

  // ✅ إغلاق مودال التقييم
  const handleReviewClose = () => {
    setShowReviewModal(false);
    setSelectedBooking(null);
  };

  // ✅ حالة الحجز
  const getStatusColor = (status) => {
    const colors = {
      pending: { bg: '#fef3c7', text: '#d97706', icon: <ClockIcon size={16} /> },
      confirmed: { bg: '#dbeafe', text: '#2563eb', icon: <CheckCircle size={16} /> },
      in_progress: { bg: '#f3e8ff', text: '#7c3aed', icon: <Loader size={16} className="animate-spin" /> },
      completed: { bg: '#d1fae5', text: '#059669', icon: <CheckCircle size={16} /> },
      cancelled: { bg: '#fee2e2', text: '#dc2626', icon: <X size={16} /> },
      rejected: { bg: '#fee2e2', text: '#dc2626', icon: <AlertCircle size={16} /> },
    };
    return colors[status] || colors.pending;
  };

  const getStatusText = (status) => {
    const map = {
      pending: isArabic ? 'قيد الانتظار' : 'Pending',
      confirmed: isArabic ? 'مؤكد' : 'Confirmed',
      in_progress: isArabic ? 'قيد التنفيذ' : 'In Progress',
      completed: isArabic ? 'مكتمل' : 'Completed',
      cancelled: isArabic ? 'ملغي' : 'Cancelled',
      rejected: isArabic ? 'مرفوض' : 'Rejected',
    };
    return map[status] || status;
  };

  // ✅ الترجمات
  const t = {
    myBookings: isArabic ? 'حجوزاتي' : 'My Bookings',
    youHave: (count) => isArabic ? `لديك ${count} حجز` : `You have ${count} bookings`,
    details: isArabic ? 'تفاصيل' : 'Details',
    cancel: isArabic ? 'إلغاء' : 'Cancel',
    review: isArabic ? 'قيّم' : 'Review',
    reviewed: isArabic ? 'تم التقييم' : 'Reviewed',
    noBookings: isArabic ? 'لا توجد حجوزات' : 'No bookings found',
    noBookingsYet: isArabic ? 'لم تقم بأي حجز بعد' : "You haven't made any bookings yet",
    noBookingsMessage: isArabic 
      ? 'ابدأ بالبحث عن حرفي مناسب وقم بحجز خدمتك الآن' 
      : 'Start searching for a suitable craftsman and book your service now',
    searchCraftsman: isArabic ? 'ابحث عن حرفي' : 'Search for a craftsman',
    all: isArabic ? 'الكل' : 'All',
    egp: isArabic ? 'ج.م' : 'EGP',
    refresh: isArabic ? 'تحديث' : 'Refresh',
    debug: isArabic ? 'فحص' : 'Debug',
    loading: isArabic ? 'جاري التحميل...' : 'Loading...',
    attempts: isArabic ? 'محاولات' : 'Attempts',
    createBooking: isArabic ? 'إنشاء حجز جديد' : 'Create New Booking',
  };

  const statuses = [
    { value: 'all', label: isArabic ? 'الكل' : 'All' },
    { value: 'pending', label: isArabic ? 'قيد الانتظار' : 'Pending' },
    { value: 'confirmed', label: isArabic ? 'مؤكد' : 'Confirmed' },
    { value: 'in_progress', label: isArabic ? 'قيد التنفيذ' : 'In Progress' },
    { value: 'completed', label: isArabic ? 'مكتمل' : 'Completed' },
    { value: 'cancelled', label: isArabic ? 'ملغي' : 'Cancelled' },
    { value: 'rejected', label: isArabic ? 'مرفوض' : 'Rejected' },
  ];

  const bgColor = darkMode ? '#0f172a' : '#f8fafc';
  const cardBg = darkMode ? '#1e293b' : '#ffffff';
  const textColor = darkMode ? '#f1f5f9' : '#0f172a';
  const textSecondary = darkMode ? '#94a3b8' : '#64748b';
  const borderColor = darkMode ? '#334155' : '#e2e8f0';

  return (
    <div style={{ background: bgColor, minHeight: '100vh', fontFamily: "'Cairo', sans-serif", direction: isArabic ? 'rtl' : 'ltr' }}>
      <style>{`
        @keyframes fadeInUp { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
        .animate-fade-in-up { animation: fadeInUp 0.5s ease forwards; }
        .animate-spin { animation: spin 1s linear infinite; }
        .hover-lift { transition: all 0.3s ease; }
        .hover-lift:hover { transform: translateY(-3px); box-shadow: 0 8px 24px rgba(0,0,0,0.12); }
        @media (max-width: 768px) {
          .filter-bar { overflow-x: auto; flex-wrap: nowrap; }
          .booking-card { flex-direction: column; align-items: stretch !important; }
        }
      `}</style>

      {/* Header */}
      <div style={{
        background: darkMode ? 'linear-gradient(160deg, #1e3a8a, #1e40af)' : 'linear-gradient(160deg, #2563eb, #1d4ed8)',
        color: 'white',
        padding: '32px 0',
      }}>
        <div style={{ maxWidth: '1000px', margin: '0 auto', padding: '0 24px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', justifyContent: 'space-between', flexWrap: 'wrap' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <button onClick={() => navigate(-1)} style={{
                background: 'rgba(255,255,255,0.15)',
                border: 'none',
                color: 'white',
                width: '40px',
                height: '40px',
                borderRadius: '10px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}>
                <ChevronLeft size={20} />
              </button>
              <div>
                <h1 style={{ fontSize: '1.5rem', fontWeight: 700, margin: 0 }}>
                  📋 {t.myBookings}
                </h1>
                <p style={{ fontSize: '0.85rem', opacity: 0.85, margin: '2px 0 0' }}>
                  {t.youHave(bookings.length)}
                  {fetchCount > 0 && (
                    <span style={{ fontSize: '0.7rem', opacity: 0.5, marginLeft: '8px' }}>
                      ({t.attempts}: {fetchCount})
                    </span>
                  )}
                </p>
              </div>
            </div>
            
            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
              {/* ✅ زر DEBUG */}
              <button
                onClick={() => {
                  console.log('🔍 [DEBUG] ===== MANUAL DEBUG =====');
                  console.log('🔑 Token:', localStorage.getItem('token'));
                  console.log('👤 User:', user);
                  console.log('📋 Current bookings:', bookings);
                  console.log('🔄 Calling loadBookings...');
                  loadBookings();
                }}
                style={{
                  padding: '8px 16px',
                  borderRadius: '8px',
                  background: '#ef4444',
                  color: 'white',
                  border: 'none',
                  cursor: 'pointer',
                  fontFamily: "'Cairo', sans-serif",
                  fontWeight: 600,
                  fontSize: '0.85rem',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                }}
              >
                🔍 {t.debug}
              </button>

              {/* ✅ زر التحديث */}
              <button
                onClick={loadBookings}
                disabled={loading}
                style={{
                  padding: '8px 16px',
                  borderRadius: '8px',
                  background: loading ? '#93c5fd' : 'rgba(255,255,255,0.2)',
                  color: 'white',
                  border: '1px solid rgba(255,255,255,0.3)',
                  cursor: loading ? 'not-allowed' : 'pointer',
                  fontFamily: "'Cairo', sans-serif",
                  fontWeight: 600,
                  fontSize: '0.85rem',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  transition: 'all 0.2s',
                }}
              >
                {loading ? <Loader size={16} className="animate-spin" /> : <RefreshCw size={16} />}
                {t.refresh}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div style={{ maxWidth: '1000px', margin: '0 auto', padding: '24px' }}>

        {/* Debug Info */}
        <div style={{
          background: darkMode ? '#1e293b' : '#f1f5f9',
          borderRadius: '8px',
          padding: '8px 12px',
          marginBottom: '16px',
          fontSize: '0.75rem',
          color: textSecondary,
          border: `1px dashed ${borderColor}`,
          display: 'flex',
          gap: '16px',
          flexWrap: 'wrap',
          alignItems: 'center',
          direction: 'ltr',
        }}>
          <span>🔄 {t.loading} {loading ? '⏳' : '✅'}</span>
          <span>📊 {t.youHave(bookings.length)}</span>
          <span>🔄 {t.attempts}: {fetchCount}</span>
          <span>🔑 {localStorage.getItem('token') ? '✅' : '❌'}</span>
          <span>👤 {user?.role || 'غير معروف'}</span>
        </div>

        {/* Error */}
        {error && (
          <div style={{
            background: darkMode ? 'rgba(220,38,38,0.1)' : '#fee2e2',
            color: '#dc2626',
            padding: '12px 16px',
            borderRadius: '12px',
            marginBottom: '16px',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            border: '1px solid rgba(220,38,38,0.2)',
          }}>
            <AlertCircle size={18} />
            {error}
          </div>
        )}

        {/* Filter Bar */}
        <div className="filter-bar" style={{
          display: 'flex',
          gap: '8px',
          marginBottom: '20px',
          flexWrap: 'wrap',
          paddingBottom: '8px',
        }}>
          {statuses.map((s) => (
            <button
              key={s.value}
              onClick={() => setFilter(s.value)}
              style={{
                padding: '8px 16px',
                borderRadius: '50px',
                border: filter === s.value ? '2px solid #3b82f6' : `1px solid ${borderColor}`,
                background: filter === s.value ? (darkMode ? 'rgba(59,130,246,0.15)' : '#eff6ff') : 'transparent',
                color: filter === s.value ? '#3b82f6' : textSecondary,
                cursor: 'pointer',
                fontWeight: filter === s.value ? 700 : 500,
                fontSize: '0.85rem',
                fontFamily: "'Cairo', sans-serif",
                whiteSpace: 'nowrap',
                transition: 'all 0.3s ease',
              }}
            >
              {s.label}
              {s.value !== 'all' && (
                <span style={{
                  marginLeft: '4px',
                  fontSize: '0.7rem',
                  background: filter === s.value ? '#3b82f6' : (darkMode ? '#334155' : '#e2e8f0'),
                  color: filter === s.value ? 'white' : textSecondary,
                  padding: '2px 6px',
                  borderRadius: '10px',
                }}>
                  {bookings.filter(b => b.status === s.value).length}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* ✅ Bookings List */}
        {loading ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {[1, 2, 3].map(i => (
              <div key={i} style={{
                background: cardBg,
                borderRadius: '14px',
                padding: '18px 20px',
                border: `1px solid ${borderColor}`,
                height: '120px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: textSecondary,
                gap: '12px',
              }}>
                <Loader size={24} className="animate-spin" />
                {t.loading}
              </div>
            ))}
          </div>
        ) : filteredBookings.length > 0 ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {filteredBookings.map((booking, index) => {
              const statusStyle = getStatusColor(booking.status);
              const canCancel = booking.status === 'pending' || booking.status === 'confirmed';
              const isCompleted = booking.status === 'completed';
              const hasReview = booking.has_review || booking.review_id;
              
              return (
                <div
                  key={booking.id || index}
                  className="hover-lift booking-card"
                  style={{
                    background: cardBg,
                    borderRadius: '14px',
                    padding: '18px 20px',
                    border: `1px solid ${borderColor}`,
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    flexWrap: 'wrap',
                    gap: '12px',
                  }}
                >
                  <div style={{ flex: 1, minWidth: '200px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
                      <h3 style={{ fontWeight: 700, color: textColor, fontSize: '1rem', margin: 0 }}>
                        {booking.craftsman?.first_name} {booking.craftsman?.last_name || booking.service_title || 'خدمة'}
                      </h3>
                      <span style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '4px',
                        padding: '2px 10px',
                        borderRadius: '20px',
                        fontSize: '0.7rem',
                        fontWeight: 600,
                        background: statusStyle.bg,
                        color: statusStyle.text,
                      }}>
                        {statusStyle.icon}
                        {getStatusText(booking.status)}
                      </span>
                    </div>
                    
                    <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap', marginTop: '6px', fontSize: '0.85rem', color: textSecondary }}>
                      <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <Calendar size={14} />
                        {formatDate(booking.booking_date)}
                      </span>
                      {booking.booking_time && (
                        <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                          <Clock size={14} />
                          {booking.booking_time}
                        </span>
                      )}
                      {booking.total_price && (
                        <span style={{ display: 'flex', alignItems: 'center', gap: '4px', color: '#059669', fontWeight: 600 }}>
                          <DollarSign size={14} />
                          {booking.total_price} {t.egp}
                        </span>
                      )}
                    </div>
                  </div>

                  <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                    {/* ✅ زر التفاصيل - يفتح صفحة تفاصيل الحجز */}
                    <button
                      onClick={() => navigate(`/booking-details/${booking.id}`)}
                      style={{
                        padding: '6px 14px',
                        borderRadius: '8px',
                        border: `1px solid ${borderColor}`,
                        background: 'transparent',
                        cursor: 'pointer',
                        color: textSecondary,
                        fontSize: '0.8rem',
                        fontFamily: "'Cairo', sans-serif",
                        display: 'flex',
                        alignItems: 'center',
                        gap: '4px',
                      }}
                    >
                      <Eye size={14} />
                      {t.details}
                    </button>

                    {/* ✅ زر التقييم - يظهر فقط للحجوزات المكتملة التي لم يتم تقييمها */}
                    {isCompleted && !hasReview && (
                      <button
                        onClick={() => openReviewModal(booking)}
                        style={{
                          padding: '6px 14px',
                          borderRadius: '8px',
                          background: 'linear-gradient(135deg, #f59e0b, #d97706)',
                          color: 'white',
                          border: 'none',
                          cursor: 'pointer',
                          fontSize: '0.8rem',
                          fontWeight: 600,
                          fontFamily: "'Cairo', sans-serif",
                          display: 'flex',
                          alignItems: 'center',
                          gap: '4px',
                          transition: 'all 0.3s ease',
                        }}
                        onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.05)'}
                        onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
                      >
                        <Star size={14} />
                        {t.review}
                      </button>
                    )}

                    {/* ✅ زر "تم التقييم" - يظهر للحجوزات المكتملة التي تم تقييمها */}
                    {isCompleted && hasReview && (
                      <span style={{
                        padding: '6px 14px',
                        borderRadius: '8px',
                        background: '#d1fae5',
                        color: '#059669',
                        fontSize: '0.8rem',
                        fontWeight: 600,
                        fontFamily: "'Cairo', sans-serif",
                        display: 'flex',
                        alignItems: 'center',
                        gap: '4px',
                      }}>
                        <CheckCircle size={14} />
                        {t.reviewed}
                      </span>
                    )}

                    {/* زر الإلغاء - يظهر للحجوزات pending و confirmed فقط */}
                    {canCancel && (
                      <button
                        onClick={() => handleCancel(booking.id)}
                        disabled={cancelling === booking.id}
                        style={{
                          padding: '6px 14px',
                          borderRadius: '8px',
                          background: '#dc2626',
                          color: 'white',
                          border: 'none',
                          cursor: cancelling === booking.id ? 'not-allowed' : 'pointer',
                          fontSize: '0.8rem',
                          fontWeight: 600,
                          fontFamily: "'Cairo', sans-serif",
                          opacity: cancelling === booking.id ? 0.6 : 1,
                          display: 'flex',
                          alignItems: 'center',
                          gap: '4px',
                        }}
                      >
                        {cancelling === booking.id ? (
                          <Loader size={14} className="animate-spin" />
                        ) : (
                          <X size={14} />
                        )}
                        {t.cancel}
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div style={{
            textAlign: 'center',
            padding: '60px 20px',
            background: cardBg,
            borderRadius: '16px',
            border: `1px solid ${borderColor}`,
          }}>
            <div style={{
              width: '80px',
              height: '80px',
              borderRadius: '50%',
              background: darkMode ? 'rgba(59,130,246,0.1)' : '#eff6ff',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 20px',
            }}>
              <Calendar size={40} style={{ color: '#3b82f6', opacity: 0.5 }} />
            </div>
            <h3 style={{ fontSize: '1.3rem', fontWeight: 700, color: textColor, marginBottom: '8px' }}>
              {t.noBookings}
            </h3>
            <p style={{ color: textSecondary, fontSize: '1rem', maxWidth: '400px', margin: '0 auto 20px' }}>
              {filter === 'all' ? t.noBookingsMessage : `لا توجد حجوزات بحالة "${filter}"`}
            </p>
            <div style={{ display: 'flex', gap: '12px', justifyContent: 'center', flexWrap: 'wrap' }}>
              {filter !== 'all' && (
                <button
                  onClick={() => setFilter('all')}
                  style={{
                    padding: '10px 24px',
                    borderRadius: '10px',
                    background: '#3b82f6',
                    color: 'white',
                    border: 'none',
                    cursor: 'pointer',
                    fontWeight: 600,
                    fontSize: '0.9rem',
                    fontFamily: "'Cairo', sans-serif",
                  }}
                >
                  عرض الكل
                </button>
              )}
              <Link
                to="/search"
                style={{
                  padding: '10px 24px',
                  borderRadius: '10px',
                  background: 'linear-gradient(135deg, #2563eb, #1d4ed8)',
                  color: 'white',
                  textDecoration: 'none',
                  fontWeight: 600,
                  fontSize: '0.9rem',
                  fontFamily: "'Cairo', sans-serif",
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '8px',
                }}
              >
                <PlusCircle size={18} />
                {t.searchCraftsman}
              </Link>
            </div>
          </div>
        )}
      </div>

      {/* ✅ مودال إضافة التقييم */}
      <AddReviewModal
        isOpen={showReviewModal}
        onClose={handleReviewClose}
        bookingId={selectedBooking?.id}
        craftsmanName={
          selectedBooking?.craftsman 
            ? `${selectedBooking.craftsman.first_name || ''} ${selectedBooking.craftsman.last_name || ''}`.trim()
            : null
        }
        onSuccess={handleReviewSuccess}
      />
    </div>
  );
};

export default MyBookingsPage;