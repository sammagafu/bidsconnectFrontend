<template>
  <VerticalLayout>
    <b-card class="mt-4">
      <!-- Header + Create Button -->
      <div class="d-flex justify-content-between align-items-center mb-3">
        <h2 class="mb-0">Office Locations</h2>
        <b-button variant="success" size="sm" @click="openNew">
          <i class="bx bx-plus"></i> Create
        </b-button>
      </div>

      <!-- Offices Table -->
      <b-table :items="items" :fields="fields" striped hover small responsive>
        <template #cell(index)="data">
          {{ data.index + 1 }}
        </template>
        <template #cell(is_headquarters)="data">
          {{ data.item.is_headquarters ? 'Yes' : 'No' }}
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
    <b-modal v-model="showDialog" :title="editing ? 'Edit Office' : 'New Office'" hide-footer>
      <b-form @submit.prevent="save">
        <b-row>
          <b-col md="6" class="mb-3">
            <b-form-group
              label="Name*"
              label-for="name"
              :state="formErrors.name === undefined"
              :invalid-feedback="formErrors.name || ''"
            >
              <b-form-input
                id="name"
                v-model="form.name"
                :state="formErrors.name === undefined"
                required
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
          <b-col cols="12" class="mb-3">
            <b-form-group
              label="Address*"
              label-for="address"
              :state="formErrors.address === undefined"
              :invalid-feedback="formErrors.address || ''"
            >
              <b-form-textarea
                id="address"
                v-model="form.address"
                rows="3"
                :state="formErrors.address === undefined"
                required
              />
            </b-form-group>
          </b-col>
          <b-col md="4" class="mb-3">
            <b-form-group
              label="City*"
              label-for="city"
              :state="formErrors.city === undefined"
              :invalid-feedback="formErrors.city || ''"
            >
              <b-form-input
                id="city"
                v-model="form.city"
                :state="formErrors.city === undefined"
                required
              />
            </b-form-group>
          </b-col>
          <b-col md="4" class="mb-3">
            <b-form-group
              label="Country*"
              label-for="country"
              :state="formErrors.country === undefined"
              :invalid-feedback="formErrors.country || ''"
            >
              <b-form-input
                id="country"
                v-model="form.country"
                :state="formErrors.country === undefined"
                required
              />
            </b-form-group>
          </b-col>
          <b-col md="4" class="mb-3">
            <b-form-group
              label="Postal Code"
              label-for="postal_code"
              :state="formErrors.postal_code === undefined"
              :invalid-feedback="formErrors.postal_code || ''"
            >
              <b-form-input
                id="postal_code"
                v-model="form.postal_code"
                :state="formErrors.postal_code === undefined"
              />
            </b-form-group>
          </b-col>
          <b-col cols="12" class="mb-3">
            <b-form-checkbox
              id="is_headquarters"
              v-model="form.is_headquarters"
              switch
            >
              Is Headquarters
            </b-form-checkbox>
          </b-col>
        </b-row>

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
  id: null,
  name: '',
  address: '',
  city: '',
  country: '',
  postal_code: '',
  phone_number: '',
  is_headquarters: false
})

// form errors
const formErrors = reactive({})

const fields = [
  { key: 'index', label: 'No', thStyle: { width: '4em' } },
  { key: 'name', label: 'Name' },
  { key: 'city', label: 'City' },
  { key: 'country', label: 'Country' },
  { key: 'phone_number', label: 'Phone Number' },
  { key: 'is_headquarters', label: 'Headquarters' },
  { key: 'created_at', label: 'Created At', formatter: 'formatDateTime' },
  { key: 'updated_at', label: 'Updated At', formatter: 'formatDateTime' },
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
    const { data } = await api.get(`accounts/companies/${id}/offices/`)
    items.value = data
  } catch {
    toast.add({ severity: 'error', summary: 'Error', detail: 'Could not load offices.' })
  }
}

onMounted(() => fetchItems(companyId.value))
watch(companyId, fetchItems)

function openNew() {
  editing.value = false
  Object.assign(form, {
    id: null,
    name: '',
    address: '',
    city: '',
    country: '',
    postal_code: '',
    phone_number: '',
    is_headquarters: false
  })
  Object.assign(formErrors, {})
  showDialog.value = true
}

function onEdit(item) {
  editing.value = true
  Object.assign(form, item)
  Object.assign(formErrors, {})
  showDialog.value = true
}

async function save() {
  formErrors.name = form.name ? undefined : 'Name is required'
  formErrors.address = form.address ? undefined : 'Address is required'
  formErrors.city = form.city ? undefined : 'City is required'
  formErrors.country = form.country ? undefined : 'Country is required'
  formErrors.postal_code = undefined
  formErrors.phone_number = undefined

  if (Object.values(formErrors).some(err => err)) {
    toast.add({ severity: 'warn', summary: 'Validation Error', detail: 'Please fill all required fields correctly.' })
    return
  }

  const base = `accounts/companies/${companyId.value}/offices`
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
  if (!confirm(`Delete office "${item.name}"?`)) return
  const base = `accounts/companies/${companyId.value}/offices`
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