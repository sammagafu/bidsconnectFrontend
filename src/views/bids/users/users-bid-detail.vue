<template>
    <VerticalLayout>
        <b-container class="py-4">
            <h1 class="h3 mb-4">Bid Details</h1>
            
            <!-- Loading state -->
            <b-overlay :show="loading" rounded="sm">
                <!-- Error state -->
                <b-alert v-if="error" variant="danger" show>
                    {{ error }}
                </b-alert>

                <!-- Tender and Bid details -->
                <div v-else>
                    <!-- Tender details -->
                    <div v-if="tender" class="mb-4">
                        <h5 class="fw-bold text-dark mb-3">Tender Details</h5>
                        <div class="border p-3 rounded bg-light">
                            <p class="mb-1"><strong>Title:</strong> {{ tender.title || 'N/A' }}</p>
                            <p class="mb-1"><strong>Description:</strong> {{ tender.description || 'N/A' }}</p>
                            <p class="mb-1"><strong>Agency:</strong> {{ tender.agency?.name || 'Unknown Agency' }}</p>
                            <p class="mb-1"><strong>Reference Number:</strong> {{ tender.reference_number || 'N/A' }}</p>
                            <p class="mb-1"><strong>Submission Deadline:</strong> {{ formatDateTime(tender.submission_deadline) }}</p>
                            <p class="mb-1"><strong>Status:</strong> <span :class="['badge', getStatusClass(tender.status)]">{{ (tender.status || '').toUpperCase() }}</span></p>
                            <p class="mb-1"><strong>Framework:</strong> {{ formatFramework(tender) }}</p>
                            <p class="mb-1"><strong>Category:</strong> {{ tender.category?.name || 'N/A' }}</p>
                            <p class="mb-1"><strong>Procurement Process:</strong> {{ tender.procurement_process?.name || 'N/A' }}</p>
                            <!-- Add more tender fields as needed -->
                        </div>
                    </div>
                    <b-alert v-else variant="warning" show>
                        Tender details not available.
                    </b-alert>

                    <!-- Tender Progress Timeline -->
                    <div v-if="tender" class="mb-4">
                        <h5 class="fw-bold text-dark mb-3">Tender Progress</h5>
                        <Timeline :value="stages" layout="horizontal" align="center">
                            <template #marker="slotProps">
                                <span class="custom-marker p-shadow-2" :style="getMarkerStyle(slotProps.item.value)">
                                    <i :class="`pi ${getMarkerIcon(slotProps.item.value)}`"></i>
                                </span>
                            </template>
                            <template #content="slotProps">
                                {{ slotProps.item.label }}
                            </template>
                        </Timeline>
                    </div>

                    <!-- Your Bid details -->
                    <div v-if="bid" class="mb-4">
                        <h5 class="fw-bold text-dark mb-3">Your Bid Details</h5>
                        <div class="border p-3 rounded bg-light">
                            <p class="mb-1"><strong>Total Price:</strong> {{ bid.total_price || 0 }} {{ bid.currency || '' }}</p>
                            <p class="mb-1"><strong>Status:</strong> <span :class="['badge', getStatusClass(bid.status)]">{{ (bid.status || '').toUpperCase() }}</span></p>
                            <p class="mb-1"><strong>Submission Date:</strong> {{ formatDateTime(bid.submission_date) }}</p>
                            <p class="mb-1"><strong>Validity Complied:</strong> {{ bid.validity_complied ? 'Yes' : 'No' }}</p>
                            <p class="mb-1"><strong>Completion Complied:</strong> {{ bid.completion_complied ? 'Yes' : 'No' }}</p>
                            <p class="mb-1"><strong>Proposed Completion Days:</strong> {{ bid.proposed_completion_days || 'N/A' }}</p>
                            <p class="mb-1"><strong>JV Partner:</strong> {{ bid.jv_partner?.email || 'None' }}</p>
                            <p class="mb-1"><strong>JV Percentage:</strong> {{ bid.jv_percentage || 'N/A' }}%</p>
                            <!-- Add more bid fields as needed -->
                        </div>
                    </div>
                    <b-alert v-else variant="warning" show>
                        Bid details not available.
                    </b-alert>

                    <!-- Bid Responses Sections (Tabs for better UX) -->
                    <b-tabs content-class="mt-3" v-if="bid">
                        <!-- Documents Tab -->
                        <b-tab title="Documents" active>
                            <h6 class="fw-bold text-dark mb-3">Submitted Documents</h6>
                            <b-table striped hover :items="bid.bids_documents || []" :fields="documentFields">
                                <template #cell(actions)="row">
                                    <b-button size="sm" variant="outline-primary" @click="viewDocument(row.item)">
                                        View
                                    </b-button>
                                    <b-button v-if="bid.status === 'draft'" size="sm" variant="outline-danger" @click="deleteDocument(row.item)">
                                        Delete
                                    </b-button>
                                </template>
                            </b-table>
                            <b-alert v-if="!bid.bids_documents || bid.bids_documents.length === 0" variant="info" show>
                                No documents submitted yet.
                            </b-alert>

                            <!-- Upload form if draft -->
                            <div v-if="bid.status === 'draft'" class="mt-4">
                                <h6 class="fw-bold text-dark mb-3">Upload New Document</h6>
                                <b-form @submit.prevent="uploadDocument">
                                    <b-form-group label="Tender Document:" label-for="tender_document">
                                        <b-form-select v-model="newDocument.tender_document" :options="tender.required_documents.map(doc => ({ value: doc.id, text: doc.name }))" required></b-form-select>
                                    </b-form-group>
                                    <b-form-group label="File:" label-for="file">
                                        <b-form-file v-model="newDocument.file" required></b-form-file>
                                    </b-form-group>
                                    <b-form-group label="Description:" label-for="description">
                                        <b-form-input v-model="newDocument.description"></b-form-input>
                                    </b-form-group>
                                    <b-button type="submit" variant="primary" :disabled="uploading">
                                        <b-spinner v-if="uploading" small></b-spinner>
                                        <span v-else>Upload</span>
                                    </b-button>
                                </b-form>
                            </div>
                        </b-tab>

                        <!-- Financial Responses Tab -->
                        <b-tab title="Financial Responses">
                            <h6 class="fw-bold text-dark mb-3">Financial Responses</h6>
                            <b-table striped hover :items="bid.bids_financial_responses || []" :fields="financialFields"></b-table>
                            <b-alert v-if="!bid.bids_financial_responses || bid.bids_financial_responses.length === 0" variant="info" show>
                                No financial responses yet.
                            </b-alert>
                        </b-tab>

                        <!-- Turnover Responses Tab -->
                        <b-tab title="Turnover Responses">
                            <h6 class="fw-bold text-dark mb-3">Turnover Responses</h6>
                            <b-table striped hover :items="bid.bids_turnover_responses || []" :fields="turnoverFields"></b-table>
                            <b-alert v-if="!bid.bids_turnover_responses || bid.bids_turnover_responses.length === 0" variant="info" show>
                                No turnover responses yet.
                            </b-alert>
                        </b-tab>

                        <!-- Experience Responses Tab -->
                        <b-tab title="Experience Responses">
                            <h6 class="fw-bold text-dark mb-3">Experience Responses</h6>
                            <b-table striped hover :items="bid.bids_experience_responses || []" :fields="experienceFields"></b-table>
                            <b-alert v-if="!bid.bids_experience_responses || bid.bids_experience_responses.length === 0" variant="info" show>
                                No experience responses yet.
                            </b-alert>
                        </b-tab>

                        <!-- Personnel Responses Tab -->
                        <b-tab title="Personnel Responses">
                            <h6 class="fw-bold text-dark mb-3">Personnel Responses</h6>
                            <b-table striped hover :items="bid.bids_personnel_responses || []" :fields="personnelFields"></b-table>
                            <b-alert v-if="!bid.bids_personnel_responses || bid.bids_personnel_responses.length === 0" variant="info" show>
                                No personnel responses yet.
                            </b-alert>
                        </b-tab>

                        <!-- Office Responses Tab -->
                        <b-tab title="Office Responses">
                            <h6 class="fw-bold text-dark mb-3">Office Responses</h6>
                            <b-table striped hover :items="bid.bids_office_responses || []" :fields="officeFields"></b-table>
                            <b-alert v-if="!bid.bids_office_responses || bid.bids_office_responses.length === 0" variant="info" show>
                                No office responses yet.
                            </b-alert>
                        </b-tab>

                        <!-- Source Responses Tab -->
                        <b-tab title="Source Responses">
                            <h6 class="fw-bold text-dark mb-3">Source Responses</h6>
                            <b-table striped hover :items="bid.bids_source_responses || []" :fields="sourceFields"></b-table>
                            <b-alert v-if="!bid.bids_source_responses || bid.bids_source_responses.length === 0" variant="info" show>
                                No source responses yet.
                            </b-alert>
                        </b-tab>

                        <!-- Litigation Responses Tab -->
                        <b-tab title="Litigation Responses">
                            <h6 class="fw-bold text-dark mb-3">Litigation Responses</h6>
                            <b-table striped hover :items="bid.bids_litigation_responses || []" :fields="litigationFields"></b-table>
                            <b-alert v-if="!bid.bids_litigation_responses || bid.bids_litigation_responses.length === 0" variant="info" show>
                                No litigation responses yet.
                            </b-alert>
                        </b-tab>

                        <!-- Schedule Responses Tab -->
                        <b-tab title="Schedule Responses">
                            <h6 class="fw-bold text-dark mb-3">Schedule Responses</h6>
                            <b-table striped hover :items="bid.bids_schedule_responses || []" :fields="scheduleFields"></b-table>
                            <b-alert v-if="!bid.bids_schedule_responses || bid.bids_schedule_responses.length === 0" variant="info" show>
                                No schedule responses yet.
                            </b-alert>
                        </b-tab>

                        <!-- Technical Responses Tab -->
                        <b-tab title="Technical Responses">
                            <h6 class="fw-bold text-dark mb-3">Technical Responses</h6>
                            <b-table striped hover :items="bid.bids_technical_responses || []" :fields="technicalFields"></b-table>
                            <b-alert v-if="!bid.bids_technical_responses || bid.bids_technical_responses.length === 0" variant="info" show>
                                No technical responses yet.
                            </b-alert>
                        </b-tab>

                        <!-- Evaluations Tab -->
                        <b-tab title="Evaluations" v-if="bid && (bid.bids_evaluations || []).length > 0">
                            <h6 class="fw-bold text-dark mb-3">Bid Evaluations</h6>
                            <b-table striped hover :items="bid.bids_evaluations || []" :fields="evaluationFields"></b-table>
                        </b-tab>

                        <!-- Audit Logs Tab -->
                        <b-tab title="Audit Logs" v-if="bid && (bid.bids_audit_logs || []).length > 0">
                            <h6 class="fw-bold text-dark mb-3">Audit Logs</h6>
                            <b-table striped hover :items="bid.bids_audit_logs || []" :fields="auditFields"></b-table>
                        </b-tab>
                    </b-tabs>

                    <!-- Bidders list only if there are bidders -->
                    <div v-if="bidders.length > 0" class="mt-4">
                        <h5 class="fw-bold text-dark mb-3">All Bidders for this Tender</h5>
                        <div v-for="bidder in bidders" :key="bidder.id" class="border-bottom py-3">
                            <div class="d-flex justify-content-between align-items-start flex-column flex-md-row">
                                <div>
                                    <h6 class="fw-bold text-dark mb-1">{{ bidder.company?.name || 'Unknown Company' }}</h6>
                                    <p class="small text-muted mb-1">
                                        Status: <span :class="['badge', getStatusClass(bidder.status)]">{{ (bidder.status || '').toUpperCase() }}</span> | Total Price: {{ bidder.total_price || 0 }} {{ bidder.currency || '' }}
                                    </p>
                                    <p class="small text-muted mb-1">
                                        Submission: {{ formatDateTime(bidder.submission_date) }}
                                    </p>
                                </div>
                                <div class="mt-3 mt-md-0">
                                    <b-button-group size="sm">
                                        <b-button variant="outline-primary" @click="viewBidderDetails(bidder)">
                                            View Bidder Details
                                        </b-button>
                                    </b-button-group>
                                </div>
                            </div>
                        </div>
                    </div>
                    <b-alert v-else variant="info" class="mt-3" show>
                        No other bidders for this tender.
                    </b-alert>
                </div>
            </b-overlay>
        </b-container>
    </VerticalLayout>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import VerticalLayout from "@/layouts/VerticalLayout.vue";
import Timeline from 'primevue/timeline';
import { api } from '@/services/authService';
import { useRouter, useRoute } from 'vue-router';

const bid = ref(null);
const tender = ref(null);
const bidders = ref([]);
const loading = ref(true);
const error = ref(null);
const router = useRouter();
const route = useRoute();
const uploading = ref(false);
const newDocument = ref({
    tender_document: null,
    file: null,
    description: ''
});

const stages = ref([
    { label: 'Notice', value: 'notice', icon: 'pi-flag-fill' },
    { label: 'Published', value: 'published', icon: 'pi-star-fill' },
    { label: 'Evaluation', value: 'evaluation', icon: 'pi-sort-alt-slash' },
    { label: 'Awarded', value: 'awarded', icon: 'pi-star-fill' },
    { label: 'Closed', value: 'closed', icon: 'pi-lock' }
]);

const getMarkerStyle = (value) => {
    if (isCompleted(value)) return { backgroundColor: 'green' };
    if (isCurrent(value)) return { backgroundColor: 'blue' };
    return { backgroundColor: 'gray' };
};

const getMarkerIcon = (value) => {
    if (isCompleted(value)) return 'pi-check';
    if (isCurrent(value)) return 'pi-spinner pi-spin';
    return 'pi-circle';
};

const isCompleted = (value) => getStageIndex(value) < currentIndex.value;
const isCurrent = (value) => getStageIndex(value) === currentIndex.value;

const currentIndex = ref(0);  // Default to 0, update in onMounted or computed if needed

const getStageIndex = (value) => stages.value.findIndex(s => s.value.toLowerCase() === value.toLowerCase());

const documentFields = [
    { key: 'tender_document.name', label: 'Document Name' },
    { key: 'description', label: 'Description' },
    { key: 'submitted_at', label: 'Submitted At', formatter: 'formatDateTime' },
    { key: 'actions', label: 'Actions' }
];

const financialFields = [
    { key: 'financial_requirement.name', label: 'Requirement' },
    { key: 'actual_value', label: 'Actual Value' },
    { key: 'complied', label: 'Complied', formatter: value => value ? 'Yes' : 'No' },
    { key: 'notes', label: 'Notes' }
];

const turnoverFields = [
    { key: 'turnover_requirement.label', label: 'Requirement' },
    { key: 'actual_amount', label: 'Actual Amount' },
    { key: 'currency', label: 'Currency' },
    { key: 'complied', label: 'Complied', formatter: value => value ? 'Yes' : 'No' },
    { key: 'notes', label: 'Notes' }
];

const experienceFields = [
    { key: 'experience_requirement.type', label: 'Type' },
    { key: 'complied', label: 'Complied', formatter: value => value ? 'Yes' : 'No' },
    { key: 'notes', label: 'Notes' }
];

const personnelFields = [
    { key: 'personnel_requirement.role', label: 'Role' },
    { key: 'complied', label: 'Complied', formatter: value => value ? 'Yes' : 'No' },
    { key: 'notes', label: 'Notes' }
];

const officeFields = [
    { key: 'tender_document.name', label: 'Document' },
    { key: 'offices', label: 'Offices', formatter: value => value.map(o => o.name).join(', ') }
];

const sourceFields = [
    { key: 'tender_document.name', label: 'Document' },
    { key: 'total_amount', label: 'Total Amount' },
    { key: 'currency', label: 'Currency' },
    { key: 'notes', label: 'Notes' }
];

const litigationFields = [
    { key: 'tender_document.name', label: 'Document' },
    { key: 'no_litigation', label: 'No Litigation', formatter: value => value ? 'Yes' : 'No' },
    { key: 'notes', label: 'Notes' }
];

const scheduleFields = [
    { key: 'schedule_item.commodity', label: 'Commodity' },
    { key: 'proposed_quantity', label: 'Proposed Quantity' },
    { key: 'proposed_delivery_date', label: 'Proposed Delivery Date', formatter: 'formatDate' },
    { key: 'notes', label: 'Notes' }
];

const technicalFields = [
    { key: 'technical_specification.category', label: 'Category' },
    { key: 'description', label: 'Description' },
    { key: 'complied', label: 'Complied', formatter: value => value ? 'Yes' : 'No' },
    { key: 'notes', label: 'Notes' }
];

const evaluationFields = [
    { key: 'evaluator.email', label: 'Evaluator' },
    { key: 'score', label: 'Score' },
    { key: 'comments', label: 'Comments' },
    { key: 'evaluated_at', label: 'Evaluated At', formatter: 'formatDateTime' }
];

const auditFields = [
    { key: 'user.email', label: 'User' },
    { key: 'action', label: 'Action' },
    { key: 'details', label: 'Details' },
    { key: 'created_at', label: 'Created At', formatter: 'formatDateTime' }
];

const fetchBidDetails = async () => {
    loading.value = true;
    const id = route.params.id;  // Use id from route
    
    try {
        // Fetch bid by id
        const bidResponse = await api.get(`bids/${id}/`);
        bid.value = bidResponse.data;
        tender.value = bid.value.tender;

        // Fetch all bidders for the tender
        const biddersResponse = await api.get(`bids/?tender=${tender.value.id}`);
        bidders.value = biddersResponse.data.filter(b => b.id !== id);

        // Update currentIndex based on tender.status
        currentIndex.value = getStageIndex(tender.value.status.toLowerCase());
    } catch (err) {
        error.value = 'Failed to load bid details. Please try again later.';
        console.error('Error fetching bid:', err);
    } finally {
        loading.value = false;
    }
};

const uploadDocument = async () => {
    uploading.value = true;
    try {
        const formData = new FormData();
        formData.append('tender_document', newDocument.value.tender_document);
        formData.append('file', newDocument.value.file);
        formData.append('description', newDocument.value.description);

        await api.post(`bids/${bid.value.id}/documents/`, formData, {
            headers: { 'Content-Type': 'multipart/form-data' }
        });
        alert('Document uploaded successfully!');
        await fetchBidDetails();  // Refresh bid data
        newDocument.value = { tender_document: null, file: null, description: '' };
    } catch (err) {
        console.error('Error uploading document:', err);
        alert('Failed to upload document: ' + (err.response?.data?.error || 'Unknown error'));
    } finally {
        uploading.value = false;
    }
};

const viewDocument = (document) => {
    // Assume document.file is a URL
    if (document.file) {
        window.open(document.file, '_blank');
    } else {
        alert('No file available for this document.');
    }
};

const deleteDocument = async (document) => {
    if (confirm('Are you sure you want to delete this document?')) {
        try {
            await api.delete(`bids/${bid.value.id}/documents/${document.id}/`);
            alert('Document deleted successfully!');
            await fetchBidDetails();
        } catch (err) {
            console.error('Error deleting document:', err);
            alert('Failed to delete document.');
        }
    }
};

const formatDate = (date) => {
    if (!date) return 'N/A';
    const d = new Date(date);
    return d.toLocaleDateString('en-US', { day: '2-digit', month: 'short', year: 'numeric' });
};

const formatDateTime = (date) => {
    if (!date) return 'N/A';
    const d = new Date(date);
    return d.toLocaleString('en-US', { year: 'numeric', month: 'short', day: '2-digit', hour: 'numeric', minute: '2-digit', hour12: true });
};

const formatFramework = (tenderData) => {
    if (!tenderData) return 'N/A';
    if (tenderData.is_framework) return 'Framework';
    if (tenderData.status === 'closed') return 'Closed Framework';
    return 'Open Framework';
};

const getStatusClass = (status) => {
    switch (status || '') {
        case 'draft':
            return 'bg-warning';
        case 'submitted':
            return 'bg-info';
        case 'under_evaluation':
            return 'bg-primary';
        case 'accepted':
            return 'bg-success';
        case 'rejected':
            return 'bg-danger';
        case 'withdrawn':
            return 'bg-secondary';
        default:
            return 'bg-secondary';
    }
};

const viewBidderDetails = (bidder) => {
    alert('Bidder details view not implemented yet.');
    console.log('View bidder:', bidder);
    // router.push(`/bids/${bidder.id}`);
};

onMounted(() => {
    fetchBidDetails();
});
</script>

<style scoped>
h5, h6 {
  margin-bottom: 0.25rem;
}
p {
  margin-bottom: 0.25rem;
}
.badge {
  font-size: 0.75rem;
}
.border-bottom {
  border-bottom: 1px solid #dee2e6;
}
.py-3 {
  padding-top: 1rem;
  padding-bottom: 1rem;
}
.mb-4 {
  margin-bottom: 1.5rem;
}
.mb-3 {
  margin-bottom: 1rem;
}
.mb-1 {
  margin-bottom: 0.25rem;
}
.bg-light {
  background-color: #f8f9fa !important;
}

/* Timeline Styles (adjust as needed for PrimeVue) */
.custom-marker {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 2rem;
  height: 2rem;
  border-radius: 50%;
  color: #fff;
}
</style>