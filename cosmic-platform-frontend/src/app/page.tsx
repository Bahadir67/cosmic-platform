'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function Home() {
  const router = useRouter();
  
  // Local state
  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [focusedField, setFocusedField] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
  });
  const [showSuccess, setShowSuccess] = useState(false);

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      if (mode === 'register') {
        // Validation
        if (formData.password !== formData.confirmPassword) {
          setError('Şifreler eşleşmiyor');
          return;
        }
        if (formData.username.trim().length < 2) {
          setError('Kullanıcı adı en az 2 karakter olmalı');
          return;
        }
        if (formData.password.length < 6) {
          setError('Şifre en az 6 karakter olmalı');
          return;
        }

        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 1500));
        
        setShowSuccess(true);
        setMode('login');
        setFormData(prev => ({ 
          ...prev, 
          username: '', 
          password: '', 
          confirmPassword: '' 
        }));
      } else {
        // Login simulation
        if (formData.email && formData.password) {
          await new Promise(resolve => setTimeout(resolve, 1000));
          router.push('/dashboard');
        } else {
          setError('Email ve şifre gerekli');
        }
      }
    } catch (err: any) {
      setError(err.message || 'Bir hata oluştu');
    } finally {
      setIsLoading(false);
    }
  };

  // Handle input changes
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (error) setError('');
  };

  // Handle mode switch
  const switchMode = () => {
    setMode(mode === 'login' ? 'register' : 'login');
    setError('');
    setShowSuccess(false);
    setFormData({ username: '', email: '', password: '', confirmPassword: '' });
    setFocusedField(null);
  };

  return (
    <main className="relative min-h-screen flex items-center justify-center p-8">
      {/* Desktop Layout Container */}
      <div className="w-full max-w-6xl grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
        
        {/* Left Side - Branding & Info */}
        <div className="hidden lg:block text-center lg:text-left space-y-8">
          {/* Main Brand */}
          <div className="space-y-6">
            <div className="flex items-center justify-center lg:justify-start space-x-4">
              <div className="w-4 h-4 bg-cosmic-star rounded-full animate-pulse" />
              <h1 className="text-6xl font-bold bg-gradient-to-r from-cosmic-star via-cosmic-plasma to-cosmic-star bg-clip-text text-transparent">
                COSMIC
              </h1>
              <div className="w-4 h-4 bg-cosmic-plasma rounded-full animate-pulse animation-delay-1000" />
            </div>
            
            <div className="space-y-4">
              <h2 className="text-2xl text-white font-semibold">
                Every mind is a universe
              </h2>
              <p className="text-white/70 text-lg leading-relaxed max-w-md">
                Connect your thoughts across the digital cosmos. Create planets of knowledge, 
                build bridges between ideas, and explore galaxies of community.
              </p>
            </div>
          </div>

          {/* Feature Cards */}
          <div className="space-y-4">
            <div className="flex items-center space-x-4 p-4 bg-white/5 backdrop-blur-sm rounded-xl border border-white/10">
              <div className="w-8 h-8 bg-cosmic-star/20 rounded-lg flex items-center justify-center">
                <span className="text-cosmic-star">🌍</span>
              </div>
              <div className="text-left">
                <div className="text-white font-medium">Create Planets</div>
                <div className="text-white/60 text-sm">Transform thoughts into digital worlds</div>
              </div>
            </div>
            
            <div className="flex items-center space-x-4 p-4 bg-white/5 backdrop-blur-sm rounded-xl border border-white/10">
              <div className="w-8 h-8 bg-cosmic-plasma/20 rounded-lg flex items-center justify-center">
                <span className="text-cosmic-plasma">🌉</span>
              </div>
              <div className="text-left">
                <div className="text-white font-medium">Build Bridges</div>
                <div className="text-white/60 text-sm">Connect ideas across the universe</div>
              </div>
            </div>
            
            <div className="flex items-center space-x-4 p-4 bg-white/5 backdrop-blur-sm rounded-xl border border-white/10">
              <div className="w-8 h-8 bg-purple-500/20 rounded-lg flex items-center justify-center">
                <span className="text-purple-400">🌌</span>
              </div>
              <div className="text-left">
                <div className="text-white font-medium">Join Galaxies</div>
                <div className="text-white/60 text-sm">Discover communities of explorers</div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Side - Login Form */}
        <div className="w-full max-w-md mx-auto space-y-6">
          
          {/* Mobile Header */}
          <div className="lg:hidden text-center mb-8">
            <div className="flex items-center justify-center space-x-3 mb-4">
              <div className="w-3 h-3 bg-cosmic-star rounded-full animate-pulse" />
              <h1 className="text-4xl font-bold bg-gradient-to-r from-cosmic-star via-cosmic-plasma to-cosmic-star bg-clip-text text-transparent">
                COSMIC
              </h1>
              <div className="w-3 h-3 bg-cosmic-plasma rounded-full animate-pulse animation-delay-1000" />
            </div>
            <p className="text-white/70">Every mind is a universe</p>
          </div>

          {/* Form Header */}
          <div className="text-center space-y-2">
            <h2 className="text-2xl font-bold text-white">
              {mode === 'login' ? 'Welcome Back' : 'Join the Cosmos'}
            </h2>
            <p className="text-white/60">
              {mode === 'login' ? 'Continue your cosmic journey' : 'Begin your digital universe exploration'}
            </p>
          </div>

          {/* Success Message */}
          {showSuccess && (
            <div className="p-4 bg-emerald-500/20 border border-emerald-500/30 rounded-xl text-emerald-200 text-sm backdrop-blur-sm">
              <div className="flex items-center space-x-2">
                <span>🚀</span>
                <span>Registration successful! Welcome to the cosmos.</span>
              </div>
            </div>
          )}

          {/* Error Message */}
          {error && (
            <div className="p-4 bg-red-500/20 border border-red-500/30 rounded-xl text-red-200 text-sm backdrop-blur-sm">
              <div className="flex items-center space-x-2">
                <span>⚠️</span>
                <span>{error}</span>
              </div>
            </div>
          )}

          {/* Mode Toggle */}
          <div className="flex bg-white/5 backdrop-blur-sm rounded-xl p-1 border border-white/10">
            <button
              onClick={() => setMode('login')}
              className={`flex-1 py-3 px-4 rounded-lg text-sm font-medium transition-all duration-300 ${
                mode === 'login'
                  ? 'bg-cosmic-star text-white shadow-lg'
                  : 'text-white/70 hover:text-white hover:bg-white/5'
              }`}
            >
              Sign In
            </button>
            <button
              onClick={() => setMode('register')}
              className={`flex-1 py-3 px-4 rounded-lg text-sm font-medium transition-all duration-300 ${
                mode === 'register'
                  ? 'bg-cosmic-star text-white shadow-lg'
                  : 'text-white/70 hover:text-white hover:bg-white/5'
              }`}
            >
              Register
            </button>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Username field (register only) */}
            {mode === 'register' && (
              <div className="space-y-2">
                <label className="text-white/80 text-sm font-medium block">
                  Username
                </label>
                <input
                  type="text"
                  name="username"
                  value={formData.username}
                  onChange={handleInputChange}
                  onFocus={() => setFocusedField('username')}
                  onBlur={() => setFocusedField(null)}
                  placeholder="cosmic_explorer"
                  required
                  disabled={isLoading}
                  className={`w-full px-4 py-3 bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl text-white placeholder-white/40 transition-all duration-300 focus:outline-none focus:border-cosmic-star focus:bg-white/15 focus:ring-2 focus:ring-cosmic-star/20 ${
                    isLoading ? 'opacity-50 cursor-not-allowed' : ''
                  }`}
                />
              </div>
            )}
            
            {/* Email field */}
            <div className="space-y-2">
              <label className="text-white/80 text-sm font-medium block">
                {mode === 'login' ? 'Email or Username' : 'Email Address'}
              </label>
              <input
                type={mode === 'login' ? 'text' : 'email'}
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                onFocus={() => setFocusedField('email')}
                onBlur={() => setFocusedField(null)}
                placeholder="cosmic@universe.com"
                required
                disabled={isLoading}
                className={`w-full px-4 py-3 bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl text-white placeholder-white/40 transition-all duration-300 focus:outline-none focus:border-cosmic-star focus:bg-white/15 focus:ring-2 focus:ring-cosmic-star/20 ${
                  isLoading ? 'opacity-50 cursor-not-allowed' : ''
                }`}
              />
            </div>
            
            {/* Password field */}
            <div className="space-y-2">
              <label className="text-white/80 text-sm font-medium block">
                Password
              </label>
              <input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleInputChange}
                onFocus={() => setFocusedField('password')}
                onBlur={() => setFocusedField(null)}
                placeholder="••••••••"
                required
                disabled={isLoading}
                className={`w-full px-4 py-3 bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl text-white placeholder-white/40 transition-all duration-300 focus:outline-none focus:border-cosmic-star focus:bg-white/15 focus:ring-2 focus:ring-cosmic-star/20 ${
                  isLoading ? 'opacity-50 cursor-not-allowed' : ''
                }`}
              />
            </div>

            {/* Confirm Password field (register only) */}
            {mode === 'register' && (
              <div className="space-y-2">
                <label className="text-white/80 text-sm font-medium block">
                  Confirm Password
                </label>
                <input
                  type="password"
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleInputChange}
                  onFocus={() => setFocusedField('confirmPassword')}
                  onBlur={() => setFocusedField(null)}
                  placeholder="••••••••"
                  required
                  disabled={isLoading}
                  className={`w-full px-4 py-3 bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl text-white placeholder-white/40 transition-all duration-300 focus:outline-none focus:border-cosmic-star focus:bg-white/15 focus:ring-2 focus:ring-cosmic-star/20 ${
                    isLoading ? 'opacity-50 cursor-not-allowed' : ''
                  }`}
                />
              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3 px-6 bg-gradient-to-r from-cosmic-star to-cosmic-plasma text-white font-semibold rounded-xl transition-all duration-300 hover:shadow-lg hover:scale-[1.02] focus:outline-none focus:ring-2 focus:ring-cosmic-star/50 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
            >
              {isLoading ? (
                <div className="flex items-center justify-center space-x-2">
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                  <span>
                    {mode === 'login' ? 'Signing in...' : 'Creating account...'}
                  </span>
                </div>
              ) : (
                <span>
                  {mode === 'login' ? 'Enter the Cosmos' : 'Begin Your Journey'}
                </span>
              )}
            </button>
          </form>

          {/* Footer */}
          <div className="text-center">
            <button
              onClick={switchMode}
              disabled={isLoading}
              className="text-white/60 hover:text-cosmic-star transition-colors text-sm disabled:opacity-50"
            >
              {mode === 'login' 
                ? "Don't have an account? Register here" 
                : 'Already have an account? Sign in'
              }
            </button>
          </div>

          {/* Version */}
          <div className="text-center">
            <p className="text-white/40 text-xs">
              COSMIC Platform v1.0 • Digital Universe
            </p>
          </div>
        </div>
      </div>
    </main>
  );
}