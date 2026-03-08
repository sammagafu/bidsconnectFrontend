/**
 * Companies API — aligned with backend doc.
 * Base: POST/GET /api/v1/accounts/companies/
 * Documents: POST /api/v1/accounts/companies/{company_pk}/documents/ (multipart)
 * Invitations: POST /api/v1/accounts/companies/{company_pk}/invitations/
 */
import { api } from '@/services/authService';

export const companiesService = {
  /** GET /accounts/companies/ */
  list() {
    return api.get('accounts/companies/').then(r => r.data);
  },

  /** GET /accounts/companies/{id}/ */
  get(companyId) {
    return api.get(`accounts/companies/${companyId}/`).then(r => r.data);
  },

  /**
   * POST /accounts/companies/
   * Body (JSON): name (required), description, industry, website, tax_id, registration_number,
   * founded_date, country, key_activities, naics_code, employee_count, parent_company.
   * For logo: use multipart/form-data on same URL.
   */
  create(payload) {
    if (payload instanceof FormData) {
      return api.post('accounts/companies/', payload).then(r => r.data);
    }
    return api.post('accounts/companies/', payload).then(r => r.data);
  },

  /** PATCH /accounts/companies/{id}/ */
  update(companyId, payload) {
    if (payload instanceof FormData) {
      return api.patch(`accounts/companies/${companyId}/`, payload).then(r => r.data);
    }
    return api.patch(`accounts/companies/${companyId}/`, payload).then(r => r.data);
  },

  /** PUT /accounts/companies/{id}/ */
  put(companyId, payload) {
    return api.put(`accounts/companies/${companyId}/`, payload).then(r => r.data);
  },

  /** DELETE /accounts/companies/{id}/ */
  delete(companyId) {
    return api.delete(`accounts/companies/${companyId}/`).then(r => r.data);
  },

  /**
   * POST /accounts/companies/{company_pk}/documents/
   * Content-Type: multipart/form-data
   * Fields: name (required), document_type (required), category (optional), file (required), expiry_date (optional), is_verified (optional).
   * document_type: Business License | BRELA | TIN | Tax Clearance | Bank Statement
   */
  createDocument(companyPk, formData) {
    return api.post(`accounts/companies/${companyPk}/documents/`, formData).then(r => r.data);
  },

  /** GET /accounts/companies/{company_pk}/documents/ */
  listDocuments(companyPk) {
    return api.get(`accounts/companies/${companyPk}/documents/`).then(r => r.data);
  },

  /** PATCH /accounts/companies/{company_pk}/documents/{id}/ — multipart if file */
  updateDocument(companyPk, documentId, formData) {
    return api.patch(`accounts/companies/${companyPk}/documents/${documentId}/`, formData).then(r => r.data);
  },

  /** DELETE /accounts/companies/{company_pk}/documents/{id}/ */
  deleteDocument(companyPk, documentId) {
    return api.delete(`accounts/companies/${companyPk}/documents/${documentId}/`).then(r => r.data);
  },

  /**
   * POST /accounts/companies/{company_pk}/invitations/
   * Body: { invited_email, role } — role: owner | admin | manager | user
   */
  sendInvitation(companyPk, payload) {
    return api.post(`accounts/companies/${companyPk}/invitations/`, payload).then(r => r.data);
  },

  /** GET /accounts/companies/{company_pk}/invitations/ */
  listInvitations(companyPk) {
    return api.get(`accounts/companies/${companyPk}/invitations/`).then(r => r.data);
  },

  /** DELETE /accounts/companies/{company_pk}/invitations/{invitation_id}/ */
  deleteInvitation(companyPk, invitationId) {
    return api.delete(`accounts/companies/${companyPk}/invitations/${invitationId}/`).then(r => r.data);
  },

  /**
   * POST /accounts/invitations/accept/{token}/
   * Auth: required. Logged-in user email must match invitation.
   */
  acceptInvitation(token) {
    return api.post(`accounts/invitations/accept/${token}/`).then(r => r.data);
  },

  /**
   * GET /accounts/companies/{company_pk}/documents/export/
   * Returns CSV blob.
   */
  exportDocuments(companyPk) {
    return api.get(`accounts/companies/${companyPk}/documents/export/`, { responseType: 'blob' }).then(r => r.data);
  },
};
