<!-- CoverLetterDetail.vue -->
<template>
  <VerticalLayout>
    <div class="card">
      <h2>Cover Letter Details</h2>
      <div class="p-fluid">
        <div class="p-field">
          <label>Date</label>
          <p>{{ item.date }}</p>
        </div>
        <div class="p-field">
          <label>Recipient Title</label>
          <p>{{ item.recipient_title }}</p>
        </div>
        <div class="p-field">
          <label>Recipient Name</label>
          <p>{{ item.recipient_name }}</p>
        </div>
        <div class="p-field">
          <label>Recipient Address</label>
          <p>{{ item.recipient_address }}</p>
        </div>
        <div class="p-field">
          <label>Reference No</label>
          <p>{{ item.reference_no }}</p>
        </div>
        <div class="p-field">
          <label>Company Description</label>
          <p>{{ item.company_description }}</p>
        </div>
        <div class="p-field">
          <label>Attached Docs List</label>
          <p>{{ item.attached_docs_list }}</p>
        </div>
        <div class="p-field">
          <label>Compliance Certs</label>
          <p>{{ item.compliance_certs }}</p>
        </div>
        <div class="p-field">
          <label>Agency Dealership</label>
          <p>{{ item.agency_dealership }}</p>
        </div>
        <div class="p-field">
          <label>Lease Agreement</label>
          <p>{{ item.lease_agreement }}</p>
        </div>
        <div class="p-field">
          <label>Litigation Decl</label>
          <p>{{ item.litigation_decl }}</p>
        </div>
        <div class="p-field">
          <label>Similar Performance</label>
          <p>{{ item.similar_performance }}</p>
        </div>
        <div class="p-field">
          <label>Financial Info</label>
          <p>{{ item.financial_info }}</p>
        </div>
        <div class="p-field">
          <label>Physical Address</label>
          <p>{{ item.physical_address }}</p>
        </div>
        <div class="p-field">
          <label>Contact Person</label>
          <p>{{ item.contact_person }}</p>
        </div>
        <div class="p-field">
          <label>Contact Position</label>
          <p>{{ item.contact_position }}</p>
        </div>
        <div class="p-field">
          <label>Contact Mobile</label>
          <p>{{ item.contact_mobile }}</p>
        </div>
        <div class="p-field">
          <label>Contact Email</label>
          <p>{{ item.contact_email }}</p>
        </div>
        <div class="p-field">
          <label>Bank Name</label>
          <p>{{ item.bank_name }}</p>
        </div>
        <div class="p-field">
          <label>Branch Name</label>
          <p>{{ item.branch_name }}</p>
        </div>
        <div class="p-field">
          <label>Account Name</label>
          <p>{{ item.account_name }}</p>
        </div>
        <div class="p-field">
          <label>City</label>
          <p>{{ item.city }}</p>
        </div>
        <div class="p-field">
          <label>Country</label>
          <p>{{ item.country }}</p>
        </div>
        <div class="p-field">
          <label>Account Type</label>
          <p>{{ item.account_type }}</p>
        </div>
        <div class="p-field">
          <label>Account Number</label>
          <p>{{ item.account_number }}</p>
        </div>
        <div class="p-field">
          <label>Swift Code</label>
          <p>{{ item.swift_code }}</p>
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
    const res = await api.get(`automation/cover-letter/${route.params.id}/`);
    item.value = res.data;
  } catch (err) {
    toast.add({ severity: 'error', summary: 'Error', detail: 'Failed to load' });
  }
}

function generatePDF() {
  api.get(`automation/cover-letter/${route.params.id}/`, { responseType: 'blob' }).then(response => {
    const blob = new Blob([response.data], { type: 'application/pdf' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = 'cover_letter.pdf';
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