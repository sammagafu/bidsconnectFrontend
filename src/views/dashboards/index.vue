<template>
  <VerticalLayout>
    <b-row>
      <b-col md="6" xl="3" v-for="(item, idx) in stats" :key="idx">
        <StatisticsCard :item="item" />
      </b-col>
    </b-row>

    <b-row v-if="isAdmin">
      <ConversionsChart :chartData="conversionsData" />
      <PerformanceChart :chartData="performanceData" />
      <SessionByBrowser :browserData="browserData" />
    </b-row>

    <b-row v-if="isAdmin">
      <SessionsByCountry :countryData="countryData" />
      <TopPages :pagesData="pagesData" />
    </b-row>

    <b-row v-else>
      <b-col lg="6">
        <b-card no-body class="card-height-100">
          <b-card-header class="d-flex align-items-center justify-content-between gap-2">
            <b-card-title class="flex-grow-1">Your Company's Tenders</b-card-title>
            <div>
              <a href="#" class="btn btn-sm btn-soft-primary">View All</a>
            </div>
          </b-card-header>
          <div class="table-responsive mb-0">
            <table class="table table-hover table-nowrap table-centered m-0">
              <thead class="bg-light bg-opacity-50">
                <tr>
                  <th class="text-muted py-1">Title</th>
                  <th class="text-muted py-1">Status</th>
                  <th class="text-muted py-1">Deadline</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="(item, idx) in companyTenders" :key="idx">
                  <td><a href="#" class="text-muted">{{ item.title }}</a></td>
                  <td>{{ item.status }}</td>
                  <td>{{ item.submission_deadline }}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </b-card>
      </b-col>
      <b-col lg="6">
        <b-card no-body class="card-height-100">
          <b-card-header class="d-flex align-items-center justify-content-between gap-2">
            <b-card-title class="flex-grow-1">Your Company's Bids</b-card-title>
            <div>
              <a href="#" class="btn btn-sm btn-soft-primary">View All</a>
            </div>
          </b-card-header>
          <div class="table-responsive mb-0">
            <table class="table table-hover table-nowrap table-centered m-0">
              <thead class="bg-light bg-opacity-50">
                <tr>
                  <th class="text-muted py-1">Tender</th>
                  <th class="text-muted py-1">Status</th>
                  <th class="text-muted py-1">Submitted On</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="(item, idx) in companyBids" :key="idx">
                  <td><a href="#" class="text-muted">{{ item.tender.title }}</a></td>
                  <td>{{ item.status }}</td>
                  <td>{{ item.submission_date }}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </b-card>
      </b-col>
    </b-row>

    <b-row v-else>
      <b-col lg="12">
        <b-card no-body class="card-height-100">
          <b-card-header class="d-flex align-items-center justify-content-between gap-2">
            <b-card-title class="flex-grow-1">Company Marketplace Items</b-card-title>
            <div>
              <a href="#" class="btn btn-sm btn-soft-primary">View All</a>
            </div>
          </b-card-header>
          <div class="table-responsive mb-0">
            <table class="table table-hover table-nowrap table-centered m-0">
              <thead class="bg-light bg-opacity-50">
                <tr>
                  <th class="text-muted py-1">Item Name</th>
                  <th class="text-muted py-1">Description</th>
                  <th class="text-muted py-1">Price</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="(item, idx) in marketplaceItems" :key="idx">
                  <td><a href="#" class="text-muted">{{ item.name }}</a></td>
                  <td>{{ item.description }}</td>
                  <td>{{ item.price }}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </b-card>
      </b-col>
    </b-row>
  </VerticalLayout>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { api } from '@/services/authService'
import VerticalLayout from '@/layouts/VerticalLayout.vue'
import { useToast } from 'primevue/usetoast' // If using PrimeVue toast, else replace
import { useAuthStore } from '@/stores/auth'
import StatisticsCard from '@/views/dashboards/admin/components/StatisticsCard.vue'
import ConversionsChart from '@/views/dashboards/admin/components/ConversionsChart.vue'
import PerformanceChart from '@/views/dashboards/admin/components/PerformanceChart.vue'
import SessionByBrowser from '@/views/dashboards/admin/components/SessionByBrowser.vue'
import SessionsByCountry from '@/views/dashboards/admin/components/SessionsByCountry.vue'
import TopPages from '@/views/dashboards/admin/components/TopPages.vue'

const toast = useToast()
const router = useRouter()
const authStore = useAuthStore()

const isAdmin = ref(false)
const stats = ref([])
const conversionsData = ref({}) // Adapt to ApexChart data for bids/tenders
const performanceData = ref({})
const browserData = ref([])
const countryData = ref([])
const pagesData = ref([])
const companyTenders = ref([])
const companyBids = ref([])
const marketplaceItems = ref([])

onMounted(async () => {
  try {
    if (!authStore.isAuthenticated) await authStore.initialize()
    isAdmin.value = authStore.isSuperAdmin || authStore.isStaffUser

    if (isAdmin.value) {
      const [usersRes, companiesRes, tendersRes, bidsRes, auditRes] = await Promise.all([
        api.get('accounts/users/'),
        api.get('accounts/companies/'),
        api.get('tenders/tenders/'),
        api.get('bids/'),
        api.get('accounts/audit-logs/')
      ])

      stats.value = [
        { title: 'Total Users', statistic: usersRes.data.length, icon: 'users', prefix: '', suffix: '', growth: 5 },
        { title: 'Total Companies', statistic: companiesRes.data.length, icon: 'building', prefix: '', suffix: '', growth: -2 },
        { title: 'Total Tenders', statistic: tendersRes.data.length, icon: 'file-text', prefix: '', suffix: '', growth: 10 },
        { title: 'Total Bids', statistic: bidsRes.data.length, icon: 'briefcase', prefix: '', suffix: '', growth: 3 }
      ]

      // Adapt data for components
      conversionsData.value = { /* Apex chart series for conversions, e.g., bid success rates */ }
      performanceData.value = { /* Performance over time */ }
      browserData.value = bidsRes.data.reduce((acc, b) => { /* Group by status or something */ return acc }, [])
      countryData.value = companiesRes.data.reduce((acc, c) => { /* Group by country */ return acc }, [])
      pagesData.value = tendersRes.data.map(t => ({ path: t.title, views: /* mock */ 100, avgTime: '2m', exitRate: 20, variant: 'success' }))

      marketplaceItems.value = tendersRes.data.map(t => ({ name: t.title, description: t.description, price: t.estimated_value }))
    } else {
      if (authStore.companies?.length > 0) {
        const companyId = authStore.companies[0].id
        const [dashRes, tendersRes, bidsRes] = await Promise.all([
          api.get(`accounts/companies/${companyId}/dashboard/`),
          api.get('tenders/tenders/?status=published'),
          api.get(`bids/?company_id=${companyId}`)
        ])

        stats.value = [
          { title: 'Company Users', statistic: dashRes.data.total_users, icon: 'users', prefix: '', suffix: '', growth: 0 },
          { title: 'Company Documents', statistic: dashRes.data.total_documents, icon: 'file', prefix: '', suffix: '', growth: 0 },
          { title: 'Company Experiences', statistic: dashRes.data.total_experiences, icon: 'award', prefix: '', suffix: '', growth: 0 }
        ]

        companyTenders.value = tendersRes.data.filter(t => t.agency === authStore.companies[0].name)
        companyBids.value = bidsRes.data
        marketplaceItems.value = companyTenders.value.map(t => ({ name: t.title, description: t.description, price: t.estimated_value }))
      } else {
        toast.add({ severity: 'warn', summary: 'No Company', detail: 'You are not associated with any company.' })
        router.push('/companies/create')
      }
    }
  } catch (e) {
    toast.add({ severity: 'error', summary: 'Error', detail: 'Failed to load dashboard data.' })
  }
})
</script>

<style scoped>
/* Add custom styles if needed */
</style>