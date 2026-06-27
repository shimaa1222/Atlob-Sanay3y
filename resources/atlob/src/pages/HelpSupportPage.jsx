// src/pages/HelpSupportPage.jsx
import React, { useState, useEffect } from 'react';
import { useTheme } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext'; // ✅ إضافة
import api from '../services/api'; // ✅ إضافة
import { 
  HelpCircle, Mail, Phone, Clock, MessageSquare, 
  ChevronDown, Send, CheckCircle, MapPin, 
  Smartphone, Globe, Shield, Star, Users,
  Search, BookOpen, Video, FileText, HeadphonesIcon,
  AlertCircle, ThumbsUp, Loader, X
} from 'lucide-react';

const HelpSupportPage = () => {
  const { darkMode } = useTheme();
  const { user, isAuthenticated } = useAuth(); // ✅ إضافة
  const [lang, setLang] = useState('ar');
  const [openId, setOpenId] = useState(null);
  const [sent, setSent] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState('faq');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState('');
  const [hoveredCard, setHoveredCard] = useState(null);
  const [faqs, setFaqs] = useState([]); // ✅ من الـ API
  const [loadingFaqs, setLoadingFaqs] = useState(true); // ✅ حالة تحميل

  const [form, setForm] = useState({ 
    name: '', 
    email: '', 
    subject: '', 
    message: '' 
  });

  // ============================================================
  // 🌍 Language
  // ============================================================
  useEffect(() => {
    const savedLang = localStorage.getItem('language') || 'ar';
    setLang(savedLang);
    
    const handleLanguageChange = () => {
      const currentLang = localStorage.getItem('language') || 'ar';
      setLang(currentLang);
    };
    
    window.addEventListener('languagechange', handleLanguageChange);
    return () => window.removeEventListener('languagechange', handleLanguageChange);
  }, []);

  // ============================================================
  // ✅ جلب الأسئلة الشائعة من الـ Backend
  // ============================================================
  useEffect(() => {
    const loadFaqs = async () => {
      setLoadingFaqs(true);
      try {
        const data = await api.getFaqs();
        setFaqs(data.faqs || []);
      } catch (error) {
        console.warn('⚠️ Using fallback FAQs:', error);
        // ✅ Fallback FAQs
        const fallbackFaqs = lang === 'ar' ? [
          { id: 1, question: 'كيف يعمل تطبيق اطلب صنايعي؟', answer: 'يمكنك البحث عن حرفي أو إرسال طلب خدمة، وسنقوم بربطك بالمختص المناسب بناءً على موقعك وتقييمات الحرفيين. كل ما عليك هو اختيار التخصص المناسب وتحديد موعد الخدمة.' },
          { id: 2, question: 'كيف أقوم بحجز خدمة جديدة؟', answer: 'يمكنك إرسال طلب خدمة من الصفحة الرئيسية، أو البحث عن حرفي والضغط على زر "احجز الآن" في ملفه الشخصي. ستتلقى تأكيداً فورياً بالحجز.' },
          { id: 3, question: 'هل يمكنني تقييم الحرفي؟', answer: 'نعم، بعد اكتمال الخدمة يمكنك تقييم الحرفي وكتابة مراجعة عن تجربتك. تقييمك يساعد العملاء الآخرين في اختيار الحرفي المناسب.' },
          { id: 4, question: 'ما هي طرق الدفع المتاحة؟', answer: 'نوفر طرق دفع متعددة: الدفع نقداً، InstaPay، Vodafone Cash، Etisalat Cash، Orange Cash، وبطاقات الائتمان.' },
          { id: 5, question: 'كيف أتأكد من أن الحرفي موثوق؟', answer: 'جميع الحرفيين يمرون بعملية تحقق صارمة من الهوية والمهارات. يمكنك الاطلاع على التقييمات والمراجعات من العملاء السابقين.' },
          { id: 6, question: 'هل يمكنني إلغاء الحجز؟', answer: 'نعم، يمكنك إلغاء الحجز قبل موعد الخدمة بـ 24 ساعة على الأقل دون أي رسوم.' },
        ] : [
          { id: 1, question: 'How does Atlob Sanay3y work?', answer: 'You can search for a craftsman or send a service request, and we will connect you with the right specialist based on your location and craftsman ratings. All you need to do is choose the appropriate specialty and schedule the service.' },
          { id: 2, question: 'How do I book a new service?', answer: 'You can send a service request from the home page, or search for a craftsman and click "Book Now" on their profile. You will receive instant booking confirmation.' },
          { id: 3, question: 'Can I rate the craftsman?', answer: 'Yes, after the service is completed, you can rate the craftsman and write a review about your experience. Your rating helps other customers choose the right craftsman.' },
          { id: 4, question: 'What payment methods are available?', answer: 'We offer multiple payment methods: Cash, InstaPay, Vodafone Cash, Etisalat Cash, Orange Cash, and credit cards.' },
          { id: 5, question: 'How do I verify that the craftsman is trustworthy?', answer: 'All craftsmen undergo a strict identity and skills verification process. You can view ratings and reviews from previous customers.' },
          { id: 6, question: 'Can I cancel a booking?', answer: 'Yes, you can cancel your booking at least 24 hours before the service time without any fees.' },
        ];
        setFaqs(fallbackFaqs);
      }
      setLoadingFaqs(false);
    };
    loadFaqs();
  }, [lang]);

  // ============================================================
  // ✅ دوال النموذج
  // ============================================================
  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
    if (submitError) setSubmitError('');
  };

  // ============================================================
  // ✅ إرسال رسالة الدعم
  // ============================================================
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // ✅ التحقق من صحة البيانات
    if (!form.name.trim() || !form.email.trim() || !form.subject.trim() || !form.message.trim()) {
      setSubmitError(lang === 'ar' ? 'يرجى ملء جميع الحقول' : 'Please fill in all fields');
      return;
    }

    setIsSubmitting(true);
    setSubmitError('');

    try {
      // ✅ إرسال الرسالة إلى الـ Backend
      await api.sendContactMessage({
        name: form.name,
        email: form.email,
        subject: form.subject,
        message: form.message,
        user_id: user?.id || null,
      });
      
      setSent(true);
      setForm({ name: '', email: '', subject: '', message: '' });
      
      // ✅ إخفاء رسالة النجاح بعد 5 ثواني
      setTimeout(() => setSent(false), 5000);
      
    } catch (error) {
      console.error('❌ Error sending message:', error);
      setSubmitError(error.message || (lang === 'ar' ? 'حدث خطأ في إرسال الرسالة' : 'Error sending message'));
    } finally {
      setIsSubmitting(false);
    }
  };

  // ============================================================
  // 📝 Translations
  // ============================================================
  const t = {
    title: lang === 'ar' ? 'مركز المساعدة والدعم' : 'Help & Support Center',
    subtitle: lang === 'ar' ? 'نحن هنا لمساعدتك! اعثر على إجابات لأسئلتك أو تواصل معنا مباشرة' : 'We are here to help! Find answers to your questions or contact us directly',
    searchPlaceholder: lang === 'ar' ? 'ابحث عن إجابتك هنا...' : 'Search for your answer here...',
    faqTab: lang === 'ar' ? 'الأسئلة الشائعة' : 'FAQ',
    contactTab: lang === 'ar' ? 'اتصل بنا' : 'Contact Us',
    guidesTab: lang === 'ar' ? 'أدلة الاستخدام' : 'Guides',
    contactInfo: lang === 'ar' ? 'معلومات التواصل' : 'Contact Information',
    email: lang === 'ar' ? 'البريد الإلكتروني' : 'Email',
    emailValue: 'support@atlobsanay3y.com',
    phone: lang === 'ar' ? 'رقم الهاتف' : 'Phone Number',
    phoneValue: '19555',
    workingHours: lang === 'ar' ? 'ساعات العمل' : 'Working Hours',
    workingHoursValue: lang === 'ar' ? 'السبت - الخميس: 9 صباحاً - 9 مساءً' : 'Sat - Thu: 9 AM - 9 PM',
    address: lang === 'ar' ? 'العنوان' : 'Address',
    addressValue: lang === 'ar' ? 'القاهرة، مصر' : 'Cairo, Egypt',
    sendMessage: lang === 'ar' ? 'أرسل لنا رسالة' : 'Send us a Message',
    name: lang === 'ar' ? 'الاسم الكامل' : 'Full Name',
    emailLabel: lang === 'ar' ? 'البريد الإلكتروني' : 'Email Address',
    subject: lang === 'ar' ? 'الموضوع' : 'Subject',
    message: lang === 'ar' ? 'الرسالة' : 'Message',
    send: lang === 'ar' ? 'إرسال الرسالة' : 'Send Message',
    successMessage: lang === 'ar' ? '✅ تم إرسال رسالتك بنجاح! سنتواصل معك قريباً.' : '✅ Your message has been sent successfully! We will contact you soon.',
    quickLinks: lang === 'ar' ? 'روابط سريعة' : 'Quick Links',
    loading: lang === 'ar' ? 'جاري التحميل...' : 'Loading...',
    error: lang === 'ar' ? 'حدث خطأ' : 'Error',
    retry: lang === 'ar' ? 'إعادة المحاولة' : 'Retry',
    fillAllFields: lang === 'ar' ? 'يرجى ملء جميع الحقول' : 'Please fill in all fields',
    sending: lang === 'ar' ? 'جاري الإرسال...' : 'Sending...',
    noFaqs: lang === 'ar' ? 'لا توجد أسئلة شائعة' : 'No FAQs found',
    guides: lang === 'ar' ? [
      { icon: <BookOpen size={24} />, title: 'دليل المستخدم', desc: 'تعلم كيفية استخدام المنصة خطوة بخطوة' },
      { icon: <Video size={24} />, title: 'فيديوهات تعليمية', desc: 'شاهد فيديوهات توضيحية لاستخدام المنصة' },
      { icon: <FileText size={24} />, title: 'المدونة', desc: 'اقرأ مقالات ونصائح عن الخدمات المنزلية' },
    ] : [
      { icon: <BookOpen size={24} />, title: 'User Guide', desc: 'Learn how to use the platform step by step' },
      { icon: <Video size={24} />, title: 'Video Tutorials', desc: 'Watch instructional videos on using the platform' },
      { icon: <FileText size={24} />, title: 'Blog', desc: 'Read articles and tips about home services' },
    ],
  };

  // ============================================================
  // 🔍 فلترة الأسئلة
  // ============================================================
  const filteredFaqs = faqs.filter(faq => 
    faq.question?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    faq.answer?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // ============================================================
  // 🎨 Dynamic Colors
  // ============================================================
  const bgColor = darkMode ? '#0f172a' : '#f8fafc';
  const cardBg = darkMode ? '#1e293b' : '#ffffff';
  const textColor = darkMode ? '#f1f5f9' : '#0f172a';
  const textSecondary = darkMode ? '#94a3b8' : '#64748b';
  const borderColor = darkMode ? '#334155' : '#e2e8f0';
  const inputBg = darkMode ? '#0f172a' : '#ffffff';
  const gradientBg = darkMode 
    ? 'linear-gradient(160deg, #0f172a 0%, #1e293b 100%)'
    : 'linear-gradient(160deg, #0f172a 0%, #1e293b 100%)';

  // ============================================================
  // 🎨 Render
  // ============================================================
  return (
    <div style={{ background: bgColor, minHeight: '100vh', fontFamily: "'Cairo', sans-serif" }}>
      <style>{`
        @keyframes fadeInUp {
          from { opacity: 0; transform: translateY(30px); }
          to { opacity: 1; transform: translateY(0); }
        }
        
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        
        @keyframes slideDown {
          from { opacity: 0; max-height: 0; }
          to { opacity: 1; max-height: 500px; }
        }
        
        @keyframes pulse {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.05); }
        }
        
        @keyframes float {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-10px); }
        }
        
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        
        .animate-fade-in-up {
          animation: fadeInUp 0.6s ease forwards;
        }
        
        .animate-fade-in {
          animation: fadeIn 0.4s ease forwards;
        }
        
        .animate-slide-down {
          animation: slideDown 0.4s ease forwards;
        }
        
        .animate-float {
          animation: float 3s ease-in-out infinite;
        }
        
        .animate-spin {
          animation: spin 1s linear infinite;
        }
        
        .delay-100 { animation-delay: 0.1s; }
        .delay-200 { animation-delay: 0.2s; }
        .delay-300 { animation-delay: 0.3s; }
        .delay-400 { animation-delay: 0.4s; }
        .delay-500 { animation-delay: 0.5s; }
        
        .hover-scale {
          transition: all 0.3s ease;
        }
        
        .hover-scale:hover {
          transform: translateY(-5px);
          box-shadow: 0 20px 40px rgba(0,0,0,0.15);
        }
        
        .faq-answer-enter {
          animation: slideDown 0.4s ease forwards;
        }
        
        .suggestion-hover:hover {
          transform: translateX(-4px);
        }
        
        @media (max-width: 768px) {
          .hero-title {
            font-size: 2rem !important;
          }
          .tab-button {
            font-size: 0.875rem !important;
            padding: 10px 16px !important;
          }
          .contact-grid {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>

      {/* ===== Hero Section ===== */}
      <div style={{
        background: gradientBg,
        color: 'white',
        padding: '80px 0 60px',
        textAlign: 'center',
        position: 'relative',
        overflow: 'hidden',
      }}>
        {/* Decorative elements */}
        <div style={{
          position: 'absolute',
          top: -50,
          right: -50,
          width: '200px',
          height: '200px',
          borderRadius: '50%',
          background: 'rgba(59,130,246,0.1)',
          animation: 'float 4s ease-in-out infinite',
        }} />
        <div style={{
          position: 'absolute',
          bottom: -30,
          left: -30,
          width: '150px',
          height: '150px',
          borderRadius: '50%',
          background: 'rgba(139,92,246,0.1)',
          animation: 'float 5s ease-in-out infinite 1s',
        }} />
        
        <div style={{
          maxWidth: '700px',
          margin: '0 auto',
          padding: '0 24px',
          position: 'relative',
          zIndex: 1,
        }}>
          <div className="animate-fade-in-up" style={{ marginBottom: '20px' }}>
            <div style={{
              width: '80px',
              height: '80px',
              borderRadius: '20px',
              background: 'rgba(255,255,255,0.1)',
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              backdropFilter: 'blur(10px)',
            }}>
              <HelpCircle size={40} />
            </div>
          </div>
          
          <h1 className="animate-fade-in-up delay-200" style={{
            fontSize: '2.5rem',
            fontWeight: 800,
            marginBottom: '16px',
            letterSpacing: '-0.5px',
          }}>
            {t.title}
          </h1>
          
          <p className="animate-fade-in-up delay-300" style={{
            fontSize: '1.1rem',
            opacity: 0.9,
            lineHeight: 1.6,
          }}>
            {t.subtitle}
          </p>
        </div>
        
        {/* Wave bottom */}
        <div style={{
          position: 'absolute',
          bottom: 0,
          left: 0,
          right: 0,
          height: '40px',
          background: bgColor,
          borderRadius: '50% 50% 0 0',
          transform: 'scaleX(1.5)',
        }} />
      </div>

      {/* ===== Main Content ===== */}
      <div style={{
        maxWidth: '900px',
        margin: '0 auto',
        padding: '40px 24px',
      }}>
        
        {/* ===== Search Bar ===== */}
        <div className="animate-fade-in-up delay-100" style={{
          marginBottom: '40px',
          position: 'relative',
        }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            background: cardBg,
            borderRadius: '16px',
            border: `2px solid ${borderColor}`,
            padding: '4px',
            boxShadow: '0 4px 16px rgba(0,0,0,0.05)',
            transition: 'all 0.3s ease',
          }}>
            <div style={{
              padding: '12px 16px',
              color: textSecondary,
            }}>
              <Search size={20} />
            </div>
            <input 
              type="text"
              placeholder={t.searchPlaceholder}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{
                flex: 1,
                padding: '12px',
                border: 'none',
                outline: 'none',
                fontSize: '1rem',
                background: 'transparent',
                color: textColor,
                fontFamily: "'Cairo', sans-serif",
              }}
            />
            {searchQuery && (
              <button 
                onClick={() => setSearchQuery('')}
                style={{
                  padding: '8px 12px',
                  background: 'transparent',
                  border: 'none',
                  cursor: 'pointer',
                  color: textSecondary,
                  fontSize: '1.2rem',
                }}
              >
                <X size={18} />
              </button>
            )}
          </div>
        </div>

        {/* ===== Tabs ===== */}
        <div className="animate-fade-in-up delay-200" style={{
          display: 'flex',
          gap: '8px',
          marginBottom: '32px',
          background: cardBg,
          borderRadius: '14px',
          padding: '6px',
          border: `1px solid ${borderColor}`,
          overflow: 'hidden',
        }}>
          {['faq', 'contact', 'guides'].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className="tab-button"
              style={{
                flex: 1,
                padding: '12px 20px',
                borderRadius: '10px',
                border: 'none',
                cursor: 'pointer',
                fontWeight: 600,
                fontSize: '0.95rem',
                fontFamily: "'Cairo', sans-serif",
                transition: 'all 0.3s ease',
                background: activeTab === tab 
                  ? 'linear-gradient(135deg, #3b82f6, #2563eb)'
                  : 'transparent',
                color: activeTab === tab ? 'white' : textColor,
                boxShadow: activeTab === tab ? '0 4px 12px rgba(59,130,246,0.3)' : 'none',
              }}
            >
              {tab === 'faq' && (lang === 'ar' ? '💬 الأسئلة الشائعة' : '💬 FAQ')}
              {tab === 'contact' && (lang === 'ar' ? '📞 اتصل بنا' : '📞 Contact Us')}
              {tab === 'guides' && (lang === 'ar' ? '📚 أدلة الاستخدام' : '📚 Guides')}
            </button>
          ))}
        </div>

        {/* ===== FAQ Tab ===== */}
        {activeTab === 'faq' && (
          <div>
            {loadingFaqs ? (
              <div style={{
                textAlign: 'center',
                padding: '60px 20px',
                color: textSecondary,
              }}>
                <Loader size={40} className="animate-spin" style={{ marginBottom: '16px', color: '#3b82f6' }} />
                <p>{t.loading}</p>
              </div>
            ) : filteredFaqs.length > 0 ? (
              filteredFaqs.map((faq, index) => (
                <div 
                  key={faq.id || index}
                  className={`animate-fade-in-up delay-${(index + 1) * 100}`}
                  style={{
                    background: cardBg,
                    borderRadius: '12px',
                    border: `1px solid ${borderColor}`,
                    marginBottom: '12px',
                    overflow: 'hidden',
                    transition: 'all 0.3s ease',
                    boxShadow: openId === faq.id ? '0 8px 24px rgba(0,0,0,0.1)' : 'none',
                  }}
                >
                  <button
                    onClick={() => setOpenId(openId === faq.id ? null : faq.id)}
                    style={{
                      width: '100%',
                      padding: '18px 24px',
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      background: 'transparent',
                      border: 'none',
                      cursor: 'pointer',
                      fontWeight: 600,
                      fontSize: '1rem',
                      color: textColor,
                      fontFamily: "'Cairo', sans-serif",
                      textAlign: lang === 'ar' ? 'right' : 'left',
                    }}
                  >
                    <span style={{ flex: 1 }}>{faq.question}</span>
                    <ChevronDown 
                      size={20} 
                      style={{
                        transition: 'transform 0.3s ease',
                        transform: openId === faq.id ? 'rotate(180deg)' : 'rotate(0)',
                        marginLeft: lang === 'ar' ? '12px' : '0',
                        marginRight: lang === 'ar' ? '0' : '12px',
                        flexShrink: 0,
                      }}
                    />
                  </button>
                  
                  {openId === faq.id && (
                    <div 
                      className="faq-answer-enter"
                      style={{
                        padding: '0 24px 20px',
                        color: textSecondary,
                        lineHeight: 1.9,
                        fontSize: '0.95rem',
                      }}
                    >
                      <div style={{
                        width: '100%',
                        height: '1px',
                        background: borderColor,
                        marginBottom: '16px',
                      }} />
                      {faq.answer}
                    </div>
                  )}
                </div>
              ))
            ) : (
              <div className="animate-fade-in" style={{
                textAlign: 'center',
                padding: '48px',
                color: textSecondary,
              }}>
                <AlertCircle size={48} style={{ marginBottom: '16px', opacity: 0.5 }} />
                <p style={{ fontSize: '1.1rem' }}>
                  {searchQuery ? (
                    lang === 'ar' ? 'لا توجد نتائج مطابقة لبحثك' : 'No results match your search'
                  ) : (
                    t.noFaqs
                  )}
                </p>
              </div>
            )}
          </div>
        )}

        {/* ===== Contact Tab ===== */}
        {activeTab === 'contact' && (
          <div>
            {/* Contact Cards */}
            <div className="contact-grid" style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
              gap: '16px',
              marginBottom: '32px',
            }}>
              {[
                { icon: <Mail size={24} />, label: t.email, value: t.emailValue, color: '#3b82f6' },
                { icon: <Phone size={24} />, label: t.phone, value: t.phoneValue, color: '#059669' },
                { icon: <Clock size={24} />, label: t.workingHours, value: t.workingHoursValue, color: '#f59e0b' },
                { icon: <MapPin size={24} />, label: t.address, value: t.addressValue, color: '#8b5cf6' },
              ].map((item, index) => (
                <div 
                  key={index}
                  className={`animate-fade-in-up delay-${(index + 1) * 100} hover-scale`}
                  style={{
                    background: cardBg,
                    borderRadius: '14px',
                    padding: '24px',
                    border: `1px solid ${borderColor}`,
                    transition: 'all 0.3s ease',
                  }}
                  onMouseEnter={() => setHoveredCard(index)}
                  onMouseLeave={() => setHoveredCard(null)}
                >
                  <div style={{
                    width: '48px',
                    height: '48px',
                    borderRadius: '12px',
                    background: `${item.color}15`,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: item.color,
                    marginBottom: '16px',
                    transition: 'all 0.3s ease',
                    transform: hoveredCard === index ? 'scale(1.1)' : 'scale(1)',
                  }}>
                    {item.icon}
                  </div>
                  <div style={{
                    fontSize: '0.85rem',
                    fontWeight: 600,
                    color: textColor,
                    marginBottom: '6px',
                    opacity: 0.8,
                  }}>
                    {item.label}
                  </div>
                  <div style={{
                    fontSize: '0.95rem',
                    color: textSecondary,
                    fontWeight: 500,
                  }}>
                    {item.value}
                  </div>
                </div>
              ))}
            </div>

            {/* Contact Form */}
            <div className="animate-fade-in-up delay-300" style={{
              background: cardBg,
              borderRadius: '16px',
              padding: '40px',
              border: `1px solid ${borderColor}`,
              boxShadow: '0 4px 16px rgba(0,0,0,0.05)',
            }}>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                marginBottom: '28px',
              }}>
                <div style={{
                  width: '44px',
                  height: '44px',
                  borderRadius: '12px',
                  background: 'linear-gradient(135deg, #3b82f6, #2563eb)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  boxShadow: '0 4px 12px rgba(59,130,246,0.3)',
                }}>
                  <MessageSquare size={22} color="white" />
                </div>
                <h2 style={{
                  fontSize: '1.5rem',
                  fontWeight: 700,
                  color: textColor,
                  margin: 0,
                }}>
                  {t.sendMessage}
                </h2>
              </div>

              {/* ✅ رسالة النجاح */}
              {sent && (
                <div className="animate-fade-in" style={{
                  background: darkMode ? 'rgba(5,150,105,0.1)' : '#d1fae5',
                  color: '#059669',
                  padding: '16px 20px',
                  borderRadius: '12px',
                  fontSize: '0.95rem',
                  marginBottom: '24px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px',
                  border: '1px solid rgba(5,150,105,0.2)',
                }}>
                  <CheckCircle size={20} />
                  {t.successMessage}
                </div>
              )}

              {/* ✅ رسالة الخطأ */}
              {submitError && (
                <div className="animate-fade-in" style={{
                  background: darkMode ? 'rgba(220,38,38,0.1)' : '#fee2e2',
                  color: '#dc2626',
                  padding: '12px 16px',
                  borderRadius: '12px',
                  fontSize: '0.9rem',
                  marginBottom: '20px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  border: '1px solid rgba(220,38,38,0.2)',
                }}>
                  <AlertCircle size={18} />
                  {submitError}
                </div>
              )}

              <form onSubmit={handleSubmit}>
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
                  gap: '16px',
                  marginBottom: '16px',
                }}>
                  <div>
                    <label style={{
                      display: 'block',
                      fontSize: '0.875rem',
                      fontWeight: 600,
                      color: textColor,
                      marginBottom: '8px',
                    }}>
                      {t.name} <span style={{ color: '#dc2626' }}>*</span>
                    </label>
                    <input 
                      type="text" 
                      name="name" 
                      value={form.name} 
                      onChange={handleChange} 
                      required
                      placeholder={lang === 'ar' ? 'أدخل اسمك الكامل' : 'Enter your full name'}
                      style={{
                        width: '100%',
                        padding: '12px 16px',
                        border: `2px solid ${borderColor}`,
                        borderRadius: '10px',
                        fontSize: '0.95rem',
                        outline: 'none',
                        background: inputBg,
                        color: textColor,
                        fontFamily: "'Cairo', sans-serif",
                        transition: 'all 0.3s ease',
                      }}
                      onFocus={(e) => e.target.style.borderColor = '#3b82f6'}
                      onBlur={(e) => e.target.style.borderColor = borderColor}
                    />
                  </div>
                  <div>
                    <label style={{
                      display: 'block',
                      fontSize: '0.875rem',
                      fontWeight: 600,
                      color: textColor,
                      marginBottom: '8px',
                    }}>
                      {t.emailLabel} <span style={{ color: '#dc2626' }}>*</span>
                    </label>
                    <input 
                      type="email" 
                      name="email" 
                      value={form.email} 
                      onChange={handleChange} 
                      required
                      placeholder={lang === 'ar' ? 'أدخل بريدك الإلكتروني' : 'Enter your email'}
                      style={{
                        width: '100%',
                        padding: '12px 16px',
                        border: `2px solid ${borderColor}`,
                        borderRadius: '10px',
                        fontSize: '0.95rem',
                        outline: 'none',
                        background: inputBg,
                        color: textColor,
                        fontFamily: "'Cairo', sans-serif",
                        transition: 'all 0.3s ease',
                      }}
                      onFocus={(e) => e.target.style.borderColor = '#3b82f6'}
                      onBlur={(e) => e.target.style.borderColor = borderColor}
                    />
                  </div>
                </div>
                
                <div style={{ marginBottom: '16px' }}>
                  <label style={{
                    display: 'block',
                    fontSize: '0.875rem',
                    fontWeight: 600,
                    color: textColor,
                    marginBottom: '8px',
                  }}>
                    {t.subject} <span style={{ color: '#dc2626' }}>*</span>
                  </label>
                  <input 
                    type="text" 
                    name="subject" 
                    value={form.subject} 
                    onChange={handleChange}
                    required
                    placeholder={lang === 'ar' ? 'موضوع رسالتك' : 'Message subject'}
                    style={{
                      width: '100%',
                      padding: '12px 16px',
                      border: `2px solid ${borderColor}`,
                      borderRadius: '10px',
                      fontSize: '0.95rem',
                      outline: 'none',
                      background: inputBg,
                      color: textColor,
                      fontFamily: "'Cairo', sans-serif",
                      transition: 'all 0.3s ease',
                    }}
                    onFocus={(e) => e.target.style.borderColor = '#3b82f6'}
                    onBlur={(e) => e.target.style.borderColor = borderColor}
                  />
                </div>
                
                <div style={{ marginBottom: '24px' }}>
                  <label style={{
                    display: 'block',
                    fontSize: '0.875rem',
                    fontWeight: 600,
                    color: textColor,
                    marginBottom: '8px',
                  }}>
                    {t.message} <span style={{ color: '#dc2626' }}>*</span>
                  </label>
                  <textarea 
                    name="message" 
                    value={form.message} 
                    onChange={handleChange} 
                    required
                    rows="5"
                    placeholder={lang === 'ar' ? 'اكتب رسالتك هنا...' : 'Write your message here...'}
                    style={{
                      width: '100%',
                      padding: '12px 16px',
                      border: `2px solid ${borderColor}`,
                      borderRadius: '10px',
                      fontSize: '0.95rem',
                      outline: 'none',
                      resize: 'vertical',
                      fontFamily: "'Cairo', sans-serif",
                      minHeight: '120px',
                      background: inputBg,
                      color: textColor,
                      transition: 'all 0.3s ease',
                    }}
                    onFocus={(e) => e.target.style.borderColor = '#3b82f6'}
                    onBlur={(e) => e.target.style.borderColor = borderColor}
                  />
                </div>
                
                <button 
                  type="submit"
                  disabled={isSubmitting}
                  style={{
                    padding: '14px 36px',
                    background: isSubmitting ? '#94a3b8' : 'linear-gradient(135deg, #3b82f6, #2563eb)',
                    color: 'white',
                    border: 'none',
                    borderRadius: '12px',
                    fontWeight: 700,
                    fontSize: '1rem',
                    cursor: isSubmitting ? 'not-allowed' : 'pointer',
                    transition: 'all 0.3s ease',
                    fontFamily: "'Cairo', sans-serif",
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '8px',
                    boxShadow: isSubmitting ? 'none' : '0 4px 16px rgba(59,130,246,0.3)',
                    opacity: isSubmitting ? 0.7 : 1,
                  }}
                  onMouseEnter={(e) => {
                    if (!isSubmitting) {
                      e.target.style.transform = 'translateY(-2px)';
                      e.target.style.boxShadow = '0 6px 20px rgba(59,130,246,0.4)';
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (!isSubmitting) {
                      e.target.style.transform = 'translateY(0)';
                      e.target.style.boxShadow = '0 4px 16px rgba(59,130,246,0.3)';
                    }
                  }}
                >
                  {isSubmitting ? (
                    <>
                      <Loader size={18} className="animate-spin" />
                      {t.sending}
                    </>
                  ) : (
                    <>
                      <Send size={18} />
                      {t.send}
                    </>
                  )}
                </button>
              </form>
            </div>
          </div>
        )}

        {/* ===== Guides Tab ===== */}
        {activeTab === 'guides' && (
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
            gap: '20px',
          }}>
            {t.guides.map((guide, index) => (
              <div 
                key={index}
                className={`animate-fade-in-up delay-${(index + 1) * 100} hover-scale`}
                style={{
                  background: cardBg,
                  borderRadius: '16px',
                  padding: '32px',
                  border: `1px solid ${borderColor}`,
                  textAlign: 'center',
                  cursor: 'pointer',
                  transition: 'all 0.3s ease',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor = '#3b82f6';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = borderColor;
                }}
              >
                <div style={{
                  width: '72px',
                  height: '72px',
                  borderRadius: '18px',
                  background: 'linear-gradient(135deg, rgba(59,130,246,0.1), rgba(139,92,246,0.1))',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  margin: '0 auto 20px',
                  color: '#3b82f6',
                  transition: 'all 0.3s ease',
                }}>
                  {guide.icon}
                </div>
                <h3 style={{
                  fontSize: '1.15rem',
                  fontWeight: 600,
                  color: textColor,
                  marginBottom: '8px',
                }}>
                  {guide.title}
                </h3>
                <p style={{
                  fontSize: '0.9rem',
                  color: textSecondary,
                  lineHeight: 1.6,
                }}>
                  {guide.desc}
                </p>
              </div>
            ))}
          </div>
        )}

      </div>
    </div>
  );
};

export default HelpSupportPage;