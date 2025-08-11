<template>
  <VerticalLayout>
    <b-card class="mt-4">
      <h2 class="mb-3">Create Company</h2>

      <b-form @submit.prevent="submit" enctype="multipart/form-data">
        <!-- Name -->
        <b-form-group label="Name*" label-for="name">
          <b-form-input id="name" v-model="form.name" required />
        </b-form-group>

        <!-- Description -->
        <b-form-group label="Description" label-for="description">
          <b-form-textarea id="description" v-model="form.description" rows="3" />
        </b-form-group>

        <!-- Industry -->
        <b-form-group label="Industry" label-for="industry">
          <b-form-input id="industry" v-model="form.industry" />
        </b-form-group>

        <!-- Website -->
        <b-form-group label="Website" label-for="website">
          <b-form-input id="website" v-model="form.website" type="url" />
        </b-form-group>

        <!-- Logo Upload -->
        <b-form-group label="Logo" label-for="logo">
          <b-form-file id="logo" v-model="form.logo" accept="image/*" />
        </b-form-group>

        <!-- Tax ID & Reg # -->
        <b-row>
          <b-col md="6">
            <b-form-group label="Tax ID" label-for="tax_id">
              <b-form-input id="tax_id" v-model="form.tax_id" />
            </b-form-group>
          </b-col>
          <b-col md="6">
            <b-form-group label="Registration #" label-for="registration_number">
              <b-form-input id="registration_number" v-model="form.registration_number" />
            </b-form-group>
          </b-col>
        </b-row>

        <!-- Founded Date -->
        <b-form-group label="Founded Date" label-for="founded_date">
          <b-form-input
            id="founded_date"
            v-model="form.founded_date"
            type="date"
          />
        </b-form-group>

        <!-- Country -->
        <b-form-group label="Country" label-for="country">
          <b-form-select
            id="country"
            v-model="form.country"
            :options="countryOptions"
            placeholder="Select a country"
          />
        </b-form-group>

        <!-- Key Activities -->
        <b-form-group label="Key Activities" label-for="key_activities">
          <b-form-textarea
            id="key_activities"
            v-model="form.key_activities"
            rows="2"
          />
        </b-form-group>

        <!-- NAICS Code & Employee Count -->
        <b-row>
          <b-col md="6">
            <b-form-group label="NAICS Code" label-for="naics_code">
              <b-form-input id="naics_code" v-model="form.naics_code" />
            </b-form-group>
          </b-col>
          <b-col md="6">
            <b-form-group label="Employee Count" label-for="employee_count">
              <b-form-input
                id="employee_count"
                v-model="form.employee_count"
                type="number"
                min="0"
              />
            </b-form-group>
          </b-col>
        </b-row>

        <div class="d-flex justify-content-end mt-4">
          <b-button variant="secondary" @click="reset">Reset</b-button>
          <b-button variant="primary" type="submit" class="ms-2">
            <i v-if="loading" class="pi pi-spin pi-spinner me-2"></i>
            Create
          </b-button>
        </div>
      </b-form>
    </b-card>
  </VerticalLayout>
</template>

<script setup>
import { ref, reactive } from 'vue'
import { useToast } from 'primevue/usetoast'
import { useRouter } from 'vue-router'
import VerticalLayout from '@/layouts/VerticalLayout.vue'
import { api } from '@/services/authService'
import {
  BFormGroup,
  BForm,
  BFormInput,
  BFormTextarea,
  BFormFile,
  BFormSelect,
  BButton,
  BRow,
  BCol,
  BCard
} from 'bootstrap-vue-next'

const toast = useToast()
const router = useRouter()
const loading = ref(false)

const countryOptions = [
  { value: 'Tanzania', text: 'Tanzania' },
  { value: 'Kenya',    text: 'Kenya'    },
  { value: 'Uganda',   text: 'Uganda'   },
]

const form = reactive({
  name: '',
  description: '',
  industry: '',
  website: '',
  logo: null,
  tax_id: '',
  registration_number: '',
  founded_date: '',
  country: '',
  key_activities: '',
  naics_code: '',
  employee_count: null,
})

function reset() {
  Object.assign(form, {
    name: '',
    description: '',
    industry: '',
    website: '',
    logo: null,
    tax_id: '',
    registration_number: '',
    founded_date: '',
    country: '',
    key_activities: '',
    naics_code: '',
    employee_count: null,
  })
}

async function submit() {
  if (!form.name) {
    toast.add({ severity: 'warn', summary: 'Validation', detail: 'Name is required.' })
    return
  }
  loading.value = true
  try {
    const payload = new FormData()
    Object.entries(form).forEach(([k,v]) => {
      if (v !== null && v !== '') payload.append(k, v)
    })
    const { data } = await api.post('accounts/companies/', payload, {
      headers: { 'Content-Type': 'multipart/form-data' }
    })
    toast.add({ severity: 'success', summary: 'Created', detail: data.name })
    router.push({ name: 'profile.financial', params: { companyId: data.id } })
  } catch (err) {
    const msg = err.response?.data?.detail
      || JSON.stringify(err.response?.data)
      || 'Create failed.'
    toast.add({ severity: 'error', summary: 'Error', detail: msg })
  } finally {
    loading.value = false
  }
}
</script>

<style scoped>
.form-control { max-width: 100%; }
</style>
