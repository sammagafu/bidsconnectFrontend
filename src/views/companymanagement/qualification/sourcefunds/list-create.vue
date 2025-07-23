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
      <b-table :items="items" :fields="tableFields" striped hover small responsive>
        <template #cell(index)="row">{{ row.index + 1 }}</template>
        <template #cell(source_type)="row">{{ row.item.source_type_display }}</template>
        <template #cell(amount)="row">{{ formatCurrency(row.item.amount, row.item.currency) }}</template>
        <template #cell(currency)="row">{{ row.item.currency }}</template>
        <template #cell(proof)="row">
          <a v-if="row.item.proof" :href="row.item.proof" target="_blank">Download</a>
          <span v-else class="text-muted">—</span>
        </template>
        <template #cell(uploaded_at)="row">{{ formatDate(row.item.uploaded_at) }}</template>
        <template #cell(actions)="row">
          <b-button size="sm" variant="outline-primary" class="me-2"
                    @click="onEdit(row.item)" v-b-tooltip.hover title="Edit">
            <i class="bx bx-pencil"></i>
          </b-button>
          <b-button size="sm" variant="outline-danger"
                    @click="onDelete(row.item)" v-b-tooltip.hover title="Delete">
            <i class="bx bx-trash"></i>
          </b-button>
        </template>
      </b-table>
    </b-card>

    <!-- Create/Edit Modal -->
    <b-modal v-model="showDialog" :title="editing ? 'Edit Source' : 'New Source'" hide-footer>
      <b-form @submit.prevent="save">
        <b-row>
          <!-- Source Type -->
          <b-col md="6" class="mb-3">
            <b-form-group label="Source Type*" label-for="source_type">
              <b-form-select id="source_type"
                             v-model="form.source_type"
                             :options="typeOptions"
                             required />
            </b-form-group>
          </b-col>

          <!-- Amount -->
          <b-col md="6" class="mb-3">
            <b-form-group label="Amount*" label-for="amount">
              <b-form-input id="amount"
                            v-model.number="form.amount"
                            type="number"
                            min="0"
                            step="0.01"
                            required />
            </b-form-group>
          </b-col>

          <!-- Currency -->
          <b-col md="6" class="mb-3">
            <b-form-group label="Currency*" label-for="currency">
              <b-form-input id="currency" v-model="form.currency" required />
            </b-form-group>
          </b-col>

          <!-- Proof File -->
          <b-col md="6" class="mb-3">
            <b-form-group label="Proof Document*" label-for="proof">
              <b-form-file id="proof"
                           v-model="form.proof"
                           accept=".pdf,.jpg,.png"
                           :state="proofState"
                           placeholder="Choose file..."
                           required />
              <small v-if="editing && !form.proof && form._existing_proof">
                Current: <a :href="form._existing_proof" target="_blank">Download</a>
              </small>
            </b-form-group>
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
  source_type: '',
  amount: null,
  currency: '',
  proof: null,
  // store existing URL when editing
  _existing_proof: null,
})

const typeOptions = [
  { value: 'cash_and_bank', text: 'Cash and Bank' },
  { value: 'grant',          text: 'Grant' },
  { value: 'inventories',    text: 'Inventories' },
]

const tableFields = [
  { key: 'index',       label: 'No',           thStyle: { width: '4em' } },
  { key: 'source_type', label: 'Type' },
  { key: 'amount',      label: 'Amount' },
  { key: 'currency',    label: 'Currency' },
  { key: 'proof',       label: 'Proof' },
  { key: 'uploaded_at', label: 'Uploaded At' },
  { key: 'actions',     label: '',             thStyle: { width: '8em' } },
]

function formatDate(dt) {
  return dt ? new Date(dt).toISOString().slice(0,10) : ''
}

function formatCurrency(amount, cur) {
  return `${parseFloat(amount).toLocaleString()} ${cur}`
}

async function fetchItems(id) {
  if (!id) return
  try {
    const { data } = await api.get(`accounts/companies/${id}/sources-of-fund/`)
    // expose display name
    items.value = data.map(d => ({
      ...d,
      source_type_display: typeOptions.find(o => o.value===d.source_type)?.text || d.source_type
    }))
  } catch {
    toast.add({ severity: 'error', summary: 'Error', detail: 'Could not load sources.' })
  }
}

onMounted(() => fetchItems(companyId.value))
watch(companyId, fetchItems)

function openNew() {
  editing.value = false
  Object.assign(form, {
    id: null,
    source_type: '',
    amount: null,
    currency: '',
    proof: null,
    _existing_proof: null,
  })
  showDialog.value = true
}

function onEdit(item) {
  editing.value = true
  Object.assign(form, {
    id: item.id,
    source_type: item.source_type,
    amount: item.amount,
    currency: item.currency,
    proof: null,
    _existing_proof: item.proof,
  })
  showDialog.value = true
}

const proofState = computed(() => editing.value ? null : Boolean(form.proof))

async function save() {
  // validation
  if (!form.source_type || form.amount == null || !form.currency || (!form.proof && !form._existing_proof)) {
    toast.add({ severity: 'warn', summary: 'Validation', detail: 'Please fill all required fields.' })
    return
  }

  // build payload
  const payload = new FormData()
  payload.append('source_type', form.source_type)
  payload.append('amount', form.amount)
  payload.append('currency', form.currency)
  if (form.proof) payload.append('proof', form.proof)

  const base = `accounts/companies/${companyId.value}/sources-of-fund`
  try {
    if (editing.value) {
      await api.patch(`${base}/${form.id}/`, payload, {
        headers: { 'Content-Type': 'multipart/form-data' }
      })
      toast.add({ severity: 'success', summary: 'Updated' })
    } else {
      await api.post(`${base}/`, payload, {
        headers: { 'Content-Type': 'multipart/form-data' }
      })
      toast.add({ severity: 'success', summary: 'Created' })
    }
    showDialog.value = false
    fetchItems(companyId.value)
  } catch (e) {
    const msg = e.response?.data?.detail || 'Save failed.'
    toast.add({ severity: 'error', summary: 'Error', detail: msg })
  }
}

async function onDelete(item) {
  if (!confirm(`Delete source "${item.source_type_display}"?`)) return
  const base = `accounts/companies/${companyId.value}/sources-of-fund`
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
.b-form-group { margin-bottom: 1rem; }
</style>
