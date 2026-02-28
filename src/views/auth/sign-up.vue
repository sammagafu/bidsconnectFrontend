<template>
  <AuthLayout>
    <b-row class="justify-content-center">
      <b-col xl="5">
        <b-card no-body class="auth-card">
          <b-card-body class="px-3 py-5">
            <LogoBox customClass="mx-auto mb-4 text-center auth-logo" :smLogoHeight="30" :logoHeight="24" smLogoClass="me-1" />
            <h2 class="fw-bold text-center fs-18">Sign Up</h2>
            <p class="text-muted text-center mt-1 mb-4">Create an account</p>

            <div class="px-4">
              <b-form @submit.prevent="registerUser" class="authentication-form">
                <div v-if="error" class="mb-2 text-danger">{{ error }}</div>
                <b-form-group label="First Name" class="mb-3">
                  <b-form-input
                    v-model="form.first_name"
                    type="text"
                    placeholder="Enter your first name"
                    required
                  />
                </b-form-group>
                <b-form-group label="Last Name" class="mb-3">
                  <b-form-input
                    v-model="form.last_name"
                    type="text"
                    placeholder="Enter your last name"
                    required
                  />
                </b-form-group>
                <b-form-group label="Email" class="mb-3">
                  <b-form-input
                    v-model="form.email"
                    type="email"
                    placeholder="Enter your email"
                    required
                  />
                </b-form-group>
                <b-form-group label="Phone Number" class="mb-3">
                  <b-form-input
                    v-model="form.phone_number"
                    type="text"
                    placeholder="Enter your phone number"
                    required
                  />
                </b-form-group>
                <b-form-group label="Password" class="mb-3">
                  <div class="position-relative d-flex align-items-center">
                    <InputText
                      v-model="form.password"
                      :type="showPassword ? 'text' : 'password'"
                      class="form-control"
                      placeholder="Enter your password (must pass validators)"
                      required
                    />
                    <span class="position-absolute end-0 me-3" style="cursor: pointer;" @click="togglePassword">
                      <i :class="showPassword ? 'pi pi-eye-slash' : 'pi pi-eye'" />
                    </span>
                  </div>
                  <small class="text-muted">Min length, no common passwords (Django validators apply).</small>
                </b-form-group>
                <b-form-group label="Confirm Password" class="mb-3">
                  <div class="position-relative d-flex align-items-center">
                    <InputText
                      v-model="form.password_confirm"
                      :type="showPassword ? 'text' : 'password'"
                      class="form-control"
                      placeholder="Confirm your password"
                    />
                  </div>
                  <div v-if="passwordMismatch" class="text-danger small">Passwords do not match.</div>
                </b-form-group>
                <div class="mb-1 text-center d-grid">
                  <b-button type="submit" variant="primary" :disabled="loading || passwordMismatch">
                    {{ loading ? 'Registering...' : 'Sign Up' }}
                  </b-button>
                </div>
              </b-form>

              <p class="mt-3 text-center">
                Already have an account? <router-link :to="{ name: 'auth.sign-in' }" class="text-reset fw-bold ms-1">Sign In</router-link>
              </p>
            </div>
          </b-card-body>
        </b-card>
      </b-col>
    </b-row>
  </AuthLayout>
</template>

<script setup>
import AuthLayout from '@/layouts/AuthLayout.vue';
import LogoBox from '@/components/LogoBox.vue'; // Assuming this component exists
import { ref, computed, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { api, parseApiError } from '@/services/api';
import { useToast } from 'primevue/usetoast';
import { useAuthStore } from '@/stores/auth';
import InputText from 'primevue/inputtext';

const route = useRoute();
const router = useRouter();
const toast = useToast();
const authStore = useAuthStore();

const form = ref({
  first_name: '',
  last_name: '',
  email: '',
  phone_number: '',
  password: '',
  password_confirm: '',
  invitation_token: '',
});

const error = ref('');
const loading = ref(false);
const showPassword = ref(false);

const passwordMismatch = computed(() =>
  form.value.password_confirm.length > 0 && form.value.password !== form.value.password_confirm
);

// Check for invitation token on mount
onMounted(() => {
  const invitationToken = route.query.invitation_token;
  if (invitationToken) {
    form.value.invitation_token = invitationToken;
    // Optionally pre-fill email if provided in query or fetch from invitation
  }
});

// Toggle password visibility
const togglePassword = () => {
  showPassword.value = !showPassword.value;
};

// Register user — POST /api/v1/accounts/users/ (invitation_token in body accepts invite)
const registerUser = async () => {
  if (passwordMismatch.value) {
    error.value = 'Passwords do not match.';
    toast.add({ severity: 'error', summary: 'Validation', detail: error.value, life: 3000 });
    return;
  }

  loading.value = true;
  error.value = '';
  try {
    const payload = {
      email: form.value.email,
      password: form.value.password,
      phone_number: form.value.phone_number,
      first_name: form.value.first_name,
      last_name: form.value.last_name,
      invitation_token: form.value.invitation_token || '',
    };

    await api.post('accounts/users/', payload);

    toast.add({
      severity: 'success',
      summary: 'Success',
      detail: 'Registration successful! Please sign in.',
      life: 3000,
    });

    router.push({ name: 'auth.sign-in' });
  } catch (err) {
    error.value = parseApiError(err) || 'Registration failed.';
    toast.add({
      severity: 'error',
      summary: 'Registration failed',
      detail: error.value,
      life: 5000,
    });
  } finally {
    loading.value = false;
  }
};
</script>