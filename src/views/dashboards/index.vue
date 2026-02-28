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
              <thead class="bg-body-tertiary">
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
              <thead class="bg-body-tertiary">
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
              <thead class="bg-body-tertiary">
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
import { api, companiesService, tendersService, bidsService, parseApiError } from '@/services'
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
const stats = ref<any[]>([])
const conversionsData = ref<any>({}) // Adapt to ApexChart data for bids/tenders
const performanceData = ref<any>({})
const browserData = ref<any[]>([])
const countryData = ref<any[]>([])
const pagesData = ref<any[]>([])
const companyTenders = ref<any[]>([])
const companyBids = ref<any[]>([])
const marketplaceItems = ref<any[]>([])

onMounted(async () => {
  try {
    if (!authStore.isAuthenticated) await authStore.initialize()
    isAdmin.value = authStore.isSuperAdmin || authStore.isStaffUser

    if (isAdmin.value) {
      const [usersRes, companiesData, tendersData, bidsData, auditRes] = await Promise.all([
        api.get('accounts/users/'),
        companiesService.list(),
        tendersService.list(),
        bidsService.list(),
        api.get('accounts/audit-logs/')
      ])

      const companiesList = Array.isArray(companiesData) ? companiesData : companiesData?.results ?? []
      const tendersList = Array.isArray(tendersData) ? tendersData : tendersData?.results ?? []
      const bidsList = Array.isArray(bidsData) ? bidsData : bidsData?.results ?? []

      stats.value = [
        { title: 'Total Users', statistic: usersRes.data?.length ?? 0, icon: 'users', prefix: '', suffix: '', growth: 5 },
        { title: 'Total Companies', statistic: companiesList.length, icon: 'building', prefix: '', suffix: '', growth: -2 },
        { title: 'Total Tenders', statistic: tendersList.length, icon: 'file-text', prefix: '', suffix: '', growth: 10 },
        { title: 'Total Bids', statistic: bidsList.length, icon: 'briefcase', prefix: '', suffix: '', growth: 3 }
      ]

      conversionsData.value = {}
      performanceData.value = {}
      browserData.value = bidsList.reduce((acc: any[], _b: any) => acc, [])
      countryData.value = companiesList.reduce((acc: any[], _c: any) => acc, [])
      pagesData.value = tendersList.map((t: any) => ({ path: t.title, views: 100, avgTime: '2m', exitRate: 20, variant: 'success' }))

      marketplaceItems.value = tendersList.map((t: any) => ({ name: t.title, description: t.description, price: t.estimated_value }))
    } else {
      if (authStore.companies?.length > 0) {
        const companyId = authStore.companies[0].id
        const [dashRes, tendersData, bidsData] = await Promise.all([
          api.get(`accounts/companies/${companyId}/dashboard/`),
          tendersService.list({ status: 'published' }),
          bidsService.listByCompany(companyId)
        ])

        const tendersList = Array.isArray(tendersData) ? tendersData : tendersData?.results ?? []
        const bidsList = Array.isArray(bidsData) ? bidsData : bidsData?.results ?? []

        stats.value = [
          { title: 'Company Users', statistic: dashRes.data?.total_users ?? 0, icon: 'users', prefix: '', suffix: '', growth: 0 },
          { title: 'Company Documents', statistic: dashRes.data?.total_documents ?? 0, icon: 'file', prefix: '', suffix: '', growth: 0 },
          { title: 'Company Experiences', statistic: dashRes.data?.total_experiences ?? 0, icon: 'award', prefix: '', suffix: '', growth: 0 }
        ]

        companyTenders.value = tendersList.filter((t: any) => t.agency === authStore.companies[0].name)
        companyBids.value = bidsList
        marketplaceItems.value = companyTenders.value.map((t: any) => ({ name: t.title, description: t.description, price: t.estimated_value }))
      } else {
        toast.add({ severity: 'warn', summary: 'No Company', detail: 'You are not associated with any company.' })
        router.push('/companies/create')
      }
    }
  } catch (e) {
    toast.add({ severity: 'error', summary: 'Error', detail: parseApiError(e) || 'Failed to load dashboard data.' })
  }
})
</script>

<style scoped>
/* Add custom styles if needed */
</style>