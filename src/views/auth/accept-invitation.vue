<template>
  <AuthLayout>
    <b-row class="justify-content-center">
        <b-col md="6" lg="5">
          <b-card class="shadow-sm">
            <template #header>
              <h4 class="mb-0">Accept Invitation</h4>
            </template>
            <div v-if="loading" class="text-center py-5">
              <b-spinner></b-spinner>
              <p class="mt-2 mb-0">Processing invitation...</p>
            </div>
            <div v-else-if="success" class="text-center py-3">
              <i class="bx bx-check-circle text-success" style="font-size: 4rem;"></i>
              <h5 class="mt-3 text-success">Success!</h5>
              <p class="mb-0">{{ successMessage }}</p>
              <b-button variant="primary" class="mt-3" :to="{ name: 'dashboards.index' }">
                Go to Dashboard
              </b-button>
            </div>
            <div v-else-if="error" class="py-3">
              <b-alert variant="danger" show>{{ error }}</b-alert>
              <b-button variant="outline-primary" :to="{ name: 'dashboards.index' }">
                Go to Dashboard
              </b-button>
            </div>
            <div v-else class="py-3">
              <p class="text-muted">No invitation token provided.</p>
              <b-button variant="primary" :to="{ name: 'auth.sign-in' }">Sign In</b-button>
            </div>
          </b-card>
        </b-col>
      </b-row>
  </AuthLayout>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import AuthLayout from '@/layouts/AuthLayout.vue';
import { companiesService, parseApiError } from '@/services';
import { useAuthStore } from '@/stores/auth';
import { useToast } from 'primevue/usetoast';

const route = useRoute();
const router = useRouter();
const authStore = useAuthStore();
const toast = useToast();

const loading = ref(true);
const success = ref(false);
const successMessage = ref('');
const error = ref('');

onMounted(async () => {
  const token = route.params.token;
  if (!token) {
    loading.value = false;
    return;
  }

  if (!authStore.isAuthenticated) {
    router.replace({ name: 'auth.sign-in', query: { redirectedFrom: route.fullPath } });
    return;
  }

  try {
    const data = await companiesService.acceptInvitation(token);
    success.value = true;
    successMessage.value = data.detail || `Successfully joined the company.`;
    await authStore.refreshUser();
  } catch (e) {
    let msg = parseApiError(e) || 'Could not accept invitation.';
    if (e?.response?.status === 403 && msg?.toLowerCase?.().includes('different email')) {
      msg += ' Please log in with the invited email address.';
    }
    error.value = msg;
    toast.add({ severity: 'error', summary: 'Error', detail: msg });
  } finally {
    loading.value = false;
  }
});
</script>

<style scoped>
/* AuthLayout provides authentication-bg; extra centering if needed */
</style>
