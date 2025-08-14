<template>
  <VerticalLayout>
    <b-card class="mt-4">
      <!-- Header + Create Button -->
      <div class="d-flex justify-content-between align-items-center mb-3">
        <h2 class="mb-0">Sources of Funds</h2>
        <b-button variant="success" size="sm" @click="openNew">
          <i class="bx bx-plus"></i> Create
        </b-button>
      </div>
      <!-- Sources Table -->
      <b-table
        :items="items"
        :fields="tableFields"
        striped hover small responsive
      >
        <template #cell(index)="row">
          {{ row.index + 1 }}
        </template>
        <template #cell(source_type)="row">
          {{ sourceTypeLabel(row.item.source_type) }}
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
      :title="editing ? 'Edit Source of Fund' : 'New Source of Fund'"
      hide-footer
    >
      <b-form @submit.prevent="save" enctype="multipart/form-data">
        <b-row>
          <!-- Source Type -->
          <b-col md="6" class="mb-3">
            <b-form-group label="Source Type*" label-for="source_type">
              <b-form-select
                id="source_type"
                v-model="form.source_type"
                :options="sourceTypeOptions"
                required
              />
            </b-form-group>
          </b-col>
          <!-- Amount -->
          <b-col md="6" class="mb-3">
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
          <b-col md="6" class="mb-3">
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
          <b-col md="6" class="mb-3">
            <b-form-group label="Proof Document*" label-for="proof">
              <b-form-file
                id="proof"
                v-model="form.proof"
                :state="Boolean(form.proof)"
                accept=".pdf,.jpg,.png"
                required
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
  source_type: '',
  amount: null,
  currency: 'USD',
  proof: null,
})

// source type choices
const sourceTypeOptions = [
  { value: 'cash_and_bank', text: 'Cash and Bank' },
  { value: 'grant', text: 'Grant' },
  { value: 'inventories', text: 'Inventories' },
]

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
  { key: 'source_type', label: 'Type' },
  { key: 'amount', label: 'Amount' },
  { key: 'proof', label: 'Proof' },
  { key: 'uploaded_at', label: 'Uploaded At' },
  { key: 'actions', label: '', thStyle: { width: '8em' } },
]

// fetch existing sources
async function fetchItems(id) {
  if (!id) return
  try {
    const { data } = await api.get(
      `accounts/companies/${id}/sources-of-fund`
    )
    items.value = data
  } catch {
    toast.add({
      severity: 'error',
      summary: 'Error',
      detail: 'Could not load sources of funds.',
    })
  }
}

onMounted(() => fetchItems(companyId.value))
watch(companyId, fetchItems)

// open blank form
function openNew() {
  editing.value = false
  Object.assign(form, {
    id: null,
    source_type: '',
    amount: null,
    currency: 'USD',
    proof: null,
  })
  showDialog.value = true
}

// populate form for editing
function onEdit(item) {
  editing.value = true
  Object.assign(form, {
    id: item.id,
    source_type: item.source_type,
    amount: item.amount,
    currency: item.currency,
    proof: null,
  })
  showDialog.value = true
}

// save (create or update)
async function save() {
  if (!form.source_type || form.amount == null || !form.currency || !form.proof) {
    toast.add({
      severity: 'warn',
      summary: 'Validation',
      detail: 'Please fill all required fields.',
    })
    return
  }
  const base = `accounts/companies/${companyId.value}/sources-of-fund`
  const payload = new FormData()
  payload.append('source_type', form.source_type)
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
        detail: 'Source of fund updated.',
      })
    } else {
      await api.post(`${base}/`, payload, {
        headers: { 'Content-Type': 'multipart/form-data' },
      })
      toast.add({
        severity: 'success',
        summary: 'Created',
        detail: 'Source of fund created.',
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
  if (!confirm(`Delete source "${sourceTypeLabel(item.source_type)}"?`)) return
  try {
    await api.delete(
      `accounts/companies/${companyId.value}/sources-of-fund/${item.id}/`
    )
    toast.add({
      severity: 'success',
      summary: 'Deleted',
      detail: 'Record removed.',
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

// utilities
function sourceTypeLabel(value) {
  const opt = sourceTypeOptions.find(o => o.value === value)
  return opt ? opt.text : value
}

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