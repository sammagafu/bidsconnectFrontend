/**
 * Notifications API — aligned with backend doc.
 * GET /notifications/ — unified in-app notifications (tender + marketplace)
 * PATCH /notifications/{id}/ — mark as read
 */
import { api } from '@/services/authService';

export const notificationsService = {
  /**
   * GET /notifications/
   * Query: ?type=, ?is_read=, ?page=, ?page_size=
   */
  list(params = {}) {
    return api.get('notifications/', { params }).then(r => r.data);
  },

  /**
   * PATCH /notifications/{id}/
   * Body: { is_read: true }
   */
  markAsRead(id) {
    return api.patch(`notifications/${id}/`, { is_read: true }).then(r => r.data);
  },

  /** Mark all as read (client-side: call markAsRead for each) */
  async markAllAsRead(ids) {
    await Promise.all(ids.map(id => this.markAsRead(id)));
  },
};
