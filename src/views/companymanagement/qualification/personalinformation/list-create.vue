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
        <template #cell(index)="data">
          {{ data.index + 1 }}
        </template>
        <template #cell(is_verified)="data">
          {{ data.item.is_verified ? 'Yes' : 'No' }}
        </template>
        <template #cell(actions)="data">
          <b-button
            size="sm"
            variant="outline-primary"
            class="me-2"
            @click="onEdit(data.item)"
            v-b-tooltip.hover
            title="Edit"
          >
            <i class="bx bx-pencil"></i>
          </b-button>
          <b-button
            size="sm"
            variant="outline-danger"
            @click="onDelete(data.item)"
            v-b-tooltip.hover
            title="Delete"
          >
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
          <b-col md="6" class="mb-3">
            <b-form-group
              label="First Name*"
              label-for="first_name"
              :state="formErrors.first_name === undefined"
              :invalid-feedback="formErrors.first_name || ''"
            >
              <b-form-input
                id="first_name"
                v-model="form.first_name"
                :state="formErrors.first_name === undefined"
                required
              />
            </b-form-group>
          </b-col>
          <b-col md="6" class="mb-3">
            <b-form-group
              label="Last Name*"
              label-for="last_name"
              :state="formErrors.last_name === undefined"
              :invalid-feedback="formErrors.last_name || ''"
            >
              <b-form-input
                id="last_name"
                v-model="form.last_name"
                :state="formErrors.last_name === undefined"
                required
              />
            </b-form-group>
          </b-col>

          <!-- Contact info -->
          <b-col md="6" class="mb-3">
            <b-form-group
              label="Email"
              label-for="email"
              :state="formErrors.email === undefined"
              :invalid-feedback="formErrors.email || ''"
            >
              <b-form-input
                id="email"
                v-model="form.email"
                type="email"
                :state="formErrors.email === undefined"
              />
            </b-form-group>
          </b-col>
          <b-col md="6" class="mb-3">
            <b-form-group
              label="Phone Number"
              label-for="phone_number"
              :state="formErrors.phone_number === undefined"
              :invalid-feedback="formErrors.phone_number || ''"
            >
              <b-form-input
                id="phone_number"
                v-model="form.phone_number"
                :state="formErrors.phone_number === undefined"
              />
            </b-form-group>
          </b-col>

          <!-- Employment details -->
          <b-col md="6" class="mb-3">
            <b-form-group
              label="Position*"
              label-for="position"
              :state="formErrors.position === undefined"
              :invalid-feedback="formErrors.position || ''"
            >
              <b-form-input
                id="position"
                v-model="form.position"
                :state="formErrors.position === undefined"
                required
              />
            </b-form-group>
          </b-col>
          <b-col md="6" class="mb-3">
            <b-form-group
              label="Years of Experience"
              label-for="years_of_experience"
              :state="formErrors.years_of_experience === undefined"
              :invalid-feedback="formErrors.years_of_experience || ''"
            >
              <b-form-input
                id="years_of_experience"
                v-model="form.years_of_experience"
                type="number"
                min="0"
                :state="formErrors.years_of_experience === undefined"
              />
            </b-form-group>
          </b-col>
          <b-col cols="12" class="mb-3">
            <b-form-group
              label="Qualifications"
              label-for="qualifications"
              :state="formErrors.qualifications === undefined"
              :invalid-feedback="formErrors.qualifications || ''"
            >
              <b-form-textarea
                id="qualifications"
                v-model="form.qualifications"
                rows="3"
                :state="formErrors.qualifications === undefined"
              />
            </b-form-group>
          </b-col>
          <b-col cols="12" class="mb-3">
            <b-form-group label="Resume" label-for="resume">
              <b-form-file
                id="resume"
                v-model="form.resume"
                accept=".pdf,.doc,.docx"
                placeholder="Choose a file or drop it here..."
                drop-placeholder="Drop file here..."
              />
              <small v-if="editing && form.resume_url" class="form-text text-muted">
                Current file: <a :href="form.resume_url" target="_blank">View</a>
              </small>
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

const toast = useToast()
const authStore = useAuthStore()
const companyId = ref(authStore.user?.companies?.[0]?.id || null)

const items = ref([])
const showDialog = ref(false)
const editing = ref(false)

// form model
const form = reactive({
  uuid: null,
  first_name: '',
  last_name: '',
  position: '',
  email: '',
  phone_number: '',
  years_of_experience: 0,
  qualifications: '',
  resume: null,
  resume_url: null // for display when editing
})

// form errors
const formErrors = reactive({})

const tableFields = [
  { key: 'index', label: 'No', thStyle: { width: '4em' } },
  { key: 'first_name', label: 'First Name' },
  { key: 'last_name', label: 'Last Name' },
  { key: 'position', label: 'Position' },
  { key: 'phone_number', label: 'Phone' },
  { key: 'email', label: 'Email' },
  { key: 'years_of_experience', label: 'Years Exp.' },
  { key: 'is_verified', label: 'Verified' },
  { key: 'uploaded_at', label: 'Uploaded At', formatter: 'formatDateTime' },
  { key: 'actions', label: '', thStyle: { width: '8em' } }
]

function formatDateTime(value) {
  if (!value) return '—'
  const date = new Date(value)
  return date.toLocaleString('en-US', { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })
}

async function fetchItems(id) {
  if (!id) return
  try {
    const { data } = await api.get(`accounts/companies/${id}/personnel/`)
    items.value = data.map(item => ({
      ...item,
      resume_url: item.resume // assume serializer exposes absolute URL
    }))
  } catch {
    toast.add({ severity: 'error', summary: 'Error', detail: 'Could not load personnel.' })
  }
}

onMounted(() => fetchItems(companyId.value))
watch(companyId, fetchItems)

function openNew() {
  editing.value = false
  Object.assign(form, {
    uuid: null,
    first_name: '',
    last_name: '',
    position: '',
    email: '',
    phone_number: '',
    years_of_experience: 0,
    qualifications: '',
    resume: null,
    resume_url: null
  })
  Object.assign(formErrors, {})
  showDialog.value = true
}

function onEdit(item) {
  editing.value = true
  Object.assign(form, {
    uuid: item.uuid,
    first_name: item.first_name,
    last_name: item.last_name,
    position: item.position,
    email: item.email,
    phone_number: item.phone_number,
    years_of_experience: item.years_of_experience,
    qualifications: item.qualifications,
    resume: null, // reset file input
    resume_url: item.resume
  })
  Object.assign(formErrors, {})
  showDialog.value = true
}

async function save() {
  formErrors.first_name = form.first_name ? undefined : 'First name is required'
  formErrors.last_name = form.last_name ? undefined : 'Last name is required'
  formErrors.position = form.position ? undefined : 'Position is required'
  formErrors.email = undefined
  formErrors.phone_number = undefined
  formErrors.years_of_experience = undefined
  formErrors.qualifications = undefined

  if (form.years_of_experience < 0) {
    formErrors.years_of_experience = 'Years of experience cannot be negative'
  }

  if (Object.values(formErrors).some(err => err)) {
    toast.add({ severity: 'warn', summary: 'Validation Error', detail: 'Please fill all required fields correctly.' })
    return
  }

  const base = `accounts/companies/${companyId.value}/personnel`
  const formData = new FormData()
  formData.append('first_name', form.first_name)
  formData.append('last_name', form.last_name)
  formData.append('position', form.position)
  if (form.email) formData.append('email', form.email)
  if (form.phone_number) formData.append('phone_number', form.phone_number)
  formData.append('years_of_experience', form.years_of_experience)
  if (form.qualifications) formData.append('qualifications', form.qualifications)
  if (form.resume instanceof File) formData.append('resume', form.resume)

  try {
    if (editing.value) {
      await api.patch(`${base}/${form.uuid}/`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      })
      toast.add({ severity: 'success', summary: 'Updated' })
    } else {
      await api.post(`${base}/`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      })
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
    await api.delete(`${base}/${item.uuid}/`)
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