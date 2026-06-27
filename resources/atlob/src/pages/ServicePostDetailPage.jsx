// src/pages/ServicePostDetailPage.jsx
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useTheme } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import { 
  ArrowLeft, MapPin, Calendar, Clock, User, 
  Wrench, DollarSign, MessageCircle, Phone,
  CheckCircle, XCircle, AlertCircle, Loader,
  Eye, Heart, Share2, Flag, Award, Star,
  Users, Briefcase, FileText, Send, Home,
  Building, Navigation, Sparkles, Shield,
  Mail, Smartphone
} from 'lucide-react';

const ServicePostDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { darkMode } = useTheme();
  const { user, isAuthenticated } = useAuth();
  const [lang, setLang] = useState('ar');
  const [post, setPost] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [responseMessage, setResponseMessage] = useState('');
  const [offeredPrice, setOfferedPrice] = useState('');
  const [estimatedDays, setEstimatedDays] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState('');
  
  // ✅ State لعرض معلومات العميل بعد قبول العرض
  const [clientInfo, setClientInfo] = useState(null);
  const [showClientInfo, setShowClientInfo] = useState(false);
  const [processingResponse, setProcessingResponse] = useState(false);

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
  // ✅ جلب تفاصيل المنشور
  // ============================================================
  useEffect(() => {
    const loadPost = async () => {
      setLoading(true);
      setError('');
      
      try {
        const data = await api.getServicePost(id);
        const postData = data.post || data;
        setPost(postData);
        
        // ✅ التحقق من وجود client_info من الـ API
        if (postData.client_info) {
          setClientInfo(postData.client_info);
          setShowClientInfo(true);
        }
      } catch (err) {
        console.error('❌ Error loading post:', err);
        setError(err.message || (lang === 'ar' ? 'حدث خطأ في تحميل المنشور' : 'Error loading post'));
      } finally {
        setLoading(false);
      }
    };
    
    if (id) {
      loadPost();
    }
  }, [id, lang]);

  // ============================================================
  // ✅ رد الحرفي على المنشور
  // ============================================================
  const handleRespond = async (e) => {
    e.preventDefault();
    
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }
    
    if (user?.role !== 'craftsman') {
      setError(lang === 'ar' ? 'يمكن للحرفيين فقط الرد على المنشورات' : 'Only craftsmen can respond to posts');
      return;
    }
    
    if (!responseMessage.trim()) {
      setError(lang === 'ar' ? 'يرجى كتابة رسالة الرد' : 'Please write a response message');
      return;
    }
    
    setSubmitting(true);
    setError('');
    setSuccess('');
    
    try {
      const data = await api.respondToServicePost(id, {
        message: responseMessage,
        offered_price: offeredPrice || null,
        estimated_days: estimatedDays || null,
      });
      
      setSuccess(data.message || (lang === 'ar' ? 'تم إرسال ردك بنجاح!' : 'Your response was sent successfully!'));
      setResponseMessage('');
      setOfferedPrice('');
      setEstimatedDays('');
      
      const updatedData = await api.getServicePost(id);
      setPost(updatedData.post || updatedData);
      
      setTimeout(() => setSuccess(''), 4000);
    } catch (err) {
      console.error('❌ Error responding:', err);
      setError(err.message || (lang === 'ar' ? 'حدث خطأ في إرسال الرد' : 'Error sending response'));
    } finally {
      setSubmitting(false);
    }
  };

  // ============================================================
  // ✅ قبول عرض حرفي (للعميل)
  // ============================================================
  const handleAcceptResponse = async (responseId) => {
    if (!window.confirm(lang === 'ar' ? 'هل أنت متأكد من قبول هذا العرض؟' : 'Are you sure you want to accept this response?')) {
      return;
    }
    
    setProcessingResponse(true);
    setError('');
    
    try {
      const result = await api.updatePostResponse(id, responseId, 'accepted');
      
      // ✅ تخزين معلومات العميل
      if (result.client_info) {
        setClientInfo(result.client_info);
        setShowClientInfo(true);
      }
      
      setSuccess(lang === 'ar' ? '✅ تم قبول عرض الحرفي بنجاح!' : '✅ Craftsman response accepted successfully!');
      
      // تحديث المنشور
      const updatedData = await api.getServicePost(id);
      setPost(updatedData.post || updatedData);
      
      setTimeout(() => setSuccess(''), 5000);
    } catch (err) {
      console.error('❌ Error accepting response:', err);
      setError(err.message || (lang === 'ar' ? 'حدث خطأ في قبول العرض' : 'Error accepting response'));
    } finally {
      setProcessingResponse(false);
    }
  };

  // ============================================================
  // ✅ رفض عرض حرفي (للعميل)
  // ============================================================
  const handleRejectResponse = async (responseId) => {
    if (!window.confirm(lang === 'ar' ? 'هل أنت متأكد من رفض هذا العرض؟' : 'Are you sure you want to reject this response?')) {
      return;
    }
    
    setProcessingResponse(true);
    setError('');
    
    try {
      await api.updatePostResponse(id, responseId, 'rejected');
      
      setSuccess(lang === 'ar' ? '✅ تم رفض العرض' : '✅ Response rejected');
      
      const updatedData = await api.getServicePost(id);
      setPost(updatedData.post || updatedData);
      
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      console.error('❌ Error rejecting response:', err);
      setError(err.message || (lang === 'ar' ? 'حدث خطأ في رفض العرض' : 'Error rejecting response'));
    } finally {
      setProcessingResponse(false);
    }
  };

  // ============================================================
  // 📝 الترجمات
  // ============================================================
  const t = {
    back: lang === 'ar' ? 'العودة' : 'Back',
    postDetails: lang === 'ar' ? 'تفاصيل المنشور' : 'Post Details',
    postedBy: lang === 'ar' ? 'نشر بواسطة' : 'Posted by',
    location: lang === 'ar' ? 'الموقع' : 'Location',
    budget: lang === 'ar' ? 'الميزانية' : 'Budget',
    urgency: lang === 'ar' ? 'الاستعجال' : 'Urgency',
    low: lang === 'ar' ? 'منخفض' : 'Low',
    medium: lang === 'ar' ? 'متوسط' : 'Medium',
    high: lang === 'ar' ? 'مرتفع' : 'High',
    emergency: lang === 'ar' ? 'طوارئ' : 'Emergency',
    responses: lang === 'ar' ? 'الردود' : 'Responses',
    noResponses: lang === 'ar' ? 'لا توجد ردود حتى الآن' : 'No responses yet',
    respondNow: lang === 'ar' ? 'رد على المنشور' : 'Respond to Post',
    yourMessage: lang === 'ar' ? 'رسالتك' : 'Your Message',
    offeredPrice: lang === 'ar' ? 'السعر المقترح (اختياري)' : 'Offered Price (Optional)',
    estimatedDays: lang === 'ar' ? 'المدة المتوقعة (اختياري)' : 'Estimated Days (Optional)',
    sendResponse: lang === 'ar' ? 'إرسال الرد' : 'Send Response',
    sending: lang === 'ar' ? 'جاري الإرسال...' : 'Sending...',
    onlyCraftsmen: lang === 'ar' ? 'يمكن للحرفيين فقط الرد' : 'Only craftsmen can respond',
    loginToRespond: lang === 'ar' ? 'سجل الدخول للرد' : 'Login to respond',
    closed: lang === 'ar' ? 'مغلق' : 'Closed',
    open: lang === 'ar' ? 'مفتوح' : 'Open',
    status: lang === 'ar' ? 'الحالة' : 'Status',
    views: lang === 'ar' ? 'مشاهدة' : 'Views',
    craft: lang === 'ar' ? 'التخصص' : 'Specialty',
    accepted: lang === 'ar' ? 'مقبول' : 'Accepted',
    rejected: lang === 'ar' ? 'مرفوض' : 'Rejected',
    pending: lang === 'ar' ? 'قيد الانتظار' : 'Pending',
    noDescription: lang === 'ar' ? 'لا يوجد وصف' : 'No description',
    postedAt: lang === 'ar' ? 'نشر في' : 'Posted at',
    egp: lang === 'ar' ? 'ج.م' : 'EGP',
    days: lang === 'ar' ? 'يوم' : 'days',
    // ✅ ترجمات جديدة لمعلومات العميل
    clientInfo: lang === 'ar' ? '📋 معلومات العميل' : '📋 Client Information',
    clientName: lang === 'ar' ? '👤 الاسم' : '👤 Name',
    clientPhone: lang === 'ar' ? '📱 رقم الهاتف' : '📱 Phone',
    clientEmail: lang === 'ar' ? '📧 البريد الإلكتروني' : '📧 Email',
    clientAddress: lang === 'ar' ? '📍 العنوان' : '📍 Address',
    contactNow: lang === 'ar' ? '📞 تواصل الآن' : '📞 Contact Now',
    acceptedMessage: lang === 'ar' ? '✅ تم قبول عرضك! يمكنك التواصل مع العميل الآن.' : '✅ Your offer was accepted! You can contact the client now.',
    accept: lang === 'ar' ? 'قبول' : 'Accept',
    reject: lang === 'ar' ? 'رفض' : 'Reject',
    accepting: lang === 'ar' ? 'جاري القبول...' : 'Accepting...',
    rejecting: lang === 'ar' ? 'جاري الرفض...' : 'Rejecting...',
    confirmAccept: lang === 'ar' ? 'هل أنت متأكد من قبول هذا العرض؟' : 'Are you sure you want to accept this response?',
    confirmReject: lang === 'ar' ? 'هل أنت متأكد من رفض هذا العرض؟' : 'Are you sure you want to reject this response?',
  };

  // ============================================================
  // 🎨 Styles
  // ============================================================
  const bgColor = darkMode ? '#0f172a' : '#f8fafc';
  const cardBg = darkMode ? '#1e293b' : '#ffffff';
  const textColor = darkMode ? '#f1f5f9' : '#0f172a';
  const textSecondary = darkMode ? '#94a3b8' : '#64748b';
  const borderColor = darkMode ? '#334155' : '#e2e8f0';
  const gradientBg = darkMode ? 'linear-gradient(160deg, #1e3a8a, #1e40af)' : 'linear-gradient(160deg, #2563eb, #1d4ed8)';
  const inputBg = darkMode ? '#0f172a' : '#ffffff';

  const inputStyle = () => ({
    width: '100%',
    padding: '12px 16px',
    border: `2px solid ${borderColor}`,
    borderRadius: '10px',
    fontSize: '0.95rem',
    color: textColor,
    background: inputBg,
    outline: 'none',
    fontFamily: "'Cairo', sans-serif",
    transition: 'all 0.3s ease',
    textAlign: lang === 'ar' ? 'right' : 'left',
  });

  // ============================================================
  // 🎨 Loading State
  // ============================================================
  if (loading) {
    return (
      <div style={{ background: bgColor, minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: "'Cairo', sans-serif" }}>
        <Loader size={48} style={{ color: '#3b82f6', animation: 'spin 1s linear infinite' }} />
      </div>
    );
  }

  // ============================================================
  // 🎨 Error State
  // ============================================================
  if (error) {
    return (
      <div style={{ background: bgColor, minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', fontFamily: "'Cairo', sans-serif", gap: '16px', padding: '20px' }}>
        <AlertCircle size={48} style={{ color: '#ef4444' }} />
        <h2 style={{ color: textColor }}>{t.postDetails}</h2>
        <p style={{ color: textSecondary, textAlign: 'center' }}>{error}</p>
        <button onClick={() => navigate(-1)} style={{ padding: '12px 32px', borderRadius: '12px', border: 'none', background: '#3b82f6', color: 'white', cursor: 'pointer', fontWeight: 600 }}>{t.back}</button>
      </div>
    );
  }

  // ============================================================
  // 🎨 Not Found
  // ============================================================
  if (!post) {
    return (
      <div style={{ background: bgColor, minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', fontFamily: "'Cairo', sans-serif", gap: '16px', padding: '20px' }}>
        <AlertCircle size={48} style={{ color: '#ef4444' }} />
        <h2 style={{ color: textColor }}>{t.postDetails}</h2>
        <p style={{ color: textSecondary }}>{lang === 'ar' ? 'المنشور غير موجود' : 'Post not found'}</p>
        <button onClick={() => navigate(-1)} style={{ padding: '12px 32px', borderRadius: '12px', border: 'none', background: '#3b82f6', color: 'white', cursor: 'pointer', fontWeight: 600 }}>{t.back}</button>
      </div>
    );
  }

  const isOwner = user?.id === post.client_id;
  const isCraftsman = user?.role === 'craftsman';
  const isOpen = post.status === 'open';
  const hasResponded = post.responses?.some(r => r.craftsman_id === user?.id);
  const isAdmin = user?.role === 'admin';

  return (
    <div style={{ background: bgColor, minHeight: '100vh', fontFamily: "'Cairo', sans-serif", direction: lang === 'ar' ? 'rtl' : 'ltr' }}>
      <style>{`
        @keyframes fadeInUp { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
        @keyframes slideDown { from { opacity: 0; transform: translateY(-10px); } to { opacity: 1; transform: translateY(0); } }
        .animate-fade-in-up { animation: fadeInUp 0.5s ease forwards; }
        .animate-slide-down { animation: slideDown 0.3s ease forwards; }
        .animate-spin { animation: spin 1s linear infinite; }
        .delay-100 { animation-delay: 0.1s; }
        .delay-200 { animation-delay: 0.2s; }
        .hover-lift { transition: all 0.3s ease; }
        .hover-lift:hover { transform: translateY(-3px); box-shadow: 0 8px 24px rgba(0,0,0,0.12); }
        @media (max-width: 768px) { .detail-grid { grid-template-columns: 1fr !important; } }
      `}</style>

      {/* ===== Header ===== */}
      <div style={{ background: gradientBg, color: 'white', padding: '32px 0' }}>
        <div style={{ maxWidth: '1100px', margin: '0 auto', padding: '0 24px' }}>
          <div className="animate-fade-in-up" style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <button onClick={() => navigate(-1)} style={{ background: 'rgba(255,255,255,0.2)', border: 'none', color: 'white', width: '36px', height: '36px', borderRadius: '10px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <ArrowLeft size={18} />
            </button>
            <div>
              <h1 style={{ fontSize: '1.5rem', fontWeight: 700, margin: 0 }}>{t.postDetails}</h1>
            </div>
          </div>
        </div>
      </div>

      {/* ===== Content ===== */}
      <div style={{ maxWidth: '1100px', margin: '0 auto', padding: '32px 24px' }}>
        
        {/* ===== Messages ===== */}
        {success && (
          <div className="animate-slide-down" style={{
            background: darkMode ? 'rgba(5,150,105,0.1)' : '#d1fae5',
            color: '#059669',
            padding: '14px 20px',
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

        {error && (
          <div className="animate-slide-down" style={{
            background: darkMode ? 'rgba(220,38,38,0.1)' : '#fee2e2',
            color: '#dc2626',
            padding: '14px 20px',
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

        <div className="detail-grid" style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '24px' }}>
          
          {/* ===== Main Content ===== */}
          <div>
            {/* Post Info */}
            <div className="animate-fade-in-up delay-100" style={{ background: cardBg, borderRadius: '16px', padding: '28px', border: `1px solid ${borderColor}`, marginBottom: '20px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px', flexWrap: 'wrap', gap: '8px' }}>
                <h2 style={{ fontSize: '1.3rem', fontWeight: 700, color: textColor, margin: 0 }}>{post.title}</h2>
                <span style={{
                  padding: '4px 12px',
                  borderRadius: '20px',
                  fontSize: '0.75rem',
                  fontWeight: 600,
                  background: isOpen ? 'rgba(5,150,105,0.1)' : 'rgba(220,38,38,0.1)',
                  color: isOpen ? '#059669' : '#dc2626',
                }}>
                  {isOpen ? t.open : t.closed}
                </span>
              </div>

              <p style={{ color: textSecondary, fontSize: '0.95rem', lineHeight: 1.8, marginBottom: '16px' }}>
                {post.description || t.noDescription}
              </p>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '12px', padding: '16px 0', borderTop: `1px solid ${borderColor}`, borderBottom: `1px solid ${borderColor}` }}>
                <div>
                  <div style={{ fontSize: '0.75rem', color: textSecondary }}>{t.postedBy}</div>
                  <div style={{ fontWeight: 600, color: textColor }}>{post.client?.name || (lang === 'ar' ? 'عميل' : 'Client')}</div>
                </div>
                <div>
                  <div style={{ fontSize: '0.75rem', color: textSecondary }}>{t.craft}</div>
                  <div style={{ fontWeight: 600, color: textColor }}>{post.craft?.name || (lang === 'ar' ? 'غير محدد' : 'Not specified')}</div>
                </div>
                <div>
                  <div style={{ fontSize: '0.75rem', color: textSecondary }}>{t.location}</div>
                  <div style={{ fontWeight: 600, color: textColor }}>{post.location || post.city || (lang === 'ar' ? 'غير محدد' : 'Not specified')}</div>
                </div>
                <div>
                  <div style={{ fontSize: '0.75rem', color: textSecondary }}>{t.urgency}</div>
                  <div style={{ fontWeight: 600, color: textColor }}>
                    <span style={{
                      padding: '2px 10px',
                      borderRadius: '12px',
                      fontSize: '0.8rem',
                      background: post.urgency === 'emergency' ? 'rgba(220,38,38,0.1)' : 
                                  post.urgency === 'high' ? 'rgba(245,158,11,0.1)' : 
                                  'rgba(59,130,246,0.1)',
                      color: post.urgency === 'emergency' ? '#dc2626' : 
                             post.urgency === 'high' ? '#f59e0b' : '#3b82f6',
                    }}>
                      {post.urgency === 'emergency' ? t.emergency :
                       post.urgency === 'high' ? t.high :
                       post.urgency === 'medium' ? t.medium : t.low}
                    </span>
                  </div>
                </div>
              </div>

              <div style={{ display: 'flex', gap: '16px', marginTop: '12px', fontSize: '0.8rem', color: textSecondary, flexWrap: 'wrap' }}>
                <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <Calendar size={14} />
                  {t.postedAt}: {new Date(post.created_at).toLocaleDateString(lang === 'ar' ? 'ar-EG' : 'en-US')}
                </span>
                <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <Eye size={14} />
                  {t.views}: {post.views || 0}
                </span>
              </div>
            </div>

            {/* ✅ Client Info (عند قبول العرض) */}
            {showClientInfo && clientInfo && (
              <div className="animate-fade-in-up delay-150" style={{ 
                background: darkMode ? 'rgba(5,150,105,0.1)' : '#d1fae5',
                borderRadius: '16px', 
                padding: '24px', 
                border: `2px solid ${darkMode ? '#059669' : '#059669'}`,
                marginBottom: '20px'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '12px' }}>
                  <CheckCircle size={24} style={{ color: '#059669' }} />
                  <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#059669', margin: 0 }}>
                    {t.acceptedMessage}
                  </h3>
                </div>
                
                <div style={{ background: cardBg, borderRadius: '12px', padding: '16px' }}>
                  <h4 style={{ fontSize: '0.95rem', fontWeight: 700, color: textColor, marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <User size={16} style={{ color: '#3b82f6' }} />
                    {t.clientInfo}
                  </h4>
                  
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <User size={16} style={{ color: '#3b82f6' }} />
                      <span style={{ color: textSecondary }}>
                        <strong>{t.clientName}:</strong> <span style={{ color: textColor }}>{clientInfo.name}</span>
                      </span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <Phone size={16} style={{ color: '#059669' }} />
                      <span style={{ color: textSecondary }}>
                        <strong>{t.clientPhone}:</strong> <span style={{ color: textColor }}>{clientInfo.phone || 'غير متوفر'}</span>
                      </span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', gridColumn: '1 / -1' }}>
                      <Mail size={16} style={{ color: '#8b5cf6' }} />
                      <span style={{ color: textSecondary }}>
                        <strong>{t.clientEmail}:</strong> <span style={{ color: textColor }}>{clientInfo.email}</span>
                      </span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', gridColumn: '1 / -1' }}>
                      <MapPin size={16} style={{ color: '#ef4444' }} />
                      <span style={{ color: textSecondary }}>
                        <strong>{t.clientAddress}:</strong> <span style={{ color: textColor }}>{clientInfo.address || 'غير متوفر'}</span>
                      </span>
                    </div>
                  </div>
                  
                  {clientInfo.phone && (
                    <a
                      href={`tel:${clientInfo.phone}`}
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '8px',
                        marginTop: '16px',
                        padding: '10px 24px',
                        background: '#059669',
                        color: 'white',
                        borderRadius: '10px',
                        textDecoration: 'none',
                        fontWeight: 700,
                        fontFamily: "'Cairo', sans-serif",
                        transition: 'all 0.3s ease',
                      }}
                      onMouseEnter={(e) => e.currentTarget.style.background = '#047857'}
                      onMouseLeave={(e) => e.currentTarget.style.background = '#059669'}
                    >
                      <Phone size={18} />
                      {t.contactNow}
                    </a>
                  )}
                </div>
              </div>
            )}

            {/* Responses */}
            <div className="animate-fade-in-up delay-200" style={{ background: cardBg, borderRadius: '16px', padding: '28px', border: `1px solid ${borderColor}` }}>
              <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: textColor, marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <MessageCircle size={18} style={{ color: '#3b82f6' }} />
                {t.responses} ({post.responses?.length || 0})
              </h3>

              {post.responses && post.responses.length > 0 ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  {post.responses.map((response, index) => {
                    const statusColors = {
                      pending: { bg: 'rgba(245,158,11,0.1)', color: '#f59e0b' },
                      accepted: { bg: 'rgba(5,150,105,0.1)', color: '#059669' },
                      rejected: { bg: 'rgba(220,38,38,0.1)', color: '#dc2626' },
                    };
                    const statusStyle = statusColors[response.status] || statusColors.pending;
                    const isPending = response.status === 'pending';
                    const isAccepted = response.status === 'accepted';
                    const canAct = isOwner && isPending && isOpen;
                    
                    return (
                      <div key={index} className="hover-lift" style={{
                        padding: '16px',
                        borderRadius: '12px',
                        border: `1px solid ${borderColor}`,
                        background: darkMode ? 'rgba(255,255,255,0.02)' : '#f8fafc',
                      }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '8px' }}>
                          <div style={{ flex: 1 }}>
                            <div style={{ fontWeight: 600, color: textColor }}>
                              {response.craftsman?.user?.name || response.craftsman?.name || (lang === 'ar' ? 'حرفي' : 'Craftsman')}
                            </div>
                            <div style={{ fontSize: '0.85rem', color: textSecondary, marginTop: '4px' }}>{response.message}</div>
                            {response.offered_price && (
                              <div style={{ fontSize: '0.85rem', fontWeight: 600, color: '#059669', marginTop: '4px' }}>
                                💰 {response.offered_price} {t.egp}
                                {response.estimated_days && ` • ${response.estimated_days} ${t.days}`}
                              </div>
                            )}
                          </div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                            <span style={{
                              padding: '2px 10px',
                              borderRadius: '12px',
                              fontSize: '0.7rem',
                              fontWeight: 600,
                              background: statusStyle.bg,
                              color: statusStyle.color,
                            }}>
                              {response.status === 'pending' ? t.pending :
                               response.status === 'accepted' ? t.accepted : t.rejected}
                            </span>
                            
                            {/* ✅ أزرار القبول/الرفض للعميل */}
                            {canAct && (
                              <>
                                <button
                                  onClick={() => handleAcceptResponse(response.id)}
                                  disabled={processingResponse}
                                  style={{
                                    padding: '6px 14px',
                                    borderRadius: '8px',
                                    border: 'none',
                                    background: processingResponse ? '#94a3b8' : '#059669',
                                    color: 'white',
                                    cursor: processingResponse ? 'not-allowed' : 'pointer',
                                    fontWeight: 600,
                                    fontSize: '0.75rem',
                                    fontFamily: "'Cairo', sans-serif",
                                    transition: 'all 0.3s ease',
                                  }}
                                  onMouseEnter={(e) => { if(!processingResponse) e.currentTarget.style.background = '#047857'; }}
                                  onMouseLeave={(e) => { if(!processingResponse) e.currentTarget.style.background = '#059669'; }}
                                >
                                  {processingResponse ? t.accepting : t.accept}
                                </button>
                                <button
                                  onClick={() => handleRejectResponse(response.id)}
                                  disabled={processingResponse}
                                  style={{
                                    padding: '6px 14px',
                                    borderRadius: '8px',
                                    border: 'none',
                                    background: processingResponse ? '#94a3b8' : '#dc2626',
                                    color: 'white',
                                    cursor: processingResponse ? 'not-allowed' : 'pointer',
                                    fontWeight: 600,
                                    fontSize: '0.75rem',
                                    fontFamily: "'Cairo', sans-serif",
                                    transition: 'all 0.3s ease',
                                  }}
                                  onMouseEnter={(e) => { if(!processingResponse) e.currentTarget.style.background = '#b91c1c'; }}
                                  onMouseLeave={(e) => { if(!processingResponse) e.currentTarget.style.background = '#dc2626'; }}
                                >
                                  {processingResponse ? t.rejecting : t.reject}
                                </button>
                              </>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div style={{ textAlign: 'center', padding: '24px', color: textSecondary }}>
                  <MessageCircle size={32} style={{ opacity: 0.3, marginBottom: '8px' }} />
                  <p>{t.noResponses}</p>
                </div>
              )}
            </div>
          </div>

          {/* ===== Sidebar ===== */}
          <div style={{ position: 'sticky', top: '84px', alignSelf: 'start' }}>
            
            {/* ===== Respond Form (Craftsman) ===== */}
            {isOpen && isCraftsman && !isOwner && !hasResponded && (
              <div className="animate-fade-in-up delay-300" style={{ background: cardBg, borderRadius: '16px', padding: '24px', border: `1px solid ${borderColor}`, marginBottom: '16px' }}>
                <h3 style={{ fontSize: '1rem', fontWeight: 700, color: textColor, marginBottom: '16px' }}>{t.respondNow}</h3>
                
                <form onSubmit={handleRespond}>
                  <div style={{ marginBottom: '12px' }}>
                    <label style={{ display: 'block', fontWeight: 600, color: textColor, marginBottom: '6px', fontSize: '0.85rem' }}>{t.yourMessage}</label>
                    <textarea
                      value={responseMessage}
                      onChange={(e) => setResponseMessage(e.target.value)}
                      rows="3"
                      placeholder={lang === 'ar' ? 'اكتب رسالتك للحرفي...' : 'Write your message...'}
                      style={inputStyle()}
                    />
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginBottom: '12px' }}>
                    <div>
                      <label style={{ display: 'block', fontWeight: 600, color: textColor, marginBottom: '6px', fontSize: '0.85rem' }}>{t.offeredPrice}</label>
                      <input
                        type="number"
                        value={offeredPrice}
                        onChange={(e) => setOfferedPrice(e.target.value)}
                        placeholder="150"
                        style={inputStyle()}
                      />
                    </div>
                    <div>
                      <label style={{ display: 'block', fontWeight: 600, color: textColor, marginBottom: '6px', fontSize: '0.85rem' }}>{t.estimatedDays}</label>
                      <input
                        type="number"
                        value={estimatedDays}
                        onChange={(e) => setEstimatedDays(e.target.value)}
                        placeholder="3"
                        style={inputStyle()}
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={submitting}
                    style={{
                      width: '100%',
                      padding: '12px',
                      borderRadius: '10px',
                      background: submitting ? '#94a3b8' : 'linear-gradient(135deg, #3b82f6, #2563eb)',
                      color: 'white',
                      border: 'none',
                      fontWeight: 700,
                      fontSize: '0.95rem',
                      cursor: submitting ? 'not-allowed' : 'pointer',
                      fontFamily: "'Cairo', sans-serif",
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '8px',
                      opacity: submitting ? 0.7 : 1,
                    }}
                  >
                    {submitting ? (
                      <>
                        <Loader size={18} className="animate-spin" />
                        {t.sending}
                      </>
                    ) : (
                      <>
                        <Send size={18} />
                        {t.sendResponse}
                      </>
                    )}
                  </button>
                </form>
              </div>
            )}

            {/* ===== Already Responded ===== */}
            {isOpen && isCraftsman && !isOwner && hasResponded && (
              <div className="animate-fade-in-up" style={{ 
                background: cardBg, 
                borderRadius: '16px', 
                padding: '24px', 
                border: `1px solid ${borderColor}`, 
                marginBottom: '16px', 
                textAlign: 'center' 
              }}>
                <CheckCircle size={32} style={{ color: '#059669', marginBottom: '8px' }} />
                <p style={{ fontWeight: 600, color: '#059669' }}>
                  {lang === 'ar' ? '✅ لقد قمت بالرد بالفعل' : '✅ You have already responded'}
                </p>
              </div>
            )}

            {/* ===== Login Required ===== */}
            {!isAuthenticated && (
              <div className="animate-fade-in-up" style={{ background: cardBg, borderRadius: '16px', padding: '24px', border: `1px solid ${borderColor}`, textAlign: 'center' }}>
                <p style={{ color: textSecondary, marginBottom: '12px' }}>{t.loginToRespond}</p>
                <Link
                  to="/login"
                  style={{
                    display: 'inline-block',
                    padding: '10px 24px',
                    borderRadius: '10px',
                    background: 'linear-gradient(135deg, #3b82f6, #2563eb)',
                    color: 'white',
                    textDecoration: 'none',
                    fontWeight: 600,
                    fontFamily: "'Cairo', sans-serif",
                  }}
                >
                  {lang === 'ar' ? 'تسجيل الدخول' : 'Login'}
                </Link>
              </div>
            )}

            {/* ===== Post Closed ===== */}
            {!isOpen && (
              <div className="animate-fade-in-up" style={{ background: cardBg, borderRadius: '16px', padding: '24px', border: `1px solid ${borderColor}`, textAlign: 'center' }}>
                <AlertCircle size={32} style={{ color: '#f59e0b', marginBottom: '8px' }} />
                <p style={{ fontWeight: 600, color: '#f59e0b' }}>
                  {lang === 'ar' ? '⛔ هذا المنشور مغلق' : '⛔ This post is closed'}
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ServicePostDetailPage;