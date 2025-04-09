<!-- src/views/auth/SignUp.vue -->
<template>
  <AuthLayout>
    <b-row class="justify-content-center">
      <b-col xl="5">
        <b-card no-body class="auth-card">
          <b-card-body class="px-3 py-5">
            <LogoBox customClass="mx-auto mb-4 text-center auth-logo" :smLogoHeight="30" :logoHeight="24" />
            <h2 class="fw-bold text-center fs-18">Sign Up</h2>
            <p class="text-muted text-center mt-1 mb-4">Create your account to get started.</p>

            <div class="px-4">
              <b-form @submit.prevent="handleSignUp" class="authentication-form">
                <div v-if="error.length > 0" class="mb-2 text-danger">{{ error }}</div>

                <!-- First Name -->
                <b-form-group label="First Name" class="mb-3">
                  <b-form-input
                    type="text"
                    v-model="v.first_name.$model"
                    placeholder="Enter your first name"
                  />
                  <div v-if="v.first_name.$error" class="text-danger">
                    <span v-for="(err, idx) in v.first_name.$errors" :key="idx">{{ err.$message }}</span>
                  </div>
                </b-form-group>

                <!-- Last Name -->
                <b-form-group label="Last Name" class="mb-3">
                  <b-form-input
                    type="text"
                    v-model="v.last_name.$model"
                    placeholder="Enter your last name"
                  />
                  <div v-if="v.last_name.$error" class="text-danger">
                    <span v-for="(err, idx) in v.last_name.$errors" :key="idx">{{ err.$message }}</span>
                  </div>
                </b-form-group>

                <!-- Email -->
                <b-form-group label="Email" class="mb-3">
                  <b-form-input
                    type="email"
                    v-model="v.email.$model"
                    placeholder="Enter your email"
                  />
                  <div v-if="v.email.$error" class="text-danger">
                    <span v-for="(err, idx) in v.email.$errors" :key="idx">{{ err.$message }}</span>
                  </div>
                </b-form-group>

                <!-- Phone Number -->
                <b-form-group label="Phone Number" class="mb-3">
                  <b-form-input
                    v-model="v.phone_number.$model"
                    placeholder="Enter your phone number"
                  />
                  <div v-if="v.phone_number.$error" class="text-danger">
                    <span v-for="(err, idx) in v.phone_number.$errors" :key="idx">{{ err.$message }}</span>
                  </div>
                </b-form-group>

                <!-- Password -->
                <b-form-group label="Password" class="mb-3">
                  <b-form-input
                    type="password"
                    v-model="v.password.$model"
                    placeholder="Enter your password"
                  />
                  <div v-if="v.password.$error" class="text-danger">
                    <span v-for="(err, idx) in v.password.$errors" :key="idx">{{ err.$message }}</span>
                  </div>
                </b-form-group>

                <!-- Submit Button -->
                <div class="mb-3 text-center d-grid">
                  <b-button variant="primary" type="submit" :disabled="loading">
                    {{ loading ? 'Signing Up...' : 'Sign Up' }}
                  </b-button>
                </div>
              </b-form>

              <p class="mt-3 text-center">
                Already have an account?
                <router-link :to="{ name: 'auth.sign-in' }" class="text-reset fw-bold ms-1">Sign In</router-link>
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
import LogoBox from '@/components/LogoBox.vue';
import { useVuelidate } from '@vuelidate/core';
import { required, email, minLength } from '@vuelidate/validators';
import { ref, reactive, computed } from 'vue';
import { useRouter } from 'vue-router';
import { useToast } from 'primevue/usetoast';
import { api } from '@/services/authService'; // Import the pre-configured axios instance

// Initialize router and toast
const router = useRouter();
const toast = useToast();

// Reactive credentials object
const credentials = reactive({
  first_name: '',
  last_name: '',
  email: '',
  phone_number: '',
  password: ''
});

// Validation rules
const vuelidateRules = computed(() => ({
  first_name: { required, minLength: minLength(2) },
  last_name: { required, minLength: minLength(2) },
  email: { required, email },
  phone_number: { required, minLength: minLength(10) },
  password: { required, minLength: minLength(8) }
}));

const v = useVuelidate(vuelidateRules, credentials);
const error = ref('');
const loading = ref(false);

// Handle sign-up logic
const handleSignUp = async () => {
  try {
    // Trigger validation
    v.value.$touch();
    if (v.value.$invalid) {
      error.value = 'Please fill in all required fields correctly';
      return;
    }

    loading.value = true;
    error.value = '';

    // Make API call to register user
    await api.post('accounts/users/', {
      email: credentials.email,
      phone_number: credentials.phone_number,
      password: credentials.password,
      first_name: credentials.first_name,
      last_name: credentials.last_name
    });

    // Show success message and redirect to login
    toast.success('Registration successful! Please log in.');
    router.push({ name: 'auth.sign-in' });
  } catch (error) {
    // Handle error
    error.value = error.response?.data?.detail || 'Registration failed';
    console.error('Error registering user:', error);
  } finally {
    loading.value = false;
  }
};
</script>
