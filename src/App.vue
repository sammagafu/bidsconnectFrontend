<template>
  <RouterView />
  <!-- Show create-company modal after login when user has no company (global, works on any route) -->
  <CompanyCreationModal />
</template>

<script setup lang="ts">
import { RouterView } from 'vue-router';
import { useLayoutStore } from '@/stores/layout';
import { onMounted } from 'vue';
import CompanyCreationModal from '@/components/CompanyCreationModal.vue';

onMounted(() => {
  useLayoutStore().init();
});
</script>