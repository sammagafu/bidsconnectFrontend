/**
 * Payments API — aligned with backend doc.
 * GET/POST /payments/
 * GET/PUT/PATCH/DELETE /payments/{id}/
 */
import { api } from '@/services/authService';

export const paymentsService = {
  /** GET /payments/ */
  list(params = {}) {
    return api.get('payments/', { params }).then(r => r.data);
  },

  /** GET /payments/{id}/ */
  get(id) {
    return api.get(`payments/${id}/`).then(r => r.data);
  },

  /** POST /payments/ */
  create(payload) {
    return api.post('payments/', payload).then(r => r.data);
  },

  /** PATCH /payments/{id}/ */
  update(id, payload) {
    return api.patch(`payments/${id}/`, payload).then(r => r.data);
  },

  /** DELETE /payments/{id}/ */
  delete(id) {
    return api.delete(`payments/${id}/`).then(r => r.data);
  },
};
