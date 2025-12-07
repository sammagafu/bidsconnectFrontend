<template>
  <VerticalLayout>
    <div class="card">
      <Toolbar>
        <template #end>
          <Button label="Add Quote" icon="pi pi-plus" @click="showAddQuoteDialog = true" />
        </template>
      </Toolbar>
      <div class="flex gap-4 mb-4">
        <InputText v-model="search" placeholder="Search products..." class="w-full" />
        <Select v-model="selectedCategory" :options="categories" optionLabel="text" optionValue="value" placeholder="Select Category" class="w-64" />
      </div>
      <DataView :value="filteredProducts" :layout="layout">
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
            <div v-for="product in slotProps.items" :key="product.id">
              <div class="flex flex-col xl:flex-row xl:items-start p-6 gap-6 border-t border-surface-200 dark:border-surface-700">
                <img v-if="product.featured_image" :src="product.featured_image" class="w-9/12 sm:w-64 xl:w-40 h-24 object-cover mx-auto" />
                <div class="flex flex-col sm:flex-row justify-between items-center xl:items-start flex-1 gap-6">
                  <div class="flex flex-col items-center sm:items-start gap-4">
                    <h3 class="text-xl">{{ product.name }}</h3>
                    <p class="text-sm">{{ product.description.substring(0, 100) }}...</p>
                    <p class="text-sm">Company: {{ product.company.name }}</p>
                    <p class="text-sm">Category: {{ product.category.name }}</p>
                  </div>
                  <div class="flex sm:flex-col items-center sm:items-end gap-4 sm:gap-2">
                    <span class="text-xl" v-if="product.prices.length > 0">${{ product.prices[0].unit_price }}</span>
                    <Button label="Ask for Invoice" @click="requestInvoice(product)" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </template>
        <template #grid="slotProps">
          <div class="grid grid-cols-12 gap-4">
            <div v-for="product in slotProps.items" :key="product.id" class="col-span-12 sm:col-span-6 xl:col-span-4 p-2">
              <div class="p-6 border border-surface-200 dark:border-surface-700 bg-surface-0 dark:bg-surface-900 rounded">
                <div class="flex flex-wrap items-center justify-between gap-2">
                  <h3 class="text-lg">{{ product.name }}</h3>
                  <span class="text-sm">{{ product.category.name }}</span>
                </div>
                <div class="flex flex-col items-center gap-4 py-8">
                  <img v-if="product.featured_image" :src="product.featured_image" class="w-75% h-40 object-cover" />
                  <p class="text-sm">{{ product.description.substring(0, 50) }}...</p>
                </div>
                <div class="flex items-center justify-between">
                  <span class="text-xl" v-if="product.prices.length > 0">${{ product.prices[0].unit_price }}</span>
                  <Button label="Ask for Invoice" @click="requestInvoice(product)" />
                </div>
              </div>
            </div>
          </div>
        </template>
      </DataView>
    </div>
    <Dialog v-model:visible="showAddQuoteDialog" header="Add Quote" modal>
      <div class="field">
        <label>Title</label>
        <InputText v-model="newQuote.title" class="w-full" />
      </div>
      <div class="field">
        <label>Description</label>
        <Textarea v-model="newQuote.description" rows="3" class="w-full" />
      </div>
      <div class="field">
        <label>Category</label>
        <Select v-model="newQuote.category_id" :options="categories" optionLabel="text" optionValue="value" class="w-full" @change="updateSubcategories" />
      </div>
      <div class="field">
        <label>Subcategory</label>
        <Select v-model="newQuote.subcategory_id" :options="subcategories" optionLabel="text" optionValue="value" class="w-full" />
      </div>
      <div class="field">
        <label>Items</label>
        <div v-for="(item, index) in newQuote.items" :key="index" class="flex flex-col gap-2 mb-4 border p-4">
          <InputText v-model="item.name" placeholder="Item Name" />
          <Textarea v-model="item.description" placeholder="Description" rows="2" />
          <InputNumber v-model="item.quantity" :min="1" placeholder="Quantity" />
          <InputText v-model="item.unit" placeholder="Unit" />
          <Select v-model="item.type" :options="typeOptions" optionLabel="label" optionValue="value" placeholder="Type" />
          <FileUpload mode="basic" chooseLabel="Upload Image" :auto="true" @uploader="uploadItemImage(index, $event)" />
          <Button icon="pi pi-trash" severity="danger" @click="removeItem(index)" />
        </div>
        <Button label="Add Item" icon="pi pi-plus" @click="addItem" />
      </div>
      <Button label="Submit" @click="submitNewQuote" />
    </Dialog>
    <Dialog v-model:visible="showDialog" header="Request Invoice">
      <div class="field">
        <label>Quantity</label>
        <InputNumber v-model="quantity" :min="1" />
      </div>
      <div class="field">
        <label>Additional Details</label>
        <Textarea v-model="additionalDetails" rows="5" />
      </div>
      <Button label="Submit" @click="submitRequest" />
    </Dialog>
  </VerticalLayout>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { useToast } from 'primevue/usetoast';
import { api } from '@/services/authService';
import VerticalLayout from '@/layouts/VerticalLayout.vue';
import DataView from 'primevue/dataview';
import SelectButton from 'primevue/selectbutton';
import InputText from 'primevue/inputtext';
import Select from 'primevue/select';
import Button from 'primevue/button';
import Dialog from 'primevue/dialog';
import InputNumber from 'primevue/inputnumber';
import Textarea from 'primevue/textarea';
import Toolbar from 'primevue/toolbar';
import FileUpload from 'primevue/fileupload';

const toast = useToast();
const router = useRouter();
const route = useRoute();
const categoriesWithSubs = ref([]);
const categories = ref([]);
const subcategories = ref([]);
const products = ref([]);
const search = ref('');
const selectedCategory = ref(null);
const layout = ref('grid');
const options = ref(['list', 'grid']);
const showDialog = ref(false);
const selectedProduct = ref(null);
const quantity = ref(1);
const additionalDetails = ref('');
const showAddQuoteDialog = ref(false);
const newQuote = ref({
  title: '',
  description: '',
  category_id: null,
  subcategory_id: null,
  items: []
});
const typeOptions = ref([
  { label: 'Product', value: 'Product' },
  { label: 'Service', value: 'Service' }
]);

const filteredProducts = computed(() => {
  if (!Array.isArray(products.value)) return [];
  return products.value.filter(p => {
    return (!search.value || p.name.toLowerCase().includes(search.value.toLowerCase())) &&
           (!selectedCategory.value || p.category.id === selectedCategory.value);
  });
});

watch(() => newQuote.value.category_id, (id) => {
  const cat = categoriesWithSubs.value.find(c => c.id === id);
  subcategories.value = cat ? cat.subcategories.map(sc => ({ value: sc.id, text: sc.name })) : [];
  newQuote.value.subcategory_id = null;
});

function requestInvoice(product) {
  selectedProduct.value = product;
  quantity.value = 1;
  additionalDetails.value = '';
  showDialog.value = true;
}

async function submitRequest() {
  try {
    const data = {
      title: `Invoice Request for ${selectedProduct.value.name}`,
      description: additionalDetails.value,
      category_id: selectedProduct.value.category.id,
      subcategory_id: selectedProduct.value.subcategory,
      items: [{
        name: selectedProduct.value.name,
        description: selectedProduct.value.description,
        quantity: quantity.value,
        unit: '',
        type: selectedProduct.value.type,
      }]
    };
    await api.post('marketplaces/rfqs/', data);
    toast.add({ severity: 'success', summary: 'Success', detail: 'Invoice requested' });
    showDialog.value = false;
  } catch (err) {
    toast.add({ severity: 'error', summary: 'Error', detail: err.response?.data?.detail || 'Failed to request invoice' });
  }
}

function addItem() {
  newQuote.value.items.push({ name: '', description: '', quantity: 1, unit: '', type: null, image: null });
}

function removeItem(index) {
  newQuote.value.items.splice(index, 1);
}

function uploadItemImage(index, event) {
  newQuote.value.items[index].image = event.files[0];
}

async function submitNewQuote() {
  try {
    const formData = new FormData();
    formData.append('title', newQuote.value.title);
    formData.append('description', newQuote.value.description);
    if (newQuote.value.category_id) formData.append('category', newQuote.value.category_id);
    if (newQuote.value.subcategory_id) formData.append('subcategory', newQuote.value.subcategory_id);
    newQuote.value.items.forEach((item, index) => {
      formData.append(`items[${index}][name]`, item.name);
      formData.append(`items[${index}][description]`, item.description);
      formData.append(`items[${index}][quantity]`, item.quantity);
      formData.append(`items[${index}][unit]`, item.unit);
      formData.append(`items[${index}][type]`, item.type);
      if (item.image) formData.append(`items[${index}][image]`, item.image);
    });
    await api.post('marketplaces/rfqs/', formData, { headers: { 'Content-Type': 'multipart/form-data' } });
    toast.add({ severity: 'success', summary: 'Success', detail: 'Quote added' });
    showAddQuoteDialog.value = false;
    newQuote.value = { title: '', description: '', category_id: null, subcategory_id: null, items: [] };
  } catch (err) {
    toast.add({ severity: 'error', summary: 'Error', detail: err.response?.data?.detail || 'Failed to add quote' });
  }
}

async function fetchCategoriesWithSubcategories() {
  try {
    const res = await api.get('marketplaces/categories-with-subcategories/');
    categoriesWithSubs.value = res.data;
    categories.value = res.data.map(c => ({ value: c.id, text: c.name }));
  } catch (err) {
    toast.add({ severity: 'error', summary: 'Error', detail: err.response?.data?.detail || 'Failed to load categories' });
    if (err.response?.status === 401) {
      router.push('/login');
    }
  }
}

async function fetchProducts() {
  try {
    const res = await api.get('marketplaces/products/');
    products.value = res.data.results || [];
  } catch (err) {
    toast.add({ severity: 'error', summary: 'Error', detail: err.response?.data?.detail || 'Failed to load products' });
    if (err.response?.status === 401) {
      router.push('/login');
    }
  }
}

onMounted(() => {
  fetchCategoriesWithSubcategories();
  fetchProducts();
});
</script>

<style scoped>
.mb-4 {
  margin-bottom: 1rem !important;
}
.field {
  margin-bottom: 1rem;
}
</style>