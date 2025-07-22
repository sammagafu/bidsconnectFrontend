<template>
  <VerticalLayout>
    <div class="card p-3">
      <!-- Filters -->
      <div class="filters mb-4 p-3 bg-light rounded">
        <div class="row g-3 align-items-center">
          <div class="col-auto">
            <input type="text" v-model="filters.keyword" class="form-control form-control-sm" placeholder="Search by keyword" />
          </div>
          <div class="col-auto">
            <select v-model="filters.category" class="form-select form-select-sm">
              <option :value="null">All Categories</option>
              <option v-for="category in categories" :key="category.id" :value="category.id">
                {{ category.name }}
              </option>
            </select>
          </div>
          <div class="col-auto">
            <select v-model="filters.status" class="form-select form-select-sm">
              <option :value="null">All Statuses</option>
              <option v-for="status in statuses" :key="status.value" :value="status.value">
                {{ status.label }}
              </option>
            </select>
          </div>
          <div class="col-auto">
            <select v-model="filters.tender_type_country" class="form-select form-select-sm">
              <option :value="null">All Country Types</option>
              <option v-for="country in tenderTypeCountries" :key="country.value" :value="country.value">
                {{ country.label }}
              </option>
            </select>
          </div>
          <div class="col-auto">
            <button class="btn btn-sm btn-warning" @click="applyFilters">Search</button>
          </div>
          <div class="col-auto">
            <button class="btn btn-sm btn-outline-secondary" @click="clearFilters">Clear</button>
          </div>
        </div>
      </div>

      <!-- Tender List -->
      <div v-if="loading">
        <p>Loading tenders...</p>
      </div>
      <div v-else>
        <div v-if="filteredTenders.length === 0">
          <p>No tenders found.</p>
        </div>
        <div v-for="tender in filteredTenders" :key="tender.id" class="border-bottom py-3">
          <div class="d-flex justify-content-between align-items-start">
            <div>
              <router-link :to="{ name: 'company.tenders-detail', params: { slug: tender.slug } }" class="text-decoration-none">
                <h5 class="fw-bold text-dark mb-1">{{ tender.title }}</h5>
              </router-link>
              <p class="small text-muted mb-1">
                {{ tender.agency?.name || 'Unknown Agency' }} | Ref: {{ tender.reference_number }} | Submission: {{ formatDate(tender.submission_deadline) }}
              </p>
              <div class="d-flex gap-2">
                <span class="badge bg-success">{{ tender.tender_type_sector }}</span>
                <span :class="['badge', getStatusClass(tender.status)]">{{ tender.status }}</span>
              </div>
            </div>
            <div>
              <router-link :to="{ name: 'company.tenders-detail', params: { slug: tender.slug } }" class="btn btn-sm btn-outline-primary">
                <i class="bi bi-eye me-1"></i> View Details
              </router-link>
            </div>
          </div>
        </div>
      </div>
    </div>
  </VerticalLayout>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import VerticalLayout from '@/layouts/VerticalLayout.vue';
import { api } from '@/services/authService';

const tenders = ref([]);
const categories = ref([]);
const loading = ref(false);

const filters = ref({
  keyword: '',
  category: null,
  status: null,
  tender_type_country: null,
});

const statuses = [
  { label: 'Published', value: 'published' },
  { label: 'Evaluation', value: 'evaluation' },
  { label: 'Awarded', value: 'awarded' },
  { label: 'Closed', value: 'closed' },
];

const tenderTypeCountries = [
  { label: 'National', value: 'National' },
  { label: 'International', value: 'International' },
];

onMounted(async () => {
  await fetchCategories();
  await fetchTenders();
});

const fetchCategories = async () => {
  try {
    const res = await api.get('tenders/categories/');
    categories.value = res.data;
  } catch (error) {
    console.error('Error loading categories', error);
  }
};

const fetchTenders = async () => {
  try {
    loading.value = true;
    const res = await api.get('tenders/tenders/', { params: { status: 'published' } });
    tenders.value = res.data.results || res.data;
  } catch (error) {
    console.error('Error loading tenders', error);
  } finally {
    loading.value = false;
  }
};

const filteredTenders = computed(() => {
  return tenders.value.filter(tender => {
    const keywordMatch =
      !filters.value.keyword ||
      tender.title.toLowerCase().includes(filters.value.keyword.toLowerCase()) ||
      tender.reference_number.toLowerCase().includes(filters.value.keyword.toLowerCase());

    const categoryMatch = !filters.value.category || tender.category?.id === filters.value.category;
    const statusMatch = !filters.value.status || tender.status === filters.value.status;
    const countryMatch = !filters.value.tender_type_country || tender.tender_type_country === filters.value.tender_type_country;

    return keywordMatch && categoryMatch && statusMatch && countryMatch;
  });
});

const applyFilters = () => {
  // no-op: computed updates automatically
};

const clearFilters = () => {
  filters.value = {
    keyword: '',
    category: null,
    status: null,
    tender_type_country: null,
  };
};

const formatDate = dateStr => {
  return dateStr ? new Date(dateStr).toLocaleDateString() : 'N/A';
};

const getStatusClass = status => {
  switch (status) {
    case 'published':
      return 'bg-success';
    case 'evaluation':
      return 'bg-info';
    case 'awarded':
      return 'bg-primary';
    case 'closed':
      return 'bg-danger';
    default:
      return 'bg-secondary';
  }
};
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
