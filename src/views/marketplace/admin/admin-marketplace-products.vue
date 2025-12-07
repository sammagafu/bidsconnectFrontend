<template>
<VerticalLayout>
    <b-card>
    <div>
    <div class="card">
      <Toolbar class="mb-6">
        <template #start>
          <Button label="New" icon="pi pi-plus" class="mr-2" @click="openNew" />
          <Button label="Delete" icon="pi pi-trash" severity="danger" variant="outlined" @click="confirmDeleteSelected" :disabled="!selectedProducts || !selectedProducts.length" />
        </template>
        <template #end>
          <Button label="Export" icon="pi pi-upload" severity="secondary" @click="exportCSV($event)" />
        </template>
      </Toolbar>
      <div class="flex flex-wrap gap-4 mb-4">
        <Select v-model="filterType" :options="typeOptions" optionLabel="text" optionValue="value" placeholder="Select Type" class="w-full md:w-48" />
        <Select v-model="filterCategory" :options="categories" optionLabel="text" optionValue="value" placeholder="Select Category" class="w-full md:w-48" @change="onFilterCategoryChange" />
        <Select v-model="filterSubcategory" :options="filterSubcategories" optionLabel="text" optionValue="value" placeholder="Select Subcategory" class="w-full md:w-48" />
        <Select v-model="filterActive" :options="activeOptions" optionLabel="text" optionValue="value" placeholder="Select Status" class="w-full md:w-48" />
        <InputNumber v-model="filterMinPrice" placeholder="Min Price" class="w-full md:w-48" />
        <InputNumber v-model="filterMaxPrice" placeholder="Max Price" class="w-full md:w-48" />
        <InputText v-model="filterCompanyLocation" placeholder="Company Location" class="w-full md:w-48" />
      </div>
      <DataTable
        ref="dt"
        v-model:selection="selectedProducts"
        :value="products"
        dataKey="id"
        :paginator="true"
        :lazy="true"
        v-model:first="first"
        :rows="rows"
        :totalRecords="totalRecords"
        :filters="filters"
        paginatorTemplate="FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink CurrentPageReport RowsPerPageDropdown"
        :rowsPerPageOptions="[5, 10, 25]"
        currentPageReportTemplate="Showing {first} to {last} of {totalRecords} products"
        @page="loadData"
        @sort="loadData"
        @filter="loadData"
      >
        <template #header>
          <div class="flex flex-wrap gap-2 items-center justify-between">
            <h4 class="m-0">Manage Products/Services</h4>
            <IconField>
              <InputIcon>
                <i class="pi pi-search" />
              </InputIcon>
              <InputText v-model="filters['global'].value" placeholder="Search..." />
            </IconField>
          </div>
        </template>
        <Column selectionMode="multiple" style="width: 3rem" :exportable="false"></Column>
        <Column field="name" header="Name" sortable style="min-width: 16rem">
          <template #body="slotProps">
            <router-link :to="{ name: 'admin.marketplace.products-details', params: { id: slotProps.data.id } }">{{ slotProps.data.name }}</router-link>
            <!-- <a href="#" @click.prevent="goToDetails(slotProps.data.id)">{{ slotProps.data.name }}</a> -->
          </template>
        </Column>
        <Column field="type" header="Type" sortable style="min-width: 10rem"></Column>
        <Column header="Image">
          <template #body="slotProps">
            <img v-if="slotProps.data.featured_image" :src="slotProps.data.featured_image" :alt="slotProps.data.name" class="rounded" style="width: 64px" />
          </template>
        </Column>
        <Column field="category.name" header="Category" sortable style="min-width: 12rem"></Column>
        <Column field="subcategory.name" header="Subcategory" sortable style="min-width: 12rem"></Column>
        <Column v-if="auth.isSuperAdmin || auth.isStaffUser" field="company.name" header="Company" sortable style="min-width: 14rem"></Column>
        <Column field="is_active" header="Status" sortable style="min-width: 10rem">
          <template #body="slotProps">
            <Tag :value="slotProps.data.is_active ? 'Active' : 'Inactive'" :severity="slotProps.data.is_active ? 'success' : 'danger'" />
          </template>
        </Column>
        <Column :exportable="false" style="min-width: 12rem">
          <template #body="slotProps">
            <Button v-if="!slotProps.data.is_active" icon="pi pi-check" severity="success" variant="outlined" rounded class="mr-2" @click="approveProduct(slotProps.data)" />
            <Button icon="pi pi-pencil" variant="outlined" rounded class="mr-2" @click="editProduct(slotProps.data)" />
            <Button icon="pi pi-trash" variant="outlined" rounded severity="danger" @click="confirmDeleteProduct(slotProps.data)" />
          </template>
        </Column>
      </DataTable>
    </div>
    <Dialog v-model:visible="productDialog" :style="{ width: '450px' }" header="Product/Service Details" :modal="true">
      <div class="flex flex-col gap-6">
        <img v-if="product.featured_image" :src="product.featured_image" :alt="product.name" class="block m-auto pb-4" style="width: 200px" />
        <div>
          <label for="name" class="block font-bold mb-3">Name</label>
          <InputText id="name" v-model.trim="product.name" required="true" autofocus :invalid="submitted && !product.name" fluid />
          <small v-if="submitted && !product.name" class="text-red-500">Name is required.</small>
        </div>
        <div>
          <label for="type" class="block font-bold mb-3">Type</label>
          <Select id="type" v-model="product.type" :options="typeOptions" optionLabel="text" optionValue="value" placeholder="Select Type" fluid />
        </div>
        <div>
          <label for="description" class="block font-bold mb-3">Description</label>
          <Textarea id="description" v-model="product.description" required="true" rows="3" cols="20" fluid />
        </div>
        <div v-if="auth.isSuperAdmin || auth.isStaffUser">
          <label for="company" class="block font-bold mb-3">Company</label>
          <Select id="company" v-model="product.company" :options="companiesList" optionLabel="text" optionValue="value" placeholder="Select Company" fluid />
        </div>
        <div>
          <label for="category" class="block font-bold mb-3">Category</label>
          <Select id="category" v-model="product.category_id" :options="categories" optionLabel="text" optionValue="value" placeholder="Select Category" fluid @update:modelValue="onCategoryChange" />
        </div>
        <div>
          <label for="subcategory" class="block font-bold mb-3">Subcategory</label>
          <Select id="subcategory" v-model="product.subcategory_id" :options="subcategories" optionLabel="text" optionValue="value" placeholder="Select Subcategory" fluid />
        </div>
        <div>
          <label for="featured_image" class="block font-bold mb-3">Featured Image</label>
          <FileUpload mode="basic" accept="image/*" :maxFileSize="10000000" customUpload @uploader="uploadFeaturedImage" chooseLabel="Upload Image" auto />
        </div>
        <div class="flex items-center gap-2">
          <Checkbox id="is_active" v-model="product.is_active" :binary="true" />
          <label for="is_active">Active</label>
        </div>
      </div>
      <template #footer>
        <Button label="Cancel" icon="pi pi-times" text @click="hideDialog" />
        <Button label="Save" icon="pi pi-check" @click="saveProduct" />
      </template>
    </Dialog>
    <Dialog v-model:visible="deleteProductDialog" :style="{ width: '450px' }" header="Confirm" :modal="true">
      <div class="flex items-center gap-4">
        <i class="pi pi-exclamation-triangle !text-3xl" />
        <span v-if="product">Are you sure you want to delete <b>{{ product.name }}</b>?</span>
      </div>
      <template #footer>
        <Button label="No" icon="pi pi-times" text @click="deleteProductDialog = false" severity="secondary" variant="text" />
        <Button label="Yes" icon="pi pi-check" @click="deleteProduct" severity="danger" />
      </template>
    </Dialog>
    <Dialog v-model:visible="deleteProductsDialog" :style="{ width: '450px' }" header="Confirm" :modal="true">
      <div class="flex items-center gap-4">
        <i class="pi pi-exclamation-triangle !text-3xl" />
        <span>Are you sure you want to delete the selected items?</span>
      </div>
      <template #footer>
        <Button label="No" icon="pi pi-times" text @click="deleteProductsDialog = false" severity="secondary" variant="text" />
        <Button label="Yes" icon="pi pi-check" text @click="deleteSelectedProducts" severity="danger" />
      </template>
    </Dialog>
  </div>
  </b-card>
</VerticalLayout>
</template>
<script setup>
import { ref, onMounted, watch } from 'vue';
import { FilterMatchMode } from '@primevue/core/api';
import { useToast } from 'primevue/usetoast';
import { api } from '@/services/authService';
import { useAuthStore } from '@/stores/auth';
import VerticalLayout from '@/layouts/VerticalLayout.vue';
import { useRouter } from 'vue-router';

const router = useRouter();
const toast = useToast();
const auth = useAuthStore();
const dt = ref();
const products = ref([]);
const productDialog = ref(false);
const deleteProductDialog = ref(false);
const deleteProductsDialog = ref(false);
const product = ref({});
const selectedProducts = ref([]);
const filters = ref({ global: { value: null, matchMode: FilterMatchMode.CONTAINS } });
const submitted = ref(false);
const categoriesWithSubs = ref([]);
const categories = ref([]);
const subcategories = ref([]);
const companiesList = ref([]);
const typeOptions = [
  { value: 'Product', text: 'Product' },
  { value: 'Service', text: 'Service' }
];
const first = ref(0);
const rows = ref(10);
const totalRecords = ref(0);
const sortField = ref(null);
const sortOrder = ref(null);
const filterCategory = ref(null);
const filterSubcategory = ref(null);
const filterType = ref(null);
const filterActive = ref(null);
const filterMinPrice = ref(null);
const filterMaxPrice = ref(null);
const filterCompanyLocation = ref(null);
const filterSubcategories = ref([]);
const activeOptions = [
  { value: null, text: 'All' },
  { value: true, text: 'Active' },
  { value: false, text: 'Inactive' }
];

onMounted(async () => {
  await fetchCategoriesWithSubcategories();
  await fetchCompanies();
  await loadData();
  if (!auth.isSuperAdmin && !auth.isStaffUser && auth.companies.length > 0) {
    product.value.company = auth.companies[0].id;
  }
});

const mapProduct = (p) => {
  const subcatMap = new Map(categoriesWithSubs.value.flatMap(cat => cat.subcategories.map(sub => [sub.id, { id: sub.id, name: sub.name }])));
  const companyMap = new Map(companiesList.value.map(c => [c.value, { id: c.value, name: c.text }]));
  return {
    ...p,
    subcategory: subcatMap.get(p.subcategory) || { name: 'Unknown' },
    company: companyMap.get(p.company) || { name: 'Unknown' }
  };
};

async function fetchCategoriesWithSubcategories() {
  try {
    const res = await api.get('marketplaces/categories-with-subcategories/');
    categoriesWithSubs.value = res.data;
    categories.value = res.data.map(c => ({ value: c.id, text: c.name }));
  } catch {
    toast.add({ severity: 'error', summary: 'Error', detail: 'Failed to load categories' });
  }
}

async function fetchCompanies() {
  if (auth.isSuperAdmin || auth.isStaffUser) {
    try {
      const res = await api.get('accounts/companies/');
      companiesList.value = res.data.map(c => ({ value: c.id, text: c.name }));
    } catch {
      toast.add({ severity: 'error', summary: 'Error', detail: 'Failed to load companies' });
    }
  }
}

async function loadData(event) {
  if (event) {
    first.value = event.first;
    rows.value = event.rows;
    sortField.value = event.sortField;
    sortOrder.value = event.sortOrder;
  }
  const page = Math.floor(first.value / rows.value) + 1;
  const params = {
    page,
    page_size: rows.value
  };
  if (sortField.value) {
    params.ordering = (sortOrder.value === -1 ? '-' : '') + sortField.value;
  }
  if (filterType.value) params.type = filterType.value;
  if (filterCategory.value) params.category = filterCategory.value;
  if (filterSubcategory.value) params.subcategory = filterSubcategory.value;
  if (filterActive.value !== null) params.is_active = filterActive.value;
  if (filterMinPrice.value) params.min_price = filterMinPrice.value;
  if (filterMaxPrice.value) params.max_price = filterMaxPrice.value;
  if (filterCompanyLocation.value) params.company_location = filterCompanyLocation.value;
  if (filters.value.global.value) params.search = filters.value.global.value;
  try {
    const res = await api.get('marketplaces/products/', { params });
    products.value = res.data.results.map(mapProduct);
    totalRecords.value = res.data.count;
  } catch (err) {
    toast.add({ severity: 'error', summary: 'Error', detail: 'Failed to load products' });
  }
}

const openNew = () => {
  product.value = { is_active: true };
  subcategories.value = [];
  if (!auth.isSuperAdmin && !auth.isStaffUser && auth.companies.length > 0) {
    product.value.company = auth.companies[0].id;
  }
  productDialog.value = true;
};

const hideDialog = () => {
  productDialog.value = false;
  submitted.value = false;
};

async function saveProduct() {
  submitted.value = true;
  if (!product.value.name?.trim()) return;

  try {
    const productData = new FormData();
    productData.append('name', product.value.name);
    productData.append('type', product.value.type);
    productData.append('description', product.value.description || '');
    if (product.value.company) productData.append('company', product.value.company);
    productData.append('category_id', product.value.category_id);
    productData.append('subcategory_id', product.value.subcategory_id);
    productData.append('is_active', product.value.is_active);
    if (product.value.featured_image instanceof File) {
      productData.append('featured_image', product.value.featured_image);
    }

    if (product.value.id) {
      await api.patch(`marketplaces/products/${product.value.id}/`, productData, { headers: { 'Content-Type': 'multipart/form-data' } });
      toast.add({ severity: 'success', summary: 'Successful', detail: 'Updated' });
    } else {
      await api.post('marketplaces/products/', productData, { headers: { 'Content-Type': 'multipart/form-data' } });
      toast.add({ severity: 'success', summary: 'Successful', detail: 'Created' });
    }
    productDialog.value = false;
    product.value = {};
    loadData();
  } catch (err) {
    toast.add({ severity: 'error', summary: 'Error', detail: 'Failed to save' });
  }
}

const editProduct = (prod) => {
  product.value = { 
    ...prod, 
    category_id: prod.category.id, 
    subcategory_id: prod.subcategory ? prod.subcategory.id : null, 
    company: prod.company ? prod.company.id : null 
  };
  onCategoryChange(prod.category.id);
  productDialog.value = true;
};

const goToDetails = (id) => {
  router.push({ name: 'product-detail', params: { id } });
};

const confirmDeleteProduct = (prod) => {
  product.value = prod;
  deleteProductDialog.value = true;
};

async function deleteProduct() {
  try {
    await api.delete(`marketplaces/products/${product.value.id}/`);
    deleteProductDialog.value = false;
    product.value = {};
    toast.add({ severity: 'success', summary: 'Successful', detail: 'Deleted' });
    loadData();
  } catch (err) {
    toast.add({ severity: 'error', summary: 'Error', detail: 'Failed to delete' });
  }
}

const confirmDeleteSelected = () => {
  deleteProductsDialog.value = true;
};

async function deleteSelectedProducts() {
  try {
    for (const prod of selectedProducts.value) {
      await api.delete(`marketplaces/products/${prod.id}/`);
    }
    selectedProducts.value = [];
    deleteProductsDialog.value = false;
    toast.add({ severity: 'success', summary: 'Successful', detail: 'Deleted' });
    loadData();
  } catch (err) {
    toast.add({ severity: 'error', summary: 'Error', detail: 'Failed to delete' });
  }
}

async function approveProduct(prod) {
  try {
    await api.post(`marketplaces/products/${prod.id}/activate/`);
    toast.add({ severity: 'success', summary: 'Successful', detail: 'Approved' });
    loadData();
  } catch (err) {
    toast.add({ severity: 'error', summary: 'Error', detail: 'Failed to approve' });
  }
}

const exportCSV = () => {
  dt.value.exportCSV();
};

function onCategoryChange(val) {
  const id = val || product.value.category_id;
  const cat = categoriesWithSubs.value.find(c => c.id === id);
  subcategories.value = cat ? cat.subcategories.map(sc => ({ value: sc.id, text: sc.name })) : [];
}

function onFilterCategoryChange() {
  const cat = categoriesWithSubs.value.find(c => c.id === filterCategory.value);
  filterSubcategories.value = cat ? cat.subcategories.map(sc => ({ value: sc.id, text: sc.name })) : [];
  filterSubcategory.value = null;
}

watch(() => product.value.category_id, onCategoryChange);

watch([filterCategory, filterSubcategory, filterType, filterActive, filterMinPrice, filterMaxPrice, filterCompanyLocation], () => {
  first.value = 0;
  loadData();
});

function uploadFeaturedImage(event) {
  product.value.featured_image = event.files[0];
}
</script>