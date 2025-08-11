<template>
  <VerticalLayout>
    <b-container>
      <b-row>
        <b-col cols="12">
          <h1 class="mb-4">Bid Submission for {{ tender?.title || 'Tender' }}</h1>
          <b-alert v-if="error" variant="danger" show>{{ error }}</b-alert>
          <b-overlay :show="loading" rounded="sm">
            <b-progress :max="100" class="mb-4">
              <b-progress-bar :value="completionPercentage" variant="success">
                Completion: {{ completionPercentage }}%
              </b-progress-bar>
            </b-progress>
            <div class="accordion" role="tablist" v-if="tender">
              <!-- Priced Schedule -->
              <b-card no-body class="mb-1" v-if="requiredDocuments.some(doc => doc.name === 'Priced Schedule')">
                <b-card-header
                  header-tag="header"
                  class="p-2 bg-success pointer d-flex justify-content-between align-items-center"
                  role="tab"
                  v-b-toggle.priced-schedule
                >
                  <h4 class="mb-0">Priced Schedule</h4>
                  <i :class="['pi', isPricedScheduleOpen ? 'pi-chevron-up' : 'pi-chevron-down']"></i>
                </b-card-header>
                <b-collapse id="priced-schedule" v-model="isPricedScheduleOpen" accordion="my-accordion" role="tabpanel">
                  <b-card-body>
                    <b-form-group label="Bid Amount (TZS)">
                      <b-form-input v-model.number="complianceData['Priced Schedule']" type="number" placeholder="Enter bid amount" />
                    </b-form-group>
                    <b-form-group label="VAT Amount (18%)">
                      <b-form-input v-model.number="complianceData['VAT Amount']" type="number" placeholder="Enter VAT amount" />
                    </b-form-group>
                    <b-form-group label="Upload Priced Schedule Document">
                      <b-form-file v-model="documents['Priced Schedule']" accept=".pdf" />
                    </b-form-group>
                  </b-card-body>
                </b-collapse>
              </b-card>

              <!-- Power of Attorney -->
              <b-card no-body class="mb-1" v-if="requiredDocuments.some(doc => doc.name === 'power-of-attorney')">
                <b-card-header
                  header-tag="header"
                  class="p-2 bg-success pointer d-flex justify-content-between align-items-center"
                  role="tab"
                  v-b-toggle.power-of-attorney
                >
                  <h4 class="mb-0">Power of Attorney</h4>
                  <i :class="['pi', isPowerOfAttorneyOpen ? 'pi-chevron-up' : 'pi-chevron-down']"></i>
                </b-card-header>
                <b-collapse id="power-of-attorney" v-model="isPowerOfAttorneyOpen" accordion="my-accordion" role="tabpanel">
                  <b-card-body>
                    <b-form-group label="Choose a Representative">
                      <b-form-select v-model="selectedUserId" :options="userOptions" value-field="id" text-field="user_email" placeholder="Select a representative" />
                    </b-form-group>
                    <b-card v-if="selectedUser" class="mt-3">
                      <h5>User Details</h5>
                      <ul class="list-unstyled">
                        <li><strong>Email:</strong> {{ selectedUser.user_email }}</li>
                        <li><strong>Role:</strong> {{ selectedUser.role }}</li>
                      </ul>
                      <b-form-group label="Upload Power of Attorney Document">
                        <b-form-file v-model="documents['Power of Attorney']" accept=".pdf" />
                      </b-form-group>
                    </b-card>
                  </b-card-body>
                </b-collapse>
              </b-card>

              <!-- Conformance to Technical Specifications -->
              <b-card no-body class="mb-1" v-if="requiredDocuments.some(doc => doc.name === 'Conformance to Technical Specifications')">
                <b-card-header
                  header-tag="header"
                  class="p-2 bg-success pointer d-flex justify-content-between align-items-center"
                  role="tab"
                  v-b-toggle.technical-specifications
                >
                  <h4 class="mb-0">Conformance to Technical Specifications</h4>
                  <i :class="['pi', isTechnicalSpecificationsOpen ? 'pi-chevron-up' : 'pi-chevron-down']"></i>
                </b-card-header>
                <b-collapse id="technical-specifications" v-model="isTechnicalSpecificationsOpen" accordion="my-accordion" role="tabpanel">
                  <b-card-body>
                    <b-form-group label="Upload Compliance Statement">
                      <b-form-file v-model="documents['Conformance to Technical Specifications']" accept=".pdf" />
                    </b-form-group>
                  </b-card-body>
                </b-collapse>
              </b-card>

              <!-- Manufacturer Authorization -->
              <b-card no-body class="mb-1" v-if="requiredDocuments.some(doc => doc.name === 'Manufacturer Authorization')">
                <b-card-header
                  header-tag="header"
                  class="p-2 bg-success pointer d-flex justify-content-between align-items-center"
                  role="tab"
                  v-b-toggle.manufacturer-authorization
                >
                  <h4 class="mb-0">Manufacturer Authorization</h4>
                  <i :class="['pi', isManufacturerAuthorizationOpen ? 'pi-chevron-up' : 'pi-chevron-down']"></i>
                </b-card-header>
                <b-collapse id="manufacturer-authorization" v-model="isManufacturerAuthorizationOpen" accordion="my-accordion" role="tabpanel">
                  <b-card-body>
                    <b-form-group label="Upload Manufacturer Authorization Letter">
                      <b-form-file v-model="documents['Manufacturer Authorization']" accept=".pdf" />
                    </b-form-group>
                  </b-card-body>
                </b-collapse>
              </b-card>

              <!-- Tender Security -->
              <b-card no-body class="mb-1" v-if="requiredDocuments.some(doc => doc.name === 'Tender Security')">
                <b-card-header
                  header-tag="header"
                  class="p-2 bg-success pointer d-flex justify-content-between align-items-center"
                  role="tab"
                  v-b-toggle.tender-security
                >
                  <h4 class="mb-0">Tender Security</h4>
                  <i :class="['pi', isTenderSecurityOpen ? 'pi-chevron-up' : 'pi-chevron-down']"></i>
                </b-card-header>
                <b-collapse id="tender-security" v-model="isTenderSecurityOpen" accordion="my-accordion" role="tabpanel">
                  <b-card-body>
                    <b-form-group label="Upload Tender Security Document">
                      <b-form-file v-model="documents['Tender Security']" accept=".pdf" />
                    </b-form-group>
                  </b-card-body>
                </b-collapse>
              </b-card>

              <!-- Financial Requirements -->
              <b-card no-body class="mb-1" v-if="financialRequirements.length && requiredDocuments.some(doc => doc.name === 'financial-statement')">
                <b-card-header
                  header-tag="header"
                  class="p-2 bg-success pointer d-flex justify-content-between align-items-center"
                  role="tab"
                  v-b-toggle.financial-requirements
                >
                  <h4 class="mb-0">Financial Requirements</h4>
                  <i :class="['pi', isFinancialRequirementsOpen ? 'pi-chevron-up' : 'pi-chevron-down']"></i>
                </b-card-header>
                <b-collapse id="financial-requirements" v-model="isFinancialRequirementsOpen" accordion="my-accordion" role="tabpanel">
                  <b-card-body>
                    <b-form-group
                      v-for="req in financialRequirements"
                      :key="req.id"
                      :label="req.name"
                    >
                      <b-form-input
                        v-model.number="complianceData[req.name]"
                        type="number"
                        :placeholder="`Enter ${req.name} (${req.unit || 'TZS'})`"
                      />
                    </b-form-group>
                  </b-card-body>
                </b-collapse>
              </b-card>

              <!-- Turnover Requirements -->
              <b-card no-body class="mb-1" v-if="turnoverRequirements.length && requiredDocuments.some(doc => doc.name === 'annual-turn-over')">
                <b-card-header
                  header-tag="header"
                  class="p-2 bg-success pointer d-flex justify-content-between align-items-center"
                  role="tab"
                  v-b-toggle.turnover-requirements
                >
                  <h4 class="mb-0">Average Annual Turnover</h4>
                  <i :class="['pi', isTurnoverRequirementsOpen ? 'pi-chevron-up' : 'pi-chevron-down']"></i>
                </b-card-header>
                <b-collapse id="turnover-requirements" v-model="isTurnoverRequirementsOpen" accordion="my-accordion" role="tabpanel">
                  <b-card-body>
                    <b-form-group
                      v-for="req in turnoverRequirements"
                      :key="req.id"
                      :label="req.label"
                    >
                      <b-form-input
                        v-model.number="complianceData[req.label]"
                        type="number"
                        :placeholder="`Enter amount (${req.currency}) for period ${req.start_date} to ${req.end_date}`"
                      />
                    </b-form-group>
                  </b-card-body>
                </b-collapse>
              </b-card>

              <!-- Litigation History -->
              <b-card no-body class="mb-1" v-if="hasLitigation && requiredDocuments.some(doc => doc.name === 'litigation-history')">
                <b-card-header
                  header-tag="header"
                  class="p-2 bg-success pointer d-flex justify-content-between align-items-center"
                  role="tab"
                  v-b-toggle.litigation-history
                >
                  <h4 class="mb-0">Litigation History</h4>
                  <i :class="['pi', isLitigationOpen ? 'pi-chevron-up' : 'pi-chevron-down']"></i>
                </b-card-header>
                <b-collapse id="litigation-history" v-model="isLitigationOpen" accordion="my-accordion" role="tabpanel">
                  <b-card-body>
                    <b-form-group label="Select Litigation Years">
                      <b-form-select v-model="selectedLitigationYears" :options="litigationYearOptions" multiple placeholder="Choose years" />
                    </b-form-group>
                    <div v-if="selectedLitigations.length">
                      <div v-for="litigation in selectedLitigations" :key="litigation.id">
                        <p><strong>Year:</strong> {{ litigation.year }}</p>
                        <p><strong>Description:</strong> {{ litigation.description }}</p>
                        <p><strong>Outcome:</strong> {{ litigation.outcome }}</p>
                      </div>
                    </div>
                    <div v-else-if="selectedLitigationYears.length">
                      <p class="text-muted">No litigation data available for selected years.</p>
                    </div>
                    <b-button variant="primary" @click="addLitigation">
                      <i class="pi pi-plus mr-2" /> Add Litigation
                    </b-button>
                  </b-card-body>
                </b-collapse>
              </b-card>

              <!-- Sources of Funds -->
              <b-card no-body class="mb-1" v-if="requiredDocuments.some(doc => doc.name === 'source-of-funds')">
                <b-card-header
                  header-tag="header"
                  class="p-2 bg-success pointer d-flex justify-content-between align-items-center"
                  role="tab"
                  v-b-toggle.sources-of-funds
                >
                  <h4 class="mb-0">Sources of Funds</h4>
                  <i :class="['pi', isSourcesOpen ? 'pi-chevron-up' : 'pi-chevron-down']"></i>
                </b-card-header>
                <b-collapse id="sources-of-funds" v-model="isSourcesOpen" accordion="my-accordion" role="tabpanel">
                  <b-card-body>
                    <b-form-group label="Select Sources">
                      <b-form-select v-model="selectedSourceIds" :options="sourceOptions" value-field="value" text-field="label" multiple placeholder="Choose sources" />
                    </b-form-group>
                    <div v-if="selectedSources.length">
                      <div v-for="source in selectedSources" :key="source.id">
                        <p><strong>Type:</strong> {{ source.type }}</p>
                        <p><strong>Description:</strong> {{ source.description }}</p>
                      </div>
                    </div>
                    <div v-else-if="selectedSourceIds.length">
                      <p class="text-muted">No sources data available for selected items.</p>
                    </div>
                    <b-button variant="primary" @click="addSource">
                      <i class="pi pi-plus mr-2" /> Add Source of Funds
                    </b-button>
                  </b-card-body>
                </b-collapse>
              </b-card>

              <!-- Financial Statements -->
              <b-card no-body class="mb-1" v-if="requiredDocuments.some(doc => doc.name === 'financial-statement')">
                <b-card-header
                  header-tag="header"
                  class="p-2 bg-success pointer d-flex justify-content-between align-items-center"
                  role="tab"
                  v-b-toggle.financial-statements
                >
                  <h4 class="mb-0">Financial Statements</h4>
                  <i :class="['pi', isStatementsOpen ? 'pi-chevron-up' : 'pi-chevron-down']"></i>
                </b-card-header>
                <b-collapse id="financial-statements" v-model="isStatementsOpen" accordion="my-accordion" role="tabpanel">
                  <b-card-body>
                    <b-form-group label="Select Statement Years">
                      <b-form-select v-model="selectedStatementYears" :options="statementYearOptions" multiple placeholder="Choose years" />
                    </b-form-group>
                    <div v-if="selectedStatements.length">
                      <div v-for="statement in selectedStatements" :key="statement.id">
                        <p><strong>Year:</strong> {{ statement.year }}</p>
                        <p><strong>Type:</strong> {{ statement.type }}</p>
                      </div>
                    </div>
                    <div v-else-if="selectedStatementYears.length">
                      <p class="text-muted">No statements data available for selected years.</p>
                    </div>
                    <b-button variant="primary" @click="addStatement">
                      <i class="pi pi-plus mr-2" /> Add Financial Statement
                    </b-button>
                  </b-card-body>
                </b-collapse>
              </b-card>

              <!-- Experience Requirements -->
              <b-card no-body class="mb-1" v-if="experienceRequirements.length && requiredDocuments.some(doc => doc.name === 'work-experience')">
                <b-card-header
                  header-tag="header"
                  class="p-2 bg-success pointer d-flex justify-content-between align-items-center"
                  role="tab"
                  v-b-toggle.experience-requirements
                >
                  <h4 class="mb-0">Experience in Similar Assignments</h4>
                  <i :class="['pi', isExperienceRequirementsOpen ? 'pi-chevron-up' : 'pi-chevron-down']"></i>
                </b-card-header>
                <b-collapse id="experience-requirements" v-model="isExperienceRequirementsOpen" accordion="my-accordion" role="tabpanel">
                  <b-card-body>
                    <b-form-group
                      v-for="req in experienceRequirements"
                      :key="req.id"
                      :label="`${req.get_type_display} Experience`"
                    >
                      <b-form-input
                        v-model.number="complianceData[`${req.type}_contract_count`]"
                        type="number"
                        placeholder="Enter number of contracts"
                      />
                      <b-form-input
                        v-model.number="complianceData[`${req.type}_value`]"
                        type="number"
                        :placeholder="`Enter total value (${req.currency})`"
                      />
                    </b-form-group>
                  </b-card-body>
                </b-collapse>
              </b-card>

              <!-- Personnel Requirements -->
              <b-card no-body class="mb-1" v-if="personnelRequirements.length && requiredDocuments.some(doc => doc.name === 'personnel-information')">
                <b-card-header
                  header-tag="header"
                  class="p-2 bg-success pointer d-flex justify-content-between align-items-center"
                  role="tab"
                  v-b-toggle.personnel-requirements
                >
                  <h4 class="mb-0">Personnel Qualifications</h4>
                  <i :class="['pi', isPersonnelRequirementsOpen ? 'pi-chevron-up' : 'pi-chevron-down']"></i>
                </b-card-header>
                <b-collapse id="personnel-requirements" v-model="isPersonnelRequirementsOpen" accordion="my-accordion" role="tabpanel">
                  <b-card-body>
                    <b-form-group label="Select Personnel">
                      <b-form-select v-model="selectedPersonnelIds" :options="personnelOptions" value-field="value" text-field="label" multiple placeholder="Choose personnel" />
                    </b-form-group>
                    <div v-if="selectedPersonnel.length">
                      <div v-for="person in selectedPersonnel" :key="person.id">
                        <p><strong>Name:</strong> {{ person.first_name }} {{ person.last_name }}</p>
                        <p><strong>Job Title:</strong> {{ person.job_title }}</p>
                      </div>
                    </div>
                    <div v-else-if="selectedPersonnelIds.length">
                      <p class="text-muted">No personnel data available for selected items.</p>
                    </div>
                    <b-form-group
                      v-for="req in personnelRequirements"
                      :key="req.id"
                      :label="req.role"
                    >
                      <b-form-select
                        v-model="complianceData[`Personnel ${req.role}_id`]"
                        :options="personnelOptions"
                        value-field="value"
                        text-field="label"
                        :placeholder="`Select personnel for ${req.role}`"
                      />
                      <b-form-input
                        v-model.number="complianceData[`Personnel ${req.role}_experience`]"
                        type="number"
                        placeholder="Enter years of experience"
                      />
                    </b-form-group>
                    <b-button variant="primary" @click="addPersonnel">
                      <i class="pi pi-plus mr-2" /> Add Personnel
                    </b-button>
                  </b-card-body>
                </b-collapse>
              </b-card>
            </div>

            <!-- Buttons -->
            <b-button-group class="mt-4">
              <b-button
                variant="secondary"
                @click="saveDraft"
                :disabled="loading"
              >
                Save Draft
              </b-button>
              <b-button
                variant="primary"
                @click="submitBid"
                :disabled="loading || !isFormComplete"
              >
                Publish Bid
              </b-button>
            </b-button-group>
          </b-overlay>
        </b-col>
      </b-row>
    </b-container>
  </VerticalLayout>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import VerticalLayout from '@/layouts/VerticalLayout.vue';
import { api } from '@/services/authService';
import { useAuthStore } from '@/stores/auth';
import { useRouter, useRoute } from 'vue-router';

const loading = ref(true);
const error = ref(null);
const authStore = useAuthStore();
const router = useRouter();
const route = useRoute();

// Tender and requirements data
const tender = ref(null);
const requiredDocuments = ref([]);
const financialRequirements = ref([]);
const turnoverRequirements = ref([]);
const experienceRequirements = ref([]);
const personnelRequirements = ref([]);

// Form state
const documents = ref({});
const complianceData = ref({});
const selectedUserId = ref(null);
const bidId = ref(null); // For existing draft

// Accordion states
const isPricedScheduleOpen = ref(true);
const isPowerOfAttorneyOpen = ref(false);
const isTechnicalSpecificationsOpen = ref(false);
const isManufacturerAuthorizationOpen = ref(false);
const isTenderSecurityOpen = ref(false);
const isFinancialRequirementsOpen = ref(false);
const isTurnoverRequirementsOpen = ref(false);
const isLitigationOpen = ref(false);
const isSourcesOpen = ref(false);
const isStatementsOpen = ref(false);
const isExperienceRequirementsOpen = ref(false);
const isPersonnelRequirementsOpen = ref(false);

// User and company data
const user = authStore.user;
const company = user?.companies?.[0] || {};

// Computed user options for Power of Attorney
const userOptions = computed(() =>
  (company.company_users || []).map(user => ({
    id: user.id,
    user_email: user.user_email,
    role: user.role,
  }))
);

const selectedUser = computed(() =>
  company.company_users?.find(u => u.id === selectedUserId.value)
);

// Computed personnel options
const personnelOptions = computed(() =>
  (company.personnel || []).map(p => ({
    value: p.id,
    label: `${p.first_name} ${p.last_name} - ${p.job_title}`,
  }))
);

// Litigation
const selectedLitigationYears = ref([]);
const litigationYearOptions = computed(() => {
  const years = company.litigations?.map(l => l.year) || [];
  return [...new Set(years)].sort().map(y => ({ label: y, value: y }));
});
const selectedLitigations = computed(() =>
  company.litigations?.filter(l => selectedLitigationYears.value.includes(l.year)) || []
);
const addLitigation = () => {
  alert('Open modal or navigate to add litigation.');
};

// Sources of Funds
const selectedSourceIds = ref([]);
const sourceOptions = computed(() =>
  company.sources_of_funds?.map(s => ({
    value: s.id,
    label: s.type || 'Unknown'
  })) || []
);
const selectedSources = computed(() =>
  company.sources_of_funds?.filter(s => selectedSourceIds.value.includes(s.id)) || []
);
const addSource = () => {
  alert('Open modal or navigate to add source of funds.');
};

// Financial Statements
const selectedStatementYears = ref([]);
const statementYearOptions = computed(() => {
  const years = company.financial_statements?.map(fs => fs.year) || [];
  return [...new Set(years)].sort().map(y => ({ label: y, value: y }));
});
const selectedStatements = computed(() =>
  company.financial_statements?.filter(fs => selectedStatementYears.value.includes(fs.year)) || []
);
const addStatement = () => {
  alert('Open modal or navigate to add financial statement.');
};

// Selected Personnel
const selectedPersonnelIds = ref([]);
const selectedPersonnel = computed(() =>
  company.personnel?.filter(p => selectedPersonnelIds.value.includes(p.id)) || []
);
const addPersonnel = () => {
  alert('Open modal or navigate to add personnel.');
};

// Has Litigation
const hasLitigation = computed(() => {
  return tender.value ? (tender.value.litigation_history_start || tender.value.litigation_history_end) : false;
});

// Calculate completion percentage
const completionPercentage = computed(() => {
  if (!tender.value) return 0;

  let totalFields = 0;
  let filledFields = 0;

  // Documents
  const requiredDocNames = requiredDocuments.value.map(doc => doc.name);
  totalFields += requiredDocNames.length;
  filledFields += Object.keys(documents.value).filter(key => documents.value[key] && requiredDocNames.includes(key)).length;

  // Compliance data for financial
  totalFields += financialRequirements.value.length;
  filledFields += financialRequirements.value.filter(req => complianceData.value[req.name]).length;

  // Turnover
  totalFields += turnoverRequirements.value.length;
  filledFields += turnoverRequirements.value.filter(req => complianceData.value[req.label]).length;

  // Experience
  totalFields += experienceRequirements.value.length * 2; // count and value
  experienceRequirements.value.forEach(req => {
    if (complianceData.value[`${req.type}_contract_count`]) filledFields++;
    if (complianceData.value[`${req.type}_value`]) filledFields++;
  });

  // Personnel
  totalFields += personnelRequirements.value.length * 2; // id and experience
  personnelRequirements.value.forEach(req => {
    if (complianceData.value[`Personnel ${req.role}_id`]) filledFields++;
    if (complianceData.value[`Personnel ${req.role}_experience`]) filledFields++;
  });

  // Power of Attorney user
  if (requiredDocNames.includes('power-of-attorney')) {
    totalFields++;
    if (selectedUserId.value) filledFields++;
  }

  // Litigation years
  if (hasLitigation.value) {
    totalFields++;
    if (selectedLitigationYears.value.length) filledFields++;
  }

  // Sources
  totalFields++;
  if (selectedSourceIds.value.length) filledFields++;

  // Statements
  totalFields++;
  if (selectedStatementYears.value.length) filledFields++;

  // Personnel selection
  totalFields++;
  if (selectedPersonnelIds.value.length) filledFields++;

  return totalFields > 0 ? Math.round((filledFields / totalFields) * 100) : 0;
});

// Check if form is complete (for publish)
const isFormComplete = computed(() => completionPercentage.value === 100);

// Fetch tender data
const fetchTenderData = async () => {
  try {
    loading.value = true;
    const slug = route.params.slug;
    const response = await api.get(`tenders/tenders/${slug}/`);
    tender.value = response.data;

    // Fetch required documents
    const docsResponse = await api.get(`tenders/tenders/${slug}/required-documents/`);
    requiredDocuments.value = docsResponse.data;

    // Fetch financial requirements
    const financialResponse = await api.get(`tenders/tenders/${slug}/financial-requirements/`);
    financialRequirements.value = financialResponse.data;

    // Fetch turnover requirements
    const turnoverResponse = await api.get(`tenders/tenders/${slug}/turnover-requirements/`);
    turnoverRequirements.value = turnoverResponse.data;

    // Fetch experience requirements
    const experienceResponse = await api.get(`tenders/tenders/${slug}/experience-requirements/`);
    experienceRequirements.value = experienceResponse.data;

    // Fetch personnel requirements
    const personnelResponse = await api.get(`tenders/tenders/${slug}/personnel-requirements/`);
    personnelRequirements.value = personnelResponse.data;
  } catch (err) {
    error.value = 'Failed to load tender data: ' + (err.response?.data?.detail || err.message);
  } finally {
    loading.value = false;
  }
};

// Fetch existing draft bid if any
const fetchExistingBid = async () => {
  try {
    // Use tender.id after fetching tender
    if (!tender.value?.id) return;
    const tenderId = tender.value.id;
    // Assume an endpoint to get user's bids for a tender, e.g., /bids/?tender={tenderId}&status=draft
    const response = await api.get(`/bids/?tender=${tenderId}&status=draft`);
    const drafts = response.data;
    if (drafts.length > 0) {
      const draft = drafts[0];
      bidId.value = draft.id;
      // Populate form from draft
      complianceData.value = draft.compliance_data || {};
      // Documents would need to be fetched separately if needed, but for simplicity, assume files are not re-uploaded here
      selectedUserId.value = complianceData.value['Power of Attorney User'] || null;
      // Populate other selections like selectedLitigationYears, etc., if stored in compliance_data
      if (complianceData.value['Litigation Years']) selectedLitigationYears.value = complianceData.value['Litigation Years'];
      if (complianceData.value['Source Ids']) selectedSourceIds.value = complianceData.value['Source Ids'];
      if (complianceData.value['Statement Years']) selectedStatementYears.value = complianceData.value['Statement Years'];
      if (complianceData.value['Personnel Ids']) selectedPersonnelIds.value = complianceData.value['Personnel Ids'];
    }
  } catch (err) {
   console.warn('No existing draft found or error:', err);
  }
};

// Save draft
const saveDraft = async () => {
  try {
    loading.value = true;
    error.value = null;

    const formData = new FormData();
    formData.append('tender', tender.value.id);
    formData.append('company', company.id);
    formData.append('validity_days', 90);
    formData.append('status', 'draft');

    // Append documents if new uploads
    const docs = requiredDocuments.value.map(doc => ({
      required_document: doc.id,
      file: documents.value[doc.name] ? documents.value[doc.name] : null, // Only if new file
    })).filter(d => d.file); // Only append if file exists
    if (docs.length) formData.append('documents', JSON.stringify(docs));

    // Append compliance data with additional selections
    formData.append('compliance_data', JSON.stringify({
      ...complianceData.value,
      'Power of Attorney User': selectedUserId.value,
      'Litigation Years': selectedLitigationYears.value,
      'Source Ids': selectedSourceIds.value,
      'Statement Years': selectedStatementYears.value,
      'Personnel Ids': selectedPersonnelIds.value,
    }));

    let response;
    if (bidId.value) {
      // Update existing draft
      response = await api.patch(`/bids/${bidId.value}/`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
    } else {
      // Create new draft
      response = await api.post('/bids/', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      bidId.value = response.data.id;
    }

    alert('Draft saved successfully!');
  } catch (err) {
    error.value = 'Failed to save draft: ' + (err.response?.data?.detail || err.message);
  } finally {
    loading.value = false;
  }
};

// Submit/Publish bid
const submitBid = async () => {
  try {
    loading.value = true;
    error.value = null;

    // First save draft if not already
    if (!bidId.value) await saveDraft();

    // Then submit
    await api.post(`/bids/${bidId.value}/submit/`);

    // Redirect to confirmation page
    router.push({ name: 'BidConfirmation', params: { bidId: bidId.value } });
  } catch (err) {
    error.value = 'Failed to publish bid: ' + (err.response?.data?.detail || err.message);
  } finally {
    loading.value = false;
  }
};

onMounted(async () => {
  await fetchTenderData();
  await fetchExistingBid();
});
</script>

<style scoped>
.pi {
  font-size: 1.25rem;
}
.pointer {
  cursor: pointer;
}
</style>