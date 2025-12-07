<template>
  <VerticalLayout>
    <div class="card">
      <div class="flex gap-4 mb-4 p-2">
        <InputText v-model="search" placeholder="Search products..." class="w-full m-2" />
        <Dropdown v-model="selectedCategory" :options="categories" optionLabel="text" optionValue="value" placeholder="Select Category" class="w-64 m-2" />
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
                    <Button icon="pi pi-shopping-cart" rounded />
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
                  <Button icon="pi pi-shopping-cart" rounded />
                </div>
              </div>
            </div>
          </div>
        </template>
      </DataView>
    </div>
  </VerticalLayout>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { useToast } from 'primevue/usetoast';
import { api } from '@/services/authService';
import VerticalLayout from '@/layouts/VerticalLayout.vue';
import DataView from 'primevue/dataview';
import SelectButton from 'primevue/selectbutton';
import InputText from 'primevue/inputtext';
import Dropdown from 'primevue/dropdown';
import Button from 'primevue/button';

const toast = useToast();
const router = useRouter();
const categoriesWithSubs = ref([]);
const categories = ref([]);
const products = ref([]);
const search = ref('');
const selectedCategory = ref(null);
const layout = ref('grid');
const options = ref(['list', 'grid']);

const filteredProducts = computed(() => {
  return products.value.filter(p => {
    return (!search.value || p.name.toLowerCase().includes(search.value.toLowerCase())) &&
           (!selectedCategory.value || p.category.id === selectedCategory.value);
  });
});

async function fetchCategoriesWithSubcategories() {
  try {
    const res = await api.get('marketplaces/categories-with-subcategories/');
    categoriesWithSubs.value = res.data;
    categories.value = res.data.map(c => ({ value: c.id, text: c.name }));
  } catch {
    toast.add({ severity: 'error', summary: 'Error', detail: 'Failed to load categories' });
  }
}

async function fetchProducts() {
  try {
    const res = await api.get('marketplaces/products/');
    products.value = res.data;
  } catch {
    toast.add({ severity: 'error', summary: 'Error', detail: 'Failed to load products' });
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
</style>