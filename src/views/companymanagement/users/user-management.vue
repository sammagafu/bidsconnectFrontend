<template>
  <VerticalLayout>
    <b-container>
      <b-row>
        <b-col>
          <!-- Show invitation form if the user has a company -->
          <div v-if="hasCompany">
            <!-- Company Details -->
             <div class="py-2">
                <h2 class="display-2 fw-bolder">{{ company.name }}</h2>
                <p class="fs-3">{{ company.description }}</p>
             </div>
             <hr>
            <!-- Invite User Section -->
            <h3 class="mt-4">Invite User to {{ company.name }}</h3>
            <b-form @submit.prevent="sendInvitation" class="mb-4">
              <b-row>
                <b-col md="6">
                  <b-form-group label="Email">
                    <b-form-input
                      v-model="invitationForm.email"
                      type="email"
                      placeholder="Enter email"
                      required
                    />
                  </b-form-group>
                </b-col>
                <b-col md="4">
                  <b-form-group label="Role">
                    <b-form-select
                      v-model="invitationForm.role"
                      :options="roleOptions"
                      required
                    />
                  </b-form-group>
                </b-col>
                <b-col md="2" class="d-flex align-items-end">
                  <b-button type="submit" variant="primary" :disabled="loadingInvite">
                    {{ loadingInvite ? 'Inviting...' : 'Invite' }}
                  </b-button>
                </b-col>
              </b-row>
            </b-form>

            <!-- Pending Invitations List -->
            <h3 class="mt-4">Pending Invitations</h3>
            <b-table
              :items="pendingInvitations"
              :fields="invitationFields"
              striped
              hover
              responsive
              class="mb-4"
            >
              <template #cell(expires_at)="row">
                {{ formatDate(row.item.expires_at) }}
              </template>
              <template #cell(actions)="row">
                <b-button
                  variant="outline-danger"
                  size="sm"
                  @click="revokeInvitation(row.item.id)"
                  :disabled="loadingRevoke"
                >
                  Revoke
                </b-button>
              </template>
            </b-table>
          </div>

          <!-- Show house icon and "Add a Company" button if no company -->
          <div v-else class="text-center mt-5">
            <i class="pi pi-home" style="font-size: 5rem; color: #888;"></i>
            <h3 class="mt-3">No Company Found</h3>
            <p class="text-muted">You don’t have a company yet. Create one to start managing users.</p>
            <b-button
              variant="primary"
              @click="goToCreateCompany"
              class="mt-3"
            >
              Add a Company
            </b-button>
          </div>
        </b-col>
      </b-row>
    </b-container>
  </VerticalLayout>
</template>

<script setup>
import VerticalLayout from "@/layouts/VerticalLayout.vue";
import { ref, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { api } from '@/services/authService';
import { useToast } from 'primevue/usetoast';
import { useAuthStore } from '@/stores/auth';

const route = useRoute();
const router = useRouter();
const toast = useToast();
const authStore = useAuthStore();
const hasCompany = ref(false);
const company = ref({});
const pendingInvitations = ref([]);
const loadingInvite = ref(false);
const loadingRevoke = ref(false);

// Invitation form
const invitationForm = ref({
  email: '',
  role: 'user',
});

// Role options (mapped from backend ROLE_CHOICES)
const roleOptions = [
  { value: 'admin', text: 'Admin' },
  { value: 'manager', text: 'Manager' },
  { value: 'user', text: 'User' },
];

// Invitation table fields
const invitationFields = [
  { key: 'invited_email', label: 'Email' },
  { key: 'role', label: 'Role', formatter: value => value.charAt(0).toUpperCase() + value.slice(1) },
  { key: 'expires_at', label: 'Expires At' },
  { key: 'actions', label: 'Actions' },
];

// Check if the user has a company on mount using the auth store
onMounted(async () => {
  // Initialize auth state and wait for it to complete
  await authStore.initialize();

  // Check if the user is authenticated
  if (!authStore.isAuthenticated) {
    console.log('User is not authenticated, redirecting to login');
    router.push({ path: '/auth/sign-in', query: { redirect: route.fullPath } });
    return;
  }

  // Validate company ID from authStore
  if (authStore.hasCompanies() && authStore.user?.companies?.length > 0) {
    const companyId = authStore.user.companies[0].id; // Use the first company's id

    // Check if the current route matches the expected company ID; if not, redirect
    if (route.params.id && route.params.id !== companyId) {
      console.log('Route company ID does not match stored company ID, redirecting...');
      router.replace(`/company/${companyId}/invite-users`);
      return;
    }

    const storedCompany = authStore.user.companies.find(c => c.id === companyId);

    if (storedCompany) {
      // Company found in storage
      company.value = storedCompany;
      hasCompany.value = true;
      await fetchPendingInvitations(companyId); // Fetch pending invitations
    } else {
      console.log('Company not found in storage, redirecting to company list');
      toast.add({
        severity: 'error',
        summary: 'Error',
        detail: 'Company not found',
        life: 3000,
      });
      router.push('/company/list');
    }
  } else {
    // No companies found, redirect to create company page
    console.log('No companies found, redirecting to create company page');
    router.push('/company/create-company');
  }
});

// Fetch pending invitations for the company
const fetchPendingInvitations = async (companyId) => {
  try {
    // Updated endpoint to match backend URL
    const response = await api.get(`accounts/companies/${companyId}/invitations/`);
    pendingInvitations.value = response.data || [];
  } catch (error) {
    console.error('Failed to load pending invitations:', error);
    toast.add({
      severity: 'error',
      summary: 'Error',
      detail: 'Failed to load pending invitations',
      life: 3000,
    });
    if (error.response?.status === 401) {
      await authStore.logout();
      router.push({ path: '/auth/sign-in', query: { redirect: route.fullPath } });
    }
  }
};

// Send an invitation
const sendInvitation = async () => {
  loadingInvite.value = true;
  try {
    const companyId = authStore.user.companies[0].id; // Use the first company's id
    const payload = {
      invited_email: invitationForm.value.email,
      role: invitationForm.value.role,
    };
    // Updated endpoint to match backend URL
    await api.post(`accounts/companies/${companyId}/invitations/`, payload);
    toast.add({
      severity: 'success',
      summary: 'Success',
      detail: 'Invitation sent successfully',
      life: 3000,
    });
    invitationForm.value.email = '';
    invitationForm.value.role = 'user';
    await fetchPendingInvitations(companyId); // Refresh the invitations list
  } catch (error) {
    console.error('Failed to send invitation:', error);
    const errorDetail = error.response?.data || { message: 'Failed to send invitation' };
    toast.add({
      severity: 'error',
      summary: 'Error',
      detail: errorDetail.message || 'Failed to send invitation',
      life: 3000,
    });
    if (error.response?.status === 401) {
      await authStore.logout();
      router.push({ path: '/auth/sign-in', query: { redirect: route.fullPath } });
    }
  } finally {
    loadingInvite.value = false;
  }
};

// Revoke an invitation
const revokeInvitation = async (invitationId) => {
  if (!confirm('Are you sure you want to revoke this invitation?')) return;
  loadingRevoke.value = true;
  try {
    const companyId = authStore.user.companies[0].id; // Use the first company's id
    // Updated endpoint to match backend URL
    await api.delete(`accounts/companies/${companyId}/invitations/${invitationId}/`);
    toast.add({
      severity: 'success',
      summary: 'Success',
      detail: 'Invitation revoked successfully',
      life: 3000,
    });
    await fetchPendingInvitations(companyId); // Refresh the invitations list
  } catch (error) {
    console.error('Failed to revoke invitation:', error);
    const errorDetail = error.response?.data || { message: 'Failed to revoke invitation' };
    toast.add({
      severity: 'error',
      summary: 'Error',
      detail: errorDetail.message || 'Failed to revoke invitation',
      life: 3000,
    });
    if (error.response?.status === 401) {
      await authStore.logout();
      router.push({ path: '/auth/sign-in', query: { redirect: route.fullPath } });
    }
  } finally {
    loadingRevoke.value = false;
  }
};

// Format date for display
const formatDate = (dateString) => {
  return new Date(dateString).toLocaleDateString('en-US');
};

// Redirect to create company page
const goToCreateCompany = () => {
  router.push('/company/create-company');
};
</script>