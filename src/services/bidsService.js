/**
 * Bids API — aligned with backend doc.
 * Create: POST /api/v1/bids/
 * Submit: POST /api/v1/bids/{bid_id}/submit/
 */
import { api } from '@/services/authService';

export const bidsService = {
  /** GET /bids/?tender={tenderId}&status=...&company_id=... */
  list(params = {}) {
    return api.get('bids/', { params }).then(r => r.data);
  },

  /** GET /bids/by-company/?company_id={uuid}&status=... */
  listByCompany(companyId, status = null) {
    const params = { company_id: companyId };
    if (status) params.status = status;
    return api.get('bids/by-company/', { params }).then(r => r.data);
  },

  /** GET /bids/{id}/ */
  get(bidId) {
    return api.get(`bids/${bidId}/`).then(r => r.data);
  },

  /**
   * POST /bids/
   * Body: tender_id, company_id (uuid), total_price, currency, proposed_completion_days,
   * validity_complied, completion_complied, jv_partner, jv_percentage,
   * bids_documents[], bids_financial_responses[], bids_turnover_responses[], bids_experience_responses[],
   * bids_personnel_responses[], bids_office_responses[], bids_source_responses[],
   * bids_litigation_responses[], bids_schedule_responses[], bids_technical_responses[]
   */
  create(payload) {
    return api.post('bids/', payload).then(r => r.data);
  },

  /** PATCH /bids/{id}/ */
  update(bidId, payload) {
    return api.patch(`bids/${bidId}/`, payload).then(r => r.data);
  },

  /**
   * POST /bids/{bid_id}/submit/
   * Body: empty {} or no body. Backend validates and sets status to submitted.
   */
  submit(bidId) {
    return api.post(`bids/${bidId}/submit/`, {}).then(r => r.data);
  },

  /** GET /bids/{id}/validate-submit/ */
  validateSubmit(bidId) {
    return api.get(`bids/${bidId}/validate-submit/`).then(r => r.data);
  },

  /** GET /bids/{id}/documents/ */
  getDocuments(bidId) {
    return api.get(`bids/${bidId}/documents/`).then(r => r.data);
  },

  /** POST /bids/{bidId}/documents/ — multipart/form-data */
  addDocument(bidId, formData) {
    return api.post(`bids/${bidId}/documents/`, formData).then(r => r.data);
  },

  /** PATCH /bids/{bidId}/documents/{docId}/ — multipart if file */
  updateDocument(bidId, docId, formData) {
    return api.patch(`bids/${bidId}/documents/${docId}/`, formData).then(r => r.data);
  },

  /** DELETE /bids/{bidId}/documents/{docId}/ */
  deleteDocument(bidId, docId) {
    return api.delete(`bids/${bidId}/documents/${docId}/`).then(r => r.data);
  },

  /** GET /bids/{id}/financial-responses/ */
  getFinancialResponses(bidId) {
    return api.get(`bids/${bidId}/financial-responses/`).then(r => r.data);
  },

  /** GET /bids/{id}/turnover-responses/ */
  getTurnoverResponses(bidId) {
    return api.get(`bids/${bidId}/turnover-responses/`).then(r => r.data);
  },

  /** GET /bids/{id}/experience-responses/ */
  getExperienceResponses(bidId) {
    return api.get(`bids/${bidId}/experience-responses/`).then(r => r.data);
  },

  /** GET /bids/{id}/personnel-responses/ */
  getPersonnelResponses(bidId) {
    return api.get(`bids/${bidId}/personnel-responses/`).then(r => r.data);
  },

  /** GET /bids/{id}/litigation-responses/ */
  getLitigationResponses(bidId) {
    return api.get(`bids/${bidId}/litigation-responses/`).then(r => r.data);
  },

  /** GET /bids/{id}/source-responses/ */
  getSourceResponses(bidId) {
    return api.get(`bids/${bidId}/source-responses/`).then(r => r.data);
  },

  /** GET /bids/{id}/opening-report/ — blob */
  getOpeningReport(bidId) {
    return api.get(`bids/${bidId}/opening-report/`, { responseType: 'blob' }).then(r => r.data);
  },

  /** PATCH /bids/{id}/reject/ — body: { status: 'rejected' } */
  reject(bidId, payload = { status: 'rejected' }) {
    return api.patch(`bids/${bidId}/reject/`, payload).then(r => r.data);
  },

  /** GET /bids/{id}/audit-logs/ */
  getAuditLogs(bidId) {
    return api.get(`bids/${bidId}/audit-logs/`).then(r => r.data);
  },
};
