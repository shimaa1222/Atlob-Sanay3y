import { useState, useEffect, useCallback } from 'react';

export const useLanguage = () => {
  const [lang, setLang] = useState(() => 
    localStorage.getItem('language') || 'ar'
  );

  useEffect(() => {
    const handleChange = () => {
      const newLang = localStorage.getItem('language') || 'ar';
      setLang(newLang);
    };
    
    window.addEventListener('languagechange', handleChange);
    window.addEventListener('storage', (e) => {
      if (e.key === 'language') {
        setLang(e.newValue || 'ar');
      }
    });
    
    return () => {
      window.removeEventListener('languagechange', handleChange);
      window.removeEventListener('storage', handleChange);
    };
  }, []);

  const toggleLanguage = useCallback(() => {
    const newLang = lang === 'ar' ? 'en' : 'ar';
    localStorage.setItem('language', newLang);
    setLang(newLang);
    // إطلاق حدث لتحديث باقي المكونات
    window.dispatchEvent(new Event('languagechange'));
  }, [lang]);

  return { lang, setLang, toggleLanguage };
};