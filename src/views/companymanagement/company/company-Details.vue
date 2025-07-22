<template>
  <VerticalLayout>
    <div class="card">
      <div class="card-body">
        <h2 class="card-title mb-4">Company Details</h2>
        <!-- Company Info -->
        <b-row v-if="company" class="mb-4">
          <!-- Logo and Basic -->
          <b-col md="4" class="text-center">
            <img
              v-if="company.logo"
              :src="company.logo"
              :alt="company.name"
              class="rounded mb-3"
              style="width: 150px; height: 150px; object-fit: cover;"
            />
            <p v-else class="text-muted">No Logo Available</p>
            <h4>{{ company.name }}</h4>
            <b-badge
              :variant="company.status === 'active' ? 'success' : company.status === 'pending' ? 'warning' : 'danger'"
              class="mt-2"
            >
              {{ company.status.charAt(0).toUpperCase() + company.status.slice(1) }}
            </b-badge>
          </b-col>

          <!-- Details List -->
          <b-col md="8">
            <div class="mb-3"><strong>Description:</strong> <p>{{ company.description || 'N/A' }}</p></div>
            <div class="mb-3"><strong>Industry:</strong> <p>{{ company.industry || 'N/A' }}</p></div>
            <div class="mb-3"><strong>Email:</strong> <p>{{ company.email || 'N/A' }}</p></div>
            <div class="mb-3"><strong>Phone Number:</strong> <p>{{ company.phone_number || 'N/A' }}</p></div>
            <div class="mb-3">
              <strong>Website:</strong>
              <p v-if="company.website"><a :href="company.website" target="_blank">{{ company.website }}</a></p>
              <p v-else>N/A</p>
            </div>
            <div class="mb-3"><strong>Address:</strong> <p>{{ company.address || 'N/A' }}</p></div>
            <div class="mb-3"><strong>Tax ID:</strong> <p>{{ company.tax_id || 'N/A' }}</p></div>
            <div class="mb-3"><strong>Registration Number:</strong> <p>{{ company.registration_number || 'N/A' }}</p></div>
            <div class="mb-3"><strong>Founded Date:</strong> <p>{{ company.founded_date ? formatDate(company.founded_date) : 'N/A' }}</p></div>
            <div class="mb-3"><strong>Country:</strong> <p>{{ company.country || 'N/A' }}</p></div>
            <div class="mb-3"><strong>Employee Count:</strong> <p>{{ company.employee_count || 'N/A' }}</p></div>
            <div class="mb-3"><strong>Owner Email:</strong> <p>{{ company.owner_email || 'N/A' }}</p></div>
            <div class="mb-3"><strong>Verified:</strong> <p>{{ company.is_verified ? 'Yes' : 'No' }}</p></div>
            <div class="mb-3"><strong>Verification Date:</strong> <p>{{ company.verification_date ? formatDate(company.verification_date) : 'N/A' }}</p></div>
            <div class="mb-3"><strong>Created At:</strong> <p>{{ company.created_at ? formatDate(company.created_at) : 'N/A' }}</p></div>
            <div class="mb-3"><strong>Updated At:</strong> <p>{{ company.updated_at ? formatDate(company.updated_at) : 'N/A' }}</p></div>
            <div v-if="company.decline_reason" class="mb-3"><strong>Decline Reason:</strong> <p>{{ company.decline_reason }}</p></div>
            <div v-if="company.declined_by" class="mb-3"><strong>Declined By:</strong> <p>{{ company.declined_by }}</p></div>
          </b-col>
        </b-row>

        <!-- No Company Found -->
        <div v-else class="text-center">
          <p class="text-muted">Company not found.</p>
        </div>

        <!-- Back Button -->
        <div class="d-flex justify-content-end">
          <b-button variant="secondary" @click="goBack">Back</b-button>
        </div>
      </div>
    </div>
  </VerticalLayout>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue';
import { useRouter } from 'vue-router';
import { useToast } from 'primevue/usetoast';
import { useAuthStore } from '@/stores/auth';
import { api } from '@/services/authService';
import VerticalLayout from '@/layouts/VerticalLayout.vue';
import {
  BRow,
  BCol,
  BBadge,
  BButton
} from 'bootstrap-vue-next';

const toast = useToast();
const router = useRouter();
const authStore = useAuthStore();

// Route back
function goBack() {
  router.back();
}

// Company ID
const companyId = computed(() => authStore.user?.companies?.[0]?.id || null);

// Company data
const company = ref(null);

// Fetch company details
async function fetchCompany() {
  if (!companyId.value) return;
  try {
    const { data } = await api.get(`accounts/companies/${companyId.value}/`);
    company.value = data;
  } catch {
    toast.add({ severity: 'error', summary: 'Error', detail: 'Failed to load company.' });
  }
}

// Date formatting
function formatDate(date) {
  return date ? new Date(date).toLocaleDateString() : '';
}

// Watch and mount
watch(companyId, fetchCompany);
onMounted(fetchCompany);
</script>

<style scoped>
.mb-4 { margin-bottom: 1.5rem; }
.card-title { font-weight: bold; }
</style>
