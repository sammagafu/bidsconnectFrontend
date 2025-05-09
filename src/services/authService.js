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
let isRedirecting = false;

// Request interceptor for debugging and token validation
api.interceptors.request.use(
  async (config) => {
    const token = localStorage.getItem(TOKEN_KEY) || sessionStorage.getItem(TOKEN_KEY);
    if (token && !config.headers.Authorization) {
      config.headers.Authorization = `Bearer ${token}`;
      try {
        await api.get('accounts/users/me/', { headers: { Authorization: `Bearer ${token}` } });
      } catch (error) {
        console.warn('Token validation failed before request:', error.response?.data || error.message);
        if (error.response?.status === 401) {
          console.log('Access token invalid, clearing tokens');
          await logoutAndRedirect();
          throw error;
        }
      }
    }
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
      // Skip token refresh for login requests
      if (originalRequest.url.includes('jwt/create')) {
        return Promise.reject(error);
      }

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
            // Update authStore with new token
            const authStore = useAuthStore();
            authStore.isAuthenticated = true;
            authStore.updateRoles();
            return access;
          })
          .catch(async (refreshError) => {
            console.error('Token refresh failed:', refreshError.response?.data || refreshError.message);
            console.log('Logging out and redirecting due to refresh failure');
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
          console.error('Failed to retry request after refresh:', refreshError);
          return Promise.reject(refreshError);
        });
    }
    return Promise.reject(error);
  }
);

// Authentication service object
const authService = {
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

      const authStore = useAuthStore();
      authStore.updateUser(user);
      authStore.isAuthenticated = true;
      authStore.updateRoles(); // Ensure roles are updated after login

      return { access, refresh, user };
    } catch (error) {
      console.error('Login failed:', error.response?.data || error.message);
      if (error.response?.status === 401 && error.response?.data?.detail) {
        throw error.response.data;
      }
      throw error.response?.data || { message: 'Login failed' };
    }
  },

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
      console.log('Token refreshed successfully:', access);

      // Update authStore state after refresh
      const authStore = useAuthStore();
      authStore.isAuthenticated = true;
      authStore.updateRoles();

      return access;
    } catch (error) {
      console.error('Token refresh failed:', error.response?.data || error.message);
      await this.logout();
      const authStore = useAuthStore();
      authStore.logout();
      await logoutAndRedirect();
      throw error.response?.data || { message: 'Token refresh failed' };
    }
  },

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
      sessionStorage.removeItem('dismissedCompanyModal');
      delete api.defaults.headers.common['Authorization'];
      console.log('Logout completed, tokens and user data cleared');
    }
  },

  getToken() {
    return localStorage.getItem(TOKEN_KEY) || sessionStorage.getItem(TOKEN_KEY);
  },

  getRefreshToken() {
    return localStorage.getItem(REFRESH_TOKEN_KEY) || sessionStorage.getItem(REFRESH_TOKEN_KEY);
  },

  getUser() {
    const userData = localStorage.getItem(USER_KEY) || sessionStorage.getItem(USER_KEY);
    return userData ? JSON.parse(userData) : null;
  },

  async isAuthenticated() {
    const token = this.getToken();
    if (!token) return false;

    try {
      await api.get('accounts/users/me/');
      return true;
    } catch (error) {
      console.warn('Token validation failed:', error.response?.data || error.message);
      return false;
    }
  },

  initializeAuth() {
    const token = this.getToken();
    if (token) {
      api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      // Restore authStore state
      const authStore = useAuthStore();
      authStore.user = this.getUser();
      authStore.isAuthenticated = !!token && !!authStore.user;
      authStore.updateRoles();
    }
  },
};

// Helper function to handle logout and redirect
async function logoutAndRedirect() {
  if (isRedirecting) return;
  isRedirecting = true;

  const authStore = useAuthStore();
  await authService.logout();
  authStore.logout();

  setTimeout(() => {
    window.location.href = '/auth/sign-in';
    isRedirecting = false;
  }, 2000);
}

export default authService;