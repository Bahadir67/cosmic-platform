// src/store/authStore.ts - COSMIC Platform Auth Store
import { create } from 'zustand';
import { apiClient, User, getApiErrorMessage } from '@/lib/api';

interface AuthState {
  // State
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  
  // Actions
  login: (email: string, password: string) => Promise<boolean>;
  register: (name: string, email: string, password: string) => Promise<boolean>;
  logout: () => Promise<void>;
  getCurrentUser: () => Promise<void>;
  clearError: () => void;
  setLoading: (loading: boolean) => void;
  
  // Initialize auth state from stored tokens
  initialize: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  // Initial state
  user: null,
  isAuthenticated: false,
  isLoading: false,
  error: null,

// Login action
  login: async (email: string, password: string): Promise<boolean> => {
    set({ isLoading: true, error: null });
    
    try {
      const authResponse = await apiClient.login({ 
        identifier: email,  // email yerine identifier gönder
        password 
      });
      
      set({
        user: authResponse.user,
        isAuthenticated: true,
        isLoading: false,
        error: null,
      });
      
      return true;
    } catch (error) {
      const errorMessage = getApiErrorMessage(error);
      set({
        user: null,
        isAuthenticated: false,
        isLoading: false,
        error: errorMessage,
      });
      return false;
    }
  },

// Register action
  register: async (name: string, email: string, password: string): Promise<boolean> => {
    set({ isLoading: true, error: null });
    
    try {
      await apiClient.register({ 
        username: name.trim(),  // name yerine username gönder
        email: email.trim(), 
        password 
      });
      
      set({
        isLoading: false,
        error: null,
      });
      
      return true;
    } catch (error) {
      const errorMessage = getApiErrorMessage(error);
      set({
        isLoading: false,
        error: errorMessage,
      });
      return false;
    }
  },

  // Logout action
  logout: async (): Promise<void> => {
    set({ isLoading: true });
    
    try {
      await apiClient.logout();
    } catch (error) {
      console.error('Logout error:', error);
      // Continue with logout even if API call fails
    }
    
    set({
      user: null,
      isAuthenticated: false,
      isLoading: false,
      error: null,
    });
  },

  // Get current user
  getCurrentUser: async (): Promise<void> => {
    if (!apiClient.hasValidToken()) {
      return;
    }
    
    set({ isLoading: true });
    
    try {
      const user = await apiClient.getCurrentUser();
      set({
        user,
        isAuthenticated: true,
        isLoading: false,
      });
    } catch (error) {
      // Token is invalid, clear auth state
      apiClient.clearTokens();
      set({
        user: null,
        isAuthenticated: false,
        isLoading: false,
      });
    }
  },

  // Initialize auth state
  initialize: async (): Promise<void> => {
    if (typeof window === 'undefined') return;
    
    if (apiClient.hasValidToken()) {
      await get().getCurrentUser();
    }
  },

  // Clear error
  clearError: () => {
    set({ error: null });
  },

  // Set loading state
  setLoading: (loading: boolean) => {
    set({ isLoading: loading });
  },
}));

// Utility hooks for common patterns
export const useAuth = () => {
  const store = useAuthStore();
  return {
    user: store.user,
    isAuthenticated: store.isAuthenticated,
    isLoading: store.isLoading,
    error: store.error,
  };
};

export const useAuthActions = () => {
  const store = useAuthStore();
  return {
    login: store.login,
    register: store.register,
    logout: store.logout,
    clearError: store.clearError,
    initialize: store.initialize,
  };
};