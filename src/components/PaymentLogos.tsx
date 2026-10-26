import React from 'react';

export const BkashLogo: React.FC<{ className?: string }> = ({ className = 'w-6 h-6' }) => (
  <svg
    viewBox="0 0 100 100"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={className}
  >
    {/* bKash iconic bird icon */}
    <path
      d="M24 16L58 38L42 58L24 16Z"
      fill="#E2136E"
    />
    <path
      d="M58 38L86 32L62 60L58 38Z"
      fill="#D11264"
    />
    <path
      d="M42 58L62 60L46 84L42 58Z"
      fill="#A80D4E"
    />
    <path
      d="M24 16L42 58L14 48L24 16Z"
      fill="#FF3388"
    />
  </svg>
);

export const NagadLogo: React.FC<{ className?: string }> = ({ className = 'w-6 h-6' }) => (
  <svg
    viewBox="0 0 100 100"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={className}
  >
    {/* Nagad iconic swirl icon */}
    <circle cx="50" cy="50" r="46" fill="#F7941D" />
    <path
      d="M50 18C34 18 22 30 22 45C22 62 38 72 50 82C62 72 78 62 78 45C78 30 66 18 50 18Z"
      fill="#ED1C24"
    />
    <circle cx="50" cy="42" r="14" fill="#FFFFFF" />
    <circle cx="50" cy="42" r="8" fill="#F7941D" />
  </svg>
);
