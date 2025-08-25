<template>
  <VerticalLayout>
    <b-card>
      <h1 class="mb-4">{{ isEditMode ? 'Edit Tender' : 'Create Tender' }}</h1>
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
            :state="!errors.tender_type_country"
            required
          />
        </b-form-group>

        <b-form-group class="mb-3" label="Sector Type" label-for="tender_type_sector">
          <b-form-select
            id="tender_type_sector"
            v-model="store.tender.tender_type_sector"
            :options="tenderTypeSectors"
            :state="!errors.tender_type_sector"
            required
          />
        </b-form-group>

        <b-form-group class="mb-3" label="Currency" label-for="currency">
          <b-form-select
            id="currency"
            v-model="store.tender.currency"
            :options="currencyOptions"
            :state="!errors.currency"
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
          />
        </b-form-group>

        <b-form-group class="mb-3" label="Subcategory" label-for="subcategory">
          <b-form-select
            id="subcategory"
            v-model="store.tender.subcategory_id"
            :options="subcategories"
            :state="!errors.subcategory_id"
          />
        </b-form-group>

        <b-form-group class="mb-3" label="Procurement Process" label-for="procurement_process_id">
          <b-form-select
            id="procurement_process_id"
            v-model="store.tender.procurement_process_id"
            :options="procurementProcesses"
            :state="!errors.procurement_process_id"
          />
        </b-form-group>

        <b-form-group class="mb-3" label="Tender Fees" label-for="tender_fees">
          <b-form-input
            id="tender_fees"
            type="number"
            step="0.01"
            v-model.number="store.tender.tender_fees"
            :state="!errors.tender_fees"
          />
        </b-form-group>

        <b-form-group class="mb-3" label="Source of Funds" label-for="source_of_funds">
          <b-form-select
            id="source_of_funds"
            v-model="store.tender.source_of_funds"
            :options="sourceOfFundsOptions"
            :state="!errors.source_of_funds"
            required
          />
        </b-form-group>
      </b-form>

      <!-- Step 2: Deadlines & Dates -->
      <b-form v-else-if="store.step === 2" novalidate>
        <b-form-group class="mb-3" label="Publication Date">
          <DatePicker
            v-model="store.tender.publication_date"
            showIcon
            showTime
            dateFormat="yy-mm-dd"
          />
        </b-form-group>

        <b-form-group class="mb-3" label="Submission Deadline">
          <DatePicker
            v-model="store.tender.submission_deadline"
            showIcon
            showTime
            dateFormat="yy-mm-dd"
            :state="!errors.submission_deadline"
            required
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
        <b-form-group class="mb-3" label="Tender Document" label-for="tender_document">
          <div v-if="store.tender.tender_document && typeof store.tender.tender_document === 'string'">
            Current Document: <a :href="store.tender.tender_document" target="_blank">View</a>
            <b-button variant="link" @click="store.tender.tender_document = null">Replace</b-button>
          </div>
          <b-form-file
            v-else
            accept=".pdf,.doc,.docx"
            v-model="tenderDocumentFile"
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
              :state="!errors.tender_security_percentage"
            />
          </b-form-group>
          <b-form-group class="mb-3" label="Security Amount">
            <b-form-input
              type="number"
              step="0.01"
              v-model.number="store.tender.tender_security_amount"
              :state="!errors.tender_security_amount"
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
          <b-form-group class="mb-2" :label="`Document ${i+1} Required`">
            <b-form-select
              v-model="requiredDocuments[i].is_required"
              :options="isRequiredOptions"
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
          <b-form-group class="mb-2" :label="`Financial Sources`">
            <b-form-textarea
              v-model="financialRequirements[i].financial_sources"
              rows="2"
            />
          </b-form-group>
          <b-form-group class="mb-2" :label="`JV Compliance`">
            <b-form-select
              v-model="financialRequirements[i].jv_compliance"
              :options="jvComplianceOptions"
            />
          </b-form-group>
          <b-button
            size="sm"
            variant="danger"
            @click="store.removeFinancialRequirement(i)"
          >
            Remove
          </b-button>
        </div>
        <b-button
          size="sm"
          variant="outline-primary"
          @click="store.addFinancialRequirement"
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
            @click="store.removeTurnoverRequirement(i)"
          >
            Remove
          </b-button>
        </div>
        <b-button
          size="sm"
          variant="outline-primary"
          @click="store.addTurnoverRequirement"
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
          <b-form-group class="mb-2" :label="`Reputation Notes`">
            <b-form-textarea
              v-model="experienceRequirements[i].reputation_notes"
              rows="2"
            />
          </b-form-group>
          <b-button
            size="sm"
            variant="danger"
            @click="store.removeExperienceRequirement(i)"
          >
            Remove
          </b-button>
        </div>
        <b-button
          size="sm"
          variant="outline-primary"
          @click="store.addExperienceRequirement"
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
            <b-form-select
              v-model="personnelRequirements[i].min_education"
              :options="educationLevelOptions"
            />
          </b-form-group>
          <b-form-group class="mb-2" :label="`Professional Registration`">
            <b-form-input
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
          <b-form-group class="mb-2" :label="`Age Minimum`">
            <b-form-input
              type="number"
              v-model.number="personnelRequirements[i].age_min"
            />
          </b-form-group>
          <b-form-group class="mb-2" :label="`Age Maximum`">
            <b-form-input
              type="number"
              v-model.number="personnelRequirements[i].age_max"
            />
          </b-form-group>
          <b-form-group class="mb-2" :label="`Specialized Education`">
            <b-form-textarea
              v-model="personnelRequirements[i].specialized_education"
              rows="2"
            />
          </b-form-group>
          <b-form-group class="mb-2" :label="`Professional Certifications`">
            <b-form-textarea
              v-model="personnelRequirements[i].professional_certifications"
              rows="2"
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
            @click="store.removePersonnelRequirement(i)"
          >
            Remove
          </b-button>
        </div>
        <b-button
          size="sm"
          variant="outline-primary"
          @click="store.addPersonnelRequirement"
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
              v-model.number="scheduleItems[i].quantity"
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
            @click="store.removeScheduleItem(i)"
          >
            Remove
          </b-button>
        </div>
        <b-button
          size="sm"
          variant="outline-primary"
          @click="store.addScheduleItem"
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
            @click="store.removeTechnicalSpecification(i)"
          >
            Remove
          </b-button>
        </div>
        <b-button
          size="sm"
          variant="outline-primary"
          @click="store.addTechnicalSpecification"
        >
          + Add Technical Specification
        </b-button>
      </b-form>

      <!-- Step 12: Success -->
      <div v-else class="text-center py-4">
        <h4 class="text-success mb-4">✅ Tender {{ isEditMode ? 'updated' : 'created' }}!</h4>
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
            v-if="store.step < 12"
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
import { ref, computed, watch, onMounted } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import AutoComplete from 'primevue/autocomplete';
import { useTenderStore } from '@/stores/tenderStore';
import { api } from '@/services/authService';
import VerticalLayout from '@/layouts/VerticalLayout.vue';
import DatePicker from 'primevue/datepicker';
import { useToast } from 'primevue/usetoast';

const toast = useToast();
const router = useRouter();
const route = useRoute();
const store = useTenderStore();

// Progress bar
const progress = computed(() => ((store.step - 1) / 11) * 100);

// local-only
const newAgency = ref({ name: '', email: '', phone_number: '', address: '', logoFile: null });
const agencyResults = ref([]);
const tenderDocumentFile = ref(null);

// lookups
const categoriesWithSubs = ref([]);
const categories = ref([]);
const subcategories = ref([]);
const procurementProcesses = ref([]);

// nested arrays (bound to store)
const requiredDocuments = computed(() => store.requiredDocuments);
const financialRequirements = computed(() => store.financialRequirements);
const turnoverRequirements = computed(() => store.turnoverRequirements);
const experienceRequirements = computed(() => store.experienceRequirements);
const personnelRequirements = computed(() => store.personnelRequirements);
const scheduleItems = computed(() => store.scheduleItems);
const technicalSpecifications = computed(() => store.technicalSpecifications);

// dropdown options
const tenderTypeCountries = [
  { value: 'National', text: 'National Tendering' },
  { value: 'International', text: 'International Tendering' },
];
const tenderTypeSectors = [
  { value: 'Private Company', text: 'Private Company Tendering' },
  { value: 'Public Sector', text: 'Public Sector Tendering' },
  { value: 'Non-Governmental Organization', text: 'Non-Governmental Organization Tendering' },
  { value: 'Government Agency', text: 'Government Agency Tendering' },
];
const documentTypeOptions = [
  { value: 'other', text: 'Other' },
  { value: 'PDF', text: 'PDF' },
  { value: 'Word', text: 'Word Document' },
  { value: 'Image', text: 'Image' },
];
const tenderSecurityOptions = [
  { value: 'Tender Security', text: 'Tender Security' },
  { value: 'Tender Securing Declaration', text: 'Tender Securing Declaration' },
];
const currencyOptions = [
  { value: 'TZS', text: 'Tanzanian Shilling' },
  { value: 'USD', text: 'US Dollar' },
  { value: 'EUR', text: 'Euro' },
  { value: 'GBP', text: 'British Pound' },
  { value: 'JPY', text: 'Japanese Yen' },
  { value: 'CNY', text: 'Chinese Yuan' },
];
const experienceTypeOptions = [
  { value: 'general', text: 'General Experience' },
  { value: 'specific', text: 'Specific/Similar Projects' },
];
const documentNameOptions = [
  { value: 'power-of-attorney', text: 'Power of Attorney' },
  { value: 'annual-turn-over', text: 'Annual Turn Over' },
  { value: 'financial-statement', text: 'Financial Statement' },
  { value: 'source-of-funds', text: 'Source of Funds' },
  { value: 'litigation-history', text: 'Litigation History' },
  { value: 'office-location', text: 'Office Location' },
  { value: 'personnel-information', text: 'Personnel Information' },
  { value: 'work-experience', text: 'Work Experience' },
  { value: 'tender-securing-declaration', text: 'Tender Securing Declaration' },
  { value: 'other', text: 'Other' },
];
const jvComplianceOptions = [
  { value: 'separate', text: 'Separate for Each Partner' },
  { value: 'combined', text: 'Combined for JV' },
];
const technicalCategoryOptions = [
  { value: 'service', text: 'Service Specifications' },
  { value: 'technology', text: 'Technology Specifications' },
  { value: 'security', text: 'Security Specifications' },
  { value: 'architecture', text: 'Technical Architecture' },
  { value: 'usability', text: 'Usability' },
  { value: 'testing', text: 'Testing and Quality Assurance' },
  { value: 'conformity', text: 'Conformity to Technical Requirements' },
];
const sourceOfFundsOptions = [
  { value: 'government', text: 'Government Funds' },
  { value: 'loan', text: 'Loan' },
  { value: 'credit', text: 'Credit' },
  { value: 'grant', text: 'Grant' },
  { value: 'other', text: 'Other' },
];
const isRequiredOptions = [
  { value: 'required', text: 'Required' },
  { value: 'optional', text: 'Optional' },
];
const educationLevelOptions = [
  { value: 'certificate', text: 'Certificate' },
  { value: 'diploma', text: 'Diploma' },
  { value: 'bachelor', text: "Bachelor's Degree" },
  { value: 'master', text: "Master's Degree" },
  { value: 'phd', text: 'PhD' },
];

// step validation errors
const errors = ref({});

const isEditMode = computed(() => !!route.params.slug);

function validateStep1() {
  errors.value = {};
  if (!store.tender.title) errors.value.title = true;
  if (!store.tender.reference_number) errors.value.reference_number = true;
  if (!store.tender.tender_type_country) errors.value.tender_type_country = true;
  if (!store.tender.tender_type_sector) errors.value.tender_type_sector = true;
  if (!store.tender.currency) errors.value.currency = true;
  if (!store.tender.source_of_funds) errors.value.source_of_funds = true;
  return Object.keys(errors.value).length === 0;
}

function validateStep2() {
  errors.value = {};
  if (!store.tender.submission_deadline) errors.value.submission_deadline = true;
  return Object.keys(errors.value).length === 0;
}

function validateStep4() {
  errors.value = {};
  if (store.tender.tender_securing_type === 'Tender Security') {
    if (!store.tender.tender_security_percentage && !store.tender.tender_security_amount) {
      errors.value.tender_security_percentage = true;
      errors.value.tender_security_amount = true;
      toast.add({ severity: 'error', summary: 'Validation Error', detail: 'Either Security Percentage or Security Amount is required for Tender Security.' });
    }
  }
  return Object.keys(errors.value).length === 0;
}

function nextStep() {
  if (store.step === 1 && !validateStep1()) {
    toast.add({ severity: 'error', summary: 'Validation Error', detail: 'Please fill all required fields.' });
    return;
  }
  if (store.step === 2 && !validateStep2()) {
    toast.add({ severity: 'error', summary: 'Validation Error', detail: 'Please fill all required fields.' });
    return;
  }
  if (store.step === 3 && !store.tender.agency_id && !newAgency.value.name) {
    toast.add({ severity: 'error', summary: 'Validation Error', detail: 'Please select an agency or provide a new agency name.' });
    return;
  }
  if (store.step === 4 && !validateStep4()) {
    return;
  }
  console.log('Moving to next step from:', store.step, 'to', store.step + 1);
  if (store.step < 12) {
    store.$patch({ step: store.step + 1 });
  }
  console.log('After advancing in nextStep, current step:', store.step);
}

function skipSection() {
  console.log('Skipping section at step:', store.step);
  if (store.step === 6) {
    store.financialRequirements = [];
    console.log('Financial requirements cleared. Length now:', store.financialRequirements.length);
  } else if (store.step === 7) {
    store.turnoverRequirements = [];
    console.log('Turnover requirements cleared. Length now:', store.turnoverRequirements.length);
  } else if (store.step === 8) {
    store.experienceRequirements = [];
    console.log('Experience requirements cleared. Length now:', store.experienceRequirements.length);
  } else if (store.step === 9) {
    store.personnelRequirements = [];
    console.log('Personnel requirements cleared. Length now:', store.personnelRequirements.length);
  } else if (store.step === 10) {
    store.scheduleItems = [];
    console.log('Schedule items cleared. Length now:', store.scheduleItems.length);
  } else if (store.step === 11) {
    store.technicalSpecifications = [];
    console.log('Technical specifications cleared. Length now:', store.technicalSpecifications.length);
  }
  console.log('Section skipped. Moving to step:', store.step + 1);
  if (store.step < 12) {
    store.$patch({ step: store.step + 1 });
  }
  console.log('After advancing in skipSection, current step:', store.step);
}

function resetAll() {
  store.resetAll();
  newAgency.value = { name: '', email: '', phone_number: '', address: '', logoFile: null };
  agencyResults.value = [];
  tenderDocumentFile.value = null;
}

function goToList() {
  resetAll();
  router.push({ name: 'admin.tenders-management' });
}

function onCategoryChange() {
  store.tender.subcategory_id = null;
}

watch(() => store.tender.category_id, id => {
  const cat = categoriesWithSubs.value.find(c => c.id === id);
  subcategories.value = cat
    ? cat.subcategories.map(sc => ({ value: sc.id, text: sc.name }))
    : [];
  store.tender.subcategory_id = null;
});

watch(() => store.tender.tender_securing_type, (newVal) => {
  if (newVal === 'Tender Securing Declaration') {
    const hasDecl = store.requiredDocuments.some(doc => doc.selectedName === 'tender-securing-declaration');
    if (!hasDecl) {
      store.addDocument();
      const lastIndex = store.requiredDocuments.length - 1;
      store.requiredDocuments[lastIndex].selectedName = 'tender-securing-declaration';
      store.requiredDocuments[lastIndex].description = 'Signed Tender Securing Declaration Form';
      store.requiredDocuments[lastIndex].document_type = 'other';
      store.requiredDocuments[lastIndex].is_required = 'required';
    }
  }
});

async function fetchCategoriesWithSubcategories() {
  try {
    const res = await api.get('tenders/categories-with-subcategories/');
    categoriesWithSubs.value = res.data;
    categories.value = res.data.map(c => ({ value: c.id, text: c.name }));
  } catch {
    toast.add({ severity: 'error', summary: 'Error', detail: 'Failed to load categories' });
  }
}

async function fetchProcurementProcesses() {
  try {
    const res = await api.get('tenders/procurement-processes/');
    const items = Array.isArray(res.data) ? res.data : (res.data.results || []);
    procurementProcesses.value = items.map(p => ({ value: p.id, text: p.name }));
  } catch (err) {
    console.error(err);
    toast.add({ severity: 'error', summary: 'Error', detail: 'Failed to load processes' });
  }
}

async function searchAgency(event) {
  const query = event.query || store.selectedAgencyName || '';
  try {
    const res = await api.get(`tenders/agencies/?search=${encodeURIComponent(query)}`);
    agencyResults.value = Array.isArray(res.data) ? res.data : (res.data.results || []);
  } catch (err) {
    console.error('Agency search error:', err);
    toast.add({ severity: 'error', summary: 'Error', detail: 'Agency lookup failed' });
  }
}

function onAgencySelect(event) {
  const selected = event.value;
  if (selected && typeof selected === 'object' && selected.id && selected.name) {
    store.tender.agency_id = selected.id;
    store.selectedAgencyName = selected.name;
  } else {
    store.tender.agency_id = null;
    store.selectedAgencyName = '';
    toast.add({ severity: 'warn', summary: 'Warning', detail: 'Invalid agency selection' });
  }
}

watch(() => store.selectedAgencyName, val => {
  if (!val) {
    store.tender.agency_id = null;
    return;
  }
  const matchedAgency = agencyResults.value.find(a => a.name.toLowerCase() === val.toLowerCase());
  store.tender.agency_id = matchedAgency ? matchedAgency.id : null;
});

async function fetchTenderData(slug) {
  try {
    const res = await api.get(`tenders/tenders/${slug}/`);
    const tender = res.data;
    store.tender = {
      ...tender,
      category_id: tender.category ? tender.category.id : null,
      subcategory_id: tender.subcategory ? tender.subcategory.id : null,
      procurement_process_id: tender.procurement_process ? tender.procurement_process.id : null,
      agency_id: tender.agency ? tender.agency.id : null,
      submission_deadline: tender.submission_deadline ? new Date(tender.submission_deadline) : null,
      publication_date: tender.publication_date ? new Date(tender.publication_date) : null,
      litigation_history_start: tender.litigation_history_start ? new Date(tender.litigation_history_start) : null,
      litigation_history_end: tender.litigation_history_end ? new Date(tender.litigation_history_end) : null,
      tender_document: tender.tender_document, // Keep as URL string for edit
    };
    store.selectedAgencyName = tender.agency ? tender.agency.name : '';
    agencyResults.value = tender.agency ? [tender.agency] : [];
    store.requiredDocuments = tender.required_documents.map(doc => ({
      selectedName: documentNameOptions.some(opt => opt.value === doc.name) ? doc.name : 'other',
      customName: documentNameOptions.some(opt => opt.value === doc.name) ? '' : doc.name,
      description: doc.description,
      document_type: doc.document_type,
      is_required: doc.is_required
    })) || [];
    store.financialRequirements = tender.financial_requirements || [];
    store.turnoverRequirements = tender.turnover_requirements || [];
    store.experienceRequirements = tender.experience_requirements || [];
    store.personnelRequirements = tender.personnel_requirements || [];
    store.scheduleItems = tender.schedule_items || [];
    store.technicalSpecifications = tender.technical_specifications || [];
  } catch (err) {
    console.error('Failed to load tender:', err);
    toast.add({ severity: 'error', summary: 'Error', detail: 'Failed to load tender data' });
  }
}

async function submitTender() {
  try {
    if (!store.tender.agency_id && !newAgency.value.name) {
      toast.add({ severity: 'error', summary: 'Error', detail: 'Please select an agency or provide a new agency name.' });
      return;
    }

    // Create agency if needed
    if (!store.tender.agency_id && newAgency.value.name) {
      const agencyData = new FormData();
      agencyData.append('name', newAgency.value.name);
      if (newAgency.value.email) agencyData.append('email', newAgency.value.email);
      if (newAgency.value.phone_number) agencyData.append('phone_number', newAgency.value.phone_number);
      if (newAgency.value.address) agencyData.append('address', newAgency.value.address);
      if (newAgency.value.logoFile) agencyData.append('logo', newAgency.value.logoFile);
      const r = await api.post('tenders/agencies/', agencyData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      store.tender.agency_id = r.data.id;
      store.selectedAgencyName = r.data.name;
    }

    // Build nested data
    const required_documents = store.requiredDocuments.map(doc => ({
      name: doc.selectedName === 'other' ? doc.customName : doc.selectedName,
      description: doc.description,
      document_type: doc.document_type,
      is_required: doc.is_required
    }));
    const financial_requirements = store.financialRequirements.map(req => ({
      name: req.name,
      formula: req.formula,
      minimum: req.minimum,
      unit: req.unit,
      actual_value: req.actual_value,
      notes: req.notes,
      financial_sources: req.financial_sources,
      jv_compliance: req.jv_compliance
    }));
    console.log('Submitting financial_requirements. Length:', financial_requirements.length);
    const turnover_requirements = store.turnoverRequirements.map(req => ({
      label: req.label,
      amount: req.amount,
      currency: req.currency,
      start_date: req.start_date ? new Date(req.start_date).toISOString().split('T')[0] : null,
      end_date: req.end_date ? new Date(req.end_date).toISOString().split('T')[0] : null,
      jv_compliance: req.jv_compliance,
      jv_percentage: req.jv_percentage
    }));
    console.log('Submitting turnover_requirements. Length:', turnover_requirements.length);
    const experience_requirements = store.experienceRequirements.map(req => ({
      type: req.type,
      description: req.description,
      contract_count: req.contract_count,
      min_value: req.min_value,
      currency: req.currency,
      start_date: req.start_date ? new Date(req.start_date).toISOString().split('T')[0] : null,
      end_date: req.end_date ? new Date(req.end_date).toISOString().split('T')[0] : null,
      jv_compliance: req.jv_compliance,
      jv_percentage: req.jv_percentage,
      jv_aggregation_note: req.jv_aggregation_note,
      reputation_notes: req.reputation_notes
    }));
    console.log('Submitting experience_requirements. Length:', experience_requirements.length);
    const personnel_requirements = store.personnelRequirements.map(req => ({
      role: req.role,
      min_education: req.min_education,
      professional_registration: req.professional_registration,
      min_experience_yrs: req.min_experience_yrs,
      appointment_duration_years: req.appointment_duration_years,
      nationality_required: req.nationality_required,
      language_required: req.language_required,
      age_min: req.age_min,
      age_max: req.age_max,
      specialized_education: req.specialized_education,
      professional_certifications: req.professional_certifications,
      jv_compliance: req.jv_compliance,
      notes: req.notes
    }));
    console.log('Submitting personnel_requirements. Length:', personnel_requirements.length);
    const schedule_items = store.scheduleItems.map(item => ({
      commodity: item.commodity,
      code: item.code,
      unit: item.unit,
      quantity: item.quantity,
      specification: item.specification
    }));
    console.log('Submitting schedule_items. Length:', schedule_items.length);
    const technical_specifications = store.technicalSpecifications.map(spec => ({
      category: spec.category,
      description: spec.description
    }));
    console.log('Submitting technical_specifications. Length:', technical_specifications.length);

    // Pull off file
    const { tender_document, ...rest } = store.tender;

    // Build JSON payload with ISO dates and nested
    const payload = {
      ...rest,
      submission_deadline: rest.submission_deadline ? new Date(rest.submission_deadline).toISOString() : null,
      publication_date: rest.publication_date ? new Date(rest.publication_date).toISOString() : null,
      litigation_history_start: rest.litigation_history_start ? new Date(rest.litigation_history_start).toISOString().split('T')[0] : null,
      litigation_history_end: rest.litigation_history_end ? new Date(rest.litigation_history_end).toISOString().split('T')[0] : null,
      required_documents,
      financial_requirements,
      turnover_requirements,
      experience_requirements,
      personnel_requirements,
      schedule_items,
      technical_specifications
    };

    // Create or update tender
    const isEditMode = !!route.params.slug;
    const resTender = isEditMode
      ? await api.patch(`tenders/tenders/${route.params.slug}/`, payload)
      : await api.post('tenders/tenders/', payload);
    const tenderSlug = resTender.data.slug;

    // Upload file if present
    if (tenderDocumentFile.value) {
      const fd = new FormData();
      fd.append('tender_document', tenderDocumentFile.value);
      await api.patch(`tenders/tenders/${tenderSlug}/`, fd, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
    }

    toast.add({ severity: 'success', summary: 'Done', detail: isEditMode ? 'Tender updated successfully' : 'Tender & all requirements created' });
    if (store.step < 12) {
      store.$patch({ step: store.step + 1 });
    }
    resetAll();
  } catch (err) {
    console.error('Validation errors:', err.response?.data);
    let errorMessage = 'Submission failed – check console';
    if (err.response?.data) {
      errorMessage = Object.entries(err.response.data)
        .map(([key, value]) => `${key}: ${Array.isArray(value) ? value.join(', ') : value}`)
        .join('\n');
    }
    toast.add({ severity: 'error', summary: 'Error', detail: errorMessage });
  }
}

onMounted(async () => {
  await fetchCategoriesWithSubcategories();
  await fetchProcurementProcesses();
  if (route.params.slug) {
    await fetchTenderData(route.params.slug);
  }
});
</script>

<style scoped>
.mb-3 {
  margin-bottom: 1rem !important;
}
</style>