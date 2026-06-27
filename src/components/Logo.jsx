import React from 'react';

const Logo = ({ size = 32, color = '#2563eb' }) => {
  return (
    <svg 
      width={size} 
      height={size} 
      viewBox="0 0 64 64" 
      fill="none" 
      xmlns="http://www.w3.org/2000/svg"
    >
      <rect width="64" height="64" rx="14" fill={color} />
      <path 
        d="M20 44V20H28L36 34L44 20H52V44H46V28L38 42H34L26 28V44H20Z" 
        fill="white" 
      />
      <circle cx="46" cy="46" r="12" fill="#f59e0b" />
      <path 
        d="M44 46H48M46 44V48" 
        stroke="white" 
        strokeWidth="2" 
        strokeLinecap="round" 
      />
    </svg>
  );
};

export default Logo;