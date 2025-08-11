<template>
  <b-card class="mb-4">
    <!-- Card Header: Title, Count, Create & Edit Links -->
    <template #header>
      <div class="d-flex justify-content-between align-items-center">
        <h3 class="mb-0">{{ title }} ({{ items.length }})</h3>
        <div>
          <!-- Create Link -->
          <router-link
            v-if="createRoute"
            :to="createRouteParams"
            class="btn btn-sm btn-success me-2"
          >
            <i class="bx bx-plus"></i> Create
          </router-link>
          <!-- Edit Link -->
          <router-link
            v-if="editRoute"
            :to="editRouteParams"
            class="btn btn-sm btn-outline-primary"
          >
            <i class="bx bx-pencil"></i> Edit
          </router-link>
        </div>
      </div>
    </template>

    <!-- List of Items -->
    <b-list-group flush>
      <b-list-group-item
        v-for="item in items"
        :key="item.id || item.uuid || item.year || item.source_type"
      >
        <!-- Main label -->
        {{ item[labelFn] }}

        <!-- Optional date sub-label -->
        <template v-if="subLabel">
          — {{ dateSub ? formatDate(item[subLabel]) : item[subLabel] }}
        </template>

        <!-- Optional multiple fields -->
        <template v-if="subFields">
          — 
          <span
            v-for="(f,i) in subFields.split(',')"
            :key="i"
          >
            {{ item[f] }}<span v-if="i+1<subFields.split(',').length">, </span>
          </span>
        </template>

        <!-- Link field -->
        <template v-if="linkField">
          — 
          <a
            :href="item[linkField]"
            target="_blank"
          >{{ linkText }}</a>
        </template>

        <!-- Extra link field -->
        <template v-if="extraLinkField">
          , 
          <a
            v-if="item[extraLinkField]"
            :href="item[extraLinkField]"
            target="_blank"
          >{{ extraLinkText }}</a>
        </template>
      </b-list-group-item>

      <!-- Empty state -->
      <b-list-group-item v-if="!items.length" class="text-muted">
        No {{ title.toLowerCase() }}.
      </b-list-group-item>
    </b-list-group>
  </b-card>
</template>

<script setup>
import { defineProps, computed } from 'vue'
import { RouterLink } from 'vue-router'
import { BCard, BListGroup, BListGroupItem } from 'bootstrap-vue-next'

const props = defineProps({
  title:          String,
  items:          { type: Array, default: () => [] },
  labelFn:        { type: String, default: 'id' },
  subLabel:       String,
  dateSub:        Boolean,
  subFields:      String,
  linkField:      String,
  linkText:       { type: String, default: 'View' },
  extraLinkField: String,
  extraLinkText:  String,
  createRoute:    {
    type: Object,
    default: null
    // e.g. { name: 'company.documents.create', params: { companyId: 123 } }
  },
  editRoute:      {
    type: Object,
    default: null
    // e.g. { name: 'company.documents.edit', params: { companyId: 123 } }
  }
})

// Expose computed so we can pass the full object directly to <router-link>
const createRouteParams = computed(() => props.createRoute)
const editRouteParams   = computed(() => props.editRoute)

function formatDate(d) {
  return d ? new Date(d).toLocaleDateString() : ''
}
</script>

<style scoped>
.me-2 {
  margin-right: 0.5rem;
}
.mb-4 {
  margin-bottom: 1.5rem;
}
</style>
