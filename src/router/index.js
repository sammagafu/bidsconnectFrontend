import { createRouter, createWebHistory } from 'vue-router';
import { allRoutes } from './routes';
import { useAuthStore } from '@/stores/auth';

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: allRoutes
});

router.beforeEach((to, from, next) => {
  // Set document title if defined in route meta
  const title = to.meta.title;
  if (title) {
    document.title = title.toString();
  }

  // Initialize auth store
  const authStore = useAuthStore();
  authStore.initialize();
  console.log('Navigating to:', to.path);
  console.log('Is Authenticated:', authStore.isAuthenticated);

  // Check if auth is required on this route (including nested routes)
  const authRequired = to.matched.some(route => route.meta.authRequired);

  // If the user is already on the login page, prevent redirect loop
  if (to.name === 'auth.sign-in') {
    if (authStore.isAuthenticated) {
      console.log('User is authenticated, redirecting to dashboards.index');
      return next({ name: 'dashboards.index' });
    }
    return next();
  }

  // If auth isn't required for the route, proceed
  if (!authRequired) {
    return next();
  }

  // If auth is required and the user is logged in, proceed
  if (authStore.isAuthenticated) {
    console.log('User is authenticated, proceeding to route');
    return next();
  }

  // If auth is required and the user is not logged in, redirect to login
  console.log('User is not authenticated, redirecting to login');
  next({ name: 'auth.sign-in', query: { redirectedFrom: to.fullPath } });
});

export default router;