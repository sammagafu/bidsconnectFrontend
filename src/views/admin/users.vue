<template>
  <VerticalLayout>
    <div class="card">
    <DataTable
      v-model:filters="filters"
      :value="users"
      paginator
      :rows="10"
      dataKey="id"
      filterDisplay="row"
      :loading="loading"
      :globalFilterFields="['name', 'email', 'role', 'status']"
    >
      <template #header>
        <div class="flex justify-end">
          <IconField>
            <InputIcon>
              <i class="pi pi-search" />
            </InputIcon>
            <InputText v-model="filters['global'].value" placeholder="Keyword Search" />
          </IconField>
        </div>
      </template>
      <template #empty> No users found. </template>
      <template #loading> Loading users data. Please wait. </template>
      <Column field="name" header="Name" style="min-width: 12rem">
        <template #body="{ data }">
          {{ data.name }}
        </template>
        <template #filter="{ filterModel, filterCallback }">
          <InputText v-model="filterModel.value" type="text" @input="filterCallback()" placeholder="Search by name" />
        </template>
      </Column>
      <Column header="Email" filterField="email" style="min-width: 12rem">
        <template #body="{ data }">
          <div class="flex items-center gap-2">
            <span>{{ data.email }}</span>
          </div>
        </template>
        <template #filter="{ filterModel, filterCallback }">
          <InputText v-model="filterModel.value" type="text" @input="filterCallback()" placeholder="Search by email" />
        </template>
      </Column>
      <Column header="Role" filterField="role" :showFilterMenu="false" style="min-width: 14rem">
        <template #body="{ data }">
          <div class="flex items-center gap-2">
            <span>{{ data.role }}</span>
          </div>
        </template>
        <template #filter="{ filterModel, filterCallback }">
          <MultiSelect
            v-model="filterModel.value"
            @change="filterCallback()"
            :options="roles"
            optionLabel="name"
            placeholder="Any"
            style="min-width: 14rem"
            :maxSelectedLabels="1"
          >
            <template #option="slotProps">
              <div class="flex items-center gap-2">
                <span>{{ slotProps.option.name }}</span>
              </div>
            </template>
          </MultiSelect>
        </template>
      </Column>
      <Column field="status" header="Status" :showFilterMenu="false" style="min-width: 12rem">
        <template #body="{ data }">
          <Tag :value="data.status" :severity="getSeverity(data.status)" />
        </template>
        <template #filter="{ filterModel, filterCallback }">
          <Select
            v-model="filterModel.value"
            @change="filterCallback()"
            :options="statuses"
            placeholder="Select One"
            style="min-width: 12rem"
            :showClear="true"
          >
            <template #option="slotProps">
              <Tag :value="slotProps.option" :severity="getSeverity(slotProps.option)" />
            </template>
          </Select>
        </template>
      </Column>
      <Column field="verified" header="Active" dataType="boolean" style="min-width: 6rem">
        <template #body="{ data }">
          <i class="pi" :class="{ 'pi-check-circle text-green-500': data.verified, 'pi-times-circle text-red-400': !data.verified }"></i>
        </template>
        <template #filter="{ filterModel, filterCallback }">
          <Checkbox v-model="filterModel.value" :indeterminate="filterModel.value === null" binary @change="filterCallback()" />
        </template>
      </Column>
    </DataTable>
  </div>
  </VerticalLayout>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import VerticalLayout from '@/layouts/VerticalLayout.vue';
import { FilterMatchMode } from '@primevue/core/api';
import { api } from '@/services/authService'; // Use named export from authService

const users = ref([]);
const filters = ref({
  global: { value: null, matchMode: FilterMatchMode.CONTAINS },
  name: { value: null, matchMode: FilterMatchMode.STARTS_WITH },
  email: { value: null, matchMode: FilterMatchMode.STARTS_WITH },
  role: { value: null, matchMode: FilterMatchMode.IN },
  status: { value: null, matchMode: FilterMatchMode.EQUALS },
  verified: { value: null, matchMode: FilterMatchMode.EQUALS }
});
const roles = ref([
  { name: 'Admin' },
  { name: 'Staff' },
  { name: 'Normal User' }
]);
const statuses = ref(['Active', 'Inactive']);
const loading = ref(true);

onMounted(async () => {
  console.log('onMounted triggered');
  await fetchUsers();
});

const fetchUsers = async () => {
  try {
    loading.value = true;
    console.log('Fetching users with Authorization header:', api.defaults.headers.common['Authorization']);
    const response = await api.get('accounts/users/');
    console.log('Fetched users:', response.data);
    users.value = transformUserData(response.data);
  } catch (error) {
    console.error('Failed to fetch users:', error);
    if (error.response) {
      console.error('Error response:', error.response.data);
      console.error('Error status:', error.response.status);
    }
  } finally {
    loading.value = false;
  }
};

const transformUserData = (data) => {
  return data.map(user => ({
    id: user.id,
    name: `${user.first_name || ''} ${user.last_name || ''}`.trim() || 'Unnamed User',
    email: user.email, // Replaces country
    role: { name: user.is_superuser ? 'Admin' : user.is_staff ? 'Staff' : 'Normal User' }, // Replaces representative
    status: user.is_active ? 'Active' : 'Inactive',
    verified: user.is_active
  }));
};

const getSeverity = (status) => {
  switch (status) {
    case 'Active':
      return 'success';
    case 'Inactive':
      return 'danger';
    default:
      return null;
  }
};
</script>