// src/pages/CraftsmanPostsPage.jsx
import React, { useState, useEffect, useCallback } from 'react';
import { useTheme } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import {
  Search, Filter, MapPin, DollarSign, Calendar,
  Clock, Wrench, Loader, FileText, Send, X,
  ChevronDown, ChevronUp, AlertCircle, CheckCircle
} from 'lucide-react';

const CraftsmanPostsPage = () => {
  const { darkMode } = useTheme();
  const { user } = useAuth();
  const [lang, setLang] = useState('ar');

  const [posts, setPosts] = useState([]);
  const [crafts, setCrafts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // Filters
  const [search, setSearch] = useState('');
  const [selectedCraft, setSelectedCraft] = useState('');
  const [selectedCity, setSelectedCity] = useState('');
  const [selectedUrgency, setSelectedUrgency] = useState('');
  const [showFilters, setShowFilters] = useState(false);

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [lastPage, setLastPage] = useState(1);

  // Response modal
  const [respondingTo, setRespondingTo] = useState(null);
  const [responseForm, setResponseForm] = useState({ message: '', offered_price: '', estimated_days: '' });
  const [submitting, setSubmitting] = useState(false);

  // Expanded post
  const [expandedPost, setExpandedPost] = useState(null);

  const isArabic = lang === 'ar';

  useEffect(() => {
    const savedLang = localStorage.getItem('language') || 'ar';
    setLang(savedLang);
    const handleLang = () => setLang(localStorage.getItem('language') || 'ar');
    window.addEventListener('languagechange', handleLang);
    return () => window.removeEventListener('languagechange', handleLang);
  }, []);

  // جلب المهن
  useEffect(() => {
    api.getCrafts().then(data => setCrafts(data.crafts || [])).catch(() => {});
  }, []);

  const loadPosts = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      // ✅ جلب بيانات الحرفي للحصول على المدينة والمهنة الافتراضية
      let defaultCity = '';
      let defaultCraft = '';
      
      try {
        const meData = await api.getMe();
        const craftsman = meData.user?.craftsman;
        if (craftsman) {
          defaultCity = craftsman.city || '';
          defaultCraft = craftsman.crafts?.[0]?.id || '';
        }
      } catch (e) {
        console.warn('Could not get craftsman data:', e);
      }
      
      const data = await api.getServicePosts({
        search: search || undefined,
        craft_id: selectedCraft || defaultCraft || undefined,
        city: selectedCity || defaultCity || undefined,
        urgency: selectedUrgency || undefined,
        page: currentPage,
        per_page: 10,
        sort_by: 'newest',
      });
      
      const postsArray = data.posts?.data || data.data || [];
      // ✅ إضافة has_responded من already_responded
      const postsWithResponded = postsArray.map(post => ({
        ...post,
        has_responded: post.already_responded || false,
      }));
      setPosts(postsWithResponded);
      setLastPage(data.posts?.last_page || data.meta?.last_page || 1);
    } catch (err) {
      console.error('❌ Error loading posts:', err);
      setError(isArabic ? 'حدث خطأ في جلب المنشورات' : 'Error loading posts');
    } finally {
      setLoading(false);
    }
  }, [search, selectedCraft, selectedCity, selectedUrgency, currentPage, isArabic]);

  useEffect(() => { loadPosts(); }, [loadPosts]);

  const handleSearch = (e) => {
    e.preventDefault();
    setCurrentPage(1);
    loadPosts();
  };

  const handleRespond = async () => {
    if (!responseForm.message.trim()) return;
    setSubmitting(true);
    try {
      await api.respondToServicePost(respondingTo, {
        message: responseForm.message,
        ...(responseForm.offered_price && { offered_price: parseFloat(responseForm.offered_price) }),
        ...(responseForm.estimated_days && { estimated_days: parseInt(responseForm.estimated_days) }),
      });
      showSuccess(isArabic ? '✅ تم إرسال ردك بنجاح' : '✅ Response sent successfully');
      setRespondingTo(null);
      setResponseForm({ message: '', offered_price: '', estimated_days: '' });
      // ✅ تحديث المنشور
      setPosts(prev => prev.map(p => p.id === respondingTo ? { ...p, has_responded: true } : p));
    } catch (err) {
      console.error('❌ Error responding:', err);
      setError(err.message || (isArabic ? 'حدث خطأ في إرسال الرد' : 'Error sending response'));
    } finally {
      setSubmitting(false);
    }
  };

  const showSuccess = (msg) => {
    setSuccessMsg(msg);
    setTimeout(() => setSuccessMsg(''), 3500);
  };

  // ✅ دالة الحصول على نمط الإلحاح (تدعم emergency)
  const getUrgencyStyle = (u) => {
    const styles = {
      low:      { label: isArabic ? 'غير عاجل' : 'Low',      bg: '#f0fdf4', color: '#166534' },
      medium:   { label: isArabic ? 'عادي'    : 'Medium',    bg: '#fefce8', color: '#854d0e' },
      high:     { label: isArabic ? 'عاجل'    : 'High',      bg: '#fff7ed', color: '#9a3412' },
      emergency:{ label: isArabic ? 'طوارئ'   : 'Emergency', bg: '#fef2f2', color: '#991b1b' },
    };
    return styles[u] || { label: u, bg: '#f1f5f9', color: '#475569' };
  };

  const bg = darkMode ? '#0f172a' : '#f8fafc';
  const card = darkMode ? '#1e293b' : '#ffffff';
  const border = darkMode ? '#334155' : '#e2e8f0';
  const text = darkMode ? '#f1f5f9' : '#0f172a';
  const sub = darkMode ? '#94a3b8' : '#64748b';
  const inputBg = darkMode ? '#0f172a' : '#f8fafc';
  const accent = '#f59e0b';

  const inputStyle = {
    background: inputBg, border: `1px solid ${border}`, borderRadius: 8,
    padding: '9px 12px', color: text, fontSize: 14, fontFamily: 'Cairo, sans-serif',
    outline: 'none', width: '100%', boxSizing: 'border-box',
  };

  return (
    <div style={{ minHeight: '100vh', background: bg, color: text, fontFamily: 'Cairo, sans-serif', direction: isArabic ? 'rtl' : 'ltr' }}>
      <div style={{ maxWidth: 900, margin: '0 auto', padding: '32px 16px' }}>

        {/* Header */}
        <div style={{ marginBottom: 28 }}>
          <h1 style={{ fontSize: 26, fontWeight: 700, margin: 0 }}>
            {isArabic ? '📋 طلبات الخدمة' : '📋 Service Requests'}
          </h1>
          <p style={{ color: sub, marginTop: 4, fontSize: 14 }}>
            {isArabic ? 'تصفح طلبات العملاء وأرسل عروضك' : 'Browse client requests and send your offers'}
          </p>
        </div>

        {/* Search + Filter Bar */}
        <form onSubmit={handleSearch} style={{ marginBottom: 16 }}>
          <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
            <div style={{ flex: 1, minWidth: 200, position: 'relative' }}>
              <Search size={15} style={{ position: 'absolute', top: '50%', transform: 'translateY(-50%)', [isArabic ? 'right' : 'left']: 12, color: sub, pointerEvents: 'none' }} />
              <input
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder={isArabic ? 'ابحث في الطلبات...' : 'Search requests...'}
                style={{ ...inputStyle, [isArabic ? 'paddingRight' : 'paddingLeft']: 36 }}
              />
            </div>
            <button
              type="button"
              onClick={() => setShowFilters(p => !p)}
              style={{
                display: 'flex', alignItems: 'center', gap: 6,
                background: showFilters ? accent : card,
                color: showFilters ? '#fff' : text,
                border: `1px solid ${border}`, borderRadius: 8,
                padding: '9px 16px', cursor: 'pointer', fontFamily: 'Cairo, sans-serif',
                fontSize: 14, fontWeight: 600
              }}
            >
              <Filter size={14} />
              {isArabic ? 'فلترة' : 'Filter'}
            </button>
            <button
              type="submit"
              style={{
                background: accent, color: '#fff', border: 'none',
                borderRadius: 8, padding: '9px 20px', fontWeight: 600,
                cursor: 'pointer', fontFamily: 'Cairo, sans-serif', fontSize: 14
              }}
            >
              {isArabic ? 'بحث' : 'Search'}
            </button>
          </div>

          {/* Filters Panel */}
          {showFilters && (
            <div style={{
              marginTop: 12, background: card, border: `1px solid ${border}`,
              borderRadius: 12, padding: '16px 20px',
              display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 12
            }}>
              <div>
                <label style={{ fontSize: 12, color: sub, display: 'block', marginBottom: 6 }}>
                  {isArabic ? 'التخصص' : 'Craft'}
                </label>
                <select value={selectedCraft} onChange={e => { setSelectedCraft(e.target.value); setCurrentPage(1); }} style={inputStyle}>
                  <option value="">{isArabic ? 'الكل' : 'All'}</option>
                  {crafts.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
              </div>
              <div>
                <label style={{ fontSize: 12, color: sub, display: 'block', marginBottom: 6 }}>
                  {isArabic ? 'المدينة' : 'City'}
                </label>
                <input
                  value={selectedCity}
                  onChange={e => { setSelectedCity(e.target.value); setCurrentPage(1); }}
                  placeholder={isArabic ? 'اكتب المدينة' : 'Enter city'}
                  style={inputStyle}
                />
              </div>
              <div>
                <label style={{ fontSize: 12, color: sub, display: 'block', marginBottom: 6 }}>
                  {isArabic ? 'الأولوية' : 'Urgency'}
                </label>
                <select value={selectedUrgency} onChange={e => { setSelectedUrgency(e.target.value); setCurrentPage(1); }} style={inputStyle}>
                  <option value="">{isArabic ? 'الكل' : 'All'}</option>
                  <option value="low">{isArabic ? 'منخفض' : 'Low'}</option>
                  <option value="medium">{isArabic ? 'متوسط' : 'Medium'}</option>
                  <option value="high">{isArabic ? 'مرتفع' : 'High'}</option>
                  <option value="emergency">{isArabic ? 'طوارئ' : 'Emergency'}</option>
                </select>
              </div>
              <div style={{ display: 'flex', alignItems: 'flex-end' }}>
                <button
                  type="button"
                  onClick={() => { setSelectedCraft(''); setSelectedCity(''); setSelectedUrgency(''); setCurrentPage(1); }}
                  style={{ background: 'transparent', border: `1px solid ${border}`, borderRadius: 8, padding: '9px 14px', cursor: 'pointer', color: sub, fontSize: 13, fontFamily: 'Cairo, sans-serif', width: '100%' }}
                >
                  {isArabic ? 'مسح الفلاتر' : 'Clear filters'}
                </button>
              </div>
            </div>
          )}
        </form>

        {/* Alerts */}
        {successMsg && (
          <div style={{ background: '#d1fae5', color: '#065f46', borderRadius: 10, padding: '12px 16px', marginBottom: 16, fontWeight: 600 }}>
            {successMsg}
          </div>
        )}
        {error && (
          <div style={{ background: '#fee2e2', color: '#991b1b', borderRadius: 10, padding: '12px 16px', marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8 }}>
            <AlertCircle size={16} /> {error}
          </div>
        )}

        {/* Loading */}
        {loading && (
          <div style={{ textAlign: 'center', padding: '60px 0' }}>
            <Loader size={36} style={{ color: accent, animation: 'spin 1s linear infinite' }} />
          </div>
        )}

        {/* Empty */}
        {!loading && posts.length === 0 && (
          <div style={{ textAlign: 'center', padding: '80px 20px', background: card, borderRadius: 16, border: `1px solid ${border}` }}>
            <FileText size={52} style={{ color: sub, marginBottom: 16 }} />
            <h3 style={{ fontWeight: 600, marginBottom: 8 }}>{isArabic ? 'لا توجد طلبات حالياً' : 'No requests found'}</h3>
            <p style={{ color: sub }}>{isArabic ? 'جرب تغيير معايير البحث' : 'Try changing your search filters'}</p>
          </div>
        )}

        {/* Posts */}
        {!loading && posts.map(post => {
          const urgStyle = getUrgencyStyle(post.urgency);
          const isExpanded = expandedPost === post.id;

          return (
            <div key={post.id} style={{ background: card, border: `1px solid ${border}`, borderRadius: 16, marginBottom: 14, overflow: 'hidden' }}>
              <div style={{ padding: '20px 24px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 12, flexWrap: 'wrap' }}>

                  {/* Content */}
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap', marginBottom: 8 }}>
                      <span style={{ fontWeight: 700, fontSize: 16 }}>{post.title}</span>
                      <span style={{ background: urgStyle.bg, color: urgStyle.color, borderRadius: 20, padding: '2px 10px', fontSize: 12, fontWeight: 600 }}>
                        {urgStyle.label}
                      </span>
                      {/* ✅ استخدام has_responded من already_responded */}
                      {post.has_responded && (
                        <span style={{ background: '#d1fae5', color: '#065f46', borderRadius: 20, padding: '2px 10px', fontSize: 12, fontWeight: 600 }}>
                          ✅ {isArabic ? 'تم الرد' : 'Responded'}
                        </span>
                      )}
                    </div>

                    <p style={{ color: sub, fontSize: 14, margin: '0 0 10px', lineHeight: 1.7 }}>
                      {isExpanded ? post.description : (post.description?.length > 130 ? post.description.slice(0, 130) + '...' : post.description)}
                    </p>

                    {/* Meta */}
                    <div style={{ display: 'flex', gap: 14, flexWrap: 'wrap' }}>
                      {post.city && (
                        <span style={{ display: 'flex', alignItems: 'center', gap: 4, color: sub, fontSize: 13 }}>
                          <MapPin size={13} /> {post.city}
                        </span>
                      )}
                      {(post.budget_from || post.budget_to) && (
                        <span style={{ display: 'flex', alignItems: 'center', gap: 4, color: '#10b981', fontSize: 13, fontWeight: 600 }}>
                          <DollarSign size={13} />
                          {post.budget_from && post.budget_to
                            ? `${post.budget_from} - ${post.budget_to} ${isArabic ? 'ج.م' : 'EGP'}`
                            : `${post.budget_from || post.budget_to} ${isArabic ? 'ج.م' : 'EGP'}`}
                        </span>
                      )}
                      {post.needed_by && (
                        <span style={{ display: 'flex', alignItems: 'center', gap: 4, color: sub, fontSize: 13 }}>
                          <Calendar size={13} /> {new Date(post.needed_by).toLocaleDateString(isArabic ? 'ar-EG' : 'en-US')}
                        </span>
                      )}
                      {(post.craft?.name || post.custom_craft) && (
                        <span style={{ display: 'flex', alignItems: 'center', gap: 4, color: sub, fontSize: 13 }}>
                          <Wrench size={13} /> {post.craft?.name || post.custom_craft}
                        </span>
                      )}
                      <span style={{ display: 'flex', alignItems: 'center', gap: 4, color: sub, fontSize: 13 }}>
                        <Clock size={13} /> {new Date(post.created_at).toLocaleDateString(isArabic ? 'ar-EG' : 'en-US')}
                      </span>
                    </div>
                  </div>

                  {/* Send Response Button */}
                  {!post.has_responded && (
                    <button
                      onClick={() => { setRespondingTo(post.id); setResponseForm({ message: '', offered_price: '', estimated_days: '' }); }}
                      style={{
                        display: 'flex', alignItems: 'center', gap: 6,
                        background: accent, color: '#fff', border: 'none',
                        borderRadius: 10, padding: '9px 18px', cursor: 'pointer',
                        fontWeight: 600, fontSize: 14, fontFamily: 'Cairo, sans-serif',
                        whiteSpace: 'nowrap'
                      }}
                    >
                      <Send size={14} />
                      {isArabic ? 'أرسل عرضك' : 'Send Offer'}
                    </button>
                  )}
                </div>

                {/* Read More */}
                {post.description?.length > 130 && (
                  <button
                    onClick={() => setExpandedPost(isExpanded ? null : post.id)}
                    style={{ background: 'transparent', border: 'none', color: accent, cursor: 'pointer', fontSize: 13, fontFamily: 'Cairo, sans-serif', padding: '6px 0', display: 'flex', alignItems: 'center', gap: 4 }}
                  >
                    {isExpanded ? (isArabic ? 'عرض أقل' : 'Show less') : (isArabic ? 'عرض المزيد' : 'Read more')}
                    {isExpanded ? <ChevronUp size={13} /> : <ChevronDown size={13} />}
                  </button>
                )}
              </div>

              {/* Response Form */}
              {respondingTo === post.id && (
                <div style={{ borderTop: `1px solid ${border}`, padding: '20px 24px', background: darkMode ? '#0f172a' : '#fafafa' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
                    <span style={{ fontWeight: 600, fontSize: 15 }}>
                      {isArabic ? '📤 أرسل عرضك للعميل' : '📤 Send your offer'}
                    </span>
                    <button onClick={() => setRespondingTo(null)} style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: sub }}>
                      <X size={18} />
                    </button>
                  </div>

                  <div style={{ display: 'grid', gap: 12 }}>
                    <div>
                      <label style={{ fontSize: 12, color: sub, display: 'block', marginBottom: 6 }}>
                        {isArabic ? 'رسالتك *' : 'Your message *'}
                      </label>
                      <textarea
                        value={responseForm.message}
                        onChange={e => setResponseForm(p => ({ ...p, message: e.target.value }))}
                        placeholder={isArabic ? 'اشرح خبرتك وكيف ستنفذ الطلب...' : 'Describe your experience and approach...'}
                        rows={3}
                        style={{ ...inputStyle, resize: 'vertical' }}
                      />
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                      <div>
                        <label style={{ fontSize: 12, color: sub, display: 'block', marginBottom: 6 }}>
                          {isArabic ? 'السعر المقترح (ج.م)' : 'Offered price (EGP)'}
                        </label>
                        <input
                          type="number"
                          value={responseForm.offered_price}
                          onChange={e => setResponseForm(p => ({ ...p, offered_price: e.target.value }))}
                          placeholder={isArabic ? 'اختياري' : 'Optional'}
                          style={inputStyle}
                        />
                      </div>
                      <div>
                        <label style={{ fontSize: 12, color: sub, display: 'block', marginBottom: 6 }}>
                          {isArabic ? 'مدة التنفيذ (أيام)' : 'Estimated days'}
                        </label>
                        <input
                          type="number"
                          value={responseForm.estimated_days}
                          onChange={e => setResponseForm(p => ({ ...p, estimated_days: e.target.value }))}
                          placeholder={isArabic ? 'اختياري' : 'Optional'}
                          style={inputStyle}
                        />
                      </div>
                    </div>

                    <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
                      <button
                        onClick={() => setRespondingTo(null)}
                        style={{ background: 'transparent', border: `1px solid ${border}`, borderRadius: 8, padding: '9px 18px', cursor: 'pointer', color: text, fontFamily: 'Cairo, sans-serif', fontSize: 14 }}
                      >
                        {isArabic ? 'إلغاء' : 'Cancel'}
                      </button>
                      <button
                        onClick={handleRespond}
                        disabled={submitting || !responseForm.message.trim()}
                        style={{
                          background: responseForm.message.trim() ? accent : '#cbd5e1',
                          color: '#fff', border: 'none', borderRadius: 8,
                          padding: '9px 22px', cursor: responseForm.message.trim() ? 'pointer' : 'not-allowed',
                          fontWeight: 600, fontSize: 14, fontFamily: 'Cairo, sans-serif',
                          display: 'flex', alignItems: 'center', gap: 6
                        }}
                      >
                        {submitting ? <Loader size={14} style={{ animation: 'spin 1s linear infinite' }} /> : <Send size={14} />}
                        {isArabic ? 'إرسال العرض' : 'Send Offer'}
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          );
        })}

        {/* Pagination */}
        {!loading && lastPage > 1 && (
          <div style={{ display: 'flex', justifyContent: 'center', gap: 8, marginTop: 24 }}>
            <button
              onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              style={{ background: card, border: `1px solid ${border}`, borderRadius: 8, padding: '8px 16px', cursor: currentPage === 1 ? 'not-allowed' : 'pointer', color: currentPage === 1 ? sub : text, fontFamily: 'Cairo, sans-serif' }}
            >
              {isArabic ? 'السابق' : 'Prev'}
            </button>
            {Array.from({ length: lastPage }, (_, i) => i + 1).map(p => (
              <button
                key={p}
                onClick={() => setCurrentPage(p)}
                style={{
                  background: p === currentPage ? accent : card,
                  color: p === currentPage ? '#fff' : text,
                  border: `1px solid ${p === currentPage ? accent : border}`,
                  borderRadius: 8, padding: '8px 14px', cursor: 'pointer',
                  fontWeight: p === currentPage ? 700 : 400,
                  fontFamily: 'Cairo, sans-serif'
                }}
              >
                {p}
              </button>
            ))}
            <button
              onClick={() => setCurrentPage(p => Math.min(lastPage, p + 1))}
              disabled={currentPage === lastPage}
              style={{ background: card, border: `1px solid ${border}`, borderRadius: 8, padding: '8px 16px', cursor: currentPage === lastPage ? 'not-allowed' : 'pointer', color: currentPage === lastPage ? sub : text, fontFamily: 'Cairo, sans-serif' }}
            >
              {isArabic ? 'التالي' : 'Next'}
            </button>
          </div>
        )}
      </div>

      <style>{`
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
      `}</style>
    </div>
  );
};

export default CraftsmanPostsPage;