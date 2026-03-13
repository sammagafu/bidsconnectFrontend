/**
 * Notifications API — aligned with backend doc.
 * GET /notifications/ — unified in-app notifications (tender + marketplace)
 * PATCH /notifications/{id}/ — mark marketplace notification as read
 * PATCH /tenders/tender-notifications/{id}/ — mark tender notification as read
 */
import { api } from '@/services/authService';
import { tenderNotificationsService } from '@/services/tenderNotificationsService';

export const notificationsService = {
  /**
   * GET /notifications/
   * Query: ?type=, ?is_read=, ?page=, ?page_size=
   */
  list(params = {}) {
    return api.get('notifications/', { params }).then(r => r.data);
  },

  /**
   * Mark notification as read.
   * @param {string} id - Notification id
   * @param {string} [notificationType] - 'tender' | 'marketplace' | undefined. If 'tender', uses tender-notifications endpoint.
   */
  markAsRead(id, notificationType) {
    if (notificationType === 'tender') {
      return tenderNotificationsService.markAsRead(id);
    }
    return api.patch(`notifications/${id}/`, { is_read: true }).then(r => r.data);
  },

  /** Mark all as read (client-side: call markAsRead for each). Pass items with id and optional notification_type. */
  async markAllAsRead(items) {
    const list = Array.isArray(items) ? items : items.map((id) => ({ id }));
    await Promise.all(
      list.map((item) =>
        typeof item === 'object' ? this.markAsRead(item.id, item.notification_type) : this.markAsRead(item)
      )
    );
  },
};
