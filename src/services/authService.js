/* services/authService.js */
import axios from 'axios';
import { useAuthStore } from '@/stores/auth';

// Base URL: e.g. http://localhost:8000/api/v1/ or https://bidsconnect.co.tz/api/v1/
const API_URL = import.meta.env.VITE_API_URL || 'https://bidsconnect.co.tz/api/v1/';

export const api = axios.create({
  baseURL: API_URL,
  headers: { 'Content-Type': 'application/json' },
  withCredentials: true, // CORS: send cookies if backend uses them (per API doc)
});

const TOKEN_KEY = 'auth_token';
const REFRESH_TOKEN_KEY = 'refresh_token';
const USER_KEY = 'user_data';

// Request: attach token from storage; for FormData do NOT set Content-Type (browser sets boundary)
api.interceptors.request.use(config => {
  const token = localStorage.getItem(TOKEN_KEY) || sessionStorage.getItem(TOKEN_KEY);
  if (token) config.headers.Authorization = `Bearer ${token}`;
  if (config.data instanceof FormData) {
    delete config.headers['Content-Type'];
  }
  return config;
});

// 401: try refresh token, then retry request; otherwise logout
api.interceptors.response.use(
  response => response,
  async error => {
    const originalRequest = error.config;
    const status = error.response?.status;

    if (status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      const refresh = localStorage.getItem(REFRESH_TOKEN_KEY) || sessionStorage.getItem(REFRESH_TOKEN_KEY);
      if (refresh) {
        try {
          const { data } = await axios.post(
            `${API_URL.replace(/\/$/, '')}/accounts/jwt/refresh/`,
            { refresh },
            { headers: { 'Content-Type': 'application/json' }, withCredentials: true }
          );
          const access = data.access;
          const storage = localStorage.getItem(REFRESH_TOKEN_KEY) ? localStorage : sessionStorage;
          storage.setItem(TOKEN_KEY, access);
          api.defaults.headers.common['Authorization'] = `Bearer ${access}`;
          originalRequest.headers['Authorization'] = `Bearer ${access}`;
          return api(originalRequest);
        } catch (refreshErr) {
          // Refresh failed → logout
        }
      }

      const authStore = useAuthStore();
      await authStore.logout();
    }

    return Promise.reject(error);
  }
);

async function logoutAndRedirect() {
  const authStore = useAuthStore();
  await authStore.logout();
}

const authService = {
  async login(credentials, rememberMe = false) {
    const tokenRes = await api.post('accounts/jwt/create/', credentials);
    const { access, refresh } = tokenRes.data;

    const storage = rememberMe ? localStorage : sessionStorage;
    storage.setItem(TOKEN_KEY, access);
    storage.setItem(REFRESH_TOKEN_KEY, refresh);

    api.defaults.headers.common['Authorization'] = `Bearer ${access}`;

    const userRes = await api.get('accounts/users/me/');
    const user = userRes.data;
    storage.setItem(USER_KEY, JSON.stringify(user));

    const authStore = useAuthStore();
    authStore.updateUser(user);

    return { access, refresh, user };
  },

  // POST /api/v1/accounts/users/ — email, password, phone_number required; first_name, last_name, invitation_token optional
  async register(credentials) {
    const payload = {
      email: credentials.email,
      password: credentials.password,
      phone_number: credentials.phone_number || '',
      first_name: credentials.first_name ?? '',
      last_name: credentials.last_name ?? '',
      invitation_token: credentials.invitation_token ?? ''
    };
    await api.post('accounts/users/', payload);
    return this.login({ email: credentials.email, password: credentials.password }, true);
  },

  async logout() {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(REFRESH_TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
    sessionStorage.removeItem(TOKEN_KEY);
    sessionStorage.removeItem(REFRESH_TOKEN_KEY);
    sessionStorage.removeItem(USER_KEY);
    delete api.defaults.headers.common['Authorization'];

    const authStore = useAuthStore();
    await authStore.logout();
  },

  getToken() {
    return localStorage.getItem(TOKEN_KEY) || sessionStorage.getItem(TOKEN_KEY);
  },

  getUser() {
    const data = localStorage.getItem(USER_KEY) || sessionStorage.getItem(USER_KEY);
    if (!data) return null;
    try {
      return JSON.parse(data);
    } catch (error) {
      // Failed to parse user data, return null
      return null;
    }
  },

  async refreshToken() {
    const refresh = localStorage.getItem(REFRESH_TOKEN_KEY) || sessionStorage.getItem(REFRESH_TOKEN_KEY);
    if (!refresh) {
      throw new Error('No refresh token available');
    }

    try {
      const response = await api.post('accounts/jwt/refresh/', { refresh });
      const { access } = response.data;

      const storage = localStorage.getItem(REFRESH_TOKEN_KEY) ? localStorage : sessionStorage;
      storage.setItem(TOKEN_KEY, access);
      api.defaults.headers.common['Authorization'] = `Bearer ${access}`;

      return access;
    } catch (error) {
      // If refresh fails, logout user
      await this.logout();
      throw error;
    }
  },

  async isAuthenticated() {
    const token = this.getToken();
    if (!token) return false;
    try {
      await api.get('accounts/users/me/');
      return true;
    } catch {
      return false;
    }
  },

  initializeAuth() {
    const token = this.getToken();
    if (token) {
      api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      const user = this.getUser();
      if (user) {
        const authStore = useAuthStore();
        authStore.updateUser(user);
      }
    }
  },
};

export default authService;