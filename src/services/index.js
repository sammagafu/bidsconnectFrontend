/**
 * API services — single entry point.
 * All endpoints aligned with backend API doc (base URL, CORS, auth, payloads).
 */
export { api, parseApiError } from '@/services/api';
export { default as authService } from '@/services/authService';
export { companiesService } from '@/services/companiesService';
export { tendersService } from '@/services/tendersService';
export { bidsService } from '@/services/bidsService';
export { notificationsService } from '@/services/notificationsService';
export { tenderNotificationsService } from '@/services/tenderNotificationsService';
export { tasksService } from '@/services/tasksService';
export { tenderConversationsService } from '@/services/tenderConversationsService';
export { paymentsService } from '@/services/paymentsService';
export { analyticsService } from '@/services/analyticsService';
