import React from 'react';

export const Card = ({ children, className = '' }) => {
  return (
    <div className={`bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6 ${className}`}>
      {children}
    </div>
  );
};

export const CardHeader = ({ title, subtitle }) => (
  <div className="mb-4">
    <h3 className="text-lg font-bold text-gray-900 dark:text-white">{title}</h3>
    {subtitle && <p className="text-sm text-gray-500 dark:text-gray-400">{subtitle}</p>}
  </div>
);

export const CardBody = ({ children }) => (
  <div className="space-y-4">{children}</div>
);
