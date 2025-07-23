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
                  <td>{{ tender.category.name }} / {{ tender.subcategory.name }}</td>
                </tr>
                <tr>
                  <td>Procurement Process</td>
                  <td>
                    {{ tender.procurement_process.name }} ({{ tender.procurement_process.get_type_display }})
                  </td>
                </tr>
                <tr><td>Status</td><td>{{ tender.status }}</td></tr>
                <tr><td>Version</td><td>{{ tender.version }}</td></tr>

                <tr>
                  <th colspan="2" class="table-primary">2. Key Dates</th>
                </tr>
                <tr><td>Published</td><td>{{ formatDateTime(tender.publication_date) }}</td></tr>
                <tr><td>Clarification Deadline</td><td>{{ formatDateTime(tender.clarification_deadline) }}</td></tr>
                <tr><td>Submission Deadline</td><td>{{ formatDateTime(tender.submission_deadline) }}</td></tr>
                <tr v-if="tender.evaluation_start_date">
                  <td>Evaluation Period</td>
                  <td>
                    {{ formatDateTime(tender.evaluation_start_date) }} – {{ formatDateTime(tender.evaluation_end_date) }}
                  </td>
                </tr>

                <tr>
                  <th colspan="2" class="table-primary">3. Fees & Security</th>
                </tr>
                <tr><td>Tender Fees</td><td>{{ tender.tender_fees }} TZS</td></tr>
                <tr><td>Security Type</td><td>{{ tender.tender_securing_type }}</td></tr>
                <tr v-if="tender.tender_security_percentage !== null">
                  <td>Security %</td><td>{{ tender.tender_security_percentage }}%</td>
                </tr>
                <tr v-if="tender.tender_security_amount !== null">
                  <td>Security Amount</td><td>{{ tender.tender_security_amount }} TZS</td>
                </tr>

                <tr>
                  <th colspan="2" class="table-primary">4. Agency & Contact</th>
                </tr>
                <tr><td>Agency</td><td>{{ tender.agency.name }}</td></tr>
                <tr v-if="tender.agency.phone_number"><td>Phone</td><td>{{ tender.agency.phone_number }}</td></tr>
                <tr v-if="tender.agency.email"><td>Email</td><td>{{ tender.agency.email }}</td></tr>
                <tr v-if="tender.agency.website">
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
                        {{ f.name }} – Min {{ f.minimum }} {{ f.unit }} (Complied:
                        <span :class="f.complied ? 'text-success' : 'text-danger'">
                          {{ f.complied ? 'Yes' : 'No' }}
                        </span>)
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
                        {{ t.label }} – {{ t.amount }} {{ t.currency }} (Complied:
                        <span :class="t.complied ? 'text-success' : 'text-danger'">
                          {{ t.complied ? 'Yes' : 'No' }}
                        </span>)
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
                        {{ e.get_type_display }} – {{ e.contract_count }} contracts ≥ {{ e.min_value }}
                        {{ e.currency }} (Complied:
                        <span :class="e.complied ? 'text-success' : 'text-danger'">
                          {{ e.complied ? 'Yes' : 'No' }}
                        </span>)
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
                        {{ p.role }} – Min {{ p.min_experience_yrs }} yrs (Complied:
                        <span :class="p.complied ? 'text-success' : 'text-danger'">
                          {{ p.complied ? 'Yes' : 'No' }}
                        </span>)
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
                      </li>
                    </ul>
                    <span v-else>None</span>
                  </td>
                </tr>

                <tr>
                  <th colspan="2" class="table-primary">7. Record Info</th>
                </tr>
                <tr><td>Created By</td><td>{{ tender.created_by }}</td></tr>
                <tr><td>Created At</td><td>{{ formatDateTime(tender.created_at) }}</td></tr>
                <tr><td>Last Updated</td><td>{{ formatDateTime(tender.updated_at) }}</td></tr>
              </tbody>
            </table>

            <!-- Action Buttons -->
            <div class="d-flex gap-2">
              <button class="btn btn-primary" @click="downloadPDF">
                Download Checklist PDF
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
  import { ref, computed, onMounted } from 'vue'
  import { useRoute } from 'vue-router'
  import { useAuthStore } from '@/stores/auth'
  import { api } from '@/services/authService'
  import VerticalLayout from '@/layouts/VerticalLayout.vue'

  const route = useRoute()
  const authStore = useAuthStore()
  const slug = route.params.slug
  const tender = ref(null)
  const loading = ref(false)
  const printSection = ref(null)

  const fetchTender = async () => {
    loading.value = true
    try {
      const { data } = await api.get(`tenders/tenders/${slug}/`)
      tender.value = data
    } catch (e) {
      console.error('Failed to fetch tender:', e)
    } finally {
      loading.value = false
    }
  }

  const formatDateTime = iso => {
    return iso ? new Date(iso).toLocaleString() : 'N/A'
  }

  const downloadPDF = () => {
    const content = printSection.value.innerHTML
    const original = document.body.innerHTML
    document.body.innerHTML = content
    window.print()
    document.body.innerHTML = original
    window.location.reload()
  }

  onMounted(fetchTender)
  </script>

  <style scoped>
  .list-group-item {
    border: none;
    padding-left: 0;
  }
  .badge {
    font-size: 0.9em;
  }
  </style>
