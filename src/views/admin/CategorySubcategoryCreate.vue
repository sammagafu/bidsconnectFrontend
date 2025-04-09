<template>
    <VerticalLayout>
        <div class="card">
            <Toolbar class="mb-6">
                <template #start>
                    <Button label="New Category" icon="pi pi-plus" class="mr-2" @click="openNew" />
                    <Button label="Delete Selected" icon="pi pi-trash" severity="danger" outlined 
                        @click="confirmDeleteSelected" :disabled="!selectedCategories || !selectedCategories.length" />
                </template>
                <template #end>
                    <Button label="Export" icon="pi pi-upload" severity="secondary" @click="exportCSV" />
                </template>
            </Toolbar>

            <DataTable
                ref="dt"
                v-model:selection="selectedCategories"
                :value="categories"
                dataKey="id"
                :paginator="true"
                :rows="10"
                :filters="filters"
                paginatorTemplate="FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink CurrentPageReport RowsPerPageDropdown"
                :rowsPerPageOptions="[5, 10, 25]"
                currentPageReportTemplate="Showing {first} to {last} of {totalRecords} categories"
                :loading="loading"
            >
                <template #header>
                    <div class="flex flex-wrap gap-2 items-center justify-between">
                        <h4 class="m-0">Manage Categories</h4>
                        <IconField>
                            <InputIcon>
                                <i class="pi pi-search" />
                            </InputIcon>
                            <InputText v-model="filters['global'].value" placeholder="Search..." />
                        </IconField>
                    </div>
                </template>
                <template #empty> No categories found. </template>
                <template #loading> Loading categories data. Please wait. </template>

                <Column selectionMode="multiple" style="width: 3rem" :exportable="false"></Column>
                <Column field="name" header="Name" sortable style="min-width: 16rem"></Column>
                <Column field="subcategories" header="Subcategories" style="min-width: 20rem">
                    <template #body="slotProps">
                        <div class="flex flex-wrap gap-2">
                            <Chip v-for="(subcategory, index) in slotProps.data.subcategories" :key="index" 
                                :label="subcategory.name" />
                        </div>
                    </template>
                </Column>
                <Column :exportable="false" style="min-width: 12rem">
                    <template #body="slotProps">
                        <Button icon="pi pi-pencil" outlined rounded class="mr-2" 
                            @click="editCategory(slotProps.data)" />
                        <Button icon="pi pi-trash" outlined rounded severity="danger" 
                            @click="confirmDeleteCategory(slotProps.data)" />
                    </template>
                </Column>
            </DataTable>
        </div>

        <Dialog v-model:visible="categoryDialog" :style="{ width: '80vw', maxWidth: '800px', minWidth: '300px' }" 
            header="Category Details" :modal="true" class="category-dialog">
            <div class="flex flex-col gap-6">
                <div>
                    <label for="name" class="block font-bold mb-3">Category Name</label>
                    <InputText id="name" v-model.trim="category.name" required="true" autofocus 
                        :invalid="submitted && !category.name" fluid />
                    <small v-if="submitted && !category.name" class="text-red-500">Category name is required.</small>
                </div>

                <div>
                    <div class="flex justify-between items-center mb-3">
                        <h4 class="font-bold">Subcategories</h4>
                        <Button label="Add Subcategory" icon="pi pi-plus" severity="secondary" 
                            @click="startAddingSubcategory" />
                    </div>
                    <div v-if="isAddingSubcategory" class="flex flex-col gap-4 mb-4">
                        <div>
                            <label for="new-subcategory-name" class="block font-bold mb-2">New Subcategory Name</label>
                            <InputText id="new-subcategory-name" v-model.trim="newSubcategory.name" 
                                required="true" :invalid="submitted && !newSubcategory.name" fluid 
                                placeholder="Enter subcategory name" />
                            <small v-if="submitted && !newSubcategory.name" class="text-red-500">Subcategory name is required.</small>
                        </div>
                        <div>
                            <label for="new-subcategory-desc" class="block font-bold mb-2">Description</label>
                            <Textarea id="new-subcategory-desc" v-model="newSubcategory.description" 
                                rows="3" cols="20" fluid placeholder="Enter description (optional)" />
                        </div>
                        <Button label="Add" icon="pi pi-check" severity="success" 
                            @click="addSubcategory" />
                    </div>
                    <div v-if="category.subcategories && category.subcategories.length > 0" class="flex flex-col gap-2">
                        <div v-for="(subcategory, index) in category.subcategories" :key="index" 
                            class="flex items-center gap-2">
                            <Chip :label="subcategory.name" />
                            <Button icon="pi pi-pencil" outlined rounded severity="secondary" 
                                @click="editSubcategory(index)" />
                            <Button icon="pi pi-trash" outlined rounded severity="danger" 
                                @click="confirmDeleteSubcategory(index)" />
                        </div>
                    </div>
                    <p v-else class="text-gray-500">No subcategories added yet. Click "Add Subcategory" to start.</p>
                </div>
            </div>

            <template #footer>
                <Button label="Cancel" icon="pi pi-times" text @click="hideDialog" />
                <Button :label="saveButtonLabel" icon="pi pi-check" @click="saveCategory" />
            </template>
        </Dialog>

        <Dialog v-model:visible="deleteCategoryDialog" :style="{ width: '50vw', maxWidth: '500px', minWidth: '300px' }" 
            header="Confirm" :modal="true" class="delete-dialog">
            <div class="flex items-center gap-4">
                <i class="pi pi-exclamation-triangle !text-3xl" />
                <span v-if="category">Are you sure you want to delete <b>{{ category.name }}</b>?</span>
            </div>
            <template #footer>
                <Button label="No" icon="pi pi-times" text @click="deleteCategoryDialog = false" />
                <Button label="Yes" icon="pi pi-check" @click="deleteCategory" />
            </template>
        </Dialog>

        <Dialog v-model:visible="deleteCategoriesDialog" :style="{ width: '50vw', maxWidth: '500px', minWidth: '300px' }" 
            header="Confirm" :modal="true" class="delete-dialog">
            <div class="flex items-center gap-4">
                <i class="pi pi-exclamation-triangle !text-3xl" />
                <span>Are you sure you want to delete the selected categories?</span>
            </div>
            <template #footer>
                <Button label="No" icon="pi pi-times" text @click="deleteCategoriesDialog = false" />
                <Button label="Yes" icon="pi pi-check" text @click="deleteSelectedCategories" />
            </template>
        </Dialog>

        <Dialog v-model:visible="deleteSubcategoryDialog" :style="{ width: '50vw', maxWidth: '500px', minWidth: '300px' }" 
            header="Confirm" :modal="true" class="delete-dialog">
            <div class="flex items-center gap-4">
                <i class="pi pi-exclamation-triangle !text-3xl" />
                <span v-if="subcategoryToDelete">Are you sure you want to delete subcategory <b>{{ subcategoryToDelete.name }}</b>?</span>
            </div>
            <template #footer>
                <Button label="No" icon="pi pi-times" text @click="deleteSubcategoryDialog = false" />
                <Button label="Yes" icon="pi pi-check" @click="deleteSubcategory" />
            </template>
        </Dialog>

        <Dialog v-model:visible="editSubcategoryDialog" :style="{ width: '50vw', maxWidth: '500px', minWidth: '300px' }" 
            header="Edit Subcategory" :modal="true" class="edit-dialog">
            <div class="flex flex-col gap-4">
                <div>
                    <label for="edit-subcategory-name" class="block font-bold mb-2">Subcategory Name</label>
                    <InputText id="edit-subcategory-name" v-model.trim="editedSubcategory.name" 
                        required="true" :invalid="submitted && !editedSubcategory.name" fluid />
                    <small v-if="submitted && !editedSubcategory.name" class="text-red-500">Subcategory name is required.</small>
                </div>
                <div>
                    <label for="edit-subcategory-desc" class="block font-bold mb-2">Description</label>
                    <Textarea id="edit-subcategory-desc" v-model="editedSubcategory.description" 
                        rows="3" cols="20" fluid />
                </div>
            </div>
            <template #footer>
                <Button label="Cancel" icon="pi pi-times" text @click="editSubcategoryDialog = false" />
                <Button label="Save" icon="pi pi-check" @click="saveEditedSubcategory" />
            </template>
        </Dialog>
    </VerticalLayout>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue';
import { FilterMatchMode } from '@primevue/core/api';
import { useToast } from 'primevue/usetoast';
import { api } from '@/services/authService'; // Pre-configured axios instance
import VerticalLayout from '@/layouts/VerticalLayout.vue';
import Chip from 'primevue/chip'; // Import Chip component

const toast = useToast();
const dt = ref();
const categories = ref([]);
const categoryDialog = ref(false);
const deleteCategoryDialog = ref(false);
const deleteCategoriesDialog = ref(false);
const deleteSubcategoryDialog = ref(false);
const editSubcategoryDialog = ref(false);
const category = ref({ name: '', subcategories: [] });
const selectedCategories = ref();
const loading = ref(false);
const filters = ref({
    global: { value: null, matchMode: FilterMatchMode.CONTAINS },
});
const submitted = ref(false);
const isAddingSubcategory = ref(false);
const newSubcategory = ref({ name: '', description: '' });
const subcategoryToDelete = ref(null);
const editedSubcategory = ref({ name: '', description: '' });
const editingSubcategoryIndex = ref(null);

// Fetch categories on mount
onMounted(async () => {
    await fetchCategories();
});

// Fetch categories from the backend with subcategories
const fetchCategories = async () => {
    try {
        loading.value = true;
        const response = await api.get('tenders/categories/');
        categories.value = response.data || [];
        // Fetch subcategories for each category
        await Promise.all(categories.value.map(async (cat) => {
            const subResponse = await api.get('tenders/subcategories/', {
                params: { category__id: cat.id }
            });
            cat.subcategories = subResponse.data || [];
        }));
    } catch (error) {
        console.error('Failed to fetch categories:', error);
        toast.add({ severity: 'error', summary: 'Error', detail: 'Failed to fetch categories', life: 3000 });
    } finally {
        loading.value = false;
    }
};

// Fetch subcategories for a given category
const fetchSubcategories = async (categoryId) => {
    try {
        const response = await api.get('tenders/subcategories/', {
            params: { category__id: categoryId }
        });
        category.value.subcategories = response.data || [];
    } catch (error) {
        console.error('Failed to fetch subcategories:', error);
        toast.add({ severity: 'error', summary: 'Error', detail: 'Failed to fetch subcategories', life: 3000 });
        category.value.subcategories = [];
    }
};

// Open new category dialog
const openNew = () => {
    category.value = { name: '', subcategories: [] };
    submitted.value = false;
    isAddingSubcategory.value = false;
    newSubcategory.value = { name: '', description: '' };
    categoryDialog.value = true;
};

// Hide dialog
const hideDialog = () => {
    categoryDialog.value = false;
    submitted.value = false;
    isAddingSubcategory.value = false;
    editSubcategoryDialog.value = false;
};

// Start adding a new subcategory
const startAddingSubcategory = () => {
    isAddingSubcategory.value = true;
    newSubcategory.value = { name: '', description: '' };
};

// Add a new subcategory
const addSubcategory = () => {
    submitted.value = true;
    if (!newSubcategory.value.name.trim()) {
        toast.add({ severity: 'warn', summary: 'Validation Error', detail: 'Subcategory name is required', life: 3000 });
        return;
    }
    category.value.subcategories.push({ ...newSubcategory.value });
    isAddingSubcategory.value = false;
    newSubcategory.value = { name: '', description: '' };
};

// Edit a subcategory
const editSubcategory = (index) => {
    editedSubcategory.value = { ...category.value.subcategories[index] };
    editingSubcategoryIndex.value = index;
    editSubcategoryDialog.value = true;
};

// Save edited subcategory
const saveEditedSubcategory = () => {
    submitted.value = true;
    if (!editedSubcategory.value.name.trim()) {
        toast.add({ severity: 'warn', summary: 'Validation Error', detail: 'Subcategory name is required', life: 3000 });
        return;
    }
    category.value.subcategories[editingSubcategoryIndex.value] = { ...editedSubcategory.value };
    editSubcategoryDialog.value = false;
};

// Confirm delete subcategory
const confirmDeleteSubcategory = (index) => {
    subcategoryToDelete.value = category.value.subcategories[index];
    editingSubcategoryIndex.value = index;
    deleteSubcategoryDialog.value = true;
};

// Delete subcategory
const deleteSubcategory = async () => {
    try {
        if (subcategoryToDelete.value.id) {
            await api.delete(`tenders/subcategories/${subcategoryToDelete.value.slug}/`);
        }
        category.value.subcategories.splice(editingSubcategoryIndex.value, 1);
        deleteSubcategoryDialog.value = false;
        subcategoryToDelete.value = null;
        toast.add({ severity: 'success', summary: 'Successful', detail: 'Subcategory Deleted', life: 3000 });
    } catch (error) {
        console.error('Failed to delete subcategory:', error);
        toast.add({ severity: 'error', summary: 'Error', detail: 'Failed to delete subcategory', life: 3000 });
    }
};

// Remove a subcategory by index (local removal before save)
const removeSubcategory = (index) => {
    confirmDeleteSubcategory(index);
};

// Save category (create or update) with subcategories
const saveCategory = async () => {
    submitted.value = true;

    if (!category.value.name?.trim()) {
        toast.add({ severity: 'warn', summary: 'Validation Error', detail: 'Category name is required', life: 3000 });
        return;
    }
    if (category.value.subcategories.some(sub => !sub.name?.trim())) {
        toast.add({ severity: 'warn', summary: 'Validation Error', detail: 'All subcategory names are required', life: 3000 });
        return;
    }

    try {
        if (category.value.id) {
            // Update existing category (only name)
            await api.put(`tenders/categories/${category.value.slug}/`, { name: category.value.name });
            // Save new subcategories
            const newSubcategories = category.value.subcategories.filter(sub => !sub.id);
            if (newSubcategories.length > 0) {
                await Promise.all(newSubcategories.map(sub => 
                    api.post('tenders/subcategories/', {
                        category_id: category.value.id,
                        name: sub.name,
                        description: sub.description
                    })
                ));
            }
            toast.add({ severity: 'success', summary: 'Successful', detail: 'Category Updated', life: 3000 });
        } else {
            // Create new category with subcategories
            const response = await api.post('tenders/categories-with-subcategories/', {
                name: category.value.name,
                subcategories: category.value.subcategories
            });
            toast.add({ severity: 'success', summary: 'Successful', detail: `Category "${response.data.name}" Created`, life: 3000 });
        }
        await fetchCategories();
        categoryDialog.value = false;
        category.value = { name: '', subcategories: [] };
    } catch (error) {
        if (error.response && error.response.status === 400) {
            const errors = error.response.data;
            for (const [field, messages] of Object.entries(errors)) {
                toast.add({ severity: 'error', summary: `Validation Error: ${field}`, detail: messages.join(', '), life: 3000 });
            }
        } else {
            console.error('Failed to save category:', error);
            toast.add({ severity: 'error', summary: 'Error', detail: 'Failed to save category', life: 3000 });
        }
    }
};

// Edit category
const editCategory = async (cat) => {
    category.value = { ...cat, subcategories: [] };
    await fetchSubcategories(cat.id);
    categoryDialog.value = true;
};

// Confirm delete single category
const confirmDeleteCategory = (cat) => {
    category.value = cat;
    deleteCategoryDialog.value = true;
};

// Delete single category
const deleteCategory = async () => {
    try {
        await api.delete(`tenders/categories/${category.value.slug}/`);
        await fetchCategories();
        deleteCategoryDialog.value = false;
        category.value = { name: '', subcategories: [] };
        toast.add({ severity: 'success', summary: 'Successful', detail: 'Category Deleted', life: 3000 });
    } catch (error) {
        console.error('Failed to delete category:', error);
        toast.add({ severity: 'error', summary: 'Error', detail: 'Failed to delete category', life: 3000 });
    }
};

// Confirm delete selected categories
const confirmDeleteSelected = () => {
    deleteCategoriesDialog.value = true;
};

// Delete selected categories
const deleteSelectedCategories = async () => {
    try {
        await Promise.all(selectedCategories.value.map(cat => 
            api.delete(`tenders/categories/${cat.slug}/`)
        ));
        await fetchCategories();
        deleteCategoriesDialog.value = false;
        selectedCategories.value = null;
        toast.add({ severity: 'success', summary: 'Successful', detail: 'Categories Deleted', life: 3000 });
    } catch (error) {
        console.error('Failed to delete categories:', error);
        toast.add({ severity: 'error', summary: 'Error', detail: 'Failed to delete categories', life: 3000 });
    }
};

// Export to CSV
const exportCSV = () => {
    dt.value.exportCSV();
};

// Dynamic label for the save button
const saveButtonLabel = computed(() => {
    return category.value.id ? 'Update' : 'Create';
});
</script>

<style scoped>
.form-control {
    width: 100%;
    padding: 0.5rem;
    border: 1px solid #ced4da;
    border-radius: 4px;
}

.border {
    border: 1px solid #e5e7eb;
}

.p-4 {
    padding: 1rem;
}

.rounded {
    border-radius: 0.375rem;
}

/* Responsive dialog styles */
@media (max-width: 768px) {
    .category-dialog :deep(.p-dialog-content),
    .edit-dialog :deep(.p-dialog-content) {
        padding: 1rem;
    }
    .category-dialog :deep(.p-dialog),
    .edit-dialog :deep(.p-dialog) {
        width: 90vw !important;
        min-width: 0 !important;
    }
}

@media (max-width: 480px) {
    .category-dialog :deep(.p-dialog-content),
    .edit-dialog :deep(.p-dialog-content) {
        padding: 0.5rem;
    }
    .category-dialog :deep(.p-dialog),
    .edit-dialog :deep(.p-dialog) {
        width: 95vw !important;
    }
    .delete-dialog :deep(.p-dialog) {
        width: 90vw !important;
    }
}
</style>