<!-- <template>
  <AuthLayout>
    <b-row class="justify-content-center">
      <b-col xl="5">
        <b-card no-body class="auth-card">
          <b-card-body class="px-3 py-5">
            <LogoBox customClass="mx-auto mb-4 text-center auth-logo" :smLogoHeight="30" :logoHeight="24" smLogoClass="me-1" />
            <h2 class="fw-bold text-center fs-18">Sign Up</h2>
            <p class="text-muted text-center mt-1 mb-4">New to our platform? Sign up now! It only takes a minute.</p>
            <div class="px-4">
              <b-form action="/" class="authentication-form">
                <b-form-group label="Name" class="mb-3">
                  <b-form-input type="text" id="example-name" placeholder="Enter your name" />
                </b-form-group>

                <b-form-group label="Email" class="mb-3">
                  <b-form-input type="email" id="example-email" placeholder="Enter your email" />
                </b-form-group>

                <b-form-group label="Password" class="mb-3">
                  <b-form-input type="password" id="example-password" name="password"
                    placeholder="Enter your password" />
                </b-form-group>
                <div class="mb-3">
                  <b-form-checkbox>I accept Terms and Condition</b-form-checkbox>
                </div>

                <div class="mb-1 text-center d-grid">
                  <b-button variant="primary" type="submit">Sign Up</b-button>
                </div>
              </b-form>
              <p class="mt-3 fw-semibold no-span">OR sign with</p>

              <div class="text-center">
                <a href="javascript:void(0);" class="btn btn-light shadow-none"><i
                    class='bx bxl-google fs-20'></i></a>{{ ' ' }}
                <a href="javascript:void(0);" class="btn btn-light shadow-none"><i
                    class='bx bxl-facebook fs-20'></i></a>{{ ' ' }}
                <a href="javascript:void(0);" class="btn btn-light shadow-none"><i class='bx bxl-github fs-20'></i></a>
              </div>
            </div>
          </b-card-body>
        </b-card>

        <p class="mb-0 text-center">I already have an account
          <router-link :to="{ name: 'auth.sign-in' }" class="text-reset fw-bold ms-1">Sign In</router-link>
        </p>
      </b-col>
    </b-row>
  </AuthLayout>
</template>

<script setup lang="ts">
import AuthLayout from '@/layouts/AuthLayout.vue';
</script> -->

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

                <b-form-group label="Phone Number" class="mb-3">
                  <b-form-input
                    v-model="v.phone_number.$model"
                    placeholder="Enter your phone number"
                  />
                  <div v-if="v.phone_number.$error" class="text-danger">
                    <span v-for="(err, idx) in v.phone_number.$errors" :key="idx">{{ err.$message }}</span>
                  </div>
                </b-form-group>

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
import { useAuthStore } from '@/stores/auth';
import { useToast } from 'primevue/usetoast';

const router = useRouter();
const authStore = useAuthStore();
const toast = useToast();

const credentials = reactive({
  email: '',
  phone_number: '',
  password: ''
});

const vuelidateRules = computed(() => ({
  email: { required, email },
  phone_number: { required, minLength: minLength(10) },
  password: { required, minLength: minLength(8) }
}));

const v = useVuelidate(vuelidateRules, credentials);
const error = ref('');
const loading = ref(false);

const handleSignUp = async () => {
  try {
    v.value.$touch();
    if (v.value.$invalid) {
      error.value = 'Please fill in all required fields correctly';
      return;
    }

    loading.value = true;
    error.value = '';

    await authStore.register({
      email: credentials.email,
      phone_number: credentials.phone_number,
      password: credentials.password
    });

    // Show notification about no company
    toast.info('Welcome! You currently have no companies. Create one to get started.', {
      timeout: 5000
    });

    await router.push({ name: 'company.create' });
  } catch (err) {
    error.value = err.message || 'Registration failed';
  } finally {
    loading.value = false;
  }
};
</script>