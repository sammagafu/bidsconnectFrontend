<template>
  <VerticalLayout>
    <b-card class="mt-4">
      <!-- Header + Create Button -->
      <div class="d-flex justify-content-between align-items-center mb-3">
        <h2 class="mb-0">Annual Turnover</h2>
        <b-button variant="success" size="sm" @click="openNew">
          <i class="bx bx-plus"></i> Create
        </b-button>
      </div>

      <!-- Turnover Table -->
      <b-table
        :items="items"
        :fields="tableFields"
        striped hover small responsive
      >
        <template #cell(index)="row">
          {{ row.index + 1 }}
        </template>
        <template #cell(year)="row">
          {{ row.item.year }}
        </template>
        <template #cell(amount)="row">
          {{ formatCurrency(row.item.amount, row.item.currency) }}
        </template>
        <template #cell(proof)="row">
          <span v-if="row.item.proof">
            <a :href="row.item.proof" target="_blank">Download</a>
          </span>
          <span v-else class="text-muted">—</span>
        </template>
        <template #cell(uploaded_at)="row">
          {{ formatDate(row.item.uploaded_at) }}
        </template>
        <template #cell(actions)="row">
          <b-button
            size="sm"
            variant="outline-primary"
            class="me-2"
            @click="onEdit(row.item)"
            v-b-tooltip.hover
            title="Edit"
          >
            <i class="bx bx-pencil"></i>
          </b-button>
          <b-button
            size="sm"
            variant="outline-danger"
            @click="onDelete(row.item)"
            v-b-tooltip.hover
            title="Delete"
          >
            <i class="bx bx-trash"></i>
          </b-button>
        </template>
      </b-table>
    </b-card>

    <!-- Create / Edit Modal -->
    <b-modal
      v-model="showDialog"
      :title="editing ? 'Edit Turnover' : 'New Turnover'"
      hide-footer
    >
      <b-form @submit.prevent="save" enctype="multipart/form-data">
        <b-row>
          <!-- Year -->
          <b-col md="4" class="mb-3">
            <b-form-group label="Year*" label-for="year">
              <b-form-input
                id="year"
                v-model.number="form.year"
                type="number"
                min="1900"
                :max="currentYear"
                required
              />
            </b-form-group>
          </b-col>

          <!-- Amount -->
          <b-col md="4" class="mb-3">
            <b-form-group label="Amount*" label-for="amount">
              <b-form-input
                id="amount"
                v-model.number="form.amount"
                type="number"
                min="0"
                step="0.01"
                required
              />
            </b-form-group>
          </b-col>

          <!-- Currency -->
          <b-col md="4" class="mb-3">
            <b-form-group label="Currency*" label-for="currency">
              <b-form-select
                id="currency"
                v-model="form.currency"
                :options="currencyOptions"
                required
              />
            </b-form-group>
          </b-col>

          <!-- Proof File -->
          <b-col md="12" class="mb-3">
            <b-form-group label="Proof Document" label-for="proof">
              <b-form-file
                id="proof"
                v-model="form.proof"
                accept=".pdf,.jpg,.png"
              />
            </b-form-group>
          </b-col>
        </b-row>

        <div class="d-flex justify-content-end mt-4">
          <b-button variant="secondary" class="me-2" @click="cancel">
            Cancel
          </b-button>
          <b-button variant="primary" type="submit">
            Save
          </b-button>
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
  year: null,
  amount: null,
  currency: 'USD',
  proof: null,
})

// currency choices
const currencyOptions = [
  { value: 'USD', text: 'US Dollar (USD)' },
  { value: 'EUR', text: 'Euro (EUR)' },
  { value: 'GBP', text: 'British Pound (GBP)' },
  { value: 'TSH', text: 'Tanzanian Shilling (TSH)' },
]

// table columns
const tableFields = [
  { key: 'index', label: 'No', thStyle: { width: '4em' } },
  { key: 'year', label: 'Year' },
  { key: 'amount', label: 'Amount' },
  { key: 'proof', label: 'Proof' },
  { key: 'uploaded_at', label: 'Uploaded At' },
  { key: 'actions', label: '', thStyle: { width: '8em' } },
]

const currentYear = new Date().getFullYear()

// fetch existing turnovers
async function fetchItems(id) {
  if (!id) return
  try {
    const { data } = await api.get(
      `accounts/companies/${id}/annual-turnovers/`
    )
    items.value = data.sort((a, b) => b.year - a.year) // sort descending by year
  } catch {
    toast.add({
      severity: 'error',
      summary: 'Error',
      detail: 'Could not load turnover data.',
    })
  }
}

onMounted(() => fetchItems(companyId.value))
watch(companyId, fetchItems)

// open blank form
function openNew() {
  editing.value = false
  Object.assign(form, { id: null, year: currentYear, amount: null, currency: 'USD', proof: null })
  showDialog.value = true
}

// populate form for editing
function onEdit(item) {
  editing.value = true
  Object.assign(form, { id: item.id, year: item.year, amount: item.amount, currency: item.currency, proof: null })
  showDialog.value = true
}

// save (create or update)
async function save() {
  if (form.year == null || form.amount == null || !form.currency) {
    toast.add({
      severity: 'warn',
      summary: 'Validation',
      detail: 'Please fill all required fields.',
    })
    return
  }

  const base = `accounts/companies/${companyId.value}/annual-turnovers`
  const payload = new FormData()
  payload.append('year', form.year)
  payload.append('amount', form.amount)
  payload.append('currency', form.currency)
  if (form.proof) payload.append('proof', form.proof)

  try {
    if (editing.value) {
      await api.patch(`${base}/${form.id}/`, payload, {
        headers: { 'Content-Type': 'multipart/form-data' },
      })
      toast.add({
        severity: 'success',
        summary: 'Updated',
        detail: `Turnover for ${form.year} updated.`,
      })
    } else {
      await api.post(`${base}/`, payload, {
        headers: { 'Content-Type': 'multipart/form-data' },
      })
      toast.add({
        severity: 'success',
        summary: 'Created',
        detail: `Turnover for ${form.year} created.`,
      })
    }
    showDialog.value = false
    fetchItems(companyId.value)
  } catch (err) {
    toast.add({
      severity: 'error',
      summary: 'Error',
      detail: err.response?.data?.detail || 'Operation failed.',
    })
  }
}

// delete record
async function onDelete(item) {
  if (!confirm(`Delete turnover for ${item.year}?`)) return
  try {
    await api.delete(
      `accounts/companies/${companyId.value}/annual-turnovers/${item.id}/`
    )
    toast.add({
      severity: 'success',
      summary: 'Deleted',
      detail: `Turnover for ${item.year} removed.`,
    })
    fetchItems(companyId.value)
  } catch {
    toast.add({
      severity: 'error',
      summary: 'Error',
      detail: 'Delete failed.',
    })
  }
}

// cancel form
function cancel() {
  showDialog.value = false
}

// utility formatters
function formatCurrency(amount, currency) {
  return `${parseFloat(amount).toLocaleString()} ${currency}`
}

function formatDate(dateStr) {
  return new Date(dateStr).toLocaleString()
}
</script>

<style scoped>
.b-form-group {
  margin-bottom: 1rem;
}
</style>