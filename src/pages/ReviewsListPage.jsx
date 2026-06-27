// src/pages/ReviewsListPage.jsx
import React, { useState, useEffect } from 'react';
import { useTheme } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import { 
  Star, TrendingUp, Users, Filter, ThumbsUp, 
  MessageSquare, Award, ChevronDown, Search,
  Calendar, User, CheckCircle, Sparkles,
  BarChart3, PieChart, Loader, AlertCircle,
  ArrowLeft, ArrowRight, Rocket
} from 'lucide-react';
import { useNavigate, Link } from 'react-router-dom';

const ReviewsListPage = () => {
  const navigate = useNavigate();
  const { darkMode } = useTheme();
  const { user, isAuthenticated } = useAuth();
  const [lang, setLang] = useState('ar');
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState(0);
  const [sortBy, setSortBy] = useState('newest');
  const [helpfulClicked, setHelpfulClicked] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [stats, setStats] = useState({
    total: 0,
    avg: 0,
    distribution: { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 }
  });
  const [error, setError] = useState('');

  // ========== Language ==========
  useEffect(() => {
    const savedLang = localStorage.getItem('language') || 'ar';
    setLang(savedLang);
    
    const handleLanguageChange = () => {
      const currentLang = localStorage.getItem('language') || 'ar';
      setLang(currentLang);
    };
    
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

  // ========== جلب التقييمات من API ==========
  useEffect(() => {
    const loadReviews = async () => {
      setLoading(true);
      setError('');
      
      try {
        const response = await api.getReviews();
        console.log('📥 [ReviewsListPage] API Response:', response);
        
        let reviewsData = [];
        
        if (response?.reviews?.data) {
          reviewsData = response.reviews.data;
        } else if (response?.data) {
          reviewsData = response.data;
        } else if (Array.isArray(response)) {
          reviewsData = response;
        } else if (response?.reviews) {
          reviewsData = response.reviews;
        }
        
        console.log(`📊 [ReviewsListPage] Found ${reviewsData.length} reviews`);
        
        const formattedReviews = reviewsData
          .filter(r => r.is_visible !== false)
          .map(r => ({
            id: r.id,
            rating: r.rating || 0,
            comment: r.comment || '',
            client_name: r.client?.name || (lang === 'ar' ? 'عميل' : 'Client'),
            craftsman_name: `${r.craftsman?.first_name || ''} ${r.craftsman?.last_name || ''}`.trim() || '',
            craftsman_id: r.craftsman_id,
            booking_id: r.booking_id,
            created_at: r.created_at || new Date().toISOString(),
            profession: r.craftsman?.crafts?.[0]?.name || (lang === 'ar' ? 'خدمة منزلية' : 'Home Service'),
          }));
        
        setReviews(formattedReviews);
        
        const total = formattedReviews.length;
        const sum = formattedReviews.reduce((s, r) => s + (r.rating || 0), 0);
        const avg = total > 0 ? Math.round((sum / total) * 10) / 10 : 0;
        
        const dist = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
        formattedReviews.forEach(r => {
          const rating = Math.round(r.rating || 0);
          if (rating >= 1 && rating <= 5) {
            dist[rating] = (dist[rating] || 0) + 1;
          }
        });
        
        setStats({ total, avg, distribution: dist });
        
      } catch (error) {
        console.error('❌ Reviews error:', error);
        setError(error.message || (lang === 'ar' ? 'حدث خطأ في تحميل التقييمات' : 'Error loading reviews'));
        setReviews([]);
      }
      setLoading(false);
    };
    loadReviews();
  }, [lang]);

  // ========== Translations ==========
  const t = {
    title: lang === 'ar' ? 'التقييمات' : 'Reviews',
    subtitle: lang === 'ar' ? 'اطلع على آراء وتقييمات العملاء' : 'Check out customer ratings and reviews',
    totalReviews: (count) => lang === 'ar' ? `${count} تقييم` : `${count} reviews`,
    outOf5: lang === 'ar' ? 'من 5' : 'out of 5',
    all: lang === 'ar' ? 'الكل' : 'All',
    newest: lang === 'ar' ? 'الأحدث' : 'Newest',
    oldest: lang === 'ar' ? 'الأقدم' : 'Oldest',
    highest: lang === 'ar' ? 'الأعلى تقييماً' : 'Highest Rated',
    lowest: lang === 'ar' ? 'الأقل تقييماً' : 'Lowest Rated',
    helpful: lang === 'ar' ? 'مفيد' : 'Helpful',
    loading: lang === 'ar' ? 'جاري تحميل التقييمات...' : 'Loading reviews...',
    noReviews: lang === 'ar' ? 'لا توجد تقييمات' : 'No reviews',
    searchPlaceholder: lang === 'ar' ? 'ابحث في التقييمات...' : 'Search reviews...',
    ratingDistribution: lang === 'ar' ? 'توزيع التقييمات' : 'Rating Distribution',
    averageRating: lang === 'ar' ? 'متوسط التقييم' : 'Average Rating',
    totalCount: lang === 'ar' ? 'إجمالي التقييمات' : 'Total Reviews',
    stars: (count) => lang === 'ar' ? `${count} نجوم` : `${count} stars`,
    viewProfile: lang === 'ar' ? 'عرض الملف' : 'View Profile',
    back: lang === 'ar' ? 'العودة' : 'Back',
    error: lang === 'ar' ? 'حدث خطأ' : 'Error',
    retry: lang === 'ar' ? 'إعادة المحاولة' : 'Retry',
    // ✅ رسائل زر ابدأ الآن (تم إصلاح الـ Syntax)
    startNow: lang === 'ar' ? '🚀 ابدأ الآن' : '🚀 Start Now',
    startNowDesc: lang === 'ar' 
      ? 'انضم إلى منصة اطلب صنايعي واستفد من خدماتنا المميزة' 
      : 'Join Atlob Sanaeyi platform and benefit from our premium services',
    joinNow: lang === 'ar' ? 'انضم الآن' : 'Join Now',
    startJourney: lang === 'ar' ? 'ابدأ رحلتك معنا' : 'Start your journey with us',
  };

  // ========== Filter and Sort ==========
  let filtered = filter === 0 ? reviews : reviews.filter(r => r.rating === filter);
  
  if (searchQuery.trim()) {
    filtered = filtered.filter(r => 
      (r.comment && r.comment.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (r.client_name && r.client_name.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (r.profession && r.profession.toLowerCase().includes(searchQuery.toLowerCase()))
    );
  }
  
  switch(sortBy) {
    case 'oldest':
      filtered.sort((a, b) => new Date(a.created_at) - new Date(b.created_at));
      break;
    case 'highest':
      filtered.sort((a, b) => b.rating - a.rating);
      break;
    case 'lowest':
      filtered.sort((a, b) => a.rating - b.rating);
      break;
    default: // newest
      filtered.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
  }

  const total = stats.total || reviews.length;
  const avg = stats.avg || (total > 0 ? Math.round((reviews.reduce((s, r) => s + r.rating, 0) / total) * 10) / 10 : 0);
  
  const dist = [5, 4, 3, 2, 1].map(star => ({
    star,
    count: stats.distribution?.[star] || reviews.filter(r => Math.round(r.rating || 0) === star).length,
    percent: total > 0 ? Math.round(((stats.distribution?.[star] || reviews.filter(r => Math.round(r.rating || 0) === star).length) / total) * 100) : 0
  }));

  // ✅ تعليم التقييم كمفيد
  const handleHelpful = async (reviewId) => {
    if (helpfulClicked.includes(reviewId)) return;
    
    try {
      await api.markReviewHelpful(reviewId);
      setHelpfulClicked(prev => [...prev, reviewId]);
      setReviews(prev => prev.map(r => 
        r.id === reviewId 
          ? { ...r, helpful_count: (r.helpful_count || 0) + 1 }
          : r
      ));
    } catch (error) {
      console.warn('⚠️ Could not mark helpful:', error);
    }
  };

  // ========== Styles ==========
  const bgColor = darkMode ? '#0f172a' : '#f8fafc';
  const cardBg = darkMode ? '#1e293b' : '#ffffff';
  const textColor = darkMode ? '#f1f5f9' : '#0f172a';
  const textSecondary = darkMode ? '#94a3b8' : '#64748b';
  const borderColor = darkMode ? '#334155' : '#e2e8f0';
  const accentColor = '#3b82f6';
  const starColor = '#f59e0b';

  return (
    <div style={{
      background: bgColor,
      minHeight: '100vh',
      fontFamily: "'Cairo', sans-serif",
      direction: lang === 'ar' ? 'rtl' : 'ltr',
    }}>
      <style>{`
        @keyframes fadeInUp {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes growBar {
          from { width: 0 !important; }
        }
        @keyframes shimmer {
          0% { background-position: -200% 0; }
          100% { background-position: 200% 0; }
        }
        @keyframes pulse {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.05); }
        }
        .animate-fade-in-up { animation: fadeInUp 0.5s ease forwards; }
        .animate-fade-in { animation: fadeIn 0.3s ease forwards; }
        .grow-bar { animation: growBar 1.5s ease forwards; }
        .delay-100 { animation-delay: 0.1s; }
        .delay-200 { animation-delay: 0.2s; }
        .delay-300 { animation-delay: 0.3s; }
        .delay-400 { animation-delay: 0.4s; }
        .hover-lift { transition: all 0.3s ease; }
        .hover-lift:hover { transform: translateY(-3px); box-shadow: 0 8px 24px rgba(0,0,0,0.1); }
        .skeleton {
          background: linear-gradient(90deg, ${darkMode ? '#334155' : '#e2e8f0'} 25%, ${darkMode ? '#1e293b' : '#f1f5f9'} 50%, ${darkMode ? '#334155' : '#e2e8f0'} 75%);
          background-size: 200% 100%;
          animation: shimmer 1.5s infinite;
        }
        .pulse-animation {
          animation: pulse 2s infinite;
        }
        @media (max-width: 768px) {
          .stats-container { flex-direction: column !important; }
          .filters-row { flex-wrap: wrap !important; }
          .cta-section { flex-direction: column !important; text-align: center !important; }
        }
      `}</style>

      {/* Header */}
      <div style={{
        background: darkMode 
          ? 'linear-gradient(160deg, #1e3a8a, #1e40af)'
          : 'linear-gradient(160deg, #2563eb, #1d4ed8)',
        color: 'white',
        padding: '32px 0',
      }}>
        <div style={{ maxWidth: '900px', margin: '0 auto', padding: '0 24px' }}>
          <div className="animate-fade-in-up" style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <button 
              onClick={() => navigate(-1)} 
              style={{
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
              }}
            >
              <ArrowLeft size={20} />
            </button>
            <div>
              <h1 style={{ fontSize: '1.5rem', fontWeight: 700, margin: 0 }}>
                {t.title}
              </h1>
              <p style={{ fontSize: '0.85rem', opacity: 0.85, margin: '2px 0 0' }}>
                {t.totalReviews(total)} • {t.averageRating}: {avg} ⭐
              </p>
            </div>
          </div>
        </div>
      </div>

      <div style={{
        maxWidth: '900px',
        margin: '0 auto',
        padding: '32px 24px',
      }}>
        
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

        {/* Statistics Card */}
        <div className="animate-fade-in-up delay-100" style={{
          background: cardBg,
          borderRadius: '20px',
          padding: '32px',
          border: `1px solid ${borderColor}`,
          marginBottom: '24px',
        }}>
          <div className="stats-container" style={{
            display: 'flex',
            gap: '32px',
            flexWrap: 'wrap',
            alignItems: 'center',
          }}>
            {/* Average Rating */}
            <div style={{
              textAlign: 'center',
              flexShrink: 0,
              minWidth: '120px',
            }}>
              <div style={{
                fontSize: '3.5rem',
                fontWeight: 800,
                color: accentColor,
                lineHeight: 1,
                marginBottom: '4px',
              }}>
                {avg}
              </div>
              <div style={{
                display: 'flex',
                justifyContent: 'center',
                gap: '2px',
                marginBottom: '4px',
              }}>
                {[1, 2, 3, 4, 5].map(i => (
                  <Star
                    key={i}
                    size={14}
                    fill={i <= Math.round(avg) ? starColor : 'none'}
                    color={i <= Math.round(avg) ? starColor : '#cbd5e1'}
                  />
                ))}
              </div>
              <div style={{
                fontSize: '0.85rem',
                color: textSecondary,
              }}>
                {t.outOf5}
              </div>
            </div>

            {/* Distribution Bars */}
            <div style={{ flex: 1, minWidth: '250px' }}>
              <h3 style={{
                fontSize: '0.9rem',
                fontWeight: 600,
                color: textColor,
                marginBottom: '16px',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
              }}>
                <BarChart3 size={16} style={{ color: accentColor }} />
                {t.ratingDistribution}
              </h3>
              {dist.map((d) => (
                <div key={d.star} style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px',
                  marginBottom: '8px',
                }}>
                  <span style={{
                    width: '20px',
                    fontSize: '0.8rem',
                    color: textSecondary,
                    fontWeight: 600,
                    textAlign: 'right',
                  }}>
                    {d.star}
                  </span>
                  <Star size={12} fill={starColor} color={starColor} style={{ flexShrink: 0 }} />
                  <div style={{
                    flex: 1,
                    height: '8px',
                    background: darkMode ? '#334155' : '#e2e8f0',
                    borderRadius: '4px',
                    overflow: 'hidden',
                  }}>
                    <div className="grow-bar" style={{
                      height: '100%',
                      borderRadius: '4px',
                      background: d.star >= 4 
                        ? 'linear-gradient(90deg, #059669, #10b981)'
                        : d.star === 3
                        ? 'linear-gradient(90deg, #f59e0b, #fbbf24)'
                        : 'linear-gradient(90deg, #ef4444, #f87171)',
                      width: `${d.percent}%`,
                    }} />
                  </div>
                  <span style={{
                    width: '30px',
                    fontSize: '0.75rem',
                    color: textSecondary,
                    fontWeight: 500,
                  }}>
                    {d.count}
                  </span>
                  <span style={{
                    width: '35px',
                    fontSize: '0.75rem',
                    color: textSecondary,
                    textAlign: 'right',
                  }}>
                    {d.percent}%
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Filters Row */}
        <div className="animate-fade-in-up delay-200" style={{
          display: 'flex',
          gap: '12px',
          marginBottom: '20px',
          flexWrap: 'wrap',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}>
          <div className="filters-row" style={{
            display: 'flex',
            gap: '8px',
            flexWrap: 'wrap',
          }}>
            <button
              onClick={() => setFilter(0)}
              style={{
                padding: '8px 18px',
                borderRadius: '50px',
                border: filter === 0 ? `2px solid ${accentColor}` : `2px solid ${borderColor}`,
                background: filter === 0 ? accentColor : 'transparent',
                color: filter === 0 ? 'white' : textColor,
                cursor: 'pointer',
                fontWeight: 600,
                fontSize: '0.85rem',
                fontFamily: "'Cairo', sans-serif",
              }}
            >
              {t.all}
            </button>
            {[5, 4, 3, 2, 1].map(s => (
              <button
                key={s}
                onClick={() => setFilter(s)}
                style={{
                  padding: '8px 16px',
                  borderRadius: '50px',
                  border: filter === s ? `2px solid ${starColor}` : `2px solid ${borderColor}`,
                  background: filter === s ? starColor : 'transparent',
                  color: filter === s ? 'white' : textColor,
                  cursor: 'pointer',
                  fontWeight: 600,
                  fontSize: '0.85rem',
                  fontFamily: "'Cairo', sans-serif",
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px',
                }}
              >
                {s} <Star size={12} fill={filter === s ? 'white' : starColor} color={filter === s ? 'white' : starColor} />
              </button>
            ))}
          </div>

          <div style={{
            display: 'flex',
            gap: '8px',
            alignItems: 'center',
          }}>
            <div style={{ position: 'relative' }}>
              <Search size={16} style={{
                position: 'absolute',
                left: lang === 'ar' ? 'auto' : '12px',
                right: lang === 'ar' ? '12px' : 'auto',
                top: '50%',
                transform: 'translateY(-50%)',
                color: textSecondary,
              }} />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={t.searchPlaceholder}
                style={{
                  padding: lang === 'ar' ? '8px 36px 8px 14px' : '8px 14px 8px 36px',
                  border: `1px solid ${borderColor}`,
                  borderRadius: '10px',
                  fontSize: '0.85rem',
                  outline: 'none',
                  background: cardBg,
                  color: textColor,
                  fontFamily: "'Cairo', sans-serif",
                  width: '180px',
                  transition: 'all 0.3s ease',
                  textAlign: lang === 'ar' ? 'right' : 'left',
                }}
                onFocus={(e) => { e.target.style.borderColor = accentColor; e.target.style.width = '220px'; }}
                onBlur={(e) => { e.target.style.borderColor = borderColor; if (!searchQuery) e.target.style.width = '180px'; }}
              />
            </div>

            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              style={{
                padding: '8px 14px',
                border: `1px solid ${borderColor}`,
                borderRadius: '10px',
                fontSize: '0.85rem',
                outline: 'none',
                background: cardBg,
                color: textColor,
                fontFamily: "'Cairo', sans-serif",
                cursor: 'pointer',
                textAlign: lang === 'ar' ? 'right' : 'left',
              }}
            >
              <option value="newest">{t.newest}</option>
              <option value="oldest">{t.oldest}</option>
              <option value="highest">{t.highest}</option>
              <option value="lowest">{t.lowest}</option>
            </select>
          </div>
        </div>

        {/* Reviews List */}
        {loading ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {[1, 2, 3].map(i => (
              <div key={i} className="skeleton" style={{ borderRadius: '14px', height: '100px' }} />
            ))}
          </div>
        ) : filtered.length > 0 ? (
          filtered.map((r, index) => (
            <div
              key={r.id}
              className="animate-fade-in-up hover-lift"
              style={{
                background: cardBg,
                borderRadius: '14px',
                padding: '20px',
                border: `1px solid ${borderColor}`,
                marginBottom: '12px',
                animationDelay: `${index * 0.05}s`,
              }}
            >
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'flex-start',
                marginBottom: '10px',
                flexWrap: 'wrap',
                gap: '10px',
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <div style={{
                    width: '40px',
                    height: '40px',
                    borderRadius: '50%',
                    background: darkMode ? '#334155' : '#eff6ff',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: accentColor,
                    fontWeight: 700,
                    fontSize: '1rem',
                  }}>
                    {(r.client_name || 'U')[0].toUpperCase()}
                  </div>
                  <div>
                    <strong style={{ fontSize: '0.9rem', color: textColor }}>
                      {r.client_name || (lang === 'ar' ? 'عميل' : 'User')}
                    </strong>
                    <div style={{ fontSize: '0.75rem', color: textSecondary, display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <Calendar size={12} />
                      {formatDate(r.created_at)}
                    </div>
                  </div>
                </div>

                <div style={{
                  display: 'flex',
                  gap: '2px',
                  background: darkMode ? 'rgba(245,158,11,0.1)' : '#fffbeb',
                  padding: '4px 10px',
                  borderRadius: '20px',
                }}>
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star
                      key={i}
                      size={14}
                      fill={i < (r.rating || 0) ? starColor : 'none'}
                      color={i < (r.rating || 0) ? starColor : '#cbd5e1'}
                    />
                  ))}
                </div>
              </div>

              {r.comment && (
                <p style={{
                  color: textSecondary,
                  fontSize: '0.85rem',
                  lineHeight: 1.8,
                  marginBottom: '10px',
                }}>
                  "{r.comment}"
                </p>
              )}

              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                flexWrap: 'wrap',
                gap: '8px',
              }}>
                <span style={{
                  fontSize: '0.75rem',
                  color: textSecondary,
                  background: darkMode ? 'rgba(255,255,255,0.03)' : '#f8fafc',
                  padding: '4px 10px',
                  borderRadius: '8px',
                }}>
                  🛠️ {r.profession || (lang === 'ar' ? 'خدمة منزلية' : 'Home Service')}
                </span>

                {r.craftsman_id && (
                  <button
                    onClick={() => navigate(`/craftsman/${r.craftsman_id}`)}
                    style={{
                      padding: '4px 12px',
                      borderRadius: '8px',
                      border: `1px solid ${accentColor}`,
                      background: darkMode ? 'rgba(59,130,246,0.1)' : '#eff6ff',
                      cursor: 'pointer',
                      color: accentColor,
                      fontSize: '0.75rem',
                      fontWeight: 600,
                      fontFamily: "'Cairo', sans-serif",
                      transition: 'all 0.3s ease',
                    }}
                    onMouseEnter={(e) => { e.target.style.background = accentColor; e.target.style.color = 'white'; }}
                    onMouseLeave={(e) => { e.target.style.background = darkMode ? 'rgba(59,130,246,0.1)' : '#eff6ff'; e.target.style.color = accentColor; }}
                  >
                    {t.viewProfile}
                  </button>
                )}

                <button
                  onClick={() => handleHelpful(r.id)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px',
                    padding: '4px 12px',
                    borderRadius: '8px',
                    border: `1px solid ${borderColor}`,
                    background: helpfulClicked.includes(r.id) ? (darkMode ? 'rgba(5,150,105,0.15)' : '#d1fae5') : 'transparent',
                    cursor: helpfulClicked.includes(r.id) ? 'default' : 'pointer',
                    color: helpfulClicked.includes(r.id) ? '#059669' : textSecondary,
                    fontSize: '0.75rem',
                    fontWeight: 600,
                    fontFamily: "'Cairo', sans-serif",
                    transition: 'all 0.3s ease',
                  }}
                >
                  <ThumbsUp size={14} />
                  {t.helpful}
                  {helpfulClicked.includes(r.id) && <CheckCircle size={14} />}
                </button>
              </div>
            </div>
          ))
        ) : (
          <div className="animate-fade-in" style={{
            textAlign: 'center',
            padding: '60px 20px',
            color: textSecondary,
            background: cardBg,
            borderRadius: '14px',
            border: `1px solid ${borderColor}`,
          }}>
            <MessageSquare size={48} style={{ opacity: 0.3, marginBottom: '16px' }} />
            <p style={{ fontSize: '1.1rem', fontWeight: 500 }}>
              {t.noReviews}
            </p>
          </div>
        )}

        {/* ✅ CTA Section - زر "ابدأ الآن" (يظهر فقط لغير المسجلين) */}
        {!isAuthenticated && (
          <div className="animate-fade-in-up delay-300" style={{
            marginTop: '40px',
            marginBottom: '10px',
            background: 'linear-gradient(135deg, #2563eb, #1d4ed8)',
            borderRadius: '20px',
            padding: '48px 40px',
            color: 'white',
            position: 'relative',
            overflow: 'hidden',
          }}>
            {/* Background decoration */}
            <div style={{
              position: 'absolute',
              top: '-50%',
              right: '-20%',
              width: '400px',
              height: '400px',
              borderRadius: '50%',
              background: 'rgba(255,255,255,0.05)',
            }} />
            <div style={{
              position: 'absolute',
              bottom: '-40%',
              left: '-10%',
              width: '300px',
              height: '300px',
              borderRadius: '50%',
              background: 'rgba(255,255,255,0.03)',
            }} />
            
            <div className="cta-section" style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: '24px',
              position: 'relative',
              zIndex: 1,
            }}>
              <div style={{ flex: 1 }}>
                <div style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '8px',
                  background: 'rgba(255,255,255,0.15)',
                  padding: '4px 16px',
                  borderRadius: '50px',
                  fontSize: '0.75rem',
                  fontWeight: 600,
                  marginBottom: '12px',
                }}>
                  <Sparkles size={14} />
                  {lang === 'ar' ? '⭐ منصة موثوقة' : '⭐ Trusted Platform'}
                </div>
                <h2 style={{
                  fontSize: '1.5rem',
                  fontWeight: 700,
                  marginBottom: '8px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px',
                }}>
                  {t.startNow}
                </h2>
                <p style={{
                  opacity: 0.85,
                  fontSize: '0.95rem',
                  lineHeight: 1.7,
                  maxWidth: '500px',
                }}>
                  {t.startNowDesc}
                </p>
              </div>
              
              <Link
                to="/select-role"
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '10px',
                  padding: '14px 32px',
                  borderRadius: '12px',
                  background: 'white',
                  color: '#2563eb',
                  textDecoration: 'none',
                  fontWeight: 700,
                  fontSize: '1rem',
                  fontFamily: "'Cairo', sans-serif",
                  boxShadow: '0 4px 20px rgba(0,0,0,0.2)',
                  transition: 'all 0.3s ease',
                  whiteSpace: 'nowrap',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'scale(1.05)';
                  e.currentTarget.style.boxShadow = '0 8px 30px rgba(0,0,0,0.3)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'scale(1)';
                  e.currentTarget.style.boxShadow = '0 4px 20px rgba(0,0,0,0.2)';
                }}
              >
                <Rocket size={20} />
                {t.joinNow}
                <ArrowRight size={18} />
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ReviewsListPage;