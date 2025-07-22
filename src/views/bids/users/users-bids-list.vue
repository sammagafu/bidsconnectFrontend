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
                    
                    <b-row>
                        <b-col v-for="bid in bids" 
                               :key="bid.id" 
                               cols="12" 
                               class="mb-4">
                            <b-card>
                                <b-card-title>
                                    <div class="d-flex justify-content-between align-items-center">
                                        <span>Tender ID: {{ bid.tender }}</span>
                                        <b-badge :variant="getBidStatusVariant(bid.status)">
                                            {{ bid.status.toUpperCase() }}
                                        </b-badge>
                                    </div>
                                </b-card-title>

                                <b-card-text>
                                    <div class="mb-2">
                                        <strong>Validity Days:</strong> {{ bid.validity_days }} days
                                    </div>
                                    <div class="mb-2 text-muted">
                                        <strong>Submitted on:</strong> 
                                        {{ bid.submission_date ? formatDate(bid.submission_date) : 'Not submitted yet' }}
                                    </div>
                                    <div class="mb-2">
                                        <strong>Documents:</strong> 
                                        {{ bid.documents.length || 'No documents attached' }}
                                    </div>
                                </b-card-text>

                                <template #footer>
                                    <div class="d-flex justify-content-end gap-2">
                                        <b-button
                                            variant="outline-secondary"
                                            :disabled="bid.status !== 'draft'"
                                            @click="modifyBid(bid)"
                                        >
                                            <i class="bx bx-edit me-1"></i>
                                            Modify
                                        </b-button>
                                        <b-button
                                            variant="success"
                                            :disabled="bid.status !== 'draft'"
                                            @click="submitBid(bid)"
                                        >
                                            <i class="bx bx-check me-1"></i>
                                            Submit
                                        </b-button>
                                    </div>
                                </template>
                            </b-card>
                        </b-col>
                    </b-row>
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
    try {
        loading.value = true;
        const companies = authStore.user?.companies;
        
        if (!companies || companies.length === 0) {
            throw new Error('No companies found for user');
        }
        
        // Get the first company ID (assuming user is working with their primary company)
        const company_id = companies[0].id;
        
        if (!company_id) {
            throw new Error('Company ID not found');
        }
        
        const response = await api.get(`bids/bids/by-company/?company_id=${company_id}`);
        bids.value = response.data;
    } catch (err) {
        error.value = err.message === 'No companies found for user'
            ? 'Unable to fetch bids: No companies found for user'
            : 'Failed to load bids. Please try again later.';
        console.error('Error fetching bids:', err);
    } finally {
        loading.value = false;
    }
};

const formatDate = (date) => {
    return new Date(date).toLocaleDateString();
};

const getBidStatusVariant = (status) => {
    const statusVariants = {
        'draft': 'warning',
        'submitted': 'info',
        'accepted': 'success',
        'rejected': 'danger'
    };
    return statusVariants[status.toLowerCase()] || 'secondary';
};

const modifyBid = (bid) => {
    router.push(`/bids/${bid.id}/edit`);
};

const submitBid = async (bid) => {
    try {
        if (!confirm('Are you sure you want to submit this bid?')) return;
        
        loading.value = true;
        await api.post(`bids/bids/${bid.id}/submit/`);
        await fetchBids(); // Refresh the list after submission
    } catch (err) {
        error.value = 'Failed to submit bid. Please try again later.';
        console.error('Error submitting bid:', err);
    } finally {
        loading.value = false;
    }
};

onMounted(() => {
    fetchBids();
});
</script>

<style scoped>
.gap-2 {
    gap: 0.5rem;
}

/* Optional: Add smooth transition for buttons */
.btn {
    transition: all 0.2s;
}
</style>