'use client';

import React from 'react';

export function StarField() {
  // Static stars for reliable rendering
  const stars = Array.from({ length: 50 }, (_, i) => ({
    id: i,
    left: (i * 17.3) % 100, // Pseudo-random but consistent
    top: (i * 23.7) % 100,
    size: (i % 3) + 1,
    delay: (i * 0.2) % 4,
    color: i % 4 === 0 ? 'bg-red-500' : 
           i % 4 === 1 ? 'bg-teal-400' :
           i % 4 === 2 ? 'bg-purple-500' : 'bg-white'
  }));

  return (
    <>
      {/* Background gradient */}
      <div 
        className="fixed inset-0 w-full h-full pointer-events-none z-0"
        style={{
          background: 'linear-gradient(135deg, #0a0a0f 0%, #1a1a2e 50%, #2d2d3a 100%)'
        }}
      />
      
      {/* Stars */}
      <div className="fixed inset-0 w-full h-full pointer-events-none z-1 overflow-hidden">
        {stars.map((star) => (
          <div
            key={star.id}
            className={`absolute ${star.color} rounded-full animate-pulse opacity-70`}
            style={{
              left: `${star.left}%`,
              top: `${star.top}%`,
              width: `${star.size}px`,
              height: `${star.size}px`,
              animationDelay: `${star.delay}s`,
              boxShadow: star.color !== 'bg-white' ? `0 0 6px currentColor` : '0 0 3px white'
            }}
          />
        ))}
        
        {/* Nebula effects */}
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-red-500/10 rounded-full blur-3xl animate-pulse" />
        <div className="absolute top-3/4 right-1/4 w-80 h-80 bg-purple-500/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '2s' }} />
        <div className="absolute top-1/2 right-1/3 w-64 h-64 bg-teal-500/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '4s' }} />
      </div>
    </>
  );
}