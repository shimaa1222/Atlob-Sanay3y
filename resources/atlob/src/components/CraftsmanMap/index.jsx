import React, { useState, useMemo, useCallback, useEffect } from 'react';
import { useTheme } from '../../context/ThemeContext';
import { MapPin, Navigation, Star, Route, AlertCircle } from 'lucide-react';

// Hooks
import { useLanguage } from './hooks/useLanguage';
import { useCraftsmanDistance } from './hooks/useCraftsmanDistance';
import { useNearbyCraftsmen } from './hooks/useNearbyCraftsmen';
import { useLocalStorage } from '../../hooks/useLocalStorage';

// Components
import { ViewToggle } from './components/ViewToggle';
import { MapView } from './components/MapView';
import { NearbyListView } from './components/NearbyListView';
import { CenterOnMyLocation } from './components/CenterOnMyLocation';
import { FullscreenButton } from './components/FullscreenButton';

// Utils
import { formatDistance, calculateDistance } from './utils/calculations';
import { getTranslations } from './utils/translations';
import { MAP_CONFIG, STYLE_CONSTANTS } from './utils/constants';

// Styles
import './styles/mapStyles.css';

const CraftsmanMap = ({ 
  craftsman, 
  nearbyCraftsmen = [], 
  userLocation = null,
  onLocationChange,
}) => {
  // Hooks
  const { darkMode } = useTheme();
  const { lang, toggleLanguage } = useLanguage();
  const [activeView, setActiveView] = useLocalStorage('craftsmanMapView', 'map');
  const [isLoading, setIsLoading] = useState(true);
  const [mapCenter, setMapCenter] = useState(userLocation);
  const [showNotification, setShowNotification] = useState(false);

  // Data
  const t = getTranslations(lang);
  const distance = useCraftsmanDistance(userLocation, craftsman);
  
  // Nearby craftsmen with filters
  const {
    nearbyCraftsmen: filteredNearby,
    isLoading: nearbyLoading,
    sortBy,
    radius,
    updateSort,
    updateRadius,
  } = useNearbyCraftsmen(nearbyCraftsmen, userLocation);

  // Computed
  const locationData = useMemo(() => {
    const location = craftsman?.city || craftsman?.location || MAP_CONFIG.DEFAULT_LOCATION;
    const fullLocation = craftsman?.district 
      ? `${craftsman.district}, ${craftsman.city}` 
      : location;
    return { location, fullLocation };
  }, [craftsman]);

  const styles = useMemo(() => ({
    cardBg: darkMode ? STYLE_CONSTANTS.COLORS.gray[800] : '#ffffff',
    textColor: darkMode ? STYLE_CONSTANTS.COLORS.gray[100] : STYLE_CONSTANTS.COLORS.gray[900],
    textSecondary: darkMode ? STYLE_CONSTANTS.COLORS.gray[400] : STYLE_CONSTANTS.COLORS.gray[500],
    borderColor: darkMode ? STYLE_CONSTANTS.COLORS.gray[700] : STYLE_CONSTANTS.COLORS.gray[200],
    mapBg: darkMode ? STYLE_CONSTANTS.COLORS.gray[800] : STYLE_CONSTANTS.COLORS.gray[100],
  }), [darkMode]);

  // Handlers
  const handleCenterLocation = useCallback(() => {
    if (userLocation) {
      setMapCenter(userLocation);
      if (onLocationChange) {
        onLocationChange(userLocation);
      }
    }
  }, [userLocation, onLocationChange]);

  const handleCopyLocation = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(locationData.fullLocation);
      setShowNotification(true);
      setTimeout(() => setShowNotification(false), 3000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  }, [locationData.fullLocation]);

  const encodedLocation = encodeURIComponent(locationData.fullLocation);

  // تحميل البيانات
  useEffect(() => {
    setIsLoading(true);
    const timer = setTimeout(() => setIsLoading(false), 1000);
    return () => clearTimeout(timer);
  }, [craftsman]);

  // تأثيرات للتفاعل مع الخريطة
  useEffect(() => {
    if (userLocation) {
      setMapCenter(userLocation);
    }
  }, [userLocation]);

  return (
    <div 
      className="craftsman-map"
      style={{ 
        marginTop: '24px',
        fontFamily: "'Cairo', sans-serif",
        direction: lang === 'ar' ? 'rtl' : 'ltr',
      }}
    >
      {/* الأنماط المضمنة */}
      <style>
        {`
          @import url('https://fonts.googleapis.com/css2?family=Cairo:wght@400;600;700&display=swap');
          
          .craftsman-map * {
            box-sizing: border-box;
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
            background: linear-gradient(90deg, 
              ${darkMode ? '#334155' : '#e2e8f0'} 25%, 
              ${darkMode ? '#1e293b' : '#f1f5f9'} 50%, 
              ${darkMode ? '#334155' : '#e2e8f0'} 75%
            );
            background-size: 200% 100%;
            animation: shimmer 1.5s infinite;
          }
          
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
          
          @media (max-width: 768px) {
            .map-iframe {
              height: 250px !important;
            }
          }
        `}
      </style>

      {/* رأس المكون */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: '16px',
        flexWrap: 'wrap',
        gap: '12px',
      }}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
          flexWrap: 'wrap',
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
                padding: '4px 12px',
                borderRadius: '20px',
              }}>
                {formatDistance(distance, lang)} {t.away}
              </span>
            )}
          </h3>
          
          {/* زر نسخ الموقع */}
          <button
            onClick={handleCopyLocation}
            style={{
              padding: '6px 12px',
              borderRadius: '8px',
              border: `1px solid ${styles.borderColor}`,
              background: 'transparent',
              color: styles.textSecondary,
              cursor: 'pointer',
              fontSize: '0.75rem',
              fontFamily: "'Cairo', sans-serif",
              transition: 'all 0.3s ease',
            }}
          >
            📋 {t.copyLocation}
          </button>
        </div>

        <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
          {/* زر تبديل اللغة */}
          <button
            onClick={toggleLanguage}
            style={{
              padding: '6px 12px',
              borderRadius: '8px',
              border: `1px solid ${styles.borderColor}`,
              background: 'transparent',
              color: styles.textSecondary,
              cursor: 'pointer',
              fontSize: '0.75rem',
              fontWeight: 600,
              fontFamily: "'Cairo', sans-serif",
              transition: 'all 0.3s ease',
            }}
          >
            {lang === 'ar' ? 'EN' : 'عربي'}
          </button>
          
          <ViewToggle
            activeView={activeView}
            setActiveView={setActiveView}
            t={t}
            darkMode={darkMode}
          />
        </div>
      </div>

      {/* إشعار النسخ */}
      {showNotification && (
        <div style={{
          position: 'fixed',
          bottom: '20px',
          left: '50%',
          transform: 'translateX(-50%)',
          padding: '12px 24px',
          borderRadius: '12px',
          background: '#059669',
          color: 'white',
          fontSize: '0.9rem',
          fontWeight: 600,
          boxShadow: '0 4px 12px rgba(0,0,0,0.2)',
          zIndex: 1000,
          animation: 'fadeIn 0.3s ease',
        }}>
          {t.locationCopied}
        </div>
      )}

      {/* المحتوى حسب العرض */}
      {activeView === 'map' ? (
        <MapView
          isLoading={isLoading}
          setIsLoading={setIsLoading}
          encodedLocation={encodedLocation}
          craftsman={craftsman}
          fullLocation={locationData.fullLocation}
          distance={distance}
          formatDistance={(dist) => formatDistance(dist, lang)}
          t={t}
          darkMode={darkMode}
          styles={styles}
          userLocation={userLocation}
          onCenterLocation={handleCenterLocation}
        />
      ) : (
        <NearbyListView
          nearbyCraftsmen={filteredNearby}
          craftsman={craftsman}
          fullLocation={locationData.fullLocation}
          userLocation={userLocation}
          distance={distance}
          sortBy={sortBy}
          radius={radius}
          onSortChange={updateSort}
          onRadiusChange={updateRadius}
          t={t}
          styles={styles}
          darkMode={darkMode}
          lang={lang}
          isLoading={nearbyLoading}
        />
      )}

      {/* تذييل المعلومات */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '8px',
        marginTop: '16px',
        padding: '12px 16px',
        fontSize: '0.8rem',
        color: styles.textSecondary,
        flexWrap: 'wrap',
        borderTop: `1px solid ${styles.borderColor}`,
      }}>
        <MapPin size={14} style={{ color: '#ef4444' }} />
        <span>{locationData.fullLocation}</span>
        
        {distance && (
          <>
            <span style={{ opacity: 0.5 }}>•</span>
            <Route size={14} style={{ color: '#059669' }} />
            <span style={{ color: '#059669', fontWeight: 600 }}>
              {formatDistance(distance, lang)} {t.away}
            </span>
          </>
        )}
        
        {craftsman?.rating && (
          <>
            <span style={{ opacity: 0.5 }}>•</span>
            <Star size={14} style={{ color: '#f59e0b' }} fill="#f59e0b" />
            <span style={{ fontWeight: 600, color: '#f59e0b' }}>
              {craftsman.rating}
            </span>
          </>
        )}

        {craftsman?.yearsExperience && (
          <>
            <span style={{ opacity: 0.5 }}>•</span>
            <span>{craftsman.yearsExperience} {t.years}</span>
          </>
        )}
      </div>

      {/* إشعار الإعدادات */}
      {!craftsman?.latitude && (
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
          gap: '8px',
        }}>
          <AlertCircle size={16} style={{ flexShrink: 0 }} />
          <span>
            {lang === 'ar' 
              ? '💡 لإضافة حساب المسافات والموقع المتقدم، أضف إحداثيات latitude و longitude للحرفي.'
              : '💡 To enable distance calculation and advanced location features, add latitude & longitude to the craftsman.'}
          </span>
        </div>
      )}

      {/* إشعار الموقع */}
      {userLocation && (
        <div style={{
          marginTop: '8px',
          padding: '8px 16px',
          borderRadius: '8px',
          background: darkMode ? 'rgba(5,150,105,0.1)' : '#d1fae5',
          fontSize: '0.75rem',
          color: '#059669',
          display: 'flex',
          alignItems: 'center',
          gap: '6px',
        }}>
          <Navigation size={12} />
          <span>
            {lang === 'ar' 
              ? '✅ تم تحديد موقعك بنجاح'
              : '✅ Your location has been detected'}
          </span>
        </div>
      )}
    </div>
  );
};

export default CraftsmanMap;