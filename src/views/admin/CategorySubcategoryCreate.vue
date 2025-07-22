<template>
    <VerticalLayout>
        <div class="card">
            <Toolbar class="mb-6">
                <template #start>
                    <Button label="New Category" icon="pi pi-plus" class="mx-2" @click="openNew" />
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

        <!-- Category Dialog -->
        <Dialog v-model:visible="categoryDialog" :style="{ width: '80vw', maxWidth: '800px', minWidth: '300px' }" 
            header="Category Details" :modal="true" class="category-dialog">
            <div class="flex flex-col gap-6">
                <div>
                    <label for="name" class="block font-bold mb-3">Category Name</label>
                    <InputText id="name" v-model.trim="category.name" required autofocus 
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
                                required :invalid="submitted && !newSubcategory.name" fluid 
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

        <!-- Delete and Edit Dialogs unchanged -->
        <!-- ... -->

    </VerticalLayout>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue';
import { FilterMatchMode } from '@primevue/core/api';
import { useToast } from 'primevue/usetoast';
import { api } from '@/services/authService';
import VerticalLayout from '@/layouts/VerticalLayout.vue';
import Chip from 'primevue/chip';

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
const removedSubcategoryIds = ref([]);

// Fetch categories with nested subcategories
const fetchCategories = async () => {
    loading.value = true;
    try {
        const response = await api.get('tenders/categories-with-subcategories/');
        categories.value = response.data;
    } catch (err) {
        toast.add({ severity: 'error', summary: 'Error', detail: 'Failed to fetch categories', life: 3000 });
    } finally {
        loading.value = false;
    }
};

onMounted(fetchCategories);

const openNew = () => {
    category.value = { name: '', subcategories: [] };
    removedSubcategoryIds.value = [];
    submitted.value = false;
    isAddingSubcategory.value = false;
    newSubcategory.value = { name: '', description: '' };
    categoryDialog.value = true;
};

const hideDialog = () => {
    categoryDialog.value = false;
    submitted.value = false;
    isAddingSubcategory.value = false;
    editSubcategoryDialog.value = false;
    removedSubcategoryIds.value = [];
};

const startAddingSubcategory = () => {
    isAddingSubcategory.value = true;
    newSubcategory.value = { name: '', description: '' };
};

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

const editSubcategory = (index) => {
    editedSubcategory.value = { ...category.value.subcategories[index] };
    editingSubcategoryIndex.value = index;
    editSubcategoryDialog.value = true;
};

const saveEditedSubcategory = () => {
    submitted.value = true;
    if (!editedSubcategory.value.name.trim()) {
        toast.add({ severity: 'warn', summary: 'Validation Error', detail: 'Subcategory name is required', life: 3000 });
        return;
    }
    category.value.subcategories[editingSubcategoryIndex.value] = { ...editedSubcategory.value };
    editSubcategoryDialog.value = false;
};

const confirmDeleteSubcategory = (index) => {
    subcategoryToDelete.value = category.value.subcategories[index];
    editingSubcategoryIndex.value = index;
    deleteSubcategoryDialog.value = true;
};

const deleteSubcategory = () => {
    if (subcategoryToDelete.value.id) {
        removedSubcategoryIds.value.push(subcategoryToDelete.value.id);
    }
    category.value.subcategories.splice(editingSubcategoryIndex.value, 1);
    deleteSubcategoryDialog.value = false;
    toast.add({ severity: 'success', summary: 'Removed', detail: 'Subcategory marked for deletion', life: 3000 });
};

const saveCategory = async () => {
    submitted.value = true;
    if (!category.value.name.trim()) {
        toast.add({ severity: 'warn', summary: 'Validation Error', detail: 'Category name is required', life: 3000 });
        return;
    }
    if (category.value.subcategories.some(sub => !sub.name.trim())) {
        toast.add({ severity: 'warn', summary: 'Validation Error', detail: 'All subcategory names are required', life: 3000 });
        return;
    }

    try {
        const payload = { name: category.value.name };
        if (category.value.id) {
            payload.subcategories = [
                ...category.value.subcategories.map(sub => sub.id ? { id: sub.id, name: sub.name, description: sub.description } : { name: sub.name, description: sub.description }),
                ...removedSubcategoryIds.value.map(id => ({ id, _destroy: true }))
            ];
            await api.patch(`tenders/categories-with-subcategories/${category.value.slug}/`, payload);
            toast.add({ severity: 'success', summary: 'Updated', detail: 'Category updated', life: 3000 });
        } else {
            payload.subcategories = category.value.subcategories;
            const res = await api.post('tenders/categories-with-subcategories/', payload);
            toast.add({ severity: 'success', summary: 'Created', detail: `Category "${res.data.name}" created`, life: 3000 });
        }
        hideDialog();
        await fetchCategories();
    } catch (err) {
        if (err.response && err.response.status === 400) {
            Object.entries(err.response.data).forEach(([field, msgs]) => {
                toast.add({ severity: 'error', summary: field, detail: msgs.join(', '), life: 3000 });
            });
        } else {
            toast.add({ severity: 'error', summary: 'Error', detail: 'Failed to save category', life: 3000 });
        }
    }
};

const editCategory = (cat) => {
    category.value = JSON.parse(JSON.stringify(cat));
    removedSubcategoryIds.value = [];
    categoryDialog.value = true;
};

const confirmDeleteCategory = (cat) => {
    category.value = cat;
    deleteCategoryDialog.value = true;
};

const deleteCategory = async () => {
    try {
        // Use main categories endpoint for delete
        await api.delete(`tenders/categories/${category.value.slug}/`);
        toast.add({ severity: 'success', summary: 'Deleted', detail: 'Category deleted', life: 3000 });
        deleteCategoryDialog.value = false;
        await fetchCategories();
    } catch {
        toast.add({ severity: 'error', summary: 'Error', detail: 'Failed to delete category', life: 3000 });
    }
};

const confirmDeleteSelected = () => { deleteCategoriesDialog.value = true; };
const deleteSelectedCategories = async () => {
    try {
        await Promise.all(selectedCategories.value.map(cat => 
            api.delete(`tenders/categories/${cat.slug}/`)
        ));
        toast.add({ severity: 'success', summary: 'Deleted', detail: 'Selected categories deleted', life: 3000 });
        deleteCategoriesDialog.value = false;
        await fetchCategories();
    } catch {
        toast.add({ severity: 'error', summary: 'Error', detail: 'Failed to delete selected', life: 3000 });
    }
};

const exportCSV = () => dt.value.exportCSV();
const saveButtonLabel = computed(() => category.value.id ? 'Update' : 'Create');
</script>

<style scoped>
/* (styles unchanged) */
</style>
