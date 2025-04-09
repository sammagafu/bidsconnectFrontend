import axios from 'axios';
import { useAuthStore } from '@/stores/auth';

const API_URL = 'http://localhost:8000/api/v1/';
const TOKEN_KEY = 'auth_token';
const REFRESH_TOKEN_KEY = 'refresh_token';
const USER_KEY = 'user_data';

// Create axios instance for API requests
export const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// State for managing token refresh
let isRefreshing = false;
let refreshPromise = null;

// Request interceptor for debugging
api.interceptors.request.use(
  (config) => {
    console.log('Request URL:', config.baseURL + config.url);
    console.log('Request Method:', config.method);
    console.log('Request Headers:', config.headers);
    console.log('Request Data:', config.data);
    return config;
  },
  (error) => {
    console.error('Request Interceptor Error:', error);
    return Promise.reject(error);
  }
);

// Response interceptor for handling 401 errors and token refresh
api.interceptors.response.use(
  (response) => {
    console.log('Response Status:', response.status);
    console.log('Response Data:', response.data);
    return response;
  },
  async (error) => {
    console.error('Response Error:', error.message);
    if (error.response) {
      console.error('Response Status:', error.response.status);
      console.error('Response Data:', error.response.data);
      console.error('Response Headers:', error.response.headers);
    } else if (error.request) {
      console.error('No response received:', error.request);
    } else {
      console.error('Error setting up request:', error.message);
    }

    const originalRequest = error.config;
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      if (!isRefreshing) {
        isRefreshing = true;
        const refreshToken = localStorage.getItem(REFRESH_TOKEN_KEY) || sessionStorage.getItem(REFRESH_TOKEN_KEY);
        if (!refreshToken) {
          console.error('No refresh token available');
          await logoutAndRedirect();
          return Promise.reject(error);
        }

        console.log('Attempting to refresh token with:', refreshToken);
        refreshPromise = api.post('accounts/jwt/refresh/', { refresh: refreshToken })
          .then((response) => {
            const { access } = response.data;
            const storage = localStorage.getItem(TOKEN_KEY) ? localStorage : sessionStorage;
            storage.setItem(TOKEN_KEY, access);
            api.defaults.headers.common['Authorization'] = `Bearer ${access}`;
            console.log('Token refreshed successfully:', access);
            return access;
          })
          .catch(async (refreshError) => {
            console.error('Token refresh failed:', refreshError.response?.data || refreshError.message);
            await logoutAndRedirect();
            throw refreshError;
          })
          .finally(() => {
            isRefreshing = false;
            refreshPromise = null;
          });
      }

      return refreshPromise
        .then((access) => {
          originalRequest.headers['Authorization'] = `Bearer ${access}`;
          console.log('Retrying original request with new token:', access);
          return api(originalRequest);
        })
        .catch((refreshError) => {
          return Promise.reject(refreshError);
        });
    }
    return Promise.reject(error);
  }
);

// Authentication service object
const authService = {
  /** Login user and store tokens and user data */
  async login(credentials, rememberMe) {
    try {
      console.log('Attempting login with:', credentials);
      const tokenResponse = await api.post('accounts/jwt/create/', credentials);
      const { access, refresh } = tokenResponse.data;

      api.defaults.headers.common['Authorization'] = `Bearer ${access}`;
      console.log('Set Authorization header:', api.defaults.headers.common['Authorization']);

      const userResponse = await api.get('accounts/users/me/');
      const user = userResponse.data;

      console.log('Login successful:', { access, refresh, user });

      const storage = rememberMe ? localStorage : sessionStorage;
      storage.setItem(TOKEN_KEY, access);
      storage.setItem(REFRESH_TOKEN_KEY, refresh);
      storage.setItem(USER_KEY, JSON.stringify(user));

      return { access, refresh, user };
    } catch (error) {
      console.error('Login failed:', error.response?.data || error.message);
      throw error.response?.data || { message: 'Login failed' };
    }
  },

  /** Refresh access token using refresh token */
  async refreshToken() {
    try {
      const refreshToken = localStorage.getItem(REFRESH_TOKEN_KEY) || sessionStorage.getItem(REFRESH_TOKEN_KEY);
      if (!refreshToken) {
        throw new Error('No refresh token available');
      }

      const response = await api.post('accounts/jwt/refresh/', { refresh: refreshToken });
      const { access } = response.data;

      const storage = localStorage.getItem(TOKEN_KEY) ? localStorage : sessionStorage;
      storage.setItem(TOKEN_KEY, access);
      api.defaults.headers.common['Authorization'] = `Bearer ${access}`;
      return access;
    } catch (error) {
      console.error('Token refresh failed:', error.response?.data || error.message);
      await this.logout();
      const authStore = useAuthStore();
      authStore.logout();
      window.location.href = '/auth/sign-in';
      throw error.response?.data || { message: 'Token refresh failed' };
    }
  },

  /** Logout user and clear all stored data */
  async logout() {
    try {
      console.log('Logging out...');
    } catch (error) {
      console.error('Logout failed:', error);
    } finally {
      localStorage.removeItem(TOKEN_KEY);
      localStorage.removeItem(REFRESH_TOKEN_KEY);
      localStorage.removeItem(USER_KEY);
      sessionStorage.removeItem(TOKEN_KEY);
      sessionStorage.removeItem(REFRESH_TOKEN_KEY);
      sessionStorage.removeItem(USER_KEY);
      delete api.defaults.headers.common['Authorization'];
      console.log('Logout completed, tokens and user data cleared');
    }
  },

  /** Get the current access token */
  getToken() {
    return localStorage.getItem(TOKEN_KEY) || sessionStorage.getItem(TOKEN_KEY);
  },

  /** Get the current refresh token */
  getRefreshToken() {
    return localStorage.getItem(REFRESH_TOKEN_KEY) || sessionStorage.getItem(REFRESH_TOKEN_KEY);
  },

  /** Get the current user data */
  getUser() {
    const userData = localStorage.getItem(USER_KEY) || sessionStorage.getItem(USER_KEY);
    return userData ? JSON.parse(userData) : null;
  },

  /** Check if the user is authenticated */
  isAuthenticated() {
    return !!this.getToken();
  },

  /** Initialize authentication with existing token */
  initializeAuth() {
    const token = this.getToken();
    if (token) {
      api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    }
  },
};

// Helper function to handle logout and redirect
async function logoutAndRedirect() {
  await authService.logout();
  const authStore = useAuthStore();
  authStore.logout();
  window.location.href = '/sign-in';
}

export default authService;