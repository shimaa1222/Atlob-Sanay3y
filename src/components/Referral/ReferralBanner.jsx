import React, { useState } from 'react';

const ReferralBanner = () => {
  const [copied, setCopied] = useState(false);
  const referralCode = 'ATLOB' + Math.random().toString(36).substring(2, 8).toUpperCase();

  const handleCopy = () => {
    navigator.clipboard.writeText(referralCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleShare = () => {
    const text = `استخدم كود ${referralCode} في تطبيق طلب صناعي واحصل على خصم!`;
    if (navigator.share) {
      navigator.share({ title: 'طلب صناعي', text });
    } else {
      window.open(`https://wa.me/?text=${encodeURIComponent(text)}`);
    }
  };

  return (
    <div style={{
      background: 'linear-gradient(135deg, #0d6efd, #4b3fcf)',
      borderRadius: '16px',
      padding: '25px',
      color: 'white',
      direction: 'rtl',
      marginBottom: '20px'
    }}>
      <h3 style={{ marginBottom: '10px', fontSize: '1.3em' }}>🎁 برنامج الإحالة</h3>
      <p style={{ opacity: '0.9', marginBottom: '15px' }}>
        ادعُ أصدقائك واحصل على خصم 10% لكل صديق يسجل!
      </p>
      
      <div style={{
        background: 'rgba(255,255,255,0.2)',
        borderRadius: '12px',
        padding: '15px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: '10px'
      }}>
        <span style={{ fontSize: '1.3em', fontWeight: 'bold', letterSpacing: '2px' }}>
          {referralCode}
        </span>
        <div style={{ display: 'flex', gap: '8px' }}>
          <button onClick={handleCopy} style={{
            background: 'white',
            color: '#0d6efd',
            border: 'none',
            padding: '8px 16px',
            borderRadius: '8px',
            fontWeight: '600',
            cursor: 'pointer',
            fontSize: '0.9em'
          }}>
            {copied ? '✅ تم النسخ' : '📋 نسخ'}
          </button>
          <button onClick={handleShare} style={{
            background: '#28a745',
            color: 'white',
            border: 'none',
            padding: '8px 16px',
            borderRadius: '8px',
            fontWeight: '600',
            cursor: 'pointer',
            fontSize: '0.9em'
          }}>
            📤 مشاركة
          </button>
        </div>
      </div>
    </div>
  );
};

export default ReferralBanner;