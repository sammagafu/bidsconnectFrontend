/**
 * Tender notifications API.
 * GET /tenders/tender-notifications/ — list
 * PATCH /tenders/tender-notifications/{id}/ — mark as read
 * Use for marking tender notifications; unified GET /notifications/ returns both tender + marketplace.
 */
import { api } from '@/services/authService';

export const tenderNotificationsService = {
  list(params = {}) {
    return api.get('tenders/tender-notifications/', { params }).then(r => r.data);
  },

  markAsRead(id) {
    return api.patch(`tenders/tender-notifications/${id}/`, { is_read: true }).then(r => r.data);
  },
};
