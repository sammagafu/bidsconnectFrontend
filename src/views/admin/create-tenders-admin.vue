<template>
  <VerticalLayout>
    <b-card>
      <!-- Progress bar -->
      <b-progress :value="progress" max="100" class="mb-3">
        <b-progress-bar :value="progress" :label="`Step ${step}/5`" />
      </b-progress>

      <!-- Step 1: Tender Info -->
      <b-form v-if="step === 1" @submit.prevent="nextStep">
        <b-form-group label="Title" label-for="title">
          <b-form-input id="title" v-model.trim="tender.title" :state="!errors.title" required />
        </b-form-group>

        <b-form-group label="Reference Number" label-for="reference_number">
          <b-form-input id="reference_number" v-model.trim="tender.reference_number" :state="!errors.reference_number" required />
        </b-form-group>

        <b-form-group label="Country Type" label-for="tender_type_country">
          <b-form-select id="tender_type_country" v-model="tender.tender_type_country" :options="tenderTypeCountries" />
        </b-form-group>

        <b-form-group label="Sector Type" label-for="tender_type_sector">
          <b-form-select id="tender_type_sector" v-model="tender.tender_type_sector" :options="tenderTypeSectors" />
        </b-form-group>

        <b-form-group label="Description" label-for="tenderdescription">
          <b-form-textarea id="tenderdescription" v-model="tender.tenderdescription" rows="3" />
        </b-form-group>

        <b-form-group label="Category" label-for="category">
          <b-form-select
            id="category"
            v-model="tender.category_id"
            :options="categories"
            :state="!errors.category_id"
            @change="onCategoryChange"
            required
          />
        </b-form-group>

        <b-form-group label="Subcategory" label-for="subcategory">
          <b-form-select
            id="subcategory"
            v-model="tender.subcategory_id"
            :options="subcategories"
            :state="!errors.subcategory_id"
            required
          />
        </b-form-group>

        <b-form-group label="Procurement Process" label-for="procurement_process_id">
          <b-form-select
            id="procurement_process_id"
            v-model="tender.procurement_process_id"
            :options="procurementProcesses"
            :state="!errors.procurement_process_id"
            required
          />
        </b-form-group>

        <b-form-group label="Tender Fees (TZS)" label-for="tender_fees">
          <b-form-input id="tender_fees" type="number" v-model.number="tender.tender_fees" :state="!errors.tender_fees" required />
        </b-form-group>

        <b-button type="submit" variant="primary">Next</b-button>
      </b-form>

      <!-- Step 2: Dates -->
      <b-form v-else-if="step === 2" @submit.prevent="nextStep">
        <b-form-group label="Submission Deadline" label-for="submission_deadline">
          <Calendar id="submission_deadline" v-model="tender.submission_deadline" showIcon showTime dateFormat="yy-mm-dd" />
        </b-form-group>
        <b-form-group label="Clarification Deadline" label-for="clarification_deadline">
          <Calendar id="clarification_deadline" v-model="tender.clarification_deadline" showIcon showTime dateFormat="yy-mm-dd" />
        </b-form-group>
        <b-form-group label="Evaluation Start" label-for="evaluation_start_date">
          <Calendar id="evaluation_start_date" v-model="tender.evaluation_start_date" showIcon showTime dateFormat="yy-mm-dd" />
        </b-form-group>
        <b-form-group label="Evaluation End" label-for="evaluation_end_date">
          <Calendar id="evaluation_end_date" v-model="tender.evaluation_end_date" showIcon showTime dateFormat="yy-mm-dd" />
        </b-form-group>

        <b-button variant="secondary" @click="step--">Back</b-button>
        <b-button type="submit" variant="primary">Next</b-button>
      </b-form>

      <!-- Step 3: Agency -->
      <b-form v-else-if="step === 3" @submit.prevent="nextStep">
        <b-form-group label="Search Agency" label-for="agencySearch">
          <b-input-group>
            <b-form-input id="agencySearch" v-model="agencySearch" @input="searchAgency" placeholder="Type agency name..." />
            <b-button variant="secondary" @click="searchAgency">Search</b-button>
          </b-input-group>
        </b-form-group>

        <b-form-group v-if="agencyResults.length" label="Select Existing Agency" label-for="agency_id">
          <b-form-select
            id="agency_id"
            v-model="tender.agency_id"
            :options="agencyResults.map(a => ({ value: a.id, text: a.name }))"
          />
        </b-form-group>

        <div v-if="!tender.agency_id">
          <b-form-group label="Agency Name" label-for="newAgency.name">
            <b-form-input id="newAgency.name" v-model="newAgency.name" required />
          </b-form-group>
          <b-form-group label="Email" label-for="newAgency.email">
            <b-form-input id="newAgency.email" type="email" v-model="newAgency.email" />
          </b-form-group>
          <b-form-group label="Phone" label-for="newAgency.phone_number">
            <b-form-input id="newAgency.phone_number" v-model="newAgency.phone_number" />
          </b-form-group>
          <b-form-group label="Address" label-for="newAgency.address">
            <b-form-input id="newAgency.address" v-model="newAgency.address" />
          </b-form-group>
          <b-form-group label="Logo Upload" label-for="newAgency.logoFile">
            <b-form-file id="newAgency.logoFile" v-model="newAgency.logoFile" accept="image/*" />
          </b-form-group>
        </div>

        <b-button variant="secondary" @click="step--">Back</b-button>
        <b-button type="submit" variant="primary">Next</b-button>
      </b-form>

      <!-- Step 4: Required Documents -->
      <b-form v-else-if="step === 4" @submit.prevent="createRequiredDocuments">
        <div
          v-for="(doc, index) in requiredDocuments"
          :key="index"
          class="mb-3 border p-2 rounded"
        >
          <b-form-group :label="`Document ${index + 1} Name`" label-for="doc.name">
            <b-form-input v-model="doc.name" required />
          </b-form-group>

          <b-form-group :label="`Document ${index + 1} Description`" label-for="doc.description">
            <b-form-textarea v-model="doc.description" rows="2" />
          </b-form-group>

          <b-form-group :label="`Document ${index + 1} Type`" label-for="doc.document_type">
            <b-form-select v-model="doc.document_type" :options="documentTypeOptions" />
          </b-form-group>

          <b-button size="sm" variant="danger" @click="removeDocument(index)">Remove</b-button>
        </div>

        <b-button size="sm" variant="outline-primary" @click="addDocument">+ Add Document</b-button>

        <b-button variant="secondary" @click="step--">Back</b-button>
        <b-button type="submit" variant="success">Submit Tender</b-button>
      </b-form>

      <!-- Success screen -->
      <div v-else>
        <h4 class="text-success">✅ Tender successfully created!</h4>
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
const progress = computed(() => ((step.value - 1) / 4) * 100)

const tender = ref({
  title: '',
  reference_number: '',
  tender_type_country: 'National',
  tender_type_sector: 'Private Company',
  tenderdescription: '',
  submission_deadline: null,
  clarification_deadline: null,
  evaluation_start_date: null,
  evaluation_end_date: null,
  category_id: null,
  subcategory_id: null,
  procurement_process_id: null,
  tender_fees: null,
  agency_id: null
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

const tenderTypeCountries = [
  { value: 'National', text: 'National' },
  { value: 'International', text: 'International' }
]
const tenderTypeSectors = [
  { value: 'Private Company', text: 'Private Company' },
  { value: 'Public Sector', text: 'Public Sector' }
]

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

const nextStep = () => {
  if (step.value === 1 && !validateStep1()) {
    toast.add({ severity: 'error', summary: 'Validation Error', detail: 'Please fill all required fields.' })
    return
  }
  step.value++
}

const onCategoryChange = () => {
  tender.value.subcategory_id = null
}

watch(
  () => tender.value.category_id,
  id => {
    const cat = categoriesWithSubs.value.find(c => c.id === id)
    subcategories.value = cat
      ? cat.subcategories.map(sc => ({ value: sc.id, text: sc.name }))
      : []
    tender.value.subcategory_id = null
  }
)

const searchAgency = async () => {
  try {
    const res = await api.get(`tenders/agencies/?search=${agencySearch.value}`)
    agencyResults.value = res.data.results || res.data
  } catch {
    toast.add({ severity: 'error', summary: 'Error', detail: 'Failed to search agencies' })
  }
}

const addDocument = () => requiredDocuments.value.push({ name: '', description: '', document_type: '' })
const removeDocument = i => requiredDocuments.value.splice(i, 1)

const createRequiredDocuments = async () => {
  try {
    // Submit tender first
    const resTender = await api.post('tenders/tenders/', tender.value)
    const slug = resTender.data.slug
    // Create each required document
    for (const doc of requiredDocuments.value) {
      await api.post(`tenders/tenders/${slug}/required-documents/`, doc)
    }
    toast.add({ severity: 'success', summary: 'Success', detail: 'Tender and documents created successfully' })
    step.value = 5
  } catch {
    toast.add({ severity: 'error', summary: 'Error', detail: 'Failed to create tender or documents' })
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

onMounted(() => {
  fetchCategoriesWithSubcategories()
  fetchProcurementProcesses()
})
</script>

<style scoped>
.mt-3 { margin-top: 1rem }
</style>
