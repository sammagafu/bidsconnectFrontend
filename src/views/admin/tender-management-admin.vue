<template>
  <VerticalLayout>
    <b-card>
      <h3 class="mb-4">Manage Tenders</h3>

      <b-table :items="tenders" :fields="fields" responsive striped hover>
        <!-- Status Column: inline dropdown + button -->
        <template #cell(status)="row">
          <div class="d-flex align-items-center gap-2">
            <b-form-select
              v-model="row.item.status"
              :options="statusOptions"
              size="sm"
              class="me-2"
            />
            <b-button size="sm" variant="secondary" @click="changeState(row.item)">
              Update
            </b-button>
          </div>
        </template>

        <!-- Publication Date -->
        <template #cell(publication_date)="row">
          {{ formatDate(row.item.publication_date) }}
        </template>

        <!-- Actions: Edit / Delete -->
        <template #cell(actions)="row">
          <b-button
            size="sm"
            variant="outline-primary"
            @click="editTender(row.item)"
            v-b-tooltip.hover
            title="Edit Tender"
          >
            <i class="bx bx-edit"></i>
          </b-button>
          <b-button
            size="sm"
            variant="outline-danger"
            class="ms-2"
            @click="confirmDelete(row.item)"
            v-b-tooltip.hover
            title="Delete Tender"
          >
            <i class="bx bx-trash"></i>
          </b-button>
        </template>
      </b-table>
    </b-card>
  </VerticalLayout>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { api } from '@/services/authService'
import VerticalLayout from '@/layouts/VerticalLayout.vue'
import { useToast } from 'primevue/usetoast'

const toast = useToast()
const tenders = ref([])

const statusOptions = [
  { text: 'Draft', value: 'draft' },
  { text: 'Pending Approval', value: 'pending' },
  { text: 'Published', value: 'published' },
  { text: 'Under Evaluation', value: 'evaluation' },
  { text: 'Awarded', value: 'awarded' },
  { text: 'Closed', value: 'closed' },
  { text: 'Canceled', value: 'canceled' },
]

const fields = [
  { key: 'title', label: 'Title', sortable: true },
  { key: 'reference_number', label: 'Reference Number', sortable: true },
  { key: 'status', label: 'Status', sortable: true },
  { key: 'publication_date', label: 'Publication Date', sortable: true },
  { key: 'actions', label: 'Actions' },
]

onMounted(fetchTenders)

// load the table
async function fetchTenders() {
  try {
    const res = await api.get('tenders/tenders/')
    tenders.value = res.data.results || res.data || []
  } catch (err) {
    console.error(err)
    toast.add({ severity: 'error', summary: 'Error', detail: 'Failed to load tenders' })
  }
}

// call your custom PATCH /status/ action
async function changeState(tender) {
  const original = tender.status
  try {
    await api.patch(
      `tenders/tenders/${tender.slug}/status/`,
      { status: tender.status }
    )
    toast.add({ severity: 'success', summary: 'Updated', detail: `Status changed to ${tender.status}` })
    await fetchTenders()
  } catch (err) {
    console.error(err)
    tender.status = original
    toast.add({ severity: 'error', summary: 'Error', detail: 'Failed to change state' })
  }
}
  
function editTender(t) {
  // navigate or open your edit modal
  console.log('Edit tender', t.slug)
}

async function confirmDelete(t) {
  if (!confirm(`Delete tender "${t.title}"?`)) return
  try {
    await api.delete(`tenders/tenders/${t.slug}/`)
    toast.add({ severity: 'success', summary: 'Deleted', detail: 'Tender removed' })
    await fetchTenders()
  } catch (err) {
    console.error(err)
    toast.add({ severity: 'error', summary: 'Error', detail: 'Failed to delete tender' })
  }
}

function formatDate(dt) {
  return dt ? new Date(dt).toLocaleDateString() : '-'
}
</script>

<style scoped>
/* no extra styles needed */
</style>
