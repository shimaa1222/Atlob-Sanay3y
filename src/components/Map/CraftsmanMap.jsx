// src/components/Map/CraftsmanMap.jsx
import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useTheme } from '../../context/ThemeContext';
import api from '../../services/api'; // ✅ استيراد الـ API
import { getCityCoordinates, calculateDistance, formatDistance } from '../../utils/location';
import { 
  MapPin, Navigation, Phone, Star, Clock, 
  Wrench, Route, ChevronRight, ExternalLink,
  Loader, AlertCircle, Users, Ruler
} from 'lucide-react';

// ============================================
// 1. Hooks مخصصة
// ============================================

/**
 * Hook لإدارة اللغة
 */
const useLanguage = () => {
  const [lang, setLang] = useState(() => 
    localStorage.getItem('language') || 'ar'
  );

  useEffect(() => {
    const handleChange = () => {
      setLang(localStorage.getItem('language') || 'ar');
    };
    window.addEventListener('languagechange', handleChange);
    return () => window.removeEventListener('languagechange', handleChange);
  }, []);

  return lang;
};

/**
 * Hook لحساب المسافة
 */
const useCraftsmanDistance = (userLocation, craftsman) => {
  return useMemo(() => {
    if (!userLocation || !craftsman?.latitude || !craftsman?.longitude) {
      return null;
    }
    return calculateDistance(
      userLocation.latitude,
      userLocation.longitude,
      craftsman.latitude,
      craftsman.longitude
    );
  }, [userLocation, craftsman]);
};

// ============================================
// 2. دوال مساعدة
// ============================================

/**
 * الحصول على الترجمات
 */
const getTranslations = (lang) => ({
  location: lang === 'ar' ? 'الموقع على الخريطة' : 'Location on Map',
  nearby: lang === 'ar' ? 'الحرفيين القريبين' : 'Nearby Craftsmen',
  distance: lang === 'ar' ? 'المسافة' : 'Distance',
  away: lang === 'ar' ? 'عنك' : 'away',
  viewOnMap: lang === 'ar' ? 'عرض على الخريطة' : 'View on Map',
  getDirections: lang === 'ar' ? 'الاتجاهات' : 'Directions',
  map: lang === 'ar' ? 'الخريطة' : 'Map',
  list: lang === 'ar' ? 'القائمة' : 'List',
  noNearby: lang === 'ar' ? 'لا يوجد حرفيين قريبين' : 'No nearby craftsmen',
  loading: lang === 'ar' ? 'جاري تحميل الخريطة...' : 'Loading map...',
  error: lang === 'ar' ? 'تعذر تحميل الخريطة' : 'Failed to load map',
  rate: lang === 'ar' ? 'تقييم' : 'Rating',
  years: lang === 'ar' ? 'سنوات الخبرة' : 'Years Exp',
  contact: lang === 'ar' ? 'اتصال' : 'Call',
  estimatedTime: lang === 'ar' ? 'الوقت التقريبي' : 'Est. Time',
  minutes: lang === 'ar' ? 'دقيقة' : 'min',
  current: lang === 'ar' ? 'الحالي' : 'Current',
  refresh: lang === 'ar' ? 'تحديث' : 'Refresh',
  loadError: lang === 'ar' ? 'حدث خطأ في تحميل البيانات' : 'Error loading data',
  retry: lang === 'ar' ? 'إعادة المحاولة' : 'Retry',
});

// ============================================
// 3. المكونات الفرعية
// ============================================

/**
 * مكون زر تبديل العرض
 */
const ViewToggle = ({ activeView, setActiveView, t, darkMode }) => {
  const views = [
    { id: 'map', icon: MapPin, label: t.map },
    { id: 'list', icon: Users, label: t.list },
  ];

  return (
    <div style={{
      display: 'flex',
      background: darkMode ? '#0f172a' : '#f1f5f9',
      borderRadius: '10px',
      padding: '3px',
      gap: '2px',
    }}>
      {views.map(({ id, icon: Icon, label }) => (
        <button
          key={id}
          onClick={() => setActiveView(id)}
          role="tab"
          aria-selected={activeView === id}
          aria-label={label}
          style={{
            padding: '6px 14px',
            borderRadius: '8px',
            border: 'none',
            cursor: 'pointer',
            fontWeight: 600,
            fontSize: '0.8rem',
            fontFamily: "'Cairo', sans-serif",
            background: activeView === id ? '#3b82f6' : 'transparent',
            color: activeView === id ? 'white' : (darkMode ? '#94a3b8' : '#64748b'),
            transition: 'all 0.3s ease',
            display: 'flex',
            alignItems: 'center',
            gap: '4px',
          }}
        >
          <Icon size={14} />
          {label}
        </button>
      ))}
    </div>
  );
};

/**
 * مكون عرض الخريطة
 */
const MapView = ({ 
  isLoading, 
  setIsLoading, 
  encodedLocation, 
  craftsman, 
  fullLocation, 
  distance, 
  formatDistanceFn, 
  t, 
  darkMode, 
  styles,
  error,
  onRetry,
}) => {
  if (error) {
    return (
      <div style={{
        borderRadius: '16px',
        height: '350px',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        background: darkMode ? '#1e293b' : '#fef2f2',
        border: `1px solid ${darkMode ? '#7f1d1d' : '#fecaca'}`,
        gap: '12px',
        padding: '20px',
        textAlign: 'center',
      }}>
        <AlertCircle size={48} style={{ color: '#ef4444' }} />
        <p style={{ color: '#ef4444', fontWeight: 600 }}>{t.loadError}</p>
        <button
          onClick={onRetry}
          style={{
            padding: '8px 20px',
            borderRadius: '10px',
            border: 'none',
            background: '#3b82f6',
            color: 'white',
            cursor: 'pointer',
            fontWeight: 600,
            fontFamily: "'Cairo', sans-serif",
          }}
        >
          {t.retry}
        </button>
      </div>
    );
  }

  return (
    <div>
      {isLoading ? (
        <div className="skeleton" style={{
          borderRadius: '16px',
          height: '350px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: styles.textSecondary,
        }}>
          <Loader size={32} className="animate-spin" />
          <span style={{ marginLeft: '8px' }}>{t.loading}</span>
        </div>
      ) : (
        <div className="map-container" style={{
          borderRadius: '16px',
          overflow: 'hidden',
          boxShadow: '0 4px 16px rgba(0,0,0,0.1)',
          border: `1px solid ${styles.borderColor}`,
          background: styles.mapBg,
        }}>
          <iframe
            title={`${craftsman?.name || ''} - ${fullLocation}`}
            aria-label={`خريطة توضح موقع ${craftsman?.name || 'الحرفي'}`}
            width="100%"
            height="350"
            className="map-iframe"
            style={{ 
              border: 'none',
              display: 'block',
              filter: darkMode ? 'invert(0.9) hue-rotate(180deg)' : 'none',
            }}
            src={`https://maps.google.com/maps?q=${encodedLocation}&t=&z=14&ie=UTF8&iwloc=&output=embed`}
            allowFullScreen
            loading="lazy"
            onLoad={() => setIsLoading(false)}
            onError={() => setIsLoading(false)}
          />

          <div style={{
            padding: '16px 20px',
            background: styles.cardBg,
            borderTop: `1px solid ${styles.borderColor}`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '12px',
          }}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              color: styles.textColor,
              fontSize: '0.9rem',
              fontWeight: 600,
            }}>
              <MapPin size={18} style={{ color: '#ef4444', flexShrink: 0 }} />
              <span>{craftsman?.name || ''} - {fullLocation}</span>
            </div>

            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
              <a
                href={`https://www.google.com/maps/dir/?api=1&destination=${encodedLocation}`}
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                  padding: '8px 16px',
                  borderRadius: '10px',
                  background: '#059669',
                  color: 'white',
                  textDecoration: 'none',
                  fontSize: '0.85rem',
                  fontWeight: 600,
                  fontFamily: "'Cairo', sans-serif",
                  transition: 'all 0.3s ease',
                  boxShadow: '0 2px 8px rgba(5,150,105,0.3)',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'translateY(-2px)';
                  e.currentTarget.style.boxShadow = '0 4px 12px rgba(5,150,105,0.4)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = '0 2px 8px rgba(5,150,105,0.3)';
                }}
              >
                <Navigation size={16} />
                {t.getDirections}
              </a>

              <a
                href={`https://www.google.com/maps/place/${encodedLocation}`}
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                  padding: '8px 16px',
                  borderRadius: '10px',
                  background: darkMode ? '#334155' : '#f1f5f9',
                  color: styles.textColor,
                  textDecoration: 'none',
                  fontSize: '0.85rem',
                  fontWeight: 600,
                  fontFamily: "'Cairo', sans-serif",
                  border: `1px solid ${styles.borderColor}`,
                  transition: 'all 0.3s ease',
                }}
              >
                <ExternalLink size={16} />
                {t.viewOnMap}
              </a>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

/**
 * مكون قائمة الحرفيين القريبين
 */
const NearbyListView = ({ 
  nearbyCraftsmen, 
  craftsman, 
  fullLocation, 
  distance, 
  formatDistanceFn, 
  t, 
  styles, 
  darkMode, 
  lang,
  isLoading,
  onCraftsmanClick,
}) => (
  <div className="animate-fade-in">
    <h4 style={{
      fontSize: '1rem',
      fontWeight: 600,
      color: styles.textColor,
      marginBottom: '16px',
      display: 'flex',
      alignItems: 'center',
      gap: '8px',
    }}>
      <Users size={18} style={{ color: '#3b82f6' }} />
      {t.nearby}
      {nearbyCraftsmen.length > 0 && (
        <span style={{
          fontSize: '0.7rem',
          background: darkMode ? '#334155' : '#e2e8f0',
          padding: '2px 10px',
          borderRadius: '12px',
          color: styles.textSecondary,
        }}>
          {nearbyCraftsmen.length}
        </span>
      )}
    </h4>

    {isLoading ? (
      <div style={{
        textAlign: 'center',
        padding: '40px 20px',
        color: styles.textSecondary,
      }}>
        <Loader size={32} className="animate-spin" />
        <p>{t.loading}</p>
      </div>
    ) : nearbyCraftsmen && nearbyCraftsmen.length > 0 ? (
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        gap: '10px',
        maxHeight: '400px',
        overflowY: 'auto',
        paddingRight: lang === 'ar' ? '0' : '4px',
        paddingLeft: lang === 'ar' ? '4px' : '0',
      }}>
        {/* الحرفي الحالي */}
        <div 
          className="nearby-card animate-slide-up" 
          style={{
            background: styles.cardBg,
            borderRadius: '14px',
            padding: '16px',
            border: '2px solid #3b82f6',
            display: 'flex',
            alignItems: 'center',
            gap: '14px',
            cursor: 'pointer',
          }}
          onClick={() => onCraftsmanClick?.(craftsman)}
        >
          <div style={{
            width: '48px',
            height: '48px',
            borderRadius: '12px',
            background: 'linear-gradient(135deg, #3b82f6, #2563eb)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0,
          }}>
            <MapPin size={24} color="white" />
          </div>
          
          <div style={{ flex: 1 }}>
            <div style={{
              fontWeight: 700,
              fontSize: '0.95rem',
              color: styles.textColor,
              marginBottom: '4px',
            }}>
              {craftsman?.name}
              <span style={{
                fontSize: '0.7rem',
                background: '#3b82f6',
                color: 'white',
                padding: '2px 8px',
                borderRadius: '10px',
                marginLeft: lang === 'ar' ? '8px' : '0',
                marginRight: lang === 'ar' ? '0' : '8px',
              }}>
                {t.current}
              </span>
            </div>
            <div style={{ fontSize: '0.8rem', color: styles.textSecondary }}>
              📍 {fullLocation}
            </div>
          </div>

          <ChevronRight size={20} style={{ color: styles.textSecondary, flexShrink: 0 }} />
        </div>

        {/* الحرفيين القريبين */}
        {nearbyCraftsmen
          .filter(c => c.id !== craftsman?.id)
          .slice(0, 5)
          .map((nearby, index) => {
            const dist = craftsman?.latitude && nearby?.latitude
              ? calculateDistance(
                  craftsman.latitude,
                  craftsman.longitude,
                  nearby.latitude,
                  nearby.longitude
                )
              : null;

            return (
              <div 
                key={nearby.id || index}
                className="nearby-card animate-slide-up"
                style={{
                  background: styles.cardBg,
                  borderRadius: '14px',
                  padding: '16px',
                  border: `1px solid ${styles.borderColor}`,
                  display: 'flex',
                  alignItems: 'center',
                  gap: '14px',
                  cursor: 'pointer',
                  transition: 'all 0.3s ease',
                  animationDelay: `${index * 0.1}s`,
                }}
                onClick={() => onCraftsmanClick?.(nearby)}
              >
                <div style={{
                  width: '48px',
                  height: '48px',
                  borderRadius: '12px',
                  background: darkMode ? '#334155' : '#f1f5f9',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                  position: 'relative',
                }}>
                  <Wrench size={22} style={{ color: '#3b82f6' }} />
                  <span style={{
                    position: 'absolute',
                    top: '-4px',
                    right: '-4px',
                    width: '20px',
                    height: '20px',
                    borderRadius: '50%',
                    background: '#3b82f6',
                    color: 'white',
                    fontSize: '0.65rem',
                    fontWeight: 700,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}>
                    {index + 2}
                  </span>
                </div>
                
                <div style={{ flex: 1 }}>
                  <div style={{
                    fontWeight: 700,
                    fontSize: '0.95rem',
                    color: styles.textColor,
                    marginBottom: '4px',
                  }}>
                    {nearby.name}
                  </div>
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px',
                    fontSize: '0.8rem',
                    color: styles.textSecondary,
                    flexWrap: 'wrap',
                  }}>
                    <span>📍 {nearby.city || nearby.location}</span>
                    {dist && (
                      <span style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '4px',
                        color: '#059669',
                        fontWeight: 600,
                      }}>
                        <Route size={12} />
                        {formatDistanceFn(dist)}
                      </span>
                    )}
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  {nearby.rating && (
                    <span style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '3px',
                      fontSize: '0.8rem',
                      fontWeight: 600,
                      color: '#f59e0b',
                    }}>
                      <Star size={14} fill="#f59e0b" />
                      {nearby.rating}
                    </span>
                  )}
                  <ChevronRight size={20} style={{ color: styles.textSecondary, flexShrink: 0 }} />
                </div>
              </div>
            );
          })}
      </div>
    ) : (
      <div style={{
        textAlign: 'center',
        padding: '40px 20px',
        color: styles.textSecondary,
        background: styles.cardBg,
        borderRadius: '14px',
        border: `1px solid ${styles.borderColor}`,
      }}>
        <MapPin size={48} style={{ opacity: 0.3, marginBottom: '12px' }} />
        <p style={{ fontSize: '0.95rem' }}>{t.noNearby}</p>
      </div>
    )}
  </div>
);

// ============================================
// 4. المكون الرئيسي
// ============================================

const CraftsmanMap = ({ 
  craftsman, 
  nearbyCraftsmen = [], 
  userLocation = null,
  onCraftsmanClick,
  onDirectionsClick,
  onPhoneClick,
}) => {
  // hooks
  const { darkMode } = useTheme();
  const lang = useLanguage();
  const [activeView, setActiveView] = useState('map');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [craftsmanData, setCraftsmanData] = useState(craftsman);
  const [nearbyData, setNearbyData] = useState(nearbyCraftsmen);
  const [isLoadingNearby, setIsLoadingNearby] = useState(false);

  // البيانات المحسوبة
  const t = getTranslations(lang);
  const distance = useCraftsmanDistance(userLocation, craftsmanData);
  
  const formatDistanceWithLang = useCallback(
    (dist) => {
      if (!dist) return '';
      return dist < 1 
        ? `${Math.round(dist * 1000)} ${lang === 'ar' ? 'متر' : 'm'}`
        : `${dist.toFixed(1)} ${lang === 'ar' ? 'كم' : 'km'}`;
    },
    [lang]
  );

  const locationData = useMemo(() => {
    const location = craftsmanData?.city || craftsmanData?.location || 'القاهرة';
    const fullLocation = craftsmanData?.district 
      ? `${craftsmanData.district}, ${craftsmanData.city}` 
      : location;
    return { location, fullLocation };
  }, [craftsmanData]);

  // الأنماط
  const styles = useMemo(() => ({
    cardBg: darkMode ? '#1e293b' : '#ffffff',
    textColor: darkMode ? '#f1f5f9' : '#0f172a',
    textSecondary: darkMode ? '#94a3b8' : '#64748b',
    borderColor: darkMode ? '#334155' : '#e2e8f0',
    mapBg: darkMode ? '#1e293b' : '#f1f5f9',
  }), [darkMode]);

  const encodedLocation = encodeURIComponent(locationData.fullLocation);

  // ============================================
  // ✅ جلب بيانات الحرفي من الـ Backend
  // ============================================
  const loadCraftsmanData = useCallback(async () => {
    // إذا كانت البيانات موجودة، استخدمها
    if (craftsman && craftsman.id && craftsman.latitude && craftsman.longitude) {
      setCraftsmanData(craftsman);
      setNearbyData(nearbyCraftsmen);
      setIsLoading(false);
      return;
    }

    // إذا لم تكن موجودة، جلبها من الـ API
    if (craftsman && craftsman.id) {
      setIsLoading(true);
      setError(null);
      
      try {
        const data = await api.getCraftsman(craftsman.id);
        const c = data.craftsman || data;
        
        // ✅ تنسيق البيانات
        const formattedCraftsman = {
          ...c,
          id: c.id || craftsman.id,
          name: c.name || `${c.first_name || ''} ${c.last_name || ''}`.trim() || c.profession || 'حرفي',
          latitude: c.latitude || c.lat || getCityCoordinates(c.city || 'القاهرة').lat,
          longitude: c.longitude || c.lng || getCityCoordinates(c.city || 'القاهرة').lng,
          rating: c.rating || 4.5,
          hourly_rate: c.hourly_rate || c.price || 150,
          city: c.city || 'القاهرة',
          district: c.district || '',
          phone: c.phone || c.phone_number || '',
          completedJobs: c.completed_jobs || c.completed_bookings || 0,
          yearsExperience: c.years_exp || c.yearsExperience || 5,
          profession: c.profession || c.crafts?.[0]?.name || 'حرفي',
        };
        
        setCraftsmanData(formattedCraftsman);
        
        // ✅ جلب الحرفيين القريبين
        if (formattedCraftsman.latitude && formattedCraftsman.longitude) {
          setIsLoadingNearby(true);
          try {
            const nearby = await api.getNearbyCraftsmen(craftsman.id, {
              lat: formattedCraftsman.latitude,
              lng: formattedCraftsman.longitude,
              radius: 50,
            });
            
            const formattedNearby = (nearby.craftsmen || nearby || []).map(n => ({
              ...n,
              id: n.id || n._id,
              name: n.name || `${n.first_name || ''} ${n.last_name || ''}`.trim() || n.profession || 'حرفي',
              latitude: n.latitude || n.lat || getCityCoordinates(n.city || 'القاهرة').lat,
              longitude: n.longitude || n.lng || getCityCoordinates(n.city || 'القاهرة').lng,
              rating: n.rating || 4.0,
              city: n.city || 'القاهرة',
              district: n.district || '',
              phone: n.phone || n.phone_number || '',
              profession: n.profession || n.crafts?.[0]?.name || 'حرفي',
            }));
            
            setNearbyData(formattedNearby);
          } catch (e) {
            console.warn('Could not load nearby craftsmen:', e);
            setNearbyData([]);
          } finally {
            setIsLoadingNearby(false);
          }
        }
        
      } catch (error) {
        console.error('Error loading craftsman data:', error);
        setError(error.message || 'حدث خطأ في تحميل البيانات');
        // استخدام البيانات الموجودة (حتى لو كانت ناقصة)
        setCraftsmanData(craftsman);
      } finally {
        setIsLoading(false);
      }
    } else {
      setIsLoading(false);
    }
  }, [craftsman, nearbyCraftsmen]);

  // تحميل البيانات عند التغيير
  useEffect(() => {
    loadCraftsmanData();
  }, [loadCraftsmanData]);

  // إعادة التحميل عند تغيير userLocation
  useEffect(() => {
    if (userLocation && craftsmanData) {
      // فقط تحديث المسافة - تتم تلقائياً
    }
  }, [userLocation, craftsmanData]);

  // ============================================
  // معالج الأخطاء
  // ============================================
  const handleRetry = () => {
    loadCraftsmanData();
  };

  // استخدام craftsmanData و nearbyData في العرض
  const displayCraftsman = craftsmanData || craftsman;
  const displayNearby = nearbyData.length > 0 ? nearbyData : nearbyCraftsmen;

  return (
    <div style={{ 
      marginTop: '24px',
      fontFamily: "'Cairo', sans-serif",
      direction: lang === 'ar' ? 'rtl' : 'ltr',
    }}>
      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        
        @keyframes slideUp {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        
        @keyframes shimmer {
          0% { background-position: -200% 0; }
          100% { background-position: 200% 0; }
        }
        
        .animate-fade-in {
          animation: fadeIn 0.4s ease forwards;
        }
        
        .animate-slide-up {
          animation: slideUp 0.4s ease forwards;
        }
        
        .animate-spin {
          animation: spin 1s linear infinite;
        }
        
        .map-container {
          position: relative;
          overflow: hidden;
          transition: all 0.3s ease;
        }
        
        .map-container:hover {
          box-shadow: 0 8px 24px rgba(0,0,0,0.15);
        }
        
        .nearby-card {
          transition: all 0.3s ease;
        }
        
        .nearby-card:hover {
          transform: translateX(${lang === 'ar' ? '-4px' : '4px'});
          box-shadow: 0 4px 16px rgba(0,0,0,0.1);
        }
        
        .skeleton {
          background: linear-gradient(90deg, ${darkMode ? '#334155' : '#e2e8f0'} 25%, ${darkMode ? '#1e293b' : '#f1f5f9'} 50%, ${darkMode ? '#334155' : '#e2e8f0'} 75%);
          background-size: 200% 100%;
          animation: shimmer 1.5s infinite;
        }
        
        @media (max-width: 768px) {
          .map-iframe {
            height: 250px !important;
          }
        }
      `}</style>

      {/* رأس المكون مع أزرار التبديل */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: '16px',
        flexWrap: 'wrap',
        gap: '12px',
      }}>
        <h3 style={{
          fontSize: '1.2rem',
          fontWeight: 700,
          color: styles.textColor,
          margin: 0,
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
        }}>
          <MapPin size={20} style={{ color: '#ef4444' }} />
          {t.location}
          
          {distance && (
            <span style={{
              fontSize: '0.8rem',
              fontWeight: 600,
              color: '#059669',
              background: darkMode ? 'rgba(5,150,105,0.1)' : '#d1fae5',
              padding: '4px 10px',
              borderRadius: '20px',
              marginLeft: lang === 'ar' ? '0' : '8px',
              marginRight: lang === 'ar' ? '8px' : '0',
            }}>
              {formatDistanceWithLang(distance)} {t.away}
            </span>
          )}
        </h3>

        <ViewToggle
          activeView={activeView}
          setActiveView={setActiveView}
          t={t}
          darkMode={darkMode}
        />
      </div>

      {/* المحتوى حسب العرض المختار */}
      {activeView === 'map' ? (
        <MapView
          isLoading={isLoading}
          setIsLoading={setIsLoading}
          encodedLocation={encodedLocation}
          craftsman={displayCraftsman}
          fullLocation={locationData.fullLocation}
          distance={distance}
          formatDistanceFn={formatDistanceWithLang}
          t={t}
          darkMode={darkMode}
          styles={styles}
          error={error}
          onRetry={handleRetry}
        />
      ) : (
        <NearbyListView
          nearbyCraftsmen={displayNearby}
          craftsman={displayCraftsman}
          fullLocation={locationData.fullLocation}
          distance={distance}
          formatDistanceFn={formatDistanceWithLang}
          t={t}
          styles={styles}
          darkMode={darkMode}
          lang={lang}
          isLoading={isLoading || isLoadingNearby}
          onCraftsmanClick={onCraftsmanClick}
        />
      )}

      {/* تذييل المعلومات */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '6px',
        marginTop: '12px',
        fontSize: '0.8rem',
        color: styles.textSecondary,
        flexWrap: 'wrap',
      }}>
        <MapPin size={14} style={{ color: '#ef4444' }} />
        <span>{locationData.fullLocation}</span>
        
        {distance && (
          <>
            <span style={{ opacity: 0.5 }}>•</span>
            <Route size={14} style={{ color: '#059669' }} />
            <span style={{ color: '#059669', fontWeight: 600 }}>
              {formatDistanceWithLang(distance)} {t.away}
            </span>
          </>
        )}
        
        {displayCraftsman?.rating && (
          <>
            <span style={{ opacity: 0.5 }}>•</span>
            <Star size={14} style={{ color: '#f59e0b' }} fill="#f59e0b" />
            <span style={{ fontWeight: 600, color: '#f59e0b' }}>
              {displayCraftsman.rating}
            </span>
          </>
        )}

        {displayCraftsman?.phone && onPhoneClick && (
          <>
            <span style={{ opacity: 0.5 }}>•</span>
            <button
              onClick={() => onPhoneClick(displayCraftsman.phone)}
              style={{
                background: 'none',
                border: 'none',
                color: '#3b82f6',
                cursor: 'pointer',
                fontSize: '0.8rem',
                fontWeight: 600,
                fontFamily: "'Cairo', sans-serif",
                padding: '4px 8px',
              }}
            >
              📞 {t.contact}
            </button>
          </>
        )}
      </div>

      {/* إشعار التطوير */}
      {!displayCraftsman?.latitude && (
        <div style={{
          marginTop: '16px',
          padding: '12px 16px',
          borderRadius: '10px',
          background: darkMode ? 'rgba(59,130,246,0.1)' : '#eff6ff',
          border: '1px solid rgba(59,130,246,0.2)',
          fontSize: '0.8rem',
          color: '#3b82f6',
          display: 'flex',
          alignItems: 'center',
          gap: '6px',
        }}>
          <AlertCircle size={14} style={{ flexShrink: 0 }} />
          <span>
            {lang === 'ar' 
              ? 'لتفعيل حساب المسافات، أضف latitude و longitude للصنايعي.'
              : 'To enable distance calculation, add latitude & longitude to craftsman.'}
          </span>
        </div>
      )}
    </div>
  );
};

export default CraftsmanMap;