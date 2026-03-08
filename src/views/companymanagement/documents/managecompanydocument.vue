<template>
  <VerticalLayout>
    <b-card class="mb-4">
      <!-- header toolbar -->
      <template #header>
        <div class="d-flex justify-content-between align-items-center">
          <h3 class="mb-0">Documents</h3>
          <div>
            <b-button size="sm" variant="outline-success" class="me-2" @click="exportDocuments" :disabled="!docs.length || exportLoading">
              <i class="bx bx-download"></i> {{ exportLoading ? 'Exporting...' : 'Export CSV' }}
            </b-button>
            <b-button size="sm" variant="outline-primary" @click="openModal()">
              <i class="bx bx-plus"></i> Create
            </b-button>
            <b-button
              size="sm"
              variant="outline-secondary"
              class="ms-2"
              @click="fetchDocs()"
            >
              <i class="bx bx-refresh"></i>
            </b-button>
          </div>
        </div>
      </template>

      <!-- list -->
      <b-list-group flush>
        <b-list-group-item
          v-for="doc in docs"
          :key="doc.id"
          class="d-flex justify-content-between align-items-center"
        >
          <div>
            <strong>{{ doc.document_type }}</strong>
            <small class="text-muted d-block">
              Expires: {{ formatDate(doc.expires_at) }}
            </small>
          </div>
          <div>
            <a
              v-if="doc.document_file"
              :href="doc.document_file"
              target="_blank"
              class="me-3"
            >
              Download
            </a>
            <b-button
              size="sm"
              variant="outline-primary"
              class="me-2"
              @click="openModal(doc)"
            >
              <i class="bx bx-pencil"></i>
            </b-button>
            <b-button
              size="sm"
              variant="outline-danger"
              @click="removeDocument(doc.id)"
            >
              <i class="bx bx-trash"></i>
            </b-button>
          </div>
        </b-list-group-item>

        <b-list-group-item v-if="!docs.length" class="text-center text-muted">
          No documents.
        </b-list-group-item>
      </b-list-group>
    </b-card>

    <!-- create/edit modal -->
    <b-modal
      v-model="showModal"
      :title="editing ? 'Edit Document' : 'Upload Document'"
      hide-footer
      @hide="resetForm()"
    >
      <b-form @submit.prevent="submit">
        <div class="mb-3 text-danger" v-if="error">{{ error }}</div>

        <!-- Document Type -->
        <b-form-group label="Document Type*" label-for="dt">
          <b-form-select
            id="dt"
            v-model="form.document_type"
            :options="typeOptions"
            required
          />
        </b-form-group>

        <!-- Expiry Date -->
        <b-form-group label="Expiry Date*" label-for="ex">
          <b-form-input
            id="ex"
            v-model="form.expires_at"
            type="date"
            required
          />
        </b-form-group>

        <!-- File Picker -->
        <b-form-group :label="editing ? 'Replace File' : 'File (PDF <5MB)'">
          <input
            type="file"
            accept="application/pdf"
            @change="onFileChange"
            class="form-control"
          />
          <small v-if="form.file">{{ form.file.name }}</small>
        </b-form-group>

        <div class="d-flex justify-content-end mt-4">
          <b-button variant="secondary" class="me-2" @click="closeModal()">
            Cancel
          </b-button>
          <b-button variant="primary" type="submit" :disabled="loading">
            <i v-if="loading" class="bx bx-loader bx-spin me-2"></i>
            Save
          </b-button>
        </div>
      </b-form>
    </b-modal>
  </VerticalLayout>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useToast } from 'primevue/usetoast'
import { useAuthStore } from '@/stores/auth'
import { companiesService, parseApiError } from '@/services'
import VerticalLayout from '@/layouts/VerticalLayout.vue'
import {
  BCard, BButton, BListGroup, BListGroupItem,
  BModal, BForm, BFormGroup, BFormSelect, BFormInput
} from 'bootstrap-vue-next'

const toast      = useToast()
const auth       = useAuthStore()
const companyId  = computed(() => auth.user?.companies?.[0]?.id || null)

const docs         = ref([])
const showModal    = ref(false)
const editing      = ref(false)
const loading      = ref(false)
const exportLoading = ref(false)
const error        = ref('')

// our reactive form
const form       = ref({
  id:            null,
  document_type: null,
  expires_at:    '',
  file:          null
})

// **Use `text` (not `label`)** for b-form-select
const typeOptions = [
  { value: 'Business License', text: 'Business License' },
  { value: 'BRELA',            text: 'BRELA' },
  { value: 'TIN',              text: 'TIN' },
  { value: 'Tax Clearance',    text: 'Tax Clearance' },
  { value: 'Bank Statement',   text: 'Bank Statement' }
]

function formatDate(d) {
  return d ? new Date(d).toLocaleDateString() : '—'
}

async function fetchDocs() {
  if (!companyId.value) return
  try {
    docs.value = await companiesService.listDocuments(companyId.value) || []
  } catch (e) {
    toast.add({ severity:'error', summary:'Error', detail: parseApiError(e) || 'Could not load documents.' })
  }
}

function openModal(doc = null) {
  error.value = ''
  editing.value = !!doc
  if (doc) {
    // edit
    form.value.id            = doc.id
    form.value.document_type = doc.document_type
    form.value.expires_at    = doc.expires_at.slice(0,10)
    form.value.file          = null
  } else {
    // new
    Object.assign(form.value, {
      id: null,
      document_type: null,
      expires_at: '',
      file: null
    })
  }
  showModal.value = true
}

function closeModal() {
  showModal.value = false
}

// clear form on modal hide
function resetForm() {
  editing.value = false
  error.value = ''
  form.value = { id:null, document_type:null, expires_at:'', file:null }
}

function onFileChange(e) {
  const f = e.target.files[0]
  error.value = ''
  if (!f) return
  if (f.type !== 'application/pdf') {
    error.value = 'Only PDFs allowed.'
    return
  }
  if (f.size > 5*1024*1024) {
    error.value = 'Max 5 MB.'
    return
  }
  form.value.file = f
}

async function submit() {
  // basic validation
  if (!form.value.document_type || !form.value.expires_at) {
    error.value = 'All fields required.'
    return
  }
  if (!editing.value && !form.value.file) {
    error.value = 'Please select a PDF.'
    return
  }

  loading.value = true
  const payload = new FormData()
  payload.append('document_type',    form.value.document_type)
  payload.append('expires_at',       form.value.expires_at)
  payload.append('document_category','other')
  if (form.value.file) {
    payload.append('document_file', form.value.file)
  }

  try {
    if (editing.value) {
      await companiesService.updateDocument(companyId.value, form.value.id, payload)
    } else {
      await companiesService.createDocument(companyId.value, payload)
    }
    toast.add({
      severity:  'success',
      summary:   editing.value ? 'Updated' : 'Uploaded',
      detail:    editing.value ? 'Document updated.' : 'Document uploaded.'
    })
    closeModal()
    fetchDocs()
  } catch (e) {
    error.value = parseApiError(e) || 'Operation failed.'
  } finally {
    loading.value = false
  }
}

async function removeDocument(id) {
  if (!confirm('Delete this document?')) return
  try {
    await companiesService.deleteDocument(companyId.value, id)
    toast.add({ severity:'success', summary:'Deleted', detail:'Document removed.' })
    fetchDocs()
  } catch (e) {
    toast.add({ severity:'error', summary:'Error', detail: parseApiError(e) || 'Delete failed.' })
  }
}

async function exportDocuments() {
  if (!companyId.value || !docs.value.length) return
  exportLoading.value = true
  try {
    const blob = await companiesService.exportDocuments(companyId.value)
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `company-documents-${new Date().toISOString().slice(0, 10)}.csv`
    a.click()
    URL.revokeObjectURL(url)
    toast.add({ severity:'success', summary:'Exported', detail:'Documents exported as CSV.' })
  } catch (e) {
    toast.add({ severity:'error', summary:'Error', detail: parseApiError(e) || 'Export failed.' })
  } finally {
    exportLoading.value = false
  }
}

onMounted(fetchDocs)
</script>

<style scoped>
.mb-4 { margin-bottom: 1.5rem; }
</style>
