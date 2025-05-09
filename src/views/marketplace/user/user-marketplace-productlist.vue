<template>
    <VerticalLayout>
        <div class="card flex justify-center">
      <Stepper v-model:value="activeStep" class="basis-[40rem]">
        <StepList>
          <Step v-slot="{ activateCallback, value, a11yAttrs }" asChild :value="1">
            <div class="flex flex-row flex-auto gap-2" v-bind="a11yAttrs.root">
              <button
                class="bg-transparent border-0 inline-flex flex-col gap-2"
                @click="activateCallback"
                v-bind="a11yAttrs.header"
              >
                <span
                  :class="[
                    'rounded-full border-2 w-12 h-12 inline-flex items-center justify-center',
                    {
                      'bg-primary text-primary-contrast border-primary': value <= activeStep,
                      'border-surface-200 dark:border-surface-700': value > activeStep,
                    },
                  ]"
                >
                  <i class="pi pi-box" />
                </span>
              </button>
              <Divider />
            </div>
          </Step>
          <Step v-slot="{ activateCallback, value, a11yAttrs }" asChild :value="2">
            <div class="flex flex-row flex-auto gap-2 pl-2" v-bind="a11yAttrs.root">
              <button
                class="bg-transparent border-0 inline-flex flex-col gap-2"
                @click="activateCallback"
                v-bind="a11yAttrs.header"
              >
                <span
                  :class="[
                    'rounded-full border-2 w-12 h-12 inline-flex items-center justify-center',
                    {
                      'bg-primary text-primary-contrast border-primary': value <= activeStep,
                      'border-surface-200 dark:border-surface-700': value > activeStep,
                    },
                  ]"
                >
                  <i class="pi pi-dollar" />
                </span>
              </button>
              <Divider />
            </div>
          </Step>
          <Step v-slot="{ activateCallback, value, a11yAttrs }" asChild :value="3">
            <div class="flex flex-row pl-2" v-bind="a11yAttrs.root">
              <button
                class="bg-transparent border-0 inline-flex flex-col gap-2"
                @click="activateCallback"
                v-bind="a11yAttrs.header"
              >
                <span
                  :class="[
                    'rounded-full border-2 w-12 h-12 inline-flex items-center justify-center',
                    {
                      'bg-primary text-primary-contrast border-primary': value <= activeStep,
                      'border-surface-200 dark:border-surface-700': value > activeStep,
                    },
                  ]"
                >
                  <i class="pi pi-image" />
                </span>
              </button>
            </div>
          </Step>
        </StepList>
        <StepPanels>
          <!-- Step 1: Register Product -->
          <StepPanel v-slot="{ activateCallback }" :value="1">
            <div class="flex flex-col gap-2 mx-auto" style="min-height: 16rem; max-width: 24rem">
              <div class="text-center mt-4 mb-4 text-xl font-semibold">Create Product</div>
              <div class="field">
                <label for="name" class="block mb-2">Name *</label>
                <InputText
                  id="name"
                  v-model="product.name"
                  placeholder="Enter product name"
                  fluid
                  :invalid="submitted && !product.name"
                />
                <small v-if="submitted && !product.name" class="text-red-500">Name is required.</small>
              </div>
              <div class="field">
                <label for="description" class="block mb-2">Description</label>
                <Textarea
                  id="description"
                  v-model="product.description"
                  rows="3"
                  placeholder="Enter product description"
                  fluid
                />
              </div>
              <div class="field">
                <label for="category" class="block mb-2">Category *</label>
                <Dropdown
                  id="category"
                  v-model="product.category_id"
                  :options="categories"
                  optionLabel="name"
                  optionValue="id"
                  placeholder="Select category"
                  fluid
                  :invalid="submitted && !product.category_id"
                  @change="updateSubcategories"
                />
                <small v-if="submitted && !product.category_id" class="text-red-500">Category is required.</small>
              </div>
              <div class="field">
                <label for="subcategory" class="block mb-2">Subcategory *</label>
                <Dropdown
                  id="subcategory"
                  v-model="product.subcategory_id"
                  :options="filteredSubcategories"
                  optionLabel="name"
                  optionValue="id"
                  placeholder="Select subcategory"
                  fluid
                  :invalid="submitted && !product.subcategory_id"
                />
                <small v-if="submitted && !product.subcategory_id" class="text-red-500">Subcategory is required.</small>
              </div>
              <div class="field">
                <label for="type" class="block mb-2">Type *</label>
                <Dropdown
                  id="type"
                  v-model="product.type"
                  :options="typeOptions"
                  optionLabel="label"
                  optionValue="value"
                  placeholder="Select type"
                  fluid
                  :invalid="submitted && !product.type"
                />
                <small v-if="submitted && !product.type" class="text-red-500">Type is required.</small>
              </div>
              <div class="field">
                <label for="featuredImage" class="block mb-2">Featured Image</label>
                <FileUpload
                  mode="basic"
                  accept="image/*"
                  :maxFileSize="3000000"
                  @select="onFeaturedImageSelect"
                  chooseLabel="Select Image"
                  :auto="true"
                />
                <small v-if="product.featured_image" class="block mt-2">Selected: {{ product.featured_image.name }}</small>
              </div>
            </div>
            <div class="flex pt-6 justify-end">
              <Button label="Next" icon="pi pi-arrow-right" iconPos="right" @click="saveProductStep(2, activateCallback)" />
            </div>
          </StepPanel>
  
          <!-- Step 2: Add Product Prices -->
          <StepPanel v-slot="{ activateCallback }" :value="2">
            <div class="flex flex-col gap-2 mx-auto" style="min-height: 16rem; max-width: 24rem">
              <div class="text-center mt-4 mb-4 text-xl font-semibold">Add Product Prices</div>
              <div class="field">
                <label for="unitPrice" class="block mb-2">Unit Price *</label>
                <InputNumber
                  id="unitPrice"
                  v-model="price.unit_price"
                  mode="currency"
                  currency="USD"
                  :min="0"
                  placeholder="Enter unit price"
                  fluid
                  :invalid="submitted && (!price.unit_price || price.unit_price <= 0)"
                />
                <small
                  v-if="submitted && (!price.unit_price || price.unit_price <= 0)"
                  class="text-red-500"
                >Unit Price must be greater than 0.</small>
              </div>
              <div class="field">
                <label for="currency" class="block mb-2">Currency *</label>
                <Dropdown
                  id="currency"
                  v-model="price.currency"
                  :options="currencyOptions"
                  placeholder="Select currency"
                  fluid
                  :invalid="submitted && !price.currency"
                />
                <small v-if="submitted && !price.currency" class="text-red-500">Currency is required.</small>
              </div>
              <div class="field">
                <label for="isActive" class="block mb-2">Status</label>
                <Select
                  id="isActive"
                  v-model="price.is_active"
                  :options="statusOptions"
                  optionLabel="label"
                  optionValue="value"
                  placeholder="Select status"
                  fluid
                />
              </div>
            </div>
            <div class="flex pt-6 justify-between">
              <Button
                label="Back"
                severity="secondary"
                icon="pi pi-arrow-left"
                @click="activateCallback(1)"
              />
              <Button
                label="Next"
                icon="pi pi-arrow-right"
                iconPos="right"
                @click="savePriceStep(3, activateCallback)"
              />
            </div>
          </StepPanel>
  
          <!-- Step 3: Upload Product Images -->
          <StepPanel v-slot="{ activateCallback }" :value="3">
            <div class="flex flex-col gap-2 mx-auto" style="min-height: 16rem; max-width: 24rem">
              <div class="text-center mt-4 mb-4 text-xl font-semibold">Upload Product Images</div>
              <div class="field">
                <label for="images" class="block mb-2">Images</label>
                <FileUpload
                  mode="advanced"
                  multiple
                  accept="image/*"
                  :maxFileSize="3000000"
                  @select="onImagesSelect"
                  chooseLabel="Select Images"
                  uploadLabel="Upload"
                  cancelLabel="Cancel"
                  :showUploadButton="false"
                />
                <small v-if="images.length" class="block mt-2">
                  Selected: {{ images.map((img) => img.name).join(', ') }}
                </small>
              </div>
              <div class="field">
                <label for="isPrimary" class="block mb-2">Primary Image</label>
                <Dropdown
                  id="isPrimary"
                  v-model="primaryImageIndex"
                  :options="images"
                  optionLabel="name"
                  optionValue="index"
                  placeholder="Select primary image (optional)"
                  fluid
                />
              </div>
            </div>
            <div class="flex pt-6 justify-between">
              <Button
                label="Back"
                severity="secondary"
                icon="pi pi-arrow-left"
                @click="activateCallback(2)"
              />
              <Button label="Finish" icon="pi pi-check" @click="saveImagesStep" />
            </div>
          </StepPanel>
        </StepPanels>
      </Stepper>
    </div>
    </VerticalLayout>
    
  </template>
  
  <script setup>
  import VerticalLayout from '@/layouts/VerticalLayout.vue';
  import { ref, computed, onMounted } from 'vue';
  import { useToast } from 'primevue/usetoast';
  import { useRouter } from 'vue-router';
  import { api } from '@/services/authService';
  import Stepper from 'primevue/stepper';
  import StepList from 'primevue/steplist';
  import Step from 'primevue/step';
  import StepPanels from 'primevue/steppanels';
  import StepPanel from 'primevue/steppanel';
  import Divider from 'primevue/divider';
  import InputText from 'primevue/inputtext';
  import Textarea from 'primevue/textarea';
  import Dropdown from 'primevue/dropdown';
  import Select from 'primevue/dropdown';
  import InputNumber from 'primevue/inputnumber';
  import FileUpload from 'primevue/fileupload';
  import Button from 'primevue/button';
  
  const toast = useToast();
  const router = useRouter();
  const activeStep = ref(1);
  const submitted = ref(false);
  const loading = ref(false);
  const error = ref(null);
  
  // Product details
  const product = ref({
    name: '',
    description: '',
    category_id: null,
    subcategory_id: null,
    type: null,
    featured_image: null,
  });
  
  // Price details
  const price = ref({
    unit_price: null,
    currency: 'USD',
    is_active: true,
  });
  
  // Image details
  const images = ref([]);
  const primaryImageIndex = ref(null);
  
  // Options
  const categories = ref([]);
  const subcategories = ref([]);
  const typeOptions = ref([
    { label: 'Product', value: 'Product' },
    { label: 'Service', value: 'Service' },
  ]);
  const currencyOptions = ref(['USD', 'EUR', 'GBP']);
  const statusOptions = ref([
    { label: 'Active', value: true },
    { label: 'Inactive', value: false },
  ]);
  
  // Computed property for filtered subcategories
  const filteredSubcategories = computed(() => {
    return subcategories.value.filter((sub) => sub.category_id === product.value.category_id);
  });
  
  // Fetch categories and subcategories on mount
  onMounted(async () => {
    try {
      const [catResponse, subResponse] = await Promise.all([
        api.get('marketplaces/categories/'),
        api.get('marketplaces/subcategories/'),
      ]);
      categories.value = catResponse.data.results || catResponse.data;
      subcategories.value = subResponse.data.results || subResponse.data;
    } catch (error) {
      console.error('Failed to fetch categories/subcategories:', error);
      toast.add({
        severity: 'error',
        summary: 'Error',
        detail: 'Failed to load categories/subcategories',
        life: 3000,
      });
    }
  });
  
  // Handle featured image selection
  const onFeaturedImageSelect = (event) => {
    product.value.featured_image = event.files[0];
    toast.add({
      severity: 'success',
      summary: 'Success',
      detail: 'Featured image selected',
      life: 3000,
    });
  };
  
  // Handle multiple image selection
  const onImagesSelect = (event) => {
    images.value = event.files;
    primaryImageIndex.value = null; // Reset primary image selection
  };
  
  // Update subcategories when category changes
  const updateSubcategories = () => {
    product.value.subcategory_id = null; // Reset subcategory
  };
  
  // Save product step
  const saveProductStep = async (nextStep, activateCallback) => {
    submitted.value = true;
  
    // Validate product fields
    if (!product.value.name.trim()) {
      toast.add({
        severity: 'error',
        summary: 'Error',
        detail: 'Product name is required',
        life: 3000,
      });
      return;
    }
    if (!product.value.category_id) {
      toast.add({
        severity: 'error',
        summary: 'Error',
        detail: 'Category is required',
        life: 3000,
      });
      return;
    }
    if (!product.value.subcategory_id) {
      toast.add({
        severity: 'error',
        summary: 'Error',
        detail: 'Subcategory is required',
        life: 3000,
      });
      return;
    }
    if (!product.value.type) {
      toast.add({
        severity: 'error',
        summary: 'Error',
        detail: 'Type is required',
        life: 3000,
      });
      return;
    }
  
    try {
      loading.value = true;
      const formData = new FormData();
      formData.append('name', product.value.name);
      formData.append('description', product.value.description || '');
      formData.append('category', product.value.category_id);
      formData.append('subcategory', product.value.subcategory_id);
      formData.append('type', product.value.type);
      if (product.value.featured_image instanceof File) {
        formData.append('featured_image', product.value.featured_image);
      }
      formData.append('company', ''); // Set by backend (e.g., request.user)
  
      // Save product to get ID for next steps
      const response = await api.post('marketplaces/products/', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      product.value.id = response.data.id;
  
      toast.add({
        severity: 'success',
        summary: 'Success',
        detail: 'Product created successfully',
        life: 3000,
      });
  
      submitted.value = false;
      activateCallback(nextStep);
    } catch (error) {
      console.error('Failed to save product:', error);
      error.value = error.response?.data?.message || 'Failed to save product';
      toast.add({
        severity: 'error',
        summary: 'Error',
        detail: error.value,
        life: 5000,
      });
    } finally {
      loading.value = false;
    }
  };
  
  // Save price step
  const savePriceStep = async (nextStep, activateCallback) => {
    submitted.value = true;
  
    // Validate price fields
    if (!price.value.unit_price || price.value.unit_price <= 0) {
      toast.add({
        severity: 'error',
        summary: 'Error',
        detail: 'Unit Price must be greater than 0',
        life: 3000,
      });
      return;
    }
    if (!price.value.currency) {
      toast.add({
        severity: 'error',
        summary: 'Error',
        detail: 'Currency is required',
        life: 3000,
      });
      return;
    }
  
    try {
      loading.value = true;
      const formData = new FormData();
      formData.append('product_service', product.value.id);
      formData.append('unit_price', price.value.unit_price);
      formData.append('currency', price.value.currency);
      formData.append('is_active', price.value.is_active);
  
      await api.post('marketplaces/prices/', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
  
      toast.add({
        severity: 'success',
        summary: 'Success',
        detail: 'Price added successfully',
        life: 3000,
      });
  
      submitted.value = false;
      activateCallback(nextStep);
    } catch (error) {
      console.error('Failed to save price:', error);
      error.value = error.response?.data?.message || 'Failed to save price';
      toast.add({
        severity: 'error',
        summary: 'Error',
        detail: error.value,
        life: 5000,
      });
    } finally {
      loading.value = false;
    }
  };
  
  // Save images step
  const saveImagesStep = async () => {
    try {
      loading.value = true;
  
      if (images.value.length === 0) {
        toast.add({
          severity: 'warn',
          summary: 'Warning',
          detail: 'No images selected; skipping image upload',
          life: 3000,
        });
        router.push('/products');
        return;
      }
  
      await Promise.all(
        images.value.map(async (image, index) => {
          const formData = new FormData();
          formData.append('product_service', product.value.id);
          formData.append('image', image);
          formData.append('is_primary', index === primaryImageIndex.value);
  
          await api.post('marketplaces/product-images/', formData, {
            headers: { 'Content-Type': 'multipart/form-data' },
          });
        })
      );
  
      toast.add({
        severity: 'success',
        summary: 'Success',
        detail: 'Images uploaded successfully',
        life: 3000,
      });
  
      router.push('/products');
    } catch (error) {
      console.error('Failed to save images:', error);
      error.value = error.response?.data?.message || 'Failed to save images';
      toast.add({
        severity: 'error',
        summary: 'Error',
        detail: error.value,
        life: 5000,
      });
    } finally {
      loading.value = false;
    }
  };
  </script>
  
