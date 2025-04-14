<template>
    <VerticalLayout>
      <b-container>
        <b-row>
          <b-col>
            <!-- Show company management if the user has a company -->
            <div v-if="hasCompany">
              <!-- Company Details -->
              <h2>{{ company.name }}</h2>
              <p>{{ company.description }}</p>
  
              <!-- Invite User Section -->
              <h3 class="mt-4">Invite User</h3>
              <b-form @submit.prevent="inviteUser" class="mb-4">
                <b-row>
                  <b-col md="6">
                    <b-form-group label="Email">
                      <b-form-input
                        v-model="invitation.email"
                        type="email"
                        placeholder="Enter email"
                        required
                      />
                    </b-form-group>
                  </b-col>
                  <b-col md="4">
                    <b-form-group label="Role">
                      <b-form-select
                        v-model="invitation.role"
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
  
              <!-- Users List -->
              <h3>Company Users</h3>
              <b-table
                :items="users"
                :fields="userFields"
                striped
                hover
                responsive
                class="mb-4"
              >
                <template #cell(actions)="row">
                  <b-button
                    variant="outline-primary"
                    size="sm"
                    @click="openEditRoleModal(row.item)"
                    class="mr-2"
                  >
                    Edit Role
                  </b-button>
                  <b-button
                    variant="outline-danger"
                    size="sm"
                    @click="deleteUser(row.item.id)"
                  >
                    Delete
                  </b-button>
                </template>
              </b-table>
  
              <!-- Edit Role Modal -->
              <b-modal
                v-model="showEditRoleModal"
                title="Edit User Role"
                @ok="updateUserRole"
                :ok-disabled="loadingEdit"
                ok-title="Save"
              >
                <b-form-group label="Email">
                  <b-form-input
                    v-model="editUser.email"
                    type="email"
                    readonly
                  />
                </b-form-group>
                <b-form-group label="Role">
                  <b-form-select
                    v-model="editUser.role"
                    :options="roleOptions"
                    required
                  />
                </b-form-group>
              </b-modal>
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
  const users = ref([]);
  const showEditRoleModal = ref(false);
  const loadingInvite = ref(false);
  const loadingEdit = ref(false);
  const loadingDelete = ref(false);
  
  // Invitation form
  const invitation = ref({
    email: '',
    role: 'member',
  });
  
  // Edit user form
  const editUser = ref({
    id: null,
    email: '',
    role: 'member',
  });
  
  // Role options
  const roleOptions = [
    { value: 'admin', text: 'Admin' },
    { value: 'member', text: 'Member' },
  ];
  
  // User table fields
  const userFields = [
    { key: 'email', label: 'Email' },
    { key: 'role', label: 'Role', formatter: value => value.charAt(0).toUpperCase() + value.slice(1) },
    { key: 'actions', label: 'Actions' },
  ];
  
  // Check if the user has a company on mount using the auth store
  onMounted(() => {
    // Initialize auth state if not already done
    authStore.initialize();
  
    // Check if the user has companies
    hasCompany.value = authStore.hasCompanies();
  
    // If the user has a company, fetch details and users
    if (hasCompany.value) {
      Promise.all([fetchCompanyDetails(), fetchCompanyUsers()]);
    }
  });
  
  // Fetch company details
  const fetchCompanyDetails = async () => {
    try {
      const response = await api.get(`companies/${route.params.id}/`);
      company.value = response.data;
    } catch (error) {
      console.error('Failed to load company details:', error);
      toast.add({
        severity: 'error',
        summary: 'Error',
        detail: 'Failed to load company details',
        life: 3000,
      });
    }
  };
  
  // Fetch company users
  const fetchCompanyUsers = async () => {
    try {
      const response = await api.get(`companies/${route.params.id}/users/`);
      users.value = response.data.results || [];
    } catch (error) {
      console.error('Failed to load company users:', error);
      toast.add({
        severity: 'error',
        summary: 'Error',
        detail: 'Failed to load company users',
        life: 3000,
      });
    }
  };
  
  // Invite a user
  const inviteUser = async () => {
    loadingInvite.value = true;
    try {
      const payload = {
        email: invitation.value.email,
        role: invitation.value.role,
      };
      await api.post(`companies/${route.params.id}/invite/`, payload);
      toast.add({
        severity: 'success',
        summary: 'Success',
        detail: 'User invited successfully',
        life: 3000,
      });
      invitation.value.email = '';
      invitation.value.role = 'member';
      await fetchCompanyUsers(); // Refresh the user list
    } catch (error) {
      console.error('Failed to invite user:', error);
      const errorDetail = error.response?.data || { message: 'Failed to invite user' };
      toast.add({
        severity: 'error',
        summary: 'Error',
        detail: errorDetail.message || 'Failed to invite user',
        life: 3000,
      });
    } finally {
      loadingInvite.value = false;
    }
  };
  
  // Open edit role modal
  const openEditRoleModal = (user) => {
    editUser.value = {
      id: user.id,
      email: user.email,
      role: user.role,
    };
    showEditRoleModal.value = true;
  };
  
  // Update user role
  const updateUserRole = async () => {
    loadingEdit.value = true;
    try {
      const payload = {
        role: editUser.value.role,
      };
      await api.patch(`companies/${route.params.id}/users/${editUser.value.id}/`, payload);
      toast.add({
        severity: 'success',
        summary: 'Success',
        detail: 'User role updated successfully',
        life: 3000,
      });
      showEditRoleModal.value = false;
      await fetchCompanyUsers(); // Refresh the user list
    } catch (error) {
      console.error('Failed to update user role:', error);
      const errorDetail = error.response?.data || { message: 'Failed to update user role' };
      toast.add({
        severity: 'error',
        summary: 'Error',
        detail: errorDetail.message || 'Failed to update user role',
        life: 3000,
      });
    } finally {
      loadingEdit.value = false;
    }
  };
  
  // Delete user
  const deleteUser = async (userId) => {
    if (!confirm('Are you sure you want to remove this user from the company?')) return;
    loadingDelete.value = true;
    try {
      await api.delete(`companies/${route.params.id}/users/${userId}/`);
      toast.add({
        severity: 'success',
        summary: 'Success',
        detail: 'User removed successfully',
        life: 3000,
      });
      await fetchCompanyUsers(); // Refresh the user list
    } catch (error) {
      console.error('Failed to remove user:', error);
      const errorDetail = error.response?.data || { message: 'Failed to remove user' };
      toast.add({
        severity: 'error',
        summary: 'Error',
        detail: errorDetail.message || 'Failed to remove user',
        life: 3000,
      });
    } finally {
      loadingDelete.value = false;
    }
  };
  
  // Redirect to create company page
  const goToCreateCompany = () => {
    router.push('/company/create-company');
  };
  </script>