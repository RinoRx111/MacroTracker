import React from 'react';

export const Button = ({ 
  children, 
  variant = 'primary', 
  size = 'md', 
  className = '', 
  ...props 
}) => {
  const baseStyles = 'font-medium rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2';
  
  const variants = {
    primary: 'bg-[var(--accent-primary)] hover:bg-[var(--accent-primary-hover)] text-[var(--text-on-accent)] focus:ring-[var(--accent-primary)] font-semibold shadow-sm',
    secondary: 'bg-transparent border border-[var(--border-main)] hover:bg-[var(--bg-card-tint)] text-[var(--text-primary)] focus:ring-[var(--accent-primary)]',
    danger: 'bg-[var(--warning-state)] hover:opacity-90 text-[var(--text-on-accent)] focus:ring-[var(--warning-state)] font-semibold',
    ghost: 'bg-transparent hover:bg-[var(--bg-card-tint)] text-[var(--text-primary)] focus:ring-[var(--accent-primary)]',
  };

  const sizes = {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-4 py-2 text-base',
    lg: 'px-6 py-3 text-lg',
  };

  return (
    <button 
      className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
};
