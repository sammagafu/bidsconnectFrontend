<template>
    <VerticalLayout>
        <div class="card p-4">
      <h2 class="text-center mb-4">Create Company</h2>
      <form @submit.prevent="createCompany">
        <!-- Company Details -->
        <div class="flex flex-col gap-4 mb-4">
          <div class="field">
            <label for="companyName" class="block mb-2 font-semibold">Company Name *</label>
            <InputText
              id="companyName"
              v-model="companyDetails.name"
              type="text"
              placeholder="Enter company name"
              fluid
              :invalid="submitted && !companyDetails.name"
            />
            <small v-if="submitted && !companyDetails.name" class="text-red-500">Company name is required.</small>
          </div>
          <div class="field">
            <label for="description" class="block mb-2 font-semibold">Description</label>
            <Textarea
              id="description"
              v-model="companyDetails.description"
              rows="3"
              placeholder="Enter company description"
              fluid
            />
          </div>
          <div class="field">
            <label for="industry" class="block mb-2 font-semibold">Industry *</label>
            <Select
              id="industry"
              v-model="companyDetails.industry"
              :options="industryOptions"
              optionLabel="label"
              optionValue="value"
              placeholder="Select an industry"
              fluid
              :invalid="submitted && !companyDetails.industry"
            />
            <small v-if="submitted && !companyDetails.industry" class="text-red-500">Industry is required.</small>
          </div>
          <div class="field">
            <label for="website" class="block mb-2 font-semibold">Website</label>
            <InputText
              id="website"
              v-model="companyDetails.website"
              type="url"
              placeholder="Enter company website"
              fluid
            />
          </div>
          <div class="field">
            <label for="logo" class="block mb-2 font-semibold">Company Logo</label>
            <FileUpload
              mode="basic"
              name="logo"
              accept="image/*"
              :maxFileSize="3000000"
              @select="onLogoSelect"
              chooseLabel="Select Logo"
              :auto="true"
            />
            <small v-if="companyDetails.logo" class="block mt-2">Selected: {{ companyDetails.logo.name }}</small>
          </div>
          <div class="field">
            <label for="companyEmail" class="block mb-2 font-semibold">Company Email</label>
            <InputText
              id="companyEmail"
              v-model="companyDetails.email"
              type="email"
              placeholder="Enter company email"
              fluid
            />
          </div>
          <div class="field">
            <label for="phoneNumber" class="block mb-2 font-semibold">Phone Number</label>
            <InputText
              id="phoneNumber"
              v-model="companyDetails.phone_number"
              type="tel"
              placeholder="Enter phone number"
              fluid
            />
          </div>
          <div class="field">
            <label for="address" class="block mb-2 font-semibold">Address *</label>
            <Textarea
              id="address"
              v-model="companyDetails.address"
              rows="2"
              placeholder="Enter company address"
              fluid
              :invalid="submitted && !companyDetails.address"
            />
            <small v-if="submitted && !companyDetails.address" class="text-red-500">Address is required.</small>
          </div>
          <div class="field">
            <label for="taxId" class="block mb-2 font-semibold">Tax ID</label>
            <InputText
              id="taxId"
              v-model="companyDetails.tax_id"
              placeholder="Enter tax ID"
              fluid
            />
          </div>
          <div class="field">
            <label for="registrationNumber" class="block mb-2 font-semibold">Registration Number</label>
            <InputText
              id="registrationNumber"
              v-model="companyDetails.registration_number"
              placeholder="Enter registration number"
              fluid
            />
          </div>
          <div class="field">
            <label for="foundedDate" class="block mb-2 font-semibold">Founded Date</label>
            <Calendar
              id="foundedDate"
              v-model="companyDetails.founded_date"
              dateFormat="yy-mm-dd"
              showIcon
              fluid
            />
          </div>
          <div class="field">
            <label for="country" class="block mb-2 font-semibold">Country</label>
            <InputText
              id="country"
              v-model="companyDetails.country"
              placeholder="Enter country"
              fluid
            />
          </div>
          <div class="field">
            <label for="status" class="block mb-2 font-semibold">Status</label>
            <Select
              id="status"
              v-model="companyDetails.status"
              :options="statusOptions"
              optionLabel="label"
              optionValue="value"
              placeholder="Select status"
              fluid
            />
          </div>
          <div class="field">
            <label for="employeeCount" class="block mb-2 font-semibold">Employee Count</label>
            <InputNumber
              id="employeeCount"
              v-model="companyDetails.employee_count"
              placeholder="Enter employee count"
              fluid
            />
          </div>
          <div class="field">
            <label for="parentCompany" class="block mb-2 font-semibold">Parent Company</label>
            <Select
              id="parentCompany"
              v-model="companyDetails.parent_company"
              :options="parentCompanyOptions"
              optionLabel="name"
              optionValue="id"
              placeholder="Select parent company (optional)"
              fluid
            />
          </div>
        </div>
  
        <!-- Submit Button -->
        <div class="text-center">
          <Button
            type="submit"
            label="Create Company"
            icon="pi pi-check"
            :disabled="loading"
            class="p-button-primary"
          />
        </div>
        <p v-if="error" class="text-red-500 mt-3 text-center">{{ error }}</p>
      </form>
    </div>
    </VerticalLayout>
   
  </template>
  
  <script setup>
  import { ref, onMounted } from 'vue';
  import { useToast } from 'primevue/usetoast';
  import { useRouter } from 'vue-router';
  import { api } from '@/services/authService';
  import VerticalLayout from '@/layouts/VerticalLayout.vue'; // Import the layout component

  const toast = useToast();
  const router = useRouter();
  const submitted = ref(false);
  const loading = ref(false);
  const error = ref(null);
  
  // Company details
  const companyDetails = ref({
    name: '',
    description: '',
    industry: '',
    website: '',
    logo: null,
    email: '',
    phone_number: '',
    address: '',
    tax_id: '',
    registration_number: '',
    founded_date: null,
    country: '',
    status: null,
    employee_count: null,
    parent_company: null,
    // created_by is set by the backend
  });
  
  // Industry options
  const industryOptions = ref([
    { label: 'Technology', value: 'technology' },
    { label: 'Healthcare', value: 'healthcare' },
    { label: 'Finance', value: 'finance' },
    { label: 'Education', value: 'education' },
    { label: 'Manufacturing', value: 'manufacturing' },
    { label: 'Retail', value: 'retail' },
    { label: 'Other', value: 'other' },
  ]);
  
  // Status options (excluding draft and completed)
  const statusOptions = ref([
    { label: 'Active', value: 'active' },
    { label: 'Inactive', value: 'inactive' },
    { label: 'Suspended', value: 'suspended' },
  ]);
  
  // Parent company options
  const parentCompanyOptions = ref([]);
  
  // Fetch parent companies on mount
  onMounted(async () => {
    try {
      const response = await api.get('accounts/companies/');
      parentCompanyOptions.value = response.data.results || [];
      parentCompanyOptions.value.unshift({ id: null, name: 'None' }); // Add "None" option
    } catch (error) {
      console.error('Failed to fetch parent companies:', error);
      toast.add({
        severity: 'error',
        summary: 'Error',
        detail: 'Failed to load parent companies',
        life: 3000,
      });
    }
  });
  
  // Handle logo selection
  const onLogoSelect = (event) => {
    companyDetails.value.logo = event.files[0];
    toast.add({
      severity: 'success',
      summary: 'Success',
      detail: 'Logo selected',
      life: 3000,
    });
  };
  
  // Submit the form to create the company
  const createCompany = async () => {
    submitted.value = true;
    loading.value = true;
    error.value = null;
  
    // Validate required fields
    if (!companyDetails.value.name.trim()) {
      toast.add({
        severity: 'error',
        summary: 'Error',
        detail: 'Company name is required',
        life: 3000,
      });
      loading.value = false;
      return;
    }
    if (!companyDetails.value.address.trim()) {
      toast.add({
        severity: 'error',
        summary: 'Error',
        detail: 'Address is required',
        life: 3000,
      });
      loading.value = false;
      return;
    }
    if (!companyDetails.value.industry) {
      toast.add({
        severity: 'error',
        summary: 'Error',
        detail: 'Industry is required',
        life: 3000,
      });
      loading.value = false;
      return;
    }
    submitted.value = false;
  
    try {
      // Prepare company data for submission
      const formData = new FormData();
      formData.append('name', companyDetails.value.name);
      formData.append('description', companyDetails.value.description || '');
      formData.append('industry', companyDetails.value.industry || '');
      formData.append('website', companyDetails.value.website || '');
      if (companyDetails.value.logo) {
        formData.append('logo', companyDetails.value.logo);
      }
      formData.append('email', companyDetails.value.email || '');
      formData.append('phone_number', companyDetails.value.phone_number || '');
      formData.append('address', companyDetails.value.address || '');
      formData.append('tax_id', companyDetails.value.tax_id || '');
      formData.append('registration_number', companyDetails.value.registration_number || '');
      formData.append('founded_date', companyDetails.value.founded_date
        ? companyDetails.value.founded_date.toISOString().split('T')[0]
        : '');
      formData.append('country', companyDetails.value.country || '');
      formData.append('status', companyDetails.value.status || 'active');
      formData.append('employee_count', companyDetails.value.employee_count || '');
      formData.append('parent_company', companyDetails.value.parent_company || '');
  
      console.log('Submitting company data:');
      for (let [key, value] of formData.entries()) {
        console.log(`${key}: ${value}`);
      }
  
      // Send the company data using the api instance
      const response = await api.post('accounts/companies/', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
  
      toast.add({
        severity: 'success',
        summary: 'Success',
        detail: 'Company created successfully',
        life: 3000,
      });
  
      // Redirect to a success page or dashboard
      router.push('/company/tenders');
    } catch (error) {
      console.error('Failed to create company:', error);
      const errorDetail = error.response?.data || { message: 'Unknown error occurred' };
      console.log('Backend Error Response:', errorDetail);
      error.value = errorDetail.message || 'Failed to create company. Please check the form and try again.';
      toast.add({
        severity: 'error',
        summary: 'Error',
        detail: error.value,
        life: 5000,
      });
    } finally {
      loading.value = false;
    }
  };
  </script>