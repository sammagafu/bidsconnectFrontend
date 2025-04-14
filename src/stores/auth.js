import { defineStore } from 'pinia';
import authService from '@/services/authService';

export const useAuthStore = defineStore('auth', {
  state: () => {
    // Initialize state from storage
    const user = authService.getUser();
    const token = authService.getToken();
    return {
      user: user,
      isAuthenticated: !!token && !!user, // Set based on token and user presence
      isAdmin: false,
      isStaff: false,
      isNormalUser: false,
    };
  },

  actions: {
    async login(credentials, rememberMe) {
      try {
        const data = await authService.login(credentials, rememberMe);
        this.user = data.user;
        this.isAuthenticated = true;
        this.updateRoles();
        console.log('Auth state updated:', {
          user: this.user,
          isAuthenticated: this.isAuthenticated,
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
          first_name: credentials.first_name,
          last_name: credentials.last_name,
          email: credentials.email,
          phone_number: credentials.phone_number,
          password: credentials.password,
        });

        const loginResponse = await authService.login(
          {
            email: credentials.email,
            password: credentials.password,
          },
          true
        );

        this.user = loginResponse.user;
        this.isAuthenticated = true;
        this.updateRoles();
        return loginResponse;
      } catch (error) {
        throw error.response?.data || { message: 'Registration failed' };
      }
    },

    async logout() {
      await authService.logout();
      this.user = null;
      this.isAuthenticated = false;
      this.isAdmin = false;
      this.isStaff = false;
      this.isNormalUser = false;
      console.log('Logged out, auth state updated:', {
        user: this.user,
        isAuthenticated: this.isAuthenticated,
      });
    },

    async initialize() {
      try {
        authService.initializeAuth();
        this.user = authService.getUser();
        this.isAuthenticated = await authService.isAuthenticated();
        this.updateRoles();
        console.log('Auth state initialized:', {
          user: this.user,
          isAuthenticated: this.isAuthenticated,
          isAdmin: this.isAdmin,
          isStaff: this.isStaff,
          isNormalUser: this.isNormalUser,
        });
      } catch (error) {
        console.error('Failed to initialize auth state:', error);
        this.user = null;
        this.isAuthenticated = false;
        this.isAdmin = false;
        this.isStaff = false;
        this.isNormalUser = false;
        // Optionally clear storage and redirect to login
        await authService.logout();
      }
    },

    updateUser(user) {
      this.user = user;
      const storage = localStorage.getItem('auth_token') ? localStorage : sessionStorage;
      storage.setItem('user_data', JSON.stringify(user));
      this.updateRoles();
      console.log('User updated:', this.user);
    },

    updateRoles() {
      this.isAdmin = this.isAuthenticated && this.user?.is_superuser === true;
      this.isStaff = this.isAuthenticated && this.user?.is_staff === true && !this.user?.is_superuser;
      this.isNormalUser = this.isAuthenticated && !this.user?.is_superuser && !this.user?.is_staff;
    },

    hasCompanies() {
      return this.user && this.user.companies && this.user.companies.length > 0;
    },

    shouldShowCompanyModal() {
      return this.isAuthenticated && this.isNormalUser && !this.hasCompanies();
    },
  },
});