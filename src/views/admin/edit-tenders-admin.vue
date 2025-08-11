<template>
  <VerticalLayout>
    <b-card>
      <!-- Progress bar -->
      <b-progress :value="progress" max="100" class="mb-3">
        <b-progress-bar
          :value="progress"
          :label="`Step ${Math.min(store.step, 5)}/5`"
        />
      </b-progress>

      <!-- Step 1: Basic Info -->
      <b-form v-if="store.step === 1">
        <b-form-group class="mb-3" label="Title" label-for="title">
          <b-form-input
            id="title"
            v-model.trim="store.tender.title"
            :state="!errors.title"
            required
          />
        </b-form-group>

        <b-form-group class="mb-3" label="Reference Number" label-for="reference_number">
          <b-form-input
            id="reference_number"
            v-model.trim="store.tender.reference_number"
            :state="!errors.reference_number"
            required
          />
        </b-form-group>

        <b-form-group class="mb-3" label="Country Type" label-for="tender_type_country">
          <b-form-select
            id="tender_type_country"
            v-model="store.tender.tender_type_country"
            :options="tenderTypeCountries"
          />
        </b-form-group>

        <b-form-group class="mb-3" label="Sector Type" label-for="tender_type_sector">
          <b-form-select
            id="tender_type_sector"
            v-model="store.tender.tender_type_sector"
            :options="tenderTypeSectors"
          />
        </b-form-group>

        <b-form-group class="mb-3" label="Description" label-for="tenderdescription">
          <b-form-textarea
            id="tenderdescription"
            v-model="store.tender.tenderdescription"
            rows="3"
          />
        </b-form-group>

        <b-form-group class="mb-3" label="Category" label-for="category">
          <b-form-select
            id="category"
            v-model="store.tender.category_id"
            :options="categories"
            :state="!errors.category_id"
            @change="onCategoryChange"
            required
          />
        </b-form-group>

        <b-form-group class="mb-3" label="Subcategory" label-for="subcategory">
          <b-form-select
            id="subcategory"
            v-model="store.tender.subcategory_id"
            :options="subcategories"
            :state="!errors.subcategory_id"
            required
          />
        </b-form-group>

        <b-form-group class="mb-3" label="Procurement Process" label-for="procurement_process_id">
          <b-form-select
            id="procurement_process_id"
            v-model="store.tender.procurement_process_id"
            :options="procurementProcesses"
            :state="!errors.procurement_process_id"
            required
          />
        </b-form-group>

        <b-form-group class="mb-3" label="Tender Fees" label-for="tender_fees">
          <b-form-input
            id="tender_fees"
            type="number"
            v-model.number="store.tender.tender_fees"
            :state="!errors.tender_fees"
            required
          />
        </b-form-group>
      </b-form>

      <!-- Step 2: Deadlines & Dates -->
      <b-form v-else-if="store.step === 2">
        <b-form-group class="mb-3" label="Submission Deadline">
          <Calendar
            v-model="store.tender.submission_deadline"
            showIcon showTime dateFormat="yy-mm-dd"
          />
        </b-form-group>
        <b-form-group class="mb-3" label="Clarification Deadline">
          <Calendar
            v-model="store.tender.clarification_deadline"
            showIcon showTime dateFormat="yy-mm-dd"
          />
        </b-form-group>
        <b-form-group class="mb-3" label="Evaluation Start">
          <Calendar
            v-model="store.tender.evaluation_start_date"
            showIcon showTime dateFormat="yy-mm-dd"
          />
        </b-form-group>
        <b-form-group class="mb-3" label="Evaluation End">
          <Calendar
            v-model="store.tender.evaluation_end_date"
            showIcon showTime dateFormat="yy-mm-dd"
          />
        </b-form-group>
      </b-form>

      <!-- Step 3: Agency Lookup / Create -->
      <b-form v-else-if="store.step === 3">
        <b-form-group class="mb-3" label="Agency" label-for="agency">
          <AutoComplete
            id="agency"
            v-model="store.selectedAgencyName"
            :suggestions="agencyResults"
            field="name"
            placeholder="Type to search..."
            @complete="searchAgency"
            @select="onAgencySelect"
          />
        </b-form-group>

        <div v-if="!store.tender.agency_id">
          <b-form-group class="mb-3" label="New Agency Name">
            <b-form-input v-model="newAgency.name" required />
          </b-form-group>
          <b-form-group class="mb-3" label="Email">
            <b-form-input type="email" v-model="newAgency.email" />
          </b-form-group>
          <b-form-group class="mb-3" label="Phone">
            <b-form-input v-model="newAgency.phone_number" />
          </b-form-group>
          <b-form-group class="mb-3" label="Address">
            <b-form-input v-model="newAgency.address" />
          </b-form-group>
          <b-form-group class="mb-3" label="Logo">
            <b-form-file accept="image/*" v-model="newAgency.logoFile" />
          </b-form-group>
        </div>
      </b-form>

      <!-- Step 4: Additional Details -->
      <b-form v-else-if="store.step === 4">
        <b-form-group class="mb-3" label="Validity Period (days)">
          <b-form-input
            type="number"
            v-model.number="store.tender.validity_period_days"
          />
        </b-form-group>
        <b-form-group class="mb-3" label="Completion Period (days)">
          <b-form-input
            type="number"
            v-model.number="store.tender.completion_period_days"
          />
        </b-form-group>
        <b-form-group class="mb-3" label="Litigation Start Date">
          <Calendar
            v-model="store.tender.litigation_history_start"
            dateFormat="yy-mm-dd"
          />
        </b-form-group>
        <b-form-group class="mb-3" label="Litigation End Date">
          <Calendar
            v-model="store.tender.litigation_history_end"
            dateFormat="yy-mm-dd"
          />
        </b-form-group>
        <b-form-group class="mb-3" label="Tender Document">
          <b-form-file
            accept=".pdf,.doc,.docx"
            v-model="store.tender.tender_document"
          />
        </b-form-group>
        <b-form-group class="mb-3" label="Security Type" label-for="tender_securing_type">
          <b-form-select
            id="tender_securing_type"
            v-model="store.tender.tender_securing_type"
            :options="tenderSecurityOptions"
          />
        </b-form-group>
        <template v-if="store.tender.tender_securing_type !== 'Tender Security'">
          <b-form-group class="mb-3" label="Security Percentage">
            <b-form-input
              type="number"
              step="0.01"
              v-model.number="store.tender.tender_security_percentage"
            />
          </b-form-group>
          <b-form-group class="mb-3" label="Security Amount">
            <b-form-input
              type="number"
              step="0.01"
              v-model.number="store.tender.tender_security_amount"
            />
          </b-form-group>
          <b-form-group class="mb-3" label="Security Currency">
            <b-form-select
              v-model="store.tender.tender_security_currency"
              :options="currencyOptions"
            />
          </b-form-group>
        </template>
      </b-form>

      <!-- Step 5: Required Documents -->
      <b-form v-else-if="store.step === 5">
        <div
          v-for="(doc, i) in store.requiredDocuments"
          :key="i"
          class="mb-3 border p-2 rounded"
        >
          <b-form-group class="mb-2" :label="`Document ${i+1} Name`">
            <b-form-select
              v-model="store.requiredDocuments[i].selectedName"
              :options="documentNameOptions"
              required
            />
          </b-form-group>
          <b-form-group v-if="store.requiredDocuments[i].selectedName === 'other'" class="mb-2" label="Custom Name">
            <b-form-input
              v-model="store.requiredDocuments[i].customName"
              required
            />
          </b-form-group>
          <b-form-group class="mb-2" :label="`Document ${i+1} Description`">
            <b-form-textarea
              v-model="store.requiredDocuments[i].description"
              rows="2"
            />
          </b-form-group>
          <b-form-group class="mb-2" :label="`Document ${i+1} Type`">
            <b-form-select
              v-model="store.requiredDocuments[i].document_type"
              :options="documentTypeOptions"
            />
          </b-form-group>
          <b-button
            size="sm"
            variant="danger"
            @click="store.removeDocument(i)"
          >
            Remove
          </b-button>
        </div>
        <b-button
          size="sm"
          variant="outline-primary"
          @click="store.addDocument"
        >
          + Add Document
        </b-button>
      </b-form>

      <!-- Step 6: Success -->
      <div v-else class="text-center py-4">
        <h4 class="text-success mb-4">✅ Tender updated!</h4>
        <b-button class="me-2" variant="outline-primary" @click="resetAll">
          New Tender
        </b-button>
        <b-button variant="primary" @click="goToList">
          Go to Tenders Management
        </b-button>
      </div>

      <!-- Footer -->
      <template #footer>
        <div class="d-flex justify-content-end gap-2">
          <b-button
            v-if="store.step > 1 && store.step < 6"
            variant="secondary"
            @click="store.back()"
          >
            Back
          </b-button>
          <b-button
            v-if="store.step < 5"
            variant="primary"
            @click="nextStep"
          >
            Next
          </b-button>
          <b-button
            v-if="store.step === 5"
            variant="success"
            @click="updateTender"
          >
            Update Tender
          </b-button>
        </div>
      </template>
    </b-card>
  </VerticalLayout>
</template>

<script setup>
import { ref, computed, watch, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import AutoComplete from 'primevue/autocomplete'
import { useTenderStore } from '@/stores/tenderStore'
import { api } from '@/services/authService'
import VerticalLayout from '@/layouts/VerticalLayout.vue'
import Calendar from 'primevue/calendar'
import { useToast } from 'primevue/usetoast'

const toast = useToast()
const router = useRouter()
const route = useRoute()
const slug = route.params.slug
const store = useTenderStore()

// Progress bar
const progress = computed(() => ((store.step - 1) / 5) * 100)

// local-only
const newAgency = ref({ name:'', email:'', phone_number:'', address:'', logoFile:null })
const agencyResults = ref([])

// lookups
const categoriesWithSubs = ref([])
const categories = ref([])
const subcategories = ref([])
const procurementProcesses = ref([])

// dropdown options
const tenderTypeCountries = [
  { value:'National', text:'National' },
  { value:'International', text:'International' },
]
const tenderTypeSectors = [
  { value:'Private Company', text:'Private Company' },
  { value:'Public Sector', text:'Public Sector' },
]
const documentTypeOptions = [
  { value:'PDF', text:'PDF' },
  { value:'Word', text:'Word Document' },
  { value:'Image', text:'Image' },
]
const tenderSecurityOptions = [
  { value:'Tender Security', text:'Tender Security' },
  { value:'Tender Securing Declaration', text:'Tender Securing Declaration' },
]
const currencyOptions = [
  { value:'TZS', text:'TZS' },
  { value:'USD', text:'USD' },
  { value:'EUR', text:'EUR' },
  { value:'GBP', text:'GBP' },
  { value:'JPY', text:'JPY' },
  { value:'CNY', text:'CNY' },
]

const documentNameOptions = [
  { value: 'power-of-attorney', text: 'Power of Attorney' },
  { value: 'annual-turn-over', text: 'Annual Turn Over' },
  { value: 'financial-statement', text: 'Financial Statement' },
  { value: 'source-of-funds', text: 'Source of Funds' },
  { value: 'litigation-history', text: 'Litigation History' },
  { value: 'office-location', text: 'Office Location' },
  { value: 'personnel-information', text: 'Personnel Information' },
  { value: 'work-experience', text: 'Work Experience' },
  { value: 'other', text: 'Other' },
]

// step1 validation errors
const errors = ref({})

function validateStep1() {
  errors.value = {}
  if (!store.tender.title) errors.value.title = true
  if (!store.tender.reference_number) errors.value.reference_number = true
  if (!store.tender.category_id) errors.value.category_id = true
  if (!store.tender.subcategory_id) errors.value.subcategory_id = true
  if (!store.tender.procurement_process_id) errors.value.procurement_process_id = true
  if (!store.tender.tender_fees) errors.value.tender_fees = true
  return Object.keys(errors.value).length === 0
}
function nextStep() {
  if (store.step === 1 && !validateStep1()) {
    toast.add({ severity:'error', summary:'Validation Error', detail:'Please fill all required fields.' })
    return
  }
  store.next()
}

// reset everything
function resetAll() {
  store.resetAll()
}

// navigate away
function goToList() {
  store.resetAll()
  router.push({ name: 'admin.tenders-management' })
}

// Category→Subcategory
function onCategoryChange() {
  store.tender.subcategory_id = null
}
watch(() => store.tender.category_id, id => {
  const cat = categoriesWithSubs.value.find(c => c.id === id)
  subcategories.value = cat
    ? cat.subcategories.map(sc => ({ value: sc.id, text: sc.name }))
    : []
  store.tender.subcategory_id = null
})

// fetch lookups
async function fetchCategoriesWithSubcategories() {
  try {
    const res = await api.get('tenders/categories-with-subcategories/')
    categoriesWithSubs.value = res.data
    categories.value = res.data.map(c => ({ value:c.id, text:c.name }))
  } catch {
    toast.add({ severity:'error', summary:'Error', detail:'Failed to load categories' })
  }
}
async function fetchProcurementProcesses() {
  try {
    const res = await api.get('tenders/procurement-processes/')
    const items = Array.isArray(res.data) ? res.data : (res.data.results||[])
    procurementProcesses.value = items.map(p => ({ value:p.id, text:p.name }))
  } catch(err) {
    console.error(err)
    toast.add({ severity:'error', summary:'Error', detail:'Failed to load processes' })
  }
}

// Agency autocomplete
async function searchAgency(event) {
  const q = event.query || store.selectedAgencyName
  try {
    const res = await api.get(`tenders/agencies/?search=${encodeURIComponent(q)}`)
    agencyResults.value = res.data.results||[]
  } catch {
    toast.add({ severity:'error', summary:'Error', detail:'Agency lookup failed' })
  }
}
function onAgencySelect(e) {
  store.tender.agency_id = e.value.id
}
watch(() => store.selectedAgencyName, val => {
  const m = agencyResults.value.find(a => a.name === val)
  store.tender.agency_id = m ? m.id : null
})

// Update tender + docs
async function updateTender() {
  try {
    // create agency if needed
    if (!store.tender.agency_id && newAgency.value.name) {
      const r = await api.post('tenders/agencies/', {
        name:newAgency.value.name,
        email:newAgency.value.email,
        phone_number:newAgency.value.phone_number,
        address:newAgency.value.address
      })
      if (newAgency.value.logoFile) {
        const fd = new FormData()
        fd.append('logo', newAgency.value.logoFile)
        await api.patch(`tenders/agencies/${r.data.id}/`, fd, {
          headers: { 'Content-Type': 'multipart/form-data' }
        })
      }
      store.tender.agency_id = r.data.id
    }

    // pull off file
    const tender_document = store.tender.tender_document
    const { tender_document: _, ...rest } = store.tender

    // build JSON payload with ISO dates
    const payload = {
      ...rest,
      submission_deadline: rest.submission_deadline ? new Date(rest.submission_deadline).toISOString() : null,
      clarification_deadline: rest.clarification_deadline ? new Date(rest.clarification_deadline).toISOString() : null,
      evaluation_start_date: rest.evaluation_start_date ? new Date(rest.evaluation_start_date).toISOString() : null,
      evaluation_end_date: rest.evaluation_end_date ? new Date(rest.evaluation_end_date).toISOString() : null,
      litigation_history_start: rest.litigation_history_start ? new Date(rest.litigation_history_start).toISOString().split('T')[0] : null,
      litigation_history_end: rest.litigation_history_end ? new Date(rest.litigation_history_end).toISOString().split('T')[0] : null
    }

    // update tender
    await api.patch(`tenders/tenders/${slug}/`, payload)

    // upload file if present and is File
    if (tender_document instanceof File) {
      const fd = new FormData()
      fd.append('tender_document', tender_document)
      await api.patch(`tenders/tenders/${slug}/`, fd, {
        headers:{ 'Content-Type':'multipart/form-data' }
      })
    }

    // required docs deletions
    for (const id of store.removedDocuments) {
      await api.delete(`tenders/tenders/${slug}/required-documents/${id}/`)
    }
    store.removedDocuments = []

    // required docs updates/creates
    for (const doc of store.requiredDocuments) {
      const postDoc = {
        name: doc.selectedName === 'other' ? doc.customName : doc.selectedName,
        description: doc.description,
        document_type: doc.document_type
      }
      if (doc.id) {
        await api.patch(`tenders/tenders/${slug}/required-documents/${doc.id}/`, postDoc)
      } else {
        await api.post(`tenders/tenders/${slug}/required-documents/`, postDoc)
      }
    }

    toast.add({ severity:'success', summary:'Done', detail:'Tender & docs updated' })
    store.next()
  } catch(err) {
    console.error('Validation errors:', err.response?.data)
    toast.add({ severity:'error', summary:'Error', detail:'Submission failed – check console' })
  }
}

onMounted(async () => {
  fetchCategoriesWithSubcategories()
  fetchProcurementProcesses()
  try {
    const resTender = await api.get(`tenders/tenders/${slug}/`)
    store.tender = { ...resTender.data }
    if (resTender.data.submission_deadline) store.tender.submission_deadline = new Date(resTender.data.submission_deadline)
    if (resTender.data.clarification_deadline) store.tender.clarification_deadline = new Date(resTender.data.clarification_deadline)
    if (resTender.data.evaluation_start_date) store.tender.evaluation_start_date = new Date(resTender.data.evaluation_start_date)
    if (resTender.data.evaluation_end_date) store.tender.evaluation_end_date = new Date(resTender.data.evaluation_end_date)
    if (resTender.data.litigation_history_start) store.tender.litigation_history_start = new Date(resTender.data.litigation_history_start)
    if (resTender.data.litigation_history_end) store.tender.litigation_history_end = new Date(resTender.data.litigation_history_end)
    store.tender.tender_document = null

    if (resTender.data.agency) {
      store.selectedAgencyName = resTender.data.agency.name
      agencyResults.value = [resTender.data.agency]
    }

    const resDocs = await api.get(`tenders/tenders/${slug}/required-documents/`)
    store.requiredDocuments = resDocs.data.map(doc => {
      const selectedName = documentNameOptions.find(o => o.value === doc.name)?.value || 'other'
      return {
        id: doc.id,
        selectedName,
        customName: selectedName === 'other' ? doc.name : '',
        description: doc.description || '',
        document_type: doc.document_type || ''
      }
    })
    store.removedDocuments = []
  } catch (err) {
    console.error(err)
    toast.add({ severity:'error', summary:'Error', detail:'Failed to load tender' })
  }
})
</script>

<style scoped>
.mb-3 {
  margin-bottom: 1rem !important;
}
</style>