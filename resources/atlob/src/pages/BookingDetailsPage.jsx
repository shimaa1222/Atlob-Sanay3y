// src/pages/BookingDetailsPage.jsx
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useTheme } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import { 
  Calendar, Clock, MapPin, DollarSign, User, Wrench,
  ChevronLeft, CheckCircle, Clock as ClockIcon, AlertCircle,
  Loader, Phone, MessageCircle, Star, FileText,
  Home, Briefcase, Shield, Award, Mail
} from 'lucide-react';

const BookingDetailsPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { darkMode } = useTheme();
  const { user } = useAuth();
  const [lang, setLang] = useState('ar');
  const [booking, setBooking] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Language
  useEffect(() => {
    const savedLang = localStorage.getItem('language') || 'ar';
    setLang(savedLang);
    const handleLanguageChange = () => setLang(localStorage.getItem('language') || 'ar');
    window.addEventListener('languagechange', handleLanguageChange);
    return () => window.removeEventListener('languagechange', handleLanguageChange);
  }, []);

  const isArabic = lang === 'ar';

  // ✅ جلب تفاصيل الحجز - يدعم كلا الدورين
  useEffect(() => {
    const loadBooking = async () => {
      setLoading(true);
      setError('');
      try {
        let bookingData = null;

        // ✅ إذا كان المستخدم حرفي
        if (user?.role === 'craftsman') {
          console.log('🔵 [BookingDetailsPage] User is craftsman, using getCraftsmanBookings');
          const bookingsData = await api.getCraftsmanBookings();
          const allBookings = bookingsData.bookings?.data || [];
          bookingData = allBookings.find(b => b.id === parseInt(id));
          
          if (bookingData) {
            setBooking(bookingData);
          } else {
            setError(isArabic ? 'الحجز غير موجود' : 'Booking not found');
          }
        } else {
          // ✅ إذا كان المستخدم عميل
          console.log('🔵 [BookingDetailsPage] User is client, using getBooking');
          const result = await api.getBooking(id);
          bookingData = result.booking || result;
          setBooking(bookingData);
        }
        
        if (!bookingData && !error) {
          setError(isArabic ? 'الحجز غير موجود' : 'Booking not found');
        }
        
      } catch (err) {
        console.error('❌ Error loading booking:', err);
        setError(err.message || (isArabic ? 'حدث خطأ في تحميل تفاصيل الحجز' : 'Error loading booking details'));
      } finally {
        setLoading(false);
      }
    };

    if (id && user) {
      loadBooking();
    }
  }, [id, isArabic, user]);

  // ========== حالات الحجز ==========
  const getStatusColor = (status) => {
    const colors = {
      pending: { bg: '#fef3c7', text: '#d97706', icon: <ClockIcon size={18} /> },
      confirmed: { bg: '#dbeafe', text: '#2563eb', icon: <CheckCircle size={18} /> },
      in_progress: { bg: '#f3e8ff', text: '#7c3aed', icon: <Loader size={18} className="animate-spin" /> },
      completed: { bg: '#d1fae5', text: '#059669', icon: <CheckCircle size={18} /> },
      cancelled: { bg: '#fee2e2', text: '#dc2626', icon: <AlertCircle size={18} /> },
      rejected: { bg: '#fee2e2', text: '#dc2626', icon: <AlertCircle size={18} /> },
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

  const formatDate = (date) => {
    if (!date) return '';
    const d = new Date(date);
    return d.toLocaleDateString(isArabic ? 'ar-EG' : 'en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      weekday: 'long',
    });
  };

  // ========== الترجمات ==========
  const t = {
    title: isArabic ? 'تفاصيل الحجز' : 'Booking Details',
    bookingNumber: isArabic ? 'رقم الحجز' : 'Booking Number',
    status: isArabic ? 'الحالة' : 'Status',
    date: isArabic ? 'التاريخ' : 'Date',
    time: isArabic ? 'الوقت' : 'Time',
    location: isArabic ? 'الموقع' : 'Location',
    notes: isArabic ? 'ملاحظات' : 'Notes',
    service: isArabic ? 'الخدمة' : 'Service',
    price: isArabic ? 'سعر الخدمة' : 'Service Price',
    total: isArabic ? 'الإجمالي' : 'Total',
    egp: isArabic ? 'ج.م' : 'EGP',
    craftsman: isArabic ? 'الحرفي' : 'Craftsman',
    client: isArabic ? 'العميل' : 'Client',
    phone: isArabic ? 'الهاتف' : 'Phone',
    email: isArabic ? 'البريد الإلكتروني' : 'Email',
    city: isArabic ? 'المدينة' : 'City',
    review: isArabic ? 'التقييم' : 'Review',
    noReview: isArabic ? 'لا يوجد تقييم' : 'No review yet',
    back: isArabic ? 'رجوع' : 'Back',
    loading: isArabic ? 'جاري التحميل...' : 'Loading...',
    error: isArabic ? 'حدث خطأ' : 'Error',
    notFound: isArabic ? 'الحجز غير موجود' : 'Booking not found',
    rating: isArabic ? 'التقييم' : 'Rating',
    comment: isArabic ? 'التعليق' : 'Comment',
    cancelBooking: isArabic ? 'إلغاء الحجز' : 'Cancel Booking',
    viewProfile: isArabic ? 'عرض الملف الشخصي' : 'View Profile',
    backToBookings: isArabic ? '← العودة للحجوزات' : '← Back to Bookings',
    backToDashboard: isArabic ? '← العودة للصفحة الرئيسية' : '← Back to Dashboard',
  };

  // ========== Styles ==========
  const bgColor = darkMode ? '#0f172a' : '#f8fafc';
  const cardBg = darkMode ? '#1e293b' : '#ffffff';
  const textColor = darkMode ? '#f1f5f9' : '#0f172a';
  const textSecondary = darkMode ? '#94a3b8' : '#64748b';
  const borderColor = darkMode ? '#334155' : '#e2e8f0';

  // ========== Loading ==========
  if (loading) {
    return (
      <div style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: bgColor,
        fontFamily: "'Cairo', sans-serif",
      }}>
        <Loader size={40} style={{ color: '#3b82f6', animation: 'spin 1s linear infinite' }} />
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  // ========== Error ==========
  if (error || !booking) {
    return (
      <div style={{
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        background: bgColor,
        fontFamily: "'Cairo', sans-serif",
        padding: '24px',
        gap: '16px',
        direction: isArabic ? 'rtl' : 'ltr',
      }}>
        <AlertCircle size={48} style={{ color: '#ef4444' }} />
        <p style={{ color: textColor, fontSize: '1.1rem' }}>{error || t.notFound}</p>
        <button
          onClick={() => navigate(user?.role === 'craftsman' ? '/craftsman/home' : '/my-bookings')}
          style={{
            padding: '10px 24px',
            borderRadius: '10px',
            background: '#3b82f6',
            color: 'white',
            border: 'none',
            cursor: 'pointer',
            fontFamily: "'Cairo', sans-serif",
            fontWeight: 600,
            fontSize: '0.95rem',
          }}
        >
          {t.back}
        </button>
      </div>
    );
  }

  const statusStyle = getStatusColor(booking.status);
  const craftsman = booking.craftsman || {};
  const client = booking.client || {};
  const isClient = user?.role === 'client';
  const isCraftsman = user?.role === 'craftsman';

  // ✅ بناء اسم الحرفي
  const craftsmanName = craftsman.first_name 
    ? `${craftsman.first_name} ${craftsman.last_name || ''}`.trim() 
    : craftsman.name || 'حرفي';

  // ✅ بناء اسم العميل
  const clientName = client.name || `${client.first_name || ''} ${client.last_name || ''}`.trim() || 'عميل';

  return (
    <div style={{
      background: bgColor,
      minHeight: '100vh',
      fontFamily: "'Cairo', sans-serif",
      direction: isArabic ? 'rtl' : 'ltr',
      padding: '24px',
    }}>
      <style>{`
        @keyframes fadeInUp {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
        .animate-fade-in-up { animation: fadeInUp 0.5s ease forwards; }
        .animate-spin { animation: spin 1s linear infinite; }
        .hover-lift { transition: all 0.3s ease; }
        .hover-lift:hover { transform: translateY(-2px); }
        .info-row { 
          display: flex; 
          justify-content: space-between; 
          padding: 10px 0;
          border-bottom: 1px solid ${borderColor};
        }
        .info-row:last-child { border-bottom: none; }
        .info-label { color: ${textSecondary}; font-size: 0.9rem; }
        .info-value { color: ${textColor}; font-weight: 600; font-size: 0.95rem; }
        @media (max-width: 768px) {
          .details-grid { grid-template-columns: 1fr !important; }
          .info-row { flex-direction: column; gap: 4px; }
        }
      `}</style>

      {/* Container */}
      <div style={{ maxWidth: '900px', margin: '0 auto' }}>

        {/* Header */}
        <div className="animate-fade-in-up" style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: '24px',
          flexWrap: 'wrap',
          gap: '12px',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <button
              onClick={() => navigate(user?.role === 'craftsman' ? '/craftsman/home' : '/my-bookings')}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                width: '40px',
                height: '40px',
                borderRadius: '10px',
                border: `1px solid ${borderColor}`,
                background: 'transparent',
                cursor: 'pointer',
                color: textColor,
              }}
            >
              <ChevronLeft size={20} />
            </button>
            <div>
              <h1 style={{ fontSize: '1.5rem', fontWeight: 700, color: textColor, margin: 0 }}>
                📋 {t.title}
              </h1>
              <p style={{ fontSize: '0.85rem', color: textSecondary, margin: '4px 0 0' }}>
                #{booking.booking_number}
              </p>
            </div>
          </div>

          {/* Status Badge */}
          <span style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px',
            padding: '8px 16px',
            borderRadius: '50px',
            background: statusStyle.bg,
            color: statusStyle.text,
            fontWeight: 700,
            fontSize: '0.9rem',
          }}>
            {statusStyle.icon}
            {getStatusText(booking.status)}
          </span>
        </div>

        {/* Main Content */}
        <div className="details-grid animate-fade-in-up" style={{
          display: 'grid',
          gridTemplateColumns: '1fr 320px',
          gap: '24px',
        }}>

          {/* Left Column - Details */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>

            {/* Service Info */}
            <div style={{
              background: cardBg,
              borderRadius: '16px',
              padding: '24px',
              border: `1px solid ${borderColor}`,
            }}>
              <h2 style={{
                fontSize: '1rem',
                fontWeight: 700,
                color: textColor,
                marginBottom: '16px',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
              }}>
                <Wrench size={18} style={{ color: '#3b82f6' }} />
                {t.service}
              </h2>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                <div className="info-row">
                  <span className="info-label">{t.service}</span>
                  <span className="info-value">{booking.service_title || 'خدمة'}</span>
                </div>
                <div className="info-row">
                  <span className="info-label">{t.date}</span>
                  <span className="info-value">{formatDate(booking.booking_date)}</span>
                </div>
                <div className="info-row">
                  <span className="info-label">{t.time}</span>
                  <span className="info-value">{booking.booking_time}</span>
                </div>
                {booking.location && (
                  <div className="info-row">
                    <span className="info-label">{t.location}</span>
                    <span className="info-value" style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <MapPin size={14} style={{ color: '#ef4444' }} />
                      {booking.location}
                    </span>
                  </div>
                )}
                {booking.notes && (
                  <div className="info-row">
                    <span className="info-label">{t.notes}</span>
                    <span className="info-value" style={{ fontWeight: 400 }}>{booking.notes}</span>
                  </div>
                )}
              </div>
            </div>

            {/* ✅ Price Summary - بدون رسوم منصة */}
            <div style={{
              background: cardBg,
              borderRadius: '16px',
              padding: '24px',
              border: `1px solid ${borderColor}`,
            }}>
              <h2 style={{
                fontSize: '1rem',
                fontWeight: 700,
                color: textColor,
                marginBottom: '16px',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
              }}>
                <DollarSign size={18} style={{ color: '#059669' }} />
                {isArabic ? 'ملخص السعر' : 'Price Summary'}
              </h2>
              <div style={{ display: 'flex', flexDirection: 'column' }}>
                <div className="info-row">
                  <span className="info-label">{t.price}</span>
                  <span className="info-value">{booking.service_price || 0} {t.egp}</span>
                </div>
                <div className="info-row" style={{ borderBottom: 'none', paddingTop: '12px', marginTop: '4px', borderTop: `2px solid ${borderColor}` }}>
                  <span className="info-label" style={{ fontWeight: 700, fontSize: '1rem', color: textColor }}>{t.total}</span>
                  <span className="info-value" style={{ fontSize: '1.1rem', color: '#059669' }}>{booking.total_price || 0} {t.egp}</span>
                </div>
              </div>
            </div>

            {/* Review (if exists) */}
            {booking.review && (
              <div style={{
                background: cardBg,
                borderRadius: '16px',
                padding: '24px',
                border: `1px solid ${borderColor}`,
              }}>
                <h2 style={{
                  fontSize: '1rem',
                  fontWeight: 700,
                  color: textColor,
                  marginBottom: '16px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                }}>
                  <Star size={18} style={{ color: '#f59e0b' }} fill="#f59e0b" />
                  {t.review}
                </h2>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                  <span style={{ display: 'flex', gap: '2px' }}>
                    {[1, 2, 3, 4, 5].map((star) => (
                      <Star
                        key={star}
                        size={18}
                        fill={star <= booking.review.rating ? '#f59e0b' : 'none'}
                        color={star <= booking.review.rating ? '#f59e0b' : '#cbd5e1'}
                      />
                    ))}
                  </span>
                  <span style={{ fontWeight: 700, color: textColor }}>{booking.review.rating}/5</span>
                </div>
                {booking.review.comment && (
                  <p style={{
                    color: textSecondary,
                    fontSize: '0.95rem',
                    lineHeight: 1.7,
                    margin: '8px 0 0',
                    padding: '12px 16px',
                    background: darkMode ? 'rgba(255,255,255,0.03)' : '#f8fafc',
                    borderRadius: '10px',
                    border: `1px solid ${borderColor}`,
                  }}>
                    "{booking.review.comment}"
                  </p>
                )}
              </div>
            )}
          </div>

          {/* ===== Right Column - People ===== */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>

            {/* ✅ Craftsman Card - يظهر للعميل فقط */}
            {isClient && (
              <div style={{
                background: cardBg,
                borderRadius: '16px',
                padding: '20px',
                border: `1px solid ${borderColor}`,
              }}>
                <h3 style={{
                  fontSize: '0.95rem',
                  fontWeight: 700,
                  color: textColor,
                  marginBottom: '12px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                }}>
                  <User size={16} style={{ color: '#3b82f6' }} />
                  {t.craftsman}
                </h3>
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  marginBottom: '12px',
                }}>
                  <div style={{
                    width: '48px',
                    height: '48px',
                    borderRadius: '50%',
                    background: 'linear-gradient(135deg, #2563eb, #1d4ed8)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: 'white',
                    fontWeight: 700,
                    fontSize: '1.1rem',
                  }}>
                    {craftsmanName?.charAt(0) || 'ح'}
                  </div>
                  <div>
                    <div style={{ fontWeight: 700, color: textColor }}>
                      {craftsmanName}
                    </div>
                    <div style={{ fontSize: '0.8rem', color: textSecondary }}>
                      {craftsman.city || ''}
                      {craftsman.rating > 0 && (
                        <span style={{ marginLeft: '8px' }}>
                          ⭐ {craftsman.rating}
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', fontSize: '0.85rem' }}>
                  {craftsman.phone && (
                    <a
                      href={`tel:${craftsman.phone}`}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px',
                        color: textSecondary,
                        textDecoration: 'none',
                        padding: '6px 10px',
                        borderRadius: '8px',
                        transition: 'all 0.2s',
                      }}
                      onMouseEnter={(e) => { e.currentTarget.style.background = darkMode ? '#334155' : '#f1f5f9'; }}
                      onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; }}
                    >
                      <Phone size={14} style={{ color: '#3b82f6' }} />
                      {craftsman.phone}
                    </a>
                  )}
                  {craftsman.email && (
                    <div style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                      color: textSecondary,
                      padding: '6px 10px',
                      borderRadius: '8px',
                    }}>
                      <Mail size={14} style={{ color: '#3b82f6' }} />
                      {craftsman.email}
                    </div>
                  )}
                </div>

                <Link
                  to={`/craftsman/${craftsman.id}`}
                  style={{
                    display: 'block',
                    textAlign: 'center',
                    marginTop: '12px',
                    padding: '8px',
                    borderRadius: '8px',
                    background: darkMode ? 'rgba(59,130,246,0.15)' : '#eff6ff',
                    color: '#3b82f6',
                    textDecoration: 'none',
                    fontWeight: 600,
                    fontSize: '0.85rem',
                    transition: 'all 0.2s',
                  }}
                  onMouseEnter={(e) => { e.currentTarget.style.background = '#3b82f6'; e.currentTarget.style.color = 'white'; }}
                  onMouseLeave={(e) => { e.currentTarget.style.background = darkMode ? 'rgba(59,130,246,0.15)' : '#eff6ff'; e.currentTarget.style.color = '#3b82f6'; }}
                >
                  {t.viewProfile}
                </Link>
              </div>
            )}

            {/* ✅ Client Card - يظهر للكل (عميل وحرفي) */}
            <div style={{
              background: cardBg,
              borderRadius: '16px',
              padding: '20px',
              border: `1px solid ${borderColor}`,
            }}>
              <h3 style={{
                fontSize: '0.95rem',
                fontWeight: 700,
                color: textColor,
                marginBottom: '12px',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
              }}>
                <User size={16} style={{ color: '#8b5cf6' }} />
                {t.client}
              </h3>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
              }}>
                <div style={{
                  width: '48px',
                  height: '48px',
                  borderRadius: '50%',
                  background: 'linear-gradient(135deg, #8b5cf6, #7c3aed)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: 'white',
                  fontWeight: 700,
                  fontSize: '1.1rem',
                }}>
                  {clientName?.charAt(0) || 'ع'}
                </div>
                <div>
                  <div style={{ fontWeight: 700, color: textColor }}>
                    {clientName}
                  </div>
                  {client.phone && (
                    <div style={{ fontSize: '0.8rem', color: textSecondary, display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <Phone size={12} />
                      {client.phone}
                    </div>
                  )}
                  {client.email && (
                    <div style={{ fontSize: '0.8rem', color: textSecondary, display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <Mail size={12} />
                      {client.email}
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Actions - يظهر للعميل فقط */}
            {isClient && (
              <div style={{
                background: cardBg,
                borderRadius: '16px',
                padding: '20px',
                border: `1px solid ${borderColor}`,
              }}>
                <h3 style={{
                  fontSize: '0.95rem',
                  fontWeight: 700,
                  color: textColor,
                  marginBottom: '12px',
                }}>
                  {isArabic ? 'إجراءات' : 'Actions'}
                </h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  <button
                    onClick={() => navigate('/my-bookings')}
                    style={{
                      padding: '10px',
                      borderRadius: '10px',
                      border: `1px solid ${borderColor}`,
                      background: 'transparent',
                      color: textColor,
                      cursor: 'pointer',
                      fontWeight: 600,
                      fontSize: '0.9rem',
                      fontFamily: "'Cairo', sans-serif",
                      transition: 'all 0.2s',
                    }}
                    onMouseEnter={(e) => { e.currentTarget.style.background = darkMode ? '#334155' : '#f1f5f9'; }}
                    onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; }}
                  >
                    {t.backToBookings}
                  </button>
                  
                  {booking.status === 'pending' && (
                    <button
                      onClick={() => {
                        if (window.confirm(isArabic ? 'هل أنت متأكد من إلغاء هذا الحجز؟' : 'Are you sure you want to cancel this booking?')) {
                          api.cancelBooking(booking.id).then(() => {
                            navigate('/my-bookings');
                          }).catch(() => {
                            alert(isArabic ? 'حدث خطأ في الإلغاء' : 'Error cancelling');
                          });
                        }
                      }}
                      style={{
                        padding: '10px',
                        borderRadius: '10px',
                        border: 'none',
                        background: '#dc2626',
                        color: 'white',
                        cursor: 'pointer',
                        fontWeight: 600,
                        fontSize: '0.9rem',
                        fontFamily: "'Cairo', sans-serif",
                        transition: 'all 0.2s',
                      }}
                      onMouseEnter={(e) => { e.currentTarget.style.background = '#b91c1c'; }}
                      onMouseLeave={(e) => { e.currentTarget.style.background = '#dc2626'; }}
                    >
                      {t.cancelBooking}
                    </button>
                  )}
                </div>
              </div>
            )}

            {/* ✅ للحرفي: زر العودة للوحة التحكم فقط */}
            {isCraftsman && (
              <div style={{
                background: cardBg,
                borderRadius: '16px',
                padding: '20px',
                border: `1px solid ${borderColor}`,
              }}>
                <h3 style={{
                  fontSize: '0.95rem',
                  fontWeight: 700,
                  color: textColor,
                  marginBottom: '12px',
                }}>
                  {isArabic ? 'إجراءات' : 'Actions'}
                </h3>
                <button
                  onClick={() => navigate('/craftsman/home')}
                  style={{
                    width: '100%',
                    padding: '10px',
                    borderRadius: '10px',
                    border: `1px solid ${borderColor}`,
                    background: 'transparent',
                    color: textColor,
                    cursor: 'pointer',
                    fontWeight: 600,
                    fontSize: '0.9rem',
                    fontFamily: "'Cairo', sans-serif",
                    transition: 'all 0.2s',
                  }}
                  onMouseEnter={(e) => { e.currentTarget.style.background = darkMode ? '#334155' : '#f1f5f9'; }}
                  onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; }}
                >
                  {t.backToDashboard}
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default BookingDetailsPage;