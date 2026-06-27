// src/components/Reviews/AdvancedReviewForm.jsx
import React, { useState } from 'react';
import { useTheme } from '../../context/ThemeContext';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';
import { Star, X, Loader, AlertCircle, CheckCircle } from 'lucide-react';

const AdvancedReviewForm = ({ 
  craftsmanId, 
  bookingId, 
  craftsmanName,
  onSubmit,
  onSuccess, 
  onError, 
  onCancel 
}) => {
  const { darkMode } = useTheme();
  const { user } = useAuth();
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [comment, setComment] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  // ========== Language ==========
  const [lang] = useState(() => {
    return localStorage.getItem('language') || 'ar';
  });

  // ========== Translations ==========
  const t = {
    title: lang === 'ar' ? 'أضف تقييمك' : 'Add Your Review',
    ratingLabel: lang === 'ar' ? 'التقييم' : 'Rating',
    commentLabel: lang === 'ar' ? 'تعليقك' : 'Your Comment',
    commentPlaceholder: lang === 'ar' 
      ? 'اكتب تجربتك مع الحرفي...' 
      : 'Write your experience with the craftsman...',
    submit: lang === 'ar' ? 'إرسال التقييم' : 'Submit Review',
    cancel: lang === 'ar' ? 'إلغاء' : 'Cancel',
    successMessage: lang === 'ar' 
      ? '✅ تم إضافة تقييمك بنجاح!' 
      : '✅ Your review was added successfully!',
    errorMessage: lang === 'ar' 
      ? '❌ حدث خطأ في إضافة التقييم' 
      : '❌ Error adding review',
    selectRating: lang === 'ar' 
      ? 'اختر التقييم' 
      : 'Select rating',
  };

  // ========== Rating Labels ==========
  const ratingLabels = {
    1: lang === 'ar' ? 'سيء جداً' : 'Very Poor',
    2: lang === 'ar' ? 'سيء' : 'Poor',
    3: lang === 'ar' ? 'متوسط' : 'Average',
    4: lang === 'ar' ? 'جيد' : 'Good',
    5: lang === 'ar' ? 'ممتاز' : 'Excellent',
  };

  // ========== Submit Handler ==========
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // ✅ التحقق من التقييم
    if (rating === 0) {
      setError(lang === 'ar' ? 'يرجى اختيار التقييم' : 'Please select a rating');
      return;
    }

    // ✅ التحقق من التعليق
    if (!comment.trim()) {
      setError(lang === 'ar' ? 'يرجى كتابة تعليق' : 'Please write a comment');
      return;
    }

    setLoading(true);
    setError('');

    try {
      // ✅ إذا كان هناك onSubmit من الخارج
      if (onSubmit) {
        onSubmit({
          rating,
          comment: comment.trim(),
          craftsman_id: craftsmanId,
          booking_id: bookingId || null,
        });
        setSuccess(true);
        setLoading(false);
        if (onSuccess) {
          setTimeout(() => onSuccess({ rating, comment: comment.trim() }), 500);
        }
        return;
      }

      // ✅ استخدام API لإضافة التقييم
      const reviewData = {
        rating: rating,
        comment: comment.trim(),
        craftsman_id: craftsmanId,
        booking_id: bookingId || null,
      };

      // ✅ استدعاء API
      if (bookingId) {
        await api.addReview(bookingId, reviewData);
      } else {
        await api.addReview(craftsmanId, reviewData);
      }

      setSuccess(true);
      setLoading(false);

      // ✅ استدعاء onSuccess بعد 1.5 ثانية
      setTimeout(() => {
        if (onSuccess) {
          onSuccess({
            rating,
            comment: comment.trim(),
            client_name: user?.name || 'عميل',
            created_at: new Date().toISOString(),
          });
        }
      }, 1500);

    } catch (error) {
      console.error('❌ Review error:', error);
      setError(error.message || t.errorMessage);
      setLoading(false);
      if (onError) onError(error);
    }
  };

  // ========== Styles ==========
  const bgColor = darkMode ? '#1e293b' : '#ffffff';
  const textColor = darkMode ? '#f1f5f9' : '#0f172a';
  const textSecondary = darkMode ? '#94a3b8' : '#64748b';
  const borderColor = darkMode ? '#334155' : '#e2e8f0';
  const inputBg = darkMode ? '#0f172a' : '#ffffff';

  return (
    <div style={{
      background: bgColor,
      borderRadius: '16px',
      padding: '24px',
      border: `1px solid ${borderColor}`,
      fontFamily: "'Cairo', sans-serif",
      direction: lang === 'ar' ? 'rtl' : 'ltr',
      marginBottom: '20px',
    }}>
      {/* ===== Header ===== */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '20px',
      }}>
        <h3 style={{
          fontSize: '1.1rem',
          fontWeight: 700,
          color: textColor,
          margin: 0,
        }}>
          {craftsmanName ? `⭐ ${t.title} - ${craftsmanName}` : t.title}
        </h3>
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            style={{
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              color: textSecondary,
              padding: '4px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              transition: 'all 0.3s ease',
            }}
            onMouseEnter={(e) => e.currentTarget.style.color = '#ef4444'}
            onMouseLeave={(e) => e.currentTarget.style.color = textSecondary}
          >
            <X size={20} />
          </button>
        )}
      </div>

      {/* ===== Success State ===== */}
      {success ? (
        <div style={{
          textAlign: 'center',
          padding: '40px 20px',
        }}>
          <CheckCircle size={48} style={{ color: '#059669', marginBottom: '16px' }} />
          <p style={{ fontSize: '1.1rem', fontWeight: 600, color: '#059669' }}>
            {t.successMessage}
          </p>
        </div>
      ) : (
        <form onSubmit={handleSubmit}>
          {/* ===== Rating ===== */}
          <div style={{ marginBottom: '20px' }}>
            <label style={{
              display: 'block',
              fontWeight: 600,
              color: textColor,
              marginBottom: '8px',
            }}>
              {t.ratingLabel}
            </label>
            <div style={{
              display: 'flex',
              gap: '8px',
              alignItems: 'center',
              flexWrap: 'wrap',
            }}>
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onClick={() => setRating(star)}
                  onMouseEnter={() => setHoverRating(star)}
                  onMouseLeave={() => setHoverRating(0)}
                  style={{
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    padding: '4px',
                    fontSize: '2rem',
                    transition: 'all 0.3s ease',
                    transform: (hoverRating || rating) >= star ? 'scale(1.15)' : 'scale(1)',
                  }}
                >
                  <Star
                    size={32}
                    fill={(hoverRating || rating) >= star ? '#f59e0b' : 'none'}
                    color={(hoverRating || rating) >= star ? '#f59e0b' : '#cbd5e1'}
                    style={{
                      transition: 'all 0.3s ease',
                    }}
                  />
                </button>
              ))}
              <span style={{
                fontSize: '0.9rem',
                color: textSecondary,
                marginLeft: '8px',
                minWidth: '60px',
              }}>
                {(hoverRating || rating) > 0 
                  ? ratingLabels[hoverRating || rating] 
                  : t.selectRating}
              </span>
            </div>
          </div>

          {/* ===== Comment ===== */}
          <div style={{ marginBottom: '20px' }}>
            <label style={{
              display: 'block',
              fontWeight: 600,
              color: textColor,
              marginBottom: '8px',
            }}>
              {t.commentLabel}
            </label>
            <textarea
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder={t.commentPlaceholder}
              rows="4"
              style={{
                width: '100%',
                padding: '12px 16px',
                border: `2px solid ${borderColor}`,
                borderRadius: '12px',
                fontSize: '0.95rem',
                background: inputBg,
                color: textColor,
                fontFamily: "'Cairo', sans-serif",
                textAlign: lang === 'ar' ? 'right' : 'left',
                resize: 'vertical',
                minHeight: '80px',
                transition: 'all 0.3s ease',
              }}
              onFocus={(e) => e.target.style.borderColor = '#3b82f6'}
              onBlur={(e) => e.target.style.borderColor = borderColor}
            />
          </div>

          {/* ===== Error ===== */}
          {error && (
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              padding: '10px 14px',
              borderRadius: '10px',
              background: 'rgba(220,38,38,0.1)',
              color: '#dc2626',
              marginBottom: '16px',
              fontSize: '0.85rem',
            }}>
              <AlertCircle size={16} />
              {error}
            </div>
          )}

          {/* ===== Actions ===== */}
          <div style={{
            display: 'flex',
            gap: '12px',
            justifyContent: 'flex-end',
            flexWrap: 'wrap',
          }}>
            {onCancel && (
              <button
                type="button"
                onClick={onCancel}
                style={{
                  padding: '10px 24px',
                  borderRadius: '10px',
                  border: `2px solid ${borderColor}`,
                  background: 'transparent',
                  color: textColor,
                  cursor: 'pointer',
                  fontWeight: 600,
                  fontSize: '0.9rem',
                  fontFamily: "'Cairo', sans-serif",
                  transition: 'all 0.3s ease',
                }}
                onMouseEnter={(e) => e.currentTarget.style.background = darkMode ? '#334155' : '#f1f5f9'}
                onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
              >
                {t.cancel}
              </button>
            )}
            <button
              type="submit"
              disabled={loading}
              style={{
                padding: '10px 28px',
                borderRadius: '10px',
                border: 'none',
                background: loading ? '#94a3b8' : 'linear-gradient(135deg, #2563eb, #1d4ed8)',
                color: 'white',
                cursor: loading ? 'not-allowed' : 'pointer',
                fontWeight: 700,
                fontSize: '0.9rem',
                fontFamily: "'Cairo', sans-serif",
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                transition: 'all 0.3s ease',
                opacity: loading ? 0.7 : 1,
                boxShadow: loading ? 'none' : '0 4px 16px rgba(37,99,235,0.3)',
              }}
              onMouseEnter={(e) => {
                if (!loading) {
                  e.currentTarget.style.transform = 'scale(1.02)';
                  e.currentTarget.style.boxShadow = '0 6px 20px rgba(37,99,235,0.4)';
                }
              }}
              onMouseLeave={(e) => {
                if (!loading) {
                  e.currentTarget.style.transform = 'scale(1)';
                  e.currentTarget.style.boxShadow = '0 4px 16px rgba(37,99,235,0.3)';
                }
              }}
            >
              {loading ? <Loader size={18} className="animate-spin" /> : <Star size={18} />}
              {t.submit}
            </button>
          </div>
        </form>
      )}

      <style>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        .animate-spin {
          animation: spin 1s linear infinite;
        }
      `}</style>
    </div>
  );
};

export default AdvancedReviewForm;