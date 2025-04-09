<!-- src/components/CompanyCreationModal.vue -->
<template>
    <Dialog
      v-model:visible="showModal"
      header="Welcome! Create Your First Company"
      :style="{ width: '50vw' }"
      :modal="true"
      :closable="false"
      :draggable="false"
      :dismissableMask="false"
      class="company-creation-modal"
    >
      <p class="">
        It looks like you don’t have any companies yet. Let’s get started by creating your first one!
      </p>
      <div class="flex justify-content-center my-4 gap-4">
        <Button
          label="Create Company Now"
          class="p-button-primary p-button-lg"
          @click="goToCompanyCreation"
        />
        <Button
          label="Maybe Later"
          class="p-button-outlined p-button-secondary p-button-lg"
          @click="closeModal"
        />
      </div>
    </Dialog>
  </template>
  
  <script setup>
  import { ref, watch } from 'vue';
  import { useRouter } from 'vue-router';
  import { useAuthStore } from '@/stores/auth';
  
  const router = useRouter();
  const authStore = useAuthStore();
  const showModal = ref(false);
  
  // Watch auth store conditions
  watch(
    () => authStore.shouldShowCompanyModal(),
    (shouldShow) => {
      showModal.value = shouldShow;
    },
    { immediate: true }
  );
  
  const goToCompanyCreation = () => {
    showModal.value = false;
    router.push({ name: 'user.create-company' });
  };
  
  const closeModal = () => {
    showModal.value = false;
  };
  </script>
  