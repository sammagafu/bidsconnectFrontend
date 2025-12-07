<!-- LitigationHistoryDetail.vue -->
<template>
  <VerticalLayout>
    <div class="card">
      <h2>Litigation History Details</h2>
      <div class="p-fluid">
        <div class="p-field">
          <label>Company Name</label>
          <p>{{ item.company_name }}</p>
        </div>
        <div class="p-field">
          <label>Address</label>
          <p>{{ item.address }}</p>
        </div>
        <div class="p-field">
          <label>PO Box</label>
          <p>{{ item.po_box }}</p>
        </div>
        <div class="p-field">
          <label>Tender Description</label>
          <p>{{ item.tender_description }}</p>
        </div>
        <div class="p-field">
          <label>Date</label>
          <p>{{ item.date }}</p>
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
    const res = await api.get(`automation/litigation-history/${route.params.id}/`);
    item.value = res.data;
  } catch (err) {
    toast.add({ severity: 'error', summary: 'Error', detail: 'Failed to load' });
  }
}

function generatePDF() {
  api.get(`automation/litigation-history/${route.params.id}/`, { responseType: 'blob' }).then(response => {
    const blob = new Blob([response.data], { type: 'application/pdf' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = 'litigation_history.pdf';
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