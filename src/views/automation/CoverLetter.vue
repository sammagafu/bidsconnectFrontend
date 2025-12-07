<!-- CoverLetter.vue -->
<template>
  <VerticalLayout>
    <div class="card">
      <Toolbar>
        <template #end>
          <Button label="Add Cover Letter" icon="pi pi-plus" @click="showAddDialog = true" />
        </template>
      </Toolbar>
      <div class="flex gap-4 mb-4">
        <InputText v-model="search" placeholder="Search..." class="w-full" />
      </div>
      <DataView :value="filteredItems" :layout="layout">
        <template #header>
          <div class="flex justify-end">
            <SelectButton v-model="layout" :options="options" :allowEmpty="false">
              <template #option="{ option }">
                <i :class="[option === 'list' ? 'pi pi-bars' : 'pi pi-table']" />
              </template>
            </SelectButton>
          </div>
        </template>
        <template #list="slotProps">
          <div class="flex flex-col">
            <div v-for="item in slotProps.items" :key="item.id">
              <div class="flex flex-col xl:flex-row xl:items-start p-6 gap-6 border-t border-surface-200 dark:border-surface-700">
                <div class="flex flex-col sm:flex-row justify-between items-center xl:items-start flex-1 gap-6">
                  <div class="flex flex-col items-center sm:items-start gap-4">
                    <h3 class="text-xl">{{ item.reference_no }}</h3>
                    <p class="text-sm">{{ item.company_description.substring(0, 100) }}...</p>
                    <p class="text-sm">Date: {{ item.date }}</p>
                  </div>
                  <div class="flex sm:flex-col items-center sm:items-end gap-4 sm:gap-2">
                    <Button label="Generate PDF" @click="generatePDF(item)" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </template>
        <template #grid="slotProps">
          <div class="grid grid-cols-12 gap-4">
            <div v-for="item in slotProps.items" :key="item.id" class="col-span-12 sm:col-span-6 xl:col-span-4 p-2">
              <div class="p-6 border border-surface-200 dark:border-surface-700 bg-surface-0 dark:bg-surface-900 rounded">
                <div class="flex flex-wrap items-center justify-between gap-2">
                  <h3 class="text-lg">{{ item.reference_no }}</h3>
                </div>
                <div class="flex flex-col items-center gap-4 py-8">
                  <p class="text-sm">{{ item.company_description.substring(0, 50) }}...</p>
                  <p class="text-sm">Date: {{ item.date }}</p>
                </div>
                <div class="flex items-center justify-between">
                  <Button label="Generate PDF" @click="generatePDF(item)" />
                </div>
              </div>
            </div>
          </div>
        </template>
      </DataView>
    </div>
    <Dialog v-model:visible="showAddDialog" header="Add Cover Letter" modal :style="{ width: '50vw' }">
      <div class="p-fluid">
        <div class="p-field">
          <label for="date">Date</label>
          <DatePicker id="date" v-model="newItem.date" showIcon class="w-full" fluid/>
        </div>
        <div class="p-field">
          <label for="recipient_title">Recipient Title</label>
          <InputText id="recipient_title" v-model="newItem.recipient_title" class="w-full" fluid/>
        </div>
        <div class="p-field">
          <label for="recipient_name">Recipient Name</label>
          <InputText id="recipient_name" v-model="newItem.recipient_name" class="w-full" fluid/>
        </div>
        <div class="p-field">
          <label for="recipient_address">Recipient Address</label>
          <Textarea id="recipient_address" v-model="newItem.recipient_address" rows="3" class="w-full" fluid/>
        </div>
        <div class="p-field">
          <label for="reference_no">Reference No</label>
          <InputText id="reference_no" v-model="newItem.reference_no" class="w-full" fluid/>
        </div>
        <div class="p-field">
          <label for="company_description">Company Description</label>
          <Textarea id="company_description" v-model="newItem.company_description" rows="3" class="w-full" fluid/>
        </div>
        <div class="p-field">
          <label for="attached_docs_list">Attached Docs List</label>
          <Textarea id="attached_docs_list" v-model="newItem.attached_docs_list" rows="3" class="w-full" fluid/>
        </div>
        <div class="p-field">
          <label for="compliance_certs">Compliance Certs</label>
          <Textarea id="compliance_certs" v-model="newItem.compliance_certs" rows="3" class="w-full" fluid/>
        </div>
        <div class="p-field">
          <label for="agency_dealership">Agency Dealership</label>
          <Textarea id="agency_dealership" v-model="newItem.agency_dealership" rows="3" class="w-full" fluid/>
        </div>
        <div class="p-field">
          <label for="lease_agreement">Lease Agreement</label>
          <Textarea id="lease_agreement" v-model="newItem.lease_agreement" rows="3" class="w-full" fluid/>
        </div>
        <div class="p-field">
          <label for="litigation_decl">Litigation Decl</label>
          <Textarea id="litigation_decl" v-model="newItem.litigation_decl" rows="3" class="w-full" fluid/>
        </div>
        <div class="p-field">
          <label for="similar_performance">Similar Performance</label>
          <Textarea id="similar_performance" v-model="newItem.similar_performance" rows="3" class="w-full" fluid/>
        </div>
        <div class="p-field">
          <label for="financial_info">Financial Info</label>
          <Textarea id="financial_info" v-model="newItem.financial_info" rows="3" class="w-full" fluid/>
        </div>
        <div class="p-field">
          <label for="physical_address">Physical Address</label>
          <Textarea id="physical_address" v-model="newItem.physical_address" rows="3" class="w-full" fluid/>
        </div>
        <div class="p-field">
          <label for="contact_person">Contact Person</label>
          <InputText id="contact_person" v-model="newItem.contact_person" class="w-full" fluid/>
        </div>
        <div class="p-field">
          <label for="contact_position">Contact Position</label>
          <InputText id="contact_position" v-model="newItem.contact_position" class="w-full" fluid/>
        </div>
        <div class="p-field">
          <label for="contact_mobile">Contact Mobile</label>
          <InputText id="contact_mobile" v-model="newItem.contact_mobile" class="w-full" fluid/>
        </div>
        <div class="p-field">
          <label for="contact_email">Contact Email</label>
          <InputText id="contact_email" v-model="newItem.contact_email" class="w-full" fluid/>
        </div>
        <div class="p-field">
          <label for="bank_name">Bank Name</label>
          <InputText id="bank_name" v-model="newItem.bank_name" class="w-full" fluid/>
        </div>
        <div class="p-field">
          <label for="branch_name">Branch Name</label>
          <InputText id="branch_name" v-model="newItem.branch_name" class="w-full" fluid/>
        </div>
        <div class="p-field">
          <label for="account_name">Account Name</label>
          <InputText id="account_name" v-model="newItem.account_name" class="w-full"fluid />
        </div>
        <div class="p-field">
          <label for="city">City</label>
          <InputText id="city" v-model="newItem.city" class="w-full" fluid/>
        </div>
        <div class="p-field">
          <label for="country">Country</label>
          <InputText id="country" v-model="newItem.country" class="w-full" fluid/>
        </div>
        <div class="p-field">
          <label for="account_type">Account Type</label>
          <InputText id="account_type" v-model="newItem.account_type" class="w-full" fluid/>
        </div>
        <div class="p-field">
          <label for="account_number">Account Number</label>
          <InputText id="account_number" v-model="newItem.account_number" class="w-full" fluid/>
        </div>
        <div class="p-field">
          <label for="swift_code">Swift Code</label>
          <InputText id="swift_code" v-model="newItem.swift_code" class="w-full" fluid/>
        </div>
      </div>
      <Button label="Submit" @click="submitNew" />
    </Dialog>
  </VerticalLayout>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { useToast } from 'primevue/usetoast';
import { api } from '@/services/authService';
import VerticalLayout from '@/layouts/VerticalLayout.vue';
import DataView from 'primevue/dataview';
import SelectButton from 'primevue/selectbutton';
import InputText from 'primevue/inputtext';
import Button from 'primevue/button';
import Dialog from 'primevue/dialog';
import Textarea from 'primevue/textarea';
import Toolbar from 'primevue/toolbar';
import DatePicker from 'primevue/datepicker';

const toast = useToast();
const items = ref([]);
const search = ref('');
const layout = ref('grid');
const options = ref(['list', 'grid']);
const showAddDialog = ref(false);
const newItem = ref({
  date: null,
  recipient_title: '',
  recipient_name: '',
  recipient_address: '',
  reference_no: '',
  company_description: '',
  attached_docs_list: '',
  compliance_certs: '',
  agency_dealership: '',
  lease_agreement: '',
  litigation_decl: '',
  similar_performance: '',
  financial_info: '',
  physical_address: '',
  contact_person: '',
  contact_position: '',
  contact_mobile: '',
  contact_email: '',
  bank_name: '',
  branch_name: '',
  account_name: '',
  city: '',
  country: '',
  account_type: '',
  account_number: '',
  swift_code: ''
});

const filteredItems = computed(() => {
  if (!Array.isArray(items.value)) return [];
  return items.value.filter(i => {
    return (!search.value || i.reference_no.toLowerCase().includes(search.value.toLowerCase()));
  });
});

async function fetchItems() {
  try {
    const res = await api.get('automation/cover-letter/');
    items.value = res.data;
  } catch (err) {
    toast.add({ severity: 'error', summary: 'Error', detail: 'Failed to load' });
  }
}

async function submitNew() {
  try {
    if (newItem.value.date instanceof Date) {
      newItem.value.date = newItem.value.date.toISOString().split('T')[0];
    }
    const res = await api.post('automation/cover-letter/', newItem.value);
    items.value.push(res.data);
    toast.add({ severity: 'success', summary: 'Success', detail: 'Added' });
    showAddDialog.value = false;
    newItem.value = { date: null, recipient_title: '', recipient_name: '', recipient_address: '', reference_no: '', company_description: '', attached_docs_list: '', compliance_certs: '', agency_dealership: '', lease_agreement: '', litigation_decl: '', similar_performance: '', financial_info: '', physical_address: '', contact_person: '', contact_position: '', contact_mobile: '', contact_email: '', bank_name: '', branch_name: '', account_name: '', city: '', country: '', account_type: '', account_number: '', swift_code: '' };
  } catch (err) {
    toast.add({ severity: 'error', summary: 'Error', detail: 'Failed to add' });
  }
}

function generatePDF(item) {
  api.get(`automation/cover-letter/${item.id}/`, { responseType: 'blob' }).then(response => {
    const blob = new Blob([response.data], { type: 'application/pdf' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = 'cover_letter.pdf';
    link.click();
    URL.revokeObjectURL(link.href);
  }).catch(err => {
    toast.add({ severity: 'error', summary: 'Error', detail: 'Failed to generate PDF' });
  });
}

onMounted(fetchItems);
</script>

<style scoped>
.mb-4 { margin-bottom: 1rem !important; }
.p-field { margin-bottom: 1.5rem; padding: 0.5rem; }
.p-field label { display: block; margin-bottom: 0.5rem; }
</style>