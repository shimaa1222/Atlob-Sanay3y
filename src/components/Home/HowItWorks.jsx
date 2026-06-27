import React from 'react';
import { useLanguage } from '../../context/LanguageContext';

const styles = {
  section: {
    padding: '80px 0',
    background: 'var(--color-surface)'
  },
  container: {
    maxWidth: 'var(--container-max)',
    margin: '0 auto',
    padding: '0 var(--container-padding)'
  },
  header: {
    textAlign: 'center',
    marginBottom: '56px'
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
    gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
    gap: '32px',
    position: 'relative'
  },
  card: {
    textAlign: 'center',
    padding: '32px 24px',
    position: 'relative'
  },
  stepNumber: {
    width: '48px',
    height: '48px',
    borderRadius: 'var(--radius-full)',
    background: 'var(--color-primary)',
    color: 'white',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '1.25rem',
    fontWeight: '700',
    margin: '0 auto 20px'
  },
  stepTitle: {
    fontSize: '1.25rem',
    fontWeight: '600',
    color: 'var(--color-text-primary)',
    marginBottom: '12px'
  },
  stepDescription: {
    fontSize: '1rem',
    color: 'var(--color-text-secondary)',
    lineHeight: '1.7'
  },
  connector: {
    position: 'absolute',
    top: '24px',
    left: 'calc(50% + 40px)',
    width: 'calc(100% - 80px)',
    height: '2px',
    background: 'var(--color-border)',
    display: 'none'
  }
};

const HowItWorks = () => {
  const { t } = useLanguage();

  const steps = [
    {
      number: 1,
      title: t('step1Title'),
      description: t('step1Description')
    },
    {
      number: 2,
      title: t('step2Title'),
      description: t('step2Description')
    },
    {
      number: 3,
      title: t('step3Title'),
      description: t('step3Description')
    }
  ];

  return (
    <section style={styles.section}>
      <div style={styles.container}>
        <div style={styles.header}>
          <h2 style={styles.title}>{t('howItWorks')}</h2>
        </div>

        <div style={styles.grid}>
          {steps.map((step, index) => (
            <div key={step.number} style={styles.card}>
              <div style={styles.stepNumber}>
                {step.number}
              </div>
              <h3 style={styles.stepTitle}>{step.title}</h3>
              <p style={styles.stepDescription}>{step.description}</p>
              
              {index < steps.length - 1 && (
                <div style={{
                  ...styles.connector,
                  display: window.innerWidth > 768 ? 'block' : 'none'
                }} />
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default HowItWorks;