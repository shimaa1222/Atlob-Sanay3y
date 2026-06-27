// src/App.jsx
import React, { lazy, Suspense } from 'react';
import { Routes, Route } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import { AuthProvider } from './context/AuthContext';
import { LanguageProvider } from './context/LanguageContext';
import Layout from './components/Layout/Layout';
import ProtectedRoute from './components/ProtectedRoute';

// ============================================================
// ✅ جميع الـ Imports في الأعلى (تم النقل من الأسفل)
// ============================================================
import HomePage from './pages/HomePage';
import AboutPage from './pages/AboutPage';
import RoleSelectionPage from './pages/RoleSelectionPage';
import LoginPage from './pages/LoginPage';
import ForgotPasswordPage from './pages/ForgotPasswordPage';
import CustomerSignupPage from './pages/CustomerSignupPage';
import CraftsmanSignupPage from './pages/CraftsmanSignupPage';
import VerifyEmailPage from './pages/VerifyEmailPage';
import HelpSupportPage from './pages/HelpSupportPage';
import TermsConditionsPage from './pages/TermsConditionsPage';
import NotFoundPage from './pages/NotFoundPage';
import SearchResultsPage from './pages/SearchResultsPage';
import RequestServicePage from './pages/RequestServicePage';
import BookingPage from './pages/BookingPage';
import BookingDetailsPage from './pages/BookingDetailsPage';
import CraftsmanProfilePage from './pages/CraftsmanProfilePage';
import CustomerProfilePage from './pages/CustomerProfilePage';
import CraftsmanDetailPage from './pages/CraftsmanDetailPage';
import ReviewsListPage from './pages/ReviewsListPage';
import SubscriptionPage from './pages/SubscriptionPage';
import CustomerHomePage from './pages/CustomerHomePage';
import CraftsmanHomePage from './pages/CraftsmanHomePage';
import CraftsmanDashboardPage from './pages/CraftsmanDashboardPage';
import CraftsmanBookingsPage from './pages/CraftsmanBookingsPage';
import MyBookingsPage from './pages/MyBookingsPage';
import MyRequestsPage from './pages/MyRequestsPage';
import NotificationsViewPage from './pages/NotificationsViewPage';
import ServicePostDetailPage from './pages/ServicePostDetailPage';
import CraftsmanPostsPage from './pages/CraftsmanPostsPage';

// ============================================================
// ✅ Error Boundary Component
// ============================================================
class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('❌ ErrorBoundary caught:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '40px 20px',
          background: '#f8fafc',
          fontFamily: "'Cairo', sans-serif",
          direction: 'rtl',
          textAlign: 'center',
        }}>
          <div style={{
            maxWidth: '500px',
            padding: '48px 40px',
            background: '#ffffff',
            borderRadius: '24px',
            boxShadow: '0 20px 60px rgba(0,0,0,0.1)',
          }}>
            <div style={{ fontSize: '64px', marginBottom: '16px' }}>😅</div>
            <h2 style={{
              fontSize: '1.5rem',
              fontWeight: 700,
              color: '#0f172a',
              marginBottom: '12px',
            }}>
              عذراً، حدث خطأ غير متوقع
            </h2>
            <p style={{
              color: '#64748b',
              fontSize: '0.95rem',
              lineHeight: 1.6,
              marginBottom: '24px',
            }}>
              نحن نعمل على حل المشكلة. يرجى المحاولة مرة أخرى أو تحديث الصفحة.
            </p>
            <div style={{ display: 'flex', gap: '12px', justifyContent: 'center', flexWrap: 'wrap' }}>
              <button
                onClick={() => window.location.reload()}
                style={{
                  padding: '12px 32px',
                  borderRadius: '12px',
                  border: 'none',
                  background: 'linear-gradient(135deg, #2563eb, #3b82f6)',
                  color: 'white',
                  cursor: 'pointer',
                  fontWeight: 700,
                  fontSize: '1rem',
                  fontFamily: "'Cairo', sans-serif",
                  transition: 'all 0.3s ease',
                  boxShadow: '0 4px 16px rgba(59,130,246,0.3)',
                }}
                onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.02)'}
                onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
              >
                🔄 تحديث الصفحة
              </button>
              <button
                onClick={() => window.location.href = '/'}
                style={{
                  padding: '12px 32px',
                  borderRadius: '12px',
                  border: `2px solid #e2e8f0`,
                  background: 'transparent',
                  color: '#0f172a',
                  cursor: 'pointer',
                  fontWeight: 600,
                  fontSize: '1rem',
                  fontFamily: "'Cairo', sans-serif",
                  transition: 'all 0.3s ease',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor = '#3b82f6';
                  e.currentTarget.style.color = '#3b82f6';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = '#e2e8f0';
                  e.currentTarget.style.color = '#0f172a';
                }}
              >
                🏠 الصفحة الرئيسية
              </button>
            </div>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

// ============================================================
// ✅ Offline Detection Component
// ============================================================
const OfflineDetector = ({ children }) => {
  const [isOnline, setIsOnline] = React.useState(navigator.onLine);

  React.useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  if (!isOnline) {
    return (
      <div style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '40px 20px',
        background: '#f8fafc',
        fontFamily: "'Cairo', sans-serif",
        direction: 'rtl',
        textAlign: 'center',
      }}>
        <div style={{
          maxWidth: '450px',
          padding: '48px 40px',
          background: '#ffffff',
          borderRadius: '24px',
          boxShadow: '0 20px 60px rgba(0,0,0,0.1)',
        }}>
          <div style={{ fontSize: '64px', marginBottom: '16px' }}>📡</div>
          <h2 style={{
            fontSize: '1.5rem',
            fontWeight: 700,
            color: '#0f172a',
            marginBottom: '12px',
          }}>
            أنت غير متصل بالإنترنت
          </h2>
          <p style={{
            color: '#64748b',
            fontSize: '0.95rem',
            lineHeight: 1.6,
            marginBottom: '24px',
          }}>
            يرجى التحقق من اتصالك بالشبكة والمحاولة مرة أخرى.
          </p>
          <button
            onClick={() => window.location.reload()}
            style={{
              padding: '12px 32px',
              borderRadius: '12px',
              border: 'none',
              background: 'linear-gradient(135deg, #2563eb, #3b82f6)',
              color: 'white',
              cursor: 'pointer',
              fontWeight: 700,
              fontSize: '1rem',
              fontFamily: "'Cairo', sans-serif",
              transition: 'all 0.3s ease',
              boxShadow: '0 4px 16px rgba(59,130,246,0.3)',
            }}
            onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.02)'}
            onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
          >
            🔄 إعادة المحاولة
          </button>
        </div>
      </div>
    );
  }

  return children;
};

// ============================================================
// ✅ Loading Fallback
// ============================================================
const LoadingFallback = () => (
  <div style={{
    minHeight: '100vh',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    background: '#f8fafc',
    fontFamily: "'Cairo', sans-serif",
  }}>
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      gap: '16px',
    }}>
      <div style={{
        width: '48px',
        height: '48px',
        border: '4px solid #e2e8f0',
        borderTopColor: '#3b82f6',
        borderRadius: '50%',
        animation: 'spin 0.8s linear infinite',
      }} />
      <p style={{
        color: '#64748b',
        fontSize: '0.95rem',
        fontWeight: 500,
      }}>
        جاري تحميل الصفحة...
      </p>
    </div>
  </div>
);

// ============================================================
// ProfileRouter
// ============================================================
const ProfileRouter = () => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontFamily: "'Cairo', sans-serif",
        direction: 'rtl',
      }}>
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '16px',
        }}>
          <div style={{
            width: '48px',
            height: '48px',
            border: '4px solid #e2e8f0',
            borderTopColor: '#3b82f6',
            borderRadius: '50%',
            animation: 'spin 0.8s linear infinite',
          }} />
          <p style={{ color: '#64748b', fontSize: '0.95rem', fontWeight: 500 }}>
            جاري تحميل الملف الشخصي...
          </p>
        </div>
      </div>
    );
  }

  if (!user) return null;

  if (user?.role === 'craftsman') {
    return <CraftsmanProfilePage />;
  }
  
  if (user?.role === 'client' || user?.role === 'customer') {
    return <CustomerProfilePage />;
  }
  
  return <CustomerProfilePage />;
};

// ============================================================
// ✅ App Component
// ============================================================
function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider>
        <LanguageProvider>
          <AuthProvider>
            <OfflineDetector>
              <Layout>
                <Suspense fallback={<LoadingFallback />}>
                  <Routes>
                    {/* ===== صفحات عامة ===== */}
                    <Route path="/" element={<HomePage />} />
                    <Route path="/about" element={<AboutPage />} />
                    <Route path="/select-role" element={<RoleSelectionPage />} />
                    <Route path="/login" element={<LoginPage />} />
                    <Route path="/forgot-password" element={<ForgotPasswordPage />} />
                    <Route path="/signup/customer" element={<CustomerSignupPage />} />
                    <Route path="/signup/craftsman" element={<CraftsmanSignupPage />} />
                    <Route path="/verify-email" element={<VerifyEmailPage />} />
                    <Route path="/help" element={<HelpSupportPage />} />
                    <Route path="/terms" element={<TermsConditionsPage />} />

                    {/* ===== صفحات محمية ===== */}
                    <Route path="/search" element={
                      <ProtectedRoute>
                        <SearchResultsPage />
                      </ProtectedRoute>
                    } />
                    <Route path="/request-service" element={
                      <ProtectedRoute>
                        <RequestServicePage />
                      </ProtectedRoute>
                    } />
                    <Route path="/booking/:id" element={
                      <ProtectedRoute>
                        <BookingPage />
                      </ProtectedRoute>
                    } />
                    
                    <Route path="/booking-details/:id" element={
                      <ProtectedRoute>
                        <BookingDetailsPage />
                      </ProtectedRoute>
                    } />
                    
                    <Route path="/craftsman/:id" element={
                      <ProtectedRoute>
                        <CraftsmanDetailPage />
                      </ProtectedRoute>
                    } />

                    <Route path="/reviews" element={
                      <ReviewsListPage />
                    } />

                    <Route path="/my-reviews" element={
                      <ProtectedRoute>
                        <ReviewsListPage />
                      </ProtectedRoute>
                    } />

                    <Route path="/notifications" element={
                      <ProtectedRoute>
                        <NotificationsViewPage />
                      </ProtectedRoute>
                    } />
                    <Route path="/service-post/:id" element={
                      <ProtectedRoute>
                        <ServicePostDetailPage />
                      </ProtectedRoute>
                    } />

                    {/* ===== صفحات العميل ===== */}
                    <Route path="/customer/home" element={
                      <ProtectedRoute requiredRole="client">
                        <CustomerHomePage />
                      </ProtectedRoute>
                    } />
                    <Route path="/my-bookings" element={
                      <ProtectedRoute requiredRole="client">
                        <MyBookingsPage />
                      </ProtectedRoute>
                    } />
                    <Route path="/my-requests" element={
                      <ProtectedRoute requiredRole="client">
                        <MyRequestsPage />
                      </ProtectedRoute>
                    } />

                    {/* ===== صفحات الحرفي ===== */}
                    <Route path="/craftsman/home" element={
                      <ProtectedRoute requiredRole="craftsman">
                        <CraftsmanHomePage />
                      </ProtectedRoute>
                    } />
                    
                    <Route path="/craftsman/dashboard" element={
                      <ProtectedRoute requiredRole="craftsman">
                        <CraftsmanDashboardPage />
                      </ProtectedRoute>
                    } />
                    
                    <Route path="/craftsman/bookings" element={
                      <ProtectedRoute requiredRole="craftsman">
                        <CraftsmanBookingsPage />
                      </ProtectedRoute>
                    } />
                    
                    <Route path="/subscription" element={
                      <ProtectedRoute requiredRole="craftsman">
                        <SubscriptionPage />
                      </ProtectedRoute>
                    } />
                    <Route path="/craftsman/posts" element={
                      <ProtectedRoute requiredRole="craftsman">
                        <CraftsmanPostsPage />
                      </ProtectedRoute>
                    } />

                    {/* ===== الملف الشخصي ===== */}
                    <Route path="/profile" element={
                      <ProtectedRoute>
                        <ProfileRouter />
                      </ProtectedRoute>
                    } />

                    {/* ===== 404 ===== */}
                    <Route path="*" element={<NotFoundPage />} />
                  </Routes>
                </Suspense>
              </Layout>
            </OfflineDetector>
          </AuthProvider>
        </LanguageProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

// ============================================================
// ✅ CSS للـ Animations
// ============================================================
const style = document.createElement('style');
style.textContent = `
  @keyframes spin {
    from { transform: rotate(0deg); }
    to { transform: rotate(360deg); }
  }
`;
document.head.appendChild(style);

export default App;