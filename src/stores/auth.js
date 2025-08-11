import { defineStore } from 'pinia';
import authService from '@/services/authService';
import { useRouter } from 'vue-router';
// Removed useToast from store due to inject() context issues

// Token refresh interval (e.g., every 15 minutes)
const TOKEN_REFRESH_INTERVAL = 15 * 60 * 1000;

export const useAuthStore = defineStore('auth', {
  state: () => {
    const user = authService.getUser();
    const token = authService.getToken();
    const companies = user?.companies || [];

    // Determine initial role flags
    const isSuperAdmin = user?.is_superuser === true;
    const isStaffUser = user?.is_staff === true;
    const isCompanyOwner = companies.some(c =>
      c.company_users.some(cu => cu.user.id === user.id && cu.role === 'owner')
    );
    const isCompanyAdmin = companies.some(c =>
      c.company_users.some(cu => cu.user.id === user.id && cu.role === 'admin')
    );
    const isCompanyMember = companies.length > 0;
    const isNormalUser = isCompanyMember && !isCompanyOwner && !isCompanyAdmin;

    return {
      user,
      token,
      companies,
      isAuthenticated: !!token && !!user,
      isSuperAdmin,
      isStaffUser,
      isCompanyOwner,
      isCompanyAdmin,
      isCompanyMember,
      isNormalUser,
      loading: false,
    };
  },

  actions: {
    async login(credentials, rememberMe) {
      this.loading = true;
      try {
        const data = await authService.login(credentials, rememberMe);
        this.user = data.user;
        this.token = data.access;
        this.companies = data.user.companies || [];
        this.updateRoles();  // renamed
        this.isAuthenticated = true;
        this.startTokenRefresh();
        return data;
      } catch (error) {
        console.error('Login failed:', error);
        // Error handling here; consider handling toast in component
        throw error;
      } finally {
        this.loading = false;
      }
    },

    async register(credentials) {
      this.loading = true;
      try {
        const response = await authService.register(credentials);
        this.user = response.user;
        this.token = response.access;
        this.companies = response.user.companies || [];
        this.updateRoles();  // renamed
        this.isAuthenticated = true;
        this.startTokenRefresh();
        return response;
      } catch (error) {
        console.error('Registration failed:', error);
        throw error;
      } finally {
        this.loading = false;
      }
    },

    async logout() {
      this.loading = true;
      try {
        await authService.logout();
        this.user = null;
        this.token = null;
        this.companies = [];
        this.isAuthenticated = false;
        this.isSuperAdmin = false;
        this.isStaffUser = false;
        this.isCompanyOwner = false;
        this.isCompanyAdmin = false;
        this.isCompanyMember = false;
        this.isNormalUser = false;
        localStorage.clear();
        sessionStorage.clear();
        const router = useRouter();
        router.push('/login');
      } catch (error) {
        console.error('Logout failed:', error);
        throw error;
      } finally {
        this.loading = false;
      }
    },

    async initialize() {
      this.loading = true;
      try {
        authService.initializeAuth();
        const user = authService.getUser();
        this.user = user;
        this.token = authService.getToken();
        this.companies = user?.companies || [];
        this.isAuthenticated = await authService.isAuthenticated();
        this.updateRoles();  // renamed
        if (this.isAuthenticated) {
          this.startTokenRefresh();
        }
      } catch (error) {
        console.error('Initialization failed:', error);
        this.user = null;
        this.token = null;
        this.companies = [];
        this.isAuthenticated = false;
        this.isSuperAdmin = false;
        this.isStaffUser = false;
        this.isCompanyOwner = false;
        this.isCompanyAdmin = false;
        this.isCompanyMember = false;
        this.isNormalUser = false;
        await authService.logout();
      } finally {
        this.loading = false;
      }
    },

updateUser(user) {
  if (JSON.stringify(this.user) !== JSON.stringify(user)) {
    this.user = user;
    this.token = authService.getToken();
    this.companies = user.companies || [];
    this.updateRoles();
    const storage = localStorage.getItem('auth_token') ? localStorage : sessionStorage;
    storage.setItem('user_data', JSON.stringify(user));
  }
},

    updateRoles() {  // renamed from _updateRoles
      this.isSuperAdmin = this.user?.is_superuser === true;
      this.isStaffUser = this.user?.is_staff === true;
      this.isCompanyOwner = this.companies.some(c =>
        c.company_users.some(cu => cu.user.id === this.user.id && cu.role === 'owner')
      );
      this.isCompanyAdmin = this.companies.some(c =>
        c.company_users.some(cu => cu.user.id === this.user.id && cu.role === 'admin')
      );
      this.isCompanyMember = this.companies.length > 0;
      this.isNormalUser = this.isCompanyMember && !this.isCompanyOwner && !this.isCompanyAdmin;
    },

    hasCompanies() {
      return this.companies.length > 0;
    },

    shouldShowCompanyModal() {
      return this.isAuthenticated && !this.isCompanyAdmin && !this.hasCompanies();
    },

    startTokenRefresh() {
      setInterval(async () => {
        if (this.isAuthenticated) {
          try {
            await authService.refreshToken();
            console.log('Token refreshed successfully');
          } catch (error) {
            console.error('Token refresh failed:', error);
            this.logout();
          }
        }
      }, TOKEN_REFRESH_INTERVAL);
    },

    handleError(error, title) {
      console.error(`${title}:`, error);
    },

    ensureAuthenticated() {
      if (!this.isAuthenticated) {
        const router = useRouter();
        router.push('/login');
      }
    },
  },
});
