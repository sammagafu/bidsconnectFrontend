<template>
    <VerticalLayout>
        <div class="card">
            <Toolbar class="mb-6">
                <template #start>
                    <Button label="New Process" icon="pi pi-plus" class="mr-2" @click="openNew" />
                    <Button label="Delete Selected" icon="pi pi-trash" severity="danger" outlined 
                        @click="confirmDeleteSelected" :disabled="!selectedProcesses || !selectedProcesses.length" />
                </template>
                <template #end>
                    <Button label="Export" icon="pi pi-upload" severity="secondary" @click="exportCSV" />
                </template>
            </Toolbar>

            <DataTable
                ref="dt"
                v-model:selection="selectedProcesses"
                :value="procurementProcesses"
                dataKey="id"
                :paginator="true"
                :rows="10"
                :filters="filters"
                paginatorTemplate="FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink CurrentPageReport RowsPerPageDropdown"
                :rowsPerPageOptions="[5, 10, 25]"
                currentPageReportTemplate="Showing {first} to {last} of {totalRecords} processes"
                :loading="loading"
            >
                <template #header>
                    <div class="flex flex-wrap gap-2 items-center justify-between">
                        <h4 class="m-0">Manage Procurement Processes</h4>
                        <IconField>
                            <InputIcon>
                                <i class="pi pi-search" />
                            </InputIcon>
                            <InputText v-model="filters['global'].value" placeholder="Search..." />
                        </IconField>
                    </div>
                </template>
                <template #empty> No procurement processes found. </template>
                <template #loading> Loading processes data. Please wait. </template>

                <Column selectionMode="multiple" style="width: 3rem" :exportable="false"></Column>
                <Column field="name" header="Name" sortable style="min-width: 16rem"></Column>
                <Column field="type" header="Type" sortable style="min-width: 12rem">
                    <template #body="slotProps">
                        <span>{{ getTypeDisplay(slotProps.data.type) }}</span>
                    </template>
                </Column>
                <Column field="description" header="Description" sortable style="min-width: 16rem"></Column>
                <Column :exportable="false" style="min-width: 12rem">
                    <template #body="slotProps">
                        <Button icon="pi pi-pencil" outlined rounded class="mr-2" 
                            @click="editProcess(slotProps.data)" />
                        <Button icon="pi pi-trash" outlined rounded severity="danger" 
                            @click="confirmDeleteProcess(slotProps.data)" />
                    </template>
                </Column>
            </DataTable>
        </div>

        <Dialog v-model:visible="processDialog" :style="{ width: '80vw', maxWidth: '800px', minWidth: '300px' }" 
            header="Procurement Process Details" :modal="true" class="process-dialog">
            <div class="flex flex-col gap-6">
                <div>
                    <label for="name" class="block font-bold mb-3">Name</label>
                    <InputText id="name" v-model.trim="procurementProcess.name" required="true" autofocus 
                        :invalid="submitted && !procurementProcess.name" fluid maxlength="100" />
                    <small v-if="submitted && !procurementProcess.name" class="text-red-500">Name is required.</small>
                </div>
                <div>
                    <label for="type" class="block font-bold mb-3">Type</label>
                    <Select id="type" v-model="procurementProcess.type" :options="processTypes" 
                        optionLabel="label" optionValue="value" placeholder="Select Type" fluid />
                    <small v-if="submitted && !procurementProcess.type" class="text-red-500">Type is required.</small>
                </div>
                <div>
                    <label for="description" class="block font-bold mb-3">Description</label>
                    <Textarea id="description" v-model="procurementProcess.description" rows="3" cols="20" fluid />
                </div>
            </div>

            <template #footer>
                <Button label="Cancel" icon="pi pi-times" text @click="hideDialog" />
                <Button :label="saveButtonLabel" icon="pi pi-check" @click="saveProcurementProcess" />
            </template>
        </Dialog>

        <Dialog v-model:visible="deleteProcessDialog" :style="{ width: '50vw', maxWidth: '500px', minWidth: '300px' }" 
            header="Confirm" :modal="true" class="delete-dialog">
            <div class="flex items-center gap-4">
                <i class="pi pi-exclamation-triangle !text-3xl" />
                <span v-if="procurementProcess">Are you sure you want to delete <b>{{ procurementProcess.name }}</b>?</span>
            </div>
            <template #footer>
                <Button label="No" icon="pi pi-times" text @click="deleteProcessDialog = false" />
                <Button label="Yes" icon="pi pi-check" @click="deleteProcess" />
            </template>
        </Dialog>

        <Dialog v-model:visible="deleteProcessesDialog" :style="{ width: '50vw', maxWidth: '500px', minWidth: '300px' }" 
            header="Confirm" :modal="true" class="delete-dialog">
            <div class="flex items-center gap-4">
                <i class="pi pi-exclamation-triangle !text-3xl" />
                <span>Are you sure you want to delete the selected procurement processes?</span>
            </div>
            <template #footer>
                <Button label="No" icon="pi pi-times" text @click="deleteProcessesDialog = false" />
                <Button label="Yes" icon="pi pi-check" text @click="deleteSelectedProcesses" />
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
const procurementProcesses = ref([]);
const processDialog = ref(false);
const deleteProcessDialog = ref(false);
const deleteProcessesDialog = ref(false);
const procurementProcess = ref({});
const selectedProcesses = ref();
const loading = ref(false);
const filters = ref({
    global: { value: null, matchMode: FilterMatchMode.CONTAINS },
});
const submitted = ref(false);

// Procurement process types from the model
const processTypes = ref([
    { label: 'Open Tendering', value: 'open' },
    { label: 'Selective Tendering', value: 'selective' },
    { label: 'Limited Tendering', value: 'limited' },
    { label: 'Direct Procurement', value: 'direct' }
]);

// Fetch procurement processes on mount
onMounted(async () => {
    await fetchProcurementProcesses();
});

// Fetch procurement processes
const fetchProcurementProcesses = async () => {
    try {
        loading.value = true;
        const response = await api.get('tenders/procurement-processes/');
        procurementProcesses.value = response.data.results || response.data || [];
    } catch (error) {
        console.error('Failed to fetch procurement processes:', error);
        toast.add({ severity: 'error', summary: 'Error', detail: 'Failed to fetch procurement processes', life: 3000 });
    } finally {
        loading.value = false;
    }
};

// Get type display for table
const getTypeDisplay = (type) => {
    const processType = processTypes.value.find(pt => pt.value === type);
    return processType ? processType.label : type;
};

// Open new process dialog
const openNew = () => {
    procurementProcess.value = { name: '', type: '', description: '' };
    submitted.value = false;
    processDialog.value = true;
};

// Hide dialog
const hideDialog = () => {
    processDialog.value = false;
    submitted.value = false;
};

// Save procurement process (create or update)
const saveProcurementProcess = async () => {
    submitted.value = true;

    if (!procurementProcess.value.name?.trim()) {
        toast.add({ severity: 'warn', summary: 'Validation Error', detail: 'Name is required', life: 3000 });
        return;
    }
    if (!procurementProcess.value.type) {
        toast.add({ severity: 'warn', summary: 'Validation Error', detail: 'Type is required', life: 3000 });
        return;
    }

    try {
        if (procurementProcess.value.slug) {
            await api.put(`tenders/procurement-processes/${procurementProcess.value.slug}/`, procurementProcess.value);
            toast.add({ severity: 'success', summary: 'Successful', detail: 'Procurement Process Updated', life: 3000 });
        } else {
            await api.post('tenders/procurement-processes/', procurementProcess.value);
            toast.add({ severity: 'success', summary: 'Successful', detail: 'Procurement Process Created', life: 3000 });
        }
        await fetchProcurementProcesses();
        processDialog.value = false;
        procurementProcess.value = {};
    } catch (error) {
        if (error.response && error.response.status === 400) {
            const errors = error.response.data;
            for (const [field, messages] of Object.entries(errors)) {
                toast.add({ severity: 'error', summary: `Validation Error: ${field}`, detail: messages.join(', '), life: 3000 });
            }
        } else {
            console.error('Failed to save procurement process:', error);
            toast.add({ severity: 'error', summary: 'Error', detail: 'Failed to save procurement process', life: 3000 });
        }
    }
};

// Edit procurement process
const editProcess = (proc) => {
    procurementProcess.value = { ...proc };
    processDialog.value = true;
};

// Confirm delete single process
const confirmDeleteProcess = (proc) => {
    procurementProcess.value = proc;
    deleteProcessDialog.value = true;
};

// Delete single process
const deleteProcess = async () => {
    try {
        await api.delete(`tenders/procurement-processes/${procurementProcess.value.slug}/`);
        await fetchProcurementProcesses();
        deleteProcessDialog.value = false;
        procurementProcess.value = {};
        toast.add({ severity: 'success', summary: 'Successful', detail: 'Procurement Process Deleted', life: 3000 });
    } catch (error) {
        console.error('Failed to delete procurement process:', error);
        toast.add({ severity: 'error', summary: 'Error', detail: 'Failed to delete procurement process', life: 3000 });
    }
};

// Confirm delete selected processes
const confirmDeleteSelected = () => {
    deleteProcessesDialog.value = true;
};

// Delete selected processes
const deleteSelectedProcesses = async () => {
    try {
        await Promise.all(selectedProcesses.value.map(proc => 
            api.delete(`tenders/procurement-processes/${proc.slug}/`)
        ));
        await fetchProcurementProcesses();
        deleteProcessesDialog.value = false;
        selectedProcesses.value = null;
        toast.add({ severity: 'success', summary: 'Successful', detail: 'Procurement Processes Deleted', life: 3000 });
    } catch (error) {
        console.error('Failed to delete procurement processes:', error);
        toast.add({ severity: 'error', summary: 'Error', detail: 'Failed to delete procurement processes', life: 3000 });
    }
};

// Export to CSV
const exportCSV = () => {
    dt.value.exportCSV();
};

// Dynamic label for the save button
const saveButtonLabel = computed(() => {
    return procurementProcess.value.slug ? 'Update' : 'Create';
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
    .process-dialog :deep(.p-dialog-content) {
        padding: 1rem;
    }
    .process-dialog :deep(.p-dialog) {
        width: 90vw !important;
        min-width: 0 !important;
    }
}

@media (max-width: 480px) {
    .process-dialog :deep(.p-dialog-content) {
        padding: 0.5rem;
    }
    .process-dialog :deep(.p-dialog) {
        width: 95vw !important;
    }
    .delete-dialog :deep(.p-dialog) {
        width: 90vw !important;
    }
}
</style>