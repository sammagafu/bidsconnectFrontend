<template>
  <VerticalLayout>
    <b-card class="mt-4">
      <!-- Header + Create Button -->
      <div class="d-flex justify-content-between align-items-center mb-3">
        <h2 class="mb-0">Litigation Records</h2>
        <b-button variant="success" size="sm" @click="openNew">
          <i class="bx bx-plus"></i> Create
        </b-button>
      </div>

      <!-- Litigations Table -->
      <b-table :items="items" :fields="fields" striped hover small responsive>
        <template #cell(index)="data">
          {{ data.index + 1 }}
        </template>
        <template #cell(description)="data">
          {{ truncate(data.item.description, 50) }}
        </template>
        <template #cell(outcome)="data">
          {{ truncate(data.item.outcome, 50) }}
        </template>
        <template #cell(amount_involved)="data">
          {{ data.item.amount_involved ? `${data.item.amount_involved} ${data.item.currency}` : '—' }}
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
    <b-modal v-model="showDialog" :title="editing ? 'Edit Litigation' : 'New Litigation'" hide-footer>
      <b-form @submit.prevent="save">
        <div class="mb-3">
          <b-form-group
            label="Case Number*"
            label-for="case_number"
            :state="formErrors.case_number === undefined"
            :invalid-feedback="formErrors.case_number || ''"
          >
            <b-form-input
              id="case_number"
              v-model="form.case_number"
              :state="formErrors.case_number === undefined"
              required
            />
          </b-form-group>

          <b-form-group
            label="Description*"
            label-for="description"
            :state="formErrors.description === undefined"
            :invalid-feedback="formErrors.description || ''"
          >
            <b-form-textarea
              id="description"
              v-model="form.description"
              rows="3"
              :state="formErrors.description === undefined"
              required
            />
          </b-form-group>
        </div>

        <div class="row">
          <div class="col-md-4 mb-3">
            <b-form-group
              label="Filed Date*"
              label-for="filed_date"
              :state="formErrors.filed_date === undefined"
              :invalid-feedback="formErrors.filed_date || ''"
            >
              <b-form-input
                type="date"
                id="filed_date"
                v-model="form.filed_date"
                :state="formErrors.filed_date === undefined"
                required
              />
            </b-form-group>
          </div>
          <div class="col-md-4 mb-3">
            <b-form-group
              label="Resolution Date"
              label-for="resolution_date"
              :state="formErrors.resolution_date === undefined"
              :invalid-feedback="formErrors.resolution_date || ''"
            >
              <b-form-input
                type="date"
                id="resolution_date"
                v-model="form.resolution_date"
                :state="formErrors.resolution_date === undefined"
              />
            </b-form-group>
          </div>
          <div class="col-md-4 mb-3">
            <b-form-group
              label="Status*"
              label-for="status"
              :state="formErrors.status === undefined"
              :invalid-feedback="formErrors.status || ''"
            >
              <b-form-select
                id="status"
                v-model="form.status"
                :options="statusOptions"
                :state="formErrors.status === undefined"
                required
              />
            </b-form-group>
          </div>
        </div>

        <div class="mb-3">
          <b-form-group
            label="Outcome"
            label-for="outcome"
            :state="formErrors.outcome === undefined"
            :invalid-feedback="formErrors.outcome || ''"
          >
            <b-form-textarea
              id="outcome"
              v-model="form.outcome"
              rows="3"
              :state="formErrors.outcome === undefined"
            />
          </b-form-group>
        </div>

        <div class="row">
          <div class="col-md-6 mb-3">
            <b-form-group
              label="Amount Involved"
              label-for="amount_involved"
              :state="formErrors.amount_involved === undefined"
              :invalid-feedback="formErrors.amount_involved || ''"
            >
              <b-form-input
                type="number"
                id="amount_involved"
                v-model="form.amount_involved"
                step="0.01"
                min="0"
                :state="formErrors.amount_involved === undefined"
              />
            </b-form-group>
          </div>
          <div class="col-md-6 mb-3">
            <b-form-group
              label="Currency"
              label-for="currency"
              :state="formErrors.currency === undefined"
              :invalid-feedback="formErrors.currency || ''"
            >
              <b-form-input
                id="currency"
                v-model="form.currency"
                maxlength="10"
                :state="formErrors.currency === undefined"
              />
            </b-form-group>
          </div>
        </div>

        <div class="mb-3">
          <b-form-group label="Proof" label-for="proof">
            <b-form-file
              id="proof"
              v-model="form.proof"
              accept=".pdf,.doc,.docx,.jpg,.png"
              placeholder="Choose a file or drop it here..."
              drop-placeholder="Drop file here..."
            />
            <small v-if="editing && form.proof_url" class="form-text text-muted">
              Current file: <a :href="form.proof_url" target="_blank">View</a>
            </small>
          </b-form-group>
        </div>

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
  case_number: '',
  description: '',
  status: '',
  filed_date: null,
  resolution_date: null,
  outcome: '',
  amount_involved: null,
  currency: 'USD',
  proof: null,
  proof_url: null, // for display when editing
})

// form errors
const formErrors = reactive({})

// status dropdown options
const statusOptions = [
  { value: 'pending', text: 'Pending' },
  { value: 'resolved', text: 'Resolved' },
  { value: 'dismissed', text: 'Dismissed' },
]

const fields = [
  { key: 'index', label: 'No', thStyle: { width: '4em' } },
  { key: 'case_number', label: 'Case Number' },
  { key: 'description', label: 'Description' },
  { key: 'status', label: 'Status', formatter: value => value ? value.charAt(0).toUpperCase() + value.slice(1) : '' },
  { key: 'filed_date', label: 'Filed Date', formatter: 'formatDate' },
  { key: 'resolution_date', label: 'Resolution Date', formatter: 'formatDate' },
  { key: 'outcome', label: 'Outcome' },
  { key: 'amount_involved', label: 'Amount' },
  { key: 'uploaded_at', label: 'Uploaded At', formatter: 'formatDateTime' },
  { key: 'actions', label: '', thStyle: { width: '8em' } }
]

function formatDate(value) {
  if (!value) return '—'
  const date = new Date(value)
  return date.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })
}

function formatDateTime(value) {
  if (!value) return '—'
  const date = new Date(value)
  return date.toLocaleString('en-US', { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })
}

function truncate(text, length) {
  return text.length > length ? text.substring(0, length) + '...' : text
}

async function fetchItems(id) {
  if (!id) return
  try {
    const { data } = await api.get(`accounts/companies/${id}/litigations/`)
    items.value = data.map(item => ({
      ...item,
      proof_url: item.proof // assume serializer exposes proof url
    }))
  } catch {
    toast.add({ severity: 'error', summary: 'Error', detail: 'Could not load litigations.' })
  }
}

onMounted(() => fetchItems(companyId.value))
watch(companyId, fetchItems)

function openNew() {
  editing.value = false
  Object.assign(form, {
    id: null,
    case_number: '',
    description: '',
    status: '',
    filed_date: null,
    resolution_date: null,
    outcome: '',
    amount_involved: null,
    currency: 'USD',
    proof: null,
    proof_url: null,
  })
  Object.assign(formErrors, {})
  showDialog.value = true
}

function onEdit(item) {
  editing.value = true
  Object.assign(form, {
    id: item.id,
    case_number: item.case_number,
    description: item.description,
    status: item.status,
    filed_date: item.filed_date,
    resolution_date: item.resolution_date,
    outcome: item.outcome,
    amount_involved: item.amount_involved,
    currency: item.currency,
    proof: null, // reset file input
    proof_url: item.proof,
  })
  Object.assign(formErrors, {})
  showDialog.value = true
}

async function save() {
  formErrors.case_number = form.case_number ? undefined : 'Case number is required'
  formErrors.description = form.description ? undefined : 'Description is required'
  formErrors.filed_date = form.filed_date ? undefined : 'Filed date is required'
  formErrors.status = form.status ? undefined : 'Status is required'
  formErrors.resolution_date = undefined
  formErrors.outcome = undefined
  formErrors.amount_involved = undefined
  formErrors.currency = undefined

  if (form.resolution_date && form.filed_date && form.resolution_date < form.filed_date) {
    formErrors.resolution_date = 'Resolution date cannot be before filed date'
  }
  if (form.amount_involved !== null && form.amount_involved < 0) {
    formErrors.amount_involved = 'Amount cannot be negative'
  }
  if (form.currency && form.currency.length > 10) {
    formErrors.currency = 'Currency code too long'
  }

  if (Object.values(formErrors).some(err => err)) {
    toast.add({ severity: 'warn', summary: 'Validation Error', detail: 'Please fill all required fields correctly.' })
    return
  }

  const base = `accounts/companies/${companyId.value}/litigations`
  const formData = new FormData()
  formData.append('case_number', form.case_number)
  formData.append('description', form.description)
  formData.append('status', form.status)
  formData.append('filed_date', form.filed_date)
  if (form.resolution_date) formData.append('resolution_date', form.resolution_date)
  if (form.outcome) formData.append('outcome', form.outcome)
  if (form.amount_involved !== null) formData.append('amount_involved', form.amount_involved)
  formData.append('currency', form.currency)
  if (form.proof instanceof File) formData.append('proof', form.proof)

  try {
    let response
    if (editing.value) {
      response = await api.patch(`${base}/${form.id}/`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      })
      toast.add({ severity: 'success', summary: 'Updated' })
    } else {
      response = await api.post(`${base}/`, formData, {
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
  if (!confirm(`Delete litigation "${item.case_number}"?`)) return
  const base = `accounts/companies/${companyId.value}/litigations`
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