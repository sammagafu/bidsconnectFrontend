<template>
  <VerticalLayout>
    <b-container fluid class="py-4">
      <b-card class="mb-4">
        <b-card-header class="d-flex justify-content-between align-items-center py-3">
          <h3 class="mb-0">{{ tender?.title || 'Tender Details' }}</h3>
          <div class="btn-group" role="group" aria-label="actions">
            <b-button size="sm" variant="outline-primary" @click="goBack">
              <i class="bx bx-arrow-back"></i> Back
            </b-button>
            <b-button size="sm" variant="outline-success" @click="exportBidsCSV" v-if="bids.length > 0">
              <i class="bx bx-file"></i> Export Bids CSV
            </b-button>
            <b-button size="sm" variant="outline-primary" @click="openAwardModal" v-if="tender && !tender.awarded_bid">
              <i class="bx bx-award"></i> Award Tender
            </b-button>
          </div>
        </b-card-header>

        <b-card-body v-if="tender">
          <!-- Tender Info Section -->
          <h5 class="mb-3">Tender Information</h5>
          <div class="border p-3 rounded bg-light mb-4">
            <p class="mb-1"><strong>Reference #:</strong> {{ tender.reference_number }}</p>
            <p class="mb-1"><strong>Description:</strong> {{ tender.description || 'N/A' }}</p>
            <p class="mb-1"><strong>Category:</strong> {{ tender.category?.name || 'N/A' }}</p>
            <p class="mb-1"><strong>Subcategory:</strong> {{ tender.subcategory?.name || 'N/A' }}</p>
            <p class="mb-1"><strong>Procurement Process:</strong> {{ tender.procurement_process?.name || 'N/A' }}</p>
            <p class="mb-1"><strong>Agency:</strong> {{ tender.agency?.name || 'N/A' }}</p>
            <p class="mb-1"><strong>Status:</strong> {{ tender.status.toUpperCase() }}</p>
            <p class="mb-1"><strong>Publication Date:</strong> {{ formatDate(tender.publication_date) }}</p>
            <p class="mb-1"><strong>Submission Deadline:</strong> {{ formatDate(tender.submission_deadline) }}</p>
            <p class="mb-1"><strong>Currency:</strong> {{ tender.currency }}</p>
            <p class="mb-1"><strong>Tender Fees:</strong> {{ tender.tender_fees }}</p>
            <p class="mb-1"><strong>Awarded To:</strong> {{ tender.awarded_bid ? getAwardedBidderName(tender.awarded_bid) : 'Not awarded yet' }}</p>
            <!-- Add more fields as needed -->
          </div>

          <!-- Bids Section -->
          <h5 class="mb-3">Bids for this Tender</h5>
          <b-table
            :items="bids"
            :fields="bidFields"
            responsive
            striped
            hover
            small
            class="mb-0"
          >
            <template #cell(bidder)="row">
              <router-link :to="{ name: 'admin.bids-detail', params: { id: row.item.id } }" class="text-decoration-none text-primary">
                {{ row.item.bidder }}
              </router-link>
            </template>
            <template #cell(status)="row">
              <span class="badge bg-primary">{{ row.item.status.toUpperCase() }}</span>
            </template>
            <template #cell(submission_date)="row">
              {{ formatDate(row.item.submission_date) }}
            </template>
            <template #cell(actions)="row">
              <b-button size="sm" variant="outline-primary" @click="viewBid(row.item)">
                View Bid
              </b-button>
            </template>
          </b-table>
          <b-alert v-if="!bids.length" variant="info" show class="mt-3">
            No bids submitted for this tender yet.
          </b-alert>
        </b-card-body>

        <b-card-body v-else>
          <p>Loading tender details...</p>
        </b-card-body>
      </b-card>

      <!-- Award Modal -->
      <Dialog v-model:visible="awardModalVisible" header="Award Tender" :style="{ width: '50vw' }">
        <p>Select a bid to award this tender to:</p>
        <Dropdown v-model="selectedBid" :options="bids" optionLabel="bidder" optionValue="id" placeholder="Select a bid" />
        <template #footer>
          <Button label="Cancel" icon="pi pi-times" @click="awardModalVisible = false" class="p-button-text" />
          <Button label="Award" icon="pi pi-check" @click="awardTender" :disabled="!selectedBid" />
        </template>
      </Dialog>
    </b-container>
  </VerticalLayout>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { api } from '@/services/authService'
import VerticalLayout from '@/layouts/VerticalLayout.vue'
import { useToast } from 'primevue/usetoast'
import Dialog from 'primevue/dialog'
import Dropdown from 'primevue/dropdown'
import Button from 'primevue/button'

const toast = useToast()
const router = useRouter()
const route = useRoute()
const tender = ref(null)
const bids = ref([])
const awardModalVisible = ref(false)
const selectedBid = ref(null)

const bidFields = [
  { key: 'bidder', label: 'Bidder Email', sortable: true },
  { key: 'company.name', label: 'Company', sortable: true },
  { key: 'status', label: 'Status', sortable: true },
  { key: 'total_price', label: 'Total Price', sortable: true },
  { key: 'currency', label: 'Currency' },
  { key: 'submission_date', label: 'Submission Date', sortable: true },
  { key: 'actions', label: 'Actions', thStyle: { width: '8rem' } },
]

onMounted(fetchTenderDetails)

async function fetchTenderDetails() {
  const slug = route.params.slug
  if (!slug) {
    toast.add({ severity: 'error', summary: 'Error', detail: 'Invalid tender slug.' })
    router.back()
    return
  }

  try {
    const res = await api.get(`tenders/tenders/${slug}/`)
    tender.value = res.data
    await fetchBids()
  } catch {
    toast.add({ severity: 'error', summary: 'Error', detail: 'Could not load tender details.' })
    router.back()
  }
}

async function fetchBids() {
  if (!tender.value?.id) return
  try {
    const res = await api.get(`bids/?tender=${tender.value.id}`)
    bids.value = res.data.results || res.data || []
  } catch {
    toast.add({ severity: 'error', summary: 'Error', detail: 'Could not load bids.' })
  }
}

function formatDate(d) {
  return d ? new Date(d).toLocaleDateString() : '-'
}

function goBack() {
  router.back()
}

function viewBid(bid) {
  router.push({ name: 'admin.bids-detail', params: { id: bid.id } })  // Assume bid detail route
}

function openAwardModal() {
  awardModalVisible.value = true
  selectedBid.value = null
}

async function awardTender() {
  try {
    await api.patch(`tenders/tenders/${tender.value.slug}/award/`, { awarded_bid: selectedBid.value })
    toast.add({ severity: 'success', summary: 'Success', detail: 'Tender awarded successfully.' })
    awardModalVisible.value = false
    await fetchTenderDetails()  // Refresh tender to show awarded_bid
  } catch {
    toast.add({ severity: 'error', summary: 'Error', detail: 'Failed to award tender.' })
  }
}

function getAwardedBidderName(awardedId) {
  const awardedBid = bids.value.find(b => b.id === awardedId)
  return awardedBid ? awardedBid.bidder : 'Unknown'
}

function exportBidsCSV() {
  if (!bids.value.length) {
    toast.add({ severity:'warn', summary:'No data', detail:'Nothing to export.'})
    return
  }
  const header = ['Bidder','Company','Status','Total Price','Currency','Submission Date']
  const rows = bids.value.map(b => [
    `"${b.bidder.replace(/"/g,'""')}"`,
    `"${b.company.name.replace(/"/g,'""')}"`,
    `"${b.status}"`,
    `"${b.total_price}"`,
    `"${b.currency}"`,
    `"${formatDate(b.submission_date)}"`
  ])
  const csv = [header.join(','), ...rows.map(r=>r.join(','))].join('\r\n')
  const blob = new Blob([csv], { type:'text/csv;charset=utf-8;' })
  const link = document.createElement('a')
  link.href = URL.createObjectURL(blob)
  link.setAttribute('download',`${tender.value.reference_number}_bids.csv`)
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
}
</script>

<style scoped>
.mb-4 { margin-bottom: 1.5rem; }
.mb-3 { margin-bottom: 1rem; }
.mb-1 { margin-bottom: 0.25rem; }
.bg-light { background-color: #f8f9fa !important; }
.gap-2 { gap: .5rem; }
</style>