/**
 * Analytics API — aligned with backend doc.
 * GET /analytics/ — comprehensive dashboard stats
 * Query: ?scope=platform|company, ?company_id= (required if scope=company), ?period=30d
 */
import { api } from '@/services/authService';

export const analyticsService = {
  /**
   * GET /analytics/
   * scope: 'platform' | 'company'
   * company_id: required when scope=company
   * period: e.g. '30d'
   */
  getDashboard(params = {}) {
    return api.get('analytics/', { params }).then(r => r.data);
  },
};
