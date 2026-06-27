// src/pages/CraftsmanHomePage.jsx
import React, { useState, useEffect, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useTheme } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import { 
  Phone, Star, MapPin, Calendar,
  Clock, CheckCircle, XCircle, TrendingUp,
  Users, Wrench, DollarSign, ArrowRight,
  Bell, Settings, Award, BarChart3, Loader,
  Sparkles, AlertCircle, RefreshCw, Eye, User,
  FileText, MessageCircle, Home, LayoutDashboard, ListTodo
} from 'lucide-react';

const CraftsmanHomePage = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { darkMode } = useTheme();
  const [lang, setLang] = useState('ar');
  
  // ✅ طلبات خاصة (Bookings) - حجوزات موجهة للحرفي
  const [myBookings, setMyBookings] = useState([]);
  const [bookingsLoading, setBookingsLoading] = useState(true);
  
  // ✅ طلبات عامة (Service Posts) - منشورات في نفس المهنة
  const [servicePosts, setServicePosts] = useState([]);
  const [postsLoading, setPostsLoading] = useState(true);
  
  const [refreshing, setRefreshing] = useState(false);
  const [stats, setStats] = useState({ 
    pending: 0, 
    confirmed: 0,
    in_progress: 0,
    completed: 0, 
    total: 0, 
    rating: 0,
    reviews_count: 0,
    is_featured: false
  });
  const [actionLoading, setActionLoading] = useState({});
  const [feedbackMessage, setFeedbackMessage] = useState('');
  const [craftsmanId, setCraftsmanId] = useState(null);

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

  // Language
  useEffect(() => {
    const savedLang = localStorage.getItem('language') || 'ar';
    setLang(savedLang);
    const handleLanguageChange = () => setLang(localStorage.getItem('language') || 'ar');
    window.addEventListener('languagechange', handleLanguageChange);
    return () => window.removeEventListener('languagechange', handleLanguageChange);
  }, []);

  // ✅ Load all data
  const loadAllData = useCallback(async () => {
    setRefreshing(true);
    try {
      // 1. جلب إحصائيات الحرفي
      const statsData = await api.getCraftsmanStats();
      setStats({
        pending: statsData.stats?.pending_bookings || 0,
        confirmed: statsData.stats?.confirmed_bookings || 0,
        in_progress: statsData.stats?.in_progress_bookings || 0,
        completed: statsData.stats?.completed_bookings || 0,
        total: (statsData.stats?.pending_bookings || 0) + 
               (statsData.stats?.confirmed_bookings || 0) +
               (statsData.stats?.in_progress_bookings || 0) +
               (statsData.stats?.completed_bookings || 0) + 
               (statsData.stats?.cancelled_bookings || 0),
        rating: statsData.stats?.rating || 0,
        reviews_count: statsData.stats?.reviews_count || 0,
        is_featured: statsData.stats?.is_featured || false,
      });
      
      // 2. جلب الحجوزات الخاصة (Bookings) - جميع الحالات
      await loadMyBookings();
      
      // 3. جلب منشورات الخدمات العامة (Service Posts)
      await loadServicePosts();
      
    } catch (error) {
      console.error('Error loading craftsman data:', error);
    }
    setRefreshing(false);
  }, []);

  // ✅ جلب الحجوزات الخاصة - GET /craftsman/bookings
  const loadMyBookings = async () => {
    setBookingsLoading(true);
    try {
      const bookingsData = await api.getCraftsmanBookings();
      const allBookings = bookingsData.bookings?.data || [];
      
      // عرض جميع الحجوزات (ليست فقط pending)
      setMyBookings(allBookings);
      
      // تحديث الإحصائيات
      const pendingCount = allBookings.filter(b => b.status === 'pending').length;
      const confirmedCount = allBookings.filter(b => b.status === 'confirmed').length;
      const inProgressCount = allBookings.filter(b => b.status === 'in_progress').length;
      const completedCount = allBookings.filter(b => b.status === 'completed').length;
      
      setStats(prev => ({
        ...prev,
        pending: pendingCount,
        confirmed: confirmedCount,
        in_progress: inProgressCount,
        completed: completedCount,
      }));
      
    } catch (error) {
      console.error('Error loading bookings:', error);
      setMyBookings([]);
    }
    setBookingsLoading(false);
  };

  // ✅ جلب منشورات الخدمات العامة - GET /craftsman/service-posts
  const loadServicePosts = async () => {
    setPostsLoading(true);
    try {
      // ✅ جلب الطلبات العامة (نفس الـ API المستخدم في CraftsmanPostsPage)
      const postsData = await api.getServicePosts({
        per_page: 10,
        sort_by: 'newest',
      });
      
      console.log('📥 [CraftsmanHomePage] Service posts response:', postsData);
      
      // ✅ استخراج البيانات من عدة صيغ
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
      
      // ✅ التأكد من وجود already_responded
      const postsWithResponded = postsArray.map(post => ({
        ...post,
        already_responded: post.already_responded || post.has_responded || false,
      }));
      
      console.log(`📊 [CraftsmanHomePage] Found ${postsWithResponded.length} service posts`);
      setServicePosts(postsWithResponded);
    } catch (error) {
      console.error('Error loading service posts:', error);
      setServicePosts([]);
    }
    setPostsLoading(false);
  };

  useEffect(() => {
    loadAllData();
    
    // Refresh every 30 seconds
    const interval = setInterval(loadAllData, 30000);
    return () => clearInterval(interval);
  }, [loadAllData]);

  // Handle refresh
  const handleRefresh = () => {
    loadAllData();
  };

  // Show feedback message
  const showFeedback = (message, isSuccess = true) => {
    setFeedbackMessage(message);
    setTimeout(() => setFeedbackMessage(''), 4000);
  };

  // ✅ تحديث حالة الحجز (Craftsman) - PATCH /craftsman/bookings/{id}/status
  // ✅ مع إضافة localStorage عند إكمال العمل
  const handleUpdateBookingStatus = async (bookingId, newStatus) => {
    setActionLoading(prev => ({ ...prev, [`booking_${bookingId}`]: newStatus }));
    
    let statusMessage = '';
    if (newStatus === 'confirmed') {
      statusMessage = lang === 'ar' ? '✅ تم قبول الحجز بنجاح!' : '✅ Booking accepted successfully!';
    } else if (newStatus === 'in_progress') {
      statusMessage = lang === 'ar' ? '✅ تم بدء العمل!' : '✅ Work started!';
    } else if (newStatus === 'completed') {
      statusMessage = lang === 'ar' ? '✅ تم إكمال العمل بنجاح!' : '✅ Work completed successfully!';
      
      // ✅ ✅ ✅ إضافة إشارة لتحديث صفحة العميل (عند إكمال العمل)
      localStorage.setItem('refreshClientBookings', 'true');
      localStorage.setItem('lastCompletedBooking', bookingId);
      localStorage.setItem('lastCompletedTime', Date.now().toString());
      console.log('🔵 [CraftsmanHomePage] Booking completed, refresh signal sent to client');
      
    } else if (newStatus === 'rejected') {
      const reason = prompt(lang === 'ar' ? 'اكتب سبب الرفض (اختياري):' : 'Enter rejection reason (optional):');
      if (reason !== null) {
        try {
          await api.updateBookingStatus(bookingId, newStatus, reason || 'غير متاح');
          showFeedback(lang === 'ar' ? '❌ تم رفض الحجز' : '❌ Booking rejected', false);
          await loadAllData();
          setActionLoading(prev => ({ ...prev, [`booking_${bookingId}`]: null }));
          return;
        } catch (error) {
          console.error('Reject error:', error);
          showFeedback(error.message || (lang === 'ar' ? '❌ حدث خطأ' : '❌ Error occurred'), false);
          setActionLoading(prev => ({ ...prev, [`booking_${bookingId}`]: null }));
          return;
        }
      } else {
        setActionLoading(prev => ({ ...prev, [`booking_${bookingId}`]: null }));
        return;
      }
    }
    
    try {
      await api.updateBookingStatus(bookingId, newStatus);
      showFeedback(statusMessage);
      
      // تحديث القائمة
      await loadAllData();
      
    } catch (error) {
      console.error('Update status error:', error);
      showFeedback(error.message || (lang === 'ar' ? '❌ حدث خطأ' : '❌ Error occurred'), false);
    }
    
    setActionLoading(prev => ({ ...prev, [`booking_${bookingId}`]: null }));
  };

  // ✅ الرد على منشور خدمة (Service Post) - POST /craftsman/service-posts/{id}/respond
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
      const responseData = {
        message: message,
        offered_price: price ? parseFloat(price) : undefined,
        estimated_days: days ? parseInt(days) : undefined,
      };
      
      await api.respondToServicePost(postId, responseData);
      showFeedback(lang === 'ar' ? '✅ تم إرسال ردك بنجاح!' : '✅ Response sent successfully!');
      
      // ✅ تحديث القائمة - تغيير حالة المنشور إلى "تم الرد"
      setServicePosts(prev => prev.map(p => 
        p.id === postId ? { ...p, already_responded: true } : p
      ));
      
    } catch (error) {
      console.error('Respond error:', error);
      showFeedback(error.message || (lang === 'ar' ? '❌ حدث خطأ' : '❌ Error occurred'), false);
    }
    
    setActionLoading(prev => ({ ...prev, [`post_${postId}`]: null }));
  };

  // Translations
  const t = {
    welcome: lang === 'ar' ? 'مرحباً' : 'Welcome',
    newRequests: (count) => lang === 'ar' ? `لديك ${count} طلبات جديدة` : `You have ${count} new requests`,
    dashboard: lang === 'ar' ? ' لوحة التحكم' : ' Dashboard',
    home: lang === 'ar' ? ' الرئيسية' : ' Home',
    pending: lang === 'ar' ? 'قيد الانتظار' : 'Pending',
    confirmed: lang === 'ar' ? 'مؤكد' : 'Confirmed',
    inProgress: lang === 'ar' ? 'قيد التنفيذ' : 'In Progress',
    completed: lang === 'ar' ? 'مكتمل' : 'Completed',
    total: lang === 'ar' ? 'إجمالي الطلبات' : 'Total Requests',
    rating: lang === 'ar' ? 'التقييم' : 'Rating',
    egp: lang === 'ar' ? 'ج.م' : 'EGP',
    incomingRequests: lang === 'ar' ? ' طلباتي الخاصة' : ' My Bookings',
    noRequests: lang === 'ar' ? 'لا توجد حجوزات' : 'No bookings ',
    noRequestsDesc: lang === 'ar' ? 'كل الحجوزات هتظهر هنا' : 'All bookings will appear here',
    loading: lang === 'ar' ? 'جاري التحميل...' : 'Loading...',
    waiting: lang === 'ar' ? 'قيد الانتظار' : 'Pending',
    quickLinks: lang === 'ar' ? 'روابط سريعة' : 'Quick Links',
    profile: lang === 'ar' ? 'الملف الشخصي' : 'Profile',
    subscriptions: lang === 'ar' ? 'الاشتراكات' : 'Subscriptions',
    accept: lang === 'ar' ? 'قبول' : 'Accept',
    startWork: lang === 'ar' ? 'بدء العمل' : 'Start Work',
    completeWork: lang === 'ar' ? 'إكمال العمل' : 'Complete Work',
    reject: lang === 'ar' ? 'رفض' : 'Reject',
    processing: lang === 'ar' ? 'جاري...' : '...',
    refresh: lang === 'ar' ? 'تحديث' : 'Refresh',
    customer: lang === 'ar' ? 'العميل' : 'Customer',
    date: lang === 'ar' ? 'التاريخ' : 'Date',
    description: lang === 'ar' ? 'الوصف' : 'Description',
    ratingLabel: lang === 'ar' ? 'التقييم' : 'Rating',
    featured: lang === 'ar' ? 'مميز' : 'Featured',
    generalRequests: lang === 'ar' ? ' طلبات العامة' : ' General Requests',
    generalRequestsDesc: lang === 'ar' ? 'طلبات من عملاء يبحثون عن حرفي' : 'Requests from clients looking for a craftsman',
    noGeneralRequests: lang === 'ar' ? 'لا توجد طلبات عامة' : 'No general requests',
    respond: lang === 'ar' ? 'رد على الطلب' : 'Respond',
    alreadyResponded: lang === 'ar' ? 'تم الرد' : 'Responded',
    budget: lang === 'ar' ? 'الميزانية' : 'Budget',
    urgency: lang === 'ar' ? 'الإلحاح' : 'Urgency',
    all: lang === 'ar' ? 'الكل' : 'All',
    details: lang === 'ar' ? 'تفاصيل' : 'Details',
    viewAll: lang === 'ar' ? 'عرض الكل' : 'View All',
    myBookings: lang === 'ar' ? ' طلباتي الخاصة' : ' My Bookings',
  };

  // Dynamic colors
  const bgColor = darkMode ? '#0f172a' : '#f8fafc';
  const cardBg = darkMode ? '#1e293b' : '#ffffff';
  const textColor = darkMode ? '#f1f5f9' : '#0f172a';
  const textSecondary = darkMode ? '#94a3b8' : '#64748b';
  const borderColor = darkMode ? '#334155' : '#e2e8f0';

  // ✅ إحصائيات للحالة (تم إزالة الأرباح)
  const statCards = [
    { value: stats.pending, label: t.pending, color: '#f59e0b', icon: <Bell size={24} /> },
    { value: stats.confirmed, label: t.confirmed, color: '#3b82f6', icon: <CheckCircle size={24} /> },
    { value: stats.in_progress, label: t.inProgress, color: '#8b5cf6', icon: <Loader size={24} /> },
    { value: stats.completed, label: t.completed, color: '#059669', icon: <CheckCircle size={24} /> },
    { value: stats.rating || 0, label: t.ratingLabel, color: '#f59e0b', icon: <Star size={24} /> },
  ];

  const quickLinkStyle = (color, bg) => ({
    display: 'flex', alignItems: 'center', gap: '10px',
    padding: '12px 16px', borderRadius: '12px',
    textDecoration: 'none', color: color, fontWeight: 600,
    fontSize: '0.9rem', fontFamily: "'Cairo', sans-serif",
    background: bg, transition: 'all 0.3s ease',
  });

  // ✅ حساب عدد الطلبات العامة غير المستجابة
  const pendingPosts = servicePosts.filter(p => !p.already_responded).length;

  // ✅ الحصول على نص الحالة
  const getStatusText = (status) => {
    const map = {
      pending: t.pending,
      confirmed: t.confirmed,
      in_progress: t.inProgress,
      completed: t.completed,
    };
    return map[status] || status;
  };

  // ✅ الحصول على لون الحالة
  const getStatusColor = (status) => {
    const colors = {
      pending: { bg: '#fef3c7', text: '#d97706' },
      confirmed: { bg: '#dbeafe', text: '#2563eb' },
      in_progress: { bg: '#f3e8ff', text: '#7c3aed' },
      completed: { bg: '#d1fae5', text: '#059669' },
    };
    return colors[status] || colors.pending;
  };

  // ✅ الأزرار المتاحة حسب الحالة (مع زر رفض)
  const getAvailableActions = (status) => {
    const actions = {
      pending: ['confirmed', 'rejected'],
      confirmed: ['in_progress'],
      in_progress: ['completed'],
      completed: [],
    };
    return actions[status] || [];
  };

  // ✅ اسم الزر حسب الحالة المستهدفة
  const getActionLabel = (action) => {
    const map = {
      confirmed: t.accept,
      in_progress: t.startWork,
      completed: t.completeWork,
      rejected: t.reject,
    };
    return map[action] || action;
  };

  // ✅ لون الزر حسب الحالة المستهدفة
  const getActionColor = (action) => {
    const colors = {
      confirmed: { bg: '#059669', hover: '#047857' },
      in_progress: { bg: '#8b5cf6', hover: '#7c3aed' },
      completed: { bg: '#059669', hover: '#047857' },
      rejected: { bg: '#dc2626', hover: '#b91c1c' },
    };
    return colors[action] || colors.confirmed;
  };

  // ✅ فلترة الحجوزات
  const [bookingFilter, setBookingFilter] = useState('all');
  const filteredBookings = bookingFilter === 'all' 
    ? myBookings 
    : myBookings.filter(b => b.status === bookingFilter);

  const bookingFilters = [
    { value: 'all', label: t.all },
    { value: 'pending', label: t.pending },
    { value: 'confirmed', label: t.confirmed },
    { value: 'in_progress', label: t.inProgress },
    { value: 'completed', label: t.completed },
  ];

  return (
    <div style={{ background: bgColor, minHeight: '100vh', fontFamily: "'Cairo', sans-serif", direction: lang === 'ar' ? 'rtl' : 'ltr' }}>
      <style>{`
        @keyframes fadeInUp { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
        @keyframes slideDown { from { opacity: 0; transform: translateY(-10px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes pulse { 0%, 100% { transform: scale(1); } 50% { transform: scale(1.05); } }
        @keyframes shimmer { 0% { background-position: -200% 0; } 100% { background-position: 200% 0; } }
        
        .animate-fade-in-up { animation: fadeInUp 0.5s ease forwards; }
        .animate-fade-in { animation: fadeIn 0.3s ease forwards; }
        .animate-slide-down { animation: slideDown 0.3s ease forwards; }
        
        .delay-100 { animation-delay: 0.1s; }
        .delay-200 { animation-delay: 0.2s; }
        .delay-300 { animation-delay: 0.3s; }
        .delay-400 { animation-delay: 0.4s; }
        
        .hover-lift { transition: all 0.3s ease; }
        .hover-lift:hover { transform: translateY(-4px); box-shadow: 0 12px 28px rgba(0,0,0,0.12); }
        
        .btn-action { transition: all 0.3s ease; }
        .btn-action:hover { transform: translateY(-2px); }
        
        .skeleton {
          background: linear-gradient(90deg, ${darkMode ? '#334155' : '#e2e8f0'} 25%, ${darkMode ? '#1e293b' : '#f1f5f9'} 50%, ${darkMode ? '#334155' : '#e2e8f0'} 75%);
          background-size: 200% 100%;
          animation: shimmer 1.5s infinite;
        }
        
        .filter-btn {
          transition: all 0.3s ease;
          cursor: pointer;
        }
        .filter-btn:hover {
          transform: translateY(-2px);
        }
        
        @media (max-width: 768px) {
          .stats-grid { grid-template-columns: repeat(2, 1fr) !important; }
          .content-grid { grid-template-columns: 1fr !important; }
          .request-actions { flex-direction: column; }
          .filter-bar { overflow-x: auto; flex-wrap: nowrap; }
        }
      `}</style>

      {/* Feedback Message */}
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

      {/* ===== Hero ===== */}
      <div style={{
        background: darkMode ? 'linear-gradient(160deg, #065f46, #047857)' : 'linear-gradient(160deg, #059669, #047857)',
        color: 'white', padding: '48px 0',
      }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 24px' }}>
          <div className="animate-fade-in-up" style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '8px' }}>
            <div style={{
              width: '56px', height: '56px', borderRadius: '16px',
              background: 'rgba(255,255,255,0.2)', display: 'flex',
              alignItems: 'center', justifyContent: 'center',
              fontSize: '1.5rem', fontWeight: 700,
            }}>
              {user?.name?.[0] || 'ح'}
            </div>
            <div>
              <h1 style={{ fontSize: '1.75rem', fontWeight: 700, margin: 0 }}>{t.welcome}، {user?.name}</h1>
              <p style={{ fontSize: '1rem', opacity: 0.9, margin: '4px 0 0' }}>
                {stats.pending > 0 
                  ? t.newRequests(stats.pending)
                  : (lang === 'ar' ? '🎉 لا توجد طلبات جديدة' : '🎉 No new requests')}
              </p>
              {stats.is_featured && (
                <span style={{ 
                  display: 'inline-block', marginTop: '8px', 
                  background: 'rgba(255,255,255,0.2)', 
                  padding: '4px 16px', borderRadius: '50px', 
                  fontSize: '0.8rem' 
                }}>
                  ⭐ {t.featured}
                </span>
              )}
            </div>
            {/* ✅ زر Dashboard */}
            <button
              onClick={() => navigate('/craftsman/dashboard')}
              style={{
                marginRight: 'auto',
                padding: '10px 20px',
                borderRadius: '10px',
                background: 'rgba(255,255,255,0.2)',
                border: '1px solid rgba(255,255,255,0.3)',
                color: 'white',
                cursor: 'pointer',
                fontFamily: "'Cairo', sans-serif",
                fontWeight: 600,
                fontSize: '0.85rem',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                transition: 'all 0.3s ease',
              }}
              onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.3)'}
              onMouseLeave={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.2)'}
            >
              <LayoutDashboard size={18} />
              {t.dashboard}
            </button>
          </div>
        </div>
      </div>

      {/* ===== Stats (تم إزالة الأرباح) ===== */}
      <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '32px 24px' }}>
        <div className="stats-grid" style={{
          display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))',
          gap: '16px', marginBottom: '32px',
        }}>
          {statCards.map((stat, index) => (
            <div key={index} className="animate-fade-in-up hover-lift" style={{
              background: cardBg, borderRadius: '16px', padding: '20px',
              textAlign: 'center', border: `1px solid ${borderColor}`,
              borderTop: `3px solid ${stat.color}`, animationDelay: `${index * 0.1}s`,
            }}>
              <div style={{ color: stat.color, marginBottom: '8px', display: 'flex', justifyContent: 'center' }}>
                {stat.icon}
              </div>
              <div style={{ fontSize: '1.5rem', fontWeight: 800, color: textColor, marginBottom: '4px' }}>
                {stat.value}
              </div>
              <div style={{ fontSize: '0.75rem', color: textSecondary }}>{stat.label}</div>
            </div>
          ))}
        </div>

        {/* ===== Content Grid ===== */}
        <div className="content-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 320px', gap: '24px' }}>
          
          {/* ============================================================
               ✅ طلباتي الخاصة (Bookings) - عرض كل الطلبات
               ============================================================ */}
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', flexWrap: 'wrap', gap: '8px' }}>
              <h2 className="animate-fade-in-up" style={{
                fontSize: '1.2rem', fontWeight: 700, color: textColor,
                display: 'flex', alignItems: 'center', gap: '8px', margin: 0,
              }}>
                <Bell size={20} style={{ color: '#f59e0b' }} />
                {t.incomingRequests}
                <span style={{
                  background: '#3b82f6',
                  color: 'white',
                  padding: '2px 10px',
                  borderRadius: '12px',
                  fontSize: '0.75rem',
                  fontWeight: 700,
                }}>
                  {myBookings.length}
                </span>
              </h2>
              
              <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                <button onClick={handleRefresh} disabled={refreshing}
                  style={{
                    display: 'flex', alignItems: 'center', gap: '6px',
                    padding: '8px 14px', borderRadius: '10px',
                    border: `1px solid ${borderColor}`, background: 'transparent',
                    cursor: refreshing ? 'not-allowed' : 'pointer',
                    color: textColor, fontSize: '0.8rem',
                    fontWeight: 600, fontFamily: "'Cairo', sans-serif",
                    transition: 'all 0.3s ease',
                    opacity: refreshing ? 0.5 : 1,
                  }}>
                  <RefreshCw size={14} className={refreshing ? 'animate-spin' : ''} />
                  {t.refresh}
                </button>
                
                {/* ✅ رابط طلباتي الخاصة - "عرض الكل" */}
                <Link
                  to="/craftsman/bookings"
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    padding: '8px 14px',
                    borderRadius: '10px',
                    border: `1px solid ${borderColor}`,
                    background: 'transparent',
                    color: '#3b82f6',
                    textDecoration: 'none',
                    fontSize: '0.8rem',
                    fontWeight: 600,
                    fontFamily: "'Cairo', sans-serif",
                    transition: 'all 0.3s ease',
                  }}
                  onMouseEnter={(e) => { 
                    e.target.style.background = '#3b82f6'; 
                    e.target.style.color = 'white'; 
                  }}
                  onMouseLeave={(e) => { 
                    e.target.style.background = 'transparent'; 
                    e.target.style.color = '#3b82f6'; 
                  }}
                >
                  {t.viewAll} <ArrowRight size={14} />
                </Link>
              </div>
            </div>

            {/* ===== Booking Filters ===== */}
            <div className="filter-bar" style={{
              display: 'flex', gap: '6px', marginBottom: '16px', flexWrap: 'wrap',
            }}>
              {bookingFilters.map((f) => (
                <button
                  key={f.value}
                  onClick={() => setBookingFilter(f.value)}
                  className="filter-btn"
                  style={{
                    padding: '6px 14px',
                    borderRadius: '20px',
                    border: bookingFilter === f.value ? '2px solid #3b82f6' : `1px solid ${borderColor}`,
                    background: bookingFilter === f.value ? (darkMode ? 'rgba(59,130,246,0.15)' : '#eff6ff') : 'transparent',
                    color: bookingFilter === f.value ? '#3b82f6' : textSecondary,
                    cursor: 'pointer',
                    fontSize: '0.75rem',
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
                      {myBookings.filter(b => b.status === f.value).length}
                    </span>
                  )}
                </button>
              ))}
            </div>

            {bookingsLoading ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {[1, 2, 3].map(i => (
                  <div key={i} className="skeleton" style={{ borderRadius: '14px', height: '140px' }} />
                ))}
              </div>
            ) : filteredBookings.length > 0 ? (
              filteredBookings.map((r, index) => {
                const statusStyle = getStatusColor(r.status);
                const availableActions = getAvailableActions(r.status);
                const isPending = r.status === 'pending';
                
                return (
                  <div key={r.id} className="animate-fade-in-up hover-lift" style={{
                    background: cardBg, borderRadius: '14px', padding: '16px 18px',
                    border: `1px solid ${borderColor}`, marginBottom: '10px',
                    animationDelay: `${index * 0.05}s`,
                  }}>
                    {/* Header */}
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px', flexWrap: 'wrap', gap: '8px' }}>
                      <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap' }}>
                          <span style={{ fontWeight: 600, color: textColor, fontSize: '0.9rem' }}>
                            {r.service?.title || r.service_title || (lang === 'ar' ? 'خدمة' : 'Service')}
                          </span>
                          <span style={{
                            padding: '2px 10px', borderRadius: '12px', fontSize: '0.65rem', fontWeight: 600,
                            background: statusStyle.bg, color: statusStyle.text,
                          }}>
                            {getStatusText(r.status)}
                          </span>
                        </div>
                        <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', fontSize: '0.75rem', color: textSecondary, marginTop: '2px' }}>
                          <span style={{ display: 'flex', alignItems: 'center', gap: '3px' }}>
                            <User size={12} />
                            {r.client?.name || r.customer_name || t.customer}
                          </span>
                          <span style={{ display: 'flex', alignItems: 'center', gap: '3px' }}>
                            <Calendar size={12} />
                            {formatDate(r.booking_date)}
                          </span>
                          {r.booking_time && (
                            <span style={{ display: 'flex', alignItems: 'center', gap: '3px' }}>
                              <Clock size={12} />
                              {r.booking_time}
                            </span>
                          )}
                          {r.total_price && (
                            <span style={{ display: 'flex', alignItems: 'center', gap: '3px', color: '#059669', fontWeight: 600 }}>
                              <DollarSign size={12} />
                              {r.total_price} {t.egp}
                            </span>
                          )}
                        </div>
                      </div>
                      <button
                        onClick={() => navigate(`/booking-details/${r.id}`)}
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

                    {/* Description */}
                    {r.notes && (
                      <p style={{ fontSize: '0.8rem', color: textSecondary, marginBottom: '10px', lineHeight: 1.5 }}>
                        📝 {r.notes}
                      </p>
                    )}

                    {/* ✅ Actions - مع زر رفض */}
                    <div className="request-actions" style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                      {/* ✅ زر رفض - يظهر فقط للحجوزات pending */}
                      {isPending && (
                        <button 
                          onClick={() => handleUpdateBookingStatus(r.id, 'rejected')}
                          disabled={actionLoading[`booking_${r.id}`] === 'rejected'}
                          className="btn-action"
                          style={{
                            display: 'flex', alignItems: 'center', gap: '4px',
                            padding: '6px 12px', borderRadius: '8px',
                            border: '1px solid #dc2626', background: 'transparent',
                            color: '#dc2626', cursor: 'pointer', fontSize: '0.7rem',
                            fontWeight: 600, fontFamily: "'Cairo', sans-serif",
                            opacity: actionLoading[`booking_${r.id}`] ? 0.5 : 1,
                          }}
                          onMouseEnter={(e) => { if(!actionLoading[`booking_${r.id}`]) { e.target.style.background = '#dc2626'; e.target.style.color = 'white'; } }}
                          onMouseLeave={(e) => { e.target.style.background = 'transparent'; e.target.style.color = '#dc2626'; }}
                        >
                          {actionLoading[`booking_${r.id}`] === 'rejected' ? (
                            <Loader size={12} className="animate-spin" />
                          ) : (
                            <XCircle size={12} />
                          )}
                          {actionLoading[`booking_${r.id}`] === 'rejected' ? t.processing : t.reject}
                        </button>
                      )}

                      {/* ✅ أزرار إدارة الحالة حسب الحالة الحالية */}
                      {availableActions.map((action) => {
                        // ✅ استبعاد 'rejected' من التكرار لأننا عرضناه بشكل منفصل
                        if (action === 'rejected') return null;
                        
                        const actionColor = getActionColor(action);
                        const isProcessing = actionLoading[`booking_${r.id}`] === action;
                        
                        return (
                          <button 
                            key={action}
                            onClick={() => handleUpdateBookingStatus(r.id, action)}
                            disabled={isProcessing}
                            className="btn-action"
                            style={{
                              display: 'flex', alignItems: 'center', gap: '4px',
                              padding: '6px 12px', borderRadius: '8px',
                              border: 'none',
                              background: isProcessing ? '#94a3b8' : actionColor.bg,
                              color: 'white',
                              cursor: isProcessing ? 'not-allowed' : 'pointer',
                              fontSize: '0.7rem', fontWeight: 600,
                              fontFamily: "'Cairo', sans-serif",
                              opacity: isProcessing ? 0.7 : 1,
                              transition: 'all 0.3s ease',
                            }}
                            onMouseEnter={(e) => { if(!isProcessing) { e.target.style.background = actionColor.hover; } }}
                            onMouseLeave={(e) => { e.target.style.background = actionColor.bg; }}
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
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="animate-fade-in-up" style={{
                textAlign: 'center', padding: '40px 20px', background: cardBg,
                borderRadius: '14px', border: `1px solid ${borderColor}`,
              }}>
                <Bell size={40} style={{ opacity: 0.2, color: textSecondary, marginBottom: '12px' }} />
                <p style={{ color: textColor, fontSize: '1rem', fontWeight: 600, marginBottom: '4px' }}>{t.noRequests}</p>
                <p style={{ color: textSecondary, fontSize: '0.85rem' }}>{t.noRequestsDesc}</p>
              </div>
            )}

            {/* ============================================================
                 ✅ طلبات عامة (Service Posts) - عرض كل الطلبات
                 ============================================================ */}
            <div style={{ marginTop: '32px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                <h2 style={{
                  fontSize: '1.1rem', fontWeight: 700, color: textColor,
                  display: 'flex', alignItems: 'center', gap: '8px', margin: 0,
                }}>
                  <FileText size={20} style={{ color: '#8b5cf6' }} />
                  {t.generalRequests}
                  <span style={{
                    background: '#8b5cf6',
                    color: 'white',
                    padding: '2px 10px',
                    borderRadius: '12px',
                    fontSize: '0.75rem',
                    fontWeight: 700,
                  }}>
                    {servicePosts.length}
                  </span>
                </h2>
                <Link
                  to="/craftsman/posts"
                  style={{
                    fontSize: '0.8rem',
                    color: '#8b5cf6',
                    textDecoration: 'none',
                    fontWeight: 600,
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px',
                  }}
                >
                  {t.viewAll} <ArrowRight size={14} />
                </Link>
              </div>

              {postsLoading ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  {[1, 2].map(i => (
                    <div key={i} className="skeleton" style={{ borderRadius: '14px', height: '120px' }} />
                  ))}
                </div>
              ) : servicePosts.length > 0 ? (
                servicePosts.map((post, index) => {
                  const alreadyResponded = post.already_responded || false;
                  
                  return (
                    <div key={post.id} className="animate-fade-in-up" style={{
                      background: cardBg, borderRadius: '12px', padding: '14px 16px',
                      border: `1px solid ${borderColor}`, marginBottom: '8px',
                      animationDelay: `${index * 0.05}s`,
                      opacity: alreadyResponded ? 0.6 : 1,
                    }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '6px' }}>
                        <div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap' }}>
                            <span style={{ fontWeight: 600, color: textColor, fontSize: '0.85rem' }}>
                              {post.title || 'طلب خدمة'}
                            </span>
                            {post.urgency === 'emergency' && (
                              <span style={{
                                padding: '2px 8px', borderRadius: '8px', fontSize: '0.6rem', fontWeight: 600,
                                background: '#fee2e2', color: '#dc2626',
                              }}>
                                🚨 {lang === 'ar' ? 'طوارئ' : 'Emergency'}
                              </span>
                            )}
                            {alreadyResponded && (
                              <span style={{
                                padding: '2px 8px', borderRadius: '8px', fontSize: '0.6rem', fontWeight: 600,
                                background: '#d1fae5', color: '#059669',
                              }}>
                                ✅ {t.alreadyResponded}
                              </span>
                            )}
                          </div>
                          <div style={{ fontSize: '0.7rem', color: textSecondary, display: 'flex', gap: '6px', flexWrap: 'wrap', marginTop: '2px' }}>
                            <span>{post.city || ''}</span>
                            {post.budget_from && post.budget_to && (
                              <span>💰 {post.budget_from} - {post.budget_to} {t.egp}</span>
                            )}
                            {post.urgency && post.urgency !== 'emergency' && (
                              <span>⚡ {post.urgency}</span>
                            )}
                          </div>
                        </div>
                        <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap' }}>
                          {!alreadyResponded && post.status === 'open' && (
                            <button
                              onClick={() => handleRespondToPost(post.id)}
                              disabled={actionLoading[`post_${post.id}`] === 'respond'}
                              style={{
                                display: 'flex', alignItems: 'center', gap: '4px',
                                padding: '4px 10px', borderRadius: '6px',
                                border: 'none',
                                background: actionLoading[`post_${post.id}`] === 'respond' ? '#94a3b8' : '#8b5cf6',
                                color: 'white', cursor: actionLoading[`post_${post.id}`] === 'respond' ? 'not-allowed' : 'pointer',
                                fontSize: '0.65rem', fontWeight: 600,
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
                              borderRadius: '6px',
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
                })
              ) : (
                <div style={{
                  textAlign: 'center', padding: '24px', background: cardBg,
                  borderRadius: '12px', border: `1px solid ${borderColor}`,
                }}>
                  <p style={{ color: textSecondary, fontSize: '0.85rem' }}>{t.noGeneralRequests}</p>
                </div>
              )}
            </div>
          </div>

          {/* ============================================================
               Sidebar
               ============================================================ */}
          <div>
            {/* Quick Links */}
            <div className="animate-fade-in-up delay-200" style={{
              background: cardBg, borderRadius: '16px', padding: '24px',
              border: `1px solid ${borderColor}`, marginBottom: '16px',
            }}>
              <h3 style={{ fontWeight: 700, color: textColor, marginBottom: '16px', fontSize: '1rem' }}>
                {t.quickLinks}
              </h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <Link to="/profile" style={quickLinkStyle('#3b82f6', darkMode ? 'rgba(59,130,246,0.15)' : '#eff6ff')}>
                  <Settings size={16} />{t.profile}
                </Link>
                <Link to="/subscription" style={quickLinkStyle('#8b5cf6', darkMode ? 'rgba(139,92,246,0.15)' : '#f5f3ff')}>
                  <Award size={16} />{t.subscriptions}
                </Link>
                <Link to="/notifications" style={quickLinkStyle('#f59e0b', darkMode ? 'rgba(245,158,11,0.15)' : '#fef3c7')}>
                  <Bell size={16} />{lang === 'ar' ? 'الإشعارات' : 'Notifications'}
                </Link>
                <button
                  onClick={() => navigate('/craftsman/dashboard')}
                  style={{
                    ...quickLinkStyle('#059669', darkMode ? 'rgba(5,150,105,0.15)' : '#d1fae5'),
                    border: 'none',
                    cursor: 'pointer',
                    width: '100%',
                    textAlign: 'left',
                    fontFamily: "'Cairo', sans-serif",
                  }}
                >
                  <LayoutDashboard size={16} />
                  {t.dashboard}
                </button>
                
                {/* ✅ رابط طلباتي الخاصة */}
                <Link
                  to="/craftsman/bookings"
                  style={{
                    ...quickLinkStyle('#3b82f6', darkMode ? 'rgba(59,130,246,0.15)' : '#eff6ff'),
                  }}
                >
                  <ListTodo size={16} />
                  {t.myBookings}
                </Link>

                {/* ✅ رابط طلبات العامة */}
                <Link
                  to="/craftsman/posts"
                  style={{
                    ...quickLinkStyle('#8b5cf6', darkMode ? 'rgba(139,92,246,0.15)' : '#f5f3ff'),
                  }}
                >
                  <FileText size={16} />
                  {t.generalRequests}
                </Link>
              </div>
            </div>

            {/* Stats Card (تم إزالة الأرباح) */}
            <div className="animate-fade-in-up delay-300" style={{
              background: cardBg, borderRadius: '16px', padding: '20px',
              border: `1px solid ${borderColor}`, marginBottom: '16px',
            }}>
              <h3 style={{ fontWeight: 700, color: textColor, marginBottom: '12px', fontSize: '0.9rem' }}>
                {lang === 'ar' ? '📊 ملخص اليوم' : '📊 Today\'s Summary'}
              </h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '0.85rem', color: textSecondary }}>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span>{t.pending}</span>
                  <span style={{ fontWeight: 700, color: '#f59e0b' }}>{stats.pending}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span>{t.confirmed}</span>
                  <span style={{ fontWeight: 700, color: '#3b82f6' }}>{stats.confirmed}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span>{t.inProgress}</span>
                  <span style={{ fontWeight: 700, color: '#8b5cf6' }}>{stats.in_progress}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span>{t.completed}</span>
                  <span style={{ fontWeight: 700, color: '#059669' }}>{stats.completed}</span>
                </div>
                {stats.rating > 0 && (
                  <div style={{ display: 'flex', justifyContent: 'space-between', borderTop: `1px solid ${borderColor}`, paddingTop: '8px' }}>
                    <span>{t.ratingLabel}</span>
                    <span style={{ fontWeight: 700, color: '#f59e0b' }}>⭐ {stats.rating} ({stats.reviews_count})</span>
                  </div>
                )}
              </div>
            </div>

            {/* Tips */}
            <div className="animate-fade-in-up delay-400" style={{
              background: 'linear-gradient(135deg, #f59e0b, #d97706)',
              borderRadius: '16px', padding: '20px', color: 'white',
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                <Sparkles size={18} />
                <span style={{ fontWeight: 700, fontSize: '0.9rem' }}>
                  {lang === 'ar' ? '💡 نصيحة' : '💡 Tip'}
                </span>
              </div>
              <p style={{ fontSize: '0.85rem', opacity: 0.95, lineHeight: 1.6, margin: 0 }}>
                {lang === 'ar' 
                  ? 'الرد السريع على الطلبات يزيد من فرص قبولك بنسبة 80%'
                  : 'Quick response to requests increases your acceptance rate by 80%'}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CraftsmanHomePage;