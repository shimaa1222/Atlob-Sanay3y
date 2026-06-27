// src/services/notificationService.jsx
import api from './api';

/**
 * خدمة الإشعارات - متكاملة مع الـ Backend
 * جميع الدوال تستخدم API الحقيقي من الـ Backend
 * 
 * الأنواع المدعومة حسب توثيق الـ API:
 * - NewBookingNotification
 * - BookingStatusUpdatedNotification
 * - NewCraftsmanRegistrationNotification
 * - NewServicePostNotification
 * - NewPostResponseNotification
 * - NewMessageNotification
 */

const notificationService = {

  // ============================================================
  // 📋 أنواع الإشعارات (حسب توثيق الـ Backend)
  // ============================================================
  types: {
    // ✅ من توثيق الـ API
    NEW_BOOKING: 'NewBookingNotification',
    BOOKING_STATUS_UPDATED: 'BookingStatusUpdatedNotification',
    NEW_CRAFTSMAN_REGISTRATION: 'NewCraftsmanRegistrationNotification',
    NEW_SERVICE_POST: 'NewServicePostNotification',
    NEW_POST_RESPONSE: 'NewPostResponseNotification',
    NEW_MESSAGE: 'NewMessageNotification',
    
    // ✅ إضافات للواجهة
    BOOKING_ACCEPTED: 'booking_accepted',
    BOOKING_REJECTED: 'booking_rejected',
    BOOKING_REMINDER: 'booking_reminder',
    CRAFTSMAN_ON_WAY: 'craftsman_on_way',
    PAYMENT_REMINDER: 'payment_reminder',
    PROMOTION_CUSTOMER: 'promotion_customer',
    SERVICE_COMPLETED: 'service_completed',
    NEW_REVIEW: 'new_review',
    JOB_REMINDER: 'job_reminder',
    PAYMENT_RECEIVED: 'payment_received',
    PROMOTION_CRAFTSMAN: 'promotion_craftsman',
    PROFILE_VIEWED: 'profile_viewed',
  },

  // ============================================================
  // 📥 جلب الإشعارات من الـ Backend
  // ============================================================

  /**
   * جلب كل الإشعارات
   * GET /api/notifications
   * 
   * @param {boolean} unreadOnly - عرض غير المقروء فقط
   * @param {number} perPage - عدد النتائج لكل صفحة
   * @returns {Promise<{notifications: Array, unreadCount: number, meta: Object}>}
   */
  getNotifications: async (unreadOnly = false, perPage = 20) => {
    try {
      const data = await api.getNotifications(unreadOnly, perPage);
      return {
        notifications: data.notifications || [],
        unreadCount: data.unread_count || 0,
        meta: data.meta || {},
      };
    } catch (error) {
      console.error('⚠️ Error fetching notifications:', error);
      return {
        notifications: [],
        unreadCount: 0,
        meta: {},
      };
    }
  },

  /**
   * جلب عدد الإشعارات غير المقروءة
   * GET /api/notifications/count
   * 
   * @returns {Promise<number>}
   */
  getUnreadCount: async () => {
    try {
      const data = await api.getUnreadCount();
      return data.unread_count || 0;
    } catch (error) {
      console.error('⚠️ Error fetching unread count:', error);
      return 0;
    }
  },

  // ============================================================
  // ✏️ تحديث حالة الإشعارات
  // ============================================================

  /**
   * تعليم إشعار كمقروء
   * PATCH /api/notifications/{id}/read
   * 
   * @param {string|number} notificationId - معرف الإشعار
   * @returns {Promise<Object>}
   */
  markAsRead: async (notificationId) => {
    try {
      const data = await api.markNotificationRead(notificationId);
      return data;
    } catch (error) {
      console.error('⚠️ Error marking notification as read:', error);
      throw error;
    }
  },

  /**
   * تعليم كل الإشعارات كمقروءة
   * POST /api/notifications/read-all
   * 
   * @returns {Promise<Object>}
   */
  markAllAsRead: async () => {
    try {
      const data = await api.markAllNotificationsRead();
      return data;
    } catch (error) {
      console.error('⚠️ Error marking all notifications as read:', error);
      throw error;
    }
  },

  // ============================================================
  // 🗑️ حذف الإشعارات
  // ============================================================

  /**
   * حذف إشعار
   * DELETE /api/notifications/{id}
   * 
   * @param {string|number} notificationId - معرف الإشعار
   * @returns {Promise<Object>}
   */
  deleteNotification: async (notificationId) => {
    try {
      const data = await api.deleteNotification(notificationId);
      return data;
    } catch (error) {
      console.error('⚠️ Error deleting notification:', error);
      throw error;
    }
  },

  /**
   * حذف كل الإشعارات المقروءة
   * DELETE /api/notifications
   * 
   * @returns {Promise<Object>}
   */
  clearAll: async () => {
    try {
      const data = await api.clearAllNotifications();
      return data;
    } catch (error) {
      console.error('⚠️ Error clearing notifications:', error);
      throw error;
    }
  },

  // ============================================================
  // 🎨 دوال مساعدة للواجهة (Helper Functions)
  // ============================================================

  /**
   * الحصول على أيقونة الإشعار حسب النوع
   * 
   * @param {string} type - نوع الإشعار
   * @returns {string} - الأيقونة (Emoji)
   */
  getNotificationIcon: (type) => {
    const icons = {
      // ✅ من توثيق الـ API
      'NewBookingNotification': '📅',
      'BookingStatusUpdatedNotification': '🔄',
      'NewCraftsmanRegistrationNotification': '👤',
      'NewServicePostNotification': '📢',
      'NewPostResponseNotification': '💬',
      'NewMessageNotification': '💬',
      
      // ✅ إضافات للواجهة
      'booking_accepted': '✅',
      'booking_rejected': '❌',
      'booking_reminder': '⏰',
      'craftsman_on_way': '🚶',
      'payment_reminder': '💰',
      'promotion_customer': '🎉',
      'service_completed': '✔️',
      'new_review': '⭐',
      'job_reminder': '📋',
      'payment_received': '💳',
      'promotion_craftsman': '🚀',
      'profile_viewed': '👁️',
    };
    return icons[type] || '🔔';
  },

  /**
   * الحصول على لون الإشعار حسب النوع
   * 
   * @param {string} type - نوع الإشعار
   * @returns {string} - اللون (Hex)
   */
  getNotificationColor: (type) => {
    const colors = {
      // ✅ من توثيق الـ API
      'NewBookingNotification': '#f59e0b',
      'BookingStatusUpdatedNotification': '#3b82f6',
      'NewCraftsmanRegistrationNotification': '#8b5cf6',
      'NewServicePostNotification': '#3b82f6',
      'NewPostResponseNotification': '#ec4899',
      'NewMessageNotification': '#6366f1',
      
      // ✅ إضافات للواجهة
      'booking_accepted': '#059669',
      'booking_rejected': '#dc2626',
      'booking_reminder': '#f59e0b',
      'craftsman_on_way': '#3b82f6',
      'payment_reminder': '#ef4444',
      'promotion_customer': '#ec4899',
      'service_completed': '#10b981',
      'new_review': '#8b5cf6',
      'job_reminder': '#3b82f6',
      'payment_received': '#059669',
      'promotion_craftsman': '#ec4899',
      'profile_viewed': '#6366f1',
    };
    return colors[type] || '#64748b';
  },

  /**
   * الحصول على نص الإشعار حسب النوع والبيانات
   * 
   * @param {Object} notification - كائن الإشعار
   * @param {string} notification.type - نوع الإشعار
   * @param {Object} notification.data - بيانات الإشعار
   * @param {string} lang - اللغة (ar/en)
   * @returns {string} - نص الإشعار
   */
  getNotificationText: (notification, lang = 'ar') => {
    const { type, data } = notification;
    
    // ✅ من توثيق الـ API
    const messages = {
      // حجز جديد - يظهر للحرفي
      'NewBookingNotification': lang === 'ar' 
        ? `📅 حجز جديد من ${data?.clientName || data?.client?.name || 'عميل'}`
        : `📅 New booking from ${data?.clientName || data?.client?.name || 'Client'}`,
      
      // تحديث حالة حجز - يظهر للعميل
      'BookingStatusUpdatedNotification': lang === 'ar'
        ? `🔄 تم تحديث حالة الحجز إلى: ${data?.status || ''}`
        : `🔄 Booking status updated to: ${data?.status || ''}`,
      
      // حرفي جديد - يظهر للأدمن
      'NewCraftsmanRegistrationNotification': lang === 'ar'
        ? `👤 طلب تسجيل حرفي جديد: ${data?.name || ''}`
        : `👤 New craftsman registration: ${data?.name || ''}`,
      
      // منشور خدمة جديد - يظهر للحرفي
      'NewServicePostNotification': lang === 'ar'
        ? `📢 منشور جديد: ${data?.title || ''}`
        : `📢 New service post: ${data?.title || ''}`,
      
      // رد جديد على منشور - يظهر للعميل
      'NewPostResponseNotification': lang === 'ar'
        ? `💬 رد جديد على منشورك من ${data?.craftsmanName || 'حرفي'}`
        : `💬 New response to your post from ${data?.craftsmanName || 'Craftsman'}`,
      
      // رسالة جديدة
      'NewMessageNotification': lang === 'ar'
        ? `💬 رسالة جديدة من ${data?.from || ''}`
        : `💬 New message from ${data?.from || ''}`,
      
      // ✅ إضافات للواجهة
      'booking_accepted': lang === 'ar'
        ? `✅ تم قبول حجزك مع ${data?.craftsmanName || 'الحرفي'}`
        : `✅ Your booking with ${data?.craftsmanName || 'the craftsman'} has been accepted`,
      
      'booking_rejected': lang === 'ar'
        ? `❌ تم رفض حجزك مع ${data?.craftsmanName || 'الحرفي'}`
        : `❌ Your booking with ${data?.craftsmanName || 'the craftsman'} has been rejected`,
      
      'service_completed': lang === 'ar'
        ? `✔️ تم إكمال الخدمة بنجاح بواسطة ${data?.craftsmanName || 'الحرفي'}`
        : `✔️ Service completed successfully by ${data?.craftsmanName || 'the craftsman'}`,
      
      'new_review': lang === 'ar'
        ? `⭐ تقييم جديد من ${data?.customerName || 'عميل'} (${data?.rating || ''}⭐)`
        : `⭐ New review from ${data?.customerName || 'Client'} (${data?.rating || ''}⭐)`,
    };
    
    return messages[type] || (lang === 'ar' ? '🔔 لديك إشعار جديد' : '🔔 You have a new notification');
  },

  /**
   * تنسيق الوقت
   * 
   * @param {string} timestamp - الوقت بصيغة ISO
   * @param {string} lang - اللغة (ar/en)
   * @returns {string} - الوقت المنسق
   */
  formatTime: (timestamp, lang = 'ar') => {
    if (!timestamp) return '';
    const date = new Date(timestamp);
    const now = new Date();
    const diff = now - date;
    
    if (lang === 'ar') {
      if (diff < 60000) return 'الآن';
      if (diff < 3600000) return `${Math.floor(diff / 60000)} د`;
      if (diff < 86400000) return `${Math.floor(diff / 3600000)} س`;
      if (diff < 172800000) return 'أمس';
      return date.toLocaleDateString('ar-EG');
    } else {
      if (diff < 60000) return 'Now';
      if (diff < 3600000) return `${Math.floor(diff / 60000)}m`;
      if (diff < 86400000) return `${Math.floor(diff / 3600000)}h`;
      if (diff < 172800000) return 'Yesterday';
      return date.toLocaleDateString('en-US');
    }
  },

  /**
   * تجميع الإشعارات حسب التاريخ
   * 
   * @param {Array} notifications - قائمة الإشعارات
   * @param {string} lang - اللغة (ar/en)
   * @returns {Object} - إشعارات مجمعة حسب اليوم
   */
  groupNotificationsByDate: (notifications, lang = 'ar') => {
    const grouped = {};
    const today = new Date().toDateString();
    const yesterday = new Date(Date.now() - 86400000).toDateString();
    
    notifications.forEach(notif => {
      const date = new Date(notif.created_at);
      const dateKey = date.toDateString();
      
      let label;
      if (dateKey === today) {
        label = lang === 'ar' ? 'اليوم' : 'Today';
      } else if (dateKey === yesterday) {
        label = lang === 'ar' ? 'أمس' : 'Yesterday';
      } else {
        label = date.toLocaleDateString(lang === 'ar' ? 'ar-EG' : 'en-US', {
          year: 'numeric',
          month: 'long',
          day: 'numeric',
        });
      }
      
      if (!grouped[label]) grouped[label] = [];
      grouped[label].push(notif);
    });
    
    return grouped;
  },

  // ============================================================
  // 📤 إرسال إشعار (للاستخدام الداخلي - الباك هو اللي يرسل)
  // ============================================================

  /**
   * إرسال إشعار - ملاحظة: الإشعارات تُرسل من الـ Backend عبر Events/WebSocket
   * هذه الدالة للتوثيق فقط، لا تستخدمها لإرسال الإشعارات من الـ Frontend
   * 
   * @param {string} type - نوع الإشعار
   * @param {Object} data - بيانات الإشعار
   * @returns {Object} - رسالة توضيحية
   */
  sendNotification: (type, data) => {
    console.warn('⚠️ Notifications are sent from the Backend, not from Frontend');
    console.log('📢 Notification would be sent by backend:', { type, data });
    return { 
      success: true, 
      message: 'Notification will be sent by backend',
      type,
      data 
    };
  },
};

export default notificationService;