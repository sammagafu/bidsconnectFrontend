<template>
    <VerticalLayout>
      <div class="card">
        <Toolbar class="mb-6">
          <template #start>
            <Button label="New Company" icon="pi pi-plus" class="mr-2" @click="openNew" />
            <Button
              label="Delete Selected"
              icon="pi pi-trash"
              severity="danger"
              outlined
              @click="confirmDeleteSelected"
              :disabled="!selectedCompanies || !selectedCompanies.length"
            />
          </template>
          <template #end>
            <Button label="Export" icon="pi pi-upload" severity="secondary" @click="exportCSV" />
          </template>
        </Toolbar>
  
        <DataTable
          ref="dt"
          v-model:selection="selectedCompanies"
          :value="companies"
          dataKey="id"
          :paginator="true"
          :rows="10"
          :filters="filters"
          paginatorTemplate="FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink CurrentPageReport RowsPerPageDropdown"
          :rowsPerPageOptions="[5, 10, 25]"
          currentPageReportTemplate="Showing {first} to {last} of {totalRecords} companies"
          :loading="loading"
        >
          <template #header>
            <div class="d-flex flex-wrap gap-2 align-items-center justify-content-between">
              <h4 class="m-0">Manage Companies</h4>
              <IconField>
                <InputIcon>
                  <i class="pi pi-search" />
                </InputIcon>
                <InputText v-model="filters['global'].value" placeholder="Search..." />
              </IconField>
            </div>
          </template>
          <template #empty> No companies found. </template>
          <template #loading> Loading companies data. Please wait. </template>
  
          <Column selectionMode="multiple" style="width: 3rem" :exportable="false"></Column>
          <Column field="name" header="Name" sortable style="min-width: 16rem"></Column>
          <Column field="email" header="Email" sortable style="min-width: 12rem"></Column>
          <Column field="owner_email" header="Owner" sortable style="min-width: 12rem"></Column>
          <Column header="Logo">
            <template #body="slotProps">
              <img
                v-if="slotProps.data.logo"
                :src="slotProps.data.logo"
                :alt="slotProps.data.name"
                class="rounded"
                style="width: 64px"
              />
            </template>
          </Column>
          <Column field="status" header="Status" sortable style="min-width: 10rem">
            <template #body="slotProps">
              <Tag :value="slotProps.data.status" :severity="getStatusLabel(slotProps.data.status)" />
            </template>
          </Column>
          <Column field="created_at" header="Created" sortable style="min-width: 12rem">
            <template #body="slotProps">
              {{ formatDate(slotProps.data.created_at) }}
            </template>
          </Column>
          <Column :exportable="false" style="min-width: 12rem">
            <template #body="slotProps">
              <Button
                icon="pi pi-check"
                outlined
                rounded
                class="mr-2"
                @click="approveCompany(slotProps.data)"
                v-tooltip="'Approve Company'"
              />
              <Button
                icon="pi pi-times"
                outlined
                rounded
                severity="danger"
                class="mr-2"
                @click="confirmDeclineCompany(slotProps.data)"
                v-tooltip="'Decline Approval'"
              />
              <Button
                icon="pi pi-eye"
                outlined
                rounded
                class="mr-2"
                @click="viewCompany(slotProps.data)"
                v-tooltip="'View Details'"
              />
              <Button
                icon="pi pi-trash"
                outlined
                rounded
                severity="danger"
                @click="confirmDeleteCompany(slotProps.data)"
              />
            </template>
          </Column>
        </DataTable>
      </div>
  
      <Dialog
        v-model:visible="companyDialog"
        :style="{ width: '450px' }"
        header="Company Details"
        :modal="true"
      >
        <div class="d-flex flex-column gap-3">
          <div>
            <label for="name" class="d-block font-weight-bold mb-2">Company Name</label>
            <InputText
              id="name"
              v-model.trim="company.name"
              required="true"
              autofocus
              :invalid="submitted && !company.name"
              class="w-100"
            />
            <small v-if="submitted && !company.name" class="text-danger">Name is required.</small>
          </div>
          <div>
            <label for="email" class="d-block font-weight-bold mb-2">Email</label>
            <InputText id="email" v-model="company.email" type="email" class="w-100" />
          </div>
          <div>
            <label for="description" class="d-block font-weight-bold mb-2">Description</label>
            <Textarea id="description" v-model="company.description" rows="3" cols="20" class="w-100" />
          </div>
          <div>
            <label for="status" class="d-block font-weight-bold mb-2">Status</label>
            <Select
              id="status"
              v-model="company.status"
              :options="statuses"
              optionLabel="label"
              placeholder="Select Status"
              class="w-100"
            />
          </div>
          <div>
            <label for="industry" class="d-block font-weight-bold mb-2">Industry</label>
            <InputText id="industry" v-model="company.industry" class="w-100" />
          </div>
        </div>
  
        <template #footer>
          <Button label="Cancel" icon="pi pi-times" text @click="hideDialog" />
          <Button label="Save" icon="pi pi-check" @click="saveCompany" />
        </template>
      </Dialog>
  
      <Dialog
        v-model:visible="deleteCompanyDialog"
        :style="{ width: '450px' }"
        header="Confirm"
        :modal="true"
      >
        <div class="d-flex align-items-center gap-3">
          <i class="pi pi-exclamation-triangle text-danger" style="font-size: 2rem;" />
          <span v-if="company">Are you sure you want to delete <b>{{ company.name }}</b>?</span>
        </div>
        <template #footer>
          <Button label="No" icon="pi pi-times" text @click="deleteCompanyDialog = false" />
          <Button label="Yes" icon="pi pi-check" @click="deleteCompany" />
        </template>
      </Dialog>
  
      <Dialog
        v-model:visible="deleteCompaniesDialog"
        :style="{ width: '450px' }"
        header="Confirm"
        :modal="true"
      >
        <div class="d-flex align-items-center gap-3">
          <i class="pi pi-exclamation-triangle text-danger" style="font-size: 2rem;" />
          <span>Are you sure you want to delete the selected companies?</span>
        </div>
        <template #footer>
          <Button label="No" icon="pi pi-times" text @click="deleteCompaniesDialog = false" />
          <Button label="Yes" icon="pi pi-check" text @click="deleteSelectedCompanies" />
        </template>
      </Dialog>
  
      <Dialog
        v-model:visible="declineCompanyDialog"
        :style="{ width: '450px' }"
        header="Decline Company Approval"
        :modal="true"
      >
        <div class="d-flex flex-column gap-3">
          <div class="d-flex align-items-center gap-3">
            <i class="pi pi-exclamation-triangle text-danger" style="font-size: 2rem;" />
            <span v-if="company">Are you sure you want to decline approval for <b>{{ company.name }}</b>?</span>
          </div>
          <div>
            <label for="declineRemarks" class="d-block font-weight-bold mb-2">Reason for Decline</label>
            <Textarea
              id="declineRemarks"
              v-model="declineRemarks"
              rows="3"
              cols="20"
              class="w-100"
              placeholder="Enter the reason for declining approval..."
              required
            />
            <small v-if="submittedDecline && !declineRemarks" class="text-danger">Reason is required.</small>
          </div>
        </div>
        <template #footer>
          <Button label="Cancel" icon="pi pi-times" text @click="declineCompanyDialog = false" />
          <Button label="Decline" icon="pi pi-check" @click="declineCompany" />
        </template>
      </Dialog>
    </VerticalLayout>
  </template>
  
  <script setup>
  import { ref, onMounted } from 'vue';
  import { FilterMatchMode } from '@primevue/core/api';
  import { useToast } from 'primevue/usetoast';
  import { useRouter } from 'vue-router';
  import { api } from '@/services/authService';
  import { useAuthStore } from '@/stores/auth';
  import VerticalLayout from '@/layouts/VerticalLayout.vue';
  
  const router = useRouter();
  const toast = useToast();
  const authStore = useAuthStore();
  const dt = ref();
  const companies = ref([]);
  const companyDialog = ref(false);
  const deleteCompanyDialog = ref(false);
  const deleteCompaniesDialog = ref(false);
  const declineCompanyDialog = ref(false);
  const company = ref({});
  const selectedCompanies = ref();
  const loading = ref(false);
  const declineRemarks = ref('');
  const submittedDecline = ref(false);
  const filters = ref({
    global: { value: null, matchMode: FilterMatchMode.CONTAINS },
  });
  const submitted = ref(false);
  const statuses = ref([
    { label: 'Pending', value: 'pending' },
    { label: 'Active', value: 'active' },
    { label: 'Inactive', value: 'inactive' },
    { label: 'Suspended', value: 'suspended' },
  ]);
  
  onMounted(async () => {
    await fetchCompanies();
  });
  
  const fetchCompanies = async () => {
    try {
      loading.value = true;
      const response = await api.get('accounts/companies/admin/');
      companies.value = response.data;
    } catch (error) {
      console.error('Failed to fetch companies:', error);
      toast.add({ severity: 'error', summary: 'Error', detail: 'Failed to fetch companies', life: 3000 });
    } finally {
      loading.value = false;
    }
  };
  
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US');
  };
  
  const openNew = () => {
    company.value = { status: 'pending' };
    submitted.value = false;
    companyDialog.value = true;
  };
  
  const hideDialog = () => {
    companyDialog.value = false;
    submitted.value = false;
  };
  
  const saveCompany = async () => {
    submitted.value = true;
    if (!company.value.name?.trim()) return;
  
    try {
      if (company.value.id) {
        await api.put(`accounts/companies/${company.value.id}/`, company.value);
        toast.add({ severity: 'success', summary: 'Successful', detail: 'Company Updated', life: 3000 });
      } else {
        await api.post('accounts/companies/', company.value);
        toast.add({ severity: 'success', summary: 'Successful', detail: 'Company Created', life: 3000 });
      }
      await fetchCompanies();
      companyDialog.value = false;
      company.value = {};
    } catch (error) {
      console.error('Failed to save company:', error);
      toast.add({ severity: 'error', summary: 'Error', detail: 'Failed to save company', life: 3000 });
    }
  };
  
  const viewCompany = (comp) => {
    router.push(`/company/${comp.id}`);
  };
  
  const confirmDeleteCompany = (comp) => {
    company.value = comp;
    deleteCompanyDialog.value = true;
  };
  
  const deleteCompany = async () => {
    try {
      await api.delete(`accounts/companies/${company.value.id}/`);
      companies.value = companies.value.filter(val => val.id !== company.value.id);
      deleteCompanyDialog.value = false;
      company.value = {};
      toast.add({ severity: 'success', summary: 'Successful', detail: 'Company Deleted', life: 3000 });
    } catch (error) {
      console.error('Failed to delete company:', error);
      toast.add({ severity: 'error', summary: 'Error', detail: 'Failed to delete company', life: 3000 });
    }
  };
  
  const approveCompany = async (comp) => {
    try {
      await api.patch(`accounts/companies/${comp.id}/`, { status: 'active', is_verified: true });
      await fetchCompanies();
      toast.add({ severity: 'success', summary: 'Successful', detail: 'Company Approved', life: 3000 });
    } catch (error) {
      console.error('Failed to approve company:', error);
      toast.add({ severity: 'error', summary: 'Error', detail: 'Failed to approve company', life: 3000 });
    }
  };
  
  const confirmDeclineCompany = (comp) => {
    company.value = comp;
    declineRemarks.value = ''; // Reset remarks
    submittedDecline.value = false;
    declineCompanyDialog.value = true;
  };
  
  const declineCompany = async () => {
    submittedDecline.value = true;
    if (!declineRemarks.value.trim()) return;
  
    try {
      const payload = {
        status: 'inactive',
        is_verified: false,
        decline_reason: declineRemarks.value,
        declined_by: authStore.user?.email || 'Unknown User',
      };
      await api.patch(`accounts/companies/${company.value.id}/`, payload);
      await fetchCompanies();
      declineCompanyDialog.value = false;
      company.value = {};
      declineRemarks.value = '';
      toast.add({ severity: 'success', summary: 'Successful', detail: 'Company Approval Declined', life: 3000 });
    } catch (error) {
      console.error('Failed to decline company approval:', error);
      toast.add({ severity: 'error', summary: 'Error', detail: 'Failed to decline company approval', life: 3000 });
    }
  };
  
  const exportCSV = () => {
    dt.value.exportCSV();
  };
  
  const confirmDeleteSelected = () => {
    deleteCompaniesDialog.value = true;
  };
  
  const deleteSelectedCompanies = async () => {
    try {
      await Promise.all(
        selectedCompanies.value.map(comp => api.delete(`accounts/companies/${comp.id}/`))
      );
      companies.value = companies.value.filter(val => !selectedCompanies.value.includes(val));
      deleteCompaniesDialog.value = false;
      selectedCompanies.value = null;
      toast.add({ severity: 'success', summary: 'Successful', detail: 'Companies Deleted', life: 3000 });
    } catch (error) {
      console.error('Failed to delete companies:', error);
      toast.add({ severity: 'error', summary: 'Error', detail: 'Failed to delete companies', life: 3000 });
    }
  };
  
  const getStatusLabel = (status) => {
    switch (status) {
      case 'active':
        return 'success';
      case 'pending':
        return 'warning';
      case 'inactive':
        return 'secondary';
      case 'suspended':
        return 'danger';
      default:
        return null;
    }
  };
  </script>
  
  <style scoped>
  /* Ensure spacing between buttons in the actions column */
  .mr-2 {
    margin-right: 0.5rem;
  }
  </style>