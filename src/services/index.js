/**
 * API services — single entry point.
 * All endpoints aligned with backend API doc (base URL, CORS, auth, payloads).
 */
export { api, parseApiError } from '@/services/api';
export { default as authService } from '@/services/authService';
export { companiesService } from '@/services/companiesService';
export { tendersService } from '@/services/tendersService';
export { bidsService } from '@/services/bidsService';
export { webhooksService } from '@/services/webhooksService';
