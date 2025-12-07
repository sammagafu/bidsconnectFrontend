<!-- PowerOfAttorney.vue -->
<template>
  <VerticalLayout>
    <div class="card">
      <Toolbar>
        <template #end>
          <Button label="Add Power of Attorney" icon="pi pi-plus" @click="showAddDialog = true" />
        </template>
      </Toolbar>
      <div class="flex gap-4 mb-4">
        <InputText v-model="search" placeholder="Search..." fluid />
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
                    <h3 class="text-xl">{{ item.company_name }}</h3>
                    <p class="text-sm">Tender No: {{ item.tender_no }}</p>
                    <p class="text-sm">{{ item.tender_description.substring(0, 100) }}...</p>
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
                  <h3 class="text-lg">{{ item.company_name }}</h3>
                </div>
                <div class="flex flex-col items-center gap-4 py-8">
                  <p class="text-sm">Tender No: {{ item.tender_no }}</p>
                  <p class="text-sm">{{ item.tender_description.substring(0, 50) }}...</p>
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
    <Dialog v-model:visible="showAddDialog" header="Add Power of Attorney" modal :style="{ width: '50vw' }">
      <div class="p-fluid">
        <div class="p-field">
          <label for="company_name">Company Name</label>
          <InputText id="company_name" v-model="newItem.company_name" fluid />
        </div>
        <div class="p-field">
          <label for="address">Address</label>
          <Textarea id="address" v-model="newItem.address" rows="3" fluid />
        </div>
        <div class="p-field">
          <label for="po_box">PO Box</label>
          <InputText id="po_box" v-model="newItem.po_box" fluid />
        </div>
        <div class="p-field">
          <label for="attorney_name">Attorney Name</label>
          <InputText id="attorney_name" v-model="newItem.attorney_name" fluid />
        </div>
        <div class="p-field">
          <label for="attorney_address">Attorney Address</label>
          <Textarea id="attorney_address" v-model="newItem.attorney_address" rows="3" fluid />
        </div>
        <div class="p-field">
          <label for="tender_no">Tender No</label>
          <InputText id="tender_no" v-model="newItem.tender_no" fluid />
        </div>
        <div class="p-field">
          <label for="tender_description">Tender Description</label>
          <Textarea id="tender_description" v-model="newItem.tender_description" rows="3" fluid />
        </div>
        <div class="p-field">
          <label for="date">Date</label>
          <DatePicker id="date" v-model="newItem.date" showIcon fluid />
        </div>
        <div class="p-field">
          <label for="board_resolution_no">Board Resolution No</label>
          <InputText id="board_resolution_no" v-model="newItem.board_resolution_no" fluid />
        </div>
        <div class="p-field">
          <label for="board_resolution_year">Board Resolution Year</label>
          <InputNumber id="board_resolution_year" v-model="newItem.board_resolution_year" fluid />
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
import InputNumber from 'primevue/inputnumber';

const toast = useToast();
const items = ref([]);
const search = ref('');
const layout = ref('grid');
const options = ref(['list', 'grid']);
const showAddDialog = ref(false);
const newItem = ref({
  company_name: '',
  address: '',
  po_box: '',
  attorney_name: '',
  attorney_address: '',
  tender_no: '',
  tender_description: '',
  date: null,
  board_resolution_no: '',
  board_resolution_year: null
});

const filteredItems = computed(() => {
  if (!Array.isArray(items.value)) return [];
  return items.value.filter(i => {
    return (!search.value || i.company_name.toLowerCase().includes(search.value.toLowerCase()) || i.tender_no.toLowerCase().includes(search.value.toLowerCase()));
  });
});

async function fetchItems() {
  try {
    const res = await api.get('automation/power-of-attorney/');
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
    const res = await api.post('automation/power-of-attorney/', newItem.value);
    items.value.push(res.data);
    toast.add({ severity: 'success', summary: 'Success', detail: 'Added' });
    showAddDialog.value = false;
    newItem.value = { company_name: '', address: '', po_box: '', attorney_name: '', attorney_address: '', tender_no: '', tender_description: '', date: null, board_resolution_no: '', board_resolution_year: null };
  } catch (err) {
    toast.add({ severity: 'error', summary: 'Error', detail: 'Failed to add' });
  }
}

function generatePDF(item) {
  api.get(`automation/power-of-attorney/${item.id}/`, { responseType: 'blob' }).then(response => {
    const blob = new Blob([response.data], { type: 'application/pdf' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = 'power_of_attorney.pdf';
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