// src/pages/CraftsmanBookingsPage.jsx
import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTheme } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import {
  Bell, CheckCircle, XCircle, Loader,
  Calendar, Clock, MapPin, User, DollarSign,
  AlertCircle, RefreshCw, Eye, ArrowRight,
  ChevronLeft, Filter, Search, X, FileText
} from 'lucide-react';

const CraftsmanBookingsPage = () => {
  const navigate = useNavigate();
  const { darkMode } = useTheme();
  const { user } = useAuth();
  const [lang, setLang] = useState('ar');

  // State
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState('');
  const [feedbackMessage, setFeedbackMessage] = useState('');
  
  // Filters
  const [filter, setFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  
  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [lastPage, setLastPage] = useState(1);
  
  // Action loading
  const [actionLoading, setActionLoading] = useState({});

  const isArabic = lang === 'ar';

  // Language
  useEffect(() => {
    const savedLang = localStorage.getItem('language') || 'ar';
    setLang(savedLang);
    const handleLanguageChange = () => setLang(localStorage.getItem('language') || 'ar');
    window.addEventListener('languagechange', handleLanguageChange);
    return () => window.removeEventListener('languagechange', handleLanguageChange);
  }, []);

  // ✅ دالة تنسيق التاريخ
  const formatDate = (date) => {
    if (!date) return '';
    const d = new Date(date);
    return d.toLocaleDateString(isArabic ? 'ar-EG' : 'en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      // ✅ إضافة weekday لعرض اسم اليوم
      weekday: isArabic ? 'short' : undefined,
    });
  };

  // ✅ جلب الحجوزات
  const loadBookings = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      console.log('🔵 [CraftsmanBookingsPage] Loading bookings...');
      
      const data = await api.getCraftsmanBookings();
      console.log('📥 [CraftsmanBookingsPage] Response:', data);
      
      let bookingsArray = data.bookings?.data || data.data || [];
      setBookings(bookingsArray);
      
      // Pagination
      const total = data.bookings?.total || data.total || bookingsArray.length;
      const perPage = data.bookings?.per_page || data.per_page || 10;
      setLastPage(Math.ceil(total / perPage) || 1);
      
    } catch (err) {
      console.error('❌ [CraftsmanBookingsPage] Error:', err);
      setError(err.message || (isArabic ? 'حدث خطأ في تحميل الحجوزات' : 'Error loading bookings'));
      setBookings([]);
    } finally {
      setLoading(false);
    }
  }, [isArabic]);

  useEffect(() => {
    loadBookings();
  }, [loadBookings]);

  // ✅ تحديث حالة الحجز
  const handleUpdateStatus = async (bookingId, newStatus) => {
    setActionLoading(prev => ({ ...prev, [bookingId]: newStatus }));
    
    let statusMessage = '';
    if (newStatus === 'confirmed') {
      statusMessage = isArabic ? '✅ تم قبول الحجز بنجاح' : '✅ Booking accepted';
    } else if (newStatus === 'in_progress') {
      statusMessage = isArabic ? '✅ تم بدء العمل' : '✅ Work started';
    } else if (newStatus === 'completed') {
      statusMessage = isArabic ? '✅ تم إكمال العمل' : '✅ Work completed';
    } else if (newStatus === 'rejected') {
      const reason = prompt(isArabic ? 'اكتب سبب الرفض (اختياري):' : 'Enter rejection reason (optional):');
      if (reason !== null) {
        try {
          await api.updateBookingStatus(bookingId, newStatus, reason || 'غير متاح');
          showFeedback(isArabic ? '❌ تم رفض الحجز' : '❌ Booking rejected', false);
          await loadBookings();
          setActionLoading(prev => ({ ...prev, [bookingId]: null }));
          return;
        } catch (error) {
          showFeedback(error.message || (isArabic ? '❌ حدث خطأ' : '❌ Error occurred'), false);
          setActionLoading(prev => ({ ...prev, [bookingId]: null }));
          return;
        }
      } else {
        setActionLoading(prev => ({ ...prev, [bookingId]: null }));
        return;
      }
    }
    
    try {
      await api.updateBookingStatus(bookingId, newStatus);
      showFeedback(statusMessage);
      await loadBookings();
    } catch (error) {
      console.error('Update status error:', error);
      showFeedback(error.message || (isArabic ? '❌ حدث خطأ' : '❌ Error occurred'), false);
    }
    
    setActionLoading(prev => ({ ...prev, [bookingId]: null }));
  };

  // Show feedback
  const showFeedback = (message, isSuccess = true) => {
    setFeedbackMessage(message);
    setTimeout(() => setFeedbackMessage(''), 4000);
  };

  // Refresh
  const handleRefresh = () => {
    setRefreshing(true);
    loadBookings();
    setTimeout(() => setRefreshing(false), 1000);
  };

  // ✅ فلترة الحجوزات
  const filteredBookings = bookings.filter(booking => {
    // فلتر الحالة
    if (filter !== 'all' && booking.status !== filter) return false;
    
    // بحث
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      const clientName = booking.client?.name?.toLowerCase() || '';
      const serviceTitle = booking.service_title?.toLowerCase() || '';
      const bookingNumber = booking.booking_number?.toLowerCase() || '';
      return clientName.includes(term) || serviceTitle.includes(term) || bookingNumber.includes(term);
    }
    
    return true;
  });

  // ✅ حالات الحجز
  const filters = [
    { value: 'all', label: isArabic ? 'الكل' : 'All' },
    { value: 'pending', label: isArabic ? 'قيد الانتظار' : 'Pending' },
    { value: 'confirmed', label: isArabic ? 'مؤكد' : 'Confirmed' },
    { value: 'in_progress', label: isArabic ? 'قيد التنفيذ' : 'In Progress' },
    { value: 'completed', label: isArabic ? 'مكتمل' : 'Completed' },
  ];

  const getStatusColor = (status) => {
    const colors = {
      pending: { bg: '#fef3c7', text: '#d97706', icon: <Clock size={16} /> },
      confirmed: { bg: '#dbeafe', text: '#2563eb', icon: <CheckCircle size={16} /> },
      in_progress: { bg: '#f3e8ff', text: '#7c3aed', icon: <Loader size={16} className="animate-spin" /> },
      completed: { bg: '#d1fae5', text: '#059669', icon: <CheckCircle size={16} /> },
    };
    return colors[status] || colors.pending;
  };

  const getStatusText = (status) => {
    const map = {
      pending: isArabic ? 'قيد الانتظار' : 'Pending',
      confirmed: isArabic ? 'مؤكد' : 'Confirmed',
      in_progress: isArabic ? 'قيد التنفيذ' : 'In Progress',
      completed: isArabic ? 'مكتمل' : 'Completed',
    };
    return map[status] || status;
  };

  // ✅ الأزرار المتاحة حسب الحالة
  const getAvailableActions = (status) => {
    const actions = {
      pending: ['confirmed', 'rejected'],
      confirmed: ['in_progress'],
      in_progress: ['completed'],
      completed: [],
    };
    return actions[status] || [];
  };

  const getActionLabel = (action) => {
    const map = {
      confirmed: isArabic ? 'قبول' : 'Accept',
      in_progress: isArabic ? 'بدء العمل' : 'Start Work',
      completed: isArabic ? 'إكمال العمل' : 'Complete Work',
      rejected: isArabic ? 'رفض' : 'Reject',
    };
    return map[action] || action;
  };

  const getActionColor = (action) => {
    const colors = {
      confirmed: { bg: '#059669', hover: '#047857' },
      in_progress: { bg: '#8b5cf6', hover: '#7c3aed' },
      completed: { bg: '#059669', hover: '#047857' },
      rejected: { bg: '#dc2626', hover: '#b91c1c' },
    };
    return colors[action] || colors.confirmed;
  };

  // Translations
  const t = {
    title: isArabic ? '📋 طلباتي الخاصة' : '📋 My Bookings',
    subtitle: isArabic ? 'إدارة طلبات العملاء وحالتها' : 'Manage client requests and their status',
    noBookings: isArabic ? 'لا توجد حجوزات' : 'No bookings',
    noBookingsDesc: isArabic ? 'عندما يكون لديك حجوزات جديدة ستظهر هنا' : 'When you have new bookings they will appear here',
    refresh: isArabic ? 'تحديث' : 'Refresh',
    loading: isArabic ? 'جاري التحميل...' : 'Loading...',
    details: isArabic ? 'تفاصيل' : 'Details',
    customer: isArabic ? 'العميل' : 'Customer',
    date: isArabic ? 'التاريخ' : 'Date',
    time: isArabic ? 'الوقت' : 'Time',
    price: isArabic ? 'السعر' : 'Price',
    location: isArabic ? 'الموقع' : 'Location',
    notes: isArabic ? 'ملاحظات' : 'Notes',
    back: isArabic ? 'رجوع' : 'Back',
    search: isArabic ? 'بحث...' : 'Search...',
    clearSearch: isArabic ? 'مسح البحث' : 'Clear search',
    all: isArabic ? 'الكل' : 'All',
    pending: isArabic ? 'قيد الانتظار' : 'Pending',
    confirmed: isArabic ? 'مؤكد' : 'Confirmed',
    inProgress: isArabic ? 'قيد التنفيذ' : 'In Progress',
    completed: isArabic ? 'مكتمل' : 'Completed',
    filters: isArabic ? 'فلترة' : 'Filters',
    service: isArabic ? 'الخدمة' : 'Service',
    egp: isArabic ? 'ج.م' : 'EGP',
    processing: isArabic ? 'جاري...' : '...',
  };

  // Styles
  const bgColor = darkMode ? '#0f172a' : '#f8fafc';
  const cardBg = darkMode ? '#1e293b' : '#ffffff';
  const textColor = darkMode ? '#f1f5f9' : '#0f172a';
  const textSecondary = darkMode ? '#94a3b8' : '#64748b';
  const borderColor = darkMode ? '#334155' : '#e2e8f0';
  const inputBg = darkMode ? '#0f172a' : '#f8fafc';
  const accent = '#3b82f6';

  const inputStyle = {
    width: '100%',
    padding: '10px 14px',
    borderRadius: '10px',
    border: `1px solid ${borderColor}`,
    background: inputBg,
    color: textColor,
    fontSize: '0.9rem',
    fontFamily: "'Cairo', sans-serif",
    outline: 'none',
    transition: 'all 0.3s ease',
    textAlign: isArabic ? 'right' : 'left',
  };

  // Loading
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
        <Loader size={40} style={{ color: accent, animation: 'spin 1s linear infinite' }} />
      </div>
    );
  }

  return (
    <div style={{
      minHeight: '100vh',
      background: bgColor,
      fontFamily: "'Cairo', sans-serif",
      direction: isArabic ? 'rtl' : 'ltr',
      padding: '24px',
    }}>
      <style>{`
        @keyframes fadeInUp { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
        @keyframes slideDown { from { opacity: 0; transform: translateY(-10px); } to { opacity: 1; transform: translateY(0); } }
        .animate-fade-in-up { animation: fadeInUp 0.5s ease forwards; }
        .animate-slide-down { animation: slideDown 0.3s ease forwards; }
        .animate-spin { animation: spin 1s linear infinite; }
        .hover-lift { transition: all 0.3s ease; }
        .hover-lift:hover { transform: translateY(-3px); box-shadow: 0 8px 24px rgba(0,0,0,0.12); }
        .btn-action { transition: all 0.3s ease; }
        .btn-action:hover { transform: translateY(-2px); }
        @media (max-width: 768px) {
          .filters-row { flex-wrap: wrap; }
          .booking-card { flex-direction: column; align-items: stretch !important; }
          .actions-row { flex-wrap: wrap; }
        }
      `}</style>

      {/* Feedback Message */}
      {feedbackMessage && (
        <div className="animate-slide-down" style={{
          position: 'fixed', top: '80px', left: '50%', transform: 'translateX(-50%)',
          zIndex: 200, background: feedbackMessage.includes('✅') ? '#059669' : '#dc2626',
          color: 'white', padding: '12px 24px', borderRadius: '12px',
          fontWeight: 600, fontSize: '0.9rem',
          boxShadow: '0 8px 24px rgba(0,0,0,0.2)',
        }}>
          {feedbackMessage}
        </div>
      )}

      {/* Container */}
      <div style={{ maxWidth: '1000px', margin: '0 auto' }}>

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
              onClick={() => navigate('/craftsman/home')}
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
                {t.title}
              </h1>
              <p style={{ fontSize: '0.85rem', color: textSecondary }}>
                {t.subtitle} ({bookings.length})
              </p>
            </div>
          </div>

          <button
            onClick={handleRefresh}
            disabled={refreshing}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              padding: '8px 16px',
              borderRadius: '10px',
              border: `1px solid ${borderColor}`,
              background: 'transparent',
              color: textColor,
              cursor: refreshing ? 'not-allowed' : 'pointer',
              fontFamily: "'Cairo', sans-serif",
              fontSize: '0.85rem',
              fontWeight: 600,
              opacity: refreshing ? 0.6 : 1,
              transition: 'all 0.3s ease',
            }}
          >
            <RefreshCw size={16} className={refreshing ? 'animate-spin' : ''} />
            {t.refresh}
          </button>
        </div>

        {/* Error */}
        {error && (
          <div style={{
            background: darkMode ? 'rgba(220,38,38,0.1)' : '#fee2e2',
            color: '#dc2626',
            padding: '12px 16px',
            borderRadius: '10px',
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

        {/* Search & Filters */}
        <div className="animate-fade-in-up" style={{
          background: cardBg,
          borderRadius: '14px',
          padding: '16px 20px',
          border: `1px solid ${borderColor}`,
          marginBottom: '20px',
        }}>
          <div className="filters-row" style={{
            display: 'flex',
            gap: '10px',
            flexWrap: 'wrap',
          }}>
            {/* Search */}
            <div style={{ flex: 1, minWidth: '200px', position: 'relative' }}>
              <Search size={16} style={{
                position: 'absolute',
                top: '50%',
                transform: 'translateY(-50%)',
                [isArabic ? 'right' : 'left']: '12px',
                color: textSecondary,
              }} />
              <input
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder={t.search}
                style={{
                  ...inputStyle,
                  [isArabic ? 'paddingRight' : 'paddingLeft']: '36px',
                }}
              />
              {searchTerm && (
                <button
                  onClick={() => setSearchTerm('')}
                  style={{
                    position: 'absolute',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    [isArabic ? 'left' : 'right']: '12px',
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    color: textSecondary,
                  }}
                >
                  <X size={16} />
                </button>
              )}
            </div>

            {/* Filter Buttons */}
            <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
              {filters.map((f) => (
                <button
                  key={f.value}
                  onClick={() => setFilter(f.value)}
                  style={{
                    padding: '6px 14px',
                    borderRadius: '20px',
                    border: filter === f.value ? `2px solid ${accent}` : `1px solid ${borderColor}`,
                    background: filter === f.value ? (darkMode ? 'rgba(59,130,246,0.15)' : '#eff6ff') : 'transparent',
                    color: filter === f.value ? accent : textSecondary,
                    cursor: 'pointer',
                    fontSize: '0.75rem',
                    fontWeight: filter === f.value ? 700 : 500,
                    fontFamily: "'Cairo', sans-serif",
                    transition: 'all 0.3s ease',
                  }}
                >
                  {f.label}
                  {f.value !== 'all' && (
                    <span style={{
                      marginLeft: '4px',
                      fontSize: '0.6rem',
                      background: filter === f.value ? accent : (darkMode ? '#334155' : '#e2e8f0'),
                      color: filter === f.value ? 'white' : textSecondary,
                      padding: '1px 6px',
                      borderRadius: '8px',
                    }}>
                      {bookings.filter(b => b.status === f.value).length}
                    </span>
                  )}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Bookings List */}
        {filteredBookings.length > 0 ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {filteredBookings.map((booking, index) => {
              const statusStyle = getStatusColor(booking.status);
              const availableActions = getAvailableActions(booking.status);
              const isPending = booking.status === 'pending';
              
              return (
                <div
                  key={booking.id}
                  className="animate-fade-in-up hover-lift booking-card"
                  style={{
                    background: cardBg,
                    borderRadius: '14px',
                    padding: '18px 20px',
                    border: `1px solid ${borderColor}`,
                    animationDelay: `${index * 0.05}s`,
                  }}
                >
                  <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'flex-start',
                    flexWrap: 'wrap',
                    gap: '12px',
                  }}>
                    {/* Left - Info */}
                    <div style={{ flex: 1, minWidth: '200px' }}>
                      <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px',
                        flexWrap: 'wrap',
                        marginBottom: '6px',
                      }}>
                        <span style={{ fontWeight: 700, color: textColor, fontSize: '1rem' }}>
                          {booking.client?.name || t.customer}
                        </span>
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

                      <div style={{
                        display: 'flex',
                        gap: '12px',
                        flexWrap: 'wrap',
                        fontSize: '0.8rem',
                        color: textSecondary,
                      }}>
                        <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                          <Calendar size={14} />
                          {/* ✅ استخدام formatDate لتنسيق التاريخ */}
                          {formatDate(booking.booking_date)}
                        </span>
                        {booking.booking_time && (
                          <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                            <Clock size={14} />
                            {booking.booking_time}
                          </span>
                        )}
                        <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                          <FileText size={14} />
                          {booking.service_title || t.service}
                        </span>
                        {booking.total_price && (
                          <span style={{ display: 'flex', alignItems: 'center', gap: '4px', color: '#059669', fontWeight: 600 }}>
                            <DollarSign size={14} />
                            {booking.total_price} {t.egp}
                          </span>
                        )}
                      </div>

                      {booking.location && (
                        <div style={{
                          fontSize: '0.75rem',
                          color: textSecondary,
                          marginTop: '4px',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '4px',
                        }}>
                          <MapPin size={14} style={{ color: '#ef4444' }} />
                          {booking.location}
                        </div>
                      )}

                      {booking.notes && (
                        <div style={{
                          fontSize: '0.75rem',
                          color: textSecondary,
                          marginTop: '2px',
                        }}>
                          📝 {booking.notes}
                        </div>
                      )}
                    </div>

                    {/* Right - Actions */}
                    <div className="actions-row" style={{
                      display: 'flex',
                      gap: '6px',
                      flexWrap: 'wrap',
                      alignItems: 'center',
                    }}>
                      {/* ✅ زر رفض - يظهر فقط للحجوزات pending */}
                      {isPending && (
                        <button
                          onClick={() => handleUpdateStatus(booking.id, 'rejected')}
                          disabled={actionLoading[booking.id] === 'rejected'}
                          className="btn-action"
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '4px',
                            padding: '6px 12px',
                            borderRadius: '8px',
                            border: '1px solid #dc2626',
                            background: 'transparent',
                            color: '#dc2626',
                            cursor: actionLoading[booking.id] === 'rejected' ? 'not-allowed' : 'pointer',
                            fontSize: '0.7rem',
                            fontWeight: 600,
                            fontFamily: "'Cairo', sans-serif",
                            opacity: actionLoading[booking.id] ? 0.5 : 1,
                          }}
                          onMouseEnter={(e) => {
                            if (!actionLoading[booking.id]) {
                              e.target.style.background = '#dc2626';
                              e.target.style.color = 'white';
                            }
                          }}
                          onMouseLeave={(e) => {
                            e.target.style.background = 'transparent';
                            e.target.style.color = '#dc2626';
                          }}
                        >
                          {actionLoading[booking.id] === 'rejected' ? (
                            <Loader size={12} className="animate-spin" />
                          ) : (
                            <XCircle size={12} />
                          )}
                          {actionLoading[booking.id] === 'rejected' ? t.processing : t.reject}
                        </button>
                      )}

                      {/* ✅ أزرار إدارة الحالة */}
                      {availableActions.map((action) => {
                        const actionColor = getActionColor(action);
                        const isProcessing = actionLoading[booking.id] === action;
                        
                        return (
                          <button
                            key={action}
                            onClick={() => handleUpdateStatus(booking.id, action)}
                            disabled={isProcessing}
                            className="btn-action"
                            style={{
                              display: 'flex',
                              alignItems: 'center',
                              gap: '4px',
                              padding: '6px 12px',
                              borderRadius: '8px',
                              border: 'none',
                              background: isProcessing ? '#94a3b8' : actionColor.bg,
                              color: 'white',
                              cursor: isProcessing ? 'not-allowed' : 'pointer',
                              fontSize: '0.7rem',
                              fontWeight: 600,
                              fontFamily: "'Cairo', sans-serif",
                              opacity: isProcessing ? 0.7 : 1,
                              transition: 'all 0.3s ease',
                            }}
                            onMouseEnter={(e) => {
                              if (!isProcessing) {
                                e.target.style.background = actionColor.hover;
                              }
                            }}
                            onMouseLeave={(e) => {
                              e.target.style.background = isProcessing ? '#94a3b8' : actionColor.bg;
                            }}
                          >
                            {isProcessing ? (
                              <Loader size={12} className="animate-spin" />
                            ) : (
                              <CheckCircle size={12} />
                            )}
                            {isProcessing ? t.processing : getActionLabel(action)}
                          </button>
                        );
                      })}

                      {/* زر تفاصيل */}
                      <button
                        onClick={() => navigate(`/booking-details/${booking.id}`)}
                        style={{
                          padding: '6px 12px',
                          borderRadius: '8px',
                          border: `1px solid ${borderColor}`,
                          background: 'transparent',
                          color: textSecondary,
                          cursor: 'pointer',
                          fontSize: '0.7rem',
                          fontFamily: "'Cairo', sans-serif",
                          display: 'flex',
                          alignItems: 'center',
                          gap: '4px',
                        }}
                      >
                        <Eye size={14} />
                        {t.details}
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="animate-fade-in-up" style={{
            textAlign: 'center',
            padding: '60px 20px',
            background: cardBg,
            borderRadius: '16px',
            border: `1px solid ${borderColor}`,
          }}>
            <Bell size={48} style={{ opacity: 0.2, color: textSecondary, marginBottom: '12px' }} />
            <h3 style={{ fontSize: '1.2rem', fontWeight: 700, color: textColor }}>
              {t.noBookings}
            </h3>
            <p style={{ color: textSecondary, fontSize: '0.9rem' }}>
              {t.noBookingsDesc}
            </p>
            {filter !== 'all' && (
              <button
                onClick={() => setFilter('all')}
                style={{
                  marginTop: '12px',
                  padding: '8px 20px',
                  borderRadius: '8px',
                  border: 'none',
                  background: accent,
                  color: 'white',
                  cursor: 'pointer',
                  fontWeight: 600,
                  fontSize: '0.85rem',
                  fontFamily: "'Cairo', sans-serif",
                }}
              >
                {isArabic ? 'عرض الكل' : 'View All'}
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default CraftsmanBookingsPage;