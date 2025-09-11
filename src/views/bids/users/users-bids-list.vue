<template>
    <VerticalLayout>
        <b-container class="py-4">
            <h1 class="h3 mb-4">My Bids</h1>
            
            <!-- Loading state -->
            <b-overlay :show="loading" rounded="sm">
                <!-- Error state -->
                <b-alert v-if="error" variant="danger" show>
                    {{ error }}
                </b-alert>

                <!-- Bids list -->
                <div v-else>
                    <b-alert v-if="bids.length === 0" variant="info" show>
                        No bids found
                    </b-alert>
                    
                    <div v-for="bid in bids" :key="bid.id" class="border-bottom py-3">
                        <div class="d-flex justify-content-between align-items-start flex-column flex-md-row">
                            <div>
                                <router-link :to="{ name: 'company.bids-detail', params: { id: bid.id } }" class="text-decoration-none">
                                    <h5 class="fw-bold text-dark mb-1">{{ bid.tender.title }}</h5>
                                </router-link>
                                <p class="small text-muted mb-1">
                                    {{ bid.tender.agency?.name || 'Unknown Agency' }} | Ref: {{ bid.tender.reference_number }} | Submission: {{ formatDateTime(bid.tender.submission_deadline) }}
                                </p>
                                <div class="d-flex gap-2">
                                    <span class="badge bg-success">{{ formatFramework(bid.tender) }}</span>
                                    <span :class="['badge', getStatusClass(bid.status)]">{{ bid.status.toUpperCase() }}</span>
                                    <span class="badge bg-danger">{{ daysLeft(bid.tender.submission_deadline) }}</span>
                                </div>
                            </div>
                            <div class="mt-3 mt-md-0">
                                <b-button-group size="sm">
                                    <b-button variant="outline-primary" @click="viewDetails(bid)">
                                        View Details
                                    </b-button>
                                    <b-button v-if="bid.status === 'draft'" variant="outline-primary" :disabled="submittingBidId === bid.id || !bid.is_ready" @click="submitBid(bid)" :title="bid.is_ready ? '' : `Missing requirements: ${bid.errors.join(', ')} - view details to fix`">
                                        <b-spinner v-if="submittingBidId === bid.id" small></b-spinner>
                                        <span v-else>Publish Bid</span>
                                    </b-button>
                                    <b-button variant="outline-primary" :disabled="generatingReportId === bid.id" @click="openingReport(bid)">
                                        <b-spinner v-if="generatingReportId === bid.id" small></b-spinner>
                                        <span v-else>Opening Report</span>
                                    </b-button>
                                </b-button-group>
                            </div>
                        </div>
                    </div>
                </div>
            </b-overlay>
        </b-container>
    </VerticalLayout>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import VerticalLayout from "@/layouts/VerticalLayout.vue";
import { api } from '@/services/authService';
import { useAuthStore } from '@/stores/auth';
import { useRouter } from 'vue-router';

const bids = ref([]);
const loading = ref(true);
const error = ref(null);
const authStore = useAuthStore();
const router = useRouter();
const submittingBidId = ref(null);
const generatingReportId = ref(null);

const fetchBids = async () => {
    loading.value = true;
    const companies = authStore.user?.companies;
    
    if (!companies || companies.length === 0) {
        error.value = 'No companies found for user';
        loading.value = false;
        return;
    }
    
    let allBids = [];
    for (const company of companies) {
        const company_id = company.id;
        if (!company_id) continue;
        
        try {
            const response = await api.get(`bids/by-company/?company_id=${company_id}`);
            const companyBids = response.data;
            // For each bid, check readiness (add is_ready and errors flags)
            for (const bid of companyBids) {
                const readiness = await checkBidReadiness(bid.id);
                bid.is_ready = readiness.is_ready;
                bid.errors = readiness.errors || [];
            }
            allBids = [...allBids, ...companyBids];
        } catch (err) {
            console.error(`Error fetching bids for company ${company_id}:`, err);
            error.value = 'Failed to fetch bids from some companies. Please try again.';
        }
    }
    
    bids.value = allBids;
    if (bids.value.length === 0) {
        error.value = 'No bids found across your companies.';
    }
    loading.value = false;
};

const checkBidReadiness = async (bidId) => {
    try {
        const response = await api.get(`bids/${bidId}/validate-submit/`);
        return {
            is_ready: response.data.is_ready,
            errors: response.data.errors || []
        };
    } catch (err) {
        console.error('Error checking bid readiness:', err);
        return {
            is_ready: false,
            errors: ['Failed to validate bid readiness (server error)']
        };
    }
};

const submitBid = async (bid) => {
    if (!bid.is_ready) {
        alert(`Cannot publish: ${bid.errors.join('; ')}. Please view details and resolve them.`);
        return;
    }
    if (confirm(`Are you sure you want to publish (submit) this bid for tender ${bid.tender.reference_number}? This action cannot be undone.`)) {
        submittingBidId.value = bid.id;
        try {
            await api.post(`bids/${bid.id}/submit/`);
            alert('Bid published successfully!');
            await fetchBids(); // Refresh to update status and readiness
        } catch (err) {
            console.error('Error submitting bid:', err);
            const errMsg = err.response?.data?.error || 'Unknown error';
            alert(`Failed to publish bid: ${errMsg}`);
        } finally {
            submittingBidId.value = null;
        }
    }
};

const daysLeft = (deadline) => {
    const now = new Date(2025, 8, 1); // Simulate Sep 1, 2025 as per query
    const dead = new Date(deadline);
    const diff = dead - now;
    if (diff < 0) {
        return 'Expired';
    }
    const days = Math.ceil(diff / (1000 * 60 * 60 * 24));
    return `${days} days left`;
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

const formatFramework = (tender) => {
    if (!tender) return 'N/A';
    if (tender.is_framework) return 'Framework';
    if (tender.status === 'closed') return 'Closed Framework';
    return 'Open Framework';
};

const getStatusClass = (status) => {
    switch (status) {
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

const getTenderSlug = (tender) => {
    if (!tender) return '';
    return tender.slug || tender.reference_number.replace(/[^a-zA-Z0-9]+/g, '').toLowerCase();
};

const viewDetails = (bid) => {
    router.push({ name: 'company.bids-detail', params: { id: bid.id } });
};

const openingReport = async (bid) => {
    generatingReportId.value = bid.id;
    try {
        const response = await api.get(`bids/${bid.id}/opening-report/`, { responseType: 'blob' });
        const blob = new Blob([response.data], { type: 'application/pdf' });
        const url = window.URL.createObjectURL(blob);
        window.open(url, '_blank');
    } catch (err) {
        console.error('Error generating opening report:', err);
        alert('Failed to generate opening report: ' + (err.response?.data?.error || 'Unknown error'));
    } finally {
        generatingReportId.value = null;
    }
};

onMounted(() => {
    fetchBids();
});
</script>

<style scoped>
h5 {
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
</style>