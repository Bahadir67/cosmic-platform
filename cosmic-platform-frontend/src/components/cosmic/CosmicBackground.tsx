'use client';

import React, { useEffect, useState } from 'react';

export function CosmicBackground() {
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  // Static dust particles - hydration safe
  const staticDustParticles = [
    { left: 15, top: 55, delay: 2, duration: 4.5 },
    { left: 69, top: 13, delay: 3.8, duration: 4.2 },
    { left: 76, top: 38, delay: 0.3, duration: 3.6 },
    { left: 11, top: 81, delay: 3.9, duration: 4.1 },
    { left: 24, top: 87, delay: 3.4, duration: 4.4 },
    { left: 8, top: 76, delay: 1.8, duration: 3.7 },
    { left: 16, top: 10, delay: 0.2, duration: 3.1 },
    { left: 12, top: 65, delay: 4.9, duration: 3.2 },
    { left: 44, top: 9, delay: 4.5, duration: 4.7 },
    { left: 64, top: 0, delay: 0.6, duration: 4.6 },
    { left: 5, top: 56, delay: 2.5, duration: 3.7 },
    { left: 45, top: 59, delay: 0.2, duration: 4.8 },
    { left: 68, top: 34, delay: 4.9, duration: 3.5 },
    { left: 8, top: 61, delay: 0.8, duration: 3.6 },
    { left: 68, top: 13, delay: 0.3, duration: 3.1 },
    { left: 46, top: 50, delay: 3.2, duration: 4.4 },
    { left: 24, top: 10, delay: 1.2, duration: 4.8 },
    { left: 31, top: 87, delay: 1.5, duration: 2.1 },
    { left: 56, top: 4, delay: 1.9, duration: 3.4 },
    { left: 41, top: 8, delay: 1.8, duration: 3.0 },
  ];

  if (!isClient) {
    // Server-side rendering - static version
    return (
      <div className="fixed inset-0 w-full h-full pointer-events-none z-0 overflow-hidden">
        {/* Base gradient */}
        <div className="absolute inset-0" style={{
          background: 'linear-gradient(135deg, #0a0a0f 0%, #1a1a2e 50%, #2d2d3a 100%)'
        }} />
        
        {/* Static nebula effects */}
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-red-500/10 rounded-full blur-3xl" />
        <div className="absolute top-3/4 right-1/4 w-80 h-80 bg-purple-500/10 rounded-full blur-3xl" />
        <div className="absolute top-1/2 right-1/3 w-64 h-64 bg-teal-500/10 rounded-full blur-3xl" />
      </div>
    );
  }

  return (
    <div className="fixed inset-0 w-full h-full pointer-events-none z-0 overflow-hidden">
      {/* Base gradient */}
      <div className="absolute inset-0" style={{
        background: 'linear-gradient(135deg, #0a0a0f 0%, #1a1a2e 50%, #2d2d3a 100%)'
      }} />
      
      {/* Floating nebula effects */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-red-500/10 rounded-full blur-3xl animate-pulse" />
      <div 
        className="absolute top-3/4 right-1/4 w-80 h-80 bg-purple-500/10 rounded-full blur-3xl animate-pulse" 
        style={{ animationDelay: '2s' }} 
      />
      <div 
        className="absolute top-1/2 right-1/3 w-64 h-64 bg-teal-500/10 rounded-full blur-3xl animate-pulse" 
        style={{ animationDelay: '4s' }} 
      />
      
      {/* Static dust particles */}
      <div className="absolute inset-0">
        {staticDustParticles.map((particle, i) => (
          <div
            key={i}
            className="absolute w-1 h-1 bg-gray-100 rounded-full opacity-20 animate-pulse"
            style={{
              left: `${particle.left}%`,
              top: `${particle.top}%`,
              animationDelay: `${particle.delay}s`,
              animationDuration: `${particle.duration}s`
            }}
          />
        ))}
      </div>
    </div>
  );
}

export default CosmicBackground;