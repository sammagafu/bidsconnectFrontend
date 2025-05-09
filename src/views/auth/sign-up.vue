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
                      placeholder="Enter your password"
                      required
                    />
                    <span class="position-absolute end-0 me-3" style="cursor: pointer;" @click="togglePassword">
                      <i :class="showPassword ? 'pi pi-eye-slash' : 'pi pi-eye'" />
                    </span>
                  </div>
                </b-form-group>
                <div class="mb-1 text-center d-grid">
                  <b-button type="submit" variant="primary" :disabled="loading">
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
import { ref, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { api } from '@/services/authService';
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
  invitation_token: '',
});

const error = ref('');
const loading = ref(false);
const showPassword = ref(false);

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

// Register user and accept invitation if token is provided
const registerUser = async () => {
  loading.value = true;
  error.value = '';
  try {
    // Register the user using Djoser's endpoint
    const payload = {
      first_name: form.value.first_name,
      last_name: form.value.last_name,
      email: form.value.email,
      phone_number: form.value.phone_number,
      password: form.value.password,
    };

    // If there's an invitation token, include it in the payload
    if (form.value.invitation_token) {
      payload.invitation_token = form.value.invitation_token;
    }

    // Register the user (Djoser's endpoint, likely /api/v1/users/)
    await api.post('accounts/users/', payload);

    toast.add({
      severity: 'success',
      summary: 'Success',
      detail: 'Registration successful! Please log in.',
      life: 3000,
    });

    // If there was an invitation token, accept the invitation
    if (form.value.invitation_token) {
      await api.post(`accept-invitation/${form.value.invitation_token}/`);
      toast.add({
        severity: 'success',
        summary: 'Success',
        detail: 'Invitation accepted successfully!',
        life: 3000,
      });
    }

    // Redirect to login page
    router.push('/auth/sign-in');
  } catch (error) {
    console.error('Registration failed:', error);
    const errorDetail = error.response?.data || { message: 'Registration failed' };
    error.value = errorDetail.message || 'Registration failed';
    toast.add({
      severity: 'error',
      summary: 'Error',
      detail: error.value,
      life: 3000,
    });
  } finally {
    loading.value = false;
  }
};
</script>


<!-- TODO add add password confirmation -->