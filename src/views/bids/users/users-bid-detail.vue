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
                            <p class="mb-1"><strong>Agency:</strong> {{ tender.agency?.name || 'Unknown Agency' }}</p>
                            <p class="mb-1"><strong>Reference Number:</strong> {{ tender.reference_number || 'N/A' }}</p>
                            <p class="mb-1"><strong>Submission Deadline:</strong> {{ formatDateTime(tender.submission_deadline) }}</p>
                            <p class="mb-1"><strong>Status:</strong> <span :class="['badge', getStatusClass(tender.status)]">{{ (tender.status || '').toUpperCase() }}</span></p>
                            <p class="mb-1"><strong>Framework:</strong> {{ formatFramework(tender) }}</p>
                            <!-- Add more tender fields as needed, e.g., description, category -->
                        </div>
                    </div>
                    <b-alert v-else variant="warning" show>
                        Tender details not available.
                    </b-alert>

                    <!-- Your Bid details -->
                    <div v-if="bid" class="mb-4">
                        <h5 class="fw-bold text-dark mb-3">Your Bid Details</h5>
                        <div class="border p-3 rounded bg-light">
                            <p class="mb-1"><strong>Total Price:</strong> {{ bid.total_price || 0 }} {{ bid.currency || '' }}</p>
                            <p class="mb-1"><strong>Status:</strong> <span :class="['badge', getStatusClass(bid.status)]">{{ (bid.status || '').toUpperCase() }}</span></p>
                            <p class="mb-1"><strong>Submission Date:</strong> {{ formatDateTime(bid.submission_date) }}</p>
                            <!-- Add more bid fields as needed, e.g., proposed_completion_days -->
                        </div>
                    </div>
                    <b-alert v-else variant="warning" show>
                        Bid details not available.
                    </b-alert>

                    <!-- Bidders list only if there are bidders -->
                    <div v-if="bidders.length > 0">
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
import { api } from '@/services/authService';
import { useRouter, useRoute } from 'vue-router';

const bid = ref(null);
const tender = ref(null);
const bidders = ref([]);
const loading = ref(true);
const error = ref(null);
const router = useRouter();
const route = useRoute();

const fetchBidDetails = async () => {
    loading.value = true;
    const bidId = route.params.id;
    
    if (!bidId || bidId === 'undefined') {
        error.value = 'Invalid bid ID.';
        loading.value = false;
        return;
    }
    
    try {
        const bidResponse = await api.get(`bids/${bidId}/`);
        bid.value = bidResponse.data;
        tender.value = bid.value.tender;  // Assuming tender is nested in bid response

        // Fetch all bidders (bids) for the tender, excluding your own bid if needed
        const biddersResponse = await api.get(`bids/?tender=${tender.value.id}`);
        bidders.value = biddersResponse.data.filter(b => b.id !== bidId);  // Exclude your own bid from bidders list
    } catch (err) {
        error.value = 'Failed to load bid details. Please try again later.';
        console.error('Error fetching bid:', err);
    } finally {
        loading.value = false;
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
    if (tenderData.status === 'closed') return 'Closed Framework...';
    return 'Open Framework...';
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
    router.push(`/bids/${bidder.id}`);
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
</style>