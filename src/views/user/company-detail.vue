
<template>
    <MainLayout>
      <b-container>
        <b-row>
          <b-col>
            <h2>{{ company.name }}</h2>
            <p>{{ company.description }}</p>
            <b-button variant="primary" @click="showDocumentUpload = true">
              Upload Document
            </b-button>
  
            <b-modal v-model="showDocumentUpload" title="Upload Document" @ok="handleDocumentUpload">
              <b-form-group label="Document Type">
                <b-form-select v-model="document.document_type" :options="documentTypes" />
              </b-form-group>
              <b-form-group label="File">
                <b-form-file v-model="document.file" />
              </b-form-group>
            </b-modal>
          </b-col>
        </b-row>
      </b-container>
    </MainLayout>
  </template>
  
  <script setup>
  import MainLayout from '@/layouts/MainLayout.vue';
  import { ref, onMounted } from 'vue';
  import { useRoute } from 'vue-router';
  import api from '@/services/api';
  import { useToast } from 'vue-toastification';
  
  const route = useRoute();
  const toast = useToast();
  const company = ref({});
  const showDocumentUpload = ref(false);
  const document = ref({
    document_type: null,
    file: null
  });
  
  const documentTypes = [
    { value: 'contract', text: 'Contract' },
    { value: 'agreement', text: 'Agreement' },
    { value: 'report', text: 'Report' }
  ];
  
  onMounted(async () => {
    try {
      const response = await api.get(`companies/${route.params.id}/`);
      company.value = response.data;
    } catch (error) {
      toast.error('Failed to load company details');
    }
  });
  
  const handleDocumentUpload = async () => {
    try {
      const formData = new FormData();
      formData.append('document_type', document.value.document_type);
      formData.append('document_file', document.value.file);
  
      await api.post(`companies/${route.params.id}/documents/`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      
      toast.success('Document uploaded successfully');
      showDocumentUpload.value = false;
    } catch (error) {
      toast.error('Failed to upload document');
    }
  };
  </script>