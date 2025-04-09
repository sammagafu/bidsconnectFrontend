<template>
<VerticalLayout>
<div class="card">
        <!-- Filters -->
        <div class="filters mb-6">
            <h4 class="mb-3">Filter Tenders</h4>
            <div class="flex flex-wrap gap-4">
                <div class="flex flex-col">
                    <label for="filter-category" class="font-bold mb-2">Category</label>
                    <Select id="filter-category" v-model="filters.category" :options="categories" 
                        optionLabel="name" optionValue="id" placeholder="All Categories" fluid 
                        @change="applyFilters" />
                </div>
                <div class="flex flex-col">
                    <label for="filter-status" class="font-bold mb-2">Status</label>
                    <Select id="filter-status" v-model="filters.status" :options="statuses" 
                        optionLabel="label" optionValue="value" placeholder="All Statuses" fluid 
                        @change="applyFilters" />
                </div>
                <div class="flex flex-col">
                    <label for="filter-country" class="font-bold mb-2">Country Type</label>
                    <Select id="filter-country" v-model="filters.tender_type_country" :options="tenderTypeCountries" 
                        optionLabel="label" optionValue="value" placeholder="All Country Types" fluid 
                        @change="applyFilters" />
                </div>
            </div>
        </div>

        <!-- DataView with List Layout -->
        <DataView :value="filteredTenders" layout="list">
            <template #list>
                <div v-if="loading" class="flex flex-col">
                    <div v-for="i in 6" :key="i">
                        <div class="flex flex-col xl:flex-row xl:items-start p-6 gap-6" 
                            :class="{ 'border-t border-surface-200 dark:border-surface-700': i !== 0 }">
                            <Skeleton class="!w-9/12 sm:!w-64 xl:!w-40 !h-24 mx-auto" />
                            <div class="flex flex-col sm:flex-row justify-between items-center xl:items-start flex-1 gap-6">
                                <div class="flex flex-col items-center sm:items-start gap-4">
                                    <Skeleton width="8rem" height="2rem" />
                                    <Skeleton width="6rem" height="1rem" />
                                    <div class="flex items-center gap-4">
                                        <Skeleton width="6rem" height="1rem" />
                                        <Skeleton width="3rem" height="1rem" />
                                    </div>
                                    <Skeleton width="10rem" height="1rem" />
                                    <Skeleton width="12rem" height="1rem" />
                                </div>
                                <div class="flex sm:flex-col items-center sm:items-end gap-4 sm:gap-2">
                                    <Skeleton width="4rem" height="2rem" />
                                    <Skeleton size="3rem" shape="circle" />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                <div v-else class="flex flex-col">
                    <div v-for="(tender, index) in filteredTenders" :key="tender.id" 
                        class="flex flex-col xl:flex-row xl:items-start p-6 gap-6 tender-item" 
                        :class="{ 'border-t border-surface-200 dark:border-surface-700': index !== 0 }">
                        <!-- Tender Icon/Image -->
                        <div class="w-9/12 sm:w-64 xl:w-40 h-24 mx-auto bg-gray-200 flex items-center justify-center">
                            <i class="pi pi-file text-3xl text-gray-500"></i>
                        </div>
                        <!-- Tender Details -->
                        <div class="flex flex-col sm:flex-row justify-between items-center xl:items-start flex-1 gap-6">
                            <div class="flex flex-col items-center sm:items-start gap-4 text-primary px-6">
                                <h5 class="text-xl font-bold">{{ tender.title }}</h5>
                                <div class="text-sm text-gray-600">Ref: {{ tender.reference_number }}</div>
                                <div class="text-sm">Category: {{ tender.category?.name || 'N/A' }}</div>
                                <div class="text-sm">Subcategory: {{ tender.subcategory?.name || 'N/A' }}</div>
                                <div class="text-sm">Country: {{ tender.tender_type_country }}</div>
                                <div class="text-sm">Sector: {{ tender.tender_type_sector }}</div>
                                <div class="text-sm">Procurement Process: {{ tender.procurement_process?.name || 'N/A' }}</div>
                                <div class="text-sm">Description: {{ tender.tenderdescription || 'No description available' }}</div>
                                <div class="text-sm">Budget: {{ tender.estimated_budget ? `${tender.estimated_budget} ${tender.currency}` : 'N/A' }}</div>
                                <div class="text-sm">Bid Bond: {{ tender.bid_bond_percentage ? `${tender.bid_bond_percentage}%` : 'N/A' }}</div>
                                <div class="text-sm">Address: {{ tender.address || 'N/A' }}</div>
                                <div class="flex items-center gap-4">
                                    <Tag :value="tender.status" :severity="getStatusLabel(tender.status)" />
                                    <span>Deadline: {{ formatDate(tender.submission_deadline) }}</span>
                                </div>
                                <div class="text-sm">Clarification Deadline: {{ formatDate(tender.clarification_deadline) || 'N/A' }}</div>
                                <div class="text-sm">Evaluation: {{ formatDate(tender.evaluation_start_date) || 'N/A' }} - {{ formatDate(tender.evaluation_end_date) || 'N/A' }}</div>
                            </div>
                            <!-- Actions -->
                            <div class="flex sm:flex-col items-center sm:items-end gap-4 sm:gap-2">
                                <Button label="Apply/Bid" icon="pi pi-check" class="p-button-success p-button-rounded" 
                                    :disabled="tender.status !== 'published'" @click="applyForTender(tender)" />
                                <Button label="Details" icon="pi pi-eye" class="p-button-rounded" 
                                    @click="viewTenderDetails(tender)" />
                            </div>
                        </div>
                    </div>
                </div>
            </template>
        </DataView>
    </div>
</VerticalLayout>
    
</template>

<script setup>
import VerticalLayout from "@/layouts/VerticalLayout.vue";

import { ref, onMounted, computed } from 'vue';
import { useToast } from 'primevue/usetoast';
import { api } from '@/services/authService'; // Pre-configured axios instance

const toast = useToast();
const tenders = ref([]);
const categories = ref([]);
const loading = ref(false);
const filters = ref({
    category: null,
    status: null,
    tender_type_country: null
});

// Tender statuses
const statuses = ref([
    { label: 'Published', value: 'published' },
    { label: 'Under Evaluation', value: 'evaluation' },
    { label: 'Awarded', value: 'awarded' },
    { label: 'Closed', value: 'closed' }
]);

// Tender Type Country options
const tenderTypeCountries = ref([
    { label: 'National Tendering', value: 'National' },
    { label: 'International Tendering', value: 'International' }
]);

// Fetch data on mount
onMounted(async () => {
    await Promise.all([
        fetchTenders(),
        fetchCategories()
    ]);
});

// Fetch tenders from the backend
const fetchTenders = async () => {
    try {
        loading.value = true;
        const response = await api.get('tenders/tenders/', {
            params: { status: 'published' } // Client view typically shows only published tenders initially
        });
        tenders.value = response.data.results || response.data || [];
    } catch (error) {
        console.error('Failed to fetch tenders:', error);
        toast.add({ severity: 'error', summary: 'Error', detail: 'Failed to fetch tenders', life: 3000 });
    } finally {
        loading.value = false;
    }
};

// Fetch categories from the backend
const fetchCategories = async () => {
    try {
        const response = await api.get('tenders/categories/');
        categories.value = [{ id: null, name: 'All Categories' }, ...(response.data || [])];
    } catch (error) {
        console.error('Failed to fetch categories:', error);
        toast.add({ severity: 'error', summary: 'Error', detail: 'Failed to fetch categories', life: 3000 });
    }
};

// Computed property for filtered tenders
const filteredTenders = computed(() => {
    let filtered = [...tenders.value];
    if (filters.value.category) {
        filtered = filtered.filter(tender => tender.category?.id === filters.value.category);
    }
    if (filters.value.status) {
        filtered = filtered.filter(tender => tender.status === filters.value.status);
    }
    if (filters.value.tender_type_country) {
        filtered = filtered.filter(tender => tender.tender_type_country === filters.value.tender_type_country);
    }
    return filtered;
});

// Apply filters (triggered by filter changes)
const applyFilters = () => {
    // No additional action needed as filteredTenders recomputes automatically
};

// Format date for display
const formatDate = (dateString) => {
    return dateString ? new Date(dateString).toLocaleString('en-US', { dateStyle: 'medium', timeStyle: 'short' }) : 'N/A';
};

// Get status label for Tag severity
const getStatusLabel = (status) => {
    switch (status) {
        case 'published': return 'success';
        case 'evaluation': return 'info';
        case 'awarded': return 'info';
        case 'closed': return 'danger';
        default: return null;
    }
};

// Apply/Bid for tender (placeholder)
const applyForTender = (tender) => {
    if (tender.status === 'published') {
        toast.add({ severity: 'info', summary: 'Apply/Bid', detail: `Applying for ${tender.title}`, life: 3000 });
        // Add logic for bid submission here (e.g., API call or navigation)
    }
};

// View tender details (placeholder for navigation or modal)
const viewTenderDetails = (tender) => {
    toast.add({ severity: 'info', summary: 'View Tender', detail: `Viewing details for ${tender.title}`, life: 3000 });
    // Add logic for navigation (e.g., router.push('/tenders/' + tender.id)) or modal
};
</script>

<style scoped>
.card {
    padding: 1rem;
}

.filters {
    padding: 1rem;
    background: #f8f9fa;
    border-radius: 0.375rem;
}

/* Adjust list item spacing and styling */
.p-dataview .p-dataview-content > div > div {
    border-top: 1px solid #e5e7eb;
}

.p-dataview .p-dataview-content > div > div:first-child {
    border-top: none;
}

.tender-item {
    background: #fff;
    border-radius: 0.375rem;
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

/* Responsive adjustments */
@media (max-width: 768px) {
    .tender-item {
        padding: 1rem;
    }
    .tender-item > div:first-child {
        margin-bottom: 1rem;
    }
}
</style>