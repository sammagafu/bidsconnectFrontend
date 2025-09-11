<template>
  <VerticalLayout>
    <b-container fluid class="py-4">
      <b-card class="mb-4">
        <b-card-header class="d-flex justify-content-between align-items-center py-3">
          <h3 class="mb-0">Bid Details</h3>
          <div class="btn-group" role="group" aria-label="actions">
            <b-button size="sm" variant="outline-primary" @click="goBack">
              <i class="bx bx-arrow-back"></i> Back
            </b-button>
            <b-button size="sm" variant="outline-success" @click="awardBid" v-if="bid && bid.status === 'under_evaluation' && !tender?.awarded_bid">
              <i class="bx bx-award"></i> Award Bid
            </b-button>
            <b-button size="sm" variant="outline-danger" @click="rejectBid" v-if="bid && bid.status !== 'rejected' && bid.status !== 'accepted'">
              <i class="bx bx-x"></i> Reject Bid
            </b-button>
          </div>
        </b-card-header>

        <b-card-body v-if="bid && !loading">
          <!-- Bid Info Section -->
          <h5 class="mb-3">Bid Information</h5>
          <div class="border p-3 rounded bg-light mb-4">
            <p class="mb-1"><strong>Bidder:</strong> {{ bid.bidder || 'N/A' }}</p>
            <p class="mb-1"><strong>Company:</strong> {{ bid.company?.name || 'N/A' }}</p>
            <p class="mb-1"><strong>Status:</strong> {{ bid.status.toUpperCase() }}</p>
            <p class="mb-1"><strong>Total Price:</strong> {{ bid.total_price || 0 }} {{ bid.currency || '' }}</p>
            <p class="mb-1"><strong>Submission Date:</strong> {{ formatDate(bid.submission_date) }}</p>
            <p class="mb-1"><strong>Validity Complied:</strong> {{ bid.validity_complied ? 'Yes' : 'No' }}</p>
            <p class="mb-1"><strong>Completion Complied:</strong> {{ bid.completion_complied ? 'Yes' : 'No' }}</p>
            <p class="mb-1"><strong>Proposed Completion Days:</strong> {{ bid.proposed_completion_days || 'N/A' }}</p>
            <p class="mb-1"><strong>JV Partner:</strong> {{ bid.jv_partner?.email || 'None' }}</p>
            <p class="mb-1"><strong>JV Percentage:</strong> {{ bid.jv_percentage || 'N/A' }}%</p>
            <!-- Add more bid fields as needed -->
          </div>

          <!-- Tender Info Section (linked) -->
          <h5 class="mb-3">Associated Tender</h5>
          <div class="border p-3 rounded bg-light mb-4" v-if="tender">
            <p class="mb-1"><strong>Title:</strong> {{ tender.title || 'N/A' }}</p>
            <p class="mb-1"><strong>Reference #:</strong> {{ tender.reference_number || 'N/A' }}</p>
            <p class="mb-1"><strong>Status:</strong> {{ tender.status.toUpperCase() }}</p>
            <!-- Add more tender summary fields -->
            <b-button size="sm" variant="outline-info" @click="viewTender">
              View Full Tender Details
            </b-button>
          </div>
          <b-alert v-else variant="warning" show>
            Tender data unavailable.
          </b-alert>

          <!-- Responses Sections (Tabs) -->
          <h5 class="mb-3">Bid Responses</h5>
          <b-tabs content-class="mt-3" v-if="bid">
            <b-tab title="Documents" active>
              <b-table :items="bid.bids_documents || []" :fields="documentFields" striped hover responsive>
                <template #cell(actions)="row">
                  <b-button size="sm" variant="outline-primary" @click="viewDocument(row.item.file)">
                    View Document
                  </b-button>
                </template>
              </b-table>
              <b-alert v-if="!bid.bids_documents || bid.bids_documents.length === 0" variant="info" show>
                No documents submitted.
              </b-alert>
            </b-tab>

            <b-tab title="Financial Responses">
              <b-table :items="bid.bids_financial_responses || []" :fields="financialFields" striped hover responsive />
              <b-alert v-if="!bid.bids_financial_responses || bid.bids_financial_responses.length === 0" variant="info" show>
                No financial responses.
              </b-alert>
            </b-tab>

            <b-tab title="Turnover Responses">
              <b-table :items="bid.bids_turnover_responses || []" :fields="turnoverFields" striped hover responsive />
              <b-alert v-if="!bid.bids_turnover_responses || bid.bids_turnover_responses.length === 0" variant="info" show>
                No turnover responses.
              </b-alert>
            </b-tab>

            <b-tab title="Experience Responses">
              <b-table :items="bid.bids_experience_responses || []" :fields="experienceFields" striped hover responsive />
              <b-alert v-if="!bid.bids_experience_responses || bid.bids_experience_responses.length === 0" variant="info" show>
                No experience responses.
              </b-alert>
            </b-tab>

            <b-tab title="Personnel Responses">
              <b-table :items="bid.bids_personnel_responses || []" :fields="personnelFields" striped hover responsive />
              <b-alert v-if="!bid.bids_personnel_responses || bid.bids_personnel_responses.length === 0" variant="info" show>
                No personnel responses.
              </b-alert>
            </b-tab>

            <b-tab title="Office Responses">
              <b-table :items="bid.bids_office_responses || []" :fields="officeFields" striped hover responsive />
              <b-alert v-if="!bid.bids_office_responses || bid.bids_office_responses.length === 0" variant="info" show>
                No office responses.
              </b-alert>
            </b-tab>

            <b-tab title="Source Responses">
              <b-table :items="bid.bids_source_responses || []" :fields="sourceFields" striped hover responsive />
              <b-alert v-if="!bid.bids_source_responses || bid.bids_source_responses.length === 0" variant="info" show>
                No source responses.
              </b-alert>
            </b-tab>

            <b-tab title="Litigation Responses">
              <b-table :items="bid.bids_litigation_responses || []" :fields="litigationFields" striped hover responsive />
              <b-alert v-if="!bid.bids_litigation_responses || bid.bids_litigation_responses.length === 0" variant="info" show>
                No litigation responses.
              </b-alert>
            </b-tab>

            <b-tab title="Schedule Responses">
              <b-table :items="bid.bids_schedule_responses || []" :fields="scheduleFields" striped hover responsive />
              <b-alert v-if="!bid.bids_schedule_responses || bid.bids_schedule_responses.length === 0" variant="info" show>
                No schedule responses.
              </b-alert>
            </b-tab>

            <b-tab title="Technical Responses">
              <b-table :items="bid.bids_technical_responses || []" :fields="technicalFields" striped hover responsive />
              <b-alert v-if="!bid.bids_technical_responses || bid.bids_technical_responses.length === 0" variant="info" show>
                No technical responses.
              </b-alert>
            </b-tab>

            <b-tab title="Evaluations">
              <b-table :items="bid.bids_evaluations || []" :fields="evaluationFields" striped hover responsive />
              <b-alert v-if="!bid.bids_evaluations || bid.bids_evaluations.length === 0" variant="info" show>
                No evaluations yet.
              </b-alert>
            </b-tab>

            <b-tab title="Audit Logs">
              <b-table :items="bid.bids_audit_logs || []" :fields="auditFields" striped hover responsive />
              <b-alert v-if="!bid.bids_audit_logs || bid.bids_audit_logs.length === 0" variant="info" show>
                No audit logs.
              </b-alert>
            </b-tab>
          </b-tabs>
        </b-card-body>

        <b-card-body v-else-if="loading">
          <p>Loading bid details...</p>
        </b-card-body>

        <b-card-body v-else>
          <b-alert variant="danger" show>
            Failed to load bid details. Please try again or contact support.
          </b-alert>
        </b-card-body>
      </b-card>
    </b-container>
  </VerticalLayout>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { api } from '@/services/authService'
import VerticalLayout from '@/layouts/VerticalLayout.vue'
import { useToast } from 'primevue/usetoast'

const toast = useToast()
const router = useRouter()
const route = useRoute()
const bid = ref(null)
const tender = ref(null)
const loading = ref(true)
const error = ref(null)

const documentFields = [
  { key: 'tender_document.name', label: 'Document Name' },
  { key: 'description', label: 'Description' },
  { key: 'submitted_at', label: 'Submitted At', formatter: 'formatDate' },
  { key: 'actions', label: 'Actions' },
]

const financialFields = [
  { key: 'financial_requirement.name', label: 'Requirement' },
  { key: 'actual_value', label: 'Actual Value' },
  { key: 'complied', label: 'Complied' },
  { key: 'notes', label: 'Notes' },
]

const turnoverFields = [
  { key: 'turnover_requirement.label', label: 'Requirement' },
  { key: 'actual_amount', label: 'Actual Amount' },
  { key: 'currency', label: 'Currency' },
  { key: 'complied', label: 'Complied' },
  { key: 'notes', label: 'Notes' },
]

const experienceFields = [
  { key: 'experience_requirement.type', label: 'Type' },
  { key: 'complied', label: 'Complied' },
  { key: 'notes', label: 'Notes' },
]

const personnelFields = [
  { key: 'personnel_requirement.role', label: 'Role' },
  { key: 'complied', label: 'Complied' },
  { key: 'notes', label: 'Notes' },
]

const officeFields = [
  { key: 'tender_document.name', label: 'Document' },
  { key: 'offices', label: 'Offices' },
]

const sourceFields = [
  { key: 'tender_document.name', label: 'Document' },
  { key: 'total_amount', label: 'Total Amount' },
  { key: 'currency', label: 'Currency' },
  { key: 'notes', label: 'Notes' },
]

const litigationFields = [
  { key: 'tender_document.name', label: 'Document' },
  { key: 'no_litigation', label: 'No Litigation' },
  { key: 'notes', label: 'Notes' },
]

const scheduleFields = [
  { key: 'schedule_item.commodity', label: 'Commodity' },
  { key: 'proposed_quantity', label: 'Proposed Quantity' },
  { key: 'proposed_delivery_date', label: 'Proposed Delivery Date', formatter: 'formatDate' },
  { key: 'notes', label: 'Notes' },
]

const technicalFields = [
  { key: 'technical_specification.category', label: 'Category' },
  { key: 'description', label: 'Description' },
  { key: 'complied', label: 'Complied' },
  { key: 'notes', label: 'Notes' },
]

const evaluationFields = [
  { key: 'evaluator.email', label: 'Evaluator' },
  { key: 'score', label: 'Score' },
  { key: 'comments', label: 'Comments' },
  { key: 'evaluated_at', label: 'Evaluated At', formatter: 'formatDate' },
]

const auditFields = [
  { key: 'user.email', label: 'User' },
  { key: 'action', label: 'Action' },
  { key: 'details', label: 'Details' },
  { key: 'created_at', label: 'Created At', formatter: 'formatDate' },
]

onMounted(fetchBidDetails)

async function fetchBidDetails() {
  const id = route.params.id
  if (!id) {
    toast.add({ severity: 'error', summary: 'Error', detail: 'Invalid bid ID.' })
    router.back()
    return
  }

  loading.value = true
  try {
    const res = await api.get(`bids/${id}/`).catch(err => {
      throw new Error(err.response?.data?.detail || 'Network error')
    })
    bid.value = res.data
    tender.value = bid.value.tender
  } catch (err) {
    error.value = err.message
    console.error('Fetch error:', err)
  } finally {
    loading.value = false
  }
}

async function awardBid() {
  if (!confirm('Award this bid? This will set the tender as awarded.')) return
  try {
    await api.patch(`tenders/tenders/${tender.value.slug}/award/`, { awarded_bid: bid.value.id })
    toast.add({ severity: 'success', summary: 'Success', detail: 'Bid awarded.' })
    await fetchBidDetails()  // Refresh
  } catch (err) {
    toast.add({ severity: 'error', summary: 'Error', detail: `Failed to award bid: ${err.response?.data?.detail || err.message}` })
  }
}

async function rejectBid() {
  if (!confirm('Reject this bid?')) return
  try {
    await api.patch(`bids/${bid.value.id}/reject/`, { status: 'rejected' })
    toast.add({ severity: 'success', summary: 'Success', detail: 'Bid rejected.' })
    await fetchBidDetails()  // Refresh
  } catch (err) {
    toast.add({ severity: 'error', summary: 'Error', detail: `Failed to reject bid: ${err.response?.data?.detail || err.message}` })
  }
}

function formatDate(d) {
  return d ? new Date(d).toLocaleDateString() : '-'
}

function goBack() {
  router.back()
}

function viewTender() {
  router.push({ name: 'admin.tenders-detail', params: { slug: tender.value.slug } })
}

function viewDocument(url) {
  if (url) window.open(url, '_blank')
  else toast.add({ severity: 'warn', summary: 'No Document', detail: 'No file attached.' })
}
</script>

<style scoped>
.mb-4 { margin-bottom: 1.5rem; }
.mb-3 { margin-bottom: 1rem; }
.mb-1 { margin-bottom: 0.25rem; }
.bg-light { background-color: #f8f9fa !important; }
.gap-2 { gap: .5rem; }
</style>