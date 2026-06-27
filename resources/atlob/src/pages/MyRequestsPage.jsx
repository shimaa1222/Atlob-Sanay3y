// src/pages/MyRequestsPage.jsx
import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useTheme } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import {
  Calendar, Clock, MapPin, Star, DollarSign,
  ChevronLeft, ChevronRight, Filter, X,
  CheckCircle, Clock as ClockIcon, AlertCircle,
  Loader, Eye, MessageCircle, Phone, FileText,
  Trash2, Edit, PlusCircle, User, Check,
  ChevronDown, ChevronUp, Wrench
} from 'lucide-react';

const MyRequestsPage = () => {
  const navigate = useNavigate();
  const { darkMode } = useTheme();
  const { user } = useAuth();
  const [lang, setLang] = useState('ar');
  
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [error, setError] = useState('');
  const [deleting, setDeleting] = useState(null);
  
  // ✅ State للردود المدمجة
  const [expandedPost, setExpandedPost] = useState(null);
  const [updatingResponse, setUpdatingResponse] = useState(null);
  const [successMsg, setSuccessMsg] = useState('');

  const isArabic = lang === 'ar';

  // ✅ Language
  useEffect(() => {
    const savedLang = localStorage.getItem('language') || 'ar';
    setLang(savedLang);
    const handleLanguageChange = () => setLang(localStorage.getItem('language') || 'ar');
    window.addEventListener('languagechange', handleLanguageChange);
    return () => window.removeEventListener('languagechange', handleLanguageChange);
  }, []);

  // ✅ حالات المنشورات
  const statuses = [
    { value: 'all', label: isArabic ? 'الكل' : 'All' },
    { value: 'open', label: isArabic ? 'مفتوح' : 'Open' },
    { value: 'closed', label: isArabic ? 'مغلق' : 'Closed' },
  ];

  // ✅ جلب منشورات العميل - GET /client/my-posts
  const loadMyPosts = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const data = await api.getMyPosts();
      // ✅ معالجة البيانات بأمان
      const postsArray = (data.posts?.data || data.posts || data.data || data || [])
        .filter(p => p && p.id)  // ✅ التأكد من وجود id
        .map(p => ({
          ...p,
          responses: Array.isArray(p.responses) ? p.responses : [],
          responses_count: p.responses?.length || p.responses_count || 0,
        }));
      setPosts(Array.isArray(postsArray) ? postsArray : []);
      // ✅ إعادة تعيين expandedPost عند تحميل بيانات جديدة
      setExpandedPost(null);
    } catch (err) {
      console.error('❌ Error loading my posts:', err);
      setError(err.message || (isArabic ? 'حدث خطأ في تحميل طلباتك' : 'Error loading your requests'));
      setPosts([]);
    } finally {
      setLoading(false);
    }
  }, [isArabic]);

  useEffect(() => {
    loadMyPosts();
  }, [loadMyPosts]);

  // ✅ فلترة المنشورات
  const filteredPosts = filter === 'all' 
    ? posts 
    : posts.filter(p => p.status === filter);

  // ✅ إغلاق منشور (حذف) - DELETE /client/service-posts.destroy/{id}
  const handleDelete = async (postId) => {
    if (!window.confirm(isArabic ? 'هل أنت متأكد من إغلاق هذا الطلب؟' : 'Are you sure you want to close this request?')) {
      return;
    }
    
    setDeleting(postId);
    try {
      await api.deleteServicePost(postId);
      setPosts(prev => prev.filter(p => p.id !== postId));
      showSuccess(isArabic ? 'تم إغلاق المنشور' : 'Post closed');
    } catch (err) {
      setError(err.message || (isArabic ? 'حدث خطأ في حذف الطلب' : 'Error deleting request'));
    } finally {
      setDeleting(null);
    }
  };

  // ✅ قبول/رفض رد الحرفي (مدمج في الصفحة)
  const handleResponseAction = async (postId, responseId, status) => {
    setUpdatingResponse(responseId);
    try {
      const result = await api.updatePostResponse(postId, responseId, status);
      
      // ✅ تحديث الـ State المحلي
      setPosts(prev => prev.map(p => {
        if (p.id !== postId) return p;
        return {
          ...p,
          responses: (p.responses || []).map(r =>
            r.id === responseId ? { ...r, status } : r
          )
        };
      }));
      
      showSuccess(
        status === 'accepted'
          ? (isArabic ? '✅ تم قبول العرض' : '✅ Offer accepted')
          : (isArabic ? '❌ تم رفض العرض' : '❌ Offer rejected')
      );
      
      // ✅ إعادة تحميل البيانات لتحديث كل شيء
      await loadMyPosts();
    } catch (err) {
      setError(err.message || (isArabic ? 'حدث خطأ' : 'Error'));
    } finally {
      setUpdatingResponse(null);
    }
  };

  const showSuccess = (msg) => {
    setSuccessMsg(msg);
    setTimeout(() => setSuccessMsg(''), 3000);
  };

  // ✅ الحصول على لون الحالة
  const getStatusColor = (status) => {
    const colors = {
      open: { bg: '#dbeafe', text: '#2563eb', icon: <ClockIcon size={16} /> },
      closed: { bg: '#d1fae5', text: '#059669', icon: <CheckCircle size={16} /> },
    };
    return colors[status] || colors.open;
  };

  // ✅ الحصول على نص الحالة
  const getStatusText = (status) => {
    const map = {
      open: isArabic ? 'مفتوح' : 'Open',
      closed: isArabic ? 'مغلق' : 'Closed',
    };
    return map[status] || status;
  };

  // ✅ تنسيق التاريخ
  const formatDate = (date) => {
    if (!date) return '';
    const d = new Date(date);
    return d.toLocaleDateString(isArabic ? 'ar-EG' : 'en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  // ✅ الحصول على نص الإلحاح
  const getUrgencyText = (urgency) => {
    const map = {
      low: isArabic ? 'منخفض' : 'Low',
      medium: isArabic ? 'متوسط' : 'Medium',
      high: isArabic ? 'مرتفع' : 'High',
      emergency: isArabic ? 'طوارئ' : 'Emergency',
    };
    return map[urgency] || urgency;
  };

  const getUrgencyColor = (urgency) => {
    const colors = {
      low: '#22c55e',
      medium: '#f59e0b',
      high: '#f97316',
      emergency: '#ef4444',
    };
    return colors[urgency] || '#94a3b8';
  };

  // ✅ الحصول على العرض المقبول
  const getAcceptedResponse = (post) => {
    if (!post.responses) return null;
    return post.responses.find(r => r.status === 'accepted');
  };

  // ✅ الترجمات
  const t = {
    myRequests: isArabic ? 'طلباتي' : 'My Requests',
    youHave: (count) => isArabic ? `لديك ${count} طلب` : `You have ${count} requests`,
    errorLoading: isArabic ? 'حدث خطأ في تحميل طلباتك' : 'Error loading your requests',
    errorDeleting: isArabic ? 'حدث خطأ في حذف الطلب' : 'Error deleting request',
    confirmDelete: isArabic ? 'هل أنت متأكد من إغلاق هذا الطلب؟' : 'Are you sure you want to close this request?',
    details: isArabic ? 'تفاصيل' : 'Details',
    delete: isArabic ? 'إغلاق' : 'Close',
    noRequests: isArabic ? 'لا توجد طلبات' : 'No requests found',
    noRequestsYet: isArabic ? 'لم تقم بأي طلب بعد' : 'You haven\'t made any requests yet',
    noRequestsStatus: (status) => isArabic ? `لا توجد طلبات بحالة "${status}"` : `No requests with status "${status}"`,
    viewAll: isArabic ? 'عرض الكل' : 'View All',
    newRequest: isArabic ? 'طلب جديد' : 'New Request',
    all: isArabic ? 'الكل' : 'All',
    open: isArabic ? 'مفتوح' : 'Open',
    closed: isArabic ? 'مغلق' : 'Closed',
    egp: isArabic ? 'ج.م' : 'EGP',
    budget: isArabic ? 'الميزانية' : 'Budget',
    urgency: isArabic ? 'الإلحاح' : 'Urgency',
    responses: (count) => isArabic ? `${count} رد` : `${count} responses`,
    noResponses: isArabic ? 'لا توجد ردود' : 'No responses',
    viewResponses: isArabic ? 'عرض الردود' : 'View Responses',
    status: isArabic ? 'الحالة' : 'Status',
    location: isArabic ? 'الموقع' : 'Location',
    createdAt: isArabic ? 'تاريخ النشر' : 'Created At',
    acceptedBy: isArabic ? '✅ تم قبول العرض بواسطة:' : '✅ Accepted by:',
    offerAccepted: isArabic ? 'تم قبول العرض' : 'Offer Accepted',
    craftsman: isArabic ? 'الحرفي' : 'Craftsman',
    viewCraftsman: isArabic ? 'عرض الحرفي' : 'View Craftsman',
    contactCraftsman: isArabic ? 'تواصل مع الحرفي' : 'Contact Craftsman',
    accept: isArabic ? 'قبول' : 'Accept',
    reject: isArabic ? 'رفض' : 'Reject',
    pending: isArabic ? 'معلق' : 'Pending',
    accepted: isArabic ? 'مقبول' : 'Accepted',
    rejected: isArabic ? 'مرفوض' : 'Rejected',
    closePost: isArabic ? 'إغلاق المنشور' : 'Close Post',
  };

  // Dynamic colors
  const bgColor = darkMode ? '#0f172a' : '#f8fafc';
  const cardBg = darkMode ? '#1e293b' : '#ffffff';
  const textColor = darkMode ? '#f1f5f9' : '#0f172a';
  const textSecondary = darkMode ? '#94a3b8' : '#64748b';
  const borderColor = darkMode ? '#334155' : '#e2e8f0';

  return (
    <div style={{ background: bgColor, minHeight: '100vh', fontFamily: "'Cairo', sans-serif", direction: isArabic ? 'rtl' : 'ltr' }}>
      <style>{`
        @keyframes fadeInUp { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
        @keyframes shimmer { 0% { background-position: -200% 0; } 100% { background-position: 200% 0; } }
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
        .animate-fade-in-up { animation: fadeInUp 0.5s ease forwards; }
        .animate-fade-in { animation: fadeIn 0.3s ease forwards; }
        .animate-spin { animation: spin 1s linear infinite; }
        .delay-100 { animation-delay: 0.1s; }
        .delay-200 { animation-delay: 0.2s; }
        .delay-300 { animation-delay: 0.3s; }
        .skeleton {
          background: linear-gradient(90deg, ${darkMode ? '#334155' : '#e2e8f0'} 25%, ${darkMode ? '#1e293b' : '#f1f5f9'} 50%, ${darkMode ? '#334155' : '#e2e8f0'} 75%);
          background-size: 200% 100%;
          animation: shimmer 1.5s infinite;
        }
        .hover-lift { transition: all 0.3s ease; }
        .hover-lift:hover { transform: translateY(-3px); box-shadow: 0 8px 24px rgba(0,0,0,0.12); }
        @media (max-width: 768px) {
          .filter-bar { overflow-x: auto; flex-wrap: nowrap; }
          .request-card { flex-direction: column; align-items: stretch !important; }
        }
      `}</style>

      {/* Header */}
      <div style={{
        background: darkMode ? 'linear-gradient(160deg, #1e3a8a, #1e40af)' : 'linear-gradient(160deg, #2563eb, #1d4ed8)',
        color: 'white',
        padding: '32px 0',
      }}>
        <div style={{ maxWidth: '1000px', margin: '0 auto', padding: '0 24px' }}>
          <div className="animate-fade-in-up" style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
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
                📝 {t.myRequests}
              </h1>
              <p style={{ fontSize: '0.85rem', opacity: 0.85, margin: '2px 0 0' }}>
                {t.youHave(posts.length)}
              </p>
            </div>
            <div style={{ marginLeft: 'auto' }}>
              <Link
                to="/request-service"
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                  padding: '10px 20px',
                  borderRadius: '10px',
                  background: 'rgba(255,255,255,0.2)',
                  color: 'white',
                  textDecoration: 'none',
                  fontWeight: 600,
                  fontSize: '0.85rem',
                  fontFamily: "'Cairo', sans-serif",
                  transition: 'all 0.3s ease',
                }}
                onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.3)'}
                onMouseLeave={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.2)'}
              >
                <PlusCircle size={18} />
                {t.newRequest}
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div style={{ maxWidth: '1000px', margin: '0 auto', padding: '24px' }}>

        {/* Success Message */}
        {successMsg && (
          <div className="animate-fade-in" style={{
            background: darkMode ? 'rgba(5,150,105,0.1)' : '#d1fae5',
            color: '#059669',
            padding: '12px 16px',
            borderRadius: '12px',
            marginBottom: '16px',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            border: '1px solid rgba(5,150,105,0.2)',
          }}>
            <CheckCircle size={18} />
            {successMsg}
          </div>
        )}

        {/* Error */}
        {error && (
          <div className="animate-fade-in" style={{
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
        <div className="animate-fade-in-up delay-100 filter-bar" style={{
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
                  {posts.filter(p => p.status === s.value).length}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* Posts List */}
        {loading ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {[1, 2, 3].map(i => (
              <div key={i} className="skeleton" style={{ borderRadius: '14px', height: '120px' }} />
            ))}
          </div>
        ) : filteredPosts.length > 0 ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {filteredPosts.map((post, index) => {
              const statusStyle = getStatusColor(post.status);
              const isOpen = post.status === 'open';
              const responsesCount = post.responses_count || post.responses?.length || 0;
              const acceptedResponse = getAcceptedResponse(post);
              const isAccepted = !!acceptedResponse;
              
              return (
                <div
                  key={post.id}
                  className="animate-fade-in-up hover-lift request-card"
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
                    animationDelay: `${index * 0.05}s`,
                  }}
                >
                  {/* Left - Info */}
                  <div style={{ flex: 1, minWidth: '200px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
                      <h3 style={{ fontWeight: 700, color: textColor, fontSize: '1rem', margin: 0 }}>
                        {post.title || 'طلب خدمة'}
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
                        {getStatusText(post.status)}
                      </span>
                    </div>
                    
                    <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap', marginTop: '6px', fontSize: '0.85rem', color: textSecondary }}>
                      <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <Calendar size={14} />
                        {formatDate(post.created_at)}
                      </span>
                      {post.city && (
                        <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                          <MapPin size={14} />
                          {post.city}
                        </span>
                      )}
                      {post.budget_from && post.budget_to && (
                        <span style={{ display: 'flex', alignItems: 'center', gap: '4px', color: '#059669', fontWeight: 600 }}>
                          <DollarSign size={14} />
                          {post.budget_from} - {post.budget_to} {t.egp}
                        </span>
                      )}
                      {post.urgency && (
                        <span style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '4px',
                          color: getUrgencyColor(post.urgency),
                          fontWeight: 600,
                        }}>
                          ⚡ {getUrgencyText(post.urgency)}
                        </span>
                      )}
                    </div>

                    {post.description && (
                      <p style={{ fontSize: '0.8rem', color: textSecondary, marginTop: '4px', maxWidth: '400px' }}>
                        {post.description.length > 100 
                          ? post.description.substring(0, 100) + '...' 
                          : post.description}
                      </p>
                    )}

                    {/* ✅ عرض معلومات القبول */}
                    {isAccepted && acceptedResponse && (
                      <div style={{
                        marginTop: '8px',
                        padding: '8px 12px',
                        borderRadius: '8px',
                        background: darkMode ? 'rgba(5,150,105,0.1)' : '#d1fae5',
                        border: `1px solid ${darkMode ? '#059669' : '#059669'}`,
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px',
                        flexWrap: 'wrap',
                      }}>
                        <CheckCircle size={14} style={{ color: '#059669' }} />
                        <span style={{ fontSize: '0.8rem', color: '#059669', fontWeight: 600 }}>
                          {t.acceptedBy}
                        </span>
                        <span style={{ fontSize: '0.8rem', color: textColor, fontWeight: 600 }}>
                          {acceptedResponse.craftsman?.user?.name || 
                           acceptedResponse.craftsman?.name || 
                           t.craftsman}
                        </span>
                        {acceptedResponse.craftsman?.id && (
                          <Link
                            to={`/craftsman/${acceptedResponse.craftsman.id}`}
                            style={{
                              fontSize: '0.75rem',
                              color: '#3b82f6',
                              textDecoration: 'none',
                              fontWeight: 600,
                              display: 'flex',
                              alignItems: 'center',
                              gap: '4px',
                            }}
                          >
                            <User size={12} />
                            {t.viewCraftsman}
                          </Link>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Right - Actions */}
                  <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                    {/* زر عرض الردود */}
                    {responsesCount > 0 && (
                      <button
                        onClick={() => {
                          if (post && post.id) {
                            setExpandedPost(expandedPost === post.id ? null : post.id);
                          }
                        }}
                        style={{
                          padding: '6px 14px',
                          borderRadius: '8px',
                          border: `1px solid ${borderColor}`,
                          background: expandedPost === post.id ? (darkMode ? '#334155' : '#e2e8f0') : 'transparent',
                          cursor: 'pointer',
                          color: textSecondary,
                          fontSize: '0.8rem',
                          fontFamily: "'Cairo', sans-serif",
                          display: 'flex',
                          alignItems: 'center',
                          gap: '4px',
                          transition: 'all 0.3s ease',
                        }}
                      >
                        <MessageCircle size={14} />
                        {t.responses(responsesCount)}
                        {expandedPost === post.id ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                      </button>
                    )}

                    {/* زر التفاصيل */}
                    <button
                      onClick={() => navigate(`/service-post/${post.id}`)}
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

                    {/* زر الإغلاق - يظهر فقط للمنشورات المفتوحة */}
                    {isOpen && (
                      <button
                        onClick={() => handleDelete(post.id)}
                        disabled={deleting === post.id}
                        style={{
                          padding: '6px 14px',
                          borderRadius: '8px',
                          background: '#dc2626',
                          color: 'white',
                          border: 'none',
                          cursor: deleting === post.id ? 'not-allowed' : 'pointer',
                          fontSize: '0.8rem',
                          fontWeight: 600,
                          fontFamily: "'Cairo', sans-serif",
                          opacity: deleting === post.id ? 0.6 : 1,
                          display: 'flex',
                          alignItems: 'center',
                          gap: '4px',
                        }}
                      >
                        {deleting === post.id ? (
                          <Loader size={14} className="animate-spin" />
                        ) : (
                          <Trash2 size={14} />
                        )}
                        {t.delete}
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="animate-fade-in" style={{
            textAlign: 'center',
            padding: '60px 20px',
            background: cardBg,
            borderRadius: '16px',
            border: `1px solid ${borderColor}`,
          }}>
            <FileText size={64} style={{ color: textSecondary, opacity: 0.3, marginBottom: '16px' }} />
            <h3 style={{ fontSize: '1.2rem', fontWeight: 700, color: textColor, marginBottom: '8px' }}>
              {t.noRequests}
            </h3>
            <p style={{ color: textSecondary, fontSize: '0.95rem' }}>
              {filter === 'all' 
                ? t.noRequestsYet
                : t.noRequestsStatus(statuses.find(s => s.value === filter)?.label || '')
              }
            </p>
            {filter !== 'all' && (
              <button
                onClick={() => setFilter('all')}
                style={{
                  marginTop: '12px',
                  padding: '8px 20px',
                  borderRadius: '8px',
                  background: '#3b82f6',
                  color: 'white',
                  border: 'none',
                  cursor: 'pointer',
                  fontWeight: 600,
                  fontSize: '0.85rem',
                  fontFamily: "'Cairo', sans-serif",
                }}
              >
                {t.viewAll}
              </button>
            )}
            {filter === 'all' && (
              <Link
                to="/request-service"
                style={{
                  display: 'inline-block',
                  marginTop: '12px',
                  padding: '8px 20px',
                  borderRadius: '8px',
                  background: '#3b82f6',
                  color: 'white',
                  textDecoration: 'none',
                  fontWeight: 600,
                  fontSize: '0.85rem',
                  fontFamily: "'Cairo', sans-serif",
                }}
              >
                <PlusCircle size={16} style={{ display: 'inline', marginRight: '6px' }} />
                {t.newRequest}
              </Link>
            )}
          </div>
        )}

        {/* ============================================================
            ✅ الردود المدمجة (Expanded Responses)
            ============================================================ */}
        {expandedPost && (() => {
          const post = posts.find(p => p.id === expandedPost);
          if (!post) return null;
          
          const responses = post.responses || [];
          if (responses.length === 0) return null;

          return (
            <div className="animate-fade-in-up delay-200" style={{
              marginTop: '16px',
              background: cardBg,
              borderRadius: '16px',
              padding: '20px 24px',
              border: `1px solid ${borderColor}`,
            }}>
              <h4 style={{
                fontSize: '1rem',
                fontWeight: 700,
                color: textColor,
                marginBottom: '16px',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
              }}>
                <MessageCircle size={18} style={{ color: '#3b82f6' }} />
                {isArabic ? 'ردود الحرفيين' : 'Craftsman Responses'}
              </h4>

              {responses.map((resp, idx) => {
                const isPending = resp.status === 'pending';
                const isAccepted = resp.status === 'accepted';
                const isRejected = resp.status === 'rejected';
                const canAct = isPending && post.status !== 'closed';

                return (
                  <div key={resp.id} style={{
                    padding: '14px 16px',
                    borderRadius: '12px',
                    border: `1px solid ${borderColor}`,
                    background: darkMode ? 'rgba(255,255,255,0.02)' : '#f8fafc',
                    marginBottom: idx < responses.length - 1 ? '10px' : 0,
                  }}>
                    <div style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'flex-start',
                      flexWrap: 'wrap',
                      gap: '8px',
                    }}>
                      <div style={{ flex: 1 }}>
                        <div style={{ fontWeight: 600, color: textColor, marginBottom: '4px' }}>
                          {resp.craftsman?.user?.name ||
                           resp.craftsman?.name ||
                           (isArabic ? 'حرفي' : 'Craftsman')}
                        </div>
                        <p style={{ color: textSecondary, fontSize: '0.85rem', margin: '0 0 8px', lineHeight: 1.6 }}>
                          {resp.message}
                        </p>
                        <div style={{ display: 'flex', gap: '14px', flexWrap: 'wrap' }}>
                          {resp.offered_price && (
                            <span style={{ color: '#059669', fontSize: '0.85rem', fontWeight: 600 }}>
                              💰 {resp.offered_price} {t.egp}
                            </span>
                          )}
                          {resp.estimated_days && (
                            <span style={{ color: textSecondary, fontSize: '0.85rem' }}>
                              ⏱ {resp.estimated_days} {isArabic ? 'يوم' : 'days'}
                            </span>
                          )}
                        </div>
                      </div>

                      <div style={{ display: 'flex', gap: '8px', alignItems: 'center', flexWrap: 'wrap' }}>
                        {/* حالة الرد */}
                        <span style={{
                          padding: '4px 12px',
                          borderRadius: '20px',
                          fontSize: '0.7rem',
                          fontWeight: 600,
                          background: isAccepted ? '#d1fae5' : isRejected ? '#fee2e2' : '#fef3c7',
                          color: isAccepted ? '#059669' : isRejected ? '#dc2626' : '#d97706',
                        }}>
                          {isAccepted ? t.accepted : isRejected ? t.rejected : t.pending}
                        </span>

                        {/* أزرار القبول/الرفض */}
                        {canAct && (
                          <>
                            <button
                              onClick={() => handleResponseAction(post.id, resp.id, 'accepted')}
                              disabled={updatingResponse === resp.id}
                              style={{
                                padding: '4px 12px',
                                borderRadius: '8px',
                                border: 'none',
                                background: '#059669',
                                color: 'white',
                                cursor: updatingResponse === resp.id ? 'not-allowed' : 'pointer',
                                fontWeight: 600,
                                fontSize: '0.75rem',
                                fontFamily: "'Cairo', sans-serif",
                                opacity: updatingResponse === resp.id ? 0.6 : 1,
                                transition: 'all 0.3s ease',
                              }}
                              onMouseEnter={(e) => { if(!updatingResponse) e.currentTarget.style.background = '#047857'; }}
                              onMouseLeave={(e) => { if(!updatingResponse) e.currentTarget.style.background = '#059669'; }}
                            >
                              {updatingResponse === resp.id ? <Loader size={12} className="animate-spin" /> : t.accept}
                            </button>
                            <button
                              onClick={() => handleResponseAction(post.id, resp.id, 'rejected')}
                              disabled={updatingResponse === resp.id}
                              style={{
                                padding: '4px 12px',
                                borderRadius: '8px',
                                border: 'none',
                                background: '#dc2626',
                                color: 'white',
                                cursor: updatingResponse === resp.id ? 'not-allowed' : 'pointer',
                                fontWeight: 600,
                                fontSize: '0.75rem',
                                fontFamily: "'Cairo', sans-serif",
                                opacity: updatingResponse === resp.id ? 0.6 : 1,
                                transition: 'all 0.3s ease',
                              }}
                              onMouseEnter={(e) => { if(!updatingResponse) e.currentTarget.style.background = '#b91c1c'; }}
                              onMouseLeave={(e) => { if(!updatingResponse) e.currentTarget.style.background = '#dc2626'; }}
                            >
                              {updatingResponse === resp.id ? <Loader size={12} className="animate-spin" /> : t.reject}
                            </button>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          );
        })()}
      </div>
    </div>
  );
};

export default MyRequestsPage;