/**
 * Company tasks API — aligned with backend doc.
 * GET/POST /accounts/companies/{company_pk}/tasks/
 * Filter: ?status=, ?assignee=, ?tender=, ?bid=
 */
import { api } from '@/services/authService';

export const tasksService = {
  /**
   * GET /accounts/companies/{company_pk}/tasks/
   * Filter: status (todo|in_progress|done|cancelled), assignee, tender, bid
   */
  list(companyPk, params = {}) {
    return api.get(`accounts/companies/${companyPk}/tasks/`, { params }).then(r => r.data);
  },

  /**
   * GET /accounts/companies/{company_pk}/tasks/{id}/
   */
  get(companyPk, taskId) {
    return api.get(`accounts/companies/${companyPk}/tasks/${taskId}/`).then(r => r.data);
  },

  /**
   * POST /accounts/companies/{company_pk}/tasks/
   * Body: title, description?, assignee?, tender?, bid?, due_date?, status?
   */
  create(companyPk, payload) {
    return api.post(`accounts/companies/${companyPk}/tasks/`, payload).then(r => r.data);
  },

  /**
   * PATCH /accounts/companies/{company_pk}/tasks/{id}/
   * Owner/admin: any field. Assignee: only status, due_date.
   */
  update(companyPk, taskId, payload) {
    return api.patch(`accounts/companies/${companyPk}/tasks/${taskId}/`, payload).then(r => r.data);
  },

  /**
   * DELETE /accounts/companies/{company_pk}/tasks/{id}/
   */
  delete(companyPk, taskId) {
    return api.delete(`accounts/companies/${companyPk}/tasks/${taskId}/`).then(r => r.data);
  },
};
