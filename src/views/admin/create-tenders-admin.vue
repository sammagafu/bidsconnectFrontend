<template>
    <VerticalLayout>
        <div class="card">
            <Toolbar class="mb-6">
                <template #start>
                    <Button label="New Tender" icon="pi pi-plus" class="mr-2" @click="openNew" />
                    <Button label="Delete Selected" icon="pi pi-trash" severity="danger" outlined 
                        @click="confirmDeleteSelected" :disabled="!selectedTenders || !selectedTenders.length" />
                </template>
                <template #end>
                    <Button label="Export" icon="pi pi-upload" severity="secondary" @click="exportCSV" />
                </template>
            </Toolbar>

            <DataTable
                ref="dt"
                v-model:selection="selectedTenders"
                :value="tenders"
                dataKey="id"
                :paginator="true"
                :rows="10"
                :filters="filters"
                paginatorTemplate="FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink CurrentPageReport RowsPerPageDropdown"
                :rowsPerPageOptions="[5, 10, 25]"
                currentPageReportTemplate="Showing {first} to {last} of {totalRecords} tenders"
                :loading="loading"
            >
                <template #header>
                    <div class="flex flex-wrap gap-2 items-center justify-between">
                        <h4 class="m-0">Manage Tenders</h4>
                        <IconField>
                            <InputIcon>
                                <i class="pi pi-search" />
                            </InputIcon>
                            <InputText v-model="filters['global'].value" placeholder="Search..." />
                        </IconField>
                    </div>
                </template>
                <template #empty> No tenders found. </template>
                <template #loading> Loading tenders data. Please wait. </template>

                <Column selectionMode="multiple" style="width: 3rem" :exportable="false"></Column>
                <Column field="title" header="Title" sortable style="min-width: 16rem"></Column>
                <Column field="reference_number" header="Reference Number" sortable style="min-width: 12rem"></Column>
                <Column field="tender_type_country" header="Country Type" sortable style="min-width: 12rem"></Column>
                <Column field="tender_type_sector" header="Sector Type" sortable style="min-width: 12rem"></Column>
                <Column field="category.name" header="Category" sortable style="min-width: 12rem"></Column>
                <Column field="subcategory.name" header="Subcategory" sortable style="min-width: 12rem"></Column>
                <Column field="status" header="Status" sortable style="min-width: 10rem">
                    <template #body="slotProps">
                        <Tag :value="slotProps.data.status" :severity="getStatusLabel(slotProps.data.status)" />
                    </template>
                </Column>
                <Column field="submission_deadline" header="Submission Deadline" sortable style="min-width: 12rem">
                    <template #body="slotProps">
                        {{ formatDate(slotProps.data.submission_deadline) }}
                    </template>
                </Column>
                <Column field="created_at" header="Created" sortable style="min-width: 12rem">
                    <template #body="slotProps">
                        {{ formatDate(slotProps.data.created_at) }}
                    </template>
                </Column>
                <Column :exportable="false" style="min-width: 12rem">
                    <template #body="slotProps">
                        <Button v-if="slotProps.data.status === 'draft'" icon="pi pi-check" 
                            outlined rounded class="mr-2" @click="publishTender(slotProps.data)" 
                            v-tooltip="'Publish Tender'" />
                        <Button icon="pi pi-pencil" outlined rounded class="mr-2" 
                            @click="editTender(slotProps.data)" />
                        <Button icon="pi pi-trash" outlined rounded severity="danger" 
                            @click="confirmDeleteTender(slotProps.data)" />
                    </template>
                </Column>
            </DataTable>
        </div>

        <Dialog v-model:visible="tenderDialog" :style="{ width: '80vw', maxWidth: '800px', minWidth: '300px' }" 
            header="Tender Details" :modal="true" class="tender-dialog">
            <div class="flex flex-col gap-6">
                <div>
                    <label for="title" class="block font-bold mb-3">Title</label>
                    <InputText id="title" v-model.trim="tender.title" required="true" autofocus 
                        :invalid="submitted && !tender.title" fluid />
                    <small v-if="submitted && !tender.title" class="text-red-500">Title is required.</small>
                </div>
                <div>
                    <label for="reference_number" class="block font-bold mb-3">Reference Number</label>
                    <InputText id="reference_number" v-model="tender.reference_number" required="true" fluid />
                    <small v-if="submitted && !tender.reference_number" class="text-red-500">Reference Number is required.</small>
                </div>
                <div>
                    <label for="tender_type_country" class="block font-bold mb-3">Tender Type (Country)</label>
                    <Select id="tender_type_country" v-model="tender.tender_type_country" 
                        :options="tenderTypeCountries" optionLabel="label" optionValue="value" 
                        placeholder="Select Country Type" fluid />
                </div>
                <div>
                    <label for="tender_type_sector" class="block font-bold mb-3">Tender Type (Sector)</label>
                    <Select id="tender_type_sector" v-model="tender.tender_type_sector" 
                        :options="tenderTypeSectors" optionLabel="label" optionValue="value" 
                        placeholder="Select Sector Type" fluid />
                </div>
                <div>
                    <label for="tenderdescription" class="block font-bold mb-3">Description</label>
                    <Textarea id="tenderdescription" v-model="tender.tenderdescription" rows="3" cols="20" fluid />
                </div>
                <div>
                    <label for="category" class="block font-bold mb-3">Category</label>
                    <Select id="category" v-model="tender.category_id" :options="categories" 
                        optionLabel="name" optionValue="id" placeholder="Select Category" fluid />
                </div>
                <div>
                    <label for="subcategory" class="block font-bold mb-3">Subcategory</label>
                    <Select id="subcategory" v-model="tender.subcategory_id" 
                        :options="subcategories.filter(sub => sub.category.id === tender.category_id)" 
                        optionLabel="name" optionValue="id" placeholder="Select Subcategory" fluid />
                </div>
                <div>
                    <label for="procurement_process" class="block font-bold mb-3">Procurement Process</label>
                    <Select id="procurement_process" v-model="tender.procurement_process_id" 
                        :options="procurementProcesses" optionLabel="name" optionValue="id" 
                        placeholder="Select Procurement Process" fluid :disabled="loadingProcurementProcesses" />
                    <small v-if="loadingProcurementProcesses" class="text-gray-500">Loading procurement processes...</small>
                    <small v-else-if="submitted && !tender.procurement_process_id" class="text-red-500">Procurement Process is required.</small>
                </div>
                <div>
                    <label for="submission_deadline" class="block font-bold mb-3">Submission Deadline</label>
                    <input type="datetime-local" id="submission_deadline" v-model="tender.submission_deadline" 
                        class="form-control w-full p-2 border rounded" />
                </div>
                <div>
                    <label for="clarification_deadline" class="block font-bold mb-3">Clarification Deadline</label>
                    <input type="datetime-local" id="clarification_deadline" v-model="tender.clarification_deadline" 
                        class="form-control w-full p-2 border rounded" />
                </div>
                <div>
                    <label for="evaluation_start_date" class="block font-bold mb-3">Evaluation Start Date</label>
                    <input type="datetime-local" id="evaluation_start_date" v-model="tender.evaluation_start_date" 
                        class="form-control w-full p-2 border rounded" />
                </div>
                <div>
                    <label for="evaluation_end_date" class="block font-bold mb-3">Evaluation End Date</label>
                    <input type="datetime-local" id="evaluation_end_date" v-model="tender.evaluation_end_date" 
                        class="form-control w-full p-2 border rounded" />
                </div>
                <div>
                    <label for="estimated_budget" class="block font-bold mb-3">Estimated Budget</label>
                    <InputNumber id="estimated_budget" v-model="tender.estimated_budget" mode="decimal" 
                        :minFractionDigits="2" fluid />
                </div>
                <div>
                    <label for="currency" class="block font-bold mb-3">Currency</label>
                    <Select id="currency" v-model="tender.currency" :options="currencies" 
                        optionLabel="label" optionValue="value" placeholder="Select Currency" fluid />
                </div>
                <div>
                    <label for="bid_bond_percentage" class="block font-bold mb-3">Bid Bond Percentage</label>
                    <InputNumber id="bid_bond_percentage" v-model="tender.bid_bond_percentage" 
                        mode="decimal" :minFractionDigits="2" :maxFractionDigits="2" fluid />
                </div>
                <div>
                    <label for="address" class="block font-bold mb-3">Address</label>
                    <Textarea id="address" v-model="tender.address" rows="3" cols="20" fluid />
                </div>
            </div>

            <template #footer>
                <Button label="Cancel" icon="pi pi-times" text @click="hideDialog" />
                <Button :label="saveButtonLabel" icon="pi pi-check" @click="saveTender" />
            </template>
        </Dialog>

        <Dialog v-model:visible="deleteTenderDialog" :style="{ width: '50vw', maxWidth: '500px', minWidth: '300px' }" 
            header="Confirm" :modal="true" class="delete-dialog">
            <div class="flex items-center gap-4">
                <i class="pi pi-exclamation-triangle !text-3xl" />
                <span v-if="tender">Are you sure you want to delete <b>{{ tender.title }}</b>?</span>
            </div>
            <template #footer>
                <Button label="No" icon="pi pi-times" text @click="deleteTenderDialog = false" />
                <Button label="Yes" icon="pi pi-check" @click="deleteTender" />
            </template>
        </Dialog>

        <Dialog v-model:visible="deleteTendersDialog" :style="{ width: '50vw', maxWidth: '500px', minWidth: '300px' }" 
            header="Confirm" :modal="true" class="delete-dialog">
            <div class="flex items-center gap-4">
                <i class="pi pi-exclamation-triangle !text-3xl" />
                <span>Are you sure you want to delete the selected tenders?</span>
            </div>
            <template #footer>
                <Button label="No" icon="pi pi-times" text @click="deleteTendersDialog = false" />
                <Button label="Yes" icon="pi pi-check" text @click="deleteSelectedTenders" />
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

const toast = useToast();
const dt = ref();
const tenders = ref([]);
const tenderDialog = ref(false);
const deleteTenderDialog = ref(false);
const deleteTendersDialog = ref(false);
const tender = ref({});
const selectedTenders = ref();
const loading = ref(false);
const loadingProcurementProcesses = ref(false); // New loading state for procurement processes
const filters = ref({
    global: { value: null, matchMode: FilterMatchMode.CONTAINS },
});
const submitted = ref(false);
const categories = ref([]);
const subcategories = ref([]);
const procurementProcesses = ref([]);

// Tender statuses
const statuses = ref([
    { label: 'Draft', value: 'draft' },
    { label: 'Pending Approval', value: 'pending' },
    { label: 'Published', value: 'published' },
    { label: 'Under Evaluation', value: 'evaluation' },
    { label: 'Awarded', value: 'awarded' },
    { label: 'Closed', value: 'closed' },
    { label: 'Canceled', value: 'canceled' },
]);

// Currency options
const currencies = ref([
    { label: 'TZS', value: 'TZS' },
    { label: 'USD', value: 'USD' },
    { label: 'EUR', value: 'EUR' },
]);

// Tender Type Country options
const tenderTypeCountries = ref([
    { label: 'National Tendering', value: 'National' },
    { label: 'International Tendering', value: 'International' },
]);

// Tender Type Sector options
const tenderTypeSectors = ref([
    { label: 'Private Company Tendering', value: 'Private Company' },
    { label: 'Public Sector Tendering', value: 'Public Sector' },
    { label: 'Non-Governmental Organization Tendering', value: 'Non-Governmental Organization' },
    { label: 'Government Agency Tendering', value: 'Government Agency' },
]);

// Fetch all necessary data on mount
onMounted(async () => {
    await Promise.all([
        fetchTenders(),
        fetchCategories(),
        fetchSubcategories(),
        fetchProcurementProcesses(),
    ]);
});

// Fetch tenders
const fetchTenders = async () => {
    try {
        loading.value = true;
        const response = await api.get('tenders/tenders/');
        tenders.value = response.data.results || [];
    } catch (error) {
        console.error('Failed to fetch tenders:', error);
        toast.add({ severity: 'error', summary: 'Error', detail: 'Failed to fetch tenders', life: 3000 });
    } finally {
        loading.value = false;
    }
};

// Fetch categories
const fetchCategories = async () => {
    try {
        const response = await api.get('tenders/categories/');
        categories.value = response.data || [];
    } catch (error) {
        console.error('Failed to fetch categories:', error);
        toast.add({ severity: 'error', summary: 'Error', detail: 'Failed to fetch categories', life: 3000 });
    }
};

// Fetch subcategories
const fetchSubcategories = async () => {
    try {
        const response = await api.get('tenders/subcategories/');
        subcategories.value = response.data || [];
    } catch (error) {
        console.error('Failed to fetch subcategories:', error);
        toast.add({ severity: 'error', summary: 'Error', detail: 'Failed to fetch subcategories', life: 3000 });
    }
};

// Fetch procurement processes from the API
const fetchProcurementProcesses = async () => {
    try {
        loadingProcurementProcesses.value = true;
        const response = await api.get('tenders/procurement-processes/');
        procurementProcesses.value = response.data.results || response.data || [];
    } catch (error) {
        console.error('Failed to fetch procurement processes:', error);
        toast.add({ severity: 'error', summary: 'Error', detail: 'Failed to fetch procurement processes', life: 3000 });
        procurementProcesses.value = [];
    } finally {
        loadingProcurementProcesses.value = false;
    }
};

// Format date for display
const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString('en-US');
};

// Open new tender dialog
const openNew = () => {
    tender.value = { 
        status: 'draft',
        tender_type_country: 'National',
        tender_type_sector: 'Private Company',
        currency: 'TZS',
        tenderdescription: 'tender description to be updated',
    };
    submitted.value = false;
    tenderDialog.value = true;
};

// Hide dialog
const hideDialog = () => {
    tenderDialog.value = false;
    submitted.value = false;
};

// Save tender (create or update) with validation
const saveTender = async () => {
    submitted.value = true;

    // Validate required fields
    if (!tender.value.title?.trim()) {
        toast.add({ severity: 'warn', summary: 'Validation Error', detail: 'Title is required', life: 3000 });
        return;
    }
    if (!tender.value.reference_number?.trim()) {
        toast.add({ severity: 'warn', summary: 'Validation Error', detail: 'Reference Number is required', life: 3000 });
        return;
    }
    if (!tender.value.procurement_process_id) {
        toast.add({ severity: 'warn', summary: 'Validation Error', detail: 'Procurement Process is required', life: 3000 });
        return;
    }

    try {
        if (tender.value.slug) {
            await api.put(`tenders/tenders/${tender.value.slug}/`, tender.value);
            toast.add({ severity: 'success', summary: 'Successful', detail: 'Tender Updated', life: 3000 });
        } else {
            await api.post('tenders/tenders/', tender.value);
            toast.add({ severity: 'success', summary: 'Successful', detail: 'Tender Created', life: 3000 });
        }
        await fetchTenders();
        tenderDialog.value = false;
        tender.value = {};
    } catch (error) {
        if (error.response && error.response.status === 400) {
            const errors = error.response.data;
            for (const [field, messages] of Object.entries(errors)) {
                toast.add({ severity: 'error', summary: `Validation Error: ${field}`, detail: messages.join(', '), life: 3000 });
            }
        } else {
            console.error('Failed to save tender:', error);
            toast.add({ severity: 'error', summary: 'Error', detail: 'Failed to save tender', life: 3000 });
        }
    }
};

// Edit tender
const editTender = (t) => {
    tender.value = { 
        ...t, 
        category_id: t.category?.id, 
        subcategory_id: t.subcategory?.id, 
        procurement_process_id: t.procurement_process?.id,
        tender_type_country: t.tender_type_country,
        tender_type_sector: t.tender_type_sector,
    };
    tenderDialog.value = true;
};

// Confirm delete single tender
const confirmDeleteTender = (t) => {
    tender.value = t;
    deleteTenderDialog.value = true;
};

// Delete single tender
const deleteTender = async () => {
    try {
        await api.delete(`tenders/tenders/${tender.value.slug}/`);
        await fetchTenders();
        deleteTenderDialog.value = false;
        tender.value = {};
        toast.add({ severity: 'success', summary: 'Successful', detail: 'Tender Deleted', life: 3000 });
    } catch (error) {
        console.error('Failed to delete tender:', error);
        toast.add({ severity: 'error', summary: 'Error', detail: 'Failed to delete tender', life: 3000 });
    }
};

// Publish (approve) tender
const publishTender = async (t) => {
    try {
        await api.post(`tenders/tenders/${t.slug}/publish/`);
        await fetchTenders();
        toast.add({ severity: 'success', summary: 'Successful', detail: 'Tender Published', life: 3000 });
    } catch (error) {
        console.error('Failed to publish tender:', error);
        toast.add({ severity: 'error', summary: 'Error', detail: 'Failed to publish tender', life: 3000 });
    }
};

// Export to CSV
const exportCSV = () => {
    dt.value.exportCSV();
};

// Confirm delete selected tenders
const confirmDeleteSelected = () => {
    deleteTendersDialog.value = true;
};

// Delete selected tenders
const deleteSelectedTenders = async () => {
    try {
        await Promise.all(selectedTenders.value.map(t => 
            api.delete(`tenders/tenders/${t.slug}/`)
        ));
        await fetchTenders();
        deleteTendersDialog.value = false;
        selectedTenders.value = null;
        toast.add({ severity: 'success', summary: 'Successful', detail: 'Tenders Deleted', life: 3000 });
    } catch (error) {
        console.error('Failed to delete tenders:', error);
        toast.add({ severity: 'error', summary: 'Error', detail: 'Failed to delete tenders', life: 3000 });
    }
};

// Get status label for Tag severity
const getStatusLabel = (status) => {
    switch (status) {
        case 'published': return 'success';
        case 'draft': return 'warning';
        case 'pending': return 'warning';
        case 'evaluation': return 'info';
        case 'awarded': return 'info';
        case 'closed': return 'danger';
        case 'canceled': return 'danger';
        default: return null;
    }
};

// Dynamic label for the save button
const saveButtonLabel = computed(() => {
    return tender.value.slug ? 'Update' : 'Create';
});
</script>

<style scoped>
.form-control {
    width: 100%;
    padding: 0.5rem;
    border: 1px solid #ced4da;
    border-radius: 4px;
}

/* Responsive dialog styles */
@media (max-width: 768px) {
    .tender-dialog :deep(.p-dialog-content) {
        padding: 1rem;
    }
    .tender-dialog :deep(.p-dialog) {
        width: 90vw !important;
        min-width: 0 !important;
    }
}

@media (max-width: 480px) {
    .tender-dialog :deep(.p-dialog-content) {
        padding: 0.5rem;
    }
    .tender-dialog :deep(.p-dialog) {
        width: 95vw !important;
    }
    .delete-dialog :deep(.p-dialog) {
        width: 90vw !important;
    }
}
</style>

<!-- change number to tender number -->
 //TODO: add a new field for tender number