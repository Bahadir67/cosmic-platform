import React from 'react';

interface CardProps {
  className?: string;
  glow?: boolean;
  hover?: boolean;
  children: React.ReactNode;
}

export function Card({
  className = '',
  glow = false,
  hover = false,
  children
}: CardProps) {
  const baseStyles = 'rounded-lg backdrop-blur-sm border';
  const cosmicStyles = 'bg-gray-800/80 border-gray-600';
  const glowStyles = glow ? 'shadow-lg shadow-red-500/20' : '';
  const hoverStyles = hover ? 'hover:transform hover:scale-105 hover:shadow-yellow-500/30 transition-all duration-300' : '';
  
  return (
    <div className={`${baseStyles} ${cosmicStyles} ${glowStyles} ${hoverStyles} ${className}`}>
      {children}
    </div>
  );
}