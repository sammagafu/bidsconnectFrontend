<template>
  <VerticalLayout>
    <b-container fluid class="py-4">
      <b-card class="mb-4">
        <b-card-header class="d-flex justify-content-between align-items-center py-3">
          <h3 class="mb-0">Manage Tenders</h3>
          <div class="btn-group" role="group" aria-label="table actions">
            <b-button size="sm" variant="outline-success" @click="exportCSV">
              <i class="bx bx-file"></i> CSV
            </b-button>
            <b-button
              size="sm"
              variant="outline-primary"
              @click="goToCreate"
            >
              <i class="bx bx-plus"></i> New
            </b-button>
          </div>
        </b-card-header>

        <b-card-body class="p-0">
          <b-table
            :items="tenders"
            :fields="fields"
            responsive
            striped
            hover
            small
            class="mb-0"
          >
            <template #cell(status)="row">
              <div class="d-flex align-items-center gap-2">
                <b-form-select
                  v-model="row.item.status"
                  :options="statusOptions"
                  size="sm"
                />
                <b-button
                  size="sm"
                  variant="secondary"
                  @click="changeState(row.item)"
                >
                  Update
                </b-button>
              </div>
            </template>

            <template #cell(publication_date)="row">
              {{ formatDate(row.item.publication_date) }}
            </template>

            <template #cell(actions)="row">
              <b-button
                size="sm"
                variant="outline-primary"
                class="me-2"
                @click="goToEdit(row.item)"
                v-b-tooltip.hover
                title="Edit"
              >
                <i class="bx bx-edit"></i>
              </b-button>
              <b-button
                size="sm"
                variant="outline-danger"
                @click="confirmDelete(row.item)"
                v-b-tooltip.hover
                title="Delete Tender"
              >
                <i class="bx bx-trash"></i>
              </b-button>
            </template>
          </b-table>
        </b-card-body>
      </b-card>
    </b-container>
  </VerticalLayout>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { api } from '@/services/authService'
import VerticalLayout from '@/layouts/VerticalLayout.vue'
import { useToast } from 'primevue/usetoast'

const toast = useToast()
const router = useRouter()
const tenders = ref([])

const statusOptions = [
  { text: 'Draft',             value: 'draft' },
  { text: 'Pending Approval',  value: 'pending' },
  { text: 'Published',         value: 'published' },
  { text: 'Under Evaluation',  value: 'evaluation' },
  { text: 'Awarded',           value: 'awarded' },
  { text: 'Closed',            value: 'closed' },
  { text: 'Canceled',          value: 'canceled' },
]

const fields = [
  { key: 'title',             label: 'Title',            sortable: true },
  { key: 'reference_number',  label: 'Reference #',      sortable: true },
  { key: 'status',            label: 'Status',           sortable: true },
  { key: 'publication_date',  label: 'Publication Date', sortable: true },
  { key: 'actions',           label: 'Actions',          thStyle: { width: '10rem' } },
]

onMounted(fetchTenders)

async function fetchTenders() {
  try {
    const res = await api.get('tenders/tenders/')
    tenders.value = res.data.results || res.data || []
  } catch {
    toast.add({ severity:'error', summary:'Error', detail:'Could not load tenders.' })
  }
}

function formatDate(d) {
  return d ? new Date(d).toLocaleDateString() : '-'
}

async function changeState(t) {
  const prev = t.status
  try {
    await api.patch(`tenders/tenders/${t.slug}/status/`, { status: t.status })
    toast.add({ severity:'success', summary:'Updated', detail:`Status changed to ${t.status}` })
  } catch {
    t.status = prev
    toast.add({ severity:'error', summary:'Error', detail:'Failed to change state.' })
  }
}

async function confirmDelete(t) {
  if (!confirm(`Delete tender "${t.title}"?`)) return
  try {
    await api.delete(`tenders/tenders/${t.slug}/`)
    toast.add({ severity:'success', summary:'Deleted', detail:'Tender removed.' })
    await fetchTenders()
  } catch {
    toast.add({ severity:'error', summary:'Error', detail:'Failed to delete tender.' })
  }
}

// ——— Navigation ————————————————————————————————————————————————————

function goToCreate() {
  router.push({ name: 'admin.tenders-create' })
}

function goToEdit(item) {
  router.push({
    name: 'admin.tenders-edit',
    params: { slug: item.slug }
  })
}

// ——— CSV Export —————————————————————————————————————————————————————

function exportCSV() {
  if (!tenders.value.length) {
    toast.add({ severity:'warn', summary:'No data', detail:'Nothing to export.'})
    return
  }
  const header = ['Title','Reference #','Status','Publication Date']
  const rows = tenders.value.map(t => [
    `"${t.title.replace(/"/g,'""')}"`,
    `"${t.reference_number}"`,
    `"${t.status}"`,
    `"${formatDate(t.publication_date)}"`
  ])
  const csv = [header.join(','), ...rows.map(r=>r.join(','))].join('\r\n')
  const blob = new Blob([csv], { type:'text/csv;charset=utf-8;' })
  const link = document.createElement('a')
  link.href = URL.createObjectURL(blob)
  link.setAttribute('download','tenders.csv')
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
}
</script>

<style scoped>
.mb-4 { margin-bottom: 1.5rem; }
.gap-2 { gap: .5rem; }
</style>
