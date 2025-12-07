<template>
  <VerticalLayout>
    <b-row>
      <b-col md="6" xl="3" v-for="(item, idx) in statistic" :key="idx">
        <StatisticsCard :item="item" />
      </b-col>
    </b-row>

    <b-row>
      <b-col>
        <b-card no-body>
          <b-card-body class="p-0">
            <b-row class="g-0">
              <ConversionsChart />
              <PerformanceChart />
              <SessionByBrowser />
            </b-row>
          </b-card-body>
        </b-card>
      </b-col>
    </b-row>

    <b-row>
      <SessionsByCountry />
      <TopPages />
    </b-row>
  </VerticalLayout>
</template>
<script setup lang="ts">
import VerticalLayout from '@/layouts/VerticalLayout.vue';
import StatisticsCard from '@/views/dashboards/admin/components/StatisticsCard.vue';
import ConversionsChart from '@/views/dashboards/admin/components/ConversionsChart.vue';
import PerformanceChart from '@/views/dashboards/admin/components/PerformanceChart.vue';
import SessionByBrowser from '@/views/dashboards/admin/components/SessionByBrowser.vue';
import SessionsByCountry from '@/views/dashboards/admin/components/SessionsByCountry.vue';
import TopPages from '@/views/dashboards/admin/components/TopPages.vue';
import { statistic } from '@/views/dashboards/admin/components/data';
</script>