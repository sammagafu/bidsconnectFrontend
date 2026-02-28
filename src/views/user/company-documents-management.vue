<template>
    <VerticalLayout>
      <b-container>
        <b-row>
          <b-col>
            <!-- Show document management if the user has a company -->
            <div v-if="hasCompany">
              <!-- Company Details -->
              <h2>{{ company.name }}</h2>
              <p>{{ company.description }}</p>
  
              <!-- Upload Document Section -->
              <h3 class="mt-4">Upload Document</h3>
              <b-form @submit.prevent="uploadDocument" class="mb-4">
                <b-row>
                  <b-col md="6">
                    <b-form-group label="Document Name">
                      <b-form-input
                        v-model="newDocument.name"
                        type="text"
                        placeholder="Enter document name"
                        required
                      />
                    </b-form-group>
                  </b-col>
                  <b-col md="4">
                    <b-form-group label="File">
                      <b-form-file
                        v-model="newDocument.file"
                        accept=".pdf,.doc,.docx"
                        placeholder="Choose a file..."
                        required
                      />
                    </b-form-group>
                  </b-col>
                  <b-col md="2" class="d-flex align-items-end">
                    <b-button type="submit" variant="primary" :disabled="loadingUpload">
                      {{ loadingUpload ? 'Uploading...' : 'Upload' }}
                    </b-button>
                  </b-col>
                </b-row>
              </b-form>
  
              <!-- Documents List -->
              <h3 class="mt-4">Company Documents</h3>
              <b-table
                :items="documents"
                :fields="documentFields"
                striped
                hover
                responsive
                class="mb-4"
              >
                <template #cell(file)="row">
                  <a :href="row.item.file" target="_blank" class="text-primary">
                    Download
                  </a>
                </template>
                <template #cell(actions)="row">
                  <b-button
                    variant="outline-danger"
                    size="sm"
                    @click="deleteDocument(row.item.id)"
                    :disabled="loadingDelete"
                  >
                    Delete
                  </b-button>
                </template>
              </b-table>
            </div>
  
            <!-- Show house icon and "Add a Company" button if no company -->
            <div v-else class="text-center mt-5">
              <i class="pi pi-home" style="font-size: 5rem; color: var(--bs-secondary-color);"></i>
              <h3 class="mt-3">No Company Found</h3>
              <p class="text-muted">You don’t have a company yet. Create one to start managing documents.</p>
              <b-button
                variant="primary"
                @click="goToCreateCompany"
                class="mt-3"
              >
                Add a Company
              </b-button>
            </div>
          </b-col>
        </b-row>
      </b-container>
    </VerticalLayout>
  </template>
  
  <script setup>
  import VerticalLayout from "@/layouts/VerticalLayout.vue";
  import { ref, onMounted } from 'vue';
  import { useRoute, useRouter } from 'vue-router';
  import { companiesService, parseApiError } from '@/services';
  import { useToast } from 'primevue/usetoast';
  import { useAuthStore } from '@/stores/auth';
  
  const route = useRoute();
  const router = useRouter();
  const toast = useToast();
  const authStore = useAuthStore();
  const hasCompany = ref(false);
  const company = ref({});
  const documents = ref([]);
  const loadingUpload = ref(false);
  const loadingDelete = ref(false);
  
  // New document form
  const newDocument = ref({
    name: '',
    file: null,
  });
  
  // Document table fields
  const documentFields = [
    { key: 'name', label: 'Document Name' },
    { key: 'uploaded_at', label: 'Uploaded At', formatter: value => new Date(value).toLocaleDateString() },
    { key: 'size', label: 'Size (KB)', formatter: value => (value / 2024).toFixed(2) },
    { key: 'file', label: 'File' },
    { key: 'actions', label: 'Actions' },
  ];
  
  // Check if the user has a company on mount using the auth store
  onMounted(() => {
    // Initialize auth state if not already done
    authStore.initialize();
  
    // Check if the user has companies
    hasCompany.value = authStore.hasCompanies();
  
    // If the user has a company, fetch details and documents
    if (hasCompany.value) {
      Promise.all([fetchCompanyDetails(), fetchCompanyDocuments()]);
    }
  });
  
  const companyId = () => route.params.id;

  // Fetch company details
  const fetchCompanyDetails = async () => {
    try {
      company.value = await companiesService.get(companyId());
    } catch (error) {
      toast.add({
        severity: 'error',
        summary: 'Error',
        detail: parseApiError(error) || 'Failed to load company details',
        life: 3000,
      });
    }
  };

  // Fetch company documents
  const fetchCompanyDocuments = async () => {
    try {
      const data = await companiesService.listDocuments(companyId());
      documents.value = Array.isArray(data) ? data : data?.results ?? [];
    } catch (error) {
      toast.add({
        severity: 'error',
        summary: 'Error',
        detail: parseApiError(error) || 'Failed to load company documents',
        life: 3000,
      });
    }
  };

  // Upload a document
  const uploadDocument = async () => {
    loadingUpload.value = true;
    try {
      const formData = new FormData();
      formData.append('name', newDocument.value.name);
      formData.append('file', newDocument.value.file);

      await companiesService.createDocument(companyId(), formData);
      toast.add({
        severity: 'success',
        summary: 'Success',
        detail: 'Document uploaded successfully',
        life: 3000,
      });
      newDocument.value.name = '';
      newDocument.value.file = null;
      await fetchCompanyDocuments();
    } catch (error) {
      toast.add({
        severity: 'error',
        summary: 'Error',
        detail: parseApiError(error) || 'Failed to upload document',
        life: 3000,
      });
    } finally {
      loadingUpload.value = false;
    }
  };

  // Delete document
  const deleteDocument = async (documentId) => {
    if (!confirm('Are you sure you want to delete this document?')) return;
    loadingDelete.value = true;
    try {
      await companiesService.deleteDocument(companyId(), documentId);
      toast.add({
        severity: 'success',
        summary: 'Success',
        detail: 'Document deleted successfully',
        life: 3000,
      });
      await fetchCompanyDocuments(); // Refresh the document list
    } catch (error) {
      toast.add({
        severity: 'error',
        summary: 'Error',
        detail: parseApiError(error) || 'Failed to delete document',
        life: 3000,
      });
    } finally {
      loadingDelete.value = false;
    }
  };

  // Redirect to create company page
  const goToCreateCompany = () => {
    router.push('/company/create-company');
  };
  </script>