// src/components/Reviews/AddReviewModal.jsx
import React, { useState } from 'react';
import { Star, X, AlertCircle, CheckCircle } from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';
import api from '../../services/api';

/**
 * ✅ مودال إضافة تقييم
 * 
 * هذا المكون يظهر للعميل لتقييم حجز مكتمل
 * 
 * @param {boolean} isOpen - هل المودال مفتوح
 * @param {function} onClose - دالة الإغلاق
 * @param {number} bookingId - معرف الحجز
 * @param {string} craftsmanName - اسم الحرفي
 * @param {function} onSuccess - دالة النجاح (تحديث البيانات)
 */
const AddReviewModal = ({ 
  isOpen, 
  onClose, 
  bookingId, 
  craftsmanName,
  onSuccess 
}) => {
  const { darkMode } = useTheme();
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
    title: lang === 'ar' ? '⭐ تقييم الخدمة' : '⭐ Rate Service',
    ratingCraftsman: lang === 'ar' ? 'قيم خدمة' : 'Rate service of',
    successTitle: lang === 'ar' ? '✅ تم التقييم!' : '✅ Review Submitted!',
    successMessage: lang === 'ar' ? 'شكراً على تقييمك! تقييمك يساعدنا في تحسين الخدمة' : 'Thank you for your review! Your feedback helps us improve',
    ratingLabel: lang === 'ar' ? 'التقييم' : 'Rating',
    commentLabel: lang === 'ar' ? 'التعليق (اختياري)' : 'Comment (Optional)',
    commentPlaceholder: lang === 'ar' ? 'اكتب تجربتك مع الحرفي...' : 'Write your experience with the craftsman...',
    submit: lang === 'ar' ? 'إرسال التقييم' : 'Submit Review',
    cancel: lang === 'ar' ? 'إلغاء' : 'Cancel',
    selectRating: lang === 'ar' ? 'يرجى اختيار عدد النجوم' : 'Please select a rating',
    errorSubmit: lang === 'ar' ? 'حدث خطأ في إضافة التقييم' : 'Error adding review',
    charCount: (count, max) => lang === 'ar' ? `${count}/${max}` : `${count}/${max}`,
    charRemaining: (remaining) => lang === 'ar' ? `${remaining} حرف متبقي` : `${remaining} characters remaining`,
    maxChars: lang === 'ar' ? '⚠️ الحد الأقصى 1000 حرف' : '⚠️ Maximum 1000 characters',
    excellent: lang === 'ar' ? '⭐ ممتاز!' : '⭐ Excellent!',
    veryGood: lang === 'ar' ? '🌟 جيد جداً' : '🌟 Very Good',
    good: lang === 'ar' ? '👍 جيد' : '👍 Good',
    needsImprovement: lang === 'ar' ? '👎 يحتاج تحسين' : '👎 Needs Improvement',
    poor: lang === 'ar' ? '😞 سيء' : '😞 Poor',
  };

  // ========== Colors ==========
  const bgColor = darkMode ? '#0f172a' : '#ffffff';
  const textColor = darkMode ? '#f1f5f9' : '#0f172a';
  const textSecondary = darkMode ? '#94a3b8' : '#64748b';
  const borderColor = darkMode ? '#334155' : '#e2e8f0';
  const starColor = '#f59e0b';

  // ========== Handle Submit ==========
  const handleSubmit = async () => {
    // ✅ التحقق من التقييم
    if (rating === 0) {
      setError(t.selectRating);
      return;
    }

    setLoading(true);
    setError('');
    setSuccess(false);

    try {
      // ✅ التحقق من وجود bookingId
      if (!bookingId) {
        throw new Error('معرف الحجز غير موجود');
      }

      console.log('📤 [AddReviewModal] Submitting review for booking:', bookingId);
      console.log('📤 [AddReviewModal] Rating:', rating);
      console.log('📤 [AddReviewModal] Comment:', comment);

      // ✅ إرسال التقييم للـ API
      const data = await api.addReview(bookingId, {
        rating: rating,
        comment: comment.trim() || null,
      });

      console.log('✅ [AddReviewModal] Review added successfully:', data);
      setSuccess(true);

      // ✅ إعادة تعيين النموذج
      setRating(0);
      setComment('');
      setHoverRating(0);

      // ✅ استدعاء onSuccess بعد 2 ثانية
      setTimeout(() => {
        onClose();
        if (onSuccess) {
          onSuccess(data);
        }
      }, 2000);

    } catch (err) {
      console.error('❌ [AddReviewModal] Error adding review:', err);
      
      // ✅ عرض رسائل الخطأ من Backend
      if (err.errors) {
        const messages = Object.values(err.errors).flat().join(' | ');
        setError(messages);
      } else {
        setError(err.message || t.errorSubmit);
      }
    } finally {
      setLoading(false);
    }
  };

  // ========== Reset ==========
  const handleClose = () => {
    setRating(0);
    setComment('');
    setError('');
    setSuccess(false);
    setHoverRating(0);
    onClose();
  };

  // ========== Star Rating ==========
  const renderStars = () => {
    return [1, 2, 3, 4, 5].map((star) => (
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
          transition: 'all 0.2s ease',
          transform: (hoverRating || rating) >= star ? 'scale(1.15)' : 'scale(1)',
        }}
      >
        <Star
          size={36}
          fill={(hoverRating || rating) >= star ? starColor : 'none'}
          color={(hoverRating || rating) >= star ? starColor : textSecondary}
          style={{
            transition: 'all 0.2s ease',
          }}
        />
      </button>
    ));
  };

  // ========== Get Rating Label ==========
  const getRatingLabel = (rating) => {
    const labels = {
      5: t.excellent,
      4: t.veryGood,
      3: t.good,
      2: t.needsImprovement,
      1: t.poor,
    };
    return labels[rating] || '';
  };

  // ========== Render ==========
  if (!isOpen) return null;

  return (
    <>
      {/* ✅ Background Overlay */}
      <div
        onClick={handleClose}
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0,0,0,0.6)',
          backdropFilter: 'blur(4px)',
          zIndex: 1000,
          animation: 'fadeIn 0.3s ease',
        }}
      />

      {/* ✅ Modal */}
      <div
        style={{
          position: 'fixed',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          background: bgColor,
          borderRadius: '20px',
          padding: '32px',
          maxWidth: '520px',
          width: '90%',
          zIndex: 1001,
          boxShadow: '0 20px 60px rgba(0,0,0,0.3)',
          border: `1px solid ${borderColor}`,
          animation: 'slideUp 0.3s ease',
          direction: 'rtl',
          fontFamily: "'Cairo', sans-serif",
          maxHeight: '90vh',
          overflowY: 'auto',
        }}
      >
        {/* ✅ Header */}
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '24px',
        }}>
          <h2 style={{
            fontSize: '1.3rem',
            fontWeight: 700,
            color: textColor,
            margin: 0,
          }}>
            {success ? t.successTitle : t.title}
          </h2>
          <button
            onClick={handleClose}
            style={{
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              padding: '8px',
              borderRadius: '8px',
              color: textSecondary,
              transition: 'all 0.2s ease',
            }}
            onMouseEnter={(e) => e.currentTarget.style.background = darkMode ? '#334155' : '#f1f5f9'}
            onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
          >
            <X size={24} />
          </button>
        </div>

        {/* ✅ Success Message */}
        {success ? (
          <div style={{
            textAlign: 'center',
            padding: '40px 20px',
          }}>
            <div style={{
              width: '80px',
              height: '80px',
              borderRadius: '50%',
              background: 'linear-gradient(135deg, #059669, #10b981)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 16px',
            }}>
              <CheckCircle size={40} color="white" />
            </div>
            <p style={{
              color: textColor,
              fontSize: '1.1rem',
              fontWeight: 600,
            }}>
              {t.successMessage}
            </p>
          </div>
        ) : (
          <>
            {/* ✅ Craftsman Name */}
            <p style={{
              color: textSecondary,
              fontSize: '0.95rem',
              marginBottom: '20px',
              textAlign: 'center',
            }}>
              {t.ratingCraftsman} <strong style={{ color: textColor }}>{craftsmanName || 'الحرفي'}</strong>
            </p>

            {/* ✅ Stars */}
            <div style={{
              display: 'flex',
              justifyContent: 'center',
              gap: '8px',
              marginBottom: '24px',
            }}>
              {renderStars()}
            </div>

            {/* ✅ Rating Label */}
            {rating > 0 && (
              <p style={{
                textAlign: 'center',
                color: starColor,
                fontWeight: 600,
                fontSize: '0.95rem',
                marginBottom: '16px',
              }}>
                {getRatingLabel(rating)}
              </p>
            )}

            {/* ✅ Comment */}
            <div style={{ marginBottom: '20px' }}>
              <label style={{
                display: 'block',
                fontSize: '0.9rem',
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
                maxLength={1000}
                rows={4}
                style={{
                  width: '100%',
                  padding: '12px 16px',
                  border: `2px solid ${borderColor}`,
                  borderRadius: '12px',
                  fontSize: '0.95rem',
                  color: textColor,
                  background: darkMode ? '#0f172a' : '#f8fafc',
                  outline: 'none',
                  fontFamily: "'Cairo', sans-serif",
                  resize: 'vertical',
                  transition: 'all 0.3s ease',
                  textAlign: 'right',
                }}
                onFocus={(e) => e.target.style.borderColor = '#3b82f6'}
                onBlur={(e) => e.target.style.borderColor = borderColor}
              />
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginTop: '4px',
              }}>
                <span style={{
                  fontSize: '0.75rem',
                  color: textSecondary,
                }}>
                  {t.charCount(comment.length, 1000)}
                </span>
                {comment.length > 900 && (
                  <span style={{
                    fontSize: '0.75rem',
                    color: comment.length >= 1000 ? '#dc2626' : '#f59e0b',
                  }}>
                    {comment.length >= 1000 
                      ? t.maxChars 
                      : t.charRemaining(1000 - comment.length)}
                  </span>
                )}
              </div>
            </div>

            {/* ✅ Error */}
            {error && (
              <div style={{
                background: darkMode ? 'rgba(220,38,38,0.1)' : '#fee2e2',
                color: '#dc2626',
                padding: '12px 16px',
                borderRadius: '12px',
                fontSize: '0.9rem',
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

            {/* ✅ Buttons */}
            <div style={{
              display: 'flex',
              gap: '12px',
            }}>
              <button
                onClick={handleClose}
                style={{
                  flex: 1,
                  padding: '12px',
                  borderRadius: '12px',
                  border: `2px solid ${borderColor}`,
                  background: 'transparent',
                  color: textColor,
                  fontWeight: 600,
                  fontSize: '1rem',
                  cursor: 'pointer',
                  fontFamily: "'Cairo', sans-serif",
                  transition: 'all 0.3s ease',
                }}
                onMouseEnter={(e) => e.currentTarget.style.background = darkMode ? '#334155' : '#f1f5f9'}
                onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
              >
                {t.cancel}
              </button>
              <button
                onClick={handleSubmit}
                disabled={loading || rating === 0}
                style={{
                  flex: 2,
                  padding: '12px',
                  borderRadius: '12px',
                  border: 'none',
                  background: loading || rating === 0 
                    ? (darkMode ? '#334155' : '#cbd5e1')
                    : 'linear-gradient(135deg, #f59e0b, #d97706)',
                  color: (loading || rating === 0) ? textSecondary : 'white',
                  fontWeight: 700,
                  fontSize: '1rem',
                  cursor: (loading || rating === 0) ? 'not-allowed' : 'pointer',
                  fontFamily: "'Cairo', sans-serif",
                  transition: 'all 0.3s ease',
                  boxShadow: (loading || rating === 0) ? 'none' : '0 4px 16px rgba(245,158,11,0.3)',
                }}
              >
                {loading ? 'جاري الإرسال...' : t.submit}
              </button>
            </div>
          </>
        )}
      </div>

      {/* ✅ Styles */}
      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes slideUp {
          from { opacity: 0; transform: translate(-50%, -40%); }
          to { opacity: 1; transform: translate(-50%, -50%); }
        }
      `}</style>
    </>
  );
};

export default AddReviewModal;