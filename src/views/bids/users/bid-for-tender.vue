<template>
  <VerticalLayout>
    <b-container>
      <b-row>
        <b-col cols="12">
          <h1 class="mb-4">Bid Submission for {{ tender?.title || 'Tender' }}</h1>
          <b-table striped hover responsive :items="tenderDetails" :fields="tenderFields" class="mb-4" v-if="tender">
            <template #cell(key)="data">
              <strong>{{ data.item.key }}</strong>
            </template>
          </b-table>
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
                      <b-form-input v-model.number="complianceData['VAT Amount']" type="number" placeholder="Enter VAT amount" disabled />
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
                      <b-form-select v-model="selectedUserId" :options="userOptions" value-field="uuid" text-field="text" placeholder="Select a representative" />
                    </b-form-group>
                    <b-card v-if="selectedUser" class="mt-3">
                      <h5>User Details</h5>
                      <ul class="list-unstyled">
                        <li><strong>Email:</strong> {{ selectedUser.email }}</li>
                        <li><strong>Role:</strong> {{ selectedUser.position }}</li>
                        <li><strong>Name:</strong> {{ selectedUser.first_name }} {{ selectedUser.last_name }}</li>
                        <li><strong>Experience:</strong> {{ selectedUser.years_of_experience }} years</li>
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
                    <b-form-group :label="`Required Security: ${tender.tender_security_amount || tender.tender_security_percentage}% (${tender.tender_security_currency || 'TZS'})`">
                      <b-form-file v-model="documents['Tender Security']" accept=".pdf" />
                    </b-form-group>
                  </b-card-body>
                </b-collapse>
              </b-card>

              <!-- Litigation History -->
              <b-card no-body class="mb-1" v-if="requiredDocuments.some(doc => doc.name === 'litigation-history')">
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
                    <p class="mb-3">Tenderers are required to provide litigation records resulting from contracts completed or ongoing under their execution (In case of Joint Venture, compliance requirements are all Parties Combined - Must Meet requirements and Each Member - Must Meet requirements).</p>
                    <h6>PE Requirement</h6>
                    <b-table striped hover :items="litigationPE" :fields="litigationPEFields" class="mb-3"></b-table>
                    <h6>Submission Details</h6>
                    <b-form-checkbox v-model="noLitigation" class="mb-3">
                      I don't have any litigation history
                    </b-form-checkbox>
                    <b-form-group label="Select Litigations" v-if="!noLitigation">
                      <b-form-checkbox-group v-model="selectedLitigationIds" :options="litigationOptions" stacked />
                    </b-form-group>
                    <div v-if="!noLitigation && selectedLitigations.length">
                      <div v-for="litigation in selectedLitigations" :key="litigation.id">
                        <p><strong>Case Number:</strong> {{ litigation.case_number }}</p>
                        <p><strong>Description:</strong> {{ litigation.description }}</p>
                        <p><strong>Status:</strong> {{ litigation.status }}</p>
                        <p><strong>Filed Date:</strong> {{ litigation.filed_date }}</p>
                        <p><strong>Outcome:</strong> {{ litigation.outcome || 'N/A' }}</p>
                      </div>
                    </div>
                    <b-button variant="primary" @click="addLitigation">
                      + Add Litigation
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
                      <b-form-checkbox-group v-model="selectedSourceIds" :options="sourceOptions" stacked />
                    </b-form-group>
                    <div v-if="selectedSources.length">
                      <div v-for="source in selectedSources" :key="source.id">
                        <p><strong>Type:</strong> {{ source.source_type }}</p>
                        <p><strong>Amount:</strong> {{ source.amount }} {{ source.currency }}</p>
                        <p><strong>Description:</strong> {{ source.description || 'N/A' }}</p>
                      </div>
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
                    <b-table striped hover :items="financialTableData" :fields="financialFields" class="mb-3">
                      <template #cell(actions)="data">
                        <i class="pi pi-eye text-info" @click="viewFinancial(data.item)" style="cursor: pointer;"></i>
                      </template>
                    </b-table>
                    <b-form-group label="Select Financial Statements">
                      <b-form-checkbox-group v-model="selectedStatementIds" :options="statementOptions" stacked />
                    </b-form-group>
                    <b-form-group label="Items per page" class="d-flex align-items-center">
                      <b-form-select v-model="perPage" :options="[10, 20, 50]" size="sm" class="mr-2" style="width: auto;" />
                      <span>1 - {{ financialTableData.length }} of {{ financialTableData.length }}</span>
                    </b-form-group>
                    <b-button variant="primary" @click="addStatement">
                      <i class="pi pi-plus mr-2" /> Add Financial Statement
                    </b-button>
                  </b-card-body>
                </b-collapse>
              </b-card>

              <!-- Financial Requirements -->
              <b-card no-body class="mb-1" v-if="financialRequirements.length > 0">
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
                    <div v-for="req in financialRequirements" :key="req.id">
                      <b-card class="mt-3">
                        <h5>{{ req.name }}</h5>
                        <b-form-group :label="'Minimum Required: ' + req.minimum + ' ' + req.unit">
                        </b-form-group>
                        <b-form-group label="Select Financial Statement">
                          <b-form-select v-model="selectedStatementsForReq[req.id]" :options="statementOptions" value-field="value" text-field="text" />
                        </b-form-group>
                        <b-form-group label="Actual Value">
                          <b-form-input v-model="complianceData[req.name]" type="number" disabled placeholder="Select statement to auto-fill" />
                        </b-form-group>
                        <b-alert v-if="complianceErrors[req.name]" variant="danger" show>{{ complianceErrors[req.name] }}</b-alert>
                      </b-card>
                    </div>
                  </b-card-body>
                </b-collapse>
              </b-card>

              <!-- Turnover Requirements -->
              <b-card no-body class="mb-1" v-if="turnoverRequirements.length > 0">
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
                    <div v-for="req in turnoverRequirements" :key="req.id">
                      <b-card class="mt-3">
                        <h5>{{ req.label }}</h5>
                        <b-form-group :label="'Minimum Required: ' + req.amount + ' ' + req.currency">
                        </b-form-group>
                        <b-form-group label="Select Turnover Year">
                          <b-form-select v-model="selectedTurnoversForReq[req.id]" :options="turnoverOptions" value-field="value" text-field="text" />
                        </b-form-group>
                        <b-form-group label="Actual Amount">
                          <b-form-input v-model="complianceData[req.label]" type="number" disabled placeholder="Select turnover to auto-fill" />
                        </b-form-group>
                        <b-alert v-if="complianceErrors[req.label]" variant="danger" show>{{ complianceErrors[req.label] }}</b-alert>
                      </b-card>
                    </div>
                    <p class="font-weight-bold">Total average turnover: {{ averageTurnover }}</p>
                    <b-button variant="primary" @click="addTurnover">
                      <i class="pi pi-plus mr-2" /> Add Turnover
                    </b-button>
                  </b-card-body>
                </b-collapse>
              </b-card>

              <!-- Experience Requirements -->
              <b-card no-body class="mb-1" v-if="experienceRequirements.length > 0">
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
                    <div v-for="req in experienceRequirements" :key="req.id">
                      <b-card class="mt-3">
                        <h5>{{ req.type }} Experience</h5>
                        <b-form-group :label="'Required: ' + req.contract_count + ' contracts, ' + req.min_value + ' ' + req.currency">
                        </b-form-group>
                        <b-form-group label="Number of Contracts">
                          <b-form-input v-model.number="complianceData[`Experience ${req.id} Contracts`]" type="number" placeholder="Enter number of contracts" />
                        </b-form-group>
                        <b-form-group label="Total Value">
                          <b-form-input v-model.number="complianceData[`Experience ${req.id} Value`]" type="number" :placeholder="`Enter total value (${req.currency})`" />
                        </b-form-group>
                        <b-form-group label="Upload Proof">
                          <b-form-file v-model="documents[`Experience ${req.id}`]" accept=".pdf" />
                        </b-form-group>
                        <b-alert v-if="complianceErrors[`Experience ${req.id}`]" variant="danger" show>{{ complianceErrors[`Experience ${req.id}`] }}</b-alert>
                      </b-card>
                    </div>
                  </b-card-body>
                </b-collapse>
              </b-card>

              <!-- Personnel Requirements -->
              <b-card no-body class="mb-1" v-if="personnelRequirements.length > 0">
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
                    <div v-for="req in personnelRequirements" :key="req.id">
                      <b-card class="mt-3">
                        <h5>{{ req.role }}</h5>
                        <b-form-group :label="'Required: ' + req.min_experience_yrs + ' years, ' + (req.professional_registration ? 'Professional Registration' : 'No Registration')">
                        </b-form-group>
                        <b-form-group label="Select Personnel">
                          <b-form-select v-model="assignedPersonnel[req.id]" :options="personnelOptions" value-field="uuid" text-field="text" />
                        </b-form-group>
                        <b-form-group label="Years of Experience">
                          <b-form-input v-model.number="complianceData[`Personnel ${req.id} Experience`]" type="number" disabled placeholder="Auto-filled from selected personnel" />
                        </b-form-group>
                        <b-alert v-if="complianceErrors[`Personnel ${req.id}`]" variant="danger" show>{{ complianceErrors[`Personnel ${req.id}`] }}</b-alert>
                      </b-card>
                    </div>
                    <b-button variant="primary" @click="addPersonnel">
                      <i class="pi pi-plus mr-2" /> Add Personnel
                    </b-button>
                  </b-card-body>
                </b-collapse>
              </b-card>

              <!-- Tender Validity Period -->
              <b-card no-body class="mb-1" v-if="tender.validity_period_days">
                <b-card-header
                  header-tag="header"
                  class="p-2 bg-success pointer d-flex justify-content-between align-items-center"
                  role="tab"
                  v-b-toggle.tender-validity
                >
                  <h4 class="mb-0">Tender Validity Period</h4>
                  <i :class="['pi', isTenderValidityOpen ? 'pi-chevron-up' : 'pi-chevron-down']"></i>
                </b-card-header>
                <b-collapse id="tender-validity" v-model="isTenderValidityOpen" accordion="my-accordion" role="tabpanel">
                  <b-card-body>
                    <p class="mb-3">Tenderers are required to confirm with the tender validity period specified by the Procuring Entity.</p>
                    <h6>PE Requirement</h6>
                    <b-table striped hover :items="validityPE" :fields="validityFields" class="mb-3"></b-table>
                    <h6>Submission Details</h6>
                    <p class="text-muted mb-3">You have complied with the criteria. Please confirm that you complied and continue with Submission</p>
                    <b-form-checkbox v-model="validityComplied">
                      Complied
                    </b-form-checkbox>
                  </b-card-body>
                </b-collapse>
              </b-card>

              <!-- Completion Period -->
              <b-card no-body class="mb-1" v-if="tender.completion_period_days">
                <b-card-header
                  header-tag="header"
                  class="p-2 bg-success pointer d-flex justify-content-between align-items-center"
                  role="tab"
                  v-b-toggle.completion-period
                >
                  <h4 class="mb-0">Completion Period</h4>
                  <i :class="['pi', isCompletionPeriodOpen ? 'pi-chevron-up' : 'pi-chevron-down']"></i>
                </b-card-header>
                <b-collapse id="completion-period" v-model="isCompletionPeriodOpen" accordion="my-accordion" role="tabpanel">
                  <b-card-body>
                    <p class="mb-3">Tenderers are required to comply with the completion period as proposed by the procuring entity unless alternative completion period is allowed.</p>
                    <h6>PE Requirement</h6>
                    <b-table striped hover :items="completionPE" :fields="completionFields" class="mb-3"></b-table>
                    <h6>Submission Details</h6>
                    <p class="text-muted mb-3">You have complied with the criteria. Please confirm that you complied and continue with Submission</p>
                    <b-form-checkbox v-model="completionComplied">
                      Complied
                    </b-form-checkbox>
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
import { ref, computed, onMounted, watch } from 'vue';
import VerticalLayout from '@/layouts/VerticalLayout.vue';
import { api } from '@/services/authService';
import { useAuthStore } from '@/stores/auth';
import { useRouter, useRoute } from 'vue-router';
import { useToast } from 'primevue/usetoast';

const route = useRoute();
const router = useRouter();
const authStore = useAuthStore();
const toast = useToast();

const loading = ref(true);
const error = ref(null);
const complianceErrors = ref({});

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
const bidId = ref(null);

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
const isTenderValidityOpen = ref(false);
const isCompletionPeriodOpen = ref(false);

// Company data from store
const company = ref(authStore.companies[0] || {});
const financialStatements = ref(company.value.financial_statements || []);
const turnoverList = ref(company.value.annual_turnovers || []);
const sources = ref(company.value.sources_of_funds || []);
const litigations = ref(company.value.litigations || []);
const personnel = ref(company.value.personnel || []);
const certifications = ref(company.value.certifications || []);
const equipment = ref(company.value.equipment || []);

// Selected mappings
const selectedLitigationIds = ref([]);
const selectedSourceIds = ref([]);
const selectedStatementIds = ref([]);
const selectedStatementsForReq = ref({});
const selectedTurnoversForReq = ref({});
const assignedPersonnel = ref({});
const noLitigation = ref(false);
const validityComplied = ref(false);
const completionComplied = ref(false);

// Computed options
const userOptions = computed(() => personnel.value.map(p => ({
  uuid: p.uuid,
  text: `${p.first_name} ${p.last_name} - ${p.position} (${p.years_of_experience} yrs)`,
  email: p.email,
  position: p.position,
  first_name: p.first_name,
  last_name: p.last_name,
  years_of_experience: p.years_of_experience
})));

const selectedUser = computed(() => personnel.value.find(p => p.uuid === selectedUserId.value) || null);

const litigationOptions = computed(() => litigations.value.map(l => ({
  value: l.id,
  text: `${l.case_number} (${l.filed_date}) - ${l.status}`
})));

const selectedLitigations = computed(() => litigations.value.filter(l => selectedLitigationIds.value.includes(l.id)));

const sourceOptions = computed(() => sources.value.map(s => ({
  value: s.id,
  text: `${s.source_type} - ${s.amount} ${s.currency}`
})));

const selectedSources = computed(() => sources.value.filter(s => selectedSourceIds.value.includes(s.id)));

const statementOptions = computed(() => financialStatements.value.map(s => ({
  value: s.id,
  text: `${s.year}`
})));

const selectedStatements = computed(() => financialStatements.value.filter(s => selectedStatementIds.value.includes(s.id)));

const turnoverOptions = computed(() => turnoverList.value.map(t => ({
  value: t.id,
  text: `${t.year}`
})));

const tenderFields = [
  { key: 'key', label: '' },
  { key: 'value', label: '' }
];

const tenderDetails = computed(() => [
  { key: 'Financial Year', value: tender.value?.financial_year || '2025/2026' },
  { key: 'Tender Number', value: tender.value?.reference_number || 'N/A' },
  { key: 'Institution / Organization', value: tender.value?.agency?.name || 'N/A' },
  { key: 'Tender Description', value: tender.value?.tenderdescription || 'N/A' },
  { key: 'Procurement Method', value: tender.value?.procurement_process?.name || 'N/A' },
  { key: 'Tender Sub Category', value: tender.value?.subcategory?.name || 'N/A' },
  { key: 'Tender Status', value: tender.value?.status?.toUpperCase() || 'N/A' }
]);

const litigationPEFields = ['litigation_history_start', 'litigation_history_end'];
const litigationPE = computed(() => [{
  litigation_history_start: tender.value?.litigation_history_start || 'N/A',
  litigation_history_end: tender.value?.litigation_history_end || 'N/A'
}]);

const validityFields = ['validity_period_days'];
const validityPE = computed(() => [{
  validity_period_days: tender.value?.validity_period_days || 0
}]);

const completionFields = ['completion_period_days'];
const completionPE = computed(() => [{
  completion_period_days: tender.value?.completion_period_days || 0
}]);

const turnoverFields = ['no', 'year', 'currency', 'amount', 'actions'];
const turnoverTableData = computed(() => turnoverList.value.map((t, index) => ({
  no: index + 1,
  year: t.year,
  currency: t.currency,
  amount: t.amount,
  actions: true
})));

const averageTurnover = computed(() => {
  if (turnoverList.value.length === 0) return 'TZS 0.00';
  const total = turnoverList.value.reduce((sum, t) => sum + parseFloat(t.amount), 0);
  const avg = total / turnoverList.value.length;
  return `${tender.value?.tender_security_currency || 'TZS'} ${avg.toFixed(2)}`;
});

const financialFields = [
  'no', 'year', 'currency', 'total_assets', 'total_liabilities',
  'total_equity', 'gross_profit_gp', 'profit_before_tax', 'from_company', 'cash_flow', 'actions'
];
const financialTableData = computed(() => financialStatements.value.map((s, index) => ({
  no: index + 1,
  year: s.year,
  currency: tender.value?.tender_security_currency || 'TZS',
  total_assets: s.total_assets || 0,
  total_liabilities: s.total_liabilities || 0,
  total_equity: s.total_equity || 0,
  gross_profit_gp: s.gross_profit || 0,
  profit_before_tax: s.profit_before_tax || 0,
  from_company: company.value.name?.toUpperCase() || 'N/A',
  cash_flow: s.cash_and_bank || 0,
  actions: true
})));

const perPage = ref(10);

// Calculate completion percentage
const completionPercentage = computed(() => {
  if (!tender.value) return 0;

  let total = 0;
  let completed = 0;

  const docNames = requiredDocuments.value.map(doc => doc.name);
  docNames.forEach(name => {
    total += 1;
    if (documents.value[name]) completed += 1;
  });

  if (docNames.includes('Priced Schedule')) {
    total += 1;
    if (complianceData.value['Priced Schedule'] && complianceData.value['VAT Amount']) completed += 1;
  }

  if (docNames.includes('power-of-attorney')) {
    total += 1;
    if (selectedUserId.value && documents.value['Power of Attorney']) completed += 1;
  }

  if (docNames.includes('litigation-history')) {
    total += 1;
    if (noLitigation.value || selectedLitigationIds.value.length > 0) completed += 1;
  }

  if (docNames.includes('source-of-funds')) {
    total += 1;
    if (selectedSourceIds.value.length > 0) completed += 1;
  }

  if (docNames.includes('financial-statement')) {
    total += 1;
    if (selectedStatementIds.value.length > 0) completed += 1;
  }

  financialRequirements.value.forEach(req => {
    total += 1;
    if (selectedStatementsForReq.value[req.id] && complianceData.value[req.name]) {
      if (parseFloat(complianceData.value[req.name]) >= parseFloat(req.minimum)) completed += 1;
    }
  });

  turnoverRequirements.value.forEach(req => {
    total += 1;
    if (selectedTurnoversForReq.value[req.id] && complianceData.value[req.label]) {
      if (parseFloat(complianceData.value[req.label]) >= parseFloat(req.amount)) completed += 1;
    }
  });

  experienceRequirements.value.forEach(req => {
    total += 2;
    if (complianceData.value[`Experience ${req.id} Contracts`] >= req.contract_count) completed += 1;
    if (complianceData.value[`Experience ${req.id} Value`] >= req.min_value && documents.value[`Experience ${req.id}`]) completed += 1;
  });

  personnelRequirements.value.forEach(req => {
    total += 1;
    if (assignedPersonnel.value[req.id] && complianceData.value[`Personnel ${req.id} Experience`] >= req.min_experience_yrs) completed += 1;
  });

  if (tender.value.validity_period_days) {
    total += 1;
    if (validityComplied.value) completed += 1;
  }

  if (tender.value.completion_period_days) {
    total += 1;
    if (completionComplied.value) completed += 1;
  }

  return total > 0 ? Math.round((completed / total) * 100) : 0;
});

// Check if form is complete
const isFormComplete = computed(() => completionPercentage.value === 100 && Object.keys(complianceErrors.value).length === 0);

// Validate compliance data
const validateCompliance = () => {
  complianceErrors.value = {};

  financialRequirements.value.forEach(req => {
    const value = complianceData.value[req.name];
    if (value && parseFloat(value) < parseFloat(req.minimum)) {
      complianceErrors.value[req.name] = `Value ${value} ${req.unit} is below required minimum ${req.minimum} ${req.unit}`;
    }
  });

  turnoverRequirements.value.forEach(req => {
    const value = complianceData.value[req.label];
    if (value && parseFloat(value) < parseFloat(req.amount)) {
      complianceErrors.value[req.label] = `Amount ${value} ${req.currency} is below required minimum ${req.amount} ${req.currency}`;
    }
  });

  experienceRequirements.value.forEach(req => {
    const contracts = complianceData.value[`Experience ${req.id} Contracts`];
    const value = complianceData.value[`Experience ${req.id} Value`];
    if (contracts && contracts < req.contract_count) {
      complianceErrors.value[`Experience ${req.id}`] = `Number of contracts (${contracts}) is below required minimum (${req.contract_count})`;
    }
    if (value && parseFloat(value) < parseFloat(req.min_value)) {
      complianceErrors.value[`Experience ${req.id}`] = `Total value ${value} ${req.currency} is below required minimum ${req.min_value} ${req.currency}`;
    }
  });

  personnelRequirements.value.forEach(req => {
    const experience = complianceData.value[`Personnel ${req.id} Experience`];
    if (experience && experience < req.min_experience_yrs) {
      complianceErrors.value[`Personnel ${req.id}`] = `Experience (${experience} years) is below required minimum (${req.min_experience_yrs} years)`;
    }
  });
};

// Auto-calculate VAT
watch(() => complianceData.value['Priced Schedule'], (val) => {
  if (val) {
    complianceData.value['VAT Amount'] = val * 0.18;
  }
});

// Auto-fill financial actual values
watch(selectedStatementsForReq, (newVal) => {
  financialRequirements.value.forEach(req => {
    const statementId = newVal[req.id];
    const statement = financialStatements.value.find(s => s.id === statementId);
    if (statement) {
      const fieldMap = {
        'Current Ratio': 'current_ratio',
        'Cash Ratio': 'cash_ratio',
        'Working Capital': 'working_capital',
        'Gross Profit Margin': 'gross_profit_margin',
        'Debt to Equity Ratio': 'debt_to_equity_ratio',
        'Return on Assets': 'return_on_assets',
      };
      const field = fieldMap[req.name];
      if (field) {
        complianceData.value[req.name] = statement[field];
      }
    }
  });
  validateCompliance();
}, { deep: true });

// Auto-fill turnover amounts
watch(selectedTurnoversForReq, (newVal) => {
  turnoverRequirements.value.forEach(req => {
    const turnoverId = newVal[req.id];
    const turnover = turnoverList.value.find(t => t.id === turnoverId);
    if (turnover) {
      complianceData.value[req.label] = turnover.amount;
    }
  });
  validateCompliance();
}, { deep: true });

// Auto-fill personnel experience
watch(assignedPersonnel, (newVal) => {
  personnelRequirements.value.forEach(req => {
    const personnelUuid = newVal[req.id];
    const person = personnel.value.find(p => p.uuid === personnelUuid);
    if (person) {
      complianceData.value[`Personnel ${req.id} Experience`] = person.years_of_experience;
    }
  });
  validateCompliance();
}, { deep: true });

// Add functions
const addLitigation = async () => {
  try {
    const response = await api.post(`accounts/companies/${company.value.id}/litigations/`, {
      case_number: 'CASE-' + Date.now(),
      description: 'New litigation',
      status: 'Pending',
      filed_date: new Date().toISOString().split('T')[0]
    });
    litigations.value.push(response.data);
    toast.add({ severity: 'success', summary: 'Success', detail: 'Litigation added' });
  } catch (err) {
    toast.add({ severity: 'error', summary: 'Error', detail: 'Failed to add litigation' });
  }
};

const addSource = async () => {
  try {
    const response = await api.post(`accounts/companies/${company.value.id}/sources-of-funds/`, {
      source_type: 'New Source',
      amount: 0,
      currency: tender.value?.tender_security_currency || 'TZS',
      description: 'New source of funds'
    });
    sources.value.push(response.data);
    toast.add({ severity: 'success', summary: 'Success', detail: 'Source of funds added' });
  } catch (err) {
    toast.add({ severity: 'error', summary: 'Error', detail: 'Failed to add source of funds' });
  }
};

const addStatement = async () => {
  try {
    const response = await api.post(`accounts/companies/${company.value.id}/financial-statements/`, {
      year: new Date().getFullYear(),
      total_assets: 0,
      total_liabilities: 0,
      total_equity: 0,
      gross_profit: 0,
      profit_before_tax: 0,
      cash_and_bank: 0,
      current_ratio: 0,
      cash_ratio: 0,
      working_capital: 0,
      gross_profit_margin: 0,
      debt_to_equity_ratio: 0,
      return_on_assets: 0
    });
    financialStatements.value.push(response.data);
    toast.add({ severity: 'success', summary: 'Success', detail: 'Financial statement added' });
  } catch (err) {
    toast.add({ severity: 'error', summary: 'Error', detail: 'Failed to add financial statement' });
  }
};

const addPersonnel = async () => {
  try {
    const response = await api.post(`accounts/companies/${company.value.id}/personnel/`, {
      first_name: 'New',
      last_name: 'Personnel',
      position: 'Staff',
      years_of_experience: 0,
      email: `new${Date.now()}@example.com`,
      uuid: `uuid-${Date.now()}`
    });
    personnel.value.push(response.data);
    toast.add({ severity: 'success', summary: 'Success', detail: 'Personnel added' });
  } catch (err) {
    toast.add({ severity: 'error', summary: 'Error', detail: 'Failed to add personnel' });
  }
};

const addTurnover = async () => {
  try {
    const response = await api.post(`accounts/companies/${company.value.id}/annual-turnovers/`, {
      year: new Date().getFullYear(),
      amount: 0,
      currency: tender.value?.tender_security_currency || 'TZS'
    });
    turnoverList.value.push(response.data);
    toast.add({ severity: 'success', summary: 'Success', detail: 'Turnover added' });
  } catch (err) {
    toast.add({ severity: 'error', summary: 'Error', detail: 'Failed to add turnover' });
  }
};

const viewTurnover = (item) => {
  toast.add({ severity: 'info', summary: 'Viewing Turnover', detail: `Year: ${item.year}, Amount: ${item.amount} ${item.currency}` });
};

const viewFinancial = (item) => {
  toast.add({ severity: 'info', summary: 'Viewing Financial Statement', detail: `Year: ${item.year}, Total Assets: ${item.total_assets}` });
};

// Fetch tender data
const fetchTenderData = async () => {
  try {
    loading.value = true;
    const slug = route.params.slug;
    const response = await api.get(`tenders/tenders/${slug}/`);
    tender.value = response.data;

    const docsResponse = await api.get(`tenders/tenders/${slug}/required-documents/`);
    requiredDocuments.value = docsResponse.data;

    const financialResponse = await api.get(`tenders/tenders/${slug}/financial-requirements/`);
    financialRequirements.value = financialResponse.data;

    const turnoverResponse = await api.get(`tenders/tenders/${slug}/turnover-requirements/`);
    turnoverRequirements.value = turnoverResponse.data;

    const experienceResponse = await api.get(`tenders/tenders/${slug}/experience-requirements/`);
    experienceRequirements.value = experienceResponse.data;

    const personnelResponse = await api.get(`tenders/tenders/${slug}/personnel-requirements/`);
    personnelRequirements.value = personnelResponse.data;
  } catch (err) {
    error.value = 'Failed to load tender data: ' + (err.response?.data?.detail || err.message);
    toast.add({ severity: 'error', summary: 'Error', detail: error.value });
  } finally {
    loading.value = false;
  }
};

// Fetch existing draft bid
const fetchExistingBid = async () => {
  try {
    if (!tender.value?.id) return;
    const tenderId = tender.value.id;
    const response = await api.get(`/bids/?tender=${tenderId}&status=draft`);
    const drafts = response.data;
    if (drafts.length > 0) {
      const draft = drafts[0];
      bidId.value = draft.id;
      complianceData.value = draft.compliance_data || {};
      selectedUserId.value = complianceData.value['Power of Attorney User'] || null;
      selectedLitigationIds.value = complianceData.value['Litigation Ids'] || [];
      selectedSourceIds.value = complianceData.value['Source Ids'] || [];
      selectedStatementIds.value = complianceData.value['Statement Ids'] || [];
      assignedPersonnel.value = complianceData.value['Personnel Assignments'] || {};
      selectedStatementsForReq.value = complianceData.value['Financial Statements For Req'] || {};
      selectedTurnoversForReq.value = complianceData.value['Turnover For Req'] || {};
      noLitigation.value = complianceData.value['No Litigation'] || false;
      validityComplied.value = complianceData.value['Validity Complied'] || false;
      completionComplied.value = complianceData.value['Completion Complied'] || false;
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
    validateCompliance();

    if (Object.keys(complianceErrors.value).length > 0) {
      error.value = 'Please resolve compliance errors before saving.';
      toast.add({ severity: 'error', summary: 'Error', detail: error.value });
      return;
    }

    const formData = new FormData();
    formData.append('tender', tender.value.id);
    formData.append('company', company.value.id);
    formData.append('validity_days', tender.value.validity_period_days || 90);
    formData.append('status', 'draft');

    const docs = requiredDocuments.value.map(doc => ({
      required_document: doc.id,
      file: documents.value[doc.name] ? documents.value[doc.name] : null,
    })).filter(d => d.file);
    if (docs.length) formData.append('documents', JSON.stringify(docs));

    experienceRequirements.value.forEach(req => {
      if (documents.value[`Experience ${req.id}`]) {
        docs.push({
          required_document: `Experience ${req.id}`,
          file: documents.value[`Experience ${req.id}`]
        });
      }
    });
    if (docs.length) formData.append('documents', JSON.stringify(docs));

    formData.append('compliance_data', JSON.stringify({
      ...complianceData.value,
      'Power of Attorney User': selectedUserId.value,
      'Litigation Ids': selectedLitigationIds.value,
      'Source Ids': selectedSourceIds.value,
      'Statement Ids': selectedStatementIds.value,
      'Personnel Assignments': assignedPersonnel.value,
      'Financial Statements For Req': selectedStatementsForReq.value,
      'Turnover For Req': selectedTurnoversForReq.value,
      'No Litigation': noLitigation.value,
      'Validity Complied': validityComplied.value,
      'Completion Complied': completionComplied.value,
    }));

    let response;
    if (bidId.value) {
      response = await api.patch(`/bids/${bidId.value}/`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
    } else {
      response = await api.post('/bids/', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      bidId.value = response.data.id;
    }

    toast.add({ severity: 'success', summary: 'Success', detail: 'Draft saved successfully!' });
  } catch (err) {
    error.value = 'Failed to save draft: ' + (err.response?.data?.detail || err.message);
    toast.add({ severity: 'error', summary: 'Error', detail: error.value });
  } finally {
    loading.value = false;
  }
};

// Submit/Publish bid
const submitBid = async () => {
  try {
    loading.value = true;
    error.value = null;
    validateCompliance();

    if (Object.keys(complianceErrors.value).length > 0) {
      error.value = 'Please resolve compliance errors before submitting.';
      toast.add({ severity: 'error', summary: 'Error', detail: error.value });
      return;
    }

    if (!bidId.value) await saveDraft();

    await api.post(`/bids/${bidId.value}/submit/`);

    toast.add({ severity: 'success', summary: 'Success', detail: 'Bid submitted successfully!' });
    router.push({ name: 'BidConfirmation', params: { bidId: bidId.value } });
  } catch (err) {
    error.value = 'Failed to publish bid: ' + (err.response?.data?.detail || err.message);
    toast.add({ severity: 'error', summary: 'Error', detail: error.value });
  } finally {
    loading.value = false;
  }
};

// Fetch company data
const fetchCompanyData = async () => {
  try {
    if (!company.value.id) return;
    const response = await api.get(`accounts/companies/${company.value.id}/`);
    company.value = response.data;
    financialStatements.value = company.value.financial_statements || [];
    turnoverList.value = company.value.annual_turnovers || [];
    sources.value = company.value.sources_of_funds || [];
    litigations.value = company.value.litigations || [];
    personnel.value = company.value.personnel || [];
    certifications.value = company.value.certifications || [];
    equipment.value = company.value.equipment || [];
  } catch (err) {
    error.value = 'Failed to load company data: ' + (err.response?.data?.detail || err.message);
    toast.add({ severity: 'error', summary: 'Error', detail: error.value });
  }
};

onMounted(async () => {
  await fetchCompanyData();
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