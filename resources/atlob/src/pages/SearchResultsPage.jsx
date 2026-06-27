// src/pages/SearchResultsPage.jsx
import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useSearchParams, Link, useNavigate } from 'react-router-dom';
import { useTheme } from '../context/ThemeContext';
import api from '../services/api';
import VoiceSearch from '../components/Search/VoiceSearch';
import CraftsmanMap from '../components/Map/CraftsmanMap';
import { getCityCoordinates, calculateDistance } from '../utils/location';
import { 
  Search, MapPin, Star, Filter, Grid, Map,
  Mic, X, RotateCw,
  AlertCircle, Users, Route, Navigation, Wrench
} from 'lucide-react';

// ============================================================
// ✅ Custom Hook: Debounced Search
// ============================================================
const useDebounce = (value, delay = 500) => {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => clearTimeout(handler);
  }, [value, delay]);

  return debouncedValue;
};

const SearchResultsPage = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { darkMode } = useTheme();
  const [lang, setLang] = useState('ar');

  // ============================================================
  // State
  // ============================================================
  const [query, setQuery] = useState(searchParams.get('q') || '');
  const [filterLocation, setFilterLocation] = useState(searchParams.get('city') || '');
  const [filterRating, setFilterRating] = useState(searchParams.get('rating') || '');
  const [filterJob, setFilterJob] = useState(searchParams.get('craft') || '');
  const [sortBy, setSortBy] = useState(searchParams.get('sort') || 'rating');
  const [currentPage, setCurrentPage] = useState(parseInt(searchParams.get('page')) || 1);
  const [totalPages, setTotalPages] = useState(1);
  
  const [craftsmen, setCraftsmen] = useState([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState('grid');
  const [showVoice, setShowVoice] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [meta, setMeta] = useState({});
  const [userLocation, setUserLocation] = useState(null);
  const [selectedCraftsman, setSelectedCraftsman] = useState(null);
  const [error, setError] = useState(null);
  const [locationPermission, setLocationPermission] = useState('loading');
  const [availableCrafts, setAvailableCrafts] = useState([]);

  // ✅ Debounced query للبحث التلقائي
  const debouncedQuery = useDebounce(query, 500);

  // ============================================================
  // Language
  // ============================================================
  useEffect(() => {
    const savedLang = localStorage.getItem('language') || 'ar';
    setLang(savedLang);
    const handleLanguageChange = () => setLang(localStorage.getItem('language') || 'ar');
    window.addEventListener('languagechange', handleLanguageChange);
    return () => window.removeEventListener('languagechange', handleLanguageChange);
  }, []);

  // ============================================================
  // Get User Location
  // ============================================================
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setUserLocation({
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
          });
          setLocationPermission('granted');
        },
        (error) => {
          console.warn('Location permission denied:', error);
          setLocationPermission('denied');
          setUserLocation({
            latitude: 30.0444,
            longitude: 31.2357,
          });
        }
      );
    } else {
      setUserLocation({
        latitude: 30.0444,
        longitude: 31.2357,
      });
      setLocationPermission('unsupported');
    }
  }, []);

  // ============================================================
  // Load Available Crafts
  // ============================================================
  useEffect(() => {
    const loadCrafts = async () => {
      try {
        const data = await api.getCrafts();
        const crafts = data.crafts || data || [];
        setAvailableCrafts(crafts);
      } catch (error) {
        console.warn('Could not load crafts:', error);
        setAvailableCrafts([
          { id: 1, name: 'نجار', icon: '🔨' },
          { id: 2, name: 'سباك', icon: '🔧' },
          { id: 3, name: 'كهربائي', icon: '⚡' },
          { id: 4, name: 'نقاش', icon: '🎨' },
          { id: 5, name: 'بناء', icon: '🏗️' },
          { id: 6, name: 'فني تكييف', icon: '❄️' },
        ]);
      }
    };
    loadCrafts();
  }, []);

  // ============================================================
  // ✅ تحميل الحرفيين
  // ============================================================
  const loadCraftsmen = useCallback(async (searchQuery = query, page = currentPage) => {
    setLoading(true);
    setRefreshing(false);
    setError(null);
    
    try {
      const params = {
        search: searchQuery?.trim() || undefined,
        city: filterLocation?.trim() || undefined,
        craft_id: filterJob || undefined,
        sort_by: sortBy || undefined,
        lat: userLocation?.latitude,
        lng: userLocation?.longitude,
        radius: 100,
        per_page: 12,
        page: page,
        rating: filterRating || undefined,
      };

      Object.keys(params).forEach(key => {
        if (params[key] === undefined || params[key] === '' || params[key] === null) {
          delete params[key];
        }
      });

      console.log('🔵 [SearchResultsPage] Loading craftsmen with params:', params);

      // ✅ استدعاء API مباشرة (بدون { params })
      const data = await api.getCraftsmen(params);
      
      console.log('✅ [SearchResultsPage] API Response:', data);
      
      if (!data || !data.craftsmen) {
        throw new Error('No data received from API');
      }
      
      const formattedCraftsmen = data.craftsmen.map(c => {
        let lat = c.latitude || c.lat || null;
        let lng = c.longitude || c.lng || null;
        
        if (!lat || !lng) {
          const coords = getCityCoordinates(c.city || filterLocation || 'القاهرة');
          lat = coords.lat;
          lng = coords.lng;
        }
        
        return {
          ...c,
          id: c.id || parseInt(c._id) || Date.now() + Math.random(),
          name: c.name || `${c.first_name || ''} ${c.last_name || ''}`.trim() || c.profession || 'حرفي',
          latitude: parseFloat(lat),
          longitude: parseFloat(lng),
          rating: parseFloat(c.rating || c.average_rating || 0),
          hourly_rate: parseFloat(c.hourly_rate || c.price || c.rate || 0),
          completedJobs: parseInt(c.completed_jobs || c.jobs_count || c.completed_bookings || 0),
          yearsExperience: parseInt(c.years_exp || c.experience_years || c.yearsExperience || 0),
          phone: c.phone || c.phone_number || c.mobile || '',
          bio: c.bio || c.description || '',
          skills: c.skills || c.skill_names || [],
          profession: c.profession || c.craft?.name || '',
          city: c.city || filterLocation || 'القاهرة',
          district: c.district || '',
          distance: c.distance || (userLocation ? calculateDistance(
            userLocation.latitude,
            userLocation.longitude,
            lat,
            lng
          ) : null),
          portfolio: c.portfolio || c.portfolio_images || [],
          reviews: c.reviews || [],
          isFavorite: c.isFavorite || false,
        };
      });
      
      setCraftsmen(formattedCraftsmen);
      setMeta(data.meta || { total: formattedCraftsmen.length });
      setTotalPages(data.meta?.last_page || 1);
      setCurrentPage(page);
      
      if (formattedCraftsmen.length > 0) {
        setSelectedCraftsman(formattedCraftsmen[0]);
      } else {
        setSelectedCraftsman(null);
      }
      
    } catch (error) {
      console.error('❌ Error loading craftsmen:', error);
      setError(error.message || 'حدث خطأ في تحميل البيانات');
      setCraftsmen([]);
      setMeta({ total: 0 });
      setSelectedCraftsman(null);
    }
    
    setLoading(false);
    setRefreshing(false);
  }, [query, filterLocation, filterJob, filterRating, sortBy, userLocation]);

  // ✅ تحميل تلقائي عند تغيير الـ debouncedQuery
  useEffect(() => {
    if (debouncedQuery !== query) {
      loadCraftsmen(debouncedQuery, 1);
    }
  }, [debouncedQuery]);

  // ============================================================
  // التحميل الأولي (مرة واحدة فقط)
  // ============================================================
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const initialQuery = params.get('q') || '';
    const initialCity = params.get('city') || '';
    const initialCraft = params.get('craft') || '';
    const initialRating = params.get('rating') || '';
    const initialSort = params.get('sort') || 'rating';
    const initialPage = parseInt(params.get('page')) || 1;
    
    setQuery(initialQuery);
    setFilterLocation(initialCity);
    setFilterJob(initialCraft);
    setFilterRating(initialRating);
    setSortBy(initialSort);
    setCurrentPage(initialPage);
    
    const loadInitial = async () => {
      setLoading(true);
      try {
        const params = {
          search: initialQuery || undefined,
          city: initialCity || undefined,
          craft_id: initialCraft || undefined,
          sort_by: initialSort || undefined,
          lat: userLocation?.latitude,
          lng: userLocation?.longitude,
          radius: 100,
          per_page: 12,
          page: initialPage,
          rating: initialRating || undefined,
        };
        
        Object.keys(params).forEach(key => {
          if (params[key] === undefined || params[key] === '' || params[key] === null) {
            delete params[key];
          }
        });
        
        console.log('🔵 [SearchResultsPage] Initial load with params:', params);
        
        const data = await api.getCraftsmen(params);
        
        console.log('✅ [SearchResultsPage] Initial load response:', data);
        
        setCraftsmen(data.craftsmen || []);
        setMeta(data.meta || {});
        setTotalPages(data.meta?.last_page || 1);
        setCurrentPage(initialPage);
      } catch (error) {
        console.error('❌ [SearchResultsPage] Initial load error:', error);
        setError(error.message);
      }
      setLoading(false);
    };
    
    loadInitial();
  }, []);

  // ============================================================
  // تحديث URL عند تغيير الفلاتر
  // ============================================================
  const updateURL = useCallback(() => {
    const params = new URLSearchParams();
    if (query) params.set('q', query);
    if (filterLocation) params.set('city', filterLocation);
    if (filterJob) params.set('craft', filterJob);
    if (filterRating) params.set('rating', filterRating);
    if (sortBy && sortBy !== 'rating') params.set('sort', sortBy);
    if (currentPage > 1) params.set('page', currentPage);
    
    navigate(`/search?${params.toString()}`, { replace: true });
  }, [query, filterLocation, filterJob, filterRating, sortBy, currentPage, navigate]);

  useEffect(() => {
    updateURL();
  }, [query, filterLocation, filterJob, filterRating, sortBy, currentPage, updateURL]);

  // ============================================================
  // Filter and sort (جانب العميل)
  // ============================================================
  const filtered = useMemo(() => {
    let results = [...craftsmen];
    
    if (filterRating) {
      results = results.filter(c => c.rating >= parseFloat(filterRating));
    }
    
    if (sortBy === 'price_asc') {
      results.sort((a, b) => (a.hourly_rate || 0) - (b.hourly_rate || 0));
    } else if (sortBy === 'price_desc') {
      results.sort((a, b) => (b.hourly_rate || 0) - (a.hourly_rate || 0));
    } else if (sortBy === 'rating') {
      results.sort((a, b) => (b.rating || 0) - (a.rating || 0));
    } else if (sortBy === 'distance' && userLocation) {
      results.sort((a, b) => (a.distance || Infinity) - (b.distance || Infinity));
    }
    
    return results;
  }, [craftsmen, filterRating, sortBy, userLocation]);

  // ============================================================
  // Unified Filter Handler
  // ============================================================
  const handleFilterChange = useCallback((key, value) => {
    if (key === 'job') setFilterJob(value);
    if (key === 'rating') setFilterRating(value);
    if (key === 'location') setFilterLocation(value);
    if (key === 'sort') setSortBy(value);
    if (key === 'query') setQuery(value);
    
    setCurrentPage(1);
  }, []);

  // ============================================================
  // تطبيق الفلاتر وإعادة التحميل
  // ============================================================
  const applyFilters = useCallback(() => {
    loadCraftsmen(query, 1);
  }, [query, loadCraftsmen]);

  // ============================================================
  // Handlers
  // ============================================================
  const handleVoiceResult = (text) => {
    handleFilterChange('query', text);
    navigate(`/search?q=${encodeURIComponent(text)}`);
    setTimeout(() => loadCraftsmen(text, 1), 0);
  };

  const handleRefresh = () => {
    setRefreshing(true);
    loadCraftsmen();
  };

  const handleCraftsmanClick = (craftsman) => {
    navigate(`/craftsman/${craftsman.id}`);
  };

  const handleDirectionsClick = (location) => {
    window.open(`https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(location)}`);
  };

  const handlePhoneClick = (phone) => {
    if (phone) {
      window.location.href = `tel:${phone}`;
    }
  };

  const handleSelectCraftsman = (craftsman) => {
    setSelectedCraftsman(craftsman);
    if (viewMode === 'grid') {
      setViewMode('map');
    }
  };

  const handleSearch = () => {
    applyFilters();
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  const handleResetFilters = () => {
    setFilterRating('');
    setFilterLocation('');
    setFilterJob('');
    setSortBy('rating');
    setQuery('');
    setCurrentPage(1);
    navigate('/search');
    loadCraftsmen('', 1);
  };

  // ============================================================
  // Translations
  // ============================================================
  const t = {
    searchResults: lang === 'ar' ? 'نتائج البحث' : 'Search Results',
    search: lang === 'ar' ? 'ابحث عن حرفي...' : 'Search craftsmen...',
    found: (count) => lang === 'ar' ? `تم العثور على ${count} حرفي` : `Found ${count} craftsmen`,
    noResults: lang === 'ar' ? 'لا توجد نتائج' : 'No results found',
    viewProfile: lang === 'ar' ? 'عرض الملف' : 'View Profile',
    bookNow: lang === 'ar' ? 'احجز الآن' : 'Book Now',
    egp: lang === 'ar' ? 'ج.م' : 'EGP',
    highestRated: lang === 'ar' ? 'الأعلى تقييماً' : 'Highest Rated',
    lowestPrice: lang === 'ar' ? 'الأقل سعراً' : 'Lowest Price',
    highestPrice: lang === 'ar' ? 'الأعلى سعراً' : 'Highest Price',
    nearest: lang === 'ar' ? 'الأقرب إليك' : 'Nearest',
    gridView: lang === 'ar' ? 'شبكة' : 'Grid',
    mapView: lang === 'ar' ? 'خريطة' : 'Map',
    filters: lang === 'ar' ? 'تصفية' : 'Filters',
    refresh: lang === 'ar' ? 'تحديث' : 'Refresh',
    showOnMap: lang === 'ar' ? 'عرض على الخريطة' : 'Show on Map',
    nearby: lang === 'ar' ? 'الحرفيين القريبين' : 'Nearby Craftsmen',
    distance: lang === 'ar' ? 'المسافة' : 'Distance',
    selectCraftsman: lang === 'ar' ? 'اختر حرفي' : 'Select Craftsman',
    error: lang === 'ar' ? 'حدث خطأ' : 'Error',
    retry: lang === 'ar' ? 'إعادة المحاولة' : 'Retry',
    noLocation: lang === 'ar' ? 'لم يتم تحديد الموقع' : 'Location not detected',
    crafts: lang === 'ar' ? 'الحرف' : 'Crafts',
    all: lang === 'ar' ? 'الكل' : 'All',
    location: lang === 'ar' ? 'الموقع' : 'Location',
    pricePerHour: lang === 'ar' ? 'للساعة' : '/hour',
    resetFilters: lang === 'ar' ? 'مسح الفلاتر' : 'Clear Filters',
    previous: lang === 'ar' ? 'السابق' : 'Previous',
    next: lang === 'ar' ? 'التالي' : 'Next',
  };

  // ============================================================
  // Styles
  // ============================================================
  const bgColor = darkMode ? '#0f172a' : '#f8fafc';
  const cardBg = darkMode ? '#1e293b' : '#ffffff';
  const textColor = darkMode ? '#f1f5f9' : '#0f172a';
  const textSecondary = darkMode ? '#94a3b8' : '#64748b';
  const borderColor = darkMode ? '#334155' : '#e2e8f0';
  const errorBg = darkMode ? '#1e293b' : '#fef2f2';
  const errorBorder = darkMode ? '#7f1d1d' : '#fecaca';

  // ============================================================
  // ✅ Skeleton Loading Component
  // ============================================================
  const SkeletonCard = () => (
    <div style={{
      background: cardBg,
      borderRadius: '18px',
      overflow: 'hidden',
      border: `1px solid ${borderColor}`,
      padding: '16px',
    }}>
      <div className="skeleton" style={{ height: '100px', borderRadius: '12px' }} />
      <div className="skeleton" style={{ height: '20px', marginTop: '12px', width: '70%' }} />
      <div className="skeleton" style={{ height: '16px', marginTop: '8px', width: '50%' }} />
      <div className="skeleton" style={{ height: '16px', marginTop: '8px', width: '80%' }} />
      <div className="skeleton" style={{ height: '40px', marginTop: '16px', borderRadius: '10px' }} />
    </div>
  );

  // ============================================================
  // Pagination Controls
  // ============================================================
  const PaginationControls = () => (
    <div style={{
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      gap: '12px',
      marginTop: '32px',
      flexWrap: 'wrap',
    }}>
      <button
        onClick={() => loadCraftsmen(query, currentPage - 1)}
        disabled={currentPage <= 1}
        style={{
          padding: '10px 20px',
          borderRadius: '10px',
          border: `1px solid ${borderColor}`,
          background: cardBg,
          color: currentPage <= 1 ? textSecondary : textColor,
          cursor: currentPage <= 1 ? 'not-allowed' : 'pointer',
          opacity: currentPage <= 1 ? 0.4 : 1,
          fontFamily: "'Cairo', sans-serif",
          fontSize: '0.9rem',
          fontWeight: 600,
          transition: 'all 0.3s ease',
        }}
      >
        {t.previous}
      </button>
      
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
      }}>
        {[...Array(Math.min(totalPages, 5))].map((_, i) => {
          let pageNum;
          if (totalPages <= 5) {
            pageNum = i + 1;
          } else if (currentPage <= 3) {
            pageNum = i + 1;
          } else if (currentPage >= totalPages - 2) {
            pageNum = totalPages - 4 + i;
          } else {
            pageNum = currentPage - 2 + i;
          }
          
          if (pageNum > totalPages) return null;
          
          return (
            <button
              key={pageNum}
              onClick={() => loadCraftsmen(query, pageNum)}
              style={{
                padding: '10px 16px',
                borderRadius: '10px',
                border: currentPage === pageNum ? 'none' : `1px solid ${borderColor}`,
                background: currentPage === pageNum ? '#3b82f6' : 'transparent',
                color: currentPage === pageNum ? 'white' : textColor,
                cursor: 'pointer',
                fontWeight: currentPage === pageNum ? 700 : 500,
                fontFamily: "'Cairo', sans-serif",
                fontSize: '0.9rem',
                transition: 'all 0.3s ease',
                minWidth: '42px',
              }}
            >
              {pageNum}
            </button>
          );
        })}
        
        {totalPages > 5 && currentPage < totalPages - 2 && (
          <span style={{ color: textSecondary, padding: '0 4px' }}>...</span>
        )}
      </div>
      
      <button
        onClick={() => loadCraftsmen(query, currentPage + 1)}
        disabled={currentPage >= totalPages}
        style={{
          padding: '10px 20px',
          borderRadius: '10px',
          border: `1px solid ${borderColor}`,
          background: cardBg,
          color: currentPage >= totalPages ? textSecondary : textColor,
          cursor: currentPage >= totalPages ? 'not-allowed' : 'pointer',
          opacity: currentPage >= totalPages ? 0.4 : 1,
          fontFamily: "'Cairo', sans-serif",
          fontSize: '0.9rem',
          fontWeight: 600,
          transition: 'all 0.3s ease',
        }}
      >
        {t.next}
      </button>
    </div>
  );

  // ============================================================
  // ✅ RENDER
  // ============================================================
  return (
    <div style={{ 
      background: bgColor, 
      minHeight: '100vh', 
      fontFamily: "'Cairo', sans-serif", 
      direction: lang === 'ar' ? 'rtl' : 'ltr' 
    }}>
      <style>{`
        @keyframes fadeInUp { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes shimmer { 0% { background-position: -200% 0; } 100% { background-position: 200% 0; } }
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
        .animate-fade-in-up { animation: fadeInUp 0.5s ease forwards; }
        .delay-100 { animation-delay: 0.1s; } .delay-200 { animation-delay: 0.2s; }
        .hover-lift { transition: all 0.3s ease; }
        .hover-lift:hover { transform: translateY(-6px); box-shadow: 0 16px 40px rgba(0,0,0,0.12); }
        .skeleton { background: linear-gradient(90deg, ${darkMode ? '#334155' : '#e2e8f0'} 25%, ${darkMode ? '#1e293b' : '#f1f5f9'} 50%, ${darkMode ? '#334155' : '#e2e8f0'} 75%); background-size: 200% 100%; animation: shimmer 1.5s infinite; }
        .animate-spin { animation: spin 1s linear infinite; }
        .map-container { height: 400px; }
        @media (max-width: 768px) { 
          .search-header { flex-direction: column; } 
          .map-container { height: 300px; }
          .results-grid { grid-template-columns: 1fr !important; }
          .filters-row { flex-direction: column; }
        }
      `}</style>

      {/* ===== Header ===== */}
      <div style={{
        background: darkMode ? 'linear-gradient(160deg, #1e3a8a, #1e40af)' : 'linear-gradient(160deg, #2563eb, #1d4ed8)',
        color: 'white', 
        padding: '32px 0',
      }}>
        <div style={{ maxWidth: '1280px', margin: '0 auto', padding: '0 24px' }}>
          <div className="animate-fade-in-up" style={{ 
            display: 'flex', 
            alignItems: 'center', 
            gap: '12px', 
            marginBottom: '20px',
            flexWrap: 'wrap',
          }}>
            <div style={{ 
              width: '44px', 
              height: '44px', 
              borderRadius: '12px', 
              background: 'rgba(255,255,255,0.2)', 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center' 
            }}>
              <Search size={22} />
            </div>
            <div>
              <h1 style={{ fontSize: '1.5rem', fontWeight: 700, margin: 0 }}>
                {t.searchResults}
              </h1>
              <p style={{ fontSize: '0.85rem', opacity: 0.85 }}>
                {loading ? '...' : t.found(filtered.length)}
              </p>
            </div>
            {!loading && filtered.length > 0 && (
              <div style={{ 
                marginRight: 'auto',
                fontSize: '0.8rem',
                opacity: 0.7,
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
              }}>
                <Navigation size={14} />
                <span>
                  {lang === 'ar' 
                    ? `عرض ${Math.min(filtered.length, 20)} من ${meta.total || filtered.length}`
                    : `Showing ${Math.min(filtered.length, 20)} of ${meta.total || filtered.length}`}
                </span>
              </div>
            )}
          </div>

          {/* ===== Search Bar ===== */}
          <div className="animate-fade-in-up delay-100" style={{ 
            display: 'flex', 
            gap: '10px',
            flexWrap: 'wrap',
          }}>
            <div style={{ 
              flex: 1, 
              display: 'flex', 
              alignItems: 'center', 
              background: 'white', 
              borderRadius: '16px', 
              padding: '4px',
              minWidth: '200px',
            }}>
              <Search size={20} style={{ 
                color: '#94a3b8', 
                margin: lang === 'ar' ? '0 12px 0 0' : '0 0 0 12px' 
              }} />
              <input 
                type="text" 
                value={query} 
                onChange={(e) => setQuery(e.target.value)} 
                onKeyPress={handleKeyPress}
                placeholder={t.search}
                style={{ 
                  flex: 1, 
                  padding: '14px 8px', 
                  border: 'none', 
                  fontSize: '1rem', 
                  outline: 'none', 
                  color: '#0f172a', 
                  fontFamily: "'Cairo', sans-serif", 
                  textAlign: lang === 'ar' ? 'right' : 'left', 
                  background: 'transparent' 
                }} 
              />
              {query && (
                <button 
                  onClick={() => { 
                    setQuery(''); 
                    handleFilterChange('query', ''); 
                  }} 
                  style={{ 
                    background: 'none', 
                    border: 'none', 
                    cursor: 'pointer', 
                    padding: '8px', 
                    color: '#94a3b8',
                    transition: 'all 0.3s ease',
                  }}
                >
                  <X size={18} />
                </button>
              )}
              <button 
                onClick={() => setShowVoice(true)} 
                style={{ 
                  padding: '10px', 
                  borderRadius: '12px', 
                  border: 'none', 
                  cursor: 'pointer', 
                  background: '#eff6ff', 
                  color: '#3b82f6', 
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'center', 
                  margin: '2px',
                  transition: 'all 0.3s ease',
                }}
              >
                <Mic size={18} />
              </button>
            </div>
            <button 
              onClick={handleSearch} 
              style={{ 
                padding: '14px 24px', 
                borderRadius: '14px', 
                border: 'none', 
                cursor: 'pointer', 
                background: 'white', 
                color: '#2563eb', 
                fontWeight: 700, 
                fontSize: '0.95rem', 
                fontFamily: "'Cairo', sans-serif",
                transition: 'all 0.3s ease',
              }}
            >
              {lang === 'ar' ? 'بحث' : 'Search'}
            </button>
          </div>
        </div>
      </div>

      {/* ===== Content ===== */}
      <div style={{ maxWidth: '1280px', margin: '0 auto', padding: '24px' }}>
        
        {/* ===== Toolbar ===== */}
        <div className="animate-fade-in-up delay-200" style={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          marginBottom: '20px', 
          flexWrap: 'wrap', 
          gap: '12px' 
        }}>
          <div className="filters-row" style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
            <button 
              onClick={() => setShowFilters(!showFilters)} 
              style={{ 
                display: 'flex', 
                alignItems: 'center', 
                gap: '6px', 
                padding: '10px 16px', 
                borderRadius: '12px', 
                border: `1px solid ${borderColor}`, 
                background: showFilters ? '#3b82f6' : cardBg, 
                cursor: 'pointer', 
                color: showFilters ? 'white' : textColor, 
                fontSize: '0.85rem', 
                fontWeight: 600, 
                fontFamily: "'Cairo', sans-serif",
                transition: 'all 0.3s ease',
              }}
            >
              <Filter size={16} />
              {t.filters}
            </button>
            
            <select 
              value={filterJob} 
              onChange={(e) => {
                handleFilterChange('job', e.target.value);
                applyFilters();
              }} 
              style={{ 
                padding: '10px 14px', 
                borderRadius: '12px', 
                border: `1px solid ${borderColor}`, 
                background: cardBg, 
                cursor: 'pointer', 
                color: textColor, 
                fontSize: '0.85rem', 
                fontFamily: "'Cairo', sans-serif",
                transition: 'all 0.3s ease',
              }}
            >
              <option value="">{t.all}</option>
              {Array.isArray(availableCrafts) && availableCrafts.map((craft) => (
                <option key={craft.id} value={craft.id}>
                  {craft.icon} {craft.name}
                </option>
              ))}
            </select>
            
            <select 
              value={sortBy} 
              onChange={(e) => {
                handleFilterChange('sort', e.target.value);
                applyFilters();
              }} 
              style={{ 
                padding: '10px 14px', 
                borderRadius: '12px', 
                border: `1px solid ${borderColor}`, 
                background: cardBg, 
                cursor: 'pointer', 
                color: textColor, 
                fontSize: '0.85rem', 
                fontFamily: "'Cairo', sans-serif",
                transition: 'all 0.3s ease',
              }}
            >
              <option value="rating">{t.highestRated}</option>
              <option value="price_asc">{t.lowestPrice}</option>
              <option value="price_desc">{t.highestPrice}</option>
              {userLocation && <option value="distance">{t.nearest}</option>}
            </select>
            
            <button 
              onClick={handleRefresh} 
              disabled={refreshing} 
              style={{ 
                display: 'flex', 
                alignItems: 'center', 
                gap: '6px', 
                padding: '10px 14px', 
                borderRadius: '12px', 
                border: `1px solid ${borderColor}`, 
                cursor: refreshing ? 'not-allowed' : 'pointer', 
                color: textColor, 
                fontSize: '0.85rem', 
                fontFamily: "'Cairo', sans-serif",
                opacity: refreshing ? 0.5 : 1,
                background: cardBg,
                transition: 'all 0.3s ease',
              }}
            >
              <RotateCw size={16} className={refreshing ? 'animate-spin' : ''} />
              <span style={{ display: 'none' }}>{t.refresh}</span>
            </button>
          </div>
          
          <div style={{ 
            display: 'flex', 
            gap: '4px', 
            background: darkMode ? '#0f172a' : '#f1f5f9', 
            borderRadius: '12px', 
            padding: '4px' 
          }}>
            <button 
              onClick={() => setViewMode('grid')} 
              style={{ 
                padding: '8px 14px', 
                borderRadius: '10px', 
                border: 'none', 
                cursor: 'pointer', 
                fontWeight: 600, 
                fontSize: '0.85rem', 
                fontFamily: "'Cairo', sans-serif", 
                background: viewMode === 'grid' ? '#3b82f6' : 'transparent', 
                color: viewMode === 'grid' ? 'white' : textColor, 
                display: 'flex', 
                alignItems: 'center', 
                gap: '6px',
                transition: 'all 0.3s ease',
              }}
            >
              <Grid size={16} />
              {t.gridView}
            </button>
            <button 
              onClick={() => setViewMode('map')} 
              style={{ 
                padding: '8px 14px', 
                borderRadius: '10px', 
                border: 'none', 
                cursor: 'pointer', 
                fontWeight: 600, 
                fontSize: '0.85rem', 
                fontFamily: "'Cairo', sans-serif", 
                background: viewMode === 'map' ? '#3b82f6' : 'transparent', 
                color: viewMode === 'map' ? 'white' : textColor, 
                display: 'flex', 
                alignItems: 'center', 
                gap: '6px',
                transition: 'all 0.3s ease',
              }}
            >
              <Map size={16} />
              {t.mapView}
            </button>
          </div>
        </div>

        {/* ===== Expanded Filters ===== */}
        {showFilters && (
          <div style={{ 
            background: cardBg, 
            borderRadius: '16px', 
            padding: '20px', 
            border: `1px solid ${borderColor}`, 
            marginBottom: '20px', 
            display: 'flex', 
            gap: '12px', 
            flexWrap: 'wrap',
            animation: 'fadeInUp 0.3s ease forwards',
          }}>
            <select 
              value={filterRating} 
              onChange={(e) => {
                handleFilterChange('rating', e.target.value);
                applyFilters();
              }} 
              style={{ 
                padding: '10px 14px', 
                borderRadius: '10px', 
                border: `1px solid ${borderColor}`, 
                background: cardBg, 
                color: textColor, 
                fontSize: '0.85rem', 
                fontFamily: "'Cairo', sans-serif",
                minWidth: '120px',
              }}
            >
              <option value="">{lang === 'ar' ? 'التقييم' : 'Rating'}</option>
              <option value="4.5">4.5+ ⭐</option>
              <option value="4">4+ ⭐</option>
              <option value="3">3+ ⭐</option>
            </select>
            
            <input 
              type="text" 
              value={filterLocation} 
              onChange={(e) => {
                handleFilterChange('location', e.target.value);
              }}
              onBlur={applyFilters}
              placeholder={lang === 'ar' ? 'المدينة' : 'City'} 
              style={{ 
                padding: '10px 14px', 
                borderRadius: '10px', 
                border: `1px solid ${borderColor}`, 
                background: cardBg, 
                color: textColor, 
                fontSize: '0.85rem', 
                fontFamily: "'Cairo', sans-serif", 
                textAlign: lang === 'ar' ? 'right' : 'left',
                minWidth: '150px',
              }} 
            />

            <button
              onClick={handleResetFilters}
              style={{
                padding: '10px 16px',
                borderRadius: '10px',
                border: `1px solid ${borderColor}`,
                background: 'transparent',
                color: textSecondary,
                cursor: 'pointer',
                fontSize: '0.85rem',
                fontFamily: "'Cairo', sans-serif",
                transition: 'all 0.3s ease',
              }}
            >
              {t.resetFilters}
            </button>
          </div>
        )}

        {/* ===== Error Message ===== */}
        {error && (
          <div style={{
            padding: '20px',
            background: errorBg,
            borderRadius: '16px',
            border: `1px solid ${errorBorder}`,
            textAlign: 'center',
            marginBottom: '20px',
          }}>
            <AlertCircle size={40} style={{ color: '#ef4444', marginBottom: '12px' }} />
            <h3 style={{ color: '#ef4444', marginBottom: '8px', fontSize: '1.1rem' }}>
              {t.error}
            </h3>
            <p style={{ color: textSecondary, marginBottom: '16px' }}>
              {error}
            </p>
            <button
              onClick={() => {
                setError(null);
                loadCraftsmen();
              }}
              style={{
                padding: '10px 24px',
                borderRadius: '10px',
                border: 'none',
                background: '#3b82f6',
                color: 'white',
                cursor: 'pointer',
                fontWeight: 600,
                fontFamily: "'Cairo', sans-serif",
                transition: 'all 0.3s ease',
              }}
            >
              {t.retry}
            </button>
          </div>
        )}

        {/* ===== Location Status ===== */}
        {locationPermission === 'denied' && (
          <div style={{
            padding: '12px 16px',
            background: darkMode ? 'rgba(59,130,246,0.1)' : '#eff6ff',
            borderRadius: '12px',
            border: `1px solid ${darkMode ? 'rgba(59,130,246,0.2)' : 'rgba(59,130,246,0.2)'}`,
            marginBottom: '20px',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            fontSize: '0.85rem',
            color: '#3b82f6',
          }}>
            <AlertCircle size={16} style={{ flexShrink: 0 }} />
            <span>
              {lang === 'ar' 
                ? '⚠️ لم يتم تحديد موقعك. استخدم الفلتر "المدينة" للبحث.'
                : '⚠️ Your location was not detected. Use the "City" filter to search.'}
            </span>
          </div>
        )}

        {/* ===== Results ===== */}
        {loading ? (
          <div className="results-grid" style={{ 
            display: 'grid', 
            gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', 
            gap: '20px' 
          }}>
            {[1, 2, 3, 4, 5, 6].map(i => (
              <SkeletonCard key={i} />
            ))}
          </div>
        ) : viewMode === 'map' ? (
          /* ===== 🗺️ MAP VIEW ===== */
          <div className="animate-fade-in-up">
            {filtered.length === 0 ? (
              <div style={{ 
                textAlign: 'center', 
                padding: '60px 20px', 
                background: cardBg, 
                borderRadius: '18px', 
                border: `1px solid ${borderColor}` 
              }}>
                <Search size={48} style={{ color: textSecondary, opacity: 0.3, marginBottom: '16px' }} />
                <h3 style={{ fontSize: '1.2rem', fontWeight: 700, color: textColor }}>
                  {t.noResults}
                </h3>
              </div>
            ) : (
              <>
                <div className="map-container">
                  <CraftsmanMap
                    craftsman={selectedCraftsman}
                    nearbyCraftsmen={filtered.filter(c => c.id !== selectedCraftsman?.id)}
                    userLocation={userLocation}
                    onCraftsmanClick={handleCraftsmanClick}
                    onDirectionsClick={handleDirectionsClick}
                    onPhoneClick={handlePhoneClick}
                  />
                </div>

                <div style={{ 
                  marginTop: '20px',
                  padding: '16px',
                  background: cardBg,
                  borderRadius: '16px',
                  border: `1px solid ${borderColor}`,
                }}>
                  <h4 style={{ 
                    fontSize: '1rem', 
                    fontWeight: 700, 
                    color: textColor, 
                    marginBottom: '12px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                  }}>
                    <Users size={18} style={{ color: '#3b82f6' }} />
                    {t.selectCraftsman} ({filtered.length})
                  </h4>
                  
                  <div style={{
                    display: 'flex',
                    flexWrap: 'wrap',
                    gap: '8px',
                    maxHeight: '200px',
                    overflowY: 'auto',
                    padding: '4px',
                  }}>
                    {filtered.map((c) => (
                      <button
                        key={c.id}
                        onClick={() => handleSelectCraftsman(c)}
                        style={{
                          padding: '8px 16px',
                          borderRadius: '10px',
                          border: selectedCraftsman?.id === c.id 
                            ? '2px solid #3b82f6' 
                            : `1px solid ${borderColor}`,
                          background: selectedCraftsman?.id === c.id 
                            ? 'rgba(59,130,246,0.1)' 
                            : 'transparent',
                          color: textColor,
                          cursor: 'pointer',
                          fontSize: '0.85rem',
                          fontWeight: selectedCraftsman?.id === c.id ? 700 : 500,
                          fontFamily: "'Cairo', sans-serif",
                          transition: 'all 0.3s ease',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '6px',
                        }}
                      >
                        <span style={{ fontWeight: 700 }}>{c.rating || '?'}</span>
                        <span>⭐</span>
                        <span>{c.name}</span>
                        {c.distance && (
                          <span style={{
                            fontSize: '0.7rem',
                            color: '#059669',
                            marginLeft: '4px',
                          }}>
                            ({c.distance.toFixed(1)} {lang === 'ar' ? 'كم' : 'km'})
                          </span>
                        )}
                      </button>
                    ))}
                  </div>
                </div>

                <div style={{
                  marginTop: '16px',
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))',
                  gap: '12px',
                }}>
                  <div style={{
                    padding: '12px',
                    background: cardBg,
                    borderRadius: '12px',
                    border: `1px solid ${borderColor}`,
                    textAlign: 'center',
                  }}>
                    <div style={{ fontSize: '1.5rem', fontWeight: 700, color: '#3b82f6' }}>
                      {filtered.length}
                    </div>
                    <div style={{ fontSize: '0.7rem', color: textSecondary }}>
                      {lang === 'ar' ? 'إجمالي النتائج' : 'Total Results'}
                    </div>
                  </div>
                  <div style={{
                    padding: '12px',
                    background: cardBg,
                    borderRadius: '12px',
                    border: `1px solid ${borderColor}`,
                    textAlign: 'center',
                  }}>
                    <div style={{ fontSize: '1.5rem', fontWeight: 700, color: '#f59e0b' }}>
                      {filtered.length > 0 
                        ? (filtered.reduce((sum, c) => sum + (c.rating || 0), 0) / filtered.length).toFixed(1)
                        : '0'}
                    </div>
                    <div style={{ fontSize: '0.7rem', color: textSecondary }}>
                      ⭐ {lang === 'ar' ? 'متوسط التقييم' : 'Avg Rating'}
                    </div>
                  </div>
                  <div style={{
                    padding: '12px',
                    background: cardBg,
                    borderRadius: '12px',
                    border: `1px solid ${borderColor}`,
                    textAlign: 'center',
                  }}>
                    <div style={{ fontSize: '1.5rem', fontWeight: 700, color: '#059669' }}>
                      {filtered.length > 0 
                        ? Math.round(filtered.reduce((sum, c) => sum + (c.hourly_rate || 0), 0) / filtered.length)
                        : '0'} {t.egp}
                    </div>
                    <div style={{ fontSize: '0.7rem', color: textSecondary }}>
                      {lang === 'ar' ? 'متوسط السعر' : 'Avg Price'}
                    </div>
                  </div>
                  {userLocation && (
                    <div style={{
                      padding: '12px',
                      background: cardBg,
                      borderRadius: '12px',
                      border: `1px solid ${borderColor}`,
                      textAlign: 'center',
                    }}>
                      <div style={{ fontSize: '1.5rem', fontWeight: 700, color: '#8b5cf6' }}>
                        {filtered.length > 0 && filtered.some(c => c.distance) 
                          ? Math.min(...filtered.map(c => c.distance || Infinity)).toFixed(1)
                          : '?'} {lang === 'ar' ? 'كم' : 'km'}
                      </div>
                      <div style={{ fontSize: '0.7rem', color: textSecondary }}>
                        {lang === 'ar' ? 'أقرب حرفي' : 'Nearest'}
                      </div>
                    </div>
                  )}
                </div>
              </>
            )}
          </div>
        ) : filtered.length > 0 ? (
          /* ===== 📋 GRID VIEW ===== */
          <>
            <div className="results-grid" style={{ 
              display: 'grid', 
              gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', 
              gap: '20px' 
            }}>
              {filtered.map((c, index) => {
                const price = c.hourly_rate || 0;
                
                return (
                  <div 
                    key={c.id} 
                    className="hover-lift animate-fade-in-up" 
                    style={{ 
                      background: cardBg, 
                      borderRadius: '18px', 
                      overflow: 'hidden', 
                      border: `1px solid ${borderColor}`, 
                      animationDelay: `${index * 0.05}s`,
                      transition: 'all 0.3s ease',
                    }}
                  >
                    <div style={{ 
                      height: '100px', 
                      background: 'linear-gradient(160deg, #2563eb, #1d4ed8)', 
                      display: 'flex', 
                      alignItems: 'center', 
                      justifyContent: 'center', 
                      position: 'relative',
                    }}>
                      <span style={{ 
                        position: 'absolute', 
                        top: '10px', 
                        left: lang === 'ar' ? 'auto' : '10px',
                        right: lang === 'ar' ? '10px' : 'auto',
                        background: 'rgba(0,0,0,0.5)',
                        backdropFilter: 'blur(10px)',
                        padding: '4px 10px', 
                        borderRadius: '20px', 
                        fontSize: '0.75rem', 
                        fontWeight: 700, 
                        color: '#fbbf24', 
                        display: 'flex', 
                        alignItems: 'center', 
                        gap: '4px',
                      }}>
                        <Star size={12} fill="#fbbf24" />
                        {c.rating || 'جديد'}
                      </span>
                      
                      <div style={{ 
                        width: '52px', 
                        height: '52px', 
                        borderRadius: '50%', 
                        background: 'rgba(255,255,255,0.2)', 
                        display: 'flex', 
                        alignItems: 'center', 
                        justifyContent: 'center', 
                        fontSize: '1.4rem', 
                        fontWeight: 700, 
                        color: 'white', 
                        border: '3px solid rgba(255,255,255,0.3)',
                      }}>
                        {c.name?.charAt(0) || c.profession?.charAt(0) || 'ح'}
                      </div>

                      <button
                        onClick={() => handleSelectCraftsman(c)}
                        style={{
                          position: 'absolute',
                          bottom: '-12px',
                          right: lang === 'ar' ? 'auto' : '12px',
                          left: lang === 'ar' ? '12px' : 'auto',
                          padding: '4px 12px',
                          borderRadius: '20px',
                          border: 'none',
                          background: 'white',
                          color: '#2563eb',
                          cursor: 'pointer',
                          fontSize: '0.7rem',
                          fontWeight: 600,
                          fontFamily: "'Cairo', sans-serif",
                          display: 'flex',
                          alignItems: 'center',
                          gap: '4px',
                          boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
                          transition: 'all 0.3s ease',
                        }}
                      >
                        <Map size={12} />
                        {t.showOnMap}
                      </button>
                    </div>
                    
                    <div style={{ padding: '20px 16px 16px' }}>
                      <div style={{ 
                        display: 'flex', 
                        justifyContent: 'space-between', 
                        alignItems: 'start',
                        marginBottom: '4px',
                      }}>
                        <h3 style={{ 
                          fontWeight: 700, 
                          color: textColor, 
                          fontSize: '1rem',
                          margin: 0,
                          flex: 1,
                        }}>
                          {c.name}
                        </h3>
                        <div style={{ 
                          display: 'flex', 
                          flexDirection: 'column',
                          alignItems: 'flex-end',
                          marginLeft: lang === 'ar' ? '0' : '8px',
                          marginRight: lang === 'ar' ? '8px' : '0',
                        }}>
                          <span style={{ 
                            fontWeight: 700, 
                            color: '#059669',
                            fontSize: '0.9rem',
                            whiteSpace: 'nowrap',
                          }}>
                            {price} {t.egp}
                          </span>
                          <span style={{ 
                            fontSize: '0.6rem', 
                            color: textSecondary,
                          }}>
                            {t.pricePerHour}
                          </span>
                        </div>
                      </div>
                      
                      <p style={{ 
                        fontSize: '0.8rem', 
                        color: '#3b82f6', 
                        fontWeight: 500, 
                        marginBottom: '6px',
                      }}>
                        <Wrench size={12} style={{ display: 'inline', marginRight: '4px' }} />
                        {c.profession || 'حرفي'}
                      </p>
                      
                      <div style={{ 
                        display: 'flex', 
                        gap: '8px', 
                        fontSize: '0.75rem', 
                        color: textSecondary,
                        marginBottom: '10px',
                        flexWrap: 'wrap',
                      }}>
                        <span style={{ display: 'flex', alignItems: 'center', gap: '3px' }}>
                          <MapPin size={12} />
                          {c.city}
                          {c.district && ` - ${c.district}`}
                        </span>
                        {c.distance && (
                          <span style={{ 
                            display: 'flex', 
                            alignItems: 'center', 
                            gap: '3px',
                            color: '#059669',
                            fontWeight: 600,
                          }}>
                            <Route size={12} />
                            {c.distance.toFixed(1)} {lang === 'ar' ? 'كم' : 'km'}
                          </span>
                        )}
                      </div>
                      
                      {c.bio && (
                        <p style={{ 
                          fontSize: '0.8rem', 
                          color: textSecondary,
                          lineHeight: 1.5,
                          marginBottom: '10px',
                          display: '-webkit-box',
                          WebkitLineClamp: 2,
                          WebkitBoxOrient: 'vertical',
                          overflow: 'hidden',
                        }}>
                          {c.bio}
                        </p>
                      )}

                      {c.skills && c.skills.length > 0 && (
                        <div style={{ 
                          display: 'flex', 
                          flexWrap: 'wrap', 
                          gap: '4px', 
                          marginBottom: '12px',
                        }}>
                          {c.skills.slice(0, 3).map((skill, i) => (
                            <span key={i} style={{
                              padding: '2px 8px',
                              borderRadius: '12px',
                              background: darkMode ? 'rgba(59,130,246,0.1)' : '#eff6ff',
                              color: '#3b82f6',
                              fontSize: '0.65rem',
                              fontWeight: 500,
                            }}>
                              {skill}
                            </span>
                          ))}
                          {c.skills.length > 3 && (
                            <span style={{
                              padding: '2px 8px',
                              borderRadius: '12px',
                              background: darkMode ? '#334155' : '#f1f5f9',
                              color: textSecondary,
                              fontSize: '0.65rem',
                            }}>
                              +{c.skills.length - 3}
                            </span>
                          )}
                        </div>
                      )}
                      
                      <div style={{ display: 'flex', gap: '8px' }}>
                        <Link 
                          to={`/craftsman/${c.id}`} 
                          style={{ 
                            flex: 1, 
                            padding: '8px 12px', 
                            borderRadius: '10px', 
                            background: darkMode ? 'rgba(59,130,246,0.15)' : '#eff6ff', 
                            color: '#3b82f6', 
                            textDecoration: 'none', 
                            textAlign: 'center', 
                            fontWeight: 600, 
                            fontSize: '0.8rem', 
                            fontFamily: "'Cairo', sans-serif",
                            transition: 'all 0.3s ease',
                          }}
                        >
                          {t.viewProfile}
                        </Link>
                        <Link 
                          to={`/booking/${c.id}`} 
                          style={{ 
                            flex: 1, 
                            padding: '8px 12px', 
                            borderRadius: '10px', 
                            background: '#2563eb', 
                            color: 'white', 
                            textDecoration: 'none', 
                            textAlign: 'center', 
                            fontWeight: 600, 
                            fontSize: '0.8rem', 
                            fontFamily: "'Cairo', sans-serif",
                            transition: 'all 0.3s ease',
                          }}
                        >
                          {t.bookNow}
                        </Link>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
            
            {/* ✅ Pagination Controls */}
            {totalPages > 1 && <PaginationControls />}
          </>
        ) : (
          /* ===== No Results ===== */
          <div style={{ 
            textAlign: 'center', 
            padding: '80px 20px', 
            background: cardBg, 
            borderRadius: '18px', 
            border: `1px solid ${borderColor}`,
          }}>
            <Search size={64} style={{ color: textSecondary, opacity: 0.3, marginBottom: '16px' }} />
            <h3 style={{ fontSize: '1.3rem', fontWeight: 700, color: textColor, marginBottom: '8px' }}>
              {t.noResults}
            </h3>
            <p style={{ color: textSecondary, fontSize: '0.95rem' }}>
              {lang === 'ar' 
                ? 'حاول تعديل كلمات البحث أو إزالة الفلاتر' 
                : 'Try adjusting your search terms or removing filters'}
            </p>
            <button
              onClick={handleResetFilters}
              style={{
                marginTop: '16px',
                padding: '10px 24px',
                borderRadius: '10px',
                border: 'none',
                background: '#3b82f6',
                color: 'white',
                cursor: 'pointer',
                fontWeight: 600,
                fontFamily: "'Cairo', sans-serif",
                transition: 'all 0.3s ease',
              }}
            >
              {t.resetFilters}
            </button>
          </div>
        )}
      </div>

      {/* ===== Voice Search Modal ===== */}
      {showVoice && (
        <VoiceSearch 
          lang={lang} 
          onResult={handleVoiceResult} 
          onClose={() => setShowVoice(false)} 
        />
      )}
    </div>
  );
};

export default SearchResultsPage;