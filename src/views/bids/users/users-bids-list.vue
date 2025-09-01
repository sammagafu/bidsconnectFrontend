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
                                <router-link :to="{ name: 'company.bids-detail', params: { slug: getTenderSlug(bid.tender) } }" class="text-decoration-none">
                                    <h5 class="fw-bold text-dark mb-1">{{ bid.tender.title }}</h5>
                                </router-link>
                                <p class="small text-muted mb-1">
                                    {{ bid.tender.agency?.name || 'Unknown Agency' }} | Ref: {{ bid.tender.reference_number }} | Submission: {{ formatDateTime(bid.tender.submission_deadline) }}
                                </p>
                                <div class="d-flex gap-2">
                                    <span class="badge bg-success">{{ formatFramework(bid.tender) }}</span>
                                    <span :class="['badge', getStatusClass(bid.status)]">{{ bid.status.toUpperCase() }}</span>
                                </div>
                            </div>
                            <div class="mt-3 mt-md-0">
                                <b-button-group size="sm">
                                    <b-button variant="outline-primary" @click="viewDetails(bid)">
                                        View Details
                                    </b-button>
                                    <b-button variant="outline-primary" @click="viewBid(bid)">
                                        Publish Bid
                                    </b-button>
                                    <b-button variant="outline-primary" @click="openingReport(bid)">
                                        Opening Report
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

const fetchBids = async () => {
    loading.value = true;
    const companies = authStore.user?.companies;
    
    if (!companies || companies.length === 0) {
        error.value = 'No companies found for user';
        loading.value = false;
        return;
    }
    
    // Aggregate bids from all companies if user has multiple
    let allBids = [];
    for (const company of companies) {
        const company_id = company.id;
        if (!company_id) continue;
        
        try {
            const response = await api.get(`bids/by-company/?company_id=${company_id}`);
            allBids = [...allBids, ...response.data];
        } catch (err) {
            console.error(`Error fetching bids for company ${company_id}:`, err);
            // Optionally set error if all fail, but continue to fetch others
        }
    }
    
    bids.value = allBids;
    if (bids.value.length === 0) {
        error.value = 'No bids found across your companies.';
    }
    loading.value = false;
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
    if (tender.status === 'closed') return 'Closed Framework...';
    return 'Open Framework...';
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
    router.push({ name: 'company.bids-detail', params: { slug: getTenderSlug(bid.tender) } });
};

const viewBid = (bid) => {
    router.push(`/bids/${bid.id}`);
};

const openingReport = (bid) => {
    console.log('Opening report for bid:', bid.id);
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