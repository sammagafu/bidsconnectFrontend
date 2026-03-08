/**
 * Tenders API — aligned with backend doc.
 * List: GET /api/v1/tenders/tenders/?status=published&category=construction
 * Create: POST /api/v1/tenders/tenders/
 */
import { api } from '@/services/authService';

export const tendersService = {
  /**
   * GET /tenders/tenders/
   * Query params (optional): status, category (slug), subcategory (slug)
   */
  list(params = {}) {
    return api.get('tenders/tenders/', { params }).then(r => r.data);
  },

  /** GET /tenders/tenders/{slug}/ */
  get(slug) {
    return api.get(`tenders/tenders/${slug}/`).then(r => r.data);
  },

  /** GET /tenders/tenders/{slug}/required-documents/ */
  getRequiredDocuments(slug) {
    return api.get(`tenders/tenders/${slug}/required-documents/`).then(r => r.data);
  },

  /** GET /tenders/tenders/{slug}/financial-requirements/ */
  getFinancialRequirements(slug) {
    return api.get(`tenders/tenders/${slug}/financial-requirements/`).then(r => r.data);
  },

  /** GET /tenders/tenders/{slug}/turnover-requirements/ */
  getTurnoverRequirements(slug) {
    return api.get(`tenders/tenders/${slug}/turnover-requirements/`).then(r => r.data);
  },

  /** GET /tenders/tenders/{slug}/experience-requirements/ */
  getExperienceRequirements(slug) {
    return api.get(`tenders/tenders/${slug}/experience-requirements/`).then(r => r.data);
  },

  /** GET /tenders/tenders/{slug}/personnel-requirements/ */
  getPersonnelRequirements(slug) {
    return api.get(`tenders/tenders/${slug}/personnel-requirements/`).then(r => r.data);
  },

  /**
   * POST /tenders/tenders/
   * Body: title, reference_number, description, category_id, subcategory_id, procurement_process_id,
   * agency_id, tender_type_country, tender_type_sector, currency, tender_fees, source_of_funds,
   * publication_date, submission_deadline, validity_period_days, completion_period_days,
   * allow_alternative_delivery, litigation_history_start/end, tender_document, tender_securing_type,
   * tender_security_percentage or tender_security_amount, tender_security_currency,
   * required_documents[], financial_requirements[], turnover_requirements[], experience_requirements[],
   * personnel_requirements[], schedule_items[], technical_specifications[]
   */
  create(payload) {
    return api.post('tenders/tenders/', payload).then(r => r.data);
  },

  /** PATCH /tenders/tenders/{slug}/ */
  update(slug, payload) {
    if (payload instanceof FormData) {
      return api.patch(`tenders/tenders/${slug}/`, payload).then(r => r.data);
    }
    return api.patch(`tenders/tenders/${slug}/`, payload).then(r => r.data);
  },

  /** PATCH /tenders/tenders/{slug}/status/ */
  updateStatus(slug, status) {
    return api.patch(`tenders/tenders/${slug}/status/`, { status }).then(r => r.data);
  },

  /** DELETE /tenders/tenders/{slug}/ */
  delete(slug) {
    return api.delete(`tenders/tenders/${slug}/`).then(r => r.data);
  },

  /** GET /tenders/categories/ */
  getCategories() {
    return api.get('tenders/categories/').then(r => r.data);
  },

  /** GET /tenders/categories-with-subcategories/ */
  getCategoriesWithSubcategories() {
    return api.get('tenders/categories-with-subcategories/').then(r => r.data);
  },

  /** GET /tenders/procurement-processes/ */
  getProcurementProcesses() {
    return api.get('tenders/procurement-processes/').then(r => r.data);
  },

  /** GET /tenders/agencies/?search=... */
  searchAgencies(search) {
    return api.get('tenders/agencies/', { params: { search } }).then(r => r.data);
  },

  /** POST /tenders/agencies/ */
  createAgency(payload) {
    return api.post('tenders/agencies/', payload).then(r => r.data);
  },

  /** PATCH /tenders/tenders/{slug}/award/ — body: { awarded_bid: bidId } */
  award(slug, awardedBidId) {
    return api.patch(`tenders/tenders/${slug}/award/`, { awarded_bid: awardedBidId }).then(r => r.data);
  },

  /** POST /tenders/tenders/{slug}/publish/ */
  publish(slug) {
    return api.post(`tenders/tenders/${slug}/publish/`).then(r => r.data);
  },

  /** GET /tenders/tender-status-history/ — query: ?tender=<slug> */
  getStatusHistory(params = {}) {
    return api.get('tenders/tender-status-history/', { params }).then(r => r.data);
  },

  /** GET /tenders/pricing/ — platform pricing (tender document fee, tender summary) */
  getPricing() {
    return api.get('tenders/pricing/').then(r => r.data);
  },

  /** GET /tenders/pricing/{fee_type}/ — e.g. tender_document, tender_summary_one_time */
  getPricingByType(feeType) {
    return api.get(`tenders/pricing/${feeType}/`).then(r => r.data);
  },
};
