<!-- src/views/company/CreateCompany.vue -->
<template>
    <MainLayout>
      <b-container>
        <b-row class="justify-content-center">
          <b-col md="8">
            <b-card>
              <h2 class="mb-4">Create New Company</h2>
              <b-form @submit.prevent="handleCreateCompany">
                <b-form-group label="Company Name" class="mb-3">
                  <b-form-input
                    v-model="v.name.$model"
                    placeholder="Enter company name"
                  />
                  <div v-if="v.name.$error" class="text-danger">
                    <span v-for="(err, idx) in v.name.$errors" :key="idx">{{ err.$message }}</span>
                  </div>
                </b-form-group>
  
                <b-form-group label="Description" class="mb-3">
                  <b-form-textarea
                    v-model="company.description"
                    placeholder="Enter company description"
                  />
                </b-form-group>
  
                <b-form-group label="Industry" class="mb-3">
                  <b-form-input
                    v-model="company.industry"
                    placeholder="Enter industry"
                  />
                </b-form-group>
  
                <b-form-group label="Website" class="mb-3">
                  <b-form-input
                    v-model="company.website"
                    placeholder="Enter website URL"
                  />
                </b-form-group>
  
                <div class="text-center">
                  <b-button variant="primary" type="submit" :disabled="loading">
                    {{ loading ? 'Creating...' : 'Create Company' }}
                  </b-button>
                </div>
              </b-form>
            </b-card>
          </b-col>
        </b-row>
      </b-container>
    </MainLayout>
  </template>
  
  <script setup>
  import MainLayout from '@/layouts/MainLayout.vue';
  import { useVuelidate } from '@vuelidate/core';
  import { required } from '@vuelidate/validators';
  import { ref, reactive, computed } from 'vue';
  import { useRouter } from 'vue-router';
  import { useAuthStore } from '@/stores/auth';
  import { useToast } from 'primevue/usetoast';
  import api from '@/services/api';
  
  const router = useRouter();
  const authStore = useAuthStore();
  const toast = useToast();
  
  const company = reactive({
    name: '',
    description: '',
    industry: '',
    website: ''
  });
  
  const vuelidateRules = computed(() => ({
    name: { required }
  }));
  
  const v = useVuelidate(vuelidateRules, company);
  const loading = ref(false);
  
  const handleCreateCompany = async () => {
    try {
      v.value.$touch();
      if (v.value.$invalid) {
        toast.error('Please fill in all required fields');
        return;
      }
  
      loading.value = true;
      const response = await api.post('companies/', company);
      
      toast.success('Company created successfully!');
      await router.push({ name: 'company.detail', params: { id: response.data.id } });
    } catch (error) {
      toast.error(error.response?.data?.name || 'Failed to create company');
    } finally {
      loading.value = false;
    }
  };
  </script>