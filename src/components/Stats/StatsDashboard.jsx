import React from 'react';

const StatsDashboard = ({ data }) => {
  const stats = data || {
    totalRequests: 156,
    completedRequests: 128,
    pendingRequests: 28,
    averageRating: 4.7,
    totalRevenue: 45600,
    monthlyGrowth: 22
  };

  const cards = [
    { title: 'إجمالي الطلبات', value: stats.totalRequests, icon: '📋', color: '#0d6efd', bg: '#e8f0fe' },
    { title: 'الطلبات المكتملة', value: stats.completedRequests, icon: '✅', color: '#28a745', bg: '#e8f5e9' },
    { title: 'الطلبات المعلقة', value: stats.pendingRequests, icon: '⏳', color: '#ffc107', bg: '#fff8e1' },
    { title: 'متوسط التقييم', value: stats.averageRating, icon: '⭐', color: '#6f42c1', bg: '#f3e8ff' },
    { title: 'الإيرادات', value: `${stats.totalRevenue} ج`, icon: '💰', color: '#17a2b8', bg: '#e3f2fd' },
    { title: 'النمو الشهري', value: `${stats.monthlyGrowth}%`, icon: '📈', color: '#fd7e14', bg: '#fff3e0' }
  ];

  return (
    <div style={{ direction: 'rtl' }}>
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
        gap: '20px'
      }}>
        {cards.map((card, index) => (
          <div key={index} style={{
            background: 'white',
            borderRadius: '16px',
            padding: '25px',
            boxShadow: '0 2px 12px rgba(0,0,0,0.06)',
            borderRight: `4px solid ${card.color}`,
            transition: '0.3s'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <div>
                <p style={{ color: '#888', fontSize: '0.9em', marginBottom: '10px' }}>{card.title}</p>
                <h3 style={{ fontSize: '2em', fontWeight: '800', color: '#333' }}>{card.value}</h3>
              </div>
              <div style={{
                width: '50px', height: '50px', borderRadius: '12px',
                background: card.bg, display: 'flex',
                alignItems: 'center', justifyContent: 'center', fontSize: '1.5em'
              }}>
                {card.icon}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default StatsDashboard;