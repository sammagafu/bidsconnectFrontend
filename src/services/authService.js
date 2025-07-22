/* services/authService.js */
import axios from 'axios';
import router from '@/router';
import { useAuthStore } from '@/stores/auth';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api/v1/';
const api = axios.create({
  baseURL: API_URL,
  headers: { 'Content-Type': 'application/json' },
});

const TOKEN_KEY = 'auth_token';
const REFRESH_TOKEN_KEY = 'refresh_token';
const USER_KEY = 'user_data';
let isRefreshing = false;
let refreshPromise = null;
let refreshSubscribers = [];

function subscribeTokenRefresh(cb) {
  refreshSubscribers.push(cb);
}

function onRefreshed(token) {
  refreshSubscribers.forEach(cb => cb(token));
  refreshSubscribers = [];
}

api.interceptors.response.use(
  response => response,
  error => {
    const { config, response } = error;
    if (response?.status === 401 && !config._retry) {
      config._retry = true;
      if (config.url.includes('jwt/create')) {
        return Promise.reject(error);
      }
      if (!isRefreshing) {
        isRefreshing = true;
        const rt = localStorage.getItem(REFRESH_TOKEN_KEY) || sessionStorage.getItem(REFRESH_TOKEN_KEY);
        refreshPromise = api.post('accounts/jwt/refresh/', { refresh: rt })
          .then(res => {
            const access = res.data.access;
            const storage = localStorage.getItem(TOKEN_KEY) ? localStorage : sessionStorage;
            storage.setItem(TOKEN_KEY, access);
            api.defaults.headers.common['Authorization'] = `Bearer ${access}`;
            onRefreshed(access);
            return access;
          })
          .catch(err => {
            logoutAndRedirect();
            throw err;
          })
          .finally(() => { isRefreshing = false; });
      }
      return new Promise(resolve => {
        subscribeTokenRefresh(token => {
          config.headers['Authorization'] = `Bearer ${token}`;
          resolve(api(config));
        });
      });
    }
    return Promise.reject(error);
  }
);

const authService = {
  async login(credentials, rememberMe) {
    const tokenRes = await api.post('accounts/jwt/create/', credentials);
    const { access, refresh } = tokenRes.data;
    api.defaults.headers.common['Authorization'] = `Bearer ${access}`;
    const userRes = await api.get('accounts/users/me/');
    const user = userRes.data;
    const storage = rememberMe ? localStorage : sessionStorage;
    storage.setItem(TOKEN_KEY, access);
    storage.setItem(REFRESH_TOKEN_KEY, refresh);
    storage.setItem(USER_KEY, JSON.stringify(user));
    const authStore = useAuthStore();
    authStore.updateUser(user);
    authStore.isAuthenticated = true;
    authStore.updateRoles();
    return { access, refresh, user };
  },

  async register(credentials) {
    const res = await api.post('accounts/auth/register/', credentials);
    return this.login({ email: credentials.email, password: credentials.password }, true);
  },

  async refreshToken() {
    if (!isRefreshing) {
      isRefreshing = true;
      const rt = localStorage.getItem(REFRESH_TOKEN_KEY) || sessionStorage.getItem(REFRESH_TOKEN_KEY);
      refreshPromise = api.post('accounts/jwt/refresh/', { refresh: rt })
        .then(res => {
          const access = res.data.access;
          const storage = localStorage.getItem(TOKEN_KEY) ? localStorage : sessionStorage;
          storage.setItem(TOKEN_KEY, access);
          api.defaults.headers.common['Authorization'] = `Bearer ${access}`;
          onRefreshed(access);
          return access;
        })
        .catch(err => {
          logoutAndRedirect();
          throw err;
        })
        .finally(() => { isRefreshing = false; });
    }
    return refreshPromise;
  },

  async logout() {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(REFRESH_TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
    sessionStorage.removeItem(TOKEN_KEY);
    sessionStorage.removeItem(REFRESH_TOKEN_KEY);
    sessionStorage.removeItem(USER_KEY);
    delete api.defaults.headers.common['Authorization'];
    router.push({name: 'auth.sign-in'});
  },

  getToken() {
    return localStorage.getItem(TOKEN_KEY) || sessionStorage.getItem(TOKEN_KEY);
  },

  getUser() {
    const data = localStorage.getItem(USER_KEY) || sessionStorage.getItem(USER_KEY);
    return data ? JSON.parse(data) : null;
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
      const authStore = useAuthStore();
      authStore.user = this.getUser();
      authStore.isAuthenticated = true;
      authStore.updateRoles();
    }
  },
};

async function logoutAndRedirect() {
  if (router.currentRoute.value.path !== '/login') {
    await authService.logout();
    toast.add({ severity: 'info', summary: 'Session Expired', detail: 'Please log in again', life: 3000 });
    router.push('/login');
  }
}

export { api };
export default authService;
