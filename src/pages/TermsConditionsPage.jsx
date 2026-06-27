import React, { useState, useEffect, useRef } from 'react';
import { useTheme } from '../context/ThemeContext';
import { 
  FileText, Shield, Users, Wrench, Eye, 
  RefreshCw, ChevronRight, BookOpen, 
  CheckCircle, AlertCircle, Scale, Lock,
  ArrowUp, Printer, Download, Calendar
} from 'lucide-react';

const TermsConditionsPage = () => {
  const { darkMode } = useTheme();
  const [lang, setLang] = useState('ar');
  const [activeSection, setActiveSection] = useState(null);
  const [showScrollTop, setShowScrollTop] = useState(false);
  const [lastUpdated] = useState('2024-01-15');
  const sectionRefs = useRef({});

  // Language initialization
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

  // Scroll to top button
  useEffect(() => {
    const handleScroll = () => {
      setShowScrollTop(window.scrollY > 400);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const scrollToSection = (sectionId) => {
    const element = sectionRefs.current[sectionId];
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
      setActiveSection(sectionId);
      setTimeout(() => setActiveSection(null), 2000);
    }
  };

  // Print handler
  const handlePrint = () => {
    window.print();
  };

  // Translations
  const t = {
    title: lang === 'ar' ? 'الشروط والأحكام' : 'Terms & Conditions',
    lastUpdated: lang === 'ar' ? `آخر تحديث: ${lastUpdated}` : `Last Updated: ${lastUpdated}`,
    tableOfContents: lang === 'ar' ? 'جدول المحتويات' : 'Table of Contents',
    introduction: lang === 'ar' ? 'مقدمة' : 'Introduction',
    useOfService: lang === 'ar' ? 'استخدام الخدمة' : 'Use of Service',
    customerResponsibility: lang === 'ar' ? 'مسؤوليات العميل' : 'Customer Responsibilities',
    craftsmanResponsibility: lang === 'ar' ? 'مسؤوليات الحرفي' : 'Craftsman Responsibilities',
    privacyPolicy: lang === 'ar' ? 'سياسة الخصوصية' : 'Privacy Policy',
    modifications: lang === 'ar' ? 'تعديل الشروط' : 'Modifications',
    agreeText: lang === 'ar' ? 'باستخدامك للمنصة فإنك توافق على هذه الشروط' : 'By using the platform, you agree to these terms',
    printTerms: lang === 'ar' ? 'طباعة الشروط' : 'Print Terms',
    downloadPdf: lang === 'ar' ? 'تحميل PDF' : 'Download PDF',
    backToTop: lang === 'ar' ? 'العودة للأعلى' : 'Back to Top',
    sections: lang === 'ar' ? [
      {
        id: 1,
        icon: <FileText size={24} />,
        title: 'مقدمة',
        color: '#3b82f6',
        content: 'مرحباً بكم في منصة "اطلب صنايعي". باستخدامك للمنصة فإنك توافق على الالتزام بهذه الشروط والأحكام بشكل كامل. يرجى قراءة هذه الشروط بعناية قبل استخدام خدماتنا. إذا كنت لا توافق على أي جزء من هذه الشروط، يجب عليك عدم استخدام المنصة.',
        items: null
      },
      {
        id: 2,
        icon: <Users size={24} />,
        title: 'استخدام الخدمة',
        color: '#059669',
        content: null,
        items: [
          'يجب أن يكون عمرك 18 عاماً على الأقل لاستخدام المنصة.',
          'أنت مسؤول عن الحفاظ على سرية معلومات حسابك وكلمة المرور.',
          'يجب تقديم معلومات صحيحة ودقيقة عند التسجيل في المنصة.',
          'يمنع استخدام المنصة لأي غرض غير قانوني أو غير مصرح به.',
          'نحتفظ بالحق في رفض الخدمة أو إنهاء الحسابات المخالفة.',
          'يجب عدم مشاركة حسابك مع أي شخص آخر.'
        ]
      },
      {
        id: 3,
        icon: <Shield size={24} />,
        title: 'مسؤوليات العميل',
        color: '#f59e0b',
        content: null,
        items: [
          'تقديم وصف دقيق للمشكلة أو الخدمة المطلوبة.',
          'الالتزام بالمواعيد المتفق عليها مع الحرفي.',
          'تسديد المبالغ المستحقة عند اكتمال الخدمة.',
          'معاملة الحرفيين باحترام وتقدير.',
          'الإبلاغ عن أي مشكلة أو خلاف خلال 24 ساعة من اكتمال الخدمة.',
          'عدم إلغاء الحجوزات بشكل متكرر دون سبب مقنع.'
        ]
      },
      {
        id: 4,
        icon: <Wrench size={24} />,
        title: 'مسؤوليات الحرفي',
        color: '#8b5cf6',
        content: null,
        items: [
          'تقديم خدمات عالية الجودة حسب المعايير المهنية المتفق عليها.',
          'الالتزام بالمواعيد المحددة مع العملاء دون تأخير غير مبرر.',
          'الشفافية في التسعير وعدم فرض رسوم إضافية غير متفق عليها.',
          'الحفاظ على سرية معلومات العملاء وعدم مشاركتها.',
          'تحديث الملف الشخصي والمهارات بشكل دوري.',
          'الالتزام بقوانين العمل والسلامة المهنية.'
        ]
      },
      {
        id: 5,
        icon: <Eye size={24} />,
        title: 'سياسة الخصوصية',
        color: '#dc2626',
        content: null,
        items: [
          'نحن نلتزم بحماية بياناتك الشخصية وخصوصيتك بشكل كامل.',
          'لا نشارك بياناتك مع أطراف ثالثة دون موافقتك الصريحة.',
          'نستخدم تقنيات تشفير متقدمة لحماية بياناتك.',
          'يمكنك طلب حذف بياناتك في أي وقت وسنقوم بذلك خلال 30 يوم.',
          'نحتفظ بالحق في استخدام بيانات مجمعة للإحصائيات.',
          'نلتزم بمعايير حماية البيانات المحلية والدولية.'
        ]
      },
      {
        id: 6,
        icon: <RefreshCw size={24} />,
        title: 'تعديل الشروط',
        color: '#0891b2',
        content: 'نحتفظ بالحق في تعديل هذه الشروط في أي وقت. سيتم إخطار المستخدمين بأي تغييرات جوهرية عبر البريد الإلكتروني أو إشعار داخل المنصة. استمرار استخدام المنصة بعد التعديلات يعتبر موافقة صريحة على الشروط الجديدة. نوصي بمراجعة هذه الصفحة بشكل دوري.',
        items: null
      },
      {
        id: 7,
        icon: <Scale size={24} />,
        title: 'حدود المسؤولية',
        color: '#6366f1',
        content: 'منصة "اطلب صنايعي" تعمل كوسيط بين العملاء والحرفيين. نحن نبذل قصارى جهدنا لضمان جودة الخدمات، ولكننا لا نتحمل المسؤولية المباشرة عن أي أضرار أو خسائر ناتجة عن الخدمات المقدمة. يجب حل النزاعات بين الأطراف المعنية بشكل ودي.',
        items: null
      }
    ] : [
      {
        id: 1,
        icon: <FileText size={24} />,
        title: 'Introduction',
        color: '#3b82f6',
        content: 'Welcome to the "Atlob Sanay3y" platform. By using the platform, you agree to fully comply with these terms and conditions. Please read these terms carefully before using our services. If you do not agree with any part of these terms, you must not use the platform.',
        items: null
      },
      {
        id: 2,
        icon: <Users size={24} />,
        title: 'Use of Service',
        color: '#059669',
        content: null,
        items: [
          'You must be at least 18 years old to use the platform.',
          'You are responsible for maintaining the confidentiality of your account and password.',
          'You must provide accurate and correct information when registering.',
          'Using the platform for any illegal or unauthorized purpose is prohibited.',
          'We reserve the right to refuse service or terminate violating accounts.',
          'You must not share your account with anyone else.'
        ]
      },
      {
        id: 3,
        icon: <Shield size={24} />,
        title: 'Customer Responsibilities',
        color: '#f59e0b',
        content: null,
        items: [
          'Provide an accurate description of the problem or service required.',
          'Adhere to the agreed-upon appointments with the craftsman.',
          'Pay the amounts due upon completion of the service.',
          'Treat craftsmen with respect and appreciation.',
          'Report any issues or disputes within 24 hours of service completion.',
          'Do not cancel bookings repeatedly without a valid reason.'
        ]
      },
      {
        id: 4,
        icon: <Wrench size={24} />,
        title: 'Craftsman Responsibilities',
        color: '#8b5cf6',
        content: null,
        items: [
          'Provide high-quality services according to agreed professional standards.',
          'Adhere to specified appointments without unjustified delay.',
          'Be transparent in pricing and do not impose additional unagreed fees.',
          'Maintain confidentiality of customer information.',
          'Update profile and skills periodically.',
          'Comply with labor laws and occupational safety standards.'
        ]
      },
      {
        id: 5,
        icon: <Eye size={24} />,
        title: 'Privacy Policy',
        color: '#dc2626',
        content: null,
        items: [
          'We are committed to fully protecting your personal data and privacy.',
          'We do not share your data with third parties without your explicit consent.',
          'We use advanced encryption technologies to protect your data.',
          'You can request deletion of your data at any time and we will do so within 30 days.',
          'We reserve the right to use aggregated data for statistics.',
          'We comply with local and international data protection standards.'
        ]
      },
      {
        id: 6,
        icon: <RefreshCw size={24} />,
        title: 'Modifications',
        color: '#0891b2',
        content: 'We reserve the right to modify these terms at any time. Users will be notified of any material changes via email or platform notification. Continued use of the platform after modifications constitutes explicit acceptance of the new terms. We recommend reviewing this page periodically.',
        items: null
      },
      {
        id: 7,
        icon: <Scale size={24} />,
        title: 'Limitation of Liability',
        color: '#6366f1',
        content: '"Atlob Sanay3y" platform acts as an intermediary between customers and craftsmen. We make every effort to ensure service quality, but we do not assume direct responsibility for any damages or losses resulting from the services provided. Disputes should be resolved amicably between the concerned parties.',
        items: null
      }
    ]
  };

  // Dynamic colors
  const bgColor = darkMode ? '#0f172a' : '#f8fafc';
  const cardBg = darkMode ? '#1e293b' : '#ffffff';
  const textColor = darkMode ? '#f1f5f9' : '#0f172a';
  const textSecondary = darkMode ? '#94a3b8' : '#64748b';
  const borderColor = darkMode ? '#334155' : '#e2e8f0';
  const highlightBg = darkMode ? 'rgba(59,130,246,0.1)' : '#eff6ff';
  const tableOfContentsBg = darkMode ? '#1e293b' : '#f1f5f9';

  return (
    <div style={{ background: bgColor, minHeight: '100vh', fontFamily: "'Cairo', sans-serif" }}>
      <style>{`
        @keyframes fadeInUp {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        
        @keyframes fadeInLeft {
          from { opacity: 0; transform: translateX(-20px); }
          to { opacity: 1; transform: translateX(0); }
        }
        
        @keyframes pulse {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.05); }
        }
        
        @keyframes highlight {
          0%, 100% { background-color: transparent; }
          50% { background-color: rgba(59,130,246,0.2); }
        }
        
        .animate-fade-in-up {
          animation: fadeInUp 0.6s ease forwards;
        }
        
        .animate-fade-in-left {
          animation: fadeInLeft 0.5s ease forwards;
        }
        
        .highlight-section {
          animation: highlight 2s ease;
        }
        
        .delay-100 { animation-delay: 0.1s; }
        .delay-200 { animation-delay: 0.2s; }
        .delay-300 { animation-delay: 0.3s; }
        .delay-400 { animation-delay: 0.4s; }
        .delay-500 { animation-delay: 0.5s; }
        
        .hover-lift {
          transition: all 0.3s ease;
        }
        
        .hover-lift:hover {
          transform: translateY(-2px);
          box-shadow: 0 8px 24px rgba(0,0,0,0.1);
        }
        
        @media (max-width: 768px) {
          .sidebar {
            display: none;
          }
          .content {
            padding: 20px !important;
          }
        }
        
        @media print {
          .no-print {
            display: none !important;
          }
          body {
            background: white !important;
            color: black !important;
          }
        }
      `}</style>

      {/* Hero Section */}
      <div style={{
        background: darkMode 
          ? 'linear-gradient(160deg, #0f172a 0%, #1e293b 100%)'
          : 'linear-gradient(160deg, #1e3a8a 0%, #1e40af 100%)',
        color: 'white',
        padding: '60px 0 50px',
        textAlign: 'center',
        position: 'relative',
        overflow: 'hidden',
      }}>
        <div style={{
          maxWidth: '700px',
          margin: '0 auto',
          padding: '0 24px',
          position: 'relative',
          zIndex: 1,
        }}>
          <div className="animate-fade-in-up" style={{ marginBottom: '16px' }}>
            <Scale size={48} style={{ 
              opacity: 0.9,
              filter: 'drop-shadow(0 4px 8px rgba(0,0,0,0.2))'
            }} />
          </div>
          
          <h1 className="animate-fade-in-up delay-200" style={{
            fontSize: '2.5rem',
            fontWeight: 800,
            marginBottom: '12px',
            letterSpacing: '-0.5px',
          }}>
            {t.title}
          </h1>
          
          <p className="animate-fade-in-up delay-300" style={{
            fontSize: '1rem',
            opacity: 0.85,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '8px',
          }}>
            <Calendar size={16} />
            {t.lastUpdated}
          </p>
        </div>
      </div>

      {/* Main Content */}
      <div style={{
        maxWidth: '1100px',
        margin: '0 auto',
        padding: '40px 24px',
        display: 'grid',
        gridTemplateColumns: '280px 1fr',
        gap: '30px',
        alignItems: 'start',
      }}>
        
        {/* Sidebar - Table of Contents */}
        <div className="no-print animate-fade-in-left" style={{
          position: 'sticky',
          top: '84px',
        }}>
          <div style={{
            background: tableOfContentsBg,
            borderRadius: '16px',
            padding: '24px',
            border: `1px solid ${borderColor}`,
          }}>
            <h3 style={{
              fontSize: '1rem',
              fontWeight: 700,
              color: textColor,
              marginBottom: '20px',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
            }}>
              <BookOpen size={18} />
              {t.tableOfContents}
            </h3>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              {t.sections.map((section) => (
                <button
                  key={section.id}
                  onClick={() => scrollToSection(section.id)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '10px',
                    padding: '10px 14px',
                    borderRadius: '10px',
                    border: 'none',
                    background: activeSection === section.id ? `${section.color}15` : 'transparent',
                    cursor: 'pointer',
                    transition: 'all 0.3s ease',
                    fontFamily: "'Cairo', sans-serif",
                    fontSize: '0.9rem',
                    fontWeight: activeSection === section.id ? 600 : 500,
                    color: activeSection === section.id ? section.color : textSecondary,
                    textAlign: lang === 'ar' ? 'right' : 'left',
                  }}
                  onMouseEnter={(e) => {
                    e.target.style.background = `${section.color}10`;
                  }}
                  onMouseLeave={(e) => {
                    if (activeSection !== section.id) {
                      e.target.style.background = 'transparent';
                    }
                  }}
                >
                  <span style={{
                    width: '28px',
                    height: '28px',
                    borderRadius: '8px',
                    background: `${section.color}20`,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: section.color,
                    fontSize: '0.8rem',
                    fontWeight: 700,
                    flexShrink: 0,
                  }}>
                    {section.id}
                  </span>
                  <span>{section.title}</span>
                </button>
              ))}
            </div>
            
            {/* Action Buttons */}
            <div style={{
              marginTop: '20px',
              paddingTop: '20px',
              borderTop: `1px solid ${borderColor}`,
              display: 'flex',
              flexDirection: 'column',
              gap: '8px',
            }}>
              <button
                onClick={handlePrint}
                style={{
                  padding: '10px',
                  borderRadius: '10px',
                  border: `1px solid ${borderColor}`,
                  background: 'transparent',
                  cursor: 'pointer',
                  color: textColor,
                  fontSize: '0.85rem',
                  fontWeight: 500,
                  fontFamily: "'Cairo', sans-serif",
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px',
                  transition: 'all 0.3s ease',
                }}
                className="hover-lift"
              >
                <Printer size={16} />
                {t.printTerms}
              </button>
              
              <button
                style={{
                  padding: '10px',
                  borderRadius: '10px',
                  border: `1px solid ${borderColor}`,
                  background: 'transparent',
                  cursor: 'pointer',
                  color: textColor,
                  fontSize: '0.85rem',
                  fontWeight: 500,
                  fontFamily: "'Cairo', sans-serif",
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px',
                  transition: 'all 0.3s ease',
                }}
                className="hover-lift"
              >
                <Download size={16} />
                {t.downloadPdf}
              </button>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div>
          {/* Agreement Notice */}
          <div className="animate-fade-in-up" style={{
            background: '#059669',
            color: 'white',
            borderRadius: '14px',
            padding: '16px 24px',
            marginBottom: '28px',
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            fontSize: '0.95rem',
            fontWeight: 600,
          }}>
            <CheckCircle size={20} />
            {t.agreeText}
          </div>

          {/* Terms Sections */}
          {t.sections.map((section, index) => (
            <div
              key={section.id}
              ref={el => sectionRefs.current[section.id] = el}
              className={`animate-fade-in-up delay-${(index + 1) * 100}`}
              style={{
                background: cardBg,
                borderRadius: '16px',
                padding: '32px',
                border: `1px solid ${borderColor}`,
                marginBottom: '20px',
                transition: 'all 0.3s ease',
                ...(activeSection === section.id && {
                  borderColor: section.color,
                  boxShadow: `0 0 0 3px ${section.color}20`,
                }),
              }}
            >
              {/* Section Header */}
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '14px',
                marginBottom: '20px',
                paddingBottom: '16px',
                borderBottom: `2px solid ${section.color}20`,
              }}>
                <div style={{
                  width: '48px',
                  height: '48px',
                  borderRadius: '14px',
                  background: `${section.color}15`,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: section.color,
                  flexShrink: 0,
                }}>
                  {section.icon}
                </div>
                
                <div>
                  <h2 style={{
                    fontSize: '1.3rem',
                    fontWeight: 700,
                    color: textColor,
                    margin: 0,
                  }}>
                    {section.title}
                  </h2>
                  <div style={{
                    fontSize: '0.8rem',
                    color: textSecondary,
                    marginTop: '2px',
                  }}>
                    {lang === 'ar' ? `القسم ${section.id}` : `Section ${section.id}`}
                  </div>
                </div>
              </div>
              
              {/* Section Content */}
              {section.content && (
                <p style={{
                  fontSize: '1rem',
                  color: textSecondary,
                  lineHeight: 2,
                  margin: 0,
                }}>
                  {section.content}
                </p>
              )}
              
              {section.items && (
                <ul style={{
                  listStyle: 'none',
                  padding: 0,
                  margin: 0,
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '12px',
                }}>
                  {section.items.map((item, i) => (
                    <li
                      key={i}
                      style={{
                        display: 'flex',
                        alignItems: 'flex-start',
                        gap: '12px',
                        padding: '12px 16px',
                        borderRadius: '10px',
                        background: darkMode ? 'rgba(255,255,255,0.02)' : '#f8fafc',
                        transition: 'all 0.3s ease',
                      }}
                      onMouseEnter={(e) => {
                        e.target.style.background = `${section.color}08`;
                        e.target.style.paddingRight = '24px';
                      }}
                      onMouseLeave={(e) => {
                        e.target.style.background = darkMode ? 'rgba(255,255,255,0.02)' : '#f8fafc';
                        e.target.style.paddingRight = '16px';
                      }}
                    >
                      <ChevronRight 
                        size={18} 
                        color={section.color}
                        style={{ 
                          marginTop: '3px',
                          flexShrink: 0,
                        }}
                      />
                      <span style={{
                        fontSize: '0.95rem',
                        color: textSecondary,
                        lineHeight: 1.8,
                      }}>
                        {item}
                      </span>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          ))}

          {/* Footer Note */}
          <div className="animate-fade-in-up delay-500" style={{
            textAlign: 'center',
            padding: '24px',
            color: textSecondary,
            fontSize: '0.9rem',
            borderTop: `1px solid ${borderColor}`,
            marginTop: '20px',
          }}>
            <Lock size={14} style={{ display: 'inline', marginRight: '6px' }} />
            {lang === 'ar' 
              ? 'هذه الوثيقة ملزمة قانوناً. آخر مراجعة: يناير 2024'
              : 'This document is legally binding. Last reviewed: January 2024'
            }
          </div>
        </div>
      </div>

      {/* Scroll to Top Button */}
      <button 
        onClick={scrollToTop}
        className="no-print"
        style={{
          position: 'fixed',
          bottom: '24px',
          right: '24px',
          width: '48px',
          height: '48px',
          borderRadius: '50%',
          background: '#3b82f6',
          color: 'white',
          border: 'none',
          cursor: 'pointer',
          display: showScrollTop ? 'flex' : 'none',
          alignItems: 'center',
          justifyContent: 'center',
          boxShadow: '0 4px 16px rgba(59,130,246,0.4)',
          transition: 'all 0.3s ease',
          zIndex: 50,
        }}
        onMouseEnter={(e) => {
          e.target.style.transform = 'translateY(-3px)';
          e.target.style.boxShadow = '0 6px 20px rgba(59,130,246,0.5)';
        }}
        onMouseLeave={(e) => {
          e.target.style.transform = 'translateY(0)';
          e.target.style.boxShadow = '0 4px 16px rgba(59,130,246,0.4)';
        }}
      >
        <ArrowUp size={20} />
      </button>
    </div>
  );
};

export default TermsConditionsPage;