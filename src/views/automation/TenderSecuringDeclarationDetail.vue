<!-- TenderSecuringDeclarationDetail.vue -->
<template>
  <VerticalLayout>
    <div class="card">
      <h2>Tender Securing Declaration Details</h2>
      <div class="p-fluid">
        <div class="p-field">
          <label>Procuring Entity</label>
          <p>{{ item.procuring_entity }}</p>
        </div>
        <div class="p-field">
          <label>Tender No</label>
          <p>{{ item.tender_no }}</p>
        </div>
        <div class="p-field">
          <label>Tender Description</label>
          <p>{{ item.tender_description }}</p>
        </div>
        <div class="p-field">
          <label>Date</label>
          <p>{{ item.date }}</p>
        </div>
        <div class="p-field">
          <label>Signer Name</label>
          <p>{{ item.signer_name }}</p>
        </div>
        <div class="p-field">
          <label>Signer Capacity</label>
          <p>{{ item.signer_capacity }}</p>
        </div>
      </div>
      <Button label="Generate PDF" @click="generatePDF" />
    </div>
  </VerticalLayout>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useRoute } from 'vue-router';
import { useToast } from 'primevue/usetoast';
import { api } from '@/services/authService';
import VerticalLayout from '@/layouts/VerticalLayout.vue';
import Button from 'primevue/button';

const toast = useToast();
const route = useRoute();
const item = ref({});

async function fetchItem() {
  try {
    const res = await api.get(`automation/tender-securing-declaration/${route.params.id}/`);
    item.value = res.data;
  } catch (err) {
    toast.add({ severity: 'error', summary: 'Error', detail: 'Failed to load' });
  }
}

function generatePDF() {
  api.get(`automation/tender-securing-declaration/${route.params.id}/`, { responseType: 'blob' }).then(response => {
    const blob = new Blob([response.data], { type: 'application/pdf' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = 'tender_securing_declaration.pdf';
    link.click();
    URL.revokeObjectURL(link.href);
  }).catch(err => {
    toast.add({ severity: 'error', summary: 'Error', detail: 'Failed to generate PDF' });
  });
}

onMounted(fetchItem);
</script>

<style scoped>
.p-field { margin-bottom: 1.5rem; padding: 0.5rem; }
.p-field label { display: block; margin-bottom: 0.5rem; }
.p-field p { margin: 0; }
</style>