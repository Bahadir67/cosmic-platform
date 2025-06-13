// src/lib/api.ts - COSMIC Platform API Client
import axios, { AxiosInstance, AxiosResponse } from 'axios';

// API Configuration
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
const ACCESS_TOKEN_KEY = 'cosmic_access_token';
const REFRESH_TOKEN_KEY = 'cosmic_refresh_token';

// Types for API responses
export interface User {
  id: string;
  email: string;
  name: string;
  verified: boolean;
  locked_until?: string | null;
  created_at: string;
  updated_at: string;
}

export interface AuthResponse {
  message: string;
  user: User;
  access_token: string;
  refresh_token: string;
}

export interface ApiError {
  message: string;
  errors?: string[];
}

// Create axios instance
class ApiClient {
  private client: AxiosInstance;

  constructor() {
    this.client = axios.create({
      baseURL: API_BASE_URL,
      timeout: 10000,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    // Request interceptor - Add auth token
    this.client.interceptors.request.use((config) => {
      const token = this.getAccessToken();
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
      return config;
    });

    // Response interceptor - Handle token refresh
    this.client.interceptors.response.use(
      (response) => response,
      async (error) => {
        const originalRequest = error.config;

        if (error.response?.status === 401 && !originalRequest._retry) {
          originalRequest._retry = true;

          try {
            const refreshToken = this.getRefreshToken();
            if (refreshToken) {
              const response = await this.refreshAccessToken();
              this.setTokens(response.access_token, response.refresh_token);
              originalRequest.headers.Authorization = `Bearer ${response.access_token}`;
              return this.client(originalRequest);
            }
          } catch (refreshError) {
            this.clearTokens();
            // Redirect to login or trigger auth state update
            if (typeof window !== 'undefined') {
              window.location.href = '/';
            }
          }
        }

        return Promise.reject(error);
      }
    );
  }

  // Token Management
  private getAccessToken(): string | null {
    if (typeof window === 'undefined') return null;
    return localStorage.getItem(ACCESS_TOKEN_KEY);
  }

  private getRefreshToken(): string | null {
    if (typeof window === 'undefined') return null;
    return localStorage.getItem(REFRESH_TOKEN_KEY);
  }

  public setTokens(accessToken: string, refreshToken: string): void {
    if (typeof window === 'undefined') return;
    localStorage.setItem(ACCESS_TOKEN_KEY, accessToken);
    localStorage.setItem(REFRESH_TOKEN_KEY, refreshToken);
  }

  public clearTokens(): void {
    if (typeof window === 'undefined') return;
    localStorage.removeItem(ACCESS_TOKEN_KEY);
    localStorage.removeItem(REFRESH_TOKEN_KEY);
  }

  public hasValidToken(): boolean {
    return !!this.getAccessToken();
  }

// Auth API Methods
  public async register(data: {
    username: string;  // name yerine username
    email: string;
    password: string;
  }): Promise<{ message: string }> {
    const response = await this.client.post('/auth/register', data);
    return response.data;
  }

 public async login(data: {
    identifier: string;  // email yerine identifier
    password: string;
  }): Promise<AuthResponse> {
    const response = await this.client.post('/auth/login', data);
    const authData = response.data as AuthResponse;
    
    // Store tokens
    this.setTokens(authData.access_token, authData.refresh_token);
    
    return authData;
  }

  public async logout(): Promise<void> {
    try {
      await this.client.post('/auth/logout');
    } finally {
      this.clearTokens();
    }
  }

  public async getCurrentUser(): Promise<User> {
    const response = await this.client.get('/auth/me');
    return response.data.user;
  }

  public async refreshAccessToken(): Promise<{
    access_token: string;
    refresh_token: string;
  }> {
    const refreshToken = this.getRefreshToken();
    if (!refreshToken) {
      throw new Error('No refresh token available');
    }

    const response = await this.client.post('/auth/refresh', {
      refresh_token: refreshToken,
    });

    return response.data;
  }

  public async forgotPassword(email: string): Promise<{ message: string }> {
    const response = await this.client.post('/auth/forgot-password', { email });
    return response.data;
  }

  public async resetPassword(data: {
    token: string;
    password: string;
  }): Promise<{ message: string }> {
    const response = await this.client.post('/auth/reset-password', data);
    return response.data;
  }

  public async updateProfile(data: {
    name?: string;
    email?: string;
  }): Promise<User> {
    const response = await this.client.put('/auth/profile', data);
    return response.data.user;
  }

  public async changePassword(data: {
    current_password: string;
    new_password: string;
  }): Promise<{ message: string }> {
    const response = await this.client.post('/auth/change-password', data);
    return response.data;
  }

  public async verifyEmail(token: string): Promise<{ message: string }> {
    const response = await this.client.get(`/auth/verify-email?token=${token}`);
    return response.data;
  }
}

// Create singleton instance
export const apiClient = new ApiClient();

// Utility function to handle API errors
export function getApiErrorMessage(error: any): string {
  if (error.response?.data?.message) {
    return error.response.data.message;
  }
  if (error.response?.data?.errors?.length > 0) {
    return error.response.data.errors[0];
  }
  if (error.message) {
    return error.message;
  }
  return 'An unexpected error occurred';
}