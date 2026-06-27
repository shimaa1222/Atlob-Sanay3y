// src/pages/HomePage.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useTheme } from '../context/ThemeContext';
import api from '../services/api';
import VoiceSearch from '../components/Search/VoiceSearch';
import { 
  Search, Shield, Clock, Star, Wrench, UserCheck, 
  Calendar, ThumbsUp, Quote, Sparkles, Zap, 
  Award, TrendingUp, ArrowRight, PlayCircle,
  CheckCircle, MapPin, Phone, Users, Mic
} from 'lucide-react';

const HomePage = () => {
  const [query, setQuery] = useState('');
  const [lang, setLang] = useState('ar');
  const [activeTestimonial, setActiveTestimonial] = useState(0);
  const [showVoice, setShowVoice] = useState(false);
  const [stats, setStats] = useState({ craftsmen: 0, customers: 10000, rating: 4.8 });
  const [featuredCraftsmen, setFeaturedCraftsmen] = useState([]);
  const [crafts, setCrafts] = useState([]);
  const [loading, setLoading] = useState(true);
  
  const { darkMode } = useTheme();
  const navigate = useNavigate();

  // ✅ Language initialization
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

  // ✅ Load data from API
  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      try {
        // 1. جلب الحرفيين المميزين
        const featuredData = await api.getFeaturedCraftsmen();
        setFeaturedCraftsmen(featuredData.craftsmen || []);
        
        // 2. جلب المهن
        const craftsData = await api.getCrafts();
        setCrafts(craftsData.crafts || []);
        
        // 3. جلب إحصائيات عدد الحرفيين
        const craftsmenData = await api.getCraftsmen({ per_page: 1 });
        const totalCraftsmen = craftsmenData.meta?.total || 0;
        setStats(prev => ({
          ...prev,
          craftsmen: totalCraftsmen || 500,
        }));
      } catch (error) {
        console.error('Error loading home data:', error);
        setStats(prev => ({
          ...prev,
          craftsmen: 500,
        }));
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, []);

  // ✅ Auto-rotate testimonials
  useEffect(() => {
    const interval = setInterval(() => {
      setActiveTestimonial((prev) => (prev + 1) % testimonials.length);
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  // Translations
  const t = {
    badge: lang === 'ar' ? '⚡ منصة موثوقة ومعتمدة' : '⚡ Trusted & Verified Platform',
    heroTitle1: lang === 'ar' ? 'اطلب' : 'Find',
    heroTitle2: lang === 'ar' ? 'صنايعي' : 'Craftsman',
    heroTitle3: lang === 'ar' ? 'محترف لبيتك' : 'Professional for Your Home',
    heroDesc: lang === 'ar' ? 'وصّل بأمهر الصنايعية في مصر. سباكة، كهرباء، نجارة، دهان وأكتر. احجز موعدك في دقائق.' : 'Connect with the best craftsmen in Egypt. Plumbing, Electrical, Carpentry, Painting & more. Book your appointment in minutes.',
    searchPlaceholder: lang === 'ar' ? 'ابحث عن حرفي...' : 'Search for a craftsman...',
    searchBtn: lang === 'ar' ? 'بحث' : 'Search',
    voiceSearch: lang === 'ar' ? 'بحث صوتي' : 'Voice Search',
    stats: [
      { icon: <Star size={20} style={{ color: '#60a5fa' }} />, value: `+${stats.craftsmen}`, label: lang === 'ar' ? 'حرفي موثق' : 'Verified Craftsmen' },
      { icon: <Users size={20} style={{ color: '#60a5fa' }} />, value: `+${(stats.customers / 1000).toFixed(0)}K`, label: lang === 'ar' ? 'عميل سعيد' : 'Happy Customers' },
      { icon: <Award size={20} style={{ color: '#60a5fa' }} />, value: stats.rating.toString(), label: lang === 'ar' ? 'تقييم المنصة' : 'Platform Rating' },
    ],
    categoriesTitle: lang === 'ar' ? 'التخصصات المتاحة' : 'Available Specialties',
    categoriesHeading: lang === 'ar' ? 'اختر التخصص المناسب' : 'Choose the Right Specialty',
    categoriesDesc: lang === 'ar' ? 'اعثر على أفضل الحرفيين في جميع التخصصات' : 'Find the best craftsmen in all specialties',
    howItWorks: lang === 'ar' ? 'كيف تبدأ؟' : 'How to Start?',
    howItWorksHeading: lang === 'ar' ? '4 خطوات بسيطة' : '4 Simple Steps',
    testimonialsTitle: lang === 'ar' ? 'آراء العملاء' : 'Testimonials',
    testimonialsHeading: lang === 'ar' ? 'آراء عملائنا' : 'Our Customers Say',
    testimonialsDesc: lang === 'ar' ? 'اعرف رأي اللي جربوا خدماتنا' : 'Hear from those who tried our services',
    ctaTitle: lang === 'ar' ? 'مستعد تبدأ؟' : 'Ready to Start?',
    ctaDesc: lang === 'ar' ? 'انضم لآلاف العملاء اللي بيستخدموا المنصة يومياً' : 'Join thousands of customers who use our platform daily',
    ctaBtn: lang === 'ar' ? 'ابدأ مجاناً' : 'Start Free',
    craftsmanCount: (count) => lang === 'ar' ? `${count} حرفي` : `${count} Craftsmen`,
  };

  // ✅ المهن - من API أو Fallback
  const categories = crafts.length > 0 ? crafts.map(craft => ({
    id: craft.id,
    name: lang === 'ar' ? craft.name : (craft.name_en || craft.name),
    icon: craft.icon || '🔧',
    count: craft.craftsmen_count || 0,
    color: '#3b82f6',
  })) : [
    { name: lang === 'ar' ? 'كهربائي' : 'Electrician', icon: '⚡', count: 45, color: '#f59e0b' },
    { name: lang === 'ar' ? 'سباك' : 'Plumber', icon: '🔧', count: 38, color: '#3b82f6' },
    { name: lang === 'ar' ? 'نجار' : 'Carpenter', icon: '🪚', count: 32, color: '#8b5cf6' },
    { name: lang === 'ar' ? 'نقاش' : 'Painter', icon: '🎨', count: 28, color: '#ec4899' },
    { name: lang === 'ar' ? 'فني تكييف' : 'AC Technician', icon: '❄️', count: 25, color: '#06b6d4' },
    { name: lang === 'ar' ? 'بناء' : 'Builder', icon: '🏗️', count: 20, color: '#f97316' },
    { name: lang === 'ar' ? 'حداد' : 'Blacksmith', icon: '🔩', count: 15, color: '#6366f1' },
    { name: lang === 'ar' ? 'تنظيف' : 'Cleaning', icon: '🧹', count: 30, color: '#059669' },
  ];

  const steps = [
    { icon: Search, title: lang === 'ar' ? 'ابحث عن الخدمة' : 'Search Service', desc: lang === 'ar' ? 'اختر التخصص واكتب وصف المشكلة' : 'Choose specialty & describe the problem' },
    { icon: UserCheck, title: lang === 'ar' ? 'اختر الصنايعي' : 'Choose Craftsman', desc: lang === 'ar' ? 'قارن بين الصنايعية واختار الأنسب' : 'Compare & pick the best' },
    { icon: Calendar, title: lang === 'ar' ? 'احجز موعد' : 'Book Appointment', desc: lang === 'ar' ? 'حدد الوقت والتاريخ المناسب ليك' : 'Pick your preferred time & date' },
    { icon: ThumbsUp, title: lang === 'ar' ? 'قيّم الخدمة' : 'Rate Service', desc: lang === 'ar' ? 'بعد الانتهاء قيّم الصنايعي وساعد غيرك' : 'After completion, rate & help others' },
  ];

  const testimonials = [
    { 
      name: lang === 'ar' ? 'سارة أحمد' : 'Sara Ahmed', 
      role: lang === 'ar' ? 'عميلة' : 'Customer', 
      text: lang === 'ar' ? 'خدمة ممتازة! الصنايعي وصل في الميعاد وشغله كان احترافي جداً. المنصة سهلت عليا كتير.' : 'Excellent service! The craftsman arrived on time and his work was very professional. The platform made things so easy for me.', 
      rating: 5 
    },
    { 
      name: lang === 'ar' ? 'محمد علي' : 'Mohamed Ali', 
      role: lang === 'ar' ? 'عميل' : 'Customer', 
      text: lang === 'ar' ? 'بحثت كتير عن سباك كويس ولقيته هنا. الأسعار واضحة والتقييمات ساعدتني أختار صح.' : 'I searched a lot for a good plumber and found one here. Clear prices and ratings helped me choose right.', 
      rating: 5 
    },
    { 
      name: lang === 'ar' ? 'نورا حسين' : 'Nora Hussein', 
      role: lang === 'ar' ? 'عميلة' : 'Customer', 
      text: lang === 'ar' ? 'أفضل منصة لطلب صنايعية. الحجز سهل والتواصل مباشر. هستخدمها دايماً.' : 'Best platform for finding craftsmen. Easy booking and direct communication. I will always use it.', 
      rating: 4 
    },
  ];

  const handleSearch = (e) => {
    e.preventDefault();
    if (query.trim()) {
      // ✅ توجيه صحيح
      navigate(`/search?q=${encodeURIComponent(query.trim())}`);
    }
  };

  // Voice search handler
  const handleVoiceResult = (text) => {
    setQuery(text);
    setShowVoice(false);
    if (text.trim()) {
      // ✅ توجيه صحيح
      navigate(`/search?q=${encodeURIComponent(text.trim())}`);
    }
  };

  // Dynamic colors
  const sectionBg = darkMode ? '#0f172a' : '#f8fafc';
  const whiteBg = darkMode ? '#1e293b' : '#ffffff';
  const textColor = darkMode ? '#f1f5f9' : '#0f172a';
  const textSecondary = darkMode ? '#94a3b8' : '#64748b';
  const borderColor = darkMode ? '#334155' : '#e2e8f0';
  const cardBg = darkMode ? '#1e293b' : '#ffffff';

  return (
    <div style={{ fontFamily: "'Cairo', sans-serif", direction: lang === 'ar' ? 'rtl' : 'ltr' }}>
      <style>{`
        @keyframes float { 0%, 100% { transform: translateY(0); } 50% { transform: translateY(-10px); } }
        @keyframes pulse { 0%, 100% { transform: scale(1); } 50% { transform: scale(1.05); } }
        @keyframes gradientShift { 0% { background-position: 0% 50%; } 50% { background-position: 100% 50%; } 100% { background-position: 0% 50%; } }
        
        .animate-float { animation: float 3s ease-in-out infinite; }
        .gradient-animate { background-size: 400% 400%; animation: gradientShift 6s ease infinite; }
        .hover-lift { transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1); }
        .hover-lift:hover { transform: translateY(-8px); }
        
        @media (max-width: 768px) {
          .hero-title { font-size: 2rem !important; }
          .hero-subtitle { font-size: 1.2rem !important; }
          .search-container { flex-direction: column; }
          .search-btn { width: 100%; justify-content: center; margin-top: 8px; }
        }
      `}</style>
      
      {/* Hero Section */}
      <section style={{ 
        background: darkMode ? 'linear-gradient(160deg, #0f172a 0%, #1e293b 50%, #0f172a 100%)' : 'linear-gradient(160deg, #0f172a 0%, #1a2744 30%, #2055de 70%, #3b82f6 100%)',
        color: 'white', padding: '120px 0 100px', position: 'relative', overflow: 'hidden',
      }}>
        <div style={{ position: 'absolute', top: '10%', left: '-5%', width: '400px', height: '400px', background: 'rgba(32,85,222,0.15)', borderRadius: '50%', filter: 'blur(100px)', animation: 'float 4s ease-in-out infinite' }} />
        <div style={{ position: 'absolute', bottom: '5%', right: '-3%', width: '450px', height: '450px', background: 'rgba(59,130,246,0.1)', borderRadius: '50%', filter: 'blur(100px)', animation: 'float 5s ease-in-out infinite 1s' }} />
        <div style={{ position: 'absolute', top: '50%', left: '50%', width: '300px', height: '300px', background: 'rgba(96,165,250,0.05)', borderRadius: '50%', filter: 'blur(80px)', animation: 'pulse 3s ease-in-out infinite' }} />

        <div style={{ maxWidth: '900px', margin: '0 auto', padding: '0 24px', position: 'relative', zIndex: 1, textAlign: 'center' }}>
          
          {/* Badge */}
          <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }} style={{ marginBottom: '24px' }}>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', background: 'rgba(255,255,255,0.1)', backdropFilter: 'blur(20px)', padding: '10px 24px', borderRadius: '50px', border: '1px solid rgba(255,255,255,0.2)', fontSize: '0.9rem', fontWeight: 500, }}>
              <Sparkles size={18} style={{ color: '#fbbf24' }} />
              <span style={{ color: 'rgba(255,255,255,0.95)' }}>{t.badge}</span>
            </div>
          </motion.div>

          {/* Main Title */}
          <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15, duration: 0.6 }}>
            <h1 className="hero-title" style={{ fontSize: 'clamp(2.5rem, 5vw, 4rem)', fontWeight: '900', lineHeight: '1.1', marginBottom: '24px' }}>
              <span style={{ color: 'white' }}>{t.heroTitle1} </span>
              <span style={{ color: '#60a5fa', background: 'linear-gradient(135deg, #60a5fa, #a78bfa)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', }}>
                {t.heroTitle2}
              </span>
              <br />
              <span className="hero-subtitle" style={{ color: 'rgba(255,255,255,0.85)', fontSize: 'clamp(1.5rem, 3vw, 2.5rem)', fontWeight: '700' }}>
                {t.heroTitle3}
              </span>
            </h1>
          </motion.div>

          {/* Description */}
          <motion.p initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3, duration: 0.5 }} style={{ fontSize: '1.2rem', color: 'rgba(255,255,255,0.75)', maxWidth: '600px', margin: '0 auto 40px', lineHeight: '1.8' }}>
            {t.heroDesc}
          </motion.p>

          {/* Search Bar */}
          <motion.form onSubmit={handleSearch} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.45, duration: 0.5 }} style={{ maxWidth: '620px', margin: '0 auto' }}>
            <div className="search-container" style={{ display: 'flex', background: 'white', borderRadius: '20px', padding: '6px', boxShadow: '0 25px 60px rgba(0,0,0,0.3)', gap: '4px', }}>
              <div style={{ position: 'relative', flex: 1 }}>
                <Search size={22} style={{ position: 'absolute', [lang === 'ar' ? 'right' : 'left']: '18px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
                <input
                  type="text"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder={t.searchPlaceholder}
                  style={{
                    width: '100%', padding: lang === 'ar' ? '18px 52px 18px 16px' : '18px 16px 18px 52px',
                    border: 'none', fontSize: '1.05rem', outline: 'none', color: '#0f172a',
                    fontFamily: "'Cairo', sans-serif", textAlign: lang === 'ar' ? 'right' : 'left',
                    background: 'transparent', borderRadius: '16px'
                  }}
                />
              </div>
              
              {/* Mic Button */}
              <button
                type="button"
                onClick={() => setShowVoice(true)}
                style={{
                  padding: '12px', borderRadius: '14px', border: 'none',
                  cursor: 'pointer', background: '#f1f5f9', color: '#3b82f6',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  transition: 'all 0.3s ease', margin: '2px',
                }}
                title={t.voiceSearch}
                onMouseEnter={(e) => { e.target.style.background = '#3b82f6'; e.target.style.color = 'white'; }}
                onMouseLeave={(e) => { e.target.style.background = '#f1f5f9'; e.target.style.color = '#3b82f6'; }}
              >
                <Mic size={20} />
              </button>

              <button
                type="submit"
                className="search-btn"
                style={{
                  padding: '18px 32px', background: 'linear-gradient(135deg, #2055de, #3b82f6)',
                  color: 'white', border: 'none', borderRadius: '16px', fontWeight: '700',
                  cursor: 'pointer', fontSize: '1.05rem', fontFamily: "'Cairo', sans-serif",
                  boxShadow: '0 6px 20px rgba(32,85,222,0.5)', display: 'flex',
                  alignItems: 'center', gap: '8px', transition: 'all 0.3s ease', whiteSpace: 'nowrap',
                }}
                onMouseEnter={(e) => { e.target.style.transform = 'translateY(-2px)'; e.target.style.boxShadow = '0 8px 24px rgba(32,85,222,0.6)'; }}
                onMouseLeave={(e) => { e.target.style.transform = 'translateY(0)'; e.target.style.boxShadow = '0 6px 20px rgba(32,85,222,0.5)'; }}
              >
                {t.searchBtn} <Wrench size={20} />
              </button>
            </div>
          </motion.form>

          {/* Stats */}
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.6 }} style={{ display: 'flex', justifyContent: 'center', gap: '48px', marginTop: '56px', flexWrap: 'wrap' }}>
            {t.stats.map((stat, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                <div style={{ width: '50px', height: '50px', borderRadius: '14px', background: 'rgba(255,255,255,0.1)', backdropFilter: 'blur(10px)', border: '1px solid rgba(255,255,255,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  {stat.icon}
                </div>
                <div style={{ textAlign: lang === 'ar' ? 'right' : 'left' }}>
                  <div style={{ fontSize: '1.4rem', fontWeight: '800', color: 'white' }}>{stat.value}</div>
                  <div style={{ fontSize: '0.8rem', color: 'rgba(255,255,255,0.6)' }}>{stat.label}</div>
                </div>
              </div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Categories Section */}
      <motion.section initial={{ opacity: 0, y: 40 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.6 }} style={{ padding: '80px 0', background: sectionBg }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 24px' }}>
          <div style={{ textAlign: 'center', marginBottom: '56px' }}>
            <span style={{ display: 'inline-block', padding: '8px 20px', borderRadius: '50px', background: darkMode ? 'rgba(59,130,246,0.15)' : '#eff6ff', color: '#3b82f6', fontSize: '0.85rem', fontWeight: '600', marginBottom: '20px' }}>
              {t.categoriesTitle}
            </span>
            <h2 style={{ fontSize: '2.4rem', fontWeight: '800', color: textColor, marginBottom: '12px' }}>{t.categoriesHeading}</h2>
            <p style={{ color: textSecondary, fontSize: '1.1rem' }}>{t.categoriesDesc}</p>
          </div>
          
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: '20px' }}>
            {categories.map((cat, index) => (
              <motion.div 
                key={cat.id || cat.name} 
                onClick={() => navigate(`/search?q=${cat.name}`)} 
                initial={{ opacity: 0, y: 30 }} 
                whileInView={{ opacity: 1, y: 0 }} 
                viewport={{ once: true }} 
                transition={{ delay: index * 0.08, duration: 0.4 }} 
                className="hover-lift"
                style={{ 
                  background: cardBg, borderRadius: '24px', padding: '36px 20px', 
                  textAlign: 'center', cursor: 'pointer', border: `1px solid ${borderColor}`, 
                  position: 'relative', overflow: 'hidden',
                }}
              >
                <div style={{ 
                  width: '64px', height: '64px', borderRadius: '18px', 
                  background: `${'#3b82f6'}15`, display: 'flex', 
                  alignItems: 'center', justifyContent: 'center', margin: '0 auto 18px', 
                  fontSize: '2rem', transition: 'all 0.3s ease',
                }}>
                  {cat.icon || '🔧'}
                </div>
                <div style={{ fontWeight: '700', color: textColor, fontSize: '1.05rem', marginBottom: '6px' }}>{cat.name}</div>
                <div style={{ color: textSecondary, fontSize: '0.85rem' }}>{t.craftsmanCount(cat.count)}</div>
              </motion.div>
            ))}
          </div>
        </div>
      </motion.section>

      {/* How It Works */}
      <section style={{ padding: '80px 0', background: whiteBg }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 24px' }}>
          <div style={{ textAlign: 'center', marginBottom: '60px' }}>
            <span style={{ display: 'inline-block', padding: '8px 20px', borderRadius: '50px', background: darkMode ? 'rgba(59,130,246,0.15)' : '#eff6ff', color: '#3b82f6', fontSize: '0.85rem', fontWeight: '600', marginBottom: '20px' }}>{t.howItWorks}</span>
            <h2 style={{ fontSize: '2.4rem', fontWeight: '800', color: textColor }}>{t.howItWorksHeading}</h2>
          </div>
          
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '36px', position: 'relative' }}>
            <div style={{ position: 'absolute', top: '40px', left: '10%', right: '10%', height: '2px', background: 'linear-gradient(90deg, transparent, #3b82f6, transparent)', display: 'none', }} className="connection-line" />
            
            {steps.map((step, i) => {
              const IconComponent = step.icon;
              return (
                <motion.div key={i} initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.15 }} style={{ textAlign: 'center', position: 'relative' }}>
                  <div style={{ width: '80px', height: '80px', borderRadius: '20px', background: 'linear-gradient(135deg, #eff6ff, #dbeafe)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px', position: 'relative', boxShadow: '0 8px 24px rgba(59,130,246,0.15)', }}>
                    <IconComponent size={32} style={{ color: '#2055de' }} />
                    <span style={{ position: 'absolute', top: '-10px', right: '-10px', width: '32px', height: '32px', borderRadius: '50%', background: 'linear-gradient(135deg, #2055de, #3b82f6)', color: 'white', fontSize: '0.85rem', fontWeight: '700', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 4px 12px rgba(32,85,222,0.4)', }}>
                      {i + 1}
                    </span>
                  </div>
                  <h3 style={{ fontWeight: '700', fontSize: '1.15rem', color: textColor, marginBottom: '8px', fontFamily: "'Cairo', sans-serif" }}>{step.title}</h3>
                  <p style={{ color: textSecondary, fontSize: '0.9rem', lineHeight: '1.6' }}>{step.desc}</p>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section style={{ padding: '80px 0', background: sectionBg }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 24px' }}>
          <div style={{ textAlign: 'center', marginBottom: '52px' }}>
            <span style={{ display: 'inline-block', padding: '8px 20px', borderRadius: '50px', background: darkMode ? 'rgba(59,130,246,0.15)' : '#eff6ff', color: '#3b82f6', fontSize: '0.85rem', fontWeight: '600', marginBottom: '20px' }}>{t.testimonialsTitle}</span>
            <h2 style={{ fontSize: '2.4rem', fontWeight: '800', color: textColor, marginBottom: '8px' }}>{t.testimonialsHeading}</h2>
            <p style={{ color: textSecondary, fontSize: '1.1rem' }}>{t.testimonialsDesc}</p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '28px' }}>
            {testimonials.map((testimonial, i) => (
              <motion.div key={i} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.1 }} whileHover={{ y: -5 }}>
                <div style={{ background: cardBg, borderRadius: '20px', padding: '32px', border: `1px solid ${borderColor}`, height: '100%', position: 'relative', transition: 'all 0.3s ease', }}>
                  <Quote size={40} style={{ color: 'rgba(32,85,222,0.1)', position: 'absolute', top: '20px', [lang === 'ar' ? 'left' : 'right']: '20px' }} />
                  <div style={{ display: 'flex', gap: '4px', marginBottom: '20px' }}>
                    {Array.from({ length: 5 }).map((_, j) => (
                      <Star key={j} size={18} style={{ color: j < testimonial.rating ? '#f59e0b' : '#cbd5e1', fill: j < testimonial.rating ? '#f59e0b' : 'none' }} />
                    ))}
                  </div>
                  <p style={{ color: textSecondary, fontSize: '1rem', lineHeight: '1.9', marginBottom: '24px' }}>
                    "{testimonial.text}"
                  </p>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                    <div style={{ width: '48px', height: '48px', borderRadius: '50%', background: 'linear-gradient(135deg, #eff6ff, #dbeafe)', color: '#2055de', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: '700', fontSize: '1rem', fontFamily: "'Cairo', sans-serif", }}>
                      {testimonial.name[0]}
                    </div>
                    <div>
                      <p style={{ fontWeight: '700', color: textColor, fontSize: '0.95rem', fontFamily: "'Cairo', sans-serif" }}>{testimonial.name}</p>
                      <p style={{ color: textSecondary, fontSize: '0.85rem' }}>{testimonial.role}</p>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <motion.section initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} style={{ padding: '80px 0', background: whiteBg }}>
        <div style={{ maxWidth: '800px', margin: '0 auto', padding: '0 24px', textAlign: 'center' }}>
          <div style={{ background: 'linear-gradient(135deg, #2055de, #3b82f6, #6366f1)', backgroundSize: '200% 200%', animation: 'gradientShift 6s ease infinite', borderRadius: '28px', padding: '56px 40px', color: 'white', position: 'relative', overflow: 'hidden', boxShadow: '0 20px 60px rgba(32,85,222,0.3)', }}>
            <div style={{ position: 'absolute', top: -30, right: -30, width: '160px', height: '160px', borderRadius: '50%', background: 'rgba(255,255,255,0.1)', animation: 'float 4s ease-in-out infinite' }} />
            <div style={{ position: 'absolute', bottom: -20, left: -20, width: '120px', height: '120px', borderRadius: '50%', background: 'rgba(255,255,255,0.05)', animation: 'float 5s ease-in-out infinite 1s' }} />
            
            <div style={{ position: 'relative', zIndex: 1 }}>
              <h2 style={{ fontSize: '2.2rem', fontWeight: 800, marginBottom: '16px' }}>{t.ctaTitle}</h2>
              <p style={{ fontSize: '1.15rem', opacity: 0.95, marginBottom: '36px', maxWidth: '500px', margin: '0 auto 36px' }}>{t.ctaDesc}</p>
              <button 
                onClick={() => navigate('/select-role')}
                style={{ 
                  padding: '16px 40px', borderRadius: '16px', background: 'white', 
                  color: '#2055de', border: 'none', fontWeight: 700, fontSize: '1.1rem', 
                  cursor: 'pointer', fontFamily: "'Cairo', sans-serif", 
                  display: 'inline-flex', alignItems: 'center', gap: '10px', 
                  transition: 'all 0.3s ease', boxShadow: '0 8px 24px rgba(0,0,0,0.2)',
                }}
                onMouseEnter={(e) => { e.target.style.transform = 'translateY(-3px)'; e.target.style.boxShadow = '0 12px 28px rgba(0,0,0,0.3)'; }}
                onMouseLeave={(e) => { e.target.style.transform = 'translateY(0)'; e.target.style.boxShadow = '0 8px 24px rgba(0,0,0,0.2)'; }}
              >
                {t.ctaBtn} <ArrowRight size={20} />
              </button>
            </div>
          </div>
        </div>
      </motion.section>

      {/* Voice Search Modal */}
      {showVoice && (
        <VoiceSearch
          lang={lang}
          onResult={handleVoiceResult}
          onClose={() => setShowVoice(false)}
        />
      )}
    </div>
  );
};

export default HomePage;