'use client';

import { useEffect, ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth, useAuthActions } from '@/store/authStore';

interface ProtectedRouteProps {
  children: ReactNode;
  redirectTo?: string;
}

export default function ProtectedRoute({ 
  children, 
  redirectTo = '/' 
}: ProtectedRouteProps) {
  const router = useRouter();
  const { isAuthenticated, isLoading } = useAuth();
  const { initialize } = useAuthActions();

  useEffect(() => {
    initialize();
  }, [initialize]);

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push(redirectTo);
    }
  }, [isAuthenticated, isLoading, redirectTo, router]);

  // Show loading spinner while checking authentication
  if (isLoading) {
    return (
      <div className="min-h-screen bg-cosmic-void flex items-center justify-center">
        {/* Animated Background */}
        <div className="absolute inset-0 bg-gradient-to-br from-cosmic-void via-purple-900/10 to-cosmic-void">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_25%_25%,_rgba(233,69,96,0.05)_0%,_transparent_50%)]"></div>
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_75%_75%,_rgba(243,156,18,0.05)_0%,_transparent_50%)]"></div>
        </div>

        {/* Twinkling Stars */}
        <div className="absolute inset-0 pointer-events-none">
          {[...Array(15)].map((_, i) => (
            <div
              key={i}
              className="absolute w-1 h-1 bg-white/40 rounded-full animate-twinkle"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                animationDelay: `${Math.random() * 3}s`,
                animationDuration: `${2 + Math.random() * 2}s`,
              }}
            ></div>
          ))}
        </div>

        {/* Loading Content */}
        <div className="relative z-10 text-center">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-cosmic-star/20 rounded-full mb-6 animate-pulse">
            <span className="text-2xl">🌌</span>
          </div>
          <div className="w-16 h-16 border-4 border-cosmic-star/30 border-t-cosmic-star rounded-full animate-spin mx-auto mb-4"></div>
          <h2 className="text-xl font-semibold text-white mb-2">Accessing Your Universe</h2>
          <p className="text-gray-400">Authenticating your cosmic credentials...</p>
        </div>
      </div>
    );
  }

  // Don't render children if not authenticated
  if (!isAuthenticated) {
    return null;
  }

  return <>{children}</>;
}