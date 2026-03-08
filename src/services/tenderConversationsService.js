/**
 * Tender conversations API — team chat per company per tender.
 * GET/POST /tenders/conversations/
 * GET/POST /tenders/conversations/{id}/messages/
 */
import { api } from '@/services/authService';

export const tenderConversationsService = {
  /**
   * GET /tenders/conversations/?tender=<slug>
   */
  list(tenderSlug) {
    return api.get('tenders/conversations/', { params: { tender: tenderSlug } }).then(r => r.data);
  },

  /**
   * POST /tenders/conversations/
   * Body: { tender_slug: "<slug>" } — get or create conversation
   */
  getOrCreate(tenderSlug) {
    return api.post('tenders/conversations/', { tender_slug: tenderSlug }).then(r => r.data);
  },

  /**
   * GET /tenders/conversations/{id}/
   */
  get(conversationId) {
    return api.get(`tenders/conversations/${conversationId}/`).then(r => r.data);
  },

  /**
   * GET /tenders/conversations/{id}/messages/
   */
  listMessages(conversationId) {
    return api.get(`tenders/conversations/${conversationId}/messages/`).then(r => r.data);
  },

  /**
   * POST /tenders/conversations/{id}/messages/
   * Body: { content: "..." }
   */
  postMessage(conversationId, content) {
    return api.post(`tenders/conversations/${conversationId}/messages/`, { content }).then(r => r.data);
  },
};
