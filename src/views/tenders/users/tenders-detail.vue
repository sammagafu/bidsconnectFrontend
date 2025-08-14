<template>
  <VerticalLayout>
    <div class="container py-4">
      <div class="card p-4" ref="printSection">
        <h1 class="mb-4">Tender Checklist</h1>

        <div v-if="loading" class="text-center my-5">
          <div class="spinner-border" role="status">
            <span class="visually-hidden">Loading...</span>
          </div>
        </div>

        <div v-else-if="tender">
          <table class="table table-bordered align-middle">
            <tbody>
              <tr>
                <th colspan="2" class="table-primary">1. Procurement Details</th>
              </tr>
              <tr><td>Title</td><td>{{ tender.title }}</td></tr>
              <tr><td>Reference No.</td><td>{{ tender.reference_number }}</td></tr>
              <tr><td>Country</td><td>{{ tender.tender_type_country }}</td></tr>
              <tr><td>Sector</td><td>{{ tender.tender_type_sector }}</td></tr>
              <tr>
                <td>Category / Subcategory</td>
                <td>{{ tender.category?.name ?? 'N/A' }} / {{ tender.subcategory?.name ?? 'N/A' }}</td>
              </tr>
              <tr>
                <td>Procurement Process</td>
                <td>
                  {{ tender.procurement_process?.name ?? 'N/A' }} ({{ getProcurementTypeDisplay(tender.procurement_process?.type) }})
                </td>
              </tr>
              <tr><td>Status</td><td>{{ tender.status }}</td></tr>
              <tr><td>Version</td><td>{{ tender.version }}</td></tr>
              <tr><td>Source of Funds</td><td>{{ getSourceOfFundsDisplay(tender.source_of_funds) }}</td></tr>
              <tr><td>Re-advertised From</td><td>{{ tender.re_advertised_from ? tender.re_advertised_from.title : 'N/A' }}</td></tr>
              <tr><td>Re-advertisement Count</td><td>{{ tender.re_advertisement_count }}</td></tr>
              <tr><td>Allow Alternative Delivery</td><td>{{ tender.allow_alternative_delivery ? 'Yes' : 'No' }}</td></tr>

              <tr>
                <th colspan="2" class="table-primary">2. Key Dates</th>
              </tr>
              <tr><td>Published</td><td>{{ formatDateTime(tender.publication_date) }}</td></tr>
              <tr><td>Submission Deadline</td><td>{{ formatDateTime(tender.submission_deadline) }}</td></tr>
              <tr><td>Validity Period (Days)</td><td>{{ tender.validity_period_days ?? 'N/A' }}</td></tr>
              <tr><td>Completion Period (Days)</td><td>{{ tender.completion_period_days ?? 'N/A' }}</td></tr>
              <tr><td>Litigation History Start</td><td>{{ formatDate(tender.litigation_history_start) }}</td></tr>
              <tr><td>Litigation History End</td><td>{{ formatDate(tender.litigation_history_end) }}</td></tr>

              <tr>
                <th colspan="2" class="table-primary">3. Fees & Security</th>
              </tr>
              <tr><td>Tender Fees</td><td>{{ tender.tender_fees }} {{ tender.currency }}</td></tr>
              <tr><td>Security Type</td><td>{{ tender.tender_securing_type ?? 'N/A' }}</td></tr>
              <tr v-if="tender.tender_security_percentage !== null">
                <td>Security %</td><td>{{ tender.tender_security_percentage }}%</td>
              </tr>
              <tr v-if="tender.tender_security_amount !== null">
                <td>Security Amount</td><td>{{ tender.tender_security_amount }} {{ tender.tender_security_currency }}</td>
              </tr>

              <tr>
                <th colspan="2" class="table-primary">4. Agency & Contact</th>
              </tr>
              <tr><td>Agency</td><td>{{ tender.agency?.name ?? 'N/A' }}</td></tr>
              <tr v-if="tender.agency?.phone_number"><td>Phone</td><td>{{ tender.agency.phone_number }}</td></tr>
              <tr v-if="tender.agency?.email"><td>Email</td><td>{{ tender.agency.email }}</td></tr>
              <tr v-if="tender.agency?.website">
                <td>Website</td>
                <td>
                  <a :href="tender.agency.website" target="_blank">{{ tender.agency.website }}</a>
                </td>
              </tr>

              <tr>
                <th colspan="2" class="table-primary">5. Required Documents</th>
              </tr>
              <tr v-for="doc in tender.required_documents" :key="doc.id">
                <td>
                  <div class="fw-bold">{{ doc.name }}</div>
                  <div>{{ doc.description }}</div>
                  <div>Requirement: {{ getIsRequiredDisplay(doc.is_required) }}</div>
                </td>
                <td>
                  <span class="badge bg-primary rounded-pill">{{ doc.document_type }}</span>
                </td>
              </tr>
              <tr v-if="!tender.required_documents.length">
                <td colspan="2">No documents required.</td>
              </tr>

              <tr>
                <th colspan="2" class="table-primary">6. Other Requirements</th>
              </tr>
              <tr>
                <td>Financial Requirements</td>
                <td>
                  <ul v-if="tender.financial_requirements.length">
                    <li v-for="f in tender.financial_requirements" :key="f.id">
                      {{ f.name }} – Min {{ f.minimum }} {{ f.unit }}
                      <div v-if="f.formula">Formula: {{ f.formula }}</div>
                      <div v-if="f.financial_sources">Sources: {{ f.financial_sources }}</div>
                      <div v-if="f.start_date">Start Date: {{ formatDate(f.start_date) }}</div>
                      <div v-if="f.end_date">End Date: {{ formatDate(f.end_date) }}</div>
                      <div v-if="f.jv_compliance">JV Compliance: {{ getJvComplianceDisplay(f.jv_compliance) }}</div>
                      <div v-if="f.jv_percentage !== null">JV Percentage: {{ f.jv_percentage }}%</div>
                      <div v-if="f.notes">Notes: {{ f.notes }}</div>
                    </li>
                  </ul>
                  <span v-else>None</span>
                </td>
              </tr>
              <tr>
                <td>Turnover Requirements</td>
                <td>
                  <ul v-if="tender.turnover_requirements.length">
                    <li v-for="t in tender.turnover_requirements" :key="t.id">
                      {{ t.label }} – {{ t.amount }} {{ t.currency }}
                      <div v-if="t.start_date">Start Date: {{ formatDate(t.start_date) }}</div>
                      <div v-if="t.end_date">End Date: {{ formatDate(t.end_date) }}</div>
                      <div v-if="t.jv_compliance">JV Compliance: {{ getJvComplianceDisplay(t.jv_compliance) }}</div>
                      <div v-if="t.jv_percentage !== null">JV Percentage: {{ t.jv_percentage }}%</div>
                    </li>
                  </ul>
                  <span v-else>None</span>
                </td>
              </tr>
              <tr>
                <td>Experience Requirements</td>
                <td>
                  <ul v-if="tender.experience_requirements.length">
                    <li v-for="e in tender.experience_requirements" :key="e.id">
                      {{ getExperienceTypeDisplay(e.type) }} – {{ e.contract_count }} contracts ≥ {{ e.min_value }} {{ e.currency }}
                      <div v-if="e.description">Description: {{ e.description }}</div>
                      <div v-if="e.start_date">Start Date: {{ formatDate(e.start_date) }}</div>
                      <div v-if="e.end_date">End Date: {{ formatDate(e.end_date) }}</div>
                      <div v-if="e.jv_compliance">JV Compliance: {{ getJvComplianceDisplay(e.jv_compliance) }}</div>
                      <div v-if="e.jv_percentage !== null">JV Percentage: {{ e.jv_percentage }}%</div>
                      <div v-if="e.jv_aggregation_note">JV Aggregation Note: {{ e.jv_aggregation_note }}</div>
                      <div v-if="e.reputation_notes">Reputation Notes: {{ e.reputation_notes }}</div>
                    </li>
                  </ul>
                  <span v-else>None</span>
                </td>
              </tr>
              <tr>
                <td>Personnel Requirements</td>
                <td>
                  <ul v-if="tender.personnel_requirements.length">
                    <li v-for="p in tender.personnel_requirements" :key="p.id">
                      {{ p.role }} – Min {{ p.min_experience_yrs }} yrs
                      <div v-if="p.min_education">Education: {{ getEducationLevelDisplay(p.min_education) }}</div>
                      <div v-if="p.professional_registration">Professional Registration: {{ p.professional_registration }}</div>
                      <div v-if="p.appointment_duration_years">Appointment Duration: {{ p.appointment_duration_years }} yrs</div>
                      <div v-if="p.nationality_required">Nationality: {{ p.nationality_required }}</div>
                      <div v-if="p.language_required">Language: {{ p.language_required }}</div>
                      <div v-if="p.age_min">Min Age: {{ p.age_min }}</div>
                      <div v-if="p.age_max">Max Age: {{ p.age_max }}</div>
                      <div v-if="p.specialized_education">Specialized Education: {{ p.specialized_education }}</div>
                      <div v-if="p.professional_certifications">Certifications: {{ p.professional_certifications }}</div>
                      <div v-if="p.jv_compliance">JV Compliance: {{ getJvComplianceDisplay(p.jv_compliance) }}</div>
                      <div v-if="p.notes">Notes: {{ p.notes }}</div>
                    </li>
                  </ul>
                  <span v-else>None</span>
                </td>
              </tr>
              <tr>
                <td>Schedule Items</td>
                <td>
                  <ul v-if="tender.schedule_items.length">
                    <li v-for="s in tender.schedule_items" :key="s.id">
                      {{ s.commodity }} – {{ s.quantity }} {{ s.unit }}
                      <div v-if="s.code">Code: {{ s.code }}</div>
                      <div v-if="s.specification">Specification: {{ s.specification }}</div>
                    </li>
                  </ul>
                  <span v-else>None</span>
                </td>
              </tr>
              <tr>
                <td>Technical Specifications</td>
                <td>
                  <ul v-if="tender.technical_specifications.length">
                    <li v-for="t in tender.technical_specifications" :key="t.id">
                      {{ getTechnicalCategoryDisplay(t.category) }}
                      <div v-if="t.description">Description: {{ t.description }}</div>
                    </li>
                  </ul>
                  <span v-else>None</span>
                </td>
              </tr>

              <tr>
                <th colspan="2" class="table-primary">7. Record Info</th>
              </tr>
              <tr><td>Created By</td><td>{{ tender.created_by?.email ?? 'N/A' }}</td></tr>
              <tr><td>Created At</td><td>{{ formatDateTime(tender.created_at) }}</td></tr>
              <tr><td>Last Updated</td><td>{{ formatDateTime(tender.updated_at) }}</td></tr>
            </tbody>
          </table>

          <!-- Action Buttons -->
          <div class="d-flex gap-2">
            <button class="btn btn-primary" @click="downloadPDF">
              Download Checklist PDF
            </button>
            <button class="btn btn-primary" @click="bidForTender(tender.slug)" v-if="authStore.isAuthenticated">
              Bid on Tender
            </button>
          </div>
        </div>

        <div v-else class="text-center my-5">
          <p>No tender data available.</p>
        </div>
      </div>
    </div>
  </VerticalLayout>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useAuthStore } from '@/stores/auth';
import { api } from '@/services/authService';
import VerticalLayout from '@/layouts/VerticalLayout.vue';
import html2pdf from 'html2pdf.js';

const route = useRoute();
const router = useRouter();
const authStore = useAuthStore();
const slug = route.params.slug;
const tender = ref(null);
const loading = ref(false);
const printSection = ref(null);

const processTypeDisplay = {
  open: 'Open Tendering',
  selective: 'Selective Tendering',
  limited: 'Limited Tendering',
  direct: 'Direct Procurement',
};

const experienceTypeDisplay = {
  specific: 'Specific/Similar Projects',
  general: 'General Experience',
};

const sourceOfFundsDisplay = {
  government: 'Government Funds',
  loan: 'Loan',
  credit: 'Credit',
  grant: 'Grant',
  other: 'Other',
};

const isRequiredDisplay = {
  required: 'Required',
  optional: 'Optional',
};

const educationLevelDisplay = {
  certificate: 'Certificate',
  diploma: 'Diploma',
  bachelor: "Bachelor's Degree",
  master: "Master's Degree",
  phd: 'PhD',
};

const jvComplianceDisplay = {
  separate: 'Separate for Each Partner',
  combined: 'Combined for JV',
};

const technicalCategoryDisplay = {
  service: 'Service Specifications',
  technology: 'Technology Specifications',
  security: 'Security Specifications',
  architecture: 'Technical Architecture',
  usability: 'Usability',
  testing: 'Testing and Quality Assurance',
  conformity: 'Conformity to Technical Requirements',
};

const getProcurementTypeDisplay = (type) => {
  return processTypeDisplay[type] ?? 'N/A';
};

const getExperienceTypeDisplay = (type) => {
  return experienceTypeDisplay[type] ?? 'N/A';
};

const getSourceOfFundsDisplay = (value) => {
  return sourceOfFundsDisplay[value] ?? 'N/A';
};

const getIsRequiredDisplay = (value) => {
  return isRequiredDisplay[value] ?? 'N/A';
};

const getEducationLevelDisplay = (value) => {
  return educationLevelDisplay[value] ?? 'N/A';
};

const getJvComplianceDisplay = (value) => {
  return jvComplianceDisplay[value] ?? 'N/A';
};

const getTechnicalCategoryDisplay = (value) => {
  return technicalCategoryDisplay[value] ?? 'N/A';
};

const fetchTender = async () => {
  loading.value = true;
  try {
    const { data } = await api.get(`tenders/tenders/${slug}/`);
    tender.value = data;
  } catch (e) {
    console.error('Failed to fetch tender:', e);
  } finally {
    loading.value = false;
  }
};

const formatDateTime = (iso) => {
  return iso ? new Date(iso).toLocaleString() : 'N/A';
};

const formatDate = (iso) => {
  return iso ? new Date(iso).toLocaleDateString() : 'N/A';
};

const downloadPDF = () => {
  const element = printSection.value;
  const opt = {
    margin: 1,
    filename: `Tender_Checklist_${tender.value.reference_number}.pdf`,
    image: { type: 'jpeg', quality: 0.98 },
    html2canvas: { scale: 2 },
    jsPDF: { unit: 'in', format: 'letter', orientation: 'portrait' }
  };
  html2pdf().from(element).set(opt).save();
};

const bidForTender = (slug) => {
  console.log('Bid for tender:', slug);
  router.push({ name: 'company.bids-create', params: { slug } });
};

onMounted(() => {
  fetchTender();
});
</script>

<style scoped>
.list-group-item {
  border: none;
  padding-left: 0;
}
.badge {
  font-size: 0.9em;
}
.table th, .table td {
  vertical-align: top;
}
.table-primary {
  background-color: #e9ecef;
}
</style>