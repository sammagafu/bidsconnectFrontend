<template>
  <VerticalLayout>
    <b-container>
      <b-row>
        <b-col>
          <div class="card">
            <div class="card-body">
              <h2 class="card-title mb-4">Company Details</h2>
              <b-row v-if="company" class="mb-4">
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
                <b-col md="8">
                  <div class="mb-3">
                    <strong>Description:</strong>
                    <p>{{ company.description || 'N/A' }}</p>
                  </div>
                  <div class="mb-3">
                    <strong>Industry:</strong>
                    <p>{{ company.industry || 'N/A' }}</p>
                  </div>
                  <div class="mb-3">
                    <strong>Email:</strong>
                    <p>{{ company.email || 'N/A' }}</p>
                  </div>
                  <div class="mb-3">
                    <strong>Phone Number:</strong>
                    <p>{{ company.phone_number || 'N/A' }}</p>
                  </div>
                  <div class="mb-3">
                    <strong>Website:</strong>
                    <p v-if="company.website">
                      <a :href="company.website" target="_blank">{{ company.website }}</a>
                    </p>
                    <p v-else>N/A</p>
                  </div>
                  <div class="mb-3">
                    <strong>Address:</strong>
                    <p>{{ company.address || 'N/A' }}</p>
                  </div>
                  <div class="mb-3">
                    <strong>Tax ID:</strong>
                    <p>{{ company.tax_id || 'N/A' }}</p>
                  </div>
                  <div class="mb-3">
                    <strong>Registration Number:</strong>
                    <p>{{ company.registration_number || 'N/A' }}</p>
                  </div>
                  <div class="mb-3">
                    <strong>Founded Date:</strong>
                    <p>{{ company.founded_date ? new Date(company.founded_date).toLocaleDateString() : 'N/A' }}</p>
                  </div>
                  <div class="mb-3">
                    <strong>Country:</strong>
                    <p>{{ company.country || 'N/A' }}</p>
                  </div>
                  <div class="mb-3">
                    <strong>Employee Count:</strong>
                    <p>{{ company.employee_count || 'N/A' }}</p>
                  </div>
                  <div class="mb-3">
                    <strong>Owner Email:</strong>
                    <p>{{ company.owner_email || 'N/A' }}</p>
                  </div>
                  <div class="mb-3">
                    <strong>Verified:</strong>
                    <p>{{ company.is_verified ? 'Yes' : 'No' }}</p>
                  </div>
                  <div class="mb-3">
                    <strong>Verification Date:</strong>
                    <p>{{ company.verification_date ? new Date(company.verification_date).toLocaleDateString() : 'N/A' }}</p>
                  </div>
                  <div class="mb-3">
                    <strong>Created At:</strong>
                    <p>{{ company.created_at ? new Date(company.created_at).toLocaleDateString() : 'N/A' }}</p>
                  </div>
                  <div class="mb-3">
                    <strong>Updated At:</strong>
                    <p>{{ company.updated_at ? new Date(company.updated_at).toLocaleDateString() : 'N/A' }}</p>
                  </div>
                  <div v-if="company.decline_reason" class="mb-3">
                    <strong>Decline Reason:</strong>
                    <p>{{ company.decline_reason }}</p>
                  </div>
                  <div v-if="company.declined_by" class="mb-3">
                    <strong>Declined By:</strong>
                    <p>{{ company.declined_by }}</p>
                  </div>
                </b-col>
              </b-row>
              <div v-else class="text-center">
                <p class="text-muted">Company not found.</p>
              </div>
              <div class="d-flex justify-content-end">
                <b-button variant="secondary" @click="goBack">Back</b-button>
              </div>
            </div>
          </div>
        </b-col>
      </b-row>
    </b-container>
  </VerticalLayout>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { api } from '@/services/authService';
import { useToast } from 'primevue/usetoast';
import VerticalLayout from '@/layouts/VerticalLayout.vue';

const route = useRoute();
const router = useRouter();
const toast = useToast();
const company = ref(null);

onMounted(async () => {
  await fetchCompanyDetails();
});

const fetchCompanyDetails = async () => {
  try {
    const response = await api.get(`accounts/companies/${route.params.id}/`);
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

const goBack = () => {
  router.push({ name: 'admin.companies-management' });
};
</script>