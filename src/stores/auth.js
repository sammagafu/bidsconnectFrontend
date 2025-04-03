import { defineStore } from 'pinia';
import authService from '@/services/authService';

export const useAuthStore = defineStore('auth', {
  state: () => ({
    user: authService.getUser(),
    isAuthenticated: authService.isAuthenticated(),
  }),

  actions: {
    async login(credentials, rememberMe) {
      try {
        const data = await authService.login(credentials, rememberMe);
        this.user = data.user;
        this.isAuthenticated = true;
        console.log('Auth state updated:', { 
          user: this.user, 
          isAuthenticated: this.isAuthenticated 
        });
        return data;
      } catch (error) {
        console.error('Login failed in store:', error);
        throw error;
      }
    },
    
    async register(credentials) {
      try {
        const response = await api.post('accounts/users/', {
          email: credentials.email,
          phone_number: credentials.phone_number,
          password: credentials.password
        });
        
        // Auto-login after registration
        const loginResponse = await api.login({
          email: credentials.email,
          password: credentials.password
        }, true);
        
        this.user = loginResponse.user;
        this.isAuthenticated = true;
        return loginResponse;
      } catch (error) {
        throw error.response?.data || { message: 'Registration failed' };
      }
    },

    async logout() {
      await authService.logout();
      this.user = null;
      this.isAuthenticated = false;
      console.log('Logged out, auth state updated:', { 
        user: this.user, 
        isAuthenticated: this.isAuthenticated 
      });
    },

    initialize() {
      authService.initializeAuth();
      this.user = authService.getUser();
      this.isAuthenticated = authService.isAuthenticated();
      console.log('Auth state initialized:', { 
        user: this.user, 
        isAuthenticated: this.isAuthenticated,
        isAdmin: this.isAdmin(),
        isStaff: this.isStaff(),
        isNormalUser: this.isNormalUser()
      });
    },

    updateUser(user) {
      this.user = user;
      const storage = localStorage.getItem('auth_token') ? localStorage : sessionStorage;
      storage.setItem('user_data', JSON.stringify(user));
      console.log('User updated:', this.user);
    },

    // Role check methods aligned with CustomUserDetailSerializer
    isAdmin() {
      return this.isAuthenticated && this.user?.is_superuser === true;
    },

    isStaff() {
      return this.isAuthenticated && this.user?.is_staff === true && !this.user?.is_superuser;
    },

    isNormalUser() {
      return this.isAuthenticated && !this.user?.is_superuser && !this.user?.is_staff;
    }
  }
});