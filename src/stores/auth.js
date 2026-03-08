import { defineStore } from 'pinia';
import authService from '@/services/authService';
import { useRouter } from 'vue-router';

const TOKEN_REFRESH_INTERVAL = 15 * 60 * 1000;

export const useAuthStore = defineStore('auth', {
  state: () => {
    const user = authService.getUser();
    const token = authService.getToken();
    const companies = user?.companies || [];

    const isSuperAdmin = user?.is_superuser === true;
    const isStaffUser = user?.is_staff === true;
    const isCompanyOwner = (companies || []).some(c =>
      (c.company_users || []).some(cu => (cu.user?.id === user?.id) && cu.role === 'owner')
    );
    const isCompanyAdmin = (companies || []).some(c =>
      (c.company_users || []).some(cu => (cu.user?.id === user?.id) && cu.role === 'admin')
    );
    const isCompanyMember = (companies || []).length > 0;
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
      refreshIntervalId: null,
    };
  },

  actions: {
    async login(credentials, rememberMe) {
      this.loading = true;
      try {
        const data = await authService.login(credentials, rememberMe);
        this.user = data.user || null;
        this.token = data.access || null;
        this.companies = data.user?.companies || [];
        this.updateRoles();
        this.setAsCompanyOwnerIfEligible();
        this.isAuthenticated = !!this.token && !!this.user;
        this.startTokenRefresh();
        return data;
      } catch (error) {
        throw error;
      } finally {
        this.loading = false;
      }
    },

    async register(credentials) {
      this.loading = true;
      try {
        const response = await authService.register(credentials);
        this.user = response.user || null;
        this.token = response.access || null;
        this.companies = response.user?.companies || [];
        this.updateRoles();
        this.setAsCompanyOwnerIfEligible();
        this.isAuthenticated = !!this.token && !!this.user;
        this.startTokenRefresh();
        return response;
      } catch (error) {
        throw error;
      } finally {
        this.loading = false;
      }
    },

    async logout() {
      this.loading = true;
      try {
        // Clear token refresh interval to prevent memory leak
        if (this.refreshIntervalId) {
          clearInterval(this.refreshIntervalId);
          this.refreshIntervalId = null;
        }
        
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
      } catch (error) {
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
        this.user = user || null;
        this.token = authService.getToken() || null;
        this.companies = user?.companies || [];
        this.isAuthenticated = await authService.isAuthenticated();
        this.updateRoles();
        this.setAsCompanyOwnerIfEligible();
        if (this.isAuthenticated) {
          this.startTokenRefresh();
        }
      } catch (error) {
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
      if (!user) {
        return;
      }
      if (JSON.stringify(this.user) !== JSON.stringify(user)) {
        this.user = user;
        this.token = authService.getToken();
        this.companies = user.companies || [];
        this.updateRoles();
        this.setAsCompanyOwnerIfEligible();
        const storage = localStorage.getItem('auth_token') ? localStorage : sessionStorage;
        storage.setItem('user_data', JSON.stringify(user));
      }
    },

    updateRoles() {
      this.isSuperAdmin = this.user?.is_superuser === true;
      this.isStaffUser = this.user?.is_staff === true;
      this.isCompanyOwner = (this.companies ?? []).some(c =>
        (c.company_users ?? []).some(cu => cu.user?.id === this.user?.id && cu.role === 'owner')
      );
      this.isCompanyAdmin = (this.companies ?? []).some(c =>
        (c.company_users ?? []).some(cu => cu.user?.id === this.user?.id && cu.role === 'admin')
      );
      this.isCompanyMember = (this.companies ?? []).length > 0;
      this.isNormalUser = this.isCompanyMember && !this.isCompanyOwner && !this.isCompanyAdmin;
    },

    setAsCompanyOwnerIfEligible() {
      if (
        this.isAuthenticated &&
        this.user?.is_active &&
        this.companies?.length > 0 &&
        !this.isSuperAdmin &&
        !this.isStaffUser &&
        !this.isCompanyOwner
      ) {
        const firstCompany = this.companies[0];
        const companyUser = firstCompany.company_users?.find(
          cu => cu.user?.id === this.user?.id
        );
        if (companyUser) {
          companyUser.role = 'owner';
          this.isCompanyOwner = true;
          this.isCompanyAdmin = true;
          this.isNormalUser = false;
          this.updateRoles();
        }
      }
    },

    async refreshUser() {
      if (!this.token) return;
      try {
        const userRes = await authService.getUserFromApi();
        if (userRes) {
          this.updateUser(userRes);
        }
      } catch {
        // ignore
      }
    },

    hasCompanies() {
      return (this.companies ?? []).length > 0;
    },

    shouldShowCompanyModal() {
      return this.isAuthenticated && !this.isSuperAdmin && !this.hasCompanies();
    },

    startTokenRefresh() {
      // Clear any existing interval to prevent multiple intervals
      if (this.refreshIntervalId) {
        clearInterval(this.refreshIntervalId);
      }
      
      this.refreshIntervalId = setInterval(async () => {
        if (this.isAuthenticated) {
          try {
            await authService.refreshToken();
          } catch (error) {
            await this.logout();
          }
        }
      }, TOKEN_REFRESH_INTERVAL);
    },

    ensureAuthenticated() {
      if (!this.isAuthenticated) {
        const router = useRouter();
        router.push('/login');
      }
    },
  },
});