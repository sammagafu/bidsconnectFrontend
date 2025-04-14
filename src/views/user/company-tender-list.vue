<template>
    <VerticalLayout>
        <div class="card p-3">
            <!-- Filters -->
            <div class="filters mb-4 p-3 bg-light rounded">
                <div class="row g-3 align-items-center">
                    <!-- Search by Keyword -->
                    <div class="col-auto">
                        <input type="text" v-model="filters.keyword" class="form-control form-control-sm" placeholder="Search by keyword" />
                    </div>
                    <!-- Tender Category -->
                    <div class="col-auto">
                        <select v-model="filters.category" class="form-select form-select-sm" @change="applyFilters">
                            <option v-for="category in categories" :key="category.id" :value="category.id">
                                {{ category.name }}
                            </option>
                        </select>
                    </div>
                    <!-- Status -->
                    <div class="col-auto">
                        <select v-model="filters.status" class="form-select form-select-sm" @change="applyFilters">
                            <option v-for="status in statuses" :key="status.value" :value="status.value">
                                {{ status.label }}
                            </option>
                        </select>
                    </div>
                    <!-- Country Type -->
                    <div class="col-auto">
                        <select v-model="filters.tender_type_country" class="form-select form-select-sm" @change="applyFilters">
                            <option v-for="country in tenderTypeCountries" :key="country.value" :value="country.value">
                                {{ country.label }}
                            </option>
                        </select>
                    </div>
                    <!-- Search and Clear Buttons -->
                    <div class="col-auto">
                        <button class="btn btn-sm btn-warning" @click="applyFilters">
                            <i class="bi bi-search me-1"></i> Search
                        </button>
                    </div>
                    <div class="col-auto">
                        <button class="btn btn-sm btn-outline-secondary" @click="clearFilters">
                            <i class="bi bi-x me-1"></i> Clear
                        </button>
                    </div>
                </div>
                <!-- Showing and Sort -->
                <div class="row mt-3 align-items-center">
                    <div class="col-auto">
                        <span class="text-muted small">
                            Showing {{ paginatedTenders.start }} - {{ paginatedTenders.end }} of {{ totalCount }} items
                        </span>
                    </div>
                    <div class="col-auto ms-auto">
                        <select v-model="sortOption" class="form-select form-select-sm" @change="applySort">
                            <option v-for="option in sortOptions" :key="option.value" :value="option.value">
                                {{ option.label }}
                            </option>
                        </select>
                    </div>
                </div>
            </div>

            <!-- Tender List -->
            <div v-if="loading">
                <div v-for="i in 6" :key="i" class="d-flex flex-column flex-sm-row align-items-start p-3 border-top">
                    <div class="placeholder-glow me-3">
                        <span class="placeholder col-12" style="width: 64px; height: 64px;"></span>
                    </div>
                    <div class="flex-grow-1">
                        <div class="placeholder-glow">
                            <span class="placeholder col-6 mb-2" style="height: 1.5rem;"></span>
                            <span class="placeholder col-4 mb-2" style="height: 1rem;"></span>
                            <span class="placeholder col-8 mb-2" style="height: 1rem;"></span>
                            <div class="d-flex gap-2">
                                <span class="placeholder col-2" style="height: 1rem;"></span>
                                <span class="placeholder col-3" style="height: 1rem;"></span>
                            </div>
                        </div>
                    </div>
                    <div class="ms-auto">
                        <span class="placeholder col-12" style="width: 100px; height: 2rem;"></span>
                    </div>
                </div>
            </div>
            <div v-else>
                <div v-for="(tender, index) in paginatedTenders.data" :key="tender.id" 
                    class="d-flex flex-column flex-sm-row align-items-start p-3 tender-item" 
                    :class="{ 'border-top': index !== 0 }">
                    <!-- Organization Logo -->
                    <div class="me-3 bg-light d-flex align-items-center justify-content-center" style="width: 64px; height: 64px;">
                        <i class="bi bi-building text-muted fs-3"></i>
                    </div>
                    <!-- Tender Details -->
                    <div class="flex-grow-1">
                        <h5 class="fw-bold text-dark mb-1">{{ tender.title }}</h5>
                        <div class="text-muted small mb-1">{{ tender.organization || 'N/A' }}</div>
                        <div class="text-muted small mb-1">
                            Invitation Date: {{ formatDate(tender.invitation_date) }} | 
                            Submission Deadline: {{ formatDate(tender.submission_deadline) }} | 
                            Number: {{ tender.reference_number }}
                        </div>
                        <div class="d-flex gap-2">
                            <span class="badge bg-success">{{ tender.tender_type_sector || 'Tender' }}</span>
                            <span :class="['badge', getStatusClass(tender.status)]">{{ tender.status }}</span>
                        </div>
                    </div>
                    <!-- Actions -->
                    <div class="ms-auto d-flex gap-2">
                        <button class="btn btn-sm btn-success" :disabled="tender.status !== 'published'" @click="applyForTender(tender)">
                            <i class="bi bi-check me-1"></i> Apply/Bid
                        </button>
                        <button class="btn btn-sm btn-outline-primary" @click="viewTenderDetails(tender)">
                            <i class="bi bi-eye me-1"></i> View Details
                        </button>
                    </div>
                </div>
            </div>
        </div>
    </VerticalLayout>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue';
import VerticalLayout from '@/layouts/VerticalLayout.vue'; // Import the layout component
import { api } from '@/services/authService'; // Pre-configured axios instance

const tenders = ref([]);
const totalCount = ref(0);
const categories = ref([]);
const loading = ref(false);
const filters = ref({
    keyword: '',
    category: null,
    status: null,
    tender_type_country: null
});
const sortOption = ref('invitation_date_desc');
const sortOptions = ref([
    { label: 'Sort by: Invitation Date (New First)', value: 'invitation_date_desc' },
    { label: 'Sort by: Invitation Date (Old First)', value: 'invitation_date_asc' },
    { label: 'Sort by: Submission Deadline (New First)', value: 'submission_deadline_desc' },
    { label: 'Sort by: Submission Deadline (Old First)', value: 'submission_deadline_asc' }
]);

// Tender statuses
const statuses = ref([
    { label: 'All Statuses', value: null },
    { label: 'Published', value: 'published' },
    { label: 'Under Evaluation', value: 'evaluation' },
    { label: 'Awarded', value: 'awarded' },
    { label: 'Closed', value: 'closed' }
]);

// Tender Type Country options
const tenderTypeCountries = ref([
    { label: 'All Country Types', value: null },
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
        totalCount.value = response.data.count || tenders.value.length;
    } catch (error) {
        console.error('Failed to fetch tenders:', error);
        showToast('danger', 'Error', 'Failed to fetch tenders');
    } finally {
        loading.value = false;
    }
};

// Fetch categories from the backend
const fetchCategories = async () => {
    try {
        const response = await api.get('tenders/categories/');
        categories.value = [{ id: null, name: 'All Tender Categories' }, ...(response.data || [])];
    } catch (error) {
        console.error('Failed to fetch categories:', error);
        showToast('danger', 'Error', 'Failed to fetch categories');
    }
};

// Computed property for filtered tenders
const filteredTenders = computed(() => {
    let filtered = [...tenders.value];
    
    // Keyword filter
    if (filters.value.keyword) {
        const keyword = filters.value.keyword.toLowerCase();
        filtered = filtered.filter(tender => 
            tender.title?.toLowerCase().includes(keyword) ||
            tender.organization?.toLowerCase().includes(keyword) ||
            tender.reference_number?.toLowerCase().includes(keyword)
        );
    }
    
    // Category filter
    if (filters.value.category) {
        filtered = filtered.filter(tender => tender.category?.id === filters.value.category);
    }
    
    // Status filter
    if (filters.value.status) {
        filtered = filtered.filter(tender => tender.status === filters.value.status);
    }
    
    // Country Type filter
    if (filters.value.tender_type_country) {
        filtered = filtered.filter(tender => tender.tender_type_country === filters.value.tender_type_country);
    }
    
    // Apply sorting
    if (sortOption.value === 'invitation_date_desc') {
        filtered.sort((a, b) => new Date(b.invitation_date) - new Date(a.invitation_date));
    } else if (sortOption.value === 'invitation_date_asc') {
        filtered.sort((a, b) => new Date(a.invitation_date) - new Date(b.invitation_date));
    } else if (sortOption.value === 'submission_deadline_desc') {
        filtered.sort((a, b) => new Date(b.submission_deadline) - new Date(a.submission_deadline));
    } else if (sortOption.value === 'submission_deadline_asc') {
        filtered.sort((a, b) => new Date(a.submission_deadline) - new Date(b.submission_deadline));
    }
    
    return filtered;
});

// Pagination (showing 10 items per page for simplicity)
const paginatedTenders = computed(() => {
    const pageSize = 10;
    const start = 0;
    const end = Math.min(start + pageSize, filteredTenders.value.length);
    const data = filteredTenders.value.slice(start, end);
    return { start: start + 1, end, data };
});

// Apply filters (triggered by filter changes or search button)
const applyFilters = () => {
    // No additional action needed as filteredTenders recomputes automatically
};

// Apply sort (triggered by sort dropdown change)
const applySort = () => {
    // No additional action needed as filteredTenders recomputes automatically
};

// Clear filters
const clearFilters = () => {
    filters.value = {
        keyword: '',
        category: null,
        status: null,
        tender_type_country: null
    };
    sortOption.value = 'invitation_date_desc';
};

// Format date for display
const formatDate = (dateString) => {
    return dateString ? new Date(dateString).toLocaleString('en-US', { dateStyle: 'medium' }) : 'N/A';
};

// Get status class for badge
const getStatusClass = (status) => {
    switch (status) {
        case 'published': return 'bg-success';
        case 'evaluation': return 'bg-info';
        case 'awarded': return 'bg-info';
        case 'closed': return 'bg-danger';
        default: return 'bg-secondary';
    }
};

// Show Bootstrap toast
const showToast = (type, title, message) => {
    const toastEl = document.createElement('div');
    toastEl.className = `toast align-items-center text-bg-${type} border-0`;
    toastEl.innerHTML = `
        <div class="d-flex">
            <div class="toast-body">
                <strong>${title}</strong>: ${message}
            </div>
            <button type="button" class="btn-close btn-close-white me-2 m-auto" data-bs-dismiss="toast"></button>
        </div>
    `;
    document.body.appendChild(toastEl);
    const toast = new bootstrap.Toast(toastEl, { delay: 3000 });
    toast.show();
};

// Apply/Bid for tender
const applyForTender = (tender) => {
    if (tender.status === 'published') {
        showToast('info', 'Apply/Bid', `Applying for ${tender.title}`);
        // Add logic for bid submission here (e.g., API call or navigation)
    }
};

// View tender details
const viewTenderDetails = (tender) => {
    showToast('info', 'View Tender', `Viewing details for ${tender.title}`);
    // Add logic for navigation (e.g., router.push('/tenders/' + tender.id)) or modal
};
</script>
