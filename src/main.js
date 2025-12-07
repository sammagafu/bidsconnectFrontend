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
import Button from 'primevue/button';
import Dialog from 'primevue/dialog';
import MultiSelect from 'primevue/multiselect';
import Toast from 'primevue/toast';
import Toolbar from 'primevue/toolbar';
import Textarea from 'primevue/textarea';
import InputNumber from 'primevue/inputnumber';
import Tooltip from 'primevue/tooltip';
import Chip from 'primevue/chip';
import DataView from 'primevue/dataview';
// Stepper components
import Stepper from 'primevue/stepper';
import StepList from 'primevue/steplist';
import Step from 'primevue/step';
import StepPanels from 'primevue/steppanels';
import StepPanel from 'primevue/steppanel';
import Divider from 'primevue/divider';
import FileUpload from 'primevue/fileupload';
import Calendar from 'primevue/calendar'; // Add Calendar
import Chips from 'primevue/chips'; // Add Chips

import moment from 'moment';

window.moment = moment;

// Import styles
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
import 'bootstrap-vue-next/dist/bootstrap-vue-next.css';
import '@/assets/scss/app.scss';
import '@/assets/scss/icons.scss';
import Chart from 'primevue/chart';
import 'primeicons/primeicons.css';
import ToastService from 'primevue/toastservice';

const app = createApp(App);

app.use(createPinia());
app.use(router);
app.use(createBootstrap());
app.use(VueApexCharts);
app.use(VueAxios, axios);
app.use(ToastService); // Register ToastService
app.use(PrimeVue, {
  theme: {
    preset: Aura,
  },
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
app.component('Button', Button);
app.component('Dialog', Dialog);
app.component('MultiSelect', MultiSelect);
app.component('Toast', Toast);
app.component('Toolbar', Toolbar);
app.component('Textarea', Textarea);
app.component('InputNumber', InputNumber);
app.directive('tooltip', Tooltip);
app.component('Chip', Chip);
app.component('DataView', DataView);
app.component('Stepper', Stepper);
app.component('StepList', StepList);
app.component('Step', Step);
app.component('StepPanels', StepPanels);
app.component('StepPanel', StepPanel);
app.component('Divider', Divider);
app.component('FileUpload', FileUpload);
app.component('Calendar', Calendar); // Register Calendar
app.component('Chips', Chips); // Register Chips
app.component('Chart', Chart);

authService.initializeAuth(); // Initialize auth before mounting

app.mount('#app');