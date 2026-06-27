// src/pages/CustomerHomePage.jsx
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useTheme } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import VoiceSearch from '../components/Search/VoiceSearch';
import { 
  Search, Star, Clock, Sparkles, User, ChevronRight,
  FileText, Mic, Award, Users, CheckCircle, X, Loader,
  Calendar, MapPin, DollarSign, Bell, MessageSquare
} from 'lucide-react';

const CustomerHomePage = () => {
  const { user } = useAuth();
  const { darkMode } = useTheme();
  const navigate = useNavigate();
  const [lang, setLang] = useState('ar');
  const [searchTerm, setSearchTerm] = useState('');
  const [craftsmen, setCraftsmen] = useState([]);
  const [allCraftsmen, setAllCraftsmen] = useState([]);
  const [featuredCraftsmen, setFeaturedCraftsmen] = useState([]);
  const [crafts, setCrafts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showVoice, setShowVoice] = useState(false);
  const [activeCategory, setActiveCategory] = useState('all');
  
  // ✅ إحصائيات
  const [stats, setStats] = useState({ 
    total: 0, 
    avgRating: 0, 
    totalJobs: 0,
    totalReviews: 0 
  });
  
  // ✅ قسم الحجوزات (Bookings)
  const [recentBookings, setRecentBookings] = useState([]);
  const [bookingsLoading, setBookingsLoading] = useState(true);
  
  // ✅ قسم طلباتي (Service Posts)
  const [myPosts, setMyPosts] = useState([]);
  const [postsLoading, setPostsLoading] = useState(true);

  // ✅ Language
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
    if (isNaN(d.getTime())) return '';
    return d.toLocaleDateString(lang === 'ar' ? 'ar-EG' : 'en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      weekday: lang === 'ar' ? 'short' : undefined,
    });
  };

  const formatTime = (time) => {
    if (!time) return '';
    if (time.includes(':')) return time;
    return time;
  };

  // ✅ جلب البيانات من API
  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      // 1. جلب المهن
      const craftsData = await api.getCrafts();
      setCrafts(craftsData.crafts || []);
      
      // 2. جلب جميع الحرفيين
      const craftsmenData = await api.getCraftsmen({ per_page: 100 });
      const list = craftsmenData.craftsmen || [];
      setAllCraftsmen(list);
      setCraftsmen(list);
      
      // 3. جلب الحرفيين المميزين
      const featuredData = await api.getFeaturedCraftsmen();
      let featuredList = [];
      
      if (featuredData.craftsmen && featuredData.craftsmen.length > 0) {
        featuredList = featuredData.craftsmen;
      } else {
        // ✅ ترتيب حسب أعلى تقييم + عدد خدمات
        featuredList = [...list].sort((a, b) => {
          const scoreA = (a.rating || 0) * (a.completed_bookings || a.completed_jobs || 1);
          const scoreB = (b.rating || 0) * (b.completed_bookings || b.completed_jobs || 1);
          return scoreB - scoreA;
        });
      }
      setFeaturedCraftsmen(featuredList.slice(0, 8));
      
      // ✅ حساب الإحصائيات
      const totalCraftsmen = craftsmenData.meta?.total || list.length;
      const ratings = list.map(c => c.rating || 0);
      const totalRating = ratings.reduce((sum, r) => sum + r, 0);
      const avgRating = list.length > 0 ? (totalRating / list.length) : 0;
      const totalJobs = list.reduce((sum, c) => sum + (c.completed_bookings || c.completed_jobs || 0), 0);
      const totalReviews = list.reduce((sum, c) => sum + (c.reviews_count || c.reviews?.length || 0), 0);
      
      setStats({
        total: totalCraftsmen,
        avgRating: parseFloat(avgRating.toFixed(1)),
        totalJobs: totalJobs,
        totalReviews: totalReviews,
      });
      
      // ✅ 4. جلب حجوزات العميل
      await loadBookings();
      
      // ✅ 5. جلب طلباتي
      await loadMyPosts();
      
    } catch (error) {
      console.error('Error loading customer data:', error);
      // ✅ Fallback data
      const demos = [
        { id: 1, profession: 'سباك', first_name: 'محمد', last_name: 'السباك', rating: 4.8, hourly_rate: 150, city: 'القاهرة', district: 'مدينة نصر', completed_jobs: 320, reviews_count: 45, crafts: [{ id: 1, name: 'سباك' }] },
        { id: 2, profession: 'كهربائي', first_name: 'أحمد', last_name: 'الكهربائي', rating: 4.6, hourly_rate: 180, city: 'الجيزة', district: 'الدقي', completed_jobs: 280, reviews_count: 38, crafts: [{ id: 2, name: 'كهربائي' }] },
        { id: 3, profession: 'نجار', first_name: 'محمود', last_name: 'النجار', rating: 4.9, hourly_rate: 200, city: 'القاهرة', district: 'المعادي', completed_jobs: 450, reviews_count: 52, crafts: [{ id: 3, name: 'نجار' }] },
        { id: 4, profession: 'نقاش', first_name: 'كريم', last_name: 'الدهان', rating: 4.5, hourly_rate: 130, city: 'الإسكندرية', district: 'سموحة', completed_jobs: 190, reviews_count: 22, crafts: [{ id: 4, name: 'دهان' }] },
        { id: 5, profession: 'فني تكييف', first_name: 'حسن', last_name: 'التكييف', rating: 4.7, hourly_rate: 250, city: 'القاهرة', district: 'الزمالك', completed_jobs: 210, reviews_count: 30, crafts: [{ id: 5, name: 'تكييف' }] },
        { id: 6, profession: 'سباك', first_name: 'سامح', last_name: 'السباك', rating: 4.3, hourly_rate: 120, city: 'القاهرة', district: 'شبرا', completed_jobs: 150, reviews_count: 18, crafts: [{ id: 1, name: 'سباك' }] },
        { id: 7, profession: 'بناء', first_name: 'عماد', last_name: 'البناء', rating: 4.8, hourly_rate: 300, city: 'القاهرة', district: 'التجمع', completed_jobs: 380, reviews_count: 42, crafts: [{ id: 7, name: 'بناء' }] },
        { id: 8, profession: 'كهربائي', first_name: 'طارق', last_name: 'الفني', rating: 4.4, hourly_rate: 160, city: 'الجيزة', district: 'فيصل', completed_jobs: 200, reviews_count: 25, crafts: [{ id: 2, name: 'كهربائي' }] },
      ];
      
      const sortedDemos = [...demos].sort((a, b) => {
        const scoreA = (a.rating || 0) * (a.completed_jobs || 1);
        const scoreB = (b.rating || 0) * (b.completed_jobs || 1);
        return scoreB - scoreA;
      });
      
      setAllCraftsmen(demos);
      setCraftsmen(demos);
      setFeaturedCraftsmen(sortedDemos.slice(0, 8));
      
      const totalJobs = demos.reduce((s, c) => s + c.completed_jobs, 0);
      const totalReviews = demos.reduce((s, c) => s + (c.reviews_count || 0), 0);
      
      setStats({ 
        total: demos.length, 
        avgRating: parseFloat((demos.reduce((s, c) => s + c.rating, 0) / demos.length).toFixed(1)),
        totalJobs: totalJobs,
        totalReviews: totalReviews,
      });
    }
    
    setLoading(false);
  };

  // ✅ جلب حجوزات العميل
  const loadBookings = async () => {
    setBookingsLoading(true);
    try {
      const bookingsData = await api.getMyBookings('upcoming');
      setRecentBookings(bookingsData.bookings?.data?.slice(0, 3) || []);
    } catch (error) {
      console.warn('Could not load bookings:', error);
      setRecentBookings([]);
    } finally {
      setBookingsLoading(false);
    }
  };

  // ✅ جلب طلباتي
  const loadMyPosts = async () => {
    setPostsLoading(true);
    try {
      const postsData = await api.getMyPosts();
      setMyPosts(postsData.posts?.data?.slice(0, 3) || []);
    } catch (error) {
      console.warn('Could not load my posts:', error);
      setMyPosts([]);
    } finally {
      setPostsLoading(false);
    }
  };

  const handleSearch = () => {
    if (searchTerm.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchTerm.trim())}`);
    }
  };

  const handleVoiceResult = (text) => {
    setSearchTerm(text);
    setShowVoice(false);
    if (text.trim()) {
      navigate(`/search?q=${encodeURIComponent(text.trim())}`);
    }
  };

  // ✅ فئات من API + خيار "الكل"
  const categories = [
    { id: 'all', name: lang === 'ar' ? 'الكل' : 'All', icon: '🏠' },
    ...crafts.map(craft => ({
      id: craft.id || craft.name,
      name: lang === 'ar' ? craft.name : (craft.name_en || craft.name),
      icon: craft.icon || '🔧',
    }))
  ];

  // ============================================================
  // ✅ ✅ ✅ الدالة الأساسية: فلترة الحرفيين حسب التخصص
  // ============================================================
  const getCraftsmenByCategory = useCallback((categoryId) => {
    // ✅ إذا كان الكل، نرجع الحرفيين المميزين
    if (categoryId === 'all') {
      return featuredCraftsmen;
    }

    // ✅ البحث عن التخصص المطلوب
    const selectedCraft = crafts.find(c => 
      c.id === parseInt(categoryId) || 
      c.id === categoryId || 
      c.name === categoryId
    );

    if (!selectedCraft) {
      console.warn('⚠️ Craft not found:', categoryId);
      return [];
    }

    console.log('🔍 Filtering by craft:', selectedCraft.name);

    // ✅ فلترة الحرفيين الذين لديهم هذا التخصص
    const filtered = featuredCraftsmen.filter(c => {
      // 1. التحقق من profession
      if (c.profession && c.profession.toLowerCase() === selectedCraft.name.toLowerCase()) {
        return true;
      }
      
      // 2. التحقق من crafts (مصفوفة)
      if (c.crafts && Array.isArray(c.crafts)) {
        return c.crafts.some(craft => 
          craft.name === selectedCraft.name || 
          craft.name_en === selectedCraft.name ||
          craft.id === selectedCraft.id
        );
      }
      
      // 3. التحقق من craft (مفرد)
      if (c.craft && (c.craft.name === selectedCraft.name || c.craft.name_en === selectedCraft.name)) {
        return true;
      }
      
      return false;
    });

    console.log(`✅ Found ${filtered.length} craftsmen for ${selectedCraft.name}`);
    return filtered;
  }, [featuredCraftsmen, crafts]);

  // ✅ الحرفيين المفلترين حسب التخصص المختار
  const filteredCraftsmen = useMemo(() => {
    return getCraftsmenByCategory(activeCategory);
  }, [activeCategory, getCraftsmenByCategory]);

  // ✅ ترتيب الحرفيين حسب أعلى تقييم
  const sortedCraftsmen = useMemo(() => {
    return [...filteredCraftsmen].sort((a, b) => (b.rating || 0) - (a.rating || 0));
  }, [filteredCraftsmen]);

  // ✅ التخصص المختار لعرض اسمه
  const selectedCategoryName = useMemo(() => {
    if (activeCategory === 'all') return '';
    const cat = categories.find(c => c.id === activeCategory);
    return cat?.name || '';
  }, [activeCategory, categories]);

  // ✅ تنسيق حالة الحجز
  const getStatusColor = (status) => {
    const colors = {
      pending: '#fef3c7',
      confirmed: '#dbeafe',
      in_progress: '#f3e8ff',
      completed: '#d1fae5',
      cancelled: '#fee2e2',
      rejected: '#fee2e2',
    };
    return colors[status] || colors.pending;
  };

  const getStatusTextColor = (status) => {
    const colors = {
      pending: '#d97706',
      confirmed: '#2563eb',
      in_progress: '#7c3aed',
      completed: '#059669',
      cancelled: '#dc2626',
      rejected: '#dc2626',
    };
    return colors[status] || colors.pending;
  };

  const getStatusText = (status) => {
    const map = {
      pending: lang === 'ar' ? 'قيد الانتظار' : 'Pending',
      confirmed: lang === 'ar' ? 'مؤكد' : 'Confirmed',
      in_progress: lang === 'ar' ? 'قيد التنفيذ' : 'In Progress',
      completed: lang === 'ar' ? 'مكتمل' : 'Completed',
      cancelled: lang === 'ar' ? 'ملغي' : 'Cancelled',
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
      open: '#dbeafe',
      closed: '#d1fae5',
    };
    return colors[status] || colors.open;
  };

  const getPostStatusTextColor = (status) => {
    const colors = {
      open: '#2563eb',
      closed: '#059669',
    };
    return colors[status] || colors.open;
  };

  // Translations
  const t = {
    welcome: lang === 'ar' ? 'مرحباً' : 'Welcome',
    howCanWeHelp: lang === 'ar' ? 'كيف نقدر نساعدك النهاردة؟' : 'How can we help you today?',
    search: lang === 'ar' ? 'ابحث عن حرفي...' : 'Search for a craftsman...',
    searchButton: lang === 'ar' ? 'بحث' : 'Search',
    voiceSearch: lang === 'ar' ? 'بحث صوتي' : 'Voice Search',
    sendRequest: lang === 'ar' ? 'اطلب خدمة' : 'Request Service',
    browseCraftsmen: lang === 'ar' ? 'تصفح الحرفيين' : 'Browse Craftsmen',
    featuredCraftsmen: lang === 'ar' ? 'حرفيون مميزون' : 'Featured Craftsmen',
    noResults: lang === 'ar' ? 'لا يوجد حرفيين' : 'No craftsmen found',
    loading: lang === 'ar' ? 'جاري التحميل...' : 'Loading...',
    recentBookings: lang === 'ar' ? 'حجوزاتك الأخيرة' : 'Your Recent Bookings',
    myRequests: lang === 'ar' ? 'طلباتي' : 'My Requests',
    viewAll: lang === 'ar' ? 'عرض الكل' : 'View All',
    egp: lang === 'ar' ? 'ج.م' : 'EGP',
    pending: lang === 'ar' ? 'قيد الانتظار' : 'Pending',
    completed: lang === 'ar' ? 'مكتمل' : 'Completed',
    specialties: lang === 'ar' ? 'التخصصات' : 'Specialties',
    noBookings: lang === 'ar' ? 'لا توجد حجوزات' : 'No bookings',
    noPosts: lang === 'ar' ? 'لا توجد طلبات' : 'No requests',
    viewAllBookings: lang === 'ar' ? 'عرض كل الحجوزات' : 'View All Bookings',
    viewAllRequests: lang === 'ar' ? 'عرض كل الطلبات' : 'View All Requests',
    status: lang === 'ar' ? 'الحالة' : 'Status',
    budget: lang === 'ar' ? 'الميزانية' : 'Budget',
    pricePerHour: lang === 'ar' ? 'للساعة' : '/hour',
    totalCraftsmen: lang === 'ar' ? 'إجمالي الحرفيين' : 'Total Craftsmen',
    totalServices: lang === 'ar' ? 'الخدمات المنفذة' : 'Total Services',
    averageRating: lang === 'ar' ? 'متوسط التقييمات' : 'Average Rating',
    totalReviews: lang === 'ar' ? 'إجمالي التقييمات' : 'Total Reviews',
    noCraftsmenInCategory: lang === 'ar' ? 'لا يوجد حرفيين في هذا التخصص' : 'No craftsmen in this category',
    craftsmenInCategory: (name, count) => lang === 'ar' 
      ? `الحرفيون المميزون في تخصص ${name} (${count})` 
      : `Featured craftsmen in ${name} (${count})`,
  };

  // Dynamic colors
  const bgColor = darkMode ? '#0f172a' : '#f8fafc';
  const cardBg = darkMode ? '#1e293b' : '#ffffff';
  const textColor = darkMode ? '#f1f5f9' : '#0f172a';
  const textSecondary = darkMode ? '#94a3b8' : '#64748b';
  const borderColor = darkMode ? '#334155' : '#e2e8f0';

  return (
    <div style={{ background: bgColor, minHeight: '100vh', fontFamily: "'Cairo', sans-serif", direction: lang === 'ar' ? 'rtl' : 'ltr' }}>
      <style>{`
        @keyframes fadeInUp { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes shimmer { 0% { background-position: -200% 0; } 100% { background-position: 200% 0; } }
        .animate-fade-in-up { animation: fadeInUp 0.5s ease forwards; }
        .delay-100 { animation-delay: 0.1s; } .delay-200 { animation-delay: 0.2s; } .delay-300 { animation-delay: 0.3s; }
        .hover-lift { transition: all 0.3s ease; }
        .hover-lift:hover { transform: translateY(-6px); box-shadow: 0 16px 40px rgba(0,0,0,0.12); }
        .skeleton { background: linear-gradient(90deg, ${darkMode ? '#334155' : '#e2e8f0'} 25%, ${darkMode ? '#1e293b' : '#f1f5f9'} 50%, ${darkMode ? '#334155' : '#e2e8f0'} 75%); background-size: 200% 100%; animation: shimmer 1.5s infinite; }
        @media (max-width: 768px) { .stats-grid { grid-template-columns: repeat(2, 1fr) !important; } }
      `}</style>

      {/* Hero Section */}
      <div style={{
        background: darkMode ? 'linear-gradient(160deg, #1e3a8a, #1e40af)' : 'linear-gradient(160deg, #2563eb, #1d4ed8)',
        color: 'white', padding: '48px 0', position: 'relative', overflow: 'hidden',
      }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 24px', position: 'relative', zIndex: 1 }}>
          <div className="animate-fade-in-up" style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '20px' }}>
            <div style={{ width: '56px', height: '56px', borderRadius: '16px', background: 'rgba(255,255,255,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.5rem', fontWeight: 700 }}>
              {user?.name?.[0] || 'ع'}
            </div>
            <div>
              <h1 style={{ fontSize: '1.75rem', fontWeight: 700, margin: 0 }}>{t.welcome}، {user?.name?.split(' ')[0]}</h1>
              <p style={{ fontSize: '1rem', opacity: 0.9, margin: '4px 0 0' }}>{t.howCanWeHelp}</p>
            </div>
          </div>

          {/* Search Bar */}
          <div className="animate-fade-in-up delay-100" style={{ display: 'flex', gap: '10px', maxWidth: '700px' }}>
            <div style={{ flex: 1, display: 'flex', alignItems: 'center', background: 'white', borderRadius: '16px', padding: '4px', boxShadow: '0 8px 30px rgba(0,0,0,0.2)' }}>
              <Search size={20} style={{ color: '#94a3b8', margin: lang === 'ar' ? '0 10px 0 0' : '0 0 0 10px' }} />
              <input 
                type="text" 
                value={searchTerm} 
                onChange={(e) => setSearchTerm(e.target.value)} 
                onKeyPress={(e) => e.key === 'Enter' && handleSearch()} 
                placeholder={t.search}
                style={{ 
                  flex: 1, padding: '14px 8px', border: 'none', fontSize: '0.95rem', 
                  outline: 'none', color: '#0f172a', fontFamily: "'Cairo', sans-serif", 
                  textAlign: lang === 'ar' ? 'right' : 'left', background: 'transparent' 
                }} 
              />
              {searchTerm && <button onClick={() => setSearchTerm('')} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '8px', color: '#94a3b8' }}><X size={18} /></button>}
              <button onClick={() => setShowVoice(true)} style={{ padding: '10px', borderRadius: '12px', border: 'none', cursor: 'pointer', background: '#eff6ff', color: '#3b82f6', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '2px' }}>
                <Mic size={18} />
              </button>
            </div>
            <button onClick={handleSearch} style={{ padding: '14px 24px', borderRadius: '14px', border: 'none', cursor: 'pointer', background: '#f59e0b', color: 'white', fontWeight: 700, fontSize: '0.95rem', fontFamily: "'Cairo', sans-serif", whiteSpace: 'nowrap', boxShadow: '0 4px 16px rgba(245,158,11,0.3)' }}>
              {t.searchButton}
            </button>
          </div>

          {/* Quick Actions */}
          <div className="animate-fade-in-up delay-200" style={{ display: 'flex', gap: '12px', marginTop: '24px', flexWrap: 'wrap' }}>
            <Link to="/request-service" style={{ padding: '12px 24px', borderRadius: '12px', fontWeight: 600, background: 'white', color: '#2563eb', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '8px', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}>
              <FileText size={18} />{t.sendRequest}
            </Link>
            <Link to="/search" style={{ padding: '12px 24px', borderRadius: '12px', fontWeight: 600, background: 'rgba(255,255,255,0.2)', color: 'white', border: '2px solid rgba(255,255,255,0.3)', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Search size={18} />{t.browseCraftsmen}
            </Link>
          </div>
        </div>
      </div>

      {/* Stats Mini Cards */}
      <div className="animate-fade-in-up delay-300" style={{ maxWidth: '1200px', margin: '-24px auto 0', padding: '0 24px', position: 'relative', zIndex: 2 }}>
        <div className="stats-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '12px' }}>
          {[
            { value: stats.total || 0, label: t.totalCraftsmen, icon: <Users size={20} />, color: '#3b82f6' },
            { value: stats.avgRating || 0, label: t.averageRating, icon: <Star size={20} />, color: '#f59e0b', isRating: true },
            { value: stats.totalReviews || 0, label: t.totalReviews, icon: <MessageSquare size={20} />, color: '#8b5cf6' },
            { value: stats.totalJobs || 0, label: t.totalServices, icon: <CheckCircle size={20} />, color: '#059669' },
          ].map((stat, i) => (
            <div key={i} className="hover-lift" style={{ background: cardBg, borderRadius: '14px', padding: '16px', border: `1px solid ${borderColor}`, textAlign: 'center' }}>
              <div style={{ color: stat.color, marginBottom: '6px', display: 'flex', justifyContent: 'center' }}>{stat.icon}</div>
              <div style={{ fontSize: '1.3rem', fontWeight: 800, color: textColor }}>
                {stat.isRating ? (
                  <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px' }}>
                    {typeof stat.value === 'number' ? stat.value.toFixed(1) : stat.value}
                    <Star size={14} fill="#f59e0b" color="#f59e0b" />
                  </span>
                ) : (
                  typeof stat.value === 'number' ? stat.value.toLocaleString() : stat.value
                )}
              </div>
              <div style={{ fontSize: '0.75rem', color: textSecondary }}>{stat.label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Main Content */}
      <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '32px 24px' }}>
        
        {/* ============================================================
             ✅ قسم حجوزاتي (Bookings)
             ============================================================ */}
        <div className="animate-fade-in-up" style={{ marginBottom: '32px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <h2 style={{ fontSize: '1.2rem', fontWeight: 700, color: textColor, display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Calendar size={20} style={{ color: '#3b82f6' }} />
              {t.recentBookings}
            </h2>
            <Link to="/my-bookings" style={{ color: '#3b82f6', fontSize: '0.85rem', fontWeight: 600, textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '4px' }}>
              {t.viewAllBookings} <ChevronRight size={16} />
            </Link>
          </div>

          {bookingsLoading ? (
            <div style={{ display: 'flex', gap: '12px', overflowX: 'auto' }}>
              {[1, 2, 3].map(i => <div key={i} className="skeleton" style={{ borderRadius: '14px', minWidth: '250px', height: '80px', flexShrink: 0 }} />)}
            </div>
          ) : recentBookings.length > 0 ? (
            <div style={{ display: 'flex', gap: '12px', overflowX: 'auto', paddingBottom: '4px' }}>
              {recentBookings.map((booking, i) => (
                <div key={i} className="hover-lift" style={{ background: cardBg, borderRadius: '14px', padding: '16px', border: `1px solid ${borderColor}`, minWidth: '250px', flexShrink: 0, cursor: 'pointer' }} onClick={() => navigate(`/booking-details/${booking.id}`)}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                    <span style={{ fontWeight: 600, color: textColor, fontSize: '0.9rem' }}>
                      {booking.craftsman?.first_name} {booking.craftsman?.last_name || booking.service_title || 'خدمة'}
                    </span>
                    <span style={{ padding: '2px 10px', borderRadius: '12px', fontSize: '0.7rem', fontWeight: 600, background: getStatusColor(booking.status), color: getStatusTextColor(booking.status) }}>
                      {getStatusText(booking.status)}
                    </span>
                  </div>
                  <div style={{ fontSize: '0.8rem', color: textSecondary }}>
                    {booking.total_price && <span>{booking.total_price} {t.egp}</span>}
                    {booking.booking_date && <span> • {formatDate(booking.booking_date)}</span>}
                    {booking.booking_time && <span> • {formatTime(booking.booking_time)}</span>}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div style={{ background: cardBg, borderRadius: '14px', padding: '24px', textAlign: 'center', border: `1px solid ${borderColor}` }}>
              <Calendar size={32} style={{ opacity: 0.3, margin: '0 auto 8px', display: 'block', color: textSecondary }} />
              <p style={{ color: textSecondary, fontSize: '0.9rem' }}>{t.noBookings}</p>
              <Link to="/search" style={{ display: 'inline-block', marginTop: '8px', color: '#3b82f6', fontSize: '0.85rem', fontWeight: 600, textDecoration: 'none' }}>{t.browseCraftsmen}</Link>
            </div>
          )}
        </div>

        {/* ============================================================
             ✅ قسم طلباتي (Service Posts)
             ============================================================ */}
        <div className="animate-fade-in-up delay-100" style={{ marginBottom: '32px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <h2 style={{ fontSize: '1.2rem', fontWeight: 700, color: textColor, display: 'flex', alignItems: 'center', gap: '8px' }}>
              <FileText size={20} style={{ color: '#8b5cf6' }} />
              {t.myRequests}
            </h2>
            <Link to="/my-requests" style={{ color: '#8b5cf6', fontSize: '0.85rem', fontWeight: 600, textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '4px' }}>
              {t.viewAllRequests} <ChevronRight size={16} />
            </Link>
          </div>

          {postsLoading ? (
            <div style={{ display: 'flex', gap: '12px', overflowX: 'auto' }}>
              {[1, 2, 3].map(i => <div key={i} className="skeleton" style={{ borderRadius: '14px', minWidth: '250px', height: '80px', flexShrink: 0 }} />)}
            </div>
          ) : myPosts.length > 0 ? (
            <div style={{ display: 'flex', gap: '12px', overflowX: 'auto', paddingBottom: '4px' }}>
              {myPosts.map((post, i) => (
                <div key={i} className="hover-lift" style={{ background: cardBg, borderRadius: '14px', padding: '16px', border: `1px solid ${borderColor}`, minWidth: '250px', flexShrink: 0, cursor: 'pointer' }} onClick={() => navigate(`/service-post/${post.id}`)}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                    <span style={{ fontWeight: 600, color: textColor, fontSize: '0.9rem' }}>{post.title || 'طلب خدمة'}</span>
                    <span style={{ padding: '2px 10px', borderRadius: '12px', fontSize: '0.7rem', fontWeight: 600, background: getPostStatusColor(post.status), color: getPostStatusTextColor(post.status) }}>
                      {getPostStatusText(post.status)}
                    </span>
                  </div>
                  <div style={{ fontSize: '0.8rem', color: textSecondary }}>
                    {post.budget_from && post.budget_to ? <span>{post.budget_from} - {post.budget_to} {t.egp}</span> : post.budget_from && <span>{post.budget_from} {t.egp}</span>}
                    {post.city && <span> • {post.city}</span>}
                    {post.responses_count !== undefined && <span> • {post.responses_count} {lang === 'ar' ? 'ردود' : 'responses'}</span>}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div style={{ background: cardBg, borderRadius: '14px', padding: '24px', textAlign: 'center', border: `1px solid ${borderColor}` }}>
              <FileText size={32} style={{ opacity: 0.3, margin: '0 auto 8px', display: 'block', color: textSecondary }} />
              <p style={{ color: textSecondary, fontSize: '0.9rem' }}>{t.noPosts}</p>
              <Link to="/request-service" style={{ display: 'inline-block', marginTop: '8px', color: '#8b5cf6', fontSize: '0.85rem', fontWeight: 600, textDecoration: 'none' }}>{t.sendRequest}</Link>
            </div>
          )}
        </div>

        {/* ============================================================
             ✅ التخصصات (Categories)
             ============================================================ */}
        <div className="animate-fade-in-up" style={{ marginBottom: '28px' }}>
          <h2 style={{ fontSize: '1.2rem', fontWeight: 700, color: textColor, marginBottom: '16px' }}>{t.specialties}</h2>
          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
            {categories.map(cat => (
              <button 
                key={cat.id} 
                onClick={() => setActiveCategory(cat.id)} 
                style={{ 
                  padding: '10px 18px', borderRadius: '50px', 
                  border: activeCategory === cat.id ? '2px solid #3b82f6' : `2px solid ${borderColor}`, 
                  background: activeCategory === cat.id ? (darkMode ? 'rgba(59,130,246,0.15)' : '#eff6ff') : 'transparent', 
                  cursor: 'pointer', fontWeight: 600, fontSize: '0.85rem', 
                  color: activeCategory === cat.id ? '#3b82f6' : textColor, 
                  fontFamily: "'Cairo', sans-serif" 
                }}
              >
                {cat.icon} {cat.name}
              </button>
            ))}
          </div>
        </div>

        {/* ============================================================
             ✅ ✅ ✅ عرض الحرفيين حسب التخصص المختار
             ============================================================ */}
        <div className="animate-fade-in-up delay-100">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <h2 style={{ fontSize: '1.2rem', fontWeight: 700, color: textColor, display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Award size={20} style={{ color: '#f59e0b' }} />
              {activeCategory === 'all' 
                ? t.featuredCraftsmen 
                : t.craftsmenInCategory(selectedCategoryName, sortedCraftsmen.length)
              }
            </h2>
            {activeCategory !== 'all' && (
              <button
                onClick={() => setActiveCategory('all')}
                style={{
                  fontSize: '0.8rem',
                  color: '#3b82f6',
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  fontWeight: 600,
                  fontFamily: "'Cairo', sans-serif",
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px',
                }}
              >
                {t.viewAll} <ChevronRight size={14} />
              </button>
            )}
          </div>

          {loading ? (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: '16px' }}>
              {[1, 2, 3, 4].map(i => <div key={i} className="skeleton" style={{ borderRadius: '16px', height: '240px' }} />)}
            </div>
          ) : sortedCraftsmen.length > 0 ? (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: '16px' }}>
              {sortedCraftsmen.slice(0, 8).map((c, index) => {
                const price = c.hourly_rate || c.price || 0;
                const completedJobs = c.completed_bookings || c.completed_jobs || 0;
                const reviewsCount = c.reviews_count || c.reviews?.length || 0;
                
                return (
                  <div 
                    key={c.id} 
                    className="hover-lift animate-fade-in-up" 
                    style={{ 
                      background: cardBg, borderRadius: '16px', overflow: 'hidden', 
                      border: `1px solid ${borderColor}`, cursor: 'pointer', 
                      animationDelay: `${index * 0.06}s` 
                    }} 
                    onClick={() => navigate(`/craftsman/${c.id}`)}
                  >
                    <div style={{ height: '100px', background: 'linear-gradient(135deg, #2563eb, #1d4ed8)', display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative' }}>
                      <div style={{ width: '56px', height: '56px', borderRadius: '50%', background: 'rgba(255,255,255,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.5rem', fontWeight: 700, color: 'white', border: '3px solid rgba(255,255,255,0.4)' }}>
                        {c.first_name?.charAt(0) || c.name?.charAt(0) || c.profession?.charAt(0) || 'ح'}
                      </div>
                      <div style={{ 
                        position: 'absolute', 
                        top: '10px', 
                        right: lang === 'ar' ? '10px' : 'auto',
                        left: lang === 'ar' ? 'auto' : '10px',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '4px',
                      }}>
                        {c.rating > 0 && (
                          <span style={{ 
                            background: 'rgba(0,0,0,0.5)', 
                            backdropFilter: 'blur(10px)',
                            padding: '2px 10px', 
                            borderRadius: '12px', 
                            fontSize: '0.7rem', 
                            fontWeight: 600, 
                            color: '#fbbf24', 
                            display: 'flex', 
                            alignItems: 'center', 
                            gap: '4px' 
                          }}>
                            <Star size={12} fill="#fbbf24" color="#fbbf24" />
                            {c.rating}
                          </span>
                        )}
                        {completedJobs > 0 && (
                          <span style={{ 
                            background: 'rgba(0,0,0,0.5)', 
                            backdropFilter: 'blur(10px)',
                            padding: '2px 10px', 
                            borderRadius: '12px', 
                            fontSize: '0.65rem', 
                            fontWeight: 600, 
                            color: '#34d399',
                            display: 'flex', 
                            alignItems: 'center', 
                            gap: '4px' 
                          }}>
                            <CheckCircle size={10} />
                            {completedJobs} {lang === 'ar' ? 'خدمة' : 'jobs'}
                          </span>
                        )}
                      </div>
                    </div>
                    <div style={{ padding: '16px' }}>
                      <h3 style={{ fontWeight: 700, color: textColor, fontSize: '1rem', marginBottom: '4px' }}>
                        {c.first_name} {c.last_name || ''}
                      </h3>
                      <p style={{ fontSize: '0.85rem', color: '#3b82f6', fontWeight: 500, marginBottom: '8px' }}>
                        {c.crafts?.map(craft => lang === 'ar' ? craft.name : (craft.name_en || craft.name)).join(' | ') || c.profession}
                      </p>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div>
                          <span style={{ fontSize: '0.9rem', fontWeight: 700, color: '#059669' }}>
                            {price} {t.egp}
                          </span>
                          <span style={{ fontSize: '0.65rem', color: textSecondary, marginLeft: '4px' }}>
                            {t.pricePerHour}
                          </span>
                        </div>
                        <span style={{ fontSize: '0.75rem', color: textSecondary }}>{c.city || ''}</span>
                      </div>
                      {reviewsCount > 0 && (
                        <div style={{ marginTop: '8px', fontSize: '0.7rem', color: textSecondary, display: 'flex', alignItems: 'center', gap: '4px' }}>
                          <MessageSquare size={12} />
                          {reviewsCount} {lang === 'ar' ? 'تقييم' : 'reviews'}
                        </div>
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
              color: textSecondary,
              background: cardBg,
              borderRadius: '16px',
              border: `1px solid ${borderColor}`,
            }}>
              <Search size={48} style={{ opacity: 0.3, marginBottom: '12px' }} />
              <p style={{ fontSize: '1rem', fontWeight: 500 }}>
                {activeCategory === 'all' 
                  ? t.noResults 
                  : t.noCraftsmenInCategory
                }
              </p>
              {activeCategory !== 'all' && (
                <button
                  onClick={() => setActiveCategory('all')}
                  style={{
                    marginTop: '12px',
                    padding: '8px 20px',
                    borderRadius: '8px',
                    border: 'none',
                    background: '#3b82f6',
                    color: 'white',
                    cursor: 'pointer',
                    fontWeight: 600,
                    fontSize: '0.85rem',
                    fontFamily: "'Cairo', sans-serif",
                  }}
                >
                  {t.viewAll}
                </button>
              )}
            </div>
          )}
        </div>
      </div>

      {showVoice && <VoiceSearch lang={lang} onResult={handleVoiceResult} onClose={() => setShowVoice(false)} />}
    </div>
  );
};

export default CustomerHomePage;