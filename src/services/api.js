// src/services/api.js
const API_URL = "https://sanay3e-production.up.railway.app/api";

// ============================================================
// ✅ دوال مساعدة
// ============================================================
const getHeaders = () => {
  const token = localStorage.getItem("token");
  return {
    "Content-Type": "application/json",
    Accept: "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
};

const getFormHeaders = () => {
  const token = localStorage.getItem("token");
  return {
    Accept: "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
};

// ============================================================
// ✅ Custom Fetch with Interceptors
// ============================================================
const fetchWithInterceptors = async (url, options = {}) => {
  const startTime = Date.now();
  const method = options.method || 'GET';
  
  console.log(`📤 [${method}] ${url}`);

  try {
    const response = await fetch(url, options);
    const duration = Date.now() - startTime;
    
    console.log(`📥 [${method}] ${url} - ${response.status} (${duration}ms)`);

    // ✅ معالجة 401 Unauthorized - محاولة تجديد التوكن
    if (response.status === 401 && !options._retry) {
      console.warn('⚠️ Token expired, attempting refresh...');
      
      const refreshToken = localStorage.getItem('refreshToken');
      if (refreshToken) {
        try {
          const refreshResponse = await fetch(`${API_URL}/auth/refresh`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              Accept: 'application/json',
            },
            body: JSON.stringify({ refresh_token: refreshToken }),
          });

          if (refreshResponse.ok) {
            const refreshData = await refreshResponse.json();
            if (refreshData.token) {
              localStorage.setItem('token', refreshData.token);
              console.log('✅ Token refreshed successfully');
              
              // ✅ إعادة المحاولة مع التوكن الجديد
              const newOptions = { ...options, _retry: true };
              newOptions.headers = {
                ...newOptions.headers,
                Authorization: `Bearer ${refreshData.token}`,
              };
              return fetchWithInterceptors(url, newOptions);
            }
          }
        } catch (refreshError) {
          console.warn('⚠️ Token refresh failed:', refreshError);
        }
      }

      // ✅ فشل تجديد التوكن - تسجيل الخروج
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      localStorage.removeItem('userRole');
      localStorage.removeItem('craftsmanId');
      localStorage.removeItem('refreshToken');
      
      // ✅ إعادة التوجيه لصفحة تسجيل الدخول
      if (typeof window !== 'undefined' && !window.location.pathname.includes('/login')) {
        window.location.href = '/login';
      }
    }

    return response;
  } catch (error) {
    console.error(`❌ [${method}] ${url} - Network Error:`, error);
    
    // ✅ إعادة محاولة الطلبات الفاشلة بسبب الشبكة
    if (error.message === 'Failed to fetch' && !options._retry) {
      console.warn('⚠️ Network error, retrying in 2 seconds...');
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      const newOptions = { ...options, _retry: true };
      return fetchWithInterceptors(url, newOptions);
    }
    
    throw error;
  }
};

// ============================================================
// ✅ تحسين handleResponse لعرض تفاصيل الأخطاء
// ============================================================
const handleResponse = async (res) => {
  if (!res) {
    throw new Error("NETWORK_ERROR");
  }

  let data;
  try {
    data = await res.json();
  } catch (parseError) {
    console.warn('⚠️ Response is not JSON, status:', res.status);
    if (res.ok) {
      return { success: true, message: "تم بنجاح" };
    }
    throw new Error(`SERVER_ERROR_${res.status}`);
  }

  if (!res.ok) {
    let errorMessage = data.message || 'حدث خطأ غير متوقع';
    
    if (res.status === 422 && data.errors) {
      const errorDetails = Object.entries(data.errors)
        .map(([field, messages]) => {
          const fieldNames = {
            'first_name': 'الاسم الأول',
            'last_name': 'الاسم الأخير',
            'email': 'البريد الإلكتروني',
            'phone': 'رقم الهاتف',
            'city': 'المدينة',
            'password': 'كلمة المرور',
            'national_id_front': 'البطاقة الأمامية',
            'national_id_back': 'البطاقة الخلفية',
            'craft_ids': 'المهن',
            'craft_ids.0': 'المهنة',
            'craft_ids.*': 'المهنة',
            'district': 'الحي',
            'whatsapp': 'واتساب',
            'bio': 'السيرة الذاتية',
            'hourly_rate': 'السعر بالساعة',
            'full_address': 'العنوان الكامل',
            'is_available': 'متاح',
            'profile_photo': 'الصورة الشخصية',
            'skills': 'المهارات',
            'title': 'العنوان',
            'description': 'الوصف',
            'budget_from': 'الميزانية من',
            'budget_to': 'الميزانية إلى',
            'needed_by': 'مطلوب بحلول',
            'urgency': 'درجة الإلحاح',
            'images': 'الصور',
            'craft_id': 'المهنة',
            'service_id': 'الخدمة',
            'booking_date': 'تاريخ الحجز',
            'booking_time': 'وقت الحجز',
            'notes': 'ملاحظات',
            'location': 'الموقع',
            'rating': 'التقييم',
            'comment': 'التعليق',
            'current_password': 'كلمة المرور الحالية',
            'reason': 'السبب',
            'offered_price': 'السعر المعروض',
            'estimated_days': 'الأيام المتوقعة',
            'message': 'الرسالة',
            'status': 'الحالة',
            'custom_craft': 'المهنة المخصصة'
          };
          
          const fieldName = fieldNames[field] || field;
          const messagesText = messages.join(', ');
          return `${fieldName}: ${messagesText}`;
        })
        .join('\n');
      
      errorMessage = `❌ فشل التحقق من البيانات:\n${errorDetails}`;
      
      const error = new Error(errorMessage);
      error.errors = data.errors;
      error.status = res.status;
      error.data = data;
      throw error;
    }
    
    if (res.status === 401) {
      errorMessage = '⚠️ جلسة غير صالحة. يرجى تسجيل الدخول مرة أخرى.';
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      localStorage.removeItem('userRole');
      localStorage.removeItem('craftsmanId');
      localStorage.removeItem('refreshToken');
    }
    
    if (res.status === 403) {
      errorMessage = data.message || '⛔ ليس لديك صلاحية للقيام بهذا الإجراء';
    }
    
    if (res.status === 404) {
      errorMessage = data.message || '🔍 المورد غير موجود';
    }
    
    if (res.status === 429) {
      errorMessage = '⏳ طلبات كثيرة جداً. يرجى الانتظار ثم المحاولة مرة أخرى.';
    }
    
    const error = new Error(errorMessage);
    error.errors = data.errors || null;
    error.status = res.status;
    error.data = data;
    throw error;
  }

  return data;
};

// ============================================================
// ✅ API Object
// ============================================================
const api = {
  // ============================================================
  // ✅ PUBLIC - الحرفيون
  // ============================================================
  
  getFeaturedCraftsmen: async () => {
    try {
      const res = await fetchWithInterceptors(`${API_URL}/craftsmen/featured`, {
        headers: getHeaders(),
      });
      return await handleResponse(res);
    } catch (error) {
      console.warn('⚠️ getFeaturedCraftsmen fallback:', error.message);
      return { craftsmen: [] };
    }
  },

  getCraftsmen: async (params = {}) => {
    console.log('🔵 [api.getCraftsmen] Called with params:', params);
    
    try {
      const query = new URLSearchParams();
      
      const paramMap = {
        craft_id: params.craft_id,
        city: params.city,
        search: params.search,
        sort_by: params.sort_by,
        per_page: params.per_page || 12,
        page: params.page || 1,
        lat: params.lat,
        lng: params.lng,
        radius: params.radius || 100,
        rating: params.rating,
      };
      
      Object.entries(paramMap).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
          query.append(key, value);
        }
      });
      
      console.log('📤 [getCraftsmen] Query:', query.toString());
      
      const res = await fetchWithInterceptors(
        `${API_URL}/craftsmen.home.search?${query.toString()}`,
        { headers: getHeaders() }
      );
      
      const data = await handleResponse(res);
      console.log('✅ [getCraftsmen] Success:', data);
      
      let craftsmen = [];
      let meta = {
        total: 0,
        current_page: params.page || 1,
        last_page: 1,
        per_page: params.per_page || 12,
      };
      
      if (data?.craftsmen) {
        craftsmen = data.craftsmen;
        if (data.meta) meta = { ...meta, ...data.meta };
      } else if (data?.data) {
        craftsmen = data.data;
        if (data.meta) meta = { ...meta, ...data.meta };
      } else if (Array.isArray(data)) {
        craftsmen = data;
        meta.total = data.length;
      }
      
      return {
        craftsmen,
        meta,
        total: meta.total || craftsmen.length,
      };
      
    } catch (error) {
      console.error('❌ [getCraftsmen] Error:', error);
      return { 
        craftsmen: [], 
        meta: { 
          total: 0, 
          current_page: 1, 
          last_page: 1, 
          per_page: 12 
        },
        total: 0,
      };
    }
  },

  searchCraftsmen: async (searchParams = {}) => {
    return api.getCraftsmen(searchParams);
  },

  getCraftsman: async (id) => {
    try {
      const res = await fetchWithInterceptors(`${API_URL}/craftsmen.home.show/${id}`, {
        headers: getHeaders(),
      });
      return await handleResponse(res);
    } catch (error) {
      console.warn('⚠️ getCraftsman fallback:', error.message);
      return { craftsman: null };
    }
  },

  getCrafts: async () => {
    try {
      const res = await fetchWithInterceptors(`${API_URL}/crafts`, {
        headers: getHeaders(),
      });
      return await handleResponse(res);
    } catch (error) {
      console.warn('⚠️ getCrafts fallback:', error.message);
      return { crafts: [] };
    }
  },

  // ============================================================
  // ✅ REVIEWS
  // ============================================================
  
  getReviews: async (params = {}) => {
    console.log('🔵 [api.getReviews] Called with params:', params);
    
    try {
      const query = new URLSearchParams();
      
      const paramMap = {
        per_page: params.per_page || 20,
        page: params.page || 1,
        craftsman_id: params.craftsman_id,
        client_id: params.client_id,
        rating: params.rating,
        sort_by: params.sort_by || 'newest',
      };
      
      Object.entries(paramMap).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
          query.append(key, value);
        }
      });
      
      const url = `${API_URL}/auth/reviews?${query.toString()}`;
      console.log('📤 [api.getReviews] Fetching:', url);
      
      const res = await fetchWithInterceptors(url, { headers: getHeaders() });
      console.log('📥 [api.getReviews] Response status:', res.status);
      
      const data = await handleResponse(res);
      console.log('✅ [api.getReviews] Success:', data);
      
      let reviewsData = [];
      let total = 0;
      let averageRating = 0;
      
      if (data?.reviews?.data) {
        reviewsData = data.reviews.data;
        total = data.reviews.total || reviewsData.length;
        averageRating = data.reviews.average_rating || data.average_rating || 0;
      } else if (data?.data) {
        reviewsData = data.data;
        total = data.total || reviewsData.length;
        averageRating = data.average_rating || 0;
      } else if (Array.isArray(data)) {
        reviewsData = data;
        total = data.length;
      } else if (data?.reviews) {
        reviewsData = data.reviews;
        total = data.reviews.length;
      }
      
      return {
        reviews: {
          data: reviewsData,
          total: total,
          average_rating: averageRating,
        },
        total: total,
        average_rating: averageRating,
      };
      
    } catch (error) {
      console.error('❌ [api.getReviews] Error:', error);
      return { 
        reviews: { 
          data: [], 
          total: 0, 
          average_rating: 0 
        },
        total: 0,
        average_rating: 0,
      };
    }
  },

  getCraftsmanReviews: async (craftsmanId, perPage = 10) => {
    console.log(`🔵 [api.getCraftsmanReviews] Fetching for craftsman: ${craftsmanId}`);
    const result = await api.getReviews({ craftsman_id: craftsmanId, per_page: perPage });
    return result.reviews || { data: [] };
  },

  getClientReviews: async (clientId, perPage = 10) => {
    console.log(`🔵 [api.getClientReviews] Fetching for client: ${clientId}`);
    const result = await api.getReviews({ client_id: clientId, per_page: perPage });
    return result.reviews || { data: [] };
  },

  getReviewsByRating: async (rating, perPage = 10) => {
    console.log(`🔵 [api.getReviewsByRating] Fetching reviews with rating: ${rating}`);
    const result = await api.getReviews({ rating, per_page: perPage });
    return result.reviews || { data: [] };
  },

  addReview: async (bookingId, data) => {
    console.log('🔵 [api.addReview] Adding review for booking:', bookingId, data);
    
    try {
      const res = await fetchWithInterceptors(
        `${API_URL}/client/bookings.addreview/${bookingId}/review`,
        {
          method: "POST",
          headers: getHeaders(),
          body: JSON.stringify(data),
        }
      );
      
      console.log('📥 [api.addReview] Response status:', res.status);
      const result = await handleResponse(res);
      console.log('✅ [api.addReview] Success:', result);
      return result;
    } catch (error) {
      console.error('❌ [api.addReview] Error:', error);
      throw error;
    }
  },

  deleteReview: async (reviewId) => {
    console.log('🔵 [api.deleteReview] Deleting review:', reviewId);
    
    try {
      const res = await fetchWithInterceptors(`${API_URL}/auth/reviews/${reviewId}`, {
        method: "DELETE",
        headers: getHeaders(),
      });
      return await handleResponse(res);
    } catch (error) {
      console.warn('⚠️ deleteReview error:', error.message);
      throw error;
    }
  },

  markReviewHelpful: async (reviewId) => {
    console.log('🔵 [api.markReviewHelpful] Marking review as helpful:', reviewId);
    
    try {
      const res = await fetchWithInterceptors(`${API_URL}/auth/reviews/${reviewId}/helpful`, {
        method: "POST",
        headers: getHeaders(),
      });
      
      console.log('📥 [api.markReviewHelpful] Response status:', res.status);
      const result = await handleResponse(res);
      console.log('✅ [api.markReviewHelpful] Success:', result);
      return result;
    } catch (error) {
      console.warn('⚠️ markReviewHelpful error:', error.message);
      throw error;
    }
  },

  // ============================================================
  // ✅ AUTH
  // ============================================================
  
  login: async (email, password) => {
    try {
      const res = await fetchWithInterceptors(`${API_URL}/auth/login`, {
        method: "POST",
        headers: getHeaders(),
        body: JSON.stringify({ email, password }),
      });
      const data = await handleResponse(res);
      
      // ✅ حفظ التوكن عند نجاح تسجيل الدخول
      if (data.token) {
        localStorage.setItem('token', data.token);
        if (data.refresh_token) {
          localStorage.setItem('refreshToken', data.refresh_token);
        }
        if (data.user) {
          localStorage.setItem('user', JSON.stringify(data.user));
          localStorage.setItem('userRole', data.user.role || '');
          if (data.user.craftsman?.id) {
            localStorage.setItem('craftsmanId', data.user.craftsman.id);
          }
        }
      }
      
      return data;
    } catch (error) {
      console.warn('⚠️ Login error:', error.message);
      if (error.message === "NETWORK_ERROR" || error.message === "Failed to fetch") {
        throw new Error("لا يوجد اتصال بالخادم");
      }
      if (error.message.includes("SERVER_ERROR")) {
        throw new Error("حدث خطأ في الخادم");
      }
      throw error;
    }
  },

  registerClient: async (data) => {
    try {
      const res = await fetchWithInterceptors(`${API_URL}/auth/register/client`, {
        method: "POST",
        headers: getHeaders(),
        body: JSON.stringify(data),
      });
      return await handleResponse(res);
    } catch (error) {
      console.warn('⚠️ registerClient error:', error.message);
      throw error;
    }
  },

  registerCraftsman: async (formData) => {
    try {
      console.log('📤 [API] registerCraftsman called');
      
      let craftIdsFromForm = [];
      
      for (let pair of formData.entries()) {
        if (pair[1] instanceof File) {
          console.log(`   ${pair[0]}: File (${pair[1].name}, ${(pair[1].size / 1024).toFixed(2)} KB, ${pair[1].type})`);
        } else {
          console.log(`   ${pair[0]}: ${pair[1]}`);
          if (pair[0] === 'craft_ids[]') {
            craftIdsFromForm.push(pair[1]);
          }
        }
      }
      
      console.log('📋 [API] craft_ids collected:', craftIdsFromForm);
      
      const phone = formData.get('phone');
      if (phone) {
        let cleanedPhone = phone.replace(/[\s\-\(\)\+]/g, '');
        if (cleanedPhone.length === 10 && !cleanedPhone.startsWith('0')) {
          cleanedPhone = '0' + cleanedPhone;
          formData.set('phone', cleanedPhone);
          console.log(`   ✅ تم تصحيح رقم الهاتف إلى: ${cleanedPhone}`);
        }
        const phoneRegex = /^(010|011|012|015)[0-9]{8}$/;
        if (!phoneRegex.test(cleanedPhone)) {
          throw new Error('رقم الهاتف يجب أن يكون 11 رقم ويبدأ بـ 010, 011, 012 أو 015');
        }
      }
      
      const nationalIdFront = formData.get('national_id_front');
      const nationalIdBack = formData.get('national_id_back');
      
      if (!nationalIdFront || !(nationalIdFront instanceof File)) {
        throw new Error('يرجى تحميل صورة البطاقة الأمامية');
      }
      
      if (!nationalIdBack || !(nationalIdBack instanceof File)) {
        throw new Error('يرجى تحميل صورة البطاقة الخلفية');
      }
      
      const maxSize = 5 * 1024 * 1024;
      if (nationalIdFront.size > maxSize) {
        throw new Error('حجم صورة البطاقة الأمامية كبير جداً (الحد الأقصى 5 ميجابايت)');
      }
      if (nationalIdBack.size > maxSize) {
        throw new Error('حجم صورة البطاقة الخلفية كبير جداً (الحد الأقصى 5 ميجابايت)');
      }
      
      const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png'];
      if (!allowedTypes.includes(nationalIdFront.type)) {
        throw new Error('صيغة البطاقة الأمامية غير مدعومة (يُسمح بـ JPG, JPEG, PNG)');
      }
      if (!allowedTypes.includes(nationalIdBack.type)) {
        throw new Error('صيغة البطاقة الخلفية غير مدعومة (يُسمح بـ JPG, JPEG, PNG)');
      }
      
      const craftIds = formData.getAll('craft_ids[]');
      console.log('📋 [API] craft_ids from getAll:', craftIds);
      
      const customCraft = formData.get('custom_craft');
      
      if ((!craftIds || craftIds.length === 0) && !customCraft) {
        throw new Error('يرجى اختيار مهنة على الأقل أو كتابة مهنة مخصصة');
      }
      
      const res = await fetchWithInterceptors(`${API_URL}/auth/register/craftsman`, {
        method: "POST",
        headers: getFormHeaders(),
        body: formData,
      });
      
      const result = await handleResponse(res);
      console.log('✅ [API] registerCraftsman success:', result);
      return result;
      
    } catch (error) {
      console.warn('⚠️ registerCraftsman error:', error.message);
      if (error.errors) {
        throw error;
      }
      throw error;
    }
  },

  logout: async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        localStorage.removeItem('userRole');
        localStorage.removeItem('craftsmanId');
        localStorage.removeItem('refreshToken');
        return { success: true, message: "تم تسجيل الخروج" };
      }
      
      const res = await fetchWithInterceptors(`${API_URL}/auth/logout`, {
        method: "DELETE",
        headers: getHeaders(),
      });
      
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      localStorage.removeItem('userRole');
      localStorage.removeItem('craftsmanId');
      localStorage.removeItem('refreshToken');
      
      if (!res.ok) {
        console.warn('⚠️ Logout API failed, but token cleared locally');
        return { success: true, message: "تم تسجيل الخروج" };
      }
      
      return await handleResponse(res);
    } catch (error) {
      console.warn('⚠️ logout error:', error.message);
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      localStorage.removeItem('userRole');
      localStorage.removeItem('craftsmanId');
      localStorage.removeItem('refreshToken');
      return { success: true, message: "تم تسجيل الخروج" };
    }
  },

  getMe: async () => {
    try {
      const res = await fetchWithInterceptors(`${API_URL}/auth/me`, {
        headers: getHeaders(),
      });
      const data = await handleResponse(res);
      
      // ✅ تحديث بيانات المستخدم في localStorage
      if (data.user) {
        localStorage.setItem('user', JSON.stringify(data.user));
        localStorage.setItem('userRole', data.user.role || '');
        if (data.user.craftsman?.id) {
          localStorage.setItem('craftsmanId', data.user.craftsman.id);
        }
      }
      
      return data;
    } catch (error) {
      console.warn('⚠️ getMe error:', error.message);
      throw error;
    }
  },

  updateProfile: async (formData) => {
    try {
      const res = await fetchWithInterceptors(`${API_URL}/auth/update-profile`, {
        method: "POST",
        headers: getFormHeaders(),
        body: formData,
      });
      const data = await handleResponse(res);
      
      // ✅ تحديث بيانات المستخدم بعد التحديث
      if (data.user) {
        localStorage.setItem('user', JSON.stringify(data.user));
      }
      
      return data;
    } catch (error) {
      console.warn('⚠️ updateProfile error:', error.message);
      throw error;
    }
  },

  changePassword: async (data) => {
    try {
      const res = await fetchWithInterceptors(`${API_URL}/auth/change-password`, {
        method: "POST",
        headers: getHeaders(),
        body: JSON.stringify(data),
      });
      return await handleResponse(res);
    } catch (error) {
      console.warn('⚠️ changePassword error:', error.message);
      throw error;
    }
  },

  // ============================================================
  // ✅ OTP & VERIFICATION
  // ============================================================
  
  sendOtp: async (email) => {
    try {
      const res = await fetchWithInterceptors(`${API_URL}/auth/otp/send`, {
        method: "POST",
        headers: getHeaders(),
        body: JSON.stringify({ email }),
      });
      return await handleResponse(res);
    } catch (error) {
      console.warn('⚠️ sendOtp error:', error.message);
      throw error;
    }
  },

  verifyOtp: async (email, otp, purpose = 'register') => {
    try {
      const res = await fetchWithInterceptors(`${API_URL}/auth/otp/verify`, {
        method: "POST",
        headers: getHeaders(),
        body: JSON.stringify({ email, otp, purpose }),
      });
      return await handleResponse(res);
    } catch (error) {
      console.warn('⚠️ verifyOtp error:', error.message);
      throw error;
    }
  },

  forgotPassword: async (email) => {
    try {
      const res = await fetchWithInterceptors(`${API_URL}/auth/forgot-password`, {
        method: "POST",
        headers: getHeaders(),
        body: JSON.stringify({ email }),
      });
      return await handleResponse(res);
    } catch (error) {
      console.warn('⚠️ forgotPassword error:', error.message);
      throw error;
    }
  },

  resetPasswordWithOtp: async (reset_token, password, password_confirmation) => {
    try {
      const res = await fetchWithInterceptors(`${API_URL}/auth/reset-password-otp`, {
        method: "POST",
        headers: getHeaders(),
        body: JSON.stringify({ reset_token, password, password_confirmation }),
      });
      return await handleResponse(res);
    } catch (error) {
      console.warn('⚠️ resetPasswordWithOtp error:', error.message);
      throw error;
    }
  },

  // ============================================================
  // ✅ CLIENT ROUTES
  // ============================================================
  
  getMyBookings: async (tab = 'upcoming', page = 1, perPage = 10) => {
    console.log('🔵 [api.getMyBookings] Called with tab:', tab, 'page:', page);
    
    const token = localStorage.getItem("token");
    if (!token) {
      console.warn('⚠️ [api.getMyBookings] No token found');
      return { bookings: { data: [] }, meta: { total: 0 } };
    }

    try {
      const query = new URLSearchParams();
      query.append("tab", tab);
      query.append("page", page);
      query.append("per_page", perPage);
      
      const url = `${API_URL}/client/bookings?${query.toString()}`;
      console.log('📤 [api.getMyBookings] Fetching:', url);
      
      const res = await fetchWithInterceptors(url, { headers: getHeaders() });
      console.log('📥 [api.getMyBookings] Response status:', res.status);
      
      const data = await handleResponse(res);
      console.log('✅ [api.getMyBookings] Success:', data);
      
      let bookingsData = [];
      let meta = { total: 0, current_page: page, last_page: 1, per_page: perPage };
      
      if (data?.bookings?.data) {
        bookingsData = data.bookings.data;
        meta = data.bookings.meta || data.meta || meta;
      } else if (data?.data) {
        bookingsData = data.data;
        meta = data.meta || meta;
      } else if (Array.isArray(data)) {
        bookingsData = data;
        meta.total = data.length;
      } else if (data?.bookings) {
        bookingsData = data.bookings;
        meta.total = data.bookings.length;
      }
      
      return {
        bookings: { 
          data: bookingsData,
          ...meta,
        },
        meta,
        total: meta.total || bookingsData.length,
      };
      
    } catch (error) {
      console.error('❌ [api.getMyBookings] Error:', error);
      return { 
        bookings: { data: [] }, 
        meta: { total: 0, current_page: 1, last_page: 1, per_page: 10 } 
      };
    }
  },

  createBooking: async (data) => {
    console.log('🔵 [api.createBooking] Called with data:', data);
    
    try {
      const res = await fetchWithInterceptors(`${API_URL}/client/bookings.store`, {
        method: "POST",
        headers: getHeaders(),
        body: JSON.stringify(data),
      });
      
      console.log('📥 [api.createBooking] Response status:', res.status);
      
      const result = await handleResponse(res);
      console.log('✅ [api.createBooking] Success:', result);
      return result;
    } catch (error) {
      console.error('❌ [api.createBooking] Error:', error);
      throw error;
    }
  },

  getBooking: async (id) => {
    try {
      const res = await fetchWithInterceptors(`${API_URL}/client/bookings.show/${id}`, {
        headers: getHeaders(),
      });
      return await handleResponse(res);
    } catch (error) {
      console.warn('⚠️ getBooking error:', error.message);
      throw error;
    }
  },

  cancelBooking: async (id, reason = null) => {
    console.log('🔵 [api.cancelBooking] Cancelling booking:', id);
    
    try {
      const res = await fetchWithInterceptors(`${API_URL}/client/bookings.cancel/${id}`, {
        method: "DELETE",
        headers: getHeaders(),
        body: reason ? JSON.stringify({ reason }) : undefined,
      });
      return await handleResponse(res);
    } catch (error) {
      console.warn('⚠️ cancelBooking error:', error.message);
      throw error;
    }
  },

  // ============================================================
  // ✅ CRAFTSMAN ROUTES
  // ============================================================
  
  getCraftsmanStats: async () => {
    try {
      const res = await fetchWithInterceptors(`${API_URL}/craftsman/stats`, {
        headers: getHeaders(),
      });
      return await handleResponse(res);
    } catch (error) {
      console.warn('⚠️ getCraftsmanStats fallback:', error.message);
      return {  
        stats: {  
          total_earnings: 0,  
          completed_bookings: 0,  
          pending_bookings: 0,  
          cancelled_bookings: 0,  
          rating: 0,  
          reviews_count: 0,  
          is_featured: false  
        }  
      };
    }
  },

  updateCraftsmanProfile: async (formData) => {
    try {
      const res = await fetchWithInterceptors(`${API_URL}/craftsman/profile`, {
        method: "POST",
        headers: getFormHeaders(),
        body: formData,
      });
      return await handleResponse(res);
    } catch (error) {
      console.warn('⚠️ updateCraftsmanProfile error:', error.message);
      throw error;
    }
  },

  getCraftsmanBookings: async () => {
    try {
      const res = await fetchWithInterceptors(`${API_URL}/craftsman/bookings`, {
        headers: getHeaders(),
      });
      return await handleResponse(res);
    } catch (error) {
      console.warn('⚠️ getCraftsmanBookings fallback:', error.message);
      return { bookings: { data: [] } };
    }
  },

  updateBookingStatus: async (id, status, reason = null) => {
    console.log(`🔵 [api.updateBookingStatus] Updating booking ${id} to ${status}`);
    
    try {
      const body = { status };
      if (reason) body.reason = reason;
      const res = await fetchWithInterceptors(`${API_URL}/craftsman/bookings/${id}/status`, {
        method: "PATCH",
        headers: getHeaders(),
        body: JSON.stringify(body),
      });
      return await handleResponse(res);
    } catch (error) {
      console.warn('⚠️ updateBookingStatus error:', error.message);
      throw error;
    }
  },

  // ============================================================
  // ✅ SERVICE POSTS (CRAFTSMAN)
  // ============================================================
  
  getServicePosts: async (params = {}) => {
    try {
      const query = new URLSearchParams();
      const paramMap = {
        city: params.city,
        craft_id: params.craft_id,
        urgency: params.urgency,
        search: params.search,
        per_page: params.per_page || 10,
        page: params.page || 1,
        sort_by: params.sort_by || 'newest',
      };
      
      Object.entries(paramMap).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
          query.append(key, value);
        }
      });
      
      const res = await fetchWithInterceptors(
        `${API_URL}/craftsman/service-posts?${query.toString()}`,
        { headers: getHeaders() }
      );
      return await handleResponse(res);
    } catch (error) {
      console.warn('⚠️ getServicePosts fallback:', error.message);
      return { posts: { data: [] } };
    }
  },

  respondToServicePost: async (postId, data) => {
    try {
      const res = await fetchWithInterceptors(
        `${API_URL}/craftsman/service-posts/${postId}/respond`,
        {
          method: "POST",
          headers: getHeaders(),
          body: JSON.stringify(data),
        }
      );
      return await handleResponse(res);
    } catch (error) {
      console.warn('⚠️ respondToServicePost error:', error.message);
      throw error;
    }
  },

  // ============================================================
  // ✅ SERVICE POSTS (CLIENT)
  // ============================================================
  
  getMyPosts: async () => {
    try {
      const res = await fetchWithInterceptors(`${API_URL}/client/my-posts`, {
        headers: getHeaders(),
      });
      return await handleResponse(res);
    } catch (error) {
      console.warn('⚠️ getMyPosts error:', error.message);
      throw error;
    }
  },

  createServicePost: async (formData) => {
    try {
      const res = await fetchWithInterceptors(`${API_URL}/client/service-posts.store`, {
        method: "POST",
        headers: getFormHeaders(),
        body: formData,
      });
      return await handleResponse(res);
    } catch (error) {
      console.warn('⚠️ createServicePost error:', error.message);
      throw error;
    }
  },

  getServicePost: async (id) => {
    try {
      const res = await fetchWithInterceptors(`${API_URL}/client/service-posts/${id}`, {
        headers: getHeaders(),
      });
      return await handleResponse(res);
    } catch (error) {
      console.warn('⚠️ getServicePost error:', error.message);
      throw error;
    }
  },

  deleteServicePost: async (id) => {
    try {
      const res = await fetchWithInterceptors(`${API_URL}/client/service-posts.destroy/${id}`, {
        method: "DELETE",
        headers: getHeaders(),
      });
      return await handleResponse(res);
    } catch (error) {
      console.warn('⚠️ deleteServicePost error:', error.message);
      throw error;
    }
  },

  updatePostResponse: async (postId, responseId, status) => {
    try {
      const res = await fetchWithInterceptors(
        `${API_URL}/client/service-posts/${postId}/responses/${responseId}`,
        {
          method: "PATCH",
          headers: getHeaders(),
          body: JSON.stringify({ status }),
        }
      );
      const data = await handleResponse(res);
      
      return {
        ...data,
        client_info: data.client_info || null,
      };
    } catch (error) {
      console.warn('⚠️ updatePostResponse error:', error.message);
      throw error;
    }
  },

  // ============================================================
  // ✅ UPLOAD
  // ============================================================
  
  uploadImage: async (file, type = "avatar") => {
    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("type", type);
      const res = await fetchWithInterceptors(`${API_URL}/upload/image`, {
        method: "POST",
        headers: getFormHeaders(),
        body: formData,
      });
      return await handleResponse(res);
    } catch (error) {
      console.warn('⚠️ uploadImage error:', error.message);
      throw error;
    }
  },

  uploadMultiple: async (files, type = "portfolio") => {
    try {
      const formData = new FormData();
      files.forEach((file) => formData.append("files[]", file));
      formData.append("type", type);
      const res = await fetchWithInterceptors(`${API_URL}/upload/multiple`, {
        method: "POST",
        headers: getFormHeaders(),
        body: formData,
      });
      return await handleResponse(res);
    } catch (error) {
      console.warn('⚠️ uploadMultiple error:', error.message);
      throw error;
    }
  },

  uploadDocument: async (file) => {
    try {
      const formData = new FormData();
      formData.append("file", file);
      const res = await fetchWithInterceptors(`${API_URL}/upload/document`, {
        method: "POST",
        headers: getFormHeaders(),
        body: formData,
      });
      return await handleResponse(res);
    } catch (error) {
      console.warn('⚠️ uploadDocument error:', error.message);
      throw error;
    }
  },

  deleteFile: async (path) => {
    try {
      const res = await fetchWithInterceptors(`${API_URL}/upload`, {
        method: "DELETE",
        headers: getHeaders(),
        body: JSON.stringify({ path }),
      });
      return await handleResponse(res);
    } catch (error) {
      console.warn('⚠️ deleteFile error:', error.message);
      throw error;
    }
  },

  // ============================================================
  // ✅ NOTIFICATIONS
  // ============================================================
  
  getNotifications: async (unreadOnly = false, perPage = 20) => {
    try {
      const query = new URLSearchParams();
      if (unreadOnly) query.append("unread_only", "true");
      query.append("per_page", perPage);
      const res = await fetchWithInterceptors(
        `${API_URL}/notifications?${query.toString()}`,
        { headers: getHeaders() }
      );
      return await handleResponse(res);
    } catch (error) {
      console.warn('⚠️ getNotifications fallback:', error.message);
      return { notifications: [], unread_count: 0, meta: { total: 0 } };
    }
  },

  getUnreadCount: async () => {
    try {
      const res = await fetchWithInterceptors(`${API_URL}/notifications/count`, {
        headers: getHeaders(),
      });
      return await handleResponse(res);
    } catch (error) {
      console.warn('⚠️ getUnreadCount fallback:', error.message);
      return { unread_count: 0 };
    }
  },

  markNotificationRead: async (id) => {
    try {
      const res = await fetchWithInterceptors(`${API_URL}/notifications/${id}/read`, {
        method: "PATCH",
        headers: getHeaders(),
      });
      return await handleResponse(res);
    } catch (error) {
      console.warn('⚠️ markNotificationRead error:', error.message);
      throw error;
    }
  },

  markAllNotificationsRead: async () => {
    try {
      const res = await fetchWithInterceptors(`${API_URL}/notifications/read-all`, {
        method: "POST",
        headers: getHeaders(),
      });
      return await handleResponse(res);
    } catch (error) {
      console.warn('⚠️ markAllNotificationsRead error:', error.message);
      throw error;
    }
  },

  deleteNotification: async (id) => {
    try {
      const res = await fetchWithInterceptors(`${API_URL}/notifications/${id}`, {
        method: "DELETE",
        headers: getHeaders(),
      });
      return await handleResponse(res);
    } catch (error) {
      console.warn('⚠️ deleteNotification error:', error.message);
      throw error;
    }
  },

  clearAllNotifications: async () => {
    try {
      const res = await fetchWithInterceptors(`${API_URL}/notifications`, {
        method: "DELETE",
        headers: getHeaders(),
      });
      return await handleResponse(res);
    } catch (error) {
      console.warn('⚠️ clearAllNotifications error:', error.message);
      throw error;
    }
  },
};

export default api;