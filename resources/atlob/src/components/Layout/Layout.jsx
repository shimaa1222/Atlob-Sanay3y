// src/components/Layout/Layout.jsx
import React from 'react';
import { useLocation } from 'react-router-dom';
import { useTheme } from '../../context/ThemeContext';
import Header from './Header';
import Footer from './Footer';
import ChatBot from '../ChatBot/ChatBot';

const Layout = ({ children }) => {
  const location = useLocation();
  const { darkMode } = useTheme();
  
  const isAdminRoute = location.pathname.startsWith('/admin');
  const isAuthRoute = ['/login', '/signup', '/verify-email', '/forgot-password', '/select-role'].some(path => 
    location.pathname.startsWith(path)
  );
  
  const showHeaderFooter = !isAdminRoute && !isAuthRoute;

  const colors = {
    bg: darkMode ? '#0f172a' : '#f8fafc',
    text: darkMode ? '#f1f5f9' : '#0f172a',
    border: darkMode ? '#334155' : '#e2e8f0',
  };

  return (
    <div style={{ 
      display: 'flex', 
      flexDirection: 'column', 
      minHeight: '100vh',
      background: colors.bg,
      color: colors.text,
      transition: 'background 0.3s ease, color 0.3s ease',
      fontFamily: "'Cairo', 'Tajawal', sans-serif",
      direction: 'rtl',
    }}>
      {showHeaderFooter && <Header />}
      
      <main style={{ 
        flex: 1, 
        paddingTop: showHeaderFooter ? '64px' : '0',
        width: '100%',
        maxWidth: '100%',
        overflow: 'hidden',
        minHeight: 'calc(100vh - 64px)',
      }}>
        {children}
      </main>
      
      {showHeaderFooter && <Footer />}
      {!isAdminRoute && <ChatBot />}
    </div>
  );
};

export default Layout;