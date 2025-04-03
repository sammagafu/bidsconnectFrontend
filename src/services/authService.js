import axios from 'axios';

const API_URL = 'http://localhost:8000/api/v1/';
const TOKEN_KEY = 'auth_token';
const REFRESH_TOKEN_KEY = 'refresh_token';
const USER_KEY = 'user_data';

export const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  }
});

// Add request interceptor for debugging
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

// Add response interceptor for handling 401 errors and debugging
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
      try {
        const refreshToken = localStorage.getItem(REFRESH_TOKEN_KEY) || sessionStorage.getItem(REFRESH_TOKEN_KEY);
        if (refreshToken) {
          console.log('Attempting to refresh token with:', refreshToken);
          const response = await api.post('accounts/jwt/refresh/', { refresh: refreshToken });
          const { access } = response.data;

          const storage = localStorage.getItem(TOKEN_KEY) ? localStorage : sessionStorage;
          storage.setItem(TOKEN_KEY, access);

          api.defaults.headers.common['Authorization'] = `Bearer ${access}`;
          originalRequest.headers['Authorization'] = `Bearer ${access}`;

          console.log('Retrying original request with new token:', access);
          return api(originalRequest);
        }
      } catch (refreshError) {
        console.error('Token refresh failed:', refreshError);
        await authService.logout(); // Fixed reference from this.logout() to authService.logout()
      }
    }
    return Promise.reject(error);
  }
);

const authService = {
  async login(credentials, rememberMe) {
    try {
      console.log('Attempting login with:', credentials);
      console.log('Before sending request...');
      const tokenResponse = await api.post('accounts/jwt/create/', credentials);
      console.log('After sending request...');
      const { access, refresh } = tokenResponse.data;

      // Set the Authorization header
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
      throw error.response?.data || { message: 'Token refresh failed' };
    }
  },

  async logout() {
    try {
      console.log('Logging out...');
      // Optionally call a logout endpoint if Djoser is configured to have one
      // await api.post('accounts/jwt/logout/');
    } catch (error) {
      console.error('Logout failed:', error);
    } finally {
      // Clear tokens and user data from storage
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

  isAuthenticated() {
    return !!this.getToken();
  },

  initializeAuth() {
    const token = this.getToken();
    if (token) {
      api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    }
  }
};

export default authService;