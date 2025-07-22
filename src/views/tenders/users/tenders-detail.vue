<template>
  <VerticalLayout>
    <div class="container py-4">
      <div class="card p-4" ref="printSection">
        <h1 class="mb-4">Tender Summary</h1>

        <div v-if="loading" class="text-center my-5">
          <div class="spinner-border" role="status">
            <span class="visually-hidden">Loading...</span>
          </div>
        </div>

        <div v-else-if="tender">
          <!-- Section 1: Basic Tender Details -->
          <section class="mb-4">
            <h3>{{ tender.title }}</h3>
            <p><strong>Reference Number:</strong> {{ tender.reference_number }}</p>
            <p><strong>Country:</strong> {{ tender.tender_type_country }}</p>
            <p><strong>Sector:</strong> {{ tender.tender_type_sector }}</p>
            <p><strong>Description:</strong> {{ tender.tenderdescription }}</p>
            <p><strong>Procurement Process:</strong> {{ tender.procurement_process?.name || 'N/A' }}</p>
            <p><strong>Status:</strong> {{ tender.status }}</p>
          </section>

          <!-- Section 2: Financial Requirements -->
          <section class="mb-4">
            <h4>Financial Requirements</h4>
            <p><strong>Price Schedule:</strong> {{ priceSchedule }}</p>
            <p><strong>Tender Fees:</strong> {{ tender.tender_fees }} TZS</p>
            <p><strong>Security Type:</strong> {{ tender.tender_securing_type }}</p>
            <p><strong>Security %:</strong> {{ tender.tender_Security_percentage }}%</p>
            <p><strong>Security Amount:</strong> {{ tender.tender_Security_amount }} TZS</p>
            <p><strong>Delivery Period:</strong> {{ deliveryPeriod }}</p>
            <p><strong>Validity Period:</strong> {{ validityPeriod }} days</p>
          </section>

          <!-- Section 3: Experience & Personnel -->
          <section class="mb-4">
            <h4>Experience & Personnel</h4>
            <p><strong>Minimum Similar Projects:</strong> {{ tender.min_similar_projects }}</p>
            <p><strong>Minimum Value per Project:</strong> {{ tender.min_project_value }} TZS</p>
            <p><strong>Specialization Area:</strong> {{ tender.specialization_area }}</p>
            <p><strong>Experience Period:</strong> {{ formatDate(tender.experience_start) }} to {{ formatDate(tender.experience_end) }}</p>
          </section>

          <!-- Section 4: Agency Contact -->
          <section class="mb-4">
            <h4>Agency Contact</h4>
            <p><strong>Agency:</strong> {{ tender.agency?.name || 'N/A' }}</p>
            <p><strong>Phone:</strong> {{ tender.agency?.phone_number || 'N/A' }}</p>
            <p><strong>Email:</strong> {{ tender.agency?.email || 'N/A' }}</p>
            <p><strong>Website:</strong> <a :href="tender.agency?.website" target="_blank">{{ tender.agency?.website }}</a></p>
            <p><strong>Address:</strong> {{ tender.agency?.address || 'N/A' }}</p>
          </section>

          <!-- Section 5: Required Documents -->
          <section class="mb-4" v-if="tender.required_documents?.length">
            <h4>Required Documents</h4>
            <ul class="list-group">
              <li v-for="doc in tender.required_documents" :key="doc.id" class="list-group-item">
                {{ doc.name }} ({{ doc.document_type }})
              </li>
            </ul>
          </section>

          <!-- Section 6: Compliance Statement -->
          <section class="mb-4">
            <h4>Compliance Statement</h4>
            <p>Confirm all technical, financial, and legal compliance as per tender specifications.</p>
          </section>

          <!-- Section 7: Securing Document Requirement -->
          <section class="mb-4" v-if="tender.tender_securing_type === 'Tender Security'">
            <h4>Securing Document Requirement</h4>
            <p>Please ensure you have uploaded the required Tender Security document when applying.</p>
          </section>

          <!-- Action Buttons -->
          <div class="d-flex mb-4">
            <button class="btn btn-primary me-2" @click="handleBid">
              {{ buttonLabel }}
            </button>
            <button
              v-if="tender.tender_securing_type === 'Tender Security'"
              class="btn btn-warning me-2"
              @click="uploadSecuringDocument"
            >
              Upload Securing Document
            </button>
            <button class="btn btn-success" @click="downloadPDF">
              Download PDF Summary
            </button>
          </div>

          <!-- Company Selection -->
          <div v-if="authStore.companies.length > 1 && showBidForm" class="mb-3">
            <label class="form-label">Select Company:</label>
            <select v-model="selectedCompany" class="form-select">
              <option disabled value="">Choose...</option>
              <option v-for="c in authStore.companies" :key="c.id" :value="c.id">
                {{ c.name }}
              </option>
            </select>
          </div>

          <!-- Bid Form -->
          <div v-if="showBidForm" class="mb-4 bid-form">
            <h5>Submit Your Bid Documents</h5>
            <div v-for="(doc, idx) in bidDocuments" :key="idx" class="mb-3 row align-items-center">
              <div class="col-md-5">
                <select v-model="doc.required_document" class="form-select">
                  <option disabled value="">Select document type</option>
                  <option v-for="req in tender.required_documents" :key="req.id" :value="req.id">
                    {{ req.name }}
                  </option>
                </select>
              </div>
              <div class="col-md-5">
                <input type="file" @change="onFileChange($event, idx)" class="form-control" />
              </div>
              <div class="col-md-2">
                <button class="btn btn-outline-danger" @click="removeDocument(idx)">Remove</button>
              </div>
            </div>
            <button class="btn btn-secondary mb-3" @click="addDocument">+ Add Document</button>
            <div>
              <button class="btn btn-success" :disabled="!canSubmit" @click="submitBid">
                Confirm and Submit Bid
              </button>
            </div>
          </div>
        </div>

        <div v-else class="text-center my-5">
          <p>No tender found.</p>
        </div>
      </div>
    </div>
  </VerticalLayout>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { useRoute } from 'vue-router';
import { useAuthStore } from '@/stores/auth';
import { api } from '@/services/authService';
import VerticalLayout from '@/layouts/VerticalLayout.vue';

const route = useRoute();
const authStore = useAuthStore();
const slug = route.params.slug;
const tender = ref(null);
const loading = ref(false);
const printSection = ref(null);

// Bid form state
const showBidForm = ref(false);
const bidDocuments = ref([]);
const submitting = ref(false);
const selectedCompany = ref(authStore.companies[0]?.id || '');

// Form validation
const isFormValid = computed(() => {
  return (
    bidDocuments.value.length > 0 &&
    bidDocuments.value.every((d) => d.required_document && d.file)
  );
});

const canSubmit = computed(() => {
  if (tender.value.required_documents?.length) {
    return (
      selectedCompany.value &&
      isFormValid.value
    );
  }
  return !!selectedCompany.value;
});

const buttonLabel = computed(() => {
  if (tender.value.required_documents?.length) {
    return showBidForm.value ? 'Cancel Bid' : 'Apply for This Tender';
  }
  return submitting.value ? 'Submitting...' : 'Submit Bid';
});


// Static requirements
const priceSchedule = 'Quote per item as provided by PE';
const deliveryPeriod = '7 days';
const validityPeriod = '120';

// Helpers
const formatDate = (dateStr) => {
  if (!dateStr) return 'N/A';
  const date = new Date(dateStr);
  return date.toLocaleDateString();
};

// Fetch tender data
const fetchTender = async () => {
  loading.value = true;
  try {
    const { data } = await api.get(`tenders/tenders/${slug}/`);
    tender.value = data;
  } catch (e) {
    console.error('Failed to fetch tender:', e);
  } finally {
    loading.value = false;
  }
};

// Bid document handlers
const addDocument = () => bidDocuments.value.push({ required_document: '', file: null });
const removeDocument = (idx) => bidDocuments.value.splice(idx, 1);
const onFileChange = (e, idx) => {
  bidDocuments.value[idx].file = e.target.files[0];
};

// Handle bid click
const handleBid = () => {
  if (tender.value.required_documents?.length) {
    showBidForm.value = !showBidForm.value;
  } else {
    submitBid();
  }
};

// Submit bid
const submitBid = async () => {
  if (!canSubmit.value) return;
  submitting.value = true;
  const formData = new FormData();
  formData.append('tender', tender.value.id);
  formData.append('company', selectedCompany.value);
  bidDocuments.value.forEach((d, i) => {
    formData.append(`documents[${i}].required_document`, d.required_document);
    formData.append(`documents[${i}].file`, d.file);
  });
  try {
    await api.post('bids/bids/', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    alert('Bid submitted successfully!');
    showBidForm.value = false;
    bidDocuments.value = [];
  } catch (e) {
    console.error('Submission failed:', e);
    alert('Failed to submit bid.');
  } finally {
    submitting.value = false;
  }
};

const uploadSecuringDocument = () => {
  // TODO: implement securing document upload
};

const downloadPDF = () => {
  const printContent = printSection.value.innerHTML;
  const original = document.body.innerHTML;
  document.body.innerHTML = printContent;
  window.print();
  document.body.innerHTML = original;
  window.location.reload();
};

onMounted(fetchTender);
</script>

<style scoped>
.mb-4 p,
.list-group-item {
  margin-bottom: 0.5rem;
}
.bid-form select,
.bid-form input[type='file'] {
  max-width: 100%;
}
</style>
