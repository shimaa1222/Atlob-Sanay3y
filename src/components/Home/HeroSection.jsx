import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '../../context/LanguageContext';

<img src="/icon.svg" alt="طلب صناعي" style={{ width: '80px', height: '80px' }} />
const styles = {
  section: {
    position: 'relative',
    background: 'linear-gradient(160deg, #2563eb 0%, #1d4ed8 100%)',
    padding: '120px 0 100px',
    overflow: 'hidden'
  },
  pattern: {
    position: 'absolute', top: 0, left: 0, right: 0, bottom: 0,
    opacity: 0.03,
    backgroundImage: 'radial-gradient(circle at 25% 25%, white 1px, transparent 1px), radial-gradient(circle at 75% 75%, white 1px, transparent 1px)',
    backgroundSize: '60px 60px'
  },
  container: {
    maxWidth: '800px', margin: '0 auto', padding: '0 24px',
    position: 'relative', zIndex: 1, textAlign: 'center'
  },
  title: {
    fontSize: 'clamp(2rem, 5vw, 3rem)', fontWeight: '800',
    color: 'white', lineHeight: '1.15', marginBottom: '16px', letterSpacing: '-0.5px'
  },
  highlight: {
    background: 'linear-gradient(to right, #fbbf24, #f59e0b)',
    WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
    backgroundClip: 'text'
  },
  subtitle: {
    fontSize: '1.125rem', color: 'rgba(255, 255, 255, 0.85)',
    marginBottom: '40px', lineHeight: '1.6', maxWidth: '600px', margin: '0 auto 40px'
  },
  searchWrapper: { maxWidth: '560px', margin: '0 auto' },
  searchBox: {
    display: 'flex', background: 'white', borderRadius: '9999px',
    overflow: 'hidden', boxShadow: '0 8px 30px rgba(0, 0, 0, 0.12)'
  },
  searchInput: {
    flex: 1, padding: '16px 24px', border: 'none',
    fontSize: '1rem', outline: 'none', color: '#0f172a', background: 'transparent'
  },
  searchButton: {
    padding: '16px 32px', background: '#2563eb', color: 'white',
    border: 'none', fontWeight: '700', fontSize: '1rem', cursor: 'pointer'
  },
  tags: {
    display: 'flex', justifyContent: 'center', gap: '10px',
    marginTop: '24px', flexWrap: 'wrap'
  },
  tag: {
    padding: '8px 20px', borderRadius: '9999px',
    background: 'rgba(255, 255, 255, 0.12)', color: 'white',
    fontSize: '0.875rem', fontWeight: '500', cursor: 'pointer',
    border: '1px solid rgba(255, 255, 255, 0.1)',
    transition: 'background 200ms ease'
  }
};

const quickTags = ['سباك', 'كهربائي', 'نجار', 'نقاش', 'تكييف', 'بناء'];

const HeroSection = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const navigate = useNavigate();
  const { t } = useLanguage();

  const handleSearch = () => {
    if (searchTerm.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchTerm.trim())}`);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') handleSearch();
  };

  const handleTagClick = (tag) => {
    navigate(`/search?q=${tag}`);
  };

  return (
    <section style={styles.section}>
      <div style={styles.pattern} />
      <div style={styles.container}>
        <h1 style={styles.title}>
          {t('heroTitle')}{' '}
          <span style={styles.highlight}>{t('heroSubtitle')}</span>
        </h1>
        <p style={styles.subtitle}>{t('heroDescription')}</p>

        <div style={styles.searchWrapper}>
          <div style={styles.searchBox}>
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder={t('search')}
              style={styles.searchInput}
            />
            <button onClick={handleSearch} style={styles.searchButton}>
              {t('searchButton')}
            </button>
          </div>
        </div>

        <div style={styles.tags}>
          {quickTags.map(tag => (
            <span key={tag} onClick={() => handleTagClick(tag)} style={styles.tag}>
              {tag}
            </span>
          ))}
        </div>
      </div>
    </section>
  );
};

export default HeroSection;