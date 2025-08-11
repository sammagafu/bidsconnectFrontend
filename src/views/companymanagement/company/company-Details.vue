<template>
  <VerticalLayout>
    <!-- loading spinner -->
    <div v-if="!company" class="text-center py-5">
      <b-spinner label="Loading…"></b-spinner>
    </div>

    <div v-else>
      <!-- Core Company Info -->
      <b-card class="mb-4">
        <template #header>
          <div class="d-flex justify-content-between align-items-center">
            <h3 class="mb-0">Company Details</h3>
            <router-link
              :to="{ name: 'company.edit', params: { companyId } }"
              class="btn btn-sm btn-outline-primary"
            >
              <i class="bx bx-pencil"></i> Edit
            </router-link>
          </div>
        </template>

        <b-row>
          <b-col md="4" class="text-center">
            <img 
              v-if="company.logo" 
              :src="company.logo" 
              :alt="company.name" 
              class="rounded mb-3" 
              style="width:150px;height:150px;object-fit:cover" 
            />
            <p v-else class="text-muted">No Logo</p>
            <h4>{{ company.name }}</h4>
            <b-badge 
              :variant="company.status === 'active' ? 'success' : 'danger'"
              class="mt-2"
            >
              {{ capitalize(company.status) }}
            </b-badge>
          </b-col>
          <b-col md="8">
            <ul class="list-unstyled mb-0">
              <li><strong>Description:</strong> {{ company.description || 'N/A' }}</li>
              <li><strong>Industry:</strong> {{ company.industry || 'N/A' }}</li>
              <li>
                <strong>Website:</strong>
                <span v-if="company.website">
                  <a :href="company.website" target="_blank">{{ company.website }}</a>
                </span>
                <span v-else>N/A</span>
              </li>
              <li><strong>Tax ID:</strong> {{ company.tax_id || 'N/A' }}</li>
              <li><strong>Registration #:</strong> {{ company.registration_number || 'N/A' }}</li>
              <li><strong>Founded:</strong> {{ company.founded_date ? formatDate(company.founded_date) : 'N/A' }}</li>
              <li><strong>Country:</strong> {{ company.country || 'N/A' }}</li>
              <li><strong>Employees:</strong> {{ company.employee_count ?? 'N/A' }}</li>
              <li><strong>Verified:</strong> {{ company.is_verified ? 'Yes' : 'No' }}</li>
              <li>
                <strong>Verified At:</strong> 
                {{ company.verification_date ? formatDate(company.verification_date) : 'N/A' }}
              </li>
            </ul>
          </b-col>
        </b-row>
      </b-card>

      <!-- Related lists -->
      <RelatedListCard
        title="Users"
        :items="company.company_users"
        labelFn="user_email"
        subLabel="role"
        :createRoute="{ name: 'user.user-management'}"
        :editRoute="{ name: 'user.user-management'}"
      />

      <RelatedListCard
        title="Invitations"
        :items="company.invitations"
        labelFn="invited_email"
        subLabel="expires_at"
        dateSub
        :createRoute="{ name: 'user.user-management'}"
        :editRoute="{ name: 'user.user-management'}"
      />

      <RelatedListCard
        title="Documents"
        :items="company.documents"
        labelFn="document_type"
        linkField="document_file"
        linkText="Download"
        :createRoute="{ name: 'user.user-management'}"
        :editRoute="{ name: 'user.user-management'}"
      />

      <RelatedListCard
        title="Offices"
        :items="company.offices"
        labelFn="director_title"
        subFields="region,district"
        :createRoute="{ name: 'profile.officelocation'}"
        :editRoute="{ name: 'user.user-management'}"
      />

      <RelatedListCard
        title="Certifications"
        :items="company.certifications"
        labelFn="cert_type"
        linkField="file"
        linkText="Download"
        :createRoute="{ name: 'user.user-management'}"
        :editRoute="{ name: 'user.user-management'}"
      />

      <RelatedListCard
        title="Sources of Funds"
        :items="company.sources_of_funds"
        labelFn="source_type"
        subFields="amount,currency"
        :createRoute="{ name: 'profile.source-of-funds'}"
        :editRoute="{ name: 'user.user-management'}"
      />

      <RelatedListCard
        title="Annual Turnovers"
        :items="company.annual_turnovers"
        labelFn="year"
        subFields="amount,currency"
        :createRoute="{ name: 'profile.turnover'}"
        :editRoute="{ name: 'user.user-management'}"
      />

      <RelatedListCard
        title="Financial Statements"
        :items="company.financial_statements"
        labelFn="year"
        linkField="file"
        linkText="FS"
        extraLinkField="audit_report"
        extraLinkText="AR"
        :createRoute="{ name: 'profile.financial'}"
        :editRoute="{ name: 'user.user-management'}"
      />

      <RelatedListCard
        title="Litigations"
        :items="company.litigations"
        labelFn="title"
        subLabel="status"
        :createRoute="{ name: 'profile.litigation'}"
        :editRoute="{ name: 'user.user-management'}"
      />

      <RelatedListCard
        title="Equipment"
        :items="company.equipment"
        labelFn="name"
        subLabel="quantity"
        :createRoute="{ name: 'user.user-management'}"
        :editRoute="{ name: 'user.user-management'}"
      />

      <RelatedListCard
        title="Personnel"
        :items="company.personnel"
        labelFn="first_name"
        subLabel="job_title"
        :createRoute="{ name: 'profile.personalinformation'}"
        :editRoute="{ name: 'user.user-management'}"
      />
    </div>
  </VerticalLayout>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useToast } from 'primevue/usetoast'
import { useAuthStore } from '@/stores/auth'
import { api } from '@/services/authService'
import VerticalLayout from '@/layouts/VerticalLayout.vue'
import {
  BRow,
  BCol,
  BCard,
  BButton,
  BBadge,
  BSpinner
} from 'bootstrap-vue-next'
import RelatedListCard from '@/components/RelatedListCard.vue'

const toast     = useToast()
const auth      = useAuthStore()
const companyId = ref(auth.user?.companies?.[0]?.id || null)
const company   = ref(null)

async function fetchCompany() {
  if (!companyId.value) return
  try {
    const { data } = await api.get(`accounts/companies/${companyId.value}/`)
    company.value = data
  } catch {
    toast.add({ severity:'error', summary:'Error', detail:'Could not load company.' })
  }
}

onMounted(fetchCompany)

function formatDate(d) {
  return d ? new Date(d).toLocaleDateString() : ''
}

function capitalize(str) {
  return str.charAt(0).toUpperCase() + str.slice(1)
}
</script>

<style scoped>
.mb-4 { margin-bottom: 1.5rem; }
.py-5 { padding-top: 3rem; padding-bottom: 3rem; }
.text-center { text-align: center; }
</style>
