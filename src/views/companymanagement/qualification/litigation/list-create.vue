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
        <template #cell(start_date)="data">
          {{ formatDate(data.item.start_date) }}
        </template>
        <template #cell(end_date)="data">
          {{ data.item.end_date ? formatDate(data.item.end_date) : '—' }}
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
          <b-form-group label="Title*" label-for="title">
            <InputText id="title" v-model="form.title" class="form-control" required />
          </b-form-group>

          <b-form-group label="Description" label-for="description">
            <Textarea id="description" v-model="form.description" rows="3" class="form-control" />
          </b-form-group>
        </div>

        <div class="row">
          <div class="col-md-4 mb-3">
            <b-form-group label="Start Date*" label-for="start_date">
              <FlatPicker
                id="start_date"
                v-model="form.start_date"
                placeholder="Select start date"
                :options="{ altInput: true, altFormat: 'F j, Y', dateFormat: 'Y-m-d' }"
                class="form-control"
                required
              />
            </b-form-group>
          </div>
          <div class="col-md-4 mb-3">
            <b-form-group label="End Date" label-for="end_date">
              <FlatPicker
                id="end_date"
                v-model="form.end_date"
                placeholder="Select end date"
                :options="{ altInput: true, altFormat: 'F j, Y', dateFormat: 'Y-m-d' }"
                class="form-control"
              />
            </b-form-group>
          </div>
          <div class="col-md-4 mb-3">
            <b-form-group label="Status*" label-for="status">
              <b-form-select
                id="status"
                v-model="form.status"
                :options="statusOptions"
                required
              />
            </b-form-group>
          </div>
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
import InputText from 'primevue/inputtext'
import Textarea from 'primevue/textarea'
import FlatPicker from '@/components/FlatPicker.vue';

const toast = useToast()
const authStore = useAuthStore()
const companyId = ref(authStore.user?.companies?.[0]?.id || null)

const items = ref([])
const showDialog = ref(false)
const editing = ref(false)

// form model
const form = reactive({
  id: null,
  title: '',
  description: '',
  start_date: null,
  end_date: null,
  status: '',
})

// status dropdown options
const statusOptions = [
  { value: 'open',   text: 'Open' },
  { value: 'closed', text: 'Closed' },
  { value: 'settled',text: 'Settled' },
]

const fields = [
  { key: 'index', label: 'No', thStyle: { width: '4em' } },
  { key: 'title', label: 'Title' },
  { key: 'start_date', label: 'Start Date' },
  { key: 'end_date', label: 'End Date' },
  { key: 'status', label: 'Status' },
  { key: 'actions', label: '', thStyle: { width: '8em' } }
]

function formatDate(d) {
  return d ? new Date(d).toISOString().slice(0,10) : ''
}

async function fetchItems(id) {
  if (!id) return
  try {
    const { data } = await api.get(`accounts/companies/${id}/litigations/`)
    items.value = data
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
    title: '',
    description: '',
    start_date: null,
    end_date: null,
    status: '',
  })
  showDialog.value = true
}

function onEdit(item) {
  editing.value = true
  Object.assign(form, item)
  showDialog.value = true
}

async function save() {
  if (!form.title || !form.start_date || !form.status) {
    toast.add({ severity: 'warn', summary: 'Validation', detail: 'Please fill required fields.' })
    return
  }
  const base = `accounts/companies/${companyId.value}/litigations`
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
  if (!confirm(`Delete litigation "${item.title}"?`)) return
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
