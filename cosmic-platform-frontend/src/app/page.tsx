'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth, useAuthActions } from '@/store/authStore';

export default function LoginPage() {
  const router = useRouter();
  const { isAuthenticated, isLoading, error } = useAuth();
  const { login, register, clearError, initialize } = useAuthActions();

  // Local state
  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
  });
  const [showSuccess, setShowSuccess] = useState(false);

  // Initialize auth store on mount
  useEffect(() => {
    //initialize();
  }, [initialize]);

  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated) {
      router.push('/dashboard');
    }
  }, [isAuthenticated, router]);

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    clearError();

    if (mode === 'register') {
      // Validation for registration
      if (formData.password !== formData.confirmPassword) {
        return; // Could add local validation error
      }
      if (formData.name.trim().length < 2) {
        return; // Could add local validation error
      }

      const success = await register(formData.name, formData.email, formData.password);
      if (success) {
        setShowSuccess(true);
        setMode('login');
        setFormData(prev => ({ ...prev, name: '', password: '', confirmPassword: '' }));
      }
    } else {
      // Login
      const success = await login(formData.email, formData.password);
      if (success) {
        router.push('/dashboard');
      }
    }
  };

  // Handle input changes
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (error) clearError();
  };

  // Handle mode switch
  const switchMode = () => {
    setMode(mode === 'login' ? 'register' : 'login');
    clearError();
    setShowSuccess(false);
    setFormData({ name: '', email: '', password: '', confirmPassword: '' });
  };

  return (
    <div className="min-h-screen bg-cosmic-void overflow-hidden relative">
      {/* Animated Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-cosmic-void via-purple-900/20 to-cosmic-void">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_25%_25%,_rgba(233,69,96,0.1)_0%,_transparent_50%)]"></div>
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_75%_75%,_rgba(243,156,18,0.1)_0%,_transparent_50%)]"></div>
      </div>

      {/* Floating Nebula Clouds */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-96 h-96 bg-cosmic-star/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-20 right-10 w-80 h-80 bg-cosmic-plasma/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-purple-500/10 rounded-full blur-3xl animate-pulse delay-2000"></div>
      </div>

      {/* Twinkling Stars */}
      <div className="absolute inset-0 pointer-events-none">
        {[...Array(25)].map((_, i) => (
          <div
            key={i}
            className="absolute w-1 h-1 bg-white rounded-full animate-twinkle"
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
      <div className="relative z-10 min-h-screen flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          {/* Cosmic Card */}
          <div className="cosmic-card bg-gray-900/50 backdrop-blur-xl border border-gray-700/50 rounded-2xl p-8 shadow-2xl">
            {/* Header */}
            <div className="text-center mb-8">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-cosmic-star/20 rounded-full mb-4 animate-pulse">
                <span className="text-2xl">🌌</span>
              </div>
              <h1 className="text-3xl font-bold text-white mb-2">
                {mode === 'login' ? 'Welcome Back' : 'Join the Cosmos'}
              </h1>
              <p className="text-gray-400">
                {mode === 'login' 
                  ? 'Enter your cosmic coordinates' 
                  : 'Create your stellar identity'
                }
              </p>
            </div>

            {/* Success Message */}
            {showSuccess && (
              <div className="mb-6 p-4 bg-green-500/20 border border-green-500/50 rounded-lg text-green-300 text-sm">
                🚀 Registration successful! Please check your email to verify your account, then login below.
              </div>
            )}

            {/* Error Message */}
            {error && (
              <div className="mb-6 p-4 bg-red-500/20 border border-red-500/50 rounded-lg text-red-300 text-sm">
                ⚠️ {error}
              </div>
            )}

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Name field (register only) */}
              {mode === 'register' && (
                <div>
                  <label htmlFor="name" className="block text-sm font-medium text-gray-300 mb-2">
                    Cosmic Name
                  </label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    required
                    disabled={isLoading}
                    className="cosmic-input w-full px-4 py-3 bg-gray-800/50 border border-gray-600/50 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-cosmic-star focus:border-transparent transition-all duration-200 disabled:opacity-50"
                    placeholder="Enter your name"
                  />
                </div>
              )}

              {/* Email field */}
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-300 mb-2">
                  Email Address
                </label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  required
                  disabled={isLoading}
                  className="cosmic-input w-full px-4 py-3 bg-gray-800/50 border border-gray-600/50 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-cosmic-star focus:border-transparent transition-all duration-200 disabled:opacity-50"
                  placeholder="Enter your email"
                />
              </div>

              {/* Password field */}
              <div>
                <label htmlFor="password" className="block text-sm font-medium text-gray-300 mb-2">
                  Password {mode === 'register' && <span className="text-xs text-gray-400">(min 6 chars, 1 special char: !@#$%^&*)</span>}
                </label>
                <input
                  type="password"
                  id="password"
                  name="password"
                  value={formData.password}
                  onChange={handleInputChange}
                  required
                  disabled={isLoading}
                  className="cosmic-input w-full px-4 py-3 bg-gray-800/50 border border-gray-600/50 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-cosmic-star focus:border-transparent transition-all duration-200 disabled:opacity-50"
                  placeholder={mode === 'register' ? "Enter password (e.g. mypass123!)" : "Enter your password"}
                />
              </div>

              {/* Confirm Password field (register only) */}
              {mode === 'register' && (
                <div>
                  <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-300 mb-2">
                    Confirm Password
                  </label>
                  <input
                    type="password"
                    id="confirmPassword"
                    name="confirmPassword"
                    value={formData.confirmPassword}
                    onChange={handleInputChange}
                    required
                    disabled={isLoading}
                    className="cosmic-input w-full px-4 py-3 bg-gray-800/50 border border-gray-600/50 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-cosmic-star focus:border-transparent transition-all duration-200 disabled:opacity-50"
                    placeholder="Confirm your password"
                  />
                </div>
              )}

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isLoading}
                className="cosmic-button w-full py-3 px-6 bg-gradient-to-r from-cosmic-star to-cosmic-plasma text-white font-semibold rounded-lg hover:shadow-lg hover:shadow-cosmic-star/25 transform hover:scale-105 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
              >
                {isLoading ? (
                  <div className="flex items-center justify-center space-x-2">
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                    <span>{mode === 'login' ? 'Entering...' : 'Creating...'}</span>
                  </div>
                ) : (
                  <>
                    {mode === 'login' ? 'Enter the Cosmos 🚀' : 'Create Star System ⭐'}
                  </>
                )}
              </button>
            </form>

            {/* Mode Switch */}
            <div className="mt-6 text-center">
              <button
                type="button"
                onClick={switchMode}
                disabled={isLoading}
                className="text-cosmic-plasma hover:text-cosmic-star transition-colors duration-200 text-sm disabled:opacity-50"
              >
                {mode === 'login' 
                  ? "Don't have an account? Create one" 
                  : 'Already have an account? Sign in'
                }
              </button>
            </div>

            {/* Status Indicator */}
            <div className="mt-6 flex items-center justify-center space-x-2 text-xs text-gray-500">
              <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
              <span>Cosmic Network Online</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}