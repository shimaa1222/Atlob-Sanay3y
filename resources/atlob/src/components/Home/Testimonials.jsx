import React from 'react';
import { useLanguage } from '../../context/LanguageContext';

const styles = {
  section: {
    padding: '80px 0',
    background: 'var(--color-background)'
  },
  container: {
    maxWidth: 'var(--container-max)',
    margin: '0 auto',
    padding: '0 var(--container-padding)'
  },
  header: {
    textAlign: 'center',
    marginBottom: '48px'
  },
  title: {
    fontSize: '2rem',
    fontWeight: '700',
    color: 'var(--color-text-primary)',
    marginBottom: '8px',
    letterSpacing: '-0.3px'
  },
  grid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
    gap: '24px'
  },
  card: {
    background: 'var(--color-surface)',
    borderRadius: 'var(--radius-lg)',
    padding: '32px',
    border: '1px solid var(--color-border)',
    transition: 'all 250ms ease',
    position: 'relative'
  },
  quote: {
    fontSize: '4rem',
    color: 'var(--color-primary-light)',
    position: 'absolute',
    top: '8px',
    left: '16px',
    fontFamily: 'Georgia, serif',
    lineHeight: 1
  },
  text: {
    fontSize: '0.9375rem',
    color: 'var(--color-text-secondary)',
    lineHeight: '1.8',
    marginBottom: '20px',
    position: 'relative',
    zIndex: 1,
    fontStyle: 'italic'
  },
  authorSection: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    borderTop: '1px solid var(--color-border)',
    paddingTop: '16px'
  },
  avatar: {
    width: '44px',
    height: '44px',
    borderRadius: 'var(--radius-full)',
    background: 'var(--color-primary)',
    color: 'white',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontWeight: '700',
    fontSize: '1rem'
  },
  authorName: {
    fontWeight: '600',
    color: 'var(--color-text-primary)',
    fontSize: '0.9375rem'
  },
  stars: {
    color: '#f59e0b',
    fontSize: '0.875rem',
    letterSpacing: '2px'
  }
};

const testimonials = [
  {
    id: 1,
    name: 'محمد القحطاني',
    rating: 5,
    text: 'خدمة استثنائية! وجدت سباك محترف في دقائق. الحرفي وصل في الموعد المحدد وأنجز العمل بدقة واحترافية. المنصة وفرت علي وقت وجهد كبيرين.'
  },
  {
    id: 2,
    name: 'سارة العمري',
    rating: 5,
    text: 'تجربة رائعة مع النجار. التقييمات ساعدتني أختار الأفضل. الشغل كان ممتاز والسعر معقول جدا. أنصح الجميع باستخدام المنصة.'
  },
  {
    id: 3,
    name: 'خالد الشمري',
    rating: 4,
    text: 'كهربائي ممتاز ومحترف. ركب جميع الإضاءات بدقة. التواصل كان سلسا والخدمة كانت أسرع مما توقعت.'
  }
];

const Testimonials = () => {
  const { t } = useLanguage();

  const renderStars = (rating) => {
    return '★'.repeat(rating) + '☆'.repeat(5 - rating);
  };

  return (
    <section style={styles.section}>
      <div style={styles.container}>
        <div style={styles.header}>
          <h2 style={styles.title}>{t('testimonials')}</h2>
        </div>

        <div style={styles.grid}>
          {testimonials.map((testimonial) => (
            <div
              key={testimonial.id}
              style={styles.card}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-4px)';
                e.currentTarget.style.boxShadow = 'var(--shadow-lg)';
                e.currentTarget.style.borderColor = 'var(--color-primary)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = 'none';
                e.currentTarget.style.borderColor = 'var(--color-border)';
              }}
            >
              <div style={styles.quote}>"</div>
              <p style={styles.text}>{testimonial.text}</p>
              <div style={styles.authorSection}>
                <div style={styles.avatar}>
                  {testimonial.name.charAt(0)}
                </div>
                <div>
                  <div style={styles.authorName}>{testimonial.name}</div>
                  <div style={styles.stars}>
                    {renderStars(testimonial.rating)}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Testimonials;