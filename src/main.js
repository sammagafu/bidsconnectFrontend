import { createApp } from 'vue';
import { createPinia } from 'pinia';
import App from './App.vue';
import router from './router';
import axios from 'axios';
import VueAxios from 'vue-axios';
import { createBootstrap } from 'bootstrap-vue-next';
import VueApexCharts from 'vue3-apexcharts';
import authService from '@/services/authService'; // Add this

// PrimeVue
import PrimeVue from 'primevue/config';
import Aura from '@primeuix/themes/aura';

// PrimeVue Components
import DataTable from 'primevue/datatable';
import Column from 'primevue/column';
import InputText from 'primevue/inputtext';
import IconField from 'primevue/iconfield';
import InputIcon from 'primevue/inputicon';
import Select from 'primevue/select'; // Use Select instead of Dropdown
import Tag from 'primevue/tag';
import Checkbox from 'primevue/checkbox';

import moment from 'moment';

window.moment = moment;

import 'simplebar';
import 'swiper/css';
import 'swiper/css/scrollbar';
import 'swiper/css/navigation';
import 'swiper/css/pagination';
import 'swiper/css/effect-fade';
import 'swiper/css/effect-flip';
import 'swiper/css/effect-creative';
import 'dropzone/src/dropzone.scss';
import 'flatpickr/dist/flatpickr.css';
import 'apexcharts/dist/apexcharts.css';
import 'nouislider/dist/nouislider.css';
import 'gridjs/dist/theme/mermaid.min.css';
import 'choices.js/src/styles/choices.scss';
import '@vueup/vue-quill/dist/vue-quill.snow.css';
import '@vueup/vue-quill/dist/vue-quill.bubble.css';
import ToastService from 'primevue/toastservice';
import 'bootstrap-vue-next/dist/bootstrap-vue-next.css';
import '@/assets/scss/app.scss';
import '@/assets/scss/icons.scss';

const app = createApp(App);

app.use(createPinia());
app.use(router);
app.use(createBootstrap());
app.use(VueApexCharts);
app.use(VueAxios, axios);
app.use(ToastService); // Register ToastService
app.use(PrimeVue, {
  theme: {
    preset: Aura
  }
});

// Register PrimeVue components
app.component('DataTable', DataTable);
app.component('Column', Column);
app.component('InputText', InputText);
app.component('IconField', IconField);
app.component('InputIcon', InputIcon);
app.component('Select', Select); // Register Select directly
app.component('Tag', Tag);
app.component('Checkbox', Checkbox);

authService.initializeAuth(); // Initialize auth before mounting

app.mount('#app');