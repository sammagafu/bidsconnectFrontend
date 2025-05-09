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
    <p>
      It looks like you don’t have any companies yet. Let’s get started by creating your first one!
    </p>
    <div class="d-flex justify-content-start my-4 gap-3">
      <Button
        label="Create Company Now"
        class="p-button-primary p-button-lg"
        @click="goToCompanyCreation"
        aria-label="Create a company now"
      />
      <Button
        label="Maybe Later"
        class="p-button-outlined p-button-secondary p-button-lg"
        @click="dismissModal"
        aria-label="Dismiss company creation for now"
      />
    </div>
  </Dialog>
</template>

<script setup>
import { ref, watch } from 'vue';
import { useRouter } from 'vue-router';
import { useAuthStore } from '@/stores/auth';

// Constants for sessionStorage key
const DISMISSED_MODAL_KEY = 'dismissedCompanyModal';

const router = useRouter();
const authStore = useAuthStore();
const showModal = ref(false);

// Check if the modal was dismissed in this session
const isModalDismissed = () => {
  return sessionStorage.getItem(DISMISSED_MODAL_KEY) === 'true';
};

// Watch auth store conditions and sessionStorage
watch(
  () => authStore.shouldShowCompanyModal(),
  (shouldShow) => {
    // Only show the modal if it should be shown AND it hasn't been dismissed in this session
    showModal.value = shouldShow && !isModalDismissed();
  },
  { immediate: true }
);

const goToCompanyCreation = () => {
  showModal.value = false;
  router.push({ name: 'user.create-company' });
};

const dismissModal = () => {
  // Set the flag in sessionStorage to prevent showing the modal again in this session
  sessionStorage.setItem(DISMISSED_MODAL_KEY, 'true');
  showModal.value = false;
};
</script>

<style scoped>
/* Fallback for Bootstrap 4 or if gap is not sufficient */
.company-creation-modal .d-flex {
  gap: 1.5rem; /* 24px spacing between buttons */
}

/* Ensure buttons are centered and balanced */
.company-creation-modal .btn-lg {
  min-width: 200px; /* Consistent width for buttons */
}

/* Responsive design for smaller screens */
@media (max-width: 576px) {
  .company-creation-modal .d-flex {
    flex-direction: column;
    gap: 1rem;
  }
  .company-creation-modal .btn-lg {
    width: 100%;
  }
}
</style>