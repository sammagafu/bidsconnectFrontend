<template>
  <VerticalLayout>
    <div class="card flex justify-center">
      <Stepper v-model="activeStep" class="basis-[40rem]">
          <StepList>
              <Step :value="1">
                  <template #header="{ activate }">
                      <div class="flex flex-row flex-auto gap-2">
                          <button class="bg-transparent border-0 inline-flex flex-col gap-2" @click="activate">
                              <span
                                  :class="[
                                      'rounded-full border-2 w-12 h-12 inline-flex items-center justify-center',
                                      { 'bg-primary text-primary-contrast border-primary': activeStep >= 1, 'border-surface-200 dark:border-surface-700': activeStep < 1 }
                                  ]"
                              >
                                  <i class="pi pi-building" />
                              </span>
                          </button>
                          <Divider />
                      </div>
                  </template>
              </Step>
              <Step :value="2">
                  <template #header="{ activate }">
                      <div class="flex flex-row flex-auto gap-2 pl-2">
                          <button class="bg-transparent border-0 inline-flex flex-col gap-2" @click="activate">
                              <span
                                  :class="[
                                      'rounded-full border-2 w-12 h-12 inline-flex items-center justify-center',
                                      { 'bg-primary text-primary-contrast border-primary': activeStep >= 2, 'border-surface-200 dark:border-surface-700': activeStep < 2 }
                                  ]"
                              >
                                  <i class="pi pi-file" />
                              </span>
                          </button>
                          <Divider />
                      </div>
                  </template>
              </Step>
              <Step :value="3">
                  <template #header="{ activate }">
                      <div class="flex flex-row pl-2">
                          <button class="bg-transparent border-0 inline-flex flex-col gap-2" @click="activate">
                              <span
                                  :class="[
                                      'rounded-full border-2 w-12 h-12 inline-flex items-center justify-center',
                                      { 'bg-primary text-primary-contrast border-primary': activeStep >= 3, 'border-surface-200 dark:border-surface-700': activeStep < 3 }
                                  ]"
                              >
                                  <i class="pi pi-list" />
                              </span>
                          </button>
                      </div>
                  </template>
              </Step>
          </StepList>
          <StepPanels>
              <!-- Step 1: Register Company Details -->
              <StepPanel :value="1">
                  <div class="flex flex-col gap-4 mx-auto" style="min-height: 24rem; max-width: 28rem">
                      <div class="text-center mt-4 mb-4 text-xl font-semibold">Register Company Details</div>
                      <div class="field">
                          <label for="companyName" class="block mb-2">Company Name *</label>
                          <InputText id="companyName" v-model="companyDetails.name" type="text" placeholder="Enter company name" fluid 
                                     :invalid="submitted && !companyDetails.name" />
                          <small v-if="submitted && !companyDetails.name" class="text-red-500">Company name is required.</small>
                      </div>
                      <div class="field">
                          <label for="companyEmail" class="block mb-2">Company Email</label>
                          <InputText id="companyEmail" v-model="companyDetails.email" type="email" placeholder="Enter company email" fluid />
                      </div>
                      <div class="field">
                          <label for="description" class="block mb-2">Description</label>
                          <Textarea id="description" v-model="companyDetails.description" rows="3" placeholder="Enter company description" fluid />
                      </div>
                      <div class="field">
                          <label for="website" class="block mb-2">Website</label>
                          <InputText id="website" v-model="companyDetails.website" type="url" placeholder="Enter company website" fluid />
                      </div>
                      <div class="field">
                          <label for="phoneNumber" class="block mb-2">Phone Number</label>
                          <InputText id="phoneNumber" v-model="companyDetails.phone_number" type="tel" placeholder="Enter phone number" fluid />
                      </div>
                      <div class="field">
                          <label for="address" class="block mb-2">Address</label>
                          <Textarea id="address" v-model="companyDetails.address" rows="2" placeholder="Enter company address" fluid />
                      </div>
                      <div class="field">
                          <label for="taxId" class="block mb-2">Tax ID</label>
                          <InputText id="taxId" v-model="companyDetails.tax_id" placeholder="Enter tax ID" fluid />
                      </div>
                      <div class="field">
                          <label for="registrationNumber" class="block mb-2">Registration Number</label>
                          <InputText id="registrationNumber" v-model="companyDetails.registration_number" placeholder="Enter registration number" fluid />
                      </div>
                      <div class="field">
                          <label for="foundedDate" class="block mb-2">Founded Date</label>
                          <Calendar id="foundedDate" v-model="companyDetails.founded_date" dateFormat="yy-mm-dd" showIcon fluid />
                      </div>
                      <div class="field">
                          <label for="country" class="block mb-2">Country</label>
                          <InputText id="country" v-model="companyDetails.country" placeholder="Enter country" fluid />
                      </div>
                      <div class="field">
                          <label for="employeeCount" class="block mb-2">Employee Count</label>
                          <InputNumber id="employeeCount" v-model="companyDetails.employee_count" placeholder="Enter employee count" fluid />
                      </div>
                  </div>
                  <div class="flex pt-6 justify-end">
                      <Button label="Next" icon="pi pi-arrow-right" iconPos="right" @click="validateStep1(() => activeStep = 2)" />
                  </div>
              </StepPanel>

              <!-- Step 2: Update Company Documents -->
              <StepPanel :value="2">
                  <div class="flex flex-col gap-4 mx-auto" style="min-height: 24rem; max-width: 28rem">
                      <div class="text-center mt-4 mb-4 text-xl font-semibold">Upload Company Documents</div>
                      <div v-for="(doc, index) in documents" :key="index" class="border p-4 rounded mb-4">
                          <div class="field">
                              <label :for="'documentType' + index" class="block mb-2">Document Type *</label>
                              <Select
                                  :id="'documentType' + index"
                                  v-model="doc.document_type"
                                  :options="documentTypeOptions"
                                  optionLabel="label"
                                  placeholder="Select document type"
                                  fluid
                                  :invalid="submitted && !doc.document_type"
                              />
                              <small v-if="submitted && !doc.document_type" class="text-red-500">Document type is required.</small>
                          </div>
                          <div class="field">
                              <label :for="'documentCategory' + index" class="block mb-2">Document Category</label>
                              <Select
                                  :id="'documentCategory' + index"
                                  v-model="doc.document_category"
                                  :options="documentCategoryOptions"
                                  optionLabel="label"
                                  placeholder="Select document category"
                                  fluid
                              />
                          </div>
                          <div class="field">
                              <label :for="'documentFile' + index" class="block mb-2">Upload Document *</label>
                              <FileUpload
                                  mode="basic"
                                  :name="'document' + index"
                                  accept="application/pdf,image/*"
                                  :maxFileSize="3000000"
                                  @select="onDocumentSelect($event, index)"
                                  chooseLabel="Select Document"
                                  :auto="true"
                                  :invalid="submitted && !doc.document_file"
                              />
                              <small v-if="submitted && !doc.document_file" class="text-red-500">Document file is required.</small>
                              <small v-if="doc.document_file" class="block mt-2">Selected: {{ doc.document_file.name }}</small>
                          </div>
                          <div class="field">
                              <label :for="'expiresAt' + index" class="block mb-2">Expiration Date</label>
                              <Calendar :id="'expiresAt' + index" v-model="doc.expires_at" dateFormat="yy-mm-dd" showIcon fluid />
                          </div>
                          <Button
                              label="Remove Document"
                              icon="pi pi-trash"
                              severity="danger"
                              text
                              @click="removeDocument(index)"
                              class="mt-2"
                              v-if="documents.length > 1"
                          />
                      </div>
                      <Button label="Add More Document" icon="pi pi-plus" severity="secondary" @click="addDocument" class="mb-4" />
                  </div>
                  <div class="flex pt-6 justify-between">
                      <Button label="Back" severity="secondary" icon="pi pi-arrow-left" @click="activeStep = 1" />
                      <Button label="Next" icon="pi pi-arrow-right" iconPos="right" @click="validateStep2(() => activeStep = 3)" />
                  </div>
              </StepPanel>

              <!-- Step 3: Pick Industry Category -->
              <StepPanel :value="3">
                  <div class="flex flex-col gap-2 mx-auto" style="min-height: 16rem; max-width: 24rem">
                      <div class="text-center mt-4 mb-4 text-xl font-semibold">Select Industry Category</div>
                      <div class="field">
                          <label for="industry" class="block mb-2">Industries *</label>
                          <Chips
                              id="industry"
                              v-model="companyDetails.industries"
                              separator=","
                              :allowDuplicate="false"
                              placeholder="Add industries (e.g., Technology, Healthcare)"
                              @add="onIndustryAdd"
                              @remove="onIndustryRemove"
                              :invalid="submitted && !companyDetails.industries.length"
                          />
                          <small v-if="submitted && !companyDetails.industries.length" class="text-red-500">At least one industry is required.</small>
                      </div>
                      <div class="text-center mt-4">
                          <p v-if="companyDetails.industries.length">Selected Industries: <strong>{{ companyDetails.industries.join(', ') }}</strong></p>
                      </div>
                      <div class="text-center mt-2">
                          <small>Available industries: {{ industryOptions.map(opt => opt.label).join(', ') }}</small>
                      </div>
                  </div>
                  <div class="flex pt-6 justify-between">
                      <Button label="Back" severity="secondary" icon="pi pi-arrow-left" @click="activeStep = 2" />
                      <Button label="Finish" icon="pi pi-check" @click="finishSetup" />
                  </div>
              </StepPanel>
          </StepPanels>
      </Stepper>
  </div>
  </VerticalLayout>
  
</template>

<script setup>
import { ref } from 'vue';
import { useToast } from 'primevue/usetoast';
import { api } from '@/services/authService'; // Assuming you have an API service
import VerticalLayout from "@/layouts/VerticalLayout.vue";

const toast = useToast();
const activeStep = ref(1);
const submitted = ref(false);

// Company details from the Company model
const companyDetails = ref({
  name: '',
  slug: '',
  description: '',
  industries: [], // Changed to an array for multiple industries
  website: '',
  logo: null,
  email: '',
  phone_number: '',
  address: '',
  tax_id: '',
  registration_number: '',
  founded_date: null,
  country: '',
  status: 'pending', // Default status
  employee_count: null,
  parent_company: null,
});

// Document details from the CompanyDocument model (now an array)
const documents = ref([
  {
      document_type: null,
      document_category: null,
      document_file: null,
      expires_at: null,
  },
]);

// Industry options (aligned with Company model)
const industryOptions = ref([
  { label: 'Technology', value: 'technology' },
  { label: 'Healthcare', value: 'healthcare' },
  { label: 'Finance', value: 'finance' },
  { label: 'Education', value: 'education' },
  { label: 'Manufacturing', value: 'manufacturing' },
  { label: 'Retail', value: 'retail' },
  { label: 'Other', value: 'other' },
]);

// Document type options (aligned with DOCUMENT_TYPE_CHOICES in constants.py)
const documentTypeOptions = ref([
  { label: 'Certificate', value: 'certificate' },
  { label: 'License', value: 'license' },
  { label: 'Contract', value: 'contract' },
  { label: 'Other', value: 'other' },
  // Add more based on your DOCUMENT_TYPE_CHOICES
]);

// Document category options (aligned with DOCUMENT_CATEGORY_CHOICES in constants.py)
const documentCategoryOptions = ref([
  { label: 'Legal', value: 'legal' },
  { label: 'Financial', value: 'financial' },
  { label: 'Operational', value: 'operational' },
  { label: 'Other', value: 'other' },
  // Add more based on your DOCUMENT_TYPE_CHOICES
]);

// Validate Step 1 before proceeding
const validateStep1 = (nextStep) => {
  submitted.value = true;
  if (!companyDetails.value.name.trim()) {
      toast.add({ severity: 'error', summary: 'Error', detail: 'Company name is required', life: 3000 });
      return;
  }
  submitted.value = false;
  nextStep();
};

// Handle document selection
const onDocumentSelect = (event, index) => {
  documents.value[index].document_file = event.files[0];
  toast.add({ severity: 'success', summary: 'Success', detail: 'Document selected', life: 3000 });
};

// Add a new document entry
const addDocument = () => {
  documents.value.push({
      document_type: null,
      document_category: null,
      document_file: null,
      expires_at: null,
  });
};

// Remove a document entry
const removeDocument = (index) => {
  documents.value.splice(index, 1);
};

// Validate Step 2 before proceeding
const validateStep2 = (nextStep) => {
  submitted.value = true;
  const hasInvalidDocument = documents.value.some(doc => !doc.document_type || !doc.document_file);
  if (hasInvalidDocument) {
      toast.add({ severity: 'error', summary: 'Error', detail: 'Document type and file are required for all documents', life: 3000 });
      return;
  }
  submitted.value = false;
  nextStep();
};

// Handle industry addition
const onIndustryAdd = (event) => {
  const addedIndustry = event.value[event.value.length - 1];
  if (!industryOptions.value.some(opt => opt.label.toLowerCase() === addedIndustry.toLowerCase())) {
      companyDetails.value.industries.pop(); // Remove invalid industry
      toast.add({ severity: 'error', summary: 'Error', detail: `Please select a valid industry from: ${industryOptions.value.map(opt => opt.label).join(', ')}`, life: 3000 });
  }
};

// Handle industry removal
const onIndustryRemove = () => {
  // Optional: Add logic if needed when an industry is removed
};

// Validate and finish the setup process
const finishSetup = async () => {
  submitted.value = true;
  if (!companyDetails.value.industries.length) {
      toast.add({ severity: 'error', summary: 'Error', detail: 'At least one industry is required', life: 3000 });
      return;
  }

  try {
      // Step 1: Create the company
      const companyData = { ...companyDetails.value, industry: companyDetails.value.industries.join(',') }; // Join industries for backend
      const companyResponse = await api.post('accounts/companies/', companyData);
      const companyId = companyResponse.data.id;

      // Step 2: Upload all documents
      for (const doc of documents.value) {
          const formData = new FormData();
          formData.append('company', companyId);
          formData.append('document_type', doc.document_type.value);
          formData.append('document_category', doc.document_category?.value || 'other');
          formData.append('document_file', doc.document_file);
          if (doc.expires_at) {
              formData.append('expires_at', doc.expires_at.toISOString().split('T')[0]);
          }

          await api.post(`accounts/companies/${companyId}/documents/`, formData, {
              headers: { 'Content-Type': 'multipart/form-data' },
          });
      }

      toast.add({ severity: 'success', summary: 'Success', detail: 'Company and documents created successfully', life: 3000 });

      // Reset the form and stepper
      activeStep.value = 1;
      companyDetails.value = {
          name: '',
          slug: '',
          description: '',
          industries: [],
          website: '',
          logo: null,
          email: '',
          phone_number: '',
          address: '',
          tax_id: '',
          registration_number: '',
          founded_date: null,
          country: '',
          status: 'pending',
          employee_count: null,
          parent_company: null,
      };
      documents.value = [{
          document_type: null,
          document_category: null,
          document_file: null,
          expires_at: null,
      }];
  } catch (error) {
      console.error('Failed to complete setup:', error);
      toast.add({ severity: 'error', summary: 'Error', detail: 'Failed to create company or upload documents', life: 3000 });
  }
};
</script>