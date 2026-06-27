import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '../../context/LanguageContext';
import { useTheme } from '../../context/ThemeContext';

const IconSVG = ({ type }) => {
  const iconStyle = { width: '28px', height: '28px', color: '#2563eb' };

  switch (type) {
    case 'كهربائي':
      return (
        <svg {...iconStyle} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"/>
        </svg>
      );
    case 'سباك':
      return (
        <svg {...iconStyle} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="12" r="10"/>
          <path d="M12 6v6l4 2"/>
        </svg>
      );
    case 'نجار':
      return (
        <svg {...iconStyle} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <rect x="2" y="6" width="20" height="12" rx="2"/>
          <path d="M12 18v4M8 22h8"/>
        </svg>
      );
    case 'نقاش':
      return (
        <svg {...iconStyle} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M12 2l8 8-4 4-8-8z"/>
          <path d="M2 22l10-10"/>
        </svg>
      );
    case 'فني تكييف':
      return (
        <svg {...iconStyle} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <rect x="2" y="4" width="20" height="12" rx="2"/>
          <path d="M6 8h12M8 12h8"/>
        </svg>
      );
    case 'بناء':
      return (
        <svg {...iconStyle} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/>
          <circle cx="9" cy="7" r="4"/>
        </svg>
      );
    case 'حداد':
      return (
        <svg {...iconStyle} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="12" r="10"/>
          <line x1="12" y1="8" x2="12" y2="16"/>
          <line x1="8" y1="12" x2="16" y2="12"/>
        </svg>
      );
    case 'تنظيف':
      return (
        <svg {...iconStyle} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/>
          <circle cx="12" cy="7" r="4"/>
        </svg>
      );
    default:
      return null;
  }
};

const categories = [
  { name: 'كهربائي', count: 45 },
  { name: 'سباك', count: 38 },
  { name: 'نجار', count: 32 },
  { name: 'نقاش', count: 28 },
  { name: 'فني تكييف', count: 25 },
  { name: 'بناء', count: 20 },
  { name: 'حداد', count: 15 },
  { name: 'تنظيف', count: 30 }
];

const CategoriesSection = () => {
  const navigate = useNavigate();
  const { t } = useLanguage();
  const { darkMode } = useTheme();

  const styles = {
    section: {
      padding: '80px 0',
      background: darkMode ? '#0f172a' : '#f8fafc',
      transition: 'all 300ms ease'
    },
    container: { maxWidth: '1280px', margin: '0 auto', padding: '0 24px' },
    header: { textAlign: 'center', marginBottom: '48px' },
    title: {
      fontSize: '2rem', fontWeight: '700',
      color: darkMode ? '#f1f5f9' : '#0f172a',
      marginBottom: '8px', transition: 'all 300ms ease'
    },
    subtitle: {
      fontSize: '1.125rem', color: darkMode ? '#94a3b8' : '#475569',
      maxWidth: '500px', margin: '0 auto', transition: 'all 300ms ease'
    },
    grid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: '16px' },
    card: {
      background: darkMode ? '#1e293b' : 'white',
      borderRadius: '16px', padding: '28px 20px',
      textAlign: 'center', cursor: 'pointer',
      border: `1px solid ${darkMode ? '#334155' : '#e2e8f0'}`,
      transition: 'all 250ms ease', display: 'flex', flexDirection: 'column',
      alignItems: 'center', gap: '12px'
    },
    iconWrapper: {
      width: '56px', height: '56px', borderRadius: '12px',
      background: darkMode ? '#1e3a5f' : '#eff6ff',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      transition: 'all 300ms ease'
    },
    name: {
      fontWeight: '600', color: darkMode ? '#e2e8f0' : '#0f172a',
      fontSize: '0.9375rem', transition: 'all 300ms ease'
    },
    count: {
      fontSize: '0.8125rem', color: darkMode ? '#64748b' : '#94a3b8',
      transition: 'all 300ms ease'
    }
  };

  return (
    <section style={styles.section}>
      <div style={styles.container}>
        <div style={styles.header}>
          <h2 style={styles.title}>{t('popularCategories')}</h2>
          <p style={styles.subtitle}>اختر التخصص المناسب واعثر على أفضل الحرفيين في مجالك</p>
        </div>
        <div style={styles.grid}>
          {categories.map((category) => (
            <div
              key={category.name}
              style={styles.card}
              onClick={() => navigate(`/search?q=${encodeURIComponent(category.name)}`)}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-4px)';
                e.currentTarget.style.boxShadow = '0 8px 25px rgba(0,0,0,0.12)';
                e.currentTarget.style.borderColor = '#2563eb';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = 'none';
                e.currentTarget.style.borderColor = darkMode ? '#334155' : '#e2e8f0';
              }}
            >
              <div style={styles.iconWrapper}>
                <IconSVG type={category.name} />
              </div>
              <span style={styles.name}>{category.name}</span>
              <span style={styles.count}>{category.count} {t('craftsman')}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default CategoriesSection;