import { createRouter, createWebHistory } from 'vue-router';
import { allRoutes } from './routes';
import { useAuthStore } from '@/stores/auth';

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: allRoutes
});

router.beforeEach(async (to, from, next) => {
  const title = to.meta.title;
  if (title) document.title = title.toString();

  const authStore = useAuthStore();
  await authStore.initialize();

  const authRequired = to.matched.some(route => route.meta.authRequired);
  const requiresAdmin = to.matched.some(route => route.meta.requiresAdmin);
  const requiresStaff = to.matched.some(route => route.meta.requiresStaff);
  const requiresCompanyOwner = to.matched.some(route => route.meta.requiresCompanyOwner);
  const allowedRoles = to.meta.allowedRoles;

  // Authenticated user trying to access login → redirect to dashboard
  if (to.name === 'auth.sign-in' && authStore.isAuthenticated) {
    return next({ path: '/' });
  }

  // Public route → allow
  if (!authRequired) {
    return next();
  }

  // Authentication check
  if (!authStore.isAuthenticated) {
    return next({
      name: 'auth.sign-in',
      query: { redirectedFrom: to.fullPath }
    });
  }

  // Role-based access control
  if (requiresAdmin && !authStore.isSuperAdmin && !authStore.isStaffUser) {
    return next({ path: '/', replace: true });
  }

  if (requiresStaff && !authStore.isStaffUser && !authStore.isSuperAdmin) {
    return next({ path: '/', replace: true });
  }

  if (requiresCompanyOwner && !authStore.isCompanyOwner && !authStore.isSuperAdmin) {
    return next({ path: '/', replace: true });
  }

  // Check specific allowed roles if defined
  if (allowedRoles && allowedRoles.length > 0) {
    const hasRole = allowedRoles.some(role => {
      switch (role) {
        case 'superadmin': return authStore.isSuperAdmin;
        case 'staff': return authStore.isStaffUser;
        case 'company_owner': return authStore.isCompanyOwner;
        case 'company_admin': return authStore.isCompanyAdmin;
        case 'company_member': return authStore.isCompanyMember;
        default: return false;
      }
    });

    if (!hasRole) {
      return next({ path: '/', replace: true });
    }
  }

  // All checks passed → proceed
  next();
});

export default router;