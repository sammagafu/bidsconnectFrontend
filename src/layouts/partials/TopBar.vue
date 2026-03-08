<template>
  <header class="topbar">
    <b-container fluid>
      <div class="navbar-header">
        <div class="d-flex align-items-center gap-2">
          <!-- Menu Toggle Button -->
          <div class="topbar-item">
            <button type="button" class="button-toggle-menu topbar-button">
              <Icon icon="solar:hamburger-menu-broken" class="fs-24 align-middle" @click="toggleLeftSideBar" />
            </button>
          </div>

          <!-- App Search-->
          <form class="app-search d-none d-md-block me-auto">
            <div class="position-relative">
              <input type="search" class="form-control" placeholder="Search..." autocomplete="off" value="">
              <Icon icon="solar:magnifer-broken" class="search-widget-icon" />
            </div>
          </form>
        </div>

        <div class="d-flex align-items-center gap-1">
          <!-- Theme Color (Light / Lighter / Dark) -->
          <div class="topbar-item" :title="`Theme: ${layout.theme} (click to cycle)`">
            <button type="button" class="topbar-button" id="light-dark-mode" @click="toggleTheme">
              <Icon icon="solar:moon-broken" class="fs-24 align-middle light-mode" />
              <Icon icon="solar:sun-broken" class="fs-24 align-middle dark-mode" />
            </button>
          </div>

          <!-- Category -->
          <div class="dropdown topbar-item d-none d-lg-flex">
            <button type="button" class="topbar-button" data-toggle="fullscreen" @click="toggleFullScreen">
              <Icon icon="solar:full-screen-broken" class="fs-24 align-middle fullscreen" />
              <Icon icon="solar:quit-full-screen-broken" class="fs-24 align-middle quit-fullscreen" />
            </button>
          </div>

          <!-- Notification -->
          <DropDown class="topbar-item" :title="`${unreadCount} unread`">
            <button type="button" class="topbar-button position-relative" id="page-header-notifications-dropdown"
              data-bs-toggle="dropdown" aria-haspopup="true" aria-expanded="false" @click="fetchNotifications">
              <Icon icon="solar:bell-bing-broken" class="fs-24 align-middle" />
              <span v-if="unreadCount > 0" class="position-absolute topbar-badge fs-10 translate-middle badge bg-danger rounded-pill">{{ unreadCount }}<span class="visually-hidden">unread messages</span></span>
            </button>
            <div class="dropdown-menu py-0 dropdown-lg dropdown-menu-end"
              aria-labelledby="page-header-notifications-dropdown">
              <div class="p-3 border-top-0 border-start-0 border-end-0 border-dashed border">
                <b-row class="align-items-center">
                  <div class="col">
                    <h6 class="m-0 fs-16 fw-semibold"> Notifications</h6>
                  </div>
                  <div class="col-auto">
                    <a v-if="unreadCount > 0" href="javascript:void(0);" class="text-body text-decoration-underline" @click.prevent="markAllAsRead">
                      <small>Clear All</small>
                    </a>
                  </div>
                </b-row>
              </div>
              <simplebar data-simplebar style="max-height: 280px;">
                <a v-for="(item, idx) in notifications" :key="item.id || idx" href="javascript:void(0);"
                  class="dropdown-item py-3 border-bottom text-wrap" :class="{ 'bg-light': !item.is_read }"
                  @click="handleNotificationClick(item)">
                  <div class="d-flex">
                    <div class="flex-shrink-0">
                      <div v-if="item.icon" class="avatar-sm me-2">
                        <span class="avatar-title bg-soft-warning text-warning fs-20 rounded-circle">
                          <Icon :icon="item.icon" />
                        </span>
                      </div>
                      <div v-else class="avatar-sm me-2">
                        <span class="avatar-title bg-soft-info text-info fs-20 rounded-circle">
                          {{ (item.title || item.content || 'N').slice(0, 1) }}
                        </span>
                      </div>
                    </div>
                    <div class="flex-grow-1">
                      <p v-if="item.title" class="mb-0 fw-semibold text-wrap">{{ item.title }}</p>
                      <p v-if="item.content" class="mb-0 text-wrap">{{ item.content }}</p>
                      <p v-if="item.message" class="mb-0 text-wrap">{{ item.message }}</p>
                      <small v-if="item.created_at" class="text-muted">{{ formatDate(item.created_at) }}</small>
                    </div>
                  </div>
                </a>
                <div v-if="notificationsLoading" class="text-center py-3">
                  <span class="spinner-border spinner-border-sm"></span>
                </div>
                <div v-else-if="!notifications.length" class="text-center py-4 text-muted">
                  No notifications
                </div>
              </simplebar>
            </div>
          </DropDown>

          <!-- Theme Setting -->
          <div class="topbar-item d-none d-md-flex">
            <button type="button" class="topbar-button" id="theme-settings-btn" v-b-toggle="'theme-settings'">
              <Icon icon="solar:settings-broken" class="fs-24 align-middle" />
            </button>
          </div>

          <!-- User -->
          <DropDown class="topbar-item">
            <a type="button" class="topbar-button" id="page-header-user-dropdown" data-bs-toggle="dropdown"
              aria-haspopup="true" aria-expanded="false">
              <span class="d-flex align-items-center">
                <img class="rounded-circle" width="32" :src="avatar1" alt="avatar-1">
              </span>
            </a>
            <div class="dropdown-menu dropdown-menu-end">
              <h6 class="dropdown-header">Welcome {{ authStore.user?.email || 'User' }}!</h6>

              <router-link class="dropdown-item" :to="{ name: item.route?.name }"
                v-for="(item, idx) in profileMenuItems" :key="idx">
                <i :class="`bx ${item.icon} text-muted fs-18 align-middle me-1`"></i><span class="align-middle">{{
                  item.label }}</span>
              </router-link>

              <div class="dropdown-divider my-1"></div>

              <a class="dropdown-item text-danger" href="javascript:void(0);" @click="handleLogout">
                <i class="bx bx-log-out fs-18 align-middle me-1"></i><span class="align-middle">Logout</span>
              </a>
            </div>
          </DropDown>
        </div>
      </div>
    </b-container>
  </header>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { Icon } from "@iconify/vue";
import simplebar from 'simplebar-vue';
import { useLayoutStore } from '@/stores/layout';
import { useAuthStore } from '@/stores/auth';
import { useRouter } from 'vue-router';
import { toggleDocumentAttribute } from "@/helpers";
import { profileMenuItems } from "@/layouts/partials/data";
import { notificationsService } from '@/services';
import DropDown from "@/components/DropDown.vue";
import avatar1 from "@/assets/images/users/avatar-1.jpg";

const notifications = ref([]);
const notificationsLoading = ref(false);

const unreadCount = computed(() => notifications.value.filter(n => !n.is_read).length);

function formatDate(d) {
  if (!d) return '';
  const dt = new Date(d);
  const now = new Date();
  const diff = now - dt;
  if (diff < 60000) return 'Just now';
  if (diff < 3600000) return `${Math.floor(diff / 60000)}m ago`;
  if (diff < 86400000) return `${Math.floor(diff / 3600000)}h ago`;
  return dt.toLocaleDateString();
}

async function fetchNotifications() {
  if (!authStore.isAuthenticated) return;
  notificationsLoading.value = true;
  try {
    const data = await notificationsService.list({ page_size: 20 });
    notifications.value = Array.isArray(data) ? data : (data.results || []);
  } catch {
    notifications.value = [];
  } finally {
    notificationsLoading.value = false;
  }
}

async function markAllAsRead() {
  const ids = notifications.value.filter(n => !n.is_read).map(n => n.id).filter(Boolean);
  if (!ids.length) return;
  try {
    await notificationsService.markAllAsRead(ids);
    notifications.value = notifications.value.map(n => ({ ...n, is_read: true }));
  } catch {
    // ignore
  }
}

function handleNotificationClick(item) {
  if (item.id && !item.is_read) {
    notificationsService.markAsRead(item.id).then(() => {
      item.is_read = true;
    }).catch(() => {});
  }
}

const authStore = useAuthStore();
const router = useRouter();

const toggleFullScreen = () => {
  if (!document.fullscreenElement) {
    document.documentElement.requestFullscreen();
    document.body.classList.add('fullscreen-enable');
  } else if (document.exitFullscreen) {
    document.exitFullscreen();
    document.body.classList.remove('fullscreen-enable');
  }
};

const useLayout = useLayoutStore();
const { layout } = useLayout;

const toggleTheme = () => {
  const themes = ['light', 'lighter', 'dark'];
  const idx = themes.indexOf(useLayout.layout.theme);
  const next = themes[(idx + 1) % themes.length];
  useLayout.setTheme(next);
};

const toggleLeftSideBar = () => {
  if (useLayout.layout.leftSideBarSize === 'default') {
    return useLayout.setLeftSideBarSize('condensed');
  }
  if (useLayout.layout.leftSideBarSize === 'condensed') {
    return useLayout.setLeftSideBarSize('default');
  }
  toggleDocumentAttribute('class', 'sidebar-enable');
  showBackdrop();
};

const showBackdrop = () => {
  let backdrop = document.createElement('div');
  if (backdrop) {
    backdrop.classList.add('offcanvas-backdrop', 'fade', 'show');
    document.body.appendChild(backdrop);
    document.body.style.overflow = 'hidden';
    if (window.innerWidth > 1040) {
      document.body.style.paddingRight = '15px';
    }

    backdrop.addEventListener('click', function (e) {
      toggleDocumentAttribute('class', '');
      document.body.removeChild(backdrop);
      document.body.style.overflow = '';
      document.body.style.paddingRight = '';
    });
  }
};

const handleLogout = async () => {
  try {
    await authStore.logout();
    console.log('Logout successful, redirecting to login');
    await router.push({ name: 'auth.sign-in' });
  } catch (error) {
    console.error('Logout failed:', error);
  }
};

onMounted(() => {
  useLayout.init();
});
</script>