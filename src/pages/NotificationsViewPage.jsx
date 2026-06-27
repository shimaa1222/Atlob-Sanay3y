// src/pages/NotificationsViewPage.jsx
import React, { useState, useEffect, useCallback } from 'react';
import { useTheme } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import { 
  Bell, BellOff, Check, Trash2, Star, MessageCircle,
  Calendar, DollarSign, Megaphone, Eye,
  Clock, CheckCircle, XCircle, Sparkles,
  TrendingUp, Zap, Award, Loader, User, Wrench
} from 'lucide-react';

const NotificationsViewPage = () => {
  const { darkMode } = useTheme();
  const { user } = useAuth();
  const [lang, setLang] = useState('ar');
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [actionLoading, setActionLoading] = useState({});

  const role = user?.role || 'customer';

  // Language
  useEffect(() => {
    const savedLang = localStorage.getItem('language') || 'ar';
    setLang(savedLang);
    const handleLanguageChange = () => setLang(localStorage.getItem('language') || 'ar');
    window.addEventListener('languagechange', handleLanguageChange);
    return () => window.removeEventListener('languagechange', handleLanguageChange);
  }, []);

  // ✅ جلب الإشعارات من API - GET /api/notifications
  const loadNotifications = useCallback(async () => {
    setLoading(true);
    try {
      const unreadOnly = filter === 'unread';
      const data = await api.getNotifications(unreadOnly, 50);
      
      // ✅ التعامل مع Response
      const notificationsList = data.notifications || data.data || [];
      const unread = data.unread_count || notificationsList.filter(n => !n.is_read).length;
      
      setNotifications(notificationsList);
      setUnreadCount(unread);
    } catch (error) {
      console.warn('⚠️ Notifications error:', error);
      setNotifications([]);
      setUnreadCount(0);
    }
    setLoading(false);
  }, [filter]);

  // ✅ تعليم إشعار كمقروء - PATCH /api/notifications/{id}/read
  const handleMarkAsRead = useCallback(async (id) => {
    setActionLoading(prev => ({ ...prev, [id]: 'read' }));
    try {
      await api.markNotificationRead(id);
      await loadNotifications();
    } catch (error) {
      console.warn('⚠️ Mark read error:', error);
    }
    setActionLoading(prev => ({ ...prev, [id]: null }));
  }, [loadNotifications]);

  // ✅ تعليم الكل كمقروء - POST /api/notifications/read-all
  const handleMarkAllAsRead = useCallback(async () => {
    setActionLoading(prev => ({ ...prev, 'all': true }));
    try {
      await api.markAllNotificationsRead();
      await loadNotifications();
    } catch (error) {
      console.warn('⚠️ Mark all read error:', error);
    }
    setActionLoading(prev => ({ ...prev, 'all': false }));
  }, [loadNotifications]);

  // ✅ حذف إشعار - DELETE /api/notifications/{id}
  const handleDelete = useCallback(async (id) => {
    setActionLoading(prev => ({ ...prev, [id]: 'delete' }));
    try {
      await api.deleteNotification(id);
      await loadNotifications();
    } catch (error) {
      console.warn('⚠️ Delete notification error:', error);
    }
    setActionLoading(prev => ({ ...prev, [id]: null }));
  }, [loadNotifications]);

  // ✅ حذف الكل (المقروءة فقط) - DELETE /api/notifications
  const handleClearAll = useCallback(async () => {
    if (window.confirm(lang === 'ar' ? 'هل أنت متأكد من حذف كل الإشعارات المقروءة؟' : 'Are you sure you want to clear all read notifications?')) {
      setActionLoading(prev => ({ ...prev, 'clear': true }));
      try {
        await api.clearAllNotifications();
        await loadNotifications();
      } catch (error) {
        console.warn('⚠️ Clear all error:', error);
      }
      setActionLoading(prev => ({ ...prev, 'clear': false }));
    }
  }, [lang, loadNotifications]);

  // ✅ تحميل عند الفتح
  useEffect(() => {
    loadNotifications();
  }, [loadNotifications]);

  // Filters
  const filteredNotifications = filter === 'unread' 
    ? notifications.filter(n => !n.is_read)
    : notifications;

  // ✅ أنواع الإشعارات حسب التوثيق
  const getNotificationStyle = (type) => {
    const styles = {
      'NewBookingNotification': { 
        icon: <Bell size={20} />, 
        color: '#f59e0b', 
        bg: 'rgba(245,158,11,0.1)',
        label: lang === 'ar' ? 'حجز جديد' : 'New Booking'
      },
      'BookingStatusUpdatedNotification': { 
        icon: <CheckCircle size={20} />, 
        color: '#059669', 
        bg: 'rgba(5,150,105,0.1)',
        label: lang === 'ar' ? 'تحديث حالة الحجز' : 'Booking Status Updated'
      },
      'NewCraftsmanRegistrationNotification': { 
        icon: <Sparkles size={20} />, 
        color: '#8b5cf6', 
        bg: 'rgba(139,92,246,0.1)',
        label: lang === 'ar' ? 'حرفي جديد' : 'New Craftsman'
      },
      'NewServicePostNotification': { 
        icon: <Megaphone size={20} />, 
        color: '#3b82f6', 
        bg: 'rgba(59,130,246,0.1)',
        label: lang === 'ar' ? 'طلب خدمة جديد' : 'New Service Request'
      },
      'NewPostResponseNotification': { 
        icon: <MessageCircle size={20} />, 
        color: '#ec4899', 
        bg: 'rgba(236,72,153,0.1)',
        label: lang === 'ar' ? 'رد على طلبك' : 'Response to Your Request'
      },
      'NewMessageNotification': { 
        icon: <MessageCircle size={20} />, 
        color: '#6366f1', 
        bg: 'rgba(99,102,241,0.1)',
        label: lang === 'ar' ? 'رسالة جديدة' : 'New Message'
      },
    };
    return styles[type] || { 
      icon: <Bell size={20} />, 
      color: '#94a3b8', 
      bg: 'rgba(148,163,184,0.1)',
      label: lang === 'ar' ? 'إشعار' : 'Notification'
    };
  };

  // ✅ تنسيق نص الإشعار
  const getNotificationText = (notif) => {
    // إذا كان هناك message في data
    if (notif.data?.message) return notif.data.message;
    
    // إذا كان هناك booking_id
    if (notif.data?.booking_id) {
      return lang === 'ar' 
        ? `تحديث على الحجز #${notif.data.booking_id}`
        : `Update on booking #${notif.data.booking_id}`;
    }
    
    // إذا كان هناك post_id
    if (notif.data?.post_id) {
      return lang === 'ar' 
        ? `تحديث على طلب الخدمة #${notif.data.post_id}`
        : `Update on service request #${notif.data.post_id}`;
    }
    
    return notif.data?.title || notif.data?.body || (lang === 'ar' ? 'إشعار جديد' : 'New notification');
  };

  // ✅ تنسيق الوقت
  const formatTime = (timestamp) => {
    if (!timestamp) return '';
    const date = new Date(timestamp);
    const now = new Date();
    const diff = Math.floor((now - date) / 1000);
    
    if (diff < 60) return lang === 'ar' ? 'الآن' : 'Now';
    if (diff < 3600) return `${Math.floor(diff / 60)} ${lang === 'ar' ? 'د' : 'm'}`;
    if (diff < 86400) return `${Math.floor(diff / 3600)} ${lang === 'ar' ? 'س' : 'h'}`;
    if (diff < 172800) return lang === 'ar' ? 'أمس' : 'Yesterday';
    return date.toLocaleDateString(lang === 'ar' ? 'ar-EG' : 'en-US');
  };

  // Translations
  const t = {
    title: lang === 'ar' ? 'الإشعارات' : 'Notifications',
    subtitle: role === 'customer' 
      ? (lang === 'ar' ? 'إشعارات طلباتك وخدماتك' : 'Your requests and services notifications')
      : (role === 'craftsman' 
        ? (lang === 'ar' ? 'إشعارات طلباتك وتقييماتك' : 'Your requests and reviews notifications')
        : (lang === 'ar' ? 'إشعارات المنصة' : 'Platform notifications')
      ),
    all: lang === 'ar' ? 'الكل' : 'All',
    unread: lang === 'ar' ? 'غير مقروءة' : 'Unread',
    markAllRead: lang === 'ar' ? 'تعليم الكل كمقروء' : 'Mark all as read',
    clearAll: lang === 'ar' ? 'حذف المقروءة' : 'Clear Read',
    noNotifications: lang === 'ar' ? 'لا توجد إشعارات' : 'No notifications',
    noNotificationsDesc: lang === 'ar' ? 'كل الإشعارات هتظهر هنا أول ما توصل' : 'All notifications will appear here once they arrive',
    loading: lang === 'ar' ? 'جاري التحميل...' : 'Loading...',
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
        @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
        @keyframes slideLeft { from { opacity: 0; transform: translateX(20px); } to { opacity: 1; transform: translateX(0); } }
        @keyframes pulse { 0%, 100% { transform: scale(1); } 50% { transform: scale(1.05); } }
        @keyframes shimmer { 0% { background-position: -200% 0; } 100% { background-position: 200% 0; } }
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
        
        .animate-fade-in-up { animation: fadeInUp 0.5s ease forwards; }
        .animate-fade-in { animation: fadeIn 0.3s ease forwards; }
        .animate-slide-left { animation: slideLeft 0.4s ease forwards; }
        .animate-spin { animation: spin 1s linear infinite; }
        
        .delay-100 { animation-delay: 0.1s; }
        .delay-200 { animation-delay: 0.2s; }
        .delay-300 { animation-delay: 0.3s; }
        
        .notification-item { transition: all 0.3s ease; }
        .notification-item:hover { transform: translateX(-4px); box-shadow: 0 8px 24px rgba(0,0,0,0.1); }
        .notification-item.unread { border-right: 3px solid #3b82f6; }
        
        .skeleton {
          background: linear-gradient(90deg, ${darkMode ? '#334155' : '#e2e8f0'} 25%, ${darkMode ? '#1e293b' : '#f1f5f9'} 50%, ${darkMode ? '#334155' : '#e2e8f0'} 75%);
          background-size: 200% 100%;
          animation: shimmer 1.5s infinite;
        }
        
        @media (max-width: 768px) {
          .notif-header { flex-direction: column; gap: 12px; }
          .notif-actions { flex-wrap: wrap; }
          .notification-item { flex-wrap: wrap; }
        }
      `}</style>

      {/* Header */}
      <div style={{
        background: darkMode ? 'linear-gradient(160deg, #1e3a8a, #1e40af)' : 'linear-gradient(160deg, #2563eb, #1d4ed8)',
        color: 'white', padding: '40px 0',
      }}>
        <div style={{ maxWidth: '800px', margin: '0 auto', padding: '0 24px' }}>
          <div className="animate-fade-in-up" style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
            <div style={{
              width: '48px', height: '48px', borderRadius: '14px',
              background: 'rgba(255,255,255,0.2)', display: 'flex',
              alignItems: 'center', justifyContent: 'center',
              position: 'relative',
            }}>
              <Bell size={24} />
              {unreadCount > 0 && (
                <span style={{
                  position: 'absolute', top: '-6px', right: '-6px',
                  background: '#ef4444', color: 'white', width: '22px', height: '22px',
                  borderRadius: '50%', fontSize: '0.7rem', fontWeight: 700,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  border: '2px solid white', animation: 'pulse 2s infinite',
                }}>
                  {unreadCount}
                </span>
              )}
            </div>
            <div>
              <h1 style={{ fontSize: '1.75rem', fontWeight: 700, margin: 0 }}>🔔 {t.title}</h1>
              <p style={{ fontSize: '0.9rem', opacity: 0.85, margin: '2px 0 0' }}>{t.subtitle}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div style={{ maxWidth: '800px', margin: '0 auto', padding: '24px' }}>
        
        {/* Filters & Actions */}
        <div className="animate-fade-in-up notif-header" style={{
          display: 'flex', justifyContent: 'space-between', alignItems: 'center',
          marginBottom: '20px', gap: '12px', flexWrap: 'wrap',
        }}>
          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
            <button onClick={() => setFilter('all')}
              style={{
                padding: '8px 18px', borderRadius: '50px', border: 'none',
                cursor: 'pointer', fontWeight: 600, fontSize: '0.85rem',
                fontFamily: "'Cairo', sans-serif", transition: 'all 0.3s ease',
                background: filter === 'all' ? '#3b82f6' : (darkMode ? '#334155' : '#e2e8f0'),
                color: filter === 'all' ? 'white' : textColor,
              }}>
              📋 {t.all} ({notifications.length})
            </button>
            <button onClick={() => setFilter('unread')}
              style={{
                padding: '8px 18px', borderRadius: '50px', border: 'none',
                cursor: 'pointer', fontWeight: 600, fontSize: '0.85rem',
                fontFamily: "'Cairo', sans-serif", transition: 'all 0.3s ease',
                background: filter === 'unread' ? '#3b82f6' : (darkMode ? '#334155' : '#e2e8f0'),
                color: filter === 'unread' ? 'white' : textColor,
                display: 'flex', alignItems: 'center', gap: '6px',
              }}>
                👁️ {t.unread}
                {unreadCount > 0 && (
                  <span style={{
                    background: '#ef4444', color: 'white', padding: '2px 8px',
                    borderRadius: '10px', fontSize: '0.7rem', fontWeight: 700,
                  }}>
                    {unreadCount}
                  </span>
                )}
              </button>
          </div>

          <div className="notif-actions" style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
            {unreadCount > 0 && (
              <button onClick={handleMarkAllAsRead} disabled={actionLoading['all']}
                style={{
                  padding: '8px 14px', borderRadius: '10px', border: `1px solid ${borderColor}`,
                  background: 'transparent', cursor: actionLoading['all'] ? 'not-allowed' : 'pointer',
                  color: '#3b82f6', fontSize: '0.8rem', fontWeight: 600,
                  fontFamily: "'Cairo', sans-serif", display: 'flex', alignItems: 'center', gap: '6px',
                  transition: 'all 0.3s ease', opacity: actionLoading['all'] ? 0.5 : 1,
                }}>
                {actionLoading['all'] ? <Loader size={14} className="animate-spin" /> : <Check size={14} />}
                {t.markAllRead}
              </button>
            )}
            {notifications.filter(n => n.is_read).length > 0 && (
              <button onClick={handleClearAll} disabled={actionLoading['clear']}
                style={{
                  padding: '8px 14px', borderRadius: '10px', border: `1px solid ${borderColor}`,
                  background: 'transparent', cursor: actionLoading['clear'] ? 'not-allowed' : 'pointer',
                  color: '#dc2626', fontSize: '0.8rem', fontWeight: 600,
                  fontFamily: "'Cairo', sans-serif", display: 'flex', alignItems: 'center', gap: '6px',
                  transition: 'all 0.3s ease', opacity: actionLoading['clear'] ? 0.5 : 1,
                }}>
                {actionLoading['clear'] ? <Loader size={14} className="animate-spin" /> : <Trash2 size={14} />}
                {t.clearAll}
              </button>
            )}
          </div>
        </div>

        {/* Notifications List */}
        {loading ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {[1, 2, 3, 4].map(i => (
              <div key={i} className="skeleton" style={{ borderRadius: '14px', height: '80px' }} />
            ))}
          </div>
        ) : filteredNotifications.length > 0 ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {filteredNotifications.map((notif, index) => {
              const style = getNotificationStyle(notif.type);
              const isRead = notif.is_read || false;
              
              return (
                <div key={notif.id}
                  className={`notification-item animate-slide-left ${!isRead ? 'unread' : ''}`}
                  style={{
                    background: !isRead ? cardBg : (darkMode ? '#1e293b' : '#f8fafc'),
                    borderRadius: '14px', padding: '16px 20px',
                    border: `1px solid ${borderColor}`,
                    cursor: !isRead ? 'pointer' : 'default',
                    opacity: isRead ? 0.7 : 1,
                    animationDelay: `${index * 0.08}s`,
                    display: 'flex', gap: '14px', alignItems: 'flex-start',
                    transition: 'all 0.3s ease',
                  }}
                  onClick={() => !isRead && handleMarkAsRead(notif.id)}
                >
                  <div style={{
                    width: '44px', height: '44px', borderRadius: '12px',
                    background: style.bg, display: 'flex',
                    alignItems: 'center', justifyContent: 'center',
                    flexShrink: 0, color: style.color,
                  }}>
                    {style.icon}
                  </div>

                  <div style={{ flex: 1, minWidth: '100px' }}>
                    <div style={{
                      display: 'flex', alignItems: 'center', gap: '8px',
                      marginBottom: '4px', flexWrap: 'wrap',
                    }}>
                      <span style={{
                        fontSize: '0.65rem', fontWeight: 600,
                        color: style.color, background: style.bg,
                        padding: '2px 8px', borderRadius: '4px',
                      }}>
                        {style.label}
                      </span>
                      {!isRead && (
                        <span style={{
                          fontSize: '0.6rem', fontWeight: 700,
                          color: '#3b82f6', background: 'rgba(59,130,246,0.1)',
                          padding: '2px 8px', borderRadius: '4px',
                        }}>
                          {lang === 'ar' ? 'جديد' : 'New'}
                        </span>
                      )}
                    </div>
                    
                    <p style={{
                      fontSize: '0.9rem', color: textColor,
                      lineHeight: 1.6, margin: '0 0 4px',
                      fontWeight: !isRead ? 600 : 400,
                    }}>
                      {getNotificationText(notif)}
                    </p>
                    
                    <span style={{
                      fontSize: '0.75rem', color: textSecondary,
                      display: 'flex', alignItems: 'center', gap: '6px',
                    }}>
                      <Clock size={12} />
                      {formatTime(notif.created_at)}
                    </span>
                  </div>

                  <div style={{ display: 'flex', gap: '6px', flexShrink: 0 }}>
                    {!isRead && (
                      <button 
                        onClick={(e) => { e.stopPropagation(); handleMarkAsRead(notif.id); }}
                        disabled={actionLoading[notif.id] === 'read'}
                        style={{
                          width: '32px', height: '32px', borderRadius: '8px',
                          border: 'none', cursor: actionLoading[notif.id] === 'read' ? 'not-allowed' : 'pointer',
                          background: 'rgba(5,150,105,0.1)', color: '#059669',
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                          opacity: actionLoading[notif.id] === 'read' ? 0.5 : 1,
                        }}>
                        {actionLoading[notif.id] === 'read' ? 
                          <Loader size={14} className="animate-spin" /> : 
                          <Check size={14} />
                        }
                      </button>
                    )}
                    <button 
                      onClick={(e) => { e.stopPropagation(); handleDelete(notif.id); }}
                      disabled={actionLoading[notif.id] === 'delete'}
                      style={{
                        width: '32px', height: '32px', borderRadius: '8px',
                        border: 'none', cursor: actionLoading[notif.id] === 'delete' ? 'not-allowed' : 'pointer',
                        background: 'rgba(220,38,38,0.1)', color: '#dc2626',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        opacity: actionLoading[notif.id] === 'delete' ? 0.5 : 1,
                      }}>
                      {actionLoading[notif.id] === 'delete' ? 
                        <Loader size={14} className="animate-spin" /> : 
                        <XCircle size={14} />
                      }
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="animate-fade-in" style={{
            textAlign: 'center', padding: '80px 20px',
            background: cardBg, borderRadius: '16px',
            border: `1px solid ${borderColor}`,
          }}>
            <BellOff size={64} style={{ color: textSecondary, opacity: 0.4, marginBottom: '16px' }} />
            <h3 style={{ fontSize: '1.2rem', fontWeight: 700, color: textColor, marginBottom: '8px' }}>
              {t.noNotifications}
            </h3>
            <p style={{ color: textSecondary, fontSize: '0.95rem' }}>
              {t.noNotificationsDesc}
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default NotificationsViewPage;