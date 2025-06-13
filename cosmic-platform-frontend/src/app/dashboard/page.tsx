'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth, useAuthActions } from '@/store/authStore';

export default function Dashboard() {
  const router = useRouter();
  const { user, isAuthenticated, isLoading } = useAuth();
  const { logout, initialize } = useAuthActions();

  // Initialize auth state
  useEffect(() => {
    //initialize();
  }, [initialize]);

  // Redirect if not authenticated
  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push('/');
    }
  }, [isAuthenticated, isLoading, router]);

  // Handle logout
  const handleLogout = async () => {
    await logout();
    router.push('/');
  };

  // Show loading state
  if (isLoading) {
    return (
      <div className="min-h-screen bg-cosmic-void flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-cosmic-star/30 border-t-cosmic-star rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-400">Loading your cosmic dashboard...</p>
        </div>
      </div>
    );
  }

  // Don't render if not authenticated
  if (!isAuthenticated || !user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-cosmic-void">
      {/* Animated Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-cosmic-void via-purple-900/10 to-cosmic-void">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_25%_25%,_rgba(233,69,96,0.05)_0%,_transparent_50%)]"></div>
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_75%_75%,_rgba(243,156,18,0.05)_0%,_transparent_50%)]"></div>
      </div>

      {/* Twinkling Stars */}
      <div className="absolute inset-0 pointer-events-none">
        {[...Array(20)].map((_, i) => (
          <div
            key={i}
            className="absolute w-1 h-1 bg-white/60 rounded-full animate-twinkle"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 3}s`,
              animationDuration: `${2 + Math.random() * 2}s`,
            }}
          ></div>
        ))}
      </div>

      {/* Main Content */}
      <div className="relative z-10">
        {/* Header */}
        <header className="bg-gray-900/50 backdrop-blur-xl border-b border-gray-700/50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between h-16">
              {/* Logo */}
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-cosmic-star/20 rounded-lg flex items-center justify-center">
                  <span className="text-lg">🌌</span>
                </div>
                <h1 className="text-xl font-bold text-white">COSMIC Platform</h1>
              </div>

              {/* User Menu */}
              <div className="flex items-center space-x-4">
                <div className="text-sm text-gray-300">
                  Welcome back, <span className="text-cosmic-star font-semibold">{user.name}</span>
                </div>
                <button
                  onClick={handleLogout}
                  className="px-4 py-2 text-sm bg-gray-800/50 text-gray-300 rounded-lg hover:bg-gray-700/50 hover:text-white transition-colors duration-200"
                >
                  Logout
                </button>
              </div>
            </div>
          </div>
        </header>

        {/* Dashboard Content */}
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Welcome Section */}
          <div className="mb-8">
            <div className="cosmic-card bg-gray-900/50 backdrop-blur-xl border border-gray-700/50 rounded-2xl p-8">
              <div className="text-center">
                <div className="inline-flex items-center justify-center w-20 h-20 bg-cosmic-star/20 rounded-full mb-4 animate-pulse">
                  <span className="text-3xl">⭐</span>
                </div>
                <h2 className="text-3xl font-bold text-white mb-2">Your Star System</h2>
                <p className="text-gray-400 mb-6">
                  Welcome to your cosmic dashboard, {user.name}. Your stellar journey begins here.
                </p>
                
                {/* User Stats */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
                  <div className="bg-gray-800/30 rounded-lg p-6 text-center">
                    <div className="text-2xl mb-2">🌍</div>
                    <div className="text-2xl font-bold text-cosmic-plasma">0</div>
                    <div className="text-sm text-gray-400">Planets Created</div>
                  </div>
                  <div className="bg-gray-800/30 rounded-lg p-6 text-center">
                    <div className="text-2xl mb-2">🌌</div>
                    <div className="text-2xl font-bold text-cosmic-star">0</div>
                    <div className="text-sm text-gray-400">Galaxies Joined</div>
                  </div>
                  <div className="bg-gray-800/30 rounded-lg p-6 text-center">
                    <div className="text-2xl mb-2">🌉</div>
                    <div className="text-2xl font-bold text-purple-400">0</div>
                    <div className="text-sm text-gray-400">Bridges Built</div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
            {/* Create Planet */}
            <div className="cosmic-card bg-gray-900/50 backdrop-blur-xl border border-gray-700/50 rounded-xl p-6 hover:border-cosmic-star/50 transition-all duration-200 cursor-pointer group">
              <div className="text-center">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-cosmic-plasma/20 rounded-full mb-4 group-hover:scale-110 transition-transform duration-200">
                  <span className="text-2xl">🌍</span>
                </div>
                <h3 className="text-xl font-semibold text-white mb-2">Create Planet</h3>
                <p className="text-gray-400 text-sm mb-4">Share your thoughts and create content in your personal space</p>
                <button className="cosmic-button px-4 py-2 bg-cosmic-plasma/20 text-cosmic-plasma rounded-lg hover:bg-cosmic-plasma/30 transition-colors duration-200">
                  Coming Soon
                </button>
              </div>
            </div>

            {/* Join Galaxy */}
            <div className="cosmic-card bg-gray-900/50 backdrop-blur-xl border border-gray-700/50 rounded-xl p-6 hover:border-cosmic-star/50 transition-all duration-200 cursor-pointer group">
              <div className="text-center">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-cosmic-star/20 rounded-full mb-4 group-hover:scale-110 transition-transform duration-200">
                  <span className="text-2xl">🌌</span>
                </div>
                <h3 className="text-xl font-semibold text-white mb-2">Join Galaxy</h3>
                <p className="text-gray-400 text-sm mb-4">Connect with communities and explore shared universes</p>
                <button className="cosmic-button px-4 py-2 bg-cosmic-star/20 text-cosmic-star rounded-lg hover:bg-cosmic-star/30 transition-colors duration-200">
                  Coming Soon
                </button>
              </div>
            </div>

            {/* Build Bridge */}
            <div className="cosmic-card bg-gray-900/50 backdrop-blur-xl border border-gray-700/50 rounded-xl p-6 hover:border-purple-500/50 transition-all duration-200 cursor-pointer group">
              <div className="text-center">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-purple-500/20 rounded-full mb-4 group-hover:scale-110 transition-transform duration-200">
                  <span className="text-2xl">🌉</span>
                </div>
                <h3 className="text-xl font-semibold text-white mb-2">Build Bridge</h3>
                <p className="text-gray-400 text-sm mb-4">Create connections between ideas and content</p>
                <button className="cosmic-button px-4 py-2 bg-purple-500/20 text-purple-400 rounded-lg hover:bg-purple-500/30 transition-colors duration-200">
                  Coming Soon
                </button>
              </div>
            </div>
          </div>

          {/* Account Status */}
          <div className="cosmic-card bg-gray-900/50 backdrop-blur-xl border border-gray-700/50 rounded-xl p-6">
            <h3 className="text-xl font-semibold text-white mb-4">Account Status</h3>
            <div className="space-y-4">
              {/* Email Verification */}
              <div className="flex items-center justify-between p-4 bg-gray-800/30 rounded-lg">
                <div className="flex items-center space-x-3">
                  <div className={`w-3 h-3 rounded-full ${user.verified ? 'bg-green-400' : 'bg-yellow-400'} animate-pulse`}></div>
                  <div>
                    <div className="text-white font-medium">Email Verification</div>
                    <div className="text-sm text-gray-400">{user.email}</div>
                  </div>
                </div>
                <div className={`px-3 py-1 rounded-full text-xs font-medium ${
                  user.verified 
                    ? 'bg-green-400/20 text-green-400' 
                    : 'bg-yellow-400/20 text-yellow-400'
                }`}>
                  {user.verified ? 'Verified' : 'Pending'}
                </div>
              </div>

              {/* Account Created */}
              <div className="flex items-center justify-between p-4 bg-gray-800/30 rounded-lg">
                <div className="flex items-center space-x-3">
                  <div className="w-3 h-3 rounded-full bg-blue-400 animate-pulse"></div>
                  <div>
                    <div className="text-white font-medium">Star System Created</div>
                    <div className="text-sm text-gray-400">
                      {new Date(user.created_at).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                      })}
                    </div>
                  </div>
                </div>
                <div className="px-3 py-1 rounded-full text-xs font-medium bg-blue-400/20 text-blue-400">
                  Active
                </div>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="mt-8 text-center text-gray-500 text-sm">
            <p>"Every mind is a universe. Every share is a trace."</p>
            <p className="mt-2">COSMIC Platform - Your Digital Universe Awaits</p>
          </div>
        </main>
      </div>
    </div>
  );
}