<template>
  <VerticalLayout>
    <b-card>
      <!-- Progress bar -->
      <b-progress :value="progress" max="100" class="mb-3">
        <b-progress-bar
          :value="progress"
          :label="`Step ${Math.min(store.step, 11)}/11`"
        />
      </b-progress>

      <!-- Step 1: Basic Info -->
      <b-form v-if="store.step === 1" novalidate>
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

        <b-form-group class="mb-3" label="Currency" label-for="currency">
          <b-form-select
            id="currency"
            v-model="store.tender.currency"
            :options="currencyOptions"
            required
          />
        </b-form-group>

        <b-form-group class="mb-3" label="Description" label-for="description">
          <b-form-textarea
            id="description"
            v-model="store.tender.description"
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

        <b-form-group class="mb-3" label="Source of Funds" label-for="source_of_funds">
          <b-form-select
            id="source_of_funds"
            v-model="store.tender.source_of_funds"
            :options="sourceOfFundsOptions"
            required
          />
        </b-form-group>

        <b-form-group class="mb-3" label="Re-advertisement Count" label-for="re_advertisement_count">
          <b-form-input
            id="re_advertisement_count"
            type="number"
            v-model.number="store.tender.re_advertisement_count"
          />
        </b-form-group>
      </b-form>

      <!-- Step 2: Deadlines & Dates -->
      <b-form v-else-if="store.step === 2" novalidate>
        <b-form-group class="mb-3" label="Publication Date">
          <DatePicker
            v-model="store.tender.publication_date"
            showIcon showTime dateFormat="yy-mm-dd"
          />
        </b-form-group>

        <b-form-group class="mb-3" label="Submission Deadline">
          <DatePicker
            v-model="store.tender.submission_deadline"
            showIcon showTime dateFormat="yy-mm-dd"
          />
        </b-form-group>
      </b-form>

      <!-- Step 3: Agency Lookup / Create -->
      <b-form v-else-if="store.step === 3" novalidate>
        <b-form-group class="mb-3" label="Agency" label-for="agency">
          <AutoComplete
            id="agency"
            v-model="store.selectedAgencyName"
            :suggestions="agencyResults"
            @complete="searchAgency"
            @item-select="onAgencySelect"
            :dropdown="true"
            :forceSelection="true"
            placeholder="Type to search..."
          >
            <template #item="slotProps">
              <div>
                {{ slotProps.item.name }}
              </div>
            </template>
          </AutoComplete>
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
            <b-form-file :accept="'image/*'" v-model="newAgency.logoFile" />
          </b-form-group>
        </div>
      </b-form>

      <!-- Step 4: Additional Details -->
      <b-form v-else-if="store.step === 4" novalidate>
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
        <b-form-group class="mb-3" label="Allow Alternative Delivery">
          <b-form-checkbox v-model="store.tender.allow_alternative_delivery" />
        </b-form-group>
        <b-form-group class="mb-3" label="Litigation Start Date">
          <DatePicker
            v-model="store.tender.litigation_history_start"
            dateFormat="yy-mm-dd"
          />
        </b-form-group>
        <b-form-group class="mb-3" label="Litigation End Date">
          <DatePicker
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
        <template v-if="store.tender.tender_securing_type === 'Tender Security'">
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
      <b-form v-else-if="store.step === 5" novalidate>
        <div
          v-for="(doc, i) in requiredDocuments"
          :key="i"
          class="mb-3 border p-2 rounded"
        >
          <b-form-group class="mb-2" :label="`Document ${i+1} Name`">
            <b-form-select
              v-model="requiredDocuments[i].selectedName"
              :options="documentNameOptions"
            />
          </b-form-group>
          <b-form-group v-if="requiredDocuments[i].selectedName === 'other'" class="mb-2" label="Custom Name">
            <b-form-input
              v-model="requiredDocuments[i].customName"
            />
          </b-form-group>
          <b-form-group class="mb-2" :label="`Document ${i+1} Description`">
            <b-form-textarea
              v-model="requiredDocuments[i].description"
              rows="2"
            />
          </b-form-group>
          <b-form-group class="mb-2" :label="`Document ${i+1} Type`">
            <b-form-select
              v-model="requiredDocuments[i].document_type"
              :options="documentTypeOptions"
            />
          </b-form-group>
          <b-button
            size="sm"
            variant="danger"
            @click="removeDocument(i)"
          >
            Remove
          </b-button>
        </div>
        <b-button
          size="sm"
          variant="outline-primary"
          @click="addDocument"
        >
          + Add Document
        </b-button>
      </b-form>

      <!-- Step 6: Financial Requirements -->
      <b-form v-else-if="store.step === 6" novalidate>
        <div
          v-for="(req, i) in financialRequirements"
          :key="i"
          class="mb-3 border p-2 rounded"
        >
          <b-form-group class="mb-2" :label="`Financial Req ${i+1} Name`">
            <b-form-input
              v-model="financialRequirements[i].name"
            />
          </b-form-group>
          <b-form-group class="mb-2" :label="`Formula`">
            <b-form-input
              v-model="financialRequirements[i].formula"
            />
          </b-form-group>
          <b-form-group class="mb-2" :label="`Minimum`">
            <b-form-input
              type="number"
              step="0.01"
              v-model.number="financialRequirements[i].minimum"
            />
          </b-form-group>
          <b-form-group class="mb-2" :label="`Unit`">
            <b-form-input
              v-model="financialRequirements[i].unit"
            />
          </b-form-group>
          <b-form-group class="mb-2" :label="`Actual Value`">
            <b-form-input
              type="number"
              step="0.01"
              v-model.number="financialRequirements[i].actual_value"
            />
          </b-form-group>
          <b-form-group class="mb-2" :label="`Notes`">
            <b-form-textarea
              v-model="financialRequirements[i].notes"
              rows="2"
            />
          </b-form-group>
          <b-button
            size="sm"
            variant="danger"
            @click="removeFinancialRequirement(i)"
          >
            Remove
          </b-button>
        </div>
        <b-button
          size="sm"
          variant="outline-primary"
          @click="addFinancialRequirement"
        >
          + Add Financial Requirement
        </b-button>
      </b-form>

      <!-- Step 7: Turnover Requirements -->
      <b-form v-else-if="store.step === 7" novalidate>
        <div
          v-for="(req, i) in turnoverRequirements"
          :key="i"
          class="mb-3 border p-2 rounded"
        >
          <b-form-group class="mb-2" :label="`Turnover Req ${i+1} Label`">
            <b-form-input
              v-model="turnoverRequirements[i].label"
            />
          </b-form-group>
          <b-form-group class="mb-2" :label="`Amount`">
            <b-form-input
              type="number"
              step="0.01"
              v-model.number="turnoverRequirements[i].amount"
            />
          </b-form-group>
          <b-form-group class="mb-2" :label="`Currency`">
            <b-form-select
              v-model="turnoverRequirements[i].currency"
              :options="currencyOptions"
            />
          </b-form-group>
          <b-form-group class="mb-2" :label="`Start Date`">
            <DatePicker
              v-model="turnoverRequirements[i].start_date"
              dateFormat="yy-mm-dd"
            />
          </b-form-group>
          <b-form-group class="mb-2" :label="`End Date`">
            <DatePicker
              v-model="turnoverRequirements[i].end_date"
              dateFormat="yy-mm-dd"
            />
          </b-form-group>
          <b-form-group class="mb-2" :label="`JV Compliance`">
            <b-form-select
              v-model="turnoverRequirements[i].jv_compliance"
              :options="jvComplianceOptions"
            />
          </b-form-group>
          <b-form-group class="mb-2" :label="`JV Percentage`">
            <b-form-input
              type="number"
              step="0.01"
              v-model.number="turnoverRequirements[i].jv_percentage"
            />
          </b-form-group>
          <b-button
            size="sm"
            variant="danger"
            @click="removeTurnoverRequirement(i)"
          >
            Remove
          </b-button>
        </div>
        <b-button
          size="sm"
          variant="outline-primary"
          @click="addTurnoverRequirement"
        >
          + Add Turnover Requirement
        </b-button>
      </b-form>

      <!-- Step 8: Experience Requirements -->
      <b-form v-else-if="store.step === 8" novalidate>
        <div
          v-for="(req, i) in experienceRequirements"
          :key="i"
          class="mb-3 border p-2 rounded"
        >
          <b-form-group class="mb-2" :label="`Experience Req ${i+1} Type`">
            <b-form-select
              v-model="experienceRequirements[i].type"
              :options="experienceTypeOptions"
            />
          </b-form-group>
          <b-form-group class="mb-2" :label="`Description`">
            <b-form-textarea
              v-model="experienceRequirements[i].description"
              rows="2"
            />
          </b-form-group>
          <b-form-group class="mb-2" :label="`Contract Count`">
            <b-form-input
              type="number"
              v-model.number="experienceRequirements[i].contract_count"
            />
          </b-form-group>
          <b-form-group class="mb-2" :label="`Min Value`">
            <b-form-input
              type="number"
              step="0.01"
              v-model.number="experienceRequirements[i].min_value"
            />
          </b-form-group>
          <b-form-group class="mb-2" :label="`Currency`">
            <b-form-select
              v-model="experienceRequirements[i].currency"
              :options="currencyOptions"
            />
          </b-form-group>
          <b-form-group class="mb-2" :label="`Start Date`">
            <DatePicker
              v-model="experienceRequirements[i].start_date"
              dateFormat="yy-mm-dd"
            />
          </b-form-group>
          <b-form-group class="mb-2" :label="`End Date`">
            <DatePicker
              v-model="experienceRequirements[i].end_date"
              dateFormat="yy-mm-dd"
            />
          </b-form-group>
          <b-form-group class="mb-2" :label="`JV Compliance`">
            <b-form-select
              v-model="experienceRequirements[i].jv_compliance"
              :options="jvComplianceOptions"
            />
          </b-form-group>
          <b-form-group class="mb-2" :label="`JV Percentage`">
            <b-form-input
              type="number"
              step="0.01"
              v-model.number="experienceRequirements[i].jv_percentage"
            />
          </b-form-group>
          <b-form-group class="mb-2" :label="`JV Aggregation Note`">
            <b-form-textarea
              v-model="experienceRequirements[i].jv_aggregation_note"
              rows="2"
            />
          </b-form-group>
          <b-button
            size="sm"
            variant="danger"
            @click="removeExperienceRequirement(i)"
          >
            Remove
          </b-button>
        </div>
        <b-button
          size="sm"
          variant="outline-primary"
          @click="addExperienceRequirement"
        >
          + Add Experience Requirement
        </b-button>
      </b-form>

      <!-- Step 9: Personnel Requirements -->
      <b-form v-else-if="store.step === 9" novalidate>
        <div
          v-for="(req, i) in personnelRequirements"
          :key="i"
          class="mb-3 border p-2 rounded"
        >
          <b-form-group class="mb-2" :label="`Personnel Req ${i+1} Role`">
            <b-form-input
              v-model="personnelRequirements[i].role"
            />
          </b-form-group>
          <b-form-group class="mb-2" :label="`Min Education`">
            <b-form-input
              v-model="personnelRequirements[i].min_education"
            />
          </b-form-group>
          <b-form-group class="mb-2" :label="`Professional Registration`">
            <b-form-checkbox
              v-model="personnelRequirements[i].professional_registration"
            />
          </b-form-group>
          <b-form-group class="mb-2" :label="`Min Experience Years`">
            <b-form-input
              type="number"
              v-model.number="personnelRequirements[i].min_experience_yrs"
            />
          </b-form-group>
          <b-form-group class="mb-2" :label="`Appointment Duration Years`">
            <b-form-input
              type="number"
              v-model.number="personnelRequirements[i].appointment_duration_years"
            />
          </b-form-group>
          <b-form-group class="mb-2" :label="`Nationality Required`">
            <b-form-input
              v-model="personnelRequirements[i].nationality_required"
            />
          </b-form-group>
          <b-form-group class="mb-2" :label="`Language Required`">
            <b-form-input
              v-model="personnelRequirements[i].language_required"
            />
          </b-form-group>
          <b-form-group class="mb-2" :label="`JV Compliance`">
            <b-form-select
              v-model="personnelRequirements[i].jv_compliance"
              :options="jvComplianceOptions"
            />
          </b-form-group>
          <b-form-group class="mb-2" :label="`Notes`">
            <b-form-textarea
              v-model="personnelRequirements[i].notes"
              rows="2"
            />
          </b-form-group>
          <b-button
            size="sm"
            variant="danger"
            @click="removePersonnelRequirement(i)"
          >
            Remove
          </b-button>
        </div>
        <b-button
          size="sm"
          variant="outline-primary"
          @click="addPersonnelRequirement"
        >
          + Add Personnel Requirement
        </b-button>
      </b-form>

      <!-- Step 10: Schedule Items -->
      <b-form v-else-if="store.step === 10" novalidate>
        <div
          v-for="(item, i) in scheduleItems"
          :key="i"
          class="mb-3 border p-2 rounded"
        >
          <b-form-group class="mb-2" :label="`Schedule Item ${i+1} Commodity`">
            <b-form-input
              v-model="scheduleItems[i].commodity"
            />
          </b-form-group>
          <b-form-group class="mb-2" :label="`Code`">
            <b-form-input
              v-model="scheduleItems[i].code"
            />
          </b-form-group>
          <b-form-group class="mb-2" :label="`Unit`">
            <b-form-input
              v-model="scheduleItems[i].unit"
            />
          </b-form-group>
          <b-form-group class="mb-2" :label="`Quantity`">
            <b-form-input
              type="number"
              v-model.number="store.scheduleItems[i].quantity"
            />
          </b-form-group>
          <b-form-group class="mb-2" :label="`Specification`">
            <b-form-textarea
              v-model="scheduleItems[i].specification"
              rows="2"
            />
          </b-form-group>
          <b-button
            size="sm"
            variant="danger"
            @click="removeScheduleItem(i)"
          >
            Remove
          </b-button>
        </div>
        <b-button
          size="sm"
          variant="outline-primary"
          @click="addScheduleItem"
        >
          + Add Schedule Item
        </b-button>
      </b-form>

      <!-- Step 11: Technical Specifications -->
      <b-form v-else-if="store.step === 11" novalidate>
        <div
          v-for="(spec, i) in technicalSpecifications"
          :key="i"
          class="mb-3 border p-2 rounded"
        >
          <b-form-group class="mb-2" :label="`Technical Spec ${i+1} Category`">
            <b-form-select
              v-model="technicalSpecifications[i].category"
              :options="technicalCategoryOptions"
            />
          </b-form-group>
          <b-form-group class="mb-2" :label="`Description`">
            <b-form-textarea
              v-model="technicalSpecifications[i].description"
              rows="3"
            />
          </b-form-group>
          <b-button
            size="sm"
            variant="danger"
            @click="removeTechnicalSpecification(i)"
          >
            Remove
          </b-button>
        </div>
        <b-button
          size="sm"
          variant="outline-primary"
          @click="addTechnicalSpecification"
        >
          + Add Technical Specification
        </b-button>
      </b-form>

      <!-- Step 12: Success -->
      <div v-else class="text-center py-4">
        <h4 class="text-success mb-4">✅ Tender created!</h4>
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
            v-if="store.step > 1 && store.step < 12"
            variant="secondary"
            @click="store.back()"
          >
            Back
          </b-button>
          <b-button
            v-if="store.step >= 6 && store.step < 12"
            variant="outline-secondary"
            @click="skipSection"
          >
            Skip Section
          </b-button>
          <b-button
            v-if="store.step < 11"
            variant="primary"
            @click="nextStep"
          >
            Next
          </b-button>
          <b-button
            v-if="store.step === 11"
            variant="success"
            @click="submitTender"
          >
            Submit Tender
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
import DatePicker from 'primevue/datepicker'
import { useToast } from 'primevue/usetoast'

const toast = useToast()
const router = useRouter()
const route = useRoute()
const store = useTenderStore()

// Progress bar
const progress = computed(() => ((store.step - 1) / 11) * 100)

// local-only
const newAgency = ref({ name: '', email: '', phone_number: '', address: '', logoFile: null })
const agencyResults = ref([])

// lookups
const categoriesWithSubs = ref([])
const categories = ref([])
const subcategories = ref([])
const procurementProcesses = ref([])

// nested arrays
const requiredDocuments = ref([])
const financialRequirements = ref([])
const turnoverRequirements = ref([])
const experienceRequirements = ref([])
const personnelRequirements = ref([])
const scheduleItems = ref([])
const technicalSpecifications = ref([])

// dropdown options
const tenderTypeCountries = [
  { value: 'National', text: 'National Tendering' },
  { value: 'International', text: 'International Tendering' },
]
const tenderTypeSectors = [
  { value: 'Private Company', text: 'Private Company Tendering' },
  { value: 'Public Sector', text: 'Public Sector Tendering' },
  { value: 'Non-Governmental Organization', text: 'Non-Governmental Organization Tendering' },
  { value: 'Government Agency', text: 'Government Agency Tendering' },
]
const documentTypeOptions = [
  { value: 'PDF', text: 'PDF' },
  { value: 'Word', text: 'Word Document' },
  { value: 'Image', text: 'Image' },
]
const tenderSecurityOptions = [
  { value: 'Tender Security', text: 'Tender Security' },
  { value: 'Tender Securing Declaration', text: 'Tender Securing Declaration' },
]
const currencyOptions = [
  { value: 'TZS', text: 'Tanzanian Shilling' },
  { value: 'USD', text: 'US Dollar' },
  { value: 'EUR', text: 'Euro' },
  { value: 'GBP', text: 'British Pound' },
  { value: 'JPY', text: 'Japanese Yen' },
  { value: 'CNY', text: 'Chinese Yuan' },
]
const experienceTypeOptions = [
  { value: 'general', text: 'General Experience' },
  { value: 'specific', text: 'Specific/Similar Projects' },
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
const jvComplianceOptions = [
  { value: 'separate', text: 'Separate for Each Partner' },
  { value: 'combined', text: 'Combined for JV' },
]
const technicalCategoryOptions = [
  { value: 'service', text: 'Service Specifications' },
  { value: 'technology', text: 'Technology Specifications' },
  { value: 'security', text: 'Security Specifications' },
  { value: 'architecture', text: 'Technical Architecture' },
  { value: 'usability', text: 'Usability' },
  { value: 'testing', text: 'Testing and Quality Assurance' },
  { value: 'conformity', text: 'Conformity to Technical Requirements' },
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
    toast.add({ severity: 'error', summary: 'Validation Error', detail: 'Please fill all required fields.' })
    return
  }
  if (store.step === 3 && !store.tender.agency_id && !newAgency.value.name) {
    toast.add({ severity: 'error', summary: 'Validation Error', detail: 'Please select an agency or provide a new agency name.' })
    return
  }
  console.log('Moving to next step from:', store.step, 'to', store.step + 1);
  if (store.step < 12) {
    store.$patch({ step: store.step + 1 })
  }
  console.log('After advancing in nextStep, current step:', store.step);
}

function skipSection() {
  console.log('Skipping section at step:', store.step);
  if (store.step === 6) {
    financialRequirements.value = []
    console.log('Financial requirements cleared. Length now:', financialRequirements.value.length);
  } else if (store.step === 7) {
    turnoverRequirements.value = []
    console.log('Turnover requirements cleared. Length now:', turnoverRequirements.value.length);
  } else if (store.step === 8) {
    experienceRequirements.value = []
    console.log('Experience requirements cleared. Length now:', experienceRequirements.value.length);
  } else if (store.step === 9) {
    personnelRequirements.value = []
    console.log('Personnel requirements cleared. Length now:', personnelRequirements.value.length);
  } else if (store.step === 10) {
    scheduleItems.value = []
    console.log('Schedule items cleared. Length now:', scheduleItems.value.length);
  } else if (store.step === 11) {
    technicalSpecifications.value = []
    console.log('Technical specifications cleared. Length now:', technicalSpecifications.value.length);
  }
  console.log('Section skipped. Moving to step:', store.step + 1);
  if (store.step < 12) {
    store.$patch({ step: store.step + 1 })
  }
  console.log('After advancing in skipSection, current step:', store.step);
}

function resetAll() {
  store.resetAll()
  requiredDocuments.value = []
  financialRequirements.value = []
  turnoverRequirements.value = []
  experienceRequirements.value = []
  personnelRequirements.value = []
  scheduleItems.value = []
  technicalSpecifications.value = []
  newAgency.value = { name: '', email: '', phone_number: '', address: '', logoFile: null }
  agencyResults.value = []
}

function goToList() {
  resetAll()
  router.push({ name: 'admin.tenders-management' })
}

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

async function fetchCategoriesWithSubcategories() {
  try {
    const res = await api.get('tenders/categories-with-subcategories/')
    categoriesWithSubs.value = res.data
    categories.value = res.data.map(c => ({ value: c.id, text: c.name }))
  } catch {
    toast.add({ severity: 'error', summary: 'Error', detail: 'Failed to load categories' })
  }
}
async function fetchProcurementProcesses() {
  try {
    const res = await api.get('tenders/procurement-processes/')
    const items = Array.isArray(res.data) ? res.data : (res.data.results || [])
    procurementProcesses.value = items.map(p => ({ value: p.id, text: p.name }))
  } catch (err) {
    console.error(err)
    toast.add({ severity: 'error', summary: 'Error', detail: 'Failed to load processes' })
  }
}

async function searchAgency(event) {
  const query = event.query || store.selectedAgencyName || ''
  try {
    const res = await api.get(`tenders/agencies/?search=${encodeURIComponent(query)}`)
    agencyResults.value = Array.isArray(res.data) ? res.data : res.data.results || []
  } catch (err) {
    console.error('Agency search error:', err)
    toast.add({ severity: 'error', summary: 'Error', detail: 'Agency lookup failed' })
  }
}

function onAgencySelect(event) {
  const selected = event.value
  if (selected && typeof selected === 'object' && selected.id && selected.name) {
    store.tender.agency_id = selected.id
    store.selectedAgencyName = selected.name
  } else {
    store.tender.agency_id = null
    store.selectedAgencyName = ''
    toast.add({ severity: 'warn', summary: 'Warning', detail: 'Invalid agency selection' })
  }
}

watch(() => store.selectedAgencyName, val => {
  if (!val) {
    store.tender.agency_id = null
    return
  }
  const matchedAgency = agencyResults.value.find(a => a.name.toLowerCase() === val.toLowerCase())
  store.tender.agency_id = matchedAgency ? matchedAgency.id : null
})

async function fetchTenderData(slug) {
  try {
    const res = await api.get(`tenders/tenders/${slug}/`)
    const tender = res.data
    store.tender = {
      ...tender,
      submission_deadline: tender.submission_deadline ? new Date(tender.submission_deadline) : null,
      litigation_history_start: tender.litigation_history_start ? new Date(tender.litigation_history_start) : null,
      litigation_history_end: tender.litigation_history_end ? new Date(tender.litigation_history_end) : null,
    }
    store.selectedAgencyName = tender.agency ? tender.agency.name : ''
    agencyResults.value = tender.agency ? [tender.agency] : []
    requiredDocuments.value = tender.required_documents || []
    financialRequirements.value = tender.financial_requirements || []
    turnoverRequirements.value = tender.turnover_requirements || []
    experienceRequirements.value = tender.experience_requirements || []
    personnelRequirements.value = tender.personnel_requirements || []
    scheduleItems.value = tender.schedule_items || []
    technicalSpecifications.value = tender.technical_specifications || []
  } catch (err) {
    console.error('Failed to load tender:', err)
    toast.add({ severity: 'error', summary: 'Error', detail: 'Failed to load tender data' })
  }
}

function addDocument() {
  requiredDocuments.value.push({ selectedName: '', customName: '', description: '', document_type: '' })
}
function removeDocument(i) {
  requiredDocuments.value.splice(i, 1)
}
function addFinancialRequirement() {
  financialRequirements.value.push({ name: '', formula: '', minimum: null, unit: '', actual_value: null, notes: '', start_date: null, end_date: null, jv_compliance: 'combined', jv_percentage: null })
}
function removeFinancialRequirement(i) {
  financialRequirements.value.splice(i, 1)
}
function addTurnoverRequirement() {
  turnoverRequirements.value.push({ label: '', amount: null, currency: 'TZS', start_date: null, end_date: null, jv_compliance: 'combined', jv_percentage: null })
}
function removeTurnoverRequirement(i) {
  turnoverRequirements.value.splice(i, 1)
}
function addExperienceRequirement() {
  experienceRequirements.value.push({ type: 'specific', description: '', contract_count: null, min_value: null, currency: 'TZS', start_date: null, end_date: null, jv_compliance: 'combined', jv_percentage: null, jv_aggregation_note: '' })
}
function removeExperienceRequirement(i) {
  experienceRequirements.value.splice(i, 1)
}
function addPersonnelRequirement() {
  personnelRequirements.value.push({ role: '', min_education: '', professional_registration: false, min_experience_yrs: null, appointment_duration_years: null, nationality_required: '', language_required: '', notes: '', jv_compliance: 'combined' })
}
function removePersonnelRequirement(i) {
  personnelRequirements.value.splice(i, 1)
}
function addScheduleItem() {
  scheduleItems.value.push({ commodity: '', code: '', unit: '', quantity: null, specification: '' })
}
function removeScheduleItem(i) {
  scheduleItems.value.splice(i, 1)
}
function addTechnicalSpecification() {
  technicalSpecifications.value.push({ category: 'service', description: '' })
}
function removeTechnicalSpecification(i) {
  technicalSpecifications.value.splice(i, 1)
}

async function submitTender() {
  try {
    if (!store.tender.agency_id && !newAgency.value.name) {
      toast.add({ severity: 'error', summary: 'Error', detail: 'Please select an agency or provide a new agency name.' })
      return
    }

    // create agency if needed
    if (!store.tender.agency_id && newAgency.value.name) {
      const agencyData = new FormData()
      agencyData.append('name', newAgency.value.name)
      if (newAgency.value.email) agencyData.append('email', newAgency.value.email)
      if (newAgency.value.phone_number) agencyData.append('phone_number', newAgency.value.phone_number)
      if (newAgency.value.address) agencyData.append('address', newAgency.value.address)
      if (newAgency.value.logoFile) agencyData.append('logo', newAgency.value.logoFile)
      const r = await api.post('tenders/agencies/', agencyData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      })
      store.tender.agency_id = r.data.id
      store.selectedAgencyName = r.data.name
    }

    // build nested data
    const required_documents = requiredDocuments.value.map(doc => ({
      name: doc.selectedName === 'other' ? doc.customName : doc.selectedName,
      description: doc.description,
      document_type: doc.document_type
    }))
    const financial_requirements = financialRequirements.value.map(req => ({
      name: req.name,
      formula: req.formula,
      minimum: req.minimum,
      unit: req.unit,
      actual_value: req.actual_value,
      notes: req.notes,
      start_date: req.start_date ? new Date(req.start_date).toISOString().split('T')[0] : null,
      end_date: req.end_date ? new Date(req.end_date).toISOString().split('T')[0] : null,
      jv_compliance: req.jv_compliance,
      jv_percentage: req.jv_percentage
    }))
    console.log('Submitting financial_requirements. Length:', financial_requirements.length);
    const turnover_requirements = turnoverRequirements.value.map(req => ({
      label: req.label,
      amount: req.amount,
      currency: req.currency,
      start_date: req.start_date ? new Date(req.start_date).toISOString().split('T')[0] : null,
      end_date: req.end_date ? new Date(req.end_date).toISOString().split('T')[0] : null,
      jv_compliance: req.jv_compliance,
      jv_percentage: req.jv_percentage
    }))
    console.log('Submitting turnover_requirements. Length:', turnover_requirements.length);
    const experience_requirements = experienceRequirements.value.map(req => ({
      type: req.type,
      description: req.description,
      contract_count: req.contract_count,
      min_value: req.min_value,
      currency: req.currency,
      start_date: req.start_date ? new Date(req.start_date).toISOString().split('T')[0] : null,
      end_date: req.end_date ? new Date(req.end_date).toISOString().split('T')[0] : null,
      jv_compliance: req.jv_compliance,
      jv_percentage: req.jv_percentage,
      jv_aggregation_note: req.jv_aggregation_note
    }))
    console.log('Submitting experience_requirements. Length:', experience_requirements.length);
    const personnel_requirements = personnelRequirements.value.map(req => ({
      role: req.role,
      min_education: req.min_education,
      professional_registration: req.professional_registration,
      min_experience_yrs: req.min_experience_yrs,
      appointment_duration_years: req.appointment_duration_years,
      nationality_required: req.nationality_required,
      language_required: req.language_required,
      notes: req.notes,
      jv_compliance: req.jv_compliance
    }))
    console.log('Submitting personnel_requirements. Length:', personnel_requirements.length);
    const schedule_items = scheduleItems.value.map(item => ({
      commodity: item.commodity,
      code: item.code,
      unit: item.unit,
      quantity: item.quantity,
      specification: item.specification
    }))
    console.log('Submitting schedule_items. Length:', schedule_items.length);
    const technical_specifications = technicalSpecifications.value.map(spec => ({
      category: spec.category,
      description: spec.description
    }))
    console.log('Submitting technical_specifications. Length:', technical_specifications.length);

    // pull off file
    const { tender_document, ...rest } = store.tender

    // build JSON payload with ISO dates and nested
    const payload = {
      ...rest,
      submission_deadline: rest.submission_deadline ? new Date(rest.submission_deadline).toISOString() : null,
      litigation_history_start: rest.litigation_history_start ? new Date(rest.litigation_history_start).toISOString().split('T')[0] : null,
      litigation_history_end: rest.litigation_history_end ? new Date(rest.litigation_history_end).toISOString().split('T')[0] : null,
      required_documents,
      financial_requirements,
      turnover_requirements,
      experience_requirements,
      personnel_requirements,
      schedule_items,
      technical_specifications
    }

    // create or update tender
    const isEditMode = !!route.params.slug
    const resTender = isEditMode
      ? await api.patch(`tenders/tenders/${route.params.slug}/`, payload)
      : await api.post('tenders/tenders/', payload)
    const tenderSlug = resTender.data.slug

    // upload file if present
    if (tender_document) {
      const fd = new FormData()
      fd.append('tender_document', tender_document)
      await api.patch(`tenders/tenders/${tenderSlug}/`, fd, {
        headers: { 'Content-Type': 'multipart/form-data' }
      })
    }

    toast.add({ severity: 'success', summary: 'Done', detail: isEditMode ? 'Tender updated successfully' : 'Tender & all requirements created' })
    if (store.step < 12) {
      store.$patch({ step: store.step + 1 })
    }
  } catch (err) {
    console.error('Validation errors:', err.response?.data)
    let errorMessage = 'Submission failed – check console'
    if (err.response?.data) {
      errorMessage = Object.entries(err.response.data)
        .map(([key, value]) => `${key}: ${Array.isArray(value) ? value.join(', ') : value}`)
        .join('\n')
    }
    toast.add({ severity: 'error', summary: 'Error', detail: errorMessage })
  }
}

onMounted(async () => {
  await fetchCategoriesWithSubcategories()
  await fetchProcurementProcesses()
  if (route.params.slug) {
    await fetchTenderData(route.params.slug)
  }
})
</script>

<style scoped>
.mb-3 {
  margin-bottom: 1rem !important;
}
</style>