<template>
  <VerticalLayout>
    <b-container>
      <b-row>
        <b-col cols="12">
          <h1 class="mb-4">Company Tasks</h1>

          <div v-if="!companyId" class="alert alert-info">
            Create or join a company to manage tasks.
          </div>

          <template v-else>
            <!-- Filters -->
            <b-card class="mb-4">
              <b-row class="g-2 align-items-end">
                <b-col md="3">
                  <b-form-group label="Status">
                    <b-form-select v-model="filters.status" :options="statusOptions" @change="fetchTasks" />
                  </b-form-group>
                </b-col>
                <b-col md="3">
                  <b-form-group label="Assignee">
                    <b-form-select v-model="filters.assignee" :options="assigneeOptions" @change="fetchTasks" />
                  </b-form-group>
                </b-col>
                <b-col md="2">
                  <b-button variant="primary" @click="openCreateModal">
                    <i class="bx bx-plus"></i> New Task
                  </b-button>
                </b-col>
              </b-row>
            </b-card>

            <!-- Task list -->
            <b-card>
              <b-overlay :show="loading" rounded="sm">
                <b-list-group flush>
                  <b-list-group-item
                    v-for="task in tasks"
                    :key="task.id"
                    class="d-flex justify-content-between align-items-start"
                  >
                    <div class="flex-grow-1">
                      <div class="d-flex align-items-center gap-2 mb-1">
                        <b-badge :variant="statusVariant(task.status)">{{ task.status }}</b-badge>
                        <strong>{{ task.title }}</strong>
                      </div>
                      <p v-if="task.description" class="mb-1 text-muted small">{{ task.description }}</p>
                      <small class="text-muted">
                        Assignee: {{ task.assignee?.email || 'Unassigned' }}
                        <span v-if="task.due_date"> · Due: {{ formatDate(task.due_date) }}</span>
                        <span v-if="task.tender"> · Tender: {{ task.tender }}</span>
                      </small>
                    </div>
                    <div class="d-flex gap-1">
                      <b-button size="sm" variant="outline-primary" @click="openEditModal(task)">
                        <i class="bx bx-pencil"></i>
                      </b-button>
                      <b-button size="sm" variant="outline-danger" @click="confirmDelete(task)">
                        <i class="bx bx-trash"></i>
                      </b-button>
                    </div>
                  </b-list-group-item>
                  <b-list-group-item v-if="!tasks.length && !loading" class="text-center text-muted">
                    No tasks. Create one to get started.
                  </b-list-group-item>
                </b-list-group>
              </b-overlay>
            </b-card>
          </template>
        </b-col>
      </b-row>

      <!-- Create/Edit Modal -->
      <b-modal v-model="showModal" :title="editing ? 'Edit Task' : 'New Task'" @hide="resetForm" hide-footer>
        <b-form @submit.prevent="submitTask">
          <b-form-group label="Title" label-for="task-title">
            <b-form-input id="task-title" v-model="form.title" required placeholder="Task title" />
          </b-form-group>
          <b-form-group label="Description" label-for="task-desc">
            <b-form-textarea id="task-desc" v-model="form.description" rows="3" placeholder="Optional description" />
          </b-form-group>
          <b-form-group label="Assignee" label-for="task-assignee">
            <b-form-select id="task-assignee" v-model="form.assignee" :options="assigneeOptions" />
          </b-form-group>
          <b-form-group label="Due Date" label-for="task-due">
            <b-form-input id="task-due" v-model="form.due_date" type="date" />
          </b-form-group>
          <b-form-group v-if="editing" label="Status" label-for="task-status">
            <b-form-select id="task-status" v-model="form.status" :options="statusOptions" />
          </b-form-group>
          <div class="d-flex justify-content-end gap-2 mt-3">
            <b-button variant="secondary" @click="showModal = false">Cancel</b-button>
            <b-button variant="primary" type="submit" :disabled="saving">
              {{ saving ? 'Saving...' : (editing ? 'Update' : 'Create') }}
            </b-button>
          </div>
        </b-form>
      </b-modal>
    </b-container>
  </VerticalLayout>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import VerticalLayout from '@/layouts/VerticalLayout.vue';
import { tasksService, companiesService, parseApiError } from '@/services';
import { useAuthStore } from '@/stores/auth';
import { useToast } from 'primevue/usetoast';

const toast = useToast();
const authStore = useAuthStore();

const companyId = computed(() => authStore.user?.companies?.[0]?.id || null);

const tasks = ref([]);
const loading = ref(false);
const saving = ref(false);
const showModal = ref(false);
const editing = ref(false);

const filters = ref({ status: '', assignee: '' });

const form = ref({
  title: '',
  description: '',
  assignee: null,
  due_date: '',
  status: 'todo',
});

const statusOptions = [
  { value: '', text: 'All' },
  { value: 'todo', text: 'To Do' },
  { value: 'in_progress', text: 'In Progress' },
  { value: 'done', text: 'Done' },
  { value: 'cancelled', text: 'Cancelled' },
];

const companyMembers = ref([]);
const assigneeOptions = computed(() => {
  const opts = [{ value: null, text: 'Unassigned' }];
  (companyMembers.value || []).forEach(m => {
    const u = m.user;
    if (u) opts.push({ value: u.id, text: u.email || `${u.first_name || ''} ${u.last_name || ''}`.trim() || 'User' });
  });
  return opts;
});

function statusVariant(s) {
  const v = { todo: 'secondary', in_progress: 'info', done: 'success', cancelled: 'danger' };
  return v[s] || 'secondary';
}

function formatDate(d) {
  return d ? new Date(d).toLocaleDateString() : '—';
}

async function fetchCompanyUsers() {
  if (!companyId.value) return;
  try {
    const company = await companiesService.get(companyId.value);
    companyMembers.value = company.company_users || [];
  } catch {
    companyMembers.value = [];
  }
}

async function fetchTasks() {
  if (!companyId.value) return;
  loading.value = true;
  try {
    const params = {};
    if (filters.value.status) params.status = filters.value.status;
    if (filters.value.assignee) params.assignee = filters.value.assignee;
    const data = await tasksService.list(companyId.value, params);
    tasks.value = Array.isArray(data) ? data : (data.results || []);
  } catch (e) {
    toast.add({ severity: 'error', summary: 'Error', detail: parseApiError(e) || 'Could not load tasks.' });
    tasks.value = [];
  } finally {
    loading.value = false;
  }
}

function openCreateModal() {
  editing.value = false;
  form.value = { title: '', description: '', assignee: null, due_date: '', status: 'todo' };
  showModal.value = true;
}

function openEditModal(task) {
  editing.value = true;
  form.value = {
    id: task.id,
    title: task.title,
    description: task.description || '',
    assignee: task.assignee?.id || null,
    due_date: task.due_date ? task.due_date.slice(0, 10) : '',
    status: task.status || 'todo',
  };
  showModal.value = true;
}

function resetForm() {
  showModal.value = false;
  editing.value = false;
}

async function submitTask() {
  if (!companyId.value) return;
  saving.value = true;
  try {
    const payload = {
      title: form.value.title,
      description: form.value.description || undefined,
      assignee: form.value.assignee || undefined,
      due_date: form.value.due_date || undefined,
      status: form.value.status,
    };
    if (editing.value) {
      await tasksService.update(companyId.value, form.value.id, payload);
      toast.add({ severity: 'success', summary: 'Updated', detail: 'Task updated.' });
    } else {
      await tasksService.create(companyId.value, payload);
      toast.add({ severity: 'success', summary: 'Created', detail: 'Task created.' });
    }
    showModal.value = false;
    fetchTasks();
  } catch (e) {
    toast.add({ severity: 'error', summary: 'Error', detail: parseApiError(e) || 'Operation failed.' });
  } finally {
    saving.value = false;
  }
}

async function confirmDelete(task) {
  if (!confirm(`Delete task "${task.title}"?`)) return;
  try {
    await tasksService.delete(companyId.value, task.id);
    toast.add({ severity: 'success', summary: 'Deleted', detail: 'Task removed.' });
    fetchTasks();
  } catch (e) {
    toast.add({ severity: 'error', summary: 'Error', detail: parseApiError(e) || 'Delete failed.' });
  }
}

onMounted(() => {
  fetchCompanyUsers();
  fetchTasks();
});
</script>
