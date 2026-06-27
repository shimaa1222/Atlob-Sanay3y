// src/context/AuthContext.jsx
import React, { createContext, useState, useContext, useEffect } from 'react';
import api from '../services/api';
import { useNavigate } from 'react-router-dom';

// ✅ تصدير useAuth كـ named export
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
};

// ✅ تصدير AuthProvider كـ named export
export const AuthProvider = ({ children }) => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // ✅ التحقق من التوكن عند تحميل التطبيق
  useEffect(() => {
    const checkAuth = async () => {
      const savedToken = localStorage.getItem('token');
      const savedUser = localStorage.getItem('user');
      
      if (savedToken && savedUser) {
        try {
          const data = await api.getMe();
          const userData = {
            id: data.user.id,
            name: data.user.name,
            email: data.user.email,
            role: data.user.role,
            avatar: data.user.avatar_url || null,
            phone: data.user.phone || null,
            craftsman: data.user.craftsman || null,
            email_verified_at: data.user.email_verified_at || null,
          };
          setUser(userData);
          setIsAuthenticated(true);
          localStorage.setItem('user', JSON.stringify(userData));
          localStorage.setItem('userRole', data.user.role);
          
          if (data.user.role === 'craftsman' && data.user.craftsman?.id) {
            localStorage.setItem('craftsmanId', data.user.craftsman.id.toString());
          }
        } catch (error) {
          console.warn('⚠️ Backend not available, clearing session');
          localStorage.removeItem('token');
          localStorage.removeItem('user');
          localStorage.removeItem('userRole');
          localStorage.removeItem('craftsmanId');
          setUser(null);
          setIsAuthenticated(false);
        }
      }
      setLoading(false);
    };

    checkAuth();
  }, []);

  // ============================================================
  // ✅ تسجيل الدخول
  // ============================================================
  const login = async (email, password) => {
    setError(null);
    setLoading(true);

    try {
      // ✅ بيانات تجريبية
      if (email === 'client@demo.com' && password === '12345678') {
        const userData = {
          id: 999,
          name: 'عميل تجريبي',
          email: 'client@demo.com',
          role: 'client',
          avatar: null,
          phone: '01001234567',
          craftsman: null,
          email_verified_at: new Date().toISOString(),
        };
        
        localStorage.setItem('user', JSON.stringify(userData));
        localStorage.setItem('token', 'demo-token-client');
        localStorage.setItem('userRole', 'client');
        
        setUser(userData);
        setIsAuthenticated(true);
        setLoading(false);
        
        return { 
          success: true, 
          user: userData, 
          role: 'client',
          needsVerification: false,
          token: 'demo-token-client',
        };
      }

      if (email === 'craftsman@demo.com' && password === '12345678') {
        const userData = {
          id: 998,
          name: 'حرفي تجريبي',
          email: 'craftsman@demo.com',
          role: 'craftsman',
          avatar: null,
          phone: '01001234568',
          craftsman: { id: 999 },
          email_verified_at: new Date().toISOString(),
        };
        
        localStorage.setItem('user', JSON.stringify(userData));
        localStorage.setItem('token', 'demo-token-craftsman');
        localStorage.setItem('userRole', 'craftsman');
        localStorage.setItem('craftsmanId', '999');
        
        setUser(userData);
        setIsAuthenticated(true);
        setLoading(false);
        
        return { 
          success: true, 
          user: userData, 
          role: 'craftsman',
          needsVerification: false,
          token: 'demo-token-craftsman',
        };
      }

      if (email === 'admin@demo.com' && password === '12345678') {
        const userData = {
          id: 997,
          name: 'أدمن تجريبي',
          email: 'admin@demo.com',
          role: 'admin',
          avatar: null,
          phone: '01001234569',
          craftsman: null,
          email_verified_at: new Date().toISOString(),
        };
        
        localStorage.setItem('user', JSON.stringify(userData));
        localStorage.setItem('token', 'demo-token-admin');
        localStorage.setItem('userRole', 'admin');
        
        setUser(userData);
        setIsAuthenticated(true);
        setLoading(false);
        
        return { 
          success: true, 
          user: userData, 
          role: 'admin',
          needsVerification: false,
          token: 'demo-token-admin',
        };
      }

      // ✅ تسجيل الدخول العادي
      const data = await api.login(email, password);
      
      const userRole = data.user?.role || 'client';
      
      const userData = {
        id: data.user.id,
        name: data.user.name,
        email: data.user.email,
        role: userRole,
        avatar: data.user.avatar_url || null,
        phone: data.user.phone || null,
        craftsman: data.user.craftsman || null,
        email_verified_at: data.user.email_verified_at || null,
      };

      localStorage.setItem('user', JSON.stringify(userData));
      localStorage.setItem('token', data.token);
      localStorage.setItem('userRole', userRole);
      
      if (userRole === 'craftsman' && data.user.craftsman?.id) {
        localStorage.setItem('craftsmanId', data.user.craftsman.id.toString());
      }

      setUser(userData);
      setIsAuthenticated(true);
      setLoading(false);

      const needsVerification = data.user.email_verified_at === null;
      
      if (needsVerification) {
        localStorage.setItem('pendingVerificationEmail', data.user.email);
      }

      return { 
        success: true, 
        user: userData, 
        role: userRole,
        needsVerification: needsVerification,
        token: data.token,
      };

    } catch (err) {
      console.error('❌ Login failed:', err);
      setError(err.message || 'حدث خطأ في تسجيل الدخول');
      setLoading(false);
      
      return { 
        success: false, 
        message: err.message || 'حدث خطأ في تسجيل الدخول',
        role: null,
      };
    }
  };

  // ✅ تسجيل الخروج - محسّن
  const logout = async () => {
    try {
      // محاولة إرسال طلب Logout للـ API
      await api.logout();
    } catch (err) {
      console.warn('⚠️ Logout API error:', err);
    } finally {
      // ✅ دائماً نمسح كل البيانات المحلية
      localStorage.removeItem('user');
      localStorage.removeItem('token');
      localStorage.removeItem('userRole');
      localStorage.removeItem('craftsmanId');
      localStorage.removeItem('pendingVerificationEmail');
      
      setUser(null);
      setIsAuthenticated(false);
      
      // ✅ التوجيه إلى صفحة تسجيل الدخول
      navigate('/login');
    }
  };

  // ✅ تحديث بيانات المستخدم
  const updateUser = (newData) => {
    const updated = { ...user, ...newData };
    localStorage.setItem('user', JSON.stringify(updated));
    setUser(updated);
  };

  const isCustomer = user?.role === 'client' || user?.role === 'customer';
  const isCraftsman = user?.role === 'craftsman';
  const isAdmin = user?.role === 'admin';

  const value = {
    user,
    isAuthenticated,
    loading,
    error,
    login,
    logout,
    updateUser,
    isCustomer,
    isCraftsman,
    isAdmin,
    getToken: () => localStorage.getItem('token'),
    getCraftsmanId: () => localStorage.getItem('craftsmanId'),
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

// ✅ إنشاء AuthContext
const AuthContext = createContext();

// ✅ تصدير افتراضي للتوافق
export default AuthContext;