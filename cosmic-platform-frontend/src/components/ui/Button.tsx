import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  glow?: boolean;
  children: React.ReactNode;
}

export function Button({
  variant = 'primary',
  size = 'md',
  glow = false,
  className = '',
  children,
  ...props
}: ButtonProps) {
  const baseStyles = 'inline-flex items-center justify-center rounded-lg font-medium transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed';
  
  const variants = {
    primary: 'bg-red-500 hover:bg-yellow-500 text-gray-100 focus:ring-red-500',
    secondary: 'bg-gray-700 hover:bg-gray-600 text-gray-100 focus:ring-gray-600',
    outline: 'border-2 border-red-500 text-red-500 hover:bg-red-500 hover:text-gray-100 focus:ring-red-500',
    ghost: 'text-red-500 hover:bg-red-500/10 focus:ring-red-500'
  };
  
  const sizes = {
    sm: 'px-3 py-2 text-sm',
    md: 'px-6 py-3 text-base',
    lg: 'px-8 py-4 text-lg'
  };
  
  const glowStyle = glow ? 'shadow-lg shadow-red-500/30 hover:shadow-yellow-500/40' : '';
  
  return (
    <button
      className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${glowStyle} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}