<template>
  <AuthLayout>
    <b-row class="justify-content-center">
      <b-col xl="5">
        <b-card no-body class="auth-card">
          <b-card-body class="px-3 py-5">
            <LogoBox customClass="mx-auto mb-4 text-center auth-logo" :smLogoHeight="30" :logoHeight="24" smLogoClass="me-1" />
            <h2 class="fw-bold text-center fs-18">Sign In</h2>
            <p class="text-muted text-center mt-1 mb-4">Enter your email address and password to access admin panel.</p>

            <div class="px-4">
              <b-form @submit.prevent="handleSignIn" class="authentication-form">
                <div v-if="error" class="mb-2 text-danger">{{ error }}</div>
                <b-form-group label="Email" class="mb-3">
                  <b-form-input
                    type="email"
                    id="example-email"
                    name="example-email"
                    placeholder="Enter your Email"
                    v-model="v.email.$model"
                  />
                  <div v-if="v.email.$error" class="text-danger">
                    <span v-for="(err, idx) in v.email.$errors" :key="idx">
                      {{ err.$message }}
                    </span>
                  </div>
                </b-form-group>
                <div class="mb-3">
                  <router-link :to="{ name: 'auth.reset-password' }" class="float-end text-muted text-unline-dashed ms-1">
                    Reset password
                  </router-link>
                  <label class="form-label" for="example-password">Password</label>
                  <div class="position-relative d-flex align-items-center">
                    <InputText
                      id="example-password"
                      :type="showPassword ? 'text' : 'password'"
                      class="form-control"
                      placeholder="Enter your password"
                      v-model="v.password.$model"
                    />
                    <span class="position-absolute end-0 me-3" style="cursor: pointer;" @click="togglePassword">
                      <i :class="showPassword ? 'pi pi-eye-slash' : 'pi pi-eye'" />
                    </span>
                  </div>
                  <div v-if="v.password.$errors" class="text-danger">
                    <span v-for="(err, idx) in v.password.$errors" :key="idx">
                      {{ err.$message }}
                    </span>
                  </div>
                </div>
                <div class="mb-3">
                  <b-form-checkbox id="checkbox-signin" v-model="checked">
                    Remember me
                  </b-form-checkbox>
                </div>

                <div class="mb-1 text-center d-grid">
                  <b-button variant="primary" type="submit" :disabled="loading">
                    {{ loading ? 'Signing In...' : 'Sign In' }}
                  </b-button>
                </div>
              </b-form>

              <p class="mt-3 fw-semibold no-span">OR sign with</p>

              <div class="text-center">
                <a href="javascript:void(0);" class="btn btn-light shadow-none"><i class='bx bxl-google fs-20'></i></a>{{ ' ' }}
                <a href="javascript:void(0);" class="btn btn-light shadow-none"><i class='bx bxl-facebook fs-20'></i></a>{{ ' ' }}
                <a href="javascript:void(0);" class="btn btn-light shadow-none"><i class='bx bxl-github fs-20'></i></a>
              </div>
            </div>
          </b-card-body>
        </b-card>
        <p class="mb-0 text-center">
          New here? <router-link :to="{ name: 'auth.sign-up' }" class="text-reset fw-bold ms-1">Sign Up</router-link>
        </p>
      </b-col>
    </b-row>
  </AuthLayout>
</template>

<script setup>
import AuthLayout from '@/layouts/AuthLayout.vue';
import { required, email } from '@vuelidate/validators';
import { useVuelidate } from '@vuelidate/core';
import { ref, reactive, computed } from 'vue';
import { useRouter } from 'vue-router';
import { useAuthStore } from '@/stores/auth';
import { useToast } from 'primevue/usetoast';
import InputText from 'primevue/inputtext';

const router = useRouter();
const authStore = useAuthStore();
const toast = useToast();

const credentials = reactive({
  email: '',
  password: '',
});

const vuelidateRules = computed(() => ({
  email: { required, email },
  password: { required },
}));

const v = useVuelidate(vuelidateRules, credentials);

const error = ref('');
const checked = ref(false);
const loading = ref(false);
const showPassword = ref(false);

const togglePassword = () => {
  showPassword.value = !showPassword.value;
};

const handleSignIn = async () => {
  try {
    console.log('Form submitted, validating...');
    v.value.$touch();
    if (v.value.$invalid) {
      console.log('Validation failed:', v.value.$errors);
      error.value = 'Please fill in all required fields correctly';
      toast.add({
        severity: 'error',
        summary: 'Validation Error',
        detail: 'Please fill in all required fields correctly',
        life: 3000,
      });
      return;
    }

    console.log('Validation passed, proceeding with login...');
    loading.value = true;
    error.value = '';

    await authStore.login(
      {
        email: credentials.email,
        password: credentials.password,
      },
      checked.value
    );

    console.log('Login successful, user stored in Pinia:', authStore.user);
    console.log('Is Authenticated:', authStore.isAuthenticated);

    // Add a slight delay to ensure state updates propagate
    await new Promise(resolve => setTimeout(resolve, 100));

    const redirect = router.currentRoute.value.query.redirect || { name: 'dashboards.index' };
    console.log('Redirecting to:', redirect);

    // Check if the redirect route exists
    const resolvedRoute = router.resolve(redirect);
    if (!resolvedRoute.matched.length) {
      console.error('Redirect route not found, redirecting to a fallback route');
      await router.push('/');
    } else {
      await router.push(redirect);
    }
  } catch (err) {
    console.error('Login error:', err);
    if (err.message === 'Token refresh failed') {
      toast.add({
        severity: 'error',
        summary: 'Session Expired',
        detail: 'Your session has expired. Please log in again.',
        life: 3000,
      });
      // Redirect is handled by authService.js
    } else {
      error.value = err.detail || err.message || 'Invalid credentials';
      toast.add({
        severity: 'error',
        summary: 'Login Failed',
        detail: error.value,
        life: 3000,
      });
    }
  } finally {
    loading.value = false;
  }
};
</script>

<style scoped>
/* Ensure the toggle icon aligns properly */
.position-relative {
  position: relative;
}

.position-absolute {
  top: 50%;
  transform: translateY(-50%);
}

/* Optional: Adjust input padding to accommodate the icon */
.form-control {
  padding-right: 40px; /* Space for the toggle icon */
}
</style>