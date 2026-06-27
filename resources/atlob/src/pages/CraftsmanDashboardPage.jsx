// src/pages/CraftsmanDashboardPage.jsx
import React, { useState, useEffect, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useTheme } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import { 
  Bell, CheckCircle, XCircle, TrendingUp,
  Users, Wrench, Calendar,
  Loader, AlertCircle, RefreshCw, Eye, User,
  FileText, MessageCircle, MapPin, Clock,
  Star, Award, Shield, Sparkles, ArrowRight,
  PlusCircle, Phone, Mail, Filter, Search,
  LayoutDashboard, Home
} from 'lucide-react';

const CraftsmanDashboardPage = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { darkMode } = useTheme();
  const [lang, setLang] = useState('ar');
  
  // ✅ State
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState('');
  const [feedbackMessage, setFeedbackMessage] = useState('');
  
  // ✅ إحصائيات (تم إزالة الأرباح)
  const [stats, setStats] = useState({
    completed_bookings: 0,
    pending_bookings: 0,
    confirmed_bookings: 0,
    in_progress_bookings: 0,
    rating: 0,
    reviews_count: 0,
    is_featured: false,
  });
  
  // ✅ طلبات خاصة (Bookings)
  const [bookings, setBookings] = useState([]);
  const [bookingsLoading, setBookingsLoading] = useState(true);
  const [bookingFilter, setBookingFilter] = useState('all');
  
  // ✅ طلبات عامة (Service Posts) - نفس الـ API المستخدم في CraftsmanPostsPage
  const [servicePosts, setServicePosts] = useState([]);
  const [postsLoading, setPostsLoading] = useState(true);
  const [postFilter, setPostFilter] = useState('');
  
  // ✅ حالة الأزرار
  const [actionLoading, setActionLoading] = useState({});

  // ========== Language ==========
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
    return d.toLocaleDateString(lang === 'ar' ? 'ar-EG' : 'en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      weekday: lang === 'ar' ? 'short' : undefined,
    });
  };

  // ========== Load All Data ==========
  const loadAllData = useCallback(async () => {
    setRefreshing(true);
    setError('');
    try {
      // 1. جلب الإحصائيات (تم إزالة الأرباح)
      const statsData = await api.getCraftsmanStats();
      setStats({
        completed_bookings: statsData.stats?.completed_bookings || 0,
        pending_bookings: statsData.stats?.pending_bookings || 0,
        confirmed_bookings: statsData.stats?.confirmed_bookings || 0,
        in_progress_bookings: statsData.stats?.in_progress_bookings || 0,
        rating: statsData.stats?.rating || 0,
        reviews_count: statsData.stats?.reviews_count || 0,
        is_featured: statsData.stats?.is_featured || false,
      });
      
      // 2. جلب الحجوزات الخاصة
      await loadBookings();
      
      // 3. جلب المنشورات العامة (نفس الـ API المستخدم في CraftsmanPostsPage)
      await loadServicePosts();
      
    } catch (error) {
      console.error('❌ Error loading dashboard data:', error);
      setError(error.message || (lang === 'ar' ? 'حدث خطأ في تحميل البيانات' : 'Error loading data'));
    }
    setRefreshing(false);
  }, []);

  // ========== Load Bookings ==========
  const loadBookings = async () => {
    setBookingsLoading(true);
    try {
      const data = await api.getCraftsmanBookings();
      setBookings(data.bookings?.data || []);
    } catch (error) {
      console.error('❌ Error loading bookings:', error);
      setBookings([]);
    }
    setBookingsLoading(false);
  };

  // ========== Load Service Posts (نفس CraftsmanPostsPage) ==========
  const loadServicePosts = async () => {
    setPostsLoading(true);
    try {
      const postsData = await api.getServicePosts({
        per_page: 20,
        sort_by: 'newest',
      });
      
      console.log('📥 [CraftsmanDashboardPage] Service posts response:', postsData);
      
      let postsArray = [];
      if (postsData?.posts?.data) {
        postsArray = postsData.posts.data;
      } else if (postsData?.data) {
        postsArray = postsData.data;
      } else if (Array.isArray(postsData)) {
        postsArray = postsData;
      } else if (postsData?.posts) {
        postsArray = postsData.posts;
      }
      
      const postsWithResponded = postsArray.map(post => ({
        ...post,
        already_responded: post.already_responded || post.has_responded || false,
      }));
      
      console.log(`📊 [CraftsmanDashboardPage] Found ${postsWithResponded.length} service posts`);
      setServicePosts(postsWithResponded);
    } catch (error) {
      console.error('❌ Error loading service posts:', error);
      setServicePosts([]);
    }
    setPostsLoading(false);
  };

  // ========== Initial Load ==========
  useEffect(() => {
    loadAllData();
    
    const interval = setInterval(loadAllData, 60000);
    return () => clearInterval(interval);
  }, [loadAllData]);

  // ========== Show Feedback ==========
  const showFeedback = (message, isSuccess = true) => {
    setFeedbackMessage(message);
    setTimeout(() => setFeedbackMessage(''), 4000);
  };

  // ========== Update Booking Status ==========
  const handleUpdateBookingStatus = async (bookingId, newStatus) => {
    setActionLoading(prev => ({ ...prev, [`booking_${bookingId}`]: newStatus }));
    
    try {
      let requestData = { status: newStatus };
      
      if (newStatus === 'rejected') {
        const reason = prompt(
          lang === 'ar' 
            ? '✏️ اكتب سبب الرفض (اختياري):' 
            : '✏️ Enter rejection reason (optional):'
        );
        if (reason === null) {
          setActionLoading(prev => ({ ...prev, [`booking_${bookingId}`]: null }));
          return;
        }
        if (reason.trim()) {
          requestData.reason = reason.trim();
        }
      }
      
      // ✅ ✅ ✅ إضافة localStorage عند إكمال العمل
      if (newStatus === 'completed') {
        localStorage.setItem('refreshClientBookings', 'true');
        localStorage.setItem('lastCompletedBooking', bookingId);
        localStorage.setItem('lastCompletedTime', Date.now().toString());
        console.log('🔵 [CraftsmanDashboardPage] Booking completed, refresh signal sent to client');
      }
      
      await api.updateBookingStatus(bookingId, newStatus, requestData.reason);
      
      const statusMessages = {
        confirmed: lang === 'ar' ? '✅ تم قبول الحجز بنجاح' : '✅ Booking accepted',
        in_progress: lang === 'ar' ? '✅ تم بدء العمل' : '✅ Work started',
        completed: lang === 'ar' ? '✅ تم إكمال العمل بنجاح' : '✅ Work completed',
        rejected: lang === 'ar' ? '❌ تم رفض الحجز' : '❌ Booking rejected',
      };
      showFeedback(statusMessages[newStatus] || '✅ تم تحديث الحالة');
      
      await loadAllData();
      
    } catch (error) {
      console.error('❌ Update status error:', error);
      let errorMsg = error.message || (lang === 'ar' ? '❌ حدث خطأ' : '❌ Error occurred');
      if (error.errors?.reason) {
        errorMsg = lang === 'ar' ? '❌ سبب الرفض مطلوب' : '❌ Reason is required';
      }
      showFeedback(errorMsg, false);
    }
    
    setActionLoading(prev => ({ ...prev, [`booking_${bookingId}`]: null }));
  };

  // ========== Respond to Service Post ==========
  const handleRespondToPost = async (postId) => {
    setActionLoading(prev => ({ ...prev, [`post_${postId}`]: 'respond' }));
    
    const message = prompt(lang === 'ar' ? 'اكتب عرضك للعميل:' : 'Write your offer to the client:');
    if (!message) {
      setActionLoading(prev => ({ ...prev, [`post_${postId}`]: null }));
      return;
    }
    
    const price = prompt(lang === 'ar' ? 'السعر المقترح (اختياري):' : 'Offered price (optional):');
    const days = prompt(lang === 'ar' ? 'عدد الأيام المتوقعة (اختياري):' : 'Estimated days (optional):');
    
    try {
      await api.respondToServicePost(postId, {
        message: message,
        offered_price: price ? parseFloat(price) : undefined,
        estimated_days: days ? parseInt(days) : undefined,
      });
      showFeedback(lang === 'ar' ? '✅ تم إرسال ردك بنجاح' : '✅ Response sent successfully');
      await loadServicePosts();
    } catch (error) {
      console.error('❌ Respond error:', error);
      showFeedback(error.message || (lang === 'ar' ? '❌ حدث خطأ' : '❌ Error occurred'), false);
    }
    
    setActionLoading(prev => ({ ...prev, [`post_${postId}`]: null }));
  };

  // ========== Translations ==========
  const t = {
    dashboard: lang === 'ar' ? '📊 لوحة التحكم' : '📊 Dashboard',
    home: lang === 'ar' ? ' الرئيسية' : 'Home',
    welcome: lang === 'ar' ? 'مرحباً' : 'Welcome',
    stats: lang === 'ar' ? 'الإحصائيات' : 'Statistics',
    completed: lang === 'ar' ? 'مكتملة' : 'Completed',
    pending: lang === 'ar' ? 'قيد الانتظار' : 'Pending',
    confirmed: lang === 'ar' ? 'مؤكدة' : 'Confirmed',
    inProgress: lang === 'ar' ? 'قيد التنفيذ' : 'In Progress',
    rating: lang === 'ar' ? 'التقييم' : 'Rating',
    egp: lang === 'ar' ? 'ج.م' : 'EGP',
    featured: lang === 'ar' ? '⭐ مميز' : '⭐ Featured',
    refresh: lang === 'ar' ? 'تحديث' : 'Refresh',
    loading: lang === 'ar' ? 'جاري التحميل...' : 'Loading...',
    noBookings: lang === 'ar' ? 'لا توجد حجوزات' : 'No bookings',
    noPosts: lang === 'ar' ? 'لا توجد طلبات عامة' : 'No general requests',
    myBookings: lang === 'ar' ? ' طلباتي الخاصة' : ' My Bookings',
    generalRequests: lang === 'ar' ? ' طلبات عامة' : ' General Requests',
    accept: lang === 'ar' ? 'قبول' : 'Accept',
    startWork: lang === 'ar' ? 'بدء العمل' : 'Start Work',
    completeWork: lang === 'ar' ? 'إكمال العمل' : 'Complete Work',
    reject: lang === 'ar' ? 'رفض' : 'Reject',
    respond: lang === 'ar' ? 'رد على الطلب' : 'Respond',
    alreadyResponded: lang === 'ar' ? 'تم الرد' : 'Responded',
    processing: lang === 'ar' ? 'جاري...' : '...',
    all: lang === 'ar' ? 'الكل' : 'All',
    details: lang === 'ar' ? 'تفاصيل' : 'Details',
    customer: lang === 'ar' ? 'العميل' : 'Customer',
    date: lang === 'ar' ? 'التاريخ' : 'Date',
    time: lang === 'ar' ? 'الوقت' : 'Time',
    location: lang === 'ar' ? 'الموقع' : 'Location',
    budget: lang === 'ar' ? 'الميزانية' : 'Budget',
    urgency: lang === 'ar' ? 'الإلحاح' : 'Urgency',
    description: lang === 'ar' ? 'الوصف' : 'Description',
    viewProfile: lang === 'ar' ? 'عرض الملف' : 'View Profile',
    noData: lang === 'ar' ? 'لا توجد بيانات' : 'No data',
    viewAll: lang === 'ar' ? 'عرض الكل' : 'View All',
  };

  // ========== Filters ==========
  const filteredBookings = bookingFilter === 'all' 
    ? bookings 
    : bookings.filter(b => b.status === bookingFilter);
    
  const filteredPosts = postFilter 
    ? servicePosts.filter(p => p.urgency === postFilter)
    : servicePosts;

  // ========== Status Colors ==========
  const getStatusColor = (status) => {
    const colors = {
      pending: { bg: '#fef3c7', text: '#d97706', icon: <Clock size={16} /> },
      confirmed: { bg: '#dbeafe', text: '#2563eb', icon: <CheckCircle size={16} /> },
      in_progress: { bg: '#f3e8ff', text: '#7c3aed', icon: <Loader size={16} className="animate-spin" /> },
      completed: { bg: '#d1fae5', text: '#059669', icon: <CheckCircle size={16} /> },
      rejected: { bg: '#fee2e2', text: '#dc2626', icon: <XCircle size={16} /> },
    };
    return colors[status] || colors.pending;
  };

  const getStatusText = (status) => {
    const map = {
      pending: lang === 'ar' ? 'قيد الانتظار' : 'Pending',
      confirmed: lang === 'ar' ? 'مؤكد' : 'Confirmed',
      in_progress: lang === 'ar' ? 'قيد التنفيذ' : 'In Progress',
      completed: lang === 'ar' ? 'مكتمل' : 'Completed',
      rejected: lang === 'ar' ? 'مرفوض' : 'Rejected',
    };
    return map[status] || status;
  };

  const getPostStatusText = (status) => {
    const map = {
      open: lang === 'ar' ? 'مفتوح' : 'Open',
      closed: lang === 'ar' ? 'مغلق' : 'Closed',
    };
    return map[status] || status;
  };

  const getPostStatusColor = (status) => {
    const colors = {
      open: { bg: '#dbeafe', text: '#2563eb' },
      closed: { bg: '#d1fae5', text: '#059669' },
    };
    return colors[status] || colors.open;
  };

  // ========== Styles ==========
  const bgColor = darkMode ? '#0f172a' : '#f8fafc';
  const cardBg = darkMode ? '#1e293b' : '#ffffff';
  const textColor = darkMode ? '#f1f5f9' : '#0f172a';
  const textSecondary = darkMode ? '#94a3b8' : '#64748b';
  const borderColor = darkMode ? '#334155' : '#e2e8f0';

  // ========== Stat Cards (تم إزالة الأرباح) ==========
  const statCards = [
    { 
      value: stats.completed_bookings, 
      label: t.completed, 
      color: '#3b82f6',
      icon: <CheckCircle size={22} />
    },
    { 
      value: stats.pending_bookings + stats.confirmed_bookings + stats.in_progress_bookings,
      label: t.pending, 
      color: '#f59e0b',
      icon: <Clock size={22} />
    },
    { 
      value: stats.rating || 0, 
      label: t.rating, 
      color: '#8b5cf6',
      icon: <Star size={22} />
    },
  ];

  // ========== Booking Status Filters ==========
  const bookingFilters = [
    { value: 'all', label: t.all },
    { value: 'pending', label: t.pending },
    { value: 'confirmed', label: t.confirmed },
    { value: 'in_progress', label: t.inProgress },
    { value: 'completed', label: t.completed },
  ];

  // ========== Available Actions per Booking Status ==========
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
      confirmed: t.accept,
      in_progress: t.startWork,
      completed: t.completeWork,
      rejected: t.reject,
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

  return (
    <div style={{ 
      background: bgColor, 
      minHeight: '100vh', 
      fontFamily: "'Cairo', sans-serif",
      direction: lang === 'ar' ? 'rtl' : 'ltr',
      padding: '24px'
    }}>
      <style>{`
        @keyframes fadeInUp { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
        @keyframes slideDown { from { opacity: 0; transform: translateY(-10px); } to { opacity: 1; transform: translateY(0); } }
        .animate-fade-in-up { animation: fadeInUp 0.5s ease forwards; }
        .animate-slide-down { animation: slideDown 0.3s ease forwards; }
        .animate-spin { animation: spin 1s linear infinite; }
        .hover-lift { transition: all 0.3s ease; }
        .hover-lift:hover { transform: translateY(-4px); box-shadow: 0 12px 28px rgba(0,0,0,0.12); }
        .btn-action { transition: all 0.3s ease; }
        .btn-action:hover { transform: translateY(-2px); }
        .filter-btn { transition: all 0.3s ease; }
        .filter-btn:hover { transform: translateY(-2px); }
        @media (max-width: 768px) {
          .stats-grid { grid-template-columns: repeat(2, 1fr) !important; }
          .dashboard-grid { grid-template-columns: 1fr !important; }
          .filter-bar { overflow-x: auto; flex-wrap: nowrap; }
        }
      `}</style>

      {/* ===== Feedback Message ===== */}
      {feedbackMessage && (
        <div className="animate-slide-down" style={{
          position: 'fixed', top: '80px', left: '50%', transform: 'translateX(-50%)',
          zIndex: 200, background: feedbackMessage.includes('✅') ? '#059669' : '#dc2626',
          color: 'white', padding: '12px 24px', borderRadius: '12px',
          fontWeight: 600, fontSize: '0.9rem', fontFamily: "'Cairo', sans-serif",
          boxShadow: '0 8px 24px rgba(0,0,0,0.2)',
        }}>
          {feedbackMessage}
        </div>
      )}

      {/* ===== Header ===== */}
      <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
        <div className="animate-fade-in-up" style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '24px',
          flexWrap: 'wrap',
          gap: '12px',
        }}>
          <div>
            <h1 style={{ fontSize: '1.5rem', fontWeight: 700, color: textColor }}>
              {t.dashboard}
            </h1>
            <p style={{ color: textSecondary }}>
              {t.welcome}، {user?.name || (lang === 'ar' ? 'حرفي' : 'Craftsman')}
              {stats.is_featured && (
                <span style={{
                  marginLeft: '8px',
                  background: 'linear-gradient(135deg, #f59e0b, #d97706)',
                  color: 'white',
                  padding: '2px 10px',
                  borderRadius: '12px',
                  fontSize: '0.7rem',
                  fontWeight: 600,
                }}>
                  {t.featured}
                </span>
              )}
            </p>
          </div>
          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
            <button
              onClick={() => navigate('/craftsman/home')}
              style={{
                padding: '10px 18px',
                borderRadius: '10px',
                border: `1px solid ${borderColor}`,
                background: 'transparent',
                color: textColor,
                cursor: 'pointer',
                fontFamily: "'Cairo', sans-serif",
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                transition: 'all 0.3s ease',
              }}
              onMouseEnter={(e) => { e.currentTarget.style.background = darkMode ? '#334155' : '#f1f5f9'; }}
              onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; }}
            >
              <Home size={16} />
              {t.home}
            </button>
            <button
              onClick={loadAllData}
              disabled={refreshing}
              style={{
                padding: '10px 18px',
                borderRadius: '10px',
                border: `1px solid ${borderColor}`,
                background: 'transparent',
                color: textColor,
                cursor: refreshing ? 'not-allowed' : 'pointer',
                fontFamily: "'Cairo', sans-serif",
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                opacity: refreshing ? 0.6 : 1,
                transition: 'all 0.3s ease',
              }}
            >
              <RefreshCw size={16} className={refreshing ? 'animate-spin' : ''} />
              {t.refresh}
            </button>
          </div>
        </div>

        {/* ===== Error ===== */}
        {error && (
          <div style={{
            background: darkMode ? 'rgba(220,38,38,0.1)' : '#fee2e2',
            color: '#dc2626',
            padding: '12px 16px',
            borderRadius: '10px',
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

        {/* ===== Stats (تم إزالة الأرباح) ===== */}
        <div className="stats-grid animate-fade-in-up" style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
          gap: '16px',
          marginBottom: '32px',
        }}>
          {statCards.map((stat, index) => (
            <div key={index} className="hover-lift" style={{
              background: cardBg,
              borderRadius: '14px',
              padding: '20px',
              border: `1px solid ${borderColor}`,
              borderTop: `3px solid ${stat.color}`,
              animationDelay: `${index * 0.1}s`,
            }}>
              <div style={{ color: stat.color, marginBottom: '8px' }}>
                {stat.icon}
              </div>
              <div style={{ fontSize: '1.3rem', fontWeight: 800, color: textColor }}>
                {stat.value}
              </div>
              <div style={{ fontSize: '0.75rem', color: textSecondary }}>
                {stat.label}
              </div>
            </div>
          ))}
        </div>

        {/* ===== Dashboard Grid ===== */}
        <div className="dashboard-grid" style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: '24px',
        }}>

          {/* ============================================================
               ✅ القسم 1: طلباتي الخاصة (Bookings)
               ============================================================ */}
          <div className="animate-fade-in-up">
            <div style={{
              background: cardBg,
              borderRadius: '16px',
              border: `1px solid ${borderColor}`,
              padding: '20px',
            }}>
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: '16px',
                flexWrap: 'wrap',
                gap: '8px',
              }}>
                <h2 style={{
                  fontSize: '1.1rem',
                  fontWeight: 700,
                  color: textColor,
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  margin: 0,
                }}>
                  <Bell size={18} style={{ color: '#f59e0b' }} />
                  {t.myBookings}
                  <span style={{
                    background: '#3b82f6',
                    color: 'white',
                    padding: '2px 8px',
                    borderRadius: '10px',
                    fontSize: '0.7rem',
                    fontWeight: 600,
                  }}>
                    {bookings.length}
                  </span>
                </h2>
                <button
                  onClick={() => navigate('/craftsman/bookings')}
                  style={{
                    fontSize: '0.8rem',
                    color: '#3b82f6',
                    textDecoration: 'none',
                    fontWeight: 600,
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    fontFamily: "'Cairo', sans-serif",
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px',
                  }}
                >
                  {t.viewAll} <ArrowRight size={14} />
                </button>
              </div>

              {/* ===== Booking Filters ===== */}
              <div className="filter-bar" style={{
                display: 'flex',
                gap: '6px',
                marginBottom: '12px',
                flexWrap: 'wrap',
              }}>
                {bookingFilters.map((f) => (
                  <button
                    key={f.value}
                    onClick={() => setBookingFilter(f.value)}
                    className="filter-btn"
                    style={{
                      padding: '4px 12px',
                      borderRadius: '20px',
                      border: bookingFilter === f.value ? '2px solid #3b82f6' : `1px solid ${borderColor}`,
                      background: bookingFilter === f.value ? (darkMode ? 'rgba(59,130,246,0.15)' : '#eff6ff') : 'transparent',
                      color: bookingFilter === f.value ? '#3b82f6' : textSecondary,
                      cursor: 'pointer',
                      fontSize: '0.7rem',
                      fontWeight: bookingFilter === f.value ? 700 : 500,
                      fontFamily: "'Cairo', sans-serif",
                      transition: 'all 0.3s ease',
                    }}
                  >
                    {f.label}
                    {f.value !== 'all' && (
                      <span style={{
                        marginLeft: '4px',
                        fontSize: '0.6rem',
                        background: bookingFilter === f.value ? '#3b82f6' : (darkMode ? '#334155' : '#e2e8f0'),
                        color: bookingFilter === f.value ? 'white' : textSecondary,
                        padding: '1px 6px',
                        borderRadius: '8px',
                      }}>
                        {bookings.filter(b => b.status === f.value).length}
                      </span>
                    )}
                  </button>
                ))}
              </div>

              {/* ===== Bookings List ===== */}
              {bookingsLoading ? (
                <div style={{ display: 'flex', justifyContent: 'center', padding: '30px' }}>
                  <Loader size={28} className="animate-spin" style={{ color: '#3b82f6' }} />
                </div>
              ) : filteredBookings.length > 0 ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', maxHeight: '400px', overflowY: 'auto' }}>
                  {filteredBookings.map((booking) => {
                    const statusStyle = getStatusColor(booking.status);
                    const availableActions = getAvailableActions(booking.status);
                    const isPending = booking.status === 'pending';
                    
                    return (
                      <div key={booking.id} style={{
                        padding: '12px 14px',
                        borderRadius: '10px',
                        border: `1px solid ${borderColor}`,
                        background: darkMode ? 'rgba(255,255,255,0.02)' : '#f8fafc',
                      }}>
                        <div style={{
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'flex-start',
                          flexWrap: 'wrap',
                          gap: '6px',
                        }}>
                          <div>
                            <div style={{
                              display: 'flex',
                              alignItems: 'center',
                              gap: '6px',
                              flexWrap: 'wrap',
                            }}>
                              <span style={{ fontWeight: 600, color: textColor, fontSize: '0.85rem' }}>
                                {booking.client?.name || t.customer}
                              </span>
                              <span style={{
                                padding: '2px 8px',
                                borderRadius: '10px',
                                fontSize: '0.6rem',
                                fontWeight: 600,
                                background: statusStyle.bg,
                                color: statusStyle.text,
                              }}>
                                {statusStyle.icon} {getStatusText(booking.status)}
                              </span>
                            </div>
                            <div style={{
                              fontSize: '0.75rem',
                              color: textSecondary,
                              marginTop: '2px',
                            }}>
                              {booking.service_title || 'خدمة'} • {formatDate(booking.booking_date)}
                              {booking.booking_time && ` • ${booking.booking_time}`}
                            </div>
                          </div>
                          <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap' }}>
                            {availableActions.map((action) => {
                              const actionColor = getActionColor(action);
                              const isProcessing = actionLoading[`booking_${booking.id}`] === action;
                              
                              return (
                                <button
                                  key={action}
                                  onClick={() => handleUpdateBookingStatus(booking.id, action)}
                                  disabled={isProcessing}
                                  className="btn-action"
                                  style={{
                                    padding: '4px 10px',
                                    borderRadius: '8px',
                                    border: 'none',
                                    background: isProcessing ? '#94a3b8' : actionColor.bg,
                                    color: 'white',
                                    cursor: isProcessing ? 'not-allowed' : 'pointer',
                                    fontSize: '0.65rem',
                                    fontWeight: 600,
                                    fontFamily: "'Cairo', sans-serif",
                                    opacity: isProcessing ? 0.6 : 1,
                                    transition: 'all 0.3s ease',
                                  }}
                                >
                                  {isProcessing ? <Loader size={10} className="animate-spin" /> : null}
                                  {isProcessing ? t.processing : getActionLabel(action)}
                                </button>
                              );
                            })}
                            <button
                              onClick={() => navigate(`/booking-details/${booking.id}`)}
                              style={{
                                padding: '4px 10px',
                                borderRadius: '8px',
                                border: `1px solid ${borderColor}`,
                                background: 'transparent',
                                color: textSecondary,
                                cursor: 'pointer',
                                fontSize: '0.65rem',
                                fontFamily: "'Cairo', sans-serif",
                              }}
                            >
                              {t.details}
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div style={{
                  textAlign: 'center',
                  padding: '30px',
                  color: textSecondary,
                  fontSize: '0.9rem',
                }}>
                  <Bell size={32} style={{ opacity: 0.2, marginBottom: '8px' }} />
                  <p>{t.noBookings}</p>
                </div>
              )}
            </div>
          </div>

          {/* ============================================================
               ✅ القسم 2: طلبات عامة (Service Posts)
               ============================================================ */}
          <div className="animate-fade-in-up delay-100">
            <div style={{
              background: cardBg,
              borderRadius: '16px',
              border: `1px solid ${borderColor}`,
              padding: '20px',
            }}>
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: '16px',
                flexWrap: 'wrap',
                gap: '8px',
              }}>
                <h2 style={{
                  fontSize: '1.1rem',
                  fontWeight: 700,
                  color: textColor,
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  margin: 0,
                }}>
                  <FileText size={18} style={{ color: '#8b5cf6' }} />
                  {t.generalRequests}
                  <span style={{
                    background: '#8b5cf6',
                    color: 'white',
                    padding: '2px 8px',
                    borderRadius: '10px',
                    fontSize: '0.7rem',
                    fontWeight: 600,
                  }}>
                    {servicePosts.length}
                  </span>
                </h2>
                <button
                  onClick={() => navigate('/craftsman/posts')}
                  style={{
                    fontSize: '0.8rem',
                    color: '#8b5cf6',
                    textDecoration: 'none',
                    fontWeight: 600,
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    fontFamily: "'Cairo', sans-serif",
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px',
                  }}
                >
                  {t.viewAll} <ArrowRight size={14} />
                </button>
              </div>

              {/* ===== Post Filters ===== */}
              <div className="filter-bar" style={{
                display: 'flex',
                gap: '6px',
                marginBottom: '12px',
                flexWrap: 'wrap',
              }}>
                <button
                  onClick={() => setPostFilter('')}
                  className="filter-btn"
                  style={{
                    padding: '4px 12px',
                    borderRadius: '20px',
                    border: postFilter === '' ? '2px solid #8b5cf6' : `1px solid ${borderColor}`,
                    background: postFilter === '' ? (darkMode ? 'rgba(139,92,246,0.15)' : '#f5f3ff') : 'transparent',
                    color: postFilter === '' ? '#8b5cf6' : textSecondary,
                    cursor: 'pointer',
                    fontSize: '0.7rem',
                    fontWeight: postFilter === '' ? 700 : 500,
                    fontFamily: "'Cairo', sans-serif",
                  }}
                >
                  {t.all}
                </button>
                <button
                  onClick={() => setPostFilter('emergency')}
                  className="filter-btn"
                  style={{
                    padding: '4px 12px',
                    borderRadius: '20px',
                    border: postFilter === 'emergency' ? '2px solid #dc2626' : `1px solid ${borderColor}`,
                    background: postFilter === 'emergency' ? (darkMode ? 'rgba(220,38,38,0.15)' : '#fee2e2') : 'transparent',
                    color: postFilter === 'emergency' ? '#dc2626' : textSecondary,
                    cursor: 'pointer',
                    fontSize: '0.7rem',
                    fontWeight: postFilter === 'emergency' ? 700 : 500,
                    fontFamily: "'Cairo', sans-serif",
                  }}
                >
                  {lang === 'ar' ? 'طوارئ' : 'Emergency'}
                </button>
                <button
                  onClick={() => setPostFilter('high')}
                  className="filter-btn"
                  style={{
                    padding: '4px 12px',
                    borderRadius: '20px',
                    border: postFilter === 'high' ? '2px solid #f59e0b' : `1px solid ${borderColor}`,
                    background: postFilter === 'high' ? (darkMode ? 'rgba(245,158,11,0.15)' : '#fef3c7') : 'transparent',
                    color: postFilter === 'high' ? '#f59e0b' : textSecondary,
                    cursor: 'pointer',
                    fontSize: '0.7rem',
                    fontWeight: postFilter === 'high' ? 700 : 500,
                    fontFamily: "'Cairo', sans-serif",
                  }}
                >
                  {lang === 'ar' ? 'عالي' : 'High'}
                </button>
                <button
                  onClick={() => setPostFilter('medium')}
                  className="filter-btn"
                  style={{
                    padding: '4px 12px',
                    borderRadius: '20px',
                    border: postFilter === 'medium' ? '2px solid #f59e0b' : `1px solid ${borderColor}`,
                    background: postFilter === 'medium' ? (darkMode ? 'rgba(245,158,11,0.15)' : '#fef3c7') : 'transparent',
                    color: postFilter === 'medium' ? '#f59e0b' : textSecondary,
                    cursor: 'pointer',
                    fontSize: '0.7rem',
                    fontWeight: postFilter === 'medium' ? 700 : 500,
                    fontFamily: "'Cairo', sans-serif",
                  }}
                >
                  {lang === 'ar' ? 'متوسط' : 'Medium'}
                </button>
              </div>

              {/* ===== Posts List ===== */}
              {postsLoading ? (
                <div style={{ display: 'flex', justifyContent: 'center', padding: '30px' }}>
                  <Loader size={28} className="animate-spin" style={{ color: '#8b5cf6' }} />
                </div>
              ) : filteredPosts.length > 0 ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', maxHeight: '400px', overflowY: 'auto' }}>
                  {filteredPosts.map((post) => {
                    const alreadyResponded = post.already_responded || false;
                    const statusStyle = getPostStatusColor(post.status);
                    
                    return (
                      <div key={post.id} style={{
                        padding: '12px 14px',
                        borderRadius: '10px',
                        border: `1px solid ${borderColor}`,
                        background: darkMode ? 'rgba(255,255,255,0.02)' : '#f8fafc',
                        opacity: alreadyResponded ? 0.6 : 1,
                      }}>
                        <div style={{
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'flex-start',
                          flexWrap: 'wrap',
                          gap: '6px',
                        }}>
                          <div style={{ flex: 1 }}>
                            <div style={{
                              display: 'flex',
                              alignItems: 'center',
                              gap: '6px',
                              flexWrap: 'wrap',
                            }}>
                              <span style={{ fontWeight: 600, color: textColor, fontSize: '0.85rem' }}>
                                {post.title || 'طلب خدمة'}
                              </span>
                              {post.urgency === 'emergency' && (
                                <span style={{
                                  padding: '2px 8px',
                                  borderRadius: '10px',
                                  fontSize: '0.6rem',
                                  fontWeight: 600,
                                  background: '#fee2e2',
                                  color: '#dc2626',
                                }}>
                                  🚨 {lang === 'ar' ? 'طوارئ' : 'Emergency'}
                                </span>
                              )}
                              <span style={{
                                padding: '2px 8px',
                                borderRadius: '10px',
                                fontSize: '0.6rem',
                                fontWeight: 600,
                                background: statusStyle.bg,
                                color: statusStyle.text,
                              }}>
                                {getPostStatusText(post.status)}
                              </span>
                              {alreadyResponded && (
                                <span style={{
                                  padding: '2px 8px',
                                  borderRadius: '10px',
                                  fontSize: '0.6rem',
                                  fontWeight: 600,
                                  background: '#d1fae5',
                                  color: '#059669',
                                }}>
                                  ✅ {t.alreadyResponded}
                                </span>
                              )}
                            </div>
                            <div style={{
                              fontSize: '0.75rem',
                              color: textSecondary,
                              marginTop: '2px',
                            }}>
                              {post.city || ''}
                              {post.budget_from && post.budget_to && (
                                <span> • 💰 {post.budget_from} - {post.budget_to} {t.egp}</span>
                              )}
                              {post.urgency && post.urgency !== 'emergency' && (
                                <span> • ⚡ {post.urgency}</span>
                              )}
                            </div>
                          </div>
                          <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap' }}>
                            {!alreadyResponded && post.status === 'open' && (
                              <button
                                onClick={() => handleRespondToPost(post.id)}
                                disabled={actionLoading[`post_${post.id}`] === 'respond'}
                                style={{
                                  padding: '4px 10px',
                                  borderRadius: '8px',
                                  border: 'none',
                                  background: actionLoading[`post_${post.id}`] === 'respond' ? '#94a3b8' : '#8b5cf6',
                                  color: 'white',
                                  cursor: actionLoading[`post_${post.id}`] === 'respond' ? 'not-allowed' : 'pointer',
                                  fontSize: '0.65rem',
                                  fontWeight: 600,
                                  fontFamily: "'Cairo', sans-serif",
                                  transition: 'all 0.3s ease',
                                }}
                              >
                                {actionLoading[`post_${post.id}`] === 'respond' ? (
                                  <Loader size={10} className="animate-spin" />
                                ) : (
                                  <MessageCircle size={10} />
                                )}
                                {actionLoading[`post_${post.id}`] === 'respond' ? t.processing : t.respond}
                              </button>
                            )}
                            <button
                              onClick={() => navigate(`/service-post/${post.id}`)}
                              style={{
                                padding: '4px 10px',
                                borderRadius: '8px',
                                border: `1px solid ${borderColor}`,
                                background: 'transparent',
                                color: textSecondary,
                                cursor: 'pointer',
                                fontSize: '0.65rem',
                                fontFamily: "'Cairo', sans-serif",
                              }}
                            >
                              {t.details}
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div style={{
                  textAlign: 'center',
                  padding: '30px',
                  color: textSecondary,
                  fontSize: '0.9rem',
                }}>
                  <FileText size={32} style={{ opacity: 0.2, marginBottom: '8px' }} />
                  <p>{t.noPosts}</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* ===== Quick Actions ===== */}
        <div className="animate-fade-in-up delay-200" style={{
          marginTop: '24px',
          display: 'flex',
          gap: '12px',
          flexWrap: 'wrap',
          justifyContent: 'center',
        }}>
          <Link
            to="/profile"
            style={{
              padding: '12px 24px',
              borderRadius: '12px',
              background: darkMode ? 'rgba(59,130,246,0.15)' : '#eff6ff',
              color: '#3b82f6',
              textDecoration: 'none',
              fontWeight: 600,
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              transition: 'all 0.3s ease',
              border: `1px solid ${borderColor}`,
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = '#3b82f6';
              e.currentTarget.style.color = 'white';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = darkMode ? 'rgba(59,130,246,0.15)' : '#eff6ff';
              e.currentTarget.style.color = '#3b82f6';
            }}
          >
            <User size={18} />
            {lang === 'ar' ? 'الملف الشخصي' : 'Profile'}
          </Link>
          <Link
            to="/subscription"
            style={{
              padding: '12px 24px',
              borderRadius: '12px',
              background: darkMode ? 'rgba(139,92,246,0.15)' : '#f5f3ff',
              color: '#8b5cf6',
              textDecoration: 'none',
              fontWeight: 600,
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              transition: 'all 0.3s ease',
              border: `1px solid ${borderColor}`,
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = '#8b5cf6';
              e.currentTarget.style.color = 'white';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = darkMode ? 'rgba(139,92,246,0.15)' : '#f5f3ff';
              e.currentTarget.style.color = '#8b5cf6';
            }}
          >
            <Award size={18} />
            {lang === 'ar' ? 'الاشتراكات' : 'Subscriptions'}
          </Link>
          <Link
            to="/notifications"
            style={{
              padding: '12px 24px',
              borderRadius: '12px',
              background: darkMode ? 'rgba(245,158,11,0.15)' : '#fef3c7',
              color: '#f59e0b',
              textDecoration: 'none',
              fontWeight: 600,
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              transition: 'all 0.3s ease',
              border: `1px solid ${borderColor}`,
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = '#f59e0b';
              e.currentTarget.style.color = 'white';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = darkMode ? 'rgba(245,158,11,0.15)' : '#fef3c7';
              e.currentTarget.style.color = '#f59e0b';
            }}
          >
            <Bell size={18} />
            {lang === 'ar' ? 'الإشعارات' : 'Notifications'}
          </Link>
        </div>
      </div>
    </div>
  );
};

export default CraftsmanDashboardPage;