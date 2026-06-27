// src/components/CraftsmanCard.jsx
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useTheme } from '../context/ThemeContext';
import { 
  MapPin, Star, Briefcase, Calendar, 
  Phone, MessageCircle, ChevronRight,
  Wrench, Award, CheckCircle, Navigation
} from 'lucide-react';

const CraftsmanCard = ({ 
  craftsman, 
  variant = 'default', // 'default', 'compact', 'featured'
  showMap = false,
  onMapClick = null,
  onPhoneClick = null,
}) => {
  const { darkMode } = useTheme();
  const [lang] = useState(() => {
    return localStorage.getItem('language') || 'ar';
  });
  const [showFullBio, setShowFullBio] = useState(false);

  // ========== Helper Functions ==========
  const formatPrice = (price) => {
    if (!price) return '0';
    return price.toLocaleString();
  };

  const getInitials = (name) => {
    if (!name) return 'ح';
    const parts = name.split(' ');
    if (parts.length >= 2) {
      return `${parts[0][0]}${parts[1][0]}`;
    }
    return name[0] || 'ح';
  };

  const getStatusColor = (status) => {
    const colors = {
      available: '#059669',
      busy: '#f59e0b',
      offline: '#94a3b8',
    };
    return colors[status] || '#059669';
  };

  const getStatusLabel = (status) => {
    const labels = {
      available: lang === 'ar' ? 'متاح' : 'Available',
      busy: lang === 'ar' ? 'مشغول' : 'Busy',
      offline: lang === 'ar' ? 'غير متاح' : 'Offline',
    };
    return labels[status] || labels.available;
  };

  // ========== Translations ==========
  const t = {
    viewProfile: lang === 'ar' ? 'عرض الملف' : 'View Profile',
    bookNow: lang === 'ar' ? 'احجز الآن' : 'Book Now',
    contact: lang === 'ar' ? 'اتصل' : 'Call',
    message: lang === 'ar' ? 'راسل' : 'Message',
    completed: lang === 'ar' ? 'خدمة مكتملة' : 'Completed Jobs',
    reviews: lang === 'ar' ? 'تقييم' : 'Reviews',
    yearsExp: lang === 'ar' ? 'سنوات الخبرة' : 'Years Exp',
    egp: lang === 'ar' ? 'ج.م' : 'EGP',
    location: lang === 'ar' ? 'الموقع' : 'Location',
    showOnMap: lang === 'ar' ? 'عرض على الخريطة' : 'Show on Map',
    verified: lang === 'ar' ? 'موثق' : 'Verified',
    available: lang === 'ar' ? 'متاح الآن' : 'Available Now',
    perHour: lang === 'ar' ? 'ساعة' : 'hour',
    showMore: lang === 'ar' ? 'عرض المزيد' : 'Show More',
    showLess: lang === 'ar' ? 'عرض أقل' : 'Show Less',
  };

  // ========== Styles ==========
  const bgColor = darkMode ? '#1e293b' : '#ffffff';
  const textColor = darkMode ? '#f1f5f9' : '#0f172a';
  const textSecondary = darkMode ? '#94a3b8' : '#64748b';
  const borderColor = darkMode ? '#334155' : '#e2e8f0';
  const cardShadow = darkMode 
    ? '0 4px 16px rgba(0,0,0,0.3)'
    : '0 2px 12px rgba(0,0,0,0.06)';
  const hoverShadow = darkMode
    ? '0 8px 32px rgba(0,0,0,0.4)'
    : '0 8px 24px rgba(0,0,0,0.12)';

  // ========== Compact Variant ==========
  if (variant === 'compact') {
    return (
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
          padding: '12px 16px',
          background: bgColor,
          borderRadius: '12px',
          border: `1px solid ${borderColor}`,
          cursor: 'pointer',
          transition: 'all 0.3s ease',
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.transform = 'translateY(-2px)';
          e.currentTarget.style.boxShadow = hoverShadow;
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.transform = 'translateY(0)';
          e.currentTarget.style.boxShadow = 'none';
        }}
      >
        <div
          style={{
            width: '40px',
            height: '40px',
            borderRadius: '50%',
            background: 'linear-gradient(135deg, #3b82f6, #2563eb)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'white',
            fontWeight: 700,
            fontSize: '0.9rem',
            flexShrink: 0,
          }}
        >
          {getInitials(craftsman?.name)}
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontWeight: 600, color: textColor, fontSize: '0.9rem' }}>
            {craftsman?.name}
          </div>
          <div style={{ fontSize: '0.75rem', color: textSecondary, display: 'flex', alignItems: 'center', gap: '6px' }}>
            <Briefcase size={12} />
            {craftsman?.profession || craftsman?.job}
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span style={{ display: 'flex', alignItems: 'center', gap: '3px', fontSize: '0.75rem', color: '#f59e0b' }}>
            <Star size={12} fill="#f59e0b" />
            {craftsman?.rating || 'جديد'}
          </span>
          <ChevronRight size={16} style={{ color: textSecondary }} />
        </div>
      </div>
    );
  }

  // ========== Featured Variant ==========
  if (variant === 'featured') {
    return (
      <div
        style={{
          background: bgColor,
          borderRadius: '16px',
          overflow: 'hidden',
          border: `2px solid ${borderColor}`,
          boxShadow: cardShadow,
          transition: 'all 0.3s ease',
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.transform = 'translateY(-4px)';
          e.currentTarget.style.boxShadow = hoverShadow;
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.transform = 'translateY(0)';
          e.currentTarget.style.boxShadow = cardShadow;
        }}
      >
        {/* Header with gradient */}
        <div
          style={{
            height: '100px',
            background: 'linear-gradient(135deg, #2563eb, #1d4ed8, #7c3aed)',
            position: 'relative',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <div
            style={{
              position: 'absolute',
              top: '12px',
              right: '12px',
              background: 'rgba(255,255,255,0.9)',
              padding: '4px 12px',
              borderRadius: '20px',
              fontSize: '0.75rem',
              fontWeight: 700,
              color: '#f59e0b',
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
            }}
          >
            <Star size={14} fill="#f59e0b" />
            {craftsman?.rating || 'جديد'}
          </div>
          
          <div
            style={{
              width: '72px',
              height: '72px',
              borderRadius: '50%',
              background: 'rgba(255,255,255,0.2)',
              border: '3px solid rgba(255,255,255,0.4)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'white',
              fontWeight: 700,
              fontSize: '1.8rem',
            }}
          >
            {getInitials(craftsman?.name)}
          </div>

          {/* Verified Badge */}
          <div
            style={{
              position: 'absolute',
              bottom: '-12px',
              left: '50%',
              transform: 'translateX(-50%)',
              background: '#059669',
              color: 'white',
              padding: '4px 16px',
              borderRadius: '20px',
              fontSize: '0.7rem',
              fontWeight: 600,
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
            }}
          >
            <CheckCircle size={12} />
            {t.verified}
          </div>
        </div>

        {/* Content */}
        <div style={{ padding: '20px 16px 16px' }}>
          <div style={{ textAlign: 'center', marginBottom: '12px' }}>
            <h3 style={{ fontWeight: 700, color: textColor, fontSize: '1.05rem', marginBottom: '2px' }}>
              {craftsman?.name}
            </h3>
            <p style={{ fontSize: '0.85rem', color: '#3b82f6', fontWeight: 500 }}>
              {craftsman?.profession || craftsman?.job}
            </p>
          </div>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(3, 1fr)',
              gap: '8px',
              padding: '8px 0',
              borderTop: `1px solid ${borderColor}`,
              borderBottom: `1px solid ${borderColor}`,
              marginBottom: '12px',
            }}
          >
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '1rem', fontWeight: 700, color: '#059669' }}>
                {craftsman?.hourly_rate || craftsman?.price || 0} {t.egp}
              </div>
              <div style={{ fontSize: '0.65rem', color: textSecondary }}>{t.perHour}</div>
            </div>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '1rem', fontWeight: 700, color: textColor }}>
                {craftsman?.completed_jobs || craftsman?.completed || 0}
              </div>
              <div style={{ fontSize: '0.65rem', color: textSecondary }}>{t.completed}</div>
            </div>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '1rem', fontWeight: 700, color: textColor }}>
                {craftsman?.years_experience || craftsman?.yearsExp || 0}
              </div>
              <div style={{ fontSize: '0.65rem', color: textSecondary }}>{t.yearsExp}</div>
            </div>
          </div>

          <div style={{ display: 'flex', gap: '8px' }}>
            <Link
              to={`/craftsman/${craftsman?.id}`}
              style={{
                flex: 1,
                padding: '10px',
                borderRadius: '10px',
                background: darkMode ? 'rgba(59,130,246,0.15)' : '#eff6ff',
                color: '#3b82f6',
                textDecoration: 'none',
                textAlign: 'center',
                fontWeight: 600,
                fontSize: '0.85rem',
                transition: 'all 0.3s ease',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = '#3b82f6';
                e.currentTarget.style.color = 'white';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = darkMode ? 'rgba(59,130,246,0.15)' : '#eff6ff';
                e.currentTarget.style.color = '#3b82f6';
              }}
            >
              {t.viewProfile}
            </Link>
            <Link
              to={`/booking/${craftsman?.id}`}
              style={{
                flex: 1,
                padding: '10px',
                borderRadius: '10px',
                background: 'linear-gradient(135deg, #2563eb, #1d4ed8)',
                color: 'white',
                textDecoration: 'none',
                textAlign: 'center',
                fontWeight: 600,
                fontSize: '0.85rem',
                transition: 'all 0.3s ease',
                boxShadow: '0 4px 12px rgba(37,99,235,0.3)',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'scale(1.02)';
                e.currentTarget.style.boxShadow = '0 6px 20px rgba(37,99,235,0.4)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'scale(1)';
                e.currentTarget.style.boxShadow = '0 4px 12px rgba(37,99,235,0.3)';
              }}
            >
              {t.bookNow}
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // ========== Default Variant ==========
  return (
    <div
      style={{
        background: bgColor,
        borderRadius: '16px',
        overflow: 'hidden',
        border: `1px solid ${borderColor}`,
        boxShadow: cardShadow,
        transition: 'all 0.3s ease',
        direction: lang === 'ar' ? 'rtl' : 'ltr',
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.transform = 'translateY(-4px)';
        e.currentTarget.style.boxShadow = hoverShadow;
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = 'translateY(0)';
        e.currentTarget.style.boxShadow = cardShadow;
      }}
    >
      {/* ===== Header ===== */}
      <div
        style={{
          height: '120px',
          background: 'linear-gradient(135deg, #2563eb, #1d4ed8, #7c3aed)',
          position: 'relative',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '0 16px',
        }}
      >
        {/* Rating Badge */}
        <div
          style={{
            position: 'absolute',
            top: '12px',
            [lang === 'ar' ? 'right' : 'left']: '12px',
            background: 'rgba(255,255,255,0.95)',
            padding: '4px 12px',
            borderRadius: '20px',
            fontSize: '0.8rem',
            fontWeight: 700,
            color: '#f59e0b',
            display: 'flex',
            alignItems: 'center',
            gap: '4px',
          }}
        >
          <Star size={14} fill="#f59e0b" />
          {craftsman?.rating || 'جديد'}
        </div>

        {/* Status Badge */}
        <div
          style={{
            position: 'absolute',
            top: '12px',
            [lang === 'ar' ? 'left' : 'right']: '12px',
            background: 'rgba(0,0,0,0.5)',
            backdropFilter: 'blur(10px)',
            padding: '4px 12px',
            borderRadius: '20px',
            fontSize: '0.7rem',
            fontWeight: 600,
            color: getStatusColor(craftsman?.status),
          }}
        >
          ● {getStatusLabel(craftsman?.status)}
        </div>

        {/* Avatar */}
        <div
          style={{
            width: '64px',
            height: '64px',
            borderRadius: '50%',
            background: 'rgba(255,255,255,0.2)',
            border: '3px solid rgba(255,255,255,0.4)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'white',
            fontWeight: 700,
            fontSize: '1.6rem',
          }}
        >
          {getInitials(craftsman?.name)}
        </div>

        {/* Show on Map Button */}
        {showMap && onMapClick && (
          <button
            onClick={() => onMapClick(craftsman)}
            style={{
              position: 'absolute',
              bottom: '-12px',
              [lang === 'ar' ? 'right' : 'left']: '12px',
              padding: '6px 14px',
              borderRadius: '20px',
              border: 'none',
              background: 'white',
              color: '#2563eb',
              cursor: 'pointer',
              fontSize: '0.7rem',
              fontWeight: 600,
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
              boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
              transition: 'all 0.3s ease',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'scale(1.05)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'scale(1)';
            }}
          >
            <Navigation size={12} />
            {t.showOnMap}
          </button>
        )}

        {/* Call Button */}
        {craftsman?.phone && onPhoneClick && (
          <button
            onClick={() => onPhoneClick(craftsman.phone)}
            style={{
              position: 'absolute',
              bottom: '-12px',
              [lang === 'ar' ? 'left' : 'right']: '12px',
              padding: '6px 14px',
              borderRadius: '20px',
              border: 'none',
              background: '#059669',
              color: 'white',
              cursor: 'pointer',
              fontSize: '0.7rem',
              fontWeight: 600,
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
              boxShadow: '0 4px 12px rgba(5,150,105,0.3)',
              transition: 'all 0.3s ease',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'scale(1.05)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'scale(1)';
            }}
          >
            <Phone size={12} />
            {t.contact}
          </button>
        )}
      </div>

      {/* ===== Body ===== */}
      <div style={{ padding: '20px 16px 16px' }}>
        {/* Name & Profession */}
        <div style={{ marginBottom: '8px' }}>
          <h3 style={{ fontWeight: 700, color: textColor, fontSize: '1.05rem', marginBottom: '2px' }}>
            {craftsman?.name}
          </h3>
          <p style={{ fontSize: '0.85rem', color: '#3b82f6', fontWeight: 500, display: 'flex', alignItems: 'center', gap: '6px' }}>
            <Wrench size={14} />
            {craftsman?.profession || craftsman?.job}
          </p>
        </div>

        {/* Location */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.8rem', color: textSecondary, marginBottom: '8px' }}>
          <MapPin size={14} style={{ color: '#ef4444' }} />
          <span>{craftsman?.city || craftsman?.location}</span>
          {craftsman?.district && <span> - {craftsman.district}</span>}
        </div>

        {/* Bio */}
        {craftsman?.bio && (
          <div style={{ marginBottom: '12px' }}>
            <p
              style={{
                fontSize: '0.8rem',
                color: textSecondary,
                lineHeight: 1.6,
                display: '-webkit-box',
                WebkitLineClamp: showFullBio ? 'unset' : 2,
                WebkitBoxOrient: 'vertical',
                overflow: 'hidden',
              }}
            >
              {craftsman.bio}
            </p>
            {craftsman.bio.length > 100 && (
              <button
                onClick={() => setShowFullBio(!showFullBio)}
                style={{
                  background: 'none',
                  border: 'none',
                  color: '#3b82f6',
                  cursor: 'pointer',
                  fontSize: '0.75rem',
                  fontWeight: 600,
                  padding: '4px 0',
                }}
              >
                {showFullBio ? t.showLess : t.showMore}
              </button>
            )}
          </div>
        )}

        {/* Skills */}
        {craftsman?.skills && craftsman.skills.length > 0 && (
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px', marginBottom: '12px' }}>
            {craftsman.skills.slice(0, 3).map((skill, i) => (
              <span
                key={i}
                style={{
                  padding: '2px 10px',
                  borderRadius: '12px',
                  background: darkMode ? 'rgba(59,130,246,0.1)' : '#eff6ff',
                  color: '#3b82f6',
                  fontSize: '0.65rem',
                  fontWeight: 500,
                }}
              >
                {skill}
              </span>
            ))}
            {craftsman.skills.length > 3 && (
              <span
                style={{
                  padding: '2px 10px',
                  borderRadius: '12px',
                  background: darkMode ? '#334155' : '#f1f5f9',
                  color: textSecondary,
                  fontSize: '0.65rem',
                }}
              >
                +{craftsman.skills.length - 3}
              </span>
            )}
          </div>
        )}

        {/* Stats */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(80px, 1fr))',
            gap: '8px',
            padding: '8px 0',
            borderTop: `1px solid ${borderColor}`,
            borderBottom: `1px solid ${borderColor}`,
            marginBottom: '12px',
          }}
        >
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '0.9rem', fontWeight: 700, color: '#059669' }}>
              {craftsman?.hourly_rate || craftsman?.price || 0} {t.egp}
            </div>
            <div style={{ fontSize: '0.65rem', color: textSecondary }}>{t.perHour}</div>
          </div>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '0.9rem', fontWeight: 700, color: textColor }}>
              {craftsman?.completed_jobs || craftsman?.completed || 0}
            </div>
            <div style={{ fontSize: '0.65rem', color: textSecondary }}>{t.completed}</div>
          </div>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '0.9rem', fontWeight: 700, color: textColor }}>
              {craftsman?.years_experience || craftsman?.yearsExp || 0}
            </div>
            <div style={{ fontSize: '0.65rem', color: textSecondary }}>{t.yearsExp}</div>
          </div>
          {craftsman?.reviews_count && (
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '0.9rem', fontWeight: 700, color: textColor }}>
                {craftsman.reviews_count}
              </div>
              <div style={{ fontSize: '0.65rem', color: textSecondary }}>{t.reviews}</div>
            </div>
          )}
        </div>

        {/* Actions */}
        <div style={{ display: 'flex', gap: '8px' }}>
          <Link
            to={`/craftsman/${craftsman?.id}`}
            style={{
              flex: 1,
              padding: '10px',
              borderRadius: '10px',
              background: darkMode ? 'rgba(59,130,246,0.15)' : '#eff6ff',
              color: '#3b82f6',
              textDecoration: 'none',
              textAlign: 'center',
              fontWeight: 600,
              fontSize: '0.85rem',
              transition: 'all 0.3s ease',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = '#3b82f6';
              e.currentTarget.style.color = 'white';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = darkMode ? 'rgba(59,130,246,0.15)' : '#eff6ff';
              e.currentTarget.style.color = '#3b82f6';
            }}
          >
            {t.viewProfile}
          </Link>
          <Link
            to={`/booking/${craftsman?.id}`}
            style={{
              flex: 1,
              padding: '10px',
              borderRadius: '10px',
              background: 'linear-gradient(135deg, #2563eb, #1d4ed8)',
              color: 'white',
              textDecoration: 'none',
              textAlign: 'center',
              fontWeight: 600,
              fontSize: '0.85rem',
              transition: 'all 0.3s ease',
              boxShadow: '0 4px 12px rgba(37,99,235,0.3)',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'scale(1.02)';
              e.currentTarget.style.boxShadow = '0 6px 20px rgba(37,99,235,0.4)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'scale(1)';
              e.currentTarget.style.boxShadow = '0 4px 12px rgba(37,99,235,0.3)';
            }}
          >
            {t.bookNow}
          </Link>
        </div>

        {/* WhatsApp Button (optional) */}
        {craftsman?.whatsapp && (
          <a
            href={`https://wa.me/${craftsman.whatsapp}`}
            target="_blank"
            rel="noopener noreferrer"
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '6px',
              marginTop: '8px',
              padding: '8px',
              borderRadius: '10px',
              background: '#25D366',
              color: 'white',
              textDecoration: 'none',
              fontSize: '0.8rem',
              fontWeight: 600,
              transition: 'all 0.3s ease',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'scale(1.02)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'scale(1)';
            }}
          >
            <MessageCircle size={16} />
            {t.message}
          </a>
        )}
      </div>
    </div>
  );
};

export default CraftsmanCard;