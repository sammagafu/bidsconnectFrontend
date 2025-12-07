<template>
  <VerticalLayout>
    <b-card>
      <!-- Progress bar -->
      <b-progress :value="progress" max="100" class="mb-3">
        <b-progress-bar
          :value="progress"
          :label="`Step ${store.step}/4`"
        />
      </b-progress>

      <!-- Step 1: Basic Info -->
      <b-form v-if="store.step === 1" novalidate>
        <b-form-group class="mb-3" label="Name" label-for="name">
          <b-form-input
            id="name"
            v-model.trim="store.product.name"
            :state="!errors.name"
            required
          />
        </b-form-group>

        <b-form-group class="mb-3" label="Type" label-for="type">
          <b-form-select
            id="type"
            v-model="store.product.type"
            :options="typeOptions"
            :state="!errors.type"
            required
          />
        </b-form-group>

        <b-form-group class="mb-3" label="Description" label-for="description">
          <b-form-textarea
            id="description"
            v-model="store.product.description"
            rows="3"
            :state="!errors.description"
            required
          />
        </b-form-group>

        <b-form-group class="mb-3" label="Category" label-for="category">
          <b-form-select
            id="category"
            v-model="store.product.category_id"
            :options="categories"
            :state="!errors.category_id"
            @change="onCategoryChange"
            required
          />
        </b-form-group>

        <b-form-group class="mb-3" label="Subcategory" label-for="subcategory">
          <b-form-select
            id="subcategory"
            v-model="store.product.subcategory_id"
            :options="subcategories"
            :state="!errors.subcategory_id"
            required
          />
        </b-form-group>

        <b-form-group class="mb-3" label="Featured Image" label-for="featured_image">
          <b-form-file
            id="featured_image"
            accept="image/*"
            v-model="store.product.featured_image"
          />
        </b-form-group>
      </b-form>

      <!-- Step 2: Prices -->
      <b-form v-else-if="store.step === 2" novalidate>
        <div
          v-for="(price, i) in prices"
          :key="i"
          class="mb-3 border p-2 rounded"
        >
          <b-form-group class="mb-2" :label="`Price ${i+1} Unit Price`">
            <b-form-input
              type="number"
              step="0.01"
              v-model.number="prices[i].unit_price"
              required
            />
          </b-form-group>
          <b-form-group class="mb-2" :label="`Unit`">
            <b-form-input
              v-model="prices[i].unit"
            />
          </b-form-group>
          <b-form-group class="mb-2" :label="`Minimum Quantity`">
            <b-form-input
              type="number"
              v-model.number="prices[i].minimum_quantity"
              required
            />
          </b-form-group>
          <b-form-group class="mb-2" :label="`Description`">
            <b-form-textarea
              v-model="prices[i].description"
              rows="2"
            />
          </b-form-group>
          <b-button
            size="sm"
            variant="danger"
            @click="removePrice(i)"
          >
            Remove
          </b-button>
        </div>
        <b-button
          size="sm"
          variant="outline-primary"
          @click="addPrice"
        >
          + Add Price
        </b-button>
      </b-form>

      <!-- Step 3: Images -->
      <b-form v-else-if="store.step === 3" novalidate>
        <div
          v-for="(image, i) in images"
          :key="i"
          class="mb-3 border p-2 rounded"
        >
          <b-form-group class="mb-2" :label="`Image ${i+1} File`">
            <b-form-file
              accept="image/*"
              v-model="images[i].image"
              required
            />
          </b-form-group>
          <b-form-group class="mb-2" :label="`Caption`">
            <b-form-input
              v-model="images[i].caption"
            />
          </b-form-group>
          <b-form-group class="mb-2" :label="`Is Primary`">
            <b-form-checkbox
              v-model="images[i].is_primary"
            />
          </b-form-group>
          <b-button
            size="sm"
            variant="danger"
            @click="removeImage(i)"
          >
            Remove
          </b-button>
        </div>
        <b-button
          size="sm"
          variant="outline-primary"
          @click="addImage"
        >
          + Add Image
        </b-button>
      </b-form>

      <!-- Step 4: Success -->
      <div v-else class="text-center py-4">
        <h4 class="text-success mb-4">✅ Product created!</h4>
        <b-button class="me-2" variant="outline-primary" @click="resetAll">
          New Product
        </b-button>
        <b-button variant="primary" @click="goToList">
          Go to Products
        </b-button>
      </div>

      <!-- Footer -->
      <template #footer>
        <div class="d-flex justify-content-end gap-2">
          <b-button
            v-if="store.step > 1 && store.step < 4"
            variant="secondary"
            @click="store.back()"
          >
            Back
          </b-button>
          <b-button
            v-if="store.step >= 2 && store.step < 4"
            variant="outline-secondary"
            @click="skipSection"
          >
            Skip Section
          </b-button>
          <b-button
            v-if="store.step < 4"
            variant="primary"
            @click="nextStep"
          >
            Next
          </b-button>
          <b-button
            v-if="store.step === 3"
            variant="success"
            @click="submitProduct"
          >
            Submit Product
          </b-button>
        </div>
      </template>
    </b-card>
  </VerticalLayout>
</template>

<script setup>
import { ref, computed, watch, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { useToast } from 'primevue/usetoast';
import { api } from '@/services/authService';
import VerticalLayout from '@/layouts/VerticalLayout.vue';

const toast = useToast();
const router = useRouter();
const store = ref({
  step: 1,
  product: { name: '', type: '', description: '', category_id: null, subcategory_id: null, featured_image: null },
  back: () => { if (store.value.step > 1) store.value.step--; }
});
const progress = computed(() => ((store.value.step - 1) / 3) * 100);
const errors = ref({});
const categoriesWithSubs = ref([]);
const categories = ref([]);
const subcategories = ref([]);
const prices = ref([]);
const images = ref([]);
const typeOptions = [
  { value: 'Product', text: 'Product' },
  { value: 'Service', text: 'Service' }
];

function validateStep1() {
  errors.value = {};
  if (!store.value.product.name) errors.value.name = true;
  if (!store.value.product.type) errors.value.type = true;
  if (!store.value.product.description) errors.value.description = true;
  if (!store.value.product.category_id) errors.value.category_id = true;
  if (!store.value.product.subcategory_id) errors.value.subcategory_id = true;
  return Object.keys(errors.value).length === 0;
}

function nextStep() {
  if (store.value.step === 1 && !validateStep1()) {
    toast.add({ severity: 'error', summary: 'Validation Error', detail: 'Please fill all required fields.' });
    return;
  }
  if (store.value.step < 4) store.value.step++;
}

function skipSection() {
  if (store.value.step === 2) prices.value = [];
  if (store.value.step === 3) images.value = [];
  if (store.value.step < 4) store.value.step++;
}

function addPrice() {
  prices.value.push({ unit_price: 0, unit: '', minimum_quantity: 1, description: '' });
}

function removePrice(i) {
  prices.value.splice(i, 1);
}

function addImage() {
  images.value.push({ image: null, caption: '', is_primary: false });
}

function removeImage(i) {
  images.value.splice(i, 1);
}

function resetAll() {
  store.value.step = 1;
  store.value.product = { name: '', type: '', description: '', category_id: null, subcategory_id: null, featured_image: null };
  prices.value = [];
  images.value = [];
}

function goToList() {
  resetAll();
  router.push({ name: 'products.list' });
}

function onCategoryChange() {
  store.value.product.subcategory_id = null;
}

watch(() => store.value.product.category_id, id => {
  const cat = categoriesWithSubs.value.find(c => c.id === id);
  subcategories.value = cat ? cat.subcategories.map(sc => ({ value: sc.id, text: sc.name })) : [];
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

async function submitProduct() {
  try {
    const productData = new FormData();
    productData.append('name', store.value.product.name);
    productData.append('type', store.value.product.type);
    productData.append('description', store.value.product.description);
    productData.append('category_id', store.value.product.category_id);
    productData.append('subcategory_id', store.value.product.subcategory_id);
    if (store.value.product.featured_image) productData.append('featured_image', store.value.product.featured_image);

    const resProduct = await api.post('marketplaces/products/', productData, { headers: { 'Content-Type': 'multipart/form-data' } });
    const productId = resProduct.data.id;

    for (const price of prices.value) {
      await api.post('marketplace/prices/', { ...price, product_service: productId });
    }

    for (const img of images.value) {
      const imgData = new FormData();
      imgData.append('product_service', productId);
      imgData.append('image', img.image);
      imgData.append('caption', img.caption);
      imgData.append('is_primary', img.is_primary);
      await api.post('marketplaces/product-images/', imgData, { headers: { 'Content-Type': 'multipart/form-data' } });
    }

    toast.add({ severity: 'success', summary: 'Done', detail: 'Product created' });
    store.value.step = 4;
  } catch (err) {
    toast.add({ severity: 'error', summary: 'Error', detail: 'Submission failed' });
  }
}

onMounted(fetchCategoriesWithSubcategories);
</script>

<style scoped>
.mb-3 {
  margin-bottom: 1rem !important;
}
</style>