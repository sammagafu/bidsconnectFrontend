<template>
  <VerticalLayout>
    <b-card>
      <!-- Progress bar -->
      <b-progress :value="progress" max="100" class="mb-3">
        <b-progress-bar :value="progress" :label="`Step ${step}/4`" />
      </b-progress>

      <!-- Step 1: Tender Info -->
      <b-form v-if="step === 1" @submit.prevent="nextStep">
        <b-form-group label="Title">
          <b-form-input v-model="tender.title" :state="!errors.title" required />
        </b-form-group>

        <b-form-group label="Reference Number">
          <b-form-input v-model="tender.reference_number" :state="!errors.reference_number" required />
        </b-form-group>

        <b-form-group label="Country Type">
          <b-form-select v-model="tender.tender_type_country" :options="tenderTypeCountries" />
        </b-form-group>

        <b-form-group label="Sector Type">
          <b-form-select v-model="tender.tender_type_sector" :options="tenderTypeSectors" />
        </b-form-group>

        <b-form-group label="Description">
          <b-form-textarea v-model="tender.tenderdescription" rows="3" />
        </b-form-group>

        <b-form-group label="Category">
          <b-form-select v-model="tender.category_id" :options="categories" required />
        </b-form-group>

        <b-form-group label="Subcategory">
          <b-form-select v-model="tender.subcategory_id" :options="subcategories" required />
        </b-form-group>

        <b-form-group label="Procurement Process">
          <b-form-select v-model="tender.procurement_process_id" :options="procurementProcesses" required />
        </b-form-group>

        <b-form-group label="Tender Fees (TZS)">
          <b-form-input type="number" v-model="tender.tender_fees" required />
        </b-form-group>

        <b-button class="mt-3" type="submit" variant="primary">Next</b-button>
      </b-form>

      <!-- Step 2: Dates -->
      <b-form v-else-if="step === 2" @submit.prevent="nextStep">
        <b-form-group label="Submission Deadline">
          <Calendar v-model="tender.submission_deadline" showIcon showTime hourFormat="24" dateFormat="yy-mm-dd" />
        </b-form-group>
        <b-form-group label="Clarification Deadline">
          <Calendar v-model="tender.clarification_deadline" showIcon showTime hourFormat="24" dateFormat="yy-mm-dd" />
        </b-form-group>
        <b-form-group label="Evaluation Start">
          <Calendar v-model="tender.evaluation_start_date" showIcon showTime hourFormat="24" dateFormat="yy-mm-dd" />
        </b-form-group>
        <b-form-group label="Evaluation End">
          <Calendar v-model="tender.evaluation_end_date" showIcon showTime hourFormat="24" dateFormat="yy-mm-dd" />
        </b-form-group>

        <div class="d-flex gap-2 mt-3">
          <b-button variant="secondary" @click="step--">Back</b-button>
          <b-button type="submit" variant="primary">Next</b-button>
        </div>
      </b-form>

      <!-- Step 3: Agency -->
      <b-form v-else-if="step === 3" @submit.prevent="nextStep">
        <b-form-group label="Search Agency">
          <b-input-group>
            <b-form-input v-model="agencySearch" @input="searchAgency" placeholder="Type agency name..." />
            <b-button variant="secondary" @click="searchAgency">Search</b-button>
          </b-input-group>
        </b-form-group>

        <b-form-group v-if="agencyResults.length" label="Select Existing Agency">
          <b-form-select v-model="tender.agency_id" :options="agencyResults.map(a => ({ value: a.id, text: a.name }))" />
        </b-form-group>

        <div v-if="!tender.agency_id">
          <b-form-group label="Agency Name">
            <b-form-input v-model="newAgency.name" required />
          </b-form-group>
          <b-form-group label="Email">
            <b-form-input type="email" v-model="newAgency.email" />
          </b-form-group>
          <b-form-group label="Phone">
            <b-form-input v-model="newAgency.phone_number" />
          </b-form-group>
          <b-form-group label="Address">
            <b-form-input v-model="newAgency.address" />
          </b-form-group>
          <b-form-group label="Logo Upload">
            <b-form-file v-model="newAgency.logoFile" accept="image/*" />
          </b-form-group>
        </div>

        <div class="d-flex gap-2 mt-3">
          <b-button variant="secondary" @click="step--">Back</b-button>
          <b-button type="submit" variant="primary">Next</b-button>
        </div>
      </b-form>

      <!-- Step 4: Required Documents -->
      <b-form v-else-if="step === 4" @submit.prevent="submitTenderWithDocuments">
        <div v-for="(doc, index) in requiredDocuments" :key="index" class="mb-3 border p-2 rounded">
          <b-form-group label="Document Name">
            <b-form-input v-model="doc.name" required />
          </b-form-group>

          <b-form-group label="Description">
            <b-form-textarea v-model="doc.description" rows="2" />
          </b-form-group>

          <b-form-group label="Document Type">
            <b-form-select v-model="doc.document_type" :options="documentTypeOptions" />
          </b-form-group>

          <b-button size="sm" variant="danger" @click="removeDocument(index)">Remove</b-button>
        </div>

        <b-button size="sm" variant="outline-primary" @click="addDocument">+ Add Document</b-button>

        <div class="d-flex gap-2 mt-3">
          <b-button variant="secondary" @click="step--">Back</b-button>
          <b-button type="submit" variant="success">Submit Tender</b-button>
        </div>
      </b-form>

      <!-- Success screen -->
      <div v-else>
        <h4 class="text-success">✅ Tender successfully created with documents!</h4>
        <b-button variant="outline-primary" @click="resetForm">Start New</b-button>
      </div>
    </b-card>
  </VerticalLayout>
</template>

<script setup>
import { ref, computed, watch, onMounted } from 'vue'
import { api } from '@/services/authService'
import VerticalLayout from '@/layouts/VerticalLayout.vue'
import Calendar from 'primevue/calendar'
import { useToast } from 'primevue/usetoast'

const toast = useToast()
const step = ref(1)
const progress = computed(() => (step.value - 1) * 25)

const tender = ref({
  title: '', reference_number: '',
  tender_type_country: 'National', tender_type_sector: 'Private Company',
  tenderdescription: '', submission_deadline: null, clarification_deadline: null,
  evaluation_start_date: null, evaluation_end_date: null,
  category_id: null, subcategory_id: null, procurement_process_id: null,
  tender_fees: null, agency_id: null
})

const newAgency = ref({ name: '', email: '', phone_number: '', address: '', logoFile: null })

const requiredDocuments = ref([{ name: '', description: '', document_type: '' }])

const documentTypeOptions = [
  { value: 'PDF', text: 'PDF' },
  { value: 'Word', text: 'Word Document' },
  { value: 'Image', text: 'Image' }
]

const errors = ref({})
const agencySearch = ref('')
const agencyResults = ref([])

const categoriesWithSubs = ref([])
const categories = ref([])
const subcategories = ref([])
const procurementProcesses = ref([])

const tenderTypeCountries = [{ value: 'National', text: 'National' }, { value: 'International', text: 'International' }]
const tenderTypeSectors = [{ value: 'Private Company', text: 'Private Company' }, { value: 'Public Sector', text: 'Public Sector' }]

const validateStep1 = () => {
  errors.value = {}
  if (!tender.value.title) errors.value.title = true
  if (!tender.value.reference_number) errors.value.reference_number = true
  if (!tender.value.category_id) errors.value.category_id = true
  if (!tender.value.subcategory_id) errors.value.subcategory_id = true
  if (!tender.value.procurement_process_id) errors.value.procurement_process_id = true
  if (!tender.value.tender_fees) errors.value.tender_fees = true
  return Object.keys(errors.value).length === 0
}

const saveDraft = () => localStorage.setItem('draftTender', JSON.stringify(tender.value))
const loadDraft = () => {
  const draft = localStorage.getItem('draftTender')
  if (draft) tender.value = JSON.parse(draft)
}
const resetForm = () => {
  tender.value = { title: '', reference_number: '', tender_type_country: 'National', tender_type_sector: 'Private Company',
    tenderdescription: '', submission_deadline: null, clarification_deadline: null,
    evaluation_start_date: null, evaluation_end_date: null,
    category_id: null, subcategory_id: null, procurement_process_id: null, tender_fees: null, agency_id: null }
  newAgency.value = { name: '', email: '', phone_number: '', address: '', logoFile: null }
  requiredDocuments.value = [{ name: '', description: '', document_type: '' }]
  localStorage.removeItem('draftTender')
  step.value = 1
}

const nextStep = () => {
  if (step.value === 1 && !validateStep1()) {
    toast.add({ severity: 'error', summary: 'Validation Error', detail: 'Please fill required fields.' })
    return
  }
  step.value++
}

const searchAgency = async () => {
  if (!agencySearch.value) { agencyResults.value = []; return }
  try {
    const res = await api.get(`tenders/agencies/?search=${agencySearch.value}`)
    agencyResults.value = res.data.results || res.data
  } catch {
    toast.add({ severity: 'error', summary: 'Error', detail: 'Failed to search agencies' })
  }
}

const addDocument = () => requiredDocuments.value.push({ name: '', description: '', document_type: '' })
const removeDocument = (index) => requiredDocuments.value.splice(index, 1)

const submitTenderWithDocuments = async () => {
  try {
    let agencyId = tender.value.agency_id
    if (!agencyId && newAgency.value.name) {
      const formData = new FormData()
      formData.append('name', newAgency.value.name)
      formData.append('email', newAgency.value.email || '')
      formData.append('phone_number', newAgency.value.phone_number || '')
      formData.append('address', newAgency.value.address || '')
      if (newAgency.value.logoFile) formData.append('logo', newAgency.value.logoFile)
      const agencyRes = await api.post('tenders/agencies/', formData, { headers: { 'Content-Type': 'multipart/form-data' } })
      agencyId = agencyRes.data.id
    }
    const payload = { ...tender.value, agency_id: agencyId }
    const tenderRes = await api.post('tenders/tenders/', payload)

    for (const doc of requiredDocuments.value) {
      await api.post(`tenders/tenders/${tenderRes.data.slug}/required-documents/`, doc)
    }

    toast.add({ severity: 'success', summary: 'Success', detail: 'Tender and documents created successfully' })
    localStorage.removeItem('draftTender')
    step.value = 5
  } catch {
    toast.add({ severity: 'error', summary: 'Error', detail: 'Failed to create tender and documents' })
  }
}

const fetchCategoriesWithSubcategories = async () => {
  try {
    const res = await api.get('tenders/categories-with-subcategories/')
    categoriesWithSubs.value = res.data
    categories.value = res.data.map(c => ({ value: c.id, text: c.name }))
  } catch {
    toast.add({ severity: 'error', summary: 'Error', detail: 'Failed to load categories' })
  }
}

const fetchProcurementProcesses = async () => {
  try {
    const res = await api.get('tenders/procurement-processes/')
    procurementProcesses.value = res.data.map(p => ({ value: p.id, text: p.name }))
  } catch {
    toast.add({ severity: 'error', summary: 'Error', detail: 'Failed to load procurement processes' })
  }
}

watch(() => tender.value.category_id, (newId) => {
  const cat = categoriesWithSubs.value.find(c => c.id === newId)
  subcategories.value = cat ? cat.subcategories.map(sc => ({ value: sc.id, text: sc.name })) : []
  tender.value.subcategory_id = null
})

onMounted(() => {
  loadDraft()
  fetchCategoriesWithSubcategories()
  fetchProcurementProcesses()
})
</script>

<style scoped>
.mt-3 { margin-top: 1rem }
</style>
