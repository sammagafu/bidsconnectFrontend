<template>
  <VerticalLayout>
    <!-- Document Form -->
    <b-form
      class="row g-3 mb-4"
      @submit.prevent="submit"
      enctype="multipart/form-data"
    >
      <h4>{{ editingDoc ? 'Edit Document' : 'Upload Document' }}</h4>

      <!-- validation error -->
      <div v-if="error" class="col-12 text-danger">{{ error }}</div>

      <!-- Document Type -->
      <b-col md="4">
        <b-form-group label="Document Type*">
          <Dropdown
            v-model="form.document_type"
            :options="typeOptions"
            optionLabel="label"
            optionValue="value"
            placeholder="Select a type"
          />
        </b-form-group>
      </b-col>

      <!-- Expiry Date -->
      <b-col md="4">
        <b-form-group label="Expiry Date*">
          <Calendar
            v-model="form.expires_at"
            showIcon
            dateFormat="yy-mm-dd"
            placeholder="YYYY-MM-DD"
          />
        </b-form-group>
      </b-col>

      <!-- File Picker -->
      <b-col md="4">
        <b-form-group
          :label="editingDoc
            ? 'Replace File (PDF <5MB)'
            : 'Document File* (PDF <5MB)'"
        >
          <input
            type="file"
            accept="application/pdf"
            @change="onFileChange"
            class="form-control"
          />
          <small v-if="form.document_file">{{ form.document_file.name }}</small>
        </b-form-group>
      </b-col>

      <!-- Buttons -->
      <b-col cols="12">
        <b-button
          variant="primary"
          type="submit"
          :disabled="loading || !companyId"
        >
          <i v-if="loading" class="pi pi-spin pi-spinner me-2"></i>
          {{ editingDoc ? 'Update Document' : 'Upload Document' }}
        </b-button>
        <b-button
          v-if="editingDoc"
          variant="secondary"
          class="ms-2"
          @click="cancelEdit"
          :disabled="loading"
        >
          Cancel
        </b-button>
      </b-col>
    </b-form>

    <!-- Documents Table -->
    <div v-if="docs.length">
      <h3>Existing Documents</h3>
      <DataTable
        :value="docs"
        scrollable
        scrollHeight="400px"
        tableStyle="min-width: 800px"
        class="mt-2"
      >
        <Column field="document_type" header="Type" style="width:15%" />
        <Column field="document_category" header="Category" style="width:15%" />
        <Column header="Uploaded At" style="width:20%">
          <template #body="{ data }">
            {{ formatDate(data.uploaded_at) }}
          </template>
        </Column>
        <Column header="Expires At" style="width:20%">
          <template #body="{ data }">
            {{ formatDate(data.expires_at) }}
          </template>
        </Column>
        <Column header="Link" style="width:15%">
          <template #body="{ data }">
            <a :href="data.document_file" target="_blank">
              {{ getFileName(data.document_file) }}
            </a>
          </template>
        </Column>
        <Column header="Actions" style="width:15%">
          <template #body="{ data }">
            <Button icon="pi pi-eye" class="p-button-text me-2" @click="preview(data)" />
            <Button icon="pi pi-pencil" class="p-button-text me-2" @click="editDocument(data)" />
            <Button icon="pi pi-trash" class="p-button-text p-button-danger" @click="removeDocument(data.id)" />
          </template>
        </Column>
      </DataTable>
    </div>

    <!-- Preview Dialog -->
    <Dialog
      v-model:visible="showPreview"
      modal
      header="Preview Document"
      :style="{ width: '80vw', height: '80vh' }"
      closable
      :dismissable-mask="true"
    >
      <iframe
        v-if="previewDoc"
        :src="previewDoc.document_file"
        style="width:100%; height:100%; border:none;"
      ></iframe>
    </Dialog>
  </VerticalLayout>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue';
import { useToast } from 'primevue/usetoast';
import { useAuthStore } from '@/stores/auth';
import { api } from '@/services/authService';

import VerticalLayout from '@/layouts/VerticalLayout.vue';
import Dropdown from 'primevue/dropdown';
import Calendar from 'primevue/calendar';
import Button from 'primevue/button';
import DataTable from 'primevue/datatable';
import Column from 'primevue/column';
import Dialog from 'primevue/dialog';

const toast = useToast();
const authStore = useAuthStore();

// companyId from authStore
const companyId = computed(() => {
  const list = authStore.user?.companies || [];
  return list.length ? list[0].id : null;
});

const loading = ref(false);
const error = ref('');
const docs = ref([]);
const editingDoc = ref(null);
const showPreview = ref(false);
const previewDoc = ref(null);

const form = ref({
  document_type: null,
  expires_at: null,
  document_file: null,
});

// match backend DOCUMENT_TYPE_CHOICES values
const typeOptions = [
  { label: 'Business License', value: 'Business License' },
  { label: 'BRELA', value: 'BRELA' },
  { label: 'TIN', value: 'TIN' },
  { label: 'Tax Clearance', value: 'Tax Clearance' },
  { label: 'Bank Statement', value: 'Bank Statement' },
];

function formatDate(dt) {
  return dt ? new Date(dt).toLocaleString() : '';
}

function getFileName(url) {
  return url.split('/').pop();
}

async function fetchDocs(id) {
  if (!id) return;
  try {
    const resp = await api.get(`accounts/companies/${id}/documents/`);
    docs.value = resp.data;
  } catch {
    toast.add({ severity: 'error', summary: 'Error', detail: 'Could not load documents.' });
  }
}

function onFileChange(e) {
  const file = e.target.files[0];
  error.value = '';
  if (!file) return;
  if (file.type !== 'application/pdf') {
    error.value = 'Only PDF files are allowed.';
    form.value.document_file = null;
    return;
  }
  if (file.size > 5 * 1024 * 1024) {
    error.value = 'File must be less than 5MB.';
    form.value.document_file = null;
    return;
  }
  form.value.document_file = file;
}

function startEdit(doc) {
  editingDoc.value = doc;
  form.value.document_type = doc.document_type;
  form.value.expires_at = new Date(doc.expires_at);
  form.value.document_file = null;
  error.value = '';
}

function editDocument(doc) {
  startEdit(doc);
}

function cancelEdit() {
  editingDoc.value = null;
  form.value.document_type = null;
  form.value.expires_at = null;
  form.value.document_file = null;
  error.value = '';
}

function preview(doc) {
  previewDoc.value = doc;
  showPreview.value = true;
}

async function submit() {
  error.value = '';
  if (!form.value.document_type || !form.value.expires_at) {
    error.value = 'Please fill all required fields.';
    return;
  }
  if (!editingDoc.value && !form.value.document_file) {
    error.value = 'Please select a PDF file.';
    return;
  }
  if (!companyId.value) {
    error.value = 'No company selected.';
    return;
  }

  const payload = new FormData();
  payload.append('document_type', form.value.document_type);
  payload.append('expires_at', form.value.expires_at.toISOString().slice(0,10));
  payload.append('document_category', 'other');
  if (form.value.document_file) {
    payload.append('document_file', form.value.document_file);
  }

  loading.value = true;
  try {
    let resp;
    if (editingDoc.value) {
      resp = await api.put(
        `accounts/companies/${companyId.value}/documents/${editingDoc.value.id}/`,
        payload
      );
      docs.value = docs.value.map(d => d.id === resp.data.id ? resp.data : d);
      toast.add({ severity: 'success', summary: 'Updated', detail: 'Document updated.' });
    } else {
      resp = await api.post(
        `accounts/companies/${companyId.value}/documents/`,
        payload
      );
      docs.value.unshift(resp.data);
      toast.add({ severity: 'success', summary: 'Uploaded', detail: 'Document uploaded.' });
    }
    cancelEdit();
  } catch (err) {
    const data = err.response?.data;
    error.value = data?.document_type?.[0] || data?.document_file?.[0] || data?.detail || JSON.stringify(data) || 'Operation failed';
    toast.add({ severity: 'error', summary: 'Error', detail: error.value });
  } finally {
    loading.value = false;
  }
}

async function removeDocument(id) {
  if (!companyId.value) return;
  if (!confirm('Are you sure you want to delete this document?')) return;
  try {
    await api.delete(`accounts/companies/${companyId.value}/documents/${id}/`);
    docs.value = docs.value.filter(d => d.id !== id);
    toast.add({ severity: 'success', summary: 'Deleted', detail: 'Document removed.' });
    if (editingDoc.value?.id === id) cancelEdit();
  } catch {
    toast.add({ severity: 'error', summary: 'Error', detail: 'Delete failed.' });
  }
}

watch(companyId, fetchDocs);

onMounted(() => {
  fetchDocs(companyId.value);
});
</script>

<style scoped>
.row.g-3 { margin-top: 1rem; }
.mb-4    { margin-bottom: 1.5rem; }
</style>
