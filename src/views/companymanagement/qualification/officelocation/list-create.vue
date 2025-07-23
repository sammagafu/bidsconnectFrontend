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
        <template #cell(index)="row">
          {{ row.index + 1 }}
        </template>
        <template #cell(director_title)="row">
          {{ row.item.director_title }}
        </template>
        <template #cell(phone)="row">
          {{ row.item.phone }}
        </template>
        <template #cell(email)="row">
          {{ row.item.email }}
        </template>
        <template #cell(region)="row">
          {{ row.item.region }}
        </template>
        <template #cell(district)="row">
          {{ row.item.district }}
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

    <!-- Create/Edit Modal -->
    <b-modal v-model="showDialog" :title="editing ? 'Edit Office' : 'New Office'" hide-footer>
      <b-form @submit.prevent="save">
        <b-row>
          <b-col md="6" class="mb-3">
            <b-form-group label="Director Title*" label-for="director_title">
              <b-form-input
                id="director_title"
                v-model="form.director_title"
                required
              />
            </b-form-group>
          </b-col>
          <b-col md="6" class="mb-3">
            <b-form-group label="Phone*" label-for="phone">
              <b-form-input id="phone" v-model="form.phone" required />
            </b-form-group>
          </b-col>
          <b-col md="6" class="mb-3">
            <b-form-group label="Email*" label-for="email">
              <b-form-input id="email" v-model="form.email" type="email" required />
            </b-form-group>
          </b-col>
          <b-col md="6" class="mb-3">
            <b-form-group label="Postal Address*" label-for="postal_address">
              <b-form-input id="postal_address" v-model="form.postal_address" required />
            </b-form-group>
          </b-col>
          <b-col cols="12" class="mb-3">
            <b-form-group label="Physical Address*" label-for="physical_address">
              <b-form-textarea
                id="physical_address"
                v-model="form.physical_address"
                rows="2"
                required
              />
            </b-form-group>
          </b-col>
          <b-col md="4" class="mb-3">
            <b-form-group label="Region*" label-for="region">
              <b-form-input id="region" v-model="form.region" required />
            </b-form-group>
          </b-col>
          <b-col md="4" class="mb-3">
            <b-form-group label="District*" label-for="district">
              <b-form-input id="district" v-model="form.district" required />
            </b-form-group>
          </b-col>
          <b-col md="4" class="mb-3">
            <b-form-group label="Council*" label-for="council">
              <b-form-input id="council" v-model="form.council" required />
            </b-form-group>
          </b-col>
          <b-col md="6" class="mb-3">
            <b-form-group label="Ward*" label-for="ward">
              <b-form-input id="ward" v-model="form.ward" required />
            </b-form-group>
          </b-col>
          <b-col md="6" class="mb-3">
            <b-form-group label="Street*" label-for="street">
              <b-form-input id="street" v-model="form.street" required />
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
  director_title: '',
  phone: '',
  email: '',
  physical_address: '',
  postal_address: '',
  region: '',
  district: '',
  council: '',
  ward: '',
  street: ''
})

const fields = [
  { key: 'index', label: 'No', thStyle: { width: '4em' } },
  { key: 'director_title', label: 'Director Title' },
  { key: 'phone', label: 'Phone' },
  { key: 'email', label: 'Email' },
  { key: 'region', label: 'Region' },
  { key: 'district', label: 'District' },
  { key: 'actions', label: '', thStyle: { width: '8em' } }
]

function formatDate(d) {
  return d ? new Date(d).toISOString().slice(0,10) : ''
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
    director_title: '',
    phone: '',
    email: '',
    physical_address: '',
    postal_address: '',
    region: '',
    district: '',
    council: '',
    ward: '',
    street: ''
  })
  showDialog.value = true
}

function onEdit(item) {
  editing.value = true
  Object.assign(form, item)
  showDialog.value = true
}

async function save() {
  // basic validation
  if (!form.director_title || !form.phone || !form.email) {
    toast.add({ severity: 'warn', summary: 'Validation', detail: 'Please fill required fields.' })
    return
  }
  const base = `accounts/companies/${companyId.value}/offices`
  try {
    if (editing.value) {
      await api.patch(`${base}/${form.uuid}/`, form)
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
  if (!confirm(`Delete office "${item.director_title}"?`)) return
  const base = `accounts/companies/${companyId.value}/offices`
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
