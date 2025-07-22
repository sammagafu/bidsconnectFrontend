<!-- src/views/admin/components/ProductServiceManager.vue -->
<template>
    <VerticalLayout>
        <div class="card">
            <Toolbar class="mb-6">
                <template #start>
                    <Button label="New Product/Service" icon="pi pi-plus" class="mr-2" @click="openNew" />
                    <Button label="Delete Selected" icon="pi pi-trash" severity="danger" outlined 
                        @click="confirmDeleteSelected" :disabled="!selectedProducts || !selectedProducts.length" />
                </template>
                <template #end>
                    <Button label="Export" icon="pi pi-upload" severity="secondary" @click="exportCSV" />
                </template>
            </Toolbar>

            <DataTable
                ref="dt"
                v-model:selection="selectedProducts"
                :value="products"
                dataKey="id"
                :paginator="true"
                :rows="10"
                :filters="filters"
                paginatorTemplate="FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink CurrentPageReport RowsPerPageDropdown"
                :rowsPerPageOptions="[5, 10, 25]"
                currentPageReportTemplate="Showing {first} to {last} of {totalRecords} products/services"
                :loading="loading"
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
                <template #empty> No products/services found. </template>
                <template #loading> Loading products/services data. Please wait. </template>

                <Column selectionMode="multiple" style="width: 3rem" :exportable="false"></Column>
                <Column field="name" header="Name" sortable style="min-width: 16rem"></Column>
                <Column field="company.name" header="Company" sortable style="min-width: 12rem"></Column>
                <Column field="category.name" header="Category" sortable style="min-width: 12rem">
                    <template #body="slotProps">
                        <span v-tooltip="slotProps.data.category.description">
                            {{ slotProps.data.category.name }}
                        </span>
                    </template>
                </Column>
                <Column field="subcategory.name" header="Subcategory" sortable style="min-width: 12rem">
                    <template #body="slotProps">
                        <span v-tooltip="slotProps.data.subcategory.description">
                            {{ slotProps.data.subcategory.name }}
                        </span>
                    </template>
                </Column>
                <Column field="type" header="Type" sortable style="min-width: 10rem"></Column>
                <Column field="is_active" header="Status" sortable style="min-width: 10rem">
                    <template #body="slotProps">
                        <Tag :value="slotProps.data.is_active ? 'Active' : 'Inactive'" 
                            :severity="slotProps.data.is_active ? 'success' : 'danger'" />
                    </template>
                </Column>
                <Column field="created_at" header="Created" sortable style="min-width: 12rem">
                    <template #body="slotProps">
                        {{ formatDate(slotProps.data.created_at) }}
                    </template>
                </Column>
                <Column :exportable="false" style="min-width: 12rem">
                    <template #body="slotProps">
                        <Button v-if="slotProps.data.is_active" icon="pi pi-ban" 
                            outlined rounded class="mr-2" @click="deactivateProduct(slotProps.data)" 
                            v-tooltip="'Deactivate Product'" />
                        <Button v-else icon="pi pi-check" 
                            outlined rounded class="mr-2" @click="activateProduct(slotProps.data)" 
                            v-tooltip="'Activate Product'" />
                        <Button icon="pi pi-pencil" outlined rounded class="mr-2" 
                            @click="editProduct(slotProps.data)" />
                        <Button icon="pi pi-trash" outlined rounded severity="danger" 
                            @click="confirmDeleteProduct(slotProps.data)" />
                    </template>
                </Column>
            </DataTable>

            <Dialog v-model:visible="productDialog" :style="{ width: '80vw', maxWidth: '800px', minWidth: '300px' }" 
                header="Product/Service Details" :modal="true" class="product-dialog">
                <div class="flex flex-col gap-6">
                    <div>
                        <label for="name" class="block font-bold mb-3">Name</label>
                        <InputText id="name" v-model.trim="product.name" required="true" autofocus 
                            :invalid="submitted && !product.name" fluid />
                        <small v-if="submitted && !product.name" class="text-red-500">Name is required.</small>
                    </div>
                    <div>
                        <label for="company" class="block font-bold mb-3">Company</label>
                        <Select id="company" v-model="product.company_id" :options="companies" 
                            optionLabel="name" optionValue="id" placeholder="Select Company" fluid />
                        <small v-if="submitted && !product.company_id" class="text-red-500">Company is required.</small>
                    </div>
                    <div>
                        <label for="description" class="block font-bold mb-3">Description</label>
                        <Textarea id="description" v-model="product.description" rows="3" cols="20" fluid />
                    </div>
                    <div class="flex flex-col gap-2">
                        <label for="category" class="block font-bold">Category</label>
                        <div class="flex gap-2 items-center">
                            <Select id="category" v-model="product.category_id" :options="categories" 
                                :optionLabel="category => `${category.name} (${category.description || 'No description'})`" 
                                optionValue="id" placeholder="Select Category" fluid 
                                @change="updateSubcategories" />
                            <Button icon="pi pi-plus" label="Add Category" severity="secondary" 
                                @click="openNewCategoryDialog" />
                        </div>
                        <small v-if="submitted && !product.category_id" class="text-red-500">Category is required.</small>
                    </div>
                    <div class="flex flex-col gap-2">
                        <label for="subcategory" class="block font-bold">Subcategory</label>
                        <div class="flex gap-2 items-center">
                            <Select id="subcategory" v-model="product.subcategory_id" 
                                :options="filteredSubcategories" 
                                :optionLabel="sub => `${sub.name} (${sub.description || 'No description'})`" 
                                optionValue="id" placeholder="Select Subcategory" fluid 
                                :disabled="!product.category_id" />
                            <Button icon="pi pi-plus" label="Add Subcategory" severity="secondary" 
                                @click="openNewSubcategoryDialog" :disabled="!product.category_id" />
                        </div>
                        <small v-if="submitted && !product.subcategory_id" class="text-red-500">Subcategory is required.</small>
                    </div>
                    <div>
                        <label for="type" class="block font-bold mb-3">Type</label>
                        <Select id="type" v-model="product.type" :options="types" 
                            optionLabel="label" optionValue="value" placeholder="Select Type" fluid />
                        <small v-if="submitted && !product.type" class="text-red-500">Type is required.</small>
                    </div>
                    <div>
                        <label for="is_active" class="block font-bold mb-3">Status</label>
                        <Select id="is_active" v-model="product.is_active" :options="statusOptions" 
                            optionLabel="label" optionValue="value" placeholder="Select Status" fluid />
                    </div>
                    <div>
                        <label for="featured_image" class="block font-bold mb-3">Featured Image</label>
                        <FileUpload mode="basic" accept="image/*" :maxFileSize="1000000" 
                            @select="onImageSelect" chooseLabel="Select Image" />
                        <small v-if="product.featured_image_url" class="text-gray-500">
                            Current: <a :href="product.featured_image_url" target="_blank">View Image</a>
                        </small>
                    </div>
                </div>

                <template #footer>
                    <Button label="Cancel" icon="pi pi-times" text @click="hideDialog" />
                    <Button :label="saveButtonLabel" icon="pi pi-check" @click="saveProduct" />
                </template>
            </Dialog>

            <Dialog v-model:visible="newCategoryDialog" :style="{ width: '50vw', maxWidth: '500px', minWidth: '300px' }" 
                header="Add New Category" :modal="true" class="category-dialog">
                <div class="flex flex-col gap-4">
                    <div>
                        <label for="new-category-name" class="block font-bold mb-2">Category Name</label>
                        <InputText id="new-category-name" v-model.trim="newCategory.name" 
                            required="true" :invalid="submittedCategory && !newCategory.name" fluid />
                        <small v-if="submittedCategory && !newCategory.name" class="text-red-500">Category name is required.</small>
                    </div>
                    <div>
                        <label for="new-category-desc" class="block font-bold mb-2">Description</label>
                        <Textarea id="new-category-desc" v-model="newCategory.description" 
                            rows="3" cols="20" fluid />
                    </div>
                </div>
                <template #footer>
                    <Button label="Cancel" icon="pi pi-times" text @click="newCategoryDialog = false" />
                    <Button label="Create" icon="pi pi-check" @click="createCategory" />
                </template>
            </Dialog>

            <Dialog v-model:visible="newSubcategoryDialog" :style="{ width: '50vw', maxWidth: '500px', minWidth: '300px' }" 
                header="Add New Subcategory" :modal="true" class="subcategory-dialog">
                <div class="flex flex-col gap-4">
                    <div>
                        <label for="new-subcategory-name" class="block font-bold mb-2">Subcategory Name</label>
                        <InputText id="new-subcategory-name" v-model.trim="newSubcategory.name" 
                            required="true" :invalid="submittedSubcategory && !newSubcategory.name" fluid />
                        <small v-if="submittedSubcategory && !newSubcategory.name" class="text-red-500">Subcategory name is required.</small>
                    </div>
                    <div>
                        <label for="new-subcategory-desc" class="block font-bold mb-2">Description</label>
                        <Textarea id="new-subcategory-desc" v-model="newSubcategory.description" 
                            rows="3" cols="20" fluid />
                    </div>
                    <div>
                        <label for="new-subcategory-category" class="block font-bold mb-2">Category</label>
                        <InputText id="new-subcategory-category" :value="selectedCategoryName" disabled fluid />
                    </div>
                </div>
                <template #footer>
                    <Button label="Cancel" icon="pi pi-times" text @click="newSubcategoryDialog = false" />
                    <Button label="Create" icon="pi pi-check" @click="createSubcategory" />
                </template>
            </Dialog>

            <Dialog v-model:visible="deleteProductDialog" :style="{ width: '50vw', maxWidth: '500px', minWidth: '300px' }" 
                header="Confirm" :modal="true" class="delete-dialog">
                <div class="flex items-center gap-4">
                    <i class="pi pi-exclamation-triangle !text-3xl" />
                    <span v-if="product">Are you sure you want to delete <b>{{ product.name }}</b>?</span>
                </div>
                <template #footer>
                    <Button label="No" icon="pi pi-times" text @click="deleteProductDialog = false" />
                    <Button label="Yes" icon="pi pi-check" @click="deleteProduct" />
                </template>
            </Dialog>

            <Dialog v-model:visible="deleteProductsDialog" :style="{ width: '50vw', maxWidth: '500px', minWidth: '300px' }" 
                header="Confirm" :modal="true" class="delete-dialog">
                <div class="flex items-center gap-4">
                    <i class="pi pi-exclamation-triangle !text-3xl" />
                    <span>Are you sure you want to delete the selected products/services?</span>
                </div>
                <template #footer>
                    <Button label="No" icon="pi pi-times" text @click="deleteProductsDialog = false" />
                    <Button label="Yes" icon="pi pi-check" text @click="deleteSelectedProducts" />
                </template>
            </Dialog>
        </div>
    </VerticalLayout>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue';
import { FilterMatchMode } from '@primevue/core/api';
import { useToast } from 'primevue/usetoast';
import { api } from '@/services/authService';
import Toolbar from 'primevue/toolbar';
import Button from 'primevue/button';
import DataTable from 'primevue/datatable';
import Column from 'primevue/column';
import Tag from 'primevue/tag';
import IconField from 'primevue/iconfield';
import InputIcon from 'primevue/inputicon';
import InputText from 'primevue/inputtext';
import Dialog from 'primevue/dialog';
import Select from 'primevue/select';
import Textarea from 'primevue/textarea';
import FileUpload from 'primevue/fileupload';
import VerticalLayout from '@/layouts/VerticalLayout.vue';
import Tooltip from 'primevue/tooltip';

const toast = useToast();
const dt = ref();
const products = ref([]);
const productDialog = ref(false);
const deleteProductDialog = ref(false);
const deleteProductsDialog = ref(false);
const newCategoryDialog = ref(false);
const newSubcategoryDialog = ref(false);
const product = ref({});
const selectedProducts = ref([]);
const loading = ref(false);
const filters = ref({
    global: { value: null, matchMode: FilterMatchMode.CONTAINS },
});
const submitted = ref(false);
const submittedCategory = ref(false);
const submittedSubcategory = ref(false);
const categories = ref([]);
const subcategories = ref([]);
const companies = ref([]);
const newCategory = ref({ name: '', description: '' });
const newSubcategory = ref({ name: '', description: '' });

// Type options
const types = ref([
    { label: 'Product', value: 'Product' },
    { label: 'Service', value: 'Service' },
]);

// Status options
const statusOptions = ref([
    { label: 'Active', value: true },
    { label: 'Inactive', value: false },
]);

// Computed property for filtered subcategories
const filteredSubcategories = computed(() => {
    return subcategories.value.filter(sub => sub.category_id === product.value.category_id);
});

// Computed property for selected category name
const selectedCategoryName = computed(() => {
    const selectedCategory = categories.value.find(cat => cat.id === product.value.category_id);
    return selectedCategory ? selectedCategory.name : 'Select a category first';
});

// Dynamic save button label
const saveButtonLabel = computed(() => {
    return product.value.id ? 'Update' : 'Create';
});

// Fetch data on mount
onMounted(async () => {
    await Promise.all([
        fetchProducts(),
        fetchCategoriesWithSubcategories(),
        fetchCompanies(),
    ]);
});

// Fetch products
const fetchProducts = async () => {
    try {
        loading.value = true;
        const response = await api.get('marketplaces/products/');
        products.value = response.data.results || response.data;
    } catch (error) {
        console.error('Failed to fetch products:', error);
        toast.add({ severity: 'error', summary: 'Error', detail: 'Failed to fetch products', life: 3000 });
        handleApiError(error);
    } finally {
        loading.value = false;
    }
};

// Fetch categories with subcategories
const fetchCategoriesWithSubcategories = async () => {
    try {
        const response = await api.get('marketplaces/categories-with-subcategories/');
        categories.value = response.data || [];
        // Flatten subcategories for easier filtering
        subcategories.value = [];
        categories.value.forEach(cat => {
            if (cat.subcategories) {
                cat.subcategories.forEach(sub => {
                    subcategories.value.push({
                        ...sub,
                        category_id: cat.id // Add category_id for filtering
                    });
                });
            }
        });
    } catch (error) {
        console.error('Failed to fetch categories with subcategories:', error);
        toast.add({ severity: 'error', summary: 'Error', detail: 'Failed to fetch categories and subcategories', life: 3000 });
        handleApiError(error);
    }
};



// Handle API errors
const handleApiError = (error) => {
    if (error.response?.status === 401) {
        toast.add({ severity: 'warn', summary: 'Authentication Error', detail: 'Please log in again', life: 3000 });
    } else if (error.response?.status === 404) {
        toast.add({ severity: 'error', summary: 'Not Found', detail: 'Requested resource not found', life: 3000 });
    } else if (error.response?.status === 405) {
        toast.add({ severity: 'error', summary: 'Method Not Allowed', detail: 'Invalid request method', life: 3000 });
    }
};

// Format date
const formatDate = (dateString) => {
    return dateString ? new Date(dateString).toLocaleString('en-US') : '-';
};

// Open new product dialog
const openNew = () => {
    product.value = {
        is_active: true,
        type: 'Product',
        description: '',
        category_id: null,
        subcategory_id: null,
    };
    submitted.value = false;
    productDialog.value = true;
};

// Hide dialog
const hideDialog = () => {
    productDialog.value = false;
    submitted.value = false;
    product.value = {};
};

// Update subcategories when category changes
const updateSubcategories = () => {
    product.value.subcategory_id = null; // Reset subcategory
};

// Handle image selection
const onImageSelect = (event) => {
    product.value.featured_image = event.files[0];
};

// Open new category dialog
const openNewCategoryDialog = () => {
    newCategory.value = { name: '', description: '' };
    submittedCategory.value = false;
    newCategoryDialog.value = true;
};

// Create new category
const createCategory = async () => {
    submittedCategory.value = true;

    if (!newCategory.value.name?.trim()) {
        toast.add({ severity: 'warn', summary: 'Validation Error', detail: 'Category name is required', life: 3000 });
        return;
    }

    try {
        const response = await api.post('marketplaces/categories/', {
            name: newCategory.value.name,
            description: newCategory.value.description
        });
        await fetchCategoriesWithSubcategories();
        product.value.category_id = response.data.id; // Auto-select new category
        toast.add({ severity: 'success', summary: 'Successful', detail: 'Category Created', life: 3000 });
        newCategoryDialog.value = false;
        newCategory.value = { name: '', description: '' };
        submittedCategory.value = false;
    } catch (error) {
        if (error.response && error.response.status === 400) {
            const errors = error.response.data;
            for (const [field, messages] of Object.entries(errors)) {
                toast.add({ severity: 'error', summary: `Validation Error: ${field}`, detail: messages.join(', '), life: 3000 });
            }
        } else {
            console.error('Failed to create category:', error);
            toast.add({ severity: 'error', summary: 'Error', detail: 'Failed to create category', life: 3000 });
            handleApiError(error);
        }
    }
};

// Open new subcategory dialog
const openNewSubcategoryDialog = () => {
    if (!product.value.category_id) {
        toast.add({ severity: 'warn', summary: 'Validation Error', detail: 'Please select a category first', life: 3000 });
        return;
    }
    newSubcategory.value = { name: '', description: '' };
    submittedSubcategory.value = false;
    newSubcategoryDialog.value = true;
};

// Create new subcategory
const createSubcategory = async () => {
    submittedSubcategory.value = true;

    if (!newSubcategory.value.name?.trim()) {
        toast.add({ severity: 'warn', summary: 'Validation Error', detail: 'Subcategory name is required', life: 3000 });
        return;
    }

    if (!product.value.category_id) {
        toast.add({ severity: 'warn', summary: 'Validation Error', detail: 'Please select a category first', life: 3000 });
        return;
    }

    try {
        const response = await api.post('marketplaces/subcategories/', {
            name: newSubcategory.value.name,
            description: newSubcategory.value.description,
            category: product.value.category_id
        });
        await fetchCategoriesWithSubcategories();
        product.value.subcategory_id = response.data.id; // Auto-select new subcategory
        toast.add({ severity: 'success', summary: 'Successful', detail: 'Subcategory Created', life: 3000 });
        newSubcategoryDialog.value = false;
        newSubcategory.value = { name: '', description: '' };
        submittedSubcategory.value = false;
    } catch (error) {
        if (error.response && error.response.status === 400) {
            const errors = error.response.data;
            for (const [field, messages] of Object.entries(errors)) {
                toast.add({ severity: 'error', summary: `Validation Error: ${field}`, detail: messages.join(', '), life: 3000 });
            }
        } else {
            console.error('Failed to create subcategory:', error);
            toast.add({ severity: 'error', summary: 'Error', detail: 'Failed to create subcategory', life: 3000 });
            handleApiError(error);
        }
    }
};

// Save product
const saveProduct = async () => {
    submitted.value = true;

    if (!product.value.name?.trim()) {
        toast.add({ severity: 'warn', summary: 'Validation Error', detail: 'Name is required', life: 3000 });
        return;
    }
    if (!product.value.company_id) {
        toast.add({ severity: 'warn', summary: 'Validation Error', detail: 'Company is required', life: 3000 });
        return;
    }
    if (!product.value.category_id) {
        toast.add({ severity: 'warn', summary: 'Validation Error', detail: 'Category is required', life: 3000 });
        return;
    }
    if (!product.value.subcategory_id) {
        toast.add({ severity: 'warn', summary: 'Validation Error', detail: 'Subcategory is required', life: 3000 });
        return;
    }
    if (!product.value.type) {
        toast.add({ severity: 'warn', summary: 'Validation Error', detail: 'Type is required', life: 3000 });
        return;
    }

    try {
        const formData = new FormData();
        Object.entries(product.value).forEach(([key, value]) => {
            if (key === 'featured_image' && value instanceof File) {
                formData.append(key, value);
            } else if (key !== 'featured_image_url' && value !== null && value !== undefined) {
                formData.append(key, value);
            }
        });

        if (product.value.id) {
            await api.put(`marketplaces/products/${product.value.id}/`, formData, {
                headers: { 'Content-Type': 'multipart/form-data' },
            });
            toast.add({ severity: 'success', summary: 'Successful', detail: 'Product Updated', life: 3000 });
        } else {
            await api.post('marketplaces/products/', formData, {
                headers: { 'Content-Type': 'multipart/form-data' },
            });
            toast.add({ severity: 'success', summary: 'Successful', detail: 'Product Created', life: 3000 });
        }
        await fetchProducts();
        productDialog.value = false;
        product.value = {};
        submitted.value = false;
    } catch (error) {
        if (error.response && error.response.status === 400) {
            const errors = error.response.data;
            for (const [field, messages] of Object.entries(errors)) {
                toast.add({ severity: 'error', summary: `Validation Error: ${field}`, detail: messages.join(', '), life: 3000 });
            }
        } else {
            console.error('Failed to save product:', error);
            toast.add({ severity: 'error', summary: 'Error', detail: 'Failed to save product', life: 3000 });
            handleApiError(error);
        }
    }
};

// Edit product
const editProduct = (p) => {
    product.value = {
        ...p,
        company_id: p.company.id,
        category_id: p.category.id,
        subcategory_id: p.subcategory.id,
        featured_image_url: p.featured_image,
    };
    productDialog.value = true;
};

// Confirm delete single product
const confirmDeleteProduct = (p) => {
    product.value = p;
    deleteProductDialog.value = true;
};

// Delete single product
const deleteProduct = async () => {
    try {
        await api.delete(`marketplaces/products/${product.value.id}/`);
        await fetchProducts();
        deleteProductDialog.value = false;
        product.value = {};
        toast.add({ severity: 'success', summary: 'Successful', detail: 'Product Deleted', life: 3000 });
    } catch (error) {
        console.error('Failed to delete product:', error);
        toast.add({ severity: 'error', summary: 'Error', detail: 'Failed to delete product', life: 3000 });
        handleApiError(error);
    }
};

// Deactivate product
const deactivateProduct = async (p) => {
    try {
        await api.post(`marketplaces/products/${p.id}/deactivate/`);
        await fetchProducts();
        toast.add({ severity: 'success', summary: 'Successful', detail: 'Product Deactivated', life: 3000 });
    } catch (error) {
        console.error('Failed to deactivate product:', error);
        toast.add({ severity: 'error', summary: 'Error', detail: 'Failed to deactivate product', life: 3000 });
        handleApiError(error);
    }
};

// Activate product
const activateProduct = async (p) => {
    try {
        await api.post(`marketplaces/products/${p.id}/activate/`);
        await fetchProducts();
        toast.add({ severity: 'success', summary: 'Successful', detail: 'Product Activated', life: 3000 });
    } catch (error) {
        console.error('Failed to activate product:', error);
        toast.add({ severity: 'error', summary: 'Error', detail: 'Failed to activate product', life: 3000 });
        handleApiError(error);
    }
};

// Confirm delete selected products
const confirmDeleteSelected = () => {
    deleteProductsDialog.value = true;
};

// Delete selected products
const deleteSelectedProducts = async () => {
    try {
        await Promise.all(selectedProducts.value.map(p => 
            api.delete(`marketplaces/products/${p.id}/`)
        ));
        await fetchProducts();
        deleteProductsDialog.value = false;
        selectedProducts.value = [];
        toast.add({ severity: 'success', summary: 'Successful', detail: 'Products Deleted', life: 3000 });
    } catch (error) {
        console.error('Failed to delete products:', error);
        toast.add({ severity: 'error', summary: 'Error', detail: 'Failed to delete products', life: 3000 });
        handleApiError(error);
    }
};

// Export to CSV
const exportCSV = () => {
    dt.value.exportCSV();
};
</script>

<style scoped>
.form-control {
    width: 100%;
    padding: 0.5rem;
    border: 1px solid #ced4da;
    border-radius: 4px;
}

@media (max-width: 768px) {
    .product-dialog :deep(.p-dialog-content),
    .category-dialog :deep(.p-dialog-content),
    .subcategory-dialog :deep(.p-dialog-content) {
        padding: 1rem;
    }
    .product-dialog :deep(.p-dialog),
    .category-dialog :deep(.p-dialog),
    .subcategory-dialog :deep(.p-dialog) {
        width: 90vw !important;
        min-width: 0 !important;
    }
}

@media (max-width: 480px) {
    .product-dialog :deep(.p-dialog-content),
    .category-dialog :deep(.p-dialog-content),
    .subcategory-dialog :deep(.p-dialog-content) {
        padding: 0.5rem;
    }
    .product-dialog :deep(.p-dialog),
    .category-dialog :deep(.p-dialog),
    .subcategory-dialog :deep(.p-dialog) {
        width: 95vw !important;
    }
    .delete-dialog :deep(.p-dialog) {
        width: 90vw !important;
    }
}
</style>