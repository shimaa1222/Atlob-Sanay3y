import React, { createContext, useState, useContext, useCallback } from 'react';

const LanguageContext = createContext();

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};

const translations = {
  ar: {
    home: 'الرئيسية',
    services: 'الخدمات',
    reviews: 'التقييمات',
    about: 'عن المنصة',
    login: 'تسجيل الدخول',
    signup: 'إنشاء حساب',
    logout: 'تسجيل الخروج',
    profile: 'الملف الشخصي',
    dashboard: 'لوحة التحكم',
    subscriptions: 'الاشتراكات',
    adminAccess: 'دخول المشرف',
    install: 'تثبيت التطبيق',
    darkMode: 'الوضع الليلي',
    lightMode: 'الوضع النهاري',
    language: 'English',
    search: 'ابحث عن حرفي...',
    heroTitle: 'اعثر على أفضل الحرفيين',
    heroSubtitle: 'لخدماتك المنزلية',
    heroDescription: 'من السباكة والكهرباء إلى النجارة والتكييف، نربطك بأمهر الحرفيين الموثوقين',
    searchButton: 'بحث',
    popularCategories: 'التخصصات الشائعة',
    howItWorks: 'كيف يعمل؟',
    testimonials: 'آراء عملائنا',
    featuredCraftsmen: 'حرفيون متميزون',
    viewAll: 'عرض الكل',
    viewProfile: 'عرض الملف',
    bookNow: 'احجز الآن',
    sendRequest: 'أرسل طلب خدمة',
    browseCraftsmen: 'تصفح الحرفيين',
    myRequests: 'طلباتي',
    welcome: 'مرحباً',
    howCanWeHelp: 'كيف يمكننا مساعدتك اليوم؟',
    step1Title: 'ابحث عن الخدمة',
    step1Description: 'استخدم البحث أو تصفح التخصصات للعثور على الحرفي المناسب لاحتياجك',
    step2Title: 'تواصل مع الحرفي',
    step2Description: 'اطلع على الملفات الشخصية والتقييمات وتواصل مباشرة مع الحرفي',
    step3Title: 'احصل على الخدمة',
    step3Description: 'تمتع بخدمة عالية الجودة وموثوقة لجميع احتياجات منزلك',
    forgotPassword: 'نسيت كلمة المرور؟',
    noAccount: 'ليس لديك حساب؟',
    createAccount: 'إنشاء حساب جديد',
    email: 'البريد الإلكتروني',
    password: 'كلمة المرور',
    role: 'نوع الحساب',
    customer: 'عميل',
    // ✅ craftsman: 'حرفي' - محذوف (موجود تحت)
    fillAllFields: 'يرجى ملء جميع الحقول',
    loginSuccess: 'تم تسجيل الدخول بنجاح',
    pageNotFound: 'الصفحة غير موجودة',
    backToHome: 'العودة للرئيسية',
    notFoundDescription: 'الصفحة التي تبحث عنها غير موجودة أو تم نقلها',
    save: 'حفظ',
    cancel: 'إلغاء',
    delete: 'حذف',
    edit: 'تعديل',
    accept: 'قبول',
    reject: 'رفض',
    searchResults: 'نتائج البحث',
    found: 'تم العثور على',
    noResults: 'لا توجد نتائج',
    // ✅ craftsman: 'حرفي' - محذوف (موجود تحت)
    location: 'الموقع',
    rating: 'التقييم',
    price: 'السعر',
  },
  en: {
    home: 'Home',
    services: 'Services',
    reviews: 'Reviews',
    about: 'About',
    login: 'Login',
    signup: 'Sign Up',
    logout: 'Logout',
    profile: 'Profile',
    dashboard: 'Dashboard',
    subscriptions: 'Subscriptions',
    adminAccess: 'Admin Access',
    install: 'Install App',
    darkMode: 'Dark Mode',
    lightMode: 'Light Mode',
    language: 'العربية',
    search: 'Search for a craftsman...',
    heroTitle: 'Find the Best Craftsmen',
    heroSubtitle: 'For Your Home Services',
    heroDescription: 'From plumbing and electrical to carpentry and AC, we connect you with skilled professionals',
    searchButton: 'Search',
    popularCategories: 'Popular Categories',
    howItWorks: 'How It Works',
    testimonials: 'What Our Clients Say',
    featuredCraftsmen: 'Featured Craftsmen',
    viewAll: 'View All',
    viewProfile: 'View Profile',
    bookNow: 'Book Now',
    sendRequest: 'Send Service Request',
    browseCraftsmen: 'Browse Craftsmen',
    myRequests: 'My Requests',
    welcome: 'Welcome',
    howCanWeHelp: 'How can we help you today?',
    step1Title: 'Search for Service',
    step1Description: 'Use search or browse categories to find the right craftsman for your needs',
    step2Title: 'Contact the Craftsman',
    step2Description: 'View profiles and ratings, and communicate directly with the craftsman',
    step3Title: 'Get the Service',
    step3Description: 'Enjoy high-quality and reliable service for all your home needs',
    forgotPassword: 'Forgot Password?',
    noAccount: 'Don\'t have an account?',
    createAccount: 'Create New Account',
    email: 'Email',
    password: 'Password',
    role: 'Account Type',
    customer: 'Customer',
    // ✅ craftsman: 'Craftsman' - محذوف (موجود تحت)
    fillAllFields: 'Please fill in all fields',
    loginSuccess: 'Login Successful',
    pageNotFound: 'Page Not Found',
    backToHome: 'Back to Home',
    notFoundDescription: 'The page you are looking for does not exist or has been moved',
    save: 'Save',
    cancel: 'Cancel',
    delete: 'Delete',
    edit: 'Edit',
    accept: 'Accept',
    reject: 'Reject',
    searchResults: 'Search Results',
    found: 'Found',
    noResults: 'No Results',
    // ✅ craftsman: 'Craftsman' - محذوف (موجود تحت)
    location: 'Location',
    rating: 'Rating',
    price: 'Price',
  }
};

// ✅ أضف craftsman هنا في الأماكن الصح
translations.ar.craftsman = 'حرفي';
translations.en.craftsman = 'Craftsman';

export const LanguageProvider = ({ children }) => {
  const [language, setLanguage] = useState(() => {
    try {
      return localStorage.getItem('language') || 'ar';
    } catch {
      return 'ar';
    }
  });

  const changeLanguage = useCallback((lang) => {
    setLanguage(lang);
    localStorage.setItem('language', lang);
    document.documentElement.lang = lang;
    document.documentElement.dir = lang === 'ar' ? 'rtl' : 'ltr';
  }, []);

  const toggleLanguage = useCallback(() => {
    changeLanguage(language === 'ar' ? 'en' : 'ar');
  }, [language, changeLanguage]);

  const t = useCallback((key, fallback = '') => {
    return translations[language]?.[key] || translations['ar']?.[key] || fallback || key;
  }, [language]);

  const value = {
    language,
    changeLanguage,
    toggleLanguage,
    t,
    isArabic: language === 'ar'
  };

  return (
    <LanguageContext.Provider value={value}>
      {children}
    </LanguageContext.Provider>
  );
};

export default LanguageContext;