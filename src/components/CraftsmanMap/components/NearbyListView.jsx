// src/components/NearbyListView.jsx
import React, { useState } from 'react';
import { 
  MapPin, Wrench, Route, ChevronRight, Star, 
  Clock, Phone, Award, Navigation, Users, Loader 
} from 'lucide-react';
// ✅ تأكد من وجود Users و Loader في الاستيراد

import { calculateDistance, formatDistance, estimateTravelTime } from '../../../utils/location';
// ✅ تأكد من استيراد calculateDistance
import React, { useState } from 'react';
import { 
  MapPin, Wrench, Route, ChevronRight, Star, 
  Clock, Phone, Award, Navigation 
} from 'lucide-react';
import { estimateTravelTime, formatDistance } from '../utils/calculations';
import { FilterControls } from './FilterControls';

export const NearbyListView = ({ 
  nearbyCraftsmen,
  craftsman,
  fullLocation,
  userLocation,
  distance,
  sortBy,
  radius,
  onSortChange,
  onRadiusChange,
  t,
  styles,
  darkMode,
  lang,
  isLoading,
}) => {
  const [showAll, setShowAll] = useState(false);
  const displayCount = showAll ? nearbyCraftsmen.length : 5;

  const getEstimatedTime = (craftsmanLocation) => {
    if (!userLocation || !craftsmanLocation?.latitude) return null;
    const dist = calculateDistance(
      userLocation.latitude,
      userLocation.longitude,
      craftsmanLocation.latitude,
      craftsmanLocation.longitude
    );
    return estimateTravelTime(dist);
  };

  const handleContact = (phone) => {
    if (phone) {
      window.location.href = `tel:${phone}`;
    }
  };

  return (
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
        <span style={{
          fontSize: '0.75rem',
          background: darkMode ? '#334155' : '#e2e8f0',
          padding: '2px 10px',
          borderRadius: '12px',
          color: styles.textSecondary,
        }}>
          {nearbyCraftsmen.length}
        </span>
      </h4>

      {/* عناصر التحكم في الفلترة */}
      <FilterControls
        sortBy={sortBy}
        radius={radius}
        onSortChange={onSortChange}
        onRadiusChange={onRadiusChange}
        t={t}
        darkMode={darkMode}
      />

      {isLoading ? (
        <div style={{
          textAlign: 'center',
          padding: '40px 20px',
          color: styles.textSecondary,
        }}>
          <Loader size={32} className="animate-spin" />
          <p>{t.loading}</p>
        </div>
      ) : nearbyCraftsmen.length > 0 ? (
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          gap: '10px',
          maxHeight: '500px',
          overflowY: 'auto',
          paddingRight: lang === 'ar' ? '0' : '4px',
          paddingLeft: lang === 'ar' ? '4px' : '0',
        }}>
          {/* الحرفي الحالي */}
          <div className="nearby-card animate-slide-up" style={{
            background: styles.cardBg,
            borderRadius: '14px',
            padding: '16px',
            border: '2px solid #3b82f6',
            display: 'flex',
            alignItems: 'center',
            gap: '14px',
            cursor: 'pointer',
          }}>
            <div style={{
              width: '52px',
              height: '52px',
              borderRadius: '12px',
              background: 'linear-gradient(135deg, #3b82f6, #2563eb)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
            }}>
              <MapPin size={26} color="white" />
            </div>
            
            <div style={{ flex: 1 }}>
              <div style={{
                fontWeight: 700,
                fontSize: '0.95rem',
                color: styles.textColor,
                marginBottom: '4px',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                flexWrap: 'wrap',
              }}>
                {craftsman?.name}
                <span style={{
                  fontSize: '0.7rem',
                  background: '#3b82f6',
                  color: 'white',
                  padding: '2px 10px',
                  borderRadius: '10px',
                }}>
                  {t.current}
                </span>
                {craftsman?.rating && (
                  <span style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '3px',
                    fontSize: '0.8rem',
                    color: '#f59e0b',
                  }}>
                    <Star size={14} fill="#f59e0b" />
                    {craftsman.rating}
                  </span>
                )}
              </div>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                fontSize: '0.8rem',
                color: styles.textSecondary,
                flexWrap: 'wrap',
              }}>
                <span>📍 {fullLocation}</span>
                {distance && (
                  <span style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px',
                    color: '#059669',
                    fontWeight: 600,
                  }}>
                    <Route size={12} />
                    {formatDistance(distance, lang)}
                  </span>
                )}
                {craftsman?.yearsExperience && (
                  <span style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px',
                  }}>
                    <Award size={12} />
                    {craftsman.yearsExperience} {t.years}
                  </span>
                )}
              </div>
            </div>

            {craftsman?.phone && (
              <button
                onClick={() => handleContact(craftsman.phone)}
                style={{
                  padding: '8px 12px',
                  borderRadius: '10px',
                  border: 'none',
                  background: '#059669',
                  color: 'white',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px',
                  fontSize: '0.8rem',
                  fontWeight: 600,
                  fontFamily: "'Cairo', sans-serif",
                }}
              >
                <Phone size={14} />
                {t.contact}
              </button>
            )}
          </div>

          {/* الحرفيين القريبين */}
          {nearbyCraftsmen
            .filter(c => c.id !== craftsman?.id)
            .slice(0, displayCount)
            .map((nearby, index) => {
              const dist = userLocation && nearby?.latitude
                ? calculateDistance(
                    userLocation.latitude,
                    userLocation.longitude,
                    nearby.latitude,
                    nearby.longitude
                  )
                : null;
              const estTime = getEstimatedTime(nearby);

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
                  onClick={() => {
                    // التنقل إلى صفحة الحرفي
                    window.location.href = `/craftsman/${nearby.id}`;
                  }}
                >
                  <div style={{
                    width: '52px',
                    height: '52px',
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
                      width: '22px',
                      height: '22px',
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
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                      flexWrap: 'wrap',
                    }}>
                      {nearby.name}
                      {nearby.rating && (
                        <span style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '3px',
                          fontSize: '0.75rem',
                          color: '#f59e0b',
                        }}>
                          <Star size={12} fill="#f59e0b" />
                          {nearby.rating}
                        </span>
                      )}
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
                          {formatDistance(dist, lang)}
                        </span>
                      )}
                      {estTime && (
                        <span style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '4px',
                          color: '#3b82f6',
                        }}>
                          <Clock size={12} />
                          {estTime} {t.minutes}
                        </span>
                      )}
                      {nearby.yearsExperience && (
                        <span style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '4px',
                        }}>
                          <Award size={12} />
                          {nearby.yearsExperience}y
                        </span>
                      )}
                    </div>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    {nearby.phone && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleContact(nearby.phone);
                        }}
                        style={{
                          padding: '6px 10px',
                          borderRadius: '8px',
                          border: 'none',
                          background: darkMode ? '#334155' : '#f1f5f9',
                          color: styles.textColor,
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '4px',
                          fontSize: '0.75rem',
                          fontFamily: "'Cairo', sans-serif",
                        }}
                      >
                        <Phone size={12} />
                      </button>
                    )}
                    <ChevronRight size={20} style={{ color: styles.textSecondary, flexShrink: 0 }} />
                  </div>
                </div>
              );
            })}
          
          {/* زر عرض المزيد */}
          {nearbyCraftsmen.length > 5 && (
            <button
              onClick={() => setShowAll(!showAll)}
              style={{
                padding: '10px',
                borderRadius: '10px',
                border: `1px solid ${styles.borderColor}`,
                background: 'transparent',
                color: '#3b82f6',
                cursor: 'pointer',
                fontWeight: 600,
                fontFamily: "'Cairo', sans-serif",
                transition: 'all 0.3s ease',
                marginTop: '4px',
              }}
            >
              {showAll ? t.showLess : t.showMore}
            </button>
          )}
        </div>
      ) : (
        <div style={{
          textAlign: 'center',
          padding: '60px 20px',
          color: styles.textSecondary,
          background: styles.cardBg,
          borderRadius: '14px',
          border: `1px solid ${styles.borderColor}`,
        }}>
          <MapPin size={48} style={{ opacity: 0.3, marginBottom: '12px' }} />
          <p style={{ fontSize: '0.95rem', marginBottom: '8px' }}>{t.noNearby}</p>
          <p style={{ fontSize: '0.8rem', opacity: 0.7 }}>
            {lang === 'ar' ? 'جرب توسيع نطاق البحث' : 'Try expanding your search radius'}
          </p>
        </div>
      )}
    </div>
  );
};