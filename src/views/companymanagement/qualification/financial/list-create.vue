<template>
  <VerticalLayout>
    <b-card class="mt-4">
      <!-- Header + Create Button -->
      <div class="d-flex justify-content-between align-items-center mb-3">
        <h2 class="mb-0">Financial Information</h2>
        <b-button variant="success" size="sm" @click="openNew">
          <i class="bx bx-plus"></i> Create
        </b-button>
      </div>

      <!-- DataTable -->
      <b-table :items="statements" :fields="fields" striped hover small responsive>
        <template #cell(index)="data">
          {{ data.index + 1 }}
        </template>
        <template #cell(file)="data">
          <span v-if="data.item.file">
            <a :href="data.item.file" target="_blank">Download</a>
          </span>
          <span v-else class="text-muted">-</span>
        </template>
        <template #cell(audit_report)="data">
          <span v-if="data.item.audit_report">
            <a :href="data.item.audit_report" target="_blank">Download</a>
          </span>
          <span v-else class="text-muted">-</span>
        </template>
        <template #cell(actions)="data">
          <b-button size="sm" variant="outline-primary" class="me-2" @click="onEdit(data.item)" v-b-tooltip.hover title="Edit">
            <i class="bx bx-pencil"></i>
          </b-button>
          <b-button size="sm" variant="outline-danger" @click="onDelete(data.item)" v-b-tooltip.hover title="Delete">
            <i class="bx bx-trash"></i>
          </b-button>
        </template>
      </b-table>
    </b-card>

    <!-- Create/Edit Modal -->
    <b-modal v-model="showDialog" :title="isEditing ? 'Edit Statement' : 'New Statement'" hide-footer>
      <b-form @submit.prevent="saveStatement">
        <div class="mb-3">
          <b-form-group label="Year" label-for="year" class="mb-3">
            <b-form-input id="year" v-model="form.year" type="number" min="2000" max="2100" required />
          </b-form-group>
          <b-form-group label="Currency" label-for="currency" class="mb-3">
            <b-form-select id="currency" v-model="form.currency" :options="currencyOptions" required />
          </b-form-group>
        </div>
        <div class="row">
          <div class="col-md-6 mb-3">
            <b-form-group label="Total Assets" label-for="total_assets">
              <b-form-input id="total_assets" v-model="form.total_assets" type="number" min="0" step="0.01" required />
            </b-form-group>
          </div>
          <div class="col-md-6 mb-3">
            <b-form-group label="Total Liabilities" label-for="total_liabilities">
              <b-form-input id="total_liabilities" v-model="form.total_liabilities" type="number" min="0" step="0.01" required />
            </b-form-group>
          </div>
          <div class="col-md-6 mb-3">
            <b-form-group label="Total Equity" label-for="total_equity">
              <b-form-input id="total_equity" v-model="form.total_equity" type="number" min="0" step="0.01" required />
            </b-form-group>
          </div>
          <div class="col-md-6 mb-3">
            <b-form-group label="Gross Profit" label-for="gross_profit">
              <b-form-input id="gross_profit" v-model="form.gross_profit" type="number" min="0" step="0.01" required />
            </b-form-group>
          </div>
          <div class="col-md-6 mb-3">
            <b-form-group label="Profit Before Tax" label-for="profit_before_tax">
              <b-form-input id="profit_before_tax" v-model="form.profit_before_tax" type="number" step="0.01" required />
            </b-form-group>
          </div>
          <div class="col-md-6 mb-3">
            <b-form-group label="Cash Flow" label-for="cash_flow">
              <b-form-input id="cash_flow" v-model="form.cash_flow" type="number" step="0.01" required />
            </b-form-group>
          </div>
        </div>
        <div class="row">
          <div class="col-md-6 mb-3">
            <b-form-group label="Financial Statement File" label-for="file">
              <b-form-file id="file" v-model="form.file" :state="Boolean(form.file)" accept=".pdf,.doc,.docx,.xls,.xlsx" />
            </b-form-group>
          </div>
          <div class="col-md-6 mb-3">
            <b-form-group label="Audit Report" label-for="audit_report">
              <b-form-file id="audit_report" v-model="form.audit_report" :state="Boolean(form.audit_report)" accept=".pdf,.doc,.docx,.xls,.xlsx" />
            </b-form-group>
          </div>
        </div>
        <div class="d-flex justify-content-end mt-4">
          <b-button variant="secondary" class="me-2" @click="showDialog = false">Cancel</b-button>
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

const statements = ref([])
const showDialog = ref(false)
const isEditing = ref(false)

// form model
const form = reactive({
  year: null,
  currency: '',
  total_assets: null,
  total_liabilities: null,
  total_equity: null,
  gross_profit: null,
  profit_before_tax: null,
  cash_flow: null,
  file: null,
  audit_report: null,
})

// Add top world currencies and TSH
const currencyOptions = [
  { value: 'USD', text: 'US Dollar (USD)' },
  { value: 'EUR', text: 'Euro (EUR)' },
  { value: 'GBP', text: 'British Pound (GBP)' },
  { value: 'JPY', text: 'Japanese Yen (JPY)' },
  { value: 'CNY', text: 'Chinese Yuan (CNY)' },
  { value: 'CHF', text: 'Swiss Franc (CHF)' },
  { value: 'CAD', text: 'Canadian Dollar (CAD)' },
  { value: 'AUD', text: 'Australian Dollar (AUD)' },
  { value: 'INR', text: 'Indian Rupee (INR)' },
  { value: 'ZAR', text: 'South African Rand (ZAR)' },
  { value: 'TSH', text: 'Tanzanian Shilling (TSH)' },
]

const fields = [
  { key: 'index', label: 'No', thStyle: { width: '4em' } },
  { key: 'year', label: 'Year' },
  { key: 'currency', label: 'Currency' },
  { key: 'total_assets', label: 'Total Assets (T&A)' },
  { key: 'total_liabilities', label: 'Total Liabilities (TL)' },
  { key: 'total_equity', label: 'Total Equity (TE)' },
  { key: 'gross_profit', label: 'Gross Profit (GP)' },
  { key: 'profit_before_tax', label: 'Profit Before Tax (PBT)' },
  { key: 'cash_flow', label: 'Cash Flow' },
  { key: 'file', label: 'File' },
  { key: 'audit_report', label: 'Audit Report' },
  { key: 'actions', label: '', thStyle: { width: '8em' } }
]

function fetchStatements(id) {
  if (!id) return
  api.get(`accounts/companies/${id}/financial-statements/`)
    .then(r => statements.value = r.data)
    .catch(() => toast.add({severity:'error', summary:'Error', detail:'Could not load statements.'}))
}

onMounted(() => fetchStatements(companyId.value))
watch(companyId, fetchStatements)

// open blank form
function openNew() {
  isEditing.value = false
  Object.assign(form, {
    year: null, currency: '', total_assets: null,
    total_liabilities: null, total_equity: null,
    gross_profit: null, profit_before_tax: null, cash_flow: null,
    file: null, audit_report: null
  })
  showDialog.value = true
}

// populate for edit
function onEdit(data) {
  isEditing.value = true
  Object.assign(form, data)
  showDialog.value = true
}

// save (create/update)
function saveStatement() {
  const payload = new FormData()
  for (const key in form) {
    if (form[key] !== null && form[key] !== undefined) {
      payload.append(key, form[key])
    }
  }
  const urlBase = `accounts/companies/${companyId.value}/financial-statements`
  const call = isEditing.value
    ? api.patch(`${urlBase}/${form.year}/`, payload, { headers: { 'Content-Type': 'multipart/form-data' } })
    : api.post(`${urlBase}/`, payload, { headers: { 'Content-Type': 'multipart/form-data' } })

  call.then(() => {
    showDialog.value = false
    fetchStatements(companyId.value)
    toast.add({severity:'success', summary:'Saved'})
  }).catch(err => {
    toast.add({severity:'error', summary:'Error', detail: err.response?.data?.detail || 'Save failed.'})
  })
}

// delete
function onDelete(data) {
  if (!confirm(`Delete statement for ${data.year}?`)) return
  api.delete(`accounts/companies/${companyId.value}/financial-statements/${data.year}/`)
    .then(() => {
      fetchStatements(companyId.value)
      toast.add({severity:'success', summary:'Deleted'})
    })
    .catch(() => toast.add({severity:'error', summary:'Error', detail:'Delete failed.'}))
}
</script>

<style scoped>
/* Add spacing between form sections and fields */
.b-form-group {
  margin-bottom: 1rem;
}
</style>
