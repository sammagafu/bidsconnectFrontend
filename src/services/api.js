/**
 * Central API: re-exports configured axios instance and helpers.
 * All requests use base URL, credentials, and 401 refresh from authService.
 */
import { api } from '@/services/authService';

export { api };

/**
 * Parse API error for user display.
 * 400: { "field_name": ["error"] } or { "detail": "message" }
 * 401/403/404/500: check detail or message.
 */
export function parseApiError(err) {
  const data = err?.response?.data;
  const status = err?.response?.status;
  if (data && typeof data === 'object') {
    if (data.detail) {
      return typeof data.detail === 'string' ? data.detail : JSON.stringify(data.detail);
    }
    const firstKey = Object.keys(data)[0];
    if (firstKey && Array.isArray(data[firstKey])) {
      return data[firstKey][0];
    }
    if (firstKey && data[firstKey]) {
      return typeof data[firstKey] === 'string' ? data[firstKey] : JSON.stringify(data[firstKey]);
    }
  }
  if (status === 401) return 'Session expired. Please sign in again.';
  if (status === 403) return 'You do not have permission for this action.';
  if (status === 404) return 'Resource not found.';
  if (status >= 500) return 'Server error. Please try again later.';
  return err?.message || 'Request failed.';
}
