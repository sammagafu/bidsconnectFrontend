<template>
  <VerticalLayout>
    <b-card class="mt-4">
      <!-- Header + Create Button -->
      <div class="d-flex justify-content-between align-items-center mb-3">
        <h2 class="mb-0">Personnel Information</h2>
        <b-button variant="success" size="sm" @click="openNew">
          <i class="bx bx-plus"></i> Create
        </b-button>
      </div>

      <!-- Personnel Table -->
      <b-table :items="items" :fields="tableFields" striped hover small responsive>
        <template #cell(index)="row">{{ row.index + 1 }}</template>
        <template #cell(first_name)="row">{{ row.item.first_name }}</template>
        <template #cell(middle_name)="row">{{ row.item.middle_name || '—' }}</template>
        <template #cell(last_name)="row">{{ row.item.last_name }}</template>
        <template #cell(job_title)="row">{{ row.item.job_title }}</template>
        <template #cell(phone_number)="row">{{ row.item.phone_number }}</template>
        <template #cell(email)="row">{{ row.item.email }}</template>
        <template #cell(actions)="row">
          <b-button size="sm" variant="outline-primary" class="me-2" @click="onEdit(row.item)" v-b-tooltip.hover title="Edit">
            <i class="bx bx-pencil"></i>
          </b-button>
          <b-button size="sm" variant="outline-danger" @click="onDelete(row.item)" v-b-tooltip.hover title="Delete">
            <i class="bx bx-trash"></i>
          </b-button>
        </template>
      </b-table>
    </b-card>

    <!-- Create/Edit Modal -->
    <b-modal v-model="showDialog" :title="editing ? 'Edit Personnel' : 'New Personnel'" hide-footer>
      <b-form @submit.prevent="save">
        <b-row>
          <!-- Name fields -->
          <b-col md="4" class="mb-3">
            <b-form-group label="First Name*" label-for="first_name">
              <b-form-input id="first_name" v-model="form.first_name" required />
            </b-form-group>
          </b-col>
          <b-col md="4" class="mb-3">
            <b-form-group label="Middle Name" label-for="middle_name">
              <b-form-input id="middle_name" v-model="form.middle_name" />
            </b-form-group>
          </b-col>
          <b-col md="4" class="mb-3">
            <b-form-group label="Last Name*" label-for="last_name">
              <b-form-input id="last_name" v-model="form.last_name" required />
            </b-form-group>
          </b-col>

          <!-- Personal info -->
          <b-col md="4" class="mb-3">
            <b-form-group label="Gender*" label-for="gender">
              <b-form-select
                id="gender"
                v-model="form.gender"
                :options="genderOptions"
                required
              />
            </b-form-group>
          </b-col>
          <b-col md="4" class="mb-3">
            <b-form-group label="Date of Birth*" label-for="date_of_birth">
              <FlatPicker
                id="date_of_birth"
                v-model="form.date_of_birth"
                :options="{ dateFormat: 'Y-m-d' }"
                placeholder="YYYY-MM-DD"
                required
              />
            </b-form-group>
          </b-col>
          <b-col md="4" class="mb-3">
            <b-form-group label="Phone*" label-for="phone_number">
              <b-form-input id="phone_number" v-model="form.phone_number" required />
            </b-form-group>
          </b-col>
          <b-col md="6" class="mb-3">
            <b-form-group label="Email*" label-for="email">
              <b-form-input id="email" v-model="form.email" type="email" required />
            </b-form-group>
          </b-col>
          <b-col md="6" class="mb-3">
            <b-form-group label="Address*" label-for="physical_address">
              <b-form-textarea id="physical_address" v-model="form.physical_address" rows="2" required />
            </b-form-group>
          </b-col>

          <!-- Employment details -->
          <b-col md="4" class="mb-3">
            <b-form-group label="Employee Type*" label-for="employee_type">
              <b-form-select
                id="employee_type"
                v-model="form.employee_type"
                :options="employeeTypeOptions"
                required
              />
            </b-form-group>
          </b-col>
          <b-col md="4" class="mb-3">
            <b-form-group label="Job Title*" label-for="job_title">
              <b-form-input id="job_title" v-model="form.job_title" required />
            </b-form-group>
          </b-col>
          <b-col md="4" class="mb-3">
            <b-form-group label="Date of Employment*" label-for="date_of_employment">
              <FlatPicker
                id="date_of_employment"
                v-model="form.date_of_employment"
                :options="{ dateFormat: 'Y-m-d' }"
                placeholder="YYYY-MM-DD"
                required
              />
            </b-form-group>
          </b-col>
          <b-col md="6" class="mb-3">
            <b-form-group label="Languages Spoken" label-for="language_spoken">
              <b-form-input
                id="language_spoken"
                v-model="form.language_spoken"
                placeholder="Comma-separated"
              />
            </b-form-group>
          </b-col>

          <!-- Legacy & verification -->
          <b-col md="3" class="mb-3">
            <b-form-group label="Education" label-for="education">
              <b-form-input id="education" v-model="form.education" />
            </b-form-group>
          </b-col>
          <b-col md="3" class="mb-3">
            <b-form-group label="Years Experience" label-for="years_experience">
              <b-form-input
                id="years_experience"
                v-model="form.years_experience"
                type="number"
                min="0"
              />
            </b-form-group>
          </b-col>
          <b-col md="3" class="mb-3">
            <b-form-group label="Professional Reg." label-for="professional_registration">
              <b-form-checkbox id="professional_registration" v-model="form.professional_registration">
                Yes
              </b-form-checkbox>
            </b-form-group>
          </b-col>
          <b-col md="3" class="mb-3">
            <b-form-group label="Verified" label-for="is_verified">
              <b-form-checkbox id="is_verified" v-model="form.is_verified">
                Verified
              </b-form-checkbox>
            </b-form-group>
          </b-col>
        </b-row>

        <!-- Actions -->
        <div class="d-flex justify-content-end mt-4">
          <b-button variant="secondary" class="me-2" @click="cancel">Cancel</b-button>
          <b-button variant="primary" type="submit">Save</b-button>
        </div>
      </b-form>
    </b-modal>
  </VerticalLayout>
</template>

<script setup>
import { ref, reactive, onMounted, watch } from 'vue'
import { useToast } from 'primevue/usetoast'
import { useAuthStore } from '@/stores/auth'
import { api } from '@/services/authService'
import VerticalLayout from '@/layouts/VerticalLayout.vue'
import FlatPicker from '@/components/FlatPicker.vue'

const toast = useToast()
const authStore = useAuthStore()
const companyId = ref(authStore.user?.companies?.[0]?.id || null)

const items = ref([])
const showDialog = ref(false)
const editing = ref(false)

// form model matches your updated model
const form = reactive({
  id: null,
  first_name: '',
  middle_name: '',
  last_name: '',
  gender: '',
  date_of_birth: null,
  phone_number: '',
  email: '',
  physical_address: '',
  employee_type: '',
  job_title: '',
  date_of_employment: null,
  language_spoken: '',
  education: '',
  years_experience: 0,
  professional_registration: false,
  is_verified: false,
})

const genderOptions = [
  { value: 'male', text: 'Male' },
  { value: 'female', text: 'Female' },
  { value: 'other', text: 'Other' },
]
const employeeTypeOptions = [
  { value: 'employee', text: 'Employee' },
  { value: 'expert',   text: 'Expert' },
]

const tableFields = [
  { key: 'index',        label: 'No',           thStyle: { width: '4em' } },
  { key: 'first_name',   label: 'First Name' },
  { key: 'middle_name',  label: 'Middle' },
  { key: 'last_name',    label: 'Last Name' },
  { key: 'job_title',    label: 'Job Title' },
  { key: 'phone_number', label: 'Phone' },
  { key: 'email',        label: 'Email' },
  { key: 'actions',      label: '',            thStyle: { width: '8em' } },
]

async function fetchItems(id) {
  if (!id) return
  try {
    const { data } = await api.get(`accounts/companies/${id}/personnel/`)
    items.value = data
  } catch {
    toast.add({ severity: 'error', summary: 'Error', detail: 'Could not load personnel.' })
  }
}

onMounted(() => fetchItems(companyId.value))
watch(companyId, fetchItems)

function openNew() {
  editing.value = false
  Object.assign(form, {
    id: null,
    first_name: '',
    middle_name: '',
    last_name: '',
    gender: '',
    date_of_birth: null,
    phone_number: '',
    email: '',
    physical_address: '',
    employee_type: '',
    job_title: '',
    date_of_employment: null,
    language_spoken: '',
    education: '',
    years_experience: 0,
    professional_registration: false,
    is_verified: false,
  })
  showDialog.value = true
}

function onEdit(item) {
  editing.value = true
  Object.assign(form, item)
  showDialog.value = true
}

async function save() {
  // minimal required validation
  if (
    !form.first_name ||
    !form.last_name ||
    !form.gender ||
    !form.date_of_birth ||
    !form.phone_number ||
    !form.email ||
    !form.employee_type ||
    !form.job_title ||
    !form.date_of_employment
  ) {
    toast.add({ severity: 'warn', summary: 'Validation', detail: 'Fill all required fields.' })
    return
  }

  const base = `accounts/companies/${companyId.value}/personnel`
  try {
    if (editing.value) {
      await api.patch(`${base}/${form.id}/`, form)
      toast.add({ severity: 'success', summary: 'Updated' })
    } else {
      await api.post(`${base}/`, form)
      toast.add({ severity: 'success', summary: 'Created' })
    }
    showDialog.value = false
    fetchItems(companyId.value)
  } catch {
    toast.add({ severity: 'error', summary: 'Error', detail: 'Save failed.' })
  }
}

async function onDelete(item) {
  if (!confirm(`Delete ${item.first_name} ${item.last_name}?`)) return
  const base = `accounts/companies/${companyId.value}/personnel`
  try {
    await api.delete(`${base}/${item.id}/`)
    toast.add({ severity: 'success', summary: 'Deleted' })
    fetchItems(companyId.value)
  } catch {
    toast.add({ severity: 'error', summary: 'Error', detail: 'Delete failed.' })
  }
}

function cancel() {
  showDialog.value = false
}
</script>

<style scoped>
.b-form-group {
  margin-bottom: 1rem;
}
</style>
