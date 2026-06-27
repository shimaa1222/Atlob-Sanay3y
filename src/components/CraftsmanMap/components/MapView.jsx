import React, { useState, useRef } from 'react';
import { MapPin, Navigation, ExternalLink, Loader } from 'lucide-react';
import { FullscreenButton } from './FullscreenButton';
import { CenterOnMyLocation } from './CenterOnMyLocation';

export const MapView = ({ 
  isLoading,
  setIsLoading,
  encodedLocation,
  craftsman,
  fullLocation,
  distance,
  formatDistance,
  t,
  darkMode,
  styles,
  userLocation,
  onCenterLocation,
}) => {
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [mapError, setMapError] = useState(false);
  const containerRef = useRef(null);

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      containerRef.current?.requestFullscreen?.();
      setIsFullscreen(true);
    } else {
      document.exitFullscreen?.();
      setIsFullscreen(false);
    }
  };

  const handleMapError = () => {
    setMapError(true);
    setIsLoading(false);
  };

  const handleMapLoad = () => {
    setIsLoading(false);
  };

  return (
    <div ref={containerRef} style={{ position: 'relative' }}>
      {isLoading ? (
        <div style={{
          borderRadius: '16px',
          height: isFullscreen ? '80vh' : '350px',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          background: darkMode ? '#1e293b' : '#f1f5f9',
          color: darkMode ? '#94a3b8' : '#64748b',
          gap: '12px',
        }}>
          <Loader size={40} className="animate-spin" />
          <span>{t.loading}</span>
        </div>
      ) : mapError ? (
        <div style={{
          borderRadius: '16px',
          height: isFullscreen ? '80vh' : '350px',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          background: darkMode ? '#1e293b' : '#fef2f2',
          color: '#ef4444',
          gap: '12px',
          padding: '20px',
          textAlign: 'center',
        }}>
          <MapPin size={48} style={{ opacity: 0.5 }} />
          <p style={{ fontWeight: 600 }}>{t.errorLoading}</p>
          <button
            onClick={() => {
              setMapError(false);
              setIsLoading(true);
              setTimeout(() => setIsLoading(false), 1000);
            }}
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
      ) : (
        <div style={{
          borderRadius: '16px',
          overflow: 'hidden',
          boxShadow: '0 4px 16px rgba(0,0,0,0.1)',
          border: `1px solid ${styles.borderColor}`,
          background: styles.mapBg,
        }}>
          <div style={{ position: 'relative' }}>
            <iframe
              title={`${craftsman?.name || ''} - ${fullLocation}`}
              aria-label={`خريطة توضح موقع ${craftsman?.name || 'الحرفي'}`}
              width="100%"
              height={isFullscreen ? '80vh' : '350px'}
              className="map-iframe"
              style={{ 
                border: 'none',
                display: 'block',
                filter: darkMode ? 'invert(0.9) hue-rotate(180deg)' : 'none',
                transition: 'height 0.3s ease',
              }}
              src={`https://maps.google.com/maps?q=${encodedLocation}&t=&z=14&ie=UTF8&iwloc=&output=embed`}
              allowFullScreen
              loading="lazy"
              onLoad={handleMapLoad}
              onError={handleMapError}
            />

            {/* أزرار التحكم في الخريطة */}
            <div style={{
              position: 'absolute',
              top: '12px',
              right: '12px',
              display: 'flex',
              flexDirection: 'column',
              gap: '8px',
              zIndex: 10,
            }}>
              <CenterOnMyLocation
                userLocation={userLocation}
                onCenter={onCenterLocation}
                t={t}
                darkMode={darkMode}
              />
              <FullscreenButton
                isFullscreen={isFullscreen}
                toggleFullscreen={toggleFullscreen}
                t={t}
                darkMode={darkMode}
              />
            </div>
          </div>

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