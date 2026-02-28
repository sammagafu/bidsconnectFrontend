/**
 * Webhooks / no-auth endpoints (per API doc).
 * Document expiry: POST /api/v1/accounts/webhooks/documents/expiry/
 * Body: { document_id?: "uuid", event?: "check_expiry" }
 */
import { api } from '@/services/authService';

export const webhooksService = {
  /**
   * POST /accounts/webhooks/documents/expiry/
   * No auth required. Body: document_id (optional), event (optional "check_expiry").
   * Response: { detail, processed_count, processed_ids }
   */
  documentExpiry(payload = {}) {
    return api.post('accounts/webhooks/documents/expiry/', payload).then(r => r.data);
  },
};
